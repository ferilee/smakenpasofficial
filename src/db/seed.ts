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
      profileCtaLabel: "Lihat Album Foto/Video",
      profileCtaUrl: "",
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
      profileCtaLabel: "Lihat Album Foto/Video",
      profileCtaUrl: "",
      profileMarkdown: `Karakteristik Konsentrasi Keahlian **Desain dan Teknik Furnitur (DTF)** di SMK Negeri Pasirian:

### 1. Identitas dan Fokus Program
* DTF merupakan konsentrasi keahlian di bawah Program Keahlian Teknik Furnitur yang termasuk dalam Bidang Keahlian **Teknologi Konstruksi dan Bangunan**.
* Masa pembelajaran ditempuh selama **3 tahun**.
* Fokus keilmuan bergerak di bidang **desain interior dan furnitur** yang menggabungkan seni terapan, pengetahuan bahan, serta teknik manufaktur.

### 2. Tahapan Kompetensi
Pembelajaran dibagi menjadi dua fase utama:
* **Fase E (Kelas X):** dasar-dasar pekerjaan furnitur, gambar teknik manual dan digital, karakteristik kayu, penggunaan alat dan mesin tangan, serta penerapan K3LH.
* **Fase F (Kelas XI & XII):** gambar kerja furnitur 2D/3D (CAD), pembahanan dengan mesin statis dan **CNC**, teknik finishing, serta penghitungan **Estimasi Biaya (RAB)**.

### 3. Metode dan Lingkungan Belajar
* Belajar dilakukan di ruang kelas, bengkel (*workshop*), dan laboratorium komputer.
* Siswa mengerjakan proyek sederhana, kunjungan industri, pencarian informasi digital, serta interaksi langsung dengan praktisi industri atau alumni.
* Selain *hard skills*, siswa dilatih berpikir kritis, kolaborasi, komunikasi, dan literasi digital.

### 4. Profil Lulusan dan Prospek Kerja
Lulusan DTF dipersiapkan untuk berkontribusi di pasar kerja maupun wirausaha. Ruang lingkupnya meliputi:
* **Desain Interior:** perencana tata letak ruang dalam bangunan.
* **Pelaksana Desain Interior:** pembuat purwarupa (*prototipe*) desain interior.
* **Industri/Desain Furnitur:** perancang dan pembuat produk artistik berbahan kayu atau material baru.
* **Wirausaha:** mengelola bisnis mandiri di bidang teknologi konstruksi dan bangunan.

### 5. Kerja Sama Industri (DUDIKA)
DTF bermitra aktif melalui **PKL**, **Magang Guru**, **Guru Tamu**, dan **Sinkronisasi Kurikulum**. Mitra industri antara lain:
* P.T. Woodone Integra Indonesia
* P.T. Mustikatama Group
* P.T. Tanjung Rimba Perkasa
* Lumajang Furnitur dan berbagai bengkel mebel lainnya.`,
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
      profileCtaLabel: "Lihat Album Foto/Video",
      profileCtaUrl: "",
      profileMarkdown: `Karakteristik Konsentrasi Keahlian **Teknik Kendaraan Ringan (TKR)** di SMK Negeri Pasirian:

### 1. Fokus dan Ruang Lingkup
Teknik Kendaraan Ringan merupakan bagian dari Program Keahlian **Teknik Otomotif** yang menekankan pada penguasaan jasa perawatan dan perbaikan kendaraan ringan. Peserta didik dibekali keterampilan untuk melakukan pemeliharaan komponen mobil sesuai standar.

### 2. Kompetensi Utama
Kurikulum dirancang untuk mencetak tenaga profesional melalui dua tahap utama:
* **Dasar-Dasar Teknik Otomotif (Fase E):** wawasan dunia otomotif, K3LH, gambar teknik, penggunaan peralatan bengkel, dasar kelistrikan, serta dasar sistem hidrolik dan pneumatik.
* **Konsentrasi Keahlian (Fase F):** konversi energi, manajemen bengkel, **perawatan berkala (1.000 km hingga kelipatannya)**, serta perbaikan/overhaul pada sistem engine, power train, sasis, elektrikal, dan AC kendaraan.

### 3. Fasilitas dan Tenaga Pendidik
* **Tenaga Pendidik:** 5 orang guru dengan kualifikasi minimal S1/D4 di bidang Teknik Otomotif.
* **Sarana Prasarana:** ruang kelas teori, ruang guru produktif, dan **Bengkel Otomotif** sebagai area praktik utama.
* **Lingkungan Belajar:** pembelajaran dilakukan di kelas, bengkel, melalui projek sederhana, serta pencarian informasi melalui media digital.

### 4. Profil Lulusan dan Prospek Kerja
Lulusan dipersiapkan untuk menjadi individu mandiri, berkarakter Pancasila, dan sesuai tuntutan dunia kerja. Prospeknya meliputi:
* Perakit dan teknisi perawatan pada bagian elektrikal, mesin, sasis, dan power train.
* Okupasi spesifik seperti *mechanical basic*, *mechanical trainer*, *mechanical junior*, *maintenance technician*, *welder*, hingga *machine engineer*.
* Wirausaha di bidang teknologi manufaktur dan rekayasa.

### 5. Kerja Sama Industri (DUDIKA)
TKR SMK Negeri Pasirian menjalin kemitraan aktif untuk menjaga relevansi kurikulum melalui program magang guru, guru tamu, PKL, dan rekrutmen. Mitra industrinya antara lain:
* **Bengkel SUN MOTOR** dan **PT Sun Star Motor**
* **Daihatsu Lumajang** dan **BMW Astra Malang**
* **BLKI Singosari** serta berbagai bengkel spesialis lainnya seperti Perfecta Motor dan Sinar Asia Motor.`,
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
      profileCtaLabel: "Lihat Album Foto/Video",
      profileCtaUrl: "",
      profileMarkdown: `Karakteristik Konsentrasi Keahlian **Rekayasa Perangkat Lunak (RPL)** di SMK Negeri Pasirian:

### 1. Fokus dan Ruang Lingkup
Rekayasa Perangkat Lunak merupakan konsentrasi keahlian di bawah Program Keahlian **Pengembangan Perangkat Lunak dan Gim** yang termasuk dalam Bidang Keahlian **Teknologi Informasi**. Program ini mempelajari pengembangan perangkat lunak, pemeliharaan, manajemen organisasi pengembangan, serta manajemen kualitas perangkat lunak.

### 2. Kompetensi Utama
Pembelajaran dibekali melalui dua fase utama:
* **Fase E (Dasar):** wawasan dunia kerja, *cloud computing*, *technopreneurship*, teknologi jaringan komputer, pemrograman terstruktur, dan dasar PBO.
* **Fase F (Lanjutan):** Basis Data (SQL), pemrograman berbasis teks, grafis dan multimedia (GUI), pemrograman web statis dan dinamis, serta pengembangan aplikasi perangkat bergerak (*Mobile Programming*).

### 3. Perangkat Lunak dan Fasilitas Praktik
* **NetBeans IDE** dan **Visual Studio Code** untuk pengembangan kode.
* **Android Studio** untuk aplikasi *mobile*.
* **Dev-C++, Adobe Dreamweaver,** dan **Edraw Max** untuk mendukung kebutuhan desain dan pemrograman.
* Praktik dilakukan di laboratorium komputer dan melalui proyek sederhana.

### 4. Metode Pembelajaran dan Keterampilan Abad ke-21
* Berpikir kritis, kolaborasi tim, komunikasi lisan/tulisan, dan literasi digital.
* Kunjungan industri, interaksi dengan praktisi/alumni, serta guru tamu.
* Penanaman nilai Pancasila, integritas, dan etos kerja.

### 5. Profil Lulusan dan Prospek Kerja
* **Software Developer/Engineer**
* **Web & Mobile Developer**
* **Database Administrator & System Analyst**
* **IT Consultant & Game Developer**
* **Techno-Preneur**

### 6. Kerja Sama Industri (DUDIKA)
Kemitraan dengan perusahaan teknologi untuk PKL, magang guru, dan sinkronisasi kurikulum, seperti **Inatech Malang, Mascitra Jember, Luisoft Lumajang**, **Perumda Tirta Mahameru**, **Badan Pertanahan Lumajang**, **Dispendukcapil Lumajang**, dan kantor kecamatan/desa Pasirian.`,
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
      profileCtaLabel: "Lihat Album Foto/Video",
      profileCtaUrl: "",
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
      profileCtaLabel: "Lihat Album Foto/Video",
      profileCtaUrl: "",
      profileMarkdown: `Karakteristik Konsentrasi Keahlian **Bisnis Digital** di SMK Negeri Pasirian:

### 1. Fokus dan Definisi
Bisnis Digital mempelajari usaha penjualan produk/jasa secara **daring (online)** melalui situs web maupun aplikasi. Fokus utamanya membekali siswa menjadi pemasar yang mampu bekerja secara konvensional dan digital.

### 2. Tahapan dan Capaian Pembelajaran
* **Fase E (Kelas X):** dasar perkembangan produksi online, wawasan dunia kerja pemasaran, K3LH, budaya kerja, dan ilmu ekonomi dasar.
* **Fase F (Kelas XI & XII):** *Marketing*, *Perencanaan Bisnis*, *Komunikasi Bisnis*, serta operasional digital seperti **Digital Branding**, **Digital Onboarding**, **Digital Marketing (SEO/SEM)**, dan **Digital Operation**.

### 3. Fasilitas dan Tenaga Pendidik
* Ruang kelas teori, ruang guru produktif, **Laboratorium Komputer**, dan ruang praktik digital.
* Memiliki 4 orang guru produktif berkualifikasi minimal S1/D4 dengan latar magang industri dan pelatihan kompetensi.

### 4. Metode Pembelajaran
* Berpusat pada siswa dan aktif mencari informasi melalui media digital.
* Berbasis proyek sederhana dan simulasi dunia kerja.
* Belajar dari internet dan lingkungan masyarakat.

### 5. Profil Lulusan dan Prospek Kerja
* *Affiliator, Content Creator, Influencer, Konsultan Bisnis Digital*
* Manajer e-commerce, spesialis media sosial, dan *Digital Marketer*
* Kasir, *merchandiser*, *public relation*, pramuniaga, atau supervisor
* Staf perbankan, asuransi, administrasi keuangan, dan wirausaha mandiri

### 6. Kerja Sama Industri (DUDIKA)
PKL, Magang Guru, Sinkronisasi Kurikulum, dan Guru Tamu dengan mitra seperti **Matahari Lippo Plaza Jember, Graha Mulia, Toko Rezeki Baru, Sinar Terang, Bank Jatim Pasirian**, dan Kantor Kecamatan Pasirian.`,
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
      profileCtaLabel: "Lihat Album Foto/Video",
      profileCtaUrl: "",
      profileMarkdown: `Karakteristik Konsentrasi Keahlian **Akuntansi** di SMK Negeri Pasirian:

### 1. Fokus dan Tujuan Utama
Akuntansi merupakan konsentrasi keahlian dalam program **Akuntansi dan Keuangan Lembaga** di bawah bidang **Bisnis dan Manajemen**. Fokusnya membekali siswa menjadi **Teknisi Akuntansi Junior** dengan kemampuan pencatatan keuangan manual dan komputerisasi, perpajakan, serta kemandirian.

### 2. Tahapan Kompetensi
* **Fase E (Dasar-Dasar):** wawasan dunia kerja, perkembangan teknologi akuntansi, etika profesi, K3LH, budaya kerja 5R, dasar-dasar perbankan, dan spreadsheet.
* **Fase F (Konsentrasi):** akuntansi perusahaan jasa/dagang/manufaktur, akuntansi lembaga, akuntansi keuangan & perpajakan, serta komputer akuntansi dan sistem *e-commerce*.

### 3. Lingkungan dan Fasilitas Belajar
* **Laboratorium Komputer Akuntansi**
* **Laboratorium Bank Mini**
* Laboratorium akuntansi perusahaan dagang dan ruang praktik akuntansi manual
* Pendekatan interaktif, praktikum laboratorium, proyek sederhana, dan pencarian informasi digital

### 4. Profil Lulusan dan Prospek Kerja
* Teknisi Akuntansi Junior, *Account Officer*, *Credit Analyst*, *Budgeting Staff*
* Kasir, **Teller Bank**, dan *Customer Service* Bank
* Staf keuangan di kantor pajak, bea cukai, perbankan, asuransi, dan instansi pemerintah
* Wirausaha mandiri atau melanjutkan ke perguruan tinggi bidang perpajakan dan akuntansi

### 5. Kerja Sama Industri (DUDIKA)
Program Akuntansi aktif bermitra dengan **PT Cipta Sarana Cendekia Malang**, **BAZNAS**, **Badan Pertanahan Nasional (BPN)**, **BAPENDA Provinsi Jawa Timur**, **Gramedia**, **Graha Mulia Toserba**, dan toko/apotek lokal lainnya.`,
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
      profileCtaLabel: "Lihat Album Foto/Video",
      profileCtaUrl: "",
      profileMarkdown: `Karakteristik Konsentrasi Keahlian **Desain Komunikasi Visual (DKV)** di SMK Negeri Pasirian:

### 1. Fokus dan Definisi
DKV berada di bawah Bidang Keahlian **Seni dan Ekonomi Kreatif** dan berfokus pada pengolahan **pesan visual secara informatif, komunikatif, dan efektif** agar tepat sasaran.

### 2. Tahapan Kompetensi
* **Fase E (Dasar-Dasar):** kreativitas, menggambar sketsa dan ilustrasi, tipografi, dasar fotografi, dan komputer grafis.
* **Fase F (Lanjutan):** perangkat lunak desain profesional, *Design Brief* (*design thinking*), serta proses produksi desain dari praproduksi hingga pascaproduksi.

### 3. Fasilitas dan Tenaga Pendidik
* 4 hingga 6 guru dengan kualifikasi minimal S1/D4 di bidang DKV
* Ruang kelas teori, ruang guru produktif, **laboratorium komputer**, serta **studio fotografi dan videografi**
* Akses internet cepat dan perangkat teknologi yang memadai

### 4. Metode Pembelajaran
* Porsi *soft skills* sekitar 75% pada fase awal
* Berpikir kritis, kolaborasi, komunikasi lisan/tulisan, dan literasi digital
* Pembelajaran di kelas, studio, laboratorium, proyek sederhana, dan kunjungan industri

### 5. Profil Lulusan dan Prospek Kerja
* Desainer grafis, multimedia, dan produk
* **Art Director**, fotografer, videografer, penyunting video, **animator**, ilustrator, komikus, dan penulis naskah
* Biro iklan, percetakan, penerbitan, studio animasi, *production house*, *Content Creator*, dan technopreneur

### 6. Kerja Sama Industri (DUDIKA)
Mitra industri meliputi **Graono Digital Printing, Wimart SMKN Pasirian, Araya Digital Printing, Melon Digital Printing, Kreasi Langit Surabaya, El Aviv Production, Riski Foto, Motivace Store, California Advertising, Junkis Clothing**, dan studio foto lokal lainnya.`,
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
      profileCtaLabel: "Lihat Album Foto/Video",
      profileCtaUrl: "",
      profileMarkdown: `Karakteristik Konsentrasi Keahlian **Kriya Kreatif Kayu dan Rotan (KKKR)** di SMK Negeri Pasirian:

### 1. Definisi dan Fokus Keahlian
KKKR berfokus pada pembuatan produk kerajinan yang menggabungkan nilai fungsi dan estetika menggunakan bahan utama kayu dan rotan. Produk yang dihasilkan meliputi benda pakai, hiasan dinding, patung, topeng, gebyok, hingga furnitur artistik.

### 2. Tahapan dan Capaian Pembelajaran
* **Fase E (Dasar-Dasar):** manajemen industri kreatif, wawasan seni kriya, aplikasi gambar digital, marketplace online, budaya kerja, dan K3LH.
* **Fase F (Konsentrasi):** kerja ukir, kerja bangku dan mesin, anyaman dan assembling, serta finishing manual maupun semprot.

### 3. Karakteristik dan Metode Pembelajaran
* Porsi dominan 75% untuk pengembangan karakter dan etos kerja
* Belajar di kelas, studio/bengkel, dan kegiatan **Teaching Factory**
* Pembelajaran berbasis proyek, kunjungan industri, dan interaksi dengan guru tamu serta alumni

### 4. Fasilitas dan Tenaga Pendidik
* 5 guru berkualifikasi minimal S1/D4 di bidang **Seni Rupa dan Kriya Seni**
* Ruang kelas teori, ruang guru produktif, dan **Bengkel KKKR** dengan mesin perkayuan standar industri

### 5. Profil Lulusan dan Prospek Kerja
* *Drafter*, juru ukir, dekorator, tata artistik, dan pembuat prototipe model
* Pengusaha muda kerajinan kayu dan rotan atau desainer kriya mandiri
* Pendidik seni, konsultan desain, atau lanjut ke perguruan tinggi

### 6. Kerja Sama Industri (DUDIKA)
Mitra aktif meliputi **Dfanda Rotan**, **Matoa Design**, **Imam Meubel**, **Widie Art Furniture**, dan **PT Woodone Integra Indonesia**.`,
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
      profileCtaLabel: "Lihat Album Foto/Video",
      profileCtaUrl: "",
      profileMarkdown: `Karakteristik Konsentrasi Keahlian **Produksi dan Siaran Program Televisi (PSPT)** di SMK Negeri Pasirian:

### 1. Fokus dan Tujuan Kompetensi
PSPT berada dalam Program Keahlian **Broadcasting dan Perfilman** dan bertujuan membekali siswa untuk memproduksi berbagai program televisi seperti *talk show*, video klip, dokumenter, dan film pendek.

### 2. Tahapan dan Capaian Pembelajaran
* **Fase E (Dasar-Dasar):** dunia kerja penyiaran, media digital, teknik dasar audio visual, dan prosedur operasional standar produksi.
* **Fase F (Konsentrasi):** manajemen produksi & penulisan naskah, penyutradaraan, tata kamera, tata cahaya, tata suara, tata artistik, serta editing audio-video dan penyiaran online.

### 3. Fasilitas Praktik dan Tenaga Pendidik
* **Studio Program Acara Televisi**
* **Laboratorium Komputer** untuk editing video dan audio
* Tenaga pendidik berkualifikasi minimal S1/D4 dengan disiplin ilmu Teknologi Informatika

### 4. Karakteristik Pembelajaran
* Pembelajaran berbasis proyek dan simulasi dunia kerja
* Belajar di kelas, laboratorium, dan lapangan
* Interaksi industri melalui kunjungan, guru tamu, dan PKL

### 5. Profil Lulusan dan Prospek Kerja
* Sutradara, kamerawan, presenter/penyiar televisi
* Editor video, penata suara, penulis naskah
* Jurnalis televisi, manajemen produksi, wirausaha konten kreatif, atau lanjut ke Ilmu Komunikasi dan Perfilman

### 6. Kerja Sama Industri (DUDIKA)
Kemitraan aktif dengan **Kompas TV Jember, JTV Jember, JTV Malang, Arema TV, Paradise Picture**, dan **Radio City Guide**.`,
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
