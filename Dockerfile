FROM node:20-slim AS builder

# ✅ FIX: all packages inside RUN

RUN apt-get update && apt-get install -y \
  python3 \
  make \
  g++ \
  openssl \
  curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm install
RUN npx prisma generate

COPY . .

RUN npm run build
RUN npm prune --omit=dev

# ================= RUNNER =================

FROM node:20-slim

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
