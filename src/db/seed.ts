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

const managementContent = {
  kurikulum: {
    lead: "Mengatur arah pembelajaran agar selaras dengan kebutuhan sekolah, industri, dan capaian lulusan.",
    points: [
      "Penyusunan perangkat ajar dan kalender akademik.",
      "Koordinasi pembelajaran lintas mata pelajaran dan jurusan.",
      "Evaluasi hasil belajar, asesmen, dan tindak lanjut mutu.",
      "Sinkronisasi dengan kebutuhan DUDIKA dan dunia kerja."
    ],
    resources: []
  },
  kesiswaan: {
    lead: "Membina peserta didik agar disiplin, berkembang, dan aktif dalam kegiatan sekolah.",
    points: [
      "Pembinaan disiplin, tata tertib, dan budaya positif.",
      "Pendampingan OSIS, ekstrakurikuler, dan kepemimpinan siswa.",
      "Pemantauan absensi, kedisiplinan, dan kesejahteraan siswa.",
      "Koordinasi layanan BK dan pengembangan prestasi non-akademik."
    ],
    resources: []
  },
  prasaranasarana: {
    lead: "Menjaga ruang belajar, laboratorium, dan inventaris sekolah tetap layak, aman, dan siap pakai.",
    points: [
      "Pendataan dan pemeliharaan ruang, alat, dan inventaris.",
      "Pengaturan penggunaan laboratorium, kelas, dan fasilitas umum.",
      "Perencanaan kebutuhan pengadaan dan perbaikan fasilitas.",
      "Monitoring kebersihan, keamanan, dan kelayakan sarana."
    ],
    resources: []
  },
  humas: {
    lead: "Menjaga komunikasi dengan orang tua, mitra industri, dan masyarakat agar sekolah tetap terbuka dan relevan.",
    points: [
      "Kemitraan dengan industri, dunia kerja, dan lembaga eksternal.",
      "Publikasi kegiatan sekolah dan pengelolaan informasi resmi.",
      "Koordinasi layanan informasi untuk orang tua dan masyarakat.",
      "Dukungan promosi sekolah, PPDB, dan citra institusi."
    ],
    resources: []
  }
};

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
      schoolName: "SMK Negeri Pasirian.",
      tagline: "Unggul, Adaptif, Berkarakter, dan Siap Kerja",
      address: "Jalan Raya Condro – Pasirian/ 67372",
      email: "info@smkpasirian-lmj.sch.id",
      phone: "(0334) 574253",
      whatsapp: "6281220052005",
      wordpressUrl: "https://domainsekolah.sch.id/blog",
      ppdbUrl: "https://domainsekolah.sch.id/ppdb",
      metaDescription: "Website resmi SMK Negeri Pasirian sebagai pusat informasi sekolah.",
      footerText: "SMK Negeri Pasirian. Seluruh hak cipta dilindungi.",
      socialLinks: {
        instagram: "https://www.instagram.com/smknpasofficial/",
        youtube: "https://www.youtube.com/@SMKNPasirianOfficial"
      },
      quickLinks: [
        { label: "E-raport", url: "#", icon: "report", tone: "aqua" },
        { label: "Bursa Kerja Khusus (BKK)", url: "#", icon: "briefcase", tone: "violet" },
        { label: "SAKA", url: "#", icon: "shield", tone: "gold" }
      ]
    });
  }

  const profile = await db.select().from(schoolProfile).get();
  if (!profile) {
    await db.insert(schoolProfile).values({
      history: "SMK Negeri Pas berdiri sebagai satuan pendidikan vokasi yang menyiapkan lulusan kompeten, berkarakter, dan relevan dengan kebutuhan industri.",
      vision: "Menjadi sekolah vokasi unggulan yang menghasilkan lulusan profesional, berakhlak, dan berdaya saing global.",
      mission: "Melaksanakan ajaran agama yang dianut dengan sungguh-sungguh\nMembekali peserta didik dengan pengetahuan, keterampilan sesuai kompetensi yang selaras dengan DUDIKA.\nMemfasilitasi potensi peserta didik di bidang akademik dan non akademik.\nBerbudaya lingkungan, bersih dan sehat dalam kehidupan sehari hari.\nMenanamkan karakter profil pelajar Pancasila.",
      principalName: "Dermawan Triwahyono, S.T., M.M.",
      principalGreeting: "Selamat datang di portal resmi SMK Negeri Pasirian. Tempat pengetahuan, kreativitas, dan potensi bertemu untuk membentuk masa depan yang gemilang. Kami adalah sebuah lembaga pendidikan yang berkomitmen untuk mempersiapkan generasi muda yang unggul, disiplin, dan siap bersaing.",
      principalPhotoUrl: "https://i.ibb.co.com/Xr553J1B/Dermawan.png",
      profileSummaryImageUrl: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80",
      principalCtaLabel: "Selengkapnya",
      principalCtaUrl: "/profil",
      management: managementContent,
      identity: {
        "Nama Sekolah": "SMK Negeri Pasirian.",
        NSS: "32 1 05 21 05 009",
        NPSN: "20521455",
        "Status Akreditasi": "Negeri",
        "Alamat Sekolah": "Jalan Raya Condro – Pasirian/ 67372",
        Kabupaten: "Lumajang",
        Propinsi: "Jawa Timur",
        "Telepon/Fax": "(0334) 574253",
        "SK Pendirian Pejabat": "Bupati Lumajang",
        Nomor: "188.45/656/427.12/2003",
        "Tanggal Penetapan": "15 Desember 2003",
        "Tanggal Berdiri": "24 Juli 2003",
        "Luas Tanah": "20620 m2 ( sertifikat tgl 24 Maret 2005 )",
        IMB: "SK Kepala Dinas Kimpraswil Kab. Lumajang – No. 188.45/40/427.39/2004 – tanggal 5 Maret 2004",
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
      organization: "Kepala Sekolah, Wakil Kepala Sekolah, Kepala Program Keahlian, Wali Kelas, Guru, dan Tenaga Kependidikan.",
      accreditation: "A",
      location: "Kota Sekolah, Indonesia"
    });
  } else {
    await db.update(schoolSettings).set({
      schoolName: "SMK Negeri Pasirian.",
      address: "Jalan Raya Condro – Pasirian/ 67372",
      email: "info@smkpasirian-lmj.sch.id",
      phone: "(0334) 574253",
      metaDescription: "Website resmi SMK Negeri Pasirian sebagai pusat informasi sekolah.",
      footerText: "SMK Negeri Pasirian. Seluruh hak cipta dilindungi.",
      quickLinks: settings?.quickLinks?.length
        ? settings.quickLinks
        : [
            { label: "E-raport", url: "#", icon: "report", tone: "aqua" },
            { label: "Bursa Kerja Khusus (BKK)", url: "#", icon: "briefcase", tone: "violet" },
            { label: "SAKA", url: "#", icon: "shield", tone: "gold" }
          ]
    }).where(eq(schoolSettings.id, settings!.id));
    await db.update(schoolProfile).set({
      mission: "Melaksanakan ajaran agama yang dianut dengan sungguh-sungguh\nMembekali peserta didik dengan pengetahuan, keterampilan sesuai kompetensi yang selaras dengan DUDIKA.\nMemfasilitasi potensi peserta didik di bidang akademik dan non akademik.\nBerbudaya lingkungan, bersih dan sehat dalam kehidupan sehari hari.\nMenanamkan karakter profil pelajar Pancasila.",
      principalName: "Dermawan Triwahyono, S.T., M.M.",
      principalGreeting: "Selamat datang di portal resmi SMK Negeri Pasirian. Tempat pengetahuan, kreativitas, dan potensi bertemu untuk membentuk masa depan yang gemilang. Kami adalah sebuah lembaga pendidikan yang berkomitmen untuk mempersiapkan generasi muda yang unggul, disiplin, dan siap bersaing.",
      principalPhotoUrl: "https://i.ibb.co.com/Xr553J1B/Dermawan.png",
      profileSummaryImageUrl: profile.profileSummaryImageUrl || "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80",
      principalCtaLabel: "Selengkapnya",
      principalCtaUrl: "/profil",
      management: managementContent,
      identity: {
        "Nama Sekolah": "SMK Negeri Pasirian.",
        NSS: "32 1 05 21 05 009",
        NPSN: "20521455",
        "Status Akreditasi": "Negeri",
        "Alamat Sekolah": "Jalan Raya Condro – Pasirian/ 67372",
        Kabupaten: "Lumajang",
        Propinsi: "Jawa Timur",
        "Telepon/Fax": "(0334) 574253",
        "SK Pendirian Pejabat": "Bupati Lumajang",
        Nomor: "188.45/656/427.12/2003",
        "Tanggal Penetapan": "15 Desember 2003",
        "Tanggal Berdiri": "24 Juli 2003",
        "Luas Tanah": "20620 m2 ( sertifikat tgl 24 Maret 2005 )",
        IMB: "SK Kepala Dinas Kimpraswil Kab. Lumajang – No. 188.45/40/427.39/2004 – tanggal 5 Maret 2004",
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
      organization: "Kepala Sekolah, Wakil Kepala Sekolah, Kepala Program Keahlian, Wali Kelas, Guru, dan Tenaga Kependidikan.",
      accreditation: "A",
      location: "Kota Sekolah, Indonesia"
    }).where(eq(schoolProfile.id, profile.id));
  }

  const majorFixtures = [
    {
      name: "Desain Pemodelan dan Informasi Bangunan",
      slug: "desain-pemodelan-dan-informasi-bangunan",
      fieldCategory: "tkb",
      profileMarkdown: `Karakteristik Konsentrasi Keahlian **Desain Pemodelan dan Informasi Bangunan (DPIB)** di SMK Negeri Pasirian:

### 1. Fokus dan Tujuan Kompetensi
DPIB merupakan bagian dari Bidang Keahlian **Teknologi Konstruksi dan Bangunan**. Program ini bertujuan membekali peserta didik dengan pengetahuan dan keterampilan untuk menjadi profesional di bidang arsitektur dan teknik sipil. Fokus utamanya meliputi:
* **Perencanaan dan Desain:** Membuat desain pemodelan 2D dan 3D untuk struktur, arsitektur, interior, dan eksterior gedung.
* **Teknologi Digital:** Penggunaan perangkat lunak seperti **AutoCAD, SketchUp**, dan teknologi **Building Information Modelling (BIM)** dalam penggambaran konstruksi.
* **Estimasi Biaya:** Kemampuan menghitung Rencana Anggaran Biaya (RAB) atau *real cost estimate* pembangunan.
* **Pekerjaan Lapangan:** Meliputi pengukuran tanah (menggunakan alat sipat datar/leveling dan theodolit) serta pengawasan konstruksi.

### 2. Karakteristik Pembelajaran
Pembelajaran di DPIB dirancang untuk menumbuhkan motivasi, visi, imajinasi, dan kreativitas melalui berbagai metode:
* **Pembelajaran Berbasis Proyek:** Menerapkan studi kasus dan simulasi dunia kerja untuk memberikan pengalaman praktis.
* **Kombinasi Lingkungan Belajar:** Siswa belajar di dalam kelas, laboratorium, maupun langsung di dunia nyata (lapangan).
* **Interaksi Industri:** Melibatkan praktisi industri dan guru tamu, kunjungan ke industri, serta kegiatan Praktik Kerja Lapangan (PKL).

### 3. Fasilitas Praktik
Untuk mendukung pembelajaran standar industri, tersedia berbagai fasilitas pendukung:
* **Laboratorium Komputer:** Digunakan untuk praktik menggambar dengan perangkat lunak (AutoCAD/BIM).
* **Ruang Gambar Manual:** Untuk penguasaan dasar-dasar gambar teknik menggunakan mesin gambar.
* **Laboratorium Alat Bangunan:** Berisi peralatan untuk ilmu ukur tanah dan alat bangunan lainnya.

### 4. Profil Lulusan dan Prospek Kerja
Lulusan DPIB dipersiapkan untuk menjadi tenaga profesional yang mandiri dan berkarakter industri. Ruang lingkup pekerjaannya meliputi:
* **Drafter (Juru Gambar):** Ahli menggambar sipil maupun arsitektur di kementerian, konsultan, atau kontraktor.
* **Estimator:** Ahli menghitung biaya pembangunan gedung.
* **Supervisor/Pengawas Lapangan:** Mengawasi jalannya proyek konstruksi.
* **Juru Ukur Tanah:** Bekerja di departemen pekerjaan umum atau perusahaan pengembang.
* **Wirausahawan:** Mendirikan jasa perencanaan bangunan secara mandiri.
* **Studi Lanjut:** Melanjutkan ke perguruan tinggi di jurusan Teknik Sipil, Arsitektur, atau Desain Interior.

### 5. Kerja Sama Industri
DPIB telah menjalin kemitraan dengan berbagai instansi dan perusahaan (DUDIKA) seperti **Dinas Perumahan dan Kawasan Permukiman Lumajang**, **PT. Holcim**, **PT. Adhi Karya**, dan berbagai konsultan bangunan lainnya untuk sinkronisasi kurikulum, magang guru, serta PKL siswa.`,
      description: "Mempelajari pemodelan bangunan, gambar teknik, dan representasi informasi konstruksi secara digital.",
      competencies: "Gambar bangunan, pemodelan 3D, estimasi dasar, dokumentasi proyek, presentasi rancangan.",
      careerProspects: "Drafter, estimator, asisten perencana, teknisi gambar bangunan.",
      practiceFacilities: "Lab gambar, perangkat CAD, referensi desain, ruang proyek.",
      productiveTeachers: "Guru produktif bidang bangunan",
      achievements: "Juara desain gambar bangunan tingkat kabupaten.",
      isFeatured: true
    },
    {
      name: "Teknik Furnitur",
      slug: "teknik-furnitur",
      fieldCategory: "tkb",
      description: "Fokus pada perancangan, pembuatan, dan finishing produk furnitur berbasis kayu dan bahan alternatif.",
      competencies: "Desain furnitur, teknik sambungan, finishing, pengukuran, produksi workshop.",
      careerProspects: "Teknisi furnitur, operator workshop kayu, wirausaha mebel.",
      practiceFacilities: "Workshop kayu, mesin pertukangan, alat finishing, ruang praktik produk.",
      productiveTeachers: "Guru produktif furnitur",
      achievements: "Karya furnitur unggulan pada pameran sekolah.",
      isFeatured: true
    },
    {
      name: "Teknik Kendaraan Ringan",
      slug: "teknik-kendaraan-ringan",
      fieldCategory: "tmr",
      description: "Mempelajari servis, perawatan, dan diagnosis dasar kendaraan ringan berbasis praktik industri.",
      competencies: "Mesin otomotif, kelistrikan dasar, servis berkala, diagnosis, keselamatan kerja.",
      careerProspects: "Mekanik bengkel, teknisi servis, quality control otomotif.",
      practiceFacilities: "Bengkel otomotif, alat ukur, unit praktik kendaraan ringan.",
      productiveTeachers: "Guru produktif otomotif",
      achievements: "Finalis lomba keterampilan otomotif tingkat daerah.",
      isFeatured: true
    },
    {
      name: "Rekayasa Perangkat Lunak",
      slug: "rekayasa-perangkat-lunak",
      fieldCategory: "ti",
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
      fieldCategory: "ti",
      description: "Program keahlian untuk merancang, memasang, dan mengelola jaringan komputer serta layanan infrastruktur.",
      competencies: "Administrasi jaringan, keamanan jaringan, server, cloud dasar, troubleshooting.",
      careerProspects: "Network administrator, teknisi jaringan, IT support, system administrator.",
      practiceFacilities: "Lab jaringan, router, switch, perangkat server, alat fiber optik.",
      productiveTeachers: "Tim guru produktif TKJ",
      achievements: "Juara lomba konfigurasi jaringan kota.",
      isFeatured: true
    },
    {
      name: "Bisnis Digital",
      slug: "bisnis-digital",
      fieldCategory: "bm",
      description: "Mengembangkan kompetensi pemasaran digital, konten, analisis pelanggan, dan aktivitas bisnis daring.",
      competencies: "Digital marketing, marketplace, konten media sosial, analitik dasar, layanan pelanggan.",
      careerProspects: "Digital marketer, admin marketplace, social media specialist, pebisnis online.",
      practiceFacilities: "Lab komputer, studio konten, perangkat produksi digital.",
      productiveTeachers: "Guru produktif bisnis digital",
      achievements: "Produk digital siswa tampil di expo kewirausahaan.",
      isFeatured: true
    },
    {
      name: "Akuntansi",
      slug: "akuntansi",
      fieldCategory: "bm",
      description: "Mempelajari pencatatan transaksi, laporan keuangan, dan administrasi akuntansi berbasis teknologi.",
      competencies: "Jurnal, buku besar, laporan keuangan, aplikasi akuntansi, administrasi pajak dasar.",
      careerProspects: "Staf akuntansi, admin keuangan, kasir, asisten pembukuan.",
      practiceFacilities: "Lab akuntansi, komputer administrasi, perangkat lunak keuangan.",
      productiveTeachers: "Guru produktif akuntansi",
      achievements: "Juara olimpiade akuntansi tingkat sekolah.",
      isFeatured: true
    },
    {
      name: "Desain Komunikasi Visual",
      slug: "desain-komunikasi-visual",
      fieldCategory: "sek",
      description: "Mempelajari desain grafis, ilustrasi, layout, dan komunikasi visual untuk media cetak maupun digital.",
      competencies: "Desain grafis, tipografi, ilustrasi, layout, branding, presentasi visual.",
      careerProspects: "Desainer grafis, ilustrator, layout artist, content designer.",
      practiceFacilities: "Lab desain, tablet grafis, perangkat kreatif, studio visual.",
      productiveTeachers: "Guru produktif DKV",
      achievements: "Poster siswa menjuarai lomba desain visual.",
      isFeatured: true
    },
    {
      name: "Kriya Kreatif Kayu dan Rotan",
      slug: "kriya-kreatif-kayu-dan-rotan",
      fieldCategory: "sek",
      description: "Konsentrasi kriya yang fokus pada produk kreatif berbahan kayu dan rotan dengan sentuhan desain.",
      competencies: "Teknik kriya, pengolahan bahan, finishing, desain produk, presentasi karya.",
      careerProspects: "Pengrajin kriya, desainer produk, wirausaha kriya.",
      practiceFacilities: "Workshop kriya, alat pertukangan, bahan kayu dan rotan.",
      productiveTeachers: "Guru produktif kriya",
      achievements: "Karya kriya dipamerkan pada event daerah.",
      isFeatured: true
    },
    {
      name: "Produksi dan Siaran Program Televisi",
      slug: "produksi-dan-siaran-program-televisi",
      fieldCategory: "sek",
      description: "Mempelajari produksi konten video, pengambilan gambar, penyuntingan, dan siaran program televisi.",
      competencies: "Produksi video, penyiaran, camera handling, editing, naskah siaran.",
      careerProspects: "Videografer, editor, kru produksi, penyiar siaran, content creator.",
      practiceFacilities: "Studio video, kamera, lighting, perangkat editing, ruang produksi.",
      productiveTeachers: "Guru produktif broadcasting",
      achievements: "Karya video siswa tampil di festival pelajar.",
      isFeatured: true
    }
  ];

  for (const fixture of majorFixtures) {
    const existingMajor = await db.select().from(majors).where(eq(majors.slug, fixture.slug)).get();
    if (existingMajor) {
      await db.update(majors).set(fixture).where(eq(majors.id, existingMajor.id));
    } else {
      await db.insert(majors).values(fixture);
    }
  }

  if ((await db.select().from(teachers)).length === 0) {
    await db.insert(teachers).values([
      { name: "Dermawan Triwahyono", position: "Kepala Sekolah", subject: "Manajemen Sekolah", expertise: "Kepemimpinan Pendidikan", status: "active" },
      { name: "Sri Wahyuni", position: "Wakil Kepala Sekolah", subject: "Kesiswaan", expertise: "Manajemen Kesiswaan", status: "active" },
      { name: "Maya Sari", position: "Wakil Kepala Sekolah", subject: "Kurikulum", expertise: "Perencanaan Pembelajaran", status: "active" },
      { name: "Hendra Saputra", position: "Wakil Kepala Sekolah", subject: "Sarana Prasarana", expertise: "Manajemen Sarpras", status: "active" },
      { name: "Rina Kurniasih", position: "Wakil Kepala Sekolah", subject: "Humas", expertise: "Kemitraan dan Publikasi", status: "active" },
      { name: "Ahmad Fauzi", position: "Ketua Konsentrasi Keahlian", subject: "Teknik Komputer dan Jaringan", expertise: "Koordinasi Konsentrasi Keahlian", status: "active" },
      { name: "Dewi Lestari", position: "Ketua Konsentrasi Keahlian", subject: "Rekayasa Perangkat Lunak", expertise: "Koordinasi Konsentrasi Keahlian", status: "active" },
      { name: "Fajar Pratama", position: "Ketua Konsentrasi Keahlian", subject: "Akuntansi", expertise: "Koordinasi Konsentrasi Keahlian", status: "active" },
      { name: "Nia Permata", position: "Ketua Konsentrasi Keahlian", subject: "Pemasaran", expertise: "Koordinasi Konsentrasi Keahlian", status: "active" },
      { name: "Agus Salim", position: "Ketua Konsentrasi Keahlian", subject: "Manajemen Perkantoran", expertise: "Koordinasi Konsentrasi Keahlian", status: "active" },
      { name: "Riko Mahendra", position: "Ketua Konsentrasi Keahlian", subject: "Desain Komunikasi Visual", expertise: "Koordinasi Konsentrasi Keahlian", status: "active" },
      { name: "Siti Aminah", position: "Ketua Konsentrasi Keahlian", subject: "Animasi", expertise: "Koordinasi Konsentrasi Keahlian", status: "active" },
      { name: "Budi Santoso", position: "Ketua Konsentrasi Keahlian", subject: "Kuliner", expertise: "Koordinasi Konsentrasi Keahlian", status: "active" },
      { name: "Lina Wulandari", position: "Ketua Konsentrasi Keahlian", subject: "Tata Boga", expertise: "Koordinasi Konsentrasi Keahlian", status: "active" },
      { name: "Yoga Saputra", position: "Ketua Konsentrasi Keahlian", subject: "Teknik Mesin", expertise: "Koordinasi Konsentrasi Keahlian", status: "active" }
    ]);
  }
  const teacherFixtures = [
    { name: "Dermawan Triwahyono", position: "Kepala Sekolah", subject: "Manajemen Sekolah", expertise: "Kepemimpinan Pendidikan", status: "active" },
    { name: "Sri Wahyuni", position: "Wakil Kepala Sekolah", subject: "Kesiswaan", expertise: "Manajemen Kesiswaan", status: "active" },
    { name: "Maya Sari", position: "Wakil Kepala Sekolah", subject: "Kurikulum", expertise: "Perencanaan Pembelajaran", status: "active" },
    { name: "Hendra Saputra", position: "Wakil Kepala Sekolah", subject: "Sarana Prasarana", expertise: "Manajemen Sarpras", status: "active" },
    { name: "Rina Kurniasih", position: "Wakil Kepala Sekolah", subject: "Humas", expertise: "Kemitraan dan Publikasi", status: "active" },
    { name: "Ahmad Fauzi", position: "Ketua Konsentrasi Keahlian", subject: "Teknik Komputer dan Jaringan", expertise: "Koordinasi Konsentrasi Keahlian", status: "active" },
    { name: "Dewi Lestari", position: "Ketua Konsentrasi Keahlian", subject: "Rekayasa Perangkat Lunak", expertise: "Koordinasi Konsentrasi Keahlian", status: "active" },
    { name: "Fajar Pratama", position: "Ketua Konsentrasi Keahlian", subject: "Akuntansi", expertise: "Koordinasi Konsentrasi Keahlian", status: "active" },
    { name: "Nia Permata", position: "Ketua Konsentrasi Keahlian", subject: "Pemasaran", expertise: "Koordinasi Konsentrasi Keahlian", status: "active" },
    { name: "Agus Salim", position: "Ketua Konsentrasi Keahlian", subject: "Manajemen Perkantoran", expertise: "Koordinasi Konsentrasi Keahlian", status: "active" },
    { name: "Riko Mahendra", position: "Ketua Konsentrasi Keahlian", subject: "Desain Komunikasi Visual", expertise: "Koordinasi Konsentrasi Keahlian", status: "active" },
    { name: "Siti Aminah", position: "Ketua Konsentrasi Keahlian", subject: "Animasi", expertise: "Koordinasi Konsentrasi Keahlian", status: "active" },
    { name: "Budi Santoso", position: "Ketua Konsentrasi Keahlian", subject: "Kuliner", expertise: "Koordinasi Konsentrasi Keahlian", status: "active" },
    { name: "Lina Wulandari", position: "Ketua Konsentrasi Keahlian", subject: "Tata Boga", expertise: "Koordinasi Konsentrasi Keahlian", status: "active" },
    { name: "Yoga Saputra", position: "Ketua Konsentrasi Keahlian", subject: "Teknik Mesin", expertise: "Koordinasi Konsentrasi Keahlian", status: "active" }
  ];
  for (const fixture of teacherFixtures) {
    const existingTeacher = await db.select().from(teachers).where(eq(teachers.name, fixture.name)).get();
    if (existingTeacher) {
      await db.update(teachers).set({
        position: fixture.position,
        subject: fixture.subject,
        expertise: fixture.expertise,
        status: fixture.status
      }).where(eq(teachers.id, existingTeacher.id));
    } else {
      await db.insert(teachers).values(fixture);
    }
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
