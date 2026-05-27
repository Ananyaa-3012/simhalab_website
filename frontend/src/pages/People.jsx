import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'

const CATEGORIES = [
  { key: 'faculty', label: 'Faculty' },
  { key: 'project_associate', label: 'Project Associates' },
  { key: 'postdoc', label: 'Post Doctorate' },
  { key: 'phd', label: 'PhD Scholars' },
  { key: 'pg', label: 'PG Students' },
  { key: 'ug', label: 'UG Students' },
  { key: 'alumni', label: 'Alumni' },
]

export default function People() {
  const [activeTab, setActiveTab] = useState('faculty')
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get(`/public/people?category=${activeTab}`)
      .then(res => setPeople(res.data))
      .catch(() => setPeople([]))
      .finally(() => setLoading(false))
  }, [activeTab])

  return (
    <section className="section">
      <div className="container">
        <h1 className="section-title">People</h1>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              className={`btn ${activeTab === cat.key ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab(cat.key)}
              style={activeTab !== cat.key ? { background: 'var(--color-surface)', color: 'var(--color-text)' } : {}}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ textAlign: 'center' }}>Loading...</p>
        ) : (
          <div className="card-grid">
            {people.map(person => (
              <div className="card" key={person.id} style={{ textAlign: 'center', padding: '1.5rem' }}>
                <img
                  src={person.photo_path || '/uploads/people/placeholder.png'}
                  alt={person.name}
                  style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1rem' }}
                />
                <h3 style={{ marginBottom: '0.25rem' }}>{person.name}</h3>
                {person.designation && <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{person.designation}</p>}
                {person.department && <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{person.department}</p>}
                <Link to={`/people/${person.id}`} className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        )}

        {!loading && people.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>No people found in this category.</p>
        )}
      </div>
    </section>
  )
}
