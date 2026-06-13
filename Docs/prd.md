# Product Requirement Document (PRD) — VolumeMate
**Smart Procurement System untuk Koperasi Pupuk & Toko Gerai**

## 1. Executive Summary

VolumeMate is a **mobile-only web/PWA procurement app** for agricultural cooperatives that manage fertilizer purchasing. The product is designed primarily for Android/mobile browser usage in field conditions, not for desktop workflows. The system helps cooperatives compare procurement needs, create collective buying pools, record offline/manual transactions, and maintain clean audit history for completed procurement activities.

Product direction:

- The MVP interface must be designed and tested as a mobile app experience.
- Desktop-specific dashboards, sidebars, and wide-screen workflows are out of MVP scope.
- Desktop browsers may open the app for testing, but they should render the same mobile-first experience or a simple centered mobile shell, not a separate desktop product.
- All core flows must remain usable on small screens and low-end devices.
- All user-facing UI copy must be in Bahasa Indonesia for MVP.

The latest product flow uses three active roles:

1. **Koperasi**
2. **Supplier**
3. **Admin**

Both Koperasi and Supplier accounts must be manually verified by Admin before they can use the system. During registration, they must submit identity and legality proof so the platform can reduce fake accounts and prevent invalid pool proposals.

## 2. Core Problem

Koperasi often buys fertilizer without knowing the optimal volume, timing, and supplier. Supplier pricing may depend on purchase volume, while member demand is scattered across multiple cooperatives. As a result, cooperatives may purchase too early, too late, or at a non-optimal price point.

VolumeMate solves this by supporting:

- verified cooperative and supplier registration,
- AI-assisted procurement recommendation through VolumeMind,
- pool proposal and supplier approval,
- collective fund raising across cooperatives,
- transaction recording,
- payment collection through the platform,
- supplier payout after successful payment,
- final audit log for completed or failed pool outcomes.

## 3. User Roles

### 3.1 Koperasi

Koperasi is the main buyer-side user. Koperasi can:

- view dashboard summary,
- view AI forecast and recommended buy directly on the Dashboard,
- browse open collective buying pools,
- propose a new collective buying pool,
- join an existing pool with a fund amount,
- input manual procurement transactions,
- view audit logs for manual transactions and final pool outcomes,
- re-propose a failed/canceled pool when allowed.

Koperasi can only use the system after Admin approval.

### 3.2 Supplier

Supplier is an active role. Supplier can:

- view pool proposals addressed to their verified supplier account,
- accept or reject pool proposals,
- set a date-and-time deadline when accepting a pool,
- monitor accepted/on-going pools,
- view audit logs for final pool outcomes related to them.

Supplier can only use the system after Admin approval.

### 3.3 Admin

Admin verifies and manages platform users. Admin can:

- open one menu that lists all pending accounts waiting for approval,
- review all Koperasi registration inputs except password,
- review all Supplier registration inputs except password,
- approve or reject accounts,
- view uploaded identity/legal proof, including KTP photo and PDF proof document,
- monitor user status,
- ensure supplier names remain unique,
- maintain platform trust and prevent invalid users.

Admin accounts are not created through public registration. They must be manually created in the database with:

```text
role = ADMIN
status = ACTIVE
```

## 4. Registration & Manual Admin Verification

### 4.1 Required Registration Inputs

Both Koperasi and Supplier must submit:

- Gmail/email,
- password,
- role type: `KOPERASI` or `SUPPLIER`,
- accept Terms of Service,
- official Koperasi/Supplier name,
- responsible person name,
- KTP photo of responsible person,
- legal/verification PDF document proving they are a real cooperative or supplier,
- phone number/contact information.

Admin must be able to view every submitted registration field except the raw password/password hash. Admin can view:

- Gmail/email,
- selected role,
- Terms of Service acceptance status and timestamp,
- official Koperasi/Supplier name,
- responsible person name,
- phone/contact information,
- uploaded KTP photo,
- uploaded legal/verification PDF,
- registration submission timestamp,
- current approval status.

Admin must never see the user's password.

### 4.2 Registration Status

After registration, the account status becomes:

```text
PENDING_ADMIN_APPROVAL
```

The user is shown a waiting page and cannot access core features until approved.

### 4.3 Admin Decision

Admin can set account status to:

```text
ACTIVE
REJECTED
```

Only `ACTIVE` users can create, join, approve, reject, or manage pools.

### 4.4 Supplier Name Rule

Supplier name must be unique. Koperasi may type/search a supplier name when proposing a pool, but the system must resolve it to a verified `supplier_id`.

The backend must never rely only on raw supplier text. The selected supplier name must map to one active Supplier account.

## 5. Koperasi Menus

### Menu 1 — Home / Dashboard

Dashboard shows general operational summary only. It should not show successful/rejected pool history or latest transaction history in the main dashboard.

Suggested dashboard contents:

- total procurement spending summary,
- total fertilizer volume recorded,
- current active/open pool summary,
- procurement insight summary,
- latest VolumeMind recommendation summary,
- simple chart based on transaction records.

