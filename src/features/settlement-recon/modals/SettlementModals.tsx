import { useState } from "react";
import { Avatar, Badge, Drawer, EmptyState, Meter, Modal, Steps, TwoFactorField, useToast } from "../../../components/ui";
import { csvDownload, jsonDownload, kes, num } from "../../../lib/format";
import type { BankAccount, ReconBreak, ReconChannel, ReconDay, SettlementRun, StatementFile, SuspenseEntry } from "../data/settlementData";
import { BANK_ACCOUNTS, BREAKS, RECON_CHANNELS, RECON_CONFIG, STATEMENTS, SUSPENSE } from "../data/settlementData";

const statusTone = (s: string) =>
  s === "Completed" || s === "Matched" || s === "Imported" || s === "Resolved" || s === "Active" ? "green"
    : s === "Scheduled" || s === "Processing" || s === "In transit" || s === "Pending" || s === "Under review" ? "blue"
      : s === "Overdue" || s === "Failed" || s === "Escalated" || s === "Major" ? "red"
        : s === "On hold" || s === "Minor" || s === "Investigating" || s === "Awaiting" ? "amber" : "grey";

const typeTone = (t: string) =>
  t === "Timing difference" ? "blue" : t === "Amount mismatch" ? "amber"
    : t === "Duplicate posting" ? "violet" : t === "Orphan partner record" ? "grey" : "red";

/* ================================================================
   1. Settlement run detail drawer
   ================================================================ */
export function RunDrawer({
  run, onClose, onRun, onHold, onMarkPaid, onResettle, onBreaks,
}: {
  run: SettlementRun | null;
  onClose: () => void;
  onRun: (r: SettlementRun) => void;
  onHold: (r: SettlementRun) => void;
  onMarkPaid: (r: SettlementRun) => void;
  onResettle: (r: SettlementRun) => void;
  onBreaks: () => void;
}) {
  if (!run) return null;
  const tone = statusTone(run.status);
  return (
    <Drawer open onClose={onClose} wide icon="bi-arrow-left-right"
      tone={run.status === "Overdue" || run.status === "Failed" ? "red" : run.status === "Completed" ? "green" : run.status === "On hold" ? "amber" : "blue"}
      title={run.partner} subtitle={`${run.id} · ${run.type} · ${run.method} · ${run.pool}`}
      headExtra={<Badge tone={tone} dot>{run.status}</Badge>}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => { jsonDownload(`${run.id}.json`, run); }}>
            <i className="bi bi-download me-1" />JSON
          </button>
          {(run.status === "Overdue" || run.status === "On hold" || run.status === "Failed") && (
            <button className="btn btn-outline-secondary btn-sm" onClick={() => onHold(run)} disabled={run.status === "On hold"}>
              <i className="bi bi-pause me-1" />Hold
            </button>
          )}
          {run.status === "Failed" && (
            <button className="btn btn-outline-secondary btn-sm" onClick={() => onResettle(run)}>
              <i className="bi bi-arrow-repeat me-1" />Resettle
            </button>
          )}
          {run.status !== "Completed" ? (
            <button className="btn btn-primary btn-sm flex-grow-1" onClick={() => onRun(run)}>
              <i className="bi bi-play-fill me-1" />Run settlement now
            </button>
          ) : (
            <button className="btn btn-primary btn-sm flex-grow-1" onClick={onClose}>Close</button>
          )}
          {run.status === "Completed" && !run.reference && (
            <button className="btn btn-outline-secondary btn-sm" onClick={() => onMarkPaid(run)}>Mark paid</button>
          )}
        </>
      }>
      <div className="pm-card pm-card-pad mb-3">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <div className="pm-eyebrow">Settlement amount</div>
            <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.6rem" }}>{kes(run.amount)}</div>
            <div style={{ fontSize: ".75rem", color: "var(--pm-muted)" }}>
              {num(run.txnCount)} transactions · avg {kes(Math.round(run.amount / Math.max(1, run.txnCount)))}
            </div>
          </div>
          <div className="text-end">
            <Badge tone={run.auto ? "green" : "violet"}>{run.auto ? "Auto" : "Manual"}</Badge>
            <div className="mt-1"><Badge tone="grey">{run.method}</Badge></div>
            {run.reference && <div className="mono mt-1" style={{ fontSize: ".7rem", fontWeight: 700 }}>{run.reference}</div>}
          </div>
        </div>
      </div>

      <div className="row g-2 mb-3">
        {[
          { l: "Due", v: run.due },
          { l: "Pool", v: run.pool },
          { l: "Prepared by", v: run.preparedBy },
          { l: "Variance", v: run.variance ? kes(run.variance) : "none detected" },
        ].map((x) => (
          <div className="col-6" key={x.l}>
            <div className="pm-stat">
              <div className="pm-stat-label">{x.l}</div>
              <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: ".95rem" }}>{x.v}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-eyebrow mb-2">Settlement legs</div>
        <div className="pm-kv"><span className="k">Debit — settlement pool</span><span className="v mono">{run.pool}</span></div>
        <div className="pm-kv"><span className="k">Credit — partner payable</span><span className="v mono">2000 Partner Payables · {run.partner}</span></div>
        <div className="pm-kv"><span className="k">Rail instruction</span><span className="v mono">{run.method} · 1 batch file</span></div>
        <div className="pm-kv"><span className="k">Cut-off compliance</span><span className="v">{run.status === "Overdue" ? <Badge tone="red" dot>Missed cut-off</Badge> : <Badge tone="green">Within window</Badge>}</span></div>
      </div>

      <div className="pm-card pm-card-pad">
        <div className="pm-eyebrow mb-2">Settlement lifecycle</div>
        <div className="pm-timeline">
          {[
            { t: "Prepared", d: `${run.preparedBy} generated the batch`, s: "done" },
            { t: "Funded", d: `${run.pool} reserved ${kes(run.amount, { compact: true })}`, s: "done" },
            { t: "Instruction sent", d: run.status === "Scheduled" ? "Queued for the next window" : `${run.method} file transmitted`, s: run.status === "Scheduled" ? "" : "done" },
            { t: "Partner acknowledged", d: run.reference ? `ACK ${run.reference}` : "Awaiting ACK", s: run.reference ? "done" : "" },
            { t: "Reconciled", d: run.status === "Completed" ? "Matched to bank statement" : "Pending", s: run.status === "Completed" ? "done" : run.variance ? "warn" : "" },
          ].map((x) => (
            <div key={x.t} className={`pm-tl-item ${x.s}`}>
              <div style={{ fontWeight: 700, fontSize: ".8rem" }}>{x.t}</div>
              <div className="pm-td-sub">{x.d}</div>
            </div>
          ))}
        </div>
      </div>

      {run.variance != null && (
        <button className="pm-alert-row crit w-100 text-start mt-3" onClick={onBreaks} style={{ border: "1px solid var(--pm-border)" }}>
          <i className="bi bi-intersect" style={{ color: "#f04438" }} />
          <div className="flex-grow-1">
            <div style={{ fontWeight: 700, fontSize: ".8rem" }}>Variance {kes(run.variance)} against partner file</div>
            <div className="pm-td-sub">Open the breaks board to investigate & resolve</div>
          </div>
          <i className="bi bi-chevron-right" style={{ color: "#c3cbd9" }} />
        </button>
      )}
    </Drawer>
  );
}

/* ================================================================
   2. Run settlement wizard (4 steps incl. execution)
   ================================================================ */
