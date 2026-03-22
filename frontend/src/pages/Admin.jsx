import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/config'
import Navbar from '../components/Navbar'
import { useTheme } from '../context/ThemeContext'

export default function Admin() {
  const navigate = useNavigate()
  const { t, darkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('resources')
  const [particles, setParticles] = useState([])

  // Resources state
  const [specialists, setSpecialists] = useState([])
  const [expandedTeam, setExpandedTeam] = useState(null) // 'blue' or 'red'
  const [selectedSpecialist, setSelectedSpecialist] = useState(null)
  const [levels, setLevels] = useState([])
  const [resources, setResources] = useState([])
  const [resForm, setResForm] = useState({ level_id: '', title: '', url: '', type: 'article' })
  const [editResId, setEditResId] = useState(null)
  const [editResForm, setEditResForm] = useState({})

  // New specialist state
  const [specForm, setSpecForm] = useState({ team_id: '1', name: '', slug: '', description: '', avg_income: '' })

  // Questions state
  const [questions, setQuestions] = useState([])
  const [editQId, setEditQId] = useState(null)
  const [editQForm, setEditQForm] = useState({})
  const [newQ, setNewQ] = useState({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', order_index: '' })
  const [showAddQ, setShowAddQ] = useState(false)

  // Users state
  const [users, setUsers] = useState([])

  // Stats state
  const [stats, setStats] = useState(null)

  // Shared
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState('success')

  useEffect(() => {
    const role = localStorage.getItem('role')
    if (role !== 'admin') { navigate('/dashboard'); return }
    const p = Array.from({ length: 8 }, (_, i) => ({ id: i, x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 2 + 1, duration: Math.random() * 8 + 6, delay: Math.random() * 4 }))
    setParticles(p)
    loadSpecialists()
    loadQuestions()
    loadUsers()
    loadStats()
  }, [])

  const showMsg = (text, type = 'success') => { setMsg(text); setMsgType(type); setTimeout(() => setMsg(''), 3000) }

  const loadSpecialists = () => {
    API.get('/api/specialists/teams').then(res => {
      const raw = res.data.data
      const specs = []
      raw.forEach(row => {
        if (row.specialist_name && !specs.find(s => s.id === row.specialist_id)) {
          specs.push({ id: row.specialist_id, name: row.specialist_name, slug: row.specialist_slug, team: row.team_name, isBlue: row.team_name?.toLowerCase().includes('blue') })
        }
      })
      setSpecialists(specs)
    }).catch(() => {})
  }

  const handleToggleTeam = (team) => {
    // Click same team = collapse, click different = expand
    setExpandedTeam(prev => prev === team ? null : team)
    setSelectedSpecialist(null)
    setResources([])
    setLevels([])
  }

  const handleSelectSpecialist = (spec) => {
    // Click same specialist = deselect
    if (selectedSpecialist?.id === spec.id) {
      setSelectedSpecialist(null)
      setResources([])
      setLevels([])
      return
    }
    setSelectedSpecialist(spec)
    setResForm({ level_id: '', title: '', url: '', type: 'article' })
    setEditResId(null)
    API.get(`/api/specialists/${spec.slug}`).then(res => setLevels(res.data.levels)).catch(() => {})
    API.get('/api/admin/resources').then(res => {
      setResources(res.data.data.filter(r => r.specialist_name === spec.name))
    }).catch(() => {})
  }

  const loadQuestions = () => API.get('/api/admin/questions').then(res => setQuestions(res.data.questions)).catch(() => {})
  const loadUsers = () => API.get('/api/admin/users').then(res => setUsers(res.data.data)).catch(() => {})
  const loadStats = () => API.get('/api/admin/stats').then(res => setStats(res.data)).catch(() => {})

  // Resource handlers
  const handleAddResource = async () => {
    if (!resForm.level_id || !resForm.title || !resForm.url) { showMsg('All fields required', 'error'); return }
    try {
      await API.post('/api/admin/resources', resForm)
      showMsg('✅ Resource added!')
      setResForm({ level_id: '', title: '', url: '', type: 'article' })
      handleSelectSpecialist(selectedSpecialist)
    } catch { showMsg('❌ Failed to add', 'error') }
  }

  const handleUpdateResource = async (id) => {
    try {
      await API.put(`/api/admin/resources/${id}`, editResForm)
      showMsg('✅ Updated!')
      setEditResId(null)
      handleSelectSpecialist(selectedSpecialist)
    } catch { showMsg('❌ Failed', 'error') }
  }

  const handleDeleteResource = async (id) => {
    if (!confirm('Delete this resource?')) return
    try {
      await API.delete(`/api/admin/resources/${id}`)
      showMsg('✅ Deleted!')
      handleSelectSpecialist(selectedSpecialist)
    } catch { showMsg('❌ Failed', 'error') }
  }

  // Specialist handlers
  const handleAddSpecialist = async () => {
    if (!specForm.name || !specForm.slug) { showMsg('Name and slug required', 'error'); return }
    try {
      await API.post('/api/admin/specialists', specForm)
      showMsg('✅ Specialist added with 4 levels!')
      setSpecForm({ team_id: '1', name: '', slug: '', description: '', avg_income: '' })
      loadSpecialists()
    } catch { showMsg('❌ Failed to add specialist', 'error') }
  }

  // Question handlers
  const handleAddQuestion = async () => {
    if (!newQ.question_text || !newQ.option_a || !newQ.option_b || !newQ.option_c || !newQ.option_d) { showMsg('All question fields required', 'error'); return }
    try {
      await API.post('/api/admin/questions', newQ)
      showMsg('✅ Question added!')
      setNewQ({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', order_index: '' })
      setShowAddQ(false)
      loadQuestions()
    } catch { showMsg('❌ Failed', 'error') }
  }

  const handleUpdateQuestion = async (id) => {
    try {
      await API.put(`/api/admin/questions/${id}`, editQForm)
      showMsg('✅ Question updated!')
      setEditQId(null)
      loadQuestions()
    } catch { showMsg('❌ Failed', 'error') }
  }

  const handleDeleteQuestion = async (id) => {
    if (!confirm('Delete this question?')) return
    try {
      await API.delete(`/api/admin/questions/${id}`)
      showMsg('✅ Deleted!')
      loadQuestions()
    } catch { showMsg('❌ Failed', 'error') }
  }

  const typeIcons = { video: '🎥', article: '📄', course: '🎓', tool: '🛠️' }
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'

  const blueSpecialists = specialists.filter(s => s.isBlue)
  const redSpecialists = specialists.filter(s => !s.isBlue)

  const tabs = [
    { key: 'stats', label: '📊 Stats' },
    { key: 'resources', label: '📚 Resources' },
    { key: 'specialists', label: '➕ New Skill' },
    { key: 'questions', label: '❓ Questions' },
    { key: 'users', label: '👥 Users' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text, fontFamily: "'Rajdhani',sans-serif", overflowX: 'hidden', position: 'relative', transition: 'all 0.3s' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        @keyframes floatUp{0%,100%{transform:translateY(0);opacity:0.4}50%{transform:translateY(-20px);opacity:0.7}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}

        .admin-input{width:100%;padding:0.7rem 1rem;background:${t.inputBg};border:1px solid ${t.inputBorder};border-radius:8px;color:${t.text};font-family:'Rajdhani',sans-serif;font-size:0.95rem;outline:none;transition:all 0.2s}
        .admin-input:focus{border-color:${t.teal};box-shadow:0 0 0 3px ${t.tealDim}}
        .admin-input::placeholder{color:${t.textDim}}
        select.admin-input option{background:${darkMode?'#0a1628':'#fff'};color:${t.text}}

        .tab-btn{padding:0.6rem 1.2rem;border-radius:8px;border:none;background:none;cursor:pointer;transition:all 0.2s;font-family:'Rajdhani',sans-serif;font-size:0.9rem;font-weight:600;color:${t.textDim};letter-spacing:0.5px;border-bottom:2px solid transparent}
        .tab-btn:hover{color:${t.text}}
        .tab-btn.active{color:${t.teal};border-bottom-color:${t.teal}}

        .team-header{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.2rem;border-radius:10px;border:1px solid ${t.tealBorder};background:${t.card};cursor:pointer;transition:all 0.25s;user-select:none}
        .team-header:hover{border-color:${t.tealMid}}
        .team-header.expanded-blue{border-color:#4fc3f7;background:rgba(79,195,247,0.08)}
        .team-header.expanded-red{border-color:#ff6b6b;background:rgba(255,107,107,0.08)}

        .spec-item{display:flex;align-items:center;gap:0.8rem;padding:0.7rem 1rem 0.7rem 2rem;border-radius:8px;border:1px solid ${t.tealBorder};background:${t.tealDim};cursor:pointer;transition:all 0.2s;animation:slideDown 0.2s ease both}
        .spec-item:hover{border-color:${t.tealMid};transform:translateX(4px)}
        .spec-item.active{border-color:${t.teal};background:${t.card}}

        .res-row{display:grid;grid-template-columns:2fr 2fr auto auto auto;align-items:center;gap:0.8rem;padding:1rem 1.2rem;border-radius:10px;border:1px solid ${t.tealBorder};background:${t.card};margin-bottom:0.6rem;transition:all 0.2s}
        .res-row:hover{border-color:${t.tealMid}}

        .q-card{background:${t.card};border:1px solid ${t.tealBorder};border-radius:12px;padding:1.2rem;margin-bottom:0.8rem;transition:all 0.2s}
        .q-card:hover{border-color:${t.tealMid}}

        .user-row{display:grid;grid-template-columns:1.5fr 2fr 1.5fr 1.5fr 1fr;align-items:center;gap:0.8rem;padding:0.9rem 1.2rem;border-radius:10px;border:1px solid ${t.tealBorder};background:${t.card};margin-bottom:0.5rem;transition:all 0.2s}
        .user-row:hover{border-color:${t.tealMid}}

        .stat-card{background:${t.card};border:1px solid ${t.tealBorder};border-radius:12px;padding:1.5rem;text-align:center;transition:all 0.3s}
        .stat-card:hover{border-color:${t.tealMid};transform:translateY(-3px)}

        .btn-primary{background:${t.teal};border:none;color:${t.bg};font-family:'Orbitron',monospace;font-size:0.82rem;font-weight:700;cursor:pointer;padding:0.7rem 1.5rem;border-radius:8px;letter-spacing:1px;transition:all 0.2s}
        .btn-primary:hover{opacity:0.85;transform:translateY(-1px)}
        .btn-edit{background:${t.tealDim};border:1px solid ${t.tealBorder};color:${t.teal};font-family:'Rajdhani',sans-serif;font-size:0.85rem;font-weight:600;cursor:pointer;padding:0.35rem 0.8rem;border-radius:6px;transition:all 0.2s;white-space:nowrap}
        .btn-edit:hover{border-color:${t.tealMid}}
        .btn-del{background:${t.errorBg};border:1px solid ${t.errorBorder};color:${t.errorText};font-family:'Rajdhani',sans-serif;font-size:0.85rem;font-weight:600;cursor:pointer;padding:0.35rem 0.8rem;border-radius:6px;transition:all 0.2s;white-space:nowrap}
        .btn-del:hover{opacity:0.8}
        .btn-save{background:${t.teal};border:none;color:${t.bg};font-family:'Rajdhani',sans-serif;font-size:0.85rem;font-weight:700;cursor:pointer;padding:0.35rem 0.8rem;border-radius:6px;transition:all 0.2s;white-space:nowrap}

        @media(max-width:900px){.admin-grid{grid-template-columns:1fr !important}.res-row{grid-template-columns:1fr !important}.user-row{grid-template-columns:1fr 1fr !important}}
      `}</style>

      {particles.map(p => (<div key={p.id} style={{ position: 'fixed', left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, borderRadius: '50%', background: darkMode ? 'rgba(100,255,218,0.3)' : 'rgba(13,115,119,0.1)', animation: `floatUp ${p.duration}s ease-in-out ${p.delay}s infinite`, pointerEvents: 'none', zIndex: 0 }} />))}
      {darkMode && <div style={{ position: 'fixed', width: 400, height: 400, borderRadius: '50%', filter: 'blur(100px)', background: 'radial-gradient(circle,rgba(13,115,119,0.2),transparent 70%)', top: -100, left: -100, pointerEvents: 'none', zIndex: 0 }} />}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `linear-gradient(${t.gridColor} 1px,transparent 1px),linear-gradient(90deg,${t.gridColor} 1px,transparent 1px)`, backgroundSize: '60px 60px', pointerEvents: 'none', zIndex: 0 }} />

      <Navbar activePage="admin" />

      <main style={{ position: 'relative', zIndex: 1, padding: '6rem 2rem 4rem', maxWidth: 1300, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem', animation: 'fadeUp 0.6s ease both' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: `1px solid ${t.tealMid}`, borderRadius: 50, padding: '0.3rem 1rem', fontSize: '0.75rem', color: t.teal, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '1rem' }}>
            <div style={{ width: 5, height: 5, background: t.teal, borderRadius: '50%' }} />
            Admin Panel
          </div>
          <h1 style={{ fontFamily: "'Orbitron',monospace", fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 900, color: t.text }}>Control Center</h1>
        </div>

        {/* Notification */}
        {msg && (
          <div style={{ background: msgType === 'success' ? t.tealDim : t.errorBg, border: `1px solid ${msgType === 'success' ? t.teal : t.errorBorder}`, borderRadius: 8, padding: '0.8rem 1rem', marginBottom: '1.5rem', color: msgType === 'success' ? t.teal : t.errorText, fontSize: '0.9rem', animation: 'fadeUp 0.3s ease both' }}>
            {msg}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.3rem', borderBottom: `1px solid ${t.tealBorder}`, marginBottom: '2rem', overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button key={tab.key} className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── STATS TAB ── */}
        {activeTab === 'stats' && (
          <div style={{ animation: 'fadeUp 0.5s ease both' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="stat-card">
                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '2.5rem', fontWeight: 900, color: t.teal }}>{stats?.totalUsers || 0}</div>
                <div style={{ color: t.textDim, fontSize: '0.85rem', marginTop: '0.3rem', letterSpacing: '1px' }}>Total Users</div>
              </div>
              <div className="stat-card">
                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '2.5rem', fontWeight: 900, color: t.teal }}>{specialists.length}</div>
                <div style={{ color: t.textDim, fontSize: '0.85rem', marginTop: '0.3rem', letterSpacing: '1px' }}>Specialists</div>
              </div>
              <div className="stat-card">
                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '2.5rem', fontWeight: 900, color: t.teal }}>{questions.length}</div>
                <div style={{ color: t.textDim, fontSize: '0.85rem', marginTop: '0.3rem', letterSpacing: '1px' }}>Questions</div>
              </div>
            </div>
            <div style={{ background: t.card, border: `1px solid ${t.tealBorder}`, borderRadius: 16, padding: '1.5rem' }}>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.75rem', color: t.textDim, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1.2rem' }}>Users per Career Path</div>
              {!stats?.careerPaths?.length ? (
                <div style={{ color: t.textDim, textAlign: 'center', padding: '1rem' }}>No assessments yet</div>
              ) : stats.careerPaths.map((cp, i) => (
                <div key={i} style={{ marginBottom: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.9rem', color: t.text, fontWeight: 500 }}>{cp.recommended_path}</span>
                    <span style={{ fontSize: '0.85rem', color: t.teal, fontFamily: "'Orbitron',monospace" }}>{cp.count}</span>
                  </div>
                  <div style={{ height: 6, background: t.tealDim, borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(cp.count / (stats?.totalUsers || 1)) * 100}%`, background: `linear-gradient(90deg,${t.teal},${t.tealMid})`, borderRadius: 4, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RESOURCES TAB ── */}
        {activeTab === 'resources' && (
          <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', alignItems: 'start', animation: 'fadeUp 0.5s ease both' }}>

            {/* LEFT — Accordion team selector */}
            <div style={{ position: 'sticky', top: '6rem' }}>
              <div style={{ fontSize: '0.7rem', color: t.textDim, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1rem', fontFamily: "'Orbitron',monospace" }}>
                Select Specialist
              </div>

              {/* Blue Team */}
              <div style={{ marginBottom: '0.6rem' }}>
                <div
                  className={`team-header ${expandedTeam === 'blue' ? 'expanded-blue' : ''}`}
                  onClick={() => handleToggleTeam('blue')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>🛡️</span>
                    <span style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.85rem', fontWeight: 700, color: darkMode ? '#4fc3f7' : '#2b6cb0' }}>Blue Team</span>
                    <span style={{ fontSize: '0.75rem', color: t.textDim }}>({blueSpecialists.length})</span>
                  </div>
                  <span style={{ color: expandedTeam === 'blue' ? (darkMode ? '#4fc3f7' : '#2b6cb0') : t.textDim, fontSize: '1rem', transition: 'transform 0.3s', display: 'inline-block', transform: expandedTeam === 'blue' ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                </div>

                {/* Blue specialists dropdown */}
                {expandedTeam === 'blue' && (
                  <div style={{ marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {blueSpecialists.map((spec, i) => (
                      <div
                        key={spec.id}
                        className={`spec-item ${selectedSpecialist?.id === spec.id ? 'active' : ''}`}
                        onClick={() => handleSelectSpecialist(spec)}
                        style={{ animationDelay: `${i * 0.04}s` }}
                      >
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: darkMode ? '#4fc3f7' : '#2b6cb0', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.88rem', fontWeight: 500, flex: 1 }}>{spec.name}</span>
                        {selectedSpecialist?.id === spec.id && <span style={{ color: t.teal, fontSize: '0.8rem' }}>✓</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Red Team */}
              <div>
                <div
                  className={`team-header ${expandedTeam === 'red' ? 'expanded-red' : ''}`}
                  onClick={() => handleToggleTeam('red')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>⚔️</span>
                    <span style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.85rem', fontWeight: 700, color: darkMode ? '#ff6b6b' : '#c53030' }}>Red Team</span>
                    <span style={{ fontSize: '0.75rem', color: t.textDim }}>({redSpecialists.length})</span>
                  </div>
                  <span style={{ color: expandedTeam === 'red' ? (darkMode ? '#ff6b6b' : '#c53030') : t.textDim, fontSize: '1rem', transition: 'transform 0.3s', display: 'inline-block', transform: expandedTeam === 'red' ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                </div>

                {/* Red specialists dropdown */}
                {expandedTeam === 'red' && (
                  <div style={{ marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {redSpecialists.map((spec, i) => (
                      <div
                        key={spec.id}
                        className={`spec-item ${selectedSpecialist?.id === spec.id ? 'active' : ''}`}
                        onClick={() => handleSelectSpecialist(spec)}
                        style={{ animationDelay: `${i * 0.04}s` }}
                      >
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: darkMode ? '#ff6b6b' : '#c53030', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.88rem', fontWeight: 500, flex: 1 }}>{spec.name}</span>
                        {selectedSpecialist?.id === spec.id && <span style={{ color: t.teal, fontSize: '0.8rem' }}>✓</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT — Content */}
            <div>
              {!selectedSpecialist ? (
                <div style={{ background: t.card, border: `1px solid ${t.tealBorder}`, borderRadius: 16, padding: '4rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👆</div>
                  <div style={{ color: t.textDim, fontFamily: "'Orbitron',monospace", fontSize: '0.85rem', letterSpacing: '1px' }}>
                    Click a team to expand, then select a specialist
                  </div>
                </div>
              ) : (<>
                {/* Specialist header */}
                <div style={{ background: t.card, border: `1px solid ${t.tealBorder}`, borderRadius: 14, padding: '1.2rem 1.5rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '1.8rem' }}>{selectedSpecialist.isBlue ? '🛡️' : '⚔️'}</div>
                  <div>
                    <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '1rem', fontWeight: 700, color: t.teal }}>{selectedSpecialist.name}</div>
                    <div style={{ fontSize: '0.82rem', color: t.textDim }}>{selectedSpecialist.team} · {resources.length} resources</div>
                  </div>
                </div>

                {/* Add form */}
                <div style={{ background: t.card, border: `1px solid ${t.tealBorder}`, borderRadius: 14, padding: '1.5rem', marginBottom: '1.2rem' }}>
                  <div style={{ fontSize: '0.7rem', color: t.textDim, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1rem', fontFamily: "'Orbitron',monospace" }}>Add Resource</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: t.textDim, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Level</label>
                      <select className="admin-input" value={resForm.level_id} onChange={e => setResForm({ ...resForm, level_id: e.target.value })}>
                        <option value="">Select level</option>
                        {levels.map(l => <option key={l.id} value={l.id}>{l.level_name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: t.textDim, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Type</label>
                      <select className="admin-input" value={resForm.type} onChange={e => setResForm({ ...resForm, type: e.target.value })}>
                        <option value="article">📄 Article</option>
                        <option value="video">🎥 Video</option>
                        <option value="course">🎓 Course</option>
                        <option value="tool">🛠️ Tool</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom: '0.8rem' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: t.textDim, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Title</label>
                    <input className="admin-input" placeholder="Resource title" value={resForm.title} onChange={e => setResForm({ ...resForm, title: e.target.value })} />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: t.textDim, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>URL</label>
                    <input className="admin-input" placeholder="https://..." value={resForm.url} onChange={e => setResForm({ ...resForm, url: e.target.value })} />
                  </div>
                  <button className="btn-primary" onClick={handleAddResource}>+ Add Resource</button>
                </div>

                {/* Resources list */}
                <div style={{ fontSize: '0.7rem', color: t.textDim, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.8rem', fontFamily: "'Orbitron',monospace" }}>
                  Resources ({resources.length})
                </div>
                {resources.length === 0 ? (
                  <div style={{ textAlign: 'center', color: t.textDim, padding: '2rem', border: `1px dashed ${t.tealBorder}`, borderRadius: 12 }}>
                    No resources yet for {selectedSpecialist.name}. Add one above!
                  </div>
                ) : resources.map(r => (
                  <div key={r.id} className="res-row">
                    {editResId === r.id ? (<>
                      <input className="admin-input" value={editResForm.title} onChange={e => setEditResForm({ ...editResForm, title: e.target.value })} />
                      <input className="admin-input" value={editResForm.url} onChange={e => setEditResForm({ ...editResForm, url: e.target.value })} />
                      <select className="admin-input" value={editResForm.type} onChange={e => setEditResForm({ ...editResForm, type: e.target.value })} style={{ width: 'auto' }}>
                        <option value="article">📄</option><option value="video">🎥</option>
                        <option value="course">🎓</option><option value="tool">🛠️</option>
                      </select>
                      <button className="btn-save" onClick={() => handleUpdateResource(r.id)}>Save</button>
                      <button className="btn-edit" onClick={() => setEditResId(null)}>Cancel</button>
                    </>) : (<>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: t.text }}>{typeIcons[r.type]} {r.title}</div>
                        <div style={{ fontSize: '0.75rem', color: t.textDim, marginTop: '0.2rem' }}>{r.level_name}</div>
                      </div>
                      <a href={r.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', color: t.teal, textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.url}</a>
                      <span style={{ fontSize: '0.72rem', color: t.textDim, textTransform: 'uppercase', letterSpacing: '1px' }}>{r.type}</span>
                      <button className="btn-edit" onClick={() => { setEditResId(r.id); setEditResForm({ title: r.title, url: r.url, type: r.type }) }}>Edit</button>
                      <button className="btn-del" onClick={() => handleDeleteResource(r.id)}>Delete</button>
                    </>)}
                  </div>
                ))}
              </>)}
            </div>
          </div>
        )}

        {/* ── NEW SPECIALIST TAB ── */}
        {activeTab === 'specialists' && (
          <div style={{ maxWidth: 600, animation: 'fadeUp 0.5s ease both' }}>
            <div style={{ background: t.card, border: `1px solid ${t.tealBorder}`, borderRadius: 16, padding: '2rem' }}>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.75rem', color: t.textDim, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Add New Specialist</div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: t.textDim, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Team</label>
                <select className="admin-input" value={specForm.team_id} onChange={e => setSpecForm({ ...specForm, team_id: e.target.value })}>
                  <option value="1">🛡️ Blue Team</option>
                  <option value="2">⚔️ Red Team</option>
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: t.textDim, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Name</label>
                <input className="admin-input" placeholder="e.g. Cloud Security Engineer" value={specForm.name} onChange={e => setSpecForm({ ...specForm, name: e.target.value })} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: t.textDim, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Slug</label>
                <input className="admin-input" placeholder="e.g. cloud-security" value={specForm.slug} onChange={e => setSpecForm({ ...specForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} />
                <div style={{ fontSize: '0.75rem', color: t.textDim, marginTop: '0.3rem' }}>Used in URLs like /specialist/cloud-security</div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: t.textDim, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Description</label>
                <textarea className="admin-input" placeholder="Describe what this specialist does..." value={specForm.description} onChange={e => setSpecForm({ ...specForm, description: e.target.value })} style={{ resize: 'vertical', minHeight: 80 }} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: t.textDim, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Average Income</label>
                <input className="admin-input" placeholder="e.g. $80,000 - $130,000/year" value={specForm.avg_income} onChange={e => setSpecForm({ ...specForm, avg_income: e.target.value })} />
              </div>
              <button className="btn-primary" onClick={handleAddSpecialist}>+ Add Specialist</button>
              <div style={{ fontSize: '0.82rem', color: t.textDim, marginTop: '0.8rem' }}>✨ Beginner → Intermediate → Advanced → Expert levels created automatically.</div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.75rem', color: t.textDim, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1rem' }}>All Specialists ({specialists.length})</div>
              {specialists.map(s => (
                <div key={s.id} style={{ background: t.card, border: `1px solid ${t.tealBorder}`, borderRadius: 10, padding: '0.9rem 1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.isBlue ? (darkMode ? '#4fc3f7' : '#2b6cb0') : (darkMode ? '#ff6b6b' : '#c53030'), flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: t.text }}>{s.name}</div>
                    <div style={{ fontSize: '0.75rem', color: t.textDim }}>{s.team} · /{s.slug}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── QUESTIONS TAB ── */}
        {activeTab === 'questions' && (
          <div style={{ animation: 'fadeUp 0.5s ease both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.75rem', color: t.textDim, letterSpacing: '2px', textTransform: 'uppercase' }}>Questions ({questions.length})</div>
              <button className="btn-primary" onClick={() => setShowAddQ(!showAddQ)}>{showAddQ ? 'Cancel' : '+ Add Question'}</button>
            </div>

            {showAddQ && (
              <div style={{ background: t.card, border: `1px solid ${t.teal}`, borderRadius: 14, padding: '1.5rem', marginBottom: '1.5rem', animation: 'fadeUp 0.3s ease both' }}>
                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.7rem', color: t.teal, letterSpacing: '2px', marginBottom: '1rem' }}>NEW QUESTION</div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: t.textDim, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Question</label>
                  <input className="admin-input" placeholder="Question text..." value={newQ.question_text} onChange={e => setNewQ({ ...newQ, question_text: e.target.value })} />
                </div>
                {['a', 'b', 'c', 'd'].map(opt => (
                  <div key={opt} style={{ marginBottom: '0.8rem' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: t.textDim, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Option {opt.toUpperCase()}</label>
                    <input className="admin-input" placeholder={`Option ${opt.toUpperCase()}...`} value={newQ[`option_${opt}`]} onChange={e => setNewQ({ ...newQ, [`option_${opt}`]: e.target.value })} />
                  </div>
                ))}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: t.textDim, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Order Index</label>
                  <input className="admin-input" type="number" placeholder="e.g. 13" value={newQ.order_index} onChange={e => setNewQ({ ...newQ, order_index: e.target.value })} style={{ width: 120 }} />
                </div>
                <button className="btn-primary" onClick={handleAddQuestion}>Save Question</button>
              </div>
            )}

            {questions.map((q, i) => (
              <div key={q.id} className="q-card">
                {editQId === q.id ? (
                  <div>
                    <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.7rem', color: t.teal, letterSpacing: '2px', marginBottom: '1rem' }}>EDITING Q{i + 1}</div>
                    <div style={{ marginBottom: '0.8rem' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: t.textDim, marginBottom: '0.3rem', textTransform: 'uppercase' }}>Question</label>
                      <input className="admin-input" value={editQForm.question_text} onChange={e => setEditQForm({ ...editQForm, question_text: e.target.value })} />
                    </div>
                    {['a', 'b', 'c', 'd'].map(opt => (
                      <div key={opt} style={{ marginBottom: '0.6rem' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: t.textDim, marginBottom: '0.3rem', textTransform: 'uppercase' }}>Option {opt.toUpperCase()}</label>
                        <input className="admin-input" value={editQForm[`option_${opt}`]} onChange={e => setEditQForm({ ...editQForm, [`option_${opt}`]: e.target.value })} />
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button className="btn-save" onClick={() => handleUpdateQuestion(q.id)}>Save</button>
                      <button className="btn-edit" onClick={() => setEditQId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.7rem', color: t.teal, fontFamily: "'Orbitron',monospace", letterSpacing: '2px', marginBottom: '0.5rem' }}>Q{i + 1}</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: t.text, marginBottom: '0.8rem' }}>{q.question_text}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                        {['A', 'B', 'C', 'D'].map(opt => (
                          <div key={opt} style={{ fontSize: '0.82rem', color: t.textDim, background: t.tealDim, padding: '0.4rem 0.8rem', borderRadius: 6 }}>
                            <span style={{ color: t.teal, fontWeight: 700, marginRight: '0.4rem' }}>{opt}.</span>
                            {q[`option_${opt.toLowerCase()}`]}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                      <button className="btn-edit" onClick={() => { setEditQId(q.id); setEditQForm({ question_text: q.question_text, option_a: q.option_a, option_b: q.option_b, option_c: q.option_c, option_d: q.option_d }) }}>Edit</button>
                      <button className="btn-del" onClick={() => handleDeleteQuestion(q.id)}>Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === 'users' && (
          <div style={{ animation: 'fadeUp 0.5s ease both' }}>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.75rem', color: t.textDim, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1rem' }}>All Users ({users.length})</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1.5fr 1.5fr 1fr', gap: '0.8rem', padding: '0.6rem 1.2rem', marginBottom: '0.5rem' }}>
              {['Username', 'Email', 'Career Path', 'Joined', 'Last Login'].map(h => (
                <div key={h} style={{ fontSize: '0.72rem', color: t.textDim, textTransform: 'uppercase', letterSpacing: '1px', fontFamily: "'Orbitron',monospace" }}>{h}</div>
              ))}
            </div>
            {users.length === 0 ? (
              <div style={{ textAlign: 'center', color: t.textDim, padding: '3rem', border: `1px dashed ${t.tealBorder}`, borderRadius: 12 }}>No users yet</div>
            ) : users.map(u => (
              <div key={u.id} className="user-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: t.tealDim, border: `1px solid ${t.tealBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: t.teal, fontWeight: 700, flexShrink: 0 }}>
                    {u.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: t.text }}>{u.username}</div>
                    <div style={{ fontSize: '0.72rem', color: u.role === 'admin' ? '#f6ad55' : t.textDim }}>{u.role}</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.82rem', color: t.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                <div style={{ fontSize: '0.82rem', color: u.recommended_path ? t.teal : t.textDim }}>{u.recommended_path || 'Not set'}</div>
                <div style={{ fontSize: '0.82rem', color: t.textDim }}>{formatDate(u.created_at)}</div>
                <div style={{ fontSize: '0.82rem', color: t.textDim }}>{formatDate(u.last_login)}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
} 