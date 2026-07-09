/**
 * Shared health-report CSV ingestion logic.
 *
 * Intentionally the single source of truth for parsing + validating a
 * health-reports CSV, so an admin upload behaves identically to the initial
 * seed import. Expects the same column layout as the provided dataset:
 *   report_id, client_id, report_date, hemoglobin, vitamin_d, cholesterol,
 *   blood_sugar_fasting, creatinine, urine_protein, bmi, doctor_notes
 */
const { parse } = require('csv-parse/sync');

const REQUIRED_COLUMNS = ['report_id', 'client_id', 'report_date'];

const toInt = (v) => (v === '' || v == null ? null : parseInt(v, 10));
const toFloat = (v) => (v === '' || v == null ? null : parseFloat(v));
const toStr = (v) => (v === '' || v == null ? null : String(v).trim());

/**
 * Parse a CSV buffer/string into normalized report rows + per-row errors.
 * Does not touch the database — pure transformation, easy to unit-test.
 */
function parseHealthReportsCsv(input) {
  const records = parse(input, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  if (records.length === 0) {
    return { rows: [], errors: [{ row: 0, message: 'CSV is empty' }] };
  }

  const headers = Object.keys(records[0]);
  const missingCols = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
  if (missingCols.length > 0) {
    return {
      rows: [],
      errors: [{ row: 0, message: `Missing required columns: ${missingCols.join(', ')}` }],
    };
  }

  const rows = [];
  const errors = [];

  records.forEach((r, i) => {
    const lineNo = i + 2; // +1 header, +1 to 1-index
    const reportId = toStr(r.report_id);
    const clientId = toInt(r.client_id);
    const reportDate = r.report_date ? new Date(r.report_date) : null;

    if (!reportId) {
      errors.push({ row: lineNo, message: 'Missing report_id' });
      return;
    }
    if (clientId == null || Number.isNaN(clientId)) {
      errors.push({ row: lineNo, message: 'Invalid client_id' });
      return;
    }
    if (!reportDate || Number.isNaN(reportDate.getTime())) {
      errors.push({ row: lineNo, message: 'Invalid report_date' });
      return;
    }

    rows.push({
      reportId,
      clientId,
      reportDate,
      hemoglobin: toFloat(r.hemoglobin),
      vitaminD: toInt(r.vitamin_d),
      cholesterol: toInt(r.cholesterol),
      bloodSugarFasting: toInt(r.blood_sugar_fasting),
      creatinine: toFloat(r.creatinine),
      urineProtein: toStr(r.urine_protein),
      bmi: toFloat(r.bmi),
      doctorNotes: toStr(r.doctor_notes),
    });
  });

  return { rows, errors };
}

module.exports = { parseHealthReportsCsv, REQUIRED_COLUMNS };
