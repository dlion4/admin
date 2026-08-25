import { useState } from "react";
import { Modal, Drawer, Badge, Steps, useToast } from "../../../components/ui";
import { kes, num } from "../../../lib/format";

/* ================================================================
   1. Company Profile Drawer
   ================================================================ */
export function CompanyProfileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Drawer open={open} onClose={onClose} title="PayMo Digital Bank Ltd" subtitle="Company profile & corporate identity" icon="bi-building" tone="blue" half>
      <div className="pm-card pm-card-pad mb-3">
        <div className="d-flex align-items-center gap-3">
          <div style={{ width: 56, height: 56, borderRadius: 14, display: "grid", placeItems: "center", fontSize: "1.4rem", fontWeight: 900, background: "linear-gradient(135deg, var(--bs-primary), var(--bs-purple))", color: "#fff", flex: "none" }}>P</div>
          <div>
            <div style={{ fontSize: "1.05rem", fontWeight: 700 }}>PayMo Digital Bank Ltd</div>
            <div className="pm-td-sub">Registration: PVT-2024-184732 · KRA PIN: A0123456789</div>
            <div className="d-flex gap-2 mt-1 flex-wrap">
              <Badge tone="green" dot>Active</Badge>
              <Badge tone="blue">Tier 1 PSP</Badge>
              <Badge tone="amber">CBK Licensed</Badge>
            </div>
          </div>
        </div>
      </div>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-eyebrow mb-2">Registered Address</div>
        <div style={{ fontSize: ".85rem" }}>Westlands Business Park, 5th Floor, Suite 502</div>
        <div className="pm-td-sub">Westlands, Nairobi, Kenya 00100</div>
      </div>
      <div className="pm-card pm-card-pad">
        <div className="pm-eyebrow mb-2">Corporate Details</div>
        {([
          ["Legal Name", "PayMo Digital Bank Limited"],
          ["Trading Name", "PayMo"],
          ["Company Type", "Private Limited Company"],
          ["Incorporation Date", "January 15, 2024"],
          ["Share Capital", "KES 1,000,000,000"],
          ["Paid-up Capital", "KES 730,000,000"],
          ["CBK License", "PSP/2024/00847"],
          ["Data Protection Reg.", "ODPC/2024/1234"],
          ["Nairobi Securities Exchange", "Not Listed"],
        ] as [string, string][]).map(([k, v]) => (
          <div key={k} className="pm-kv"><span className="k">{k}</span><span className="v">{v}</span></div>
        ))}
      </div>
    </Drawer>
  );
}

/* ================================================================
   2. Founder Detail Modal
   ================================================================ */
export function FounderDetailModal({ founder, onClose }: { founder: any; onClose: () => void }) {
  if (!founder) return null;
  return (
    <Modal open={!!founder} onClose={onClose} title={founder.name} subtitle={founder.role} icon="bi-person-fill" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-2 mb-3">
          {([
            ["Shares", num(founder.shares)],
            ["Ownership", `${founder.ownership}%`],
            ["Invested", kes(founder.invested)],
            ["Current Value", kes(founder.currentValue)],
            ["MOIC", `${founder.moic}x`],
            ["Vesting", founder.vestingStatus],
          ] as [string, string][]).map(([k, v]) => (
            <div key={k} className="col-6"><div className="pm-stat"><div className="pm-stat-label">{k}</div><div className="pm-stat-value" style={{ fontSize: "1rem" }}>{v}</div></div></div>
          ))}
        </div>
        {founder.vestingSchedule?.length > 0 && (
          <div className="pm-card pm-card-pad mb-3">
            <div className="pm-eyebrow mb-2">Vesting Schedule</div>
            {founder.vestingSchedule.map((v: any, i: number) => (
              <div key={i} className="pm-kv">
                <span className="k">{v.period}</span>
                <span className="v">{v.shares} <Badge tone={v.status === "Vested" ? "green" : v.status === "Cliff" ? "amber" : "blue"}>{v.status}</Badge></span>
              </div>
            ))}
          </div>
        )}
        <div className="pm-card pm-card-pad">
          <div className="pm-eyebrow mb-2">Admin Permissions</div>
          <div className="row g-2">
            {founder.permissions?.map((p: string) => (
              <div key={p} className="col-6"><div className="d-flex align-items-center gap-2" style={{ fontSize: ".78rem" }}><i className="bi bi-check-circle-fill" style={{ color: "var(--pm-green)", fontSize: ".7rem" }} />{p}</div></div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ================================================================
   3. Share Transfer Wizard (5 Steps)
   ================================================================ */
export function ShareTransferWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState({ from: "", to: "", shares: "", price: "", reason: "" });
  const toast = useToast();
  const steps = [
    { label: "Transferor", icon: "bi-person" },
    { label: "Transferee", icon: "bi-person-plus" },
    { label: "Details", icon: "bi-hash" },
    { label: "Legal Review", icon: "bi-shield-check" },
    { label: "Confirm", icon: "bi-check-lg" },
  ];
  return (
    <Modal open={open} onClose={onClose} title="Share Transfer" subtitle={`Step ${step + 1} of 5: ${steps[step].label}`} icon="bi-arrow-left-right" tone="blue" size="lg">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 5) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && <div className="d-flex flex-column gap-2">
          <div className="pm-eyebrow mb-1">Select transferor (seller)</div>
          {["Jeckonia Kwasa (50%)", "VC Fund A (20%)", "Angel B (10%)", "VC Fund C (15%)"].map(n => (
            <button key={n} className={`pm-opt ${selected.from === n ? "active" : ""}`} onClick={() => setSelected(p => ({ ...p, from: n }))}>
              <div className="r" /><div className="pm-td-strong">{n}</div>
            </button>
          ))}
        </div>}
        {step === 1 && <div className="d-flex flex-column gap-2">
          <div className="pm-eyebrow mb-1">Select transferee (buyer)</div>
          <label className="form-label">Investor Name</label>
          <input className="form-control" placeholder="Search or enter new investor name..." />
          <div className="pm-note"><i className="bi bi-info-circle me-1" />Transferee must pass KYC and AML screening before share transfer can proceed.</div>
        </div>}
        {step === 2 && <div className="d-flex flex-column gap-2">
          <div className="row g-2 mb-3">
            <div className="col-6"><label className="form-label">Number of Shares</label><input className="form-control" type="number" placeholder="e.g. 500000" value={selected.shares} onChange={e => setSelected(p => ({ ...p, shares: e.target.value }))} /></div>
            <div className="col-6"><label className="form-label">Price per Share (KES)</label><input className="form-control" type="number" placeholder="e.g. 247" value={selected.price} onChange={e => setSelected(p => ({ ...p, price: e.target.value }))} /></div>
          </div>
          <div className="pm-card pm-card-pad">
            <div className="pm-eyebrow mb-2">Transfer Summary</div>
            <div className="pm-kv"><span className="k">From</span><span className="v">{selected.from || "—"}</span></div>
            <div className="pm-kv"><span className="k">To</span><span className="v">{selected.to || "—"}</span></div>
            <div className="pm-kv"><span className="k">Shares</span><span className="v mono">{num(Number(selected.shares) || 0)}</span></div>
            <div className="pm-kv"><span className="k">Total Value</span><span className="v" style={{ fontWeight: 800 }}>{kes((Number(selected.shares) || 0) * (Number(selected.price) || 0))}</span></div>
          </div>
        </div>}
        {step === 3 && <div className="d-flex flex-column gap-2">
          <div className="pm-eyebrow mb-1">Legal & Compliance Review</div>
          <div className="pm-card pm-card-pad">
            {["Right of First Refusal (ROFR) check", "Board approval required", "Shareholders' Agreement compliance", "AML/KYC screening", "Tax implications review", "CBK notification (if >5%)"].map(item => (
              <label key={item} className="d-flex align-items-center gap-2 mb-2" style={{ fontSize: ".82rem", cursor: "pointer" }}>
                <input type="checkbox" className="form-check-input" /><span>{item}</span>
              </label>
            ))}
          </div>
          <label className="form-label">Legal Notes</label>
          <textarea className="form-control" rows={2} placeholder="Conditions or notes..." />
        </div>}
        {step === 4 && <div className="pm-card pm-card-pad">
          <div className="pm-eyebrow mb-2">Confirm Share Transfer</div>
          <div className="pm-kv"><span className="k">Transferor</span><span className="v">{selected.from}</span></div>
          <div className="pm-kv"><span className="k">Transferee</span><span className="v">{selected.to || "New Investor"}</span></div>
          <div className="pm-kv"><span className="k">Shares</span><span className="v mono">{num(Number(selected.shares) || 0)}</span></div>
          <div className="pm-kv"><span className="k">Price/Share</span><span className="v">{kes(Number(selected.price) || 0)}</span></div>
          <div className="pm-kv"><span className="k">Total</span><span className="v" style={{ fontWeight: 800 }}>{kes((Number(selected.shares) || 0) * (Number(selected.price) || 0))}</span></div>
          <label className="d-flex align-items-center gap-2 mt-3" style={{ fontSize: ".82rem", cursor: "pointer" }}>
            <input type="checkbox" className="form-check-input" /><span>Confirmed by Board</span>
          </label>
        </div>}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(s => s - 1)}>← Back</button>}
        {step < 4 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(s => s + 1)}>Continue →</button>
          : <button className="btn btn-primary btn-sm" onClick={() => { toast({ kind: "success", title: "Share transfer executed", body: "Recorded in cap table" }); onClose(); }}><i className="bi bi-check2 me-1" />Execute Transfer</button>}
      </div>
    </Modal>
  );
}

