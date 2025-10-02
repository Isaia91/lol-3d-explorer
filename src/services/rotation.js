const API_KEY = import.meta.env.VITE_RIOT_KEY;
const REGION = "oc1";

export async function getFreeRotation() {
    const res = await fetch("/rotation.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Impossible de récupérer la rotation");
    const { data } = await res.json();
    return data;
}