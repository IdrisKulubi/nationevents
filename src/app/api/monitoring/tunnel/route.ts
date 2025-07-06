// Sentry tunnel to bypass ad blockers
// This endpoint proxies Sentry requests through our own domain
// to avoid ERR_BLOCKED_BY_CLIENT errors from ad blockers

import { NextRequest, NextResponse } from 'next/server';

const SENTRY_HOST = 'o4507641250185216.ingest.de.sentry.io';
const SENTRY_PROJECT_IDS = ['4509394264260688'];

export async function POST(request: NextRequest) {
  try {
    const envelope = await request.text();
    const pieces = envelope.split('\n');
    
    if (pieces.length < 2) {
      return NextResponse.json({ error: 'Invalid envelope' }, { status: 400 });
    }

    const header = JSON.parse(pieces[0]);
    const dsn = header.dsn;
    
    if (!dsn) {
      return NextResponse.json({ error: 'No DSN found' }, { status: 400 });
    }

    const dsnUrl = new URL(dsn);
    const projectId = dsnUrl.pathname.replace('/', '');
    
    // Validate project ID
    if (!SENTRY_PROJECT_IDS.includes(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    const sentryUrl = `https://${SENTRY_HOST}/api/${projectId}/envelope/`;
    
    // Forward the request to Sentry
    const response = await fetch(sentryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
        'User-Agent': request.headers.get('User-Agent') || 'sentry-tunnel',
      },
      body: envelope,
    });

    if (!response.ok) {
      console.error('Sentry tunnel error:', response.status, response.statusText);
      return NextResponse.json({ error: 'Failed to forward to Sentry' }, { status: 500 });
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Sentry tunnel error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 