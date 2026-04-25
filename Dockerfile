FROM node:22-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --include=dev

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push --accept-data-loss --skip-generate; NODE_ENV=production node_modules/.bin/tsx server.ts"]
