import { useState, useCallback, useEffect, useRef } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import api from '../utils/api'

let nodeIdCounter = 1
function newNodeId() {
  return `node_${Date.now()}_${nodeIdCounter++}`
}
let edgeIdCounter = 1
function newEdgeId() {
  return `edge_${Date.now()}_${edgeIdCounter++}`
}

// Convert DB format → ReactFlow format
function toRFNodes(dbNodes) {
  return (dbNodes || []).map(n => ({
    id: n.node_id,
    type: n.node_type || 'default',
    position: { x: n.position_x ?? 0, y: n.position_y ?? 0 },
    data: { label: n.label || '' },
  }))
}

function toRFEdges(dbEdges) {
  return (dbEdges || []).map(e => ({
    id: e.edge_id,
    source: e.source_node_id,
    target: e.target_node_id,
    label: e.label || '',
    type: e.edge_type || 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed },
  }))
}

// Convert ReactFlow format → DB format
function toDBNodes(rfNodes) {
  return rfNodes.map(n => ({
    node_id: n.id,
    label: n.data?.label || '',
    position_x: n.position?.x ?? 0,
    position_y: n.position?.y ?? 0,
    node_type: n.type || 'default',
    style_json: null,
    description: null,
  }))
}

function toDBEdges(rfEdges) {
  return rfEdges.map(e => ({
    edge_id: e.id,
    source_node_id: e.source,
    target_node_id: e.target,
    label: e.label || '',
    edge_type: e.type || 'smoothstep',
    style_json: null,
  }))
}

// ─── Node Label Editor Panel ─────────────────────────────────────────────────
function NodePanel({ node, onUpdate, onDelete, onClose }) {
  const [label, setLabel] = useState(node.data.label)
  const [nodeType, setNodeType] = useState(node.type || 'default')

  return (
    <div style={panelStyles.panel}>
      <div style={panelStyles.header}>
        <span style={panelStyles.title}>Edit Node</span>
        <button onClick={onClose} style={panelStyles.closeBtn}>✕</button>
      </div>
      <div style={panelStyles.field}>
        <label style={panelStyles.label}>Label</label>
        <input
          style={panelStyles.input}
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="Node label"
          autoFocus
        />
      </div>
      <div style={panelStyles.field}>
        <label style={panelStyles.label}>Type</label>
        <select
          style={panelStyles.input}
          value={nodeType}
          onChange={e => setNodeType(e.target.value)}
        >
          <option value="default">Default</option>
          <option value="input">Input (Start)</option>
          <option value="output">Output (End)</option>
        </select>
      </div>
      <div style={panelStyles.actions}>
        <button
          style={panelStyles.saveBtn}
          onClick={() => { onUpdate(node.id, label, nodeType); onClose() }}
        >
          Apply
        </button>
        <button
          style={panelStyles.deleteBtn}
          onClick={() => { onDelete(node.id); onClose() }}
        >
          Delete Node
        </button>
      </div>
    </div>
  )
}

// ─── Edge Label Editor Panel ─────────────────────────────────────────────────
function EdgePanel({ edge, onUpdate, onDelete, onClose }) {
  const [label, setLabel] = useState(edge.label || '')

  return (
    <div style={panelStyles.panel}>
      <div style={panelStyles.header}>
        <span style={panelStyles.title}>Edit Edge</span>
        <button onClick={onClose} style={panelStyles.closeBtn}>✕</button>
      </div>
      <div style={panelStyles.field}>
        <label style={panelStyles.label}>Label (optional)</label>
        <input
          style={panelStyles.input}
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="e.g. Yes, No, or leave empty"
          autoFocus
        />
      </div>
      <div style={panelStyles.actions}>
        <button
          style={panelStyles.saveBtn}
          onClick={() => { onUpdate(edge.id, label); onClose() }}
        >
          Apply
        </button>
        <button
          style={panelStyles.deleteBtn}
          onClick={() => { onDelete(edge.id); onClose() }}
        >
          Delete Edge
        </button>
      </div>
    </div>
  )
}

