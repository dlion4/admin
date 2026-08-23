import { useEffect, useState } from "react";
import { Badge, DDItem, Dropdown, Meter, Pagination, useToast } from "../../../components/ui";
import { csvDownload, kes } from "../../../lib/format";
import type { CalEvent, Correspondence, Remittance, TaxAudit, TaxConfig, TaxPool, TaxReport, UserTax } from "../data/taxData";
import {
  CALENDAR, CORRESPONDENCE, REMITTANCE, REPORTS, TAX_AUDIT, TAX_CONFIG, TAX_KPI, TAX_POOLS, USER_TAX,
} from "../data/taxData";
import {
  CalendarDrawer, CalendarEventModal, CorrespondenceDetailModal, CorrespondenceDrawer, FileReportWizard,
  LiabilityModal, PoolsDrawer, PoolDetailModal, RemitWizard, RemittanceDetailModal, RemittanceDrawer,
  ReportDetailModal, ReportsDrawer, RespondModal, TaxAuditDrawer, TaxConfigDrawer, TaxExportModal,
  TaxPermissionsModal, TaxRateModal, TaxTypeDetailModal, UserTaxDetailModal, UserTaxDrawer, taxTone,
} from "../modals/TaxModals";

export function TaxCompliance({
  signal, onNavigate,
}: {
  signal: { action: string; n: number };
  onNavigate: (id: string) => void;
}) {
  const { push } = useToast();

  /* ---------------- live state ---------------- */
  const [config, setConfig] = useState<TaxConfig[]>(TAX_CONFIG);
  const [pools, setPools] = useState<TaxPool[]>(TAX_POOLS);
  const [reports, setReports] = useState<TaxReport[]>(REPORTS);
  const [users] = useState<UserTax[]>(USER_TAX);
  const [remittance, setRemittance] = useState<Remittance[]>(REMITTANCE);
  const [corr, setCorr] = useState<Correspondence[]>(CORRESPONDENCE);
  const [calendar, setCalendar] = useState<CalEvent[]>(CALENDAR);
  const [audit, setAudit] = useState<TaxAudit[]>(TAX_AUDIT);

  const logAudit = (change: string, from: string, to: string, reason: string) =>
    setAudit((a) => [{ id: `TAXAUD-${113 + a.length - TAX_AUDIT.length}`, date: "Aug 23", admin: "Joseph Mwangi", change, from, to, reason }, ...a]);

  /* ---------------- user table state ---------------- */
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const pageRows = users.slice((page - 1) * pageSize, page * pageSize);

  /* ---------------- modal state ---------------- */
  const [configDrawer, setConfigDrawer] = useState(false);
  const [editTax, setEditTax] = useState<TaxConfig | null>(null);
  const [taxDetail, setTaxDetail] = useState<TaxConfig | null>(null);
  const [poolsDrawer, setPoolsDrawer] = useState(false);
  const [poolDetail, setPoolDetail] = useState<TaxPool | null>(null);
  const [remitPool, setRemitPool] = useState<TaxPool | null>(null);
  const [remittanceDrawer, setRemittanceDrawer] = useState(false);
  const [remDetail, setRemDetail] = useState<Remittance | null>(null);
  const [reportsDrawer, setReportsDrawer] = useState(false);
  const [reportDetail, setReportDetail] = useState<TaxReport | null>(null);
  const [fileWizard, setFileWizard] = useState(false);
  const [filePreset, setFilePreset] = useState<TaxReport | null>(null);
  const [usersDrawer, setUsersDrawer] = useState(false);
  const [userDetail, setUserDetail] = useState<UserTax | null>(null);
  const [corrDrawer, setCorrDrawer] = useState(false);
  const [corrDetail, setCorrDetail] = useState<Correspondence | null>(null);
  const [respondRow, setRespondRow] = useState<Correspondence | null>(null);
  const [calendarDrawer, setCalendarDrawer] = useState(false);
  const [calDetail, setCalDetail] = useState<CalEvent | null>(null);
  const [auditDrawer, setAuditDrawer] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [liabilityOpen, setLiabilityOpen] = useState(false);

  /* ---------------- shell signal bridge ---------------- */
  useEffect(() => {
    if (!signal.n) return;
    if (signal.action === "file") setFileWizard(true);
  }, [signal]);

  /* ---------------- mutations ---------------- */
  const doTaxChange = (t: TaxConfig, rate: string, ratePct: number, appliesTo: string) => {
    setConfig((cs) => cs.map((x) => (x.id === t.id ? { ...x, rate, ratePct, appliesTo } : x)));
    logAudit(`${t.type} ${rate === t.rate ? "base" : "rate"}`, `${t.rate} / ${t.appliesTo}`, `${rate} / ${appliesTo}`, "Statutory configuration change");
  };

  const doRemit = (p: TaxPool, amount: number) => {
    setPools((ps) => ps.map((x) => (x.id === p.id ? { ...x, held: x.held - amount, remitted30d: x.remitted30d + amount } : x)));
    setRemittance((rs) => [{
      id: `REM-${413 + rs.length - REMITTANCE.length}`, date: "Aug 23", taxType: p.name.replace(" Pool", ""),
      amount, reference: `KRA-${p.id.replace("POOL-", "")}-0823`, method: "iTAX (EFT)", status: "Acknowledged",
    }, ...rs]);
    logAudit(`${p.name} remittance`, kes(p.held, { compact: true }), kes(p.held - amount, { compact: true }), "Statutory remittance");
  };

  const doFile = (r: TaxReport, remitFlag: number) => {
    setReports((rs) => rs.map((x) => (x.id === r.id ? { ...x, status: "Filed" as const, lastFiled: "Aug 23" } : x)));
    logAudit(`${r.report} filed`, r.status, "Filed", `Submitted via ${r.method}`);
    if (remitFlag) {
      const pool = pools.find((p) => r.report.toLowerCase().includes(p.name.replace(" Pool", "").toLowerCase()) && p.held > 0);
      if (pool) doRemit(pool, pool.held);
    }
  };

  const doRespond = (c: Correspondence, note: string) => {
    setCorr((cs) => cs.map((x) => (x.id === c.id ? { ...x, status: "Response sent" as const, detail: `${x.detail} — Response logged: ${note.slice(0, 80)}` } : x)));
    logAudit(`${c.from} ${c.id} response`, c.status, "Response sent", note.slice(0, 60));
  };

  const doStartPrep = (e: CalEvent) => {
    setCalendar((cs) => cs.map((x) => (x.id === e.id ? { ...x, prepStarted: true } : x)));
    push({ kind: "success", title: `Prep started — ${e.event}`, body: `${e.owner} paged · due ${e.date}.` });
  };

  const pendingReports = reports.filter((r) => r.status === "Pending").length;
  const openCorr = corr.filter((c) => c.status === "In progress").length;
  const kpi = TAX_KPI({ pendingReports, openCorr, nextDue: "Aug 31" });
  const heldTotal = pools.reduce((s, p) => s + p.held, 0);
  const collectedTotal = pools.reduce((s, p) => s + p.collected30d, 0);
  const nextEvents = calendar.slice(0, 4);

  return (
    <>
      {/* ============================== Header ============================== */}
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="pm-eyebrow">Tax & compliance · Page 14</span>
            <span className="pm-live"><span className="pm-dot green pm-pulse" />KRA · CBK · FRA · ODPC</span>
          </div>
          <h2>Tax & Compliance Reporting</h2>
          <p>
            Withholding at source across six tax pools, statutory filings on the KRA/CBK/FRA calendars, regulator
            correspondence and per-user tax certificates — every rate change locked to its legal instrument and board-visible.
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setLiabilityOpen(true)}>
            <i className="bi bi-calculator me-1" />Calculator
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setCalendarDrawer(true)}>
            <i className="bi bi-calendar-week me-1" />Calendar
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setRemittanceDrawer(true)}>
            <i className="bi bi-clock-history me-1" />Remittances
          </button>
          <button className="btn btn-outline-secondary btn-sm position-relative" onClick={() => setCorrDrawer(true)}>
            <i className="bi bi-envelope-paper me-1" />Correspondence
            {openCorr > 0 && <span className="pm-nav-pill" style={{ position: "absolute", top: -6, right: -6 }}>{openCorr}</span>}
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setAuditDrawer(true)}>
            <i className="bi bi-journal-check me-1" />Audit
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setExportOpen(true)}>
            <i className="bi bi-download me-1" />Export
          </button>
          <Dropdown width={260} trigger={() => <button className="btn btn-outline-secondary btn-sm"><i className="bi bi-three-dots" /></button>}>
            {(close) => (
              <>
                <div className="pm-dd-head">Compliance desk</div>
                <DDItem icon="bi-person-lock" label="Permissions matrix" hint="Who can change rates & file" onClick={() => { close(); setPermissionsOpen(true); }} />
                <DDItem icon="bi-person-lines-fill" label="User tax summaries" hint={`${users.length} taxpayers · certificates`} onClick={() => { close(); setUsersDrawer(true); }} />
                <DDItem icon="bi-receipt-cutoff" label="Tax configuration" hint={`${config.length} types · legal bases`} onClick={() => { close(); setConfigDrawer(true); }} />
                <DDItem icon="bi-wallet2" label="Pool balances" hint={`${kes(heldTotal, { compact: true })} held`} onClick={() => { close(); setPoolsDrawer(true); }} />
                <div className="pm-dd-sep" />
                <DDItem icon="bi-journal-text" label="Open Transaction Ledger" hint="Page 9 · tax-tagged postings" onClick={() => { close(); onNavigate("ledger"); }} />
                <DDItem icon="bi-percent" label="Open Fee Management" hint="Page 10 · fee bases" onClick={() => { close(); onNavigate("fees"); }} />
                <DDItem icon="bi-droplet-half" label="Open Liquidity & Pools" hint="Page 12 · Tax Withholding pool" onClick={() => { close(); onNavigate("liquidity"); }} />
              </>
            )}
          </Dropdown>
          <button className="btn btn-primary btn-sm" onClick={() => { setFilePreset(null); setFileWizard(true); }}>
            <i className="bi bi-file-earmark-arrow-up me-1" />File return
          </button>
        </div>
      </div>

      {/* ============================== KPI strip ============================== */}
      <div className="row g-2 mb-3">
        {kpi.map((s) => (
          <div className="col-6 col-md-3 col-xxl-3" key={s.label}>
            <div className="pm-stat">
              <div className="d-flex align-items-center gap-2">
                <span className="pm-stat-ico" style={{
                  background: s.tone === "green" ? "#e7f8ef" : s.tone === "red" ? "#fef2f2" : s.tone === "amber" ? "#fff5e6" : s.tone === "violet" ? "#f4f1ff" : "#eff8ff",
                  color: s.tone === "green" ? "#0b8f52" : s.tone === "red" ? "#d92d20" : s.tone === "amber" ? "#b54708" : s.tone === "violet" ? "#5925dc" : "#175cd3",
                }}>
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

      {/* ============================== Tax configuration ============================== */}
      <div className="pm-section-head">
        <div>
          <span className="pm-eyebrow">Rates & bases · statutory lock</span>
          <h3 className="mb-0">Tax configuration</h3>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setLiabilityOpen(true)}>
            <i className="bi bi-calculator me-1" />Liability calculator
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setConfigDrawer(true)}>
            <i className="bi bi-sliders me-1" />Open console
          </button>
        </div>
      </div>
      <div className="pm-card mb-3">
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>Tax type</th><th>Rate</th><th>Applies to</th><th>Collection</th><th>Legal basis</th><th>Status</th><th /></tr></thead>
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
                  <td><Badge tone={t.active ? "green" : "grey"} dot>{t.active ? "Active" : "Inactive"}</Badge></td>
                  <td className="text-end text-nowrap">
                    <button className="btn btn-sm btn-outline-secondary me-1" style={{ fontSize: ".66rem" }} onClick={() => setTaxDetail(t)}><i className="bi bi-eye" /></button>
                    <button className="btn btn-sm btn-outline-primary" style={{ fontSize: ".68rem" }} onClick={() => setEditTax(t)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================== Pools + filings due ============================== */}
      <div className="row g-2 mb-3">
        <div className="col-12 col-xl-7">
          <div className="pm-card pm-card-pad h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div>
                <span className="pm-eyebrow">Withheld at source · remitted via iTAX EFT</span>
                <h3 className="h6 mb-0" style={{ fontFamily: "Sora" }}>Tax pool balances</h3>
              </div>
              <div className="d-flex gap-1">
                <span className="pm-note mb-0">{kes(collectedTotal, { compact: true })} / 30d</span>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setPoolsDrawer(true)}>Manage</button>
              </div>
            </div>
            {pools.map((p) => {
              const progress = p.collected30d > 0 ? Math.round((p.remitted30d / p.collected30d) * 100) : 100;
              return (
                <button key={p.id} className="pm-alert-row w-100 text-start mb-2" style={{ border: "1px solid var(--pm-border)", borderLeftColor: p.onTrack ? "#12b76a" : "#f04438" }} onClick={() => setPoolDetail(p)}>
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span style={{ fontWeight: 700, fontSize: ".78rem" }}>{p.name}</span>
                      <Badge tone={p.onTrack ? "green" : "red"} dot>{p.onTrack ? "On track" : "Shortfall"}</Badge>
                    </div>
                    <div style={{ minWidth: 130 }}>
                      <Meter value={progress} tone="#12b76a" width={999} />
                      <div className="pm-td-sub mono">{kes(p.remitted30d, { compact: true })} of {kes(p.collected30d, { compact: true })} remitted · next {p.nextRemittance}</div>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="pm-num" style={{ fontWeight: 800, fontSize: ".8rem" }}>{kes(p.held, { compact: true })}</div>
                    <div className="pm-td-sub">held</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <div className="col-12 col-xl-5">
          <div className="pm-card pm-card-pad h-100 d-flex flex-column">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div>
                <span className="pm-eyebrow">Statutory obligations</span>
                <h3 className="h6 mb-0" style={{ fontFamily: "Sora" }}>Filings due</h3>
              </div>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setReportsDrawer(true)}>All ({reports.length})</button>
            </div>
            {reports.filter((r) => r.status === "Pending").map((r) => (
              <div key={r.id} className="pm-alert-row mb-2" style={{ border: "1px solid var(--pm-border)", borderLeftColor: "#f79009" }}>
                <div className="flex-grow-1" style={{ minWidth: 0, cursor: "pointer" }} onClick={() => setReportDetail(r)}>
                  <div style={{ fontWeight: 700, fontSize: ".78rem" }}>{r.report}</div>
                  <div className="pm-td-sub">{r.authority} · due {r.due} · {r.owner}</div>
                </div>
                <button className="btn btn-sm btn-outline-primary" style={{ fontSize: ".66rem" }} onClick={() => { setFilePreset(r); setFileWizard(true); }}>File</button>
              </div>
            ))}
            <div className="pm-td-sub mb-2">{reports.filter((r) => r.status === "Filed").length} filed this cycle · {reports.filter((r) => r.status === "Future").length} scheduled beyond Q3</div>
            <div className="mt-auto d-flex gap-2">
              <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => setRemittanceDrawer(true)}>Remittance history</button>
              <button className="btn btn-primary btn-sm flex-grow-1" onClick={() => { setFilePreset(null); setFileWizard(true); }}>File a return</button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================== User tax summary ============================== */}
      <div className="pm-section-head">
        <div>
          <span className="pm-eyebrow">Per-taxpayer · certificates</span>
          <h3 className="mb-0">User tax summary</h3>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => csvDownload("user-tax-summary.csv", users as unknown as Record<string, unknown>[])}>
            <i className="bi bi-download me-1" />Export
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setUsersDrawer(true)}>
            <i className="bi bi-search me-1" />Search all ({users.length})
          </button>
        </div>
      </div>
      <div className="pm-card mb-3">
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>User</th><th className="text-end">Gross fees</th><th className="text-end">VAT</th><th className="text-end">Excise</th><th className="text-end">WHT</th><th className="text-end">Net deducted</th><th>Certificate</th></tr></thead>
            <tbody>
              {pageRows.map((u) => (
                <tr key={u.userId} style={{ cursor: "pointer" }} onClick={() => setUserDetail(u)}>
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
        <div className="p-2 d-flex align-items-center justify-content-between">
          <span className="pm-td-sub">{users.length} taxpayers · page {page} of {Math.max(1, Math.ceil(users.length / pageSize))}</span>
          <Pagination page={page} pageSize={pageSize} total={users.length} onPage={setPage} onPageSize={() => setPage(1)} />
        </div>
      </div>

      {/* ============================== Correspondence + calendar + audit ============================== */}
      <div className="row g-2 mb-3">
        <div className="col-12 col-xl-4">
          <div className="pm-card pm-card-pad h-100 d-flex flex-column">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div>
                <span className="pm-eyebrow">Regulator inbox</span>
                <h3 className="h6 mb-0" style={{ fontFamily: "Sora" }}>Correspondence</h3>
              </div>
              <Badge tone="amber" dot>{openCorr} open</Badge>
            </div>
            {corr.slice(0, 4).map((c) => (
              <button key={c.id} className="pm-alert-row w-100 text-start mb-2" style={{ border: "1px solid var(--pm-border)", borderLeftColor: c.status === "In progress" ? "#f79009" : "#12b76a" }} onClick={() => setCorrDetail(c)}>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <Badge tone={c.type === "Warning" ? "red" : c.type === "Inquiry" ? "amber" : "blue"}>{c.type}</Badge>
                    <Badge tone={taxTone(c.status)} dot>{c.status}</Badge>
                  </div>
                  <div style={{ fontSize: ".76rem", fontWeight: 600 }}>{c.subject}</div>
                  <div className="pm-td-sub">{c.from} · respond by {c.dueResponse}</div>
                </div>
              </button>
            ))}
            <div className="mt-auto pt-2">
              <button className="btn btn-sm btn-outline-secondary w-100" onClick={() => setCorrDrawer(true)}>Open tracker ({corr.length})</button>
            </div>
          </div>
        </div>
        <div className="col-12 col-xl-4">
          <div className="pm-card pm-card-pad h-100 d-flex flex-column">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div>
                <span className="pm-eyebrow">Next obligations</span>
                <h3 className="h6 mb-0" style={{ fontFamily: "Sora" }}>Compliance calendar</h3>
              </div>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setCalendarDrawer(true)}>All</button>
            </div>
            {nextEvents.map((e) => (
              <div key={e.id} className="pm-kv">
                <span className="k" style={{ fontSize: ".74rem" }}>
                  <span className="mono" style={{ fontWeight: 800 }}>{e.date}</span> {e.event}
                  <div className="pm-td-sub mono">{e.authority} · {e.owner} · prep {e.prepStarted ? "started" : "not started"}</div>
                </span>
                <span className="v"><Badge tone={e.category === "Tax" ? "violet" : e.category === "AML" ? "amber" : "blue"}>{e.category}</Badge></span>
              </div>
            ))}
            <div className="mt-auto pt-2">
              <button className="btn btn-sm btn-outline-secondary w-100" onClick={() => setCalendarDrawer(true)}>Open calendar ({calendar.length})</button>
            </div>
          </div>
        </div>
        <div className="col-12 col-xl-4">
          <div className="pm-card pm-card-pad h-100 d-flex flex-column">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div>
                <span className="pm-eyebrow">Governance</span>
                <h3 className="h6 mb-0" style={{ fontFamily: "Sora" }}>Config audit trail</h3>
              </div>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setAuditDrawer(true)}>All</button>
            </div>
            {audit.slice(0, 5).map((a) => (
              <div className="pm-kv" key={a.id}>
                <span className="k" style={{ fontSize: ".74rem" }}>{a.change}<div className="pm-td-sub mono">{a.date} · {a.admin}</div></span>
                <span className="v mono" style={{ fontSize: ".72rem" }}>{a.from === a.to ? a.from : `${a.from} → ${a.to}`}</span>
              </div>
            ))}
            <div className="mt-auto pt-2 d-flex gap-2">
              <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => setPermissionsOpen(true)}>
                <i className="bi bi-person-lock me-1" />Permissions
              </button>
              <button className="btn btn-outline-primary btn-sm flex-grow-1" onClick={() => setLiabilityOpen(true)}>
                <i className="bi bi-calculator me-1" />Calculator
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================== Modals & drawers ============================== */}
      <TaxConfigDrawer
        open={configDrawer} config={config} onClose={() => setConfigDrawer(false)}
        onEdit={(t) => { setConfigDrawer(false); setEditTax(t); }}
        onOpen={setTaxDetail}
      />
      <TaxRateModal tax={editTax} onClose={() => setEditTax(null)} onDone={doTaxChange} />
      <TaxTypeDetailModal
        tax={taxDetail} pools={pools} remittance={remittance} onClose={() => setTaxDetail(null)}
        onPool={(p) => { setTaxDetail(null); setPoolDetail(p); }}
      />
      <PoolsDrawer
        open={poolsDrawer} pools={pools} onClose={() => setPoolsDrawer(false)}
        onOpen={setPoolDetail}
        onRemit={(p) => { setPoolsDrawer(false); setRemitPool(p); }}
      />
      <PoolDetailModal pool={poolDetail} onClose={() => setPoolDetail(null)} />
      {remitPool && (
        <RemitWizard
          open pool={pools.find((p) => p.id === remitPool.id) ?? remitPool}
          onClose={() => setRemitPool(null)}
          onDone={doRemit}
        />
      )}
      <RemittanceDrawer
        open={remittanceDrawer} remittance={remittance} onClose={() => setRemittanceDrawer(false)}
        onOpen={(r) => { setRemittanceDrawer(false); setRemDetail(r); }}
      />
      <RemittanceDetailModal rem={remDetail} onClose={() => setRemDetail(null)} />
      <ReportsDrawer
        open={reportsDrawer} reports={reports} onClose={() => setReportsDrawer(false)}
        onOpen={setReportDetail}
        onFile={(r) => { setReportsDrawer(false); setFilePreset(r); setFileWizard(true); }}
      />
      <ReportDetailModal report={reportDetail} onClose={() => setReportDetail(null)} />
      {fileWizard && (
        <FileReportWizard
          open reports={reports} preselect={filePreset}
          onClose={() => { setFileWizard(false); setFilePreset(null); }}
          onDone={doFile}
        />
      )}
      <UserTaxDrawer
        open={usersDrawer} users={users} onClose={() => setUsersDrawer(false)}
        onOpen={(u) => { setUsersDrawer(false); setUserDetail(u); }}
      />
      <UserTaxDetailModal user={userDetail} onClose={() => setUserDetail(null)} />
      <CorrespondenceDrawer
        open={corrDrawer} rows={corr} onClose={() => setCorrDrawer(false)}
        onOpen={(c) => { setCorrDrawer(false); setCorrDetail(c); }}
      />
      <CorrespondenceDetailModal
        row={corrDetail ? corr.find((c) => c.id === corrDetail.id) ?? corrDetail : null}
        onClose={() => setCorrDetail(null)}
        onRespond={(c) => { setCorrDetail(null); setRespondRow(c); }}
      />
      <RespondModal row={respondRow} onClose={() => setRespondRow(null)} onDone={doRespond} />
      <CalendarDrawer
        open={calendarDrawer} events={calendar} onClose={() => setCalendarDrawer(false)}
        onOpen={setCalDetail}
        onStart={doStartPrep}
      />
      <CalendarEventModal event={calDetail} onClose={() => setCalDetail(null)} />
      <TaxAuditDrawer open={auditDrawer} audit={audit} onClose={() => setAuditDrawer(false)} />
      <TaxExportModal open={exportOpen} onClose={() => setExportOpen(false)} users={users} pools={pools} remittance={remittance} />
      <TaxPermissionsModal open={permissionsOpen} onClose={() => setPermissionsOpen(false)} />
      <LiabilityModal open={liabilityOpen} onClose={() => setLiabilityOpen(false)} config={config} />
    </>
  );
}
