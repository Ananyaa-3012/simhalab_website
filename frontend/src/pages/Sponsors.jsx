import { useState, useEffect } from 'react'
import api from '../utils/api'

export default function Sponsors() {
  const [sponsors, setSponsors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/public/sponsors')
      .then(res => setSponsors(res.data))
      .catch(() => setSponsors([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="section container"><p>Loading...</p></div>

  return (
    <section className="section">
      <div className="container">
        <h1 className="section-title">Sponsors & Collaborators</h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '2rem',
          alignItems: 'center',
          justifyItems: 'center',
        }}>
          {sponsors.map(sponsor => (
            <div key={sponsor.id} style={{ textAlign: 'center' }}>
              {sponsor.logo_url && (
                <img
                  src={sponsor.logo_url}
                  alt={sponsor.name}
                  style={{ maxWidth: '160px', maxHeight: '100px', objectFit: 'contain', marginBottom: '0.75rem' }}
                />
              )}
              <p style={{ fontWeight: 500, color: '#333' }}>{sponsor.name}</p>
            </div>
          ))}
        </div>

        {sponsors.length === 0 && <p style={{ textAlign: 'center', color: '#888' }}>No sponsors found.</p>}
      </div>
    </section>
  )
}
