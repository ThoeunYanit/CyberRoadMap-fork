const { TRAITS, QUESTION_TRAIT_MAP } = require('./traits');

const MIN_ANSWERED = 5;
const HIGH_SKIP_THRESHOLD = 0.4;

function calculateTraits(answers) {
  const raw = {};
  TRAITS.forEach(t => raw[t] = 0);

  let answered = 0;
  let skipped = 0;

  answers.forEach((a, i) => {
    const option = (a.option || '').toUpperCase();
    if (option === 'E' || !option) {
      skipped++;
      return;
    }
    const map = QUESTION_TRAIT_MAP[i];
    if (!map || !map[option]) {
      skipped++;
      return;
    }
    answered++;
    const weights = map[option];
    Object.entries(weights).forEach(([trait, value]) => {
      if (raw.hasOwnProperty(trait)) raw[trait] += value;
    });
  });

  const normalized = {};
  TRAITS.forEach(t => {
    normalized[t] = answered > 0 ? parseFloat((raw[t] / answered).toFixed(3)) : 0;
  });

  const skipRate = answers.length > 0 ? skipped / answers.length : 0;

  return { raw, normalized, answered, skipped, skipRate };
}

function getMode(answered, skipRate) {
  if (answered < MIN_ANSWERED) return 'insufficient_data';
  if (skipRate >= HIGH_SKIP_THRESHOLD) return 'exploration';
  return 'normal';
}

module.exports = { calculateTraits, getMode, MIN_ANSWERED, HIGH_SKIP_THRESHOLD };