import { useState } from "react";
import { Modal, Drawer, Badge, Steps, useToast } from "../../../components/ui";
import { kes, num } from "../../../lib/format";

/* ================================================================
   1. Add Record Modal
   ================================================================ */
export function AddRecordModal({ type, open, onClose, onAdd }: { type: string; open: boolean; onClose: () => void; onAdd: (data: any) => void }) {
  const toast = useToast();
  const [form, setForm] = useState<Record<string, string>>({});

  const fields: Record<string, { label: string; placeholder: string; type?: string }[]> = {
    founder: [
      { label: "Full Name", placeholder: "e.g. John Kamau" },
      { label: "Role / Title", placeholder: "e.g. Co-Founder & CFO" },
      { label: "Shares", placeholder: "e.g. 500000", type: "number" },
      { label: "Ownership %", placeholder: "e.g. 5", type: "number" },
      { label: "Amount Invested (KES)", placeholder: "e.g. 25000000", type: "number" },
    ],
    bank_account: [
      { label: "Bank Name", placeholder: "e.g. KCB Bank" },
      { label: "Account Number", placeholder: "e.g. 1234567890" },
      { label: "Account Name", placeholder: "e.g. Operating Account" },
      { label: "Currency", placeholder: "e.g. KES" },
      { label: "Opening Balance (KES)", placeholder: "e.g. 50000000", type: "number" },
    ],
    document: [
      { label: "Document Name", placeholder: "e.g. Board Resolution BR-2026-048" },
      { label: "Category", placeholder: "e.g. Board Resolution" },
      { label: "Classification", placeholder: "e.g. Confidential" },
    ],
    vendor: [
      { label: "Vendor Name", placeholder: "e.g. AWS Kenya" },
      { label: "Service Type", placeholder: "e.g. Cloud Infrastructure" },
      { label: "Monthly Contract (KES)", placeholder: "e.g. 5000000", type: "number" },
    ],
    board_resolution: [
      { label: "Resolution Number", placeholder: "e.g. BR-2026-048" },
      { label: "Resolution Subject", placeholder: "e.g. Approval of Q4 budget" },
      { label: "Date", placeholder: "", type: "date" },
    ],
    budget: [
      { label: "Department", placeholder: "e.g. Engineering" },
      { label: "Annual Budget (KES)", placeholder: "e.g. 180000000", type: "number" },
      { label: "Budget Owner", placeholder: "e.g. Sarah Kimani" },
    ],
  };

  const currentFields = fields[type] || fields.founder;
  const typeName = type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return (
    <Modal open={open} onClose={onClose} title={`Add New ${typeName}`} subtitle="Super Admin — Create a new record" icon="bi-plus-circle-fill" tone="green" size="md">
      <div className="pm-modal-body">
        <div className="pm-note mb-3"><i className="bi bi-shield-lock me-1" />Only Super Admins can create records. All actions are audit-logged.</div>
        {currentFields.map(f => (
          <div key={f.label} className="mb-3">
            <label className="form-label">{f.label}</label>
            <input
              className="form-control"
              type={f.type || "text"}
              placeholder={f.placeholder}
              value={form[f.label] || ""}
              onChange={e => setForm(prev => ({ ...prev, [f.label]: e.target.value }))}
            />
          </div>
        ))}
        <label className="form-label">Admin Notes</label>
        <textarea className="form-control" rows={2} placeholder="Optional notes..." value={form.notes || ""} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => { onAdd(form); toast({ kind: "success", title: "Record created" }); onClose(); }}>
          <i className="bi bi-check2 me-1" />Create Record
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   2. Edit Record Modal
   ================================================================ */
export function EditRecordModal({ record, open, onClose, onSave }: { record: any; open: boolean; onClose: () => void; onSave: (data: any) => void }) {
  const toast = useToast();
  if (!record) return null;
  const [form, setForm] = useState({ ...record });

  return (
    <Modal open={open} onClose={onClose} title={`Edit: ${record.name || record.label || record.dept || record.bank || "Record"}`} subtitle="Super Admin — Modify record data" icon="bi-pencil-square" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="pm-note mb-3"><i className="bi bi-info-circle me-1" />All changes are audit-logged. Only Super Admins can edit records.</div>
        {Object.entries(record)
          .filter(([k]) => !["permissions", "vestingSchedule", "icon", "color", "id"].includes(k))
          .map(([key, val]) => (
            <div key={key} className="mb-3">
              <label className="form-label">{key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}</label>
              <input
                className="form-control"
                value={String(val ?? "")}
                onChange={e => setForm((prev: any) => ({ ...prev, [key]: e.target.value }))}
              />
            </div>
          ))}
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
   3. Delete Confirm Modal
   ================================================================ */
export function DeleteConfirmModal({ record, open, onClose, onDelete }: { record: any; open: boolean; onClose: () => void; onDelete: () => void }) {
  const toast = useToast();
  if (!record) return null;
  const [confirm, setConfirm] = useState("");

  return (
    <Modal open={open} onClose={onClose} title="Delete Record" subtitle="Super Admin — Permanent deletion" icon="bi-trash3-fill" tone="red" size="md">
      <div className="pm-modal-body">
        <div className="pm-note mb-3" style={{ borderLeft: "3px solid var(--pm-danger)", background: "var(--pm-danger-soft)" }}>
          <div className="pm-td-strong" style={{ color: "var(--pm-danger)" }}><i className="bi bi-exclamation-triangle me-1" />This action is IRREVERSIBLE</div>
          <div className="mt-1">All data associated with this record will be permanently removed. This action will be logged in the audit trail.</div>
        </div>
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-eyebrow mb-1">Record to Delete</div>
          <div className="pm-td-strong">{record.name || record.label || record.dept || record.bank || "Unknown"}</div>
          {record.role && <div className="pm-td-sub">{record.role}</div>}
          {record.type && <div className="pm-td-sub">{record.type}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label" style={{ color: "var(--pm-danger)" }}>Type DELETE to confirm</label>
          <input className="form-control" style={{ borderColor: "var(--pm-danger)" }} placeholder="Type DELETE" value={confirm} onChange={e => setConfirm(e.target.value)} />
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger btn-sm" disabled={confirm !== "DELETE"} onClick={() => { onDelete(); toast({ kind: "success", title: "Record deleted" }); onClose(); }}>
          <i className="bi bi-trash3 me-1" />Permanently Delete
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   4. Lock/Unlock Data Modal
   ================================================================ */
export function LockUnlockModal({ record, open, onClose, onToggle }: { record: any; open: boolean; onClose: () => void; onToggle: (locked: boolean) => void }) {
  const toast = useToast();
  if (!record) return null;
  const isLocked = record.locked;

  return (
    <Modal open={open} onClose={onClose} title={isLocked ? "Unlock Record" : "Lock Record"} subtitle="Super Admin — Data access control" icon={isLocked ? "bi-unlock-fill" : "bi-lock-fill"} tone={isLocked ? "green" : "amber"} size="md">
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-eyebrow mb-1">Record</div>
          <div className="pm-td-strong">{record.name || record.label || record.dept || record.bank || "Unknown"}</div>
          <Badge tone={isLocked ? "amber" : "green"} className="mt-2">{isLocked ? "🔒 LOCKED" : "🔓 UNLOCKED"}</Badge>
        </div>
        {isLocked ? (
          <div className="pm-card pm-card-pad">
            <div className="pm-eyebrow mb-2">Lock Details</div>
            <div className="pm-kv"><span className="k">Locked by</span><span className="v">Super Admin</span></div>
            <div className="pm-kv"><span className="k">Locked at</span><span className="v">Jan 15, 2026 14:30</span></div>
            <div className="pm-kv"><span className="k">Reason</span><span className="v">Board resolution pending</span></div>
          </div>
        ) : (
          <div className="mb-3">
            <label className="form-label">Reason for Locking</label>
            <textarea className="form-control" rows={3} placeholder="e.g. Under legal review, pending board approval..." />
          </div>
        )}
        <div className="pm-note">
          <i className={`bi ${isLocked ? "bi-unlock" : "bi-lock"} me-1`} />
          {isLocked
            ? "Unlocking will allow other admins to edit this record."
            : "Locking prevents all other admins from editing. Only the locking admin can unlock."}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className={`btn btn-sm ${isLocked ? "btn-primary" : "btn-primary"}`} onClick={() => { onToggle(!isLocked); toast({ kind: "success", title: isLocked ? "Record unlocked" : "Record locked" }); onClose(); }}>
          <i className={`bi ${isLocked ? "bi-unlock" : "bi-lock"} me-1`} />{isLocked ? "Unlock Record" : "Lock Record"}
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   5. Document Upload Wizard (4 Steps)
   ================================================================ */
export function DocumentUploadWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [classification, setClassification] = useState("Confidential");
  const toast = useToast();
  const steps = [
    { label: "Category", icon: "bi-folder" },
    { label: "Upload", icon: "bi-cloud-arrow-up" },
    { label: "Classification", icon: "bi-shield-lock" },
    { label: "Review", icon: "bi-check-lg" },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Upload Company Document" subtitle={`Step ${step + 1} of 4: ${steps[step].label}`} icon="bi-cloud-arrow-up-fill" tone="blue" size="lg">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && <div className="d-flex flex-column gap-2">
          <div className="pm-eyebrow mb-1">Select document category</div>
          <div className="row g-2">
            {["Board Resolution", "Shareholder Agreement", "CBK License", "Tax Certificate", "Insurance Policy", "Partnership Agreement", "IP Registration", "Contract", "Compliance Report", "Financial Statement"].map(cat => (
              <div key={cat} className="col-6">
                <button className={`pm-opt w-100 ${selectedCategory === cat ? "active" : ""}`} onClick={() => setSelectedCategory(cat)}>
                  <div className="r" /><span style={{ fontSize: ".82rem" }}>{cat}</span>
                </button>
              </div>
            ))}
          </div>
        </div>}
        {step === 1 && <div className="d-flex flex-column gap-2">
          <label className="form-label">Document Name</label>
          <input className="form-control mb-2" placeholder="e.g. Board Resolution BR-2026-047" />
          <label className="form-label">File</label>
          <div style={{ border: "2px dashed var(--pm-border)", borderRadius: 12, padding: "2rem", textAlign: "center", cursor: "pointer" }}>
            <i className="bi bi-cloud-arrow-up" style={{ fontSize: "2rem", color: "var(--pm-muted)" }} />
            <div style={{ fontSize: ".85rem", margin: ".5rem 0 0", color: "var(--pm-muted)" }}>Click to browse or drag and drop</div>
            <div className="pm-td-sub">PDF, DOC, XLS, PNG, JPG — Max 50MB</div>
          </div>
          <label className="form-label">Notes</label>
          <textarea className="form-control" rows={2} placeholder="Document description..." />
        </div>}
        {step === 2 && <div className="d-flex flex-column gap-2">
          <div className="pm-eyebrow mb-1">Classification</div>
          <div className="row g-2 mb-3">
            {["Public", "Internal", "Confidential", "Restricted", "Board Only"].map(c => (
              <div key={c} className="col">
                <button className={`pm-opt w-100 ${classification === c ? "active" : ""}`} onClick={() => setClassification(c)}>
                  <div className="r" /><span style={{ fontSize: ".78rem" }}>{c}</span>
                </button>
              </div>
            ))}
          </div>
          <label className="form-label">Access Level</label>
          {["Super Admin Only", "Board Members", "All Admins", "Department Heads"].map(a => (
            <label key={a} className="d-flex align-items-center gap-2 mb-2" style={{ fontSize: ".82rem" }}>
              <input type="checkbox" className="form-check-input" defaultChecked={a === "Super Admin Only"} />{a}
            </label>
          ))}
        </div>}
        {step === 3 && <div className="pm-card pm-card-pad">
          <div className="pm-eyebrow mb-2">Document Summary</div>
          <div className="pm-kv"><span className="k">Category</span><span className="v">{selectedCategory || "—"}</span></div>
          <div className="pm-kv"><span className="k">Classification</span><span className="v"><Badge tone="amber">{classification}</Badge></span></div>
          <div className="pm-note mt-3"><i className="bi bi-shield-lock me-1" />Document will be encrypted at rest and access will be audit-logged.</div>
        </div>}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(s => s - 1)}>← Back</button>}
        {step < 3 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(s => s + 1)}>Continue →</button>
          : <button className="btn btn-primary btn-sm" onClick={() => { toast({ kind: "success", title: "Document uploaded" }); onClose(); }}><i className="bi bi-check2 me-1" />Upload Document</button>}
      </div>
    </Modal>
  );
}

/* ================================================================
   6. Document Repository Drawer
   ================================================================ */
export function DocumentRepositoryDrawer({ open, onClose, documents }: { open: boolean; onClose: () => void; documents: any[] }) {
  const [filter, setFilter] = useState("all");
  const categories = ["all", "Board Resolution", "Shareholder Agreement", "Compliance", "Insurance", "Contract", "Financial"];
  const filtered = filter === "all" ? documents : documents.filter(d => d.category === filter);

  return (
    <Drawer open={open} onClose={onClose} title="Document Repository" subtitle="Company documents & agreements vault" icon="bi-folder2-open" tone="blue" half>
      <div className="d-flex gap-2 flex-wrap mb-3">
        {categories.map(c => (
          <button key={c} className={`btn btn-sm ${filter === c ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setFilter(c)}>{c === "all" ? "All" : c}</button>
        ))}
      </div>
      <div className="pm-td-sub mb-2">{filtered.length} document{filtered.length !== 1 ? "s" : ""}</div>
      {filtered.map((doc, i) => (
        <div key={i} className="pm-alert-row mb-2">
          <div style={{ width: 36, height: 36, borderRadius: 9, display: "grid", placeItems: "center", background: doc.classification === "Restricted" ? "var(--pm-danger)" : doc.classification === "Confidential" ? "var(--pm-warn-soft)" : "var(--pm-blue-soft)", color: doc.classification === "Restricted" ? "#fff" : doc.classification === "Confidential" ? "#b54708" : "#175cd3", flex: "none" }}>
            <i className={`bi ${doc.locked ? "bi-file-earlock" : "bi-file-earmark-text"}`} />
          </div>
          <div className="flex-grow-1">
            <div className="pm-td-strong">{doc.name}</div>
            <div className="pm-td-sub">{doc.category} · {doc.uploadedAt || "Jan 2026"}</div>
          </div>
          <Badge tone={doc.locked ? "amber" : "green"}>{doc.locked ? "Locked" : "Active"}</Badge>
        </div>
      ))}
    </Drawer>
  );
}

/* ================================================================
   7. Partnership Viewer Drawer
   ================================================================ */
export function PartnershipViewerDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const partnerships = [
    { name: "Safaricom PLC", type: "M-Pesa Integration", status: "Active", since: "Mar 2024", value: "KES 124M/yr", expires: "Mar 2027" },
    { name: "KCB Bank", type: "Settlement Partner", status: "Active", since: "Jan 2024", value: "KES 45M/yr", expires: "Jan 2027" },
    { name: "Visa Kenya", type: "Card Issuing", status: "Active", since: "Jun 2024", value: "KES 67M/yr", expires: "Jun 2026" },
    { name: "Onfido Ltd", type: "KYC/AML Provider", status: "Active", since: "Feb 2024", value: "KES 18M/yr", expires: "Feb 2027" },
    { name: "Equity Bank", type: "Secondary Settlement", status: "Under Review", since: "Sep 2024", value: "KES 22M/yr", expires: "Sep 2026" },
  ];

  return (
    <Drawer open={open} onClose={onClose} title="Partnerships & Alliances" subtitle="Active and pending partnerships" icon="bi-handshake" tone="green" half>
      {partnerships.map((p, i) => (
        <div key={i} className="pm-card pm-card-pad mb-2">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <div className="pm-td-strong">{p.name}</div>
            <Badge tone={p.status === "Active" ? "green" : "amber"}>{p.status}</Badge>
          </div>
          <div className="pm-td-sub mb-2">{p.type}</div>
          <div className="pm-kv"><span className="k">Since</span><span className="v">{p.since}</span></div>
          <div className="pm-kv"><span className="k">Annual Value</span><span className="v">{p.value}</span></div>
          <div className="pm-kv"><span className="k">Expires</span><span className="v">{p.expires}</span></div>
        </div>
      ))}
    </Drawer>
  );
}

/* ================================================================
   8. Contract Manager Drawer
   ================================================================ */
export function ContractManagerDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const contracts = [
    { name: "M-Pesa API Agreement", vendor: "Safaricom", status: "Active", signed: "Mar 15, 2024", expires: "Mar 14, 2027", value: "KES 124M" },
    { name: "Cloud Services SLA", vendor: "AWS", status: "Active", signed: "Jan 20, 2024", expires: "Jan 19, 2027", value: "KES 54M" },
    { name: "Card Processing Agreement", vendor: "Visa", status: "Renewal Due", signed: "Jun 1, 2024", expires: "May 31, 2026", value: "KES 67M" },
    { name: "KYC Service Contract", vendor: "Onfido", status: "Active", signed: "Feb 10, 2024", expires: "Feb 9, 2027", value: "KES 18M" },
    { name: "Office Lease", vendor: "Westlands Properties", status: "Active", signed: "Jan 1, 2024", expires: "Dec 31, 2028", value: "KES 36M" },
    { name: "Audit Engagement", vendor: "Deloitte", status: "Pending", signed: "—", expires: "Dec 31, 2026", value: "KES 8.5M" },
  ];

  return (
    <Drawer open={open} onClose={onClose} title="Contract Manager" subtitle="All vendor and partnership contracts" icon="bi-file-earmark-ruled" tone="blue" half>
      {contracts.map((c, i) => (
        <div key={i} className="pm-alert-row mb-2">
          <div className="flex-grow-1">
            <div className="pm-td-strong">{c.name}</div>
            <div className="pm-td-sub">{c.vendor}</div>
          </div>
          <div className="text-end">
            <Badge tone={c.status === "Active" ? "green" : c.status === "Renewal Due" ? "amber" : "blue"}>{c.status}</Badge>
            <div className="pm-td-sub mt-1">{c.signed} → {c.expires}</div>
          </div>
        </div>
      ))}
    </Drawer>
  );
}

/* ================================================================
   9. E-Signature Workflow Modal (5 Steps)
   ================================================================ */
export function ESigWorkflowModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const toast = useToast();
  const steps = [
    { label: "Document", icon: "bi-file-earmark" },
    { label: "Signers", icon: "bi-people" },
    { label: "Order", icon: "bi-list-ol" },
    { label: "Message", icon: "bi-envelope" },
    { label: "Send", icon: "bi-send" },
  ];

  return (
    <Modal open={open} onClose={onClose} title="E-Signature Request" subtitle={`Step ${step + 1} of 5: ${steps[step].label}`} icon="bi-pen-fill" tone="violet" size="lg">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 5) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && <div className="d-flex flex-column gap-2">
          <div className="pm-eyebrow mb-1">Select document</div>
          {["Board Resolution BR-2026-047", "Share Transfer Agreement", "Vendor Contract Renewal", "Board Meeting Minutes", "Partnership Agreement"].map(d => (
            <button key={d} className="pm-opt"><div className="r" /><span className="pm-td-strong">{d}</span></button>
          ))}
        </div>}
        {step === 1 && <div className="d-flex flex-column gap-2">
          <div className="pm-eyebrow mb-1">Add signers</div>
          {["Joseph Mwangi (CEO)", "Sarah Kimani (CTO)", "Mary Wanjiku (CFO)", "Dr. Amina Osman (Board Chair)"].map(s => (
            <label key={s} className="d-flex align-items-center gap-2 mb-2" style={{ fontSize: ".82rem" }}><input type="checkbox" className="form-check-input" />{s}</label>
          ))}
        </div>}
        {step === 2 && <div className="d-flex flex-column gap-2">
          <div className="pm-eyebrow mb-1">Signing order</div>
          <div className="pm-card pm-card-pad mb-2">
            <label className="d-flex align-items-center gap-2" style={{ fontSize: ".82rem" }}><input type="radio" name="order" className="form-check-input" defaultChecked />Sequential (one after another)</label>
          </div>
          <div className="pm-card pm-card-pad">
            <label className="d-flex align-items-center gap-2" style={{ fontSize: ".82rem" }}><input type="radio" name="order" className="form-check-input" />Parallel (all at once)</label>
          </div>
          <div className="pm-note"><i className="bi bi-info-circle me-1" />Sequential ensures each signer reviews before the next.</div>
        </div>}
        {step === 3 && <div className="d-flex flex-column gap-2">
          <label className="form-label">Message to Signers</label>
          <textarea className="form-control mb-3" rows={3} placeholder="Please review and sign..." />
          <label className="form-label">Deadline</label>
          <input className="form-control mb-3" type="date" />
          <label className="form-label">Reminders</label>
          <div className="d-flex gap-2">
            {["Daily", "Every 3 days", "Weekly", "None"].map(r => (
              <button key={r} className="btn btn-sm btn-outline-secondary">{r}</button>
            ))}
          </div>
        </div>}
        {step === 4 && <div className="pm-card pm-card-pad">
          <div className="pm-eyebrow mb-2">Signature Request Summary</div>
          <div className="pm-kv"><span className="k">Document</span><span className="v">Board Resolution BR-2026-047</span></div>
          <div className="pm-kv"><span className="k">Signers</span><span className="v">3 people</span></div>
          <div className="pm-kv"><span className="k">Order</span><span className="v">Sequential</span></div>
          <div className="pm-kv"><span className="k">Deadline</span><span className="v">Aug 30, 2026</span></div>
          <div className="pm-note mt-3"><i className="bi bi-envelope me-1" />Email notifications will be sent to all signers.</div>
        </div>}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(s => s - 1)}>← Back</button>}
        {step < 4 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(s => s + 1)}>Continue →</button>
          : <button className="btn btn-primary btn-sm" onClick={() => { toast({ kind: "success", title: "E-signature request sent" }); onClose(); }}><i className="bi bi-send me-1" />Send for Signature</button>}
      </div>
    </Modal>
  );
}

/* ================================================================
   10. Compliance Audit Trail Modal
   ================================================================ */
export function ComplianceAuditModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Compliance Audit Trail" subtitle="Immutable record of all admin actions" icon="bi-clock-history" tone="violet" size="xl">
      <div className="pm-modal-body">
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Timestamp</th><th>Admin</th><th>Action</th><th>Record</th><th>Details</th><th>IP</th></tr></thead>
            <tbody>
              {[
                ["Aug 25, 14:32", "Super Admin", "CREATE", "Bank Account", "Added NCBA Reserve", "192.168.1.106"],
                ["Aug 25, 11:15", "Super Admin", "EDIT", "Founder", "Updated vesting", "192.168.1.106"],
                ["Aug 24, 16:48", "Super Admin", "LOCK", "Budget", "Locked Engineering Q4", "192.168.1.106"],
                ["Aug 24, 09:20", "Super Admin", "DELETE", "Vendor", "Removed inactive vendor", "192.168.1.106"],
                ["Aug 23, 14:55", "Super Admin", "UPLOAD", "Document", "Uploaded BR-2026-047", "192.168.1.106"],
                ["Aug 22, 15:12", "Platform Admin", "VIEW", "P&L", "Viewed Q2 2026 P&L", "192.168.1.50"],
              ].map(([ts, admin, action, record, detail, ip], i) => (
                <tr key={i}>
                  <td className="mono pm-td-sub">{ts}</td>
                  <td className="pm-td-strong">{admin}</td>
                  <td><Badge tone={action === "DELETE" ? "red" : action === "LOCK" ? "amber" : action === "CREATE" ? "green" : "blue"}>{action}</Badge></td>
                  <td>{record}</td>
                  <td style={{ fontSize: ".78rem" }}>{detail}</td>
                  <td className="mono pm-td-sub">{ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pm-note mt-3"><i className="bi bi-shield-lock me-1" />Audit trail is immutable. SHA-256 hash verification enabled.</div>
      </div>
    </Modal>
  );
}

/* ================================================================
   11. Admin Activity Log Modal
   ================================================================ */
export function AdminActivityLogModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Admin Activity Log" subtitle="Who did what and when" icon="bi-person-video3" tone="blue" size="lg">
      <div className="pm-modal-body">
        {[
          { name: "Joseph Mwangi", role: "Super Admin", actions: 47, last: "2 min ago" },
          { name: "Sarah Kimani", role: "Super Admin", actions: 23, last: "1 hour ago" },
          { name: "James Ochieng", role: "Platform Admin", actions: 12, last: "3 hours ago" },
          { name: "Mary Wanjiku", role: "Finance Admin", actions: 8, last: "Yesterday" },
        ].map((a, i) => (
          <div key={i} className="pm-alert-row mb-2">
            <div style={{ width: 36, height: 36, borderRadius: 9, display: "grid", placeItems: "center", background: a.role === "Super Admin" ? "var(--pm-green)" : "var(--pm-blue)", color: "#fff", fontWeight: 700, fontSize: ".8rem", flex: "none" }}>{a.name[0]}</div>
            <div className="flex-grow-1">
              <div className="pm-td-strong">{a.name}</div>
              <div className="pm-td-sub"><Badge tone={a.role === "Super Admin" ? "green" : "blue"}>{a.role}</Badge> · {a.actions} actions · Last: {a.last}</div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ================================================================
   12. Data Export/Import Modal
   ================================================================ */
export function DataExportImportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<"export" | "import">("export");
  const toast = useToast();
  return (
    <Modal open={open} onClose={onClose} title="Data Export / Import" subtitle="Bulk data operations" icon="bi-arrow-left-right" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="d-flex gap-2 mb-3">
          <button className={`btn btn-sm ${mode === "export" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setMode("export")}>Export Data</button>
          <button className={`btn btn-sm ${mode === "import" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setMode("import")}>Import Data</button>
        </div>
        {mode === "export" ? (
          <div className="d-flex flex-column gap-2">
            <div className="pm-eyebrow mb-1">Select data to export</div>
            {["Cap Table", "Treasury Accounts", "P&L Data", "Budget Allocations", "Board Resolutions", "Shareholder Agreements", "Vendor Directory", "Compliance Records"].map(item => (
              <label key={item} className="d-flex align-items-center gap-2 mb-2" style={{ fontSize: ".82rem" }}><input type="checkbox" className="form-check-input" />{item}</label>
            ))}
            <div className="pm-eyebrow mt-2 mb-1">Format</div>
            <div className="d-flex gap-2">
              {["Excel (.xlsx)", "CSV", "PDF Report", "JSON"].map(f => (
                <button key={f} className="btn btn-sm btn-outline-secondary">{f}</button>
              ))}
            </div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            <div style={{ border: "2px dashed var(--pm-border)", borderRadius: 12, padding: "2rem", textAlign: "center", cursor: "pointer" }}>
              <i className="bi bi-cloud-arrow-up" style={{ fontSize: "2rem", color: "var(--pm-muted)" }} />
              <div style={{ fontSize: ".85rem", margin: ".5rem 0 0", color: "var(--pm-muted)" }}>Drop file here or click to browse</div>
              <div className="pm-td-sub">XLSX, CSV, JSON — Max 100MB</div>
            </div>
            <div className="pm-note"><i className="bi bi-info-circle me-1" />Imported data will overwrite existing records. A backup will be created automatically.</div>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ================================================================
   13. Shareholder Invite Wizard (3 Steps)
   ================================================================ */
export function ShareholderInviteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const toast = useToast();
  const steps = [
    { label: "Invitee", icon: "bi-person-plus" },
    { label: "Allocation", icon: "bi-cash-stack" },
    { label: "Send", icon: "bi-send" },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Invite New Shareholder" subtitle={`Step ${step + 1} of 3: ${steps[step].label}`} icon="bi-person-plus-fill" tone="green" size="lg">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 3) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && <div className="d-flex flex-column gap-2">
          <label className="form-label">Full Name / Entity</label>
          <input className="form-control mb-2" placeholder="e.g. Capital Ventures Ltd" />
          <label className="form-label">Email</label>
          <input className="form-control mb-2" type="email" placeholder="e.g. invest@capital.com" />
          <label className="form-label">Investor Type</label>
          <div className="row g-2">
            {["Individual", "VC Fund", "Angel Group", "Corporate"].map(t => (
              <div key={t} className="col-6"><button className="pm-opt w-100"><div className="r" /><span style={{ fontSize: ".82rem" }}>{t}</span></button></div>
            ))}
          </div>
        </div>}
        {step === 1 && <div className="d-flex flex-column gap-2">
          <div className="row g-2 mb-3">
            <div className="col-6"><label className="form-label">Shares</label><input className="form-control" type="number" placeholder="500000" /></div>
            <div className="col-6"><label className="form-label">Price/Share (KES)</label><input className="form-control" type="number" placeholder="247" /></div>
          </div>
          <div className="pm-card pm-card-pad">
            <div className="pm-eyebrow mb-2">Post-Invitation Cap Table</div>
            {(["Joseph Mwangi 50%", "VC Fund A 20%", "Angel B 10%", "VC Fund C 15%", "ESOP 5%", "NEW INVESTOR"] as const).map(n => (
              <div key={n} className="pm-kv" style={n === "NEW INVESTOR" ? { fontWeight: 700, color: "var(--pm-green)" } : undefined}><span className="k">{n}</span></div>
            ))}
          </div>
        </div>}
        {step === 2 && <div className="pm-card pm-card-pad">
          <div className="pm-eyebrow mb-2">Invitation Summary</div>
          <div className="pm-kv"><span className="k">Investor</span><span className="v">Capital Ventures Ltd</span></div>
          <div className="pm-kv"><span className="k">Shares</span><span className="v">500,000</span></div>
          <div className="pm-kv"><span className="k">Price/Share</span><span className="v">{kes(247)}</span></div>
          <div className="pm-kv"><span className="k">Total Investment</span><span className="v" style={{ fontWeight: 800 }}>{kes(123500000)}</span></div>
          <div className="pm-note mt-3"><i className="bi bi-envelope me-1" />Invitation includes KYC requirements, SHA terms, and onboarding checklist.</div>
        </div>}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(s => s - 1)}>← Back</button>}
        {step < 2 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(s => s + 1)}>Continue →</button>
          : <button className="btn btn-primary btn-sm" onClick={() => { toast({ kind: "success", title: "Invitation sent" }); onClose(); }}><i className="bi bi-send me-1" />Send Invitation</button>}
      </div>
    </Modal>
  );
}

/* ================================================================
   14. Corporate Seal Modal
   ================================================================ */
export function CorporateSealModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Corporate Seal & Stamp" subtitle="Official company seal management" icon="bi-stamp" tone="amber" size="md">
      <div className="pm-modal-body">
        <div className="text-center mb-3">
          <div style={{ width: 80, height: 80, borderRadius: "50%", border: "3px solid var(--pm-green)", display: "grid", placeItems: "center", margin: "0 auto", background: "var(--pm-green-soft)" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--pm-green)" }}>P</div>
          </div>
          <div style={{ fontFamily: "Sora", fontWeight: 700, marginTop: ".75rem" }}>PayMo Digital Bank Ltd</div>
          <div className="pm-td-sub">Official Corporate Seal</div>
        </div>
        <div className="row g-2 mb-3">
          {[["Seal No.", "SEAL-2024-001"], ["Registered", "Jan 15, 2024"], ["Authority", "Board Resolution"], ["Status", "Active"]].map(([k, v]) => (
            <div key={k} className="col-6"><div className="pm-stat"><div className="pm-stat-label">{k}</div><div className="pm-stat-value" style={{ fontSize: ".9rem" }}>{v}</div></div></div>
          ))}
        </div>
        <div className="pm-card pm-card-pad">
          <div className="pm-eyebrow mb-2">Seal Usage Authorization</div>
          {["Board Resolution", "Share Transfer", "Bank Mandate", "Power of Attorney", "Partnership Agreement"].map(p => (
            <label key={p} className="d-flex align-items-center gap-2 mb-2" style={{ fontSize: ".82rem" }}><input type="checkbox" className="form-check-input" />{p}</label>
          ))}
        </div>
        <div className="pm-note mt-3"><i className="bi bi-shield-lock me-1" />Seal usage requires dual Super Admin authorization and is audit-logged.</div>
      </div>
    </Modal>
  );
}

/* ================================================================
   15. Power of Attorney Wizard (4 Steps)
   ================================================================ */
export function PowerOfAttorneyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const toast = useToast();
  const steps = [
    { label: "Agent", icon: "bi-person" },
    { label: "Powers", icon: "bi-shield" },
    { label: "Duration", icon: "bi-calendar" },
    { label: "Execute", icon: "bi-check-lg" },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Power of Attorney" subtitle={`Step ${step + 1} of 4: ${steps[step].label}`} icon="bi-person-gear" tone="violet" size="lg">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && <div className="d-flex flex-column gap-2">
          <div className="pm-eyebrow mb-1">Select agent (attorney-in-fact)</div>
          {["Sarah Kimani (CTO)", "Mary Wanjiku (CFO)", "James Ochieng (VP Eng)", "External Counsel"].map(n => (
            <button key={n} className="pm-opt"><div className="r" /><span className="pm-td-strong">{n}</span></button>
          ))}
        </div>}
        {step === 1 && <div className="d-flex flex-column gap-2">
          <div className="pm-eyebrow mb-1">Select delegated powers</div>
          {["Financial transactions up to KES 10M", "Board meeting representation", "Regulatory filings", "Vendor contract signing", "Bank account operations", "Legal proceedings"].map(p => (
            <label key={p} className="d-flex align-items-center gap-2 mb-2" style={{ fontSize: ".82rem" }}><input type="checkbox" className="form-check-input" />{p}</label>
          ))}
        </div>}
        {step === 2 && <div className="d-flex flex-column gap-2">
          <label className="form-label">Effective Date</label><input className="form-control mb-3" type="date" />
          <label className="form-label">Expiry Date</label><input className="form-control mb-3" type="date" />
          <label className="form-label">Conditions</label>
          <textarea className="form-control" rows={3} placeholder="e.g. Only valid during CEO's absence..." />
          <div className="pm-note mt-2"><i className="bi bi-info-circle me-1" />PoA must be notarized and registered with Companies Registry.</div>
        </div>}
        {step === 3 && <div className="pm-card pm-card-pad">
          <div className="pm-eyebrow mb-2">PoA Summary</div>
          <div className="pm-kv"><span className="k">Agent</span><span className="v">Sarah Kimani (CTO)</span></div>
          <div className="pm-kv"><span className="k">Powers</span><span className="v">Financial + Regulatory</span></div>
          <div className="pm-kv"><span className="k">Duration</span><span className="v">12 months</span></div>
          <div className="pm-kv"><span className="k">Revocable</span><span className="v">Yes — by Board resolution</span></div>
        </div>}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(s => s - 1)}>← Back</button>}
        {step < 3 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(s => s + 1)}>Continue →</button>
          : <button className="btn btn-primary btn-sm" onClick={() => { toast({ kind: "success", title: "PoA executed" }); onClose(); }}><i className="bi bi-check2 me-1" />Execute PoA</button>}
      </div>
    </Modal>
  );
}

/* ================================================================
   16. Emergency Actions Modal
   ================================================================ */
export function EmergencyActionsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  return (
    <Modal open={open} onClose={onClose} title="Emergency Admin Actions" subtitle="Super Admin — Critical system controls" icon="bi-exclamation-triangle-fill" tone="red" size="lg">
      <div className="pm-modal-body">
        <div className="pm-note mb-3" style={{ borderLeft: "3px solid var(--pm-danger)", background: "var(--pm-danger-soft)" }}>
          <div className="pm-td-strong" style={{ color: "var(--pm-danger)" }}>⚠️ Emergency actions are irreversible and trigger immediate notifications</div>
        </div>
        {[
          { action: "Freeze All Transactions", desc: "Halt all incoming/outgoing transactions", icon: "bi-snow" },
          { action: "Lock All Accounts", desc: "Prevent all account modifications", icon: "bi-lock-fill" },
          { action: "Activate Fraud Protocol", desc: "Enhanced monitoring & alerts", icon: "bi-shield-exclamation" },
          { action: "Export Emergency Backup", desc: "Encrypted backup of critical data", icon: "bi-database-down" },
          { action: "Notify Board Members", desc: "Emergency notification to all board", icon: "bi-megaphone-fill" },
          { action: "Engage External Auditor", desc: "Trigger emergency audit engagement", icon: "bi-person-badge" },
        ].map((e, i) => (
          <div key={i} className="pm-alert-row mb-2 cursor-pointer" onClick={() => toast({ kind: "success", title: e.action, body: "Emergency action triggered" })}>
            <div style={{ width: 36, height: 36, borderRadius: 9, display: "grid", placeItems: "center", background: "var(--pm-danger-soft)", color: "var(--pm-danger)", flex: "none" }}>
              <i className={`bi ${e.icon}`} />
            </div>
            <div className="flex-grow-1">
              <div className="pm-td-strong">{e.action}</div>
              <div className="pm-td-sub">{e.desc}</div>
            </div>
            <i className="bi bi-chevron-right" style={{ color: "var(--pm-muted)" }} />
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ================================================================
   17. Admin Permissions Matrix Drawer
   ================================================================ */
export function AdminPermissionsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const admins = [
    { name: "Joseph Mwangi", role: "Super Admin", perms: ["All Operations", "Lock/Unlock", "Delete", "Emergency", "PoA"] },
    { name: "Sarah Kimani", role: "Super Admin", perms: ["All Operations", "Lock/Unlock", "Delete", "Emergency"] },
    { name: "James Ochieng", role: "Platform Admin", perms: ["View All", "Edit (non-locked)", "Create"] },
    { name: "Mary Wanjiku", role: "Finance Admin", perms: ["View Financial", "Edit Treasury", "Process Payments"] },
  ];

  return (
    <Drawer open={open} onClose={onClose} title="Admin Permissions Matrix" subtitle="Access control for all administrators" icon="bi-shield-lock" tone="violet" half>
      {admins.map((a, i) => (
        <div key={i} className="pm-card pm-card-pad mb-2">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <div className="pm-td-strong">{a.name}</div>
            <Badge tone={a.role === "Super Admin" ? "green" : "blue"}>{a.role}</Badge>
          </div>
          <div className="d-flex gap-1 flex-wrap mt-1">
            {a.perms.map(p => (
              <Badge key={p} tone="green" style={{ fontSize: ".65rem" }}>{p}</Badge>
            ))}
          </div>
        </div>
      ))}
      <div className="pm-note"><i className="bi bi-shield-lock me-1" />Permission changes require Board approval and are audit-logged.</div>
    </Drawer>
  );
}
