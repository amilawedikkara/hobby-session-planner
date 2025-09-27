//  API client for sessions/Responsibility: Handle backend communication.
//Returns data in JSON./Responsibility: Handle backend communication.
//Connection: Called inside SessionList (and later in SessionDetails).

export type Session = {
  id: number;
  title: string;
  description?: string | null;
  start_time: string;                 // ISO date-time from backend
  max_participants?: number | null;
};

// Fallback to localhost, or use Vite env: VITE_API_URL
const BASE_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:4000"; // ai-gen marker

export async function getSessions(): Promise<Session[]> {
  const res = await fetch(`${BASE_URL}/sessions`);
  if (!res.ok) {
    throw new Error(`Failed to fetch sessions: ${res.status}`);
  }
  return res.json();
}

// fetch single session by id
export async function getSessionById(id: string | number): Promise<Session> {
  const res = await fetch(`${BASE_URL}/sessions/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch session ${id}: ${res.status}`);
  return res.json();
}

//join a session, returns { attendance_code, ... }
export async function joinSession(sessionId: string | number, attendee_name: string) {
  const res = await fetch(`${BASE_URL}/attendance/${sessionId}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ attendee_name }),
  });
  if (!res.ok) throw new Error(`Failed to join session: ${res.status}`);
  return res.json();
}

//get attendee count for a session → { count: number }
export async function getAttendeeCount(sessionId: string | number): Promise<{ count: number }> {
  const res = await fetch(`${BASE_URL}/attendance/${sessionId}/count`);
  if (!res.ok) throw new Error(`Failed to fetch count: ${res.status}`);
  return res.json();
}


