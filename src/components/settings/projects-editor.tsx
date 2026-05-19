/* attach-os override — UI for editing Attach Group projects/brands */
'use client'

import { useEffect, useState } from 'react'

interface Project {
  id: number
  name: string
  ticket_prefix: string
  slug: string
  status: string
  color?: string
}

const inputCls = 'rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50'

export function ProjectsEditor() {
  const [projects, setProjects] = useState<Project[]>([])
  const [newName, setNewName] = useState('')
  const [newPrefix, setNewPrefix] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/projects').then(r => r.json()).then((d: { projects?: Project[] }) => {
      setProjects((d.projects ?? []).filter((p: Project) => p.status === 'active'))
      setLoading(false)
    })
  }, [])

  const addProject = async () => {
    if (newName.length < 2 || newPrefix.length < 2) return
    const r = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newName,
        ticket_prefix: newPrefix.toUpperCase().replace(/[^A-Z0-9]/g, ''),
        slug: newName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
      }),
    })
    if (r.ok) {
      const d = await r.json() as { project: Project }
      setProjects(prev => [...prev, d.project])
      setNewName(''); setNewPrefix('')
    }
  }

  const archiveProject = async (id: number) => {
    if (!confirm('Archivar este proyecto?')) return
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  if (loading) return <p className="text-muted-foreground text-sm">Cargando...</p>

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Marcas / Proyectos</h2>
        <p className="text-sm text-muted-foreground mt-1">Gestiona las marcas de Attach Group. Cada proyecto tiene un prefijo unico para tickets.</p>
      </div>

      <div className="space-y-2">
        {projects.map(project => (
          <div key={project.id} className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
            <div
              className="w-8 h-8 rounded-lg shrink-0"
              style={{ background: project.color ?? '#223ED7' }}
              aria-hidden="true"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{project.name}</p>
              <p className="text-xs text-muted-foreground">{project.ticket_prefix}</p>
            </div>
            <button
              onClick={() => archiveProject(project.id)}
              title={`Archivar ${project.name}`}
              className="text-muted-foreground hover:text-destructive transition-colors text-sm shrink-0 px-2"
            >
              x
            </button>
          </div>
        ))}
      </div>

      <div className="border-t pt-6 space-y-3">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Nuevo proyecto</p>
        <div className="flex gap-2">
          <input
            className={`${inputCls} w-[140px]`}
            placeholder="Prefijo (ej. GALILEO)"
            value={newPrefix}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPrefix(e.target.value)}
          />
          <input
            className={`${inputCls} flex-1`}
            placeholder="Nombre visible"
            value={newName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)}
          />
          <button
            onClick={addProject}
            disabled={newName.length < 2 || newPrefix.length < 2}
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Agregar
          </button>
        </div>
        <p className="text-xs text-muted-foreground">El prefijo se usara en tickets: GALILEO-001, GALILEO-002...</p>
      </div>
    </div>
  )
}
