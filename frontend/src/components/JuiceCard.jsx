import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import getImageUrl from '../utils/image'
import SmartImage from './SmartImage'
import { formatINR } from '../utils/format'

const JuiceCard = ({ juice, onAddToCart }) => {
  const [added, setAdded] = useState(false)

  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    onAddToCart(juice)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleCardClick = (e) => {
    // prevent navigating when Add-to-Cart button was clicked
    const tag = e.target.tagName.toLowerCase()
    if (tag === 'button' || e.target.closest('button')) return
    // navigate to juice detail
    navigate(`/juice/${juice._id}`)
  }

  // use getImageUrl helper from utils

  return (
    <div
      className="card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') handleCardClick(e) }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        backgroundColor: 'white'
      }}
    >
      {/* Image Section */}
      <div style={{ 
        position: 'relative', 
        height: '0',
        paddingTop: '56%', /* 16:9-ish aspect ratio but flexible */
        width: '100%',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <SmartImage
            src={juice.image}
            alt={juice.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              backgroundColor: '#f8f9fa'
            }}
          />
        </div>
        {!juice.availability && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            backgroundColor: '#dc3545',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 'bold'
          }}>
            Out of Stock
          </div>
        )}
      </div>
      
      {/* Content Section */}
      <div style={{ 
        padding: '1rem', 
        display: 'flex', 
        flexDirection: 'column', 
        flex: '1',
        justifyContent: 'space-between'
      }}>
        {/* Title and Category */}
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '0.5rem'
          }}>
            <h3 style={{ 
              margin: 0,
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#2c3e50',
              lineHeight: '1.3',
              flex: 1
            }}>
              {juice.name}
            </h3>
            <span style={{
              fontSize: '0.7rem',
              color: '#28a745',
              textTransform: 'capitalize',
              backgroundColor: '#e8f5e8',
              padding: '4px 8px',
              borderRadius: '12px',
              fontWeight: '500',
              marginLeft: '0.5rem'
            }}>
              {juice.category}
            </span>
          </div>
          
          <p style={{
            color: '#666',
            fontSize: '0.85rem',
            lineHeight: '1.4',
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {juice.description}
          </p>
        </div>

        {/* Price and Ingredients */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <span style={{
              fontSize: '1.4rem',
              fontWeight: 'bold',
              color: '#28a745'
            }}>
              {formatINR(juice.price)}
            </span>
          </div>
          
          {/* Ingredients */}
          {juice.ingredients && juice.ingredients.length > 0 && (
            <div>
              <p style={{
                fontSize: '0.75rem',
                color: '#666',
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Ingredients:
              </p>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px'
              }}>
                {juice.ingredients.slice(0, 3).map((ingredient, index) => (
                  <span
                    key={index}
                    style={{
                      fontSize: '0.7rem',
                      backgroundColor: '#f8f9fa',
                      padding: '3px 6px',
                      borderRadius: '8px',
                      color: '#495057',
                      fontWeight: '500'
                    }}
                  >
                    {ingredient}
                  </span>
                ))}
                {juice.ingredients.length > 3 && (
                  <span style={{
                    fontSize: '0.7rem',
                    color: '#666',
                    fontStyle: 'italic'
                  }}>
                    +{juice.ingredients.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!juice.availability}
          className={`btn ${juice.availability ? (added ? 'btn-success' : 'btn-primary') : 'btn-secondary'}`}
          style={{
            width: '100%',
            padding: '0.6rem',
            fontSize: '0.9rem',
            fontWeight: '600',
            borderRadius: '6px',
            border: 'none',
            opacity: juice.availability ? 1 : 0.6,
            cursor: juice.availability ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            marginTop: 'auto'
          }}
          onMouseEnter={(e) => {
            if (juice.availability && !added) {
              e.target.style.transform = 'translateY(-1px)'
              e.target.style.boxShadow = '0 3px 8px rgba(40, 167, 69, 0.3)'
            }
          }}
          onMouseLeave={(e) => {
            if (juice.availability && !added) {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = 'none'
            }
          }}
        >
          {juice.availability ? (added ? '✓ Added!' : 'Add to Cart') : 'Out of Stock'}
        </button>
      </div>
    </div>
  )
}

export default JuiceCard