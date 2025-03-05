import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Video, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Types for our meetings
interface Meeting {
  id: string
  title: string
  startTime: Date
  endTime: Date
  attendees: number
  link: string
}

// Mock function to simulate fetching meetings from Zoom API
const fetchMeetings = async (year: number, month: number): Promise<Meeting[]> => {
  // This would be replaced with your actual API call
  // Simulating API response with mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const meetings: Meeting[] = []

      // Generate some random meetings for the month
      for (let i = 0; i < 15; i++) {
        const day = Math.floor(Math.random() * daysInMonth) + 1
        const hour = Math.floor(Math.random() * 8) + 9 // 9 AM to 5 PM
        const duration = Math.floor(Math.random() * 2) + 1 // 1 or 2 hours

        const startTime = new Date(year, month, day, hour)
        const endTime = new Date(year, month, day, hour + duration)

        meetings.push({
          id: `meeting-${i}`,
          title: `Meeting ${i + 1}`,
          startTime,
          endTime,
          attendees: Math.floor(Math.random() * 10) + 2,
          link: "https://zoom.us/j/123456789",
        })
      }

      resolve(meetings)
    }, 500)
  })
}

// Format time to display in a readable format
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)

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
  ]

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Get first day of the month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

  // Get last day of the month
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  // Fetch meetings when month changes
  useEffect(() => {
    const loadMeetings = async () => {
      setLoading(true)
      try {
        const data = await fetchMeetings(currentYear, currentMonth)
        setMeetings(data)
      } catch (error) {
        console.error("Failed to fetch meetings:", error)
      } finally {
        setLoading(false)
      }
    }

    loadMeetings()
  }, [currentMonth, currentYear])

  // Generate calendar days
  const calendarDays = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null)
  }

  // Add days of the month
  for (let i = 1; i <= lastDayOfMonth; i++) {
    calendarDays.push(i)
  }

  // Get meetings for a specific day
  const getMeetingsForDay = (day: number): Meeting[] => {
    if (!day) return []

    return meetings.filter((meeting) => {
      return meeting.startTime.getDate() === day
    })
  }

  const handleMonthChange = (value: string) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(Number.parseInt(value))
    setCurrentDate(newDate)
  }

  const handlePreviousMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() - 1)
    setCurrentDate(newDate)
  }

  const handleNextMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + 1)
    setCurrentDate(newDate)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Select value={currentMonth.toString()} onValueChange={handleMonthChange}>
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
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div key={index} className="font-medium text-center py-2 border-b">
              {day}
            </div>
          ))}
          {calendarDays.map((day, index) => {
            const dayMeetings = day ? getMeetingsForDay(day) : []
            const isToday =
              day === new Date().getDate() &&
              currentMonth === new Date().getMonth() &&
              currentYear === new Date().getFullYear()

            return (
              <div
                key={index}
                className={`
                  min-h-[120px] p-1 border border-border rounded-md
                  ${day === null ? "bg-muted/20" : "hover:bg-muted/50"}
                  ${isToday ? "ring-2 ring-primary ring-inset" : ""}
                `}
              >
                {day && (
                  <>
                    <div className="text-sm font-medium p-1">{day}</div>
                    <div className="space-y-1 overflow-y-auto max-h-[90px]">
                      {loading ? (
                        <div className="text-xs text-muted-foreground text-center py-2">Loading...</div>
                      ) : dayMeetings.length > 0 ? (
                        dayMeetings.map((meeting) => (
                          <TooltipProvider key={meeting.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-xs p-1 rounded bg-primary/10 border-l-2 border-primary truncate cursor-pointer">
                                  <div className="font-medium">{meeting.title}</div>
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Video className="h-3 w-3" />
                                    <span>
                                      {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                                    </span>
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="space-y-1">
                                  <p className="font-medium">{meeting.title}</p>
                                  <p className="text-xs">
                                    {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                                  </p>
                                  <div className="flex items-center gap-1 text-xs">
                                    <Users className="h-3 w-3" />
                                    <span>{meeting.attendees} attendees</span>
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))
                      ) : (
                        <div className="text-xs text-muted-foreground text-center py-2">No meetings</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

