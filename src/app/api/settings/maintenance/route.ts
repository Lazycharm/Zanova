import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const setting = await db.setting.findUnique({
      where: { key: 'maintenance_mode' },
    })

    return NextResponse.json({ enabled: setting?.value === 'true' })
  } catch (error) {
    return NextResponse.json({ enabled: false })
  }
}

export const dynamic = 'force-dynamic'
