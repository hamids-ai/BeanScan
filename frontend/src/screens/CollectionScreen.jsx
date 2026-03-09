import { Link } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import './CollectionScreen.css'

function CollectionScreen() {
  const { user } = useUser()
  // Sample data - will be replaced with real data from backend
  const coffees = [
    {
      id: 1,
      name: 'Ethiopia Yirgacheffe',
      roaster: 'Blue Bottle Coffee',
      rating: 'great',
      dateAdded: 'Jan 12, 2026',
      imageUrl: null
    },
    {
      id: 2,
      name: 'Colombia Huila',
      roaster: 'Stumptown Coffee',
      rating: 'good',
      dateAdded: 'Jan 10, 2026',
      imageUrl: null
    },
    {
      id: 3,
      name: 'Guatemala Antigua',
      roaster: 'Intelligentsia',
      rating: 'great',
      dateAdded: 'Jan 5, 2026',
      imageUrl: null
    },
    {
      id: 4,
      name: 'Kenya AA',
      roaster: 'Counter Culture',
      rating: 'neutral',
      dateAdded: 'Dec 28, 2025',
      imageUrl: null
    }
  ]

  const getRatingClass = (rating) => {
    return `rating rating-${rating}`
  }

  const getRatingLabel = (rating) => {
    return rating.charAt(0).toUpperCase() + rating.slice(1)
  }

  return (
    <div className="screen collection-screen">
      <div className="collection-header">
        <div>
          <span className="logo logo-sm">BeanScan</span>
        </div>
      </div>

      <h1 className="screen-title">{user?.name ? `${user.name}'s Coffee Log` : 'Coffee Log'}</h1>
      <p className="screen-subtitle">{coffees.length} coffees in collection</p>

      <div className="search-container">
        <input
          type="text"
          className="form-input search-input"
          placeholder="Search coffees..."
        />
      </div>

      {coffees.length === 0 ? (
        <div className="card card-bordered">
          <div className="empty-state">
            <div className="empty-state-icon">&#9749;</div>
            <div className="empty-state-title">No coffees yet</div>
            <div className="empty-state-text">
              Add your first coffee to start building your collection.
            </div>
          </div>
        </div>
      ) : (
        <div className="coffee-list">
          {coffees.map((coffee) => (
            <Link
              key={coffee.id}
              to={`/coffee/${coffee.id}`}
              className="coffee-card"
            >
              <div className="coffee-card-image">
                {coffee.imageUrl ? (
                  <img src={coffee.imageUrl} alt={coffee.name} />
                ) : (
                  <span className="coffee-card-image-placeholder">&#9749;</span>
                )}
              </div>
              <div className="coffee-card-content">
                <div className="coffee-card-header">
                  <h3 className="coffee-card-name">{coffee.name}</h3>
                  <span className={getRatingClass(coffee.rating)}>
                    {getRatingLabel(coffee.rating)}
                  </span>
                </div>
                <p className="coffee-card-roaster">{coffee.roaster}</p>
                <p className="coffee-card-date">{coffee.dateAdded}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Link to="/add" className="fab">
        <span>+</span>
      </Link>
    </div>
  )
}

export default CollectionScreen
