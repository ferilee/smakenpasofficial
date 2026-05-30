import { eq } from "drizzle-orm";
import { db } from "./client";
import { migrate } from "./migrate";
import {
  agendas,
  announcements,
  banners,
  downloads,
  facilities,
  galleries,
  galleryItems,
  majors,
  schoolProfile,
  schoolSettings,
  teachers,
  testimonials,
  users
} from "./schema";
import { hashPassword, socialProfileUrl } from "../lib/utils";

export async function seed() {
  migrate();

  const existingUser = await db.select().from(users).where(eq(users.email, "admin@sekolah.sch.id")).get();
  if (!existingUser) {
    await db.insert(users).values({
      name: "Administrator",
      username: "admin",
      email: "admin@sekolah.sch.id",
      password: await hashPassword("admin12345"),
      role: "admin"
    });
  } else if (!existingUser.username) {
    await db.update(users).set({ username: "admin" }).where(eq(users.id, existingUser.id));
  }

  const ferileeUser = await db.select().from(users).where(eq(users.username, "ferilee")).get();
  const ferileePassword = await hashPassword("F3r!-lee");
  if (!ferileeUser) {
    await db.insert(users).values({
      name: "Ferilee",
      username: "ferilee",
      email: "ferilee@sekolah.sch.id",
      password: ferileePassword,
      role: "admin"
    });
  } else {
    await db.update(users).set({
      name: "Ferilee",
      password: ferileePassword,
      role: "admin"
    }).where(eq(users.id, ferileeUser.id));
  }

  const settings = await db.select().from(schoolSettings).get();
  if (!settings) {
    await db.insert(schoolSettings).values({
      schoolName: "SMK Negeri Pas",
      tagline: "Unggul, Adaptif, Berkarakter, dan Siap Kerja",
      address: "Jl. Pendidikan No. 1, Kota Sekolah",
      email: "info@smknegeripas.sch.id",
      phone: "(021) 2005-2005",
      whatsapp: "6281220052005",
      wordpressUrl: "https://domainsekolah.sch.id/blog",
      ppdbUrl: "https://domainsekolah.sch.id/ppdb",
      metaDescription: "Website resmi SMK Negeri Pas sebagai pusat informasi sekolah.",
      footerText: "SMK Negeri Pas. Seluruh hak cipta dilindungi.",
      socialLinks: { instagram: "https://instagram.com/smknegeripas", youtube: "https://youtube.com" }
    });
  }

  const profile = await db.select().from(schoolProfile).get();
  if (!profile) {
    await db.insert(schoolProfile).values({
      history: "SMK Negeri Pas berdiri sebagai satuan pendidikan vokasi yang menyiapkan lulusan kompeten, berkarakter, dan relevan dengan kebutuhan industri.",
      vision: "Menjadi sekolah vokasi unggulan yang menghasilkan lulusan profesional, berakhlak, dan berdaya saing global.",
      mission: "Menyelenggarakan pembelajaran berbasis industri.\nMenguatkan karakter, literasi, dan budaya kerja.\nMengembangkan kemitraan dengan dunia usaha dan dunia industri.",
      principalName: "Drs. Budi Santoso",
      principalGreeting: "Selamat datang di website resmi sekolah. Semoga kanal ini menjadi pintu informasi yang terbuka bagi siswa, orang tua, alumni, industri, dan masyarakat.",
      principalPhotoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=80",
      principalCtaLabel: "Selengkapnya",
      principalCtaUrl: "/profil",
      identity: {
        NPSN: "20052005",
        Status: "Negeri",
        Jenjang: "SMK",
        Kurikulum: "Merdeka"
      },
      organization: "Kepala Sekolah, Wakil Kepala Sekolah, Kepala Program Keahlian, Wali Kelas, Guru, dan Tenaga Kependidikan.",
      accreditation: "A",
      location: "Kota Sekolah, Indonesia"
    });
  } else {
    await db.update(schoolProfile).set({
      principalPhotoUrl: profile.principalPhotoUrl || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=80",
      principalCtaLabel: profile.principalCtaLabel || "Selengkapnya",
      principalCtaUrl: profile.principalCtaUrl || "/profil"
    }).where(eq(schoolProfile.id, profile.id));
  }

  if ((await db.select().from(majors)).length === 0) {
    await db.insert(majors).values([
      {
        name: "Rekayasa Perangkat Lunak",
        slug: "rekayasa-perangkat-lunak",
        description: "Program keahlian yang mempelajari pengembangan aplikasi web, mobile, basis data, dan integrasi sistem.",
        competencies: "Pemrograman web, basis data, UI/UX, API, testing, deployment.",
        careerProspects: "Programmer, web developer, QA tester, UI designer, teknisi IT.",
        practiceFacilities: "Laboratorium komputer, jaringan internet, server praktik, perangkat kolaborasi.",
        productiveTeachers: "Tim guru produktif RPL",
        achievements: "Finalis lomba aplikasi tingkat provinsi.",
        isFeatured: true
      },
      {
        name: "Teknik Komputer dan Jaringan",
        slug: "teknik-komputer-dan-jaringan",
        description: "Program keahlian untuk merancang, memasang, dan mengelola jaringan komputer serta layanan infrastruktur.",
        competencies: "Administrasi jaringan, keamanan jaringan, server, cloud dasar, troubleshooting.",
        careerProspects: "Network administrator, teknisi jaringan, IT support, system administrator.",
        practiceFacilities: "Lab jaringan, router, switch, perangkat server, alat fiber optik.",
        productiveTeachers: "Tim guru produktif TKJ",
        achievements: "Juara lomba konfigurasi jaringan kota.",
        isFeatured: true
      }
    ]);
  }

  if ((await db.select().from(teachers)).length === 0) {
    await db.insert(teachers).values([
      { name: "Budi Santoso", position: "Kepala Sekolah", subject: "Manajemen Sekolah", expertise: "Kepemimpinan Pendidikan", status: "active" },
      { name: "Siti Aminah", position: "Guru Produktif", subject: "Pemrograman Web", expertise: "Full Stack Development", status: "active" },
      { name: "Ahmad Fauzi", position: "Guru Produktif", subject: "Administrasi Jaringan", expertise: "Network Infrastructure", status: "active" }
    ]);
  }

  if ((await db.select().from(facilities)).length === 0) {
    await db.insert(facilities).values([
      { name: "Laboratorium Komputer", description: "Ruang praktik komputer dengan koneksi internet dan perangkat pengembangan.", isFeatured: true },
      { name: "Laboratorium Jaringan", description: "Ruang praktik instalasi dan administrasi jaringan.", isFeatured: true },
      { name: "Perpustakaan", description: "Pusat literasi siswa dengan koleksi buku pelajaran dan referensi.", isFeatured: true }
    ]);
  }

  if ((await db.select().from(galleries)).length === 0) {
    const [gallery] = await db.insert(galleries).values({
      title: "Kegiatan Sekolah",
      slug: "kegiatan-sekolah",
      category: "Kegiatan",
      description: "Dokumentasi aktivitas pembelajaran, lomba, dan kegiatan siswa.",
      showOnHome: true
    }).returning();
    await db.insert(galleryItems).values([
      { galleryId: gallery.id, title: "Workshop Industri", type: "image", fileUrl: "", isFeatured: true },
      { galleryId: gallery.id, title: "Kegiatan P5", type: "image", fileUrl: "", isFeatured: true }
    ]);
  }

  if ((await db.select().from(agendas)).length === 0) {
    await db.insert(agendas).values([
      { title: "Rapat Wali Murid", startDate: "2026-06-08", endDate: "2026-06-08", location: "Aula Sekolah", description: "Koordinasi program semester dan pembagian informasi akademik.", status: "scheduled" },
      { title: "Workshop Kesiapan Industri", startDate: "2026-06-15", endDate: "2026-06-16", location: "Lab RPL", description: "Pelatihan praktik bersama mitra industri.", status: "scheduled" }
    ]);
  }

  if ((await db.select().from(announcements)).length === 0) {
    await db.insert(announcements).values([
      { title: "Jadwal Penilaian Akhir Tahun", content: "Penilaian akhir tahun dilaksanakan mulai 10 Juni 2026. Siswa wajib hadir 15 menit sebelum ujian dimulai.", isPriority: true, status: "active" },
      { title: "Informasi PPDB 2026", content: "Pendaftaran peserta didik baru dibuka melalui tautan resmi PPDB sekolah.", isPriority: true, status: "active" }
    ]);
  }

  if ((await db.select().from(downloads)).length === 0) {
    await db.insert(downloads).values([
      { title: "Brosur PPDB", category: "PPDB", description: "Informasi penerimaan peserta didik baru.", fileUrl: "#", fileType: "PDF", fileSize: "1.2 MB" },
      { title: "Kalender Akademik", category: "Akademik", description: "Kalender kegiatan akademik tahun berjalan.", fileUrl: "#", fileType: "PDF", fileSize: "860 KB" }
    ]);
  }

  if ((await db.select().from(banners)).length === 0) {
    await db.insert(banners).values([
      { title: "Website Resmi SMK Negeri Pas", subtitle: "Pusat informasi profil, agenda, pengumuman, dan layanan sekolah.", ctaLabel: "Lihat Profil", ctaUrl: "/profil", sortOrder: 1, isActive: true },
      { title: "Informasi PPDB", subtitle: "Temukan program keahlian dan alur pendaftaran siswa baru.", ctaLabel: "Buka PPDB", ctaUrl: "https://domainsekolah.sch.id/ppdb", sortOrder: 2, isActive: true }
    ]);
  }

  if ((await db.select().from(testimonials)).length === 0) {
    await db.insert(testimonials).values([
      {
        name: "Rizky Pratama",
        graduationYear: "2021",
        occupation: "Web Developer",
        photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
        instagram: socialProfileUrl("instagram", "rizkypratama"),
        message: "Pembelajaran praktik dan bimbingan guru membuat saya percaya diri masuk dunia kerja teknologi.",
        status: "approved"
      },
      {
        name: "Nadia Putri",
        graduationYear: "2020",
        occupation: "Staff Administrasi Industri",
        photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
        tiktok: socialProfileUrl("tiktok", "nadiaputri"),
        message: "Sekolah memberi bekal disiplin, komunikasi, dan keterampilan yang sangat terasa manfaatnya setelah lulus.",
        status: "approved"
      },
      {
        name: "Aldi Firmansyah",
        graduationYear: "2022",
        occupation: "Teknisi Jaringan",
        photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
        facebook: socialProfileUrl("facebook", "aldi.firmansyah"),
        message: "Fasilitas praktik dan pengalaman proyek di sekolah menjadi modal utama saya saat mulai bekerja.",
        status: "approved"
      }
    ]);
  }
}

if (import.meta.main) {
  await seed();
  console.log("Seed data selesai.");
}
