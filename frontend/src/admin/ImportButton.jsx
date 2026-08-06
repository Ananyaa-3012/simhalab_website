import { useState, useRef } from 'react'
import api from '../utils/api'

const IMPORTABLE = [
  'people','publications','projects','news','events',
  'openings','testimonials','sponsors','announcements'
]

export default function ImportButton({ section, onImported }) {
  const [show, setShow] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()

  if (!IMPORTABLE.includes(section)) return null

  const handleFile = async (file) => {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['csv','xlsx'].includes(ext)) {
      alert('Please upload a .csv or .xlsx file')
      return
    }
    setUploading(true)
    setResult(null)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await api.post(`/admin/import/${section}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(res.data)
      if (res.data.imported > 0) onImported(res.data)
    } catch (err) {
      setResult({ imported: 0, skipped: 0, errors: [err.response?.data?.detail || 'Upload failed'] })
    } finally {
      setUploading(false)
    }
  }

  const downloadTemplate = () => {
    window.open(`/api/admin/import/${section}/template`, '_blank')
  }

  return (
    <>
      <button onClick={() => { setShow(true); setResult(null) }} style={styles.importBtn}>
        ↑ Import CSV/XLSX
      </button>

      {show && (
        <div style={styles.backdrop} onClick={() => setShow(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Import {section}</h3>
              <button onClick={() => setShow(false)} style={styles.closeBtn}>✕</button>
            </div>

            <button onClick={downloadTemplate} style={styles.templateBtn}>
              ↓ Download Template CSV
            </button>

            {section === 'people' && (
              <p style={{ color: '#60c0e0', fontSize: '0.78rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                The template includes an <strong>image_filename</strong> column. After importing, use "Upload Images ZIP" to match photos by filename.
              </p>
            )}

            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => {
                e.preventDefault()
                setDragOver(false)
                handleFile(e.dataTransfer.files[0])
              }}
              style={{ ...styles.dropZone, borderColor: dragOver ? '#40a0d0' : '#444', background: dragOver ? '#2a2a1a' : '#1a1a1a' }}
            >
              {uploading ? (
                <span style={{ color: '#40a0d0' }}>Importing...</span>
              ) : (
                <>
                  <span style={{ color: '#888', fontSize: '0.9rem' }}>Drag & drop a .csv or .xlsx file here, or</span>
                  <label style={styles.browseBtn}>
                    Browse File
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".csv,.xlsx"
                      onChange={e => handleFile(e.target.files[0])}
                      style={{ display: 'none' }}
                    />
                  </label>
                </>
              )}
            </div>

            {result && (
              <div style={styles.result}>
                <p style={{ color: result.imported > 0 ? '#4caf50' : '#aaa' }}>
                  ✓ {result.imported} row(s) imported
                </p>
                {result.skipped > 0 && (
                  <p style={{ color: '#60c0e0' }}>⚠ {result.skipped} row(s) skipped</p>
                )}
                {result.errors.length > 0 && (
                  <div style={styles.errorList}>
                    {result.errors.map((e, i) => (
                      <p key={i} style={{ color: '#ff6b6b', fontSize: '0.8rem' }}>{e}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

const styles = {
  importBtn: { background: '#2a2a2a', color: '#40a0d0', border: '1px solid #444', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' },
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: '#1e1e1e', border: '1px solid #333', borderRadius: '12px', padding: '2rem', width: '480px', maxWidth: '90vw' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  modalTitle: { color: '#fff', fontSize: '1.1rem', fontWeight: '700' },
  closeBtn: { background: 'none', border: 'none', color: '#888', fontSize: '1.1rem', cursor: 'pointer' },
  templateBtn: { width: '100%', background: '#2a2a2a', border: '1px solid #444', color: '#ccc', padding: '0.6rem', borderRadius: '6px', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.85rem' },
  dropZone: { border: '2px dashed #444', borderRadius: '8px', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', transition: 'all 0.2s', marginBottom: '1rem' },
  browseBtn: { background: '#40a0d0', color: '#000', padding: '0.4rem 1.2rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' },
  result: { background: '#111', borderRadius: '8px', padding: '1rem' },
  errorList: { marginTop: '0.5rem', maxHeight: '120px', overflowY: 'auto' },
}
