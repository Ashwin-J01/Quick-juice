import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import './navbar.css'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { getTotalItems } = useCart()

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const BrandLogo = () => {
    const [visible, setVisible] = useState(true)
    if (!visible) return null
    return (
      <img
        src="/logo.png"
        alt="QuickJuice"
        className="brand-logo"
        onError={() => setVisible(false)}
      />
    )
  }

  return (
    <nav className="site-nav">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          {/** hide img if it fails to load to avoid broken icon */}
          <BrandLogo />
          QuickJuice
        </Link>

        <div className="nav-links">
          {!isAdmin && (
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
          )}

          {isAuthenticated && !isAdmin && (
            <div style={{ position: 'relative' }}>
              <Link to="/cart" className={`nav-link ${isActive('/cart') ? 'active' : ''}`}>Cart</Link>
              {getTotalItems() > 0 && (
                <span className="cart-badge">{getTotalItems()}</span>
              )}
            </div>
          )}

          {isAuthenticated && !isAdmin && (
            <Link to="/track" className={`nav-link ${isActive('/track') ? 'active' : ''}`}>Track Order</Link>
          )}

          {isAdmin && (
            <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>Admin</Link>
          )}

          <div className="nav-actions">
            {isAuthenticated ? (
              <>
                <span className="user-badge">Welcome, {user?.name}</span>
                <button onClick={handleLogout} className="btn btn-outline">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="nav-link">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
