import { useState, useMemo, useCallback } from "react";
import { Badge, Drawer, Steps, useToast } from "../../../components/ui";
import type {
  TemplateRecord,
  VariableRecord,
  UsageRecord,
  DocumentRecord,
} from "../data/templateData";
import {
  initialTemplates,
  initialVariables,
  initialUsage,
  initialDocuments,
} from "../data/templateData";
import {
  AddTemplateModal,
  EditTemplateModal,
  DeleteTemplateWizard,
  LockUnlockTemplateModal,
  DocumentPreviewModal,
  DocumentViewerDrawer,
  AddVariableModal,
  EditVariableModal,
  DeleteVariableWizard,
  LockUnlockVariableModal,
  BulkGenerateWizard,
  ComplianceAuditTrailDrawer,
  AdminPermissionsDrawer,
  EmergencyDataActionsModal,
  DataExportImportModal,
  DeleteDocumentWizard,
  LockUnlockDocumentModal,
} from "../modals/TemplateModals";

/* ================================================================
   Reusable components
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
   Main Component
   ================================================================ */
export function DocumentTemplates({
  signal: _signal,
}: {
  signal: { action: string; n: number };
  onNavigate: (id: string) => void;
}) {
  const { push } = useToast();

  /* ---- tab state ---- */
  const [tab, setTab] = useState("library");
  const [q, setQ] = useState("");

  /* ---- data state ---- */
  const [templates, setTemplates] = useState(initialTemplates);
  const [variables, setVariables] = useState(initialVariables);
  const [usage] = useState(initialUsage);
  const [documents, setDocuments] = useState(initialDocuments);

  /* ---- generic action modal ---- */
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
  const [drawerDocs, setDrawerDocs] = useState(false);

  /* ---- wizards ---- */
  const [wizard, setWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [bulkWizard, setBulkWizard] = useState(false);

  /* ---- Template CRUD ---- */
  const [showAddTpl, setShowAddTpl] = useState(false);
  const [editTpl, setEditTpl] = useState<TemplateRecord | null>(null);
  const [deleteTpl, setDeleteTpl] = useState<TemplateRecord | null>(null);
  const [lockTpl, setLockTpl] = useState<TemplateRecord | null>(null);
  const [previewTpl, setPreviewTpl] = useState<TemplateRecord | null>(null);

  /* ---- Variable CRUD ---- */
  const [showAddVar, setShowAddVar] = useState(false);
  const [editVar, setEditVar] = useState<VariableRecord | null>(null);
  const [deleteVar, setDeleteVar] = useState<VariableRecord | null>(null);
  const [lockVar, setLockVar] = useState<VariableRecord | null>(null);

  /* ---- Document CRUD ---- */
  const [deleteDoc, setDeleteDoc] = useState<DocumentRecord | null>(null);
  const [lockDoc, setLockDoc] = useState<DocumentRecord | null>(null);

  /* ---- Emergency & Export ---- */
  const [showEmergency, setShowEmergency] = useState(false);
  const [showExport, setShowExport] = useState(false);

  /* ---- computed ---- */
  const filtered = useMemo(
    () =>
      templates.filter((r) =>
        [r.name, r.category, r.owner, r.format, r.status]
          .join(" ")
          .toLowerCase()
          .includes(q.toLowerCase())
      ),
    [q, templates]
  );

  const stats = useMemo(
    () => ({
      active: templates.filter((t) => t.status === "Active").length,
      totalGen: templates.reduce((s, t) => s + t.generationsTotal, 0),
      variables: variables.length,
      pending: templates.filter((t) => t.status === "Under Review").length,
    }),
    [templates, variables]
  );

  /* ---- CRUD handlers ---- */
  const handleAddTemplate = useCallback(
    (t: TemplateRecord) => setTemplates((p) => [t, ...p]),
    []
  );
  const handleSaveTemplate = useCallback(
    (t: TemplateRecord) =>
      setTemplates((p) => p.map((x) => (x.id === t.id ? t : x))),
    []
  );
  const handleDeleteTemplate = useCallback(
    (id: string) => setTemplates((p) => p.filter((x) => x.id !== id)),
    []
  );
  const handleToggleLockTemplate = useCallback(
    (id: string, locked: boolean) =>
      setTemplates((p) =>
        p.map((x) =>
          x.id === id
            ? {
                ...x,
                locked,
                lockedBy: locked ? "Super Admin" : undefined,
                lockedAt: locked
                  ? new Date().toLocaleDateString()
                  : undefined,
                lockReason: locked ? "Manual lock" : undefined,
              }
            : x
        )
      ),
    []
  );

  const handleAddVariable = useCallback(
    (v: VariableRecord) => setVariables((p) => [v, ...p]),
    []
  );
  const handleSaveVariable = useCallback(
    (v: VariableRecord) =>
      setVariables((p) => p.map((x) => (x.id === v.id ? v : x))),
    []
  );
  const handleDeleteVariable = useCallback(
    (id: string) => setVariables((p) => p.filter((x) => x.id !== id)),
    []
  );
  const handleToggleLockVariable = useCallback(
    (id: string, locked: boolean) =>
      setVariables((p) =>
        p.map((x) =>
          x.id === id
            ? {
                ...x,
                locked,
                lockedBy: locked ? "Super Admin" : undefined,
                lockedAt: locked
                  ? new Date().toLocaleDateString()
                  : undefined,
                lockReason: locked ? "Manual lock" : undefined,
              }
            : x
        )
      ),
    []
  );

  const handleDeleteDocument = useCallback(
    (id: string) => setDocuments((p) => p.filter((x) => x.id !== id)),
    []
  );
  const handleToggleLockDocument = useCallback(
    (id: string, locked: boolean) =>
      setDocuments((p) =>
        p.map((x) =>
          x.id === id
            ? {
                ...x,
                locked,
                lockedBy: locked ? "Super Admin" : undefined,
                lockedAt: locked
                  ? new Date().toLocaleDateString()
                  : undefined,
                lockReason: locked ? "Manual lock" : undefined,
              }
            : x
        )
      ),
    []
  );

  /* ---- render ---- */
  return (
    <div className="pm-page-content template-page">
      {/* ============ HEADER ============ */}
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="pm-eyebrow">DOCUMENTS & LEGAL / PAGE 41</div>
          <h2 className="mb-1">Document Templates</h2>
          <p>
            Manage reusable templates for user communications, legal
            documents, lending, HR and governance.
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
            Access policy
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
            onClick={() => setBulkWizard(true)}
          >
            <i className="bi bi-files me-1" />
            Bulk generate
          </button>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => setShowExport(true)}
          >
            <i className="bi bi-download me-1" />
            Export
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              setWizardStep(0);
              setWizard(true);
            }}
          >
            <i className="bi bi-file-earmark-plus me-1" />
            New template
          </button>
        </div>
      </div>

      {/* ============ HERO ============ */}
      <div className="pm-hero template-hero mb-3">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <div className="pm-eyebrow text-white-50">
              TEMPLATE OPERATIONS · VERSION CONTROLLED
            </div>
            <div className="pm-hero-value">
              {stats.active}{" "}
              <span className="fs-6 fw-normal text-white-50">
                active templates
              </span>
            </div>
            <div className="small text-white-50 mt-2">
              {templates.length} templates shown · PDF, Word, HTML and email
              outputs · all publishing is approval-gated
            </div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <div className="pm-hero-chip">
              <div className="l">Generated (30d)</div>
              <div className="v">125K</div>
            </div>
            <div className="pm-hero-chip">
              <div className="l">Published versions</div>
              <div className="v text-success">39</div>
            </div>
            <div className="pm-hero-chip">
              <div className="l">Pending reviews</div>
              <div className="v text-warning">{stats.pending}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ STAT CARDS ============ */}
      <div className="row g-3 mb-3">
        {[
          [
            "Active templates",
            String(stats.active),
            "Across 8 categories",
            "bi-files",
            "green",
          ],
          [
            "Generated (30d)",
            "125K",
            "PDF, email and letters",
            "bi-file-earmark-check",
            "blue",
          ],
          [
            "Variables catalogued",
            String(stats.variables),
            "System, user and financial",
            "bi-braces",
            "violet",
          ],
          [
            "Pending approvals",
            String(stats.pending),
            "Legal and manager review",
            "bi-hourglass-split",
            "amber",
          ],
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
            ["library", "Template library", "bi-files"],
            ["editor", "Template editor", "bi-pencil-square"],
            ["variables", "Variable catalog", "bi-braces"],
            ["documents", "Generated docs", "bi-file-earmark-text"],
            ["usage", "Usage analytics", "bi-graph-up"],
            ["workflow", "Approval workflow", "bi-diagram-3"],
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
          TAB: LIBRARY (Templates)
          ============================================================ */}
      {tab === "library" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div>
              <h3>Template library</h3>
              <p>
                Reusable document definitions with owner, format and usage
                posture.
              </p>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <div className="pm-search">
                <i className="bi bi-search" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search template, category or owner"
                />
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowAddTpl(true)}
              >
                <i className="bi bi-plus-circle me-1" />
                Add template
              </button>
            </div>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead>
                  <tr>
                    <th>Template</th>
                    <th>Category</th>
                    <th>Format</th>
                    <th>Version</th>
                    <th>Used (30d)</th>
                    <th>Status</th>
                    <th>Owner</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id}>
                      <td className="pm-td-strong">
                        {t.name}
                        {t.locked && (
                          <i
                            className="bi bi-lock-fill ms-1"
                            style={{
                              fontSize: ".6rem",
                              color: "var(--pm-amber)",
                            }}
                          />
                        )}
                      </td>
                      <td>{t.category}</td>
                      <td>{t.format}</td>
                      <td>
                        <Badge tone="blue">{t.version}</Badge>
                      </td>
                      <td className="pm-num">{t.usedCount30d}</td>
                      <td>
                        <Badge
                          tone={
                            t.locked
                              ? "amber"
                              : t.status === "Active"
                                ? "green"
                                : t.status === "Draft"
                                  ? "blue"
                                  : t.status === "Deprecated"
                                    ? "red"
                                    : "amber"
                          }
                          dot
                        >
                          {t.locked ? "Locked" : t.status}
                        </Badge>
                      </td>
                      <td className="pm-td-sub">{t.owner}</td>
                      <td className="text-end text-nowrap">
                        <div className="d-flex gap-1 justify-content-end">
                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() => setPreviewTpl(t)}
                            title="Preview"
                          >
                            <i className="bi bi-eye" />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setEditTpl(t)}
                            title="Edit"
                          >
                            <i className="bi bi-pencil-square" />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setLockTpl(t)}
                            title={t.locked ? "Unlock" : "Lock"}
                          >
                            <i
                              className={`bi ${t.locked ? "bi-unlock" : "bi-lock"}`}
                            />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setDeleteTpl(t)}
                            title="Delete"
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
        </section>
      )}

      {/* ============================================================
          TAB: EDITOR
          ============================================================ */}
      {tab === "editor" && (
        <section>
          <Head
            title="Template editor"
            body="Compose reusable content with variables, conditional sections, branding and output formats."
            action={() => setWizard(true)}
            actionLabel="New template"
            actionIcon="bi-plus-circle"
          />
          <div className="pm-card pm-card-pad">
            <div className="row g-3">
              <div className="col-md-7">
                <label className="form-label">Template name</label>
                <input
                  className="form-control"
                  defaultValue="User warning letter"
                />
              </div>
              <div className="col-md-5">
                <label className="form-label">Category</label>
                <select className="form-select">
                  <option>User Communication</option>
                  <option>Lending</option>
                  <option>Legal</option>
                  <option>Compliance</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">Template content</label>
                <textarea
                  className="form-control template-editor"
                  rows={10}
                  defaultValue={
                    "{{company_name}}\n\nDear {{user_name}},\n\nThis notice concerns your PayMo account {{user_account}}. The relevant amount is {{amount}} as of {{date}}.\n\nRegards,\n{{signatory_name}}"
                  }
                />
              </div>
              <div className="col-12">
                <label className="form-label">Available variables</label>
                <div className="d-flex gap-1 flex-wrap">
                  {variables.map((v) => (
                    <Badge key={v.id} tone="blue" className="mono" style={{ fontSize: ".7rem" }}>
                      {v.variable}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  const tpl = templates[0];
                  if (tpl) setPreviewTpl(tpl);
                }}
              >
                <i className="bi bi-eye me-1" />
                Preview
              </button>
              <button
                className="btn btn-primary"
                onClick={() =>
                  push({
                    kind: "success",
                    title: "Template saved",
                    body: "Draft saved successfully.",
                  })
                }
              >
                <i className="bi bi-check2 me-1" />
                Save draft
              </button>
              <button
                className="btn btn-outline-primary"
                onClick={() =>
                  push({
                    kind: "success",
                    title: "Submitted for review",
                    body: "Template routed to category reviewer.",
                  })
                }
              >
                <i className="bi bi-send me-1" />
                Submit for review
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
          TAB: VARIABLES
          ============================================================ */}
      {tab === "variables" && (
        <section>
          <Head
            title="Template variable catalog"
            body="Approved dynamic fields available across document and communication templates."
            action={() => setShowAddVar(true)}
            actionLabel="Add variable"
            actionIcon="bi-plus-circle"
          />
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead>
                  <tr>
                    <th>Variable</th>
                    <th>Type</th>
                    <th>Scope</th>
                    <th>Example value</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {variables.map((v) => (
                    <tr key={v.id}>
                      <td className="mono pm-td-strong">
                        {v.variable}
                        {v.locked && (
                          <i
                            className="bi bi-lock-fill ms-1"
                            style={{
                              fontSize: ".6rem",
                              color: "var(--pm-amber)",
                            }}
                          />
                        )}
                      </td>
                      <td>
                        <Badge tone="blue">{v.type}</Badge>
                      </td>
                      <td className="pm-td-sub">{v.scope}</td>
                      <td className="pm-td-sub">{v.exampleValue}</td>
                      <td>
                        <Badge
                          tone={
                            v.locked
                              ? "amber"
                              : v.status === "Active"
                                ? "green"
                                : "amber"
                          }
                          dot
                        >
                          {v.locked ? "Locked" : v.status}
                        </Badge>
                      </td>
                      <td className="text-end text-nowrap">
                        <div className="d-flex gap-1 justify-content-end">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setEditVar(v)}
                            title="Edit"
                          >
                            <i className="bi bi-pencil-square" />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setLockVar(v)}
                            title={v.locked ? "Unlock" : "Lock"}
                          >
                            <i
                              className={`bi ${v.locked ? "bi-unlock" : "bi-lock"}`}
                            />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setDeleteVar(v)}
                            title="Delete"
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
        </section>
      )}

      {/* ============================================================
          TAB: GENERATED DOCUMENTS
          ============================================================ */}
      {tab === "documents" && (
        <section>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div>
              <h3>Generated Documents</h3>
              <p>
                All documents generated from templates with status and
                delivery tracking.
              </p>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setDrawerDocs(true)}
            >
              <i className="bi bi-file-earmark-text me-1" />
              View all documents
            </button>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead>
                  <tr>
                    <th>Template</th>
                    <th>Generated For</th>
                    <th>Date</th>
                    <th>Format</th>
                    <th>Size</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((d) => (
                    <tr key={d.id}>
                      <td className="pm-td-strong">
                        {d.templateName}
                        {d.locked && (
                          <i
                            className="bi bi-lock-fill ms-1"
                            style={{
                              fontSize: ".6rem",
                              color: "var(--pm-amber)",
                            }}
                          />
                        )}
                      </td>
                      <td className="mono">{d.generatedFor}</td>
                      <td className="pm-td-sub">{d.date}</td>
                      <td>{d.format}</td>
                      <td className="pm-td-sub">{d.size}</td>
                      <td>
                        <Badge
                          tone={
                            d.status === "Sent"
                              ? "green"
                              : d.status === "Failed"
                                ? "red"
                                : d.status === "Pending"
                                  ? "amber"
                                  : "blue"
                          }
                          dot
                        >
                          {d.status}
                        </Badge>
                      </td>
                      <td className="text-end text-nowrap">
                        <div className="d-flex gap-1 justify-content-end">
                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() => {
                              const tpl = templates.find(
                                (t) => t.name === d.templateName
                              );
                              if (tpl) setPreviewTpl(tpl);
                              else
                                push({
                                  kind: "info",
                                  title: "Document preview",
                                  body: `Preview for ${d.generatedFor}`,
                                });
                            }}
                            title="Preview"
                          >
                            <i className="bi bi-eye" />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setLockDoc(d)}
                            title={d.locked ? "Unlock" : "Lock"}
                          >
                            <i
                              className={`bi ${d.locked ? "bi-unlock" : "bi-lock"}`}
                            />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setDeleteDoc(d)}
                            title="Delete"
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
        </section>
      )}

      {/* ============================================================
          TAB: USAGE ANALYTICS
          ============================================================ */}
      {tab === "usage" && (
        <section>
          <Head
            title="Template usage analytics"
            body="Generation volume by output type and average rendering time."
            action={() =>
              push({
                kind: "success",
                title: "Usage report exported",
                body: "Template usage analytics exported with format and rendering metrics.",
              })
            }
            actionLabel="Export"
          />
          <div className="pm-card">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead>
                  <tr>
                    <th>Template</th>
                    <th>Used (30d)</th>
                    <th>Generated PDF</th>
                    <th>Generated email</th>
                    <th>Generated letter</th>
                    <th>Avg time</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usage.map((u) => (
                    <tr key={u.id}>
                      <td className="pm-td-strong">
                        {u.templateName}
                        {u.locked && (
                          <i
                            className="bi bi-lock-fill ms-1"
                            style={{
                              fontSize: ".6rem",
                              color: "var(--pm-amber)",
                            }}
                          />
                        )}
                      </td>
                      <td className="pm-num">{u.used30d}</td>
                      <td className="pm-num">{u.generatedPdf}</td>
                      <td className="pm-num">{u.generatedEmail}</td>
                      <td className="pm-num">{u.generatedLetter}</td>
                      <td className="pm-num">{u.avgTime}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setDrawerDocs(true)}
                          title="View generated documents"
                        >
                          <i className="bi bi-file-earmark-text" />
                        </button>
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
          TAB: APPROVAL WORKFLOW
          ============================================================ */}
      {tab === "workflow" && (
        <section>
          <Head
            title="Template approval workflow"
            body="Draft, review, approve, publish and automatically archive replaced versions."
            action={() => setWizard(true)}
            actionLabel="New template"
            actionIcon="bi-plus-circle"
          />
          <div className="row g-3">
            {[
              [
                "1",
                "Create / edit",
                "Template owner drafts content",
                "Any permitted admin",
              ],
              [
                "2",
                "Review",
                "Legal or manager checks content, branding and variables",
                "Reviewer · 2 business days",
              ],
              [
                "3",
                "Approve",
                "Approver signs off or requests changes",
                "Approver · 1 business day",
              ],
              [
                "4",
                "Publish",
                "System makes the version available for use",
                "Automatic · immediate",
              ],
              [
                "5",
                "Archive",
                "Previous version moves to archive",
                "Automatic",
              ],
            ].map((x) => (
              <div className="col-md-6 col-xl-4" key={x[0]}>
                <div className="pm-card pm-card-pad h-100">
                  <div className="d-flex justify-content-between">
                    <div className="pm-eyebrow">STEP {x[0]}</div>
                    <Badge tone={x[0] === "3" ? "amber" : "blue"}>
                      {x[3]}
                    </Badge>
                  </div>
                  <h6 className="mt-3">{x[1]}</h6>
                  <p className="pm-td-sub mb-0">{x[2]}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ============================================================
          ALL MODALS & DRAWERS
          ============================================================ */}

      {/* Generic action modal */}
      <div className="pm-page-content">
        {action && (
          <div
            className="pm-overlay"
            onMouseDown={(e) =>
              e.target === e.currentTarget && setAction(null)
            }
          >
            <div
              className={`pm-modal ${action.body ? "lg" : "md"}`}
              role="dialog"
            >
              <div className="pm-modal-head">
                <div className="pm-modal-ico" style={{
                  background: action.tone === "green" ? "#e7f8ef" : action.tone === "blue" ? "#eff8ff" : action.tone === "amber" ? "#fff5e6" : action.tone === "red" ? "#fef2f2" : action.tone === "violet" ? "#f4f1ff" : "#eef1f6",
                  color: action.tone === "green" ? "#0b8f52" : action.tone === "blue" ? "#175cd3" : action.tone === "amber" ? "#b54708" : action.tone === "red" ? "#d92d20" : action.tone === "violet" ? "#5925dc" : "#101828",
                }}>
                  <i className={`bi ${action.icon || "bi-check2-circle"}`} />
                </div>
                <div className="flex-grow-1">
                  <h5 className="pm-modal-title">{action.title}</h5>
                  <p className="pm-modal-sub">
                    Super Admin action · document versions are audited
                  </p>
                </div>
                <button
                  className="pm-x"
                  onClick={() => setAction(null)}
                >
                  <i className="bi bi-x-lg" />
                </button>
              </div>
              <div className="pm-modal-body">{action.body}</div>
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
                      title: "Template workspace updated",
                      body: "The action was added to the document audit trail.",
                    });
                  }}
                >
                  Confirm action
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create template wizard */}
      <div className="pm-page-content">
        {wizard && (
          <div
            className="pm-overlay"
            onMouseDown={(e) =>
              e.target === e.currentTarget && setWizard(false)
            }
          >
            <div className="pm-modal lg" role="dialog">
              <div className="pm-modal-head">
                <div
                  className="pm-modal-ico"
                  style={{
                    background: "#eff8ff",
                    color: "#175cd3",
                  }}
                >
                  <i className="bi bi-file-earmark-plus" />
                </div>
                <div className="flex-grow-1">
                  <h5 className="pm-modal-title">
                    Create document template
                  </h5>
                  <p className="pm-modal-sub">
                    Step {wizardStep + 1} of 4:{" "}
                    {
                      [
                        "Identity",
                        "Content",
                        "Review",
                        "Publish",
                      ][wizardStep]
                    }
                  </p>
                </div>
                <button
                  className="pm-x"
                  onClick={() => setWizard(false)}
                >
                  <i className="bi bi-x-lg" />
                </button>
              </div>
              <Steps
                current={wizardStep}
                steps={[
                  {
                    label: "Identity",
                    icon: "bi-file-text",
                  },
                  {
                    label: "Content",
                    icon: "bi-pencil",
                  },
                  { label: "Review", icon: "bi-people" },
                  {
                    label: "Publish",
                    icon: "bi-cloud-upload",
                  },
                ]}
              />
              <div className="pm-wizard-progress">
                <span
                  style={{
                    width: `${(wizardStep + 1) * 25}%`,
                  }}
                />
              </div>
              <div className="pm-modal-body">
                <div className="row g-3">
                  <div className="col-md-7">
                    <label className="form-label">
                      Template name
                    </label>
                    <input
                      className="form-control"
                      defaultValue="New communication template"
                    />
                  </div>
                  <div className="col-md-5">
                    <label className="form-label">
                      Output formats
                    </label>
                    <select className="form-select">
                      <option>PDF + Email</option>
                      <option>Word + PDF</option>
                      <option>PDF only</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Owner</label>
                    <input
                      className="form-control"
                      defaultValue="Compliance"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">
                      Approval route
                    </label>
                    <select className="form-select">
                      <option>
                        Legal reviewer + Super Admin
                      </option>
                      <option>Manager approval</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">
                      Template notes
                    </label>
                    <textarea
                      className="form-control"
                      rows={3}
                      defaultValue="Use approved variables only. Branding and access policy are applied automatically."
                    />
                  </div>
                </div>
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
                    onClick={() =>
                      setWizardStep(wizardStep + 1)
                    }
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
                        title: "Template submitted",
                        body: "The new template is awaiting reviewer approval.",
                      });
                    }}
                  >
                    Submit for review
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Governance Drawer */}
      <Drawer
        open={drawerGov}
        onClose={() => setDrawerGov(false)}
        title="Template access policy"
        subtitle="Creation, editing, approval and usage controls"
        icon="bi-shield-lock"
        wide
      >
        <div className="pm-card pm-card-pad mb-3">
          <Badge tone="green" dot>
            Policy enforced
          </Badge>
          <h5 className="mt-3">Version-controlled publishing</h5>
          <p className="small text-muted">
            External-facing templates require Legal review and Super Admin
            approval before use.
          </p>
        </div>
        <div className="pm-card pm-card-pad">
          {[
            ["Create templates", "Permitted category owners"],
            [
              "Edit published version",
              "Create a new version",
            ],
            [
              "Approve external template",
              "Legal + Super Admin",
            ],
            [
              "Use restricted template",
              "Role permission required",
            ],
            [
              "Archive old version",
              "Automatic on publish",
            ],
            [
              "Export evidence",
              "Super Admin and Compliance",
            ],
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

      {/* Documents Viewer Drawer */}
      <DocumentViewerDrawer
        documents={documents}
        open={drawerDocs}
        onClose={() => setDrawerDocs(false)}
        onDelete={handleDeleteDocument}
        onLock={(id) =>
          handleToggleLockDocument(
            id,
            !documents.find((d) => d.id === id)?.locked
          )
        }
      />

      {/* Emergency Actions */}
      <EmergencyDataActionsModal
        open={showEmergency}
        onClose={() => setShowEmergency(false)}
      />

      {/* Export/Import */}
      <DataExportImportModal
        open={showExport}
        onClose={() => setShowExport(false)}
      />

      {/* Bulk Generate Wizard */}
      <BulkGenerateWizard
        open={bulkWizard}
        onClose={() => setBulkWizard(false)}
      />

      {/* === Template CRUD Modals === */}
      <AddTemplateModal
        open={showAddTpl}
        onClose={() => setShowAddTpl(false)}
        onAdd={handleAddTemplate}
      />
      <EditTemplateModal
        record={editTpl}
        open={!!editTpl}
        onClose={() => setEditTpl(null)}
        onSave={handleSaveTemplate}
      />
      <DeleteTemplateWizard
        record={deleteTpl}
        open={!!deleteTpl}
        onClose={() => setDeleteTpl(null)}
        onDelete={() => {
          if (deleteTpl) handleDeleteTemplate(deleteTpl.id);
        }}
      />
      <LockUnlockTemplateModal
        record={lockTpl}
        open={!!lockTpl}
        onClose={() => setLockTpl(null)}
        onToggle={(locked) => {
          if (lockTpl)
            handleToggleLockTemplate(lockTpl.id, locked);
        }}
      />
      <DocumentPreviewModal
        record={previewTpl}
        open={!!previewTpl}
        onClose={() => setPreviewTpl(null)}
      />

      {/* === Variable CRUD Modals === */}
      <AddVariableModal
        open={showAddVar}
        onClose={() => setShowAddVar(false)}
        onAdd={handleAddVariable}
      />
      <EditVariableModal
        record={editVar}
        open={!!editVar}
        onClose={() => setEditVar(null)}
        onSave={handleSaveVariable}
      />
      <DeleteVariableWizard
        record={deleteVar}
        open={!!deleteVar}
        onClose={() => setDeleteVar(null)}
        onDelete={() => {
          if (deleteVar) handleDeleteVariable(deleteVar.id);
        }}
      />
      <LockUnlockVariableModal
        record={lockVar}
        open={!!lockVar}
        onClose={() => setLockVar(null)}
        onToggle={(locked) => {
          if (lockVar)
            handleToggleLockVariable(lockVar.id, locked);
        }}
      />

      {/* === Document CRUD Modals === */}
      <DeleteDocumentWizard
        record={deleteDoc}
        open={!!deleteDoc}
        onClose={() => setDeleteDoc(null)}
        onDelete={() => {
          if (deleteDoc) handleDeleteDocument(deleteDoc.id);
        }}
      />
      <LockUnlockDocumentModal
        record={lockDoc}
        open={!!lockDoc}
        onClose={() => setLockDoc(null)}
        onToggle={(locked) => {
          if (lockDoc)
            handleToggleLockDocument(lockDoc.id, locked);
        }}
      />
    </div>
  );
}
