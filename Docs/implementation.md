# Implementation Plan — VolumeMate Updated

This implementation plan reflects the revised role and pool lifecycle:

- VolumeMate MVP is a mobile-only web/PWA app.
- No separate desktop UI, desktop sidebar, or desktop dashboard is planned for MVP.
- Desktop browsers are only acceptable as development/test hosts for the same mobile-first app shell.
- All user-facing UI copy must use Bahasa Indonesia.
- Koperasi and Supplier must be manually approved by Admin.
- Admin accounts are manually created in the database, not through public registration.
- Supplier is an active account.
- Koperasi can propose pools to verified suppliers.
- Koperasi sees VolumeMind AI forecast and recommended buy directly on the Dashboard.
- Supplier accepts/rejects pool proposals.
- Supplier sets deadline after accepting.
- Other cooperatives can join only after supplier acceptance.
- Payment is collected by the platform first.
- Supplier payout is sent after all payments are submitted, minus platform tax/fee.
- Audit Log only records final outcomes.

---

## 1. Recommended Monorepo Structure

```text
volumemate/
├── frontend/              # React + Vite mobile-only PWA
├── backend/               # NestJS + Prisma
├── VolumeMind/            # AI/model artifact area
├── Docs/
│   ├── api_contract.md
│   ├── diagram.md
│   ├── frontend_structure.md
│   ├── implementation.md
│   ├── prd.md
│   ├── roles_and_permissions.md
│   └── volumemind_integration_flow.md
└── README.md
```

---

## 2. Backend Modules

### 2.1 Auth Module

Responsibilities:

- register user,
- login user,
- store role,
- require Gmail/email, password, selected role, and Terms of Service acceptance for Koperasi/Supplier registration,
- block unapproved users from core features,
- allow only `ACTIVE` accounts to use protected routes.

Roles:

```text
KOPERASI
SUPPLIER
ADMIN
```

Account statuses:

```text
PENDING_ADMIN_APPROVAL
ACTIVE
REJECTED
SUSPENDED
```

### 2.2 Verification Module

Responsibilities:

- receive KTP photo and legal proof document,
- store uploaded document metadata,
- allow Admin to view all pending registration submissions except password,
- allow Admin to open uploaded KTP photo and legal/proof PDF,
- allow Admin to approve/reject account from the pending account list,
- record verification decision in audit table.

Required uploaded documents:

- KTP photo,
- cooperative/supplier proof PDF document,
- optional supporting document.

### 2.3 Koperasi Module

Responsibilities:

- manage koperasi profile,
- show dashboard metrics,
- receive Dashboard VolumeMind forecast and recommended-buy output,
- create pool proposals,
- join open pools,
- input manual transactions,
- view audit logs.

### 2.4 Supplier Module

Responsibilities:

- manage supplier profile,
- ensure supplier name uniqueness,
- show pending pool proposals,
- accept/reject pool proposal,
- set deadline when accepting,
- show on-going accepted pools,
- view supplier audit logs.

### 2.5 Pool Module

Responsibilities:

- create pool proposal,
- validate selected supplier,
- manage pool status lifecycle,
- validate join amount,
- handle funding deadline,
- handle re-propose,
- write final outcomes to audit log.

### 2.6 Payment Module

Responsibilities:

- start 24-hour payment window after target fund is reached,
- receive payment status from payment gateway/mock payment,
- mark payment as submitted only after successful transfer to platform,
- check whether all payments are submitted,
- trigger supplier payout after all payments are submitted,
- deduct platform tax/fee before supplier payout,
- cancel pool if one or more payments are not submitted within 24 hours.

### 2.7 Transaction Recording Module

Responsibilities:

- save manual transaction input from Koperasi,
- calculate price per kg,
- update dashboard metrics,
- provide historical data for VolumeMind,
- expose transaction audit records.

### 2.8 VolumeMind Dashboard Recommendation Module

Responsibilities:

