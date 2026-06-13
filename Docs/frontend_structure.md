# Frontend Structure — VolumeMate

This document summarizes the important frontend files and conventions after the current mobile MVP progress.

Frontend stack:

```text
React 18
Vite
TypeScript
react-native-web
CSS-in-JS via StyleSheet objects
```

The app is mobile-only for MVP. Desktop browser usage is only for development/testing and should render the same centered mobile shell.

---

## 1. Important Files

```text
frontend/
├── index.html
├── package.json
├── src/
│   ├── App.tsx
│   ├── theme.ts
│   ├── assets/
│   ├── components/
│   │   ├── BrandMark.tsx
│   │   ├── KoperasiBottomNav.tsx
│   │   ├── MainHeader.tsx
│   │   ├── NonMenuHeader.tsx
│   │   └── PoolCard.tsx
│   ├── data/
│   │   └── pools.ts
│   ├── screens/
│   │   ├── AdminApprovalScreen.tsx
│   │   ├── AuditLogScreen.tsx
│   │   ├── CollectiveBuyScreen.tsx
│   │   ├── JoinPoolScreen.tsx
│   │   ├── KoperasiDashboardScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── MenuScreen.tsx
│   │   ├── PoolDetailScreen.tsx
│   │   ├── RecordTransactionScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   └── SplashScreen.tsx
│   └── services/
│       └── api.ts
```

---

## 2. Routing Model

Routing is currently hash/state based in `src/App.tsx`.

Known hashes:

```text
#login
#register
#koperasi
#kolektif
#gabung-pool
#detail-pool
#catat
#log
#supplier
#admin
```

The app starts at Splash, then routes to Login.

---

## 3. Shared Components

### `MainHeader`

Used on main role menu screens.

Current convention:

- VolumeMate icon on left,
- logout icon on right,
- divider line below header.

### `KoperasiBottomNav`

Used for Koperasi main menus:

```text
Beranda
Kolektif
Catat
Log
```

Current convention:

- active tab uses soft cream/shadow highlight,
- icons are asset-based SVGs.

### `NonMenuHeader`

Used for non-menu/detail screens.

Layout:

```text
{back icon} {page title}
```

Examples:

- `Gabung Pool`
- `Detail Pool`

### `PoolCard`

Reusable pool card for dummy/local pool data. Backend-integrated pool cards in `CollectiveBuyScreen` currently use a screen-local card renderer because backend data shape differs.

---

## 4. Main Screens

### `SplashScreen`

Shows the white VolumeMate icon centered for 3 seconds, then routes to Login.

No start button.

### `LoginScreen`

Supports demo shortcuts:

```text
email = 1 -> koperasi
email = 2 -> supplier
email = 3 -> admin
```

For real login, calls:

```text
POST /auth/login
```

### `RegisterScreen`

Three-step registration:

```text
1. Akun
2. Organisasi
3. Dokumen
```

Required information:

- name,
- email,
- password,
- role,
- organization name,
- responsible person,
- address,
- phone,
- KTP file placeholder,
- legal PDF file placeholder,
- Terms of Service checkbox.

### `KoperasiDashboardScreen`

Home/Dashboard for Koperasi.

Contains:

- metric cards,
- VolumeMind recommendation card,
- active pool summary,
- stock mutation modal from audit data.

VolumeMind appears only here.

### `CollectiveBuyScreen`

Backend-integrated pool screen.

Tabs:

```text
Pool Terbuka
Pool Saya
```

Current behavior:

- `Pool Terbuka`: shows open pools not joined by current koperasi,
- `Pool Saya`: shows pools joined by current koperasi,
- `Gabung Pool Ini` opens Join Pool,
- `Lihat Detail` opens Pool Detail,
- floating plus creates a simple pool proposal using available product data,
- no search bar.

### `JoinPoolScreen`

Non-menu screen for joining a pool.

User inputs contribution volume in ton. The screen shows:

- target volume,
- unit price,
- remaining needed volume,
- estimated payment.

Confirming returns to Collective Buy and places the pool into Pool Saya.

### `PoolDetailScreen`

Non-menu detail screen for pools in Pool Saya.

Shows:

- product,
- supplier,
- location,
- deadline,
- target volume,
- collected volume,
- remaining volume,
- price,
- progress,
- cost summary.

### `RecordTransactionScreen`

Manual transaction screen.

Tabs:

```text
Catat Pengeluaran
Catat Pemasukan
```

Default:

```text
Catat Pengeluaran
```

Fields:

```text
Jenis Pupuk
Jumlah (kg)
Tanggal Transaksi
Total Harga
```

No visible supplier input.

On success:

- calls `/orders/manual`,
- clears form,
- shows green toast.

On validation/API error:

- shows red warning notice.

### `AuditLogScreen`

Backend-integrated audit log.

Tabs:

```text
Transaksi Manual
Riwayat Pool
```

Current UI rules:

- no filter chips,
- export CSV button exists,
- pool history title uses `{proposing_koperasi}`,
- no profile pictures/avatar stack,
- no `Lihat Detail` button on pool history.

### `MenuScreen`

Supplier menu screen.

Supplier has two menus:

```text
Manajemen Proposal
Audit Log
```

### `AdminApprovalScreen`

Admin's single MVP menu:

```text
Persetujuan Akun
```

Admin reviews pending Koperasi/Supplier registrations and must never see passwords.

---

## 5. Styling Conventions

Theme source:

```text
frontend/src/theme.ts
```

Important colors:

```text
primary: #012d1d
secondary: #2c694e
successGreen: #2b9348
warningAmber: #ffb703
background: #f8f9fa
surfaceCard: #ffffff
surfaceContainerLow: #f3f4f5
surfaceVariant: #e1e3e4
```

UI conventions:

- mobile-first, max width around 430px,
- use bottom nav for main Koperasi menus,
- use shared main header on main menus,
- use non-menu header for detail/action screens,
- keep cards lightweight,
- use Bahasa Indonesia for user-facing copy.

---

## 6. Development Commands

```bash
cd frontend
npm run dev
npm run lint
npm run build
```

Before committing frontend changes:

```bash
npm run lint
npm run build
```

