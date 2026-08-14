// Load .env FIRST before anything else
require("dotenv").config();

const express = require("express");
const jwt     = require("jsonwebtoken");
const bcrypt  = require("bcryptjs");
const fs      = require("fs");
const path    = require("path");
const multer  = require("multer");

const app = express();
app.use(express.json({ limit: "2mb" }));

// ─── Config (all from .env) ───────────────────────────────────────────────
const PORT           = process.env.PORT        || 3001;
const JWT_SECRET     = process.env.JWT_SECRET  || "change-this-secret";
const ADMIN_USER     = process.env.ADMIN_USER  || "admin";
const ADMIN_PASS     = process.env.ADMIN_PASS  || "changeme";
const ADMIN_PASS_HASH= process.env.ADMIN_PASS_HASH || null;
const DATA_DIR    = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(__dirname, "../data");

// Uploaded images directory — served publicly at /uploads/
const UPLOADS_DIR = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(__dirname, "../uploads");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Multer — store images with original extension, max 10MB
const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const ok = /^image\/(jpeg|png|gif|webp|svg\+xml)$/.test(file.mimetype);
    cb(ok ? null : new Error("Only image files are allowed"), ok);
  },
});

// ─── Startup check ────────────────────────────────────────────────────────
console.log("\n=== WAWA Server ===");
console.log(`  Port:      ${PORT}`);
console.log(`  Data dir:  ${DATA_DIR}`);
console.log(`  Uploads:   ${UPLOADS_DIR}`);
console.log(`  Admin:     ${ADMIN_USER}`);
if (!process.env.JWT_SECRET)
  console.warn("  ⚠  JWT_SECRET not set in .env — using insecure default");
if (!process.env.ADMIN_PASS && !process.env.ADMIN_PASS_HASH)
  console.warn("  ⚠  ADMIN_PASS not set in .env — using default password 'changeme'");

// ─── Seed data on first run ───────────────────────────────────────────────
const SEED_DIR = path.join(__dirname, "../data");
["options.json", "resources.json", "option-details.json"].forEach((file) => {
  const dest = path.join(DATA_DIR, file);
  const seed = path.join(SEED_DIR, file);
  if (!fs.existsSync(dest) && fs.existsSync(seed) && dest !== seed) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.copyFileSync(seed, dest);
    console.log(`  Seeded ${file}`);
  }
});

// ─── Auth helpers ─────────────────────────────────────────────────────────
async function checkPassword(plain) {
  if (ADMIN_PASS_HASH) return bcrypt.compare(plain, ADMIN_PASS_HASH);
  return plain === ADMIN_PASS;
}

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer "))
    return res.status(401).json({ error: "Unauthorized — no token" });
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch (e) {
    res.status(401).json({ error: "Token invalid or expired" });
  }
}

// ─── Auth routes ──────────────────────────────────────────────────────────
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });

  const validUser = username === ADMIN_USER;
  const validPass = validUser && (await checkPassword(password));

  if (!validUser || !validPass)
    return res.status(401).json({ error: "Invalid username or password" });

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "12h" });
  console.log(`  Login: ${username} at ${new Date().toISOString()}`);
  res.json({ token });
});

app.get("/api/auth/verify", requireAuth, (req, res) => {
  res.json({ ok: true, user: req.user.username });
});

// ─── Analytics routes ─────────────────────────────────────────────────────
const ANALYTICS_FILE = path.join(DATA_DIR, "analytics.json");
const KEEP_DAYS = 90; // auto-trim events older than this

function readAnalytics() {
  try {
    if (!fs.existsSync(ANALYTICS_FILE)) return { events: [] };
    return JSON.parse(fs.readFileSync(ANALYTICS_FILE, "utf8"));
  } catch { return { events: [] }; }
}

function writeAnalytics(data) {
  // Trim events older than KEEP_DAYS to keep file size manageable
  const cutoff = Date.now() - KEEP_DAYS * 24 * 60 * 60 * 1000;
  data.events = data.events.filter((e) => e.ts > cutoff);
  const tmp = ANALYTICS_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data), "utf8");
  fs.renameSync(tmp, ANALYTICS_FILE);
}

// POST /api/analytics/track — public, no auth (called by the site)
app.post("/api/analytics/track", (req, res) => {
  const { type, path: ePath, id, label } = req.body || {};
  if (!type) return res.status(400).json({ error: "type required" });
  try {
    const data = readAnalytics();
    data.events.push({
      type,
      ...(ePath  && { path: ePath }),
      ...(id     && { id }),
      ...(label  && { label }),
      ts: Date.now(),
    });
    writeAnalytics(data);
    res.json({ ok: true });
  } catch { res.json({ ok: true }); } // never fail silently on client
});

// GET /api/analytics — protected, admin only
app.get("/api/analytics", requireAuth, (req, res) => {
  try {
    res.json(readAnalytics());
  } catch {
    res.status(500).json({ error: "Failed to read analytics" });
  }
});

// ─── Image upload routes ──────────────────────────────────────────────────

// POST /api/upload — upload an image, returns { url }
app.post("/api/upload", requireAuth, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file received" });
  res.json({ url: `/uploads/${req.file.filename}` });
});

// DELETE /api/upload/:filename — delete an uploaded image
app.delete("/api/upload/:filename", requireAuth, (req, res) => {
  const filename = path.basename(req.params.filename); // prevent path traversal
  const file = path.join(UPLOADS_DIR, filename);
  if (!fs.existsSync(file)) return res.status(404).json({ error: "File not found" });
  try {
    fs.unlinkSync(file);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to delete file" });
  }
});

// ─── Content routes ───────────────────────────────────────────────────────
const ALLOWED = ["options", "resources", "option-details", "taxonomy"];

// GET — public (no auth needed, the site reads these)
app.get("/api/content/:name", (req, res) => {
  const name = req.params.name.replace(/[^a-z0-9-]/g, "");
  if (!ALLOWED.includes(name))
    return res.status(400).json({ error: "Unknown content file" });

  const file = path.join(DATA_DIR, `${name}.json`);
  if (!fs.existsSync(file))
    return res.status(404).json({ error: "Not found" });

  try {
    res.json(JSON.parse(fs.readFileSync(file, "utf8")));
  } catch {
    res.status(500).json({ error: "Failed to read file" });
  }
});

// PUT — protected
app.put("/api/content/:name", requireAuth, (req, res) => {
  const name = req.params.name.replace(/[^a-z0-9-]/g, "");
  if (!ALLOWED.includes(name))
    return res.status(400).json({ error: "Unknown content file" });

  if (!["option-details", "taxonomy"].includes(name) && !Array.isArray(req.body))
    return res.status(400).json({ error: "Body must be a JSON array" });

  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const file = path.join(DATA_DIR, `${name}.json`);
    const tmp  = file + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(req.body, null, 2), "utf8");
    fs.renameSync(tmp, file);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to write file" });
  }
});

// ─── Serve uploaded images ────────────────────────────────────────────────
app.use("/uploads", express.static(UPLOADS_DIR));

// ─── Serve React build in production ──────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  const DIST = path.join(__dirname, "../dist");
  if (!fs.existsSync(DIST)) {
    console.error(`  ✗ dist/ folder not found at ${DIST}`);
    console.error("    Run: npm run build");
  } else {
    app.use(express.static(DIST));
    app.use((req, res) => {
      if (!req.path.startsWith("/api"))
        res.sendFile(path.join(DIST, "index.html"));
    });
    console.log(`  Serving React build from: ${DIST}`);
  }
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n  ✓ Server listening on http://0.0.0.0:${PORT}\n`);
});
