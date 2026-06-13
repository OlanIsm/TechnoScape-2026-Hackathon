# 🌿 VolumeMate Pitch Deck
**Smart Procurement System untuk Koperasi Pupuk & Toko Gerai**
*Oleh: Team Computer Sigma — TechnoScape 2026 (BNCC x AD-INS)*

---

## 🗂️ Struktur Slide-by-Slide Pitch Deck

### 📺 Slide 1: Title & Hook
* **Visual**: Desain bersih bertema emerald green dengan mockup HP yang menampilkan dashboard VolumeMate. Font besar dan tebal.
* **Header**: **VolumeMate**
* **Subheader**: *Bukan sekadar digitalisasi — Lompatan dari pencatatan manual ke Intelligent Procurement.*
* **Poin Utama**:
  * Mengintegrasikan kecerdasan buatan (*Volume Intelligence*) dengan kekuatan pembelian kolektif (*Collective Buying*) untuk koperasi pertanian Indonesia.
  * Dipersembahkan oleh: Team Computer Sigma (Insan Maulana, Faiz Ari Fadhillah, Saladin Zhalifunnas Ahfar, Jad Abyanza Fauzan).

---

### 📺 Slide 2: The Core Problem (Kondisi Lapangan)
* **Visual**: Layout terpisah. Kiri: Foto pencatatan manual (buku kusut). Kanan: Tiga poin masalah utama di dalam kotak Slate gelap.
* **Header**: **Realitas Pahit Koperasi Desa: Mengapa Mereka Selalu Membayar Lebih Mahal?**
* **Poin Utama**:
  1. **Informasi Asimetris (Hidden Tier Pricing)**: Supplier pupuk memiliki struktur harga bertingkat (makin banyak beli, makin murah). Namun, pengurus koperasi tidak tahu struktur ini, sehingga selalu membeli di harga retail tertinggi.
  2. **Ketiadaan Data Historis**: Tanpa pencatatan digital, pengurus tidak bisa memprediksi pola tanam secara presisi. Pembelian sering kali terlambat (*stockout*) atau terlalu cepat (*overstock*).
  3. **Lemahnya Posisi Tawar (Single-Buyer Disadvantage)**: Koperasi desa membeli pupuk secara mandiri dalam volume kecil, kehilangan peluang diskon grosir besar.

---

### 📺 Slide 3: The Solution (VolumeMate)
* **Visual**: Diagram alur bersih yang menunjukkan Koperasi -> AI Engine -> Supplier. Menyoroti sifat mobile-first.
* **Header**: **VolumeMate: Smart Procurement System**
* **Subheader**: Platform *Mobile-Only PWA* untuk Modernisasi Pengadaan Pupuk Koperasi.
* **Fitur Utama**:
  * **Volume Price Tracker**: Transparansi penuh struktur harga supplier.
  * **VolumeMind AI Engine**: Rekomendasi volume & waktu beli optimal berbasis machine learning.
  * **Collective Buying Power**: Konsolidasi pesanan lintas koperasi desa untuk menembus tier diskon volume tertinggi.
  * **Immutable Audit Log**: Pencatatan transaksi aman yang tidak dapat dimanipulasi untuk laporan pertanggungjawaban instan.

---

### 📺 Slide 4: AI Engine Under The Hood: VolumeMind
* **Visual**: Diagram alur sederhana yang menunjukkan data cuaca, kalender tanam, dan riwayat transaksi dimasukkan ke RandomForest. Menampilkan nilai R2: **90% akurasi**.
* **Header**: **VolumeMind AI: Prediksi Akurat untuk Penghematan Maksimal**
* **Poin Utama**:
  * **Algoritma**: `RandomForestRegressor` (Ensemble Tree-Based).
  * **Mengapa RandomForest?**: Berbeda dengan ARIMA yang hanya membaca tren waktu, VolumeMind mengolah **fitur multi-variabel eksternal** (curah hujan BMKG, musim tanam, luas lahan, histori belanja).
  * **Desain Anti-Overfitting**: Membatasi kedalaman pohon (`max_depth=8`) sehingga tetap adaptif pada data baru tahun 2025 dengan akurasi **90%** (selisih performa uji & latih < 6%).
  * **Smart Handling**: Fitur `handle_unknown='ignore'` memastikan AI tidak error ketika mendeteksi koperasi atau produk pupuk baru di lapangan.

---

### 📺 Slide 5: The "Volume Hack" Feature (Diferensiasi Utama)
* **Visual**: Grafik atau ilustrasi perbandingan yang menarik.
  * Kasus A (Beli Normal): 9.500 kg
  * Kasus B (Volume Hack): 10.000 kg (Lebih murah!)
