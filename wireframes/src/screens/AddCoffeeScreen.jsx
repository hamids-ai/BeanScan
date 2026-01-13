import { Link } from 'react-router-dom'
import WireframeBox from '../components/WireframeBox'

function AddCoffeeScreen() {
  return (
    <div className="screen">
      <div className="header">
        <Link to="/collection" className="back-btn">←</Link>
        <WireframeBox variant="solid" style={{ height: '24px', width: '80px', fontSize: '9px', margin: 0, padding: '4px' }}>
          [Logo]
        </WireframeBox>
        <span style={{ width: '24px' }}></span>
      </div>

      <h1 className="screen-title">Add Coffee</h1>

      <div className="spacer" />

      <Link to="/capture" style={{ textDecoration: 'none' }}>
        <div className="card" style={{ cursor: 'pointer' }}>
          <WireframeBox variant="solid" style={{ height: '60px', marginBottom: '12px' }}>
            [Camera Icon]
          </WireframeBox>
          <h3 style={{ fontSize: '16px', marginBottom: '0' }}>Take Photo</h3>
        </div>
      </Link>

      <p style={{ textAlign: 'center', color: '#999', fontSize: '14px', margin: '12px 0' }}>or</p>

      <Link to="/coffee-form" style={{ textDecoration: 'none' }}>
        <div className="card" style={{ cursor: 'pointer' }}>
          <WireframeBox variant="solid" style={{ height: '60px', marginBottom: '12px' }}>
            [Form Icon]
          </WireframeBox>
          <h3 style={{ fontSize: '16px', marginBottom: '0' }}>Add Manually</h3>
        </div>
      </Link>

      <div className="spacer" />

      <WireframeBox variant="light" style={{ fontSize: '11px' }}>
        Tip: Taking a photo is faster! It's magic.
      </WireframeBox>
    </div>
  )
}

export default AddCoffeeScreen
