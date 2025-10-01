import React, { useEffect, useMemo, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar
} from "recharts";


// ---------- Helpers ----------
async function loadJSON(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error("Impossible de charger " + path);
    return res.json();
}

function useJson(path) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let mounted = true;
        setLoading(true);
        loadJSON(path)
            .then((d) => mounted && (setData(d), setError(null)))
            .catch((e) => mounted && setError(e))
            .finally(() => mounted && setLoading(false));
        return () => (mounted = false);
    }, [path]);
    return { data, error, loading };
}

// 🎨 Palette basée sur les variables Bootstrap (toujours dispo pour KDA / pies)
const PALETTE = [
    "var(--bs-primary)",
    "var(--bs-success)",
    "var(--bs-info)",
    "var(--bs-warning)",
    "var(--bs-danger)",
    "var(--bs-purple, #6f42c1)",
    "var(--bs-teal, #20c997)",
    "var(--bs-pink, #d63384)"
];
const colorAt = (i) => PALETTE[i % PALETTE.length];
const sideColor = (side) => (side === "BLUE" ? "var(--bs-primary)" : "var(--bs-danger)");

// Styles communs pour axes & grille (respecte le thème Bootstrap)
const axisProps = { tick: { fill: "var(--bs-body-color, #e6e6e6)" }, stroke: "var(--bs-border-color, rgba(255,255,255,.25))" };
const gridProps = { stroke: "var(--bs-border-color-translucent, rgba(255,255,255,.15))" };
const tooltipProps = { contentStyle: { background: "var(--bs-body-bg, #0b1420)", border: "1px solid var(--bs-border-color, rgba(255,255,255,.2))", color: "var(--bs-body-color, #e6e6e6)" } };

function WinrateBadge({ value }) {
    const cls = value >= 52 ? "bg-success" : value >= 48 ? "bg-warning text-dark" : "bg-danger";
    return <span className={`badge ${cls}`}>{value.toFixed(2)}%</span>;
}


