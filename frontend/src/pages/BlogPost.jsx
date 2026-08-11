import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../utils/api'
import Breadcrumb from '../components/Breadcrumb'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function imgSrc(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${API_BASE}${path}`
}

export default function BlogPost() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/public/blog/${slug}`)
      .then(r => setPost(r.data))
      .catch(() => setPost(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="section container"><p>Loading...</p></div>
  if (!post) return <div className="section container"><p>Blog post not found.</p></div>

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: '800px' }}>
        <Breadcrumb items={[
          { label: 'Home', path: '/' },
          { label: 'Blog', path: '/blog' },
          { label: post.title },
        ]} />

        {post.cover_image_path && (
          <img
            src={imgSrc(post.cover_image_path)}
            alt={post.title}
            style={{ width: '100%', borderRadius: '10px', marginBottom: '1.5rem',
                     maxHeight: '360px', objectFit: 'cover' }}
          />
        )}

        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
          {post.title}
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          {post.published_date}
        </p>

        <div
          style={{ lineHeight: 1.85, fontSize: '1.02rem', color: 'var(--color-text)' }}
          dangerouslySetInnerHTML={{ __html: post.content_html || '' }}
        />
      </div>
    </section>
  )
}
