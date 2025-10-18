import React, { useState, useEffect } from 'react'
import { ordersAPI } from '../api'
import { useAuth } from '../contexts/AuthContext'
import '../pages/track.css'
import { formatINR } from '../utils/format'
import getImageUrl from '../utils/image'

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState(null)
  const [allOrders, setAllOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      setEmail(user.email)
      fetchUserOrders()
    }
  }, [isAuthenticated, user])

  const fetchUserOrders = async () => {
    if (!user?.email) return
    
    try {
      setLoading(true)
      const response = await ordersAPI.getAll({
        customerEmail: user.email
      })
      setAllOrders(response.data)
    } catch (err) {
      console.error('Error fetching user orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTrackOrder = async (e) => {
    e.preventDefault()
    
    if (!orderId.trim() || !email.trim()) {
      setError('Please enter both order ID and email')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await ordersAPI.getAll({
        customerEmail: email
      })
      
      const foundOrder = response.data.find(o => o._id === orderId)
      
      if (foundOrder) {
        setOrder(foundOrder)
      } else {
        setError('Order not found. Please check your order ID and email.')
      }
    } catch (err) {
      setError('Failed to track order. Please try again.')
      console.error('Error tracking order:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      confirmed: '#17a2b8',
      preparing: '#fd7e14',
      ready: '#28a745',
      delivered: '#6c757d',
      cancelled: '#dc3545'
    }
    return colors[status] || '#6c757d'
  }

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      confirmed: '✅',
      preparing: '👨‍🍳',
      ready: '📦',
      delivered: '🚚',
      cancelled: '❌'
    }
    return icons[status] || '❓'
  }

  const getStatusText = (status) => {
    const texts = {
      pending: 'Order Pending',
      confirmed: 'Order Confirmed',
      preparing: 'Preparing Your Order',
      ready: 'Ready for Pickup/Delivery',
      delivered: 'Delivered',
      cancelled: 'Order Cancelled'
    }
    return texts[status] || status
  }

  const getStatusProgress = (status) => {
    const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered']
    const currentIndex = statuses.indexOf(status)
    return currentIndex >= 0 ? currentIndex + 1 : 0
  }

  const getStatusDescription = (status) => {
    const descriptions = {
      pending: 'Your order has been received and is being processed.',
      confirmed: 'Your order has been confirmed and will be prepared soon.',
      preparing: 'Our team is preparing your fresh juices right now.',
      ready: 'Your order is ready for pickup or delivery.',
      delivered: 'Your order has been successfully delivered.',
      cancelled: 'This order has been cancelled.'
    }
    return descriptions[status] || 'Status unknown.'
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div className="text-center mb-4">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#28a745' }}>
          Track Your Order
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#666' }}>
          {isAuthenticated ? 'View your order history and track current orders' : 'Enter your order ID and email to track your order status'}
        </p>
      </div>

      {/* Order History for Logged-in Users */}
      {isAuthenticated && (
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, color: '#2c3e50' }}>Your Order History</h2>
            <button
              onClick={fetchUserOrders}
              disabled={loading}
              className="btn btn-outline"
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
            >
              {loading ? 'Refreshing...' : '🔄 Refresh'}
            </button>
          </div>
          {allOrders.length > 0 ? (
            <div className="grid grid-2">
              {allOrders.map((orderItem) => (
                <div key={orderItem._id} className="card" style={{ padding: '1.5rem', cursor: 'pointer' }} onClick={() => setOrder(orderItem)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Order #{orderItem._id.slice(-8)}</h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.4rem 0.8rem',
                      backgroundColor: getStatusColor(orderItem.status),
                      color: 'white',
                      borderRadius: '15px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      <span>{getStatusIcon(orderItem.status)}</span>
                      <span>{getStatusText(orderItem.status)}</span>
                    </div>
                  </div>
                  <p style={{ color: '#666', marginBottom: '0.5rem' }}>
                    <strong>Date:</strong> {new Date(orderItem.createdAt).toLocaleDateString()}
                  </p>
                  <p style={{ color: '#666', marginBottom: '0.5rem' }}>
                    <strong>Total:</strong> {formatINR(orderItem.totalAmount)}
                  </p>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>
                    <strong>Items:</strong> {orderItem.items.length} item{orderItem.items.length !== 1 ? 's' : ''}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <h3 style={{ color: '#666', marginBottom: '1rem' }}>No Orders Yet</h3>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                You haven't placed any orders yet. Start shopping to see your order history here!
              </p>
              <a href="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                Start Shopping
              </a>
            </div>
          )}
        </div>
      )}


      {/* Order Tracking Form removed as requested */}
      {/* If you want to re-enable tracking in future, move logic to a separate component and import it here. */}
    </div>
  )
}

export default TrackOrder
