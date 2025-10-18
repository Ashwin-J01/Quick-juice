import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { juicesAPI } from '../api'
import SmartImage from '../components/SmartImage'
import { formatINR } from '../utils/format'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import CartModal from '../components/CartModal'

const JuiceDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()

  const [juice, setJuice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCart, setShowCart] = useState(false)

  useEffect(() => {
    let mounted = true
    const fetchJuice = async () => {
      try {
        setLoading(true)
        const res = await juicesAPI.getOne(id)
        if (mounted) setJuice(res.data)
      } catch (err) {
        console.error('Failed to fetch juice:', err)
        if (mounted) setError('Failed to load juice')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchJuice()
    return () => { mounted = false }
  }, [id])

  const handleAdd = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    addToCart(juice)
    setShowCart(true)
  }

  if (loading) return <div className="container" style={{ padding: '2rem 0' }}><div className="loading">Loading...</div></div>
  if (error) return <div className="container" style={{ padding: '2rem 0' }}><div className="error">{error}</div></div>
  if (!juice) return <div className="container" style={{ padding: '2rem 0' }}><div className="error">Juice not found</div></div>

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: '0 0 360px' }}>
          <SmartImage src={juice.image} alt={juice.name} style={{ width: '100%', borderRadius: 8 }} />
        </div>

        <div style={{ flex: '1 1 360px' }}>
          <h1 style={{ marginTop: 0, color: '#28a745' }}>{juice.name}</h1>
          <p style={{ color: '#666', fontSize: '1.05rem' }}>{juice.about || juice.description}</p>

          <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: '700', color: '#28a745' }}>{formatINR(juice.price)}</span>
            <span style={{ marginLeft: '1rem', color: '#666' }}>Stock: {juice.stock}</span>
          </div>

          {juice.ingredients && juice.ingredients.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h4>Ingredients</h4>
              <ul>
                {juice.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
              </ul>
            </div>
          )}

          {juice.tags && juice.tags.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h4>Tags</h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {juice.tags.map((t, i) => (
                  <span key={i} style={{ background: '#f8f9fa', padding: '4px 8px', borderRadius: 8 }}>{t}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" onClick={handleAdd}>Add to Cart</button>
            <button className="btn btn-outline" onClick={() => navigate(-1)}>Back</button>
          </div>
        </div>
      </div>

      {showCart && <CartModal onClose={() => setShowCart(false)} />}
    </div>
  )
}

export default JuiceDetail
