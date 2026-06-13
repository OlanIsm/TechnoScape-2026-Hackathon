# VolumeMate

VolumeMate adalah platform sistem pengadaan pupuk cerdas (Smart Procurement System) untuk koperasi pertanian dan toko gerai pupuk desa. Aplikasi ini mengotomatisasi pencatatan inventaris manual, memproyeksikan kebutuhan stok di masa mendatang menggunakan kecerdasan buatan, serta menyediakan fitur patungan pengadaan untuk mengoptimalkan efisiensi pengadaan barang melalui diskon grosir berbasis volume.

---

## Cara Kerja Aplikasi

Aplikasi ini bekerja melalui empat komponen utama untuk menyederhanakan dan menghemat pengadaan pupuk:

### 1. Manajemen Mutasi Stok Real-Time
Pengurus koperasi mencatat riwayat masuk dan keluar secara digital:
- **Pemasukan**: Pengadaan pupuk dari supplier eksternal yang menambah jumlah stok fisik koperasi.
- **Pengeluaran/Penyaluran**: Pendistribusian pupuk kepada para petani anggota yang memotong persediaan stok fisik dan menghasilkan pendapatan tunai bagi koperasi.

### 2. Pelacakan Tingkat Harga Supplier (Volume Price Tracker)
Supplier pupuk memiliki tingkatan harga (price tiers) yang berbeda-beda tergantung jumlah pemesanan. VolumeMate melacak rentang pemesanan ini secara aktif dan memvisualisasikan posisi kuantitas pesanan saat ini terhadap batas kuantitas (threshold) berikutnya agar koperasi bisa mendapatkan harga beli per kg yang lebih murah.

### 3. Asisten Cerdas VolumeMind (AI Engine)
VolumeMind menggunakan algoritma machine learning (Random Forest) untuk memprediksi kebutuhan pupuk bulan berikutnya berdasarkan faktor historis:
- **Curah Hujan & Musim Tanam**: Menentukan kebutuhan penyerapan pupuk di lahan pertanian.
- **Prediksi Kebutuhan (Demand Forecasting)**: Menghasilkan estimasi volume kebutuhan pupuk dalam kilogram.
- **Rekomendasi Optimasi Pembelian (Volume Hack)**: Menghitung secara otomatis jika menambah sedikit volume pembelian di atas prediksi kebutuhan akan memicu tier harga supplier yang lebih murah, sehingga menghasilkan total pengeluaran belanja yang lebih hemat.

### 4. Pengadaan Kolektif (Collective Buying Pool)
Jika satu koperasi desa tidak memenuhi batas minimum pemesanan grosir untuk mendapatkan harga murah, mereka dapat bergabung ke dalam Collective Buying Pool bersama koperasi tetangga. Sistem secara dinamis menghitung total kuantitas pemesanan dari seluruh anggota yang bergabung, memperbarui harga beli untuk semua anggota di dalam pool ketika target tier tercapai, dan mereset status pool setelah selesai dikonfirmasi.

---

## Flowchart Sistem

Alur interaksi fungsional utama di dalam sistem VolumeMate dijelaskan pada diagram di bawah ini:

```mermaid
graph TD
    A["Pengurus Koperasi"] --> B["Pencatatan Transaksi Manual"]
    B -->|Pemasukan / Beli| C["Stok Masuk & Pengeluaran Kas"]
    B -->|Pengeluaran / Jual| D["Stok Keluar & Pendapatan Kas"]
    
    C & D --> E["Database PostgreSQL"]
    
    F["VolumeMind AI Engine"] -->|Mengambil Data Historis & Cuaca| G["Prediksi Demand & Volume Hack"]
    G -->|Tampilkan di Dashboard| A
    
    A --> H["Collective Buying Pool"]
    H -->|Gabung Anggota Lintas Koperasi| I["Akumulasi Volume Patungan"]
    I -->|Mencapai Threshold Supplier| J["Update Harga Murah untuk Semua Anggota"]
    J -->|Selesai Konfirmasi| K["Pemesanan Dikirim & Stok Masuk"]
```

---

## Tech Stack

| Komponen | Teknologi | Keterangan |
|---|---|---|
| **Frontend** | React Native Web (React, Vite, CSS) | Antarmuka web responsif dengan nuansa mobile native |
| **Backend** | NestJS (TypeScript, Prisma ORM) | RESTful API untuk melayani otentikasi, manajemen stok, dan pool |
| **AI Engine** | Python, FastAPI, Pandas, Joblib, Scikit-learn | Layanan mikro untuk perhitungan model regresi demand forecasting |
| **Database** | PostgreSQL | Penyimpanan data relasional terstruktur untuk transaksi dan inventaris |

---

## Panduan Menjalankan Aplikasi Secara Lokal

Ikuti langkah-langkah berikut untuk menginstal dan menjalankan semua layanan VolumeMate di mesin lokal Anda.

### Prasyarat
Sebelum memulai, pastikan perangkat Anda telah terinstal:
- Node.js (versi 18 ke atas)
- PostgreSQL
- Python (versi 3.9 ke atas)

---

### Langkah 1: Persiapan Database PostgreSQL
1. Buat database kosong baru di PostgreSQL Anda, misalnya bernama `volumemate`.
2. Pastikan Anda mencatat detail koneksi seperti host, port, username, password, dan nama database tersebut.

---

### Langkah 2: Konfigurasi dan Jalankan Backend
1. Masuk ke direktori backend:
   ```bash
   cd backend
   ```
2. Instal semua dependensi Node.js:
   ```bash
   npm install
   ```
3. Salin file lingkungan contoh dan buat konfigurasi baru:
   ```bash
   copy .env.example .env
   ```
4. Buka file `.env` yang baru dibuat di editor teks Anda, dan sesuaikan nilai variabel berikut dengan kredensial PostgreSQL Anda:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/volumemate"
   PORT=3000
   JWT_SECRET="rahasia_volumemate_super_aman_123"
   ```
5. Sinkronisasikan skema Prisma ke database PostgreSQL Anda:
   ```bash
   npx prisma db push
   ```
6. Jalankan script seeding untuk mengisi data awal (akun demo admin, supplier default, dan produk awal):
   ```bash
   npm run seed
   ```
7. Jalankan server backend dalam mode pengembangan:
   ```bash
   npm run start:dev
   ```
   Layanan backend akan berjalan di http://localhost:3000.

---

### Langkah 3: Konfigurasi dan Jalankan AI Engine (VolumeMind)
1. Buka terminal baru dan masuk ke direktori VolumeMind:
   ```bash
   cd VolumeMind
   ```
2. Instal modul Python yang diperlukan:
   ```bash
   pip install fastapi uvicorn pandas joblib scikit-learn
   ```
3. Jalankan server FastAPI menggunakan uvicorn:
   ```bash
   python -m uvicorn api:app --port 8000 --reload
   ```
   Layanan AI Engine akan aktif melayani permintaan prediksi di http://localhost:8000.

---

### Langkah 4: Konfigurasi dan Jalankan Frontend
1. Buka terminal baru dan masuk ke direktori frontend:
   ```bash
   cd frontend
   ```
2. Instal semua dependensi frontend:
   ```bash
   npm install
   ```
3. Jalankan server pengembangan frontend:
   ```bash
   npm run dev
   ```
   Aplikasi frontend web Anda kini siap diakses melalui tautan lokal yang tertera di terminal (biasanya http://localhost:5173).

---

### Akun Demo untuk Login
Gunakan kredensial berikut untuk masuk ke dashboard koperasi pengadaan:
- **Email**: `admin@koperasi.com`
- **Password**: `password123`
