import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { createHmac, timingSafeEqual } from "node:crypto";
import { and, asc, desc, eq, or } from "drizzle-orm";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { db } from "../db/client";
import { sqlite } from "../db/client";
import {
  agendas,
  announcements,
  banners,
  downloads,
  facilities,
  files,
  galleries,
  galleryItems,
  majors,
  messages,
  schoolProfile,
  schoolSettings,
  teachers,
  testimonials,
  users
} from "../db/schema";
import { fail, hashPassword, ok, pick, slugify, socialProfileUrl, verifyPassword } from "../lib/utils";

type AnyTable = any;

const tokenSecret = process.env.TOKEN_SECRET ?? "ubah-secret-ini-di-env";
const uploadDir = process.env.UPLOAD_DIR ?? "./uploads";

const tableFields = {
  majors: ["name", "slug", "description", "competencies", "careerProspects", "practiceFacilities", "productiveTeachers", "achievements", "imageUrl", "isFeatured"],
  teachers: ["name", "photoUrl", "position", "subject", "expertise", "status"],
  facilities: ["name", "description", "imageUrl", "isFeatured"],
  galleries: ["title", "slug", "category", "description", "coverUrl", "showOnHome"],
  galleryItems: ["galleryId", "type", "title", "fileUrl", "youtubeUrl", "isFeatured"],
  agendas: ["title", "startDate", "endDate", "location", "description", "status"],
  announcements: ["title", "content", "isPriority", "attachmentUrl", "status", "publishedAt"],
  downloads: ["title", "category", "description", "fileUrl", "fileType", "fileSize"],
  banners: ["title", "subtitle", "imageUrl", "ctaLabel", "ctaUrl", "sortOrder", "isActive"],
  messages: ["name", "email", "phone", "subject", "message", "status"],
  testimonials: ["name", "graduationYear", "occupation", "photoUrl", "instagram", "tiktok", "facebook", "message", "status"]
} as const;

function sign(value: string) {
  return createHmac("sha256", tokenSecret).update(value).digest("hex");
}

function createToken(userId: number) {
  const payload = `${userId}.${Date.now()}`;
  return `${payload}.${sign(payload)}`;
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
  if (resource === "testimonials") {
    data.instagram = socialProfileUrl("instagram", String(data.instagram || ""));
    data.tiktok = socialProfileUrl("tiktok", String(data.tiktok || ""));
    data.facebook = socialProfileUrl("facebook", String(data.facebook || ""));
  }
  return data;
}

async function requireAdmin(c: any, next: any) {
  const header = c.req.header("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : getCookie(c, "session");
  const userId = verifyToken(token);
  if (!userId) return c.json(fail("Sesi admin tidak valid.", 401), 401);
  const user = await db.select({
    id: users.id,
    name: users.name,
    username: users.username,
    email: users.email,
    role: users.role
  }).from(users).where(eq(users.id, userId)).get();
  if (!user) return c.json(fail("User tidak ditemukan.", 401), 401);
  if (user.role !== "admin") return c.json(fail("Akses admin diperlukan.", 403), 403);
  c.set("user", user);
  await next();
}

function crud(app: Hono, path: string, table: AnyTable, resource: keyof typeof tableFields, adminOnly = true) {
  const guard = adminOnly ? requireAdmin : async (_c: any, next: any) => next();

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
    await db.delete(table).where(eq((table as any).id, Number(c.req.param("id"))));
    return c.json(ok({ deleted: true }));
  });
}

