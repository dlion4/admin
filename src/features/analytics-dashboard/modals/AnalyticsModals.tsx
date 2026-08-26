import { useState } from "react";
import { Modal, Drawer, Badge, Steps, useToast } from "../../../components/ui";
import type {
  DashboardRecord,
  ScheduledReportRecord,
  ModelRecord,
  CohortRecord,
  FunnelRecord,
  QueryTemplateRecord,
  DataSourceRecord,
} from "../data/analyticsData";

/* ================================================================
   1. Add Dashboard Modal
   ================================================================ */
export function AddDashboardModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (d: DashboardRecord) => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState({
    name: "",
    owner: "",
    viewers: "",
    refresh: "Daily",
    metrics: "",
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add New Dashboard"
      subtitle="Super Admin — Create a new analytics dashboard"
      icon="bi-plus-circle-fill"
      tone="green"
      size="lg"
    >
      <div className="pm-modal-body">
        <div className="pm-note mb-3">
          <i className="bi bi-shield-lock me-1" />
          Only Super Admins can create dashboards. All actions are
          audit-logged.
        </div>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Dashboard Name</label>
            <input
              className="form-control"
              placeholder="e.g. Quarterly Revenue Dashboard"
              value={form.name}
              onChange={(e) =>
                setForm((p) => ({ ...p, name: e.target.value }))
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Owner</label>
            <input
              className="form-control"
              placeholder="e.g. CFO"
              value={form.owner}
              onChange={(e) =>
                setForm((p) => ({ ...p, owner: e.target.value }))
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Viewers</label>
            <input
              className="form-control"
              placeholder="e.g. Finance team"
              value={form.viewers}
              onChange={(e) =>
                setForm((p) => ({ ...p, viewers: e.target.value }))
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Refresh Interval</label>
            <select
              className="form-select"
              value={form.refresh}
              onChange={(e) =>
                setForm((p) => ({ ...p, refresh: e.target.value }))
              }
            >
              <option>Real-time</option>
              <option>Hourly</option>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Manual</option>
            </select>
          </div>
          <div className="col-12">
            <label className="form-label">Metrics Tracked</label>
            <input
              className="form-control"
              placeholder="e.g. Revenue, users, growth, churn rate"
              value={form.metrics}
              onChange={(e) =>
                setForm((p) => ({ ...p, metrics: e.target.value }))
              }
            />
          </div>
          <div className="col-12">
            <label className="form-label">Admin Notes</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Optional notes..."
              value={form.notes || ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, notes: e.target.value }))
              }
            />
          </div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            if (!form.name) return;
            onAdd({
              id: `db-${Date.now()}`,
              name: form.name,
              owner: form.owner || "Super Admin",
              viewers: form.viewers || "All Admins",
              refresh: form.refresh,
              metrics: form.metrics || "Custom metrics",
              locked: false,
              status: "Draft",
              createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
              updatedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
              widgetCount: 0,
              dataSourceCount: 0,
              lastViewed: "Never",
              viewCount: 0,
              sharedWith: 0,
            });
            toast({ kind: "success", title: "Dashboard created" });
            onClose();
          }}
        >
          <i className="bi bi-check2 me-1" />
          Create Dashboard
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   2. Edit Dashboard Modal
   ================================================================ */
