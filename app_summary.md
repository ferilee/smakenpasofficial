Siap. Karena fitur **artikel/postingan/berita sudah dikelola di WordPress**, maka aplikasi full stack ini bisa difokuskan sebagai **website profil sekolah + pusat konten statis/dinamis non-berita**.

Artinya, aplikasi tidak perlu memiliki fitur:

* Manajemen berita/artikel
* Kategori artikel
* Tag artikel
* Draft/publish artikel
* Editor postingan
* Halaman detail berita internal
* Statistik artikel
* Artikel terkait

Berita tetap bisa diarahkan ke WordPress melalui menu atau embed ringan.

---

# Ringkasan Aplikasi Setelah Fitur Berita Dihilangkan

Aplikasi ini adalah **website profil sekolah modern** yang berfungsi sebagai pusat informasi resmi sekolah. Fokus utamanya adalah menampilkan identitas sekolah, profil lembaga, program keahlian, fasilitas, guru dan tenaga kependidikan, galeri, agenda, pengumuman, file unduhan, serta kontak sekolah.

Untuk konten berita, aplikasi cukup menyediakan tombol atau menu menuju WordPress.

Contoh:

```txt
Berita Sekolah → diarahkan ke https://domainsekolah.sch.id/blog
```

Atau:

```txt
Baca Berita Terbaru → buka WordPress
```

---

# Alur Aplikasi Baru

## 1. Pengunjung Membuka Website Sekolah

Pengunjung masuk ke halaman beranda yang menampilkan informasi utama sekolah.

Isi beranda:

* Hero section dengan foto sekolah
* Nama dan tagline sekolah
* Sambutan kepala sekolah
* Profil singkat sekolah
* Program keahlian unggulan
* Fasilitas sekolah
* Prestasi atau highlight sekolah
* Agenda terdekat
* Pengumuman penting
* Galeri kegiatan
* Tombol menuju berita WordPress
* Kontak cepat

Beranda menjadi **lobi digital sekolah**, tempat pengunjung bisa langsung memahami wajah, karakter, dan keunggulan sekolah.

---

## 2. Pengunjung Membuka Profil Sekolah

Menu profil berisi informasi resmi sekolah.

Subfitur:

* Sejarah sekolah
* Visi dan misi
* Sambutan kepala sekolah
* Identitas sekolah
* Struktur organisasi
* Fasilitas
* Program unggulan
* Akreditasi
* Lokasi sekolah

---

## 3. Pengunjung Melihat Program Keahlian/Jurusan

Setiap jurusan memiliki halaman khusus.

Isi halaman jurusan:

* Nama program keahlian
* Deskripsi jurusan
* Kompetensi yang dipelajari
* Prospek kerja
* Fasilitas praktik
* Guru produktif
* Foto kegiatan jurusan
* Prestasi jurusan
* Link informasi PPDB

---

## 4. Pengunjung Melihat Data Guru dan Tendik

Website dapat menampilkan profil guru dan tenaga kependidikan.

Data yang ditampilkan:

* Nama
* Foto
* Jabatan
* Mata pelajaran
* Bidang keahlian
* Status aktif

---

## 5. Pengunjung Melihat Galeri

Galeri digunakan untuk menampilkan dokumentasi sekolah.

Jenis galeri:

* Foto kegiatan sekolah
* Album kegiatan
* Foto fasilitas
* Foto jurusan
* Dokumentasi ekstrakurikuler
* Video embed dari YouTube

File gambar disimpan di **RustFS**, sedangkan data album dan metadata file disimpan di **SQLite**.

---

## 6. Pengunjung Membuka Agenda Sekolah

Agenda digunakan untuk menampilkan jadwal kegiatan sekolah.

Contoh agenda:

* Upacara
* Ujian sekolah
* Rapat wali murid
* Workshop
* Kunjungan industri
* Class meeting
* Kegiatan P5
* PPDB
* Lomba

---

## 7. Pengunjung Membaca Pengumuman

Pengumuman tetap dikelola dari aplikasi ini karena sifatnya lebih administratif dan langsung.

