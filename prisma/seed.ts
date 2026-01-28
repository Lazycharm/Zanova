import { PrismaClient, UserRole, UserStatus, ProductStatus, ShopStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create admin user
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@zalora.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@zalora.com',
      password: adminPassword,
      name: 'Admin',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      canSell: true,
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // Create demo user
  const userPassword = await bcrypt.hash('user123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'user@zalora.com' },
    update: {},
    create: {
      email: 'user@zalora.com',
      password: userPassword,
      name: 'Demo User',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      canSell: false,
      balance: 100,
    },
  })
  console.log('✅ Demo user created:', user.email)

  // Create demo seller
  const sellerPassword = await bcrypt.hash('seller123', 12)
  const seller = await prisma.user.upsert({
    where: { email: 'seller@zalora.com' },
    update: {},
    create: {
      email: 'seller@zalora.com',
      password: sellerPassword,
      name: 'Demo Seller',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      canSell: true,
      balance: 500,
    },
  })
  console.log('✅ Demo seller created:', seller.email)

  // Create seller's shop
  const shop = await prisma.shop.upsert({
    where: { userId: seller.id },
    update: {},
    create: {
      userId: seller.id,
      name: 'Fashion Hub',
      slug: 'fashion-hub',
      description: 'Premium fashion items for everyone',
      status: ShopStatus.ACTIVE,
    },
  })
  console.log('✅ Demo shop created:', shop.name)

  // Create categories
  const categories = [
    { name: 'Lifestyle', slug: 'lifestyle', icon: 'solar:gift-bold', showOnHome: true },
    { name: 'Men Shoes', slug: 'men-shoes', icon: 'mdi:shoe-formal', showOnHome: true },
    { name: 'Women Shoes', slug: 'women-shoes', icon: 'mdi:shoe-heel', showOnHome: true },
    { name: 'Accessories', slug: 'accessories', icon: 'solar:glasses-bold', showOnHome: true },
    { name: 'Men Clothing', slug: 'men-clothing', icon: 'solar:t-shirt-bold', showOnHome: true },
    { name: 'Women Bags', slug: 'women-bags', icon: 'solar:bag-3-bold', showOnHome: true },
    { name: 'Men Bags', slug: 'men-bags', icon: 'solar:case-minimalistic-bold', showOnHome: true },
    { name: 'Women Clothing', slug: 'women-clothing', icon: 'mdi:dress', showOnHome: true },
    { name: 'Girls', slug: 'girls', icon: 'solar:user-bold', showOnHome: true },
    { name: 'Boys', slug: 'boys', icon: 'solar:user-bold', showOnHome: true },
    { name: 'Electronics', slug: 'electronics', icon: 'solar:laptop-bold', showOnHome: true },
    { name: 'Home & Garden', slug: 'home-garden', icon: 'solar:home-smile-bold', showOnHome: true },
  ]

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i]
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        ...cat,
        sortOrder: i,
        isActive: true,
      },
    })
  }
  console.log('✅ Categories created:', categories.length)

  // Get category IDs
  const menShoesCategory = await prisma.category.findUnique({ where: { slug: 'men-shoes' } })
  const menClothingCategory = await prisma.category.findUnique({ where: { slug: 'men-clothing' } })
  const accessoriesCategory = await prisma.category.findUnique({ where: { slug: 'accessories' } })

  // Create sample products
  const products = [
    {
      name: 'Nike Air Zoom Pegasus 39 Running Shoe',
      slug: 'nike-air-zoom-pegasus-39',
      description: 'Experience responsive cushioning in the Nike Air Zoom Pegasus 39. This running shoe features a breathable mesh upper and Nike Zoom Air units for a springy feel.',
      shortDesc: 'Premium running shoe with Zoom Air cushioning',
      price: 120,
      comparePrice: 160,
      stock: 50,
      categoryId: menShoesCategory!.id,
      shopId: shop.id,
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      rating: 4.8,
      totalReviews: 1200,
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'],
    },
    {
      name: 'Essential Cotton Crew Neck T-Shirt Black',
      slug: 'essential-cotton-tshirt-black',
      description: 'A wardrobe essential. This classic crew neck t-shirt is made from 100% organic cotton for all-day comfort.',
      shortDesc: 'Classic organic cotton t-shirt',
      price: 25,
      comparePrice: 30,
      stock: 200,
      categoryId: menClothingCategory!.id,
      shopId: shop.id,
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      rating: 4.5,
      totalReviews: 850,
      images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80'],
    },
    {
      name: 'Urban Explorer Waterproof Backpack',
      slug: 'urban-explorer-backpack',
      description: 'The perfect companion for urban adventures. Features waterproof material, laptop compartment, and multiple pockets.',
      shortDesc: 'Waterproof backpack with laptop compartment',
      price: 89,
      comparePrice: null,
      stock: 75,
      categoryId: accessoriesCategory!.id,
      shopId: shop.id,
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      rating: 4.9,
      totalReviews: 230,
      images: ['https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&q=80'],
    },
    {
      name: 'Classic Aviator Sunglasses Gold Frame',
      slug: 'classic-aviator-sunglasses-gold',
      description: 'Timeless aviator style with UV400 protection. Gold metal frame with gradient lenses.',
      shortDesc: 'UV400 aviator sunglasses',
      price: 145,
      comparePrice: 160,
      stock: 100,
      categoryId: accessoriesCategory!.id,
      shopId: shop.id,
      status: ProductStatus.PUBLISHED,
      isFeatured: true,
      rating: 4.7,
      totalReviews: 500,
      images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80'],
    },
  ]

  for (const product of products) {
    const images = product.images
    const { images: _, ...productData } = product

    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...productData,
        sku: `SKU-${product.slug.toUpperCase().replace(/-/g, '')}`,
      },
    })

    // Create product images
    for (let i = 0; i < images.length; i++) {
      await prisma.productImage.upsert({
        where: {
          id: `img-${created.id}-${i}`,
        },
        update: {},
        create: {
          id: `img-${created.id}-${i}`,
          productId: created.id,
          url: images[i],
          isPrimary: i === 0,
          sortOrder: i,
        },
      })
    }
  }
  console.log('✅ Products created:', products.length)

  // Create hero slides
  const heroSlides = [
    {
      title: 'The Icon Event',
      subtitle: 'Iconic Style. Curated For You.',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80',
      ctaText: 'Shop Now',
      ctaLink: '/products',
      sortOrder: 0,
      isActive: true,
    },
    {
      title: 'New Arrivals',
      subtitle: 'Fresh styles for the new season',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80',
      ctaText: 'Explore',
      ctaLink: '/products?sort=newest',
      sortOrder: 1,
      isActive: true,
    },
  ]

  for (const slide of heroSlides) {
    await prisma.heroSlide.create({
      data: slide,
    })
  }
  console.log('✅ Hero slides created:', heroSlides.length)

  // Create default settings
  const settings = [
    { key: 'site_name', value: 'ZALORA', type: 'string' },
    { key: 'site_description', value: 'Premium Fashion & Lifestyle Store', type: 'string' },
    { key: 'currency', value: 'USD', type: 'string' },
    { key: 'crypto_enabled', value: 'true', type: 'boolean' },
    { key: 'cod_enabled', value: 'true', type: 'boolean' },
    { key: 'bank_transfer_enabled', value: 'false', type: 'boolean' },
    { key: 'user_selling_enabled', value: 'true', type: 'boolean' },
    { key: 'tax_rate', value: '0', type: 'number' },
    { key: 'shipping_fee', value: '5', type: 'number' },
    { key: 'free_shipping_threshold', value: '50', type: 'number' },
    { key: 'usdt_trc20_address', value: '', type: 'string' },
    { key: 'usdt_erc20_address', value: '', type: 'string' },
    { key: 'btc_address', value: '', type: 'string' },
    { key: 'eth_address', value: '', type: 'string' },
    { key: 'maintenance_mode', value: 'false', type: 'boolean' },
  ]

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }
  console.log('✅ Settings created:', settings.length)

  // Create FAQ entries
  const faqs = [
    {
      question: 'How do I track my order?',
      answer: 'You can track your order by going to Account > Orders and clicking on your order to see the tracking details. You can also use the tracking number sent to your email.',
      category: 'order',
      sortOrder: 0,
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept crypto payments (USDT TRC20/ERC20, BTC, ETH) and Cash on Delivery. For crypto payments, scan the QR code or copy the wallet address at checkout.',
      category: 'payment',
      sortOrder: 0,
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for most items. Items must be unused and in original packaging. Refunds are processed within 5-7 business days after we receive the return.',
      category: 'refund',
      sortOrder: 0,
    },
    {
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes 3-7 business days. Express shipping (2-3 days) is available for an additional fee. Free shipping on orders over $50.',
      category: 'shipping',
      sortOrder: 0,
    },
  ]

  for (const faq of faqs) {
    await prisma.fAQ.create({
      data: {
        ...faq,
        isActive: true,
      },
    })
  }
  console.log('✅ FAQs created:', faqs.length)

  // Create CMS pages
  const pages = [
    {
      slug: 'about',
      title: 'About Us',
      content: '<h1>About ZALORA</h1><p>ZALORA is a premium fashion and lifestyle ecommerce platform. We curate the best products from around the world and bring them to you with seamless crypto payments.</p><p>Founded in 2024, we\'re on a mission to make fashion accessible to everyone while embracing the future of payments.</p>',
    },
    {
      slug: 'terms',
      title: 'Terms & Conditions',
      content: '<h1>Terms & Conditions</h1><p>Welcome to ZALORA. By using our services, you agree to these terms.</p><h2>1. Account</h2><p>You must be 18 or older to create an account.</p><h2>2. Payments</h2><p>All crypto payments are final and non-refundable once confirmed on the blockchain.</p>',
    },
    {
      slug: 'privacy',
      title: 'Privacy Policy',
      content: '<h1>Privacy Policy</h1><p>Your privacy is important to us. This policy explains how we collect, use, and protect your data.</p><h2>Data Collection</h2><p>We collect information necessary to process your orders and improve our services.</p>',
    },
    {
      slug: 'refund',
      title: 'Refund Policy',
      content: '<h1>Refund Policy</h1><p>We want you to be completely satisfied with your purchase.</p><h2>30-Day Returns</h2><p>You may return most items within 30 days of delivery for a full refund.</p><h2>Crypto Refunds</h2><p>Refunds for crypto payments will be issued in the original cryptocurrency or as store credit.</p>',
    },
  ]

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: {
        ...page,
        isActive: true,
      },
    })
  }
  console.log('✅ CMS pages created:', pages.length)

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
