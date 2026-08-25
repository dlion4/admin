import { useState } from "react";
import { Avatar, Badge, Drawer, Meter, Modal, Steps, TwoFactorField, useToast } from "../../../components/ui";
import { csvDownload, jsonDownload, kes, num } from "../../../lib/format";
import type { BatchJob, HoldRecord, JournalAccount, LedgerEntry } from "../data/ledgerData";
import { BATCHES, HOLDS, JOURNAL_ACCOUNTS, LEDGER_ENTRIES } from "../data/ledgerData";

const statusTone = (s: string) =>
  s === "Posted" || s === "Completed" || s === "Released" || s === "Active" ? "green"
    : s === "Pending" || s === "Queued" || s === "Running" || s === "Settling" ? "blue"
      : s === "Held" || s === "Paused" ? "amber"
        : s === "Reversed" || s === "Converted" ? "violet"
          : "red";

const typeTone = (t: string) =>
  t === "Deposit" || t === "Refund" || t === "Interest" ? "green"
    : t === "Withdrawal" || t === "Fee" ? "amber"
      : t === "Reversal" || t === "Adjustment" ? "violet"
        : t === "FX" || t === "Settlement" ? "blue"
          : "grey";

/* ============================ 1. Entry detail drawer ============================ */
export function EntryDrawer({
  entry, onClose, onReverse, onHold, onRelease, onJournal, onFlag,
}: {
  entry: LedgerEntry | null;
  onClose: () => void;
  onReverse: (e: LedgerEntry) => void;
  onHold: (e: LedgerEntry) => void;
  onRelease: (e: LedgerEntry) => void;
  onJournal: (e: LedgerEntry) => void;
  onFlag: (e: LedgerEntry) => void;
}) {
  const { push } = useToast();
  if (!entry) return null;
  return (
    <Drawer
      open
      onClose={onClose}
      wide
      icon="bi-receipt"
      tone={entry.status === "Held" ? "amber" : entry.status === "Reversed" || entry.status === "Failed" ? "red" : "green"}
      title={entry.id}
      subtitle={`${entry.time} EAT · ${entry.type} · ${entry.rail} · ${entry.county}`}
      headExtra={<Badge tone={statusTone(entry.status)} dot>{entry.status}</Badge>}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => { jsonDownload(`${entry.id}.json`, entry); push({ kind: "success", title: "Entry exported" }); }}>
            <i className="bi bi-download me-1" />JSON
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => onJournal(entry)}>
            <i className="bi bi-journal-text me-1" />Journal
          </button>
          {entry.status === "Held" ? (
            <button className="btn btn-primary btn-sm flex-grow-1" onClick={() => onRelease(entry)}>
              <i className="bi bi-play-circle me-1" />Release hold
            </button>
          ) : entry.status === "Posted" ? (
            <>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => onHold(entry)}>
                <i className="bi bi-pause-circle me-1" />Hold
              </button>
              <button className="btn btn-primary btn-sm flex-grow-1" onClick={() => onReverse(entry)}>
                <i className="bi bi-arrow-counterclockwise me-1" />Reverse
              </button>
            </>
          ) : (
            <button className="btn btn-primary btn-sm flex-grow-1" onClick={() => onFlag(entry)}>
              <i className="bi bi-flag me-1" />Flag for review
            </button>
          )}
        </>
      }
    >
      <div className="pm-card pm-card-pad mb-3">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <div className="pm-eyebrow">Amount</div>
            <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.7rem" }}>
              {entry.currency === "KES" ? kes(entry.amount) : `${entry.currency} ${num(entry.amount)}`}
            </div>
            <div style={{ fontSize: ".75rem", color: "var(--pm-muted)" }}>
              Fee {kes(entry.fee)} · net {kes(entry.amount - entry.fee)}
            </div>
          </div>
          <div className="text-end">
            <Badge tone={typeTone(entry.type)}>{entry.type}</Badge>
            <div className="mt-1"><Badge tone="grey">{entry.rail}</Badge></div>
            <div style={{ fontSize: ".72rem", color: "var(--pm-muted)", marginTop: ".3rem" }}>
              Fraud {entry.fraudScore}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-6">
          <div className="pm-card pm-card-pad h-100">
            <div className="pm-eyebrow mb-2">Debit</div>
            <div style={{ fontWeight: 700, fontSize: ".84rem" }}>{entry.debitAccount}</div>
            <div className="pm-td-sub mono">{entry.userId} · {entry.userName}</div>
          </div>
        </div>
        <div className="col-6">
          <div className="pm-card pm-card-pad h-100">
            <div className="pm-eyebrow mb-2">Credit</div>
            <div style={{ fontWeight: 700, fontSize: ".84rem" }}>{entry.creditAccount}</div>
            <div className="pm-td-sub">{entry.counterparty}</div>
          </div>
        </div>
      </div>

      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Journal</span><span className="v mono">{entry.journalId}</span></div>
        <div className="pm-kv"><span className="k">Rail reference</span><span className="v mono">{entry.ref}</span></div>
        <div className="pm-kv"><span className="k">Narrative</span><span className="v" style={{ maxWidth: 280 }}>{entry.narrative}</span></div>
        <div className="pm-kv"><span className="k">County</span><span className="v">{entry.county}</span></div>
        {entry.batchId && <div className="pm-kv"><span className="k">Batch</span><span className="v mono">{entry.batchId}</span></div>}
        {entry.reversedBy && <div className="pm-kv"><span className="k">Reversed by</span><span className="v mono">{entry.reversedBy}</span></div>}
        {entry.holdReason && <div className="pm-kv"><span className="k">Hold reason</span><span className="v">{entry.holdReason}</span></div>}
        <div className="pm-kv"><span className="k">Hash</span><span className="v mono" style={{ fontSize: ".7rem" }}>0x{entry.id.slice(-4)}…c4b9</span></div>
      </div>

      <div className="pm-card">
        <div className="pm-card-head"><h6 className="pm-card-title">Double-entry journal lines</h6></div>
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Side</th><th>Account</th><th className="text-end">Amount</th></tr></thead>
            <tbody>
              <tr>
                <td><Badge tone="red">Debit (Dr)</Badge></td>
                <td className="pm-td-strong">{entry.debitAccount}</td>
                <td className="text-end pm-num" style={{ fontWeight: 700 }}>{kes(entry.amount)}</td>
              </tr>
              <tr>
                <td><Badge tone="green">Credit (Cr)</Badge></td>
                <td className="pm-td-strong">{entry.creditAccount}</td>
                <td className="text-end pm-num" style={{ fontWeight: 700 }}>{kes(entry.amount)}</td>
              </tr>
              {entry.fee > 0 && (
                <>
                  <tr>
                    <td><Badge tone="red">Debit (Dr)</Badge></td>
                    <td className="pm-td-strong">1000 Customer Wallets (fee)</td>
                    <td className="text-end pm-num">{kes(entry.fee)}</td>
                  </tr>
                  <tr>
                    <td><Badge tone="green">Credit (Cr)</Badge></td>
                    <td className="pm-td-strong">4000 Fee Revenue</td>
                    <td className="text-end pm-num">{kes(entry.fee)}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
        <div className="pm-table-foot">
          <span>Balanced · Dr = Cr · immutable after post</span>
          <Badge tone="green">Balanced</Badge>
        </div>
      </div>
    </Drawer>
  );
}

