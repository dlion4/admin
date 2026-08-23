import { EmptyState } from "./ui";

export function PageStub({
  icon,
  title,
  subtitle,
  sections,
  badge,
  onNavigate,
}: {
  icon: string;
  title: string;
  subtitle: string;
  sections: string[];
  badge?: number;
  onNavigate: (id: string) => void;
}) {
  return (
    <>
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="pm-eyebrow">{title}</span>
            {badge !== undefined && badge > 0 && (
              <span className="pm-badge" style={{ background: "rgba(240,68,56,.12)", borderColor: "rgba(240,68,56,.35)", color: "#f04438" }}>
                {badge}
              </span>
            )}
          </div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="row g-3">
        {sections.map((s) => (
          <div className="col-12 col-md-6 col-xl-4" key={s}>
            <div className="pm-card h-100">
              <div className="pm-card-head">
                <div><h6 className="pm-card-title">{s}</h6></div>
              </div>
              <div className="pm-card-pad d-flex align-items-center justify-content-center" style={{ minHeight: 120 }}>
                <EmptyState icon={icon} title={s} body="This section is under development." />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pm-card mt-3">
        <div className="pm-card-pad">
          <EmptyState
            icon={icon}
            title={`${title} — Coming soon`}
            body="This module is being built. Full functionality will be available in a future release."
          />
        </div>
      </div>
    </>
  );
}
