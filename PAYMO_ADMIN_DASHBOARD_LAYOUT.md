# PayMo Admin Dashboard — Comprehensive Layout Blueprint v1.0
## 42-Page Super Admin & Multi-Tier Permission System for PayMo Digital Bank BAAS

---

# ACCESS CONTROL: MULTI-LAYER ADMIN AUTHENTICATION

Before any admin can access the dashboard, they must pass **four sequential authentication gates**:

### Gate 1: 6-Digit PIN
| Field | Rules |
|-------|-------|
| Input | 6 numeric digits, masked entry |
| Attempts | 3 max, then 30-minute lockout |
| Reset | Via super admin or email recovery |
| Storage | Bcrypt hash, never plain text |

### Gate 2: Passkey (FIDO2/WebAuthn)
| Field | Rules |
|-------|-------|
| Type | Hardware security key (YubiKey) or biometric (fingerprint/face) |
| Registration | Must be registered by super admin before first use |
| Fallback | Super admin can issue a temporary 12-word recovery phrase |
| Storage | Public key stored server-side, private key on device |

### Gate 3: Time-Based 2FA (TOTP)
| Field | Rules |
|-------|-------|
| App | Google Authenticator, Authy, or Microsoft Authenticator |
| Code | 6-digit, 30-second rotation |
| Setup | Super admin generates QR code for admin to scan |
| Backup | 5 single-use recovery codes, printed and stored in sealed envelope |

### Gate 4: Super Admin–Issued Session PIN
| Field | Rules |
|-------|-------|
| Type | 4-digit numeric PIN set by super admin per session |
| Validity | Single session only, expires on logout or after 8 hours |
| Purpose | Prevents unauthorized access even if all other factors are compromised |
| Issuance | Super admin issues via secure channel (not in-app) |

### Authentication Flow
```
[Login Page] → Enter email + password
    ↓
[Gate 1] → Enter 6-digit PIN
    ↓
[Gate 2] → Touch security key / biometric
    ↓
[Gate 3] → Enter TOTP code from authenticator app
    ↓
[Gate 4] → Enter super admin–issued session PIN
    ↓
[Admin Dashboard] → Access granted
```

### Session Management
| Setting | Value |
|---------|-------|
| Session timeout | 8 hours (configurable by super admin) |
| Idle timeout | 30 minutes |
| Concurrent sessions | 1 per admin (new login kills old session) |
| IP whitelist | Optional — super admin can restrict to office IPs |
| Device binding | Optional — bind to registered device fingerprint |
| Audit log | Every login/logout recorded with IP, device, timestamp |

---

# ROLE & PERMISSION HIERARCHY

## Role Tiers

| Tier | Role | Can Create | Max Reports To |
|------|------|-----------|----------------|
| 0 | **Super Admin** (founder/owner) | All roles, all permissions | Self |
| 1 | **Platform Admin** | Minor admins, analysts | Super Admin |
| 2 | **Operations Manager** | Support agents, reviewers | Platform Admin |
| 3 | **Compliance Officer** | Investigators | Platform Admin |
| 4 | **Finance Manager** | Accountants | Platform Admin |
| 5 | **Support Lead** | Support agents | Operations Manager |
| 6 | **Minor Admin** (employer/dev) | None — limited permissions | Platform Admin |
| 7 | **Analyst** (read-only) | None | Any Tier 1–4 |
| 8 | **Support Agent** | None | Support Lead |

## Permission Matrix (Super Admin assigns per Minor Admin)

| Permission Category | Sub-Permission | Super Admin | Platform Admin | Ops Manager | Compliance | Finance | Minor Admin | Analyst |
|--------------------|----------------|:-----------:|:--------------:|:-----------:|:----------:|:-------:|:-----------:|:-------:|
| **Users** | View user list | ✅ | ✅ | ✅ | ✅ | ✅ | ⚙️ | ✅ |
| | View user detail | ✅ | ✅ | ✅ | ✅ | ✅ | ⚙️ | ✅ |
| | Edit user profile | ✅ | ✅ | ✅ | ❌ | ❌ | ⚙️ | ❌ |
| | Freeze account | ✅ | ✅ | ✅ | ✅ | ❌ | ⚙️ | ❌ |
| | Unfreeze account | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| | Close account | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| | Impersonate user | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Delete user | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Transactions** | View all transactions | ✅ | ✅ | ✅ | ✅ | ✅ | ⚙️ | ✅ |
| | Reverse transaction | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| | Approve high-value | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| | Set fee schedule | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| | Override fee | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| | Set withdrawal limits | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Fraud** | View fraud dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| | Block transaction | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| | Flag user | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| | Blacklist user | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| | Review alerts | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Finance** | View P&L | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ |
| | Approve settlements | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| | Manage pools | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| | Set tax rates | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| | Manage charges | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Partners** | View partners | ✅ | ✅ | ✅ | ✅ | ✅ | ⚙️ | ✅ |
| | Onboard partner | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Suspend partner | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Set partner fees | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Investors** | View investor data | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ |
| | Edit investor terms | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Generate reports | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ |
| **System** | Manage admins | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | View audit log | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| | Configure system | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Manage roles | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | API key management | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Database access | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

⚙️ = configurable by super admin per minor admin account

---

# NAVIGATION STRUCTURE

## Sidebar Groups (Collapsible)

```
📊 OVERVIEW
   ├── Dashboard (Page 1)
   ├── Real-Time Monitor (Page 2)
   └── KPI Scorecard (Page 3)

👥 USER MANAGEMENT
   ├── User Directory (Page 4)
   ├── User Detail & Actions (Page 5)
   ├── KYC & Identity Verification (Page 6)
   ├── Account Lifecycle (Page 7)
   └── VIP Clients (Page 8)

💳 TRANSACTIONS & FINANCE
   ├── Transaction Ledger (Page 9)
   ├── Fee & Charge Management (Page 10)
   ├── Settlement & Reconciliation (Page 11)
   ├── Liquidity & Pool Management (Page 12)
   ├── Withdrawal Controls (Page 13)
   └── Tax & Compliance Reporting (Page 14)

🛡️ FRAUD & RISK
   ├── Fraud Dashboard (Page 15)
   ├── Transaction Monitoring (Page 16)
   ├── Risk Scoring Engine (Page 17)
   ├── AML & Sanctions (Page 18)
   └── Incident Response (Page 19)

🏦 PRODUCTS & SERVICES
   ├── Service Portfolio (Page 20)
   ├── Product Configuration (Page 21)
   ├── Recurring Services (Page 22)
   ├── Card Programs (Page 23)
   └── Utility Services (Page 24)

🤝 PARTNERS & INVESTORS
   ├── Partner Directory (Page 25)
   ├── Partner Onboarding (Page 26)
   ├── Investor Dashboard (Page 27)
   └── Investor Reports (Page 28)

⚙️ PLATFORM ADMINISTRATION
   ├── Admin Management (Page 29)
   ├── Permissions & Roles (Page 30)
   ├── Audit Log (Page 31)
   ├── System Configuration (Page 32)
   ├── API & Integrations (Page 33)
   └── Feature Flags (Page 34)

📢 COMMUNICATIONS
   ├── Notification Center (Page 35)
   ├── Broadcast Messages (Page 36)
   └── Customer Support Queue (Page 37)

📄 DOCUMENTS & LEGAL
   ├── Terms & Conditions (Page 38)
   ├── Privacy Policy (Page 39)
   ├── Compliance Documents (Page 40)
   └── Document Templates (Page 41)

📈 ANALYTICS & REPORTING
   ├── Analytics Dashboard (Page 42)
```

---

# PAGE 1: ADMIN DASHBOARD HOME

**Purpose:** Command center showing all critical metrics, alerts, and system health at a glance.

### Section 1.1: Header Bar
| Element | Details |
|---------|---------|
| PayMo logo | Link to dashboard home |
| Admin avatar + name | "Super Admin — Joseph Mwangi" |
| Role badge | "Super Admin" (green) |
| Session timer | "Session expires in 6:42:15" |
| Notification bell | Red badge with unread count |
| Quick actions dropdown | Freeze account, Block transaction, Send broadcast |

### Section 1.2: Portfolio Value Hero Card (Full Width)
| Metric | Value | Trend | Period |
|--------|-------|-------|--------|
| Total Portfolio Value | KES 2.47B | ↑ 12.3% | vs last month |
| Total Users | 148,392 | ↑ 8,412 | new this month |
| Active Users (30d) | 89,214 | ↑ 5.2% | daily active |
| Total Transactions (30d) | 1,247,893 | ↑ 15.7% | vs last month |
| Transaction Volume (30d) | KES 18.6B | ↑ 22.1% | vs last month |
| Revenue (30d) | KES 186M | ↑ 18.4% | transaction fees |
| MRR (Monthly Recurring Revenue) | KES 42.3M | ↑ 3.1% | subscriptions |

### Section 1.3: Revenue Breakdown (Donut + Bar)
| Revenue Source | Amount (KES) | % of Total | Trend |
|----------------|-------------|------------|-------|
| Transaction fees | 142,000,000 | 76.3% | ↑ |
| Card fees | 18,500,000 | 9.9% | ↑ |
| Utility commissions | 12,800,000 | 6.9% | → |
| Subscription (VIP) | 8,200,000 | 4.4% | ↑ |
| FX margins | 4,500,000 | 2.4% | ↓ |

### Section 1.4: System Health Grid (2×3)
| Card | Status | Details |
|------|--------|---------|
| API Uptime | 🟢 99.97% | 12h avg, 4 nines this month |
| Payment Gateway | 🟢 Operational | M-Pesa: OK, Cards: OK, Banks: OK |
| Fraud Engine | 🟢 Active | 23 alerts pending review |
| Support Queue | 🟡 12 Open | 3 urgent, avg response 4.2 min |
| Database | 🟢 Healthy | 340 GB used, 1.2 TB available |
| Background Jobs | 🟢 Running | 847/847 completed, 0 failed |

### Section 1.5: Critical Alerts Strip (Scrollable)
| Priority | Alert | Action |
|----------|-------|--------|
| 🔴 Critical | 3 accounts flagged for simultaneous multi-device withdrawal | Review → |
| 🔴 Critical | M-Pesa callback delay > 5 min (12 transactions pending) | Investigate → |
| 🟡 Warning | Daily fraud threshold 78% reached (KES 14.2M of KES 18M limit) | Review → |
| 🟡 Warning | Partner "QuickLend" settlement overdue by 2 days | Contact → |
| 🟢 Info | New KYC batch: 347 pending verification | Process → |
| 🟢 Info | System maintenance scheduled: Sunday 2:00 AM EAT | Details → |

### Section 1.6: Transaction Volume Chart (24h Live)
- Line chart: Transactions per hour (current 24h vs previous 24h)
- Anomaly detection markers on unusual spikes/dips
- Tap any hour to drill into that hour's transactions

### Section 1.7: Defaulters Summary
| Metric | Value | Trend |
|--------|-------|-------|
| Total defaulters | 1,247 | ↑ 23 this week |
| Amount at risk | KES 34.5M | ↓ 2.1M recovered |
| Accounts with negative balance | 892 | |
| Amounts below zero | KES 12.8M | |
| Pending recovery actions | 354 | |
| Last 30d recovery rate | 67% | ↑ |

### Section 1.8: Quick Actions Grid (2×4)
| Icon | Action | Destination |
|------|--------|-------------|
| 🔍 | Search User | Page 4 (User Directory) |
| 🧊 | Freeze Account | Page 5 (User Detail) |
| 📊 | Transaction Ledger | Page 9 |
| 🛡️ | Fraud Alerts | Page 15 |
| 💰 | Set Fees | Page 10 |
| 👥 | Manage Admins | Page 29 |
| 📢 | Send Broadcast | Page 36 |
| 📄 | Update T&C | Page 38 |

### Section 1.9: Recent Activity Feed (Last 10)
| Time | Admin | Action | Target | Details |
|------|-------|--------|--------|---------|
| 2 min ago | Joseph M. | Froze account | User #89234 | Fraud suspicion — dual browser |
| 8 min ago | Sarah K. | Approved settlement | Partner #12 | KES 4.2M disbursed |
| 15 min ago | James O. | Updated fee schedule | All users | Mobile money fee 0.5% → 0.45% |
| 22 min ago | Joseph M. | Granted VIP status | User #4512 | Exempt from transaction fees |
| 31 min ago | Mary W. | Reversed transaction | TXN #882341 | Duplicate charge corrected |

---

# PAGE 2: REAL-TIME MONITOR

**Purpose:** Live feed of all platform activity — transactions, logins, fraud alerts, system events.

