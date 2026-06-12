# Flowchart Diagram — VolumeMate Updated

This document describes the updated VolumeMate flow with:

- mobile-only web/PWA MVP direction,
- Admin manual approval for Koperasi and Supplier registration,
- Supplier active account,
- VolumeMind AI procurement recommendation,
- Koperasi pool proposal,
- Supplier accept/reject,
- Supplier deadline setting,
- open collective buying pool,
- 24-hour payment window,
- platform payout to Supplier minus platform tax/fee,
- audit log for final outcomes only.

---

## 1. Registration & Admin Verification Flow

```mermaid
flowchart TD
    A[User Registers as Koperasi or Supplier] --> B[Input Name, KTP Photo, Legal Proof Document]
    B --> C[Account Status: PENDING_ADMIN_APPROVAL]
    C --> D[Admin Reviews Documents]
    D -->|Approve| E[Account Status: ACTIVE]
    D -->|Reject| F[Account Status: REJECTED]
    E --> G[User Can Access Role-Based App Features]
```

---

## 2. Koperasi Collective Buy Flow

```mermaid
flowchart TD
    K[Verified Koperasi] --> CB[Open Collective Buy Menu]
    CB --> L[List Open Pools]
    CB --> P[Click Floating Plus Button]
    P --> S[Select Verified Supplier by Unique Supplier Name]
    S --> I[Input Pool Details: Product, Target Volume, Target Fund, Initial Fund]
    I --> PP[Pool Status: PENDING_SUPPLIER_APPROVAL]
    PP --> SM[Appears in Supplier Pending Menu]
```

---

## 2a. VolumeMind AI Recommendation Flow

```mermaid
flowchart TD
    K[Verified Koperasi Opens Mobile VolumeMind Form] --> INPUT[Input 3 Fields: Fertilizer Type, Usage Month, Active Land Area]
    INPUT --> WEATHER[System Fetches Rainfall Forecast by Cooperative Location]
    INPUT --> SEASON[System Detects Planting Season from Usage Month]
    INPUT --> HISTORY[System Reads Historical Transactions and Demand]
    INPUT --> TIERS[System Reads Supplier Price Tiers]

    WEATHER --> AI[VolumeMind AI Engine]
    SEASON --> AI
    HISTORY --> AI
    TIERS --> AI
    AI --> PREDICT[Predict Fertilizer Demand]
    PREDICT --> OPTIMIZE[Optimize Purchase Volume Against Supplier Price Tiers]
    OPTIMIZE --> OUTPUT[Show Recommended Procurement Plan]
    OUTPUT --> CONFIRM{Koperasi Confirms Order?}
    CONFIRM -->|Yes| DRAFT[Create Draft Order or Pool Proposal]
    CONFIRM -->|No| EDIT[User Edits Input or Leaves Recommendation]
```

Recommended output fields:

```text
Selected supplier
Recommended quantity
Estimated total cost
Potential saving
Best order window
Recommendation reason
```

---

## 3. Supplier Pool Approval Flow

```mermaid
flowchart TD
    SM[Supplier Pending Menu] --> PD[View Pool Proposal Detail]
    PD --> DEC{Accept or Reject?}

    DEC -->|Reject| RJ[DECLINED_BY_SUPPLIER]
    RJ --> AUD1[Written to Audit Log]

    DEC -->|No Action for 7 Days| AUTO[AUTO_DECLINED_NO_SUPPLIER_RESPONSE]
    AUTO --> AUD2[Written to Audit Log]

    DEC -->|Accept| DL[Supplier Inputs Deadline Date and Time]
    DL --> ACC[Pool Status: ACCEPTED]
    ACC --> OPEN[Pool Status: OPEN_FOR_KOPERASI]
    OPEN --> ONG[Appears in Supplier On-going Menu and Koperasi Open Pool List]
```

---

## 4. Join Pool & Funding Flow

