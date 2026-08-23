import { useEffect, useState } from "react";
import { Badge, Drawer, EmptyState, Modal, Steps, TwoFactorField, useToast } from "../../../components/ui";
import { csvDownload, jsonDownload } from "../../../lib/format";
import type { ChangeRequest, ConfigVersion, Environment, Override, Product, ProductAudit, Rule, Setting } from "../data/productConfigData";
import { CONFIG_PERMISSIONS, ENVIRONMENTS, PRODUCTS, VERSIONS } from "../data/productConfigData";

const CODE = "482913";

export const statusTone = (s: string) =>
  s === "Live" || s === "Active" || s === "Approved" || s === "Deployed" ? "green"
    : s === "Beta" || s === "Pending" || s === "Draft" ? s === "Pending" ? "amber" : "blue"
      : s === "Frozen" ? "red" : s === "Expired" || s === "Rejected" ? "grey" : "grey";

export const riskTone = (r: string) => (r === "High" ? "red" : r === "Medium" ? "amber" : "green");

const productName = (id: string) => PRODUCTS.find((p) => p.id === id)?.short ?? "Platform";
const productColor = (id: string) => PRODUCTS.find((p) => p.id === id)?.color ?? "#667085";

/* ================================================================
   1. Product configuration drawer (core console)
   ================================================================ */
export function ProductConfigDrawer({
  product, settings, overrides, rules, onClose, onEdit, onAdd, onFreezeSetting, onReset, onDelete, onEditProduct, onFreezeProduct, onAddOverride, audit,
}: {
  product: Product | null;
  settings: Setting[];
  overrides: Override[];
  rules: Rule[];
  onClose: () => void;
  onEdit: (s: Setting) => void;
  onAdd: (p: Product) => void;
  onFreezeSetting: (s: Setting) => void;
  onReset: (s: Setting) => void;
  onDelete: (s: Setting) => void;
  onEditProduct: (p: Product) => void;
  onFreezeProduct: (p: Product) => void;
  onAddOverride: (p: Product) => void;
  audit: ProductAudit[];
}) {
  const [tab, setTab] = useState<"settings" | "overrides" | "rules" | "audit">("settings");
  useEffect(() => { setTab("settings"); }, [product?.id]);
  if (!product) return null;
  const rows = settings.filter((s) => s.productId === product.id);
  const groups = [...new Set(rows.map((r) => r.group))];
  const ovr = overrides.filter((o) => o.productId === product.id);
  const rls = rules.filter((r) => r.productId === product.id);
  const pAudit = audit.filter((a) => a.area.includes(product.short) || a.change.toLowerCase().includes(product.short.toLowerCase())).slice(0, 8);
  return (
    <Drawer open onClose={onClose} wide icon={product.icon} tone={product.status === "Live" ? "green" : product.status === "Beta" ? "blue" : product.status === "Frozen" ? "red" : "amber"}
      title={product.name} subtitle={`${product.id} · ${product.category} · owner ${product.owner} · ${rows.length} settings · v${VERSIONS.find((v) => v.current)?.id ?? "3.14.2"}`}
      headExtra={<Badge tone={statusTone(product.status)} dot>{product.status}</Badge>}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => onEditProduct(product)}><i className="bi bi-pencil-square me-1" />Details</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => onAddOverride(product)}><i className="bi bi-person-badge me-1" />Override</button>
          {product.status === "Frozen" ? (
            <button className="btn btn-primary btn-sm ms-auto" onClick={() => onFreezeProduct(product)}><i className="bi bi-play-fill me-1" />Unfreeze config</button>
          ) : (
            <button className="btn btn-outline-danger btn-sm ms-auto" style={{ borderColor: "#fda29b", color: "#b42318" }} onClick={() => onFreezeProduct(product)}><i className="bi bi-snow me-1" />Freeze config</button>
          )}
        </>
      }>
      <div className="pm-note mb-3"><i className="bi bi-info-circle me-1" />{product.description}</div>
      {product.status === "Frozen" && product.frozenNote && (
        <div className="pm-alert-row crit mb-3">
          <i className="bi bi-snow2" style={{ color: "#f04438" }} />
          <div><b style={{ fontSize: ".8rem" }}>Config frozen</b><div className="pm-td-sub">{product.frozenNote}</div></div>
        </div>
      )}
      <div className="pm-tabs mb-3">
        {([["settings", `Settings (${rows.length})`], ["overrides", `Overrides (${ovr.length})`], ["rules", `Rules (${rls.length})`], ["audit", "Audit"]] as const).map(([k, l]) => (
          <button key={k} className={`pm-tab ${tab === k ? "active" : ""}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === "settings" && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="pm-td-sub">{rows.filter((r) => r.frozen).length} frozen · {rows.filter((r) => !r.editable).length} locked · {rows.filter((r) => r.drift).length} drifted</span>
            <button className="btn btn-sm btn-primary" style={{ fontSize: ".7rem" }} onClick={() => onAdd(product)}><i className="bi bi-plus-lg me-1" />Add setting</button>
          </div>
          {groups.map((g) => (
            <div className="pm-card mb-3" key={g}>
              <div className="pm-card-head"><h3 className="pm-card-title">{g}</h3><span className="pm-td-sub mono">{rows.filter((r) => r.group === g).length}</span></div>
              <div className="pm-table-wrap">
                <table className="pm-table">
                  <thead><tr><th>Setting</th><th>Current value</th><th>Range</th><th>Changed</th><th /></tr></thead>
                  <tbody>
                    {rows.filter((r) => r.group === g).map((s) => (
                      <tr key={s.id} style={{ opacity: s.frozen ? 0.62 : 1 }}>
                        <td className="pm-td-strong">{s.key}
                          <div className="pm-td-sub mono">{s.id}{s.lockedReason ? ` · ${s.lockedReason}` : ""}</div>
                        </td>
                        <td className="mono" style={{ fontWeight: 700 }}>
                          {s.value}
                          {s.frozen && <Badge tone="red" className="ms-2">frozen</Badge>}
                          {s.drift && <Badge tone="amber" className="ms-2" >drift</Badge>}
                        </td>
                        <td className="pm-td-sub mono">{s.min || s.max ? `${s.min ?? "—"} → ${s.max ?? "—"}` : "—"}</td>
                        <td className="pm-td-sub mono">{s.changed} · {s.changedBy}</td>
                        <td className="text-end text-nowrap">
                          <button className="btn btn-sm btn-outline-primary me-1" style={{ fontSize: ".64rem" }} disabled={!s.editable || s.frozen} title={!s.editable ? s.lockedReason ?? "Locked" : s.frozen ? "Frozen — unfreeze first" : "Edit value"} onClick={() => onEdit(s)}>Edit</button>
                          <button className="btn btn-sm btn-outline-secondary me-1" style={{ fontSize: ".64rem" }} title={s.frozen ? "Unfreeze" : "Freeze"} onClick={() => onFreezeSetting(s)}><i className={`bi ${s.frozen ? "bi-play-fill" : "bi-snow"}`} /></button>
                          <button className="btn btn-sm btn-outline-secondary me-1" style={{ fontSize: ".64rem" }} title="Reset to default" disabled={!s.editable || s.frozen} onClick={() => onReset(s)}><i className="bi bi-arrow-counterclockwise" /></button>
                          <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".64rem", color: "#b42318", borderColor: "#fbd3cf" }} title="Delete setting" disabled={!s.editable} onClick={() => onDelete(s)}><i className="bi bi-trash3" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </>
      )}

      {tab === "overrides" && (ovr.length ? (
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Scope</th><th>Setting</th><th>Value</th><th>Expires</th><th>Status</th></tr></thead>
            <tbody>
              {ovr.map((o) => (
                <tr key={o.id}>
                  <td className="pm-td-strong">{o.target}<div className="pm-td-sub">{o.scope} · {o.affected.toLocaleString("en-KE")} affected</div></td>
                  <td className="pm-td-sub">{o.settingKey}</td>
                  <td className="mono" style={{ fontWeight: 700 }}>{o.value}<div className="pm-td-sub mono">base {o.baseline}</div></td>
                  <td className="pm-td-sub mono">{o.expires}</td>
                  <td><Badge tone={statusTone(o.status)} dot>{o.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <EmptyState icon="bi-person-badge" title="No overrides" body="All users on this product follow baseline configuration." />)}

      {tab === "rules" && (rls.length ? (
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Rule</th><th>Trigger → action</th><th>Priority</th><th>30d hits</th><th>State</th></tr></thead>
            <tbody>
              {rls.map((r) => (
                <tr key={r.id}>
                  <td className="pm-td-strong">{r.name}<div className="pm-td-sub mono">{r.id} · {r.kind}</div></td>
                  <td className="pm-td-sub">{r.trigger}<div className="pm-td-sub"><i className="bi bi-arrow-return-right mx-1" />{r.action}</div></td>
                  <td className="mono pm-num">{r.priority}</td>
                  <td className="mono pm-num">{r.hits30d.toLocaleString("en-KE")}</td>
                  <td><Badge tone={r.enabled ? "green" : "grey"} dot>{r.enabled ? "Enabled" : "Disabled"}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <EmptyState icon="bi-lightning-charge" title="No product rules" body="This product is governed by platform-wide rules only." />)}

      {tab === "audit" && (pAudit.length ? (
        <div className="pm-card pm-card-pad">
          {pAudit.map((a) => (
            <div className="pm-kv" key={a.id}>
              <span className="k">{a.change}<div className="pm-td-sub mono">{a.id} · {a.date} · {a.admin}</div></span>
              <span className="v mono" style={{ fontSize: ".72rem" }}>{a.from} → <b>{a.to}</b></span>
            </div>
          ))}
        </div>
      ) : <EmptyState icon="bi-journal-check" title="No changes" body="No configuration changes recorded for this product." />)}
    </Drawer>
  );
}

/* ================================================================
   2. Setting edit modal (2FA + range validation)
   ================================================================ */
export function SettingEditModal({ setting, onClose, onDone }: { setting: Setting | null; onClose: () => void; onDone: (id: string, value: string, reason: string) => void }) {
  const { push } = useToast();
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  useEffect(() => { setValue(setting?.value ?? ""); setReason(""); setCode(""); }, [setting?.id]);
  if (!setting) return null;
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-sliders" size="sm" title={`Edit — ${setting.key}`}
      subtitle={`${productName(setting.productId)} · ${setting.id} · changed ${setting.changed} by ${setting.changedBy}`}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" disabled={value === setting.value || !value.trim() || reason.trim().length < 8 || code !== CODE} onClick={() => {
            onDone(setting.id, value.trim(), reason);
            push({ kind: "success", title: `${setting.key} updated`, body: `${setting.value} → ${value.trim()} · live in staging, queued for approval.` });
            onClose();
          }}><i className="bi bi-check2 me-1" />Save to staging</button>
        </>
      }>
      <div className="pm-modal-body">
        {setting.min || setting.max ? (
          <div className="pm-card pm-card-pad mb-3">
            <div className="pm-kv"><span className="k">Valid range</span><span className="v mono">{setting.min ?? "—"} → {setting.max ?? "—"}</span></div>
            <div className="pm-kv"><span className="k">Value type</span><span className="v">{setting.valueKind}</span></div>
          </div>
        ) : (
          <div className="pm-note mb-3"><i className="bi bi-info-circle me-1" />Free-text setting — no validated range. Describe units in the value (e.g. “KES 500 flat”).</div>
        )}
        <label className="form-label">New value <span style={{ color: "#f04438" }}>*</span></label>
        <input className="form-control mb-3 mono" value={value} onChange={(e) => setValue(e.target.value)} />
        <label className="form-label">Reason (min 8 chars · goes to approvals) <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control mb-3" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Board approval · partner contract · risk instruction" />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
    </Modal>
  );
}

/* ================================================================
   3. Add setting wizard (3 steps + 2FA)
   ================================================================ */
export function AddSettingWizard({ open, product, products, onClose, onDone }: {
  open: boolean; product: Product | null; products: Product[];
  onClose: () => void;
  onDone: (productId: string, group: string, key: string, value: string, kind: string, min: string, max: string, reason: string) => void;
}) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [productId, setProductId] = useState(product?.id ?? "");
  const [group, setGroup] = useState("Limits");
  const [key, setKey] = useState("");
  const [kind, setKind] = useState("currency");
  const [value, setValue] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  useEffect(() => { setStep(0); setProductId(product?.id ?? ""); setKey(""); setValue(""); setMin(""); setMax(""); setReason(""); setCode(""); }, [open, product?.id]);
  if (!open) return null;
  const valid = [!!productId && key.trim().length >= 4, value.trim().length > 0, reason.trim().length >= 8 && code === CODE][step];
  return (
    <Modal open onClose={onClose} tone="green" icon="bi-plus-circle" size="md" title="Add product setting"
      subtitle="New configuration record · versioned + audited"
      footer={
        <>
          {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
          {step < 2 ? <button className="btn btn-primary btn-sm" disabled={!valid} onClick={() => setStep(step + 1)}>Continue<i className="bi bi-arrow-right ms-1" /></button> : (
            <button className="btn btn-primary btn-sm" disabled={!valid} onClick={() => {
              onDone(productId, group, key.trim(), value.trim(), kind, min.trim(), max.trim(), reason);
              push({ kind: "success", title: "Setting created", body: `${key.trim()} added to ${productName(productId)} (${group}).` });
              onClose();
            }}><i className="bi bi-check2 me-1" />Create setting</button>
          )}
        </>
      }>
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 3) * 100}%` }} /></div>
      <Steps current={step} steps={[{ label: "Setting", icon: "bi-tag" }, { label: "Value", icon: "bi-123" }, { label: "Confirm", icon: "bi-shield-lock" }]} />
      <div className="pm-modal-body">
        {step === 0 && (
          <>
            <label className="form-label">Product <span style={{ color: "#f04438" }}>*</span></label>
            <select className="form-select mb-3" value={productId} onChange={(e) => setProductId(e.target.value)}>
              <option value="">Select product…</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <div className="row g-2 mb-3">
              <div className="col-7">
                <label className="form-label">Group</label>
                <select className="form-select" value={group} onChange={(e) => setGroup(e.target.value)}>
                  {["Limits", "Fees", "Behavior", "Technical", "Eligibility", "Rail"].map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="col-5">
                <label className="form-label">Value type</label>
                <select className="form-select" value={kind} onChange={(e) => setKind(e.target.value)}>
                  {["currency", "percent", "seconds", "number", "boolean", "text", "list"].map((k) => <option key={k}>{k}</option>)}
                </select>
              </div>
            </div>
            <label className="form-label">Setting key (min 4 chars) <span style={{ color: "#f04438" }}>*</span></label>
            <input className="form-control" value={key} onChange={(e) => setKey(e.target.value)} placeholder="e.g. Max instant-loan per day" />
          </>
        )}
        {step === 1 && (
          <>
            <label className="form-label">Value <span style={{ color: "#f04438" }}>*</span></label>
            <input className="form-control mb-3 mono" value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. KES 25,000" />
            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label">Min (optional)</label>
                <input className="form-control mono" value={min} onChange={(e) => setMin(e.target.value)} placeholder="KES 1,000" />
              </div>
              <div className="col-6">
                <label className="form-label">Max (optional)</label>
                <input className="form-control mono" value={max} onChange={(e) => setMax(e.target.value)} placeholder="KES 100,000" />
              </div>
            </div>
            <div className="pm-note mb-0"><i className="bi bi-info-circle me-1" />Created in <b>staging</b> first — promote with the environment wizard once QA passes.</div>
          </>
        )}
        {step === 2 && (
          <>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">Product · group</span><span className="v">{productName(productId)} · {group}</span></div>
              <div className="pm-kv"><span className="k">Setting</span><span className="v">{key || "—"}</span></div>
              <div className="pm-kv"><span className="k">Value</span><span className="v mono">{value || "—"}{min || max ? ` (${min || "—"} → ${max || "—"})` : ""}</span></div>
              <div className="pm-kv"><span className="k">Type</span><span className="v">{kind}</span></div>
            </div>
            <label className="form-label">Reason (min 8 chars) <span style={{ color: "#f04438" }}>*</span></label>
            <textarea className="form-control mb-3" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why is this setting being introduced?" />
            <TwoFactorField value={code} onChange={setCode} />
          </>
        )}
      </div>
    </Modal>
  );
}

/* ================================================================
   4. Delete confirm modal (type-to-confirm + 2FA, parameterised)
   ================================================================ */
export function DeleteConfirmModal({ target, kind, impact, onClose, onDone }: {
  target: { id: string; name: string } | null;
  kind: "setting" | "product" | "override" | "rule" | "version";
  impact: string;
  onClose: () => void;
  onDone: (id: string) => void;
}) {
  const { push } = useToast();
  const [typed, setTyped] = useState("");
  const [code, setCode] = useState("");
  useEffect(() => { setTyped(""); setCode(""); }, [target?.id]);
  if (!target) return null;
  const label = { setting: "setting", product: "product config set", override: "override", rule: "rule", version: "version" }[kind];
  return (
    <Modal open onClose={onClose} tone="red" icon="bi-trash3" size="sm" title={`Delete ${label}`}
      subtitle={`${target.id} · ${target.name}`}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Keep it</button>
          <button className="btn btn-danger btn-sm" disabled={typed !== target.id || code !== CODE} onClick={() => {
            onDone(target.id);
            push({ kind: "warn", title: `${target.id} deleted`, body: `${kind === "setting" ? "Setting" : label[0].toUpperCase() + label.slice(1)} removed · snapshot retained 90 days for restore.` });
            onClose();
          }}><i className="bi bi-trash3 me-1" />Delete permanently</button>
        </>
      }>
      <div className="pm-modal-body">
        <div className="pm-alert-row crit mb-3">
          <i className="bi bi-exclamation-octagon-fill" style={{ color: "#f04438" }} />
          <div>
            <b style={{ fontSize: ".8rem" }}>This is irreversible</b>
            <div className="pm-td-sub">{impact}</div>
          </div>
        </div>
        <label className="form-label">Type <b className="mono">{target.id}</b> to confirm</label>
        <input className="form-control mb-3 mono" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={target.id} />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
    </Modal>
  );
}