export function EditDashboardModal({
  record,
  open,
  onClose,
  onSave,
}: {
  record: DashboardRecord | null;
  open: boolean;
  onClose: () => void;
  onSave: (d: DashboardRecord) => void;
}) {
  const toast = useToast();
  if (!record) return null;
  const [form, setForm] = useState({ ...record });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Edit: ${record.name}`}
      subtitle="Super Admin — Modify dashboard configuration"
      icon="bi-pencil-square"
      tone="blue"
      size="lg"
    >
      <div className="pm-modal-body">
        <div className="pm-note mb-3">
          <i className="bi bi-info-circle me-1" />
          All changes are audit-logged. Only Super Admins can edit dashboards.
        </div>
        <div className="row g-3">
          {(
            [
              ["name", "Dashboard Name"],
              ["owner", "Owner"],
              ["viewers", "Viewers"],
              ["metrics", "Metrics Tracked"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="col-md-6">
              <label className="form-label">{label}</label>
              <input
                className="form-control"
                value={String((form as any)[key] ?? "")}
                onChange={(e) =>
                  setForm((p) => ({ ...p, [key]: e.target.value }))
                }
              />
            </div>
          ))}
          <div className="col-md-6">
            <label className="form-label">Refresh Interval</label>
            <select
              className="form-select"
              value={form.refresh}
              onChange={(e) =>
                setForm((p) => ({ ...p, refresh: e.target.value }))
              }
            >
              <option>Real-time</option>
              <option>Hourly</option>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Manual</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={form.status}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  status: e.target.value as DashboardRecord["status"],
                }))
              }
            >
              <option>Active</option>
              <option>Draft</option>
              <option>Archived</option>
              <option>Under Review</option>
            </select>
          </div>
        </div>
        <div className="pm-card pm-card-pad mt-3">
          <div className="pm-eyebrow mb-2">Dashboard Stats</div>
          <div className="row g-2">
            <div className="col-4">
              <div className="pm-kv">
                <span className="k">Widgets</span>
                <span className="v">{form.widgetCount}</span>
              </div>
            </div>
            <div className="col-4">
              <div className="pm-kv">
                <span className="k">Data Sources</span>
                <span className="v">{form.dataSourceCount}</span>
              </div>
            </div>
            <div className="col-4">
              <div className="pm-kv">
                <span className="k">Views (30d)</span>
                <span className="v">{form.viewCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            onSave(form);
            toast({ kind: "success", title: "Dashboard updated" });
            onClose();
          }}
        >
          <i className="bi bi-check2 me-1" />
          Save Changes
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   3. Delete Dashboard Wizard (4-step)
   ================================================================ */
export function DeleteDashboardWizard({
  record,
  open,
  onClose,
  onDelete,
}: {
  record: DashboardRecord | null;
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
}) {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [confirm, setConfirm] = useState("");
  const [backup, setBackup] = useState(true);
  if (!record) return null;

  const steps = [
    { label: "Impact Review", icon: "bi-exclamation-triangle" },
    { label: "Backup", icon: "bi-database-down" },
    { label: "Confirmation", icon: "bi-shield-lock" },
    { label: "Summary", icon: "bi-check-lg" },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Dashboard"
      subtitle={`Step ${step + 1} of 4: ${steps[step].label}`}
      icon="bi-trash3-fill"
      tone="red"
      size="lg"
    >
      <div className="pm-wizard-progress">
        <span style={{ width: `${((step + 1) / 4) * 100}%` }} />
      </div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="d-flex flex-column gap-2">
            <div
              className="pm-note mb-3"
              style={{
                borderLeft: "3px solid var(--pm-danger)",
                background: "var(--pm-danger-soft)",
              }}
            >
              <div
                className="pm-td-strong"
                style={{ color: "var(--pm-danger)" }}
              >
                <i className="bi bi-exclamation-triangle me-1" />
                This action is IRREVERSIBLE
              </div>
              <div className="mt-1">
                All widgets, configurations, and sharing settings for this
                dashboard will be permanently removed.
              </div>
            </div>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-eyebrow mb-1">Dashboard to Delete</div>
              <div className="pm-td-strong">{record.name}</div>
              <div className="pm-td-sub">
                Owner: {record.owner} · {record.widgetCount} widgets ·{" "}
                {record.viewCount} views (30d)
              </div>
            </div>
            <div className="pm-card pm-card-pad">
              <div className="pm-eyebrow mb-2">Affected Data</div>
              <div className="pm-kv">
                <span className="k">Widget Configurations</span>
                <span className="v">{record.widgetCount} items</span>
              </div>
              <div className="pm-kv">
                <span className="k">Shared Users</span>
                <span className="v">{record.sharedWith} users</span>
              </div>
              <div className="pm-kv">
                <span className="k">Scheduled Reports Linked</span>
                <span className="v">2 reports</span>
              </div>
              <div className="pm-kv">
                <span className="k">Saved Filters</span>
                <span className="v">14 filter sets</span>
              </div>
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="d-flex flex-column gap-2">
            <div className="pm-eyebrow mb-1">Backup Options</div>
            <label
              className="d-flex align-items-center gap-2 mb-2"
              style={{ fontSize: ".82rem" }}
            >
              <input
                type="checkbox"
                className="form-check-input"
                checked={backup}
                onChange={(e) => setBackup(e.target.checked)}
              />
              Create encrypted backup before deletion
            </label>
            <label
              className="d-flex align-items-center gap-2 mb-2"
              style={{ fontSize: ".82rem" }}
            >
              <input type="checkbox" className="form-check-input" />
              Export widget configurations as JSON
            </label>
            <label
              className="d-flex align-items-center gap-2 mb-2"
              style={{ fontSize: ".82rem" }}
            >
              <input type="checkbox" className="form-check-input" />
              Send backup to corporate archive
            </label>
            <div className="pm-note">
              <i className="bi bi-info-circle me-1" />
              Backup will be retained for 90 days per data retention policy.
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="d-flex flex-column gap-2">
            <div className="mb-3">
              <label
                className="form-label"
                style={{ color: "var(--pm-danger)" }}
              >
                Type DELETE to confirm
              </label>
              <input
                className="form-control"
                style={{ borderColor: "var(--pm-danger)" }}
                placeholder="Type DELETE"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <label
              className="d-flex align-items-center gap-2"
              style={{ fontSize: ".82rem" }}
            >
              <input type="checkbox" className="form-check-input" />
              I understand this action cannot be undone
            </label>
            <label
              className="d-flex align-items-center gap-2"
              style={{ fontSize: ".82rem" }}
            >
              <input type="checkbox" className="form-check-input" />
              I have reviewed all linked resources
            </label>
          </div>
        )}
        {step === 3 && (
          <div className="pm-card pm-card-pad">
            <div className="pm-eyebrow mb-2">Final Deletion Summary</div>
            <div className="pm-kv">
              <span className="k">Dashboard</span>
              <span className="v">{record.name}</span>
            </div>
            <div className="pm-kv">
              <span className="k">Backup Created</span>
              <span className="v">{backup ? "Yes" : "No"}</span>
            </div>
            <div className="pm-kv">
              <span className="k">Widgets Removed</span>
              <span className="v">{record.widgetCount}</span>
            </div>
            <div className="pm-kv">
              <span className="k">Users Unshared</span>
              <span className="v">{record.sharedWith}</span>
            </div>
            <div className="pm-kv">
              <span className="k">Audit Log</span>
              <span className="v">Will be recorded</span>
            </div>
            <div className="pm-note mt-3">
              <i className="bi bi-shield-lock me-1" />
              Deletion will be executed immediately upon confirmation.
            </div>
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        {step > 0 && (
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setStep((s) => s - 1)}
          >
            ← Back
          </button>
        )}
        {step < 3 ? (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setStep((s) => s + 1)}
          >
            Continue →
          </button>
        ) : (
          <button
            className="btn btn-danger btn-sm"
            disabled={confirm !== "DELETE"}
            onClick={() => {
              onDelete();
              toast({ kind: "success", title: "Dashboard deleted" });
              onClose();
              setStep(0);
              setConfirm("");
            }}
          >
            <i className="bi bi-trash3 me-1" />
            Permanently Delete
          </button>
        )}
      </div>
    </Modal>
  );
}

/* ================================================================
   4. Lock/Unlock Dashboard Modal
   ================================================================ */
export function LockUnlockDashboardModal({
  record,
  open,
  onClose,
  onToggle,
}: {
  record: DashboardRecord | null;
  open: boolean;
  onClose: () => void;
  onToggle: (locked: boolean) => void;
}) {
  const toast = useToast();
  if (!record) return null;
  const isLocked = record.locked;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isLocked ? "Unlock Dashboard" : "Lock Dashboard"}
      subtitle="Super Admin — Dashboard access control"
      icon={isLocked ? "bi-unlock-fill" : "bi-lock-fill"}
      tone={isLocked ? "green" : "amber"}
      size="md"
    >
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-eyebrow mb-1">Dashboard</div>
          <div className="pm-td-strong">{record.name}</div>
          <Badge tone={isLocked ? "amber" : "green"} className="mt-2">
            {isLocked ? "🔒 LOCKED" : "🔓 UNLOCKED"}
          </Badge>
        </div>
        {isLocked ? (
          <div className="pm-card pm-card-pad">
            <div className="pm-eyebrow mb-2">Lock Details</div>
            <div className="pm-kv">
              <span className="k">Locked by</span>
              <span className="v">{record.lockedBy || "Super Admin"}</span>
            </div>
            <div className="pm-kv">
              <span className="k">Locked at</span>
              <span className="v">{record.lockedAt || "Unknown"}</span>
            </div>
            <div className="pm-kv">
              <span className="k">Reason</span>
              <span className="v">{record.lockReason || "No reason provided"}</span>
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <label className="form-label">Reason for Locking</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="e.g. Under compliance review, pending data validation..."
            />
          </div>
        )}
        <div className="pm-note">
          <i className={`bi ${isLocked ? "bi-unlock" : "bi-lock"} me-1`} />
          {isLocked
            ? "Unlocking will allow other admins to modify this dashboard."
            : "Locking prevents all other admins from editing. Only the locking admin can unlock."}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            onToggle(!isLocked);
            toast({
              kind: "success",
              title: isLocked ? "Dashboard unlocked" : "Dashboard locked",
            });
            onClose();
          }}
        >
          <i className={`bi ${isLocked ? "bi-unlock" : "bi-lock"} me-1`} />
          {isLocked ? "Unlock Dashboard" : "Lock Dashboard"}
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   5. Add Scheduled Report Modal
   ================================================================ */
export function AddScheduledReportModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (r: ScheduledReportRecord) => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState({
    name: "",
    frequency: "",
    format: "PDF",
    recipients: "",
    description: "",
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Scheduled Report"
      subtitle="Super Admin — Create a new automated report"
      icon="bi-plus-circle-fill"
      tone="green"
      size="lg"
    >
      <div className="pm-modal-body">
        <div className="pm-note mb-3">
          <i className="bi bi-shield-lock me-1" />
          Only Super Admins can create scheduled reports. All actions are
          audit-logged.
        </div>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Report Name</label>
            <input
              className="form-control"
              placeholder="e.g. Daily Risk Summary"
              value={form.name}
              onChange={(e) =>
                setForm((p) => ({ ...p, name: e.target.value }))
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Frequency</label>
            <select
              className="form-select"
              value={form.frequency}
              onChange={(e) =>
                setForm((p) => ({ ...p, frequency: e.target.value }))
              }
            >
              <option value="">Select frequency...</option>
              <option>Daily 6AM</option>
              <option>Daily 7AM</option>
              <option>Monday 8AM</option>
              <option>1st of month</option>
              <option>5th of month</option>
              <option>Quarterly</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Format</label>
            <div className="d-flex gap-2 flex-wrap">
              {["PDF", "Excel", "PDF + Email", "Excel + PDF", "PDF + PPT"].map(
                (f) => (
                  <button
                    key={f}
                    className={`btn btn-sm ${form.format === f ? "btn-primary" : "btn-outline-secondary"}`}
                    onClick={() => setForm((p) => ({ ...p, format: f }))}
                  >
                    {f}
                  </button>
                )
              )}
            </div>
          </div>
          <div className="col-md-6">
            <label className="form-label">Recipients</label>
            <input
              className="form-control"
              placeholder="e.g. CEO, CFO, COO"
              value={form.recipients}
              onChange={(e) =>
                setForm((p) => ({ ...p, recipients: e.target.value }))
              }
            />
          </div>
          <div className="col-12">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Describe what this report covers..."
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
            />
          </div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            if (!form.name) return;
            onAdd({
              id: `sr-${Date.now()}`,
              name: form.name,
              frequency: form.frequency || "Daily 7AM",
              format: form.format,
              recipients: form.recipients || "Super Admin",
              nextRun: "Tomorrow 7AM",
              lastStatus: "Pending",
              locked: false,
              createdAt: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              createdBy: "Super Admin",
              description: form.description || "Scheduled report",
            });
            toast({ kind: "success", title: "Scheduled report created" });
            onClose();
          }}
        >
          <i className="bi bi-check2 me-1" />
          Create Report
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   6. Edit Scheduled Report Modal
   ================================================================ */
export function EditScheduledReportModal({
  record,
  open,
  onClose,
  onSave,
}: {
  record: ScheduledReportRecord | null;
  open: boolean;
  onClose: () => void;
  onSave: (r: ScheduledReportRecord) => void;
}) {
  const toast = useToast();
  if (!record) return null;
  const [form, setForm] = useState({ ...record });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Edit: ${record.name}`}
      subtitle="Super Admin — Modify scheduled report"
      icon="bi-pencil-square"
      tone="blue"
      size="lg"
    >
      <div className="pm-modal-body">
        <div className="pm-note mb-3">
          <i className="bi bi-info-circle me-1" />
          All changes are audit-logged. Report schedule changes require
          approval.
        </div>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Report Name</label>
            <input
              className="form-control"
              value={form.name}
              onChange={(e) =>
                setForm((p) => ({ ...p, name: e.target.value }))
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Frequency</label>
            <select
              className="form-select"
              value={form.frequency}
              onChange={(e) =>
                setForm((p) => ({ ...p, frequency: e.target.value }))
              }
            >
              <option>Daily 6AM</option>
              <option>Daily 7AM</option>
              <option>Monday 8AM</option>
              <option>1st of month</option>
              <option>5th of month</option>
              <option>Quarterly</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Format</label>
            <select
              className="form-select"
              value={form.format}
              onChange={(e) =>
                setForm((p) => ({ ...p, format: e.target.value }))
              }
            >
              <option>PDF</option>
              <option>Excel</option>
              <option>PDF + Email</option>
              <option>Excel + PDF</option>
              <option>PDF + PPT</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Recipients</label>
            <input
              className="form-control"
              value={form.recipients}
              onChange={(e) =>
                setForm((p) => ({ ...p, recipients: e.target.value }))
              }
            />
          </div>
          <div className="col-12">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows={2}
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
            />
          </div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            onSave(form);
            toast({ kind: "success", title: "Report updated" });
            onClose();
          }}
        >
          <i className="bi bi-check2 me-1" />
          Save Changes
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   7. Delete Report Wizard (4-step)
   ================================================================ */
