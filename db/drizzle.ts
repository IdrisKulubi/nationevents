import * as schema from "./schema";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

// Database connection configuration for AWS RDS PostgreSQL
const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

// Parse connection string to determine SSL mode
const url = new URL(connectionString);
const sslMode = url.searchParams.get('sslmode') || 'require';

// Determine SSL configuration based on connection string
let sslConfig: boolean | 'require' | 'allow' | 'prefer' | 'disable' = 'require';
if (sslMode === 'disable' || sslMode === 'no-verify') {
  sslConfig = false;
} else if (sslMode === 'allow') {
  sslConfig = 'allow';
} else if (sslMode === 'prefer') {
  sslConfig = 'prefer';
} else {
  sslConfig = 'require'; // Default for AWS RDS
}

/**
 * --------------------------------------------------------------------------------
 * SERVERLESS DATABASE CONNECTION
 * --------------------------------------------------------------------------------
 * This configuration is optimized for serverless environments (e.g., Vercel, AWS Lambda).
 * It uses `postgres.js` for the connection, which is recommended for its performance
 * and ability to manage connections efficiently.
 *
 * **Key Concepts:**
 * 1.  **External Connection Pooler:** This setup assumes you are using an external
 *     connection pooler like AWS RDS Proxy or PgBouncer. The application-level
 *     pool should be minimal, as the external service handles the main pooling logic.
 *
 * 2.  **`max: 5`:** We set a low connection limit per function instance. Each serverless
 *     function instance will have its own small pool. The external pooler will
 *     manage connections from all these small pools to the database. This prevents
 *     any single function from overwhelming the database and helps distribute
 *     connections fairly.
 *
 * 3.  **`idle_timeout: 10`:** Connections in a warm function instance that are idle
 *     for 10 seconds will be closed. This is crucial for returning connections to
 *     the pooler and preventing idle connections from consuming resources.
 *
 * 4.  **Singleton Pattern:** The `queryClient` is created once per module instance.
 *     Node.js caches modules, so within a single "warm" function container, the same
 *     `queryClient` is reused across multiple invocations, which is efficient.
 *
 * **To Implement:**
 * - Set up AWS RDS Proxy for your database.
 * - Update your `POSTGRES_URL` environment variable to point to the RDS Proxy endpoint.
 */
const queryClient = postgres(connectionString, {
  ssl: sslConfig, // Dynamic SSL configuration based on connection string
  max: parseInt(process.env.POSTGRES_POOL_MAX || '5'), // Low connection limit per instance
  idle_timeout: 10, // seconds
  connect_timeout: 10, // seconds

  // The following settings are for stability and compatibility
  prepare: false, // Disable prepared statements for Vercel/PgBouncer compatibility
  onnotice: () => {}, // Suppress noisy notices
  transform: postgres.camel,
  connection: {
    application_name: 'nation-events-app',
  },
  debug: process.env.NODE_ENV === 'development', // Enable debug logging in development
});

// Create drizzle instance
const db = drizzle(queryClient, { 
  schema,
  logger: process.env.NODE_ENV === 'development'
});

// Export the db instance and query client
export { queryClient };
export default db;
