import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { Header } from '@/components/layout/header'
import { BottomNav } from '@/components/layout/bottom-nav'
import { ChatWidget } from '@/components/layout/chat-widget'
import { SearchModal } from '@/components/search-modal'

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-20 lg:pb-0">
        {children}
      </main>
      <BottomNav />
      <ChatWidget />
      <SearchModal />
    </div>
  )
}
