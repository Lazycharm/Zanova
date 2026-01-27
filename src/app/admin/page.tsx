import { db } from '@/lib/db'
import { AdminDashboardClient } from './dashboard-client'

async function getDashboardStats() {
  const [
    totalUsers,
    totalOrders,
    totalProducts,
    totalRevenue,
    pendingOrders,
    activeShops,
    openTickets,
    recentOrders,
  ] = await Promise.all([
    db.user.count(),
    db.order.count(),
    db.product.count(),
    db.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: 'COMPLETED' },
    }),
    db.order.count({ where: { status: 'PENDING_PAYMENT' } }),
    db.shop.count({ where: { status: 'ACTIVE' } }),
    db.supportTicket.count({ where: { status: 'OPEN' } }),
    db.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
  ])

  return {
    totalUsers,
    totalOrders,
    totalProducts,
    totalRevenue: totalRevenue._sum.total || 0,
    pendingOrders,
    activeShops,
    openTickets,
    recentOrders: recentOrders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      userName: order.user.name,
      total: Number(order.total),
      status: order.status,
    })),
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()
  return <AdminDashboardClient stats={stats} />
}
