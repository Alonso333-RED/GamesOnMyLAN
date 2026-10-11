import { Link } from 'react-router-dom';
import ConsoleCard from '../components/ConsoleCard';
import StepRail from '../components/StepRail';

const STEPS = [
    { href: '#paso-1', label: '1. Requisitos' },
    { href: '#paso-2', label: '2. Archivo .env' },
    { href: '#paso-3', label: '3. Arrancar' },
    { href: '#paso-4', label: '4. Uso diario' },
    { href: '#paso-5', label: '5. Consideraciones' },
    { href: '#paso-6', label: '6. Backup' },
    { href: '#paso-7', label: '7. Restaurar' },
    { href: '#paso-8', label: '8. Cambiar de modo' },
    { href: '#paso-9', label: '9. Empezar de cero' },
];

function Docker() {
    return (
        <>
            <p className="page-kicker">Docker</p>

            <h1 className="text-secondary">GOML con Docker</h1>

            <p className="text-tertiary lead-copy">
                GOML se puede usar de dos formas:
                {' '}
                <strong>sin Docker</strong>
                {' '}
                (PostgreSQL, Node.js y OpenSSL instalados en tu equipo, ver
                {' '}
                <Link to="/installation">Instalación</Link>
                ) o
                {' '}
                <strong>con Docker</strong>
                , donde todo viene empaquetado y solo necesitas Docker. Esta página explica la
                segunda. Copia cada bloque y síguelos en orden.
            </p>

            <StepRail steps={STEPS} />

            <ConsoleCard id={1} step={1}>
                <h3>
                    <span className="step-badge">1</span>
                    Verificar Docker
                </h3>
                <p>
                    Necesitas Docker Engine y el plugin Compose. No hace falta instalar Node.js,
                    PostgreSQL ni OpenSSL en tu equipo: todo eso va dentro de los contenedores.
                    Si no tienes Docker, sigue la guía oficial en
                    docs.docker.com/engine/install.
                </p>
                <div className="console">
                    <code>docker --version</code>
                    <code>docker compose version</code>
                    <output>Ambos comandos deben mostrar una versión.</output>
                </div>
            </ConsoleCard>

            <ConsoleCard id={2} step={2}>
                <h3>
                    <span className="step-badge">2</span>
                    Crear el archivo .env
                </h3>
                <p>
                    Toda la configuración se hace en un archivo .env en la raíz del proyecto
                    (donde está docker-compose.yml). Parte desde la plantilla y ajusta estos
                    valores:
                    {' '}
                    <strong>HOST_IP</strong>
                    {' '}
                    (la IP de tu equipo en la red, sale con hostname -I),
                    {' '}
                    <strong>DB_PASSWORD</strong>
                    {' '}
                    (elígela ahora, antes del primer arranque) y
                    {' '}
                    <strong>OWNER_USER</strong>
                    {' '}
                    /
                    {' '}
                    <strong>OWNER_PASSWORD</strong>
                    .
                    {' '}
                    <div className="console">
                        <code>cp .env.example .env</code>
                        <code>hostname -I</code>
                        <code>nano .env</code>
                        <output>192.168.1.50</output>
                    </div>
                </p>
            </ConsoleCard>

            <ConsoleCard id={3} step={3}>
                <h3>
                    <span className="step-badge">3</span>
                    Construir y arrancar
                </h3>
                <p>
                    La primera vez Docker construye la imagen de GOML (tarda unos minutos). Al
                    arrancar, el contenedor crea las tablas, crea el propietario si la base está
                    vacía y genera el certificado HTTPS con tu HOST_IP. Después abre en el
                    navegador https://TU_IP:3000. El navegador avisará que el certificado no es
                    de confianza porque es autofirmado; es lo esperado en una LAN.
                </p>
                <div className="console">
                    <code>docker compose up -d --build</code>
                    <code>docker compose ps</code>
                    <code>docker compose logs -f goml</code>
                    <output>
                        ✓ Estructura de la base de datos lista.
                        <br />
                        ✓ Propietario "admin" creado.
                    </output>
                </div>
            </ConsoleCard>

            <ConsoleCard id={4} step={4}>
                <h3>
                    <span className="step-badge">4</span>
                    Uso diario y actualizaciones
                </h3>
                <p>
                    Estos son los comandos de todos los días. Detener o reiniciar no borra nada.
                    Para actualizar GOML a una versión nueva del código, descárgala y
                    reconstruye la imagen: tus datos se conservan porque viven en volúmenes
                    aparte.
                </p>
                <div className="console">
                    <code>docker compose stop</code>
                    <code>docker compose start</code>
                    <code>docker compose restart goml</code>
                    <code>docker compose down</code>
                    <code>git pull</code>
                    <code>docker compose up -d --build</code>
                    <output>
                        down quita los contenedores pero conserva los datos. Con down -v se
                        borran (ver paso 9).
                    </output>
                </div>
            </ConsoleCard>

            <ConsoleCard id={5} label="Consideraciones · paso 5" showCopy={false}>
                <h3>
                    <span className="step-badge">5</span>
                    Cosas que debes saber
                </h3>
                <ul className="text-tertiary">
                    <li>
                        <strong>Dónde están tus datos:</strong>
                        {' '}
                        en tres volúmenes de Docker:
                        {' '}
                        <code>pgdata</code>
                        {' '}
                        (base de datos),
                        {' '}
                        <code>gomldata</code>
                        {' '}
                        (juegos, avatares y clave de sesión) y
                        {' '}
                        <code>gomlcerts</code>
                        {' '}
                        (certificados). No los toques a mano: usa el backup del paso 6.
                    </li>
                    <li>
                        <strong>
                            Cuidado con
                            {' '}
                            <code>docker compose down -v</code>
                        </strong>
                        : la opción -v borra los volúmenes y con ellos toda tu base de datos y
                        tus juegos. Úsala solo si quieres empezar de cero (ver paso 9), y
                        siempre después de hacer un backup.
                    </li>
                    <li>
                        <strong>DB_PASSWORD se fija en el primer arranque.</strong>
                        {' '}
                        Si después editas el .env, la base ya creada conserva la contraseña
                        antigua y GOML no podrá conectarse.
                    </li>
                    <li>
                        <strong>OWNER_USER y OWNER_PASSWORD</strong>
                        {' '}
                        solo se usan si la base no tiene usuarios. Cuando restauras un backup,
                        el propietario viene dentro del backup.
                    </li>
                    <li>
                        <strong>Si cambia la IP de tu equipo:</strong>
                        {' '}
                        el certificado solo se genera una vez. Actualiza HOST_IP en el .env,
                        borra el volumen de certificados y vuelve a arrancar:
                        {' '}
                        <code>docker compose down</code>
                        , luego
                        {' '}
                        <code>docker volume ls</code>
                        {' '}
                        para ver el nombre (termina en gomlcerts),
                        {' '}
                        <code>docker volume rm NOMBRE</code>
                        {' '}
                        y
                        {' '}
                        <code>docker compose up -d</code>
                        .
                    </li>
                    <li>
                        <strong>Puertos:</strong>
                        {' '}
                        se publican APP_PORT (3000) y GAMES_PORT (3001). Si usas firewall,
                        permítelos, por ejemplo
                        {' '}
                        <code>sudo ufw allow 3000/tcp</code>
                        . La base de datos no se expone fuera de Docker.
                    </li>
                    <li>
                        <strong>No ejecutes las dos versiones a la vez</strong>
                        {' '}
                        (con y sin Docker) en el mismo equipo: usan los mismos puertos.
                    </li>
                    <li>
                        <strong>Inicio automático:</strong>
                        {' '}
                        los contenedores tienen
                        {' '}
                        <code>restart: unless-stopped</code>
                        , así que vuelven a levantar solos al reiniciar el equipo (mientras el
                        servicio Docker esté activo).
                    </li>
                    <li>
                        <strong>Acceder a la base:</strong>
                        {' '}
                        si necesitas entrar a PostgreSQL,
                        {' '}
                        <code>docker compose exec db psql -U goml -d goml_db</code>
                        {' '}
                        (usa el DB_USER y DB_DATABASE de tu .env).
                    </li>
                </ul>
            </ConsoleCard>

            <ConsoleCard id={6} step={6}>
                <h3>
                    <span className="step-badge">6</span>
                    Respaldar con Docker
                </h3>
                <p>
                    El respaldo sigue siendo el mismo de siempre: base de datos más carpeta
                    data. Se hace con GOML funcionando, desde la carpeta del proyecto. Los dos
                    archivos resultantes son todo lo que necesitas llevar a otro equipo. No hace
                    falta respaldar los certificados: se regeneran solos.
                </p>
                <div className="console">
                    <code>
                        docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d
                        "$POSTGRES_DB" -Fc --no-owner --no-acl' &gt; goml_db.dump
                    </code>
                    <code>
                        docker compose exec -T goml tar czf - -C /app data &gt;
                        data_backup.tar.gz
                    </code>
                    <output>
                        Se crean goml_db.dump y data_backup.tar.gz en la carpeta actual.
                    </output>
                </div>
            </ConsoleCard>

            <ConsoleCard id={7} step={7}>
                <h3>
                    <span className="step-badge">7</span>
                    Restaurar con Docker en otro equipo
                </h3>
                <p>
                    En el equipo destino necesitas Docker, el proyecto (docker-compose.yml y
                    .env con el HOST_IP de ese equipo) y los dos archivos del respaldo. Si no
                    clonaste el repositorio y llevas la imagen como archivo, primero cárgala con
                    docker load. El orden importa: la base se restaura
                    {' '}
                    <strong>antes</strong>
                    {' '}
                    de arrancar GOML, para que no cree un propietario nuevo.
                </p>
                <div className="console">
                    <code>docker compose up -d db</code>
                    <code>
                        docker compose exec -T db sh -c 'pg_restore -U "$POSTGRES_USER" -d
                        "$POSTGRES_DB" --no-owner'
                        {' '}
                        &lt;
                        {' '}
                        goml_db.dump
                    </code>
                    <code>docker compose create goml</code>
                    <code>
                        docker compose run --rm --no-deps -T --entrypoint tar goml xzf - -C /app
                        {' '}
                        &lt;
                        {' '}
                        data_backup.tar.gz
                    </code>
                    <code>docker compose up -d</code>
                    <output>
                        Abre https://TU_IP:3000 e inicia sesión con tus usuarios de siempre.
                    </output>
                </div>
            </ConsoleCard>

            <ConsoleCard id={8} step={8}>
                <h3>
                    <span className="step-badge">8</span>
                    Pasar de sin Docker a Docker
                </h3>
                <p>
                    El archivo .dump de la base es compatible entre ambos modos. Lo único que
                    cambia es la carpeta data: la
                    {' '}
                    <Link to="/backup-restore">guía de backup sin Docker</Link>
                    {' '}
                    la guarda en ZIP, y la restauración con Docker espera un .tar.gz.
                    Conviértela y sigue el paso 7 con tu goml_db.dump original.
                </p>
                <div className="console">
                    <code>unzip data_backup.zip</code>
                    <code>tar czf data_backup.tar.gz data</code>
                    <output>Ahora sigue el paso 7 con goml_db.dump y data_backup.tar.gz.</output>
                </div>
                <p>
                    <strong>En sentido contrario (Docker a sin Docker):</strong>
                    {' '}
                    extrae la carpeta data con tar xzf data_backup.tar.gz y colócala junto a
                    app.js. La base se restaura siguiendo los pasos de la guía de backup sin
                    Docker, usando el goml_db.dump generado en el paso 6.
                </p>
            </ConsoleCard>

            <ConsoleCard id={9} step={9}>
                <h3>
                    <span className="step-badge">9</span>
                    Empezar de cero
                </h3>
                <p>
                    Si quieres dejar GOML como recién instalado (sin usuarios, sin juegos y con
                    una base nueva), hay que borrar los volúmenes.
                    {' '}
                    <strong>Esto es irreversible</strong>
                    : se pierden la base de datos, los juegos, los avatares y los certificados.
                    Si hay algo que quieras conservar, haz antes el backup del paso 6.
                </p>
                <div className="console">
                    <code>docker compose down -v</code>
                    <code>docker compose up -d</code>
                    <code>docker compose logs -f goml</code>
                    <output>
                        ✓ Estructura de la base de datos lista.
                        <br />
                        ✓ Propietario "admin" creado.
                    </output>
                </div>
                <p>
                    El comando down -v detiene GOML y borra los tres volúmenes (pgdata, gomldata
                    y gomlcerts). Al volver a arrancar, GOML crea las tablas, genera un
                    certificado nuevo y crea el propietario con el OWNER_USER y OWNER_PASSWORD
                    de tu .env, así que revísalos antes. Como la base queda vacía, este también
                    es el momento en que puedes cambiar DB_PASSWORD en el .env y que funcione.
                </p>
                <p>
                    Si solo quieres borrar una parte, apaga con
                    {' '}
                    <strong>docker compose down</strong>
                    , mira los nombres con
                    {' '}
                    <strong>docker volume ls</strong>
                    {' '}
                    y borra únicamente el que necesites con
                    {' '}
                    <strong>docker volume rm NOMBRE</strong>
                    . Los nombres llevan el prefijo de la carpeta del proyecto y terminan en
                    pgdata, gomldata o gomlcerts. Ojo: borrar solo la base o solo data deja el
                    sistema inconsistente (juegos sin registro, o registros sin archivos). Para
                    empezar de cero, borra ambos.
                </p>
            </ConsoleCard>
        </>
    );
}

export default Docker;
