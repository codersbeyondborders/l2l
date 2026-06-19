import { Pool } from 'pg';
import { Signer } from '@aws-sdk/rds-signer';
import { awsCredentialsProvider } from '@vercel/functions/oidc';

const signer = new Signer({
  credentials: awsCredentialsProvider({
    roleArn: process.env.AWS_ROLE_ARN,
    clientConfig: { region: process.env.AWS_REGION },
  }),
  region: process.env.AWS_REGION,
  hostname: process.env.PGHOST,
  username: process.env.PGUSER || 'postgres',
  port: 5432,
});

const pool = new Pool({
  host: process.env.PGHOST,
  database: process.env.PGDATABASE || 'postgres',
  port: 5432,
  user: process.env.PGUSER || 'postgres',
  password: () => signer.getAuthToken(),
  ssl: { rejectUnauthorized: false },
  max: 20,
});

const client = await pool.connect();
try {
  console.log('Running seed_couplets migration...');
  await client.query(`
    CREATE TABLE IF NOT EXISTS seed_couplets (
      id             TEXT PRIMARY KEY,
      campaign_id    TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
      sequence_number INT NOT NULL DEFAULT 0,
      line_one       TEXT NOT NULL,
      line_two       TEXT NOT NULL,
      author         TEXT NOT NULL,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_seed_couplets_campaign ON seed_couplets(campaign_id)
  `);
  
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_seed_couplets_sequence ON seed_couplets(campaign_id, sequence_number)
  `);
  
  console.log('✓ Migration successful');
} catch (e) {
  console.error('✗ Migration error:', e.message);
  process.exit(1);
} finally {
  client.release();
  process.exit(0);
}
