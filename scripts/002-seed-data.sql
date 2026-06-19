-- Phase 3: Seed data mirroring the Phase 1/2 mock payload.

-- Campaigns -----------------------------------------------------------------
INSERT INTO campaigns (
  id, slug, title, tagline, description, instructions, theme, accent_color,
  status, ai_moderation, ai_level, background_image_url, campaign_images,
  video_link, donation_link, start_date, close_date, created_at
) VALUES
(
  'cmp_earth', 'two-lines-for-the-earth', 'Two Lines for the Earth',
  'A living poem written by the world, for the world.',
  'Add exactly two lines to a single, continuously growing poem about our shared home. Every approved couplet is stitched into one endless tapestry of collective hope, grief, and resolve.',
  ARRAY[
    'Write exactly two lines of free verse — no more, no less.',
    'Keep each line under 100 characters so it reads cleanly in the poem.',
    'Stay close to the theme of climate and our shared planet.',
    'An AI moderation check reviews every couplet for theme and tone before it joins the poem.'
  ],
  'climate', 'emerald', 'active', true, 'standard',
  '/placeholder.svg?height=600&width=960&query=lush%20green%20forest%20canopy%20from%20above%20with%20misty%20morning%20light',
  ARRAY[
    '/placeholder.svg?height=600&width=960&query=lush%20green%20forest%20canopy%20from%20above%20with%20misty%20morning%20light',
    '/placeholder.svg?height=600&width=960&query=dramatic%20melting%20glacier%20with%20deep%20blue%20ice',
    '/placeholder.svg?height=600&width=960&query=calm%20ocean%20horizon%20at%20golden%20hour'
  ],
  'https://example.com/earth-intro', 'https://example.com/donate/earth',
  '2026-05-01T00:00:00.000Z', '2026-09-30T23:59:59.000Z', '2026-01-12T09:00:00.000Z'
),
(
  'cmp_water', 'rivers-remember', 'Rivers Remember',
  'Two lines for every vanishing waterway.',
  'A campaign gathering couplets that honor the rivers, lakes, and oceans we are losing — and the ones we can still save.',
  ARRAY[
    'Write exactly two lines about a river, lake, or ocean that matters to you.',
    'Keep each line under 100 characters.',
    'Center water, memory, and renewal in your imagery.',
    'Every submission passes an AI moderation check before publication.'
  ],
  'water', 'emerald', 'draft', true, 'strict',
  '/placeholder.svg?height=600&width=960&query=winding%20river%20through%20a%20green%20valley%20at%20dawn',
  ARRAY['/placeholder.svg?height=600&width=960&query=winding%20river%20through%20a%20green%20valley%20at%20dawn'],
  NULL, 'https://example.com/donate/water',
  '2026-07-15T00:00:00.000Z', '2026-11-30T23:59:59.000Z', '2026-05-28T13:30:00.000Z'
),
(
  'cmp_forests', 'last-canopy', 'The Last Canopy',
  'Couplets for the world''s forests.',
  'A completed seasonal campaign celebrating the forests and the people who defend them.',
  ARRAY[
    'Write exactly two lines in honor of a forest or the people who protect it.',
    'Keep each line under 100 characters.',
    'Evoke canopy, root, and the quiet work of conservation.',
    'All couplets were reviewed by an AI moderation pass before joining the poem.'
  ],
  'forests', 'emerald', 'completed', false, 'lenient',
  '/placeholder.svg?height=600&width=960&query=ancient%20tall%20forest%20trees%20with%20sunlight%20streaming%20through',
  ARRAY['/placeholder.svg?height=600&width=960&query=ancient%20tall%20forest%20trees%20with%20sunlight%20streaming%20through'],
  'https://example.com/canopy', NULL,
  '2025-09-01T00:00:00.000Z', '2025-12-15T23:59:59.000Z', '2025-09-01T08:00:00.000Z'
)
ON CONFLICT (id) DO NOTHING;

-- Authors -------------------------------------------------------------------
INSERT INTO authors (id, name, email, country, status, joined_at) VALUES
('aut_maya',  'Maya R.',   'maya@example.com',  'Canada',    'active', '2026-05-30T08:00:00.000Z'),
('aut_tomas', 'Tomás',     'tomas@example.com', 'Brazil',    'active', '2026-05-31T10:00:00.000Z'),
('aut_anon',  NULL,        'anon@example.com',  'Australia', 'active', '2026-06-01T12:00:00.000Z'),
('aut_lena',  'Lena K.',   'lena@example.com',  'Germany',   'active', '2026-06-02T09:00:00.000Z'),
('aut_priya', 'Priya',     'priya@example.com', 'India',     'active', '2026-06-03T07:00:00.000Z'),
('aut_spam',  'promo_bot', 'spam@example.com',  NULL,        'banned', '2026-06-05T09:00:00.000Z'),
('aut_sven',  'Sven',      'sven@example.com',  'Norway',    'active', '2026-06-10T16:00:00.000Z'),
('aut_amara', 'Amara',     'amara@example.com', 'Kenya',     'active', '2026-06-11T05:00:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- Contributions -------------------------------------------------------------
INSERT INTO contributions (
  id, campaign_id, sequence_number, line_one, line_two, author_id, status, moderation_reason, created_at
) VALUES
('ctr_001','cmp_earth',1,'The glaciers keep a diary in blue,','and every page we burn, they read aloud.','aut_maya','approved',NULL,'2026-06-01T08:12:00.000Z'),
('ctr_002','cmp_earth',2,'I planted a word where the forest had been,','it grew into a sentence of leaves again.','aut_tomas','approved',NULL,'2026-06-02T14:40:00.000Z'),
('ctr_003','cmp_earth',3,'The ocean is not angry, only honest,','it returns to us exactly what we gave.','aut_anon','approved',NULL,'2026-06-03T19:05:00.000Z'),
('ctr_004','cmp_earth',4,'A child asked the sky why it kept coughing,','and none of the adults knew where to look.','aut_lena','approved',NULL,'2026-06-04T11:22:00.000Z'),
('ctr_005','cmp_earth',5,'We are the last two lines of an old song,','so let us make the ending worth the wait.','aut_priya','approved',NULL,'2026-06-05T07:48:00.000Z'),
('ctr_006','cmp_earth',0,'Buy our energy drink, smash that subscribe,','link in bio for the lowest prices online!','aut_spam','rejected','Off-theme / promotional spam','2026-06-05T09:10:00.000Z'),
('ctr_007','cmp_earth',0,'The rivers remember every name we forgot,','they whisper them back each time it rains.','aut_sven','pending',NULL,'2026-06-10T16:30:00.000Z'),
('ctr_008','cmp_earth',0,'Hope is a seed that refuses the drought,','and roots itself deeper the drier it gets.','aut_amara','pending',NULL,'2026-06-11T05:55:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- Moderation settings -------------------------------------------------------
INSERT INTO moderation_settings (id, campaign_id, level, profanity_filter, enforce_theme, confidence_threshold, updated_at) VALUES
('mds_earth', 'cmp_earth', 'standard', true, true, 0.70, '2026-06-09T10:00:00.000Z')
ON CONFLICT (id) DO NOTHING;
