const DDRAGON_BASE = "https://ddragon.leagueoflegends.com";

export async function getLatestVersion() {
    const res = await fetch(`${DDRAGON_BASE}/api/versions.json`);
    if (!res.ok) throw new Error("Failed to fetch versions");
    const versions = await res.json();
    return versions[0]; // dernier patch
}

export async function getSummonerSpells(locale = "fr_FR") {
    const version = await getLatestVersion();
    const res = await fetch(`${DDRAGON_BASE}/cdn/${version}/data/${locale}/summoner.json`);
    if (!res.ok) throw new Error("Failed to fetch summoner spells");
    const data = await res.json();
    return { version, spells: Object.values(data.data) };
}

export function summonerSpellIcon(version, spellId) {
    return `${DDRAGON_BASE}/cdn/${version}/img/spell/${spellId}.png`;
}
