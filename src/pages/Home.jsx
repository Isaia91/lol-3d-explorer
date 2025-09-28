import SummonersGrid  from "../components/Summoners";

export default function Home() {
    return (
        <div
            style={{
                height: "100%",
                width: "100%",
                background: "radial-gradient(1200px 600px at 70% -10%, rgba(200,170,110,.15), transparent 60%), #0b1420",
                color: "#e6e6e6",
            }}
        >
        <div className="container">
            <div className="row">
                <header className="hero">
                    <div className="hero-inner container py-5 text-center">
                        <h1 className="display-4 fw-black text-uppercase">Entrez dans la Faille de l'invocateur</h1>
                        <div className="gold-sep my-4 mx-auto"></div>
                        <p className="lead mb-4">Choisissez votre champion, dominez votre voie et grimpez le ladder dans
                            le MOBA le plus joué au monde.</p>
                        <div className="d-flex flex-wrap justify-content-center gap-3">
                            <a href="#roles" className="btn btn-outline-light btn-lg">
                                <i className="bi bi-compass me-2"></i>
                                Découvrir les rôles
                            </a>
                            <a href="#summoners" className="btn btn-outline-light btn-lg">
                                <i className="bi bi-compass me-2"></i>
                                Découvrir les sort d'invocateurs
                            </a>
                        </div>
                    </div>
                </header>
            </div>
            <div className="row">
                <section id="roles" className="container py-5">
                    <h2 className="section-title h1 text-center">Choisissez votre rôle</h2>
                    <p className="text-center text-secondary">Chaque rôle a un impact unique sur la partie.</p>
                    <div className="row g-4 mt-2">
                        <div className="col-12 col-md-4 col-lg">
                            <div className="p-4 rounded-4 glass h-100">
                                <div className="feature-icon mb-3"><i className="bi bi-arrow-up-right"></i></div>
                                <h3 className="h5">Toplane</h3>
                                <p className="small text-secondary">Duelistes et tanks dominent la voie du haut, gérant
                                    split-push et téléportations.</p>
                                <span className="badge badge-role">Tank</span>
                                <span className="badge badge-role">Bruiser</span>
                            </div>
                        </div>
                        <div className="col-12 col-md-4 col-lg">
                            <div className="p-4 rounded-4 glass h-100">
                                <div className="feature-icon mb-3"><i className="bi bi-compass"></i></div>
                                <h3 className="h5">Jungle</h3>
                                <p className="small text-secondary">Contrôlez les objectifs neutres et influencez chaque
                                    voie avec des ganks décisifs.</p>
                                <span className="badge badge-role">Assassin</span>
                                <span className="badge badge-role">Support</span>
                            </div>
                        </div>
                        <div className="col-12 col-md-4 col-lg">
                            <div className="p-4 rounded-4 glass h-100">
                                <div className="feature-icon mb-3"><i className="bi bi-lightning"></i></div>
                                <h3 className="h5">Midlane</h3>
                                <p className="small text-secondary">Mages et assassins dictent le tempo avec une
                                    pression au centre de la carte.</p>
                                <span className="badge badge-role">Mage</span>
                                <span className="badge badge-role">Assassin</span>
                            </div>
                        </div>
                        <div className="col-12 col-md-6 col-lg">
                            <div className="p-4 rounded-4 glass h-100">
                                <div className="feature-icon mb-3"><i className="bi bi-bullseye"></i></div>
                                <h3 className="h5">ADC</h3>
                                <p className="small text-secondary">Infligez d'énormes dégâts continus en fin de partie,
                                    protégé par votre support.</p>
                                <span className="badge badge-role">Carry</span>
                                <span className="badge badge-role">Tireur</span>
                            </div>
                        </div>
                        <div className="col-12 col-md-6 col-lg">
                            <div className="p-4 rounded-4 glass h-100">
                                <div className="feature-icon mb-3"><i className="bi bi-heart-pulse"></i></div>
                                <h3 className="h5">Support</h3>
                                <p className="small text-secondary">Vision, peel et engage : vous faites la différence
                                    avec l'utilité et le contrôle.</p>
                                <span className="badge badge-role">Enchanteur</span>
                                <span className="badge badge-role">Engage</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <div className="row">
                <div className="row align-items-center g-4">
                    <div className="col-lg-5">
                        <h2 className="section-title h1">Mettez en avant vos champions</h2>
                        <p className="text-secondary">Un aperçu de quelques icônes de la Faille. Découvrez leurs
                            compétences et skins.</p>
                        <a className="btn btn-outline-light" href="#champions"><i className="bi bi-collection me-2"></i>Parcourir
                            la liste</a>
                    </div>
                    <div className="col-lg-7">
                        <div id="featuredCarousel" className="carousel slide rounded-4 overflow-hidden border"
                             data-bs-ride="carousel">
                            <div className="carousel-inner">
                                <div className="carousel-item active">
                                    <img src="https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Yasuo_0.jpg"
                                         className="d-block w-100" alt="Yasuo"/>
                                    <div className="carousel-caption">
                                        <h5>Yasuo — Le Disgracié</h5>
                                        <p>Assassin de vent pour midlane ou toplane.</p>
                                    </div>
                                </div>
                                <div className="carousel-item">
                                    <img src="https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Lux_0.jpg"
                                         className="d-block w-100" alt="Lux"/>
                                    <div className="carousel-caption">
                                        <h5>Lux — Dame de Lumière</h5>
                                        <p>Mage à longue portée, utilité et burst.</p>
                                    </div>
                                </div>
                                <div className="carousel-item">
                                    <img src="https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Garen_0.jpg"
                                         className="d-block w-100" alt="Garen"/>
                                    <div className="carousel-caption">
                                        <h5>Garen — La Puissance de Demacia</h5>
                                        <p>Bruiser/tank fiable pour toplane.</p>
                                    </div>
                                </div>
                            </div>
                            <button className="carousel-control-prev" type="button" data-bs-target="#featuredCarousel"
                                    data-bs-slide="prev">
                                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span className="visually-hidden">Précédent</span>
                            </button>
                            <button className="carousel-control-next" type="button" data-bs-target="#featuredCarousel"
                                    data-bs-slide="next">
                                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                <span className="visually-hidden">Suivant</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <section id="summoners" className="container py-5">
                    <h2 className="section-title h1 text-center">Sort d'invocateurs</h2>
                    <SummonersGrid ></SummonersGrid >
                </section>

            </div>
        </div>
        </div>
    );
}
