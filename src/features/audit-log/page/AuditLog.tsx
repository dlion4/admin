import { PageStub } from "../../../components/PageStub";

export function AuditLog({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  return (
    <PageStub
      icon="bi-list-check"
      title="Audit Log"
      subtitle="Immutable audit trail of every admin action."
      sections={["Search", "Actor filter", "Diff viewer", "Legal export"]}
      
      onNavigate={onNavigate}
    />
  );
}
