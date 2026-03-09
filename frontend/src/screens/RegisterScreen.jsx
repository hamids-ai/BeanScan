import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'

function RegisterScreen() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useUser()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Implement registration logic with backend
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

      <h1 className="screen-title">Create Account</h1>
      <p className="screen-subtitle">Start tracking your coffee journey</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            className="form-input"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

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
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p className="form-hint">At least 8 characters with uppercase, lowercase, and number</p>
        </div>

        <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 'var(--spacing-6)' }}>
          Create Account
        </button>
      </form>

      <div style={{ marginTop: 'var(--spacing-8)', textAlign: 'center' }}>
        <p className="text-sm text-secondary">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterScreen
