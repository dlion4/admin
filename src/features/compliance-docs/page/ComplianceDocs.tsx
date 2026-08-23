import { PageStub } from "../../../components/PageStub";

export function ComplianceDocs({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  return (
    <PageStub
      icon="bi-folder-check"
      title="Compliance Documents"
      subtitle="CBK licences, audits and regulator correspondence."
      sections={["Licences", "Audit reports", "Correspondence", "Expiry alerts"]}
      
      onNavigate={onNavigate}
    />
  );
}
