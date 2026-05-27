import { useState, useEffect } from 'react'
import api from '../utils/api'

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/public/testimonials')
      .then(res => setTestimonials(res.data))
      .catch(() => setTestimonials([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="section container"><p>Loading...</p></div>

  return (
    <section className="section">
      <div className="container">
        <h1 className="section-title">Testimonials</h1>

        <div className="card-grid">
          {testimonials.map(t => (
            <div className="card" key={t.id} style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '2rem', color: '#ddd', lineHeight: 1 }}>&ldquo;</div>
              <p style={{ fontStyle: 'italic', color: '#444', lineHeight: 1.7, marginTop: '0.5rem' }}>
                {t.quote || t.content}
              </p>
              <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {t.photo_url && (
                  <img src={t.photo_url} alt={t.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                )}
                <div>
                  <p style={{ fontWeight: 600 }}>{t.name}</p>
                  {(t.designation || t.role) && <p style={{ color: '#888', fontSize: '0.85rem' }}>{t.designation || t.role}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {testimonials.length === 0 && <p style={{ textAlign: 'center', color: '#888' }}>No testimonials found.</p>}
      </div>
    </section>
  )
}
