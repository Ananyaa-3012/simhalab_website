import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="section">
      <div className="container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h1 style={{ fontSize: '6rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.5rem', marginTop: '1rem', color: 'var(--color-text)' }}>
          Page Not Found
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '1rem', maxWidth: '400px', margin: '1rem auto 0' }}>
          This page has moved or no longer exists. Use the navigation above to find what you're looking for.
        </p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '2rem', display: 'inline-block' }}>
          Return to Home
        </Link>
      </div>
    </section>
  )
}
