/* attach-os override — CRUD for editable kanban columns */
import type Database from 'better-sqlite3'

export interface BoardColumn {
  id: string
  name: string
  position: number
  isDone: boolean
  color?: string
  archived: boolean
  createdAt: number
  updatedAt: number
}

const rowToColumn = (r: Record<string, unknown>): BoardColumn => ({
  id: r.id as string,
  name: r.name as string,
  position: r.position as number,
  isDone: Boolean(r.is_done),
  color: (r.color as string | null) ?? undefined,
  archived: Boolean(r.archived),
  createdAt: r.created_at as number,
  updatedAt: r.updated_at as number,
})

export function columnsRepository(db: Database.Database) {
  return {
    create(input: { id: string; name: string; isDone?: boolean; color?: string }): BoardColumn {
      if (input.name.length < 3 || input.name.length > 30) throw new Error('Name must be 3-30 chars')
      const next = (db.prepare('SELECT COALESCE(MAX(position), -1) + 1 AS p FROM board_columns WHERE archived = 0').get() as { p: number }).p
      db.prepare(`INSERT INTO board_columns (id, name, position, is_done, color) VALUES (?, ?, ?, ?, ?)`)
        .run(input.id, input.name, next, input.isDone ? 1 : 0, input.color ?? null)
      return rowToColumn(db.prepare('SELECT * FROM board_columns WHERE id = ?').get(input.id) as Record<string, unknown>)
    },

    rename(id: string, name: string): BoardColumn {
      if (name.length < 3 || name.length > 30) throw new Error('Name must be 3-30 chars')
      db.prepare(`UPDATE board_columns SET name = ?, updated_at = unixepoch() WHERE id = ?`).run(name, id)
      return rowToColumn(db.prepare('SELECT * FROM board_columns WHERE id = ?').get(id) as Record<string, unknown>)
    },

    reorder(orderedIds: string[]): void {
      db.transaction((ids: string[]) => {
        ids.forEach((id, i) => db.prepare(`UPDATE board_columns SET position = ?, updated_at = unixepoch() WHERE id = ?`).run(i, id))
      })(orderedIds)
    },

    archive(id: string): void {
      db.prepare(`UPDATE board_columns SET archived = 1, updated_at = unixepoch() WHERE id = ?`).run(id)
    },

    markDone(id: string): void {
      db.transaction(() => {
        db.prepare(`UPDATE board_columns SET is_done = 0`).run()
        db.prepare(`UPDATE board_columns SET is_done = 1, updated_at = unixepoch() WHERE id = ?`).run(id)
      })()
    },

    listActive(): BoardColumn[] {
      return (db.prepare(`SELECT * FROM board_columns WHERE archived = 0 ORDER BY position ASC`).all() as Record<string, unknown>[]).map(rowToColumn)
    },

    listAll(): BoardColumn[] {
      return (db.prepare(`SELECT * FROM board_columns ORDER BY position ASC`).all() as Record<string, unknown>[]).map(rowToColumn)
    },

    findDone(): BoardColumn | null {
      const row = db.prepare(`SELECT * FROM board_columns WHERE is_done = 1 AND archived = 0 LIMIT 1`).get() as Record<string, unknown> | undefined
      return row ? rowToColumn(row) : null
    },
  }
}
