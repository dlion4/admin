import { PageStub } from "../../../components/PageStub";

export function AnalyticsDashboard({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  return (
    <PageStub
      icon="bi-pie-chart"
      title="Analytics Dashboard"
      subtitle="Self-serve explorer, scheduled reports and warehouse sync."
      sections={["Explorer", "Saved reports", "Schedules", "Warehouse"]}
      
      onNavigate={onNavigate}
    />
  );
}
