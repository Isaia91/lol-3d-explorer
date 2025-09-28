// src/components/ChampionModal.jsx
import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function ChampionModal({ open, onClose, item }) {
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose?.();
        if (open) window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open || !item) return null;

    return createPortal(
        <>
            {/* Modal */}
            <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg position-relative">
                        {/* Bouton fermer */}
                        <button
                            type="button"
                            className="btn-close btn-close-black position-absolute top-0 end-0 m-3"
                            aria-label="Fermer"
                            onClick={onClose}
                            style={{ zIndex: 10 }}
                        />


                        {/* Carte façon "testimonial" */}
                        <div className="card testimonial-card mb-0 border-0">
                            <div className="card-up aqua-gradient" />
                            <div className="avatar mx-auto white">
                                <img src={item.icon} className="rounded-circle img-fluid" alt={item.name} />
                            </div>
                            <div className="card-body text-center">
                                <h4 className="card-title fw-bold mb-1">{item.name}</h4>
                                <div className="text-muted small mb-3">{item.id}</div>
                                <hr />
                                <p className="mb-0" style={{ textAlign: "justify", whiteSpace: "pre-wrap" }}>
                                    {item.champion}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Backdrop Bootstrap */}
            <div className="modal-backdrop fade show" onClick={onClose} />
        </>,
        document.body
    );
}
