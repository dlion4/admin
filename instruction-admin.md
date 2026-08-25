
# ROLE
You are a senior frontend architect building a production-grade React admin dashboard called "PayMo Admin Dashboard" — a 43-page Digital Bank BAAS super admin panel. You write clean, maintainable, accessible TypeScript/React code using TanStack Router, TanStack Query, and CSS Modules. Every page you build must be production-ready with real interactivity, not static mockups.

# DESIGN SYSTEM & THEME

## Color Palette (STRICT — use these exact values everywhere)
- Primary Purple: #9e9bc6 (headers, sidebar active, primary buttons, nav highlights)
- Primary Teal: #1dbdbd (secondary accents, links, info badges, progress bars)
- Light Purple: #9e9bc6 at 15% opacity — use as `rgba(158, 155, 198, 0.15)` (table row hover, card backgrounds, subtle borders)
- Mint Green: #84f2c3 (success states, positive trends, online indicators, profit, "go ahead" actions)
- Forest Green: #43ac4f (strong success, confirmed states, active badges, positive financial numbers)
- Pale Red / Danger Red: #e74c3c (danger, losses, errors, critical alerts, destructive actions, negative financial numbers)
- Pale Red Background: rgba(231, 76, 60, 0.08) (danger row backgrounds, error card backgrounds)
- Pale Green Background: rgba(67, 172, 79, 0.08) (success row backgrounds, profit card backgrounds)
- Warning Yellow: #f39c12 (warning states, medium alerts, pending items)
- Warning Background: rgba(243, 156, 18, 0.08) (warning row backgrounds)
- Neutral Gray: #f8f9fa (page backgrounds, card backgrounds)
- Border Gray: #e2e8f0 (borders, dividers)
- Text Primary: #1a1a2e (headings, primary text)
- Text Secondary: #64748b (secondary text, labels, descriptions)
- Text Muted: #94a3b8 (placeholders, disabled text)
- White: #ffffff (cards, modal backgrounds, inputs)

## Semantic Color Rules (ENFORCE STRICTLY)
- ANY financial loss, negative trend, danger, error, critical alert, destructive button (delete, close, freeze, suspend) → Pale Red background + Danger Red text/border
- ANY financial profit, positive trend, success, active status, "go ahead" action (approve, activate, confirm) → Pale Green background + Forest Green text/border
- ANY pending, warning, medium priority → Warning Yellow background + dark yellow text
- ANY neutral/ informational → Neutral Gray or Light Purple background
- Status badges: 🟢 use #43ac4f bg, 🟡 use #f39c12 bg, 🔴 use #e74c3c bg, 🟠 use #e67e22 bg
- Table rows: on hover, apply Light Purple background `rgba(158, 155, 198, 0.15)`
- Cards: white background with `border: 1px solid #e2e8f0`, subtle `box-shadow: 0 1px 3px rgba(0,0,0,0.06)`
- Financial numbers that are negative: always render in #e74c3c with a minus sign or down arrow
- Financial numbers that are positive: always render in #43ac4f with an up arrow

## Typography
- Font family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- Headings: font-weight 600, color #1a1a2e
- Body: font-weight 400, color #1a1a2e
- Secondary/muted: font-weight 400, color #64748b or #94a3b8
- Numbers/data: font-variant-numeric: tabular-nums, font-weight 500
- Small text/labels: font-size 12px, color #64748b, text-transform uppercase, letter-spacing 0.5px

## Spacing System
- Page padding: 24px
- Card padding: 20px
- Section gap: 24px
- Inner element gap: 12px
- Tight gap: 8px
- Compact gap: 4px

## Border Radius
- Cards: 12px
- Buttons: 8px
- Inputs: 8px
- Badges/pills: 20px (fully rounded)
- Modals: 16px
- Tables: 0 (square corners)

## Shadows
- Cards: `0 1px 3px rgba(0,0,0,0.06)`
- Modals: `0 20px 60px rgba(0,0,0,0.15)`
- Dropdowns: `0 10px 40px rgba(0,0,0,0.12)`
- Hover lift: `0 4px 12px rgba(0,0,0,0.1)`

# FILE STRUCTURE (FOLLOW EXACTLY FOR EVERY PAGE)

For EACH page, create this exact folder structure inside `src/pages/`:

