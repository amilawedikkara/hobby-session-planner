// attendance join/leave/manage endpoints
import express from "express";
import { query } from "../db";
import { generateCode } from "../utils";

const router = express.Router();

// join route supports private_code lookup
router.post("/:sessionId/join", async (req, res) => {
  try {
    const { attendee_name, attendee_email, attendee_phone } = req.body;
    let { sessionId } = req.params;

    // if sessionId is not a number, look up by private_code
    if (isNaN(Number(sessionId))) {
      const lookup = await query(
        `SELECT id FROM sessions WHERE private_code=$1`,
        [sessionId]
      );
      if (lookup.rowCount === 0) {
        return res.status(404).json({ error: "Session not found" });
      }
      sessionId = lookup.rows[0].id;
    }

    const attendance_code = generateCode(12);

    const r = await query(
      `INSERT INTO attendance (session_id, attendee_name, attendee_email, attendee_phone, attendance_code)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, session_id, attendee_name, attendance_code`,
      [
        sessionId,
        attendee_name || null,
        attendee_email || null,
        attendee_phone || null,
        attendance_code,
      ]
    );

    res.json(r.rows[0]);
  } catch (err) {
    console.error("Join error:", err);
    res.status(500).json({ error: "Could not join session" });
  }
});

/** Leave session (self): /attendance/:sessionId/leave/:code leave route that checks result*/
// leave route supports private_code lookup
router.delete("/:sessionId/leave/:code", async (req, res) => {
  try {
    let { sessionId, code } = req.params;

    // if sessionId is not numeric, look up by private_code
    if (isNaN(Number(sessionId))) {
      const lookup = await query(
        `SELECT id FROM sessions WHERE private_code=$1`,
        [sessionId]
      );
      if (lookup.rowCount === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Session not found" });
      }
      sessionId = lookup.rows[0].id;
    }

    const result = await query(
      `DELETE FROM attendance WHERE session_id=$1 AND attendance_code=$2 RETURNING id`,
      [sessionId, code]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid attendance code" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Leave error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/** Creator removes attendee: /attendance/:sessionId/remove/:attendanceCode?code=MGMT */
// AI-GENERATED: creator removes attendee via mgmt code; supports id or private_code
router.delete("/:sessionId/remove/:attendanceCode", async (req, res) => {
  const mgmt = String(req.query.code || "");
  let { sessionId, attendanceCode } = req.params;

  // resolve id if private_code
  let resolvedId = sessionId;
  if (isNaN(Number(sessionId))) {
    const found = await query(
      `SELECT id, management_code FROM sessions WHERE private_code=$1`,
      [sessionId]
    );
    if (found.rowCount === 0)
      return res.status(404).json({ error: "Session not found" });
    if (found.rows[0].management_code !== mgmt)
      return res.status(403).json({ error: "Invalid management code" });
    resolvedId = found.rows[0].id;
  } else {
    const s = await query(`SELECT management_code FROM sessions WHERE id=$1`, [
      sessionId,
    ]);
    if (s.rowCount === 0)
      return res.status(404).json({ error: "Session not found" });
    if (s.rows[0].management_code !== mgmt)
      return res.status(403).json({ error: "Invalid management code" });
  }

  await query(
    `DELETE FROM attendance WHERE session_id=$1 AND attendance_code=$2`,
    [resolvedId, attendanceCode]
  );

  res.json({ success: true });
});

// count attendees (works for both numeric ID or private code)
router.get("/:sessionId/count", async (req, res) => {
  try {
    let sessionId = req.params.sessionId;

    // if sessionId isn't a number, look it up by private_code
    if (isNaN(Number(sessionId))) {
      const lookup = await query(
        `SELECT id FROM sessions WHERE private_code=$1`,
        [sessionId]
      );
      if (lookup.rowCount === 0) {
        return res.status(404).json({ error: "Session not found" });
      }
      sessionId = lookup.rows[0].id; // use the numeric id
    }

    const r = await query(
      `SELECT COUNT(*)::int AS count FROM attendance WHERE session_id=$1`,
      [sessionId]
    );

    res.json(r.rows[0]);
  } catch (err) {
    console.error("Count error:", err);
    res.status(500).json({ error: "Server error while counting attendees" });
  }
});

export default router;
