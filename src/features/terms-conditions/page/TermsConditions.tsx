import { PageStub } from "../../../components/PageStub";

export function TermsConditions({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  return (
    <PageStub
      icon="bi-file-text"
      title="Terms & Conditions"
      subtitle="Versioned T&C with legal review and user re-consent."
      sections={["Versions", "Diff", "Legal review", "Re-consent"]}
      
      onNavigate={onNavigate}
    />
  );
}