/* ================================================================
   4. Expense Approval Wizard (4 Steps)
   ================================================================ */
export function ExpenseApprovalWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const toast = useToast();
  const steps = [
    { label: "Details", icon: "bi-receipt" },
    { label: "Category", icon: "bi-tags" },
    { label: "Approval", icon: "bi-person-check" },
    { label: "Review", icon: "bi-check-lg" },
  ];
  return (
    <Modal open={open} onClose={onClose} title="New Corporate Expense" subtitle={`Step ${step + 1} of 4: ${steps[step].label}`} icon="bi-receipt-cutoff" tone="amber" size="lg">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && <div className="d-flex flex-column gap-2">
          <div className="row g-2 mb-2">
            <div className="col-6"><label className="form-label">Amount (KES)</label><input className="form-control" type="number" placeholder="e.g. 2500000" /></div>
            <div className="col-6"><label className="form-label">Vendor</label><input className="form-control" placeholder="e.g. AWS Kenya" /></div>
          </div>
          <label className="form-label">Description</label><input className="form-control" placeholder="e.g. Server infrastructure Q4" />
          <label className="form-label">Invoice Reference</label><input className="form-control" placeholder="e.g. INV-2026-0847" />
          <label className="form-label">Justification</label><textarea className="form-control" rows={2} placeholder="Why is this expense necessary?" />
        </div>}
        {step === 1 && <div className="d-flex flex-column gap-2">
          <div className="pm-eyebrow mb-1">Select expense category</div>
          <div className="row g-2">
            {["Infrastructure", "Salaries", "Marketing", "Legal & Compliance", "Office", "Travel", "Software", "Professional Services"].map(cat => (
              <div key={cat} className="col-6"><button className="pm-opt w-100"><div className="r" /><span style={{ fontSize: ".82rem" }}>{cat}</span></button></div>
            ))}
          </div>
          <div className="pm-card pm-card-pad">
            <div className="pm-eyebrow mb-1">Budget Status</div>
            <div className="pm-kv"><span className="k">Infrastructure Q4</span><span className="v">{kes(15000000)}</span></div>
            <div className="pm-kv"><span className="k">Committed</span><span className="v">{kes(8500000)}</span></div>
            <div className="pm-kv"><span className="k">Available</span><span className="v" style={{ color: "var(--pm-green)", fontWeight: 800 }}>{kes(6500000)}</span></div>
          </div>
        </div>}
        {step === 2 && <div className="d-flex flex-column gap-2">
          <div className="pm-eyebrow mb-1">Approval Chain</div>
          {[
            { name: "Department Head", status: "Required", icon: "bi-person" },
            { name: "Finance Manager", status: "Required (>KES 500K)", icon: "bi-cash-stack" },
            { name: "CFO", status: "Required (>KES 2M)", icon: "bi-briefcase" },
            { name: "CEO", status: "Required (>KES 10M)", icon: "bi-person-badge" },
          ].map(a => (
            <div key={a.name} className="pm-alert-row">
              <i className={`bi ${a.icon}`} style={{ fontSize: "1rem", color: "var(--pm-muted)" }} />
              <div className="flex-grow-1">
                <div className="pm-td-strong">{a.name}</div>
                <div className="pm-td-sub">{a.status}</div>
              </div>
              <Badge tone="blue">Pending</Badge>
            </div>
          ))}
        </div>}
        {step === 3 && <div className="pm-card pm-card-pad">
          <div className="pm-eyebrow mb-2">Expense Summary</div>
          {([
            ["Description", "Server infrastructure Q4"],
            ["Amount", kes(2500000)],
            ["Vendor", "AWS Kenya"],
            ["Category", "Infrastructure"],
            ["Budget Available", kes(6500000)],
            ["Approval", "Finance Manager + CFO"],
          ] as [string, string][]).map(([k, v]) => (
            <div key={k} className="pm-kv"><span className="k">{k}</span><span className="v">{v}</span></div>
          ))}
        </div>}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(s => s - 1)}>← Back</button>}
        {step < 3 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(s => s + 1)}>Continue →</button>
          : <button className="btn btn-primary btn-sm" onClick={() => { toast({ kind: "success", title: "Expense submitted", body: "Pending CFO approval" }); onClose(); }}><i className="bi bi-check2 me-1" />Submit Expense</button>}
      </div>
    </Modal>
  );
}

/* ================================================================
   5. Vendor Payment Modal (3 Steps)
   ================================================================ */
export function VendorPaymentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const toast = useToast();
  const steps = [{ label: "Select Vendor", icon: "bi-shop" }, { label: "Payment Details", icon: "bi-cash" }, { label: "Confirm", icon: "bi-check-lg" }];
  return (
    <Modal open={open} onClose={onClose} title="Process Vendor Payment" subtitle={`Step ${step + 1} of 3: ${steps[step].label}`} icon="bi-bank" tone="blue" size="lg">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / 3) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && <div className="d-flex flex-column gap-2">
          {["Safaricom PLC (M-Pesa)", "Visa Kenya", "AWS Kenya", "Onfido Ltd", "KCB Bank"].map(v => (
            <button key={v} className="pm-opt" onClick={() => setStep(1)}><div className="r" /><span className="pm-td-strong">{v}</span></button>
          ))}
        </div>}
        {step === 1 && <div className="d-flex flex-column gap-2">
          <label className="form-label">Payment Amount (KES)</label><input className="form-control" type="number" placeholder="e.g. 12400000" />
          <label className="form-label">Payment Reference</label><input className="form-control" placeholder="e.g. PAY-2026-0847" />
          <label className="form-label">Payment Method</label>
          <select className="form-select"><option>Bank Transfer (KCB)</option><option>M-Pesa Business</option><option>RTGS</option><option>SWIFT</option></select>
          <label className="form-label">Notes</label><textarea className="form-control" rows={2} placeholder="Payment for August 2026 settlement" />
        </div>}
        {step === 2 && <div className="pm-card pm-card-pad">
          <div className="pm-eyebrow mb-2">Payment Confirmation</div>
          <div className="pm-kv"><span className="k">Vendor</span><span className="v">Safaricom PLC</span></div>
          <div className="pm-kv"><span className="k">Amount</span><span className="v" style={{ fontWeight: 800 }}>{kes(12400000)}</span></div>
          <div className="pm-kv"><span className="k">Method</span><span className="v">Bank Transfer (KCB)</span></div>
          <div className="pm-kv"><span className="k">Reference</span><span className="v mono">PAY-2026-0847</span></div>
          <div className="pm-note mt-3"><i className="bi bi-info-circle me-1" />This action requires 2FA confirmation. Payment will be queued for processing.</div>
        </div>}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(s => s - 1)}>← Back</button>}
        {step < 2 ? <button className="btn btn-primary btn-sm" onClick={() => setStep(s => s + 1)}>Continue →</button>
          : <button className="btn btn-primary btn-sm" onClick={() => { toast({ kind: "success", title: "Payment processed", body: "Funds will arrive within 24h" }); onClose(); }}><i className="bi bi-check2 me-1" />Process Payment</button>}
      </div>
    </Modal>
  );
}

