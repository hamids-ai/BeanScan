import { Link } from 'react-router-dom'
import WireframeBox from '../components/WireframeBox'

function LoginScreen() {
  return (
    <div className="screen">
      <div className="header">
        <Link to="/" className="back-btn">←</Link>
        <WireframeBox variant="solid" style={{ height: '24px', width: '80px', fontSize: '9px', margin: 0, padding: '4px' }}>
          [Logo]
        </WireframeBox>
        <span style={{ width: '24px' }}></span>
      </div>

      <h1 className="screen-title">Welcome Back</h1>

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
          placeholder="Enter your password"
        />
      </div>

      <div className="spacer" />

      <Link to="/collection" className="btn btn-primary">
        Log In
      </Link>

      <Link to="/register" className="text-link">
        Don't have an account? Sign up
      </Link>
    </div>
  )
}

export default LoginScreen
