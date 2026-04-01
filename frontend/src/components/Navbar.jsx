import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import MoonImg from '../assets/images/Moon.png'
import SunImg from '../assets/images/Sun.png'
import LogoImg from '../assets/images/Logo.png'

export default function Navbar({ activePage = 'home' }) {
  const navigate = useNavigate()
  const { darkMode, toggleTheme, t } = useTheme()

  const username = localStorage.getItem('username')
  const token = localStorage.getItem('token')

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600&display=swap');
        .nav-link-item {
          color: ${t.textDim};
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 500;
          padding: 0.35rem 1rem;
          border-radius: 50px;
          transition: all 0.2s;
          font-family: 'Rajdhani', sans-serif;
          cursor: pointer;
          border: none;
          background: none;
          letter-spacing: 0.5px;
        }
        .nav-link-item:hover { color: ${t.teal}; background: ${t.tealDim}; }
        .nav-link-item.active { color: ${t.teal}; background: ${t.tealDim}; }
        .nav-toggle {
          width: 44px; height: 24px; border-radius: 12px;
          background: ${darkMode ? t.tealDim : '#cbd5e0'};
          border: 1px solid ${t.tealBorder};
          cursor: pointer; position: relative; transition: all 0.3s;
          flex-shrink: 0;
        }
        .nav-toggle-knob {
          position: absolute; top: 2px;
          width: 18px; height: 18px; border-radius: 50%;
          background: ${t.teal}; transition: all 0.3s;
          left: ${darkMode ? '22px' : '2px'};
        }
        .nav-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: ${t.tealDim};
          border: 1px solid ${t.tealBorder};
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem; color: ${t.teal};
          font-family: 'Orbitron', monospace; font-weight: 700;
          cursor: pointer; transition: all 0.2s;
        }
        .nav-avatar:hover { border-color: ${t.tealMid}; background: ${t.tealDim}; }
        .logout-btn {
          background: none; border: 1px solid ${t.tealBorder};
          color: ${t.textDim}; font-family: 'Rajdhani', sans-serif;
          font-size: 0.85rem; cursor: pointer; padding: 0.3rem 0.9rem;
          border-radius: 6px; transition: all 0.2s; letter-spacing: 0.5px;
        }
        .logout-btn:hover { border-color: ${t.errorBorder}; color: ${t.errorText}; }
        @keyframes fadeSlideDown { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
        @media(max-width:768px) { .nav-center-pill { display: none !important; } }
      `}</style>

      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 3rem',
        background: t.navBg,
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${t.tealBorder}`,
        animation: 'fadeSlideDown 0.6s ease both',
        transition: 'background 0.3s, border-color 0.3s'
      }}>

        {/* Logo */}
        <div
          style={{ display:'flex', alignItems:'center', gap:'0.6rem', cursor:'pointer' }}
          onClick={() => navigate('/')}
        >
          <img
            src={LogoImg}
            alt="CyberRoadMap Logo"
            style={{
              height: 56,
              width: 'auto',
              objectFit: 'contain',
            }}
          />
          <span style={{ fontFamily:"'Orbitron',monospace", fontSize:'1rem', fontWeight:700, color:t.teal }}>
            CyberRoadMap
          </span>
        </div>

        {/* Show different nav based on login status */}
{token && (
  <div className="nav-center-pill" style={{ display:'flex', alignItems:'center', gap:'0.3rem', background:t.tealDim, border:`1px solid ${t.tealBorder}`, borderRadius:50, padding:'0.4rem 0.8rem', transition:'all 0.3s' }}>
    <span style={{ color:`${t.tealMid}`, fontSize:'1rem', padding:'0 0.3rem' }}>☰</span>
    <button className={`nav-link-item ${activePage==='dashboard'?'active':''}`} onClick={() => navigate('/dashboard')}>Dashboard</button>
    <div style={{ width:1, height:16, background:t.tealBorder }} />
    <button className={`nav-link-item ${activePage==='profile'?'active':''}`} onClick={() => navigate('/profile')}>Profile</button>
    {localStorage.getItem('role') === 'admin' && <>
      <div style={{ width:1, height:16, background:t.tealBorder }} />
      <button className={`nav-link-item ${activePage==='admin'?'active':''}`} onClick={() => navigate('/admin')} style={{ color: activePage==='admin' ? t.teal : '#f6ad55' }}>⚙️ Admin</button>
    </>}
  </div>
)}
        {/* Right side */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.8rem' }}>
          {/* Theme toggle */}
          <img
            src={darkMode ? MoonImg : SunImg}
            alt={darkMode ? 'Moon' : 'Sun'}
            style={{
              width: 28,
              height: 28,
              objectFit: 'cover',
            }}
          />
          <div className="nav-toggle" onClick={toggleTheme}>
            <div className="nav-toggle-knob" />
          </div>

          {token ? (
            <>
              <div className="nav-avatar" onClick={() => navigate('/profile')}>
                {(username || 'U').charAt(0).toUpperCase()}
              </div>
              <span style={{ color:t.textDim, fontSize:'0.9rem', fontFamily:"'Rajdhani',sans-serif" }}>{username}</span>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button className="nav-link-item" onClick={() => navigate('/login')}>Login</button>
              <button
                onClick={() => navigate('/register')}
                style={{ background:t.teal, border:'none', color:t.bg, fontFamily:"'Rajdhani',sans-serif", fontSize:'0.9rem', fontWeight:700, cursor:'pointer', padding:'0.5rem 1.3rem', borderRadius:6, transition:'all 0.2s', letterSpacing:'1px' }}
                onMouseOver={e => { e.target.style.transform='translateY(-1px)'; e.target.style.boxShadow=`0 4px 15px ${t.tealMid}` }}
                onMouseOut={e => { e.target.style.transform='none'; e.target.style.boxShadow='none' }}
              >Sign Up</button>
            </>
          )}
        </div>
      </nav>
    </>
  )
}