import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { Header } from '@/components/layout/header'
import { StoreSidebar } from '@/components/layout/store-sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { ChatWidget } from '@/components/layout/chat-widget'
import { SearchModal } from '@/components/search-modal'
import { AuthSync } from '@/components/auth-sync'

// Cache maintenance check - only check every 5 minutes
let maintenanceCache: { value: boolean; timestamp: number } | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

async function checkMaintenance() {
  const now = Date.now()
  
  // Return cached value if still valid
  if (maintenanceCache && (now - maintenanceCache.timestamp) < CACHE_DURATION) {
    return maintenanceCache.value
  }
  
  try {
    const setting = await db.setting.findUnique({
      where: { key: 'maintenance_mode' },
    })
    const isMaintenanceMode = setting?.value === 'true'
    
    // Update cache
    maintenanceCache = { value: isMaintenanceMode, timestamp: now }
    
    return isMaintenanceMode
  } catch {
    return false
  }
}

async function getCategories() {
  try {
    const categories = await db.category.findMany({
      where: {
        isActive: true,
        parentId: null,
      },
      orderBy: { sortOrder: 'asc' },
      take: 15,
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        image: true,
      },
    })
    return categories
  } catch {
    return []
  }
}

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check maintenance mode (cached for 60 seconds)
  const isMaintenanceMode = await checkMaintenance()
  
  if (isMaintenanceMode) {
    redirect('/maintenance')
  }

  // Fetch categories for sidebar
  const categories = await getCategories()

  return (
    <div className="h-screen bg-gray-50/30 flex flex-col overflow-hidden">
      <AuthSync />
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <StoreSidebar categories={categories} />
        <main className="flex-1 lg:ml-64 pb-20 lg:pb-0 bg-white overflow-y-auto">
          {children}
        </main>
      </div>
      <BottomNav />
      <ChatWidget />
      <SearchModal />
    </div>
  )
}
