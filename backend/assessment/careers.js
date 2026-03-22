const CAREER_PROFILES = {
  'SOC Analyst':                    { defensive: 0.9, analytical: 0.8, builder: 0.3 },
  'DFIR Analyst':                   { analytical: 0.9, defensive: 0.7, research: 0.5 },
  'Threat Intelligence Analyst':    { research: 0.8, analytical: 0.9, defensive: 0.4 },
  'Cloud Security Engineer':        { builder: 0.9, defensive: 0.8, analytical: 0.5 },
  'GRC Analyst':                    { builder: 0.8, defensive: 0.7, analytical: 0.5 },
  'Vulnerability Analyst':          { analytical: 0.7, defensive: 0.8, builder: 0.5 },
  'Security Engineer':              { builder: 0.9, defensive: 0.7, analytical: 0.4 },
  'Digital Forensics Analyst':      { analytical: 0.9, research: 0.6, defensive: 0.5 },
  'Penetration Tester':             { offensive: 0.9, analytical: 0.7, research: 0.5 },
  'OSINT Analyst':                  { research: 0.9, analytical: 0.7, social: 0.4 },
  'Malware Analyst':                { analytical: 0.9, offensive: 0.5, research: 0.6 },
  'Web Application Hacker':         { offensive: 0.8, analytical: 0.7, builder: 0.4 },
  'Social Engineer':                { social: 0.9, offensive: 0.6, research: 0.5 },
  'Exploit Developer':              { offensive: 0.9, analytical: 0.8, builder: 0.5 },
  'Red Team Operator':              { offensive: 0.9, analytical: 0.6, social: 0.4 },
};

const CAREER_TEAMS = {
  'SOC Analyst': 'Blue Team',
  'DFIR Analyst': 'Blue Team',
  'Threat Intelligence Analyst': 'Blue Team',
  'Cloud Security Engineer': 'Blue Team',
  'GRC Analyst': 'Blue Team',
  'Vulnerability Analyst': 'Blue Team',
  'Security Engineer': 'Blue Team',
  'Digital Forensics Analyst': 'Blue Team',
  'Penetration Tester': 'Red Team',
  'OSINT Analyst': 'Red Team',
  'Malware Analyst': 'Red Team',
  'Web Application Hacker': 'Red Team',
  'Social Engineer': 'Red Team',
  'Exploit Developer': 'Red Team',
  'Red Team Operator': 'Red Team',
};

function matchCareers(normalizedTraits) {
  const scored = Object.entries(CAREER_PROFILES).map(([career, weights]) => {
    const score = Object.entries(weights).reduce((sum, [trait, weight]) => {
      return sum + (normalizedTraits[trait] || 0) * weight;
    }, 0);
    return {
      name: career,
      team: CAREER_TEAMS[career],
      score: parseFloat(score.toFixed(4)),
    };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored;
}

module.exports = { matchCareers, CAREER_PROFILES, CAREER_TEAMS };