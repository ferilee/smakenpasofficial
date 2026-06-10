# Integrasi RustFS di Arcane

Panduan ini menjelaskan cara menghubungkan aplikasi `websmakenpas` ke RustFS sebagai object storage S3-compatible pada environment Arcane.

## Arsitektur yang Dipakai

Jika aplikasi dan RustFS sama-sama berada di network Docker `ferileenet`, gunakan:

- endpoint internal untuk upload dari backend aplikasi
- base URL publik untuk file yang diakses browser

Contoh:

```txt
Backend aplikasi -> http://global-storage:9000
Browser publik    -> https://s3.gemastika.or.id
```

Tanpa base URL publik, upload bisa berhasil tetapi URL file yang tampil di website akan mengarah ke host internal Docker dan tidak bisa dibuka oleh pengunjung.

## 1. Pastikan RustFS Aktif

Contoh service RustFS Anda:

```yaml
services:
  rustfs:
    image: rustfs/rustfs:latest
    container_name: global-storage
    environment:
      RUSTFS_ACCESS_KEY: ${RUSTFS_ACCESS_KEY}
      RUSTFS_SECRET_KEY: ${RUSTFS_SECRET_KEY}
      RUSTFS_CONSOLE_ENABLE: ${RUSTFS_CONSOLE_ENABLE:-true}
    volumes:
      - rustfs_data:/data
    networks:
      - ferileenet
    command: /data
    restart: always

networks:
  ferileenet:
    external: true

volumes:
  rustfs_data:
```

Jalankan:

```bash
docker compose up -d
```

## 2. Buat Bucket di RustFS

Login ke RustFS Console, lalu buat bucket khusus aplikasi ini.

Contoh nama bucket:

```txt
smakenpasofficial-assets
```

Gunakan nama bucket:

- huruf kecil
- tanpa spasi
- konsisten antar environment

Jika file ingin diakses langsung dari frontend, bucket atau object harus dapat diakses publik sesuai kebijakan deployment RustFS Anda.

## 3. Konfigurasi Environment Aplikasi

Tambahkan environment berikut ke container aplikasi:

```env
PORT=2005
DATABASE_URL=/app/data/app.db
TOKEN_SECRET=ganti-secret-produksi-yang-kuat

S3_ENDPOINT=http://global-storage:9000
S3_PUBLIC_BASE_URL=https://s3.gemastika.or.id
S3_ACCESS_KEY=isi_dengan_RUSTFS_ACCESS_KEY
S3_SECRET_KEY=isi_dengan_RUSTFS_SECRET_KEY
S3_BUCKET=smakenpasofficial-assets
S3_REGION=us-east-1
S3_FORCE_PATH_STYLE=true
```

Keterangan:

- `S3_ENDPOINT`: dipakai backend untuk upload ke RustFS dari dalam network Docker
- `S3_PUBLIC_BASE_URL`: dipakai aplikasi untuk membentuk URL file yang dibuka browser
- `S3_FORCE_PATH_STYLE=true`: wajib untuk RustFS/S3-compatible storage
- `S3_SECRET_KEY`: hanya boleh ada di backend/server, jangan pernah dikirim ke frontend

## 4. Contoh Docker Compose Aplikasi di Arcane

Gunakan pola seperti ini:

```yaml
services:
  app:
    image: ghcr.io/ferilee/smakenpasofficial:latest
    container_name: smakenpasofficial
    ports:
      - "2005:2005"
    env_file:
      - .env
    environment:
      NODE_ENV: production
      PORT: 2005
      DATABASE_URL: /app/data/app.db

      S3_ENDPOINT: http://global-storage:9000
      S3_PUBLIC_BASE_URL: https://s3.gemastika.or.id
      S3_BUCKET: smakenpasofficial-assets
      S3_REGION: us-east-1
      S3_FORCE_PATH_STYLE: "true"
    volumes:
      - sqlite_data:/app/data
    networks:
      - ferileenet
    restart: always

volumes:
  sqlite_data:

networks:
  ferileenet:
    external: true
```

Catatan:

- `S3_ACCESS_KEY` dan `S3_SECRET_KEY` tetap simpan di file `.env`
- volume `upload_data` tidak wajib jika produksi sepenuhnya memakai RustFS

## 5. Cara Kerja di Aplikasi

Endpoint upload aplikasi:

```txt
POST /api/upload
```

Perilakunya sekarang:

- jika env `S3_*` lengkap, file diupload ke RustFS
- jika env `S3_*` tidak lengkap, aplikasi fallback ke storage lokal `uploads`

URL file yang disimpan ke database:

- mode RustFS: `https://s3.domain-anda/nama-bucket/path/file.ext`
- mode lokal: `/uploads/nama-file.ext`

## 6. Verifikasi Integrasi

### Cek health aplikasi

```bash
curl http://localhost:2005/api/health
```

### Cek mode storage dari dashboard stats API

```bash
curl -b cookie.txt http://localhost:2005/api/stats
```

Respons sekarang mengandung:

```json
{
  "ok": true,
  "data": {
    "storageMode": "rustfs"
  }
}
```

### Uji upload

Login admin, buka menu `Upload File`, lalu upload satu file. Pastikan:

- data file masuk ke tabel `files`
- URL file mengarah ke `S3_PUBLIC_BASE_URL/S3_BUCKET/...`
- file bisa dibuka dari browser publik

## 7. Fallback Lokal untuk Development

Jika Anda sedang development lokal dan tidak ingin menjalankan RustFS, cukup kosongkan semua env `S3_*`.

Aplikasi akan otomatis kembali ke mode lokal:

```env
PORT=2005
DATABASE_URL=./data/app.db
UPLOAD_DIR=./uploads
TOKEN_SECRET=dev-secret
```

## 8. Checklist Produksi

- RustFS aktif dan berada di network `ferileenet`
- bucket sudah dibuat
- `S3_ENDPOINT` menunjuk endpoint internal Docker
- `S3_PUBLIC_BASE_URL` menunjuk domain publik file
- `S3_ACCESS_KEY` dan `S3_SECRET_KEY` valid
- `S3_FORCE_PATH_STYLE=true`
- aplikasi dan RustFS berada pada network yang sama
- upload file berhasil dan URL file bisa dibuka dari browser
