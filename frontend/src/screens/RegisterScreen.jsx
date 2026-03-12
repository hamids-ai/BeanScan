import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'

function validatePassword(password) {
  if (password.length < 8) return 'Password must be at least 8 characters.'
  if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter.'
  if (!/[a-z]/.test(password)) return 'Password must include at least one lowercase letter.'
  if (!/[0-9]/.test(password)) return 'Password must include at least one number.'
  return null
}

function RegisterScreen() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register } = useUser()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    setIsSubmitting(true)
    try {
      const needsConfirmation = await register(name.trim(), email, password)
      if (needsConfirmation) {
        setError('')
        navigate('/check-email')
      } else {
        navigate('/collection')
      }
    } catch (err) {
      const msg = err.message ?? ''
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        setError('An account with this email already exists.')
      } else if (msg.includes('Password should be at least') || msg.includes('password')) {
        setError('Password must be at least 8 characters with uppercase, lowercase, and a number.')
      } else if (msg.includes('valid email') || msg.includes('email')) {
        setError('Please enter a valid email address.')
      } else if (msg.includes('rate limit') || msg.includes('too many')) {
        setError('Too many attempts. Please wait a moment and try again.')
      } else if (msg) {
        setError(msg)
      } else {
        setError('Could not create account. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="screen">
      <Link to="/" className="back-btn">← Back</Link>

      <div style={{ marginTop: 'var(--spacing-6)', marginBottom: 'var(--spacing-8)' }}>
        <span className="logo">BeanScan</span>
      </div>

      <h1 className="screen-title">Create Account</h1>
      <p className="screen-subtitle">Start tracking your coffee journey</p>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-4)' }}>
          <span>{error}</span>
        </div>
      )}

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

        <button
          type="submit"
          className="btn btn-primary btn-block"
          style={{ marginTop: 'var(--spacing-6)' }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating account...' : 'Create Account'}
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