export function DeleteReportWizard({
  record,
  open,
  onClose,
  onDelete,
}: {
  record: ScheduledReportRecord | null;
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
}) {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [confirm, setConfirm] = useState("");
  if (!record) return null;

  const steps = [
    { label: "Impact Review", icon: "bi-exclamation-triangle" },
    { label: "Dependencies", icon: "bi-link-45deg" },
    { label: "Confirmation", icon: "bi-shield-lock" },
    { label: "Summary", icon: "bi-check-lg" },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Scheduled Report"
      subtitle={`Step ${step + 1} of 4: ${steps[step].label}`}
      icon="bi-trash3-fill"
      tone="red"
      size="lg"
    >
      <div className="pm-wizard-progress">
        <span style={{ width: `${((step + 1) / 4) * 100}%` }} />
      </div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="d-flex flex-column gap-2">
            <div
              className="pm-note mb-3"
              style={{
                borderLeft: "3px solid var(--pm-danger)",
                background: "var(--pm-danger-soft)",
              }}
            >
              <div
                className="pm-td-strong"
                style={{ color: "var(--pm-danger)" }}
              >
                <i className="bi bi-exclamation-triangle me-1" />
                This action is IRREVERSIBLE
              </div>
              <div className="mt-1">
                The scheduled report and all its history will be permanently
                removed.
              </div>
            </div>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-eyebrow mb-1">Report to Delete</div>
              <div className="pm-td-strong">{record.name}</div>
              <div className="pm-td-sub">
                {record.frequency} · {record.format} · {record.recipients}
              </div>
            </div>
            <div className="pm-card pm-card-pad">
              <div className="pm-eyebrow mb-2">Impact</div>
              <div className="pm-kv">
                <span className="k">Recipients Affected</span>
                <span className="v">{record.recipients}</span>
              </div>
              <div className="pm-kv">
                <span className="k">Historical Reports</span>
                <span className="v">24 generated reports</span>
              </div>
              <div className="pm-kv">
                <span className="k">Dashboard Links</span>
                <span className="v">Executive Summary</span>
              </div>
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="d-flex flex-column gap-2">
            <div className="pm-eyebrow mb-1">Linked Dependencies</div>
            <div className="pm-card pm-card-pad mb-2">
              <div className="pm-td-strong">Dashboard Feeds</div>
              <div className="pm-td-sub">
                This report feeds into 2 dashboards
              </div>
            </div>
            <div className="pm-card pm-card-pad mb-2">
              <div className="pm-td-strong">Email Distribution List</div>
              <div className="pm-td-sub">
                {record.recipients} will stop receiving this report
              </div>
            </div>
            <div className="pm-card pm-card-pad">
              <div className="pm-td-strong">Archive Copies</div>
              <div className="pm-td-sub">
                24 historical reports will be archived
              </div>
            </div>
            <div className="pm-note">
              <i className="bi bi-info-circle me-1" />
              Recipients will be notified of report cancellation.
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="d-flex flex-column gap-2">
            <div className="mb-3">
              <label
                className="form-label"
                style={{ color: "var(--pm-danger)" }}
              >
                Type DELETE to confirm
              </label>
              <input
                className="form-control"
                style={{ borderColor: "var(--pm-danger)" }}
                placeholder="Type DELETE"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <label
              className="d-flex align-items-center gap-2"
              style={{ fontSize: ".82rem" }}
            >
              <input type="checkbox" className="form-check-input" />I
              understand this action cannot be undone
            </label>
          </div>
        )}
        {step === 3 && (
          <div className="pm-card pm-card-pad">
            <div className="pm-eyebrow mb-2">Deletion Summary</div>
            <div className="pm-kv">
              <span className="k">Report</span>
              <span className="v">{record.name}</span>
            </div>
            <div className="pm-kv">
              <span className="k">Frequency</span>
              <span className="v">{record.frequency}</span>
            </div>
            <div className="pm-kv">
              <span className="k">Recipients Notified</span>
              <span className="v">Yes</span>
            </div>
            <div className="pm-kv">
              <span className="k">Audit Log</span>
              <span className="v">Will be recorded</span>
            </div>
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        {step > 0 && (
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setStep((s) => s - 1)}
          >
            ← Back
          </button>
        )}
        {step < 3 ? (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setStep((s) => s + 1)}
          >
            Continue →
          </button>
        ) : (
          <button
            className="btn btn-danger btn-sm"
            disabled={confirm !== "DELETE"}
            onClick={() => {
              onDelete();
              toast({ kind: "success", title: "Report deleted" });
              onClose();
              setStep(0);
              setConfirm("");
            }}
          >
            <i className="bi bi-trash3 me-1" />
            Permanently Delete
          </button>
        )}
      </div>
    </Modal>
  );
}

/* ================================================================
   8. Lock/Unlock Scheduled Report Modal
   ================================================================ */
export function LockUnlockReportModal({
  record,
  open,
  onClose,
  onToggle,
}: {
  record: ScheduledReportRecord | null;
  open: boolean;
  onClose: () => void;
  onToggle: (locked: boolean) => void;
}) {
  const toast = useToast();
  if (!record) return null;
  const isLocked = record.locked;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isLocked ? "Unlock Report" : "Lock Report"}
      subtitle="Super Admin — Report access control"
      icon={isLocked ? "bi-unlock-fill" : "bi-lock-fill"}
      tone={isLocked ? "green" : "amber"}
      size="md"
    >
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-eyebrow mb-1">Report</div>
          <div className="pm-td-strong">{record.name}</div>
          <Badge tone={isLocked ? "amber" : "green"} className="mt-2">
            {isLocked ? "🔒 LOCKED" : "🔓 UNLOCKED"}
          </Badge>
        </div>
        {isLocked ? (
          <div className="pm-card pm-card-pad">
            <div className="pm-eyebrow mb-2">Lock Details</div>
            <div className="pm-kv">
              <span className="k">Locked by</span>
              <span className="v">{record.lockedBy || "Super Admin"}</span>
            </div>
            <div className="pm-kv">
              <span className="k">Locked at</span>
              <span className="v">{record.lockedAt || "Unknown"}</span>
            </div>
            <div className="pm-kv">
              <span className="k">Reason</span>
              <span className="v">{record.lockReason || "No reason provided"}</span>
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <label className="form-label">Reason for Locking</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="e.g. Report format under review, pending approval..."
            />
          </div>
        )}
        <div className="pm-note">
          <i className={`bi ${isLocked ? "bi-unlock" : "bi-lock"} me-1`} />
          {isLocked
            ? "Unlocking will resume scheduled generation and distribution."
            : "Locking pauses the report schedule. No new reports will be generated."}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            onToggle(!isLocked);
            toast({
              kind: "success",
              title: isLocked ? "Report unlocked" : "Report locked",
            });
            onClose();
          }}
        >
          <i className={`bi ${isLocked ? "bi-unlock" : "bi-lock"} me-1`} />
          {isLocked ? "Unlock Report" : "Lock Report"}
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   9. Add Model Modal
   ================================================================ */
