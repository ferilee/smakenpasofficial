import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const schoolProfile = sqliteTable("school_profile", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  history: text("history").notNull().default(""),
  vision: text("vision").notNull().default(""),
  mission: text("mission").notNull().default(""),
  principalName: text("principal_name").notNull().default(""),
  principalGreeting: text("principal_greeting").notNull().default(""),
  principalPhotoUrl: text("principal_photo_url").notNull().default(""),
  profileSummaryImageUrl: text("profile_summary_image_url").notNull().default(""),
  principalCtaLabel: text("principal_cta_label").notNull().default("Selengkapnya"),
  principalCtaUrl: text("principal_cta_url").notNull().default("/profil"),
  identity: text("identity", { mode: "json" }).$type<Record<string, string>>().notNull().default({}),
  management: text("management", { mode: "json" }).$type<Record<string, unknown>>().notNull().default({}),
  organization: text("organization").notNull().default(""),
  accreditation: text("accreditation").notNull().default(""),
  location: text("location").notNull().default("")
});

export const schoolSettings = sqliteTable("school_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  schoolName: text("school_name").notNull(),
  tagline: text("tagline").notNull().default(""),
  logoUrl: text("logo_url").notNull().default(""),
  faviconUrl: text("favicon_url").notNull().default(""),
  themeColor: text("theme_color").notNull().default("#0f766e"),
  address: text("address").notNull().default(""),
  email: text("email").notNull().default(""),
  phone: text("phone").notNull().default(""),
  whatsapp: text("whatsapp").notNull().default(""),
  socialLinks: text("social_links", { mode: "json" }).$type<Record<string, string>>().notNull().default({}),
  quickLinks: text("quick_links", { mode: "json" }).$type<Array<{ label: string; url: string; icon?: string; tone?: string }>>().notNull().default([]),
  mapEmbed: text("map_embed").notNull().default(""),
  wordpressUrl: text("wordpress_url").notNull().default(""),
  ppdbUrl: text("ppdb_url").notNull().default(""),
  metaDescription: text("meta_description").notNull().default(""),
  footerText: text("footer_text").notNull().default("")
});

export const majors = sqliteTable("majors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  competencies: text("competencies").notNull().default(""),
  careerProspects: text("career_prospects").notNull().default(""),
  practiceFacilities: text("practice_facilities").notNull().default(""),
  productiveTeachers: text("productive_teachers").notNull().default(""),
  achievements: text("achievements").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const teachers = sqliteTable("teachers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  photoUrl: text("photo_url").notNull().default(""),
  position: text("position").notNull().default(""),
  subject: text("subject").notNull().default(""),
  expertise: text("expertise").notNull().default(""),
  status: text("status").notNull().default("active"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const facilities = sqliteTable("facilities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false)
});

export const galleries = sqliteTable("galleries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull().default("Kegiatan"),
  description: text("description").notNull().default(""),
  coverUrl: text("cover_url").notNull().default(""),
  showOnHome: integer("show_on_home", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const galleryItems = sqliteTable("gallery_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  galleryId: integer("gallery_id").notNull().references(() => galleries.id, { onDelete: "cascade" }),
  type: text("type").notNull().default("image"),
  title: text("title").notNull().default(""),
  fileUrl: text("file_url").notNull().default(""),
  youtubeUrl: text("youtube_url").notNull().default(""),
  isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false)
});

export const agendas = sqliteTable("agendas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull().default(""),
  location: text("location").notNull().default(""),
  description: text("description").notNull().default(""),
  status: text("status").notNull().default("scheduled"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const announcements = sqliteTable("announcements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  isPriority: integer("is_priority", { mode: "boolean" }).notNull().default(false),
  attachmentUrl: text("attachment_url").notNull().default(""),
  status: text("status").notNull().default("active"),
  publishedAt: text("published_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const downloads = sqliteTable("downloads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  category: text("category").notNull().default("Dokumen"),
  description: text("description").notNull().default(""),
  fileUrl: text("file_url").notNull().default(""),
  fileType: text("file_type").notNull().default("PDF"),
  fileSize: text("file_size").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const banners = sqliteTable("banners", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  ctaLabel: text("cta_label").notNull().default(""),
  ctaUrl: text("cta_url").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true)
});

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  subject: text("subject").notNull().default(""),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const complaints = sqliteTable("complaints", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  reporterRole: text("reporter_role").notNull().default(""),
  classOrUnit: text("class_or_unit").notNull().default(""),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
  category: text("category").notNull().default(""),
  title: text("title").notNull(),
  complaint: text("complaint").notNull(),
  attachmentUrl: text("attachment_url").notNull().default(""),
  expectation: text("expectation").notNull().default(""),
  status: text("status").notNull().default("new"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const testimonials = sqliteTable("testimonials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  graduationYear: text("graduation_year").notNull().default(""),
  occupation: text("occupation").notNull().default(""),
  photoUrl: text("photo_url").notNull().default(""),
  whatsapp: text("whatsapp").notNull().default(""),
  telegram: text("telegram").notNull().default(""),
  instagram: text("instagram").notNull().default(""),
  tiktok: text("tiktok").notNull().default(""),
  facebook: text("facebook").notNull().default(""),
  youtube: text("youtube").notNull().default(""),
  message: text("message").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const files = sqliteTable("files", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull().default(0),
  storageKey: text("storage_key").notNull(),
  url: text("url").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});
