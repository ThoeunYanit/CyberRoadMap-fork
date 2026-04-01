import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/config'
import Navbar from '../components/Navbar'
import { useTheme } from '../context/ThemeContext'
import { getSlug } from '../api/slugMap'
import blueImg from '../assets/images/Blue_Team.jpg'
import redImg from '../assets/images/Red_Team.jpg'

export default function Dashboard() {
  const navigate = useNavigate()
  const { t, darkMode } = useTheme()
  const [teams, setTeams] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [particles, setParticles] = useState([])
  const [loaded, setLoaded] = useState(false)
  const username = localStorage.getItem('username') || 'Explorer'

  useEffect(() => {
    const p = Array.from({ length: 15 }, (_, i) => ({ id:i, x:Math.random()*100, y:Math.random()*100, size:Math.random()*3+1, duration:Math.random()*8+6, delay:Math.random()*4 }))
    setParticles(p)
    API.get('/api/specialists/teams')
      .then(res => {
        const raw = res.data.data
        const grouped = {}
        raw.forEach(row => {
          const key = row.team_name
          if (!grouped[key]) grouped[key] = { name:row.team_name, slug:row.team_slug, description:row.team_description, specialists:[] }
          if (row.specialist_name && !grouped[key].specialists.find(s => s.name === row.specialist_name)) {
            grouped[key].specialists.push({ name:row.specialist_name, slug:row.specialist_slug, income:row.avg_income })
          }
        })
        setTeams(Object.values(grouped))
        setLoading(false)
        setTimeout(() => setLoaded(true), 100)
      })
      .catch(() => setLoading(false))
    API.get('/api/profile').then(res => setProfile(res.data.profile)).catch(() => {})
  }, [])

  const isBlue = (name) => name?.toLowerCase().includes('blue')

  return (
    <div style={{ minHeight:'100vh', background:t.bg, color:t.text, fontFamily:"'Rajdhani',sans-serif", overflowX:'hidden', position:'relative', transition:'all 0.3s' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        @keyframes floatUp{0%,100%{transform:translateY(0) rotate(0deg);opacity:0.4}50%{transform:translateY(-25px) rotate(180deg);opacity:0.7}}
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glowPulse{0%,100%{box-shadow:0 0 15px ${t.tealDim}}50%{box-shadow:0 0 35px ${t.tealMid}}}
        .team-card{position:relative;border-radius:16px;overflow:hidden;transition:all 0.35s cubic-bezier(0.175,0.885,0.32,1.275);backdrop-filter:blur(10px)}
        .team-card:hover{transform:translateY(-6px);box-shadow:0 25px 50px rgba(0,0,0,0.2)}
        .specialist-card{display:flex;align-items:center;gap:1rem;padding:1rem 1.2rem;border-radius:10px;border:1px solid ${t.tealBorder};background:${t.tealDim};cursor:pointer;transition:all 0.25s;margin-bottom:0.6rem}
        .specialist-card:hover{border-color:${t.tealMid};transform:translateX(6px);background:${t.card}}
        .rec-card{border-radius:14px;padding:1.5rem;backdrop-filter:blur(10px);transition:all 0.3s;animation:glowPulse 3s ease-in-out infinite}
        .fade-0{animation:fadeSlideUp 0.6s ease both}
        .fade-1{animation:fadeSlideUp 0.6s ease 0.1s both}
        .fade-2{animation:fadeSlideUp 0.6s ease 0.2s both}
        .fade-3{animation:fadeSlideUp 0.6s ease 0.3s both}
        @media(max-width:768px){.teams-grid{grid-template-columns:1fr !important}}
      `}</style>

      {particles.map(p => (<div key={p.id} style={{ position:'fixed', left:`${p.x}%`, top:`${p.y}%`, width:p.size, height:p.size, borderRadius:'50%', background:darkMode?'rgba(100,255,218,0.4)':'rgba(13,115,119,0.15)', animation:`floatUp ${p.duration}s ease-in-out ${p.delay}s infinite`, pointerEvents:'none', zIndex:0 }} />))}
      {darkMode && <>
        <div style={{ position:'fixed', width:500, height:500, borderRadius:'50%', filter:'blur(120px)', background:'radial-gradient(circle,rgba(13,115,119,0.25),transparent 70%)', top:-150, left:-150, pointerEvents:'none', zIndex:0 }} />
        <div style={{ position:'fixed', width:400, height:400, borderRadius:'50%', filter:'blur(100px)', background:'radial-gradient(circle,rgba(20,160,133,0.15),transparent 70%)', bottom:-100, right:-100, pointerEvents:'none', zIndex:0 }} />
      </>}
      <div style={{ position:'fixed', inset:0, backgroundImage:`linear-gradient(${t.gridColor} 1px,transparent 1px),linear-gradient(90deg,${t.gridColor} 1px,transparent 1px)`, backgroundSize:'60px 60px', pointerEvents:'none', zIndex:0 }} />

      <Navbar activePage="dashboard" />

      <main style={{ position:'relative', zIndex:1, padding:'6rem 2rem 4rem', maxWidth:1200, margin:'0 auto' }}>
        <div className={loaded?'fade-0':''} style={{ marginBottom:'2.5rem' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', border:`1px solid ${t.tealMid}`, borderRadius:50, padding:'0.3rem 1rem', fontSize:'0.75rem', color:t.teal, letterSpacing:'3px', textTransform:'uppercase', marginBottom:'1rem' }}>
            <div style={{ width:5, height:5, background:t.teal, borderRadius:'50%' }} />
            Dashboard
          </div>
          <h1 style={{ fontFamily:"'Orbitron',monospace", fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:900, color:t.text, marginBottom:'0.5rem' }}>
            Welcome back, <span style={{ color:t.teal }}>{username}</span>
          </h1>
          <p style={{ color:t.textDim, fontSize:'1rem' }}>Explore cybersecurity career paths and find your learning roadmap.</p>
        </div>

        {profile?.recommended_path && (
          <div className={loaded?'fade-1':''} style={{ marginBottom:'2.5rem' }}>
            <div className="rec-card" style={{ background:profile.team?.toLowerCase().includes('red')?t.redDim:t.blueDim, border:`1px solid ${profile.team?.toLowerCase().includes('red')?t.redBorder:t.blueBorder}` }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                  <div style={{ fontSize:'2rem' }}>{profile.team?.toLowerCase().includes('red')?'⚔️':'🛡️'}</div>
                  <div>
                    <div style={{ fontSize:'0.75rem', color:t.textDim, letterSpacing:'2px', textTransform:'uppercase', marginBottom:'0.3rem' }}>AI Recommended Path</div>
                    <div style={{ fontFamily:"'Orbitron',monospace", fontSize:'1.1rem', fontWeight:700, color:t.teal }}>{profile.recommended_path}</div>
                    <div style={{ fontSize:'0.85rem', color:t.textDim, marginTop:'0.2rem' }}>{profile.team}</div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/specialist/${getSlug(profile.recommended_path)}`)}
                  style={{ background:t.teal, border:'none', color:t.bg, fontFamily:"'Orbitron',monospace", fontSize:'0.8rem', fontWeight:700, cursor:'pointer', padding:'0.6rem 1.5rem', borderRadius:8, letterSpacing:'1px', transition:'all 0.2s' }}
                  onMouseOver={e => { e.target.style.opacity='0.85'; e.target.style.transform='translateY(-1px)' }}
                  onMouseOut={e => { e.target.style.opacity='1'; e.target.style.transform='none' }}
                >View Roadmap →</button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign:'center', color:t.teal, fontFamily:"'Orbitron',monospace", fontSize:'0.9rem', letterSpacing:'2px', padding:'4rem' }}>Loading...</div>
        ) : (
          <div className="teams-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2rem' }}>
            {teams.map((team, ti) => {
              const blue = isBlue(team.name)
              const accent = blue?(darkMode?'#4fc3f7':'#2b6cb0'):(darkMode?'#ff6b6b':'#c53030')
              const accentDim = blue?t.blueDim:t.redDim
              const accentBorder = blue?t.blueBorder:t.redBorder
              return (
                <div key={team.name} className={`team-card ${loaded?`fade-${ti+2}`:''}`} style={{ background:t.card, border:`1px solid ${accentBorder}`, padding:'2rem' }}>
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${accent},transparent)` }} />
                  <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.5rem' }}>
                    <div style={{ width:52, height:52, borderRadius:12, overflow:'hidden', border:`1px solid ${accentBorder}` }}>
                      <img src={blue ? blueImg : redImg} alt={blue ? 'Blue Team' : 'Red Team'} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    </div>
                    <div>
                      <div style={{ fontFamily:"'Orbitron',monospace", fontSize:'1.1rem', fontWeight:700, color:accent }}>{team.name}</div>
                      <div style={{ fontSize:'0.82rem', color:t.textDim, marginTop:'0.2rem' }}>{blue?'Defensive Security':'Offensive Security'}</div>
                    </div>
                  </div>
                  <p style={{ fontSize:'0.9rem', color:t.textDim, lineHeight:1.6, marginBottom:'1.5rem' }}>{team.description}</p>
                  <div style={{ height:1, background:`linear-gradient(90deg,${accentBorder},transparent)`, marginBottom:'1.2rem' }} />
                  <div style={{ fontSize:'0.75rem', color:t.textDim, letterSpacing:'2px', textTransform:'uppercase', marginBottom:'0.8rem', fontFamily:"'Orbitron',monospace" }}>Specializations</div>
                  {team.specialists.map((s, i) => (
                    <div key={i} className="specialist-card" onClick={() => navigate(`/specialist/${s.slug}`)}>
                      <div style={{ width:36, height:36, borderRadius:8, background:accentDim, border:`1px solid ${accentBorder}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', flexShrink:0 }}>{blue?'🔵':'🔴'}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:'0.95rem', fontWeight:600, color:t.text }}>{s.name}</div>
                        {s.income && <div style={{ fontSize:'0.78rem', color:t.textDim, marginTop:'0.1rem' }}>{s.income}</div>}
                      </div>
                      <div style={{ color:accent, fontSize:'1rem', opacity:0.6 }}>→</div>
                    </div>
                  ))}
                  <button
                    onClick={() => navigate('/assessment')}
                    style={{ width:'100%', marginTop:'1rem', background:'none', border:`1px solid ${accentBorder}`, color:accent, fontFamily:"'Rajdhani',sans-serif", fontSize:'0.9rem', fontWeight:600, cursor:'pointer', padding:'0.7rem', borderRadius:8, letterSpacing:'1px', transition:'all 0.2s' }}
                    onMouseOver={e => { e.target.style.background=accentDim; e.target.style.borderColor=accent }}
                    onMouseOut={e => { e.target.style.background='none'; e.target.style.borderColor=accentBorder }}
                  >Find My Path in {team.name} →</button>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ textAlign:'center', marginTop:'3rem', padding:'2rem', border:`1px solid ${t.tealBorder}`, borderRadius:16, background:t.card, backdropFilter:'blur(10px)' }}>
          <div style={{ fontFamily:"'Orbitron',monospace", fontSize:'1rem', fontWeight:700, color:t.teal, marginBottom:'0.5rem' }}>Not sure which path?</div>
          <p style={{ color:t.textDim, fontSize:'0.9rem', marginBottom:'1.2rem' }}>Let our AI analyze your skills and interests to recommend the perfect career path.</p>
          <button onClick={() => navigate('/assessment')} style={{ background:t.teal, border:'none', color:t.bg, fontFamily:"'Orbitron',monospace", fontSize:'0.85rem', fontWeight:700, cursor:'pointer', padding:'0.8rem 2.5rem', borderRadius:8, letterSpacing:'2px', transition:'all 0.2s' }}
            onMouseOver={e => { e.target.style.opacity='0.85'; e.target.style.transform='translateY(-2px)' }}
            onMouseOut={e => { e.target.style.opacity='1'; e.target.style.transform='none' }}
          >Take AI Assessment →</button>
        </div>
      </main>
    </div>
  )
}