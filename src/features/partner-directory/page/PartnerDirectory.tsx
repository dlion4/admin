import { PageStub } from "../../../components/PageStub";

export function PartnerDirectory({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  return (
    <PageStub
      icon="bi-buildings"
      title="Partner Directory"
      subtitle="42 active partners with contracts, fees and settlement status."
      sections={["Partner list", "Contracts", "Fee terms", "Settlement status"]}
      
      onNavigate={onNavigate}
    />
  );
}
