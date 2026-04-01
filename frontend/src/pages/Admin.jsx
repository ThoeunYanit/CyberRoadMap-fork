import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/config'
import Navbar from '../components/Navbar'
import { useTheme } from '../context/ThemeContext'


export default function Admin() {
  const navigate = useNavigate()
  const { t, darkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('content')
  const [particles, setParticles] = useState([])

  // Specialist selection
  const [blueSpecs, setBlueSpecs] = useState([])
  const [redSpecs, setRedSpecs] = useState([])
  const [expandedTeam, setExpandedTeam] = useState(null)
  const [selectedSpec, setSelectedSpec] = useState(null)
  const [levels, setLevels] = useState([])

  // Content sub-tab: resources | projects | certificates
  const [contentTab, setContentTab] = useState('resources')

  // Resources
  const [resources, setResources] = useState([])
  const [resForm, setResForm] = useState({ level_id: '', title: '', url: '', type: 'article' })
  const [editResId, setEditResId] = useState(null)
  const [editResForm, setEditResForm] = useState({})

  // Projects
  const [projects, setProjects] = useState([])
  const [projForm, setProjForm] = useState({ level_id: '', title: '', description: '', url: '', difficulty: 'easy' })
  const [editProjId, setEditProjId] = useState(null)
  const [editProjForm, setEditProjForm] = useState({})
  const [expandedDescId, setExpandedDescId] = useState(null)

  // Certificates
  const [certs, setCerts] = useState([])
  const [certForm, setCertForm] = useState({ level_id: '', name: '', provider: '', url: '' })
  const [editCertId, setEditCertId] = useState(null)
  const [editCertForm, setEditCertForm] = useState({})

  // New specialist
  const [specForm, setSpecForm] = useState({ team_id: '1', name: '', slug: '', description: '', avg_income: '' })

  // Questions
  const [questions, setQuestions] = useState([])
  const [editQId, setEditQId] = useState(null)
  const [editQForm, setEditQForm] = useState({})
  const [newQ, setNewQ] = useState({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', order_index: '' })
  const [showAddQ, setShowAddQ] = useState(false)

  // Users & Stats
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)

  // Shared
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState('success')

  useEffect(() => {
    if (localStorage.getItem('role') !== 'admin') { navigate('/dashboard'); return }
    setParticles(Array.from({ length: 8 }, (_, i) => ({ id: i, x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 2 + 1, duration: Math.random() * 8 + 6, delay: Math.random() * 4 })))
    loadAll()
  }, [])

  const showMsg = (text, type = 'success') => { setMsg(text); setMsgType(type); setTimeout(() => setMsg(''), 3000) }

  const loadAll = () => {
    API.get('/api/specialists/teams').then(res => {
      const raw = res.data.data || []
      const blue = [], red = [], seen = new Set()
      raw.forEach(row => {
        if (!row.specialist_id || seen.has(row.specialist_id)) return
        seen.add(row.specialist_id)
        const s = { id: row.specialist_id, name: row.specialist_name, slug: row.specialist_slug, team: row.team_name, isBlue: row.team_id === 1 }
        if (row.team_id === 1) blue.push(s); else red.push(s)
      })
      setBlueSpecs(blue); setRedSpecs(red)
    }).catch(() => {})
    API.get('/api/admin/questions').then(res => setQuestions(res.data.questions || [])).catch(() => {})
    API.get('/api/admin/users').then(res => setUsers(res.data.data || [])).catch(() => {})
    API.get('/api/admin/stats').then(res => setStats(res.data)).catch(() => {})
  }

  const handleToggleTeam = (team) => {
    setExpandedTeam(prev => prev === team ? null : team)
    setSelectedSpec(null); setResources([]); setProjects([]); setCerts([]); setLevels([])
    setEditResId(null); setEditProjId(null); setEditCertId(null)
  }

  const handleSelectSpec = (spec) => {
    if (selectedSpec?.id === spec.id) { setSelectedSpec(null); setResources([]); setProjects([]); setCerts([]); setLevels([]); return }
    setSelectedSpec(spec)
    setResForm({ level_id: '', title: '', url: '', type: 'article' })
    setProjForm({ level_id: '', title: '', description: '', url: '', difficulty: 'easy' })
    setCertForm({ level_id: '', name: '', provider: '', url: '' })
    setEditResId(null); setEditProjId(null); setEditCertId(null)
    API.get(`/api/specialists/${spec.slug}`).then(res => setLevels(res.data.levels || [])).catch(() => {})
    loadSpecContent(spec)
  }

  const loadSpecContent = (spec) => {
    const name = spec?.name || selectedSpec?.name
    if (!name) return
    API.get('/api/admin/resources').then(res => setResources((res.data.data || []).filter(r => r.specialist_name === name))).catch(() => {})
    API.get('/api/admin/projects').then(res => setProjects((res.data.data || []).filter(p => p.specialist_name === name))).catch(() => {})
    API.get('/api/admin/certificates').then(res => setCerts((res.data.data || []).filter(c => c.specialist_name === name))).catch(() => {})
  }

  // ── Resource handlers ──
  const handleAddResource = async () => {
    if (!resForm.level_id || !resForm.title || !resForm.url) { showMsg('All fields required', 'error'); return }
    try { await API.post('/api/admin/resources', resForm); showMsg('✅ Resource added!'); setResForm({ level_id: '', title: '', url: '', type: 'article' }); loadSpecContent(selectedSpec) }
    catch { showMsg('❌ Failed', 'error') }
  }
  const handleUpdateResource = async (id) => {
    try { await API.put(`/api/admin/resources/${id}`, editResForm); showMsg('✅ Updated!'); setEditResId(null); loadSpecContent(selectedSpec) }
    catch { showMsg('❌ Failed', 'error') }
  }
  const handleDeleteResource = async (id) => {
    if (!confirm('Delete this resource?')) return
    try { await API.delete(`/api/admin/resources/${id}`); showMsg('✅ Deleted!'); loadSpecContent(selectedSpec) }
    catch { showMsg('❌ Failed', 'error') }
  }

  // ── Project handlers ──
  const handleAddProject = async () => {
    if (!projForm.level_id || !projForm.title) { showMsg('Level and title required', 'error'); return }
    try {
      await API.post('/api/admin/projects', projForm)
      showMsg('✅ Project added!')
      setProjForm({ level_id: '', title: '', description: '', url: '', difficulty: 'easy' })
      loadSpecContent(selectedSpec)
    } catch { showMsg('❌ Failed', 'error') }
  }
  const handleUpdateProject = async (id) => {
    try { await API.put(`/api/admin/projects/${id}`, editProjForm); showMsg('✅ Updated!'); setEditProjId(null); loadSpecContent(selectedSpec) }
    catch { showMsg('❌ Failed', 'error') }
  }
  const handleDeleteProject = async (id) => {
    if (!confirm('Delete this project?')) return
    try { await API.delete(`/api/admin/projects/${id}`); showMsg('✅ Deleted!'); loadSpecContent(selectedSpec) }
    catch { showMsg('❌ Failed', 'error') }
  }

  // ── Certificate handlers ──
  const handleAddCert = async () => {
    if (!certForm.level_id || !certForm.name) { showMsg('Level and name required', 'error'); return }
    try { await API.post('/api/admin/certificates', certForm); showMsg('✅ Certificate added!'); setCertForm({ level_id: '', name: '', provider: '', url: '' }); loadSpecContent(selectedSpec) }
    catch { showMsg('❌ Failed', 'error') }
  }
  const handleUpdateCert = async (id) => {
    try { await API.put(`/api/admin/certificates/${id}`, editCertForm); showMsg('✅ Updated!'); setEditCertId(null); loadSpecContent(selectedSpec) }
    catch { showMsg('❌ Failed', 'error') }
  }
  const handleDeleteCert = async (id) => {
    if (!confirm('Delete this certificate?')) return
    try { await API.delete(`/api/admin/certificates/${id}`); showMsg('✅ Deleted!'); loadSpecContent(selectedSpec) }
    catch { showMsg('❌ Failed', 'error') }
  }

  // ── Specialist handlers ──
  const handleAddSpecialist = async () => {
    if (!specForm.name || !specForm.slug) { showMsg('Name and slug required', 'error'); return }
    try { await API.post('/api/admin/specialists', specForm); showMsg('✅ Specialist added!'); setSpecForm({ team_id: '1', name: '', slug: '', description: '', avg_income: '' }); loadAll() }
    catch { showMsg('❌ Failed', 'error') }
  }

  // ── Question handlers ──
  const handleAddQuestion = async () => {
    if (!newQ.question_text || !newQ.option_a || !newQ.option_b || !newQ.option_c || !newQ.option_d) { showMsg('All fields required', 'error'); return }
    try { await API.post('/api/admin/questions', newQ); showMsg('✅ Question added!'); setNewQ({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', order_index: '' }); setShowAddQ(false); loadAll() }
    catch { showMsg('❌ Failed', 'error') }
  }
  const handleUpdateQuestion = async (id) => {
    try { await API.put(`/api/admin/questions/${id}`, editQForm); showMsg('✅ Updated!'); setEditQId(null); loadAll() }
    catch { showMsg('❌ Failed', 'error') }
  }
  const handleDeleteQuestion = async (id) => {
    if (!confirm('Delete?')) return
    try { await API.delete(`/api/admin/questions/${id}`); showMsg('✅ Deleted!'); loadAll() }
    catch { showMsg('❌ Failed', 'error') }
  }

  const typeIcons = { video: '🎥', article: '📄', course: '🎓', tool: '🛠️' }
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'
  const blueColor = darkMode ? '#4fc3f7' : '#2b6cb0'
  const redColor = darkMode ? '#ff6b6b' : '#c53030'

  const difficultyConfig = {
    easy:         { label: 'Easy',         color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.3)'  },
    intermediate: { label: 'Intermediate', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
    hard:         { label: 'Hard',         color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)'  },
    challenge:    { label: 'Challenge ⚡',  color: '#a855f7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.3)' },
  }

  const DESC_LIMIT = 80

  const Label = ({ text }) => (
    <label style={{ display: 'block', fontSize: '0.75rem', color: t.textDim, marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{text}</label>
  )

  const LevelSelect = ({ value, onChange }) => (
    <select className="adm-in" value={value} onChange={e => onChange(e.target.value)}>
      <option value="">Select level</option>
      {levels.map(l => <option key={l.id} value={l.id}>{l.level_name}</option>)}
    </select>
  )

  const EditBtn = ({ onClick }) => <button className="be" onClick={onClick}>Edit</button>
  const DelBtn = ({ onClick }) => <button className="bd" onClick={onClick}>Delete</button>
  const SaveBtn = ({ onClick }) => <button className="bs" onClick={onClick}>Save</button>
  const CancelBtn = ({ onClick }) => <button className="be" onClick={onClick}>Cancel</button>

  const TeamSection = ({ team, specs, color, icon, label }) => (
    <div style={{ marginBottom: '0.6rem' }}>
      <div onClick={() => handleToggleTeam(team)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.1rem', borderRadius: 10, border: `1px solid ${expandedTeam === team ? color : t.tealBorder}`, background: expandedTeam === team ? `${color}12` : t.card, cursor: 'pointer', transition: 'all 0.25s', userSelect: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <span style={{ fontSize: '1.1rem' }}>{icon}</span>
          <span style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.85rem', fontWeight: 700, color }}>{label}</span>
          <span style={{ fontSize: '0.72rem', color: t.textDim, background: t.tealDim, padding: '0.1rem 0.5rem', borderRadius: 20 }}>{specs.length}</span>
        </div>
        <span style={{ color: expandedTeam === team ? color : t.textDim, fontSize: '0.85rem', display: 'inline-block', transition: 'transform 0.3s', transform: expandedTeam === team ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
      </div>
      {expandedTeam === team && (
        <div style={{ marginTop: '0.3rem', paddingLeft: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {specs.map((spec, i) => (
            <div key={spec.id} onClick={() => handleSelectSpec(spec)} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.65rem 1rem 0.65rem 1.5rem', borderRadius: 8, border: `1px solid ${selectedSpec?.id === spec.id ? color : t.tealBorder}`, background: selectedSpec?.id === spec.id ? `${color}15` : t.tealDim, cursor: 'pointer', transition: 'all 0.2s', animation: `slideDown 0.15s ease ${i * 0.03}s both` }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <span style={{ fontSize: '0.87rem', fontWeight: 500, flex: 1, color: selectedSpec?.id === spec.id ? color : t.text }}>{spec.name}</span>
              {selectedSpec?.id === spec.id && <span style={{ color, fontSize: '0.75rem' }}>✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: t.bg, color: t.text, fontFamily: "'Rajdhani',sans-serif", overflowX: 'hidden', position: 'relative', transition: 'all 0.3s' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        @keyframes floatUp{0%,100%{transform:translateY(0);opacity:0.4}50%{transform:translateY(-20px);opacity:0.7}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes descExpand{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}

        .adm-in{width:100%;padding:0.65rem 1rem;background:${t.inputBg};border:1px solid ${t.inputBorder};border-radius:8px;color:${t.text};font-family:'Rajdhani',sans-serif;font-size:0.93rem;outline:none;transition:all 0.2s}
        .adm-in:focus{border-color:${t.teal};box-shadow:0 0 0 3px ${t.tealDim}}
        .adm-in::placeholder{color:${t.textDim}}
        select.adm-in option{background:${darkMode ? '#0a1628' : '#ffffff'};color:${t.text}}

        .tab-btn{padding:0.55rem 1.1rem;border-radius:8px;border:none;background:none;cursor:pointer;font-family:'Rajdhani',sans-serif;font-size:0.88rem;font-weight:600;color:${t.textDim};border-bottom:2px solid transparent;transition:all 0.2s}
        .tab-btn:hover{color:${t.text}}
        .tab-btn.active{color:${t.teal};border-bottom-color:${t.teal}}

        .ctab-btn{padding:0.4rem 1rem;border-radius:6px;border:1px solid ${t.tealBorder};background:none;cursor:pointer;font-family:'Rajdhani',sans-serif;font-size:0.83rem;font-weight:600;color:${t.textDim};transition:all 0.2s}
        .ctab-btn:hover{color:${t.text};border-color:${t.tealMid}}
        .ctab-btn.active{color:${t.teal};border-color:${t.teal};background:${t.tealDim}}

        .row{display:grid;align-items:start;gap:0.7rem;padding:0.9rem 1.1rem;border-radius:10px;border:1px solid ${t.tealBorder};background:${t.card};margin-bottom:0.5rem;transition:all 0.2s}
        .row:hover{border-color:${t.tealMid}}
        .row-res{grid-template-columns:2fr 2fr auto auto auto}
        .row-cert{grid-template-columns:2fr 1.5fr 2fr auto auto}

        .proj-card{padding:1rem 1.2rem;border-radius:10px;border:1px solid ${t.tealBorder};background:${t.card};margin-bottom:0.5rem;transition:border-color 0.2s}
        .proj-card:hover{border-color:${t.tealMid}}

        .desc-toggle{display:inline-flex;align-items:center;gap:0.3rem;cursor:pointer;font-size:0.78rem;color:${t.teal};background:none;border:none;padding:0.2rem 0.5rem;border-radius:4px;transition:all 0.2s;font-family:'Rajdhani',sans-serif;font-weight:600}
        .desc-toggle:hover{background:${t.tealDim}}
        .desc-arrow{display:inline-block;transition:transform 0.25s cubic-bezier(0.4,0,0.2,1);font-size:0.7rem}
        .desc-arrow.open{transform:rotate(180deg)}
        .desc-body{overflow:hidden;transition:max-height 0.3s cubic-bezier(0.4,0,0.2,1),opacity 0.25s ease}
        .desc-body.collapsed{max-height:0;opacity:0}
        .desc-body.expanded{max-height:600px;opacity:1}
        .desc-content{padding:0.6rem 0 0.2rem;font-size:0.83rem;color:${t.textDim};line-height:1.6;animation:descExpand 0.25s ease both}
        .desc-content ul,.desc-content ol{padding-left:1.3rem;margin:0.3rem 0}
        .desc-content li{margin-bottom:0.25rem}
        .desc-content p{margin-bottom:0.3rem}

        .q-card{background:${t.card};border:1px solid ${t.tealBorder};border-radius:12px;padding:1.1rem;margin-bottom:0.7rem;transition:all 0.2s}
        .q-card:hover{border-color:${t.tealMid}}

        .u-row{display:grid;grid-template-columns:1.5fr 2fr 1.5fr 1.5fr 1fr;align-items:center;gap:0.7rem;padding:0.85rem 1.1rem;border-radius:10px;border:1px solid ${t.tealBorder};background:${t.card};margin-bottom:0.45rem;transition:all 0.2s}
        .u-row:hover{border-color:${t.tealMid}}

        .stat-card{background:${t.card};border:1px solid ${t.tealBorder};border-radius:12px;padding:1.3rem;text-align:center;transition:all 0.3s}
        .stat-card:hover{border-color:${t.tealMid};transform:translateY(-2px)}

        .bp{background:${t.teal};border:none;color:${t.bg};font-family:'Orbitron',monospace;font-size:0.8rem;font-weight:700;cursor:pointer;padding:0.65rem 1.4rem;border-radius:8px;letter-spacing:1px;transition:all 0.2s}
        .bp:hover{opacity:0.85;transform:translateY(-1px)}
        .be{background:${t.tealDim};border:1px solid ${t.tealBorder};color:${t.teal};font-family:'Rajdhani',sans-serif;font-size:0.83rem;font-weight:600;cursor:pointer;padding:0.3rem 0.75rem;border-radius:6px;white-space:nowrap;transition:all 0.2s}
        .be:hover{border-color:${t.tealMid}}
        .bd{background:${t.errorBg};border:1px solid ${t.errorBorder};color:${t.errorText};font-family:'Rajdhani',sans-serif;font-size:0.83rem;font-weight:600;cursor:pointer;padding:0.3rem 0.75rem;border-radius:6px;white-space:nowrap}
        .bs{background:${t.teal};border:none;color:${t.bg};font-family:'Rajdhani',sans-serif;font-size:0.83rem;font-weight:700;cursor:pointer;padding:0.3rem 0.75rem;border-radius:6px;white-space:nowrap}

        @media(max-width:900px){.agrid{grid-template-columns:1fr !important}.row-res,.row-cert,.u-row{grid-template-columns:1fr !important}}
      `}</style>

      {particles.map(p => (<div key={p.id} style={{ position: 'fixed', left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, borderRadius: '50%', background: darkMode ? 'rgba(100,255,218,0.3)' : 'rgba(13,115,119,0.1)', animation: `floatUp ${p.duration}s ease-in-out ${p.delay}s infinite`, pointerEvents: 'none', zIndex: 0 }} />))}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `linear-gradient(${t.gridColor} 1px,transparent 1px),linear-gradient(90deg,${t.gridColor} 1px,transparent 1px)`, backgroundSize: '60px 60px', pointerEvents: 'none', zIndex: 0 }} />

      <Navbar activePage="admin" />

      <main style={{ position: 'relative', zIndex: 1, padding: '6rem 2rem 4rem', maxWidth: 1300, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem', animation: 'fadeUp 0.5s ease both' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: `1px solid ${t.tealMid}`, borderRadius: 50, padding: '0.3rem 1rem', fontSize: '0.72rem', color: t.teal, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '0.8rem' }}>
            <div style={{ width: 5, height: 5, background: t.teal, borderRadius: '50%' }} /> Admin Panel
          </div>
          <h1 style={{ fontFamily: "'Orbitron',monospace", fontSize: 'clamp(1.4rem,3vw,1.9rem)', fontWeight: 900, color: t.text }}>Control Center</h1>
        </div>

        {msg && <div style={{ background: msgType === 'success' ? t.tealDim : t.errorBg, border: `1px solid ${msgType === 'success' ? t.teal : t.errorBorder}`, borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.2rem', color: msgType === 'success' ? t.teal : t.errorText, fontSize: '0.88rem', animation: 'fadeUp 0.3s ease both' }}>{msg}</div>}

        {/* Main tabs */}
        <div style={{ display: 'flex', gap: '0.2rem', borderBottom: `1px solid ${t.tealBorder}`, marginBottom: '2rem', overflowX: 'auto' }}>
          {[{ key: 'stats', label: '📊 Stats' }, { key: 'content', label: '📚 Content' }, { key: 'specialists', label: '➕ New Skill' }, { key: 'questions', label: '❓ Questions' }, { key: 'users', label: '👥 Users' }].map(tab => (
            <button key={tab.key} className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>{tab.label}</button>
          ))}
        </div>

        {/* ── STATS ── */}
        {activeTab === 'stats' && (
          <div style={{ animation: 'fadeUp 0.4s ease both' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.2rem', marginBottom: '1.5rem' }}>
              {[{ label: 'Total Users', val: stats?.totalUsers || 0 }, { label: 'Specialists', val: blueSpecs.length + redSpecs.length }, { label: 'Questions', val: questions.length }].map(s => (
                <div key={s.label} className="stat-card">
                  <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '2.2rem', fontWeight: 900, color: t.teal }}>{s.val}</div>
                  <div style={{ color: t.textDim, fontSize: '0.82rem', marginTop: '0.3rem', letterSpacing: '1px' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: t.card, border: `1px solid ${t.tealBorder}`, borderRadius: 14, padding: '1.4rem' }}>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.72rem', color: t.textDim, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1.1rem' }}>Users per Career Path</div>
              {!stats?.careerPaths?.length ? <div style={{ color: t.textDim, textAlign: 'center', padding: '1rem' }}>No assessments yet</div> :
                stats.careerPaths.map((cp, i) => (
                  <div key={i} style={{ marginBottom: '0.7rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.88rem', color: t.text }}>{cp.recommended_path}</span>
                      <span style={{ fontSize: '0.82rem', color: t.teal, fontFamily: "'Orbitron',monospace" }}>{cp.count}</span>
                    </div>
                    <div style={{ height: 5, background: t.tealDim, borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(cp.count / (stats?.totalUsers || 1)) * 100}%`, background: `linear-gradient(90deg,${t.teal},${t.tealMid})`, borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ── CONTENT ── */}
        {activeTab === 'content' && (
          <div className="agrid" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start', animation: 'fadeUp 0.4s ease both' }}>
            <div style={{ position: 'sticky', top: '6rem' }}>
              <div style={{ fontSize: '0.68rem', color: t.textDim, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.8rem', fontFamily: "'Orbitron',monospace" }}>Select Specialist</div>
              <TeamSection team="blue" specs={blueSpecs} color={blueColor} icon="🛡️" label="Blue Team" />
              <TeamSection team="red" specs={redSpecs} color={redColor} icon="⚔️" label="Red Team" />
            </div>

            <div>
              {!selectedSpec ? (
                <div style={{ background: t.card, border: `1px solid ${t.tealBorder}`, borderRadius: 14, padding: '4rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👆</div>
                  <div style={{ color: t.textDim, fontFamily: "'Orbitron',monospace", fontSize: '0.82rem', letterSpacing: '1px' }}>Click a team, then select a specialist</div>
                </div>
              ) : (<>
                <div style={{ background: t.card, border: `1px solid ${t.tealBorder}`, borderRadius: 12, padding: '1.1rem 1.4rem', marginBottom: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span style={{ fontSize: '1.6rem' }}>{selectedSpec.isBlue ? '🛡️' : '⚔️'}</span>
                  <div>
                    <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.95rem', fontWeight: 700, color: t.teal }}>{selectedSpec.name}</div>
                    <div style={{ fontSize: '0.8rem', color: t.textDim }}>{selectedSpec.team}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem' }}>
                  {[
                    { key: 'resources', label: `📚 Resources (${resources.length})` },
                    { key: 'projects', label: `🛠️ Projects (${projects.length})` },
                    { key: 'certificates', label: `🏆 Certificates (${certs.length})` },
                  ].map(ct => (
                    <button key={ct.key} className={`ctab-btn ${contentTab === ct.key ? 'active' : ''}`} onClick={() => setContentTab(ct.key)}>{ct.label}</button>
                  ))}
                </div>

                {/* ── RESOURCES ── */}
                {contentTab === 'resources' && (<>
                  <div style={{ background: t.card, border: `1px solid ${t.tealBorder}`, borderRadius: 12, padding: '1.4rem', marginBottom: '1.1rem' }}>
                    <div style={{ fontSize: '0.68rem', color: t.textDim, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.9rem', fontFamily: "'Orbitron',monospace" }}>Add Resource</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.8rem' }}>
                      <div><Label text="Level" /><LevelSelect value={resForm.level_id} onChange={v => setResForm({ ...resForm, level_id: v })} /></div>
                      <div>
                        <Label text="Type" />
                        <select className="adm-in" value={resForm.type} onChange={e => setResForm({ ...resForm, type: e.target.value })}>
                          <option value="article">📄 Article</option>
                          <option value="video">🎥 Video</option>
                          <option value="course">🎓 Course</option>
                          <option value="tool">🛠️ Tool</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ marginBottom: '0.7rem' }}><Label text="Title" /><input className="adm-in" placeholder="Resource title" value={resForm.title} onChange={e => setResForm({ ...resForm, title: e.target.value })} /></div>
                    <div style={{ marginBottom: '0.9rem' }}><Label text="URL" /><input className="adm-in" placeholder="https://..." value={resForm.url} onChange={e => setResForm({ ...resForm, url: e.target.value })} /></div>
                    <button className="bp" onClick={handleAddResource}>+ Add Resource</button>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: t.textDim, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.7rem', fontFamily: "'Orbitron',monospace" }}>Resources ({resources.length})</div>
                  {resources.length === 0 ? <div style={{ textAlign: 'center', color: t.textDim, padding: '1.5rem', border: `1px dashed ${t.tealBorder}`, borderRadius: 10 }}>No resources yet</div>
                    : resources.map(r => (
                      <div key={r.id} className="row row-res">
                        {editResId === r.id ? (<>
                          <input className="adm-in" value={editResForm.title} onChange={e => setEditResForm({ ...editResForm, title: e.target.value })} />
                          <input className="adm-in" value={editResForm.url} onChange={e => setEditResForm({ ...editResForm, url: e.target.value })} />
                          <select className="adm-in" value={editResForm.type} onChange={e => setEditResForm({ ...editResForm, type: e.target.value })} style={{ width: 'auto' }}>
                            <option value="article">📄</option><option value="video">🎥</option><option value="course">🎓</option><option value="tool">🛠️</option>
                          </select>
                          <SaveBtn onClick={() => handleUpdateResource(r.id)} />
                          <CancelBtn onClick={() => setEditResId(null)} />
                        </>) : (<>
                          <div><div style={{ fontSize: '0.87rem', fontWeight: 600, color: t.text }}>{typeIcons[r.type]} {r.title}</div><div style={{ fontSize: '0.73rem', color: t.textDim }}>{r.level_name}</div></div>
                          <a href={r.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.77rem', color: t.teal, textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.url}</a>
                          <span style={{ fontSize: '0.7rem', color: t.textDim, textTransform: 'uppercase' }}>{r.type}</span>
                          <EditBtn onClick={() => { setEditResId(r.id); setEditResForm({ title: r.title, url: r.url, type: r.type }) }} />
                          <DelBtn onClick={() => handleDeleteResource(r.id)} />
                        </>)}
                      </div>
                    ))}
                </>)}

                {/* ── PROJECTS ── */}
                {contentTab === 'projects' && (<>
                  {/* Add Project Form */}
                  <div style={{ background: t.card, border: `1px solid ${t.tealBorder}`, borderRadius: 12, padding: '1.4rem', marginBottom: '1.1rem' }}>
                    <div style={{ fontSize: '0.68rem', color: t.textDim, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.9rem', fontFamily: "'Orbitron',monospace" }}>Add Project</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.8rem' }}>
                      <div><Label text="Level" /><LevelSelect value={projForm.level_id} onChange={v => setProjForm({ ...projForm, level_id: v })} /></div>
                      <div>
                        <Label text="Difficulty" />
                        <select className="adm-in" value={projForm.difficulty} onChange={e => setProjForm({ ...projForm, difficulty: e.target.value })}>
                          <option value="easy">🟢 Easy</option>
                          <option value="intermediate">🟡 Intermediate</option>
                          <option value="hard">🔴 Hard</option>
                          <option value="challenge">⚡ Challenge</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ marginBottom: '0.7rem' }}><Label text="Title" /><input className="adm-in" placeholder="Project title" value={projForm.title} onChange={e => setProjForm({ ...projForm, title: e.target.value })} /></div>
                    <div style={{ marginBottom: '0.7rem' }}>
                      <Label text="Description (supports • bullets and 1. numbered lists)" />
                      <textarea
                        className="adm-in"
                        placeholder={"What will the user build?\n• Use • or - for bullet points\n1. Or numbers for ordered steps"}
                        value={projForm.description}
                        onChange={e => setProjForm({ ...projForm, description: e.target.value })}
                        style={{ resize: 'vertical', minHeight: 90, lineHeight: 1.6 }}
                      />
                      <div style={{ fontSize: '0.72rem', color: t.textDim, marginTop: '0.3rem' }}>
                        Tip: Start lines with <code style={{ background: t.tealDim, padding: '0 4px', borderRadius: 3 }}>•</code> or <code style={{ background: t.tealDim, padding: '0 4px', borderRadius: 3 }}>-</code> for bullets · <code style={{ background: t.tealDim, padding: '0 4px', borderRadius: 3 }}>1.</code> for numbered steps
                      </div>
                    </div>
                    <div style={{ marginBottom: '0.9rem' }}>
                      <Label text="Exercise URL (optional)" />
                      <input className="adm-in" placeholder="https://... (link to exercise page)" value={projForm.url} onChange={e => setProjForm({ ...projForm, url: e.target.value })} />
                    </div>
                    <button className="bp" onClick={handleAddProject}>+ Add Project</button>
                  </div>

                  {/* Project list */}
                  <div style={{ fontSize: '0.68rem', color: t.textDim, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.7rem', fontFamily: "'Orbitron',monospace" }}>Projects ({projects.length})</div>
                  {projects.length === 0
                    ? <div style={{ textAlign: 'center', color: t.textDim, padding: '1.5rem', border: `1px dashed ${t.tealBorder}`, borderRadius: 10 }}>No projects yet</div>
                    : projects.map(p => {
                      const isExpanded = expandedDescId === p.id
                      const isLong = (p.description || '').length > DESC_LIMIT
                      const diff = difficultyConfig[p.difficulty] || difficultyConfig.easy

                      return (
                        <div key={p.id} className="proj-card">
                          {editProjId === p.id ? (
                            /* ── EDIT MODE ── */
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem' }}>
                                <div>
                                  <Label text="Title" />
                                  <input className="adm-in" value={editProjForm.title} onChange={e => setEditProjForm({ ...editProjForm, title: e.target.value })} />
                                </div>
                                <div>
                                  <Label text="Difficulty" />
                                  <select className="adm-in" value={editProjForm.difficulty || 'easy'} onChange={e => setEditProjForm({ ...editProjForm, difficulty: e.target.value })}>
                                    <option value="easy">🟢 Easy</option>
                                    <option value="intermediate">🟡 Intermediate</option>
                                    <option value="hard">🔴 Hard</option>
                                    <option value="challenge">⚡ Challenge</option>
                                  </select>
                                </div>
                              </div>
                              <div>
                                <Label text="Description" />
                                <textarea className="adm-in" value={editProjForm.description} onChange={e => setEditProjForm({ ...editProjForm, description: e.target.value })} style={{ resize: 'vertical', minHeight: 80 }} />
                              </div>
                              <div>
                                <Label text="Exercise URL" />
                                <input className="adm-in" placeholder="https://..." value={editProjForm.url || ''} onChange={e => setEditProjForm({ ...editProjForm, url: e.target.value })} />
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <SaveBtn onClick={() => handleUpdateProject(p.id)} />
                                <CancelBtn onClick={() => setEditProjId(null)} />
                              </div>
                            </div>
                          ) : (
                            /* ── VIEW MODE ── */
                            <div>
                              {/* Top row: title + difficulty badge + actions */}
                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.7rem' }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: t.text }}>🛠️ {p.title}</span>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.55rem', borderRadius: 20, background: diff.bg, border: `1px solid ${diff.border}`, color: diff.color, letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                                      {diff.label}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '0.73rem', color: t.textDim }}>{p.level_name}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0, marginTop: '0.1rem' }}>
                                  <EditBtn onClick={() => { setEditProjId(p.id); setEditProjForm({ title: p.title, description: p.description || '', url: p.url || '', difficulty: p.difficulty || 'easy' }) }} />
                                  <DelBtn onClick={() => handleDeleteProject(p.id)} />
                                </div>
                              </div>

                              {/* Exercise URL link */}
                              {p.url && (
                                <div style={{ marginTop: '0.45rem' }}>
                                  <a
                                    href={p.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: t.teal, textDecoration: 'none', padding: '0.2rem 0.6rem', borderRadius: 5, border: `1px solid ${t.tealBorder}`, background: t.tealDim, transition: 'all 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = t.teal}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = t.tealBorder}
                                  >
                                    🔗 Exercise Page
                                  </a>
                                </div>
                              )}

                              {/* Description with collapse/expand */}
                              {p.description && (
                                <div style={{ marginTop: '0.55rem' }}>
                                  {isLong ? (
                                    <>
                                      <button
                                        className="desc-toggle"
                                        onClick={() => setExpandedDescId(isExpanded ? null : p.id)}
                                      >
                                        <span className={`desc-arrow ${isExpanded ? 'open' : ''}`}>▼</span>
                                        {isExpanded ? 'Hide description' : 'Show description'}
                                      </button>
                                      <div className={`desc-body ${isExpanded ? 'expanded' : 'collapsed'}`}>
                                        <DescriptionRenderer text={p.description} t={t} />
                                      </div>
                                    </>
                                  ) : (
                                    <DescriptionRenderer text={p.description} t={t} />
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                </>)}

                {/* ── CERTIFICATES ── */}
                {contentTab === 'certificates' && (<>
                  <div style={{ background: t.card, border: `1px solid ${t.tealBorder}`, borderRadius: 12, padding: '1.4rem', marginBottom: '1.1rem' }}>
                    <div style={{ fontSize: '0.68rem', color: t.textDim, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.9rem', fontFamily: "'Orbitron',monospace" }}>Add Certificate</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.8rem' }}>
                      <div><Label text="Level" /><LevelSelect value={certForm.level_id} onChange={v => setCertForm({ ...certForm, level_id: v })} /></div>
                      <div><Label text="Provider" /><input className="adm-in" placeholder="e.g. CompTIA" value={certForm.provider} onChange={e => setCertForm({ ...certForm, provider: e.target.value })} /></div>
                    </div>
                    <div style={{ marginBottom: '0.7rem' }}><Label text="Certificate Name" /><input className="adm-in" placeholder="e.g. CompTIA Security+" value={certForm.name} onChange={e => setCertForm({ ...certForm, name: e.target.value })} /></div>
                    <div style={{ marginBottom: '0.9rem' }}><Label text="URL" /><input className="adm-in" placeholder="https://..." value={certForm.url} onChange={e => setCertForm({ ...certForm, url: e.target.value })} /></div>
                    <button className="bp" onClick={handleAddCert}>+ Add Certificate</button>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: t.textDim, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.7rem', fontFamily: "'Orbitron',monospace" }}>Certificates ({certs.length})</div>
                  {certs.length === 0 ? <div style={{ textAlign: 'center', color: t.textDim, padding: '1.5rem', border: `1px dashed ${t.tealBorder}`, borderRadius: 10 }}>No certificates yet</div>
                    : certs.map(c => (
                      <div key={c.id} className="row row-cert">
                        {editCertId === c.id ? (<>
                          <input className="adm-in" value={editCertForm.name} onChange={e => setEditCertForm({ ...editCertForm, name: e.target.value })} />
                          <input className="adm-in" value={editCertForm.provider} onChange={e => setEditCertForm({ ...editCertForm, provider: e.target.value })} />
                          <input className="adm-in" value={editCertForm.url} onChange={e => setEditCertForm({ ...editCertForm, url: e.target.value })} />
                          <SaveBtn onClick={() => handleUpdateCert(c.id)} />
                          <CancelBtn onClick={() => setEditCertId(null)} />
                        </>) : (<>
                          <div><div style={{ fontSize: '0.87rem', fontWeight: 600, color: t.text }}>🏆 {c.name}</div><div style={{ fontSize: '0.73rem', color: t.textDim }}>{c.level_name}</div></div>
                          <span style={{ fontSize: '0.82rem', color: t.textDim }}>{c.provider}</span>
                          <a href={c.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.77rem', color: t.teal, textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.url}</a>
                          <EditBtn onClick={() => { setEditCertId(c.id); setEditCertForm({ name: c.name, provider: c.provider, url: c.url }) }} />
                          <DelBtn onClick={() => handleDeleteCert(c.id)} />
                        </>)}
                      </div>
                    ))}
                </>)}
              </>)}
            </div>
          </div>
        )}

        {/* ── NEW SPECIALIST ── */}
        {activeTab === 'specialists' && (
          <div style={{ maxWidth: 580, animation: 'fadeUp 0.4s ease both' }}>
            <div style={{ background: t.card, border: `1px solid ${t.tealBorder}`, borderRadius: 14, padding: '1.8rem', marginBottom: '1.5rem' }}>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.72rem', color: t.textDim, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1.3rem' }}>Add New Specialist</div>
              <div style={{ marginBottom: '0.9rem' }}>
                <Label text="Team" />
                <select className="adm-in" value={specForm.team_id} onChange={e => setSpecForm({ ...specForm, team_id: e.target.value })}>
                  <option value="1">🛡️ Blue Team</option>
                  <option value="2">⚔️ Red Team</option>
                </select>
              </div>
              <div style={{ marginBottom: '0.9rem' }}><Label text="Name" /><input className="adm-in" placeholder="e.g. Cloud Security Engineer" value={specForm.name} onChange={e => setSpecForm({ ...specForm, name: e.target.value })} /></div>
              <div style={{ marginBottom: '0.9rem' }}>
                <Label text="Slug (URL)" />
                <input className="adm-in" placeholder="e.g. cloud-security" value={specForm.slug} onChange={e => setSpecForm({ ...specForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} />
                <div style={{ fontSize: '0.75rem', color: t.textDim, marginTop: '0.3rem' }}>Used in URLs like /specialist/cloud-security</div>
              </div>
              <div style={{ marginBottom: '0.9rem' }}><Label text="Description" /><textarea className="adm-in" placeholder="Describe the role..." value={specForm.description} onChange={e => setSpecForm({ ...specForm, description: e.target.value })} style={{ resize: 'vertical', minHeight: 70 }} /></div>
              <div style={{ marginBottom: '1.2rem' }}><Label text="Average Income" /><input className="adm-in" placeholder="$80,000 - $130,000/year" value={specForm.avg_income} onChange={e => setSpecForm({ ...specForm, avg_income: e.target.value })} /></div>
              <button className="bp" onClick={handleAddSpecialist}>+ Add Specialist</button>
              <div style={{ fontSize: '0.78rem', color: t.textDim, marginTop: '0.7rem' }}>✨ 4 levels (Beginner → Expert) created automatically.</div>
            </div>
            <div style={{ fontSize: '0.68rem', color: t.textDim, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.8rem', fontFamily: "'Orbitron',monospace" }}>All Specialists ({blueSpecs.length + redSpecs.length})</div>
            {[...blueSpecs, ...redSpecs].map(s => (
              <div key={s.id} style={{ background: t.card, border: `1px solid ${t.tealBorder}`, borderRadius: 9, padding: '0.8rem 1.1rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.isBlue ? blueColor : redColor, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: t.text }}>{s.name}</div>
                  <div style={{ fontSize: '0.72rem', color: t.textDim }}>{s.team} · /{s.slug}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── QUESTIONS ── */}
        {activeTab === 'questions' && (
          <div style={{ animation: 'fadeUp 0.4s ease both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.3rem' }}>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.72rem', color: t.textDim, letterSpacing: '2px', textTransform: 'uppercase' }}>Questions ({questions.length})</div>
              <button className="bp" onClick={() => setShowAddQ(!showAddQ)}>{showAddQ ? 'Cancel' : '+ Add Question'}</button>
            </div>
            {showAddQ && (
              <div style={{ background: t.card, border: `1px solid ${t.teal}`, borderRadius: 12, padding: '1.4rem', marginBottom: '1.3rem', animation: 'fadeUp 0.3s ease both' }}>
                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.68rem', color: t.teal, letterSpacing: '2px', marginBottom: '0.9rem' }}>NEW QUESTION</div>
                <div style={{ marginBottom: '0.8rem' }}><Label text="Question" /><input className="adm-in" placeholder="Question text..." value={newQ.question_text} onChange={e => setNewQ({ ...newQ, question_text: e.target.value })} /></div>
                {['a', 'b', 'c', 'd'].map(opt => (
                  <div key={opt} style={{ marginBottom: '0.6rem' }}><Label text={`Option ${opt.toUpperCase()}`} /><input className="adm-in" placeholder={`Option ${opt.toUpperCase()}...`} value={newQ[`option_${opt}`]} onChange={e => setNewQ({ ...newQ, [`option_${opt}`]: e.target.value })} /></div>
                ))}
                <div style={{ marginBottom: '0.9rem' }}><Label text="Order Index" /><input className="adm-in" type="number" placeholder="e.g. 13" value={newQ.order_index} onChange={e => setNewQ({ ...newQ, order_index: e.target.value })} style={{ width: 120 }} /></div>
                <button className="bp" onClick={handleAddQuestion}>Save Question</button>
              </div>
            )}
            {questions.map((q, i) => (
              <div key={q.id} className="q-card">
                {editQId === q.id ? (
                  <div>
                    <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.68rem', color: t.teal, marginBottom: '0.8rem' }}>EDITING Q{i + 1}</div>
                    <div style={{ marginBottom: '0.7rem' }}><Label text="Question" /><input className="adm-in" value={editQForm.question_text} onChange={e => setEditQForm({ ...editQForm, question_text: e.target.value })} /></div>
                    {['a', 'b', 'c', 'd'].map(opt => (
                      <div key={opt} style={{ marginBottom: '0.55rem' }}><Label text={`Option ${opt.toUpperCase()}`} /><input className="adm-in" value={editQForm[`option_${opt}`]} onChange={e => setEditQForm({ ...editQForm, [`option_${opt}`]: e.target.value })} /></div>
                    ))}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.9rem' }}>
                      <SaveBtn onClick={() => handleUpdateQuestion(q.id)} />
                      <CancelBtn onClick={() => setEditQId(null)} />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.68rem', color: t.teal, fontFamily: "'Orbitron',monospace", letterSpacing: '2px', marginBottom: '0.45rem' }}>Q{i + 1}</div>
                      <div style={{ fontSize: '0.93rem', fontWeight: 600, color: t.text, marginBottom: '0.7rem' }}>{q.question_text}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
                        {['A', 'B', 'C', 'D'].map(opt => (
                          <div key={opt} style={{ fontSize: '0.8rem', color: t.textDim, background: t.tealDim, padding: '0.35rem 0.7rem', borderRadius: 6 }}>
                            <span style={{ color: t.teal, fontWeight: 700, marginRight: '0.3rem' }}>{opt}.</span>{q[`option_${opt.toLowerCase()}`]}
                          </div>
                        ))}
                        <div style={{ fontSize: '0.8rem', color: t.textDim, background: t.tealDim, padding: '0.35rem 0.7rem', borderRadius: 6, gridColumn: '1/-1', borderStyle: 'dashed', borderWidth: 1, borderColor: t.tealBorder }}>
                          <span style={{ color: t.textDim, fontWeight: 700, marginRight: '0.3rem' }}>E.</span>{q.option_e || 'Not sure / Skip'}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                      <EditBtn onClick={() => { setEditQId(q.id); setEditQForm({ question_text: q.question_text, option_a: q.option_a, option_b: q.option_b, option_c: q.option_c, option_d: q.option_d }) }} />
                      <DelBtn onClick={() => handleDeleteQuestion(q.id)} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── USERS ── */}
        {activeTab === 'users' && (
          <div style={{ animation: 'fadeUp 0.4s ease both' }}>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.72rem', color: t.textDim, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.9rem' }}>All Users ({users.length})</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1.5fr 1.5fr 1fr', gap: '0.7rem', padding: '0.5rem 1.1rem', marginBottom: '0.4rem' }}>
              {['Username', 'Email', 'Career Path', 'Joined', 'Last Login'].map(h => (
                <div key={h} style={{ fontSize: '0.7rem', color: t.textDim, textTransform: 'uppercase', letterSpacing: '1px', fontFamily: "'Orbitron',monospace" }}>{h}</div>
              ))}
            </div>
            {users.length === 0 ? <div style={{ textAlign: 'center', color: t.textDim, padding: '3rem', border: `1px dashed ${t.tealBorder}`, borderRadius: 12 }}>No users yet</div>
              : users.map(u => (
                <div key={u.id} className="u-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: t.tealDim, border: `1px solid ${t.tealBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', color: t.teal, fontWeight: 700, flexShrink: 0 }}>
                      {u.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: t.text }}>{u.username}</div>
                      <div style={{ fontSize: '0.7rem', color: u.role === 'admin' ? '#f6ad55' : t.textDim }}>{u.role}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: t.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                  <div style={{ fontSize: '0.8rem', color: u.recommended_path ? t.teal : t.textDim }}>{u.recommended_path || 'Not set'}</div>
                  <div style={{ fontSize: '0.8rem', color: t.textDim }}>{fmtDate(u.created_at)}</div>
                  <div style={{ fontSize: '0.8rem', color: t.textDim }}>{fmtDate(u.last_login)}</div>
                </div>
              ))}
          </div>
        )}
      </main>
    </div>
  )
}

// ── Description renderer: parses • / - / * bullets and 1. numbered lists ──
function DescriptionRenderer({ text, t }) {
  if (!text) return null

  const lines = text.split('\n').filter(l => l.trim() !== '')
  const elements = []
  let ulBuffer = []
  let olBuffer = []

  const flushUl = () => {
    if (!ulBuffer.length) return
    elements.push(
      <ul key={`ul-${elements.length}`} style={{ paddingLeft: '1.4rem', margin: '0.3rem 0' }}>
        {ulBuffer.map((item, i) => (
          <li key={i} style={{ fontSize: '0.83rem', color: t.textDim, marginBottom: '0.2rem', lineHeight: 1.55 }}>{item}</li>
        ))}
      </ul>
    )
    ulBuffer = []
  }
  const flushOl = () => {
    if (!olBuffer.length) return
    elements.push(
      <ol key={`ol-${elements.length}`} style={{ paddingLeft: '1.4rem', margin: '0.3rem 0' }}>
        {olBuffer.map((item, i) => (
          <li key={i} style={{ fontSize: '0.83rem', color: t.textDim, marginBottom: '0.2rem', lineHeight: 1.55 }}>{item}</li>
        ))}
      </ol>
    )
    olBuffer = []
  }

  lines.forEach((line, i) => {
    const trimmed = line.trim()
    const isBullet = /^[•\-*]\s/.test(trimmed)
    const isNumbered = /^\d+[\.\)]\s/.test(trimmed)

    if (isBullet) {
      flushOl()
      ulBuffer.push(trimmed.replace(/^[•\-*]\s+/, ''))
    } else if (isNumbered) {
      flushUl()
      olBuffer.push(trimmed.replace(/^\d+[\.\)]\s+/, ''))
    } else {
      flushUl(); flushOl()
      elements.push(
        <p key={`p-${i}`} style={{ fontSize: '0.83rem', color: t.textDim, marginBottom: '0.25rem', lineHeight: 1.6 }}>{trimmed}</p>
      )
    }
  })

  flushUl(); flushOl()
  return <div className="desc-content">{elements}</div>
}