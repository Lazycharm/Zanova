'use client'

import { Icon } from '@iconify/react'
import { Card, CardContent } from '@/components/ui/card'

export default function ShopsPage() {
  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl font-bold font-heading">Shops</h1>
        <p className="text-muted-foreground">Manage multi-vendor shops</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Icon icon="solar:shop-linear" className="size-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium mb-2">Shop Management</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Approve, manage, and monitor vendor shops. Control commissions and shop settings. This feature is coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