- run when the Koperasi Dashboard is opened/refreshed or from a scheduled background job,
- read Koperasi/user records from the database,
- fetch cooperative location/profile data needed for weather lookup,
- fetch rainfall forecast from BMKG/OpenWeather or a mock provider during MVP,
- detect planting season from month and location data,
- read supplier price tiers, manual transactions, pool history, and profile data,
- predict recommended fertilizer demand for the Dashboard,
- optimize purchase volume against supplier price tiers,
- return a ready-to-use procurement recommendation for the Dashboard.

Input sources from database/system:

```text
Koperasi profile
Koperasi location
member/active land profile data if available
manual procurement transactions
previous collective-buy pool outcomes
verified supplier data
supplier price tiers
rainfall_forecast_mm
planting_season
```

Recommended output:

```text
forecasted_fertilizer_demand_kg
selected_supplier
recommended_purchase_quantity_kg
estimated_total_cost
estimated_saving_amount
best_order_window
recommendation_reason
```

VolumeMind must not be exposed as a separate menu or standalone input form in the MVP.

### 2.9 Audit Log Module

Responsibilities:

- record final pool outcomes only,
- record manual transactions,
- support simple list display and export,
- export audit records to CSV/Excel/PDF if needed.

---

## 3. Database Schema Recommendation

### 3.1 User

```text
id
email
password_hash
role: KOPERASI | SUPPLIER | ADMIN
status: PENDING_ADMIN_APPROVAL | ACTIVE | REJECTED | SUSPENDED
terms_accepted_at nullable
created_at
updated_at
```

Admin creation rule:

```text
Admin users are inserted manually into the database with role = ADMIN and status = ACTIVE.
Admin cannot register through the public registration form.
```

### 3.2 VerificationDocument

```text
id
user_id
document_type: KTP | LEGAL_PROOF | SUPPORTING
file_url
status: PENDING | APPROVED | REJECTED
uploaded_at
reviewed_at
reviewed_by_admin_id
rejection_reason
```

Admin review screen must show document file metadata and preview/open links for KTP image and PDF proof document. It must not show raw password or password hash.

### 3.3 KoperasiProfile

```text
id
user_id
koperasi_name
responsible_person_name
phone_number
address
created_at
```

### 3.4 SupplierProfile

```text
id
user_id
supplier_name UNIQUE
responsible_person_name
phone_number
address
created_at
```

### 3.5 Pool

```text
id
creator_koperasi_id
supplier_id
fertilizer_type
target_volume_kg
target_fund_amount
creator_initial_fund_amount
current_committed_fund_amount
status
supplier_deadline_at
supplier_decision_at
created_at
updated_at
reproposed_from_pool_id nullable
notes
```

### 3.6 PoolParticipant

```text
id
pool_id
koperasi_id
committed_fund_amount
payment_status: NOT_STARTED | WAITING_PAYMENT | SUBMITTED | FAILED
payment_submitted_at
created_at
```

### 3.7 Payment

```text
id
pool_id
payer_koperasi_id
amount
status: PENDING | SUCCESS | FAILED | EXPIRED
payment_gateway_reference
submitted_at
created_at
```

### 3.8 SupplierPayout

```text
id
pool_id
supplier_id
gross_amount
platform_fee_amount
net_payout_amount
status: PENDING | SENT | FAILED
sent_at
created_at
```

### 3.9 ManualTransaction

```text
id
koperasi_id
fertilizer_type
quantity_kg
movement_type: EXPENSE | INCOME
supplier_name nullable / legacy compatibility
transaction_date
total_price
price_per_kg
created_at
```

### 3.10 PoolAuditLog

```text
id
pool_id
actor_user_id nullable
event_type
event_description
metadata_json
created_at
```

Recommended final audit event types:

```text
DECLINED_BY_SUPPLIER
AUTO_DECLINED_NO_SUPPLIER_RESPONSE
FUNDING_DEADLINE_CANCELED
PAYMENT_FAILED_CANCELED
SUCCESS
REPROPOSED
```

