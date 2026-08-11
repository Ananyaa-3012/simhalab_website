import { useState, useEffect } from 'react'
import api from '../utils/api'

export default function Gallery() {
  const [categories, setCategories] = useState([])
  const [images, setImages] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [lightbox, setLightbox] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/public/gallery-categories').then(res => setCategories(res.data)).catch(() => {}),
      api.get('/public/gallery').then(res => setImages(res.data)).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  const filtered = activeCategory === 'all'
    ? images
    : images.filter(img => img.category === activeCategory || img.category_id === activeCategory)

  if (loading) return <div className="section container"><p>Loading...</p></div>

  return (
    <section className="section">
      <div className="container">
        <h1 className="section-title">Gallery</h1>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
          <button
            className={`btn ${activeCategory === 'all' ? 'btn-primary' : ''}`}
            onClick={() => setActiveCategory('all')}
            style={activeCategory !== 'all' ? { background: '#e9ecef', color: '#333' } : {}}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id || cat.name}
              className={`btn ${activeCategory === (cat.id || cat.name) ? 'btn-primary' : ''}`}
              onClick={() => setActiveCategory(cat.id || cat.name)}
              style={activeCategory !== (cat.id || cat.name) ? { background: '#e9ecef', color: '#333' } : {}}
            >
              {cat.name || cat.title}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {filtered.map(img => (
            <div
              key={img.id}
              style={{ position: 'relative', cursor: 'pointer', borderRadius: '8px', overflow: 'hidden' }}
              onClick={() => setLightbox(img)}
            >
              <img
                src={img.image_url || img.url}
                alt={img.event_name || img.title}
                style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.6)', color: '#fff',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                opacity: 0, transition: 'opacity 0.3s',
                padding: '1rem', textAlign: 'center',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0}
              >
                <p style={{ fontWeight: 600 }}>{img.event_name || img.title}</p>
                {img.date_taken && <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>{img.date_taken}</p>}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && <p style={{ textAlign: 'center', color: '#888' }}>No images found.</p>}

        {/* Lightbox */}
        {lightbox && (
          <div
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 9999, cursor: 'pointer',
            }}
            onClick={() => setLightbox(null)}
          >
            <button
              onClick={() => setLightbox(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#fff', fontSize: '2rem', cursor: 'pointer' }}
            >
              &times;
            </button>
            <img
              src={lightbox.image_url || lightbox.url}
              alt={lightbox.event_name || lightbox.title}
              style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: '4px' }}
            />
            <div style={{ position: 'absolute', bottom: '30px', color: '#fff', textAlign: 'center' }}>
              <p style={{ fontWeight: 600 }}>{lightbox.event_name || lightbox.title}</p>
              {lightbox.date_taken && <p style={{ fontSize: '0.9rem' }}>{lightbox.date_taken}</p>}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
