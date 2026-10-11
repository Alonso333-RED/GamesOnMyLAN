import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

function Modal({ label, onClose, children }) {
    useEffect(() => {
        const handleKey = (event) => {
            if (event.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    return createPortal(
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal-box"
                role="dialog"
                aria-modal="true"
                aria-label={label}
                onClick={(event) => event.stopPropagation()}
            >
                <button className="modal-close" type="button" aria-label="Cerrar" onClick={onClose} autoFocus>
                    ×
                </button>
                {children}
            </div>
        </div>,
        document.body,
    );
}

export default Modal;
