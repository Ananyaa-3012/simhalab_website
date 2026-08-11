import { useState, useEffect, useMemo } from 'react'
import api from '../utils/api'

const PAGE_SIZE = 20

export default function Publications() {
  const [publications, setPublications] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [sortKey, setSortKey] = useState('year')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)

  useEffect(() => {
    api.get('/public/publications')
      .then(res => setPublications(res.data.items || []))
      .catch(() => setPublications([]))
      .finally(() => setLoading(false))
  }, [])

  const years = useMemo(() => [...new Set(publications.map(p => p.year).filter(Boolean))].sort((a, b) => b - a), [publications])
  const types = useMemo(() => [...new Set(publications.map(p => p.pub_type).filter(Boolean))].sort(), [publications])

  const filtered = useMemo(() => {
    let result = [...publications]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.authors?.toLowerCase().includes(q) ||
        p.venue?.toLowerCase().includes(q)
      )
    }
    if (yearFilter) result = result.filter(p => String(p.year) === yearFilter)
    if (typeFilter) result = result.filter(p => p.pub_type === typeFilter)

    result.sort((a, b) => {
      const aVal = a[sortKey] || ''
      const bVal = b[sortKey] || ''
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return result
  }, [publications, search, yearFilter, typeFilter, sortKey, sortDir])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  const SortIndicator = ({ col }) => {
    if (sortKey !== col) return null
    return <span>{sortDir === 'asc' ? ' ▲' : ' ▼'}</span>
  }

  if (loading) return <div className="section container"><p>Loading...</p></div>

  return (
    <section className="section">
      <div className="container">
        <h1 className="section-title">Publications</h1>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="Search publications..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            style={{ padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '4px', flex: 1, minWidth: '200px' }}
          />
          <select value={yearFilter} onChange={e => { setYearFilter(e.target.value); setPage(1) }} style={{ padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '4px' }}>
            <option value="">All Years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }} style={{ padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '4px' }}>
            <option value="">All Types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-section-alt)', textAlign: 'left' }}>
                <th style={{ padding: '12px', cursor: 'pointer' }} onClick={() => handleSort('title')}>Title<SortIndicator col="title" /></th>
                <th style={{ padding: '12px', cursor: 'pointer' }} onClick={() => handleSort('authors')}>Authors<SortIndicator col="authors" /></th>
                <th style={{ padding: '12px', cursor: 'pointer' }} onClick={() => handleSort('venue')}>Venue<SortIndicator col="venue" /></th>
                <th style={{ padding: '12px', cursor: 'pointer' }} onClick={() => handleSort('year')}>Year<SortIndicator col="year" /></th>
                <th style={{ padding: '12px', cursor: 'pointer' }} onClick={() => handleSort('pub_type')}>Type<SortIndicator col="pub_type" /></th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(pub => (
                <tr key={pub.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '12px' }}>
                    {pub.doi_url ? <a href={pub.doi_url} target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc' }}>{pub.title}</a> : pub.title}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--color-text-secondary)' }}>{pub.authors}</td>
                  <td style={{ padding: '12px', color: 'var(--color-text-secondary)' }}>{pub.venue}</td>
                  <td style={{ padding: '12px' }}>{pub.year}</td>
                  <td style={{ padding: '12px' }}>{pub.pub_type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--color-text-secondary)' }}>No publications found.</p>}

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            <button className="btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
            <span style={{ padding: '8px 12px' }}>Page {page} of {totalPages}</span>
            <button className="btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        )}
      </div>
    </section>
  )
}
