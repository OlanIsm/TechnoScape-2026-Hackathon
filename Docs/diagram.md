# Flowchart Diagram — VolumeMate

Dokumen ini menjelaskan alur kerja (workflow) utama dari platform VolumeMate, yang mencakup manajemen data, pelacakan harga, mesin rekomendasi AI, sistem pembelian kolektif, pencatatan transaksi aman, dan toleransi jaringan (offline mode).

---

## Alur Kerja Aplikasi (Application Flowchart)

Berikut adalah diagram flowchart yang menggambarkan interaksi pengguna dan proses sistem di dalam platform VolumeMate:

```mermaid
graph TD
    classDef admin fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1;
    classDef ai fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#4a148c;
    classDef collb fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20;
    classDef db fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#e65100;
    classDef offline fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#b71c1c;

    U[Admin Koperasi]:::admin
    M[Anggota Koperasi / Petani]:::admin

    U -->|Input Manual Data Offline| SUP[Supplier dan Price Tiers]
    M -->|Pesan Pupuk Eceran| KOP_VOL[Volume Pesanan Koperasi]
    KOP_VOL --> TRK[Volume Price Tracker Dashboard]
    SUP --> TRK
    TRK -->|Progress Bar dan Estimasi Harga| CALC[Kalkulator Biaya Real-time]

    HIST[(Histori Transaksi)]:::db
    HIST --> AI_FC[Demand Forecasting Model]:::ai
    AI_FC -->|Prediksi Kebutuhan Musim Depan| AI_REC[Optimal Buy Recommendation]:::ai
    SUP --> AI_REC
    AI_REC -->|Rekomendasi: Waktu, Volume, dan Supplier Terbaik| U

    U -->|Buat / Gabung Pool| POOL[Collective Purchase Pool]:::collb
    POOL -->|Agregasi Volume Otomatis| AGG[Volume Aggregator]:::collb
    AGG -->|Cek Tier Harga Lebih Murah| SUP
    POOL -->|Deadline Tercapai| SPLIT[Split Billing dan Distribution]:::collb

    TRK -->|Konfirmasi Pesanan| CONN_CHECK{Koneksi Internet?}:::offline
    SPLIT -->|Konfirmasi Pesanan Pool| CONN_CHECK

    CONN_CHECK -->|Online| TX[Order: CONFIRMED]
    CONN_CHECK -->|Offline| DB_LOC[(IndexedDB Browser)]:::offline
    DB_LOC -->|Offline Queue| SYNC[Auto Sync saat Online]:::offline
    SYNC --> TX

    TX -->|Immutable Ledger| AUD[(Audit Log Append-Only)]:::db
    AUD --> EXP[Ekspor Laporan PDF dan Excel]
```

---

## Deskripsi Alur

1. **Modul Pelacakan Harga (Volume Price Tracker)**:
   * Admin Koperasi memasukkan data profil supplier dan struktur tier harga secara manual berdasarkan negosiasi offline.
   * Anggota koperasi (petani/toko gerai) melakukan pemesanan pupuk eceran ke koperasi.
   * Dasbor melacak total volume pesanan saat ini dan menunjukkan estimasi biaya real-time serta jarak volume yang dibutuhkan untuk mencapai tier harga berikutnya.

2. **VolumeMind AI Engine**:
   * Sistem menganalisis histori transaksi yang tersimpan di PostgreSQL.
   * Model demand forecasting memprediksi jumlah kebutuhan pupuk untuk musim tanam mendatang.
   * Berdasarkan prediksi kebutuhan dan data tier harga supplier, sistem memberikan rekomendasi pembelian optimal (kapan harus membeli, seberapa banyak volume, dan dari supplier mana).

3. **Pembelian Kolektif (Collective Buying Power)**:
   * Admin Koperasi dapat membuat atau bergabung dengan kelompok pembelian bersama (Cooperative Pool).
   * Volume pesanan dari beberapa koperasi digabungkan oleh sistem untuk memenuhi tier volume yang lebih tinggi agar mendapatkan harga per unit yang lebih murah.
   * Setelah batas waktu (deadline) tercapai, tagihan dibagi secara proporsional (split billing) kepada masing-masing koperasi yang berpartisipasi.

4. **Toleransi Jaringan (Offline Mode)**:
   * Sebelum pesanan dikirim, sistem mendeteksi status koneksi internet.
   * Jika tidak ada jaringan (offline), data pesanan disimpan sementara di penyimpanan lokal browser (IndexedDB).
   * Ketika koneksi internet pulih, service worker melakukan sinkronisasi otomatis untuk mengirimkan data antrean pesanan ke server backend.

5. **Keamanan dan Audit**:
   * Setiap pesanan yang dikonfirmasi akan dicatat ke dalam database dengan status yang tidak dapat diubah atau dihapus (immutable ledger).
   * Perubahan status pengiriman atau pembayaran dicatat secara append-only di dalam tabel Audit Log untuk menjaga transparansi.
   * Laporan transaksi bulanan/tahunan dapat diekspor ke format PDF atau Excel.
