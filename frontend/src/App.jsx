import { Routes, Route } from 'react-router-dom'
import WelcomeScreen from './screens/WelcomeScreen'
import LoginScreen from './screens/LoginScreen'
import RegisterScreen from './screens/RegisterScreen'
import CollectionScreen from './screens/CollectionScreen'
import AddCoffeeScreen from './screens/AddCoffeeScreen'
import CoffeeDetailScreen from './screens/CoffeeDetailScreen'
import BrewLogScreen from './screens/BrewLogScreen'
import ComponentShowcase from './screens/ComponentShowcase'

function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomeScreen />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/register" element={<RegisterScreen />} />
      <Route path="/collection" element={<CollectionScreen />} />
      <Route path="/add" element={<AddCoffeeScreen />} />
      <Route path="/coffee/:id" element={<CoffeeDetailScreen />} />
      <Route path="/brew-log/:id" element={<BrewLogScreen />} />
      <Route path="/components" element={<ComponentShowcase />} />
    </Routes>
  )
}

export default App
