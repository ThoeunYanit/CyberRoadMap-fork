import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/config'
import Navbar from '../components/Navbar'
import { useTheme } from '../context/ThemeContext'

export default function Assessment() {
  const navigate = useNavigate()
  const { t, darkMode } = useTheme()
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [particles, setParticles] = useState([])

  useEffect(() => {
    const p = Array.from({ length: 15 }, (_, i) => ({ id: i, x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 3 + 1, duration: Math.random() * 8 + 6, delay: Math.random() * 4 }))
    setParticles(p)
    API.get('/api/assessment/questions')
      .then(res => { setQuestions(res.data.questions); setLoading(false) })
      .catch(() => { setError('Failed to load questions'); setLoading(false) })
  }, [])

  const handleAnswer = (option, text) => {
    setAnswers(prev => ({ ...prev, [current]: { option, text } }))
  }

  const handleNext = () => { if (current < questions.length - 1) setCurrent(prev => prev + 1) }
  const handleBack = () => { if (current > 0) setCurrent(prev => prev - 1) }

  const handleSubmit = async () => {
    // Allow submission even with skips — scoring.js handles it
    const answeredCount = Object.values(answers).filter(a => a.option !== 'E').length
    if (answeredCount < 5) {
      setError('Please answer at least 5 questions before submitting.')
      return
    }
    setError('')
    setAnalyzing(true)
    try {
      const formatted = questions.map((q, i) => ({
        question: q.question_text,
        answer: answers[i]?.text || '',
        option: answers[i]?.option || 'E', // send option letter — critical for scoring
      }))
      const res = await API.post('/api/assessment/analyze', { answers: formatted })
      localStorage.setItem('assessmentResult', JSON.stringify(res.data.result))
      navigate('/result')
    } catch (err) {
      setError('Analysis failed. Please try again.')
      setAnalyzing(false)
    }
  }

  const getOptions = (q) => [
    { key: 'A', text: q.option_a },
    { key: 'B', text: q.option_b },
    { key: 'C', text: q.option_c },
    { key: 'D', text: q.option_d },
    { key: 'E', text: q.option_e || 'Not sure / Skip' },
  ]

  const progress = questions.length > 0 ? ((Object.keys(answers).length / questions.length) * 100) : 0
  const currentAnswer = answers[current]
  const answeredNonSkip = Object.values(answers).filter(a => a.option !== 'E').length

  if (analyzing) return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Rajdhani',sans-serif", color: t.text, transition: 'all 0.3s' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Rajdhani:wght@400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.2)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .dot{width:10px;height:10px;border-radius:50%;background:${t.teal};animation:pulse 1.2s ease-in-out infinite}
        .dot:nth-child(2){animation-delay:0.2s}
        .dot:nth-child(3){animation-delay:0.4s}
      `}</style>
      <Navbar />
      <div style={{ width: 60, height: 60, border: `3px solid ${t.tealDim}`, borderTop: `3px solid ${t.teal}`, borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '2rem' }} />
      <h2 style={{ fontFamily: "'Orbitron',monospace", fontSize: '1.3rem', color: t.teal, marginBottom: '1rem', animation: 'fadeUp 0.5s ease both' }}>Analyzing your personality...</h2>
      <p style={{ color: t.textDim, fontSize: '0.9rem', marginBottom: '2rem', animation: 'fadeUp 0.5s ease 0.1s both' }}>Finding the perfect cybersecurity career for you</p>
      <div style={{ display: 'flex', gap: '0.6rem' }}><div className="dot" /><div className="dot" /><div className="dot" /></div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text, fontFamily: "'Rajdhani',sans-serif", overflowX: 'hidden', position: 'relative', transition: 'all 0.3s' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        @keyframes floatUp{0%,100%{transform:translateY(0) rotate(0deg);opacity:0.4}50%{transform:translateY(-25px) rotate(180deg);opacity:0.7}}
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glowPulse{0%,100%{box-shadow:0 0 15px ${t.tealDim}}50%{box-shadow:0 0 30px ${t.tealMid}}}

        .option-card{display:flex;align-items:flex-start;gap:1rem;padding:1rem 1.3rem;border-radius:10px;border:1px solid ${t.tealBorder};background:${t.card};cursor:pointer;transition:all 0.25s;text-align:left;width:100%;font-family:'Rajdhani',sans-serif}
        .option-card:hover{border-color:${t.tealMid};background:${t.tealDim};transform:translateX(4px)}
        .option-card.selected{border-color:${t.teal};background:${t.tealDim};box-shadow:0 0 20px ${t.tealDim}}
        .option-card.skip-option{border-style:dashed;opacity:0.75}
        .option-card.skip-option:hover{opacity:1}
        .option-card.skip-option.selected{border-color:${t.textDim};background:${t.tealDim};opacity:1}

        .btn-nav{padding:0.7rem 1.8rem;border-radius:8px;font-family:'Rajdhani',sans-serif;font-size:0.95rem;font-weight:600;cursor:pointer;transition:all 0.2s;letter-spacing:1px}
        .btn-back{background:none;border:1px solid ${t.tealBorder};color:${t.textDim}}
        .btn-back:hover{border-color:${t.tealMid};color:${t.text}}
        .btn-next{background:${t.tealDim};border:1px solid ${t.tealBorder};color:${t.teal}}
        .btn-next:hover:not(:disabled){border-color:${t.tealMid};transform:translateX(2px)}
        .btn-next:disabled{opacity:0.4;cursor:not-allowed}
        .btn-submit{background:${t.teal};border:none;color:${t.bg};font-family:'Orbitron',monospace;font-size:0.85rem;font-weight:700;letter-spacing:2px;animation:glowPulse 2s ease-in-out infinite}
        .btn-submit:hover:not(:disabled){opacity:0.9;transform:translateY(-2px)}
        .btn-submit:disabled{opacity:0.4;cursor:not-allowed;animation:none}
      `}</style>

      {particles.map(p => (<div key={p.id} style={{ position: 'fixed', left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, borderRadius: '50%', background: darkMode ? 'rgba(100,255,218,0.4)' : 'rgba(13,115,119,0.15)', animation: `floatUp ${p.duration}s ease-in-out ${p.delay}s infinite`, pointerEvents: 'none', zIndex: 0 }} />))}
      {darkMode && <>
        <div style={{ position: 'fixed', width: 500, height: 500, borderRadius: '50%', filter: 'blur(120px)', background: 'radial-gradient(circle,rgba(13,115,119,0.25),transparent 70%)', top: -150, left: -150, pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'fixed', width: 400, height: 400, borderRadius: '50%', filter: 'blur(100px)', background: 'radial-gradient(circle,rgba(20,160,133,0.15),transparent 70%)', bottom: -100, right: -100, pointerEvents: 'none', zIndex: 0 }} />
      </>}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `linear-gradient(${t.gridColor} 1px,transparent 1px),linear-gradient(90deg,${t.gridColor} 1px,transparent 1px)`, backgroundSize: '60px 60px', pointerEvents: 'none', zIndex: 0 }} />

      <Navbar activePage="assessment" />

      <main style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem 4rem' }}>
        {loading ? (
          <div style={{ color: t.teal, fontFamily: "'Orbitron',monospace", fontSize: '0.9rem', letterSpacing: '2px' }}>Loading questions...</div>
        ) : error && questions.length === 0 ? (
          <div style={{ color: t.errorText }}>{error}</div>
        ) : (
          <div style={{ width: '100%', maxWidth: 720, animation: 'fadeSlideUp 0.6s ease both' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: `1px solid ${t.tealMid}`, borderRadius: 50, padding: '0.3rem 1rem', fontSize: '0.75rem', color: t.teal, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '1rem' }}>
                <div style={{ width: 5, height: 5, background: t.teal, borderRadius: '50%' }} />
                Career Assessment
              </div>
              <h1 style={{ fontFamily: "'Orbitron',monospace", fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 700, color: t.text }}>Find Your Path</h1>
              <p style={{ color: t.textDim, fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Answer honestly — there are no right or wrong answers. You can skip if unsure.
              </p>
            </div>

            {/* Progress */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.85rem', color: t.textDim, letterSpacing: '1px' }}>Question {current + 1} of {questions.length}</span>
                <span style={{ fontSize: '0.85rem', color: t.teal, fontFamily: "'Orbitron',monospace" }}>{answeredNonSkip} answered · {Object.values(answers).filter(a => a.option === 'E').length} skipped</span>
              </div>
              <div style={{ height: 4, background: t.tealDim, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg,${t.teal},${t.tealMid})`, borderRadius: 4, transition: 'width 0.4s ease', boxShadow: `0 0 10px ${t.tealMid}` }} />
              </div>

              {/* Step dots */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.8rem' }}>
                {questions.map((_, i) => {
                  const ans = answers[i]
                  const isSkipped = ans?.option === 'E'
                  const isAnswered = ans && !isSkipped
                  const isCurrent = i === current
                  return (
                    <div key={i}
                      onClick={() => answers[i] && setCurrent(i)}
                      style={{
                        width: 28, height: 28, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.65rem', fontWeight: 700,
                        cursor: answers[i] ? 'pointer' : 'default',
                        background: isCurrent ? t.teal : isAnswered ? t.tealDim : 'transparent',
                        border: isCurrent ? 'none' : isSkipped ? `1px dashed ${t.textDim}` : isAnswered ? `1px solid ${t.tealMid}` : `1px solid ${t.tealBorder}`,
                        color: isCurrent ? t.bg : isAnswered ? t.teal : isSkipped ? t.textDim : t.textDim,
                        transition: 'all 0.3s',
                        fontFamily: "'Orbitron',monospace",
                      }}>
                      {isCurrent ? i + 1 : isAnswered ? '✓' : isSkipped ? '—' : i + 1}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Question card */}
            {questions[current] && (
              <div style={{ background: t.card, border: `1px solid ${t.tealBorder}`, borderRadius: 16, padding: '2rem', backdropFilter: 'blur(10px)', marginBottom: '1.5rem', transition: 'all 0.3s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: t.tealDim, border: `1px solid ${t.tealBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Orbitron',monospace", fontSize: '0.8rem', color: t.teal, flexShrink: 0 }}>{current + 1}</div>
                  <h2 style={{ fontSize: 'clamp(1rem,2vw,1.15rem)', fontWeight: 600, color: t.text, lineHeight: 1.5 }}>{questions[current].question_text}</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                  {/* Options A-D */}
                  {getOptions(questions[current]).filter(o => o.key !== 'E').map(opt => (
                    <button key={opt.key}
                      className={`option-card ${currentAnswer?.option === opt.key ? 'selected' : ''}`}
                      onClick={() => handleAnswer(opt.key, opt.text)}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, background: currentAnswer?.option === opt.key ? t.teal : t.tealDim, border: currentAnswer?.option === opt.key ? 'none' : `1px solid ${t.tealBorder}`, color: currentAnswer?.option === opt.key ? t.bg : t.teal, transition: 'all 0.2s', fontFamily: "'Orbitron',monospace" }}>{opt.key}</div>
                      <span style={{ fontSize: '0.95rem', color: currentAnswer?.option === opt.key ? t.text : t.textDim, lineHeight: 1.5, transition: 'color 0.2s' }}>{opt.text}</span>
                    </button>
                  ))}

                  {/* Divider before skip */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: '0.3rem 0' }}>
                    <div style={{ flex: 1, height: 1, background: t.tealBorder }} />
                    <span style={{ fontSize: '0.72rem', color: t.textDim, letterSpacing: '1px' }}>OR</span>
                    <div style={{ flex: 1, height: 1, background: t.tealBorder }} />
                  </div>

                  {/* Option E — Skip */}
                  <button
                    className={`option-card skip-option ${currentAnswer?.option === 'E' ? 'selected' : ''}`}
                    onClick={() => handleAnswer('E', 'Not sure / Skip')}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, background: currentAnswer?.option === 'E' ? t.textDim : 'transparent', border: `1px dashed ${t.textDim}`, color: t.textDim, transition: 'all 0.2s', fontFamily: "'Orbitron',monospace" }}>?</div>
                    <div>
                      <span style={{ fontSize: '0.92rem', color: t.textDim, lineHeight: 1.5 }}>Not sure / Skip this question</span>
                      <div style={{ fontSize: '0.75rem', color: t.textDim, marginTop: '0.15rem', opacity: 0.7 }}>Skipped questions won't affect your result much</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div style={{ background: t.errorBg, border: `1px solid ${t.errorBorder}`, borderRadius: 8, padding: '0.8rem 1rem', marginBottom: '1rem', color: t.errorText, fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button className="btn-nav btn-back" onClick={handleBack} disabled={current === 0} style={{ opacity: current === 0 ? 0.3 : 1 }}>← Back</button>
              <span style={{ fontSize: '0.8rem', color: t.textDim, fontFamily: "'Orbitron',monospace" }}>
                {answeredNonSkip}/{questions.length} answered
              </span>
              {current < questions.length - 1 ? (
                <button className="btn-nav btn-next" onClick={handleNext} disabled={!currentAnswer}>Next →</button>
              ) : (
                <button className="btn-nav btn-submit" onClick={handleSubmit} disabled={Object.keys(answers).length < questions.length}>
                  Analyze →
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}