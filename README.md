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

## Code Formatting

This project uses ESLint and Prettier for code formatting and linting.

### VS Code Setup

The project includes VS Code settings (`.vscode/settings.json`) that automatically:

- Format code on save using Prettier
- Fix ESLint issues on save

### Available Scripts

- `npm run lint` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run lint:fix` - Run both linting and formatting
- `npm run lint:check` - Check for linting issues without fixing

### Manual Formatting

To manually format all TypeScript files:

```bash
npm run format
```

To check for linting issues:

```bash
npm run lint:check
```

To fix both formatting and linting issues:

```bash
npm run lint:fix
```
