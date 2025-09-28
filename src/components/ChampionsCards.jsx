export default function ChampionCard({ img, name, title }) {
    return (
        <div className="card h-100 shadow-sm">
            <div className="ratio ratio-4x3 bg-body-secondary d-grid place-items-center">
                <img src={img} alt={name} className="p-3 img-fluid object-fit-contain" />
            </div>
            <div className="card-body">
                <h5 className="card-title mb-1">{name}</h5>
                <p className="card-text text-body-secondary small mb-0">{title}</p>
            </div>
        </div>
    );
}