/* ================================================================
   6. Budget Allocation Modal
   ================================================================ */
export function BudgetAllocationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const depts = [
    { dept: "Engineering", allocated: 45000000, spent: 28000000, pct: 62 },
    { dept: "Operations", allocated: 18000000, spent: 12000000, pct: 67 },
    { dept: "Marketing", allocated: 12000000, spent: 8500000, pct: 71 },
    { dept: "Compliance", allocated: 8000000, spent: 4200000, pct: 53 },
    { dept: "HR", allocated: 6000000, spent: 3800000, pct: 63 },
    { dept: "Legal", allocated: 4000000, spent: 1500000, pct: 38 },
  ];
  return (
    <Modal open={open} onClose={onClose} title="Budget Allocation" subtitle="Q4 2026 departmental budget" icon="bi-clipboard-data" tone="blue" size="xl">
      <div className="pm-modal-body">
        <div className="row g-2 mb-3">
          {depts.map(d => (
            <div key={d.dept} className="col-6">
              <div className="pm-card pm-card-pad">
                <div className="d-flex justify-content-between mb-1"><span className="pm-td-strong">{d.dept}</span><span className="pm-td-sub">{d.pct}%</span></div>
                <div className="pm-meter"><span style={{ width: `${d.pct}%` }} /></div>
                <div className="d-flex justify-content-between mt-1"><span className="pm-td-sub">Spent: {kes(d.spent)}</span><span className="pm-td-sub">Budget: {kes(d.allocated)}</span></div>
              </div>
            </div>
          ))}
        </div>
        <div className="pm-card pm-card-pad">
          <div className="pm-kv"><span className="k">Total Q4 Budget</span><span className="v" style={{ fontWeight: 800 }}>{kes(93000000)}</span></div>
          <div className="pm-kv"><span className="k">Spent</span><span className="v">{kes(58000000)}</span></div>
          <div className="pm-kv"><span className="k">Remaining</span><span className="v" style={{ color: "var(--pm-green)" }}>{kes(35000000)}</span></div>
        </div>
      </div>
    </Modal>
  );
}

/* ================================================================
   7. P&L Statement Modal
   ================================================================ */
