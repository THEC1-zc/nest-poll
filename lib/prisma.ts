import { PrismaClient } from '../generated/prisma/index.js'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:./dev.db';
const authToken = process.env.TURSO_AUTH_TOKEN;
const adapter = new PrismaLibSql({
  url,
  authToken,
})
const prisma = new PrismaClient({ adapter })

export default prisma
