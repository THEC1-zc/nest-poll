import { PrismaClient } from '../generated/prisma/client'
import { createClient } from '@libsql/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const libsql = createClient({
  url: process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:./dev.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
})

// @ts-expect-error - LibSQL client type mismatch in Prisma 7
const adapter = new PrismaLibSql(libsql)
const prisma = new PrismaClient({ adapter })

export default prisma
