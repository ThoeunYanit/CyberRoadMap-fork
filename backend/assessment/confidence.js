function calculateConfidence(rankedCareers, skipRate) {
  if (rankedCareers.length < 2) return { score: 50, label: 'Medium' };

  const top1 = rankedCareers[0].score;
  const top2 = rankedCareers[1].score;

  if (top1 === 0) return { score: 0, label: 'Low' };

  const gap = top1 - top2;
  const gapRatio = gap / top1;
  const skipPenalty = skipRate * 40;
  const baseConfidence = Math.round(45 + gapRatio * 50);
  const finalScore = Math.max(10, Math.min(95, baseConfidence - skipPenalty));
  const rounded = Math.round(finalScore);

  let label = 'Low';
  if (rounded >= 70) label = 'High';
  else if (rounded >= 45) label = 'Medium';

  return { score: rounded, label };
}

module.exports = { calculateConfidence };