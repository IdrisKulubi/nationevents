"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { verifyAttendeePin, verifyAttendeeTicket } from "@/app/api/security/verify/actions";
import { CheckCircle, XCircle, AlertTriangle, User, Calendar, MapPin, Shield, Key } from "lucide-react";
import { toast } from "sonner";

interface PinVerificationFormProps {
  securityId: string;
}

interface VerificationResult {
  success: boolean;
  message: string;
  attendee?: {
    id: string;
    name: string | null;
    email: string | null;
    pin: string | null;
    ticketNumber: string | null;
    registrationStatus: string;
    checkInTime?: string;
    alreadyCheckedIn?: boolean;
  };
}

export function PinVerificationForm({ securityId }: PinVerificationFormProps) {
  const [pinInput, setPinInput] = useState("");
  const [ticketInput, setTicketInput] = useState("");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isVerifying, startTransition] = useTransition();

  const handlePinVerification = () => {
    if (!pinInput || pinInput.length !== 6) {
      toast.error("Please enter a valid 6-digit PIN");
      return;
    }

    startTransition(async () => {
      try {
        const response = await verifyAttendeePin(pinInput, securityId);
        
        if (response.success) {
          toast.success(response.message);
          setResult(response);
          setPinInput("");
        } else {
          toast.error(response.message);
          setResult(response);
        }
      } catch (error) {
        toast.error("Verification failed. Please try again.");
        setResult({
          success: false,
          message: "Verification failed due to system error. Please try again."
        });
      }
    });
  };

  const handleTicketVerification = () => {
    if (!ticketInput) {
      toast.error("Please enter a ticket number");
      return;
    }

    startTransition(async () => {
      try {
        const response = await verifyAttendeeTicket(ticketInput, securityId);
        
        if (response.success) {
          toast.success(response.message);
          setResult(response);
          setTicketInput("");
        } else {
          toast.error(response.message);
          setResult(response);
        }
      } catch (error) {
        toast.error("Verification failed. Please try again.");
        setResult({
          success: false,
          message: "Verification failed due to system error. Please try again."
        });
      }
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white space-y-6">
      <Tabs defaultValue="pin" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 h-12">
          <TabsTrigger 
            value="pin" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-medium"
          >
            <Key className="h-4 w-4" />
            PIN Verification
          </TabsTrigger>
          <TabsTrigger 
            value="ticket"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-medium"
          >
            <Shield className="h-4 w-4" />
            Ticket Number
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pin" className="mt-6 space-y-4">
          <div className="space-y-3">
            <Label htmlFor="pin-input" className="text-sm font-semibold text-gray-900">
              6-Digit PIN Code
            </Label>
            <div className="relative">
              <Input
                id="pin-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl font-mono tracking-widest h-14 border-2 border-gray-300 hover:border-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white text-gray-900 placeholder:text-gray-400"
                disabled={isVerifying}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="text-xs text-gray-600 font-medium">
                  {pinInput.length}/6
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-600">
              Enter the 6-digit PIN provided to the attendee
            </p>
          </div>
          <Button 
            onClick={handlePinVerification}
            disabled={isVerifying || pinInput.length !== 6}
            className="w-full h-12 text-base font-semibold bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all duration-200"
            size="lg"
          >
            {isVerifying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Verifying PIN...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Verify PIN
              </>
            )}
          </Button>
        </TabsContent>

        <TabsContent value="ticket" className="mt-6 space-y-4">
          <div className="space-y-3">
            <Label htmlFor="ticket-input" className="text-sm font-semibold text-gray-900">
              Ticket Number
            </Label>
            <Input
              id="ticket-input"
              type="text"
              placeholder="HCS-2025-12345678"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value.toUpperCase())}
              className="h-12 text-base border-2 border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-900 placeholder:text-gray-500"
              disabled={isVerifying}
            />
            <p className="text-xs text-gray-600">
              Enter the full ticket number in format: HCS-YYYY-XXXXXXXX
            </p>
          </div>
          <Button 
            onClick={handleTicketVerification}
            disabled={isVerifying || !ticketInput}
            className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all duration-200"
            size="lg"
          >
            {isVerifying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Verifying Ticket...
              </>
            ) : (
              <>
                <Shield className="h-5 w-5 mr-2" />
                Verify Ticket
              </>
            )}
          </Button>
        </TabsContent>
      </Tabs>

      {/* Verification Result */}
      {result && (
        <Alert 
          className={`border-2 shadow-sm ${
            result.success 
              ? "border-green-300 bg-green-50" 
              : "border-red-300 bg-red-50"
          }`}
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            )}
            <AlertDescription 
              className={`text-base font-medium ${
                result.success ? "text-green-900" : "text-red-900"
              }`}
            >
              {result.message}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Attendee Details */}
      {result?.success && result.attendee && (
        <Card className="border-2 border-green-200 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {result.attendee.name || 'N/A'}
                    </h3>
                    <p className="text-gray-600">{result.attendee.email || 'N/A'}</p>
                  </div>
                </div>
                <Badge 
                  variant={result.attendee.alreadyCheckedIn ? "secondary" : "default"}
                  className={`px-4 py-2 text-sm font-semibold ${
                    result.attendee.alreadyCheckedIn 
                      ? "bg-yellow-100 text-yellow-800 border-yellow-300" 
                      : "bg-green-100 text-green-800 border-green-300"
                  }`}
                >
                  {result.attendee.alreadyCheckedIn ? "Already Checked In" : "✓ Verified"}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 mb-1">PIN Code</p>
                    <p className="text-lg font-mono font-bold text-gray-900">{result.attendee.pin || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 mb-1">Ticket Number</p>
                    <p className="text-base font-semibold text-gray-900">{result.attendee.ticketNumber || 'N/A'}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 mb-1">Registration Status</p>
                    <Badge variant="outline" className="font-semibold text-gray-900 border-gray-300">
                      {result.attendee.registrationStatus.toUpperCase()}
                    </Badge>
                  </div>
                  {result.attendee.checkInTime && (
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Check-in Time
                      </p>
                      <p className="text-base font-semibold text-gray-900">{result.attendee.checkInTime}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 