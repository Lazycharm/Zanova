import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { MerchantAgreementClient } from './merchant-agreement-client'

export const metadata = {
  title: 'Merchant Agreement - ZALORA',
  description: 'Merchant agreement and terms for sellers on ZALORA',
}

async function getMerchantAgreementPage() {
  // Try to get from CMS pages first
  const page = await db.page.findUnique({
    where: { slug: 'merchant-agreement' },
  })

  // If not found, return default content
  if (!page || !page.isActive) {
    return {
      title: 'Merchant Agreement',
      content: `
        <h1>Merchant Agreement</h1>
        <p>Welcome to ZALORA Fashion's Merchant Program. By becoming a merchant on our platform, you agree to the following terms and conditions.</p>
        
        <h2>1. Merchant Eligibility</h2>
        <p>To become a merchant, you must:</p>
        <ul>
          <li>Be at least 18 years old</li>
          <li>Have a valid business license (where applicable)</li>
          <li>Provide accurate business information</li>
          <li>Comply with all local and international laws</li>
        </ul>
        
        <h2>2. Product Listings</h2>
        <p>Merchants are responsible for:</p>
        <ul>
          <li>Accurate product descriptions and images</li>
          <li>Maintaining adequate stock levels</li>
          <li>Setting competitive prices</li>
          <li>Ensuring product quality and authenticity</li>
        </ul>
        
        <h2>3. Commission Structure</h2>
        <p>ZALORA charges a commission on each sale:</p>
        <ul>
          <li>Standard commission: 6% of sale price</li>
          <li>Premium merchants: Negotiable rates</li>
          <li>Commission is deducted from payment</li>
        </ul>
        
        <h2>4. Payment Terms</h2>
        <p>Payments are processed weekly:</p>
        <ul>
          <li>Payments issued every Monday</li>
          <li>Minimum payout threshold: $50</li>
          <li>Payment methods: Bank transfer, crypto wallet</li>
        </ul>
        
        <h2>5. Responsibilities</h2>
        <p>Merchants must:</p>
        <ul>
          <li>Fulfill orders within stated timeframes</li>
          <li>Handle customer service inquiries</li>
          <li>Process returns and refunds according to policy</li>
          <li>Maintain high customer satisfaction ratings</li>
        </ul>
        
        <h2>6. Prohibited Items</h2>
        <p>The following items are not allowed:</p>
        <ul>
          <li>Counterfeit or replica products</li>
          <li>Illegal or restricted items</li>
          <li>Items that violate intellectual property rights</li>
          <li>Hazardous materials</li>
        </ul>
        
        <h2>7. Termination</h2>
        <p>ZALORA reserves the right to suspend or terminate merchant accounts for:</p>
        <ul>
          <li>Violation of terms and conditions</li>
          <li>Poor customer service ratings</li>
          <li>Fraudulent activity</li>
          <li>Non-compliance with policies</li>
        </ul>
        
        <h2>8. Contact</h2>
        <p>For questions about this agreement, please contact our merchant support team at <a href="mailto:merchants@zalora.com">merchants@zalora.com</a></p>
      `,
    }
  }

  return page
}

export default async function MerchantAgreementPage() {
  const page = await getMerchantAgreementPage()

  return <MerchantAgreementClient page={page} />
}
