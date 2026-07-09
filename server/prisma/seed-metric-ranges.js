/**
 * Reference ranges seeded after migration.
 * Used by API to flag abnormal values and color-code the user dashboard.
 */
const metricRanges = [
  {
    metricKey: 'hemoglobin',
    label: 'Hemoglobin',
    unit: 'g/dL',
    minNormal: 12.0,
    maxNormal: 17.5,
    minCritical: 7.0,
    maxCritical: 20.0,
    category: 'blood',
  },
  {
    metricKey: 'vitamin_d',
    label: 'Vitamin D',
    unit: 'ng/mL',
    minNormal: 30,
    maxNormal: 100,
    minCritical: 10,
    maxCritical: 150,
    category: 'vitamin',
  },
  {
    metricKey: 'cholesterol',
    label: 'Cholesterol',
    unit: 'mg/dL',
    minNormal: 0,
    maxNormal: 200,
    minCritical: null,
    maxCritical: 300,
    category: 'lipid',
  },
  {
    metricKey: 'blood_sugar_fasting',
    label: 'Fasting Blood Sugar',
    unit: 'mg/dL',
    minNormal: 70,
    maxNormal: 100,
    minCritical: 50,
    maxCritical: 200,
    category: 'glucose',
  },
  {
    metricKey: 'creatinine',
    label: 'Creatinine',
    unit: 'mg/dL',
    minNormal: 0.6,
    maxNormal: 1.2,
    minCritical: 0.3,
    maxCritical: 2.5,
    category: 'kidney',
  },
  {
    metricKey: 'bmi',
    label: 'BMI',
    unit: 'kg/m²',
    minNormal: 18.5,
    maxNormal: 24.9,
    minCritical: 16,
    maxCritical: 35,
    category: 'body',
  },
];

module.exports = { metricRanges };
