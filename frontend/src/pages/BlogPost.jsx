import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import DOMPurify from 'dompurify'
import api from '../utils/api'

export default function BlogPost() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/public/blog/${slug}`)
      .then(res => setPost(res.data))
      .catch(() => setPost(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="section container"><p>Loading...</p></div>
  if (!post) return <div className="section container"><p>Blog post not found.</p></div>

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: '800px' }}>
        <Link to="/blog" style={{ color: '#0066cc', marginBottom: '1rem', display: 'inline-block' }}>&larr; Back to Blog</Link>

        {post.cover_image && (
          <img src={post.cover_image} alt={post.title} style={{ width: '100%', borderRadius: '8px', marginTop: '1rem', marginBottom: '1.5rem' }} />
        )}

        <h1 style={{ marginBottom: '0.5rem' }}>{post.title}</h1>
        <p style={{ color: '#888', marginBottom: '2rem' }}>
          {post.author && <span>By {post.author} | </span>}
          {post.date}
        </p>

        <div
          style={{ lineHeight: 1.8, fontSize: '1.05rem' }}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
        />
      </div>
    </section>
  )
}