/* ================================================================
   5. Freeze / unfreeze setting modal (2FA)
   ================================================================ */
export function FreezeSettingModal({ setting, onClose, onDone }: { setting: Setting | null; onClose: () => void; onDone: (id: string, freeze: boolean, reason: string) => void }) {
  const { push } = useToast();
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  useEffect(() => { setReason(""); setCode(""); }, [setting?.id]);
  if (!setting) return null;
  const freezing = !setting.frozen;
  return (
    <Modal open onClose={onClose} tone={freezing ? "red" : "green"} icon={freezing ? "bi-snow" : "bi-play-fill"} size="sm"
      title={`${freezing ? "Freeze" : "Unfreeze"} — ${setting.key}`} subtitle={`${setting.id} · ${productName(setting.productId)} · current ${setting.value}`}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button className={`btn ${freezing ? "btn-danger" : "btn-primary"} btn-sm`} disabled={reason.trim().length < 8 || code !== CODE} onClick={() => {
            onDone(setting.id, freezing, reason);
            push({ kind: freezing ? "warn" : "success", title: freezing ? `${setting.key} frozen` : `${setting.key} unfrozen`, body: freezing ? "Edits blocked until unfrozen. In-flight transactions unaffected." : "Edits enabled again — changes still go through approvals." });
            onClose();
          }}><i className={`bi ${freezing ? "bi-snow" : "bi-play-fill"} me-1`} />{freezing ? "Freeze setting" : "Unfreeze setting"}</button>
        </>
      }>
      <div className="pm-modal-body">
        <div className="pm-note mb-3"><i className="bi bi-info-circle me-1" />{freezing
          ? "Freezing blocks edits and approvals for this setting (e.g. during a regulatory review). Current value keeps applying to live traffic."
          : "Unfreezing restores the normal edit → approve → promote flow."}</div>
        <label className="form-label">Reason (min 8 chars) <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control mb-3" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. CBK review in progress · ALCO hold · incident freeze" />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
    </Modal>
  );
}

/* ================================================================
   6. Bulk freeze modal
   ================================================================ */
export function BulkFreezeModal({ open, count, onClose, onDone }: { open: boolean; count: number; onClose: () => void; onDone: (reason: string) => void }) {
  const { push } = useToast();
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  useEffect(() => { setReason(""); setCode(""); }, [count]);
  if (!open) return null;
  return (
    <Modal open onClose={onClose} tone="red" icon="bi-snow2" size="sm" title={`Freeze ${count} settings`}
      subtitle="Bulk edit-lock on selected settings"
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger btn-sm" disabled={reason.trim().length < 8 || code !== CODE} onClick={() => {
            onDone(reason);
            push({ kind: "warn", title: `${count} settings frozen`, body: "Edit-lock applied to selection." });
            onClose();
          }}><i className="bi bi-snow me-1" />Freeze selection</button>
        </>
      }>
      <div className="pm-modal-body">
        <div className="pm-note mb-3"><i className="bi bi-shield-lock me-1" />Bulk freeze is designed for change freezes (release windows, audits, incidents). Locked settings keep serving their current values.</div>
        <label className="form-label">Freeze reason <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control mb-3" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Year-end change freeze Dec 24 – Jan 02" />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
    </Modal>
  );
}

/* ================================================================
   7. Products drawer (registry)
   ================================================================ */
export function ProductsDrawer({ products, settings, open, onClose, onOpen, onNew, onFreeze, onDelete, onEdit }: {
  products: Product[]; settings: Setting[]; open: boolean; onClose: () => void;
  onOpen: (p: Product) => void; onNew: () => void; onFreeze: (p: Product) => void; onDelete: (p: Product) => void; onEdit: (p: Product) => void;
}) {
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-collection" tone="green" title="Product registry"
      subtitle={`${products.length} config sets · ${settings.length} settings total`}
      footer={<button className="btn btn-primary btn-sm w-100" onClick={onNew}><i className="bi bi-plus-lg me-1" />New product config</button>}>
      {products.map((p) => {
        const rows = settings.filter((s) => s.productId === p.id);
        return (
          <div className="pm-card pm-card-pad mb-3" key={p.id} style={{ borderLeft: `3px solid ${p.color}` }}>
            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
              <span className="pm-avatar" style={{ background: `${p.color}1f`, color: p.color }}><i className={`bi ${p.icon}`} /></span>
              <span style={{ fontWeight: 700, fontSize: ".86rem" }}>{p.name}</span>
              <Badge tone={statusTone(p.status)} dot>{p.status}</Badge>
              <span className="ms-auto pm-td-sub mono">{rows.length} settings</span>
            </div>
            <div className="pm-td-sub mb-2">{p.description}</div>
            <div className="d-flex gap-1 flex-wrap">
              <button className="btn btn-sm btn-outline-primary" style={{ fontSize: ".66rem" }} onClick={() => onOpen(p)}>Open console</button>
              <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".66rem" }} onClick={() => onEdit(p)}>Details</button>
              <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".66rem" }} onClick={() => onFreeze(p)}>{p.status === "Frozen" ? "Unfreeze" : "Freeze"}</button>
              <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".66rem", color: "#b42318", borderColor: "#fbd3cf" }} onClick={() => onDelete(p)}>Delete</button>
            </div>
          </div>
        );
      })}
    </Drawer>
  );
}

/* ================================================================
   8. New product config wizard (4 steps)
   ================================================================ */
