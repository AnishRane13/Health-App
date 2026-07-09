const express = require('express');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  listUsersSchema,
  clientIdParam,
  clientReportsSchema,
} = require('../validators/schemas');
const {
  listUsers,
  getUserDetail,
  getUserReports,
  uploadReportsCsv,
  getUploadLogs,
  getStats,
} = require('../controllers/admin.controller');

const router = express.Router();

// Every admin route is locked to the ADMIN role.
router.use(authenticate, authorize('ADMIN'));

router.get('/stats', getStats);
router.get('/users', validate(listUsersSchema), listUsers);
router.get('/users/:clientId', validate(clientIdParam), getUserDetail);
router.get('/users/:clientId/reports', validate(clientReportsSchema), getUserReports);
router.post('/upload', upload.single('file'), uploadReportsCsv);
router.get('/uploads', getUploadLogs);

module.exports = router;
