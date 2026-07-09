/**
 * Seed script — one-time bulk import of the provided healthcare dataset.
 *
 * Loads:
 *   - clients.csv          -> clients table (~5,000 rows)
 *   - health_reports.csv   -> health_reports table (~24,882 rows)
 *   - metric reference ranges (for abnormal-value flagging)
 *   - auth accounts: 1 admin + 1 login per client (shared demo password)
 *
 * The CSV parsing + validation logic here is intentionally simple and mirrors
 * what the admin "Upload CSV" endpoint reuses, so ingestion behaves identically
 * whether data comes from seeding or a live admin upload.
 *
 * Run: npm run seed
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { metricRanges } = require('./seed-metric-ranges');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required to run the seed script.');
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DATA_DIR = path.join(__dirname, '..', 'data');
const BATCH_SIZE = 1000;
const DEMO_USER_PASSWORD = 'password123';
const ADMIN_EMAIL = 'admin@healthapp.com';
const ADMIN_PASSWORD = 'admin123';

/**
 * Minimal CSV parser.
 * Safe here because the dataset has been verified to contain no quoted fields
 * or embedded commas (12 cols in clients, 11 in health_reports on every row).
 */
function parseCsv(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8').trim();
  const lines = raw.split(/\r?\n/);
  const headers = lines[0].split(',');
  return lines.slice(1).map((line) => {
    const values = line.split(',');
    const row = {};
    headers.forEach((h, i) => {
      row[h.trim()] = values[i] !== undefined ? values[i].trim() : '';
    });
    return row;
  });
}

const toInt = (v) => (v === '' || v == null ? null : parseInt(v, 10));
const toFloat = (v) => (v === '' || v == null ? null : parseFloat(v));
const toStr = (v) => (v === '' || v == null ? null : v);
const toDate = (v) => (v === '' || v == null ? null : new Date(v));

async function insertInBatches(label, rows, insertFn) {
  let done = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    await insertFn(batch);
    done += batch.length;
    process.stdout.write(`\r  ${label}: ${done}/${rows.length}`);
  }
  process.stdout.write('\n');
}

async function main() {
  console.log('Seeding started\n');

  // 1. Metric reference ranges -------------------------------------------------
  console.log('Seeding metric reference ranges...');
  for (const range of metricRanges) {
    await prisma.healthMetricRange.upsert({
      where: { metricKey: range.metricKey },
      update: range,
      create: range,
    });
  }
  console.log(`  ${metricRanges.length} ranges seeded\n`);

  // 2. Clients -----------------------------------------------------------------
  console.log('Loading clients.csv...');
  const clientRows = parseCsv(path.join(DATA_DIR, 'clients.csv')).map((r) => ({
    clientId: toInt(r.client_id),
    fullName: r.full_name,
    email: r.email,
    mobile: toStr(r.mobile),
    city: toStr(r.city),
    state: toStr(r.state),
    age: toInt(r.age),
    gender: toStr(r.gender),
    occupation: toStr(r.occupation),
    healthCondition: toStr(r.health_condition),
    beautyGoal: toStr(r.beauty_goal),
    createdAt: toDate(r.created_at) || new Date(),
  }));

  await insertInBatches('clients', clientRows, (batch) =>
    prisma.client.createMany({ data: batch, skipDuplicates: true })
  );
  console.log('');

  // 3. Health reports ----------------------------------------------------------
  console.log('Loading health_reports.csv...');
  const reportRows = parseCsv(path.join(DATA_DIR, 'health_reports.csv')).map((r) => ({
    reportId: r.report_id,
    clientId: toInt(r.client_id),
    reportDate: toDate(r.report_date) || new Date(),
    hemoglobin: toFloat(r.hemoglobin),
    vitaminD: toInt(r.vitamin_d),
    cholesterol: toInt(r.cholesterol),
    bloodSugarFasting: toInt(r.blood_sugar_fasting),
    creatinine: toFloat(r.creatinine),
    urineProtein: toStr(r.urine_protein),
    bmi: toFloat(r.bmi),
    doctorNotes: toStr(r.doctor_notes),
  }));

  await insertInBatches('health_reports', reportRows, (batch) =>
    prisma.healthReport.createMany({ data: batch, skipDuplicates: true })
  );
  console.log('');

  // 4. Auth accounts -----------------------------------------------------------
  // Single bcrypt hash reused across all demo users so any client email can log
  // in with the same known password. Fine for an assessment/demo; documented in
  // the technical decisions doc.
  console.log('Creating auth accounts...');
  const userHash = await bcrypt.hash(DEMO_USER_PASSWORD, 10);
  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: { email: ADMIN_EMAIL, passwordHash: adminHash, role: 'ADMIN' },
  });

  const clients = await prisma.client.findMany({ select: { clientId: true, email: true } });
  const userRows = clients.map((c) => ({
    email: c.email,
    passwordHash: userHash,
    role: 'USER',
    clientId: c.clientId,
  }));

  await insertInBatches('users', userRows, (batch) =>
    prisma.user.createMany({ data: batch, skipDuplicates: true })
  );
  console.log('');

  // Summary --------------------------------------------------------------------
  const [clientCount, reportCount, userCount] = await Promise.all([
    prisma.client.count(),
    prisma.healthReport.count(),
    prisma.user.count(),
  ]);

  console.log('\nSeeding complete');
  console.log('─────────────────────────────');
  console.log(`  clients:        ${clientCount}`);
  console.log(`  health_reports: ${reportCount}`);
  console.log(`  users:          ${userCount}`);
  console.log('─────────────────────────────');
  console.log('\nTest credentials:');
  console.log(`  Admin -> ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`  User  -> user1@example.com / ${DEMO_USER_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error('\nSeeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
