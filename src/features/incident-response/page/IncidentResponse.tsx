import { PageStub } from "../../../components/PageStub";

export function IncidentResponse({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  return (
    <PageStub
      icon="bi-fire"
      title="Incident Response"
      subtitle="P1–P4 incident lifecycle with on-call and postmortems."
      sections={["Open incidents", "On-call roster", "Runbooks", "Postmortems"]}
      badge={1}
      onNavigate={onNavigate}
    />
  );
}
