function HorizontalCard({ img, alt, title, children }) {
    return (
        <article className="horizontal-card reveal">
            <div className="row align-items-center text-center text-md-start">
                <div className="col-12 col-md-3 mb-3 mb-md-0">
                    <img src={img} alt={alt} />
                </div>
                <div className="col-12 col-md-9">
                    <p className="card-title">{title}</p>
                    <p className="text-tertiary mb-0">{children}</p>
                </div>
            </div>
        </article>
    );
}

export default HorizontalCard;
