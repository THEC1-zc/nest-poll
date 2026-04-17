import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

async function main() {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error('No database URL found');
    process.exit(1);
  }

  console.log('Environment check - URL:', url, 'hasAuthToken:', !!authToken);

  const client = createClient({
    url: url as string,
    authToken: authToken as string,
  });

  const sql = `
CREATE TABLE IF NOT EXISTS "Vote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "walletAddress" TEXT NOT NULL,
    "farcasterName" TEXT,
    "choice" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "Vote_walletAddress_key" ON "Vote"("walletAddress");
  `;

  try {
    console.log('Applying schema...');
    // We need to split the statements because execute doesn't always support multiple statements in one call depending on the driver
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    for (const statement of statements) {
      await client.execute(statement);
    }
    console.log('Schema applied successfully!');
  } catch (error) {
    console.error('Failed to apply schema:', error);
  } finally {
    client.close();
  }
}

main();
