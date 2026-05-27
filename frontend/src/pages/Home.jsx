import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'

export default function Home() {
  const [carousel, setCarousel] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [labHead, setLabHead] = useState(null)
  const [researchAreas, setResearchAreas] = useState([])
  const [news, setNews] = useState([])
  const [sponsors, setSponsors] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    api.get('/public/carousel').then(res => setCarousel(res.data)).catch(() => {})
    api.get('/public/announcements').then(res => setAnnouncements(res.data)).catch(() => {})
    api.get('/public/lab-head').then(res => setLabHead(res.data)).catch(() => {})
    api.get('/public/research-areas').then(res => setResearchAreas(res.data)).catch(() => {})
    api.get('/public/news').then(res => {
      const items = res.data.items || res.data
      setNews(Array.isArray(items) ? items : [])
    }).catch(() => {})
    api.get('/public/sponsors').then(res => setSponsors(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (carousel.length === 0) return
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % carousel.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [carousel.length])

  const goToSlide = useCallback((index) => setCurrentSlide(index), [])

  return (
    <div>
      {/* Hero Carousel */}
      {carousel.length > 0 && (
        <section className="hero-carousel">
          {carousel.map((slide, idx) => (
            <div
              key={slide.id || idx}
              className={`carousel-slide ${idx === currentSlide ? 'active' : ''}`}
            >
              <div
                className="carousel-bg"
                style={{ backgroundImage: `url(${slide.image_path})` }}
              />
              <div className="carousel-overlay" />
              <div className="carousel-content">
                <h1>{slide.title}</h1>
                {slide.subtitle && <p>{slide.subtitle}</p>}
                {slide.cta_text && slide.cta_link && (
                  <Link to={slide.cta_link} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                    {slide.cta_text}
                  </Link>
                )}
              </div>
            </div>
          ))}
          <div className="carousel-dots">
            {carousel.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`carousel-dot ${idx === currentSlide ? 'active' : ''}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Announcement Banner - Marquee */}
      {announcements.length > 0 && (
        <div className="announcement-banner">
          <div className="marquee-track">
            <div className="marquee-content">
              {announcements.map((a, idx) => (
                <span key={a.id || idx}>
                  <strong>{a.title}</strong>
                  {a.description && ` — ${a.description}`}
                  {a.link_url && (
                    <a href={a.link_url} target="_blank" rel="noopener noreferrer">
                      {a.link_text || 'Learn More'}
                    </a>
                  )}
                  {idx < announcements.length - 1 && <span className="announcement-separator">|</span>}
                </span>
              ))}
            </div>
            <div className="marquee-content" aria-hidden="true">
              {announcements.map((a, idx) => (
                <span key={`dup-${a.id || idx}`}>
                  <strong>{a.title}</strong>
                  {a.description && ` — ${a.description}`}
                  {a.link_url && (
                    <a href={a.link_url} target="_blank" rel="noopener noreferrer">
                      {a.link_text || 'Learn More'}
                    </a>
                  )}
                  {idx < announcements.length - 1 && <span className="announcement-separator">|</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Message from the Lab Head */}
      {labHead && (
        <section className="section">
          <div className="container">
            <h2 className="section-title">Message from the Professor</h2>
            <div className="lab-head-section">
              <img
                src={labHead.photo_path}
                alt={labHead.name}
                className="lab-head-photo"
              />
              <div className="lab-head-content">
                <div dangerouslySetInnerHTML={{ __html: labHead.message_html }} />
                <p className="lab-head-name">— {labHead.name}</p>
                <p className="lab-head-title">{labHead.title}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Research Highlights */}
      {researchAreas.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <h2 className="section-title">Research Highlights</h2>
            <div className="card-grid">
              {researchAreas.slice(0, 4).map(area => (
                <div className="card" key={area.id}>
                  <img src={area.image_path} alt={area.title} className="card-image" />
                  <div className="card-body">
                    <h3>{area.title}</h3>
                    <p className="card-text">{area.description_html?.replace(/<[^>]*>/g, '').slice(0, 150)}...</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link to="/research" className="btn btn-primary">View All Research</Link>
            </div>
          </div>
        </section>
      )}

      {/* Recent News */}
      {news.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="section-title">Recent News</h2>
            <div className="card-grid">
              {news.slice(0, 6).map(item => (
                <div className="card" key={item.id}>
                  {item.image_path && (
                    <img src={item.image_path} alt={item.title} className="card-image" />
                  )}
                  <div className="card-body">
                    <h4>{item.title}</h4>
                    <p className="card-date">{item.published_date}</p>
                    <p className="card-text">{item.summary}</p>
                    {item.source_name && (
                      <p className="card-source">Source: {item.source_name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link to="/news-events" className="btn btn-outline">View All News</Link>
            </div>
          </div>
        </section>
      )}

      {/* Sponsors Logo Section */}
      {sponsors.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <h2 className="section-title">Our Sponsors & Collaborators</h2>
            <div className="sponsors-grid">
              {sponsors.map(s => (
                <a
                  key={s.id}
                  href={s.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sponsor-item"
                >
                  <img src={s.logo_path} alt={s.name} />
                  <span>{s.name}</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
