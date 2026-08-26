import { useState, useMemo, useCallback } from "react";
import { Badge, Drawer, Modal, Steps, useToast } from "../../../components/ui";
import type {
  DashboardRecord,
  ScheduledReportRecord,
  ModelRecord,
  CohortRecord,
  FunnelRecord,
  QueryTemplateRecord,
  DataSourceRecord,
} from "../data/analyticsData";
import {
  initialDashboards,
  initialScheduledReports,
  initialModels,
  initialCohorts,
  initialFunnels,
  initialQueryTemplates,
  initialDataSources,
} from "../data/analyticsData";
import {
  AddDashboardModal,
  EditDashboardModal,
  DeleteDashboardWizard,
  LockUnlockDashboardModal,
  AddScheduledReportModal,
  EditScheduledReportModal,
  DeleteReportWizard,
  LockUnlockReportModal,
  AddModelModal,
  EditModelModal,
  DeleteModelWizard,
  LockUnlockModelModal,
  AddCohortModal,
  EditCohortModal,
  DeleteCohortWizard,
  LockUnlockCohortModal,
  AddFunnelModal,
  EditFunnelModal,
  DeleteFunnelWizard,
  LockUnlockFunnelModal,
  ComplianceAuditTrailDrawer,
  AdminPermissionsDrawer,
  EmergencyDataActionsModal,
  DataExportImportModal,
  DataSourceConfigWizard,
  AddQueryTemplateModal,
  LockUnlockQueryModal,
  LockUnlockDataSourceModal,
} from "../modals/AnalyticsModals";

/* ================================================================
   Helper – admin action bar for every record row
   ================================================================ */
function AdminRowActions({
  onEdit,
  onLock,
  onDelete,
  locked,
}: {
  onEdit: () => void;
  onLock: () => void;
  onDelete: () => void;
  locked: boolean;
}) {
  return (
    <div className="d-flex gap-1 justify-content-end">
      <button
        className="btn btn-sm btn-outline-primary"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        title="Edit"
      >
        <i className="bi bi-pencil-square" />
      </button>
      <button
        className="btn btn-sm btn-outline-secondary"
        onClick={(e) => {
          e.stopPropagation();
          onLock();
        }}
        title={locked ? "Unlock" : "Lock"}
      >
        <i className={`bi ${locked ? "bi-unlock" : "bi-lock"}`} />
      </button>
      <button
        className="btn btn-sm btn-outline-danger"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        title="Delete"
      >
        <i className="bi bi-trash3" />
      </button>
    </div>
  );
}

/* ================================================================
   Helper – quick action button
   ================================================================ */
function QA({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button className="pm-qa" onClick={onClick}>
      <i className={`bi ${icon}`} />
      <span className="t">{label}</span>
    </button>
  );
}

/* ================================================================
   Reusable config row
   ================================================================ */
function ConfigRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="config-row">
      <b>{label}</b>
      <span className="pm-td-sub">{value}</span>
    </div>
  );
}

/* ================================================================
   Reusable section head
   ================================================================ */
function Head({
  title,
  body,
  action,
  actionLabel,
  actionIcon,
}: {
  title: string;
  body: string;
  action: () => void;
  actionLabel?: string;
  actionIcon?: string;
}) {
  return (
    <div className="pm-section-head">
      <div>
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
      <button
        className="btn btn-outline-secondary btn-sm"
        onClick={action}
      >
        <i className={`bi ${actionIcon || "bi-download"} me-1`} />
        {actionLabel || "Export / manage"}
      </button>
    </div>
  );
}

/* ================================================================
   Main Dashboard Component
   ================================================================ */