export function PnLStatementModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [period, setPeriod] = useState("Q2 2026");
  return (
    <Modal open={open} onClose={onClose} title="Profit & Loss Statement" subtitle={`PayMo Digital Bank Ltd · ${period}`} icon="bi-graph-up-arrow" tone="green" size="xl">
      <div className="pm-modal-body">
        <div className="d-flex gap-2 mb-3">
          {["Q2 2026", "Q1 2026", "FY 2025"].map(p => (
            <button key={p} className={`btn btn-sm ${period === p ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setPeriod(p)}>{p}</button>
          ))}
        </div>
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Line Item</th><th className="text-end">Amount (KES)</th><th className="text-end">% Revenue</th><th className="text-end">vs Prior</th></tr></thead>
            <tbody>
              <tr><td colSpan={4} className="pm-td-strong" style={{ background: "#fafbfd" }}>Revenue</td></tr>
              {([
                ["Transaction Fees", 142000000, "76.3%", "↑ 12%"],
                ["Card Fees", 18500000, "9.9%", "↑ 8%"],
                ["Utility Commissions", 12800000, "6.9%", "→ 0%"],
                ["Subscription (VIP)", 8200000, "4.4%", "↑ 15%"],
                ["FX Margins", 4500000, "2.4%", "↓ 3%"],
              ] as [string, number, string, string][]).map(([item, amt, pct, vs]) => (
                <tr key={item}><td>{item}</td><td className="text-end mono">{kes(amt)}</td><td className="text-end">{pct}</td><td className="text-end">{vs}</td></tr>
              ))}
              <tr><td className="pm-td-strong">Total Revenue</td><td className="text-end mono" style={{ fontWeight: 700 }}>{kes(186000000)}</td><td className="text-end">100%</td><td className="text-end">↑ 18.4%</td></tr>
              <tr><td colSpan={4} className="pm-td-strong" style={{ background: "#fafbfd" }}>Cost of Revenue</td></tr>
              {([["Payment Gateway", 34000000], ["Cloud Infrastructure", 12000000], ["KYC/AML", 8000000], ["Card Network", 6000000]] as [string, number][]).map(([item, amt]) => (
                <tr key={item}><td>{item}</td><td className="text-end mono" style={{ color: "var(--pm-danger)" }}>({kes(amt)})</td><td className="text-end">-{Math.round(amt / 186000000 * 100)}%</td><td></td></tr>
              ))}
              <tr><td className="pm-td-strong">Gross Profit</td><td className="text-end mono" style={{ fontWeight: 700 }}>{kes(126000000)}</td><td className="text-end">67.7%</td><td className="text-end">↑ 22%</td></tr>
              <tr><td colSpan={4} className="pm-td-strong" style={{ background: "#fafbfd" }}>Operating Expenses</td></tr>
              {([["Salaries", 38000000], ["Marketing", 12000000], ["Office", 4500000], ["Professional", 3200000], ["Depreciation", 2800000]] as [string, number][]).map(([item, amt]) => (
                <tr key={item}><td>{item}</td><td className="text-end mono" style={{ color: "var(--pm-danger)" }}>({kes(amt)})</td><td className="text-end">-{Math.round(amt / 186000000 * 100)}%</td><td></td></tr>
              ))}
              <tr><td className="pm-td-strong" style={{ borderTop: "2px solid var(--pm-border)" }}>Net Income</td><td className="text-end mono" style={{ fontWeight: 800, color: "var(--pm-green)" }}>{kes(65500000)}</td><td className="text-end">35.2%</td><td className="text-end">↑ 28%</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}

/* ================================================================
   8. Cash Flow Forecast Modal
   ================================================================ */
export function CashFlowForecastModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Cash Flow Forecast" subtitle="12-month rolling forecast" icon="bi-bar-chart-line" tone="blue" size="xl">
      <div className="pm-modal-body">
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Month</th><th className="text-end">Inflows</th><th className="text-end">Outflows</th><th className="text-end">Net</th><th className="text-end">Balance</th></tr></thead>
            <tbody>
              {([
                ["Aug 2026", 186000000, 120500000, 65500000, 892000000],
                ["Sep 2026", 195000000, 125000000, 70000000, 962000000],
                ["Oct 2026", 204000000, 130000000, 74000000, 1036000000],
                ["Nov 2026", 212000000, 134000000, 78000000, 1114000000],
                ["Dec 2026", 225000000, 140000000, 85000000, 1199000000],
                ["Jan 2027", 218000000, 138000000, 80000000, 1279000000],
              ] as [string, number, number, number, number][]).map(([m, inf, out, net, bal]) => (
                <tr key={m}>
                  <td className="pm-td-strong">{m}</td>
                  <td className="text-end mono" style={{ color: "var(--pm-green)" }}>{kes(inf)}</td>
                  <td className="text-end mono" style={{ color: "var(--pm-danger)" }}>{kes(out)}</td>
                  <td className="text-end mono" style={{ fontWeight: 700 }}>{kes(net)}</td>
                  <td className="text-end mono">{kes(bal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pm-card pm-card-pad mt-3">
          <div className="pm-kv"><span className="k">Projected Cash (12mo)</span><span className="v" style={{ fontWeight: 800 }}>{kes(1279000000)}</span></div>
          <div className="pm-kv"><span className="k">Runway</span><span className="v">18+ months</span></div>
        </div>
      </div>
    </Modal>
  );
}

/* ================================================================
   9. Vesting Schedule Modal
   ================================================================ */
export function VestingScheduleModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Vesting Schedule" subtitle="All founders" icon="bi-calendar-check" tone="violet" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Tranche</th><th>Date</th><th>Shares</th><th>Status</th><th className="text-end">Value</th></tr></thead>
            <tbody>
              {([
                ["Tranche 1 (Year 1)", "Jan 2025", "1,250,000", "Vested", kes(375000000)],
                ["Tranche 2 (Year 2)", "Jan 2026", "1,250,000", "Vested", kes(375000000)],
                ["Tranche 3 (Year 3)", "Jan 2027", "1,250,000", "Cliff", kes(375000000)],
                ["Tranche 4 (Year 4)", "Jan 2028", "1,250,000", "Unvested", kes(375000000)],
              ] as [string, string, string, string, string][]).map(([t, d, s, st, v]) => (
                <tr key={t}>
                  <td className="pm-td-strong">{t}</td><td>{d}</td><td className="mono">{s}</td>
                  <td><Badge tone={st === "Vested" ? "green" : st.includes("Cliff") ? "amber" : "blue"}>{st}</Badge></td>
                  <td className="text-end mono">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}

/* ================================================================
   10. Cap Table Modal
   ================================================================ */
export function CapTableModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Cap Table" subtitle="Full capitalization table" icon="bi-grid-3x3" tone="blue" size="xl">
      <div className="pm-modal-body">
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Shareholder</th><th>Type</th><th className="text-end">Shares</th><th className="text-end">%</th><th className="text-end">Invested</th><th className="text-end">Value</th><th>MOIC</th></tr></thead>
            <tbody>
              {([
                ["Jeckonia Kwasa", "Common", "5,000,000", "50.0%", 50000000, 1235000000, "24.7x"],
                ["VC Fund A", "Preferred A", "2,000,000", "20.0%", 200000000, 494000000, "2.5x"],
                ["Angel Investor B", "Common", "1,000,000", "10.0%", 30000000, 247000000, "8.2x"],
                ["VC Fund C", "Preferred B", "1,500,000", "15.0%", 450000000, 370500000, "0.8x"],
                ["ESOP Pool", "Options", "500,000", "5.0%", 0, 123500000, "—"],
              ] as [string, string, string, string, number, number, string][]).map(([name, type, shares, pct, inv, val, moic]) => (
                <tr key={name}>
                  <td className="pm-td-strong">{name}</td><td><Badge tone="blue">{type}</Badge></td>
                  <td className="text-end mono">{shares}</td><td className="text-end" style={{ fontWeight: 700 }}>{pct}</td>
                  <td className="text-end mono">{kes(inv)}</td><td className="text-end mono" style={{ fontWeight: 700 }}>{kes(val)}</td><td>{moic}</td>
                </tr>
              ))}
              <tr style={{ fontWeight: 700, borderTop: "2px solid var(--pm-border)" }}>
                <td>Total</td><td></td><td className="text-end mono">10,000,000</td><td className="text-end">100%</td><td className="text-end mono">{kes(730000000)}</td><td className="text-end mono">{kes(2470000000)}</td><td>3.4x</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}

/* ================================================================
   11. Treasury Account Modal
   ================================================================ */
export function TreasuryAccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Corporate Treasury" subtitle="Company bank accounts & balances" icon="bi-wallet2" tone="green" size="xl">
      <div className="pm-modal-body">
        {([
          { bank: "KCB Bank", acc: "1234567890", name: "Operating Account", balance: 450000000, currency: "KES" },
          { bank: "Equity Bank", acc: "9876543210", name: "Settlement Account", balance: 234000000, currency: "KES" },
          { bank: "Standard Chartered", acc: "SC-456789", name: "International Account", balance: 1200000, currency: "USD" },
          { bank: "NCBA Bank", acc: "NC-123456", name: "Reserve Account", balance: 189000000, currency: "KES" },
          { bank: "Safaricom M-Pesa", acc: "PAYMO-001", name: "M-Pesa Business", balance: 56000000, currency: "KES" },
        ]).map(a => (
          <div key={a.acc} className="pm-alert-row mb-2">
            <div style={{ width: 36, height: 36, borderRadius: 9, display: "grid", placeItems: "center", fontSize: ".85rem", fontWeight: 700, background: "var(--pm-green)", color: "#fff", flex: "none" }}>{a.bank[0]}</div>
            <div className="flex-grow-1">
              <div className="pm-td-strong">{a.name}</div>
              <div className="pm-td-sub mono">{a.bank} · {a.acc}</div>
            </div>
            <div className="text-end">
              <div style={{ fontWeight: 700, fontSize: ".95rem" }}>{a.currency === "KES" ? kes(a.balance) : `$${(a.balance / 1000).toLocaleString()}K`}</div>
              <div className="pm-td-sub">{a.currency}</div>
            </div>
          </div>
        ))}
        <div className="pm-card pm-card-pad mt-2">
          <div className="pm-kv"><span className="k">Total Treasury</span><span className="v" style={{ fontWeight: 800 }}>{kes(929000000)} + $1.2M</span></div>
        </div>
      </div>
    </Modal>
  );
}

/* ================================================================
   12. Dividend Distribution Modal
   ================================================================ */
export function DividendModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  return (
    <Modal open={open} onClose={onClose} title="Dividend Distribution" subtitle="Declare and distribute dividends" icon="bi-cash-stack" tone="amber" size="lg">
      <div className="pm-modal-body">
        <label className="form-label">Dividend Per Share (KES)</label>
        <input className="form-control mb-3" type="number" placeholder="e.g. 25" />
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-eyebrow mb-2">Projected Distribution</div>
          {([
            ["Jeckonia Kwasa (50%)", kes(62500000)],
            ["VC Fund A (20%)", kes(25000000)],
            ["Angel B (10%)", kes(12500000)],
            ["VC Fund C (15%)", kes(18750000)],
            ["ESOP Pool (5%)", kes(6250000)],
          ] as [string, string][]).map(([name, amt]) => (
            <div key={name} className="pm-kv"><span className="k">{name}</span><span className="v">{amt}</span></div>
          ))}
          <div className="pm-kv" style={{ borderTop: "1px solid var(--pm-border)", paddingTop: ".5rem", marginTop: ".3rem" }}><span className="k" style={{ fontWeight: 800 }}>Total</span><span className="v" style={{ fontWeight: 800 }}>{kes(125000000)}</span></div>
        </div>
        <div className="pm-note"><i className="bi bi-info-circle me-1" />Dividend declaration requires Board resolution and CBK notification. Tax withholding at 5% (residents), 15% (non-residents).</div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => { toast({ kind: "success", title: "Dividend declared", body: "Distribution processes in T+2 days" }); onClose(); }}><i className="bi bi-check2 me-1" />Declare Dividend</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   13. Compliance Status Modal
   ================================================================ */
export function ComplianceStatusModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Regulatory Compliance" subtitle="CBK, ODPC, and KRA compliance status" icon="bi-shield-check" tone="green" size="xl">
      <div className="pm-modal-body">
        {[
          { reg: "CBK PSP License", status: "Active", expires: "Jan 2027", items: ["Capital adequacy", "Reporting up to date", "Audit clean"] },
          { reg: "Data Protection (ODPC)", status: "Active", expires: "Jun 2027", items: ["DPO registered", "DPIA completed", "Breach protocol"] },
          { reg: "KRA Tax Compliance", status: "Active", expires: "Dec 2026", items: ["VAT returns", "Income tax", "Withholding tax"] },
          { reg: "AML/CFT Compliance", status: "Active", expires: "Ongoing", items: ["KYC program", "STR filing", "Staff training"] },
        ].map(r => (
          <div key={r.reg} className="pm-card pm-card-pad mb-2">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <div className="pm-td-strong">{r.reg}</div>
              <Badge tone="green">{r.status}</Badge>
            </div>
            <div className="pm-td-sub mb-2">Expires: {r.expires}</div>
            <div className="d-flex gap-3 flex-wrap">
              {r.items.map(i => <div key={i} style={{ fontSize: ".75rem" }}><i className="bi bi-check-circle-fill me-1" style={{ color: "var(--pm-green)", fontSize: ".65rem" }} />{i}</div>)}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ================================================================
   14. ESOP Management Modal
   ================================================================ */
export function ESOPManagementModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="ESOP Pool Management" subtitle="Employee Stock Option Plan" icon="bi-people" tone="violet" size="xl">
      <div className="pm-modal-body">
        <div className="row g-2 mb-3">
          {[{ label: "Total Pool", value: "500,000" }, { label: "Granted", value: "115,000" }, { label: "Vested", value: "34,500" }].map(s => (
            <div key={s.label} className="col-4"><div className="pm-stat text-center"><div className="pm-stat-label">{s.label}</div><div className="pm-stat-value" style={{ fontSize: "1.1rem" }}>{s.value}</div></div></div>
          ))}
        </div>
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Employee</th><th className="text-end">Granted</th><th className="text-end">Vested</th><th>Strike Price</th><th>Status</th></tr></thead>
            <tbody>
              {([
                ["Dan Delion (CTO)", "50,000", "15,000", "KES 50", "Active"],
                ["James Ochieng (VP Eng)", "30,000", "9,000", "KES 75", "Active"],
                ["Mary Wanjiku (CFO)", "25,000", "7,500", "KES 60", "Active"],
                ["David Mwangi (Head Ops)", "10,000", "3,000", "KES 80", "Active"],
              ] as [string, string, string, string, string][]).map(([name, granted, vested, price, status]) => (
                <tr key={name}>
                  <td className="pm-td-strong">{name}</td><td className="text-end mono">{granted}</td><td className="text-end mono">{vested}</td>
                  <td className="mono">{price}</td><td><Badge tone="green">{status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}

/* ================================================================
   15. Board Resolution Modal
   ================================================================ */
export function BoardResolutionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  return (
    <Modal open={open} onClose={onClose} title="Board Resolution" subtitle="Record and track board decisions" icon="bi-journal-text" tone="blue" size="lg">
      <div className="pm-modal-body">
        <label className="form-label">Resolution Number</label>
        <input className="form-control mb-3" placeholder="e.g. BR-2026-047" />
        <label className="form-label">Date of Meeting</label>
        <input className="form-control mb-3" type="date" />
        <label className="form-label">Resolution Subject</label>
        <input className="form-control mb-3" placeholder="e.g. Approval of Q4 budget allocation" />
        <label className="form-label">Resolution Text</label>
        <textarea className="form-control mb-3" rows={3} placeholder="RESOLVED THAT the Board approves..." />
        <label className="form-label">Voting Result</label>
        <div className="row g-2">
          <div className="col-4"><label className="form-label" style={{ fontSize: ".7rem" }}>For</label><input className="form-control" type="number" placeholder="5" /></div>
          <div className="col-4"><label className="form-label" style={{ fontSize: ".7rem" }}>Against</label><input className="form-control" type="number" placeholder="0" /></div>
          <div className="col-4"><label className="form-label" style={{ fontSize: ".7rem" }}>Abstain</label><input className="form-control" type="number" placeholder="1" /></div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => { toast({ kind: "success", title: "Resolution recorded" }); onClose(); }}><i className="bi bi-check2 me-1" />Record Resolution</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   16. Share Valuation Modal
   ================================================================ */
export function ShareValuationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Share Valuation" subtitle="Latest 409A valuation report" icon="bi-gem" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          {([
            ["Valuation Date", "Jun 30, 2026"],
            ["Valuation Firm", "Deloitte Kenya"],
            ["Methodology", "DCF + Comparable Transactions"],
          ] as [string, string][]).map(([k, v]) => (
            <div key={k} className="pm-kv"><span className="k">{k}</span><span className="v">{v}</span></div>
          ))}
        </div>
        <div className="row g-2 mb-3">
          {[{ l: "Pre-Money", v: "KES 2.2B" }, { l: "Post-Money", v: "KES 2.47B" }, { l: "Per Share", v: "KES 247" }, { l: "Discount Rate", v: "28%" }].map(x => (
            <div key={x.l} className="col-6"><div className="pm-stat"><div className="pm-stat-label">{x.l}</div><div className="pm-stat-value" style={{ fontSize: "1rem" }}>{x.v}</div></div></div>
          ))}
        </div>
        <div className="pm-card pm-card-pad">
          <div className="pm-eyebrow mb-2">Fair Market Value by Shareholder</div>
          {([
            ["Jeckonia Kwasa", "5,000,000", "KES 1,235,000,000"],
            ["VC Fund A", "2,000,000", "KES 494,000,000"],
            ["Angel B", "1,000,000", "KES 247,000,000"],
            ["VC Fund C", "1,500,000", "KES 370,500,000"],
            ["ESOP Pool", "500,000", "KES 123,500,000"],
          ] as [string, string, string][]).map(([name, shares, val]) => (
            <div key={name} className="pm-kv"><span className="k">{name} ({shares})</span><span className="v">{val}</span></div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

/* ================================================================
   17. Tax Filing Modal
   ================================================================ */
export function TaxFilingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Tax Filing Status" subtitle="KRA and county tax obligations" icon="bi-building-check" tone="red" size="lg">
      <div className="pm-modal-body">
        {([
          ["VAT (Monthly)", "Sep 20, 2026", "KES 29.8M", "Filed", "green"],
          ["Income Tax (Quarterly)", "Sep 30, 2026", "KES 18.2M", "Pending", "amber"],
          ["Withholding Tax", "Sep 20, 2026", "KES 4.5M", "Filed", "green"],
          ["PAYE (Monthly)", "Sep 9, 2026", "KES 12.3M", "Filed", "green"],
          ["NSSF (Monthly)", "Sep 15, 2026", "KES 890K", "Filed", "green"],
          ["NHIF (Monthly)", "Sep 9, 2026", "KES 450K", "Filed", "green"],
          ["Stamp Duty", "Ongoing", "KES 2.1M (YTD)", "Current", "blue"],
          ["County Business Permit", "Jan 2027", "KES 150K", "Current", "blue"],
        ] as [string, string, string, string, string][]).map(([tax, due, amount, status, tone]) => (
          <div key={tax} className="pm-alert-row mb-2">
            <Badge tone={tone as any}>{status}</Badge>
            <div className="flex-grow-1">
              <div className="pm-td-strong">{tax}</div>
              <div className="pm-td-sub">Due: {due}</div>
            </div>
            <div className="text-end mono" style={{ fontWeight: 700 }}>{amount}</div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ================================================================
   18-37: Remaining modals (simplified, same pattern)
   ================================================================ */
function SimpleDrawer({ open, onClose, title, subtitle, icon, tone, children }: { open: boolean; onClose: () => void; title: string; subtitle?: string; icon: string; tone: string; children: React.ReactNode }) {
  return (
    <Drawer open={open} onClose={onClose} title={title} subtitle={subtitle} icon={icon} tone={tone as any} half>
      {children}
    </Drawer>
  );
}

function SimpleModal({ open, onClose, title, subtitle, icon, tone, children, footer }: { open: boolean; onClose: () => void; title: string; subtitle?: string; icon: string; tone: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <Modal open={open} onClose={onClose} title={title} subtitle={subtitle} icon={icon} tone={tone as any} size="lg">
      <div className="pm-modal-body">{children}</div>
      {footer && <div className="pm-modal-foot">{footer}</div>}
    </Modal>
  );
}

export function ShareholderAgreementModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SimpleDrawer open={open} onClose={onClose} title="Shareholder Agreement" subtitle="SHA terms, rights & obligations" icon="bi-file-earmark-text" tone="blue">
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-eyebrow mb-2">SHA v2.1 — Key Terms</div>
        {[
          ["Agreement Type", "Multi-party SHA"],
          ["Effective Date", "January 15, 2024"],
          ["Governing Law", "Laws of Kenya"],
          ["Dispute Resolution", "Nairobi International Arbitration"],
          ["ROFR Period", "30 days"],
          ["Tag-Along", "Pro-rata participation"],
          ["Drag-Along", ">75% shareholder approval"],
          ["Anti-Dilution", "Broad-based weighted average"],
        ].map(([k, v]) => <div key={k} className="pm-kv"><span className="k">{k}</span><span className="v">{v}</span></div>)}
      </div>
      <div className="pm-card pm-card-pad">
        <div className="pm-eyebrow mb-2">Signed Parties</div>
        {["Jeckonia Kwasa — Founder & CEO", "Dan Delion — Co-Founder & CTO", "VC Fund A — Series A Lead", "Angel Investor B", "VC Fund C — Series B Lead"].map(p => (
          <div key={p} className="pm-kv"><span className="k">{p}</span><span className="v"><Badge tone="green" dot>Signed</Badge></span></div>
        ))}
      </div>
    </SimpleDrawer>
  );
}

export function DepartmentBudgetModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SimpleModal open={open} onClose={onClose} title="Department Budgets" subtitle="FY 2026-2027 allocations" icon="bi-clipboard-data" tone="blue">
      {[
        { dept: "Engineering", budget: 180000000, spent: 105000000, owner: "Dan Delion" },
        { dept: "Operations", budget: 72000000, spent: 48000000, owner: "James Ochieng" },
        { dept: "Marketing", budget: 48000000, spent: 32000000, owner: "Marketing Lead" },
        { dept: "Compliance", budget: 36000000, spent: 18000000, owner: "Compliance Officer" },
      ].map(d => {
        const pct = Math.round(d.spent / d.budget * 100);
        return (
          <div key={d.dept} className="pm-card pm-card-pad mb-2">
            <div className="d-flex justify-content-between mb-1"><span className="pm-td-strong">{d.dept}</span><span className="pm-td-sub">{pct}%</span></div>
            <div className="pm-meter"><span style={{ width: `${pct}%` }} /></div>
            <div className="d-flex justify-content-between mt-1"><span className="pm-td-sub">Spent: {kes(d.spent)}</span><span className="pm-td-sub">Budget: {kes(d.budget)}</span></div>
            <div className="pm-td-sub mt-1">Owner: {d.owner}</div>
          </div>
        );
      })}
    </SimpleModal>
  );
}

export function ExpenseReportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SimpleModal open={open} onClose={onClose} title="Expense Reports" subtitle="Corporate expenses — last 90 days" icon="bi-receipt" tone="amber" size="xl">
      <div className="pm-table-wrap">
        <table className="pm-table">
          <thead><tr><th>Date</th><th>Vendor</th><th>Description</th><th className="text-end">Amount</th><th>Status</th></tr></thead>
          <tbody>
            {[
              ["Aug 20", "Safaricom", "M-Pesa integration fee", "KES 10.3M", "Paid"],
              ["Aug 15", "AWS Kenya", "Cloud infrastructure", "KES 5.0M", "Paid"],
              ["Aug 10", "Onfido", "KYC verification credits", "KES 1.5M", "Pending"],
              ["Aug 5", "Deloitte", "Audit engagement", "KES 710K", "Approved"],
            ].map(([date, vendor, desc, amt, status], i) => (
              <tr key={i}><td className="pm-td-sub">{date}</td><td className="pm-td-strong">{vendor}</td><td>{desc}</td><td className="text-end mono" style={{ fontWeight: 700 }}>{amt}</td><td><Badge tone={status === "Paid" ? "green" : status === "Pending" ? "amber" : "blue"}>{status}</Badge></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </SimpleModal>
  );
}

export function VendorDirectoryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SimpleModal open={open} onClose={onClose} title="Vendor Directory" subtitle="All service providers and partners" icon="bi-shop" tone="blue" size="xl">
      {[
        { name: "Safaricom PLC", type: "M-Pesa Integration", contract: "KES 124M/yr", expires: "Mar 2027" },
        { name: "AWS Kenya", type: "Cloud Infrastructure", contract: "KES 54M/yr", expires: "Jan 2027" },
        { name: "Onfido Ltd", type: "KYC/AML Provider", contract: "KES 18M/yr", expires: "Feb 2027" },
        { name: "Visa Kenya", type: "Card Processing", contract: "KES 67M/yr", expires: "Jun 2026" },
        { name: "Deloitte Kenya", type: "Audit Services", contract: "KES 8.5M/yr", expires: "Dec 2026" },
      ].map(v => (
        <div key={v.name} className="pm-alert-row mb-2">
          <div style={{ width: 36, height: 36, borderRadius: 9, display: "grid", placeItems: "center", fontSize: ".8rem", fontWeight: 700, background: "var(--pm-blue)", color: "#fff", flex: "none" }}>{v.name[0]}</div>
          <div className="flex-grow-1">
            <div className="pm-td-strong">{v.name}</div>
            <div className="pm-td-sub">{v.type}</div>
          </div>
          <div className="text-end">
            <div style={{ fontWeight: 700, fontSize: ".82rem" }}>{v.contract}</div>
            <div className="pm-td-sub">Expires: {v.expires}</div>
          </div>
        </div>
      ))}
    </SimpleModal>
  );
}

export function LiquidityReserveModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SimpleModal open={open} onClose={onClose} title="Liquidity & Reserve Management" subtitle="Cash reserves, liquidity ratios, and sweep rules" icon="bi-droplet" tone="blue">
      <div className="row g-2 mb-3">
        {[{ l: "Total Reserves", v: "KES 929M" }, { l: "Liquidity Ratio", v: "289%" }, { l: "Required Minimum", v: "KES 321M" }, { l: "Excess Reserves", v: "KES 608M" }].map(x => (
          <div key={x.l} className="col-6"><div className="pm-stat"><div className="pm-stat-label">{x.l}</div><div className="pm-stat-value" style={{ fontSize: "1rem" }}>{x.v}</div></div></div>
        ))}
      </div>
      <div className="pm-card pm-card-pad">
        <div className="pm-eyebrow mb-2">Reserve Allocation</div>
        {[
          ["Operating Reserves", "KES 450M", "48.4%"],
          ["Settlement Reserves", "KES 234M", "25.2%"],
          ["Emergency Fund", "KES 100M", "10.8%"],
          ["International Reserves", "KES 145M (≈$1.2M)", "15.6%"],
        ].map(([name, amt, pct]) => <div key={name} className="pm-kv"><span className="k">{name}</span><span className="v">{amt} <span className="pm-td-sub">({pct})</span></span></div>)}
      </div>
    </SimpleModal>
  );
}

export function StrategicInvestmentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SimpleModal open={open} onClose={onClose} title="Strategic Investments" subtitle="Corporate investment portfolio" icon="bi-graph-up-arrow" tone="green">
      {[
        { name: "T-Bill Portfolio", value: "KES 200M", return: "12.8%", risk: "Low" },
        { name: "Money Market Fund", value: "KES 150M", return: "10.2%", risk: "Low" },
        { name: "Treasury Bond", value: "KES 100M", return: "14.5%", risk: "Medium" },
      ].map(i => (
        <div key={i.name} className="pm-card pm-card-pad mb-2">
          <div className="d-flex justify-content-between"><span className="pm-td-strong">{i.name}</span><Badge tone={i.risk === "Low" ? "green" : "amber"}>{i.risk}</Badge></div>
          <div className="pm-kv"><span className="k">Value</span><span className="v">{i.value}</span></div>
          <div className="pm-kv"><span className="k">Annual Return</span><span className="v" style={{ color: "var(--pm-green)" }}>{i.return}</span></div>
        </div>
      ))}
    </SimpleModal>
  );
}

export function GovernanceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SimpleDrawer open={open} onClose={onClose} title="Corporate Governance" subtitle="Board composition, committees & charters" icon="bi-bank" tone="violet">
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-eyebrow mb-2">Board of Directors</div>
        {[
          { name: "Jeckonia Kwasa", role: "Chairman & CEO", since: "Jan 2024" },
          { name: "Dan Delion", role: "Director & CTO", since: "Jan 2024" },
          { name: "Dr. Amina Osman", role: "Independent Director", since: "Mar 2024" },
          { name: "VC Fund A Rep", role: "Non-Executive Director", since: "Jan 2024" },
          { name: "VC Fund C Rep", role: "Non-Executive Director", since: "Jun 2024" },
        ].map(b => (
          <div key={b.name} className="pm-kv"><span className="k">{b.name} — {b.role}</span><span className="v pm-td-sub">Since {b.since}</span></div>
        ))}
      </div>
      <div className="pm-card pm-card-pad">
        <div className="pm-eyebrow mb-2">Committees</div>
        {["Audit & Risk Committee", "Remuneration Committee", "Nomination Committee"].map(c => (
          <div key={c} className="pm-kv"><span className="k">{c}</span><span className="v"><Badge tone="blue">Active</Badge></span></div>
        ))}
      </div>
    </SimpleDrawer>
  );
}

export function KycExpiryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SimpleModal open={open} onClose={onClose} title="KYC Document Expiry" subtitle="Documents requiring renewal" icon="bi-calendar-x" tone="amber">
      {[
        { doc: "CBK Annual Return", holder: "PayMo Ltd", expires: "Sep 30, 2026", days: 35 },
        { doc: "David Mwangi Passport", holder: "Director", expires: "Oct 15, 2026", days: 50 },
        { doc: "VC Fund A Certificate", holder: "Investor", expires: "Nov 1, 2026", days: 67 },
        { doc: "Equity Bank Mandate", holder: "Settlement", expires: "Dec 31, 2026", days: 127 },
      ].map(d => (
        <div key={d.doc} className="pm-alert-row mb-2">
          <div className="flex-grow-1">
            <div className="pm-td-strong">{d.doc}</div>
            <div className="pm-td-sub">{d.holder}</div>
          </div>
          <div className="text-end">
            <Badge tone={d.days < 45 ? "red" : d.days < 90 ? "amber" : "blue"}>{d.days}d</Badge>
            <div className="pm-td-sub mt-1">{d.expires}</div>
          </div>
        </div>
      ))}
    </SimpleModal>
  );
}

export function ShareBuybackModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  return (
    <SimpleModal open={open} onClose={onClose} title="Share Buyback Program" subtitle="Repurchase authorized shares" icon="bi-arrow-counterclockwise" tone="blue"
      footer={<><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button><button className="btn btn-primary btn-sm" onClick={() => { toast({ kind: "success", title: "Buyback initiated" }); onClose(); }}>Authorize Buyback</button></>}>
      <div className="row g-2 mb-3">
        {[{ l: "Authorized Amount", v: "KES 200M" }, { l: "Max Shares", v: "810,000" }, { l: "Current Price", v: "KES 247" }, { l: "Budget Used", v: "KES 0" }].map(x => (
          <div key={x.l} className="col-6"><div className="pm-stat"><div className="pm-stat-label">{x.l}</div><div className="pm-stat-value" style={{ fontSize: "1rem" }}>{x.v}</div></div></div>
        ))}
      </div>
      <label className="form-label">Buyback Price per Share (KES)</label>
      <input className="form-control mb-3" type="number" placeholder="e.g. 247" />
      <label className="form-label">Number of Shares</label>
      <input className="form-control mb-3" type="number" placeholder="e.g. 100000" />
      <label className="form-label">Reason</label>
      <textarea className="form-control" rows={2} placeholder="Board resolution reference..." />
    </SimpleModal>
  );
}

export function RelatedPartyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SimpleDrawer open={open} onClose={onClose} title="Related Party Transactions" subtitle="Transactions with related parties per CBK requirements" icon="bi-link-45deg" tone="amber">
      {[
        { party: "Safaricom PLC", nature: "Service agreement", amount: "KES 124M/yr", approved: true },
        { party: "Jeckonia Kwasa (personal)", nature: "Director loan — waived", amount: "KES 0", approved: true },
        { party: "VC Fund A", nature: "Board observer fees", amount: "KES 1.2M/yr", approved: true },
      ].map(r => (
        <div key={r.party} className="pm-card pm-card-pad mb-2">
          <div className="d-flex justify-content-between"><span className="pm-td-strong">{r.party}</span><Badge tone={r.approved ? "green" : "amber"}>{r.approved ? "Approved" : "Pending"}</Badge></div>
          <div className="pm-kv"><span className="k">Nature</span><span className="v">{r.nature}</span></div>
          <div className="pm-kv"><span className="k">Annual Value</span><span className="v">{r.amount}</span></div>
        </div>
      ))}
    </SimpleDrawer>
  );
}

export function StrategicPlanModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SimpleModal open={open} onClose={onClose} title="Strategic Plan 2026-2028" subtitle="Three-year growth roadmap" icon="bi-bullseye" tone="green">
      {[
        { milestone: "Launch credit scoring product", target: "Q4 2026", progress: 45 },
        { milestone: "1M active users", target: "Q2 2027", progress: 72 },
        { milestone: "Expand to Uganda & Tanzania", target: "Q4 2027", progress: 15 },
        { milestone: "Series C fundraise ($50M)", target: "Q1 2027", progress: 30 },
        { milestone: "Profitability (EBITDA positive)", target: "Q3 2027", progress: 63 },
      ].map(m => (
        <div key={m.milestone} className="pm-card pm-card-pad mb-2">
          <div className="d-flex justify-content-between mb-1"><span className="pm-td-strong">{m.milestone}</span><span className="pm-td-sub">Target: {m.target}</span></div>
          <div className="pm-meter"><span style={{ width: `${m.progress}%` }} /></div>
          <div className="pm-td-sub mt-1">{m.progress}% complete</div>
        </div>
      ))}
    </SimpleModal>
  );
}

export function IpTrademarksModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SimpleDrawer open={open} onClose={onClose} title="IP & Trademarks" subtitle="Intellectual property portfolio" icon="bi-award" tone="violet">
      {[
        { name: "PayMo® Trademark", type: "Trademark", status: "Registered", reg: "KE/TM/2024/12345" },
        { name: "PayMo Logo", type: "Design", status: "Registered", reg: "KE/DM/2024/6789" },
        { name: "Mobile App Source Code", type: "Copyright", status: "Protected", reg: "KE/CR/2024/1111" },
        { name: "Payment Gateway API", type: "Trade Secret", status: "Confidential", reg: "Internal" },
      ].map(ip => (
        <div key={ip.name} className="pm-card pm-card-pad mb-2">
          <div className="d-flex justify-content-between"><span className="pm-td-strong">{ip.name}</span><Badge tone="blue">{ip.type}</Badge></div>
          <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone="green">{ip.status}</Badge></span></div>
          <div className="pm-kv"><span className="k">Registration</span><span className="v mono">{ip.reg}</span></div>
        </div>
      ))}
    </SimpleDrawer>
  );
}

export function InsuranceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SimpleModal open={open} onClose={onClose} title="Corporate Insurance" subtitle="Active policies and coverage" icon="bi-shield-check" tone="green">
      {[
        { policy: "Directors & Officers (D&O)", insurer: "Jubilee Insurance", premium: "KES 2.4M/yr", expires: "Dec 2026" },
        { policy: "Cyber Liability", insurer: "APL Insurance", premium: "KES 3.8M/yr", expires: "Jun 2027" },
        { policy: "Professional Indemnity", insurer: "Britam", premium: "KES 1.9M/yr", expires: "Mar 2027" },
        { policy: "Property & Business", insurer: "UAP Old Mutual", premium: "KES 890K/yr", expires: "Sep 2026" },
      ].map(p => (
        <div key={p.policy} className="pm-alert-row mb-2">
          <div className="flex-grow-1">
            <div className="pm-td-strong">{p.policy}</div>
            <div className="pm-td-sub">{p.insurer}</div>
          </div>
          <div className="text-end">
            <div style={{ fontWeight: 700, fontSize: ".82rem" }}>{p.premium}</div>
            <div className="pm-td-sub">Expires: {p.expires}</div>
          </div>
        </div>
      ))}
    </SimpleModal>
  );
}

export function ScenarioModelingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SimpleModal open={open} onClose={onClose} title="Scenario Modeling" subtitle="What-if analysis for financial planning" icon="bi-magic" tone="violet">
      {[
        { scenario: "Base Case", revenue: "KES 720M", netIncome: "KES 180M", runway: "18mo" },
        { scenario: "Bull Case (+30%)", revenue: "KES 936M", netIncome: "KES 270M", runway: "24mo+" },
        { scenario: "Bear Case (-20%)", revenue: "KES 576M", netIncome: "KES 72M", runway: "12mo" },
      ].map(s => (
        <div key={s.scenario} className="pm-card pm-card-pad mb-2">
          <div className="pm-eyebrow mb-1">{s.scenario}</div>
          <div className="pm-kv"><span className="k">Annual Revenue</span><span className="v">{s.revenue}</span></div>
          <div className="pm-kv"><span className="k">Net Income</span><span className="v">{s.netIncome}</span></div>
          <div className="pm-kv"><span className="k">Runway</span><span className="v">{s.runway}</span></div>
        </div>
      ))}
    </SimpleModal>
  );
}

export function AnnualReportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SimpleDrawer open={open} onClose={onClose} title="Annual Report & Audit" subtitle="FY 2025 annual report status" icon="bi-file-earmark-pdf" tone="blue">
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-eyebrow mb-2">FY 2025 Report Status</div>
        {[
          ["Audit Completion", <Badge tone="green">Complete</Badge>],
          ["Board Approval", <Badge tone="green">Approved</Badge>],
          ["CBK Filing", <Badge tone="amber">Pending</Badge>],
          ["KRA Submission", <Badge tone="green">Filed</Badge>],
          ["Public Disclosure", <Badge tone="blue">Scheduled Oct</Badge>],
        ].map(([k, v]) => <div key={k as string} className="pm-kv"><span className="k">{k}</span><span className="v">{v}</span></div>)}
      </div>
      <div className="pm-card pm-card-pad">
        <div className="pm-eyebrow mb-2">Key Financials (FY 2025)</div>
        {[
          ["Revenue", "KES 1.86B"],
          ["Net Income", "KES 324M"],
          ["Total Assets", "KES 2.1B"],
          ["Total Liabilities", "KES 840M"],
          ["Shareholders' Equity", "KES 1.26B"],
        ].map(([k, v]) => <div key={k} className="pm-kv"><span className="k">{k}</span><span className="v">{v}</span></div>)}
      </div>
    </SimpleDrawer>
  );
}

export function EmergencyFundModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SimpleModal open={open} onClose={onClose} title="Emergency Fund" subtitle="Reserved for critical operational needs" icon="bi-exclamation-triangle" tone="amber">
      <div className="row g-2 mb-3">
        {[{ l: "Fund Size", v: "KES 100M" }, { l: "Utilization", v: "0%" }, { l: "Last Draw", v: "Never" }, { l: "Refill Policy", v: "Auto" }].map(x => (
          <div key={x.l} className="col-6"><div className="pm-stat"><div className="pm-stat-label">{x.l}</div><div className="pm-stat-value" style={{ fontSize: "1rem" }}>{x.v}</div></div></div>
        ))}
      </div>
      <div className="pm-card pm-card-pad">
        <div className="pm-eyebrow mb-2">Authorization Rules</div>
        {["Requires CEO + CFO dual approval", "CBK notification within 24 hours", "Board ratification at next meeting", "Automatic replenishment from reserves"].map(r => (
          <div key={r} className="pm-kv"><span className="k"><i className="bi bi-check-circle-fill me-1" style={{ color: "var(--pm-green)", fontSize: ".7rem" }} />{r}</span></div>
        ))}
      </div>
    </SimpleModal>
  );
}

export function MarketAnalysisModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SimpleModal open={open} onClose={onClose} title="Market Analysis" subtitle="Kenya digital payments market landscape" icon="bi-globe" tone="blue" size="xl">
      <div className="row g-2 mb-3">
        {[{ l: "Market Size", v: "KES 4.2T" }, { l: "PayMo Share", v: "0.8%" }, { l: "Growth Rate", v: "23% YoY" }, { l: "Competitors", v: "12 active" }].map(x => (
          <div key={x.l} className="col-6"><div className="pm-stat"><div className="pm-stat-label">{x.l}</div><div className="pm-stat-value" style={{ fontSize: "1rem" }}>{x.v}</div></div></div>
        ))}
      </div>
      <div className="pm-card pm-card-pad">
        <div className="pm-eyebrow mb-2">Competitive Position</div>
        {[
          ["M-Pesa (Safaricom)", "65% market share", "red"],
          ["Airtel Money", "12% market share", "amber"],
          ["Equity Eazzy Banking", "8% market share", "amber"],
          ["PayMo", "0.8% (growing 3x YoY)", "green"],
        ].map(([name, share, tone]) => (
          <div key={name} className="pm-kv"><span className="k">{name}</span><span className="v"><Badge tone={tone as any}>{share}</Badge></span></div>
        ))}
      </div>
    </SimpleModal>
  );
}

export function ShareholderCommModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  return (
    <SimpleModal open={open} onClose={onClose} title="Shareholder Communication" subtitle="Send updates to all shareholders" icon="bi-envelope" tone="blue"
      footer={<><button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button><button className="btn btn-primary btn-sm" onClick={() => { toast({ kind: "success", title: "Communication sent" }); onClose(); }}>Send Update</button></>}>
      <label className="form-label">Subject</label>
      <input className="form-control mb-3" placeholder="e.g. Q2 2026 Financial Update" />
      <label className="form-label">Recipients</label>
      <div className="d-flex flex-column gap-2 mb-3">
        {["Jeckonia Kwasa (CEO)", "Dan Delion (CTO)", "VC Fund A", "Angel Investor B", "VC Fund C"].map(r => (
          <label key={r} className="d-flex align-items-center gap-2" style={{ fontSize: ".82rem" }}><input type="checkbox" className="form-check-input" defaultChecked />{r}</label>
        ))}
      </div>
      <label className="form-label">Message</label>
      <textarea className="form-control" rows={4} placeholder="Shareholder update content..." />
    </SimpleModal>
  );
}

export function FundraisingPipelineModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SimpleModal open={open} onClose={onClose} title="Fundraising Pipeline" subtitle="Investor pipeline and round status" icon="bi-rocket" tone="green" size="xl">
      {[
        { investor: "Sequoia Capital", round: "Series C", amount: "$50M", stage: "Term Sheet", tone: "green" },
        { investor: "Tiger Global", round: "Series C", amount: "$30M", stage: "Due Diligence", tone: "blue" },
        { investor: "TLcom Capital", round: "Series C", amount: "$20M", stage: "First Meeting", tone: "amber" },
        { investor: "IFC (World Bank)", round: "Strategic", amount: "$25M", stage: "LOI Signed", tone: "green" },
      ].map(i => (
        <div key={i.investor} className="pm-alert-row mb-2">
          <div className="flex-grow-1">
            <div className="pm-td-strong">{i.investor}</div>
            <div className="pm-td-sub">{i.round} · {i.amount}</div>
          </div>
          <Badge tone={i.tone}>{i.stage}</Badge>
        </div>
      ))}
      <div className="pm-card pm-card-pad mt-2">
        <div className="pm-kv"><span className="k">Target Raise</span><span className="v" style={{ fontWeight: 800 }}>$100M</span></div>
        <div className="pm-kv"><span className="k">Committed</span><span className="v">$75M</span></div>
        <div className="pm-kv"><span className="k">Expected Close</span><span className="v">Q1 2027</span></div>
      </div>
    </SimpleModal>
  );
}

export function CorporateActionsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <SimpleDrawer open={open} onClose={onClose} title="Corporate Actions" subtitle="Historical and pending corporate decisions" icon="bi-clipboard-data" tone="blue">
      <div className="pm-timeline">
        {[
          { action: "Series B closing", date: "Jun 2024", status: "done", detail: "KES 450M raised from VC Fund C" },
          { action: "CBK license granted", date: "Apr 2024", status: "done", detail: "PSP/2024/00847" },
          { action: "ESOP pool established", date: "Jan 2024", status: "done", detail: "500,000 shares allocated" },
          { action: "Series C fundraise", date: "Q1 2027 (planned)", status: "warn", detail: "Target $100M" },
          { action: "NSE listing evaluation", date: "2028 (planned)", status: "warn", detail: "Under feasibility study" },
        ].map((c, i) => (
          <div key={i} className={`pm-tl-item ${c.status}`}>
            <div className="pm-td-strong">{c.action}</div>
            <div className="pm-td-sub">{c.date}</div>
            <div style={{ fontSize: ".78rem" }}>{c.detail}</div>
          </div>
        ))}
      </div>
    </SimpleDrawer>
  );
}
