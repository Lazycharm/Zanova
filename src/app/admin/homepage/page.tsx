import { db } from '@/lib/db'
import { HomepageClient } from './homepage-client'

export const dynamic = 'force-dynamic'

async function getHomepageData() {
  const heroSlides = await db.heroSlide.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  return { heroSlides }
}

export default async function AdminHomepage() {
  const { heroSlides } = await getHomepageData()

  return <HomepageClient heroSlides={heroSlides} />
}
