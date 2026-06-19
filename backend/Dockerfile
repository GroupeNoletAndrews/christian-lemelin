# ---------- build ----------
FROM node:20-alpine AS builder
# Prisma's engines need OpenSSL on Alpine/musl.
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
# postinstall runs `prisma generate` (needs the schema above)
RUN npm install
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build

# ---------- runtime ----------
FROM node:20-alpine AS runner
# Prisma's engines need OpenSSL on Alpine/musl.
RUN apk add --no-cache openssl
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm install --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
RUN mkdir -p uploads
EXPOSE 3001
# Apply committed migrations (safe for prod/Supabase), seed (idempotent), start API.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/seed.js && node dist/main.js"]
