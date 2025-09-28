import { Link, NavLink, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Champions from "./pages/Champions";

export default function App() {
    return (
        <>
            <nav className="navbar navbar-expand bg-body-tertiary border-bottom">
                <div className="container">
                    <Link className="navbar-brand fw-semibold" to="/">LoL 3D Explorer</Link>
                    <div className="navbar-nav">
                        <NavLink className="nav-link" to="/champions">Champions</NavLink>
                    </div>
                </div>
            </nav>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/champions" element={<Champions />} />
                <Route path="*" element={<div className="container py-5">Page introuvable</div>} />
            </Routes>
        </>
    );
}
