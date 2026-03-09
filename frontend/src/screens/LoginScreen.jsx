import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'

function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useUser()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Implement login logic with backend
    // For now, extract name from email for demo purposes
    const name = email.split('@')[0]
    login({ name, email })
    navigate('/collection')
  }

  return (
    <div className="screen">
      <Link to="/" className="back-btn">
        ← Back
      </Link>

      <div style={{ marginTop: 'var(--spacing-6)', marginBottom: 'var(--spacing-8)' }}>
        <span className="logo">BeanScan</span>
      </div>

      <h1 className="screen-title">Welcome Back</h1>
      <p className="screen-subtitle">Sign in to access your coffee collection</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="form-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="form-input"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 'var(--spacing-6)' }}>
          Sign In
        </button>
      </form>

      <div style={{ marginTop: 'var(--spacing-8)', textAlign: 'center' }}>
        <p className="text-sm text-secondary">
          Don't have an account?{' '}
          <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginScreen
