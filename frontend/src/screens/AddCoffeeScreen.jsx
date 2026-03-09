import { Link } from 'react-router-dom'
import './AddCoffeeScreen.css'

function AddCoffeeScreen() {
  return (
    <div className="screen add-coffee-screen">
      <Link to="/collection" className="back-btn">
        ← Back
      </Link>

      <div style={{ marginTop: 'var(--spacing-6)', marginBottom: 'var(--spacing-6)' }}>
        <span className="logo logo-sm">BeanScan</span>
      </div>

      <h1 className="screen-title">Add Coffee</h1>

      <div className="add-options">
        <Link to="/capture" className="add-option-card">
          <div className="add-option-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
          <h3 className="add-option-title">Take Photo</h3>
        </Link>

        <div className="divider">or</div>

        <Link to="/coffee-form" className="add-option-card">
          <div className="add-option-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </div>
          <h3 className="add-option-title">Add Manually</h3>
        </Link>
      </div>

      <div className="add-tip">
        <p className="text-sm text-muted">
          Tip: Taking a photo is faster! It's magic.
        </p>
      </div>
    </div>
  )
}

export default AddCoffeeScreen
