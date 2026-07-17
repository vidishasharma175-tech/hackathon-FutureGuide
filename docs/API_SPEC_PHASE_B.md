# EduPath — Phase B API Spec (Dashboards, Aggregation, RBAC)

Builds on Phase A (see `API_SPEC.md`). All Phase B routes are protected by basic
RBAC (see `src/middleware/rbac.js`). The RBAC layer is intentionally simple in
this demo; follow the notes below when moving to production.

## Auth

### POST /api/auth/login
```json
{ "username": "teacher1", "password": "demo123" }
```
**Response 200**: `{ token, role, linkedId }`. Send the token on subsequent requests:
`Authorization: Bearer <token>`

**Demo users** (`src/data/users.json`):
| username | password | role | linkedId |
|---|---|---|---|
| teacher1 | demo123 | teacher | tch-01 |
| teacher2 | demo123 | teacher | tch-02 |
| parent1 | demo123 | parent | par-01 |
| school_admin1 | demo123 | school_admin | sch-100 |
| ngo_admin | demo123 | admin | — |

`admin` role passes every RBAC check regardless of the route's required roles.

---

RBAC caveat (updated)

- By default the server now uses signed JWT access tokens if you set `JWT_SECRET` in
  your `.env`. Tokens are produced by `POST /api/auth/login` and should be sent as
  `Authorization: Bearer <token>`. Signed JWTs are recommended for any real deployment.
- For demo convenience, if `JWT_SECRET` is not set the code falls back to the
  previous base64-encoded JSON token scheme (with a console.warn at startup). This
  fallback is insecure and should only be used for local demos. Set `JWT_SECRET`
  before deploying to staging/production.
- Demo plaintext passwords in `src/data/users.json` are automatically migrated to
  bcrypt hashes on first successful login. This makes local demos safer while
  preserving the existing user/password pairs for convenience.

Before handling real student data: set `JWT_SECRET` (a secure random string),
replace demo users with a proper user store, use HTTPS, and move to signed
JWT + hashed passwords + proper session management.

