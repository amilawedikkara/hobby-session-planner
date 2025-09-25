// AI-GENERATED: simple API client for sessions

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

// (Optional for next step) Fetch single session by id:
export async function getSessionById(id: string | number): Promise<Session> {
  const res = await fetch(`${BASE_URL}/sessions/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch session ${id}: ${res.status}`);
  }
  return res.json();
}
