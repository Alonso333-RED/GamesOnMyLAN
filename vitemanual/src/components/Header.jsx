import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const NAV_LINKS = [
    { to: '/', label: 'Inicio' },
    { to: '/requirements', label: 'Antes de instalar' },
    { to: '/installation', label: 'Instalación' },
    { to: '/solutions', label: 'Problemas' },
];

function Header() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className={`site-header${isOpen ? ' is-open' : ''}`}>
            <Link className="brand" to="/">
                <img src="/img/logo.png" alt="GamesOnMyLan Logo" className="logo" />
                <h1 className="brand-title">How To GamesOnMyLan</h1>
            </Link>

            <button
                className="nav-toggle"
                type="button"
                aria-expanded={isOpen}
                aria-controls="site-nav"
                onClick={() => setIsOpen((open) => !open)}
            >
                {isOpen ? 'Cerrar' : 'Menú'}
            </button>

            <nav id="site-nav" className="site-nav">
                {NAV_LINKS.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.to === '/'}
                        className={({ isActive }) => (isActive ? 'is-active' : undefined)}
                    >
                        {link.label}
                    </NavLink>
                ))}

                <a
                    href="https://github.com/Alonso333-RED/GamesOnMyLAN"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    GitHub
                </a>
            </nav>
        </header>
    );
}

export default Header;
