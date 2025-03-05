// This is a mock implementation of a Zoom API client
// Replace this with your actual Zoom API integration

export interface ZoomMeeting {
  id: string;
  topic: string;
  start_time: string;
  duration: number;
  join_url: string;
  participants: number;
}

export interface UpdateMeetingParams {
  topic: string;
  start_time: string;
  duration: number;
}