### Section 2.1: Live Transaction Stream
| Time | TXN ID | Type | User | Amount | Channel | Status | Fraud Score |
|------|--------|------|------|--------|---------|--------|-------------|
| 14:32:01 | TXN-882451 | Transfer | #89234 → #12045 | KES 15,000 | M-Pesa | ✅ Complete | 12 |
| 14:31:58 | TXN-882450 | Withdrawal | #4512 | KES 5,000 | ATM | ✅ Complete | 5 |
| 14:31:55 | TXN-882449 | Payment | #67890 | KES 2,300 | Card | ⏳ Pending | 8 |
| 14:31:52 | TXN-882448 | Deposit | #33456 | KES 50,000 | Bank | ✅ Complete | 3 |
| 14:31:49 | TXN-882447 | Transfer | #11223 → #44556 | KES 8,700 | Internal | ✅ Complete | 7 |

- Auto-refreshes every 2 seconds
- Color-coded fraud score: 🟢 0–20, 🟡 21–50, 🟠 51–75, 🔴 76–100
- Tap any row for full transaction detail modal

### Section 2.2: Live Metrics Sidebar
| Metric | Current Value | Refresh |
|--------|--------------|---------|
| Transactions/min | 142 | Live |
| Active sessions | 3,847 | Live |
| Failed logins (1h) | 23 | Live |
| Fraud alerts (1h) | 7 | Live |
| API response time | 124ms | Live |
| Error rate | 0.03% | Live |

### Section 2.3: Geographic Heatmap
- Kenya map with real-time transaction density by county
- Hotspots pulsing for high-activity areas
- Tap county for drill-down

### Section 2.4: Channel Performance
| Channel | Transactions (1h) | Volume (KES) | Success Rate | Avg Time |
|---------|-------------------|-------------|--------------|----------|
| M-Pesa | 4,230 | 63.4M | 99.2% | 3.2s |
| Card (Visa) | 1,890 | 28.3M | 99.8% | 1.8s |
| Card (Mastercard) | 1,120 | 16.8M | 99.7% | 1.9s |
| Bank Transfer | 340 | 51.2M | 98.5% | 45s |
| Internal | 2,100 | 31.5M | 99.9% | 0.3s |
| ATM | 280 | 8.4M | 97.8% | 12s |

---

# PAGE 3: KPI SCORECARD

**Purpose:** Executive scorecard tracking all platform KPIs with targets, trends, and drill-downs.

### Section 3.1: KPI Grid (4×4)
| KPI | Current | Target | Status | Trend | Period |
|-----|---------|--------|--------|-------|--------|
| Total Users | 148,392 | 200,000 | 🟡 74% | ↑ 8.4K | Monthly |
| MAU (Monthly Active) | 89,214 | 120,000 | 🟡 74% | ↑ 5.2% | Monthly |
| Transaction Volume | KES 18.6B | KES 25B | 🟡 74% | ↑ 22.1% | Monthly |
| Revenue | KES 186M | KES 200M | 🟢 93% | ↑ 18.4% | Monthly |
| Avg Revenue/User | KES 1,253 | KES 1,500 | 🟡 84% | ↑ 9.2% | Monthly |
| Fraud Rate | 0.023% | <0.05% | 🟢 Good | ↓ | Monthly |
| Chargeback Rate | 0.018% | <0.05% | 🟢 Good | ↓ | Monthly |
| Support Resolution Time | 4.2 min | <5 min | 🟢 Good | ↓ 1.3min | Monthly |
| KYC Completion Rate | 94.2% | 98% | 🟡 96% | ↑ 1.1% | Monthly |
| NPS Score | 72 | 70 | 🟢 Good | ↑ 3 | Quarterly |
| Default Rate | 1.8% | <2% | 🟢 Good | ↓ 0.3% | Monthly |
| Partner Satisfaction | 4.3/5 | 4.5/5 | 🟡 96% | ↑ 0.1 | Quarterly |
| System Uptime | 99.97% | 99.99% | 🟡 Good | → | Monthly |
| API Latency (p95) | 124ms | <200ms | 🟢 Good | ↓ 12ms | Monthly |
| Cost per Transaction | KES 2.10 | KES 1.80 | 🟡 86% | ↓ 0.15 | Monthly |
| Employee Productivity | 1,247 tickets/agent | 1,500 | 🟡 83% | ↑ | Monthly |

### Section 3.2: Trend Charts
- 12-month line charts for each KPI
- Target lines overlaid
- Year-over-year comparison

---

# PAGE 4: USER DIRECTORY

**Purpose:** Search, filter, and manage all platform users.

### Section 4.1: Search & Filters
| Filter | Type | Options |
|--------|------|---------|
| Search | Text | Name, phone, email, account number, national ID |
| Account status | Multi-select | Active, Frozen, Suspended, Closed, Pending KYC |
| Account type | Multi-select | Individual, Business, VIP, Partner |
| Registration date | Date range | Custom range picker |
| Last active | Dropdown | Today, This week, This month, 30+ days inactive |
| Balance range | Number range | Min — Max |
| Transaction volume | Number range | Min — Max (monthly) |
| Risk level | Multi-select | Low, Medium, High, Critical |
| County | Dropdown | All 47 Kenyan counties |
| KYC status | Multi-select | Complete, Pending, Expired, Rejected |
| Flagged | Toggle | Yes / No |

### Section 4.2: User List Table
| Column | Details | Sortable |
|--------|---------|----------|
| Avatar + Name | Photo or initials | ✅ |
| Account # | PAY-XXXXX-XXXX | ✅ |
| Phone | +254 7XX XXX XXX | ❌ |
| Type | Individual / Business / VIP | ✅ |
| Status | 🟢 Active / 🟡 Frozen / 🔴 Suspended / ⚪ Pending | ✅ |
| Balance | KES formatted | ✅ |
| Monthly Volume | KES formatted | ✅ |
| KYC | ✅ Complete / ⏳ Pending / ❌ Rejected | ✅ |
| Risk | 🟢 Low / 🟡 Med / 🔴 High | ✅ |
| Last Active | Relative time | ✅ |
| Actions | ⋮ (overflow menu) | ❌ |

### Section 4.3: Bulk Actions
| Action | Requires | Confirmation |
|--------|----------|-------------|
| Export CSV | Permission | None |
| Send broadcast | Permission | Confirm message |
| Flag accounts | Permission | Confirm selection |
| Freeze accounts | Permission + 2FA | Confirm + reason |
| Adjust fee tier | Permission + 2FA | Confirm + fee change |

### Section 4.4: User Detail Modal (Opens on Click)
| Tab | Content |
|-----|---------|
| Overview | Profile, balance, stats, quick actions |
| Transactions | Full transaction history with filters |
| KYC | Documents, verification status, notes |
| Security | Login history, devices, 2FA status |
| Communications | Notification history, support tickets |
| Admin Notes | Internal notes (admin-only) |
| Actions | Freeze, Flag, Adjust fees, Grant VIP, Close |

---

# PAGE 5: USER DETAIL & ACTIONS

**Purpose:** Deep-dive into a single user account with full admin action capabilities.

### Section 5.1: User Profile Header
| Field | Value | Editable |
|-------|-------|----------|
| Full name | Joseph Kamau Mwangi | ✅ |
| Account # | PAY-12345-6789 | ❌ |
| Phone | +254 712 345 678 | ✅ |
| Email | joseph@example.com | ✅ |
| National ID | 12345678 | ❌ (KYC verified) |
| Account type | Individual | ✅ (change requires approval) |
| Registration date | March 15, 2024 | ❌ |
| Account status | 🟢 Active | ✅ (toggle with reason) |
| Risk level | 🟢 Low | Auto-calculated |

### Section 5.2: Financial Summary
| Metric | Value |
|--------|-------|
| Current balance | KES 45,230 |
| Available balance | KES 40,230 (KES 5,000 held in pending) |
| Pending transactions | 2 (KES 5,000) |
| Total deposited (all time) | KES 2,340,000 |
| Total withdrawn (all time) | KES 2,180,000 |
| Total transferred (all time) | KES 112,000 |
| Monthly transaction volume | KES 185,000 |
| Monthly transaction count | 47 |
| Avg transaction size | KES 3,936 |
| Transaction fee tier | Standard (1.5%) |
| VIP status | ❌ Not VIP |
| Total fees paid (all time) | KES 34,200 |

### Section 5.3: Admin Actions Panel
| Action | Description | Requires |
|--------|-------------|----------|
| 🧊 Freeze Account | Temporarily disable all transactions | 2FA + reason |
| 🔴 Suspend Account | Block all access, retain data | 2FA + reason + approval |
| 🟢 Unfreeze Account | Re-enable transactions | 2FA |
| ❌ Close Account | Permanent closure, transfer remaining balance | 2FA + super admin |
| 💎 Grant VIP Status | Exempt from transaction fees | 2FA + fee config |
| 💸 Adjust Fee Tier | Set custom fee percentage | 2FA + fee config |
| 💰 Set Withdrawal Limit | Custom daily/monthly limit | 2FA |
| 🔒 Set Transaction Limit | Max per-transaction amount | 2FA |
| 📝 Add Admin Note | Internal note visible to all admins | None |
| 🏷️ Flag Account | Mark for review | None |
| 📧 Send Message | Direct notification to user | None |
| 🔄 Impersonate | View dashboard as this user | 2FA + super admin |
| 📊 View Full Audit | Complete admin action history | None |

### Section 5.4: Transaction History (Full)
| Date | Time | TXN ID | Type | Description | Amount | Fee | Balance After | Status |
|------|------|--------|------|-------------|--------|-----|---------------|--------|
| 2026-08-22 | 14:32 | TXN-882451 | Transfer | To PAY-67890-1234 | -KES 15,000 | KES 225 | KES 45,230 | ✅ |
| 2026-08-22 | 09:15 | TXN-882300 | Deposit | M-Pesa | +KES 50,000 | KES 0 | KES 60,455 | ✅ |
| 2026-08-21 | 18:45 | TXN-882100 | Payment | KPLC Electricity | -KES 3,200 | KES 48 | KES 10,455 | ✅ |
| 2026-08-21 | 11:20 | TXN-882050 | Withdrawal | M-Pesa Cashout | -KES 5,000 | KES 75 | KES 13,703 | ✅ |

### Section 5.5: Security Overview
| Item | Status | Details |
|------|--------|---------|
| Password | 🟢 Last changed 30 days ago | Complexity: Strong |
| 2FA (TOTP) | 🟢 Enabled | Google Authenticator |
| Biometric | 🟢 Enabled | Fingerprint |
| Passkey | 🟡 Not registered | — |
| Last login | 2 hours ago | Nairobi, Chrome/Windows |
| Login devices | 3 | iPhone 15, MacBook Pro, Desktop PC |
| Failed logins (30d) | 0 | — |
| Suspicious activity | None detected | — |

---

# PAGE 6: KYC & IDENTITY VERIFICATION

**Purpose:** Manage user identity verification — documents, tiers, compliance.

### Section 6.1: KYC Dashboard
| Metric | Value |
|--------|-------|
| Total users | 148,392 |
| KYC Complete (Tier 3) | 98,234 (66.2%) |
| KYC Partial (Tier 2) | 34,120 (23.0%) |
| KYC Basic (Tier 1) | 12,450 (8.4%) |
| KYC Pending | 3,588 (2.4%) |
| Documents pending review | 347 |
| Avg verification time | 4.2 hours |

### Section 6.2: KYC Tier Structure
| Tier | Requirements | Limits (Daily) | Limits (Monthly) |
|------|-------------|----------------|-----------------|
| Tier 0 | Phone number only | KES 5,000 | KES 20,000 |
| Tier 1 | Phone + Full name + DOB | KES 50,000 | KES 200,000 |
| Tier 2 | Tier 1 + National ID/Passport | KES 500,000 | KES 2,000,000 |
| Tier 3 | Tier 2 + Proof of address + Face verification | Unlimited | Unlimited |

### Section 6.3: Pending Verification Queue
| User | Document Type | Submitted | Urgency | Assigned To | Action |
|------|--------------|-----------|---------|-------------|--------|
| PAY-45123-XXXX | National ID | 2h ago | Normal | Queue | Review → |
| PAY-67890-XXXX | Passport | 1h ago | Normal | Queue | Review → |
| PAY-89012-XXXX | Face verification | 30min ago | Normal | Queue | Review → |

