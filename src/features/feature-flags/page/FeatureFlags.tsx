import { PageStub } from "../../../components/PageStub";

export function FeatureFlags({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  return (
    <PageStub
      icon="bi-flag"
      title="Feature Flags"
      subtitle="LaunchDarkly-backed flags with targeting and kill switches."
      sections={["Flag list", "Targeting", "Kill switches", "Rollout"]}
      
      onNavigate={onNavigate}
    />
  );
}
