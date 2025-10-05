//placeholder details page Responsibility: Show details of a single session.
//Responsibility: Show details of a single session.

import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getSessionById,
  getSessionByCode,
  joinSession,
  getAttendeeCount,
  leaveSession,
  type Session,
} from "../api"; // ADD leaveSession import

export default function SessionDetails() {
  const { id, code } = useParams(); //  support both numeric ID and private code
  const sessionId = useMemo(() => id ?? code ?? "", [id, code]);

  const [session, setSession] = useState<Session | null>(null);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true); // Week 5: loading state
  const [leaveCode, setLeaveCode] = useState(""); // Week 6: leave attendance code
  const [error, setError] = useState<string | null>(null);

  // controlled input (Week 4)
  const [name, setName] = useState("");

  // Fetch session + attendee count (Week 5: useEffect side effect)
  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        setLoading(true);
        let sessionData;
        if (id) {
          // normal public session
          sessionData = await getSessionById(sessionId);
        } else if (code) {
          // private session by code
          sessionData = await getSessionByCode(sessionId);
        }

        // get attendee count (same for both)
        const attendeeCount = await getAttendeeCount(sessionId);

        if (!ignore) {
          setSession(sessionData);
          setCount(attendeeCount.count);
          setError(null);
        }
      } catch (err: any) {
        if (!ignore) setError(err?.message || "Failed to load session");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    if (sessionId) load();
    return () => {
      ignore = true;
    };
  }, [sessionId]);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }
    try {
      const res = await joinSession(sessionId, name.trim());
      // show personal attendance code (no login required later)
      alert(`You're in! Save this attendance code: ${res.attendance_code}`); // ai-gen marker

      // refresh count
      const c = await getAttendeeCount(sessionId);
      setCount(c.count);
      setName(""); // clear input
    } catch (err: any) {
      alert(err?.message || "Failed to join");
    }
  }
  async function handleLeave(e: React.FormEvent) {
    e.preventDefault();
    if (!leaveCode.trim()) {
      alert("Please enter your attendance code.");
      return;
    }
    try {
      const result = await leaveSession(sessionId, leaveCode.trim());
      if (!result.success) {
        alert(result.message || "Invalid attendance code.");
        setLeaveCode(""); // clear field even on invalid code
        return;
      }
      alert("You have been removed from the session.");

      // refresh count after leaving
      const c = await getAttendeeCount(sessionId);
      setCount(c.count);
      setLeaveCode(""); // clear the input
    } catch (err: any) {
      alert(err?.message || "Failed to leave");
    }
  }

  // helper to format start_time nicely
  function formatDateTime(iso: string) {
    try {
      const d = new Date(iso);
      return d.toLocaleString(); // beginner-friendly formatting
    } catch {
      return iso;
    }
  }

  if (loading) return <p>Loading session...</p>;
  if (error) return <p style={{ color: "crimson" }}>Error: {error}</p>;
  if (!session) return <p>Session not found.</p>;

  return (
    <div style={{ maxWidth: 700 }}>
      <p>
        <Link to="/">{`← Back to all sessions`}</Link>
      </p>

      <h2>{session.title}</h2>
      {session.description && <p>{session.description}</p>}

      <p>
        <strong>When:</strong> {formatDateTime(session.start_time)}
      </p>

      <p>
        <strong>Attending:</strong> {count}
        {typeof session.max_participants === "number" &&
        session.max_participants > 0
          ? ` / ${session.max_participants}`
          : ""}
      </p>

      {/* Week 4: Controlled form (name) + Week 2: onSubmit event */}
      <form
        onSubmit={handleJoin}
        style={{ display: "flex", gap: 8, alignItems: "center" }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          aria-label="Your name"
        />
        <button type="submit">I’m going</button>
      </form>
      <div>
        <h3 style={{ margin: "8px 0" }}>Not going?</h3>
        <p style={{ margin: 0, fontSize: 14, color: "#555" }}>
          Enter your personal attendance code to cancel your spot.
        </p>
        <form
          onSubmit={handleLeave}
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginTop: 8,
          }}
        >
          <input
            value={leaveCode}
            onChange={(e) => setLeaveCode(e.target.value)}
            placeholder="Attendance code"
            aria-label="Attendance code"
          />
          <button type="submit">Not going</button>
        </form>
      </div>
    </div>
  );
}
