// scripts/fetch-rotation.mjs
import { writeFile } from "node:fs/promises";

const API_KEY = process.env.RIOT_KEY;
const REGION = "oc1";
if (!API_KEY) {
    console.error("Missing RIOT_KEY env var");
    process.exit(1);
}

const url = `https://${REGION}.api.riotgames.com/lol/platform/v3/champion-rotations`;

const res = await fetch(url, { headers: { "X-Riot-Token": API_KEY } });
if (!res.ok) {
    console.error(`Riot API error: ${res.status} ${res.statusText}`);
    process.exit(1);
}

const data = await res.json();

await writeFile(
    "public/rotation.json",
    JSON.stringify({ fetchedAt: new Date().toISOString(), region: REGION, data }, null, 2)
);

console.log("rotation.json generated");