export function RunSettlementWizard({
  open, runs, onClose, onDone,
}: {
  open: boolean;
  runs: SettlementRun[];
  onClose: () => void;
  onDone: (r: SettlementRun) => void;
}) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [runId, setRunId] = useState(runs[0]?.id ?? "");
  const [code, setCode] = useState("");
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const target = runs.find((r) => r.id === runId) ?? runs[0];
  const steps = [
    { label: "Run", icon: "bi-list-ul" },
    { label: "Funding", icon: "bi-wallet2" },
    { label: "2FA", icon: "bi-shield-lock" },
    { label: "Execute", icon: "bi-play-fill" },
  ];
  const close = () => { setStep(0); setCode(""); setProgress(0); setRunning(false); onClose(); };
  if (!open || !target) return null;

  const execute = () => {
    setRunning(true); setProgress(0);
    const t = setInterval(() => setProgress((p) => (p >= 100 ? 100 : p + 4)), 70);
    setTimeout(() => {
      clearInterval(t);
      onDone(target);
      push({ kind: "success", title: `${target.id} settled`, body: `${kes(target.amount, { compact: true })} → ${target.partner} · ACK received.` });
      setTimeout(close, 900);
    }, 2400);
  };

  return (
    <Modal open onClose={running ? () => {} : close} tone="green" icon="bi-play-fill" size="lg"
      title="Run partner settlement" subtitle="Manual execution outside the auto window — dual Tier-0 control">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="d-flex flex-column gap-2">
            {runs.filter((r) => r.status !== "Completed").slice(0, 8).map((r) => (
              <button key={r.id} className={`pm-opt ${runId === r.id ? "active" : ""}`} onClick={() => setRunId(r.id)}>
                <span className="r" />
                <Avatar name={r.partner} size="sm" />
                <span className="flex-grow-1">
                  <span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{r.partner} · {r.type}</span>
                  <span className="d-block pm-td-sub mono">{r.id} · {num(r.txnCount)} txns · due {r.due}</span>
                </span>
                <span className="pm-num" style={{ fontWeight: 700, fontSize: ".76rem" }}>{kes(r.amount, { compact: true })}</span>
              </button>
            ))}
          </div>
        )}
        {step === 1 && (
          <>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">Settlement run</span><span className="v mono">{target.id} · {target.partner}</span></div>
              <div className="pm-kv"><span className="k">Amount</span><span className="v mono">{kes(target.amount)}</span></div>
              <div className="pm-kv"><span className="k">Transactions</span><span className="v">{num(target.txnCount)}</span></div>
              <div className="pm-kv"><span className="k">Funding pool</span><span className="v">{target.pool}</span></div>
              <div className="pm-kv"><span className="k">Rail instruction</span><span className="v">{target.method}</span></div>
            </div>
            <div className="pm-card pm-card-pad">
              <div className="d-flex justify-content-between mb-1"><span className="pm-eyebrow mb-0">Pool utilisation after this run</span><span style={{ fontWeight: 800 }}>62%</span></div>
              <Meter value={62} tone="#12b76a" width={999} />
              <div className="pm-td-sub mt-2">Reserve floor 15% remains intact — no breach possible on this instruction.</div>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <div className="pm-note mb-3">
              <i className="bi bi-shield-fill-check me-1" style={{ color: "#0b8f52" }} />
              Settling moves real money to {target.partner}. The instruction is irreversible once acknowledged — reversal requires the Page 9 contra flow.
            </div>
            <TwoFactorField value={code} onChange={setCode} />
          </>
        )}
        {step === 3 && (
          <div className="text-center py-4">
            <div className="mb-2" style={{ fontWeight: 700, fontFamily: "Sora" }}>{progress < 100 ? "Settling…" : "Settlement complete"}</div>
            <div className="progress mb-2" style={{ height: 8 }}><div className="progress-bar" style={{ width: `${progress}%` }} /></div>
            <div style={{ fontSize: ".78rem", color: "var(--pm-muted)" }}>
              {progress < 30 ? "Debiting settlement pool…" : progress < 60 ? `Transmitting ${target.method} file…` : progress < 100 ? "Awaiting partner ACK…" : `${target.partner} acknowledged · journal posted`}
            </div>
          </div>
        )}
      </div>
      {!running && (
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
          {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}>Back</button>}
          {step < 2 && <button className="btn btn-primary btn-sm" onClick={() => setStep(step + 1)}>Next</button>}
          {step === 2 && (
            <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => { setStep(3); execute(); }}>
              <i className="bi bi-play-fill me-1" />Execute settlement
            </button>
          )}
        </div>
      )}
    </Modal>
  );
}

/* ================================================================
   3. Reconciliation day drawer
   ================================================================ */
