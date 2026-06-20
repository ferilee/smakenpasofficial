import { eq } from "drizzle-orm";
import { db } from "./client";
import { migrate } from "./migrate";
import { schoolProfile, schoolSettings, users } from "./schema";
import { hashPassword } from "../lib/utils";

export async function seed() {
  migrate();

  const adminUser = await db.select().from(users).where(eq(users.username, "admin")).get();
  if (!adminUser) {
    await db.insert(users).values({
      name: "Administrator",
      username: "admin",
      email: "admin@example.test",
      password: await hashPassword("admin12345"),
      role: "admin"
    });
  }

  const settings = await db.select().from(schoolSettings).get();
  if (!settings) {
    await db.insert(schoolSettings).values({
      schoolName: "Website Sekolah",
      tagline: "",
      address: "",
      email: "",
      phone: "",
      whatsapp: "",
      wordpressUrl: "",
      ppdbUrl: "",
      metaDescription: "",
      footerText: "",
      socialLinks: {},
      quickLinks: [],
      editorPermissions: []
    });
  }

  const profile = await db.select().from(schoolProfile).get();
  if (!profile) {
    await db.insert(schoolProfile).values({
      history: "",
      vision: "",
      mission: "",
      principalName: "",
      principalGreeting: "",
      principalPhotoUrl: "",
      profileSummaryImageUrl: "",
      principalCtaLabel: "Selengkapnya",
      principalCtaUrl: "/profil",
      formerPrincipals: [],
      management: {},
      identity: {},
      organization: "",
      accreditation: "",
      location: ""
    });
  }
}

if (import.meta.main) {
  await seed();
  console.log("Seed bootstrap selesai.");
}
