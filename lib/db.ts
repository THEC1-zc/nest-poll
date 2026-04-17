import { createClient } from '@libsql/client'

const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:./dev.db'
const authToken = process.env.TURSO_AUTH_TOKEN

export const db = createClient({
  url,
  authToken,
})
