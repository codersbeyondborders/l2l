import { Pool, type ClientBase } from 'pg'
import { Signer } from '@aws-sdk/rds-signer'
import { awsCredentialsProvider } from '@vercel/functions/oidc'
import { attachDatabasePool } from '@vercel/functions'

// The Vercel Aurora PostgreSQL integration prefixes its env vars with AWS_APG_.
// Fall back to the unprefixed names for local/manual overrides.
const PGHOST     = process.env.AWS_APG_PGHOST     || process.env.PGHOST     || ''
const PGUSER     = process.env.AWS_APG_PGUSER     || process.env.PGUSER     || 'postgres'
const PGDATABASE = process.env.AWS_APG_PGDATABASE || process.env.PGDATABASE || 'postgres'
const AWS_REGION = process.env.AWS_APG_AWS_REGION || process.env.AWS_REGION || 'us-east-1'
const AWS_ROLE_ARN = process.env.AWS_APG_AWS_ROLE_ARN || process.env.AWS_ROLE_ARN || ''

const signer = new Signer({
  credentials: awsCredentialsProvider({
    roleArn: AWS_ROLE_ARN,
    clientConfig: { region: AWS_REGION },
  }),
  region: AWS_REGION,
  hostname: PGHOST,
  username: PGUSER,
  port: 5432,
})

const pool = new Pool({
  host: PGHOST,
  database: PGDATABASE,
  port: 5432,
  user: PGUSER,
  password: () => signer.getAuthToken(),
  ssl: { rejectUnauthorized: false },
  // Keep pool small for serverless: each Vercel function invocation spins its
  // own pool. Aurora's max_connections is finite (e.g. ~170 on db.t3.medium).
  // With RDS Proxy in front (recommended for production), the proxy multiplexes
  // connections so a low client-side max does not limit throughput.
  max: 5,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 5_000,
})
attachDatabasePool(pool)

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[],
): Promise<{ rows: T[]; rowCount: number | null }> {
  const result = await pool.query(text, params)
  return { rows: result.rows as T[], rowCount: result.rowCount }
}

export async function withConnection<T>(
  fn: (client: ClientBase) => Promise<T>,
): Promise<T> {
  const client = await pool.connect()
  try {
    return await fn(client)
  } finally {
    client.release()
  }
}