/* ============================ 2. Reverse wizard ============================ */
export function ReverseWizard({
  entry, onClose, onDone,
}: {
  entry: LedgerEntry | null;
  onClose: () => void;
  onDone: (e: LedgerEntry, reason: string) => void;
}) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [reason, setReason] = useState("duplicate");
  const [refundFee, setRefundFee] = useState(true);
  const [notify, setNotify] = useState(true);
  const [note, setNote] = useState("");
  const [code, setCode] = useState("");
  const steps = [
    { label: "Reason", icon: "bi-chat-left-text" },
    { label: "Impact", icon: "bi-calculator" },
    { label: "2FA", icon: "bi-shield-lock" },
    { label: "Confirm", icon: "bi-check2" },
  ];
  const close = () => { setStep(0); setCode(""); setNote(""); onClose(); };
  if (!entry) return null;
  const creditBack = entry.amount + (refundFee ? entry.fee : 0);
  return (
    <Modal open onClose={close} tone="amber" icon="bi-arrow-counterclockwise" size="lg"
      title={`Reverse ${entry.id}`} subtitle={`${entry.userName} · ${kes(entry.amount)} · ${entry.rail}`}>
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%`, background: "#f79009" }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="d-flex flex-column gap-2">
            {[
              ["duplicate", "Duplicate charge", "Same amount posted twice within 5 minutes"],
              ["error", "Operational error", "Wrong beneficiary or amount entered by staff"],
              ["fraud", "Confirmed fraud", "Customer not the originator — funds returned"],
              ["dispute", "Customer dispute upheld", "Chargeback or support case won by customer"],
              ["regulator", "Regulator instruction", "CBK / FRA directed reversal"],
            ].map(([id, l, d]) => (
              <button key={id} className={`pm-opt ${reason === id ? "active" : ""}`} onClick={() => setReason(id)}>
                <span className="r" />
                <span className="flex-grow-1">
                  <span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{l}</span>
                  <span className="d-block" style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>{d}</span>
                </span>
              </button>
            ))}
            <label className="form-label mt-2">Investigator note</label>
            <textarea className="form-control" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ticket reference, evidence…" />
          </div>
        )}
        {step === 1 && (
          <>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">Original amount</span><span className="v">{kes(entry.amount)}</span></div>
              <div className="pm-kv"><span className="k">Original fee</span><span className="v">{kes(entry.fee)}</span></div>
              <div className="pm-kv"><span className="k">Credit back to customer</span><span className="v" style={{ color: "#0b8f52" }}>{kes(creditBack)}</span></div>
              <div className="pm-kv"><span className="k">Rail reversal</span><span className="v">{entry.rail} API · {entry.rail.includes("Card") ? "3–5 business days" : "Real time"}</span></div>
              <div className="pm-kv"><span className="k">Compensating journal</span><span className="v mono">JRN-REV-{entry.journalId.slice(-6)}</span></div>
            </div>
            <label className="pm-opt mb-2">
              <input type="checkbox" className="form-check-input mt-0" checked={refundFee} onChange={(e) => setRefundFee(e.target.checked)} />
              <span style={{ fontWeight: 700, fontSize: ".85rem" }}>Also refund the platform fee ({kes(entry.fee)})</span>
            </label>
            <label className="pm-opt">
              <input type="checkbox" className="form-check-input mt-0" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
              <span style={{ fontWeight: 700, fontSize: ".85rem" }}>Notify {entry.userName} by SMS + push</span>
            </label>
          </>
        )}
        {step === 2 && <TwoFactorField value={code} onChange={setCode} />}
        {step === 3 && (
          <div className="pm-card pm-card-pad">
            <div className="pm-kv"><span className="k">Transaction</span><span className="v mono">{entry.id}</span></div>
            <div className="pm-kv"><span className="k">Customer</span><span className="v">{entry.userName}</span></div>
            <div className="pm-kv"><span className="k">Reason</span><span className="v">{reason}</span></div>
            <div className="pm-kv"><span className="k">Credit back</span><span className="v">{kes(creditBack)}</span></div>
            <div className="pm-kv"><span className="k">Notify</span><span className="v">{notify ? "Yes" : "No"}</span></div>
            <div className="pm-kv"><span className="k">Authorised by</span><span className="v">Joseph Mwangi · Tier 0</span></div>
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
        {step < 3 && (
          <button className="btn btn-primary btn-sm" disabled={step === 2 && code !== "482913"} onClick={() => setStep(step + 1)}>
            Next<i className="bi bi-arrow-right ms-1" />
          </button>
        )}
        {step === 3 && (
          <button className="btn btn-primary btn-sm" onClick={() => {
            onDone(entry, reason);
            push({ kind: "success", title: `${entry.id} reversed`, body: `${kes(creditBack)} credited · REV-2026-0448 created.` });
            close();
          }}>
            <i className="bi bi-arrow-counterclockwise me-1" />Reverse transaction
          </button>
        )}
      </div>
    </Modal>
  );
}

/* ============================ 3. Hold modal ============================ */
export function HoldModal({
  entry, onClose, onDone,
}: {
  entry: LedgerEntry | null;
  onClose: () => void;
  onDone: (e: LedgerEntry, reason: string) => void;
}) {
  const { push } = useToast();
  const [reason, setReason] = useState("velocity");
  const [hours, setHours] = useState("4");
  const [code, setCode] = useState("");
  if (!entry) return null;
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-pause-circle" size="md"
      title={`Hold ${entry.id}`} subtitle={`${entry.userName} · ${kes(entry.amount)} reserved pending review`}>
      <div className="pm-modal-body">
        <label className="form-label">Hold reason</label>
        <select className="form-select mb-3" value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="velocity">Velocity / multi-device breach</option>
          <option value="aml">AML structuring review</option>
          <option value="beneficiary">New high-value beneficiary</option>
          <option value="manual">Manual investigation</option>
          <option value="sanctions">Sanctions / PEP match</option>
        </select>
        <label className="form-label">Auto-release after</label>
        <div className="d-flex gap-1 flex-wrap mb-3">
          {[["1", "1 hour"], ["4", "4 hours"], ["24", "24 hours"], ["0", "Manual only"]].map(([v, l]) => (
            <button key={v} className={`pm-chip ${hours === v ? "active" : ""}`} onClick={() => setHours(v)}>{l}</button>
          ))}
        </div>
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => {
          onDone(entry, reason);
          push({ kind: "warn", title: `${entry.id} held`, body: `${kes(entry.amount)} locked · auto-release ${hours === "0" ? "manual" : hours + "h"}.` });
          onClose();
        }}>
          <i className="bi bi-pause-circle me-1" />Place hold
        </button>
      </div>
    </Modal>
  );
}

/* ============================ 4. Release hold modal ============================ */
export function ReleaseHoldModal({
  hold, onClose, onDone,
}: {
  hold: HoldRecord | null;
  onClose: () => void;
  onDone: (h: HoldRecord) => void;
}) {
  const { push } = useToast();
  const [code, setCode] = useState("");
  const [note, setNote] = useState("");
  if (!hold) return null;
  return (
    <Modal open onClose={onClose} tone="green" icon="bi-play-circle" size="sm"
      title={`Release hold ${hold.id}`} subtitle={`${hold.txnId} · ${hold.userName} · ${kes(hold.amount)}`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Reason held</span><span className="v">{hold.reason}</span></div>
          <div className="pm-kv"><span className="k">Held by</span><span className="v">{hold.heldBy}</span></div>
          <div className="pm-kv"><span className="k">Held at</span><span className="v">{hold.heldAt}</span></div>
          <div className="pm-kv"><span className="k">Expires</span><span className="v">{hold.expiresAt}</span></div>
        </div>
        <label className="form-label">Release note</label>
        <textarea className="form-control mb-3" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Customer verified / false positive…" />
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => {
          onDone(hold);
          push({ kind: "success", title: `${hold.id} released`, body: `${kes(hold.amount)} released to settlement.` });
          onClose();
        }}>
          <i className="bi bi-play-circle me-1" />Release hold
        </button>
      </div>
    </Modal>
  );
}

/* ============================ 5. Journal viewer modal ============================ */
export function JournalModal({
  entry, onClose,
}: {
  entry: LedgerEntry | null;
  onClose: () => void;
}) {
  const { push } = useToast();
  if (!entry) return null;
  const lines = [
    { side: "Dr", account: entry.debitAccount, amount: entry.amount },
    { side: "Cr", account: entry.creditAccount, amount: entry.amount },
    ...(entry.fee > 0 ? [
      { side: "Dr", account: "1000 Customer Wallets (fee)", amount: entry.fee },
      { side: "Cr", account: "4000 Fee Revenue", amount: entry.fee },
    ] : []),
  ];
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-journal-text" size="lg"
      title={`Journal ${entry.journalId}`} subtitle={`${entry.id} · ${entry.time} · balanced double-entry`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-table-wrap mb-3">
          <table className="pm-table">
            <thead><tr><th>Side</th><th>Account</th><th className="text-end">Amount (KES)</th></tr></thead>
            <tbody>
              {lines.map((l, i) => (
                <tr key={i}>
                  <td><Badge tone={l.side === "Dr" ? "red" : "green"}>{l.side === "Dr" ? "Debit" : "Credit"}</Badge></td>
                  <td className="pm-td-strong">{l.account}</td>
                  <td className="text-end pm-num" style={{ fontWeight: 700 }}>{kes(l.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pm-code">{`{
  "journalId": "${entry.journalId}",
  "txnId": "${entry.id}",
  "postedAt": "2026-08-24T${entry.time}+03:00",
  "currency": "${entry.currency}",
  "balanced": true,
  "hash": "0x${entry.id.slice(-4)}c4b9a1f2",
  "immutable": true
}`}</div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => {
          jsonDownload(`${entry.journalId}.json`, { entry, lines });
          push({ kind: "success", title: "Journal exported" });
        }}>
          <i className="bi bi-download me-1" />Export journal
        </button>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ============================ 6. Chart of accounts drawer ============================ */
export function AccountsDrawer({
  open, onClose, onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (a: JournalAccount) => void;
}) {
  const [q, setQ] = useState("");
  const list = JOURNAL_ACCOUNTS.filter((a) => (a.code + a.name + a.type).toLowerCase().includes(q.toLowerCase()));
  return (
    <Drawer open={open} onClose={onClose} icon="bi-journal-bookmark" tone="green" title="Chart of accounts"
      subtitle="14 ledger accounts · double-entry balanced"
      footer={<button className="btn btn-primary btn-sm w-100" onClick={() => {
        csvDownload("chart-of-accounts.csv", JOURNAL_ACCOUNTS as unknown as Record<string, unknown>[]);
      }}>
        <i className="bi bi-download me-1" />Export CoA
      </button>}>
      <div className="pm-search mb-3" style={{ background: "#fff" }}>
        <i className="bi bi-search" />
        <input placeholder="Code, name or type…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="d-flex flex-column gap-2">
        {list.map((a) => (
          <button key={a.code} className="pm-alert-row info text-start w-100" onClick={() => onSelect(a)}>
            <span className="pm-avatar sm" style={{ background: a.type === "Asset" ? "#12b76a" : a.type === "Liability" ? "#2e90fa" : a.type === "Revenue" ? "#7a5af8" : a.type === "Expense" ? "#f79009" : "#98a2b3" }}>
              {a.code.slice(0, 2)}
            </span>
            <div className="flex-grow-1">
              <div style={{ fontWeight: 700, fontSize: ".84rem" }}>{a.code} · {a.name}</div>
              <div className="pm-td-sub">{a.type} · {num(a.entries30d)} entries (30d)</div>
            </div>
            <div className="text-end">
              <div className="pm-num" style={{ fontWeight: 700 }}>{kes(a.balance, { compact: true })}</div>
              <Badge tone="grey">{a.type}</Badge>
            </div>
          </button>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 7. Account drill-down modal ============================ */
export function AccountModal({
  account, onClose,
}: {
  account: JournalAccount | null;
  onClose: () => void;
}) {
  const { push } = useToast();
  if (!account) return null;
  const sample = LEDGER_ENTRIES.filter((e) =>
    e.debitAccount.includes(account.name.split(" ")[0]) || e.creditAccount.includes(account.name.split(" ")[0])
  ).slice(0, 8);
  return (
    <Modal open onClose={onClose} tone="green" icon="bi-journal-bookmark" size="lg"
      title={`${account.code} — ${account.name}`} subtitle={`${account.type} · ${num(account.entries30d)} entries (30d)`}>
      <div className="pm-modal-body">
        <div className="row g-2 mb-3">
          {[
            { l: "Balance", v: kes(account.balance, { compact: true }) },
            { l: "Type", v: account.type },
            { l: "Entries (30d)", v: num(account.entries30d) },
            { l: "Avg per day", v: num(Math.round(account.entries30d / 30)) },
          ].map((x) => (
            <div className="col-6 col-lg-3" key={x.l}>
              <div className="pm-stat">
                <div className="pm-stat-label">{x.l}</div>
                <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.05rem" }}>{x.v}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="pm-eyebrow mb-2">Recent postings</div>
        <div className="pm-card pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>TXN</th><th>Type</th><th className="text-end">Amount</th><th>Status</th></tr></thead>
            <tbody>
              {(sample.length ? sample : LEDGER_ENTRIES.slice(0, 6)).map((e) => (
                <tr key={e.id}>
                  <td className="mono pm-td-strong">{e.id}</td>
                  <td><Badge tone={typeTone(e.type)}>{e.type}</Badge></td>
                  <td className="text-end pm-num">{kes(e.amount)}</td>
                  <td><Badge tone={statusTone(e.status)}>{e.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => {
          csvDownload(`account-${account.code}.csv`, sample as unknown as Record<string, unknown>[]);
          push({ kind: "success", title: "Account export ready" });
        }}>
          <i className="bi bi-download me-1" />Export
        </button>
        <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ============================ 8. Batch detail drawer ============================ */
export function BatchDrawer({
  batch, onClose, onPause, onRetry, onApprove,
}: {
  batch: BatchJob | null;
  onClose: () => void;
  onPause: (b: BatchJob) => void;
  onRetry: (b: BatchJob) => void;
  onApprove: (b: BatchJob) => void;
}) {
  if (!batch) return null;
  const pct = batch.total ? Math.round((batch.processed / batch.total) * 100) : 0;
  return (
    <Drawer open onClose={onClose} icon="bi-layers" tone={batch.status === "Failed" ? "red" : batch.status === "Running" ? "blue" : batch.status === "Paused" ? "amber" : "green"}
      title={batch.name} subtitle={`${batch.id} · ${batch.type} · ${batch.owner}`}
      headExtra={<Badge tone={statusTone(batch.status)} dot>{batch.status}</Badge>}
      footer={
        <>
          {batch.status === "Running" && (
            <button className="btn btn-outline-secondary btn-sm" onClick={() => onPause(batch)}>
              <i className="bi bi-pause me-1" />Pause
            </button>
          )}
          {batch.status === "Failed" && (
            <button className="btn btn-outline-secondary btn-sm" onClick={() => onRetry(batch)}>
              <i className="bi bi-arrow-clockwise me-1" />Retry failed
            </button>
          )}
          {batch.status === "Queued" && (
            <button className="btn btn-primary btn-sm flex-grow-1" onClick={() => onApprove(batch)}>
              <i className="bi bi-play-fill me-1" />Approve & run
            </button>
          )}
          {batch.status !== "Queued" && (
            <button className="btn btn-primary btn-sm flex-grow-1" onClick={onClose}>Close</button>
          )}
        </>
      }
    >
      <div className="row g-2 mb-3">
        {[
          { l: "Total items", v: num(batch.total) },
          { l: "Processed", v: num(batch.processed) },
          { l: "Failed", v: num(batch.failed) },
          { l: "Amount", v: kes(batch.amount, { compact: true }) },
        ].map((x) => (
          <div className="col-6" key={x.l}>
            <div className="pm-stat">
              <div className="pm-stat-label">{x.l}</div>
              <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1rem" }}>{x.v}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="pm-card pm-card-pad mb-3">
        <div className="d-flex justify-content-between mb-1">
          <span className="pm-eyebrow">Progress</span>
          <span style={{ fontWeight: 800 }}>{pct}%</span>
        </div>
        <Meter value={pct} tone={batch.status === "Failed" ? "#f04438" : "#12b76a"} width={420} />
        <div className="pm-kv mt-2"><span className="k">Started</span><span className="v">{batch.started}</span></div>
        <div className="pm-kv"><span className="k">Owner</span><span className="v">{batch.owner}</span></div>
        <div className="pm-kv"><span className="k">Type</span><span className="v">{batch.type}</span></div>
      </div>
      <div className="pm-note">
        <i className="bi bi-info-circle me-1" />
        Batches write one journal entry per item. Failures land in the dead-letter queue and can be retried without re-processing successes.
      </div>
    </Drawer>
  );
}

/* ============================ 9. New batch wizard ============================ */
export function NewBatchWizard({
  open, onClose, onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (b: BatchJob) => void;
}) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [type, setType] = useState<BatchJob["type"]>("Payroll");
  const [count, setCount] = useState(100);
  const [amount, setAmount] = useState(1_000_000);
  const [code, setCode] = useState("");
  const steps = [
    { label: "Type", icon: "bi-layers" },
    { label: "Scope", icon: "bi-sliders" },
    { label: "2FA", icon: "bi-shield-lock" },
  ];
  const close = () => { setStep(0); setCode(""); onClose(); };
  if (!open) return null;
  return (
    <Modal open onClose={close} tone="blue" icon="bi-plus-circle" size="md"
      title="Create ledger batch" subtitle="Payroll, settlement, fee collection or partner payout.">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <>
            <label className="form-label">Batch name</label>
            <input className="form-control mb-3" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. September payroll — Apex Capital" />
            <label className="form-label">Type</label>
            <div className="d-flex flex-column gap-2">
              {(["Payroll", "Settlement", "Fee collection", "Interest", "Reversal batch", "Partner payout"] as BatchJob["type"][]).map((t) => (
                <button key={t} className={`pm-opt ${type === t ? "active" : ""}`} onClick={() => setType(t)}>
                  <span className="r" /><span style={{ fontWeight: 700, fontSize: ".85rem" }}>{t}</span>
                </button>
              ))}
            </div>
          </>
        )}
        {step === 1 && (
          <div className="row g-2">
            <div className="col-6">
              <label className="form-label">Item count</label>
              <input type="number" className="form-control mono" value={count} onChange={(e) => setCount(Number(e.target.value))} />
            </div>
            <div className="col-6">
              <label className="form-label">Total amount (KES)</label>
              <input type="number" className="form-control mono" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
            </div>
            <div className="col-12">
              <div className="pm-note mt-2">
                <i className="bi bi-info-circle me-1" />
                Estimated duration: ~{Math.max(1, Math.ceil(count / 200))} minutes at 200 items/min.
              </div>
            </div>
          </div>
        )}
        {step === 2 && <TwoFactorField value={code} onChange={setCode} />}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}>Back</button>}
        {step < 2 && (
          <button className="btn btn-primary btn-sm" disabled={step === 0 && name.trim().length < 4} onClick={() => setStep(step + 1)}>
            Next
          </button>
        )}
        {step === 2 && (
          <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => {
            const b: BatchJob = {
              id: `BAT-${2211 + Math.floor(Math.random() * 40)}`,
              name: name || "Untitled batch",
              type,
              status: "Queued",
              total: count,
              processed: 0,
              failed: 0,
              amount,
              started: "—",
              owner: "Joseph Mwangi",
            };
            onCreate(b);
            push({ kind: "success", title: "Batch queued", body: `${b.id} · ${num(count)} items · ${kes(amount, { compact: true })}.` });
            close();
          }}>
            <i className="bi bi-play-fill me-1" />Queue batch
          </button>
        )}
      </div>
    </Modal>
  );
}

/* ============================ 10. Batch approve modal ============================ */
export function BatchApproveModal({
  batch, onClose, onDone,
}: {
  batch: BatchJob | null;
  onClose: () => void;
  onDone: (b: BatchJob) => void;
}) {
  const { push } = useToast();
  const [code, setCode] = useState("");
  if (!batch) return null;
  return (
    <Modal open onClose={onClose} tone="green" icon="bi-play-fill" size="sm"
      title={`Approve & run ${batch.id}`} subtitle={`${batch.name} · ${num(batch.total)} items · ${kes(batch.amount, { compact: true })}`}>
      <div className="pm-modal-body">
        <div className="pm-note mb-3">
          Approving starts live money movement. Each item posts a balanced journal entry. Failures are isolated.
        </div>
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => {
          onDone(batch);
          push({ kind: "success", title: `${batch.id} running`, body: "First items posting now." });
          onClose();
        }}>
          <i className="bi bi-play-fill me-1" />Start batch
        </button>
      </div>
    </Modal>
  );
}

/* ============================ 11. Advanced search drawer ============================ */
export type LedgerFilters = {
  q: string;
  status: string;
  type: string;
  rail: string;
  minAmount: number;
  maxAmount: number;
  county: string;
  fraudMin: number;
};
export const EMPTY_LEDGER_FILTERS: LedgerFilters = {
  q: "", status: "all", type: "all", rail: "all", minAmount: 0, maxAmount: 0, county: "all", fraudMin: 0,
};

export function FilterDrawer({
  open, filters, onClose, onApply,
}: {
  open: boolean;
  filters: LedgerFilters;
  onClose: () => void;
  onApply: (f: LedgerFilters) => void;
}) {
  const [f, setF] = useState(filters);
  return (
    <Drawer open={open} onClose={onClose} icon="bi-funnel-fill" tone="blue" title="Advanced ledger filters"
      subtitle="Narrow the immutable journal by status, rail, amount and risk"
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => { setF(EMPTY_LEDGER_FILTERS); onApply(EMPTY_LEDGER_FILTERS); }}>
            Clear all
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => { onApply(f); onClose(); }}>Apply</button>
        </>
      }
    >
      <div className="d-flex flex-column gap-3">
        <div>
          <label className="form-label">Status</label>
          <select className="form-select" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
            <option value="all">All</option>
            {["Posted", "Pending", "Held", "Reversed", "Failed", "Settling"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Type</label>
          <select className="form-select" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
            <option value="all">All</option>
            {["Transfer", "Deposit", "Withdrawal", "Payment", "Fee", "FX", "Settlement", "Refund", "Interest", "Adjustment"].map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Rail</label>
          <select className="form-select" value={f.rail} onChange={(e) => setF({ ...f, rail: e.target.value })}>
            <option value="all">All</option>
            {["M-Pesa", "Card (Visa)", "Card (MC)", "PesaLink", "Internal", "Bank", "ATM", "PayPal"].map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">County</label>
          <select className="form-select" value={f.county} onChange={(e) => setF({ ...f, county: e.target.value })}>
            <option value="all">All</option>
            {["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Uasin Gishu", "Kiambu", "Machakos", "Nyeri"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Amount range (KES)</label>
          <div className="d-flex gap-2">
            <input type="number" className="form-control mono" placeholder="Min" value={f.minAmount || ""} onChange={(e) => setF({ ...f, minAmount: Number(e.target.value) })} />
            <input type="number" className="form-control mono" placeholder="Max" value={f.maxAmount || ""} onChange={(e) => setF({ ...f, maxAmount: Number(e.target.value) })} />
          </div>
        </div>
        <div>
          <label className="form-label">Minimum fraud score — {f.fraudMin}</label>
          <input type="range" className="form-range" min={0} max={100} step={5} value={f.fraudMin} onChange={(e) => setF({ ...f, fraudMin: Number(e.target.value) })} />
        </div>
      </div>
    </Drawer>
  );
}

/* ============================ 12. Export modal ============================ */
export function ExportModal({
  open, onClose, rows,
}: {
  open: boolean;
  onClose: () => void;
  rows: LedgerEntry[];
}) {
  const { push } = useToast();
  const [fmt, setFmt] = useState("csv");
  const [includePii, setIncludePii] = useState(false);
  if (!open) return null;
  return (
    <Modal open onClose={onClose} tone="blue" icon="bi-download" size="sm"
      title={`Export ${num(rows.length)} ledger entries`} subtitle="Watermarked · written to the audit log">
      <div className="pm-modal-body">
        <label className="form-label">Format</label>
        <div className="d-flex gap-1 mb-3">
          {["csv", "json", "xlsx"].map((f) => (
            <button key={f} className={`pm-chip ${fmt === f ? "active" : ""}`} onClick={() => setFmt(f)}>{f.toUpperCase()}</button>
          ))}
        </div>
        <label className="pm-opt">
          <input type="checkbox" className="form-check-input mt-0" checked={includePii} onChange={(e) => setIncludePii(e.target.checked)} />
          <span className="flex-grow-1">
            <b>Include customer PII</b>
            <span className="d-block pm-td-sub">Name, user ID and counterparty</span>
          </span>
          <Badge tone="red">Sensitive</Badge>
        </label>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => {
          const data = rows.map((r) => includePii
            ? r
            : { id: r.id, journalId: r.journalId, type: r.type, rail: r.rail, amount: r.amount, fee: r.fee, status: r.status, time: r.time });
          if (fmt === "json") jsonDownload("ledger-export.json", data);
          else csvDownload("ledger-export.csv", data as unknown as Record<string, unknown>[]);
          push({ kind: "success", title: "Ledger export ready", body: `${rows.length} rows · ${includePii ? "PII included" : "PII redacted"}.` });
          onClose();
        }}>
          <i className="bi bi-download me-1" />Download
        </button>
      </div>
    </Modal>
  );
}

/* ============================ 13. Bulk ledger action modal ============================ */
export function BulkLedgerModal({
  open, count, onClose, onDone,
}: {
  open: boolean;
  count: number;
  onClose: () => void;
  onDone: (action: string) => void;
}) {
  const [action, setAction] = useState("hold");
  const [code, setCode] = useState("");
  const needs2fa = action === "hold" || action === "reverse" || action === "release";
  if (!open) return null;
  return (
    <Modal open onClose={onClose} tone="amber" icon="bi-check2-square" size="md"
      title={`Bulk action on ${count} entries`} subtitle="One audit event per entry · atomic batch reference">
      <div className="pm-modal-body">
        <div className="d-flex flex-column gap-2 mb-3">
          {[
            ["hold", "Hold for review", "bi-pause-circle"],
            ["release", "Release holds", "bi-play-circle"],
            ["reverse", "Reverse (Posted only)", "bi-arrow-counterclockwise"],
            ["export", "Export selection", "bi-download"],
            ["flag", "Flag for fraud team", "bi-flag"],
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

/* ============================ 14. Flag / SAR modal ============================ */
export function FlagModal({
  entry, onClose, onDone,
}: {
  entry: LedgerEntry | null;
  onClose: () => void;
  onDone: (e: LedgerEntry) => void;
}) {
  const { push } = useToast();
  const [reason, setReason] = useState("structuring");
  const [code, setCode] = useState("");
  if (!entry) return null;
  return (
    <Modal open onClose={onClose} tone="red" icon="bi-flag" size="md"
      title={`Flag ${entry.id} for review`} subtitle={`${entry.userName} · ${kes(entry.amount)} · score ${entry.fraudScore}`}>
      <div className="pm-modal-body">
        <label className="form-label">Flag reason</label>
        <select className="form-select mb-3" value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="structuring">Structuring / smurfing</option>
          <option value="mule">Mule network link</option>
          <option value="ato">Account takeover</option>
          <option value="sanctions">Sanctions concern</option>
          <option value="other">Other — manual note</option>
        </select>
        <div className="pm-note mb-3">Creates SAR draft SAR-2026-0{40 + (entry.fraudScore % 20)} and routes to the Transaction Monitoring queue (Page 16).</div>
        <TwoFactorField value={code} onChange={setCode} />
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger btn-sm" disabled={code !== "482913"} onClick={() => {
          onDone(entry);
          push({ kind: "warn", title: `${entry.id} flagged`, body: `SAR draft opened · reason ${reason}.` });
          onClose();
        }}>
          <i className="bi bi-flag me-1" />Flag & open SAR
        </button>
      </div>
    </Modal>
  );
}

/* ============================ 15. Holds board drawer ============================ */
export function HoldsDrawer({
  open, onClose, holds, onRelease,
}: {
  open: boolean;
  onClose: () => void;
  holds: HoldRecord[];
  onRelease: (h: HoldRecord) => void;
}) {
  const active = holds.filter((h) => h.status === "Active");
  return (
    <Drawer open={open} onClose={onClose} wide icon="bi-pause-circle" tone="amber"
      title="Active transaction holds" subtitle={`${active.length} holds · ${kes(active.reduce((s, h) => s + h.amount, 0), { compact: true })} locked`}>
      <div className="d-flex flex-column gap-2">
        {holds.map((h) => (
          <div key={h.id} className="pm-alert-row" style={{ borderLeftColor: h.status === "Active" ? "#f79009" : h.status === "Released" ? "#12b76a" : "#7a5af8" }}>
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <span className="mono" style={{ fontWeight: 700, fontSize: ".8rem" }}>{h.id}</span>
                <Badge tone={statusTone(h.status)}>{h.status}</Badge>
                <span className="pm-num" style={{ fontWeight: 700 }}>{kes(h.amount)}</span>
              </div>
              <div style={{ fontSize: ".78rem", fontWeight: 600 }}>{h.userName} · <span className="mono">{h.txnId}</span></div>
              <div className="pm-td-sub">{h.reason} · held by {h.heldBy} · {h.heldAt}</div>
            </div>
            {h.status === "Active" && (
              <button className="btn btn-sm btn-outline-primary" onClick={() => onRelease(h)}>Release</button>
            )}
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 16. Reconciliation trigger modal ============================ */
export function ReconModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [rail, setRail] = useState("mpesa");
  const [code, setCode] = useState("");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  if (!open) return null;
  const run = () => {
    setRunning(true);
    setProgress(0);
    const t = setInterval(() => setProgress((p) => {
      if (p >= 100) { clearInterval(t); return 100; }
      return p + 5;
    }), 80);
    setTimeout(() => {
      push({ kind: "success", title: "Reconciliation complete", body: "REC-2026-0824 · 48,210 matched · 14 breaks raised." });
      setRunning(false);
      setProgress(0);
      onClose();
    }, 2200);
  };
  return (
    <Modal open onClose={running ? () => {} : onClose} tone="green" icon="bi-arrow-repeat" size="md"
      title="Trigger ledger reconciliation" subtitle="Match internal journal against partner settlement files.">
      <div className="pm-modal-body">
        {!running ? (
          <>
            <label className="form-label">Rail</label>
            <div className="d-flex flex-column gap-2 mb-3">
              {[
                ["mpesa", "M-Pesa (Safaricom Daraja)"],
                ["cards", "Cards (Visa + Mastercard)"],
                ["banks", "Bank direct (i&M, KCB, Equity)"],
                ["all", "All rails"],
              ].map(([v, l]) => (
                <button key={v} className={`pm-opt ${rail === v ? "active" : ""}`} onClick={() => setRail(v)}>
                  <span className="r" /><span style={{ fontWeight: 700, fontSize: ".85rem" }}>{l}</span>
                </button>
              ))}
            </div>
            <TwoFactorField value={code} onChange={setCode} />
          </>
        ) : (
          <div className="text-center py-4">
            <div className="mb-2" style={{ fontWeight: 700 }}>Reconciling {rail}…</div>
            <div className="progress mb-2" style={{ height: 8 }}><div className="progress-bar" style={{ width: `${progress}%` }} /></div>
            <div style={{ fontSize: ".78rem", color: "var(--pm-muted)" }}>
              {progress < 30 ? "Fetching settlement files…" : progress < 70 ? "Matching journal entries…" : "Writing break report…"}
            </div>
          </div>
        )}
      </div>
      {!running && (
        <div className="pm-modal-foot">
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={run}>
            <i className="bi bi-play-fill me-1" />Run reconciliation
          </button>
        </div>
      )}
    </Modal>
  );
}

/* ============================ 17. Manual journal entry wizard ============================ */
export function ManualJournalWizard({
  open, onClose, onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (e: LedgerEntry) => void;
}) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [debit, setDebit] = useState("1000 Customer Wallets");
  const [credit, setCredit] = useState("4000 Fee Revenue");
  const [amount, setAmount] = useState(5_000);
  const [narrative, setNarrative] = useState("");
  const [code, setCode] = useState("");
  const steps = [
    { label: "Accounts", icon: "bi-journal" },
    { label: "Amount", icon: "bi-cash" },
    { label: "2FA", icon: "bi-shield-lock" },
  ];
  const close = () => { setStep(0); setCode(""); onClose(); };
  if (!open) return null;
  return (
    <Modal open onClose={close} tone="violet" icon="bi-pencil-square" size="md"
      title="Post manual journal entry" subtitle="Super Admin · balanced double-entry · audit retained 7 years">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%`, background: "#7a5af8" }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="row g-2">
            <div className="col-12">
              <label className="form-label">Debit account</label>
              <select className="form-select" value={debit} onChange={(e) => setDebit(e.target.value)}>
                {JOURNAL_ACCOUNTS.map((a) => <option key={a.code}>{a.code} {a.name}</option>)}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Credit account</label>
              <select className="form-select" value={credit} onChange={(e) => setCredit(e.target.value)}>
                {JOURNAL_ACCOUNTS.map((a) => <option key={a.code}>{a.code} {a.name}</option>)}
              </select>
            </div>
          </div>
        )}
        {step === 1 && (
          <>
            <label className="form-label">Amount (KES)</label>
            <input type="number" className="form-control mono mb-3" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
            <label className="form-label">Narrative</label>
            <textarea className="form-control" rows={3} value={narrative} onChange={(e) => setNarrative(e.target.value)} placeholder="e.g. Support goodwill credit — ticket SUP-2026-1188" />
          </>
        )}
        {step === 2 && <TwoFactorField value={code} onChange={setCode} />}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}>Back</button>}
        {step < 2 && (
          <button className="btn btn-primary btn-sm" disabled={step === 1 && (amount <= 0 || narrative.trim().length < 5)} onClick={() => setStep(step + 1)}>
            Next
          </button>
        )}
        {step === 2 && (
          <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => {
            const e: LedgerEntry = {
              id: `TXN-ADJ-${Date.now().toString().slice(-6)}`,
              journalId: `JRN-MAN-${Date.now().toString().slice(-5)}`,
              time: new Date().toLocaleTimeString("en-GB", { hour12: false }),
              type: "Adjustment",
              rail: "Internal",
              debitAccount: debit,
              creditAccount: credit,
              userId: "SYSTEM",
              userName: "Admin adjustment",
              counterparty: "PayMo ledger",
              amount,
              fee: 0,
              currency: "KES",
              status: "Posted",
              ref: `ADJ${Date.now().toString().slice(-6)}`,
              narrative,
              county: "Nairobi",
              fraudScore: 0,
            };
            onCreate(e);
            push({ kind: "success", title: "Manual journal posted", body: `${e.id} · ${kes(amount)} · balanced.` });
            close();
          }}>
            <i className="bi bi-check2 me-1" />Post entry
          </button>
        )}
      </div>
    </Modal>
  );
}

