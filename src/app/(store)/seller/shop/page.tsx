import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { ShopDetailsClient } from './shop-client'

export const dynamic = 'force-dynamic'

async function getShopStats(shopId: string, shop: { followers: number; totalSales: number }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Get all orders for this shop
  const allOrders = await db.order.findMany({
    where: {
      items: {
        some: {
          product: {
            shopId,
          },
        },
      },
    },
    include: {
      items: {
        where: {
          product: {
            shopId,
          },
        },
        include: {
          product: {
            select: {
              costPrice: true,
            },
          },
        },
      },
    },
  })

  // Calculate today's orders
  const todayOrders = allOrders.filter(
    (order) => order.createdAt >= today && order.createdAt < tomorrow
  )

  // Calculate today's sales
  const todaySales = todayOrders.reduce((sum, order) => {
    const shopItemsTotal = order.items.reduce((itemSum, item) => itemSum + Number(item.price) * item.quantity, 0)
    return sum + shopItemsTotal
  }, 0)

  // Calculate today's profit
  const todayProfit = todayOrders.reduce((sum, order) => {
    const shopItemsProfit = order.items.reduce((itemSum, item) => {
      const costPrice = item.product.costPrice ? Number(item.product.costPrice) : 0
      const profit = (Number(item.price) - costPrice) * item.quantity
      return itemSum + profit
    }, 0)
    return sum + shopItemsProfit
  }, 0)

  // Calculate total sales
  const totalSales = allOrders.reduce((sum, order) => {
    const shopItemsTotal = order.items.reduce((itemSum, item) => itemSum + Number(item.price) * item.quantity, 0)
    return sum + shopItemsTotal
  }, 0)

  // Calculate total profit
  const totalProfit = allOrders.reduce((sum, order) => {
    const shopItemsProfit = order.items.reduce((itemSum, item) => {
      const costPrice = item.product.costPrice ? Number(item.product.costPrice) : 0
      const profit = (Number(item.price) - costPrice) * item.quantity
      return itemSum + profit
    }, 0)
    return sum + shopItemsProfit
  }, 0)

  // Get followers count - always use stored value from shop (admin can edit this)
  // If admin hasn't set it yet, it will be 0, which is fine
  const followersCount = shop.followers

  // Use stored totalSales from shop if available, otherwise use calculated value
  const finalTotalSales = shop.totalSales > 0 ? shop.totalSales : totalSales

  // Calculate credit score (based on rating, order completion rate, etc.)
  const completedOrders = allOrders.filter((o) => o.status === 'DELIVERED').length
  const orderCompletionRate = allOrders.length > 0 ? (completedOrders / allOrders.length) * 100 : 0
  const creditScore = Math.min(100, Math.round(Number(orderCompletionRate) + (allOrders.length > 0 ? 20 : 0)))

  return {
    todayOrders: todayOrders.length,
    cumulativeOrders: allOrders.length,
    todaySales,
    totalSales: finalTotalSales,
    todayProfit,
    totalProfit,
    followersCount,
    creditScore,
  }
}

export default async function ShopDetailsPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/auth/login')
  }

  if (!currentUser.canSell) {
    redirect('/account')
  }

  const user = await db.user.findUnique({
    where: { id: currentUser.id },
    include: {
      shop: {
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      },
    },
  })

  if (!user?.shop) {
    redirect('/seller/create-shop')
  }

  const stats = await getShopStats(user.shop.id, user.shop)

  // Convert Decimal fields to numbers for client component
  const shopData = {
    ...user.shop,
    balance: Number(user.shop.balance),
    rating: Number(user.shop.rating),
    commissionRate: Number(user.shop.commissionRate),
    followers: user.shop.followers,
    totalSales: user.shop.totalSales,
  }

  return <ShopDetailsClient shop={shopData} stats={stats} />
}
