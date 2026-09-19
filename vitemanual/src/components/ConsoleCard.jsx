import { useRef, useState } from 'react';
import { copyText } from '../utils/clipboard';

function ConsoleCard({ id, step, label, showCopy = true, children }) {
    const articleRef = useRef(null);
    const [buttonLabel, setButtonLabel] = useState('Copiar');
    const [copied, setCopied] = useState(false);

    const title = label ?? (step ? `Terminal · paso ${step}` : 'Terminal');

    async function handleCopy() {
        const node = articleRef.current;
        const commands = node
            ? Array.from(node.querySelectorAll('code'))
                  .map((code) => code.textContent.trim())
                  .filter(Boolean)
                  .join('\n')
            : '';

        const success = await copyText(commands);
        setButtonLabel(success ? 'Copiado' : 'Selecciona el texto');
        setCopied(success);
        setTimeout(() => {
            setButtonLabel('Copiar');
            setCopied(false);
        }, 1400);
    }

    return (
        <article className="console-card reveal" id={id ? `paso-${id}` : undefined} ref={articleRef}>
            <div className="console-card-header">
                <span className="console-dot red" />
                <span className="console-dot yellow" />
                <span className="console-dot green" />
                <span className="console-title">{title}</span>
                {showCopy && (
                    <button
                        type="button"
                        className={`copy-btn${copied ? ' is-copied' : ''}`}
                        onClick={handleCopy}
                    >
                        {buttonLabel}
                    </button>
                )}
            </div>
            <div className="console-card-body">{children}</div>
        </article>
    );
}

export default ConsoleCard;