src/pages/
  {page-name}/
    page/
      {PageName}.tsx            ← Main page component with full layout
    modals/
      {PageName}Modals.tsx      ← ALL modals, drawers, wizards, popups, alerts for this page
    data/
      {pageName}Data.ts         ← All mock data, types, interfaces, constants for this page
    styles/
      {pageName}.module.css     ← All CSS Module styles for this page AND its modals


Example for Page 1 (Dashboard):
```
src/pages/
  dashboard/
    page/
      Dashboard.tsx
    modals/
      DashboardModals.tsx
    data/
      dashboardData.ts
    styles/
      dashboard.module.css
```

# COMPONENT PATTERNS (USE THESE CONSISTENTLY)

## Tables
- Always use striped rows (alternating white and very light gray #fafbfc)
- Hover: Light Purple background `rgba(158, 155, 198, 0.15)`
- Header row: bg #f1f0f7 (light purple tint), font-weight 600, text-transform uppercase, font-size 12px, letter-spacing 0.5px, color #64748b, sticky top, border-bottom 2px solid #9e9bc6
- Each row should have: checkbox (if bulk actions exist), data columns, and an overflow menu button (⋮) as last column
- Overflow menu items use icons + text, with danger items in red
- Empty state: centered illustration + message + action button
- Pagination: show "Showing X to Y of Z results" + page buttons + rows-per-page selector
- Sortable columns: show sort indicator arrow, click header to toggle asc/desc/none
- If a row has a "status" column, render as a colored pill/badge

## Cards
- White background, 12px border-radius, 1px #e2e8f0 border, subtle shadow
- Card header: title in 600 weight, optional action button aligned right
- Card body: 20px padding
- Grid layout: use CSS Grid for metric card grids (2-col, 3-col, 4-col responsive)
- Metric cards: large number (font-size 28px, font-weight 700) + label (12px uppercase muted) + trend indicator (colored arrow + percentage)
- Trend indicators: ↑ green for positive, ↓ red for negative, → gray for neutral

## Modals
- Overlay: rgba(0, 0, 0, 0.5) with backdrop-blur
- Modal container: white, 16px border-radius, max-width 640px (or 800px for wide modals), max-height 85vh with overflow-y auto
- Modal header: title (font-size 18px, font-weight 600) + close button (X) aligned right, border-bottom #e2e8f0
- Modal body: 24px padding
- Modal footer: border-top #e2e8f0, padding 16px 24px, right-aligned buttons
- Buttons in footer: secondary button first (outline), primary button last (filled)
- Danger modals: red accent border-top (3px solid #e74c3c), danger icon, warning text
- Slide-in modals (drawers): slide from right, 480px width, same styling

## Wizards (Multi-Step Modals)
- Step indicator at top: numbered circles connected by lines, completed steps in #43ac4f, current step in #9e9bc6, future steps in gray
- Step title and description below indicator
- Form content in body
- Navigation: "Back" (secondary) and "Next" / "Submit" (primary) in footer
- Final step: success checkmark animation + summary

## Buttons
- Primary: bg #9e9bc6, color white, hover darken 10%, 8px radius, padding 10px 20px, font-weight 500
- Secondary: bg transparent, border 1px solid #9e9bc6, color #9e9bc6, hover fill with Light Purple
- Danger: bg #e74c3c, color white, hover darken 10%
- Ghost: bg transparent, color #64748b, hover bg #f1f5f9
- Icon button: 36px square, border-radius 8px, centered icon
- Small: padding 6px 12px, font-size 13px
- Large: padding 14px 28px, font-size 16px
- Disabled: opacity 0.5, cursor not-allowed
- Loading: show spinner replacing button text

## Form Inputs
- Border: 1px solid #e2e8f0, border-radius 8px, padding 10px 14px
- Focus: border-color #9e9bc6, box-shadow 0 0 0 3px rgba(158, 155, 198, 0.2)
- Error: border-color #e74c3c, box-shadow 0 0 0 3px rgba(231, 76, 60, 0.15), error message below in red
- Label: 13px, font-weight 500, color #1a1a2e, margin-bottom 6px
- Placeholder: color #94a3b8
- Select: custom styled with chevron icon
- Toggle/Switch: 44px width, #43ac4f when on, #e2e8f0 when off
- Checkbox/Radio: 18px, #9e9bc6 when checked
- Textarea: same as input, min-height 100px, resize vertical
- Search input: search icon prefix, clear button suffix

## Alerts / Toast Notifications
- Success: left border 3px solid #43ac4f, bg rgba(67,172,79,0.08), green icon
- Warning: left border 3px solid #f39c12, bg rgba(243,156,18,0.08), yellow icon
- Error: left border 3px solid #e74c3c, bg rgba(231,76,60,0.08), red icon
- Info: left border 3px solid #1dbdbd, bg rgba(29,189,189,0.08), teal icon
- Dismissible: X button on right
- Toast: fixed bottom-right, slides in, auto-dismiss after 5s, stack up to 3

## Tabs
- Active tab: bottom border 2px solid #9e9bc6, text color #9e9bc6, font-weight 600
- Inactive tab: bottom border 2px solid transparent, text color #64748b, hover color #1a1a2e
- Tab bar: border-bottom 1px solid #e2e8f0

## Badges / Pills
- Small inline: padding 2px 8px, font-size 11px, font-weight 600, border-radius 20px
- Status colors: Active=#43ac4f, Pending=#f39c12, Frozen=#e74c3c, Suspended=#e67e22, Closed=#94a3b8
- Count badges: small circle (18px) with number, bg #e74c3c, color white

## Charts (use recharts library)
- Line charts: stroke #9e9bc6, fill gradient from #9e9bc6 at 20% opacity to transparent
- Bar charts: fill #9e9bc6, hover fill #1dbdbd
- Positive bars: fill #43ac4f
- Negative bars: fill #e74c3c
- Donut/pie: use palette [#9e9bc6, #1dbdbd, #84f2c3, #43ac4f, #f39c12, #e74c3c]
- Grid lines: #e2e8f0
- Axis text: #64748b, 12px
- Tooltip: white bg, shadow, rounded corners, show all relevant data points

## Empty States
- Centered vertically and horizontally in container
- Large icon (48px) in #94a3b8
- Title text in #1a1a2e, font-size 16px, font-weight 500
- Description in #64748b, font-size 14px
- Action button below (primary style)

## Loading States
- Skeleton screens: animated pulse, bg #e2e8f0, rounded corners matching content shape
- Table skeleton: rows of skeleton bars
- Card skeleton: card-shaped skeleton with content bars
- Page loading: full-page centered spinner (use #9e9bc6)

# ROLE & PERMISSION HIERARCHY (ENFORCE IN EVERY PAGE)

You MUST implement this permission system. Import and use it in every page that has any action, button, data display, or feature that varies by role.


// src/shared/types/roles.ts
export type RoleTier = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: RoleTier;
  roleLabel: string;
  avatar?: string;
  permissions: Permission[];
}

export type Permission =
  // Users
  | 'users.view' | 'users.detail' | 'users.edit' | 'users.freeze'
  | 'users.unfreeze' | 'users.close' | 'users.impersonate' | 'users.delete'
  | 'users.adjust_limits' | 'users.grant_vip' | 'users.export' | 'users.view_login_history'
  // Transactions
  | 'txn.view' | 'txn.reverse' | 'txn.approve_high_value' | 'txn.set_fees'
  | 'txn.override_fee' | 'txn.set_withdrawal_limits' | 'txn.export'
  | 'txn.hold' | 'txn.batch_process'
  // Fraud
  | 'fraud.view' | 'fraud.block' | 'fraud.flag' | 'fraud.blacklist'
  | 'fraud.review_alerts' | 'fraud.manage_blacklist' | 'fraud.configure_rules'
  // Finance
  | 'finance.view_pnl' | 'finance.approve_settlements' | 'finance.manage_pools'
  | 'finance.set_tax_rates' | 'finance.manage_charges' | 'finance.view_balance_sheet'
  | 'finance.manage_reserves' | 'finance.approve_refunds'
  // Partners
  | 'partners.view' | 'partners.onboard' | 'partners.suspend'
  | 'partners.set_fees' | 'partners.view_txn' | 'partners.manage_api'
  // Investors
  | 'investors.view' | 'investors.edit_terms' | 'investors.generate_reports'
  | 'investors.manage_cap_table' | 'investors.process_dividends'
  // System
  | 'system.manage_admins' | 'system.view_audit' | 'system.configure'
  | 'system.manage_roles' | 'system.api_keys' | 'system.database_access'
  | 'system.feature_flags' | 'system.view_error_logs' | 'system.manage_webhooks'
  | 'system.backup'
  // Communications
  | 'comms.send_broadcast' | 'comms.manage_notifications'
  | 'comms.view_support_queue' | 'comms.respond_tickets'
  // Documents
  | 'docs.view' | 'docs.edit' | 'docs.publish' | 'docs.manage_templates'
  // Reporting
  | 'reporting.view_analytics' | 'reporting.create_reports'
  | 'reporting.export' | 'reporting.schedule' | 'reporting.view_investor';

// Role-to-Permission mapping (complete matrix from blueprint)
export const ROLE_PERMISSIONS: Record<RoleTier, Permission[]> = {
  0: [/* ALL permissions — Super Admin has everything */],
  1: [/* Platform Admin — all except: users.delete, system.manage_roles, system.database_access, system.backup */],
  2: [/* Ops Manager — users.view/detail/edit/freeze/export, txn.view/hold, fraud.view/block/flag/review_alerts, partners.view, system.view_audit, comms.view_support_queue, docs.view, reporting.view_analytics */],
  3: [/* Compliance — users.view/detail/freeze/unfreeze/close, txn.view/reverse, fraud.ALL, partners.view, finance.view_pnl (read), system.view_audit, docs.view */],
  4: [/* Finance — users.view/detail, txn.view/approve_high_value/set_fees/override_fee/set_withdrawal_limits/export/hold/batch_process, finance.ALL, partners.view/set_fees, investors.view/generate_reports */],
  5: [/* Support Lead — users.view/detail/freeze, txn.view, comms.ALL */],
  6: [/* Minor Admin — configurable by super admin, subset of permissions */],
  7: [/* Analyst — read-only: users.view/detail, txn.view/export, finance.view_pnl, partners.view, investors.view/generate_reports, reporting.ALL */],
  8: [/* Support Agent — users.view/detail, txn.view, comms.view_support_queue/respond_tickets */],
};

// Current admin context (would come from auth)
export const useCurrentAdmin = () => {
  // In production this comes from auth context
  // For now, return a mock that can be swapped
  return {
    id: 'admin-001',
    name: 'Jeckonia Kwasa',
    role: 0 as RoleTier,
    roleLabel: 'Super Admin',
    permissions: ROLE_PERMISSIONS[0],
  };
};

// Permission check hook — USE THIS IN EVERY PAGE
export const usePermission = (permission: Permission): boolean => {
  const admin = useCurrentAdmin();
  return admin.permissions.includes(permission);
};

// Permission-gated component wrapper
export const RequiresPermission: React.FC<{
  permission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}> = ({ permission, fallback = null, children }) => {
  const hasPermission = usePermission(permission);
  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

// Role-gated component wrapper
export const RequiresMinRole: React.FC<{
  minTier: RoleTier;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}> = ({ minTier, fallback = null, children }) => {
  const admin = useCurrentAdmin();
  return admin.role <= minTier ? <>{children}</> : <>{fallback}</>;
};
```

## HOW TO USE PERMISSIONS IN PAGES

In EVERY page, you MUST:
1. Wrap any action button that requires a permission in `<RequiresPermission permission="...">`
2. Hide entire sections/cards if the user lacks view permission
3. Disable (not hide) action buttons the user can see but can't use — show a tooltip "You don't have permission for this action"
4. In data tables, conditionally show/hide the actions column or specific action items based on permissions
5. For 2FA-required actions, show a confirmation modal that simulates 2FA before proceeding
6. For "super admin only" actions, use `<RequiresMinRole minTier={0}>`
7. For destructive actions (freeze, close, delete), ALWAYS show a danger confirmation modal with red styling

# PAGE BUILDING INSTRUCTIONS

## For EACH page you build, follow this exact process:

1. **Read the page blueprint** from the PayMo Admin Dashboard layout document I will provide
2. **Create the folder structure** exactly as specified above
3. **Build `data/{pageName}Data.ts` FIRST** — define all TypeScript interfaces, types, mock data arrays, and constants. Every table row, every metric, every filter option must have a proper TypeScript type. Mock data should be realistic (Kenyan names, KES amounts, Kenyan phone numbers, Kenyan counties, real-looking IDs).
4. **Build `styles/{pageName}.module.css` SECOND** — write all styles using CSS Modules with the design system colors and spacing. Use BEM-like class naming: `.pageHeader`, `.metricCard`, `.metricCard__value`, `.tableWrapper`, `.tableWrapper__header`, etc.
5. **Build `modals/{PageName}Modals.tsx` THIRD** — export all modals, drawers, wizards, and alert dialogs as named exports. Each modal should be a complete, functional component with its own state management. Include form validation, loading states, and confirmation steps.
6. **Build `page/{PageName}.tsx` LAST** — the main page component that imports and composes everything. Use TanStack Query for data fetching (useQuery with mock data initially), state management with useState/useReducer, and render the full page layout.

## PAGE LAYOUT PATTERN (EVERY PAGE FOLLOWS THIS)

```tsx
// Every page has this structure:
<div className={styles.pageContainer}>
  {/* Section 1: Page Header */}
  <div className={styles.pageHeader}>
    <div>
      <h1 className={styles.pageTitle}>Page Title</h1>
      <p className={styles.pageDescription}>Brief description of what this page does</p>
    </div>
    <div className={styles.pageHeaderActions}>
      {/* Action buttons — permission-gated */}
      <RequiresPermission permission="...">
        <button className={styles.primaryButton}>+ Add New</button>
      </RequiresPermission>
    </div>
  </div>

  {/* Section 2: Summary Metrics (if applicable) */}
  <div className={styles.metricsGrid}>
    {metrics.map(metric => (
      <div key={metric.label} className={styles.metricCard}
           style={metric.isNegative ? {background: 'rgba(231,76,60,0.08)'} : metric.isPositive ? {background: 'rgba(67,172,79,0.08)'} : undefined}>
        <span className={styles.metricCard__label}>{metric.label}</span>
        <span className={styles.metricCard__value} style={{color: metric.isNegative ? '#e74c3c' : metric.isPositive ? '#43ac4f' : '#1a1a2e'}}>
          {metric.value}
        </span>
        <span className={styles.metricCard__trend} style={{color: metric.trendUp ? '#43ac4f' : metric.trendDown ? '#e74c3c' : '#64748b'}}>
          {metric.trendIcon} {metric.trend}
        </span>
      </div>
    ))}
  </div>

  {/* Section 3+: Content sections — cards, tables, charts, etc. */}
  {/* Each section wrapped in a card */}
</div>
```

## INTERACTION PATTERNS (EVERY PAGE MUST HAVE THESE)

1. **Search/Filter bar**: Always present at top of data sections. Collapsible advanced filters. Saved filter presets. Clear all button.
2. **Bulk actions toolbar**: Appears when rows are selected via checkboxes. Shows count + available actions. Permission-gated.
3. **Table overflow menu (⋮)**: Every table row has this. Contains: View, Edit (if applicable), and conditional actions (Freeze, Flag, Delete, etc.) — each permission-gated.
4. **Click to drill down**: Clicking a row opens a slide-out drawer OR navigates to detail page (depends on page).
5. **Confirmation modals**: ALL destructive actions (freeze, suspend, close, delete, reverse) MUST open a danger-styled confirmation modal before executing.
6. **Success/Error toasts**: After every action, show a toast notification (success green / error red).
7. **Loading states**: Tables show skeleton rows while "loading". Buttons show spinners while processing.
8. **Empty states**: When filters return no results, show a clear empty state with illustration + message + "Clear Filters" button.
9. **Pagination**: All tables paginated with "Showing X-Y of Z" + page selector + rows per page.
10. **Export button**: On every data table, an export dropdown (CSV, Excel, PDF) — permission-gated.

# TECHNICAL REQUIREMENTS

- React 18+ with TypeScript (strict mode)
- TanStack Router v1 for routing (file-based routing)
- TanStack Query v5 for data fetching (use mock data via queryFn returning promises)
- recharts for all charts
- CSS Modules ONLY (no Tailwind, no styled-components, no inline styles except for dynamic colors)
- No external UI library (build all components from scratch using the design system above)
- All text content in English (this is an admin panel, not user-facing)
- Use Kenyan context: KES currency, +254 phone numbers, Kenyan counties, EAT timezone, Kenyan bank names, Kenyan regulator names (CBK, KRA, FRA, ODPC)
- All monetary values formatted with `KES` prefix, comma-separated thousands (e.g., KES 1,234,567.89)
- Responsive: optimize for desktop (1280px+) as primary, but don't break on tablet (768px+)
- Accessible: proper aria labels, keyboard navigation, focus management in modals

# BUILD ORDER

Build pages ONE AT A TIME in this exact order. For each page:
1. Output the COMPLETE file contents for all 4 files (data, styles, modals, page)
2. Wait for me to confirm before moving to the next page
3. Each file must be COMPLETE and PRODUCTION-READY — no "// TODO" comments, no placeholder sections, no "rest left as exercise"

Build order:
1. Page 1: Dashboard (dashboard/)
2. Page 2: Real-Time Monitor (real-time-monitor/)
3. Page 3: KPI Scorecard (kpi-scorecard/)
4. Page 4: User Directory (user-directory/)
5. Page 5: User Detail & Actions (user-detail/)
6. Page 6: KYC & Identity Verification (kyc-verification/)
7. Page 7: Account Lifecycle (account-lifecycle/)
8. Page 8: VIP Clients (vip-clients/)
9. Page 9: Transaction Ledger (transaction-ledger/)
10. Page 10: Fee & Charge Management (fee-management/)
11. Page 11: Settlement & Reconciliation (settlement-reconciliation/)
12. Page 12: Liquidity & Pool Management (liquidity-pools/)
13. Page 13: Withdrawal Controls (withdrawal-controls/)
14. Page 14: Tax & Compliance Reporting (tax-compliance/)
15. Page 15: Fraud Dashboard (fraud-dashboard/)
16. Page 16: Transaction Monitoring / SAR (sar-monitoring/)
17. Page 17: Risk Scoring Engine (risk-scoring/)
18. Page 18: AML & Sanctions (aml-sanctions/)
19. Page 19: Incident Response (incident-response/)
20. Page 20: Service Portfolio (service-portfolio/)
21. Page 21: Product Configuration (product-configuration/)
22. Page 22: Recurring Services (recurring-services/)
23. Page 23: Card Programs (card-programs/)
24. Page 24: Utility Services (utility-services/)
25. Page 25: Partner Directory (partner-directory/)
26. Page 26: Partner Onboarding (partner-onboarding/)
27. Page 27: Investor Dashboard (investor-dashboard/)
28. Page 28: Investor Reports (investor-reports/)
29. Page 29: Admin Management (admin-management/)
30. Page 30: Permissions & Roles (permissions-roles/)
31. Page 31: Audit Log (audit-log/)
32. Page 32: System Configuration (system-configuration/)
33. Page 33: API & Integrations (api-integrations/)
34. Page 34: Feature Flags (feature-flags/)
35. Page 35: Notification Center (notification-center/)
36. Page 36: Broadcast Messages (broadcast-messages/)
37. Page 37: Customer Support Queue (support-queue/)
38. Page 38: Terms & Conditions (terms-conditions/)
39. Page 39: Privacy Policy (privacy-policy/)
40. Page 40: Compliance Documents (compliance-documents/)
41. Page 41: Document Templates (document-templates/)
42. Page 42: Analytics & Reporting (analytics-reporting/)
43. Page 43: API Health & Interconnections (api-health-monitor/)

# START NOW

Begin with Page 1: Dashboard. Create all 4 files with COMPLETE, production-ready code. The dashboard page must include all 11 sections from the blueprint:
1. Header Bar (admin info, session timer, notifications, quick actions)
2. Portfolio Value Hero Card (full width, all metrics with sparklines)
3. Revenue Breakdown (donut + bar chart)
4. System Health Grid (3×3 cards with status indicators)
5. Critical Alerts Strip (scrollable, color-coded priority)
6. Transaction Volume Chart (24h live line chart with anomaly markers)
7. Defaulters & Credit Risk Summary (with red/green financial coloring)
8. Quick Actions Grid (3×4 icon buttons)
9. Recent Activity Feed (last 15, auto-refresh simulation)
10. Channel Distribution (donut + bar)
11. Upcoming Tasks & Deadlines table

Include modals for: Quick Action confirmations (freeze account, send broadcast, emergency lockdown), Alert detail drawer, Activity detail drawer, and Task detail modal.

Output the 4 complete files now. Do NOT abbreviate, truncate, or use "// ... rest of code" shortcuts. Every line must be written out fully.


