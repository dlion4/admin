import { PageStub } from "../../../components/PageStub";

export function ApiHealth({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  return (
    <PageStub
      icon="bi-activity"
      title="API Health & Interconnect"
      subtitle="Circuit breakers, callbacks, DLQ and dependency map."
      sections={["Circuit breakers", "Callback registry", "DLQ", "Latency heatmap", "Impact analysis"]}
      badge={23}
      onNavigate={onNavigate}
    />
  );
}
