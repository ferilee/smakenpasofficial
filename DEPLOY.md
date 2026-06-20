# Deploy Production

Panduan ini untuk update aplikasi di production tanpa membawa seed data dan tanpa menghapus data yang sudah ada di database.

## Prinsip

- Jalankan `migrate`, jangan jalankan `seed`.
- Backup database sebelum update.
- Restart service hanya setelah `bun install` dan `bun run db:migrate` selesai.

## Perintah Dasar

```bash
cd /path/ke/websmakenpas
git pull origin main
bun install
bun run db:migrate
bun run start
```

## Jika Menggunakan PM2

```bash
cd /path/ke/websmakenpas
git pull origin main
bun install
bun run db:migrate
pm2 restart websmakenpas
```

## Jika Menggunakan systemd

```bash
cd /path/ke/websmakenpas
git pull origin main
bun install
bun run db:migrate
sudo systemctl restart websmakenpas
```

## Backup Database SQLite

Jika `DATABASE_URL` mengarah ke file SQLite lokal, backup dulu sebelum deploy:

```bash
cp data/app.db data/app.db.bak-$(date +%F-%H%M%S)
```

## Alur Deploy Aman

```bash
cd /path/ke/websmakenpas
cp data/app.db data/app.db.bak-$(date +%F-%H%M%S)
git pull origin main
bun install
bun run db:migrate
pm2 restart websmakenpas
```

## Yang Tidak Boleh Dijalankan di Production

Jangan jalankan:

```bash
bun run db:seed
```

Alasannya:

- `db:migrate` hanya menyesuaikan struktur database.
- `db:seed` dipakai untuk bootstrap manual, bukan update production.

## Checklist Sebelum Deploy

- `DATABASE_URL` sudah mengarah ke database production yang benar.
- Backup database sudah dibuat.
- Environment variable production tidak berubah tanpa sengaja.
- Repo sudah berada di branch yang benar.

## Jika Migrasi Gagal

- Jangan jalankan `db:seed`.
- Jangan hapus database.
- Baca pesan error migrasi.
- Perbaiki migrasi atau rollback code jika perlu.
- Restore backup hanya jika benar-benar dibutuhkan.

## Catatan Repo Ini

Saat ini aplikasi:

- menjalankan `migrate()` saat start
- tidak menjalankan `seed()` otomatis saat start

Artinya, `bun run start` aman untuk production selama Anda tidak menjalankan `bun run db:seed`.
