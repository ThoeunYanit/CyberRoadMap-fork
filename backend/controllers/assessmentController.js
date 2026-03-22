require('dotenv').config();
const db = require('../config/db');
const { calculateTraits, getMode } = require('../assessment/scoring');
const { matchCareers } = require('../assessment/careers');
const { calculateConfidence } = require('../assessment/confidence');

function buildFallbackExplanation(recommended, traits, alternatives) {
  const topTraits = Object.entries(traits.normalized)
    .sort((a, b) => b[1] - a[1])
    .filter(([, v]) => v > 0)
    .slice(0, 3)
    .map(([t]) => t);

  const traitDescriptions = {
    offensive: 'you enjoy finding weaknesses and thinking like an attacker',
    defensive: 'you are naturally protective and want to keep systems safe',
    analytical: 'you love piecing together information and solving complex problems',
    research: 'you enjoy digging deep to find hidden information and patterns',
    social: 'you understand human behavior and communication very well',
    builder: 'you love creating systems and making things work reliably',
  };

  const descriptions = topTraits.map(t => traitDescriptions[t]).filter(Boolean);
  const reason = `Your personality shows that ${descriptions.join(', ')}. These traits are exactly what makes a great ${recommended.name}. This career path will let you use your natural strengths every day.`;

  return {
    reason,
    key_traits: topTraits,
    alternatives: alternatives.map(c => c.name),
  };
}

exports.getQuestions = (req, res) => {
  db.query('SELECT * FROM questions ORDER BY order_index', (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    res.json({ success: true, questions: results });
  });
};

exports.analyze = async (req, res) => {
  const { answers } = req.body;
  if (!answers || answers.length === 0)
    return res.status(400).json({ message: 'No answers provided' });

  // Step 1 — Calculate traits
  const traits = calculateTraits(answers);

  // Step 2 — Check mode
  const mode = getMode(traits.answered, traits.skipRate);

  if (mode === 'insufficient_data') {
    return res.json({
      success: true,
      result: {
        mode: 'insufficient_data',
        message: 'We need at least 5 answers to understand your preferences. Please answer a few more questions.',
        confidence_score: 0,
        confidence_label: 'Low',
      }
    });
  }

  // Step 3 — Match careers
  const ranked = matchCareers(traits.normalized);
  const recommended = ranked[0];
  const alternatives = ranked.slice(1, 3);

  // Step 4 — Confidence
  const { score: confidenceScore, label: confidenceLabel } = calculateConfidence(ranked, traits.skipRate);

  if (mode === 'exploration') {
    return res.json({
      success: true,
      result: {
        mode: 'exploration',
        message: "You are still exploring! Here are some beginner-friendly paths to start with.",
        suggestions: ['SOC Analyst', 'Security Engineer', 'OSINT Analyst'],
        recommended_path: recommended.name,
        team: recommended.team,
        confidence: confidenceScore,
        confidence_label: confidenceLabel,
        traits: traits.normalized,
      }
    });
  }

  // Step 5 — Build explanation
  let explanation = buildFallbackExplanation(recommended, traits, alternatives);

  try {
    if (process.env.GEMINI_API_KEY) {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const prompt = `
You are a cybersecurity career counselor for complete beginners.
The career has already been determined by an algorithm. Your ONLY job is to write a simple explanation.

Career: ${recommended.name} (${recommended.team})
Alternatives: ${alternatives.map(c => c.name).join(', ')}
Traits: ${JSON.stringify(traits.normalized)}
Confidence: ${confidenceScore}% ${confidenceLabel}

Rules: NO jargon. Write for someone who never studied cybersecurity. Be encouraging.

Respond ONLY in this JSON (no markdown):
{
  "reason": "2-3 simple sentences why this career matches their personality",
  "key_traits": ["3 personality words"],
  "alternatives": ["${alternatives[0]?.name}", "${alternatives[1]?.name}"]
}`;

      const aiResult = await model.generateContent(prompt);
      const raw = aiResult.response.text().trim().replace(/```json|```/g, '').trim();
      const aiParsed = JSON.parse(raw);
      explanation = aiParsed;
    }
  } catch (aiErr) {
    console.warn('AI unavailable, using fallback:', aiErr.message);
  }

  // Step 6 — Save to DB
  const answersJSON = JSON.stringify(answers);
  const traitsJSON = JSON.stringify(traits.normalized);
  const alternativesJSON = JSON.stringify(alternatives.map(c => c.name));

  db.query(
    `INSERT INTO assessments
      (user_id, answers, traits, recommended_path, alternatives, confidence_score, confidence_label, skipped_count, mode)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
      answers=?, traits=?, recommended_path=?, alternatives=?,
      confidence_score=?, confidence_label=?, skipped_count=?, mode=?, updated_at=NOW()`,
    [
      req.userId, answersJSON, traitsJSON, recommended.name, alternativesJSON,
      confidenceScore, confidenceLabel, traits.skipped, mode,
      answersJSON, traitsJSON, recommended.name, alternativesJSON,
      confidenceScore, confidenceLabel, traits.skipped, mode,
    ],
    (err) => { if (err) console.error('DB save error:', err.message); }
  );

  db.query(
    `INSERT INTO recommendations (user_id, recommended_path, team, reason)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE recommended_path=?, team=?, reason=?, updated_at=NOW()`,
    [req.userId, recommended.name, recommended.team, explanation.reason,
     recommended.name, recommended.team, explanation.reason]
  );

  // Step 7 — Return result
  res.json({
    success: true,
    result: {
      mode: 'normal',
      recommended_path: recommended.name,
      team: recommended.team,
      reason: explanation.reason,
      key_traits: explanation.key_traits,
      alternatives: explanation.alternatives,
      confidence: confidenceScore,
      confidence_label: confidenceLabel,
      top_careers: ranked.slice(0, 5),
      traits: traits.normalized,
      skipped: traits.skipped,
    }
  });
};