export function NewProductWizard({ open, onClose, onDone }: {
  open: boolean; onClose: () => void;
  onDone: (name: string, category: string, owner: string, template: string, env: string) => void;
}) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Payments");
  const [owner, setOwner] = useState("Product · P. Wanjiru");
  const [template, setTemplate] = useState("Blank");
  const [env, setEnv] = useState("staging");
  const [code, setCode] = useState("");
  useEffect(() => { setStep(0); setName(""); setCode(""); }, [open]);
  if (!open) return null;
  const valid = [name.trim().length >= 4, template.length > 0, !!env, code === CODE][step];
  return (
    <Modal open onClose={onClose} tone="green" icon="bi-plus-square" size="md" title="New product configuration"
      subtitle="Register a config set · template · first publish"
      footer={
        <>
          {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
          {step < 3 ? <button className="btn btn-primary btn-sm" disabled={!valid} onClick={() => setStep(step + 1)}>Continue<i className="bi bi-arrow-right ms-1" /></button> : (
            <button className="btn btn-primary btn-sm" disabled={!valid} onClick={() => {
              onDone(name.trim(), category, owner, template, env);
              push({ kind: "success", title: "Config set created", body: `${name.trim()} registered in ${env} from “${template}” template.` });
              onClose();
            }}><i className="bi bi-check2 me-1" />Create config set</button>
          )}
        </>
      }>
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
      <Steps current={step} steps={[{ label: "Product", icon: "bi-box" }, { label: "Template", icon: "bi-copy" }, { label: "Environment", icon: "bi-layers" }, { label: "Confirm", icon: "bi-shield-lock" }]} />
      <div className="pm-modal-body">
        {step === 0 && (
          <>
            <label className="form-label">Product name (min 4 chars) <span style={{ color: "#f04438" }}>*</span></label>
            <input className="form-control mb-3" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. School Fees Installments" />
            <div className="row g-2">
              <div className="col-6">
                <label className="form-label">Category</label>
                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {["Payments", "Cards", "Banking", "Utilities", "Remittance", "Savings", "Lending", "Business", "Insurance", "Wealth"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-6">
                <label className="form-label">Owner</label>
                <select className="form-select" value={owner} onChange={(e) => setOwner(e.target.value)}>
                  {["Product · P. Wanjiru", "Lending · C. Muthoni", "Cards · D. Kimani", "Savings · F. Hassan", "Banking · A. Otieno", "FX · S. Njoroge", "Business · R. Barasa"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <div className="pm-eyebrow mb-2">Start from a template</div>
            {[
              { id: "Blank", note: "Empty set — you define every setting" },
              { id: "Lending", note: "Amounts, pricing, eligibility gates, penalties" },
              { id: "Payments", note: "Per-txn + daily limits, fees, callbacks, retries" },
              { id: "Savings", note: "Interest, accrual, pockets, round-ups" },
            ].map((t) => (
              <button key={t.id} className={`pm-opt mb-2 ${template === t.id ? "active" : ""}`} onClick={() => setTemplate(t.id)}>
                <span className="r" />
                <span className="flex-grow-1"><b style={{ fontSize: ".85rem" }}>{t.id}</b><span className="d-block pm-td-sub">{t.note}</span></span>
              </button>
            ))}
          </>
        )}
        {step === 2 && (
          <>
            <div className="pm-eyebrow mb-2">First publish target</div>
            {ENVIRONMENTS.map((e) => (
              <button key={e.id} className={`pm-opt mb-2 ${env === e.id ? "active" : ""}`} disabled={e.id === "prod"} onClick={() => setEnv(e.id)}>
                <span className="r" />
                <span className="flex-grow-1"><b style={{ fontSize: ".85rem" }}>{e.name}{e.id === "prod" && " (blocked — needs QA first)"}</b><span className="d-block pm-td-sub">{e.note}</span></span>
                <Badge tone={e.id === "prod" ? "red" : e.id === "staging" ? "amber" : "blue"}>{e.id}</Badge>
              </button>
            ))}
          </>
        )}
        {step === 3 && (
          <>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">Product</span><span className="v">{name || "—"} · {category}</span></div>
              <div className="pm-kv"><span className="k">Owner</span><span className="v">{owner}</span></div>
              <div className="pm-kv"><span className="k">Template</span><span className="v">{template}</span></div>
              <div className="pm-kv"><span className="k">Publish to</span><span className="v">{ENVIRONMENTS.find((e) => e.id === env)?.name}</span></div>
            </div>
            <TwoFactorField value={code} onChange={setCode} />
          </>
        )}
      </div>
    </Modal>
  );
}

/* ================================================================
   9. Product freeze modal (whole config set)
   ================================================================ */
export function ProductFreezeModal({ product, settingCount, onClose, onDone }: { product: Product | null; settingCount: number; onClose: () => void; onDone: (id: string, freeze: boolean, reason: string) => void }) {
  const { push } = useToast();
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  useEffect(() => { setReason(""); setCode(""); }, [product?.id]);
  if (!product) return null;
  const freezing = product.status !== "Frozen";
  return (
    <Modal open onClose={onClose} tone={freezing ? "red" : "green"} icon={freezing ? "bi-snow2" : "bi-play-circle"} size="sm"
      title={`${freezing ? "Freeze" : "Unfreeze"} — ${product.name}`} subtitle={`${settingCount} settings · ${freezing ? "locks every setting in this set" : "restores edit flow"}`}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button className={`btn ${freezing ? "btn-danger" : "btn-primary"} btn-sm`} disabled={reason.trim().length < 8 || code !== CODE} onClick={() => {
            onDone(product.id, freezing, reason);
            push({ kind: freezing ? "warn" : "success", title: `${product.name} ${freezing ? "frozen" : "unfrozen"}`, body: freezing ? `${settingCount} settings edit-locked. Live values still apply.` : "Config set editable again." });
            onClose();
          }}><i className={`bi ${freezing ? "bi-snow" : "bi-play-fill"} me-1`} />{freezing ? "Freeze config set" : "Unfreeze config set"}</button>
        </>
      }>
      <div className="pm-modal-body">
        <div className="pm-alert-row warn mb-3">
          <i className="bi bi-exclamation-triangle-fill" style={{ color: "#f79009" }} />
          <div><b style={{ fontSize: ".8rem" }}>{freezing ? "Product-level freeze" : "Product-level unfreeze"}</b>
            <div className="pm-td-sub">{freezing ? "All settings in this set become read-only (overrides continue applying). Typical use: audit hold, partner dispute, incident." : "All settings become editable again through the normal approval flow."}</div></div>
        </div>
        <label className="form-label">Reason (min 8 chars) <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control mb-3" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
    </Modal>
  );
}

/* ================================================================
   10. Product details edit modal
   ================================================================ */
export function ProductEditModal({ product, onClose, onDone }: { product: Product | null; onClose: () => void; onDone: (id: string, owner: string, description: string, status: string) => void }) {
  const { push } = useToast();
  const [owner, setOwner] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Live");
  useEffect(() => { setOwner(product?.owner ?? ""); setDescription(product?.description ?? ""); setStatus(product?.status ?? "Live"); }, [product?.id]);
  if (!product) return null;
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-pencil-square" size="sm" title={`Details — ${product.name}`}
      subtitle={`${product.id} · registry record`}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" disabled={(owner === product.owner && description === product.description && status === product.status) || owner.trim().length < 3} onClick={() => {
            onDone(product.id, owner.trim(), description.trim(), status);
            push({ kind: "success", title: "Registry updated", body: `${product.name}: owner/status/description saved.` });
            onClose();
          }}><i className="bi bi-check2 me-1" />Save details</button>
        </>
      }>
      <div className="pm-modal-body">
        <label className="form-label">Owner <span style={{ color: "#f04438" }}>*</span></label>
        <input className="form-control mb-3" value={owner} onChange={(e) => setOwner(e.target.value)} />
        <label className="form-label">Lifecycle status</label>
        <select className="form-select mb-3" value={status} onChange={(e) => setStatus(e.target.value)}>
          {["Live", "Beta", "Frozen", "Draft"].map((s) => <option key={s}>{s}</option>)}
        </select>
        <label className="form-label">Description</label>
        <textarea className="form-control" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
    </Modal>
  );
}

/* ================================================================
   11. Overrides drawer
   ================================================================ */
export function OverridesDrawer({ overrides, open, onClose, onNew, onEdit, onExpire, onFreeze, onDuplicate, onDelete }: {
  overrides: Override[]; open: boolean; onClose: () => void;
  onNew: () => void; onEdit: (o: Override) => void; onExpire: (o: Override) => void; onFreeze: (o: Override) => void; onDuplicate: (o: Override) => void; onDelete: (o: Override) => void;
}) {
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-person-badge" tone="violet" title="Overrides console"
      subtitle={`${overrides.filter((o) => o.status === "Active").length} active · ${overrides.filter((o) => o.status === "Frozen").length} frozen · ${overrides.filter((o) => o.status === "Draft").length} draft`}
      footer={<div className="d-flex gap-2 w-100"><button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={onClose}>Close</button><button className="btn btn-primary btn-sm flex-grow-1" onClick={onNew}><i className="bi bi-plus-lg me-1" />New override</button></div>}>
      <div className="pm-table-wrap">
        <table className="pm-table">
          <thead><tr><th>Scope / target</th><th>Setting</th><th>Value</th><th>Affected</th><th>Status</th><th /></tr></thead>
          <tbody>
            {overrides.map((o) => (
              <tr key={o.id}>
                <td className="pm-td-strong">{o.target}<div className="pm-td-sub">{o.scope} · {o.id} · exp {o.expires}</div></td>
                <td className="pm-td-sub">{o.settingKey}<div className="pm-td-sub">{productName(o.productId)}</div></td>
                <td className="mono" style={{ fontWeight: 700 }}>{o.value}<div className="pm-td-sub mono">base {o.baseline}</div></td>
                <td className="mono pm-num">{o.affected.toLocaleString("en-KE")}</td>
                <td><Badge tone={statusTone(o.status)} dot>{o.status}</Badge></td>
                <td className="text-end text-nowrap">
                  <button className="btn btn-sm btn-outline-primary me-1" style={{ fontSize: ".62rem" }} onClick={() => onEdit(o)} disabled={o.status === "Expired"}>Edit</button>
                  <button className="btn btn-sm btn-outline-secondary me-1" style={{ fontSize: ".62rem" }} onClick={() => onFreeze(o)} disabled={o.status === "Expired"}>{o.status === "Frozen" ? "Unfreeze" : "Freeze"}</button>
                  <button className="btn btn-sm btn-outline-secondary me-1" style={{ fontSize: ".62rem" }} onClick={() => onExpire(o)} disabled={o.status === "Expired"}>Expire</button>
                  <button className="btn btn-sm btn-outline-secondary me-1" style={{ fontSize: ".62rem" }} onClick={() => onDuplicate(o)} title="Duplicate as draft">⧉</button>
                  <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".62rem", color: "#b42318", borderColor: "#fbd3cf" }} onClick={() => onDelete(o)}><i className="bi bi-trash3" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Drawer>
  );
}

/* ================================================================
   12. Override wizard (4 steps + 2FA)
   ================================================================ */
