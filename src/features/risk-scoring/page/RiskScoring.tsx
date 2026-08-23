import { PageStub } from "../../../components/PageStub";

export function RiskScoring({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  return (
    <PageStub
      icon="bi-sliders2"
      title="Risk Scoring Engine"
      subtitle="Feature weights, model versions and score distribution."
      sections={["Model registry", "Feature weights", "Score bands", "Backtesting"]}
      
      onNavigate={onNavigate}
    />
  );
}
