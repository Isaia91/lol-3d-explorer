import os
import time
import requests
import psycopg2
from psycopg2.extras import execute_batch
from typing import List, Tuple, Dict, Any

# ========= Config =========
api_key = "RGAPI-6accf3b8-1b8d-415f-b84f-dce1974e1d75"
HEADERS = {"X-Riot-Token": api_key}

PLAYERS_PER_REGION = 20
PLATFORMS = ["kr", "euw1", "na1"]
MATCHES_PER_PUUID = 20

# Platform -> Match-v5 cluster
CLUSTER_BY_PLATFORM = {
    "na1": "americas", "br1": "americas", "la1": "americas", "la2": "americas",
    "euw1": "europe",  "eun1": "europe",  "tr1": "europe",  "ru": "europe",
    "kr": "asia",      "jp1": "asia",
    "oc1": "sea", "ph2": "sea", "sg2": "sea", "th2": "sea", "tw2": "sea", "vn2": "sea",
}

# ========= DB helpers =========
def get_conn():
    return psycopg2.connect(
        host="localhost",
        port=5432,
        user="riot",
        password="riot",
        dbname="riot",
    )

# ========= HTTP helper (backoff 429/5xx) =========
def get_with_backoff(url: str, params: Dict[str, Any] | None = None, max_retries: int = 5) -> requests.Response:
    attempt = 0
    while True:
        resp = requests.get(url, headers=HEADERS, params=params, timeout=25)
        if resp.status_code in (429, 500, 502, 503, 504) and attempt < max_retries:
            attempt += 1
            retry_after = resp.headers.get("Retry-After")
            sleep_s = int(retry_after) if (retry_after and retry_after.isdigit()) else min(2 ** attempt, 30)
            time.sleep(sleep_s)
            continue
        return resp

# ========= Riot API calls =========
def get_challenger_puuids_with_platform(platform: str, limit: int = PLAYERS_PER_REGION) -> List[Tuple[str, str]]:
    """
    Retourne au plus 'limit' joueurs Challenger pour une plateforme donnée,
    triés par leaguePoints décroissant (top ladder).
    """
    url = f"https://{platform}.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5"
    r = get_with_backoff(url)
    r.raise_for_status()
    data = r.json()

    entries = data.get("entries", [])
    # Tri décroissant par LP pour avoir le top ladder
    entries.sort(key=lambda e: e.get("leaguePoints", 0), reverse=True)
    # On garde seulement 'limit' entrées
    entries = entries[:limit]

    out: List[Tuple[str, str]] = []
    for e in entries:
        if "puuid" in e and e["puuid"]:
            out.append((e["puuid"], platform))
        elif "summonerId" in e and e["summonerId"]:
            sid = e["summonerId"]
            s_url = f"https://{platform}.api.riotgames.com/lol/summoner/v4/summoners/{sid}"
            s = get_with_backoff(s_url)
            if s.status_code == 200:
                out.append((s.json().get("puuid"), platform))
            else:
                print(f"[{platform}] summoner {sid[:8]}… -> {s.status_code}")
            time.sleep(0.2)  # throttle clé dev
        else:
            print(f"[{platform}] entrée sans puuid/summonerId: {list(e.keys())}")
    # Filtre sécurité (puuid None)
    out = [(p, pf) for (p, pf) in out if p]
    return out

def get_match_ids(puuid: str, cluster: str, start: int = 0, count: int = 20) -> List[str]:
    url = f"https://{cluster}.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids"
    params = {"start": start, "count": count}
    r = get_with_backoff(url, params=params)
    if r.status_code == 200:
        return r.json()
    print(f"[{cluster}] match ids err {r.status_code}: {r.text[:160]}")
    return []

def get_match_detail(match_id: str, cluster: str) -> Dict[str, Any] | None:
    url = f"https://{cluster}.api.riotgames.com/lol/match/v5/matches/{match_id}"
    r = get_with_backoff(url)
    if r.status_code == 200:
        return r.json()
    print(f"[{cluster}] match {match_id} err {r.status_code}: {r.text[:160]}")
    return None

# ========= Upserts =========
UPSERT_PLAYER = """
INSERT INTO public.players (puuid, platform)
VALUES (%s, %s)
ON CONFLICT (puuid) DO NOTHING;
"""

UPSERT_MATCH = """
INSERT INTO public.matches (match_id, cluster, game_creation, game_duration, queue_id, game_version, platform)
VALUES (%s, %s, %s, %s, %s, %s, %s)
ON CONFLICT (match_id) DO NOTHING;
"""

UPSERT_PARTICIPANT = """
INSERT INTO public.participants
(match_id, puuid, summoner_name, team_id, win, champion_name, champion_id, role, lane,
 kills, deaths, assists, total_damage_dealt, gold_earned, cs, time_played)
VALUES
(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
ON CONFLICT (match_id, puuid) DO UPDATE SET
  summoner_name = EXCLUDED.summoner_name,
  team_id = EXCLUDED.team_id,
  win = EXCLUDED.win,
  champion_name = EXCLUDED.champion_name,
  champion_id = EXCLUDED.champion_id,
  role = EXCLUDED.role,
  lane = EXCLUDED.lane,
  kills = EXCLUDED.kills,
  deaths = EXCLUDED.deaths,
  assists = EXCLUDED.assists,
  total_damage_dealt = EXCLUDED.total_damage_dealt,
  gold_earned = EXCLUDED.gold_earned,
  cs = EXCLUDED.cs,
  time_played = EXCLUDED.time_played;
"""

