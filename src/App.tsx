import { useCallback, useEffect, useState } from "react";
import { ToastHost } from "./components/ui";
import { AdminShell, type ShellAction } from "./shell/AdminShell";
import { Dashboard } from "./features/dashboard/page/Dashboard";
import { RealTimeMonitor } from "./features/monitor/page/RealTimeMonitor";
import { KpiScorecard } from "./features/kpi-scorecard/page/KpiScorecard";
import { UserDirectory } from "./features/user-directory/page/UserDirectory";
import { UserDetail } from "./features/user-detail/page/UserDetail";
import { KycVerification } from "./features/kyc-verification/page/KycVerification";
import { AccountLifecycle } from "./features/account-lifecycle/page/AccountLifecycle";
import { VipClients } from "./features/vip-clients/page/VipClients";
import { TransactionLedger } from "./features/transaction-ledger/page/TransactionLedger";
import { FeeManagement } from "./features/fee-management/page/FeeManagement";
import { SettlementRecon } from "./features/settlement-recon/page/SettlementRecon";
import { LiquidityPools } from "./features/liquidity-pools/page/LiquidityPools";

const PAGES = ["dashboard", "monitor", "kpi", "user-directory", "user-detail", "kyc", "lifecycle", "vip", "ledger", "fees", "settlement", "liquidity"];

function AdminApp() {
  const getInitialPage = () => {
    const hashPage = window.location.hash.replace("#", "");
    return PAGES.includes(hashPage) ? hashPage : "liquidity";
  };
  // Open the page currently under construction in preview; hash navigation still works afterward.
  const [page, setPage] = useState("liquidity");
  const [signal, setSignal] = useState<{ action: string; n: number }>({ action: "", n: 0 });

  const fire = (action: ShellAction) => setSignal((s) => ({ action, n: s.n + 1 }));
  const navigate = useCallback((nextPage: string) => {
    setPage(nextPage);
    if (PAGES.includes(nextPage)) {
      window.history.replaceState(null, "", `#${nextPage}`);
    }
  }, []);

  useEffect(() => {
    window.history.replaceState(null, "", "#liquidity");
    const onHashChange = () => setPage(getInitialPage());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <AdminShell active={page} onNavigate={navigate} onPageAction={fire}>
      {page === "dashboard" && <Dashboard signal={signal} onNavigate={navigate} />}
      {page === "monitor" && <RealTimeMonitor signal={signal} onNavigate={navigate} />}
      {page === "kpi" && <KpiScorecard signal={signal} onNavigate={navigate} />}
      {page === "user-directory" && <UserDirectory signal={signal} onNavigate={navigate} />}
      {page === "user-detail" && <UserDetail signal={signal} onNavigate={navigate} />}
      {page === "kyc" && <KycVerification signal={signal} onNavigate={navigate} />}
      {page === "lifecycle" && <AccountLifecycle signal={signal} onNavigate={navigate} />}
      {page === "vip" && <VipClients signal={signal} onNavigate={navigate} />}
      {page === "ledger" && <TransactionLedger signal={signal} onNavigate={navigate} />}
      {page === "fees" && <FeeManagement signal={signal} onNavigate={navigate} />}
      {page === "settlement" && <SettlementRecon signal={signal} onNavigate={navigate} />}
      {page === "liquidity" && <LiquidityPools signal={signal} onNavigate={navigate} />}
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
