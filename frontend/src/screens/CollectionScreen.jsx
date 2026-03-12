import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { supabase } from '../lib/supabase'
import './CollectionScreen.css'

function CollectionScreen() {
  const { user, logout } = useUser()
  const [coffees, setCoffees] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchCoffees() {
      const { data, error } = await supabase
        .from('coffees')
        .select('id, bag_name, roaster_name, photo_url, date_added, rating')
        .order('date_added', { ascending: false })

      if (error) {
        setError('Could not load your collection. Please refresh.')
      } else {
        setCoffees(data.map(row => ({
          id: row.id,
          name: row.bag_name,
          roaster: row.roaster_name,
          imageUrl: row.photo_url,
          dateAdded: new Date(row.date_added).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          rating: row.rating,
        })))
      }
      setIsLoading(false)
    }

    fetchCoffees()
  }, [])

  const getRatingClass = (rating) => `rating rating-${rating}`
  const getRatingLabel = (rating) => rating.charAt(0).toUpperCase() + rating.slice(1)

  return (
    <div className="screen collection-screen">
      <div className="collection-header">
        <span className="logo logo-sm">BeanScan</span>
        <button onClick={logout} className="btn btn-ghost btn-sm">Sign out</button>
      </div>

      <h1 className="screen-title">{user?.name ? `${user.name}'s Coffee Log` : 'Coffee Log'}</h1>

      {isLoading ? (
        <div style={{ padding: 'var(--spacing-12) 0', display: 'flex', justifyContent: 'center' }}>
          <div className="spinner spinner-lg" />
        </div>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : (
        <>
          <p className="screen-subtitle">{coffees.length} coffee{coffees.length !== 1 ? 's' : ''} in collection</p>

          {coffees.length === 0 ? (
            <div className="card card-bordered">
              <div className="empty-state">
                <div className="empty-state-icon">&#9749;</div>
                <div className="empty-state-title">No coffees yet</div>
                <div className="empty-state-text">Add your first coffee to start building your collection.</div>
              </div>
            </div>
          ) : (
            <div className="coffee-list">
              {coffees.map((coffee) => (
                <Link key={coffee.id} to={`/coffee/${coffee.id}`} className="coffee-card">
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
                      {coffee.rating && (
                        <span className={getRatingClass(coffee.rating)}>{getRatingLabel(coffee.rating)}</span>
                      )}
                    </div>
                    <p className="coffee-card-roaster">{coffee.roaster}</p>
                    <p className="coffee-card-date">{coffee.dateAdded}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      <Link to="/add" className="fab">
        <span>+</span>
      </Link>
    </div>
  )
}

export default CollectionScreen
