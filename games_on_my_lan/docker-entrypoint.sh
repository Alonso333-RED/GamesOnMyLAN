#!/bin/sh
set -e

if [ -z "$HOST_IP" ]; then
  echo "ERROR: falta HOST_IP (la IP de tu máquina en la red, para el certificado HTTPS)." >&2
  exit 1
fi

node admin/bootstrap.js
node admin/cert.js
exec node app.js