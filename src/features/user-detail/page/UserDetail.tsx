import { useMemo, useState } from "react";
import {
  Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Avatar, Badge, DDItem, Dropdown, EmptyState, Meter, useToast } from "../../../components/ui";
import { kes, num } from "../../../lib/format";
import { buildDetail, FEATURED_USERS, type FeaturedUser, type LoanRec, type TxnRec } from "../data/userDetailData";
import {
  AddNoteModal, AdminCreditModal, BlacklistDeviceModal, BlockUserModal, CardActionModal,
  CloseAccountWizard, DataExportModal, EditProfileModal, FreezeWizard, ImpersonateModal,
  KillSessionsModal, KycDocModal, KycReverifyWizard, LoanRestructureWizard, LimitsWizard,
  RevokeTrustModal, TierChangeWizard, TxnActionModal, UserSwitcherDrawer, VipModal,
  ProfileShareModal, WalletDetailModal, RiskRuleDetailModal, CardEligibilityModal,
  LoginDetailModal, TxnDetailModal, LoanDetailModal, DeviceDetailModal,
  AccountHealthModal, UserInsightModal, ComplianceCheckModal, SessionMgmtModal,
  AccountRecoveryModal, ActivityHeatmapModal, ReferralNetworkModal,
} from "../modals/UserDetailModals";

const tierTone = (t: string) => t === "VIP" ? "violet" : t === "Business" ? "blue" : t === "Agent" ? "amber" : "grey";
const kycTone = (k: string) => k === "Verified" ? "green" : k === "Pending" ? "amber" : k === "Rejected" ? "red" : k === "Expired" ? "grey" : "blue";
const statusTone = (s: string) => s === "Active" ? "green" : s === "Frozen" ? "blue" : s === "Dormant" ? "grey" : s === "Suspended" ? "amber" : "red";
const riskTone = (r: number) => (r > 70 ? "#f04438" : r > 40 ? "#f79009" : "#12b76a");

