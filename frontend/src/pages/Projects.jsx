import { useState, useEffect } from 'react'
import api from '../utils/api'

const FILTERS = ['All', 'Ongoing', 'Completed']

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/public/projects')
      .then(res => setProjects(res.data))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'All'
    ? projects
    : projects.filter(p => p.status?.toLowerCase() === filter.toLowerCase())

  if (loading) return <div className="section container"><p>Loading...</p></div>

  return (
    <section className="section">
      <div className="container">
        <h1 className="section-title">Projects</h1>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '2rem' }}>
          {FILTERS.map(f => (
            <button
              key={f}
              className={`btn ${filter === f ? 'btn-primary' : ''}`}
              onClick={() => setFilter(f)}
              style={filter !== f ? { background: '#e9ecef', color: '#333' } : {}}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="card-grid">
          {filtered.map(project => (
            <div className="card" key={project.id}>
              {project.image_url && (
                <img src={project.image_url} alt={project.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
              )}
              <div style={{ padding: '1.25rem' }}>
                <h3>{project.title}</h3>
                {project.tags && project.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                    {project.tags.map((tag, idx) => (
                      <span key={idx} style={{
                        background: '#e8f5e9', color: '#2e7d32', padding: '3px 10px',
                        borderRadius: '12px', fontSize: '0.8rem',
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && <p style={{ textAlign: 'center', color: '#888' }}>No projects found.</p>}
      </div>
    </section>
  )
}
