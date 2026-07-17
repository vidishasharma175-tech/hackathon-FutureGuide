/**
 * Role-Based Access Control — improved with JWT support and safe fallback.
 *
 * Behavior:
 * - If process.env.JWT_SECRET is set, tokens are expected to be signed JWTs
 *   and are verified using jsonwebtoken. encodeToken will sign JWTs as well.
 * - If JWT_SECRET is NOT set, the legacy base64-encoded JSON token behavior
 *   is used (with a console.warn). This preserves demo compatibility but is
 *   NOT secure — set JWT_SECRET in production.
 */

const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;
const usingJwt = Boolean(SECRET);
if (!usingJwt) {
  console.warn("[rbac] JWT_SECRET not set — falling back to legacy base64 tokens. Set JWT_SECRET to enable signed JWTs.");
}

function encodeToken(payload) {
  if (usingJwt) {
    // short-lived token by default; adjust expiresIn as needed
    return jwt.sign(payload, SECRET, { expiresIn: "7d" });
  }
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

function decodeToken(token) {
  if (!token) return null;
  if (usingJwt) {
    try {
      return jwt.verify(token, SECRET);
    } catch (e) {
      return null;
    }
  }
  try {
    return JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
  } catch (e) {
    return null;
  }
}

/**
 * Reads `Authorization: Bearer <token>` and attaches req.user.
 * Does not block the request if missing/invalid — combine with requireRole()
 * on routes that need enforcement.
 */
function attachUser(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  req.user = token ? decodeToken(token) : null;
  next();
}

/**
 * Route guard: requireRole('teacher', 'admin') allows only those roles through.
 * 'admin' is implicitly allowed on every guarded route.
 *
 * If called with no arguments (requireRole()), only 'admin' is allowed.
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Missing or invalid Authorization token. POST /api/auth/login first." });
    }
    if (req.user.role === "admin" || roles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ error: `Requires one of roles: ${roles.join(", ")}` });
  };
}

module.exports = { encodeToken, decodeToken, attachUser, requireRole };
