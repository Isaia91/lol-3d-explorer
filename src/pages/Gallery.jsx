import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Environment, OrbitControls, Html, useGLTF, useAnimations, Center } from "@react-three/drei";
import ChampionModal from "../components/ChampionModal";


const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/+$/, "/");
const asset = (p) => `${BASE}${String(p).replace(/^\/+/, "")}`;

// -- Modèles
const ROLES = [
    { id: "Top", name: "Top", champion: "Gnar est un yordle primitif dont les manières joyeuses peuvent soudain faire place à une colère irrationnelle. Il se transforme alors en une bête colossale portée à la destruction. Gelé dans de la glace pure pendant des millénaires, la curieuse créature s'est libérée de sa prison. Aujourd'hui, il parcourt avec enthousiasme un monde qu'il trouve exotique et merveilleux. Enchanté par le danger, Gnar lance à ses ennemis tout ce qu'il trouve, qu'il s'agisse de son boomerang en croc ou d'un bâtiment proche.", icon:asset("champions_icons/gnar.jpg") , file: asset("figurines/gnar.glb"), anim: "gnar_idle1_alt_c.anm",loop:true,
        blurb: "Les champions de la voie du haut sont souvent des tanks, des brutes ou des duellistes qui excellent dans les combats en un contre un et le split-push. Ils jouent un rôle crucial dans les combats d'équipe et la tenue des voies en début de partie.",
        cam: { position: [0.2, 1.4, 5.2], target: [0, 1.1, 0], fov: 40 }
    },
    { id: "Jungler", name: "Jungler",champion: "Kindred représente les essences jumelles de la mort, distinctes mais indissociables. La flèche d'Agneau offre une fin rapide à ceux qui acceptent leur destin. Loup pourchasse ceux qui fuient leur dernier soupir et leur arrache brutalement la vie à coups de crocs. Bien que les interprétations de la nature de Kindred varient à travers tout Runeterra, chaque mortel doit choisir le vrai visage de sa mort.", icon:asset("champions_icons/Kindred.webp") , file: asset("figurines/kindred.glb"),
        blurb: "Les junglers se déplacent dans la jungle en sécurisant les objectifs, en aidant les voies avec les ganks et en contrôlant la vision."
    },
    { id: "Mid", name: "Mid",champion: "Azir fut l'empereur mortel de Shurima en des temps très lointains, un homme fier dressé au bord de l'immortalité. Son orgueil lui valut d'être trahi et assassiné à l'heure de son triomphe ; mais des millénaires se sont écoulés et il revient sous la forme d'un être transfiguré à l'immense puissance. Sa cité ensevelie ayant ressurgi des sables, Azir cherche à rendre sa gloire passée à Shurima.", icon:asset("champions_icons/azir.png") , file: asset("figurines/azir.glb"), anim:"azir_idle1.anm", loop: true,
        blurb: "Les mid laners sont des meneurs de jeu, souvent des assassins ou des mages qui infligent des dégâts importants et se déplacent pour aider les side lanes.",
    },
    { id: "Adc", name: "Adc",champion: "Émergeant des ombres au clair de lune, Aphelios abat ceux qui voudraient anéantir sa foi sans un mot ; ses armes et sa précision mortelle parlent pour lui. Un poison qui le rend muet coule dans ses veines, mais il est constamment guidé par sa sœur, Alune. Depuis son temple lointain, elle lui confère un arsenal d'armes en pierre de lune. Tant que la lune brillera dans le ciel, Aphelios ne sera jamais seul.", icon:asset("champions_icons/Aphelios.webp") , file: asset("figurines/aphelios.glb"),
        anim: "aphelios_a_attack1_to_idle.anm", loop: true,
        blurb: "Les ADC sont des spécialistes des dégâts qui se concentrent sur l'évolution vers la fin de partie et se positionnent soigneusement dans les combats en équipe.",
        cam: { position: [0.2, 1.4, 4.2], target: [0, 1.1, 0], fov: 40 }
    },
    { id: "Support", name: "Support",champion: "Doté de biceps énormes, et d'un cœur plus grand encore, Braum est un héros admiré par tout Freljord. Lors de tous les banquets au nord de Frostheld, on rend hommage à sa force légendaire. On raconte qu'il a abattu une forêt entière de chênes en une seule nuit, ou encore qu'il a réduit en miettes une montagne à coups de poing. Portant une porte enchantée en guise de bouclier, Braum arpente les terres gelées du nord en arborant un sourire aussi large que ses muscles et en venant en aide à ceux dans le besoin.", icon:asset("champions_icons/braum.webp") , file: asset("figurines/braum.glb"),
        blurb: "Les supports protègent leur ADC, contrôlent la vision et fournissent un contrôle des foules ou des soins ."
    },
];


