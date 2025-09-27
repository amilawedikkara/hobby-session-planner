//placeholder details page Responsibility: Show details of a single session.
//Responsibility: Show details of a single session.


import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getSessionById, joinSession, getAttendeeCount, type Session } from "../api";

export default function SessionDetails() {
  const { id } = useParams(); // ai-gen marker: route param
  const sessionId = useMemo(() => id ?? "", [id]);

  const [session, setSession] = useState<Session | null>(null);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);      // Week 5: loading state
  const [error, setError] = useState<string | null>(null);

  // controlled input (Week 4)
  const [name, setName] = useState("");

  // Fetch session + attendee count (Week 5: useEffect side effect)
  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        setLoading(true);
        const [s, c] = await Promise.all([
          getSessionById(sessionId),
          getAttendeeCount(sessionId),
        ]);
        if (!ignore) {
          setSession(s);
          setCount(c.count);
          setError(null);
        }
      } catch (err: any) {
        if (!ignore) setError(err?.message || "Failed to load session");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    if (sessionId) load();
    return () => { ignore = true; };
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
      <p><Link to="/">{`← Back to all sessions`}</Link></p>

      <h2>{session.title}</h2>
      {session.description && <p>{session.description}</p>}

      <p>
        <strong>When:</strong> {formatDateTime(session.start_time)}
      </p>

      <p>
        <strong>Attending:</strong> {count}
        {typeof session.max_participants === "number" && session.max_participants > 0
          ? ` / ${session.max_participants}`
          : ""}
      </p>

      {/* Week 4: Controlled form (name) + Week 2: onSubmit event */}
      <form onSubmit={handleJoin} style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          aria-label="Your name"
        />
        <button type="submit">I’m going</button>
      </form>
    </div>
  );
}
