import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import API from '../api/config'
import Navbar from '../components/Navbar'
import { useTheme } from '../context/ThemeContext'

export default function VerifyOTP() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { t, darkMode } = useTheme()

  const userId = searchParams.get('userId')
  const email = searchParams.get('email')

  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMsg, setResendMsg] = useState('')

  useEffect(() => {
    if (!userId) navigate('/login')
  }, [userId, navigate])

  const handleVerify = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await API.post('/api/auth/verify-otp', { userId, otp })
      const { token, userId: uid, username, role } = res.data
      localStorage.setItem('token', token)
      localStorage.setItem('userId', uid)
      localStorage.setItem('username', username)
      localStorage.setItem('role', role || 'user')
      if (role === 'admin') navigate('/admin')
      else navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    setResendMsg('')
    setError('')
    try {
      await API.post('/api/auth/resend-otp', { userId })
      setResendMsg('OTP resent! Check your email.')
    } catch (err) {
      setError('Failed to resend OTP')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:t.bg, transition:'background 0.3s', fontFamily:"'Rajdhani',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@400;500;600&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        .auth-btn{width:100%;padding:0.9rem;background:${t.teal};border:none;border-radius:8px;color:${t.bg};font-family:'Orbitron',monospace;font-size:0.85rem;font-weight:700;letter-spacing:2px;cursor:pointer;transition:all 0.2s}
        .auth-btn:hover:not(:disabled){opacity:0.9;transform:translateY(-1px);box-shadow:0 4px 20px ${t.tealMid}}
        .auth-btn:disabled{opacity:0.6;cursor:not-allowed}
        .otp-input{width:100%;padding:1rem;background:${t.inputBg};border:2px solid ${t.teal};border-radius:8px;color:${t.text};font-family:'Orbitron',monospace;font-size:1.8rem;letter-spacing:16px;text-align:center;outline:none;transition:all 0.2s}
        .otp-input:focus{box-shadow:0 0 0 3px ${t.tealDim}}
      `}</style>

      <div style={{ position:'fixed', inset:0, backgroundImage:`linear-gradient(${t.gridColor} 1px,transparent 1px),linear-gradient(90deg,${t.gridColor} 1px,transparent 1px)`, backgroundSize:'60px 60px', pointerEvents:'none', zIndex:0 }} />
      {darkMode && <>
        <div style={{ position:'fixed', width:400, height:400, borderRadius:'50%', filter:'blur(100px)', background:'radial-gradient(circle,rgba(13,115,119,0.25),transparent 70%)', top:-100, left:-100, pointerEvents:'none', zIndex:0 }} />
      </>}

      <Navbar />

      <div style={{ position:'relative', zIndex:1, minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'6rem 2rem 4rem' }}>
        <div style={{ width:'100%', maxWidth:420, animation:'fadeSlideUp 0.6s ease both' }}>
          <div style={{ background:t.card, border:`1px solid ${t.tealBorder}`, borderRadius:16, padding:'2.5rem', backdropFilter:'blur(12px)', boxShadow:darkMode?'0 20px 60px rgba(0,0,0,0.3)':'0 10px 40px rgba(0,0,0,0.08)' }}>

            <div style={{ textAlign:'center', marginBottom:'2rem' }}>
              <div style={{ fontSize:'3rem', marginBottom:'0.8rem' }}>📧</div>
              <h2 style={{ fontFamily:"'Orbitron',monospace", fontSize:'1.2rem', fontWeight:700, color:t.text, marginBottom:'0.5rem' }}>Verify Your Identity</h2>
              <p style={{ color:t.textDim, fontSize:'0.9rem' }}>
                We sent a 6-digit OTP to{' '}
                <strong style={{ color:t.teal }}>{decodeURIComponent(email || '')}</strong>
              </p>
            </div>

            {error && (
              <div style={{ background:t.errorBg, border:`1px solid ${t.errorBorder}`, borderRadius:8, padding:'0.8rem', marginBottom:'1rem', color:t.errorText, fontSize:'0.9rem', textAlign:'center' }}>
                {error}
              </div>
            )}

            {resendMsg && (
              <div style={{ background:t.tealDim, border:`1px solid ${t.teal}`, borderRadius:8, padding:'0.8rem', marginBottom:'1rem', color:t.teal, fontSize:'0.9rem', textAlign:'center' }}>
                {resendMsg}
              </div>
            )}

            <input
              className="otp-input"
              type="text"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              style={{ marginBottom:'1.5rem' }}
            />

            <button
              className="auth-btn"
              onClick={handleVerify}
              disabled={loading || otp.length !== 6}
              style={{ marginBottom:'1rem' }}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <button
                onClick={handleResend}
                disabled={resendLoading}
                style={{ background:'none', border:'none', color:t.teal, cursor:'pointer', fontSize:'0.85rem', fontFamily:"'Rajdhani',sans-serif", padding:0 }}
              >
                {resendLoading ? 'Sending...' : '↺ Resend OTP'}
              </button>
              <button
                onClick={() => navigate('/login')}
                style={{ background:'none', border:'none', color:t.textDim, cursor:'pointer', fontSize:'0.85rem', fontFamily:"'Rajdhani',sans-serif", padding:0 }}
              >
                ← Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}