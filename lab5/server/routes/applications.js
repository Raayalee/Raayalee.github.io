const express = require("express");

const { admin, db } = require("../firebaseAdmin");
const authenticateToken = require("../middleware/auth");

const router = express.Router();
const applicationsRef = db.collection("applications");

router.use(authenticateToken);

router.get("/", async (req, res) => {
  try {
    const { from } = req.query;
    let query = applicationsRef
      .where("userId", "==", req.user.id)
      .orderBy("createdAt", "desc");

    if (from) {
      const fromDate = new Date(from);
      if (!Number.isNaN(fromDate.getTime())) {
        query = query.where(
          "createdAt",
          ">=",
          admin.firestore.Timestamp.fromDate(fromDate)
        );
      }
    }

    const snapshot = await query.get();
    const items = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : null
      };
    });

    return res.json({ items });
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
      const docRef = applicationsRef.doc(id);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        return res.status(404).json({ message: "Application not found." });
      }

      if (docSnap.data().userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied." });
      }

      await docRef.update({
        ...payload,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return res.json({ id: docRef.id });
    }

    const docRef = applicationsRef.doc();
    await docRef.set({
      userId: req.user.id,
      ...payload,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(201).json({ id: docRef.id });
  } catch (error) {
    return res.status(500).json({ message: "Failed to save application.", error: error.message });
  }
});

module.exports = router;
