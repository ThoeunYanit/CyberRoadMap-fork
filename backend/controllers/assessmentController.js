require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/db');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─────────────────────────────────────────────
// TASK 1 — TRAIT SCORING
// ─────────────────────────────────────────────
function calculateTraits(answers) {
  const traits = {
    offensive: 0,
    defensive: 0,
    analytical: 0,
    research: 0,
    technical: 0,
    social: 0,
    structured: 0,
  };

  const mapping = {
    A: { research: 2, analytical: 1 },
    B: { offensive: 2, technical: 1 },
    C: { analytical: 2, structured: 1 },
    D: { defensive: 2, structured: 1 },
  };

  // Per-question overrides for more nuanced scoring
  const questionOverrides = {
    // Q1 - crime documentary
    0: { A: { research: 2, analytical: 1 }, B: { offensive: 2, technical: 1 }, C: { analytical: 2, structured: 1 }, D: { defensive: 2, structured: 1 } },
    // Q2 - hacked friend
    1: { A: { research: 2, analytical: 1 }, B: { offensive: 2, technical: 2 }, C: { analytical: 2, structured: 1 }, D: { defensive: 2, structured: 1 } },
    // Q3 - unlocked door
    2: { A: { research: 2, social: 1 }, B: { offensive: 3, social: 1 }, C: { analytical: 2, structured: 2 }, D: { defensive: 3, structured: 1 } },
    // Q4 - school subject
    3: { A: { research: 3, analytical: 1 }, B: { technical: 2, offensive: 1 }, C: { analytical: 3, structured: 1 }, D: { defensive: 2, structured: 2 } },
    // Q5 - detective type
    4: { A: { research: 3, analytical: 1 }, B: { offensive: 2, social: 2 }, C: { analytical: 3, technical: 1 }, D: { defensive: 3, structured: 1 } },
    // Q6 - party role
    5: { A: { research: 2, analytical: 1 }, B: { offensive: 1, social: 3 }, C: { structured: 3, analytical: 1 }, D: { defensive: 2, social: 1 } },
    // Q7 - mystery business
    6: { A: { research: 3, analytical: 1 }, B: { offensive: 2, social: 1 }, C: { analytical: 2, structured: 2 }, D: { defensive: 2, structured: 2 } },
    // Q8 - superpower
    7: { A: { research: 3, analytical: 1 }, B: { offensive: 3, technical: 1 }, C: { analytical: 3, structured: 1 }, D: { defensive: 3, structured: 1 } },
    // Q9 - video game
    8: { A: { research: 2, analytical: 2 }, B: { offensive: 3, technical: 1 }, C: { analytical: 3, structured: 1 }, D: { defensive: 2, structured: 2 } },
    // Q10 - books/movies
    9: { A: { research: 3, social: 1 }, B: { offensive: 2, technical: 2 }, C: { analytical: 3, structured: 1 }, D: { defensive: 2, structured: 2 } },
    // Q11 - unusual computer behavior
    10: { A: { research: 2, analytical: 1 }, B: { offensive: 2, technical: 2 }, C: { analytical: 3, technical: 1 }, D: { defensive: 3, structured: 1 } },
    // Q12 - job outside tech
    11: { A: { research: 3, social: 1 }, B: { offensive: 2, social: 2 }, C: { analytical: 3, structured: 1 }, D: { defensive: 3, structured: 2 } },
  };

  answers.forEach((a, i) => {
    const option = a.option || a.answer?.charAt(0).toUpperCase();
    const override = questionOverrides[i];
    const weights = (override && override[option]) || mapping[option];
    if (weights) {
      Object.entries(weights).forEach(([trait, value]) => {
        if (traits.hasOwnProperty(trait)) traits[trait] += value;
      });
    }
  });

  return traits;
}

// ─────────────────────────────────────────────
// TASK 2 — CAREER MATCHING
// ─────────────────────────────────────────────
const CAREER_PROFILES = {
  'Penetration Tester':              { offensive: 3, technical: 2, analytical: 1 },
  'Web Application Hacker':          { offensive: 3, technical: 3, analytical: 1 },
  'Exploit Developer':               { offensive: 3, technical: 3, analytical: 2 },
  'Red Team Operator':               { offensive: 3, analytical: 2, structured: 1 },
  'Social Engineer':                 { offensive: 2, social: 3, research: 1 },
  'OSINT Analyst':                   { research: 3, analytical: 2, technical: 1 },
  'Threat Intelligence Analyst':     { research: 2, analytical: 3, structured: 1 },
  'Malware Analyst':                 { analytical: 3, technical: 3, structured: 1 },
  'DFIR Analyst':                    { analytical: 3, defensive: 2, structured: 2 },
  'Digital Forensics Analyst':       { analytical: 3, structured: 3, technical: 1 },
  'SOC Analyst':                     { defensive: 3, analytical: 2, structured: 1 },
  'Cloud Security Engineer':         { defensive: 3, technical: 3, structured: 1 },
  'Security Engineer':               { defensive: 3, technical: 2, structured: 2 },
  'Vulnerability Management Analyst':{ defensive: 2, analytical: 2, structured: 2, technical: 1 },
  'GRC Analyst':                     { structured: 3, defensive: 2, analytical: 1 },
};

