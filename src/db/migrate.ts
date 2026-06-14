import { sqlite } from "./client";

const statements = [
  `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, username TEXT NOT NULL UNIQUE, email TEXT NOT NULL UNIQUE, password TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'admin', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS school_profile (id INTEGER PRIMARY KEY AUTOINCREMENT, history TEXT NOT NULL DEFAULT '', vision TEXT NOT NULL DEFAULT '', mission TEXT NOT NULL DEFAULT '', principal_name TEXT NOT NULL DEFAULT '', principal_greeting TEXT NOT NULL DEFAULT '', principal_photo_url TEXT NOT NULL DEFAULT '', profile_summary_image_url TEXT NOT NULL DEFAULT '', principal_cta_label TEXT NOT NULL DEFAULT 'Selengkapnya', principal_cta_url TEXT NOT NULL DEFAULT '/profil', identity TEXT NOT NULL DEFAULT '{}', management TEXT NOT NULL DEFAULT '{}', organization TEXT NOT NULL DEFAULT '', accreditation TEXT NOT NULL DEFAULT '', location TEXT NOT NULL DEFAULT '')`,
  `CREATE TABLE IF NOT EXISTS school_settings (id INTEGER PRIMARY KEY AUTOINCREMENT, school_name TEXT NOT NULL, tagline TEXT NOT NULL DEFAULT '', logo_url TEXT NOT NULL DEFAULT '', favicon_url TEXT NOT NULL DEFAULT '', theme_color TEXT NOT NULL DEFAULT '#0f766e', address TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', whatsapp TEXT NOT NULL DEFAULT '', social_links TEXT NOT NULL DEFAULT '{}', quick_links TEXT NOT NULL DEFAULT '[]', map_embed TEXT NOT NULL DEFAULT '', wordpress_url TEXT NOT NULL DEFAULT '', ppdb_url TEXT NOT NULL DEFAULT '', meta_description TEXT NOT NULL DEFAULT '', footer_text TEXT NOT NULL DEFAULT '')`,
  `CREATE TABLE IF NOT EXISTS majors (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, field_category TEXT NOT NULL DEFAULT '', profile_markdown TEXT NOT NULL DEFAULT '', profile_cta_label TEXT NOT NULL DEFAULT 'Lihat Album Foto/Video', profile_cta_url TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '', competencies TEXT NOT NULL DEFAULT '', career_prospects TEXT NOT NULL DEFAULT '', practice_facilities TEXT NOT NULL DEFAULT '', productive_teachers TEXT NOT NULL DEFAULT '', achievements TEXT NOT NULL DEFAULT '', image_url TEXT NOT NULL DEFAULT '', is_featured INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS teachers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, photo_url TEXT NOT NULL DEFAULT '', position TEXT NOT NULL DEFAULT '', subject TEXT NOT NULL DEFAULT '', expertise TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'active', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS facilities (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', image_url TEXT NOT NULL DEFAULT '', is_featured INTEGER NOT NULL DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS galleries (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, category TEXT NOT NULL DEFAULT 'Kegiatan', description TEXT NOT NULL DEFAULT '', cover_url TEXT NOT NULL DEFAULT '', show_on_home INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS gallery_items (id INTEGER PRIMARY KEY AUTOINCREMENT, gallery_id INTEGER NOT NULL REFERENCES galleries(id) ON DELETE CASCADE, type TEXT NOT NULL DEFAULT 'image', title TEXT NOT NULL DEFAULT '', file_url TEXT NOT NULL DEFAULT '', youtube_url TEXT NOT NULL DEFAULT '', is_featured INTEGER NOT NULL DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS agendas (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, start_date TEXT NOT NULL, end_date TEXT NOT NULL DEFAULT '', location TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'scheduled', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS announcements (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, content TEXT NOT NULL DEFAULT '', is_priority INTEGER NOT NULL DEFAULT 0, attachment_url TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'active', published_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS downloads (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'Dokumen', description TEXT NOT NULL DEFAULT '', file_url TEXT NOT NULL DEFAULT '', file_type TEXT NOT NULL DEFAULT 'PDF', file_size TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS banners (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, subtitle TEXT NOT NULL DEFAULT '', image_url TEXT NOT NULL DEFAULT '', cta_label TEXT NOT NULL DEFAULT '', cta_url TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0, is_active INTEGER NOT NULL DEFAULT 1)`,
  `CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL DEFAULT '', subject TEXT NOT NULL DEFAULT '', message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS complaints (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, reporter_role TEXT NOT NULL DEFAULT '', class_or_unit TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', category TEXT NOT NULL DEFAULT '', title TEXT NOT NULL, complaint TEXT NOT NULL, attachment_url TEXT NOT NULL DEFAULT '', expectation TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'new', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS testimonials (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, graduation_year TEXT NOT NULL DEFAULT '', occupation TEXT NOT NULL DEFAULT '', photo_url TEXT NOT NULL DEFAULT '', whatsapp TEXT NOT NULL DEFAULT '', telegram TEXT NOT NULL DEFAULT '', instagram TEXT NOT NULL DEFAULT '', tiktok TEXT NOT NULL DEFAULT '', facebook TEXT NOT NULL DEFAULT '', youtube TEXT NOT NULL DEFAULT '', message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS files (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, original_name TEXT NOT NULL, mime_type TEXT NOT NULL, size INTEGER NOT NULL DEFAULT 0, storage_key TEXT NOT NULL, url TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`
];

