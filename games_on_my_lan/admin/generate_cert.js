import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

const certFolder = path.join(process.cwd(), "certs");

const keyPath = path.join(certFolder, "server.key");
const certPath = path.join(certFolder, "server.crt");
const configPath = path.join(certFolder, "openssl.cnf");

// Crear carpeta
fs.mkdirSync(certFolder, { recursive: true });

// Si ya existen ambos archivos, no hacer nada
if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    console.log("Certificado existente.");
    process.exit(0);
}

// Buscar una IP IPv4 local
const interfaces = os.networkInterfaces();

let ip = null;

outer:
for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] ?? []) {
        if (
            iface.family === "IPv4" &&
            !iface.internal &&
            iface.address !== "127.0.0.1"
        ) {
            ip = iface.address;
            break outer;
        }
    }
}

if (!ip) {
    throw new Error("No se encontró una IP local.");
}

console.log("Generando certificado para:", ip);

// Configuración OpenSSL
const config = `
[req]
prompt = no
distinguished_name = dn
x509_extensions = ext

[dn]
C = CL
O = GamesOnMyLAN
CN = ${ip}

[ext]
subjectAltName = IP:${ip}, IP:127.0.0.1, DNS:localhost
`;

// Guardar configuración temporal
fs.writeFileSync(configPath, config, "utf8");

try {
    execFileSync(
        "openssl",
        [
            "req",
            "-x509",
            "-newkey",
            "rsa:4096",
            "-nodes",
            "-keyout",
            keyPath,
            "-out",
            certPath,
            "-days",
            "365",
            "-sha256",
            "-config",
            configPath,
        ],
        {
            stdio: "inherit",
        }
    );

    console.log("Certificado creado correctamente. recuerda mover la carpeta 'certs' a la raíz del proyecto si no está allí.");
} catch (error) {
    console.error("No se pudo generar el certificado.");
    console.error(
        "Asegúrate de que OpenSSL esté instalado y disponible en PATH."
    );

    process.exit(1);
}