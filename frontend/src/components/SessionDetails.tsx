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
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

// Default fallback: Helsinki
const DEFAULT_POSITION: [number, number] = [60.1699, 24.9384];
const DEFAULT_ZOOM = 13;

// Fix for React 19 + react-leaflet type mismatches
type SafeTileLayerProps = React.ComponentProps<typeof TileLayer> & {
  attribution?: string;
};
const SafeTileLayer: React.FC<SafeTileLayerProps> = (props) => (
  <TileLayer {...props} />
);

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
    <div className="container my-4" style={{ maxWidth: 700 }}>
      <p>
        <Link to="/" className="text-decoration-none">
          {" "}
          {`← Back to all sessions`}
        </Link>
      </p>
      <div className="card shadow-sm p-4">
        <h3 className="text-primary mb-2">{session.title}</h3>
        {session.description && (
          <p className="text-muted">{session.description}</p>
        )}

        <p className="mb-1">
          <strong>When:</strong> {formatDateTime(session.start_time)}
        </p>

        <p className="mb-3">
          <strong>Attending:</strong> {count}
          {typeof session.max_participants === "number" &&
          session.max_participants > 0
            ? ` / ${session.max_participants}`
            : ""}
        </p>

        {/* 🗺️ Smart Map Integration */}
        <div style={{ marginTop: "1rem" }}>
          <h5>Location</h5>

          <MapContainer
            center={
              typeof session.latitude === "number" &&
              typeof session.longitude === "number"
                ? ([session.latitude, session.longitude] as LatLngExpression)
                : DEFAULT_POSITION
            }
            zoom={DEFAULT_ZOOM}
            style={{
              height: "300px",
              width: "100%",
              borderRadius: "12px",
              marginTop: "0.5rem",
            }}
          >
            <SafeTileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            {typeof session.latitude === "number" &&
            typeof session.longitude === "number" ? (
              <Marker
                position={
                  [session.latitude, session.longitude] as LatLngExpression
                }
              >
                <Popup>{session.title}</Popup>
              </Marker>
            ) : (
              <Popup position={DEFAULT_POSITION}>
                Location not provided — showing Helsinki as default
              </Popup>
            )}
          </MapContainer>
        </div>
      </div>
      {/* Week 4: Controlled form (name) + Week 2: onSubmit event */}
      <form onSubmit={handleJoin} className="mb-4">
        <label htmlFor="joinName" className="form-label fw-semibold">
          Join this session
        </label>
        <div className="input-group">
          <input
            id="joinName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            aria-label="Your name"
            className="form-control"
            required
          />
          <button type="submit" className="btn btn-primary">
            I’m going
          </button>
        </div>
      </form>
      <div>
        <h5 className="mt-3">Not going?</h5>
        <p className="text-secondary small mb-2">
          Enter your personal attendance code to cancel your spot.
        </p>
        <form onSubmit={handleLeave} className="input-group">
          <input
            value={leaveCode}
            onChange={(e) => setLeaveCode(e.target.value)}
            placeholder="Attendance code"
            aria-label="Attendance code"
            className="form-control"
          />

          <button type="submit" className="btn btn-outline-danger">
            Not going
          </button>
        </form>
      </div>
    </div>
  );
}
