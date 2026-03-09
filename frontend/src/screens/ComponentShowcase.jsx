import { useState } from 'react'
import { Link } from 'react-router-dom'

function ComponentShowcase() {
  const [showToast, setShowToast] = useState(false)
  const [toastType, setToastType] = useState('success')
  const [checkboxChecked, setCheckboxChecked] = useState(false)
  const [radioValue, setRadioValue] = useState('option1')
  const [toggleOn, setToggleOn] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const triggerToast = (type) => {
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  return (
    <div className="screen" style={{ maxWidth: '600px' }}>
      <Link to="/collection" className="back-btn">
        ← Back to Collection
      </Link>

      <h1 className="screen-title" style={{ marginTop: 'var(--spacing-4)' }}>Component Showcase</h1>
      <p className="screen-subtitle">Preview all design system components</p>

      {/* Toast Demo */}
      <section style={{ marginBottom: 'var(--spacing-8)' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-4)' }}>Toast / Notifications</h2>
        <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
          <button className="btn btn-sm btn-secondary" onClick={() => triggerToast('success')}>Success</button>
          <button className="btn btn-sm btn-secondary" onClick={() => triggerToast('error')}>Error</button>
          <button className="btn btn-sm btn-secondary" onClick={() => triggerToast('warning')}>Warning</button>
          <button className="btn btn-sm btn-secondary" onClick={() => triggerToast('info')}>Info</button>
        </div>
      </section>

      {/* Skeleton Loading */}
      <section style={{ marginBottom: 'var(--spacing-8)' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-4)' }}>Skeleton Loading</h2>
        <div className="skeleton-card">
          <div className="skeleton skeleton-card-image"></div>
          <div className="skeleton-card-content">
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text"></div>
          </div>
        </div>
      </section>

      {/* Image Placeholders */}
      <section style={{ marginBottom: 'var(--spacing-8)' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-4)' }}>Image Placeholders</h2>
        <div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'flex-end' }}>
          <div className="image-placeholder image-placeholder-sm">
            <span className="image-placeholder-icon">&#9749;</span>
          </div>
          <div className="image-placeholder image-placeholder-md">
            <span className="image-placeholder-icon">&#9749;</span>
          </div>
          <div style={{ width: '120px' }}>
            <div className="image-placeholder image-placeholder-lg" style={{ height: '80px' }}>
              <span className="image-placeholder-icon">&#9749;</span>
            </div>
          </div>
        </div>
      </section>

      {/* Avatars */}
      <section style={{ marginBottom: 'var(--spacing-8)' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-4)' }}>Avatars</h2>
        <div style={{ display: 'flex', gap: 'var(--spacing-3)', alignItems: 'center' }}>
          <div className="avatar avatar-xs">J</div>
          <div className="avatar avatar-sm">JD</div>
          <div className="avatar avatar-md">JD</div>
          <div className="avatar avatar-lg">JD</div>
        </div>
        <div className="user-badge" style={{ marginTop: 'var(--spacing-4)' }}>
          <div className="avatar avatar-md">JD</div>
          <div>
            <div className="user-badge-name">John Doe</div>
            <div className="user-badge-email">john@example.com</div>
          </div>
        </div>
      </section>

      {/* Search Input */}
      <section style={{ marginBottom: 'var(--spacing-8)' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-4)' }}>Search Input</h2>
        <div className="search-wrapper">
          <span className="search-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
          </span>
          <input type="text" className="form-input" placeholder="Search coffees..." />
          <button className="search-clear">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </section>

      {/* Date Input */}
      <section style={{ marginBottom: 'var(--spacing-8)' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-4)' }}>Date Input</h2>
        <div className="form-group">
          <label className="form-label">Roast Date</label>
          <input type="date" className="form-input" defaultValue="2026-01-15" />
        </div>
      </section>

      {/* Checkboxes */}
      <section style={{ marginBottom: 'var(--spacing-8)' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-4)' }}>Checkboxes</h2>
        <label className="checkbox-wrapper">
          <input
            type="checkbox"
            className="checkbox"
            checked={checkboxChecked}
            onChange={(e) => setCheckboxChecked(e.target.checked)}
          />
          <div>
            <span className="checkbox-label">Enable notifications</span>
            <p className="checkbox-hint">Get notified when new features are available</p>
          </div>
        </label>
      </section>

      {/* Radio Buttons */}
      <section style={{ marginBottom: 'var(--spacing-8)' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-4)' }}>Radio Buttons</h2>
        <div className="radio-group">
          <label className="radio-wrapper">
            <input
              type="radio"
              className="radio"
              name="demo-radio"
              value="option1"
              checked={radioValue === 'option1'}
              onChange={(e) => setRadioValue(e.target.value)}
            />
            <span className="radio-label">Light Roast</span>
          </label>
          <label className="radio-wrapper">
            <input
              type="radio"
              className="radio"
              name="demo-radio"
              value="option2"
              checked={radioValue === 'option2'}
              onChange={(e) => setRadioValue(e.target.value)}
            />
            <span className="radio-label">Medium Roast</span>
          </label>
          <label className="radio-wrapper">
            <input
              type="radio"
              className="radio"
              name="demo-radio"
              value="option3"
              checked={radioValue === 'option3'}
              onChange={(e) => setRadioValue(e.target.value)}
            />
            <span className="radio-label">Dark Roast</span>
          </label>
        </div>
      </section>

      {/* Toggle Switch */}
      <section style={{ marginBottom: 'var(--spacing-8)' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-4)' }}>Toggle Switch</h2>
        <label className="toggle-wrapper">
          <input
            type="checkbox"
            className="toggle"
            checked={toggleOn}
            onChange={(e) => setToggleOn(e.target.checked)}
          />
          <span className="toggle-label">Dark Mode</span>
        </label>
      </section>

      {/* Progress Stepper */}
      <section style={{ marginBottom: 'var(--spacing-8)' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-4)' }}>Progress Stepper</h2>
        <div className="stepper">
          <div className="stepper-step stepper-step-completed">
            <div className="stepper-indicator">&#10003;</div>
          </div>
          <div className="stepper-connector stepper-connector-completed"></div>
          <div className="stepper-step stepper-step-completed">
            <div className="stepper-indicator">&#10003;</div>
          </div>
          <div className="stepper-connector stepper-connector-completed"></div>
          <div className="stepper-step stepper-step-active">
            <div className="stepper-indicator">3</div>
          </div>
          <div className="stepper-connector"></div>
          <div className="stepper-step stepper-step-pending">
            <div className="stepper-indicator">4</div>
          </div>
        </div>
        <p style={{ textAlign: 'center', marginTop: 'var(--spacing-3)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          Step 3 of 4: Review Details
        </p>
      </section>

      {/* Alerts */}
      <section style={{ marginBottom: 'var(--spacing-8)' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-4)' }}>Alerts / Banners</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          <div className="alert alert-info">
            <span className="alert-icon">&#8505;</span>
            <div className="alert-content">
              <div className="alert-title">Pro Tip</div>
              <div className="alert-message">Take photos in good lighting for best OCR results.</div>
            </div>
          </div>
          <div className="alert alert-success">
            <span className="alert-icon">&#10003;</span>
            <div className="alert-content">
              <div className="alert-title">Coffee Saved</div>
              <div className="alert-message">Your coffee has been added to your collection.</div>
            </div>
          </div>
          <div className="alert alert-warning">
            <span className="alert-icon">&#9888;</span>
            <div className="alert-content">
              <div className="alert-title">Missing Fields</div>
              <div className="alert-message">Some fields couldn't be auto-filled. Please review.</div>
            </div>
          </div>
          <div className="alert alert-error">
            <span className="alert-icon">&#10005;</span>
            <div className="alert-content">
              <div className="alert-title">Upload Failed</div>
              <div className="alert-message">Unable to process image. Please try again.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Badges */}
      <section style={{ marginBottom: 'var(--spacing-8)' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-4)' }}>Section Badges</h2>
        <div style={{ display: 'flex', gap: 'var(--spacing-3)', flexWrap: 'wrap' }}>
          <span className="section-badge section-badge-auto">
            <span className="section-badge-icon">&#10024;</span>
            Auto-filled by BeanScan
          </span>
          <span className="section-badge section-badge-user">
            <span className="section-badge-icon">&#9997;</span>
            Your Brew Log
          </span>
        </div>
      </section>

      {/* Dropdown Menu */}
      <section style={{ marginBottom: 'var(--spacing-8)' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-4)' }}>Dropdown Menu</h2>
        <div className="dropdown">
          <button
            className="btn btn-secondary"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            Options &#9662;
          </button>
          <div className={`dropdown-menu dropdown-menu-left ${dropdownOpen ? 'dropdown-menu-open' : ''}`}>
            <button className="dropdown-item">
              <span className="dropdown-item-icon">&#9998;</span>
              Edit Coffee
            </button>
            <button className="dropdown-item">
              <span className="dropdown-item-icon">&#128203;</span>
              Duplicate
            </button>
            <div className="dropdown-divider"></div>
            <button className="dropdown-item dropdown-item-danger">
              <span className="dropdown-item-icon">&#128465;</span>
              Delete
            </button>
          </div>
        </div>
      </section>

      {/* Ratings */}
      <section style={{ marginBottom: 'var(--spacing-8)' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-4)' }}>Rating Badges</h2>
        <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
          <span className="rating rating-great">Great</span>
          <span className="rating rating-good">Good</span>
          <span className="rating rating-neutral">Neutral</span>
          <span className="rating rating-meh">Meh</span>
          <span className="rating rating-bad">Bad</span>
        </div>
      </section>

      {/* Buttons */}
      <section style={{ marginBottom: 'var(--spacing-8)' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-4)' }}>Buttons</h2>
        <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap', marginBottom: 'var(--spacing-3)' }}>
          <button className="btn btn-primary">Primary</button>
          <button className="btn btn-secondary">Secondary</button>
          <button className="btn btn-ghost">Ghost</button>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-sm">Small</button>
          <button className="btn btn-primary">Medium</button>
          <button className="btn btn-primary btn-lg">Large</button>
        </div>
      </section>

      {/* Spinner */}
      <section style={{ marginBottom: 'var(--spacing-8)' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-4)' }}>Loading Spinner</h2>
        <div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center' }}>
          <div className="spinner"></div>
          <div className="spinner spinner-lg"></div>
        </div>
      </section>

      {/* Toast Container */}
      {showToast && (
        <div className="toast-container">
          <div className={`toast toast-${toastType}`}>
            <span className="toast-icon">
              {toastType === 'success' && '✓'}
              {toastType === 'error' && '✕'}
              {toastType === 'warning' && '⚠'}
              {toastType === 'info' && 'ℹ'}
            </span>
            <div className="toast-content">
              <div className="toast-title">
                {toastType === 'success' && 'Success!'}
                {toastType === 'error' && 'Error'}
                {toastType === 'warning' && 'Warning'}
                {toastType === 'info' && 'Info'}
              </div>
              <div className="toast-message">
                This is a {toastType} notification message.
              </div>
            </div>
            <button className="toast-close" onClick={() => setShowToast(false)}>✕</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ComponentShowcase
