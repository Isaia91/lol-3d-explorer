const DDRAGON_BASE = "https://ddragon.leagueoflegends.com";

export async function getLatestVersion() {
    const res = await fetch(`${DDRAGON_BASE}/api/versions.json`);
    if (!res.ok) throw new Error("Failed to fetch versions");
    const versions = await res.json();
    return versions[0]; // dernier patch
}

export async function getChampions(locale = "en_US") {
    const version = await getLatestVersion();
    const res = await fetch(`${DDRAGON_BASE}/cdn/${version}/data/${locale}/champion.json`);
    if (!res.ok) throw new Error("Failed to fetch champions");
    const data = await res.json();
    const champs = Object.values(data.data);
    return { version, champions: champs };
}

export function championSplash(version, champId) {
    // icône carrée
    return `${DDRAGON_BASE}/cdn/${version}/img/champion/${champId}.png`;
}
