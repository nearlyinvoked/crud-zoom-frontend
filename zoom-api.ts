export interface ZoomMeeting {
  id: string
  topic: string
  start_time: string
  duration: number
  join_url: string
  participants: number
}

export async function getUserMeetings(startDate: Date, endDate: Date): Promise<ZoomMeeting[]> {
  // In a real implementation, you would make an API call to Zoom
  // For example:
  // const response = await fetch(`https://api.zoom.us/v2/users/me/meetings?type=scheduled&from=${startDate.toISOString()}&to=${endDate.toISOString()}`, {
  //   headers: {
  //     'Authorization': `Bearer ${process.env.ZOOM_API_TOKEN}`,
  //     'Content-Type': 'application/json'
  //   }
  // });
  // return await response.json();

  // For now, we'll return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      const meetings: ZoomMeeting[] = []
      const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

      for (let i = 0; i < days; i++) {
        if (Math.random() > 0.7) continue // Not every day has meetings

        const meetingsPerDay = Math.floor(Math.random() * 3) + 1
        const currentDate = new Date(startDate)
        currentDate.setDate(startDate.getDate() + i)

        for (let j = 0; j < meetingsPerDay; j++) {
          const hour = 9 + Math.floor(Math.random() * 8) // 9 AM to 5 PM
          const duration = 30 + Math.floor(Math.random() * 4) * 15 // 30, 45, 60, 75, or 90 minutes

          const meetingDate = new Date(currentDate)
          meetingDate.setHours(hour, 0, 0, 0)

          meetings.push({
            id: `meeting-${i}-${j}`,
            topic: `Zoom Meeting ${i}-${j}`,
            start_time: meetingDate.toISOString(),
            duration,
            join_url: "https://zoom.us/j/123456789",
            participants: Math.floor(Math.random() * 10) + 2,
          })
        }
      }

      resolve(meetings)
    }, 500)
  })
}

