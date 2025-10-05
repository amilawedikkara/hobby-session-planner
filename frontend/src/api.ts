//  API client for sessions/Responsibility: Handle backend communication.
//Returns data in JSON./Responsibility: Handle backend communication.
//Connection: Called inside SessionList (and later in SessionDetails).

export type Session = {
  id: number;
  title: string;
  description?: string | null;
  start_time: string; // ISO date-time from backend
  max_participants?: number | null;
};
/*This defines the shape of data using TypeScript.
 It's like a blueprint that says "every Session object will have these properties.
 " This helps with type safety when working with the data in components.*/

// Fallback to localhost, or use Vite env: VITE_API_URL
const BASE_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:4000"; //production backend URL

export async function getSessions(): Promise<Session[]> {
  const res = await fetch(`${BASE_URL}/sessions`);
  if (!res.ok) {
    // Handles error states (server errors, 404, etc.)
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

// fetch private session by its unique code
export async function getSessionByCode(code: string) {
  const res = await fetch(`${BASE_URL}/sessions/by-code/${code}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch session by code: ${res.status}`);
  }
  return res.json();
}

//join a session, returns { attendance_code, ... }//This would be called when a user submits a "Join Session" form
export async function joinSession(
  sessionId: string | number,
  attendee_name: string
) {
  const res = await fetch(`${BASE_URL}/attendance/${sessionId}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ attendee_name }),
  });
  if (!res.ok) throw new Error(`Failed to join session: ${res.status}`);
  return res.json();
}

//get attendee count for a session → { count: number }
export async function getAttendeeCount(
  sessionId: string | number
): Promise<{ count: number }> {
  const res = await fetch(`${BASE_URL}/attendance/${sessionId}/count`);
  if (!res.ok) throw new Error(`Failed to fetch count: ${res.status}`);
  return res.json();
}

// create a session
export async function createSession(payload: any) {
  const res = await fetch(`${BASE_URL}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create session: ${res.status}`);
  return res.json();
}
//leave attendance helper
// improved leaveSession with readable 404 handling
export async function leaveSession(
  sessionId: string | number,
  attendanceCode: string
) {
  const res = await fetch(
    `${BASE_URL}/attendance/${sessionId}/leave/${attendanceCode}`,
    {
      method: "DELETE",
    }
  );

  if (res.status === 404) {
    // backend says "Invalid attendance code"
    return { success: false, message: "Invalid attendance code" };
  }

  if (!res.ok) {
    // any other server error
    throw new Error(`Failed to leave: ${res.status}`);
  }

  return res.json(); // normal success
}
