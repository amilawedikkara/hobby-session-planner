import React, { useState } from "react";
import { createSession } from "../api";

export default function CreateSession() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    max_participants: "",
    type: "public",
  });

  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const payload = {
        ...form,
        max_participants: form.max_participants
          ? Number(form.max_participants)
          : null,
      };
      const session = await createSession(payload);
      setResult(session); // ai-gen marker: show success
      setForm({
        title: "",
        description: "",
        date: "",
        time: "",
        max_participants: "",
        type: "public",
      });
    } catch (err: any) {
      setError(err?.message || "Failed to create session");
    }
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h2>Create a New Session</h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "8px" }}
      >
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          required
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
        />
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
        />
        <input
          type="time"
          name="time"
          value={form.time}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="max_participants"
          value={form.max_participants}
          onChange={handleChange}
          placeholder="Max participants"
        />
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
        <button type="submit">Create Session</button>
      </form>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #ccc" }}>
          <p>
            <strong>Session created successfully!</strong>
          </p>
          <p>Management code: {result.management_code}</p>
          {result.private_code && (
            <p>
              Private link:{" "}
              <a href={`/session/by-code/${result.private_code}`}>
                /session/by-code/{result.private_code}
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