export function UserDetail({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  const { push } = useToast();
  void signal;

  const [users, setUsers] = useState<FeaturedUser[]>(FEATURED_USERS);
  const [current, setCurrent] = useState<FeaturedUser>(FEATURED_USERS[0]);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const detail = useMemo(() => buildDetail(current), [current]);

  /* modal state */
  const [editOpen, setEditOpen] = useState(false);
  const [freezeOpen, setFreezeOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [limitsOpen, setLimitsOpen] = useState(false);
  const [tierOpen, setTierOpen] = useState(false);
  const [vipOpen, setVipOpen] = useState(false);
  const [impOpen, setImpOpen] = useState(false);
  const [killOpen, setKillOpen] = useState(false);
  const [creditOpen, setCreditOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [reverifyOpen, setReverifyOpen] = useState(false);
  const [blacklistDev, setBlacklistDev] = useState<typeof detail.devices[0] | null>(null);
  const [revokeDev, setRevokeDev] = useState<typeof detail.devices[0] | null>(null);
  const [kycDoc, setKycDoc] = useState<typeof detail.kycDocs[0] | null>(null);
  const [cardAct, setCardAct] = useState<typeof detail.cards[0] | null>(null);
  const [loanAct, setLoanAct] = useState<LoanRec | null>(null);
  const [txnAct, setTxnAct] = useState<{ txn: TxnRec; mode: "reverse" | "hold" | "release" } | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [walletDetail, setWalletDetail] = useState<{ name: string; balance: number; desc: string } | null>(null);
  const [riskRule, setRiskRule] = useState<{ id: string; rule: string; score: number; action: string; note: string } | null>(null);
  const [cardEligOpen, setCardEligOpen] = useState(false);
  const [loginDetail, setLoginDetail] = useState<typeof detail.logins[0] | null>(null);
  const [txnDetail, setTxnDetail] = useState<TxnRec | null>(null);
  const [loanDetail, setLoanDetail] = useState<LoanRec | null>(null);
  const [deviceDetail, setDeviceDetail] = useState<typeof detail.devices[0] | null>(null);
  const [healthOpen, setHealthOpen] = useState(false);
  const [insightOpen, setInsightOpen] = useState(false);
  const [complianceOpen, setComplianceOpen] = useState(false);
  const [sessionMgmtOpen, setSessionMgmtOpen] = useState(false);
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [heatmapOpen, setHeatmapOpen] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);

  const [txnFilter, setTxnFilter] = useState<"all" | "in" | "out">("all");
  const [notes, setNotes] = useState<{ id: string; text: string; by: string; time: string; visible: boolean }[]>([
    { id: "NT-114", text: "VIP merchant — pays supplier invoices every Friday. Prefers WhatsApp over phone.", by: "Grace Wanjiru", time: "2 weeks ago", visible: true },
    { id: "NT-102", text: "Requested higher limits for Q3 event season — approved with Business preset.", by: "Joseph Mwangi", time: "1 month ago", visible: true },
  ]);

  const updateUser = (patch: Partial<FeaturedUser>) => {
    const next = { ...current, ...patch };
    setUsers((list) => list.map((u) => (u.id === current.id ? next : u)));
    setCurrent(next);
  };

  const txns = detail.txns.filter((t) => (txnFilter === "all" ? true : t.direction === txnFilter));
  const loansOutstanding = detail.loans.reduce((s, l) => s + l.balance, 0);
  const tx30 = detail.txns.length * 11;
  const vol30 = detail.txns.reduce((s, t) => s + t.amount, 0) * 11;

  const kpis = [
    { l: "Total balance", v: kes(current.balance), s: "across 4 wallets", i: "bi-wallet2" },
    { l: "Txns (30d)", v: num(tx30), s: `${kes(vol30, { compact: true})} volume`, i: "bi-arrow-left-right" },
    { l: "Risk score", v: String(current.risk), s: current.risk > 70 ? "elevated — see signals" : "within normal band", i: "bi-activity" },
    { l: "Open loans", v: String(detail.loans.filter((l) => l.status !== "Settled").length), s: `${kes(loansOutstanding, { compact: true })} outstanding`, i: "bi-cash-coin" },
    { l: "Active cards", v: String(detail.cards.length), s: detail.cards.length ? "Visa + Mastercard" : "No cards issued", i: "bi-credit-card" },
    { l: "Customer since", v: current.joined.split(" ").slice(1).join(" "), s: `referrals: ${current.referrals}`, i: "bi-calendar-check" },
    { l: "Devices (30d)", v: String(detail.devices.length), s: `${detail.devices.filter((d) => d.trust === "Trusted").length} trusted`, i: "bi-phone" },
    { l: "Last active", v: current.lastActive, s: current.occupation, i: "bi-clock" },
  ];

  return (
    <>
      {/* ============================ header / identity strip ============================ */}
      <div className="d-flex align-items-center gap-2 mb-2">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => onNavigate("user-directory")}><i className="bi bi-arrow-left me-1" />Directory</button>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => setSwitcherOpen(true)}>
          <i className="bi bi-arrow-repeat me-1" />Switch user <span className="pm-kbd ms-1">{users.length}</span>
        </button>
        <div className="ms-auto">
          <div className="pm-seg d-none d-md-inline-flex">
            <button onClick={() => setShareOpen(true)}><i className="bi bi-link-45deg" /></button>
          </div>
        </div>
      </div>

      <div className="pm-card mb-3">
        <div className="pm-card-pad d-flex flex-wrap gap-3 align-items-start">
          <div className="pm-avatar" style={{ width: 72, height: 72, borderRadius: 18, fontSize: "1.6rem", background: ["#12b76a", "#2e90fa", "#7a5af8", "#f79009", "#ee46bc"][current.name.length % 5] }}>
            {current.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
          </div>
          <div className="flex-grow-1" style={{ minWidth: 240 }}>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <h2 style={{ margin: 0, fontSize: "1.25rem" }}>{current.name}</h2>
              <span className="mono pm-td-sub">{current.id}</span>
              <Badge tone={statusTone(current.status)} dot>{current.status}</Badge>
            </div>
            <div style={{ fontSize: ".82rem", color: "var(--pm-muted)", marginTop: ".2rem" }}>
              <i className="bi bi-telephone me-1" />{current.phone} · <i className="bi bi-envelope ms-1 me-1" />{current.email} · <i className="bi bi-geo-alt ms-1 me-1" />{current.county}
            </div>
            <div className="d-flex gap-1 mt-2 flex-wrap">
              <Badge tone={tierTone(current.tier)}>{current.tier}</Badge>
              <Badge tone={kycTone(current.kyc)}>KYC {current.kyc}</Badge>
              <Badge tone={current.risk > 70 ? "red" : current.risk > 40 ? "amber" : "green"}>Risk {current.risk}</Badge>
              {current.tags.map((t) => <Badge key={t} tone="grey">{t}</Badge>)}
              <Badge tone="violet">RM · {current.rm}</Badge>
            </div>
          </div>
          <div className="d-flex gap-2 flex-wrap flex-column flex-sm-row">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setEditOpen(true)}><i className="bi bi-pencil-square me-1" />Edit</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setLimitsOpen(true)}><i className="bi bi-sliders me-1" />Limits</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setCreditOpen(true)}><i className="bi bi-cash-coin me-1" />Credit</button>
            <button className={`btn btn-sm ${current.status === "Frozen" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setFreezeOpen(true)}>
              <i className={`bi ${current.status === "Frozen" ? "bi-unlock" : "bi-snow"} me-1`} />{current.status === "Frozen" ? "Unfreeze" : "Freeze"}
            </button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setImpOpen(true)}><i className="bi bi-incognito me-1" />Impersonate</button>
            <button className="btn btn-danger btn-sm" onClick={() => setCloseOpen(true)}><i className="bi bi-x-octagon me-1" />Close account</button>
            <Dropdown width={240} trigger={() => <button className="btn btn-outline-secondary btn-sm"><i className="bi bi-three-dots-vertical" /></button>}>
              {(close) => (<>
                <div className="pm-dd-head">More actions — Tier 0</div>
                <DDItem icon="bi-arrow-up-circle" label="Change tier" onClick={() => { close(); setTierOpen(true); }} />
                <DDItem icon="bi-gem" label={current.tier === "VIP" ? "Revoke VIP" : "Grant VIP"} onClick={() => { close(); setVipOpen(true); }} />
                <DDItem icon="bi-power" label="Terminate all sessions" hint="2FA" onClick={() => { close(); setKillOpen(true); }} />
                <DDItem icon="bi-chat-square-text" label="Add internal note" onClick={() => { close(); setNoteOpen(true); }} />
                <DDItem icon="bi-arrow-repeat" label="Request KYC re-verification" onClick={() => { close(); setReverifyOpen(true); }} />
                <DDItem icon="bi-shield-lock" label="ODPC data subject export" onClick={() => { close(); setExportOpen(true); }} />
                <DDItem icon="bi-download" label="Export full profile (JSON)" onClick={() => { close(); const blob = new Blob([JSON.stringify({ user: current, ...detail }, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${current.id}-profile.json`; a.click(); push({ kind: "success", title: "Profile exported", body: `${current.id}-profile.json` }); }} />
                <div className="pm-dd-sep" />
                <DDItem icon="bi-person-slash" label="Block user (ban)" danger hint="2FA" onClick={() => { close(); setBlockOpen(true); }} />
              </>)}
            </Dropdown>
          </div>
        </div>
      </div>

      {/* ============================ KPI strip ============================ */}
      <div className="row g-2 mb-3">
        {kpis.map((k) => (
          <div className="col-6 col-md-4 col-xxl-3" key={k.l}>
            <div className="pm-stat" style={{ padding: ".6rem .7rem" }}>
              <div className="d-flex align-items-center gap-2">
                <i className={`bi ${k.i}`} style={{ color: "var(--pm-green)", fontSize: ".85rem" }} />
                <span className="pm-stat-label" style={{ flex: 1 }}>{k.l}</span>
              </div>
              <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.05rem" }}>{k.v}</div>
              <div style={{ fontSize: ".68rem", color: "var(--pm-muted)" }}>{k.s}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ============================ balances + risk ============================ */}
      <div className="row g-3">
        <div className="col-12 col-xl-7">
          <div className="pm-card">
            <div className="pm-card-head">
              <div><h6 className="pm-card-title">Wallets & 30-day balance trend</h6><p className="pm-card-sub">Live from the ledger · last sync 4 minutes ago</p></div>
              <div className="d-flex gap-2">
                <Badge tone="green">{kes(current.balance)}</Badge>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setCreditOpen(true)}><i className="bi bi-plus-circle me-1" />Credit</button>
              </div>
            </div>
            <div className="pm-card-pad" style={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={detail.balances} margin={{ top: 8, right: 6, left: -14, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gMain" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#12b76a" stopOpacity={0.3} /><stop offset="100%" stopColor="#12b76a" stopOpacity={0} /></linearGradient>
                    <linearGradient id="gFloat" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2e90fa" stopOpacity={0.25} /><stop offset="100%" stopColor="#2e90fa" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" vertical={false} />
                  <XAxis dataKey="d" tick={{ fontSize: 10, fill: "#667085" }} axisLine={false} tickLine={false} interval={5} />
                  <YAxis tick={{ fontSize: 10, fill: "#667085" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(Number(v) / 1000)}K`} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6e9f0", fontSize: 12 }} formatter={(v) => [kes(Number(v)), ""]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="main" name="Main wallet" stroke="#12b76a" strokeWidth={2.2} fill="url(#gMain)" />
                  <Area type="monotone" dataKey="float" name="Merchant float" stroke="#2e90fa" strokeWidth={1.8} fill="url(#gFloat)" />
                  <Area type="monotone" dataKey="escrow" name="Escrow" stroke="#7a5af8" strokeWidth={1.6} fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Wallet</th><th className="text-end">Balance</th><th className="text-end">Share</th><th>Progress</th></tr></thead>
                <tbody>
                  {detail.wallets.map((w) => (
                    <tr key={w.name} onClick={() => setWalletDetail(w)}>
                      <td><i className={`bi ${w.icon} me-2`} style={{ color: "var(--pm-green)" }} /><span className="pm-td-strong">{w.name}</span>
                        <div className="pm-td-sub">{w.desc}</div></td>
                      <td className="text-end pm-num" style={{ fontWeight: 700 }}>{kes(w.balance)}</td>
                      <td className="text-end pm-num">{((w.balance / Math.max(current.balance, 1)) * 100).toFixed(1)}%</td>
                      <td><Meter value={(w.balance / Math.max(current.balance, 1)) * 100} width={120} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-5">
          <div className="pm-card h-100">
            <div className="pm-card-head">
              <div><h6 className="pm-card-title">Risk & fraud signals</h6><p className="pm-card-sub">model risk-v4.2.1 · scored 12 minutes ago</p></div>
              <Badge tone={current.risk > 70 ? "red" : current.risk > 40 ? "amber" : "green"} dot>{current.risk}/100</Badge>
            </div>
            <div className="pm-card-pad">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div style={{ flex: 1 }}><Meter value={current.risk} tone={riskTone(current.risk)} width={600} /></div>
                <span style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>bands: 0–20 safe · 21–50 elevated · 51–75 high · 76+ critical</span>
              </div>
              <div className="d-flex flex-column gap-2 mb-3">
                {detail.signals.map((s) => (
                  <div key={s.name} className="d-flex align-items-center gap-2">
                    <span style={{ width: 150, fontSize: ".76rem", fontWeight: 600 }}>{s.name}</span>
                    <span style={{ flex: 1 }}><Meter value={s.weight * 2.2} tone={s.bad ? "#f04438" : "#12b76a"} width={600} /></span>
                    <span className="pm-num" style={{ fontSize: ".74rem", width: 40, textAlign: "right" }}>{s.weight}%</span>
                  </div>
                ))}
              </div>
              <div className="pm-eyebrow mb-1">Recent decisions</div>
              <div className="d-flex flex-column gap-2">
                {detail.alerts.map((a) => (
                  <button key={a.id} className="pm-alert-row text-start" style={{ borderLeftColor: a.score > 75 ? "#f04438" : a.score > 50 ? "#f79009" : "#12b76a" }}
                    onClick={() => setRiskRule(a)}>
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span className="mono" style={{ fontSize: ".7rem", color: "var(--pm-muted)" }}>{a.id}</span>
                        <span className="mono" style={{ fontSize: ".74rem", fontWeight: 700 }}>{a.rule}</span>
                        <Badge tone={a.action === "Auto-blocked" ? "red" : a.action === "Flagged" ? "amber" : "green"}>{a.action}</Badge>
                      </div>
                      <div style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>{a.note} · {a.time}</div>
                    </div>
                    <span className="pm-num" style={{ fontWeight: 700 }}>{a.score}</span>
                  </button>
                ))}
              </div>
              <div className="d-flex gap-2 mt-3">
                <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => onNavigate("monitor")}><i className="bi bi-binoculars me-1" />Open fraud feed</button>
                <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => setImpOpen(true)}><i className="bi bi-incognito me-1" />Investigate</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================ transactions ============================ */}
      <div className="pm-section-head">
        <div><h2>Transaction history</h2><p>Last 22 settlements across every rail — reverse, hold or release with 2FA.</p></div>
        <div className="pm-seg">
          <button className={txnFilter === "all" ? "active" : ""} onClick={() => setTxnFilter("all")}>All</button>
          <button className={txnFilter === "in" ? "active" : ""} onClick={() => setTxnFilter("in")}>Money in</button>
          <button className={txnFilter === "out" ? "active" : ""} onClick={() => setTxnFilter("out")}>Money out</button>
        </div>
      </div>
      <div className="pm-card mb-3">
        <div className="pm-table-wrap" style={{ maxHeight: 460, overflowY: "auto" }}>
          <table className="pm-table">
            <thead><tr><th>When</th><th>Transaction</th><th>Counterparty</th><th>Rail</th><th className="text-end">Amount</th><th>Status</th><th /></tr></thead>
            <tbody>
              {txns.map((t) => (
                <tr key={t.id}>
                  <td><span className="pm-td-strong mono" style={{ fontSize: ".76rem" }}>{t.id}</span><div className="pm-td-sub">{t.time}</div></td>
                  <td><Badge tone={t.direction === "in" ? "green" : "grey"}>{t.type}</Badge>
                    <div className="pm-td-sub mono">{t.ref}</div></td>
                  <td><span style={{ fontSize: ".8rem", fontWeight: 600 }}>{t.counterparty}</span><div className="pm-td-sub mono">{t.cpId}</div></td>
                  <td><Badge tone={t.rail === "M-Pesa" ? "green" : t.rail.includes("Card") ? "blue" : "grey"}>{t.rail}</Badge></td>
                  <td className="text-end">
                    <span className="pm-num" style={{ fontWeight: 700, color: t.direction === "in" ? "#0b8f52" : "#101828" }}>
                      {t.direction === "in" ? "+" : "−"}{kes(t.amount)}
                    </span>
                    <div className="pm-td-sub">fee {kes(t.fee)}</div>
                  </td>
                  <td><Badge tone={t.status === "Complete" ? "green" : t.status === "Pending" ? "blue" : t.status === "Held" ? "amber" : t.status === "Refunded" ? "violet" : "red"} dot>{t.status}</Badge></td>
                  <td className="text-end">
                    <Dropdown up width={230} trigger={() => <button className="pm-icon-btn" style={{ width: 28, height: 28 }}><i className="bi bi-three-dots-vertical" /></button>}>
                      {(close) => (<>
                        <DDItem icon="bi-arrow-counterclockwise" label="Reverse transaction" hint="2FA + reason" disabled={t.status !== "Complete"}
                          onClick={() => { close(); setTxnAct({ txn: t, mode: "reverse" }); }} />
                        <DDItem icon="bi-pause-circle" label="Hold for review" disabled={t.status === "Held" || t.status === "Complete"}
                          onClick={() => { close(); setTxnAct({ txn: t, mode: "hold" }); }} />
                        <DDItem icon="bi-play-circle" label="Release hold" disabled={t.status !== "Held"}
                          onClick={() => { close(); setTxnAct({ txn: t, mode: "release" }); }} />
                        <DDItem icon="bi-journal-text" label="Trace on ledger (Page 9)" onClick={() => { close(); onNavigate("ledger"); }} />
                      </>)}
                    </Dropdown>
                  </td>
                </tr>
              ))}
              {txns.length === 0 && <tr><td colSpan={7}><EmptyState icon="bi-receipt" title="No transactions in this direction"
                action={<button className="btn btn-outline-secondary btn-sm" onClick={() => setTxnFilter("all")}>Show all</button>} /></td></tr>}
            </tbody>
          </table>
        </div>
        <div className="pm-table-foot">
          <span>{txns.length} transactions · {kes(txns.reduce((s, t) => s + t.amount, 0), { compact: true })} total flow</span>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => onNavigate("ledger")}><i className="bi bi-box-arrow-up-right me-1" />Open in ledger</button>
        </div>
      </div>

      {/* ============================ logins + devices ============================ */}
      <div className="row g-3">
        <div className="col-12 col-xl-7">
          <div className="pm-section-head"><div><h2>Login & session history</h2><p>Authentication events with device, IP and risk context.</p></div>
            <button className="btn btn-danger btn-sm" onClick={() => setKillOpen(true)}><i className="bi bi-power me-1" />Terminate all</button>
          </div>
          <div className="pm-card">
            <div className="pm-table-wrap" style={{ maxHeight: 430, overflowY: "auto" }}>
              <table className="pm-table">
                <thead><tr><th>When</th><th>Method</th><th>Device / IP</th><th>Location</th><th>Status</th><th>Risk</th></tr></thead>
                <tbody>
                  {detail.logins.map((l) => (
                    <tr key={l.id}>
                      <td><span className="mono pm-td-strong" style={{ fontSize: ".74rem" }}>{l.id}</span><div className="pm-td-sub">{l.time}</div></td>
                      <td style={{ fontSize: ".78rem" }}>{l.method}</td>
                      <td><div style={{ fontSize: ".76rem" }}>{l.device}</div><div className="pm-td-sub mono">{l.ip}</div></td>
                      <td style={{ fontSize: ".76rem" }}>{l.location}</td>
                      <td><Badge tone={l.status === "Success" ? "green" : l.status === "Failed" ? "red" : "amber"} dot>{l.status}{l.active ? " · live" : ""}</Badge></td>
                      <td><Badge tone={l.risk === "High" ? "red" : l.risk === "Medium" ? "amber" : "green"}>{l.risk}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pm-table-foot">
              <span>{detail.logins.filter((l) => l.status === "Failed").length} failed · {detail.logins.filter((l) => l.risk === "High").length} high-risk in the last 20 days</span>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => { const blob = new Blob([JSON.stringify(detail.logins, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${current.id}-logins.json`; a.click(); push({ kind: "success", title: "Login history exported" }); }}>
                <i className="bi bi-download" />
              </button>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-5">
          <div className="pm-section-head"><div><h2>Registered devices</h2><p>Fingerprints, trust state and last seen.</p></div>
            <Badge tone="grey">{detail.devices.filter((d) => d.trust === "Trusted").length}/{detail.devices.length} trusted</Badge>
          </div>
          <div className="pm-card">
            <div className="p-2 d-flex flex-column gap-2">
              {detail.devices.map((d) => (
                <div key={d.id} className="pm-alert-row" style={{ borderLeftColor: d.trust === "Trusted" ? "#12b76a" : d.trust === "Untrusted" ? "#f79009" : "#f04438" }}>
                  <i className={`bi ${d.model.startsWith("iPhone") ? "bi-apple" : "bi-android2"}`} style={{ color: d.trust === "Trusted" ? "#12b76a" : "#f79009", marginTop: 3 }} />
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span style={{ fontWeight: 700, fontSize: ".82rem" }}>{d.model}</span>
                      <Badge tone={d.trust === "Trusted" ? "green" : d.trust === "Untrusted" ? "amber" : "red"} dot>{d.trust}</Badge>
                      {d.current && <Badge tone="blue">This session</Badge>}
                    </div>
                    <div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }} className="mono">{d.fp} · last {d.lastSeen} · {d.location}</div>
                    <div style={{ fontSize: ".7rem", color: "var(--pm-muted)" }}>{d.sessions30d} sessions (30d) · first seen {d.firstSeen}</div>
                  </div>
                  <div className="d-flex gap-1">
                    {d.trust !== "Trusted" && (
                      <button className="btn btn-sm btn-outline-primary" onClick={() => setRevokeDev(d)}>Trust</button>
                    )}
                    {d.trust !== "Blacklisted" && (
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => setBlacklistDev(d)}><i className="bi bi-fingerprint" /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============================ KYC + loans + cards ============================ */}
      <div className="row g-3">
        <div className="col-12 col-lg-6 col-xxl-4">
          <div className="pm-card h-100">
            <div className="pm-card-head">
              <div><h6 className="pm-card-title">KYC & identity</h6><p className="pm-card-sub">{current.kyc} · Onfido + World-Check</p></div>
              <button className="btn btn-sm btn-outline-primary" onClick={() => setReverifyOpen(true)}><i className="bi bi-arrow-repeat me-1" />Re-verify</button>
            </div>
            <div className="pm-card-pad">
              <div className="pm-timeline mb-3">
                {detail.kycStages.map((s) => (
                  <div key={s.name} className={`pm-tl-item ${s.status === "Verified" ? "done" : s.status === "Rejected" ? "danger" : s.status === "Pending" ? "warn" : ""}`}>
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ fontWeight: 700, fontSize: ".8rem" }}>{s.name}</span>
                      <Badge tone={kycTone(s.status)}>{s.status}</Badge>
                      {s.score > 0 && <span className="pm-num ms-auto" style={{ fontSize: ".72rem" }}>{s.score}%</span>}
                    </div>
                    <div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{s.date}</div>
                  </div>
                ))}
              </div>
              <div className="pm-eyebrow mb-1">Documents</div>
              <div className="d-flex flex-column gap-1">
                {detail.kycDocs.map((d) => (
                  <button key={d.name} className="pm-dd-item" onClick={() => setKycDoc(d)}>
                    <i className="bi bi-file-earmark-image" />
                    <span className="flex-grow-1" style={{ fontSize: ".78rem" }}>{d.name}</span>
                    <Badge tone={kycTone(d.status)}>{d.status}</Badge>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6 col-xxl-4">
          <div className="pm-card h-100">
            <div className="pm-card-head">
              <div><h6 className="pm-card-title">Credit & loans</h6><p className="pm-card-sub">{kes(loansOutstanding, { compact: true })} outstanding</p></div>
              <Badge tone={detail.loans.some((l) => l.status === "Overdue") ? "red" : "green"}>
                {detail.loans.filter((l) => l.status !== "Settled").length} open
              </Badge>
            </div>
            <div className="p-2 d-flex flex-column gap-2">
              {detail.loans.map((l) => (
                <div key={l.id} className="pm-alert-row" style={{ borderLeftColor: l.status === "Overdue" ? "#f04438" : l.status === "Settled" ? "#98a2b3" : "#12b76a" }}>
                  <i className="bi bi-cash-stack" style={{ color: l.status === "Overdue" ? "#f04438" : "#12b76a", marginTop: 3 }} />
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span style={{ fontWeight: 700, fontSize: ".82rem" }}>{l.product}</span>
                      <span className="mono" style={{ fontSize: ".7rem", color: "var(--pm-muted)" }}>{l.id}</span>
                      <Badge tone={l.status === "Overdue" ? "red" : l.status === "Settled" ? "grey" : l.status === "Restructured" ? "amber" : "green"}>{l.status}</Badge>
                    </div>
                    <div style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>{kes(l.principal)} @ {l.rate}% · {l.daysDue}</div>
                    <div className="d-flex align-items-center gap-2 mt-1">
                      <Meter value={l.status === "Settled" ? 100 : ((l.principal - l.balance) / l.principal) * 100}
                        tone={l.status === "Overdue" ? "#f04438" : "#12b76a"} width={180} />
                      <span className="pm-num" style={{ fontSize: ".72rem" }}>{kes(l.balance, { compact: true })} left</span>
                    </div>
                  </div>
                  {l.status !== "Settled" && (
                    <button className="btn btn-sm btn-outline-primary flex-none" onClick={() => setLoanAct(l)}>
                      {l.status === "Overdue" ? "Restructure" : "Review"}
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="pm-table-foot">
              <span>Credit score: <b>{current.risk < 30 ? 742 : current.risk < 60 ? 618 : 512}</b> · CRB reporting {detail.loans.some((l) => l.status === "Overdue") ? "active" : "suspended"}</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-xxl-4">
          <div className="pm-card h-100">
            <div className="pm-card-head">
              <div><h6 className="pm-card-title">Cards</h6><p className="pm-card-sub">{detail.cards.length ? "Issued & managed" : "No cards issued"}</p></div>
              {detail.cards.length > 0 && <button className="btn btn-sm btn-outline-primary" onClick={() => setCardAct(detail.cards[0])}><i className="bi bi-gear me-1" />Manage</button>}
            </div>
            {detail.cards.length === 0 ? (
              <EmptyState icon="bi-credit-card" title="No cards on this account"
                body="Issue a card from the Card Programs page (Page 23) or via the customer app."
                action={<button className="btn btn-outline-secondary btn-sm" onClick={() => setCardEligOpen(true)}>
                  Check eligibility
                </button>} />
            ) : (
              <div className="p-2 d-flex flex-column gap-2">
                {detail.cards.map((c) => (
                  <div key={c.id} className="pm-alert-row" style={{ borderLeftColor: c.status === "Active" ? "#12b76a" : c.status === "Frozen" ? "#2e90fa" : "#f04438" }}>
                    <i className="bi bi-credit-card-2-front" style={{ color: c.brand === "Visa" ? "#2e90fa" : "#f79009", marginTop: 3 }} />
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span style={{ fontWeight: 700, fontSize: ".82rem" }}>{c.brand} •••• {c.last4}</span>
                        <Badge tone={c.status === "Active" ? "green" : c.status === "Frozen" ? "blue" : "red"} dot>{c.status}</Badge>
                      </div>
                      <div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{c.id} · issued {c.issued} · expires {c.expires}</div>
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <span style={{ fontSize: ".68rem", color: "var(--pm-muted)" }}>30d {kes(c.usage30d, { compact: true })} / {kes(c.dailyLimit, { compact: true })}</span>
                        <Meter value={(c.usage30d / c.dailyLimit) * 10} tone="#2e90fa" width={140} />
                      </div>
                    </div>
                    <button className="btn btn-sm btn-outline-secondary flex-none" onClick={() => setCardAct(c)}><i className="bi bi-gear" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================ limits + notes + audit ============================ */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-xl-4">
          <div className="pm-card h-100">
            <div className="pm-card-head">
              <div><h6 className="pm-card-title">Transaction limits</h6><p className="pm-card-sub">vs tier defaults & CBK ceilings</p></div>
              <button className="btn btn-sm btn-outline-primary" onClick={() => setLimitsOpen(true)}><i className="bi bi-pencil me-1" />Adjust</button>
            </div>
            <div className="p-3">
              {detail.limits.map((l) => (
                <div key={l.key} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span style={{ fontSize: ".8rem", fontWeight: 600 }}>{l.label}</span>
                    <span className="pm-num" style={{ fontWeight: 700 }}>{kes(l.current, { compact: true })}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <Meter value={(l.current / l.cbkCeiling) * 100} tone={l.current > l.cbkCeiling * 0.8 ? "#f79009" : "#12b76a"} width={600} />
                    <span style={{ fontSize: ".66rem", color: "var(--pm-muted)", whiteSpace: "nowrap" }}>ceiling {kes(l.cbkCeiling, { compact: true })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="pm-card h-100">
            <div className="pm-card-head">
              <div><h6 className="pm-card-title">Internal notes</h6><p className="pm-card-sub">{notes.length} notes · admins{notes.some((n) => n.visible) ? " + RMs" : ""}</p></div>
              <button className="btn btn-sm btn-outline-primary" onClick={() => setNoteOpen(true)}><i className="bi bi-plus-lg me-1" />Add</button>
            </div>
            <div className="p-3 d-flex flex-column gap-2" style={{ maxHeight: 280, overflowY: "auto" }}>
              {notes.map((n) => (
                <div key={n.id} className="pm-note">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <Avatar name={n.by} size="sm" />
                    <div className="flex-grow-1"><span style={{ fontWeight: 700, fontSize: ".78rem" }}>{n.by}</span>
                      <span style={{ fontSize: ".68rem", color: "var(--pm-muted)" }}> · {n.time}</span></div>
                    {n.visible && <Badge tone="blue">RM-visible</Badge>}
                  </div>
                  <div style={{ fontSize: ".8rem" }}>{n.text}</div>
                </div>
              ))}
              {notes.length === 0 && <div className="pm-note text-center">No notes yet — add context for the next reviewer.</div>}
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="pm-card h-100">
            <div className="pm-card-head">
              <div><h6 className="pm-card-title">Admin activity on this user</h6><p className="pm-card-sub">Immutable · exportable as legal evidence</p></div>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => {
                const blob = new Blob([JSON.stringify(detail.audit, null, 2)], { type: "application/json" });
                const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${current.id}-audit.json`; a.click();
                push({ kind: "success", title: "Audit trail exported" });
              }}><i className="bi bi-download" /></button>
            </div>
            <div className="p-3"><div className="pm-timeline" style={{ maxHeight: 280, overflowY: "auto" }}>
              {detail.audit.map((a) => (
                <div key={a.id} className="pm-tl-item done">
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ fontWeight: 700, fontSize: ".8rem" }}>{a.action}</span>
                    <span className="ms-auto" style={{ fontSize: ".68rem", color: "var(--pm-muted)" }}>{a.time}</span>
                  </div>
                  <div style={{ fontSize: ".73rem", color: "var(--pm-muted)" }}>{a.details}</div>
                  <div style={{ fontSize: ".68rem", color: "#98a2b3" }} className="mt-1">{a.admin} · <span className="mono">{a.ip}</span> · <span className="mono">{a.id}</span></div>
                </div>
              ))}
            </div></div>
          </div>
        </div>
      </div>

      {/* ============================ modals ============================ */}
      <UserSwitcherDrawer users={users} current={current} open={switcherOpen} onClose={() => setSwitcherOpen(false)} onSelect={setCurrent} />
      <EditProfileModal user={editOpen ? current : null} onClose={() => setEditOpen(false)} onSaved={updateUser} />
      <FreezeWizard user={freezeOpen ? current : null} onClose={() => setFreezeOpen(false)} onDone={(_, a) => updateUser({ status: a === "frozen" ? "Frozen" : "Active" })} />
      <CloseAccountWizard user={closeOpen ? current : null} onClose={() => setCloseOpen(false)} onDone={() => { setCloseOpen(false); push({ kind: "info", title: "Closure in cooling-off", body: "The account will close automatically if no reversal is filed." }); }} />
      <LimitsWizard user={limitsOpen ? current : null} limits={detail.limits} onClose={() => setLimitsOpen(false)} onDone={() => {}} />
      <TierChangeWizard user={tierOpen ? current : null} onClose={() => setTierOpen(false)} onDone={(_, tier) => updateUser({ tier: tier as FeaturedUser["tier"] })} />
      <VipModal user={vipOpen ? current : null} onClose={() => setVipOpen(false)} onDone={(_, grant) => updateUser({ tier: grant ? "VIP" : "Verified" })} />
      <ImpersonateModal user={impOpen ? current : null} onClose={() => setImpOpen(false)} />
      <KillSessionsModal user={killOpen ? current : null} logins={detail.logins} onClose={() => setKillOpen(false)} onDone={() => {}} />
      <AdminCreditModal user={creditOpen ? current : null} onClose={() => setCreditOpen(false)} onDone={(u, amt) => updateUser({ balance: u.balance + amt })} />
      <BlockUserModal user={blockOpen ? current : null} onClose={() => setBlockOpen(false)} onDone={() => { setBlockOpen(false); updateUser({ status: "Suspended" }); }} />
      <DataExportModal user={exportOpen ? current : null} onClose={() => setExportOpen(false)} />
      <AddNoteModal user={noteOpen ? current : null} onClose={() => setNoteOpen(false)} onSaved={(_, text, visible) => setNotes((n) => [{ id: `NT-${Date.now() % 1000}`, text, by: "Joseph Mwangi", time: "Just now", visible }, ...n])} />
      <KycReverifyWizard user={reverifyOpen ? current : null} onClose={() => setReverifyOpen(false)} />
      <KycDocModal doc={kycDoc} user={current} onClose={() => setKycDoc(null)}
        onDecision={(d, dec) => {
          setKycDoc({ ...d, status: dec === "approved" ? "Verified" : "Rejected" });
          if (dec === "approved" && current.kyc !== "Verified") { /* keep kyc as-is for simplicity */ }
        }} />
      <BlacklistDeviceModal device={blacklistDev} user={current} onClose={() => setBlacklistDev(null)} onDone={() => {}} />
      <RevokeTrustModal device={revokeDev} user={current} onClose={() => setRevokeDev(null)} onDone={() => {}} />
      <CardActionModal card={cardAct} user={current} onClose={() => setCardAct(null)} onDone={(c, a) => setCardAct(a === "freeze" ? { ...c, status: "Frozen" } : { ...c, status: "Active" })} />
      <LoanRestructureWizard loan={loanAct} user={current} onClose={() => setLoanAct(null)} onDone={() => {}} />
      <TxnActionModal txn={txnAct?.txn ?? null} mode={txnAct?.mode ?? "reverse"} user={current} onClose={() => setTxnAct(null)} onDone={() => setTxnAct(null)} />
      <ProfileShareModal user={shareOpen ? current : null} onClose={() => setShareOpen(false)} />
      {walletDetail && <WalletDetailModal wallet={walletDetail} onClose={() => setWalletDetail(null)} />}
      {riskRule && <RiskRuleDetailModal rule={riskRule} onClose={() => setRiskRule(null)} />}
      <CardEligibilityModal user={cardEligOpen ? current : null} onClose={() => setCardEligOpen(false)} />
      {loginDetail && <LoginDetailModal login={loginDetail} onClose={() => setLoginDetail(null)} />}
      {txnDetail && <TxnDetailModal txn={txnDetail} onClose={() => setTxnDetail(null)} />}
      {loanDetail && <LoanDetailModal loan={loanDetail} onClose={() => setLoanDetail(null)} />}
      {deviceDetail && <DeviceDetailModal device={deviceDetail} onClose={() => setDeviceDetail(null)} />}
      <AccountHealthModal user={healthOpen ? current : null} onClose={() => setHealthOpen(false)} />
      <UserInsightModal user={insightOpen ? current : null} onClose={() => setInsightOpen(false)} />
      <ComplianceCheckModal user={complianceOpen ? current : null} onClose={() => setComplianceOpen(false)} />
      <SessionMgmtModal user={sessionMgmtOpen ? current : null} onClose={() => setSessionMgmtOpen(false)} />
      <AccountRecoveryModal user={recoveryOpen ? current : null} onClose={() => setRecoveryOpen(false)} />
      <ActivityHeatmapModal user={heatmapOpen ? current : null} onClose={() => setHeatmapOpen(false)} />
      <ReferralNetworkModal user={referralOpen ? current : null} onClose={() => setReferralOpen(false)} />
    </>
  );
}
