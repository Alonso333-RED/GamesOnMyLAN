FROM node:22-bookworm-slim

# OpenSSL: lo necesita admin/cert.js para generar el certificado HTTPS
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
WORKDIR /app

# Primero solo los package*.json y las dependencias. Si cambias código pero no
# las dependencias, Docker reutiliza esta parte y reconstruir tarda segundos.
COPY package*.json ./
RUN npm ci --omit=dev

# Ahora sí, el código
COPY --chown=node:node . .

# Carpetas donde GOML escribe. Con dueño "node" para no correr como administrador.
RUN mkdir -p data temp certs && chown node:node data temp certs
USER node

EXPOSE 3000 3001

CMD ["sh", "docker-entrypoint.sh"]