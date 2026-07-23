# ☁️ Biru Langit - IoT Air Quality Monitoring System

![Banner](https://via.placeholder.com/1200x300.png?text=Biru+Langit+IoT+System)

Biru Langit adalah sebuah platform IoT terintegrasi untuk pemantauan kualitas udara. Sistem ini dirancang untuk menerima data telemetri dari stasiun sensor secara real-time, menyimpannya untuk keperluan analitik, serta mengatur log _maintenance_ (perawatan) dan pembaruan _firmware_ (OTA) dari setiap stasiun sensor.

## 🏗️ Struktur Repositori (Monorepo)

Repositori ini menggunakan struktur **Monorepo**, di mana *backend* dan *frontend* berada dalam satu repositori yang sama untuk mempermudah manajemen versi dan sinkronisasi pengembangan.

```text
biru-langit/
├── backend/       # API Server berbasis Cloudflare Workers (Hono + Drizzle ORM)
├── frontend/      # (Segera Hadir) UI Dashboard untuk manajemen dan analitik
└── docs/          # Dokumentasi internal dan catatan arsitektur (Diabaikan oleh Git)
```

## 🚀 Alur Pengembangan (Branching Strategy)

Meskipun berada dalam satu repositori, proses pengembangan (*development*) dilakukan secara terpisah agar lebih rapi:

- **`main`**: Branch utama yang selalu stabil (Production-ready). Menggabungkan kedua *backend* dan *frontend*.
- **`backend`**: Branch khusus untuk pengembangan API, skema database, dan logika sistem IoT.
- **`frontend`**: Branch khusus untuk pengembangan antarmuka (UI/UX) web dashboard.

Setiap fitur baru dikembangkan di branch masing-masing, kemudian di-gabungkan (*Merge/Pull Request*) ke branch `main`.

## ⚙️ Teknologi yang Digunakan

### Backend
- **Framework:** Hono (Edge-optimized API framework)
- **Runtime:** Cloudflare Workers
- **Database:** MySQL (Hosted via Hostinger)
- **ORM:** Drizzle ORM
- **Testing:** Vitest

### Frontend
- *(Teknologi akan ditentukan)*

## 🛠️ Cara Menjalankan Secara Lokal

### Backend
1. Masuk ke direktori backend: `cd backend`
2. Siapkan _Environment Variables_ dengan menyalin template:
   ```bash
   cp .dev.vars.example .dev.vars
   ```
3. Sesuaikan `DATABASE_URL` dan `JWT_SECRET` di dalam `.dev.vars`.
4. Jalankan server lokal (Wrangler):
   ```bash
   npm run dev
   ```

## 🔒 Keamanan

Harap pastikan Anda **TIDAK PERNAH** melakukan _commit_ pada file sensitif seperti `.dev.vars` atau membagikan kredensial database publik ke dalam repositori ini. Repositori ini telah dikonfigurasi dengan aturan `.gitignore` ketat untuk meminimalisir risiko kebocoran data.

---
_Dikembangkan dengan ❤️ untuk langit yang lebih biru._
