import { useState, useEffect } from 'react'
import api from '../utils/api'

export default function NewsEvents() {
  const [activeTab, setActiveTab] = useState('news')
  const [news, setNews] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/public/news').then(res => setNews(res.data.items || [])).catch(() => {}),
      api.get('/public/events').then(res => setEvents(res.data.items || [])).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  const items = activeTab === 'news' ? news : events

  if (loading) return <div className="section container"><p>Loading...</p></div>

  return (
    <section className="section">
      <div className="container">
        <h1 className="section-title">News & Events</h1>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '2rem' }}>
          <button
            className={`btn ${activeTab === 'news' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('news')}
            style={activeTab !== 'news' ? { background: 'var(--color-surface)', color: 'var(--color-text)' } : {}}
          >
            News
          </button>
          <button
            className={`btn ${activeTab === 'events' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('events')}
            style={activeTab !== 'events' ? { background: 'var(--color-surface)', color: 'var(--color-text)' } : {}}
          >
            Events
          </button>
        </div>

        <div className="card-grid">
          {items.map(item => (
            <div className="card" key={item.id} style={{ padding: '1.25rem' }}>
              {item.image_path && (
                <img src={item.image_path} alt={item.title} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.75rem' }} />
              )}
              <h3>{item.title}</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{item.published_date}</p>
              <p style={{ marginTop: '0.5rem', color: 'var(--color-text-secondary)' }}>{item.summary || (activeTab === 'events' ? <span dangerouslySetInnerHTML={{ __html: item.description_html }} /> : item.description_html)}</p>
            </div>
          ))}
        </div>

        {items.length === 0 && <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>No {activeTab} found.</p>}
      </div>
    </section>
  )
}
