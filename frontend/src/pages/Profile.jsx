import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/config'
import Navbar from '../components/Navbar'
import { useTheme } from '../context/ThemeContext'
import { getSlug } from '../api/slugMap'

export default function Profile() {
  const navigate = useNavigate()
  const { t, darkMode } = useTheme()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [particles, setParticles] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const p = Array.from({ length:12 }, (_,i) => ({ id:i, x:Math.random()*100, y:Math.random()*100, size:Math.random()*3+1, duration:Math.random()*8+6, delay:Math.random()*4 }))
    setParticles(p)
    API.get('/api/profile')
      .then(res => { setProfile(res.data.profile); setLoading(false); setTimeout(() => setLoaded(true), 100) })
      .catch(() => { setLoading(false); navigate('/login') })
  }, [])

  const isRedTeam = profile?.team?.toLowerCase().includes('red')
  const teamColor = isRedTeam?(darkMode?'#ff6b6b':'#c53030'):(darkMode?'#4fc3f7':'#2b6cb0')
  const teamDim = isRedTeam?t.redDim:t.blueDim
  const teamBorder = isRedTeam?t.redBorder:t.blueBorder
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }) : 'N/A'

  return (
    <div style={{ minHeight:'100vh', background:t.bg, color:t.text, fontFamily:"'Rajdhani',sans-serif", overflowX:'hidden', position:'relative', transition:'all 0.3s' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        @keyframes floatUp{0%,100%{transform:translateY(0) rotate(0deg);opacity:0.4}50%{transform:translateY(-25px) rotate(180deg);opacity:0.7}}
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        .fade-0{animation:fadeSlideUp 0.6s ease both}
        .fade-1{animation:fadeSlideUp 0.6s ease 0.1s both}
        .fade-2{animation:fadeSlideUp 0.6s ease 0.2s both}
        .fade-3{animation:fadeSlideUp 0.6s ease 0.3s both}
        .info-row{display:flex;justify-content:space-between;align-items:center;padding:1rem 0;border-bottom:1px solid ${t.tealBorder}}
        .info-row:last-child{border-bottom:none}
        .action-btn{width:100%;padding:0.8rem;border-radius:8px;font-family:'Rajdhani',sans-serif;font-size:0.95rem;font-weight:600;cursor:pointer;transition:all 0.2s;letter-spacing:1px}
      `}</style>

      {particles.map(p => (<div key={p.id} style={{ position:'fixed', left:`${p.x}%`, top:`${p.y}%`, width:p.size, height:p.size, borderRadius:'50%', background:darkMode?'rgba(100,255,218,0.4)':'rgba(13,115,119,0.15)', animation:`floatUp ${p.duration}s ease-in-out ${p.delay}s infinite`, pointerEvents:'none', zIndex:0 }} />))}
      {darkMode && <>
        <div style={{ position:'fixed', width:500, height:500, borderRadius:'50%', filter:'blur(120px)', background:'radial-gradient(circle,rgba(13,115,119,0.25),transparent 70%)', top:-150, left:-150, pointerEvents:'none', zIndex:0 }} />
        <div style={{ position:'fixed', width:400, height:400, borderRadius:'50%', filter:'blur(100px)', background:'radial-gradient(circle,rgba(20,160,133,0.15),transparent 70%)', bottom:-100, right:-100, pointerEvents:'none', zIndex:0 }} />
      </>}
      <div style={{ position:'fixed', inset:0, backgroundImage:`linear-gradient(${t.gridColor} 1px,transparent 1px),linear-gradient(90deg,${t.gridColor} 1px,transparent 1px)`, backgroundSize:'60px 60px', pointerEvents:'none', zIndex:0 }} />

      <Navbar activePage="profile" />

      {loading ? (
        <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:t.teal, fontFamily:"'Orbitron',monospace", fontSize:'0.9rem', letterSpacing:'2px' }}>Loading...</div>
      ) : profile && (
        <main style={{ position:'relative', zIndex:1, padding:'6rem 2rem 4rem', maxWidth:800, margin:'0 auto' }}>
          <div className={loaded?'fade-0':''} style={{ textAlign:'center', marginBottom:'2.5rem' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', border:`1px solid ${t.tealMid}`, borderRadius:50, padding:'0.3rem 1rem', fontSize:'0.75rem', color:t.teal, letterSpacing:'3px', textTransform:'uppercase', marginBottom:'1.5rem' }}>
              <div style={{ width:5, height:5, background:t.teal, borderRadius:'50%' }} />
              Profile
            </div>
            <div style={{ width:80, height:80, borderRadius:'50%', background:t.tealDim, border:`2px solid ${t.teal}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Orbitron',monospace", fontSize:'2rem', fontWeight:700, color:t.teal, margin:'0 auto 1rem', boxShadow:`0 0 30px ${t.tealDim}` }}>
              {profile.username?.charAt(0).toUpperCase()}
            </div>
            <h1 style={{ fontFamily:"'Orbitron',monospace", fontSize:'clamp(1.5rem,4vw,2rem)', fontWeight:900, color:t.text, marginBottom:'0.3rem' }}>{profile.username}</h1>
            <p style={{ color:t.textDim, fontSize:'0.9rem' }}>{profile.email}</p>
          </div>

          {profile.recommended_path && (
            <div className={loaded?'fade-1':''} style={{ background:teamDim, border:`1px solid ${teamBorder}`, borderRadius:16, padding:'1.5rem', marginBottom:'1.5rem', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${teamColor},transparent)` }} />
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                  <div style={{ fontSize:'2.5rem' }}>{isRedTeam?'⚔️':'🛡️'}</div>
                  <div>
                    <div style={{ fontSize:'0.7rem', color:t.textDim, letterSpacing:'2px', textTransform:'uppercase', marginBottom:'0.3rem' }}>Your Career Path</div>
                    <div style={{ fontFamily:"'Orbitron',monospace", fontSize:'1.1rem', fontWeight:700, color:teamColor }}>{profile.recommended_path}</div>
                    <div style={{ fontSize:'0.85rem', color:t.textDim, marginTop:'0.2rem' }}>{profile.team}</div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/specialist/${getSlug(profile.recommended_path)}`)}
                  style={{ background:teamColor, border:'none', color:'#fff', fontFamily:"'Rajdhani',sans-serif", fontSize:'0.9rem', fontWeight:600, cursor:'pointer', padding:'0.6rem 1.5rem', borderRadius:8, letterSpacing:'1px', transition:'all 0.2s' }}
                  onMouseOver={e => { e.target.style.opacity='0.85'; e.target.style.transform='translateY(-1px)' }}
                  onMouseOut={e => { e.target.style.opacity='1'; e.target.style.transform='none' }}
                >View Roadmap →</button>
              </div>
              {profile.reason && (
                <p style={{ fontSize:'0.88rem', color:t.textDim, lineHeight:1.6, marginTop:'1rem', paddingTop:'1rem', borderTop:`1px solid ${teamBorder}` }}>
                  {profile.reason}
                </p>
              )}
            </div>
          )}

          <div className={loaded?'fade-2':''} style={{ background:t.card, border:`1px solid ${t.tealBorder}`, borderRadius:16, padding:'1.5rem', marginBottom:'1.5rem', backdropFilter:'blur(10px)' }}>
            <div style={{ fontSize:'0.75rem', color:t.textDim, letterSpacing:'2px', textTransform:'uppercase', marginBottom:'1rem', fontFamily:"'Orbitron',monospace" }}>Account Info</div>
            <div className="info-row"><span style={{ color:t.textDim, fontSize:'0.9rem' }}>Username</span><span style={{ color:t.text, fontWeight:600 }}>{profile.username}</span></div>
            <div className="info-row"><span style={{ color:t.textDim, fontSize:'0.9rem' }}>Email</span><span style={{ color:t.text, fontWeight:600 }}>{profile.email}</span></div>
            <div className="info-row"><span style={{ color:t.textDim, fontSize:'0.9rem' }}>Member since</span><span style={{ color:t.text, fontWeight:600 }}>{formatDate(profile.created_at)}</span></div>
            <div className="info-row"><span style={{ color:t.textDim, fontSize:'0.9rem' }}>Career path</span><span style={{ color:profile.recommended_path?t.teal:t.textDim, fontWeight:600 }}>{profile.recommended_path || 'Not set yet'}</span></div>
          </div>

          <div className={loaded?'fade-3':''} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <button className="action-btn" onClick={() => navigate('/assessment')} style={{ background:t.tealDim, border:`1px solid ${t.tealBorder}`, color:t.teal }}
              onMouseOver={e => { e.target.style.borderColor=t.tealMid; e.target.style.transform='translateY(-2px)' }}
              onMouseOut={e => { e.target.style.borderColor=t.tealBorder; e.target.style.transform='none' }}>
              🔄 Retake Assessment
            </button>
            <button className="action-btn" onClick={() => navigate('/dashboard')} style={{ background:t.tealDim, border:`1px solid ${t.tealBorder}`, color:t.teal }}
              onMouseOver={e => { e.target.style.borderColor=t.tealMid; e.target.style.transform='translateY(-2px)' }}
              onMouseOut={e => { e.target.style.borderColor=t.tealBorder; e.target.style.transform='none' }}>
              🗺️ View Dashboard
            </button>
            <button className="action-btn" onClick={() => { localStorage.clear(); navigate('/') }} style={{ gridColumn:'1/-1', background:t.errorBg, border:`1px solid ${t.errorBorder}`, color:t.errorText }}
              onMouseOver={e => e.target.style.transform='translateY(-2px)'}
              onMouseOut={e => e.target.style.transform='none'}>
              🚪 Logout
            </button>
          </div>
        </main>
      )}
    </div>
  )
}