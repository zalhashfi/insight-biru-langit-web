# 🔬 Insight Website - IoT Research Lab

Insight Website adalah sebuah platform IoT (*Internet of Things*) terintegrasi yang dirancang khusus untuk membantu dan mempermudah pekerjaan riset di laboratorium dalam bidang IoT. Sistem ini berfungsi untuk menerima, menyimpan, menganalisis, dan memvisualisasikan data telemetri dari berbagai perangkat atau stasiun sensor secara *real-time*.

## 🌟 Key Features

- **Real-Time Data Ingestion:** Menerima aliran data dari node sensor melalui protokol HTTP/API dengan latensi sangat rendah via jaringan Edge.
- **Data Analytics & Insights:** Mengolah data mentah menjadi metrik yang berguna bagi peneliti laboratorium.
- **Centralized Dashboard:** Menyediakan antarmuka visual yang intuitif untuk memantau status stasiun, metrik kualitas udara, dan logs.
- **Robust Edge API:** *Backend* super cepat dan efisien berjalan secara global menggunakan Cloudflare Workers.

---

## 🛠️ Tech Stack

- **Architecture**: Monorepo (Frontend & Backend terpusat di satu _repository_)
- **Language**: TypeScript/JavaScript
- **Backend Framework**: [Hono](https://hono.dev) (Edge-optimized API framework)
- **Backend Runtime**: [Cloudflare Workers](https://workers.cloudflare.com/)
- **Database**: MySQL (Hosted via Hostinger)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Frontend**: *Segera Hadir (TBD: Next.js / Vite)*
- **Testing**: Vitest

---

## 📋 Prerequisites

Sebelum memulai pengembangan lokal, pastikan Anda telah memasang:

- **Node.js** (versi 18 atau lebih baru)
- **npm** (atau `pnpm` / `yarn`)
- Akun **Cloudflare** (dengan Wrangler CLI diotorisasi: `npx wrangler login`)
- Sebuah Database MySQL (Bisa menggunakan server lokal atau layanan _cloud_ seperti Hostinger)

---

## 🚀 Getting Started

Panduan lengkap untuk menjalankan proyek ini di komputer lokal Anda.

### 1. Clone the Repository

```bash
git clone https://github.com/zalhashfi/insight-biru-langit-web.git
cd insight-biru-langit-web
```

### 2. Setup Backend API

Pindah ke *folder backend*:
```bash
cd backend
```

Instal dependensi:
```bash
npm install
```

### 3. Konfigurasi Environment Variables

Salin file contoh _environment_ menjadi file lokal Anda:
```bash
cp .dev.vars.example .dev.vars
```

Edit file `.dev.vars` dan isi _variable_ berikut:

| Variable       | Description                                  | Example Value                         |
| -------------- | -------------------------------------------- | ------------------------------------- |
| `DATABASE_URL` | URL koneksi ke database MySQL lokal/produksi | `mysql://user:pass@127.0.0.1:3306/db` |
| `JWT_SECRET`   | Kunci enkripsi untuk otentikasi *token* JWT    | *(Generate string acak rahasia)*      |

### 4. Mulai Development Server (Backend)

Jalankan Wrangler (Cloudflare Workers emulator) untuk simulasi lokal:
```bash
npm run dev
```

Server API lokal sekarang berjalan (biasanya di `http://localhost:8787`).

---

## 🏗️ Architecture

Proyek ini menggunakan struktur **Monorepo**. Meskipun kode sumber berada di _repository_ yang sama, _deploy_ dan fungsionalitasnya dipisah secara logis agar _decoupled_.

### Directory Structure

```text
insight-biru-langit-web/
├── backend/               # Hono API Server (Cloudflare Workers)
│   ├── src/               # Kode utama backend (Routes, Controllers, Middleware)
│   ├── drizzle/           # Skema & Migrasi Database
│   ├── tests/             # File pengujian (Vitest)
│   ├── .dev.vars          # Rahasia lokal (TIDAK BOLEH DI-COMMIT)
│   ├── wrangler.jsonc     # Konfigurasi Cloudflare Workers
│   └── package.json       # Dependensi backend
├── frontend/              # (TBA) UI Dashboard untuk manajemen dan analitik
└── docs/                  # Dokumentasi internal dan keputusan arsitektur (Diabaikan oleh Git)
```

### Data Flow / Request Lifecycle

1. Sensor IoT mengirim HTTP `POST` Payload ke `/api/telemetry` di domain publik.
2. Permintaan mencapai **Cloudflare Workers** Edge terdekat.
3. **Hono Router** memvalidasi dan memproses muatan (*payload*).
4. Otentikasi divalidasi via **JWT** (jika merupakan _endpoint private_).
5. Data dimasukkan atau diambil dari MySQL via **Drizzle ORM**.
6. Respons JSON dikembalikan ke perangkat klien (Sensor / Dashboard).

---

## 🔐 Environment Variables (Cloudflare Secrets)

Untuk tahap produksi (*Production*), variabel sensitif TIDAK ditaruh di `.env` atau *dashboard*, melainkan disuntikkan secara aman via terminal menggunakan Wrangler:

### Required Secrets untuk Produksi

| Variable       | Cara Mengatur ke Cloudflare                   |
| -------------- | --------------------------------------------- |
| `DATABASE_URL` | `npx wrangler secret put DATABASE_URL`        |
| `JWT_SECRET`   | `npx wrangler secret put JWT_SECRET`          |

---

## 📜 Available Scripts (Backend)

Berada di dalam direktori `backend/`, Anda dapat menjalankan:

| Command              | Description                                                          |
| -------------------- | -------------------------------------------------------------------- |
| `npm run dev`        | Menjalankan *development server* menggunakan Wrangler (Emulator Edge)|
| `npm run deploy`     | Mem-build, merampingkan (*minify*), dan melempar API ke Cloudflare   |
| `npm run cf-typegen` | Mem-generate tipe TypeScript yang otomatis menyesuaikan Cloudflare   |

---

## 🧪 Testing

Sistem pengujian (*testing*) berjalan menggunakan **Vitest** yang dioptimalkan untuk mengeksekusi kode secara instan.

```bash
# Di dalam folder backend/
npm run test
```

---

## 🚀 Deployment

### Cloudflare Workers (Backend)

API backend di-deploy langsung ke infrastruktur global Cloudflare Workers.

```bash
cd backend
npm install
npm run deploy
```
*Pastikan Anda telah mengisi Cloudflare Secrets (`DATABASE_URL`, `JWT_SECRET`) sebelum memicu _deployment_.*

### Cloudflare Pages (Frontend) - Segera Datang

Karena adanya batasan pengelolaan DNS via Hostinger, *frontend* akan diluncurkan (*deploy*) menggunakan Cloudflare Pages. Cloudflare Pages akan bertindak sebagai pengantar halaman statis (UI) dan menggunakan konfigurasi *Reverse Proxy* (`_redirects`) untuk merutekan seluruh *request* `/api/*` langsung ke URL `.workers.dev` secara transparan.

---

## 🚨 Troubleshooting

### Masalah `wrangler` Tidak Dikenali
**Error:** `'wrangler' is not recognized as an internal or external command`
**Solusi:** Pastikan Anda telah menjalankan `npm install` di dalam direktori `backend/` sebelum menggunakan perintah apa pun.

### Gagal Deploy: "Could not find zone for api.domain.com"
**Error:** `X [ERROR] Could not find zone for api... Make sure the domain is set up to be proxied by Cloudflare.`
**Solusi:** Fitur Cloudflare *Custom Domains* di Workers mewajibkan *Nameservers* domain Anda berada di Cloudflare. Jika domain Anda menetap di Hostinger, hapus *binding router* di file `wrangler.jsonc` lalu jalankan kembali `npm run deploy` untuk mendapatkan URL publik `.workers.dev` secara gratis.

---
*Dikembangkan dengan ❤️ untuk kemajuan riset IoT.*
