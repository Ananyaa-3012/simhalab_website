import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../utils/api'
import Breadcrumb from '../components/Breadcrumb'

import { getUploadUrl } from '../App'

function Section({ title, children }) {
  return (
    <div style={{ marginTop: '2.5rem' }}>
      <h2 style={{
        fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text)',
        paddingBottom: '0.4rem', borderBottom: '2px solid var(--color-primary)',
        marginBottom: '1rem',
      }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

export default function ResearchDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    api.get(`/public/research-areas/${id}`)
      .then(r => setData(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="section container"><p>Loading...</p></div>
  if (error || !data) return <div className="section container"><p>Research area not found.</p></div>

  const { area, publications, contact_person } = data

  let links = []
  let media = []
  try { links = JSON.parse(area.links_json || '[]') } catch {}
  try { media = JSON.parse(area.media_json || '[]') } catch {}

  return (
    <section className="section">
      <div className="container">
        <Breadcrumb items={[
          { label: 'Home', path: '/' },
          { label: 'Research', path: '/research' },
          { label: area.title },
        ]} />

        {/* Hero */}
        {area.image_path && (
          <div style={{ width: '100%', height: '280px', overflow: 'hidden', borderRadius: '12px', marginBottom: '2rem' }}>
            <img src={getUploadUrl(area.image_path)} alt={area.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '1rem' }}>
          {area.title}
        </h1>

        {area.description_html && (
          <div
            style={{ fontSize: '1rem', lineHeight: 1.8, color: 'var(--color-text)', maxWidth: '820px' }}
            dangerouslySetInnerHTML={{ __html: area.description_html }}
          />
        )}

        {/* Links */}
        {links.length > 0 && (
          <Section title="Links">
            <ul style={{ paddingLeft: '1.5rem', lineHeight: 2 }}>
              {links.map((lnk, i) => (
                <li key={i}>
                  <a href={lnk.url} target="_blank" rel="noopener noreferrer"
                     style={{ color: 'var(--color-secondary)' }}>
                    {lnk.title}
                  </a>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Media */}
        {media.length > 0 && (
          <Section title="Media">
            <ul style={{ paddingLeft: '1.5rem', lineHeight: 2 }}>
              {media.map((m, i) => (
                <li key={i}>
                  {m.type && (
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase',
                                   background: 'var(--color-border)', padding: '0.1rem 0.4rem',
                                   borderRadius: '4px', marginRight: '0.5rem' }}>
                      {m.type}
                    </span>
                  )}
                  <a href={m.url} target="_blank" rel="noopener noreferrer"
                     style={{ color: 'var(--color-secondary)' }}>
                    {m.title}
                  </a>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Publications */}
        {publications && publications.length > 0 && (
          <Section title="Publications">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: 'var(--color-section-alt)' }}>
                    {['Title', 'Authors', 'Venue', 'Year'].map(h => (
                      <th key={h} style={{
                        textAlign: 'left', padding: '0.75rem 1rem',
                        color: 'var(--color-text-secondary)', fontWeight: 600,
                        borderBottom: '1px solid var(--color-border)',
                        fontSize: '0.8rem', textTransform: 'uppercase',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {publications.map(pub => (
                    <tr key={pub.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text)' }}>
                        {pub.doi_url ? (
                          <a href={pub.doi_url} target="_blank" rel="noopener noreferrer"
                             style={{ color: 'var(--color-secondary)' }}>
                            {pub.title}
                          </a>
                        ) : pub.title}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-secondary)' }}>{pub.authors}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-secondary)' }}>{pub.venue}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-secondary)' }}>{pub.year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {/* Contact */}
        {contact_person && (
          <Section title="Contact">
            <div style={{
              display: 'flex', gap: '1rem', alignItems: 'center',
              padding: '1rem', background: 'var(--color-surface)',
              border: '1px solid var(--color-border)', borderRadius: '8px',
              maxWidth: '480px',
            }}>
              {contact_person.photo_path && (
                <img src={getUploadUrl(contact_person.photo_path)} alt={contact_person.name}
                  style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '50%',
                           border: '2px solid var(--color-border)' }} />
              )}
              <div>
                <p style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.95rem' }}>
                  {contact_person.name}
                </p>
                {contact_person.role && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                    {contact_person.role}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.3rem', fontSize: '0.82rem', flexWrap: 'wrap' }}>
                  {contact_person.email && (
                    <a href={`mailto:${contact_person.email}`} style={{ color: 'var(--color-secondary)' }}>
                      ✉ {contact_person.email}
                    </a>
                  )}
                  {contact_person.personal_website_url && (
                    <a href={contact_person.personal_website_url} target="_blank" rel="noopener noreferrer"
                       style={{ color: 'var(--color-secondary)' }}>
                      🔗 Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          </Section>
        )}
      </div>
    </section>
  )
}
