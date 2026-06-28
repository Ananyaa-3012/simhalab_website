import { useState, useEffect } from 'react'
import api from '../utils/api'
import StaticFlowchart from '../components/StaticFlowchart'

export default function Resources() {
  const [flowcharts, setFlowcharts] = useState([])
  const [activeTab, setActiveTab] = useState(0)
  const [links, setLinks] = useState([])
  const [downloads, setDownloads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/public/flowcharts').then(r => setFlowcharts(r.data || [])).catch(() => {}),
      api.get('/public/links').then(r => setLinks(r.data || [])).catch(() => {}),
      api.get('/public/downloads').then(r => setDownloads(r.data || [])).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="section container"><p>Loading...</p></div>

  const currentFlowchart = flowcharts[activeTab]

  const CATEGORY_LABELS = {
    dataset: 'Dataset', code: 'Code', paper: 'Paper', other: 'Other',
  }

  return (
    <section className="section">
      <div className="container">
        <h1 className="section-title">Resources</h1>

        {/* Pathways to IITM */}
        {flowcharts.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-text)',
              marginBottom: '1rem', paddingBottom: '0.4rem',
              borderBottom: '2px solid var(--color-primary)',
            }}>
              Pathways to IITM
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
              Explore the various pathways to join SIMHA Lab at IIT Madras.
            </p>

            {flowcharts.length > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {flowcharts.map((fc, idx) => (
                  <button
                    key={fc.id || idx}
                    className={`btn ${activeTab === idx ? 'btn-primary' : ''}`}
                    onClick={() => setActiveTab(idx)}
                    style={activeTab !== idx ? {
                      background: 'var(--color-surface)', color: 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                    } : {}}
                  >
                    {fc.title}
                  </button>
                ))}
              </div>
            )}

            {currentFlowchart && (
              <div style={{
                border: '1px solid var(--color-border)', borderRadius: '12px',
                padding: '1.5rem', background: 'var(--color-surface)', overflow: 'hidden',
              }}>
                <StaticFlowchart nodes={currentFlowchart.nodes} edges={currentFlowchart.edges} />
              </div>
            )}
          </div>
        )}

        {/* Useful Links */}
        {links.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-text)',
              marginBottom: '1.25rem', paddingBottom: '0.4rem',
              borderBottom: '2px solid var(--color-primary)',
            }}>
              Useful Links
            </h2>
            <div className="card-grid">
              {links.map(link => (
                <div className="card" key={link.id} style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--color-text)' }}>{link.title}</h3>
                    {link.category && (
                      <span style={{
                        fontSize: '0.7rem', background: 'var(--color-section-alt)',
                        color: 'var(--color-text-secondary)', padding: '0.15rem 0.5rem',
                        borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600,
                      }}>
                        {link.category}
                      </span>
                    )}
                  </div>
                  {link.description && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
                      {link.description}
                    </p>
                  )}
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ marginTop: '1rem', display: 'inline-block', fontSize: '0.85rem', padding: '0.4rem 1rem' }}
                  >
                    Visit →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Downloads */}
        {downloads.length > 0 && (
          <div>
            <h2 style={{
              fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-text)',
              marginBottom: '1.25rem', paddingBottom: '0.4rem',
              borderBottom: '2px solid var(--color-primary)',
            }}>
              Downloads
            </h2>
            <div className="card-grid">
              {downloads.map(dl => (
                <div className="card" key={dl.id} style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--color-text)' }}>{dl.title}</h3>
                    <span style={{
                      fontSize: '0.7rem', background: 'var(--color-primary)', color: '#000',
                      padding: '0.15rem 0.5rem', borderRadius: '4px',
                      textTransform: 'uppercase', fontWeight: 700,
                    }}>
                      {CATEGORY_LABELS[dl.category] || dl.category}
                    </span>
                  </div>
                  {dl.description && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
                      {dl.description}
                    </p>
                  )}
                  <a
                    href={dl.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ marginTop: '1rem', display: 'inline-block', fontSize: '0.85rem', padding: '0.4rem 1rem' }}
                  >
                    Download ↓
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {flowcharts.length === 0 && links.length === 0 && downloads.length === 0 && (
          <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '3rem 0' }}>
            No resources available at this time.
          </p>
        )}
      </div>
    </section>
  )
}
