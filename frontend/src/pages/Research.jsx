import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

import { getUploadUrl } from '../App'

function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export default function Research() {
  const [areas, setAreas] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/public/research-areas')
      .then(r => setAreas(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="section container"><p>Loading...</p></div>

  return (
    <section className="section">
      <div className="container">
        <h1 className="section-title">Research</h1>

        {areas.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)' }}>No research areas available.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {areas.map(area => {
              const desc = stripHtml(area.description_html)
              const snippet = desc.length > 200 ? desc.slice(0, 200) + '…' : desc

              return (
                <div
                  key={area.id}
                  onClick={() => navigate(`/research/${area.id}`)}
                  style={{
                    display: 'flex', gap: '1.5rem', alignItems: 'flex-start',
                    padding: '1.25rem', background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)', borderRadius: '12px',
                    cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 6px 20px var(--color-card-shadow)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.transform = 'none'
                  }}
                >
                  {area.image_path && (
                    <img
                      src={getUploadUrl(area.image_path)}
                      alt={area.title}
                      style={{ width: '200px', height: '140px', objectFit: 'cover',
                               borderRadius: '8px', flexShrink: 0 }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                      {area.title}
                    </h2>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                      {snippet}
                    </p>
                    <span style={{ display: 'inline-block', marginTop: '0.75rem',
                                   fontSize: '0.85rem', color: 'var(--color-secondary)', fontWeight: 600 }}>
                      View details →
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
