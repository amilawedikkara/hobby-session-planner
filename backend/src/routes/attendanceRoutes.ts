// AI-GENERATED: attendance join/leave/manage endpoints
import express from "express";
import { query } from "../db";
import { generateCode } from "../utils";

const router = express.Router();

/** Join session: returns attendance_code */
// AI-GENERATED: join session (supports both numeric ID and private code)
router.post("/:idOrCode/join", async (req, res) => {
  try {
    const { idOrCode } = req.params;
    const { attendee_name, attendee_email, attendee_phone } = req.body;

    // Resolve session_id
    let sessionId: number | null = null;

    if (/^\d+$/.test(idOrCode)) {
      sessionId = Number(idOrCode);
    } else {
      const s = await query("SELECT id FROM sessions WHERE private_code=$1", [
        idOrCode,
      ]);
      if (s.rows.length === 0)
        return res.status(404).json({ error: "Session not found" });
      sessionId = s.rows[0].id;
    }

    // Check if session exists and not full
    const existing = await query(
      "SELECT max_participants FROM sessions WHERE id=$1",
      [sessionId]
    );
    if (existing.rows.length === 0)
      return res.status(404).json({ error: "Session not found" });

    const max = existing.rows[0].max_participants;
    if (max && max > 0) {
      const count = await query(
        "SELECT COUNT(*) FROM attendance WHERE session_id=$1",
        [sessionId]
      );
      if (Number(count.rows[0].count) >= max) {
        return res.status(400).json({ error: "Session is full" });
      }
    }

    // Generate attendance code
    const attendanceCode = Math.random().toString(36).substring(2, 10);

    await query(
      "INSERT INTO attendance (session_id, attendee_name, attendee_email, attendee_phone, attendance_code) VALUES ($1,$2,$3,$4,$5)",
      [
        sessionId,
        attendee_name || null,
        attendee_email || null,
        attendee_phone || null,
        attendanceCode,
      ]
    );

    res.json({ success: true, attendance_code: attendanceCode });
  } catch (err: any) {
    console.error("Join error:", err);
    res.status(500).json({ error: "Failed to join session" });
  }
});

// AI-GENERATED: fixed leave route supporting both ID and private code
router.post("/:idOrCode/leave/:attendanceCode", async (req, res) => {
  try {
    const { idOrCode, attendanceCode } = req.params;

    // Step 1: resolve numeric session id from either id or private code
    let sessionId: number | null = null;

    if (/^\d+$/.test(idOrCode)) {
      // public numeric ID
      sessionId = Number(idOrCode);
    } else {
      // private code
      const s = await query("SELECT id FROM sessions WHERE private_code=$1", [
        idOrCode,
      ]);
      if (s.rows.length === 0) {
        console.warn("Leave: session not found for private code", idOrCode);
        return res.status(404).json({ error: "Session not found" });
      }
      sessionId = s.rows[0].id;
    }

    // Step 2: actually remove attendance
    const result = await query(
      "DELETE FROM attendance WHERE session_id=$1 AND attendance_code=$2 RETURNING id",
      [sessionId, attendanceCode]
    );

    if (result.rowCount === 0) {
      console.warn("Leave: invalid attendance code", attendanceCode);
      return res
        .status(404)
        .json({
          success: false,
          message: "Invalid attendance code or session",
        });
    }

    console.log("Leave: attendee removed", attendanceCode);
    res.json({ success: true });
  } catch (err: any) {
    console.error("Leave error:", err.message || err);
    res.status(500).json({ error: "Failed to leave session" });
  }
});

/** Leave session (self): /attendance/:sessionId/leave/:code */
router.delete("/:sessionId/leave/:code", async (req, res) => {
  await query(
    `DELETE FROM attendance WHERE session_id=$1 AND attendance_code=$2`,
    [req.params.sessionId, req.params.code]
  );
  res.json({ success: true });
});

/** Creator removes attendee: /attendance/:sessionId/remove/:attendanceCode?code=MGMT */
// AI-GENERATED: creator removes attendee (supports both numeric ID and private code)
router.delete("/:idOrCode/remove/:attendanceCode", async (req, res) => {
  try {
    const mgmt = String(req.query.code || "");
    const { idOrCode, attendanceCode } = req.params;

    // 1️⃣ Resolve numeric session_id
    let sessionRow;
    if (/^\d+$/.test(idOrCode)) {
      sessionRow = await query("SELECT id, management_code FROM sessions WHERE id=$1", [Number(idOrCode)]);
    } else {
      sessionRow = await query("SELECT id, management_code FROM sessions WHERE private_code=$1", [idOrCode]);
    }

    if (sessionRow.rows.length === 0)
      return res.status(404).json({ error: "Session not found" });

    const session = sessionRow.rows[0];
    if (session.management_code !== mgmt)
      return res.status(403).json({ error: "Invalid management code" });

    // 2️⃣ Delete the attendee
    const result = await query(
      "DELETE FROM attendance WHERE session_id=$1 AND attendance_code=$2 RETURNING id",
      [session.id, attendanceCode]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: "Attendee not found" });

    res.json({ success: true });
  } catch (err: any) {
    console.error("Remove attendee error:", err.message || err);
    res.status(500).json({ error: "Failed to remove attendee" });
  }
});

/** Count attendees */
// count attendees by session id or private code
router.get("/:idOrCode/count", async (req, res) => {
  try {
    const { idOrCode } = req.params;

    // Determine if it's numeric (public) or private code
    let sessionId: number | null = null;

    if (/^\d+$/.test(idOrCode)) {
      // Numeric ID (public)
      sessionId = Number(idOrCode);
    } else {
      // Private code
      const s = await query("SELECT id FROM sessions WHERE private_code=$1", [
        idOrCode,
      ]);
      if (s.rows.length === 0) {
        return res.status(404).json({ error: "Session not found" });
      }
      sessionId = s.rows[0].id;
    }

    // Count attendees for that session ID
    const result = await query(
      "SELECT COUNT(*) FROM attendance WHERE session_id=$1",
      [sessionId]
    );
    res.json({ count: Number(result.rows[0].count) });
  } catch (err: any) {
    console.error("Count error:", err);
    res.status(500).json({ error: "Failed to count attendees" });
  }
});

// AI-GENERATED: management view by session ID or private code
router.get("/:idOrCode/manage", async (req, res) => {
  try {
    const { idOrCode } = req.params;
    const mgmtCode = String(req.query.code || "");

    // 1️⃣ Resolve session id
    let session;
    if (/^\d+$/.test(idOrCode)) {
      // numeric public session
      const result = await query("SELECT * FROM sessions WHERE id=$1", [Number(idOrCode)]);
      if (result.rows.length === 0)
        return res.status(404).json({ error: "Session not found" });
      session = result.rows[0];
    } else {
      // private code (string)
      const result = await query("SELECT * FROM sessions WHERE private_code=$1", [idOrCode]);
      if (result.rows.length === 0)
        return res.status(404).json({ error: "Session not found" });
      session = result.rows[0];
    }

    // 2️⃣ Check management code
    if (session.management_code !== mgmtCode)
      return res.status(403).json({ error: "Invalid management code" });

    // 3️⃣ Get attendees
    const attendees = await query(
      "SELECT * FROM attendance WHERE session_id=$1 ORDER BY created_at ASC",
      [session.id]
    );

    // 4️⃣ Return combined data
    res.json({ session, attendees: attendees.rows });
  } catch (err: any) {
    console.error("Manage error:", err.message || err);
    res.status(500).json({ error: "Failed to load management view" });
  }
});


export default router;