export function AddModelModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (m: ModelRecord) => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState({
    name: "",
    type: "Classification",
    accuracy: "",
    owner: "",
    version: "",
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Register New Model"
      subtitle="Super Admin — Add a predictive model to production registry"
      icon="bi-plus-circle-fill"
      tone="green"
      size="lg"
    >
      <div className="pm-modal-body">
        <div className="pm-note mb-3">
          <i className="bi bi-shield-lock me-1" />
          Only Super Admins can register models. All registrations are
          audit-logged.
        </div>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Model Name</label>
            <input
              className="form-control"
              placeholder="e.g. Credit Scoring Model"
              value={form.name}
              onChange={(e) =>
                setForm((p) => ({ ...p, name: e.target.value }))
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Model Type</label>
            <select
              className="form-select"
              value={form.type}
              onChange={(e) =>
                setForm((p) => ({ ...p, type: e.target.value }))
              }
            >
              <option>Classification</option>
              <option>Regression</option>
              <option>Anomaly detection</option>
              <option>Recommendation</option>
              <option>Time series</option>
              <option>NLP</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Accuracy</label>
            <input
              className="form-control"
              placeholder="e.g. 91%"
              value={form.accuracy}
              onChange={(e) =>
                setForm((p) => ({ ...p, accuracy: e.target.value }))
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Owner</label>
            <input
              className="form-control"
              placeholder="e.g. Data Science"
              value={form.owner}
              onChange={(e) =>
                setForm((p) => ({ ...p, owner: e.target.value }))
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Version</label>
            <input
              className="form-control"
              placeholder="e.g. v1.0"
              value={form.version}
              onChange={(e) =>
                setForm((p) => ({ ...p, version: e.target.value }))
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Status</label>
            <select className="form-select" defaultValue="Beta">
              <option>Beta</option>
              <option>Production</option>
              <option>Training</option>
            </select>
          </div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            if (!form.name) return;
            onAdd({
              id: `ml-${Date.now()}`,
              name: form.name,
              type: form.type,
              accuracy: form.accuracy || "TBD",
              status: "Beta",
              locked: false,
              owner: form.owner || "Data Science",
              lastTrained: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              version: form.version || "v1.0",
              features: 0,
              trainingRows: "0",
              latency: "0ms",
            });
            toast({ kind: "success", title: "Model registered" });
            onClose();
          }}
        >
          <i className="bi bi-check2 me-1" />
          Register Model
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   10. Edit Model Modal
   ================================================================ */
export function EditModelModal({
  record,
  open,
  onClose,
  onSave,
}: {
  record: ModelRecord | null;
  open: boolean;
  onClose: () => void;
  onSave: (m: ModelRecord) => void;
}) {
  const toast = useToast();
  if (!record) return null;
  const [form, setForm] = useState({ ...record });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Edit: ${record.name}`}
      subtitle="Super Admin — Modify model configuration"
      icon="bi-pencil-square"
      tone="blue"
      size="lg"
    >
      <div className="pm-modal-body">
        <div className="pm-note mb-3">
          <i className="bi bi-info-circle me-1" />
          All changes are audit-logged. Model changes may require
          retraining.
        </div>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Model Name</label>
            <input
              className="form-control"
              value={form.name}
              onChange={(e) =>
                setForm((p) => ({ ...p, name: e.target.value }))
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Type</label>
            <select
              className="form-select"
              value={form.type}
              onChange={(e) =>
                setForm((p) => ({ ...p, type: e.target.value }))
              }
            >
              <option>Classification</option>
              <option>Regression</option>
              <option>Anomaly detection</option>
              <option>Recommendation</option>
              <option>Time series</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Accuracy</label>
            <input
              className="form-control"
              value={form.accuracy}
              onChange={(e) =>
                setForm((p) => ({ ...p, accuracy: e.target.value }))
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Version</label>
            <input
              className="form-control"
              value={form.version}
              onChange={(e) =>
                setForm((p) => ({ ...p, version: e.target.value }))
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Owner</label>
            <input
              className="form-control"
              value={form.owner}
              onChange={(e) =>
                setForm((p) => ({ ...p, owner: e.target.value }))
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Latency</label>
            <input
              className="form-control"
              value={form.latency}
              onChange={(e) =>
                setForm((p) => ({ ...p, latency: e.target.value }))
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={form.status}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  status: e.target.value as ModelRecord["status"],
                }))
              }
            >
              <option>Production</option>
              <option>Beta</option>
              <option>Retired</option>
              <option>Training</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Features</label>
            <input
              className="form-control"
              type="number"
              value={form.features}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  features: Number(e.target.value),
                }))
              }
            />
          </div>
        </div>
        <div className="pm-card pm-card-pad mt-3">
          <div className="pm-eyebrow mb-2">Model Stats</div>
          <div className="row g-2">
            <div className="col-4">
              <div className="pm-kv">
                <span className="k">Training Rows</span>
                <span className="v">{form.trainingRows}</span>
              </div>
            </div>
            <div className="col-4">
              <div className="pm-kv">
                <span className="k">Last Trained</span>
                <span className="v">{form.lastTrained}</span>
              </div>
            </div>
            <div className="col-4">
              <div className="pm-kv">
                <span className="k">Latency</span>
                <span className="v">{form.latency}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            onSave(form);
            toast({ kind: "success", title: "Model updated" });
            onClose();
          }}
        >
          <i className="bi bi-check2 me-1" />
          Save Changes
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   11. Delete Model Wizard (4-step)
   ================================================================ */
export function DeleteModelWizard({
  record,
  open,
  onClose,
  onDelete,
}: {
  record: ModelRecord | null;
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
}) {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [confirm, setConfirm] = useState("");
  if (!record) return null;

  const steps = [
    { label: "Impact Review", icon: "bi-exclamation-triangle" },
    { label: "Dependencies", icon: "bi-link-45deg" },
    { label: "Confirmation", icon: "bi-shield-lock" },
    { label: "Summary", icon: "bi-check-lg" },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Model"
      subtitle={`Step ${step + 1} of 4: ${steps[step].label}`}
      icon="bi-trash3-fill"
      tone="red"
      size="lg"
    >
      <div className="pm-wizard-progress">
        <span style={{ width: `${((step + 1) / 4) * 100}%` }} />
      </div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="d-flex flex-column gap-2">
            <div
              className="pm-note mb-3"
              style={{
                borderLeft: "3px solid var(--pm-danger)",
                background: "var(--pm-danger-soft)",
              }}
            >
              <div
                className="pm-td-strong"
                style={{ color: "var(--pm-danger)" }}
              >
                <i className="bi bi-exclamation-triangle me-1" />
                This action is IRREVERSIBLE
              </div>
              <div className="mt-1">
                Model artifacts, training data references, and version
                history will be permanently removed.
              </div>
            </div>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-eyebrow mb-1">Model to Delete</div>
              <div className="pm-td-strong">{record.name}</div>
              <div className="pm-td-sub">
                {record.type} · {record.accuracy} · {record.version}
              </div>
            </div>
            <div className="pm-card pm-card-pad">
              <div className="pm-eyebrow mb-2">Affected Data</div>
              <div className="pm-kv">
                <span className="k">Model Versions</span>
                <span className="v">3 versions</span>
              </div>
              <div className="pm-kv">
                <span className="k">Training Datasets</span>
                <span className="v">{record.trainingRows} rows</span>
              </div>
              <div className="pm-kv">
                <span className="k">Dependent Dashboards</span>
                <span className="v">2 dashboards</span>
              </div>
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="d-flex flex-column gap-2">
            <div className="pm-eyebrow mb-1">Linked Dependencies</div>
            <div className="pm-card pm-card-pad mb-2">
              <div className="pm-td-strong">Production Pipelines</div>
              <div className="pm-td-sub">
                2 production pipelines depend on this model
              </div>
            </div>
            <div className="pm-card pm-card-pad mb-2">
              <div className="pm-td-strong">API Endpoints</div>
              <div className="pm-td-sub">
                1 serving endpoint will be deactivated
              </div>
            </div>
            <div className="pm-card pm-card-pad">
              <div className="pm-td-strong">Monitoring Alerts</div>
              <div className="pm-td-sub">
                4 performance monitors will be disabled
              </div>
            </div>
            <div className="pm-note">
              <i className="bi bi-exclamation-triangle me-1" />
              Removing this model will break dependent production pipelines.
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="d-flex flex-column gap-2">
            <div className="mb-3">
              <label
                className="form-label"
                style={{ color: "var(--pm-danger)" }}
              >
                Type DELETE to confirm
              </label>
              <input
                className="form-control"
                style={{ borderColor: "var(--pm-danger)" }}
                placeholder="Type DELETE"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <label
              className="d-flex align-items-center gap-2"
              style={{ fontSize: ".82rem" }}
            >
              <input type="checkbox" className="form-check-input" />I
              understand dependent pipelines will break
            </label>
          </div>
        )}
        {step === 3 && (
          <div className="pm-card pm-card-pad">
            <div className="pm-eyebrow mb-2">Deletion Summary</div>
            <div className="pm-kv">
              <span className="k">Model</span>
              <span className="v">{record.name}</span>
            </div>
            <div className="pm-kv">
              <span className="k">Pipeline Impact</span>
              <span className="v">2 pipelines</span>
            </div>
            <div className="pm-kv">
              <span className="k">Audit Log</span>
              <span className="v">Will be recorded</span>
            </div>
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        {step > 0 && (
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setStep((s) => s - 1)}
          >
            ← Back
          </button>
        )}
        {step < 3 ? (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setStep((s) => s + 1)}
          >
            Continue →
          </button>
        ) : (
          <button
            className="btn btn-danger btn-sm"
            disabled={confirm !== "DELETE"}
            onClick={() => {
              onDelete();
              toast({ kind: "success", title: "Model deleted" });
              onClose();
              setStep(0);
              setConfirm("");
            }}
          >
            <i className="bi bi-trash3 me-1" />
            Permanently Delete
          </button>
        )}
      </div>
    </Modal>
  );
}

/* ================================================================
   12. Lock/Unlock Model Modal
   ================================================================ */
export function LockUnlockModelModal({
  record,
  open,
  onClose,
  onToggle,
}: {
  record: ModelRecord | null;
  open: boolean;
  onClose: () => void;
  onToggle: (locked: boolean) => void;
}) {
  const toast = useToast();
  if (!record) return null;
  const isLocked = record.locked;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isLocked ? "Unlock Model" : "Lock Model"}
      subtitle="Super Admin — Model access control"
      icon={isLocked ? "bi-unlock-fill" : "bi-lock-fill"}
      tone={isLocked ? "green" : "amber"}
      size="md"
    >
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-eyebrow mb-1">Model</div>
          <div className="pm-td-strong">{record.name}</div>
          <Badge tone={isLocked ? "amber" : "green"} className="mt-2">
            {isLocked ? "🔒 LOCKED" : "🔓 UNLOCKED"}
          </Badge>
        </div>
        {isLocked ? (
          <div className="pm-card pm-card-pad">
            <div className="pm-eyebrow mb-2">Lock Details</div>
            <div className="pm-kv">
              <span className="k">Locked by</span>
              <span className="v">{record.lockedBy || "Super Admin"}</span>
            </div>
            <div className="pm-kv">
              <span className="k">Locked at</span>
              <span className="v">{record.lockedAt || "Unknown"}</span>
            </div>
            <div className="pm-kv">
              <span className="k">Reason</span>
              <span className="v">{record.lockReason || "No reason"}</span>
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <label className="form-label">Reason for Locking</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="e.g. Model retraining in progress, accuracy below threshold..."
            />
          </div>
        )}
        <div className="pm-note">
          <i className={`bi ${isLocked ? "bi-unlock" : "bi-lock"} me-1`} />
          {isLocked
            ? "Unlocking will allow retraining and redeployment."
            : "Locking prevents model retraining and production deployment."}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            onToggle(!isLocked);
            toast({
              kind: "success",
              title: isLocked ? "Model unlocked" : "Model locked",
            });
            onClose();
          }}
        >
          <i className={`bi ${isLocked ? "bi-unlock" : "bi-lock"} me-1`} />
          {isLocked ? "Unlock Model" : "Lock Model"}
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   13. Add Cohort Analysis Modal
   ================================================================ */
export function AddCohortModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (c: CohortRecord) => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState({
    type: "",
    description: "",
    dimensions: "",
    metrics: "",
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Cohort Analysis"
      subtitle="Super Admin — Create a new cohort analysis"
      icon="bi-plus-circle-fill"
      tone="green"
      size="lg"
    >
      <div className="pm-modal-body">
        <div className="pm-note mb-3">
          <i className="bi bi-shield-lock me-1" />
          Only Super Admins can create cohort analyses. All actions are
          audit-logged.
        </div>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Analysis Type</label>
            <input
              className="form-control"
              placeholder="e.g. Geographic cohort"
              value={form.type}
              onChange={(e) =>
                setForm((p) => ({ ...p, type: e.target.value }))
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Description</label>
            <input
              className="form-control"
              placeholder="e.g. User behavior by region"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Dimensions</label>
            <input
              className="form-control"
              placeholder="e.g. Region, signup date"
              value={form.dimensions}
              onChange={(e) =>
                setForm((p) => ({ ...p, dimensions: e.target.value }))
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Metrics</label>
            <input
              className="form-control"
              placeholder="e.g. Revenue, retention"
              value={form.metrics}
              onChange={(e) =>
                setForm((p) => ({ ...p, metrics: e.target.value }))
              }
            />
          </div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            if (!form.type) return;
            onAdd({
              id: `co-${Date.now()}`,
              type: form.type,
              description: form.description || "Custom cohort",
              dimensions: form.dimensions || "Default",
              metrics: form.metrics || "Default",
              locked: false,
              createdAt: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              lastRun: "Never",
              status: "Active",
            });
            toast({ kind: "success", title: "Cohort analysis created" });
            onClose();
          }}
        >
          <i className="bi bi-check2 me-1" />
          Create Analysis
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   14. Edit Cohort Modal
   ================================================================ */
export function EditCohortModal({
  record,
  open,
  onClose,
  onSave,
}: {
  record: CohortRecord | null;
  open: boolean;
  onClose: () => void;
  onSave: (c: CohortRecord) => void;
}) {
  const toast = useToast();
  if (!record) return null;
  const [form, setForm] = useState({ ...record });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Edit: ${record.type}`}
      subtitle="Super Admin — Modify cohort configuration"
      icon="bi-pencil-square"
      tone="blue"
      size="lg"
    >
      <div className="pm-modal-body">
        <div className="pm-note mb-3">
          <i className="bi bi-info-circle me-1" />
          All changes are audit-logged.
        </div>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Analysis Type</label>
            <input
              className="form-control"
              value={form.type}
              onChange={(e) =>
                setForm((p) => ({ ...p, type: e.target.value }))
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Description</label>
            <input
              className="form-control"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Dimensions</label>
            <input
              className="form-control"
              value={form.dimensions}
              onChange={(e) =>
                setForm((p) => ({ ...p, dimensions: e.target.value }))
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Metrics</label>
            <input
              className="form-control"
              value={form.metrics}
              onChange={(e) =>
                setForm((p) => ({ ...p, metrics: e.target.value }))
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={form.status}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  status: e.target.value as CohortRecord["status"],
                }))
              }
            >
              <option>Active</option>
              <option>Archived</option>
              <option>Under Review</option>
            </select>
          </div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            onSave(form);
            toast({ kind: "success", title: "Cohort analysis updated" });
            onClose();
          }}
        >
          <i className="bi bi-check2 me-1" />
          Save Changes
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   15. Delete Cohort Wizard (3-step)
   ================================================================ */
export function DeleteCohortWizard({
  record,
  open,
  onClose,
  onDelete,
}: {
  record: CohortRecord | null;
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
}) {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [confirm, setConfirm] = useState("");
  if (!record) return null;

  const steps = [
    { label: "Impact Review", icon: "bi-exclamation-triangle" },
    { label: "Confirmation", icon: "bi-shield-lock" },
    { label: "Summary", icon: "bi-check-lg" },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Cohort Analysis"
      subtitle={`Step ${step + 1} of 3: ${steps[step].label}`}
      icon="bi-trash3-fill"
      tone="red"
      size="lg"
    >
      <div className="pm-wizard-progress">
        <span style={{ width: `${((step + 1) / 3) * 100}%` }} />
      </div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="d-flex flex-column gap-2">
            <div
              className="pm-note mb-3"
              style={{
                borderLeft: "3px solid var(--pm-danger)",
                background: "var(--pm-danger-soft)",
              }}
            >
              <div
                className="pm-td-strong"
                style={{ color: "var(--pm-danger)" }}
              >
                <i className="bi bi-exclamation-triangle me-1" />
                This action is IRREVERSIBLE
              </div>
            </div>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-eyebrow mb-1">Cohort to Delete</div>
              <div className="pm-td-strong">{record.type}</div>
              <div className="pm-td-sub">{record.description}</div>
            </div>
            <div className="pm-card pm-card-pad">
              <div className="pm-eyebrow mb-2">Affected Data</div>
              <div className="pm-kv">
                <span className="k">Historical Runs</span>
                <span className="v">12 analyses</span>
              </div>
              <div className="pm-kv">
                <span className="k">Dashboard Links</span>
                <span className="v">User Growth, Revenue</span>
              </div>
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="d-flex flex-column gap-2">
            <div className="mb-3">
              <label
                className="form-label"
                style={{ color: "var(--pm-danger)" }}
              >
                Type DELETE to confirm
              </label>
              <input
                className="form-control"
                style={{ borderColor: "var(--pm-danger)" }}
                placeholder="Type DELETE"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <label
              className="d-flex align-items-center gap-2"
              style={{ fontSize: ".82rem" }}
            >
              <input type="checkbox" className="form-check-input" />I
              understand this action cannot be undone
            </label>
          </div>
        )}
        {step === 2 && (
          <div className="pm-card pm-card-pad">
            <div className="pm-eyebrow mb-2">Deletion Summary</div>
            <div className="pm-kv">
              <span className="k">Analysis</span>
              <span className="v">{record.type}</span>
            </div>
            <div className="pm-kv">
              <span className="k">Audit Log</span>
              <span className="v">Will be recorded</span>
            </div>
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        {step > 0 && (
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setStep((s) => s - 1)}
          >
            ← Back
          </button>
        )}
        {step < 2 ? (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setStep((s) => s + 1)}
          >
            Continue →
          </button>
        ) : (
          <button
            className="btn btn-danger btn-sm"
            disabled={confirm !== "DELETE"}
            onClick={() => {
              onDelete();
              toast({ kind: "success", title: "Cohort deleted" });
              onClose();
              setStep(0);
              setConfirm("");
            }}
          >
            <i className="bi bi-trash3 me-1" />
            Permanently Delete
          </button>
        )}
      </div>
    </Modal>
  );
}

