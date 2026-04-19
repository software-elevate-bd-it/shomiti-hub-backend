# SomiteeHQ Backend

NestJS backend for SomiteeHQ with Prisma, MySQL, Redis cache, rate limiting, and scheduled jobs.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Set `DATABASE_URL`, `JWT_SECRET`, and `REDIS_URL` in `.env`.

4. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

5. Run migrations:
   ```bash
   npm run prisma:migrate
   ```

6. Start development server:
   ```bash
   npm run start:dev
   ```
