import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api/config'
import Navbar from '../components/Navbar'
import { useTheme } from '../context/ThemeContext'

export default function Register() {
  const navigate = useNavigate()
  const { t, darkMode } = useTheme()
  const [form, setForm] = useState({ username:'', email:'', password:'', confirm:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

  // Email/Password register → straight to career-select (no OTP)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.username.trim().length < 3) { setError('Username must be at least 3 characters'); return }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    if (!emailRegex.test(form.email)) { setError('Please enter a valid email address'); return }
    if (!passwordRegex.test(form.password)) { setError('Password must be at least 8 chars with uppercase, lowercase, number, and special char (@$!%*?&)'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      const res = await API.post('/api/auth/register', {
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password
      })
      const { token, userId, username } = res.data
      localStorage.setItem('token', token)
      localStorage.setItem('userId', userId)
      localStorage.setItem('username', username)
      localStorage.setItem('role', 'user')
      navigate('/career-select')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  // Google signup → redirects to backend → OTP → /verify-otp page
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/google`
  }

  return (
    <div style={{ minHeight:'100vh', background:t.bg, transition:'background 0.3s', fontFamily:"'Rajdhani',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@400;500;600&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        .auth-input{width:100%;padding:0.85rem 1rem;padding-right:3rem;background:${t.inputBg};border:1px solid ${t.inputBorder};border-radius:8px;color:${t.text};font-family:'Rajdhani',sans-serif;font-size:1rem;outline:none;transition:all 0.2s}
        .auth-input:focus{border-color:${t.teal};box-shadow:0 0 0 3px ${t.tealDim}}
        .auth-input::placeholder{color:${t.textDim}}
        .auth-btn{width:100%;padding:0.9rem;background:${t.teal};border:none;border-radius:8px;color:${t.bg};font-family:'Orbitron',monospace;font-size:0.85rem;font-weight:700;letter-spacing:2px;cursor:pointer;transition:all 0.2s}
        .auth-btn:hover:not(:disabled){opacity:0.9;transform:translateY(-1px);box-shadow:0 4px 20px ${t.tealMid}}
        .auth-btn:disabled{opacity:0.6;cursor:not-allowed}
        .show-btn{position:absolute;right:0.8rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:${t.textDim};font-size:1.1rem;padding:0;transition:color 0.2s}
        .show-btn:hover{color:${t.teal}}
        .google-btn{width:100%;padding:0.85rem;background:transparent;border:1px solid ${t.inputBorder};border-radius:8px;color:${t.text};font-family:'Rajdhani',sans-serif;font-size:1rem;font-weight:600;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:0.6rem}
        .google-btn:hover{border-color:${t.teal};background:${t.tealDim};transform:translateY(-1px)}
      `}</style>

      <div style={{ position:'fixed', inset:0, backgroundImage:`linear-gradient(${t.gridColor} 1px,transparent 1px),linear-gradient(90deg,${t.gridColor} 1px,transparent 1px)`, backgroundSize:'60px 60px', pointerEvents:'none', zIndex:0 }} />
      {darkMode && <>
        <div style={{ position:'fixed', width:400, height:400, borderRadius:'50%', filter:'blur(100px)', background:'radial-gradient(circle,rgba(13,115,119,0.25),transparent 70%)', top:-100, right:-100, pointerEvents:'none', zIndex:0 }} />
      </>}

      <Navbar />

      <div style={{ position:'relative', zIndex:1, minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'6rem 2rem 4rem' }}>
        <div style={{ width:'100%', maxWidth:440, animation:'fadeSlideUp 0.6s ease both' }}>
          <div style={{ textAlign:'center', marginBottom:'2rem' }}>
            <div style={{ fontFamily:"'Orbitron',monospace", fontSize:'1.5rem', fontWeight:900, color:t.teal, marginBottom:'0.5rem' }}>Cyber.road</div>
            <div style={{ color:t.textDim, fontSize:'0.9rem' }}>Create your account and start your journey</div>
          </div>

          <div style={{ background:t.card, border:`1px solid ${t.tealBorder}`, borderRadius:16, padding:'2.5rem', backdropFilter:'blur(12px)', boxShadow:darkMode?'0 20px 60px rgba(0,0,0,0.3)':'0 10px 40px rgba(0,0,0,0.08)', transition:'all 0.3s' }}>
            <h2 style={{ fontFamily:"'Orbitron',monospace", fontSize:'1.2rem', fontWeight:700, color:t.text, marginBottom:'2rem' }}>Sign Up</h2>

            {error && <div style={{ background:t.errorBg, border:`1px solid ${t.errorBorder}`, borderRadius:8, padding:'0.8rem 1rem', marginBottom:'1.5rem', color:t.errorText, fontSize:'0.9rem' }}>{error}</div>}

            {/* Google Signup Button → OTP flow */}
            <button className="google-btn" onClick={handleGoogleLogin} style={{ marginBottom:'1.5rem' }}>
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8 20-20 0-1.3-.2-2.7-.4-4z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.2 0-9.6-3.4-11.2-8l-6.5 5C9.8 39.9 16.4 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.6 5.8l6.2 5.2C40.6 35.7 44 30.3 44 24c0-1.3-.2-2.7-.4-4z"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.5rem' }}>
              <div style={{ flex:1, height:1, background:t.inputBorder }} />
              <span style={{ color:t.textDim, fontSize:'0.8rem' }}>or</span>
              <div style={{ flex:1, height:1, background:t.inputBorder }} />
            </div>

            {/* Email/Password → no OTP */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom:'1.2rem' }}>
                <label style={{ display:'block', fontSize:'0.8rem', color:t.textDim, marginBottom:'0.5rem', letterSpacing:'1px', textTransform:'uppercase' }}>Username</label>
                <input className="auth-input" type="text" placeholder="yourname" value={form.username} onChange={e => setForm({...form,username:e.target.value})} required />
              </div>
              <div style={{ marginBottom:'1.2rem' }}>
                <label style={{ display:'block', fontSize:'0.8rem', color:t.textDim, marginBottom:'0.5rem', letterSpacing:'1px', textTransform:'uppercase' }}>Email</label>
                <input className="auth-input" type="text" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form,email:e.target.value})} required />
              </div>
              <div style={{ marginBottom:'1.2rem' }}>
                <label style={{ display:'block', fontSize:'0.8rem', color:t.textDim, marginBottom:'0.5rem', letterSpacing:'1px', textTransform:'uppercase' }}>Password</label>
                <div style={{ position:'relative' }}>
                  <input className="auth-input" type={showPassword?'text':'password'} placeholder="••••••••" value={form.password} onChange={e => setForm({...form,password:e.target.value})} required />
                  <button type="button" className="show-btn" onClick={() => setShowPassword(!showPassword)}>{showPassword?'🙈':'👁️'}</button>
                </div>
                {form.password && <div style={{ marginTop:'0.4rem', fontSize:'0.8rem', color:passwordRegex.test(form.password)?t.teal:t.errorText }}>{passwordRegex.test(form.password)?'✓ Strong password':'✗ Min 8 chars, uppercase, lowercase, number, special char'}</div>}
              </div>
              <div style={{ marginBottom:'2rem' }}>
                <label style={{ display:'block', fontSize:'0.8rem', color:t.textDim, marginBottom:'0.5rem', letterSpacing:'1px', textTransform:'uppercase' }}>Confirm Password</label>
                <div style={{ position:'relative' }}>
                  <input className="auth-input" type={showConfirm?'text':'password'} placeholder="••••••••" value={form.confirm} onChange={e => setForm({...form,confirm:e.target.value})} required />
                  <button type="button" className="show-btn" onClick={() => setShowConfirm(!showConfirm)}>{showConfirm?'🙈':'👁️'}</button>
                </div>
                {form.confirm && <div style={{ marginTop:'0.4rem', fontSize:'0.8rem', color:form.password===form.confirm?t.teal:t.errorText }}>{form.password===form.confirm?'✓ Passwords match':'✗ Passwords do not match'}</div>}
              </div>
              <button className="auth-btn" type="submit" disabled={loading}>{loading?'Creating account...':'Create Account'}</button>
            </form>

            <p style={{ textAlign:'center', marginTop:'1.5rem', color:t.textDim, fontSize:'0.9rem' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color:t.teal, textDecoration:'none', fontWeight:600 }}>Login</Link>
            </p>
          </div>
          <p style={{ textAlign:'center', marginTop:'1.5rem' }}>
            <Link to="/" style={{ color:t.textDim, textDecoration:'none', fontSize:'0.85rem' }}>← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}