export function OverrideWizard({ open, products, settings, presets, onClose, onDone }: {
  open: boolean; products: Product[]; settings: Setting[]; presets: Override[];
  onClose: () => void;
  onDone: (o: Omit<Override, "id" | "created" | "createdBy" | "status" | "affected">, status: Override["status"]) => void;
}) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [scope, setScope] = useState<Override["scope"]>("Segment");
  const [target, setTarget] = useState("");
  const [productId, setProductId] = useState("");
  const [settingId, setSettingId] = useState("");
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const [expires, setExpires] = useState("Rolling");
  const [activate, setActivate] = useState(true);
  const [code, setCode] = useState("");
  useEffect(() => {
    setStep(0); setScope(presets[0]?.scope ?? "Segment"); setTarget(presets[0]?.target ?? "");
    setProductId(presets[0]?.productId ?? ""); setSettingId(""); setValue(presets[0]?.value ?? "");
    setNote(presets[0]?.note ?? ""); setExpires(presets[0]?.expires ?? "Rolling"); setActivate(true); setCode("");
  }, [open]);
  if (!open) return null;
  const productSettings = settings.filter((s) => s.productId === productId && s.editable);
  const chosen = settings.find((s) => s.id === settingId);
  const valid = [target.trim().length >= 3, !!settingId, value.trim().length > 0 && note.trim().length >= 8, code === CODE][step];
  return (
    <Modal open onClose={onClose} tone="violet" icon="bi-person-badge" size="md" title="New override"
      subtitle="Segment · tier · user · merchant — bend one setting for one audience"
      footer={
        <>
          {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
          {step < 3 ? <button className="btn btn-primary btn-sm" disabled={!valid} onClick={() => setStep(step + 1)}>Continue<i className="bi bi-arrow-right ms-1" /></button> : (
            <button className="btn btn-primary btn-sm" disabled={!valid} onClick={() => {
              onDone({ scope, target: target.trim(), productId, settingKey: chosen?.key ?? "", value: value.trim(), baseline: chosen?.value ?? "", note: note.trim(), expires }, activate ? "Active" : "Draft");
              push({ kind: "success", title: activate ? "Override activated" : "Override drafted", body: `${target.trim()} → ${chosen?.key} = ${value.trim()}.` });
              onClose();
            }}><i className="bi bi-check2 me-1" />{activate ? "Create & activate" : "Create draft"}</button>
          )}
        </>
      }>
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
      <Steps current={step} steps={[{ label: "Audience", icon: "bi-people" }, { label: "Setting", icon: "bi-sliders" }, { label: "Value & note", icon: "bi-123" }, { label: "Confirm", icon: "bi-shield-lock" }]} />
      <div className="pm-modal-body">
        {step === 0 && (
          <>
            <div className="pm-eyebrow mb-2">Override scope</div>
            <div className="d-flex gap-1 mb-3 flex-wrap">
              {(["Segment", "Tier", "User", "Merchant"] as const).map((s) => (
                <button key={s} className={`pm-chip ${scope === s ? "active" : ""}`} onClick={() => setScope(s)}>{s}</button>
              ))}
            </div>
            <label className="form-label">{scope} target <span style={{ color: "#f04438" }}>*</span></label>
            <input className="form-control mb-1" value={target} onChange={(e) => setTarget(e.target.value)} placeholder={scope === "User" ? "U-84920 · Amina H." : scope === "Merchant" ? "M-2201 · Webshop ke" : scope === "Tier" ? "VIP" : "Farmers (seasonal)"} />
            <div className="pm-td-sub">Search existing {scope.toLowerCase()}s from the directory (pages 4–6, 26) before creating.</div>
          </>
        )}
        {step === 1 && (
          <>
            <label className="form-label">Product</label>
            <select className="form-select mb-3" value={productId} onChange={(e) => { setProductId(e.target.value); setSettingId(""); }}>
              <option value="">Select product…</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <label className="form-label">Setting</label>
            <select className="form-select mb-3" value={settingId} onChange={(e) => setSettingId(e.target.value)} disabled={!productId}>
              <option value="">Select setting…</option>
              {productSettings.map((s) => <option key={s.id} value={s.id}>{s.key} (base {s.value})</option>)}
            </select>
            {chosen && <div className="pm-note mb-0">Baseline <b className="mono">{chosen.value}</b> · range {chosen.min ?? "—"} → {chosen.max ?? "—"} · overrides outside range need Risk sign-off at approval.</div>}
          </>
        )}
        {step === 2 && (
          <>
            <label className="form-label">Override value <span style={{ color: "#f04438" }}>*</span></label>
            <input className="form-control mb-3 mono" value={value} onChange={(e) => setValue(e.target.value)} placeholder={chosen?.value ?? "e.g. KES 700,000"} />
            <div className="row g-2 mb-3">
              <div className="col-7">
                <label className="form-label">Expires</label>
                <select className="form-select" value={expires} onChange={(e) => setExpires(e.target.value)}>
                  {["Rolling", "Nov 2026", "Dec 2026", "Q1 2027", "Custom date"].map((x) => <option key={x}>{x}</option>)}
                </select>
              </div>
              <div className="col-5 d-flex align-items-end">
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" id="ovrActivate" checked={activate} onChange={(e) => setActivate(e.target.checked)} />
                  <label className="form-check-label" htmlFor="ovrActivate" style={{ fontSize: ".8rem" }}>Activate now</label>
                </div>
              </div>
            </div>
            <label className="form-label">Justification note (min 8 chars) <span style={{ color: "#f04438" }}>*</span></label>
            <textarea className="form-control" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Why does this audience get a different value?" />
          </>
        )}
        {step === 3 && (
          <>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">Audience</span><span className="v">{scope} · {target}</span></div>
              <div className="pm-kv"><span className="k">Setting</span><span className="v">{productName(productId)} · {chosen?.key}</span></div>
              <div className="pm-kv"><span className="k">Baseline → override</span><span className="v mono">{chosen?.value} → {value}</span></div>
              <div className="pm-kv"><span className="k">Expires</span><span className="v">{expires}</span></div>
              <div className="pm-kv"><span className="k">Note</span><span className="v" style={{ maxWidth: 260, whiteSpace: "normal" }}>{note}</span></div>
            </div>
            <TwoFactorField value={code} onChange={setCode} />
          </>
        )}
      </div>
    </Modal>
  );
}

/* ================================================================
   13. Override edit modal
   ================================================================ */
export function OverrideEditModal({ override, onClose, onDone }: { override: Override | null; onClose: () => void; onDone: (id: string, value: string, expires: string, note: string) => void }) {
  const { push } = useToast();
  const [value, setValue] = useState("");
  const [expires, setExpires] = useState("");
  const [note, setNote] = useState("");
  useEffect(() => { setValue(override?.value ?? ""); setExpires(override?.expires ?? ""); setNote(override?.note ?? ""); }, [override?.id]);
  if (!override) return null;
  return (
    <Modal open onClose={onClose} tone="violet" icon="bi-pencil-square" size="sm" title={`Edit override — ${override.target}`}
      subtitle={`${override.id} · ${override.settingKey} · base ${override.baseline}`}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" disabled={(value === override.value && expires === override.expires && note === override.note) || !value.trim()} onClick={() => {
            onDone(override.id, value.trim(), expires, note.trim());
            push({ kind: "success", title: "Override updated", body: `${override.target}: ${override.value} → ${value.trim()}.` });
            onClose();
          }}><i className="bi bi-check2 me-1" />Save override</button>
        </>
      }>
      <div className="pm-modal-body">
        <label className="form-label">Value <span style={{ color: "#f04438" }}>*</span></label>
        <input className="form-control mb-3 mono" value={value} onChange={(e) => setValue(e.target.value)} />
        <label className="form-label">Expires</label>
        <select className="form-select mb-3" value={expires} onChange={(e) => setExpires(e.target.value)}>
          {["Rolling", "Nov 2026", "Dec 2026", "Q1 2027", "Custom date", ...(!["Rolling", "Nov 2026", "Dec 2026", "Q1 2027", "Custom date"].includes(expires) ? [expires] : [])].filter((v, i, a) => a.indexOf(v) === i).map((x) => <option key={x}>{x}</option>)}
        </select>
        <label className="form-label">Justification note</label>
        <textarea className="form-control" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        <div className="pm-note mt-3 mb-0"><i className="bi bi-people me-1" />{override.affected.toLocaleString("en-KE")} accounts currently receive this value.</div>
      </div>
    </Modal>
  );
}

/* ================================================================
   14. Override quick action modal (expire / freeze / duplicate)
   ================================================================ */
export function OverrideActionModal({ override, action, onClose, onDone }: {
  override: Override | null; action: "expire" | "freeze" | "unfreeze" | "duplicate" | null;
  onClose: () => void; onDone: (id: string, action: "expire" | "freeze" | "unfreeze" | "duplicate") => void;
}) {
  const { push } = useToast();
  const [reason, setReason] = useState("");
  useEffect(() => { setReason(""); }, [override?.id, action]);
  if (!override || !action) return null;
  const meta = {
    expire: { title: "Expire override", tone: "amber" as const, icon: "bi-hourglass-bottom", btn: "Expire now", note: "Target audience falls back to the baseline value at once. Audit entry retained." },
    freeze: { title: "Freeze override", tone: "red" as const, icon: "bi-snow", btn: "Freeze", note: "Frozen overrides keep applying their value but can't be edited or extended." },
    unfreeze: { title: "Unfreeze override", tone: "green" as const, icon: "bi-play-fill", btn: "Unfreeze", note: "Restores edit and expiry management." },
    duplicate: { title: "Duplicate as draft", tone: "blue" as const, icon: "bi-copy", btn: "Create draft copy", note: "Copies audience, setting and value into a new DRAFT you can retarget." },
  }[action];
  return (
    <Modal open onClose={onClose} tone={meta.tone} icon={meta.icon} size="sm" title={meta.title}
      subtitle={`${override.id} · ${override.target} · ${override.settingKey}`}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button className={`btn ${action === "freeze" ? "btn-danger" : "btn-primary"} btn-sm`} disabled={action !== "duplicate" && reason.trim().length < 6} onClick={() => {
            onDone(override.id, action);
            push({ kind: action === "expire" ? "warn" : "success", title: `${meta.title} — done`, body: `${override.target} · ${override.settingKey}.` });
            onClose();
          }}><i className={`bi ${meta.icon} me-1`} />{meta.btn}</button>
        </>
      }>
      <div className="pm-modal-body">
        <div className="pm-note mb-3"><i className="bi bi-info-circle me-1" />{meta.note}</div>
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Value</span><span className="v mono">{override.value} (base {override.baseline})</span></div>
          <div className="pm-kv"><span className="k">Affected</span><span className="v mono">{override.affected.toLocaleString("en-KE")}</span></div>
          <div className="pm-kv"><span className="k">Expires</span><span className="v mono">{override.expires}</span></div>
        </div>
        {action !== "duplicate" && (
          <>
            <label className="form-label">Reason <span style={{ color: "#f04438" }}>*</span></label>
            <textarea className="form-control" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
          </>
        )}
      </div>
    </Modal>
  );
}

/* ================================================================
   15. Rules drawer
   ================================================================ */
