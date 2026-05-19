import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getDatabase } from '@/lib/db'
import { columnsRepository } from '@/lib/columns'
import { requireRole } from '@/lib/auth'

const ReorderSchema = z.object({ orderedIds: z.array(z.string()).min(1) })

export async function POST(request: NextRequest) {
  const auth = requireRole(request, 'operator')
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const parsed = ReorderSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  columnsRepository(getDatabase()).reorder(parsed.data.orderedIds)
  return NextResponse.json({ ok: true })
}
