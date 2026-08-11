import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import SimhaLogo from '../components/SimhaLogo'

export default function AdminLogin() {
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleGoogleLogin = async () => {
    try {
      const res = await api.get('/auth/login')
      window.location.href = res.data.auth_url
    } catch {
      setError('Google SSO login failed. Please check backend OAuth configuration.')
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <SimhaLogo variant="logo" style={{ height: '48px', width: 'auto' }} />
          </div>
          <h1 style={styles.title}>SIMHA Admin</h1>
        <p style={styles.subtitle}>Secure Intelligent Models and Hardware Architecture</p>

        {error && <div style={styles.error}>{error}</div>}

        <button onClick={handleGoogleLogin} style={styles.googleBtn}>
          Sign in with Google
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0a0a',
    padding: '2rem',
  },
  card: {
    background: '#1e1e1e',
    borderRadius: '16px',
    padding: '3rem',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  },
  title: {
    color: '#40a0d0',
    fontSize: '1.8rem',
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: '2px',
  },
  subtitle: {
    color: '#999',
    fontSize: '0.8rem',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  error: {
    background: '#ff4444',
    color: '#fff',
    padding: '0.75rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontSize: '0.85rem',
    textAlign: 'center',
  },
  googleBtn: {
    width: '100%',
    padding: '0.75rem',
    background: '#4285f4',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '1rem',
  },
  divider: {
    textAlign: 'center',
    color: '#666',
    fontSize: '0.8rem',
    margin: '1.5rem 0',
    position: 'relative',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
    marginBottom: '0.75rem',
    outline: 'none',
  },
  submitBtn: {
    width: '100%',
    padding: '0.75rem',
    background: '#40a0d0',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
}
