import { NextRequest, NextResponse } from 'next/server';
import { handleSMSWebhook } from '@/lib/actions/send-sms-actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData();
    
    const messageId = body.get('MessageSid') as string;
    const messageStatus = body.get('MessageStatus') as string;
    const errorCode = body.get('ErrorCode') as string | null;
    
    if (!messageId || !messageStatus) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await handleSMSWebhook(messageId, messageStatus, errorCode || undefined);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ SMS webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'SMS webhook endpoint' });
} 