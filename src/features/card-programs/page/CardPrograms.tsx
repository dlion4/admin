import { PageStub } from "../../../components/PageStub";

export function CardPrograms({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  return (
    <PageStub
      icon="bi-credit-card-2-front"
      title="Card Programs"
      subtitle="Visa & Mastercard BIN ranges, issuance and chargebacks."
      sections={["BIN registry", "Issuance queue", "Chargebacks", "Scheme fees"]}
      
      onNavigate={onNavigate}
    />
  );
}
