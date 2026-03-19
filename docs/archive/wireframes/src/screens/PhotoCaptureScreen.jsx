import { Link } from 'react-router-dom'
import WireframeBox from '../components/WireframeBox'

function PhotoCaptureScreen() {
  return (
    <div className="screen" style={{ background: '#1a1a1a', padding: '16px' }}>
      <div className="header" style={{ borderBottom: 'none' }}>
        <Link to="/add" className="back-btn" style={{ color: '#fff' }}>×</Link>
        <WireframeBox variant="solid" style={{ height: '24px', width: '80px', fontSize: '9px', margin: 0, padding: '4px', background: '#444', borderColor: '#555' }}>
          [Logo]
        </WireframeBox>
        <span style={{ width: '24px' }}></span>
      </div>

      <div className="camera-view">
        <div className="camera-frame">
          Position coffee bag here
        </div>

        <p style={{ marginTop: '16px', fontSize: '12px' }}>
          Make sure the bag name is visible
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '20px' }}>
        <Link to="/processing">
          <button className="capture-btn" />
        </Link>
        <p style={{ color: '#666', fontSize: '11px', marginTop: '12px' }}>
          Tap to capture
        </p>
      </div>
    </div>
  )
}

export default PhotoCaptureScreen
