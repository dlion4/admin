import { useState } from "react";
import { Modal, Drawer, Badge, Steps, useToast } from "../../../components/ui";
import type {
  TemplateRecord,
  VariableRecord,
  DocumentRecord,
} from "../data/templateData";

/* ================================================================
   1. Add Template Modal
   ================================================================ */
export function AddTemplateModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (t: TemplateRecord) => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState({
    name: "",
    category: "User Communication",
    format: "PDF",
    owner: "",
    description: "",
    body: "",
    approvalRoute: "Manager + Legal",
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add New Template"
      subtitle="Super Admin — Create a new document template"
      icon="bi-plus-circle-fill"
      tone="green"
      size="lg"
    >
      <div className="pm-modal-body">
        <div className="pm-note mb-3">
          <i className="bi bi-shield-lock me-1" />
          Only Super Admins can create templates. All actions are
          audit-logged.
        </div>
        <div className="row g-3">
          <div className="col-md-7">
            <label className="form-label">Template Name</label>
            <input
              className="form-control"
              placeholder="e.g. Loan demand letter"
              value={form.name}
              onChange={(e) =>
                setForm((p) => ({ ...p, name: e.target.value }))
              }
            />
          </div>
          <div className="col-md-5">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={form.category}
              onChange={(e) =>
                setForm((p) => ({ ...p, category: e.target.value }))
              }
            >
              <option>User Communication</option>
              <option>Lending</option>
              <option>Partnerships</option>
              <option>Legal</option>
              <option>HR</option>
              <option>Governance</option>
              <option>Compliance</option>
              <option>Privacy</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Output Format</label>
            <select
              className="form-select"
              value={form.format}
              onChange={(e) =>
                setForm((p) => ({ ...p, format: e.target.value }))
              }
            >
              <option>PDF</option>
              <option>PDF + Email</option>
              <option>Word + PDF</option>
              <option>Email HTML</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Owner</label>
            <input
              className="form-control"
              placeholder="e.g. Compliance"
              value={form.owner}
              onChange={(e) =>
                setForm((p) => ({ ...p, owner: e.target.value }))
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Approval Route</label>
            <select
              className="form-select"
              value={form.approvalRoute}
              onChange={(e) =>
                setForm((p) => ({ ...p, approvalRoute: e.target.value }))
              }
            >
              <option>Manager + Legal</option>
              <option>Legal + Super Admin</option>
              <option>Manager only</option>
              <option>Super Admin</option>
            </select>
          </div>
          <div className="col-12">
            <label className="form-label">Description</label>
            <input
              className="form-control"
              placeholder="Brief description of this template"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
            />
          </div>
          <div className="col-12">
            <label className="form-label">Template Content</label>
            <textarea
              className="form-control template-editor"
              rows={6}
              placeholder="Dear {{user_name}},&#10;&#10;[Your template content here]&#10;&#10;Regards,&#10;{{signatory_name}}"
              value={form.body}
              onChange={(e) =>
                setForm((p) => ({ ...p, body: e.target.value }))
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
            const variables = (
              form.body.match(/\{\{(\w+)\}\}/g) || []
            ).map((v) => v.replace(/[{}]/g, ""));
            onAdd({
              id: `tpl-${Date.now()}`,
              name: form.name,
              category: form.category,
              format: form.format,
              lastModified: new Date().toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              }),
              usedCount30d: "0",
              owner: form.owner || "Super Admin",
              locked: false,
              status: "Draft",
              version: "v1.0",
              description: form.description || "New template",
              body: form.body || "Template body",
              variables,
              approvalRoute: form.approvalRoute,
              channels: form.format,
              createdAt: new Date().toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              }),
              generationsTotal: 0,
              successRate: "—",
              avgGenTime: "—",
            });
            toast({ kind: "success", title: "Template created" });
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
   2. Edit Template Modal
   ================================================================ */