---

## 4. Key Backend Rules

### 4.1 Account Approval Rule

Only active accounts can use app features:

```text
user.status == ACTIVE
```

### 4.2 Supplier Selection Rule

Koperasi selects supplier by unique supplier name. Backend resolves it to `supplier_id`.

Required validation:

```text
supplier exists
supplier.status == ACTIVE
supplier_name is unique
```

### 4.3 Supplier Approval Rule

Only the selected supplier can accept or reject the pool:

```text
current_user.role == SUPPLIER
current_supplier.id == pool.supplier_id
pool.status == PENDING_SUPPLIER_APPROVAL
```

### 4.4 Supplier Deadline Rule

Supplier must set deadline date and time when accepting a pool.

```text
deadline_at > now()
```

After supplier accepts:

```text
pool.status = OPEN_FOR_KOPERASI
pool.supplier_deadline_at = supplier_input_deadline
```

### 4.5 Auto Decline Rule

If a pool stays pending for more than 7 days:

```text
pool.status = AUTO_DECLINED_NO_SUPPLIER_RESPONSE
```

The pool is written to audit log.

### 4.6 Join Pool Fund Rule

A cooperative cannot join with an amount that exceeds remaining target fund.

```text
current_committed_fund + join_amount <= target_fund_amount
```

### 4.7 Funding Deadline Rule

If supplier deadline passes before target fund is reached:

```text
pool.status = FUNDING_DEADLINE_CANCELED
```

Main Koperasi can then:

```text
Cancel permanently
Re-propose as a new pool
```

### 4.8 Payment Window Rule

When target fund is reached:

```text
pool.status = PAYMENT_WAITING
payment_deadline_at = now() + 24 hours
```

Every participant must submit payment successfully to the platform.

Payment is considered submitted only when the platform receives successful transfer confirmation.

### 4.9 Supplier Payout Rule

If all participants submit payment within 24 hours:

```text
gross_amount = total participant payments
platform_fee_amount = configured tax/fee
net_payout_amount = gross_amount - platform_fee_amount
transfer net_payout_amount to supplier
pool.status = SUCCESS
```

### 4.10 Payment Failure Rule

If one or more participants do not pay within 24 hours:

```text
pool.status = PAYMENT_FAILED_CANCELED
```

Main Koperasi can then:

```text
Cancel permanently
Re-propose as a new pool
```

### 4.11 Re-propose Rule

Re-propose creates a new pool, not editing the old one.

```text
new_pool.reproposed_from_pool_id = old_pool.id
new_pool.status = PENDING_SUPPLIER_APPROVAL
```

Old participants are not automatically carried over.

---

## 5. Frontend Menus and UI Target

The frontend is **mobile-only** for MVP.

Rules:

- Build screens for phone-sized viewports first.
- Use bottom navigation and mobile app patterns.
- Do not design or implement separate desktop dashboards, desktop sidebars, or wide-screen-only workflows.
- On desktop browsers, center or constrain the same mobile app shell for development/testing.
- Keep the interface lightweight for low-end phones and unstable network conditions.

## 5.1 Koperasi Navigation

```text
Home
Collective Buy
Pencatatan Transaksi
Audit Log
```

### Home

- dashboard metrics only,
- VolumeMind forecast and recommended-buy section,
- no separate AI input form,
- do not show final pool history,
- do not show latest transaction table.

VolumeMind data is read from the user's database records and supporting services:

```text
Profil koperasi
Lokasi koperasi
Data lahan anggota jika tersedia
Histori transaksi koperasi
Histori hasil pool
Curah hujan dari API cuaca
Musim tanam
Tier harga supplier
```

Dashboard VolumeMind output:

