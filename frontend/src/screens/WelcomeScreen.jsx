import { Link } from 'react-router-dom'

function WelcomeScreen() {
  return (
    <div className="screen" style={{ justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ marginBottom: 'var(--spacing-8)' }}>
          <span className="logo" style={{ fontSize: 'var(--font-size-4xl)' }}>BeanScan</span>
        </div>

        <h1 style={{ marginBottom: 'var(--spacing-3)' }}>Your Personal Coffee Journal</h1>
        <p className="text-secondary" style={{ maxWidth: '320px', margin: '0 auto var(--spacing-8)' }}>
          Track every coffee you try, remember what you loved, and perfect your brew.
        </p>
      </div>

      <div style={{ paddingBottom: 'var(--spacing-8)' }}>
        <Link to="/register" className="btn btn-primary btn-block" style={{ marginBottom: 'var(--spacing-3)' }}>
          Get Started
        </Link>
        <Link to="/login" className="btn btn-secondary btn-block">
          I Already Have an Account
        </Link>
      </div>
    </div>
  )
}

export default WelcomeScreen
