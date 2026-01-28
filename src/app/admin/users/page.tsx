import { db } from '@/lib/db'
import { UsersClient } from './users-client'

export const dynamic = 'force-dynamic'

interface SearchParams {
  page?: string
  search?: string
  role?: string
  status?: string
}

async function getUsers(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}

  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: 'insensitive' } },
      { email: { contains: searchParams.search, mode: 'insensitive' } },
    ]
  }

  if (searchParams.role) {
    where.role = searchParams.role
  }

  if (searchParams.status) {
    where.status = searchParams.status
  }

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        status: true,
        balance: true,
        canSell: true,
        lastLoginAt: true,
        lastLoginIp: true,
        createdAt: true,
        shop: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    }),
    db.user.count({ where }),
  ])

  return {
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      avatar: u.avatar,
      role: u.role,
      status: u.status,
      balance: Number(u.balance),
      canSell: u.canSell,
      lastLoginAt: u.lastLoginAt?.toISOString() || null,
      shop: u.shop ? {
        id: u.shop.id,
        name: u.shop.name,
        status: u.shop.status,
      } : null,
    })),
    total,
    pages: Math.ceil(total / limit),
    page,
  }
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const data = await getUsers(searchParams)
  return <UsersClient {...data} searchParams={searchParams} />
}