```text
Prediksi kebutuhan pupuk
Supplier Terpilih
Jumlah yang Harus Dibeli
Total Biaya
Potensi Hemat
Waktu Pemesanan Terbaik
Alasan Rekomendasi
Konfirmasi Pemesanan
```

### Collective Buy

- open pool list,
- pool detail,
- join pool,
- floating plus button to propose pool,
- optional My Pools section for unfinished pools.

### Pencatatan Transaksi

Current UI uses a two-tab switch:

```text
Catat Pengeluaran
Catat Pemasukan
```

Default tab:

```text
Catat Pengeluaran
```

Both tabs use the same input fields:

```text
Jenis Pupuk
Jumlah (kg)
Tanggal Transaksi
Total Harga
Simpan Transaksi
```

The current frontend does not show a `Nama Supplier` input in this screen. While the existing backend endpoint still accepts/requires `supplierName`, the frontend may pass an internal placeholder derived from the selected tab.

### Audit Log

- final pool outcomes,
- manual transaction records,
- no filter chips in the current mobile MVP UI,
- no profile pictures/avatar stack in pool history cards,
- no `Lihat Detail` button for pool history cards,
- pool history card title uses `{proposing_koperasi}`,
- export if needed.

## 5.2 Supplier Navigation

```text
Pool Management
Audit Log
```

### Pool Management

Two switch tabs:

```text
Pending Menu (count)
On-going Menu (count)
```

Pending Menu:

- pool proposals waiting for supplier accept/reject.

On-going Menu:

- accepted/open pools,
- funding pools,
- payment-waiting pools.

### Audit Log

Final outcomes only:

- declined,
- auto-declined,
- canceled,
- success.

## 5.3 Admin Navigation

```text
Pending Account Approval
```

Admin MVP has only one menu. The screen lists all accounts with:

```text
status = PENDING_ADMIN_APPROVAL
role in KOPERASI, SUPPLIER
```

Admin can open each pending account and review:

```text
Gmail/email
Selected role
Terms of Service acceptance status and timestamp
Official organization/business name
Responsible person name
Phone/contact information
KTP photo
Legal/proof PDF document
Registration timestamp
```

Password and password hash must never be shown.

---

## 6. Implementation Phases

### Phase 1 — Auth & Verification

- implement role-based registration,
- require Gmail/email, password, selected role, and Terms of Service acceptance,
- upload KTP and legal proof,
- create one Admin pending account approval page,
- ensure Admin can review all registration inputs except password,
- seed or manually insert Admin account in database,
- block unapproved accounts.

### Phase 2 — Koperasi Dashboard & Transaction Recording

- create Home dashboard,
- create Dashboard VolumeMind forecast and recommended-buy section,
- connect Dashboard recommendation section to mock AI/service data until API contract is finalized,
- create Pencatatan Transaksi form with `Catat Pengeluaran` and `Catat Pemasukan` tabs,
- store manual transactions,
- update dashboard metrics.

### Phase 3 — Supplier Pool Approval

- create supplier pending menu,
- create accept/reject action,
- supplier deadline input,
- auto-decline after 7 days.

### Phase 4 — Collective Buy

- create open pool list,
- create propose pool flow with supplier selection,
- create join pool validation,
- enforce no overfunding.

### Phase 5 — Payment Flow

- target reached detection,
- 24-hour payment window,
- payment submitted status,
- payout to supplier minus platform tax/fee,
- payment failure cancellation.

### Phase 6 — Audit Log & Export

- final pool audit log,
- transaction audit table,
- supplier audit log,
- export.

### Phase 7 — QA & Edge Case Testing

Test:

- mobile viewport usability for all core flows,
- no required desktop-only interaction exists,
- unapproved accounts cannot access core menus,
- supplier cannot approve another supplier's pool,
- pool auto-declines after 7 days,
- join amount cannot exceed remaining target,
- funding deadline cancels pool,
- payment deadline cancels pool,
- successful payment triggers supplier payout,
- re-propose creates a new pool.
