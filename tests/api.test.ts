import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const dbPath = join(import.meta.dir, "tmp-api-test.db");
process.env.DATABASE_URL = dbPath;
process.env.TOKEN_SECRET = "test-secret";
process.env.UPLOAD_DIR = join(import.meta.dir, "tmp-uploads");

if (existsSync(dbPath)) rmSync(dbPath);
if (existsSync(process.env.UPLOAD_DIR)) rmSync(process.env.UPLOAD_DIR, { recursive: true, force: true });

const { apiRoutes } = await import("../src/api");
const { seed } = await import("../src/db/seed");

const app = apiRoutes();
let adminCookie = "";
let createdMajorId = 0;
let createdGalleryId = 0;
let createdMessageId = 0;
let createdTestimonialId = 0;
let createdUserId = 0;

async function json(res: Response) {
  return res.json() as Promise<any>;
}

async function request(path: string, init: RequestInit = {}) {
  return app.request(path, init);
}

async function adminRequest(path: string, init: RequestInit = {}) {
  return request(path, {
    ...init,
    headers: {
      Cookie: adminCookie,
      ...(init.headers || {})
    }
  });
}

function jsonInit(method: string, body: Record<string, unknown>): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}

beforeAll(async () => {
  await seed();
  const res = await request("/auth/login", jsonInit("POST", { username: "ferilee", password: "F3r!-lee" }));
  expect(res.status).toBe(200);
  adminCookie = res.headers.get("set-cookie") || "";
  expect(adminCookie).toContain("session=");
});

afterAll(() => {
  if (existsSync(dbPath)) rmSync(dbPath);
  if (existsSync(process.env.UPLOAD_DIR!)) rmSync(process.env.UPLOAD_DIR!, { recursive: true, force: true });
});

describe("utility response endpoints", () => {
  test("health returns ok", async () => {
    const res = await request("/health");
    const body = await json(res);
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.status).toBe("ok");
  });

  test("protected endpoint rejects unauthenticated requests", async () => {
    const res = await request("/auth/me");
    const body = await json(res);
    expect(res.status).toBe(401);
    expect(body.ok).toBe(false);
  });
});

describe("auth endpoints", () => {
  test("login rejects invalid credentials", async () => {
    const res = await request("/auth/login", jsonInit("POST", { username: "ferilee", password: "wrong" }));
    expect(res.status).toBe(401);
  });

  test("auth me returns current admin", async () => {
    const res = await adminRequest("/auth/me");
    const body = await json(res);
    expect(res.status).toBe(200);
    expect(body.data.username).toBe("ferilee");
    expect(body.data.role).toBe("admin");
  });

  test("logout clears session", async () => {
    const res = await adminRequest("/auth/logout", { method: "POST" });
    const body = await json(res);
    expect(res.status).toBe(200);
    expect(body.data.logout).toBe(true);
  });
});

