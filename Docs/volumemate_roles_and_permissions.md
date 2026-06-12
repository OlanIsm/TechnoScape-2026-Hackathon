# VolumeMate — Roles & Permissions Specification

**Purpose:** This document defines the full role behavior for the three main roles in the VolumeMate application: **Koperasi**, **Supplier**, and **Admin**.

**Recommended usage:** Add this file as a new documentation file, for example:

```text
docs/roles_and_permissions.md
```

Then update `prd.md` section **3. Profil Pengguna (User Persona)** to reference this document, because the current role model has evolved from a passive supplier model into an active three-role system.

---

## 1. Role Model Overview

VolumeMate uses three main roles:

| Role | Main Function | Main Goal |
|---|---|---|
| **Koperasi** | Buyer / cooperative procurement user | Manage demand, compare supplier offers, create or join collective buying pools, confirm purchases, and export reports. |
| **Supplier** | Fertilizer provider / seller | Publish product offers, manage volume-based price tiers, respond to pool requests, confirm availability, and track confirmed orders. |
| **Admin** | Platform operator / system supervisor | Verify accounts, manage platform data, monitor transactions, handle disputes, and maintain system trust. |

The three roles should not have the same dashboard. Each role needs a different main menu because each role has a different job-to-be-done.

---

## 2. Role 1 — Koperasi

### 2.1 Role Description

**Koperasi** is the main user of VolumeMate. This role represents the cooperative admin, procurement manager, or staff member responsible for managing fertilizer purchasing decisions.

The Koperasi role uses VolumeMate to turn scattered member demand into structured procurement decisions. Instead of manually guessing when to buy, how much to buy, and which supplier to choose, the Koperasi user can compare price tiers, use AI recommendations, join collective buying pools, and export transaction data.

### 2.2 Main Responsibilities

Koperasi is responsible for:

1. Managing cooperative profile and basic information.
2. Recording fertilizer demand from members.
3. Monitoring current stock and purchase needs.
4. Viewing supplier products and volume-based price tiers.
5. Using VolumeMind recommendations to decide the best buying option.
6. Creating or joining collective buying pools.
7. Confirming participation in a collective purchase.
8. Reviewing split billing and distribution allocation.
9. Tracking order status and transaction history.
10. Exporting transaction records into CSV, Excel, or PDF.
11. Reviewing audit logs for transparency and reporting.

### 2.3 Key Features Accessible by Koperasi

#### A. Dashboard

Koperasi can view:

- Total fertilizer demand submitted by members.
- Current purchase volume.
- Current stock level.
- Nearby supplier price tiers.
- Potential savings from reaching higher volume tiers.
- Active collective buying pools.
- Pending confirmations.
- Recent transactions.
- Exportable reports.

#### B. Demand Management

Koperasi can:

- Input fertilizer demand manually.
- Import demand from CSV if needed.
- Group demand by product type, quantity, and expected usage date.
- Edit demand before it is attached to a confirmed order.
- Lock demand once it is submitted into a confirmed pool.

Koperasi should not be able to edit demand after order confirmation unless they create a correction record in the audit log.

#### C. Supplier Price Viewing

Koperasi can:

- View active suppliers.
- View available fertilizer products.
- View supplier price tiers.
- Compare suppliers based on volume, price per unit, total price, and quote validity.
- See whether a quote is verified, expired, or pending confirmation.

Koperasi should not be able to directly change supplier price tiers. Price data should be created by Supplier or verified by Admin.

#### D. VolumeMind Recommendation

Koperasi can request recommendations from VolumeMind.

VolumeMind should recommend:

- Best purchase volume.
- Best supplier.
- Best timing.
- Estimated total cost.
- Estimated savings.
- Whether the cooperative should buy alone or join/create a pool.

Example recommendation output:

```text
Recommended Action: Join Collective Pool
Product: Urea Fertilizer
Current Demand: 2 tons
Target Tier: 5 tons
Recommended Supplier: Supplier A
Estimated Saving: Rp 1.200.000
Reason: Current demand is below the cheapest price tier. Joining a pool can unlock better bulk pricing.
```

#### E. Collective Buying Pool

Koperasi can:

- Create a collective buying pool.
- Join an existing pool.
- Add demand volume to a pool.
- View pool target volume.
- View pool progress.
- View participating cooperatives.
- View estimated price if target is reached.
- View fallback price if target is not reached.
- Confirm or cancel participation before hard confirmation.

Recommended commitment flow:

