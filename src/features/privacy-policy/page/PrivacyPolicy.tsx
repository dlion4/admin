import { PageStub } from "../../../components/PageStub";

export function PrivacyPolicy({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  return (
    <PageStub
      icon="bi-incognito"
      title="Privacy Policy"
      subtitle="ODPC-aligned privacy policy and DSAR handling."
      sections={["Policy versions", "DSAR queue", "Retention", "Consent"]}
      
      onNavigate={onNavigate}
    />
  );
}
