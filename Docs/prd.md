# Product Requirement Document (PRD) — VolumeMate
**Smart Procurement System untuk Koperasi Pupuk & Toko Gerai**

---

## 1. Executive Summary & Background
**VolumeMate** adalah platform manajemen pengadaan pupuk berbasis *volume intelligence* yang dikembangkan oleh Team Computer Sigma untuk Koperasi Sumber Makmur dalam ajang TechnoScape 2026. 

Di Indonesia, koperasi pertanian skala desa sering kali melakukan pengadaan pupuk secara mandiri tanpa mengetahui struktur harga supplier secara lengkap. Hal ini menyebabkan dua kendala utama:
1. **Informasi Asimetris**: Supplier menawarkan harga lebih murah untuk volume pembelian yang lebih besar (*volume-based pricing tier*), namun pengurus koperasi tidak memiliki visibilitas atas batas-batas tier tersebut dan akhirnya membeli di harga tertinggi.
2. **Ketiadaan Data Historis**: Pencatatan transaksi yang manual menyulitkan pengurus koperasi memproyeksikan kebutuhan di musim tanam berikutnya secara akurat.

VolumeMate hadir sebagai solusi cerdas berbasis Web/PWA untuk mengoptimalkan pengadaan pupuk melalui digitalisasi pencatatan, pemanfaatan Machine Learning (AI), dan model pengadaan kolektif (*collective buying*).

---

## 2. Tujuan Produk & Metrik Keberhasilan

### 2.1. Tujuan Utama
* Mengurangi biaya pengadaan pupuk bagi koperasi dengan memanfaatkan dinamika *volume pricing*.
* Meningkatkan kecepatan dan akurasi pengambilan keputusan pengadaan dari hari ke jam/menit.
* Memfasilitasi kolaborasi antar-koperasi desa untuk daya tawar harga yang lebih tinggi.

### 2.2. Target Output (6 Bulan Pertama)
| Indikator | Kondisi Awal (Sebelum) | Target Sukses |
|-----------|------------------------|---------------|
| **Penghematan Biaya Pengadaan** | 0% | 10% - 15% per siklus pengadaan |
| **Akurasi Forecast VolumeMind** | Tidak ada (manual) | $\ge$ 80% |
| **Adopsi Koperasi** | 1 (Sumber Makmur) | 3 - 5 koperasi desa aktif |
| **Kecepatan Pengambilan Keputusan** | 1 - 3 hari | < 1 jam |
| **Integritas & Kelengkapan Dokumentasi** | Tidak terstruktur | 100% transaksi tercatat & ter-audit |

---

## 3. Profil Pengguna (User Persona)

1. **Pengurus / Manajer Pengadaan Koperasi (Koperasi Admin)**
   * *Peran*: Melakukan pengadaan pupuk bulanan/musiman, menginput stok pupuk, melihat perkiraan kebutuhan anggota, berkolaborasi dengan koperasi tetangga.
   * *Kebutuhan*: Antarmuka yang mudah dipahami di HP, rekomendasi pembelian instan, laporan pengadaan otomatis yang tidak bisa dimanipulasi untuk laporan pertanggungjawaban.
2. **Anggota Koperasi (Petani / Toko Gerai)**
   * *Peran*: Melakukan pesanan pupuk eceran ke koperasi.
   * *Kebutuhan*: Kepastian stok pupuk saat musim tanam dan harga pupuk yang terjangkau.
* **Catatan Aktor Eksternal (Supplier / Distributor)**: Supplier bertindak sebagai entitas pasif dalam sistem. Data supplier dan struktur tier harga tidak dikelola secara langsung oleh supplier melalui sistem (tidak ada akses login untuk supplier), melainkan diinput secara manual oleh **Koperasi Admin** berdasarkan hasil negosiasi offline/langsung.

---

## 4. Persyaratan Fitur (Feature Requirements)

### 4.1. Core Module: Volume Price Tracker
Visualisasi interaktif struktur harga supplier untuk membantu pengurus koperasi melihat posisi transaksi saat ini.
* **F-01: Supplier Directory & Price Tiers**: Pencatatan profil supplier beserta tabel tier harga pupuk (misal: 1-5 ton = Rp 10.000/kg, 6-10 ton = Rp 9.000/kg, >10 ton = Rp 8.000/kg).
* **F-02: Tracker Dashboard**: Visualisasi (menggunakan diagram/bar progress) seberapa dekat volume order saat ini menuju tier harga lebih murah berikutnya.
* **F-03: Real-time Price Estimation**: Kalkulator dinamis yang menghitung estimasi total biaya berdasarkan kuantitas yang dipilih.

