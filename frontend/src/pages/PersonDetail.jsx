import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../utils/api'

export default function PersonDetail() {
  const { id } = useParams()
  const [person, setPerson] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/public/people/${id}`)
      .then(res => setPerson(res.data))
      .catch(() => setPerson(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="section container"><p>Loading...</p></div>
  if (!person) return <div className="section container"><p>Person not found.</p></div>

  return (
    <section className="section">
      <div className="container">
        <Link to="/people" style={{ color: '#0066cc', marginBottom: '1rem', display: 'inline-block' }}>&larr; Back to People</Link>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <div>
            <img
              src={person.photo_url || '/placeholder-avatar.png'}
              alt={person.name}
              style={{ width: '250px', height: '250px', borderRadius: '8px', objectFit: 'cover' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h1 style={{ marginBottom: '0.5rem' }}>{person.name}</h1>
            {person.designation && <p style={{ color: '#666', fontSize: '1.1rem' }}>{person.designation}</p>}
            {person.department && <p style={{ color: '#888' }}>{person.department}</p>}

            {person.bio && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3>About</h3>
                <p style={{ lineHeight: 1.7, marginTop: '0.5rem' }}>{person.bio}</p>
              </div>
            )}

            {person.research_interests && person.research_interests.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3>Research Interests</h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {person.research_interests.map((interest, idx) => (
                    <span key={idx} style={{
                      background: '#e3f2fd', color: '#1565c0', padding: '4px 12px',
                      borderRadius: '20px', fontSize: '0.85rem',
                    }}>
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {person.links && Object.keys(person.links).length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3>Links</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {Object.entries(person.links).map(([key, url]) => (
                    <a key={key} href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc', textTransform: 'capitalize' }}>
                      {key}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {person.publications && person.publications.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <h2 className="section-title">Publications</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {person.publications.map((pub, idx) => (
                <li key={idx} style={{ padding: '1rem 0', borderBottom: '1px solid #eee' }}>
                  <strong>{pub.title}</strong>
                  <p style={{ color: '#666', marginTop: '0.25rem' }}>
                    {pub.authors} {pub.venue && `— ${pub.venue}`} {pub.year && `(${pub.year})`}
                  </p>
                  {pub.url && <a href={pub.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc', fontSize: '0.85rem' }}>View Paper</a>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
