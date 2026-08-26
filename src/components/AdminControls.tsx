import { useState } from "react";
import { Modal, Badge, Steps, useToast } from "./ui";

/* ================================================================
   Reusable 3-button admin controls for any table row
   ================================================================ */
export function AdminRowActions({
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
      <button className="btn btn-sm btn-outline-primary" onClick={(e) => { e.stopPropagation(); onEdit(); }} title="Edit">
        <i className="bi bi-pencil-square" />
      </button>
      <button className="btn btn-sm btn-outline-secondary" onClick={(e) => { e.stopPropagation(); onLock(); }} title={locked ? "Unlock" : "Lock"}>
        <i className={`bi ${locked ? "bi-unlock" : "bi-lock"}`} />
      </button>
      <button className="btn btn-sm btn-outline-danger" onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Delete">
        <i className="bi bi-trash3" />
      </button>
    </div>
  );
}

/* ================================================================
   Generic Add Record Modal
   ================================================================ */
export function AddRecordModal({
  open,
  onClose,
  onAdd,
  title,
  fields,
  typeName,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (data: Record<string, string>) => void;
  title: string;
  fields: { key: string; label: string; placeholder: string; type?: string; options?: string[] }[];
  typeName: string;
}) {
  const toast = useToast();
  const [form, setForm] = useState<Record<string, string>>({});

  return (
    <Modal open={open} onClose={onClose} title={`Add New ${typeName}`} subtitle="Super Admin — Create a new record" icon="bi-plus-circle-fill" tone="green" size="lg">
      <div className="pm-modal-body">
        <div className="pm-note mb-3"><i className="bi bi-shield-lock me-1" />Only Super Admins can create records. All actions are audit-logged.</div>
        <div className="row g-3">
          {fields.map(f => (
            <div key={f.key} className={f.key === "notes" || f.key === "description" ? "col-12" : "col-md-6"}>
              <label className="form-label">{f.label}</label>
              {f.options ? (
                <select className="form-select" value={form[f.key] || ""} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}>
                  <option value="">Select...</option>
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : f.type === "textarea" ? (
                <textarea className="form-control" rows={3} placeholder={f.placeholder} value={form[f.key] || ""} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              ) : (
                <input className="form-control" type={f.type || "text"} placeholder={f.placeholder} value={form[f.key] || ""} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              )}
            </div>
          ))}
        </div>
        <label className="form-label mt-2">Admin Notes</label>
        <textarea className="form-control" rows={2} placeholder="Optional notes..." value={form.notes || ""} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => { onAdd(form); toast({ kind: "success", title: "Record created" }); onClose(); setForm({}); }}>
          <i className="bi bi-check2 me-1" />Create Record
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   Generic Edit Record Modal
   ================================================================ */
export function EditRecordModal({
  record,
  open,
  onClose,
  onSave,
  typeName,
  excludeKeys,
}: {
  record: Record<string, any> | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: Record<string, any>) => void;
  typeName: string;
  excludeKeys?: string[];
}) {
  const toast = useToast();
  if (!record) return null;
  const [form, setForm] = useState({ ...record });

  return (
    <Modal open={open} onClose={onClose} title={`Edit: ${record.name || record.policy || record.document || record.title || record.activity || typeName}`} subtitle="Super Admin — Modify record data" icon="bi-pencil-square" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="pm-note mb-3"><i className="bi bi-info-circle me-1" />All changes are audit-logged. Only Super Admins can edit records.</div>
        <div className="row g-3">
          {Object.entries(record)
            .filter(([k]) => !(excludeKeys || ["id", "locked", "lockedBy", "lockedAt", "lockReason"]).includes(k))
            .map(([key, val]) => (
              <div key={key} className={key === "notes" || key === "description" || key === "body" ? "col-12" : "col-md-6"}>
                <label className="form-label">{key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}</label>
                <input className="form-control" value={String(val ?? "")} onChange={e => setForm((prev: any) => ({ ...prev, [key]: e.target.value }))} />
              </div>
            ))}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => { onSave(form); toast({ kind: "success", title: "Record updated" }); onClose(); }}>
          <i className="bi bi-check2 me-1" />Save Changes
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   Generic Delete Wizard (4-step)
   ================================================================ */
export function DeleteRecordWizard({
  record,
  open,
  onClose,
  onDelete,
  typeName,
  relatedItems,
}: {
  record: Record<string, any> | null;
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  typeName: string;
  relatedItems?: string[];
}) {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [confirm, setConfirm] = useState("");
  if (!record) return null;
  const name = record.name || record.policy || record.document || record.title || record.activity || typeName;

  const steps = [
    { label: "Impact Review", icon: "bi-exclamation-triangle" },
    { label: "Dependencies", icon: "bi-link-45deg" },
    { label: "Confirmation", icon: "bi-shield-lock" },
    { label: "Summary", icon: "bi-check-lg" },
  ];

  return (
    <Modal open={open} onClose={() => { onClose(); setStep(0); setConfirm(""); }} title={`Delete ${typeName}`} subtitle={`Step ${step + 1} of 4: ${steps[step].label}`} icon="bi-trash3-fill" tone="red" size="lg">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="d-flex flex-column gap-2">
            <div className="pm-note mb-3" style={{ borderLeft: "3px solid var(--pm-danger)", background: "var(--pm-danger-soft)" }}>
              <div className="pm-td-strong" style={{ color: "var(--pm-danger)" }}><i className="bi bi-exclamation-triangle me-1" />This action is IRREVERSIBLE</div>
              <div className="mt-1">All data associated with this record will be permanently removed.</div>
            </div>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-eyebrow mb-1">Record to Delete</div>
              <div className="pm-td-strong">{name}</div>
            </div>
            <div className="pm-card pm-card-pad">
              <div className="pm-eyebrow mb-2">Affected Data</div>
              {(relatedItems || ["Related records", "Audit trail entries", "Training completions"]).map(item => (
                <div className="pm-kv" key={item}><span className="k">{item}</span><span className="v">Will be archived</span></div>
              ))}
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="d-flex flex-column gap-2">
            <div className="pm-eyebrow mb-1">Linked Dependencies</div>
            {(relatedItems || ["Related records", "Audit trail entries", "Training completions"]).map(item => (
              <div className="pm-card pm-card-pad mb-2" key={item}>
                <div className="pm-td-strong">{item}</div>
                <div className="pm-td-sub">Linked data will be archived or removed</div>
              </div>
            ))}
            <div className="pm-note"><i className="bi bi-info-circle me-1" />Backup will be retained for 90 days per data retention policy.</div>
          </div>
        )}
        {step === 2 && (
          <div className="d-flex flex-column gap-2">
            <div className="mb-3">
              <label className="form-label" style={{ color: "var(--pm-danger)" }}>Type DELETE to confirm</label>
              <input className="form-control" style={{ borderColor: "var(--pm-danger)" }} placeholder="Type DELETE" value={confirm} onChange={e => setConfirm(e.target.value)} />
            </div>
            <label className="d-flex align-items-center gap-2" style={{ fontSize: ".82rem" }}><input type="checkbox" className="form-check-input" />I understand this action cannot be undone</label>
          </div>
        )}
        {step === 3 && (
          <div className="pm-card pm-card-pad">
            <div className="pm-eyebrow mb-2">Final Deletion Summary</div>
            <div className="pm-kv"><span className="k">Record</span><span className="v">{name}</span></div>
            <div className="pm-kv"><span className="k">Backup Created</span><span className="v">Yes</span></div>
            <div className="pm-kv"><span className="k">Audit Log</span><span className="v">Will be recorded</span></div>
            <div className="pm-note mt-3"><i className="bi bi-shield-lock me-1" />Deletion will be executed immediately upon confirmation.</div>
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => step ? setStep(s => s - 1) : onClose()}> {step ? "← Back" : "Cancel"} </button>
        {step < 3 ? (
          <button className="btn btn-primary btn-sm" onClick={() => setStep(s => s + 1)}>Continue →</button>
        ) : (
          <button className="btn btn-danger btn-sm" disabled={confirm !== "DELETE"} onClick={() => { onDelete(); toast({ kind: "success", title: `${typeName} deleted` }); onClose(); setStep(0); setConfirm(""); }}>
            <i className="bi bi-trash3 me-1" />Permanently Delete
          </button>
        )}
      </div>
    </Modal>
  );
}