Final pool history and transaction details belong to Audit Log, not the main dashboard.

### Dashboard VolumeMind Forecast & Recommended Buy

VolumeMind is not a separate menu and does not have its own user input form. The AI recommendation appears only inside Home / Dashboard as a forecast and recommended-buy section.

Koperasi does not manually input AI parameters on a dedicated screen. VolumeMind reads available user and Koperasi data from the database, then enriches it with system data:

- Koperasi profile and location,
- member or active land profile data if available,
- saved manual procurement transactions,
- previous collective-buy pool activity and final outcomes,
- verified supplier data,
- supplier price tiers,
- inferred target usage patterns from transaction and seasonal history,
- rainfall forecast from BMKG/OpenWeather or equivalent weather API,
- planting season detected from month and location data.

VolumeMind performs two background calculations for the Dashboard:

1. **Demand forecast**  
   Estimate upcoming fertilizer demand from the Koperasi's own stored data, seasonal patterns, rainfall forecast, and historical procurement behavior.
2. **Recommended buy optimization**  
   Compare forecasted demand against supplier volume-pricing tiers. The AI may recommend rounding the purchase volume upward when a higher volume triggers a cheaper tier and lowers total cost.

Example reasoning:

```text
Forecast demand: 9,500 kg NPK for the next procurement window.
Recommended buy: 10,000 kg because the supplier discount tier starts at 10,000 kg.
Estimated saving: Rp 2,400,000 compared with buying only 9,500 kg at the normal tier.
```

#### Output Shown on Dashboard

The mobile Dashboard should show a ready-to-use procurement recommendation:

- forecasted fertilizer demand,
- selected supplier,
- recommended quantity to buy,
- estimated total cost,
- estimated saving from volume-tier optimization,
- best order window, such as 1-2 months before expected usage,
- main reason behind the recommendation.

The Koperasi can then tap:

```text
Konfirmasi Pemesanan
```

For MVP, confirmation can create a draft order/proposal using mock API data until the backend contract is finalized.

If the user's data is insufficient, the Dashboard should show:

```text
Data belum cukup untuk rekomendasi AI. Tambahkan transaksi atau data lahan terlebih dahulu.
```

### Menu 2 — Collective Buy

This menu contains collective buying activities.

Main contents:

- list of currently open pools,
- detail page for each open pool,
- join pool form,
- floating plus button to propose a new pool,
- optional "My Pools" section/filter for unfinished pools created or joined by the Koperasi.

#### Propose Pool Flow

```text
Koperasi proposes pool
↓
Koperasi selects verified supplier by unique supplier name
↓
Koperasi inputs pool details
↓
Pool goes to Supplier Pending Menu
↓
Supplier accepts/rejects
↓
If accepted, Supplier sets deadline date and time
↓
Pool opens for other cooperatives
↓
Other cooperatives join until target fund is reached
```

#### Pool Proposal Inputs

Koperasi must input:

- supplier name / selected verified supplier,
- fertilizer type,
- target volume in kg/ton,
- target fund amount,
- proposer initial fund amount,
- pool description/note,
- optional outside-discussion proof or reference,
- proposed pickup/delivery note if needed.

### Menu 3 — Pencatatan Transaksi

This menu is for manual/offline transaction recording after the cooperative buys fertilizer outside the pool flow.

Required fields:

- jenis pupuk,
- jumlah in kg,
- nama supplier,
- tanggal transaksi,
- total harga,
- button: `Simpan Transaksi`.

After saving:

- the transaction is stored in the database,
- dashboard metrics are updated,
- transaction history becomes available for reporting,
- the data can feed future demand forecasting and procurement insight,
- the saved transaction is included in Audit Log transaction records.

### Menu 4 — Audit Log

Audit Log contains records that are already final, not unfinished processes.

Koperasi Audit Log contains:

1. **Manual transaction records** from Menu 3.
2. **Final pool outcomes**:
   - declined by supplier,
   - auto-declined because supplier did not act within 7 days,
   - canceled because target fund was not reached before deadline,
   - canceled because payment was not completed within 24 hours after target was reached,
   - success after all payments were submitted and supplier payout was processed.

Audit Log should not include:

- newly created pending proposals,
- open/on-going pools,
- accepted pools that are still funding,
- re-proposed draft process that is not final.

## 6. Supplier Menus

### Menu 1 — Pool Management

Supplier has one main pool management menu with two switch tabs:

```text
Pending Menu (pending_menu_count)
On-going Menu (on_going_count)
```

#### Pending Menu

Contains pool proposals that:

- are addressed to the supplier,
- have not been accepted or rejected,
- are still within 7 days after proposal creation.

If a pool remains pending for 7 full days, then when it reaches the 8th day, the system automatically marks it as declined/expired.

Auto status:

```text
AUTO_DECLINED_NO_SUPPLIER_RESPONSE
```

Supplier can:

- view proposal detail,
- accept proposal,
- reject proposal.

Proposal detail should show:

