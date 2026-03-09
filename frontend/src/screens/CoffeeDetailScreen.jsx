import { Link, useParams } from 'react-router-dom'
import './CoffeeDetailScreen.css'

// Sample data store - will be replaced with real data from backend
const coffeeData = {
  1: {
    id: 1,
    name: 'Ethiopia Yirgacheffe',
    roaster: 'Blue Bottle Coffee',
    roasterLocation: 'Oakland, CA, USA',
    origins: 'Ethiopia',
    roastLevel: 'Light',
    varietal: 'Heirloom',
    altitude: '1,800 - 2,200m',
    processingMethod: 'Washed',
    flavorProfile: ['Blueberry', 'Citrus', 'Floral', 'Jasmine'],
    bodyProfile: {
      category: 'Light-Medium',
      description: 'Tea-like and delicate with bright acidity'
    },
    imageUrl: null,
    dateAdded: 'Jan 12, 2026',
    brewLog: {
      dateStarted: 'Jan 14, 2026',
      roastDate: 'Jan 8, 2026',
      grindSetting: '18.0',
      rating: 'great',
      tastingNotes: 'Absolutely stunning pour over. The blueberry notes really came through on day 6 post-roast. Bright and clean with a floral finish that lingers. Best at 1:16 ratio.',
      bodyNotes: 'Delicate and tea-like. Very light on the palate but coats the tongue with a silky texture. Perfect for morning drinking.',
      lastUpdated: 'Jan 14, 2026'
    }
  },
  2: {
    id: 2,
    name: 'Colombia Huila',
    roaster: 'Stumptown Coffee',
    roasterLocation: 'Portland, OR, USA',
    origins: 'Colombia',
    roastLevel: 'Medium',
    varietal: 'Caturra, Castillo',
    altitude: '1,650 - 1,900m',
    processingMethod: 'Washed',
    flavorProfile: ['Caramel', 'Red Apple', 'Milk Chocolate', 'Honey'],
    bodyProfile: {
      category: 'Medium',
      description: 'Smooth and balanced with creamy mouthfeel'
    },
    imageUrl: null,
    dateAdded: 'Jan 10, 2026',
    brewLog: {
      dateStarted: 'Jan 11, 2026',
      roastDate: 'Jan 5, 2026',
      grindSetting: '15.5',
      rating: 'good',
      tastingNotes: 'Classic Colombian profile. Sweet caramel upfront with a pleasant apple-like acidity. Works great as espresso too - pulled a nice 18g in, 36g out shot.',
      bodyNotes: 'Medium and creamy. Has a nice roundness to it that makes it very approachable. Not too heavy, not too light.',
      lastUpdated: 'Jan 12, 2026'
    }
  },
  3: {
    id: 3,
    name: 'Guatemala Antigua',
    roaster: 'Intelligentsia',
    roasterLocation: 'Chicago, IL, USA',
    origins: 'Guatemala',
    roastLevel: 'Medium',
    varietal: 'Bourbon, Caturra',
    altitude: '1,500 - 1,700m',
    processingMethod: 'Washed',
    flavorProfile: ['Dark Chocolate', 'Orange', 'Brown Sugar', 'Nutty'],
    bodyProfile: {
      category: 'Medium-Full',
      description: 'Rich and velvety with a syrupy finish'
    },
    imageUrl: null,
    dateAdded: 'Jan 5, 2026',
    brewLog: {
      dateStarted: 'Jan 6, 2026',
      roastDate: 'Dec 30, 2025',
      grindSetting: '14.0',
      rating: 'great',
      tastingNotes: 'This is an exceptional coffee. Deep chocolate notes with hints of orange zest. The sweetness really develops as it cools. Tried it as a cortado - incredible.',
      bodyNotes: 'Full and syrupy. Coats the entire palate with a rich, velvety texture. Feels substantial without being heavy.',
      lastUpdated: 'Jan 8, 2026'
    }
  },
  4: {
    id: 4,
    name: 'Kenya AA',
    roaster: 'Counter Culture',
    roasterLocation: 'Durham, NC, USA',
    origins: 'Kenya',
    roastLevel: 'Light-Medium',
    varietal: 'SL28, SL34',
    altitude: '1,700 - 2,000m',
    processingMethod: 'Washed',
    flavorProfile: ['Blackcurrant', 'Tomato', 'Grapefruit', 'Wine'],
    bodyProfile: {
      category: 'Medium',
      description: 'Juicy and vibrant with wine-like qualities'
    },
    imageUrl: null,
    dateAdded: 'Dec 28, 2025',
    brewLog: {
      dateStarted: 'Dec 30, 2025',
      roastDate: 'Dec 22, 2025',
      grindSetting: '17.5',
      rating: 'neutral',
      tastingNotes: 'Very complex and intense. The tomato note is quite pronounced which took some getting used to. Definitely an acquired taste. Better results with a coarser grind.',
      bodyNotes: 'Juicy is the right word. Has an almost wine-like weight to it. The acidity makes it feel lighter than it actually is.',
      lastUpdated: 'Jan 2, 2026'
    }
  }
}

