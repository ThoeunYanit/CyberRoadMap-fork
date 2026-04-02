import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import API from '../api/config'
import Navbar from '../components/Navbar'
import { useTheme } from '../context/ThemeContext'
import blueImg from '../assets/images/Blue_Team.jpg'
import redImg from '../assets/images/Red_Team.jpg'

export default function Landing() {
  const navigate = useNavigate()
  const { t, darkMode } = useTheme()
  const [teams, setTeams] = useState([])
  const [particles, setParticles] = useState([])

  useEffect(() => {
    const p = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 10 + 8,
      delay: Math.random() * 5,
    }))
    setParticles(p)

    API.get('/api/specialists/teams')
      .then(res => {
        const raw = res.data.data
        const grouped = {}
        raw.forEach(row => {
          const key = row.team_name
          if (!grouped[key]) {
            grouped[key] = { name: row.team_name, slug: row.team_slug, description: row.team_description, specialists: [] }
          }
          if (row.specialist_name) {
            const exists = grouped[key].specialists.find(s => s.name === row.specialist_name)
            if (!exists) {
              grouped[key].specialists.push({ name: row.specialist_name, slug: row.specialist_slug, income: row.avg_income })
            }
          }
        })
        setTeams(Object.values(grouped))
      })
      .catch(err => console.error('Teams fetch error:', err))
  }, [])

  const isBlue = (name) => name?.toLowerCase().includes('blue')

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text, fontFamily: "'Rajdhani', sans-serif", overflowX: 'hidden', transition: 'all 0.3s' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }

        @keyframes floatUp {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.4; }
          50% { transform: translateY(-30px) rotate(180deg); opacity: 0.8; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px ${t.tealDim}; }
          50% { box-shadow: 0 0 40px ${t.tealMid}; }
        }

        .fade-0 { animation: fadeUp 0.7s ease both; }
        .fade-1 { animation: fadeUp 0.7s ease 0.15s both; }
        .fade-2 { animation: fadeUp 0.7s ease 0.3s both; }
        .fade-3 { animation: fadeUp 0.7s ease 0.45s both; }
        .fade-4 { animation: fadeUp 0.7s ease 0.6s both; }

        .team-card {
          position: relative; border-radius: 14px; padding: 2rem;
          overflow: hidden; transition: all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          backdrop-filter: blur(10px);
        }
        .team-card:hover { transform: translateY(-8px); box-shadow: 0 25px 50px rgba(0,0,0,0.25); }

        .spec-visible {
          display: flex; align-items: center; gap: 0.8rem;
          padding: 0.7rem 1rem; border-radius: 8px;
          border: 1px solid ${t.tealBorder}; background: ${t.tealDim};
          margin-bottom: 0.5rem; transition: all 0.2s; cursor: default;
        }
        .spec-visible:hover { border-color: ${t.tealMid}; transform: translateX(4px); }

        .spec-locked {
          display: flex; align-items: center; gap: 0.8rem;
          padding: 0.7rem 1rem; border-radius: 8px;
          border: 1px dashed ${t.tealBorder}; background: ${t.tealDim};
          margin-bottom: 0.5rem; filter: blur(4px); opacity: 0.35;
          pointer-events: none;
        }

        .stat-card {
          text-align: center; padding: 2rem;
          border: 1px solid ${t.tealBorder}; border-radius: 12px;
          background: ${t.card}; transition: all 0.3s;
          backdrop-filter: blur(10px); cursor: default;
        }
        .stat-card:hover { border-color: ${t.tealMid}; transform: translateY(-4px); box-shadow: 0 15px 40px rgba(0,0,0,0.1); }

        .btn-explore {
          position: relative; background: ${t.tealDim};
          border: 1px solid ${t.teal}; color: ${t.teal};
          font-family: 'Orbitron', monospace; font-size: 0.9rem;
          font-weight: 700; cursor: pointer; padding: 1rem 3rem;
          border-radius: 4px; letter-spacing: 3px; text-transform: uppercase;
          transition: all 0.3s; overflow: hidden;
          animation: glowPulse 3s ease-in-out infinite;
        }
        .btn-explore:hover { box-shadow: 0 0 30px ${t.tealMid}; transform: translateY(-2px); }

        .btn-unlock {
          background: none; border: 1px solid;
          font-family: 'Rajdhani', sans-serif; font-size: 0.85rem;
          font-weight: 600; cursor: pointer; padding: 0.4rem 1.4rem;
          border-radius: 4px; letter-spacing: 1px; transition: all 0.2s;
        }
        .btn-unlock:hover { opacity: 0.8; transform: translateY(-1px); }

        /* ── Responsive ── */
        @media(max-width: 768px) {
          .teams-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media(max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
          .hero-section { padding: 5rem 1.2rem 3rem !important; }
          .teams-section { padding: 2rem 1.2rem 4rem !important; }
          .stats-section { padding: 1rem 1.2rem 4rem !important; }
          .stat-card { padding: 1.4rem; }
          .btn-explore { padding: 0.85rem 2rem; font-size: 0.8rem; letter-spacing: 2px; }
        }
      `}</style>

      {/* Grid background */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `linear-gradient(${t.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${t.gridColor} 1px, transparent 1px)`, backgroundSize: '60px 60px', pointerEvents: 'none', zIndex: 0 }} />

      {/* Particles */}
      {particles.map(p => (
        <div key={p.id} style={{ position: 'fixed', left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, borderRadius: '50%', background: darkMode ? 'rgba(100,255,218,0.5)' : 'rgba(13,115,119,0.2)', animation: `floatUp ${p.duration}s ease-in-out ${p.delay}s infinite`, pointerEvents: 'none', zIndex: 0 }} />
      ))}

      {/* Glow orbs */}
      {darkMode && <>
        <div style={{ position: 'fixed', width: 600, height: 600, borderRadius: '50%', filter: 'blur(120px)', background: 'radial-gradient(circle, #0d7377 0%, transparent 70%)', top: -200, left: -200, opacity: 0.25, pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'fixed', width: 500, height: 500, borderRadius: '50%', filter: 'blur(100px)', background: 'radial-gradient(circle, #14a085 0%, transparent 70%)', bottom: -150, right: -150, opacity: 0.2, pointerEvents: 'none', zIndex: 0 }} />
      </>}

      <Navbar activePage="home" />

      {/* ── HERO ── */}
      <section className="hero-section" style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '6rem 2rem 4rem' }}>
        <div className="fade-0" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: `1px solid ${t.tealMid}`, borderRadius: 50, padding: '0.3rem 1rem', fontSize: '0.8rem', color: t.teal, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '2rem' }}>
          <div style={{ width: 6, height: 6, background: t.teal, borderRadius: '50%', animation: 'pulse 2s infinite' }} />
          Cybersecurity Career Platform
        </div>

        <h1 className="fade-1" style={{ fontFamily: "'Orbitron', monospace", fontSize: 'clamp(2.5rem, 8vw, 6rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-1px', marginBottom: '1rem' }}>
          <span style={{ color: t.teal }}>Cyber</span>
          <br />
          <span style={{ color: 'transparent', WebkitTextStroke: `1px ${t.tealMid}` }}>Security</span>
        </h1>

        <p className="fade-2" style={{ fontSize: 'clamp(0.95rem, 2vw, 1.2rem)', color: t.textDim, maxWidth: 600, lineHeight: 1.7, marginBottom: '2.5rem', fontWeight: 400, padding: '0 0.5rem' }}>
          Cybersecurity is the practice of protecting computers, networks, and data from cyber threats.
          Find your <span style={{ color: t.teal, fontWeight: 600 }}>perfect career path</span> through a clear, step-by-step roadmap.
        </p>

        <div className="fade-3" style={{ position: 'relative', display: 'inline-block', marginBottom: '1.5rem' }}>
          <div style={{ position: 'absolute', top: -14, left: -22, color: t.tealMid, fontSize: '1.2rem', fontWeight: 300, lineHeight: 1, animation: 'floatUp 3s ease-in-out infinite' }}>╭</div>
          <div style={{ position: 'absolute', bottom: -14, right: -22, color: t.tealMid, fontSize: '1.2rem', fontWeight: 300, lineHeight: 1, animation: 'floatUp 3s ease-in-out 0.5s infinite' }}>╯</div>
          <button className="btn-explore" onClick={() => navigate('/register')}>Explore</button>
        </div>

        <p className="fade-4" style={{ fontSize: 'clamp(0.82rem, 1.5vw, 0.9rem)', color: t.textDim, maxWidth: 480, lineHeight: 1.6, padding: '0 1rem' }}>
          Explore the possible career paths in cybersecurity and learn the essential skills
          and knowledge required for each path through a clear, step-by-step roadmap.
        </p>
      </section>

      {/* ── TEAMS PREVIEW ── */}
      <section className="teams-section" style={{ position: 'relative', zIndex: 1, padding: '3rem 2rem 5rem', maxWidth: 1100, margin: '0 auto' }}>
        <p style={{ textAlign: 'center', fontFamily: "'Orbitron', monospace", fontSize: '0.7rem', letterSpacing: '4px', color: t.teal, textTransform: 'uppercase', marginBottom: '0.8rem' }}>Career Paths</p>
        <h2 style={{ textAlign: 'center', fontFamily: "'Orbitron', monospace", fontSize: 'clamp(1.3rem, 3vw, 2rem)', fontWeight: 700, marginBottom: '3rem', color: t.text }}>Choose Your Side</h2>

        <div className="teams-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {teams.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: t.textDim, padding: '3rem', fontFamily: "'Orbitron', monospace", fontSize: '0.9rem', letterSpacing: '2px' }}>
              Loading career paths...
            </div>
          ) : teams.map(team => {
            const blue = isBlue(team.name)
            const accent = blue ? (darkMode ? '#4fc3f7' : '#2b6cb0') : (darkMode ? '#ff6b6b' : '#c53030')
            const accentDim = blue ? (darkMode ? 'rgba(79,195,247,0.1)' : 'rgba(43,108,176,0.08)') : (darkMode ? 'rgba(255,107,107,0.1)' : 'rgba(197,48,48,0.08)')
            const accentBorder = blue ? (darkMode ? 'rgba(79,195,247,0.25)' : 'rgba(43,108,176,0.2)') : (darkMode ? 'rgba(255,107,107,0.25)' : 'rgba(197,48,48,0.2)')
            return (
              <div key={team.name} className="team-card" style={{ background: t.card, border: `1px solid ${accentBorder}` }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ width: 50, height: 50, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', background: accentDim, border: `1px solid ${accentBorder}`, flexShrink: 0 }}>
                    {blue ? (
                      <img src={blueImg} alt="Blue Team" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
                    ) : (
                      <img src={redImg} alt="Red Team" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 'clamp(0.85rem, 2vw, 1.1rem)', fontWeight: 700, color: accent }}>{team.name}</div>
                    <div style={{ fontSize: '0.8rem', color: t.textDim, marginTop: '0.2rem' }}>{blue ? 'Defensive Security' : 'Offensive Security'}</div>
                  </div>
                </div>
                <p style={{ fontSize: 'clamp(0.82rem, 1.5vw, 0.9rem)', color: t.textDim, lineHeight: 1.6, marginBottom: '1.5rem' }}>{team.description}</p>
                <div style={{ position: 'relative', minHeight: 180 }}>
                  {team.specialists.map((s, i) => (
                    <div key={i} className={i < 2 ? 'spec-visible' : 'spec-locked'}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: accent, flexShrink: 0 }} />
                      <span style={{ fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)', fontWeight: 500, color: t.text, flex: 1 }}>{s.name}</span>
                      {i < 2 && s.income && (
                        <span style={{ fontSize: '0.75rem', color: t.textDim, display: 'none' }}>{s.income.split('/')[0].split('-')[0].trim()}</span>
                      )}
                    </div>
                  ))}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '4rem 1rem 1rem', background: `linear-gradient(to top, ${t.bg} 55%, transparent)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', transition: 'background 0.3s' }}>
                    <div style={{ fontSize: '1.5rem' }}>🔒</div>
                    <p style={{ fontSize: 'clamp(0.78rem, 1.4vw, 0.82rem)', color: t.textDim, textAlign: 'center' }}>Sign up to unlock all specialists</p>
                    <button className="btn-unlock" onClick={() => navigate('/register')} style={{ color: accent, borderColor: accent }}>Unlock Access →</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="stats-section" style={{ position: 'relative', zIndex: 1, padding: '2rem 2rem 5rem', maxWidth: 900, margin: '0 auto' }}>
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {[
            { num: '6+', label: 'Career Specializations' },
            { num: 'AI', label: 'Powered Path Analysis' },
            { num: '100%', label: 'Free Forever' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 900, color: t.teal, display: 'block' }}>{s.num}</span>
              <div style={{ fontSize: 'clamp(0.78rem, 1.5vw, 0.85rem)', color: t.textDim, letterSpacing: '1px', marginTop: '0.3rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
<<<<<<< HEAD
      <footer style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '2rem 1rem', borderTop: `1px solid ${t.tealBorder}`, color: t.textDim, fontSize: '0.85rem', letterSpacing: '0.5px', transition: 'all 0.3s' }}>
        Built for cybersecurity learners — <span style={{ color: t.teal }}>CyberRoadMap</span> © 2025
=======
      <footer style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '2rem', borderTop: `1px solid ${t.tealBorder}`, color: t.textDim, fontSize: '0.85rem', letterSpacing: '0.5px', transition: 'all 0.3s' }}>
        Built for cybersecurity learners — <span style={{ color: t.teal }}>CyberRoadMap</span> © 2026
>>>>>>> e63730b6f904b886ed4fab3b4dff7af87e8be2c2
      </footer>
    </div>
  )
}