export function RulesDrawer({ rules, open, onClose, onNew, onEdit, onToggle, onTest, onDuplicate, onDelete }: {
  rules: Rule[]; open: boolean; onClose: () => void;
  onNew: () => void; onEdit: (r: Rule) => void; onToggle: (r: Rule) => void; onTest: (r: Rule) => void; onDuplicate: (r: Rule) => void; onDelete: (r: Rule) => void;
}) {
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-lightning-charge" tone="blue" title="Behaviour rules engine"
      subtitle={`${rules.filter((r) => r.enabled).length} of ${rules.length} enabled · ${rules.reduce((a, r) => a + r.hits30d, 0).toLocaleString("en-KE")} triggers in 30 days`}
      footer={<div className="d-flex gap-2 w-100"><button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={onClose}>Close</button><button className="btn btn-primary btn-sm flex-grow-1" onClick={onNew}><i className="bi bi-plus-lg me-1" />New rule</button></div>}>
      {rules.map((r) => (
        <div className="pm-card pm-card-pad mb-3" key={r.id} style={{ opacity: r.enabled ? 1 : 0.62, borderLeft: `3px solid ${r.productId === "all" ? "#101828" : productColor(r.productId)}` }}>
          <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
            <Badge tone={r.kind === "Blocklist" ? "red" : r.kind === "Velocity" ? "amber" : r.kind === "Automation" ? "green" : "blue"}>{r.kind}</Badge>
            <span style={{ fontWeight: 700, fontSize: ".84rem" }}>{r.name}</span>
            <Badge tone={r.enabled ? "green" : "grey"} dot>{r.enabled ? "Enabled" : "Disabled"}</Badge>
            <span className="ms-auto pm-td-sub mono">P{r.priority}</span>
          </div>
          <div className="pm-td-sub mb-2">
            <i className="bi bi-broadcast me-1" style={{ color: "#175cd3" }} />{r.trigger}
            <i className="bi bi-arrow-return-right mx-2" />{r.action}
            <div className="mt-1 mono" style={{ fontSize: ".68rem" }}>{r.id} · {r.productId === "all" ? "Platform-wide" : productName(r.productId)} · {r.scope} · {r.hits30d.toLocaleString("en-KE")} hits · last {r.lastHit}</div>
          </div>
          <div className="d-flex gap-1 flex-wrap">
            <button className="btn btn-sm btn-outline-primary" style={{ fontSize: ".64rem" }} onClick={() => onEdit(r)}>Edit</button>
            <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".64rem" }} onClick={() => onToggle(r)}>{r.enabled ? "Disable" : "Enable"}</button>
            <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".64rem" }} onClick={() => onTest(r)}><i className="bi bi-play-circle me-1" />Test</button>
            <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".64rem" }} onClick={() => onDuplicate(r)} title="Duplicate">⧉</button>
            <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".64rem", color: "#b42318", borderColor: "#fbd3cf" }} onClick={() => onDelete(r)}><i className="bi bi-trash3" /></button>
          </div>
        </div>
      ))}
    </Drawer>
  );
}

/* ================================================================
   16. Rule wizard (4 steps)
   ================================================================ */
export function RuleWizard({ open, products, onClose, onDone }: {
  open: boolean; products: Product[];
  onClose: () => void;
  onDone: (r: { name: string; kind: Rule["kind"]; productId: string; trigger: string; action: string; scope: string; priority: number; enabled: boolean }) => void;
}) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<Rule["kind"]>("Velocity");
  const [productId, setProductId] = useState("all");
  const [trigger, setTrigger] = useState("");
  const [threshold, setThreshold] = useState("5");
  const [window_, setWindow] = useState("hour");
  const [action, setAction] = useState("Require OTP step-up");
  const [scope, setScope] = useState("All users");
  const [priority, setPriority] = useState(60);
  const [enable, setEnable] = useState(true);
  const [code, setCode] = useState("");
  useEffect(() => { setStep(0); setName(""); setTrigger(""); setCode(""); }, [open]);
  if (!open) return null;
  const valid = [name.trim().length >= 4 && trigger.trim().length >= 6, action.trim().length >= 4, scope.trim().length >= 3, code === CODE][step];
  const builtTrigger = kind === "Velocity" ? `> ${threshold} txns / ${window_} / user` : trigger;
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-lightning-charge" size="md" title="New behaviour rule"
      subtitle="Trigger → action · evaluated in priority order per transaction"
      footer={
        <>
          {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
          {step < 3 ? <button className="btn btn-primary btn-sm" disabled={!valid} onClick={() => setStep(step + 1)}>Continue<i className="bi bi-arrow-right ms-1" /></button> : (
            <button className="btn btn-primary btn-sm" disabled={!valid} onClick={() => {
              onDone({ name: name.trim(), kind, productId, trigger: builtTrigger, action: action.trim(), scope: scope.trim(), priority, enabled: enable });
              push({ kind: "success", title: `Rule ${enable ? "created & enabled" : "created as draft"}`, body: `${name.trim()} · ${builtTrigger}.` });
              onClose();
            }}><i className="bi bi-check2 me-1" />Create rule</button>
          )}
        </>
      }>
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
      <Steps current={step} steps={[{ label: "Trigger", icon: "bi-broadcast" }, { label: "Action", icon: "bi-gear" }, { label: "Scope", icon: "bi-people" }, { label: "Confirm", icon: "bi-shield-lock" }]} />
      <div className="pm-modal-body">
        {step === 0 && (
          <>
            <label className="form-label">Rule name (min 4 chars) <span style={{ color: "#f04438" }}>*</span></label>
            <input className="form-control mb-3" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Night-time transfer step-up" />
            <div className="pm-eyebrow mb-2">Kind</div>
            <div className="d-flex gap-1 mb-3 flex-wrap">
              {(["Velocity", "Cool-off", "Blocklist", "Limit", "Automation"] as const).map((k) => (
                <button key={k} className={`pm-chip ${kind === k ? "active" : ""}`} onClick={() => setKind(k)}>{k}</button>
              ))}
            </div>
            {kind === "Velocity" ? (
              <div className="row g-2 mb-3">
                <div className="col-5">
                  <label className="form-label">Threshold</label>
                  <input className="form-control mono" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
                </div>
                <div className="col-7">
                  <label className="form-label">Per</label>
                  <select className="form-select" value={window_} onChange={(e) => setWindow(e.target.value)}>
                    {["minute", "hour", "day", "week"].map((w) => <option key={w}>{w}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <>
                <label className="form-label">Trigger condition (min 6 chars) <span style={{ color: "#f04438" }}>*</span></label>
                <input className="form-control" value={trigger} onChange={(e) => setTrigger(e.target.value)} placeholder="e.g. Login from new country" />
              </>
            )}
            <label className="form-label">Product scope</label>
            <select className="form-select" value={productId} onChange={(e) => setProductId(e.target.value)}>
              <option value="all">Platform-wide (all products)</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </>
        )}
        {step === 1 && (
          <>
            <label className="form-label">Action when triggered <span style={{ color: "#f04438" }}>*</span></label>
            <select className="form-select mb-3" value={action} onChange={(e) => setAction(e.target.value)}>
              {["Require OTP step-up", "Block transfers for 30 minutes", "Decline transaction", "Route to manual review", "Freeze card + create case", "Hold request 24h", "Prompt user confirmation", "Notify user only"].map((a) => <option key={a}>{a}</option>)}
            </select>
            <div className="pm-note mb-0"><i className="bi bi-exclamation-triangle me-1" />Blocking actions at priority ≥ 90 bypass user confirmation — Risk signs off at approval.</div>
          </>
        )}
        {step === 2 && (
          <>
            <label className="form-label">Audience scope</label>
            <select className="form-select mb-3" value={scope} onChange={(e) => setScope(e.target.value)}>
              {["All users", "New users (< 30 days)", "VIP tier", "Business tier", "Under-21 cards", "Staff accounts"].map((s) => <option key={s}>{s}</option>)}
            </select>
            <div className="pm-card pm-card-pad mb-3">
              <div className="d-flex justify-content-between mb-1"><span className="pm-eyebrow mb-0">Priority</span><span className="mono" style={{ fontWeight: 800 }}>{priority}</span></div>
              <input type="range" className="form-range" min={10} max={99} step={1} value={priority} onChange={(e) => setPriority(Number(e.target.value))} />
              <div className="pm-td-sub">{priority >= 90 ? "Critical — evaluated first, bypasses confirmations" : priority >= 60 ? "High — standard enforcement" : "Low — advisory / nudges"}</div>
            </div>
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" id="ruleEnable" checked={enable} onChange={(e) => setEnable(e.target.checked)} />
              <label className="form-check-label" htmlFor="ruleEnable" style={{ fontSize: ".8rem" }}>Enable immediately (else created as draft)</label>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">Rule</span><span className="v">{name}</span></div>
              <div className="pm-kv"><span className="k">Kind · product</span><span className="v">{kind} · {productId === "all" ? "Platform-wide" : productName(productId)}</span></div>
              <div className="pm-kv"><span className="k">Trigger</span><span className="v mono">{builtTrigger}</span></div>
              <div className="pm-kv"><span className="k">Action</span><span className="v">{action}</span></div>
              <div className="pm-kv"><span className="k">Scope · priority</span><span className="v">{scope} · P{priority}</span></div>
              <div className="pm-kv"><span className="k">State</span><span className="v"><Badge tone={enable ? "green" : "grey"} dot>{enable ? "Enabled on create" : "Draft"}</Badge></span></div>
            </div>
            <TwoFactorField value={code} onChange={setCode} />
          </>
        )}
      </div>
    </Modal>
  );
}

/* ================================================================
   17. Rule edit modal
   ================================================================ */
export function RuleEditModal({ rule, onClose, onDone }: { rule: Rule | null; onClose: () => void; onDone: (id: string, trigger: string, action: string, priority: number) => void }) {
  const { push } = useToast();
  const [trigger, setTrigger] = useState("");
  const [action, setAction] = useState("");
  const [priority, setPriority] = useState(50);
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  useEffect(() => { setTrigger(rule?.trigger ?? ""); setAction(rule?.action ?? ""); setPriority(rule?.priority ?? 50); setReason(""); setCode(""); }, [rule?.id]);
  if (!rule) return null;
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-pencil-square" size="sm" title={`Edit rule — ${rule.name}`}
      subtitle={`${rule.id} · ${rule.kind} · ${rule.hits30d.toLocaleString("en-KE")} hits in 30d`}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" disabled={(trigger === rule.trigger && action === rule.action && priority === rule.priority) || reason.trim().length < 8 || code !== CODE} onClick={() => {
            onDone(rule.id, trigger.trim(), action.trim(), priority);
            push({ kind: "success", title: "Rule updated", body: `${rule.name} · now “${trigger.trim()}”.` });
            onClose();
          }}><i className="bi bi-check2 me-1" />Save rule</button>
        </>
      }>
      <div className="pm-modal-body">
        <label className="form-label">Trigger</label>
        <input className="form-control mb-3 mono" value={trigger} onChange={(e) => setTrigger(e.target.value)} />
        <label className="form-label">Action</label>
        <select className="form-select mb-3" value={action} onChange={(e) => setAction(e.target.value)}>
          {["Require OTP step-up", "Block transfers for 30 minutes", "Decline transaction", "Route to manual review", "Freeze card + create case", "Hold request 24h", "Pause auto-pay until user confirms", "Prompt opt-in sweep", "Retry once next day", ...(!["Require OTP step-up", "Block transfers for 30 minutes", "Decline transaction", "Route to manual review", "Freeze card + create case", "Hold request 24h", "Pause auto-pay until user confirms", "Prompt opt-in sweep", "Retry once next day"].includes(action) ? [action] : [])].filter((v, i, a) => a.indexOf(v) === i).map((a) => <option key={a}>{a}</option>)}
        </select>
        <div className="pm-card pm-card-pad mb-3">
          <div className="d-flex justify-content-between mb-1"><span className="pm-eyebrow mb-0">Priority</span><span className="mono" style={{ fontWeight: 800 }}>{priority}</span></div>
          <input type="range" className="form-range" min={10} max={99} value={priority} onChange={(e) => setPriority(Number(e.target.value))} />
        </div>
        <label className="form-label">Reason (min 8 chars) <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control mb-3" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
    </Modal>
  );
}

/* ================================================================
   18. Rule toggle confirm modal
   ================================================================ */