// préchargement (drei)
ROLES.forEach(r => useGLTF.preload(r.file));


function normalize(s = "") {
    return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// Canvas dédié pour une figurine (évite la logique globale d'index)
function FigurineCanvas({ url, anim, cam, loop, onSelect }) {
    const controlsRef = useRef(null);
    const [obj, setObj] = useState(null);
    useEffect(() => { controlsRef.current?.reset?.(); }, [url]);

    return (
        <div className="rounded-3"   style={{
        }}>
            <Canvas
                camera={{ position: [0, 1.2, 2.5], fov: 35 }}
                style={{ width: "100%", height: 420 }}
                shadows
            >
                <Suspense fallback={<Html center><div className="spinner-border" role="status" /></Html>}>
                    <Environment preset="studio" />
                    <ambientLight intensity={0.4} />
                    <directionalLight position={[3,5,3]} intensity={1} castShadow />
                    <Center>
                        <Figurine
                            url={url}
                            anim={anim}
                            loop={loop}
                            onReadyObject={setObj}
                            onClick={() => onSelect?.()}
                        />
                    </Center>
                    <FitCamera object={obj} controlsRef={controlsRef} overrides={cam} />
                    <OrbitControls
                        ref={controlsRef}
                        makeDefault
                        enablePan={false}
                        minDistance={1.5}
                        maxDistance={20}
                        enableDamping
                        dampingFactor={0.05}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
}

function Figurine({ url, anim, onReadyObject, loop, onClick }) {
    const { scene, animations } = useGLTF(url);
    const { actions, names, mixer } = useAnimations(animations, scene);

    useEffect(() => {
        if (!names || names.length === 0) return;
        const want = (anim || "").replace(/\.anm$/i, "").toLowerCase();
        const pick =
            names.find(n => n.toLowerCase() === want) ||
            names.find(n => n.toLowerCase().includes(want)) ||
            names.find(n => n.toLowerCase().includes("idle")) ||
            names[0];

        mixer.stopAllAction();
        const act = actions[pick];
        if (act) {
            const forceLoop = !!loop;
            const isTransition = pick.toLowerCase().includes("_to_");
            const shouldLoop = forceLoop || (!anim && !isTransition);
            act.reset();
            act.setLoop(shouldLoop ? THREE.LoopRepeat : THREE.LoopOnce, shouldLoop ? Infinity : 1);
            act.clampWhenFinished = !shouldLoop;
            act.setEffectiveTimeScale(1);
            act.fadeIn(0.2).play();
        }
        return () => mixer.stopAllAction();
    }, [url, anim, names, actions, mixer, loop]);

    useEffect(() => { onReadyObject?.(scene); }, [scene, onReadyObject]);

    const movedRef = useRef(false);
    const startRef = useRef({ x: 0, y: 0 });

    return (
        <primitive
            object={scene}
            dispose={null}
            onPointerDown={(e) => {
                e.stopPropagation();
                movedRef.current = false;
                startRef.current = { x: e.clientX, y: e.clientY };
            }}
            onPointerMove={(e) => {
                const dx = e.clientX - startRef.current.x;
                const dy = e.clientY - startRef.current.y;
                if (Math.hypot(dx, dy) > 4) movedRef.current = true; // seuil de 4px
            }}
            onPointerUp={(e) => {
                e.stopPropagation();
                if (!movedRef.current) onClick?.(e);
            }}
            onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }}
            onPointerOut={() => { document.body.style.cursor = "default"; }}
        />
    );
}

