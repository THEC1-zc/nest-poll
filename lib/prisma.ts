import { PrismaClient } from '../generated/prisma/client'
import { createClient } from '@libsql/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

let prisma: PrismaClient;

try {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:./dev.db';
  const authToken = process.env.TURSO_AUTH_TOKEN;
  
  console.log('Initializing LibSQL with URL:', url, 'hasAuthToken:', !!authToken);

  const libsql = createClient({
    url,
    authToken,
  })

  // @ts-expect-error - LibSQL client type mismatch in Prisma 7
  const adapter = new PrismaLibSql(libsql)
  prisma = new PrismaClient({ adapter })
} catch (error) {
  console.error('Failed to initialize Prisma/LibSQL:', error);
  // Fallback to a dummy or error-throwing proxy if needed, but for now just let it be assigned
  prisma = new PrismaClient({ 
    // @ts-ignore
    adapter: { name: 'error-adapter', model: { Vote: { findUnique: () => { throw error } } } } 
  });
}

export default prisma
