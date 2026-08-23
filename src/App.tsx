import { useCallback, useEffect, useState } from "react";
import { ToastHost } from "./components/ui";
import { AdminShell, type ShellAction } from "./shell/AdminShell";

// Overview
import { Dashboard } from "./features/dashboard/page/Dashboard";
import { RealTimeMonitor } from "./features/monitor/page/RealTimeMonitor";
import { KpiScorecard } from "./features/kpi-scorecard/page/KpiScorecard";

// User Management
import { UserDirectory } from "./features/user-directory/page/UserDirectory";
import { UserDetail } from "./features/user-detail/page/UserDetail";
import { KycVerification } from "./features/kyc-verification/page/KycVerification";
import { AccountLifecycle } from "./features/account-lifecycle/page/AccountLifecycle";
import { VipClients } from "./features/vip-clients/page/VipClients";

// Transactions & Finance
import { TransactionLedger } from "./features/transaction-ledger/page/TransactionLedger";
import { FeeManagement } from "./features/fee-management/page/FeeManagement";
import { SettlementRecon } from "./features/settlement-recon/page/SettlementRecon";
import { LiquidityPools } from "./features/liquidity-pools/page/LiquidityPools";
import { WithdrawalControls } from "./features/withdrawal-controls/page/WithdrawalControls";
import { TaxCompliance } from "./features/tax-compliance/page/TaxCompliance";

// Fraud & Risk
import { FraudDashboard } from "./features/fraud-dashboard/page/FraudDashboard";
import { SarMonitoring } from "./features/sar-monitoring/page/SarMonitoring";
import { RiskScoring } from "./features/risk-scoring/page/RiskScoring";
import { AmlSanctions } from "./features/aml-sanctions/page/AmlSanctions";
import { IncidentResponse } from "./features/incident-response/page/IncidentResponse";

// Products & Services
import { ServicePortfolio } from "./features/service-portfolio/page/ServicePortfolio";
import { ProductConfig } from "./features/product-config/page/ProductConfig";
import { RecurringServices } from "./features/recurring-services/page/RecurringServices";
import { CardPrograms } from "./features/card-programs/page/CardPrograms";
import { UtilityServices } from "./features/utility-services/page/UtilityServices";

// Partners & Investors
import { PartnerDirectory } from "./features/partner-directory/page/PartnerDirectory";
import { PartnerOnboarding } from "./features/partner-onboarding/page/PartnerOnboarding";
import { InvestorDashboard } from "./features/investor-dashboard/page/InvestorDashboard";
import { InvestorReports } from "./features/investor-reports/page/InvestorReports";

// Platform Administration
import { AdminManagement } from "./features/admin-management/page/AdminManagement";
import { PermissionsRoles } from "./features/permissions-roles/page/PermissionsRoles";
import { AuditLog } from "./features/audit-log/page/AuditLog";
import { SystemConfig } from "./features/system-config/page/SystemConfig";
import { ApiIntegrations } from "./features/api-integrations/page/ApiIntegrations";
import { FeatureFlags } from "./features/feature-flags/page/FeatureFlags";
import { ApiHealth } from "./features/api-health/page/ApiHealth";

// Communications
import { NotificationCenter } from "./features/notifications/page/NotificationCenter";
import { BroadcastMessages } from "./features/broadcast/page/BroadcastMessages";
import { SupportQueue } from "./features/support-queue/page/SupportQueue";

// Documents & Legal
import { TermsConditions } from "./features/terms-conditions/page/TermsConditions";
import { PrivacyPolicy } from "./features/privacy-policy/page/PrivacyPolicy";
import { ComplianceDocs } from "./features/compliance-docs/page/ComplianceDocs";
import { DocumentTemplates } from "./features/document-templates/page/DocumentTemplates";

// Analytics
import { AnalyticsDashboard } from "./features/analytics-dashboard/page/AnalyticsDashboard";

