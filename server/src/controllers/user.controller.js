const prisma = require('../lib/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { evaluateReport } = require('../utils/healthFlags');
const { generateInsight } = require('../services/insight.service');

/** Resolve the client id for the logged-in user (admins have none). */
function requireClientId(req) {
  const clientId = req.user.clientId;
  if (!clientId) {
    throw ApiError.forbidden('This account is not linked to a client health profile');
  }
  return clientId;
}

const getProfile = asyncHandler(async (req, res) => {
  const clientId = requireClientId(req);
  const client = await prisma.client.findUnique({ where: { clientId } });
  if (!client) throw ApiError.notFound('Client profile not found');
  res.json({ success: true, data: client });
});

const getLatestReport = asyncHandler(async (req, res) => {
  const clientId = requireClientId(req);

  const [report, ranges] = await Promise.all([
    prisma.healthReport.findFirst({
      where: { clientId },
      orderBy: { reportDate: 'desc' },
    }),
    prisma.healthMetricRange.findMany(),
  ]);

  if (!report) {
    return res.json({ success: true, data: null, message: 'No reports available yet' });
  }

  const { flags, abnormalCount } = evaluateReport(report, ranges);
  res.json({ success: true, data: { report, flags, abnormalCount } });
});

const getReportHistory = asyncHandler(async (req, res) => {
  const clientId = requireClientId(req);
  const { page, limit } = req.valid.query;
  const skip = (page - 1) * limit;

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

/** Time-series of key metrics for the dashboard trend chart. */
const getTrends = asyncHandler(async (req, res) => {
  const clientId = requireClientId(req);

  const reports = await prisma.healthReport.findMany({
    where: { clientId },
    orderBy: { reportDate: 'asc' },
    select: {
      reportDate: true,
      hemoglobin: true,
      cholesterol: true,
      bloodSugarFasting: true,
      bmi: true,
      vitaminD: true,
      creatinine: true,
    },
  });

  res.json({ success: true, data: reports });
});

/**
 * AI-assisted health insight for the user's latest (or a specified) report.
 * Foreshadows the platform's stated AI roadmap. Falls back to a deterministic,
 * rule-based summary when no AI provider key is configured, so the feature is
 * always functional in the demo.
 */
const generateHealthInsight = asyncHandler(async (req, res) => {
  const clientId = requireClientId(req);
  const { reportId } = req.valid.body;

  const report = reportId
    ? await prisma.healthReport.findFirst({ where: { reportId, clientId } })
    : await prisma.healthReport.findFirst({
        where: { clientId },
        orderBy: { reportDate: 'desc' },
      });

  if (!report) throw ApiError.notFound('No report found to analyze');

  const ranges = await prisma.healthMetricRange.findMany();
  const { flags, abnormalCount } = evaluateReport(report, ranges);

  const { content, source } = await generateInsight({ report, flags });

  const insight = await prisma.healthInsight.create({
    data: {
      clientId,
      reportId: report.reportId,
      generatedById: req.user.id,
      type: 'REPORT_SUMMARY',
      title: abnormalCount > 0 ? `${abnormalCount} metric(s) need attention` : 'Report looks healthy',
      content,
      metricsContext: { flags, source },
    },
  });

  res.status(201).json({ success: true, data: insight });
});

const getInsights = asyncHandler(async (req, res) => {
  const clientId = requireClientId(req);
  const insights = await prisma.healthInsight.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  res.json({ success: true, data: insights });
});

module.exports = {
  getProfile,
  getLatestReport,
  getReportHistory,
  getTrends,
  generateHealthInsight,
  getInsights,
};