| Status | Meaning |
|---|---|
| **Draft** | Pool is created but not open yet. |
| **Open** | Other cooperatives can join. |
| **Soft Committed** | Koperasi shows interest but has not finalized participation. |
| **Target Reached** | Pool volume reaches the required supplier tier. |
| **Hard Confirmation Required** | Participants must confirm final participation. |
| **Confirmed** | Order is locked and ready to be sent to supplier. |
| **Cancelled** | Pool is cancelled due to insufficient volume or participant withdrawal. |

#### F. Split Billing & Distribution

Koperasi can view:

- Their own volume contribution.
- Their own cost share.
- Platform fee if applicable.
- Delivery / logistics cost if applicable.
- Distribution guidance.

Koperasi should only see detailed billing for its own cooperative. It may see aggregate pool totals, but not sensitive financial data of other cooperatives.

#### G. Transaction History & Export

Koperasi can:

- View confirmed purchases.
- Filter transactions by date, supplier, product, status, and pool ID.
- Export transaction history into CSV.
- Export report into PDF or Excel if implemented.
- Use exported data for internal reports, stakeholder reports, and financing documentation.

CSV export should include:

```text
transaction_id
order_date
koperasi_name
supplier_name
product_name
quantity
unit_price
total_price
pool_id
order_status
created_by
confirmed_at
```

### 2.4 Data Visibility for Koperasi

Koperasi can see:

- Its own cooperative profile.
- Its own member demand.
- Its own stock and transaction history.
- Public or verified supplier offers.
- Aggregate collective pool information.
- Its own cost allocation in split billing.
- Audit logs related to its own transactions.

Koperasi cannot see:

- Other cooperatives' private member data.
- Other cooperatives' internal financial records.
- Supplier internal account information.
- Admin-only platform logs.
- Transaction details unrelated to its cooperative unless displayed as aggregate pool data.

---

## 3. Role 2 — Supplier

### 3.1 Role Description

**Supplier** is the seller or fertilizer provider that offers products to cooperatives through VolumeMate. In the updated role model, Supplier is an active role, not only a passive entity.

The Supplier role exists to make price tier information more reliable. Instead of relying only on Koperasi Admin manually entering supplier data, suppliers can directly publish official product offers, maintain price tiers, confirm availability, and respond to collective buying pools.

### 3.2 Main Responsibilities

Supplier is responsible for:

1. Managing supplier company profile.
2. Publishing fertilizer product catalog.
3. Setting volume-based price tiers.
4. Setting quote validity period.
5. Confirming whether product stock is available.
6. Responding to collective buying requests.
7. Accepting, rejecting, or revising pool offers before final confirmation.
8. Confirming final purchase orders.
9. Updating fulfillment or delivery status.
10. Keeping pricing information accurate and transparent.

### 3.3 Key Features Accessible by Supplier

#### A. Supplier Dashboard

Supplier can view:

- Active product offers.
- Active price tiers.
- Incoming pool requests.
- Pending order confirmations.
- Confirmed purchase orders.
- Delivery / fulfillment status.
- Total transaction value from VolumeMate.

#### B. Product & Price Tier Management

Supplier can:

- Create fertilizer products.
- Edit product details before they are used in confirmed transactions.
- Add price tiers.
- Update price tiers before any pool/order is hard confirmed.
- Set minimum order quantity.
- Set maximum supply quantity.
- Set quote expiry date.
- Mark product as available or unavailable.

Example price tier structure:

```text
Product: Urea Fertilizer
Tier 1: 1–2 tons = Rp 6.000/kg
Tier 2: 3–5 tons = Rp 5.600/kg
Tier 3: >5 tons = Rp 5.200/kg
Valid until: 30 June 2026
```

Important rule:

> Once a collective buying pool reaches hard confirmation, the supplier cannot silently change the price. Any price change must trigger re-confirmation from participating cooperatives.

#### C. Quote Confirmation

Supplier can issue or confirm quotes.

A quote should include:

- Supplier name.
- Product name.
- Unit price.
- Price tier rule.
- Minimum volume.
- Maximum supply volume.
- Valid until date.
- Delivery condition.
- Payment condition.
- Quote status.

Quote statuses:

| Status | Meaning |
|---|---|
| **Draft** | Supplier is still preparing the offer. |
| **Published** | Offer is visible to cooperatives. |
| **Verified** | Offer has passed Admin verification if required. |
| **Expired** | Offer is no longer valid. |
| **Revised** | Supplier changed the offer before final confirmation. |
| **Locked** | Offer is attached to a confirmed purchase order. |

