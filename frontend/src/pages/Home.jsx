import React, { useState, useEffect } from 'react'
import { juicesAPI } from '../api'
import { useCart } from '../contexts/CartContext'
import JuiceCard from '../components/JuiceCard'

const Home = () => {
  const [juices, setJuices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const { cart, addToCart, getTotalItems } = useCart()

  useEffect(() => {
    fetchJuices()
  }, [])

  const fetchJuices = async () => {
    try {
      setLoading(true)
      const params = filter !== 'all' ? { category: filter } : {}
      const response = await juicesAPI.getAll(params)
      setJuices(response.data)
    } catch (err) {
      setError('Failed to fetch juices')
      console.error('Error fetching juices:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJuices()
  }, [filter])


  const categories = [
    { value: 'all', label: 'All Juices' },
    { value: 'fruit', label: 'Fruit Juices' },
    { value: 'vegetable', label: 'Vegetable Juices' },
    { value: 'smoothie', label: 'Smoothies' }
  ]

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="loading">Loading fresh juices...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="error">{error}</div>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div className="text-center mb-4">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#28a745' }}>
          Fresh & Healthy Juices
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
          Order your favorite juices and get them delivered fresh to your doorstep
        </p>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {categories.map(category => (
          <button
            key={category.value}
            onClick={() => setFilter(category.value)}
            className={`btn ${filter === category.value ? 'btn-primary' : 'btn-outline'}`}
            style={{ margin: '0' }}
          >
            {category.label}
          </button>
        ))}
      </div>

      {juices.length === 0 ? (
        <div className="text-center" style={{ padding: '3rem 0' }}>
          <h3>No juices found</h3>
          <p>Try selecting a different category or check back later for new arrivals.</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {juices.map(juice => (
            <JuiceCard
              key={juice._id}
              juice={juice}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      )}

      {cart.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#28a745',
          color: 'white',
          padding: '1rem',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 1000
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🛒</span>
            <span>{getTotalItems()} items in cart</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
