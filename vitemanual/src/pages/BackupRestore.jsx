import ConsoleCard from '../components/ConsoleCard';
import StepRail from '../components/StepRail';

const STEPS = [
    { href: '#paso-1', label: '1. Base de datos' },
    { href: '#paso-2', label: '2. Carpeta data' },
    { href: '#paso-3', label: '3. Restaurar DB' },
    { href: '#paso-4', label: '4. Restaurar data' },
];

function BackupRestore() {
    return (
        <>
            <p className="page-kicker">Backup</p>
            <h1 className="text-secondary">Backup y restauración de GOML</h1>
            <p className="text-tertiary lead-copy">
                Para realizar un respaldo completo de GamesOnMyLAN debes guardar tanto la base de datos
                PostgreSQL como la carpeta <code>data/</code>, donde se almacenan los archivos de los juegos.
            </p>

            <StepRail steps={STEPS} />

            <ConsoleCard id={1} step={1}>
                <h3>
                    <span className="step-badge">1</span>Respaldar la base de datos
                </h3>
                <p>
                    El primer paso es crear un respaldo de la base de datos PostgreSQL. Para GOML se
                    recomienda utilizar el formato personalizado de PostgreSQL (<code>custom format</code>),
                    que genera un archivo <code>.dump</code>.
                </p>
                <p>Sitúate en la carpeta donde quieras guardar el respaldo y ejecuta el siguiente comando:</p>
                <div className="console">
                    <code>$ sudo -u postgres pg_dump -Fc --no-owner --no-acl -d goml_db &gt; goml_db.dump</code>
                    <output>Backup de la base de datos creado correctamente.</output>
                </div>
                <p>
                    Este comando crea <code>goml_db.dump</code> directamente en la carpeta actual. La
                    redirección <code>&gt;</code> es realizada por tu usuario actual, mientras que{' '}
                    <code>pg_dump</code> se ejecuta como el usuario de PostgreSQL <code>postgres</code>. Esto
                    permite guardar el archivo en una carpeta donde tu usuario tenga permisos de escritura.
                </p>
                <p>
                    El uso de <code>--no-owner</code> evita conservar la propiedad de los objetos de la
                    instalación original, mientras que <code>--no-acl</code> evita conservar sus listas de
                    control de acceso (<code>ACL</code>). Esto facilita restaurar el respaldo en otra
                    instalación de GOML con una configuración de PostgreSQL diferente.
                </p>
                <p>
                    El archivo <code>goml_db.dump</code> puede copiarse posteriormente a otra ubicación para
                    conservarlo como respaldo.
                </p>
                <p>
                    El respaldo no depende del nombre del usuario de PostgreSQL utilizado por la instalación
                    original. Por ejemplo, puede crearse en una instalación cuyo usuario sea{' '}
                    <code>goml</code> y restaurarse posteriormente en una instalación que utilice{' '}
                    <code>gomlusr</code>, <code>marta</code> u otro usuario de PostgreSQL.
                </p>
            </ConsoleCard>

            <ConsoleCard id={2} step={2}>
                <h3>
                    <span className="step-badge">2</span>Respaldar la carpeta data/
                </h3>
                <p>
                    La base de datos no contiene los archivos físicos de los juegos. Estos se encuentran
                    dentro de la carpeta <code>data/</code> del proyecto, por lo que también debe realizarse
                    un respaldo.
                </p>
                <p>Puedes crear el archivo ZIP desde la terminal con el siguiente comando:</p>
                <div className="console">
                    <code>$ zip -r data_backup.zip data/</code>
                    <output>Backup de la carpeta data creado correctamente.</output>
                </div>
                <p>
                    Esto genera el archivo <code>data_backup.zip</code>, que contiene la carpeta{' '}
                    <code>data/</code> y sus archivos.
                </p>
                <p>
                    También puedes realizar este proceso de forma gráfica desde el explorador de archivos de
                    tu sistema. Para ello, haz clic derecho sobre la carpeta <code>data/</code>, selecciona la
                    opción para comprimirla o crear un archivo ZIP y guarda el resultado como{' '}
                    <code>data_backup.zip</code>.
                </p>
            </ConsoleCard>

            <ConsoleCard id={3} step={3}>
                <h3>
                    <span className="step-badge">3</span>Restaurar la base de datos
                </h3>
                <p>
                    El archivo <code>goml_db.dump</code> fue creado utilizando el formato personalizado de
                    PostgreSQL (<code>custom format</code>). Por esta razón, para restaurarlo se utiliza{' '}
                    <code>pg_restore</code> y no <code>psql</code>.
                </p>
                <p>
                    Primero, crea nuevamente la base de datos si no existe. Debes utilizar como propietario el
                    usuario de PostgreSQL correspondiente a la instalación actual de GOML. Por ejemplo:
                </p>
                <div className="console">
                    <code>$ sudo -u postgres psql</code>
                    <output>postgres=# CREATE DATABASE goml_db OWNER gomlusr;</output>
                </div>
                <p>
                    El nombre <code>gomlusr</code> es solamente un ejemplo. Si tu instalación utiliza otro
                    usuario de PostgreSQL, reemplázalo por el usuario correspondiente.
                </p>
                <p>
                    Después, restaura el contenido del backup utilizando <code>pg_restore</code>. Los
                    parámetros <code>--no-owner</code> y <code>--no-acl</code> evitan restaurar la
                    información de propietario y permisos de la instalación original. El parámetro{' '}
                    <code>--role</code> indica el rol de PostgreSQL que se utilizará durante la restauración.
                </p>
                <div className="console">
                    <code>
                        $ sudo -u postgres pg_restore --no-owner --no-acl --role=gomlusr -d goml_db
                        goml_db.dump
                    </code>
                    <output>Base de datos restaurada correctamente.</output>
                </div>
                <p>
                    En este ejemplo, <code>gomlusr</code> es el usuario de PostgreSQL de la nueva instalación.
                    Si la nueva instalación utiliza otro usuario, debes sustituir <code>gomlusr</code> por el
                    usuario correspondiente.
                </p>
                <p>Por ejemplo, si la nueva instalación utiliza el usuario <code>marta</code>:</p>
                <div className="console">
                    <code>
                        $ sudo -u postgres pg_restore --no-owner --no-acl --role=marta -d goml_db
                        goml_db.dump
                    </code>
                    <output>Base de datos restaurada correctamente.</output>
                </div>
                <p>
                    De esta forma, el backup puede restaurarse en una instalación que utilice un usuario de
                    PostgreSQL diferente al de la instalación original.
                </p>
            </ConsoleCard>

            <ConsoleCard id={4} step={4}>
                <h3>
                    <span className="step-badge">4</span>Restaurar la carpeta data/
                </h3>
                <p>
                    Finalmente, restaura los archivos físicos de los juegos desde{' '}
                    <code>data_backup.zip</code>.
                </p>
                <div className="console">
                    <code>$ unzip data_backup.zip</code>
                    <output>Carpeta data restaurada correctamente.</output>
                </div>
                <p>
                    También puedes extraer el archivo ZIP utilizando el explorador de archivos de tu sistema.
                    Haz clic derecho sobre <code>data_backup.zip</code> y selecciona la opción para extraer o
                    descomprimir el archivo.
                </p>
                <p>
                    La carpeta <code>data/</code> debe quedar nuevamente en la raíz del proyecto, al mismo
                    nivel que <code>app.js</code>.
                </p>
            </ConsoleCard>

            <ConsoleCard label="Resumen" showCopy={false}>
                <h3>Backup completo de GOML</h3>
                <p>Para poder recuperar completamente una instalación de GamesOnMyLAN, conserva ambos archivos:</p>
                <div className="console">
                    <code>goml_db.dump</code>
                    <code>data_backup.zip</code>
                </div>
                <p>
                    El archivo <code>goml_db.dump</code> contiene la estructura y los datos de PostgreSQL,
                    mientras que <code>data_backup.zip</code> contiene los archivos físicos almacenados por
                    GOML.
                </p>
                <p>
                    El respaldo de la base de datos está diseñado para facilitar su restauración en otra
                    instalación de GOML, incluso cuando el usuario de PostgreSQL sea diferente. Los parámetros{' '}
                    <code>--no-owner</code> y <code>--no-acl</code> evitan conservar la información de
                    propiedad y permisos de la instalación original, mientras que durante la restauración{' '}
                    <code>--role</code> permite indicar el rol utilizado para realizar la operación.
                </p>
                <p>
                    Por ejemplo, un backup creado en una instalación cuyo usuario sea <code>goml</code> puede
                    restaurarse en otra instalación cuyo usuario sea <code>gomlusr</code> o{' '}
                    <code>marta</code>, sin necesidad de conservar el usuario original.
                </p>
            </ConsoleCard>
        </>
    );
}

export default BackupRestore;
