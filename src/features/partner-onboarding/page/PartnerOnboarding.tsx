import { PageStub } from "../../../components/PageStub";

export function PartnerOnboarding({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  return (
    <PageStub
      icon="bi-node-plus"
      title="Partner Onboarding"
      subtitle="Application → due diligence → sandbox → go-live pipeline."
      sections={["Applications", "Due diligence", "Sandbox keys", "Go-live checklist"]}
      badge={12}
      onNavigate={onNavigate}
    />
  );
}