export function RuleToggleModal({ rule, onClose, onDone }: { rule: Rule | null; onClose: () => void; onDone: (id: string, enable: boolean, reason: string) => void }) {
  const { push } = useToast();
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  useEffect(() => { setReason(""); setCode(""); }, [rule?.id]);
  if (!rule) return null;
  const enabling = !rule.enabled;
  return (
    <Modal open onClose={onClose} tone={enabling ? "green" : "amber"} icon={enabling ? "bi-toggle-on" : "bi-toggle-off"} size="sm"
      title={`${enabling ? "Enable" : "Disable"} — ${rule.name}`} subtitle={`${rule.id} · ${rule.hits30d.toLocaleString("en-KE")} hits in 30d · last ${rule.lastHit}`}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button className={`btn ${enabling ? "btn-primary" : "btn-warning"} btn-sm`} disabled={reason.trim().length < 8 || code !== CODE} onClick={() => {
            onDone(rule.id, enabling, reason);
            push({ kind: enabling ? "success" : "warn", title: `${rule.name} ${enabling ? "enabled" : "disabled"}`, body: enabling ? "Rule now evaluates on every matching transaction." : "Rule stops evaluating immediately — audit note recorded." });
            onClose();
          }}><i className={`bi ${enabling ? "bi-toggle-on" : "bi-toggle-off"} me-1`} />{enabling ? "Enable rule" : "Disable rule"}</button>
        </>
      }>
      <div className="pm-modal-body">
        <div className="pm-alert-row warn mb-3">
          <i className="bi bi-exclamation-triangle-fill" style={{ color: "#f79009" }} />
          <div><b style={{ fontSize: ".8rem" }}>{rule.kind} rule · priority {rule.priority}</b>
            <div className="pm-td-sub">{enabling ? "Enabling starts live enforcement on matching traffic immediately." : "Disabling removes this control from live traffic — Risk will see the audit note."}</div></div>
        </div>
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Trigger</span><span className="v mono" style={{ fontSize: ".72rem" }}>{rule.trigger}</span></div>
          <div className="pm-kv"><span className="k">Action</span><span className="v" style={{ fontSize: ".74rem" }}>{rule.action}</span></div>
        </div>
        <label className="form-label">Reason (min 8 chars) <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control mb-3" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
    </Modal>
  );
}

/* ================================================================
   19. Rule test bench modal (simulator)
   ================================================================ */
export function RuleTestModal({ rule, onClose }: { rule: Rule | null; onClose: () => void }) {
  const [volume, setVolume] = useState(12);
  const [ran, setRan] = useState(false);
  useEffect(() => { setRan(false); setVolume(12); }, [rule?.id]);
  if (!rule) return null;
  const fires = rule.kind === "Velocity" ? volume >= 10 : rule.enabled;
  const affected = Math.round(volume * 820 * (rule.kind === "Velocity" ? 0.18 : 0.04));
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-play-circle" size="md" title={`Test bench — ${rule.name}`}
      subtitle={`${rule.id} · dry-run against yesterday's traffic shape · no users affected`}
      footer={<button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Trigger</span><span className="v mono" style={{ fontSize: ".72rem" }}>{rule.trigger}</span></div>
          <div className="pm-kv"><span className="k">Action</span><span className="v" style={{ fontSize: ".74rem" }}>{rule.action}</span></div>
          <div className="pm-kv"><span className="k">State</span><span className="v"><Badge tone={rule.enabled ? "green" : "grey"} dot>{rule.enabled ? "Enabled" : "Disabled"}</Badge></span></div>
        </div>
        {rule.kind === "Velocity" && (
          <div className="pm-card pm-card-pad mb-3">
            <div className="d-flex justify-content-between mb-1"><span className="pm-eyebrow mb-0">Simulated txn volume / hour</span><span className="mono" style={{ fontWeight: 800 }}>{volume}</span></div>
            <input type="range" className="form-range" min={1} max={30} value={volume} onChange={(e) => { setVolume(Number(e.target.value)); setRan(false); }} />
          </div>
        )}
        <button className="btn btn-outline-primary btn-sm mb-3" onClick={() => setRan(true)}><i className="bi bi-play-fill me-1" />Run dry simulation</button>
        {ran ? (
          <div className={fires ? "pm-alert-row warn" : "pm-alert-row info"} style={{ border: "1px solid var(--pm-border)" }}>
            <i className={`bi ${fires ? "bi-lightning-charge-fill" : "bi-check-circle-fill"}`} style={{ color: fires ? "#f79009" : "#12b76a" }} />
            <div>
              <b style={{ fontSize: ".8rem" }}>{fires ? "Rule would FIRE" : "Rule would NOT fire"}</b>
              <div className="pm-td-sub">
                {fires
                  ? `≈ ${affected.toLocaleString("en-KE")} txns/day would hit “${rule.action}”. Review ops load before enabling.`
                  : "No matching traffic under these conditions — rule stays silent."}
              </div>
            </div>
          </div>
        ) : <div className="pm-note mb-0">Adjust the inputs and run — results estimate daily match volume from the last 24h traffic distribution.</div>}
      </div>
    </Modal>
  );
}

/* ================================================================
   20. Environments drawer
   ================================================================ */
export function EnvironmentsDrawer({ environments, drift, open, onClose, onDrift, onPromote }: {
  environments: Environment[]; drift: Setting[]; open: boolean; onClose: () => void;
  onDrift: (s: Setting) => void; onPromote: () => void;
}) {
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-layers" tone="amber" title="Environments & publish"
      subtitle="sandbox → staging → production · approve + publish window"
      footer={<button className="btn btn-primary btn-sm w-100" onClick={onPromote} disabled={drift.length === 0}><i className="bi bi-rocket-takeoff me-1" />Promote staging → production ({drift.length})</button>}>
      {environments.map((e) => (
        <div className="pm-card pm-card-pad mb-3" key={e.id} style={{ borderLeft: `3px solid ${e.id === "prod" ? "#12b76a" : e.id === "staging" ? "#f79009" : "#2e90fa"}` }}>
          <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
            <span style={{ fontWeight: 700, fontSize: ".86rem" }}>{e.name}</span>
            {e.locked && <Badge tone="red" dot>locked</Badge>}
            {e.autoSync && <Badge tone="blue">auto-sync</Badge>}
            {e.id === "prod" && <Badge tone="green" dot>1.02M users</Badge>}
            <span className="ms-auto pm-td-sub mono">{e.lastPublish} · {e.publishedBy}</span>
          </div>
          <div className="pm-td-sub mb-2">{e.note}</div>
          {e.id === "staging" && drift.length > 0 && (
            <div className="pm-alert-row warn">
              <i className="bi bi-arrow-left-right" style={{ color: "#f79009" }} />
              <div className="flex-grow-1"><b style={{ fontSize: ".78rem" }}>{drift.length} settings differ from production</b>
                <div className="pm-td-sub">{drift.slice(0, 3).map((s) => s.key).join(" · ")}{drift.length > 3 ? ` · +${drift.length - 3} more` : ""}</div>
              </div>
              <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".64rem" }} onClick={() => onDrift(drift[0])}>Review</button>
            </div>
          )}
        </div>
      ))}
    </Drawer>
  );
}

/* ================================================================
   21. Drift detail modal
   ================================================================ */
export function DriftModal({ setting, onClose, onSync, onAllDrift }: { setting: Setting | null; onClose: () => void; onSync: (id: string) => void; onAllDrift: () => void }) {
  if (!setting) return null;
  return (
    <Modal open onClose={onClose} tone="amber" icon="bi-arrow-left-right" size="md" title="Environment drift"
      subtitle={`${setting.key} · ${productName(setting.productId)}`}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={onAllDrift}>All drifted settings</button>
          <button className="btn btn-primary btn-sm" onClick={() => { onSync(setting.id); onClose(); }}><i className="bi bi-arrow-down-up me-1" />Sync staging → prod value</button>
        </>
      }>
      <div className="pm-modal-body">
        <div className="row g-2 mb-3">
          <div className="col-6">
            <div className="pm-stat" style={{ borderLeft: "3px solid #12b76a" }}>
              <span className="pm-stat-label">Production</span>
              <span className="pm-stat-value" style={{ fontSize: "1rem" }}>{setting.value}</span>
              <span className="pm-stat-foot">live to users since {setting.changed}</span>
            </div>
          </div>
          <div className="col-6">
            <div className="pm-stat" style={{ borderLeft: "3px solid #f79009" }}>
              <span className="pm-stat-label">Staging</span>
              <span className="pm-stat-value" style={{ fontSize: "1rem" }}>{setting.drift}</span>
              <span className="pm-stat-foot">awaiting promote</span>
            </div>
          </div>
        </div>
        <div className="pm-note"><i className="bi bi-info-circle me-1" />Syncing adopts the staging value into a change request (Low risk) — it still needs approval before production publish.</div>
      </div>
    </Modal>
  );
}

/* ================================================================
   22. Promote wizard (staging → production, 4 steps)
   ================================================================ */
export function PromoteWizard({ open, drift, onClose, onDone }: {
  open: boolean; drift: Setting[];
  onClose: () => void;
  onDone: (window: string, notifyPartners: boolean) => void;
}) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [window_, setWindow] = useState("Tonight 22:00 EAT");
  const [notifyPartners, setNotifyPartners] = useState(true);
  const [code, setCode] = useState("");
  useEffect(() => { setStep(0); setPicked(drift.map((d) => d.id)); setCode(""); }, [open]);
  if (!open) return null;
  const chosen = drift.filter((d) => picked.includes(d.id));
  const valid = [picked.length > 0, true, true, code === CODE][step];
  return (
    <Modal open onClose={onClose} tone="green" icon="bi-rocket-takeoff" size="md" title="Promote staging → production"
      subtitle={`${drift.length} drifted settings · approval-gated release`}
      footer={
        <>
          {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
          {step < 3 ? <button className="btn btn-primary btn-sm" disabled={!valid} onClick={() => setStep(step + 1)}>Continue<i className="bi bi-arrow-right ms-1" /></button> : (
            <button className="btn btn-primary btn-sm" disabled={!valid} onClick={() => {
              onDone(window_, notifyPartners);
              push({ kind: "success", title: "Release scheduled", body: `${chosen.length} settings · ${window_} · change-freeze auto-applies 30 min before.` });
              onClose();
            }}><i className="bi bi-rocket-takeoff me-1" />Schedule release</button>
          )}
        </>
      }>
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
      <Steps current={step} steps={[{ label: "Changes", icon: "bi-list-check" }, { label: "Impact", icon: "bi-activity" }, { label: "Window", icon: "bi-clock" }, { label: "Confirm", icon: "bi-shield-lock" }]} />
      <div className="pm-modal-body">
        {step === 0 && (
          <>
            <div className="pm-eyebrow mb-2">Drifted settings to release</div>
            {drift.map((d) => (
              <button key={d.id} className={`pm-opt mb-2 ${picked.includes(d.id) ? "active" : ""}`} onClick={() => setPicked((p) => (p.includes(d.id) ? p.filter((x) => x !== d.id) : [...p, d.id]))}>
                <span className="r" />
                <span className="flex-grow-1">
                  <b style={{ fontSize: ".83rem" }}>{d.key}</b>
                  <span className="d-block pm-td-sub mono">{productName(d.productId)} · {d.value} → {d.drift}</span>
                </span>
              </button>
            ))}
          </>
        )}
        {step === 1 && (
          <>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">Settings in release</span><span className="v mono">{chosen.length}</span></div>
              <div className="pm-kv"><span className="k">Products touched</span><span className="v">{[...new Set(chosen.map((c) => productName(c.productId)))].join(", ") || "—"}</span></div>
              <div className="pm-kv"><span className="k">Users affected</span><span className="v mono">1.02M (all)</span></div>
              <div className="pm-kv"><span className="k">Rollback plan</span><span className="v mono">auto · v{VERSIONS.find((v) => v.current)?.id}</span></div>
            </div>
            <div className="pm-alert-row info" style={{ border: "1px solid var(--pm-border)" }}>
              <i className="bi bi-shield-check" style={{ color: "#175cd3" }} />
              <div className="pm-td-sub mb-0">Every setting in this release already passed Risk/Product approvals in staging. The release is atomic — all-or-nothing.</div>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <label className="form-label">Publish window</label>
            <select className="form-select mb-3" value={window_} onChange={(e) => setWindow(e.target.value)}>
              {["Tonight 22:00 EAT", "Tomorrow 06:00 EAT", "Saturday 02:00 EAT", "Immediate (emergency)"].map((w) => <option key={w}>{w}</option>)}
            </select>
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" id="promoteNotify" checked={notifyPartners} onChange={(e) => setNotifyPartners(e.target.checked)} />
              <label className="form-check-label" htmlFor="promoteNotify" style={{ fontSize: ".82rem" }}>Notify integration partners (webhook + email) 30 min before</label>
            </div>
            <div className="pm-note mt-3"><i className="bi bi-clock-history me-1" />A change-freeze applies automatically 30 minutes before the window and lifts after smoke tests pass.</div>
          </>
        )}
        {step === 3 && (
          <>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">Release</span><span className="v mono">{chosen.length} settings · v3.15.0</span></div>
              <div className="pm-kv"><span className="k">Window</span><span className="v">{window_}</span></div>
              <div className="pm-kv"><span className="k">Partner notice</span><span className="v">{notifyPartners ? "Yes" : "No"}</span></div>
            </div>
            <TwoFactorField value={code} onChange={setCode} />
          </>
        )}
      </div>
    </Modal>
  );
}

