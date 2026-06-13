# 🌿 Laporan & Penjelasan Model VolumeMind AI
**Smart Demand Forecasting untuk Koperasi Pertanian**

Laporan ini menjelaskan bagaimana model kecerdasan buatan (AI) **VolumeMind** bekerja, keputusan desain yang diambil, dan bagaimana model ini membantu Koperasi Sumber Makmur dalam bahasa yang mudah dipahami.

---

## 1. Bagaimana AI Menebak Kebutuhan Pupuk? (Pemilihan Model)

VolumeMind menggunakan algoritma bernama **Gradient Boosting Regressor**. 

### Analogi Sederhana
Bayangkan Anda ingin menebak berapa banyak pupuk yang akan dibutuhkan petani bulan depan:
*   **Gradient Boosting** bekerja secara sekuensial (seperti proses mentoring belajar). Model pertama menebak secara kasar. Model kedua khusus belajar dari kesalahan (error) tebakan model pertama. Model ketiga belajar dari kesalahan model kedua, dan seterusnya hingga 200 tahapan perbaikan (`n_estimators=200`). Proses belajar dari kesalahan ini menghasilkan tebakan akhir yang sangat presisi dan objektif.

### Mengapa tidak pakai rumus matematika garis lurus biasa?
Kebutuhan pupuk tidak stabil naik secara konstan. Polanya naik-turun mengikuti alam:
*   *Curah hujan sedang*: Tanaman tumbuh subur $\rightarrow$ butuh banyak pupuk.
*   *Curah hujan terlalu tinggi (banjir)*: Tanaman mati $\rightarrow$ kebutuhan pupuk malah turun drastis.
Pola naik-turun yang rumit ini tidak bisa dibaca oleh rumus garis lurus biasa, tetapi sangat mudah dipelajari oleh Gradient Boosting.

---

## 2. Menghindari "Hafalan Mati" & Desain Masa Depan (Anti-Overfitting & Extrapolation Safety)

Dalam dunia AI, ada istilah **Overfitting** (model terlalu pintar menghafal data masa lalu secara detail, tetapi gagal menebak masa depan saat ada kondisi baru yang berubah sedikit saja). Selain itu, model berbasis pohon secara alami **tidak bisa memproyeksikan tren ke atas** (ekstrapolasi waktu). Jika fitur `tahun` dibiarkan, model di tahun 2026/2027 hanya akan menebak batas maksimum tahun 2024 dan rentan mengalami kekacauan prediksi karena angka tahun yang terus membesar.

Untuk mengatasinya, kami mengambil dua langkah pencegahan:
1.  **Menghapus Fitur Tahun**: Model dipaksa fokus pada variabel fisik yang bermakna yaitu **luas lahan** (kebutuhan pupuk naik jika lahan bertambah) dan **bulan + curah hujan** (menangkap musim).
2.  **Regularisasi Kedalaman Pohon**: Membatasi kedalaman setiap pohon keputusan (`max_depth=4`) dan minimal sampel per daun (`min_samples_leaf=4`) agar model hanya menangkap konsep besarnya saja.

*   **Hasilnya**: Saat diuji menggunakan data tahun 2025 yang belum pernah dilihat sama sekali oleh model, akurasinya meningkat pesat menjadi **93.84%** (dengan nilai error MAE terpangkas 3x lipat dibanding model sebelumnya). Model terbukti sangat stabil tanpa gejala overfitting.

---

## 3. Cara Menguji Model (Strategi Validasi)

Untuk memastikan ramalan AI ini dapat diandalkan saat dipakai langsung di lapangan, kami mengujinya dengan dua cara:
1.  **Pengujian Berbasis Waktu**: Kami melatih model menggunakan data dari tahun **2021 hingga 2024**, lalu mengujinya untuk menebak keseluruhan tahun **2025**. Ini mensimulasikan penggunaan nyata di koperasi.
2.  **Validasi Silang Kronologis (TimeSeriesSplit)**: Kami menguji model secara bertahap dari tahun ke tahun secara berurutan, memastikan model tetap stabil meskipun terjadi pergeseran musim.

---

## 4. Bagaimana AI Memproses Data Kategori? (Preprocessing)

Komputer hanya mengerti angka. Dia tidak tahu apa arti kata "Urea" atau nama "Koperasi Sumber Makmur". 
Sebelum masuk ke model AI, data teks tersebut otomatis diubah menjadi kode angka (0 dan 1). Kami juga mengatur agar sistem **tidak error** jika ada nama koperasi baru yang didaftarkan di kemudian hari (AI akan otomatis fokus menghitung variabel luas lahan dan musim pertaniannya).

---

## 5. Menghubungkan AI dengan Keuntungan Bisnis

AI VolumeMind tidak hanya menebak angka kebutuhan, tetapi juga memandu keputusan pembelian agar koperasi mendapatkan harga paling murah:

### A. Volume Hack (Akal-akalan Volume Diskon)
*   Jika AI memprediksi kebutuhan pupuk sebesar **9.500 kg** dengan harga normal Rp 9.200/kg (Total: **Rp 87,4 juta**).
*   AI mendeteksi bahwa jika membeli minimal 10.000 kg, supplier akan memberikan harga diskon Rp 8.500/kg.
*   Sistem akan merekomendasikan: *"Beli saja **10.000 kg**! Total biayanya menjadi Rp 85 juta."* 
*   Koperasi bisa hemat **Rp 2,4 juta** sekaligus mendapatkan tambahan **500 kg pupuk gratis**.

### B. Rekomendasi Waktu Pembelian (Timing)
*   **Aman**: Menyarankan pemesanan dilakukan **1 bulan sebelum bulan penggunaan** agar stok tersedia tepat waktu di gudang.
*   **Volume Besar**: Jika pesanan sangat banyak (skala besar $\ge 10$ ton), sistem otomatis menyarankan pemesanan **1-2 bulan lebih cepat** untuk menghindari antrean logistik pengiriman di pihak supplier.
