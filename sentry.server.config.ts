// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://087209bbb734fe446158f0e1c822ede5@o4507641250185216.ingest.de.sentry.io/4509394264260688",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 0.1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Filter out common server-side errors that aren't actionable
  beforeSend(event, hint) {
    const error = hint.originalException;
    
    // Filter out network errors
    if (error instanceof Error) {
      if (error.message.includes('ECONNRESET') ||
          error.message.includes('ENOTFOUND') ||
          error.message.includes('ETIMEDOUT')) {
        return null;
      }
    }
    
    return event;
  },

  // Ignore specific error types
  ignoreErrors: [
    // Network errors
    'ECONNRESET',
    'ENOTFOUND',
    'ETIMEDOUT',
    'ECONNREFUSED',
    // Common non-actionable errors
    'AbortError',
    'TimeoutError'
  ]
});
