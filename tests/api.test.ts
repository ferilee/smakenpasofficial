import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { createHmac } from "node:crypto";
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
let createdComplaintId = 0;
let createdTestimonialId = 0;
let createdUserId = 0;

function testToken(userId: number) {
  const payload = `${userId}.${Date.now()}`;
  const signature = createHmac("sha256", process.env.TOKEN_SECRET!).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

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
  adminCookie = `session=${testToken(2)}`;
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
  test("password login is disabled", async () => {
    const res = await request("/auth/login", jsonInit("POST", { username: "ferilee", password: "wrong" }));
    const body = await json(res);
    expect(res.status).toBe(410);
    expect(body.error.message).toContain("Google");
  });

  test("auth me returns current admin", async () => {
    const res = await adminRequest("/auth/me");
    const body = await json(res);
    expect(res.status).toBe(200);
    expect(body.data.username).toBe("ferilee");
    expect(body.data.role).toBe("admin");
  });

  test("google login reports missing oauth configuration", async () => {
    const res = await request("/auth/google");
    const body = await json(res);
    expect(res.status).toBe(400);
    expect(body.ok).toBe(false);
  });

  test("google callback rejects invalid state before token exchange", async () => {
    process.env.GOOGLE_CLIENT_ID = "client-test";
    process.env.GOOGLE_CLIENT_SECRET = "secret-test";
    const res = await request("/auth/google/callback?state=bad&code=code-test", {
      headers: { Cookie: "google_oauth_state=other" }
    });
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toContain("oauth=invalid_state");
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
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

  test("lumajang region endpoints return districts and villages", async () => {
    const districts = await json(await request("/public/lumajang-districts"));
    expect(districts.data.some((item: any) => item.id === "3508030")).toBe(true);

    const villages = await json(await request("/public/lumajang-villages/3508030"));
    expect(villages.data.some((item: any) => item.name === "CANDIPURO")).toBe(true);
  });

  test("wordpress preview endpoint returns an array", async () => {
    const res = await request("/public/wordpress");
    const body = await json(res);
    expect(res.status).toBe(200);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("public student info only returns active admin-managed items", async () => {
    const active = await json(await adminRequest("/student-infos", jsonInit("POST", {
      title: "Info Siswa Aktif",
      category: "Akademik",
      content: "Konten khusus siswa.",
      status: "active"
    })));
    const draft = await json(await adminRequest("/student-infos", jsonInit("POST", {
      title: "Info Siswa Draft",
      category: "Draft",
      content: "Tidak tampil untuk publik.",
      status: "draft"
    })));

    const res = await request("/public/student-infos");
    const body = await json(res);
    expect(res.status).toBe(200);
    expect(body.data.some((item: any) => item.id === active.data.id)).toBe(true);
    expect(body.data.some((item: any) => item.id === draft.data.id)).toBe(false);

    await adminRequest(`/student-infos/${active.data.id}`, { method: "DELETE" });
    await adminRequest(`/student-infos/${draft.data.id}`, { method: "DELETE" });
  });

  test("public student services only returns active ordered admin-managed items", async () => {
    const first = await json(await adminRequest("/student-services", jsonInit("POST", {
      title: "Layanan Siswa Pertama",
      description: "Tampil pertama.",
      url: "/siswa",
      icon: "book",
      sortOrder: 10,
      isActive: true
    })));
    const second = await json(await adminRequest("/student-services", jsonInit("POST", {
      title: "Layanan Siswa Kedua",
      description: "Tampil kedua.",
      url: "/agenda",
      icon: "calendar",
      sortOrder: 11,
      isActive: true
    })));
    const inactive = await json(await adminRequest("/student-services", jsonInit("POST", {
      title: "Layanan Siswa Nonaktif",
      description: "Tidak tampil.",
      url: "/kontak",
      icon: "phone",
      sortOrder: 9,
      isActive: false
    })));

    const res = await request("/public/student-services");
    const body = await json(res);
    const ids = body.data.map((item: any) => item.id);
    expect(res.status).toBe(200);
    expect(ids.indexOf(first.data.id)).toBeLessThan(ids.indexOf(second.data.id));
    expect(ids.includes(inactive.data.id)).toBe(false);

    await adminRequest(`/student-services/${first.data.id}`, { method: "DELETE" });
    await adminRequest(`/student-services/${second.data.id}`, { method: "DELETE" });
    await adminRequest(`/student-services/${inactive.data.id}`, { method: "DELETE" });
  });

  test("public student announcements only returns active admin-managed items", async () => {
    const active = await json(await adminRequest("/student-announcements", jsonInit("POST", {
      title: "Pengumuman Siswa Aktif",
      content: "Tampil di halaman siswa.",
      status: "active"
    })));
    const draft = await json(await adminRequest("/student-announcements", jsonInit("POST", {
      title: "Pengumuman Siswa Draft",
      content: "Tidak tampil di halaman siswa.",
      status: "draft"
    })));

    const res = await request("/public/student-announcements");
    const body = await json(res);
    expect(res.status).toBe(200);
    expect(body.data.some((item: any) => item.id === active.data.id)).toBe(true);
    expect(body.data.some((item: any) => item.id === draft.data.id)).toBe(false);

    await adminRequest(`/student-announcements/${active.data.id}`, { method: "DELETE" });
    await adminRequest(`/student-announcements/${draft.data.id}`, { method: "DELETE" });
  });

  test("public student agendas only returns scheduled admin-managed items", async () => {
    const scheduled = await json(await adminRequest("/student-agendas", jsonInit("POST", {
      title: "Agenda Siswa Terjadwal",
      startDate: "2026-06-20",
      endDate: "2026-06-20",
      location: "Aula",
      description: "Tampil di agenda siswa.",
      status: "scheduled"
    })));
    const draft = await json(await adminRequest("/student-agendas", jsonInit("POST", {
      title: "Agenda Siswa Draft",
      startDate: "2026-06-21",
      location: "Ruang BK",
      description: "Tidak tampil di agenda siswa.",
      status: "draft"
    })));

    const res = await request("/public/student-agendas");
    const body = await json(res);
    expect(res.status).toBe(200);
    expect(body.data.some((item: any) => item.id === scheduled.data.id)).toBe(true);
    expect(body.data.some((item: any) => item.id === draft.data.id)).toBe(false);

    await adminRequest(`/student-agendas/${scheduled.data.id}`, { method: "DELETE" });
    await adminRequest(`/student-agendas/${draft.data.id}`, { method: "DELETE" });
  });

  test("public testimonial submission creates pending item", async () => {
    const form = new FormData();
    form.append("name", "Alumni Test");
    form.append("graduationYear", "2024");
    form.append("occupation", "QA");
    form.append("whatsapp", "081234567890");
    form.append("telegram", "alumni.test");
    form.append("instagram", "alumni.test");
    form.append("tiktok", "alumni.test");
    form.append("facebook", "alumni.test");
    form.append("youtube", "alumni.test");
    form.append("message", "Pengalaman sekolah sangat membantu.");
    form.append("photo", new File(["test-image"], "alumni.jpg", { type: "image/jpeg" }));
    const res = await request("/public/testimonials", { method: "POST", body: form });
    const body = await json(res);
    expect(res.status).toBe(201);
    expect(body.data.status).toBe("pending");
    expect(body.data.photoUrl).toStartWith("/uploads/");
    expect(body.data.whatsapp).toBe("https://wa.me/6281234567890");
    expect(body.data.telegram).toBe("https://t.me/alumni.test");
    expect(body.data.instagram).toBe("https://instagram.com/alumni.test");
    expect(body.data.tiktok).toBe("https://www.tiktok.com/@alumni.test");
    expect(body.data.facebook).toBe("https://facebook.com/alumni.test");
    expect(body.data.youtube).toBe("https://www.youtube.com/@alumni.test");
    createdTestimonialId = body.data.id;
  });

  test("public testimonial rejects non-image photo", async () => {
    const form = new FormData();
    form.append("name", "Alumni Invalid Photo");
    form.append("message", "Testimoni dengan lampiran tidak valid.");
    form.append("photo", new File(["not-an-image"], "document.txt", { type: "text/plain" }));
    const res = await request("/public/testimonials", { method: "POST", body: form });
    const body = await json(res);
    expect(res.status).toBe(400);
    expect(body.error.message).toContain("file gambar");
  });

  test("public testimonial validation requires name and message", async () => {
    const res = await request("/public/testimonials", jsonInit("POST", { name: "" }));
    expect(res.status).toBe(400);
  });

  test("public complaint submission creates new complaint", async () => {
    const form = new FormData();
    form.append("name", "Pelapor Test");
    form.append("reporterRole", "Siswa");
    form.append("classOrUnit", "XII RPL 1");
    form.append("phone", "08123");
    form.append("email", "pelapor@test.local");
    form.append("category", "Layanan Sekolah");
    form.append("title", "Keluhan layanan");
    form.append("complaint", "Ada kendala pada layanan sekolah.");
    form.append("expectation", "Mohon ditindaklanjuti.");
    form.append("attachment", new File(["bukti"], "bukti.txt", { type: "text/plain" }));
    const res = await request("/public/complaints", { method: "POST", body: form });
    const body = await json(res);
    expect(res.status).toBe(201);
    expect(body.data.status).toBe("new");
    expect(body.data.attachmentUrl).toContain("/uploads/");
    createdComplaintId = body.data.id;
  });
});

describe("settings and profile endpoints", () => {
  test("settings can be read and updated by admin", async () => {
    const before = await json(await request("/settings"));
    const res = await adminRequest("/settings", jsonInit("PUT", {
      ...before.data,
      tagline: "Tagline Test",
      quickLinks: [
        { label: "E-raport", url: "https://eraport.example.test", icon: "report", tone: "aqua" },
        { label: "BKK", url: "/bkk", icon: "briefcase", tone: "violet" }
      ]
    }));
    const body = await json(res);
    expect(res.status).toBe(200);
    expect(body.data.tagline).toBe("Tagline Test");
    expect(body.data.quickLinks.length).toBe(2);
    expect(body.data.quickLinks[0].url).toBe("https://eraport.example.test");
  });

  test("profile can be read and updated by admin", async () => {
    const before = await json(await request("/profile"));
    const res = await adminRequest("/profile", jsonInit("PUT", {
      ...before.data,
      location: "Lokasi Test",
      identity: {
        ...(before.data.identity || {}),
        principalIdentityName: "Dermawan Triwahyono,ST,MM",
        principalIdentityBirth: "Lumajang,03 Maret 1976",
        principalIdentityAddress: "Dsn. Krajan RT.18/ RW.05\nDesa Yosowilangun Lor\nKec. Yosowilangun, Kab. Lumajang",
        principalIdentityPhone: "085236083132",
        principalIdentityDecreeNumber: "800/9767/204/2025",
        principalIdentityDecreeDate: "09 Mei 2025",
        principalIdentityAppointingOfficial: "Dra. Hj. Khofifah Indar Parawansa, M.Si\nGubernur Jawa Timur",
        committeeMembers: "5 orang",
        committeeChair: "Sugeng Ngabekti",
        committeeDecreeNumber: "421.5/001/101.6.5.17/2023",
        committeeDecreeDate: "3 Agustus 2023"
      },
      mission: "1. Poin satu<br>2. Poin dua\n3) Poin tiga\n- Poin empat\n• Poin lima",
      management: {
        ...(before.data.management || {}),
        kurikulum: {
          lead: "Kurikulum Test",
          points: ["Poin A", "Poin B"],
          resources: [
            { label: "Panduan Kurikulum", type: "file", url: "https://example.test/panduan-kurikulum.pdf" },
            { label: "Portal Kurikulum", type: "link", url: "https://example.test/kurikulum" }
          ]
        }
      }
    }));
    const body = await json(res);
    expect(res.status).toBe(200);
    expect(body.data.location).toBe("Lokasi Test");
    expect(body.data.identity.principalIdentityName).toBe("Dermawan Triwahyono,ST,MM");
    expect(body.data.identity.committeeChair).toBe("Sugeng Ngabekti");
    expect(body.data.mission).toBe("Poin satu\nPoin dua\nPoin tiga\nPoin empat\nPoin lima");
    expect(body.data.management.kurikulum.lead).toBe("Kurikulum Test");
    expect(body.data.management.kurikulum.resources.length).toBe(2);
  });
});

describe("admin CRUD endpoints", () => {
  test("majors supports create, read, update, and delete", async () => {
    const create = await adminRequest("/majors", jsonInit("POST", {
      name: "Jurusan Test",
      description: "Desc",
      instagram: "jurusan.test",
      tiktok: "@jurusan.test",
      facebook: "jurusan.test",
      youtube: "@jurusan.test",
      isFeatured: true
    }));
    const created = await json(create);
    createdMajorId = created.data.id;
    expect(create.status).toBe(201);
    expect(created.data.slug).toBe("jurusan-test");
    expect(created.data.instagram).toBe("https://instagram.com/jurusan.test");
    expect(created.data.tiktok).toBe("https://www.tiktok.com/@jurusan.test");
    expect(created.data.facebook).toBe("https://facebook.com/jurusan.test");
    expect(created.data.youtube).toBe("https://www.youtube.com/@jurusan.test");

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

  test("teachers can be deleted and missing IDs return 404", async () => {
    const create = await adminRequest("/teachers", jsonInit("POST", {
      name: "Guru Hapus Test",
      position: "Guru",
      subject: "Pengujian",
      expertise: "Quality Assurance",
      status: "active"
    }));
    const created = await json(create);
    expect(create.status).toBe(201);

    const remove = await adminRequest(`/teachers/${created.data.id}`, { method: "DELETE" });
    const removed = await json(remove);
    expect(remove.status).toBe(200);
    expect(removed.data.deleted).toBe(true);
    expect(removed.data.id).toBe(created.data.id);

    const missing = await adminRequest(`/teachers/${created.data.id}`, { method: "DELETE" });
    const missingBody = await json(missing);
    expect(missing.status).toBe(404);
    expect(missingBody.ok).toBe(false);
    expect(missingBody.error.message).toBe("Data tidak ditemukan.");
  }, { timeout: 10000 });

  test("teachers import template can be downloaded by admin", async () => {
    const res = await adminRequest("/teachers/import/template.csv");
    const body = await res.text();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/csv");
    expect(body).toContain("Nama");
    expect(body).toContain("Jabatan");
    expect(body).toContain("Photo URL");
  });

  test("teachers can be imported from google sheets", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("docs.google.com/spreadsheets")) {
        return new Response(
          [
            "Nama,Jabatan,Mapel,Bidang Keahlian,Status",
            "Guru Import 1,Guru,Matematika,Matematika,active",
            "Guru Import 2,Wakil Kepala Sekolah,BK,Manajemen Kesiswaan,nonaktif"
          ].join("\n"),
          { status: 200, headers: { "Content-Type": "text/csv" } }
        );
      }
      return originalFetch(input);
    };

    try {
      const res = await adminRequest("/teachers/import/google-sheets", jsonInit("POST", {
        url: "https://docs.google.com/spreadsheets/d/mock-sheet/edit#gid=0",
        mode: "upsert"
      }));
      const body = await json(res);
      expect(res.status).toBe(200);
      expect(body.data.imported).toBe(2);
      expect(body.data.inserted + body.data.updated).toBe(2);

      const teachersBody = await json(await request("/teachers"));
      const importedOne = teachersBody.data.find((teacher: any) => teacher.name === "Guru Import 1");
      const importedTwo = teachersBody.data.find((teacher: any) => teacher.name === "Guru Import 2");
      expect(importedOne.subject).toBe("Matematika");
      expect(importedTwo.status).toBe("inactive");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test("teachers import returns json error for invalid sheet url", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("docs.google.com/spreadsheets")) {
        return new Response("not found", { status: 404, headers: { "Content-Type": "text/plain" } });
      }
      return originalFetch(input);
    };

    try {
      const res = await adminRequest("/teachers/import/google-sheets", jsonInit("POST", {
        url: "16RiJE6X-KpSZYGUBnRcS9L_y_wTXijnkAp_nwQK7EE",
        mode: "upsert"
      }));
      const body = await json(res);
      expect(res.status).toBe(400);
      expect(body.ok).toBe(false);
      expect(body.error.message).toContain("tidak ditemukan");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test("facilities list endpoint returns array", async () => {
    const body = await json(await request("/facilities"));
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("galleries and gallery items can be managed", async () => {
    const gallery = await json(await adminRequest("/galleries", jsonInit("POST", {
      title: "Galeri Test",
      slug: "galeri-test",
      category: "Test",
      albumUrl: "https://photos.app.goo.gl/example"
    })));
    createdGalleryId = gallery.data.id;
    expect(gallery.data.slug).toBe("galeri-test");
    expect(gallery.data.albumUrl).toBe("https://photos.app.goo.gl/example");

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

  test("public agenda calendar only returns scheduled admin agendas", async () => {
    const scheduled = await json(await adminRequest("/agendas", jsonInit("POST", {
      title: "Agenda Kalender Publik",
      startDate: "2026-06-15",
      endDate: "2026-06-16",
      location: "Aula Sekolah",
      description: "Agenda yang tampil pada kalender publik.",
      status: "scheduled"
    })));
    const draft = await json(await adminRequest("/agendas", jsonInit("POST", {
      title: "Agenda Kalender Draft",
      startDate: "2026-06-17",
      location: "Ruang Rapat",
      description: "Agenda yang belum dipublikasikan.",
      status: "draft"
    })));

    const publicResponse = await request("/public/agendas");
    const publicBody = await json(publicResponse);
    expect(publicResponse.status).toBe(200);
    expect(publicBody.data.some((item: any) => item.id === scheduled.data.id)).toBe(true);
    expect(publicBody.data.some((item: any) => item.id === draft.data.id)).toBe(false);

    const homeBody = await json(await request("/public/home"));
    expect(homeBody.data.agendas.some((item: any) => item.id === scheduled.data.id)).toBe(true);
    expect(homeBody.data.agendas.some((item: any) => item.id === draft.data.id)).toBe(false);

    await adminRequest(`/agendas/${scheduled.data.id}`, { method: "DELETE" });
    await adminRequest(`/agendas/${draft.data.id}`, { method: "DELETE" });
  });

  test("public agenda accepts legacy mixed-case scheduled status", async () => {
    const legacy = await json(await adminRequest("/agendas", jsonInit("POST", {
      title: "Agenda Legacy",
      startDate: "2026-06-22",
      endDate: "2026-06-22",
      location: "Aula",
      description: "Masih harus tampil di publik.",
      status: "Scheduled"
    })));

    const publicResponse = await json(await request("/public/agendas"));
    expect(publicResponse.data.some((item: any) => item.id === legacy.data.id)).toBe(true);

    await adminRequest(`/agendas/${legacy.data.id}`, { method: "DELETE" });
  });

  test("public agenda treats empty status as scheduled for legacy rows", async () => {
    const legacy = await json(await adminRequest("/agendas", jsonInit("POST", {
      title: "Agenda Status Kosong",
      startDate: "2026-06-24",
      endDate: "2026-06-24",
      location: "Lab",
      description: "Harus tetap muncul di publik.",
      status: ""
    })));

    const publicResponse = await json(await request("/public/agendas"));
    expect(publicResponse.data.some((item: any) => item.id === legacy.data.id)).toBe(true);

    await adminRequest(`/agendas/${legacy.data.id}`, { method: "DELETE" });
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

  test("complaints can be listed and updated by admin", async () => {
    const list = await json(await adminRequest("/complaints"));
    expect(Array.isArray(list.data)).toBe(true);
    expect(list.data.some((item: any) => item.id === createdComplaintId)).toBe(true);

    const res = await adminRequest(`/complaints/${createdComplaintId}`, jsonInit("PUT", {
      status: "reviewed",
      category: "Layanan Sekolah",
      title: "Keluhan layanan",
      complaint: "Ada kendala pada layanan sekolah."
    }));
    const body = await json(res);
    expect(res.status).toBe(200);
    expect(body.data.status).toBe("reviewed");
  });

  test("testimonials can be approved by admin", async () => {
    const res = await adminRequest(`/testimonials/${createdTestimonialId}`, jsonInit("PUT", {
      name: "Alumni Test",
      graduationYear: "2024",
      occupation: "QA",
      whatsapp: "081234567890",
      telegram: "alumni.test",
      instagram: "alumni.test",
      tiktok: "alumni.test",
      facebook: "alumni.test",
      youtube: "alumni.test",
      message: "Pengalaman sekolah sangat membantu.",
      status: "approved"
    }));
    const body = await json(res);
    expect(res.status).toBe(200);
    expect(body.data.status).toBe("approved");
    expect(body.data.whatsapp).toBe("https://wa.me/6281234567890");
    expect(body.data.telegram).toBe("https://t.me/alumni.test");
    expect(body.data.instagram).toBe("https://instagram.com/alumni.test");
    expect(body.data.youtube).toBe("https://www.youtube.com/@alumni.test");
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

  test("admin can see completed public user profile data", async () => {
    const create = await json(await adminRequest("/users", jsonInit("POST", {
      name: "Public User",
      username: "publicuser",
      email: "public@test.local",
      password: "secret123",
      role: "user"
    })));
    const userId = create.data.id;
    const userCookie = `session=${testToken(userId)}`;

    const saveProfile = await request("/auth/profile", {
      ...jsonInit("PUT", {
        name: "Public User",
        districtId: "3508040",
        districtName: "PASIRIAN",
        villageId: "3508040001",
        villageName: "CONDRO",
        address: "Jl. Sekolah No. 1",
        whatsapp: "081234567890"
      }),
      headers: { Cookie: userCookie, "Content-Type": "application/json" }
    });
    expect(saveProfile.status).toBe(200);

    const list = await json(await adminRequest("/users"));
    const row = list.data.find((item: any) => item.id === userId);
    expect(row.role).toBe("user");
    expect(row.profileCompleted).toBe(true);
    expect(row.districtName).toBe("PASIRIAN");
    expect(row.villageName).toBe("CONDRO");
    expect(row.address).toBe("Jl. Sekolah No. 1");
    expect(row.whatsapp).toBe("6281234567890");

    await adminRequest(`/users/${userId}`, { method: "DELETE" });
  });

  test("editor role only accesses admin features allowed by admin", async () => {
    const access = await json(await adminRequest("/editor-permissions", jsonInit("PUT", {
      permissions: ["studentInfos"]
    })));
    expect(access.data.permissions).toContain("studentInfos");

    const create = await json(await adminRequest("/users", jsonInit("POST", {
      name: "Editor Test",
      username: "editortest",
      email: "editor@test.local",
      password: "secret123",
      role: "editor"
    })));
    const editorId = create.data.id;
    const editorCookie = `session=${testToken(editorId)}`;

    const me = await json(await request("/auth/me", { headers: { Cookie: editorCookie } }));
    expect(me.data.role).toBe("editor");
    expect(me.data.permissions).toContain("studentInfos");

    const allowed = await request("/student-infos", {
      ...jsonInit("POST", {
        title: "Info Editor",
        category: "Editor",
        content: "Dibuat editor.",
        status: "active"
      }),
      headers: { Cookie: editorCookie, "Content-Type": "application/json" }
    });
    const allowedBody = await json(allowed);
    expect(allowed.status).toBe(201);

    const denied = await request("/banners", {
      ...jsonInit("POST", { title: "Banner Editor", subtitle: "Tidak boleh" }),
      headers: { Cookie: editorCookie, "Content-Type": "application/json" }
    });
    expect(denied.status).toBe(403);

    const userList = await request("/users", { headers: { Cookie: editorCookie } });
    expect(userList.status).toBe(403);

    await adminRequest(`/student-infos/${allowedBody.data.id}`, { method: "DELETE" });
    await adminRequest(`/users/${editorId}`, { method: "DELETE" });
    await adminRequest("/editor-permissions", jsonInit("PUT", { permissions: [] }));
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
