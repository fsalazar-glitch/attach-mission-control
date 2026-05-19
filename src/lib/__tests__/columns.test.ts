import { describe, it, expect, beforeEach } from 'vitest'
import Database from 'better-sqlite3'
import { columnsRepository } from '../columns'

let db: Database.Database

beforeEach(() => {
  db = new Database(':memory:')
  db.exec(`
    CREATE TABLE board_columns (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      position INTEGER NOT NULL,
      is_done INTEGER NOT NULL DEFAULT 0,
      color TEXT,
      archived INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
  `)
})

describe('columnsRepository', () => {
  it('creates a column at next position', () => {
    const repo = columnsRepository(db)
    const col = repo.create({ id: 'inbox', name: 'Inbox' })
    expect(col).toMatchObject({ id: 'inbox', name: 'Inbox', position: 0, isDone: false, archived: false })
  })

  it('rejects duplicate id', () => {
    const repo = columnsRepository(db)
    repo.create({ id: 'inbox', name: 'Inbox' })
    expect(() => repo.create({ id: 'inbox', name: 'Other' })).toThrow()
  })

  it('rejects name shorter than 3 chars', () => {
    const repo = columnsRepository(db)
    expect(() => repo.create({ id: 'x', name: 'Hi' })).toThrow(/3-30/)
  })

  it('renames column', () => {
    const repo = columnsRepository(db)
    repo.create({ id: 'inbox', name: 'Inbox' })
    const updated = repo.rename('inbox', 'Backlog')
    expect(updated.name).toBe('Backlog')
  })

  it('reorders columns', () => {
    const repo = columnsRepository(db)
    repo.create({ id: 'a', name: 'A Col' })
    repo.create({ id: 'b', name: 'B Col' })
    repo.create({ id: 'c', name: 'C Col' })
    repo.reorder(['c', 'a', 'b'])
    const ordered = repo.listActive()
    expect(ordered.map(c => c.id)).toEqual(['c', 'a', 'b'])
  })

  it('archives a column', () => {
    const repo = columnsRepository(db)
    repo.create({ id: 'inbox', name: 'Inbox' })
    repo.archive('inbox')
    expect(repo.listActive()).toHaveLength(0)
    expect(repo.listAll()).toHaveLength(1)
  })

  it('marks a column as done (only one at a time)', () => {
    const repo = columnsRepository(db)
    repo.create({ id: 'done1', name: 'Done 1' })
    repo.create({ id: 'done2', name: 'Done 2' })
    repo.markDone('done1')
    repo.markDone('done2')
    expect(repo.findDone()?.id).toBe('done2')
  })
})
