import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET active crypto addresses for checkout
export async function GET() {
  try {
    const addresses = await db.cryptoAddress.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        currency: 'asc',
      },
      select: {
        id: true,
        currency: true,
        address: true,
        network: true,
        label: true,
        qrCode: true,
      },
    })

    return NextResponse.json({ addresses })
  } catch (error) {
    console.error('Fetch crypto addresses error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch crypto addresses' },
      { status: 500 }
    )
  }
}
