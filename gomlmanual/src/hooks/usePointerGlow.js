import { useEffect } from 'react';

export function usePointerGlow() {
    useEffect(() => {
        const moveGlow = (event) => {
            document.body.style.setProperty('--pointer-x', `${event.clientX}px`);
            document.body.style.setProperty('--pointer-y', `${event.clientY}px`);
        };

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return undefined;
        }

        window.addEventListener('pointermove', moveGlow, { passive: true });
        return () => window.removeEventListener('pointermove', moveGlow);
    }, []);
}