### Section 6.4: Verification Detail Modal
| Section | Fields |
|---------|--------|
| User info | Name, phone, account #, requested tier |
| Uploaded documents | Front ID, Back ID, Selfie, Proof of address |
| OCR results | Auto-extracted text from ID |
| Face match score | 94.2% (user selfie vs ID photo) |
| Address verification | Utility bill / bank statement |
| AML screening | Sanctions check, PEP status |
| Admin decision | Approve / Reject / Request additional docs |
| Notes | Free text for rejection reason or approval notes |

---

# PAGE 7: ACCOUNT LIFECYCLE

**Purpose:** Track and manage account states — registration, activation, dormancy, closure.

### Section 7.1: Lifecycle Pipeline
```
[Registered] → [KYC Pending] → [KYC Partial] → [KYC Complete] → [Active]
                                                                    ↓
[Dormant 90d] → [Dormant 180d] → [Dormant 365d] → [Escheatment Review]
                                                                    ↓
[Frozen] ←→ [Active]    [Suspended] ←→ [Active]    [Closed] (permanent)
```

### Section 7.2: Lifecycle Metrics
| Stage | Count | % of Total | Trend |
|-------|-------|------------|-------|
| Registered (not verified) | 3,588 | 2.4% | ↓ |
| Active | 134,210 | 90.4% | ↑ |
| Dormant (90d+) | 8,450 | 5.7% | → |
| Frozen | 1,234 | 0.8% | ↑ |
| Suspended | 892 | 0.6% | ↓ |
| Closed | 18 | 0.01% | → |

### Section 7.3: Dormancy Management
| User | Last Active | Balance | Days Dormant | Action |
|------|------------|---------|-------------|--------|
| PAY-11223-XXXX | 2026-05-15 | KES 12,400 | 98 | Send reactivation prompt |
| PAY-44556-XXXX | 2026-04-20 | KES 890 | 123 | Send reactivation prompt |
| PAY-77889-XXXX | 2026-01-10 | KES 45,000 | 224 | Escalate — high balance |

---

# PAGE 8: VIP CLIENTS

**Purpose:** Manage premium/VIP clients with custom fee exemptions, dedicated support, and priority services.

### Section 8.1: VIP Directory
| User | Account # | VIP Tier | Since | Monthly Volume | Fee Exemption | Dedicated Manager | Status |
|------|-----------|----------|-------|---------------|---------------|-------------------|--------|
| Grace Ochieng | PAY-VIP-001 | Platinum | Jan 2025 | KES 12.4M | 100% all fees | Joseph M. | 🟢 Active |
| David Mutua | PAY-VIP-002 | Gold | Jun 2025 | KES 5.2M | 75% fees | Sarah K. | 🟢 Active |
| Amina Hassan | PAY-VIP-003 | Gold | Aug 2025 | KES 3.8M | 75% fees | James O. | 🟢 Active |
| Peter Kamau Ltd | PAY-VIP-004 | Business | Mar 2025 | KES 28.6M | 80% fees + custom | Joseph M. | 🟢 Active |

### Section 8.2: VIP Tier Structure
| Tier | Requirements | Benefits |
|------|-------------|----------|
| Silver | KES 500K+ monthly volume OR KES 1M+ balance | 25% fee reduction, priority support |
| Gold | KES 2M+ monthly volume OR KES 5M+ balance | 50% fee reduction, dedicated manager, early access |
| Platinum | KES 10M+ monthly volume OR KES 20M+ balance | 100% fee exemption, dedicated manager, custom limits, API access |
| Business | Registered business, KES 5M+ monthly volume | Custom fee structure, bulk operations, multi-user accounts |

### Section 8.3: Fee Exemption Configuration
| Fee Type | Standard Rate | Silver | Gold | Platinum | Business |
|----------|--------------|--------|------|----------|----------|
| Transfer (internal) | 1.5% | 1.125% | 0.75% | Free | Custom |
| M-Pesa cashout | 2.0% | 1.5% | 1.0% | Free | Custom |
| Card payment | 2.5% | 1.875% | 1.25% | Free | Custom |
| FX conversion | 3.0% | 2.25% | 1.5% | Free | Custom |
| Monthly subscription | KES 0 | KES 0 | KES 0 | KES 0 | KES 0 |
| ATM withdrawal | KES 35 | KES 25 | KES 15 | Free | Custom |

### Section 8.4: VIP Actions
| Action | Description |
|--------|-------------|
| Grant VIP | Set tier, configure exemptions, assign manager |
| Upgrade/Downgrade | Change tier with effective date |
| Revoke VIP | Remove VIP status, revert to standard fees |
| Set custom limits | Override standard withdrawal/transfer limits |
| Assign manager | Link to specific admin for dedicated support |
| VIP activity log | Full history of VIP-related actions |

---

# PAGE 9: TRANSACTION LEDGER

**Purpose:** Complete, searchable, filterable ledger of every transaction on the platform.

### Section 9.1: Ledger Header
| Metric | Value | Period |
|--------|-------|--------|
| Total transactions | 1,247,893 | This month |
| Total volume | KES 18.6B | This month |
| Total fees collected | KES 186M | This month |
| Avg transaction size | KES 14,906 | This month |
| Success rate | 99.4% | This month |

### Section 9.2: Filters
| Filter | Type |
|--------|------|
| Date range | From — To |
| TXN ID | Exact search |
| User | Name, phone, account # |
| Type | Transfer, Withdrawal, Deposit, Payment, Reversal, Fee |
| Channel | M-Pesa, Card, Bank, Internal, ATM |
| Status | Complete, Pending, Failed, Reversed |
| Amount range | Min — Max |
| Fraud score range | Min — Max |
| Has flag | Yes / No |

### Section 9.3: Transaction Table
| TXN ID | Date/Time | User | Type | Description | Amount | Fee | Channel | Status | Fraud | Actions |
|--------|-----------|------|------|-------------|--------|-----|---------|--------|-------|---------|
| TXN-882451 | Aug 22 14:32 | PAY-12345 | Transfer | To PAY-67890 | KES 15,000 | KES 225 | M-Pesa | ✅ | 12 | ⋮ |
| TXN-882450 | Aug 22 14:31 | PAY-45123 | Withdrawal | Cashout | KES 5,000 | KES 100 | M-Pesa | ✅ | 5 | ⋮ |
| TXN-882449 | Aug 22 14:31 | PAY-67890 | Payment | KPLC | KES 3,200 | KES 48 | Card | ⏳ | 8 | ⋮ |

### Section 9.4: Transaction Detail Modal
| Section | Fields |
|---------|--------|
| Header | TXN ID, status badge, amount |
| Details | Sender, receiver, type, channel, timestamp |
| Fees | Fee breakdown, tax, net amount |
| Security | Fraud score, device info, IP, geo |
| Timeline | Created → Processing → Complete/Failed |
| Admin actions | Reverse, Refund, Flag, Add note |

---

# PAGE 10: FEE & CHARGE MANAGEMENT

**Purpose:** Configure all transaction fees, charges, tax rates, and custom fee tiers.

### Section 10.1: Fee Schedule Overview
| Fee Type | Current Rate | Revenue (30d) | # Transactions | Status |
|----------|-------------|---------------|----------------|--------|
| Internal transfer | 1.5% (min KES 10) | KES 42.3M | 689,234 | Active |
| M-Pesa cash-in | 0% | KES 0 | 234,567 | Active |
| M-Pesa cashout | 2.0% (min KES 20) | KES 38.7M | 198,432 | Active |
| Card payment | 2.5% (min KES 15) | KES 28.4M | 89,123 | Active |
| ATM withdrawal | KES 35 flat | KES 8.7M | 247,890 | Active |
| FX conversion | 3.0% | KES 4.5M | 12,345 | Active |
| Bill payment | 1.0% (min KES 10) | KES 12.8M | 127,456 | Active |
| International transfer | 3.5% + KES 500 | KES 2.1M | 4,230 | Active |
| Late payment | 5% monthly | KES 1.2M | 34 | Active |
| Account maintenance | KES 0 | KES 0 | 148,392 | Active |

### Section 10.2: Fee Editor
| Setting | Details |
|---------|---------|
| Fee type | Dropdown selection |
| Calculation | Percentage / Flat / Tiered / Hybrid |
| Rate | Number input |
| Minimum | Floor amount |
| Maximum | Cap amount (0 = unlimited) |
| Tax | Inclusive / Exclusive + VAT rate |
| Effective date | When change takes effect |
| Applies to | All users / Specific tier / Specific users |
| Approval required | Toggle — if on, requires super admin approval |

### Section 10.3: Tiered Fee Configuration
| Tier | Monthly Volume | Internal Transfer | Cashout | Card |
|------|---------------|-------------------|---------|------|
| Standard | < KES 100K | 1.5% | 2.0% | 2.5% |
| Silver | KES 100K–500K | 1.25% | 1.75% | 2.25% |
| Gold | KES 500K–2M | 1.0% | 1.5% | 2.0% |
| Platinum | KES 2M–10M | 0.75% | 1.0% | 1.5% |
| VIP | > KES 10M | Custom | Custom | Custom |

### Section 10.4: Fee Impact Simulator
Before applying fee changes, simulate impact:
| Scenario | Current | Proposed | Revenue Impact | User Impact |
|----------|---------|----------|---------------|-------------|
| Internal transfer 1.5% → 1.25% | KES 42.3M | KES 35.2M | -KES 7.1M (-16.8%) | 34,000 users save |
| Cashout 2.0% → 1.75% | KES 38.7M | KES 33.9M | -KES 4.8M (-12.4%) | 19,000 users save |
| New: ATM fee KES 35 → KES 30 | KES 8.7M | KES 7.5M | -KES 1.2M (-13.8%) | 247,000 users save |

---

# PAGE 11: SETTLEMENT & RECONCILIATION

**Purpose:** Manage partner settlements, bank reconciliations, and financial integrity.

### Section 11.1: Settlement Dashboard
| Metric | Value |
|--------|-------|
| Pending settlements | 12 (KES 45.6M) |
| Completed today | 8 (KES 32.1M) |
| Failed today | 0 |
| Next auto-settlement | 16:00 EAT (2h 15m) |
| Total settled (30d) | KES 1.2B |

### Section 11.2: Partner Settlement Queue
| Partner | Amount | Transactions | Due | Status | Actions |
|---------|--------|-------------|-----|--------|---------|
| M-Pesa (Safaricom) | KES 12.4M | 23,456 | Today 16:00 | ⏳ Scheduled | ⋮ |
| KCB Bank | KES 8.7M | 3,456 | Today 16:00 | ⏳ Scheduled | ⋮ |
| Visa Kenya | KES 4.2M | 8,901 | Tomorrow | 🔮 Future | ⋮ |
| QuickLend Partner | KES 2.1M | 1,234 | 2 days ago | 🔴 Overdue | ⋮ |

### Section 11.3: Reconciliation Status
| Date | Expected | Actual | Variance | Status | Actions |
|------|----------|--------|----------|--------|---------|
| Aug 22 | KES 186.4M | KES 186.2M | -KES 200K | 🟡 Minor variance | Investigate → |
| Aug 21 | KES 172.1M | KES 172.1M | KES 0 | ✅ Matched | — |
| Aug 20 | KES 168.5M | KES 168.5M | KES 0 | ✅ Matched | — |
| Aug 19 | KES 155.3M | KES 155.8M | +KES 500K | 🟡 Minor variance | Investigate → |

### Section 11.4: Reconciliation Detail Modal
| Section | Content |
|---------|---------|
| Summary | Date, expected vs actual, variance |
| Breakdown by channel | M-Pesa, Cards, Banks, Internal |
| Unmatched transactions | List of transactions without matching record |
| Adjustment actions | Post adjustment, create suspense entry, mark as resolved |

---

# PAGE 12: LIQUIDITY & POOL MANAGEMENT

**Purpose:** Manage platform liquidity pools, reserve requirements, and fund allocation.

### Section 12.1: Liquidity Overview
| Pool | Balance | Reserved | Available | Utilization | Health |
|------|---------|----------|-----------|-------------|--------|
| Main Operating Pool | KES 892M | KES 234M | KES 658M | 73.5% | 🟢 Healthy |
| M-Pesa Float | KES 125M | KES 45M | KES 80M | 64.0% | 🟢 Healthy |
| Card Settlement Pool | KES 67M | KES 12M | KES 55M | 82.1% | 🟡 Monitor |
| ATM Pool | KES 34M | KES 8M | KES 26M | 76.5% | 🟢 Healthy |
| Emergency Reserve | KES 500M | KES 500M | KES 0 | 100% | 🔒 Locked |
| Partner Settlement Pool | KES 45M | KES 45M | KES 0 | 100% | 🔒 Pending |
| Tax Withholding Pool | KES 12M | KES 12M | KES 0 | 100% | 🔒 Held |

