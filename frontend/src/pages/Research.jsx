import { useState, useEffect } from 'react'
import api from '../utils/api'

export default function Research() {
  const [areas, setAreas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/public/research-areas')
      .then(res => setAreas(res.data))
      .catch(() => setAreas([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="section container"><p>Loading...</p></div>

  return (
    <section className="section">
      <div className="container">
        <h1 className="section-title">Research Areas</h1>

        <div className="card-grid">
          {areas.map(area => (
            <div className="card" key={area.id}>
              <img
                src={area.image_path}
                alt={area.title}
                className="card-image"
              />
              <div className="card-body">
                <h3 style={{ marginBottom: '0.75rem' }}>{area.title}</h3>
                <div
                  className="card-text"
                  dangerouslySetInnerHTML={{ __html: area.description_html }}
                />
              </div>
            </div>
          ))}
        </div>

        {areas.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>No research areas found.</p>
        )}
      </div>
    </section>
  )
}
