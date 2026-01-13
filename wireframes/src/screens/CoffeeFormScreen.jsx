import { Link } from 'react-router-dom'
import WireframeBox from '../components/WireframeBox'

function CoffeeFormScreen() {
  return (
    <div className="screen" style={{ paddingBottom: '100px' }}>
      <div className="header">
        <Link to="/add" className="back-btn">←</Link>
        <WireframeBox variant="solid" style={{ height: '24px', width: '80px', fontSize: '9px', margin: 0, padding: '4px' }}>
          [Logo]
        </WireframeBox>
        <span style={{ width: '24px' }}></span>
      </div>

      <div className="completeness">
        <span>6/10 fields</span>
        <div className="completeness-bar">
          <div className="completeness-fill" style={{ width: '60%' }} />
        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        <div className="form-group">
          <label className="form-label">Bag Name *</label>
          <input
            type="text"
            className="form-input"
            defaultValue="Ethiopia Yirgacheffe"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Roaster Name *</label>
          <input
            type="text"
            className="form-input"
            defaultValue="Blue Bottle Coffee"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Roaster Location</label>
          <input
            type="text"
            className="form-input"
            defaultValue="Oakland, CA, USA"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Origin(s)</label>
          <input
            type="text"
            className="form-input"
            defaultValue="Ethiopia"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Roast Level</label>
          <select className="form-input">
            <option value="">Select...</option>
            <option value="light" selected>Light</option>
            <option value="medium-light">Medium-Light</option>
            <option value="medium">Medium</option>
            <option value="medium-dark">Medium-Dark</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Varietal</label>
          <input
            type="text"
            className="form-input"
            defaultValue="Heirloom"
            style={{ background: '#fffde7', borderColor: '#ffd54f' }}
          />
          <span style={{ fontSize: '10px', color: '#f57c00' }}>Auto-populated - verify</span>
        </div>

        <div className="form-group">
          <label className="form-label">Altitude</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., 1800m"
            style={{ background: '#fff3e0', borderColor: '#ffb74d' }}
          />
          <span style={{ fontSize: '10px', color: '#f57c00' }}>Unknown - add manually</span>
        </div>

        <div className="form-group">
          <label className="form-label">Processing Method</label>
          <input
            type="text"
            className="form-input"
            defaultValue="Washed"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Flavor Profile</label>
          <div className="tags" style={{ marginBottom: '8px' }}>
            <span className="tag">Blueberry</span>
            <span className="tag">Citrus</span>
            <span className="tag">Floral</span>
            <span className="tag" style={{ background: '#ddd', cursor: 'pointer' }}>+ Add</span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Body Profile</label>
          <select className="form-input" style={{ marginBottom: '8px' }}>
            <option value="light">Light</option>
            <option value="medium" selected>Medium</option>
            <option value="full">Full</option>
          </select>
          <input
            type="text"
            className="form-input"
            placeholder="Description (optional)"
            defaultValue="Smooth with balanced mouthfeel"
          />
        </div>
      </div>

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '375px',
        padding: '16px 20px',
        background: '#fff',
        borderTop: '1px solid #eee',
        boxSizing: 'border-box'
      }}>
        <Link to="/collection" className="btn btn-primary" style={{ margin: 0 }}>
          Save Coffee
        </Link>
      </div>
    </div>
  )
}

export default CoffeeFormScreen