Contoh pengumuman:

* Jadwal ujian
* Libur sekolah
* Pengambilan rapor
* Informasi PPDB
* Surat edaran
* Jadwal kegiatan penting

---

## 8. Pengunjung Mengunduh File

Website menyediakan halaman unduhan.

Contoh file:

* Brosur PPDB
* Kalender akademik
* Surat edaran
* Jadwal ujian
* Formulir
* Dokumen sekolah
* Panduan siswa

File disimpan di **RustFS**.

---

## 9. Admin Login ke Dashboard

Admin masuk melalui halaman login.

```txt
/admin/login
```

Setelah login, admin masuk ke dashboard untuk mengelola konten website selain berita.

---

# Fitur Utama Aplikasi

## 1. Beranda Sekolah

Menampilkan ringkasan informasi sekolah.

Fitur:

* Hero banner
* Profil singkat sekolah
* Sambutan kepala sekolah
* Highlight program keahlian
* Highlight fasilitas
* Agenda terdekat
* Pengumuman penting
* Galeri terbaru
* Link berita ke WordPress
* Kontak cepat

---

## 2. Profil Sekolah

Fitur:

* Sejarah
* Visi misi
* Sambutan kepala sekolah
* Identitas sekolah
* Struktur organisasi
* Fasilitas
* Akreditasi
* Lokasi sekolah

---

## 3. Program Keahlian/Jurusan

Fitur:

* Tambah jurusan
* Edit jurusan
* Hapus jurusan
* Upload foto jurusan
* Deskripsi kompetensi
* Prospek kerja
* Fasilitas praktik
* Guru terkait
* Prestasi jurusan

---

## 4. Guru dan Tenaga Kependidikan

Fitur:

* Tambah data guru/tendik
* Edit data
* Hapus data
* Upload foto
* Atur jabatan
* Atur mata pelajaran/bidang
* Status aktif/nonaktif

---

## 5. Galeri Sekolah

Fitur:

* Buat album galeri
* Upload banyak foto
* Tambah video YouTube
* Atur foto unggulan
* Kategori galeri
* Tampilkan galeri di beranda

---

## 6. Agenda Sekolah

Fitur:

* Tambah agenda
* Edit agenda
* Hapus agenda
* Tanggal mulai dan selesai
* Lokasi kegiatan
* Deskripsi kegiatan
* Status agenda

---

## 7. Pengumuman Sekolah

Fitur:

* Tambah pengumuman
* Edit pengumuman
* Hapus pengumuman
* Pengumuman prioritas
* Lampiran file
* Status aktif/nonaktif
* Tanggal publikasi

---

## 8. File Unduhan

Fitur:

* Upload dokumen
* Kategori dokumen
* Judul file
* Deskripsi file
* Tipe file
* Ukuran file
* Tombol download

---

## 9. Banner dan Slider

Fitur:

* Tambah banner
* Edit banner
* Hapus banner
* Atur urutan banner
* Tambah tombol CTA
* Aktif/nonaktif banner

Contoh CTA:

```txt
Lihat Profil Sekolah
Program Keahlian
Informasi PPDB
Baca Berita di WordPress
Hubungi Kami
```

---

## 10. Kontak Sekolah

Fitur:

* Alamat sekolah
* Nomor telepon
* Email
* WhatsApp
* Media sosial
* Google Maps embed
* Formulir pesan

---

## 11. Pengaturan Website

Fitur:

* Nama sekolah
* Logo sekolah
* Favicon
* Warna tema
* Alamat sekolah
* Email
* Telepon
* Media sosial
* Link WordPress berita
* Link PPDB
* Meta description
* Footer website

---

# Integrasi dengan WordPress

Karena berita sudah dibuat di WordPress, aplikasi cukup menyediakan integrasi sederhana.

## Opsi 1: Link Menu ke WordPress

Menu **Berita** langsung diarahkan ke WordPress.

```txt
/berita → redirect ke https://domainsekolah.sch.id/blog
```

Kelebihan:

