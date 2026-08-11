import { useState, useEffect } from 'react'
import api from '../utils/api'

export default function Contact() {
  const [contactInfo, setContactInfo] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    api.get('/public/contact-info')
      .then(res => setContactInfo(res.data))
      .catch(() => {})
  }, [])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setStatus(null)
    try {
      await api.post('/public/contact', form)
      setStatus({ type: 'success', message: 'Message sent successfully! We will get back to you soon.' })
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch {
      setStatus({ type: 'error', message: 'Failed to send message. Please try again later.' })
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' }

  return (
    <section className="section">
      <div className="container">
        <h1 className="section-title">Contact Us</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
          {/* Contact Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Subject</label>
              <input type="text" name="subject" value={form.subject} onChange={handleChange} required style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Message</label>
              <textarea name="message" value={form.message} onChange={handleChange} required rows={5} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
            {status && (
              <p style={{ color: status.type === 'success' ? '#2e7d32' : '#c62828', marginTop: '0.5rem' }}>
                {status.message}
              </p>
            )}
          </form>

          {/* Contact Info & Map */}
          <div>
            {contactInfo && (
              <div style={{ marginBottom: '2rem' }}>
                {contactInfo.address && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h3>Address</h3>
                    <p style={{ color: '#555', marginTop: '0.25rem' }}>{contactInfo.address}</p>
                  </div>
                )}
                {contactInfo.email && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h3>Email</h3>
                    <p style={{ marginTop: '0.25rem' }}>
                      <a href={`mailto:${contactInfo.email}`} style={{ color: '#0066cc' }}>{contactInfo.email}</a>
                    </p>
                  </div>
                )}
                {contactInfo.phone && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h3>Phone</h3>
                    <p style={{ color: '#555', marginTop: '0.25rem' }}>{contactInfo.phone}</p>
                  </div>
                )}
              </div>
            )}

            {/* Google Maps Embed */}
            <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
              <iframe
                src={contactInfo?.google_maps_embed_url || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d242.9811914274577!2d80.22704154253009!3d12.991089793043027!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a52673043960081%3A0xd18bd9bbda35314e!2sNew%20Acadamic%20Complex%202%20-%20NAC2%20block!5e0!3m2!1sen!2sin!4v1779790991061!5m2!1sen!2sin'}
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lab Location"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
