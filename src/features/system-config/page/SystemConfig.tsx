import { PageStub } from "../../../components/PageStub";

export function SystemConfig({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  return (
    <PageStub
      icon="bi-toggles"
      title="System Configuration"
      subtitle="Environment config, secrets rotation and maintenance windows."
      sections={["Config keys", "Secrets", "Maintenance", "Backups"]}
      
      onNavigate={onNavigate}
    />
  );
}