export function EditTemplateModal({
  record,
  open,
  onClose,
  onSave,
}: {
  record: TemplateRecord | null;
  open: boolean;
  onClose: () => void;
  onSave: (t: TemplateRecord) => void;
}) {
  const toast = useToast();
  if (!record) return null;
  const [form, setForm] = useState({ ...record });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Edit: ${record.name}`}
      subtitle="Super Admin — Modify template content and configuration"
      icon="bi-pencil-square"
      tone="blue"
      size="lg"
    >
      <div className="pm-modal-body">
        <div className="pm-note mb-3">
          <i className="bi bi-info-circle me-1" />
          All changes are audit-logged. Template edits create a new version.
        </div>
        <div className="row g-3">
          <div className="col-md-7">
            <label className="form-label">Template Name</label>
            <input
              className="form-control"
              value={form.name}
              onChange={(e) =>
                setForm((p) => ({ ...p, name: e.target.value }))
              }
            />
          </div>
          <div className="col-md-5">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={form.category}
              onChange={(e) =>
                setForm((p) => ({ ...p, category: e.target.value }))
              }
            >
              <option>User Communication</option>
              <option>Lending</option>
              <option>Partnerships</option>
              <option>Legal</option>
              <option>HR</option>
              <option>Governance</option>
              <option>Compliance</option>
              <option>Privacy</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Output Format</label>
            <select
              className="form-select"
              value={form.format}
              onChange={(e) =>
                setForm((p) => ({ ...p, format: e.target.value }))
              }
            >
              <option>PDF</option>
              <option>PDF + Email</option>
              <option>Word + PDF</option>
              <option>Email HTML</option>
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
                  status: e.target.value as TemplateRecord["status"],
                }))
              }
            >
              <option>Active</option>
              <option>Draft</option>
              <option>Under Review</option>
              <option>Deprecated</option>
              <option>Archived</option>
            </select>
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
            <label className="form-label">Approval Route</label>
            <select
              className="form-select"
              value={form.approvalRoute}
              onChange={(e) =>
                setForm((p) => ({ ...p, approvalRoute: e.target.value }))
              }
            >
              <option>Manager + Legal</option>
              <option>Legal + Super Admin</option>
              <option>Manager only</option>
              <option>Super Admin</option>
            </select>
          </div>
          <div className="col-12">
            <label className="form-label">Description</label>
            <input
              className="form-control"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
            />
          </div>
          <div className="col-12">
            <label className="form-label">Template Content</label>
            <textarea
              className="form-control template-editor"
              rows={8}
              value={form.body}
              onChange={(e) =>
                setForm((p) => ({ ...p, body: e.target.value }))
              }
            />
          </div>
        </div>
        <div className="pm-card pm-card-pad mt-3">
          <div className="pm-eyebrow mb-2">Template Stats</div>
          <div className="row g-2">
            <div className="col-3">
              <div className="pm-kv">
                <span className="k">Version</span>
                <span className="v">{form.version}</span>
              </div>
            </div>
            <div className="col-3">
              <div className="pm-kv">
                <span className="k">Generations</span>
                <span className="v">{form.generationsTotal}</span>
              </div>
            </div>
            <div className="col-3">
              <div className="pm-kv">
                <span className="k">Success Rate</span>
                <span className="v">{form.successRate}</span>
              </div>
            </div>
            <div className="col-3">
              <div className="pm-kv">
                <span className="k">Avg Time</span>
                <span className="v">{form.avgGenTime}</span>
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
            toast({ kind: "success", title: "Template updated" });
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
   3. Delete Template Wizard (4-step)
   ================================================================ */
export function DeleteTemplateWizard({
  record,
  open,
  onClose,
  onDelete,
}: {
  record: TemplateRecord | null;
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
    { label: "Dependencies", icon: "bi-link-45deg" },
    { label: "Confirmation", icon: "bi-shield-lock" },
    { label: "Summary", icon: "bi-check-lg" },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Template"
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
                All versions, generation history, and variable mappings for
                this template will be permanently removed.
              </div>
            </div>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-eyebrow mb-1">Template to Delete</div>
              <div className="pm-td-strong">{record.name}</div>
              <div className="pm-td-sub">
                {record.category} · {record.version} · {record.format} ·{" "}
                {record.owner}
              </div>
            </div>
            <div className="pm-card pm-card-pad">
              <div className="pm-eyebrow mb-2">Affected Data</div>
              <div className="pm-kv">
                <span className="k">Total Generations</span>
                <span className="v">{record.generationsTotal}</span>
              </div>
              <div className="pm-kv">
                <span className="k">Variables Used</span>
                <span className="v">{record.variables.length} variables</span>
              </div>
              <div className="pm-kv">
                <span className="k">Active Users</span>
                <span className="v">3 departments</span>
              </div>
              <div className="pm-kv">
                <span className="k">Approved Workflows</span>
                <span className="v">2 workflows</span>
              </div>
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="d-flex flex-column gap-2">
            <div className="pm-eyebrow mb-1">Linked Dependencies</div>
            <div className="pm-card pm-card-pad mb-2">
              <div className="pm-td-strong">Automated Workflows</div>
              <div className="pm-td-sub">
                2 workflows generate documents from this template
              </div>
            </div>
            <div className="pm-card pm-card-pad mb-2">
              <div className="pm-td-strong">Email Campaigns</div>
              <div className="pm-td-sub">
                1 scheduled campaign references this template
              </div>
            </div>
            <div className="pm-card pm-card-pad mb-2">
              <div className="pm-td-strong">Generation History</div>
              <div className="pm-td-sub">
                {record.generationsTotal} historical documents will be
                archived
              </div>
            </div>
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
              <input type="checkbox" className="form-check-input" />I
              understand dependent workflows will break
            </label>
            <label
              className="d-flex align-items-center gap-2"
              style={{ fontSize: ".82rem" }}
            >
              <input type="checkbox" className="form-check-input" />I
              have notified affected department owners
            </label>
          </div>
        )}
        {step === 3 && (
          <div className="pm-card pm-card-pad">
            <div className="pm-eyebrow mb-2">Final Deletion Summary</div>
            <div className="pm-kv">
              <span className="k">Template</span>
              <span className="v">{record.name}</span>
            </div>
            <div className="pm-kv">
              <span className="k">Version</span>
              <span className="v">{record.version}</span>
            </div>
            <div className="pm-kv">
              <span className="k">Backup Created</span>
              <span className="v">{backup ? "Yes" : "No"}</span>
            </div>
            <div className="pm-kv">
              <span className="k">Workflows Affected</span>
              <span className="v">2 workflows</span>
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
              toast({ kind: "success", title: "Template deleted" });
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
   4. Lock/Unlock Template Modal
   ================================================================ */
export function LockUnlockTemplateModal({
  record,
  open,
  onClose,
  onToggle,
}: {
  record: TemplateRecord | null;
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
      title={isLocked ? "Unlock Template" : "Lock Template"}
      subtitle="Super Admin — Template access control"
      icon={isLocked ? "bi-unlock-fill" : "bi-lock-fill"}
      tone={isLocked ? "green" : "amber"}
      size="md"
    >
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-eyebrow mb-1">Template</div>
          <div className="pm-td-strong">{record.name}</div>
          <div className="pm-td-sub">
            {record.category} · {record.version} · {record.format}
          </div>
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
              <span className="v">
                {record.lockReason || "No reason provided"}
              </span>
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <label className="form-label">Reason for Locking</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="e.g. Pending legal review, compliance update in progress..."
            />
          </div>
        )}
        <div className="pm-note">
          <i className={`bi ${isLocked ? "bi-unlock" : "bi-lock"} me-1`} />
          {isLocked
            ? "Unlocking will allow editing and generation of this template."
            : "Locking prevents all editing and generation. Only the locking admin can unlock."}
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
              title: isLocked ? "Template unlocked" : "Template locked",
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
   5. Document Preview / Viewer Modal
   ================================================================ */
export function DocumentPreviewModal({
  record,
  open,
  onClose,
}: {
  record: TemplateRecord | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!record) return null;

  const sampleData: Record<string, string> = {
    company_name: "PayMo Digital Bank Ltd",
    company_address: "Westlands, Nairobi",
    user_name: "Joseph Kamau Mwangi",
    user_account: "PAY-12345-6789",
    user_phone: "+254 712 345 678",
    balance: "KES 45,230",
    amount: "KES 15,000",
    fee: "KES 225",
    date: "August 22, 2026",
    reference_number: "REF-2026-0822-001",
    signatory_name: "Jeckonia Kwasa, CEO",
    candidate_name: "James Mwangi",
    job_title: "Senior Engineer",
    salary: "KES 350,000",
    partner_name: "Safaricom PLC",
    party_name: "Onfido Ltd",
  };

  const rendered = record.body.replace(
    /\{\{(\w+)\}\}/g,
    (_, key) =>
      `<span class="doc-var">${sampleData[key] || `{{${key}}}`}</span>`
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${record.name} — Preview`}
      subtitle={`${record.version} · ${record.format} · Sample data`}
      icon="bi-eye"
      tone="blue"
      size="lg"
    >
      <div className="pm-modal-body">
        <div className="doc-preview-toolbar">
          <div className="d-flex gap-2 align-items-center">
            <Badge tone={record.status === "Active" ? "green" : record.status === "Draft" ? "blue" : "amber"}>
              {record.status}
            </Badge>
            <span className="pm-td-sub">{record.version}</span>
            <span className="pm-td-sub">·</span>
            <span className="pm-td-sub">{record.format}</span>
          </div>
          <div className="d-flex gap-1">
            <button className="btn btn-sm btn-outline-secondary">
              <i className="bi bi-printer me-1" />
              Print
            </button>
            <button className="btn btn-sm btn-outline-primary">
              <i className="bi bi-download me-1" />
              Download PDF
            </button>
          </div>
        </div>
        <div className="doc-preview-page">
          <div className="doc-preview-letterhead">
            <div className="doc-preview-logo">P</div>
            <div>
              <div className="doc-preview-company">
                PayMo Digital Bank Ltd
              </div>
              <div className="doc-preview-address">
                Westlands, Nairobi · PVT-2024-184732
              </div>
            </div>
          </div>
          <div className="doc-preview-meta">
            <div>
              <b>Date:</b> August 22, 2026
            </div>
            <div>
              <b>Ref:</b> REF-2026-0822-001
            </div>
          </div>
          <hr className="doc-preview-divider" />
          <div
            className="doc-preview-body"
            dangerouslySetInnerHTML={{
              __html: rendered
                .replace(/\n/g, "<br/>")
                .replace(
                  /^(Dear .+?),$/gm,
                  '<p class="doc-preview-greeting">$1,</p>'
                ),
            }}
          />
          <div className="doc-preview-signature">
            <div className="doc-preview-sig-line" />
            <div>
              <b>Jeckonia Kwasa</b>
            </div>
            <div className="pm-td-sub">CEO · PayMo Digital Bank Ltd</div>
          </div>
        </div>
        <div className="pm-note mt-3">
          <i className="bi bi-info-circle me-1" />
          Variables highlighted in{" "}
          <span className="doc-var">green</span> are substituted with sample
          data. Production generation uses real user data.
        </div>
      </div>
      <div className="pm-modal-foot">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={onClose}
        >
          Close
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={() =>
            window.print()
          }
        >
          <i className="bi bi-printer me-1" />
          Print
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   6. Document Viewer Drawer
   ================================================================ */
