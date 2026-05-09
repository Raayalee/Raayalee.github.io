const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { admin, db } = require("../firebaseAdmin");
const authenticateToken = require("../middleware/auth");

const router = express.Router();
const usersRef = db.collection("users");

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

    const existing = await usersRef.where("email", "==", email).limit(1).get();
    if (!existing.empty) {
      return res.status(409).json({ message: "User already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRef = usersRef.doc();

    await userRef.set({
      email,
      displayName: displayName || "",
      passwordHash,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const user = { id: userRef.id, email, displayName: displayName || "" };
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

    const existing = await usersRef.where("email", "==", email).limit(1).get();
    if (existing.empty) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const userDoc = existing.docs[0];
    const userData = userDoc.data();
    const isValid = await bcrypt.compare(password, userData.passwordHash || "");

    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = {
      id: userDoc.id,
      email: userData.email,
      displayName: userData.displayName || ""
    };
    const token = createToken(user);

    return res.json({ token, user });
  } catch (error) {
    return res.status(500).json({ message: "Login failed.", error: error.message });
  }
});

router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const userDoc = await usersRef.doc(req.user.id).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found." });
    }

    const userData = userDoc.data();
    return res.json({
      id: userDoc.id,
      email: userData.email,
      displayName: userData.displayName || ""
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch profile.", error: error.message });
  }
});

module.exports = router;
