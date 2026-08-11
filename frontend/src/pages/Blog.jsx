import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

import { getUploadUrl } from '../App'

export default function Blog() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/public/blog')
      .then(r => setPosts(r.data.items || r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="section container"><p>Loading...</p></div>

  return (
    <section className="section">
      <div className="container">
        <h1 className="section-title">Blog</h1>

        {posts.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)' }}>No blog posts available.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {posts.map(post => (
              <div
                key={post.id}
                onClick={() => navigate(`/blog/${post.slug}`)}
                style={{
                  display: 'flex', gap: '1.5rem', alignItems: 'flex-start',
                  padding: '1.25rem', background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)', borderRadius: '12px',
                  cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 6px 20px var(--color-card-shadow)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'none'
                }}
              >
                {post.cover_image_path && (
                  <img
                    src={getUploadUrl(post.cover_image_path)}
                    alt={post.title}
                    style={{ width: '200px', height: '140px', objectFit: 'cover',
                             borderRadius: '8px', flexShrink: 0 }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                    {post.title}
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    {post.author_id && <span>Author ID: {post.author_id} · </span>}
                    {post.published_date}
                  </p>
                  <span style={{ display: 'inline-block', marginTop: '0.75rem',
                                 fontSize: '0.85rem', color: 'var(--color-secondary)', fontWeight: 600 }}>
                    Read more →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
