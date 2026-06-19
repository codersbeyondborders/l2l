#!/bin/bash

# Load environment variables
if [ -f .env.development.local ]; then
  export $(cat .env.development.local | xargs)
elif [ -f .env.local ]; then
  export $(cat .env.local | xargs)
fi

# Use environment variables or defaults
HOST=${PGHOST}
PORT=${PGPORT:-5432}
USER=${PGUSER}
DB=${PGDATABASE}

echo "Attempting to seed with DB: $DB at $HOST:$PORT"

# Run seed using node directly with environment
node -e "
const { Pool } = require('pg');
const pool = new Pool({
  host: '$HOST',
  port: $PORT,
  user: '$USER',
  password: process.env.POSTGRES_PASSWORD,
  database: '$DB',
  ssl: { rejectUnauthorized: false }
});

const seedCampaigns = async () => {
  try {
    console.log('Deleting existing campaigns...');
    await pool.query('DELETE FROM moderation_settings');
    await pool.query('DELETE FROM contributions');
    await pool.query('DELETE FROM campaigns');

    const campaigns = [
      {
        title: 'Two Lines for the Earth',
        slug: 'two-lines-earth',
        tagline: 'A global chorus for climate action',
        description: 'Through the power of poetry, we aim to capture the urgency, hope, and collective responsibility within the fight against climate change.',
        instructions: ['Share a two-line poem about climate action', 'Reflect on nature, sustainability, or environmental hope', 'Keep it authentic and from the heart'],
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
        requireEmailVerification: true
      }
    ];

    for (const campaign of campaigns) {
      const id = 'camp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
      await pool.query(
        'INSERT INTO campaigns (id, slug, title, tagline, description, instructions, theme, accent_color, status, ai_moderation, ai_level, background_image_url, campaign_images, video_link, donation_link, start_date, close_date, auto_email_on_publish, require_email_verification, created_at, updated_at) VALUES (\$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8, \$9, \$10, \$11, \$12, \$13, \$14, \$15, \$16, \$17, \$18, \$19, NOW(), NOW())',
        [id, campaign.slug, campaign.title, campaign.tagline, campaign.description, campaign.instructions, campaign.theme, campaign.accentColor, campaign.status, campaign.aiModeration, campaign.aiLevel, campaign.backgroundImageUrl, campaign.campaignImages, campaign.videoLink, campaign.donationLink, campaign.startDate, campaign.closeDate, campaign.autoEmailOnPublish, campaign.requireEmailVerification]
      );
      console.log('✓ Created campaign: ' + campaign.title);
    }

    console.log('✓ Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedCampaigns();
" 2>&1
