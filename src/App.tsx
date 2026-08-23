import { useCallback, useEffect, useState } from "react";
import { ToastHost } from "./components/ui";
import { AdminShell, type ShellAction } from "./shell/AdminShell";
import { ROUTE_REGISTRY, ALL_PAGE_IDS, type PageSignal } from "./shell/routeRegistry";

function AdminApp() {
  const getInitialPage = () => {
    const hashPage = window.location.hash.replace("#", "");
    return ALL_PAGE_IDS.includes(hashPage) ? hashPage : "dashboard";
  };
  const [page, setPage] = useState(getInitialPage);
  const [signal, setSignal] = useState<PageSignal>({ action: "", n: 0 });

  const fire = (action: ShellAction) => setSignal((s) => ({ action, n: s.n + 1 }));
  const navigate = useCallback((nextPage: string) => {
    setPage(nextPage);
    if (ALL_PAGE_IDS.includes(nextPage)) {
      window.history.replaceState(null, "", `#${nextPage}`);
    }
  }, []);

  useEffect(() => {
    const onHashChange = () => setPage(getInitialPage());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const ActivePage = ROUTE_REGISTRY[page];

  return (
    <AdminShell active={page} onNavigate={navigate} onPageAction={fire}>
      {ActivePage && <ActivePage signal={signal} onNavigate={navigate} />}
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