/* ================================================================
   Generic Lock/Unlock Modal
   ================================================================ */
export function LockUnlockModal({
  record,
  open,
  onClose,
  onToggle,
  typeName,
}: {
  record: Record<string, any> | null;
  open: boolean;
  onClose: () => void;
  onToggle: (locked: boolean) => void;
  typeName: string;
}) {
  const toast = useToast();
  if (!record) return null;
  const isLocked = record.locked;
  const name = record.name || record.policy || record.document || record.title || record.activity || typeName;

  return (
    <Modal open={open} onClose={onClose} title={isLocked ? `Unlock ${typeName}` : `Lock ${typeName}`} subtitle="Super Admin — Access control" icon={isLocked ? "bi-unlock-fill" : "bi-lock-fill"} tone={isLocked ? "green" : "amber"} size="md">
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-eyebrow mb-1">{typeName}</div>
          <div className="pm-td-strong">{name}</div>
          <Badge tone={isLocked ? "amber" : "green"} className="mt-2">{isLocked ? "🔒 LOCKED" : "🔓 UNLOCKED"}</Badge>
        </div>
        {isLocked ? (
          <div className="pm-card pm-card-pad">
            <div className="pm-eyebrow mb-2">Lock Details</div>
            <div className="pm-kv"><span className="k">Locked by</span><span className="v">{record.lockedBy || "Super Admin"}</span></div>
            <div className="pm-kv"><span className="k">Locked at</span><span className="v">{record.lockedAt || "Unknown"}</span></div>
            <div className="pm-kv"><span className="k">Reason</span><span className="v">{record.lockReason || "No reason provided"}</span></div>
          </div>
        ) : (
          <div className="mb-3">
            <label className="form-label">Reason for Locking</label>
            <textarea className="form-control" rows={3} placeholder="e.g. Under legal review, pending approval..." />
          </div>
        )}
        <div className="pm-note"><i className={`bi ${isLocked ? "bi-unlock" : "bi-lock"} me-1`} />{isLocked ? "Unlocking will allow other admins to edit this record." : "Locking prevents all other admins from editing."}</div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => { onToggle(!isLocked); toast({ kind: "success", title: isLocked ? `${typeName} unlocked` : `${typeName} locked` }); onClose(); }}>
          <i className={`bi ${isLocked ? "bi-unlock" : "bi-lock"} me-1`} />{isLocked ? `Unlock ${typeName}` : `Lock ${typeName}`}
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   Document Preview Modal (with letterhead rendering)
   ================================================================ */
export function DocumentPreviewModal({
  title,
  content,
  open,
  onClose,
  version,
  status,
}: {
  title: string;
  content: string;
  open: boolean;
  onClose: () => void;
  version?: string;
  status?: string;
}) {
  if (!open) return null;

  const rendered = content.replace(
    /\{\{(\w+)\}\}/g,
    (_, key) => `<span class="doc-var">{{${key}}}</span>`
  );

  return (
    <Modal open={open} onClose={onClose} title={`${title} — Preview`} subtitle={`${version || ""} · Document preview`} icon="bi-eye" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="doc-preview-toolbar">
          <div className="d-flex gap-2 align-items-center">
            <Badge tone={status === "Active" ? "green" : "blue"}>{status || "Active"}</Badge>
            {version && <span className="pm-td-sub">{version}</span>}
          </div>
          <div className="d-flex gap-1">
            <button className="btn btn-sm btn-outline-secondary"><i className="bi bi-printer me-1" />Print</button>
            <button className="btn btn-sm btn-outline-primary"><i className="bi bi-download me-1" />Download</button>
          </div>
        </div>
        <div className="doc-preview-page">
          <div className="doc-preview-letterhead">
            <div className="doc-preview-logo">P</div>
            <div>
              <div className="doc-preview-company">PayMo Digital Bank Ltd</div>
              <div className="doc-preview-address">Westlands, Nairobi · PVT-2024-184732</div>
            </div>
          </div>
          <hr className="doc-preview-divider" />
          <div className="doc-preview-body" dangerouslySetInnerHTML={{ __html: rendered.replace(/\n/g, "<br/>") }} />
        </div>
        <div className="pm-note mt-3"><i className="bi bi-info-circle me-1" />Variables highlighted in <span className="doc-var">green</span> are template placeholders.</div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm" onClick={onClose}><i className="bi bi-download me-1" />Download PDF</button>
      </div>
    </Modal>
  );
}