#### D. Collective Pool Response

Supplier can:

- View incoming collective pool requests.
- See requested product and total aggregated volume.
- See participating cooperative names if allowed by platform policy.
- Accept the pool request.
- Reject the pool request.
- Suggest revised terms.
- Confirm final price and availability.

Supplier should only see information needed to fulfill the order. Supplier should not see member-level demand or internal cooperative financial data.

#### E. Order Fulfillment

After order confirmation, Supplier can update:

- Order accepted.
- Preparing order.
- Ready for delivery or pickup.
- Delivered.
- Cancelled with reason.

Every update should be recorded in the audit log.

### 3.4 Data Visibility for Supplier

Supplier can see:

- Its own company profile.
- Its own products and price tiers.
- Pool requests involving its own offers.
- Confirmed orders involving its own products.
- Aggregate demand volume for relevant pool requests.
- Delivery and fulfillment status for its own orders.

Supplier cannot see:

- Other suppliers' private pricing dashboard.
- Other suppliers' transactions.
- Member-level demand data from cooperatives.
- Internal cooperative cash flow.
- Platform-wide financial metrics.
- Admin-only audit and dispute management notes.

---

## 4. Role 3 — Admin

### 4.1 Role Description

**Admin** is the platform-level operator responsible for keeping VolumeMate reliable, safe, and trusted. Admin is not the same as Koperasi. Admin manages the platform, user verification, dispute handling, and system-level monitoring.

The Admin role is important because VolumeMate involves multiple cooperatives and suppliers. Without platform-level supervision, there is a risk of invalid supplier data, fake offers, suspicious transactions, or unclear pool responsibility.

### 4.2 Main Responsibilities

Admin is responsible for:

1. Verifying Koperasi accounts.
2. Verifying Supplier accounts.
3. Managing platform user access and roles.
4. Reviewing suspicious or disputed transactions.
5. Monitoring collective pool activity.
6. Validating supplier quotes if required.
7. Handling user reports and support tickets.
8. Maintaining master data such as fertilizer categories and regions.
9. Managing platform transaction fees or subscription status.
10. Ensuring audit logs remain consistent and reliable.

### 4.3 Key Features Accessible by Admin

#### A. Admin Dashboard

Admin can view:

- Total active cooperatives.
- Total active suppliers.
- Active collective pools.
- Confirmed transactions.
- Cancelled pools.
- Expired quotes.
- Transaction fee summary.
- Flagged transactions.
- System health indicators.

#### B. User & Role Management

Admin can:

- Approve or reject Koperasi registration.
- Approve or reject Supplier registration.
- Suspend user accounts.
- Reactivate accounts.
- Change account verification status.
- Reset user access if needed.
- Assign role: Koperasi, Supplier, or Admin.

Admin should not use role switching to manipulate transactions. Any admin action must be recorded in the audit log.

#### C. Supplier Verification

Admin can verify:

- Supplier business identity.
- Supplier product category.
- Price quote proof if required.
- Suspicious price changes.
- Supplier availability claims.

Admin can mark supplier or quote as:

```text
Pending Verification
Verified
Rejected
Suspended
Expired
```

#### D. Pool Monitoring & Dispute Handling

Admin can:

- View active pools across the platform.
- Monitor whether pools reach target volume.
- View negative flows: extend deadline, adjust to nearest tier, or cancel pool.
- Handle disputes between Koperasi and Supplier.
- Lock a pool if there is suspicious activity.
- Cancel a pool with recorded reason.

Admin should not modify confirmed purchase data directly. If correction is needed, Admin must create a correction record rather than overwrite the original transaction.

#### E. Audit & Compliance

Admin can:

- View all audit logs.
- Filter audit logs by user, role, transaction, pool, supplier, or date.
- Export platform audit reports.
- Review price changes and transaction changes.
- Review suspicious cancellation patterns.
- Support future anomaly detection features.

### 4.4 Data Visibility for Admin

Admin can see:

- Platform-wide users.
- Verified and unverified cooperatives.
- Verified and unverified suppliers.
- Supplier product and quote data.
- Collective pool activity.
- Transaction status.
- Audit logs.
- System-level analytics.

Admin should be restricted from seeing unnecessary sensitive personal data unless required for investigation. Sensitive access should be logged.

Admin cannot:

- Silently delete confirmed transactions.
- Silently edit locked price tiers.
- Impersonate users without audit record.
- Modify financial records without creating a correction trail.

---

## 5. Permission Matrix

