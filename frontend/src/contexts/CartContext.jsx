import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([])
  const { isAuthenticated } = useAuth()

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (juice) => {
    // Require user to be authenticated before adding to cart
    if (!isAuthenticated) return

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === juice._id)
      if (existingItem) {
        return prevCart.map(item =>
          item.id === juice._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prevCart, { id: juice._id, ...juice, quantity: 1 }]
    })
  }

  const removeFromCart = (juiceId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== juiceId))
  }

  const updateQuantity = (juiceId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(juiceId)
      return
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === juiceId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}
