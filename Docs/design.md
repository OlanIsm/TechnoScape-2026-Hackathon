# 🎨 VolumeMate UI/UX Design System (Google Stitch Ready)

Dokumen ini mendefinisikan spesifikasi desain UI/UX untuk **VolumeMate**, sistem pengadaan pupuk cerdas yang dioptimalkan untuk perangkat mobile. Dokumen ini diselaraskan sepenuhnya dengan pembaharuan **PRD (Product Requirement Document)**, **Roles & Permissions**, serta **Alur Kerja Sistem (Workflow)** terbaru.

Desain ini mengusung pendekatan **Google Material Design 3** yang bersih (*clean*), ramah pengguna (*user-friendly*), bernuansa **hijau (emerald green)**, sederhana, dan berfokus pada **mobile-only (PWA)**.

---

## 📱 1. Filosofi Desain & Pembatasan Platform (Mobile-Only)

* **Form Factor Mobile-Only PWA**: Seluruh antarmuka dirancang khusus untuk viewport ponsel pintar ($360\text{dp}$ hingga $420\text{dp}$). Tidak ada layout desktop khusus, sidebar lebar, atau dashboard multi-kolom horizontal.
* **Tampilan Desktop (Fallback)**: Ketika dibuka di browser desktop (untuk keperluan uji coba/admin), aplikasi akan dirender di dalam **Mobile Shell** yang terpusat di tengah layar (*centered mobile frame*) untuk menjaga konsistensi pengalaman pengguna.
* **Akses Jaringan Lambat (3G/Offline)**: Antarmuka harus ringan, menghindari aset grafis besar, dan menggunakan ikon vektor sederhana (seperti Lucide/Material Icons) agar responsif di jaringan pedesaan yang tidak stabil.

---

## 🎨 2. Palet Warna & Tipografi (Design Tokens)

### Skema Warna Utama:
* **Primary Emerald Green** (`#10B981`): Tombol aksi utama (*Call to Action*), indikator progres pencapaian target diskon, dan status aktif.
* **Primary Text / Dark Slate** (`#1F2937`): Teks utama, judul menu, dan elemen struktural (kontras tinggi, legibel di luar ruangan).
* **Secondary Mint Green** (`#34D399`): Elemen pengisi progres bar, grafik penunjang, dan badge sukses minor.
* **Soft Sage Background** (`#F9FAFB` untuk background umum; `#ECFDF5` untuk latar kartu *glassmorphism*).
* **Warning Amber** (`#F59E0B`): Digunakan untuk status penundaan, *Offline Mode*, dan batas waktu penutupan order.
* **Danger Red** (`#EF4444`): Digunakan untuk pembatalan transaksi, kegagalan pembayaran, atau status akun yang ditolak.

### Tipografi:
* **Header & Judul**: `Outfit` (Geometric sans-serif, bersih, ramah, dan modern).
* **Body, Form & Angka**: `Inter` (Sangat legibel untuk angka nominal, berat tonase, dan tabel data).

---

## 🔑 3. Alur UI Pendaftaran & Verifikasi Admin

Sebelum mengakses fitur utama, pengguna harus melewati alur pendaftaran dan verifikasi manual oleh Admin.

```
Pendaftaran (Koperasi/Supplier) 
      ↓
[Upload KTP & Dokumen Legal]
      ↓
Status: PENDING_ADMIN_APPROVAL 
      ↓ (Verifikasi Manual oleh Admin)
ACTIVE  atau  REJECTED
```

### UX Status Menunggu (Waiting Screen):
* Pengguna yang berstatus `PENDING_ADMIN_APPROVAL` hanya dapat melihat satu layar bersih berisi ilustrasi dokumen sedang ditinjau, teks penjelasan ramah, dan tombol hubungi Admin/Bantuan. Seluruh menu navigasi utama disembunyikan atau di-nonaktifkan.

---

## 📱 4. Antarmuka Peran: Koperasi (Buyer)

Koperasi menggunakan navigasi bawah (*bottom navigation bar*) dengan 5 menu utama:

```
[ Home ]  [ VolumeMind ]  [ Collective Buy ]  [ Catat Transaksi ]  [ Audit Log ]
```

### Menu 1: Home (Dashboard Ringkas)
* **Aturan Desain**: Menampilkan ringkasan operasional saja. Tidak menampilkan daftar transaksi rinci atau riwayat pool yang sukses/gagal di halaman ini (dipindahkan ke Audit Log).
* **Konten Layar**:
  * Total pengeluaran pengadaan (Card ringkas).
  * Total volume pupuk tercatat dalam ton (Card ringkas).
  * Widget ringkasan pool yang sedang berjalan (*Active/Open Pool*).
  * Grafik tren sederhana transaksi bulanan.

