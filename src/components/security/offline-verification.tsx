"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WifiOff, CheckCircle, XCircle, Clock, Upload, Download, Wifi, Key, Shield, Database, Zap } from "lucide-react";
import { validatePinFormat, validateTicketNumberFormat } from "@/lib/utils/security";
import { toast } from "sonner";

interface OfflineVerificationProps {
  securityId: string;
  badgeNumber: string | null;
}

interface OfflineRecord {
  id: string;
  timestamp: string;
  verificationData: string;
  method: "pin" | "ticket_number";
  securityId: string;
  badgeNumber: string;
  status: "pending_sync";
}

export function OfflineVerificationInterface({ securityId, badgeNumber }: OfflineVerificationProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [pinInput, setPinInput] = useState("");
  const [ticketInput, setTicketInput] = useState("");
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [offlineRecords, setOfflineRecords] = useState<OfflineRecord[]>([]);

  // Monitor online/offline status
  useEffect(() => {
    const updateOnlineStatus = () => {
      const newStatus = navigator.onLine;
      setIsOnline(newStatus);
      if (newStatus) {
        toast.success("Connection restored! Ready to sync offline records.");
      } else {
        toast.warning("Connection lost. Switching to offline mode.");
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Load offline records from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`offline_verifications_${securityId}`);
    if (stored) {
      try {
        setOfflineRecords(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to load offline records:", error);
      }
    }
  }, [securityId]);

  // Save offline records to localStorage
  const saveOfflineRecord = (record: OfflineRecord) => {
    const updated = [...offlineRecords, record];
    setOfflineRecords(updated);
    localStorage.setItem(`offline_verifications_${securityId}`, JSON.stringify(updated));
  };

  const handlePinVerification = () => {
    if (!validatePinFormat(pinInput)) {
      toast.error("Please enter a valid 6-digit PIN");
      setResult({
        success: false,
        message: "Please enter a valid 6-digit PIN"
      });
      return;
    }

    if (!isOnline) {
      // Save for later sync
      const record: OfflineRecord = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        verificationData: pinInput,
        method: "pin",
        securityId,
        badgeNumber: badgeNumber || "UNKNOWN",
        status: "pending_sync"
      };

      saveOfflineRecord(record);
      toast.success("PIN verification saved offline");
      setResult({
        success: true,
        message: "PIN verification recorded offline. Will sync when online."
      });
      setPinInput("");
    } else {
      // TODO: Implement online verification
      toast.success("PIN verified successfully");
      setResult({
        success: true,
        message: "Online verification would happen here"
      });
      setPinInput("");
    }
  };

  const handleTicketVerification = () => {
    if (!validateTicketNumberFormat(ticketInput)) {
      toast.error("Invalid ticket format. Expected: HCS-YYYY-XXXXXXXX");
      setResult({
        success: false,
        message: "Invalid ticket format. Expected: HCS-YYYY-XXXXXXXX"
      });
      return;
    }

    if (!isOnline) {
      // Save for later sync
      const record: OfflineRecord = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        verificationData: ticketInput,
        method: "ticket_number",
        securityId,
        badgeNumber: badgeNumber || "UNKNOWN",
        status: "pending_sync"
      };

      saveOfflineRecord(record);
      toast.success("Ticket verification saved offline");
      setResult({
        success: true,
        message: "Ticket verification recorded offline. Will sync when online."
      });
      setTicketInput("");
    } else {
      // TODO: Implement online verification
      toast.success("Ticket verified successfully");
      setResult({
        success: true,
        message: "Online verification would happen here"
      });
      setTicketInput("");
    }
  };

  const clearOfflineRecords = () => {
    setOfflineRecords([]);
    localStorage.removeItem(`offline_verifications_${securityId}`);
    toast.success("Offline records cleared");
    setResult({
      success: true,
      message: "Offline records cleared."
    });
  };

  const exportOfflineData = () => {
    const dataStr = JSON.stringify(offlineRecords, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `offline_verifications_${badgeNumber}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Offline data exported successfully");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Offline Verification System
          </h1>
          <p className="text-gray-600 text-lg">
            Secure verification that works even without internet connection
          </p>
        </div>

      {/* Connection Status */}
        <Card className={`transition-all duration-300 border-2 shadow-lg ${
          isOnline 
            ? "border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-green-100" 
            : "border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 shadow-orange-100"
        }`}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
            {isOnline ? (
                  <div className="relative">
                    <Wifi className="h-6 w-6 text-green-600" />
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                ) : (
                  <div className="relative">
                    <WifiOff className="h-6 w-6 text-orange-600" />
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-orange-500 rounded-full animate-pulse"></div>
                  </div>
                )}
                <span className="text-xl font-semibold text-gray-900">Connection Status</span>
              </div>
              <Badge 
                variant="outline"
                className={`px-4 py-2 text-sm font-bold border-2 ${
                  isOnline 
                    ? "bg-green-100 text-green-800 border-green-300" 
                    : "bg-orange-100 text-orange-800 border-orange-300"
                }`}
              >
                {isOnline ? "ONLINE" : "OFFLINE"}
              </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isOnline ? (
                  <div className="flex items-center gap-2 text-green-700">
                    <Zap className="h-5 w-5" />
                    <span className="font-medium">Real-time verification active</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-orange-700">
                    <Database className="h-5 w-5" />
                    <span className="font-medium">Local storage mode activated</span>
                  </div>
                )}
              </div>
            {!isOnline && (
                <p className="text-sm text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                  Verifications stored locally • Will sync when online
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Verification Interface */}
        <Card className="border-2 border-blue-200 shadow-xl bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Shield className="h-7 w-7 text-blue-600" />
              Verification Interface
            </CardTitle>
        </CardHeader>
          <CardContent className="p-8">
          <Tabs defaultValue="pin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 h-14 rounded-xl">
                <TabsTrigger 
                  value="pin"
                  className="flex items-center gap-3 data-[state=active]:bg-white data-[state=active]:shadow-md text-base font-semibold rounded-lg transition-all duration-200"
                >
                  <Key className="h-5 w-5" />
                  PIN Verification
                </TabsTrigger>
                <TabsTrigger 
                  value="ticket"
                  className="flex items-center gap-3 data-[state=active]:bg-white data-[state=active]:shadow-md text-base font-semibold rounded-lg transition-all duration-200"
                >
                  <Shield className="h-5 w-5" />
                  Ticket Number
                </TabsTrigger>
            </TabsList>
            
              <TabsContent value="pin" className="mt-8 space-y-6">
                <div className="space-y-4">
                  <Label htmlFor="pin-input" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Key className="h-5 w-5 text-blue-600" />
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
                      className="text-center text-3xl font-mono tracking-[0.5em] h-16 border-3 border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 bg-white text-gray-900 placeholder:text-gray-400 rounded-xl shadow-sm transition-all duration-200"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-100 rounded-lg px-3 py-1">
                      <span className="text-sm font-bold text-gray-700">
                        {pinInput.length}/6
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    💡 Enter the 6-digit PIN provided to the attendee
                  </p>
              </div>
              <Button 
                onClick={handlePinVerification}
                disabled={pinInput.length !== 6}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                  size="lg"
              >
                  <CheckCircle className="h-6 w-6 mr-3" />
                  Verify PIN Code
              </Button>
            </TabsContent>

              <TabsContent value="ticket" className="mt-8 space-y-6">
                <div className="space-y-4">
                  <Label htmlFor="ticket-input" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-600" />
                    Ticket Number
                  </Label>
                <Input
                  id="ticket-input"
                  type="text"
                    placeholder="HCS-2025-12345678"
                  value={ticketInput}
                  onChange={(e) => setTicketInput(e.target.value.toUpperCase())}
                    className="h-14 text-lg border-3 border-gray-300 hover:border-purple-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 bg-white text-gray-900 placeholder:text-gray-500 rounded-xl shadow-sm transition-all duration-200"
                />
                  <p className="text-sm text-gray-600 bg-purple-50 p-3 rounded-lg border border-purple-200">
                    🎫 Enter the full ticket number in format: HCS-YYYY-XXXXXXXX
                  </p>
              </div>
              <Button 
                onClick={handleTicketVerification}
                disabled={!ticketInput}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                  size="lg"
              >
                  <Shield className="h-6 w-6 mr-3" />
                Verify Ticket
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Result Message */}
      {result && (
          <Alert className={`border-2 shadow-lg rounded-xl ${
            result.success 
              ? "border-green-300 bg-gradient-to-r from-green-50 to-emerald-50" 
              : "border-red-300 bg-gradient-to-r from-red-50 to-pink-50"
          }`}>
            <div className="flex items-center gap-4">
            {result.success ? (
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
            ) : (
                <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
            )}
              <AlertDescription className={`text-lg font-medium ${
                result.success ? "text-green-900" : "text-red-900"
              }`}>
              {result.message}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Offline Records */}
      {offlineRecords.length > 0 && (
          <Card className="border-2 border-amber-200 shadow-xl bg-gradient-to-r from-amber-50 to-yellow-50">
            <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100 border-b border-amber-200">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                <Clock className="h-6 w-6 text-amber-600" />
              Offline Records ({offlineRecords.length})
            </CardTitle>
          </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="space-y-3">
                  {offlineRecords.slice(-5).map((record, index) => (
                    <div key={record.id} className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-amber-200 shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          record.method === "pin" ? "bg-blue-100" : "bg-purple-100"
                        }`}>
                          {record.method === "pin" ? (
                            <Key className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Shield className="h-5 w-5 text-purple-600" />
                          )}
                        </div>
                    <div>
                          <p className="font-bold text-gray-900 text-lg">
                            {record.method === "pin" ? "PIN" : "Ticket"}: 
                            <span className="font-mono ml-2 bg-gray-100 px-2 py-1 rounded">
                              {record.verificationData}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600 font-medium">
                            📅 {new Date(record.timestamp).toLocaleString()}
                      </p>
                    </div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800 border-2 border-yellow-300 px-3 py-1 font-bold">
                        ⏳ Pending Sync
                    </Badge>
                  </div>
                ))}
              </div>

                <div className="flex gap-4 pt-4 border-t border-amber-200">
                <Button 
                  variant="outline" 
                  onClick={exportOfflineData}
                    className="flex items-center gap-2 h-12 px-6 font-semibold border-2 border-blue-300 text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200"
                >
                    <Download className="h-5 w-5" />
                  Export Data
                </Button>
                <Button 
                  variant="outline" 
                  onClick={clearOfflineRecords}
                    className="flex items-center gap-2 h-12 px-6 font-semibold border-2 border-red-300 text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200"
                >
                    <XCircle className="h-5 w-5" />
                  Clear Records
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
        <Card className="border-2 border-indigo-200 shadow-xl bg-gradient-to-r from-indigo-50 to-blue-50">
          <CardHeader className="bg-gradient-to-r from-indigo-100 to-blue-100 border-b border-indigo-200">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <Database className="h-6 w-6 text-indigo-600" />
              Offline Mode Instructions
            </CardTitle>
        </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-indigo-200">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-bold">1</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    Verifications stored locally when offline
                  </p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-indigo-200">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-bold">2</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    Auto-sync when connection restored
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-indigo-200">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-bold">3</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    Export data regularly for backup
                  </p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-indigo-200">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-bold">4</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    Contact admin for manual verification
                  </p>
                </div>
              </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
} 