export function DocumentViewerDrawer({
  documents,
  open,
  onClose,
  onDelete,
  onLock,
}: {
  documents: DocumentRecord[];
  open: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onLock: (id: string) => void;
}) {
  const [filter, setFilter] = useState("all");
  const filtered =
    filter === "all"
      ? documents
      : documents.filter((d) => d.status === filter);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Generated Documents"
      subtitle="All documents generated from templates"
      icon="bi-file-earmark-text"
      tone="blue"
      wide
    >
      <div className="d-flex gap-2 flex-wrap mb-3">
        {["all", "Sent", "Generated", "Pending", "Failed"].map((f) => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>
      <div className="pm-td-sub mb-2">
        {filtered.length} document{filtered.length !== 1 ? "s" : ""}
      </div>
      {filtered.map((doc) => (
        <div key={doc.id} className="pm-alert-row mb-2">
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              display: "grid",
              placeItems: "center",
              background:
                doc.status === "Failed"
                  ? "var(--pm-danger-soft)"
                  : doc.status === "Pending"
                    ? "var(--pm-warn-soft)"
                    : "var(--pm-blue-soft)",
              color:
                doc.status === "Failed"
                  ? "var(--pm-danger)"
                  : doc.status === "Pending"
                    ? "#b54708"
                    : "#175cd3",
              flex: "none",
            }}
          >
            <i className="bi bi-file-earmark-text" />
          </div>
          <div className="flex-grow-1">
            <div className="pm-td-strong">
              {doc.templateName}
              {doc.locked && (
                <i
                  className="bi bi-lock-fill ms-1"
                  style={{
                    fontSize: ".6rem",
                    color: "var(--pm-amber)",
                  }}
                />
              )}
            </div>
            <div className="pm-td-sub">
              {doc.generatedFor} · {doc.format} · {doc.size}
            </div>
            <div className="pm-td-sub">{doc.date}</div>
          </div>
          <div className="d-flex flex-column align-items-end gap-1">
            <Badge
              tone={
                doc.status === "Sent"
                  ? "green"
                  : doc.status === "Failed"
                    ? "red"
                    : doc.status === "Pending"
                      ? "amber"
                      : "blue"
              }
            >
              {doc.status}
            </Badge>
            <div className="d-flex gap-1">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => onLock(doc.id)}
                title={doc.locked ? "Unlock" : "Lock"}
              >
                <i
                  className={`bi ${doc.locked ? "bi-unlock" : "bi-lock"}`}
                />
              </button>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => onDelete(doc.id)}
                title="Delete"
              >
                <i className="bi bi-trash3" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </Drawer>
  );
}