### Section 12.2: Pool Management Actions
| Action | Description | Requires |
|--------|-------------|----------|
| Transfer between pools | Move funds from one pool to another | 2FA + approval |
| Top up pool | Add funds from external source | 2FA |
| Withdraw from pool | Move to external account | 2FA + super admin |
| Adjust reserve ratio | Change minimum reserve % | Super admin |
| Set alert thresholds | Configure low-balance alerts | None |

### Section 12.3: Liquidity Alerts
| Alert | Threshold | Current | Status |
|-------|-----------|---------|--------|
| M-Pesa float low | < KES 50M | KES 125M | 🟢 OK |
| ATM pool low | < KES 20M | KES 34M | 🟢 OK |
| Card settlement low | < KES 30M | KES 67M | 🟢 OK |
| Operating pool critical | < KES 200M | KES 892M | 🟢 OK |
| Reserve ratio breach | < 15% | 32.4% | 🟢 OK |

---

# PAGE 13: WITHDRAWAL CONTROLS

**Purpose:** Set and enforce withdrawal limits, pool-based access rules, and anti-fraud withdrawal controls.

### Section 13.1: Global Withdrawal Limits
| Limit Type | Current Value | Effective Since | Actions |
|-----------|--------------|-----------------|---------|
| Daily limit (per user) | KES 500,000 | Jan 2025 | Edit |
| Monthly limit (per user) | KES 5,000,000 | Jan 2025 | Edit |
| Per-transaction max | KES 150,000 | Jan 2025 | Edit |
| Minimum withdrawal | KES 100 | Jan 2025 | Edit |
| ATM daily limit | KES 100,000 | Jan 2025 | Edit |
| ATM per-transaction | KES 40,000 | Jan 2025 | Edit |

### Section 13.2: Pool-Based Access Rules
| Rule | Description | Status |
|------|-------------|--------|
| Reserve floor | Withdrawals blocked when available pool < 15% of total | ✅ Active |
| Velocity check | >3 withdrawals in 1 hour triggers review | ✅ Active |
| New account restriction | First 7 days: max KES 10,000/day | ✅ Active |
| High-value threshold | >KES 100,000 requires additional verification | ✅ Active |
| Balance floor | KES 500 minimum balance maintained | ✅ Active |

### Section 13.3: Anti-Fraud Withdrawal Controls
| Control | Description | Trigger |
|---------|-------------|---------|
| Dual-device detection | Block if same user triggers withdrawal from 2 browsers/devices simultaneously | Real-time |
| Geo-anomaly | Block if withdrawal IP > 500km from usual location | Real-time |
| Velocity spike | Block if >50% increase in withdrawal frequency vs 30d avg | Real-time |
| New device | Extra verification if withdrawal from newly registered device | Real-time |
| Amount anomaly | Flag if withdrawal >300% of user's 30d avg | Real-time |
| Time anomaly | Flag if withdrawal at unusual hour (2AM–5AM) for user | Real-time |
| Cross-border | Block if VPN/proxy detected during withdrawal | Real-time |
| Sequential rapid | Block if 3+ withdrawals within 10 minutes | Real-time |

### Section 13.4: User-Specific Limits
| User | Standard Daily | Custom Daily | Standard Monthly | Custom Monthly | Reason |
|------|---------------|-------------|-----------------|---------------|--------|
| PAY-12345 | KES 500,000 | KES 1,000,000 | KES 5M | KES 10M | VIP Platinum |
| PAY-67890 | KES 500,000 | KES 250,000 | KES 5M | KES 2M | Previous fraud flag |
| PAY-89012 | KES 500,000 | KES 100,000 | KES 5M | KES 500,000 | New account |

### Section 13.5: Blocked Withdrawals Log
| Date | User | Amount | Device | IP | Reason | Admin Action |
|------|------|--------|--------|----|--------|-------------|
| Aug 22 14:32 | PAY-89012 | KES 50,000 | Chrome/Win + Safari/iOS | 102.x / 41.x | Dual-device detected | Frozen pending review |
| Aug 22 11:15 | PAY-45123 | KES 200,000 | Firefox/Linux | 196.x | Geo-anomaly (Nairobi→Mombasa in 30min) | Released (VP verified) |
| Aug 21 23:45 | PAY-22334 | KES 80,000 | Chrome/Android | 41.x | Velocity spike (8th withdrawal today) | Released (user confirmed) |

---

# PAGE 14: TAX & COMPLIANCE REPORTING

**Purpose:** Manage tax withholding, generate compliance reports, and ensure regulatory adherence.

### Section 14.1: Tax Configuration
| Tax Type | Rate | Applies To | Status |
|----------|------|-----------|--------|
| VAT | 16% | Service fees | ✅ Active |
| Excise Duty | 20% | Mobile money transactions | ✅ Active |
| Withholding Tax (resident) | 5% | Interest income >KES 15,000/month | ✅ Active |
| Withholding Tax (non-resident) | 15% | Interest income | ✅ Active |
| Digital Service Tax | 1.5% | Gross transaction value | ✅ Active |
| Stamp Duty | 1% | Card transactions | ✅ Active |

### Section 14.2: Tax Pool Balances
| Pool | Collected (30d) | Remitted (30d) | Held | Next Remittance |
|------|----------------|----------------|------|-----------------|
| VAT Pool | KES 29.8M | KES 28.2M | KES 1.6M | Sep 20 |
| Excise Duty Pool | KES 37.2M | KES 35.4M | KES 1.8M | Sep 20 |
| WHT Pool | KES 12.4M | KES 11.8M | KES 600K | Sep 20 |
| DST Pool | KES 27.9M | KES 26.5M | KES 1.4M | Sep 20 |

### Section 14.3: Compliance Reports
| Report | Frequency | Last Generated | Status | Due |
|--------|-----------|---------------|--------|-----|
| KRA Returns (VAT) | Monthly | Aug 15 | ✅ Filed | Sep 15 |
| KRA Returns (Income) | Quarterly | Jun 30 | ✅ Filed | Sep 30 |
| CBK prudential returns | Monthly | Jul 31 | ✅ Filed | Aug 31 |
| AML/CFT report | Quarterly | Jun 30 | ✅ Filed | Sep 30 |
| Transaction tax report | Monthly | Jul 31 | ✅ Filed | Aug 31 |
| Beneficial ownership | Annual | Dec 31 | ⏳ Pending | Dec 31 |

### Section 14.4: User Tax Summary
| User | Total Fees Paid | Tax Withheld | Net After Tax | Tax Certificate |
|------|----------------|-------------|---------------|----------------|
| PAY-12345 | KES 34,200 | KES 1,710 | KES 32,490 | Available |
| PAY-67890 | KES 12,800 | KES 640 | KES 12,160 | Available |
| PAY-89012 | KES 2,100 | KES 105 | KES 1,995 | Available |

---

# PAGE 15: FRAUD DASHBOARD

**Purpose:** Central fraud monitoring — alerts, investigations, patterns, and prevention.

### Section 15.1: Fraud Overview
| Metric | Value | Trend | Target |
|--------|-------|-------|--------|
| Fraud alerts (30d) | 234 | ↑ 12% | — |
| Confirmed fraud | 18 | ↓ | <10 |
| Fraud amount (30d) | KES 2.4M | ↓ 15% | <KES 1M |
| Fraud rate | 0.023% | ↓ | <0.05% |
| False positive rate | 34% | ↓ | <20% |
| Avg investigation time | 4.2 hours | ↓ | <2 hours |
| Recovery rate | 67% | ↑ | >80% |

### Section 15.2: Active Alerts
| Alert ID | Time | Type | User | Amount | Risk Score | Status | Assigned |
|----------|------|------|------|--------|------------|--------|----------|
| FRD-2847 | 14:32 | Dual-device withdrawal | PAY-89012 | KES 50,000 | 87 | 🔴 New | — |
| FRD-2846 | 14:15 | Velocity spike | PAY-45123 | KES 200,000 | 72 | 🟡 In review | Sarah K. |
| FRD-2845 | 13:45 | Geo-anomaly | PAY-22334 | KES 80,000 | 65 | 🟡 In review | James O. |
| FRD-2844 | 12:30 | Unusual pattern | PAY-67890 | KES 45,000 | 58 | 🟢 Resolved | Sarah K. |
| FRD-2843 | 11:15 | Account takeover attempt | PAY-11223 | KES 0 | 91 | 🔴 New | — |

### Section 15.3: Fraud Pattern Detection
| Pattern | Description | Last Detected | Frequency | Action |
|---------|-------------|---------------|-----------|--------|
| Dual browser | Same user, 2 browsers, simultaneous withdrawal | Today | 3 this week | Auto-block + alert |
| Rapid cycling | Deposit → Transfer → Withdraw in <5min | Yesterday | 12 this month | Auto-flag |
| Mule account | Receives from many, sends to one | 3 days ago | 2 this month | Auto-freeze |
| Card testing | Multiple small transactions on new card | 1 week ago | 0 this month | Auto-block |
| SIM swap | Login from new device + changed phone number | 2 days ago | 1 this month | Auto-freeze + alert |
| Account farming | Multiple accounts from same device/IP | 5 days ago | 3 this month | Auto-flag |

### Section 15.4: Investigation Workspace
| Section | Content |
|---------|---------|
| Alert details | Full alert context, trigger, user history |
| User timeline | All user activity in last 24h |
| Device fingerprint | Browser, OS, IP, geo, screen resolution |
| Related accounts | Accounts linked by device/IP/payment |
| Evidence | Transaction screenshots, login logs, device history |
| Actions | Freeze, block, escalate, close, contact user |
| Resolution | Fraud confirmed / False positive / Escalated to law enforcement |

### Section 15.5: Blacklist Management
| Type | Entries | Last Updated | Actions |
|------|---------|-------------|---------|
| Device fingerprints | 1,234 | Aug 22 | Add, Remove, View |
| IP addresses | 567 | Aug 22 | Add, Remove, View |
| Phone numbers | 89 | Aug 20 | Add, Remove, View |
| Email domains | 34 | Aug 18 | Add, Remove, View |
| Card BINs | 12 | Aug 15 | Add, Remove, View |

---

# PAGE 16: TRANSACTION MONITORING (SAR)

**Purpose:** Suspicious Activity Report management — flagging, investigating, and reporting suspicious transactions.

### Section 16.1: SAR Pipeline
| Stage | Count | Avg Time |
|-------|-------|----------|
| Auto-flagged by rules | 47 today | Real-time |
| Pending manual review | 23 | — |
| Under investigation | 12 | 4.2 hours |
| Escalated to compliance | 5 | — |
| Filed as SAR | 3 (this month) | — |
| Dismissed (false positive) | 18 (this month) | 1.8 hours |

### Section 16.2: Monitoring Rules
| Rule | Trigger | Severity | Status | False Positive Rate |
|------|---------|----------|--------|-------------------|
| Structuring | Multiple transactions just below reporting threshold | High | ✅ Active | 28% |
| Rapid movement | Large in → large out within 1 hour | High | ✅ Active | 35% |
| Unusual location | Transaction from new country/city | Medium | ✅ Active | 42% |
| High-risk jurisdiction | Transaction to/from FATF grey list country | Critical | ✅ Active | 15% |
| PEP activity | Transaction involving politically exposed person | High | ✅ Active | 55% |
| Cash intensity | >80% of volume is cash-in/cash-out | Medium | ✅ Active | 30% |
| Dormant activation | Large transaction after 90+ days inactive | Medium | ✅ Active | 25% |
| Third-party funding | Account funded by 5+ different accounts | Low | ✅ Active | 40% |

---

# PAGE 17: RISK SCORING ENGINE

**Purpose:** Configure and monitor the automated risk scoring system for users, transactions, and partners.

### Section 17.1: Risk Score Distribution
| Score Range | Users | % | Risk Level | Action |
|------------|-------|---|------------|--------|
| 0–20 | 112,450 | 75.8% | 🟢 Low | Normal operations |
| 21–40 | 24,890 | 16.8% | 🟡 Medium | Enhanced monitoring |
| 41–60 | 8,234 | 5.5% | 🟠 High | Restricted operations |
| 61–80 | 2,340 | 1.6% | 🔴 Very High | Manual review required |
| 81–100 | 478 | 0.3% | ⛔ Critical | Auto-freeze + alert |

