import { Link, useParams } from 'react-router-dom'
import WireframeBox from '../components/WireframeBox'

function BrewLogScreen() {
  const { id } = useParams()

  return (
    <div className="screen">
      <div className="header">
        <Link to={`/coffee/${id}`} className="back-btn">←</Link>
        <WireframeBox variant="solid" style={{ height: '24px', width: '80px', fontSize: '9px', margin: 0, padding: '4px' }}>
          [Logo]
        </WireframeBox>
        <span style={{ width: '24px' }}></span>
      </div>

      <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
        <p style={{ fontSize: '14px', fontWeight: '600' }}>Ethiopia Yirgacheffe</p>
        <p style={{ fontSize: '12px', color: '#666' }}>Blue Bottle Coffee</p>
      </div>

      <div className="form-group">
        <label className="form-label">Date Started</label>
        <input
          type="date"
          className="form-input"
          defaultValue="2026-01-10"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Roast Date</label>
        <input
          type="date"
          className="form-input"
          defaultValue="2026-01-03"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Grind Setting *</label>
        <input
          type="number"
          step="0.1"
          className="form-input"
          defaultValue="15.5"
          placeholder="e.g., 15.5"
        />
        <span style={{ fontSize: '10px', color: '#666' }}>
          Required. One decimal place (e.g., 4.0, 15.5)
        </span>
      </div>

      <div className="form-group">
        <label className="form-label">Rating</label>
        <select className="form-input">
          <option value="">Select rating...</option>
          <option value="great" selected>Great</option>
          <option value="good">Good</option>
          <option value="neutral">Neutral</option>
          <option value="meh">Meh</option>
          <option value="bad">Bad</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Tasting Notes</label>
        <textarea
          className="form-input"
          rows="4"
          style={{ resize: 'vertical' }}
          defaultValue="Bright and fruity with prominent blueberry notes. Really enjoyed this one - perfect for pour over."
          placeholder="How did it taste? What did you notice?"
        />
      </div>

      <div className="spacer" />

      <Link to={`/coffee/${id}`} className="btn btn-primary">
        Save Brew Log
      </Link>

      <button
        className="btn btn-secondary"
        style={{ background: 'transparent', border: '1px solid #ddd', color: '#999' }}
      >
        Clear All
      </button>

      <p style={{ fontSize: '10px', color: '#999', textAlign: 'center', marginTop: '12px' }}>
        Last updated: Jan 10, 2026 at 3:45 PM
      </p>
    </div>
  )
}

export default BrewLogScreen
