import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import Breadcrumb from '../components/Breadcrumb'

import { getUploadUrl } from '../App'

function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function PersonCard({ person }) {
  const bio = stripHtml(person.bio_html)
  const snippet = bio.length > 120 ? bio.slice(0, 120) + '…' : bio

  return (
    <div style={{
      display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
      padding: '1.25rem', background: 'var(--color-surface)',
      border: '1px solid var(--color-border)', borderRadius: '10px',
    }}>
      <img
        src={getUploadUrl(person.photo_path || '/uploads/people/placeholder.png')}
        alt={person.name}
        style={{ width: '100px', height: '120px', objectFit: 'cover', borderRadius: '8px',
                 flexShrink: 0, border: '2px solid var(--color-border)' }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.2rem' }}>
          {person.name}
        </h3>
        {(person.role || person.designation) && (
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.3rem' }}>
            {person.role || person.designation}
          </p>
        )}
        {person.department && (
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.4rem' }}>
            {person.department}
          </p>
        )}
        {snippet && (
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '0.5rem' }}>
            {snippet}
          </p>
        )}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.82rem' }}>
          {person.personal_website_url && (
            <a href={person.personal_website_url} target="_blank" rel="noopener noreferrer"
               style={{ color: 'var(--color-secondary)' }}>🔗 Website</a>
          )}
          {person.email && (
            <a href={`mailto:${person.email}`} style={{ color: 'var(--color-secondary)' }}>
              ✉ {person.email}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Alumni() {
  const [alumni, setAlumni] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/public/people?category=alumni')
      .then(r => setAlumni(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="section container"><p>Loading...</p></div>

  return (
    <section className="section">
      <div className="container">
        <Breadcrumb items={[
          { label: 'Home', path: '/' },
          { label: 'People', path: '/people' },
          { label: 'Alumni' },
        ]} />

        <h1 className="section-title">Alumni</h1>

        {alumni.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)' }}>No alumni records available.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {alumni.map(p => <PersonCard key={p.id} person={p} />)}
          </div>
        )}
      </div>
    </section>
  )
}