### Section 17.2: Scoring Factors
| Factor | Weight | Description |
|--------|--------|-------------|
| Transaction velocity | 20% | How fast transactions occur |
| Amount anomaly | 15% | Deviation from user's normal pattern |
| Device trust | 15% | New device = higher risk |
| Geographic risk | 15% | Location-based risk assessment |
| Account age | 10% | Newer accounts = higher risk |
| KYC completeness | 10% | Incomplete KYC = higher risk |
| Historical flags | 10% | Past fraud flags increase score |
| Network analysis | 5% | Connections to high-risk accounts |

### Section 17.3: Risk-Based Actions
| Risk Score | Transaction Limits | Withdrawal Limits | Additional Verification | Support Priority |
|-----------|-------------------|-------------------|------------------------|-----------------|
| 0–20 | Standard | Standard | None | Normal |
| 21–40 | Standard | Standard | None | Normal |
| 41–60 | 50% of standard | 50% of standard | OTP for >KES 50K | Priority |
| 61–80 | 25% of standard | 25% of standard | OTP for all + admin review >KES 10K | High |
| 81–100 | Frozen | Frozen | Manual approval for any | Critical |

---

# PAGE 18: AML & SANCTIONS

**Purpose:** Anti-Money Laundering compliance — screening, monitoring, reporting.

### Section 18.1: AML Dashboard
| Metric | Value |
|--------|-------|
| Users screened (30d) | 148,392 |
| PEP matches | 23 |
| Sanctions matches | 2 |
| Adverse media matches | 12 |
| SARs filed (YTD) | 34 |
| Regulatory inquiries | 3 |

### Section 18.2: Screening Lists
| List | Source | Entries | Last Updated | Status |
|------|--------|---------|-------------|--------|
| OFAC SDN | US Treasury | 12,847 | Aug 22 | ✅ Active |
| EU Sanctions | EU Council | 8,234 | Aug 22 | ✅ Active |
| UN Sanctions | UN Security Council | 2,567 | Aug 22 | ✅ Active |
| Kenya PEP list | Ethics & Anti-Corruption | 1,234 | Aug 15 | ✅ Active |
| FATF High-Risk | FATF | 23 | Aug 22 | ✅ Active |
| CBK AML list | Central Bank of Kenya | 456 | Aug 15 | ✅ Active |

### Section 18.3: CDD (Customer Due Diligence) Requirements
| Risk Level | CDD Level | Requirements | Frequency |
|-----------|-----------|-------------|-----------|
| Low | Simplified | Phone + Name + DOB | Onboarding |
| Medium | Standard | ID + Address verification | Onboarding + annual |
| High | Enhanced (EDD) | ID + Address + Source of funds + Face + Biometric | Onboarding + 6-monthly |
| Critical | Enhanced + Ongoing | Full EDD + continuous monitoring + management approval | Continuous |

---

# PAGE 19: INCIDENT RESPONSE

**Purpose:** Manage security incidents, system outages, and operational issues.

### Section 19.1: Active Incidents
| Incident ID | Severity | Title | Started | Duration | Status | Assigned |
|------------|----------|-------|---------|----------|--------|----------|
| INC-0047 | 🟡 Medium | M-Pesa callback delays | 14:00 | 32min | 🔧 Investigating | Ops Team |
| INC-0046 | 🟢 Low | Slow card processing (Visa) | 13:45 | 47min | 🔧 Investigating | James O. |

### Section 19.2: Incident History
| ID | Date | Severity | Title | Duration | Resolution | Users Affected |
|----|------|----------|-------|----------|------------|----------------|
| INC-0045 | Aug 20 | 🔴 Critical | Database failover | 12min | Automatic failover | 0 |
| INC-0044 | Aug 18 | 🟡 Medium | M-Pesa outage | 2h 15min | Safaricom resolved | 12,450 |
| INC-0043 | Aug 15 | 🟢 Low | Slow API response | 30min | Scaling resolved | 0 |

### Section 19.3: Runbook Library
| Incident Type | Runbook | Last Updated | Owner |
|--------------|---------|-------------|-------|
| Payment gateway down | [View] | Aug 1 | Ops Manager |
| Database failover | [View] | Jul 15 | DevOps Lead |
| Fraud surge | [View] | Aug 10 | Compliance Lead |
| Data breach | [View] | Jun 1 | Security Lead |
| Partner settlement failure | [View] | Jul 20 | Finance Manager |

---

# PAGE 20: SERVICE PORTFOLIO

**Purpose:** Overview of all services PayMo offers, their status, revenue, and configuration.

### Section 20.1: Service Catalog
| Service | Category | Status | Users | Revenue (30d) | Fee Structure |
|---------|----------|--------|-------|--------------|---------------|
| Mobile Money (M-Pesa) | Payments | ✅ Active | 134,200 | KES 82.3M | 1.5–2.0% |
| Card Payments (Visa/MC) | Cards | ✅ Active | 89,400 | KES 28.4M | 2.5% |
| Bank Transfers | Banking | ✅ Active | 112,300 | KES 18.7M | 1.0% flat |
| ATM Withdrawals | Banking | ✅ Active | 67,800 | KES 8.7M | KES 35 flat |
| Bill Payments (Utilities) | Utilities | ✅ Active | 78,900 | KES 12.8M | 1.0% |
| International Transfers | Remittance | ✅ Active | 12,400 | KES 4.5M | 3.5% |
| Virtual Cards | Cards | ✅ Active | 34,500 | KES 6.2M | 2.0% |
| Savings Pockets | Savings | ✅ Active | 45,600 | KES 2.1M (interest) | 0% (earn interest) |
| Micro-Loans | Lending | ✅ Active | 23,400 | KES 18.2M | 4–8% monthly |
| Business Accounts | Business | ✅ Active | 8,900 | KES 12.4M | Custom |

### Section 20.2: Service Health
| Service | Uptime (30d) | Latency (p95) | Error Rate | Status |
|---------|-------------|---------------|------------|--------|
| M-Pesa Gateway | 99.98% | 3.2s | 0.08% | 🟢 |
| Card Processing | 99.99% | 1.8s | 0.02% | 🟢 |
| Bank Transfer | 99.95% | 45s | 0.15% | 🟢 |
| ATM Network | 99.92% | 12s | 0.22% | 🟢 |
| Bill Payment | 99.97% | 8.5s | 0.03% | 🟢 |
| Internal Transfer | 99.99% | 0.3s | 0.01% | 🟢 |

---

# PAGE 21: PRODUCT CONFIGURATION

**Purpose:** Configure individual product settings, limits, and behavior.

### Section 21.1: Product Settings
| Product | Setting | Current Value | Editable |
|---------|---------|--------------|----------|
| M-Pesa | Max cash-in per transaction | KES 150,000 | ✅ |
| M-Pesa | Daily cash-in limit | KES 300,000 | ✅ |
| M-Pesa | Business till number | 123456 | ❌ |
| Cards | BIN range | 412345–412399 | ❌ |
| Cards | Default card limit | KES 500,000/month | ✅ |
| Cards | Allow international | Yes | ✅ |
| ATM | Max per withdrawal | KES 40,000 | ✅ |
| ATM | Daily limit | KES 100,000 | ✅ |
| Loans | Max amount | KES 500,000 | ✅ |
| Loans | Interest rate range | 4–8% monthly | ✅ |
| Loans | Default penalty | 2% monthly on overdue | ✅ |
| Savings | Interest rate | 8.5% APY | ✅ |
| Savings | Min balance | KES 100 | ✅ |

---

# PAGE 22: RECURRING SERVICES

**Purpose:** Manage subscription billing, auto-pay, and recurring transactions.

### Section 22.1: Recurring Service Overview
| Service | Subscribers | Monthly Revenue | Status |
|---------|------------|----------------|--------|
| PayMo Premium (VIP) | 12,400 | KES 12.4M | ✅ Active |
| Business Suite | 3,200 | KES 9.6M | ✅ Active |
| Insurance Cover | 8,900 | KES 4.5M | ✅ Active |
| Savings Auto-Debit | 23,400 | KES 11.7M | ✅ Active |
| Loan Repayment | 18,200 | KES 18.2M | ✅ Active |
| Utility Auto-Pay | 34,500 | KES 8.7M | ✅ Active |

### Section 22.2: Failed Recurring Payments
| User | Service | Amount | Reason | Retries | Next Retry | Status |
|------|---------|--------|--------|---------|------------|--------|
| PAY-12345 | Premium | KES 999 | Insufficient funds | 2/3 | Aug 25 | ⏳ Retry pending |
| PAY-67890 | Insurance | KES 1,500 | Card expired | 3/3 | — | 🔴 Cancelled |

---

# PAGE 23: CARD PROGRAMS

**Purpose:** Manage all card products — physical, virtual, corporate, prepaid.

### Section 23.1: Card Program Overview
| Program | Cards Issued | Active | Revenue (30d) | Fraud Rate |
|---------|-------------|--------|--------------|------------|
| PayMo Debit (Physical) | 67,800 | 54,200 | KES 18.4M | 0.012% |
| PayMo Virtual | 34,500 | 28,900 | KES 6.2M | 0.008% |
| PayMo Business | 8,900 | 7,200 | KES 4.8M | 0.005% |
| PayMo Prepaid | 12,400 | 9,800 | KES 2.1M | 0.015% |

### Section 23.2: Card Lifecycle
| Stage | Count |
|-------|-------|
| Applied | 234 |
| Approved, pending issuance | 189 |
| Issued, pending activation | 345 |
| Active | 100,100 |
| Blocked (user) | 2,340 |
| Blocked (admin) | 89 |
| Expired | 12,450 |
| Closed | 1,234 |

---

# PAGE 24: UTILITY SERVICES

**Purpose:** Manage utility payment integrations — electricity, water, internet, mobile.

### Section 24.1: Utility Integrations
| Utility | Provider | Status | Transactions (30d) | Volume | Commission |
|---------|----------|--------|-------------------|--------|------------|
| Electricity | KPLC | ✅ Active | 89,200 | KES 34.5M | 1.5% |
| Water | Nairobi Water | ✅ Active | 34,500 | KES 8.7M | 1.0% |
| Internet | Safaricom Home | ✅ Active | 23,400 | KES 12.4M | 2.0% |
| DSTV | MultiChoice | ✅ Active | 12,300 | KES 8.9M | 1.5% |
| Airtime | Safaricom/Airtel | ✅ Active | 145,600 | KES 21.8M | 5.0% |
| Cash Power | KPLC Prepaid | ✅ Active | 67,800 | KES 28.4M | 1.5% |

### Section 24.2: Utility Health
| Utility | Success Rate | Avg Response | Errors (30d) | Status |
|---------|-------------|-------------|-------------|--------|
| KPLC | 99.2% | 8.5s | 714 | 🟢 |
| Nairobi Water | 98.8% | 12.3s | 414 | 🟢 |
| Safaricom Home | 99.5% | 6.2s | 117 | 🟢 |
| DSTV | 99.1% | 10.1s | 111 | 🟢 |
| Airtime | 99.8% | 2.1s | 291 | 🟢 |

---

# PAGE 25: PARTNER DIRECTORY

**Purpose:** Manage all business partners — banks, telcos, merchants, fintechs.

### Section 25.1: Partner Overview
| Partner | Type | Status | Transactions (30d) | Revenue | Settlement |
|---------|------|--------|-------------------|---------|------------|
| Safaricom (M-Pesa) | Telco | ✅ Active | 434,567 | KES 82.3M | T+1 |
| KCB Bank | Bank | ✅ Active | 123,456 | KES 18.7M | T+1 |
| Equity Bank | Bank | ✅ Active | 89,123 | KES 12.4M | T+1 |
| Visa Kenya | Card Network | ✅ Active | 89,012 | KES 14.2M | T+2 |
| Mastercard EA | Card Network | ✅ Active | 45,678 | KES 8.9M | T+2 |
| QuickLend | Fintech (Lending) | 🟡 Warning | 23,456 | KES 6.7M | Overdue |
| InsurePay | Fintech (Insurance) | ✅ Active | 12,345 | KES 4.5M | T+3 |
| KPLC | Utility | ✅ Active | 157,000 | KES 12.8M | T+1 |
| DStv/MultiChoice | Media | ✅ Active | 12,300 | KES 1.2M | T+7 |

### Section 25.2: Partner Detail View
| Section | Content |
|---------|---------|
| Profile | Company info, contact, contract terms |
| Integration | API status, webhook health, SLA metrics |
| Financials | Revenue share, settlement history, outstanding |
| Performance | Uptime, error rate, dispute rate |
| Compliance | Regulatory status, license expiry, audit results |
| Actions | Suspend, Terminate, Adjust terms, Send notification |

---

# PAGE 26: PARTNER ONBOARDING

