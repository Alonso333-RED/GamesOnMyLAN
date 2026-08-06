import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";


const certFolder = path.join(
    process.cwd(),
    "certs"
);


const keyPath = path.join(
    certFolder,
    "server.key"
);


const certPath = path.join(
    certFolder,
    "server.crt"
);


// Crear carpeta
if (!fs.existsSync(certFolder)) {

    fs.mkdirSync(certFolder);

}


// Si ya existe, no hacer nada
if (
    fs.existsSync(keyPath) &&
    fs.existsSync(certPath)
) {

    console.log("Certificado existente.");

    process.exit();

}


// Obtener IP local
const interfaces = os.networkInterfaces();

let ip = null;


for (const name in interfaces) {

    for (const iface of interfaces[name]) {

        if (
            iface.family === "IPv4" &&
            !iface.internal
        ) {

            ip = iface.address;
            break;

        }

    }

}


if (!ip) {

    throw new Error(
        "No se encontró IP local"
    );

}


console.log(
    "Generando certificado para:",
    ip
);


// Crear configuración temporal
const config = `

[req]
default_bits = 4096
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = ext


[dn]
C = CL
O = GamesOnMyLAN
CN = ${ip}


[ext]
subjectAltName = IP:${ip},IP:127.0.0.1,DNS:localhost

`;


const configPath = path.join(
    certFolder,
    "openssl.cnf"
);


fs.writeFileSync(
    configPath,
    config
);


// Generar clave + certificado

execSync(
    `
    openssl req \
    -x509 \
    -newkey rsa:4096 \
    -nodes \
    -keyout ${keyPath} \
    -out ${certPath} \
    -days 365 \
    -sha256 \
    -config ${configPath}
    `,
    {
        stdio: "inherit"
    }
);


console.log(
    "Certificado creado correctamente."
);