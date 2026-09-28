# Imagen en dos etapas. La primera compila y deja node_modules limpio de
# herramientas de desarrollo; la segunda solo se lleva lo que se usa en
# ejecucion. bcrypt es un modulo nativo, asi que la etapa de compilacion
# necesita python3, make y g++, que en la final no estan.
FROM node:22-bookworm-slim AS base

WORKDIR /app
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
 && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
# npm ci exige que el package.json y el lock coincidan al byte, y aqui no
# coinciden, asi que da error. npm install resuelve igual sin esa exigencia.
RUN npm install --include=dev --no-audit --no-fund

COPY . .
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-bookworm-slim AS final

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY package.json ./

EXPOSE 8080
CMD ["node", "dist/main"]
