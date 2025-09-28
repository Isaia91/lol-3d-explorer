// src/components/SummonersGrid.jsx
import { useEffect, useState } from "react";
import { getSummonerSpells, summonerSpellIcon } from "../services/summoners";

function stripHtml(html = "") {
    const el = document.createElement("div");
    el.innerHTML = html;
    return el.textContent || el.innerText || "";
}

const fmtCD = (s) =>
    s?.cooldownBurn && s.cooldownBurn !== "0"
        ? `${s.cooldownBurn}s`
        : Array.isArray(s.cooldown) && s.cooldown[0]
            ? `${s.cooldown[0]}s`
            : "—";

export default function SummonersGrid({ locale = "fr_FR" }) {
    const [state, setState] = useState({ loading: true, error: null, version: "", spells: [] });

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const { version, spells } = await getSummonerSpells(locale);
                if (!alive) return;

                // uniquement les sorts disponibles en CLASSIC
                const classic = spells.filter((s) => (s.modes || []).includes("CLASSIC"));
                classic.sort((a, b) => a.name.localeCompare(b.name, locale.split("_")[0] || "fr"));

                setState({ loading: false, error: null, version, spells: classic });
            } catch (e) {
                if (!alive) return;
                setState({ loading: false, error: e?.message || "Erreur inconnue", version: "", spells: [] });
            }
        })();
        return () => {
            alive = false;
        };
    }, [locale]);

    if (state.loading) return <p>Chargement des sorts (CLASSIC)…</p>;
    if (state.error) return <p className="text-danger">Erreur : {state.error}</p>;

    return (
        <div className="container py-4">
            <div className="row g-4">
                {state.spells.map((spell) => (
                    <div key={spell.id} className="col-12 col-md-4">
                        <div className="card h-100 shadow-sm" style={{ background: "#0e1a2b", color: "#fff" }}>
                            <div className="card-body d-flex flex-column align-items-center text-center">
                                <img
                                    src={summonerSpellIcon(state.version, spell.id)}
                                    alt={spell.name}
                                    width="50"
                                    height="50"
                                    className="mb-3 rounded"
                                />
                                <h5 className="card-title">{spell.name}</h5>
                                <span className="badge text-bg-dark mb-2">CD: {fmtCD(spell)}</span>
                                <p className="card-text small">{stripHtml(spell.description)}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
