# Website Profil Sekolah

Aplikasi ini adalah website profil sekolah + dashboard konten resmi sesuai ringkasan di `app_summary.md`. Fitur berita/artikel tidak dibuat di aplikasi ini karena diarahkan ke WordPress melalui menu `Berita` dan endpoint redirect `/berita`.

## Teknologi

- Bun
- Hono
- Drizzle ORM
- SQLite
- CSS responsif dengan gaya komponen dashboard
- RustFS/S3-compatible object storage untuk produksi
- Fallback upload lokal ke folder `uploads` untuk pengembangan

## Menjalankan Aplikasi

Install dependency:

```bash
bun install
```

Jalankan server:

```bash
bun run dev
```

Aplikasi berjalan di:

```txt
http://localhost:2005
```

Server memakai port `2005` secara default. Jika perlu mengganti port:

```bash
PORT=2005 bun src/server.ts
```

## Akun Admin Awal

Seed data otomatis dijalankan saat server pertama kali hidup.

```txt
URL login : http://localhost:2005/admin/login
Username  : ferilee
Password  : F3r!-lee
```

Segera ganti password dan `TOKEN_SECRET` untuk penggunaan produksi.

## Struktur Halaman Publik

- `/` beranda sekolah
- `/profil` profil sekolah
- `/program-keahlian` daftar jurusan
- `/guru-tendik` guru dan tenaga kependidikan
- `/galeri` album galeri
- `/agenda` agenda sekolah
- `/pengumuman` pengumuman
- `/unduhan` file unduhan
- `/kontak` kontak dan formulir pesan
- `/berita` redirect ke WordPress

## Dashboard Admin

Dashboard berada di:

```txt
http://localhost:2005/admin
```

Menu admin:

- Dashboard
- Profil Sekolah
- Pengaturan Website
- Program Keahlian
- Guru & Tendik
- Fasilitas
- Galeri
- Agenda
- Pengumuman
- File Unduhan
- Banner
- Pesan Masuk
- Upload File

## API

Semua API berada di prefix `/api`.

Endpoint umum:

```txt
GET  /api/health
GET  /api/public/home
GET  /api/public/profile
GET  /api/public/wordpress
POST /api/messages
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

Endpoint admin CRUD:

```txt
GET    /api/majors
POST   /api/majors
PUT    /api/majors/:id
DELETE /api/majors/:id
```

Pola yang sama tersedia untuk:

```txt
teachers
facilities
galleries
gallery-items
agendas
announcements
downloads
banners
messages
testimonials
```

Endpoint singleton:

```txt
GET /api/profile
PUT /api/profile
GET /api/settings
PUT /api/settings
```

Upload file:

```txt
POST /api/upload
```

Gunakan form-data dengan field:

```txt
file
```

## Pengujian

Jalankan pengecekan TypeScript dan unit test backend:

```bash
bun run check
```

Atau jalankan test saja:

```bash
bun test
```

Setiap perubahan pada backend API atau fungsi utilitas wajib diikuti dengan:

```bash
bun run check
```

Unit test berada di:

```txt
tests/api.test.ts
```

Test memakai SQLite sementara, sehingga tidak mengubah `data/app.db`.

## Database

SQLite disimpan di:

```txt
data/app.db
```

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
testimonials
files
```

Drizzle schema berada di:

```txt
src/db/schema.ts
```

Migrasi ringan `CREATE TABLE IF NOT EXISTS` dijalankan dari:

```txt
src/db/migrate.ts
```

Seed data berada di:

```txt
src/db/seed.ts
```

Menjalankan seed manual:

```bash
bun run db:seed
```

## Integrasi WordPress

Link WordPress berita disimpan di pengaturan website pada field `wordpressUrl`.

Menu publik:

```txt
/berita
```

akan redirect ke URL WordPress tersebut.

Beranda juga menyediakan endpoint:

```txt
GET /api/public/wordpress
```

Endpoint ini mencoba membaca 3 posting terbaru dari WordPress REST API:

```txt
{wordpressUrl}/wp-json/wp/v2/posts?_embed=1&per_page=3
```

## Upload dan RustFS

Endpoint upload:

```txt
POST /api/upload
```

Perilaku upload:

- jika env `S3_*` lengkap, file diupload ke RustFS
- jika env `S3_*` tidak lengkap, file disimpan ke folder lokal `uploads`

File yang diupload dicatat ke tabel `files` dan dapat digunakan sebagai URL pada banner, guru, jurusan, galeri, lampiran pengumuman, atau unduhan.

Panduan setup lengkap ada di:

```txt
RUSTFS_SETUP.md
```

## Docker

Jalankan dengan Docker Compose:

```bash
docker compose up --build
```

Aplikasi tersedia di:

```txt
http://localhost:2005
```

Volume lokal:

```txt
./data    -> SQLite
./uploads -> file upload
```

## GHCR

Workflow GitHub Actions manual tersedia di:

```txt
.github/workflows/publish-ghcr.yml
```

Workflow ini mem-publish image ke GHCR dengan tag:

```txt
ghcr.io/ferilee/smakenpasofficial:latest
```

Ada juga tag tambahan berbasis SHA commit untuk traceability.

Contoh Docker Compose yang memakai image GHCR ada di:

```txt
docker-compose.ghcr.yml
```

Compose ini disiapkan untuk deployment seperti Arcane:

- image: `ghcr.io/ferilee/smakenpasofficial:latest`
- container: `smakenpasofficial`
- port: `2005`
- network eksternal: `ferileenet`
- volume: `sqlite_data` untuk SQLite
- RustFS dapat dipasang lewat env `S3_*`

Jalankan:

```bash
docker compose -f docker-compose.ghcr.yml up -d
```

## Konfigurasi Environment

```txt
PORT=2005
DATABASE_URL=./data/app.db
UPLOAD_DIR=./uploads
TOKEN_SECRET=ganti-secret-produksi
```

Untuk produksi dengan RustFS:

```txt
PORT=2005
DATABASE_URL=/app/data/app.db
TOKEN_SECRET=ganti-secret-produksi
S3_ENDPOINT=http://global-storage:9000
S3_PUBLIC_BASE_URL=https://s3.domain-anda.tld
S3_ACCESS_KEY=isi_dengan_RUSTFS_ACCESS_KEY
S3_SECRET_KEY=isi_dengan_RUSTFS_SECRET_KEY
S3_BUCKET=smakenpasofficial-assets
S3_REGION=us-east-1
S3_FORCE_PATH_STYLE=true
```

Untuk `docker-compose.ghcr.yml`, simpan secret di file `.env`:

```txt
TOKEN_SECRET=ganti-secret-produksi-yang-kuat
S3_ACCESS_KEY=isi_dengan_RUSTFS_ACCESS_KEY
S3_SECRET_KEY=isi_dengan_RUSTFS_SECRET_KEY
```

## Catatan Produksi

- Ganti password admin bawaan.
- Set `TOKEN_SECRET` yang kuat.
- Backup volume SQLite dan object storage RustFS.
- Pasang reverse proxy HTTPS.
- Pastikan URL WordPress dan PPDB sudah benar di menu Pengaturan Website.
- Jika memakai endpoint internal RustFS, set `S3_PUBLIC_BASE_URL` ke domain publik file.
