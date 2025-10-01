// src/pages/Champions.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { getChampions, championSplash } from "../services/champions";
import { getFreeRotation } from "../services/rotation";
import ChampionCard from "../components/ChampionsCards";

function normalize(str = "") {
    return str
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // retire accents
        .toLowerCase()
        .trim();
}

export default function Champions() {
    const [version, setVersion] = useState("");
    const [champions, setChampions] = useState([]);
    const [rotationIds, setRotationIds] = useState([]);
    const [q, setQ] = useState("");
    const [error, setError] = useState("");

    const searchRef = useRef(null);

    useEffect(() => {
        (async () => {
            try {
                const { version, champions } = await getChampions("fr_FR");
                setVersion(version);
                setChampions(champions);

                const rot = await getFreeRotation();
                setRotationIds(rot.freeChampionIds || []);
            } catch (e) {
                console.error(e);
                setError("Problème de chargement des données. Verifiez que votre clée api ne soit pas expirée");
            }
        })();
    }, []);

    useEffect(() => {
        const onKey = (e) => {
            const isMac = navigator.platform.toUpperCase().includes("MAC");
            const mod = isMac ? e.metaKey : e.ctrlKey;
            if (mod && e.key.toLowerCase() === "k") {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const champsByNumericId = useMemo(
        () => Object.fromEntries(champions.map((c) => [parseInt(c.key, 10), c])),
        [champions]
    );

    const freeChamps = useMemo(
        () => rotationIds.map((id) => champsByNumericId[id]).filter(Boolean),
        [rotationIds, champsByNumericId]
    );

    const filteredAll = useMemo(() => {
        const term = normalize(q);
        if (!term) return champions;
        return champions.filter((c) =>
            normalize(`${c.name} ${c.title} ${(c.tags || []).join(" ")}`).includes(term)
        );
    }, [champions, q]);

    if (error) return <div className="container py-4 text-danger">{error}</div>;

    return (
        <>
            {/* Header + recherche */}
            <header className="container py-4 d-flex flex-wrap gap-3 align-items-center">
                <h1 className="display-6 mb-0">
                    Champions <small className="text-body-secondary fs-6">({version})</small>
                </h1>

                <div className="input-group ms-auto" style={{ maxWidth: 340 }}>
          <span className="input-group-text">
            <i className="bi bi-search"></i>
          </span>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Rechercher… (Ctrl/⌘+K)"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        ref={searchRef}
                        aria-label="Rechercher un champion"
                    />
                </div>
            </header>

            {/* Carrousel : rotation gratuite */}
            <section className="container pb-4">
                <h2 className="h5 mb-3">Rotation gratuite</h2>

                {freeChamps.length > 0 ? (
                    <div
                        id="freeRotation"
                        className="carousel slide"
                        data-bs-ride="false"
                        style={{ maxWidth: "100%", overflow: "hidden" }}
                    >
                        <div className="carousel-inner w-100">
                            {Array.from({ length: Math.ceil(freeChamps.length / 4) }).map((_, idx) => {
                                const slice = freeChamps.slice(idx * 4, idx * 4 + 4);
                                return (
                                    <div key={idx} className={`carousel-item ${idx === 0 ? "active" : ""}`}>
                                        <div className="row g-3">
                                            {slice.map((c) => (
                                                <div key={c.key} className="col-12 col-sm-6 col-lg-3">
                                                    <ChampionCard
                                                        name={c.name}
                                                        title={c.title}
                                                        img={championSplash(version, c.id)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            className="carousel-control-prev"
                            type="button"
                            data-bs-target="#freeRotation"
                            data-bs-slide="prev"
                        >
                            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Précédent</span>
                        </button>
                        <button
                            className="carousel-control-next"
                            type="button"
                            data-bs-target="#freeRotation"
                            data-bs-slide="next"
                        >
                            <span className="carousel-control-next-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Suivant</span>
                        </button>
                    </div>
                ) : (
                    <p className="text-body-secondary">Chargement de la rotation…</p>
                )}
            </section>

            {/* Grille : tous les champions (filtrés) */}
            <main className="container pb-5">
                <h2 className="h5 mb-3">Tous les champions{q ? ` — filtre: "${q}"` : ""}</h2>
                <div className="row g-3">
                    {filteredAll.map((c) => (
                        <div key={c.key} className="col-12 col-sm-6 col-md-4 col-lg-3 col-xxl-2">
                            <ChampionCard
                                name={c.name}
                                title={c.title}
                                img={championSplash(version, c.id)}
                            />
                        </div>
                    ))}
                </div>
            </main>
        </>
    );
}
