import { PageStub } from "../../../components/PageStub";

export function SarMonitoring({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  return (
    <PageStub
      icon="bi-binoculars"
      title="Transaction Monitoring"
      subtitle="Rule-based and ML monitoring producing SARs."
      sections={["Scenario library", "Case queue", "SAR filing", "FRA submission"]}
      
      onNavigate={onNavigate}
    />
  );
}
