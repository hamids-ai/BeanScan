import { Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import WelcomeScreen from './screens/WelcomeScreen'
import RegisterScreen from './screens/RegisterScreen'
import LoginScreen from './screens/LoginScreen'
import CollectionScreen from './screens/CollectionScreen'
import CoffeeDetailScreen from './screens/CoffeeDetailScreen'
import AddCoffeeScreen from './screens/AddCoffeeScreen'
import PhotoCaptureScreen from './screens/PhotoCaptureScreen'
import ProcessingScreen from './screens/ProcessingScreen'
import CoffeeFormScreen from './screens/CoffeeFormScreen'
import BrewLogScreen from './screens/BrewLogScreen'

function App() {
  return (
    <div className="app-container">
      <Navigation />
      <div className="phone-frame">
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/collection" element={<CollectionScreen />} />
          <Route path="/coffee/:id" element={<CoffeeDetailScreen />} />
          <Route path="/add" element={<AddCoffeeScreen />} />
          <Route path="/capture" element={<PhotoCaptureScreen />} />
          <Route path="/processing" element={<ProcessingScreen />} />
          <Route path="/coffee-form" element={<CoffeeFormScreen />} />
          <Route path="/brew-log/:id" element={<BrewLogScreen />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
