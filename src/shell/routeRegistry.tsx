import type { ComponentType } from "react";

// Overview
import { Dashboard } from "../features/dashboard/page/Dashboard";
import { RealTimeMonitor } from "../features/monitor/page/RealTimeMonitor";
import { KpiScorecard } from "../features/kpi-scorecard/page/KpiScorecard";

// User Management
import { UserDirectory } from "../features/user-directory/page/UserDirectory";
import { UserDetail } from "../features/user-detail/page/UserDetail";
import { KycVerification } from "../features/kyc-verification/page/KycVerification";
import { AccountLifecycle } from "../features/account-lifecycle/page/AccountLifecycle";
import { VipClients } from "../features/vip-clients/page/VipClients";

// Transactions & Finance
import { TransactionLedger } from "../features/transaction-ledger/page/TransactionLedger";
import { FeeManagement } from "../features/fee-management/page/FeeManagement";
import { SettlementRecon } from "../features/settlement-recon/page/SettlementRecon";
import { LiquidityPools } from "../features/liquidity-pools/page/LiquidityPools";
import { WithdrawalControls } from "../features/withdrawal-controls/page/WithdrawalControls";
import { TaxCompliance } from "../features/tax-compliance/page/TaxCompliance";

// Fraud & Risk
import { FraudDashboard } from "../features/fraud-dashboard/page/FraudDashboard";
import { SarMonitoring } from "../features/sar-monitoring/page/SarMonitoring";
import { RiskScoring } from "../features/risk-scoring/page/RiskScoring";
import { AmlSanctions } from "../features/aml-sanctions/page/AmlSanctions";
import { IncidentResponse } from "../features/incident-response/page/IncidentResponse";

// Products & Services
import { ServicePortfolio } from "../features/service-portfolio/page/ServicePortfolio";
import { ProductConfig } from "../features/product-config/page/ProductConfig";
import { RecurringServices } from "../features/recurring-services/page/RecurringServices";
import { CardPrograms } from "../features/card-programs/page/CardPrograms";
import { UtilityServices } from "../features/utility-services/page/UtilityServices";

// Partners & Investors
import { PartnerDirectory } from "../features/partner-directory/page/PartnerDirectory";
import { PartnerOnboarding } from "../features/partner-onboarding/page/PartnerOnboarding";
import { InvestorDashboard } from "../features/investor-dashboard/page/InvestorDashboard";
import { InvestorReports } from "../features/investor-reports/page/InvestorReports";

// Platform Administration
import { AdminManagement } from "../features/admin-management/page/AdminManagement";
import { PermissionsRoles } from "../features/permissions-roles/page/PermissionsRoles";
import { AuditLog } from "../features/audit-log/page/AuditLog";
import { SystemConfig } from "../features/system-config/page/SystemConfig";
import { ApiIntegrations } from "../features/api-integrations/page/ApiIntegrations";
import { FeatureFlags } from "../features/feature-flags/page/FeatureFlags";
import { ApiHealth } from "../features/api-health/page/ApiHealth";

// Communications
import { NotificationCenter } from "../features/notifications/page/NotificationCenter";
import { BroadcastMessages } from "../features/broadcast/page/BroadcastMessages";
import { SupportQueue } from "../features/support-queue/page/SupportQueue";

// Documents & Legal
import { TermsConditions } from "../features/terms-conditions/page/TermsConditions";
import { PrivacyPolicy } from "../features/privacy-policy/page/PrivacyPolicy";
import { ComplianceDocs } from "../features/compliance-docs/page/ComplianceDocs";
import { DocumentTemplates } from "../features/document-templates/page/DocumentTemplates";

// Analytics
import { AnalyticsDashboard } from "../features/analytics-dashboard/page/AnalyticsDashboard";

export type PageSignal = { action: string; n: number };
export type PageProps = { signal: PageSignal; onNavigate: (id: string) => void };

/**
 * Route registry — maps every navigation ID to its page component.
 *
 * TO ADD A NEW PAGE:
 *   1. Create the component in src/features/<name>/page/<Name>.tsx
 *   2. Import it above
 *   3. Add an entry here:  "page-id": MyComponent,
 *   4. Add the matching entry in navigation.ts  (id must match the key)
 *   5. Run:  npx tsx src/scripts/validate-routes.ts   ← checks everything is wired
 */
export const ROUTE_REGISTRY: Record<string, ComponentType<PageProps>> = {
  // Overview
  "dashboard":     Dashboard,
  "monitor":       RealTimeMonitor,
  "kpi":           KpiScorecard,

  // User Management
  "user-directory": UserDirectory,
  "user-detail":    UserDetail,
  "kyc":            KycVerification,
  "lifecycle":      AccountLifecycle,
  "vip":            VipClients,

  // Transactions & Finance
  "ledger":      TransactionLedger,
  "fees":        FeeManagement,
  "settlement":  SettlementRecon,
  "liquidity":   LiquidityPools,
  "withdrawals": WithdrawalControls,
  "tax":         TaxCompliance,

  // Fraud & Risk
  "fraud":        FraudDashboard,
  "sar":          SarMonitoring,
  "risk-scoring": RiskScoring,
  "aml":          AmlSanctions,
  "incident":     IncidentResponse,

  // Products & Services
  "portfolio":      ServicePortfolio,
  "product-config": ProductConfig,
  "recurring":      RecurringServices,
  "cards":          CardPrograms,
  "utility":        UtilityServices,

  // Partners & Investors
  "partner-dir":      PartnerDirectory,
  "partner-onboard":  PartnerOnboarding,
  "investor":         InvestorDashboard,
  "investor-reports": InvestorReports,

  // Platform Administration
  "admins":     AdminManagement,
  "roles":      PermissionsRoles,
  "audit":      AuditLog,
  "sysconfig":  SystemConfig,
  "api":        ApiIntegrations,
  "flags":      FeatureFlags,
  "api-health": ApiHealth,

  // Communications
  "notifications": NotificationCenter,
  "broadcast":     BroadcastMessages,
  "support":       SupportQueue,

  // Documents & Legal
  "terms":           TermsConditions,
  "privacy":         PrivacyPolicy,
  "compliance-docs": ComplianceDocs,
  "templates":       DocumentTemplates,

  // Analytics
  "analytics": AnalyticsDashboard,
};

/** All valid page IDs derived from the registry — use this instead of maintaining a separate PAGES array. */
export const ALL_PAGE_IDS = Object.keys(ROUTE_REGISTRY);
