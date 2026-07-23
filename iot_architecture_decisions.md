# Catatan Arsitektur & Keputusan Desain IoT

Dokumen ini merangkum semua keputusan arsitektur, pola aliran data, dan desain ERD yang telah disepakati untuk sistem IoT (seperti AQMS dan SOC) beserta Platform Web pendukungnya.

## 1. Pemisahan Jalur Data (Hot Path vs Cold Path)

Untuk mengatasi intensitas data masuk yang sangat tinggi dari banyak alat (misal: 50 alat per *project* per menit), kita memutuskan untuk **tidak menggabungkan** raw data JSON ke dalam tabel operasional/analitik.

### a. Hot Path (Data Analitik & Dashboard)
- **Keputusan:** Dibuat tabel spesifik per *Project* / Tipe Alat (contoh: `data_aqms` dan `data_soc`).
- **Alasan:** Memudahkan pembuatan grafik (*dashboard*), pencarian agregasi (seperti *Average*, *Max*, *Min*), dan sangat ringan saat di-*index* oleh *database*.
- **Relasi:** Terhubung langsung dengan tabel `station` (alat) menggunakan Foreign Key `stationUuid`.

### b. Cold Path (Data Raw / Audit Log)
- **Keputusan:** Data mentah JSON disimpan di tabel terpisah yaitu `raw_sensor_log`.
- **Alasan:** Menjaga agar kita tetap memiliki data asli jika sewaktu-waktu algoritma *parsing* kita salah atau butuh *debug*.
- **Relasi (Penting):** **Tidak ada Foreign Key** yang mengarah ke tabel ini. Tabel ini dibiarkan lepas agar bisa dengan mudah dihapus (Truncate/Drop partisi) secara berkala (misal: data lebih dari 3 bulan dihapus) tanpa merusak integritas tabel analitik.

---

## 2. Proses Routing & Validasi (ETL)

- **Keputusan:** Proses pembedahan JSON (*parsing*), deteksi jenis alat (*routing*), dan validasi (*cleansing*) dilakukan murni di **level Backend (Aplikasi)**, BUKAN menggunakan fitur *Trigger/Stored Procedure* dari Database.

---

## 3. Sistem Over-The-Air (OTA) Updates

- **Keputusan:** Dibuat sistem *Firmware Release* yang berbasis `projectName`. Ratusan alat AQMS cukup mengecek tabel rilis ini untuk mengetahui apakah ada versi *file .bin* terbaru. Kolom `firmwareVersion` ditambahkan ke `raw_sensor_log` untuk visibilitas versi.

---

## 4. Platform Web & Manajemen Pengguna (Role Base)

Berdasarkan diskusi akses kontrol (*Access Control*):
- **Manajemen Role:** Menggunakan pendekatan statis bertipe `ENUM` (`admin`, `engineer`, `user`) langsung di tabel `users` karena role bersifat tetap.
- **Sistem Tiket Maintenance:** Status alat berkendala tidak hanya sekadar mengubah kolom status, melainkan dibuatkan sistem pelacakan tiket (`maintenance_tickets` dan `maintenance_log`) agar Engineer bisa melacak *issue*, mengambil tugas, dan mengisi catatan perbaikan.
- **Hak Akses User:** Pengguna dengan role `user` memiliki akses universal untuk melihat dashboard dari seluruh alat (tidak ada limitasi per-alat khusus).

---

## 5. Final DBML Schema (Lengkap dengan Web & User)

Di bawah ini adalah referensi lengkap skema database (DBML) yang menggabungkan IoT *telemetry* dan sistem pengguna web:

```dbml
// ==========================================
// A. USER MANAGEMENT & WEB PLATFORM
// ==========================================

Enum UserRole {
  admin
  engineer
  user
}

Table users {
  id int [increment, pk, not null]
  email varchar(255) [unique, not null]
  passwordHash varchar(255) [not null]
  fullName varchar(255) [not null]
  role UserRole [default: 'user', not null]
  createdAt timestamp [default: `now()`, not null]
  updatedAt timestamp [default: `now()`, not null]
  deletedAt timestamp [null]
}

Enum TicketStatus {
  open
  in_progress
  resolved
}

Table maintenance_tickets {
  id bigint [increment, pk, not null]
  stationUuid varchar(36) [not null]
  reportedByUserId int [not null]
  assignedToEngineerId int [null]
  issueTitle varchar(255) [not null]
  issueDescription text [not null]
  status TicketStatus [default: 'open', not null]
  createdAt timestamp [default: `now()`, not null]
  resolvedAt timestamp [null]
}

Table maintenance_log {
  id bigint [increment, pk, not null]
  ticketId bigint [not null]
  engineerId int [not null]
  actionTaken text [not null]
  createdAt timestamp [default: `now()`, not null]
}


// ==========================================
// B. IOT MASTER TABLES & OTA
// ==========================================

Table station {
  uuid varchar(36) [pk, not null]
  name varchar(100) [not null]
  projectName varchar(100) [not null]
  macAddress varchar(20) [null]
  currentVersion varchar(20) [null]
  lastSeenAt timestamp [null]
  createdAt timestamp [default: `now()`, not null]
  updatedAt timestamp [default: `now()`, not null]
  deletedAt timestamp [null]
}

Table firmware_release {
  id int [increment, pk, not null]
  projectName varchar(100) [not null]
  version varchar(20) [not null]
  binFileUrl varchar(255) [not null]
  releaseNotes text [null]
  isLatest boolean [default: false, not null]
  createdAt timestamp [default: `now()`, not null]
}


// ==========================================
// C. COLD PATH (Penyimpanan Raw & Log)
// ==========================================

Table raw_sensor_log {
  id bigint [increment, pk, not null]
  stationUuid varchar(36) [not null]
  firmwareVersion varchar(20) [null]
  dataPayload json [not null]
  receivedAt timestamp [default: `now()`, not null]
}


// ==========================================
// D. HOT PATH (Analitik Dashboard)
// ==========================================

Table data_aqms {
  id bigint [increment, pk, not null]
  stationUuid varchar(36) [not null]
  pm25 float [null]
  no2 float [null]
  co float [null]
  temp float [null]
  hum float [null]
  ws float [null]
  wd float [null]
  measuredAt timestamp [not null]
  createdAt timestamp [default: `now()`, not null]
}

Table data_soc {
  id bigint [increment, pk, not null]
  stationUuid varchar(36) [not null]
  ph float [null]
  no2 float [null]
  ec float [null]
  temp float [null]
  hum float [null]
  n float [null]
  p float [null]
  k float [null]
  measuredAt timestamp [not null]
  createdAt timestamp [default: `now()`, not null]
}


// ==========================================
// E. RELATIONSHIPS (FOREIGN KEYS)
// ==========================================

// Web & Users
Ref: "station"."uuid" < "maintenance_tickets"."stationUuid"
Ref: "users"."id" < "maintenance_tickets"."reportedByUserId"
Ref: "users"."id" < "maintenance_tickets"."assignedToEngineerId"
Ref: "maintenance_tickets"."id" < "maintenance_log"."ticketId"
Ref: "users"."id" < "maintenance_log"."engineerId"

// IoT Telemetry
Ref: "station"."uuid" < "data_aqms"."stationUuid"
Ref: "station"."uuid" < "data_soc"."stationUuid"
```
