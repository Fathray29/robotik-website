# 🤖 Motechart Robotik - Portal Ekstrakurikuler Resmi

Portal web interaktif resmi Ekstrakurikuler **Motechart Robotik**. Dirancang dengan estetika futuristik bertema *high-tech deep blue & neon cyan*, lengkap dengan sistem pendaftaran terenkripsi multi-tahap, galeri portofolio karya siswa, blog tutorial robotika, dan Admin CMS Dashboard terintegrasi Cloud Firebase Firestore.

---

## 🚀 Fitur Utama

- **Desain Premium & Responsive**: Tampilan modern menggunakan efek *glassmorphism*, animasi sirkuit SVG interaktif, dan navigasi ramah seluler.
- **Pendaftaran Calon Anggota**: Formulir pendaftaran multi-tahap (*multi-step form*) dilengkapi validasi data real-time, pembatasan pengiriman spam (*rate limit*), dan pembuatan kartu anggota digital unik.
- **Status Checker Mandiri**: Calon anggota dapat mencari status pendaftaran mereka secara langsung menggunakan ID unik (`ROBO-XXXXXX`).
- **Admin CMS Dashboard**: Halaman admin terproteksi sistem login aman untuk:
  - Mengubah teks landing page & divisi keahlian.
  - Menyetujui (*Approve*) atau menolak (*Reject*) pendaftar secara langsung.
  - Menambahkan pertanyaan formulir kustom secara dinamis.
  - Mengelola data blog & portofolio karya.
- **Real-Time Database Sync**: Integrasi Cloud Firestore untuk sinkronisasi instan data pendaftaran, berita, dan pengaturan sistem.
- **Telemetri & Status Hub**: Pemantauan uptime server, kecepatan koneksi database, dan total statistik pengunjung portal.

---

## 🛠️ Tech Stack

- **Core**: Vanilla HTML5 & Javascript (ES Modules)
- **Styling**: Vanilla CSS3 (Custom properties, *glassmorphic grids*, micro-interactions)
- **Build System**: Vite (Minified, optimized assets & production configurations)
- **Database / Backend**: Google Firebase Suite (Firestore Database & Authentication SDK)
- **Deployment**: GitHub Pages (Otomatisasi build via GitHub Actions)

---

## 📂 Struktur Proyek

```bash
├── .github/workflows/   # Pipeline CD deployment otomatis ke GitHub Pages
├── admin.html           # Portal masuk & panel kontrol admin
├── admin.js             # Logika dashboard CMS & manajemen pendaftar
├── admin.css            # Desain antarmuka panel admin
├── app.js               # Logika halaman publik (Router, pendaftaran, blog, dll.)
├── shared.js            # Central data store, helper enkripsi lokal, & Firebase config
├── index.html           # Halaman utama publik
├── index.css            # Core design system & CSS global
├── privacy.html         # Halaman kebijakan privasi (SEO compliant)
├── firestore.rules      # Aturan keamanan database Firestore
├── vite.config.js       # Konfigurasi optimasi aset & bundling Vite
└── package.json         # Konfigurasi depedensi npm & skrip build
```

---

## 💻 Panduan Pengembangan Lokal

### Prasyarat
Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/) di komputer Anda.

### 1. Instalasi Dependensi
Jalankan perintah berikut di terminal direktori proyek untuk menginstal Vite dan dependensi lainnya:
```bash
npm install
```

### 2. Jalankan Mode Pengembangan (Development)
Untuk menjalankan server lokal dengan fitur *Hot Module Replacement* (HMR):
```bash
npm run dev
```
Buka browser Anda dan akses tautan lokal yang tertera (biasanya `http://localhost:5173`).

### 3. Build untuk Produksi
Untuk melakukan kompilasi, minifikasi CSS/JS, dan pengemasan aset siap rilis ke folder `/dist`:
```bash
npm run build
```

### 4. Uji Coba Preview Produksi
Gunakan perintah ini untuk mensimulasikan web hasil build produksi secara lokal:
```bash
npm run preview
```
Buka tautan lokal yang ditunjukkan (biasanya `http://localhost:4173`).

---

## 🔒 Konfigurasi Aturan Firebase (Firestore Rules)
Sebelum mempublikasikan aplikasi ini, pastikan aturan keamanan Firebase Anda sudah diunggah sesuai isi file `firestore.rules` untuk melindungi privasi data pendaftar dari query tidak sah.

---

## 🤝 Kontribusi & Hak Cipta
Dibuat dengan 💛, 💙, dan 🤍 oleh **Tim Pengurus Motechart Robotik**. Seluruh Hak Cipta Dilindungi.
