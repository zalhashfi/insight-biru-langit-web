# Insight-Web & IoT Project Rules and Agreements

## Hardware Modification Rules (Firmware)
- **NO DELETIONS FOR TESTING**: Saat melakukan modifikasi kode C++ (Arduino/ESP32) untuk keperluan simulasi/testing, JANGAN HAPUS 1 pun kode asli yang berkaitan dengan pembacaan sensor secara fisik.
- Cukup bungkus kode-kode tersebut dalam blok komentar (`/* ... */`).
- Tujuan: Memastikan transisi dari fase testing ke fase *production* dapat dilakukan dengan sangat mudah hanya dengan menghapus komentar tersebut (tanpa perlu mengingat ulang fungsi fisik lama).
- **Variabel Global di `.ino`**: Letakkan variabel konfigurasi seperti `device_id` dan `api_key` pada berkas `.ino` utama agar mudah disesuaikan pengguna.

## System Architecture Knowledge
- **Cloudflare Routing**: `insight.biru-langit.com` mengarah ke Frontend (Cloudflare Pages). Request ke `/api/*` harus ditangani oleh Cloudflare Workers (Backend Hono).

*Memory Date: 2026-07-25*