const DDRAGON_VERSION = "15.19.1";
const USE_DDRAGON = true;
const CHAMP_EXCEPTIONS = {
    "Cho'Gath": "Chogath",
    "Kai'Sa": "Kaisa",
    "Kha'Zix": "Khazix",
    "Vel'Koz": "Velkoz",
    "LeBlanc": "Leblanc",
    "Wukong": "MonkeyKing",
    "Renata Glasc": "Renata",
    "Nunu & Willump": "Nunu",
    "Dr. Mundo": "DrMundo",
    "Jarvan IV": "JarvanIV",
    "Miss Fortune": "MissFortune",
    "Master Yi": "MasterYi",
    "Xin Zhao": "XinZhao",
    "Tahm Kench": "TahmKench",
    "Twisted Fate": "TwistedFate",
    "Aurelion Sol": "AurelionSol",
    "Kog'Maw": "KogMaw",
    "Rek'Sai": "RekSai",
    "Bel'Veth": "Belveth",
    "K'Santé": "KSante",
    "Mel": "Mel",
    "Yunara": "Yunara"
};
function champId(name) {
    if (CHAMP_EXCEPTIONS[name]) return CHAMP_EXCEPTIONS[name];
    // Retire accents & caractères non A-Za-z sans regex d'échappement
    const ascii = name
        .normalize('NFD')
        .split('')
        .filter(ch => {
            const code = ch.charCodeAt(0);
            // filtre les diacritiques U+0300..U+036F
            return !(code >= 0x0300 && code <= 0x036F);
        })
        .join('');
    return ascii.replace(/[^A-Za-z]/g, "");
}
function champIcon(name) {
    const id = champId(name);
    if (USE_DDRAGON) return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${id}.png`;
    return `/assets/champions/${id}.png`; // place tes PNG ici si tu préfères local
}

// Ticks XAxis avec icône de champion
function ChampTick({ x, y, payload }) {
    const name = payload.value;
    const src = champIcon(name);
    const size = 28;
    return (
        <g transform={`translate(${x},${y})`}>
            <image href={src} x={-size/2} y={8} width={size} height={size} />
        </g>
    );
}

// Tooltip HTML avec icône
function BarTooltip({ active, payload, label, metricLabel = "Valeur" }) {
    if (!active || !payload || !payload.length) return null;
    const v = payload[0].value;
    const src = champIcon(label);
    return (
        <div className="card p-2 bg-body text-body border" style={{ minWidth: 160 }}>
            <div className="d-flex align-items-center gap-2 mb-1">
                <img src={src} width={24} height={24} alt="icon" />
                <strong>{label}</strong>
            </div>
            <div className="small text-secondary">{metricLabel}: {v}</div>
        </div>
    );
}

function Section({ title, description, children, right }) {
    return (
        <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16 }}>
                <div>
                    <h2 style={{ margin: 0 }}>{title}</h2>
                    {description && <p style={{ marginTop: 4, opacity: 0.8 }}>{description}</p>}
                </div>
                {right}
            </div>
            <div className="card bg-dark text-light border-0" style={{ padding: 16, borderRadius: 12, boxShadow: "0 6px 24px rgba(0,0,0,.12)" }}>{children}</div>
        </div>
    );
}

function PageShell({ children }) {
    return (
        <div style={{ minHeight: "100dvh", background: "radial-gradient(1200px 600px at 70% -10%, rgba(200,170,110,.12), transparent 60%), #0b1420", color: "#e6e6e6" }}>
            <div className="container py-4">
                <header className="mb-3">
                    <h1 className="h4 m-0">LOL Statistiques</h1>
                    <p>Dernier pull des données 01/10/2025</p>
                    <p>Echantillonage de 3 serveurs KR NA et EUW sur les games du top ladder (Challenger)</p>
                </header>
                <main style={{ display: "grid", gap: 24 }}>{children}</main>
            </div>
        </div>
    );
}

// ---------- Pages (contenus) ----------
function Dashboard() {
    const { data: topPicks } = useJson("/data/top_25_pick_champ.json");
    const { data: sides } = useJson("/data/win_rate_per_sides.json");
    const top5 = useMemo(() => (topPicks ? [...topPicks].sort((a,b)=>b.picks-a.picks).slice(0,5) : []), [topPicks]);

    return (
        <Section title="Vue d'ensemble" description="Top picks champions et répartition des victoires par côté.">
            <div className="row g-3">
                <div className="col-lg-6" style={{ minHeight: 320 }}>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={top5} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
                            <CartesianGrid {...gridProps} />
                            <XAxis {...axisProps} dataKey="champion_name" interval={0} height={60} tick={<ChampTick />} />
                            <YAxis {...axisProps} />
                            <Tooltip content={(p)=> <BarTooltip {...p} metricLabel="Picks" />} />
                            {/* Barres neutres: on met l'accent sur les icônes, pas la couleur */}
                            <Bar dataKey="picks" name="Picks" fill="var(--bs-info)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="col-lg-6" style={{ minHeight: 320 }}>
                    <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                            <Pie dataKey="wins" data={sides || []} nameKey="side" outerRadius={110} label>
                                {(sides || []).map((s, i) => <Cell key={i} fill={sideColor(s.side)} />)}
                            </Pie>
                            <Tooltip {...tooltipProps} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Section>
    );
}

function TopPicksPage() {
    const { data, loading, error } = useJson("/data/top_25_pick_champ.json");
    const dataSorted = useMemo(() => (data ? [...data].sort((a,b)=>b.picks-a.picks) : []), [data]);
    return (
        <Section title="Top 25 — Picks" description="Top des 25 champions les plus pick">
            {error && <p>Erreur: {String(error)}</p>}
            {loading && <p>Chargement…</p>}
            {data && (
                <div style={{ minHeight: 420 }}>
                    <ResponsiveContainer width="100%" height={420}>
                        <BarChart data={dataSorted} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
                            <CartesianGrid {...gridProps} />
                            <XAxis {...axisProps} dataKey="champion_name" interval={0} height={60} tick={<ChampTick />} />
                            <YAxis {...axisProps} />
                            <Tooltip content={(p)=> <BarTooltip {...p} metricLabel="Picks" />} />
                            <Bar dataKey="picks" name="Picks" fill="var(--bs-secondary)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </Section>
    );
}

function ChampionsTablePage() {
    const { data, loading, error } = useJson("/data/pick_and_winrate_per_champ.json");
    const [q, setQ] = useState("");
    const filtered = useMemo(() => {
        if (!data) return [];
        return data.filter((r) => r.champion_name.toLowerCase().includes(q.toLowerCase()));
    }, [data, q]);

    return (
        <Section
            title="Pick & Winrate par champion"
            description="Taux de pick et victiore par champions"
            right={<input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Filtrer par champion…" className="form-control" style={{ maxWidth: 260 }}/>}
        >
            {error && <p>Erreur: {String(error)}</p>}
            {loading && <p>Chargement…</p>}
            {data && (
                <div className="table-responsive">
                    <table className="table table-dark table-striped align-middle">
                        <thead>
                        <tr>
                            <th>Champion</th>
                            <th>Games</th>
                            <th>Wins</th>
                            <th>Winrate</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.map((r) => (
                            <tr key={r.champion_name}>
                                <td>
                                    <img src={champIcon(r.champion_name)} alt="icon" width={20} height={20} className="me-2" />
                                    {r.champion_name}
                                </td>
                                <td>{r.games}</td>
                                <td>{r.wins}</td>
                                <td><WinrateBadge value={r.win_rate_pct} /></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Section>
    );
}

function AverageKDAPage() {
    const { data, loading, error } = useJson("/data/averageKDA.json");
    const top = useMemo(() => (data ? [...data].slice(0, 12) : []), [data]);
    return (
        <Section title="Average K/D/A" description="Moyennes de KDA par champion.">
            {error && <p>Erreur: {String(error)}</p>}
            {loading && <p>Chargement…</p>}
            {data && (
                <div className="row g-3">
                    <div className="col-lg-6" style={{ minHeight: 360 }}>
                        <ResponsiveContainer width="100%" height={360}>
                            <RadarChart data={top} outerRadius={120}>
                                <PolarGrid stroke="var(--bs-border-color, rgba(255,255,255,.25))" />
                                <PolarAngleAxis dataKey="champion_name" tick={{ fill: "var(--bs-body-color, #e6e6e6)" }} />
                                <PolarRadiusAxis tick={{ fill: "var(--bs-body-color, #e6e6e6)" }} />
                                <Radar name="Kills" dataKey="avg_kills" stroke="var(--bs-warning)" fill="var(--bs-warning)" fillOpacity={0.25} />
                                <Radar name="Deaths" dataKey="avg_deaths" stroke="var(--bs-danger)" fill="var(--bs-danger)" fillOpacity={0.2} />
                                <Radar name="Assists" dataKey="avg_assists" stroke="var(--bs-success)" fill="var(--bs-success)" fillOpacity={0.2} />
                                <Legend />
                                <Tooltip {...tooltipProps} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="col-lg-6" style={{ minHeight: 360 }}>
                        <ResponsiveContainer width="100%" height={360}>
                            <LineChart data={top} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
                                <CartesianGrid {...gridProps} />
                                <XAxis {...axisProps} dataKey="champion_name" interval={0} angle={-30} textAnchor="end" height={80} />
                                <YAxis {...axisProps} />
                                <Tooltip {...tooltipProps} />
                                <Legend />
                                <Line type="monotone" dataKey="avg_kills" name="Kills" stroke="var(--bs-warning)" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="avg_deaths" name="Deaths" stroke="var(--bs-danger)" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="avg_assists" name="Assists" stroke="var(--bs-success)" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </Section>
    );
}

function SidesPage() {
    const { data, loading, error } = useJson("/data/win_rate_per_sides.json");
    const formatted = useMemo(() => (data || []).map(d => ({ ...d, losses: (d.games ?? 0) - (d.wins ?? 0) })), [data]);
    return (
        <Section title="Winrate par côté" description="BLUE vs RED — parts de victoires & défaites.">
            {error && <p>Erreur: {String(error)}</p>}
            {loading && <p>Chargement…</p>}
            {data && (
                <div className="row g-3">
                    <div className="col-lg-6" style={{ minHeight: 360 }}>
                        <ResponsiveContainer width="100%" height={360}>
                            <BarChart data={formatted}>
                                <CartesianGrid {...gridProps} />
                                <XAxis {...axisProps} dataKey="side" />
                                <YAxis {...axisProps} />
                                <Tooltip {...tooltipProps} />
                                <Legend />
                                <Bar dataKey="wins" name="Wins" fill="var(--bs-success)" />
                                <Bar dataKey="losses" name="Losses" fill="var(--bs-danger)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="col-lg-6" style={{ minHeight: 360 }}>
                        <ResponsiveContainer width="100%" height={360}>
                            <PieChart>
                                <Pie data={data} dataKey="win_rate_pct" nameKey="side" outerRadius={120} label>
                                    {(data || []).map((s, i) => <Cell key={i} fill={sideColor(s.side)} />)}
                                </Pie>
                                <Tooltip {...tooltipProps} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </Section>
    );
}

function LanesPage() {
    const { data, loading, error } = useJson("/data/winrate_lane.json");
    const [lane, setLane] = useState("BOTTOM");
    const lanes = useMemo(() => Array.from(new Set((data||[]).map(d=>d.lane))), [data]);
    const rows = useMemo(() => (data||[]).filter(d=>d.lane===lane).sort((a,b)=>b.games-a.games), [data, lane]);

    return (
        <Section
            title="Winrate par lane"
            description="Winrate par lane TOP/JUNGLE/MID/BOTTOM+SUPPORT."
            right={(
                <select value={lane} onChange={(e)=>setLane(e.target.value)} className="form-select" style={{ maxWidth: 220 }}>
                    {lanes.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
            )}
        >
            {error && <p>Erreur: {String(error)}</p>}
            {loading && <p>Chargement…</p>}
            {data && (
                <div className="row g-3">
                    <div className="col-lg-7">
                        <div className="table-responsive">
                            <table className="table table-dark table-striped align-middle">
                                <thead>
                                <tr>
                                    <th>Champion</th>
                                    <th className="text-end">Games</th>
                                    <th className="text-end">Winrate</th>
                                </tr>
                                </thead>
                                <tbody>
                                {rows.map(r => (
                                    <tr key={r.champion_name}>
                                        <td>
                                            <img src={champIcon(r.champion_name)} alt="icon" width={20} height={20} className="me-2" />
                                            {r.champion_name}
                                        </td>
                                        <td className="text-end">{r.games}</td>
                                        <td className="text-end"><WinrateBadge value={r.win_rate_pct} /></td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="col-lg-5" style={{ minHeight: 420 }}>
                        <ResponsiveContainer width="100%" height={420}>
                            <BarChart data={rows.slice(0, 12)}>
                                <CartesianGrid {...gridProps} />
                                <XAxis {...axisProps} dataKey="champion_name" interval={0} height={60} tick={<ChampTick />} />
                                <YAxis {...axisProps} />
                                <Tooltip content={(p)=> <BarTooltip {...p} metricLabel="Winrate %" />} />
                                <Legend />
                                <Bar dataKey="win_rate_pct" name="Winrate %" fill="var(--bs-secondary)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </Section>
    );
}

function RegionsPage() {
    const { data, loading, error } = useJson("/data/winraterégion_cluster.json");
    const [cluster, setCluster] = useState("asia");
    const clusters = useMemo(() => Array.from(new Set((data||[]).map(d=>d.cluster))), [data]);
    const rows = useMemo(() => (data||[]).filter(d=>d.cluster===cluster).sort((a,b)=>b.games-a.games), [data, cluster]);

    return (
        <Section
            title="Winrate par région/cluster"
            description="Winrate par serveur (ASIA/NA/EUW)."
            right={(
                <select value={cluster} onChange={(e)=>setCluster(e.target.value)} className="form-select" style={{ maxWidth: 220 }}>
                    {clusters.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            )}
        >
            {error && <p>Erreur: {String(error)}</p>}
            {loading && <p>Chargement…</p>}
            {data && (
                <div className="row g-3">
                    <div className="col-lg-7">
                        <div className="table-responsive">
                            <table className="table table-dark table-striped align-middle">
                                <thead>
                                <tr>
                                    <th>Champion</th>
                                    <th className="text-end">Games</th>
                                    <th className="text-end">Winrate</th>
                                </tr>
                                </thead>
                                <tbody>
                                {rows.map(r => (
                                    <tr key={r.champion_name}>
                                        <td>
                                            <img src={champIcon(r.champion_name)} alt="icon" width={20} height={20} className="me-2" />
                                            {r.champion_name}
                                        </td>
                                        <td className="text-end">{r.games}</td>
                                        <td className="text-end"><WinrateBadge value={r.win_rate_pct} /></td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="col-lg-5" style={{ minHeight: 420 }}>
                        <ResponsiveContainer width="100%" height={420}>
                            <BarChart data={rows.slice(0, 12)}>
                                <CartesianGrid {...gridProps} />
                                <XAxis {...axisProps} dataKey="champion_name" interval={0} height={60} tick={<ChampTick />} />
                                <YAxis {...axisProps} />
                                <Tooltip content={(p)=> <BarTooltip {...p} metricLabel="Winrate %" />} />
                                <Legend />
                                <Bar dataKey="win_rate_pct" name="Winrate %" fill="var(--bs-secondary)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </Section>
    );
}

// ---------- Page avec ONGLETS Bootstrap ----------
const TABS = [
    { key: "dashboard", label: "Dashboard", render: () => <Dashboard /> },
    { key: "picks", label: "Top Picks", render: () => <TopPicksPage /> },
    { key: "champions", label: "Pick & Winrate", render: () => <ChampionsTablePage /> },
    { key: "kda", label: "Average KDA", render: () => <AverageKDAPage /> },
    { key: "sides", label: "Winrate par côté", render: () => <SidesPage /> },
    { key: "lanes", label: "Winrate par lane", render: () => <LanesPage /> },
    { key: "regions", label: "Par région", render: () => <RegionsPage /> },
];

export default function StatsApp() {
    const [active, setActive] = useState(() =>
        (typeof window !== "undefined" && window.location.hash?.replace("#", "")) || "dashboard"
    );

    useEffect(() => {
        if (typeof window !== "undefined") {
            window.location.hash = active;
        }
    }, [active]);

    const current = TABS.find(t => t.key === active) || TABS[0];

    return (
        <PageShell>
            <ul className="nav nav-tabs" role="tablist">
                {TABS.map(tab => (
                    <li className="nav-item" role="presentation" key={tab.key}>
                        <button
                            className={`nav-link ${active === tab.key ? "active" : ""}`}
                            onClick={() => setActive(tab.key)}
                            type="button"
                            role="tab"
                            aria-selected={active === tab.key}
                            style={{ fontWeight: 600 }}
                        >
                            {tab.label}
                        </button>
                    </li>
                ))}
            </ul>

            <div className="tab-content" style={{ marginTop: 16 }}>
                <div className="tab-pane fade show active" role="tabpanel">
                    {current.render()}
                </div>
            </div>
        </PageShell>
    );
}
