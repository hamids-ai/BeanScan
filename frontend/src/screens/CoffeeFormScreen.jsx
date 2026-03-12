import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { saveCoffee } from '../lib/api'
import './CoffeeFormScreen.css'

const EMPTY_DATA = {
  bagName: '', roasterName: '', roasterLocation: '', origins: '',
  roastLevel: '', varietal: '', altitude: '', processingMethod: '',
  flavorProfile: '', bodyCategory: '', bodyDescription: '',
}

function CoffeeFormScreen() {
  const location = useLocation()
  const navigate = useNavigate()

  const locationState = location.state ?? {}
  const isPhotoFlow = locationState.source === 'photo'
  const aiData = locationState.coffeeData ?? {}

  const [formData, setFormData] = useState(
    isPhotoFlow
      ? { ...EMPTY_DATA, ...Object.fromEntries(Object.entries(aiData).filter(([, v]) => v != null)) }
      : EMPTY_DATA
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const { id } = await saveCoffee(formData)
      navigate(`/coffee/${id}`)
    } catch (err) {
      if (err.code === 'daily_limit_reached') {
        setError('You have reached the daily limit of 20 coffees. Please try again tomorrow.')
      } else if (err.code === 'unauthorized') {
        setError('Your session expired. Please log out and log back in.')
      } else if (err.code === 'bag_and_roaster_required') {
        setError('Bag name and roaster name are required.')
      } else {
        setError(`Could not save coffee (${err.code ?? err.message ?? 'unknown error'}). Please try again.`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="screen coffee-form-screen">
      <div className="coffee-form-header">
        <Link to="/add" className="back-btn">← Back</Link>
        <span className="logo logo-sm">BeanScan</span>
        <span style={{ width: '48px' }} />
      </div>

      <h1 className="screen-title">{isPhotoFlow ? 'Review & Save' : 'Add Coffee'}</h1>

      {isPhotoFlow && (
        <div className="photo-flow-banner">
          <span className="photo-flow-banner-icon">✦</span>
          <span>Fields auto-populated from your photo. Review and edit before saving.</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-4)' }}>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label form-label-required" htmlFor="bagName">Bag Name</label>
          <input id="bagName" name="bagName" type="text" className="form-input"
            value={formData.bagName} onChange={handleChange}
            placeholder="e.g., Ethiopia Yirgacheffe" required />
        </div>

        <div className="form-group">
          <label className="form-label form-label-required" htmlFor="roasterName">Roaster Name</label>
          <input id="roasterName" name="roasterName" type="text" className="form-input"
            value={formData.roasterName} onChange={handleChange}
            placeholder="e.g., Blue Bottle Coffee" required />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="roasterLocation">Roaster Location</label>
          <input id="roasterLocation" name="roasterLocation" type="text" className="form-input"
            value={formData.roasterLocation} onChange={handleChange}
            placeholder="e.g., Oakland, CA, USA" />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="origins">Origins</label>
          <input id="origins" name="origins" type="text" className="form-input"
            value={formData.origins} onChange={handleChange}
            placeholder="e.g., Ethiopia, Kenya" />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="roastLevel">Roast Level</label>
          <select id="roastLevel" name="roastLevel" className="form-input form-select"
            value={formData.roastLevel} onChange={handleChange}>
            <option value="">Select roast level...</option>
            <option value="light">Light</option>
            <option value="medium-light">Medium-Light</option>
            <option value="medium">Medium</option>
            <option value="medium-dark">Medium-Dark</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="varietal">Bean Varietal</label>
          <input id="varietal" name="varietal" type="text" className="form-input"
            value={formData.varietal} onChange={handleChange}
            placeholder="e.g., Bourbon, Typica, Heirloom" />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="altitude">Altitude</label>
          <input id="altitude" name="altitude" type="text" className="form-input"
            value={formData.altitude} onChange={handleChange}
            placeholder="e.g., 1600m" />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="processingMethod">Processing Method</label>
          <select id="processingMethod" name="processingMethod" className="form-input form-select"
            value={formData.processingMethod} onChange={handleChange}>
            <option value="">Select processing method...</option>
            <option value="washed">Washed</option>
            <option value="natural">Natural</option>
            <option value="honey">Honey</option>
            <option value="anaerobic">Anaerobic</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="flavorProfile">Flavor Profile</label>
          <input id="flavorProfile" name="flavorProfile" type="text" className="form-input"
            value={formData.flavorProfile} onChange={handleChange}
            placeholder="e.g., Blueberry, Chocolate, Citrus" />
          <p className="form-hint">Comma-separated flavor notes</p>
        </div>

        <div className="coffee-form-body-group">
          <div className="form-group" style={{ flex: '0 0 140px' }}>
            <label className="form-label" htmlFor="bodyCategory">Body</label>
            <select id="bodyCategory" name="bodyCategory" className="form-input form-select"
              value={formData.bodyCategory} onChange={handleChange}>
              <option value="">Select...</option>
              <option value="light">Light</option>
              <option value="medium">Medium</option>
              <option value="full">Full</option>
            </select>
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label" htmlFor="bodyDescription">Body Description</label>
            <input id="bodyDescription" name="bodyDescription" type="text" className="form-input"
              value={formData.bodyDescription} onChange={handleChange}
              placeholder="e.g., Smooth with balanced mouthfeel" />
          </div>
        </div>

        <div className="coffee-form-actions">
          <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Coffee'}
          </button>
          <Link to="/add" className="btn btn-ghost btn-block" style={{ textAlign: 'center' }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

export default CoffeeFormScreen
