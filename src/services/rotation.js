const API_KEY = import.meta.env.VITE_RIOT_KEY;
const REGION = "oc1";

export async function getFreeRotation() {
    const res = await fetch(`https://${REGION}.api.riotgames.com/lol/platform/v3/champion-rotations`, {
        headers: { "X-Riot-Token": API_KEY }
    });
    if (!res.ok) throw new Error("Impossible de récupérer la rotation");
    return res.json();
}
