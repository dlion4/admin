import { PageStub } from "../../../components/PageStub";

export function AmlSanctions({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  return (
    <PageStub
      icon="bi-globe-americas"
      title="AML & Sanctions"
      subtitle="Sanctions screening, PEP lists and adverse media."
      sections={["Watchlists", "Screening hits", "PEP review", "Audit trail"]}
      
      onNavigate={onNavigate}
    />
  );
}
