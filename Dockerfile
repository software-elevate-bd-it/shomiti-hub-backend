FROM node:20-slim AS builder

RUN apt-get update && apt-get install -y \
    openssl \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# dependencies
COPY package*.json ./
RUN npm install

# source
COPY . .

# prisma
RUN npx prisma generate

# nest build
RUN npm run build

# production deps only
RUN npm prune --omit=dev


# ===== runtime =====
FROM node:20-slim

RUN apt-get update && apt-get install -y openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

ENV NODE_ENV=production

EXPOSE 4000

CMD sh -c "npx prisma db push && node prisma/seed.js && node dist/main"
# CMD sh -c "node prisma/seed.js"
