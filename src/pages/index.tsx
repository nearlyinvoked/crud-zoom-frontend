import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Video,
  Users,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { getUserMeetings, type ZoomMeeting } from "../../zoom-api";

export default function ZoomCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meetings, setMeetings] = useState<ZoomMeeting[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Fetch meetings when month changes
  useEffect(() => {
    const loadMeetings = async () => {
      setLoading(true);
      try {
        const startDate = new Date(currentYear, currentMonth, 1);
        const endDate = new Date(currentYear, currentMonth + 1, 0);
        const data = await getUserMeetings(startDate, endDate);
        setMeetings(data);
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

  const openMeetingLink = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
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
          </div>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => (
            <div key={index} className="font-medium text-center py-2 border-b">
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
                                  onClick={() =>
                                    openMeetingLink(meeting.join_url)
                                  }
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
                                  <p className="font-medium">{meeting.topic}</p>
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
                                    onClick={() =>
                                      openMeetingLink(meeting.join_url)
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
  );
}