#### 🖼️ Dashboard Mockup:
![VolumeMate Dashboard UI Mockup](file:///Users/jadabyanzafauzan/TechnoScape-2026-Hackathon/Docs/volumemate_dashboard_mockup.png)

---

### Menu 2: VolumeMind AI Recommendation (Form Minimalis)
Membantu koperasi mendapatkan rekomendasi pembelian optimal dengan input minimal.

* **Form Input (Hanya 3 Field)**:
  1. `Jenis Pupuk` (Dropdown: Urea Granul, NPK Phonska, SP-36).
  2. `Tanggal Penggunaan / Bulan Target` (Month selector: e.g., Oktober 2026).
  3. `Luas Lahan Aktif (Hektar)` (Number input: e.g., 500).
* **Visualisasi Pengayaan Otomatis (Auto-Enrichment UI)**:
  * Di bawah form, tampil indikator kecil berwarna hijau yang mengonfirmasi data cuaca (BMKG), musim tanam, histori koperasi, dan harga supplier terdekat telah dimuat otomatis oleh sistem tanpa perlu diisi manual oleh pengguna.
* **Layar Output Rekomendasi (Plan Card)**:
  * Tampil kartu ringkasan belanja optimal:
    * **Supplier Terpilih**: PT Pupuk Kaltim
    * **Jumlah Direkomendasikan**: 10.000 kg (AI menyarankan pembulatan ke atas dari kebutuhan riil 9.500 kg untuk memicu diskon tier grosir).
    * **Total Biaya**: Rp90.000.000
    * **Potensi Penghematan**: Rp2.400.000 (diskon tier grosir).
    * **Jendela Pemesanan Terbaik**: Agustus 2026 (1-2 bulan sebelum tanam).
    * **Alasan Rekomendasi**: Menjelaskan korelasi curah hujan tinggi di bulan target dan optimasi tier harga.
  * Tombol Aksi: `[Konfirmasi Pemesanan]` (Membuat draft order/proposal pool).

---

### Menu 3: Collective Buy (Pembelian Bersama / Group Buy)
* **Daftar Pool Terbuka**: Kartu-kartu pool yang aktif. Dilengkapi progress bar gabungan volume dan penghitung mundur sisa waktu deadline.
* **Tombol Tambah Melayang (Floating Plus Button)**: Terletak di pojok kanan bawah untuk membuat proposal pool baru.
* **Form Pengajuan Pool Baru (Propose Pool)**:
  * Input: Pilih Supplier terverifikasi (via pencarian nama unik), Jenis Pupuk, Target Volume, Target Dana, Dana Awal Pengusul, Catatan/Bukti negosiasi luar.
  * Setelah diajukan, status pool menjadi `PENDING_SUPPLIER_APPROVAL` dan menunggu tindakan dari Supplier.
* **Aturan Bergabung (Join Pool UI)**:
  * Koperasi lain dapat bergabung ke pool yang sudah disetujui Supplier (`OPEN_FOR_KOPERASI`).
  * Input nominal dana gabungan dibatasi sistem: `dana_saat_ini + dana_gabungan <= target_dana`.
  * Jika melebihi batas, tombol dinonaktifkan dan muncul pesan eror: `"Batas kontribusi maksimal: Rp{sisa_dana}"`.

---

### Menu 4: Pencatatan Transaksi (Manual Offline Recording)
Form sederhana untuk mencatat pembelian pupuk di luar sistem pool.
* **Field**: Jenis Pupuk, Jumlah (kg), Nama Supplier, Tanggal Transaksi, Total Harga.
* **Tombol**: `[Simpan Transaksi]`. Data langsung memperbarui grafik di Home Dashboard dan masuk sebagai riwayat di Audit Log.

---

### Menu 5: Audit Log (Hanya Hasil Akhir / Final Outcomes)
* **Aturan Desain**: Tidak menampilkan status proses yang belum selesai (seperti pending approval, on-going funding, atau payment waiting).
* **Konten**:
  1. Catatan transaksi manual.
  2. Pool dengan status final:
     * `SUCCESS` (Hijau ✅) - Pembayaran lengkap & dana telah diteruskan ke Supplier.
     * `DECLINED_BY_SUPPLIER` (Abu-abu/Merah ❌) - Ditolak oleh supplier.
     * `AUTO_DECLINED_NO_SUPPLIER_RESPONSE` (Abu-abu ⏳) - Kedaluwarsa karena supplier tidak merespons dalam 7 hari.
     * `FUNDING_DEADLINE_CANCELED` (Amber/Kuning ⚠️) - Dana tidak terkumpul hingga deadline.
     * `PAYMENT_FAILED_CANCELED` (Merah 🚫) - Salah satu anggota gagal membayar dalam jendela transfer 24 jam.
* **Fitur Re-propose**: Untuk pool yang berstatus gagal (`FUNDING_DEADLINE_CANCELED` atau `PAYMENT_FAILED_CANCELED`), terdapat tombol `[Ajukan Ulang / Re-propose]` di dalam detail audit. Tombol ini otomatis menduplikasi data pool lama ke form pengajuan baru.
* **Fungsi Ekspor**: Tombol cepat untuk mendownload laporan dalam format PDF atau Excel.

---

## 📱 5. Antarmuka Peran: Supplier (Active Seller)

Supplier memiliki navigasi bawah dengan 2 menu utama:

```
[ Kelola Pool ]  [ Audit Log ]
```

### Menu 1: Pool Management (Kelola Pool)
Menggunakan tab geser (*sliding tabs*) atas:

#### Tab A: Pending (Menunggu Keputusan)
* Menampilkan proposal pool dari koperasi yang ditujukan kepada Supplier tersebut (berusia $< 7\text{ hari}$).
* Detail proposal menampilkan: Nama Koperasi Pengusul, Jenis Pupuk, Volume Target, Dana Target, Dana Awal, Catatan, dan delivery note.
* Aksi Supplier:
  * `[Tolak / Reject]`: Status berubah menjadi `DECLINED_BY_SUPPLIER` dan masuk Audit Log.
  * `[Setujui / Accept]`: Membuka modal input untuk memasukkan **Tanggal & Jam Batas Waktu Pengumpulan Dana (Deadline Date & Time)**. Setelah dikirim, status berubah menjadi `OPEN_FOR_KOPERASI`.

#### Tab B: On-going (Sedang Berjalan)
* Menampilkan daftar pool yang telah disetujui dan sedang dalam proses pengumpulan dana (`OPEN_FOR_KOPERASI`), mencapai target (`TARGET_REACHED`), atau menunggu pembayaran (`PAYMENT_WAITING`).

### Menu 2: Supplier Audit Log
* Sama seperti koperasi, hanya menampilkan riwayat pool yang sudah selesai dengan status final.

---

## 🖥️ 6. Antarmuka Peran: Admin (User & Trust Manager)

Admin memantau platform melalui menu mobile sederhana terfokus:

* **Navigasi Utama**:
  1. **Permintaan Verifikasi (Verification Requests)**: Daftar pendaftaran Koperasi/Supplier baru yang berstatus `PENDING_ADMIN_APPROVAL`.
  2. **Pengguna Aktif (Approved Users)**.
  3. **Pengguna Ditolak (Rejected Users)**.
* **Detail Pengguna (User Detail Page)**:
  * Menampilkan informasi nama organisasi, penanggung jawab, kontak, foto KTP, dan dokumen legalitas.
  * Tombol aksi: `[Approve]` (Hijau) atau `[Reject]` (Merah, dengan input alasan penolakan).

---

## ⚡ 7. Jendela Pembayaran 24 Jam & Keuangan (Payment UI)

Ketika pool mencapai target dana:
1. Status pool berubah menjadi `PAYMENT_WAITING`.
2. Pengguna Koperasi yang berpartisipasi menerima notifikasi urgensi tinggi dan melihat halaman khusus pembayaran dengan **Timer Hitung Mundur 24 Jam** yang menyala kuning/merah.
3. Tampil nomor rekening platform/virtual account untuk mentransfer dana komitmen mereka.
4. **Pemberitahuan Fee**: Rincian transfer menampilkan nominal potongan biaya administrasi platform sebelum sisa dana diteruskan ke Supplier (`payout = total_dana - platform_fee`).
5. Jika salah satu anggota melewati batas 24 jam tanpa membayar, status berubah menjadi `PAYMENT_FAILED_CANCELED` (Merah) dan uang yang sudah masuk dikembalikan (refund).

---

## 💡 8. Google Stitch Generation Prompt Blueprint

Gunakan prompt di bawah ini pada Google Stitch untuk merender antarmuka terbaru:

> "Generate a mobile-only web PWA in a centered mobile viewport shell for an agricultural cooperative app named VolumeMate. The UI must use a clean Material Design 3 style with an emerald green, off-white, and dark slate color scheme. Create the bottom navigation containing Home (summary metrics only), VolumeMind (minimal form with 3 inputs: Fertilizer, Month, Land Area), Collective Buy (pool grid with progress bars, and a floating action button to propose new pools), and Audit Log (showing final outcomes like SUCCESS or CANCELED with color-coded badges, and a Re-propose action button). Also generate a Supplier view with a sliding tab layout for Pending Proposals (showing accept/reject actions and a deadline input modal) and On-going Pools."
