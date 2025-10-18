import React, { useState, useEffect } from 'react'
import '../pages/admin.css'
import { formatINR } from '../utils/format'
import getImageUrl from '../utils/image'
import SmartImage from '../components/SmartImage'
import { adminAPI } from '../api'

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [juices, setJuices] = useState([])
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [loadingData, setLoadingData] = useState(false)
  
  // Juice form states
  const [showJuiceForm, setShowJuiceForm] = useState(false)
  const [editingJuice, setEditingJuice] = useState(null)
  const [juiceForm, setJuiceForm] = useState({
    name: '',
    description: '',
    about: '',
    price: '',
    category: 'fruit',
    ingredients: '',
    tags: '',
    stock: '',
    image: null
  })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getDashboard()
      setDashboardData(response.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchJuices = async () => {
    try {
      setLoadingData(true)
      const response = await adminAPI.getJuices()
      setJuices(response.data.juices)
    } catch (error) {
      console.error('Error fetching juices:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const fetchOrders = async () => {
    try {
      setLoadingData(true)
      const response = await adminAPI.getOrders()
      setOrders(response.data.orders)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      setLoadingData(true)
      const response = await adminAPI.getCustomers()
      setCustomers(response.data.customers)
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const formatINR = (amount) => {
    try {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
    } catch (e) {
      return `₹${amount}`
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (tab === 'juices' && juices.length === 0) {
      fetchJuices()
    } else if (tab === 'orders' && orders.length === 0) {
      fetchOrders()
    } else if (tab === 'customers' && customers.length === 0) {
      fetchCustomers()
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus)
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ))
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  // Juice form handlers
  const handleJuiceFormChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'image') {
      setJuiceForm(prev => ({ ...prev, [name]: files[0] }))
    } else {
      setJuiceForm(prev => ({ ...prev, [name]: value }))
    }
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateJuiceForm = () => {
    const errors = {}
    if (!juiceForm.name.trim()) errors.name = 'Name is required'
    if (!juiceForm.description.trim()) errors.description = 'Description is required'
    if (!juiceForm.about.trim()) errors.about = 'About is required'
    if (!juiceForm.price || isNaN(juiceForm.price) || juiceForm.price <= 0) {
      errors.price = 'Valid price is required'
    }
    if (!juiceForm.stock || isNaN(juiceForm.stock) || juiceForm.stock < 0) {
      errors.stock = 'Valid stock quantity is required'
    }
    if (!editingJuice && !juiceForm.image) {
      errors.image = 'Image is required'
    }
    return errors
  }

  const handleJuiceSubmit = async (e) => {
    e.preventDefault()
    const errors = validateJuiceForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setSubmitting(true)
    try {
      if (editingJuice) {
        const response = await adminAPI.updateJuice(editingJuice._id, juiceForm)
        setJuices(juices.map(juice => 
          juice._id === editingJuice._id ? response.data : juice
        ))
      } else {
        const response = await adminAPI.createJuice(juiceForm)
        setJuices([response.data, ...juices])
      }

      resetJuiceForm()
      setShowJuiceForm(false)
    } catch (error) {
      console.error('Error saving juice:', error)
      if (error.response?.data?.errors) {
        const apiErrors = {}
        error.response.data.errors.forEach(err => {
          apiErrors[err.path] = err.msg
        })
        setFormErrors(apiErrors)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const resetJuiceForm = () => {
    setJuiceForm({
      name: '',
      description: '',
      about: '',
      price: '',
      category: 'fruit',
      ingredients: '',
      tags: '',
      stock: '',
      image: null
    })
    setFormErrors({})
    setEditingJuice(null)
  }

  const handleEditJuice = (juice) => {
    setEditingJuice(juice)
    setJuiceForm({
      name: juice.name,
      description: juice.description,
      about: juice.about,
      price: juice.price,
      category: juice.category,
      ingredients: juice.ingredients?.join(', ') || '',
      tags: juice.tags?.join(', ') || '',
      stock: juice.stock,
      image: null
    })
    setShowJuiceForm(true)
  }

  const handleDeleteJuice = async (juiceId) => {
    if (window.confirm('Are you sure you want to delete this juice?')) {
      try {
        await adminAPI.deleteJuice(juiceId)
        setJuices(juices.filter(juice => juice._id !== juiceId))
      } catch (error) {
        console.error('Error deleting juice:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="loading">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#28a745', marginBottom: '0.5rem' }}>Hello Admin!</h1>
        <p style={{ color: '#666' }}>Manage your QuickJuice business</p>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: '2px solid #e9ecef'
      }}>
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'juices', label: 'Manage Juices' },
          { id: 'orders', label: 'Orders' },
          { id: 'customers', label: 'Customers' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: activeTab === tab.id ? '#28a745' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#666',
              cursor: 'pointer',
              borderRadius: '8px 8px 0 0',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && dashboardData && (
        <div>
          <div className="admin-stats">
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <h3 style={{ color: '#28a745', fontSize: '2rem', marginBottom: '0.5rem' }}>
                {dashboardData.stats.totalOrders}
              </h3>
              <p style={{ color: '#666' }}>Total Orders</p>
            </div>
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <h3 style={{ color: '#28a745', fontSize: '2rem', marginBottom: '0.5rem' }}>
                {formatINR(dashboardData.stats.totalRevenue)}
              </h3>
              <p style={{ color: '#666' }}>Total Revenue</p>
            </div>
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <h3 style={{ color: '#28a745', fontSize: '2rem', marginBottom: '0.5rem' }}>
                {dashboardData.stats.totalCustomers}
              </h3>
              <p style={{ color: '#666' }}>Customers</p>
            </div>
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <h3 style={{ color: '#28a745', fontSize: '2rem', marginBottom: '0.5rem' }}>
                {dashboardData.stats.totalJuices}
              </h3>
              <p style={{ color: '#666' }}>Juice Products</p>
            </div>
          </div>

          <div className="admin-main">
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Recent Orders</h3>
              {dashboardData.recentOrders.map(order => (
                <div key={order._id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  borderBottom: '1px solid #e9ecef'
                }}>
                  <div>
                    <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      {order.customer.name}
                    </p>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>
                      {order.items.length} items - {formatINR(order.totalAmount)}
                    </p>
                  </div>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    backgroundColor: '#e9ecef',
                    color: '#666',
                    fontSize: '0.8rem',
                    textTransform: 'capitalize'
                  }}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Low Stock Alert</h3>
              {dashboardData.lowStockJuices.length === 0 ? (
                <p style={{ color: '#28a745' }}>All products are well stocked!</p>
              ) : (
                dashboardData.lowStockJuices.map(juice => (
                  <div key={juice._id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    borderBottom: '1px solid #e9ecef'
                  }}>
                    <span style={{ fontWeight: 'bold' }}>{juice.name}</span>
                    <span style={{
                      color: '#dc3545',
                      fontWeight: 'bold'
                    }}>
                      {juice.stock} left
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Juices Tab */}
      {activeTab === 'juices' && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2>Manage Juices</h2>
            <button 
              className="btn btn-primary"
              onClick={() => {
                resetJuiceForm()
                setShowJuiceForm(true)
              }}
            >
              Add New Juice
            </button>
          </div>

          {loadingData ? (
            <div className="loading">Loading juices...</div>
          ) : (
            <div className="grid grid-3">
              {juices.map(juice => (
                <div key={juice._id} className="card" style={{ padding: '1rem' }}>
                  <SmartImage
                    src={juice.image}
                    alt={juice.name}
                    style={{
                      width: '100%',
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginBottom: '1rem'
                    }}
                  />
                  <h3 style={{ marginBottom: '0.5rem' }}>{juice.name}</h3>
                  <p style={{ color: '#666', marginBottom: '0.5rem' }}>
                    {formatINR(juice.price)} • Stock: {juice.stock}
                  </p>
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginTop: '1rem'
                  }}>
                    <button 
                      className="btn btn-outline" 
                      style={{ flex: 1 }}
                      onClick={() => handleEditJuice(juice)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      style={{ flex: 1 }}
                      onClick={() => handleDeleteJuice(juice._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          <h2 style={{ marginBottom: '1.5rem' }}>Order Management</h2>
          
          {loadingData ? (
            <div className="loading">Loading orders...</div>
          ) : (
            <div className="grid">
              {orders.map(order => (
                <div key={order._id} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <h3 style={{ marginBottom: '0.5rem' }}>
                        Order #{order._id.slice(-8)}
                      </h3>
                      <p style={{ color: '#666', marginBottom: '0.25rem' }}>
                        {order.customer.name} • {order.customer.email}
                      </p>
                      <p style={{ color: '#666' }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#28a745' }}>
                        {formatINR(order.totalAmount)}
                      </p>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '4px',
                          border: '1px solid #ddd',
                          marginTop: '0.5rem'
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <h4 style={{ marginBottom: '0.5rem' }}>Items:</h4>
                    {order.items.map((item, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0',
                        borderBottom: '1px solid #f8f9fa'
                      }}>
                        <span>{item.juice.name} x {item.quantity}</span>
                        <span>{formatINR(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div>
          <h2 style={{ marginBottom: '1.5rem' }}>Customer Management</h2>
          
          {loadingData ? (
            <div className="loading">Loading customers...</div>
          ) : (
            <div className="grid grid-2">
              {customers.map(customer => (
                <div key={customer._id} className="card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ marginBottom: '0.5rem' }}>{customer.name}</h3>
                  <p style={{ color: '#666', marginBottom: '0.25rem' }}>
                    {customer.email}
                  </p>
                  {customer.phone && (
                    <p style={{ color: '#666', marginBottom: '0.5rem' }}>
                      {customer.phone}
                    </p>
                  )}
                  <p style={{ fontSize: '0.9rem', color: '#999' }}>
                    Joined: {new Date(customer.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Juice Form Modal */}
      {showJuiceForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2>{editingJuice ? 'Edit Juice' : 'Add New Juice'}</h2>
              <button
                onClick={() => setShowJuiceForm(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleJuiceSubmit}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={juiceForm.name}
                    onChange={handleJuiceFormChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${formErrors.name ? '#dc3545' : '#ddd'}`,
                      borderRadius: '4px',
                      fontSize: '1rem'
                    }}
                    placeholder="Enter juice name"
                  />
                  {formErrors.name && (
                    <p style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={juiceForm.description}
                    onChange={handleJuiceFormChange}
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${formErrors.description ? '#dc3545' : '#ddd'}`,
                      borderRadius: '4px',
                      fontSize: '1rem',
                      resize: 'vertical'
                    }}
                    placeholder="Enter juice description"
                  />
                  {formErrors.description && (
                    <p style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      {formErrors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    About *
                  </label>
                  <textarea
                    name="about"
                    value={juiceForm.about}
                    onChange={handleJuiceFormChange}
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${formErrors.about ? '#dc3545' : '#ddd'}`,
                      borderRadius: '4px',
                      fontSize: '1rem',
                      resize: 'vertical'
                    }}
                    placeholder="Enter detailed information about the juice"
                  />
                  {formErrors.about && (
                    <p style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      {formErrors.about}
                    </p>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      Price *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={juiceForm.price}
                      onChange={handleJuiceFormChange}
                      step="0.01"
                      min="0"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${formErrors.price ? '#dc3545' : '#ddd'}`,
                        borderRadius: '4px',
                        fontSize: '1rem'
                      }}
                      placeholder="0.00"
                    />
                    {formErrors.price && (
                      <p style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        {formErrors.price}
                      </p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      Stock *
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={juiceForm.stock}
                      onChange={handleJuiceFormChange}
                      min="0"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${formErrors.stock ? '#dc3545' : '#ddd'}`,
                        borderRadius: '4px',
                        fontSize: '1rem'
                      }}
                      placeholder="0"
                    />
                    {formErrors.stock && (
                      <p style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        {formErrors.stock}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Category
                  </label>
                  <select
                    name="category"
                    value={juiceForm.category}
                    onChange={handleJuiceFormChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="fruit">Fruit</option>
                    <option value="vegetable">Vegetable</option>
                    <option value="smoothie">Smoothie</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Ingredients
                  </label>
                  <input
                    type="text"
                    name="ingredients"
                    value={juiceForm.ingredients}
                    onChange={handleJuiceFormChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '1rem'
                    }}
                    placeholder="Enter ingredients separated by commas"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={juiceForm.tags}
                    onChange={handleJuiceFormChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '1rem'
                    }}
                    placeholder="Enter tags separated by commas"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Image {!editingJuice && '*'}
                  </label>
                  <input
                    type="file"
                    name="image"
                    onChange={handleJuiceFormChange}
                    accept="image/*"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${formErrors.image ? '#dc3545' : '#ddd'}`,
                      borderRadius: '4px',
                      fontSize: '1rem'
                    }}
                  />
                  {formErrors.image && (
                    <p style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      {formErrors.image}
                    </p>
                  )}
                  {editingJuice && juiceForm.image && (
                    <p style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      Leave empty to keep current image
                    </p>
                  )}
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '2rem',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={() => setShowJuiceForm(false)}
                  className="btn btn-outline"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : (editingJuice ? 'Update Juice' : 'Add Juice')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
