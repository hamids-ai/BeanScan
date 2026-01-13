import { Link, useParams } from 'react-router-dom'
import WireframeBox from '../components/WireframeBox'

function CoffeeDetailScreen() {
  const { id } = useParams()

  return (
    <div className="screen" style={{ paddingBottom: '20px' }}>
      <div className="header">
        <Link to="/collection" className="back-btn">←</Link>
        <WireframeBox variant="solid" style={{ height: '24px', width: '80px', fontSize: '9px', margin: 0, padding: '4px' }}>
          [Logo]
        </WireframeBox>
        <button style={{ background: 'none', border: 'none', fontSize: '14px', cursor: 'pointer' }}>
          Edit
        </button>
      </div>

      <div className="detail-image">
        [Coffee Bag Photo]
      </div>

      <h1 style={{ fontSize: '20px', marginBottom: '4px' }}>Ethiopia Yirgacheffe</h1>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Blue Bottle Coffee</p>
      <p style={{ fontSize: '12px', color: '#999' }}>Oakland, CA, USA</p>

      <div className="tags" style={{ marginTop: '12px' }}>
        <span className="tag">Light Roast</span>
        <span className="tag">Washed</span>
        <span className="tag">Ethiopia</span>
      </div>

      <div className="detail-section">
        <div className="detail-section-title">Coffee Details</div>
        <div className="detail-row">
          <span className="detail-label">Varietal</span>
          <span className="detail-value">Heirloom</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Altitude</span>
          <span className="detail-value">1,800m</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Processing</span>
          <span className="detail-value">Washed</span>
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section-title">Flavor Profile</div>
        <div className="tags">
          <span className="tag">Blueberry</span>
          <span className="tag">Citrus</span>
          <span className="tag">Floral</span>
        </div>
        <div style={{ marginTop: '12px' }}>
          <span className="detail-label">Body: </span>
          <span className="detail-value">Medium - Smooth with balanced mouthfeel</span>
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section-title">Brew Log</div>

        <div className="card" style={{ background: '#fafafa' }}>
          <div className="detail-row">
            <span className="detail-label">Date Started</span>
            <span className="detail-value">Jan 10, 2026</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Roast Date</span>
            <span className="detail-value">Jan 3, 2026</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Grind Setting</span>
            <span className="detail-value">15.5</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Rating</span>
            <span className="detail-value" style={{ color: '#4a4' }}>Great</span>
          </div>

          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
            <div className="detail-label" style={{ marginBottom: '4px' }}>Tasting Notes</div>
            <p style={{ fontSize: '13px', color: '#333', lineHeight: '1.4' }}>
              Bright and fruity with prominent blueberry notes. Really enjoyed this one - perfect for pour over.
            </p>
          </div>

          <p style={{ fontSize: '10px', color: '#999', marginTop: '12px' }}>
            Last updated: Jan 10, 2026
          </p>
        </div>

        <Link to={`/brew-log/${id}`} className="btn btn-secondary" style={{ marginTop: '12px' }}>
          Edit Brew Log
        </Link>
      </div>

      <p style={{ fontSize: '10px', color: '#999', textAlign: 'center', marginTop: '16px' }}>
        Added to collection: Jan 5, 2026
      </p>
    </div>
  )
}

export default CoffeeDetailScreen
