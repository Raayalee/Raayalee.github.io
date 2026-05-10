const express = require("express");

const { query } = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const hackathonsResult = await query("SELECT slug, data FROM hackathons ORDER BY slug ASC");
    const participantsResult = await query(
      "SELECT id, data FROM participants ORDER BY points DESC, id ASC"
    );

    const hackathons = hackathonsResult.rows.map((row) => ({
      slug: row.slug,
      ...(row.data || {})
    }));

    const participants = participantsResult.rows.map((row) => ({
      id: row.id,
      ...(row.data || {})
    }));

    return res.json({ hackathons, participants });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch public data.", error: error.message });
  }
});

module.exports = router;
