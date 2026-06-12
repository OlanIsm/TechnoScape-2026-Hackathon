# Roles and Permissions — VolumeMate Updated

This document defines the final role behavior for VolumeMate after the latest revision.

Product UI direction:

- VolumeMate MVP is mobile-only.
- Role menus must be designed for phone-sized screens and bottom navigation.
- Desktop-specific menus, sidebars, and wide-screen dashboards are not part of MVP.
- Desktop browsers may be used for development/testing, but they should not define a separate product experience.

Roles:

1. Koperasi
2. Supplier
3. Admin

---

## 1. Shared Registration Rule

Koperasi and Supplier cannot directly use the system after registration.

They must submit:

- official organization/business name,
- responsible person name,
- KTP photo,
- legal/proof document,
- phone/contact information.

After registration:

```text
status = PENDING_ADMIN_APPROVAL
```

Admin must manually approve them before they become active.

Only users with:

```text
status = ACTIVE
```

can use app features.

---

## 2. Koperasi Role

### 2.1 Main Purpose

Koperasi uses VolumeMate to:

- monitor procurement dashboard,
- request VolumeMind AI procurement recommendation,
- create collective buying pool proposals,
- join open collective buying pools,
- input manual procurement transactions,
- view final audit history.

### 2.2 Koperasi Menus

```text
Menu 1: Home
Menu 2: VolumeMind Recommendation
Menu 3: Collective Buy
Menu 4: Pencatatan Transaksi
Menu 5: Audit Log
```

---

### Menu 1 — Home

Home contains dashboard summary only.

Allowed contents:

- total procurement spending,
- total fertilizer volume recorded,
- chart/insight from transaction data,
- active/open pool summary.

Do not put these in Home:

- successful pool history,
- rejected pool history,
- detailed latest transaction table.

Those belong to Audit Log.

---

### Menu 2 — VolumeMind Recommendation

This menu helps Koperasi generate an AI-assisted procurement plan with minimal user input.

Koperasi inputs only:

```text
Jenis Pupuk
Tanggal Penggunaan / Bulan Target
Luas Lahan Aktif (Hektar)
```

The system automatically prepares:

```text
Curah hujan dari API cuaca
Musim tanam berdasarkan bulan target
Tier harga supplier
Histori transaksi koperasi
Lokasi koperasi
```

VolumeMind then:

1. predicts fertilizer demand,
2. compares supplier price tiers,
3. recommends the best purchase quantity,
4. estimates savings from volume-tier optimization,
5. suggests the best ordering window before the usage month.

Recommended output:

```text
Supplier Terpilih
Jumlah yang Harus Dibeli
Total Biaya
Potensi Hemat
Waktu Pemesanan Terbaik
Alasan Rekomendasi
Konfirmasi Pemesanan
```

---

### Menu 3 — Collective Buy

This menu is for all collective buying activity.

Koperasi can:

- view currently open pools,
- join an open pool,
- see pool detail,
- propose a new pool using floating plus button,
- view unfinished pools it created or joined, if needed.

#### Propose Pool Flow

```text
Click plus button
↓
Select verified supplier by unique supplier name
↓
Input pool details
↓
Submit proposal
↓
Pool waits for supplier approval
```

#### Required Inputs for Proposing Pool

```text
Supplier name / selected supplier
Jenis pupuk
Target volume
Target fund
Initial fund from proposer
Optional note/proof
```

#### Join Pool Rule

Koperasi can join an open pool only if:

```text
current_committed_fund + join_amount <= target_fund
```

If the amount exceeds remaining target, the system rejects the join request.

---

### Menu 4 — Pencatatan Transaksi

This menu is for recording manual/offline purchases.

Required fields:

```text
Jenis Pupuk
Jumlah (kg)
Nama Supplier
Tanggal Transaksi
Total Harga
```

After clicking:

```text
Simpan Transaksi
```

the system:

- stores the transaction,
- calculates price per kg,
- updates dashboard data,
- saves historical procurement data,
- includes the transaction in audit/reporting records.

---

### Menu 5 — Audit Log

Koperasi Audit Log displays final records only.

It can include:

1. Manual transactions from Pencatatan Transaksi.
2. Final pool statuses:
   - declined by supplier,
   - auto-declined after 7 days without supplier response,
   - canceled because target fund was not reached before deadline,
   - canceled because payment was incomplete within 24 hours,
   - success after all payments were submitted and payout was sent to supplier.

It should not include:

- newly created pending proposal,
- open funding pool,
- accepted but unfinished pool,
- on-going payment window,
- re-propose process that is not final.

---

## 3. Supplier Role

### 3.1 Main Purpose

Supplier uses VolumeMate to:

- review pool proposals addressed to them,
- accept or reject pool proposals,
- set pool deadline when accepting,
- monitor accepted/on-going pools,
- view final pool audit history.

### 3.2 Supplier Menus

```text
Menu 1: Pool Management
Menu 2: Audit Log
```

---

### Menu 1 — Pool Management

Pool Management contains two switch tabs:

```text
Pending Menu (count)
On-going Menu (count)
```

#### Pending Menu

Pending Menu contains pool proposals that:

- are addressed to this supplier,
- have not been accepted/rejected,
- are not older than 7 days.

