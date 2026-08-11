import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'

import { getUploadUrl } from '../App'

function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

const CATEGORY_ORDER = [
  { key: 'faculty', label: 'Faculty' },
  { key: 'postdoc', label: 'Post Doctorate' },
  { key: 'phd', label: 'PhD Scholars' },
  { key: 'postgraduate', label: 'Post Graduate' },
  { key: 'undergraduate', label: 'Undergraduate' },
  { key: 'postbacc', label: 'Post Baccalaureate' },
  { key: 'interns', label: 'Interns' },
  { key: 'staff', label: 'Staff' },
  { key: 'alumni', label: 'Alumni' },
]

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

export default function People() {
  const [allPeople, setAllPeople] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/public/people')
      .then(r => setAllPeople(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return allPeople
    const q = search.toLowerCase()
    return allPeople.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.role?.toLowerCase().includes(q) ||
      p.department?.toLowerCase().includes(q) ||
      p.designation?.toLowerCase().includes(q)
    )
  }, [allPeople, search])

  const grouped = useMemo(() => {
    const map = {}
    filtered.forEach(p => {
      if (p.category === 'alumni') return
      if (!map[p.category]) map[p.category] = []
      map[p.category].push(p)
    })
    return map
  }, [filtered])

  if (loading) return <div className="section container"><p>Loading...</p></div>

  return (
    <section className="section">
      <div className="container">
        <h1 className="section-title">People</h1>

        {/* Search bar */}
        <div style={{ marginBottom: '2rem', maxWidth: '460px' }}>
          <input
            type="text"
            placeholder="Search by name, role, department…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '0.65rem 1rem',
              border: '1px solid var(--color-border)', borderRadius: '8px',
              background: 'var(--color-surface)', color: 'var(--color-text)',
              fontSize: '0.95rem',
            }}
          />
        </div>

        {CATEGORY_ORDER.map(cat => {
          const people = grouped[cat.key]
          if (!people || people.length === 0) return null
          return (
            <div key={cat.key} style={{ marginBottom: '2.5rem' }}>
              <h2 style={{
                fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text)',
                marginBottom: '1rem', paddingBottom: '0.4rem',
                borderBottom: '2px solid var(--color-primary)',
              }}>
                {cat.label}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {people.map(p => <PersonCard key={p.id} person={p} />)}
              </div>
            </div>
          )
        })}

        {/* Alumni link */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link to="/people/alumni" className="btn btn-outline">
            View Alumni →
          </Link>
        </div>
      </div>
    </section>
  )
}
