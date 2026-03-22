const db = require('../config/db');

exports.getTraitDistribution = (req, res) => {
  db.query('SELECT traits FROM assessments WHERE mode = ?', ['normal'], (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    if (results.length === 0) return res.json({ success: true, data: {}, total_users: 0 });

    const totals = {};
    let count = 0;
    results.forEach(row => {
      try {
        const t = JSON.parse(row.traits);
        Object.entries(t).forEach(([trait, val]) => {
          totals[trait] = (totals[trait] || 0) + val;
        });
        count++;
      } catch (e) {}
    });

    const averages = {};
    Object.entries(totals).forEach(([trait, total]) => {
      averages[trait] = parseFloat((total / count).toFixed(3));
    });

    res.json({ success: true, data: averages, total_users: count });
  });
};

exports.getCareerDistribution = (req, res) => {
  db.query(
    `SELECT recommended_path, COUNT(*) as count
     FROM assessments WHERE mode = 'normal'
     GROUP BY recommended_path ORDER BY count DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      res.json({ success: true, data: results });
    }
  );
};

exports.getLowConfidenceUsers = (req, res) => {
  const threshold = parseInt(req.query.threshold) || 50;
  db.query(
    `SELECT a.user_id, u.username, u.email, a.recommended_path,
            a.confidence_score, a.confidence_label, a.skipped_count, a.created_at
     FROM assessments a
     JOIN users u ON u.id = a.user_id
     WHERE a.confidence_score < ?
     ORDER BY a.confidence_score ASC`,
    [threshold],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      res.json({ success: true, data: results });
    }
  );
};

exports.getOverview = (req, res) => {
  Promise.all([
    new Promise((resolve, reject) =>
      db.query('SELECT COUNT(*) as count FROM users', (e, r) => e ? reject(e) : resolve(r[0].count))
    ),
    new Promise((resolve, reject) =>
      db.query('SELECT COUNT(*) as count FROM assessments', (e, r) => e ? reject(e) : resolve(r[0].count))
    ),
    new Promise((resolve, reject) =>
      db.query('SELECT AVG(confidence_score) as avg FROM assessments WHERE mode="normal"', (e, r) => e ? reject(e) : resolve(parseFloat((r[0].avg || 0).toFixed(1))))
    ),
    new Promise((resolve, reject) =>
      db.query('SELECT recommended_path, COUNT(*) as count FROM assessments WHERE mode="normal" GROUP BY recommended_path ORDER BY count DESC LIMIT 3', (e, r) => e ? reject(e) : resolve(r))
    ),
    new Promise((resolve, reject) =>
      db.query('SELECT mode, COUNT(*) as count FROM assessments GROUP BY mode', (e, r) => e ? reject(e) : resolve(r))
    ),
  ]).then(([totalUsers, totalAssessments, avgConfidence, topCareers, modes]) => {
    res.json({ success: true, data: { totalUsers, totalAssessments, avgConfidence, topCareers, modes } });
  }).catch(() => res.status(500).json({ message: 'DB error' }));
};