// ─── Single Flowchart Editor ─────────────────────────────────────────────────
function SingleEditor({ flowchart, onBack, onSaved }) {
  const [nodes, setNodes] = useState(toRFNodes(flowchart.nodes))
  const [edges, setEdges] = useState(toRFEdges(flowchart.edges))
  const [selectedNode, setSelectedNode] = useState(null)
  const [selectedEdge, setSelectedEdge] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [title, setTitle] = useState(flowchart.title || '')
  const [description, setDescription] = useState(flowchart.description || '')

  const onNodesChange = useCallback(changes => setNodes(nds => applyNodeChanges(changes, nds)), [])
  const onEdgesChange = useCallback(changes => setEdges(eds => applyEdgeChanges(changes, eds)), [])

  const onConnect = useCallback(params => {
    setEdges(eds => addEdge({
      ...params,
      id: newEdgeId(),
      type: 'smoothstep',
      label: '',
      markerEnd: { type: MarkerType.ArrowClosed },
    }, eds))
  }, [])

  const addNode = () => {
    const id = newNodeId()
    setNodes(nds => [...nds, {
      id,
      type: 'default',
      position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
      data: { label: 'New Node' },
    }])
  }

  const updateNodeLabel = (id, label, type) => {
    setNodes(nds => nds.map(n => n.id === id
      ? { ...n, type, data: { ...n.data, label } }
      : n
    ))
  }

  const deleteNode = (id) => {
    setNodes(nds => nds.filter(n => n.id !== id))
    setEdges(eds => eds.filter(e => e.source !== id && e.target !== id))
  }

  const updateEdgeLabel = (id, label) => {
    setEdges(eds => eds.map(e => e.id === id ? { ...e, label } : e))
  }

  const deleteEdge = (id) => {
    setEdges(eds => eds.filter(e => e.id !== id))
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveMsg('')
    try {
      await api.put(`/admin/flowcharts/${flowchart.id}`, {
        title,
        description,
        is_active: flowchart.is_active ?? true,
        display_order: flowchart.display_order ?? 0,
        nodes: toDBNodes(nodes),
        edges: toDBEdges(edges),
      })
      setSaveMsg('Saved successfully!')
      onSaved()
      setTimeout(() => setSaveMsg(''), 3000)
    } catch (err) {
      setSaveMsg('Error: ' + (err.response?.data?.detail || 'Save failed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <button onClick={onBack} style={editorStyles.backBtn}>← Back to Flowcharts</button>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Flowchart title"
          style={{ ...editorStyles.titleInput, flex: 1 }}
        />
        <button onClick={addNode} style={editorStyles.addNodeBtn}>+ Add Node</button>
        <button onClick={handleSave} disabled={saving} style={editorStyles.saveBtn}>
          {saving ? 'Saving...' : 'Save Flowchart'}
        </button>
      </div>

      {saveMsg && (
        <div style={{
          padding: '0.6rem 1rem',
          borderRadius: '6px',
          background: saveMsg.startsWith('Error') ? '#3d1111' : '#113d11',
          color: saveMsg.startsWith('Error') ? '#ff6b6b' : '#6bff6b',
          fontSize: '0.85rem',
        }}>
          {saveMsg}
        </div>
      )}

      <div style={{ fontSize: '0.8rem', color: '#888' }}>
        Drag nodes to reposition · Click a node or edge to edit/delete · Drag from a node handle to connect
      </div>

      {/* Canvas */}
      <div style={{ height: '560px', border: '1px solid #333', borderRadius: '8px', position: 'relative', background: '#141414' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => { setSelectedEdge(null); setSelectedNode(node) }}
          onEdgeClick={(_, edge) => { setSelectedNode(null); setSelectedEdge(edge) }}
          onPaneClick={() => { setSelectedNode(null); setSelectedEdge(null) }}
          fitView
          deleteKeyCode="Delete"
        >
          <Background color="#333" gap={16} />
          <Controls />
          <MiniMap nodeColor="#ffde00" maskColor="rgba(0,0,0,0.4)" style={{ background: '#1a1a1a' }} />
        </ReactFlow>

        {/* Node edit panel */}
        {selectedNode && (
          <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
            <NodePanel
              node={selectedNode}
              onUpdate={updateNodeLabel}
              onDelete={deleteNode}
              onClose={() => setSelectedNode(null)}
            />
          </div>
        )}

        {/* Edge edit panel */}
        {selectedEdge && (
          <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
            <EdgePanel
              edge={selectedEdge}
              onUpdate={updateEdgeLabel}
              onDelete={deleteEdge}
              onClose={() => setSelectedEdge(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Flowchart Manager (list + create + edit) ────────────────────────────────
export default function FlowchartEditor() {
  const [flowcharts, setFlowcharts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null) // null = list view, number = editing that flowchart
  const [editingData, setEditingData] = useState(null)
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [createError, setCreateError] = useState('')

  const fetchList = useCallback(() => {
    setLoading(true)
    api.get('/admin/flowcharts')
      .then(res => {
        const items = Array.isArray(res.data) ? res.data : res.data?.items || []
        setFlowcharts(items)
      })
      .catch(() => setFlowcharts([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchList() }, [fetchList])

  const openEditor = async (fc) => {
    try {
      const res = await api.get(`/admin/flowcharts/${fc.id}`)
      setEditingData({
        ...res.data.flowchart,
        nodes: res.data.nodes,
        edges: res.data.edges,
      })
      setEditingId(fc.id)
    } catch {
      alert('Failed to load flowchart data.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this flowchart and all its nodes/edges?')) return
    try {
      await api.delete(`/admin/flowcharts/${id}`)
      fetchList()
    } catch {
      alert('Delete failed.')
    }
  }

  const handleCreate = async () => {
    if (!newTitle.trim()) { setCreateError('Title is required.'); return }
    setCreateError('')
    try {
      await api.post('/admin/flowcharts', {
        title: newTitle.trim(),
        description: newDesc.trim(),
        is_active: true,
        display_order: 0,
        nodes: [],
        edges: [],
      })
      setCreating(false)
      setNewTitle('')
      setNewDesc('')
      fetchList()
    } catch (err) {
      setCreateError(err.response?.data?.detail || 'Create failed.')
    }
  }

  // Editing view
  if (editingId && editingData) {
    return (
      <SingleEditor
        flowchart={editingData}
        onBack={() => { setEditingId(null); setEditingData(null); fetchList() }}
        onSaved={fetchList}
      />
    )
  }

  // List view
  return (
    <div style={{ background: '#1e1e1e', borderRadius: '12px', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button onClick={() => setCreating(true)} style={editorStyles.saveBtn}>+ New Flowchart</button>
      </div>

      {/* Create form */}
      {creating && (
        <div style={{ background: '#2a2a2a', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid #444' }}>
          <h3 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1rem' }}>Create New Flowchart</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              placeholder="Title *"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              style={editorStyles.input}
            />
            <input
              placeholder="Description (optional)"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              style={editorStyles.input}
            />
            {createError && <span style={{ color: '#ff6b6b', fontSize: '0.8rem' }}>{createError}</span>}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={handleCreate} style={editorStyles.saveBtn}>Create</button>
              <button onClick={() => { setCreating(false); setCreateError('') }} style={editorStyles.cancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: '#ccc' }}>Loading...</p>
      ) : flowcharts.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>No flowcharts yet. Create one above.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={editorStyles.th}>ID</th>
              <th style={editorStyles.th}>Title</th>
              <th style={editorStyles.th}>Active</th>
              <th style={editorStyles.th}>Order</th>
              <th style={editorStyles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {flowcharts.map(fc => (
              <tr key={fc.id} style={{ borderBottom: '1px solid #2a2a2a' }}>
                <td style={editorStyles.td}>{fc.id}</td>
                <td style={editorStyles.td}>{fc.title}</td>
                <td style={editorStyles.td}>
                  <span style={{ color: fc.is_active ? '#4caf50' : '#f44336' }}>
                    {fc.is_active ? 'Yes' : 'No'}
                  </span>
                </td>
                <td style={editorStyles.td}>{fc.display_order}</td>
                <td style={editorStyles.td}>
                  <button onClick={() => openEditor(fc)} style={editorStyles.editBtn}>Edit</button>
                  <button onClick={() => handleDelete(fc.id)} style={editorStyles.deleteBtn}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const panelStyles = {
  panel: { background: '#1e1e1e', border: '1px solid #444', borderRadius: '8px', padding: '1rem', minWidth: '220px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
  title: { color: '#fff', fontWeight: 600, fontSize: '0.9rem' },
  closeBtn: { background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1rem', padding: '0 0.25rem' },
  field: { marginBottom: '0.75rem' },
  label: { display: 'block', color: '#bbb', fontSize: '0.75rem', marginBottom: '0.3rem' },
  input: { width: '100%', background: '#2a2a2a', border: '1px solid #444', borderRadius: '4px', padding: '0.5rem', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' },
  actions: { display: 'flex', gap: '0.5rem', marginTop: '0.5rem' },
  saveBtn: { background: '#ffde00', color: '#000', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 },
  deleteBtn: { background: '#ff4444', color: '#fff', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
}

const editorStyles = {
  backBtn: { background: '#333', color: '#ccc', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' },
  addNodeBtn: { background: '#2a4a2a', color: '#6bff6b', border: '1px solid #3a6a3a', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' },
  saveBtn: { background: '#ffde00', color: '#000', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, whiteSpace: 'nowrap' },
  cancelBtn: { background: '#333', color: '#ccc', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  titleInput: { background: '#2a2a2a', border: '1px solid #444', borderRadius: '6px', padding: '0.5rem 0.85rem', color: '#fff', fontSize: '1rem', fontWeight: 600, minWidth: '200px' },
  input: { background: '#1a1a1a', border: '1px solid #444', borderRadius: '6px', padding: '0.6rem 0.85rem', color: '#fff', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' },
  th: { textAlign: 'left', padding: '0.75rem', color: '#999', borderBottom: '1px solid #333', fontSize: '0.8rem', textTransform: 'uppercase' },
  td: { padding: '0.75rem', color: '#ddd', fontSize: '0.9rem' },
  editBtn: { background: '#ffde00', color: '#000', border: 'none', padding: '0.3rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 },
  deleteBtn: { background: '#ff4444', color: '#fff', border: 'none', padding: '0.3rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', marginLeft: '0.5rem' },
}
