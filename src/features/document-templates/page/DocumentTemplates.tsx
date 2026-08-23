import { PageStub } from "../../../components/PageStub";

export function DocumentTemplates({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  return (
    <PageStub
      icon="bi-files"
      title="Document Templates"
      subtitle="Statement, receipt and notice templates with merge fields."
      sections={["Template list", "Merge fields", "Preview", "Publish"]}
      
      onNavigate={onNavigate}
    />
  );
}
