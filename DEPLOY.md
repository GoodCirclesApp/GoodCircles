# Good Circles — Deployment Guide (Beta)

## Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npm run prisma:generate

# 3. Run database migrations
npm run prisma:migrate

# 4. Seed beta test data (optional — creates test users)
npm run seed:beta

# 5. Start development server
npm run dev
```

Visit http://localhost:3000

---

## Deploy for Beta Testing

### Option A: Railway (Recommended — Free Tier Available)

1. Push code to GitHub
2. Connect Railway to your repo at https://railway.app
3. Railway auto-detects Node.js
4. Set environment variables in Railway dashboard:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=file:./prisma/dev.db
   JWT_SECRET=<generate with: openssl rand -hex 32>
   JWT_REFRESH_SECRET=<generate with: openssl rand -hex 32>
   JWT_EXPIRES_IN=1h
   ALLOWED_ORIGINS=https://your-app.railway.app
   ```
5. Set build command: `npm run build:deploy`
6. Set start command: `npm start`

### Option B: Render (Free Tier Available)

1. Push code to GitHub
2. Create a new Web Service at https://render.com
3. Set:
   - Build command: `npm install && npm run build:deploy`
   - Start command: `npm start`
4. Add the same env vars as above

### Option C: Any VPS (DigitalOcean, etc.)

```bash
# On your server:
git clone <your-repo> && cd good-circles
npm install
cp .env.example .env
# Edit .env with your real values
npm run build:deploy
npm run prisma:deploy    # Apply migrations without interactive prompt
npm run seed:beta        # Optional: seed test data
npm start
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | Yes | `development` or `production` |
| `DATABASE_URL` | Yes | SQLite: `file:./prisma/dev.db` |
| `JWT_SECRET` | Yes | 64-char hex string for signing tokens |
| `JWT_REFRESH_SECRET` | Yes | 64-char hex string for refresh tokens |
| `JWT_EXPIRES_IN` | No | Token expiry (default: 1h) |
| `ALLOWED_ORIGINS` | Prod | Comma-separated allowed CORS origins |
| `STRIPE_SECRET_KEY` | No* | Stripe secret key (for payments) |
| `STRIPE_WEBHOOK_SECRET` | No* | Stripe webhook signing secret |
| `GEMINI_API_KEY` | No | Google Gemini API key (for AI features) |

*Stripe keys are required for real payment processing. Beta works without them.

---

## Beta Test Accounts

After running `npm run seed:beta`, these accounts are available:

| Role | Email | Password |
|---|---|---|
| Admin | admin@goodcircles.com | BetaTest2026! |
| Merchant | merchant1@goodcircles.com | BetaTest2026! |
| Merchant | merchant2@goodcircles.com | BetaTest2026! |
| Merchant | merchant3@goodcircles.com | BetaTest2026! |
| Nonprofit | nonprofit1@goodcircles.com | BetaTest2026! |
| Nonprofit | nonprofit2@goodcircles.com | BetaTest2026! |
| Nonprofit | nonprofit3@goodcircles.com | BetaTest2026! |
| Consumer | consumer1@goodcircles.com | BetaTest2026! |

All accounts are pre-verified with $50 wallet balances.

---

## Production Readiness Checklist

Before going live (post-beta), you'll need:

- [ ] Migrate from SQLite to PostgreSQL
- [ ] Set up Stripe Connect with real API keys
- [ ] Configure a custom domain with SSL
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Enable email delivery (currently using EmailJS)
- [ ] Security audit (Prompt 7.4 in development plan)
- [ ] Load testing (Prompt 7.3 in development plan)
