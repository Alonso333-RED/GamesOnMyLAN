import ConsoleCard from '../components/ConsoleCard';
import StepRail from '../components/StepRail';

const STEPS = [
    { href: '#paso-1', label: '1. PostgreSQL' },
    { href: '#paso-2', label: '2. npm' },
    { href: '#paso-3', label: '3. Usuario' },
    { href: '#paso-4', label: '4. Certificados' },
    { href: '#paso-5', label: '5. Carpeta certs' },
];

function Installation() {
    return (
        <>
            <p className="page-kicker">Instalación</p>
            <h1 className="text-secondary">Instalación del proyecto</h1>
            <p className="text-tertiary lead-copy">
                Pasos de cómo se debe configurar e instalar GOML. Copia cada bloque y síguelos en orden.
            </p>

            <StepRail steps={STEPS} />

            <ConsoleCard id={1} step={1}>
                <h3>
                    <span className="step-badge">1</span>Configuración de PostgreSQL
                </h3>
                <div className="console">
                    <code>$ sudo -u postgres psql</code>
                    <output>
                        postgres=# CREATE USER goml WITH PASSWORD &apos;goml_psw&apos;;<br />
                        CREATE ROLE
                    </output>
                    <code>postgres=# CREATE DATABASE goml_db OWNER goml;</code>
                    <output>CREATE DATABASE</output>
                </div>
            </ConsoleCard>

            <ConsoleCard id={2} step={2}>
                <h3>
                    <span className="step-badge">2</span>Instalar las dependencias con npm
                </h3>
                <div className="console">
                    <code>$ npm install</code>
                    <output>added 152 packages</output>
                </div>
            </ConsoleCard>

            <ConsoleCard id={3} step={3}>
                <h3>
                    <span className="step-badge">3</span>Crear el usuario propietario
                </h3>
                <div className="console">
                    <code>$ node admin/install.js</code>
                    <output>
                        Instalando GamesOnMyLAN...
                        <br />
                        Usuario propietario creado correctamente.
                    </output>
                </div>
            </ConsoleCard>

            <ConsoleCard id={4} step={4}>
                <h3>
                    <span className="step-badge">4</span>Generar los certificados HTTPS
                </h3>
                <div className="console">
                    <code>$ node admin/cert.js</code>
                    <output>
                        Generando certificados...
                        <br />
                        Certificados generados correctamente.
                    </output>
                </div>
            </ConsoleCard>

            <ConsoleCard id={5} step={5}>
                <h3>
                    <span className="step-badge">5</span>Mover la carpeta certs a la raíz del proyecto
                </h3>
                <div className="console">
                    <code>$ mv certs /ruta/al/proyecto/</code>
                    <output>
                        La carpeta certs debe quedar en la raíz del proyecto, al mismo nivel que app.js.
                    </output>
                </div>
            </ConsoleCard>
        </>
    );
}

export default Installation;