/* ================================================================
   23. Versions drawer
   ================================================================ */
export function VersionsDrawer({ versions, open, onClose, onDiff, onRollback }: {
  versions: ConfigVersion[]; open: boolean; onClose: () => void;
  onDiff: (v: ConfigVersion) => void; onRollback: (v: ConfigVersion) => void;
}) {
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-clock-history" tone="ink" title="Version history"
      subtitle="Every production publish is versioned · 1-click rollback"
      footer={<div className="pm-note w-100 mb-0"><i className="bi bi-shield-lock me-1" />Rollback re-applies the previous values atomically and files an audit entry — it does not delete history.</div>}>
      {versions.map((v) => (
        <div className="pm-card pm-card-pad mb-3" key={v.id} style={{ borderLeft: `3px solid ${v.current ? "#12b76a" : "#e2e6ee"}` }}>
          <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
            <span className="mono" style={{ fontWeight: 800 }}>{v.id}</span>
            {v.current && <Badge tone="green" dot>current</Badge>}
            <span className="ms-auto pm-td-sub mono">{v.date} · {v.admin}</span>
          </div>
          <div className="pm-td-sub mb-2">{v.note} · <span className="mono">{v.changes} changes · {v.scope}</span></div>
          <div className="d-flex gap-1">
            <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".66rem" }} onClick={() => onDiff(v)}><i className="bi bi-file-diff me-1" />Diff</button>
            <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".66rem" }} disabled={v.current} onClick={() => onRollback(v)}><i className="bi bi-arrow-counterclockwise me-1" />Rollback to here</button>
          </div>
        </div>
      ))}
    </Drawer>
  );
}

/* ================================================================
   24. Version diff modal
   ================================================================ */
export function VersionDiffModal({ version, onClose, onRollback }: { version: ConfigVersion | null; onClose: () => void; onRollback: (v: ConfigVersion) => void }) {
  if (!version) return null;
  const changes = [
    { key: "Contactless per-txn limit", from: "KES 3,000", to: "KES 5,000" },
    { key: "Callback timeout", from: "60 seconds", to: "30 seconds" },
    { key: "Max FX transaction", from: "KES 3,000,000", to: "KES 5,000,000" },
  ].slice(0, Math.max(1, Math.min(3, version.changes)));
  return (
    <Modal open onClose={onClose} tone="ink" icon="bi-file-diff" size="md" title={`Diff — ${version.id}`}
      subtitle={`${version.date} · ${version.admin} · ${version.changes} changes · ${version.scope}`}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => csvDownload(`${version.id}-diff.csv`, changes)}><i className="bi bi-download me-1" />Export diff</button>
          <button className="btn btn-primary btn-sm" disabled={version.current} onClick={() => { onClose(); onRollback(version); }}><i className="bi bi-arrow-counterclockwise me-1" />Rollback to this version</button>
        </>
      }>
      <div className="pm-modal-body">
        <div className="pm-note mb-3"><i className="bi bi-info-circle me-1" />{version.note}</div>
        {changes.map((c) => (
          <div className="pm-kv" key={c.key}>
            <span className="k">{c.key}</span>
            <span className="v d-flex align-items-center gap-2 mono" style={{ fontSize: ".74rem" }}>
              <span style={{ background: "#fef2f2", color: "#b42318", padding: ".08rem .4rem", borderRadius: 6, textDecoration: "line-through" }}>{c.from}</span>
              <i className="bi bi-arrow-right" style={{ color: "var(--pm-muted)" }} />
              <span style={{ background: "#e7f8ef", color: "#05603a", padding: ".08rem .4rem", borderRadius: 6, fontWeight: 700 }}>{c.to}</span>
            </span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ================================================================
   25. Rollback modal (2FA)
   ================================================================ */
export function RollbackModal({ version, currentId, onClose, onDone }: { version: ConfigVersion | null; currentId: string; onClose: () => void; onDone: (id: string, reason: string) => void }) {
  const { push } = useToast();
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  useEffect(() => { setReason(""); setCode(""); }, [version?.id]);
  if (!version) return null;
  return (
    <Modal open onClose={onClose} tone="red" icon="bi-arrow-counterclockwise" size="sm" title={`Rollback production → ${version.id}`}
      subtitle={`current ${currentId} · ${version.changes} settings revert`}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger btn-sm" disabled={reason.trim().length < 8 || code !== CODE} onClick={() => {
            onDone(version.id, reason);
            push({ kind: "warn", title: `Rolled back to ${version.id}`, body: `${version.changes} settings reverted · partners notified · postmortem task created.` });
            onClose();
          }}><i className="bi bi-arrow-counterclockwise me-1" />Rollback now</button>
        </>
      }>
      <div className="pm-modal-body">
        <div className="pm-alert-row crit mb-3">
          <i className="bi bi-exclamation-octagon-fill" style={{ color: "#f04438" }} />
          <div><b style={{ fontSize: ".8rem" }}>Immediate atomic revert</b>
            <div className="pm-td-sub">Values from {version.id} re-apply to production instantly. Any settings created after {version.id} remain but fall back to their pre-promote values.</div></div>
        </div>
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Reverting to</span><span className="v mono">{version.id} · {version.date}</span></div>
          <div className="pm-kv"><span className="k">Release note</span><span className="v" style={{ fontSize: ".74rem" }}>{version.note}</span></div>
        </div>
        <label className="form-label">Rollback reason (min 8 chars) <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control mb-3" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Contactless limit regression seen in fraud queue" />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
    </Modal>
  );
}

/* ================================================================
   26. Approvals drawer
   ================================================================ */
export function RequestsDrawer({ requests, open, onClose, onOpen, onNew }: {
  requests: ChangeRequest[]; open: boolean; onClose: () => void;
  onOpen: (r: ChangeRequest) => void; onNew: () => void;
}) {
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-hourglass-split" tone="amber" title="Change approvals"
      subtitle={`${requests.filter((r) => r.status === "Pending").length} pending · ${requests.filter((r) => r.status === "Deployed").length} deployed · SLA 24h`}
      footer={<button className="btn btn-primary btn-sm w-100" onClick={onNew}><i className="bi bi-plus-lg me-1" />Request a change</button>}>
      {requests.map((r) => (
        <div className="pm-card pm-card-pad mb-3" key={r.id} style={{ borderLeft: `3px solid ${r.status === "Pending" ? "#f79009" : r.status === "Rejected" ? "#f04438" : "#12b76a"}` }}>
          <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
            <span style={{ fontWeight: 700, fontSize: ".84rem" }}>{r.settingKey}</span>
            <Badge tone={riskTone(r.risk)}>{r.risk} risk</Badge>
            <Badge tone={statusTone(r.status)} dot>{r.status}</Badge>
            <span className="ms-auto pm-td-sub mono">{r.id}</span>
          </div>
          <div className="pm-td-sub mb-2">
            <span className="mono">{r.from}</span> → <span className="mono" style={{ color: "#05603a", fontWeight: 700 }}>{r.to}</span> · {productName(r.productId)} · {r.requestedBy} · {r.requestedAt}
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="d-flex gap-1 flex-wrap">
              {r.approvals.map((a) => (
                <Badge key={a.role} tone={a.state === "Approved" ? "green" : a.state === "Rejected" ? "red" : a.state === "Pending" ? "amber" : "grey"}>{a.role}: {a.state}</Badge>
              ))}
            </div>
            <button className="btn btn-sm btn-outline-primary ms-auto" style={{ fontSize: ".66rem" }} onClick={() => onOpen(r)}>Review</button>
          </div>
        </div>
      ))}
    </Drawer>
  );
}

/* ================================================================
   27. Change request detail modal
   ================================================================ */
export function RequestDetailModal({ request, onClose, onApprove, onReject }: {
  request: ChangeRequest | null; onClose: () => void;
  onApprove: (r: ChangeRequest) => void; onReject: (r: ChangeRequest) => void;
}) {
  if (!request) return null;
  return (
    <Modal open onClose={onClose} tone="amber" icon="bi-hourglass-split" size="md" title={request.settingKey}
      subtitle={`${request.id} · ${productName(request.productId)} · requested ${request.requestedAt} by ${request.requestedBy}`}
      footer={
        <>
          <button className="btn btn-outline-danger btn-sm" style={{ borderColor: "#fda29b", color: "#b42318" }} disabled={request.status !== "Pending"} onClick={() => onReject(request)}><i className="bi bi-x-circle me-1" />Reject</button>
          <button className="btn btn-primary btn-sm" disabled={request.status !== "Pending"} onClick={() => onApprove(request)}><i className="bi bi-check2-circle me-1" />Approve as Super Admin</button>
        </>
      }>
      <div className="pm-modal-body">
        <div className="row g-2 mb-3">
          <div className="col-6">
            <div className="pm-stat" style={{ borderLeft: "3px solid #f04438" }}>
              <span className="pm-stat-label">Current</span>
              <span className="pm-stat-value" style={{ fontSize: "1rem" }}>{request.from}</span>
            </div>
          </div>
          <div className="col-6">
            <div className="pm-stat" style={{ borderLeft: "3px solid #12b76a" }}>
              <span className="pm-stat-label">Proposed</span>
              <span className="pm-stat-value" style={{ fontSize: "1rem" }}>{request.to}</span>
            </div>
          </div>
        </div>
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Risk rating</span><span className="v"><Badge tone={riskTone(request.risk)}>{request.risk}</Badge></span></div>
          <div className="pm-kv"><span className="k">Reason</span><span className="v" style={{ maxWidth: 300, whiteSpace: "normal" }}>{request.reason}</span></div>
          <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone={statusTone(request.status)} dot>{request.status}</Badge></span></div>
        </div>
        <div className="pm-eyebrow mb-2">Approval chain</div>
        {request.approvals.map((a) => (
          <div className="pm-kv" key={a.role}>
            <span className="k">{a.role}<div className="pm-td-sub">{a.who}</div></span>
            <span className="v"><Badge tone={a.state === "Approved" ? "green" : a.state === "Rejected" ? "red" : a.state === "Pending" ? "amber" : "grey"} dot>{a.state}</Badge></span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ================================================================
   28. Approve modal (2FA)
   ================================================================ */
export function ApproveModal({ request, onClose, onDone }: { request: ChangeRequest | null; onClose: () => void; onDone: (id: string) => void }) {
  const { push } = useToast();
  const [code, setCode] = useState("");
  useEffect(() => { setCode(""); }, [request?.id]);
  if (!request) return null;
  return (
    <Modal open onClose={onClose} tone="green" icon="bi-check2-circle" size="sm" title={`Approve — ${request.settingKey}`}
      subtitle={`${request.id} · ${request.from} → ${request.to} · ${request.risk} risk`}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" disabled={code !== CODE} onClick={() => {
            onDone(request.id);
            push({ kind: "success", title: "Change approved", body: `${request.settingKey} moves to the next release train.` });
            onClose();
          }}><i className="bi bi-check2 me-1" />Approve change</button>
        </>
      }>
      <div className="pm-modal-body">
        <div className="pm-note mb-3"><i className="bi bi-shield-check me-1" />Your Super Admin approval satisfies the final gate. The change becomes eligible for the next promote window and is logged with your name.</div>
        <TwoFactorField value={code} onChange={setCode} />
      </div>
    </Modal>
  );
}

/* ================================================================
   29. Reject modal
   ================================================================ */
export function RejectModal({ request, onClose, onDone }: { request: ChangeRequest | null; onClose: () => void; onDone: (id: string, reason: string) => void }) {
  const { push } = useToast();
  const [reason, setReason] = useState("");
  useEffect(() => { setReason(""); }, [request?.id]);
  if (!request) return null;
  return (
    <Modal open onClose={onClose} tone="red" icon="bi-x-circle" size="sm" title={`Reject — ${request.settingKey}`}
      subtitle={`${request.id} · requested by ${request.requestedBy}`}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger btn-sm" disabled={reason.trim().length < 8} onClick={() => {
            onDone(request.id, reason);
            push({ kind: "warn", title: "Change rejected", body: `${request.requestedBy} notified with your reason.` });
            onClose();
          }}><i className="bi bi-x me-1" />Reject change</button>
        </>
      }>
      <div className="pm-modal-body">
        <label className="form-label">Rejection reason (min 8 chars · sent to requester) <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. NPL data doesn't support a second concurrent loan yet — resubmit after Q4 vintage review" />
      </div>
    </Modal>
  );
}

