import { Routes, Route, Navigate } from 'react-router-dom'
import { useUser } from './context/UserContext'
import WelcomeScreen from './screens/WelcomeScreen'
import LoginScreen from './screens/LoginScreen'
import RegisterScreen from './screens/RegisterScreen'
import CollectionScreen from './screens/CollectionScreen'
import AddCoffeeScreen from './screens/AddCoffeeScreen'
import CaptureScreen from './screens/CaptureScreen'
import CoffeeFormScreen from './screens/CoffeeFormScreen'
import CoffeeDetailScreen from './screens/CoffeeDetailScreen'
import BrewLogScreen from './screens/BrewLogScreen'
import ComponentShowcase from './screens/ComponentShowcase'

function ProtectedRoute({ children }) {
  const { user, isLoading } = useUser()
  if (isLoading) return null
  if (!user) return <Navigate to="/" replace />
  return children
}

function PublicOnlyRoute({ children }) {
  const { user, isLoading } = useUser()
  if (isLoading) return null
  if (user) return <Navigate to="/collection" replace />
  return children
}

function CheckEmailScreen() {
  return (
    <div className="screen" style={{ textAlign: 'center', paddingTop: 'var(--spacing-16)' }}>
      <span className="logo">BeanScan</span>
      <h1 className="screen-title" style={{ marginTop: 'var(--spacing-8)' }}>Check your email</h1>
      <p className="screen-subtitle">We sent a confirmation link to your email address. Click it to activate your account.</p>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicOnlyRoute><WelcomeScreen /></PublicOnlyRoute>} />
      <Route path="/login" element={<PublicOnlyRoute><LoginScreen /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><RegisterScreen /></PublicOnlyRoute>} />
      <Route path="/check-email" element={<CheckEmailScreen />} />

      <Route path="/collection" element={<ProtectedRoute><CollectionScreen /></ProtectedRoute>} />
      <Route path="/add" element={<ProtectedRoute><AddCoffeeScreen /></ProtectedRoute>} />
      <Route path="/capture" element={<ProtectedRoute><CaptureScreen /></ProtectedRoute>} />
      <Route path="/coffee-form" element={<ProtectedRoute><CoffeeFormScreen /></ProtectedRoute>} />
      <Route path="/coffee/:id" element={<ProtectedRoute><CoffeeDetailScreen /></ProtectedRoute>} />
      <Route path="/brew-log/:id" element={<ProtectedRoute><BrewLogScreen /></ProtectedRoute>} />
      <Route path="/components" element={<ComponentShowcase />} />
    </Routes>
  )
}

export default App
