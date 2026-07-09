const express = require('express');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { reportHistorySchema, insightSchema } = require('../validators/schemas');
const {
  getProfile,
  getLatestReport,
  getReportHistory,
  getTrends,
  generateHealthInsight,
  getInsights,
} = require('../controllers/user.controller');

const router = express.Router();

// All user routes require an authenticated USER (or ADMIN acting as one).
router.use(authenticate, authorize('USER', 'ADMIN'));

router.get('/profile', getProfile);
router.get('/reports/latest', getLatestReport);
router.get('/reports', validate(reportHistorySchema), getReportHistory);
router.get('/trends', getTrends);
router.post('/insights', validate(insightSchema), generateHealthInsight);
router.get('/insights', getInsights);

module.exports = router;