export function migrate() {
  const transaction = sqlite.transaction(() => {
    for (const statement of statements) sqlite.run(statement);
    const columns = sqlite.prepare("PRAGMA table_info(users)").all() as { name: string }[];
    if (!columns.some((column) => column.name === "username")) {
      sqlite.run("ALTER TABLE users ADD COLUMN username TEXT NOT NULL DEFAULT ''");
      sqlite.run("UPDATE users SET username = lower(replace(email, '@sekolah.sch.id', '')) WHERE username = ''");
    }
    sqlite.run("CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users(username)");

    const profileColumns = sqlite.prepare("PRAGMA table_info(school_profile)").all() as { name: string }[];
    if (!profileColumns.some((column) => column.name === "principal_photo_url")) {
      sqlite.run("ALTER TABLE school_profile ADD COLUMN principal_photo_url TEXT NOT NULL DEFAULT ''");
    }
    if (!profileColumns.some((column) => column.name === "principal_cta_label")) {
      sqlite.run("ALTER TABLE school_profile ADD COLUMN principal_cta_label TEXT NOT NULL DEFAULT 'Selengkapnya'");
    }
    if (!profileColumns.some((column) => column.name === "profile_summary_image_url")) {
      sqlite.run("ALTER TABLE school_profile ADD COLUMN profile_summary_image_url TEXT NOT NULL DEFAULT ''");
    }
    if (!profileColumns.some((column) => column.name === "principal_cta_url")) {
      sqlite.run("ALTER TABLE school_profile ADD COLUMN principal_cta_url TEXT NOT NULL DEFAULT '/profil'");
    }
    if (!profileColumns.some((column) => column.name === "management")) {
      sqlite.run("ALTER TABLE school_profile ADD COLUMN management TEXT NOT NULL DEFAULT '{}'");
    }

    const settingsColumns = sqlite.prepare("PRAGMA table_info(school_settings)").all() as { name: string }[];
    if (!settingsColumns.some((column) => column.name === "quick_links")) {
      sqlite.run("ALTER TABLE school_settings ADD COLUMN quick_links TEXT NOT NULL DEFAULT '[]'");
    }

    const testimonialColumns = sqlite.prepare("PRAGMA table_info(testimonials)").all() as { name: string }[];
    if (!testimonialColumns.some((column) => column.name === "whatsapp")) {
      sqlite.run("ALTER TABLE testimonials ADD COLUMN whatsapp TEXT NOT NULL DEFAULT ''");
    }
    if (!testimonialColumns.some((column) => column.name === "telegram")) {
      sqlite.run("ALTER TABLE testimonials ADD COLUMN telegram TEXT NOT NULL DEFAULT ''");
    }
    if (!testimonialColumns.some((column) => column.name === "instagram")) {
      sqlite.run("ALTER TABLE testimonials ADD COLUMN instagram TEXT NOT NULL DEFAULT ''");
    }
    if (!testimonialColumns.some((column) => column.name === "tiktok")) {
      sqlite.run("ALTER TABLE testimonials ADD COLUMN tiktok TEXT NOT NULL DEFAULT ''");
    }
    if (!testimonialColumns.some((column) => column.name === "facebook")) {
      sqlite.run("ALTER TABLE testimonials ADD COLUMN facebook TEXT NOT NULL DEFAULT ''");
    }
    if (!testimonialColumns.some((column) => column.name === "youtube")) {
      sqlite.run("ALTER TABLE testimonials ADD COLUMN youtube TEXT NOT NULL DEFAULT ''");
    }

    const majorColumns = sqlite.prepare("PRAGMA table_info(majors)").all() as { name: string }[];
    if (!majorColumns.some((column) => column.name === "field_category")) {
      sqlite.run("ALTER TABLE majors ADD COLUMN field_category TEXT NOT NULL DEFAULT ''");
    }
    if (!majorColumns.some((column) => column.name === "profile_markdown")) {
      sqlite.run("ALTER TABLE majors ADD COLUMN profile_markdown TEXT NOT NULL DEFAULT ''");
    }
    if (!majorColumns.some((column) => column.name === "profile_cta_label")) {
      sqlite.run("ALTER TABLE majors ADD COLUMN profile_cta_label TEXT NOT NULL DEFAULT 'Lihat Album Foto/Video'");
    }
    if (!majorColumns.some((column) => column.name === "profile_cta_url")) {
      sqlite.run("ALTER TABLE majors ADD COLUMN profile_cta_url TEXT NOT NULL DEFAULT ''");
    }

    const complaintColumns = sqlite.prepare("PRAGMA table_info(complaints)").all() as { name: string }[];
    if (!complaintColumns.some((column) => column.name === "attachment_url")) {
      sqlite.run("ALTER TABLE complaints ADD COLUMN attachment_url TEXT NOT NULL DEFAULT ''");
    }
  });
  transaction();
}
