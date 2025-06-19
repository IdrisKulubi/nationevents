"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Clock,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Users,
  CheckCircle,
  AlertTriangle,
  Activity,
  FileText,
  Eye,
  Download,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { 
  getTimeBatches, 
  getTimeSlots, 
  createTimeBatch, 
  getAvailableBooths 
} from "@/lib/actions/admin-actions";

interface TimeBatch {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  slotDuration: number; // in minutes
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  status: "active" | "inactive" | "completed";
  eventId: string;
  booths: string[];
}

interface TimeSlot {
  id: string;
  batchId: string;
  startTime: string;
  endTime: string;
  boothId: string;
  boothName: string;
  isBooked: boolean;
  attendeeName?: string;
  attendeeEmail?: string;
  jobTitle?: string;
  companyName?: string;
}

interface AvailableBooth {
  id: string;
  name: string;
}

export function TimeBatchManagement() {
  const [timeBatches, setTimeBatches] = useState<TimeBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<TimeBatch | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [availableBooths, setAvailableBooths] = useState<AvailableBooth[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSlotsDialog, setShowSlotsDialog] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [newBatch, setNewBatch] = useState({
    name: "",
    date: "",
    startTime: "",
    endTime: "",
    slotDuration: 30,
    booths: [] as string[],
  });

  const loadTimeBatches = async () => {
    try {
      setLoading(true);
      const data = await getTimeBatches();
      setTimeBatches(data);
    } catch (error) {
      console.error("Error loading time batches:", error);
      toast.error("Failed to load time batches");
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableBooths = async () => {
    try {
      const booths = await getAvailableBooths();
      setAvailableBooths(booths);
    } catch (error) {
      console.error("Error loading booths:", error);
      toast.error("Failed to load available booths");
    }
  };

  const loadTimeSlots = async (batchId: string) => {
    try {
      setSlotsLoading(true);
      const slots = await getTimeSlots(batchId);
      setTimeSlots(slots);
    } catch (error) {
      console.error("Error loading time slots:", error);
      toast.error("Failed to load time slots");
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    loadTimeBatches();
    loadAvailableBooths();
  }, []);

  const handleCreateBatch = async () => {
    try {
      setCreateLoading(true);
      await createTimeBatch(newBatch);
      
      toast.success("Time batch created successfully");
      setShowCreateDialog(false);
      setNewBatch({
        name: "",
        date: "",
        startTime: "",
        endTime: "",
        slotDuration: 30,
        booths: [],
      });
      
      // Reload batches
      await loadTimeBatches();
    } catch (error) {
      console.error("Error creating time batch:", error);
      toast.error("Failed to create time batch");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleToggleBatchStatus = async (batchId: string) => {
    try {
      // This would be implemented as a server action
      setTimeBatches(prev => prev.map(batch => 
        batch.id === batchId 
          ? { ...batch, status: batch.status === "active" ? "inactive" : "active" }
          : batch
      ));
      toast.success("Batch status updated successfully");
    } catch (error) {
      toast.error("Failed to update batch status");
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    try {
      // This would be implemented as a server action
      setTimeBatches(prev => prev.filter(batch => batch.id !== batchId));
      toast.success("Time batch deleted successfully");
    } catch (error) {
      toast.error("Failed to delete time batch");
    }
  };

  const handleViewSlots = async (batch: TimeBatch) => {
    setSelectedBatch(batch);
    setShowSlotsDialog(true);
    await loadTimeSlots(batch.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200";
      case "inactive": return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
      case "completed": return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200";
      default: return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
    }
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600 dark:text-red-400";
    if (percentage >= 70) return "text-orange-600 dark:text-orange-400";
    return "text-green-600 dark:text-green-400";
  };

  const calculateTotalStats = () => {
    return {
      totalBatches: timeBatches.length,
      activeBatches: timeBatches.filter(b => b.status === "active").length,
      totalSlots: timeBatches.reduce((sum, batch) => sum + batch.totalSlots, 0),
      bookedSlots: timeBatches.reduce((sum, batch) => sum + batch.bookedSlots, 0),
      utilizationRate: timeBatches.length > 0 ? 
        Math.round((timeBatches.reduce((sum, batch) => sum + batch.bookedSlots, 0) / 
          timeBatches.reduce((sum, batch) => sum + batch.totalSlots, 0)) * 100) || 0 : 0
    };
  };

  const stats = calculateTotalStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            </div>
          ))}
        </div>
        <div className="animate-pulse">
          <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100">
            Time Batch Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage interview time slots and scheduling batches
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Schedule
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Batch
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Total Batches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {stats.totalBatches}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {stats.activeBatches} active
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Total Slots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {stats.totalSlots}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Available slots
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Booked Slots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {stats.bookedSlots}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interviews scheduled
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Utilization Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {stats.utilizationRate}%
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Overall booking rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="batches" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="batches">Time Batches</TabsTrigger>
          <TabsTrigger value="schedule">Schedule View</TabsTrigger>
        </TabsList>

        {/* Batches Tab */}
        <TabsContent value="batches">
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle>Time Batches ({timeBatches.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {timeBatches.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No time batches found</p>
                  <p className="text-sm">Create your first time batch to get started</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Batch Name</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Utilization</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Booths</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timeBatches.map((batch) => (
                        <TableRow key={batch.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-slate-800 dark:text-slate-200">
                                {batch.name}
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                {batch.slotDuration} min slots
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-slate-800 dark:text-slate-200">
                                {new Date(batch.date).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                {batch.startTime} - {batch.endTime}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{batch.totalSlots} total slots</div>
                              <div className="text-slate-500 dark:text-slate-400">
                                {Math.floor((new Date(`${batch.date}T${batch.endTime}`).getTime() - 
                                  new Date(`${batch.date}T${batch.startTime}`).getTime()) / (1000 * 60 * 60))} hours
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>{batch.bookedSlots} / {batch.totalSlots}</span>
                                <span className={getUtilizationColor((batch.bookedSlots / batch.totalSlots) * 100)}>
                                  {Math.round((batch.bookedSlots / batch.totalSlots) * 100)}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${(batch.bookedSlots / batch.totalSlots) * 100}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(batch.status)}>
                              {batch.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {batch.booths.length} booths
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewSlots(batch)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleBatchStatus(batch.id)}
                              >
                                <Activity className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteBatch(batch.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule View Tab */}
        <TabsContent value="schedule">
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Schedule Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                {/* Time slots grid would go here */}
                <div className="lg:col-span-7 text-center py-12 text-slate-500 dark:text-slate-400">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Schedule View</p>
                  <p className="text-sm">Visual schedule representation will be implemented here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Batch Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Time Batch
            </DialogTitle>
            <DialogDescription>
              Set up a new time batch for interview scheduling
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="batchName">Batch Name</Label>
              <Input
                id="batchName"
                value={newBatch.name}
                onChange={(e) => setNewBatch(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Morning Session - Day 1"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="batchDate">Date</Label>
                <Input
                  id="batchDate"
                  type="date"
                  value={newBatch.date}
                  onChange={(e) => setNewBatch(prev => ({ ...prev, date: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="slotDuration">Slot Duration (min)</Label>
                <Select
                  value={newBatch.slotDuration.toString()}
                  onValueChange={(value) => setNewBatch(prev => ({ ...prev, slotDuration: parseInt(value) }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newBatch.startTime}
                  onChange={(e) => setNewBatch(prev => ({ ...prev, startTime: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newBatch.endTime}
                  onChange={(e) => setNewBatch(prev => ({ ...prev, endTime: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Select Booths</Label>
              <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                {availableBooths.map((booth) => (
                  <label key={booth.id} className="flex items-center gap-2 p-2 rounded border hover:bg-slate-50 dark:hover:bg-slate-800">
                    <input
                      type="checkbox"
                      checked={newBatch.booths.includes(booth.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewBatch(prev => ({ ...prev, booths: [...prev.booths, booth.id] }));
                        } else {
                          setNewBatch(prev => ({ ...prev, booths: prev.booths.filter(id => id !== booth.id) }));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{booth.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCreateDialog(false)}
              disabled={createLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateBatch} 
              disabled={!newBatch.name || !newBatch.date || !newBatch.startTime || !newBatch.endTime || newBatch.booths.length === 0 || createLoading}
            >
              {createLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Batch"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Slots Dialog */}
      <Dialog open={showSlotsDialog} onOpenChange={setShowSlotsDialog}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Time Slots - {selectedBatch?.name}
            </DialogTitle>
            <DialogDescription>
              View and manage individual time slots for this batch
            </DialogDescription>
          </DialogHeader>
          
          {selectedBatch && (
            <div className="space-y-4">
              {/* Batch Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    {selectedBatch.totalSlots}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Total Slots</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {selectedBatch.bookedSlots}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Booked</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {selectedBatch.availableSlots}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Available</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">
                    {selectedBatch.slotDuration}min
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Duration</div>
                </div>
              </div>

              {/* Slots Table */}
              <div className="max-h-96 overflow-y-auto">
                {slotsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="ml-2">Loading time slots...</span>
                  </div>
                ) : timeSlots.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No time slots found for this batch</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Booth</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Attendee</TableHead>
                        <TableHead>Position</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timeSlots.map((slot) => (
                        <TableRow key={slot.id}>
                          <TableCell className="font-mono">
                            {slot.startTime} - {slot.endTime}
                          </TableCell>
                          <TableCell>{slot.boothName}</TableCell>
                          <TableCell>
                            <Badge className={slot.isBooked ? 
                              "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200" :
                              "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                            }>
                              {slot.isBooked ? "Booked" : "Available"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {slot.isBooked ? (
                              <div>
                                <div className="font-medium">{slot.attendeeName}</div>
                                <div className="text-sm text-slate-500">{slot.attendeeEmail}</div>
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {slot.isBooked ? (
                              <div>
                                <div className="font-medium">{slot.jobTitle}</div>
                                <div className="text-sm text-slate-500">{slot.companyName}</div>
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSlotsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 