/* ================================================================
   16. Lock/Unlock Cohort Modal
   ================================================================ */
export function LockUnlockCohortModal({
  record,
  open,
  onClose,
  onToggle,
}: {
  record: CohortRecord | null;
  open: boolean;
  onClose: () => void;
  onToggle: (locked: boolean) => void;
}) {
  const toast = useToast();
  if (!record) return null;
  const isLocked = record.locked;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isLocked ? "Unlock Cohort" : "Lock Cohort"}
      subtitle="Super Admin — Cohort access control"
      icon={isLocked ? "bi-unlock-fill" : "bi-lock-fill"}
      tone={isLocked ? "green" : "amber"}
      size="md"
    >
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-eyebrow mb-1">Cohort</div>
          <div className="pm-td-strong">{record.type}</div>
          <Badge tone={isLocked ? "amber" : "green"} className="mt-2">
            {isLocked ? "🔒 LOCKED" : "🔓 UNLOCKED"}
          </Badge>
        </div>
        {isLocked ? (
          <div className="pm-card pm-card-pad">
            <div className="pm-eyebrow mb-2">Lock Details</div>
            <div className="pm-kv">
              <span className="k">Locked by</span>
              <span className="v">{record.lockedBy || "Super Admin"}</span>
            </div>
            <div className="pm-kv">
              <span className="k">Reason</span>
              <span className="v">{record.lockReason || "No reason"}</span>
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <label className="form-label">Reason for Locking</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="e.g. Methodology under review..."
            />
          </div>
        )}
        <div className="pm-note">
          <i className={`bi ${isLocked ? "bi-unlock" : "bi-lock"} me-1`} />
          {isLocked
            ? "Unlocking will resume scheduled cohort runs."
            : "Locking pauses all scheduled cohort runs."}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            onToggle(!isLocked);
            toast({
              kind: "success",
              title: isLocked ? "Cohort unlocked" : "Cohort locked",
            });
            onClose();
          }}
        >
          <i className={`bi ${isLocked ? "bi-unlock" : "bi-lock"} me-1`} />
          {isLocked ? "Unlock Cohort" : "Lock Cohort"}
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   17. Add Funnel Modal
   ================================================================ */
