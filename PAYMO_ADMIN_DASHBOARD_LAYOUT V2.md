
# PayMo Admin Dashboard — Comprehensive Layout Blueprint v2.0
## 42-Page Super Admin & Multi-Tier Permission System for PayMo Digital Bank BAAS



# page 0: ACCESS CONTROL: MULTI-LAYER ADMIN AUTHENTICATION

Before any admin can access the dashboard, they must pass **four sequential authentication gates**:
## a layer showing the roles and permission of this user as amdin
    this page should just highligt the way  someoner pick am a finance admin and procced then startingt the authenitaction... then the dahsboard when loging out will redirect to this page..
    now here make cards showing varuious raole of the admins like, super admin, developer admin, finnace admins etc name all roles upto customer care admin etc then make the cards arrnages ina a maaner than when a user selected the card it check the card and highlighs the roles  the permissions  etc just briefly ...using tabs, modals, drawers, icons etc ju make the pages have advanced ui design
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
    [layer showing the roles]
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
| Forced logout | Super admin can terminate any active session |
| Session encryption | AES-256-GCM for session tokens |
| CSRF protection | Synchronizer token pattern on all state-changing requests |

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
| | Adjust user limits | ✅ | ✅ | ❌ | ❌ | ✅ | ⚙️ | ❌ |
| | Grant/revoke VIP | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Export user data | ✅ | ✅ | ✅ | ✅ | ✅ | ⚙️ | ✅ |
| | View login history | ✅ | ✅ | ✅ | ✅ | ❌ | ⚙️ | ❌ |
| **Transactions** | View all transactions | ✅ | ✅ | ✅ | ✅ | ✅ | ⚙️ | ✅ |
| | Reverse transaction | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| | Approve high-value | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| | Set fee schedule | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| | Override fee | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| | Set withdrawal limits | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| | Export transactions | ✅ | ✅ | ✅ | ✅ | ✅ | ⚙️ | ✅ |
| | Hold transaction | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| | Batch process | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Fraud** | View fraud dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| | Block transaction | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| | Flag user | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| | Blacklist user | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| | Review alerts | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| | Manage blacklist | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| | Configure rules | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Finance** | View P&L | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ |
| | Approve settlements | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| | Manage pools | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| | Set tax rates | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| | Manage charges | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| | View balance sheet | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ |
| | Manage reserves | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| | Approve refunds | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Partners** | View partners | ✅ | ✅ | ✅ | ✅ | ✅ | ⚙️ | ✅ |
| | Onboard partner | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Suspend partner | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Set partner fees | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| | View partner transactions | ✅ | ✅ | ✅ | ✅ | ✅ | ⚙️ | ✅ |
| | Manage partner API | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Investors** | View investor data | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ |
| | Edit investor terms | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Generate reports | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ |
| | Manage cap table | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Process dividends | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **System** | Manage admins | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | View audit log | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| | Configure system | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Manage roles | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | API key management | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Database access | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Feature flags | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | View error logs | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| | Manage webhooks | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | Backup management | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

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
| PayMo logo | Link to dashboard home, animated on hover |
| Admin avatar + name | "Super Admin — Joseph Mwangi" with online indicator |
| Role badge | "Super Admin" (green), clickable for role details |
| Session timer | "Session expires in 6:42:15" with visual countdown bar |
| Notification bell | Red badge with unread count, dropdown preview |
| Quick actions dropdown | Freeze account, Block transaction, Send broadcast, Emergency lockdown |
| Environment indicator | "PRODUCTION" badge (red) or "STAGING" (yellow) |
| Help & docs link | Opens internal knowledge base |
| Dark mode toggle | System/manual theme switcher |

### Section 1.2: Portfolio Value Hero Card (Full Width)
| Metric | Value | Trend | Period | Sparkline |
|--------|-------|-------|--------|-----------|
| Total Portfolio Value | KES 2.47B | ↑ 12.3% | vs last month | 📈 |
| Total Users | 148,392 | ↑ 8,412 | new this month | 📈 |
| Active Users (30d) | 89,214 | ↑ 5.2% | daily active | 📈 |
| Total Transactions (30d) | 1,247,893 | ↑ 15.7% | vs last month | 📈 |
| Transaction Volume (30d) | KES 18.6B | ↑ 22.1% | vs last month | 📈 |
| Revenue (30d) | KES 186M | ↑ 18.4% | transaction fees | 📈 |
| MRR (Monthly Recurring Revenue) | KES 42.3M | ↑ 3.1% | subscriptions | 📈 |
| Net Revenue (after costs) | KES 124M | ↑ 14.2% | operational profit | 📈 |
| Cost of Operations (30d) | KES 62M | ↑ 8.1% | infrastructure + staff | 📊 |

### Section 1.3: Revenue Breakdown (Donut + Bar)
| Revenue Source | Amount (KES) | % of Total | Trend | MoM Change |
|----------------|-------------|------------|-------|-------------|
| Transaction fees | 142,000,000 | 76.3% | ↑ | +KES 18.2M |
| Card fees | 18,500,000 | 9.9% | ↑ | +KES 2.1M |
| Utility commissions | 12,800,000 | 6.9% | → | -KES 0.3M |
| Subscription (VIP) | 8,200,000 | 4.4% | ↑ | +KES 1.4M |
| FX margins | 4,500,000 | 2.4% | ↓ | -KES 0.8M |
| Loan interest | 12,300,000 | 6.6% | ↑ | +KES 3.2M |
| Penalty fees | 1,800,000 | 1.0% | → | +KES 0.1M |

### Section 1.4: System Health Grid (3×3)
| Card | Status | Details | Last Check |
|------|--------|---------|------------|
| API Uptime | 🟢 99.97% | 12h avg, 4 nines this month | 30s ago |
| Payment Gateway | 🟢 Operational | M-Pesa: OK, Cards: OK, Banks: OK | 30s ago |
| Fraud Engine | 🟢 Active | 23 alerts pending review | 30s ago |
| Support Queue | 🟡 12 Open | 3 urgent, avg response 4.2 min | 1m ago |
| Database (Primary) | 🟢 Healthy | 340 GB used, 1.2 TB available | 30s ago |
| Database (Replica) | 🟢 Healthy | Lag: 0.3s, in sync | 30s ago |
| Background Jobs | 🟢 Running | 847/847 completed, 0 failed | 30s ago |
| CDN & Static Assets | 🟢 Operational | 99.99% hit rate, 12ms avg | 1m ago |
| Message Queue | 🟢 Healthy | 342 messages, 0 dead letters | 30s ago |

### Section 1.5: Critical Alerts Strip (Scrollable, Categorized)
| Priority | Category | Alert | Action | Age |
|----------|----------|-------|--------|-----|
| 🔴 Critical | Security | 3 accounts flagged for simultaneous multi-device withdrawal | Review → | 2 min |
| 🔴 Critical | Payments | M-Pesa callback delay > 5 min (12 transactions pending) | Investigate → | 8 min |
| 🔴 Critical | Fraud | Account takeover attempt detected — User #11223 | Block → | 15 min |
| 🟡 Warning | Fraud | Daily fraud threshold 78% reached (KES 14.2M of KES 18M limit) | Review → | 22 min |
| 🟡 Warning | Partners | Partner "QuickLend" settlement overdue by 2 days | Contact → | 1h |
| 🟡 Warning | Liquidity | Card settlement pool at 82% utilization | Top up → | 2h |
| 🟡 Warning | Operations | 3 support agents offline during peak hours | Reassign → | 3h |
| 🟢 Info | KYC | New KYC batch: 347 pending verification | Process → | 30 min |
| 🟢 Info | System | System maintenance scheduled: Sunday 2:00 AM EAT | Details → | 4h |
| 🟢 Info | Business | 12 new partner applications received today | Review → | 5h |

### Section 1.6: Transaction Volume Chart (24h Live)
- Line chart: Transactions per hour (current 24h vs previous 24h)
- Anomaly detection markers on unusual spikes/dips
- Tap any hour to drill into that hour's transactions
- Overlay: Success rate line, Fraud alert markers
- Toggle: View by volume (KES) or count

### Section 1.7: Defaulters & Credit Risk Summary
| Metric | Value | Trend | MoM Change |
|--------|-------|-------|-------------|
| Total defaulters | 1,247 | ↑ | +23 |
| Amount at risk | KES 34.5M | ↓ | -KES 2.1M recovered |
| Accounts with negative balance | 892 | → | +12 |
| Amounts below zero | KES 12.8M | ↓ | -KES 1.4M |
| Pending recovery actions | 354 | ↓ | -18 |
| Last 30d recovery rate | 67% | ↑ | +4% |
| Loans in arrears (30d+) | 423 | ↓ | -31 |
| Loans in arrears (60d+) | 187 | → | +2 |
| Loans in arrears (90d+) | 78 | ↑ | +5 |
| Write-offs (30d) | KES 1.2M | ↓ | -KES 0.8M |
| Recovery agents active | 4 | → | — |
| Legal actions initiated | 12 | ↑ | +3 |

### Section 1.8: Quick Actions Grid (3×4)
| Icon | Action | Destination | Confirmation |
|------|--------|-------------|-------------|
| 🔍 | Search User | Page 4 (User Directory) | None |
| 🧊 | Freeze Account | Page 5 (User Detail) | 2FA + reason |
| 📊 | Transaction Ledger | Page 9 | None |
| 🛡️ | Fraud Alerts | Page 15 | None |
| 💰 | Set Fees | Page 10 | 2FA |
| 👥 | Manage Admins | Page 29 | None |
| 📢 | Send Broadcast | Page 36 | Confirm message |
| 📄 | Update T&C | Page 38 | 2FA + legal review |
| 🔄 | Trigger Reconciliation | Page 11 | 2FA |
| 📋 | Export Report | Page 42 | None |
| 🔐 | Emergency Lockdown | System-wide | 2FA + super admin |
| 💳 | Manage Cards | Page 23 | None |

### Section 1.9: Recent Activity Feed (Last 15, Auto-Refresh)
| Time | Admin | Action | Target | Details | IP |
|------|-------|--------|--------|---------|-----|
| 2 min ago | Joseph M. | Froze account | User #89234 | Fraud suspicion — dual browser | 192.168.1.x |
| 8 min ago | Sarah K. | Approved settlement | Partner #12 | KES 4.2M disbursed | 192.168.1.x |
| 15 min ago | James O. | Updated fee schedule | All users | Mobile money fee 0.5% → 0.45% | 192.168.1.x |
| 22 min ago | Joseph M. | Granted VIP status | User #4512 | Exempt from transaction fees | 192.168.1.x |
| 31 min ago | Mary W. | Reversed transaction | TXN #882341 | Duplicate charge corrected | 192.168.1.x |
| 45 min ago | David K. | Blacklisted device | Device FP #8823 | Linked to fraud ring | 192.168.1.x |
| 1h ago | Sarah K. | Closed SAR | SAR-2026-034 | False positive confirmed | 192.168.1.x |
| 1h ago | James O. | Updated KYC rules | System | Added address document requirement | 192.168.1.x |

### Section 1.10: Channel Distribution Map
- Donut chart: Transaction distribution by channel (M-Pesa, Card, Bank, Internal, ATM)
- Bar chart: Revenue per channel
- Table: Channel growth rates vs last month

### Section 1.11: Upcoming Tasks & Deadlines
| Task | Due | Assigned | Priority | Status |
|------|-----|----------|----------|--------|
| Monthly compliance report to CBK | Aug 31 | Compliance Officer | 🔴 High | ⏳ In progress |
| Partner fee renegotiation — QuickLend | Aug 25 | Platform Admin | 🟡 Medium | 📋 Pending |
| Q3 investor report draft | Sep 5 | Finance Manager | 🟡 Medium | 📋 Pending |
| Security audit follow-up — 12 items | Sep 15 | Dev Team | 🔴 High | 🔄 4/12 done |
| New card BIN onboarding — Visa | Aug 28 | Operations Manager | 🟢 Normal | 📋 Pending |

---

# PAGE 2: REAL-TIME MONITOR

**Purpose:** Live feed of all platform activity — transactions, logins, fraud alerts, system events.

### Section 2.1: Live Transaction Stream (Auto-Refresh 2s)
| Time | TXN ID | Type | User | Amount | Channel | Status | Fraud Score | Geo |
|------|--------|------|------|--------|---------|--------|-------------|-----|
| 14:32:01 | TXN-882451 | Transfer | #89234 → #12045 | KES 15,000 | M-Pesa | ✅ Complete | 12 | Nairobi |
| 14:31:58 | TXN-882450 | Withdrawal | #4512 | KES 5,000 | ATM | ✅ Complete | 5 | Mombasa |
| 14:31:55 | TXN-882449 | Payment | #67890 | KES 2,300 | Card | ⏳ Pending | 8 | Nairobi |
| 14:31:52 | TXN-882448 | Deposit | #33456 | KES 50,000 | Bank | ✅ Complete | 3 | Kisumu |
| 14:31:49 | TXN-882447 | Transfer | #11223 → #44556 | KES 8,700 | Internal | ✅ Complete | 7 | Nakuru |

- Color-coded fraud score: 🟢 0–20, 🟡 21–50, 🟠 51–75, 🔴 76–100
- Tap any row for full transaction detail modal
- Pause/resume stream button
- Filter by channel, type, fraud score threshold

### Section 2.2: Live Metrics Sidebar (Refresh 5s)
| Metric | Current Value | 5m Ago | Trend | Alert Threshold |
|--------|--------------|--------|-------|-----------------|
| Transactions/min | 142 | 138 | ↑ | <50 or >500 |
| Active sessions | 3,847 | 3,812 | ↑ | — |
| Failed logins (1h) | 23 | 18 | ↑ | >50 |
| Fraud alerts (1h) | 7 | 5 | ↑ | >15 |
| API response time (p95) | 124ms | 118ms | ↑ | >500ms |
| Error rate | 0.03% | 0.02% | ↑ | >0.5% |
| Pending transactions | 342 | 318 | ↑ | >1000 |
| Queue depth (jobs) | 23 | 19 | ↑ | >200 |
| Memory usage | 67% | 65% | ↑ | >85% |
| CPU usage | 34% | 31% | ↑ | >80% |

### Section 2.3: Geographic Heatmap
- Interactive Kenya map with real-time transaction density by county
- Hotspots pulsing for high-activity areas
- Tap county for drill-down: transaction count, volume, top merchants
- Filter by time range (1h, 6h, 12h, 24h)
- Color scale: light (low) to dark red (high)

### Section 2.4: Channel Performance (Live)
| Channel | TXN/min | Volume/min (KES) | Success Rate | Avg Latency | Errors (1h) |
|---------|---------|-----------------|--------------|-------------|-------------|
| M-Pesa | 52 | 780K | 99.2% | 3.2s | 4 |
| Card (Visa) | 28 | 420K | 99.8% | 1.8s | 1 |
| Card (Mastercard) | 18 | 270K | 99.7% | 1.9s | 0 |
| Bank Transfer | 8 | 1.2M | 98.5% | 45s | 2 |
| Internal | 34 | 510K | 99.9% | 0.3s | 0 |
| ATM | 6 | 180K | 97.8% | 12s | 3 |

### Section 2.5: Live Login Stream
| Time | User | Device | IP | Location | Status | Risk |
|------|------|--------|----|----------|--------|------|
| 14:32:05 | #89234 | iPhone 15 / iOS 18 | 41.x.x.x | Nairobi | ✅ Success | 🟢 Low |
| 14:32:01 | #45123 | Chrome / Windows | 196.x.x.x | Mombasa | ✅ Success | 🟢 Low |
| 14:31:58 | #11223 | Firefox / Linux | 102.x.x.x | Unknown | ❌ Failed | 🟠 High |
| 14:31:55 | #67890 | Safari / macOS | 41.x.x.x | Nairobi | ✅ Success | 🟢 Low |

### Section 2.6: Live Fraud Alert Stream
| Time | Alert ID | Type | User | Amount | Score | Status |
|------|----------|------|------|--------|-------|--------|
| 14:32:01 | FRD-2848 | Velocity spike | #55667 | KES 120K | 78 | 🔴 New |
| 14:31:45 | FRD-2847 | Dual-device | #89012 | KES 50K | 87 | 🔴 New |
| 14:30:12 | FRD-2846 | Geo-anomaly | #22334 | KES 80K | 65 | 🟡 Reviewing |

### Section 2.7: System Event Log (Live)
| Time | Level | Component | Event | Details |
|------|-------|-----------|-------|---------|
| 14:32:00 | INFO | API | Auto-scale | Scaled from 8 to 10 instances |
| 14:31:45 | WARN | M-Pesa | Callback delay | 12 pending callbacks > 5 min |
| 14:31:30 | INFO | DB | Query optimization | Slow query detected (2.3s), indexed |
| 14:31:00 | INFO | Jobs | Batch complete | KYC batch #447 processed (347 users) |

### Section 2.8: Real-Time Anomaly Detection Panel
| Anomaly Type | Detected At | Severity | Description | Auto-Action | Manual Action Required |
|-------------|-------------|----------|-------------|-------------|----------------------|
| Volume spike | 14:30 | 🟡 Medium | M-Pesa transactions 3x normal for this hour | None | Review → |
| Error cluster | 14:28 | 🟡 Medium | 5 consecutive card declines (Visa) | None | Check Visa gateway → |
| New device cluster | 14:25 | 🟠 High | 12 logins from previously unseen devices in 5 min | Flagged for review | Review devices → |
| Geo-impossible | 14:20 | 🔴 Critical | User #11223: Nairobi → London in 2 min | Account frozen | Immediate review → |

### Section 2.9: Performance Graphs (Real-Time)
- **API Latency Chart**: Rolling 1-hour line chart, p50/p95/p99 lines
- **Throughput Chart**: Requests per second, rolling 1 hour
- **Error Rate Chart**: Error percentage, rolling 1 hour with threshold line
- **Resource Usage**: CPU, Memory, Disk I/O — rolling 1 hour

---

# PAGE 3: KPI SCORECARD

**Purpose:** Executive scorecard tracking all platform KPIs with targets, trends, and drill-downs.

### Section 3.1: Executive KPI Grid (4×4)
| KPI | Current | Target | Status | Trend | Period | Owner |
|-----|---------|--------|--------|-------|--------|-------|
| Total Users | 148,392 | 200,000 | 🟡 74% | ↑ 8.4K | Monthly | Growth |
| MAU (Monthly Active) | 89,214 | 120,000 | 🟡 74% | ↑ 5.2% | Monthly | Growth |
| DAU (Daily Active) | 34,120 | 50,000 | 🟡 68% | ↑ 3.1% | Daily | Growth |
| Transaction Volume | KES 18.6B | KES 25B | 🟡 74% | ↑ 22.1% | Monthly | Operations |
| Revenue | KES 186M | KES 200M | 🟢 93% | ↑ 18.4% | Monthly | Finance |
| Net Profit Margin | 18.4% | 20% | 🟡 92% | ↑ 1.2% | Monthly | Finance |
| Avg Revenue/User | KES 1,253 | KES 1,500 | 🟡 84% | ↑ 9.2% | Monthly | Finance |
| Customer Acquisition Cost | KES 342 | KES 300 | 🔴 114% | ↑ 12% | Monthly | Marketing |
| Lifetime Value | KES 8,450 | KES 10,000 | 🟡 84% | ↑ 8% | Quarterly | Finance |
| LTV:CAC Ratio | 24.7x | 30x | 🟡 82% | ↓ | Quarterly | Finance |
| Fraud Rate | 0.023% | <0.05% | 🟢 Good | ↓ | Monthly | Compliance |
| Chargeback Rate | 0.018% | <0.05% | 🟢 Good | ↓ | Monthly | Compliance |
| Support Resolution Time | 4.2 min | <5 min | 🟢 Good | ↓ 1.3min | Monthly | Support |
| Customer Satisfaction (CSAT) | 4.3/5 | 4.5/5 | 🟡 96% | ↑ 0.1 | Monthly | Support |
| KYC Completion Rate | 94.2% | 98% | 🟡 96% | ↑ 1.1% | Monthly | Compliance |
| NPS Score | 72 | 70 | 🟢 Good | ↑ 3 | Quarterly | Product |
| Default Rate | 1.8% | <2% | 🟢 Good | ↓ 0.3% | Monthly | Lending |
| Partner Satisfaction | 4.3/5 | 4.5/5 | 🟡 96% | ↑ 0.1 | Quarterly | Partnerships |
| System Uptime | 99.97% | 99.99% | 🟡 Good | → | Monthly | Engineering |
| API Latency (p95) | 124ms | <200ms | 🟢 Good | ↓ 12ms | Monthly | Engineering |
| Cost per Transaction | KES 2.10 | KES 1.80 | 🟡 86% | ↓ 0.15 | Monthly | Operations |
| Employee Productivity | 1,247 tickets/agent | 1,500 | 🟡 83% | ↑ | Monthly | HR |

### Section 3.2: Growth Funnel Analysis
| Stage | Count | % of Total | Drop-off | Bottleneck |
|-------|-------|------------|----------|------------|
| App downloads | 198,400 | 100% | — | — |
| Registration started | 172,300 | 86.8% | 13.2% | Form abandonment |
| Registration completed | 158,200 | 79.7% | 8.2% | Phone verification |
| First transaction | 134,500 | 67.8% | 15.0% | Deposit initiation |
| 7-day retention | 101,200 | 51.0% | 24.8% | Value discovery |
| 30-day retention | 89,214 | 44.9% | 11.8% | Habit formation |
| 90-day retention | 72,400 | 36.5% | 18.8% | Feature engagement |

### Section 3.3: Cohort Retention Table
| Cohort | Week 1 | Week 2 | Week 4 | Week 8 | Week 12 |
|--------|--------|--------|--------|--------|---------|
| Jan 2026 | 68% | 54% | 42% | 34% | 28% |
| Feb 2026 | 71% | 57% | 45% | 36% | 31% |
| Mar 2026 | 73% | 59% | 47% | 38% | 32% |
| Apr 2026 | 74% | 60% | 48% | 39% | — |
| May 2026 | 75% | 61% | 49% | — | — |
| Jun 2026 | 76% | 62% | — | — | — |
| Jul 2026 | 78% | — | — | — | — |

### Section 3.4: Revenue Trend Charts
- 12-month line chart: Total revenue with breakdown by source
- 12-month line chart: Revenue per user
- 12-month bar chart: Transaction volume (KES)
- Overlay: Target lines, year-over-year comparison

### Section 3.5: User Growth Charts
- 12-month area chart: Total users, new users, churned users
- 12-month line chart: MAU/DAU ratio
- Pie chart: User distribution by KYC tier
- Pie chart: User distribution by account type

### Section 3.6: Operational Efficiency KPIs
| KPI | Current | Target | Status | Trend |
|-----|---------|--------|--------|-------|
| KYC verification time (avg) | 4.2 hours | <2 hours | 🟡 | ↓ 30min |
| Settlement processing time | 45 min | <30 min | 🟡 | ↓ 10min |
| Customer onboarding time | 8.3 min | <5 min | 🟡 | ↓ 1.2min |
| Incident response time | 12 min | <5 min | 🟡 | ↓ 3min |
| Deploy frequency | 12/week | 15/week | 🟡 | ↑ |
| Change failure rate | 2.1% | <1% | 🔴 | → |
| Mean time to recovery | 8 min | <5 min | 🟡 | ↓ 2min |

### Section 3.7: Competitive Benchmarking
| Metric | PayMo | Competitor A | Competitor B | Industry Avg |
|--------|-------|--------------|--------------|-------------|
| Transaction fees | 1.5% | 1.8% | 2.0% | 2.2% |
| Onboarding time | 8.3 min | 15 min | 12 min | 20 min |
| KYC completion | 94.2% | 88% | 91% | 85% |
| App store rating | 4.5/5 | 4.2/5 | 4.3/5 | 4.0/5 |
| System uptime | 99.97% | 99.95% | 99.90% | 99.90% |

### Section 3.8: KPI Drill-Down Panel
- Click any KPI to open detailed drill-down
- Shows: Daily values for 30 days, contributing factors, related sub-KPIs
- Comparison: Actual vs forecast vs target
- Action items: Linked tasks to improve the KPI
- Owner assignment and accountability

### Section 3.9: Forecasting & Projections
| Metric | Current Month | Next Month (Proj) | +3 Months (Proj) | Confidence |
|--------|--------------|-------------------|-------------------|------------|
| Total Users | 148,392 | 162,000 | 210,000 | 85% |
| Revenue | KES 186M | KES 204M | KES 260M | 78% |
| Transaction Volume | KES 18.6B | KES 21B | KES 28B | 82% |
| Fraud Losses | KES 2.4M | KES 2.1M | KES 1.8M | 70% |

### Section 3.10: KPI Alert Configuration
| KPI | Warning Threshold | Critical Threshold | Notification | Current Status |
|-----|-------------------|-------------------|--------------|----------------|
| Fraud Rate | >0.03% | >0.05% | SMS + Email + Push | 🟢 Normal |
| System Uptime | <99.95% | <99.90% | SMS + Email + Push + Slack | 🟢 Normal |
| Revenue | <90% of target | <80% of target | Email + Slack | 🟢 Normal |
| Support Queue | >20 open | >50 open | Slack | 🟢 Normal |
| API Latency | >200ms | >500ms | SMS + Email + Push | 🟢 Normal |

---

# PAGE 4: USER DIRECTORY

**Purpose:** Search, filter, and manage all platform users.

### Section 4.1: Search & Filters Bar
| Filter | Type | Options |
|--------|------|---------|
| Search | Text | Name, phone, email, account number, national ID |
| Account status | Multi-select | Active, Frozen, Suspended, Closed, Pending KYC, Dormant |
| Account type | Multi-select | Individual, Business, VIP, Partner, Minor |
| Registration date | Date range | Custom range picker |
| Last active | Dropdown | Today, This week, This month, 30+ days, 90+ days inactive |
| Balance range | Number range | Min — Max |
| Transaction volume | Number range | Min — Max (monthly) |
| Risk level | Multi-select | Low, Medium, High, Critical |
| County | Dropdown | All 47 Kenyan counties |
| KYC status | Multi-select | Complete, Pending, Expired, Rejected, Not started |
| KYC tier | Multi-select | Tier 0, Tier 1, Tier 2, Tier 3 |
| Flagged | Toggle | Yes / No |
| Has loan | Toggle | Yes / No |
| Has card | Toggle | Yes / No |
| VIP status | Multi-select | Silver, Gold, Platinum, Business, None |
| Referral source | Dropdown | Organic, Referral, Partner, Ads, API |
| Device type | Multi-select | Android, iOS, Web, API |

### Section 4.2: Saved Filter Presets
| Preset Name | Filters Applied | Created By | Usage |
|-------------|-----------------|------------|-------|
| High-risk users | Risk: High + Critical, Status: Active | Joseph M. | 234 uses |
| Dormant with balance | Last active: 90d+, Balance: >KES 1,000 | Sarah K. | 89 uses |
| Pending KYC | KYC: Pending, Registered: 7d+ | James O. | 567 uses |
| VIP clients | VIP: All, Status: Active | Joseph M. | 45 uses |
| Business accounts | Type: Business, Status: Active | Mary W. | 78 uses |

### Section 4.3: User List Table
| Column | Details | Sortable | Filterable |
|--------|---------|----------|------------|
| Checkbox | Multi-select for bulk actions | ❌ | ❌ |
| Avatar + Name | Photo or initials, full name | ✅ | ❌ |
| Account # | PAY-XXXXX-XXXX | ✅ | ❌ |
| Phone | +254 7XX XXX XXX (masked for analysts) | ❌ | ❌ |
| Type badge | Individual / Business / VIP / Partner | ✅ | ✅ |
| Status badge | 🟢 Active / 🟡 Frozen / 🔴 Suspended / ⚪ Pending / 💤 Dormant | ✅ | ✅ |
| Balance | KES formatted, color negative red | ✅ | ❌ |
| Monthly Volume | KES formatted | ✅ | ❌ |
| KYC badge | ✅ Complete / ⏳ Pending / ❌ Rejected / ⚠️ Expired | ✅ | ✅ |
| Risk badge | 🟢 Low / 🟡 Med / 🔴 High / ⛔ Critical | ✅ | ✅ |
| VIP badge | Silver / Gold / Platinum / Business / None | ✅ | ✅ |
| Last Active | Relative time | ✅ | ❌ |
| Actions | ⋮ (overflow menu) | ❌ | ❌ |

### Section 4.4: Bulk Actions Toolbar (Appears on Selection)
| Action | Requires | Confirmation | Audit |
|--------|----------|-------------|-------|
| Export CSV/Excel | Permission | None | Logged |
| Export PDF report | Permission | None | Logged |
| Send broadcast message | Permission | Confirm message + preview | Logged |
| Flag accounts | Permission | Confirm selection + reason | Logged |
| Freeze accounts | Permission + 2FA | Confirm + reason per account | Logged + notified |
| Unfreeze accounts | Permission + 2FA | Confirm | Logged |
| Adjust fee tier | Permission + 2FA | Confirm + fee change details | Logged |
| Assign to campaign | Permission | Select campaign | Logged |
| Add tag/label | Permission | Select tag | Logged |
| Request KYC re-verification | Permission | Confirm | Logged |
| Send SMS notification | Permission | Compose message | Logged |

### Section 4.5: User Segmentation Panel
| Segment | Count | Criteria | Auto/Manual |
|---------|-------|----------|-------------|
| High Value | 12,400 | Monthly volume > KES 500K | Auto |
| At Risk Churn | 8,900 | Active 30d ago, not in 7d | Auto |
| New Users (7d) | 3,200 | Registered < 7 days ago | Auto |
| Fraud Watch | 478 | Risk score > 60 | Auto |
| Loan Defaulters | 1,247 | Loan overdue > 30 days | Auto |
| Dormant Recoverable | 8,450 | Inactive 90d+ with balance > KES 500 | Auto |
| Business Premium | 890 | Business + volume > KES 5M | Manual |

### Section 4.6: User Detail Slide-Out Panel (Opens on Click)
| Tab | Content |
|-----|---------|
| Overview | Profile card, balance, stats, quick actions, risk badge |
| Transactions | Full transaction history with filters, export |
| KYC | Documents, verification status, tier history, notes |
| Loans | Active loans, repayment history, defaults |
| Cards | Card list, status, limits, spending |
| Security | Login history, devices, 2FA status, sessions |
| Communications | Notification history, support tickets, messages sent |
| Relationships | Referrals, linked accounts, business sub-accounts |
| Admin Notes | Internal notes (admin-only), timeline |
| Audit Trail | All admin actions taken on this account |
| Actions | Freeze, Flag, Adjust fees, Grant VIP, Close, Impersonate |

### Section 4.7: User Statistics Summary (Above Table)
| Metric | Value | vs Last Month |
|--------|-------|---------------|
| Total users in view | 148,392 | +8,412 |
| Active | 134,210 | +7,890 |
| Frozen | 1,234 | +56 |
| Suspended | 892 | -23 |
| Dormant | 8,450 | +312 |
| Pending KYC | 3,588 | -445 |
| Total balance (all users) | KES 2.47B | +KES 234M |
| Avg balance per user | KES 16,644 | +KES 890 |

### Section 4.8: Advanced Search Syntax Reference
| Syntax | Example | Description |
|--------|---------|-------------|
| `name:` | `name:Joseph Kamau` | Search by full or partial name |
| `phone:` | `phone:712345678` | Search by phone (no +254 needed) |
| `balance>` | `balance:100000` | Balance greater than |
| `balance<` | `balance:0` | Negative balance accounts |
| `volume>` | `volume:500000` | Monthly volume greater than |
| `risk:` | `risk:high` | Risk level exact match |
| `kyc:` | `kyc:pending` | KYC status exact match |
| `created:` | `created:2026-08-01..2026-08-22` | Date range |
| `tag:` | `tag:whale` | Users with specific tag |
| `AND / OR` | `risk:high AND volume:>100000` | Boolean combinations |

### Section 4.9: Import & Batch Operations
| Operation | Format | Max Rows | Processing | Status |
|-----------|--------|----------|------------|--------|
| Import users (API) | CSV | 50,000 | Async, ~10 min | Available |
| Update fee tiers | CSV | 10,000 | Async, ~5 min | Available |
| Bulk freeze | CSV (account #s) | 5,000 | Async, ~2 min | Available |
| Export full user list | CSV/Excel/PDF | All | Async, ~5 min | Available |
| Export selected | CSV/Excel/PDF | Selected | Instant | Available |

---

# PAGE 5: USER DETAIL & ACTIONS

**Purpose:** Deep-dive into a single user account with full admin action capabilities.

### Section 5.1: User Profile Header Card
| Field | Value | Editable | History |
|-------|-------|----------|---------|
| Full name | Joseph Kamau Mwangi | ✅ | View changes |
| Account # | PAY-12345-6789 | ❌ | — |
| Phone | +254 712 345 678 | ✅ (requires 2FA) | View changes |
| Email | joseph@example.com | ✅ | View changes |
| National ID | 12345678 | ❌ (KYC verified) | — |
| Date of Birth | March 15, 1990 | ❌ (KYC verified) | — |
| Account type | Individual | ✅ (requires approval) | View changes |
| Registration date | March 15, 2024 | ❌ | — |
| Registration source | Organic (App Store) | ❌ | — |
| Account status | 🟢 Active | ✅ (toggle with reason) | View status history |
| Risk level | 🟢 Low (Score: 12) | Auto-calculated | View score history |
| KYC tier | Tier 3 (Full) | Auto-calculated | View tier history |
| VIP status | ❌ Not VIP | ✅ (requires 2FA) | — |
| Referral code | JOSEPH-MWANGI | ❌ | — |
| Referred by | — | ❌ | — |
| Tags | None | ✅ | View tag history |

### Section 5.2: Financial Summary Dashboard
| Metric | Value | Period |
|--------|-------|--------|
| Current balance | KES 45,230 | Now |
| Available balance | KES 40,230 | Now (KES 5,000 held) |
| Pending transactions | 2 (KES 5,000) | Now |
| Total deposited (all time) | KES 2,340,000 | All time |
| Total withdrawn (all time) | KES 2,180,000 | All time |
| Total transferred out (all time) | KES 112,000 | All time |
| Total received (all time) | KES 78,000 | All time |
| Total fees paid (all time) | KES 34,200 | All time |
| Total tax withheld (all time) | KES 1,710 | All time |
| Monthly transaction volume | KES 185,000 | This month |
| Monthly transaction count | 47 | This month |
| Avg transaction size | KES 3,936 | This month |
| Largest transaction | KES 150,000 | All time |
| Transaction fee tier | Standard (1.5%) | Current |
| Daily spend today | KES 23,000 | Today |
| Daily limit remaining | KES 477,000 | Today |

### Section 5.3: Financial Charts
- **Balance history**: 12-month line chart showing daily closing balance
- **Transaction volume**: 12-month bar chart (deposits vs withdrawals vs transfers)
- **Fee breakdown**: Pie chart of fees paid by type
- **Spending categories**: Donut chart — utilities, transfers, shopping, etc.

### Section 5.4: Admin Actions Panel
| Action | Description | Requires | Reversible | Audit |
|--------|-------------|----------|------------|-------|
| 🧊 Freeze Account | Temporarily disable all transactions | 2FA + reason | ✅ Unfreeze | Full log |
| 🔴 Suspend Account | Block all access, retain data | 2FA + reason + approval | ✅ Unsuspend | Full log |
| 🟢 Unfreeze Account | Re-enable transactions | 2FA | — | Full log |
| ❌ Close Account | Permanent closure, transfer remaining balance | 2FA + super admin | ❌ Permanent | Full log |
| 💎 Grant VIP Status | Set VIP tier, configure exemptions | 2FA + fee config | ✅ Revoke | Full log |
| 💸 Adjust Fee Tier | Set custom fee percentage per type | 2FA + fee config | ✅ Revert | Full log |
| 💰 Set Withdrawal Limit | Custom daily/monthly limit | 2FA | ✅ Reset to default | Full log |
| 🔒 Set Transaction Limit | Max per-transaction amount | 2FA | ✅ Reset to default | Full log |
| 📝 Add Admin Note | Internal note visible to all admins | None | ✅ Delete | Full log |
| 🏷️ Flag Account | Mark for review with reason | None | ✅ Unflag | Full log |
| 📧 Send Message | Direct in-app notification to user | None | — | Full log |
| 📱 Send SMS | Direct SMS to registered phone | Permission | — | Full log + telco log |
| 🔄 Impersonate | View dashboard as this user (read-only) | 2FA + super admin | — | Full log + user notified |
| 📊 View Full Audit | Complete admin action history on this account | None | — | — |
| 💳 Manage Cards | View, block, issue cards for this user | Permission | Depends | Full log |
| 🏦 Manage Loans | View, adjust loan terms for this user | Permission | Depends | Full log |
| 🔐 Reset User 2FA | Force reset of user's 2FA (emergency) | 2FA + super admin | — | Full log + user notified |
| 📍 Override Location | Whitelist new location for user | 2FA | ✅ Remove | Full log |

### Section 5.5: Transaction History (Full, Paginated)
| Date | Time | TXN ID | Type | Description | Amount | Fee | Balance After | Status | Fraud | Actions |
|------|------|--------|------|-------------|--------|-----|---------------|--------|-------|---------|
| 2026-08-22 | 14:32 | TXN-882451 | Transfer | To PAY-67890-1234 | -KES 15,000 | KES 225 | KES 45,230 | ✅ | 12 | ⋮ |
| 2026-08-22 | 09:15 | TXN-882300 | Deposit | M-Pesa | +KES 50,000 | KES 0 | KES 60,455 | ✅ | 3 | ⋮ |
| 2026-08-21 | 18:45 | TXN-882100 | Payment | KPLC Electricity | -KES 3,200 | KES 48 | KES 10,455 | ✅ | 8 | ⋮ |
| 2026-08-21 | 11:20 | TXN-882050 | Withdrawal | M-Pesa Cashout | -KES 5,000 | KES 75 | KES 13,703 | ✅ | 5 | ⋮ |
| 2026-08-20 | 16:00 | TXN-881900 | Transfer | From PAY-11223-4455 | +KES 25,000 | KES 0 | KES 18,778 | ✅ | 7 | ⋮ |

- Pagination: 50 per page, infinite scroll option
- Export: CSV, Excel, PDF
- Filters: Date range, type, channel, amount range, status, fraud score
- Transaction detail modal on click

### Section 5.6: Security Overview
| Item | Status | Details | Last Updated |
|------|--------|---------|-------------|
| Password | 🟢 Strong | Last changed 30 days ago | Jul 23, 2026 |
| 2FA (TOTP) | 🟢 Enabled | Google Authenticator | Mar 15, 2024 |
| Biometric login | 🟢 Enabled | Fingerprint (iPhone 15) | Jun 12, 2026 |
| Passkey | 🟡 Not registered | — | — |
| PIN lock | 🟢 Set | 6-digit PIN active | Mar 15, 2024 |
| Last login | 2 hours ago | Nairobi, Chrome/Windows, 196.x.x.x | Aug 22, 14:30 |
| Registered devices | 3 | iPhone 15, MacBook Pro, Desktop PC | — |
| Active sessions | 1 | MacBook Pro — Chrome | — |
| Failed logins (30d) | 0 | — | — |
| Suspicious activity | None detected | — | — |
| Account recovery set | ✅ Yes | Phone + Email | — |

### Section 5.7: Device & Session History
| Device | First Seen | Last Active | IP | Location | Status |
|--------|-----------|-------------|----|----------|--------|
| iPhone 15 / iOS 18 | Jun 12, 2026 | Aug 22, 12:00 | 41.x.x.x | Nairobi | 🟢 Trusted |
| MacBook Pro / Chrome | Mar 15, 2024 | Aug 22, 14:30 | 196.x.x.x | Nairobi | 🟢 Trusted |
| Desktop PC / Chrome | May 3, 2026 | Aug 20, 09:00 | 192.168.x.x | Nairobi | 🟢 Trusted |
| Unknown Android | — | Aug 18, 03:00 | 102.x.x.x | Unknown | 🔴 Blocked |

### Section 5.8: Login History (30 Days)
| Date | Time | Device | IP | Location | Status | Risk |
|------|------|--------|----|----------|--------|------|
| Aug 22 | 14:30 | MacBook Pro | 196.x.x.x | Nairobi | ✅ Success | 🟢 |
| Aug 22 | 08:00 | iPhone 15 | 41.x.x.x | Nairobi | ✅ Success | 🟢 |
| Aug 21 | 18:30 | MacBook Pro | 196.x.x.x | Nairobi | ✅ Success | 🟢 |
| Aug 18 | 03:00 | Unknown Android | 102.x.x.x | Unknown | ❌ Failed | 🔴 |

### Section 5.9: KYC & Verification Status
| Document | Status | Submitted | Verified By | Expiry |
|----------|--------|-----------|-------------|--------|
| National ID (Front) | ✅ Verified | Mar 15, 2024 | Auto (OCR) | Never |
| National ID (Back) | ✅ Verified | Mar 15, 2024 | Auto (OCR) | Never |
| Selfie / Face | ✅ Verified | Mar 15, 2024 | Auto (94.2% match) | Never |
| Proof of Address | ✅ Verified | Mar 15, 2024 | Mary W. | Mar 2027 |
| AML Screening | ✅ Clear | Mar 15, 2024 | Auto | Continuous |
| PEP Check | ✅ Not PEP | Mar 15, 2024 | Auto | Annual |

### Section 5.10: Admin Notes Timeline
| Date | Admin | Note | Category |
|------|-------|------|----------|
| Aug 22 | Joseph M. | Reviewed for dual-device alert — false positive, user confirmed both devices | Investigation |
| Jul 15 | Sarah K. | VIP eligibility review — volume not yet at Gold threshold | Review |
| Mar 15 | System | Account created via App Store registration | System |
| — | — | Add note... | — |

### Section 5.11: Related Accounts & Network
| Relationship | Account | Name | Details |
|-------------|---------|------|---------|
| Referred | PAY-67890-1234 | Jane Wanjiku | Referred on Apr 2, 2024 |
| Received from | PAY-11223-4455 | Peter Ochieng | 12 transfers total, KES 340K |
| Sent to | PAY-44556-7890 | ABC Ltd | 3 bill payments |
| Same device | — | — | No shared devices detected |
| Same IP | — | — | No shared IP detected |

---

# PAGE 6: KYC & IDENTITY VERIFICATION

**Purpose:** Manage user identity verification — documents, tiers, compliance.

### Section 6.1: KYC Dashboard Metrics
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Total users | 148,392 | — | — |
| KYC Complete (Tier 3) | 98,234 (66.2%) | 75% | 🟡 |
| KYC Partial (Tier 2) | 34,120 (23.0%) | — | — |
| KYC Basic (Tier 1) | 12,450 (8.4%) | — | — |
| KYC Pending Review | 3,588 (2.4%) | <1% | 🔴 |
| Documents pending review | 347 | <100 | 🔴 |
| Avg verification time | 4.2 hours | <2 hours | 🟡 |
| Rejection rate | 8.3% | <5% | 🟡 |
| Re-submission rate | 12.1% | <8% | 🟡 |
| Expiring documents (30d) | 1,234 | — | 🟡 |
| Expired documents | 456 | 0 | 🔴 |
| Overdue re-verification | 89 | 0 | 🔴 |

### Section 6.2: KYC Tier Structure & Limits
| Tier | Requirements | Daily Limit | Monthly Limit | Product Access |
|------|-------------|-------------|---------------|----------------|
| Tier 0 | Phone number only | KES 5,000 | KES 20,000 | Send/receive only |
| Tier 1 | Phone + Full name + DOB | KES 50,000 | KES 200,000 | + Bill payments |
| Tier 2 | Tier 1 + National ID/Passport | KES 500,000 | KES 2,000,000 | + Cards, savings |
| Tier 3 | Tier 2 + Proof of address + Face verification | Unlimited | Unlimited | + Loans, international, VIP eligible |

### Section 6.3: Pending Verification Queue
| User | Document Type | Submitted | Wait Time | Urgency | Auto-Check | Assigned To | Action |
|------|--------------|-----------|-----------|---------|------------|-------------|--------|
| PAY-45123-XXXX | National ID | 2h ago | 2h | Normal | ✅ OCR passed | Queue | Review → |
| PAY-67890-XXXX | Passport | 1h ago | 1h | Normal | ✅ OCR passed | Queue | Review → |
| PAY-89012-XXXX | Face verification | 30min ago | 30min | Normal | ⚠️ 72% match | Queue | Review → |
| PAY-11223-XXXX | Proof of address | 4h ago | 4h | High (volume) | ✅ Address matched | Queue | Review → |
| PAY-44556-XXXX | National ID | 6h ago | 6h | Normal | ❌ OCR failed | Queue | Review → |

### Section 6.4: Verification Detail Modal
| Section | Fields |
|---------|--------|
| User info | Name, phone, account #, requested tier, current tier |
| Uploaded documents | Front ID, Back ID, Selfie, Proof of address — with zoom, rotate, brightness |
| OCR results | Auto-extracted text from ID — name, ID number, DOB, expiry |
| Face match score | Percentage match (user selfie vs ID photo), liveness check result |
| Document authenticity | Hologram check, microprint verification, tamper detection score |
| Address verification | Utility bill / bank statement — address match percentage |
| AML screening result | Sanctions check (PASS/FAIL), PEP status (YES/NO), adverse media |
| Document quality | Image clarity score, lighting assessment, crop quality |
| Historical verifications | Previous attempts, previous rejections with reasons |
| Admin decision | Approve / Reject / Request additional docs |
| Notes | Free text for rejection reason or approval notes |
| Tier assignment | Auto-suggested tier based on documents approved |

### Section 6.5: KYC Rejection Analytics
| Rejection Reason | Count (30d) | % of Rejections | Trend |
|-----------------|-------------|----------------|-------|
| Blurry/unclear ID photo | 89 | 34% | ↓ |
| ID details don't match profile | 67 | 26% | → |
| Face match below threshold | 45 | 17% | ↓ |
| Expired document | 28 | 11% | ↑ |
| Fake/tampered document suspected | 18 | 7% | ↑ |
| Incomplete document set | 12 | 5% | ↓ |

### Section 6.6: Document Expiry Management
| Status | Count | Action |
|--------|-------|--------|
| Expiring in 7 days | 234 | Auto-send reminder notification |
| Expiring in 30 days | 1,234 | Auto-send reminder notification |
| Already expired | 456 | Auto-downgrade to Tier 1, restrict limits |
| Overdue re-verification (30d+) | 89 | Auto-freeze until re-verified |

### Section 6.7: KYC Configuration
| Setting | Current Value | Editable |
|---------|--------------|----------|
| Auto-approve threshold (face match) | 90% | ✅ |
| Auto-reject threshold (face match) | 60% | ✅ |
| Require liveness check | Yes | ✅ |
| OCR confidence threshold | 85% | ✅ |
| Address match threshold | 80% | ✅ |
| Max re-submission attempts | 3 | ✅ |
| Cooldown between re-submissions | 24 hours | ✅ |
| Third-party verification provider | Onfido | ✅ |
| AML screening provider | ComplyAdvantage | ✅ |
| PEP list source | EACC Kenya + Dow Jones | ✅ |
| Auto-downgrade on expiry | Yes (to Tier 1) | ✅ |
| Manual review SLA | 4 hours | ✅ |

### Section 6.8: KYC Agent Performance
| Agent | Reviewed Today | Approved | Rejected | Avg Time | Quality Score |
|-------|---------------|----------|----------|----------|---------------|
| Mary W. | 47 | 42 | 5 | 3.2 min | 98% |
| James O. | 38 | 34 | 4 | 4.1 min | 96% |
| Grace K. | 52 | 45 | 7 | 2.8 min | 94% |
| David M. | 31 | 28 | 3 | 5.0 min | 97% |

### Section 6.9: KYC Audit Trail
| Date | User | Action | By | Details |
|------|------|--------|-----|---------|
| Aug 22 14:30 | PAY-45123 | Approved Tier 3 | Mary W. | All documents verified, face match 96% |
| Aug 22 13:00 | PAY-67890 | Rejected — blurry ID | James O. | Requested re-submission |
| Aug 22 11:00 | PAY-89012 | Additional docs requested | Grace K. | Proof of address required |

---

# PAGE 7: ACCOUNT LIFECYCLE

**Purpose:** Track and manage account states — registration, activation, dormancy, closure.

### Section 7.1: Lifecycle Pipeline Visualization
```
[Registered] → [KYC Pending] → [KYC Partial] → [KYC Complete] → [Active]
                                                                    ↓
[Dormant 90d] → [Dormant 180d] → [Dormant 365d] → [Escheatment Review]
                                                                    ↓
[Frozen] ←→ [Active]    [Suspended] ←→ [Active]    [Closed] (permanent)
                                                                    ↓
                                                           [Data Archived]
```
- Interactive pipeline: click any stage to see users in that stage
- Animated transitions showing user flow between stages

### Section 7.2: Lifecycle Metrics Dashboard
| Stage | Count | % of Total | Trend | Avg Time in Stage |
|-------|-------|------------|-------|-------------------|
| Registered (not verified) | 3,588 | 2.4% | ↓ | 2.3 days |
| KYC Pending | 2,140 | 1.4% | ↓ | 4.2 hours |
| KYC Partial | 1,448 | 1.0% | ↓ | 12.4 days |
| Active | 134,210 | 90.4% | ↑ | 287 days avg |
| Dormant (90–180 days) | 5,230 | 3.5% | → | 124 days avg |
| Dormant (180–365 days) | 2,450 | 1.7% | ↑ | 234 days avg |
| Dormant (365+ days) | 770 | 0.5% | → | 412 days avg |
| Frozen | 1,234 | 0.8% | ↑ | 14 days avg |
| Suspended | 892 | 0.6% | ↓ | 45 days avg |
| Closed | 18 | 0.01% | → | Permanent |
| Escheatment review | 12 | 0.008% | → | 30 days avg |

### Section 7.3: Dormancy Management Queue
| User | Last Active | Balance | Days Dormant | Contact Attempts | Last Contact | Action |
|------|------------|---------|-------------|------------------|-------------|--------|
| PAY-11223-XXXX | 2026-05-15 | KES 12,400 | 98 | 2 | SMS (Aug 20) | Send reactivation prompt |
| PAY-44556-XXXX | 2026-04-20 | KES 890 | 123 | 3 | Push + SMS (Aug 18) | Send final notice |
| PAY-77889-XXXX | 2026-01-10 | KES 45,000 | 224 | 1 | SMS (Jul 15) | Escalate — high balance |
| PAY-99001-XXXX | 2025-12-01 | KES 234,000 | 264 | 0 | — | Escalate — very high balance |
| PAY-11234-XXXX | 2025-08-15 | KES 0 | 373 | 5 | Email (Aug 10) | Prepare for escheatment |

### Section 7.4: Dormancy Automation Rules
| Rule | Trigger | Action | Status |
|------|---------|--------|--------|
| 90-day dormancy | No transaction in 90 days | Send SMS reactivation prompt | ✅ Active |
| 120-day dormancy | No transaction in 120 days | Send push notification + email | ✅ Active |
| 180-day dormancy | No transaction in 180 days | Send final warning, restrict outgoing | ✅ Active |
| 365-day dormancy | No transaction in 365 days | Flag for escheatment review | ✅ Active |
| Zero balance dormancy | 90d inactive + zero balance | Auto-close with 30-day notice | ✅ Active |
| Low balance dormancy | 180d inactive + balance < KES 100 | Flag for escheatment | ✅ Active |

### Section 7.5: Account Closure Management
| User | Request Date | Reason | Balance | Status | Actions |
|------|-------------|--------|---------|--------|---------|
| PAY-55667-XXXX | Aug 20 | User requested | KES 2,300 | ⏳ Processing | Complete closure → |
| PAY-88900-XXXX | Aug 18 | Admin initiated (fraud) | KES 0 | ✅ Closed | View record → |
| PAY-22334-XXXX | Aug 15 | Dormancy (zero balance) | KES 0 | ✅ Closed | View record → |
| PAY-44556-XXXX | Aug 10 | Compliance order | KES 450 | ⏳ Pending compliance | Review → |

### Section 7.6: Escheatment & Unclaimed Funds
| Status | Accounts | Total Value | Legal Basis | Timeline |
|--------|----------|-------------|-------------|----------|
| Under review | 12 | KES 1.2M | Unclaimed Financial Assets Act | 90-day review |
| Approved for escheatment | 5 | KES 340K | — | Submit to CBK |
| Submitted to CBK (YTD) | 3 | KES 89K | — | Acknowledged |
| Recovered (user claimed) | 8 | KES 567K | — | Refunded |

### Section 7.7: Account State Transition Log
| Date | User | From | To | Reason | Initiated By |
|------|------|------|-----|--------|-------------|
| Aug 22 14:30 | PAY-89012 | Active | Frozen | Fraud investigation | Admin (Joseph M.) |
| Aug 22 10:00 | PAY-55667 | Active | Closing | User request | User |
| Aug 21 16:00 | PAY-11223 | Frozen | Active | Investigation cleared | Admin (Sarah K.) |
| Aug 20 09:00 | PAY-44556 | Active | Dormant | 90-day inactivity | System auto |

### Section 7.8: Reactivation Campaign Performance
| Campaign | Sent | Opened | Reactivated | Conversion | Revenue Recovered |
|----------|------|--------|-------------|------------|-------------------|
| 90-day SMS nudge | 5,230 | 3,410 (65%) | 1,234 (23%) | 36% of opened | KES 4.2M/month |
| 120-day push + email | 2,450 | 1,840 (75%) | 567 (23%) | 31% of opened | KES 1.8M/month |
| 180-day final warning | 770 | 420 (55%) | 89 (12%) | 21% of opened | KES 340K/month |
| Win-back offer (fee discount) | 1,500 | 1,050 (70%) | 312 (21%) | 30% of opened | KES 890K/month |

---

# PAGE 8: VIP CLIENTS

**Purpose:** Manage premium/VIP clients with custom fee exemptions, dedicated support, and priority services.

### Section 8.1: VIP Directory
| User | Account # | VIP Tier | Since | Monthly Volume | Balance | Fee Exemption | Dedicated Manager | Status |
|------|-----------|----------|-------|---------------|---------|---------------|-------------------|--------|
| Grace Ochieng | PAY-VIP-001 | Platinum | Jan 2025 | KES 12.4M | KES 8.2M | 100% all fees | Joseph M. | 🟢 Active |
| David Mutua | PAY-VIP-002 | Gold | Jun 2025 | KES 5.2M | KES 3.1M | 75% fees | Sarah K. | 🟢 Active |
| Amina Hassan | PAY-VIP-003 | Gold | Aug 2025 | KES 3.8M | KES 2.4M | 75% fees | James O. | 🟢 Active |
| Peter Kamau Ltd | PAY-VIP-004 | Business | Mar 2025 | KES 28.6M | KES 15.7M | 80% fees + custom | Joseph M. | 🟢 Active |
| TechVentures Ltd | PAY-VIP-005 | Business | May 2025 | KES 18.2M | KES 9.3M | Custom schedule | Mary W. | 🟢 Active |
| Samuel Ndegwa | PAY-VIP-006 | Silver | Jul 2025 | KES 680K | KES 1.2M | 25% fees | — | 🟢 Active |

### Section 8.2: VIP Tier Structure & Qualification
| Tier | Qualification (Any One) | Benefits | Max Members |
|------|------------------------|----------|-------------|
| Silver | KES 500K+ monthly volume OR KES 1M+ balance | 25% fee reduction, priority support queue | Unlimited |
| Gold | KES 2M+ monthly volume OR KES 5M+ balance | 50% fee reduction, dedicated manager, early feature access | 500 |
| Platinum | KES 10M+ monthly volume OR KES 20M+ balance | 100% fee exemption, dedicated manager, custom limits, API access, physical card waived | 100 |
| Business | Registered business, KES 5M+ monthly volume | Custom fee structure, bulk operations, multi-user accounts, payroll | Unlimited |

### Section 8.3: Fee Exemption Configuration Matrix
| Fee Type | Standard | Silver | Gold | Platinum | Business |
|----------|----------|--------|------|----------|----------|
| Transfer (internal) | 1.5% | 1.125% | 0.75% | Free | Custom |
| M-Pesa cashout | 2.0% | 1.5% | 1.0% | Free | Custom |
| Card payment | 2.5% | 1.875% | 1.25% | Free | Custom |
| FX conversion | 3.0% | 2.25% | 1.5% | Free | Custom |
| ATM withdrawal | KES 35 | KES 25 | KES 15 | Free | Custom |
| Bill payment | 1.0% | 0.75% | 0.5% | Free | Custom |
| International transfer | 3.5% + KES 500 | 2.6% + KES 375 | 1.75% + KES 250 | Free | Custom |
| Card issuance | KES 500 | KES 375 | KES 250 | Free | Custom |

### Section 8.4: VIP Actions Panel
| Action | Description | Requires | Confirmation |
|--------|-------------|----------|-------------|
| Grant VIP | Set tier, configure exemptions, assign manager | 2FA | Confirm tier + exemptions |
| Upgrade Tier | Change to higher tier with effective date | 2FA | Confirm new benefits |
| Downgrade Tier | Change to lower tier, notify user | 2FA + reason | Confirm + user notification |
| Revoke VIP | Remove VIP status, revert to standard fees | 2FA + reason | Confirm + user notification |
| Set custom limits | Override standard withdrawal/transfer limits | 2FA | Confirm new limits |
| Assign manager | Link to specific admin for dedicated support | None | Confirm |
| Set custom fee | Per-fee-type custom rate for this VIP | 2FA | Confirm fee change |
| Schedule review | Set next VIP review date | None | Confirm date |
| Add VIP note | Internal note for VIP management | None | — |
| VIP activity report | Generate full VIP activity report | None | — |

### Section 8.5: VIP Limit Overrides
| User | Standard Daily | VIP Daily | Standard Monthly | VIP Monthly | ATM Daily | Intl Transfer |
|------|---------------|----------|-----------------|-------------|-----------|---------------|
| Grace Ochieng | KES 500K | Unlimited | KES 5M | Unlimited | Unlimited | Unlimited |
| David Mutua | KES 500K | KES 2M | KES 5M | KES 20M | KES 500K | KES 5M |
| Peter Kamau Ltd | KES 500K | KES 10M | KES 5M | KES 100M | KES 1M | KES 50M |

### Section 8.6: VIP Manager Assignment & Performance
| Manager | VIPs Assigned | Platinum | Gold | Silver | Business | Avg Satisfaction |
|---------|--------------|----------|------|--------|----------|-----------------|
| Joseph M. | 12 | 3 | 4 | 2 | 3 | 4.8/5 |
| Sarah K. | 8 | 1 | 5 | 2 | 0 | 4.6/5 |
| James O. | 6 | 0 | 3 | 2 | 1 | 4.5/5 |
| Mary W. | 5 | 0 | 2 | 1 | 2 | 4.7/5 |

### Section 8.7: VIP Revenue Impact
| Tier | Members | Revenue Foregone (Fees) | Revenue Generated (Volume) | Net Impact |
|------|---------|------------------------|--------------------------|------------|
| Platinum | 8 | KES 4.2M/month | KES 96M volume → KES 2.4M indirect | +KES 1.8M |
| Gold | 24 | KES 3.1M/month | KES 124M volume → KES 3.1M indirect | +KES 0 |
| Silver | 45 | KES 0.8M/month | KES 31M volume → KES 0.8M indirect | +KES 0 |
| Business | 12 | KES 2.4M/month | KES 286M volume → KES 7.2M indirect | +KES 4.8M |

### Section 8.8: VIP Churn Risk
| VIP | Tier | Trend (3mo) | Risk Level | Reason | Action |
|-----|------|-------------|------------|--------|--------|
| Samuel Ndegwa | Silver | ↓ 40% volume | 🟡 Medium | Reduced business activity | Manager outreach |
| Amina Hassan | Gold | → Stable | 🟢 Low | — | Maintain |
| Grace Ochieng | Platinum | ↑ 12% volume | 🟢 Low | — | Maintain |

### Section 8.9: VIP Support SLA
| SLA Metric | Standard User | Silver | Gold | Platinum | Business |
|-----------|--------------|--------|------|----------|----------|
| First response | 15 min | 10 min | 5 min | 2 min | 5 min |
| Resolution time | 4 hours | 2 hours | 1 hour | 30 min | 1 hour |
| Support channel | Chat only | Chat + Email | Chat + Email + Phone | Dedicated phone line | Chat + Email + Phone |
| Available hours | 8AM–10PM | 8AM–10PM | 8AM–10PM | 24/7 | 8AM–8PM |
| Escalation path | Agent → Lead | Agent → Lead → Manager | Agent → Manager → Director | Direct to Director | Agent → Manager |

---

# PAGE 9: TRANSACTION LEDGER

**Purpose:** Complete, searchable, filterable ledger of every transaction on the platform.

### Section 9.1: Ledger Summary Header
| Metric | Value | Period | vs Last Period |
|--------|-------|--------|----------------|
| Total transactions | 1,247,893 | This month | ↑ 15.7% |
| Total volume | KES 18.6B | This month | ↑ 22.1% |
| Total fees collected | KES 186M | This month | ↑ 18.4% |
| Total tax collected | KES 29.8M | This month | ↑ 16.2% |
| Net volume (after fees) | KES 18.41B | This month | ↑ 22.3% |
| Avg transaction size | KES 14,906 | This month | ↑ 5.6% |
| Median transaction size | KES 2,340 | This month | ↑ 3.2% |
| Success rate | 99.4% | This month | ↑ 0.1% |
| Failed transactions | 7,487 | This month | ↓ 8.2% |
| Reversed transactions | 234 | This month | ↓ 12.4% |
| Pending transactions | 342 | Now | — |

### Section 9.2: Advanced Filters
| Filter | Type | Options |
|--------|------|---------|
| Date range | From — To | Custom, Today, Yesterday, This week, This month, Last month, Custom |
| TXN ID | Exact search | Partial or full TXN ID |
| User | Text | Name, phone, account # |
| Type | Multi-select | Transfer, Withdrawal, Deposit, Payment, Reversal, Fee, Refund, Loan disbursement, Loan repayment |
| Sub-type | Multi-select | M-Pesa, Bank, Card, Internal, ATM, International, Bill, Utility |
| Channel | Multi-select | M-Pesa, Visa, Mastercard, Bank Transfer, Internal, ATM, ACH |
| Status | Multi-select | Complete, Pending, Failed, Reversed, Held, Expired |
| Amount range | Min — Max | Number inputs |
| Fee range | Min — Max | Number inputs |
| Fraud score range | Min — Max | 0–100 slider |
| Has flag | Toggle | Yes / No |
| Has admin note | Toggle | Yes / No |
| Reversed | Toggle | Yes / No |
| Currency | Multi-select | KES, USD, EUR, GBP |
| Counterparty | Text | Name or account # of other party |
| Merchant | Text | Merchant name for payments |

### Section 9.3: Transaction Table
| TXN ID | Date/Time | User | Type | Sub-Type | Description | Amount | Fee | Tax | Net | Channel | Status | Fraud | Actions |
|--------|-----------|------|------|----------|-------------|--------|-----|-----|-----|---------|--------|-------|---------|
| TXN-882451 | Aug 22 14:32 | PAY-12345 | Transfer | M-Pesa | To PAY-67890 | KES 15,000 | KES 225 | KES 36 | KES 14,739 | M-Pesa | ✅ | 12 | ⋮ |
| TXN-882450 | Aug 22 14:31 | PAY-45123 | Withdrawal | M-Pesa | Cashout | KES 5,000 | KES 100 | KES 16 | KES 4,884 | M-Pesa | ✅ | 5 | ⋮ |
| TXN-882449 | Aug 22 14:31 | PAY-67890 | Payment | Card | KPLC Electricity | KES 3,200 | KES 48 | KES 8 | KES 3,144 | Visa | ⏳ | 8 | ⋮ |
| TXN-882448 | Aug 22 14:31 | PAY-33456 | Deposit | Bank | KCB Bank | KES 50,000 | KES 0 | KES 0 | KES 50,000 | Bank | ✅ | 3 | ⋮ |

### Section 9.4: Transaction Detail Modal
| Section | Fields |
|---------|--------|
| **Header** | TXN ID, status badge, amount, type badge |
| **Parties** | Sender (name, account, phone), Receiver (name, account, phone) |
| **Details** | Type, sub-type, channel, timestamp, reference number, narration |
| **Financials** | Gross amount, fee breakdown (type + amount), tax breakdown, net amount |
| **Security** | Fraud score, device info, IP address, geolocation, risk factors triggered |
| **Timeline** | Created → Processing → Callback received → Complete/Failed (with timestamps) |
| **Settlement** | Settlement status, settlement date, settlement pool, partner reference |
| **Related** | Reversals, refunds, linked transactions |
| **Admin Actions** | Reverse, Refund, Hold, Flag, Add note, View user |
| **Audit** | All admin actions taken on this transaction |

### Section 9.5: Transaction Analytics Charts
- **Volume over time**: Bar chart — daily transaction volume (KES) for selected period
- **Count over time**: Line chart — daily transaction count
- **Distribution by type**: Donut chart — transfer, withdrawal, deposit, payment
- **Distribution by channel**: Donut chart — M-Pesa, Card, Bank, Internal, ATM
- **Amount distribution**: Histogram — transaction size buckets (KES 0–1K, 1K–5K, 5K–10K, etc.)
- **Success/fail ratio**: Stacked bar — daily success vs failed

### Section 9.6: Failed Transaction Analysis
| Failure Reason | Count (30d) | % of Failed | Trend | Root Cause |
|---------------|-------------|-------------|-------|------------|
| Insufficient funds | 3,245 | 43.3% | ↓ | User error |
| Timeout (M-Pesa) | 1,890 | 25.2% | → | Safaricom latency |
| Invalid card details | 892 | 11.9% | ↓ | User error |
| Bank rejection | 567 | 7.6% | ↑ | Bank side issue |
| Daily limit exceeded | 445 | 5.9% | → | User limit |
| Fraud block | 234 | 3.1% | ↓ | Fraud engine |
| Account frozen | 123 | 1.6% | ↑ | Admin action |
| Other | 91 | 1.2% | → | Various |

### Section 9.7: High-Value Transaction Queue
| TXN ID | Time | User | Amount | Channel | Fraud Score | Approval Status |
|--------|------|------|--------|---------|-------------|-----------------|
| TXN-882400 | 13:00 | PAY-VIP-001 | KES 5M | Bank | 5 | ✅ Auto-approved (VIP) |
| TXN-882350 | 11:30 | PAY-44556 | KES 500K | M-Pesa | 34 | ⏳ Pending finance approval |
| TXN-882300 | 09:15 | PAY-11223 | KES 350K | Card | 42 | ⏳ Pending finance approval |
| TXN-882250 | 08:00 | PAY-77889 | KES 200K | Bank | 12 | ✅ Auto-approved |

### Section 9.8: Bulk Transaction Actions
| Action | Requires | Confirmation | Limits |
|--------|----------|-------------|--------|
| Export CSV/Excel | Permission | Date range confirm | Max 1M rows |
| Export PDF report | Permission | Date range confirm | Max 10K rows |
| Bulk reverse | Super admin + 2FA | Each TXN confirmed | Max 100 |
| Bulk flag | Permission | Selection confirm | Unlimited |
| Submit for reconciliation | Permission | Date range confirm | Unlimited |

### Section 9.9: Transaction Search Performance
| Query Type | Avg Response | Index Used |
|-----------|-------------|------------|
| By TXN ID | <50ms | Primary key |
| By user + date range | <200ms | User_id + created_at |
| By amount range | <300ms | Amount index |
| By type + status | <250ms | Composite index |
| Full text search | <500ms | Elasticsearch |

---

# PAGE 10: FEE & CHARGE MANAGEMENT

**Purpose:** Configure all transaction fees, charges, tax rates, and custom fee tiers.

### Section 10.1: Fee Schedule Overview
| Fee Type | Current Rate | Revenue (30d) | # Transactions | Avg Fee | Status | Last Changed |
|----------|-------------|---------------|----------------|---------|--------|-------------|
| Internal transfer | 1.5% (min KES 10) | KES 42.3M | 689,234 | KES 61.4 | ✅ Active | Jan 2025 |
| M-Pesa cash-in | 0% | KES 0 | 234,567 | KES 0 | ✅ Active | — |
| M-Pesa cashout | 2.0% (min KES 20) | KES 38.7M | 198,432 | KES 195.0 | ✅ Active | Jan 2025 |
| Card payment | 2.5% (min KES 15) | KES 28.4M | 89,123 | KES 318.7 | ✅ Active | Mar 2025 |
| ATM withdrawal | KES 35 flat | KES 8.7M | 247,890 | KES 35.0 | ✅ Active | Jan 2025 |
| FX conversion | 3.0% | KES 4.5M | 12,345 | KES 364.5 | ✅ Active | Jan 2025 |
| Bill payment | 1.0% (min KES 10) | KES 12.8M | 127,456 | KES 100.5 | ✅ Active | Feb 2025 |
| International transfer | 3.5% + KES 500 | KES 2.1M | 4,230 | KES 496.5 | ✅ Active | Jan 2025 |
| Late loan payment | 5% monthly | KES 1.2M | 34 | KES 35,294 | ✅ Active | Jan 2025 |
| Account maintenance | KES 0 | KES 0 | 148,392 | KES 0 | ✅ Active | — |
| Card issuance (physical) | KES 500 | KES 2.3M | 4,600 | KES 500 | ✅ Active | Jan 2025 |
| Card issuance (virtual) | KES 0 | KES 0 | 34,500 | KES 0 | ✅ Active | — |
| Statement request | KES 50 | KES 45K | 900 | KES 50 | ✅ Active | Jan 2025 |

### Section 10.2: Fee Editor
| Setting | Details |
|---------|---------|
| Fee type | Dropdown selection |
| Calculation method | Percentage / Flat / Tiered / Hybrid |
| Rate | Number input with precision |
| Minimum fee | Floor amount (0 = no minimum) |
| Maximum fee | Cap amount (0 = unlimited) |
| Tax treatment | Inclusive / Exclusive + VAT rate |
| Effective date | When change takes effect |
| Expiry date | Optional — auto-revert to previous |
| Applies to | All users / Specific tier / Specific users / Specific VIP tier |
| Channel restriction | All channels / Specific channels |
| Volume threshold | Apply only above/below volume |
| Approval required | Toggle — if on, requires super admin approval before activation |
| Reason for change | Required text field for audit |
| Scheduled changes | Queue multiple changes with different effective dates |

### Section 10.3: Tiered Fee Configuration
| Volume Tier | Internal Transfer | Cashout | Card Payment | Bill Payment |
|-------------|-------------------|---------|--------------|-------------|
| < KES 100K/month | 1.5% (min KES 10) | 2.0% (min KES 20) | 2.5% (min KES 15) | 1.0% (min KES 10) |
| KES 100K–500K/month | 1.25% (min KES 10) | 1.75% (min KES 20) | 2.25% (min KES 15) | 0.85% (min KES 10) |
| KES 500K–2M/month | 1.0% (min KES 10) | 1.5% (min KES 20) | 2.0% (min KES 15) | 0.75% (min KES 10) |
| KES 2M–10M/month | 0.75% (min KES 10) | 1.0% (min KES 15) | 1.5% (min KES 10) | 0.5% (min KES 5) |
| > KES 10M/month | Custom | Custom | Custom | Custom |

### Section 10.4: Fee Impact Simulator
| Scenario | Current Revenue | Projected Revenue | Impact | Users Affected | Avg Saving/User |
|----------|----------------|-------------------|--------|---------------|-----------------|
| Internal 1.5% → 1.25% | KES 42.3M | KES 35.2M | -KES 7.1M (-16.8%) | 689,234 | KES 10.3 |
| Cashout 2.0% → 1.75% | KES 38.7M | KES 33.9M | -KES 4.8M (-12.4%) | 198,432 | KES 24.2 |
| ATM KES 35 → KES 30 | KES 8.7M | KES 7.5M | -KES 1.2M (-13.8%) | 247,890 | KES 4.8 |
| New: Bill payment 1.0% → 1.5% | KES 12.8M | KES 19.2M | +KES 6.4M (+50%) | 127,456 | -KES 50.2 |
| Combined scenario | KES 186M | KES 178.4M | -KES 7.6M (-4.1%) | All | Mixed |

### Section 10.5: Fee Waiver & Override Log
| Date | Admin | User | Fee Type | Original | Waived To | Reason | Approved By |
|------|-------|------|----------|----------|-----------|--------|-------------|
| Aug 22 | Joseph M. | PAY-VIP-001 | All fees | KES 45K | KES 0 | Platinum VIP | — |
| Aug 21 | Sarah K. | PAY-67890 | Transfer fee | KES 225 | KES 0 | Goodwill (system error) | Joseph M. |
| Aug 20 | James O. | PAY-11223 | ATM fee | KES 35 | KES 0 | Competitive retention | Sarah K. |

### Section 10.6: Scheduled Fee Changes
| Fee | Current | New | Effective | Status | Approval |
|-----|---------|-----|-----------|--------|----------|
| International transfer | 3.5% + KES 500 | 3.0% + KES 300 | Sep 1 | ⏳ Pending | Awaiting super admin |
| Card payment | 2.5% | 2.25% | Sep 15 | 📋 Draft | Not submitted |
| Bill payment | 1.0% | 1.5% | Sep 1 | ⏳ Pending | Awaiting super admin |

### Section 10.7: Fee Revenue Forecasting
| Fee Type | Current Month | Next Month (Proj) | +3 Months (Proj) | Growth Driver |
|----------|--------------|-------------------|-------------------|---------------|
| Transfer fees | KES 42.3M | KES 46.5M | KES 58.2M | User growth |
| Cashout fees | KES 38.7M | KES 41.2M | KES 48.9M | Volume increase |
| Card fees | KES 28.4M | KES 32.1M | KES 42.3M | Card adoption |
| Bill payment | KES 12.8M | KES 14.5M | KES 19.8M | New billers |
| **Total** | **KES 186M** | **KES 204M** | **KES 268M** | — |

### Section 10.8: Partner Fee Sharing Configuration
| Partner | Fee Type | PayMo Share | Partner Share | Settlement | Status |
|---------|----------|-------------|---------------|------------|--------|
| Safaricom (M-Pesa) | Cashout | 60% | 40% | Daily | ✅ Active |
| Visa | Card payment | 70% | 30% | Weekly | ✅ Active |
| KCB Bank | Bank transfer | 80% | 20% | Daily | ✅ Active |
| KPLC | Bill payment | 30% | 70% | Weekly | ✅ Active |

---

# PAGE 11: SETTLEMENT & RECONCILIATION

**Purpose:** Manage partner settlements, bank reconciliations, and financial integrity.

### Section 11.1: Settlement Dashboard
| Metric | Value | vs Yesterday |
|--------|-------|-------------|
| Pending settlements | 12 (KES 45.6M) | +2 |
| Completed today | 8 (KES 32.1M) | +1 |
| Failed today | 0 | — |
| Overdue settlements | 1 (KES 2.1M) | +1 |
| Next auto-settlement | 16:00 EAT (2h 15m) | — |
| Total settled (30d) | KES 1.2B | ↑ 12% |
| Settlement exceptions | 3 (KES 450K variance) | — |

### Section 11.2: Partner Settlement Queue
| Partner | Type | Amount | TXN Count | Due Date | Status | Auto/Manual | Actions |
|---------|------|--------|-----------|----------|--------|-------------|---------|
| Safaricom (M-Pesa) | Pay-in | KES 12.4M | 23,456 | Today 16:00 | ⏳ Scheduled | Auto | ⋮ |
| KCB Bank | Pay-out | KES 8.7M | 3,456 | Today 16:00 | ⏳ Scheduled | Auto | ⋮ |
| Visa Kenya | Card clearing | KES 4.2M | 8,901 | Tomorrow | 🔮 Future | Auto | ⋮ |
| Mastercard | Card clearing | KES 2.8M | 5,670 | Tomorrow | 🔮 Future | Auto | ⋮ |
| QuickLend Partner | Loan settlement | KES 2.1M | 1,234 | 2 days ago | 🔴 Overdue | Manual | ⋮ |
| KPLC | Bill commission | KES 1.8M | 12,345 | Aug 25 | 🔮 Future | Auto | ⋮ |

### Section 11.3: Reconciliation Dashboard
| Date | Expected (KES) | Actual (KES) | Variance (KES) | Variance % | Status | Actions |
|------|----------------|-------------|----------------|------------|--------|---------|
| Aug 22 | 186,400,000 | 186,200,000 | -200,000 | -0.11% | 🟡 Minor | Investigate → |
| Aug 21 | 172,100,000 | 172,100,000 | 0 | 0.00% | ✅ Matched | — |
| Aug 20 | 168,500,000 | 168,500,000 | 0 | 0.00% | ✅ Matched | — |
| Aug 19 | 155,300,000 | 155,800,000 | +500,000 | +0.32% | 🟡 Minor | Investigate → |
| Aug 18 | 149,200,000 | 149,200,000 | 0 | 0.00% | ✅ Matched | — |

### Section 11.4: Reconciliation Breakdown by Channel
| Channel | Aug 22 Expected | Aug 22 Actual | Variance | TXN Count | Match Rate |
|---------|----------------|--------------|----------|-----------|------------|
| M-Pesa | 82,300,000 | 82,200,000 | -100,000 | 45,670 | 99.88% |
| Cards (Visa) | 28,400,000 | 28,400,000 | 0 | 12,340 | 100% |
| Cards (MC) | 18,200,000 | 18,200,000 | 0 | 8,900 | 100% |
| Bank Transfer | 18,700,000 | 18,600,000 | -100,000 | 2,340 | 99.46% |
| Internal | 31,500,000 | 31,500,000 | 0 | 89,120 | 100% |
| ATM | 8,700,000 | 8,700,000 | 0 | 4,560 | 100% |

### Section 11.5: Reconciliation Detail Modal
| Section | Content |
|---------|---------|
| Summary | Date, expected vs actual, variance amount and % |
| Channel breakdown | Per-channel expected, actual, variance |
| Unmatched transactions | List of TXNs without matching partner record |
| Orphan transactions | Partner records without matching internal TXN |
| Timing differences | TXNs in transit, pending callbacks |
| Adjustment actions | Post adjustment, create suspense entry, mark as resolved, escalate |
| Approval | Requires finance manager approval for adjustments > KES 100K |
| History | Past reconciliations for this date with all adjustments |

### Section 11.6: Suspense Account Management
| Entry | Date | Amount | Reason | Status | Age | Resolution |
|-------|------|--------|--------|--------|-----|------------|
| SUS-001 | Aug 22 | KES 100,000 | M-Pesa timing difference | ⏳ Pending | 0d | Awaiting callback |
| SUS-002 | Aug 19 | KES 500,000 | Bank transfer mismatch | 🟡 Under review | 3d | Investigating |
| SUS-003 | Aug 15 | KES 50,000 | Card chargeback | ✅ Resolved | 7d | Reversed |
| SUS-004 | Aug 10 | KES 200,000 | Duplicate M-Pesa credit | ✅ Resolved | 12d | Reversed |

### Section 11.7: Settlement History
| Date | Partner | Amount | TXN Count | Method | Reference | Status |
|------|---------|--------|-----------|--------|-----------|--------|
| Aug 22 | Safaricom | KES 14.2M | 28,900 | M-Pesa B2C | SFK-882341 | ✅ Complete |
| Aug 22 | KCB Bank | KES 6.3M | 2,100 | RTGS | KCB-RTG-445 | ✅ Complete |
| Aug 21 | Safaricom | KES 13.8M | 27,200 | M-Pesa B2C | SFK-881990 | ✅ Complete |
| Aug 21 | Visa | KES 4.1M | 8,600 | Wire | VISA-22891 | ✅ Complete |

### Section 11.8: Auto-Reconciliation Configuration
| Setting | Value |
|---------|-------|
| Auto-reconcile frequency | Every 30 minutes |
| Auto-accept threshold | Variance < KES 10,000 (< 0.01%) |
| Auto-escalate threshold | Variance > KES 100,000 (> 0.1%) |
| Max retry for timing differences | 3 attempts over 24 hours |
| Auto-suspense creation | Variance > KES 10,000 and < KES 100,000 |
| Notification on mismatch | Email to finance team + Slack alert |
| Reconciliation cut-off time | 23:59 EAT daily |
| Weekend/holiday handling | Next business day |

### Section 11.9: Settlement Exception Handling
| Exception Type | Count (30d) | Avg Resolution Time | Process |
|---------------|-------------|-------------------|---------|
| Insufficient float | 3 | 2 hours | Auto-alert → Manual top-up |
| Partner rejection | 1 | 4 hours | Investigate → Correct → Resubmit |
| Duplicate settlement | 0 | — | Auto-detected, blocked |
| Amount mismatch | 5 | 6 hours | Reconcile → Adjust → Resettle |
| Missing reference | 2 | 1 hour | Contact partner → Match manually |

---

# PAGE 12: LIQUIDITY & POOL MANAGEMENT

**Purpose:** Manage platform liquidity pools, reserve requirements, and fund allocation.

### Section 12.1: Liquidity Overview Dashboard
| Pool | Balance | Reserved | Available | Utilization | Health | Trend |
|------|---------|----------|-----------|-------------|--------|-------|
| Main Operating Pool | KES 892M | KES 234M | KES 658M | 73.5% | 🟢 Healthy | ↑ |
| M-Pesa Float | KES 125M | KES 45M | KES 80M | 64.0% | 🟢 Healthy | → |
| Card Settlement Pool | KES 67M | KES 12M | KES 55M | 82.1% | 🟡 Monitor | ↑ |
| ATM Pool | KES 34M | KES 8M | KES 26M | 76.5% | 🟢 Healthy | → |
| Emergency Reserve | KES 500M | KES 500M | KES 0 | 100% | 🔒 Locked | → |
| Partner Settlement Pool | KES 45M | KES 45M | KES 0 | 100% | 🔒 Pending | → |
| Tax Withholding Pool | KES 12M | KES 12M | KES 0 | 100% | 🔒 Held | → |
| Loan Disbursement Pool | KES 234M | KES 89M | KES 145M | 62.0% | 🟢 Healthy | ↑ |
| **Total** | **KES 1,909M** | **KES 945M** | **KES 964M** | **49.5%** | 🟢 | — |

### Section 12.2: Pool Transfer History
| Date | From Pool | To Pool | Amount | Reason | Initiated By | Approved By | Status |
|------|-----------|---------|--------|--------|-------------|-------------|--------|
| Aug 22 | Main Operating | Card Settlement | KES 15M | Low card pool | Finance Mgr | Super Admin | ✅ Complete |
| Aug 21 | Main Operating | M-Pesa Float | KES 20M | End-of-day top-up | System auto | — | ✅ Complete |
| Aug 20 | Loan Disbursement | Main Operating | KES 5M | Surplus reallocation | Finance Mgr | Super Admin | ✅ Complete |

### Section 12.3: Pool Management Actions
| Action | Description | Requires | Approval |
|--------|-------------|----------|----------|
| Transfer between pools | Move funds from one pool to another | 2FA | Finance manager |
| Top up pool (external) | Add funds from external bank account | 2FA | Super admin |
| Withdraw from pool (external) | Move to external account | 2FA | Super admin + board |
| Adjust reserve ratio | Change minimum reserve % for a pool | 2FA | Super admin |
| Set alert thresholds | Configure low-balance alerts per pool | None | — |
| Create new pool | Define a new liquidity pool | 2FA | Super admin |
| Freeze pool | Lock pool, prevent all transactions | 2FA | Super admin |

### Section 12.4: Liquidity Alerts Configuration
| Alert | Pool | Threshold | Current | Status | Notification |
|-------|------|-----------|---------|--------|-------------|
| M-Pesa float low | M-Pesa Float | < KES 50M | KES 125M | 🟢 OK | SMS + Email + Slack |
| ATM pool low | ATM Pool | < KES 20M | KES 34M | 🟢 OK | SMS + Email |
| Card settlement low | Card Settlement | < KES 30M | KES 67M | 🟢 OK | SMS + Email + Slack |
| Operating pool critical | Main Operating | < KES 200M | KES 892M | 🟢 OK | SMS + Email + Slack + Call |
| Reserve ratio breach | All | < 15% of total | 32.4% | 🟢 OK | Email + Slack |
| Loan pool low | Loan Disbursement | < KES 100M | KES 234M | 🟢 OK | Email + Slack |
| Tax pool shortfall | Tax Withholding | < required amount | KES 12M | 🟢 OK | Email + Slack |

### Section 12.5: Liquidity Forecasting
| Date | Projected Outflows | Projected Inflows | Net | Projected Balance | Action Needed |
|------|-------------------|-------------------|-----|-------------------|---------------|
| Tomorrow | KES 45M | KES 52M | +KES 7M | KES 899M | None |
| +3 days | KES 134M | KES 148M | +KES 14M | KES 906M | None |
| +7 days | KES 312M | KES 345M | +KES 33M | KES 925M | None |
| +14 days | KES 623M | KES 689M | +KES 66M | KES 958M | None |
| +30 days | KES 1.34B | KES 1.42B | +KES 80M | KES 972M | None |

### Section 12.6: Reserve Requirements
| Requirement | Regulatory Basis | Required | Current | Compliance |
|-------------|-----------------|----------|---------|------------|
| Minimum reserve (CBK) | CBK Prudential Guidelines | 10% of deposits | 15.2% | ✅ Compliant |
| Emergency reserve (internal) | Board policy | KES 500M | KES 500M | ✅ Compliant |
| Settlement reserve | Partner agreements | 100% of pending | 100% | ✅ Compliant |
| Tax reserve | KRA requirements | 100% of withheld | 100% | ✅ Compliant |
| Loan loss provision | IFRS 9 | 5% of loan book | 6.2% | ✅ Compliant |

### Section 12.7: Cash Flow Statement (Simplified)
| Category | 30 Days | 60 Days | 90 Days |
|----------|---------|---------|---------|
| Operating inflows | KES 18.6B | KES 35.2B | KES 52.1B |
| Operating outflows | KES 17.8B | KES 33.8B | KES 50.2B |
| Net operating | KES 800M | KES 1.4B | KES 1.9B |
| Financing inflows | KES 200M | KES 400M | KES 600M |
| Financing outflows | KES 150M | KES 300M | KES 450M |
| Net financing | KES 50M | KES 100M | KES 150M |
| **Net cash flow** | **KES 850M** | **KES 1.5B** | **KES 2.05B** |

### Section 12.8: Pool Activity Log
| Time | Pool | Action | Amount | Balance After | By |
|------|------|--------|--------|---------------|-----|
| 14:30 | M-Pesa Float | Settlement out | KES 12.4M | KES 125M | Auto |
| 14:15 | Main Operating | Fee income in | KES 234K | KES 892M | Auto |
| 13:45 | Card Settlement | Card clearing out | KES 4.2M | KES 67M | Auto |
| 13:00 | Loan Disbursement | Loan disbursement out | KES 1.2M | KES 234M | Auto |

---

# PAGE 13: WITHDRAWAL CONTROLS

**Purpose:** Set and enforce withdrawal limits, pool-based access rules, and anti-fraud withdrawal controls.

### Section 13.1: Global Withdrawal Limits
| Limit Type | Current Value | Max Allowed | Effective Since | Last Changed | Change History |
|-----------|--------------|-------------|-----------------|-------------|----------------|
| Daily limit (per user) | KES 500,000 | KES 5,000,000 | Jan 2025 | Jan 2025 | View → |
| Monthly limit (per user) | KES 5,000,000 | KES 50,000,000 | Jan 2025 | Jan 2025 | View → |
| Per-transaction max | KES 150,000 | KES 1,000,000 | Jan 2025 | Jan 2025 | View → |
| Minimum withdrawal | KES 100 | KES 50 | Jan 2025 | Jan 2025 | View → |
| ATM daily limit | KES 100,000 | KES 500,000 | Jan 2025 | Jan 2025 | View → |
| ATM per-transaction | KES 40,000 | KES 200,000 | Jan 2025 | Jan 2025 | View → |
| International daily | KES 1,000,000 | KES 10,000,000 | Jan 2025 | Jan 2025 | View → |
| Business daily (per sub) | KES 2,000,000 | KES 20,000,000 | Mar 2025 | Mar 2025 | View → |

### Section 13.2: Pool-Based Access Rules
| Rule | Description | Trigger | Action | Status |
|------|-------------|---------|--------|--------|
| Reserve floor | Block withdrawals when available pool < 15% | Pool balance check | Block all withdrawals | ✅ Active |
| Channel reserve | Each channel has dedicated reserve | Per-channel balance | Block channel-specific | ✅ Active |
| Velocity check | >3 withdrawals in 1 hour | Transaction counter | Flag + require OTP | ✅ Active |
| New account restriction | First 7 days: max KES 10,000/day | Account age | Enforce reduced limit | ✅ Active |
| High-value threshold | >KES 100,000 requires additional verification | Amount check | Trigger OTP + push | ✅ Active |
| Balance floor | KES 500 minimum balance maintained | Balance check | Block if result < KES 500 | ✅ Active |
| Time-based restriction | Withdrawals only 6AM–10PM | Time check | Block outside hours | ❌ Inactive |

### Section 13.3: Anti-Fraud Withdrawal Controls
| Control | Description | Trigger | Auto-Action | Override |
|---------|-------------|---------|-------------|----------|
| Dual-device detection | Same user, 2 browsers/devices simultaneously | Real-time | Block + freeze + alert | Super admin only |
| Geo-anomaly | Withdrawal IP > 500km from usual location | Real-time | Block + require VP verification | Admin with 2FA |
| Velocity spike | >50% increase in withdrawal frequency vs 30d avg | Real-time | Flag + require OTP | Admin with 2FA |
| New device | Withdrawal from newly registered device | Real-time | Require OTP + push | Admin with 2FA |
| Amount anomaly | Withdrawal >300% of user's 30d avg | Real-time | Flag + require OTP | Admin with 2FA |
| Time anomaly | Withdrawal at unusual hour (2AM–5AM) for user | Real-time | Flag + require OTP | Admin with 2FA |
| Cross-border | VPN/proxy detected during withdrawal | Real-time | Block + alert | Super admin only |
| Sequential rapid | 3+ withdrawals within 10 minutes | Real-time | Block + alert | Admin with 2FA |
| SIM swap detection | Recent phone number change + withdrawal attempt | Real-time | Block + freeze + alert | Super admin only |
| Account age + amount | New account (<30d) + large withdrawal (>KES 50K) | Real-time | Block + require enhanced verification | Super admin only |

### Section 13.4: User-Specific Limit Overrides
| User | Standard Daily | Custom Daily | Standard Monthly | Custom Monthly | Reason | Set By | Expires |
|------|---------------|-------------|-----------------|---------------|--------|--------|---------|
| PAY-VIP-001 | KES 500K | Unlimited | KES 5M | Unlimited | VIP Platinum | Joseph M. | Never |
| PAY-VIP-004 | KES 500K | KES 10M | KES 5M | KES 100M | Business Premium | Joseph M. | Never |
| PAY-67890 | KES 500K | KES 250K | KES 5M | KES 2M | Previous fraud flag | Sarah K. | Dec 2026 |
| PAY-89012 | KES 500K | KES 100K | KES 5M | KES 500K | New account restriction | System | Sep 2026 |
| PAY-11223 | KES 500K | KES 0 | KES 5M | KES 0 | Fraud investigation | Joseph M. | Until cleared |

### Section 13.5: Blocked Withdrawals Log
| Date | Time | User | Amount | Device | IP | Reason | Auto-Action | Admin Action |
|------|------|------|--------|--------|----|--------|-------------|-------------|
| Aug 22 | 14:32 | PAY-89012 | KES 50,000 | Chrome/Win + Safari/iOS | 102.x / 41.x | Dual-device | Frozen | Pending review |
| Aug 22 | 11:15 | PAY-45123 | KES 200,000 | Firefox/Linux | 196.x | Geo-anomaly | Blocked | Released (VP verified) |
| Aug 21 | 23:45 | PAY-22334 | KES 80,000 | Chrome/Android | 41.x | Velocity spike | Blocked | Released (user confirmed) |
| Aug 21 | 03:12 | PAY-55667 | KES 120,000 | Unknown/Android | 102.x (VPN) | Cross-border | Frozen | Pending review |
| Aug 20 | 15:00 | PAY-77889 | KES 45,000 | Chrome/Windows | 41.x | New device | OTP required | User completed OTP |

### Section 13.6: Withdrawal Analytics
| Metric | Today | This Week | This Month | vs Last Month |
|--------|-------|-----------|------------|---------------|
| Total withdrawals | KES 45.2M | KES 312M | KES 1.34B | ↑ 15.3% |
| Withdrawal count | 12,345 | 84,500 | 367,000 | ↑ 12.1% |
| Avg withdrawal size | KES 3,662 | KES 3,692 | KES 3,651 | ↑ 2.8% |
| Blocked withdrawals | 23 | 156 | 678 | ↓ 8.4% |
| False positive rate | 34% | 31% | 28% | ↓ 6% |
| Channel breakdown (M-Pesa) | 68% | 67% | 66% | — |
| Channel breakdown (ATM) | 12% | 13% | 14% | — |
| Channel breakdown (Bank) | 20% | 20% | 20% | — |

### Section 13.7: Withdrawal Limit Change Audit
| Date | Admin | Change | From | To | Reason | Approved By |
|------|-------|--------|------|-----|--------|-------------|
| Aug 22 | Joseph M. | Global daily limit | KES 500K | KES 500K | No change (reviewed) | — |
| Aug 15 | Joseph M. | User PAY-VIP-004 daily | KES 500K | KES 10M | Business growth | — |
| Aug 10 | Sarah K. | User PAY-67890 daily | KES 500K | KES 250K | Fraud precaution | Joseph M. |
| Aug 1 | Joseph M. | ATM per-transaction | KES 35K | KES 40K | Partner agreement update | — |

### Section 13.8: Withdrawal Rule Configuration
| Rule | Enabled | Parameters | Last Modified |
|------|---------|------------|---------------|
| Dual-device block | ✅ | Block on simultaneous devices | Aug 1 |
| Geo-anomaly threshold | ✅ | 500km radius | Jul 15 |
| Velocity spike threshold | ✅ | 50% above 30d avg | Jul 15 |
| New device verification | ✅ | Always require OTP | Jun 1 |
| Amount anomaly multiplier | ✅ | 300% of 30d avg | Jul 15 |
| Time anomaly window | ❌ | 2AM–5AM (disabled) | Aug 1 |
| Cross-border VPN detection | ✅ | Block all VPN/proxy | Jul 1 |
| Sequential rapid threshold | ✅ | 3 in 10 minutes | Jul 15 |

---

# PAGE 14: TAX & COMPLIANCE REPORTING

**Purpose:** Manage tax withholding, generate compliance reports, and ensure regulatory adherence.

### Section 14.1: Tax Configuration
| Tax Type | Rate | Applies To | Collection Method | Status | Legal Basis |
|----------|------|-----------|-------------------|--------|-------------|
| VAT | 16% | Service fees | Auto-deducted at source | ✅ Active | VAT Act 2013 |
| Excise Duty | 20% | Mobile money transfer fees | Auto-deducted at source | ✅ Active | Finance Act 2023 |
| Withholding Tax (resident) | 5% | Interest income >KES 15K/mo | Auto-deducted at source | ✅ Active | ITA Cap 470 |
| Withholding Tax (non-resident) | 15% | Interest income | Auto-deducted at source | ✅ Active | ITA Cap 470 |
| Digital Service Tax | 1.5% | Gross transaction value | Auto-calculated, remitted monthly | ✅ Active | Finance Act 2020 |
| Stamp Duty | 1% | Card transactions | Auto-deducted at source | ✅ Active | Stamp Duty Act |
| Paye (Staff) | Per bracket | Employee salaries | Payroll system | ✅ Active | ITA Cap 470 |
| Corporate Tax | 30% | Company profits | Quarterly provision | ✅ Active | ITA Part IV |

### Section 14.2: Tax Pool Balances
| Pool | Collected (30d) | Remitted (30d) | Held Balance | Next Remittance | Status |
|------|----------------|----------------|-------------|-----------------|--------|
| VAT Pool | KES 29.8M | KES 28.2M | KES 1.6M | Sep 20 | 🟢 On track |
| Excise Duty Pool | KES 37.2M | KES 35.4M | KES 1.8M | Sep 20 | 🟢 On track |
| WHT Pool | KES 12.4M | KES 11.8M | KES 600K | Sep 20 | 🟢 On track |
| DST Pool | KES 27.9M | KES 26.5M | KES 1.4M | Sep 20 | 🟢 On track |
| Stamp Duty Pool | KES 284K | KES 270K | KES 14K | Sep 20 | 🟢 On track |
| PAYE Pool | KES 8.4M | KES 8.4M | KES 0 | Sep 9 | 🟢 On track |

### Section 14.3: Compliance Reports Schedule
| Report | Authority | Frequency | Last Filed | Due Date | Status | Filing Method |
|--------|-----------|-----------|------------|----------|--------|---------------|
| VAT Return (ITAX) | KRA | Monthly | Aug 15 | Sep 20 | ✅ Filed | iTAX portal |
| Excise Duty Return | KRA | Monthly | Aug 15 | Sep 20 | ✅ Filed | iTAX portal |
| DST Return | KRA | Monthly | Aug 15 | Sep 20 | ✅ Filed | iTAX portal |
| PAYE Return | KRA | Monthly | Sep 9 | Sep 9 | ✅ Filed | iTAX portal |
| Income Tax (Corporate) | KRA | Quarterly | Jun 30 | Sep 30 | ⏳ Pending | iTAX portal |
| CBK Prudential Returns | CBK | Monthly | Jul 31 | Aug 31 | ⏳ Pending | CBK portal |
| AML/CFT Report | FRA | Quarterly | Jun 30 | Sep 30 | ⏳ Pending | GoAML system |
| Transaction Tax Report | KRA | Monthly | Jul 31 | Aug 31 | ⏳ Pending | iTAX portal |
| Beneficial Ownership | RAR | Annual | Dec 31 | Dec 31 | 📋 Future | RAR portal |
| Data Protection Audit | ODPC | Annual | Mar 31 | Mar 31 | 📋 Future | ODPC portal |

### Section 14.4: User Tax Summary (Searchable)
| User | Gross Fees | VAT | Excise | WHT | Net Deducted | Tax Certificate |
|------|-----------|-----|--------|-----|-------------|----------------|
| PAY-12345 | KES 34,200 | KES 1,710 | KES 2,736 | KES 0 | KES 4,446 | Available ✅ |
| PAY-67890 | KES 12,800 | KES 640 | KES 1,024 | KES 0 | KES 1,664 | Available ✅ |
| PAY-89012 | KES 2,100 | KES 105 | KES 168 | KES 0 | KES 273 | Available ✅ |

### Section 14.5: Tax Remittance History
| Date | Tax Type | Amount | Reference | Method | Status |
|------|----------|--------|-----------|--------|--------|
| Aug 15 | VAT | KES 28.2M | KRA-VAT-0826 | iTAX (EFT) | ✅ Acknowledged |
| Aug 15 | Excise Duty | KES 35.4M | KRA-EXC-0826 | iTAX (EFT) | ✅ Acknowledged |
| Aug 15 | DST | KES 26.5M | KRA-DST-0826 | iTAX (EFT) | ✅ Acknowledged |
| Sep 9 | PAYE | KES 8.4M | KRA-PAYE-0909 | iTAX (EFT) | ✅ Acknowledged |

### Section 14.6: Regulatory Correspondence Tracker
| Date | From | Subject | Type | Due Response | Status | Assigned |
|------|------|---------|------|-------------|--------|----------|
| Aug 20 | CBK | Monthly prudential data request | Information | Aug 31 | ⏳ In progress | Finance Mgr |
| Aug 15 | KRA | VAT reconciliation query | Inquiry | Sep 5 | ⏳ In progress | Tax team |
| Aug 10 | FRA | AML training compliance reminder | Advisory | N/A | ✅ Acknowledged | Compliance |
| Jul 28 | ODPC | Data breach notification procedures | Advisory | N/A | ✅ Acknowledged | Legal |

### Section 14.7: Compliance Calendar
| Date | Event | Authority | Category | Preparation Start | Owner |
|------|-------|-----------|----------|------------------|-------|
| Aug 31 | CBK Monthly Returns | CBK | Banking | Aug 25 | Finance Mgr |
| Sep 5 | KRA VAT Query Response | KRA | Tax | Aug 25 | Tax team |
| Sep 9 | PAYE Return | KRA | Tax | Sep 1 | HR |
| Sep 20 | VAT + Excise + DST Returns | KRA | Tax | Sep 15 | Tax team |
| Sep 30 | Corporate Tax (Q2) | KRA | Tax | Sep 20 | Finance Mgr |
| Sep 30 | AML/CFT Report (Q3) | FRA | AML | Sep 15 | Compliance |
| Dec 31 | Beneficial Ownership | RAR | Governance | Dec 1 | Legal |
| Mar 31 | Data Protection Audit | ODPC | Privacy | Mar 1 | Legal |

### Section 14.8: Tax Configuration Audit Trail
| Date | Admin | Change | From | To | Reason |
|------|-------|--------|------|-----|--------|
| Aug 1 | Joseph M. | VAT rate | 16% | 16% | No change (annual review) |
| Jul 1 | Finance Mgr | Excise duty base | Transfer fees only | Transfer + cashout fees | Finance Act 2023 amendment |
| Jan 1 | Joseph M. | DST rate | 1.5% | 1.5% | No change (annual review) |

---

# PAGE 15: FRAUD DASHBOARD

**Purpose:** Central fraud monitoring — alerts, investigations, patterns, and prevention.

### Section 15.1: Fraud Overview Metrics
| Metric | Value | Trend | Target | Status |
|--------|-------|-------|--------|--------|
| Fraud alerts (30d) | 234 | ↑ 12% | — | — |
| Confirmed fraud cases | 18 | ↓ 3 | <10 | 🟡 |
| Fraud amount (30d) | KES 2.4M | ↓ 15% | <KES 1M | 🟡 |
| Fraud rate | 0.023% | ↓ | <0.05% | 🟢 |
| Fraud losses recovered | KES 1.6M | ↑ 22% | >80% | 🟢 |
| False positive rate | 34% | ↓ 4% | <20% | 🟡 |
| Avg investigation time | 4.2 hours | ↓ 30min | <2 hours | 🟡 |
| Active investigations | 12 | → | — | — |
| Escalated to law enforcement | 2 | → | — | — |
| SARs filed (30d) | 3 | → | — | — |
| Blacklisted entities (30d) | 23 | ↑ | — | — |

### Section 15.2: Active Fraud Alerts
| Alert ID | Time | Type | User | Amount | Risk Score | Status | Assigned | SLA Remaining |
|----------|------|------|------|--------|------------|--------|----------|---------------|
| FRD-2848 | 14:32 | Velocity spike | PAY-55667 | KES 120K | 78 | 🔴 New | Unassigned | 4h |
| FRD-2847 | 14:31 | Dual-device withdrawal | PAY-89012 | KES 50K | 87 | 🔴 New | Unassigned | 4h |
| FRD-2846 | 14:15 | Velocity spike | PAY-45123 | KES 200K | 72 | 🟡 In review | Sarah K. | 2h |
| FRD-2845 | 13:45 | Geo-anomaly | PAY-22334 | KES 80K | 65 | 🟡 In review | James O. | 1h |
| FRD-2844 | 12:30 | Unusual pattern | PAY-67890 | KES 45K | 58 | 🟢 Resolved | Sarah K. | — |
| FRD-2843 | 11:15 | Account takeover attempt | PAY-11223 | KES 0 | 91 | 🔴 New | Unassigned | 4h |
| FRD-2842 | 10:00 | Structuring | PAY-44556 | KES 48K | 62 | 🟡 In review | David K. | 3h |

### Section 15.3: Fraud Pattern Detection
| Pattern | Description | Detection Method | Last Detected | Frequency (30d) | Auto-Action |
|---------|-------------|-----------------|---------------|-----------------|-------------|
| Dual browser | Same user, 2 browsers, simultaneous withdrawal | Session tracking | Today | 3 | Auto-block + alert |
| Rapid cycling | Deposit → Transfer → Withdraw in <5min | Sequence analysis | Yesterday | 12 | Auto-flag |
| Mule account | Receives from many, sends to one | Network analysis | 3 days ago | 2 | Auto-freeze |
| Card testing | Multiple small transactions on new card | Velocity + amount | 1 week ago | 0 | Auto-block |
| SIM swap | Login from new device + changed phone number | Telco API check | 2 days ago | 1 | Auto-freeze + alert |
| Account farming | Multiple accounts from same device/IP | Device fingerprint | 5 days ago | 3 | Auto-flag |
| Structuring | Multiple transactions just below reporting threshold | Amount pattern | Today | 5 | Auto-flag |
| Sleep-to-active | Dormant account suddenly very active | Activity analysis | Yesterday | 8 | Auto-flag |
| Credential stuffing | Multiple failed logins followed by success | Login analysis | 3 days ago | 4 | Auto-block + alert |

### Section 15.4: Investigation Workspace
| Section | Content |
|---------|---------|
| **Alert details** | Full alert context, trigger rule, timestamp, risk factors |
| **User profile** | Name, account, KYC status, risk score history, account age |
| **User timeline** | All user activity in last 24h — logins, transactions, settings changes |
| **Device fingerprint** | Browser, OS, IP, geo, screen resolution, canvas hash, WebGL |
| **Related accounts** | Accounts linked by device, IP, phone, payment patterns |
| **Transaction network** | Visual graph of money flows — who sent, who received |
| **Evidence locker** | Transaction screenshots, login logs, device history, API logs |
| **Actions** | Freeze, block, escalate, close case, contact user, file SAR |
| **Resolution** | Fraud confirmed / False positive / Escalated to law enforcement / Pending |
| **Notes** | Investigation notes, timeline entries, evidence descriptions |
| **Checklist** | Standard investigation checklist — device check, user contact, etc. |

### Section 15.5: Blacklist Management
| Type | Entries | Added (30d) | Removed (30d) | Last Updated | Auto/Manual |
|------|---------|-------------|---------------|-------------|-------------|
| Device fingerprints | 1,234 | 23 | 5 | Aug 22 | Both |
| IP addresses | 567 | 12 | 3 | Aug 22 | Both |
| Phone numbers | 89 | 4 | 1 | Aug 20 | Manual |
| Email addresses | 34 | 2 | 0 | Aug 18 | Manual |
| Card BINs | 12 | 1 | 0 | Aug 15 | Manual |
| National IDs | 45 | 3 | 0 | Aug 22 | Manual |
| Bank accounts | 12 | 1 | 0 | Aug 10 | Manual |

### Section 15.6: Fraud Loss Analysis
| Category | Amount (30d) | % of Total | Recovery | Net Loss | Trend |
|----------|-------------|------------|----------|----------|-------|
| Account takeover | KES 890K | 37.1% | KES 620K | KES 270K | ↓ |
| Card fraud | KES 560K | 23.3% | KES 340K | KES 220K | → |
| Social engineering | KES 450K | 18.8% | KES 280K | KES 170K | ↑ |
| Internal fraud | KES 300K | 12.5% | KES 200K | KES 100K | → |
| Mule accounts | KES 200K | 8.3% | KES 160K | KES 40K | ↓ |
| **Total** | **KES 2.4M** | **100%** | **KES 1.6M** | **KES 800K** | ↓ |

### Section 15.7: Fraud Rule Management
| Rule ID | Rule Name | Trigger | Severity | Status | False Positive Rate | Last Tuned |
|---------|-----------|---------|----------|--------|-------------------|------------|
| FR-001 | Dual-device block | 2 devices, same user, <5min | Critical | ✅ Active | 5% | Aug 1 |
| FR-002 | Velocity spike | >3x normal in 1 hour | High | ✅ Active | 28% | Jul 15 |
| FR-003 | Geo-impossible | >500km in <30 min | Critical | ✅ Active | 2% | Jul 15 |
| FR-004 | Amount anomaly | >300% of 30d avg | High | ✅ Active | 35% | Aug 10 |
| FR-005 | Structuring | 3+ TXNs just below KES 150K in 24h | High | ✅ Active | 42% | Jul 1 |
| FR-006 | New device + large | New device + TXN >KES 50K | Medium | ✅ Active | 55% | Aug 1 |
| FR-007 | Dormant wake-up | Inactive 90d+ + TXN >KES 100K | Medium | ✅ Active | 30% | Jul 15 |
| FR-008 | Credential stuffing | >5 failed logins then success | Critical | ✅ Active | 8% | Aug 10 |

### Section 15.8: Fraud Team Performance
| Investigator | Cases Assigned | Resolved | Avg Time | Accuracy | Escalations |
|-------------|---------------|----------|----------|----------|-------------|
| Sarah K. | 45 | 38 | 3.1 hours | 96% | 2 |
| James O. | 38 | 32 | 4.5 hours | 94% | 1 |
| David K. | 42 | 35 | 3.8 hours | 95% | 3 |
| Grace M. | 28 | 24 | 5.2 hours | 92% | 1 |

### Section 15.9: Fraud Reporting & SAR Filing
| SAR ID | Filed Date | User | Amount | Type | Status | Authority Receipt |
|--------|-----------|------|--------|------|--------|-----------------|

| SAR-2026-034 | Aug 15 | PAY-55667 | KES 1.2M | Structuring | ✅ Acknowledged | FRA-REF-8823 |
| SAR-2026-033 | Aug 8 | PAY-88900 | KES 450K | Suspected money laundering | ✅ Acknowledged | FRA-REF-8712 |
| SAR-2026-032 | Jul 28 | PAY-22334 | KES 890K | Account takeover + rapid movement | ✅ Under review | FRA-REF-8645 |
| SAR-2026-031 | Jul 15 | PAY-44556 | KES 2.1M | Mule network | ✅ Acknowledged | FRA-REF-8501 |

### Section 15.10: Fraud Heatmap (Visual)
- **Time-of-day heatmap**: Fraud attempts by hour of day (0–23) vs day of week
- **Channel heatmap**: Fraud distribution by channel
- **County heatmap**: Geographic distribution of fraud attempts
- **Amount heatmap**: Fraud by amount bracket
- **Device heatmap**: Fraud by device type (iOS, Android, Web, API)

---

# PAGE 16: TRANSACTION MONITORING (SAR)

**Purpose:** Suspicious Activity Report management — flagging, investigating, and reporting suspicious transactions.

### Section 16.1: SAR Pipeline
| Stage | Count (30d) | Avg Time | SLA | Breached |
|-------|-------------|----------|-----|----------|
| Auto-flagged by rules | 47 | Real-time | — | — |
| Pending manual review | 23 | 2h avg | <4h | 3 |
| Under investigation | 12 | 4.2h avg | <8h | 1 |
| Awaiting compliance decision | 5 | 1.2h avg | <2h | 0 |
| Filed as SAR | 3 | — | — | — |
| Dismissed (false positive) | 18 | 1.8h avg | — | — |
| Escalated to law enforcement | 2 | — | — | — |

### Section 16.2: Monitoring Rules Engine
| Rule ID | Rule Name | Trigger Condition | Severity | False Positive Rate | Status | Last Triggered |
|---------|-----------|-------------------|----------|-------------------|--------|----------------|
| MON-001 | Structuring detection | 3+ TXNs in 24h each between KES 140K–149K (below KES 150K reporting threshold) | High | 28% | ✅ Active | Today |
| MON-002 | Rapid movement | Receive >KES 500K, send >90% out within 1 hour | High | 35% | ✅ Active | Yesterday |
| MON-003 | Unusual location | Transaction from country not in user's normal profile | Medium | 42% | ✅ Active | 2 days ago |
| MON-004 | High-risk jurisdiction | TXN to/from FATF grey/blacklist country | Critical | 15% | ✅ Active | 5 days ago |
| MON-005 | PEP activity | Transaction involving politically exposed person | High | 55% | ✅ Active | 1 week ago |
| MON-006 | Cash intensity | >80% of monthly volume is cash-in/cash-out (no utility/payment) | Medium | 30% | ✅ Active | Yesterday |
| MON-007 | Dormant activation | TXN >KES 200K after 90+ days inactive | Medium | 25% | ✅ Active | 3 days ago |
| MON-008 | Third-party funding | Account funded by 5+ different unrelated accounts in 24h | Low | 40% | ✅ Active | Today |
| MON-009 | Round amount pattern | Multiple round-number TXNs (KES 10K, 50K, 100K) in short period | Medium | 45% | ✅ Active | Yesterday |
| MON-010 | Velocity by channel | >10 TXNs on single channel in 1 hour, not normal for user | Medium | 32% | ✅ Active | Today |

### Section 16.3: Active SAR Cases
| Case ID | User | Amount | Rule Triggered | Assigned | Stage | Age | Priority |
|---------|------|--------|---------------|----------|-------|-----|----------|
| SAR-2026-035 | PAY-55667 | KES 1.2M | Structuring (MON-001) | David K. | Investigation | 6h | 🔴 High |
| SAR-2026-036 | PAY-99001 | KES 340K | Rapid movement (MON-002) | Grace M. | Review | 2h | 🟡 Medium |
| SAR-2026-037 | PAY-11234 | KES 89K | High-risk jurisdiction (MON-004) | Sarah K. | Compliance decision | 1h | 🔴 High |

### Section 16.4: SAR Filing Form
| Field | Details |
|-------|---------|
| SAR reference | Auto-generated (SAR-YYYY-NNN) |
| Filing date | Auto (current date) |
| Subject user | Account #, name, KYC details |
| Suspicious activity period | Date range |
| Activity description | Free text — detailed description of suspicious behavior |
| Transaction list | Linked transactions with amounts, dates, counterparties |
| Rule(s) triggered | Which monitoring rule(s) fired |
| Risk indicators | Checkboxes: structuring, layering, integration, etc. |
| Prior SARs | Any previous SARs for this user |
| User response | If user was contacted, their explanation |
| Investigator assessment | Opinion on whether activity is suspicious |
| Recommendation | File SAR / Dismiss / Escalate to law enforcement |
| Supporting documents | Upload evidence files |
| Approval | Compliance officer sign-off required |

### Section 16.5: SAR Statistics Dashboard
| Metric | This Month | Last Month | YTD | Trend |
|--------|-----------|------------|-----|-------|
| Total SARs filed | 3 | 4 | 34 | ↓ |
| Total amount reported | KES 2.54M | KES 3.1M | KES 28.4M | ↓ |
| Average SAR amount | KES 847K | KES 775K | KES 835K | ↑ |
| False positive SARs | 0 | 1 | 4 | ↓ |
| Time to file (avg) | 18 hours | 22 hours | 20 hours | ↓ |
| Regulatory feedback received | 1 | 0 | 5 | — |
| Law enforcement referrals | 1 | 0 | 8 | — |

### Section 16.6: Regulatory Feedback Tracker
| SAR ID | Filed Date | Authority | Feedback Date | Feedback | Action Taken |
|--------|-----------|-----------|---------------|----------|-------------|
| SAR-2026-030 | Jul 1 | FRA | Jul 28 | Request for additional info | Supplied documents |
| SAR-2026-025 | May 15 | FRA | Jun 20 | Acknowledged, no action | Case closed |
| SAR-2026-018 | Mar 1 | FRA | Apr 15 | Investigation ongoing | Monitoring |
| SAR-2026-012 | Jan 10 | FRA + DCI | Feb 28 | Account freezing order | Accounts frozen |

### Section 16.7: Rule Tuning & Calibration
| Rule | Current Threshold | Proposed Threshold | Expected Impact | FP Change |
|------|------------------|-------------------|-----------------|-----------|
| MON-001 Structuring | 3 TXNs, KES 140K–149K | 4 TXNs, KES 130K–149K | -30% alerts | -15% FP |
| MON-002 Rapid movement | 90% out in 1h | 85% out in 2h | +20% alerts | +10% FP |
| MON-006 Cash intensity | 80% cash | 75% cash | +15% alerts | +8% FP |
| MON-010 Velocity | 10 TXN/hour | 15 TXN/hour | -25% alerts | -12% FP |

### Section 16.8: SAR Workflow Configuration
| Setting | Current Value |
|---------|--------------|
| Auto-assign to investigator | Round-robin |
| Investigation SLA | 8 hours |
| Compliance decision SLA | 2 hours |
| Filing SLA | 24 hours from decision |
| Auto-notify on SLA breach | Yes (Slack + Email) |
| Require dual approval for filing | Yes (Compliance + Super admin) |
| Auto-archive dismissed SARs | After 90 days |
| Retention period for filed SARs | 7 years |

### Section 16.9: Training & Guidance
| Resource | Type | Last Updated | Audience |
|----------|------|-------------|----------|
| SAR Filing Guide | PDF | Aug 2026 | All investigators |
| Red Flags Handbook | Interactive | Jul 2026 | All staff |
| Rule Tuning Best Practices | Wiki | Aug 2026 | Compliance team |
| Regulatory Update — July 2026 | Memo | Jul 2026 | All staff |
| Case Study Library | Database | Ongoing | Investigators |

---

# PAGE 17: RISK SCORING ENGINE

**Purpose:** Configure and monitor the automated risk scoring system for users, transactions, and partners.

### Section 17.1: Risk Score Distribution
| Score Range | Users | % | Risk Level | Default Action | Override Available |
|------------|-------|---|------------|----------------|-------------------|
| 0–20 | 112,450 | 75.8% | 🟢 Low | Normal operations | — |
| 21–40 | 24,890 | 16.8% | 🟡 Medium | Enhanced monitoring | Admin |
| 41–60 | 8,234 | 5.5% | 🟠 High | Restricted operations | Admin + 2FA |
| 61–80 | 2,340 | 1.6% | 🔴 Very High | Manual review required | Super admin |
| 81–100 | 478 | 0.3% | ⛔ Critical | Auto-freeze + alert | Super admin + compliance |

### Section 17.2: Scoring Factors & Weights
| Factor | Weight | Sub-Factors | Data Source | Update Frequency |
|--------|--------|-------------|-------------|-----------------|
| Transaction velocity | 20% | TXN count/hour, TXN count/day, deviation from norm | Transaction DB | Real-time |
| Amount anomaly | 15% | Deviation from user's avg, deviation from peer group | Transaction DB | Real-time |
| Device trust | 15% | New device, device age, device change frequency | Session DB | Per login |
| Geographic risk | 15% | Location vs profile, country risk rating, impossible travel | GeoIP + profiles | Per TXN |
| Account age | 10% | Days since registration, KYC tier | User DB | Daily |
| KYC completeness | 10% | Tier level, document expiry, re-verification overdue | KYC DB | Daily |
| Historical flags | 10% | Past fraud alerts, past SARs, past freezes | Fraud DB | Per event |
| Network analysis | 5% | Connections to high-risk accounts, shared devices/IPs | Graph DB | Daily |

### Section 17.3: Risk Score Visualization
- **Distribution histogram**: Bar chart showing user count per 10-point bucket
- **Trend line**: 30-day trend of average risk score across all users
- **Segment breakdown**: Risk distribution by user segment (new, active, dormant, VIP)
- **Score movement**: Sankey diagram showing users moving between risk buckets over time

### Section 17.4: Risk-Based Actions Matrix
| Risk Score | Transaction Limits | Withdrawal Limits | Additional Verification | Monitoring Level | Support Priority |
|-----------|-------------------|-------------------|------------------------|-----------------|-----------------|
| 0–20 | Standard (100%) | Standard (100%) | None | Standard | Normal |
| 21–40 | Standard (100%) | Standard (100%) | None | Enhanced logging | Normal |
| 41–60 | 50% of standard | 50% of standard | OTP for >KES 50K | Enhanced + daily review | Priority |
| 61–80 | 25% of standard | 25% of standard | OTP for all + admin review >KES 10K | Continuous + real-time alerts | High |
| 81–100 | Frozen | Frozen | Manual approval for any | Continuous + dedicated analyst | Critical |

### Section 17.5: High-Risk User List
| User | Score | Previous Score | Change | Primary Risk Factors | Action Status |
|------|-------|---------------|--------|---------------------|---------------|
| PAY-55667 | 87 | 45 | +42 | Velocity spike + new device + geo-anomaly | 🔴 Frozen |
| PAY-89012 | 82 | 34 | +48 | Dual-device + amount anomaly | 🔴 Frozen |
| PAY-11223 | 78 | 22 | +56 | Account takeover attempt + credential stuffing | 🔴 Frozen |
| PAY-44556 | 72 | 68 | +4 | Structuring pattern + network risk | 🟠 Restricted |
| PAY-22334 | 65 | 30 | +35 | Geo-anomaly + velocity | 🟠 Restricted |
| PAY-77889 | 62 | 58 | +4 | Dormant wake-up + amount anomaly | 🟠 Restricted |

### Section 17.6: Score Factor Drill-Down (Per User)
| Factor | Score Contribution | Details |
|--------|-------------------|---------|
| Transaction velocity | 22/100 | 18 TXNs in 1 hour (normal: 3) |
| Amount anomaly | 18/100 | KES 120K TXN (avg: KES 4K) |
| Device trust | 15/100 | New device, first seen today |
| Geographic risk | 12/100 | Nairobi → Mombasa in 30 min |
| Account age | 2/100 | 456 days old |
| KYC completeness | 0/100 | Tier 3 complete |
| Historical flags | 8/100 | 1 previous fraud alert (cleared) |
| Network analysis | 10/100 | 2 linked high-risk accounts |
| **Total** | **87/100** | **⛔ Critical** |

### Section 17.7: Model Performance Metrics
| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Precision (confirmed fraud / flagged) | 66% | >75% | 🟡 |
| Recall (caught fraud / total fraud) | 94% | >95% | 🟢 |
| F1 Score | 77% | >85% | 🟡 |
| False positive rate | 34% | <20% | 🔴 |
| False negative rate | 6% | <5% | 🟡 |
| Model accuracy | 91% | >95% | 🟡 |
| AUC-ROC | 0.94 | >0.95 | 🟡 |

### Section 17.8: Model Retraining & Versioning
| Version | Deployed | Training Data | Precision | Recall | Changes |
|---------|----------|---------------|-----------|--------|---------|
| v3.2 | Aug 15, 2026 | 18 months | 66% | 94% | Added network analysis factor |
| v3.1 | Jul 1, 2026 | 15 months | 64% | 93% | Tuned velocity weights |
| v3.0 | Jun 1, 2026 | 12 months | 62% | 92% | New ML model (XGBoost) |
| v2.5 | Mar 2026 | 9 months | 58% | 90% | Added device trust factor |
| v2.0 | Jan 2026 | 6 months | 55% | 88% | Migrated from rules to ML |

### Section 17.9: Risk Score Override Log
| Date | Admin | User | Original Score | Override Score | Reason | Expires |
|------|-------|------|---------------|----------------|--------|---------|
| Aug 22 | Joseph M. | PAY-67890 | 72 | 30 | Investigation cleared — false positive | Never |
| Aug 20 | Sarah K. | PAY-11234 | 55 | 25 | User confirmed legitimate business activity | Dec 2026 |
| Aug 18 | James O. | PAY-55678 | 45 | 20 | VIP complaint — volume is legitimate | Sep 2026 |

### Section 17.10: Risk Engine Configuration
| Setting | Value |
|---------|-------|
| Scoring model | XGBoost v3.2 |
| Scoring frequency | Real-time (per transaction) + daily batch (all users) |
| Score decay | 5% per day of inactivity toward base score |
| Minimum data points before scoring | 5 transactions |
| New account default score | 35 (medium) |
| Score recalculation trigger | Transaction, login, device change, admin action |
| A/B testing | 10% of users on v3.3-beta |
| Model monitoring | Drift detection every 6 hours |

---

# PAGE 18: AML & SANCTIONS

**Purpose:** Anti-Money Laundering compliance — screening, monitoring, reporting.

### Section 18.1: AML Dashboard
| Metric | Value | Trend | Regulatory Requirement |
|--------|-------|-------|----------------------|
| Users screened (30d) | 148,392 | — | 100% on onboarding + ongoing |
| PEP matches | 23 | → | Screen all |
| Sanctions matches | 2 | → | Screen all |
| Adverse media matches | 12 | ↑ | Screen all |
| SARs filed (YTD) | 34 | → | File within 24h of decision |
| Regulatory inquiries (YTD) | 3 | → | Respond within deadline |
| CDD completed (Tier 2) | 34,120 | ↑ | All medium-risk users |
| EDD completed (Tier 3) | 2,340 | ↑ | All high-risk users |
| Ongoing monitoring alerts | 47 | ↓ | Review within SLA |
| Training completion (staff) | 94% | ↑ | 100% annual |

### Section 18.2: Sanctions Screening Lists
| List | Source | Entries | Last Updated | Update Frequency | Match Algorithm | Status |
|------|--------|---------|-------------|-----------------|-----------------|--------|
| OFAC SDN List | US Treasury | 12,847 | Aug 22 | Daily | Fuzzy match (85%+) | ✅ Active |
| EU Consolidated Sanctions | EU Council | 8,234 | Aug 22 | Daily | Fuzzy match (85%+) | ✅ Active |
| UN Security Council | UN | 2,567 | Aug 22 | Weekly | Exact + fuzzy | ✅ Active |
| Kenya PEP List | EACC | 1,234 | Aug 15 | Monthly | Exact match | ✅ Active |
| FATF High-Risk Jurisdictions | FATF | 23 countries | Aug 22 | As updated | Country code match | ✅ Active |
| CBK AML List | Central Bank of Kenya | 456 | Aug 15 | Monthly | Exact match | ✅ Active |
| Dow Jones PEP Database | Dow Jones | 2.4M | Aug 22 | Daily | Fuzzy match (80%+) | ✅ Active |
| Internal Watchlist | PayMo | 89 | Aug 22 | Real-time | Exact match | ✅ Active |

### Section 18.3: Screening Results Queue
| User | Match Type | Matched Against | Match Score | Confidence | Status | Assigned | Action |
|------|-----------|----------------|-------------|------------|--------|----------|--------|
| PAY-55667 | Name match | OFAC SDN | 92% | High | 🔴 New | Unassigned | Review → |
| PAY-88900 | PEP match | Dow Jones | 88% | High | 🔴 New | Unassigned | Review → |
| PAY-22334 | Country match | FATF grey list | 100% | Certain | 🟡 Review | David K. | Review → |
| PAY-44556 | Adverse media | News API | 75% | Medium | 🟡 Review | Grace M. | Review → |
| PAY-11234 | Partial name | Internal watchlist | 82% | Medium | 🟡 Review | Sarah K. | Review → |

### Section 18.4: Screening Detail Modal
| Section | Content |
|---------|---------|
| User info | Name, DOB, nationality, account #, KYC details |
| Match details | List name, matched entry name, matched entry details, score |
| Side-by-side comparison | User name/DOB/address vs matched entry |
| Document evidence | Screenshot of list entry, news article (adverse media) |
| Previous screenings | All past screening results for this user |
| Risk assessment | Is this a true match, false positive, or needs escalation |
| Decision | True match (freeze + report) / False positive (document reason) / Escalate |
| Notes | Free text for decision rationale |

### Section 18.5: CDD (Customer Due Diligence) Requirements
| Risk Level | CDD Level | Requirements | Frequency | Responsible |
|-----------|-----------|-------------|-----------|-------------|
| Low | Simplified CDD | Phone + Name + DOB | Onboarding only | System auto |
| Medium | Standard CDD | ID + Address verification + basic screening | Onboarding + annual refresh | KYC team |
| High | Enhanced CDD (EDD) | ID + Address + Source of funds + Face + Biometric + PEP/sanctions check | Onboarding + 6-monthly refresh | Compliance officer |
| Critical | Enhanced + Ongoing | Full EDD + continuous monitoring + management approval + negative media | Continuous | Compliance officer + MLRO |

### Section 18.6: EDD Case Management
| Case | User | Risk Level | EDD Status | Source of Funds | PEP Status | Last Review | Next Review |
|------|------|-----------|------------|----------------|------------|-------------|-------------|
| EDD-001 | PAY-55667 | High | ⏳ In progress | Business income (awaiting docs) | Not PEP | — | — |
| EDD-002 | PAY-88900 | Critical | ✅ Complete | Employment + investments | PEP (close relative) | Aug 1 | Feb 2027 |
| EDD-003 | PAY-11234 | High | ✅ Complete | Salary + side business | Not PEP | Jul 15 | Jan 2027 |
| EDD-004 | PAY-77889 | High | ⚠️ Overdue | Incomplete — missing bank statements | Not PEP | Mar 2026 | Overdue |

### Section 18.7: AML Training Tracker
| Course | Required For | Completion Rate | Last Updated | Next Due |
|--------|-------------|----------------|-------------|----------|
| AML Fundamentals | All staff | 98% | Aug 2026 | Aug 2027 |
| SAR Filing Workshop | Investigators, Compliance | 100% | Jul 2026 | Jul 2027 |
| PEP & Sanctions Screening | KYC team, Compliance | 94% | Jun 2026 | Jun 2027 |
| CDD/EDD Procedures | KYC team, Compliance | 92% | May 2026 | May 2027 |
| Board AML Awareness | Board members | 100% | Apr 2026 | Apr 2027 |

### Section 18.8: AML Program Governance
| Document | Version | Last Approved | Approved By | Next Review |
|----------|---------|--------------|-------------|-------------|
| AML/CFT Policy | v4.2 | Jul 2026 | Board | Jan 2027 |
| Sanctions Screening Policy | v3.1 | Aug 2026 | MLRO | Feb 2027 |
| CDD/EDD Procedures | v2.8 | Jun 2026 | MLRO | Dec 2026 |
| SAR Procedures | v3.0 | May 2026 | MLRO | Nov 2026 |
| Record Retention Policy | v2.1 | Mar 2026 | Board | Sep 2026 |
| Risk Assessment | v3.5 | Jul 2026 | Board | Jan 2027 |

### Section 18.9: Regulatory Examination Readiness
| Area | Status | Last Exam | Findings | Remediation | Ready |
|------|--------|-----------|----------|-------------|-------|
| AML/CFT Program | 🟢 | Mar 2026 | 2 minor | Both closed | ✅ Yes |
| Sanctions Screening | 🟢 | Mar 2026 | 0 | — | ✅ Yes |
| Customer Due Diligence | 🟡 | Mar 2026 | 1 moderate | In progress (80%) | ⚠️ Near |
| Transaction Monitoring | 🟡 | Mar 2026 | 1 moderate | In progress (70%) | ⚠️ Near |
| Record Keeping | 🟢 | Mar 2026 | 0 | — | ✅ Yes |
| Staff Training | 🟢 | Mar 2026 | 1 minor | Closed | ✅ Yes |

---

# PAGE 19: INCIDENT RESPONSE

**Purpose:** Manage security incidents, system outages, and operational issues.

### Section 19.1: Active Incidents
| Incident ID | Severity | Title | Started | Duration | Impact | Status | Commander | Slack Channel |
|------------|----------|-------|---------|----------|--------|--------|-----------|---------------|
| INC-0047 | 🟡 Medium | M-Pesa callback delays | 14:00 | 32min | 12 TXNs pending | 🔧 Investigating | Ops Lead | #inc-0047 |
| INC-0046 | 🟢 Low | Slow card processing (Visa) | 13:45 | 47min | Elevated latency | 🔧 Investigating | James O. | #inc-0046 |

### Section 19.2: Incident Severity Matrix
| Severity | Definition | Response Time | Communication | Example |
|----------|-----------|---------------|---------------|---------|
| 🔴 P1 — Critical | Full service outage, data breach, fraud surge >KES 10M | <5 min | All-staff alert, exec notification, customer comms | Database down, security breach |
| 🟠 P2 — High | Partial outage, degraded service, fraud surge >KES 1M | <15 min | Team alert, management notification | Payment gateway slow, API errors |
| 🟡 P3 — Medium | Feature impaired, non-critical system down | <30 min | Team alert | Card processing slow, reporting delay |
| 🟢 P4 — Low | Minor issue, workaround available | <2 hours | Team alert | UI bug, non-critical feature down |

### Section 19.3: Incident Timeline (Active)
```
INC-0047: M-Pesa Callback Delays
├─ 14:00 — Alert triggered: Callback delay >30s detected
├─ 14:02 — Ops Lead paged, joined Slack #inc-0047
├─ 14:05 — Initial assessment: 12 TXNs pending, no user-facing impact yet
├─ 14:10 — Checked Safaricom status page: No reported outage
├─ 14:15 — Engaged Safaricom support via dedicated channel
├─ 14:20 — Safaricom confirms delay on their end, ETA 30 min
├─ 14:25 — Updated status page, notified support team
├─ 14:32 — [CURRENT] Monitoring for resolution
```

### Section 19.4: Incident History
| ID | Date | Severity | Title | Duration | Resolution | Users Affected | Financial Impact | Post-Mortem |
|----|------|----------|-------|----------|------------|----------------|-----------------|-------------|
| INC-0045 | Aug 20 | 🔴 P1 | Database failover | 12min | Automatic failover successful | 0 | KES 0 | ✅ Completed |
| INC-0044 | Aug 18 | 🟡 P3 | M-Pesa outage | 2h 15min | Safaricom resolved | 12,450 | KES 2.3M (delayed) | ✅ Completed |
| INC-0043 | Aug 15 | 🟢 P4 | Slow API response | 30min | Auto-scaling resolved | 0 | KES 0 | ✅ Completed |
| INC-0042 | Aug 12 | 🟠 P2 | Fraud surge — card testing | 45min | 12 cards blocked, pattern stopped | 0 | KES 0 | ✅ Completed |
| INC-0041 | Aug 8 | 🟡 P3 | KYC provider outage | 1h 30min | Failover to backup provider | 234 (delayed KYC) | KES 0 | ✅ Completed |

### Section 19.5: Post-Mortem Library
| Incident | Post-Mortem Date | Root Cause | Action Items | Status |
|----------|-----------------|-------------|-------------|--------|
| INC-0045 | Aug 21 | Primary DB memory leak | 3 actions: patch, monitoring, alerting | 🔄 2/3 done |
| INC-0044 | Aug 19 | Safaricom infrastructure issue | 1 action: add backup M-Pesa route | 📋 Pending |
| INC-0042 | Aug 13 | New card BIN not properly rate-limited | 2 actions: fix rate limit, add monitoring | ✅ Done |
| INC-0041 | Aug 9 | Onfido API degradation | 2 actions: failover config, SLA review | ✅ Done |

### Section 19.6: Runbook Library
| Incident Type | Runbook | Steps | Est. Time | Last Updated | Owner |
|--------------|---------|-------|-----------|-------------|-------|
| Payment gateway down | [View] | 8 steps | 15 min | Aug 1 | Ops Manager |
| Database failover | [View] | 5 steps (mostly auto) | 10 min | Jul 15 | DevOps Lead |
| Fraud surge | [View] | 12 steps | 30 min | Aug 10 | Compliance Lead |
| Data breach | [View] | 25 steps | 2 hours | Jun 1 | Security Lead |
| Partner settlement failure | [View] | 7 steps | 20 min | Jul 20 | Finance Manager |
| API outage | [View] | 6 steps | 10 min | Aug 5 | DevOps Lead |
| M-Pesa outage | [View] | 5 steps | 15 min | Aug 1 | Ops Manager |
| Card network issue | [View] | 6 steps | 15 min | Jul 25 | Ops Manager |
| DDoS attack | [View] | 10 steps | 20 min | May 1 | Security Lead |
| Ransomware | [View] | 30 steps | 4 hours | Mar 1 | Security Lead |

### Section 19.7: On-Call Schedule
| Role | Primary | Backup | Week Of | Phone |
|------|---------|--------|---------|-------|
| Incident Commander | Joseph M. | Sarah K. | Aug 19–25 | +254 7XX XXX 001 |
| DevOps | David K. | Grace M. | Aug 19–25 | +254 7XX XXX 002 |
| Security | James O. | Mary W. | Aug 19–25 | +254 7XX XXX 003 |
| Compliance | Sarah K. | David K. | Aug 19–25 | +254 7XX XXX 004 |

### Section 19.8: Status Page Management
| Component | Public Status | Internal Status | Last Updated |
|-----------|--------------|----------------|-------------|
| PayMo App | 🟢 Operational | 🟢 Operational | 14:30 |
| M-Pesa Payments | 🟡 Degraded Performance | 🟡 Degraded | 14:00 |
| Card Payments | 🟢 Operational | 🟢 Operational | 14:30 |
| Bank Transfers | 🟢 Operational | 🟢 Operational | 14:30 |
| API Services | 🟢 Operational | 🟢 Operational | 14:30 |
| Admin Dashboard | 🟢 Operational | 🟢 Operational | 14:30 |

### Section 19.9: Communication Templates
| Incident Type | Customer Message | Internal Message | Regulatory Message |
|---------------|-----------------|-----------------|-------------------|
| Planned maintenance | "We're upgrading..." | Full details + rollback plan | Not required |
| Partial outage | "Some services may be slow..." | Technical details + impact | Not required (if <1h) |
| Full outage | "We're experiencing issues..." | War room details + ETA | Report if >4h |
| Security incident | "We're investigating..." | Confidential details | Report to CBK within 24h |
| Data breach | Mandatory disclosure template | Full forensic details | Report to ODPC within 72h |

---

# ✅PAGE 20: SERVICE PORTFOLIO

**Purpose:** Overview of all services PayMo offers, their status, revenue, and configuration.

### Section 20.1: Service Catalog
| Service | Category | Status | Users | Revenue (30d) | Cost (30d) | Margin | Fee Structure |
|---------|----------|--------|-------|--------------|------------|--------|---------------|
| Mobile Money (M-Pesa) | Payments | ✅ Active | 134,200 | KES 82.3M | KES 12.4M | 84.9% | 1.5–2.0% |
| Card Payments (Visa/MC) | Cards | ✅ Active | 89,400 | KES 28.4M | KES 8.5M | 70.1% | 2.5% |
| Bank Transfers | Banking | ✅ Active | 112,300 | KES 18.7M | KES 3.7M | 80.2% | 1.0% flat |
| ATM Withdrawals | Banking | ✅ Active | 67,800 | KES 8.7M | KES 5.2M | 40.2% | KES 35 flat |
| Bill Payments (Utilities) | Utilities | ✅ Active | 78,900 | KES 12.8M | KES 1.3M | 89.8% | 1.0% |
| International Transfers | Remittance | ✅ Active | 12,400 | KES 4.5M | KES 0.9M | 80.0% | 3.5% |
| Virtual Cards | Cards | ✅ Active | 34,500 | KES 6.2M | KES 1.2M | 80.6% | 2.0% |
| Savings Pockets | Savings | ✅ Active | 45,600 | KES 2.1M (interest cost) | KES 0.5M (ops) | - | 0% (pays 8.5% APY) |
| Micro-Loans | Lending | ✅ Active | 23,400 | KES 18.2M | KES 2.7M (cost of funds) | 85.2% | 4–8% monthly |
| Business Accounts | Business | ✅ Active | 8,900 | KES 12.4M | KES 2.5M | 79.8% | Custom |
| Payroll Services | Business | ✅ Active | 2,340 | KES 3.4M | KES 0.7M | 79.4% | KES 50/employee |
| Insurance Premiums | Insurance | ✅ Active | 8,900 | KES 4.5M (commission) | KES 0.2M | 95.6% | Commission-based |

### Section 20.2: Service Health Dashboard
| Service | Uptime (30d) | Latency (p95) | Error Rate | SLA Target | SLA Status |
|---------|-------------|---------------|------------|------------|------------|
| M-Pesa Gateway | 99.98% | 3.2s | 0.08% | 99.95% | ✅ Met |
| Card Processing | 99.99% | 1.8s | 0.02% | 99.95% | ✅ Met |
| Bank Transfer | 99.95% | 45s | 0.15% | 99.90% | ✅ Met |
| ATM Network | 99.92% | 12s | 0.22% | 99.90% | ✅ Met |
| Bill Payment | 99.97% | 8.5s | 0.03% | 99.95% | ✅ Met |
| Internal Transfer | 99.99% | 0.3s | 0.01% | 99.99% | ✅ Met |
| International | 99.90% | 120s | 0.45% | 99.90% | ✅ Met |
| Savings | 99.99% | 0.5s | 0.01% | 99.99% | ✅ Met |
| Loans | 99.95% | 2.1s | 0.12% | 99.90% | ✅ Met |

### Section 20.3: Service Adoption Funnel
| Service | Total Users | Active (30d) | Adoption Rate | Growth (MoM) | Target Adoption |
|---------|-----------|-------------|---------------|---------------|-----------------|
| M-Pesa | 134,200 | 112,300 | 83.7% | ↑ 5.2% | 90% |
| Cards | 89,400 | 56,700 | 63.4% | ↑ 12.1% | 70% |
| Bank Transfer | 112,300 | 78,900 | 70.3% | ↑ 3.4% | 75% |
| ATM | 67,800 | 34,500 | 50.9% | ↑ 2.1% | 55% |
| Bill Payment | 78,900 | 45,600 | 57.8% | ↑ 8.3% | 65% |
| International | 12,400 | 5,670 | 45.7% | ↑ 18.2% | 50% |
| Virtual Cards | 34,500 | 23,400 | 67.8% | ↑ 22.4% | 75% |
| Savings | 45,600 | 34,200 | 75.0% | ↑ 15.3% | 80% |
| Loans | 23,400 | 18,200 | 77.8% | ↑ 9.8% | 80% |

### Section 20.4: Service Revenue Trends (6 Months)
| Service | Mar | Apr | May | Jun | Jul | Aug | Trend |
|---------|-----|-----|-----|-----|-----|-----|-------|
| M-Pesa | KES 68M | KES 71M | KES 74M | KES 76M | KES 79M | KES 82.3M | 📈 |
| Cards | KES 22M | KES 23M | KES 24M | KES 25M | KES 27M | KES 28.4M | 📈 |
| Bank | KES 15M | KES 16M | KES 16.5M | KES 17M | KES 18M | KES 18.7M | 📈 |
| Loans | KES 12M | KES 13M | KES 14.5M | KES 15.5M | KES 17M | KES 18.2M | 📈 |
| Bills | KES 10M | KES 10.5M | KES 11M | KES 11.5M | KES 12M | KES 12.8M | 📈 |

### Section 20.5: Service Dependency Map
- Visual diagram showing:
  - M-Pesa → Safaricom API → Callback handler → Settlement
  - Cards → Visa/MC processor → Authorization → Settlement
  - Bank → KCB/Equity/NBK APIs → Transfer → Reconciliation
  - Internal → Database → Ledger → No external dependency
  - Loans → Internal balance → Disbursement → Repayment → Savings
  - Savings → Interest calculator → Balance update → Tax withholding

### Section 20.6: Service Configuration Quick-Access
| Service | Key Config | Current Value | Edit Link |
|---------|-----------|---------------|-----------|
| M-Pesa | Max cash-in per TXN | KES 150,000 | Configure → |
| M-Pesa | Business till number | 123456 | View only |
| Cards | Default monthly limit | KES 500,000 | Configure → |
| Cards | International allowed | Yes | Configure → |
| Bank | Default transfer limit | KES 1,000,000 | Configure → |
| Loans | Max loan amount | KES 500,000 | Configure → |
| Loans | Interest rate range | 4–8% monthly | Configure → |
| Savings | Interest rate | 8.5% APY | Configure → |
| Bills | Supported billers | 234 | Manage → |
| International | Supported countries | 45 | Manage → |

### Section 20.7: Service Retirement Planning
| Service | Status | Reason | Migration Path | Deadline | Users Affected |
|---------|--------|--------|---------------|----------|----------------|
| USSD Channel | 🟡 Phase-out | Low usage (2%) | Migrate to app | Dec 2026 | 2,968 |
| Physical Check Deposit | 🟡 Phase-out | Partner EOL | Migrate to bank transfer | Nov 2026 | 456 |

### Section 20.8: New Service Pipeline
| Service | Stage | Target Launch | Owner | Progress | Dependencies |
|---------|-------|--------------|-------|----------|-------------|
| Buy Now Pay Later | 🟡 Development | Q4 2026 | Product | 60% | Loan engine + merchant API |
| Crypto Wallet | 📋 Planning | Q1 2027 | Product | 10% | Regulatory approval |
| Stock Investment | 📋 Planning | Q2 2027 | Product | 5% | CMA license + partner |
| Insurance Claims | 🟡 Development | Q4 2026 | Partnerships | 45% | Insurance partner API |
| Business Invoice Financing | 📋 Planning | Q1 2027 | Lending | 15% | Credit scoring model |

---

# ✅PAGE 21: PRODUCT CONFIGURATION

**Purpose:** Configure individual product settings, limits, and behavior.

### Section 21.1: M-Pesa Configuration
| Setting | Current Value | Min | Max | Editable | Last Changed |
|---------|--------------|-----|-----|----------|-------------|
| Max cash-in per transaction | KES 150,000 | KES 1,000 | KES 300,000 | ✅ | Jan 2025 |
| Daily cash-in limit (per user) | KES 300,000 | KES 10,000 | KES 1,000,000 | ✅ | Jan 2025 |
| Max cashout per transaction | KES 70,000 | KES 1,000 | KES 150,000 | ✅ | Jan 2025 |
| Business till number | 123456 | — | — | ❌ | — |
| Paybill number | 456789 | — | — | ❌ | — |
| Callback timeout | 30 seconds | 10s | 120s | ✅ | Aug 2026 |
| Max retry on failure | 3 | 0 | 5 | ✅ | Jan 2025 |
| STK push timeout | 60 seconds | 30s | 120s | ✅ | Jan 2025 |
| Allow reverse on timeout | Yes | — | — | ✅ | Jan 2025 |

### Section 21.2: Card Configuration
| Setting | Current Value | Editable | Notes |
|---------|--------------|----------|-------|
| Visa BIN range | 412345–412399 | ❌ | Assigned by Visa |
| Mastercard BIN range | 530012–530050 | ❌ | Assigned by Mastercard |
| Default card limit (monthly) | KES 500,000 | ✅ | Per card |
| Max card limit (monthly) | KES 5,000,000 | ✅ | VIP only |
| Physical card issuance fee | KES 500 | ✅ | |
| Virtual card issuance fee | KES 0 | ✅ | |
| Allow international transactions | Yes | ✅ | Can restrict per user |
| International daily limit | KES 1,000,000 | ✅ | |
| Contactless payment limit | KES 5,000 | ✅ | NFC tap-to-pay |
| Online transaction limit | KES 200,000/day | ✅ | |
| 3D Secure required | > KES 5,000 | ✅ | Threshold configurable |
| Card auto-lock on fraud | Yes | ✅ | Immediate |
| Card replacement fee | KES 300 | ✅ | |

### Section 21.3: Loan Product Configuration
| Setting | Current Value | Editable |
|---------|--------------|----------|
| Minimum loan amount | KES 1,000 | ✅ |
| Maximum loan amount | KES 500,000 | ✅ |
| Interest rate range | 4–8% monthly | ✅ |
| Loan term options | 7, 14, 30, 60, 90 days | ✅ |
| Default penalty rate | 2% monthly on overdue | ✅ |
| Grace period | 3 days | ✅ |
| Auto-deduction from balance | Yes | ✅ |
| Credit score minimum | 300 | ✅ |
| Minimum account age for eligibility | 90 days | ✅ |
| Minimum transaction history | 10 transactions | ✅ |
| Max active loans per user | 1 | ✅ |
| Loan disbursement method | PayMo wallet only | ✅ |
| Prepayment penalty | None | ✅ |
| Loan top-up allowed | No | ✅ |

### Section 21.4: Savings Product Configuration
| Setting | Current Value | Editable |
|---------|--------------|----------|
| Interest rate (APY) | 8.5% | ✅ |
| Interest calculation | Daily balance, monthly credit | ✅ |
| Minimum balance to earn interest | KES 100 | ✅ |
| Maximum balance for interest | KES 1,000,000 | ✅ |
| Minimum deposit | KES 50 | ✅ |
| Maximum deposits per month | Unlimited | ✅ |
| Withdrawal restrictions | None | ✅ |
| Tax on interest | 15% WHT | ❌ (regulatory) |
| Auto-save feature | Yes (round-up) | ✅ |
| Round-up amount | Nearest KES 100 | ✅ |
| Goal-based savings | Yes | ✅ |
| Number of savings pockets | Max 5 per user | ✅ |

### Section 21.5: Bank Transfer Configuration
| Setting | Current Value | Editable |
|---------|--------------|----------|
| Supported banks | KCB, Equity, NBK, Co-op, Absa, NCBA, Stanbic, SBM | ✅ |
| Transfer method | RTGS (same day), EFT (T+1) | ✅ |
| Min transfer amount | KES 100 | ✅ |
| Max transfer amount | KES 5,000,000 | ✅ |
| RTGS cutoff time | 14:00 EAT | ✅ |
| Fee (RTGS) | KES 500 flat | ✅ |
| Fee (EFT) | KES 100 flat | ✅ |
| Auto-retry on failure | Yes (1 retry) | ✅ |
| Name verification | Yes (before confirmation) | ✅ |

### Section 21.6: FX Configuration
| Setting | Current Value | Editable |
|---------|--------------|----------|
| Supported currencies | USD, EUR, GBP, TZS, UGX | ✅ |
| FX rate source | Central Bank rate + margin | ✅ |
| FX margin | 1.5% | ✅ |
| FX fee | 3.0% of transaction | ✅ |
| Rate refresh interval | 60 seconds | ✅ |
| Max FX transaction | KES 5,000,000 equivalent | ✅ |
| Hold period for FX | 30 seconds | ✅ |

### Section 21.7: Bill Payment Configuration
| Setting | Current Value |
|---------|--------------|
| Total supported billers | 234 |
| Categories | Electricity (KPLC, Kenya Power), Water, TV, Internet, Insurance, Government |
| Payment confirmation | Instant for most, 24h for some |
| Fee | 1.0% (min KES 10) |
| Failed payment refund | Auto-refund within 24h |
| Bill reminders | Push + SMS (user opt-in) |
| Auto-pay available | Yes (user setup) |

### Section 21.8: Configuration Change Audit Trail
| Date | Admin | Product | Setting | Old Value | New Value | Reason |
|------|-------|---------|---------|-----------|-----------|--------|
| Aug 22 | Finance Mgr | Loans | Max loan amount | KES 300K | KES 500K | Board approved expansion |
| Aug 20 | Joseph M. | Cards | Contactless limit | KES 3K | KES 5K | Visa mandate update |
| Aug 15 | Ops Manager | M-Pesa | Callback timeout | 60s | 30s | Reduce pending TXN time |
| Aug 10 | Finance Mgr | Savings | Interest rate | 8.0% | 8.5% | Competitive adjustment |

---

# ✅PAGE 22: RECURRING SERVICES

**Purpose:** Manage subscription billing, auto-pay, and recurring transactions.

### Section 22.1: Recurring Service Overview
| Service | Subscribers | Monthly Revenue | Churn Rate | Avg Tenure | Status |
|---------|------------|----------------|------------|------------|--------|
| PayMo Premium (VIP auto-upgrade) | 12,400 | KES 12.4M | 3.2% | 8.4 months | ✅ Active |
| Business Suite | 3,200 | KES 9.6M | 2.1% | 14.2 months | ✅ Active |
| Insurance Premiums | 8,900 | KES 4.5M | 5.4% | 6.8 months | ✅ Active |
| Savings Auto-Debit | 23,400 | KES 11.7M (deposits) | 8.2% | 5.1 months | ✅ Active |
| Loan Repayment | 18,200 | KES 18.2M | N/A | N/A | ✅ Active |
| Utility Auto-Pay | 34,500 | KES 8.7M | 12.3% | 4.2 months | ✅ Active |
| PayMo Premium Plus | 2,100 | KES 4.2M | 1.8% | 11.3 months | ✅ Active |
| API Access Tier | 450 | KES 2.25M | 0.8% | 18.6 months | ✅ Active |

### Section 22.2: Subscription Plan Details
| Plan | Price | Billing | Features | Subscribers | MRR |
|------|-------|---------|----------|-------------|-----|
| PayMo Premium | KES 999/month | Monthly | Fee discounts, priority support, analytics | 12,400 | KES 12.4M |
| PayMo Premium Plus | KES 1,999/month | Monthly | All Premium + no fees + VIP manager | 2,100 | KES 4.2M |
| Business Suite | KES 2,999/month | Monthly | Multi-user, payroll, bulk ops, API | 3,200 | KES 9.6M |
| API Access — Basic | KES 5,000/month | Monthly | 10K API calls/month | 350 | KES 1.75M |
| API Access — Pro | KES 15,000/month | Monthly | 100K API calls/month | 100 | KES 1.5M |

### Section 22.3: Failed Recurring Payments Queue
| User | Service | Amount | Reason | Retries | Max Retries | Next Retry | Status |
|------|---------|--------|--------|---------|-------------|------------|--------|
| PAY-12345 | Premium | KES 999 | Insufficient funds | 2 | 3 | Aug 25 | ⏳ Retry pending |
| PAY-67890 | Insurance | KES 1,500 | Card expired | 3 | 3 | — | 🔴 Cancelled |
| PAY-89012 | Business Suite | KES 2,999 | Account frozen | 0 | 3 | On unfreeze | ⏸ Paused |
| PAY-11223 | Premium Plus | KES 1,999 | Insufficient funds | 1 | 3 | Aug 24 | ⏳ Retry pending |
| PAY-44556 | Utility Auto-Pay | KES 3,200 | Insufficient funds | 2 | 3 | Aug 25 | ⏳ Retry pending |

### Section 22.4: Recurring Payment Analytics
| Metric | Value | Trend |
|--------|-------|-------|
| Total recurring revenue | KES 71.55M/month | ↑ 8.4% |
| Recurring revenue as % of total | 38.5% | ↑ 2.1% |
| Subscription churn rate (overall) | 3.8% | ↓ 0.4% |
| Failed payment rate | 4.2% | ↓ 0.8% |
| Recovery rate (after retry) | 72% | ↑ 5% |
| Average retry success rate (1st) | 45% | — |
| Average retry success rate (2nd) | 20% | — |
| Average retry success rate (3rd) | 7% | — |
| Dunning recovery total (30d) | KES 2.3M | ↑ 12% |

### Section 22.5: Churn Analysis
| Cancellation Reason | Count (30d) | % of Churn | Action |
|--------------------|-------------|------------|--------|
| Price too high | 45 | 28% | Review pricing |
| Didn't use features | 38 | 24% | Improve onboarding |
| Switched to competitor | 23 | 14% | Competitive analysis |
| Insufficient funds | 22 | 14% | Offer lower tier |
| Account closed | 18 | 11% | Retention outreach |
| Other | 14 | 9% | — |

### Section 22.6: Dunning Campaign Management
| Campaign | Trigger | Channel | Message | Timing | Conversion |
|----------|---------|---------|---------|--------|------------|
| Payment failed — reminder 1 | 1st failure | Push + SMS | "Payment failed, please top up" | Immediately | 35% |
| Payment failed — reminder 2 | 2nd failure | Push + SMS + Email | "Final attempt tomorrow" | 24h before retry | 20% |
| Payment failed — final | 3rd failure | Email | "Subscription cancelled, resubscribe?" | After cancel | 8% |
| Win-back — 7 days | Post cancellation | Push + Email | "We miss you — 50% off first month" | 7 days after | 12% |
| Win-back — 30 days | Post cancellation | Email | "Special offer to come back" | 30 days after | 5% |

### Section 22.7: Subscription Lifecycle
```
[Trial (7 days)] → [Active] → [Payment Failed] → [Retry 1] → [Retry 2] → [Retry 3] → [Cancelled]
                       ↓              ↑                                              ↓
                   [Paused] ←─────────┘                                          [Win-back]
                       ↓                                                              ↓
                   [Resumed]                                                    [Reactivated]
```

### Section 22.8: Recurring Payment Configuration
| Setting | Current Value |
|---------|--------------|
| Retry interval | 48 hours |
| Max retries | 3 |
| Grace period after final failure | 3 days |
| Notify user on failure | Yes (Push + SMS) |
| Notify user before cancellation | Yes (Email, 24h before) |
| Auto-cancel after max retries | Yes |
| Allow reactivation within 30 days | Yes (with dunning offer) |
| Prorate mid-month subscription | Yes |
| Billing day | Same day as signup |
| If billing day is 29/30/31 | Last day of month |

---

# ✅PAGE 23: CARD PROGRAMS

**Purpose:** Manage all card products — physical, virtual, corporate, prepaid.

### Section 23.1: Card Program Overview
| Program | Cards Issued | Active | Blocked | Revenue (30d) | Fraud Rate | Cost per Card |
|---------|-------------|--------|---------|--------------|------------|---------------|
| PayMo Debit (Physical) | 67,800 | 54,200 | 234 | KES 18.4M | 0.012% | KES 450 |
| PayMo Virtual | 34,500 | 28,900 | 123 | KES 6.2M | 0.008% | KES 0 |
| PayMo Corporate | 2,340 | 1,890 | 12 | KES 4.5M | 0.005% | KES 600 |
| PayMo Prepaid (Gift) | 12,400 | 8,900 | 45 | KES 1.8M | 0.015% | KES 200 |
| PayMo Premium Metal | 450 | 420 | 0 | KES 0 (bundled) | 0% | KES 2,500 |
| **Total** | **117,490** | **94,310** | **414** | **KES 30.9M** | **0.010%** | — |

### Section 23.2: Card Issuance Queue
| Request ID | User | Type | Status | Requested | Processing Time | Actions |
|-----------|------|------|--------|-----------|-----------------|---------|
| CRD-8821 | PAY-12345 | Physical | 🏭 In production | Aug 20 | 2 days | Track → |
| CRD-8820 | PAY-67890 | Virtual | ✅ Issued | Aug 22 | Instant | View → |
| CRD-8819 | PAY-89012 | Corporate | 📋 Pending approval | Aug 21 | — | Approve → |
| CRD-8818 | PAY-11223 | Physical | 🚚 Shipped | Aug 19 | 3 days | Track → |

### Section 23.3: Card Limits & Controls
| Control | Physical | Virtual | Corporate | Prepaid | Premium Metal |
|---------|----------|---------|-----------|---------|-------------|
| Monthly spend limit | KES 500K | KES 200K | KES 5M | Loaded amount | Unlimited |
| Daily spend limit | KES 100K | KES 50K | KES 1M | Loaded amount | Unlimited |
| Per-transaction max | KES 50K | KES 30K | KES 500K | KES 50K | Unlimited |
| ATM daily | KES 40K | N/A | KES 200K | N/A | Unlimited |
| International | Yes | Yes | Yes | No | Yes |
| Online transactions | Yes | Yes | Yes | Yes | Yes |
| Contactless | Yes | No | Yes | No | Yes |
| Auto-lock on fraud | Yes | Yes | Yes | Yes | Yes |

### Section 23.4: Card Fraud Management
| Fraud Type | Cases (30d) | Amount | Detection Method | Recovery |
|-----------|-------------|--------|-----------------|----------|
| Card-not-present (CNP) fraud | 8 | KES 234K | Velocity + amount rules | KES 180K (77%) |
| Lost/stolen card | 5 | KES 89K | User report | KES 67K (75%) |
| Counterfeit card | 2 | KES 45K | EMV chip check | KES 45K (100%) |
| Card testing | 3 | KES 12K | Velocity rules | KES 12K (100%) |
| Account takeover | 1 | KES 120K | Behavioral analysis | KES 80K (67%) |
| **Total** | **19** | **KES 500K** | — | **KES 384K (77%)** |

### Section 23.5: Card Network Performance
| Network | Cards | TXN Volume (30d) | TXN Value (30d) | Success Rate | Avg Latency | Revenue Share |
|---------|-------|-----------------|-----------------|-------------|-------------|---------------|
| Visa | 78,200 | 456,000 | KES 22.3M | 99.8% | 1.8s | 70/30 |
| Mastercard | 39,290 | 234,000 | KES 8.6M | 99.7% | 1.9s | 70/30 |

### Section 23.6: Card PIN Management
| Metric | Value |
|--------|-------|
| Cards with PIN set | 94,310 (100% of active) |
| PIN change requests (30d) | 1,234 |
| PIN locked (wrong attempts) | 89 |
| PIN reset via admin (30d) | 23 |
| Average PIN change time | 2.3 seconds |

### Section 23.7: Card Replacement & Expiry
| Status | Count | Avg Processing | Fee |
|--------|-------|----------------|-----|
| Expired (this month) | 234 | Auto-renewal | KES 0 |
| Lost card replacement | 45 | 3 business days | KES 300 |
| Damaged replacement | 23 | 3 business days | KES 300 |
| Stolen replacement (expedited) | 12 | 1 business day | KES 0 |
| Upgraded card | 56 | 5 business days | KES 0 |

### Section 23.8: Card Program Financial Summary
| Revenue Stream | Amount (30d) | Details |
|---------------|-------------|---------|
| Interchange revenue | KES 18.5M | 1.2% avg interchange |
| Card fees (issuance) | KES 2.3M | Physical + corporate |
| FX fees on cards | KES 1.2M | International transactions |
| Late payment fees | KES 0 | Debit cards — N/A |
| Interest income | KES 0 | Debit cards — N/A |
| **Total card revenue** | **KES 22.0M** | |
| Card program costs | KES 8.2M | Issuance + network + ops |
| **Net card margin** | **KES 13.8M** | 62.7% margin |

### Section 23.9: Card Configuration
| Setting | Value | Editable |
|---------|-------|----------|
| Default PIN try limit | 3 | ✅ |
| PIN lock duration | 24 hours | ✅ |
| Auto-renew before expiry | 60 days | ✅ |
| Require activation for new cards | Yes | ✅ |
| Activation method | First TXN or app | ✅ |
| Allow temporary lock (user) | Yes | ✅ |
| Allow spending controls (user) | Yes (categories, limits) | ✅ |
| Real-time push on TXN | Yes | ✅ |
| Push threshold | > KES 1,000 | ✅ |

---

# ✅PAGE 24: UTILITY SERVICES

**Purpose:** Manage bill payment integrations, utility providers, and auto-pay setup.

### Section 24.1: Utility Provider Directory
| Provider | Category | Account Format | Confirmation | Fee | Status |
|----------|----------|---------------|-------------|-----|--------|
| KPLC (Prepaid) | Electricity | Meter # | Instant | 1.0% | ✅ Active |
| KPLC (Postpaid) | Electricity | Account # | 24–48h | 1.0% | ✅ Active |
| Nairobi Water | Water | Account # | 24h | 1.0% | ✅ Active |
| Safaricom (Airtime) | Telecom | Phone # | Instant | 0% | ✅ Active |
| Airtel (Airtime) | Telecom | Phone # | Instant | 0% | ✅ Active |
| DStv/Gotv | TV | Smartcard # | Instant | 1.0% | ✅ Active |
| Zuku/FAIBA | Internet | Account # | 2h | 1.0% | ✅ Active |
| Kenya Power Tokens | Electricity | Meter # | Instant | 1.0% | ✅ Active |
| NHIF | Insurance | ID # | 24h | 1.0% | ✅ Active |
| NSSF | Social Security | ID # | 24h | 1.0% | ✅ Active |
| KRA (Tax) | Government | PIN | Instant | 1.0% | ✅ Active |
| County Governments | Government | Account # | 24h | 1.0% | ✅ Active |
| **Total providers** | **234** | | | | |

### Section 24.2: Utility Payment Volume
| Provider | Payments (30d) | Volume (KES) | Avg Amount | Revenue (Commission) | Growth |
|----------|---------------|-------------|------------|---------------------|--------|
| KPLC Prepaid | 45,600 | KES 89.2M | KES 1,956 | KES 892K | ↑ 12% |
| Safaricom Airtime | 34,200 | KES 34.2M | KES 1,000 | KES 0 (no fee) | ↑ 5% |
| DStv/GoTV | 12,300 | KES 36.9M | KES 3,000 | KES 369K | ↑ 8% |
| Nairobi Water | 8,900 | KES 26.7M | KES 3,000 | KES 267K | ↑ 3% |
| NHIF | 6,700 | KES 33.5M | KES 5,000 | KES 335K | ↑ 15% |
| KRA Tax | 5,400 | KES 234.5M | KES 43,426 | KES 2.3M | ↑ 22% |
| Others | 21,800 | KES 67.8M | KES 3,110 | KES 678K | ↑ 7% |
| **Total** | **134,900** | **KES 522.8M** | **KES 3,875** | **KES 4.8M** | **↑ 11%** |

### Section 24.3: Auto-Pay Management
| Metric | Value |
|--------|-------|
| Total auto-pay setups | 34,500 |
| Active auto-pay (30d) | 28,900 (83.8%) |
| Auto-pay failures (30d) | 1,234 (4.3%) |
| Auto-pay revenue (30d) | KES 8.7M |
| Top auto-pay provider | KPLC Prepaid (12,400 setups) |
| Auto-pay cancellation rate | 2.1% monthly |

### Section 24.4: Failed Utility Payments
| Provider | Failures (30d) | Primary Reason | Auto-Refund Rate | Avg Resolution |
|----------|---------------|----------------|-----------------|----------------|
| KPLC Prepaid | 234 | Invalid meter # | 95% | 1 hour |
| KPLC Postpaid | 123 | Amount mismatch | 90% | 24 hours |
| DStv | 89 | Invalid smartcard | 92% | 2 hours |
| Nairobi Water | 67 | Account not found | 88% | 4 hours |
| KRA | 45 | PIN validation failure | 85% | 24 hours |

### Section 24.5: Provider Integration Health
| Provider | Uptime (30d) | Avg Latency | Error Rate | SLA | Status |
|----------|-------------|-------------|------------|-----|--------|
| KPLC | 99.95% | 3.2s | 0.15% | 99.90% | ✅ |
| Safaricom Airtime | 99.99% | 1.1s | 0.02% | 99.95% | ✅ |
| DStv | 99.90% | 5.4s | 0.25% | 99.90% | ✅ |
| Nairobi Water | 99.85% | 8.2s | 0.35% | 99.80% | 🟡 |
| KRA | 99.92% | 4.5s | 0.18% | 99.90% | ✅ |

### Section 24.6: New Provider Onboarding Pipeline
| Provider | Category | Stage | Target Go-Live | Owner | Progress |
|----------|----------|-------|---------------|-------|----------|
| Kenya Airways | Travel | 🟡 Integration | Oct 2026 | Partnerships | 60% |
| HELB | Education | 📋 Contract | Nov 2026 | Partnerships | 20% |
| Teacher Service Commission | Government | 📋 Negotiation | Dec 2026 | Partnerships | 10% |
| NHIF (Upgrade) | Insurance | 🟡 Testing | Sep 2026 | Tech | 80% |

### Section 24.7: Utility Payment Analytics
- **Peak hours**: Bar chart showing payment volume by hour of day
- **Day of week**: Heatmap — busiest days for each provider
- **Seasonal trends**: 12-month line chart — KPLC spikes in cold months, DStv spikes during football season
- **Geographic distribution**: County-level map of utility payment volume
- **User segments**: Which user segments pay which utilities most

### Section 24.8: Utility Revenue Sharing
| Provider | PayMo Commission | Provider Share | Settlement | Status |
|----------|-----------------|---------------|------------|--------|
| KPLC | 1.0% | 99.0% | Daily | ✅ Active |
| DStv | 1.0% + KES 50 flat | 99.0% - KES 50 | Weekly | ✅ Active |
| Nairobi Water | 1.5% | 98.5% | Weekly | ✅ Active |
| KRA | 1.0% | 99.0% | Daily | ✅ Active |
| Airtime | 0% | 100% (telco absorbs) | Real-time | ✅ Active |

---

# ✅PAGE 25: PARTNER DIRECTORY

**Purpose:** Manage all platform partners — integrations, performance, financials, compliance.

### Section 25.1: Partner Overview
| Partner | Type | Status | TXN (30d) | Volume (30d) | Revenue Share | Since | Rating |
|---------|------|--------|-----------|-------------|---------------|-------|--------|
| Safaricom (M-Pesa) | Payment | ✅ Active | 456,000 | KES 82.3M | 40% | Jan 2024 | 4.5/5 |
| Visa Kenya | Card Network | ✅ Active | 234,000 | KES 22.3M | 30% | Jan 2024 | 4.7/5 |
| Mastercard | Card Network | ✅ Active | 123,000 | KES 8.6M | 30% | Jun 2024 | 4.5/5 |
| KCB Bank | Banking | ✅ Active | 34,500 | KES 18.7M | 20% | Jan 2024 | 4.2/5 |
| Equity Bank | Banking | ✅ Active | 23,400 | KES 12.3M | 20% | Mar 2024 | 4.3/5 |
| KPLC | Utility | ✅ Active | 45,600 | KES 89.2M | Commission | Jan 2024 | 3.8/5 |
| QuickLend | Lending | 🟡 Suspended | 1,234 | KES 2.1M | Revenue share | Jun 2025 | 2.1/5 |
| Onfido | KYC Provider | ✅ Active | 3,588 | KES 717K | SaaS fee | Jan 2024 | 4.0/5 |
| ComplyAdvantage | AML Provider | ✅ Active | 148,392 | KES 1.2M | SaaS fee | Jan 2024 | 4.4/5 |

### Section 25.2: Partner Financial Summary
| Partner | PayMo Owes | Partner Owes | Net Position | Last Settlement | Next Settlement |
|---------|-----------|-------------|-------------|-----------------|-----------------|
| Safaricom | KES 12.4M | KES 0 | -KES 12.4M | Aug 21 | Today 16:00 |
| Visa | KES 4.2M | KES 0 | -KES 4.2M | Aug 20 | Tomorrow |
| Mastercard | KES 2.8M | KES 0 | -KES 2.8M | Aug 20 | Tomorrow |
| KCB Bank | KES 0 | KES 8.7M | +KES 8.7M | Aug 21 | Today 16:00 |
| Equity Bank | KES 0 | KES 6.3M | +KES 6.3M | Aug 21 | Tomorrow |
| KPLC | KES 892K | KES 0 | -KES 892K | Aug 18 | Aug 25 |

### Section 25.3: Partner SLA Tracking
| Partner | SLA Metric | Target | Actual (30d) | Breaches | Penalty | Status |
|---------|-----------|--------|-------------|----------|---------|--------|
| Safaricom | Callback time | <30s | 3.2s avg | 12 | None (within tolerance) | ✅ |
| Safaricom | Uptime | 99.95% | 99.98% | 0 | — | ✅ |
| Visa | Authorization time | <3s | 1.8s | 0 | — | ✅ |
| Visa | Uptime | 99.99% | 99.99% | 0 | — | ✅ |
| KCB | Transfer time | <1h | 45min | 3 | Waived (first quarter) | 🟡 |
| Onfido | Verification time | <60s | 45s | 23 | KES 23K credit | 🟡 |
| ComplyAdvantage | Screening time | <5s | 2.1s | 0 | — | ✅ |

### Section 25.4: Partner API Health
| Partner | API Endpoint | Requests (24h) | Error Rate | p95 Latency | p99 Latency | Status |
|---------|-------------|----------------|------------|-------------|-------------|--------|
| Safaricom | STK Push | 234,000 | 0.08% | 3.2s | 8.5s | 🟢 |
| Safaricom | B2C | 12,000 | 0.12% | 5.1s | 12.3s | 🟢 |
| Visa | Authorization | 123,000 | 0.02% | 1.8s | 3.2s | 🟢 |
| KCB | Account lookup | 45,000 | 0.15% | 2.1s | 5.4s | 🟢 |
| Onfido | Document check | 3,588 | 0.25% | 45s | 90s | 🟢 |
| ComplyAdvantage | Screen | 148,392 | 0.01% | 2.1s | 4.5s | 🟢 |

### Section 25.5: Partner Communication Log
| Date | Partner | Direction | Subject | Summary | Next Action |
|------|---------|-----------|---------|---------|-------------|
| Aug 22 | Safaricom | Inbound | Callback delay notification | Scheduled maintenance affecting callbacks | Monitor |
| Aug 21 | QuickLend | Outbound | Settlement demand | Overdue KES 2.1M settlement | Escalate to legal |
| Aug 20 | Visa | Inbound | BIN expansion approval | New BIN range approved | Configure |
| Aug 18 | KCB | Outbound | SLA breach discussion | 3 transfer time breaches | Review SLA terms |

### Section 25.6: Partner Risk Assessment
| Partner | Risk Level | Factors | Last Assessment | Next Assessment |
|---------|-----------|---------|-----------------|-----------------|
| Safaricom | 🟢 Low | Market leader, strong financials, long partnership | Jul 2026 | Jan 2027 |
| Visa | 🟢 Low | Global brand, strong financials | Jul 2026 | Jan 2027 |
| KCB | 🟡 Medium | SLA breaches, moderate financials | Aug 2026 | Feb 2027 |
| QuickLend | 🔴 High | Settlement delays, regulatory concerns, complaints | Aug 2026 | Immediate review |
| Onfido | 🟢 Low | Established provider, good SLA | Jul 2026 | Jan 2027 |

### Section 25.7: Partner Contract Management
| Partner | Contract Start | Contract End | Auto-Renew | Notice Period | Value |
|---------|---------------|-------------|------------|---------------|-------|
| Safaricom | Jan 2024 | Jan 2027 | Yes | 90 days | Revenue share |
| Visa | Jan 2024 | Jan 2029 | Yes | 180 days | Fixed fees |
| KCB | Jan 2024 | Jan 2027 | Yes | 90 days | Revenue share |
| QuickLend | Jun 2025 | Jun 2026 | No | 60 days | Revenue share |
| Onfido | Jan 2024 | Jan 2027 | Yes | 90 days | SaaS (KES 200K/mo) |

### Section 25.8: Partner Performance Scorecards
| Partner | Integration | Reliability | Financial | Compliance | Communication | Overall |
|---------|-------------|-------------|-----------|------------|---------------|---------|
| Safaricom | 4.5/5 | 4.8/5 | 4.5/5 | 5.0/5 | 4.0/5 | 4.6/5 |
| Visa | 4.8/5 | 5.0/5 | 4.7/5 | 5.0/5 | 4.5/5 | 4.8/5 |
| KCB | 4.0/5 | 3.8/5 | 4.2/5 | 4.5/5 | 3.5/5 | 4.0/5 |
| QuickLend | 3.5/5 | 2.0/5 | 1.5/5 | 2.0/5 | 2.5/5 | 2.3/5 |

---

# ✅PAGE 26: PARTNER ONBOARDING

**Purpose:** End-to-end partner onboarding workflow — application, due diligence, integration, go-live.

### Section 26.1: Onboarding Pipeline
| Stage | Partners | Avg Time | Bottleneck |
|-------|----------|----------|------------|
| Application received | 12 | — | — |
| Initial screening | 8 | 2 days | Compliance check |
| Due diligence | 6 | 7 days | Document collection |
| Technical assessment | 5 | 5 days | API spec review |
| Integration | 4 | 14 days | Development |
| UAT testing | 3 | 7 days | Test case completion |
| Go-live approval | 2 | 3 days | Sign-off |
| Live | — | — | — |

### Section 26.2: Onboarding Application Queue
| Applicant | Type | Received | Stage | Assigned | Priority | Est. Go-Live |
|-----------|------|----------|-------|----------|----------|-------------|
| Kenya Airways | Travel | Aug 1 | Integration | Tech Team | 🟡 Medium | Oct 2026 |
| HELB | Education | Aug 10 | Due Diligence | Compliance | 🟢 Normal | Nov 2026 |
| TSC | Government | Aug 15 | Initial Screening | Compliance | 🟢 Normal | Dec 2026 |
| LipaLater | BNPL | Jul 20 | UAT Testing | Tech Team | 🔴 High | Sep 2026 |
| SolarNow | Energy | Aug 18 | Application | — | 🟢 Normal | Jan 2027 |

### Section 26.3: Partner Due Diligence Checklist
| Category | Requirement | Status (Kenya Airways) | Responsible |
|----------|-------------|----------------------|-------------|
| **Legal** | Certificate of incorporation | ✅ Verified | Compliance |
| | CR12 (business registration) | ✅ Verified | Compliance |
| | Tax compliance certificate | ✅ Verified | Compliance |
| | KRA PIN | ✅ Verified | Compliance |
| | Licenses (relevant sector) | ✅ Verified | Compliance |
| **Financial** | Audited financials (2 years) | ✅ Reviewed | Finance |
| | Bank references | ✅ Received | Finance |
| | Credit check | ✅ Clear | Finance |
| **Technical** | API documentation | ✅ Reviewed | Tech |
| | Security assessment | 🟡 In progress | Security |
| | UAT environment | 🟡 Setting up | Tech |
| **Compliance** | AML/CFT policy | ✅ Reviewed | Compliance |
| | Data protection policy | ✅ Reviewed | Legal |
| | Sanctions screening | ✅ Clear | Compliance |
| | PEP check (directors) | ✅ Clear | Compliance |
| **Commercial** | Pricing proposal | ✅ Agreed | Partnerships |
| | SLA terms | ✅ Agreed | Partnerships |
| | Contract draft | 🟡 Under review | Legal |

### Section 26.4: Integration Progress Tracker
| Partner | API Spec | Dev Environment | Sandbox Testing | UAT | Production | Go-Live |
|---------|----------|----------------|----------------|-----|------------|---------|
| Kenya Airways | ✅ | ✅ | 🟡 (60%) | — | — | — |
| LipaLater | ✅ | ✅ | ✅ | 🟡 (80%) | — | — |
| HELB | ✅ | 📋 | — | — | — | — |

### Section 26.5: Onboarding Configuration
| Setting | Value |
|---------|-------|
| Required documents checklist | 12 items (legal + financial + technical) |
| Minimum due diligence time | 5 business days |
| Technical assessment criteria | API quality, security, performance, documentation |
| UAT test cases required | Minimum 50 (including edge cases) |
| UAT pass rate required | 100% of critical, 95% of major, 90% of minor |
| Go-live approval required | Compliance + Tech + Partnerships + Super admin |
| Post go-live monitoring period | 30 days (enhanced) |
| Post go-live review meeting | Day 7, Day 30 |

### Section 26.6: Partner Rejection Log
| Applicant | Date | Reason | Stage | Communication |
|-----------|------|--------|-------|---------------|
| FastCash Ltd | Aug 5 | Failed AML screening (director on sanctions list) | Due Diligence | Rejection letter sent |
| EasyPay | Jul 28 | Insufficient financial documentation | Due Diligence | Requested additional docs — no response |
| QuickMoney | Jul 15 | Technical assessment failed (insecure API) | Technical | Feedback provided |

### Section 26.7: Partner Sandbox Management
| Partner | Sandbox URL | API Keys | Test Data | Access Expiry |
|---------|-------------|----------|-----------|---------------|
| Kenya Airways | sandbox.paymo.co.ke/ka | 2 keys issued | 500 test TXNs loaded | Oct 31, 2026 |
| LipaLater | sandbox.paymo.co.ke/ll | 2 keys issued | 300 test TXNs loaded | Sep 30, 2026 |
| HELB | — | — | — | — |

### Section 26.8: Onboarding SLA
| Stage | SLA | Current Avg | Status |
|-------|-----|-------------|--------|
| Application to screening | <1 business day | 0.5 days | ✅ |
| Screening to DD complete | <5 business days | 7 days | 🔴 |
| DD to technical assessment | <3 business days | 2 days | ✅ |
| Technical to UAT | <10 business days | 14 days | 🔴 |
| UAT to go-live | <5 business days | 3 days | ✅ |
| **Total onboarding** | **<30 business days** | **38 days** | 🔴 |

---

# ✅PAGE 27: INVESTOR DASHBOARD

**Purpose:** Investor relations — metrics, financials, cap table, and reporting.

### Section 27.1: Investor Overview
| Investor | Type | Shares | % Ownership | Invested | Current Valuation | MOIC | Status |
|----------|------|--------|-------------|----------|-------------------|------|--------|
| Joseph Mwangi (Founder) | Common | 5,000,000 | 50% | KES 50M | KES 2.47B | 49.4x | 🟢 Active |
| VC Fund A | Preferred Series A | 2,000,000 | 20% | KES 200M | KES 988M | 4.9x | 🟢 Active |
| Angel Investor B | Common | 1,000,000 | 10% | KES 30M | KES 247M | 8.2x | 🟢 Active |
| VC Fund C | Preferred Series B | 1,500,000 | 15% | KES 450M | KES 1.47B | 3.3x | 🟢 Active |
| ESOP Pool | Options | 500,000 | 5% | — | KES 123.5M | — | 🟡 23% vested |
| **Total** | | **10,000,000** | **100%** | **KES 730M** | **KES 2.47B** | **3.4x avg** | |

### Section 27.2: Key Investor Metrics
| Metric | Current | Previous Quarter | YoY Change |
|--------|---------|-----------------|------------|
| Valuation | KES 2.47B | KES 2.1B | ↑ 78% |
| Revenue (quarterly) | KES 558M | KES 445M | ↑ 124% |
| Gross margin | 82% | 79% | ↑ 3pp |
| Net profit margin | 18.4% | 14.2% | ↑ 4.2pp |
| Users | 148,392 | 112,000 | ↑ 89% |
| Revenue per user (quarterly) | KES 3,762 | KES 3,973 | ↓ 5.3% |
| Burn rate | KES 62M/month | KES 71M/month | ↓ 12.7% |
| Runway | 18 months | 14 months | ↑ 4 months |
| LTV:CAC | 24.7x | 20.1x | ↑ 22.9% |

### Section 27.3: Financial Summary (Investor View)
| Statement | Q2 2026 | Q1 2026 | Q4 2025 | Q3 2025 |
|-----------|---------|---------|---------|---------|
| Revenue | KES 558M | KES 445M | KES 356M | KES 278M |
| Cost of revenue | KES 100M | KES 93M | KES 85M | KES 78M |
| Gross profit | KES 458M | KES 352M | KES 271M | KES 200M |
| Operating expenses | KES 355M | KES 288M | KES 234M | KES 189M |
| EBITDA | KES 103M | KES 64M | KES 37M | KES 11M |
| Net income | KES 103M | KES 63M | KES 36M | KES 10M |
| EBITDA margin | 18.4% | 14.4% | 10.4% | 4.0% |

### Section 27.4: Cap Table Management
| Action | Date | Shares | Price per Share | Total | Investor |
|--------|------|--------|----------------|-------|----------|
| Series B | Jun 2026 | 1,500,000 | KES 300 | KES 450M | VC Fund C |
| ESOP grant | Jun 2026 | 50,000 | KES 0 | KES 0 | Employee |
| Series A | Jan 2025 | 2,000,000 | KES 100 | KES 200M | VC Fund A |
| Angel round | Mar 2024 | 1,000,000 | KES 30 | KES 30M | Angel B |
| Founding | Jan 2024 | 5,000,000 | KES 10 | KES 50M | Founder |
| ESOP pool creation | Jan 2024 | 500,000 | KES 0 | KES 0 | Company |

### Section 27.5: Investor Communication Log
| Date | Type | Audience | Subject | Materials | Status |
|------|------|----------|---------|-----------|--------|
| Aug 15 | Monthly Update | All investors | July metrics + highlights | Dashboard link + PDF | ✅ Sent |
| Aug 1 | Board Meeting | Board members | Q2 results presentation | Deck + financials | ✅ Completed |
| Jul 15 | Monthly Update | All investors | June metrics + highlights | Dashboard link + PDF | ✅ Sent |
| Jun 30 | Fundraise Update | Series B investors | Post-close update | Cap table + terms | ✅ Sent |

### Section 27.6: Dividend & Distribution Tracking
| Date | Type | Amount | Per Share | Eligible | Status |
|------|------|--------|-----------|----------|--------|
| — | Dividend | Not declared | — | — | Board decision pending |

### Section 27.7: Investor Document Repository
| Document | Date | Type | Access | Version |
|----------|------|------|--------|---------|
| Q2 2026 Board Deck | Aug 1, 2026 | Board | Board only | v3 (final) |
| Q2 2026 Financial Statements | Aug 1, 2026 | Financial | Investors | v2 (audited pending) |
| Series B Term Sheet | May 2026 | Legal | Series B investors | v1 (executed) |
| Shareholders' Agreement | Jun 2026 | Legal | All shareholders | v4 (amended) |
| Annual Report 2025 | Mar 2026 | Annual | All investors | v1 (final) |
| Certificate of Incorporation | Jan 2024 | Legal | All investors | v1 |

### Section 27.8: Upcoming Investor Obligations
| Obligation | Due Date | Status | Owner | Deliverable |
|-----------|----------|--------|-------|-------------|
| Q3 Board Meeting | Sep 30 | 📋 Scheduled | CEO | Board deck + financials |
| Monthly investor update | Sep 15 | ⏳ Pending | CEO | Dashboard + email |
| Annual audit (2026) | Mar 2027 | 📋 Future | CFO | Audited financials |
| KRA annual returns | Jun 2027 | 📋 Future | CFO | Tax returns |

---

# ✅PAGE 28: INVESTOR REPORTS

**Purpose:** Generate, schedule, and distribute investor reports.

### Section 28.1: Report Templates
| Report | Frequency | Template | Auto-Generated | Distribution |
|--------|-----------|----------|---------------|-------------|
| Monthly metrics update | Monthly | Dashboard + email | ✅ Yes | All investors |
| Quarterly board deck | Quarterly | PowerPoint | ❌ Manual | Board members |
| Quarterly financials | Quarterly | Excel + PDF | ✅ Semi-auto | All investors |
| Annual report | Annual | PDF (designed) | ❌ Manual | All investors |
| Ad-hoc update | As needed | Email | ❌ Manual | Selected investors |
| Cap table statement | Quarterly | Excel | ✅ Yes | All shareholders |
| KPI scorecard | Monthly | Dashboard | ✅ Yes | All investors |

### Section 28.2: Scheduled Reports
| Report | Schedule | Next Generation | Distribution Method | Recipients |
|--------|----------|----------------|-------------------|-----------|
| Monthly Update | 15th of each month | Sep 15, 2026 | Email + Dashboard link | 4 investors |
| Quarterly Financials | 30 days after quarter end | Oct 30, 2026 | Email + Secure portal | 4 investors |
| Board Deck | 30 days after quarter end | Oct 30, 2026 | Board portal | 5 board members |
| Cap Table | Quarterly | Oct 1, 2026 | Secure portal | All shareholders |

### Section 28.3: Report Generation Workspace
| Step | Description | Status |
|------|-------------|--------|
| 1. Select template | Choose from available report templates | — |
| 2. Set period | Select date range for report data | — |
| 3. Configure sections | Toggle sections, reorder, add custom text | — |
| 4. Preview | View generated report with live data | — |
| 5. Annotate | Add commentary, highlights, forward-looking statements | — |
| 6. Approve | Super admin or CFO approval for distribution | — |
| 7. Distribute | Send via email, portal, or download link | — |
| 8. Track | See who opened, when, how many times | — |

### Section 28.4: Custom Report Builder
| Feature | Details |
|---------|---------|
| Data sources | Transactions, Users, Finance, Fraud, Partners, System |
| Chart types | Line, bar, pie, donut, area, scatter, heatmap |
| Table types | Summary, detail, pivot, comparison |
| Filters | Date, segment, channel, partner, user type |
| Calculations | Sum, avg, growth rate, YoY, MoM, cumulative |
| Export formats | PDF, Excel, PowerPoint, CSV |
| Branding | Custom logo, colors, fonts |
| Scheduling | Save as recurring report |
| Sharing | Generate secure link with expiry |

### Section 28.5: Report Distribution Tracking
| Report | Sent Date | Recipients | Opened | Downloaded | Avg Time to Open |
|--------|----------|-----------|--------|------------|-----------------|
| Aug Monthly Update | Aug 15 | 4 | 4 (100%) | 3 (75%) | 2.3 hours |
| Q2 Board Deck | Aug 1 | 5 | 5 (100%) | 5 (100%) | 1.1 hours |
| Q2 Financials | Aug 1 | 4 | 4 (100%) | 4 (100%) | 3.4 hours |
| Jul Monthly Update | Jul 15 | 4 | 3 (75%) | 2 (50%) | 4.1 hours |

### Section 28.6: Data Room Management
| Folder | Documents | Access | Last Updated |
|--------|-----------|--------|-------------|
| Financial Statements | 12 | All investors | Aug 1, 2026 |
| Board Materials | 8 | Board only | Aug 1, 2026 |
| Legal Documents | 15 | Legal + Board | Jun 2026 |
| Cap Table | 4 | All shareholders | Jun 2026 |
| Regulatory Filings | 23 | All investors | Aug 2026 |
| Product Roadmap | 3 | Board only | Aug 2026 |
| Market Research | 6 | Board only | Jul 2026 |

### Section 28.7: Investor FAQ Management
| Question | Answer | Last Updated | Visible To |
|----------|--------|-------------|-----------|
| What is the current valuation? | KES 2.47B (post Series B) | Jun 2026 | All investors |
| When is the next fundraise planned? | Series C planned for Q2 2027 | Aug 2026 | Board only |
| What is the path to profitability? | Profitable since Q3 2025 | Aug 2026 | All investors |
| What is the churn rate? | 3.8% monthly (subscriptions) | Aug 2026 | All investors |
| What are the main risks? | Regulatory, competition, fraud | Aug 2026 | Board only |

### Section 28.8: Benchmark Data
| Metric | PayMo | M-Pesa (Safaricom) | Tala | Branch | Industry Avg |
|--------|-------|-------------------|------|--------|-------------|
| Users (Kenya) | 148K | 51M | 4M | 2M | — |
| Revenue/User/Month | KES 1,253 | KES 340 | KES 450 | KES 380 | KES 400 |
| Transaction volume/user/Month | KES 125K | KES 12K | KES 8K | KES 15K | KES 20K |
| NPS | 72 | 45 | 52 | 48 | 45 |
| Fraud rate | 0.023% | 0.01% | 0.05% | 0.04% | 0.03% |

---

# ✅PAGE 29: ADMIN MANAGEMENT

**Purpose:** Manage all admin accounts — creation, permissions, sessions, activity.

### Section 29.1: Admin Directory
| Admin | Role | Email | Status | Last Login | Active Sessions | 2FA | Passkey |
|-------|------|-------|--------|------------|-----------------|-----|---------|
| Joseph Mwangi | Super Admin | joseph@paymo.co.ke | 🟢 Active | 2 min ago | 1 | ✅ | ✅ |
| Sarah Kiptoo | Platform Admin | sarah@paymo.co.ke | 🟢 Active | 15 min ago | 1 | ✅ | ✅ |
| James Ochieng | Operations Mgr | james@paymo.co.ke | 🟢 Active | 1h ago | 1 | ✅ | 🟡 |
| Mary Wanjiku | Finance Mgr | mary@paymo.co.ke | 🟢 Active | 30 min ago | 1 | ✅ | ❌ |
| David Kimani | Compliance Officer | david@paymo.co.ke | 🟢 Active | 2h ago | 0 | ✅ | ✅ |
| Grace Muthoni | Support Lead | grace@paymo.co.ke | 🟢 Active | 45 min ago | 1 | ✅ | ❌ |
| Peter Njoroge | Minor Admin | peter@paymo.co.ke | 🟡 Locked (failed PIN) | — | 0 | ✅ | ❌ |
| Jane Wambui | Analyst | jane@paymo.co.ke | 🟢 Active | 3h ago | 0 | ✅ | ❌ |
| Samuel Kariuki | Support Agent | samuel@paymo.co.ke | 🟢 Active | 20 min ago | 1 | ✅ | ❌ |

### Section 29.2: Create Admin Form
| Field | Type | Required | Details |
|-------|------|----------|---------|
| Full name | Text | Yes | Legal name |
| Email | Email | Yes | Corporate email only |
| Role | Dropdown | Yes | From role hierarchy |
| Reports to | Dropdown | Yes | Must be higher tier |
| Permission set | Multi-select | Yes | Specific permissions (if Minor Admin) |
| 6-digit PIN | Numeric | Yes | Set by creating admin |
| Passkey registration | Toggle | No | Register now or later |
| TOTP setup | Auto | Yes | QR code generated |
| Session PIN issuance | Manual | Yes | Super admin issues separately |
| Account status | Toggle | Yes | Active / Inactive (create but don't activate) |
| Notes | Text | No | Reason for creation |

### Section 29.3: Admin Session Management
| Admin | Session ID | Login Time | IP | Device | Location | Idle | Expires |
|-------|-----------|------------|----|--------|----------|------|---------|
| Joseph M. | S-8821 | 08:00 | 192.168.1.x | MacBook Pro | Nairobi | 2 min | 16:00 |
| Sarah K. | S-8820 | 08:15 | 192.168.1.x | iMac | Nairobi | 15 min | 16:15 |
| James O. | S-8819 | 07:30 | 192.168.1.x | Dell Laptop | Nairobi | 1h | 15:30 |
| Grace M. | S-8818 | 08:30 | 41.x.x.x | iPhone | Nairobi | 45 min | 16:30 |
| Samuel K. | S-8817 | 08:45 | 192.168.1.x | Desktop PC | Nairobi | 20 min | 16:45 |

### Section 29.4: Admin Activity Feed (All Admins)
| Time | Admin | Action | Target | Details | IP |
|------|-------|--------|--------|---------|-----|
| 14:32 | Joseph M. | Froze account | User #89234 | Fraud suspicion | 192.168.1.x |
| 14:15 | Sarah K. | Approved settlement | Partner #12 | KES 4.2M | 192.168.1.x |
| 13:45 | James O. | Updated fee schedule | M-Pesa cashout | 2.0% → 1.75% | 192.168.1.x |
| 13:00 | Mary W. | Exported report | Transaction ledger | Aug data | 192.168.1.x |
| 12:30 | David K. | Filed SAR | SAR-2026-035 | Structuring | 192.168.1.x |
| 12:00 | Grace M. | Resolved ticket | #T-4523 | User balance query | 41.x.x.x |
| 11:30 | Samuel K. | Responded to user | Ticket #T-4519 | KYC question | 192.168.1.x |

### Section 29.5: Admin Permission Editor
| Admin | Current Role | Custom Permissions | Last Modified | Modified By |
|-------|-------------|-------------------|---------------|-------------|
| Peter Njoroge | Minor Admin | View users, View transactions, Export data | Aug 1 | Joseph M. |
| Jane Wambui | Analyst | Read-only all (default) | Mar 2024 | System |
| Samuel Kariuki | Support Agent | View users, View transactions, Respond to tickets | Jul 2025 | Grace M. |

### Section 29.6: Admin Deactivation & Offboarding
| Admin | Deactivation Date | Reason | Access Revoked | Data Exported | Exit Interview |
|-------|-------------------|--------|---------------|--------------|----------------|
| (Previous admin) | Jul 15, 2026 | Resigned | ✅ All | ✅ | ✅ Completed |
| (Previous admin) | Jun 1, 2026 | Terminated | ✅ All | ✅ | ✅ Completed |

| Offboarding Checklist | Status |
|----------------------|--------|
| Disable all sessions | ✅ |
| Revoke all API keys | ✅ |
| Remove from all shared resources | ✅ |
| Change shared passwords | ✅ |
| Revoke passkey | ✅ |
| Disable TOTP | ✅ |
| Export audit trail | ✅ |
| Remove from communication channels | ✅ |
| Notify all teams | ✅ |
| Archive admin profile | ✅ |

### Section 29.7: Admin Performance Metrics
| Admin | Actions (30d) | Users Managed | Tickets Resolved | SARs Filed | Avg Session Duration |
|-------|---------------|---------------|-----------------|------------|---------------------|
| Joseph M. | 234 | 45 | 0 | 0 | 6.2 hours |
| Sarah K. | 456 | 89 | 23 | 2 | 7.1 hours |
| James O. | 389 | 67 | 12 | 0 | 6.8 hours |
| Mary W. | 312 | 34 | 0 | 0 | 5.4 hours |
| David K. | 278 | 56 | 0 | 8 | 5.9 hours |
| Grace M. | 534 | 123 | 456 | 0 | 7.8 hours |
| Samuel K. | 678 | 234 | 567 | 0 | 8.1 hours |

### Section 29.8: Admin Security Settings
| Setting | Value | Applicable To |
|---------|-------|---------------|
| Force password change every | 90 days | All admins |
| Minimum password length | 16 characters | All admins |
| Password complexity | Uppercase + lowercase + number + special | All admins |
| Passkey required for | Tier 0–1 | Super Admin, Platform Admin |
| Session PIN required for | All logins | All admins |
| IP whitelist | 192.168.1.0/24 (office) | Optional per admin |
| Device binding | Optional per admin | Optional per admin |
| Max session duration | 8 hours | All admins |
| Idle timeout | 30 minutes | All admins |
| Concurrent sessions | 1 per admin | All admins |

---

# ✅PAGE 30: PERMISSIONS & ROLES

**Purpose:** Configure roles, permission sets, and access control policies.

### Section 30.1: Role Management
| Role | Tier | Created | Admins Assigned | Last Modified | Can Be Deleted |
|------|------|---------|----------------|---------------|----------------|
| Super Admin | 0 | Jan 2024 | 1 | — | ❌ System role |
| Platform Admin | 1 | Jan 2024 | 1 | Aug 2026 | ❌ System role |
| Operations Manager | 2 | Jan 2024 | 1 | — | ❌ System role |
| Compliance Officer | 3 | Jan 2024 | 1 | — | ❌ System role |
| Finance Manager | 4 | Jan 2024 | 1 | — | ❌ System role |
| Support Lead | 5 | Jan 2024 | 1 | — | ❌ System role |
| Minor Admin (Custom) | 6 | Jan 2024 | 1 | Aug 2026 | ✅ Yes |
| Analyst | 7 | Jan 2024 | 1 | — | ❌ System role |
| Support Agent | 8 | Jan 2024 | 1 | — | ❌ System role |
| Read-Only Viewer | 9 | Mar 2024 | 0 | — | ✅ Yes |

### Section 30.2: Create Custom Role
| Field | Details |
|-------|---------|
| Role name | Text input |
| Description | Text input |
| Tier level | Dropdown (determines reporting) |
| Base role | Copy permissions from existing role |
| Permission toggles | Grid of all permissions with on/off |
| Save as template | Option to reuse for future roles |
| Requires approval | Super admin must approve new roles |

### Section 30.3: Permission Categories (Full Tree)
```
USERS
├── View user list
├── View user detail
├── Edit user profile
├── Freeze account
├── Unfreeze account
├── Close account
├── Impersonate user
├── Delete user
├── Adjust user limits
├── Grant/revoke VIP
├── Export user data
├── View login history
└── Manage tags/segments

TRANSACTIONS
├── View all transactions
├── Reverse transaction
├── Approve high-value
├── Set fee schedule
├── Override fee
├── Set withdrawal limits
├── Export transactions
├── Hold transaction
└── Batch process

FRAUD & RISK
├── View fraud dashboard
├── Block transaction
├── Flag user
├── Blacklist user
├── Review alerts
├── Manage blacklist
├── Configure rules
├── File SAR
└── View risk scores

FINANCE
├── View P&L
├── View balance sheet
├── Approve settlements
├── Manage pools
├── Set tax rates
├── Manage charges
├── Manage reserves
├── Approve refunds
└── View investor data

PARTNERS
├── View partners
├── Onboard partner
├── Suspend partner
├── Set partner fees
├── View partner transactions
└── Manage partner API

SYSTEM
├── Manage admins
├── View audit log
├── Configure system
├── Manage roles
├── API key management
├── Database access
├── Feature flags
├── View error logs
├── Manage webhooks
└── Backup management

COMMUNICATIONS
├── Send broadcast
├── Manage notifications
├── View support queue
├── Respond to tickets
└── Manage templates

DOCUMENTS
├── View documents
├── Edit documents
├── Publish documents
└── Manage templates

REPORTING
├── View analytics
├── Create reports
├── Export reports
├── Schedule reports
└── View investor reports
```

### Section 30.4: Permission Matrix Editor
- Interactive grid: Roles (columns) × Permissions (rows)
- Click to toggle permission on/off
- Color coding: ✅ Granted, ❌ Denied, ⚙️ Configurable
- Bulk actions: "Grant all in category", "Revoke all in category"
- Save requires 2FA confirmation
- Change log automatically recorded

### Section 30.5: Permission Change History
| Date | Admin | Role | Permission | Change | Reason |
|------|-------|------|------------|--------|--------|
| Aug 22 | Joseph M. | Minor Admin | Impersonate user | ❌ Revoked | Security review |
| Aug 15 | Joseph M. | Minor Admin | Export user data | ✅ Granted | Business need |
| Aug 1 | Joseph M. | Support Agent | View risk scores | ✅ Granted | Better fraud awareness |
| Jul 15 | Joseph M. | Analyst | View P&L | ❌ Revoked | Principle of least privilege |

### Section 30.6: Access Request Workflow
| Step | Description | Approver |
|------|-------------|----------|
| 1. Request | Admin requests permission change | — |
| 2. Review | Manager reviews request | Direct manager |
| 3. Approve/Deny | Decision made | Manager or Super admin |
| 4. Implement | Permission granted/revoked | System auto |
| 5. Notify | Requestor notified | System auto |
| 6. Audit | Change logged | System auto |

| Pending Requests | Requestor | Permission | Requested | Status |
|-----------------|-----------|------------|-----------|--------|
| REQ-001 | Peter N. | Reverse transaction | Aug 22 | ⏳ Awaiting manager |
| REQ-002 | Jane W. | View P&L | Aug 21 | ❌ Denied by super admin |
| REQ-003 | Samuel K. | Flag user | Aug 20 | ✅ Approved |

### Section 30.7: Segregation of Duties Matrix
| Action | Initiator | Approver | Reviewer | Cannot Be Same |
|--------|-----------|----------|----------|----------------|
| Freeze account | Ops Manager / Compliance | — | — | Same person cannot freeze + unfreeze |
| Reverse transaction | Ops Manager | Finance Manager | Compliance | All 3 must be different |
| Close account | Compliance | Super Admin | — | Cannot be same |
| Fee change | Finance Manager | Super Admin | — | Cannot be same |
| Role creation | Super Admin | — | — | Only Super Admin |
| Settlement approval | Finance Manager | Super Admin (if >KES 50M) | — | — |
| Partner onboarding | Partnerships | Compliance + Tech | — | All different |
| Bulk freeze | Ops Manager | Super Admin | Compliance | All different |

### Section 30.8: Permission Audit Report
| Finding | Severity | Details | Recommendation |
|---------|----------|---------|----------------|
| Over-privileged Minor Admin | 🟡 Medium | Peter N. has export + view but no need for impersonate (now revoked) | Review quarterly |
| No SoD for fee changes | 🟡 Medium | Finance Manager can initiate + approve under KES 10M | Add second approver |
| Stale permissions | 🟢 Low | Jane W. had P&L access for 2 weeks before revocation | Implement auto-expiry |
| Shared credentials risk | 🟡 Medium | 2 support agents share a login (legacy) | Migrate to individual |

---

# ✅PAGE 31: AUDIT LOG

**Purpose:** Immutable log of all system actions for compliance, security, and investigation.

### Section 31.1: Audit Log Overview
| Metric | Value |
|--------|-------|
| Total entries (30d) | 2,345,678 |
| Entries today | 78,234 |
| Storage used | 45 GB |
| Retention period | 7 years |
| Oldest entry | Jan 15, 2024 |
| Log sources | 12 (API, Admin, User, System, Fraud, Finance, Partner, Auth, DB, File, Email, Network) |

### Section 31.2: Audit Log Search
| Filter | Type | Options |
|--------|------|---------|
| Date range | From — To | Custom range |
| Admin | Dropdown | All admins |
| Action type | Multi-select | Login, Logout, Create, Update, Delete, Approve, Reject, Export, Freeze, etc. |
| Target type | Multi-select | User, Transaction, Partner, Admin, Role, Fee, Config, etc. |
| Target ID | Text | Specific entity ID |
| Severity | Multi-select | Info, Warning, Critical |
| IP address | Text | Exact or partial |
| Result | Multi-select | Success, Failure, Error |
| Source | Multi-select | API, Admin UI, System, Background job |

### Section 31.3: Audit Log Table
| Timestamp | Admin | Action | Target Type | Target ID | Details | IP | Result | Session |
|-----------|-------|--------|-------------|-----------|---------|-----|--------|---------|
| 14:32:01 | Joseph M. | Freeze | User | PAY-89234 | Reason: Fraud suspicion | 192.168.1.x | ✅ Success | S-8821 |
| 14:15:23 | Sarah K. | Approve | Settlement | SET-4456 | Amount: KES 4.2M | 192.168.1.x | ✅ Success | S-8820 |
| 13:45:12 | James O. | Update | Fee Config | FEE-MP-CO | Rate: 2.0% → 1.75% | 192.168.1.x | ✅ Success | S-8819 |
| 13:00:45 | Mary W. | Export | Report | RPT-TXN-AUG | Format: Excel, 1.2M rows | 192.168.1.x | ✅ Success | S-8818 |
| 12:30:00 | David K. | Create | SAR | SAR-2026-035 | User: PAY-55667, Amount: KES 1.2M | 192.168.1.x | ✅ Success | S-8817 |

### Section 31.4: Audit Log Detail
| Field | Value |
|-------|-------|
| Log ID | AUD-8823456789 |
| Timestamp | 2026-08-22 14:32:01.234 (UTC+3) |
| Admin | Joseph Mwangi (joseph@paymo.co.ke) |
| Admin role | Super Admin |
| Action | Freeze Account |
| Target type | User |
| Target ID | PAY-89234 |
| Before state | {"status": "active", "balance": "KES 45,230"} |
| After state | {"status": "frozen", "balance": "KES 45,230"} |
| Reason | "Fraud suspicion — dual browser detected" |
| IP address | 192.168.1.45 |
| User agent | Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) |
| Device fingerprint | FP-88234 |
| Geolocation | Nairobi, Kenya (-1.2921, 36.8219) |
| Session ID | S-8821 |
| 2FA verified | Yes (TOTP + Passkey) |
| Request ID | REQ-882345 |
| Duration | 234ms |

### Section 31.5: Critical Action Log (Separate Immutable Store)
| Timestamp | Admin | Action | Target | Details | Verified By |
|-----------|-------|--------|--------|---------|-------------|
| 14:32 | Joseph M. | Freeze | PAY-89234 | Fraud | 2FA + Passkey |
| 13:45 | James O. | Fee change | M-Pesa cashout | 2.0%→1.75% | 2FA |
| 12:30 | David K. | File SAR | SAR-2026-035 | KES 1.2M | 2FA |
| 11:00 | Joseph M. | Role change | Peter N. | Removed impersonate | 2FA |
| 09:00 | Joseph M. | System config | Maintenance window | Sunday 2AM | 2FA |

### Section 31.6: Audit Log Analytics
| Category | Count (30d) | Top Admin | Trend |
|----------|-------------|-----------|-------|
| User management | 45,678 | Grace M. (12,345) | ↑ |
| Transaction actions | 23,456 | Sarah K. (8,901) | → |
| Financial operations | 12,345 | Mary W. (5,678) | ↑ |
| Fraud/security | 8,901 | David K. (4,567) | ↑ |
| System configuration | 2,345 | Joseph M. (1,890) | → |
| Authentication events | 2,234,567 | — | ↑ |
| Data exports | 456 | Mary W. (234) | → |

### Section 31.7: Compliance Export
| Export Type | Format | Frequency | Destination | Retention |
|-------------|--------|-----------|-------------|-----------|
| Full audit log (monthly) | JSON + CSV | Monthly | Secure archive (S3 encrypted) | 7 years |
| Critical actions only | PDF | Daily | Secure archive + email to compliance | 7 years |
| Authentication events | CSV | Weekly | Secure archive | 7 years |
| Regulatory request export | PDF | On request | Secure email | 7 years |
| Board audit summary | PDF | Quarterly | Board portal | 7 years |

### Section 31.8: Audit Log Integrity
| Check | Frequency | Result | Last Run |
|-------|-----------|--------|----------|
| Hash chain verification | Hourly | ✅ All hashes valid | 14:00 |
| Tamper detection | Real-time | ✅ No tampering detected | Continuous |
| Backup verification | Daily | ✅ Backup matches live | 06:00 |
| Storage integrity | Weekly | ✅ No corruption | Aug 18 |

### Section 31.9: Audit Alert Rules
| Rule | Trigger | Notification | Status |
|------|---------|--------------|--------|
| Admin login outside business hours | Login 10PM–6AM | Slack + Email | ✅ Active |
| Multiple failed logins by admin | >5 in 1 hour | Slack + SMS | ✅ Active |
| Bulk export by non-super-admin | Export >10K rows | Slack + Email | ✅ Active |
| Permission change | Any role/permission edit | Slack + Email | ✅ Active |
| Critical action without 2FA | Should not happen | Slack + SMS + Page | ✅ Active (safety net) |
| Delete action | Any delete | Slack + Email | ✅ Active |
| Config change | System configuration change | Slack + Email | ✅ Active |

---

# ✅PAGE 32: SYSTEM CONFIGURATION

**Purpose:** Platform-wide settings — branding, features, limits, integrations, maintenance.

### Section 32.1: General Settings
| Setting | Current Value | Editable | Requires |
|---------|--------------|----------|----------|
| Platform name | PayMo | ✅ | Super admin |
| Legal entity name | PayMo Digital Bank Ltd | ❌ | Company registry |
| Country of operation | Kenya | ❌ | Regulatory |
| Base currency | KES | ❌ | Regulatory |
| Timezone | Africa/Nairobi (EAT, UTC+3) | ✅ | Super admin |
| Date format | DD/MM/YYYY | ✅ | None |
| Number format | 1,234.56 | ✅ | None |
| Language (admin) | English | ✅ | None |
| Language (user app) | English + Swahili | ✅ | None |

### Section 32.2: Branding Configuration
| Element | Current | Editable | Preview |
|---------|---------|----------|---------|
| Primary color | #1B5E20 (green) | ✅ | Color swatch |
| Secondary color | #FFD600 (gold) | ✅ | Color swatch |
| Logo (full) | [paymo-logo-full.svg] | ✅ | Preview |
| Logo (icon) | [paymo-icon.svg] | ✅ | Preview |
| Favicon | [paymo-favicon.ico] | ✅ | Preview |
| Email header template | [HTML template] | ✅ | Preview |
| SMS sender name | PayMo | ✅ (telco dependent) | — |
| Push notification icon | [paymo-push-icon.png] | ✅ | Preview |
| White-label enabled | No | ✅ | — |

### Section 32.3: Maintenance Configuration
| Setting | Value |
|---------|-------|
| Scheduled maintenance | Sunday 2:00–4:00 AM EAT |
| Maintenance mode | Toggle (shows user-facing maintenance page) |
| Maintenance message | "We're performing scheduled upgrades. We'll be back shortly." |
| Maintenance notification | Send push + SMS 1 hour before |
| Kill active sessions during maintenance | Yes |
| Allow admin access during maintenance | Yes |
| Emergency maintenance | Toggle (no advance notice, immediate) |

### Section 32.4: Notification Settings
| Channel | Enabled | Provider | Config |
|---------|---------|----------|--------|
| Push (iOS) | ✅ | APNs | Certificate uploaded |
| Push (Android) | ✅ | FCM | Server key configured |
| SMS | ✅ | Africa's Talking | API key, sender name |
| Email | ✅ | SendGrid | API key, templates |
| In-app | ✅ | Built-in | — |
| Webhook | ✅ | Custom | Per-partner configuration |

### Section 32.5: Email Template Management
| Template | Type | Last Modified | Variables | Preview |
|----------|------|---------------|-----------|---------|
| Welcome email | Transactional | Aug 2026 | {{name}}, {{account#}} | Preview → |
| KYC approval | Transactional | Aug 2026 | {{name}}, {{tier}} | Preview → |
| KYC rejection | Transactional | Aug 2026 | {{name}}, {{reason}} | Preview → |
| Transaction receipt | Transactional | Aug 2026 | {{amount}}, {{fee}}, {{balance}} | Preview → |
| Password reset | Security | Aug 2026 | {{reset_link}}, {{expiry}} | Preview → |
| Marketing — new feature | Marketing | Jul 2026 | {{feature}}, {{cta_link}} | Preview → |
| Dormancy reminder | Engagement | Jun 2026 | {{name}}, {{days_inactive}} | Preview → |

### Section 32.6: Rate Limiting Configuration
| Endpoint | Limit | Window | Applies To | Status |
|----------|-------|--------|-----------|--------|
| Login attempts | 5 per IP | 15 min | All | ✅ Active |
| Transaction submission | 10 per user | 1 min | All | ✅ Active |
| API requests (general) | 1000 per key | 1 min | API users | ✅ Active |
| API requests (search) | 100 per key | 1 min | API users | ✅ Active |
| Password reset | 3 per email | 1 hour | All | ✅ Active |
| KYC submission | 5 per user | 1 hour | All | ✅ Active |
| Admin login | 3 per IP | 15 min | Admins | ✅ Active |
| Export requests | 3 per admin | 1 hour | Admins | ✅ Active |

### Section 32.7: Security Configuration
| Setting | Value |
|---------|-------|
| HTTPS enforced | Yes (HSTS, 1 year) |
| TLS version | 1.3 minimum |
| CSP headers | Strict |
| CORS allowed origins | paymo.co.ke, admin.paymo.co.ke |
| Session cookie | HttpOnly, Secure, SameSite=Strict |
| CSRF protection | Synchronizer token |
| SQL injection protection | Parameterized queries only |
| XSS protection | Input sanitization + output encoding |
| File upload restrictions | .pdf, .jpg, .png only, max 10MB |
| API authentication | JWT + API key |
| Password hashing | bcrypt (cost factor 12) |
| Encryption at rest | AES-256 |
| Encryption in transit | TLS 1.3 |
| Key management | AWS KMS (auto-rotation) |

### Section 32.8: Feature Toggles (Quick Access)
| Feature | Enabled | Rollout | Description |
|---------|---------|---------|-------------|
| Savings pockets | ✅ | 100% | Multiple savings goals |
| Virtual cards | ✅ | 100% | Instant virtual card issuance |
| Business accounts | ✅ | 100% | Multi-user business accounts |
| International transfers | ✅ | 100% | FX + cross-border |
| New onboarding flow | 🟡 | 20% | A/B test — new UX |
| AI fraud detection v3.3 | 🟡 | 10% | Beta — new ML model |
| PayLater (BNPL) | ❌ | 0% | Development complete, pending launch |
| Crypto wallet | ❌ | 0% | In development |

### Section 32.9: Configuration Change History
| Date | Admin | Setting | Old Value | New Value | Reason |
|------|-------|---------|-----------|-----------|--------|
| Aug 22 | Joseph M. | Maintenance window | Sat 2AM | Sun 2AM | Lower traffic day |
| Aug 20 | Ops Manager | Push provider | Firebase | FCM (migrated) | Better delivery |
| Aug 15 | Joseph M. | Primary color | #2E7D32 | #1B5E20 | Brand refresh |
| Aug 10 | Security Lead | TLS min version | 1.2 | 1.3 | Security hardening |

---

# ✅PAGE 33: API & INTEGRATIONS

**Purpose:** Manage API keys, webhooks, third-party integrations, and developer documentation.

### Section 33.1: API Key Management
| Key Name | Key (masked) | Created By | Created | Permissions | Last Used | Status | Rate Limit |
|----------|-------------|------------|---------|-------------|-----------|--------|------------|
| Production — Main | pk_live_****...7823 | Joseph M. | Jan 2024 | Full access | 2 min ago | ✅ Active | 10K/min |
| Production — Partner API | pk_live_****...4567 | Joseph M. | Mar 2024 | Partner scope | 5 min ago | ✅ Active | 5K/min |
| Staging — Testing | pk_test_****...1234 | Joseph M. | Jan 2024 | Full access | 1h ago | ✅ Active | 1K/min |
| QuickLend — Loan | pk_live_****...9012 | Joseph M. | Jun 2025 | Loan scope only | 2 days ago | 🟡 Suspended | 500/min |
| Internal — Batch | pk_live_****...5678 | Joseph M. | Feb 2024 | Batch + export | 30 min ago | ✅ Active | 2K/min |

### Section 33.2: API Usage Dashboard
| Key | Requests (24h) | Errors | Avg Latency | p95 Latency | p99 Latency |
|-----|----------------|--------|-------------|-------------|-------------|
| Production — Main | 2,345,678 | 234 (0.01%) | 45ms | 120ms | 340ms |
| Production — Partner | 890,123 | 89 (0.01%) | 78ms | 200ms | 560ms |
| Staging — Testing | 45,678 | 12 (0.03%) | 120ms | 340ms | 890ms |
| Internal — Batch | 234,567 | 0 (0%) | 200ms | 450ms | 1.2s |

### Section 33.3: API Endpoints Overview
| Category | Endpoints | Avg Latency | Auth Method |
|----------|-----------|-------------|-------------|
| Authentication | 5 | 120ms | API key + secret |
| Users | 12 | 85ms | API key |
| Transactions | 15 | 45ms | API key |
| Transfers | 8 | 180ms | API key + 2FA for >KES 100K |
| Cards | 10 | 120ms | API key |
| Loans | 8 | 200ms | API key |
| Bill payments | 6 | 340ms | API key |
| KYC | 5 | 450ms | API key |
| Webhooks | 3 | — | HMAC signature |
| Utilities | 4 | 50ms | API key |

### Section 33.4: Webhook Management
| Webhook | URL | Events | Success Rate | Last Delivery | Status |
|---------|-----|--------|-------------|---------------|--------|
| QuickLend — Loan Status | https://api.quickl.../webhook | loan.disbursed, loan.repaid | 98.5% | 5 min ago | 🟡 Suspended (partner issue) |
| Corporate — TXN Alert | https://api.corp.../webhook | transaction.* | 99.8% | 2 min ago | ✅ Active |
| Internal — Analytics | https://internal.../webhook | * | 99.9% | 1 min ago | ✅ Active |
| Compliance — AML Alert | https://comply.../webhook | user.flagged, sar.filed | 99.7% | 30 min ago | ✅ Active |

### Section 33.5: Webhook Delivery Log
| Time | Webhook | Event | Payload Size | HTTP Status | Latency | Retry |
|------|---------|--------|-------------|-------------|---------|-------|
| 14:32 | Corporate TXN | transaction.complete | 2.3 KB | 200 OK | 45ms | 0 |
| 14:31 | Analytics | transaction.complete | 2.3 KB | 200 OK | 12ms | 0 |
| 14:30 | Compliance | user.flagged | 1.1 KB | 200 OK | 89ms | 0 |
| 14:28 | QuickLend | loan.disbursed | 0.8 KB | 503 Error | 5,000ms | 1/3 |
| 14:25 | Analytics | transaction.failed | 1.5 KB | 200 OK | 15ms | 0 |

### Section 33.6: Third-Party Integration Status
| Provider | Purpose | Status | Uptime (30d) | SLA | Contract End |
|----------|---------|--------|-------------|-----|-------------|
| Safaricom (M-Pesa) | Payments | ✅ Connected | 99.98% | 99.95% | Jan 2027 |
| Visa | Card processing | ✅ Connected | 99.99% | 99.99% | Jan 2029 |
| Mastercard | Card processing | ✅ Connected | 99.97% | 99.95% | Jan 2029 |
| KCB Bank | Banking | ✅ Connected | 99.95% | 99.90% | Jan 2027 |
| Equity Bank | Banking | ✅ Connected | 99.96% | 99.90% | Jan 2027 |
| Onfido | KYC verification | ✅ Connected | 99.90% | 99.90% | Jan 2027 |
| ComplyAdvantage | AML screening | ✅ Connected | 99.95% | 99.90% | Jan 2027 |
| Africa's Talking | SMS | ✅ Connected | 99.99% | 99.95% | Dec 2026 |
| SendGrid | Email | ✅ Connected | 99.99% | 99.95% | Mar 2027 |
| AWS | Infrastructure | ✅ Connected | 99.99% | 99.99% | Ongoing |
| Datadog | Monitoring | ✅ Connected | 99.99% | 99.95% | Dec 2026 |

### Section 33.7: API Error Analysis
| Error Code | Count (24h) | % | Top Endpoint | Root Cause |
|-----------|-------------|---|-------------|------------|
| 400 Bad Request | 123 | 52.6% | /transactions | Invalid amount format |
| 401 Unauthorized | 45 | 19.2% | /users | Expired API key |
| 403 Forbidden | 34 | 14.5% | /transactions | Insufficient permissions |
| 429 Rate Limited | 23 | 9.8% | /transactions | Rate limit exceeded |
| 500 Internal Error | 9 | 3.8% | /transfers | Timeout to partner |
| 502 Bad Gateway | 0 | 0% | — | — |
| 503 Service Unavailable | 0 | 0% | — | — |

### Section 33.8: API Versioning
| Version | Status | Endpoints | Deprecation Date | Sunset Date |
|---------|--------|-----------|-----------------|-------------|
| v1 | 🟡 Deprecated | All original | Jan 2026 | Jul 2027 |
| v2 | ✅ Current | All + new features | — | — |
| v3 (beta) | 🟡 Beta | New endpoints only | — | — |

### Section 33.9: Developer Documentation
| Resource | URL | Last Updated | Status |
|----------|-----|-------------|--------|
| API Reference | docs.paymo.co.ke/api | Aug 2026 | ✅ Current |
| Integration Guide | docs.paymo.co.ke/guides | Aug 2026 | ✅ Current |
| SDK Downloads | docs.paymo.co.ke/sdk | Jul 2026 | ✅ Current |
| Webhook Guide | docs.paymo.co.ke/webhooks | Aug 2026 | ✅ Current |
| Changelog | docs.paymo.co.ke/changelog | Aug 22, 2026 | ✅ Current |
| Sandbox Guide | docs.paymo.co.ke/sandbox | Jun 2026 | ✅ Current |
| Rate Limit Guide | docs.paymo.co.ke/rate-limits | May 2026 | ✅ Current |

---

# PAGE 34: FEATURE FLAGS

**Purpose:** Manage feature rollouts, A/B tests, and progressive feature releases.

### Section 34.1: Active Feature Flags
| Flag | Key | Enabled | Rollout | Target | Created | Owner |
|------|-----|---------|---------|--------|---------|-------|
| New Onboarding Flow | `feat.new_onboarding` | ✅ | 20% | Random users | Aug 1 | Product |
| AI Fraud v3.3 | `feat.fraud_v33` | ✅ | 10% | Random transactions | Aug 15 | ML Team |
| Enhanced KYC UI | `feat.kyc_ui_v2` | ✅ | 50% | All new KYC submissions | Jul 15 | Product |
| Savings Goals | `feat.savings_goals` | ✅ | 100% | All users | Jun 2026 | Product |
| Business Payroll | `feat.payroll` | ✅ | 100% | Business accounts | May 2026 | Product |
| Push Notification v2 | `feat.push_v2` | 🟡 | 5% | Random users | Aug 20 | Engineering |
| Cardless ATM | `feat.cardless_atm` | ❌ | 0% | — | Aug 10 | Product |
| BNPL (PayLater) | `feat.bnpl` | ❌ | 0% | — | Jul 2026 | Product |

### Section 34.2: Flag Configuration
| Setting | Details |
|---------|---------|
| Key | Unique identifier (e.g., `feat.new_onboarding`) |
| Description | Human-readable description |
| Enabled | On/Off toggle |
| Rollout strategy | Percentage, user segment, whitelist, gradual |
| Rollout percentage | 0–100% |
| Target segment | All users, new users, VIP, specific users, specific counties |
| Whitelist | Specific user IDs or account numbers |
| Sticky | Once a user sees a flag, they keep seeing it (consistent experience) |
| Fallback | What happens when flag is off (old behavior) |
| Metrics to track | Which KPIs to monitor during rollout |
| Owner | Person responsible for the flag |
| Expiry | Optional auto-disable date |

### Section 34.3: A/B Test Management
| Test | Flag | Variant A | Variant B | Metric | Sample Size | Duration | Result |
|------|------|-----------|-----------|--------|-------------|----------|--------|
| New Onboarding | `feat.new_onboarding` | Old flow (80%) | New flow (20%) | Completion rate | 29,600 users | 30 days | ⏳ Running |
| Fraud Model v3.3 | `feat.fraud_v33` | v3.2 (90%) | v3.3 (10%) | False positive rate | 14.8M TXNs | 14 days | ⏳ Running |
| Push v2 | `feat.push_v2` | Old push (95%) | New push (5%) | Open rate | 7,400 users | 7 days | ⏳ Running |
| KYC UI v2 | `feat.kyc_ui_v2` | Old UI (50%) | New UI (50%) | Completion rate, time | 1,794 users | 45 days | ✅ B won (+12% completion) |

### Section 34.4: Flag Performance Metrics
| Flag | Metric | Control | Variant | Delta | Statistical Significance |
|------|--------|---------|---------|-------|------------------------|
| New Onboarding | Completion rate | 68% | 74% | +6pp | ✅ p<0.01 |
| New Onboarding | Time to complete | 8.3 min | 6.1 min | -2.2 min | ✅ p<0.01 |
| New Onboarding | KYC submission rate | 72% | 78% | +6pp | ✅ p<0.01 |
| Fraud v3.3 | False positive rate | 34% | 28% | -6pp | 🟡 p<0.05 (need more data) |
| Fraud v3.3 | Fraud catch rate | 94% | 96% | +2pp | 🟡 p<0.10 (not significant) |
| Push v2 | Open rate | 12% | 18% | +6pp | ✅ p<0.01 |
| Push v2 | Click rate | 3.2% | 5.1% | +1.9pp | ✅ p<0.01 |

### Section 34.5: Gradual Rollout Scheduler
| Flag | Current % | Schedule | Owner | Criteria to Advance |
|------|-----------|----------|-------|-------------------|
| New Onboarding | 20% | +20% every 3 days | Product | No regression in any metric |
| Fraud v3.3 | 10% | +10% every 7 days | ML Team | False positive rate <30%, catch rate >95% |
| Push v2 | 5% | +10% every 3 days | Engineering | Open rate >15%, no delivery issues |

### Section 34.6: Flag Audit Trail
| Date | Admin | Flag | Change | Reason |
|------|-------|------|--------|--------|
| Aug 22 | Product Lead | `feat.push_v2` | Rollout 0% → 5% | A/B test start |
| Aug 20 | Product Lead | `feat.cardless_atm` | Created (disabled) | Feature ready, pending QA |
| Aug 15 | ML Lead | `feat.fraud_v33` | Rollout 0% → 10% | Model v3.3 deployed |
| Aug 1 | Product Lead | `feat.new_onboarding` | Rollout 0% → 20% | A/B test start |
| Jul 15 | Product Lead | `feat.kyc_ui_v2` | Rollout 0% → 50% | Positive initial results |

### Section 34.7: Flag Emergency Controls
| Action | Description | Requires |
|--------|-------------|----------|
| Kill switch (all flags) | Disable all non-100% flags instantly | Super admin |
| Kill specific flag | Disable one flag instantly | Flag owner or super admin |
| Rollback to previous % | Revert rollout percentage | Flag owner |
| Pause rollout | Stop advancing schedule | Flag owner |
| Force 100% | Skip gradual, enable for all | Super admin + 2FA |

### Section 34.8: Archived Flags
| Flag | Enabled Period | Final Rollout | Outcome | Archived Date |
|------|---------------|---------------|---------|---------------|
| `feat.savings_goals` | Jun–Jul 2026 | 10% → 25% → 50% → 100% | ✅ Success — shipped | Jul 15, 2026 |
| `feat.business_payroll` | Apr–May 2026 | 5% → 25% → 100% | ✅ Success — shipped | May 30, 2026 |
| `feat.old_kyc_flow` | Jan–Jun 2026 | 100% → 50% → 0% | ✅ Replaced by v2 | Jul 15, 2026 |
| `feat.chat_support_v1` | Feb–Mar 2026 | 20% → 0% | ❌ Cancelled (low usage) | Mar 30, 2026 |

---

# PAGE 35: NOTIFICATION CENTER

**Purpose:** Manage all notification channels, templates, preferences and delivery analytics.

### Section 35.1: Notification Channel Overview
| Channel | Provider | Status | Sent (24h) | Delivered | Failed | Cost (24h) | Cost/Month |
|---------|----------|--------|------------|-----------|--------|------------|------------|
| Push (iOS) | APNs | ✅ Active | 234,567 | 228,456 (97.4%) | 6,111 (2.6%) | KES 0 | KES 0 |
| Push (Android) | FCM | ✅ Active | 345,678 | 338,765 (98.0%) | 6,913 (2.0%) | KES 0 | KES 0 |
| SMS | Africa's Talking | ✅ Active | 89,234 | 87,890 (98.5%) | 1,344 (1.5%) | KES 178K | KES 5.3M |
| Email | SendGrid | ✅ Active | 45,678 | 44,915 (98.3%) | 763 (1.7%) | KES 23K | KES 690K |
| In-app | Built-in | ✅ Active | 1,234,567 | 1,234,567 (100%) | 0 (0%) | KES 0 | KES 0 |
| WhatsApp (Business) | Meta | 🟡 Beta | 12,345 | 11,890 (96.3%) | 455 (3.7%) | KES 37K | KES 1.1M |

### Section 35.2: Notification Categories & Templates
| Category | Templates | Channel | Frequency | Opt-Out Allowed |
|----------|-----------|---------|-----------|-----------------|
| Transactional | Receipt, confirmation, status update | Push + In-app + SMS | Per transaction | ❌ No (regulatory) |
| Security | Login alert, device change, 2FA prompt | Push + SMS | Per event | ❌ No |
| Marketing | Promotions, new features, offers | Push + Email + WhatsApp | 2–3/week max | ✅ Yes |
| Engagement | Dormancy nudge, milestone, tips | Push + In-app | 1–2/week | ✅ Yes |
| Support | Ticket updates, resolution, survey | In-app + Email | Per ticket | ❌ No |
| System | Maintenance, outage, updates | Push + Email | As needed | ❌ No |
| Compliance | KYC reminders, document expiry, T&C updates | Push + SMS + Email | As needed | ❌ No |
| VIP | Dedicated manager messages, exclusive offers | Push + SMS + Email + WhatsApp | As needed | ❌ No |

### Section 35.3: Notification Delivery Analytics
| Channel | Delivery Rate | Open Rate | Click Rate | Opt-Out Rate | Unsubscribe Rate |
|---------|--------------|-----------|------------|-------------|-----------------|
| Push (iOS) | 97.4% | 18.5% | 4.2% | N/A | N/A |
| Push (Android) | 98.0% | 14.2% | 3.1% | N/A | N/A |
| SMS | 98.5% | N/A | N/A | 0.2% | N/A |
| Email | 98.3% | 32.4% | 8.7% | N/A | 0.8% |
| In-app | 100% | 45.2% | 12.3% | N/A | N/A |
| WhatsApp | 96.3% | 78.5% | 23.4% | 1.2% | 0.5% |

### Section 35.4: Notification Queue & Failures
| Time | Channel | User | Template | Error | Retry | Status |
|------|---------|------|----------|-------|-------|--------|
| 14:32 | SMS | PAY-12345 | TXN receipt | Telco timeout | 2/3 | ⏳ Retrying |
| 14:30 | Email | PAY-67890 | Welcome | Invalid email | 0/3 | ❌ Bounced |
| 14:28 | Push | PAY-89012 | Security alert | Device token expired | 0/0 | ❌ Permanent fail |
| 14:25 | SMS | PAY-11223 | KYC reminder | Insufficient balance (telco) | 1/3 | ⏳ Retrying |

### Section 35.5: User Preference Management
| Preference | Default | % Opted Out | Can Opt Out |
|------------|---------|-------------|-------------|
| Transaction receipts | On | 2.3% | ❌ No |
| Security alerts | On | 0.1% | ❌ No |
| Marketing push | On | 34.5% | ✅ Yes |
| Marketing email | On | 28.9% | ✅ Yes |
| Marketing SMS | Off | N/A | ✅ Yes |
| Engagement nudges | On | 18.2% | ✅ Yes |
| Support updates | On | 0.5% | ❌ No |
| System notifications | On | 0% | ❌ No |
| WhatsApp messages | Off | N/A | ✅ Yes |

### Section 35.6: Notification Cost Optimization
| Channel | Current Cost/Month | Potential Savings | Optimization |
|---------|-------------------|------------------|-------------|
| SMS | KES 5.3M | KES 1.6M (30%) | Shift low-priority to push + in-app |
| Email | KES 690K | KES 138K (20%) | Clean bounced list, reduce marketing sends |
| WhatsApp | KES 1.1M | KES 220K (20%) | Use for VIP only, shift marketing to push |
| Push | KES 0 | KES 0 | Already free |
| **Total savings potential** | **KES 7.09M** | **KES 1.96M (28%)** | |

### Section 35.7: Notification Template Editor
| Field | Details |
|-------|---------|
| Template name | Unique identifier |
| Category | Transactional / Security / Marketing / Engagement / Support / System |
| Channel | Which channel(s) this template supports |
| Subject line | For email (supports variables) |
| Body | Rich text editor with variable support |
| Variables available | {{name}}, {{amount}}, {{fee}}, {{balance}}, {{account#}}, {{date}}, {{time}}, etc. |
| Preview | Render with sample data |
| Localization | English + Swahili versions |
| Approval required | Marketing templates require approval before use |
| Version history | All previous versions saved |

### Section 35.8: Scheduled Notifications
| Schedule | Template | Audience | Channel | Next Send | Status |
|----------|----------|----------|---------|-----------|--------|
| Daily — dormant 90d | Dormancy nudge | Dormant 90d users | Push + SMS | Tomorrow 9AM | ✅ Active |
| Weekly — KYC expiry | KYC expiring 7d | Users with docs expiring | Push + Email | Monday 9AM | ✅ Active |
| Monthly — statement | Monthly statement | All active users | Email | Sep 1 | ✅ Active |
| Monthly — new features | Feature highlight | All opted-in users | Push + Email | Sep 5 | ✅ Active |
| Quarterly — investor | Investor update | Investors | Email | Oct 15 | ✅ Active |

### Section 35.9: Notification Compliance
| Requirement | Status | Details |
|-------------|--------|---------|
| Opt-out mechanism | ✅ | In-app settings + unsubscribe link in emails |
| Sender identification | ✅ | All SMS from "PayMo", emails from noreply@paymo.co.ke |
| No spam | ✅ | Max 3 marketing/week, respect quiet hours (10PM–7AM) |
| DND compliance | ✅ | Telco DND list checked before SMS sends |
| Data retention | ✅ | Notification logs retained 2 years, then anonymized |
| Consent tracking | ✅ | All opt-ins/out-outs logged with timestamp |

---

# PAGE 36: BROADCAST MESSAGES

**Purpose:** Send targeted or mass communications to user segments.

### Section 36.1: Broadcast Composer
| Field | Details |
|-------|---------|
| Message name | Internal reference name |
| Channel | Push / SMS / Email / In-app / WhatsApp / Multi-channel |
| Audience | All users / Segment / Saved filter / Specific users / Upload list |
| Language | English / Swahili / Both |
| Message body | Per-channel editor with variables |
| Schedule | Send now / Schedule date & time |
| Approval required | ✅ Yes — requires Platform Admin or above |
| Dry run | Send test message to admin first |
| Rate limiting | Respect channel rate limits |

### Section 36.2: Audience Builder
| Segment | Count | Criteria |
|---------|-------|----------|
| All active users | 134,210 | Status = Active, Last active < 30d |
| All users | 148,392 | No filter |
| New users (7d) | 3,200 | Registered < 7 days ago |
| Dormant users (30d+) | 8,450 | Last active > 30 days ago |
| VIP clients | 347 | VIP status ≠ None |
| Business accounts | 8,900 | Type = Business |
| Unverified KYC | 3,588 | KYC = Pending or Not started |
| Specific county | Variable | County = selected |
| Custom filter | Variable | Use saved filter from Page 4 |
| Uploaded list | Variable | Upload CSV of account numbers |

### Section 36.3: Recent Broadcasts
| Date | Name | Channel | Audience | Sent | Delivered | Opened | By | Status |
|------|------|---------|----------|------|-----------|--------|-----|--------|
| Aug 22 | Fee reduction notice | Push + Email | All active | 134,210 | 131,526 (98%) | 42,123 (32%) | Joseph M. | ✅ Sent |
| Aug 20 | Maintenance window | Push + SMS | All users | 148,392 | 146,045 (98.4%) | — | Ops Manager | ✅ Sent |
| Aug 18 | New feature — Savings Goals | Push + Email | Active, not VIP | 125,863 | 123,346 (98%) | 38,901 (31.5%) | Product Lead | ✅ Sent |
| Aug 15 | KYC reminder | SMS | Pending KYC | 3,588 | 3,534 (98.5%) | — | Compliance | ✅ Sent |
| Aug 10 | Promo — fee discount weekend | Push + WhatsApp | Dormant 30–90d | 5,230 | 5,089 (97.3%) | 2,345 (46.1%) | Marketing | ✅ Sent |

### Section 36.4: Broadcast Analytics Dashboard
- **Delivery chart**: Bar chart — sent vs delivered vs failed per broadcast
- **Channel comparison**: Delivery rates by channel across all broadcasts
- **Open rate trends**: Line chart — open rates over time
- **Audience size trend**: How audience sizes are changing
- **Cost per broadcast**: Total cost breakdown by channel

### Section 36.5: Broadcast Approval Workflow
| Step | Actor | Action | SLA |
|------|-------|--------|-----|
| 1. Draft | Any admin (with permission) | Create broadcast | — |
| 2. Review | Platform Admin | Review message, audience, timing | <4 hours |
| 3. Approve/Deny | Platform Admin or Super Admin | Approve or request changes | <4 hours |
| 4. Schedule | System | Queue for scheduled time | — |
| 5. Send | System | Deliver to selected channels | — |
| 6. Report | System | Generate delivery report | Within 1 hour |

### Section 36.6: Broadcast Budget Tracker
| Channel | Monthly Budget | Used (MTD) | Remaining | Cost per Unit |
|---------|---------------|------------|-----------|---------------|
| SMS | KES 5.5M | KES 3.8M | KES 1.7M | KES 2.00 |
| Email | KES 800K | KES 520K | KES 280K | KES 0.50 |
| WhatsApp | KES 1.2M | KES 780K | KES 420K | KES 3.00 |
| Push | KES 0 | KES 0 | Unlimited | Free |
| In-app | KES 0 | KES 0 | Unlimited | Free |

### Section 36.7: Broadcast Templates
| Template | Channel | Purpose | Last Used |
|----------|---------|---------|-----------|
| System maintenance | Push + SMS | Notify users of planned downtime | Aug 20 |
| Fee change announcement | Push + Email | Notify of fee changes | Aug 22 |
| New feature launch | Push + Email | Announce new product feature | Aug 18 |
| Security advisory | Push + SMS + Email | Warn of security threats | Aug 5 |
| Regulatory notice | Email | Legal/regulatory communications | Jul 28 |
| Emergency outage | Push + SMS | Unplanned service disruption | Aug 18 |
| Promotional offer | Push + WhatsApp | Marketing campaign | Aug 10 |
| Re-engagement | Push + Email | Win-back dormant users | Aug 10 |

### Section 36.8: Quiet Hours Configuration
| Setting | Value |
|---------|-------|
| Quiet hours start | 22:00 EAT |
| Quiet hours end | 07:00 EAT |
| Emergency override | ✅ Allowed (requires 2FA) |
| Transactional during quiet | ✅ Allowed (always) |
| Security during quiet | ✅ Allowed (always) |
| Marketing during quiet | ❌ Blocked |
| Engagement during quiet | ❌ Blocked |
| Per-user timezone | ✅ Respected (based on last known location) |

### Section 36.9: Broadcast Compliance Checklist
| Check | Status |
|-------|--------|
| Message has opt-out info (marketing) | ✅ Auto-appended |
| Sender ID is registered | ✅ Verified |
| Audience does not include opted-out users | ✅ Auto-filtered |
| DND list respected (SMS) | ✅ Auto-filtered |
| Content approved by compliance (if regulatory) | ✅ Workflow enforced |
| No misleading claims | ✅ Admin responsibility |
| Personal data minimized in message | ✅ Uses account # not full details |
| Audit trail captured | ✅ Automatic |

---

# PAGE 37: CUSTOMER SUPPORT QUEUE

**Purpose:** Manage support tickets, agent performance, SLAs, and customer satisfaction.

### Section 37.1: Support Queue Overview
| Status | Count | Avg Wait | Oldest Ticket | SLA Compliance |
|--------|-------|----------|---------------|----------------|
| 🔴 Urgent | 3 | 2.1 min | 4 min | ✅ 100% |
| 🟡 Open | 9 | 8.4 min | 23 min | ✅ 100% |
| 🔄 In Progress | 23 | — | — | — |
| ⏸ Pending (waiting for user) | 12 | — | — | — |
| ⏸ Pending (waiting for internal) | 8 | — | — | — |
| ✅ Resolved today | 456 | — | — | ✅ 98.5% SLA |
| ❌ Escalated today | 12 | — | — | — |

### Section 37.2: Ticket List
| Ticket ID | User | Subject | Category | Priority | Status | Assigned | Created | Updated | SLA |
|-----------|------|---------|----------|----------|--------|----------|---------|---------|-----|
| T-4523 | PAY-12345 | Wrong amount debited | Transaction | 🔴 Urgent | 🔄 In Progress | Samuel K. | 14:20 | 14:25 | 12 min left |
| T-4522 | PAY-67890 | Cannot verify KYC | KYC | 🟡 Normal | 🟡 Open | Unassigned | 14:15 | 14:15 | 14 min left |
| T-4521 | PAY-89012 | Loan not disbursed | Loans | 🟡 Normal | 🔄 In Progress | Grace M. | 14:00 | 14:10 | 2 min left |
| T-4520 | PAY-11223 | Card declined | Cards | 🔴 Urgent | 🔄 In Progress | Samuel K. | 13:55 | 14:05 | Breached |
| T-4519 | PAY-44556 | Balance query | General | 🟢 Low | ✅ Resolved | Samuel K. | 13:30 | 13:35 | Met |

### Section 37.3: Ticket Detail View
| Section | Content |
|---------|---------|
| Header | Ticket ID, status badge, priority, category, created time |
| User card | Name, account #, phone, risk level, VIP status — click to go to Page 5 |
| Conversation | Full chat thread — user messages, agent responses, internal notes |
| User context sidebar | Balance, recent transactions, KYC status, active loans, open tickets |
| Related tickets | Other tickets from this user |
| Admin actions | Escalate, reassign, change priority, merge, close, request info from user |
| SLA tracker | Time remaining, SLA clock, breach warning |
| Internal notes | Private notes visible only to agents/admins |
| Macros | Quick-reply templates for common issues |

### Section 37.4: Agent Performance Dashboard
| Agent | Active | Resolved (Today) | Avg Resolution | Avg First Response | CSAT | Escalations | SLA Met |
|-------|--------|-----------------|----------------|-------------------|------|-------------|---------|
| Samuel K. | 2 | 67 | 4.2 min | 1.8 min | 4.5/5 | 3 (4.5%) | 97% |
| Agnes W. | 1 | 54 | 3.8 min | 1.5 min | 4.6/5 | 2 (3.7%) | 98% |
| John M. | 1 | 48 | 5.1 min | 2.2 min | 4.3/5 | 5 (10.4%) | 94% |
| Faith O. | 0 | 42 | 4.5 min | 1.9 min | 4.4/5 | 3 (7.1%) | 96% |
| Peter N. | 0 | 38 | 5.8 min | 2.8 min | 4.1/5 | 4 (10.5%) | 92% |

### Section 37.5: Support Categories & Routing
| Category | % of Tickets | Auto-Route To | Auto-Resolve Rate | Avg Handle Time |
|----------|-------------|---------------|------------------|-----------------|
| Transaction issues | 34% | Transaction team | 25% | 5.2 min |
| KYC/Verification | 22% | KYC team | 15% | 8.4 min |
| Loan queries | 18% | Lending support | 20% | 6.1 min |
| Card issues | 12% | Card team | 18% | 7.3 min |
| General/Balance | 8% | Any available | 45% | 2.1 min |
| App/Technical | 4% | Tech support | 30% | 9.8 min |
| Complaints | 2% | Support Lead | 0% | 15.2 min |

### Section 37.6: SLA Configuration
| Priority | First Response | Resolution | Escalation After | Business Hours |
|----------|---------------|------------|-----------------|----------------|
| 🔴 Urgent | <2 min | <15 min | 10 min without response | 24/7 |
| 🟡 High | <5 min | <30 min | 20 min without response | 24/7 |
| 🟢 Normal | <15 min | <2 hours | 1 hour without response | 8AM–10PM |
| ⚪ Low | <30 min | <4 hours | 2 hours without response | 8AM–10PM |

### Section 37.7: Support Analytics
| Metric | Today | This Week | This Month | Target | Status |
|--------|-------|-----------|------------|--------|--------|
| Total tickets | 487 | 3,234 | 13,890 | — | — |
| Avg first response | 2.1 min | 2.3 min | 2.8 min | <5 min | ✅ |
| Avg resolution time | 4.2 min | 4.5 min | 5.1 min | <10 min | ✅ |
| CSAT score | 4.4/5 | 4.3/5 | 4.3/5 | >4.0/5 | ✅ |
| First contact resolution | 68% | 65% | 62% | >70% | 🟡 |
| Escalation rate | 3.5% | 3.8% | 4.2% | <5% | ✅ |
| SLA compliance | 97% | 96% | 95% | >95% | ✅ |
| Tickets per agent/day | 97 | 647 | 2,778 | — | — |
| Cost per ticket | KES 45 | KES 48 | KES 52 | <KES 50 | 🟡 |

### Section 37.8: Ticket Volume Charts
- **Hourly volume**: Bar chart — tickets by hour of day (identify peak hours)
- **Day of week**: Bar chart — busier days
- **Category trend**: Stacked area — category breakdown over 30 days
- **Resolution time distribution**: Histogram — how long tickets take to resolve
- **Channel breakdown**: Pie — in-app, email, phone, social media

### Section 37.9: Macro & Quick Reply Management
| Macro Name | Trigger | Content | Usage (30d) | Avg Save Time |
|-----------|---------|---------|-------------|---------------|
| Balance check | "balance" / "how much" | "Your current balance is {{balance}} as of {{time}}..." | 2,345 | 3 min |
| KYC status | "kyc" / "verify" | "Your KYC status is: {{kyc_status}}. {{next_steps}}" | 1,890 | 5 min |
| TXN status | "transaction" / "where is" | "Transaction {{txn_id}} is {{status}}. {{details}}" | 1,567 | 4 min |
| Loan status | "loan" / "disbursed" | "Your loan application is {{loan_status}}. {{details}}" | 987 | 4 min |
| Card issue | "card not working" / "declined" | "Let me check your card status... {{card_info}}" | 654 | 6 min |
| Fee inquiry | "fee" / "charges" | "The fee for this transaction type is {{fee_rate}}..." | 543 | 2 min |

### Section 37.10: Escalation Management
| Ticket | Escalated To | Reason | Time Escalated | SLA | Status |
|--------|-------------|--------|---------------|-----|--------|
| T-4520 | Support Lead | Card declined repeatedly, possible fraud | 14:05 | 15 min | ⏳ 8 min left |
| T-4498 | Compliance | User requesting data deletion (GDPR-like) | 12:30 | 4 hours | ✅ Resolved |
| T-4485 | Finance | Refund request >KES 100K | 11:00 | 2 hours | ✅ Resolved |
| T-4470 | Tech Lead | App crash on specific device | 09:30 | 4 hours | ✅ Resolved |

---

# PAGE 38: TERMS & CONDITIONS

**Purpose:** Manage all legal documents — terms, policies, versions, user acceptance.

### Section 38.1: Document Library
| Document | Version | Effective Date | Status | Language | Last Reviewed |
|----------|---------|---------------|--------|----------|---------------|
| Terms of Service | v4.2 | Aug 1, 2026 | ✅ Active | EN + SW | Jul 2026 |
| Privacy Policy | v3.1 | Aug 1, 2026 | ✅ Active | EN + SW | Jul 2026 |
| Cookie Policy | v2.0 | Aug 1, 2026 | ✅ Active | EN | Jul 2026 |
| Electronic Banking Terms | v2.5 | Jun 1, 2026 | ✅ Active | EN | May 2026 |
| Loan Terms & Conditions | v3.0 | Jun 1, 2026 | ✅ Active | EN + SW | May 2026 |
| Savings Account Terms | v2.0 | Jan 1, 2026 | ✅ Active | EN + SW | Dec 2025 |
| Card Terms | v2.2 | Mar 1, 2026 | ✅ Active | EN | Feb 2026 |
| Business Account Terms | v1.5 | May 1, 2026 | ✅ Active | EN | Apr 2026 |
| Partner Agreement Template | v1.3 | Jul 1, 2026 | ✅ Active | EN | Jun 2026 |
| API Terms of Service | v1.2 | Apr 1, 2026 | ✅ Active | EN | Mar 2026 |

### Section 38.2: Document Editor
| Feature | Details |
|---------|---------|
| Rich text editor | Full formatting, tables, lists, links |
| Variable support | {{company_name}}, {{date}}, {{app_name}}, etc. |
| Version control | Save as new version, compare with previous |
| Language versions | English + Swahili side-by-side editing |
| Legal review workflow | Draft → Legal review → Approval → Publish |
| Approval required | Legal counsel + Super admin |
| Change highlighting | Highlights differences from previous version |
| Export | PDF, HTML, Word |

### Section 38.3: Version History & Comparison
| Document | v4.1 | v4.2 | Changes |
|----------|-----|-----|---------|
| Terms of Service | Effective Jun 1 | Effective Aug 1 | Section 5.3 — Updated fee disclosure; Section 12 — Added BNPL terms |
| Privacy Policy | Effective Jun 1 | Effective Aug 1 | Section 3 — Updated data retention periods; Section 7 — Added WhatsApp processing |
| Loan Terms | v2.5 (Mar 1) | v3.0 (Jun 1) | Section 4 — New interest calculation; Section 8 — Updated default penalties |

### Section 38.4: User Acceptance Tracking
| Document | Total Users | Accepted | Not Accepted | Pending | Acceptance Rate |
|----------|-----------|----------|-------------|---------|-----------------|
| Terms of Service v4.2 | 148,392 | 142,456 | 0 | 5,936 | 96.0% |
| Privacy Policy v3.1 | 148,392 | 140,234 | 0 | 8,158 | 94.5% |
| Loan Terms v3.0 | 23,400 | 22,890 | 0 | 510 | 97.8% |
| Card Terms v2.2 | 94,310 | 91,234 | 0 | 3,076 | 96.7% |

### Section 38.5: Acceptance Enforcement
| Rule | Configuration |
|------|--------------|
| Accept before first transaction | ✅ Required |
| Re-accept on major version change | ✅ Required (major = x.0) |
| Re-accept on minor version change | ❌ Not required (minor = x.y, y>0) |
| Block access if not accepted | ✅ Yes (read-only until accepted) |
| Acceptance method | Checkbox + "I Agree" button |
| Store acceptance record | ✅ Timestamp, IP, device, version accepted |
| Legal hold on acceptance data | ✅ 7 years retention |

### Section 38.6: Document Publishing Workflow
| Step | Actor | Action | SLA |
|------|-------|--------|-----|
| 1. Draft | Legal counsel | Create/update document | — |
| 2. Internal review | Legal team | Peer review | 3 business days |
| 3. External review | External counsel (if needed) | Specialist review | 5 business days |
| 4. Approval | Legal counsel + Super admin | Sign off | 1 business day |
| 5. Publish | System | Make live, trigger re-acceptance if needed | Immediate |
| 6. Notify | System | Notify users of changes (push + email) | Immediate |
| 7. Monitor | Legal | Track acceptance rate | 7 days |

### Section 38.7: Regulatory Update Tracker
| Regulation | Impact | Affected Documents | Deadline | Status |
|-----------|--------|-------------------|----------|--------|
| Data Protection Act (amendments) | Expanded user rights | Privacy Policy, Terms | Oct 2026 | ⏳ In progress |
| CBK Digital Lending Guidelines | Loan disclosure requirements | Loan Terms | Sep 2026 | ⏳ In progress |
| Finance Act 2026 | Tax changes | Terms of Service | Jan 2027 | 📋 Planned |
| ODPC Guidance on AI | Risk disclosure | Privacy Policy, Terms | Nov 2026 | 📋 Planned |

### Section 38.8: Document Access & Display
| Location | Documents Shown | User Action Required |
|----------|----------------|---------------------|
| App registration | Terms + Privacy | Must accept to register |
| App settings | All active documents | View only |
| Website footer | Terms + Privacy + Cookie | View only |
| Loan application | Loan Terms | Must accept to apply |
| Card application | Card Terms | Must accept to apply |
| Business onboarding | Business Terms + API Terms | Must accept |
| Partner onboarding | Partner Agreement | Must sign |

### Section 38.9: Legal Review Calendar
| Document | Review Frequency | Last Reviewed | Next Review | Reviewer |
|----------|-----------------|---------------|-------------|----------|
| Terms of Service | Quarterly | Jul 2026 | Oct 2026 | Legal Counsel |
| Privacy Policy | Quarterly | Jul 2026 | Oct 2026 | Legal Counsel |
| Loan Terms | Semi-annual | May 2026 | Nov 2026 | Legal Counsel |
| Card Terms | Semi-annual | Feb 2026 | Aug 2026 | Legal Counsel |
| Business Terms | Quarterly | Apr 2026 | Jul 2026 | Legal Counsel |
| API Terms | Quarterly | Mar 2026 | Jun 2026 | Legal Counsel |

---

# PAGE 39: PRIVACY POLICY

**Purpose:** Manage data privacy — policy, data subject requests, consent, DPIAs, and ODPC compliance.

### Section 39.1: Privacy Dashboard
| Metric | Value | Status |
|--------|-------|--------|
| Total data subjects | 148,392 | — |
| Active consents | 148,392 (100%) | ✅ |
| Data subject requests (30d) | 23 | — |
| DSRs pending | 3 | ⏳ |
| DSRs completed (30d) | 20 | ✅ |
| Average DSR resolution | 12.3 days | 🟡 (target <30 days) |
| DPIAs completed | 8 | ✅ |
| DPIAs pending | 2 | ⏳ |
| Data breaches reported (YTD) | 0 | ✅ |
| Privacy training completion | 94% | 🟡 |
| Cookie consents | 148,392 (100%) | ✅ |
| Marketing opt-ins | 97,234 (65.5%) | — |

### Section 39.2: Data Subject Request Management
| Request ID | User | Type | Received | Deadline | Status | Assigned | Notes |
|-----------|------|------|----------|----------|--------|----------|-------|
| DSR-023 | PAY-55667 | Access | Aug 20 | Sep 19 | 🔄 In progress | Legal | Compiling data |
| DSR-022 | PAY-88900 | Deletion | Aug 18 | Sep 17 | 🔄 In progress | Legal | Checking legal holds |
| DSR-021 | PAY-11234 | Rectification | Aug 15 | Sep 14 | 🔄 In progress | Support | Wrong phone number |
| DSR-020 | PAY-44556 | Access | Aug 10 | Sep 9 | ✅ Completed | Legal | Data package sent |
| DSR-019 | PAY-77889 | Objection | Aug 5 | Sep 4 | ✅ Completed | Legal | Marketing opt-out processed |

### Section 39.3: DSR Workflow
| Step | Action | Responsible | SLA |
|------|--------|-------------|-----|
| 1. Receive request | Log in system, acknowledge to user | Support | <3 days |
| 2. Verify identity | Confirm requester is data subject | Support | <5 days |
| 3. Assess request | Check for exemptions, legal holds | Legal | <7 days |
| 4. Process | Execute request (compile/delete/rectify) | Legal + Tech | <21 days |
| 5. Respond | Send response to data subject | Legal | <30 days |
| 6. Close | Log completion, archive | Legal | — |

### Section 39.4: Data Processing Activities Register
| Activity | Legal Basis | Data Types | Retention | Third Parties | DPO Review |
|----------|------------|------------|-----------|---------------|------------|
| Account management | Contract | Name, ID, phone, email, address | Account lifetime + 7 years | Onfido, ComplyAdvantage | ✅ Mar 2026 |
| Transaction processing | Contract | TXN details, amounts, parties | 7 years | Safaricom, Visa, Banks | ✅ Mar 2026 |
| KYC verification | Legal obligation | ID, selfie, proof of address | 7 years after account closure | Onfido | ✅ Mar 2026 |
| Fraud prevention | Legitimate interest | Device data, IP, behavior patterns | 3 years | ComplyAdvantage | ✅ Mar 2026 |
| Marketing | Consent | Name, phone, email, usage patterns | Until opt-out | Africa's Talking, SendGrid | ✅ Mar 2026 |
| AML screening | Legal obligation | Name, DOB, nationality | 7 years | ComplyAdvantage | ✅ Mar 2026 |
| Analytics | Legitimate interest | Anonymized usage data | 2 years | Datadog (anonymized) | ✅ Mar 2026 |
| Loan assessment | Contract | Financial data, credit history | Loan lifetime + 7 years | Internal | ✅ Mar 2026 |
| Customer support | Contract | Support conversations, account data | 2 years after closure | — | ✅ Mar 2026 |

### Section 39.5: Consent Management
| Consent Type | Collection Point | Opt-In Rate | Opt-Out Rate | Last Updated |
|-------------|-----------------|-------------|-------------|-------------|
| Terms of Service | Registration | 100% | 0% | Per user |
| Privacy Policy | Registration | 100% | 0% | Per user |
| Marketing push | App settings | 65.5% | 34.5% | Per user |
| Marketing email | App settings | 71.1% | 28.9% | Per user |
| Marketing SMS | App settings | 0% (off by default) | N/A | Per user |
| WhatsApp marketing | App settings | 12.3% | 87.7% | Per user |
| Location tracking | App permissions | 45.6% | 54.4% | Per user |
| Biometric login | App permissions | 67.8% | 32.2% | Per user |
| Cookie consent | Website | 100% | 0% | Per session |

### Section 39.6: Data Protection Impact Assessments
| Assessment | Status | Risk Level | Mitigations | Completed | Review Date |
|-----------|--------|------------|-------------|-----------|-------------|
| Fraud scoring engine | ✅ Complete | High | Minimization, transparency, human oversight | Aug 2026 | Feb 2027 |
| Biometric authentication | ✅ Complete | High | Consent, encryption, no raw storage | Jul 2026 | Jan 2027 |
| Marketing profiling | ✅ Complete | Medium | Opt-in only, no sensitive data | Jun 2026 | Dec 2026 |
| API partner data sharing | ✅ Complete | Medium | DPA in place, minimal data | May 2026 | Nov 2026 |
| AI/ML model training | 🟡 In progress | High | Anonymization, consent for personal data | — | — |
| Location-based services | 🟡 In progress | Medium | Granular consent, auto-disable | — | — |

### Section 39.7: Data Breach Management
| Breach ID | Date | Severity | Affected | Data Types | Detection | Notification to ODPC | Notification to Users | Resolution |
|-----------|------|----------|----------|------------|-----------|---------------------|---------------------|------------|
| No breaches YTD | — | — | — | — | — | — | — | — |

| Breach Response Plan | Details |
|---------------------|---------|
| Detection | Automated monitoring + employee reports |
| Containment | Immediate isolation of affected system |
| Assessment | DPO + Legal assess severity and scope |
| Notification to ODPC | Within 72 hours (as required by DPA) |
| Notification to users | Without undue delay if high risk to individuals |
| Documentation | Full breach register entry |
| Post-incident review | Root cause analysis, remediation plan |

### Section 39.8: Data Retention Schedule
| Data Category | Retention Period | Legal Basis | Deletion Method |
|---------------|-----------------|-------------|-----------------|
| Account data | Lifetime + 7 years | CBK regulations | Automated purge |
| Transaction data | 7 years | CBK + KRA | Automated purge |
| KYC documents | 7 years after closure | AML regulations | Automated purge |
| Support conversations | 2 years after closure | Internal policy | Automated purge |
| Marketing data | Until opt-out + 30 days | Consent | Automated purge |
| System logs | 2 years | Internal policy | Automated purge |
| Audit logs | 7 years | Compliance | Automated purge |
| Fraud case data | 7 years | AML + legal | Automated purge |
| Analytics (anonymized) | 2 years | Legitimate interest | Automated purge |
| Backup data | 90 days | Disaster recovery | Auto-rotation |

### Section 39.9: Third-Party Data Processing Agreements
| Processor | DPA Signed | Data Types | Sub-processors | DPA Review |
|----------|-----------|------------|---------------|------------|
| Onfido | ✅ | KYC documents, biometrics | AWS (hosting) | Jul 2026 |
| ComplyAdvantage | ✅ | Name, DOB, nationality | AWS | Jul 2026 |
| Africa's Talking | ✅ | Phone numbers | Telcos | Jul 2026 |
| SendGrid | ✅ | Email addresses | — | Jul 2026 |
| AWS | ✅ | All data (hosting) | Sub-processor list available | Jul 2026 |
| Datadog | ✅ | Anonymized logs/metrics | AWS | Jul 2026 |
| Safaricom | ✅ | Phone, TXN amounts | — | Jul 2026 |
| Visa/Mastercard | ✅ | Card data, TXN amounts | Processors | Jul 2026 |

---

# PAGE 40: COMPLIANCE DOCUMENTS

**Purpose:** Central repository for all compliance-related documents, policies, and certifications.

### Section 40.1: Policy Library
| Policy | Version | Owner | Last Approved | Next Review | Status |
|--------|---------|-------|---------------|-------------|--------|
| AML/CFT Policy | v4.2 | MLRO | Jul 2026 | Jan 2027 | ✅ Active |
| KYC/CDD Policy | v3.1 | MLRO | Aug 2026 | Feb 2027 | ✅ Active |
| Fraud Prevention Policy | v2.8 | Compliance Lead | Jun 2026 | Dec 2026 | ✅ Active |
| Sanctions Screening Policy | v3.1 | MLRO | Aug 2026 | Feb 2027 | ✅ Active |
| SAR Procedures | v3.0 | MLRO | May 2026 | Nov 2026 | ✅ Active |
| Data Protection Policy | v3.1 | DPO | Jul 2026 | Oct 2026 | ✅ Active |
| Information Security Policy | v4.0 | CISO | Aug 2026 | Feb 2027 | ✅ Active |
| Business Continuity Plan | v2.5 | COO | Jul 2026 | Jan 2027 | ✅ Active |
| Disaster Recovery Plan | v2.3 | CTO | Jun 2026 | Dec 2026 | ✅ Active |
| Whistleblower Policy | v1.5 | Legal | Mar 2026 | Sep 2026 | ✅ Active |
| Conflict of Interest Policy | v1.3 | Legal | Mar 2026 | Sep 2026 | ✅ Active |
| Bribery & Corruption Policy | v1.4 | Legal | Mar 2026 | Sep 2026 | ✅ Active |
| Record Retention Policy | v2.1 | Legal | Mar 2026 | Sep 2026 | ✅ Active |
| Third-Party Risk Management | v2.0 | Compliance | May 2026 | Nov 2026 | ✅ Active |
| Complaints Handling Policy | v2.2 | Support Lead | Apr 2026 | Oct 2026 | ✅ Active |

### Section 40.2: Certifications & Licenses
| Certification | Issuer | Valid Until | Status | Renewal |
|-------------|--------|-------------|--------|---------|
| CBK Digital Credit Provider License | Central Bank of Kenya | Dec 2027 | ✅ Active | 📋 Nov 2027 |
| CBK Payment Service Provider License | Central Bank of Kenya | Dec 2027 | ✅ Active | 📋 Nov 2027 |
| DPA Registration | ODPC | Permanent | ✅ Active | — |
| PCI DSS Level 1 | PCI Security Standards Council | Dec 2026 | ✅ Active | 📋 Nov 2026 |
| ISO 27001 | BSI | Mar 2028 | ✅ Active | 📋 Feb 2028 |
| ISO 27701 | BSI | Mar 2028 | ✅ Active | 📋 Feb 2028 |
| SOC 2 Type II | Deloitte | Sep 2027 | ✅ Active | 📋 Aug 2027 |

### Section 40.3: Regulatory Filing Tracker
| Filing | Authority | Frequency | Due Date | Status | Filed By | Reference |
|--------|-----------|-----------|----------|--------|----------|-----------|
| VAT Return | KRA | Monthly | 20th of following month | ✅ Aug filed | Tax team | KRA-VAT-0826 |
| Excise Duty Return | KRA | Monthly | 20th of following month | ✅ Aug filed | Tax team | KRA-EXC-0826 |
| DST Return | KRA | Monthly | 20th of following month | ✅ Aug filed | Tax team | KRA-DST-0826 |
| PAYE Return | KRA | Monthly | 9th of following month | ✅ Sep filed | HR | KRA-PAYE-0909 |
| Corporate Tax | KRA | Quarterly | Last day of 4th month | ⏳ Q2 pending | Tax team | — |
| CBK Prudential Returns | CBK | Monthly | Last day of following month | ⏳ Jul pending | Finance | — |
| AML/CFT Report | FRA | Quarterly | Last day of following quarter | ⏳ Q3 pending | MLRO | — |
| Individual Returns (Directors) | KRA | Annual | Jun 30 | ✅ Filed | Individuals | — |
| Annual Returns (Company) | BRS | Annual | Upon notice | 📋 Pending | Legal | — |
| Data Protection Audit | ODPC | Annual | Mar 31 | ✅ Filed | DPO | ODPC-2026-001 |

### Section 40.4: Compliance Training Records
| Course | Required For | Completion | Due Date | Provider | Certificate |
|--------|-------------|------------|----------|----------|-------------|
| AML Fundamentals | All staff | 94% (52/55) | Aug 2027 | Internal | PDF |
| Data Protection | All staff | 91% (50/55) | Aug 2027 | External | PDF |
| Information Security | All staff | 96% (53/55) | Aug 2027 | External | PDF |
| Fraud Awareness | All staff | 89% (49/55) | Aug 2027 | Internal | PDF |
| SAR Filing | Investigators | 100% (6/6) | Aug 2027 | Internal | PDF |
| KYC Procedures | KYC team | 100% (8/8) | Aug 2027 | Internal | PDF |
| Board Governance | Board | 100% (5/5) | Aug 2027 | External | PDF |
| Code of Conduct | All staff | 98% (54/55) | Aug 2027 | Internal | PDF |

### Section 40.5: Regulatory Examination History
| Exam | Authority | Date | Scope | Findings | Rating | Remediation |
|-------|-----------|------|--------|----------|--------|-------------|
| AML/CFT On-site | FRA | Mar 2026 | Full AML program | 2 minor findings | Satisfactory | Both closed May 2026 |
| Prudential Review | CBK | Mar 2026 | Capital, liquidity, risk | 1 minor finding | Satisfactory | Closed Jun 2026 |
| Data Protection Audit | ODPC | Mar 2026 | DPA compliance | 0 findings | Compliant | — |
| PCI DSS Assessment | QSA | Dec 2025 | Card data security | 0 findings | Compliant | — |
| SOC 2 Audit | Deloitte | Jun 2026 | Security, availability, confidentiality | 0 findings | Type II certified | — |
| ISO 27001 Surveillance | BSI | Jun 2026 | ISMS | 1 minor NCR | Maintained | Closed Jul 2026 |

### Section 40.6: Compliance Calendar (12-Month View)
| Month | Compliance Events |
|-------|-------------------|
| Sep 2026 | Corporate tax (Q2), CBK monthly returns, AML/CFT report (Q3), Card Terms review |
| Oct 2026 | VAT/Excise/DST/PAYE monthly, Terms of Service review, Privacy Policy review, ISO surveillance |
| Nov 2026 | VAT/Excise/DST/PAYE monthly, PCI DSS renewal, Partner agreement reviews, Whistleblower policy review |
| Dec 2026 | VAT/Excise/DST/PAYE monthly, CBK prudential returns, License renewal prep, Conflict of Interest review |
| Jan 2027 | VAT/Excise/DST/PAYE monthly, AML/CFT policy review, Information Security policy review, BCP review |
| Feb 2027 | VAT/Excise/DST/PAYE monthly, Corporate tax (Q4), KYC/CDD policy review, Sanctions policy review |
| Mar 2027 | VAT/Excise/DST/PAYE monthly, Data Protection Audit, SAR procedures review, Annual return filing |

### Section 40.7: Compliance Incident Register
| Incident | Date | Type | Description | Impact | Resolution | Regulatory Notification |
|----------|------|------|-------------|--------|------------|----------------------|
| None YTD | — | — | No compliance incidents in 2026 | — | — | — |

### Section 40.8: Board & Committee Meeting Tracker
| Committee | Frequency | Last Meeting | Next Meeting | Attendance | Key Decisions |
|-----------|-----------|-------------|-------------|------------|---------------|
| Board of Directors | Quarterly | Aug 1, 2026 | Nov 2026 | 5/5 | Q2 results, Series B use |
| Risk Committee | Quarterly | Jul 28, 2026 | Oct 2026 | 4/4 | Risk appetite update |
| Audit Committee | Quarterly | Jul 28, 2026 | Oct 2026 | 3/3 | Approved auditors |
| AML Committee | Monthly | Aug 15, 2026 | Sep 15, 2026 | 4/4 | SAR filings review |
| Technology Committee | Monthly | Aug 10, 2026 | Sep 10, 2026 | 3/3 | Security roadmap |

---

# PAGE 41: DOCUMENT TEMPLATES

**Purpose:** Manage reusable document templates for internal and external communications.

### Section 41.1: Template Library
| Template | Category | Format | Last Modified | Used (30d) | Owner |
|----------|----------|--------|---------------|------------|-------|
| User warning letter | User Communication | PDF | Aug 2026 | 23 | Compliance |
| Account closure notice | User Communication | PDF | Jul 2026 | 18 | Operations |
| Fee change notification | User Communication | PDF + Email | Aug 2026 | 1 (broadcast) | Finance |
| Loan default notice | Lending | PDF | Jun 2026 | 45 | Lending |
| Loan demand letter | Lending | PDF | Jun 2026 | 12 | Legal |
| Partner agreement | Partnerships | Word + PDF | Jul 2026 | 2 | Legal |
| NDA | Legal | Word + PDF | May 2026 | 5 | Legal |
| Employee offer letter | HR | Word + PDF | Apr 2026 | 3 | HR |
| Board meeting minutes | Governance | Word + PDF | Aug 2026 | 1 | Company Secretary |
| Regulatory response letter | Compliance | PDF | Jul 2026 | 3 | Legal |
| Data breach notification | Privacy | PDF + Email | Mar 2026 | 0 (no breach) | DPO |
| Refund confirmation | User Communication | PDF | Aug 2026 | 34 | Finance |

### Section 41.2: Template Editor
| Feature | Details |
|---------|---------|
| Rich text editor | Full formatting, headers, tables, lists |
| Variable support | {{company_name}}, {{user_name}}, {{account#}}, {{date}}, {{amount}}, etc. |
| Conditional sections | Show/hide sections based on variables |
| Multiple formats | Generate PDF, Word, HTML from same template |
| Preview | Render with sample data before saving |
| Version control | Save versions, compare, rollback |
| Approval workflow | Draft → Review → Approve → Publish |
| Access control | Who can create, edit, approve, use each template |
| Branding | Auto-apply company header, footer, logo, colors |

### Section 41.3: Template Variable Catalog
| Variable | Type | Available In | Example Value |
|----------|------|-------------|---------------|
| `{{company_name}}` | System | All | PayMo Digital Bank Ltd |
| `{{company_address}}` | System | All | Westlands, Nairobi |
| `{{user_name}}` | User | User templates | Joseph Kamau Mwangi |
| `{{user_account}}` | User | User templates | PAY-12345-6789 |
| `{{user_phone}}` | User | User templates | +254 712 345 678 |
| `{{user_email}}` | User | User templates | joseph@example.com |
| `{{user_address}}` | User | User templates | 123 Kenyatta Ave, Nairobi |
| `{{user_kyc_tier}}` | User | User templates | Tier 3 |
| `{{balance}}` | Financial | Financial templates | KES 45,230 |
| `{{amount}}` | Financial | Financial templates | KES 15,000 |
| `{{fee}}` | Financial | Financial templates | KES 225 |
| `{{date}}` | System | All | August 22, 2026 |
| `{{reference_number}}` | System | All | REF-2026-0822-001 |
| `{{signatory_name}}` | System | All | Joseph Mwangi, CEO |
| `{{signatory_title}}` | System | All | Chief Executive Officer |

### Section 41.4: Template Usage Analytics
| Template | Used (30d) | Generated (PDF) | Generated (Email) | Generated (Letter) | Avg Time to Generate |
|----------|-----------|----------------|-------------------|-------------------|---------------------|
| Loan default notice | 45 | 45 | 0 | 0 | 3.2s |
| Refund confirmation | 34 | 34 | 34 | 0 | 1.8s |
| User warning letter | 23 | 23 | 0 | 23 | 2.1s |
| Account closure notice | 18 | 18 | 18 | 0 | 2.5s |
| Fee change notification | 1 | 1 | 148,392 | 0 | 45s (bulk) |
| Board meeting minutes | 1 | 1 | 0 | 1 | 5min (manual) |

### Section 41.5: Template Approval Workflow
| Step | Actor | Action | SLA |
|------|-------|--------|-----|
| 1. Create/Edit | Template owner | Draft template | — |
| 2. Review | Reviewer (Legal for external, Manager for internal) | Check content, branding, variables | 2 business days |
| 3. Approve/Deny | Approver | Sign off or request changes | 1 business day |
| 4. Publish | System | Make available for use | Immediate |
| 5. Archive | System | Move old version to archive when replaced | Automatic |

### Section 41.6: Template Categories
| Category | Count | Examples | Access Level |
|----------|-------|---------|-------------|
| User Communication | 8 | Warning, closure, fee change, refund | Compliance + Operations |
| Lending | 5 | Default notice, demand letter, disbursement confirmation | Lending + Legal |
| Legal | 6 | NDA, partner agreement, regulatory response | Legal only |
| HR | 4 | Offer letter, termination, appraisal, policy ack | HR only |
| Governance | 3 | Board minutes, resolution, shareholder notice | Company Secretary |
| Compliance | 4 | Breach notification, DSR response, audit response | Compliance + Legal |
| Finance | 3 | Invoice, receipt, financial statement | Finance |
| Marketing | 5 | Press release, social media, blog post | Marketing |

### Section 41.7: Bulk Generation
| Feature | Details |
|---------|---------|
| Purpose | Generate documents for multiple users at once |
| Use cases | Monthly statements, fee change notices, year-end summaries |
| Input | User segment or uploaded list |
| Output | Individual PDFs + option to email to each user |
| Throttling | Max 1,000/minute to avoid system overload |
| Tracking | Generation progress, success/fail counts |
| Audit | Full log of who generated what for whom |

### Section 41.8: Template Version Control
| Template | v1 | v2 | v3 | Current |
|----------|----|----|----|---------|
| Loan default notice | Mar 2026 | Jun 2026 | — | v2 |
| Fee change notification | Jan 2026 | Apr 2026 | Aug 2026 | v3 |
| User warning letter | Jan 2026 | — | — | v1 |
| Partner agreement | Jan 2024 | Jan 2025 | Jul 2026 | v3 |

---

# PAGE 42: ANALYTICS & REPORTING

**Purpose:** Comprehensive analytics hub — custom reports, dashboards, data exploration, and scheduled reporting.

### Section 42.1: Analytics Dashboard Overview
| Metric | Value | Period |
|--------|-------|--------|
| Saved dashboards | 23 | — |
| Scheduled reports | 45 | — |
| Ad-hoc queries (30d) | 234 | By admins |
| Data exports (30d) | 89 | Total rows: 45M |
| Report generation time (avg) | 12.3 seconds | — |
| Most viewed dashboard | "Executive Summary" | 234 views/month |
| Most exported report | "Transaction Ledger" | 45 exports/month |

### Section 42.2: Pre-Built Dashboards
| Dashboard | Owner | Viewers | Refresh | Key Metrics |
|-----------|-------|---------|---------|-------------|
| Executive Summary | CEO | Board + C-suite | Daily | Revenue, users, growth, profit |
| Financial Overview | CFO | Finance team | Daily | P&L, balance sheet, cash flow, margins |
| User Growth | Growth Lead | Product + Marketing | Daily | Registrations, activation, retention, churn |
| Transaction Analytics | Ops Manager | Operations | Real-time | Volume, count, channels, success rates |
| Fraud & Risk | Compliance Lead | Compliance + Fraud | Real-time | Alerts, losses, patterns, SARs |
| Support Performance | Support Lead | Support team | Hourly | Tickets, CSAT, SLA, agent performance |
| Partner Performance | Partnerships | Partnerships + Finance | Daily | Revenue, SLA, settlements, health |
| System Health | CTO | Engineering | Real-time | Uptime, latency, errors, resources |
| Lending Portfolio | Lending Lead | Lending + Finance | Daily | Disbursements, repayments, NPL, yield |
| Marketing Campaigns | Marketing Lead | Marketing | Daily | Reach, conversion, ROAS, channel mix |

### Section 42.3: Custom Dashboard Builder
| Feature | Details |
|---------|---------|
| Widgets available | KPI card, line chart, bar chart, pie/donut, area, scatter, heatmap, table, funnel, map |
| Data sources | Transactions, Users, Finance, Fraud, Partners, System, Support, Loans, Cards |
| Filters | Date range, segment, channel, status, and all entity-level filters |
| Calculations | Sum, avg, count, median, percentile, growth rate, YoY, MoM, cumulative, custom formula |
| Comparisons | Current vs previous period, actual vs target, cohort vs cohort |
| Layout | Drag-and-drop grid, resizable widgets |
| Save & share | Save as personal or team dashboard, share with specific users/roles |
| Scheduled export | Auto-export as PDF/Excel at specified frequency |
| Refresh interval | Real-time, 1min, 5min, 15min, 1hour, daily, manual |

### Section 42.4: Report Builder (Advanced)
| Feature | Details |
|---------|---------|
| Data selection | Join multiple data sources, select columns |
| Filtering | Multi-condition filters with AND/OR logic |
| Grouping | Group by any dimension (date, user, channel, etc.) |
| Sorting | Multi-column sort |
| Calculated fields | Custom formulas using any field |
| Pivot tables | Dynamic pivot with draggable rows/columns |
| Charting | Auto-generate charts from report data |
| Formatting | Conditional formatting, number formats, colors |
| Export | CSV, Excel, PDF, PowerPoint, JSON |
| Schedule | Save as recurring report with email distribution |

### Section 42.5: Scheduled Reports
| Report Name | Frequency | Format | Recipients | Next Run | Last Status |
|-------------|-----------|--------|-----------|----------|-------------|
| Daily Executive Summary | Daily 7AM | PDF + Email | CEO, CFO, COO | Tomorrow 7AM | ✅ Success |
| Weekly Growth Report | Monday 8AM | PDF | Product, Marketing, Growth | Monday 8AM | ✅ Success |
| Weekly Fraud Report | Monday 9AM | PDF | Compliance, MLRO, CEO | Monday 9AM | ✅ Success |
| Monthly Financial Pack | 1st of month | Excel + PDF | CFO, Board, Investors | Sep 1 | ⏳ Pending |
| Monthly Compliance Pack | 5th of month | PDF | MLRO, Legal, Board | Sep 5 | ⏳ Pending |
| Monthly Partner Report | 5th of month | PDF | Each partner (individual) | Sep 5 | ⏳ Pending |
| Quarterly Investor Report | 30 days post-quarter | PDF + PPT | All investors | Oct 30 | ⏳ Pending |
| Daily Reconciliation | Daily 6AM | Excel | Finance team | Tomorrow 6AM | ✅ Success |
| Hourly Transaction Summary | Hourly | Dashboard | Ops team | Continuous | ✅ Success |

### Section 42.6: Data Exploration (SQL Query Interface)
| Feature | Details |
|---------|---------|
| Query editor | SQL editor with autocomplete, syntax highlighting |
| Available schemas | Read-only replicas of: transactions, users, finance, fraud, partners, system |
| Query templates | Pre-written common queries to customize |
| Results preview | First 100 rows preview before full execution |
| Export | Full results as CSV, Excel, JSON |
| Save queries | Save with name, share with team |
| Query history | All past queries with results link |
| Execution limits | Max 10 min runtime, max 10M rows result |
| Access control | Based on admin role permissions (analysts = read-only) |
| Cost tracking | Query cost in compute units, monthly budget |

### Section 42.7: Cohort Analysis Tools
| Analysis Type | Description | Dimensions | Metrics |
|---------------|-------------|------------|---------|
| Retention cohort | User retention by signup month | Signup month, week | Retention %, active count |
| Revenue cohort | Revenue by user signup cohort | Signup month | LTV, cumulative revenue |
| Channel cohort | Performance by acquisition channel | Channel, date | Retention, revenue, CAC recovery |
| Product cohort | Feature adoption by cohort | Feature, cohort | Adoption %, usage frequency |
| Loan cohort | Repayment behavior by disbursement month | Month, risk tier | Repayment rate, NPL rate |

### Section 42.8: Funnel Analysis Tools
| Funnel | Steps | Conversion Rate | Drop-off |
|--------|-------|-----------------|----------|
| User onboarding | Download → Register → KYC → First TXN | 67.8% | 32.2% |
| Loan application | Eligible → Apply → Approved → Disbursed | 45.2% | 54.8% |
| Card issuance | Eligible → Apply → Approved → Delivered → Activated | 62.3% | 37.7% |
| VIP upgrade | Eligible → Invited → Accepted → Active | 34.5% | 65.5% |
| Support resolution | Ticket created → First response → Resolved | 92.1% | 7.9% |

### Section 42.9: Predictive Analytics
| Model | Type | Output | Accuracy | Used By | Status |
|-------|------|--------|----------|---------|--------|
| Churn prediction | Classification | Churn probability per user | 82% | Marketing, Growth | ✅ Production |
| LTV prediction | Regression | Predicted lifetime value | 78% | Finance, Marketing | ✅ Production |
| Fraud prediction | Anomaly detection | Real-time fraud score | 94% recall | Fraud engine | ✅ Production |
| Loan default prediction | Classification | Default probability | 85% | Lending | ✅ Production |
| Next-best-action | Recommendation | Best marketing action per user | 72% | Marketing | 🟡 Beta |
| Demand forecasting | Time series | Predicted transaction volume | 88% | Operations, Finance | ✅ Production |
| Support volume forecasting | Time series | Predicted ticket count | 91% | Support | ✅ Production |

### Section 42.10: Data Governance
| Policy | Details |
|---------|---------|
| Data access control | Role-based, least privilege |
| Data quality | Automated checks for completeness, accuracy, consistency |
| Data lineage | Tracked for all derived fields and models |
| Data catalog | Searchable catalog of all available fields and tables |
| PII handling | Automatic masking for non-privileged roles |
| Query audit | All queries logged with admin, timestamp, rows accessed |
| Anonymization | Available for analytics that don't need PII |
| Data retention | Per retention schedule (Page 39) |
| Backup | Real-time replication + daily snapshot |

### Section 42.11: Export & Data Request Management
| Request Type | Process | SLA | Approval |
|-------------|---------|-----|----------|
| Standard report (pre-built) | Instant | <1 min | Role-based |
| Custom report (report builder) | Queued | <5 min | Role-based |
| Ad-hoc SQL query | Queued | <10 min | Role-based |
| Bulk data export (>1M rows) | Async | <1 hour | Manager + 2FA |
| Full database export | Async | <4 hours | Super admin + 2FA |
| Regulatory data request | Async | Per deadline | Compliance + Legal |
| User data export (DSR) | Async | <30 days | Legal (GDPR/DPA) |

### Section 42.12: Analytics Performance
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Dashboard load time | <2 seconds | <3 seconds | ✅ |
| Report generation (standard) | <5 seconds | <10 seconds | ✅ |
| Report generation (complex) | <30 seconds | <60 seconds | ✅ |
| SQL query (typical) | <5 seconds | <10 seconds | ✅ |
| Data export (100K rows) | <15 seconds | <30 seconds | ✅ |
| Data freshness (dashboard) | <5 minutes | <15 minutes | ✅ |
| Data freshness (real-time) | <10 seconds | <30 seconds | ✅ |
| Query success rate | 99.2% | >99% | ✅ |
| Scheduled report delivery on-time | 99.5% | >99% | ✅ |

---

# APPENDIX A: GLOBAL KEYBOARD SHORTCUTS

| Shortcut | Action | Context |
|----------|--------|---------|
| `Ctrl/Cmd + K` | Quick search (users, TXNs, pages) | Global |
| `Ctrl/Cmd + /` | Show all shortcuts | Global |
| `Ctrl/Cmd + D` | Go to Dashboard | Global |
| `Ctrl/Cmd + U` | Go to User Directory | Global |
| `Ctrl/Cmd + T` | Go to Transaction Ledger | Global |
| `Ctrl/Cmd + F` | Focus search in current page | Page-specific |
| `Ctrl/Cmd + E` | Export current view | Page-specific |
| `Escape` | Close modal/drawer | Global |
| `Ctrl/Cmd + Shift + L` | Lock session (immediate) | Global |

---

# APPENDIX B: DATA DICTIONARY (KEY TABLES)

| Table | Records | Growth | Partition | Primary Key |
|-------|---------|--------|-----------|-------------|
| users | 148,392 | +8K/month | By registration date | user_id |
| transactions | 1.2B | +15M/month | By created_at (daily) | transaction_id |
| accounts | 148,392 | +8K/month | — | account_id |
| kyc_records | 148,392 | +8K/month | By status | kyc_id |
| cards | 117,490 | +5K/month | By status | card_id |
| loans | 23,400 | +2K/month | By status | loan_id |
| fraud_alerts | 12,345 | +300/month | By created_at | alert_id |
| audit_log | 2.3B | +80M/month | By created_at (daily) | log_id |
| notifications | 500M | +20M/month | By created_at (daily) | notification_id |
| settlements | 45,678 | +2K/month | By date | settlement_id |

---

# APPENDIX C: ERROR CODES REFERENCE

| Code | Category | Description | User-Facing Message |
|------|----------|-------------|-------------------|
| INSF_001 | Transaction | Insufficient balance | "You don't have enough balance for this transaction" |
| LIM_001 | Transaction | Daily limit exceeded | "You've reached your daily transaction limit. Try again tomorrow" |
| LIM_002 | Transaction | Per-transaction limit exceeded | "This amount exceeds the maximum allowed per transaction" |
| FROZ_001 | Account | Account frozen | "Your account has been temporarily frozen. Contact support" |
| SUSP_001 | Account | Account suspended | "Your account has been suspended. Contact support" |
| KYC_001 | KYC | KYC not complete | "Please complete your identity verification to continue" |
| KYC_002 | KYC | KYC rejected | "Your verification was not successful. Please resubmit" |
| AUTH_001 | Auth | Invalid credentials | "Invalid email or password" |
| AUTH_002 | Auth | Account locked | "Too many failed attempts. Please try again in 30 minutes" |
| AUTH_003 | Auth | 2FA required | "Please enter your 2FA code" |
| FRAUD_001 | Fraud | Transaction blocked | "This transaction was declined for security reasons" |
| FRAUD_002 | Fraud | Account frozen (fraud) | "Your account has been frozen pending security review" |
| PARTNER_001 | Partner | Partner unavailable | "This service is temporarily unavailable. Please try again" |
| CARD_001 | Card | Card declined | "Your card was declined. Contact your bank" |
| CARD_002 | Card | Card expired | "Your card has expired. Request a new one in the app" |
| SYS_001 | System | System error | "Something went wrong. Please try again" |
| SYS_002 | System | Maintenance mode | "We're performing scheduled maintenance. Back shortly" |
| NET_001 | Network | Network error | "Please check your internet connection and try again" |
| TIMEOUT_001 | Timeout | Request timeout | "The request took too long. Please try again" |

---

# APPENDIX D: GLOSSARY

| Term | Definition |
|------|-----------|
| **BAAS** | Banking as a Service — providing banking infrastructure via API |
| **CDD** | Customer Due Diligence — verification process based on risk level |
| **DPA** | Data Processing Agreement — contract between data controller and processor |
| **DPIA** | Data Protection Impact Assessment — risk assessment for data processing |
| **DSR** | Data Subject Request — user request to access/delete/rectify their data |
| **EDD** | Enhanced Due Diligence — additional verification for high-risk users |
| **FATF** | Financial Action Task Force — international AML standard setter |
| **MLRO** | Money Laundering Reporting Officer — designated compliance officer |
| **PEP** | Politically Exposed Person — individual with prominent public function |
| **SAR** | Suspicious Activity Report — report filed with financial intelligence unit |
| **STK** | Sim Toolkit — USSD-based M-Pesa push payment method |
| **TOTP** | Time-based One-Time Password — 2FA code that changes every 30 seconds |
| **WebAuthn** | Web Authentication API — FIDO2 standard for passwordless auth |

---

# APPENDIX E: DOCUMENT REVISION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| v1.0 | Jan 2024 | Joseph Mwangi | Initial 42-page layout |
| v1.5 | Jun 2024 | Joseph Mwangi | Added fraud sections, expanded KYC |
| v2.0 | Aug 2026 | Joseph Mwangi | Comprehensive expansion — all pages to 8+ sections, added appendices |




# PAGE 43: API HEALTH & INTERCONNECTION MONITOR

**Purpose:** Real-time monitoring, management, and health tracking of all interconnected APIs, callback URLs, bank integrations (PesaLink, i&M Bank, KCB, Equity, etc.), card networks (Visa, Mastercard, PayPal), mobile money gateways, and third-party service endpoints — with dependency mapping, circuit breaker status, and operational observability.

---

### Section 43.1: API Health Command Center (Hero Dashboard)

| API Ecosystem | Total Endpoints | Healthy | Degraded | Down | Unknown | Overall Health |
|---------------|----------------|---------|----------|------|---------|----------------|
| **All APIs** | **187** | **172** | **8** | **0** | **7** | **🟢 97.1%** |

| Category | Endpoints | Healthy | Degraded | Down | Health Score |
|----------|-----------|---------|----------|------|-------------|
| Mobile Money (M-Pesa) | 12 | 12 | 0 | 0 | 🟢 100% |
| Bank APIs — PesaLink | 8 | 7 | 1 | 0 | 🟡 95.2% |
| Bank APIs — Direct | 24 | 22 | 2 | 0 | 🟡 95.1% |
| Card Networks — Visa | 14 | 14 | 0 | 0 | 🟢 100% |
| Card Networks — Mastercard | 12 | 12 | 0 | 0 | 🟢 100% |
| Card Networks — PayPal | 6 | 6 | 0 | 0 | 🟢 100% |
| Card Networks — UnionPay | 4 | 3 | 0 | 1 | 🟠 75.0% |
| KYC/Identity (Onfido) | 8 | 8 | 0 | 0 | 🟢 100% |
| AML/Screening (ComplyAdvantage) | 6 | 6 | 0 | 0 | 🟢 100% |
| Communications (SMS/Email/Push) | 18 | 17 | 1 | 0 | 🟡 98.2% |
| Utility Providers | 34 | 32 | 2 | 0 | 🟡 97.6% |
| Government/Tax (KRA iTAX) | 6 | 6 | 0 | 0 | 🟢 100% |
| Insurance Partners | 8 | 8 | 0 | 0 | 🟢 100% |
| Lending Partners | 6 | 5 | 1 | 0 | 🟡 96.2% |
| Internal Microservices | 21 | 16 | 2 | 0 | 🟡 94.8% |
| **Totals** | **187** | **172** | **8** | **0** | **—** |

**Last full ecosystem scan:** 14:32:05 EAT (auto-refreshes every 15 seconds)

---

### Section 43.2: Mobile Money API Health (M-Pesa / Safaricom)

#### 43.2.1: M-Pesa Endpoint Status Grid

| Endpoint | Purpose | Method | URL (Masked) | Health | Latency (p95) | Error Rate | Last Check | Uptime (30d) | Circuit Breaker |
|----------|---------|--------|-------------|--------|---------------|------------|------------|-------------|-----------------|
| STK Push | Initiate payment | POST | `https://sandbox.safaricom.../stk/push` | 🟢 Up | 3.2s | 0.08% | 14:32:01 | 99.98% | ✅ Closed |
| STK Query | Check STK status | GET | `https://sandbox.safaricom.../stk/query` | 🟢 Up | 1.1s | 0.02% | 14:32:00 | 99.99% | ✅ Closed |
| C2B Register | Register validation URL | POST | `https://sandbox.safaricom.../c2b/register` | 🟢 Up | 0.8s | 0.00% | 14:31:55 | 100% | ✅ Closed |
| C2B Validate | Validate incoming payment | POST | `https://api.paymo.co.ke/callback/c2b/validate` | 🟢 Up | 0.05s | 0.00% | 14:32:02 | 100% | ✅ Closed |
| C2B Confirm | Confirm incoming payment | POST | `https://api.paymo.co.ke/callback/c2b/confirm` | 🟢 Up | 0.04s | 0.00% | 14:32:01 | 100% | ✅ Closed |
| B2C | Disbursement/cashout | POST | `https://sandbox.safaricom.../b2c` | 🟢 Up | 5.1s | 0.12% | 14:31:58 | 99.97% | ✅ Closed |
| B2B | Business-to-business | POST | `https://sandbox.safaricom.../b2b` | 🟢 Up | 4.5s | 0.10% | 14:31:55 | 99.98% | ✅ Closed |
| Account Balance | Check float balance | GET | `https://sandbox.safaricom.../account/balance` | 🟢 Up | 2.3s | 0.05% | 14:31:50 | 99.99% | ✅ Closed |
| Transaction Status | Check TXN status | GET | `https://sandbox.safaricom.../transaction/status` | 🟢 Up | 1.8s | 0.03% | 14:31:52 | 99.99% | ✅ Closed |
| Reversal | Reverse a transaction | POST | `https://sandbox.safaricom.../reversal` | 🟢 Up | 4.2s | 0.15% | 14:31:48 | 99.96% | ✅ Closed |
| Tax Remittance | Remit excise duty | POST | `https://sandbox.safaricom.../tax` | 🟢 Up | 6.8s | 0.20% | 14:31:45 | 99.95% | ✅ Closed |
| B2C Result Callback | Receive disbursement result | POST | `https://api.paymo.co.ke/callback/b2c/result` | 🟢 Up | 0.03s | 0.00% | 14:32:03 | 100% | ✅ Closed |

#### 43.2.2: M-Pesa Real-Time Metrics

| Metric | Current (1 min) | 5 min Avg | 1 hour Avg | Alert Threshold | Status |
|--------|-----------------|-----------|------------|-----------------|--------|
| STK Push throughput | 234/min | 228/min | 220/min | <100/min | 🟢 |
| B2C throughput | 45/min | 42/min | 40/min | <20/min | 🟢 |
| Callback delay (avg) | 1.2s | 1.5s | 2.1s | >10s | 🟢 |
| Pending callbacks | 12 | 8 | 5 | >50 | 🟢 |
| Failed STK (timeout) | 3 | 12 | 89 | >20/hour | 🟢 |
| STK cancellation rate | 8.2% | 7.8% | 7.5% | >15% | 🟢 |

#### 43.2.3: M-Pesa Callback Health

| Callback Type | URL | Success Rate | Avg Response Time | Timeout Rate | Last Received |
|---------------|-----|-------------|-------------------|-------------|---------------|
| STK Result | `/callback/mpesa/stk/result` | 99.98% | 45ms | 0.01% | 14:32:01 |
| B2C Result | `/callback/mpesa/b2c/result` | 99.97% | 38ms | 0.02% | 14:32:03 |
| C2B Validation | `/callback/mpesa/c2b/validate` | 100% | 52ms | 0.00% | 14:31:58 |
| C2B Confirmation | `/callback/mpesa/c2b/confirm` | 100% | 41ms | 0.00% | 14:31:58 |
| B2B Result | `/callback/mpesa/b2b/result` | 99.99% | 35ms | 0.01% | 14:31:55 |
| Reversal Result | `/callback/mpesa/reversal/result` | 99.96% | 48ms | 0.03% | 14:31:48 |
| Tax Result | `/callback/mpesa/tax/result` | 99.95% | 55ms | 0.04% | 14:31:45 |

---

### Section 43.3: Bank API Health — PesaLink (IPS Kenya)

#### 43.3.1: PesaLink Endpoint Status

| Endpoint | Purpose | Method | Health | Latency (p95) | Error Rate | Uptime (30d) | Notes |
|----------|---------|--------|--------|---------------|------------|-------------|-------|
| PesaLink Transfer | Send money via PesaLink | POST | 🟢 Up | 8.5s | 0.25% | 99.92% | All banks |
| PesaLink Status | Check transfer status | GET | 🟢 Up | 3.2s | 0.10% | 99.97% | — |
| PesaLink Account Validate | Validate recipient account | POST | 🟡 Degraded | 12.4s | 0.85% | 99.80% | Slow response from IPS |
| PesaLink Bank Lookup | Search bank by code/name | GET | 🟢 Up | 1.5s | 0.05% | 99.99% | — |
| PesaLink Balance | Check PesaLink balance | GET | 🟢 Up | 2.8s | 0.08% | 99.98% | — |
| PesaLink Reverse | Reverse PesaLink transfer | POST | 🟢 Up | 6.2s | 0.20% | 99.95% | — |
| PesaLink Callback (Receive) | Receive incoming PesaLink | POST | 🟢 Up | 0.04s | 0.00% | 100% | Our callback |
| PesaLink Settlement | Daily settlement report | GET | 🟢 Up | 4.5s | 0.15% | 99.96% | — |

#### 43.3.2: PesaLink Connected Banks Status

| Bank | Bank Code | Transfer Status | Validation Status | Avg Latency | Success Rate | Last TXN |
|------|-----------|----------------|-------------------|-------------|-------------|----------|
| KCB Bank | 01 | 🟢 Up | 🟢 Up | 6.2s | 99.5% | 14:31:50 |
| Equity Bank | 02 | 🟢 Up | 🟢 Up | 7.1s | 99.3% | 14:31:42 |
| Cooperative Bank | 03 | 🟢 Up | 🟢 Up | 8.4s | 99.1% | 14:31:30 |
| NCBA Bank | 04 | 🟢 Up | 🟢 Up | 5.8s | 99.6% | 14:31:25 |
| Absa Bank | 05 | 🟢 Up | 🟢 Up | 7.5s | 99.2% | 14:31:18 |
| Stanbic Bank | 06 | 🟢 Up | 🟢 Up | 9.1s | 99.0% | 14:31:10 |
| SBM Bank | 07 | 🟢 Up | 🟢 Up | 8.8s | 99.1% | 14:31:05 |
| National Bank | 08 | 🟡 Slow | 🟡 Slow | 15.2s | 97.8% | 14:30:55 |
| I&M Bank | 09 | 🟢 Up | 🟢 Up | 7.3s | 99.4% | 14:30:48 |
| KCB Islamic | 10 | 🟢 Up | 🟢 Up | 6.5s | 99.5% | 14:30:40 |
| Gulf African Bank | 11 | 🟢 Up | 🟢 Up | 8.2s | 99.0% | 14:30:35 |
| Premier Bank | 12 | 🟢 Up | 🟢 Up | 9.5s | 98.8% | 14:30:28 |
| **AVERAGE** | — | — | — | **7.9s** | **99.2%** | — |

---

### Section 43.4: Bank API Health — Direct Bank Integrations

#### 43.4.1: i&M Bank API

| Endpoint | Purpose | Method | URL (Masked) | Health | Latency | Error Rate | Uptime | Circuit Breaker |
|----------|---------|--------|-------------|--------|----------|------------|--------|-----------------|
| Account Lookup | Verify account exists | GET | `https://api.imbank.../accounts/lookup` | 🟢 Up | 2.1s | 0.12% | 99.95% | ✅ Closed |
| Balance Inquiry | Check account balance | GET | `https://api.imbank.../accounts/balance` | 🟢 Up | 1.8s | 0.08% | 99.97% | ✅ Closed |
| Fund Transfer | Transfer to i&M account | POST | `https://api.imbank.../transfers` | 🟢 Up | 8.5s | 0.22% | 99.92% | ✅ Closed |
| Transaction Status | Check transfer status | GET | `https://api.imbank.../transfers/status` | 🟢 Up | 2.4s | 0.05% | 99.98% | ✅ Closed |
| Statement Fetch | Get mini statement | GET | `https://api.imbank.../accounts/statement` | 🟢 Up | 3.2s | 0.15% | 99.94% | ✅ Closed |
| RTGS Initiation | Initiate RTGS transfer | POST | `https://api.imbank.../rtgs` | 🟢 Up | 15.2s | 0.35% | 99.88% | ✅ Closed |
| RTGS Status | Check RTGS status | GET | `https://api.imbank.../rtgs/status` | 🟢 Up | 3.8s | 0.10% | 99.96% | ✅ Closed |
| EFT Initiation | Initiate EFT transfer | POST | `https://api.imbank.../eft` | 🟢 Up | 12.1s | 0.28% | 99.90% | ✅ Closed |
| Callback (Receive) | Receive transfer notifications | POST | `https://api.paymo.co.ke/callback/bank/im` | 🟢 Up | 0.03s | 0.00% | 100% | ✅ Closed |

#### 43.4.2: KCB Bank API

| Endpoint | Purpose | Method | Health | Latency | Error Rate | Uptime | Circuit Breaker |
|----------|---------|--------|--------|----------|------------|--------|-----------------|
| Account Validation | Validate KCB account | POST | 🟢 Up | 1.9s | 0.15% | 99.94% | ✅ Closed |
| PesaLink via KCB | Transfer via KCB PesaLink | POST | 🟢 Up | 7.8s | 0.20% | 99.93% | ✅ Closed |
| RTGS via KCB | RTGS through KCB | POST | 🟢 Up | 18.5s | 0.30% | 99.90% | ✅ Closed |
| EFT via KCB | EFT through KCB | POST | 🟡 Degraded | 25.4s | 0.55% | 99.82% | ✅ Closed |
| Float Management | Top up KCB float account | POST | 🟢 Up | 5.2s | 0.10% | 99.96% | ✅ Closed |
| Callback (Receive) | Receive KCB notifications | POST | 🟢 Up | 0.04s | 0.00% | 100% | ✅ Closed |

#### 43.4.3: Equity Bank API

| Endpoint | Purpose | Method | Health | Latency | Error Rate | Uptime | Circuit Breaker |
|----------|---------|--------|--------|----------|------------|--------|-----------------|
| Account Validation | Validate Equity account | POST | 🟢 Up | 2.0s | 0.12% | 99.95% | ✅ Closed |
| EFT Transfer | EFT via Equity | POST | 🟢 Up | 14.2s | 0.25% | 99.91% | ✅ Closed |
| RTGS Transfer | RTGS via Equity | POST | 🟢 Up | 16.8s | 0.28% | 99.90% | ✅ Closed |
| Mobile Loan Repay | Collect loan payment | POST | 🟢 Up | 3.5s | 0.10% | 99.96% | ✅ Closed |
| Callback (Receive) | Receive Equity notifications | POST | 🟢 Up | 0.03s | 0.00% | 100% | ✅ Closed |

#### 43.4.4: Other Bank APIs (Summary)

| Bank | Endpoints | Healthy | Degraded | Down | Avg Latency | Success Rate | Primary Use |
|------|-----------|---------|----------|------|-------------|-------------|-------------|
| NCBA Bank | 6 | 6 | 0 | 0 | 6.8s | 99.4% | RTGS + EFT |
| Co-operative Bank | 6 | 6 | 0 | 0 | 7.2s | 99.3% | RTGS + EFT |
| Absa Bank | 5 | 5 | 0 | 0 | 7.8s | 99.2% | RTGS + EFT |
| Stanbic Bank | 5 | 4 | 1 | 0 | 9.4s | 98.8% | RTGS + EFT |
| SBM Bank | 5 | 5 | 0 | 0 | 8.1s | 99.1% | RTGS + EFT |
| National Bank | 4 | 3 | 1 | 0 | 11.2s | 98.5% | RTGS + EFT |

---

### Section 43.5: Card Network API Health

#### 43.5.1: Visa API

| Endpoint | Purpose | Method | URL (Masked) | Health | Latency (p95) | Error Rate | Uptime | Circuit Breaker |
|----------|---------|--------|-------------|--------|---------------|------------|--------|-----------------|
| Authorization | Auth card transaction | POST | `https://api.visa.../visadirect/auth` | 🟢 Up | 1.2s | 0.01% | 99.99% | ✅ Closed |
| Settlement | Settle authorized TXN | POST | `https://api.visa.../visadirect/settle` | 🟢 Up | 2.1s | 0.02% | 99.98% | ✅ Closed |
| Reversal | Reverse card TXN | POST | `https://api.visa.../visadirect/reversal` | 🟢 Up | 1.8s | 0.03% | 99.97% | ✅ Closed |
| Card Verification | Verify card details | POST | `https://api.visa.../visadirect/verify` | 🟢 Up | 0.9s | 0.01% | 99.99% | ✅ Closed |
| Tokenization | Create card token | POST | `https://api.visa.../visadirect/tokenize` | 🟢 Up | 1.5s | 0.02% | 99.98% | ✅ Closed |
| 3D Secure Enroll | Enroll card in 3DS | POST | `https://api.visa.../3ds/enroll` | 🟢 Up | 2.8s | 0.05% | 99.96% | ✅ Closed |
| 3D Secure Validate | Validate 3DS challenge | POST | `https://api.visa.../3ds/validate` | 🟢 Up | 1.2s | 0.03% | 99.97% | ✅ Closed |
| MDES (Digital Card) | Manage digital card | POST | `https://api.visa.../mdes` | 🟢 Up | 3.2s | 0.04% | 99.96% | ✅ Closed |
| Visa Direct P2P | Person-to-person push | POST | `https://api.visa.../visadirect/p2p` | 🟢 Up | 4.5s | 0.08% | 99.94% | ✅ Closed |
| Clearing File | Daily clearing submission | POST | `https://api.visa.../clearing` | 🟢 Up | 8.5s | 0.10% | 99.92% | ✅ Closed |
| Settlement Report | Daily settlement report | GET | `https://api.visa.../settlement/report` | 🟢 Up | 5.2s | 0.05% | 99.96% | ✅ Closed |
| Chargeback Handler | Process chargebacks | POST | `https://api.visa.../chargebacks` | 🟢 Up | 3.8s | 0.06% | 99.95% | ✅ Closed |
| Dispute Resolution | Manage disputes | POST | `https://api.visa.../disputes` | 🟢 Up | 4.2s | 0.08% | 99.94% | ✅ Closed |
| Callback (Receive) | Receive Visa webhooks | POST | `https://api.paymo.co.ke/callback/visa` | 🟢 Up | 0.04s | 0.00% | 100% | ✅ Closed |

#### 43.5.2: Mastercard API

| Endpoint | Purpose | Method | Health | Latency (p95) | Error Rate | Uptime | Circuit Breaker |
|----------|---------|--------|--------|---------------|------------|--------|-----------------|
| Authorization | Auth card transaction | POST | 🟢 Up | 1.3s | 0.02% | 99.98% | ✅ Closed |
| Settlement | Settle authorized TXN | POST | 🟢 Up | 2.2s | 0.03% | 99.97% | ✅ Closed |
| Reversal | Reverse card TXN | POST | 🟢 Up | 1.9s | 0.04% | 99.96% | ✅ Closed |
| Card Verification | Verify card details | POST | 🟢 Up | 1.0s | 0.02% | 99.98% | ✅ Closed |
| MDS2 (Tokenization) | Digital secure remote payment | POST | 🟢 Up | 2.5s | 0.05% | 99.95% | ✅ Closed |
| 3DS2 Enroll | Enroll in 3D Secure 2 | POST | 🟢 Up | 2.2s | 0.04% | 99.96% | ✅ Closed |
| Send (P2P) | Mastercard Send push payment | POST | 🟢 Up | 5.2s | 0.10% | 99.92% | ✅ Closed |
| Clearing File | Daily clearing submission | POST | 🟢 Up | 9.1s | 0.12% | 99.90% | ✅ Closed |
| Settlement Report | Daily settlement report | GET | 🟢 Up | 5.8s | 0.06% | 99.95% | ✅ Closed |
| Chargeback Handler | Process chargebacks | POST | 🟢 Up | 4.0s | 0.08% | 99.93% | ✅ Closed |
| Callback (Receive) | Receive MC webhooks | POST | 🟢 Up | 0.03s | 0.00% | 100% | ✅ Closed |
| Smart Data (Analytics) | Transaction analytics | GET | 🟢 Up | 3.5s | 0.03% | 99.96% | ✅ Closed |

#### 43.5.3: PayPal API

| Endpoint | Purpose | Method | Health | Latency | Error Rate | Uptime | Circuit Breaker |
|----------|---------|--------|--------|----------|------------|--------|-----------------|
| Create Order | Initiate PayPal payment | POST | 🟢 Up | 2.1s | 0.05% | 99.97% | ✅ Closed |
| Capture Payment | Capture authorized payment | POST | 🟢 Up | 1.8s | 0.04% | 99.98% | ✅ Closed |
| Refund | Refund completed payment | POST | 🟢 Up | 2.5s | 0.06% | 99.96% | ✅ Closed |
| Webhook Verify | Verify webhook signature | POST | 🟢 Up | 0.5s | 0.00% | 100% | ✅ Closed |
| Payout | Send payout to PayPal account | POST | 🟢 Up | 4.2s | 0.08% | 99.94% | ✅ Closed |
| Callback (Receive) | Receive PayPal webhooks | POST | 🟢 Up | 0.04s | 0.00% | 100% | ✅ Closed |

#### 43.5.4: UnionPay International

| Endpoint | Purpose | Method | Health | Latency | Error Rate | Uptime | Circuit Breaker |
|----------|---------|--------|--------|----------|------------|--------|-----------------|
| Authorization | Auth UnionPay card | POST | 🟢 Up | 2.8s | 0.15% | 99.92% | ✅ Closed |
| Settlement | Settle TXN | POST | 🟢 Up | 3.5s | 0.12% | 99.93% | ✅ Closed |
| Tokenization | Create token | POST | 🟢 Up | 2.2s | 0.10% | 99.95% | ✅ Closed |
| Cross-Border Inquiry | FX rate + fees | GET | 🔴 Down | — | 100% | 98.50% | 🔴 OPEN |
| Callback (Receive) | Receive webhooks | POST | 🟢 Up | 0.05s | 0.00% | 100% | ✅ Closed |

---

### Section 43.6: Third-Party Service API Health

| Service | Provider | Purpose | Endpoints | Healthy | Latency (p95) | Error Rate | Uptime | Circuit Breaker |
|---------|----------|---------|-----------|---------|---------------|------------|--------|-----------------|
| KYC Document Check | Onfido | ID verification | 4 | 4/4 | 45s | 0.25% | 99.90% | ✅ Closed |
| KYC Face Match | Onfido | Biometric check | 2 | 2/2 | 38s | 0.20% | 99.92% | ✅ Closed |
| KYC Webhook | Onfido | Result callback | 2 | 2/2 | 0.04s | 0.00% | 100% | ✅ Closed |
| AML Screening | ComplyAdvantage | Sanctions/PEP check | 3 | 3/3 | 2.1s | 0.01% | 99.99% | ✅ Closed |
| AML Webhook | ComplyAdvantage | Alert callback | 1 | 1/1 | 0.03s | 0.00% | 100% | ✅ Closed |
| AML Case Management | ComplyAdvantage | Case management | 2 | 2/2 | 3.5s | 0.05% | 99.97% | ✅ Closed |
| SMS — Send | Africa's Talking | Send SMS | 2 | 2/2 | 1.2s | 0.15% | 99.98% | ✅ Closed |
| SMS — Delivery Report | Africa's Talking | Delivery status | 1 | 1/1 | 0.05s | 0.00% | 100% | ✅ Closed |
| SMS — Callback | Africa's Talking | Incoming SMS | 1 | 1/1 | 0.03s | 0.00% | 100% | ✅ Closed |
| Email — Send | SendGrid | Send email | 2 | 2/2 | 0.8s | 0.02% | 99.99% | ✅ Closed |
| Email — Webhook | SendGrid | Delivery/open/click events | 1 | 1/1 | 0.04s | 0.00% | 100% | ✅ Closed |
| Push — iOS | Apple APNs | Send push notification | 1 | 1/1 | 0.5s | 0.03% | 99.99% | ✅ Closed |
| Push — Android | Google FCM | Send push notification | 1 | 1/1 | 0.4s | 0.02% | 99.99% | ✅ Closed |
| WhatsApp — Send | Meta Business API | Send WhatsApp message | 3 | 3/3 | 2.5s | 0.37% | 99.90% | ✅ Closed |
| WhatsApp — Webhook | Meta Business API | Receive messages | 2 | 2/2 | 0.05s | 0.00% | 100% | ✅ Closed |
| Monitoring | Datadog | Metrics & logs | 4 | 4/4 | 0.3s | 0.01% | 99.99% | ✅ Closed |
| Error Tracking | Sentry | Error capture | 2 | 2/2 | 0.2s | 0.01% | 99.99% | ✅ Closed |
| Feature Flags | LaunchDarkly | Flag evaluation | 2 | 2/2 | 0.1s | 0.00% | 100% | ✅ Closed |
| KRA iTAX | KRA | Tax remittance | 3 | 3/3 | 8.5s | 0.45% | 99.85% | ✅ Closed |
| KRA eCitizen | KRA | PIN validation | 2 | 2/2 | 5.2s | 0.30% | 99.90% | ✅ Closed |
| NHIF | NHIF | Deduction submission | 2 | 2/2 | 6.8s | 0.25% | 99.92% | ✅ Closed |
| NSSF | NSSF | Contribution submission | 2 | 2/2 | 7.1s | 0.28% | 99.91% | ✅ Closed |
| Insurance — Jubilee | Jubilee | Premium collection | 2 | 2/2 | 4.5s | 0.15% | 99.95% | ✅ Closed |
| Insurance — Heritage | Heritage | Claims processing | 2 | 2/2 | 5.2s | 0.18% | 99.93% | ✅ Closed |
| Insurance — APA | APA | Policy management | 2 | 2/2 | 4.8s | 0.12% | 99.96% | ✅ Closed |
| Lending — QuickLend | QuickLend | Loan disbursement | 2 | 1/2 | 12.5s | 2.50% | 99.50% | ✅ Closed |
| Lending — Branch | Branch Intl | Loan assessment | 2 | 2/2 | 3.8s | 0.10% | 99.97% | ✅ Closed |

---

### Section 43.7: Callback URL Registry & Health

#### 43.7.1: Outbound Callbacks (We Send to Partners)

| Callback | URL We Send To | Method | Purpose | Success Rate | Avg Response | Timeout | Retry Policy |
|----------|---------------|--------|---------|-------------|-------------|---------|--------------|
| M-Pesa STK Result | `https://api.paymo.co.ke/mpesa/stk/result` | POST | We receive STK results | 99.98% | 45ms | 10s | 3 retries, exponential backoff |
| M-Pesa B2C Result | `https://api.paymo.co.ke/mpesa/b2c/result` | POST | We receive disbursement results | 99.97% | 38ms | 10s | 3 retries |
| Visa Chargeback | `https://api.visa.../chargebacks/webhook` | POST | We send chargeback responses | 99.95% | 1.2s | 30s | 5 retries |
| Mastercard Chargeback | `https://api.mastercard.../chargebacks` | POST | We send chargeback responses | 99.93% | 1.5s | 30s | 5 retries |
| Partner TXN Alert | `https://api.partner.../webhook` | POST | We notify partners of TXNs | 98.5% | 2.1s | 15s | 3 retries |
| Lending Disbursement | `https://api.lender.../disbursement` | POST | We confirm loan disbursement | 99.50% | 3.5s | 15s | 3 retries |
| KRA Confirmation | `https://itax.kra.go.ke/confirmation` | POST | We confirm tax remittance | 99.85% | 8.5s | 30s | 5 retries |

#### 43.7.2: Inbound Callbacks (Partners Send to Us)

| Callback | Our Receiving URL | Sender | Purpose | Success Rate | Avg Processing | Auth | Last Received |
|----------|-------------------|--------|---------|-------------|---------------|------|---------------|
| M-Pesa C2B Validation | `/callback/mpesa/c2b/validate` | Safaricom | Validate incoming payment | 100% | 52ms | HMAC | 14:32:01 |
| M-Pesa C2B Confirmation | `/callback/mpesa/c2b/confirm` | Safaricom | Confirm incoming payment | 100% | 41ms | HMAC | 14:32:01 |
| M-Pesa B2C Result | `/callback/mpesa/b2c/result` | Safaricom | Disbursement result | 99.97% | 38ms | HMAC | 14:32:03 |
| M-Pesa STK Result | `/callback/mpesa/stk/result` | Safaricom | STK push result | 99.98% | 45ms | HMAC | 14:32:01 |
| M-Pesa Reversal Result | `/callback/mpesa/reversal/result` | Safaricom | Reversal result | 99.96% | 48ms | HMAC | 14:31:48 |
| Visa Webhook | `/callback/visa` | Visa | Chargeback/dispute notifications | 100% | 120ms | JWT + IP whitelist | 14:30:00 |
| Mastercard Webhook | `/callback/mastercard` | Mastercard | Chargeback/dispute notifications | 100% | 115ms | JWT + IP whitelist | 14:30:00 |
| PayPal Webhook | `/callback/paypal` | PayPal | Payment/dispute notifications | 100% | 85ms | HMAC verification | 14:25:00 |
| UnionPay Webhook | `/callback/unionpay` | UnionPay | Transaction notifications | 100% | 95ms | Certificate | 14:20:00 |
| Onfido Webhook | `/callback/onfido` | Onfido | KYC check result | 100% | 200ms | HMAC | 14:28:00 |
| ComplyAdvantage Webhook | `/callback/complyadvantage` | ComplyAdvantage | AML alert notification | 100% | 150ms | API key | 14:31:00 |
| Africa's Talking Delivery | `/callback/at/delivery` | Africa's Talking | SMS delivery report | 100% | 30ms | HMAC | 14:32:04 |
| SendGrid Events | `/callback/sendgrid` | SendGrid | Email delivery/open/click | 100% | 25ms | HMAC + IP whitelist | 14:32:02 |
| Meta WhatsApp | `/callback/whatsapp` | Meta | Incoming messages + status | 100% | 40ms | HMAC + verify token | 14:31:55 |
| PesaLink Incoming | `/callback/pesalink/incoming` | IPS Kenya | Incoming PesaLink transfer | 100% | 60ms | Certificate + IP | 14:31:30 |
| i&M Bank Callback | `/callback/bank/im` | i&M Bank | Transfer status notification | 100% | 35ms | mTLS | 14:31:20 |
| KCB Callback | `/callback/bank/kcb` | KCB Bank | Transfer status notification | 100% | 38ms | mTLS | 14:31:15 |
| Equity Callback | `/callback/bank/equity` | Equity Bank | Transfer status notification | 100% | 32ms | mTLS | 14:31:10 |
| QuickLend Callback | `/callback/lender/quicklend` | QuickLend | Loan repayment notification | 99.50% | 55ms | API key | 14:30:00 |

#### 43.7.3: Callback Security Configuration

| Security Measure | Applied To | Details |
|-----------------|-----------|---------|
| HMAC signature verification | All Safaricom, AT, SendGrid, Onfido | Shared secret, SHA-256 |
| JWT verification | Visa, Mastercard | Public key validation, expiry check |
| mTLS (mutual TLS) | All bank direct APIs | Client certificate + server certificate |
| IP whitelist | Visa, MC, SendGrid, Meta | Only accept from known IP ranges |
| API key | ComplyAdvantage, QuickLend, partners | Header-based key validation |
| Certificate pinning | UnionPay, PesaLink | Certificate fingerprint validation |
| Rate limiting | All inbound callbacks | 1000 req/min per source |
| Payload validation | All inbound callbacks | Schema validation, size limit |
| Timestamp check | All HMAC-secured callbacks | Reject if >5 min old |
| Replay detection | All authenticated callbacks | Dedup by unique ID, 24h window |

---

### Section 43.8: API Dependency Map (Topological View)

#### 43.8.1: Transaction Flow Dependency Chain

```
USER APP → [PayMo API Gateway]
                ↓
    ┌───────────┼───────────┬───────────┬───────────┐
    ↓           ↓           ↓           ↓           ↓
[M-Pesa]   [Visa/MC]   [PesaLink]  [PayPal]  [Internal]
    ↓           ↓           ↓           ↓           ↓
[STK Push] [Auth API]  [IPS API]  [Create   [DB Write]
    ↓           ↓           ↓         Order]       ↓
[Callback  [3DS/Auth]  [Bank     [Capture]  [Balance
 Wait]      ↓           Callback]     ↓        Update]
    ↓      [Settlement]     ↓         [Refund   ↓
[Callback  [Clearing   [Settlement  Callback] [Ledger
 Received]  File]         File]                  Update]
    ↓           ↓           ↓                     ↓
[DB Write] [Settlement  [Reconciliation]     [Notification
            Report]                              Service]
                                                  ↓
                                          ┌───────┼───────┐
                                          ↓       ↓       ↓
                                        [Push]  [SMS]  [Email]
```

#### 43.8.2: Feature-to-API Dependency Matrix

| Feature | M-Pesa | Visa | MC | PayPal | PesaLink | i&M | KCB | Equity | Onfido | ComplyAdv | SMS | Email | Push |
|---------|--------|------|-----|--------|----------|-----|-----|--------|--------|-----------|-----|-------|------|
| Send money (M-Pesa) | ✅ | — | — | — | — | — | — | — | — | — | ✅ | — | ✅ |
| Send money (PesaLink) | — | — | — | — | ✅ | ✅ | ✅ | ✅ | — | — | ✅ | — | ✅ |
| Send money (card) | — | ✅ | ✅ | — | — | — | — | — | — | — | — | — | ✅ |
| Send money (PayPal) | — | — | — | ✅ | — | — | — | — | — | — | — | — | ✅ |
| Bank transfer | — | — | — | — | — | ✅ | ✅ | ✅ | — | — | ✅ | — | ✅ |
| Pay bill | ✅ | ✅ | ✅ | — | — | — | — | — | — | — | — | — | ✅ |
| KYC verification | — | — | — | — | — | — | — | — | ✅ | — | — | — | — |
| AML screening | — | — | — | — | — | — | — | — | — | ✅ | — | — | — |
| Card issuance | — | ✅ | ✅ | — | — | — | — | — | — | — | — | ✅ | ✅ |
| Loan disbursement | ✅ | — | — | — | — | — | — | — | — | — | ✅ | ✅ | ✅ |
| International transfer | — | ✅ | ✅ | ✅ | — | — | — | — | — | — | — | — | ✅ |

#### 43.8.3: Impact Analysis (If API Goes Down)

| If This Fails | Features Affected | Users Impacted | Workaround Available | Severity |
|---------------|-------------------|----------------|---------------------|----------|
| M-Pesa STK Push | M-Pesa send, bill pay, loan repayment | 134,200 (90%) | ❌ None | 🔴 Critical |
| M-Pesa B2C | M-Pesa withdrawal, loan disbursement | 134,200 (90%) | ❌ None | 🔴 Critical |
| Visa Authorization | Visa card payments | 78,200 (53%) | ❌ None | 🔴 Critical |
| Mastercard Authorization | MC card payments | 39,290 (26%) | ❌ None | 🔴 Critical |
| PesaLink Transfer | Bank-to-bank transfer | 112,300 (76%) | ✅ Use direct bank APIs | 🟠 High |
| i&M Bank API | i&M transfers, i&M settlement | All (settlement) | ✅ Route via PesaLink | 🟡 Medium |
| KCB Bank API | KCB transfers, KCB settlement | All (settlement) | ✅ Route via PesaLink | 🟡 Medium |
| Equity Bank API | Equity transfers | All (settlement) | ✅ Route via PesaLink | 🟡 Medium |
| Onfido | KYC verification | New users | ✅ Manual review fallback | 🟡 Medium |
| ComplyAdvantage | AML screening | New users | ✅ Batch re-screening later | 🟡 Medium |
| Africa's Talking (SMS) | SMS notifications | All users | ✅ Fall back to push + email | 🟡 Medium |
| SendGrid (Email) | Email notifications | All users | ✅ Fall back to push + SMS | 🟡 Medium |
| PayPal | PayPal payments | 12,400 (8%) | ❌ None | 🟡 Medium |
| UnionPay | UnionPay card payments | 2,100 (1.4%) | ❌ None | 🟢 Low |
| Datadog | Monitoring | Admins only | ✅ Direct log access | 🟢 Low |

---

### Section 43.9: Circuit Breaker Dashboard

| Circuit Breaker | State | Failure Threshold | Recovery Threshold | Half-Open Requests | Current Failures | Last State Change | Auto-Recovery Time |
|----------------|-------|-------------------|-------------------|-------------------|-------------------|-------------------|-------------------|
| M-Pesa STK Push | ✅ Closed | 5 in 1 min | 3 in 1 min | 5 probe requests | 0 | — | — |
| M-Pesa B2C | ✅ Closed | 5 in 1 min | 3 in 1 min | 5 probe requests | 0 | — | — |
| Visa Auth | ✅ Closed | 3 in 30s | 2 in 30s | 3 probe requests | 0 | — | — |
| MC Auth | ✅ Closed | 3 in 30s | 2 in 30s | 3 probe requests | 0 | — | — |
| PesaLink Transfer | ✅ Closed | 5 in 1 min | 3 in 1 min | 5 probe requests | 1 | — | — |
| i&M Transfer | ✅ Closed | 5 in 1 min | 3 in 1 min | 5 probe requests | 0 | — | — |
| KCB Transfer | ✅ Closed | 5 in 1 min | 3 in 1 min | 5 probe requests | 0 | — | — |
| Equity Transfer | ✅ Closed | 5 in 1 min | 3 in 1 min | 5 probe requests | 0 | — | — |
| Onfido | ✅ Closed | 3 in 5 min | 2 in 5 min | 3 probe requests | 0 | — | — |
| ComplyAdvantage | ✅ Closed | 3 in 5 min | 2 in 5 min | 3 probe requests | 0 | — | — |
| SMS (Africa's Talking) | ✅ Closed | 5 in 1 min | 3 in 1 min | 5 probe requests | 0 | — | — |
| Email (SendGrid) | ✅ Closed | 5 in 1 min | 3 in 1 min | 5 probe requests | 0 | — | — |
| PayPal | ✅ Closed | 3 in 1 min | 2 in 1 min | 3 probe requests | 0 | — | — |
| UnionPay Cross-Border | 🔴 OPEN | 3 in 1 min | 2 in 1 min | — | 5 consecutive | 14:28:00 | 30s (next probe at 14:32:30) |
| QuickLend | ✅ Closed | 5 in 1 min | 3 in 1 min | 5 probe requests | 2 | — | — |
| KRA iTAX | ✅ Closed | 3 in 5 min | 2 in 5 min | 3 probe requests | 0 | — | — |

#### Circuit Breaker States Explained
| State | Meaning | Behavior |
|-------|---------|----------|
| ✅ **Closed** (Healthy) | All requests pass through normally | Normal operation, counting failures |
| 🔴 **Open** (Unhealthy) | All requests immediately rejected | No calls to backend, returns fallback/error |
| 🟡 **Half-Open** (Recovering) | Limited probe requests allowed | If probes succeed → Closed; if fail → Open |
| ⚪ **Forced Open** | Manually disabled by admin | No automatic recovery, admin must re-enable |

#### Manual Circuit Breaker Controls
| Action | Requires | Confirmation |
|--------|----------|-------------|
| Force open (disable API) | Super admin | 2FA + reason |
| Force close (re-enable API) | Super admin | 2FA |
| Adjust thresholds | Platform admin | 2FA |
| View trip history | Any admin | None |

---

### Section 43.10: Dead Letter Queue (DLQ) & Failed Callback Management

#### 43.10.1: Dead Letter Queue Summary

| Queue | Messages | Oldest | Processing | Action Required |
|-------|----------|--------|------------|-----------------|
| M-Pesa STK callbacks | 0 | — | — | None |
| M-Pesa B2C callbacks | 3 | 14:28 | ⏳ Retry scheduled | Monitor |
| PesaLink callbacks | 1 | 14:25 | ⏳ Retry scheduled | Monitor |
| Visa webhooks | 0 | — | — | None |
| MC webhooks | 0 | — | — | None |
| Bank callbacks (all) | 2 | 14:20 | ⏳ Manual review | Review → |
| Partner webhooks | 5 | 14:15 | ⏳ Retry scheduled | Monitor |
| SMS delivery reports | 12 | 14:10 | ⏳ Will expire | No action (non-critical) |
| Email events | 0 | — | — | None |
| **Total DLQ** | **23** | **14:10** | — | — |

#### 43.10.2: DLQ Message Detail

| Queue | Message ID | Original Payload | Error | Retries | Max Retries | Next Action | Expires |
|-------|-----------|-----------------|-------|---------|-------------|-------------|---------|
| B2C Callback | DLQ-8821 | TXN-882400, KES 50K | Timeout (30s) | 3/5 | 5 | Auto-retry at 14:35 | 14:50 |
| B2C Callback | DLQ-8820 | TXN-882399, KES 25K | Timeout (30s) | 3/5 | 5 | Auto-retry at 14:35 | 14:50 |
| B2C Callback | DLQ-8819 | TXN-882398, KES 10K | HTTP 500 | 2/5 | 5 | Auto-retry at 14:35 | 14:50 |
| PesaLink | DLQ-8818 | PL-44567, KES 100K | Deserialize error | 1/5 | 5 | Manual review needed | 15:10 |
| i&M Bank | DLQ-8817 | IM-8823, KES 500K | Signature mismatch | 0/5 | 5 | Manual review needed | 15:00 |
| KCB Bank | DLQ-8816 | KCB-8822, KES 200K | mTLS cert expired | 0/5 | 5 | Alert devops | 15:00 |
| QuickLend | DLQ-8815 | QL-4456, KES 50K | HTTP 503 | 3/5 | 5 | Auto-retry at 14:35 | 14:50 |
| QuickLend | DLQ-8814 | QL-4455, KES 30K | HTTP 503 | 3/5 | 5 | Auto-retry at 14:35 | 14:50 |
| QuickLend | DLQ-8813 | QL-4454, KES 20K | HTTP 503 | 2/5 | 5 | Auto-retry at 14:35 | 14:50 |
| QuickLend | DLQ-8812 | QL-4453, KES 15K | HTTP 503 | 2/5 | 5 | Auto-retry at 14:35 | 14:50 |
| QuickLend | DLQ-8811 | QL-4452, KES 10K | HTTP 503 | 1/5 | 5 | Auto-retry at 14:35 | 14:50 |

#### 43.10.3: DLQ Actions

| Action | Description | Requires |
|--------|-------------|----------|
| Retry now | Immediately reprocess message | Permission |
| Retry all in queue | Bulk retry all messages in a DLQ | Permission + 2FA |
| Discard | Delete message (with reason) | Permission + 2FA |
| Discard all | Bulk delete all in a DLQ | Super admin + 2FA |
| Manual process | View payload and manually resolve | Permission |
| Move to another queue | Redirect to different processing queue | Permission |
| Export | Download DLQ messages as JSON/CSV | Permission |
| Alert on DLQ size | Configure threshold alerts | None |

#### 43.10.4: DLQ Alert Configuration

| Queue | Warning Threshold | Critical Threshold | Current | Notification |
|-------|-------------------|-------------------|---------|-------------|
| All payment callbacks | >10 | >50 | 6 | Slack |
| Bank callbacks | >5 | >20 | 2 | Slack + Email |
| Partner callbacks | >10 | >50 | 5 | Slack |
| Non-critical (SMS/email) | >100 | >500 | 12 | None (daily digest) |
| Total DLQ | >25 | >100 | 23 | Slack + Email |

---

### Section 43.11: API Latency & Throughput Real-Time Charts

#### 43.11.1: Latency Heatmap (Current Hour)

| API | 0–100ms | 100–500ms | 500ms–1s | 1–5s | 5–10s | >10s |
|-----|---------|-----------|----------|-------|-------|-------|
| M-Pesa STK | — | — | — | 🟢 82% | 🟢 15% | 🟡 3% |
| M-Pesa B2C | — | — | — | 🟢 70% | 🟢 25% | 🟡 5% |
| Visa Auth | 🟢 95% | 🟢 5% | — | — | — | — |
| MC Auth | 🟢 93% | 🟢 7% | — | — | — | — |
| PesaLink | — | — | 🟢 40% | 🟢 50% | 🟡 8% | 🔴 2% |
| i&M Bank | — | 🟢 30% | 🟢 50% | 🟢 18% | 🟡 2% | — |
| KCB Bank | — | 🟢 25% | 🟢 40% | 🟢 28% | 🟡 5% | 🟡 2% |
| Onfido | — | — | — | — | 🟢 85% | 🟡 15% |
| ComplyAdvantage | 🟢 90% | 🟢 10% | — | — | — | — |

#### 43.11.2: Throughput Charts (Live)
- **M-Pesa STK**: Line chart — requests/minute, rolling 1 hour
- **Card Auth (Visa + MC)**: Line chart — auth requests/minute, rolling 1 hour
- **PesaLink**: Line chart — transfers/minute, rolling 1 hour
- **Bank APIs (aggregate)**: Line chart — requests/minute, rolling 1 hour
- **All APIs combined**: Stacked area — requests/minute by category, rolling 1 hour

#### 43.11.3: Error Rate Charts (Live)
- **Error rate by API**: Line chart — error % per API, rolling 1 hour
- **Error type breakdown**: Stacked bar — timeout vs 4xx vs 5xx, per API
- **Error spike detection**: Automatic markers when error rate exceeds 2x baseline

#### 43.11.4: Latency Percentile Charts (Live)
- **p50 / p95 / p99**: Triple line chart per API category, rolling 1 hour
- **SLA lines**: Horizontal target lines (e.g., p95 < 5s for M-Pesa)

---

### Section 43.12: API Credential & Configuration Registry

| API | Auth Method | Credential Location | Key Rotation | Last Rotated | Next Rotation | Cert Expiry |
|-----|------------|-------------------|-------------|-------------|---------------|-------------|
| M-Pesa (Safaricom) | OAuth bearer token | AWS Secrets Manager | Every 90 days | Jun 2026 | Sep 2026 | — |
| Visa | JWT + API key | AWS Secrets Manager | Every 90 days | Jul 2026 | Oct 2026 | — |
| Mastercard | JWT + API key | AWS Secrets Manager | Every 90 days | Jul 2026 | Oct 2026 | — |
| PayPal | Client ID + Secret | AWS Secrets Manager | Every 90 days | May 2026 | Aug 2026 | — |
| UnionPay | Certificate | AWS Secrets Manager | Annually | Jan 2026 | Jan 2027 | Dec 2026 |
| PesaLink (IPS) | Certificate + mTLS | AWS Secrets Manager | Annually | Jan 2026 | Jan 2027 | Nov 2026 |
| i&M Bank | mTLS certificate | AWS Secrets Manager | Annually | Mar 2026 | Mar 2027 | Feb 2027 |
| KCB Bank | mTLS certificate | AWS Secrets Manager | Annually | Mar 2026 | Mar 2027 | Jan 2027 |
| Equity Bank | mTLS certificate | AWS Secrets Manager | Annually | Mar 2026 | Mar 2027 | Mar 2027 |
| Onfido | API token | AWS Secrets Manager | Every 90 days | Aug 2026 | Nov 2026 | — |
| ComplyAdvantage | API key | AWS Secrets Manager | Every 90 days | Aug 2026 | Nov 2026 | — |
| Africa's Talking | API key + username | AWS Secrets Manager | Every 90 days | Jun 2026 | Sep 2026 | — |
| SendGrid | API key | AWS Secrets Manager | Every 90 days | Jul 2026 | Oct 2026 | — |
| Apple APNs | Certificate + Key | AWS Secrets Manager | Annually | Jan 2026 | Jan 2027 | Jul 2027 |
| Google FCM | Service account key | AWS Secrets Manager | Annually | Jan 2026 | Jan 2027 | — |
| Meta WhatsApp | Access token | AWS Secrets Manager | Every 90 days | Aug 2026 | Nov 2026 | — |
| KRA iTAX | API key + certificate | AWS Secrets Manager | Annually | Jan 2026 | Jan 2027 | Dec 2026 |
| Datadog | API key | AWS Secrets Manager | Every 90 days | Jun 2026 | Sep 2026 | — |
| LaunchDarkly | SDK key | Environment variable | Every 90 days | Jul 2026 | Oct 2026 | — |

#### Credential Expiry Warnings
| Credential | Expiry Date | Days Remaining | Status | Action |
|-----------|-------------|----------------|--------|--------|
| UnionPay Certificate | Dec 2026 | 103 | 🟡 Warning | Schedule rotation |
| PesaLink Certificate | Nov 2026 | 77 | 🟡 Warning | Schedule rotation |
| KCB mTLS Certificate | Jan 2027 | 133 | 🟢 OK | — |
| Apple APNs Certificate | Jul 2027 | 335 | 🟢 OK | — |
| i&M mTLS Certificate | Feb 2027 | 175 | 🟢 OK | — |

---

### Section 43.13: API Incident Correlation

| Incident | Affected APIs | Affected Features | Users Affected | Root Cause | Resolution |
|----------|--------------|-------------------|----------------|-------------|------------|
| INC-0047 (Active) | M-Pesa B2C callback | M-Pesa withdrawal confirmation delayed | 12 TXNs pending | Safaricom callback delay | Safaricom investigating |
| INC-0046 (Active) | Visa p95 latency elevated | Visa card payments slower than normal | All Visa users | Visa regional latency spike | Monitoring |
| INC-0045 (Resolved) | Database (internal) | All features (brief) | 0 (failover) | Primary DB memory leak | Auto-failover |
| INC-0042 (Resolved) | QuickLend API | Loan disbursement to QuickLend users | 45 users | QuickLend server issue | QuickLend resolved |
| INC-0041 (Resolved) | Onfido API | KYC verification | 234 users (delayed) | Onfido degradation | Failover to backup provider |

#### Correlation Rules (Auto-Detection)
| Rule | Trigger | Auto-Action |
|------|---------|-------------|
| Multi-API failure | >2 critical APIs down simultaneously | Page on-call + create P1 incident |
| Single API degradation | p99 > 3x normal for 5 min | Slack alert to relevant team |
| Callback queue growing | DLQ > warning threshold | Slack alert + auto-retry |
| Credential nearing expiry | <30 days to expiry | Email to devops + security |
| Error rate spike | Error rate > 2x baseline for 10 min | Slack alert + create incident |
| Latency spike | p95 > SLA target for 10 min | Slack alert to team |
| Partner-reported outage | Partner sends outage notification | Update API status + create incident |

---

### Section 43.14: API Operations Quick Actions

| Action | Description | Requires | Confirmation |
|--------|-------------|----------|-------------|
| Force circuit breaker open | Disable a specific API endpoint | Super admin + 2FA | Confirm + reason |
| Force circuit breaker close | Re-enable a specific API endpoint | Super admin + 2FA | Confirm |
| Retry all DLQ messages | Bulk retry all messages in a dead letter queue | Permission + 2FA | Confirm queue + count |
| Trigger health check now | Force immediate health scan of all APIs | Any admin | None |
| Rotate API credential | Initiate key rotation for a specific API | Super admin + 2FA | Confirm + new credential |
| Disable callback URL | Temporarily stop accepting callbacks on a URL | Platform admin + 2FA | Confirm + reason |
| Enable maintenance mode for API | Return 503 for a specific API | Super admin + 2FA | Confirm + reason |
| Export API health report | Generate PDF/Excel of current API health | Any admin | None |
| Simulate API failure | Test circuit breaker and fallback behavior | Platform admin + 2FA | Confirm scope |
| View raw health check data | See last health check response bodies | Permission | None |
| Ping specific endpoint | Manual health check for one endpoint | Any admin | None |
| View API logs (last 1h) | See request/response logs for an API | Permission | None |

---

### Navigation Update

```
⚙️ PLATFORM ADMINISTRATION
   ├── Admin Management (Page 29)
   ├── Permissions & Roles (Page 30)
   ├── Audit Log (Page 31)
   ├── System Configuration (Page 32)
   ├── API & Integrations (Page 33)
   ├── Feature Flags (Page 34)
   └── 🆕 API Health & Interconnections (Page 43)  ← NEW
```

---

*Page 43 added to PayMo Admin Dashboard — Comprehensive Layout Blueprint v2.0*
*Classification: CONFIDENTIAL — Internal Use Only*
```