#!/bin/sh
set -e

if [ "$PUBLIC_MODE" != "true" ] && [ -z "$HOST_IP" ]; then
  echo "ERROR: falta HOST_IP (la IP de tu máquina en la red, para el certificado HTTPS)." >&2
  exit 1
fi

node admin/bootstrap.js

if [ "$PUBLIC_MODE" != "true" ]; then
  node admin/cert.js
fi

exec node app.js