def upsert_player(cur, puuid: str, platform: str):
    cur.execute(UPSERT_PLAYER, (puuid, platform))

def upsert_match(cur, match_id: str, cluster: str, info: Dict[str, Any], platform: str | None):
    cur.execute(
        UPSERT_MATCH,
        (
            match_id,
            cluster,
            info.get("gameCreation"),
            info.get("gameDuration"),
            info.get("queueId"),
            info.get("gameVersion"),
            platform,
        ),
    )

def upsert_participants(cur, match_id: str, info: dict, default_platform: str = "unknown"):
    participants = info.get("participants", [])
    teams = info.get("teams", [])
    team_win = {t.get("teamId"): t.get("win") for t in teams}

    # 1) S'assurer que tous les puuids existent dans players
    puuid_rows = []
    for p in participants:
        pu = p.get("puuid")
        if pu:
            puuid_rows.append((pu, default_platform))
    if puuid_rows:
        execute_batch(cur, UPSERT_PLAYER, puuid_rows, page_size=100)  # crée les joueurs manquants

    # 2) Insérer/mettre à jour les participants
    rows = []
    for p in participants:
        puuid = p.get("puuid")
        champ_name = p.get("championName")
        champ_id = p.get("championId")
        team_id = p.get("teamId")
        win = p.get("win")
        if win is None:
            win = team_win.get(team_id)
        cs = (p.get("totalMinionsKilled") or 0) + (p.get("neutralMinionsKilled") or 0)

        rows.append((
            match_id,
            puuid,
            p.get("summonerName"),
            team_id,
            bool(win),
            champ_name,
            champ_id,
            p.get("role"),
            p.get("lane"),
            p.get("kills"),
            p.get("deaths"),
            p.get("assists"),
            p.get("totalDamageDealtToChampions") or p.get("totalDamageDealt"),
            p.get("goldEarned"),
            cs,
            p.get("timePlayed"),
        ))

    if rows:
        execute_batch(cur, UPSERT_PARTICIPANT, rows, page_size=100)

# ========= Pipeline =========
def ingest_platform(platform: str, matches_per_puuid: int = 20):
    cluster = CLUSTER_BY_PLATFORM[platform]
    conn = get_conn()
    conn.autocommit = False
    try:
        with conn.cursor() as cur:
            puuids = get_challenger_puuids_with_platform(platform)
            print(f"[{platform}] Challenger PUUIDs: {len(puuids)}")

            # Insert players
            for puuid, pf in puuids:
                upsert_player(cur, puuid, pf)
            conn.commit()

            # For each player, get matches
            for idx, (puuid, pf) in enumerate(puuids, start=1):
                match_ids = get_match_ids(puuid, cluster=cluster, start=0, count=matches_per_puuid)
                print(f"[{platform}] {idx}/{len(puuids)} puuid {puuid[:8]}… -> {len(match_ids)} matches")

                for m in match_ids:
                    detail = get_match_detail(m, cluster=cluster)
                    if not detail:
                        continue
                    info = detail.get("info", {})

                    upsert_match(cur, m, cluster, info, platform)
                    upsert_participants(cur, m, info, default_platform=platform)

                    # petit throttle pour clé dev
                    time.sleep(0.15)

                conn.commit()
                time.sleep(0.2)  # throttle entre joueurs
    finally:
        conn.close()

DDL_STATEMENTS = [
    """
    CREATE TABLE IF NOT EXISTS public.players (
      puuid TEXT PRIMARY KEY,
      platform TEXT NOT NULL,
      inserted_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS public.matches (
      match_id TEXT PRIMARY KEY,
      cluster TEXT NOT NULL,
      game_creation BIGINT,
      game_duration INTEGER,
      queue_id INTEGER,
      game_version TEXT,
      platform TEXT,
      inserted_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS public.participants (
      match_id TEXT NOT NULL,
      puuid TEXT NOT NULL,
      summoner_name TEXT,
      team_id INTEGER,
      win BOOLEAN,
      champion_name TEXT,
      champion_id INTEGER,
      role TEXT,
      lane TEXT,
      kills INTEGER,
      deaths INTEGER,
      assists INTEGER,
      total_damage_dealt INTEGER,
      gold_earned INTEGER,
      cs INTEGER,
      time_played INTEGER,
      PRIMARY KEY (match_id, puuid),
      FOREIGN KEY (match_id) REFERENCES public.matches(match_id),
      FOREIGN KEY (puuid) REFERENCES public.players(puuid)
    );
    """,
    "CREATE INDEX IF NOT EXISTS idx_participants_champion ON public.participants(champion_name);",
    "CREATE INDEX IF NOT EXISTS idx_participants_win ON public.participants(win);",
    "CREATE INDEX IF NOT EXISTS idx_matches_version ON public.matches(game_version);",
    "CREATE INDEX IF NOT EXISTS idx_matches_queue ON public.matches(queue_id);",
]

def init_db():
    conn = get_conn()
    try:
        with conn, conn.cursor() as cur:
            for stmt in DDL_STATEMENTS:
                cur.execute(stmt)
    finally:
        conn.close()

if __name__ == "__main__":
    # 1) S’assurer que les tables existent
    init_db()

    # 2) Lancer l’ingestion
    for pf in PLATFORMS:
        ingest_platform(pf, matches_per_puuid=MATCHES_PER_PUUID)
    print("✅ Ingestion terminée.")
