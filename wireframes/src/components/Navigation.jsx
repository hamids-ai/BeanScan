import { NavLink } from 'react-router-dom'

function Navigation() {
  const links = [
    { path: '/', label: 'Welcome' },
    { path: '/register', label: 'Register' },
    { path: '/login', label: 'Login' },
    { path: '/collection', label: 'Collection' },
    { path: '/add', label: 'Add Coffee' },
    { path: '/capture', label: 'Photo' },
    { path: '/processing', label: 'Processing' },
    { path: '/coffee-form', label: 'Form' },
    { path: '/coffee/1', label: 'Detail' },
    { path: '/brew-log/1', label: 'Brew Log' },
  ]

  return (
    <nav className="dev-nav">
      <h4>Dev Navigation - All Screens</h4>
      <div className="dev-nav-links">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default Navigation
