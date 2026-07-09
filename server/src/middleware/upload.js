const multer = require('multer');
const ApiError = require('../utils/ApiError');

/**
 * In-memory CSV upload. Files stay in a buffer (never written to Render's
 * ephemeral disk) and are parsed straight into the database.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const isCsv =
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.originalname.toLowerCase().endsWith('.csv');
    if (!isCsv) return cb(ApiError.badRequest('Only .csv files are allowed'));
    cb(null, true);
  },
});

module.exports = upload;