export default function Gallery() {
    const [q, setQ] = useState("");
    const searchRef = useRef(null);

    const [selected, setSelected] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    const openModal = (item) => { setSelected(item); setIsOpen(true); };
    const closeModal = () => { setIsOpen(false); setSelected(null); };

    const filtered = useMemo(() => {
        const n = normalize(q);
        if (!n) return ROLES;
        return ROLES.filter((r) => normalize(r.name).includes(n) || normalize(r.id).includes(n));
    }, [q]);

    // Raccourci clavier
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

    return (
        <div className="container py-4" style={{backgroundImage: 'url("/backgrounds/chaos.svg")',color:"black" }} >
            <h1 className="h4 text-center mb-4">Gallery</h1>

            {/* Recherche Bootstrap */}
            <div className="d-flex justify-content-center mb-4">
                <div className="input-group" style={{ maxWidth: 360 }}>
          <span className="input-group-text">
            <i className="bi bi-search" />
          </span>
                    <input
                        ref={searchRef}
                        type="text"
                        className="form-control"
                        placeholder="Rechercher un rôle… (Ctrl/⌘+K)"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                    {q && (
                        <button className="btn btn-outline-secondary" onClick={() => setQ("")}>
                            <i className="bi bi-x-lg" />
                        </button>
                    )}
                </div>
            </div>

            {filtered.length === 0 ? (
                <p className="text-center text-body-secondary">Aucun résultat.</p>
            ) : (
                <div className="d-flex flex-column gap-5">
                    {filtered.map((item, idx) => {
                        const modelCol = (
                            <div key={`model-${item.id}`} className="col-12 col-md-6">
                                <FigurineCanvas
                                    url={item.file}
                                    anim={item.anim}
                                    cam={item.cam}
                                    loop={item.loop}
                                    //Clique sur la figurine => ouvre la modale
                                    onSelect={() => openModal(item)}
                                />
                            </div>
                        );
                        const textCol = (
                            <div key={`text-${item.id}`} className="col-12 col-md-6">
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <h2 className="h5 mb-0">{item.name}</h2>
                                </div>
                                <p className="mb-3">{item.blurb}</p>
                            </div>
                        );

                        const left = idx % 2 === 0 ? modelCol : textCol;
                        const right = idx % 2 === 0 ? textCol : modelCol;

                        return (
                            <div key={item.id} className="row g-4 align-items-center">
                                {left}
                                {right}
                            </div>
                        );
                    })}
                </div>
            )}

            <ChampionModal open={isOpen} onClose={closeModal} item={selected} />
        </div>
    );
}

function FitCamera({ object, controlsRef, overrides }) {
    const { camera, size } = useThree();

    useEffect(() => {
        if (!object) return;

        // FOV override éventuel
        if (overrides?.fov != null) {
            camera.fov = overrides.fov;
            camera.updateProjectionMatrix();
        }

        // ---- Auto-fit ----
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        const sizeV = box.getSize(new THREE.Vector3());
        const maxSize = Math.max(sizeV.x, sizeV.y, sizeV.z);

        const fitH = maxSize / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)));
        const fitW = fitH / (size.width / size.height);

        // marge & zoomOut personnalisables
        const margin  = overrides?.margin  ?? 1.35;   // >1 = dézoome un peu
        const zoomOut = overrides?.zoomOut ?? 1.0;    // >1 = dézoome plus
        const distance = margin * zoomOut * Math.max(fitH, fitW);

        const dir = new THREE.Vector3(0, 0.2, 1).normalize();
        const autoPos = center.clone().add(dir.multiplyScalar(distance));

        // ---- Merge overrides ----
        let finalPos    = overrides?.position ? new THREE.Vector3().fromArray(overrides.position) : autoPos;
        const finalTgt  = overrides?.target   ? new THREE.Vector3().fromArray(overrides.target)   : center;

        // reculer encore le long de l'axe vue->cible si demandé
        if (overrides?.back) {
            const v = new THREE.Vector3().subVectors(finalPos, finalTgt).normalize();
            finalPos = finalPos.add(v.multiplyScalar(overrides.back));
        }

        camera.position.copy(finalPos);
        controlsRef.current?.target.copy(finalTgt);
        controlsRef.current?.update?.();
        camera.lookAt(finalTgt);
        camera.updateProjectionMatrix();
    }, [object, camera, size, controlsRef, overrides]);

    return null;
}
