//esponsibility: Show all sessions.
//list all sessions, link to details,Connection: Uses api.ts for data + React Router’s <Link> to navigate.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSessions, type Session } from "../api";

export default function SessionList() {
  const [sessions, setSessions] = useState<Session[]>([]); //Manages loading/error states with useState.
  const [loading, setLoading] = useState(true); //  marker
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getSessions(); //Fetches data from the backend using getSessions() (from api.ts).
        setSessions(data);
      } catch (err: any) {
        setError(err?.message || "Failed to load sessions");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Loading sessions…</p>;
  if (error) return <p style={{ color: "crimson" }}>Error: {error}</p>;
  if (sessions.length === 0)
    return <p>No public sessions yet. Be the first to create one!</p>;

  return (
    <div>
      <h2>All Public Sessions</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {sessions.map((s) => (
          <li
            key={s.id}
            style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}
          >
            <div style={{ fontWeight: 600 }}>{s.title}</div>
            {/* optional snippet */}
            {s.description ? (
              <div style={{ color: "#555", fontSize: 14 }}>
                {s.description.length > 120
                  ? s.description.slice(0, 120) + "…"
                  : s.description}
              </div>
            ) : null}
            <Link to={`/session/${s.id}`} style={{ fontSize: 14 }}>
              View details →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
//<Link to={/session/${s.id}}>View details</Link> → sends user to details page.
