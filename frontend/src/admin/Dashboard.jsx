import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import ImportButton from './ImportButton'
import FlowchartEditor from './FlowchartEditor'

// ─── Sidebar Navigation Config ───────────────────────────────────────────────
const SIDEBAR_ITEMS = [
  { group: 'HOMEPAGE', items: [
    { key: 'carousel', label: 'Carousel' },
    { key: 'lab-head', label: 'Lab Head Message' },
    { key: 'announcements', label: 'Announcements' },
  ]},
  { group: 'CONTENT', items: [
    { key: 'people', label: 'People' },
    { key: 'publications', label: 'Publications' },
    { key: 'research-areas', label: 'Research Areas' },
    { key: 'projects', label: 'Projects' },
  ]},
  { group: 'UPDATES', items: [
    { key: 'news', label: 'News' },
    { key: 'events', label: 'Events' },
    { key: 'blog', label: 'Blog' },
  ]},
  { group: 'MEDIA', items: [
    { key: 'gallery', label: 'Gallery' },
    { key: 'testimonials', label: 'Testimonials' },
    { key: 'sponsors', label: 'Sponsors' },
    { key: 'links', label: 'Links' },
  ]},
  { group: 'JOIN US', items: [
    { key: 'openings', label: 'Openings' },
    { key: 'flowcharts', label: 'Flowcharts' },
  ]},
  { group: 'SITE', items: [
    { key: 'contact-info', label: 'Contact Info' },
    { key: 'site-settings', label: 'Settings' },
  ]},
]

// Sections that are single-record (skip list view)
const SINGLE_RECORD_SECTIONS = ['lab-head', 'contact-info']

// ─── Form Field Definitions per Resource ─────────────────────────────────────
const FIELD_TYPES = {
  text: 'text',
  textarea: 'textarea',
  html: 'html',
  number: 'number',
  boolean: 'boolean',
  select: 'select',
  date: 'date',
  time: 'time',
  image: 'image',
  json: 'json',
}

