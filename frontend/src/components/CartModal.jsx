import React from 'react'
import { useCart } from '../contexts/CartContext'
import { formatINR } from '../utils/format'

const CartModal = ({ onClose }) => {
  const { cart, updateQuantity, removeFromCart, getTotalPrice } = useCart()

  return (
    <div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 2000 }}>
      <div style={{ position: 'absolute', right: '20px', top: '20px', width: '360px', maxHeight: '80vh', overflowY: 'auto', background: '#fff', padding: '1rem', borderRadius: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h3 style={{ margin: 0 }}>Your Cart</h3>
          <button onClick={onClose} className="btn btn-outline">Close</button>
        </div>

        {cart.length === 0 ? (
          <div style={{ padding: '1rem 0' }}>Your cart is empty</div>
        ) : (
          <div>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f1f1f1' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600' }}>{item.name}</div>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>{formatINR(item.price)}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="btn btn-outline">-</button>
                  <div style={{ minWidth: 28, textAlign: 'center' }}>{item.quantity}</div>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="btn btn-outline">+</button>
                </div>
                <div style={{ marginLeft: '0.5rem', textAlign: 'right' }}>
                  <div style={{ fontWeight: '600' }}>{formatINR(item.price * item.quantity)}</div>
                  <button onClick={() => removeFromCart(item.id)} className="btn btn-link" style={{ color: '#dc3545' }}>Remove</button>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', fontWeight: '700' }}>
              <div>Total</div>
              <div>{formatINR(getTotalPrice())}</div>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { window.location.href = '/cart' }}>Go to Checkout</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CartModal