/* ================================================================
   7. Add Variable Modal
   ================================================================ */
export function AddVariableModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (v: VariableRecord) => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState({
    variable: "",
    type: "System",
    scope: "All",
    exampleValue: "",
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Template Variable"
      subtitle="Super Admin — Register a new template variable"
      icon="bi-plus-circle-fill"
      tone="green"
      size="md"
    >
      <div className="pm-modal-body">
        <div className="pm-note mb-3">
          <i className="bi bi-shield-lock me-1" />
          Only Super Admins can create variables. All actions are
          audit-logged.
        </div>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Variable Name</label>
            <input
              className="form-control mono"
              placeholder="e.g. {{partner_email}}"
              value={form.variable}
              onChange={(e) =>
                setForm((p) => ({ ...p, variable: e.target.value }))
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
              <option>System</option>
              <option>User</option>
              <option>Financial</option>
              <option>Custom</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Scope</label>
            <select
              className="form-select"
              value={form.scope}
              onChange={(e) =>
                setForm((p) => ({ ...p, scope: e.target.value }))
              }
            >
              <option>All</option>
              <option>User templates</option>
              <option>Financial templates</option>
              <option>Lending templates</option>
              <option>Legal templates</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Example Value</label>
            <input
              className="form-control"
              placeholder="e.g. example@email.com"
              value={form.exampleValue}
              onChange={(e) =>
                setForm((p) => ({ ...p, exampleValue: e.target.value }))
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
            if (!form.variable) return;
            onAdd({
              id: `var-${Date.now()}`,
              variable: form.variable,
              type: form.type,
              scope: form.scope,
              exampleValue: form.exampleValue || "—",
              status: "Active",
              locked: false,
              createdAt: new Date().toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              }),
            });
            toast({ kind: "success", title: "Variable created" });
            onClose();
          }}
        >
          <i className="bi bi-check2 me-1" />
          Create Variable
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   8. Edit Variable Modal
   ================================================================ */
