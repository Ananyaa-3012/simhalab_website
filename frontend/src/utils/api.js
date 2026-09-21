import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true
      try {
        await api.post('/auth/refresh')
        return api(error.config)
      } catch {
        window.location.href = '/admin'
      }
    }
    return Promise.reject(error)
  }
)

export default api