function CoffeeDetailScreen() {
  const { id } = useParams()

  // Get coffee data by ID, fallback to first coffee if not found
  const coffee = coffeeData[id] || coffeeData[1]

  const getRatingClass = (rating) => {
    return `rating rating-${rating}`
  }

  const getRatingLabel = (rating) => {
    return rating.charAt(0).toUpperCase() + rating.slice(1)
  }

  return (
    <div className="screen coffee-detail-screen">
      <div className="detail-header">
        <Link to="/collection" className="back-btn">
          ← Back
        </Link>
        <Link to={`/brew-log/${id}`} className="btn btn-ghost btn-sm">Edit</Link>
      </div>

      <div className="detail-image">
        {coffee.imageUrl ? (
          <img src={coffee.imageUrl} alt={coffee.name} />
        ) : (
          <span className="detail-image-placeholder">&#9749;</span>
        )}
      </div>

      <div className="detail-title-section">
        <h1 className="detail-title">{coffee.name}</h1>
        <p className="detail-roaster">{coffee.roaster}</p>
        <p className="detail-location">{coffee.roasterLocation}</p>
      </div>

      <div className="detail-highlights">
        <div className="highlight-item">
          <span className="highlight-label">Roast</span>
          <span className="highlight-value">{coffee.roastLevel}</span>
        </div>
        <div className="highlight-divider"></div>
        <div className="highlight-item">
          <span className="highlight-label">Origin</span>
          <span className="highlight-value">{coffee.origins}</span>
        </div>
      </div>

      {/* Auto-populated section - BeanScan AI provided */}
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
            <div className="detail-row">
              <span className="detail-label">Varietal</span>
              <span className="detail-value">{coffee.varietal}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Altitude</span>
              <span className="detail-value">{coffee.altitude}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Processing</span>
              <span className="detail-value">{coffee.processingMethod}</span>
            </div>
          </div>
        </section>

        <section className="detail-section detail-section-auto">
          <h2 className="detail-section-title">Flavor Profile</h2>
          <div className="detail-tags" style={{ marginBottom: 'var(--spacing-3)' }}>
            {coffee.flavorProfile.map((flavor, index) => (
              <span key={index} className="tag">{flavor}</span>
            ))}
          </div>
        </section>

        <section className="detail-section detail-section-auto detail-section-last">
          <h2 className="detail-section-title">Body Profile</h2>
          <p className="body-profile-text">
            <span className="body-category">{coffee.bodyProfile.category}</span>
            <span className="body-description">{coffee.bodyProfile.description}</span>
          </p>
        </section>
      </div>

      {/* User-provided section - Brew Log */}
      <div className="user-section">
        <div className="user-section-header">
          <span className="user-badge">
            <span className="user-badge-icon">&#9997;</span>
            Your Brew Log
          </span>
        </div>

        <section className="detail-section detail-section-user">
          {coffee.brewLog ? (
            <div className="brew-log-card">
              <div className="detail-row">
                <span className="detail-label">Date Started</span>
                <span className="detail-value">{coffee.brewLog.dateStarted}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Roast Date</span>
                <span className="detail-value">{coffee.brewLog.roastDate}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Grind Setting</span>
                <span className="detail-value">{coffee.brewLog.grindSetting}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Rating</span>
                <span className={getRatingClass(coffee.brewLog.rating)}>
                  {getRatingLabel(coffee.brewLog.rating)}
                </span>
              </div>

              <div className="brew-log-notes">
                <span className="detail-label">Tasting Notes</span>
                <p className="brew-log-notes-text">{coffee.brewLog.tastingNotes}</p>
              </div>

              {coffee.brewLog.bodyNotes && (
                <div className="brew-log-notes">
                  <span className="detail-label">Body Notes</span>
                  <p className="brew-log-notes-text">{coffee.brewLog.bodyNotes}</p>
                </div>
              )}

              <p className="brew-log-updated">
                Last updated: {coffee.brewLog.lastUpdated}
              </p>
            </div>
          ) : (
            <div className="brew-log-empty">
              <p className="brew-log-empty-title">No brew log yet</p>
              <p className="brew-log-empty-text">Record your brewing experience and tasting notes</p>
            </div>
          )}

          <Link to={`/brew-log/${id}`} className="btn btn-primary" style={{ marginTop: 'var(--spacing-4)' }}>
            {coffee.brewLog ? 'Edit Brew Log' : 'Add Brew Log'}
          </Link>
        </section>
      </div>

      <p className="detail-added-date">
        Added to collection: {coffee.dateAdded}
      </p>
    </div>
  )
}

export default CoffeeDetailScreen
