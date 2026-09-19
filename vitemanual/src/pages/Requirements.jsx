import RequirementCard from '../components/RequirementCard';

function Requirements() {
    return (
        <>
            <p className="page-kicker">Antes de instalar</p>
            <h1 className="text-secondary">Requisitos técnicos y conocimientos previos</h1>
            <p className="text-tertiary lead-copy">
                Antes de intentar instalar GOML se necesita que conozcas y configures ciertas herramientas.
                Si bien no es necesario que seas un experto en ellas, sí es recomendable que tengas un
                conocimiento básico de su funcionamiento.
            </p>

            <RequirementCard img="/img/requirements/nodejs.webp" alt="Node JS" title="Node JS" link="https://nodejs.org/">
                Node.js es el entorno que permite ejecutar JavaScript en un servidor, y es lo que hace
                funcionar el backend de GamesOnMyLAN. Sin Node.js instalado, no es posible correr el
                proyecto, por lo que es el primer requisito a cumplir antes de la instalación.
            </RequirementCard>

            <RequirementCard
                img="/img/requirements/elephant.png"
                alt="PostgreSQL"
                title="PostgreSQL"
                link="https://www.postgresql.org/"
            >
                PostgreSQL es el sistema de base de datos donde GamesOnMyLAN guarda toda su información:
                usuarios, sesiones y datos de los juegos subidos. El servidor se conecta a esta base de datos
                para funcionar, por lo que sin PostgreSQL instalado y corriendo, GOML no tiene dónde
                almacenar ni leer esos datos.
            </RequirementCard>

            <RequirementCard
                img="/img/requirements/openssl.png"
                alt="OpenSSL"
                title="OpenSSL"
                link="https://www.openssl.org/"
            >
                OpenSSL es la herramienta que GamesOnMyLAN usa para generar el certificado y la llave que
                permiten que el servidor corra bajo HTTPS (conexión cifrada). En Linux normalmente ya viene
                instalado por defecto, pero en Windows es necesario descargarlo aparte antes de poder generar
                esos archivos e iniciar el servidor.
            </RequirementCard>
        </>
    );
}

export default Requirements;
