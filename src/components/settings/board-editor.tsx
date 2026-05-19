/* attach-os override — UI for editing kanban columns */
'use client'

import { useEffect, useState } from 'react'

interface BoardColumn { id: string; name: string; position: number; isDone: boolean; archived: boolean }

const inputCls = 'rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50'

export function BoardEditor() {
  const [columns, setColumns] = useState<BoardColumn[]>([])
  const [newName, setNewName] = useState('')
  const [newId, setNewId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/columns').then(r => r.json()).then((d: { columns?: BoardColumn[] }) => { setColumns(d.columns ?? []); setLoading(false) })
  }, [])

  const addColumn = async () => {
    if (newName.length < 3 || newId.length < 2) return
    const r = await fetch('/api/columns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: newId.toLowerCase().replace(/[^a-z0-9_]/g, '_'), name: newName }),
    })
    if (r.ok) {
      const d = await r.json() as { column: BoardColumn }
      setColumns(prev => [...prev, d.column])
      setNewName(''); setNewId('')
    }
  }

  const renameColumn = async (id: string, name: string) => {
    if (name.length < 3) return
    await fetch(`/api/columns/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
    setColumns(prev => prev.map(c => c.id === id ? { ...c, name } : c))
  }

  const archiveColumn = async (id: string) => {
    if (!confirm('Archivar esta columna?')) return
    await fetch(`/api/columns/${id}`, { method: 'DELETE' })
    setColumns(prev => prev.filter(c => c.id !== id))
  }

  const markDone = async (id: string) => {
    await fetch(`/api/columns/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isDone: true }) })
    setColumns(prev => prev.map(c => ({ ...c, isDone: c.id === id })))
  }

  if (loading) return <p className="text-muted-foreground text-sm">Cargando...</p>

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Columnas del board</h2>
        <p className="text-sm text-muted-foreground mt-1">Edita, reordena o archiva columnas del Kanban.</p>
      </div>

      <div className="space-y-2">
        {columns.sort((a, b) => a.position - b.position).map(col => (
          <div key={col.id} className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
            <span className="text-muted-foreground text-xs w-6 text-center">{col.position + 1}</span>
            <input
              className={`${inputCls} flex-1 h-8`}
              defaultValue={col.name}
              onBlur={(e: React.FocusEvent<HTMLInputElement>) => { if (e.target.value !== col.name) renameColumn(col.id, e.target.value) }}
            />
            <button
              onClick={() => markDone(col.id)}
              title={col.isDone ? 'Columna de cierre' : 'Marcar como columna de cierre'}
              className={`text-xs px-2 py-1 rounded-md border transition-colors ${col.isDone ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border hover:border-primary/50'}`}
            >
              done
            </button>
            <button
              onClick={() => archiveColumn(col.id)}
              title={`Archivar ${col.name}`}
              className="text-muted-foreground hover:text-destructive transition-colors text-sm px-2"
            >
              x
            </button>
          </div>
        ))}
      </div>

      <div className="border-t pt-6 space-y-3">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Nueva columna</p>
        <div className="flex gap-2">
          <input
            className={`${inputCls} w-[140px]`}
            placeholder="ID (slug)"
            value={newId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewId(e.target.value)}
          />
          <input
            className={`${inputCls} flex-1`}
            placeholder="Nombre visible"
            value={newName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)}
          />
          <button
            onClick={addColumn}
            disabled={newName.length < 3 || newId.length < 2}
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  )
}
