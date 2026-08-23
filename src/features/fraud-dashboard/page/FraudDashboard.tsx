import { PageStub } from "../../../components/PageStub";

export function FraudDashboard({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  return (
    <PageStub
      icon="bi-shield-exclamation"
      title="Fraud Dashboard"
      subtitle="Fraud loss, alert triage and rule performance."
      sections={["Loss metrics", "Alert queue", "Rule hit rates", "Blacklist"]}
      badge={23}
      onNavigate={onNavigate}
    />
  );
}