**Purpose:** End-to-end partner onboarding workflow.

### Section 26.1: Onboarding Pipeline
| Stage | Partners | Avg Time |
|-------|----------|----------|
| Application received | 3 | — |
| Due diligence | 2 | 5 days |
| Contract negotiation | 1 | 3 days |
| Technical integration | 2 | 7 days |
| UAT (testing) | 1 | 3 days |
| Go-live | 0 | — |

### Section 26.2: Partner Application Form
| Field | Required |
|-------|----------|
| Company name | ✅ |
| Registration number | ✅ |
| KRA PIN | ✅ |
| Business type | ✅ |
| Contact person | ✅ |
| Integration type | ✅ |
| Transaction volume estimate | ✅ |
| Revenue share proposal | ✅ |
| Compliance certifications | ✅ |
| Technical documentation | ✅ |

---

# PAGE 27: INVESTOR DASHBOARD

**Purpose:** Investor relations — portfolio performance, cap table, reports, distributions.

### Section 27.1: Investment Overview
| Metric | Value | Trend |
|--------|-------|-------|
| Total raised (YTD) | KES 450M | ↑ |
| Valuation (post-money) | KES 4.5B | ↑ 12% |
| Investors | 23 | ↑ 3 new |
| Monthly burn rate | KES 18M | ↓ |
| Runway | 24 months | — |
| Revenue (ARR) | KES 2.2B | ↑ 34% |
| Users | 148,392 | ↑ 42% |
| Transaction volume (ARR) | KES 223B | ↑ 28% |

### Section 27.2: Cap Table
| Investor | Shares | % Ownership | Investment | Date | Stage |
|----------|--------|-------------|------------|------|-------|
| Founder (Joseph M.) | 5,000,000 | 50.0% | KES 10M | Jan 2023 | Pre-seed |
| TechVentures Africa | 1,500,000 | 15.0% | KES 75M | Jun 2023 | Seed |
| Greenfield Capital | 1,000,000 | 10.0% | KES 120M | Mar 2024 | Series A |
| Nairobi Angels | 500,000 | 5.0% | KES 50M | Mar 2024 | Series A |
| Employee pool | 1,000,000 | 10.0% | — | Ongoing | ESOP |
| Other investors | 1,000,000 | 10.0% | KES 205M | Various | Various |

### Section 27.3: Investor Reports
| Report | Frequency | Last Sent | Next Due | Status |
|--------|-----------|-----------|----------|--------|
| Monthly flash report | Monthly | Aug 1 | Sep 1 | ✅ |
| Quarterly business review | Quarterly | Jul 15 | Oct 15 | ✅ |
| Annual audited financials | Annual | Mar 31, 2026 | Mar 31, 2027 | ⏳ |
| Board deck | Quarterly | Jul 10 | Oct 10 | ✅ |
| Cap table update | On change | Aug 5 | — | ✅ |

---

# PAGE 28: INVESTOR REPORTS

**Purpose:** Generate and distribute investor reports.

### Section 28.1: Report Generator
| Report Type | Template | Data Source | Format | Distribution |
|------------|---------|-------------|--------|-------------|
| Monthly flash | Standard | Dashboard API | PDF | Email |
| Quarterly review | Detailed | Full data export | PDF + Excel | Email + Portal |
| Board deck | Executive | Curated metrics | PDF + PPT | Board meeting |
| Custom | Ad-hoc | Custom query | Any | Custom |

### Section 28.2: KPI Trend Data (for reports)
| KPI | Q1 2026 | Q2 2026 | Q3 2026 (current) | Trend |
|-----|---------|---------|-------------------|-------|
| Users | 89,200 | 118,400 | 148,392 | ↑ 25% |
| MAU | 56,700 | 72,300 | 89,214 | ↑ 23% |
| Revenue | KES 380M | KES 520M | KES 558M | ↑ 7% |
| Transaction volume | KES 42B | KES 52B | KES 55.8B | ↑ 7% |
| CAC | KES 450 | KES 380 | KES 320 | ↓ 16% |
| LTV | KES 8,900 | KES 10,200 | KES 11,400 | ↑ 12% |
| Churn rate | 4.2% | 3.8% | 3.1% | ↓ 18% |

---

# PAGE 29: ADMIN MANAGEMENT

**Purpose:** Manage all admin users — create, assign roles, monitor activity.

### Section 29.1: Admin Directory
| Admin | Email | Role | Last Active | Status | Sessions (30d) | Actions |
|-------|-------|------|------------|--------|----------------|---------|
| Joseph Mwangi | joseph@paymo.co.ke | Super Admin | 2 min ago | 🟢 Online | 28 | ⋮ |
| Sarah Kimani | sarah@paymo.co.ke | Platform Admin | 15 min ago | 🟢 Online | 25 | ⋮ |
| James Ochieng | james@paymo.co.ke | Ops Manager | 1 hour ago | 🟢 Online | 22 | ⋮ |
| Mary Wanjiku | mary@paymo.co.ke | Compliance Officer | 3 hours ago | 🟡 Away | 20 | ⋮ |
| Peter Kamau | peter@paymo.co.ke | Finance Manager | Yesterday | 🟢 Active | 18 | ⋮ |
| Grace Akinyi | grace@paymo.co.ke | Support Lead | 30 min ago | 🟢 Online | 24 | ⋮ |

### Section 29.2: Admin Actions
| Action | Description | Requires |
|--------|-------------|----------|
| Create admin | Add new admin user | Super Admin |
| Edit profile | Change name, email, phone | Super Admin |
| Assign role | Set permission tier | Super Admin |
| Reset 2FA | Revoke and re-setup TOTP | Super Admin |
| Reset passkey | Revoke and re-register | Super Admin |
| Issue session PIN | Generate new 4-digit PIN | Super Admin |
| Suspend admin | Temporarily disable access | Super Admin |
| Delete admin | Permanent removal | Super Admin + confirmation |
| View activity log | Full audit of admin actions | Super Admin |
| View login history | All login attempts with IP/device | Super Admin |

### Section 29.3: Admin Activity Log
| Time | Admin | Action | Target | Details | IP |
|------|-------|--------|--------|---------|----|
| 14:32 | Joseph M. | Froze account | PAY-89012 | Dual-device fraud | 102.x.x.x |
| 14:15 | Sarah K. | Approved settlement | QuickLend | KES 4.2M | 197.x.x.x |
| 14:10 | James O. | Updated fee schedule | All users | M-Pesa 0.5% → 0.45% | 102.x.x.x |

---

# PAGE 30: PERMISSIONS & ROLES

**Purpose:** Configure role-based access control (RBAC) for the admin system.

### Section 30.1: Role Definitions
| Role | Tier | # Users | Permissions | Editable |
|------|------|---------|-------------|----------|
| Super Admin | 0 | 1 | All permissions | ❌ (system) |
| Platform Admin | 1 | 2 | All except role management | ✅ |
| Operations Manager | 2 | 3 | Users, Transactions, Fraud, Support | ✅ |
| Compliance Officer | 3 | 2 | KYC, AML, Fraud, Audit | ✅ |
| Finance Manager | 4 | 2 | Finance, Settlements, Fees, Reports | ✅ |
| Support Lead | 5 | 1 | Users (view), Support, Notifications | ✅ |
| Minor Admin | 6 | 5 | Custom per admin | ✅ |
| Analyst | 7 | 3 | Read-only dashboards | ✅ |
| Support Agent | 8 | 12 | Users (view), Support queue | ✅ |

### Section 30.2: Permission Editor
| Category | Permission | Toggle |
|----------|-----------|--------|
| Users | View user list | ✅/❌ |
| Users | View user detail | ✅/❌ |
| Users | Edit user profile | ✅/❌ |
| Users | Freeze account | ✅/❌ |
| Users | Close account | ✅/❌ |
| Transactions | View all | ✅/❌ |
| Transactions | Reverse | ✅/❌ |
| Transactions | Set fees | ✅/❌ |
| Fraud | View dashboard | ✅/❌ |
| Fraud | Block transaction | ✅/❌ |
| Fraud | Flag user | ✅/❌ |
| Finance | View P&L | ✅/❌ |
| Finance | Approve settlements | ✅/❌ |
| System | Manage admins | ✅/❌ |
| System | View audit log | ✅/❌ |
| System | Configure system | ✅/❌ |

---

# PAGE 31: AUDIT LOG

**Purpose:** Complete, immutable log of every admin action and system event.

### Section 31.1: Audit Filters
| Filter | Type |
|--------|------|
| Date range | From — To |
| Admin | Dropdown (all admins) |
| Action type | Create, Read, Update, Delete, Approve, Reject |
| Target type | User, Transaction, Admin, System, Partner |
| Target ID | Exact search |
| IP address | Search |

### Section 31.2: Audit Log Table
| Timestamp | Admin | Action | Target | Details | IP | Session |
|-----------|-------|--------|--------|---------|----|---------|
| 2026-08-22 14:32:01 | Joseph M. | FREEZE_ACCOUNT | PAY-89012 | Reason: Dual-device fraud | 102.x.x.x | S-2847 |
| 2026-08-22 14:15:23 | Sarah K. | APPROVE_SETTLEMENT | QuickLend | KES 4.2M disbursed | 197.x.x.x | S-2834 |
| 2026-08-22 14:10:45 | James O. | UPDATE_FEE | All users | M-Pesa 0.5% → 0.45% | 102.x.x.x | S-2831 |
| 2026-08-22 14:05:12 | Joseph M. | GRANT_VIP | PAY-45123 | Platinum tier | 102.x.x.x | S-2847 |

### Section 31.3: Audit Export
| Format | Options |
|--------|---------|
| CSV | All filtered records |
| PDF | Formatted report with summary |
| JSON | Raw data for integration |
| Email | Send to super admin |

---

# PAGE 32: SYSTEM CONFIGURATION

**Purpose:** Platform-wide configuration — API settings, limits, maintenance mode.

### Section 32.1: General Settings
| Setting | Current Value | Editable |
|---------|--------------|----------|
| Platform name | PayMo BAAS | ✅ |
| Support email | support@paymo.co.ke | ✅ |
| Support phone | +254 700 123 456 | ✅ |
| Default currency | KES | ❌ |
| Timezone | Africa/Nairobi (EAT, UTC+3) | ✅ |
| Maintenance mode | 🟢 Off | ✅ |
| Registration enabled | 🟢 On | ✅ |
| KYC required for | Transactions >KES 50,000 | ✅ |

### Section 32.2: Security Settings
| Setting | Current Value | Editable |
|---------|--------------|----------|
| Password policy | Min 8 chars, mixed case + numbers | ✅ |
| Session timeout (admin) | 8 hours | ✅ |
| Session timeout (user) | 24 hours | ✅ |
| Max login attempts | 5 | ✅ |
| Lockout duration | 30 minutes | ✅ |
| 2FA required for | All admin + users >KES 100K | ✅ |
| IP whitelist | Disabled | ✅ |
| Rate limiting | 100 req/min per user | ✅ |

### Section 32.3: Notification Settings
| Channel | Enabled | Configuration |
|---------|---------|---------------|
| SMS | ✅ | Africa's Talking API |
| Email | ✅ | SendGrid |
| Push notifications | ✅ | Firebase FCM |
| In-app | ✅ | WebSocket |
| Webhook | ✅ | Custom endpoints |

### Section 32: Maintenance Mode
| Setting | Details |
|---------|---------|
| Enable maintenance | Toggle on/off |
| Maintenance message | Custom text for users |
| Allowed IPs | IPs that can access during maintenance |
| Scheduled maintenance | Set future date/time |
| Duration estimate | How long maintenance will last |

---

# PAGE 33: API & INTEGRATIONS

**Purpose:** Manage API keys, webhooks, and third-party integrations.

### Section 33.1: API Keys
| Key Name | Type | Permissions | Created | Last Used | Status | Actions |
|----------|------|-------------|---------|-----------|--------|---------|
| Production Main | Server | Full API | Jan 2025 | 2 min ago | 🟢 Active | ⋮ |
| Mobile App iOS | Client | Read + Transact | Mar 2025 | 5 min ago | 🟢 Active | ⋮ |
| Mobile App Android | Client | Read + Transact | Mar 2025 | 3 min ago | 🟢 Active | ⋮ |
| Partner: QuickLend | Server | Lending API | Jun 2025 | 1 hour ago | 🟡 Warning | ⋮ |
| Testing | Server | Sandbox | Jan 2025 | 2 days ago | 🟢 Active | ⋮ |

