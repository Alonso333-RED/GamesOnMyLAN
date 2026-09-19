function RequirementCard({ img, alt, title, children, link, linkLabel = 'Sitio principal' }) {
    return (
        <article className="requirement-card reveal">
            <div className="row align-items-center text-center text-md-start">
                <div className="col-12 col-md-3 mb-3 mb-md-0">
                    <img
                        src={img}
                        alt={alt}
                        style={{ width: 150, height: 150, maxWidth: '100%', objectFit: 'contain' }}
                    />
                </div>
                <div className="col-12 col-md-7 mb-3 mb-md-0">
                    <p className="card-title">{title}</p>
                    <p className="text-tertiary mb-0">{children}</p>
                </div>
                <div className="col-12 col-md-2">
                    <a href={link} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                        {linkLabel}
                    </a>
                </div>
            </div>
        </article>
    );
}

export default RequirementCard;