export function AnalyticsDashboard({
  signal: _signal,
}: {
  signal: { action: string; n: number };
  onNavigate: (id: string) => void;
}) {
  const { push } = useToast();

  /* ---- tab state ---- */
  const [tab, setTab] = useState("overview");

  /* ---- data state ---- */
  const [dashboards, setDashboards] = useState(initialDashboards);
  const [reports, setReports] = useState(initialScheduledReports);
  const [models, setModels] = useState(initialModels);
  const [cohorts, setCohorts] = useState(initialCohorts);
  const [funnels, setFunnels] = useState(initialFunnels);
  const [queries, setQueries] = useState(initialQueryTemplates);
  const [activeSources, setSources] = useState(initialDataSources);

  /* ---- generic confirm/action modal ---- */
  const [action, setAction] = useState<{
    title: string;
    body: React.ReactNode;
    icon?: string;
    tone?: "green" | "red" | "amber" | "blue" | "violet" | "ink";
  } | null>(null);

  /* ---- drawers ---- */
  const [drawerGov, setDrawerGov] = useState(false);
  const [drawerAudit, setDrawerAudit] = useState(false);
  const [drawerPerms, setDrawerPerms] = useState(false);

  /* ---- wizard (build dashboard) ---- */
  const [wizard, setWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);

  /* ---- modal visibility & records ---- */
  // Dashboard CRUD
  const [showAddDash, setShowAddDash] = useState(false);
  const [editDash, setEditDash] = useState<DashboardRecord | null>(null);
  const [deleteDash, setDeleteDash] = useState<DashboardRecord | null>(null);
  const [lockDash, setLockDash] = useState<DashboardRecord | null>(null);

  // Report CRUD
  const [showAddReport, setShowAddReport] = useState(false);
  const [editReport, setEditReport] = useState<ScheduledReportRecord | null>(null);
  const [deleteReport, setDeleteReport] = useState<ScheduledReportRecord | null>(null);
  const [lockReport, setLockReport] = useState<ScheduledReportRecord | null>(null);

  // Model CRUD
  const [showAddModel, setShowAddModel] = useState(false);
  const [editModel, setEditModel] = useState<ModelRecord | null>(null);
  const [deleteModel, setDeleteModel] = useState<ModelRecord | null>(null);
  const [lockModel, setLockModel] = useState<ModelRecord | null>(null);

  // Cohort CRUD
  const [showAddCohort, setShowAddCohort] = useState(false);
  const [editCohort, setEditCohort] = useState<CohortRecord | null>(null);
  const [deleteCohort, setDeleteCohort] = useState<CohortRecord | null>(null);
  const [lockCohort, setLockCohort] = useState<CohortRecord | null>(null);

  // Funnel CRUD
  const [showAddFunnel, setShowAddFunnel] = useState(false);
  const [editFunnel, setEditFunnel] = useState<FunnelRecord | null>(null);
  const [deleteFunnel, setDeleteFunnel] = useState<FunnelRecord | null>(null);
  const [lockFunnel, setLockFunnel] = useState<FunnelRecord | null>(null);

  // Query CRUD
  const [showAddQuery, setShowAddQuery] = useState(false);
  const [lockQuery, setLockQuery] = useState<QueryTemplateRecord | null>(null);

  // Data source
  const [lockSource, setLockSource] = useState<DataSourceRecord | null>(null);
  const [showDsWizard, setShowDsWizard] = useState(false);

  // Emergency & Export
  const [showEmergency, setShowEmergency] = useState(false);
  const [showExport, setShowExport] = useState(false);

  /* ---- computed stats ---- */
  const stats = useMemo(
    () => ({
      dashboards: dashboards.length,
      reports: reports.length,
      queries: queries.length,
      sources: activeSources.filter((s) => s.status === "Connected").length,
    }),
    [dashboards, reports, queries, activeSources]
  );

  /* ---- CRUD handlers ---- */
  const handleAddDash = useCallback(
    (d: DashboardRecord) => setDashboards((p) => [d, ...p]),
    []
  );
  const handleSaveDash = useCallback(
    (d: DashboardRecord) =>
      setDashboards((p) => p.map((x) => (x.id === d.id ? d : x))),
    []
  );
  const handleDeleteDash = useCallback(
    (id: string) => setDashboards((p) => p.filter((x) => x.id !== id)),
    []
  );
  const handleToggleLockDash = useCallback(
    (id: string, locked: boolean) =>
      setDashboards((p) =>
        p.map((x) =>
          x.id === id
            ? {
                ...x,
                locked,
                lockedBy: locked ? "Super Admin" : undefined,
                lockedAt: locked ? new Date().toLocaleDateString() : undefined,
                lockReason: locked ? "Manual lock" : undefined,
              }
            : x
        )
      ),
    []
  );

  const handleAddReport = useCallback(
    (r: ScheduledReportRecord) => setReports((p) => [r, ...p]),
    []
  );
  const handleSaveReport = useCallback(
    (r: ScheduledReportRecord) =>
      setReports((p) => p.map((x) => (x.id === r.id ? r : x))),
    []
  );
  const handleDeleteReport = useCallback(
    (id: string) => setReports((p) => p.filter((x) => x.id !== id)),
    []
  );
  const handleToggleLockReport = useCallback(
    (id: string, locked: boolean) =>
      setReports((p) =>
        p.map((x) =>
          x.id === id
            ? {
                ...x,
                locked,
                lockedBy: locked ? "Super Admin" : undefined,
                lockedAt: locked ? new Date().toLocaleDateString() : undefined,
                lockReason: locked ? "Manual lock" : undefined,
              }
            : x
        )
      ),
    []
  );

  const handleAddModel = useCallback(
    (m: ModelRecord) => setModels((p) => [m, ...p]),
    []
  );
  const handleSaveModel = useCallback(
    (m: ModelRecord) =>
      setModels((p) => p.map((x) => (x.id === m.id ? m : x))),
    []
  );
  const handleDeleteModel = useCallback(
    (id: string) => setModels((p) => p.filter((x) => x.id !== id)),
    []
  );
  const handleToggleLockModel = useCallback(
    (id: string, locked: boolean) =>
      setModels((p) =>
        p.map((x) =>
          x.id === id
            ? {
                ...x,
                locked,
                lockedBy: locked ? "Super Admin" : undefined,
                lockedAt: locked ? new Date().toLocaleDateString() : undefined,
                lockReason: locked ? "Manual lock" : undefined,
              }
            : x
        )
      ),
    []
  );

  const handleAddCohort = useCallback(
    (c: CohortRecord) => setCohorts((p) => [c, ...p]),
    []
  );
  const handleSaveCohort = useCallback(
    (c: CohortRecord) =>
      setCohorts((p) => p.map((x) => (x.id === c.id ? c : x))),
    []
  );
  const handleDeleteCohort = useCallback(
    (id: string) => setCohorts((p) => p.filter((x) => x.id !== id)),
    []
  );
  const handleToggleLockCohort = useCallback(
    (id: string, locked: boolean) =>
      setCohorts((p) =>
        p.map((x) =>
          x.id === id
            ? {
                ...x,
                locked,
                lockedBy: locked ? "Super Admin" : undefined,
                lockedAt: locked ? new Date().toLocaleDateString() : undefined,
                lockReason: locked ? "Manual lock" : undefined,
              }
            : x
        )
      ),
    []
  );

  const handleAddFunnel = useCallback(
    (f: FunnelRecord) => setFunnels((p) => [f, ...p]),
    []
  );
  const handleSaveFunnel = useCallback(
    (f: FunnelRecord) =>
      setFunnels((p) => p.map((x) => (x.id === f.id ? f : x))),
    []
  );
  const handleDeleteFunnel = useCallback(
    (id: string) => setFunnels((p) => p.filter((x) => x.id !== id)),
    []
  );
  const handleToggleLockFunnel = useCallback(
    (id: string, locked: boolean) =>
      setFunnels((p) =>
        p.map((x) =>
          x.id === id
            ? {
                ...x,
                locked,
                lockedBy: locked ? "Super Admin" : undefined,
                lockedAt: locked ? new Date().toLocaleDateString() : undefined,
                lockReason: locked ? "Manual lock" : undefined,
              }
            : x
        )
      ),
    []
  );

  const handleAddQuery = useCallback(
    (q: QueryTemplateRecord) => setQueries((p) => [q, ...p]),
    []
  );
  const handleToggleLockQuery = useCallback(
    (id: string, locked: boolean) =>
      setQueries((p) =>
        p.map((x) =>
          x.id === id
            ? {
                ...x,
                locked,
                lockedBy: locked ? "Super Admin" : undefined,
                lockedAt: locked ? new Date().toLocaleDateString() : undefined,
                lockReason: locked ? "Manual lock" : undefined,
              }
            : x
        )
      ),
    []
  );

  /* ---- render ---- */
  return (
    <div className="pm-page-content analytics-page">
      {/* ============ HEADER ============ */}
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="pm-eyebrow">ANALYTICS & REPORTING / PAGE 42</div>
          <h2 className="mb-1">Analytics & Reporting</h2>
          <p>
            Explore platform data, build dashboards, schedule reports and
            govern secure data access.
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setDrawerAudit(true)}
          >
            <i className="bi bi-clock-history me-1" />
            Audit trail
          </button>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setDrawerPerms(true)}
          >
            <i className="bi bi-shield-lock me-1" />
            Permissions
          </button>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setDrawerGov(true)}
          >
            <i className="bi bi-gear me-1" />
            Data governance
          </button>
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={() => setShowEmergency(true)}
          >
            <i className="bi bi-exclamation-triangle me-1" />
            Emergency
          </button>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => setWizard(true)}
          >
            <i className="bi bi-magic me-1" />
            Build dashboard
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() =>
              setShowExport(true)
            }
          >
            <i className="bi bi-download me-1" />
            Export snapshot
          </button>
        </div>
      </div>

      {/* ============ HERO ============ */}
      <div className="pm-hero analytics-hero mb-3">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <div className="pm-eyebrow text-white-50">
              ANALYTICS CONTROL PLANE · LIVE
            </div>
            <div className="pm-hero-value">
              {stats.dashboards}{" "}
              <span className="fs-6 fw-normal text-white-50">
                saved dashboards
              </span>
            </div>
            <div className="small text-white-50 mt-2">
              {stats.reports} scheduled reports · {stats.queries} ad-hoc
              queries in 30d · 45M rows exported
            </div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <div className="pm-hero-chip">
              <div className="l">Avg generation</div>
              <div className="v">12.3s</div>
            </div>
            <div className="pm-hero-chip">
              <div className="l">Most viewed</div>
              <div className="v">Executive Summary</div>
            </div>
            <div className="pm-hero-chip">
              <div className="l">Data sources</div>
              <div className="v text-success">{stats.sources}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ STAT CARDS ============ */}
      <div className="row g-3 mb-3">
        {[
          ["Saved dashboards", String(stats.dashboards), "Personal and team views", "bi-grid", "green"],
          ["Scheduled reports", String(stats.reports), "Daily to quarterly", "bi-calendar2-week", "blue"],
          ["Ad-hoc queries", String(stats.queries), "Last 30 days", "bi-terminal", "violet"],
          ["Data sources", String(stats.sources), `${activeSources.length} total`, "bi-database", "amber"],
        ].map((x) => (
          <div className="col-6 col-xl-3" key={x[0]}>
            <div className="pm-stat">
              <div
                className={`pm-stat-ico bg-${x[4]}-soft text-${x[4]}`}
              >
                <i className={`bi ${x[3]}`} />
              </div>
              <div className="pm-stat-label">{x[0]}</div>
              <div className="pm-stat-value">{x[1]}</div>
              <div className="pm-stat-foot">{x[2]}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ============ TABS ============ */}
      <div className="pm-card mb-3">
        <div className="pm-tabs">
          {[
            ["overview", "Dashboards", "bi-grid"],
            ["builder", "Dashboard builder", "bi-magic"],
            ["reports", "Report builder", "bi-file-earmark-bar-graph"],
            ["scheduled", "Scheduled reports", "bi-calendar2-week"],
            ["explore", "Data explorer", "bi-terminal"],
            ["cohorts", "Cohort analysis", "bi-people"],
            ["funnels", "Funnel analysis", "bi-funnel"],
            ["models", "Predictive analytics", "bi-cpu"],
            ["sources", "Data sources", "bi-database"],
          ].map((x) => (
            <button
              className={`pm-tab ${tab === x[0] ? "active" : ""}`}
              key={x[0]}
              onClick={() => setTab(x[0])}
            >
              <i className={`bi ${x[2]}`} />
              {x[1]}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================
          TAB: OVERVIEW (Dashboards)
          ============================================================ */}
      {tab === "overview" && (
        <section>
          <div className="pm-section-head">
            <div>
              <h3>Pre-built dashboards</h3>
              <p>
                Approved views for executives, finance, growth, risk,
                support, partners and engineering.
              </p>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() =>
                  setAction({
                    title: "Dashboard sharing",
                    body: "A secure team dashboard link was created with role-based viewer access.",
                    icon: "bi-share",
                    tone: "blue",
                  })
                }
              >
                <i className="bi bi-share me-1" />
                Share
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowAddDash(true)}
              >
                <i className="bi bi-plus-circle me-1" />
                Add dashboard
              </button>
            </div>
          </div>
          <div className="row g-3">
            {dashboards.map((d) => (
              <div className="col-md-6 col-xl-4" key={d.id}>
                <div className="pm-card pm-card-pad text-start w-100 h-100">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6>
                        {d.name}
                        {d.locked && (
                          <i
                            className="bi bi-lock-fill ms-1"
                            style={{
                              fontSize: ".7rem",
                              color: "var(--pm-amber)",
                            }}
                          />
                        )}
                      </h6>
                      <div className="pm-td-sub">
                        Owner: {d.owner} · Viewers: {d.viewers}
                      </div>
                    </div>
                    <Badge tone={d.refresh === "Real-time" ? "green" : "blue"}>
                      {d.refresh}
                    </Badge>
                  </div>
                  <div className="pm-td-sub mt-2" style={{ fontSize: ".78rem" }}>
                    {d.metrics}
                  </div>
                  <div
                    className="d-flex justify-content-between align-items-center mt-3 pt-2"
                    style={{ borderTop: "1px solid var(--pm-border)" }}
                  >
                    <div
                      className="d-flex gap-3"
                      style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}
                    >
                      <span>
                        <i className="bi bi-grid-3x3 me-1" />
                        {d.widgetCount} widgets
                      </span>
                      <span>
                        <i className="bi bi-eye me-1" />
                        {d.viewCount}
                      </span>
                    </div>
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setEditDash(d)}
                        title="Edit"
                      >
                        <i className="bi bi-pencil-square" />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setLockDash(d)}
                        title={d.locked ? "Unlock" : "Lock"}
                      >
                        <i className={`bi ${d.locked ? "bi-unlock" : "bi-lock"}`} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setDeleteDash(d)}
                        title="Delete"
                      >
                        <i className="bi bi-trash3" />
                      </button>
                    </div>
                  </div>
                  <div
                    className="d-flex gap-1 flex-wrap mt-2"
                    style={{ fontSize: ".72rem" }}
                  >
                    <Badge tone={d.locked ? "amber" : d.status === "Draft" ? "blue" : "green"}>
                      {d.locked ? "🔒 Locked" : d.status}
                    </Badge>
                    <Badge tone="ink">
                      {d.dataSourceCount} sources
                    </Badge>
                    <Badge tone="ink">
                      Shared: {d.sharedWith}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ============================================================
          TAB: BUILDER
          ============================================================ */}
      {tab === "builder" && (
        <section>
          <Head
            title="Custom dashboard builder"
            body="Configure widgets, data sources, filters, layout, sharing and refresh intervals."
            action={() => setWizard(true)}
            actionLabel="Open builder"
            actionIcon="bi-magic"
          />
          <div className="row g-3">
            {[
              ["Widgets", "KPI, line, bar, donut, heatmap, table, funnel, map", "bi-grid"],
              ["Data sources", "Transactions, Users, Finance, Fraud, Partners, System, Support, Loans, Cards", "bi-database"],
              ["Filters", "Date, segment, channel, status and entity filters", "bi-funnel"],
              ["Calculations", "Sum, average, percentile, growth, YoY, MoM, custom formula", "bi-calculator"],
              ["Comparisons", "Previous period, target, cohort vs cohort", "bi-arrow-left-right"],
              ["Sharing", "Personal or team dashboard with role access", "bi-share"],
            ].map((x) => (
              <div className="col-md-6 col-xl-4" key={x[0]}>
                <button
                  className="pm-card pm-card-pad text-start w-100 border-0 h-100"
                  onClick={() =>
                    setAction({
                      title: x[0],
                      icon: x[2],
                      tone: "blue",
                      body: <BuilderConfigForm title={x[0]} />,
                    })
                  }
                >
                  <div className="pm-stat-ico bg-blue-soft text-blue mb-2">
                    <i className={`bi ${x[2]}`} />
                  </div>
                  <h6>{x[0]}</h6>
                  <p className="pm-td-sub mb-0">{x[1]}</p>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ============================================================
          TAB: REPORT BUILDER
          ============================================================ */}
      {tab === "reports" && (
        <section>
          <Head
            title="Advanced report builder"
            body="Join sources, filter, group, calculate, pivot, format and export results."
            action={() =>
              setAction({
                title: "Report preview ready",
                body: "The report preview rendered successfully with the selected data sources.",
                icon: "bi-eye",
                tone: "blue",
              })
            }
          />
          <div className="pm-card pm-card-pad">
            <div className="row g-3">
              {[
                ["Data selection", "Join multiple sources and select columns"],
                ["Filtering", "Multi-condition AND / OR logic"],
                ["Grouping & sorting", "Group by any dimension and multi-column sort"],
                ["Calculated fields", "Custom formulas using any field"],
                ["Pivot tables", "Draggable rows and columns"],
                ["Export", "CSV, Excel, PDF, PowerPoint, JSON"],
              ].map((x) => (
                <div className="col-md-6" key={x[0]}>
                  <ConfigRow label={x[0]} value={x[1]} />
                </div>
              ))}
            </div>
            <button
              className="btn btn-primary mt-3"
              onClick={() =>
                setAction({
                  title: "Report preview ready",
                  body: "The report preview rendered successfully with the selected data sources.",
                  icon: "bi-eye",
                  tone: "blue",
                })
              }
            >
              <i className="bi bi-eye me-1" />
              Preview report
            </button>
          </div>
        </section>
      )}

      {/* ============================================================
          TAB: SCHEDULED REPORTS
          ============================================================ */}
      {tab === "scheduled" && (
        <section>
          <Head
            title="Scheduled reports"
            body="Automated report generation and distribution calendar."
            action={() => setShowAddReport(true)}
            actionLabel="Add report"
            actionIcon="bi-plus-circle"
          />
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead>
                  <tr>
                    <th>Report name</th>
                    <th>Frequency</th>
                    <th>Format</th>
                    <th>Recipients</th>
                    <th>Next run</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id}>
                      <td className="pm-td-strong">
                        {r.name}
                        {r.locked && (
                          <i
                            className="bi bi-lock-fill ms-1"
                            style={{
                              fontSize: ".65rem",
                              color: "var(--pm-amber)",
                            }}
                          />
                        )}
                      </td>
                      <td>{r.frequency}</td>
                      <td>{r.format}</td>
                      <td style={{ fontSize: ".8rem" }}>{r.recipients}</td>
                      <td>{r.nextRun}</td>
                      <td>
                        <Badge
                          tone={
                            r.lastStatus === "Success"
                              ? "green"
                              : r.lastStatus === "Failed"
                                ? "red"
                                : "amber"
                          }
                          dot
                        >
                          {r.lastStatus}
                        </Badge>
                      </td>
                      <td className="text-end text-nowrap">
                        <AdminRowActions
                          onEdit={() => setEditReport(r)}
                          onLock={() => setLockReport(r)}
                          onDelete={() => setDeleteReport(r)}
                          locked={r.locked}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
          TAB: DATA EXPLORER
          ============================================================ */}
      {tab === "explore" && (
        <section>
          <Head
            title="Data explorer"
            body="Read-only schemas, query templates, result previews and cost governance."
            action={() => setShowAddQuery(true)}
            actionLabel="Add template"
            actionIcon="bi-plus-circle"
          />

          {/* Query templates table */}
          <div className="pm-card mb-3">
            <div className="pm-card-pad">
              <div className="pm-eyebrow mb-2">Query Templates</div>
            </div>
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead>
                  <tr>
                    <th>Template Name</th>
                    <th>Schema</th>
                    <th>Runs</th>
                    <th>Avg Runtime</th>
                    <th>Last Run</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {queries.map((q) => (
                    <tr key={q.id}>
                      <td className="pm-td-strong">
                        {q.name}
                        {q.locked && (
                          <i
                            className="bi bi-lock-fill ms-1"
                            style={{
                              fontSize: ".65rem",
                              color: "var(--pm-amber)",
                            }}
                          />
                        )}
                      </td>
                      <td className="mono">{q.schema}</td>
                      <td className="mono">{q.runCount}</td>
                      <td className="mono">{q.avgRuntime}</td>
                      <td className="pm-td-sub">{q.lastRun}</td>
                      <td>
                        <Badge
                          tone={q.locked ? "amber" : "green"}
                          dot
                        >
                          {q.locked ? "Locked" : q.status}
                        </Badge>
                      </td>
                      <td className="text-end text-nowrap">
                        <div className="d-flex gap-1 justify-content-end">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() =>
                              setAction({
                                title: q.name,
                                body: (
                                  <div>
                                    <p>{q.description}</p>
                                    <div className="pm-kv">
                                      <span className="k">Schema</span>
                                      <span className="v">{q.schema}</span>
                                    </div>
                                    <div className="pm-kv">
                                      <span className="k">Tags</span>
                                      <span className="v">
                                        {q.tags.join(", ")}
                                      </span>
                                    </div>
                                  </div>
                                ),
                                icon: "bi-terminal",
                                tone: "blue",
                              })
                            }
                          >
                            <i className="bi bi-eye" />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setLockQuery(q)}
                          >
                            <i className={`bi ${q.locked ? "bi-unlock" : "bi-lock"}`} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SQL Editor */}
          <div className="pm-card pm-card-pad">
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">
                  SQL query editor · read-only replica
                </label>
                <textarea
                  className="form-control query-editor"
                  rows={7}
                  defaultValue={
                    "SELECT channel, COUNT(*) AS transactions, SUM(amount) AS volume\nFROM transactions\nWHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)\nGROUP BY channel ORDER BY volume DESC;"
                  }
                />
              </div>
              <div className="col-md-4">
                <ConfigRow
                  label="Available schemas"
                  value="Transactions · Users · Finance · Fraud · Partners · System"
                />
              </div>
              <div className="col-md-4">
                <ConfigRow
                  label="Execution limits"
                  value="10 min runtime · 10M rows maximum"
                />
              </div>
              <div className="col-md-4">
                <ConfigRow
                  label="PII handling"
                  value="Masked for non-privileged roles"
                />
              </div>
            </div>
            <button
              className="btn btn-primary mt-3"
              onClick={() =>
                push({
                  kind: "success",
                  title: "Query executed",
                  body: "Completed in 2.4s. First 100 rows ready.",
                })
              }
            >
              <i className="bi bi-play-circle me-1" />
              Run query
            </button>
          </div>
        </section>
      )}

      {/* ============================================================
          TAB: COHORT ANALYSIS
          ============================================================ */}
      {tab === "cohorts" && (
        <section>
          <Head
            title="Cohort analysis tools"
            body="Retention, revenue, channel, product and loan cohort analysis."
            action={() =>
              setAction({
                title: "Cohort analysis exported",
                body: "The selected cohort analysis was exported as an analytics workbook.",
                icon: "bi-download",
                tone: "blue",
              })
            }
            actionLabel="Export"
          />
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead>
                  <tr>
                    <th>Analysis type</th>
                    <th>Description</th>
                    <th>Dimensions</th>
                    <th>Metrics</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cohorts.map((c) => (
                    <tr key={c.id}>
                      <td className="pm-td-strong">
                        {c.type}
                        {c.locked && (
                          <i
                            className="bi bi-lock-fill ms-1"
                            style={{
                              fontSize: ".65rem",
                              color: "var(--pm-amber)",
                            }}
                          />
                        )}
                      </td>
                      <td style={{ fontSize: ".8rem" }}>{c.description}</td>
                      <td className="pm-td-sub">{c.dimensions}</td>
                      <td className="pm-td-sub">{c.metrics}</td>
                      <td>
                        <Badge
                          tone={c.locked ? "amber" : c.status === "Under Review" ? "amber" : "green"}
                          dot
                        >
                          {c.locked ? "Locked" : c.status}
                        </Badge>
                      </td>
                      <td className="text-end text-nowrap">
                        <div className="d-flex gap-1 justify-content-end">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setEditCohort(c)}
                          >
                            <i className="bi bi-pencil-square" />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setLockCohort(c)}
                          >
                            <i className={`bi ${c.locked ? "bi-unlock" : "bi-lock"}`} />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setDeleteCohort(c)}
                          >
                            <i className="bi bi-trash3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <button
            className="btn btn-outline-primary btn-sm mt-3"
            onClick={() => setShowAddCohort(true)}
          >
            <i className="bi bi-plus-circle me-1" />
            Add cohort analysis
          </button>
        </section>
      )}

      {/* ============================================================
          TAB: FUNNEL ANALYSIS
          ============================================================ */}
      {tab === "funnels" && (
        <section>
          <Head
            title="Funnel analysis tools"
            body="Conversion and drop-off across critical customer journeys."
            action={() =>
              setAction({
                title: "Funnel report exported",
                body: "The funnel analysis was exported with conversion and drop-off detail.",
                icon: "bi-download",
                tone: "blue",
              })
            }
            actionLabel="Export"
          />
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead>
                  <tr>
                    <th>Funnel</th>
                    <th>Steps</th>
                    <th>Conversion</th>
                    <th>Drop-off</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {funnels.map((f) => (
                    <tr key={f.id}>
                      <td className="pm-td-strong">
                        {f.name}
                        {f.locked && (
                          <i
                            className="bi bi-lock-fill ms-1"
                            style={{
                              fontSize: ".65rem",
                              color: "var(--pm-amber)",
                            }}
                          />
                        )}
                      </td>
                      <td style={{ fontSize: ".8rem" }}>{f.steps}</td>
                      <td className="mono">
                        <Badge tone="green">{f.conversionRate}</Badge>
                      </td>
                      <td className="mono">{f.dropOff}</td>
                      <td>
                        <Badge
                          tone={f.locked ? "amber" : f.status === "Under Review" ? "amber" : "green"}
                          dot
                        >
                          {f.locked ? "Locked" : f.status}
                        </Badge>
                      </td>
                      <td className="text-end text-nowrap">
                        <div className="d-flex gap-1 justify-content-end">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setEditFunnel(f)}
                          >
                            <i className="bi bi-pencil-square" />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setLockFunnel(f)}
                          >
                            <i className={`bi ${f.locked ? "bi-unlock" : "bi-lock"}`} />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setDeleteFunnel(f)}
                          >
                            <i className="bi bi-trash3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <button
            className="btn btn-outline-primary btn-sm mt-3"
            onClick={() => setShowAddFunnel(true)}
          >
            <i className="bi bi-plus-circle me-1" />
            Add funnel
          </button>
        </section>
      )}

      {/* ============================================================
          TAB: PREDICTIVE ANALYTICS (Models)
          ============================================================ */}
      {tab === "models" && (
        <section>
          <Head
            title="Predictive analytics"
            body="Production and beta models used by Growth, Risk, Lending and Support."
            action={() =>
              setAction({
                title: "Model metrics exported",
                body: "Model accuracy, recall and ownership metrics were exported.",
                icon: "bi-download",
                tone: "blue",
              })
            }
            actionLabel="Export"
          />
          <div className="row g-3">
            {models.map((m) => (
              <div className="col-md-6 col-xl-4" key={m.id}>
                <div className="pm-card pm-card-pad">
                  <div className="d-flex justify-content-between align-items-start">
                    <h6>
                      {m.name}
                      {m.locked && (
                        <i
                          className="bi bi-lock-fill ms-1"
                          style={{
                            fontSize: ".65rem",
                            color: "var(--pm-amber)",
                          }}
                        />
                      )}
                    </h6>
                    <Badge
                      tone={
                        m.status === "Beta"
                          ? "amber"
                          : m.status === "Retired"
                            ? "red"
                            : "green"
                      }
                    >
                      {m.status}
                    </Badge>
                  </div>
                  <div className="pm-td-sub">
                    {m.type} · {m.accuracy}
                  </div>
                  <div
                    className="d-flex gap-2 mt-2"
                    style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}
                  >
                    <span>{m.version}</span>
                    <span>·</span>
                    <span>{m.features} features</span>
                    <span>·</span>
                    <span>{m.latency}</span>
                  </div>
                  <div
                    className="d-flex gap-1 mt-3 pt-2"
                    style={{ borderTop: "1px solid var(--pm-border)" }}
                  >
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setEditModel(m)}
                    >
                      <i className="bi bi-pencil-square me-1" />
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setLockModel(m)}
                    >
                      <i className={`bi ${m.locked ? "bi-unlock" : "bi-lock"} me-1`} />
                      {m.locked ? "Unlock" : "Lock"}
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => setDeleteModel(m)}
                    >
                      <i className="bi bi-trash3 me-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            className="btn btn-outline-primary btn-sm mt-3"
            onClick={() => setShowAddModel(true)}
          >
            <i className="bi bi-plus-circle me-1" />
            Register model
          </button>
        </section>
      )}

      {/* ============================================================
          TAB: DATA SOURCES
          ============================================================ */}
      {tab === "sources" && (
        <section>
          <Head
            title="Data Sources"
            body="Connected databases, APIs and streaming sources powering analytics."
            action={() => setShowDsWizard(true)}
            actionLabel="Add source"
            actionIcon="bi-plus-circle"
          />
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Rows</th>
                    <th>Last Sync</th>
                    <th>PII Handling</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSources.map((s) => (
                    <tr key={s.id}>
                      <td className="pm-td-strong">
                        {s.name}
                        {s.locked && (
                          <i
                            className="bi bi-lock-fill ms-1"
                            style={{
                              fontSize: ".65rem",
                              color: "var(--pm-amber)",
                            }}
                          />
                        )}
                      </td>
                      <td className="mono">{s.type}</td>
                      <td>
                        <Badge
                          tone={
                            s.status === "Connected"
                              ? "green"
                              : s.status === "Error"
                                ? "red"
                                : s.status === "Maintenance"
                                  ? "amber"
                                  : "blue"
                          }
                          dot
                        >
                          {s.status}
                        </Badge>
                      </td>
                      <td className="mono">{s.rowCount}</td>
                      <td className="pm-td-sub">{s.lastSync}</td>
                      <td className="pm-td-sub">{s.piiHandling}</td>
                      <td className="text-end text-nowrap">
                        <div className="d-flex gap-1 justify-content-end">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() =>
                              setAction({
                                title: `${s.name} Details`,
                                body: (
                                  <div>
                                    <div className="pm-kv">
                                      <span className="k">Owner</span>
                                      <span className="v">{s.owner}</span>
                                    </div>
                                    <div className="pm-kv">
                                      <span className="k">Sync Frequency</span>
                                      <span className="v">{s.syncFrequency}</span>
                                    </div>
                                    <div className="pm-kv">
                                      <span className="k">PII Handling</span>
                                      <span className="v">{s.piiHandling}</span>
                                    </div>
                                    <div className="pm-kv">
                                      <span className="k">Row Count</span>
                                      <span className="v">{s.rowCount}</span>
                                    </div>
                                  </div>
                                ),
                                icon: "bi-database",
                                tone: "blue",
                              })
                            }
                          >
                            <i className="bi bi-eye" />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setLockSource(s)}
                          >
                            <i className={`bi ${s.locked ? "bi-unlock" : "bi-lock"}`} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
          ALL MODALS & DRAWERS
          ============================================================ */}

      {/* Generic action modal */}
      <Modal
        open={!!action}
        onClose={() => setAction(null)}
        title={action?.title ?? "Analytics action"}
        subtitle="Super Admin action · data access and exports are audited"
        icon={action?.icon}
        tone={action?.tone}
      >
        <div className="pm-modal-body">{action?.body}</div>
        <div className="pm-modal-foot">
          <button
            className="btn btn-outline-secondary"
            onClick={() => setAction(null)}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setAction(null);
              push({
                kind: "success",
                title: "Analytics workspace updated",
                body: "The action was added to the data access audit trail.",
              });
            }}
          >
            Confirm action
          </button>
        </div>
      </Modal>

      {/* Build dashboard wizard */}
      <Modal
        open={wizard}
        onClose={() => {
          setWizard(false);
          setWizardStep(0);
        }}
        title="Build analytics dashboard"
        subtitle={`Step ${wizardStep + 1} of 4: ${
          ["Sources", "Widgets", "Filters", "Review"][wizardStep]
        }`}
        icon="bi-magic"
        tone="blue"
        size="lg"
      >
        <div className="pm-wizard-progress">
          <span style={{ width: `${(wizardStep + 1) * 25}%` }} />
        </div>
        <Steps
          steps={[
            { label: "Sources", icon: "bi-database" },
            { label: "Widgets", icon: "bi-grid" },
            { label: "Filters", icon: "bi-funnel" },
            { label: "Review", icon: "bi-check2" },
          ]}
          current={wizardStep}
        />
        <div className="pm-modal-body">
          <BuilderConfigForm
            title={
              wizardStep === 0
                ? "Data sources"
                : wizardStep === 1
                  ? "Widgets and layout"
                  : wizardStep === 2
                    ? "Filters and sharing"
                    : "Review and schedule"
            }
          />
        </div>
        <div className="pm-modal-foot">
          <button
            className="btn btn-outline-secondary"
            onClick={() =>
              wizardStep
                ? setWizardStep(wizardStep - 1)
                : setWizard(false)
            }
          >
            {wizardStep ? "Back" : "Cancel"}
          </button>
          {wizardStep < 3 ? (
            <button
              className="btn btn-primary"
              onClick={() => setWizardStep(wizardStep + 1)}
            >
              Continue
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => {
                setWizard(false);
                setWizardStep(0);
                push({
                  kind: "success",
                  title: "Dashboard saved",
                  body: "The dashboard was saved with role-based access and audit tracking.",
                });
              }}
            >
              Save dashboard
            </button>
          )}
        </div>
      </Modal>

      {/* Data Governance Drawer */}
      <Drawer
        open={drawerGov}
        onClose={() => setDrawerGov(false)}
        title="Data governance"
        subtitle="Secure access, quality, lineage, PII and export controls"
        icon="bi-shield-lock"
        wide
      >
        <div className="pm-card pm-card-pad mb-3">
          <Badge tone="green" dot>
            Governed
          </Badge>
          <h5 className="mt-3">Analytics data is protected</h5>
          <p className="small text-muted">
            Role-based access, masking and query audit apply to every
            dashboard and export.
          </p>
        </div>
        <div className="pm-card pm-card-pad">
          {[
            ["Access control", "Role-based least privilege"],
            ["Data quality", "Automated completeness and accuracy checks"],
            ["Data lineage", "Tracked for derived fields and models"],
            ["PII handling", "Automatic masking for non-privileged roles"],
            ["Query audit", "Admin, timestamp and rows accessed"],
            ["Retention", "Per privacy retention schedule"],
            ["Backup", "Real-time replication + daily snapshot"],
          ].map((x) => (
            <div className="config-row" key={x[0]}>
              <span className="pm-td-sub">{x[0]}</span>
              <b>{x[1]}</b>
            </div>
          ))}
        </div>
      </Drawer>

      {/* Audit Trail Drawer */}
      <ComplianceAuditTrailDrawer
        open={drawerAudit}
        onClose={() => setDrawerAudit(false)}
      />

      {/* Permissions Drawer */}
      <AdminPermissionsDrawer
        open={drawerPerms}
        onClose={() => setDrawerPerms(false)}
      />

      {/* Emergency Actions */}
      <EmergencyDataActionsModal
        open={showEmergency}
        onClose={() => setShowEmergency(false)}
      />

      {/* Export / Import */}
      <DataExportImportModal
        open={showExport}
        onClose={() => setShowExport(false)}
      />

      {/* Data Source Config Wizard */}
      <DataSourceConfigWizard
        open={showDsWizard}
        onClose={() => setShowDsWizard(false)}
      />

      {/* === Dashboard CRUD Modals === */}
      <AddDashboardModal
        open={showAddDash}
        onClose={() => setShowAddDash(false)}
        onAdd={handleAddDash}
      />
      <EditDashboardModal
        record={editDash}
        open={!!editDash}
        onClose={() => setEditDash(null)}
        onSave={handleSaveDash}
      />
      <DeleteDashboardWizard
        record={deleteDash}
        open={!!deleteDash}
        onClose={() => setDeleteDash(null)}
        onDelete={() => {
          if (deleteDash) handleDeleteDash(deleteDash.id);
        }}
      />
      <LockUnlockDashboardModal
        record={lockDash}
        open={!!lockDash}
        onClose={() => setLockDash(null)}
        onToggle={(locked) => {
          if (lockDash) handleToggleLockDash(lockDash.id, locked);
        }}
      />

      {/* === Report CRUD Modals === */}
      <AddScheduledReportModal
        open={showAddReport}
        onClose={() => setShowAddReport(false)}
        onAdd={handleAddReport}
      />
      <EditScheduledReportModal
        record={editReport}
        open={!!editReport}
        onClose={() => setEditReport(null)}
        onSave={handleSaveReport}
      />
      <DeleteReportWizard
        record={deleteReport}
        open={!!deleteReport}
        onClose={() => setDeleteReport(null)}
        onDelete={() => {
          if (deleteReport) handleDeleteReport(deleteReport.id);
        }}
      />
      <LockUnlockReportModal
        record={lockReport}
        open={!!lockReport}
        onClose={() => setLockReport(null)}
        onToggle={(locked) => {
          if (lockReport) handleToggleLockReport(lockReport.id, locked);
        }}
      />

      {/* === Model CRUD Modals === */}
      <AddModelModal
        open={showAddModel}
        onClose={() => setShowAddModel(false)}
        onAdd={handleAddModel}
      />
      <EditModelModal
        record={editModel}
        open={!!editModel}
        onClose={() => setEditModel(null)}
        onSave={handleSaveModel}
      />
      <DeleteModelWizard
        record={deleteModel}
        open={!!deleteModel}
        onClose={() => setDeleteModel(null)}
        onDelete={() => {
          if (deleteModel) handleDeleteModel(deleteModel.id);
        }}
      />
      <LockUnlockModelModal
        record={lockModel}
        open={!!lockModel}
        onClose={() => setLockModel(null)}
        onToggle={(locked) => {
          if (lockModel) handleToggleLockModel(lockModel.id, locked);
        }}
      />

      {/* === Cohort CRUD Modals === */}
      <AddCohortModal
        open={showAddCohort}
        onClose={() => setShowAddCohort(false)}
        onAdd={handleAddCohort}
      />
      <EditCohortModal
        record={editCohort}
        open={!!editCohort}
        onClose={() => setEditCohort(null)}
        onSave={handleSaveCohort}
      />
      <DeleteCohortWizard
        record={deleteCohort}
        open={!!deleteCohort}
        onClose={() => setDeleteCohort(null)}
        onDelete={() => {
          if (deleteCohort) handleDeleteCohort(deleteCohort.id);
        }}
      />
      <LockUnlockCohortModal
        record={lockCohort}
        open={!!lockCohort}
        onClose={() => setLockCohort(null)}
        onToggle={(locked) => {
          if (lockCohort) handleToggleLockCohort(lockCohort.id, locked);
        }}
      />

      {/* === Funnel CRUD Modals === */}
      <AddFunnelModal
        open={showAddFunnel}
        onClose={() => setShowAddFunnel(false)}
        onAdd={handleAddFunnel}
      />
      <EditFunnelModal
        record={editFunnel}
        open={!!editFunnel}
        onClose={() => setEditFunnel(null)}
        onSave={handleSaveFunnel}
      />
      <DeleteFunnelWizard
        record={deleteFunnel}
        open={!!deleteFunnel}
        onClose={() => setDeleteFunnel(null)}
        onDelete={() => {
          if (deleteFunnel) handleDeleteFunnel(deleteFunnel.id);
        }}
      />
      <LockUnlockFunnelModal
        record={lockFunnel}
        open={!!lockFunnel}
        onClose={() => setLockFunnel(null)}
        onToggle={(locked) => {
          if (lockFunnel) handleToggleLockFunnel(lockFunnel.id, locked);
        }}
      />

      {/* === Query Template Modals === */}
      <AddQueryTemplateModal
        open={showAddQuery}
        onClose={() => setShowAddQuery(false)}
        onAdd={handleAddQuery}
      />
      <LockUnlockQueryModal
        record={lockQuery}
        open={!!lockQuery}
        onClose={() => setLockQuery(null)}
        onToggle={(locked) => {
          if (lockQuery) handleToggleLockQuery(lockQuery.id, locked);
        }}
      />

      {/* === Data Source Modals === */}
      <LockUnlockDataSourceModal
        record={lockSource}
        open={!!lockSource}
        onClose={() => setLockSource(null)}
        onToggle={(locked) => {
          if (lockSource) handleToggleLockSource(lockSource.id, locked);
        }}
      />
    </div>
  );
}

/* ================================================================
   Builder Config Form (reused inside modals and wizard)
   ================================================================ */
function BuilderConfigForm({ title }: { title: string }) {
  return (
    <div className="row g-3">
      <div className="col-md-7">
        <label className="form-label">{title}</label>
        <input
          className="form-control"
          defaultValue="Executive analytics workspace"
        />
      </div>
      <div className="col-md-5">
        <label className="form-label">Refresh interval</label>
        <select className="form-select">
          <option>Daily</option>
          <option>Real-time</option>
          <option>15 minutes</option>
          <option>Manual</option>
        </select>
      </div>
      <div className="col-md-6">
        <label className="form-label">Owner</label>
        <input className="form-control" defaultValue="Analytics team" />
      </div>
      <div className="col-md-6">
        <label className="form-label">Visibility</label>
        <select className="form-select">
          <option>Team dashboard</option>
          <option>Personal</option>
          <option>Role restricted</option>
        </select>
      </div>
      <div className="col-12">
        <label className="form-label">Notes</label>
        <textarea
          className="form-control"
          rows={3}
          defaultValue="Use approved sources only. PII remains masked for non-privileged viewers."
        />
      </div>
    </div>
  );
}
