import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    'Missing Supabase environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.',
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const campaigns = [
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
    accent_color: '#10b981',
    status: 'active',
    ai_moderation: true,
    ai_level: 'standard',
    background_image_url: '/placeholder.svg?height=400&width=1200',
    campaign_images: [],
    video_link: null,
    donation_link: null,
    start_date: new Date('2025-01-01').toISOString(),
    close_date: new Date('2026-12-31').toISOString(),
    auto_email_on_publish: false,
    require_email_verification: true,
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
    accent_color: '#d946ef',
    status: 'active',
    ai_moderation: true,
    ai_level: 'standard',
    background_image_url: '/placeholder.svg?height=400&width=1200',
    campaign_images: [],
    video_link: null,
    donation_link: null,
    start_date: new Date('2025-02-01').toISOString(),
    close_date: new Date('2026-12-31').toISOString(),
    auto_email_on_publish: false,
    require_email_verification: true,
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
    accent_color: '#0ea5e9',
    status: 'active',
    ai_moderation: true,
    ai_level: 'standard',
    background_image_url: '/placeholder.svg?height=400&width=1200',
    campaign_images: [],
    video_link: null,
    donation_link: null,
    start_date: new Date('2025-03-01').toISOString(),
    close_date: new Date('2026-12-31').toISOString(),
    auto_email_on_publish: false,
    require_email_verification: true,
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
    accent_color: '#f59e0b',
    status: 'active',
    ai_moderation: true,
    ai_level: 'standard',
    background_image_url: '/placeholder.svg?height=400&width=1200',
    campaign_images: [],
    video_link: null,
    donation_link: null,
    start_date: new Date('2025-04-01').toISOString(),
    close_date: new Date('2026-12-31').toISOString(),
    auto_email_on_publish: false,
    require_email_verification: true,
  },
]

async function seed() {
  try {
    console.log('[SEED] Starting campaign seeding via Supabase...')

    // Delete existing campaigns
    console.log('[SEED] Deleting existing campaigns...')
    await supabase.from('moderation_settings').delete().neq('id', '')
    await supabase.from('contributions').delete().neq('id', '')
    await supabase.from('campaigns').delete().neq('id', '')

    // Insert new campaigns
    console.log('[SEED] Inserting new campaigns...')
    const { data: insertedCampaigns, error: insertError } = await supabase
      .from('campaigns')
      .insert(campaigns.map((c) => ({ id: `camp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`, ...c })))
      .select()

    if (insertError) {
      console.error('[SEED] Error inserting campaigns:', insertError)
      process.exit(1)
    }

    console.log(`[SEED] ✓ Inserted ${insertedCampaigns?.length || 0} campaigns`)

    // Create moderation settings for each campaign
    console.log('[SEED] Creating moderation settings...')
    const moderationSettings = (insertedCampaigns || []).map((c) => ({
      id: `ms_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      campaign_id: c.id,
      level: 'standard',
      profanity_filter: true,
      enforce_theme: false,
      confidence_threshold: 0.75,
    }))

    if (moderationSettings.length > 0) {
      const { error: settingsError } = await supabase
        .from('moderation_settings')
        .insert(moderationSettings)

      if (settingsError) {
        console.error('[SEED] Error creating moderation settings:', settingsError)
        process.exit(1)
      }

      console.log('[SEED] ✓ Created moderation settings')
    }

    console.log('[SEED] ✓ Campaign seeding completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('[SEED] Fatal error:', error)
    process.exit(1)
  }
}

seed()
