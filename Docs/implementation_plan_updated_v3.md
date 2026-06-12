# Implementation Plan — VolumeMate Updated

This implementation plan reflects the revised role and pool lifecycle:

- Koperasi and Supplier must be manually approved by Admin.
- Supplier is an active account.
- Koperasi can propose pools to verified suppliers.
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
├── frontend/              # React + Vite + Tailwind
├── backend/               # NestJS + Prisma
├── ai-engine/             # Python + scikit-learn service
├── docs/
│   ├── prd_updated_v3.md
│   ├── diagram_updated_v3.md
│   ├── implementation_plan_updated_v3.md
│   └── roles_and_permissions_updated_v3.md
└── README.md
```

---

## 2. Backend Modules

### 2.1 Auth Module

Responsibilities:

- register user,
- login user,
- store role,
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
- allow Admin to approve/reject account,
- record verification decision in audit table.

Required uploaded documents:

- KTP photo,
- cooperative/supplier proof document,
- optional supporting document.

### 2.3 Koperasi Module

Responsibilities:

- manage koperasi profile,
- show dashboard metrics,
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

### 2.8 Audit Log Module

Responsibilities:

- record final pool outcomes only,
- record manual transactions,
- support filters by supplier, fertilizer type, and date range,
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
created_at
updated_at
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
supplier_name
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

## 5. Frontend Menus

## 5.1 Koperasi Navigation

```text
Home
Collective Buy
Pencatatan Transaksi
Audit Log
```

### Home

- dashboard metrics only,
- do not show final pool history,
- do not show latest transaction table.

### Collective Buy

- open pool list,
- pool detail,
- join pool,
- floating plus button to propose pool,
- optional My Pools section for unfinished pools.

### Pencatatan Transaksi

Input fields:

```text
Jenis Pupuk
Jumlah (kg)
Nama Supplier
Tanggal Transaksi
Total Harga
Simpan Transaksi
```

### Audit Log

- final pool outcomes,
- manual transaction records,
- filters,
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
Verification Requests
Approved Users
Rejected Users
User Detail
```

---

## 6. Implementation Phases

### Phase 1 — Auth & Verification

- implement role-based registration,
- upload KTP and legal proof,
- create Admin approval page,
- block unapproved accounts.

### Phase 2 — Koperasi Dashboard & Transaction Recording

- create Home dashboard,
- create Pencatatan Transaksi form,
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
- filters and export.

### Phase 7 — QA & Edge Case Testing

Test:

- unapproved accounts cannot access core menus,
- supplier cannot approve another supplier's pool,
- pool auto-declines after 7 days,
- join amount cannot exceed remaining target,
- funding deadline cancels pool,
- payment deadline cancels pool,
- successful payment triggers supplier payout,
- re-propose creates a new pool.