When opening a pending proposal, Supplier can see:

```text
Koperasi proposer name
Jenis pupuk
Target volume
Target fund
Proposer initial fund
Remaining fund needed
Proposal note/proof
Date proposed
```

Supplier can:

```text
Accept
Reject
```

If Supplier accepts, they must input:

```text
deadline date
deadline time
```

After accept:

```text
status = ACCEPTED / OPEN_FOR_KOPERASI
```

If Supplier rejects:

```text
status = DECLINED_BY_SUPPLIER
```

If Supplier does nothing for 7 days, on the 8th day:

```text
status = AUTO_DECLINED_NO_SUPPLIER_RESPONSE
```

#### On-going Menu

On-going Menu contains accepted pools that are not final.

Examples:

```text
OPEN_FOR_KOPERASI
TARGET_REACHED
PAYMENT_WAITING
```

---

### Menu 2 — Audit Log

Supplier Audit Log only shows final pool outcomes:

```text
DECLINED_BY_SUPPLIER
AUTO_DECLINED_NO_SUPPLIER_RESPONSE
FUNDING_DEADLINE_CANCELED
PAYMENT_FAILED_CANCELED
SUCCESS
```

Supplier Audit Log does not show:

```text
PENDING_SUPPLIER_APPROVAL
ACCEPTED
OPEN_FOR_KOPERASI
TARGET_REACHED
PAYMENT_WAITING
```

---

## 4. Admin Role

### 4.1 Main Purpose

Admin maintains platform trust and verifies users.

### 4.2 Admin Menus

Suggested menus:

```text
Verification Requests
Approved Users
Rejected Users
User Detail
```

### 4.3 Admin Permissions

Admin can:

- view new Koperasi registration requests,
- view new Supplier registration requests,
- open uploaded KTP and legal documents,
- approve accounts,
- reject accounts,
- view verification history,
- suspend abusive or invalid accounts if needed.

Admin should not be required to manage every pool manually. Pool process is handled by Koperasi and Supplier after they are verified.

---

## 5. Permission Matrix

| Feature | Koperasi | Supplier | Admin |
|---|---:|---:|---:|
| Register account | Yes | Yes | No |
| Upload KTP/legal proof | Yes | Yes | No |
| Approve/reject account | No | No | Yes |
| View dashboard | Yes | Limited/no | Optional |
| Propose pool | Yes | No | No |
| Select supplier for pool | Yes | No | No |
| Accept/reject pool proposal | No | Yes | No |
| Set pool deadline | No | Yes | No |
| View open pools | Yes | Optional | Optional |
| Join open pool | Yes | No | No |
| Input manual transaction | Yes | No | No |
| View pending pool requests | No | Yes | Optional |
| View on-going supplier pools | No | Yes | Optional |
| Submit payment | Yes | No | No |
| Receive payout | No | Yes | No |
| View koperasi audit log | Yes | No | Optional |
| View supplier audit log | No | Yes | Optional |
| Export audit records | Yes | Yes | Optional |
| Request VolumeMind recommendation | Yes | No | Optional |

---

## 6. Pool Lifecycle Permissions

### Create Proposal

Only verified Koperasi can create pool proposals.

```text
user.role == KOPERASI
user.status == ACTIVE
```

### Supplier Decision

Only the selected verified Supplier can accept/reject the proposal.

```text
user.role == SUPPLIER
user.status == ACTIVE
pool.supplier_id == current_supplier.id
```

### Join Pool

Only verified Koperasi can join open pools.

```text
user.role == KOPERASI
user.status == ACTIVE
pool.status == OPEN_FOR_KOPERASI
current_fund + join_amount <= target_fund
```

### Submit Payment

Only pool participants can submit payment.

```text
participant.koperasi_id == current_koperasi.id
pool.status == PAYMENT_WAITING
payment window is not expired
```

### Supplier Payout

System triggers payout automatically when:

```text
all participant payments == SUCCESS
```

Payout amount:

```text
supplier_payout = total_collected_payment - platform_tax_or_fee
```

---

## 7. Important Product Decisions

### 7.0 Mobile-Only MVP

VolumeMate MVP is built as a mobile-only web/PWA app. The product should not require or imply a desktop dashboard, desktop sidebar, or wide-screen workflow. All important features must work comfortably on a phone.

### 7.1 Supplier Does Not Create Offers

In this version, Supplier does not need to create product offers first. Koperasi can propose a pool to a verified Supplier based on outside discussion or intended procurement plan.

### 7.2 Supplier Must Approve Before Pool Opens

A pool cannot be joined by other cooperatives until the selected Supplier accepts it and sets a deadline.

### 7.3 Supplier Deadline Controls Funding Period

The funding deadline is set by Supplier during acceptance, not by Koperasi.

### 7.4 Audit Log Shows Final Outcomes

Audit Log should not act like a real-time task tracker. It stores final history and manual transaction records.

### 7.5 Re-propose Creates a New Pool

Re-proposed pools are new records. Old participants must join again if they still want to participate.

### 7.6 No Mute Feature in MVP

Supplier mute/spam prevention is removed from the MVP scope. The product assumes verified cooperatives will not spam suppliers. Abuse handling can be future improvement.
