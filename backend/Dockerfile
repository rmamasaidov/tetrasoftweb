# Multistage Dockerfile for the Hono + grammY backend.
# better-sqlite3 is a native module — needs build toolchain in the build stage,
# then we copy the compiled output and runtime node_modules into a slim runtime.

# ---- 1) build (compile TS + install all deps incl native) ----
FROM node:22-alpine AS build
WORKDIR /app

# Toolchain required to compile better-sqlite3 native bindings on Alpine.
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Strip dev deps after compile so the runtime stage gets a slim node_modules.
RUN npm prune --omit=dev

# ---- 2) runtime (production) ----
FROM node:22-alpine AS runtime
WORKDIR /app

# Run as the unprivileged 'node' user that node:alpine ships with.
USER node

ENV NODE_ENV=production

COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health >/dev/null || exit 1

CMD ["node", "dist/index.js"]
