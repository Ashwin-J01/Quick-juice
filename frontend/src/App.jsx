import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Cart from './pages/Cart'
import TrackOrder from './pages/TrackOrder'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import AdminRedirect from './components/AdminRedirect'
import JuiceDetail from './pages/JuiceDetail'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={
                  <AdminRedirect>
                    <Home />
                  </AdminRedirect>
                } />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/cart" element={
                  <ProtectedRoute>
                    <AdminRedirect>
                      <Cart />
                    </AdminRedirect>
                  </ProtectedRoute>
                } />
                <Route path="/juice/:id" element={<JuiceDetail />} />
                <Route path="/track" element={
                  <AdminRedirect>
                    <TrackOrder />
                  </AdminRedirect>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