export function AddFunnelModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (f: FunnelRecord) => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState({
    name: "",
    steps: "",
    conversionRate: "",
    dropOff: "",
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Funnel Analysis"
      subtitle="Super Admin — Create a new conversion funnel"
      icon="bi-plus-circle-fill"
      tone="green"
      size="lg"
    >
      <div className="pm-modal-body">
        <div className="pm-note mb-3">
          <i className="bi bi-shield-lock me-1" />
          Only Super Admins can create funnel analyses. All actions are
          audit-logged.
        </div>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Funnel Name</label>
            <input
              className="form-control"
              placeholder="e.g. Savings account onboarding"
              value={form.name}
              onChange={(e) =>
                setForm((p) => ({ ...p, name: e.target.value }))
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Steps</label>
            <input
              className="form-control"
              placeholder="e.g. Download → Register → Complete KYC"
              value={form.steps}
              onChange={(e) =>
                setForm((p) => ({ ...p, steps: e.target.value }))
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Conversion Rate</label>
            <input
              className="form-control"
              placeholder="e.g. 58.3%"
              value={form.conversionRate}
              onChange={(e) =>
                setForm((p) => ({ ...p, conversionRate: e.target.value }))
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Drop-off Rate</label>
            <input
              className="form-control"
              placeholder="e.g. 41.7%"
              value={form.dropOff}
              onChange={(e) =>
                setForm((p) => ({ ...p, dropOff: e.target.value }))
              }
            />
          </div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            if (!form.name) return;
            onAdd({
              id: `fn-${Date.now()}`,
              name: form.name,
              steps: form.steps || "Step 1 → Step 2",
              conversionRate: form.conversionRate || "0%",
              dropOff: form.dropOff || "100%",
              locked: false,
              createdAt: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              lastRun: "Never",
              status: "Draft",
              totalUsers: 0,
              avgTimeToConvert: "—",
            });
            toast({ kind: "success", title: "Funnel created" });
            onClose();
          }}
        >
          <i className="bi bi-check2 me-1" />
          Create Funnel
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   18. Edit Funnel Modal
   ================================================================ */
export function EditFunnelModal({
  record,
  open,
  onClose,
  onSave,
}: {
  record: FunnelRecord | null;
  open: boolean;
  onClose: () => void;
  onSave: (f: FunnelRecord) => void;
}) {
  const toast = useToast();
  if (!record) return null;
  const [form, setForm] = useState({ ...record });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Edit: ${record.name}`}
      subtitle="Super Admin — Modify funnel configuration"
      icon="bi-pencil-square"
      tone="blue"
      size="lg"
    >
      <div className="pm-modal-body">
        <div className="pm-note mb-3">
          <i className="bi bi-info-circle me-1" />
          All changes are audit-logged.
        </div>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Funnel Name</label>
            <input
              className="form-control"
              value={form.name}
              onChange={(e) =>
                setForm((p) => ({ ...p, name: e.target.value }))
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Steps</label>
            <input
              className="form-control"
              value={form.steps}
              onChange={(e) =>
                setForm((p) => ({ ...p, steps: e.target.value }))
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={form.status}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  status: e.target.value as FunnelRecord["status"],
                }))
              }
            >
              <option>Active</option>
              <option>Archived</option>
              <option>Under Review</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Total Users</label>
            <input
              className="form-control"
              type="number"
              value={form.totalUsers}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  totalUsers: Number(e.target.value),
                }))
              }
            />
          </div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            onSave(form);
            toast({ kind: "success", title: "Funnel updated" });
            onClose();
          }}
        >
          <i className="bi bi-check2 me-1" />
          Save Changes
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   19. Delete Funnel Wizard (3-step)
   ================================================================ */
export function DeleteFunnelWizard({
  record,
  open,
  onClose,
  onDelete,
}: {
  record: FunnelRecord | null;
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
}) {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [confirm, setConfirm] = useState("");
  if (!record) return null;

  const steps = [
    { label: "Impact Review", icon: "bi-exclamation-triangle" },
    { label: "Confirmation", icon: "bi-shield-lock" },
    { label: "Summary", icon: "bi-check-lg" },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Funnel Analysis"
      subtitle={`Step ${step + 1} of 3: ${steps[step].label}`}
      icon="bi-trash3-fill"
      tone="red"
      size="lg"
    >
      <div className="pm-wizard-progress">
        <span style={{ width: `${((step + 1) / 3) * 100}%` }} />
      </div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="d-flex flex-column gap-2">
            <div
              className="pm-note mb-3"
              style={{
                borderLeft: "3px solid var(--pm-danger)",
                background: "var(--pm-danger-soft)",
              }}
            >
              <div
                className="pm-td-strong"
                style={{ color: "var(--pm-danger)" }}
              >
                <i className="bi bi-exclamation-triangle me-1" />
                This action is IRREVERSIBLE
              </div>
            </div>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-eyebrow mb-1">Funnel to Delete</div>
              <div className="pm-td-strong">{record.name}</div>
              <div className="pm-td-sub">
                {record.steps} · {record.conversionRate} conversion
              </div>
            </div>
            <div className="pm-card pm-card-pad">
              <div className="pm-eyebrow mb-2">Affected Data</div>
              <div className="pm-kv">
                <span className="k">Historical Data</span>
                <span className="v">8 snapshots</span>
              </div>
              <div className="pm-kv">
                <span className="k">Total Users Tracked</span>
                <span className="v">{record.totalUsers.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="d-flex flex-column gap-2">
            <div className="mb-3">
              <label
                className="form-label"
                style={{ color: "var(--pm-danger)" }}
              >
                Type DELETE to confirm
              </label>
              <input
                className="form-control"
                style={{ borderColor: "var(--pm-danger)" }}
                placeholder="Type DELETE"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <label
              className="d-flex align-items-center gap-2"
              style={{ fontSize: ".82rem" }}
            >
              <input type="checkbox" className="form-check-input" />I
              understand this action cannot be undone
            </label>
          </div>
        )}
        {step === 2 && (
          <div className="pm-card pm-card-pad">
            <div className="pm-eyebrow mb-2">Deletion Summary</div>
            <div className="pm-kv">
              <span className="k">Funnel</span>
              <span className="v">{record.name}</span>
            </div>
            <div className="pm-kv">
              <span className="k">Audit Log</span>
              <span className="v">Will be recorded</span>
            </div>
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        {step > 0 && (
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setStep((s) => s - 1)}
          >
            ← Back
          </button>
        )}
        {step < 2 ? (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setStep((s) => s + 1)}
          >
            Continue →
          </button>
        ) : (
          <button
            className="btn btn-danger btn-sm"
            disabled={confirm !== "DELETE"}
            onClick={() => {
              onDelete();
              toast({ kind: "success", title: "Funnel deleted" });
              onClose();
              setStep(0);
              setConfirm("");
            }}
          >
            <i className="bi bi-trash3 me-1" />
            Permanently Delete
          </button>
        )}
      </div>
    </Modal>
  );
}

/* ================================================================
   20. Lock/Unlock Funnel Modal
   ================================================================ */
export function LockUnlockFunnelModal({
  record,
  open,
  onClose,
  onToggle,
}: {
  record: FunnelRecord | null;
  open: boolean;
  onClose: () => void;
  onToggle: (locked: boolean) => void;
}) {
  const toast = useToast();
  if (!record) return null;
  const isLocked = record.locked;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isLocked ? "Unlock Funnel" : "Lock Funnel"}
      subtitle="Super Admin — Funnel access control"
      icon={isLocked ? "bi-unlock-fill" : "bi-lock-fill"}
      tone={isLocked ? "green" : "amber"}
      size="md"
    >
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-eyebrow mb-1">Funnel</div>
          <div className="pm-td-strong">{record.name}</div>
          <Badge tone={isLocked ? "amber" : "green"} className="mt-2">
            {isLocked ? "🔒 LOCKED" : "🔓 UNLOCKED"}
          </Badge>
        </div>
        {isLocked ? (
          <div className="pm-card pm-card-pad">
            <div className="pm-eyebrow mb-2">Lock Details</div>
            <div className="pm-kv">
              <span className="k">Locked by</span>
              <span className="v">{record.lockedBy || "Super Admin"}</span>
            </div>
            <div className="pm-kv">
              <span className="k">Reason</span>
              <span className="v">{record.lockReason || "No reason"}</span>
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <label className="form-label">Reason for Locking</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="e.g. Funnel criteria being revised..."
            />
          </div>
        )}
        <div className="pm-note">
          <i className={`bi ${isLocked ? "bi-unlock" : "bi-lock"} me-1`} />
          {isLocked
            ? "Unlocking will resume funnel tracking."
            : "Locking pauses funnel tracking and data collection."}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            onToggle(!isLocked);
            toast({
              kind: "success",
              title: isLocked ? "Funnel unlocked" : "Funnel locked",
            });
            onClose();
          }}
        >
          <i className={`bi ${isLocked ? "bi-unlock" : "bi-lock"} me-1`} />
          {isLocked ? "Unlock Funnel" : "Lock Funnel"}
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   21. Compliance Audit Trail Drawer
   ================================================================ */
export function ComplianceAuditTrailDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const logs = [
    { ts: "Aug 25, 14:32", admin: "Super Admin", action: "CREATE", record: "Dashboard", detail: "Added Marketing Campaigns dashboard", ip: "192.168.1.106" },
    { ts: "Aug 25, 11:15", admin: "Super Admin", action: "EDIT", record: "Model", detail: "Updated Fraud Detection v5.1 features", ip: "192.168.1.106" },
    { ts: "Aug 24, 16:48", admin: "Super Admin", action: "LOCK", record: "Dashboard", detail: "Locked Transaction Analytics", ip: "192.168.1.106" },
    { ts: "Aug 24, 09:20", admin: "Platform Admin", action: "RUN", record: "Query", detail: "Executed Daily Transaction Volume", ip: "192.168.1.50" },
    { ts: "Aug 23, 14:55", admin: "Super Admin", action: "EXPORT", record: "Report", detail: "Exported Monthly Financial Pack", ip: "192.168.1.106" },
    { ts: "Aug 22, 15:12", admin: "Super Admin", action: "DELETE", record: "Cohort", detail: "Removed test cohort analysis", ip: "192.168.1.106" },
    { ts: "Aug 21, 10:30", admin: "Finance Admin", action: "VIEW", record: "Dashboard", detail: "Viewed Financial Overview", ip: "192.168.1.78" },
    { ts: "Aug 20, 16:45", admin: "Super Admin", action: "CREATE", record: "Report", detail: "Created Daily Risk Summary", ip: "192.168.1.106" },
  ];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Compliance Audit Trail"
      subtitle="Immutable record of all analytics actions"
      icon="bi-clock-history"
      tone="violet"
      wide
    >
      <div className="pm-table-wrap">
        <table className="pm-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Admin</th>
              <th>Action</th>
              <th>Record</th>
              <th>Details</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l, i) => (
              <tr key={i}>
                <td className="mono pm-td-sub">{l.ts}</td>
                <td className="pm-td-strong">{l.admin}</td>
                <td>
                  <Badge
                    tone={
                      l.action === "DELETE"
                        ? "red"
                        : l.action === "LOCK"
                          ? "amber"
                          : l.action === "CREATE"
                            ? "green"
                            : "blue"
                    }
                  >
                    {l.action}
                  </Badge>
                </td>
                <td>{l.record}</td>
                <td style={{ fontSize: ".78rem" }}>{l.detail}</td>
                <td className="mono pm-td-sub">{l.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pm-note mt-3">
        <i className="bi bi-shield-lock me-1" />
        Audit trail is immutable. SHA-256 hash verification enabled.
      </div>
    </Drawer>
  );
}

/* ================================================================
   22. Admin Permissions Drawer
   ================================================================ */
export function AdminPermissionsDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const admins = [
    { name: "Jeckonia Kwasa", role: "Super Admin", perms: ["All Operations", "Lock/Unlock", "Delete", "Export", "Emergency"] },
    { name: "Dan Delion", role: "Super Admin", perms: ["All Operations", "Lock/Unlock", "Delete", "Export"] },
    { name: "James Ochieng", role: "Platform Admin", perms: ["View All", "Edit (non-locked)", "Create", "Run Queries"] },
    { name: "Mary Wanjiku", role: "Finance Admin", perms: ["View Financial", "Export Financial", "Edit Reports"] },
  ];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Admin Permissions"
      subtitle="Access control for analytics administrators"
      icon="bi-shield-lock"
      tone="violet"
      half
    >
      {admins.map((a, i) => (
        <div key={i} className="pm-card pm-card-pad mb-2">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <div className="pm-td-strong">{a.name}</div>
            <Badge tone={a.role === "Super Admin" ? "green" : "blue"}>
              {a.role}
            </Badge>
          </div>
          <div className="d-flex gap-1 flex-wrap mt-1">
            {a.perms.map((p) => (
              <Badge key={p} tone="green" style={{ fontSize: ".65rem" }}>
                {p}
              </Badge>
            ))}
          </div>
        </div>
      ))}
      <div className="pm-note">
        <i className="bi bi-shield-lock me-1" />
        Permission changes require Board approval and are audit-logged.
      </div>
    </Drawer>
  );
}

/* ================================================================
   23. Emergency Data Actions Modal
   ================================================================ */
export function EmergencyDataActionsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const toast = useToast();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Emergency Data Actions"
      subtitle="Super Admin — Critical data controls"
      icon="bi-exclamation-triangle-fill"
      tone="red"
      size="lg"
    >
      <div className="pm-modal-body">
        <div
          className="pm-note mb-3"
          style={{
            borderLeft: "3px solid var(--pm-danger)",
            background: "var(--pm-danger-soft)",
          }}
        >
          <div
            className="pm-td-strong"
            style={{ color: "var(--pm-danger)" }}
          >
            ⚠️ Emergency actions are irreversible and trigger immediate
            notifications
          </div>
        </div>
        {[
          { action: "Pause All Data Pipelines", desc: "Halt all ETL and real-time sync processes", icon: "bi-pause-circle" },
          { action: "Revoke All Query Access", desc: "Immediately disable all ad-hoc query permissions", icon: "bi-shield-x" },
          { action: "Freeze All Exports", desc: "Prevent all data exports across the platform", icon: "bi-download" },
          { action: "Emergency Data Backup", desc: "Trigger encrypted backup of all analytics data", icon: "bi-database-down" },
          { action: "Notify Data Owners", desc: "Send emergency notification to all data stewards", icon: "bi-megaphone-fill" },
          { action: "Engage External Auditor", desc: "Trigger emergency data audit engagement", icon: "bi-person-badge" },
        ].map((e, i) => (
          <div
            key={i}
            className="pm-alert-row mb-2"
            style={{ cursor: "pointer" }}
            onClick={() =>
              toast({
                kind: "success",
                title: e.action,
                body: "Emergency action triggered",
              })
            }
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                display: "grid",
                placeItems: "center",
                background: "var(--pm-danger-soft)",
                color: "var(--pm-danger)",
                flex: "none",
              }}
            >
              <i className={`bi ${e.icon}`} />
            </div>
            <div className="flex-grow-1">
              <div className="pm-td-strong">{e.action}</div>
              <div className="pm-td-sub">{e.desc}</div>
            </div>
            <i
              className="bi bi-chevron-right"
              style={{ color: "var(--pm-muted)" }}
            />
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ================================================================
   24. Data Export/Import Modal
   ================================================================ */
export function DataExportImportModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"export" | "import">("export");
  const toast = useToast();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Data Export / Import"
      subtitle="Bulk analytics data operations"
      icon="bi-arrow-left-right"
      tone="blue"
      size="lg"
    >
      <div className="pm-modal-body">
        <div className="d-flex gap-2 mb-3">
          <button
            className={`btn btn-sm ${mode === "export" ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => setMode("export")}
          >
            Export Data
          </button>
          <button
            className={`btn btn-sm ${mode === "import" ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => setMode("import")}
          >
            Import Data
          </button>
        </div>
        {mode === "export" ? (
          <div className="d-flex flex-column gap-2">
            <div className="pm-eyebrow mb-1">Select data to export</div>
            {[
              "All Dashboard Configurations",
              "Scheduled Reports",
              "Model Registry",
              "Cohort Analyses",
              "Funnel Configurations",
              "Query Templates",
              "Data Source Metadata",
              "Audit Trail (30d)",
            ].map((item) => (
              <label
                key={item}
                className="d-flex align-items-center gap-2 mb-2"
                style={{ fontSize: ".82rem" }}
              >
                <input type="checkbox" className="form-check-input" />
                {item}
              </label>
            ))}
            <div className="pm-eyebrow mt-2 mb-1">Format</div>
            <div className="d-flex gap-2 flex-wrap">
              {["Excel (.xlsx)", "CSV", "JSON", "PDF Report"].map((f) => (
                <button
                  key={f}
                  className="btn btn-sm btn-outline-secondary"
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            <div
              style={{
                border: "2px dashed var(--pm-border)",
                borderRadius: 12,
                padding: "2rem",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              <i
                className="bi bi-cloud-arrow-up"
                style={{
                  fontSize: "2rem",
                  color: "var(--pm-muted)",
                }}
              />
              <div
                style={{
                  fontSize: ".85rem",
                  margin: ".5rem 0 0",
                  color: "var(--pm-muted)",
                }}
              >
                Drop file here or click to browse
              </div>
              <div className="pm-td-sub">
                XLSX, CSV, JSON — Max 100MB
              </div>
            </div>
            <div className="pm-note">
              <i className="bi bi-info-circle me-1" />
              Imported data will be validated before merging. A backup will
              be created automatically.
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ================================================================
   25. Data Source Configuration Wizard (4-step)
   ================================================================ */
export function DataSourceConfigWizard({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const toast = useToast();
  const steps = [
    { label: "Source", icon: "bi-database" },
    { label: "Schema", icon: "bi-diagram-3" },
    { label: "Security", icon: "bi-shield-lock" },
    { label: "Review", icon: "bi-check-lg" },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Configure Data Source"
      subtitle={`Step ${step + 1} of 4: ${steps[step].label}`}
      icon="bi-database-gear"
      tone="blue"
      size="lg"
    >
      <div className="pm-wizard-progress">
        <span style={{ width: `${((step + 1) / 4) * 100}%` }} />
      </div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="d-flex flex-column gap-2">
            <div className="pm-eyebrow mb-1">Select source type</div>
            <div className="row g-2">
              {[
                "PostgreSQL",
                "MySQL",
                "MongoDB",
                "ClickHouse",
                "BigQuery",
                "Snowflake",
                "S3/CSV",
                "REST API",
              ].map((t) => (
                <div key={t} className="col-6">
                  <button className="pm-opt w-100">
                    <div className="r" />
                    <span style={{ fontSize: ".82rem" }}>{t}</span>
                  </button>
                </div>
              ))}
            </div>
            <label className="form-label mt-2">Connection String</label>
            <input
              className="form-control"
              placeholder="postgresql://user:pass@host:5432/db"
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: ".8rem",
              }}
            />
          </div>
        )}
        {step === 1 && (
          <div className="d-flex flex-column gap-2">
            <div className="pm-eyebrow mb-1">Select schemas to sync</div>
            {[
              "transactions",
              "users",
              "finance",
              "fraud",
              "partners",
              "system",
              "support",
              "loans",
              "cards",
            ].map((s) => (
              <label
                key={s}
                className="d-flex align-items-center gap-2 mb-2"
                style={{ fontSize: ".82rem" }}
              >
                <input
                  type="checkbox"
                  className="form-check-input"
                  defaultChecked={
                    s === "transactions" || s === "users" || s === "finance"
                  }
                />
                <span className="mono">{s}</span>
              </label>
            ))}
            <div className="pm-note">
              <i className="bi bi-info-circle me-1" />
              Selected schemas will be synced according to the configured
              frequency.
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="d-flex flex-column gap-2">
            <div className="pm-eyebrow mb-1">Security configuration</div>
            <label className="form-label">PII Handling</label>
            <div className="row g-2 mb-3">
              {["Masked", "Encrypted", "Full Access", "Redacted"].map(
                (p) => (
                  <div key={p} className="col-6">
                    <button className="pm-opt w-100">
                      <div className="r" />
                      <span style={{ fontSize: ".78rem" }}>{p}</span>
                    </button>
                  </div>
                )
              )}
            </div>
            <label className="form-label">Access Level</label>
            {[
              "Super Admin Only",
              "All Admins",
              "Finance + Compliance",
              "Read-Only for All",
            ].map((a) => (
              <label
                key={a}
                className="d-flex align-items-center gap-2 mb-2"
                style={{ fontSize: ".82rem" }}
              >
                <input
                  type="checkbox"
                  className="form-check-input"
                  defaultChecked={a === "Super Admin Only"}
                />
                {a}
              </label>
            ))}
            <div className="pm-note">
              <i className="bi bi-shield-lock me-1" />
              All data access is audit-logged with IP tracking.
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="pm-card pm-card-pad">
            <div className="pm-eyebrow mb-2">Configuration Summary</div>
            <div className="pm-kv">
              <span className="k">Source Type</span>
              <span className="v">PostgreSQL</span>
            </div>
            <div className="pm-kv">
              <span className="k">Schemas</span>
              <span className="v">3 selected</span>
            </div>
            <div className="pm-kv">
              <span className="k">PII Handling</span>
              <span className="v">Masked</span>
            </div>
            <div className="pm-kv">
              <span className="k">Access Level</span>
              <span className="v">Super Admin Only</span>
            </div>
            <div className="pm-note mt-3">
              <i className="bi bi-shield-lock me-1" />
              Connection will be encrypted with TLS 1.3. All sync operations
              are audit-logged.
            </div>
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        {step > 0 && (
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setStep((s) => s - 1)}
          >
            ← Back
          </button>
        )}
        {step < 3 ? (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setStep((s) => s + 1)}
          >
            Continue →
          </button>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              toast({
                kind: "success",
                title: "Data source configured",
              });
              onClose();
              setStep(0);
            }}
          >
            <i className="bi bi-check2 me-1" />
            Save & Connect
          </button>
        )}
      </div>
    </Modal>
  );
}

/* ================================================================
   26. Add Query Template Modal
   ================================================================ */
export function AddQueryTemplateModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (q: QueryTemplateRecord) => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState({
    name: "",
    schema: "Transactions",
    description: "",
    tags: "",
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Query Template"
      subtitle="Super Admin — Create a reusable query template"
      icon="bi-plus-circle-fill"
      tone="green"
      size="lg"
    >
      <div className="pm-modal-body">
        <div className="pm-note mb-3">
          <i className="bi bi-shield-lock me-1" />
          Only Super Admins can create query templates. All actions are
          audit-logged.
        </div>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Template Name</label>
            <input
              className="form-control"
              placeholder="e.g. Weekly KYC Report"
              value={form.name}
              onChange={(e) =>
                setForm((p) => ({ ...p, name: e.target.value }))
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Primary Schema</label>
            <select
              className="form-select"
              value={form.schema}
              onChange={(e) =>
                setForm((p) => ({ ...p, schema: e.target.value }))
              }
            >
              <option>Transactions</option>
              <option>Users</option>
              <option>Finance</option>
              <option>Fraud</option>
              <option>Partners</option>
              <option>System</option>
              <option>Support</option>
              <option>Loans</option>
              <option>Cards</option>
            </select>
          </div>
          <div className="col-12">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Describe what this query template does..."
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
            />
          </div>
          <div className="col-12">
            <label className="form-label">Tags</label>
            <input
              className="form-control"
              placeholder="e.g. compliance, daily (comma-separated)"
              value={form.tags}
              onChange={(e) =>
                setForm((p) => ({ ...p, tags: e.target.value }))
              }
            />
          </div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            if (!form.name) return;
            onAdd({
              id: `qt-${Date.now()}`,
              name: form.name,
              schema: form.schema,
              description: form.description || "Custom query",
              lastRun: "Never",
              runCount: 0,
              locked: false,
              createdBy: "Super Admin",
              status: "Draft",
              avgRuntime: "—",
              tags: form.tags
                ? form.tags.split(",").map((t) => t.trim())
                : [],
            });
            toast({ kind: "success", title: "Query template created" });
            onClose();
          }}
        >
          <i className="bi bi-check2 me-1" />
          Create Template
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   27. Lock/Unlock Query Template Modal
   ================================================================ */
export function LockUnlockQueryModal({
  record,
  open,
  onClose,
  onToggle,
}: {
  record: QueryTemplateRecord | null;
  open: boolean;
  onClose: () => void;
  onToggle: (locked: boolean) => void;
}) {
  const toast = useToast();
  if (!record) return null;
  const isLocked = record.locked;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isLocked ? "Unlock Query Template" : "Lock Query Template"}
      subtitle="Super Admin — Query access control"
      icon={isLocked ? "bi-unlock-fill" : "bi-lock-fill"}
      tone={isLocked ? "green" : "amber"}
      size="md"
    >
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-eyebrow mb-1">Template</div>
          <div className="pm-td-strong">{record.name}</div>
          <Badge tone={isLocked ? "amber" : "green"} className="mt-2">
            {isLocked ? "🔒 LOCKED" : "🔓 UNLOCKED"}
          </Badge>
        </div>
        {isLocked ? (
          <div className="pm-card pm-card-pad">
            <div className="pm-eyebrow mb-2">Lock Details</div>
            <div className="pm-kv">
              <span className="k">Locked by</span>
              <span className="v">{record.lockedBy || "Super Admin"}</span>
            </div>
            <div className="pm-kv">
              <span className="k">Reason</span>
              <span className="v">{record.lockReason || "No reason"}</span>
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <label className="form-label">Reason for Locking</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="e.g. PII masking update in progress..."
            />
          </div>
        )}
        <div className="pm-note">
          <i className={`bi ${isLocked ? "bi-unlock" : "bi-lock"} me-1`} />
          {isLocked
            ? "Unlocking will resume template execution."
            : "Locking prevents template execution by all users."}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            onToggle(!isLocked);
            toast({
              kind: "success",
              title: isLocked
                ? "Template unlocked"
                : "Template locked",
            });
            onClose();
          }}
        >
          <i className={`bi ${isLocked ? "bi-unlock" : "bi-lock"} me-1`} />
          {isLocked ? "Unlock Template" : "Lock Template"}
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   28. Lock/Unlock Data Source Modal
   ================================================================ */
export function LockUnlockDataSourceModal({
  record,
  open,
  onClose,
  onToggle,
}: {
  record: DataSourceRecord | null;
  open: boolean;
  onClose: () => void;
  onToggle: (locked: boolean) => void;
}) {
  const toast = useToast();
  if (!record) return null;
  const isLocked = record.locked;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isLocked ? "Unlock Data Source" : "Lock Data Source"}
      subtitle="Super Admin — Data source access control"
      icon={isLocked ? "bi-unlock-fill" : "bi-lock-fill"}
      tone={isLocked ? "green" : "amber"}
      size="md"
    >
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-eyebrow mb-1">Data Source</div>
          <div className="pm-td-strong">{record.name}</div>
          <div className="pm-td-sub">{record.type} · {record.rowCount}</div>
          <Badge tone={isLocked ? "amber" : "green"} className="mt-2">
            {isLocked ? "🔒 LOCKED" : "🔓 UNLOCKED"}
          </Badge>
        </div>
        {isLocked ? (
          <div className="pm-card pm-card-pad">
            <div className="pm-eyebrow mb-2">Lock Details</div>
            <div className="pm-kv">
              <span className="k">Locked by</span>
              <span className="v">{record.lockedBy || "Super Admin"}</span>
            </div>
            <div className="pm-kv">
              <span className="k">Reason</span>
              <span className="v">{record.lockReason || "No reason"}</span>
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <label className="form-label">Reason for Locking</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="e.g. Security audit in progress..."
            />
          </div>
        )}
        <div className="pm-note">
          <i className={`bi ${isLocked ? "bi-unlock" : "bi-lock"} me-1`} />
          {isLocked
            ? "Unlocking will resume data sync for this source."
            : "Locking pauses data sync. Dashboards using this source may show stale data."}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            onToggle(!isLocked);
            toast({
              kind: "success",
              title: isLocked
                ? "Data source unlocked"
                : "Data source locked",
            });
            onClose();
          }}
        >
          <i className={`bi ${isLocked ? "bi-unlock" : "bi-lock"} me-1`} />
          {isLocked ? "Unlock Source" : "Lock Source"}
        </button>
      </div>
    </Modal>
  );
}
