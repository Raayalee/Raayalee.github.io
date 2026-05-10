const express = require("express");

const { query } = require("../db");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

router.use(authenticateToken);

router.get("/", async (req, res) => {
  try {
    const { from } = req.query;
    const params = [req.user.id];
    let sql =
      "SELECT id, user_id, name, email, hackathon, project, idea, status, created_at, updated_at " +
      "FROM applications WHERE user_id = $1";

    if (from) {
      const fromDate = new Date(from);
      if (!Number.isNaN(fromDate.getTime())) {
        params.push(fromDate);
        sql += ` AND created_at >= $${params.length}`;
      }
    }

    sql += " ORDER BY created_at DESC";
    const result = await query(sql, params);
    const items = result.rows;

    return res.json({
      items: items.map((item) => ({
        id: item.id,
        userId: item.user_id,
        name: item.name,
        email: item.email,
        hackathon: item.hackathon,
        project: item.project,
        idea: item.idea,
        status: item.status,
        createdAt: item.created_at ? item.created_at.toISOString() : null,
        updatedAt: item.updated_at ? item.updated_at.toISOString() : null
      }))
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch applications.", error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { id, name, email, hackathon, project, idea, status } = req.body;

    if (!project || !name || !email || !hackathon || !idea) {
      return res.status(400).json({ message: "Required fields are missing." });
    }

    const payload = {
      name: String(name || "").trim(),
      email: String(email || "").trim(),
      hackathon: String(hackathon || "").trim(),
      project: String(project || "").trim(),
      idea: String(idea || "").trim(),
      status: status || "draft"
    };

    if (id) {
      const existing = await query(
        "SELECT id FROM applications WHERE id = $1 AND user_id = $2",
        [id, req.user.id]
      );

      if (existing.rows.length === 0) {
        return res.status(404).json({ message: "Application not found." });
      }

      await query(
        "UPDATE applications SET name = $1, email = $2, hackathon = $3, project = $4, idea = $5, status = $6, updated_at = NOW() WHERE id = $7",
        [
          payload.name,
          payload.email,
          payload.hackathon,
          payload.project,
          payload.idea,
          payload.status,
          id
        ]
      );

      return res.json({ id });
    }

    const result = await query(
      "INSERT INTO applications (user_id, name, email, hackathon, project, idea, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
      [
        req.user.id,
        payload.name,
        payload.email,
        payload.hackathon,
        payload.project,
        payload.idea,
        payload.status
      ]
    );

    return res.status(201).json({ id: result.rows[0].id });
  } catch (error) {
    return res.status(500).json({ message: "Failed to save application.", error: error.message });
  }
});

module.exports = router;
