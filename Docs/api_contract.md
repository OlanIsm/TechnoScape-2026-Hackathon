# API Contract — VolumeMate Current Frontend Integration

This document records the API shape currently expected by the React/Vite mobile frontend.

The contract is based on `frontend/src/services/api.ts` and the latest frontend screens. Some endpoints are already connected to backend work, while a few UI flows still use placeholders until the backend contract is finalized.

---

## 1. Base URL

```text
http://localhost:3000
```

The frontend currently uses this constant:

```text
API_BASE_URL = http://localhost:3000
```

---

## 2. Auth

### POST `/auth/login`

Request:

```json
{
  "email": "user@gmail.com",
  "password": "password"
}
```

Expected response:

```json
{
  "access_token": "jwt-token",
  "user": {
    "email": "user@gmail.com",
    "role": "ADMIN_KOPERASI"
  }
}
```

Frontend behavior:

- stores `access_token` in `localStorage.volumemate_token`,
- stores user object in `localStorage.volumemate_user`,
- routes `SUPPLIER` to supplier menu,
- routes `ADMIN_KOPERASI` or `ANGGOTA` to koperasi menu,
- fallback goes to koperasi menu.

Demo login shortcuts currently exist in the UI:

```text
email = 1 -> koperasi
email = 2 -> supplier
email = 3 -> admin
```

### POST `/auth/register`

Current frontend request can include:

```json
{
  "email": "user@gmail.com",
  "password": "password",
  "name": "Nama User",
  "role": "koperasi",
  "acceptedTerms": true,
  "organizationName": "Koperasi Tani Makmur",
  "responsibleName": "Nama Penanggung Jawab",
  "address": "Alamat lengkap",
  "phone": "81234567890",
  "ktpName": "foto_ktp_penanggung_jawab.jpg",
  "documentName": "dokumen_legalitas_usaha.pdf"
}
```

Notes:

- `role` is selected by public users as `koperasi` or `supplier`.
- Admin accounts are manually created in database and not registered through public UI.
- Password must never be exposed in Admin approval UI.
- Document upload is currently represented by frontend dummy file names until upload API is finalized.

### GET `/auth/me`

Expected response fields used by frontend:

```json
{
  "koperasiId": "koperasi-id"
}
```

---

## 3. Dashboard

### GET `/dashboard`

Expected response fields used by `KoperasiDashboardScreen`:

```json
{
  "userName": "Pak Adi",
  "hematBulanIni": 2430000,
  "stokPupukKg": 8750,
  "stokCukupBulan": 2,
  "akurasiPrediksi": 94,
  "rekomendasiVolumeMind": {
    "supplierName": "PT Agro Nusa",
    "angka_kg": 12500,
    "totalCost": 68750000,
    "savingsRp": 4200000,
    "bulan_1": "Bulan Depan",
    "explanation": "Alasan rekomendasi",
    "isVolumeHack": true
  }
}
```

VolumeMind appears only on Dashboard. There is no separate AI menu and no standalone AI input form.

---

## 4. Products and Suppliers

### GET `/orders/products`

Used when creating a pool proposal from the floating plus action.

Expected minimal response:

```json
[
  {
    "id": "product-id",
    "name": "NPK Phonska"
  }
]
```

### GET `/suppliers`

Reserved for supplier list/search integration.

---

## 5. Collective Buy / Pools

### GET `/orders/pools/active`

Expected pool fields used by `CollectiveBuyScreen` and Dashboard active pool cards:

```json
[
  {
    "id": "pool-id",
    "name": "Pool NPK Bersama",
    "deadline": "2026-10-24T10:00:00.000Z",
    "deadlineAt": "2026-10-24T10:00:00.000Z",
    "currentVolumeKg": 5000,
    "targetVolumeKg": 10000,
    "status": "OPEN_FOR_KOPERASI",
    "orders": [
      {
        "koperasiId": "koperasi-id",
        "orderItems": [
          {
            "quantity": 2500
          }
        ]
      }
    ],
    "product": {
      "name": "NPK Phonska",
      "priceTiers": [
        {
          "pricePerKg": 9000
        }
      ],
      "supplier": {
        "name": "PT Agro Nusa"
      }
    }
  }
]
```

Frontend behavior:

- Pool Terbuka shows pools not joined by current koperasi.
- Pool Saya shows pools joined by current koperasi.
- Pool Saya button is `Lihat Detail`.
- Open pools button is `Gabung Pool Ini`.
- Search bar is intentionally not shown in the current mobile MVP UI.

### POST `/orders/pools`

Current frontend floating plus creates a simple proposal from the first available product.

Request:

```json
{
  "name": "Pool NPK Phonska Bersama",
  "deadline": "2026-10-31T00:00:00.000Z",
  "productId": "product-id",
  "targetVolumeKg": 20000
}
```

### POST `/orders/pools/:poolId/join`

Request:

```json
{
  "orderId": "order-id"
}
```

The current join flow first records an order through `/orders/manual`, then calls this endpoint with the returned order ID.

---

## 6. Manual Transaction Recording

### POST `/orders/manual`

Current backend request shape:

```json
{
  "jenisPupuk": "Urea",
  "quantity": 500,
  "supplierName": "Catat Pengeluaran",
  "tanggal": "2026-10-15",
  "totalPrice": 1500000
}
```

Current UI:

- has two tabs: `Catat Pengeluaran` and `Catat Pemasukan`,
- default tab is `Catat Pengeluaran`,
- input fields are `Jenis Pupuk`, `Jumlah (kg)`, `Tanggal Transaksi`, and `Total Harga`,
- there is no visible `Nama Supplier` input.

Temporary compatibility rule:

- while backend still requires `supplierName`, frontend sends an internal placeholder based on selected tab.

Recommended future backend update:

```json
{
  "jenisPupuk": "Urea",
  "quantity": 500,
  "movementType": "EXPENSE",
  "tanggal": "2026-10-15",
  "totalPrice": 1500000
}
```

Recommended enum:

```text
EXPENSE
INCOME
```

---

## 7. Audit Log

### GET `/orders/audit-logs`

Expected minimal response:

```json
[
  {
    "id": "audit-id",
    "action": "MANUAL_TRANSACTION",
    "details": "{\"jenisPupuk\":\"Urea\",\"quantity\":500,\"totalPrice\":1500000}",
    "createdAt": "2026-10-24T10:45:00.000Z"
  }
]
```

Actions currently recognized by frontend:

```text
MANUAL_TRANSACTION
CREATE_ORDER
CONFIRM_ORDER
JOIN_POOL
FINALIZE_POOL_SUCCESS
FINALIZE_POOL_FALLBACK_GRACE
```

Pool audit display rules:

- title uses `{proposing_koperasi}` when available,
- fallback title is `Koperasi Pengaju`,
- no profile picture/avatar stack,
- no `Lihat Detail` button,
- no filter chips.

### GET `/orders/export-csv?token=:token`

Used by the Export CSV button in Audit Log.

---

## 8. Error Handling

Backend error response should include:

```json
{
  "message": "Readable error message"
}
```

Frontend fallback:

```text
Terjadi kesalahan pada server
```

