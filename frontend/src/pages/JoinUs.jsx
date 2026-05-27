import { useState, useEffect, useRef } from 'react'
import api from '../utils/api'

// ─── Static Flowchart Renderer ───────────────────────────────────────────────
// Renders the flowchart as a static SVG — no pan/zoom/interaction for public users.

const NODE_W = 160
const NODE_H = 50
const NODE_RX = 8
const ARROWHEAD_ID = 'arrowhead'

function getNodeCenter(node) {
  return { x: node.position_x + NODE_W / 2, y: node.position_y + NODE_H / 2 }
}

function getEdgePath(sourceNode, targetNode) {
  if (!sourceNode || !targetNode) return ''
  const s = getNodeCenter(sourceNode)
  const t = getNodeCenter(targetNode)
  const mx = (s.x + t.x) / 2
  return `M ${s.x} ${s.y} C ${mx} ${s.y}, ${mx} ${t.y}, ${t.x} ${t.y}`
}

function StaticFlowchart({ nodes, edges }) {
  if (!nodes || nodes.length === 0) {
    return (
      <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '2rem' }}>
        No flowchart data available.
      </p>
    )
  }

  // Compute bounding box
  const xs = nodes.map(n => n.position_x)
  const ys = nodes.map(n => n.position_y)
  const minX = Math.min(...xs) - 20
  const minY = Math.min(...ys) - 20
  const maxX = Math.max(...xs) + NODE_W + 20
  const maxY = Math.max(...ys) + NODE_H + 20
  const vbWidth = maxX - minX
  const vbHeight = maxY - minY

  const nodeById = {}
  nodes.forEach(n => { nodeById[n.node_id] = n })

  return (
    <svg
      viewBox={`${minX} ${minY} ${vbWidth} ${vbHeight}`}
      style={{ width: '100%', height: 'auto', maxHeight: '520px', display: 'block' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <marker id={ARROWHEAD_ID} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="var(--color-secondary)" />
        </marker>
      </defs>

      {/* Edges */}
      {(edges || []).map(edge => {
        const src = nodeById[edge.source_node_id]
        const tgt = nodeById[edge.target_node_id]
        const d = getEdgePath(src, tgt)
        if (!d) return null
        const mid = src && tgt ? {
          x: (getNodeCenter(src).x + getNodeCenter(tgt).x) / 2,
          y: (getNodeCenter(src).y + getNodeCenter(tgt).y) / 2,
        } : null
        return (
          <g key={edge.edge_id}>
            <path
              d={d}
              fill="none"
              stroke="var(--color-secondary)"
              strokeWidth="2"
              markerEnd={`url(#${ARROWHEAD_ID})`}
            />
            {edge.label && mid && (
              <text
                x={mid.x}
                y={mid.y - 6}
                textAnchor="middle"
                fontSize="11"
                fill="var(--color-text-secondary)"
              >
                {edge.label}
              </text>
            )}
          </g>
        )
      })}

      {/* Nodes */}
      {nodes.map(node => {
        const isInput = node.node_type === 'input'
        const isOutput = node.node_type === 'output'
        const fill = isInput
          ? 'var(--color-primary)'
          : isOutput
          ? 'var(--color-secondary)'
          : 'var(--color-surface)'
        const textColor = (isInput || isOutput) ? '#000' : 'var(--color-text)'
        const stroke = isInput || isOutput ? 'transparent' : 'var(--color-border)'

        return (
          <g key={node.node_id}>
            <rect
              x={node.position_x}
              y={node.position_y}
              width={NODE_W}
              height={NODE_H}
              rx={NODE_RX}
              ry={NODE_RX}
              fill={fill}
              stroke={stroke}
              strokeWidth="1.5"
            />
            <foreignObject
              x={node.position_x + 8}
              y={node.position_y + 4}
              width={NODE_W - 16}
              height={NODE_H - 8}
            >
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: textColor,
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  wordBreak: 'break-word',
                }}
              >
                {node.label}
              </div>
            </foreignObject>
          </g>
        )
      })}
    </svg>
  )
}

// ─── JoinUs Page ─────────────────────────────────────────────────────────────
export default function JoinUs() {
  const [flowcharts, setFlowcharts] = useState([])
  const [activeTab, setActiveTab] = useState(0)
  const [openings, setOpenings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/public/flowcharts').then(res => setFlowcharts(res.data)).catch(() => {}),
      api.get('/public/openings').then(res => setOpenings(res.data)).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  const currentFlowchart = flowcharts[activeTab]

  if (loading) return <div className="section container"><p>Loading...</p></div>

  return (
    <section className="section">
      <div className="container">
        <h1 className="section-title">Pathways to IITM</h1>

        {flowcharts.length > 0 && (
          <>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }}>
              {flowcharts.map((fc, idx) => (
                <button
                  key={fc.id || idx}
                  className={`btn ${activeTab === idx ? 'btn-primary' : ''}`}
                  onClick={() => setActiveTab(idx)}
                  style={activeTab !== idx ? { background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' } : {}}
                >
                  {fc.title || fc.name}
                </button>
              ))}
            </div>

            {currentFlowchart && (
              <div style={{
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '3rem',
                background: 'var(--color-surface)',
                overflow: 'hidden',
              }}>
                <StaticFlowchart
                  nodes={currentFlowchart.nodes}
                  edges={currentFlowchart.edges}
                />
              </div>
            )}
          </>
        )}

        {openings.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h2 className="section-title">Current Openings</h2>
            <div className="card-grid">
              {openings.map(opening => (
                <div className="card" key={opening.id} style={{ padding: '1.5rem' }}>
                  <h3>{opening.position_title}</h3>
                  {opening.position_type && (
                    <p style={{ color: 'var(--color-secondary)', fontSize: '0.9rem', marginTop: '0.25rem', fontWeight: 600 }}>
                      {opening.position_type.replace(/_/g, ' ').toUpperCase()}
                    </p>
                  )}
                  {opening.description_html && (
                    <div
                      style={{ marginTop: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}
                      dangerouslySetInnerHTML={{ __html: opening.description_html }}
                    />
                  )}
                  {opening.deadline && (
                    <p style={{ marginTop: '0.75rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                      Deadline: <strong>{opening.deadline}</strong>
                    </p>
                  )}
                  {opening.apply_url && (
                    <a
                      href={opening.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ marginTop: '1rem', display: 'inline-block' }}
                    >
                      Apply Now
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {flowcharts.length === 0 && openings.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>No information available at this time.</p>
        )}
      </div>
    </section>
  )
}
