// AI-GENERATED: session CRUD & management endpoints
import express from "express";
import { query } from "../db";
import { generateCode, combineToISO } from "../utils";

const router = express.Router();

/**
 * Create a session
 * Accepts either:
 *  - start_time: ISO string (preferred)
 *  - OR date + time (for beginner-friendly frontend), converted to start_time
 */
router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      start_time,         // optional if date+time provided
      date,               // optional
      time,               // optional
      max_participants,
      type,               // 'public' | 'private'
      creator_email,
      location,
      latitude,
      longitude,
    } = req.body;

    // Build start_time
    const finalStart = start_time || combineToISO(date, time);
    if (!finalStart) return res.status(400).json({ error: "start_time or (date + time) required" });

    const management_code = generateCode(12);
    const private_code = type === "private" ? generateCode(8) : null;

    const result = await query(
      `INSERT INTO sessions
        (title, description, start_time, max_participants, type, management_code, private_code, creator_email, location, latitude, longitude)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [title, description, finalStart, max_participants ?? null, type, management_code, private_code, creator_email ?? null, location ?? null, latitude ?? null, longitude ?? null]
    );

    res.json(result.rows[0]); // ai-gen marker: return created session
  } catch (err) {
    console.error("Create session error:", err);
    res.status(500).json({ error: "Could not create session" });
  }
});

/** List all public sessions */
router.get("/", async (_req, res) => {
  const result = await query(
    `SELECT id, title, description, start_time, max_participants
     FROM sessions
     WHERE type='public'
     ORDER BY start_time ASC`
  );
  res.json(result.rows);
});

/** Get session by numeric id */
router.get("/:id", async (req, res) => {
  const r = await query(`SELECT * FROM sessions WHERE id=$1`, [req.params.id]);
  if (r.rows.length === 0) return res.status(404).json({ error: "Not found" });
  res.json(r.rows[0]);
});

/** Get private session by private_code */
router.get("/by-code/:code", async (req, res) => {
  const r = await query(`SELECT * FROM sessions WHERE private_code=$1`, [req.params.code]);
  if (r.rows.length === 0) return res.status(404).json({ error: "Not found" });
  res.json(r.rows[0]);
});

/** Management view: /sessions/:id/manage?code=XXXX */
router.get("/:id/manage", async (req, res) => {
  const mgmt = String(req.query.code || "");
  const s = await query(`SELECT * FROM sessions WHERE id=$1`, [req.params.id]);
  const session = s.rows[0];
  if (!session) return res.status(404).json({ error: "Not found" });
  if (session.management_code !== mgmt) return res.status(403).json({ error: "Invalid management code" });

  const attendees = await query(
    `SELECT attendee_name, attendee_email, attendee_phone, attendance_code
     FROM attendance WHERE session_id=$1`,
    [req.params.id]
  );

  res.json({ session, attendees: attendees.rows });
});

/** Delete session: /sessions/:id?code=XXXX */
router.delete("/:id", async (req, res) => {
  const mgmt = String(req.query.code || "");
  const s = await query(`SELECT management_code FROM sessions WHERE id=$1`, [req.params.id]);
  if (s.rows.length === 0) return res.status(404).json({ error: "Not found" });
  if (s.rows[0].management_code !== mgmt) return res.status(403).json({ error: "Invalid management code" });

  await query(`DELETE FROM sessions WHERE id=$1`, [req.params.id]);
  res.json({ success: true });
});

export default router;
