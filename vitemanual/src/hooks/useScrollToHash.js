import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Al navegar a una ruta con #ancla (ej. /docker#paso-6), baja hasta ese elemento.
export function useScrollToHash() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (!hash) return;
        const target = document.getElementById(decodeURIComponent(hash.slice(1)));
        if (target) target.scrollIntoView();
    }, [pathname, hash]);
}