| Feature / Action | Koperasi | Supplier | Admin |
|---|---:|---:|---:|
| Register account | Yes | Yes | No, created internally |
| Login dashboard | Yes | Yes | Yes |
| Manage own profile | Yes | Yes | Yes |
| Verify users | No | No | Yes |
| View supplier product catalog | Yes | Own catalog | All catalog |
| Create supplier product | No | Yes | Yes / assist |
| Create price tier | No | Yes | Yes / assist |
| Edit price tier before confirmation | No | Yes | Yes |
| Edit price tier after hard confirmation | No | No | Correction only |
| Input member demand | Yes | No | No |
| View member demand | Own only | No | Limited if needed |
| Request VolumeMind recommendation | Yes | No | Monitoring only |
| Create collective buying pool | Yes | No | Assist / monitor |
| Join collective buying pool | Yes | No | No |
| Respond to pool request | No | Yes | No |
| Confirm pool participation | Yes | No | No |
| Confirm supplier availability | No | Yes | No |
| Confirm final order | Yes | Yes | Monitor only |
| Update fulfillment status | No | Yes | Assist if disputed |
| Export own transaction CSV | Yes | Own transactions | Platform reports |
| View audit log | Own related logs | Own related logs | All logs |
| Resolve dispute | No | No | Yes |
| Suspend account | No | No | Yes |
| Delete confirmed transaction | No | No | No |
| Create correction record | Request only | Request only | Yes |

---

## 6. Main User Flows by Role

### 6.1 Koperasi Flow — Individual Purchase

```text
Login as Koperasi
↓
Input member demand and current stock
↓
View supplier price tiers
↓
Request VolumeMind recommendation
↓
Choose supplier and volume
↓
Confirm order
↓
Transaction recorded in audit log
↓
Export transaction report if needed
```

### 6.2 Koperasi Flow — Collective Buying

```text
Login as Koperasi
↓
Create or join collective pool
↓
Add required fertilizer volume
↓
Wait until target volume is reached
↓
Hard confirm participation
↓
Review split billing and distribution guidance
↓
Confirm purchase
↓
Transaction recorded in audit log
```

### 6.3 Supplier Flow — Publishing Price Tiers

```text
Login as Supplier
↓
Create product offer
↓
Set volume-based price tiers
↓
Set quote validity and supply capacity
↓
Publish offer
↓
Receive pool or purchase requests
↓
Confirm availability and final price
```

### 6.4 Supplier Flow — Responding to Pool Request

```text
Receive pool request
↓
Review aggregated volume and requested product
↓
Accept, reject, or revise offer
↓
If accepted, wait for koperasi hard confirmations
↓
Confirm final order
↓
Update fulfillment status
```

### 6.5 Admin Flow — Account Verification

```text
Login as Admin
↓
Review new Koperasi or Supplier registration
↓
Check required identity data
↓
Approve, reject, or request revision
↓
System logs verification action
```

### 6.6 Admin Flow — Dispute / Suspicious Activity

```text
Receive report or flagged activity
↓
Review related pool, transaction, quote, and audit log
↓
Contact involved parties if needed
↓
Lock, cancel, or create correction record
↓
Record admin action in audit log
```

---

## 7. Suggested Dashboard Menu per Role

### 7.1 Koperasi Menu

```text
Dashboard
Demand Input
Supplier Offers
VolumeMind Recommendation
Collective Buying Pools
My Orders
Audit Log
Export Reports
Profile Settings
```

### 7.2 Supplier Menu

```text
Dashboard
Product Catalog
Price Tiers
Incoming Pool Requests
Confirmed Orders
Fulfillment Status
My Audit Log
Profile Settings
```

### 7.3 Admin Menu

```text
Admin Dashboard
User Verification
Koperasi Management
Supplier Management
Pool Monitoring
Transaction Monitoring
Dispute Center
Audit Logs
Platform Settings
```

---

## 8. Important Business Rules

### 8.1 Price Change Rule

Supplier can edit price tiers only before a quote or pool is hard confirmed. After hard confirmation, price changes must create a new revision and require participant re-confirmation.

### 8.2 Pool Commitment Rule

Collective buying should use two commitment levels:

1. **Soft Commitment**: Koperasi shows interest and contributes estimated volume.
2. **Hard Confirmation**: Koperasi officially confirms participation after target volume and supplier terms are clear.

### 8.3 Negative Flow Rule

If a pool fails to reach the target volume before deadline, system should offer:

1. Extend Deadline.
2. Adjust to Nearest Tier.
3. Cancel Pool.

