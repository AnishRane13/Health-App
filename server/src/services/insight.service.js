/**
 * Health insight generation.
 *
 * Design note: this is deliberately provider-agnostic. When ANTHROPIC_API_KEY
 * is set we call the Anthropic Messages API for a natural-language summary;
 * otherwise we fall back to a deterministic, rule-based explanation derived
 * from the flagged metrics. This keeps the AI feature demoable with zero cost
 * or network dependency, while leaving a clean seam to expand as the platform's
 * AI roadmap matures.
 */
const config = require('../config/env');

const STATUS_WORDS = {
  LOW: 'below the normal range',
  HIGH: 'above the normal range',
  CRITICAL: 'at a level that needs prompt attention',
  NORMAL: 'within the normal range',
  UNKNOWN: 'not measured',
};

function ruleBasedInsight(flags) {
  const abnormal = flags.filter((f) => ['LOW', 'HIGH', 'CRITICAL'].includes(f.status));

  if (abnormal.length === 0) {
    return 'All measured values in this report fall within their normal reference ranges. Keep up your current routine and stay hydrated.';
  }

  const lines = abnormal.map((f) => {
    const range = f.normalRange ? ` (normal: ${f.normalRange.min}\u2013${f.normalRange.max}${f.unit ? ' ' + f.unit : ''})` : '';
    return `\u2022 ${f.label} is ${f.value}${f.unit ? ' ' + f.unit : ''}, which is ${STATUS_WORDS[f.status]}${range}.`;
  });

  return [
    `This report has ${abnormal.length} metric(s) outside the normal range:`,
    ...lines,
    'This is an automated summary and not medical advice \u2014 please consult a doctor for interpretation.',
  ].join('\n');
}

async function anthropicInsight(report, flags) {
  const prompt = `You are a helpful health assistant. In 3-4 plain-language sentences, summarize this lab report for a non-medical user. Be reassuring but honest, and never give a diagnosis.\n\nMetrics:\n${flags
    .map((f) => `- ${f.label}: ${f.value ?? 'N/A'} ${f.unit || ''} (${f.status})`)
    .join('\n')}\n\nDoctor notes: ${report.doctorNotes || 'none'}`;

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': config.anthropicApiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-latest',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!resp.ok) {
    throw new Error(`Anthropic API error: ${resp.status}`);
  }
  const json = await resp.json();
  return json.content?.[0]?.text?.trim() || ruleBasedInsight(flags);
}

async function generateInsight({ report, flags }) {
  if (config.anthropicApiKey) {
    try {
      const content = await anthropicInsight(report, flags);
      return { content, source: 'anthropic' };
    } catch (err) {
      console.error('[insight] AI provider failed, falling back:', err.message);
    }
  }
  return { content: ruleBasedInsight(flags), source: 'rule-based' };
}

module.exports = { generateInsight, ruleBasedInsight };
