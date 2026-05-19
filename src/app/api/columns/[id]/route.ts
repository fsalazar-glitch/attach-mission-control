import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getDatabase } from '@/lib/db'
import { columnsRepository } from '@/lib/columns'
import { requireRole } from '@/lib/auth'

const PatchSchema = z.object({
  name: z.string().min(3).max(30).optional(),
  isDone: z.boolean().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireRole(request, 'operator')
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = await params
  const parsed = PatchSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const repo = columnsRepository(getDatabase())
  if (parsed.data.name) repo.rename(id, parsed.data.name)
  if (parsed.data.isDone === true) repo.markDone(id)
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireRole(request, 'operator')
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = await params
  columnsRepository(getDatabase()).archive(id)
  return NextResponse.json({ ok: true })
}