/* ============================ 18. Transaction detail modal ============================ */
export function TxnDetailModal({ entry, onClose }: { entry: LedgerEntry | null; onClose: () => void }) {
  if (!entry) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-receipt" tone="blue" title="Transaction detail" subtitle={entry.id}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Type</span><span className="v"><Badge tone="blue">{entry.type}</Badge></span></div>
        <div className="pm-kv"><span className="k">Amount</span><span className="v pm-num" style={{ fontWeight: 700, color: entry.direction === "credit" ? "#12b76a" : "var(--pm-ink)" }}>{entry.direction === "credit" ? "+" : "-"}{kes(entry.amount)}</span></div>
        <div className="pm-kv"><span className="k">Rail</span><span className="v">{entry.rail}</span></div>
        <div className="pm-kv"><span className="k">Time</span><span className="v">{entry.time}</span></div>
        <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone={entry.status === "Posted" ? "green" : entry.status === "Held" ? "amber" : "red"}>{entry.status}</Badge></span></div>
        <div className="pm-kv"><span className="k">Counterparty</span><span className="v">{entry.counterparty}</span></div>
        <div className="pm-kv"><span className="k">Reference</span><span className="v mono">{entry.ref}</span></div>
        <div className="pm-kv"><span className="k">Narrative</span><span className="v">{entry.narrative}</span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 19. Journal detail modal ============================ */
export function JournalDetailModal({ entry, onClose }: { entry: LedgerEntry | null; onClose: () => void }) {
  if (!entry) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-journal-text" tone="blue" title="Journal detail" subtitle={entry.journalId}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Journal ID</span><span className="v mono">{entry.journalId}</span></div>
        <div className="pm-kv"><span className="k">Debit account</span><span className="v mono">{entry.debitAccount}</span></div>
        <div className="pm-kv"><span className="k">Credit account</span><span className="v mono">{entry.creditAccount}</span></div>
        <div className="pm-kv"><span className="k">Amount</span><span className="v pm-num" style={{ fontWeight: 700 }}>{kes(entry.amount)}</span></div>
        <div className="pm-kv"><span className="k">Fee</span><span className="v pm-num">{kes(entry.fee)}</span></div>
        <div className="pm-kv"><span className="k">User</span><span className="v">{entry.userName} ({entry.userId})</span></div>
        <div className="pm-kv"><span className="k">County</span><span className="v">{entry.county}</span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 20. Batch detail modal ============================ */
export function BatchDetailModal({ batch, onClose }: { batch: BatchJob | null; onClose: () => void }) {
  if (!batch) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-layers" tone="blue" title="Batch detail" subtitle={batch.id}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone={batch.status === "Completed" ? "green" : batch.status === "Running" ? "blue" : batch.status === "Failed" ? "red" : "amber"}>{batch.status}</Badge></span></div>
        <div className="pm-kv"><span className="k">Items</span><span className="v pm-num">{batch.items}</span></div>
        <div className="pm-kv"><span className="k">Amount</span><span className="v pm-num" style={{ fontWeight: 700 }}>{kes(batch.amount, { compact: true })}</span></div>
        <div className="pm-kv"><span className="k">Created</span><span className="v">{batch.created}</span></div>
        <div className="pm-kv"><span className="k">Creator</span><span className="v">{batch.creator}</span></div>
        <div className="pm-kv"><span className="k">Failed</span><span className="v pm-num" style={{ color: batch.failed > 0 ? "#f04438" : "#12b76a" }}>{batch.failed}</span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 21. Hold detail modal ============================ */
export function HoldDetailModal({ hold, onClose }: { hold: Hold | null; onClose: () => void }) {
  if (!hold) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-lock" tone="amber" title="Hold detail" subtitle={hold.id}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Amount</span><span className="v pm-num" style={{ fontWeight: 700 }}>{kes(hold.amount)}</span></div>
        <div className="pm-kv"><span className="k">Reason</span><span className="v">{hold.reason}</span></div>
        <div className="pm-kv"><span className="k">Placed</span><span className="v">{hold.placed}</span></div>
        <div className="pm-kv"><span className="k">Auto-release</span><span className="v">{hold.autoRelease}</span></div>
        <div className="pm-kv"><span className="k">Status</span><span className="v"><Badge tone="amber">{hold.status}</Badge></span></div>
      </div>
    </Drawer>
  );
}

/* ============================ 22. Account detail modal ============================ */
export function AccountDetailModal({ account, onClose }: { account: { id: string; name: string; type: string; balance: number } | null; onClose: () => void }) {
  if (!account) return null;
  const txns = [
    { id: "TXN-001", time: "24 Aug 14:28", amount: 15000, desc: "Transfer in" },
    { id: "TXN-002", time: "23 Aug 09:15", amount: -4200, desc: "Bill payment" },
    { id: "TXN-003", time: "22 Aug 16:05", amount: 50000, desc: "Deposit" },
  ];
  return (
    <Drawer open onClose={onClose} icon="bi-wallet2" tone="blue" title="Account detail" subtitle={account.name}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Account</span><span className="v mono">{account.id}</span></div>
        <div className="pm-kv"><span className="k">Type</span><span className="v"><Badge tone="blue">{account.type}</Badge></span></div>
        <div className="pm-kv"><span className="k">Balance</span><span className="v pm-num" style={{ fontWeight: 700 }}>{kes(account.balance)}</span></div>
      </div>
      <div className="pm-card"><div className="pm-card-head"><h6 className="pm-card-title">Recent activity</h6></div>
        <div className="p-2 d-flex flex-column gap-1">
          {txns.map((t) => (
            <div key={t.id} className="pm-card pm-card-pad d-flex align-items-center gap-3">
              <i className={`bi ${t.amount > 0 ? "bi-arrow-down-left" : "bi-arrow-up-right"}`} style={{ color: t.amount > 0 ? "#12b76a" : "#f04438" }} />
              <div className="flex-grow-1"><div style={{ fontWeight: 700, fontSize: ".82rem" }}>{t.desc}</div><div style={{ fontSize: ".7rem", color: "var(--pm-muted)" }}>{t.id} · {t.time}</div></div>
              <div style={{ fontWeight: 700, color: t.amount > 0 ? "#12b76a" : "var(--pm-ink)" }}>{t.amount > 0 ? "+" : ""}{kes(Math.abs(t.amount))}</div>
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  );
}

/* ============================ 23. Fraud score detail modal ============================ */
export function FraudScoreModal({ entry, onClose }: { entry: LedgerEntry | null; onClose: () => void }) {
  if (!entry) return null;
  const factors = [
    { label: "Amount anomaly", score: entry.fraudScore > 50 ? 72 : 25, detail: "vs user average" },
    { label: "Velocity check", score: entry.fraudScore > 50 ? 65 : 18, detail: "txns/hour" },
    { label: "Geographic risk", score: 15, detail: entry.county },
    { label: "Device trust", score: 22, detail: "Known device" },
    { label: "Counterparty risk", score: entry.fraudScore > 50 ? 58 : 12, detail: entry.counterparty },
  ];
  return (
    <Drawer open onClose={onClose} icon="bi-shield-exclamation" tone={entry.fraudScore > 70 ? "red" : entry.fraudScore > 40 ? "amber" : "green"}
      title="Fraud analysis" subtitle={`${entry.id} · score ${entry.fraudScore}/100`}>
      <div className="pm-card pm-card-pad mb-3 text-center">
        <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "2rem", color: entry.fraudScore > 70 ? "#f04438" : entry.fraudScore > 40 ? "#f79009" : "#12b76a" }}>{entry.fraudScore}</div>
        <div style={{ fontSize: ".76rem", color: "var(--pm-muted)" }}>Fraud score</div>
      </div>
      <div className="d-flex flex-column gap-2">
        {factors.map((f) => (
          <div key={f.label} className="pm-card pm-card-pad">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span style={{ fontWeight: 700, fontSize: ".82rem" }}>{f.label}</span>
              <span className="pm-num" style={{ fontWeight: 700, color: f.score > 50 ? "#f04438" : f.score > 30 ? "#f79009" : "#12b76a" }}>{f.score}</span>
            </div>
            <div style={{ height: 6, background: "#eaedf3", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${f.score}%`, height: "100%", background: f.score > 50 ? "#f04438" : f.score > 30 ? "#f79009" : "#12b76a", borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: ".7rem", color: "var(--pm-muted)", marginTop: 4 }}>{f.detail}</div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}

/* ============================ 24. Ledger analytics modal ============================ */
export function LedgerAnalyticsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const stats = [
    { label: "Total entries today", value: "12,847", color: "#2e90fa" },
    { label: "Volume today", value: "KES 2.4B", color: "#12b76a" },
    { label: "Failed entries", value: "23", color: "#f04438" },
    { label: "Avg processing time", value: "1.2s", color: "#7a5af8" },
    { label: "Held amount", value: "KES 4.2M", color: "#f79009" },
    { label: "Reconciliation rate", value: "99.8%", color: "#12b76a" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-graph-up" tone="blue" title="Ledger analytics" subtitle="Real-time performance metrics">
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

/* ============================ 25. Transaction search modal ============================ */
export function TxnSearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [query, setQuery] = useState("");
  return (
    <Modal open={open} onClose={onClose} tone="blue" icon="bi-search" size="md" title="Transaction search" subtitle="Search across all ledger entries">
      <div className="pm-modal-body">
        <label className="form-label">Search criteria</label>
        <input className="form-control mb-3" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Transaction ID, user, counterparty, amount..." />
        <label className="form-label">Filters</label>
        <div className="row g-2 mb-3">
          <div className="col-6"><label className="form-label">Type</label><select className="form-select"><option>All types</option>{["Transfer", "Payment", "Deposit", "Withdrawal", "Fee", "Refund"].map((t) => <option key={t}>{t}</option>)}</select></div>
          <div className="col-6"><label className="form-label">Status</label><select className="form-select"><option>All statuses</option>{["Posted", "Held", "Failed", "Reversed"].map((s) => <option key={s}>{s}</option>)}</select></div>
          <div className="col-6"><label className="form-label">Rail</label><select className="form-select"><option>All rails</option>{["M-Pesa", "Card", "Bank", "Internal"].map((r) => <option key={r}>{r}</option>)}</select></div>
          <div className="col-6"><label className="form-label">Amount range</label><input type="number" className="form-control" placeholder="Min amount" /></div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Search results ready" }); onClose(); }}>
          <i className="bi bi-search me-1" />Search
        </button>
      </div>
    </Modal>
  );
}

/* ============================ 26. Entry comparison modal ============================ */
export function EntryCompareModal({ entries, onClose }: { entries: LedgerEntry[]; onClose: () => void }) {
  if (entries.length < 2) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-arrow-left-right" tone="blue" title="Compare entries" subtitle="Side-by-side comparison">
      <div className="pm-card pm-table-wrap">
        <table className="pm-table">
          <thead><tr><th>Field</th><th>{entries[0].id}</th><th>{entries[1].id}</th></tr></thead>
          <tbody>
            {["type", "amount", "rail", "status", "time", "counterparty", "county", "fraudScore"].map((k) => (
              <tr key={k}><td className="pm-td-strong">{k}</td><td>{String(entries[0][k as keyof LedgerEntry])}</td><td>{String(entries[1][k as keyof LedgerEntry])}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </Drawer>
  );
}

/* ============================ 27. Reconciliation status modal ============================ */
export function ReconStatusModal({ open, onClose }: { open: boolean; onClose: () => void }) {
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

/* ============================ 28. Flag detail modal ============================ */
export function FlagDetailModal({ entry, onClose }: { entry: LedgerEntry | null; onClose: () => void }) {
  const { push } = useToast();
  if (!entry) return null;
  return (
    <Drawer open onClose={onClose} icon="bi-flag" tone="red" title="Flagged transaction" subtitle={entry.id}>
      <div className="pm-card pm-card-pad mb-3">
        <div className="pm-kv"><span className="k">Amount</span><span className="v pm-num" style={{ fontWeight: 700 }}>{kes(entry.amount)}</span></div>
        <div className="pm-kv"><span className="k">Fraud score</span><span className="v pm-num" style={{ color: entry.fraudScore > 70 ? "#f04438" : "#f79009" }}>{entry.fraudScore}/100</span></div>
        <div className="pm-kv"><span className="k">Counterparty</span><span className="v">{entry.counterparty}</span></div>
        <div className="pm-kv"><span className="k">SAR status</span><span className="v"><Badge tone="amber">Draft</Badge></span></div>
      </div>
      <div className="d-flex flex-column gap-2">
        <button className="pm-dd-item"><i className="bi bi-file-earmark-text" style={{ color: "#2e90fa" }} /><span className="flex-grow-1">View SAR draft</span></button>
        <button className="pm-dd-item"><i className="bi bi-person" style={{ color: "#667085" }} /><span className="flex-grow-1">Contact user</span></button>
        <button className="pm-dd-item danger"><i className="bi bi-x-octagon" style={{ color: "#d92d20" }} /><span className="flex-grow-1">Block user</span></button>
      </div>
    </Drawer>
  );
}

/* ============================ 29. Export detail modal ============================ */
export function ExportDetailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [format, setFormat] = useState("csv");
  const [include, setInclude] = useState({ transactions: true, journal: true, batches: true, holds: true });
  return (
    <Modal open={open} onClose={onClose} tone="blue" icon="bi-download" size="md" title="Export data" subtitle="Choose format and content">
      <div className="pm-modal-body">
        <label className="form-label">Format</label>
        <div className="d-flex gap-2 mb-3">
          {["csv", "json", "xlsx"].map((f) => <button key={f} className={`pm-chip ${format === f ? "active" : ""}`} onClick={() => setFormat(f)}>{f.toUpperCase()}</button>)}
        </div>
        <label className="form-label">Include</label>
        <div className="d-flex flex-column gap-2">
          {Object.entries({ transactions: "Transactions", journal: "Journal entries", batches: "Batch jobs", holds: "Holds" }).map(([k, l]) => (
            <label key={k} className={`pm-opt ${include[k as keyof typeof include] ? "active" : ""}`}>
              <input type="checkbox" className="form-check-input mt-0" checked={include[k as keyof typeof include]} onChange={(e) => setInclude({ ...include, [k]: e.target.checked })} />
              <span style={{ fontSize: ".84rem", fontWeight: 700 }}>{l}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => { push({ kind: "success", title: "Export ready" }); onClose(); }}>
          <i className="bi bi-download me-1" />Download
        </button>
      </div>
    </Modal>
  );
}

/* ============================ 30. Ledger insights modal ============================ */
export function LedgerInsightsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const insights = [
    { icon: "bi-graph-up", title: "Volume trending up", detail: "12% increase in daily volume vs last week", tone: "green" },
    { icon: "bi-exclamation-triangle", title: "Hold amount elevated", detail: "KES 4.2M held, 15% above normal", tone: "amber" },
    { icon: "bi-shield-check", title: "Fraud rate stable", detail: "0.02% fraud rate, within target", tone: "green" },
    { icon: "bi-clock-history", title: "Processing time improved", detail: "Avg 1.2s, down from 1.8s", tone: "green" },
  ];
  return (
    <Drawer open={open} onClose={onClose} icon="bi-lightbulb" tone="blue" title="Ledger insights" subtitle="AI-powered analysis">
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

void HOLDS;
void BATCHES;
void Avatar;
