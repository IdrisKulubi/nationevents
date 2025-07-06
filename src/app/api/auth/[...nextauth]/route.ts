import { GET, POST } from "@/auth"

// The session and JWT callbacks in `auth.ts` perform database lookups.
// The `postgres` driver uses Node.js-specific APIs (`perf_hooks`) that are not
// available in the Edge runtime. Therefore, we must explicitly force this route
// to run on the Node.js runtime.
export const runtime = 'nodejs';

export { GET, POST } 