export function ReconDayDrawer({
  day, onClose, onChannel, onBreaks, onRerun,
}: {
  day: ReconDay | null;
  onClose: () => void;
  onChannel: (c: ReconChannel) => void;
  onBreaks: (date: string) => void;
  onRerun: (d: ReconDay) => void;
}) {
  const { push } = useToast();
  if (!day) return null;
  const variancePct = ((day.variance / day.expected) * 100).toFixed(3);
  const dayBreaks = BREAKS.filter((b) => b.date === day.date.split(" ")[0] || (day.breaks > 0 && b.status !== "Resolved"));
  return (
    <Drawer open onClose={onClose} wide icon="bi-calendar2-check"
      tone={day.status === "Matched" ? "green" : day.status === "Major" ? "red" : "amber"}
      title={`Reconciliation — ${day.date}`} subtitle={`${day.channels} channels · operator ${day.operator} · ${day.breaks} break${day.breaks === 1 ? "" : "s"}`}
      headExtra={<Badge tone={statusTone(day.status)} dot>{day.status}</Badge>}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => {
            csvDownload(`recon-${day.date.replace(/ /g, "-")}.csv`, [{ date: day.date, expected: day.expected, actual: day.actual, variance: day.variance, status: day.status },
            ...RECON_CHANNELS.map((c) => ({ date: day.date, expected: c.expected, actual: c.actual, variance: c.variance, status: c.channel }))]);
            push({ kind: "success", title: "Day pack exported" });
          }}>
            <i className="bi bi-download me-1" />Export day
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => onBreaks(day.date)}>
            <i className="bi bi-intersect me-1" />Breaks ({dayBreaks.length})
          </button>
          <button className="btn btn-primary btn-sm flex-grow-1" onClick={() => onRerun(day)}>
            <i className="bi bi-arrow-repeat me-1" />Re-run this day
          </button>
        </>
      }>
      <div className="row g-2 mb-3">
        {[
          { l: "Expected", v: kes(day.expected, { compact: true }), c: "var(--pm-ink)" },
          { l: "Actual", v: kes(day.actual, { compact: true }), c: "var(--pm-ink)" },
          { l: "Variance", v: `${day.variance === 0 ? "KES 0" : kes(day.variance, { compact: true })}`, c: day.variance === 0 ? "#0b8f52" : day.variance > 0 ? "#0b8f52" : "#b42318" },
          { l: "Variance %", v: `${day.variance === 0 ? "0.000" : variancePct}%`, c: Math.abs(day.variance) < 10_000 ? "#0b8f52" : "#b54708" },
        ].map((x) => (
          <div className="col-6" key={x.l}>
            <div className="pm-stat">
              <div className="pm-stat-label">{x.l}</div>
              <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.05rem", color: x.c }}>{x.v}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="pm-card mb-3">
        <div className="pm-card-head">
          <h6 className="pm-card-title">Channel breakdown</h6>
          <p className="pm-card-sub">Click a channel for leg-level detail</p>
        </div>
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Channel</th><th className="text-end">Expected</th><th className="text-end">Actual</th><th className="text-end">Variance</th><th className="text-end">Match</th></tr></thead>
            <tbody>
              {RECON_CHANNELS.map((c) => (
                <tr key={c.channel} onClick={() => onChannel(c)}>
                  <td>
                    <span className="pm-legend-dot me-1" style={{ background: c.color }} />
                    <span className="pm-td-strong">{c.channel}</span>
                  </td>
                  <td className="text-end pm-num">{kes(c.expected, { compact: true })}</td>
                  <td className="text-end pm-num">{kes(c.actual, { compact: true })}</td>
                  <td className="text-end pm-num" style={{ color: c.variance === 0 ? "#0b8f52" : "#b42318", fontWeight: 700 }}>
                    {c.variance === 0 ? "0" : kes(c.variance, { compact: true })}
                  </td>
                  <td className="text-end">
                    <div className="d-flex align-items-center gap-2 justify-content-end">
                      <Meter value={c.matchRate} tone={c.matchRate >= 99.9 ? "#12b76a" : "#f79009"} width={44} />
                      <span className="pm-num">{c.matchRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pm-card pm-card-pad">
        <div className="pm-eyebrow mb-2">Day adjustments</div>
        {day.variance !== 0 ? (
          <>
            <div className="pm-kv"><span className="k">Auto-accepted (&lt; KES 10K)</span><span className="v">0 entries</span></div>
            <div className="pm-kv"><span className="k">Suspense created</span><span className="v">SUS-1012 · {kes(Math.abs(day.variance) > 100_000 ? 100_000 : Math.abs(day.variance))}</span></div>
            <div className="pm-kv"><span className="k">Finance approval</span><span className="v">{Math.abs(day.variance) > 100_000 ? <Badge tone="red" dot>Required (&gt; KES 100K)</Badge> : <Badge tone="green">Not required</Badge>}</span></div>
          </>
        ) : (
          <div className="pm-td-sub">Clean day — no adjustments, no suspense entries.</div>
        )}
      </div>
    </Drawer>
  );
}

/* ================================================================
   4. Channel leg detail modal
   ================================================================ */
export function ChannelDetailModal({ channel, onClose, onBreaks }: { channel: ReconChannel | null; onClose: () => void; onBreaks: () => void }) {
  if (!channel) return null;
  const clean = channel.variance === 0;
  return (
    <Modal open onClose={onClose} tone={clean ? "green" : "amber"} icon="bi-diagram-3" size="md"
      title={`${channel.channel} — today's clearing`} subtitle={`${num(channel.txns)} transactions · match rate ${channel.matchRate}%`}>
      <div className="pm-modal-body">
        <div className="row g-2 mb-3">
          {[
            { l: "Expected (internal)", v: kes(channel.expected, { compact: true }) },
            { l: "Actual (partner file)", v: kes(channel.actual, { compact: true }) },
            { l: "Variance", v: clean ? "KES 0" : kes(channel.variance, { compact: true }) },
            { l: "Match rate", v: `${channel.matchRate}%` },
          ].map((x) => (
            <div className="col-6" key={x.l}>
              <div className="pm-stat">
                <div className="pm-stat-label">{x.l}</div>
                <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1rem" }}>{x.v}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="pm-card pm-card-pad">
          <div className="pm-kv"><span className="k">Partner file</span><span className="v mono">{channel.channel.includes("M-Pesa") ? "SFK-EOD-0823.csv" : channel.channel.includes("Visa") ? "VISA-CLR-0823.tbl" : "BANK-STMT-0823.mt940"}</span></div>
          <div className="pm-kv"><span className="k">File entries</span><span className="v">{num(channel.txns)} lines · SHA-256 verified</span></div>
          <div className="pm-kv"><span className="k">Auto-matched</span><span className="v">{num(Math.round(channel.txns * channel.matchRate / 100))} of {num(channel.txns)}</span></div>
          <div className="pm-kv"><span className="k">Result</span><span className="v">{clean ? <Badge tone="green" dot>Fully matched</Badge> : <Badge tone="amber" dot>{channel.variance < 0 ? "Short by" : "Excess of"} {kes(Math.abs(channel.variance))}</Badge>}</span></div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => { csvDownload(`${channel.channel.replace(/[^a-z]/gi, "-").toLowerCase()}-legs.csv`, RECON_CHANNELS as unknown as Record<string, unknown>[]); }}>
          <i className="bi bi-download me-1" />Channel legs
        </button>
        {!clean && <button className="btn btn-primary btn-sm" onClick={() => { onClose(); onBreaks(); }}>Investigate in breaks board</button>}
        {clean && <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>}
      </div>
    </Modal>
  );
}

/* ================================================================
   5. Breaks board drawer
   ================================================================ */
export function BreaksDrawer({
  open, onClose, breaks, onOpen, onBulk, selected, onToggle, onToggleAll,
}: {
  open: boolean;
  onClose: () => void;
  breaks: ReconBreak[];
  onOpen: (b: ReconBreak) => void;
  onBulk: () => void;
  selected: string[];
  onToggle: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
}) {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("Open");
  const list = breaks.filter((b) =>
    (tab === "All" || b.status === tab) &&
    (b.id + b.channel + b.type + b.txnRef + b.partnerRef + b.assignedTo).toLowerCase().includes(q.toLowerCase())
  );
  const openValue = breaks.filter((b) => b.status !== "Resolved").reduce((s, b) => s + b.amount, 0);
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-intersect" tone="amber" title="Reconciliation breaks"
      subtitle={`${breaks.filter((b) => b.status !== "Resolved").length} open · ${kes(openValue, { compact: true })} at risk`}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => csvDownload("breaks.csv", breaks as unknown as Record<string, unknown>[])}>
            <i className="bi bi-download me-1" />Export
          </button>
          <button className="btn btn-primary btn-sm flex-grow-1" disabled={selected.length === 0} onClick={onBulk}>
            <i className="bi bi-lightning-charge me-1" />Bulk action ({selected.length})
          </button>
        </>
      }>
      <div className="pm-search mb-2" style={{ background: "#fff" }}>
        <i className="bi bi-search" />
        <input placeholder="Break, channel, refs, assignee…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="pm-tabs mb-3" style={{ borderBottom: 0 }}>
        {["Open", "Investigating", "Escalated", "Resolved", "All"].map((t) => (
          <button key={t} className={`pm-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t}<span className="cnt">{t === "All" ? breaks.length : breaks.filter((b) => b.status === t).length}</span>
          </button>
        ))}
      </div>
      {selected.length > 0 && (
        <div className="pm-bulkbar">
          <b style={{ fontSize: ".8rem" }}>{selected.length} selected</b>
          <span className="mono" style={{ fontSize: ".74rem" }}>{kes(breaks.filter((b) => selected.includes(b.id)).reduce((s, b) => s + b.amount, 0), { compact: true })}</span>
          <button className="btn btn-sm btn-outline-light ms-auto" onClick={() => onToggleAll([])}>Clear</button>
        </div>
      )}
      {list.length === 0 ? (
        <EmptyState icon="bi-check2-circle" title="Nothing here" body="No breaks in this state — beautiful." />
      ) : list.map((b) => (
        <div key={b.id} className="pm-alert-row mb-2" style={{
          borderLeftColor: b.status === "Resolved" ? "#12b76a" : b.status === "Escalated" ? "#f04438" : b.type === "Timing difference" ? "#2e90fa" : "#f79009",
        }}>
          <input type="checkbox" className="form-check-input mt-1" checked={selected.includes(b.id)} onChange={() => onToggle(b.id)} disabled={b.status === "Resolved"} />
          <div className="flex-grow-1" style={{ minWidth: 0, cursor: "pointer" }} onClick={() => onOpen(b)}>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="mono" style={{ fontWeight: 700, fontSize: ".76rem" }}>{b.id}</span>
              <Badge tone={typeTone(b.type)}>{b.type}</Badge>
              <Badge tone={statusTone(b.status)} dot>{b.status}</Badge>
              <Badge tone="grey">{b.channel}</Badge>
            </div>
            <div className="pm-td-sub mono">{b.txnRef} ⇄ {b.partnerRef} · {b.date} · {b.ageDays}d old</div>
            <div className="pm-td-sub">{b.suggestion}</div>
            <div className="pm-td-sub"><i className="bi bi-person me-1" />{b.assignedTo}</div>
          </div>
          <div className="text-end">
            <div className="pm-num" style={{ fontWeight: 700, fontSize: ".76rem" }}>{kes(b.amount, { compact: true })}</div>
            <button className="btn btn-sm btn-outline-secondary mt-1" style={{ fontSize: ".68rem" }} onClick={() => onOpen(b)}>Open</button>
          </div>
        </div>
      ))}
    </Drawer>
  );
}

/* ================================================================
   6. Break detail modal — side-by-side legs + resolution actions
   ================================================================ */
export function BreakDetailModal({
  brk, onClose, onAutoMatch, onSuspense, onAdjust, onEscalate, onResolve,
}: {
  brk: ReconBreak | null;
  onClose: () => void;
  onAutoMatch: (b: ReconBreak) => void;
  onSuspense: (b: ReconBreak) => void;
  onAdjust: (b: ReconBreak) => void;
  onEscalate: (b: ReconBreak) => void;
  onResolve: (b: ReconBreak) => void;
}) {
  if (!brk) return null;
  const resolved = brk.status === "Resolved";
  return (
    <Modal open onClose={onClose} tone={resolved ? "green" : "amber"} icon="bi-search" size="lg"
      title={`${brk.id} — ${brk.type}`} subtitle={`${brk.channel} · ${brk.date} · ${brk.ageDays}d old · assigned ${brk.assignedTo}`}>
      <div className="pm-modal-body">
        <div className="row g-2 mb-3">
          <div className="col-12 col-md-6">
            <div className="pm-card pm-card-pad h-100">
              <div className="pm-eyebrow mb-2">Internal leg (our ledger)</div>
              <div className="pm-kv"><span className="k">Transaction</span><span className="v mono">{brk.txnRef}</span></div>
              <div className="pm-kv"><span className="k">Amount</span><span className="v mono">{brk.txnRef === "—" ? "—" : kes(brk.amount)}</span></div>
              <div className="pm-kv"><span className="k">Posted</span><span className="v">{brk.txnRef === "—" ? "no matching entry" : `${brk.date} · journal posted`}</span></div>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="pm-card pm-card-pad h-100">
              <div className="pm-eyebrow mb-2">Partner leg (their file)</div>
              <div className="pm-kv"><span className="k">Reference</span><span className="v mono">{brk.partnerRef}</span></div>
              <div className="pm-kv"><span className="k">Amount</span><span className="v mono">{brk.partnerRef === "—" ? "—" : kes(brk.amount)}</span></div>
              <div className="pm-kv"><span className="k">Cleared</span><span className="v">{brk.partnerRef === "—" ? "no partner record" : `${brk.date} · file verified`}</span></div>
            </div>
          </div>
        </div>
        <div className="pm-card pm-card-pad mb-3" style={{ borderColor: "#12b76a", boxShadow: "0 0 0 3px rgba(18,183,106,.1)" }}>
          <div className="d-flex align-items-center gap-2 mb-1">
            <i className="bi bi-stars" style={{ color: "#0b8f52" }} />
            <b style={{ fontSize: ".82rem" }}>Engine suggestion</b>
          </div>
          <div style={{ fontSize: ".8rem" }}>{brk.suggestion}</div>
        </div>
        <div className="pm-kv"><span className="k">Exposure</span><span className="v mono">{kes(brk.amount)}</span></div>
        <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone={statusTone(brk.status)} dot>{brk.status}</Badge></span></div>
      </div>
      <div className="pm-modal-foot">
        {resolved ? (
          <>
            <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => csvDownload(`${brk.id}.csv`, [brk as unknown as Record<string, unknown>])}>
              <i className="bi bi-download me-1" />Export
            </button>
            <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
          </>
        ) : (
          <>
            <button className="btn btn-outline-secondary btn-sm me-auto" onClick={onClose}>Cancel</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => onEscalate(brk)}><i className="bi bi-arrow-up-circle me-1" />Escalate</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => onSuspense(brk)}><i className="bi bi-pause-circle me-1" />Suspense</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => onAdjust(brk)}><i className="bi bi-journal-plus me-1" />Adjust</button>
            {brk.type === "Amount mismatch" || brk.type === "Orphan partner record" ? (
              <button className="btn btn-primary btn-sm" onClick={() => onAutoMatch(brk)}><i className="bi bi-magic me-1" />Auto-match</button>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => onResolve(brk)}><i className="bi bi-check2 me-1" />Resolve</button>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}

/* ================================================================
   7. Auto-match confirm modal (2FA)
   ================================================================ */
export function AutoMatchModal({ brk, onClose, onDone }: { brk: ReconBreak | null; onClose: () => void; onDone: (b: ReconBreak) => void }) {
  const { push } = useToast();
  const [code, setCode] = useState("");
  if (!brk) return null;
  return (
    <Modal open onClose={onClose} tone="green" icon="bi-magic" size="sm"
      title={`Auto-match ${brk.id}`} subtitle={`Will pair ${brk.txnRef === "—" ? "partner record" : brk.txnRef} ⇄ ${brk.partnerRef === "—" ? "internal entry" : brk.partnerRef}`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Match confidence</span><span className="v"><Badge tone="green">96.4%</Badge></span></div>
          <div className="pm-kv"><span className="k">Amount</span><span className="v mono">{kes(brk.amount)}</span></div>
          <div className="pm-kv"><span className="k">Residual</span><span className="v mono">KES 0.00</span></div>
          <div className="pm-kv"><span className="k">Effect</span><span className="v">Break closes · no journal needed</span></div>
        </div>
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => {
          onDone(brk);
          push({ kind: "success", title: `${brk.id} matched`, body: `${kes(brk.amount)} paired · break closed.` });
          onClose();
        }}>
          <i className="bi bi-magic me-1" />Confirm match
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   8. Create suspense modal (2FA)
   ================================================================ */
export function SuspenseFromBreakModal({ brk, onClose, onDone }: { brk: ReconBreak | null; onClose: () => void; onDone: (b: ReconBreak) => void }) {
  const { push } = useToast();
  const [code, setCode] = useState("");
  if (!brk) return null;
  return (
    <Modal open onClose={onClose} tone="amber" icon="bi-pause-circle" size="sm"
      title={`Move ${brk.id} to suspense`} subtitle={`${kes(brk.amount)} parked in 6000 Suspense pending resolution`}>
      <div className="pm-modal-body">
        <div className="pm-note mb-3">
          Journal: Dr 2200 Suspense / Cr {brk.channel === "M-Pesa" ? "1100 M-Pesa Float" : "1200 Card Settlement Pool"} — the day's books balance immediately; the break ages inside suspense.
        </div>
        <div className="pm-kv"><span className="k">Auto-review</span><span className="v">after 48h · then pages finance</span></div>
        <div className="pm-kv"><span className="k">Reason</span><span className="v">{brk.type}</span></div>
        <div className="mt-3"><TwoFactorField value={code} onChange={setCode} /></div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => {
          onDone(brk);
          push({ kind: "warn", title: `SUS entry created`, body: `${kes(brk.amount)} parked · ${brk.id} closed into suspense.` });
          onClose();
        }}>
          <i className="bi bi-pause-circle me-1" />Create suspense
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   9. Adjustment modal (dual approval when > 100K)
   ================================================================ */
export function AdjustmentModal({ brk, onClose, onDone }: { brk: ReconBreak | null; onClose: () => void; onDone: (b: ReconBreak) => void }) {
  const { push } = useToast();
  const [direction, setDirection] = useState<"debit" | "credit">(brk != null && brk.amount < 0 ? "debit" : "credit");
  const [narrative, setNarrative] = useState("");
  const [code, setCode] = useState("");
  if (!brk) return null;
  const needsDual = Math.abs(brk.amount) > 100_000;
  return (
    <Modal open onClose={onClose} tone="violet" icon="bi-journal-plus" size="md"
      title={`Post adjustment — ${brk.id}`} subtitle={`${kes(Math.abs(brk.amount))} correcting entry · ${needsDual ? "dual approval required" : "single approval"}`}>
      <div className="pm-modal-body">
        <label className="form-label">Adjustment side</label>
        <div className="pm-seg mb-3">
          <button className={direction === "debit" ? "active" : ""} onClick={() => setDirection("debit")}>Debit partner receivable</button>
          <button className={direction === "credit" ? "active" : ""} onClick={() => setDirection("credit")}>Credit partner payable</button>
        </div>
        <label className="form-label">Narrative <span style={{ color: "#f04438" }}>*</span></label>
        <textarea className="form-control mb-3" rows={2} value={narrative} onChange={(e) => setNarrative(e.target.value)}
          placeholder="e.g. KCB deducted KES 100K arrangement fee at source — SFK file confirmed" />
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Journal</span><span className="v mono">{direction === "debit" ? "Dr 5200 Partner Receivable" : "Cr 2000 Partner Payables"}</span></div>
          <div className="pm-kv"><span className="k">Amount</span><span className="v mono">{kes(Math.abs(brk.amount))}</span></div>
          <div className="pm-kv"><span className="k">Approval</span><span className="v">{needsDual ? <Badge tone="red" dot>Finance Manager + Super Admin</Badge> : <Badge tone="green">Single (Tier 0 + 2FA)</Badge>}</span></div>
        </div>
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={code !== "482913" || narrative.trim().length < 8} onClick={() => {
          onDone(brk);
          push({ kind: "success", title: "Adjustment posted", body: `ADJ-${Date.now().toString().slice(-5)} · ${kes(Math.abs(brk.amount))}${needsDual ? " · routed to Finance Manager" : ""}.` });
          onClose();
        }}>
          <i className="bi bi-journal-plus me-1" />Post adjustment
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   10. Escalate modal
   ================================================================ */
export function EscalateModal({ brk, onClose, onDone }: { brk: ReconBreak | null; onClose: () => void; onDone: (b: ReconBreak, to: string) => void }) {
  const { push } = useToast();
  const [to, setTo] = useState("finance");
  if (!brk) return null;
  return (
    <Modal open onClose={onClose} tone="red" icon="bi-arrow-up-circle" size="sm"
      title={`Escalate ${brk.id}`} subtitle={`${kes(brk.amount)} · ${brk.type} · ${brk.ageDays}d old`}>
      <div className="pm-modal-body">
        <label className="form-label">Escalate to</label>
        <div className="d-flex flex-column gap-2">
          {[
            ["finance", "Finance Manager", "Sarah Kamau · approves adjustments > KES 100K"],
            ["ops", "Operations Manager", "Mary Wanjiku · partner relationship route"],
            ["compliance", "Compliance Officer", "David Kiplagat · if suspected partner error is systemic"],
          ].map(([id, l, d]) => (
            <button key={id} className={`pm-opt ${to === id ? "active" : ""}`} onClick={() => setTo(id)}>
              <span className="r" />
              <span className="flex-grow-1">
                <span className="d-block" style={{ fontWeight: 700, fontSize: ".84rem" }}>{l}</span>
                <span className="d-block pm-td-sub">{d}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger btn-sm" onClick={() => {
          onDone(brk, to);
          push({ kind: "info", title: `${brk.id} escalated`, body: `Routed to ${to === "finance" ? "Sarah Kamau" : to === "ops" ? "Mary Wanjiku" : "David Kiplagat"} · SLA 4h.` });
          onClose();
        }}>
          <i className="bi bi-arrow-up-circle me-1" />Escalate
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   11. Resolve break modal
   ================================================================ */
export function ResolveBreakModal({ brk, onClose, onDone }: { brk: ReconBreak | null; onClose: () => void; onDone: (b: ReconBreak, note: string) => void }) {
  const { push } = useToast();
  const [resolution, setResolution] = useState("matched");
  const [note, setNote] = useState("");
  if (!brk) return null;
  return (
    <Modal open onClose={onClose} tone="green" icon="bi-check2-circle" size="sm"
      title={`Resolve ${brk.id}`} subtitle={`${kes(brk.amount)} · ${brk.channel} · ${brk.type}`}>
      <div className="pm-modal-body">
        <label className="form-label">Resolution</label>
        <select className="form-select mb-3" value={resolution} onChange={(e) => setResolution(e.target.value)}>
          <option value="matched">Matched to partner record</option>
          <option value="callback">Callback received late</option>
          <option value="reversed">Reversed via contra entry</option>
          <option value="writtenoff">Written off (Finance approved)</option>
          <option value="duplicate">Duplicate — voided</option>
        </select>
        <label className="form-label">Resolution note</label>
        <textarea className="form-control" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Evidence for the audit trail…" />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => {
          onDone(brk, note || resolution);
          push({ kind: "success", title: `${brk.id} resolved`, body: `Resolution: ${resolution.replace("writtenoff", "written off")}.` });
          onClose();
        }}>
          <i className="bi bi-check2 me-1" />Resolve break
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   12. Bulk breaks action modal
   ================================================================ */
export function BulkBreaksModal({
  open, count, value, onClose, onDone,
}: { open: boolean; count: number; value: number; onClose: () => void; onDone: (action: string) => void }) {
  const [action, setAction] = useState("automatch");
  const [code, setCode] = useState("");
  const needs2fa = action !== "export";
  if (!open) return null;
  return (
    <Modal open onClose={onClose} tone="amber" icon="bi-check2-square" size="md"
      title={`Bulk action on ${count} breaks`} subtitle={`${kes(value, { compact: true })} exposure · one batch reference`}>
      <div className="pm-modal-body">
        <div className="d-flex flex-column gap-2 mb-3">
          {[
            ["automatch", "Auto-match engine pass", "bi-magic"],
            ["retry", "Retry timing differences", "bi-arrow-clockwise"],
            ["suspend", "Move all to suspense (2FA)", "bi-pause-circle"],
            ["escalate", "Escalate batch", "bi-arrow-up-circle"],
            ["export", "Export selection", "bi-download"],
          ].map(([id, l, i]) => (
            <button key={id} className={`pm-opt ${action === id ? "active" : ""}`} onClick={() => setAction(id)}>
              <span className="r" /><i className={`bi ${i}`} style={{ color: "#b54708" }} />
              <span style={{ fontWeight: 700, fontSize: ".85rem" }}>{l}</span>
            </button>
          ))}
        </div>
        {needs2fa && <TwoFactorField value={code} onChange={setCode} />}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={needs2fa && code !== "482913"} onClick={() => { onDone(action); onClose(); }}>
          Apply to {count}
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   13. Suspense ledger drawer
   ================================================================ */
export function SuspenseDrawer({
  open, onClose, entries, onResolve,
}: { open: boolean; onClose: () => void; entries: SuspenseEntry[]; onResolve: (s: SuspenseEntry) => void }) {
  const openEntries = entries.filter((s) => s.status !== "Resolved");
  return (
    <Drawer open={open} onClose={onClose} icon="bi-pause-circle" tone="blue" title="Suspense ledger — 6000"
      subtitle={`${openEntries.length} open · ${kes(openEntries.reduce((s, x) => s + x.amount, 0), { compact: true })} parked`}
      footer={<button className="btn btn-outline-secondary btn-sm w-100" onClick={() => csvDownload("suspense.csv", entries as unknown as Record<string, unknown>[])}>
        <i className="bi bi-download me-1" />Export suspense ledger
      </button>}>
      <div className="pm-note mb-3">
        <i className="bi bi-stopwatch me-1" />
        Entries older than 48h auto-page the Finance Manager. Older than 7 days are flagged in the CBK monthly return.
      </div>
      {entries.map((s) => (
        <div key={s.id} className="pm-alert-row mb-2" style={{ borderLeftColor: s.status === "Resolved" ? "#12b76a" : s.status === "Under review" ? "#f79009" : "#2e90fa" }}>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="mono" style={{ fontWeight: 700, fontSize: ".76rem" }}>{s.id}</span>
              <Badge tone={statusTone(s.status)} dot>{s.status}</Badge>
              <span className="pm-num" style={{ fontWeight: 700, fontSize: ".74rem" }}>{kes(s.amount, { compact: true })}</span>
            </div>
            <div className="pm-td-sub">{s.reason}</div>
            <div className="pm-td-sub mono">{s.date} · {s.ageDays}d old · by {s.createdBy} · {s.resolution}</div>
          </div>
          {s.status !== "Resolved" && (
            <button className="btn btn-sm btn-outline-primary" style={{ fontSize: ".68rem" }} onClick={() => onResolve(s)}>Resolve</button>
          )}
        </div>
      ))}
    </Drawer>
  );
}

/* ================================================================
   14. Resolve suspense modal (2FA)
   ================================================================ */
export function SuspenseResolveModal({ entry, onClose, onDone }: { entry: SuspenseEntry | null; onClose: () => void; onDone: (s: SuspenseEntry, disposition: string) => void }) {
  const { push } = useToast();
  const [disposition, setDisposition] = useState("release");
  const [code, setCode] = useState("");
  if (!entry) return null;
  return (
    <Modal open onClose={onClose} tone="green" icon="bi-play-circle" size="sm"
      title={`Resolve ${entry.id}`} subtitle={`${kes(entry.amount)} parked since ${entry.date} · ${entry.reason}`}>
      <div className="pm-modal-body">
        <label className="form-label">Disposition</label>
        <div className="d-flex flex-column gap-2 mb-3">
          {[
            ["release", "Release to settlement", "Journal reversal — funds settle normally"],
            ["reverse", "Return to source pool", "Refund the float / pool of origin"],
            ["writeoff", "Write off (Finance approved)", "P&L hit · requires Finance Manager co-approval"],
          ].map(([id, l, d]) => (
            <button key={id} className={`pm-opt ${disposition === id ? "active" : ""}`} onClick={() => setDisposition(id)}>
              <span className="r" />
              <span className="flex-grow-1">
                <span className="d-block" style={{ fontWeight: 700, fontSize: ".84rem" }}>{l}</span>
                <span className="d-block pm-td-sub">{d}</span>
              </span>
            </button>
          ))}
        </div>
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => {
          onDone(entry, disposition);
          push({ kind: "success", title: `${entry.id} resolved`, body: `${kes(entry.amount)} ${disposition === "release" ? "released to settlement" : disposition === "reverse" ? "returned to source pool" : "written off"}.` });
          onClose();
        }}>
          <i className="bi bi-play-circle me-1" />Resolve entry
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   15. Statements drawer
   ================================================================ */
export function StatementsDrawer({
  open, onClose, statements, onImport, onAccount,
}: { open: boolean; onClose: () => void; statements: StatementFile[]; onImport: () => void; onAccount: () => void }) {
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-file-earmark-ruled" tone="blue" title="Bank & partner statements"
      subtitle={`${statements.length} files · ${statements.filter((s) => s.status === "Imported").length} fully imported`}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={onAccount}>
            <i className="bi bi-bank me-1" />Bank accounts
          </button>
          <button className="btn btn-primary btn-sm flex-grow-1" onClick={onImport}>
            <i className="bi bi-upload me-1" />Import statement
          </button>
        </>
      }>
      {statements.map((s) => (
        <div key={s.id} className="pm-alert-row mb-2" style={{ borderLeftColor: s.status === "Imported" ? "#12b76a" : s.status === "Failed" ? "#f04438" : s.status === "Processing" ? "#2e90fa" : "#f79009" }}>
          <span className="pm-avatar sm" style={{ background: "#eff8ff", color: "#175cd3" }}><i className="bi bi-file-earmark-text" /></span>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span style={{ fontWeight: 700, fontSize: ".8rem" }}>{s.bank}</span>
              <Badge tone={statusTone(s.status)} dot>{s.status}</Badge>
              <Badge tone="grey">{s.format}</Badge>
            </div>
            <div className="pm-td-sub mono">{s.id} · {s.date}</div>
            <div className="pm-td-sub">{num(s.entries)} entries · matched {s.matched} ({Math.round((s.matched / Math.max(1, s.entries)) * 100)}%) · imported {s.importedAt}</div>
            {s.matched < s.entries && s.status === "Imported" && (
              <div className="pm-td-sub" style={{ color: "#b54708" }}>{s.entries - s.matched} unmatched → breaks board</div>
            )}
          </div>
          <div className="text-end">
            <Meter value={(s.matched / Math.max(1, s.entries)) * 100} tone={s.matched === s.entries ? "#12b76a" : "#f79009"} width={64} />
            <div className="pm-num mt-1" style={{ fontSize: ".68rem" }}>{Math.round((s.matched / Math.max(1, s.entries)) * 100)}%</div>
          </div>
        </div>
      ))}
    </Drawer>
  );
}

/* ================================================================
   16. Import statement wizard
   ================================================================ */
export function ImportStatementWizard({
  open, onClose, onImported,
}: { open: boolean; onClose: () => void; onImported: (s: StatementFile) => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [bank, setBank] = useState("KCB");
  const [format, setFormat] = useState<"MT940" | "CSV" | "OFX">("MT940");
  const [file, setFile] = useState("STMT-KCB-2408.MT940");
  const [code, setCode] = useState("");
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const steps = [
    { label: "Source", icon: "bi-bank" },
    { label: "File", icon: "bi-file-earmark-arrow-up" },
    { label: "2FA", icon: "bi-shield-lock" },
    { label: "Import", icon: "bi-arrow-repeat" },
  ];
  const close = () => { setStep(0); setCode(""); setProgress(0); setRunning(false); onClose(); };
  if (!open) return null;
  const run = () => {
    setRunning(true); setProgress(0);
    const t = setInterval(() => setProgress((p) => (p >= 100 ? 100 : p + 5)), 70);
    setTimeout(() => {
      clearInterval(t);
      const s: StatementFile = {
        id: `STMT-${3392 + Math.floor(Math.random() * 40)}`, bank, date: "23 Aug 2026", format,
        entries: 180 + Math.floor(Math.random() * 300), importedAt: "Just now", status: "Imported", matched: 0,
      };
      s.matched = s.entries - (2 + Math.floor(Math.random() * 6));
      onImported(s);
      push({ kind: "success", title: `${s.id} imported`, body: `${num(s.entries)} entries · ${s.entries - s.matched} breaks raised.` });
      setTimeout(close, 800);
    }, 2400);
  };
  return (
    <Modal open onClose={running ? () => {} : close} tone="blue" icon="bi-upload" size="md"
      title="Import statement file" subtitle="MT940 / CSV / OFX → matching engine → breaks">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%`, background: "#175cd3" }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <>
            <label className="form-label">Institution</label>
            <div className="d-flex flex-column gap-2">
              {["KCB", "I&M Bank", "Equity Bank", "Co-op Bank", "Safaricom Trust"].map((b) => (
                <button key={b} className={`pm-opt ${bank === b ? "active" : ""}`} onClick={() => setBank(b)}>
                  <span className="r" /><i className="bi bi-bank" />
                  <span style={{ fontWeight: 700, fontSize: ".85rem" }}>{b}</span>
                </button>
              ))}
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <label className="form-label">Format</label>
            <div className="pm-seg mb-3">
              {(["MT940", "CSV", "OFX"] as const).map((f) => (
                <button key={f} className={format === f ? "active" : ""} onClick={() => { setFormat(f); setFile(`STMT-${bank.replace(/[^A-Z]/g, "").slice(0, 3)}-2408.${f.toLowerCase()}`); }}>{f}</button>
              ))}
            </div>
            <label className="form-label">File</label>
            <div className="pm-card pm-card-pad text-center" style={{ border: "1.5px dashed #b7e6cf", cursor: "pointer" }} onClick={() => setFile(`STMT-${bank.replace(/[^A-Z]/g, "").slice(0, 3)}-2408.${format.toLowerCase()}`)}>
              <i className="bi bi-cloud-arrow-up" style={{ fontSize: "1.6rem", color: "#0b8f52" }} />
              <div style={{ fontWeight: 700, fontSize: ".84rem" }} className="mt-1">{file}</div>
              <div className="pm-td-sub">SHA-256 checksum verified · SFTP pickup simulated</div>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <div className="pm-note mb-3">Imports overwrite nothing — statements are append-only and every run is journaled.</div>
            <TwoFactorField value={code} onChange={setCode} />
          </>
        )}
        {step === 3 && (
          <div className="text-center py-4">
            <div className="mb-2" style={{ fontWeight: 700, fontFamily: "Sora" }}>{progress < 100 ? "Importing…" : "Import complete"}</div>
            <div className="progress mb-2" style={{ height: 8 }}><div className="progress-bar" style={{ width: `${progress}%` }} /></div>
            <div style={{ fontSize: ".78rem", color: "var(--pm-muted)" }}>
              {progress < 40 ? "Parsing file…" : progress < 80 ? "Matching against ledger…" : "Raising breaks…"}
            </div>
          </div>
        )}
      </div>
      {!running && (
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
          {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}>Back</button>}
          {step < 2 && <button className="btn btn-primary btn-sm" onClick={() => setStep(step + 1)}>Next</button>}
          {step === 2 && <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => { setStep(3); run(); }}><i className="bi bi-arrow-repeat me-1" />Run import</button>}
        </div>
      )}
    </Modal>
  );
}

/* ================================================================
   17. Bank accounts drawer
   ================================================================ */
export function BankAccountsDrawer({
  open, onClose, accounts, onSelect,
}: { open: boolean; onClose: () => void; accounts: BankAccount[]; onSelect: (a: BankAccount) => void }) {
  return (
    <Drawer open={open} onClose={onClose} icon="bi-bank" tone="green" title="Settlement bank accounts"
      subtitle={`${accounts.length} accounts · ${kes(accounts.reduce((s, a) => s + a.balance, 0), { compact: true })} total`}
      footer={<button className="btn btn-outline-secondary btn-sm w-100" onClick={() => csvDownload("bank-accounts.csv", accounts as unknown as Record<string, unknown>[])}>
        <i className="bi bi-download me-1" />Export balances
      </button>}>
      {accounts.map((a) => (
        <button key={a.id} className="pm-alert-row w-100 text-start mb-2" style={{ borderLeftColor: "#12b76a", border: "1px solid var(--pm-border)" }} onClick={() => onSelect(a)}>
          <span className="pm-avatar sm" style={{ background: "#e7f8ef", color: "#0b8f52" }}><i className="bi bi-bank" /></span>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span style={{ fontWeight: 700, fontSize: ".8rem" }}>{a.bank}</span>
              <span className="mono pm-td-sub">{a.account}</span>
            </div>
            <div className="pm-td-sub">{a.purpose}</div>
            <div className="pm-td-sub mono">last statement {a.lastStatement}</div>
          </div>
          <div className="text-end">
            <div className="pm-num" style={{ fontWeight: 700, fontSize: ".76rem" }}>{kes(a.balance, { compact: true })}</div>
            {a.pendingOut > 0 && <div className="pm-td-sub" style={{ color: "#b54708" }}>−{kes(a.pendingOut, { compact: true })} pending</div>}
          </div>
        </button>
      ))}
    </Drawer>
  );
}

/* ================================================================
   18. Bank account detail modal
   ================================================================ */
export function BankAccountModal({ account, onClose, onImport }: { account: BankAccount | null; onClose: () => void; onImport: () => void }) {
  if (!account) return null;
  const available = account.balance - account.pendingOut;
  return (
    <Modal open onClose={onClose} tone="green" icon="bi-bank" size="md"
      title={`${account.bank} — ${account.account}`} subtitle={account.purpose}>
      <div className="pm-modal-body">
        <div className="row g-2 mb-3">
          {[
            { l: "Ledger balance", v: kes(account.balance, { compact: true }) },
            { l: "Pending out", v: `−${kes(account.pendingOut, { compact: true })}` },
            { l: "Available", v: kes(available, { compact: true }) },
            { l: "Last statement", v: account.lastStatement },
          ].map((x) => (
            <div className="col-6" key={x.l}>
              <div className="pm-stat">
                <div className="pm-stat-label">{x.l}</div>
                <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1rem" }}>{x.v}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="pm-card pm-card-pad">
          <div className="pm-eyebrow mb-2">Recent movements</div>
          {[
            { t: "13:42", d: "Statement import — 388 entries", a: 0 },
            { t: "11:04", d: "RTGS batch out — payroll", a: -8_400_000 },
            { t: "09:31", d: "Partner funds in — Jumia", a: 2_340_000 },
            { t: "Yesterday", d: "Visa netting settlement", a: -4_100_000 },
          ].map((m, i) => (
            <div key={i} className="pm-kv">
              <span className="k">{m.t} · {m.d}</span>
              <span className="v mono" style={{ color: m.a === 0 ? "var(--pm-muted)" : m.a > 0 ? "#0b8f52" : "#b42318" }}>
                {m.a === 0 ? "—" : `${m.a > 0 ? "+" : ""}${kes(m.a, { compact: true })}`}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => csvDownload(`${account.id}-movements.csv`, [{ balance: account.balance, pendingOut: account.pendingOut }])}>
          <i className="bi bi-download me-1" />Movements
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => { onClose(); onImport(); }}>
          <i className="bi bi-upload me-1" />Import latest statement
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   19. Auto-recon config drawer (editable + 2FA save)
   ================================================================ */
export function ReconConfigDrawer({
  open, onClose, config, onSave,
}: {
  open: boolean;
  onClose: () => void;
  config: { key: string; label: string; value: string; unit: string; hint: string; editable: boolean }[];
  onSave: (key: string, value: string) => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [code, setCode] = useState("");
  const [show2fa, setShow2fa] = useState(false);
  return (
    <Drawer open={open} onClose={onClose} icon="bi-gear-wide-connected" tone="violet" title="Auto-reconciliation engine"
      subtitle="Thresholds, retries and escalation policy"
      footer={<div className="pm-note w-100 mb-0"><i className="bi bi-info-circle me-1" />Engine v3.2 · last policy change 12 Aug by Jeckonia Kwasa · every change is audited.</div>}>
      {config.map((c) => (
        <div key={c.key} className="pm-alert-row mb-2" style={{ borderLeftColor: "#7a5af8", border: "1px solid var(--pm-border)" }}>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: ".8rem" }}>{c.label}</div>
            <div className="pm-td-sub">{c.hint}</div>
            {editing === c.key ? (
              <div className="mt-2">
                <input className="form-control form-control-sm mono" value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus />
                <div className="d-flex gap-1 mt-1">
                  {!show2fa ? (
                    <button className="btn btn-sm btn-primary" style={{ fontSize: ".68rem" }} onClick={() => setShow2fa(true)}>Continue</button>
                  ) : (
                    <>
                      <input className="form-control form-control-sm mono" style={{ width: 130 }} placeholder="TOTP" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
                      <button className="btn btn-sm btn-primary" style={{ fontSize: ".68rem" }} disabled={code !== "482913"} onClick={() => {
                        onSave(c.key, draft);
                        setEditing(null); setShow2fa(false); setCode("");
                      }}>Save</button>
                    </>
                  )}
                  <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".68rem" }} onClick={() => { setEditing(null); setShow2fa(false); setCode(""); }}>Cancel</button>
                </div>
              </div>
            ) : null}
          </div>
          <div className="text-end">
            <div className="pm-num" style={{ fontWeight: 700, fontSize: ".76rem" }}>{c.value} <span style={{ color: "var(--pm-muted)", fontWeight: 500 }}>{c.unit}</span></div>
            {c.editable && editing !== c.key && (
              <button className="btn btn-sm btn-outline-secondary mt-1" style={{ fontSize: ".68rem" }} onClick={() => { setEditing(c.key); setDraft(c.value); setShow2fa(false); }}>
                <i className="bi bi-pencil" />
              </button>
            )}
          </div>
        </div>
      ))}
    </Drawer>
  );
}

/* ================================================================
   20. Exceptions modal
   ================================================================ */
export function ExceptionsModal({ open, onClose, onBreaks }: { open: boolean; onClose: () => void; onBreaks: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} tone="amber" icon="bi-exclamation-diamond" size="lg"
      title="Settlement exceptions — 30 days" subtitle="Playbook for every failure class the engine can raise">
      <div className="pm-modal-body">
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Exception</th><th className="text-end">Count</th><th className="text-end">Avg resolution</th><th>Playbook</th><th>Last seen</th></tr></thead>
            <tbody>
              {[
                { type: "Insufficient float", count: 3, avgTime: "2 hours", process: "Auto-alert → Manual top-up", lastAt: "18 Aug — M-Pesa float" },
                { type: "Partner rejection", count: 1, avgTime: "4 hours", process: "Investigate → Correct → Resubmit", lastAt: "22 Aug — DStv OFX file" },
                { type: "Duplicate settlement", count: 0, avgTime: "—", process: "Auto-detected, blocked pre-flight", lastAt: "None in window" },
                { type: "Amount mismatch", count: 5, avgTime: "6 hours", process: "Reconcile → Adjust → Resettle", lastAt: "23 Aug — KCB fee at source" },
                { type: "Missing reference", count: 2, avgTime: "1 hour", process: "Contact partner → Match manually", lastAt: "19 Aug — Visa clearing" },
              ].map((e) => (
                <tr key={e.type}>
                  <td className="pm-td-strong">{e.type}</td>
                  <td className="text-end">
                    <Badge tone={e.count === 0 ? "green" : e.count > 3 ? "red" : "amber"}>{e.count}</Badge>
                  </td>
                  <td className="text-end pm-num">{e.avgTime}</td>
                  <td className="pm-td-sub">{e.process}</td>
                  <td className="pm-td-sub">{e.lastAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => csvDownload("settlement-exceptions.csv", [{ type: "Insufficient float", count: 3 }, { type: "Amount mismatch", count: 5 }])}>
          <i className="bi bi-download me-1" />Export
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => { onClose(); onBreaks(); }}>
          <i className="bi bi-intersect me-1" />Open live breaks
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   21. Run reconciliation wizard (scope → 2FA → progress → result)
   ================================================================ */
export function RunReconWizard({
  open, onClose, onDone,
}: { open: boolean; onClose: () => void; onDone: (r: { matched: number; breaks: number }) => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [scope, setScope] = useState("all");
  const [day, setDay] = useState("23 Aug 2026");
  const [code, setCode] = useState("");
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ matched: number; breaks: number } | null>(null);
  const steps = [
    { label: "Scope", icon: "bi-bounding-box" },
    { label: "2FA", icon: "bi-shield-lock" },
    { label: "Run", icon: "bi-arrow-repeat" },
  ];
  const close = () => { setStep(0); setCode(""); setProgress(0); setRunning(false); setResult(null); onClose(); };
  if (!open) return null;
  const run = () => {
    setRunning(true); setProgress(0);
    const t = setInterval(() => setProgress((p) => (p >= 100 ? 100 : p + 3)), 70);
    setTimeout(() => {
      clearInterval(t);
      const r = { matched: 148_210 + Math.floor(Math.random() * 400), breaks: 2 + Math.floor(Math.random() * 4) };
      setResult(r);
      setRunning(false);
      onDone(r);
      push({ kind: "success", title: "Reconciliation complete", body: `REC-2026-0824 · ${num(r.matched)} matched · ${r.breaks} breaks raised.` });
    }, 3200);
  };
  return (
    <Modal open onClose={running ? () => {} : close} tone="green" icon="bi-arrow-repeat" size="md"
      title="Run reconciliation" subtitle="Match internal journal against partner & bank files">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <>
            <label className="form-label">Scope</label>
            <div className="d-flex flex-column gap-2 mb-3">
              {[
                ["all", "All channels — today", "M-Pesa, cards, banks, internal, ATM, PesaLink"],
                ["mpesa", "M-Pesa only", "Safaricom Daraja EOD files"],
                ["cards", "Cards (Visa + Mastercard)", "Scheme clearing files"],
                ["banks", "Bank direct", "MT940 statements"],
                ["day", "Specific day (re-run)", "Pick a prior business day"],
              ].map(([id, l, d]) => (
                <button key={id} className={`pm-opt ${scope === id ? "active" : ""}`} onClick={() => setScope(id)}>
                  <span className="r" />
                  <span className="flex-grow-1">
                    <span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{l}</span>
                    <span className="d-block pm-td-sub">{d}</span>
                  </span>
                </button>
              ))}
            </div>
            {scope === "day" && (
              <select className="form-select" value={day} onChange={(e) => setDay(e.target.value)}>
                {["23 Aug 2026", "22 Aug 2026", "21 Aug 2026", "20 Aug 2026", "18 Aug 2026"].map((d) => <option key={d}>{d}</option>)}
              </select>
            )}
          </>
        )}
        {step === 1 && <TwoFactorField value={code} onChange={setCode} />}
        {step === 2 && (
          <div className="text-center py-4">
            {result ? (
              <>
                <div className="pm-modal-ico mx-auto mb-2" style={{ background: "#e7f8ef", color: "#0b8f52", width: 52, height: 52, fontSize: "1.4rem" }}><i className="bi bi-check-lg" /></div>
                <div style={{ fontWeight: 800, fontFamily: "Sora" }}>REC-2026-0824 complete</div>
                <div className="pm-td-sub mt-1">{num(result.matched)} matched · {result.breaks} breaks raised</div>
                <div className="pm-td-sub">Breaks are waiting in the board with engine suggestions.</div>
              </>
            ) : (
              <>
                <div className="mb-2" style={{ fontWeight: 700, fontFamily: "Sora" }}>Reconciling {scope === "all" ? "all channels" : scope}…</div>
                <div className="progress mb-2" style={{ height: 8 }}><div className="progress-bar" style={{ width: `${progress}%` }} /></div>
                <div style={{ fontSize: ".78rem", color: "var(--pm-muted)" }}>
                  {progress < 30 ? "Pulling settlement files…" : progress < 65 ? "Matching journal entries…" : progress < 100 ? "Computing variance…" : "Writing break report…"}
                </div>
              </>
            )}
          </div>
        )}
      </div>
      {!running && (
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>{result ? "Done" : "Cancel"}</button>
          {step > 0 && !result && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}>Back</button>}
          {step === 0 && <button className="btn btn-primary btn-sm" onClick={() => setStep(1)}>Next</button>}
          {step === 1 && <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => { setStep(2); run(); }}><i className="bi bi-play-fill me-1" />Run now</button>}
        </div>
      )}
    </Modal>
  );
}

/* ================================================================
   22. Export modal
   ================================================================ */
export function SettlementExportModal({
  open, onClose, runs, days, breaks,
}: { open: boolean; onClose: () => void; runs: SettlementRun[]; days: ReconDay[]; breaks: ReconBreak[] }) {
  const { push } = useToast();
  const [dataset, setDataset] = useState("runs");
  const [fmt, setFmt] = useState("csv");
  if (!open) return null;
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-download" size="sm"
      title="Export settlement data" subtitle="Watermarked · written to the audit log">
      <div className="pm-modal-body">
        <label className="form-label">Dataset</label>
        <div className="d-flex flex-column gap-2 mb-3">
          {[
            ["runs", `Settlement runs (${runs.length})`],
            ["days", `Daily reconciliations (${days.length})`],
            ["breaks", `Breaks (${breaks.length})`],
            ["all", "Full pack (3 files)"],
          ].map(([id, l]) => (
            <button key={id} className={`pm-opt ${dataset === id ? "active" : ""}`} onClick={() => setDataset(id)}>
              <span className="r" /><span style={{ fontWeight: 700, fontSize: ".85rem" }}>{l}</span>
            </button>
          ))}
        </div>
        <label className="form-label">Format</label>
        <div className="d-flex gap-1">
          {["csv", "json"].map((f) => <button key={f} className={`pm-chip ${fmt === f ? "active" : ""}`} onClick={() => setFmt(f)}>{f.toUpperCase()}</button>)}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => {
          const dl = (name: string, data: unknown[]) => {
            if (fmt === "json") jsonDownload(`${name}.json`, data);
            else csvDownload(`${name}.csv`, data as unknown as Record<string, unknown>[]);
          };
          if (dataset === "runs" || dataset === "all") dl("settlement-runs", runs);
          if (dataset === "days" || dataset === "all") dl("daily-reconciliations", days);
          if (dataset === "breaks" || dataset === "all") dl("recon-breaks", breaks);
          push({ kind: "success", title: "Export ready", body: dataset === "all" ? "3 files downloaded." : "File downloaded." });
          onClose();
        }}>
          <i className="bi bi-download me-1" />Download
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   23. Advanced filter drawer (runs table)
   ================================================================ */
export type RunFilters = {
  q: string; type: string; status: string; auto: string; minAmount: number;
};
export const EMPTY_RUN_FILTERS: RunFilters = { q: "", type: "all", status: "all", auto: "all", minAmount: 0 };

export function RunFilterDrawer({
  open, filters, onClose, onApply,
}: { open: boolean; filters: RunFilters; onClose: () => void; onApply: (f: RunFilters) => void }) {
  const [f, setF] = useState(filters);
  return (
    <Drawer open={open} onClose={onClose} icon="bi-funnel-fill" tone="blue" title="Filter settlement runs"
      subtitle="Type, status, execution mode and size floor"
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => { setF(EMPTY_RUN_FILTERS); onApply(EMPTY_RUN_FILTERS); }}>Clear all</button>
          <button className="btn btn-primary btn-sm" onClick={() => { onApply(f); onClose(); }}>Apply</button>
        </>
      }>
      <div className="d-flex flex-column gap-3">
        <div>
          <label className="form-label">Run type</label>
          <select className="form-select" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
            <option value="all">All types</option>
            {["Pay-in", "Pay-out", "Card clearing", "Bill commission", "Loan settlement", "Scheme fees", "Partner payout"].map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Status</label>
          <select className="form-select" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
            <option value="all">All statuses</option>
            {["Scheduled", "Processing", "In transit", "Completed", "Overdue", "Failed", "On hold"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Execution</label>
          <div className="pm-seg">
            {[["all", "All"], ["auto", "Auto"], ["manual", "Manual"]].map(([v, l]) => (
              <button key={v} className={f.auto === v ? "active" : ""} onClick={() => setF({ ...f, auto: v })}>{l}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="form-label">Minimum amount — {f.minAmount === 0 ? "any" : kes(f.minAmount, { compact: true })}</label>
          <input type="range" className="form-range" min={0} max={15_000_000} step={100_000} value={f.minAmount} onChange={(e) => setF({ ...f, minAmount: Number(e.target.value) })} />
        </div>
      </div>
    </Drawer>
  );
}

/* ============================ 24. Settlement analytics modal ============================ */
export function SettlementAnalyticsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const stats = [
    { label: "Total settled today", value: "KES 1.2B", color: "#12b76a" },
    { label: "Pending settlements", value: "24", color: "#f79009" },
    { label: "Breaks open", value: "14", color: "#f04438" },
    { label: "Avg settlement time", value: "2.4h", color: "#2e90fa" },
    { label: "Match rate", value: "99.7%", color: "#12b76a" },
    { label: "Suspense balance", value: "KES 2.1M", color: "#7a5af8" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-graph-up" tone="blue" title="Settlement analytics" subtitle="Performance metrics">
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

/* ============================ 25. Reconciliation status modal ============================ */
export function ReconStatusDetailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const channels = [
    { name: "M-Pesa", matched: 8420, breaks: 12, rate: 99.9 },
    { name: "Card", matched: 3240, breaks: 3, rate: 99.9 },
    { name: "Bank", matched: 1180, breaks: 8, rate: 99.3 },
    { name: "Internal", matched: 45, breaks: 1, rate: 97.8 },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-check-circle" tone="green" title="Reconciliation status" subtitle="Channel-level match rates">
      <div className="d-flex flex-column gap-2">
        {channels.map((c) => (
          <div key={c.name} className="pm-card pm-card-pad">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontWeight: 700, fontSize: ".88rem" }}>{c.name}</span>
              <Badge tone={c.rate > 99.5 ? "green" : c.rate > 99 ? "amber" : "red"}>{c.rate}%</Badge>
            </div>
            <div className="d-flex justify-content-between" style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>
              <span>{c.matched.toLocaleString()} matched</span>
              <span>{c.breaks} breaks</span>
            </div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 26. Settlement insights modal ============================ */
export function SettlementInsightsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const insights = [
    { icon: "bi-graph-up", title: "Settlement volume up", detail: "15% increase in daily volume vs last week", tone: "green" },
    { icon: "bi-exclamation-triangle", title: "Break rate elevated", detail: "14 breaks today, 3 above threshold", tone: "amber" },
    { icon: "bi-check-circle", title: "Match rate stable", detail: "99.7% match rate, within target", tone: "green" },
    { icon: "bi-clock-history", title: "Settlement time improved", detail: "Avg 2.4h, down from 3.1h", tone: "green" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-lightbulb" tone="blue" title="Settlement insights" subtitle="AI-powered analysis">
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

/* ============================ 27. Break detail modal ============================ */
export function BreakDetailInfoModal({ brk, onClose }: { brk: ReconBreak | null; onClose: () => void }) {
  if (!brk) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-exclamation-triangle" tone="red" title="Break detail" subtitle={brk.id}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Amount</span><span className="v pm-num" style={{ fontWeight: 700 }}>{kes(brk.amount)}</span></div>
        <div className="pm-kv"><span className="k">Channel</span><span className="v">{brk.channel}</span></div>
        <div className="pm-kv"><span className="k">Type</span><span className="v"><Badge tone="red">{brk.type}</Badge></span></div>
        <div className="pm-kv"><span className="k">Raised</span><span className="v">{brk.raised}</span></div>
        <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone={brk.status === "Open" ? "red" : brk.status === "Escalated" ? "amber" : "green"}>{brk.status}</Badge></span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 28. Run detail modal ============================ */
export function RunDetailInfoModal({ run, onClose }: { run: SettlementRun | null; onClose: () => void }) {
  if (!run) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-play-circle" tone="blue" title="Run detail" subtitle={run.id}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Partner</span><span className="v">{run.partner}</span></div>
        <div className="pm-kv"><span className="k">Amount</span><span className="v pm-num" style={{ fontWeight: 700 }}>{kes(run.amount, { compact: true })}</span></div>
        <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone={run.status === "Completed" ? "green" : run.status === "Processing" ? "blue" : run.status === "On hold" ? "amber" : "red"}>{run.status}</Badge></span></div>
        <div className="pm-kv"><span className="k">Date</span><span className="v">{run.date}</span></div>
        <div className="pm-kv"><span className="k">Reference</span><span className="v mono">{run.reference}</span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 29. Suspense detail modal ============================ */
export function SuspenseDetailInfoModal({ entry, onClose }: { entry: SuspenseEntry | null; onClose: () => void }) {
  if (!entry) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-clock-history" tone="amber" title="Suspense entry" subtitle={entry.id}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Amount</span><span className="v pm-num" style={{ fontWeight: 700 }}>{kes(entry.amount)}</span></div>
        <div className="pm-kv"><span className="k">Source</span><span className="v">{entry.source}</span></div>
        <div className="pm-kv"><span className="k">Reason</span><span className="v">{entry.reason}</span></div>
        <div className="pm-kv"><span className="k">Created</span><span className="v">{entry.created}</span></div>
        <div className="pm-kv"><span className="k">Age</span><span className="v pm-num">{entry.ageDays} days</span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 30. Settlement forecast modal ============================ */
export function SettlementForecastModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const forecast = [
    { partner: "Safaricom", volume: "KES 420M", settlement: "2h" },
    { partner: "KCB Bank", volume: "KES 180M", settlement: "4h" },
    { partner: "Equity Bank", volume: "KES 95M", settlement: "3h" },
    { partner: "Co-op Bank", volume: "KES 62M", settlement: "5h" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-calendar-range" tone="blue" title="Settlement forecast" subtitle="Next settlement cycle">
      <div className="d-flex flex-column gap-2">
        {forecast.map((f) => (
          <div key={f.partner} className="pm-card pm-card-pad d-flex align-items-center justify-content-between">
            <div><div style={{ fontWeight: 700, fontSize: ".88rem" }}>{f.partner}</div><div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>Est. {f.settlement}</div></div>
            <div style={{ fontWeight: 800, fontSize: ".95rem" }}>{f.volume}</div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

void SUSPENSE;
void STATEMENTS;
void BANK_ACCOUNTS;
void RECON_CONFIG;
void RECON_CHANNELS;
