import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { and, asc, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { db } from "../db/client";
import { sqlite } from "../db/client";
import {
  agendas,
  announcements,
  banners,
  complaints,
  downloads,
  facilities,
  files,
  galleries,
  galleryItems,
  majors,
  messages,
  schoolProfile,
  schoolSettings,
  studentAgendas,
  studentAnnouncements,
  studentInfos,
  studentServices,
  teachers,
  testimonials,
  users
} from "../db/schema";
import { storageMode, storeUploadedFile } from "../lib/storage";
import { fail, hashPassword, normalizeBulletList, normalizeTeacherImportRow, ok, parseCsv, pick, resolveGoogleSheetCsvUrl, slugify, socialProfileUrl } from "../lib/utils";

type AnyTable = any;

const tokenSecret = process.env.TOKEN_SECRET ?? "ubah-secret-ini-di-env";
const googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth";
const googleTokenUrl = "https://oauth2.googleapis.com/token";
const googleUserInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo";
const editorFeatureKeys = [
  "settings", "profile", "banners", "majors", "teachers", "facilities", "galleries", "galleryItems",
  "agendas", "announcements", "studentInfos", "studentServices", "studentAnnouncements", "studentAgendas",
  "downloads", "messages", "complaints", "testimonials", "upload"
] as const;

const tableFields = {
  majors: ["name", "slug", "fieldCategory", "profileMarkdown", "profileCtaLabel", "profileCtaUrl", "instagram", "tiktok", "facebook", "youtube", "description", "competencies", "careerProspects", "practiceFacilities", "productiveTeachers", "achievements", "imageUrl", "isFeatured"],
  teachers: ["name", "photoUrl", "position", "subject", "expertise", "status"],
  facilities: ["name", "description", "imageUrl", "isFeatured"],
  galleries: ["title", "slug", "category", "description", "coverUrl", "albumUrl", "showOnHome"],
  galleryItems: ["galleryId", "type", "title", "fileUrl", "youtubeUrl", "isFeatured"],
  agendas: ["title", "startDate", "endDate", "location", "description", "status"],
  announcements: ["title", "content", "isPriority", "attachmentUrl", "status", "publishedAt"],
  studentInfos: ["title", "category", "content", "isPriority", "attachmentUrl", "status", "publishedAt"],
  studentServices: ["title", "description", "url", "icon", "sortOrder", "isActive"],
  studentAnnouncements: ["title", "content", "isPriority", "attachmentUrl", "status", "publishedAt"],
  studentAgendas: ["title", "startDate", "endDate", "location", "description", "registrationUrl", "status"],
  downloads: ["title", "category", "description", "fileUrl", "fileType", "fileSize"],
  banners: ["title", "subtitle", "imageUrl", "ctaLabel", "ctaUrl", "sortOrder", "isActive"],
  messages: ["name", "email", "phone", "subject", "message", "status"],
  complaints: ["name", "reporterRole", "classOrUnit", "phone", "email", "category", "title", "complaint", "attachmentUrl", "expectation", "status"],
  testimonials: ["name", "graduationYear", "occupation", "photoUrl", "whatsapp", "telegram", "instagram", "tiktok", "facebook", "youtube", "message", "status"]
} as const;

function sign(value: string) {
  return createHmac("sha256", tokenSecret).update(value).digest("hex");
}

function createToken(userId: number) {
  const payload = `${userId}.${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

function oauthRedirectUri(c: any) {
  if (process.env.GOOGLE_REDIRECT_URI) return process.env.GOOGLE_REDIRECT_URI;
  const url = new URL(c.req.url);
  return `${url.origin}/api/auth/google/callback`;
}

function googleOauthConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function createOauthState() {
  return randomBytes(24).toString("hex");
}

async function adminUserForGoogleEmail(email = "") {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) return null;
  const user = await db.select().from(users).where(eq(users.email, normalized)).get();
  if (!user || (user.role !== "admin" && user.role !== "editor")) return null;
  return user;
}

function safeRedirectPath(value: unknown, fallback = "/") {
  const input = String(value || "").trim();
  if (!input || !input.startsWith("/") || input.startsWith("//") || input.startsWith("/api/")) return fallback;
  return input;
}

function makeUsernameFromEmail(email: string) {
  const prefix = email.split("@")[0] || "user";
  return slugify(prefix).replace(/-/g, ".") || "user";
}

async function uniqueUsername(base: string) {
  const seed = base || "user";
  let candidate = seed;
  let suffix = 1;
  while (await db.select({ id: users.id }).from(users).where(eq(users.username, candidate)).get()) {
    suffix += 1;
    candidate = `${seed}.${suffix}`;
  }
  return candidate;
}

function publicUserPayload(user: any) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    address: user.address || "",
    districtId: user.districtId || "",
    districtName: user.districtName || "",
    villageId: user.villageId || "",
    villageName: user.villageName || "",
    whatsapp: user.whatsapp || "",
    profileCompleted: Boolean(user.profileCompleted)
  };
}

async function userForPublicGoogleProfile(profile: { email?: string; name?: string; sub?: string }) {
  const email = String(profile.email || "").trim().toLowerCase();
  if (!email) return null;
  const existing = await db.select().from(users).where(eq(users.email, email)).get();
  const now = new Date().toISOString();
  if (existing) {
    const [row] = await db.update(users).set({
      googleSub: String(profile.sub || existing.googleSub || ""),
      lastLoginAt: now
    } as never).where(eq(users.id, existing.id)).returning();
    return row;
  }
  const name = String(profile.name || email.split("@")[0] || "Pengguna").trim();
  const [row] = await db.insert(users).values({
    name,
    username: await uniqueUsername(makeUsernameFromEmail(email)),
    email,
    password: await hashPassword(randomBytes(18).toString("hex")),
    role: "user",
    googleSub: String(profile.sub || ""),
    lastLoginAt: now
  } as never).returning();
  return row;
}

function verifyToken(token = "") {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const payload = `${parts[0]}.${parts[1]}`;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(parts[2]);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  return Number(parts[0]);
}

function normalizeBody(resource: keyof typeof tableFields, body: Record<string, unknown>) {
  const data = pick(body, [...tableFields[resource]]);
  if ("name" in data && !("slug" in data) && (resource === "majors")) data.slug = slugify(String(data.name));
  if ("title" in data && !("slug" in data) && resource === "galleries") data.slug = slugify(String(data.title));
  if (resource === "majors") {
    if ("instagram" in data) data.instagram = socialProfileUrl("instagram", String(data.instagram || ""));
    if ("tiktok" in data) data.tiktok = socialProfileUrl("tiktok", String(data.tiktok || ""));
    if ("facebook" in data) data.facebook = socialProfileUrl("facebook", String(data.facebook || ""));
    if ("youtube" in data) data.youtube = socialProfileUrl("youtube", String(data.youtube || ""));
  }
  if (resource === "testimonials") {
    data.whatsapp = socialProfileUrl("whatsapp", String(data.whatsapp || ""));
    data.telegram = socialProfileUrl("telegram", String(data.telegram || ""));
    data.instagram = socialProfileUrl("instagram", String(data.instagram || ""));
    data.tiktok = socialProfileUrl("tiktok", String(data.tiktok || ""));
    data.facebook = socialProfileUrl("facebook", String(data.facebook || ""));
    data.youtube = socialProfileUrl("youtube", String(data.youtube || ""));
  }
  return data;
}

function normalizeTeacherStatus(value: string) {
  const input = String(value || "").trim();
  if (!input) return "active";
  return /non|tidak|inactive|pensiun|purna/i.test(input) ? "inactive" : "active";
}

async function readGoogleSheetTeachers(sheetUrl: string) {
  const csvUrl = resolveGoogleSheetCsvUrl(sheetUrl);
  if (!csvUrl) throw new Error("URL Google Sheets tidak valid.");
  const response = await fetch(csvUrl);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Google Sheets tidak ditemukan. Pastikan URL/ID sheet benar.");
    }
    if (response.status === 403) {
      throw new Error("Google Sheets belum dapat diakses. Pastikan sheet sudah dibagikan publik atau dipublish sebagai CSV.");
    }
    throw new Error(`Gagal mengambil data Google Sheets (HTTP ${response.status}).`);
  }
  const rows = parseCsv(await response.text());
  if (rows.length < 2) throw new Error("Google Sheets tidak memiliki data.");
  const headers = rows[0].map((header) => String(header || "").trim());
  const records = rows.slice(1).map((row) => normalizeTeacherImportRow(headers, row)).filter((row): row is NonNullable<typeof row> => Boolean(row?.name));
  if (!records.length) {
    throw new Error("Data ditemukan, tetapi tidak ada baris yang cocok dengan header template. Gunakan Template Google Sheets yang disediakan.");
  }
  return records.map((row) => ({
    ...row,
    status: normalizeTeacherStatus(row.status)
  }));
}

function teacherImportTemplateCsv() {
  const rows = [
    ["Nama", "Jabatan", "Mapel", "Bidang Keahlian", "Status", "Photo URL"],
    ["Dermawan Triwahyono, S.T., M.M.", "Kepala Sekolah", "Manajemen Sekolah", "Kepemimpinan Pendidikan", "active", "https://example.com/kepala-sekolah.jpg"],
    ["Sri Wahyuni, S.Pd.", "Wakil Kepala Sekolah", "Kesiswaan", "Manajemen Kesiswaan", "active", "https://example.com/waka-kesiswaan.jpg"],
    ["Ahmad Fauzi, S.Kom.", "Ketua Konsentrasi Keahlian", "Rekayasa Perangkat Lunak", "Rekayasa Perangkat Lunak", "active", "https://example.com/kaprodi-rpl.jpg"],
    ["Siti Aminah, S.Pd.", "Guru", "Matematika", "Matematika", "active", "https://example.com/guru-matematika.jpg"]
  ];
  return `${rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n")}\n`;
}

async function requireAdmin(c: any, next: any) {
  const user = await currentUser(c);
  if (!user) return c.json(fail("Sesi admin tidak valid.", 401), 401);
  if (user.role !== "admin") return c.json(fail("Akses admin diperlukan.", 403), 403);
  c.set("user", user);
  await next();
}

async function currentUser(c: any) {
  const header = c.req.header("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : getCookie(c, "session");
  const userId = verifyToken(token);
  if (!userId) return null;
  return await db.select({
    id: users.id,
    name: users.name,
    username: users.username,
    email: users.email,
    role: users.role,
    address: users.address,
    districtId: users.districtId,
    districtName: users.districtName,
    villageId: users.villageId,
    villageName: users.villageName,
    whatsapp: users.whatsapp,
    profileCompleted: users.profileCompleted
  }).from(users).where(eq(users.id, userId)).get();
}

function normalizeEditorPermissions(value: unknown) {
  const raw = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? (() => {
        try {
          return JSON.parse(value);
        } catch {
          return [];
        }
      })()
      : [];
  const allowed = new Set(editorFeatureKeys);
  return Array.isArray(raw) ? raw.map(String).filter((key) => allowed.has(key as never)) : [];
}

function normalizeRole(value: unknown) {
  if (String(value || "").trim() === "user") return "user";
  return String(value || "").trim() === "editor" ? "editor" : "admin";
}

async function requireLoggedIn(c: any, next: any) {
  const user = await currentUser(c);
  if (!user) return c.json(fail("Sesi login tidak valid.", 401), 401);
  c.set("user", user);
  await next();
}

async function getEditorPermissions() {
  const settings = await db.select().from(schoolSettings).get();
  return normalizeEditorPermissions((settings as any)?.editorPermissions);
}

async function requireAuthenticated(c: any, next: any) {
  const user = await currentUser(c);
  if (!user) return c.json(fail("Sesi admin tidak valid.", 401), 401);
  if (user.role !== "admin" && user.role !== "editor") return c.json(fail("Akses admin/editor diperlukan.", 403), 403);
  c.set("user", user);
  c.set("editorPermissions", user.role === "admin" ? [...editorFeatureKeys] : await getEditorPermissions());
  await next();
}

function requireFeature(feature: string) {
  return async (c: any, next: any) => {
    const user = await currentUser(c);
    if (!user) return c.json(fail("Sesi admin tidak valid.", 401), 401);
    if (user.role === "admin") {
      c.set("user", user);
      await next();
      return;
    }
    const permissions = await getEditorPermissions();
    if (user.role !== "editor" || !permissions.includes(feature)) {
      return c.json(fail("Akses editor tidak diizinkan untuk fitur ini.", 403), 403);
    }
    c.set("user", user);
    c.set("editorPermissions", permissions);
    await next();
  };
}

function crud(app: Hono, path: string, table: AnyTable, resource: keyof typeof tableFields, adminOnly = true) {
  const guard = adminOnly ? requireFeature(String(resource)) : async (_c: any, next: any) => next();

  app.get(path, async (c) => {
    const rows = await db.select().from(table).orderBy(desc((table as any).id));
    return c.json(ok(rows));
  });

  app.get(`${path}/:id`, async (c) => {
    const row = await db.select().from(table).where(eq((table as any).id, Number(c.req.param("id")))).get();
    if (!row) return c.json(fail("Data tidak ditemukan.", 404), 404);
    return c.json(ok(row));
  });

  app.post(path, guard, async (c) => {
    const body = await c.req.json<Record<string, unknown>>();
    const data = normalizeBody(resource, body);
    const row = ((await db.insert(table).values(data as never).returning()) as unknown as any[])[0];
    return c.json(ok(row), 201);
  });

  app.put(`${path}/:id`, guard, async (c) => {
    const body = await c.req.json<Record<string, unknown>>();
    const data = normalizeBody(resource, body);
    const row = ((await db.update(table).set(data as never).where(eq((table as any).id, Number(c.req.param("id")))).returning()) as unknown as any[])[0];
    if (!row) return c.json(fail("Data tidak ditemukan.", 404), 404);
    return c.json(ok(row));
  });

  app.delete(`${path}/:id`, guard, async (c) => {
    const deleted = ((await db.delete(table).where(eq((table as any).id, Number(c.req.param("id")))).returning({ id: (table as any).id })) as unknown as Array<{ id: number }>)[0];
    if (!deleted) return c.json(fail("Data tidak ditemukan.", 404), 404);
    return c.json(ok({ deleted: true, id: deleted.id }));
  });
}

export function apiRoutes() {
  const app = new Hono();

  app.get("/health", (c) => c.json(ok({ status: "ok", port: 2005 })));

  app.post("/auth/login", (c) => {
    return c.json(fail("Login username/password sudah dinonaktifkan. Gunakan Google.", 410), 410);
  });

  app.get("/auth/google", async (c) => {
    if (!googleOauthConfigured()) return c.json(fail("Google OAuth belum dikonfigurasi.", 400), 400);
    const state = createOauthState();
    const context = c.req.query("context") === "admin" ? "admin" : "public";
    const next = safeRedirectPath(c.req.query("next"), "/");
    setCookie(c, "google_oauth_state", state, { httpOnly: true, sameSite: "Lax", path: "/", maxAge: 60 * 10 });
    setCookie(c, "google_oauth_context", context, { httpOnly: true, sameSite: "Lax", path: "/", maxAge: 60 * 10 });
    setCookie(c, "google_oauth_next", next, { httpOnly: true, sameSite: "Lax", path: "/", maxAge: 60 * 10 });
    const url = new URL(googleAuthUrl);
    url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!);
    url.searchParams.set("redirect_uri", oauthRedirectUri(c));
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("state", state);
    url.searchParams.set("prompt", "select_account");
    return c.redirect(url.toString(), 302);
  });

  app.get("/auth/google/callback", async (c) => {
    if (!googleOauthConfigured()) return c.redirect("/admin/login?oauth=not_configured", 302);
    const state = String(c.req.query("state") || "");
    const savedState = getCookie(c, "google_oauth_state") || "";
    const context = getCookie(c, "google_oauth_context") === "admin" ? "admin" : "public";
    const next = safeRedirectPath(getCookie(c, "google_oauth_next"), "/");
    const failureTarget = context === "admin" ? "/admin/login" : next;
    const failureRedirect = (code: string) => `${failureTarget}${failureTarget.includes("?") ? "&" : "?"}oauth=${code}`;
    setCookie(c, "google_oauth_state", "", { path: "/", maxAge: 0 });
    setCookie(c, "google_oauth_context", "", { path: "/", maxAge: 0 });
    setCookie(c, "google_oauth_next", "", { path: "/", maxAge: 0 });
    if (!state || !savedState || state !== savedState) return c.redirect(failureRedirect("invalid_state"), 302);
    const code = String(c.req.query("code") || "");
    if (!code) return c.redirect(failureRedirect("missing_code"), 302);

    try {
      const tokenResponse = await fetch(googleTokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          code,
          grant_type: "authorization_code",
          redirect_uri: oauthRedirectUri(c)
        })
      });
      if (!tokenResponse.ok) return c.redirect(failureRedirect("token_failed"), 302);
      const tokenData = await tokenResponse.json() as { access_token?: string };
      if (!tokenData.access_token) return c.redirect(failureRedirect("token_missing"), 302);

      const userInfoResponse = await fetch(googleUserInfoUrl, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      if (!userInfoResponse.ok) return c.redirect(failureRedirect("userinfo_failed"), 302);
      const profile = await userInfoResponse.json() as { email?: string; email_verified?: boolean; name?: string; sub?: string };
      if (profile.email_verified === false) return c.redirect(failureRedirect("email_unverified"), 302);
      const user = context === "admin"
        ? await adminUserForGoogleEmail(profile.email)
        : await userForPublicGoogleProfile(profile);
      if (!user) return c.redirect(failureRedirect(context === "admin" ? "user_not_allowed" : "user_missing"), 302);

      const token = createToken(user.id);
      setCookie(c, "session", token, { httpOnly: true, sameSite: "Lax", path: "/", maxAge: 60 * 60 * 8 });
      return c.redirect(context === "admin" ? "/admin" : `${next}${next.includes("?") ? "&" : "?"}login=success`, 302);
    } catch {
      return c.redirect(failureRedirect("failed"), 302);
    }
  });

  app.post("/auth/logout", (c) => {
    setCookie(c, "session", "", { path: "/", maxAge: 0 });
    return c.json(ok({ logout: true }));
  });

  app.get("/auth/me", requireAuthenticated, (c) => c.json(ok({
    ...(c as any).get("user"),
    permissions: (c as any).get("editorPermissions") || []
  })));

  app.get("/auth/session", requireLoggedIn, (c) => c.json(ok(publicUserPayload((c as any).get("user")))));

  app.put("/auth/profile", requireLoggedIn, async (c) => {
    const user = (c as any).get("user");
    const body = await c.req.json<Record<string, unknown>>();
    const name = String(body.name || "").trim();
    const districtId = String(body.districtId || "").trim();
    const districtName = String(body.districtName || "").trim();
    const villageId = String(body.villageId || "").trim();
    const villageName = String(body.villageName || "").trim();
    const address = String(body.address || "").trim();
    const whatsapp = String(body.whatsapp || "").replace(/[^\d+]/g, "").replace(/^\+/, "");
    if (!name) return c.json(fail("Nama wajib diisi."), 400);
    if (!districtId || !districtName) return c.json(fail("Kecamatan wajib dipilih."), 400);
    if (!villageId || !villageName) return c.json(fail("Desa/kelurahan wajib dipilih."), 400);
    if (!address) return c.json(fail("Alamat detail wajib diisi."), 400);
    if (!whatsapp) return c.json(fail("Nomor WA wajib diisi."), 400);
    const [row] = await db.update(users).set({
      name,
      districtId,
      districtName,
      villageId,
      villageName,
      address,
      whatsapp: whatsapp.replace(/^0/, "62"),
      profileCompleted: true
    } as never).where(eq(users.id, user.id)).returning();
    return c.json(ok(publicUserPayload(row)));
  });

  app.get("/editor-permissions", requireAdmin, async (c) => c.json(ok({
    permissions: await getEditorPermissions(),
    features: editorFeatureKeys
  })));

  app.put("/editor-permissions", requireAdmin, async (c) => {
    const body = await c.req.json<Record<string, unknown>>();
    const permissions = normalizeEditorPermissions(body.permissions);
    const current = await db.select().from(schoolSettings).get();
    const [row] = current
      ? await db.update(schoolSettings).set({ editorPermissions: permissions } as never).where(eq(schoolSettings.id, current.id)).returning()
      : await db.insert(schoolSettings).values({ schoolName: "Website Sekolah", editorPermissions: permissions } as never).returning();
    return c.json(ok({ permissions: normalizeEditorPermissions((row as any).editorPermissions) }));
  });

  app.get("/users", requireAdmin, async (c) => {
    const rows = await db.select({
      id: users.id,
      name: users.name,
      username: users.username,
      email: users.email,
      role: users.role,
      address: users.address,
      districtId: users.districtId,
      districtName: users.districtName,
      villageId: users.villageId,
      villageName: users.villageName,
      whatsapp: users.whatsapp,
      profileCompleted: users.profileCompleted,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt
    }).from(users).orderBy(desc(users.id));
    return c.json(ok(rows));
  });

  app.post("/users", requireAdmin, async (c) => {
    const body = await c.req.json<Record<string, unknown>>();
    const password = String(body.password || "");
    if (!password) return c.json(fail("Password wajib diisi."), 400);
    const [row] = await db.insert(users).values({
      name: String(body.name || ""),
      username: String(body.username || ""),
      email: String(body.email || ""),
      password: await hashPassword(password),
      role: normalizeRole(body.role)
    }).returning({
      id: users.id,
      name: users.name,
      username: users.username,
      email: users.email,
      role: users.role,
      address: users.address,
      districtId: users.districtId,
      districtName: users.districtName,
      villageId: users.villageId,
      villageName: users.villageName,
      whatsapp: users.whatsapp,
      profileCompleted: users.profileCompleted,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt
    });
    return c.json(ok(row), 201);
  });

  app.put("/users/:id", requireAdmin, async (c) => {
    const body = await c.req.json<Record<string, unknown>>();
    const data: Record<string, unknown> = pick(body, ["name", "username", "email", "role"]);
    if ("role" in data) data.role = normalizeRole(data.role);
    if (body.password) data.password = await hashPassword(String(body.password));
    const [row] = await db.update(users).set(data as never).where(eq(users.id, Number(c.req.param("id")))).returning({
      id: users.id,
      name: users.name,
      username: users.username,
      email: users.email,
      role: users.role,
      address: users.address,
      districtId: users.districtId,
      districtName: users.districtName,
      villageId: users.villageId,
      villageName: users.villageName,
      whatsapp: users.whatsapp,
      profileCompleted: users.profileCompleted,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt
    });
    if (!row) return c.json(fail("User tidak ditemukan.", 404), 404);
    return c.json(ok(row));
  });

  app.delete("/users/:id", requireAdmin, async (c) => {
    const currentUser = (c as any).get("user");
    const id = Number(c.req.param("id"));
    if (currentUser?.id === id) return c.json(fail("User yang sedang login tidak bisa menghapus dirinya sendiri."), 400);
    await db.delete(users).where(eq(users.id, id));
    return c.json(ok({ deleted: true }));
  });

  app.get("/public/home", async (c) => {
    const [settings, profile] = await Promise.all([
      db.select().from(schoolSettings).get(),
      db.select().from(schoolProfile).get()
    ]);
    const payload = {
      settings,
      profile,
      banners: await db.select().from(banners).where(eq(banners.isActive, true)).orderBy(asc(banners.sortOrder)),
      teachers: await db.select().from(teachers).where(eq(teachers.status, "active")).limit(999),
      majors: await db.select().from(majors).where(eq(majors.isFeatured, true)).limit(6),
      facilities: await db.select().from(facilities).where(eq(facilities.isFeatured, true)).limit(6),
      agendas: await db.select().from(agendas).where(eq(agendas.status, "scheduled")).orderBy(asc(agendas.startDate)),
      announcements: await db.select().from(announcements).where(and(eq(announcements.status, "active"), eq(announcements.isPriority, true))).orderBy(desc(announcements.publishedAt)).limit(5),
      galleries: await db.select().from(galleries).where(eq(galleries.showOnHome, true)).orderBy(desc(galleries.createdAt)).limit(6),
      testimonials: await db.select().from(testimonials).where(eq(testimonials.status, "approved")).orderBy(desc(testimonials.createdAt)).limit(6)
    };
    return c.json(ok(payload));
  });

  app.get("/public/profile", async (c) => c.json(ok({
    settings: await db.select().from(schoolSettings).get(),
    profile: await db.select().from(schoolProfile).get(),
    facilities: await db.select().from(facilities).orderBy(asc(facilities.name))
  })));

  app.get("/public/agendas", async (c) => c.json(ok(
    await db.select().from(agendas).where(eq(agendas.status, "scheduled")).orderBy(asc(agendas.startDate))
  )));

  app.get("/public/student-infos", async (c) => c.json(ok(
    await db.select().from(studentInfos).where(eq(studentInfos.status, "active")).orderBy(desc(studentInfos.publishedAt))
  )));

  app.get("/public/student-services", async (c) => c.json(ok(
    await db.select().from(studentServices).where(eq(studentServices.isActive, true)).orderBy(asc(studentServices.sortOrder))
  )));

  app.get("/public/student-announcements", async (c) => c.json(ok(
    await db.select().from(studentAnnouncements).where(eq(studentAnnouncements.status, "active")).orderBy(desc(studentAnnouncements.publishedAt))
  )));

  app.get("/public/student-agendas", async (c) => c.json(ok(
    await db.select().from(studentAgendas).where(eq(studentAgendas.status, "scheduled")).orderBy(asc(studentAgendas.startDate))
  )));

  app.get("/public/wordpress", async (c) => {
    const settings = await db.select().from(schoolSettings).get();
    if (!settings?.wordpressUrl) return c.json(ok([]));
    try {
      const base = settings.wordpressUrl.replace(/\/$/, "");
      const origin = new URL(base).origin;
      const candidates = Array.from(new Set([base, origin]));
      let posts: any[] = [];
      for (const candidate of candidates) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);
        try {
          const response = await fetch(`${candidate}/wp-json/wp/v2/posts?_embed=1&per_page=12`, { signal: controller.signal });
          if (!response.ok) continue;
          const payload = await response.json();
          posts = Array.isArray(payload) ? payload : [];
          break;
        } catch {
          continue;
        } finally {
          clearTimeout(timeout);
        }
      }
      return c.json(ok(posts.map((post: any) => ({
        title: post.title?.rendered?.replace(/<[^>]+>/g, ""),
        excerpt: post.excerpt?.rendered?.replace(/<[^>]+>/g, ""),
        date: post.date,
        link: post.link,
        image: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? ""
      }))));
    } catch {
      return c.json(ok([]));
    }
  });

  app.get("/public/nav-updates", async (c) => {
    const latest = (query: string) => String((sqlite.prepare(query).get() as { value?: string } | undefined)?.value || "");
    let berita = "";
    try {
      const settings = await db.select().from(schoolSettings).get();
      if (settings?.wordpressUrl) {
        const base = settings.wordpressUrl.replace(/\/$/, "");
        const origin = new URL(base).origin;
        const candidates = Array.from(new Set([base, origin]));
        for (const candidate of candidates) {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 1800);
          try {
            const response = await fetch(`${candidate}/wp-json/wp/v2/posts?per_page=1&orderby=date&order=desc`, { signal: controller.signal });
            if (!response.ok) continue;
            const payload = await response.json();
            berita = Array.isArray(payload) ? String(payload[0]?.date || "") : "";
            break;
          } catch {
            continue;
          } finally {
            clearTimeout(timeout);
          }
        }
      }
    } catch {
      berita = "";
    }
    return c.json(ok({
      galeri: latest("SELECT MAX(created_at) as value FROM galleries"),
      agenda: latest("SELECT MAX(created_at) as value FROM agendas WHERE status = 'scheduled'"),
      pengumuman: latest("SELECT MAX(published_at) as value FROM announcements WHERE status = 'active'"),
      unduhan: latest("SELECT MAX(created_at) as value FROM downloads"),
      berita
    }));
  });

  app.get("/settings", async (c) => {
    const settings = await db.select().from(schoolSettings).get();
    if (!settings) return c.json(ok(settings));
    const { editorPermissions: _editorPermissions, ...safeSettings } = settings as any;
    return c.json(ok(safeSettings));
  });
  app.put("/settings", requireFeature("settings"), async (c) => {
    const body = await c.req.json<Record<string, unknown>>();
    const current = await db.select().from(schoolSettings).get();
    const data = pick(body, ["schoolName", "tagline", "logoUrl", "faviconUrl", "themeColor", "address", "email", "phone", "whatsapp", "socialLinks", "quickLinks", "mapEmbed", "wordpressUrl", "ppdbUrl", "metaDescription", "footerText"]);
    const [row] = current
      ? await db.update(schoolSettings).set(data as never).where(eq(schoolSettings.id, current.id)).returning()
      : await db.insert(schoolSettings).values(data as never).returning();
    return c.json(ok(row));
  });

  app.get("/profile", async (c) => c.json(ok(await db.select().from(schoolProfile).get())));
  app.put("/profile", requireFeature("profile"), async (c) => {
    const body = await c.req.json<Record<string, unknown>>();
    const current = await db.select().from(schoolProfile).get();
    const data = pick(body, ["history", "vision", "mission", "principalName", "principalGreeting", "principalPhotoUrl", "profileSummaryImageUrl", "principalCtaLabel", "principalCtaUrl", "identity", "management", "organization", "accreditation", "location"]);
    if ("mission" in data) {
      data.mission = normalizeBulletList(String(data.mission || ""));
    }
    const [row] = current
      ? await db.update(schoolProfile).set(data as never).where(eq(schoolProfile.id, current.id)).returning()
      : await db.insert(schoolProfile).values(data as never).returning();
    return c.json(ok(row));
  });

  crud(app, "/majors", majors, "majors", true);
  crud(app, "/teachers", teachers, "teachers", true);

  app.get("/teachers/import/template.csv", requireFeature("teachers"), (c) => {
    return new Response(teacherImportTemplateCsv(), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": 'attachment; filename="template-guru-tendik.csv"',
        "cache-control": "no-store"
      }
    });
  });

  app.post("/teachers/import/google-sheets", requireFeature("teachers"), async (c) => {
    try {
      const body = await c.req.json<Record<string, unknown>>();
      const sheetUrl = String(body.url || body.sheetUrl || "").trim();
      const mode = String(body.mode || "upsert").trim() === "replace" ? "replace" : "upsert";
      const imported = await readGoogleSheetTeachers(sheetUrl);
      if (!imported.length) return c.json(fail("Tidak ada data guru yang bisa diimpor."), 400);

      let inserted = 0;
      let updated = 0;
      if (mode === "replace") {
        await db.delete(teachers);
        if (imported.length) {
          await db.insert(teachers).values(imported as never);
          inserted = imported.length;
        }
      } else {
        const existingTeachers = await db.select().from(teachers);
        const byName = new Map(existingTeachers.map((teacher) => [teacher.name.toLowerCase(), teacher]));
        for (const row of imported) {
          const existing = byName.get(row.name.toLowerCase());
          if (existing) {
            await db.update(teachers).set({
              photoUrl: row.photoUrl,
              position: row.position,
              subject: row.subject,
              expertise: row.expertise,
              status: row.status
            }).where(eq(teachers.id, existing.id));
            updated += 1;
          } else {
            await db.insert(teachers).values(row as never);
            inserted += 1;
          }
        }
      }

      return c.json(ok({ imported: imported.length, inserted, updated, mode }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Import Google Sheets gagal.";
      return c.json(fail(message, 400), 400);
    }
  });

  crud(app, "/facilities", facilities, "facilities", true);
  crud(app, "/galleries", galleries, "galleries", true);
  crud(app, "/gallery-items", galleryItems as never, "galleryItems", true);
  crud(app, "/agendas", agendas as never, "agendas", true);
  crud(app, "/announcements", announcements as never, "announcements", true);
  crud(app, "/student-infos", studentInfos as never, "studentInfos", true);
  crud(app, "/student-services", studentServices as never, "studentServices", true);
  crud(app, "/student-announcements", studentAnnouncements as never, "studentAnnouncements", true);
  crud(app, "/student-agendas", studentAgendas as never, "studentAgendas", true);
  crud(app, "/downloads", downloads as never, "downloads", true);
  crud(app, "/banners", banners as never, "banners", true);
  crud(app, "/complaints", complaints as never, "complaints", true);
  crud(app, "/testimonials", testimonials as never, "testimonials", true);

  app.post("/public/testimonials", async (c) => {
    const contentType = String(c.req.header("content-type") || "");
    let body: Record<string, unknown>;
    let photoUrl = "";
    if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const form = await c.req.parseBody();
      body = form as Record<string, unknown>;
      const photo = form.photo;
      if (photo instanceof File && photo.size > 0) {
        if (!photo.type.startsWith("image/")) return c.json(fail("Foto harus berupa file gambar."), 400);
        if (photo.size > 5 * 1024 * 1024) return c.json(fail("Ukuran foto maksimal 5 MB."), 400);
        const stored = await storeUploadedFile(photo, "testimonials");
        photoUrl = stored.url;
      }
    } else {
      body = await c.req.json<Record<string, unknown>>();
      photoUrl = String(body.photoUrl || "").trim();
    }
    const name = String(body.name || "").trim();
    const message = String(body.message || "").trim();
    if (!name || !message) return c.json(fail("Nama dan testimoni wajib diisi."), 400);
    const [row] = await db.insert(testimonials).values({
      name,
      graduationYear: String(body.graduationYear || "").trim(),
      occupation: String(body.occupation || "").trim(),
      photoUrl,
      whatsapp: socialProfileUrl("whatsapp", String(body.whatsapp || "")),
      telegram: socialProfileUrl("telegram", String(body.telegram || "")),
      instagram: socialProfileUrl("instagram", String(body.instagram || "")),
      tiktok: socialProfileUrl("tiktok", String(body.tiktok || "")),
      facebook: socialProfileUrl("facebook", String(body.facebook || "")),
      youtube: socialProfileUrl("youtube", String(body.youtube || "")),
      message,
      status: "pending"
    }).returning();
    return c.json(ok(row), 201);
  });

  app.post("/messages", async (c) => {
    const body = await c.req.json<Record<string, unknown>>();
    const data = pick(body, ["name", "email", "phone", "subject", "message"]);
    const [row] = await db.insert(messages).values(data as never).returning();
    return c.json(ok(row), 201);
  });

  app.post("/public/complaints", async (c) => {
    let data: Record<string, unknown> = {};
    const contentType = String(c.req.header("content-type") || "");
    if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const body = await c.req.parseBody();
      data = pick(body as Record<string, unknown>, ["name", "reporterRole", "classOrUnit", "phone", "email", "category", "title", "complaint", "expectation"]);
      const input = body.attachment;
      if (input instanceof File && input.size > 0) {
        const stored = await storeUploadedFile(input, "complaints");
        data.attachmentUrl = stored.url;
      }
    } else {
      const body = await c.req.json<Record<string, unknown>>();
      data = pick(body, ["name", "reporterRole", "classOrUnit", "phone", "email", "category", "title", "complaint", "attachmentUrl", "expectation"]);
    }
    if (!String(data.name || "").trim()) return c.json(fail("Nama wajib diisi."), 400);
    if (!String(data.title || "").trim()) return c.json(fail("Judul pengaduan wajib diisi."), 400);
    if (!String(data.complaint || "").trim()) return c.json(fail("Isi pengaduan wajib diisi."), 400);
    const [row] = await db.insert(complaints).values(data as never).returning();
    return c.json(ok(row), 201);
  });

  app.get("/messages", requireFeature("messages"), async (c) => c.json(ok(await db.select().from(messages).orderBy(desc(messages.id)))));
  app.get("/messages/:id", requireFeature("messages"), async (c) => {
    const row = await db.select().from(messages).where(eq(messages.id, Number(c.req.param("id")))).get();
    if (!row) return c.json(fail("Data tidak ditemukan.", 404), 404);
    return c.json(ok(row));
  });
  app.put("/messages/:id", requireFeature("messages"), async (c) => {
    const body = await c.req.json<Record<string, unknown>>();
    const data = pick(body, ["name", "email", "phone", "subject", "message", "status"]);
    const [row] = await db.update(messages).set(data as never).where(eq(messages.id, Number(c.req.param("id")))).returning();
    if (!row) return c.json(fail("Data tidak ditemukan.", 404), 404);
    return c.json(ok(row));
  });
  app.delete("/messages/:id", requireFeature("messages"), async (c) => {
    await db.delete(messages).where(eq(messages.id, Number(c.req.param("id"))));
    return c.json(ok({ deleted: true }));
  });

  app.post("/upload", requireFeature("upload"), async (c) => {
    const body = await c.req.parseBody();
    const input = body.file;
    if (!(input instanceof File)) return c.json(fail("Field file wajib diisi."), 400);
    const stored = await storeUploadedFile(input);
    const [row] = await db.insert(files).values({
      ...stored
    }).returning();
    return c.json(ok(row), 201);
  });

  app.get("/stats", requireAuthenticated, async (c) => {
    const count = (table: string) => Number((sqlite.prepare(`SELECT COUNT(*) as count FROM ${table}`).get() as { count?: number } | undefined)?.count ?? 0);
    const countWhere = (table: string, column: string, value: string) =>
      Number((sqlite.prepare(`SELECT COUNT(*) as count FROM ${table} WHERE ${column} = ?`).get(value) as { count?: number } | undefined)?.count ?? 0);
    const stats: Record<string, unknown> = {
      majors: count("majors"),
      teachers: count("teachers"),
      galleries: count("galleries"),
      agendas: count("agendas"),
      announcements: count("announcements"),
      studentInfos: count("student_infos"),
      studentServices: count("student_services"),
      studentAnnouncements: count("student_announcements"),
      studentAgendas: count("student_agendas"),
      downloads: count("downloads"),
      messages: count("messages"),
      complaints: count("complaints"),
      testimonials: count("testimonials"),
      newMessages: countWhere("messages", "status", "new"),
      newComplaints: countWhere("complaints", "status", "new"),
      pendingTestimonials: countWhere("testimonials", "status", "pending"),
      users: count("users"),
      storageMode: storageMode()
    };
    const user = (c as any).get("user");
    if (user?.role === "admin") return c.json(ok(stats));
    const permissions = new Set((c as any).get("editorPermissions") || []);
    const aliases: Record<string, string> = { newMessages: "messages", newComplaints: "complaints", pendingTestimonials: "testimonials" };
    return c.json(ok(Object.fromEntries(Object.entries(stats).filter(([key]) => key === "storageMode" || permissions.has(aliases[key] || key)))));
  });

  return app;
}