export function apiRoutes() {
  const app = new Hono();

  app.get("/health", (c) => c.json(ok({ status: "ok", port: 2005 })));

  app.post("/auth/login", async (c) => {
    const { email, username, password } = await c.req.json<{ email?: string; username?: string; password: string }>();
    const login = String(username || email || "").trim();
    const user = await db.select().from(users).where(or(eq(users.email, login), eq(users.username, login))).get();
    if (!user || !(await verifyPassword(password, user.password))) {
      return c.json(fail("Username/email atau password salah.", 401), 401);
    }
    if (user.role !== "admin") return c.json(fail("Akses admin diperlukan.", 403), 403);
    const token = createToken(user.id);
    setCookie(c, "session", token, { httpOnly: true, sameSite: "Lax", path: "/", maxAge: 60 * 60 * 8 });
    return c.json(ok({ token, user: { id: user.id, name: user.name, username: user.username, email: user.email, role: user.role } }));
  });

  app.post("/auth/logout", (c) => {
    setCookie(c, "session", "", { path: "/", maxAge: 0 });
    return c.json(ok({ logout: true }));
  });

  app.get("/auth/me", requireAdmin, (c) => c.json(ok((c as any).get("user"))));

  app.get("/users", requireAdmin, async (c) => {
    const rows = await db.select({
      id: users.id,
      name: users.name,
      username: users.username,
      email: users.email,
      role: users.role,
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
      role: String(body.role || "admin")
    }).returning({
      id: users.id,
      name: users.name,
      username: users.username,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt
    });
    return c.json(ok(row), 201);
  });

  app.put("/users/:id", requireAdmin, async (c) => {
    const body = await c.req.json<Record<string, unknown>>();
    const data: Record<string, unknown> = pick(body, ["name", "username", "email", "role"]);
    if (body.password) data.password = await hashPassword(String(body.password));
    const [row] = await db.update(users).set(data as never).where(eq(users.id, Number(c.req.param("id")))).returning({
      id: users.id,
      name: users.name,
      username: users.username,
      email: users.email,
      role: users.role,
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
      agendas: await db.select().from(agendas).where(eq(agendas.status, "scheduled")).orderBy(asc(agendas.startDate)).limit(5),
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

  app.get("/public/wordpress", async (c) => {
    const settings = await db.select().from(schoolSettings).get();
    if (!settings?.wordpressUrl) return c.json(ok([]));
    try {
      const base = settings.wordpressUrl.replace(/\/$/, "");
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      const response = await fetch(`${base}/wp-json/wp/v2/posts?_embed=1&per_page=3`, { signal: controller.signal });
      clearTimeout(timeout);
      if (!response.ok) return c.json(ok([]));
      const posts = await response.json();
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

  app.get("/settings", async (c) => c.json(ok(await db.select().from(schoolSettings).get())));
  app.put("/settings", requireAdmin, async (c) => {
    const body = await c.req.json<Record<string, unknown>>();
    const current = await db.select().from(schoolSettings).get();
    const data = pick(body, ["schoolName", "tagline", "logoUrl", "faviconUrl", "themeColor", "address", "email", "phone", "whatsapp", "socialLinks", "mapEmbed", "wordpressUrl", "ppdbUrl", "metaDescription", "footerText"]);
    const [row] = current
      ? await db.update(schoolSettings).set(data as never).where(eq(schoolSettings.id, current.id)).returning()
      : await db.insert(schoolSettings).values(data as never).returning();
    return c.json(ok(row));
  });

  app.get("/profile", async (c) => c.json(ok(await db.select().from(schoolProfile).get())));
  app.put("/profile", requireAdmin, async (c) => {
    const body = await c.req.json<Record<string, unknown>>();
    const current = await db.select().from(schoolProfile).get();
    const data = pick(body, ["history", "vision", "mission", "principalName", "principalGreeting", "principalPhotoUrl", "principalCtaLabel", "principalCtaUrl", "identity", "organization", "accreditation", "location"]);
    const [row] = current
      ? await db.update(schoolProfile).set(data as never).where(eq(schoolProfile.id, current.id)).returning()
      : await db.insert(schoolProfile).values(data as never).returning();
    return c.json(ok(row));
  });

  crud(app, "/majors", majors, "majors", true);
  crud(app, "/teachers", teachers, "teachers", true);
  crud(app, "/facilities", facilities, "facilities", true);
  crud(app, "/galleries", galleries, "galleries", true);
  crud(app, "/gallery-items", galleryItems as never, "galleryItems", true);
  crud(app, "/agendas", agendas as never, "agendas", true);
  crud(app, "/announcements", announcements as never, "announcements", true);
  crud(app, "/downloads", downloads as never, "downloads", true);
  crud(app, "/banners", banners as never, "banners", true);
  crud(app, "/testimonials", testimonials as never, "testimonials", true);

  app.post("/public/testimonials", async (c) => {
    const body = await c.req.json<Record<string, unknown>>();
    const name = String(body.name || "").trim();
    const message = String(body.message || "").trim();
    if (!name || !message) return c.json(fail("Nama dan testimoni wajib diisi."), 400);
    const [row] = await db.insert(testimonials).values({
      name,
      graduationYear: String(body.graduationYear || "").trim(),
      occupation: String(body.occupation || "").trim(),
      photoUrl: String(body.photoUrl || "").trim(),
      instagram: socialProfileUrl("instagram", String(body.instagram || "")),
      tiktok: socialProfileUrl("tiktok", String(body.tiktok || "")),
      facebook: socialProfileUrl("facebook", String(body.facebook || "")),
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

  app.get("/messages", requireAdmin, async (c) => c.json(ok(await db.select().from(messages).orderBy(desc(messages.id)))));
  app.get("/messages/:id", requireAdmin, async (c) => {
    const row = await db.select().from(messages).where(eq(messages.id, Number(c.req.param("id")))).get();
    if (!row) return c.json(fail("Data tidak ditemukan.", 404), 404);
    return c.json(ok(row));
  });
  app.put("/messages/:id", requireAdmin, async (c) => {
    const body = await c.req.json<Record<string, unknown>>();
    const data = pick(body, ["name", "email", "phone", "subject", "message", "status"]);
    const [row] = await db.update(messages).set(data as never).where(eq(messages.id, Number(c.req.param("id")))).returning();
    if (!row) return c.json(fail("Data tidak ditemukan.", 404), 404);
    return c.json(ok(row));
  });
  app.delete("/messages/:id", requireAdmin, async (c) => {
    await db.delete(messages).where(eq(messages.id, Number(c.req.param("id"))));
    return c.json(ok({ deleted: true }));
  });

  app.post("/upload", requireAdmin, async (c) => {
    const body = await c.req.parseBody();
    const input = body.file;
    if (!(input instanceof File)) return c.json(fail("Field file wajib diisi."), 400);
    await mkdir(uploadDir, { recursive: true });
    const safeName = input.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const storageKey = `${Date.now()}-${crypto.randomUUID()}${extname(safeName)}`;
    const path = join(uploadDir, storageKey);
    await writeFile(path, Buffer.from(await input.arrayBuffer()));
    const url = `/uploads/${storageKey}`;
    const [row] = await db.insert(files).values({
      name: safeName,
      originalName: input.name,
      mimeType: input.type || "application/octet-stream",
      size: input.size,
      storageKey,
      url
    }).returning();
    return c.json(ok(row), 201);
  });

  app.get("/stats", requireAdmin, async (c) => {
    const count = (table: string) => Number((sqlite.prepare(`SELECT COUNT(*) as count FROM ${table}`).get() as { count?: number } | undefined)?.count ?? 0);
    const countWhere = (table: string, column: string, value: string) =>
      Number((sqlite.prepare(`SELECT COUNT(*) as count FROM ${table} WHERE ${column} = ?`).get(value) as { count?: number } | undefined)?.count ?? 0);
    return c.json(ok({
      majors: count("majors"),
      teachers: count("teachers"),
      galleries: count("galleries"),
      agendas: count("agendas"),
      announcements: count("announcements"),
      downloads: count("downloads"),
      messages: count("messages"),
      testimonials: count("testimonials"),
      newMessages: countWhere("messages", "status", "new"),
      pendingTestimonials: countWhere("testimonials", "status", "pending"),
      users: count("users")
    }));
  });

  return app;
}
