import { PageStub } from "../../../components/PageStub";

export function RecurringServices({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  return (
    <PageStub
      icon="bi-arrow-clockwise"
      title="Recurring Services"
      subtitle="Standing orders, subscriptions and scheduled disbursements."
      sections={["Mandates", "Retry policy", "Dunning", "Churn"]}
      
      onNavigate={onNavigate}
    />
  );
}
