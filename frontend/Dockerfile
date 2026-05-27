# Multistage Dockerfile for the Astro static frontend.
# Stage 1 (build): Node + npm to produce dist/.
# Stage 2 (serve): tiny Caddy image that serves dist/ over HTTP on :80.
# The public TLS-terminating Caddy (in the `caddy` service) reverse-proxies to this.

# ---- 1) build ----
FROM node:22-alpine AS build
WORKDIR /app

# Cache npm install layer: copy lockfiles first, install, then copy source.
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# ---- 2) serve ----
FROM caddy:2.11-alpine AS runtime

# A minimal Caddyfile for the in-container static server.
# The PUBLIC caddy (top-level service) handles TLS + routing; this internal
# caddy just serves files over plain HTTP inside the docker network.
COPY <<EOF /etc/caddy/Caddyfile
:80 {
    root * /usr/share/caddy
    encode gzip zstd
    try_files {path} {path}/ /index.html
    file_server

    # Aggressive caching for hashed assets, no caching for HTML.
    @hashed path_regexp ^/_astro/
    header @hashed Cache-Control "public, max-age=31536000, immutable"
    header /*.html Cache-Control "public, max-age=0, must-revalidate"
}
EOF

COPY --from=build /app/dist /usr/share/caddy

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
