import { useState } from "react";
import { Badge, Drawer, EmptyState, Meter, Modal, Steps, TwoFactorField, useToast } from "../../../components/ui";
import { csvDownload, jsonDownload, kes, num } from "../../../lib/format";
import type { CalEvent, Correspondence, Remittance, TaxAudit, TaxConfig, TaxPool, TaxReport, UserTax } from "../data/taxData";
import { CORRESPONDENCE, REPORTS, TAX_AUDIT, TAX_CONFIG, TAX_POOLS, USER_TAX } from "../data/taxData";

const CODE = "482913";

export const taxTone = (s: string) =>
  s === "Filed" || s === "Acknowledged" || s === "Available" || s === "Response sent" ? "green"
    : s === "Pending" || s === "Processing" || s === "In progress" ? "amber"
      : s === "Overdue" || s === "Unavailable" ? "red" : "grey";

/* ================================================================
   1. Tax configuration drawer
   ================================================================ */
export function TaxConfigDrawer({
  open, onClose, config, onEdit, onOpen,
}: {
  open: boolean;
  onClose: () => void;
  config: TaxConfig[];
  onEdit: (t: TaxConfig) => void;
  onOpen: (t: TaxConfig) => void;
}) {
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-receipt-cutoff" tone="blue" title="Tax configuration"
      subtitle={`${config.length} tax types · rates locked to legal instruments`}
      footer={<div className="pm-note w-100 mb-0"><i className="bi bi-shield-lock me-1" />Rate changes require Super Admin + 2FA, a statutory reason, and are reported to the board finance committee.</div>}>
      <div className="pm-table-wrap">
        <table className="pm-table">
          <thead><tr><th>Tax type</th><th>Rate</th><th>Applies to</th><th>Collection</th><th>Legal basis</th><th /></tr></thead>
          <tbody>
            {config.map((t) => (
              <tr key={t.id}>
                <td>
                  <span className="pm-td-strong"><i className={`bi ${t.icon} me-2`} style={{ color: "#175cd3" }} />{t.type}</span>
                  <div className="pm-td-sub mono">{t.id}</div>
                </td>
                <td><Badge tone="violet">{t.rate}</Badge></td>
                <td className="pm-td-sub">{t.appliesTo}</td>
                <td className="pm-td-sub">{t.collection}</td>
                <td className="pm-td-sub mono">{t.legalBasis}</td>
                <td className="text-end text-nowrap">
                  <button className="btn btn-sm btn-outline-secondary me-1" style={{ fontSize: ".66rem" }} onClick={() => onOpen(t)}><i className="bi bi-eye" /></button>
                  <button className="btn btn-sm btn-outline-primary" style={{ fontSize: ".68rem" }} onClick={() => onEdit(t)}>Edit</button>
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
   2. Tax rate / base edit modal
   ================================================================ */
export function TaxRateModal({
  tax, onClose, onDone,
}: { tax: TaxConfig | null; onClose: () => void; onDone: (t: TaxConfig, rate: string, ratePct: number, appliesTo: string) => void }) {
  const { push } = useToast();
  const [ratePct, setRatePct] = useState(tax?.ratePct ?? 16);
  const [appliesTo, setAppliesTo] = useState(tax?.appliesTo ?? "");
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  if (!tax) return null;
  const isBracket = tax.rate === "Per bracket";
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-percent" size="sm"
      title={`Edit — ${tax.type}`} subtitle={`${tax.id} · legal basis ${tax.legalBasis}`}>
      <div className="pm-modal-body">
        {isBracket ? (
          <div className="pm-note mb-3">
            <i className="bi bi-info-circle me-1" />
            PAYE bands are maintained by the payroll vendor — this screen only confirms the provision. Use the reason field for the confirmation note.
          </div>
        ) : (
          <div className="pm-card pm-card-pad mb-3">
            <div className="d-flex justify-content-between mb-1"><span className="pm-eyebrow mb-0">Rate</span><span className="mono" style={{ fontWeight: 800 }}>{ratePct}%</span></div>
            <input type="range" className="form-range" min={0} max={40} step={0.5} value={ratePct} onChange={(e) => setRatePct(Number(e.target.value))} />
            <div className="pm-td-sub mono">current {tax.rate} · proposed {ratePct}%</div>
          </div>
        )}
        <label className="form-label">Base (applies to)</label>
        <input className="form-control mb-3" value={appliesTo} onChange={(e) => setAppliesTo(e.target.value)} disabled={isBracket} />
        <label className="form-label">Statutory reason <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control mb-3" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Finance Act 2023 amendment · gazette notice no." />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={code !== CODE || reason.trim().length < 8 || (appliesTo === tax.appliesTo && ratePct === tax.ratePct)} onClick={() => {
          onDone(tax, isBracket ? tax.rate : `${ratePct}%`, ratePct, appliesTo || tax.appliesTo);
          push({ kind: "success", title: `${tax.type} updated`, body: `${tax.rate} / ${tax.appliesTo} → ${isBracket ? tax.rate : `${ratePct}%`} / ${appliesTo}.` });
          onClose();
        }}>
          <i className="bi bi-check2 me-1" />Save configuration
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   3. Tax type detail modal
   ================================================================ */
export function TaxTypeDetailModal({
  tax, pools, remittance, onClose, onPool,
}: {
  tax: TaxConfig | null;
  pools: TaxPool[];
  remittance: Remittance[];
  onClose: () => void;
  onPool: (p: TaxPool) => void;
}) {
  if (!tax) return null;
  const key = tax.type.includes("VAT") ? "VAT" : tax.type.includes("Excise") ? "Excise" : tax.type.includes("Withholding") ? "WHT" : tax.type.includes("Digital") ? "DST" : tax.type.includes("Stamp") ? "Stamp" : null;
  const pool = pools.find((p) => p.name.startsWith(key ?? "§"));
  const recent = remittance.filter((r) => r.taxType.includes(key ?? "§")).slice(0, 3);
  return (
    <Modal open onClose={onClose} tone="blue" icon={tax.icon} size="md"
      title={tax.type} subtitle={`${tax.id} · ${tax.legalBasis}`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Rate</span><span className="v"><Badge tone="violet">{tax.rate}</Badge></span></div>
          <div className="pm-kv"><span className="k">Base</span><span className="v">{tax.appliesTo}</span></div>
          <div className="pm-kv"><span className="k">Collection</span><span className="v">{tax.collection}</span></div>
          <div className="pm-kv"><span className="k">Legal basis</span><span className="v mono">{tax.legalBasis}</span></div>
          <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone={tax.active ? "green" : "grey"} dot>{tax.active ? "Active" : "Inactive"}</Badge></span></div>
        </div>
        {pool && (
          <>
            <div className="pm-eyebrow mb-2">Linked pool</div>
            <button className="pm-alert-row w-100 text-start mb-3" style={{ border: "1px solid var(--pm-border)", borderLeftColor: "#12b76a" }} onClick={() => { onClose(); onPool(pool); }}>
              <div className="flex-grow-1">
                <div style={{ fontWeight: 700, fontSize: ".8rem" }}>{pool.name}</div>
                <div className="pm-td-sub mono">held {kes(pool.held, { compact: true })} · next {pool.nextRemittance}</div>
              </div>
              <i className="bi bi-chevron-right" />
            </button>
          </>
        )}
        {recent.length > 0 && (
          <>
            <div className="pm-eyebrow mb-2">Recent remittances</div>
            {recent.map((r) => (
              <div className="pm-kv" key={r.id}>
                <span className="k mono" style={{ fontSize: ".74rem" }}>{r.date} · {r.reference}</span>
                <span className="v mono" style={{ fontSize: ".74rem" }}>{kes(r.amount, { compact: true })} · {r.status}</span>
              </div>
            ))}
          </>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   4. Tax pools drawer
   ================================================================ */
export function PoolsDrawer({
  open, onClose, pools, onRemit, onOpen,
}: {
  open: boolean;
  onClose: () => void;
  pools: TaxPool[];
  onRemit: (p: TaxPool) => void;
  onOpen: (p: TaxPool) => void;
}) {
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-wallet2" tone="green" title="Tax pool balances"
      subtitle={`${pools.length} pools · ${kes(pools.reduce((s, p) => s + p.held, 0), { compact: true })} held for the next window`}
      footer={<div className="pm-note w-100 mb-0"><i className="bi bi-shield-check me-1" />Remittances draw from the Tax Withholding liquidity pool and need Super Admin + Finance Manager dual approval.</div>}>
      {pools.map((p) => {
        const progress = p.collected30d > 0 ? Math.round((p.remitted30d / p.collected30d) * 100) : 100;
        return (
          <div key={p.id} className="pm-alert-row mb-2" style={{ border: "1px solid var(--pm-border)", borderLeftColor: p.onTrack ? "#12b76a" : "#f04438" }}>
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <span style={{ fontWeight: 700, fontSize: ".82rem" }}>{p.name}</span>
                <Badge tone={p.onTrack ? "green" : "red"} dot>{p.onTrack ? "On track" : "Shortfall"}</Badge>
                <span className="pm-td-sub mono">next {p.nextRemittance}</span>
              </div>
              <div className="pm-td-sub">{p.note}</div>
              <div className="mt-1" style={{ minWidth: 160 }}>
                <div className="d-flex justify-content-between mb-1">
                  <span className="pm-td-sub mono">remitted {kes(p.remitted30d, { compact: true })}</span>
                  <span className="pm-td-sub mono">{progress}%</span>
                </div>
                <Meter value={progress} tone="#12b76a" width={999} />
              </div>
            </div>
            <div className="text-end">
              <div className="pm-num" style={{ fontWeight: 800 }}>{kes(p.held, { compact: true })}</div>
              <div className="pm-td-sub">held</div>
              <div className="btn-group btn-group-sm mt-1">
                <button className="btn btn-outline-secondary" style={{ fontSize: ".66rem" }} onClick={() => onOpen(p)}>Open</button>
                <button className="btn btn-outline-primary" style={{ fontSize: ".66rem" }} disabled={p.held <= 0} onClick={() => onRemit(p)}>Remit</button>
              </div>
            </div>
          </div>
        );
      })}
    </Drawer>
  );
}

/* ================================================================
   5. Pool detail modal
   ================================================================ */
export function PoolDetailModal({ pool, onClose }: { pool: TaxPool | null; onClose: () => void }) {
  if (!pool) return null;
  return (
    <Modal open onClose={onClose} tone="green" icon="bi-wallet2" size="sm"
      title={pool.name} subtitle={`${pool.id} · next remittance ${pool.nextRemittance}`}>
      <div className="pm-modal-body">
        <div className="row g-2 mb-3">
          {[
            { l: "Collected (30d)", v: kes(pool.collected30d, { compact: true }) },
            { l: "Remitted (30d)", v: kes(pool.remitted30d, { compact: true }) },
            { l: "Held balance", v: kes(pool.held, { compact: true }) },
            { l: "Status", v: pool.onTrack ? "On track" : "Shortfall" },
          ].map((x) => (
            <div className="col-6" key={x.l}>
              <div className="pm-stat"><div className="pm-stat-label">{x.l}</div>
                <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: ".9rem" }}>{x.v}</div></div>
            </div>
          ))}
        </div>
        <div className="pm-note">
          <i className="bi bi-info-circle me-1" />
          {pool.note}. Funds sit in the Tax Withholding liquidity pool (POOL-07) and are released only against iTAX EFT acknowledgements.
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   6. Remittance wizard
   ================================================================ */
export function RemitWizard({
  open, pool, onClose, onDone,
}: { open: boolean; pool: TaxPool | null; onClose: () => void; onDone: (p: TaxPool, amount: number) => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState(pool?.held ?? 0);
  const [code, setCode] = useState("");
  const steps = [
    { label: "Amount", icon: "bi-calculator" },
    { label: "Review", icon: "bi-search" },
    { label: "2FA", icon: "bi-shield-lock" },
  ];
  const close = () => { setStep(0); setCode(""); onClose(); };
  if (!open || !pool) return null;
  const over = amount > pool.held;
  return (
    <Modal open onClose={close} tone="green" icon="bi-send-check" size="sm"
      title={`Remit — ${pool.name}`} subtitle={`Held ${kes(pool.held)} · iTAX EFT · dual approval`}>
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <>
            <label className="form-label">Amount (KES)</label>
            <input type="number" className="form-control mono mb-2" value={amount} step={100_000} onChange={(e) => setAmount(Number(e.target.value))} />
            <div className="d-flex gap-1 flex-wrap mb-2">
              <button className="pm-chip" onClick={() => setAmount(pool.held)}>Full held balance</button>
              <button className="pm-chip" onClick={() => setAmount(Math.round(pool.held / 2))}>Half</button>
            </div>
            {over && <div className="pm-note mb-2" style={{ borderColor: "#f04438" }}>Amount exceeds the held balance.</div>}
          </>
        )}
        {step === 1 && (
          <div className="pm-card pm-card-pad">
            <div className="pm-kv"><span className="k">Pool</span><span className="v">{pool.name}</span></div>
            <div className="pm-kv"><span className="k">Amount</span><span className="v mono">{kes(amount)}</span></div>
            <div className="pm-kv"><span className="k">Held after</span><span className="v mono">{kes(pool.held - amount, { compact: true })}</span></div>
            <div className="pm-kv"><span className="k">Rail</span><span className="v">iTAX EFT · Tax Withholding Pool</span></div>
            <div className="pm-kv"><span className="k">Approvers</span><span className="v">Jeckonia Kwasa (Super Admin) + Sarah Kamau (Finance)</span></div>
          </div>
        )}
        {step === 2 && <TwoFactorField value={code} onChange={setCode} />}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}>Back</button>}
        {step < 2 && <button className="btn btn-primary btn-sm" disabled={over || amount <= 0} onClick={() => setStep(step + 1)}>Next</button>}
        {step === 2 && (
          <button className="btn btn-primary btn-sm" disabled={code !== CODE} onClick={() => {
            onDone(pool, amount);
            push({ kind: "success", title: "Remittance sent", body: `${kes(amount, { compact: true })} → iTAX · acknowledgement tracked.` });
            close();
          }}>
            <i className="bi bi-send me-1" />Send remittance
          </button>
        )}
      </div>
    </Modal>
  );
}

/* ================================================================
   7. Remittance history drawer + detail
   ================================================================ */
export function RemittanceDrawer({
  open, onClose, remittance, onOpen,
}: { open: boolean; onClose: () => void; remittance: Remittance[]; onOpen: (r: Remittance) => void }) {
  const [chip, setChip] = useState("All");
  const types = ["All", ...Array.from(new Set(remittance.map((r) => r.taxType)))];
  const list = remittance.filter((r) => chip === "All" || r.taxType === chip);
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-clock-history" tone="green" title="Tax remittance history"
      subtitle={`${remittance.length} remittances · ${kes(remittance.reduce((s, r) => s + r.amount, 0), { compact: true })} lifetime via this view`}
      footer={<button className="btn btn-outline-secondary btn-sm w-100" onClick={() => csvDownload("tax-remittances.csv", remittance as unknown as Record<string, unknown>[])}>
        <i className="bi bi-download me-1" />Export history
      </button>}>
      <div className="d-flex gap-1 flex-wrap mb-3">
        {types.slice(0, 7).map((t) => (
          <button key={t} className={`pm-chip ${chip === t ? "active" : ""}`} onClick={() => setChip(t)}>{t}</button>
        ))}
      </div>
      {list.length === 0 ? <EmptyState icon="bi-search" title="No remittances" body="Try another tax type." /> : list.map((r) => (
        <button key={r.id} className="pm-alert-row w-100 text-start mb-2" style={{ border: "1px solid var(--pm-border)", borderLeftColor: r.status === "Acknowledged" ? "#12b76a" : "#f79009" }} onClick={() => onOpen(r)}>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="mono" style={{ fontWeight: 700, fontSize: ".74rem" }}>{r.reference}</span>
              <Badge tone={taxTone(r.status)} dot>{r.status}</Badge>
            </div>
            <div className="pm-td-sub">{r.taxType} · {r.date} · {r.method}</div>
          </div>
          <span className="pm-num" style={{ fontWeight: 700, fontSize: ".76rem" }}>{r.amount === 0 ? "filing only" : kes(r.amount, { compact: true })}</span>
        </button>
      ))}
    </Drawer>
  );
}

export function RemittanceDetailModal({ rem, onClose }: { rem: Remittance | null; onClose: () => void }) {
  if (!rem) return null;
  return (
    <Modal open onClose={onClose} tone="green" icon="bi-receipt" size="sm"
      title={`${rem.reference} — ${rem.taxType}`} subtitle={`${rem.date} · ${rem.method}`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad">
          <div className="pm-kv"><span className="k">Amount</span><span className="v mono">{rem.amount === 0 ? "Nil (filing only)" : kes(rem.amount)}</span></div>
          <div className="pm-kv"><span className="k">Method</span><span className="v">{rem.method}</span></div>
          <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone={taxTone(rem.status)} dot>{rem.status}</Badge></span></div>
          <div className="pm-kv"><span className="k">Acknowledgement</span><span className="v mono">ACK-{rem.reference.slice(-4)}-{rem.date.replace(" ", "")}</span></div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => csvDownload(`${rem.reference}.csv`, [rem as unknown as Record<string, unknown>])}>
          <i className="bi bi-download me-1" />Export receipt
        </button>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   8. Reports schedule drawer
   ================================================================ */
export function ReportsDrawer({
  open, onClose, reports, onOpen, onFile,
}: {
  open: boolean;
  onClose: () => void;
  reports: TaxReport[];
  onOpen: (r: TaxReport) => void;
  onFile: (r: TaxReport | null) => void;
}) {
  const [tab, setTab] = useState("All");
  const tabs = ["All", "Pending", "Filed", "Future"];
  const list = reports.filter((r) => tab === "All" || r.status === tab);
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-calendar-check" tone="violet" title="Statutory reports schedule"
      subtitle={`${reports.length} reports · ${reports.filter((r) => r.status === "Pending").length} pending this cycle`}
      footer={<button className="btn btn-primary btn-sm w-100" onClick={() => onFile(null)}><i className="bi bi-file-earmark-arrow-up me-1" />File a return now</button>}>
      <div className="pm-tabs mb-3" style={{ borderBottom: 0 }}>
        {tabs.map((t) => (
          <button key={t} className={`pm-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t}<span className="cnt">{t === "All" ? reports.length : reports.filter((r) => r.status === t).length}</span>
          </button>
        ))}
      </div>
      {list.map((r) => (
        <div key={r.id} className="pm-alert-row mb-2" style={{ border: "1px solid var(--pm-border)", borderLeftColor: r.status === "Filed" ? "#12b76a" : r.status === "Pending" ? "#f79009" : "#98a2b3" }}>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span style={{ fontWeight: 700, fontSize: ".8rem" }}>{r.report}</span>
              <Badge tone={taxTone(r.status)} dot>{r.status}</Badge>
            </div>
            <div className="pm-td-sub">{r.authority} · {r.frequency} · {r.method}</div>
            <div className="pm-td-sub mono">last {r.lastFiled} · due {r.due} · {r.owner}</div>
          </div>
          <div className="d-flex flex-column gap-1 align-items-end">
            <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".66rem" }} onClick={() => onOpen(r)}>Detail</button>
            {r.status === "Pending" && (
              <button className="btn btn-sm btn-outline-primary" style={{ fontSize: ".66rem" }} onClick={() => onFile(r)}>File</button>
            )}
          </div>
        </div>
      ))}
    </Drawer>
  );
}

export function ReportDetailModal({ report, onClose }: { report: TaxReport | null; onClose: () => void }) {
  if (!report) return null;
  return (
    <Modal open onClose={onClose} tone="violet" icon="bi-file-earmark-text" size="sm"
      title={report.report} subtitle={`${report.id} · ${report.authority} · ${report.frequency}`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad">
          <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone={taxTone(report.status)} dot>{report.status}</Badge></span></div>
          <div className="pm-kv"><span className="k">Last filed</span><span className="v mono">{report.lastFiled}</span></div>
          <div className="pm-kv"><span className="k">Due date</span><span className="v mono">{report.due}</span></div>
          <div className="pm-kv"><span className="k">Filing method</span><span className="v">{report.method}</span></div>
          <div className="pm-kv"><span className="k">Owner</span><span className="v">{report.owner}</span></div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   9. File return wizard (4 steps)
   ================================================================ */
export function FileReportWizard({
  open, reports, preselect, onClose, onDone,
}: {
  open: boolean;
  reports: TaxReport[];
  preselect: TaxReport | null;
  onClose: () => void;
  onDone: (r: TaxReport, remitAmount: number) => void;
}) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [reportId, setReportId] = useState(preselect?.id ?? "");
  const [periodFrom, setPeriodFrom] = useState("Aug 1");
  const [periodTo, setPeriodTo] = useState("Aug 31");
  const [remit, setRemit] = useState(true);
  const [code, setCode] = useState("");
  const steps = [
    { label: "Return", icon: "bi-file-earmark" },
    { label: "Period", icon: "bi-calendar3" },
    { label: "Validate", icon: "bi-list-check" },
    { label: "2FA", icon: "bi-shield-lock" },
  ];
  const close = () => { setStep(0); setCode(""); onClose(); };
  if (!open) return null;
  const report = reports.find((r) => r.id === reportId) ?? null;
  const validations = report ? [
    { n: "Ledger extraction", ok: true, d: `${num(Math.floor(Math.random() * 900) + 4_100)} tax-tagged postings in range` },
    { n: "Pool reconciliation", ok: true, d: "Pool held balance matches ledger accrual" },
    { n: "Prior-period carry-forward", ok: true, d: "No unfiled prior periods" },
    { n: "Penalty exposure", ok: true, d: `Due ${report.due} — inside the statutory window` },
    { n: "Maker-checker", ok: true, d: "Prepared by you · reviewed by Finance Mgr" },
  ] : [];
  return (
    <Modal open onClose={close} tone="violet" icon="bi-file-earmark-arrow-up" size="md"
      title="File a statutory return" subtitle="Extract → validate → submit · iTAX / CBK / GoAML">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%`, background: "#7a5af8" }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="d-flex flex-column gap-2">
            {reports.filter((r) => r.status !== "Filed").map((r) => (
              <button key={r.id} className={`pm-opt ${reportId === r.id ? "active" : ""}`} onClick={() => setReportId(r.id)}>
                <span className="r" /><i className="bi bi-file-earmark-text" style={{ color: "#7a5af8" }} />
                <span className="flex-grow-1">
                  <span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{r.report}</span>
                  <span className="d-block pm-td-sub mono">{r.authority} · due {r.due} · {r.method}</span>
                </span>
                <Badge tone={taxTone(r.status)} dot>{r.status}</Badge>
              </button>
            ))}
          </div>
        )}
        {step === 1 && (
          <>
            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label">Period from</label>
                <input className="form-control mono" value={periodFrom} onChange={(e) => setPeriodFrom(e.target.value)} />
              </div>
              <div className="col-6">
                <label className="form-label">Period to</label>
                <input className="form-control mono" value={periodTo} onChange={(e) => setPeriodTo(e.target.value)} />
              </div>
            </div>
            <div className="form-check form-switch mb-2">
              <input className="form-check-input" type="checkbox" id="remitSwitch" checked={remit} onChange={() => setRemit(!remit)} />
              <label className="form-check-label" htmlFor="remitSwitch" style={{ fontSize: ".8rem" }}>
                Remit the held pool balance with this filing (iTAX EFT)
              </label>
            </div>
            <div className="pm-note">
              <i className="bi bi-info-circle me-1" />
              Late filing attracts a penalty of 5% of tax due plus 1%/month — today the window is open.
            </div>
          </>
        )}
        {step === 2 && (
          <>
            {validations.map((v) => (
              <div className="pm-alert-row mb-2" key={v.n} style={{ border: "1px solid var(--pm-border)", borderLeftColor: v.ok ? "#12b76a" : "#f04438" }}>
                <i className={`bi ${v.ok ? "bi-check2-circle" : "bi-x-circle"}`} style={{ color: v.ok ? "#12b76a" : "#f04438" }} />
                <div className="flex-grow-1">
                  <div style={{ fontWeight: 700, fontSize: ".8rem" }}>{v.n}</div>
                  <div className="pm-td-sub mono">{v.d}</div>
                </div>
                <Badge tone={v.ok ? "green" : "red"}>{v.ok ? "Pass" : "Fail"}</Badge>
              </div>
            ))}
          </>
        )}
        {step === 3 && (
          <>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">Return</span><span className="v">{report?.report ?? "—"}</span></div>
              <div className="pm-kv"><span className="k">Period</span><span className="v mono">{periodFrom} → {periodTo}</span></div>
              <div className="pm-kv"><span className="k">Remit with filing</span><span className="v">{remit ? "Yes · held pool balance" : "No · filing only"}</span></div>
              <div className="pm-kv"><span className="k">Filed by</span><span className="v">Jeckonia Kwasa · Super Admin</span></div>
            </div>
            <TwoFactorField value={code} onChange={setCode} />
          </>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}>Back</button>}
        {step < 3 && <button className="btn btn-primary btn-sm" disabled={step === 0 && !report} onClick={() => setStep(step + 1)}>Next</button>}
        {step === 3 && (
          <button className="btn btn-primary btn-sm" disabled={code !== CODE || !report} onClick={() => {
            onDone(report as TaxReport, remit ? 1 : 0);
            push({ kind: "success", title: "Return filed", body: `${report?.report} submitted via ${report?.method} · acknowledgement pending.` });
            close();
          }}>
            <i className="bi bi-cloud-arrow-up me-1" />Submit return
          </button>
        )}
      </div>
    </Modal>
  );
}

/* ================================================================
   10. User tax summary drawer + detail
   ================================================================ */
export function UserTaxDrawer({
  open, onClose, users, onOpen,
}: { open: boolean; onClose: () => void; users: UserTax[]; onOpen: (u: UserTax) => void }) {
  const [q, setQ] = useState("");
  const list = users.filter((u) => (u.userId + u.name).toLowerCase().includes(q.toLowerCase()));
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-person-lines-fill" tone="blue" title="User tax summary"
      subtitle={`${users.length} users · withholding certificates per taxpayer`}
      footer={<button className="btn btn-outline-secondary btn-sm w-100" onClick={() => csvDownload("user-tax-summary.csv", users as unknown as Record<string, unknown>[])}>
        <i className="bi bi-download me-1" />Export summary
      </button>}>
      <div className="pm-search mb-3" style={{ background: "#fff" }}>
        <i className="bi bi-search" />
        <input placeholder="User ID or name…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {list.length === 0 ? <EmptyState icon="bi-search" title="No users match" body="Try another search." /> : (
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>User</th><th className="text-end">Gross fees</th><th className="text-end">VAT</th><th className="text-end">Excise</th><th className="text-end">WHT</th><th className="text-end">Net</th><th>Cert.</th></tr></thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.userId} style={{ cursor: "pointer" }} onClick={() => onOpen(u)}>
                  <td className="mono pm-td-strong">{u.userId}<div className="pm-td-sub">{u.name}</div></td>
                  <td className="text-end pm-num">{kes(u.grossFees)}</td>
                  <td className="text-end pm-num">{kes(u.vat)}</td>
                  <td className="text-end pm-num">{kes(u.excise)}</td>
                  <td className="text-end pm-num">{u.wht === 0 ? "—" : kes(u.wht)}</td>
                  <td className="text-end pm-num" style={{ fontWeight: 700 }}>{kes(u.netDeducted)}</td>
                  <td><Badge tone={taxTone(u.certificate)} dot>{u.certificate}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Drawer>
  );
}

export function UserTaxDetailModal({ user, onClose }: { user: UserTax | null; onClose: () => void }) {
  const { push } = useToast();
  if (!user) return null;
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-person-lines-fill" size="sm"
      title={`${user.userId} — tax summary`} subtitle={`${user.name} · current tax year`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Gross fees</span><span className="v mono">{kes(user.grossFees)}</span></div>
          <div className="pm-kv"><span className="k">VAT (16%)</span><span className="v mono">{kes(user.vat)}</span></div>
          <div className="pm-kv"><span className="k">Excise (20%)</span><span className="v mono">{kes(user.excise)}</span></div>
          <div className="pm-kv"><span className="k">WHT</span><span className="v mono">{user.wht === 0 ? "—" : kes(user.wht)}</span></div>
          <div className="pm-kv"><span className="k">Total deducted</span><span className="v mono" style={{ fontWeight: 800 }}>{kes(user.netDeducted)}</span></div>
          <div className="pm-kv"><span className="k">Certificate</span><span className="v"><Badge tone={taxTone(user.certificate)} dot>{user.certificate}</Badge></span></div>
        </div>
        <div className="pm-note">
          <i className="bi bi-file-earmark-pdf me-1" />
          Withholding certificates are regenerated nightly from the ledger and PIN-verified against iTAX.
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => csvDownload(`${user.userId}-tax-summary.csv`, [user as unknown as Record<string, unknown>])}>
          <i className="bi bi-download me-1" />Statement
        </button>
        {user.certificate !== "Unavailable" ? (
          <button className="btn btn-primary btn-sm" onClick={() => push({ kind: "success", title: "Certificate generated", body: `${user.userId} · tax certificate PDF downloaded.` })}>
            <i className="bi bi-award me-1" />Tax certificate
          </button>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
        )}
      </div>
    </Modal>
  );
}

/* ================================================================
   11. Regulatory correspondence drawer + detail + respond
   ================================================================ */
export function CorrespondenceDrawer({
  open, onClose, rows, onOpen,
}: { open: boolean; onClose: () => void; rows: Correspondence[]; onOpen: (c: Correspondence) => void }) {
  const [chip, setChip] = useState("All");
  const chips = ["All", "In progress", "Acknowledged", "Response sent"];
  const list = rows.filter((r) => chip === "All" || r.status === chip);
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-envelope-paper" tone="amber" title="Regulatory correspondence"
      subtitle={`${rows.length} items · ${rows.filter((r) => r.status === "In progress").length} awaiting action`}
      footer={<button className="btn btn-outline-secondary btn-sm w-100" onClick={() => csvDownload("regulatory-correspondence.csv", rows as unknown as Record<string, unknown>[])}>
        <i className="bi bi-download me-1" />Export tracker
      </button>}>
      <div className="d-flex gap-1 flex-wrap mb-3">
        {chips.map((c) => (
          <button key={c} className={`pm-chip ${chip === c ? "active" : ""}`} onClick={() => setChip(c)}>
            {c} <span className="pm-td-sub">({c === "All" ? rows.length : rows.filter((r) => r.status === c).length})</span>
          </button>
        ))}
      </div>
      {list.map((r) => (
        <button key={r.id} className="pm-alert-row w-100 text-start mb-2" style={{ border: "1px solid var(--pm-border)", borderLeftColor: r.status === "In progress" ? "#f79009" : "#12b76a" }} onClick={() => onOpen(r)}>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="mono" style={{ fontWeight: 700, fontSize: ".72rem" }}>{r.id}</span>
              <Badge tone={r.type === "Warning" ? "red" : r.type === "Inquiry" ? "amber" : "blue"}>{r.type}</Badge>
              <Badge tone={taxTone(r.status)} dot>{r.status}</Badge>
            </div>
            <div style={{ fontSize: ".8rem", fontWeight: 700 }}>{r.subject}</div>
            <div className="pm-td-sub">{r.from} · {r.date} · respond by {r.dueResponse} · {r.assigned}</div>
          </div>
        </button>
      ))}
    </Drawer>
  );
}

export function CorrespondenceDetailModal({
  row, onClose, onRespond,
}: { row: Correspondence | null; onClose: () => void; onRespond: (c: Correspondence) => void }) {
  if (!row) return null;
  return (
    <Modal open onClose={onClose} tone="amber" icon="bi-envelope-open" size="md"
      title={row.subject} subtitle={`${row.from} · ${row.date} · ${row.id}`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Type</span><span className="v"><Badge tone={row.type === "Warning" ? "red" : row.type === "Inquiry" ? "amber" : "blue"}>{row.type}</Badge></span></div>
          <div className="pm-kv"><span className="k">Response due</span><span className="v mono">{row.dueResponse}</span></div>
          <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone={taxTone(row.status)} dot>{row.status}</Badge></span></div>
          <div className="pm-kv"><span className="k">Assigned</span><span className="v">{row.assigned}</span></div>
        </div>
        <div className="pm-eyebrow mb-1">Summary</div>
        <div style={{ fontSize: ".82rem" }}>{row.detail}</div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={onClose}>Close</button>
        {row.status === "In progress" && (
          <button className="btn btn-primary btn-sm" onClick={() => onRespond(row)}><i className="bi bi-reply me-1" />Log response</button>
        )}
      </div>
    </Modal>
  );
}

export function RespondModal({
  row, onClose, onDone,
}: { row: Correspondence | null; onClose: () => void; onDone: (c: Correspondence, note: string) => void }) {
  const { push } = useToast();
  const [note, setNote] = useState("");
  const [code, setCode] = useState("");
  if (!row) return null;
  return (
    <Modal open onClose={onClose} tone="green" icon="bi-reply" size="sm"
      title={`Respond — ${row.from} ${row.id}`} subtitle={row.subject}>
      <div className="pm-modal-body">
        <label className="form-label">Response summary <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control mb-3" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Reconciliation schedule attached; gap traced to input VAT certificates" />
        <div className="pm-note mb-3">
          <i className="bi bi-shield-check me-1" />
          Submitting marks the item “Response sent”, attaches your note and files it to the compliance repo. Legal co-signs anything admitting liability.
        </div>
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={code !== CODE || note.trim().length < 10} onClick={() => {
          onDone(row, note);
          push({ kind: "success", title: "Response logged", body: `${row.from} · filed to the compliance repo.` });
          onClose();
        }}>
          <i className="bi bi-send me-1" />Send response
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   12. Compliance calendar drawer + event modal
   ================================================================ */
export function CalendarDrawer({
  open, onClose, events, onOpen, onStart,
}: {
  open: boolean;
  onClose: () => void;
  events: CalEvent[];
  onOpen: (e: CalEvent) => void;
  onStart: (e: CalEvent) => void;
}) {
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-calendar-week" tone="blue" title="Compliance calendar"
      subtitle={`${events.length} obligations · ${events.filter((e) => e.prepStarted).length} in preparation`}
      footer={<div className="pm-note w-100 mb-0"><i className="bi bi-info-circle me-1" />Preparation should start on the shown date — the engine pages the owner 48h before if not started.</div>}>
      {events.map((e) => (
        <div key={e.id} className="pm-alert-row mb-2" style={{ border: "1px solid var(--pm-border)", borderLeftColor: e.prepStarted ? "#12b76a" : "#175cd3" }}>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="mono" style={{ fontWeight: 800, fontSize: ".76rem" }}>{e.date}</span>
              <span style={{ fontWeight: 700, fontSize: ".8rem" }}>{e.event}</span>
              <Badge tone={e.category === "Tax" ? "violet" : e.category === "AML" ? "amber" : "blue"}>{e.category}</Badge>
            </div>
            <div className="pm-td-sub">{e.authority} · owner {e.owner}</div>
            <div className="pm-td-sub mono">prep {e.prepStart} · {e.prepStarted ? "in preparation" : "not started"}</div>
          </div>
          <div className="d-flex flex-column gap-1 align-items-end">
            <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".66rem" }} onClick={() => onOpen(e)}>Detail</button>
            {!e.prepStarted && (
              <button className="btn btn-sm btn-outline-primary" style={{ fontSize: ".66rem" }} onClick={() => onStart(e)}>Start prep</button>
            )}
          </div>
        </div>
      ))}
    </Drawer>
  );
}

export function CalendarEventModal({ event, onClose }: { event: CalEvent | null; onClose: () => void }) {
  if (!event) return null;
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-calendar-event" size="sm"
      title={event.event} subtitle={`${event.authority} · due ${event.date}`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad">
          <div className="pm-kv"><span className="k">Category</span><span className="v"><Badge tone={event.category === "Tax" ? "violet" : event.category === "AML" ? "amber" : "blue"}>{event.category}</Badge></span></div>
          <div className="pm-kv"><span className="k">Preparation starts</span><span className="v mono">{event.prepStart}</span></div>
          <div className="pm-kv"><span className="k">Owner</span><span className="v">{event.owner}</span></div>
          <div className="pm-kv"><span className="k">Preparation</span><span className="v"><Badge tone={event.prepStarted ? "green" : "grey"} dot>{event.prepStarted ? "Started" : "Not started"}</Badge></span></div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   13. Audit drawer
   ================================================================ */
export function TaxAuditDrawer({ open, onClose, audit }: { open: boolean; onClose: () => void; audit: TaxAudit[] }) {
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-journal-check" tone="blue" title="Tax configuration audit"
      subtitle={`${audit.length} entries · every rate and base change with its statutory reason`}
      footer={<button className="btn btn-outline-secondary btn-sm w-100" onClick={() => csvDownload("tax-config-audit.csv", audit as unknown as Record<string, unknown>[])}>
        <i className="bi bi-download me-1" />Export audit
      </button>}>
      {audit.map((a) => (
        <div key={a.id} className="pm-alert-row mb-2" style={{ border: "1px solid var(--pm-border)", borderLeftColor: a.from === a.to ? "#98a2b3" : "#175cd3" }}>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="mono" style={{ fontWeight: 700, fontSize: ".72rem" }}>{a.id}</span>
              <span style={{ fontWeight: 700, fontSize: ".8rem" }}>{a.change}</span>
              <span className="mono pm-td-sub">{a.from === a.to ? a.from : `${a.from} → ${a.to}`}</span>
            </div>
            <div className="pm-td-sub">{a.date} · {a.admin}</div>
            <div className="pm-td-sub mono">{a.reason}</div>
          </div>
        </div>
      ))}
    </Drawer>
  );
}

/* ================================================================
   14. Export modal
   ================================================================ */
export function TaxExportModal({
  open, onClose, users, pools, remittance,
}: { open: boolean; onClose: () => void; users: UserTax[]; pools: TaxPool[]; remittance: Remittance[] }) {
  const { push } = useToast();
  const [dataset, setDataset] = useState("users");
  const [fmt, setFmt] = useState("csv");
  if (!open) return null;
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-download" size="sm"
      title="Export tax & compliance data" subtitle="Watermarked · written to the audit log">
      <div className="pm-modal-body">
        <div className="d-flex flex-column gap-2 mb-3">
          {[
            ["users", `User tax summary (${users.length})`],
            ["pools", `Pool balances (${pools.length})`],
            ["remittance", `Remittance history (${remittance.length})`],
            ["reports", `Reports schedule (${REPORTS.length})`],
            ["corr", `Correspondence (${CORRESPONDENCE.length})`],
            ["all", "Full pack (5 files)"],
          ].map(([id, l]) => (
            <button key={id} className={`pm-opt ${dataset === id ? "active" : ""}`} onClick={() => setDataset(id)}>
              <span className="r" /><span style={{ fontWeight: 700, fontSize: ".85rem" }}>{l}</span>
            </button>
          ))}
        </div>
        <div className="d-flex gap-1">
          {["csv", "json"].map((f) => <button key={f} className={`pm-chip ${fmt === f ? "active" : ""}`} onClick={() => setFmt(f)}>{f.toUpperCase()}</button>)}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => {
          const dl = (name: string, data: unknown[]) => (fmt === "json" ? jsonDownload(`${name}.json`, data) : csvDownload(`${name}.csv`, data as unknown as Record<string, unknown>[]));
          if (dataset === "users" || dataset === "all") dl("user-tax-summary", users);
          if (dataset === "pools" || dataset === "all") dl("tax-pools", pools);
          if (dataset === "remittance" || dataset === "all") dl("tax-remittances", remittance);
          if (dataset === "reports" || dataset === "all") dl("reports-schedule", REPORTS);
          if (dataset === "corr" || dataset === "all") dl("regulatory-correspondence", CORRESPONDENCE);
          push({ kind: "success", title: "Export ready" });
          onClose();
        }}>
          <i className="bi bi-download me-1" />Download
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   15. Permissions modal
   ================================================================ */
export function TaxPermissionsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  const rows = [
    { a: "Change tax rates / bases", t0: "Yes + 2FA", t1: "Propose only", t2: "No", note: "Board finance committee notified" },
    { a: "Remit from tax pools", t0: "Yes + 2FA", t1: "Yes + 2FA", t2: "No", note: "Dual approval Super Admin + Finance" },
    { a: "File statutory returns", t0: "Yes", t1: "Yes", t2: "No", note: "Maker-checker on every filing" },
    { a: "Respond to regulators", t0: "Yes", t1: "Yes (Compliance/Legal)", t2: "No", note: "Admissions of liability need Legal co-sign" },
    { a: "Issue tax certificates", t0: "Yes", t1: "Yes", t2: "Yes (read-only)", note: "Auto-regenerated nightly" },
    { a: "View user tax summaries", t0: "Yes", t1: "Yes", t2: "Yes (own org)", note: "PIN data masked for Support" },
  ];
  return (
    <Modal open onClose={onClose} tone="ink" icon="bi-person-lock" size="lg"
      title="Tax & compliance permissions" subtitle="Who can do what across the tax control plane">
      <div className="pm-modal-body">
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Action</th><th>Super Admin</th><th>Platform Admin</th><th>Support</th><th>Notes</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.a}>
                  <td className="pm-td-strong">{r.a}</td>
                  <td><Badge tone={r.t0.startsWith("Yes") ? "green" : "grey"}>{r.t0}</Badge></td>
                  <td><Badge tone={r.t1.startsWith("Yes") ? "amber" : "grey"}>{r.t1}</Badge></td>
                  <td><Badge tone={r.t2.startsWith("Yes") ? "amber" : "grey"}>{r.t2}</Badge></td>
                  <td className="pm-td-sub">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   16. Tax liability calculator
   ================================================================ */
export function LiabilityModal({
  open, onClose, config,
}: { open: boolean; onClose: () => void; config: TaxConfig[] }) {
  const [gross, setGross] = useState(10_000_000);
  const [cardShare, setCardShare] = useState(20);
  if (!open) return null;
  const vat = Math.round(gross * 0.16);
  const excise = Math.round(gross * 0.2);
  const dst = Math.round(gross * 0.015);
  const stamp = Math.round((gross * cardShare / 100) * 0.01);
  const total = vat + excise + dst + stamp;
  const net = gross - total;
  const bars = [
    { n: "VAT 16%", v: vat, c: "#175cd3" },
    { n: "Excise 20%", v: excise, c: "#12b76a" },
    { n: "DST 1.5%", v: dst, c: "#7a5af8" },
    { n: "Stamp 1% (cards)", v: stamp, c: "#f79009" },
  ];
  return (
    <Modal open onClose={onClose} tone="violet" icon="bi-calculator" size="md"
      title="Tax liability calculator" subtitle="What the tax pools will accrue on a hypothetical fee base">
      <div className="pm-modal-body">
        <div className="row g-2 mb-3">
          <div className="col-7">
            <label className="form-label">Gross fee base (KES)</label>
            <input type="number" className="form-control mono" value={gross} step={500_000} onChange={(e) => setGross(Number(e.target.value))} />
            <div className="d-flex gap-1 mt-1 flex-wrap">
              {[5_000_000, 10_000_000, 50_000_000].map((g) => (
                <button key={g} className="pm-chip" onClick={() => setGross(g)}>{kes(g, { compact: true })}</button>
              ))}
            </div>
          </div>
          <div className="col-5">
            <label className="form-label">Card share: <b className="mono">{cardShare}%</b></label>
            <input type="range" className="form-range" min={0} max={100} step={5} value={cardShare} onChange={(e) => setCardShare(Number(e.target.value))} />
            <div className="pm-td-sub">Stamp duty applies to card legs only</div>
          </div>
        </div>
        {bars.map((b) => (
          <div className="mb-2" key={b.n}>
            <div className="d-flex justify-content-between mb-1">
              <span style={{ fontSize: ".78rem", fontWeight: 600 }}>{b.n}</span>
              <span className="pm-num mono" style={{ fontSize: ".76rem" }}>{kes(b.v)}</span>
            </div>
            <Meter value={(b.v / total) * 100} tone={b.c} width={999} />
          </div>
        ))}
        <div className="row g-2 mt-3">
          <div className="col-6">
            <div className="pm-stat"><div className="pm-stat-label">Total tax accrued</div>
              <div style={{ fontFamily: "Sora", fontWeight: 800, color: "#b42318" }}>{kes(total)}</div></div>
          </div>
          <div className="col-6">
            <div className="pm-stat"><div className="pm-stat-label">Net fee revenue</div>
              <div style={{ fontFamily: "Sora", fontWeight: 800, color: "#0b8f52" }}>{kes(net)}</div></div>
          </div>
        </div>
        <div className="pm-note mt-3">
          <i className="bi bi-info-circle me-1" />
          Uses live rates: {config.filter((c) => c.ratePct > 0).map((c) => `${c.type.split(" (")[0]} ${c.rate}`).join(" · ")}. WHT excluded (interest income only).
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => csvDownload("tax-liability.csv", [{ gross, cardSharePct: cardShare, vat, excise, dst, stamp, total, net }])}>
          <i className="bi bi-download me-1" />Export scenario
        </button>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ============================ 23. Tax analytics modal ============================ */
export function TaxAnalyticsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const stats = [
    { label: "Total tax collected (MTD)", value: "KES 42.8M", color: "#b42318" },
    { label: "Pending remittances", value: "3", color: "#f79009" },
    { label: "Filed returns (YTD)", value: "24", color: "#12b76a" },
    { label: "Open correspondence", value: "2", color: "#2e90fa" },
    { label: "Upcoming deadlines", value: "5", color: "#f79009" },
    { label: "Compliance score", value: "98%", color: "#12b76a" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-graph-up" tone="blue" title="Tax analytics" subtitle="Compliance performance metrics">
      <div className="row g-2 mb-3">
        {stats.map((s) => (
          <div className="col-6" key={s.label}><div className="pm-stat" style={{ borderLeft: `3px solid ${s.color}` }}>
            <div className="pm-stat-label">{s.label}</div>
            <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1rem", color: s.color }}>{s.value}</div></div></div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 24. Tax comparison modal ============================ */
export function TaxCompareModal({ taxes, onClose }: { taxes: { type: string; rate: string; appliesTo: string }[]; onClose: () => void }) {
  if (taxes.length < 2) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-arrow-left-right" tone="blue" title="Compare taxes" subtitle="Side-by-side comparison">
      <div className="pm-card pm-table-wrap">
        <table className="pm-table">
          <thead><tr><th>Field</th><th>{taxes[0].type}</th><th>{taxes[1].type}</th></tr></thead>
          <tbody>
            {["rate", "appliesTo"].map((k) => (
              <tr key={k}><td className="pm-td-strong">{k}</td><td>{taxes[0][k as keyof typeof taxes[0]]}</td><td>{taxes[1][k as keyof typeof taxes[0]]}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </Drawer>
  );
}

/* ============================ 25. Tax insights modal ============================ */
export function TaxInsightsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const insights = [
    { icon: "bi-graph-up", title: "Tax revenue trending up", detail: "8% increase in tax collected vs last month", tone: "green" },
    { icon: "bi-exclamation-triangle", title: "Remittance due soon", detail: "KES 12.4M due by 31 Aug 2026", tone: "amber" },
    { icon: "bi-check-circle", title: "Compliance score strong", detail: "98% compliance rate, above target", tone: "green" },
    { icon: "bi-clock-history", title: "Filing deadline approaching", detail: "VAT return due in 7 days", tone: "amber" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-lightbulb" tone="blue" title="Tax insights" subtitle="AI-powered analysis">
      <div className="d-flex flex-column gap-2">
        {insights.map((ins) => (
          <div key={ins.title} className="pm-alert-row" style={{ borderLeftColor: ins.tone === "green" ? "#12b76a" : "#f79009" }}>
            <i className={`bi ${ins.icon}`} style={{ color: ins.tone === "green" ? "#12b76a" : "#f79009" }} />
            <div className="flex-grow-1"><div style={{ fontWeight: 700, fontSize: ".84rem" }}>{ins.title}</div><div style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>{ins.detail}</div></div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 26. Tax pool detail modal ============================ */
export function TaxPoolDetailInfoModal({ pool, onClose }: { pool: { id: string; type: string; balance: number; rate: string } | null; onClose: () => void }) {
  if (!pool) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-piggybank" tone="blue" title="Tax pool detail" subtitle={pool.type}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Pool ID</span><span className="v mono">{pool.id}</span></div>
        <div className="pm-kv"><span className="k">Type</span><span className="v"><Badge tone="blue">{pool.type}</Badge></span></div>
        <div className="pm-kv"><span className="k">Balance</span><span className="v pm-num" style={{ fontWeight: 700 }}>{kes(pool.balance)}</span></div>
        <div className="pm-kv"><span className="k">Rate</span><span className="v">{pool.rate}</span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 27. Remittance detail modal ============================ */
export function RemittanceDetailInfoModal({ rem, onClose }: { rem: { id: string; amount: number; authority: string; filed: string; status: string } | null; onClose: () => void }) {
  if (!rem) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-send" tone="blue" title="Remittance detail" subtitle={rem.id}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Amount</span><span className="v pm-num" style={{ fontWeight: 700 }}>{kes(rem.amount, { compact: true })}</span></div>
        <div className="pm-kv"><span className="k">Authority</span><span className="v">{rem.authority}</span></div>
        <div className="pm-kv"><span className="k">Filed</span><span className="v">{rem.filed}</span></div>
        <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone={rem.status === "Completed" ? "green" : rem.status === "Pending" ? "amber" : "red"}>{rem.status}</Badge></span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 28. User tax detail modal ============================ */
export function UserTaxDetailInfoModal({ user, onClose }: { user: { userId: string; name: string; taxId: string; ytdTax: number; status: string } | null; onClose: () => void }) {
  if (!user) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-person-badge" tone="blue" title="User tax detail" subtitle={user.name}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">User ID</span><span className="v mono">{user.userId}</span></div>
        <div className="pm-kv"><span className="k">Tax ID</span><span className="v mono">{user.taxId}</span></div>
        <div className="pm-kv"><span className="k">YTD tax</span><span className="v pm-num" style={{ fontWeight: 700, color: "#b42318" }}>{kes(user.ytdTax)}</span></div>
        <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone={user.status === "Compliant" ? "green" : "red"}>{user.status}</Badge></span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 29. Correspondence detail modal ============================ */
export function CorrespondenceDetailInfoModal({ row, onClose }: { row: { id: string; from: string; subject: string; date: string; status: string } | null; onClose: () => void }) {
  if (!row) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-envelope" tone="blue" title="Correspondence" subtitle={row.id}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">From</span><span className="v">{row.from}</span></div>
        <div className="pm-kv"><span className="k">Subject</span><span className="v">{row.subject}</span></div>
        <div className="pm-kv"><span className="k">Date</span><span className="v">{row.date}</span></div>
        <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone={row.status === "Resolved" ? "green" : "amber"}>{row.status}</Badge></span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 30. Tax forecast modal ============================ */
export function TaxForecastModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const forecast = [
    { month: "Sep 2026", vat: 8200000, excise: 2100000, dst: 1800000 },
    { month: "Oct 2026", vat: 8500000, excise: 2200000, dst: 1900000 },
    { month: "Nov 2026", vat: 8800000, excise: 2300000, dst: 2000000 },
    { month: "Dec 2026", vat: 9200000, excise: 2400000, dst: 2100000 },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-calendar-range" tone="blue" title="Tax forecast" subtitle="Next 4 months projection">
      <div className="d-flex flex-column gap-2">
        {forecast.map((f) => (
          <div key={f.month} className="pm-card pm-card-pad">
            <div style={{ fontWeight: 700, fontSize: ".88rem", marginBottom: 4 }}>{f.month}</div>
            <div className="d-flex gap-2" style={{ fontSize: ".78rem" }}>
              <span style={{ color: "#b42318" }}>VAT: {kes(f.vat, { compact: true })}</span>
              <span style={{ color: "#f79009" }}>Excise: {kes(f.excise, { compact: true })}</span>
              <span style={{ color: "#2e90fa" }}>DST: {kes(f.dst, { compact: true })}</span>
            </div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

void TAX_CONFIG;
void TAX_POOLS;
void USER_TAX;
void TAX_AUDIT;
