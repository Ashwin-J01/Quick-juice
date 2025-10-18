import axios from 'axios'

// --- MODIFICATION ---
// This line now automatically switches the URL.
// In development (npm run dev): 'http://localhost:5000/api'
// In production (Vercel build): '/api'
const API_BASE_URL = import.meta.env.PROD 
  ? '/api' 
  : 'http://localhost:5000/api'
// --- END MODIFICATION ---

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Juices API
export const juicesAPI = {
  getAll: (params = {}) => api.get('/juices', { params }),
  getById: (id) => api.get(`/juices/${id}`),
  getOne: (id) => api.get(`/juices/${id}`),
  create: (data) => api.post('/juices', data),
  update: (id, data) => api.put(`/juices/${id}`, data),
  delete: (id) => api.delete(`/juices/${id}`),
}

// Orders API
export const ordersAPI = {
  getAll: (params = {}) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  delete: (id) => api.delete(`/orders/${id}`),
}

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
}

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getJuices: (params = {}) => api.get('/admin/juices', { params }),
  createJuice: (data) => {
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key])
      }
    })
    return api.post('/admin/juices', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  updateJuice: (id, data) => {
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key])
      }
    })
    return api.put(`/admin/juices/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  deleteJuice: (id) => api.delete(`/admin/juices/${id}`),
  getOrders: (params = {}) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
  getCustomers: (params = {}) => api.get('/admin/customers', { params }),
}

// Set up request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Set up response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token')
      // You might also want to clear user from AuthContext here
      window.location.href = '/login' 
    }
    return Promise.reject(error)
  }
)

export default api
