import { PageStub } from "../../../components/PageStub";

export function ServicePortfolio({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  return (
    <PageStub
      icon="bi-collection"
      title="Service Portfolio"
      subtitle="Catalogue of all 24 live PayMo services and their P&L."
      sections={["Service list", "Adoption", "Revenue per service", "Lifecycle stage"]}
      
      onNavigate={onNavigate}
    />
  );
}
