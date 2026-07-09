const prisma = require('../lib/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { parseHealthReportsCsv } = require('../utils/ingest');
const { evaluateReport } = require('../utils/healthFlags');
const { insertManyBatched } = require('../utils/batchInsert');

/**
 * Paginated, filterable list of clients. Search hits the indexed columns
 * (full_name, city, state, health_condition, gender) so it stays fast at
 * dataset scale.
 */
const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, search, city, state, gender, healthCondition, sortBy, sortOrder } =
    req.valid.query;
  const skip = (page - 1) * limit;

  const where = {};
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { city: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (city) where.city = { equals: city, mode: 'insensitive' };
  if (state) where.state = { equals: state, mode: 'insensitive' };
  if (gender) where.gender = { equals: gender, mode: 'insensitive' };
  if (healthCondition) where.healthCondition = { equals: healthCondition, mode: 'insensitive' };

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
      include: { _count: { select: { healthReports: true } } },
    }),
    prisma.client.count({ where }),
  ]);

  res.json({
    success: true,
    data: clients.map((c) => ({ ...c, reportCount: c._count.healthReports })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

/** Single client with profile + latest report (flagged). */
const getUserDetail = asyncHandler(async (req, res) => {
  const { clientId } = req.valid.params;

  const client = await prisma.client.findUnique({
    where: { clientId },
    include: {
      _count: { select: { healthReports: true } },
      user: { select: { email: true, role: true, lastLoginAt: true } },
    },
  });
  if (!client) throw ApiError.notFound('Client not found');

  const [latest, ranges] = await Promise.all([
    prisma.healthReport.findFirst({
      where: { clientId },
      orderBy: { reportDate: 'desc' },
    }),
    prisma.healthMetricRange.findMany(),
  ]);

  const latestReport = latest ? { report: latest, ...evaluateReport(latest, ranges) } : null;

  res.json({
    success: true,
    data: { ...client, reportCount: client._count.healthReports, latestReport },
  });
});

/** Paginated reports for a specific client. */
const getUserReports = asyncHandler(async (req, res) => {
  const { clientId } = req.valid.params;
  const { page, limit } = req.valid.query;
  const skip = (page - 1) * limit;

  const client = await prisma.client.findUnique({ where: { clientId }, select: { clientId: true } });
  if (!client) throw ApiError.notFound('Client not found');

  const [reports, total] = await Promise.all([
    prisma.healthReport.findMany({
      where: { clientId },
      orderBy: { reportDate: 'desc' },
      skip,
      take: limit,
    }),
    prisma.healthReport.count({ where: { clientId } }),
  ]);

  res.json({
    success: true,
    data: reports,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

/**
 * Upload a health-report CSV. Reuses the same parse/validate logic as the seed
 * script (src/utils/ingest.js), rejects rows referencing unknown clients, and
 * writes an audit record to csv_upload_logs regardless of outcome.
 */
const uploadReportsCsv = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No CSV file uploaded (field name: "file")');

  const { rows, errors } = parseHealthReportsCsv(req.file.buffer);

  // Reject rows whose client_id does not exist (FK integrity).
  let validRows = rows;
  const rowErrors = [...errors];
  if (rows.length > 0) {
    const ids = [...new Set(rows.map((r) => r.clientId))];
    const existing = await prisma.client.findMany({
      where: { clientId: { in: ids } },
      select: { clientId: true },
    });
    const existingSet = new Set(existing.map((c) => c.clientId));
    validRows = rows.filter((r) => {
      if (!existingSet.has(r.clientId)) {
        rowErrors.push({ reportId: r.reportId, message: `Unknown client_id ${r.clientId}` });
        return false;
      }
      return true;
    });
  }

  let inserted = 0;
  if (validRows.length > 0) {
    inserted = await insertManyBatched(prisma, 'healthReport', validRows, 1000);
  }

  const totalRows = rows.length + errors.length;
  const skipped = totalRows - inserted;
  const status = inserted === 0 ? 'FAILED' : rowErrors.length > 0 ? 'PARTIAL' : 'SUCCESS';

  const log = await prisma.csvUploadLog.create({
    data: {
      uploadedById: req.user.id,
      filename: req.file.originalname,
      totalRows,
      insertedRows: inserted,
      skippedRows: skipped < 0 ? 0 : skipped,
      errorDetails: rowErrors.length > 0 ? rowErrors.slice(0, 50) : undefined,
      status,
    },
  });

  const httpStatus = status === 'FAILED' ? 422 : 201;
  res.status(httpStatus).json({
    success: status !== 'FAILED',
    data: {
      uploadId: log.id,
      status,
      totalRows,
      inserted,
      skipped: log.skippedRows,
      errors: rowErrors.slice(0, 50),
    },
  });
});

const getUploadLogs = asyncHandler(async (req, res) => {
  const logs = await prisma.csvUploadLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 25,
    include: { uploadedBy: { select: { email: true } } },
  });
  res.json({ success: true, data: logs });
});

/** Dashboard summary cards for the admin overview. */
const getStats = asyncHandler(async (req, res) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [totalClients, totalReports, reportsThisMonth, recentUploads] = await Promise.all([
    prisma.client.count(),
    prisma.healthReport.count(),
    prisma.healthReport.count({ where: { reportDate: { gte: startOfMonth } } }),
    prisma.csvUploadLog.count(),
  ]);

  res.json({
    success: true,
    data: { totalClients, totalReports, reportsThisMonth, totalUploads: recentUploads },
  });
});

module.exports = {
  listUsers,
  getUserDetail,
  getUserReports,
  uploadReportsCsv,
  getUploadLogs,
  getStats,
};
