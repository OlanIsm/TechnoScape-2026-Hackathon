# 📱 VolumeMate Expo & Supabase Implementation Guide

Kami telah berhasil menginisialisasi aplikasi mobile **VolumeMate** berbasis **Expo React Native** dan mengintegrasikannya dengan **Supabase** secara lokal di dalam folder [volumemate-mobile](file:///Users/jadabyanzafauzan/TechnoScape-2026-Hackathon/volumemate-mobile) tanpa melakukan `git push`.

Proyek ini telah dikonfigurasi untuk menangani 3 peran (Koperasi, Supplier, Admin) dengan alur verifikasi dokumen, pelacakan diskon volume, group buy (pembelian bersama), dan audit log secara dinamis.

---

## 🗄️ Langkah 1: Setup Database di Supabase

1. Buka dashboard proyek [Supabase](https://supabase.com) Anda.
2. Navigasi ke menu **SQL Editor** di panel sebelah kiri.
3. Klik **New Query** dan buat editor kosong.
4. Salin seluruh isi berkas skema SQL yang telah kami buat:
   * **SQL Schema Script**: [supabase_schema.sql](file:///Users/jadabyanzafauzan/TechnoScape-2026-Hackathon/volumemate-mobile/supabase_schema.sql)
5. Tempel (*paste*) kode SQL tersebut ke dalam editor Supabase, lalu tekan tombol **Run**. Ini akan otomatis membuat tabel, enum, relasi, Row Level Security (RLS) policies, dan trigger pendaftaran profil otomatis.

---

## 🔑 Langkah 2: Konfigurasi Kunci Supabase di Aplikasi

Aplikasi Expo telah dikonfigurasi untuk membaca kunci Supabase dari berkas `.env` secara otomatis.

1. Di dalam folder `volumemate-mobile`, buat berkas baru bernama `.env`.
2. Masukkan URL dan Anon Key proyek Supabase Anda dengan format sebagai berikut:

```text
EXPO_PUBLIC_SUPABASE_URL=https://proyek-anda.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

*(Catatan: Awalan `EXPO_PUBLIC_` wajib digunakan agar Expo Router dapat membaca kunci ini secara langsung di sisi client).*

---

## 🚀 Langkah 3: Menjalankan Aplikasi Secara Lokal

Gunakan terminal Anda untuk menjalankan server developer Expo (tanpa perlu `git push`):

1. Pastikan Anda berada di direktori aplikasi mobile:
   ```bash
   cd volumemate-mobile
   ```
2. Jalankan perintah untuk memulai server:
   ```bash
   npm run start
   ```
3. Pilih platform target pengujian Anda:
   * Tekan `w` untuk membuka versi **Web** di browser Anda (berkas [app-tabs.web.tsx](file:///Users/jadabyanzafauzan/TechnoScape-2026-Hackathon/volumemate-mobile/src/components/app-tabs.web.tsx) akan otomatis merender frame shell mobile yang cantik di browser).
   * Gunakan aplikasi **Expo Go** di Android/iOS Anda dan pindai (*scan*) QR Code yang muncul di terminal untuk menguji langsung di ponsel pintar.

---

## 🏗️ Penjelasan Struktur Kode Mobile yang Dibangun

Seluruh kode sumber mobile diletakkan di dalam folder `src/` dengan arsitektur bersih:

* **Supabase Client**: [supabase.ts](file:///Users/jadabyanzafauzan/TechnoScape-2026-Hackathon/volumemate-mobile/src/lib/supabase.ts) - Menginisialisasi koneksi SDK Supabase dengan retensi sesi lokal menggunakan `AsyncStorage`.
* **State Autentikasi & Peran**: [useAuth.tsx](file:///Users/jadabyanzafauzan/TechnoScape-2026-Hackathon/volumemate-mobile/src/hooks/useAuth.tsx) - Mengelola sesi masuk, mendengarkan perubahan status login, serta menggabungkan data profil `Koperasi` / `Supplier` secara real-time.
* **Layout Manager**: [app-layout.tsx](file:///Users/jadabyanzafauzan/TechnoScape-2026-Hackathon/volumemate-mobile/src/components/app-layout.tsx) - Melakukan pengalihan layar bersyarat:
  * Jika belum masuk, render layar [auth-screen.tsx](file:///Users/jadabyanzafauzan/TechnoScape-2026-Hackathon/volumemate-mobile/src/components/auth-screen.tsx) (Login/Register peran & upload dokumen).
  * Jika berstatus `PENDING_ADMIN_APPROVAL`, render layar [pending-screen.tsx](file:///Users/jadabyanzafauzan/TechnoScape-2026-Hackathon/volumemate-mobile/src/components/pending-screen.tsx) (Tampilan menunggu persetujuan).
  * Jika `ACTIVE`, render navigasi bawah [app-tabs.tsx](file:///Users/jadabyanzafauzan/TechnoScape-2026-Hackathon/volumemate-mobile/src/components/app-tabs.tsx) sesuai perannya.
* **Fitur Layar Utama**:
  * **Koperasi**: Dashboard utama ([index.tsx](file:///Users/jadabyanzafauzan/TechnoScape-2026-Hackathon/volumemate-mobile/src/app/index.tsx)), VolumeMind AI ([volumemind.tsx](file:///Users/jadabyanzafauzan/TechnoScape-2026-Hackathon/volumemate-mobile/src/app/volumemind.tsx)), Group Buy ([collective.tsx](file:///Users/jadabyanzafauzan/TechnoScape-2026-Hackathon/volumemate-mobile/src/app/collective.tsx)), Catat manual ([transactions.tsx](file:///Users/jadabyanzafauzan/TechnoScape-2026-Hackathon/volumemate-mobile/src/app/transactions.tsx)), dan Riwayat Audit ([audit.tsx](file:///Users/jadabyanzafauzan/TechnoScape-2026-Hackathon/volumemate-mobile/src/app/audit.tsx)).
  * **Supplier**: Kelola proposal & deadline belanja ([supplier-pool.tsx](file:///Users/jadabyanzafauzan/TechnoScape-2026-Hackathon/volumemate-mobile/src/app/supplier-pool.tsx)).
  * **Admin**: Daftar persetujuan verifikasi akun ([admin-verif.tsx](file:///Users/jadabyanzafauzan/TechnoScape-2026-Hackathon/volumemate-mobile/src/app/admin-verif.tsx)) dan data user ([admin-users.tsx](file:///Users/jadabyanzafauzan/TechnoScape-2026-Hackathon/volumemate-mobile/src/app/admin-users.tsx)).
