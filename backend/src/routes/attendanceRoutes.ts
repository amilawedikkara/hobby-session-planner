// AI-GENERATED: attendance join/leave/manage endpoints
import express from "express";
import { query } from "../db";
import { generateCode } from "../utils";

const router = express.Router();

/** Join session: returns attendance_code */
router.post("/:sessionId/join", async (req, res) => {
  try {
    const { attendee_name, attendee_email, attendee_phone } = req.body;
    const attendance_code = generateCode(12);

    const r = await query(
      `INSERT INTO attendance (session_id, attendee_name, attendee_email, attendee_phone, attendance_code)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, session_id, attendee_name, attendance_code`,
      [req.params.sessionId, attendee_name || null, attendee_email || null, attendee_phone || null, attendance_code]
    );

    res.json(r.rows[0]); // ai-gen marker: return attendance code
  } catch (err) {
    console.error("Join error:", err);
    res.status(500).json({ error: "Could not join" });
  }
});

/** Leave session (self): /attendance/:sessionId/leave/:code leave route that checks result*/
router.delete("/:sessionId/leave/:code", async (req, res) => {
  try {
    const result = await query(
      `DELETE FROM attendance WHERE session_id=$1 AND attendance_code=$2 RETURNING id`,
      [req.params.sessionId, req.params.code]
    );

    if (result.rowCount === 0) {
      // no attendee matched this code
      return res.status(404).json({ success: false, message: "Invalid attendance code" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Leave error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/** Creator removes attendee: /attendance/:sessionId/remove/:attendanceCode?code=MGMT */
router.delete("/:sessionId/remove/:attendanceCode", async (req, res) => {
  const mgmt = String(req.query.code || "");
  const s = await query(`SELECT management_code FROM sessions WHERE id=$1`, [req.params.sessionId]);
  if (s.rows.length === 0) return res.status(404).json({ error: "Session not found" });
  if (s.rows[0].management_code !== mgmt) return res.status(403).json({ error: "Invalid management code" });

  await query(`DELETE FROM attendance WHERE session_id=$1 AND attendance_code=$2`, [
    req.params.sessionId,
    req.params.attendanceCode,
  ]);

  res.json({ success: true });
});

/** Count attendees */
router.get("/:sessionId/count", async (req, res) => {
  const r = await query(`SELECT COUNT(*)::int AS count FROM attendance WHERE session_id=$1`, [
    req.params.sessionId,
  ]);
  res.json(r.rows[0]); // { count: 3 }
});

export default router;
