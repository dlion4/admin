import { PageStub } from "../../../components/PageStub";

export function ApiIntegrations({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  return (
    <PageStub
      icon="bi-plug"
      title="API & Integrations"
      subtitle="API keys, webhooks, rate limits and partner sandboxes."
      sections={["Keys", "Webhooks", "Rate limits", "Docs"]}
      
      onNavigate={onNavigate}
    />
  );
}