### 4.2. AI Module: VolumeMind AI Engine
Microservice berbasis AI untuk memandu keputusan pengadaan secara cerdas.
* **F-04: Demand Forecasting**: Prediksi kebutuhan pupuk koperasi untuk periode/musim tanam berikutnya berdasarkan tren histori pembelian dan siklus tanam.
* **F-05: Optimal Buy Recommendation**: Algoritma yang merumuskan kombinasi pembelian terbaik:
  * Kapan waktu terbaik untuk membeli?
  * Berapa volume (ton) yang harus dibeli?
  * Dari supplier mana untuk meminimalkan total biaya berdasarkan tier harga?

### 4.3. Collaboration Module: Collective Buying Power
Fitur agregasi kebutuhan antar-koperasi untuk meningkatkan daya tawar (*network effect*).
* **F-06: Shared Purchase Pools**: Kemampuan membuat atau bergabung ke dalam kelompok pembelian bersama (Cooperative Pool) untuk suatu jenis pupuk.
* **F-07: Collective Volume Aggregator**: Sistem secara otomatis menjumlahkan kuantitas dari beberapa koperasi dalam satu pool untuk menembus tier harga supplier yang lebih rendah.
* **F-08: Split Billing & Distribution Guidance**: Rekomendasi pembagian biaya secara proporsional berdasarkan kontribusi volume masing-masing koperasi.
* **F-08a: Unfulfilled Pool Handling (Negative Flow)**: Mekanisme otomatis jika target volume pool tidak terpenuhi pada deadline. Sistem menyediakan opsi bagi partisipan untuk memperpanjang batas waktu (Extend), melakukan penyesuaian harga ke tier volume terdekat yang berhasil dicapai (Adjust to Nearest Tier), atau melakukan pembatalan otomatis tanpa denda (Auto-Cancel).

### 4.4. Security & Compliance: Supplier Audit Log
Menjaga integritas data transaksi dan transparansi pengurus terhadap anggota koperasi.
* **F-09: Immutable Transaction Ledger**: Log transaksi pengadaan bersifat *append-only* (tidak bisa diubah atau dihapus melalui UI/API standar setelah dikonfirmasi).
* **F-10: Audit Export**: Fitur ekspor laporan transaksi dalam format PDF atau Excel yang siap digunakan untuk rapat anggota tahunan (RAT).

### 4.5. Offline-Tolerant & PWA (Kondisi Lapangan)
Optimasi antarmuka untuk konektivitas pedesaan yang terbatas.
* **F-11: Progressive Web App (PWA)**: Dapat di-install di Android/iOS tanpa melalui Play Store/App Store.
* **F-12: Offline Caching**: Menyimpan data harga supplier dan histori transaksi lokal secara aman di browser sehingga tetap dapat diakses saat sinyal mati/putus.
* **F-13: Network Optimization**: Payload data yang kecil untuk menunjang kelancaran akses pada jaringan 3G.

---

## 5. Model Bisnis (Freemium & Transaction Fee)

VolumeMate menggunakan model bisnis **Freemium** untuk mempercepat adopsi platform oleh koperasi desa dengan rincian pendapatan sebagai berikut:

1. **Transaction Fee (Komisi Transaksi Borongan)**:
   * **Deskripsi**: Fitur *Collective Buying* (patungan belanja) gratis digunakan untuk koordinasi. Namun, saat transaksi patungan berhasil dieksekusi, platform mengenakan biaya administrasi/komisi transaksi yang terjangkau (misal: 0.5% - 1% dari total nilai transaksi) sebagai kontribusi biaya operasional server. Tarif dijaga tetap rendah untuk menghindari transaksi di luar aplikasi (platform leakage).
   
2. **Subscription Fee (Langganan AI VolumeMind)**:
   * **Deskripsi**: Fitur *VolumeMind AI Engine* (prediksi kebutuhan pupuk & rekomendasi belanja optimal) ditawarkan sebagai layanan tambahan berbayar (SaaS Add-on).
   * **Tarif**: Rp 150.000 / bulan per koperasi. Tarif ini dirancang agar terjangkau bagi koperasi menengah-ke-atas namun mampu menutup biaya komputasi server AI.


---

## 6. Persyaratan Non-Fungsional (Non-Functional Requirements)

* **Skalabilitas**: Backend NestJS harus stateless untuk memudahkan scaling secara horizontal jika jumlah koperasi bertambah.
* **Keamanan**: Implementasi sistem autentikasi aman untuk memastikan data transaksi dan akses dashboard terlindungi dengan baik.
* **Aksesibilitas**: Antarmuka berorientasi mobile-first untuk kenyamanan penggunaan lewat ponsel pintar di lapangan.
* **Ketersediaan**: Target uptime database dan API sebesar 99.9% menggunakan deployment cloud di Railway.

---

## 7. Arsitektur Teknis
Sistem dikembangkan dengan arsitektur terdistribusi ringan:
* **Frontend**: React.js (single page app) dideploy ke Vercel.
* **Backend API**: NestJS (Node.js framework) dideploy ke Railway.
* **AI Engine**: Python microservice dideploy ke Railway untuk menjalankan model *scikit-learn*.
* **Database**: PostgreSQL di Railway.
