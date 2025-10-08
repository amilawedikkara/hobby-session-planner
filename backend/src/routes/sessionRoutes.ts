// AI-GENERATED: session CRUD & management endpoints
import express from "express";
import { query } from "../db";
import { generateCode, combineToISO } from "../utils";
import { Request, Response } from "express";

const router = express.Router();

/**
 * Create a session
 * Accepts either:
 *  - start_time: ISO string (preferred)
 *  - OR date + time (for beginner-friendly frontend), converted to start_time
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      start_time, // optional if date+time provided
      date, // optional
      time, // optional
      max_participants,
      type, // 'public' | 'private'
      creator_email,
      location,
      latitude,
      longitude,
    } = req.body;

    // Build start_time
    const finalStart = start_time || combineToISO(date, time);
    if (!finalStart)
      return res
        .status(400)
        .json({ error: "start_time or (date + time) required" });

    const management_code = generateCode(12);
    const private_code = type === "private" ? generateCode(8) : null;

    const result = await query(
      `INSERT INTO sessions
        (title, description, start_time, max_participants, type, management_code, private_code, creator_email, location, latitude, longitude)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        title,
        description,
        finalStart,
        max_participants ?? null,
        type,
        management_code,
        private_code,
        creator_email ?? null,
        location ?? null,
        latitude ?? null,
        longitude ?? null,
      ]
    );

    res.json(result.rows[0]); // ai-gen marker: return created session
  } catch (err) {
    console.error("Create session error:", err);
    res.status(500).json({ error: "Could not create session" });
  }
});

/** List all public sessions */
router.get("/", async (_req: Request, res: Response) => {
  const result = await query(
    `SELECT id, title, description, start_time, max_participants
     FROM sessions
     WHERE type='public'
     ORDER BY start_time ASC`
  );
  res.json(result.rows);
});

/** Get session by numeric id */
router.get("/:id", async (req: Request, res: Response) => {
  const r = await query(`SELECT * FROM sessions WHERE id=$1`, [req.params.id]);
  if (r.rows.length === 0) return res.status(404).json({ error: "Not found" });
  res.json(r.rows[0]);
});

/** Get private session by private_code */
router.get("/by-code/:code", async (req: Request, res: Response) => {
  const r = await query(`SELECT * FROM sessions WHERE private_code=$1`, [
    req.params.code,
  ]);
  if (r.rows.length === 0) return res.status(404).json({ error: "Not found" });
  res.json(r.rows[0]);
});

/** Management view: /sessions/:id/manage?code=XXXX */
// AI-GENERATED: manage view supports numeric id OR private_code
router.get("/:id/manage", async (req: Request, res: Response) => {
  const mgmt = String(req.query.code || "");
  let { id } = req.params;

  // detect private_code (non-numeric)
  if (isNaN(Number(id))) {
    const found = await query(`SELECT * FROM sessions WHERE private_code=$1`, [
      id,
    ]);
    if (found.rowCount === 0)
      return res.status(404).json({ error: "Not found" });
    const session = found.rows[0];
    if (session.management_code !== mgmt)
      return res.status(403).json({ error: "Invalid management code" });

    const attendees = await query(
      `SELECT attendee_name, attendee_email, attendee_phone, attendance_code
       FROM attendance WHERE session_id=$1`,
      [session.id]
    );
    return res.json({ session, attendees: attendees.rows });
  } else {
    // numeric id
    const s = await query(`SELECT * FROM sessions WHERE id=$1`, [id]);
    const session = s.rows[0];
    if (!session) return res.status(404).json({ error: "Not found" });
    if (session.management_code !== mgmt)
      return res.status(403).json({ error: "Invalid management code" });

    const attendees = await query(
      `SELECT attendee_name, attendee_email, attendee_phone, attendance_code
       FROM attendance WHERE session_id=$1`,
      [id]
    );
    return res.json({ session, attendees: attendees.rows });
  }
});