const PAGES = [
  "dashboard", "monitor", "kpi", "user-directory", "user-detail", "kyc", "lifecycle", "vip",
  "ledger", "fees", "settlement", "liquidity", "withdrawals", "tax",
  "fraud", "sar", "risk-scoring", "aml", "incident",
  "portfolio", "product-config", "recurring", "cards", "utility",
  "partner-dir", "partner-onboard", "investor", "investor-reports",
  "admins", "roles", "audit", "sysconfig", "api", "flags", "api-health",
  "notifications", "broadcast", "support",
  "terms", "privacy", "compliance-docs", "templates", "analytics",
];

function AdminApp() {
  const getInitialPage = () => {
    const hashPage = window.location.hash.replace("#", "");
    return PAGES.includes(hashPage) ? hashPage : "tax";
  };
  const [page, setPage] = useState("tax");
  const [signal, setSignal] = useState<{ action: string; n: number }>({ action: "", n: 0 });

  const fire = (action: ShellAction) => setSignal((s) => ({ action, n: s.n + 1 }));
  const navigate = useCallback((nextPage: string) => {
    setPage(nextPage);
    if (PAGES.includes(nextPage)) {
      window.history.replaceState(null, "", `#${nextPage}`);
    }
  }, []);

  useEffect(() => {
    window.history.replaceState(null, "", "#tax");
    const onHashChange = () => setPage(getInitialPage());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const p = (id: string, Cmp: typeof Dashboard) =>
    page === id && <Cmp signal={signal} onNavigate={navigate} />;

  return (
    <AdminShell active={page} onNavigate={navigate} onPageAction={fire}>
      {/* Overview */}
      {p("dashboard", Dashboard)}
      {p("monitor", RealTimeMonitor)}
      {p("kpi", KpiScorecard)}

      {/* User Management */}
      {p("user-directory", UserDirectory)}
      {p("user-detail", UserDetail)}
      {p("kyc", KycVerification)}
      {p("lifecycle", AccountLifecycle)}
      {p("vip", VipClients)}

      {/* Transactions & Finance */}
      {p("ledger", TransactionLedger)}
      {p("fees", FeeManagement)}
      {p("settlement", SettlementRecon)}
      {p("liquidity", LiquidityPools)}
      {p("withdrawals", WithdrawalControls)}
      {p("tax", TaxCompliance)}

      {/* Fraud & Risk */}
      {p("fraud", FraudDashboard)}
      {p("sar", SarMonitoring)}
      {p("risk-scoring", RiskScoring)}
      {p("aml", AmlSanctions)}
      {p("incident", IncidentResponse)}

      {/* Products & Services */}
      {p("portfolio", ServicePortfolio)}
      {p("product-config", ProductConfig)}
      {p("recurring", RecurringServices)}
      {p("cards", CardPrograms)}
      {p("utility", UtilityServices)}

      {/* Partners & Investors */}
      {p("partner-dir", PartnerDirectory)}
      {p("partner-onboard", PartnerOnboarding)}
      {p("investor", InvestorDashboard)}
      {p("investor-reports", InvestorReports)}

      {/* Platform Administration */}
      {p("admins", AdminManagement)}
      {p("roles", PermissionsRoles)}
      {p("audit", AuditLog)}
      {p("sysconfig", SystemConfig)}
      {p("api", ApiIntegrations)}
      {p("flags", FeatureFlags)}
      {p("api-health", ApiHealth)}

      {/* Communications */}
      {p("notifications", NotificationCenter)}
      {p("broadcast", BroadcastMessages)}
      {p("support", SupportQueue)}

      {/* Documents & Legal */}
      {p("terms", TermsConditions)}
      {p("privacy", PrivacyPolicy)}
      {p("compliance-docs", ComplianceDocs)}
      {p("templates", DocumentTemplates)}

      {/* Analytics */}
      {p("analytics", AnalyticsDashboard)}
    </AdminShell>
  );
}

export default function App() {
  return (
    <ToastHost>
      <AdminApp />
    </ToastHost>
  );
}
