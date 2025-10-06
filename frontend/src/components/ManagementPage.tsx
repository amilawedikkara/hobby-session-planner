// AI-GENERATED: Management page (edit/delete/remove attendees)
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  getManageView,
  updateSession,
  deleteSession,
  managerRemoveAttendee,
} from "../api";

function isoToDateTime(iso?: string) {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

export default function ManagementPage() {
  const { id, code } = useParams(); // id OR private code (route)
  const idOrCode = useMemo(() => id ?? code ?? "", [id, code]);
  const [sp, setSp] = useSearchParams();
  const [mgmtCode, setMgmtCode] = useState(sp.get("code") || "");
  const [data, setData] = useState<any | null>(null); // { session, attendees }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    max_participants: "",
    type: "public",
  });

  useEffect(() => {
    if (!mgmtCode || !idOrCode) return;
    (async () => {
      try {
        setLoading(true);
        const result = await getManageView(idOrCode, mgmtCode);
        setData(result);

        const { date, time } = isoToDateTime(result.session.start_time);
        setForm({
          title: result.session.title || "",
          description: result.session.description || "",
          date,
          time,
          max_participants: result.session.max_participants ?? "",
          type: result.session.type || "public",
        });

        setError(null);
      } catch (err: any) {
        setError(err?.message || "Failed to load management view");
      } finally {
        setLoading(false);
      }
    })();
  }, [idOrCode, mgmtCode]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateSession(idOrCode, mgmtCode, {
        title: form.title,
        description: form.description,
        date: form.date,
        time: form.time,
        max_participants: form.max_participants ? Number(form.max_participants) : null,
        type: form.type,
      });
      alert("Session updated.");
      // refresh
      const result = await getManageView(idOrCode, mgmtCode);
      setData(result);
    } catch (err: any) {
      alert(err?.message || "Failed to update session");
    }
  }

  async function handleRemove(attendanceCode: string) {
    if (!confirm("Remove this attendee?")) return;
    try {
      await managerRemoveAttendee(idOrCode, mgmtCode, attendanceCode);
      const result = await getManageView(idOrCode, mgmtCode);
      setData(result);
    } catch (err: any) {
      alert(err?.message || "Failed to remove attendee");
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this session? This cannot be undone.")) return;
    try {
      await deleteSession(idOrCode, mgmtCode);
      alert("Session deleted.");
      nav("/"); // go back home
    } catch (err: any) {
      alert(err?.message || "Failed to delete session");
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <p><Link to="/">{`← Back to all sessions`}</Link></p>
      <h2>Manage Session</h2>

      <div style={{ marginBottom: 12 }}>
        <label>
          Management code:{" "}
          <input
            value={mgmtCode}
            onChange={(e) => {
              setMgmtCode(e.target.value);
              sp.set("code", e.target.value);
              setSp(sp, { replace: true }); // put in URL
            }}
            placeholder="Enter your management code"
            style={{ width: 280 }}
          />
        </label>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "crimson" }}>Error: {error}</p>}

      {data && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Edit form */}
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h3>Edit session</h3>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Title" required />
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" />
            <input type="date" name="date" value={form.date} onChange={handleChange} required />
            <input type="time" name="time" value={form.time} onChange={handleChange} required />
            <input type="number" name="max_participants" value={form.max_participants} onChange={handleChange} placeholder="Max participants" />
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>

            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit">Save changes</button>
              <button type="button" onClick={handleDelete} style={{ background: "#c92c2c", color: "white" }}>
                Delete session
              </button>
            </div>
          </form>

          {/* Attendees */}
          <div>
            <h3>Attendees ({data.attendees.length})</h3>
            {data.attendees.length === 0 ? (
              <p>No attendees yet.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {data.attendees.map((a: any) => (
                  <li key={a.attendance_code} style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}>
                    <div><strong>{a.attendee_name || "(no name)"}</strong></div>
                    {a.attendee_email && <div style={{ fontSize: 13 }}>{a.attendee_email}</div>}
                    {a.attendee_phone && <div style={{ fontSize: 13 }}>{a.attendee_phone}</div>}
                    <div style={{ fontSize: 12, color: "#555" }}>code: {a.attendance_code}</div>
                    <button onClick={() => handleRemove(a.attendance_code)} style={{ marginTop: 6 }}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