const FORM_CONFIGS = {
  carousel: {
    label: 'Carousel Slide',
    listColumns: ['title', 'display_order', 'is_active'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea' },
      { name: 'image_path', label: 'Image', type: 'image', subdir: 'carousel' },
      { name: 'cta_text', label: 'CTA Text', type: 'text' },
      { name: 'cta_link', label: 'CTA Link', type: 'text' },
      { name: 'display_order', label: 'Display Order', type: 'number' },
      { name: 'is_active', label: 'Active', type: 'boolean' },
    ],
  },
  announcements: {
    label: 'Announcement',
    listColumns: ['title', 'announcement_type', 'is_active'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'link_url', label: 'Link URL', type: 'text' },
      { name: 'link_text', label: 'Link Text', type: 'text' },
      { name: 'announcement_type', label: 'Type', type: 'select', options: ['recruitment', 'general', 'urgent'] },
      { name: 'is_active', label: 'Active', type: 'boolean' },
      { name: 'display_order', label: 'Display Order', type: 'number' },
      { name: 'start_date', label: 'Start Date', type: 'date' },
      { name: 'end_date', label: 'End Date', type: 'date' },
    ],
  },
  people: {
    label: 'Person',
    listColumns: ['name', 'category', 'is_active'],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'photo_path', label: 'Photo', type: 'image', subdir: 'people' },
      { name: 'role', label: 'Role', type: 'text' },
      { name: 'designation', label: 'Designation', type: 'text' },
      { name: 'department', label: 'Department', type: 'text' },
      { name: 'category', label: 'Category', type: 'select', options: ['faculty', 'project_associate', 'postdoc', 'phd', 'pg', 'ug', 'alumni'] },
      { name: 'bio_html', label: 'Bio (HTML)', type: 'html' },
      { name: 'research_interests', label: 'Research Interests (JSON array)', type: 'json' },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'github_url', label: 'GitHub URL', type: 'text' },
      { name: 'google_scholar_url', label: 'Google Scholar URL', type: 'text' },
      { name: 'personal_website_url', label: 'Personal Website URL', type: 'text' },
      { name: 'linkedin_url', label: 'LinkedIn URL', type: 'text' },
      { name: 'orcid_url', label: 'ORCID URL', type: 'text' },
      { name: 'display_order', label: 'Display Order', type: 'number' },
      { name: 'is_active', label: 'Active', type: 'boolean' },
    ],
  },
  publications: {
    label: 'Publication',
    listColumns: ['title', 'year', 'pub_type'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'authors', label: 'Authors', type: 'text', required: true },
      { name: 'venue', label: 'Venue', type: 'text' },
      { name: 'year', label: 'Year', type: 'number' },
      { name: 'month', label: 'Month', type: 'number' },
      { name: 'pub_type', label: 'Publication Type', type: 'select', options: ['journal', 'conference', 'preprint', 'book_chapter', 'thesis'] },
      { name: 'doi_url', label: 'DOI URL', type: 'text' },
      { name: 'pdf_url', label: 'PDF URL', type: 'text' },
      { name: 'abstract_html', label: 'Abstract (HTML)', type: 'html' },
      { name: 'research_area_id', label: 'Research Area ID', type: 'number' },
      { name: 'is_featured', label: 'Featured', type: 'boolean' },
    ],
  },
  'research-areas': {
    label: 'Research Area',
    listColumns: ['title', 'display_order', 'is_active'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description_html', label: 'Description (HTML)', type: 'html' },
      { name: 'image_path', label: 'Image', type: 'image', subdir: 'research-areas' },
      { name: 'display_order', label: 'Display Order', type: 'number' },
      { name: 'is_active', label: 'Active', type: 'boolean' },
    ],
  },
  projects: {
    label: 'Project',
    listColumns: ['title', 'status', 'is_active'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description_html', label: 'Description (HTML)', type: 'html' },
      { name: 'image_path', label: 'Image', type: 'image', subdir: 'projects' },
      { name: 'status', label: 'Status', type: 'select', options: ['ongoing', 'completed'] },
      { name: 'start_date', label: 'Start Date', type: 'date' },
      { name: 'end_date', label: 'End Date', type: 'date' },
      { name: 'research_area_id', label: 'Research Area ID', type: 'number' },
      { name: 'is_active', label: 'Active', type: 'boolean' },
    ],
  },
  news: {
    label: 'News',
    listColumns: ['title', 'published_date', 'is_active'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'summary', label: 'Summary', type: 'textarea' },
      { name: 'content_html', label: 'Content (HTML)', type: 'html' },
      { name: 'image_path', label: 'Image', type: 'image', subdir: 'news' },
      { name: 'source_name', label: 'Source Name', type: 'text' },
      { name: 'source_url', label: 'Source URL', type: 'text' },
      { name: 'published_date', label: 'Published Date', type: 'date' },
      { name: 'is_featured', label: 'Featured', type: 'boolean' },
      { name: 'is_active', label: 'Active', type: 'boolean' },
    ],
  },
  events: {
    label: 'Event',
    listColumns: ['title', 'event_date', 'is_active'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description_html', label: 'Description (HTML)', type: 'html' },
      { name: 'image_path', label: 'Image', type: 'image', subdir: 'events' },
      { name: 'event_date', label: 'Event Date', type: 'date' },
      { name: 'end_date', label: 'End Date', type: 'date' },
      { name: 'start_time', label: 'Start Time', type: 'time' },
      { name: 'end_time', label: 'End Time', type: 'time' },
      { name: 'venue', label: 'Venue', type: 'text' },
      { name: 'event_url', label: 'Event URL', type: 'text' },
      { name: 'is_active', label: 'Active', type: 'boolean' },
    ],
  },
  blog: {
    label: 'Blog Post',
    listColumns: ['title', 'is_published', 'published_date'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'content_html', label: 'Content (HTML)', type: 'html' },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea' },
      { name: 'cover_image_path', label: 'Cover Image', type: 'image', subdir: 'blog' },
      { name: 'author_id', label: 'Author ID', type: 'number' },
      { name: 'is_published', label: 'Published', type: 'boolean' },
      { name: 'published_date', label: 'Published Date', type: 'date' },
    ],
  },
  gallery: {
    label: 'Gallery Image',
    listColumns: ['caption', 'event_name', 'display_order'],
    fields: [
      { name: 'image_path', label: 'Image', type: 'image', subdir: 'gallery', required: true },
      { name: 'caption', label: 'Caption', type: 'text' },
      { name: 'alt_text', label: 'Alt Text', type: 'text' },
      { name: 'event_name', label: 'Event Name', type: 'text' },
      { name: 'date_taken', label: 'Date Taken', type: 'date' },
      { name: 'category_id', label: 'Category ID', type: 'number' },
      { name: 'display_order', label: 'Display Order', type: 'number' },
    ],
  },
  testimonials: {
    label: 'Testimonial',
    listColumns: ['person_name', 'organization', 'is_active'],
    fields: [
      { name: 'quote_text', label: 'Quote', type: 'textarea', required: true },
      { name: 'person_name', label: 'Person Name', type: 'text', required: true },
      { name: 'person_role', label: 'Person Role', type: 'text' },
      { name: 'person_photo_path', label: 'Person Photo', type: 'image', subdir: 'testimonials' },
      { name: 'organization', label: 'Organization', type: 'text' },
      { name: 'display_order', label: 'Display Order', type: 'number' },
      { name: 'is_active', label: 'Active', type: 'boolean' },
    ],
  },
  sponsors: {
    label: 'Sponsor',
    listColumns: ['name', 'sponsor_type', 'is_active'],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'logo_path', label: 'Logo', type: 'image', subdir: 'sponsors' },
      { name: 'website_url', label: 'Website URL', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'sponsor_type', label: 'Type', type: 'select', options: ['sponsor', 'collaborator'] },
      { name: 'display_order', label: 'Display Order', type: 'number' },
      { name: 'is_active', label: 'Active', type: 'boolean' },
    ],
  },
  links: {
    label: 'Link',
    listColumns: ['title', 'category', 'is_active'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'url', label: 'URL', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'icon', label: 'Icon', type: 'text' },
      { name: 'category', label: 'Category', type: 'select', options: ['github', 'newsletter', 'blog', 'resource', 'other'] },
      { name: 'display_order', label: 'Display Order', type: 'number' },
      { name: 'is_active', label: 'Active', type: 'boolean' },
    ],
  },
  openings: {
    label: 'Opening',
    listColumns: ['position_title', 'position_type', 'is_active'],
    fields: [
      { name: 'position_title', label: 'Position Title', type: 'text', required: true },
      { name: 'position_type', label: 'Position Type', type: 'select', options: ['phd', 'postdoc', 'postbacc', 'internship', 'other'] },
      { name: 'description_html', label: 'Description (HTML)', type: 'html' },
      { name: 'requirements_html', label: 'Requirements (HTML)', type: 'html' },
      { name: 'deadline', label: 'Deadline', type: 'date' },
      { name: 'apply_url', label: 'Apply URL', type: 'text' },
      { name: 'is_active', label: 'Active', type: 'boolean' },
    ],
  },
  'contact-info': {
    label: 'Contact Info',
    singleRecord: true,
    fields: [
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'address_html', label: 'Address (HTML)', type: 'html' },
      { name: 'google_maps_embed_url', label: 'Google Maps Embed URL', type: 'text' },
      { name: 'google_maps_link', label: 'Google Maps Link', type: 'text' },
      { name: 'office_hours', label: 'Office Hours', type: 'text' },
    ],
  },
  'site-settings': {
    label: 'Site Settings',
    listColumns: ['key', 'value'],
    fields: [
      { name: 'key', label: 'Key', type: 'text', required: true },
      { name: 'value', label: 'Value', type: 'textarea', required: true },
    ],
  },
  'lab-head': {
    label: 'Lab Head Message',
    singleRecord: true,
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'photo_path', label: 'Photo', type: 'image', subdir: 'lab-head' },
      { name: 'message_html', label: 'Message (HTML)', type: 'html' },
    ],
  },
}

