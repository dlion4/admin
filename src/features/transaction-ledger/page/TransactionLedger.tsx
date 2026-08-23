import { useMemo, useState } from "react";
import { Avatar, Badge, DDItem, Dropdown, EmptyState, Meter, Pagination, useToast } from "../../../components/ui";
import { csvDownload, kes, num } from "../../../lib/format";
import type { BatchJob, HoldRecord, JournalAccount, LedgerEntry } from "../data/ledgerData";
import {
  BATCHES, HOLDS, JOURNAL_ACCOUNTS, LEDGER_AUDIT, LEDGER_ENTRIES, LEDGER_KPI, RAIL_BREAKDOWN,
} from "../data/ledgerData";
import {
  AccountModal, AccountsDrawer, BatchApproveModal, BatchDrawer, BulkLedgerModal, EMPTY_LEDGER_FILTERS,
  EntryDrawer, ExportModal, FilterDrawer, FlagModal, HoldModal, HoldsDrawer, JournalModal,
  ManualJournalWizard, NewBatchWizard, ReconModal, ReleaseHoldModal, ReverseWizard,
  type LedgerFilters,
} from "../modals/LedgerModals";

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

export function TransactionLedger({
  signal, onNavigate,
}: {
  signal: { action: string; n: number };
  onNavigate: (id: string) => void;
}) {
  const { push } = useToast();
  void signal;

  const [entries, setEntries] = useState<LedgerEntry[]>(LEDGER_ENTRIES);
  const [holds, setHolds] = useState<HoldRecord[]>(HOLDS);
  const [batches, setBatches] = useState<BatchJob[]>(BATCHES);

  const [filters, setFilters] = useState<LedgerFilters>(EMPTY_LEDGER_FILTERS);
  const [tab, setTab] = useState("All");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [sort, setSort] = useState<{ key: keyof LedgerEntry; dir: 1 | -1 }>({ key: "time", dir: -1 });

  const [entry, setEntry] = useState<LedgerEntry | null>(null);
  const [reverseEntry, setReverseEntry] = useState<LedgerEntry | null>(null);
  const [holdEntry, setHoldEntry] = useState<LedgerEntry | null>(null);
  const [releaseHold, setReleaseHold] = useState<HoldRecord | null>(null);
  const [journalEntry, setJournalEntry] = useState<LedgerEntry | null>(null);
  const [flagEntry, setFlagEntry] = useState<LedgerEntry | null>(null);
  const [batch, setBatch] = useState<BatchJob | null>(null);
  const [batchApprove, setBatchApprove] = useState<BatchJob | null>(null);
  const [account, setAccount] = useState<JournalAccount | null>(null);
  const [accountsOpen, setAccountsOpen] = useState(false);
  const [holdsOpen, setHoldsOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [newBatchOpen, setNewBatchOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [reconOpen, setReconOpen] = useState(false);

  const filtered = useMemo(() => {
    let rows = entries;
    if (tab !== "All") rows = rows.filter((e) => e.status === tab);
    if (filters.q) {
      const q = filters.q.toLowerCase();
      rows = rows.filter((e) =>
        (e.id + e.journalId + e.userName + e.userId + e.counterparty + e.ref + e.narrative).toLowerCase().includes(q)
      );
    }
    if (filters.status !== "all") rows = rows.filter((e) => e.status === filters.status);
    if (filters.type !== "all") rows = rows.filter((e) => e.type === filters.type);
    if (filters.rail !== "all") rows = rows.filter((e) => e.rail === filters.rail);
    if (filters.county !== "all") rows = rows.filter((e) => e.county === filters.county);
    if (filters.minAmount > 0) rows = rows.filter((e) => e.amount >= filters.minAmount);
    if (filters.maxAmount > 0) rows = rows.filter((e) => e.amount <= filters.maxAmount);
    if (filters.fraudMin > 0) rows = rows.filter((e) => e.fraudScore >= filters.fraudMin);
    return [...rows].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      return (typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv))) * sort.dir;
    });
  }, [entries, filters, tab, sort]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const activeFilterCount = Object.entries(filters).filter(([k, v]) =>
    k === "q" ? Boolean(v) : typeof v === "number" ? v > 0 : v !== "all"
  ).length;

  const tabs = ["All", "Posted", "Pending", "Held", "Reversed", "Failed", "Settling"];
  const sortBy = (key: keyof LedgerEntry) =>
    setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : -1 }));

  const updateEntry = (id: string, patch: Partial<LedgerEntry>) => {
    setEntries((list) => list.map((e) => (e.id === id ? { ...e, ...patch } : e)));
    setEntry((e) => (e?.id === id ? { ...e, ...patch } : e));
  };

  const activeHolds = holds.filter((h) => h.status === "Active");
  const heldValue = activeHolds.reduce((s, h) => s + h.amount, 0);

  return (
    <>
      {/* Header */}
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="pm-eyebrow">Transactions & finance · Page 9</span>
            <span className="pm-live"><span className="pm-dot green pm-pulse" />LEDGER LIVE</span>
          </div>
          <h2>Transaction Ledger</h2>
          <p>
            Immutable double-entry journal across every rail — search, reverse, hold, batch-process and export with full Super Admin controls.
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setFilterOpen(true)}>
            <i className="bi bi-funnel me-1" />Filters
            {activeFilterCount > 0 && <Badge tone="green">{activeFilterCount}</Badge>}
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setAccountsOpen(true)}>
            <i className="bi bi-journal-bookmark me-1" />Chart of accounts
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setHoldsOpen(true)}>
            <i className="bi bi-pause-circle me-1" />Holds ({activeHolds.length})
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setExportOpen(true)}>
            <i className="bi bi-download me-1" />Export
          </button>
          <Dropdown width={240} trigger={() => <button className="btn btn-outline-secondary btn-sm"><i className="bi bi-three-dots" /></button>}>
            {(close) => (
              <>
                <div className="pm-dd-head">Ledger tools</div>
                <DDItem icon="bi-plus-circle" label="Manual journal entry" hint="2FA" onClick={() => { close(); setManualOpen(true); }} />
                <DDItem icon="bi-layers" label="Create batch" onClick={() => { close(); setNewBatchOpen(true); }} />
                <DDItem icon="bi-arrow-repeat" label="Trigger reconciliation" hint="2FA" onClick={() => { close(); setReconOpen(true); }} />
                <DDItem icon="bi-broadcast-pin" label="Open Real-Time Monitor" onClick={() => { close(); onNavigate("monitor"); }} />
                <DDItem icon="bi-person-lines-fill" label="Open User Directory" onClick={() => { close(); onNavigate("user-directory"); }} />
              </>
            )}
          </Dropdown>
          <button className="btn btn-primary btn-sm" onClick={() => setNewBatchOpen(true)}>
            <i className="bi bi-layers me-1" />New batch
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="row g-2 mb-3">
        {LEDGER_KPI.map((s) => (
          <div className="col-6 col-md-3 col-xxl-3" key={s.label}>
            <div className="pm-stat">
              <div className="d-flex align-items-center gap-2">
                <span
                  className="pm-stat-ico"
                  style={{
                    background: s.tone === "green" ? "#e7f8ef" : s.tone === "red" ? "#fef2f2" : s.tone === "amber" ? "#fff5e6" : s.tone === "violet" ? "#f4f1ff" : "#eff8ff",
                    color: s.tone === "green" ? "#0b8f52" : s.tone === "red" ? "#d92d20" : s.tone === "amber" ? "#b54708" : s.tone === "violet" ? "#5925dc" : "#175cd3",
                  }}
                >
                  <i className={`bi ${s.icon}`} />
                </span>
                <span className="pm-stat-label">{s.label}</span>
              </div>
              <div className="pm-stat-value">{s.value}</div>
              <div className="pm-stat-foot">{s.note}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Rail mix + holds snapshot */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-xl-8">
          <div className="pm-card h-100">
            <div className="pm-card-head">
              <div>
                <h6 className="pm-card-title">Rail breakdown — last 24 hours</h6>
                <p className="pm-card-sub">Click a rail to filter the ledger</p>
              </div>
              <Badge tone="green">{num(RAIL_BREAKDOWN.reduce((s, r) => s + r.count, 0))} txns</Badge>
            </div>
            <div className="pm-card-pad">
              <div className="pm-bar-track mb-3" style={{ height: 28 }}>
                {RAIL_BREAKDOWN.map((r) => {
                  const total = RAIL_BREAKDOWN.reduce((s, x) => s + x.count, 0) || 1;
                  return (
                    <div
                      key={r.rail}
                      title={`${r.rail}: ${num(r.count)}`}
                      style={{ width: `${(r.count / total) * 100}%`, background: r.color, minWidth: 4 }}
                    />
                  );
                })}
              </div>
              <div className="row g-2">
                {RAIL_BREAKDOWN.map((r) => (
                  <div className="col-6 col-md-3" key={r.rail}>
                    <button
                      className="border-0 bg-transparent text-start w-100 p-2"
                      style={{ borderRadius: 10 }}
                      onClick={() => { setFilters({ ...filters, rail: r.rail }); setPage(1); }}
                    >
                      <span className="pm-legend-dot me-1" style={{ background: r.color }} />
                      <span style={{ fontWeight: 700, fontSize: ".78rem" }}>{r.rail}</span>
                      <div className="pm-td-sub">{num(r.count)} · {kes(r.volume, { compact: true })} · {r.success}%</div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-xl-4">
          <div className="pm-card h-100">
            <div className="pm-card-head">
              <div>
                <h6 className="pm-card-title">Holds & suspense</h6>
                <p className="pm-card-sub">Funds locked pending human decision</p>
              </div>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setHoldsOpen(true)}>
                View all
              </button>
            </div>
            <div className="pm-card-pad">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div>
                  <div className="pm-eyebrow">Active holds</div>
                  <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.4rem" }}>{activeHolds.length}</div>
                </div>
                <div className="text-end">
                  <div className="pm-eyebrow">Value locked</div>
                  <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.1rem", color: "#b54708" }}>
                    {kes(heldValue, { compact: true })}
                  </div>
                </div>
              </div>
              {activeHolds.slice(0, 4).map((h) => (
                <button
                  key={h.id}
                  className="pm-alert-row warn text-start w-100 mb-1"
                  onClick={() => setReleaseHold(h)}
                >
                  <div className="flex-grow-1">
                    <div style={{ fontWeight: 700, fontSize: ".8rem" }}>{h.userName}</div>
                    <div className="pm-td-sub mono">{h.txnId} · {h.reason}</div>
                  </div>
                  <span className="pm-num" style={{ fontWeight: 700 }}>{kes(h.amount, { compact: true })}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ledger table */}
      <div className="pm-section-head">
        <div>
          <h2>Ledger entries</h2>
          <p>40 representative postings — every row is a balanced journal with debit and credit legs.</p>
        </div>
        {selected.length > 0 && (
          <button className="btn btn-outline-primary btn-sm" onClick={() => setBulkOpen(true)}>
            <i className="bi bi-check2-square me-1" />Bulk action ({selected.length})
          </button>
        )}
      </div>

      <div className="pm-card mb-3">
        <div className="pm-tabs">
          {tabs.map((t) => (
            <button key={t} className={`pm-tab ${tab === t ? "active" : ""}`} onClick={() => { setTab(t); setPage(1); }}>
              {t}
              <span className="cnt">
                {t === "All" ? entries.length : entries.filter((e) => e.status === t).length}
              </span>
            </button>
          ))}
        </div>

        <div className="pm-card-head">
          <div className="pm-search flex-grow-1" style={{ maxWidth: 400 }}>
            <i className="bi bi-search" />
            <input
              placeholder="TXN, journal, name, ref, narrative…"
              value={filters.q}
              onChange={(e) => { setFilters({ ...filters, q: e.target.value }); setPage(1); }}
            />
          </div>
          <div className="d-flex gap-2 align-items-center">
            <span style={{ fontSize: ".75rem", color: "var(--pm-muted)" }}>{num(filtered.length)} entries</span>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setFilterOpen(true)}>
              <i className="bi bi-funnel" />
            </button>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setManualOpen(true)}>
              <i className="bi bi-pencil-square" />
            </button>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="d-flex gap-1 flex-wrap p-2 pb-0">
            {filters.status !== "all" && (
              <button className="pm-chip active" onClick={() => setFilters({ ...filters, status: "all" })}>{filters.status} ✕</button>
            )}
            {filters.type !== "all" && (
              <button className="pm-chip active" onClick={() => setFilters({ ...filters, type: "all" })}>{filters.type} ✕</button>
            )}
            {filters.rail !== "all" && (
              <button className="pm-chip active" onClick={() => setFilters({ ...filters, rail: "all" })}>{filters.rail} ✕</button>
            )}
            {filters.county !== "all" && (
              <button className="pm-chip active" onClick={() => setFilters({ ...filters, county: "all" })}>{filters.county} ✕</button>
            )}
            {filters.fraudMin > 0 && (
              <button className="pm-chip active" onClick={() => setFilters({ ...filters, fraudMin: 0 })}>Fraud ≥ {filters.fraudMin} ✕</button>
            )}
            <button className="pm-chip" onClick={() => { setFilters(EMPTY_LEDGER_FILTERS); setTab("All"); }}>Clear all</button>
          </div>
        )}

        {selected.length > 0 && (
          <div className="pm-bulkbar">
            <b style={{ fontSize: ".82rem" }}>{selected.length} selected</b>
            <button className="btn btn-sm btn-light" onClick={() => setBulkOpen(true)}>
              <i className="bi bi-lightning-charge me-1" />Bulk action
            </button>
            <button
              className="btn btn-sm btn-light"
              onClick={() => {
                csvDownload("selected-ledger.csv", entries.filter((e) => selected.includes(e.id)) as unknown as Record<string, unknown>[]);
                push({ kind: "success", title: "Selection exported" });
              }}
            >
              <i className="bi bi-download me-1" />Export
            </button>
            <button className="btn btn-sm btn-outline-light ms-auto" onClick={() => setSelected([])}>Clear</button>
          </div>
        )}

        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead>
              <tr>
                <th style={{ width: 34 }}>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={paged.length > 0 && selected.length === paged.length}
                    onChange={(e) => setSelected(e.target.checked ? paged.map((x) => x.id) : [])}
                  />
                </th>
                {([
                  ["time", "Time"],
                  ["id", "Transaction"],
                  ["type", "Type"],
                  ["userName", "Customer"],
                  ["rail", "Rail"],
                  ["amount", "Amount"],
                  ["status", "Status"],
                  ["fraudScore", "Risk"],
                ] as const).map(([k, l]) => (
                  <th
                    key={k}
                    className={`${k === "amount" || k === "fraudScore" ? "text-end " : ""}cursor-pointer`}
                    onClick={() => sortBy(k)}
                  >
                    {l} {sort.key === k && <i className={`bi bi-caret-${sort.dir === 1 ? "up" : "down"}-fill`} style={{ fontSize: ".55rem" }} />}
                  </th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {paged.map((e) => (
                <tr key={e.id} className={selected.includes(e.id) ? "selected" : ""} onClick={() => setEntry(e)}>
                  <td onClick={(ev) => ev.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selected.includes(e.id)}
                      onChange={(ev) => setSelected(ev.target.checked ? [...selected, e.id] : selected.filter((x) => x !== e.id))}
                    />
                  </td>
                  <td>
                    <span className="mono" style={{ fontSize: ".75rem", fontWeight: 600 }}>{e.time}</span>
                    <div className="pm-td-sub mono">{e.journalId}</div>
                  </td>
                  <td>
                    <span className="pm-td-strong mono">{e.id}</span>
                    <div className="pm-td-sub mono">{e.ref}</div>
                  </td>
                  <td><Badge tone={typeTone(e.type)}>{e.type}</Badge></td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <Avatar name={e.userName} size="sm" />
                      <div>
                        <div className="pm-td-strong" style={{ fontSize: ".78rem" }}>{e.userName}</div>
                        <div className="pm-td-sub mono">{e.userId} · {e.counterparty}</div>
                      </div>
                    </div>
                  </td>
                  <td><Badge tone={e.rail === "M-Pesa" ? "green" : e.rail.includes("Card") ? "blue" : "grey"}>{e.rail}</Badge></td>
                  <td className="text-end">
                    <span className="pm-num" style={{ fontWeight: 700 }}>
                      {e.currency === "KES" ? kes(e.amount) : `${e.currency} ${num(e.amount)}`}
                    </span>
                    {e.fee > 0 && <div className="pm-td-sub">fee {kes(e.fee)}</div>}
                  </td>
                  <td><Badge tone={statusTone(e.status)} dot>{e.status}</Badge></td>
                  <td className="text-end">
                    <div className="d-flex align-items-center gap-2 justify-content-end">
                      <Meter
                        value={e.fraudScore}
                        tone={e.fraudScore > 70 ? "#f04438" : e.fraudScore > 40 ? "#f79009" : "#12b76a"}
                        width={44}
                      />
                      <span className="pm-num">{e.fraudScore}</span>
                    </div>
                  </td>
                  <td className="text-end" onClick={(ev) => ev.stopPropagation()}>
                    <Dropdown up width={240} trigger={() => (
                      <button className="pm-icon-btn" style={{ width: 28, height: 28 }}>
                        <i className="bi bi-three-dots-vertical" />
                      </button>
                    )}>
                      {(close) => (
                        <>
                          <DDItem icon="bi-eye" label="Open entry detail" onClick={() => { close(); setEntry(e); }} />
                          <DDItem icon="bi-journal-text" label="View journal lines" onClick={() => { close(); setJournalEntry(e); }} />
                          <DDItem
                            icon="bi-arrow-counterclockwise"
                            label="Reverse transaction"
                            hint="2FA · Posted only"
                            disabled={e.status !== "Posted"}
                            onClick={() => { close(); setReverseEntry(e); }}
                          />
                          <DDItem
                            icon="bi-pause-circle"
                            label="Place hold"
                            disabled={e.status === "Held" || e.status === "Reversed"}
                            onClick={() => { close(); setHoldEntry(e); }}
                          />
                          <DDItem
                            icon="bi-play-circle"
                            label="Release hold"
                            disabled={e.status !== "Held"}
                            onClick={() => {
                              close();
                              const h = holds.find((x) => x.txnId === e.id && x.status === "Active");
                              if (h) setReleaseHold(h);
                              else {
                                updateEntry(e.id, { status: "Posted", holdReason: undefined });
                                push({ kind: "success", title: `${e.id} released` });
                              }
                            }}
                          />
                          <DDItem icon="bi-flag" label="Flag for SAR" danger onClick={() => { close(); setFlagEntry(e); }} />
                          <div className="pm-dd-sep" />
                          <DDItem icon="bi-person-badge" label="Open customer (Page 5)" onClick={() => { close(); onNavigate("user-detail"); }} />
                        </>
                      )}
                    </Dropdown>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={10}>
                    <EmptyState
                      icon="bi-journal-x"
                      title="No ledger entries match"
                      body="Widen filters or clear the status tab."
                      action={
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => { setFilters(EMPTY_LEDGER_FILTERS); setTab("All"); }}>
                          Clear filters
                        </button>
                      }
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageSize={pageSize} total={filtered.length} onPage={setPage} onPageSize={setPageSize} />
      </div>

      {/* Batches + chart of accounts snapshot + audit */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-xl-5">
          <div className="pm-section-head">
            <div>
              <h2>Batch jobs</h2>
              <p>Payroll, settlement and fee batches posting to the ledger.</p>
            </div>
            <button className="btn btn-sm btn-primary" onClick={() => setNewBatchOpen(true)}>
              <i className="bi bi-plus-lg me-1" />New
            </button>
          </div>
          <div className="pm-card">
            <div className="p-2 d-flex flex-column gap-2" style={{ maxHeight: 420, overflowY: "auto" }}>
              {batches.map((b) => {
                const pct = b.total ? Math.round((b.processed / b.total) * 100) : 0;
                return (
                  <button key={b.id} className="pm-alert-row info text-start w-100" onClick={() => setBatch(b)}>
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span style={{ fontWeight: 700, fontSize: ".84rem" }}>{b.name}</span>
                        <Badge tone={statusTone(b.status)} dot>{b.status}</Badge>
                      </div>
                      <div className="pm-td-sub mono">{b.id} · {b.type} · {b.owner}</div>
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <Meter value={pct} tone={b.status === "Failed" ? "#f04438" : "#12b76a"} width={160} />
                        <span className="pm-num" style={{ fontSize: ".72rem" }}>{pct}%</span>
                        <span className="pm-td-sub ms-auto">{kes(b.amount, { compact: true })}</span>
                      </div>
                    </div>
                    <i className="bi bi-chevron-right" style={{ color: "#c3cbd9" }} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-3">
          <div className="pm-section-head">
            <div>
              <h2>Chart of accounts</h2>
              <p>Top balances</p>
            </div>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setAccountsOpen(true)}>
              <i className="bi bi-box-arrow-up-right" />
            </button>
          </div>
          <div className="pm-card">
            <div className="p-2 d-flex flex-column gap-1" style={{ maxHeight: 420, overflowY: "auto" }}>
              {JOURNAL_ACCOUNTS.slice(0, 8).map((a) => (
                <button key={a.code} className="pm-dd-item" onClick={() => setAccount(a)}>
                  <span className="mono" style={{ fontWeight: 700, width: 40 }}>{a.code}</span>
                  <span className="flex-grow-1" style={{ fontSize: ".78rem" }}>{a.name}</span>
                  <span className="pm-num" style={{ fontWeight: 700, fontSize: ".74rem" }}>{kes(a.balance, { compact: true })}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="pm-section-head">
            <div>
              <h2>Ledger audit</h2>
              <p>Reversals, holds and batch approvals.</p>
            </div>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                csvDownload("ledger-audit.csv", LEDGER_AUDIT as unknown as Record<string, unknown>[]);
                push({ kind: "success", title: "Audit exported" });
              }}
            >
              <i className="bi bi-download" />
            </button>
          </div>
          <div className="pm-card">
            <div className="p-2 d-flex flex-column gap-2" style={{ maxHeight: 420, overflowY: "auto" }}>
              {LEDGER_AUDIT.map((a) => (
                <div key={a.id} className="pm-alert-row info">
                  <Avatar name={a.admin} size="sm" />
                  <div className="flex-grow-1">
                    <div style={{ fontWeight: 700, fontSize: ".8rem" }}>{a.action}</div>
                    <div className="pm-td-sub">{a.detail}</div>
                    <div className="d-flex gap-2 mt-1">
                      <span className="mono" style={{ fontSize: ".68rem", color: "var(--pm-muted)" }}>{a.target}</span>
                      <span style={{ fontSize: ".68rem", color: "var(--pm-muted)" }}>{a.time} · {a.admin}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals & drawers */}
      <EntryDrawer
        entry={entry}
        onClose={() => setEntry(null)}
        onReverse={(e) => { setEntry(null); setReverseEntry(e); }}
        onHold={(e) => { setEntry(null); setHoldEntry(e); }}
        onRelease={(e) => {
          setEntry(null);
          const h = holds.find((x) => x.txnId === e.id && x.status === "Active");
          if (h) setReleaseHold(h);
          else {
            updateEntry(e.id, { status: "Posted", holdReason: undefined });
            push({ kind: "success", title: `${e.id} released` });
          }
        }}
        onJournal={(e) => { setEntry(null); setJournalEntry(e); }}
        onFlag={(e) => { setEntry(null); setFlagEntry(e); }}
      />
      <ReverseWizard
        entry={reverseEntry}
        onClose={() => setReverseEntry(null)}
        onDone={(e) => {
          updateEntry(e.id, { status: "Reversed", reversedBy: `REV-${Date.now().toString().slice(-5)}` });
          setReverseEntry(null);
        }}
      />
      <HoldModal
        entry={holdEntry}
        onClose={() => setHoldEntry(null)}
        onDone={(e, reason) => {
          updateEntry(e.id, { status: "Held", holdReason: reason });
          setHolds((list) => [{
            id: `HLD-${4413 + list.length}`,
            txnId: e.id,
            userName: e.userName,
            amount: e.amount,
            reason,
            heldBy: "Joseph Mwangi",
            heldAt: "Just now",
            expiresAt: "In 4 hours",
            status: "Active",
          }, ...list]);
          setHoldEntry(null);
        }}
      />
      <ReleaseHoldModal
        hold={releaseHold}
        onClose={() => setReleaseHold(null)}
        onDone={(h) => {
          setHolds((list) => list.map((x) => (x.id === h.id ? { ...x, status: "Released" } : x)));
          updateEntry(h.txnId, { status: "Posted", holdReason: undefined });
          setReleaseHold(null);
        }}
      />
      <JournalModal entry={journalEntry} onClose={() => setJournalEntry(null)} />
      <FlagModal
        entry={flagEntry}
        onClose={() => setFlagEntry(null)}
        onDone={(e) => {
          updateEntry(e.id, { status: e.status === "Posted" ? "Held" : e.status, holdReason: "Flagged for SAR" });
          setFlagEntry(null);
        }}
      />
      <BatchDrawer
        batch={batch}
        onClose={() => setBatch(null)}
        onPause={(b) => {
          setBatches((list) => list.map((x) => (x.id === b.id ? { ...x, status: "Paused" } : x)));
          push({ kind: "info", title: `${b.id} paused` });
          setBatch(null);
        }}
        onRetry={(b) => {
          setBatches((list) => list.map((x) => (x.id === b.id ? { ...x, status: "Running", failed: 0 } : x)));
          push({ kind: "success", title: `${b.id} retrying failed items` });
          setBatch(null);
        }}
        onApprove={(b) => { setBatch(null); setBatchApprove(b); }}
      />
      <BatchApproveModal
        batch={batchApprove}
        onClose={() => setBatchApprove(null)}
        onDone={(b) => {
          setBatches((list) => list.map((x) => (x.id === b.id ? { ...x, status: "Running", started: "Just now" } : x)));
          setBatchApprove(null);
        }}
      />
      <NewBatchWizard open={newBatchOpen} onClose={() => setNewBatchOpen(false)} onCreate={(b) => setBatches((list) => [b, ...list])} />
      <AccountsDrawer open={accountsOpen} onClose={() => setAccountsOpen(false)} onSelect={(a) => { setAccountsOpen(false); setAccount(a); }} />
      <AccountModal account={account} onClose={() => setAccount(null)} />
      <HoldsDrawer
        open={holdsOpen}
        onClose={() => setHoldsOpen(false)}
        holds={holds}
        onRelease={(h) => { setHoldsOpen(false); setReleaseHold(h); }}
      />
      <FilterDrawer
        open={filterOpen}
        filters={filters}
        onClose={() => setFilterOpen(false)}
        onApply={(f) => { setFilters(f); setPage(1); }}
      />
      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} rows={filtered} />
      <BulkLedgerModal
        open={bulkOpen}
        count={selected.length}
        onClose={() => setBulkOpen(false)}
        onDone={(action) => {
          if (action === "hold") {
            setEntries((list) => list.map((e) => selected.includes(e.id) && e.status === "Posted" ? { ...e, status: "Held", holdReason: "Bulk hold" } : e));
          } else if (action === "release") {
            setEntries((list) => list.map((e) => selected.includes(e.id) && e.status === "Held" ? { ...e, status: "Posted", holdReason: undefined } : e));
          } else if (action === "reverse") {
            setEntries((list) => list.map((e) => selected.includes(e.id) && e.status === "Posted" ? { ...e, status: "Reversed", reversedBy: `REV-BULK` } : e));
          } else if (action === "export") {
            csvDownload("bulk-ledger.csv", entries.filter((e) => selected.includes(e.id)) as unknown as Record<string, unknown>[]);
          }
          push({ kind: "success", title: `${action} applied to ${selected.length} entries` });
          setSelected([]);
        }}
      />
      <ManualJournalWizard
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        onCreate={(e) => setEntries((list) => [e, ...list])}
      />
      <ReconModal open={reconOpen} onClose={() => setReconOpen(false)} />
    </>
  );
}
