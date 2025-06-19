"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MessageSquare, 
  Send, 
  Users, 
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap
} from "lucide-react";
import { 
  sendCustomSMS, 
  sendEventReminderSMS 
} from "@/lib/actions/send-sms-actions";
import { SMS_TEMPLATES } from "@/lib/constants/sms-templates";
import { toast } from "sonner";

interface SendSMSModalProps {
  trigger: React.ReactNode;
  eventId?: string;
  preSelectedJobSeekers?: string[];
}

export function SendSMSModal({ 
  trigger, 
  eventId, 
  preSelectedJobSeekers = [] 
}: SendSMSModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messageType, setMessageType] = useState<'custom' | 'event_reminder'>('custom');
  const [customMessage, setCustomMessage] = useState('');
  const [jobSeekerIds, setJobSeekerIds] = useState<string[]>(preSelectedJobSeekers);
  const [sendResult, setSendResult] = useState<{
    success: boolean;
    summary?: {
      total: number;
      successful: number;
      failed: number;
    };
  } | null>(null);

  const handleSendSMS = async () => {
    if (messageType === 'custom' && !customMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (messageType === 'custom' && jobSeekerIds.length === 0) {
      toast.error("Please select job seekers to send SMS to");
      return;
    }

    setLoading(true);
    setSendResult(null);

    try {
      let result;

      if (messageType === 'event_reminder' && eventId) {
        result = await sendEventReminderSMS(eventId);
      } else if (messageType === 'custom') {
        result = await sendCustomSMS(jobSeekerIds, customMessage);
      } else {
        throw new Error("Invalid message configuration");
      }

      setSendResult(result);

      if (result.success) {
        toast.success(`SMS sent successfully! ${result.summary?.successful}/${result.summary?.total} delivered`);
      } else {
        toast.error("Failed to send SMS");
      }

    } catch (error: any) {
      console.error('SMS sending error:', error);
      toast.error(error.message || "Failed to send SMS");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCustomMessage('');
    setJobSeekerIds(preSelectedJobSeekers);
    setSendResult(null);
    setMessageType('custom');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-blue-900">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            📱 Send SMS Notification
          </DialogTitle>
          <DialogDescription className="text-lg text-gray-700">
            Send SMS messages to job seekers for important updates and reminders
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Message Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-900">📋 Message Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={messageType} onValueChange={(value) => setMessageType(value as any)}>
                <SelectTrigger className="h-12 text-base border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500">
                  <SelectValue placeholder="Select message type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">🎯 Custom Message</SelectItem>
                  {eventId && (
                    <SelectItem value="event_reminder">📅 Event Reminder (All Job Seekers)</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Custom Message */}
          {messageType === 'custom' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900">✍️ Custom Message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="message" className="text-base font-semibold text-gray-700">
                    Message Content
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Enter your custom message here... (e.g., 'Important update about tomorrow's event...')"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="mt-2 min-h-[120px] text-base border-2 border-gray-300 hover:border-blue-400 focus:border-blue-500"
                  />
                  <div className="mt-2 flex justify-between text-sm text-gray-500">
                    <span>💡 Tip: Keep messages clear and include contact info if needed</span>
                    <span>{customMessage.length}/160 characters</span>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold text-gray-700">
                    Job Seeker Selection
                  </Label>
                  <div className="mt-2 p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>
                        {jobSeekerIds.length > 0 
                          ? `${jobSeekerIds.length} job seekers selected`
                          : 'No job seekers selected'
                        }
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Job seeker selection will be implemented in the future. Currently sends to all approved job seekers.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Event Reminder Info */}
          {messageType === 'event_reminder' && (
            <Card className="bg-blue-50 border-2 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-blue-900">📅 Event Reminder</h3>
                    <p className="text-blue-700">Send reminder to all approved job seekers</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-gray-700">
                    <strong>Message Preview:</strong><br />
                    &quot;📅 Hi [Name]! Reminder: [Event Name] is on [Date] at [Venue]. Don&apos;t forget your PIN for check-in! 🚀&quot;
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Send Result */}
          {sendResult && (
            <Card className={`border-2 ${sendResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  {sendResult.success ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-600" />
                  )}
                  <div>
                    <h3 className={`text-lg font-bold ${sendResult.success ? 'text-green-900' : 'text-red-900'}`}>
                      {sendResult.success ? '✅ SMS Sent Successfully!' : '❌ SMS Sending Failed'}
                    </h3>
                    {sendResult.summary && (
                      <p className={`${sendResult.success ? 'text-green-700' : 'text-red-700'}`}>
                        {sendResult.summary.successful} of {sendResult.summary.total} messages delivered
                      </p>
                    )}
                  </div>
                </div>

                {sendResult.summary && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-blue-600">{sendResult.summary.total}</div>
                      <div className="text-sm text-gray-600">Total</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-green-600">{sendResult.summary.successful}</div>
                      <div className="text-sm text-gray-600">Successful</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-red-600">{sendResult.summary.failed}</div>
                      <div className="text-sm text-gray-600">Failed</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleSendSMS}
              disabled={loading || (messageType === 'custom' && (!customMessage.trim()))}
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Sending SMS...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Send SMS
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="px-8 h-12 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
            >
              Cancel
            </Button>
          </div>

          {/* Important Notice */}
          <Card className="bg-amber-50 border-2 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-600 mt-1" />
                <div>
                  <h4 className="font-bold text-amber-900 mb-2">⚠️ Important Notice</h4>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>• SMS messages will be sent to phone numbers on file</li>
                    <li>• Failed deliveries may be due to invalid numbers or network issues</li>
                    <li>• SMS costs apply based on your Twilio account</li>
                    <li>• Messages are limited to 160 characters for standard SMS</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
} 