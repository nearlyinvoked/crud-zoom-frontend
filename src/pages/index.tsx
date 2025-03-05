import type React from "react";
import axios from "axios";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Video,
  Users,
  ExternalLink,
  Calendar,
  Clock,
  Trash2,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { type ZoomMeeting } from "../../zoom-api";

export default function ZoomCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meetings, setMeetings] = useState<ZoomMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState<ZoomMeeting | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [editedMeeting, setEditedMeeting] = useState<{
    topic: string;
    start_time: string;
    duration: number;
  }>({
    topic: "",
    start_time: "",
    duration: 30,
  });

  // Format datetime-local input value
  const formatDateTimeLocal = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const [newMeeting, setNewMeeting] = useState<{
    topic: string;
    start_time: string;
    duration: number;
  }>({
    topic: "",
    start_time: formatDateTimeLocal(new Date().toISOString()),
    duration: 30,
  });
  const [isCreating, setIsCreating] = useState(false);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get first day of the month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Get last day of the month
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  useEffect(() => {
    const loadMeetings = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:8080/v1/zoom/");
        const data = await response.json();
        setMeetings(data.meetings);
      } catch (error) {
        console.error("Failed to fetch meetings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMeetings();
  }, [currentMonth, currentYear]);

  // Generate calendar days
  const calendarDays = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  // Add days of the month
  for (let i = 1; i <= lastDayOfMonth; i++) {
    calendarDays.push(i);
  }

  // Get meetings for a specific day
  const getMeetingsForDay = (day: number): ZoomMeeting[] => {
    if (!day) return [];

    return meetings.filter((meeting) => {
      const meetingDate = new Date(meeting.start_time);
      return meetingDate.getDate() === day;
    });
  };

  // Format time to display in a readable format
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Format date to display in a readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate end time based on start time and duration
  const calculateEndTime = (
    startTimeString: string,
    durationMinutes: number
  ): string => {
    const startTime = new Date(startTimeString);
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
    return formatTime(endTime.toISOString());
  };

  const handleMonthChange = (value: string) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(Number.parseInt(value));
    setCurrentDate(newDate);
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const openMeetingLink = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(url, "_blank");
  };

  const handleMeetingClick = (meeting: ZoomMeeting) => {
    setSelectedMeeting(meeting);
    setEditedMeeting({
      topic: meeting.topic,
      start_time: formatDateTimeLocal(meeting.start_time),
      duration: meeting.duration,
    });
    setActiveTab("details");
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedMeeting(null);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedMeeting((prev) => ({
      ...prev,
      [name]: name === "duration" ? Number.parseInt(value) : value,
    }));
  };

  const handleDurationChange = (value: string) => {
    setEditedMeeting((prev) => ({
      ...prev,
      duration: Number.parseInt(value),
    }));
  };

  const handleSaveEdit = async () => {
    if (!selectedMeeting) return;

    try {
      const response = await axios.patch(
        `http://localhost:8080/v1/zoom/update/${selectedMeeting.id}`,
        {
          agenda: editedMeeting.topic,
          meeting_time: new Date(editedMeeting.start_time).toISOString(),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const updatedMeeting = response.data;

      // Update the meetings list
      setMeetings((prev) =>
        prev.map((meeting) =>
          meeting.id === selectedMeeting.id ? updatedMeeting : meeting
        )
      );

      setIsDialogOpen(false);
      setSelectedMeeting(null);
    } catch (error) {
      console.error("Failed to update meeting:", error);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMeeting) return;

    try {
      await axios.delete(
        `http://localhost:8080/v1/zoom/delete/${selectedMeeting.id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Remove the meeting from the list
      setMeetings((prev) =>
        prev.filter((meeting) => meeting.id !== selectedMeeting.id)
      );

      setIsDeleteDialogOpen(false);
      setIsDialogOpen(false);
      setSelectedMeeting(null);
    } catch (error) {
      console.error("Failed to delete meeting:", error);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleNewMeetingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMeeting((prev) => ({
      ...prev,
      [name]: name === "duration" ? Number.parseInt(value) : value,
    }));
  };

  const handleNewMeetingDurationChange = (value: string) => {
    setNewMeeting((prev) => ({
      ...prev,
      duration: Number.parseInt(value),
    }));
  };

  const handleCreateMeetingClick = () => {
    // Set default time to current time rounded to nearest 30 minutes
    const now = new Date();
    now.setMinutes(Math.ceil(now.getMinutes() / 30) * 30);
    now.setSeconds(0);
    now.setMilliseconds(0);

    setNewMeeting({
      topic: "",
      start_time: formatDateTimeLocal(now.toISOString()),
      duration: 30,
    });

    setIsCreateDialogOpen(true);
  };

  const handleCreateMeeting = async () => {
    if (!newMeeting.topic || !newMeeting.start_time) {
      return;
    }

    setIsCreating(true);

    try {
      const response = await axios.post(
        "http://localhost:8080/v1/zoom/create",
        {
          agenda: newMeeting.topic,
          meeting_time: new Date(newMeeting.start_time).toISOString(),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const createdMeeting = response.data;

      // Add the new meeting to the list
      setMeetings((prev) => [...prev, createdMeeting]);

      setIsCreateDialogOpen(false);

      // If the meeting is in a different month, navigate to that month
      const meetingDate = new Date(createdMeeting.start_time);
      const meetingMonth = meetingDate.getMonth();
      const meetingYear = meetingDate.getFullYear();

      if (meetingMonth !== currentMonth || meetingYear !== currentYear) {
        const newDate = new Date(currentDate);
        newDate.setMonth(meetingMonth);
        newDate.setFullYear(meetingYear);
        setCurrentDate(newDate);
      }
    } catch (error) {
      console.error("Failed to create meeting:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Select
                value={currentMonth.toString()}
                onValueChange={handleMonthChange}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={months[currentMonth]} />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <CardTitle>{currentYear}</CardTitle>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Button onClick={handleCreateMeetingClick} className="gap-1">
              <Plus className="h-4 w-4" />
              New Meeting
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => (
              <div
                key={index}
                className="font-medium text-center py-2 border-b"
              >
                {day}
              </div>
            ))}
            {calendarDays.map((day, index) => {
              const dayMeetings = day ? getMeetingsForDay(day) : [];
              const isToday =
                day === new Date().getDate() &&
                currentMonth === new Date().getMonth() &&
                currentYear === new Date().getFullYear();

              return (
                <div
                  key={index}
                  className={`
                    min-h-[140px] p-1 border border-border rounded-md
                    ${day === null ? "bg-muted/20" : "hover:bg-muted/50"}
                    ${isToday ? "ring-2 ring-primary ring-inset" : ""}
                  `}
                >
                  {day && (
                    <>
                      <div
                        className={`text-sm font-medium p-1 ${
                          isToday ? "text-primary" : ""
                        }`}
                      >
                        {day}
                      </div>
                      <div className="space-y-1 overflow-y-auto max-h-[110px]">
                        {loading ? (
                          <div className="text-xs text-muted-foreground text-center py-2">
                            Loading...
                          </div>
                        ) : dayMeetings.length > 0 ? (
                          dayMeetings.map((meeting) => (
                            <TooltipProvider key={meeting.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className="text-xs p-1.5 rounded bg-primary/10 border-l-2 border-primary truncate cursor-pointer hover:bg-primary/20"
                                    onClick={() => handleMeetingClick(meeting)}
                                  >
                                    <div className="font-medium">
                                      {meeting.topic}
                                    </div>
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <Video className="h-3 w-3" />
                                      <span>
                                        {formatTime(meeting.start_time)} -{" "}
                                        {calculateEndTime(
                                          meeting.start_time,
                                          meeting.duration
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1">
                                    <p className="font-medium">
                                      {meeting.topic}
                                    </p>
                                    <p className="text-xs">
                                      {formatTime(meeting.start_time)} -{" "}
                                      {calculateEndTime(
                                        meeting.start_time,
                                        meeting.duration
                                      )}
                                    </p>
                                    <div className="flex items-center gap-1 text-xs">
                                      <Users className="h-3 w-3" />
                                      <span>
                                        {meeting.participants} participants
                                      </span>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full mt-1 h-7 text-xs"
                                      onClick={(e) =>
                                        openMeetingLink(meeting.join_url, e)
                                      }
                                    >
                                      <ExternalLink className="h-3 w-3 mr-1" />
                                      Join Meeting
                                    </Button>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))
                        ) : (
                          <div className="text-xs text-muted-foreground text-center py-2">
                            No meetings
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Meeting Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedMeeting && (
            <>
              <DialogHeader>
                <DialogTitle>Meeting Details</DialogTitle>
                <DialogDescription>
                  View and manage your Zoom meeting.
                </DialogDescription>
              </DialogHeader>

              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="mt-4"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">
                      {selectedMeeting.topic}
                    </h3>

                    <div className="flex items-start gap-2 text-sm">
                      <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>{formatDate(selectedMeeting.start_time)}</div>
                    </div>

                    <div className="flex items-start gap-2 text-sm">
                      <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        {formatTime(selectedMeeting.start_time)} -{" "}
                        {calculateEndTime(
                          selectedMeeting.start_time,
                          selectedMeeting.duration
                        )}
                        <div className="text-muted-foreground">
                          Duration: {selectedMeeting.duration} minutes
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm">
                      <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>{selectedMeeting.participants} participants</div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="destructive"
                      onClick={handleDeleteClick}
                      className="gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                    <Button
                      onClick={(e) =>
                        openMeetingLink(selectedMeeting.join_url, e)
                      }
                      className="gap-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Join Meeting
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="edit" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="topic">Meeting Name</Label>
                      <Input
                        id="topic"
                        name="topic"
                        value={editedMeeting.topic}
                        onChange={handleEditChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="start_time">Start Time</Label>
                      <Input
                        id="start_time"
                        name="start_time"
                        type="datetime-local"
                        value={editedMeeting.start_time}
                        onChange={handleEditChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Select
                        value={editedMeeting.duration.toString()}
                        onValueChange={handleDurationChange}
                      >
                        <SelectTrigger id="duration">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="90">1.5 hours</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                {activeTab === "edit" && (
                  <>
                    <Button variant="outline" onClick={handleDialogClose}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveEdit}>Save Changes</Button>
                  </>
                )}
                {activeTab === "details" && (
                  <Button variant="outline" onClick={handleDialogClose}>
                    Close
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Meeting Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Meeting</DialogTitle>
            <DialogDescription>Schedule a new Zoom meeting.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="new-topic">Agenda</Label>
              <Input
                id="new-topic"
                name="topic"
                placeholder="Meeting agenda"
                value={newMeeting.topic}
                onChange={handleNewMeetingChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-start-time">Meeting Time</Label>
              <Input
                id="new-start-time"
                name="start_time"
                type="datetime-local"
                value={newMeeting.start_time}
                onChange={handleNewMeetingChange}
              />
              <p className="text-xs text-muted-foreground">
                Time will be stored as timestamptz in the database
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-duration">Duration</Label>
              <Select
                value={newMeeting.duration.toString()}
                onValueChange={handleNewMeetingDurationChange}
              >
                <SelectTrigger id="new-duration">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateMeeting}
              disabled={
                isCreating || !newMeeting.topic || !newMeeting.start_time
              }
            >
              {isCreating ? "Creating..." : "Create Meeting"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the meeting {selectedMeeting?.id}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
