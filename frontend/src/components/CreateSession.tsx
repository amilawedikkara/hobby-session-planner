import React, { useState } from "react";
import { createSession } from "../api";

// AI-GENERATED (helper): build view/management links for public or private sessions
type CreatedSession = {
  id: number;
  title: string;
  description?: string | null;
  start_time?: string | null;
  max_participants?: number | null;
  type: "public" | "private";
  management_code: string;
  private_code?: string | null;
};

function buildLinks(s: CreatedSession) {
  const origin = window.location.origin; // e.g., http://localhost:5173
  const viewPath =
    s.type === "private" && s.private_code
      ? `/session/by-code/${s.private_code}`
      : `/session/${s.id}`;

  const managePath = `${viewPath}/manage?code=${encodeURIComponent(
    s.management_code
  )}`;

  return {
    viewPath, // relative path
    managePath, // relative path
    viewUrl: origin + viewPath, // absolute URL (nice for Copy)
    manageUrl: origin + managePath, // absolute URL (nice for Copy)
  };
}

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
  // AI-GENERATED: tiny UI state for "Copied!" feedback
  const [copied, setCopied] = useState<null | "manage" | "view">(null);

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
      setCopied(null);

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

      {result && (() => {
  // AI-GENERATED: build links for both public/private sessions
  const links = buildLinks(result as CreatedSession);

  return (
    <div style={{ marginTop: 16, padding: 12, border: "1px solid #ccc", borderRadius: 6, background: "#f6fff7" }}>
      <p style={{ marginTop: 0, marginBottom: 8 }}>
        <strong>Session created successfully!</strong>
      </p>

      <div style={{ marginBottom: 8 }}>
        <div><strong>Management code:</strong></div>
        <code>{result.management_code}</code>
      </div>

      {/* AI-GENERATED: view link (public: /session/:id, private: /session/by-code/:code) */}
      <div style={{ marginBottom: 10 }}>
        <div>
          <strong>{result.type === "private" ? "Private link:" : "View link:"}</strong>
        </div>

        {/* clickable relative link */}
        <div style={{ marginBottom: 6 }}>
          <a href={links.viewPath}>{links.viewPath}</a>
        </div>

        {/* absolute URL + Copy button */}
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={links.viewUrl}
            readOnly
            aria-label="View link (absolute)"
            style={{ flex: 1, padding: "6px 8px" }}
          />
          <button
            type="button"
            onClick={() =>
              navigator.clipboard
                .writeText(links.viewUrl)
                .then(() => setCopied("view"))
                .catch(() => alert("Copy failed"))
            }
          >
            Copy
          </button>
        </div>
        {copied === "view" && (
          <small style={{ color: "green" }}>Copied view link!</small>
        )}
      </div>

      {/* AI-GENERATED: management link with one-click copy */}
      <div>
        <div><strong>Management link:</strong></div>

        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          <input
            value={links.manageUrl}
            readOnly
            aria-label="Management link (absolute)"
            style={{ flex: 1, padding: "6px 8px" }}
          />
          <button
            type="button"
            onClick={() =>
              navigator.clipboard
                .writeText(links.manageUrl)
                .then(() => setCopied("manage"))
                .catch(() => alert("Copy failed"))
            }
          >
            Copy Management Link
          </button>
        </div>
        {copied === "manage" && (
          <small style={{ color: "green" }}>Copied management link!</small>
        )}
      </div>
    </div>
  );
})()}
    </div>
  );
}