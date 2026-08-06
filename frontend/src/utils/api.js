import axios from 'axios'

// Set ngrok URL dynamically from env or fallback to your current ngrok forwarding URL
const NGROK_URL = import.meta.env.VITE_API_URL || 'https://<your-ngrok-subdomain>.ngrok-free.app'

const api = axios.create({
  baseURL: `${NGROK_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true' // Bypasses ngrok free tier landing page
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
        // Updated redirect to preserve React Router basename on GitHub Pages
        const basename = import.meta.env.BASE_URL || '/simhalab_website/'
        window.location.href = `${basename}admin`
      }
    }
    return Promise.reject(error)
  }
)

export default api