export function EditVariableModal({
  record,
  open,
  onClose,
  onSave,
}: {
  record: VariableRecord | null;
  open: boolean;
  onClose: () => void;
  onSave: (v: VariableRecord) => void;
}) {
  const toast = useToast();
  if (!record) return null;
  const [form, setForm] = useState({ ...record });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Edit: ${record.variable}`}
      subtitle="Super Admin — Modify variable configuration"
      icon="bi-pencil-square"
      tone="blue"
      size="md"
    >
      <div className="pm-modal-body">
        <div className="pm-note mb-3">
          <i className="bi bi-info-circle me-1" />
          All changes are audit-logged. Variable changes may affect
          templates.
        </div>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Variable Name</label>
            <input
              className="form-control mono"
              value={form.variable}
              onChange={(e) =>
                setForm((p) => ({ ...p, variable: e.target.value }))
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
              <option>System</option>
              <option>User</option>
              <option>Financial</option>
              <option>Custom</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Scope</label>
            <select
              className="form-select"
              value={form.scope}
              onChange={(e) =>
                setForm((p) => ({ ...p, scope: e.target.value }))
              }
            >
              <option>All</option>
              <option>User templates</option>
              <option>Financial templates</option>
              <option>Lending templates</option>
              <option>Legal templates</option>
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
                  status: e.target.value as VariableRecord["status"],
                }))
              }
            >
              <option>Active</option>
              <option>Deprecated</option>
              <option>Pending</option>
            </select>
          </div>
          <div className="col-12">
            <label className="form-label">Example Value</label>
            <input
              className="form-control"
              value={form.exampleValue}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  exampleValue: e.target.value,
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
            toast({ kind: "success", title: "Variable updated" });
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
   9. Delete Variable Wizard (3-step)
   ================================================================ */
export function DeleteVariableWizard({
  record,
  open,
  onClose,
  onDelete,
}: {
  record: VariableRecord | null;
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
      title="Delete Variable"
      subtitle={`Step ${step + 1} of 3: ${steps[step].label}`}
      icon="bi-trash3-fill"
      tone="red"
      size="md"
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
              <div className="pm-eyebrow mb-1">Variable to Delete</div>
              <div className="pm-td-strong mono">{record.variable}</div>
              <div className="pm-td-sub">
                {record.type} · {record.scope}
              </div>
            </div>
            <div className="pm-card pm-card-pad">
              <div className="pm-eyebrow mb-2">Affected Templates</div>
              <div className="pm-kv">
                <span className="k">Templates Using This</span>
                <span className="v">4 templates</span>
              </div>
              <div className="pm-kv">
                <span className="k">Pending Generations</span>
                <span className="v">0 queued</span>
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
              understand templates using this variable will show raw
              placeholder
            </label>
          </div>
        )}
        {step === 2 && (
          <div className="pm-card pm-card-pad">
            <div className="pm-eyebrow mb-2">Deletion Summary</div>
            <div className="pm-kv">
              <span className="k">Variable</span>
              <span className="v">{record.variable}</span>
            </div>
            <div className="pm-kv">
              <span className="k">Templates Affected</span>
              <span className="v">4</span>
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
              toast({ kind: "success", title: "Variable deleted" });
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
   10. Lock/Unlock Variable Modal
   ================================================================ */
export function LockUnlockVariableModal({
  record,
  open,
  onClose,
  onToggle,
}: {
  record: VariableRecord | null;
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
      title={isLocked ? "Unlock Variable" : "Lock Variable"}
      subtitle="Super Admin — Variable access control"
      icon={isLocked ? "bi-unlock-fill" : "bi-lock-fill"}
      tone={isLocked ? "green" : "amber"}
      size="md"
    >
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-eyebrow mb-1">Variable</div>
          <div className="pm-td-strong mono">{record.variable}</div>
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
              <span className="v">
                {record.lockReason || "No reason provided"}
              </span>
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <label className="form-label">Reason for Locking</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="e.g. Variable value being updated..."
            />
          </div>
        )}
        <div className="pm-note">
          <i className={`bi ${isLocked ? "bi-unlock" : "bi-lock"} me-1`} />
          {isLocked
            ? "Unlocking will allow templates to use this variable."
            : "Locking prevents templates from using this variable."}
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
                ? "Variable unlocked"
                : "Variable locked",
            });
            onClose();
          }}
        >
          <i className={`bi ${isLocked ? "bi-unlock" : "bi-lock"} me-1`} />
          {isLocked ? "Unlock Variable" : "Lock Variable"}
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   11. Bulk Generate Wizard (4-step)
   ================================================================ */
export function BulkGenerateWizard({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [outputFormat, setOutputFormat] = useState("PDF");
  const [batchSize, setBatchSize] = useState("100");
  const toast = useToast();
  const steps = [
    { label: "Template", icon: "bi-file-text" },
    { label: "Recipients", icon: "bi-people" },
    { label: "Configure", icon: "bi-gear" },
    { label: "Review", icon: "bi-check-lg" },
  ];

  return (
    <Modal
      open={open}
      onClose={() => {
        setStep(0);
        onClose();
      }}
      title="Bulk Generate Documents"
      subtitle={`Step ${step + 1} of 4: ${steps[step].label}`}
      icon="bi-files"
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
            <div className="pm-eyebrow mb-1">Select template</div>
            {[
              "User warning letter",
              "Account closure notice",
              "Loan default notice",
              "Refund confirmation",
              "Fee change notification",
            ].map((t) => (
              <button
                key={t}
                className={`pm-opt ${selectedTemplate === t ? "active" : ""}`}
                onClick={() => setSelectedTemplate(t)}
              >
                <div className="r" />
                <span className="pm-td-strong">{t}</span>
              </button>
            ))}
          </div>
        )}
        {step === 1 && (
          <div className="d-flex flex-column gap-2">
            <div className="pm-eyebrow mb-1">Select recipients</div>
            <label className="form-label">Source</label>
            <select className="form-select mb-3">
              <option>Upload CSV of user IDs</option>
              <option>Select from user segment</option>
              <option>Active users with default loans</option>
              <option>All users in specific tier</option>
            </select>
            <label className="form-label">Filter by segment</label>
            <div className="row g-2">
              {["All users", "Tier 1", "Tier 2", "Tier 3", "VIP", "Defaulted"].map(
                (s) => (
                  <div key={s} className="col-4">
                    <button className="pm-opt w-100">
                      <div className="r" />
                      <span style={{ fontSize: ".78rem" }}>{s}</span>
                    </button>
                  </div>
                )
              )}
            </div>
            <div className="pm-note mt-2">
              <i className="bi bi-info-circle me-1" />
              Estimated recipients: 1,234 users
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="d-flex flex-column gap-2">
            <div className="pm-eyebrow mb-1">Generation settings</div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Output Format</label>
                <select
                  className="form-select"
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                >
                  <option>PDF</option>
                  <option>PDF + Email</option>
                  <option>Email HTML</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Batch Size</label>
                <div className="input-group">
                  <input
                    className="form-control"
                    value={batchSize}
                    onChange={(e) => setBatchSize(e.target.value)}
                  />
                  <span className="input-group-text">per batch</span>
                </div>
              </div>
              <div className="col-12">
                <label className="form-label">Custom Variables (JSON)</label>
                <textarea
                  className="form-control mono"
                  rows={3}
                  defaultValue='{"date": "August 22, 2026", "reason": "Unusual transaction pattern"}'
                />
              </div>
            </div>
            <label className="form-label mt-2">Options</label>
            {[
              "Send email after generation",
              "Log each generation in audit trail",
              "Notify admin when batch completes",
              "Retry failed generations",
            ].map((o) => (
              <label
                key={o}
                className="d-flex align-items-center gap-2 mb-2"
                style={{ fontSize: ".82rem" }}
              >
                <input
                  type="checkbox"
                  className="form-check-input"
                  defaultChecked
                />
                {o}
              </label>
            ))}
          </div>
        )}
        {step === 3 && (
          <div className="pm-card pm-card-pad">
            <div className="pm-eyebrow mb-2">Bulk Generation Summary</div>
            <div className="pm-kv">
              <span className="k">Template</span>
              <span className="v">{selectedTemplate || "User warning letter"}</span>
            </div>
            <div className="pm-kv">
              <span className="k">Recipients</span>
              <span className="v">1,234 users</span>
            </div>
            <div className="pm-kv">
              <span className="k">Output Format</span>
              <span className="v">{outputFormat}</span>
            </div>
            <div className="pm-kv">
              <span className="k">Batch Size</span>
              <span className="v">{batchSize} per batch</span>
            </div>
            <div className="pm-kv">
              <span className="k">Est. Total Batches</span>
              <span className="v">
                {Math.ceil(1234 / (Number(batchSize) || 100))} batches
              </span>
            </div>
            <div className="pm-note mt-3">
              <i className="bi bi-shield-lock me-1" />
              All generations will be logged in the audit trail. You will be
              notified when the batch completes.
            </div>
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() =>
            step ? setStep((s) => s - 1) : onClose()
          }
        >
          {step ? "Back" : "Cancel"}
        </button>
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
              setStep(0);
              toast({
                kind: "success",
                title: "Bulk generation started",
                body: `Generating ${batchSize} documents per batch`,
              });
              onClose();
            }}
          >
            <i className="bi bi-play-circle me-1" />
            Start Generation
          </button>
        )}
      </div>
    </Modal>
  );
}

/* ================================================================
   12. Compliance Audit Trail Drawer
   ================================================================ */
export function ComplianceAuditTrailDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const logs = [
    { ts: "Aug 22, 14:32", admin: "Super Admin", action: "GENERATE", record: "User warning letter", detail: "Generated for PAY-55667", ip: "192.168.1.106" },
    { ts: "Aug 22, 11:15", admin: "Super Admin", action: "GENERATE", record: "User warning letter", detail: "Generated for PAY-33445", ip: "192.168.1.106" },
    { ts: "Aug 21, 16:48", admin: "Legal", action: "APPROVE", record: "Fee change notification", detail: "Approved v4.2 for publication", ip: "192.168.1.50" },
    { ts: "Aug 20, 09:20", admin: "Super Admin", action: "LOCK", record: "Fee change notification", detail: "Locked pending legal review", ip: "192.168.1.106" },
    { ts: "Aug 18, 14:55", admin: "Super Admin", action: "CREATE", record: "Refund confirmation", detail: "Created new template v2.5", ip: "192.168.1.106" },
    { ts: "Aug 15, 15:12", admin: "Super Admin", action: "LOCK", record: "Data breach notification", detail: "Emergency lock — legal review", ip: "192.168.1.106" },
    { ts: "Aug 12, 10:30", admin: "Compliance", action: "VIEW", record: "User warning letter", detail: "Viewed template and generation history", ip: "192.168.1.78" },
    { ts: "Aug 10, 09:15", admin: "Super Admin", action: "DELETE", record: "Test template", detail: "Removed draft test template", ip: "192.168.1.106" },
  ];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Template Audit Trail"
      subtitle="Immutable record of all template operations"
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
              <th>Template</th>
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
   13. Admin Permissions Drawer
   ================================================================ */
export function AdminPermissionsDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const admins = [
    { name: "Jeckonia Kwasa", role: "Super Admin", perms: ["All Operations", "Create", "Edit", "Delete", "Lock/Unlock", "Publish", "Bulk Generate"] },
    { name: "Dan Delion", role: "Super Admin", perms: ["All Operations", "Create", "Edit", "Lock/Unlock", "Publish"] },
    { name: "James Ochieng", role: "Platform Admin", perms: ["View All", "Edit (non-locked)", "Generate", "Create Drafts"] },
    { name: "Mary Wanjiku", role: "Legal Reviewer", perms: ["View All", "Review", "Approve/Reject", "Comment"] },
    { name: "Amina Osman", role: "Compliance", perms: ["View All", "Generate", "Export Audit Trail"] },
  ];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Admin Permissions"
      subtitle="Access control for document template administrators"
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
   14. Emergency Data Actions Modal
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
      title="Emergency Template Actions"
      subtitle="Super Admin — Critical template controls"
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
          { action: "Deprecate All Templates", desc: "Immediately deprecate all active templates", icon: "bi-archive" },
          { action: "Pause All Generation", desc: "Halt all automated document generation", icon: "bi-pause-circle" },
          { action: "Revoke Bulk Permissions", desc: "Remove bulk generation access for all admins", icon: "bi-shield-x" },
          { action: "Emergency Template Backup", desc: "Trigger encrypted backup of all templates", icon: "bi-database-down" },
          { action: "Notify Template Owners", desc: "Send emergency notification to all template owners", icon: "bi-megaphone-fill" },
          { action: "Engage External Auditor", desc: "Trigger emergency template audit engagement", icon: "bi-person-badge" },
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
   15. Data Export/Import Modal
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
      title="Export / Import Templates"
      subtitle="Bulk template data operations"
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
            Export Templates
          </button>
          <button
            className={`btn btn-sm ${mode === "import" ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => setMode("import")}
          >
            Import Templates
          </button>
        </div>
        {mode === "export" ? (
          <div className="d-flex flex-column gap-2">
            <div className="pm-eyebrow mb-1">Select data to export</div>
            {[
              "All Template Content",
              "Variable Catalog",
              "Generation History (30d)",
              "Approval Workflow Config",
              "Access Policy Settings",
              "Audit Trail (90d)",
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
              {["ZIP archive", "JSON", "Individual PDFs", "Excel report"].map(
                (f) => (
                  <button
                    key={f}
                    className="btn btn-sm btn-outline-secondary"
                  >
                    {f}
                  </button>
                )
              )}
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
                ZIP, JSON — Max 50MB
              </div>
            </div>
            <div className="pm-note">
              <i className="bi bi-info-circle me-1" />
              Imported templates will be validated and versioned. A backup
              will be created automatically.
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ================================================================
   16. Delete Document Wizard (3-step)
   ================================================================ */
export function DeleteDocumentWizard({
  record,
  open,
  onClose,
  onDelete,
}: {
  record: DocumentRecord | null;
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
      title="Delete Generated Document"
      subtitle={`Step ${step + 1} of 3: ${steps[step].label}`}
      icon="bi-trash3-fill"
      tone="red"
      size="md"
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
              <div className="pm-eyebrow mb-1">Document to Delete</div>
              <div className="pm-td-strong">{record.templateName}</div>
              <div className="pm-td-sub">
                Generated for: {record.generatedFor} · {record.date} ·{" "}
                {record.format} · {record.size}
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
              understand this document cannot be recovered
            </label>
          </div>
        )}
        {step === 2 && (
          <div className="pm-card pm-card-pad">
            <div className="pm-eyebrow mb-2">Deletion Summary</div>
            <div className="pm-kv">
              <span className="k">Document</span>
              <span className="v">{record.templateName}</span>
            </div>
            <div className="pm-kv">
              <span className="k">Recipient</span>
              <span className="v">{record.generatedFor}</span>
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
              toast({ kind: "success", title: "Document deleted" });
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
   17. Lock/Unlock Document Modal
   ================================================================ */
export function LockUnlockDocumentModal({
  record,
  open,
  onClose,
  onToggle,
}: {
  record: DocumentRecord | null;
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
      title={isLocked ? "Unlock Document" : "Lock Document"}
      subtitle="Super Admin — Document access control"
      icon={isLocked ? "bi-unlock-fill" : "bi-lock-fill"}
      tone={isLocked ? "green" : "amber"}
      size="md"
    >
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-eyebrow mb-1">Document</div>
          <div className="pm-td-strong">{record.templateName}</div>
          <div className="pm-td-sub">
            {record.generatedFor} · {record.date}
          </div>
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
              <span className="v">
                {record.lockReason || "No reason provided"}
              </span>
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <label className="form-label">Reason for Locking</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="e.g. Under legal review, dispute pending..."
            />
          </div>
        )}
        <div className="pm-note">
          <i className={`bi ${isLocked ? "bi-unlock" : "bi-lock"} me-1`} />
          {isLocked
            ? "Unlocking will allow document access and download."
            : "Locking prevents all access to this document."}
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
                ? "Document unlocked"
                : "Document locked",
            });
            onClose();
          }}
        >
          <i className={`bi ${isLocked ? "bi-unlock" : "bi-lock"} me-1`} />
          {isLocked ? "Unlock Document" : "Lock Document"}
        </button>
      </div>
    </Modal>
  );
}
