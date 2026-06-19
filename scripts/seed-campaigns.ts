import { query } from '@/lib/db'

interface CampaignSeed {
  title: string
  slug: string
  tagline: string
  description: string
  instructions: string[]
  theme: string
  accentColor: string
  status: 'active' | 'draft' | 'archived'
  aiModeration: boolean
  aiLevel: 'strict' | 'moderate' | 'permissive'
  backgroundImageUrl: string
  campaignImages: string[]
  videoLink: string | null
  donationLink: string | null
  startDate: Date
  closeDate: Date
  autoEmailOnPublish: boolean
  requireEmailVerification: boolean
}

const campaigns: CampaignSeed[] = [
  {
    title: 'Two Lines for the Earth',
    slug: 'two-lines-earth',
    tagline: 'A global chorus for climate action',
    description:
      'Through the power of poetry, we aim to capture the urgency, hope, and collective responsibility within the fight against climate change. This campaign gathers voices from around the globe, transforming two-line verses into a living chorus for our planet. It\'s an ode to the Earth\'s beauty and fragility, seeking to inspire action, foster awareness, and unite communities in protecting our shared home.',
    instructions: [
      'Share a two-line poem about climate action',
      'Reflect on nature, sustainability, or environmental hope',
      'Keep it authentic and from the heart',
    ],
    theme: 'light',
    accentColor: '#10b981',
    status: 'active',
    aiModeration: true,
    aiLevel: 'moderate',
    backgroundImageUrl: '/placeholder.svg?height=400&width=1200',
    campaignImages: [],
    videoLink: null,
    donationLink: null,
    startDate: new Date('2025-01-01'),
    closeDate: new Date('2026-12-31'),
    autoEmailOnPublish: false,
    requireEmailVerification: true,
  },
  {
    title: 'She Can Do Anything',
    slug: 'she-can-do-anything',
    tagline: 'Celebrating women\'s strength and achievement',
    description:
      'This Women\'s Month, in tribute of the women\'s march (where 20,000 women of different races marched to the Union Buildings in Pretoria to protest against legislation aimed at controlling the movement of black individuals by forcing them to carry pass books)- we want to recognize how SHE CAN DO ANYTHING. We want to spend the next month looking back on women\'s achievements, their milestones as well as reflecting on the challenges they have faced in the struggle to be free and the important role they continue to play in society. Let us contribute our two lines towards weaving a poem that reminds us that- She believed she could, so she did.',
    instructions: [
      'Write two lines celebrating women\'s power and resilience',
      'Share personal stories or universal truths about women',
      'Inspire others with your verse',
    ],
    theme: 'light',
    accentColor: '#d946ef',
    status: 'active',
    aiModeration: true,
    aiLevel: 'moderate',
    backgroundImageUrl: '/placeholder.svg?height=400&width=1200',
    campaignImages: [],
    videoLink: null,
    donationLink: null,
    startDate: new Date('2025-02-01'),
    closeDate: new Date('2026-12-31'),
    autoEmailOnPublish: false,
    requireEmailVerification: true,
  },
  {
    title: '2030 - The World We Imagine',
    slug: '2030-world-imagine',
    tagline: 'Poetry for sustainable development',
    description:
      'Let\'s write the longest poem on Sustainable Development Goals (SDG). This chapter aims at weaving the longest piece of poetry on Sustainable Development Goals (SDG) and creating awareness about them.',
    instructions: [
      'Contribute two lines about a sustainable development goal',
      'Focus on global challenges and collective solutions',
      'Inspire action toward a better 2030',
    ],
    theme: 'light',
    accentColor: '#0ea5e9',
    status: 'active',
    aiModeration: true,
    aiLevel: 'moderate',
    backgroundImageUrl: '/placeholder.svg?height=400&width=1200',
    campaignImages: [],
    videoLink: null,
    donationLink: null,
    startDate: new Date('2025-03-01'),
    closeDate: new Date('2026-12-31'),
    autoEmailOnPublish: false,
    requireEmailVerification: true,
  },
  {
    title: 'Madiba',
    slug: 'madiba',
    tagline: 'Celebrating Nelson Mandela\'s legacy',
    description:
      'This chapter is to celebrate the life and teachings of Nelson Mandela a.k.a Madiba, who taught us the real meaning of love and forgiveness. As we remember him today, let us contribute our two lines towards weaving a poem with an exceptional confluence of authors, unified with one vision of peace: Let\'s write for this great son of Africa.',
    instructions: [
      'Write two lines honoring Nelson Mandela\'s legacy',
      'Reflect on peace, forgiveness, and unity',
      'Contribute to a global tribute',
    ],
    theme: 'light',
    accentColor: '#f59e0b',
    status: 'active',
    aiModeration: true,
    aiLevel: 'moderate',
    backgroundImageUrl: '/placeholder.svg?height=400&width=1200',
    campaignImages: [],
    videoLink: null,
    donationLink: null,
    startDate: new Date('2025-04-01'),
    closeDate: new Date('2026-12-31'),
    autoEmailOnPublish: false,
    requireEmailVerification: true,
  },
]

async function seedCampaigns() {
  try {
    console.log('Starting campaign seeding...')

    // Delete all existing campaigns (this will cascade to contributions)
    console.log('Deleting existing campaigns...')
    await query('DELETE FROM moderation_settings')
    await query('DELETE FROM contributions')
    await query('DELETE FROM campaigns')

    // Insert new campaigns
    console.log('Inserting new campaigns...')
    for (const campaign of campaigns) {
      const {
        title,
        slug,
        tagline,
        description,
        instructions,
        theme,
        accentColor,
        status,
        aiModeration,
        aiLevel,
        backgroundImageUrl,
        campaignImages,
        videoLink,
        donationLink,
        startDate,
        closeDate,
        autoEmailOnPublish,
        requireEmailVerification,
      } = campaign

      const id = `camp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

      await query(
        `INSERT INTO campaigns (
          id, slug, title, tagline, description, instructions, theme, accent_color,
          status, ai_moderation, ai_level, background_image_url, campaign_images,
          video_link, donation_link, start_date, close_date, auto_email_on_publish,
          require_email_verification, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW(), NOW())`,
        [
          id,
          slug,
          title,
          tagline,
          description,
          instructions,
          theme,
          accentColor,
          status,
          aiModeration,
          aiLevel,
          backgroundImageUrl,
          campaignImages,
          videoLink,
          donationLink,
          startDate,
          closeDate,
          autoEmailOnPublish,
          requireEmailVerification,
        ],
      )

      // Create default moderation settings for each campaign
      const settingsId = `ms_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
      await query(
        `INSERT INTO moderation_settings (
          id, campaign_id, level, profanity_filter, enforce_theme, confidence_threshold, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [settingsId, id, 'moderate', true, false, 0.75],
      )

      console.log(`✓ Created campaign: ${title}`)
    }

    console.log('✓ Campaign seeding completed successfully!')
  } catch (error) {
    console.error('Error seeding campaigns:', error)
    process.exit(1)
  }
}

seedCampaigns()
