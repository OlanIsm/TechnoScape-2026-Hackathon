# Flowchart Diagram — VolumeMate

Dokumen ini menjelaskan alur kerja (workflow) utama dari platform VolumeMate, yang mencakup manajemen data, pelacakan harga, mesin rekomendasi AI, sistem pembelian kolektif, pencatatan transaksi aman, dan toleransi jaringan (offline mode).

---

## Alur Kerja Aplikasi (Application Flowchart)

Berikut adalah diagram flowchart yang menggambarkan interaksi pengguna dan proses sistem di dalam platform VolumeMate:

```mermaid
graph TD
    %% Define Nodes and Labels
    U["Admin Koperasi"]
    M["Anggota Koperasi / Petani"]
    SUP["Supplier dan Price Tiers"]
    KOP_VOL["Volume Pesanan Koperasi"]
    TRK["Volume Price Tracker Dashboard"]
    CALC["Kalkulator Biaya Real-time"]
    HIST[("Histori Transaksi")]
    AI_FC["Demand Forecasting Model"]
    AI_REC["Optimal Buy Recommendation"]
    POOL["Collective Purchase Pool"]
    AGG["Volume Aggregator"]
    UNFULFILLED{"Target Volume Tercapai?"}
    NEG_FLOW{"Pilih Opsi Tindakan"}
    CANCEL_POOL["Pool: CANCELLED"]
    SPLIT["Split Billing dan Distribution"]
    CONN_CHECK{"Koneksi Internet?"}
    TX["Order: CONFIRMED"]
    DB_LOC[("IndexedDB Browser")]
    SYNC["Auto Sync saat Online"]
    AUD[("Audit Log Append-Only")]
    EXP["Ekspor Laporan PDF dan Excel"]

    %% Define Node Classes
    class U,M admin;
    class AI_FC,AI_REC ai;
    class POOL,AGG,UNFULFILLED,NEG_FLOW,CANCEL_POOL,SPLIT collb;
    class HIST,AUD db;
    class CONN_CHECK,DB_LOC,SYNC offline;

    %% Styling Classes
    classDef admin fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1;
    classDef ai fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#4a148c;
    classDef collb fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20;
    classDef db fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#e65100;
    classDef offline fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#b71c1c;

    %% Connections
    U -->|Input Manual Data Offline| SUP
    M -->|Pesan Pupuk Eceran| KOP_VOL
    KOP_VOL --> TRK
    SUP --> TRK
    TRK -->|Progress Bar dan Estimasi Harga| CALC

    HIST --> AI_FC
    AI_FC -->|Prediksi Kebutuhan Musim Depan| AI_REC
    SUP --> AI_REC
    AI_REC -->|Rekomendasi: Waktu, Volume, dan Supplier Terbaik| U

    U -->|Buat / Gabung Pool| POOL
    POOL -->|Agregasi Volume Otomatis| AGG
    AGG -->|Cek Tier Harga Lebih Murah| SUP
    POOL -->|Deadline Tercapai| UNFULFILLED

    UNFULFILLED -->|Ya| SPLIT
    UNFULFILLED -->|Tidak| NEG_FLOW

    NEG_FLOW -->|Extend Deadline| POOL
    NEG_FLOW -->|Adjust to Nearest Tier| SPLIT
    NEG_FLOW -->|Cancel Pool| CANCEL_POOL

    TRK -->|Konfirmasi Pesanan| CONN_CHECK
    SPLIT -->|Konfirmasi Pesanan Pool| CONN_CHECK

    CONN_CHECK -->|Online| TX
    CONN_CHECK -->|Offline| DB_LOC
    DB_LOC -->|Offline Queue| SYNC
    SYNC --> TX

    TX -->|Immutable Ledger| AUD
    AUD --> EXP
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
