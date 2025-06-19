import { SMS_TEMPLATES } from "@/lib/constants/sms-templates";

export interface SendSMSOptions {
  phoneNumber: string;
  message: string;
  templateType?: keyof typeof SMS_TEMPLATES;
  metadata?: Record<string, any>;
}

export interface SendSMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
  deliveryStatus?: string;
}

export interface SendBulkSMSOptions {
  recipients: Array<{
    phoneNumber: string;
    name: string;
    customData?: Record<string, any>;
  }>;
  templateType: keyof typeof SMS_TEMPLATES;
  templateData?: Record<string, any>;
  customMessage?: string;
} 