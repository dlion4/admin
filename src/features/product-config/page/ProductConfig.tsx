import { PageStub } from "../../../components/PageStub";

export function ProductConfig({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  return (
    <PageStub
      icon="bi-gear-wide-connected"
      title="Product Configuration"
      subtitle="Per-product parameters, limits and eligibility rules."
      sections={["Parameters", "Eligibility", "Rollout rings", "Versioning"]}
      
      onNavigate={onNavigate}
    />
  );
}
