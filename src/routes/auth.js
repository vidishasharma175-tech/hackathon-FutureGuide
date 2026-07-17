const express = require("express");
const router = express.Router();
const users = require("../data/users.json");
const { encodeToken } = require("../middleware/rbac");

/**
 * POST /api/auth/login
 * body: { username, password }
 * Demo users (see src/data/users.json): teacher1/demo123, teacher2/demo123,
 * parent1/demo123, school_admin1/demo123, ngo_admin/demo123 (role: admin)
 */
router.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  const user = users.find((u) => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = encodeToken({ username: user.username, role: user.role, linkedId: user.linkedId });
  res.json({ token, role: user.role, linkedId: user.linkedId });
});

module.exports = router;