/* ================================================================
   30. Request-a-change modal (creates approval queue item)
   ================================================================ */
export function NewRequestModal({ products, settings, onClose, onDone }: {
  products: Product[]; settings: Setting[];
  onClose: () => void;
  onDone: (productId: string, settingKey: string, from: string, to: string, reason: string, risk: string) => void;
}) {
  const { push } = useToast();
  const [productId, setProductId] = useState("");
  const [settingId, setSettingId] = useState("");
  const [to, setTo] = useState("");
  const [reason, setReason] = useState("");
  const [risk, setRisk] = useState("Medium");
  useEffect(() => { setProductId(""); setSettingId(""); setTo(""); setReason(""); setRisk("Medium"); }, []);
  if (!products.length) return null;
  const chosen = settings.find((s) => s.id === settingId);
  const open = true;
  return (
    <Modal open={open} onClose={onClose} tone="amber" icon="bi-plus-circle" size="sm" title="Request a configuration change"
      subtitle="Goes to the approvals queue · Risk + Product + Super Admin"
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" disabled={!chosen || to.trim().length === 0 || reason.trim().length < 8} onClick={() => {
            onDone(productId, chosen!.key, chosen!.value, to.trim(), reason.trim(), risk);
            push({ kind: "success", title: "Change request filed", body: `${chosen!.key} → ${to.trim()} · approvals pinged.` });
            onClose();
          }}><i className="bi bi-send me-1" />Submit request</button>
        </>
      }>
      <div className="pm-modal-body">
        <label className="form-label">Product</label>
        <select className="form-select mb-3" value={productId} onChange={(e) => { setProductId(e.target.value); setSettingId(""); }}>
          <option value="">Select product…</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <label className="form-label">Setting</label>
        <select className="form-select mb-3" value={settingId} onChange={(e) => setSettingId(e.target.value)} disabled={!productId}>
          <option value="">Select setting…</option>
          {settings.filter((s) => s.productId === productId && s.editable).map((s) => <option key={s.id} value={s.id}>{s.key} (current {s.value})</option>)}
        </select>
        <label className="form-label">Proposed value <span style={{ color: "#f04438" }}>*</span></label>
        <input className="form-control mb-3 mono" value={to} onChange={(e) => setTo(e.target.value)} placeholder={chosen?.value ?? "e.g. KES 100,000"} />
        <label className="form-label">Risk rating</label>
        <select className="form-select mb-3" value={risk} onChange={(e) => setRisk(e.target.value)}>
          {["Low", "Medium", "High"].map((r) => <option key={r}>{r}</option>)}
        </select>
        <label className="form-label">Business reason (min 8 chars) <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>
    </Modal>
  );
}

/* ================================================================
   31. Reset-to-default modal
   ================================================================ */
export function ResetDefaultModal({ setting, onClose, onDone }: { setting: Setting | null; onClose: () => void; onDone: (id: string) => void }) {
  const { push } = useToast();
  const [code, setCode] = useState("");
  useEffect(() => { setCode(""); }, [setting?.id]);
  if (!setting) return null;
  return (
    <Modal open onClose={onClose} tone="amber" icon="bi-arrow-counterclockwise" size="sm" title={`Reset — ${setting.key}`}
      subtitle={`${setting.id} · revert to launch default`}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-warning btn-sm" disabled={code !== CODE} onClick={() => {
            onDone(setting.id);
            push({ kind: "success", title: "Reset to default", body: `${setting.key} queued with the launch-default value.` });
            onClose();
          }}><i className="bi bi-arrow-counterclockwise me-1" />Reset to default</button>
        </>
      }>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Current</span><span className="v mono">{setting.value}</span></div>
          <div className="pm-kv"><span className="k">Launch default</span><span className="v mono">{setting.min ? `${setting.min} (floor)` : "original value"}</span></div>
          <div className="pm-kv"><span className="k">Last changed</span><span className="v mono">{setting.changed} · {setting.changedBy}</span></div>
        </div>
        <div className="pm-note mb-3"><i className="bi bi-info-circle me-1" />Reset creates a normal change request — it still goes through approvals before production.</div>
        <TwoFactorField value={code} onChange={setCode} />
      </div>
    </Modal>
  );
}

/* ================================================================
   32. Export modal
   ================================================================ */
export function ConfigExportModal({ open, settings, overrides, rules, versions, requests, onClose }: {
  open: boolean; settings: Setting[]; overrides: Override[]; rules: Rule[]; versions: ConfigVersion[]; requests: ChangeRequest[]; onClose: () => void;
}) {
  const { push } = useToast();
  const [picked, setPicked] = useState<string[]>(["settings"]);
  useEffect(() => setPicked(["settings"]), [open]);
  if (!open) return null;
  const sets: Record<string, () => void> = {
    settings: () => csvDownload("product-settings.csv", settings.map((s) => ({ id: s.id, product: productName(s.productId), group: s.group, key: s.key, value: s.value, min: s.min ?? "", max: s.max ?? "", editable: s.editable, frozen: !!s.frozen, drift: s.drift ?? "", changed: s.changed, changedBy: s.changedBy }))),
    overrides: () => csvDownload("overrides.csv", overrides.map((o) => ({ id: o.id, scope: o.scope, target: o.target, product: productName(o.productId), setting: o.settingKey, value: o.value, baseline: o.baseline, status: o.status, expires: o.expires, affected: o.affected }))),
    rules: () => csvDownload("rules.csv", rules.map((r) => ({ id: r.id, name: r.name, kind: r.kind, product: r.productId === "all" ? "Platform" : productName(r.productId), trigger: r.trigger, action: r.action, priority: r.priority, enabled: r.enabled, hits30d: r.hits30d }))),
    versions: () => csvDownload("versions.csv", versions.map((v) => ({ id: v.id, date: v.date, admin: v.admin, changes: v.changes, scope: v.scope, note: v.note }))),
    requests: () => csvDownload("change-requests.csv", requests.map((r) => ({ id: r.id, product: productName(r.productId), setting: r.settingKey, from: r.from, to: r.to, status: r.status, risk: r.risk, by: r.requestedBy }))),
    bundle: () => jsonDownload("product-config.json", { exported: new Date().toISOString(), settings, overrides, rules, versions }),
  };
  const labels: Record<string, string> = { settings: "Settings library (CSV)", overrides: "Overrides (CSV)", rules: "Rules engine (CSV)", versions: "Version history (CSV)", requests: "Change requests (CSV)", bundle: "Full config bundle (JSON)" };
  return (
    <Modal open onClose={onClose} tone="ink" icon="bi-download" size="sm" title="Export configuration"
      subtitle="Generated locally · board-pack friendly"
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" disabled={picked.length === 0} onClick={() => {
            picked.forEach((k) => sets[k]?.());
            push({ kind: "success", title: `${picked.length} export${picked.length > 1 ? "s" : ""} downloaded`, body: picked.map((k) => labels[k]).join(" · ") });
            onClose();
          }}><i className="bi bi-download me-1" />Download {picked.length}</button>
        </>
      }>
      <div className="pm-modal-body">
        {Object.keys(labels).map((k) => (
          <button key={k} className={`pm-opt mb-2 ${picked.includes(k) ? "active" : ""}`} onClick={() => setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]))}>
            <span className="r" />
            <span className="flex-grow-1" style={{ fontWeight: 600, fontSize: ".85rem" }}>{labels[k]}</span>
            <i className="bi bi-file-earmark-arrow-down" style={{ color: "var(--pm-muted)" }} />
          </button>
        ))}
      </div>
    </Modal>
  );
}

/* ================================================================
   33. Permissions modal
   ================================================================ */
export function ConfigPermissionsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const cell = (v: string) => {
    const tone = v.startsWith("Full") ? "green" : v === "Request" || v === "Prepare" ? "amber" : v === "Approve" || v === "Escalate" ? "blue" : v === "Read" ? "violet" : "grey";
    return <Badge tone={tone}>{v}</Badge>;
  };
  return (
    <Modal open={open} onClose={onClose} tone="blue" icon="bi-person-lock" size="lg" title="Configuration permissions"
      subtitle="Who can touch product configuration · enforced by the roles engine (page 30)"
      footer={<button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>}>
      <div className="pm-modal-body">
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Action</th><th>Super Admin</th><th>Product Ops</th><th>Finance</th><th>Risk</th><th>Read-only</th></tr></thead>
            <tbody>
              {CONFIG_PERMISSIONS.map((p) => (
                <tr key={p.action}>
                  <td className="pm-td-strong">{p.action}</td>
                  <td>{cell(p.superAdmin)}</td>
                  <td>{cell(p.productOps)}</td>
                  <td>{cell(p.finance)}</td>
                  <td>{cell(p.risk)}</td>
                  <td>{cell(p.readOnly)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pm-note mt-3 mb-0"><i className="bi bi-shield-lock me-1" />“Full + 2FA” = authenticator code at execution. Deletes are Super-Admin-only with typed confirmation + 2FA. Every action lands in the audit trail (7-year retention).</div>
      </div>
    </Modal>
  );
}

/* ================================================================
   34. Audit drawer
   ================================================================ */
export function ConfigAuditDrawer({ open, audit, onClose }: { open: boolean; audit: ProductAudit[]; onClose: () => void }) {
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-journal-check" tone="ink" title="Configuration audit trail"
      subtitle={`${audit.length} entries · §21.8 · immutable, 7-year retention`}
      footer={<div className="pm-note w-100 mb-0"><i className="bi bi-info-circle me-1" />Board-visible. Exportable to the governance pack; entries can never be edited or deleted — only superseded.</div>}>
      <div className="pm-table-wrap">
        <table className="pm-table">
          <thead><tr><th>When</th><th>Admin</th><th>Area</th><th>Change</th><th>From → To</th><th>Reason</th></tr></thead>
          <tbody>
            {audit.map((a) => (
              <tr key={a.id}>
                <td className="pm-td-sub mono text-nowrap">{a.date}<div className="pm-td-sub">{a.id}</div></td>
                <td className="pm-td-strong" style={{ whiteSpace: "nowrap" }}>{a.admin}</td>
                <td><Badge tone={a.area === "Publish" ? "violet" : a.area === "Rules" || a.area === "Overrides" ? "blue" : "grey"}>{a.area}</Badge></td>
                <td>{a.change}</td>
                <td className="mono pm-td-sub text-nowrap">{a.from} → <b style={{ color: "var(--pm-ink)" }}>{a.to}</b></td>
                <td className="pm-td-sub" style={{ maxWidth: 240 }}>{a.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Drawer>
  );
}
