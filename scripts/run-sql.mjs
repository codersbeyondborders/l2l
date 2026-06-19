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

const region = process.env.AWS_REGION
const signer = new Signer({
  credentials: awsCredentialsProvider({
    roleArn: process.env.AWS_ROLE_ARN,
    clientConfig: { region },
  }),
  region,
  hostname: process.env.PGHOST,
  username: process.env.PGUSER || 'postgres',
  port: 5432,
})

const token = await signer.getAuthToken()
const client = new pg.Client({
  host: process.env.PGHOST,
  database: process.env.PGDATABASE || 'postgres',
  port: 5432,
  user: process.env.PGUSER || 'postgres',
  password: token,
  ssl: { rejectUnauthorized: false },
})

await client.connect()
const sql = readFileSync(file, 'utf8')
await client.query(sql)
console.log(`[run-sql] applied ${file}`)
await client.end()