* **Header**: **Volume Hack: Membeli Lebih Banyak, Membayar Lebih Murah**
* **Studi Kasus AI Recommendation**:
  * **Kebutuhan Riil Lapangan**: **9.500 kg** Pupuk NPK.
  * **Harga Normal**: Rp9.200/kg $\rightarrow$ Total Biaya: **Rp87,4 Juta**.
  * **Rekomendasi VolumeMind AI**: Bulatkan pembelian ke **10.000 kg** karena supplier membuka tier diskon Rp8.500/kg pada volume tersebut.
  * **Hasil Akhir**: Total Biaya menjadi **Rp85,0 Juta**.
  * **Dampak Bisnis**: Koperasi menghemat **Rp2,4 Juta** sekaligus mendapatkan **500 kg pupuk ekstra secara cuma-cuma**.

---

### 📺 Slide 6: How It Works (Alur Operasional PWA)
* **Visual**: 4 langkah alur kronologis dengan ikon yang bersih.
* **Header**: **Sederhana, Aman, dan Terverifikasi**
* **Alur Kerja**:
  1. **Verifikasi KYC Admin**: Koperasi & Supplier mengunggah KTP + PDF Legalitas untuk mencegah akun fiktif.
  2. **Rekomendasi Dashboard**: Pengurus koperasi melihat prediksi kebutuhan pupuk bulanan dan supplier termurah di Dashboard.
  3. **Collective Pooling**: Koperasi membuat proposal pool pembelian bersama. Koperasi lain ikut bergabung hingga target dana terpenuhi sebelum deadline yang ditentukan supplier.
  4. **24-Hour Commitment Checkout**: Setelah target dana tercapai, peserta menyelesaikan pembayaran digital dalam 24 jam. Platform memotong komisi dan mengirim sisa dana ke supplier.

---

### 📺 Slide 7: Business Model & Monetization
* **Visual**: Tabel harga yang menonjolkan tier B2B SaaS dan info Transaction Fee.
* **Header**: **Model Bisnis Ganda yang Berkelanjutan**
* **1. Skema B2B SaaS Subscription (Bulanan)**:
  * **Starter (Rp150.000)**: Untuk koperasi kecil (< 50 anggota) $\rightarrow$ Price Tracker + Audit Log.
  * **Growth (Rp350.000)**: Untuk koperasi menengah (50-200 anggota) $\rightarrow$ Starter + VolumeMind AI.
  * **Network (Rp500.000)**: Fitur penuh $\rightarrow$ Growth + Collective Buying Power.
* **2. Transaction Fee**:
  * Platform mengambil potongan biaya transaksi (*platform fee*) dari total akumulasi dana setiap *collective buy pool* yang sukses sebelum diserahkan ke Supplier.

---

### 📺 Slide 8: Market Competition: Mengapa VolumeMate Unggul?
* **Visual**: Tabel perbandingan dengan centang hijau.
* **Header**: **Lanskap Kompetisi**

| Aspek | Aplikasi Koperasi Umum (Alokop/SiKop) | VolumeMate |
| :--- | :--- | :--- |
| **Fokus Operasional** | Administrasi umum & simpan pinjam | Optimasi rantai pasok & pengadaan pupuk |
| **Sifat Sistem** | **Reaktif** (Hanya mencatat transaksi yang sudah lewat) | **Proaktif** (Membantu merekomendasikan keputusan belanja) |
| **Teknologi AI/ML** | Tidak ada | **VolumeMind AI** (Forecasting & Volume Hack) |
| **Kolaborasi** | Mandiri (Satu koperasi saja) | **Collective Buying** lintas koperasi desa |
| **Format Platform** | Berorientasi Desktop | **Mobile-First PWA** (Ringan, hemat kuota, offline-tolerant) |

---

### 📺 Slide 9: 6-Month Pilot Plan & Traction Target
* **Visual**: Lini masa progres atau diagram milestone.
* **Header**: **Target Dampak dalam 6 Bulan Pertama**
* **Indikator Keberhasilan (KPI)**:
  * **Efisiensi Pengadaan**: Menghemat biaya belanja koperasi sebesar **10-15%** per siklus.
  * **Akurasi AI**: Menjaga presisi forecasting VolumeMind **$\ge$ 80%**.
  * **Kecepatan Keputusan**: Memotong waktu analisa pengadaan dari **1-3 hari** menjadi **< 1 jam** secara instan lewat dashboard.
  * **Ekosistem**: Menghubungkan **3 hingga 5 koperasi** dalam 1 wilayah pilot (*Koperasi Sumber Makmur* sebagai jangkar utama).

---

### 📺 Slide 10: The Team & Closing
* **Visual**: Foto dari 4 anggota tim beserta peran masing-masing. Latar belakang gelap slate dengan aksen hijau emerald.
* **Header**: **Computer Sigma Team: Mengakselerasi Koperasi Indonesia**
* **Susunan Tim**:
  * **Insan Maulana** (AI/ML & Backend Specialist)
  * **Faiz Ari Fadhillah** (Frontend & PWA Architect)
  * **Saladin Zhalifunnas Ahfar** (UI/UX & Product Design)
  * **Jad Abyanza Fauzan** (System Integrator & QA Analyst)
* **Closing Statement**:
  * *“VolumeMate membawa volume intelligence langsung ke tangan petani dan pengurus koperasi. Bersama VolumeMate, kita tingkatkan kedaulatan pangan nasional dari akar rumput.”*
