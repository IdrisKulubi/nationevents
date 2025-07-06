// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://087209bbb734fe446158f0e1c822ede5@o4507641250185216.ingest.de.sentry.io/4509394264260688",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 0.1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Configure tunnel to bypass ad blockers
  tunnel: "/api/monitoring/tunnel",

  // Filter out common client-side errors that aren't actionable
  beforeSend(event, hint) {
    const error = hint.originalException;
    
    // Filter out network errors that are likely from ad blockers
    if (error instanceof Error) {
      if (error.message.includes('ERR_BLOCKED_BY_CLIENT') ||
          error.message.includes('ERR_NETWORK_CHANGED') ||
          error.message.includes('ERR_CONNECTION_REFUSED')) {
        return null;
      }
    }
    
    // Filter out console errors in production
    if (event.level === 'error' && event.logger === 'console') {
      return null;
    }
    
    return event;
  },

  // Ignore specific error types
  ignoreErrors: [
    // Network errors
    'ERR_BLOCKED_BY_CLIENT',
    'ERR_NETWORK_CHANGED',
    'ERR_INTERNET_DISCONNECTED',
    'ERR_CONNECTION_REFUSED',
    // Browser extension errors
    'Non-Error promise rejection captured',
    'ResizeObserver loop limit exceeded',
    // Ad blocker related
    'Script error.',
    'Network request failed'
  ]
});
