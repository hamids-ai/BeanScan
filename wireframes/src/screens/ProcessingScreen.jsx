import { Link } from 'react-router-dom'
import WireframeBox from '../components/WireframeBox'

function ProcessingScreen() {
  return (
    <div className="screen">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <WireframeBox variant="solid" style={{ height: '24px', width: '80px', fontSize: '9px', margin: 0, padding: '4px' }}>
          [Logo]
        </WireframeBox>
      </div>

      <div className="processing-container">
        <WireframeBox variant="solid" style={{ width: '120px', height: '90px', marginBottom: '24px' }}>
          [Captured Photo]
        </WireframeBox>

        <div className="spinner" />

        <h2 style={{ fontSize: '18px', marginBottom: '24px' }}>Analyzing your coffee...</h2>

        <div style={{ width: '100%', maxWidth: '250px' }}>
          <div className="processing-step done">
            ✓ Photo captured
          </div>
          <div className="processing-step active">
            → Reading bag text (OCR)...
          </div>
          <div className="processing-step">
            ○ Looking up coffee details
          </div>
          <div className="processing-step">
            ○ Fetching metadata
          </div>
        </div>
      </div>

      <Link to="/coffee-form" className="btn btn-secondary" style={{ marginTop: 'auto' }}>
        Skip to Manual Entry
      </Link>
    </div>
  )
}

export default ProcessingScreen
