import { cwd } from 'node:process'
import { loadEnvConfig } from '@next/env'

loadEnvConfig(cwd())

import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
  // Note: For AWS RDS migrations, you may need to run with:
  // $env:NODE_TLS_REJECT_UNAUTHORIZED="0"; pnpm drizzle-kit migrate
})