// management view for private session (access by private_code)
router.get("/by-code/:code/manage", async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const mgmt = String(req.query.code || "");

    // find session
    const sessionRes = await query(
      `SELECT * FROM sessions WHERE private_code=$1 AND management_code=$2`,
      [code, mgmt]
    );

    if (sessionRes.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Session not found or invalid code" });
    }

    // declared only after we know it exists
    const session = sessionRes.rows[0];

    // get attendees
    const attendeesRes = await query(
      `SELECT attendee_name, attendee_email, attendee_phone, attendance_code
       FROM attendance WHERE session_id=$1`,
      [session.id]
    );

    res.json({
      session,
      attendees: attendeesRes.rows,
    });
  } catch (err) {
    console.error("Manage by-code error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/** Delete session: /sessions/:id?code=XXXX */
// AI-GENERATED: delete via mgmt code; supports id or private_code
router.delete("/:id", async (req: Request, res: Response) => {
  const mgmt = String(req.query.code || "");
  let { id } = req.params;

  if (isNaN(Number(id))) {
    const s = await query(
      `SELECT id, management_code FROM sessions WHERE private_code=$1`,
      [id]
    );
    if (s.rowCount === 0) return res.status(404).json({ error: "Not found" });
    if (s.rows[0].management_code !== mgmt)
      return res.status(403).json({ error: "Invalid management code" });
    await query(`DELETE FROM sessions WHERE id=$1`, [s.rows[0].id]);
  } else {
    const s = await query(`SELECT management_code FROM sessions WHERE id=$1`, [
      id,
    ]);
    if (s.rowCount === 0) return res.status(404).json({ error: "Not found" });
    if (s.rows[0].management_code !== mgmt)
      return res.status(403).json({ error: "Invalid management code" });
    await query(`DELETE FROM sessions WHERE id=$1`, [id]);
  }

  res.json({ success: true });
});

// AI-GENERATED: update session (edit) via mgmt code; accepts either start_time OR date+time
router.put("/:id", async (req: Request, res: Response) => {
  const mgmt = String(req.query.code || "");
  let { id } = req.params;

  // resolve id if private_code provided
  if (isNaN(Number(id))) {
    const found = await query(`SELECT * FROM sessions WHERE private_code=$1`, [
      id,
    ]);
    if (found.rowCount === 0)
      return res.status(404).json({ error: "Not found" });
    id = found.rows[0].id;
    if (found.rows[0].management_code !== mgmt)
      return res.status(403).json({ error: "Invalid management code" });
  } else {
    const s = await query(`SELECT management_code FROM sessions WHERE id=$1`, [
      id,
    ]);
    if (s.rowCount === 0) return res.status(404).json({ error: "Not found" });
    if (s.rows[0].management_code !== mgmt)
      return res.status(403).json({ error: "Invalid management code" });
  }

  const {
    title,
    description,
    start_time, // optional
    date, // optional
    time, // optional
    max_participants,
    type, // 'public' | 'private'
  } = req.body;

  // compute final start_time
  let finalStart = start_time;
  if (!finalStart && date && time)
    finalStart = new Date(`${date}T${time}:00`).toISOString();

  const result = await query(
    `UPDATE sessions
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         start_time = COALESCE($3, start_time),
         max_participants = COALESCE($4, max_participants),
         type = COALESCE($5, type),
         updated_at = now()
     WHERE id = $6
     RETURNING *`,
    [
      title ?? null,
      description ?? null,
      finalStart ?? null,
      typeof max_participants === "number" ? max_participants : null,
      type ?? null,
      id,
    ]
  );

  res.json(result.rows[0]);
});
/** Update private session: /sessions/by-code/:code?code=MGMT_CODE */
router.put("/by-code/:code", async (req: Request, res: Response) => {
  try {
    const privateCode = req.params.code;
    const mgmt = String(req.query.code || "");

    // find session by private_code
    const found = await query(
      `SELECT id, management_code FROM sessions WHERE private_code=$1`,
      [privateCode]
    );

    if (found.rowCount === 0)
      return res.status(404).json({ error: "Session not found" });
    if (found.rows[0].management_code !== mgmt)
      return res.status(403).json({ error: "Invalid management code" });

    const {
      title,
      description,
      start_time,
      date,
      time,
      max_participants,
      type,
    } = req.body;

    // compute final start_time
    let finalStart = start_time;
    if (!finalStart && date && time)
      finalStart = new Date(`${date}T${time}:00`).toISOString();

    const result = await query(
      `UPDATE sessions
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           start_time = COALESCE($3, start_time),
           max_participants = COALESCE($4, max_participants),
           type = COALESCE($5, type),
           updated_at = now()
       WHERE private_code = $6
       RETURNING *`,
      [
        title ?? null,
        description ?? null,
        finalStart ?? null,
        typeof max_participants === "number" ? max_participants : null,
        type ?? null,
        privateCode,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update private session error:", err);
    res.status(500).json({ error: "Server error" });
  }
});
/** Delete private session: /sessions/by-code/:code?code=MGMT_CODE */
router.delete("/by-code/:code", async (req: Request, res: Response) => {
  try {
    const privateCode = req.params.code;
    const mgmt = String(req.query.code || "");

    const found = await query(
      `SELECT id, management_code FROM sessions WHERE private_code=$1`,
      [privateCode]
    );

    if (found.rowCount === 0)
      return res.status(404).json({ error: "Session not found" });
    if (found.rows[0].management_code !== mgmt)
      return res.status(403).json({ error: "Invalid management code" });

    await query(`DELETE FROM sessions WHERE private_code=$1`, [privateCode]);

    res.json({ success: true });
  } catch (err) {
    console.error("Delete private session error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
