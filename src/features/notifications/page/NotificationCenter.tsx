import { PageStub } from "../../../components/PageStub";

export function NotificationCenter({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  return (
    <PageStub
      icon="bi-bell"
      title="Notification Center"
      subtitle="Template registry and delivery analytics for push/SMS/email."
      sections={["Templates", "Delivery rates", "Channels", "Opt-outs"]}
      badge={9}
      onNavigate={onNavigate}
    />
  );
}
