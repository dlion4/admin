import { PageStub } from "../../../components/PageStub";

export function InvestorReports({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  return (
    <PageStub
      icon="bi-file-earmark-bar-graph"
      title="Investor Reports"
      subtitle="Quarterly reports, dividend runs and data-room access."
      sections={["Report builder", "Dividends", "Data room", "Access log"]}
      
      onNavigate={onNavigate}
    />
  );
}
