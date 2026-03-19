import { Link } from 'react-router-dom'
import WireframeBox from '../components/WireframeBox'

function WelcomeScreen() {
  return (
    <div className="screen">
      <WireframeBox variant="solid" style={{ height: '32px', width: '100px', margin: '0 auto 16px', fontSize: '10px' }}>
        [Logo]
      </WireframeBox>

      <WireframeBox variant="solid" style={{ height: '200px', marginBottom: '24px', background: '#e0e0e0' }}>
        [Hero Image - Coffee beans / Barista pouring]
      </WireframeBox>

      <h1 className="screen-title" style={{ textAlign: 'center' }}>BeanScan</h1>
      <p className="screen-subtitle" style={{ textAlign: 'center' }}>
        Your personal coffee bean journal, built by Barista Hamid
      </p>

      <WireframeBox variant="light" style={{ marginTop: '20px', marginBottom: '24px' }}>
        Track every coffee you try. Remember what you loved.
        Refine your brewing technique.
      </WireframeBox>

      <div className="spacer" />

      <Link to="/register" className="btn btn-primary">
        Get Started
      </Link>

      <Link to="/login" className="btn btn-secondary">
        I already have an account
      </Link>

      <div style={{ height: '20px' }} />
    </div>
  )
}

export default WelcomeScreen
