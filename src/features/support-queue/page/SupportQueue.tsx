import { PageStub } from "../../../components/PageStub";

export function SupportQueue({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  return (
    <PageStub
      icon="bi-headset"
      title="Customer Support Queue"
      subtitle="Ticket queue with SLA timers and agent workload."
      sections={["Queue", "SLA", "Agent load", "Macros"]}
      badge={12}
      onNavigate={onNavigate}
    />
  );
}
