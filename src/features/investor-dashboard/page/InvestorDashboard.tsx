import { PageStub } from "../../../components/PageStub";

export function InvestorDashboard({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  return (
    <PageStub
      icon="bi-graph-up-arrow"
      title="Investor Dashboard"
      subtitle="Cap table, valuation history and investor KPIs."
      sections={["Cap table", "Valuation", "Runway", "Board pack"]}
      
      onNavigate={onNavigate}
    />
  );
}
