import { PageStub } from "../../../components/PageStub";

export function BroadcastMessages({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  return (
    <PageStub
      icon="bi-send"
      title="Broadcast Messages"
      subtitle="Segment-targeted broadcasts with approval workflow."
      sections={["Composer", "Segments", "Approval", "Send history"]}
      
      onNavigate={onNavigate}
    />
  );
}
