import { createClient } from '@libsql/client'

const rawUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:./dev.db'
const rawAuthToken = process.env.TURSO_AUTH_TOKEN

const url = rawUrl.trim()
const authToken = rawAuthToken?.trim()

export const db = createClient({
  url,
  authToken,
})
