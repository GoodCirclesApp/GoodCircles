FROM node:22-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --include=dev
RUN npx playwright install chromium --with-deps

COPY . .

RUN npm run build

EXPOSE 3000

# Apply pending migrations (non-destructive), then start. '&&' fails CLOSED: if a
# migration fails, the server does NOT start on a half-changed schema. The baseline
# (0_init) is already marked applied in prod, so this is a no-op until a real migration ships.
CMD ["sh", "-c", "npx prisma migrate deploy && NODE_ENV=production node_modules/.bin/tsx server.ts"]
