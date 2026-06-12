# 🌿 VolumeMind AI: Pitch & Judges QA Guide
**Panduan Sukses Presentasi Hackathon TechnoScape 2026**

Dokumen ini berisi rangkuman keputusan teknis model VolumeMind AI dan daftar pertanyaan yang kemungkinan besar akan ditanyakan oleh juri saat sesi presentasi/tanya jawab (*pitching*).

---

## 📋 Rangkuman Singkat Model (Pasti Ditanya saat Pitching)

*   **Algoritma**: `RandomForestRegressor` (Ensemble Tree-Based).
*   **Tujuan**: Memprediksi kebutuhan volume pupuk koperasi bulanan (`Demand Forecasting`) untuk memandu pembelian harga termurah (`Optimal Buy Recommendation`).
*   **Kenapa Random Forest?**: 
    1.  Mampu membaca pola naik-turun cuaca yang melengkung (non-linear).
    2.  Toleran terhadap data lapangan yang kotor/outliers.
    3.  Bekerja sangat baik pada dataset tabular berukuran kecil-menengah tanpa memerlukan daya komputasi besar.
*   **Status Overfitting**: **Sangat Aman**. Skor R2 pada data latih (95%) dan data uji (89%) hanya selisih kurang dari 6%. Ini berkat pembatasan kedalaman pohon keputusan (`max_depth=8`).
*   **Cara Pengujian**: Memisahkan data secara kronologis (latih di data tahun 2021–2024, uji di data 2025) untuk menyimulasikan penggunaan nyata di masa depan.

---

## 💬 FAQ Juri Hackathon & Jawaban Rekomendasi

### ❓ Q1: Kenapa pakai Random Forest? Kenapa tidak pakai model waktu murni seperti ARIMA, Prophet, atau LSTM?
> **Jawaban Rekomendasi:**
> "Kebutuhan pupuk pertanian tidak hanya dipengaruhi oleh tren waktu historis saja (yang biasa dibaca ARIMA), melainkan dipengaruhi secara kuat oleh **variabel eksternal yang dinamis** seperti curah hujan, musim tanam, dan luas lahan pertanian. 
> 
> *   **ARIMA/Prophet** tidak bisa menerima fitur eksternal multi-variabel tabular dengan baik.
> *   **LSTM (Deep Learning)** membutuhkan data ratusan ribu baris agar akurat, sedangkan data koperasi desa biasanya terbatas (ratusan baris).
> *   **Random Forest** adalah model paling optimal karena bekerja sangat baik pada data tabular kecil-menengah dan mampu menangkap hubungan non-linear antara iklim dan kebutuhan pupuk secara alami."

---

### ❓ Q2: Bagaimana kalian menjamin model ini tidak mengalami overfitting ketika digunakan di lapangan?
> **Jawaban Rekomendasi:**
> "Kami menerapkan dua lapis pertahanan untuk menghindari overfitting:
> 1.  **Regulasi Hyperparameter:** Kami membatasi kedalaman maksimum pohon (`max_depth=8`) dan menetapkan jumlah sampel minimum per daun (`min_samples_leaf=4`). Ini memaksa model untuk mempelajari konsep umum dan melarang model menghafal detail data latih secara mentah.
> 2.  **Validasi Kronologis:** Kami membagi data latih (2021-2024) dan data uji (2025) secara berurutan sesuai waktu, bukan acak, untuk mencegah kebocoran informasi masa depan (*data leakage*). Selisih performa model kami di data latih (95%) dan data uji (89%) berada di bawah 6%, membuktikan model kami sangat adaptif dengan data baru."

---

### ❓ Q3: Bagaimana jika ada Koperasi baru atau jenis pupuk baru didaftarkan di aplikasi? Apakah sistem kalian akan error karena data tersebut belum pernah dipelajari AI saat training?
> **Jawaban Rekomendasi:**
> "Tidak akan error. Di dalam pipeline pemrosesan data, kami mengimplementasikan encoder dengan pengaturan `handle_unknown='ignore'`. 
> 
> Jika sistem menerima koperasi atau produk pupuk baru yang belum ada di database latihan, AI akan otomatis mengabaikan nama identitasnya dan secara cerdas menghitung prediksi berdasarkan variabel fisik yang tersedia, seperti rata-rata curah hujan wilayah tersebut, musim tanam yang sedang berjalan, dan luas lahan pertaniannya."

---

### ❓ Q4: Bagaimana prediksi volume AI ini dihubungkan langsung ke strategi bisnis koperasi (Business Value)?
> **Jawaban Rekomendasi:**
> "Prediksi volume dari VolumeMind AI dialirkan secara otomatis ke **Optimal Buy Engine** untuk meminimalkan biaya pengadaan koperasi:
> 1.  **Volume Hack:** AI membandingkan struktur harga tier dari seluruh supplier. Jika dengan membeli volume sedikit di atas kebutuhan riil (misal dari 9.500 kg dinaikkan ke 10.000 kg) bisa memicu tier harga grosir yang lebih murah, AI akan merekomendasikan opsi tersebut karena total biaya belanjanya menjadi lebih hemat.
> 2.  **Rekomendasi Waktu Pemesanan (Timing):** AI menyarankan pemesanan 1 bulan sebelum penggunaan. Namun, jika volume belanja sangat besar (seperti hasil Volume Hack), AI menyarankan pemesanan 1-2 bulan lebih awal untuk mengamankan antrean logistik pengiriman dari supplier."

---

### ❓ Q5: Dari mana aplikasi mendapatkan data curah hujan secara real-time di lapangan nanti?
> **Jawaban Rekomendasi:**
> "Untuk kebutuhan MVP saat ini, data curah hujan menggunakan data historis bulanan. Namun, untuk implementasi di fase produksi, backend NestJS kami dirancang untuk diintegrasikan secara otomatis dengan API cuaca pihak ketiga yang terbuka (seperti OpenWeatherMap API atau data publik BMKG) untuk mengambil rata-rata curah hujan di wilayah koordinat koperasi setiap bulannya."
