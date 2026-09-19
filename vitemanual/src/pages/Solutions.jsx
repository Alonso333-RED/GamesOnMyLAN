import ConsoleCard from '../components/ConsoleCard';

function Solutions() {
    return (
        <>
            <p className="page-kicker">Soporte</p>
            <h1 className="text-secondary">Problemas comunes y su solución</h1>
            <p className="text-tertiary lead-copy">
                Breve mención de problemas conocidos y sus respectivas soluciones. Usa Copiar para llevar el
                comando a la terminal.
            </p>

            <ConsoleCard>
                <h3>Error ENOENT / No such file or directory</h3>
                <p>
                    No se encontró el archivo settings.json. Esto ocurre cuando el archivo de configuración
                    aún no ha sido generado.
                </p>
                <div className="console">
                    <code>$ cd admin</code>
                    <code>$ node install.js</code>
                    <output>
                        Instalando GamesOnMyLAN...
                        <br />
                        settings.json generado correctamente.
                    </output>
                </div>
            </ConsoleCard>

            <ConsoleCard>
                <h3>No se encontraron los certificados HTTPS</h3>
                <p>
                    GamesOnMyLAN no puede iniciar porque no encuentra los certificados HTTPS. Esto ocurre
                    cuando los certificados aún no han sido generados o no se encuentran en la ubicación
                    esperada.
                </p>
                <div className="console">
                    <code>$ node admin/cert.js</code>
                    <output>
                        Generando certificados...
                        <br />
                        Certificados generados correctamente.
                    </output>
                </div>
            </ConsoleCard>

            <ConsoleCard>
                <h3>La carpeta certs no está en la raíz del proyecto</h3>
                <p>
                    Si los certificados fueron generados dentro de admin/certs, debes mover la carpeta certs
                    al directorio raíz de GamesOnMyLAN.
                </p>
                <div className="console">
                    <code>$ ls</code>
                    <output>Verifica que la carpeta certs aparezca en la raíz del proyecto.</output>
                    <code>$ mv admin/certs ./certs</code>
                    <output>La carpeta certs ahora se encuentra en la raíz del proyecto.</output>
                </div>
            </ConsoleCard>
        </>
    );
}

export default Solutions;
