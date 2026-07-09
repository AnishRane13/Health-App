/**
 * Prisma Client singleton.
 *
 * Prisma 7 removed the bundled Rust query engine, so the client now talks to
 * Postgres through a driver adapter. We use the `pg` adapter, which is the
 * right call for Render (a long-lived Node process) and works cleanly with
 * Neon's pooled connection string.
 */
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Check your environment variables.');
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
});

module.exports = prisma;
