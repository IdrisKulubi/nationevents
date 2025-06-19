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

// Create postgres connection with proper configuration
const queryClient = postgres(connectionString, {
  max: parseInt(process.env.POSTGRES_POOL_MAX || '20'), // Maximum number of connections
  idle_timeout: 20, // Close connections after 20 seconds of inactivity
  connect_timeout: 15, // Increased connection timeout
  ssl: sslConfig, // Dynamic SSL configuration based on connection string
  prepare: false, // Disable prepared statements for better compatibility
  onnotice: () => {}, // Suppress notices
  debug: process.env.NODE_ENV === 'development', // Enable debug in development
  transform: postgres.camel, // Transform column names to camelCase
  connection: {
    application_name: 'nation-events-app',
  },
  // Better error handling
  onparameter: (key, value) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`DB Parameter: ${key} = ${value}`);
    }
  },
});

// Create drizzle instance
const db = drizzle(queryClient, { 
  schema,
  logger: process.env.NODE_ENV === 'development'
});

// Export the db instance and query client
export { queryClient };
export default db;
