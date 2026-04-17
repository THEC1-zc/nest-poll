import { defineConfig } from '@prisma/config';

export default defineConfig({
  earlyAdopterCheck: false,
  datasource: {
    url: process.env.TURSO_DATABASE_URL || 'file:./dev.db',
  },
});
