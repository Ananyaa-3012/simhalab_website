import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import SimhaLogo from '../components/SimhaLogo'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function imgSrc(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${API_BASE}${path}`
}

export default function Home() {
  const [settings, setSettings] = useState({})
  const [about, setAbout] = useState(null)
  const [news, setNews] = useState([])
  const [openings, setOpenings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/public/site-settings').then(r => setSettings(r.data)).catch(() => {}),
      api.get('/public/lab-head').then(r => setAbout(r.data)).catch(() => {}),
      api.get('/public/news?per_page=6').then(r => setNews(r.data.items || r.data || [])).catch(() => {}),
      api.get('/public/openings').then(r => setOpenings(r.data || [])).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  const showAbout = settings.show_about !== '0'
  const showNews = settings.show_news !== '0'
  const showOpenings = settings.show_openings !== '0'
  const groupPhoto = settings.group_photo_path
    ? imgSrc(settings.group_photo_path)
    : imgSrc('/uploads/carousel/placeholder.png')

  if (loading) return <div className="section container"><p>Loading...</p></div>

  return (
    <>
      {/* Group Photo */}
      <div style={{ width: '100%', height: '380px', overflow: 'hidden', background: '#111' }}>
        <img
          src={groupPhoto}
          alt="SIMHA Lab Group Photo"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>

      {/* Full Logo */}
      <section className="section section-alt" style={{ padding: '3rem 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <SimhaLogo variant="full" style={{ height: '200px', width: 'auto' }} />
        </div>
      </section>

      {/* About the Lab */}
      {showAbout && about && (
        <section className="section section-alt">
          <div className="container">
            <h2 className="section-title">About the Lab</h2>
            <div
              style={{ fontSize: '1.05rem', lineHeight: 1.85, color: 'var(--color-text)', maxWidth: '860px' }}
              dangerouslySetInnerHTML={{ __html: about.message_html }}
            />
          </div>
        </section>
      )}

      {/* Recent News */}
      {showNews && news.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="section-title">Recent News</h2>
            <div className="card-grid">
              {news.map(item => (
                <div className="card" key={item.id}>
                  {item.image_path && (
                    <img src={imgSrc(item.image_path)} alt={item.title} className="card-image" />
                  )}
                  <div className="card-body">
                    <h3 style={{ fontSize: '1rem' }}>{item.title}</h3>
                    <p className="card-date">{item.published_date}</p>
                    {item.source_name && <p className="card-source">{item.source_name}</p>}
                    {item.summary && (
                      <p className="card-text" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        {item.summary.length > 120 ? item.summary.slice(0, 120) + '…' : item.summary}
                      </p>
                    )}
                    <a
                      href={item.source_url || 'https://example.com'}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-block', marginTop: '0.75rem', fontSize: '0.85rem',
                               color: 'var(--color-secondary)', fontWeight: 600 }}
                    >
                      Read more →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Openings */}
      {showOpenings && openings.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <h2 className="section-title">Openings</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {openings.map(opening => (
                <div
                  key={opening.id}
                  style={{
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    borderRadius: '12px', padding: '1.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text)' }}>{opening.position_title}</h3>
                    <span style={{
                      background: 'var(--color-primary)', color: 'var(--color-primary-contrast)',
                      padding: '0.2rem 0.75rem', borderRadius: '20px',
                      fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
                    }}>
                      {opening.position_type}
                    </span>
                  </div>
                  {opening.description_html && (
                    <div
                      style={{ marginTop: '0.75rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}
                      dangerouslySetInnerHTML={{ __html: opening.description_html }}
                    />
                  )}
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {opening.deadline && (
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                        Deadline: <strong>{opening.deadline}</strong>
                      </span>
                    )}
                    {opening.apply_url && (
                      <a href={opening.apply_url} target="_blank" rel="noopener noreferrer"
                         className="btn btn-primary" style={{ padding: '0.45rem 1.25rem', fontSize: '0.85rem' }}>
                        Apply / Contact →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