- proposing Koperasi name,
- fertilizer type,
- target fund,
- target volume,
- proposer initial fund,
- remaining fund needed,
- submitted notes/proof,
- proposed delivery/pickup note if any,
- date proposed.

#### Supplier Accept Flow

When Supplier accepts a proposal, Supplier must input:

- deadline date,
- deadline time.

After Supplier accepts and sets deadline, the pool status becomes:

```text
ACCEPTED
OPEN_FOR_KOPERASI
```

Other cooperatives can now join until the target fund is reached or the deadline passes.

#### On-going Menu

Contains pools that were accepted by the supplier and are not final yet, including:

- open funding pools,
- target reached pools waiting for payment,
- payment processing pools.

### Menu 2 — Supplier Audit Log

Supplier Audit Log only contains final pool outcomes:

- declined by Supplier,
- auto-declined because Supplier did not accept/reject within 7 days,
- canceled due to target fund not reached before deadline,
- canceled due to incomplete payment within 24 hours,
- success after all payments were submitted and supplier payout was processed.

Supplier Audit Log should not contain:

- pending proposals,
- open/on-going pools,
- accepted but unfinished pools,
- re-propose attempts that are still pending.

## 7. Pool Lifecycle

### 7.1 Core Statuses

Recommended statuses:

```text
PENDING_SUPPLIER_APPROVAL
DECLINED_BY_SUPPLIER
AUTO_DECLINED_NO_SUPPLIER_RESPONSE
ACCEPTED
OPEN_FOR_KOPERASI
TARGET_REACHED
PAYMENT_WAITING
PAYMENT_FAILED_CANCELED
FUNDING_DEADLINE_CANCELED
SUCCESS
REPROPOSED_FROM_FAILED_POOL
```

### 7.2 Lifecycle Flow

```text
Koperasi proposes pool
↓
PENDING_SUPPLIER_APPROVAL
↓
Supplier accepts + sets deadline OR rejects
↓
If rejected → DECLINED_BY_SUPPLIER → Audit Log
↓
If no response after 7 days → AUTO_DECLINED_NO_SUPPLIER_RESPONSE → Audit Log
↓
If accepted → OPEN_FOR_KOPERASI
↓
Other cooperatives join by contributing fund
↓
System prevents total fund from exceeding target fund
↓
If target fund not reached by supplier deadline → FUNDING_DEADLINE_CANCELED
↓
Main Koperasi can cancel permanently or re-propose
↓
If target fund reached → PAYMENT_WAITING
↓
All cooperatives must submit payment within 24 hours
↓
If one or more payments fail/not submitted → PAYMENT_FAILED_CANCELED
↓
Main Koperasi can cancel permanently or re-propose
↓
If all payments submitted → platform transfers money to supplier minus platform tax/fee
↓
SUCCESS
```

## 8. Join Pool Rule

A cooperative can join an open pool only if the contribution does not make total pool fund exceed target fund.

Backend validation:

```text
current_pool_fund + join_amount <= target_fund
```

If the input amount exceeds remaining fund, the system must reject it and show:

```text
Maximum contribution allowed: Rp{remaining_amount}
```

## 9. Payment Rule

After a pool reaches the target fund:

1. The pool enters `PAYMENT_WAITING`.
2. Each participating Koperasi must transfer their proposed fund amount to the platform.
3. Payment is considered submitted only if the transfer to the platform succeeds.
4. The payment window is 24 hours.
5. If all payments are submitted within 24 hours, the system automatically transfers the pooled money to the Supplier after deducting platform tax/fee.
6. After supplier payout is processed, the pool becomes `SUCCESS`.
7. If at least one participant does not complete payment within 24 hours, the pool becomes `PAYMENT_FAILED_CANCELED`.

For MVP simulation, payment can be represented by a successful payment status or mock payment gateway confirmation.

## 10. Re-propose Rule

If a pool fails because:

- target fund is not reached before supplier deadline, or
- one or more payments are not submitted within 24 hours,

the main Koperasi can choose:

```text
Cancel Pool
Re-propose Pool
```

Re-propose must create a new pool record and must go through Supplier approval again.

Participants from the old pool are not automatically carried over. They must join the new pool again if they still want to participate.

## 11. Audit Log Rule

Only final outcomes are written to pool audit log:

```text
DECLINED_BY_SUPPLIER
AUTO_DECLINED_NO_SUPPLIER_RESPONSE
FUNDING_DEADLINE_CANCELED
PAYMENT_FAILED_CANCELED
SUCCESS
```

Unfinished statuses are not shown in Audit Log:

```text
PENDING_SUPPLIER_APPROVAL
ACCEPTED
OPEN_FOR_KOPERASI
TARGET_REACHED
PAYMENT_WAITING
```

## 12. Business Model Update

VolumeMate can use a transaction-fee model for successful collective buying.

When a pool reaches success:

```text
Total participant payments
- platform tax/fee
= supplier payout
```

The platform fee is deducted before supplier payout.

Optional future paid features:

- AI procurement insight,
- demand forecasting,
- supplier analytics,
- advanced audit exports.
