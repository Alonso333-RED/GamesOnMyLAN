import { Link } from 'react-router-dom';
import ConsoleCard from '../components/ConsoleCard';
import StepRail from '../components/StepRail';

const STEPS = [
    { href: '#paso-1', label: '1. Qué necesitas' },
    { href: '#paso-2', label: '2. Caddyfile' },
    { href: '#paso-3', label: '3. Archivo .env' },
    { href: '#paso-4', label: '4. Construir y arrancar' },
    { href: '#paso-5', label: '5. Uso diario' },
    { href: '#paso-6', label: '6. Consideraciones' },
    { href: '#paso-7', label: '7. Volver a LAN' },
];

const COMPOSE = '-f docker-compose.yml -f docker-compose.public.yml';

function Public() {
    return (
        <>
            <p className="page-kicker">Avanzado</p>

            <h1 className="text-secondary">Publicar GOML en internet</h1>

            <p className="text-tertiary lead-copy">
                GOML funciona en dos modos con el mismo código: <strong>LAN</strong> (el de siempre:
                HTTPS propio con certificado autofirmado y puertos 3000 y 3001) y{' '}
                <strong>público</strong>, donde un proxy inverso (Caddy) se pone delante, consigue
                el certificado HTTPS real y GOML queda detrás hablando HTTP. El modo se elige al
                arrancar, no hace falta cambiar el código. Esta guía parte de que ya tienes GOML
                funcionando con Docker (ver <Link to="/docker">GOML con Docker</Link>).
            </p>

            <StepRail steps={STEPS} />

            <ConsoleCard id={1} label="Requisitos · paso 1" showCopy={false}>
                <h3>
                    <span className="step-badge">1</span>
                    Qué necesitas
                </h3>
                <ul className="text-tertiary">
                    <li>
                        <strong>Un servidor con IP pública</strong> (por ejemplo un VPS) con Docker
                        y Docker Compose 2.24 o superior. Un hosting compartido no sirve: GOML
                        necesita Node.js y PostgreSQL.
                    </li>
                    <li>
                        <strong>Un dominio</strong> con dos registros DNS de tipo A apuntando a la
                        IP del servidor: uno para GOML (por ejemplo{' '}
                        <code>goml.tudominio.cl</code>) y otro para los juegos (
                        <code>games.tudominio.cl</code>). Los juegos van en un subdominio aparte
                        para que el código que suben los usuarios quede aislado de tu sesión.
                    </li>
                    <li>
                        <strong>Puertos 80 y 443 abiertos</strong> en el firewall (y 22 para SSH).
                        Caddy usa el 80 para obtener el certificado de Let&apos;s Encrypt. No abras
                        el 3000 ni el 3001: en modo público solo se llega a GOML a través de Caddy.
                    </li>
                </ul>
                <div className="console">
                    <code>docker compose version</code>
                    <output>Debe ser la versión 2.24 o superior.</output>
                </div>
            </ConsoleCard>

            <ConsoleCard id={2} step={2}>
                <h3>
                    <span className="step-badge">2</span>
                    Configurar el Caddyfile
                </h3>
                <p>
                    En la raíz del proyecto hay un archivo <strong>Caddyfile</strong> y un{' '}
                    <strong>docker-compose.public.yml</strong>. El Caddyfile que viene en el
                    repositorio usa <code>goml.localhost</code> y sirve para probar en tu propio
                    equipo (el navegador avisará del certificado). Para internet, edítalo y
                    cambia los dos nombres por tus dominios:
                </p>
                <div className="console">
                    <code>nano Caddyfile</code>
                    <code>goml.tudominio.cl {'{'}</code>
                    <code style={{ paddingLeft: '1.5rem' }}>reverse_proxy goml:3000</code>
                    <code>{'}'}</code>
                    <code>games.tudominio.cl {'{'}</code>
                    <code style={{ paddingLeft: '1.5rem' }}>reverse_proxy goml:3001</code>
                    <code>{'}'}</code>
                    <output>
                        Caddy pide y renueva los certificados HTTPS solo, no hay que hacer nada más.
                    </output>
                </div>
            </ConsoleCard>

            <ConsoleCard id={3} step={3}>
                <h3>
                    <span className="step-badge">3</span>
                    Ajustar el archivo .env
                </h3>
                <p>
                    En el .env del servidor define la dirección pública de los juegos (sin barra
                    final y con https) y refuerza lo sensible. Aquí no hace falta HOST_IP.
                    {' '}
                    <strong>No pongas PUBLIC_MODE en el .env</strong>
                    : el modo público lo activa el archivo docker-compose.public.yml solo cuando
                    lo usas, así el mismo .env sigue sirviendo para LAN.
                </p>
                <div className="console">
                    <code>nano .env</code>
                    <output>
                        GAMES_ORIGIN=https://games.tudominio.cl
                        <br />
                        GUEST_REGISTER=false
                        <br />
                        DB_PASSWORD=una_clave_larga_y_unica
                        <br />
                        OWNER_PASSWORD=otra_clave_larga_y_unica
                    </output>
                </div>
                <p>
                    Con <strong>GUEST_REGISTER=false</strong> solo el propietario crea cuentas.
                    Recuerda que DB_PASSWORD se fija en el primer arranque (ver el paso 5 de{' '}
                    <Link to="/docker#paso-5">GOML con Docker</Link>).
                </p>
            </ConsoleCard>

            <ConsoleCard id={4} step={4}>
                <h3>
                    <span className="step-badge">4</span>
                    Construir y arrancar
                </h3>
                <p>
                    Primero se construye la imagen (solo la primera vez y cada vez que actualices
                    el código). Después se arranca con los <strong>dos archivos</strong> de
                    Compose: el normal más el público.
                </p>
                <div className="console">
                    <code>docker compose build</code>
                    <code>docker compose {COMPOSE} up -d</code>
                    <code>docker compose {COMPOSE} ps</code>
                    <code>docker compose {COMPOSE} logs -f caddy</code>
                    <output>
                        Abre https://goml.tudominio.cl. En los logs de Caddy verás cuándo obtiene el
                        certificado. El log de GOML dirá &quot;https://localhost:3000&quot; aunque
                        esté en HTTP: es solo el texto del mensaje.
                    </output>
                </div>
            </ConsoleCard>

            <ConsoleCard id={5} step={5}>
                <h3>
                    <span className="step-badge">5</span>
                    Uso diario en modo público
                </h3>
                <p>
                    Mientras estés en modo público, usa <strong>siempre los mismos dos -f</strong>{' '}
                    en up, down, stop, start y logs. Si haces un docker compose down sin ellos, el
                    contenedor de Caddy queda corriendo como &quot;huérfano&quot;. Los backups
                    (paso 6 de <Link to="/docker#paso-6">GOML con Docker</Link>) y docker compose
                    exec funcionan igual, sin cambios.
                </p>
                <div className="console">
                    <code>docker compose {COMPOSE} stop</code>
                    <code>docker compose {COMPOSE} start</code>
                    <code>docker compose {COMPOSE} restart goml</code>
                    <code>docker compose {COMPOSE} logs -f goml</code>
                    <code>docker compose {COMPOSE} down</code>
                    <output>
                        Para actualizar: git pull, docker compose build y de nuevo el up -d con los
                        dos archivos.
                    </output>
                </div>
            </ConsoleCard>

            <ConsoleCard id={6} label="Consideraciones · paso 6" showCopy={false}>
                <h3>
                    <span className="step-badge">6</span>
                    Cosas que debes saber
                </h3>
                <ul className="text-tertiary">
                    <li>
                        <strong>Cuidado al abrir el registro.</strong>
                        {' '}
                        Cada juego puede pesar hasta 1 GB: con GUEST_REGISTER=true cualquiera
                        podría llenarte el disco. Empieza con el registro cerrado y vigila el
                        espacio.
                    </li>
                    <li>
                        <strong>Las sesiones se guardan en memoria.</strong>
                        {' '}
                        Cada vez que reinicias el contenedor de GOML se cierran las sesiones y hay
                        que volver a iniciar sesión.
                    </li>
                    <li>
                        <strong>Haz backups</strong>
                        {' '}
                        de la base y de la carpeta data, y guárdalos fuera del servidor.
                    </li>
                    <li>
                        <strong>Más volúmenes:</strong>
                        {' '}
                        en modo público también existen <code>caddydata</code> y{' '}
                        <code>caddyconfig</code> (certificados y configuración de Caddy). Un{' '}
                        <code>down -v</code> los borra y Caddy tendría que pedir los certificados de
                        nuevo; Let&apos;s Encrypt limita las emisiones repetidas, así que evita
                        hacerlo muchas veces seguidas.
                    </li>
                    <li>
                        <strong>Si el certificado no se emite:</strong>
                        {' '}
                        revisa que los dos registros DNS apunten a la IP del servidor y que los
                        puertos 80 y 443 estén abiertos. Los logs de Caddy dicen la causa.
                    </li>
                    <li>
                        <strong>Probar sin dominio:</strong>
                        {' '}
                        con el Caddyfile original (goml.localhost) y{' '}
                        <code>GAMES_ORIGIN=https://games.goml.localhost</code> puedes probar el modo
                        público en tu propio equipo; el navegador avisará dos veces del certificado
                        (uno por cada nombre).
                    </li>
                </ul>
            </ConsoleCard>

            <ConsoleCard id={7} step={7}>
                <h3>
                    <span className="step-badge">7</span>
                    Volver al modo LAN
                </h3>
                <p>
                    Apaga el modo público con sus dos archivos y arranca normalmente. La base de
                    datos y los juegos se conservan, porque viven en los mismos volúmenes.
                </p>
                <div className="console">
                    <code>docker compose {COMPOSE} down</code>
                    <code>docker compose up -d</code>
                    <output>
                        En LAN vuelve a usarse HOST_IP y el certificado autofirmado (revisa que
                        esté en el .env).
                    </output>
                </div>
            </ConsoleCard>
        </>
    );
}

export default Public;
