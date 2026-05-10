const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { query } = require("../db");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const createToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT secret is not configured.");
  }

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      displayName: user.displayName || ""
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

router.post("/register", async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "User already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await query(
      "INSERT INTO users (email, display_name, password_hash) VALUES ($1, $2, $3) RETURNING id, email, display_name",
      [email, displayName || "", passwordHash]
    );

    const user = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      displayName: result.rows[0].display_name || ""
    };
    const token = createToken(user);

    return res.status(201).json({ token, user });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed.", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const result = await query(
      "SELECT id, email, display_name, password_hash FROM users WHERE email = $1",
      [email]
    );
    const userDoc = result.rows[0];
    if (!userDoc) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isValid = await bcrypt.compare(password, userDoc.password_hash || "");

    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = {
      id: userDoc.id,
      email: userDoc.email,
      displayName: userDoc.display_name || ""
    };
    const token = createToken(user);

    return res.json({ token, user });
  } catch (error) {
    return res.status(500).json({ message: "Login failed.", error: error.message });
  }
});

router.get("/profile", authenticateToken, async (req, res) => {
  try {
    if (!isUuid(req.user.id)) {
      return res.status(401).json({ message: "Invalid user id." });
    }

    const result = await query(
      "SELECT id, email, display_name FROM users WHERE id = $1",
      [req.user.id]
    );
    const userDoc = result.rows[0];
    if (!userDoc) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json({
      id: userDoc.id,
      email: userDoc.email,
      displayName: userDoc.display_name || ""
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch profile.", error: error.message });
  }
});

module.exports = router;
