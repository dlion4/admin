import { PageStub } from "../../../components/PageStub";

export function AdminManagement({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  return (
    <PageStub
      icon="bi-person-gear"
      title="Admin Management"
      subtitle="18 admin accounts across 9 role tiers with passkeys."
      sections={["Admin list", "Invite flow", "Passkey registry", "Session control"]}
      
      onNavigate={onNavigate}
    />
  );
}