// ─── FormField Component ─────────────────────────────────────────────────────
function FormField({ field, value, onChange, error }) {
  const fieldStyle = { ...styles.formGroup }
  const inputStyle = { ...styles.input, ...(error ? { borderColor: '#ff4444' } : {}) }
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)

  const uploadFile = async (file) => {
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    if (field.subdir) formData.append('subdir', field.subdir)
    try {
      const res = await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onChange(res.data.path)
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.detail || 'Unknown error'))
    } finally {
      setUploading(false)
    }
  }

  const handleImageUpload = async (e) => {
    uploadFile(e.target.files[0])
  }

  switch (field.type) {
    case 'text':
      return (
        <div style={fieldStyle}>
          <label style={styles.label}>{field.label}{field.required && ' *'}</label>
          <input
            type="text"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            style={inputStyle}
            placeholder={field.label}
          />
          {error && <span style={styles.errorText}>{error}</span>}
        </div>
      )

    case 'textarea':
      return (
        <div style={fieldStyle}>
          <label style={styles.label}>{field.label}{field.required && ' *'}</label>
          <textarea
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
            placeholder={field.label}
          />
          {error && <span style={styles.errorText}>{error}</span>}
        </div>
      )

    case 'html':
      return (
        <div style={fieldStyle}>
          <label style={styles.label}>{field.label}{field.required && ' *'}</label>
          <textarea
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            style={{ ...inputStyle, minHeight: '150px', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem' }}
            placeholder="Enter HTML content..."
          />
          {error && <span style={styles.errorText}>{error}</span>}
        </div>
      )

    case 'number':
      return (
        <div style={fieldStyle}>
          <label style={styles.label}>{field.label}{field.required && ' *'}</label>
          <input
            type="number"
            value={value ?? ''}
            onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
            style={inputStyle}
            placeholder={field.label}
          />
          {error && <span style={styles.errorText}>{error}</span>}
        </div>
      )

    case 'boolean':
      return (
        <div style={{ ...fieldStyle, flexDirection: 'row', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ ...styles.label, marginBottom: 0 }}>
            <input
              type="checkbox"
              checked={!!value}
              onChange={e => onChange(e.target.checked)}
              style={{ marginRight: '0.5rem', accentColor: '#ffde00' }}
            />
            {field.label}
          </label>
        </div>
      )

    case 'select':
      return (
        <div style={fieldStyle}>
          <label style={styles.label}>{field.label}{field.required && ' *'}</label>
          <select
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            style={inputStyle}
          >
            <option value="">-- Select --</option>
            {(field.options || []).map(opt => (
              <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>
            ))}
          </select>
          {error && <span style={styles.errorText}>{error}</span>}
        </div>
      )

    case 'date':
      return (
        <div style={fieldStyle}>
          <label style={styles.label}>{field.label}{field.required && ' *'}</label>
          <input
            type="date"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            style={inputStyle}
          />
          {error && <span style={styles.errorText}>{error}</span>}
        </div>
      )

    case 'time':
      return (
        <div style={fieldStyle}>
          <label style={styles.label}>{field.label}{field.required && ' *'}</label>
          <input
            type="time"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            style={inputStyle}
          />
          {error && <span style={styles.errorText}>{error}</span>}
        </div>
      )

    case 'image':
      return (
        <div style={fieldStyle}>
          <label style={styles.label}>{field.label}{field.required && ' *'}</label>
          {value && (
            <div style={styles.imagePreview}>
              <img src={value} alt="Preview" style={styles.previewImg} />
              <span style={styles.imagePath}>{value}</span>
            </div>
          )}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              const file = e.dataTransfer.files[0]
              if (file && file.type.startsWith('image/')) uploadFile(file)
            }}
            style={{
              ...styles.dropZone,
              borderColor: dragOver ? '#ffde00' : '#444',
              background: dragOver ? '#2a2a1a' : '#2a2a2a',
            }}
          >
            {uploading ? (
              <span style={{ color: '#ffde00' }}>Uploading...</span>
            ) : (
              <>
                <span style={{ color: '#888', fontSize: '0.85rem' }}>
                  Drag & drop an image here, or
                </span>
                <label style={styles.browseBtn}>
                  Browse
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </>
            )}
          </div>
          {error && <span style={styles.errorText}>{error}</span>}
        </div>
      )

    case 'json':
      return (
        <div style={fieldStyle}>
          <label style={styles.label}>{field.label}{field.required && ' *'}</label>
          <textarea
            value={typeof value === 'string' ? value : JSON.stringify(value || [], null, 2)}
            onChange={e => onChange(e.target.value)}
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem' }}
            placeholder='["item1", "item2"]'
          />
          {error && <span style={styles.errorText}>{error}</span>}
        </div>
      )

    default:
      return null
  }
}

