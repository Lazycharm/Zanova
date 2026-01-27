import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// PUT - Update crypto address
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { currency, address, network, label, qrCode, isActive } = body

    const cryptoAddress = await db.cryptoAddress.update({
      where: { id: params.id },
      data: {
        currency,
        address,
        network,
        label,
        qrCode,
        isActive,
      },
    })

    return NextResponse.json({
      message: 'Crypto address updated successfully',
      cryptoAddress,
    })
  } catch (error) {
    console.error('Update crypto address error:', error)
    return NextResponse.json(
      { message: 'Failed to update crypto address' },
      { status: 500 }
    )
  }
}

// DELETE - Delete crypto address
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await db.cryptoAddress.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: 'Crypto address deleted successfully',
    })
  } catch (error) {
    console.error('Delete crypto address error:', error)
    return NextResponse.json(
      { message: 'Failed to delete crypto address' },
      { status: 500 }
    )
  }
}
