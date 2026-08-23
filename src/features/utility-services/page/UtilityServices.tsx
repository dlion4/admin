import { PageStub } from "../../../components/PageStub";

export function UtilityServices({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  return (
    <PageStub
      icon="bi-lightning-charge"
      title="Utility Services"
      subtitle="Airtime, KPLC, water, DStv and government bill aggregators."
      sections={["Biller registry", "Commission grid", "Downtime", "Reconciliation"]}
      
      onNavigate={onNavigate}
    />
  );
}