// ─── ItemForm Component ──────────────────────────────────────────────────────
function ItemForm({ section, item, onSave, onCancel }) {
  const config = FORM_CONFIGS[section]
  const isEdit = !!item
  const [formData, setFormData] = useState(() => {
    if (item) return { ...item }
    // Default values for new items
    const defaults = {}
    config.fields.forEach(f => {
      if (f.type === 'boolean') defaults[f.name] = true
      else if (f.type === 'number') defaults[f.name] = null
      else defaults[f.name] = ''
    })
    return defaults
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }))
    if (errors[fieldName]) {
      setErrors(prev => { const next = { ...prev }; delete next[fieldName]; return next })
    }
  }

  const validate = () => {
    const newErrors = {}
    config.fields.forEach(f => {
      if (f.required) {
        const val = formData[f.name]
        if (val === undefined || val === null || val === '') {
          newErrors[f.name] = `${f.label} is required`
        }
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    setSubmitError('')

    // Prepare payload: strip id and timestamps, parse JSON fields
    const payload = {}
    config.fields.forEach(f => {
      let val = formData[f.name]
      if (f.type === 'json' && typeof val === 'string') {
        try { val = JSON.parse(val) } catch { /* keep as string */ }
      }
      if (f.type === 'number' && val === '') val = null
      payload[f.name] = val
    })

    try {
      if (SINGLE_RECORD_SECTIONS.includes(section)) {
        await api.put(`/admin/${section}`, payload)
      } else if (isEdit) {
        await api.put(`/admin/${section}/${item.id}`, payload)
      } else {
        await api.post(`/admin/${section}`, payload)
      }
      onSave()
    } catch (err) {
      setSubmitError(err.response?.data?.detail || 'An error occurred while saving.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={styles.formContainer}>
      <div style={styles.formHeader}>
        <h2 style={styles.formTitle}>
          {isEdit ? 'Edit' : 'Create'} {config.label}
        </h2>
        <button onClick={onCancel} style={styles.cancelBtn}>Back to List</button>
      </div>

      {submitError && <div style={styles.submitError}>{submitError}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        {config.fields.map(field => (
          <FormField
            key={field.name}
            field={field}
            value={formData[field.name]}
            onChange={(val) => handleChange(field.name, val)}
            error={errors[field.name]}
          />
        ))}

        <div style={styles.formActions}>
          <button type="submit" disabled={submitting} style={styles.submitBtn}>
            {submitting ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
          </button>
          <button type="button" onClick={onCancel} style={styles.cancelBtnSecondary}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── Main Dashboard Component ────────────────────────────────────────────────
export default function AdminDashboard() {
  const [user, setUser] = useState(null)
  const [activeSection, setActiveSection] = useState('carousel')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list') // 'list' | 'create' | 'edit'
  const [editItem, setEditItem] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/auth/me')
      .then(res => setUser(res.data))
      .catch(() => navigate('/admin'))
  }, [])

  const fetchData = useCallback(() => {
    setLoading(true)
    api.get(`/admin/${activeSection}`)
      .then(res => {
        const items = Array.isArray(res.data) ? res.data : res.data?.items || (res.data ? [res.data] : [])
        setData(items)
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [activeSection])

  useEffect(() => {
    fetchData()
    // For single-record sections, jump to edit view
    if (SINGLE_RECORD_SECTIONS.includes(activeSection)) {
      setView('edit')
    } else {
      setView('list')
    }
    setEditItem(null)
  }, [activeSection, fetchData])

  const handleLogout = async () => {
    await api.post('/auth/logout')
    navigate('/admin')
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    try {
      await api.delete(`/admin/${activeSection}/${id}`)
      setData(data.filter(item => item.id !== id))
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.detail || 'Unknown error'))
    }
  }

  const handleEdit = (item) => {
    setEditItem(item)
    setView('edit')
  }

  const handleCreate = () => {
    setEditItem(null)
    setView('create')
  }

  const handleFormSave = () => {
    fetchData()
    if (SINGLE_RECORD_SECTIONS.includes(activeSection)) {
      setView('edit')
    } else {
      setView('list')
    }
    setEditItem(null)
  }

  const handleFormCancel = () => {
    if (SINGLE_RECORD_SECTIONS.includes(activeSection)) {
      // Can't go back to list for single records, stay on edit
      return
    }
    setView('list')
    setEditItem(null)
  }

  const handleSectionChange = (key) => {
    setActiveSection(key)
  }

  if (!user) return <div style={styles.loading}>Loading...</div>

  const config = FORM_CONFIGS[activeSection]
  const isSingleRecord = SINGLE_RECORD_SECTIONS.includes(activeSection)

  const renderContent = () => {
    // Flowcharts: fully custom editor
    if (activeSection === 'flowcharts') {
      return <FlowchartEditor />
    }

    // Single-record sections: show form directly
    if (isSingleRecord) {
      if (loading) return <p style={{ color: '#ccc' }}>Loading...</p>
      const singleItem = data[0] || {}
      return (
        <ItemForm
          section={activeSection}
          item={singleItem}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />
      )
    }

    // Create / Edit view
    if (view === 'create' || view === 'edit') {
      return (
        <ItemForm
          section={activeSection}
          item={view === 'edit' ? editItem : null}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />
      )
    }

    // List view
    if (loading) return <p style={{ color: '#ccc' }}>Loading...</p>

    const columns = config?.listColumns || ['title', 'is_active']

    return (
      <div style={styles.tableContainer}>
        <div style={styles.listHeader}>
          <ImportButton section={activeSection} onImported={fetchData} />
          <button onClick={handleCreate} style={styles.addBtn}>+ Add New</button>
        </div>

        {data.length === 0 ? (
          <p style={styles.empty}>No items found.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                {columns.map(col => (
                  <th key={col} style={styles.th}>{col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</th>
                ))}
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id} style={styles.tr}>
                  <td style={styles.td}>{item.id}</td>
                  {columns.map(col => (
                    <td key={col} style={styles.td}>
                      {renderCellValue(item[col], col)}
                    </td>
                  ))}
                  <td style={styles.td}>
                    <button onClick={() => handleEdit(item)} style={styles.editBtn}>Edit</button>
                    <button onClick={() => handleDelete(item.id)} style={styles.deleteBtn}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.sidebarTitle}>SIMHA Admin</h2>
          <p style={styles.sidebarUser}>{user.name}</p>
        </div>

        <nav style={styles.nav}>
          {SIDEBAR_ITEMS.map(group => (
            <div key={group.group}>
              <h4 style={styles.groupTitle}>{group.group}</h4>
              {group.items.map(item => (
                <button
                  key={item.key}
                  onClick={() => handleSectionChange(item.key)}
                  style={{
                    ...styles.navItem,
                    ...(activeSection === item.key ? styles.navItemActive : {}),
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </aside>

      <main style={styles.main}>
        <div style={styles.mainHeader}>
          <h1 style={styles.mainTitle}>
            {activeSection.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </h1>
        </div>
        {renderContent()}
      </main>
    </div>
  )
}

// ─── Cell Rendering Helper ───────────────────────────────────────────────────
function renderCellValue(value, colName) {
  if (value === null || value === undefined) return <span style={{ color: '#666' }}>--</span>
  if (typeof value === 'boolean') {
    return (
      <span style={{ color: value ? '#4caf50' : '#f44336' }}>
        {value ? 'Yes' : 'No'}
      </span>
    )
  }
  if (colName.includes('is_active') || colName.includes('is_published') || colName.includes('is_featured')) {
    const boolVal = !!value
    return (
      <span style={{ color: boolVal ? '#4caf50' : '#f44336' }}>
        {boolVal ? 'Yes' : 'No'}
      </span>
    )
  }
  const str = String(value)
  return str.length > 60 ? str.slice(0, 60) + '...' : str
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = {
  container: { display: 'flex', minHeight: '100vh', background: '#0a0a0a' },
  sidebar: { width: '240px', background: '#1a1a1a', padding: '1.5rem 1rem', overflowY: 'auto', borderRight: '1px solid #333', position: 'fixed', top: 0, left: 0, bottom: 0 },
  sidebarHeader: { marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #333' },
  sidebarTitle: { color: '#ffde00', fontSize: '1.2rem', fontWeight: '800', letterSpacing: '1px' },
  sidebarUser: { color: '#999', fontSize: '0.75rem', marginTop: '0.25rem' },
  nav: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  groupTitle: { color: '#666', fontSize: '0.7rem', letterSpacing: '1px', marginTop: '1rem', marginBottom: '0.5rem' },
  navItem: { display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', background: 'none', border: 'none', color: '#ccc', fontSize: '0.85rem', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' },
  navItemActive: { background: '#333', color: '#ffde00' },
  logoutBtn: { marginTop: '2rem', width: '100%', padding: '0.6rem', background: '#333', border: 'none', color: '#ff6b6b', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  main: { flex: 1, padding: '2rem', marginLeft: '240px' },
  mainHeader: { marginBottom: '2rem' },
  mainTitle: { color: '#fff', fontSize: '1.5rem', fontWeight: '700' },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#fff', background: '#0a0a0a' },
  tableContainer: { background: '#1e1e1e', borderRadius: '12px', padding: '1.5rem', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '0.75rem', color: '#999', borderBottom: '1px solid #333', fontSize: '0.8rem', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #2a2a2a' },
  td: { padding: '0.75rem', color: '#ddd', fontSize: '0.9rem' },
  deleteBtn: { background: '#ff4444', color: '#fff', border: 'none', padding: '0.3rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', marginLeft: '0.5rem' },
  editBtn: { background: '#ffde00', color: '#000', border: 'none', padding: '0.3rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' },
  addBtn: { background: '#ffde00', color: '#000', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '700' },
  listHeader: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginBottom: '1rem' },
  empty: { color: '#666', textAlign: 'center', padding: '2rem' },

  // Form styles
  formContainer: { background: '#1e1e1e', borderRadius: '12px', padding: '2rem', maxWidth: '800px' },
  formHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #333' },
  formTitle: { color: '#fff', fontSize: '1.3rem', fontWeight: '600' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { color: '#bbb', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.2rem' },
  input: { background: '#2a2a2a', border: '1px solid #444', borderRadius: '6px', padding: '0.65rem 0.85rem', color: '#fff', fontSize: '0.9rem', outline: 'none', width: '100%', boxSizing: 'border-box' },
  formActions: { display: 'flex', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #333' },
  submitBtn: { background: '#ffde00', color: '#000', border: 'none', padding: '0.7rem 2rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '700' },
  cancelBtn: { background: '#333', color: '#ccc', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  cancelBtnSecondary: { background: '#333', color: '#ccc', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' },
  submitError: { background: '#3d1111', border: '1px solid #ff4444', color: '#ff6b6b', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' },
  errorText: { color: '#ff6b6b', fontSize: '0.75rem' },
  imagePreview: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', padding: '0.5rem', background: '#222', borderRadius: '6px' },
  previewImg: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #444' },
  imagePath: { color: '#888', fontSize: '0.75rem', wordBreak: 'break-all' },
  dropZone: { border: '2px dashed #444', borderRadius: '8px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', transition: 'border-color 0.2s, background 0.2s', cursor: 'pointer' },
  browseBtn: { background: '#ffde00', color: '#000', padding: '0.4rem 1rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' },
}