### Section 33.2: Webhooks
| Event | URL | Status | Success Rate | Last Fired |
|-------|-----|--------|-------------|------------|
| transaction.completed | https://paymo.co.ke/hooks/txn | ✅ | 99.8% | 2s ago |
| user.registered | https://paymo.co.ke/hooks/user | ✅ | 99.9% | 15min ago |
| kyc.completed | https://paymo.co.ke/hooks/kyc | ✅ | 99.7% | 1hr ago |
| fraud.detected | https://paymo.co.ke/hooks/fraud | ✅ | 100% | 3hr ago |

### Section 33.3: Integration Health
| Integration | Status | Latency | Uptime (30d) | Errors |
|-------------|--------|---------|-------------|--------|
| M-Pesa Daraja API | 🟢 | 3.2s | 99.98% | 23 |
| Visa VTS | 🟢 | 1.8s | 99.99% | 8 |
| Mastercard MDES | 🟢 | 2.1s | 99.97% | 12 |
| SendGrid | 🟢 | 0.8s | 99.99% | 3 |
| Africa's Talking | 🟢 | 1.2s | 99.95% | 34 |
| KRA TIMS | 🟢 | 5.4s | 99.92% | 18 |
| CBK Reporting | 🟢 | 8.2s | 99.88% | 7 |

---

# PAGE 34: FEATURE FLAGS

**Purpose:** Toggle platform features on/off without deployment.

### Section 34.1: Feature Flags
| Feature | Description | Status | Rollout | Target |
|---------|-------------|--------|---------|--------|
| Virtual Cards | Issue virtual Visa cards | 🟢 Enabled | 100% | All users |
| Savings Pockets | Interest-bearing savings | 🟢 Enabled | 100% | All users |
| Micro-Loans | In-app lending | 🟢 Enabled | 80% | KYC Tier 2+ |
| International Transfers | Send money abroad | 🟢 Enabled | 100% | KYC Tier 3 |
| Biometric Login | Fingerprint/face login | 🟢 Enabled | 100% | All users |
| Chat Support | In-app customer support | 🟡 Beta | 20% | Random 20% |
| Crypto Wallet | Hold BTC/ETH | 🔴 Disabled | 0% | — |
| Joint Accounts | Shared accounts | 🔴 Disabled | 0% | — |
| Business invoicing | Create/send invoices | 🟡 Beta | 10% | Business accounts |

### Section 34.2: Flag Actions
| Action | Description |
|--------|-------------|
| Toggle | Enable/disable feature |
| Set rollout % | Percentage of users who see feature |
| Target by tier | Restrict to specific user tiers |
| Target by region | Restrict to specific counties |
| Schedule | Enable/disable at specific time |
| Kill switch | Immediately disable for all users |

---

# PAGE 35: NOTIFICATION CENTER

**Purpose:** Manage all platform notifications — transactional, marketing, system.

### Section 35.1: Notification Statistics
| Channel | Sent (30d) | Delivered | Opened | Clicked | Failed |
|---------|-----------|-----------|--------|---------|--------|
| SMS | 1,245,678 | 1,198,456 (96.2%) | — | — | 47,222 |
| Email | 234,567 | 228,901 (97.6%) | 89,234 (38.9%) | 23,456 | 5,666 |
| Push | 890,123 | 845,678 (95.0%) | 234,567 (26.3%) | 67,890 | 44,445 |
| In-app | 345,678 | 345,678 (100%) | 123,456 (35.7%) | 34,567 | 0 |

### Section 35.2: Notification Templates
| Template | Type | Channel | Trigger | Last Updated |
|----------|------|---------|---------|-------------|
| Transaction complete | Transactional | SMS + Push | Any completed txn | Aug 1 |
| Login alert | Security | SMS + Email | New device login | Jul 15 |
| Low balance | Alert | SMS + Push | Balance <KES 500 | Jul 20 |
| KYC reminder | Compliance | SMS + Email | KYC pending >7 days | Aug 10 |
| Bill due | Utility | Push + Email | Bill payment due | Aug 5 |
| Fraud alert | Security | SMS + Email + Push | Fraud detected | Aug 1 |
| Welcome | Onboarding | Email + Push | New registration | Jul 1 |
| Monthly statement | Reporting | Email | 1st of month | Jul 31 |

---

# PAGE 36: BROADCAST MESSAGES

**Purpose:** Send mass notifications to user segments.

### Section 36.1: Broadcast History
| ID | Date | Subject | Segment | Channel | Sent | Delivered | Opened |
|----|------|---------|---------|---------|------|-----------|--------|
| BC-0047 | Aug 22 | System maintenance notice | All users | SMS + Push | 148,392 | 145,234 | — |
| BC-0046 | Aug 20 | New feature: Virtual cards | All users | Email + Push | 148,392 | 142,890 | 56,780 |
| BC-0045 | Aug 18 | Fee reduction announcement | All users | SMS | 148,392 | 146,123 | — |
| BC-0044 | Aug 15 | VIP exclusive: Early access | VIP users | Email | 12,400 | 12,100 | 8,900 |

### Section 36.2: Broadcast Composer
| Field | Options |
|-------|---------|
| Subject | Text |
| Message | Rich text / Plain text / Template |
| Segment | All / VIP / Business / County / Custom |
| Channel | SMS / Email / Push / In-app / Multi |
| Schedule | Now / Later (date/time) |
| A/B test | Split test with variants |
| Approval | Required for >10,000 recipients |

### Section 36.3: Segment Builder
| Filter | Type |
|--------|------|
| Account status | Active, Frozen, etc. |
| KYC tier | Tier 0–3 |
| Balance range | Min — Max |
| Registration date | Date range |
| Last active | Date range |
| Transaction volume | Min — Max |
| County | Multi-select |
| VIP status | Yes / No |
| Account type | Individual / Business |
| Custom field | Dynamic |

---

# PAGE 37: CUSTOMER SUPPORT QUEUE

**Purpose:** Manage inbound customer support tickets and inquiries.

### Section 37.1: Support Metrics
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Open tickets | 23 | <50 | 🟢 |
| Avg first response | 4.2 min | <5 min | 🟢 |
| Avg resolution time | 2.1 hours | <4 hours | 🟢 |
| CSAT score | 4.3/5 | >4.0 | 🟢 |
| Tickets today | 145 | — | — |
| Resolved today | 122 | — | — |
| Escalated today | 3 | — | — |

### Section 37.2: Ticket Queue
| Ticket ID | User | Subject | Priority | Category | Assigned | Status | Wait Time |
|-----------|------|---------|----------|----------|----------|--------|-----------|
| TKT-4521 | PAY-89012 | Cannot withdraw | 🔴 Urgent | Transaction | Grace A. | 🔧 In progress | 3 min |
| TKT-4520 | PAY-45123 | Wrong amount charged | 🟡 High | Fee dispute | James O. | ⏳ Queued | 12 min |
| TKT-4519 | PAY-67890 | Card not working | 🟡 High | Card issue | Grace A. | 🔧 In progress | 18 min |
| TKT-4518 | PAY-22334 | How to enable 2FA | 🟢 Normal | Account setup | — | ⏳ Queued | 25 min |

### Section 37.3: Ticket Detail
| Section | Content |
|---------|---------|
| User info | Profile, account history, risk level |
| Conversation | Full message thread (user + agent) |
| Actions taken | System actions related to ticket |
| Related tickets | Previous tickets from same user |
| Quick actions | Freeze, refund, adjust fee, escalate |
| Resolution | Close, escalate, follow-up |

---

# PAGE 38: TERMS & CONDITIONS

**Purpose:** Manage platform terms, version control, and user acceptance tracking.

### Section 38.1: Document Versions
| Version | Date | Changes | Users Accepted | Status |
|---------|------|---------|---------------|--------|
| v3.2 | Aug 1, 2026 | Updated fee structure, added crypto terms | 134,210 (90.4%) | ✅ Current |
| v3.1 | May 15, 2026 | Updated privacy terms | 118,400 | ⚪ Superseded |
| v3.0 | Jan 1, 2026 | Major rewrite — new lending terms | 98,200 | ⚪ Superseded |

### Section 38.2: T&C Editor
| Section | Title | Last Updated | Editable |
|---------|-------|-------------|----------|
| 1 | Acceptance of Terms | Aug 1 | ✅ |
| 2 | Account Registration | Aug 1 | ✅ |
| 3 | Transaction Terms | Aug 1 | ✅ |
| 4 | Fees & Charges | Aug 1 | ✅ |
| 5 | Privacy & Data | Aug 1 | ✅ |
| 6 | Fraud & Liability | Aug 1 | ✅ |
| 7 | Dispute Resolution | Aug 1 | ✅ |
| 8 | Termination | Aug 1 | ✅ |
| 9 | Governing Law | Aug 1 | ✅ |
| 10 | Changes to Terms | Aug 1 | ✅ |

### Section 38.3: Acceptance Tracking
| User Segment | Total | Accepted v3.2 | Pending | Last Reminder Sent |
|-------------|-------|---------------|---------|-------------------|
| All users | 148,392 | 134,210 (90.4%) | 14,182 | Aug 15 |
| Active users | 89,214 | 87,456 (98.0%) | 1,758 | Aug 15 |
| New users (Aug) | 8,412 | 8,412 (100%) | 0 | — |

---

# PAGE 39: PRIVACY POLICY

**Purpose:** Manage privacy policy, data processing agreements, and GDPR-like compliance.

### Section 39.1: Privacy Policy Versions
| Version | Date | Status | Users Notified |
|---------|------|--------|---------------|
| v2.1 | Aug 1, 2026 | ✅ Current | 148,392 |
| v2.0 | Mar 1, 2026 | ⚪ Superseded | — |

### Section 39.2: Data Processing Summary
| Data Category | Purpose | Retention | Legal Basis | Shared With |
|--------------|---------|-----------|-------------|-------------|
| Identity (ID, name) | KYC compliance | Account life + 7 years | Legal obligation | KRA, CBK |
| Financial (transactions) | Service provision | Account life + 7 years | Contract | Partners (settlement) |
| Device/IP | Security | 90 days | Legitimate interest | — |
| Location | Fraud prevention | 30 days | Legitimate interest | — |
| Communications | Support | 2 years | Contract | — |

### Section 39.3: User Data Requests
| Request Type | Pending | Avg Response Time | SLA |
|-------------|---------|-------------------|-----|
| Data export (DSAR) | 3 | 12 hours | 72 hours |
| Data deletion | 1 | 24 hours | 30 days |
| Consent withdrawal | 2 | 2 hours | 24 hours |
| Data correction | 0 | — | 72 hours |

---

# PAGE 40: COMPLIANCE DOCUMENTS

**Purpose:** Store and manage regulatory compliance documents.

### Section 40.1: Document Repository
| Document | Category | Last Updated | Expiry | Status | Owner |
|----------|----------|-------------|--------|--------|-------|
| CBK License | Regulatory | Jan 2026 | Dec 2026 | ✅ Valid | Legal |
| Data Protection Registration | Regulatory | Mar 2026 | Mar 2027 | ✅ Valid | Compliance |
| PCI DSS Certificate | Security | Jun 2026 | Jun 2027 | ✅ Valid | Security |
| ISO 27001 | Security | Apr 2026 | Apr 2027 | ✅ Valid | Security |
| AML/CFT Policy | Internal | Jul 2026 | Jul 2027 | ✅ Current | Compliance |
| Business Continuity Plan | Internal | May 2026 | May 2027 | ✅ Current | Ops |
| Incident Response Plan | Internal | Jun 2026 | Jun 2027 | ✅ Current | Security |

### Section 40.2: Compliance Calendar
| Event | Due Date | Status | Assigned |
|-------|----------|--------|----------|
| CBK annual return | Sep 30 | ⏳ Pending | Finance |
| PCI DSS recertification | Jun 2027 | ✅ Scheduled | Security |
| AML training (all staff) | Sep 15 | ⏳ Scheduled | Compliance |
| DPO annual report | Dec 31 | ⏳ Pending | Compliance |
| External audit | Nov 15 | ⏳ Scheduled | Finance |

---

# PAGE 41: DOCUMENT TEMPLATES

**Purpose:** Manage reusable document templates for notifications, agreements, and reports.

### Section 41.1: Template Library
| Template | Type | Used For | Last Updated | Variables |
|----------|------|---------|-------------|-----------|
| Welcome email | Email | New registration | Jul 1 | name, phone |
| KYC reminder | SMS | KYC pending | Aug 1 | name, days_pending |
| Account frozen | SMS + Email | Account freeze | Aug 1 | name, reason |
| Settlement notice | Email | Partner settlement | Jul 15 | partner, amount |
| Monthly statement | PDF | Monthly report | Jul 31 | user, transactions, balance |
| T&C acceptance | Email + Push | New T&C version | Aug 1 | version, changes |
| Fraud alert | SMS + Email | Fraud detected | Aug 1 | amount, action |
| Loan approval | Email | Loan approved | Jul 1 | name, amount, rate |
| VIP welcome | Email | VIP granted | Jul 1 | name, tier, benefits |