```mermaid
flowchart TD
    OPEN[Pool OPEN_FOR_KOPERASI] --> J[Koperasi Joins with Fund Amount]
    J --> VALID{current fund + join amount <= target fund?}

    VALID -->|No| ERR[Reject Join: Contribution Exceeds Remaining Target]
    VALID -->|Yes| ADD[Add Fund Commitment to Pool]

    ADD --> CHECK{Target Fund Reached?}
    CHECK -->|No| DEADLINE{Supplier Deadline Passed?}
    DEADLINE -->|No| OPEN
    DEADLINE -->|Yes| FD[FUNDING_DEADLINE_CANCELED]

    CHECK -->|Yes| TR[TARGET_REACHED]
    FD --> ACTION[Main Koperasi Chooses Cancel or Re-propose]
```

---

## 5. Payment & Supplier Payout Flow

```mermaid
flowchart TD
    TR[TARGET_REACHED] --> PW[PAYMENT_WAITING: 24h Payment Window Starts]
    PW --> PAY[Each Koperasi Transfers Proposed Fund to Platform]
    PAY --> SUB{All Payments Submitted Successfully Within 24h?}

    SUB -->|No| PF[PAYMENT_FAILED_CANCELED]
    PF --> ACTION2[Main Koperasi Chooses Cancel or Re-propose]

    SUB -->|Yes| PLATFORM[Platform Collects Total Payment]
    PLATFORM --> FEE[Deduct Platform Tax/Fee]
    FEE --> PAYOUT[Transfer Remaining Amount to Supplier]
    PAYOUT --> SUCCESS[SUCCESS]
    SUCCESS --> AUD3[Written to Audit Log]
```

---

## 6. Re-propose Flow

```mermaid
flowchart TD
    FAIL[Failed Pool: Funding Deadline or Payment Failure] --> CHOICE{Main Koperasi Decision}
    CHOICE -->|Cancel| CANCELED[Final Canceled Status]
    CANCELED --> AUD[Written to Audit Log]
    CHOICE -->|Re-propose| NEW[Create New Pool Record]
    NEW --> LINK[Set reproposed_from_pool_id = old_pool_id]
    LINK --> PENDING[PENDING_SUPPLIER_APPROVAL]
    PENDING --> SUPPLIER[Supplier Must Approve Again]
```

---

## 7. Manual Transaction Recording Flow

```mermaid
flowchart TD
    K[Verified Koperasi] --> TXFORM[Pencatatan Transaksi Menu]
    TXFORM --> INPUT[Input Jenis Pupuk, Jumlah kg, Supplier Name, Transaction Date, Total Price]
    INPUT --> SAVE[Click Simpan Transaksi]
    SAVE --> DB[(Database)]
    DB --> DASH[Update Dashboard Metrics]
    DB --> MODEL[Feed Historical Data for Forecasting/Insight]
    DB --> AUDTX[Transaction Record Available in Audit Log]
```

---

## 8. Supplier Menu Flow

```mermaid
flowchart TD
    S[Verified Supplier] --> PM[Pool Management Menu]
    PM --> PENDING[Pending Menu: Proposals Waiting for Decision]
    PM --> ONGOING[On-going Menu: Accepted Pools Not Final Yet]
    S --> AUD[Supplier Audit Log]
    AUD --> FINAL[Final Outcomes Only: Declined, Auto Declined, Canceled, Success]
```

---

## 9. Pool Status Meaning

| Status | Meaning | Audit Log? |
|---|---|---|
| `PENDING_SUPPLIER_APPROVAL` | Pool proposal waits for supplier decision | No |
| `DECLINED_BY_SUPPLIER` | Supplier rejected the proposal | Yes |
| `AUTO_DECLINED_NO_SUPPLIER_RESPONSE` | Supplier did not act within 7 days | Yes |
| `ACCEPTED` | Supplier approved and set deadline | No |
| `OPEN_FOR_KOPERASI` | Other cooperatives can join | No |
| `TARGET_REACHED` | Target fund has been reached | No |
| `PAYMENT_WAITING` | 24-hour payment window is active | No |
| `FUNDING_DEADLINE_CANCELED` | Target fund not reached before deadline | Yes |
| `PAYMENT_FAILED_CANCELED` | At least one participant did not pay within 24h | Yes |
| `SUCCESS` | All payments submitted and supplier payout processed | Yes |
