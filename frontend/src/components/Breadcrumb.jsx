import { Link } from 'react-router-dom'

export default function Breadcrumb({ items }) {
  return (
    <nav aria-label="breadcrumb" style={{
      fontSize: '0.82rem',
      color: 'var(--color-text-secondary)',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '0.25rem',
    }}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1
        return (
          <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {idx > 0 && <span style={{ opacity: 0.5 }}>›</span>}
            {isLast ? (
              <span style={{ color: 'var(--color-text)' }}>{item.label}</span>
            ) : (
              <Link to={item.path} style={{ color: 'var(--color-secondary)', textDecoration: 'none' }}>
                {item.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
