import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

// GET all crypto addresses
export async function GET() {
  try {

    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'MANAGER')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const addresses = await db.cryptoAddress.findMany({
      orderBy: {
        createdAt: 'desc',
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

// POST - Create new crypto address
export async function POST(request: NextRequest) {
  try {

    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json()
    const { currency, address, network, label, qrCode, isActive } = body

    if (!currency || !address) {
      return NextResponse.json(
        { message: 'Currency and address are required' },
        { status: 400 }
      )
    }

    const cryptoAddress = await db.cryptoAddress.create({
      data: {
        currency,
        address,
        network,
        label,
        qrCode,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json({
      message: 'Crypto address created successfully',
      cryptoAddress,
    })
  } catch (error) {
    console.error('Create crypto address error:', error)
    return NextResponse.json(
      { message: 'Failed to create crypto address' },
      { status: 500 }
    )
  }
}
