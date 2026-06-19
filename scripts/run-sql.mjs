// One-off runner to apply SQL files to Aurora. Run with:
//   node --env-file-if-exists=/vercel/share/.env.project scripts/run-sql.mjs scripts/001-setup-schema.sql
import { readFileSync } from 'node:fs'
import pg from 'pg'
import { Signer } from '@aws-sdk/rds-signer'
import { awsCredentialsProvider } from '@vercel/functions/oidc'

const file = process.argv[2]
if (!file) {
  console.error('Usage: node scripts/run-sql.mjs <path-to-sql>')
  process.exit(1)
}

const region   = process.env.AWS_APG_AWS_REGION  || process.env.AWS_REGION  || 'us-east-1'
const roleArn   = process.env.AWS_APG_AWS_ROLE_ARN || process.env.AWS_ROLE_ARN || ''
const pghost    = process.env.AWS_APG_PGHOST     || process.env.PGHOST     || ''
const pguser    = process.env.AWS_APG_PGUSER     || process.env.PGUSER     || 'postgres'
const pgdb      = process.env.AWS_APG_PGDATABASE || process.env.PGDATABASE || 'postgres'

const signer = new Signer({
  credentials: awsCredentialsProvider({
    roleArn,
    clientConfig: { region },
  }),
  region,
  hostname: pghost,
  username: pguser,
  port: 5432,
})

const token = await signer.getAuthToken()
const client = new pg.Client({
  host: pghost,
  database: pgdb,
  port: 5432,
  user: pguser,
  password: token,
  ssl: { rejectUnauthorized: false },
})

await client.connect()
const sql = readFileSync(file, 'utf8')
await client.query(sql)
console.log(`[run-sql] applied ${file}`)
await client.end()
