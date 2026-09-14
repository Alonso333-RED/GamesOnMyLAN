#!/bin/bash

set -e

# ==========================================
# GamesOnMyLAN - Backup
# ==========================================

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

SETTINGS_FILE="$(dirname "$0")/settings.json"
DATA_DIR="$ROOT_DIR/data"
BACKUP_DIR="$ROOT_DIR/backups"

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/goml-backup-$TIMESTAMP.zip"

# ==========================================
# Leer configuración
# ==========================================

if [ ! -f "$SETTINGS_FILE" ]; then
    echo "ERROR: No existe settings.json"
    exit 1
fi

get_setting() {
    node -e '
        const fs = require("fs");

        const file = process.argv[1];
        const key = process.argv[2];

        const settings = JSON.parse(
            fs.readFileSync(file, "utf8")
        );

        if (settings[key] === undefined) {
            process.exit(1);
        }

        process.stdout.write(String(settings[key]));
    ' "$SETTINGS_FILE" "$1"
}

DB_HOST=$(get_setting "db_host")
DB_PORT=$(get_setting "db_port")
DB_USER=$(get_setting "db_user")
DB_PASSWORD=$(get_setting "db_password")
DB_DATABASE=$(get_setting "db_database")

# ==========================================
# Comprobar dependencias
# ==========================================

if ! command -v pg_dump >/dev/null 2>&1; then
    echo "ERROR: pg_dump no está instalado."
    exit 1
fi

if ! command -v zip >/dev/null 2>&1; then
    echo "ERROR: zip no está instalado."
    exit 1
fi

if [ ! -d "$DATA_DIR" ]; then
    echo "ERROR: No existe la carpeta data/"
    exit 1
fi

mkdir -p "$BACKUP_DIR"

# ==========================================
# Información
# ==========================================

echo "=========================================="
echo " GamesOnMyLAN - Backup"
echo "=========================================="
echo ""
echo "Base de datos: $DB_DATABASE"
echo "Usuario:       $DB_USER"
echo "Host:          $DB_HOST:$DB_PORT"
echo ""

# ==========================================
# Crear directorio temporal
# ==========================================

TEMP_DIR=$(mktemp -d)

cleanup() {
    rm -rf "$TEMP_DIR"
}

trap cleanup EXIT

# ==========================================
# Backup PostgreSQL
# ==========================================

echo "[1/2] Creando backup de PostgreSQL..."

export PGPASSWORD="$DB_PASSWORD"

pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_DATABASE" \
    > "$TEMP_DIR/database.sql"

unset PGPASSWORD

echo "      ✓ Base de datos respaldada."

# ==========================================
# Crear ZIP
# ==========================================

echo "[2/2] Creando archivo ZIP..."

cd "$ROOT_DIR"

# Crear ZIP con data/
zip -r "$BACKUP_FILE" "data" > /dev/null

# Agregar database.sql sin conservar la ruta temporal
(
    cd "$TEMP_DIR"
    zip "$BACKUP_FILE" "database.sql" > /dev/null
)

# ==========================================
# Resultado
# ==========================================

echo ""
echo "=========================================="
echo " Backup completado"
echo "=========================================="
echo ""
echo "Archivo:"
echo "$BACKUP_FILE"
echo ""

SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

echo "Tamaño: $SIZE"
echo ""