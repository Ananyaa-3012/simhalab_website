import { useState, useEffect } from 'react'
import api from '../utils/api'

export default function Links() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/public/links')
      .then(res => setLinks(res.data))
      .catch(() => setLinks([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="section container"><p>Loading...</p></div>

  return (
    <section className="section">
      <div className="container">
        <h1 className="section-title">Useful Links</h1>

        <div className="card-grid">
          {links.map(link => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card"
              style={{ padding: '1.5rem', textDecoration: 'none', color: 'inherit', transition: 'transform 0.2s' }}
            >
              <h3 style={{ color: '#0066cc' }}>{link.title}</h3>
              {link.description && <p style={{ marginTop: '0.5rem', color: '#555' }}>{link.description}</p>}
              <span style={{ marginTop: '0.75rem', display: 'inline-block', color: '#888', fontSize: '0.85rem' }}>
                {link.url} &rarr;
              </span>
            </a>
          ))}
        </div>

        {links.length === 0 && <p style={{ textAlign: 'center', color: '#888' }}>No links available.</p>}
      </div>
    </section>
  )
}
