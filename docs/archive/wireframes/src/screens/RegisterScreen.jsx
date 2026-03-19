import { Link } from 'react-router-dom'
import WireframeBox from '../components/WireframeBox'

function RegisterScreen() {
  return (
    <div className="screen">
      <div className="header">
        <Link to="/" className="back-btn">←</Link>
        <WireframeBox variant="solid" style={{ height: '24px', width: '80px', fontSize: '9px', margin: 0, padding: '4px' }}>
          [Logo]
        </WireframeBox>
        <span style={{ width: '24px' }}></span>
      </div>

      <h1 className="screen-title">Create Account</h1>

      <div className="form-group">
        <label className="form-label">Name</label>
        <input
          type="text"
          className="form-input"
          placeholder="Your name"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-input"
          placeholder="your@email.com"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Password</label>
        <input
          type="password"
          className="form-input"
          placeholder="Min 8 chars, 1 uppercase, 1 number"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Confirm Password</label>
        <input
          type="password"
          className="form-input"
          placeholder="Re-enter your password"
        />
      </div>

      <div style={{ fontSize: '11px', color: '#999', marginBottom: '20px' }}>
        Password must contain:
        <ul style={{ marginLeft: '16px', marginTop: '4px' }}>
          <li>Minimum 8 characters</li>
          <li>At least one uppercase letter</li>
          <li>At least one lowercase letter</li>
          <li>At least one number</li>
        </ul>
      </div>

      <div className="spacer" />

      <Link to="/collection" className="btn btn-primary">
        Create Account
      </Link>

      <Link to="/login" className="text-link">
        Already have an account? Log in
      </Link>
    </div>
  )
}

export default RegisterScreen