* Paling mudah
* Tidak perlu sinkronisasi data
* WordPress tetap menjadi pusat berita

---

## Opsi 2: Embed Berita Terbaru dari WordPress

Beranda aplikasi bisa mengambil beberapa berita terbaru dari WordPress API.

Contoh alur:

```txt
Aplikasi mengambil 3 berita terbaru dari WordPress REST API
        ↓
Ditampilkan di beranda sebagai kartu berita
        ↓
Ketika diklik, pengunjung diarahkan ke WordPress
```

Data yang ditampilkan:

* Judul berita
* Tanggal publikasi
* Gambar utama
* Ringkasan singkat
* Link ke WordPress

Dengan cara ini, website utama tetap terlihat hidup tanpa perlu membuat fitur berita ganda.

---

# Struktur Menu Website Publik

```txt
Beranda
Profil
  - Sejarah
  - Visi Misi
  - Sambutan Kepala Sekolah
  - Fasilitas
Program Keahlian
Guru & Tendik
Galeri
Agenda
Pengumuman
Unduhan
Berita
Kontak
```

Catatan:

```txt
Menu Berita diarahkan ke WordPress
```

---

# Struktur Menu Dashboard Admin

```txt
Dashboard
Profil Sekolah
Program Keahlian
Guru & Tendik
Galeri
Agenda
Pengumuman
File Unduhan
Banner
Pesan Masuk
Pengaturan Website
User Admin
```

Fitur **Berita/Artikel** tidak masuk dashboard karena dikelola melalui WordPress.

---

# Alur Data Baru

```txt
Admin login
     ↓
Admin mengelola profil, jurusan, galeri, agenda, pengumuman, file
     ↓
Data teks disimpan ke SQLite
     ↓
File/gambar disimpan ke RustFS
     ↓
Konten tampil di website sekolah
```

Untuk berita:

```txt
Admin membuat berita di WordPress
     ↓
Website sekolah menampilkan link/preview berita
     ↓
Pengunjung klik
     ↓
Pengunjung diarahkan ke WordPress
```

---

# Struktur Teknologi

## Frontend

* Tailwind CSS
* shadcn/ui
* Layout responsif
* Komponen publik dan dashboard admin

## Backend

* Bun
* Hono
* REST API
* Middleware autentikasi
* Middleware upload file

## Database

* SQLite
* Drizzle ORM

Tabel utama:

```txt
users
school_profile
school_settings
majors
teachers
facilities
galleries
gallery_items
agendas
announcements
downloads
banners
messages
files
```

## Object Storage

* RustFS

Digunakan untuk:

```txt
Logo sekolah
Foto banner
Foto guru
Foto jurusan
Foto fasilitas
Foto galeri
File PDF
Lampiran pengumuman
Dokumen unduhan
```

## Deployment

* Docker Container
* Docker Compose
* Volume untuk SQLite
* Volume untuk RustFS

---

# Rekomendasi Fokus Pengembangan

Karena berita sudah ada di WordPress, aplikasi ini sebaiknya difokuskan menjadi:

```txt
Website profil sekolah + dashboard konten resmi + pusat file dan informasi sekolah
```

Prioritas MVP:

1. Beranda
2. Profil sekolah
3. Program keahlian
4. Guru & tendik
5. Galeri
6. Pengumuman
7. Agenda
8. File unduhan
9. Pengaturan website
10. Link/integrasi berita WordPress

---

# Kesimpulan

Dengan menghilangkan fitur artikel/berita internal, aplikasi menjadi lebih ramping, fokus, dan tidak tumpang tindih dengan WordPress.

Pembagian tugasnya menjadi jelas:

```txt
WordPress → khusus berita, artikel, postingan
Aplikasi Bun + Hono → profil sekolah, data resmi, galeri, agenda, pengumuman, file, dashboard
```

Hasil akhirnya adalah sistem yang lebih bersih: WordPress menjadi **mesin publikasi berita**, sedangkan aplikasi ini menjadi **markas digital profil dan informasi resmi sekolah**.