### 8.4 Audit Rule

Confirmed transactions must not be deleted or overwritten. Any correction should be stored as an additional correction record.

### 8.5 Supplier Visibility Rule

Supplier only sees data needed to fulfill the transaction. Supplier should not see member-level cooperative demand or internal cooperative financial records.

### 8.6 Admin Intervention Rule

Admin can intervene in disputes or suspicious cases, but every admin action must be logged. Admin should not silently edit confirmed data.

---

## 9. Suggested Database Role Fields

### 9.1 User Table

```text
id
name
email
password_hash
role: KOPERASI | SUPPLIER | ADMIN
status: PENDING | VERIFIED | REJECTED | SUSPENDED
created_at
updated_at
```

### 9.2 Koperasi Profile

```text
id
user_id
koperasi_name
region
address
contact_person
phone
verification_status
created_at
updated_at
```

### 9.3 Supplier Profile

```text
id
user_id
supplier_name
business_license_number
region
address
contact_person
phone
verification_status
created_at
updated_at
```

### 9.4 Role-Based Audit Log

```text
id
actor_user_id
actor_role
action_type
entity_type
entity_id
before_value
after_value
reason
created_at
```

---

## 10. PRD Replacement — Updated Section 3

Use the following section to replace the current `## 3. Profil Pengguna (User Persona)` in `prd.md`.

```markdown
## 3. Profil Pengguna & Role System

VolumeMate uses three main roles: **Koperasi**, **Supplier**, and **Admin**. Each role has different permissions, dashboard access, and responsibilities.

### 3.1 Koperasi

Koperasi is the primary buyer role. This role is used by cooperative admins or procurement managers who manage fertilizer demand, compare supplier price tiers, request buying recommendations, create or join collective buying pools, confirm purchases, and export transaction reports.

Main responsibilities:
- Input and manage fertilizer demand from members.
- Monitor current stock and purchase needs.
- View supplier products and volume-based price tiers.
- Use VolumeMind to get optimal buying recommendations.
- Create or join collective buying pools.
- Confirm participation and review split billing.
- Track order status and export transaction records.
- Review audit logs related to its own cooperative.

### 3.2 Supplier

Supplier is the seller role. This role is used by fertilizer providers or distributors that publish products, define volume-based price tiers, confirm stock availability, respond to collective buying requests, and update fulfillment status.

Main responsibilities:
- Manage supplier profile.
- Create fertilizer product catalog.
- Set price tiers based on purchase volume.
- Set quote validity and stock availability.
- Respond to collective buying pool requests.
- Confirm final order terms before purchase execution.
- Update fulfillment or delivery status.

Supplier can only access its own products, offers, pool requests, and confirmed transactions. Supplier cannot access member-level demand or internal cooperative financial records.

### 3.3 Admin

Admin is the platform operator role. This role manages platform trust, user verification, dispute handling, and system monitoring.

Main responsibilities:
- Verify Koperasi and Supplier accounts.
- Manage user roles and account status.
- Monitor collective buying pools and suspicious activity.
- Review platform-wide audit logs.
- Handle disputes between Koperasi and Supplier.
- Manage master data and platform settings.
- Ensure confirmed transactions remain traceable and not silently modified.

Admin can access platform-level monitoring data, but sensitive data access must be limited to what is necessary and recorded in the audit log.
```

---

## 11. Implementation Plan Update Notes

In `implementation_plan.md`, update **Fase 2: Autentikasi & Volume Price Tracker** so the authentication system supports:

```text
KOPERASI
SUPPLIER
ADMIN
```

Recommended backend modules:

```text
AuthModule
UsersModule
KoperasiModule
SupplierModule
ProductModule
PriceTierModule
DemandModule
RecommendationModule
CollectivePoolModule
OrderModule
AuditLogModule
AdminModule
```

Recommended RBAC middleware / guard:

```text
RequireRole(KOPERASI)
RequireRole(SUPPLIER)
RequireRole(ADMIN)
```

Example access rule:

```text
Only Supplier can create or edit its own price tiers.
Only Koperasi can create or join collective buying pools.
Only Admin can verify accounts and resolve disputes.
```

---

## 12. Final Recommendation

The current product direction should move from a two-sided passive supplier model into a **three-role marketplace-like procurement system**:

```text
Koperasi = buyer and demand owner
Supplier = offer and fulfillment owner
Admin = trust and governance owner
```

This makes VolumeMate easier to explain, easier to implement with RBAC, and more realistic for handling collective buying, price tier updates, audit logs, and future monetization.
