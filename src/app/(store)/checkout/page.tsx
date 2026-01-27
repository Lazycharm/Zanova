import { Suspense } from 'react'
import { CheckoutClient } from './checkout-client'

export const metadata = {
  title: 'Checkout - ZANOVA',
  description: 'Complete your order',
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutClient />
    </Suspense>
  )
}
