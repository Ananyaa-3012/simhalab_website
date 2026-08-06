import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import SimhaLogo from './SimhaLogo'
import iitmLogo from '../assets/iitm_logo.png'
import wsaiLogo from '../assets/wsai_logo.png'
import './Navbar.css'

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/people', label: 'People' },
  { path: '/research', label: 'Research' },
  { path: '/blog', label: 'Blog' },
  { path: '/resources', label: 'Resources' },
  { path: '/gallery', label: 'Gallery' },
  { path: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <SimhaLogo variant="logo" className="navbar-simha-icon" alwaysDark />
          <div className="navbar-brand-text">
            <span className="navbar-title">SIMHA Lab</span>
            <span className="navbar-subtitle">IIT Madras</span>
          </div>
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          <span className={`hamburger ${menuOpen ? 'open' : ''}`}></span>
        </button>

        <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`navbar-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-right">
          <ThemeToggle />
          <img src={wsaiLogo} alt="WSAI" className="navbar-logo" />
          <img src={iitmLogo} alt="IIT Madras" className="navbar-logo" />
        </div>
      </div>
    </nav>
  )
}
