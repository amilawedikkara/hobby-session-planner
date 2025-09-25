// AI-GENERATED: basic interfaces for strong typing
export type SessionType = "public" | "private";

export interface Session {
  id?: number;
  title: string;
  description?: string;
  start_time: string;               // ISO string
  max_participants?: number | null;
  type: SessionType;
  management_code?: string;
  private_code?: string | null;
  creator_email?: string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface Attendance {
  id?: number;
  session_id: number;
  attendee_name?: string;
  attendee_email?: string | null;
  attendee_phone?: string | null;
  attendance_code?: string;
  created_at?: string;
}
