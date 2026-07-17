const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const { encodeToken } = require("../middleware/rbac");

// Note: users.json is a demo user store. In production use a proper user DB.
const USERS_PATH = path.join(__dirname, "..", "data", "users.json");

function loadUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_PATH, "utf-8"));
  } catch (e) {
    return [];
  }
}

function saveUsers(users) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
}

/**
 * POST /api/auth/login
 * body: { username, password }
 * Demo users (see src/data/users.json) are accepted. Passwords may be
 * plaintext (legacy demo) or bcrypt hashes. On successful login, if a
 * demo user's password is stored in plaintext, we migrate it to a bcrypt
 * hash and update src/data/users.json on disk (safe one-time upgrade).
 */
router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "username and password required" });

  const users = loadUsers();
  const idx = users.findIndex((u) => u.username === username);
  if (idx === -1) return res.status(401).json({ error: "Invalid credentials" });

  const user = users[idx];

  try {
    let passwordMatches = false;

    // If the stored password looks like a bcrypt hash, use bcrypt.compare
    if (typeof user.password === "string" && user.password.startsWith("$2")) {
      passwordMatches = await bcrypt.compare(password, user.password);
    } else {
      // Legacy plaintext demo password — accept exact match and migrate to bcrypt
      passwordMatches = password === user.password;
      if (passwordMatches) {
        try {
          const hash = await bcrypt.hash(password, 10);
          users[idx].password = hash;
          saveUsers(users);
          console.log(`[auth] Migrated demo user ${username} to bcrypt-hashed password.`);
        } catch (e) {
          console.warn(`[auth] Failed to migrate password for user ${username}:`, e.message);
        }
      }
    }

    if (!passwordMatches) return res.status(401).json({ error: "Invalid credentials" });

    const token = encodeToken({ username: user.username, role: user.role, linkedId: user.linkedId });
    res.json({ token, role: user.role, linkedId: user.linkedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
