/* attach-os override — REST API for board columns */
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getDatabase } from '@/lib/db'
import { columnsRepository } from '@/lib/columns'
import { requireRole } from '@/lib/auth'

const CreateSchema = z.object({
  id: z.string().min(2).max(30).regex(/^[a-z0-9_]+$/),
  name: z.string().min(3).max(30),
  isDone: z.boolean().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
})

export async function GET(request: NextRequest) {
  const auth = requireRole(request, 'viewer')
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const repo = columnsRepository(getDatabase())
  return NextResponse.json({ columns: repo.listActive() })
}

export async function POST(request: NextRequest) {
  const auth = requireRole(request, 'operator')
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const parsed = CreateSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const repo = columnsRepository(getDatabase())
  try {
    const created = repo.create(parsed.data)
    return NextResponse.json({ column: created }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 409 })
  }
}
