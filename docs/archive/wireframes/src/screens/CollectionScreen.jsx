import { useState } from 'react'
import { Link } from 'react-router-dom'
import WireframeBox from '../components/WireframeBox'

function CollectionScreen() {
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)

  const sampleCoffees = [
    { id: 1, name: 'Ethiopia Yirgacheffe', roaster: 'Blue Bottle', rating: 'Great', dateAdded: 'Jan 12, 2026' },
    { id: 2, name: 'Colombia Huila', roaster: 'Stumptown', rating: 'Good', dateAdded: 'Jan 10, 2026' },
    { id: 3, name: 'Guatemala Antigua', roaster: 'Intelligentsia', rating: 'Great', dateAdded: 'Jan 5, 2026' },
    { id: 4, name: 'Kenya AA', roaster: 'Counter Culture', rating: 'Neutral', dateAdded: 'Dec 28, 2025' },
  ]

  return (
    <div className="screen screen-relative">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <WireframeBox variant="solid" style={{ height: '24px', width: '80px', fontSize: '9px', margin: 0, padding: '4px' }}>
          [Logo]
        </WireframeBox>
      </div>

      <h1 className="screen-title">Coffee Log</h1>
      <p className="screen-subtitle">4 coffees in collection</p>

      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search coffees..."
        />
      </div>

      <div className="coffee-list">
        {sampleCoffees.map((coffee) => (
          <Link
            key={coffee.id}
            to={`/coffee/${coffee.id}`}
            className="coffee-card-row"
            style={{ textDecoration: 'none' }}
          >
            <div className="coffee-card-row-image">[Photo]</div>
            <div className="coffee-card-row-info">
              <div className="coffee-card-name">{coffee.name}</div>
              <div className="coffee-card-roaster">{coffee.roaster}</div>
              <div className="coffee-card-meta">
                <span className="coffee-card-rating">{coffee.rating}</span>
                <span className="coffee-card-date">{coffee.dateAdded}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Link to="/add" className="fab">+</Link>

      {/* Duplicate Warning Modal - Toggle with button for demo */}
      <button
        onClick={() => setShowDuplicateModal(true)}
        style={{
          position: 'absolute',
          bottom: '90px',
          right: '20px',
          fontSize: '10px',
          padding: '4px 8px',
          background: '#eee',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Show Modal
      </button>

      {showDuplicateModal && (
        <div className="modal-overlay" onClick={() => setShowDuplicateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Duplicate Detected</div>
            <div className="modal-text">
              You may have already added this coffee. Would you like to view the existing entry?
            </div>
            <Link
              to="/coffee/1"
              className="btn btn-primary"
              onClick={() => setShowDuplicateModal(false)}
            >
              View Existing
            </Link>
            <button
              className="btn btn-secondary"
              onClick={() => setShowDuplicateModal(false)}
            >
              Add Anyway
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CollectionScreen
