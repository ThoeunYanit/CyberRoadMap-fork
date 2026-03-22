import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import CareerSelect from './pages/CareerSelect'
import Assessment from './pages/Assessment'
import Result from './pages/Result'
import Dashboard from './pages/Dashboard'
import Specialist from './pages/Specialist'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import VerifyOTP from './pages/VerifyOTP'


const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

const AdminRoute = ({ children }) => {
  const role = localStorage.getItem('role')
  return role === 'admin' ? children : <Navigate to="/dashboard" />
}

const PublicOnlyRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? <Navigate to="/dashboard" /> : children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicOnlyRoute><Landing /></PublicOnlyRoute>} />
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
      <Route path="/career-select" element={<PrivateRoute><CareerSelect /></PrivateRoute>} />
      <Route path="/assessment" element={<PrivateRoute><Assessment /></PrivateRoute>} />
      <Route path="/result" element={<PrivateRoute><Result /></PrivateRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/specialist/:slug" element={<PrivateRoute><Specialist /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
    </Routes>
  )
}