---

# PAGE 42: ANALYTICS DASHBOARD

**Purpose:** Advanced analytics — cohort analysis, funnel visualization, predictive metrics.

### Section 42.1: User Cohort Analysis
| Cohort | Month 0 | Month 1 | Month 3 | Month 6 | Month 12 |
|--------|---------|---------|---------|---------|----------|
| Jan 2026 | 12,400 | 9,920 (80%) | 7,440 (60%) | 5,580 (45%) | 3,720 (30%) |
| Feb 2026 | 10,800 | 8,640 (80%) | 6,480 (60%) | 4,860 (45%) | — |
| Mar 2026 | 14,200 | 11,786 (83%) | 8,946 (63%) | — | — |
| Apr 2026 | 11,500 | 9,775 (85%) | — | — | — |

### Section 42.2: Revenue Analytics
| Metric | Value | Chart |
|--------|-------|-------|
| Revenue by source | KES 186M | Stacked bar |
| Revenue by county | KES 186M | Heatmap |
| Revenue by user tier | KES 186M | Pie |
| Revenue trend (12m) | KES 2.2B ARR | Line |
| Revenue per user | KES 1,253 | Line |
| CAC:LTV ratio | 1:35.6 | Gauge |

### Section 42.3: Funnel Analysis
| Stage | Users | % | Drop-off |
|-------|-------|---|----------|
| App install | 234,567 | 100% | — |
| Registration started | 198,345 | 84.6% | -15.4% |
| Registration complete | 178,901 | 76.3% | -8.3% |
| KYC submitted | 156,789 | 66.8% | -9.5% |
| KYC approved | 148,392 | 63.3% | -3.5% |
| First transaction | 112,456 | 47.9% | -15.4% |
| Active (30d) | 89,214 | 38.0% | -9.9% |
| Power user (weekly) | 45,678 | 19.5% | -18.5% |

### Section 42.4: Predictive Analytics
| Prediction | Value | Confidence | Method |
|-----------|-------|------------|--------|
| Users (next month) | 156,000 | 87% | Linear regression + seasonality |
| Revenue (next month) | KES 205M | 82% | ARIMA model |
| Churn risk (next 30d) | 4,200 users | 78% | Gradient boosting |
| Fraud probability (next 7d) | 34 alerts | 71% | Anomaly detection |
| Loan default risk | 2.1% | 85% | Logistic regression |

### Section 42.5: Custom Report Builder
| Option | Choices |
|--------|---------|
| Metric | Revenue, Users, Transactions, Fraud, etc. |
| Dimension | Time, County, Channel, Tier, Product |
| Filter | Any combination of above |
| Grouping | Daily, Weekly, Monthly, Quarterly |
| Visualization | Line, Bar, Pie, Heatmap, Table |
| Export | CSV, PDF, API endpoint |

---

# DATA MODEL SUMMARY

## Core Entities

| Entity | Key Fields | Relationships |
|--------|-----------|---------------|
| User | id, phone, email, name, status, risk_score, vip_tier, kyc_tier | has many Transactions, has one Wallet |
| Transaction | id, user_id, type, amount, fee, channel, status, fraud_score | belongs to User, has many StatusUpdates |
| Wallet | id, user_id, balance, available, reserved | belongs to User |
| Admin | id, email, name, role, status, permissions | has many AuditLogs |
| Partner | id, company_name, type, status, revenue_share | has many Settlements |
| Investor | id, company_name, shares, investment_amount | has many Reports |
| Card | id, user_id, type, status, limit | belongs to User |
| Alert | id, type, user_id, severity, status, assigned_to | belongs to User |
| Settlement | id, partner_id, amount, period, status | belongs to Partner |
| Notification | id, user_id, channel, template, status | belongs to User |
| AuditLog | id, admin_id, action, target_type, target_id, details | belongs to Admin |
| FeatureFlag | id, name, enabled, rollout_pct, target | — |
| FeeConfig | id, type, rate, min, max, effective_date | — |
| KYCDocument | id, user_id, type, status, uploaded_at, verified_at | belongs to User |
| Pool | id, name, balance, reserved, min_reserve | has many PoolMovements |

---

# NAVIGATION FLOW MAP

```
LOGIN (4 gates)
    ↓
DASHBOARD HOME (Page 1)
    ├── REAL-TIME MONITOR (Page 2)
    ├── KPI SCORECARD (Page 3)
    │
    ├──→ USER MANAGEMENT
    │    ├── User Directory (Page 4) → User Detail (Page 5)
    │    ├── KYC Verification (Page 6)
    │    ├── Account Lifecycle (Page 7)
    │    └── VIP Clients (Page 8)
    │
    ├──→ TRANSACTIONS & FINANCE
    │    ├── Transaction Ledger (Page 9) → Transaction Detail (Page 9)
    │    ├── Fee Management (Page 10)
    │    ├── Settlement & Reconciliation (Page 11)
    │    ├── Liquidity & Pools (Page 12)
    │    ├── Withdrawal Controls (Page 13)
    │    └── Tax & Compliance (Page 14)
    │
    ├──→ FRAUD & RISK
    │    ├── Fraud Dashboard (Page 15)
    │    ├── Transaction Monitoring (Page 16)
    │    ├── Risk Scoring (Page 17)
    │    ├── AML & Sanctions (Page 18)
    │    └── Incident Response (Page 19)
    │
    ├──→ PRODUCTS & SERVICES
    │    ├── Service Portfolio (Page 20)
    │    ├── Product Config (Page 21)
    │    ├── Recurring Services (Page 22)
    │    ├── Card Programs (Page 23)
    │    └── Utility Services (Page 24)
    │
    ├──→ PARTNERS & INVESTORS
    │    ├── Partner Directory (Page 25)
    │    ├── Partner Onboarding (Page 26)
    │    ├── Investor Dashboard (Page 27)
    │    └── Investor Reports (Page 28)
    │
    ├──→ PLATFORM ADMINISTRATION
    │    ├── Admin Management (Page 29) → Admin Detail (Page 29)
    │    ├── Permissions & Roles (Page 30)
    │    ├── Audit Log (Page 31)
    │    ├── System Config (Page 32)
    │    ├── API & Integrations (Page 33)
    │    └── Feature Flags (Page 34)
    │
    ├──→ COMMUNICATIONS
    │    ├── Notification Center (Page 35)
    │    ├── Broadcast Messages (Page 36)
    │    └── Support Queue (Page 37)
    │
    ├──→ DOCUMENTS & LEGAL
    │    ├── Terms & Conditions (Page 38)
    │    ├── Privacy Policy (Page 39)
    │    ├── Compliance Docs (Page 40)
    │    └── Document Templates (Page 41)
    │
    └──→ ANALYTICS (Page 42)
```

---

# ANTI-FRAUD & MONEY LAUNDERING CONTROLS

## Dual-Device / Simultaneous Withdrawal Prevention

| Control | Implementation | Response Time |
|---------|---------------|---------------|
| Device fingerprinting | Canvas + WebGL + audio context hash | Real-time |
| Session correlation | Track all active sessions per user | Real-time |
| Simultaneous action detection | Alert if 2 sessions from different devices perform financial actions within 60s | <100ms |
| IP reputation | Check against known VPN/proxy/Tor exit nodes | <200ms |
| Device trust score | Based on history, age, number of accounts seen | Real-time |
| Geo-velocity | Flag if device moved >500km in <1 hour | Real-time |

## Repetitive Transaction Controls

| Control | Threshold | Action |
|---------|-----------|--------|
| Same-amount repeating | 3+ identical amounts in 1 hour | Flag + alert |
| Same-recipient repeating | 5+ transfers to same account in 24 hours | Flag + alert |
| Round-amount concentration | >80% of transactions are round amounts (1K, 5K, 10K) | Flag for review |
| Time-pattern detection | Transactions at exact intervals (automation) | Flag + alert |
| Amount escalation | 3+ transactions with increasing amounts to same recipient | Flag for review |

## Money Laundering Indicators

| Indicator | Detection Method | Response |
|-----------|-----------------|----------|
| Structuring | Multiple transactions just below reporting threshold | Auto-flag |
| Layering | Rapid movement through multiple accounts | Auto-flag + freeze |
| Integration | Large deposits from unexplained sources | Manual review |
| Cash intensity | >60% of volume is cash-in/cash-out | Enhanced monitoring |
| Mule accounts | Receives from many, sends to few | Auto-freeze |
| Dormant activation | Large transaction after 90+ days inactive | Manual review |

---

# END-TO-END WORKFLOW: FRAUDULENT WITHDRAWAL PREVENTION

```
[User initiates withdrawal]
    ↓
[GATE 1: Device Check]
├── Same device as last 5 transactions? → ✅ Continue
├── New device? → ⚠️ Additional OTP verification
└── Known blacklisted device? → 🔴 BLOCK
    ↓
[GATE 2: Session Check]
├── Single active session? → ✅ Continue
├── Multiple sessions (same user)? → ⚠️ Check if same IP
│   ├── Same IP (multiple browsers)? → ⚠️ Flag for review
│   └── Different IPs? → 🔴 BLOCK + alert + freeze
    ↓
[GATE 3: Velocity Check]
├── Withdrawal count (1h) < 3? → ✅ Continue
├── Withdrawal count (1h) ≥ 3? → ⚠️ Manual review
└── Withdrawal count (1h) ≥ 5? → 🔴 BLOCK
    ↓
[GATE 4: Amount Check]
├── Amount < daily limit? → ✅ Continue
├── Amount > daily limit? → 🔴 BLOCK
├── Amount > 300% of 30d avg? → ⚠️ Flag + manual review
└── Amount near daily limit (90%+)? → ⚠️ Enhanced verification
    ↓
[GATE 5: Geo Check]
├── IP within 200km of usual location? → ✅ Continue
├── IP within 500km? → ⚠️ Additional verification
├── IP > 500km? → ⚠️ Manual review
└── VPN/Proxy detected? → 🔴 BLOCK
    ↓
[GATE 6: Pool Check]
├── Available pool > withdrawal amount? → ✅ Process
├── Available pool < withdrawal amount? → ⚠️ Queue for next settlement
└── Available pool < 15% reserve? → 🔴 BLOCK all withdrawals
    ↓
[WITHDRAWAL APPROVED → PROCESS]
    ↓
[POST-PROCESSING: Log all gates, update risk score, notify user]
```

---

# SYSTEM ARCHITECTURE NOTES

## Database Tables (Core)
| Table | Purpose | Partitioning |
|-------|---------|-------------|
| users | User accounts | By registration month |
| transactions | Transaction ledger | By month |
| wallets | User wallets | — |
| admins | Admin accounts | — |
| audit_logs | Admin action logs | By month |
| alerts | Fraud/risk alerts | By severity + date |
| settlements | Partner settlements | By period |
| kyc_documents | KYC documents | — |
| notifications | Notification log | By month |
| feature_flags | Feature toggles | — |
| fee_configs | Fee schedules | — |
| pools | Liquidity pools | — |
| partners | Partner accounts | — |
| investors | Investor records | — |
| cards | Card records | — |
| devices | Device fingerprints | By trust score |

## API Rate Limits
| Endpoint | Limit | Window |
|----------|-------|--------|
| User-facing API | 100 req/min | Per user |
| Admin API | 200 req/min | Per admin |
| Webhook delivery | 1000 req/min | Per endpoint |
| Batch operations | 10 req/min | Per admin |
| Report generation | 5 req/hour | Per admin |

## Scheduled Jobs
| Job | Frequency | Purpose |
|-----|-----------|---------|
| Settlement processing | Hourly | Auto-settle partner accounts |
| Fraud scan | Every 5 minutes | Run fraud rules engine |
| Risk score update | Every 15 minutes | Recalculate user risk scores |
| Dormancy check | Daily 02:00 | Identify dormant accounts |
| Report generation | Daily 06:00 | Generate daily flash reports |
| KYC reminder | Daily 09:00 | Send KYC completion reminders |
| Statement generation | Monthly 1st | Generate user statements |
| Compliance report | Monthly 15th | Auto-generate regulatory reports |
| Data cleanup | Weekly Sunday | Archive old data, purge expired |
| Backup | Daily 03:00 | Full database backup |
