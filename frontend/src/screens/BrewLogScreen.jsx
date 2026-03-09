import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import './BrewLogScreen.css'

function BrewLogScreen() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Sample data - will be replaced with real data from backend
  const coffee = {
    name: 'Ethiopia Yirgacheffe',
    roaster: 'Blue Bottle Coffee'
  }

  const [formData, setFormData] = useState({
    dateStarted: '2026-01-10',
    roastDate: '2026-01-03',
    grindSetting: '15.5',
    rating: 'great',
    tastingNotes: 'Bright and fruity with prominent blueberry notes. Really enjoyed this one - perfect for pour over.',
    bodyNotes: 'Silky smooth with a medium weight. Coats the palate nicely without being heavy.'
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Save to backend
    console.log('Saving brew log:', formData)
    navigate(`/coffee/${id}`)
  }

  const handleClear = () => {
    setFormData({
      dateStarted: '',
      roastDate: '',
      grindSetting: '',
      rating: '',
      tastingNotes: '',
      bodyNotes: ''
    })
  }

  return (
    <div className="screen brew-log-screen">
      <div className="brew-log-header">
        <Link to={`/coffee/${id}`} className="back-btn">
          ← Back
        </Link>
        <span className="logo logo-sm">BeanScan</span>
        <span style={{ width: '48px' }}></span>
      </div>

      <div className="brew-log-coffee-info">
        <p className="brew-log-coffee-name">{coffee.name}</p>
        <p className="brew-log-coffee-roaster">{coffee.roaster}</p>
      </div>

      <h1 className="screen-title">Brew Log</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="dateStarted">Date Started</label>
          <input
            id="dateStarted"
            name="dateStarted"
            type="date"
            className="form-input"
            value={formData.dateStarted}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="roastDate">Roast Date</label>
          <input
            id="roastDate"
            name="roastDate"
            type="date"
            className="form-input"
            value={formData.roastDate}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="grindSetting">
            Grind Setting <span className="required">*</span>
          </label>
          <input
            id="grindSetting"
            name="grindSetting"
            type="number"
            step="0.1"
            min="0.1"
            max="999.9"
            className="form-input"
            value={formData.grindSetting}
            onChange={handleChange}
            placeholder="e.g., 15.5"
            required
          />
          <p className="form-hint">Required. One decimal place (e.g., 4.0, 15.5)</p>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="rating">Rating</label>
          <select
            id="rating"
            name="rating"
            className="form-input"
            value={formData.rating}
            onChange={handleChange}
          >
            <option value="">Select rating...</option>
            <option value="great">Great</option>
            <option value="good">Good</option>
            <option value="neutral">Neutral</option>
            <option value="meh">Meh</option>
            <option value="bad">Bad</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="tastingNotes">Tasting Notes</label>
          <textarea
            id="tastingNotes"
            name="tastingNotes"
            className="form-input"
            rows="4"
            value={formData.tastingNotes}
            onChange={handleChange}
            placeholder="How did it taste? What did you notice?"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="bodyNotes">Body Notes</label>
          <textarea
            id="bodyNotes"
            name="bodyNotes"
            className="form-input"
            rows="3"
            value={formData.bodyNotes}
            onChange={handleChange}
            placeholder="Describe the mouthfeel and weight of the coffee..."
          />
          <p className="form-hint">How does it feel on your palate? Light, medium, or full-bodied?</p>
        </div>

        <div className="brew-log-actions">
          <button type="submit" className="btn btn-primary btn-block">
            Save Brew Log
          </button>
          <button type="button" className="btn btn-ghost btn-block" onClick={handleClear}>
            Clear All
          </button>
        </div>

        <p className="brew-log-updated">
          Last updated: Jan 10, 2026 at 3:45 PM
        </p>
      </form>
    </div>
  )
}

export default BrewLogScreen
