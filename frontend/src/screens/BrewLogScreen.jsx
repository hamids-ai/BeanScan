import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { saveBrewLog } from '../lib/api'
import './BrewLogScreen.css'

function BrewLogScreen() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [coffee, setCoffee] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    dateStarted: '',
    roastDate: '',
    grindSetting: '',
    rating: '',
    tastingNotes: '',
    bodyNotes: '',
  })

  useEffect(() => {
    async function fetchCoffee() {
      const { data, error } = await supabase
        .from('coffees')
        .select('bag_name, roaster_name, brew_date, roast_date, grind_setting, rating, tasting_notes, body_notes')
        .eq('id', id)
        .single()

      if (!error && data) {
        setCoffee({ name: data.bag_name, roaster: data.roaster_name })
        setFormData({
          dateStarted: data.brew_date ?? '',
          roastDate: data.roast_date ?? '',
          grindSetting: data.grind_setting != null ? String(data.grind_setting) : '',
          rating: data.rating ?? '',
          tastingNotes: data.tasting_notes ?? '',
          bodyNotes: data.body_notes ?? '',
        })
      }
      setIsLoading(false)
    }

    fetchCoffee()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await saveBrewLog(id, {
        brewDate: formData.dateStarted || null,
        roastDate: formData.roastDate || null,
        grindSetting: formData.grindSetting,
        rating: formData.rating || null,
        tastingNotes: formData.tastingNotes || null,
        bodyNotes: formData.bodyNotes || null,
      })
      navigate(`/coffee/${id}`)
    } catch (err) {
      if (err.code === 'invalid_grind_setting') {
        setError('Grind setting must be a positive number (e.g. 15.5).')
      } else {
        setError(`Could not save brew log (${err.code ?? err.message ?? 'unknown'}). Please try again.`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClear = () => {
    setFormData({ dateStarted: '', roastDate: '', grindSetting: '', rating: '', tastingNotes: '', bodyNotes: '' })
  }

  if (isLoading) {
    return (
      <div className="screen brew-log-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner spinner-lg" />
      </div>
    )
  }

  return (
    <div className="screen brew-log-screen">
      <div className="brew-log-header">
        <Link to={`/coffee/${id}`} className="back-btn">← Back</Link>
        <span className="logo logo-sm">BeanScan</span>
        <span style={{ width: '48px' }} />
      </div>

      {coffee && (
        <div className="brew-log-coffee-info">
          <p className="brew-log-coffee-name">{coffee.name}</p>
          <p className="brew-log-coffee-roaster">{coffee.roaster}</p>
        </div>
      )}

      <h1 className="screen-title">Brew Log</h1>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-4)' }}>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="dateStarted">Date Started</label>
          <input id="dateStarted" name="dateStarted" type="date" className="form-input"
            value={formData.dateStarted} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="roastDate">Roast Date</label>
          <input id="roastDate" name="roastDate" type="date" className="form-input"
            value={formData.roastDate} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="grindSetting">
            Grind Setting <span className="required">*</span>
          </label>
          <input id="grindSetting" name="grindSetting" type="number" step="0.1" min="0.1" max="999.9"
            className="form-input" value={formData.grindSetting} onChange={handleChange}
            placeholder="e.g., 15.5" required />
          <p className="form-hint">Required. One decimal place (e.g., 4.0, 15.5)</p>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="rating">Rating</label>
          <select id="rating" name="rating" className="form-input form-select"
            value={formData.rating} onChange={handleChange}>
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
          <textarea id="tastingNotes" name="tastingNotes" className="form-input" rows="4"
            value={formData.tastingNotes} onChange={handleChange}
            placeholder="How did it taste? What did you notice?" />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="bodyNotes">Body Notes</label>
          <textarea id="bodyNotes" name="bodyNotes" className="form-input" rows="3"
            value={formData.bodyNotes} onChange={handleChange}
            placeholder="Describe the mouthfeel and weight of the coffee..." />
          <p className="form-hint">How does it feel on your palate? Light, medium, or full-bodied?</p>
        </div>

        <div className="brew-log-actions">
          <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Brew Log'}
          </button>
          <button type="button" className="btn btn-ghost btn-block" onClick={handleClear}>
            Clear All
          </button>
        </div>
      </form>
    </div>
  )
}

export default BrewLogScreen
