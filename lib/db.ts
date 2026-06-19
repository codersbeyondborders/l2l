import { Pool, type ClientBase } from 'pg'
import { Signer } from '@aws-sdk/rds-signer'
import { awsCredentialsProvider } from '@vercel/functions/oidc'
import { attachDatabasePool } from '@vercel/functions'

const signer = new Signer({
  credentials: awsCredentialsProvider({
    roleArn: process.env.AWS_ROLE_ARN!,
    clientConfig: { region: process.env.AWS_REGION },
  }),
  region: process.env.AWS_REGION,
  hostname: process.env.PGHOST!,
  username: process.env.PGUSER || 'postgres',
  port: 5432,
})

const pool = new Pool({
  host: process.env.PGHOST,
  database: process.env.PGDATABASE || 'postgres',
  port: 5432,
  user: process.env.PGUSER || 'postgres',
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
