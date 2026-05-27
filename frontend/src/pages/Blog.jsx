import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'

export default function Blog() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/public/blog')
      .then(res => setPosts(res.data.items || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="section container"><p>Loading...</p></div>

  return (
    <section className="section">
      <div className="container">
        <h1 className="section-title">Blog</h1>

        <div className="card-grid">
          {posts.map(post => (
            <Link to={`/blog/${post.slug}`} key={post.id || post.slug} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
              {post.cover_image_path && (
                <img src={post.cover_image_path} alt={post.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
              )}
              <div style={{ padding: '1.25rem' }}>
                <h3>{post.title}</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{post.published_date}</p>
                <p style={{ marginTop: '0.5rem', color: 'var(--color-text-secondary)' }}>{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>

        {posts.length === 0 && <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>No blog posts found.</p>}
      </div>
    </section>
  )
}
