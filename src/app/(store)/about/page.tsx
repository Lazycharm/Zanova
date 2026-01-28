import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { AboutPageClient } from './about-client'

// Avoid prerender-time DB access on deploy/build environments.
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'About Us - ZALORA',
  description: 'Learn more about ZALORA Fashion and our mission',
}

async function getAboutPage() {
  const page = await db.page.findUnique({
    where: { slug: 'about' },
  })

  return page
}

export default async function AboutPage() {
  const page = await getAboutPage()

  if (!page || !page.isActive) {
    notFound()
  }

  return <AboutPageClient page={page} />
}
