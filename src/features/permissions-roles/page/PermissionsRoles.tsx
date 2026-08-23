import { PageStub } from "../../../components/PageStub";

export function PermissionsRoles({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  return (
    <PageStub
      icon="bi-diagram-3"
      title="Permissions & Roles"
      subtitle="Role tiers and the 64-cell permission matrix."
      sections={["Role tiers", "Permission matrix", "Custom roles", "Change history"]}
      
      onNavigate={onNavigate}
    />
  );
}