const CAREER_TEAMS = {
  'Penetration Tester': 'Red Team',
  'Web Application Hacker': 'Red Team',
  'Exploit Developer': 'Red Team',
  'Red Team Operator': 'Red Team',
  'Social Engineer': 'Red Team',
  'OSINT Analyst': 'Red Team',
  'Malware Analyst': 'Red Team',
  'Threat Intelligence Analyst': 'Blue Team',
  'DFIR Analyst': 'Blue Team',
  'Digital Forensics Analyst': 'Blue Team',
  'SOC Analyst': 'Blue Team',
  'Cloud Security Engineer': 'Blue Team',
  'Security Engineer': 'Blue Team',
  'Vulnerability Management Analyst': 'Blue Team',
  'GRC Analyst': 'Blue Team',
};

function matchCareers(traits) {
  const scored = Object.entries(CAREER_PROFILES).map(([career, weights]) => {
    const score = Object.entries(weights).reduce((sum, [trait, weight]) => {
      return sum + (traits[trait] || 0) * weight;
    }, 0);
    return { name: career, score, team: CAREER_TEAMS[career] };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3);
}

// ─────────────────────────────────────────────
// TASK 3 — CONFIDENCE SCORE
// ─────────────────────────────────────────────
function calculateConfidence(topCareers) {
  if (topCareers.length < 2) return 100;
  const top1 = topCareers[0].score;
  const top2 = topCareers[1].score;
  if (top1 === 0) return 0;
  // Gap ratio — bigger gap = higher confidence
  const gap = top1 - top2;
  const ratio = gap / top1;
  // Scale to 40–95% range (never claim 100% or too low)
  const confidence = Math.round(40 + ratio * 55);
  return Math.min(95, Math.max(40, confidence));
}

// ─────────────────────────────────────────────
// QUESTIONS
// ─────────────────────────────────────────────
exports.getQuestions = (req, res) => {
  db.query('SELECT * FROM questions ORDER BY order_index', (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    res.json({ success: true, questions: results });
  });
};

// ─────────────────────────────────────────────
// MAIN ANALYZE CONTROLLER
// ─────────────────────────────────────────────
exports.analyze = async (req, res) => {
  const { answers } = req.body;
  if (!answers || answers.length === 0)
    return res.status(400).json({ message: 'No answers provided' });

  try {
    // Step 1 — Calculate traits deterministically
    const traits = calculateTraits(answers);

    // Step 2 — Match careers deterministically
    const topCareers = matchCareers(traits);

    // Step 3 — Confidence score
    const confidence = calculateConfidence(topCareers);

    const recommended = topCareers[0];

    // Step 4 — Try AI explanation, fallback if quota exceeded
    let parsed = {
      recommended_path: recommended.name,
      team: recommended.team,
      reason: `Based on your answers, your personality strongly aligns with ${recommended.name}. Your dominant traits show you are naturally suited for this career path in cybersecurity.`,
      key_traits: Object.entries(traits).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t),
      alternatives: [topCareers[1]?.name, topCareers[2]?.name].filter(Boolean)
    };

    try {
      const explanationPrompt = `
You are a cybersecurity career counselor writing for a complete beginner.

Top career matches determined by algorithm:
1. ${topCareers[0].name}
2. ${topCareers[1]?.name}
3. ${topCareers[2]?.name}

Traits: ${JSON.stringify(traits)}
Confidence: ${confidence}%

Write explanation in simple beginner-friendly language. DO NOT use technical jargon.

Respond ONLY in this exact JSON format with no markdown:
{
  "recommended_path": "${recommended.name}",
  "team": "${recommended.team}",
  "reason": "2-3 simple sentences why this career matches their personality",
  "key_traits": ["trait1", "trait2", "trait3"],
  "alternatives": ["${topCareers[1]?.name}", "${topCareers[2]?.name}"]
}`;

      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const aiResult = await model.generateContent(explanationPrompt);
      const raw = aiResult.response.text().trim();
      const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      const aiParsed = JSON.parse(cleaned);

      // Force algorithm result — AI cannot override
      parsed = {
        ...aiParsed,
        recommended_path: recommended.name,
        team: recommended.team,
      };
    } catch (aiErr) {
      console.warn('AI explanation skipped:', aiErr.message);
      // Continue with fallback — deterministic result still works perfectly
    }

    // Step 5 — Save to DB
    db.query(
      `INSERT INTO recommendations (user_id, recommended_path, team, reason)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE recommended_path=?, team=?, reason=?, updated_at=NOW()`,
      [req.userId, parsed.recommended_path, parsed.team, parsed.reason,
       parsed.recommended_path, parsed.team, parsed.reason]
    );

    // Step 6 — Return full result
    res.json({
      success: true,
      result: {
        ...parsed,
        confidence,
        top_careers: topCareers,
        traits,
      }
    });

  } catch (err) {
    console.error('Analysis error:', err.message);
    res.status(500).json({ message: 'Analysis failed', error: err.message });
  }
};