describe("public endpoints", () => {
  test("home payload contains school data and testimonials", async () => {
    const res = await request("/public/home");
    const body = await json(res);
    expect(res.status).toBe(200);
    expect(body.data.settings.schoolName).toBeTruthy();
    expect(Array.isArray(body.data.testimonials)).toBe(true);
  });

  test("profile payload contains facilities", async () => {
    const res = await request("/public/profile");
    const body = await json(res);
    expect(res.status).toBe(200);
    expect(Array.isArray(body.data.facilities)).toBe(true);
  });

  test("wordpress preview endpoint returns an array", async () => {
    const res = await request("/public/wordpress");
    const body = await json(res);
    expect(res.status).toBe(200);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("public testimonial submission creates pending item", async () => {
    const res = await request("/public/testimonials", jsonInit("POST", {
      name: "Alumni Test",
      graduationYear: "2024",
      occupation: "QA",
      instagram: "alumni.test",
      tiktok: "alumni.test",
      facebook: "alumni.test",
      message: "Pengalaman sekolah sangat membantu."
    }));
    const body = await json(res);
    expect(res.status).toBe(201);
    expect(body.data.status).toBe("pending");
    expect(body.data.instagram).toBe("https://instagram.com/alumni.test");
    expect(body.data.tiktok).toBe("https://www.tiktok.com/@alumni.test");
    expect(body.data.facebook).toBe("https://facebook.com/alumni.test");
    createdTestimonialId = body.data.id;
  });

  test("public testimonial validation requires name and message", async () => {
    const res = await request("/public/testimonials", jsonInit("POST", { name: "" }));
    expect(res.status).toBe(400);
  });
});

describe("settings and profile endpoints", () => {
  test("settings can be read and updated by admin", async () => {
    const before = await json(await request("/settings"));
    const res = await adminRequest("/settings", jsonInit("PUT", {
      ...before.data,
      tagline: "Tagline Test"
    }));
    const body = await json(res);
    expect(res.status).toBe(200);
    expect(body.data.tagline).toBe("Tagline Test");
  });

  test("profile can be read and updated by admin", async () => {
    const before = await json(await request("/profile"));
    const res = await adminRequest("/profile", jsonInit("PUT", {
      ...before.data,
      location: "Lokasi Test"
    }));
    const body = await json(res);
    expect(res.status).toBe(200);
    expect(body.data.location).toBe("Lokasi Test");
  });
});

describe("admin CRUD endpoints", () => {
  test("majors supports create, read, update, and delete", async () => {
    const create = await adminRequest("/majors", jsonInit("POST", { name: "Jurusan Test", description: "Desc", isFeatured: true }));
    const created = await json(create);
    createdMajorId = created.data.id;
    expect(create.status).toBe(201);
    expect(created.data.slug).toBe("jurusan-test");

    const one = await json(await request(`/majors/${createdMajorId}`));
    expect(one.data.name).toBe("Jurusan Test");

    const update = await json(await adminRequest(`/majors/${createdMajorId}`, jsonInit("PUT", { name: "Jurusan Test Update", slug: "jurusan-test-update" })));
    expect(update.data.name).toBe("Jurusan Test Update");

    const remove = await adminRequest(`/majors/${createdMajorId}`, { method: "DELETE" });
    expect(remove.status).toBe(200);
    createdMajorId = 0;
  });

  test("teachers list endpoint returns array", async () => {
    const body = await json(await request("/teachers"));
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("facilities list endpoint returns array", async () => {
    const body = await json(await request("/facilities"));
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("galleries and gallery items can be managed", async () => {
    const gallery = await json(await adminRequest("/galleries", jsonInit("POST", { title: "Galeri Test", slug: "galeri-test", category: "Test" })));
    createdGalleryId = gallery.data.id;
    expect(gallery.data.slug).toBe("galeri-test");

    const item = await json(await adminRequest("/gallery-items", jsonInit("POST", { galleryId: createdGalleryId, title: "Item Test", type: "image" })));
    expect(item.data.galleryId).toBe(createdGalleryId);

    const removeItem = await adminRequest(`/gallery-items/${item.data.id}`, { method: "DELETE" });
    expect(removeItem.status).toBe(200);
    const removeGallery = await adminRequest(`/galleries/${createdGalleryId}`, { method: "DELETE" });
    expect(removeGallery.status).toBe(200);
    createdGalleryId = 0;
  });

  test("agendas list endpoint returns array", async () => {
    const body = await json(await request("/agendas"));
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("announcements list endpoint returns array", async () => {
    const body = await json(await request("/announcements"));
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("downloads list endpoint returns array", async () => {
    const body = await json(await request("/downloads"));
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("banners list endpoint returns array", async () => {
    const body = await json(await request("/banners"));
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("testimonials can be approved by admin", async () => {
    const res = await adminRequest(`/testimonials/${createdTestimonialId}`, jsonInit("PUT", {
      name: "Alumni Test",
      graduationYear: "2024",
      occupation: "QA",
      instagram: "alumni.test",
      tiktok: "alumni.test",
      facebook: "alumni.test",
      message: "Pengalaman sekolah sangat membantu.",
      status: "approved"
    }));
    const body = await json(res);
    expect(res.status).toBe(200);
    expect(body.data.status).toBe("approved");
    expect(body.data.instagram).toBe("https://instagram.com/alumni.test");
  });
});

describe("messages, users, upload, and stats endpoints", () => {
  test("public message submission and admin update works", async () => {
    const create = await request("/messages", jsonInit("POST", {
      name: "Pengirim",
      email: "sender@example.test",
      phone: "0800",
      subject: "Halo",
      message: "Pesan test"
    }));
    const created = await json(create);
    createdMessageId = created.data.id;
    expect(create.status).toBe(201);

    const update = await json(await adminRequest(`/messages/${createdMessageId}`, jsonInit("PUT", {
      ...created.data,
      status: "read"
    })));
    expect(update.data.status).toBe("read");
  });

  test("users can be created, updated, listed, and deleted", async () => {
    const create = await adminRequest("/users", jsonInit("POST", {
      name: "User Test",
      username: "usertest",
      email: "user@test.local",
      password: "secret123",
      role: "admin"
    }));
    const created = await json(create);
    createdUserId = created.data.id;
    expect(create.status).toBe(201);
    expect(created.data.password).toBeUndefined();

    const list = await json(await adminRequest("/users"));
    expect(list.data.some((user: any) => user.username === "usertest")).toBe(true);

    const update = await json(await adminRequest(`/users/${createdUserId}`, jsonInit("PUT", {
      name: "User Test Update",
      username: "usertest",
      email: "user@test.local",
      role: "admin"
    })));
    expect(update.data.name).toBe("User Test Update");

    const remove = await adminRequest(`/users/${createdUserId}`, { method: "DELETE" });
    expect(remove.status).toBe(200);
    createdUserId = 0;
  });

  test("current admin cannot delete self", async () => {
    const me = await json(await adminRequest("/auth/me"));
    const res = await adminRequest(`/users/${me.data.id}`, { method: "DELETE" });
    expect(res.status).toBe(400);
  });

  test("upload stores a file", async () => {
    const form = new FormData();
    form.append("file", new File(["hello"], "hello.txt", { type: "text/plain" }));
    const res = await adminRequest("/upload", { method: "POST", body: form });
    const body = await json(res);
    expect(res.status).toBe(201);
    expect(body.data.url).toContain("/uploads/");
  });

  test("stats returns aggregate counts and notification counts", async () => {
    const res = await adminRequest("/stats");
    const body = await json(res);
    expect(res.status).toBe(200);
    expect(body.data).toHaveProperty("messages");
    expect(body.data).toHaveProperty("newMessages");
    expect(body.data).toHaveProperty("pendingTestimonials");
  });
});
