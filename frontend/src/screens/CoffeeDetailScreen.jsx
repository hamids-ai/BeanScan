import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import CoffeeThumbnail, { getAccentColor } from '../components/CoffeeThumbnail'
import './CoffeeDetailScreen.css'

function CoffeeDetailScreen() {
  const { id } = useParams()
  const [coffee, setCoffee] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchCoffee() {
      const { data, error } = await supabase
        .from('coffees')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        setError('Could not load coffee details.')
      } else {
        setCoffee(mapRow(data))
      }
      setIsLoading(false)
    }

    fetchCoffee()
  }, [id])

  const getRatingClass = (rating) => `rating rating-${rating}`
  const getRatingLabel = (rating) => rating.charAt(0).toUpperCase() + rating.slice(1)

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleClearImage = async () => {
    await supabase.from('coffees').update({ photo_url: null }).eq('id', id)
    setCoffee(prev => ({ ...prev, imageUrl: null }))
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    await supabase.from('coffees').delete().eq('id', id)
    navigate('/collection')
  }

  if (isLoading) {
    return (
      <div className="screen coffee-detail-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner spinner-lg" />
      </div>
    )
  }

  if (error || !coffee) {
    return (
      <div className="screen coffee-detail-screen">
        <Link to="/collection" className="back-btn">← Back</Link>
        <div className="alert alert-error" style={{ marginTop: 'var(--spacing-6)' }}>{error || 'Coffee not found.'}</div>
      </div>
    )
  }

  const hasBrewLog = coffee.brewLog.grindSetting != null

  return (
    <div className="screen coffee-detail-screen">
      <div className="detail-header">
        <Link to="/collection" className="back-btn">← Back</Link>
        <Link to={`/brew-log/${id}`} className="btn btn-ghost btn-sm">Edit</Link>
      </div>

      <div className="detail-image" style={{ boxShadow: `0 0 28px ${getAccentColor(coffee.name)}50, 0 0 60px ${getAccentColor(coffee.name)}20` }}>
        <CoffeeThumbnail imageUrl={coffee.imageUrl} name={coffee.name} size="lg" />
      </div>
      {coffee.imageUrl && (
        <button className="wrong-image-btn" onClick={handleClearImage}>
          Wrong image?
        </button>
      )}

      <div className="detail-title-section">
        <h1 className="detail-title">{coffee.name}</h1>
        <p className="detail-roaster">{coffee.roaster}</p>
        {coffee.roasterLocation && <p className="detail-location">{coffee.roasterLocation}</p>}
      </div>

      {(coffee.roastLevel || coffee.origins) && (
        <div className="detail-highlights">
          {coffee.roastLevel && (
            <div className="highlight-item">
              <span className="highlight-label">Roast</span>
              <span className="highlight-value" style={{ textTransform: 'capitalize' }}>{coffee.roastLevel}</span>
            </div>
          )}
          {coffee.roastLevel && coffee.origins && <div className="highlight-divider" />}
          {coffee.origins && (
            <div className="highlight-item">
              <span className="highlight-label">Origin</span>
              <span className="highlight-value">{coffee.origins}</span>
            </div>
          )}
        </div>
      )}

      {/* Auto-populated section */}
      <div className="auto-section">
        <div className="auto-section-header">
          <span className="auto-badge">
            <span className="auto-badge-icon">&#10024;</span>
            Auto-filled by BeanScan
          </span>
        </div>

        <section className="detail-section detail-section-auto">
          <h2 className="detail-section-title">Coffee Details</h2>
          <div className="detail-grid">
            {coffee.varietal && (
              <div className="detail-row">
                <span className="detail-label">Varietal</span>
                <span className="detail-value">{coffee.varietal}</span>
              </div>
            )}
            {coffee.altitude && (
              <div className="detail-row">
                <span className="detail-label">Altitude</span>
                <span className="detail-value">{coffee.altitude}</span>
              </div>
            )}
            {coffee.processingMethod && (
              <div className="detail-row">
                <span className="detail-label">Processing</span>
                <span className="detail-value" style={{ textTransform: 'capitalize' }}>{coffee.processingMethod}</span>
              </div>
            )}
          </div>
        </section>

        {coffee.flavorProfile.length > 0 && (
          <section className="detail-section detail-section-auto">
            <h2 className="detail-section-title">Flavor Profile</h2>
            <div className="detail-tags" style={{ marginBottom: 'var(--spacing-3)' }}>
              {coffee.flavorProfile.map((flavor, i) => (
                <span key={i} className="tag">{flavor}</span>
              ))}
            </div>
          </section>
        )}

        {(coffee.bodyCategory || coffee.bodyDescription) && (
          <section className="detail-section detail-section-auto detail-section-last">
            <h2 className="detail-section-title">Body Profile</h2>
            <p className="body-profile-text">
              {coffee.bodyCategory && (
                <span className="body-category" style={{ textTransform: 'capitalize' }}>{coffee.bodyCategory}</span>
              )}
              {coffee.bodyDescription && (
                <span className="body-description">{coffee.bodyDescription}</span>
              )}
            </p>
          </section>
        )}
      </div>

      {/* Brew log section */}
      <div className="user-section">
        <div className="user-section-header">
          <span className="user-badge">
            <span className="user-badge-icon">&#9997;</span>
            Your Brew Log
          </span>
        </div>

        <section className="detail-section detail-section-user">
          {hasBrewLog ? (
            <div className="brew-log-card">
              {coffee.brewLog.brewDate && (
                <div className="detail-row">
                  <span className="detail-label">Date Started</span>
                  <span className="detail-value">{coffee.brewLog.brewDate}</span>
                </div>
              )}
              {coffee.brewLog.roastDate && (
                <div className="detail-row">
                  <span className="detail-label">Roast Date</span>
                  <span className="detail-value">{coffee.brewLog.roastDate}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Grind Setting</span>
                <span className="detail-value">{coffee.brewLog.grindSetting}</span>
              </div>
              {coffee.brewLog.rating && (
                <div className="detail-row">
                  <span className="detail-label">Rating</span>
                  <span className={getRatingClass(coffee.brewLog.rating)}>
                    {getRatingLabel(coffee.brewLog.rating)}
                  </span>
                </div>
              )}
              {coffee.brewLog.tastingNotes && (
                <div className="brew-log-notes">
                  <span className="detail-label">Tasting Notes</span>
                  <p className="brew-log-notes-text">{coffee.brewLog.tastingNotes}</p>
                </div>
              )}
              {coffee.brewLog.bodyNotes && (
                <div className="brew-log-notes">
                  <span className="detail-label">Body Notes</span>
                  <p className="brew-log-notes-text">{coffee.brewLog.bodyNotes}</p>
                </div>
              )}
              {coffee.brewLog.lastUpdated && (
                <p className="brew-log-updated">Last updated: {coffee.brewLog.lastUpdated}</p>
              )}
            </div>
          ) : (
            <div className="brew-log-empty">
              <p className="brew-log-empty-title">No brew log yet</p>
              <p className="brew-log-empty-text">Record your brewing experience and tasting notes</p>
            </div>
          )}

          <Link to={`/brew-log/${id}`} className="btn btn-primary" style={{ marginTop: 'var(--spacing-4)' }}>
            {hasBrewLog ? 'Edit Brew Log' : 'Add Brew Log'}
          </Link>
        </section>
      </div>

      <p className="detail-added-date">Added to collection: {coffee.dateAdded}</p>

      <div className="delete-section">
        {confirmDelete ? (
          <div className="delete-confirm">
            <p className="delete-confirm-text">Delete this coffee from your collection?</p>
            <div className="delete-confirm-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(false)} disabled={isDeleting}>
                Cancel
              </button>
              <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        ) : (
          <button className="btn btn-ghost btn-sm delete-btn" onClick={() => setConfirmDelete(true)}>
            Delete Coffee
          </button>
        )}
      </div>
    </div>
  )
}

// Map snake_case DB row to camelCase shape the JSX expects
function mapRow(row) {
  return {
    id: row.id,
    name: row.bag_name,
    roaster: row.roaster_name,
    roasterLocation: row.roaster_location,
    origins: row.origins,
    roastLevel: row.roast_level,
    varietal: row.varietal,
    altitude: row.altitude,
    processingMethod: row.processing_method,
    flavorProfile: row.flavor_profile ? row.flavor_profile.split(',').map(f => f.trim()) : [],
    bodyCategory: row.body_category,
    bodyDescription: row.body_description,
    imageUrl: row.photo_url,
    dateAdded: new Date(row.date_added).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    brewLog: {
      brewDate: row.brew_date,
      roastDate: row.roast_date,
      grindSetting: row.grind_setting,
      rating: row.rating,
      tastingNotes: row.tasting_notes,
      bodyNotes: row.body_notes,
      lastUpdated: row.brew_last_updated
        ? new Date(row.brew_last_updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : null,
    },
  }
}

export default CoffeeDetailScreen
