import { useState } from 'react';
import Modal from './Modal';
import './ImageZoom.css';

function ImageZoom({ src, alt, caption }) {
    const [modalAbierto, setModalAbierto] = useState(false);

    return (
        <>
            <button
                className="zoom-thumb"
                type="button"
                title="Ampliar imagen"
                onClick={() => setModalAbierto(true)}
            >
                <img src={src} alt={alt} loading="lazy" />
            </button>

            {modalAbierto && (
                <Modal label={alt} onClose={() => setModalAbierto(false)}>
                    <img src={src} alt={alt} />
                    {caption && <p className="modal-caption">{caption}</p>}
                </Modal>
            )}
        </>
    );
}

export default ImageZoom;
