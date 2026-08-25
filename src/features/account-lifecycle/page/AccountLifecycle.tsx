import { useMemo, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Avatar, Badge, DDItem, Dropdown, EmptyState, Pagination, useToast } from "../../../components/ui";
import { csvDownload, kes, num } from "../../../lib/format";
import {
  CAMPAIGNS, COHORT_RETENTION, CLOSURE_REQUESTS, DORMANT_USERS, FUNNEL, LIFECYCLE_EVENTS, LIFECYCLE_KPI, MONTHLY_FLOW,
  type Campaign, type ClosureRequest, type DormantUser, type FunnelStage,
} from "../data/lifecycleData";
import {
  BulkSweepModal, BulkWinbackModal, CampaignDrawer, CohortModal, ClosureWizard, DormantDrawer,
  ExportModal, FlowDrawer, NewCampaignWizard, OpenProfileModal, PolicyModal, SaveViewModal,
  StageModal, SweepModal, WinbackStatusModal, WinbackWizard,
} from "../modals/LifecycleModals";

const bucketTone = (b: string) => b === "365d" ? "red" : b === "180d" ? "amber" : b === "90d" ? "blue" : "grey";
const closureTone = (s: string) => s === "Approved" ? "green" : s === "Denied" ? "red" : s === "Cooling off" ? "violet" : s === "In review" ? "blue" : "amber";
const eventTone = (t: string) => t === "Closed" || t === "Dormant" ? "red" : t === "Reactivated" || t === "First txn" || t === "First fund" ? "green" : t === "Tier change" ? "violet" : "blue";

export function AccountLifecycle({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  const { push } = useToast();
  void signal;

  const [dormant, setDormant] = useState<DormantUser[]>(DORMANT_USERS);
  const [closures, setClosures] = useState<ClosureRequest[]>(CLOSURE_REQUESTS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(CAMPAIGNS);

  const [q, setQ] = useState("");
  const [bucket, setBucket] = useState("all");
  const [tier, setTier] = useState("all");
  const [closureTab, setClosureTab] = useState("All");
  const [dSort, setDSort] = useState<{ k: keyof DormantUser; dir: 1 | -1 }>({ k: "dormantDays", dir: -1 });
  const [dPage, setDPage] = useState(1);
  const [dSize, setDSize] = useState(8);
  const [sel, setSel] = useState<string[]>([]);

  const [dormantUser, setDormantUser] = useState<DormantUser | null>(null);
  const [winbackUser, setWinbackUser] = useState<DormantUser | null>(null);
  const [sweepUser, setSweepUser] = useState<DormantUser | null>(null);
  const [statusUser, setStatusUser] = useState<DormantUser | null>(null);
  const [profileUser, setProfileUser] = useState<DormantUser | null>(null);
  const [bulkWin, setBulkWin] = useState(false);
  const [bulkSweep, setBulkSweep] = useState(false);
  const [closureReq, setClosureReq] = useState<ClosureRequest | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [newCampaign, setNewCampaign] = useState(false);
  const [stage, setStage] = useState<FunnelStage | null>(null);
  const [cohortOpen, setCohortOpen] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [flowOpen, setFlowOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [savedViews, setSavedViews] = useState([{ name: "VIP sleepers", shared: true }, { name: "365d sweep list", shared: false }]);

  const filteredDormant = useMemo(() => {
    let rows = dormant;
    if (q) rows = rows.filter((u) => (u.name + u.userId + u.phone + u.county).toLowerCase().includes(q.toLowerCase()));
    if (bucket !== "all") rows = rows.filter((u) => u.bucket === bucket);
    if (tier !== "all") rows = rows.filter((u) => u.tier === tier);
    return [...rows].sort((a, b) => {
      const av = a[dSort.k], bv = b[dSort.k];
      return (typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv))) * dSort.dir;
    });
  }, [dormant, q, bucket, tier, dSort]);
  const pagedDormant = filteredDormant.slice((dPage - 1) * dSize, (dPage - 1) * dSize + dSize);

  const closureTabs = ["All", "Pending", "In review", "Cooling off", "Approved", "Denied"];
  const visibleClosures = closures.filter((c) => (closureTab === "All" ? true : c.status === closureTab));

  const activeFilters = (q ? 1 : 0) + (bucket !== "all" ? 1 : 0) + (tier !== "all" ? 1 : 0);
  const queryStr = [q && `q=${q}`, bucket !== "all" && `bucket=${bucket}`, tier !== "all" && `tier=${tier}`].filter(Boolean).join(", ");
  const sortD = (k: keyof DormantUser) => setDSort((s) => ({ k, dir: s.k === k ? (s.dir === 1 ? -1 : 1) : -1 }));

  const maxFunnel = FUNNEL[0].count;

  return (
    <>
      {/* header */}
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="pm-eyebrow">User management · Page 7</span>
            <span className="pm-live"><span className="pm-dot green pm-pulse" />LIVE</span>
          </div>
          <h2>Account Lifecycle</h2>
          <p>Track every account from signup through activation, dormancy and closure — with win-back campaigns, balance sweeps and governed closure approvals.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setFlowOpen(true)}><i className="bi bi-bar-chart me-1" />12-month flow</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setExportOpen(true)}><i className="bi bi-download me-1" />Export</button>
          <Dropdown width={230} trigger={() => <button className="btn btn-outline-secondary btn-sm"><i className="bi bi-three-dots" /></button>}>
            {(close) => (<>
              <div className="pm-dd-head">Lifecycle tools</div>
              <DDItem icon="bi-sliders" label="Dormancy & closure policy" hint="Super Admin" onClick={() => { close(); setPolicyOpen(true); }} />
              <DDItem icon="bi-grid-3x3" label="Cohort retention heatmap" onClick={() => { close(); setCohortOpen(true); }} />
              <DDItem icon="bi-bookmark-plus" label="Save current view" onClick={() => { close(); setSaveOpen(true); }} />
              <DDItem icon="bi-person-lines-fill" label="Open User Directory" onClick={() => { close(); onNavigate("user-directory"); }} />
              <DDItem icon="bi-clipboard2-data" label="Open KPI Scorecard" onClick={() => { close(); onNavigate("kpi"); }} />
            </>)}
          </Dropdown>
          <button className="btn btn-primary btn-sm" onClick={() => setNewCampaign(true)}><i className="bi bi-rocket-takeoff me-1" />New campaign</button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="row g-2 mb-3">
        {LIFECYCLE_KPI.map((s) => (
          <div className="col-6 col-md-3 col-xxl-3" key={s.label}>
            <div className="pm-stat">
              <div className="d-flex align-items-center gap-2">
                <span className="pm-stat-ico" style={{ background: "#e7f8ef", color: "#0b8f52" }}><i className={`bi ${s.icon}`} /></span>
                <span className="pm-stat-label">{s.label}</span>
              </div>
              <div className="pm-stat-value">{s.value}</div>
              <div className="pm-stat-foot">{s.note}</div>
            </div>
          </div>
        ))}
      </div>

      {/* funnel + monthly flow */}
      <div className="row g-3">
        <div className="col-12 col-xl-7">
          <div className="pm-card h-100">
            <div className="pm-card-head">
              <div><h6 className="pm-card-title">Activation funnel</h6><p className="pm-card-sub">Signup to active — click any stage to drill into stuck accounts</p></div>
              <Badge tone="green">76.7% signup → D30</Badge>
            </div>
            <div className="pm-card-pad">
              <div className="d-flex flex-column gap-1">
                {FUNNEL.map((s, i) => {
                  const width = Math.max(24, (s.count / maxFunnel) * 100);
                  return (
                    <div key={s.id} className="d-flex align-items-center gap-2">
                      <button className="border-0 bg-transparent text-start d-flex align-items-center gap-2" style={{ width: 190 }} onClick={() => setStage(s)}>
                        <span className="pm-stat-ico" style={{ background: s.color + "1c", color: s.color }}><i className={`bi ${s.icon}`} /></span>
                        <span><span style={{ fontWeight: 700, fontSize: ".78rem" }}>{s.label}</span>
                          <span className="d-block" style={{ fontSize: ".66rem", color: "var(--pm-muted)" }}>{num(s.count)}</span></span>
                      </button>
                      <div style={{ flex: 1, position: "relative", height: 26 }}>
                        <div style={{ position: "absolute", inset: 0, width: `${width}%`, borderRadius: 8, background: `linear-gradient(90deg, ${s.color}cc, ${s.color})` }} />
                        {i < FUNNEL.length - 1 && (
                          <div style={{ position: "absolute", left: `${width - 3}%`, top: "100%", height: 10, width: 2, background: "#d0d5dd" }} />
                        )}
                      </div>
                      <span style={{ width: 64, textAlign: "right", fontSize: ".68rem", fontWeight: 700, color: s.rateFromPrev >= 85 ? "#0b8f52" : s.rateFromPrev >= 75 ? "#b54708" : "#d92d20" }}>
                        {s.rateFromPrev ? `${s.rateFromPrev}%` : "rolling"}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="pm-note mt-3">
                <i className="bi bi-lightning-charge me-1" />Biggest drop-off is <b>First funded → First transaction</b> at 91.5%. {num(101_506 - 92_908)} users funded but never transacted — the top win-back pool.
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-5">
          <div className="pm-card h-100">
            <div className="pm-card-head">
              <div><h6 className="pm-card-title">Monthly net flow</h6><p className="pm-card-sub">New signups vs churn + closures, trailing 12 months</p></div>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setFlowOpen(true)}><i className="bi bi-box-arrow-up-right" /></button>
            </div>
            <div className="pm-card-pad" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MONTHLY_FLOW} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#667085" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#667085" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6e9f0", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="newSignups" name="New signups" fill="#12b76a" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="churned" name="Churned" fill="#f04438" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="reactivated" name="Reactivated" fill="#2e90fa" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* dormant accounts */}
      <div className="pm-section-head">
        <div><h2>Dormant accounts</h2><p>24 of 21,430 accounts at 60+ days idle — the highest-value win-back pool, sorted by longest dormancy.</p></div>
        {sel.length > 0 && <div className="d-flex gap-2">
          <button className="btn btn-outline-primary btn-sm" onClick={() => setBulkWin(true)}><i className="bi bi-broadcast me-1" />Win back ({sel.length})</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setBulkSweep(true)}><i className="bi bi-box-arrow-up me-1" />Sweep ({sel.length})</button>
        </div>}
      </div>
      <div className="pm-card mb-3">
        <div className="pm-card-head">
          <div className="pm-search flex-grow-1" style={{ maxWidth: 320 }}>
            <i className="bi bi-search" /><input placeholder="Name, ID, phone, county…" value={q} onChange={(e) => { setQ(e.target.value); setDPage(1); }} />
          </div>
          <div className="d-flex gap-2 flex-wrap align-items-center">
            <div className="pm-seg">{["all", "60d", "90d", "180d", "365d"].map((b) => (
              <button key={b} className={bucket === b ? "active" : ""} onClick={() => { setBucket(b); setDPage(1); }}>{b === "all" ? "All" : b}</button>))}</div>
            <select className="form-select form-select-sm" style={{ width: 130 }} value={tier} onChange={(e) => { setTier(e.target.value); setDPage(1); }}>
              <option value="all">All tiers</option>{["Basic", "Verified", "VIP", "Business"].map((t) => <option key={t}>{t}</option>)}
            </select>
            {activeFilters > 0 && <button className="pm-chip" onClick={() => { setQ(""); setBucket("all"); setTier("all"); }}>Clear ({activeFilters})</button>}
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setSaveOpen(true)} title="Save current view"><i className="bi bi-bookmark-plus" /></button>
          </div>
        </div>
        {savedViews.length > 0 && (
          <div className="d-flex gap-1 flex-wrap p-2 pb-0">
            <span className="pm-eyebrow align-self-center me-1">Saved views:</span>
            {savedViews.map((v) => (
              <span key={v.name} className="pm-chip active d-inline-flex align-items-center gap-1">
                <i className="bi bi-bookmark" style={{ fontSize: ".7rem" }} />{v.name}{v.shared && <i className="bi bi-people" style={{ fontSize: ".62rem" }} />}
                <button className="border-0 bg-transparent p-0" style={{ color: "rgba(255,255,255,.7)" }} aria-label="Remove view"
                  onClick={() => { setSavedViews((l) => l.filter((x) => x.name !== v.name)); push({ kind: "info", title: `View "${v.name}" removed` }); }}>
                  <i className="bi bi-x" style={{ fontSize: ".66rem" }} />
                </button>
              </span>
            ))}
          </div>
        )}
        {sel.length > 0 && <div className="pm-bulkbar">
          <b style={{ fontSize: ".82rem" }}>{sel.length} selected</b>
          <button className="btn btn-sm btn-light" onClick={() => setBulkWin(true)}><i className="bi bi-broadcast me-1" />Win back</button>
          <button className="btn btn-sm btn-light" onClick={() => setBulkSweep(true)}><i className="bi bi-box-arrow-up me-1" />Sweep balances</button>
          <button className="btn btn-sm btn-outline-light ms-auto" onClick={() => setSel([])}>Clear</button>
        </div>}
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead>
              <tr>
                <th style={{ width: 34 }}><input type="checkbox" className="form-check-input" checked={sel.length === pagedDormant.length && pagedDormant.length > 0}
                  onChange={(e) => setSel(e.target.checked ? pagedDormant.map((u) => u.id) : [])} /></th>
                {([["name", "Customer"], ["bucket", "Dormancy"], ["balance", "Balance"], ["lifetimeVolume", "Lifetime vol."], ["channel", "Channel"], ["lastLogin", "Last login"], ["reason", "Inferred reason"]] as const).map(([k, l]) => (
                  <th key={k} className={`${k === "balance" || k === "lifetimeVolume" ? "text-end " : ""}${["name", "bucket", "balance", "lifetimeVolume", "lastLogin"].includes(k) ? "cursor-pointer" : ""}`}
                    onClick={() => ["name", "bucket", "balance", "lifetimeVolume", "lastLogin"].includes(k) && sortD(k as keyof DormantUser)}>
                    {l} {dSort.k === k && <i className={`bi bi-caret-${dSort.dir === 1 ? "up" : "down"}-fill`} style={{ fontSize: ".55rem" }} />}
                  </th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {pagedDormant.map((u) => (
                <tr key={u.id} className={sel.includes(u.id) ? "selected" : ""} onClick={() => setDormantUser(u)}>
                  <td onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="form-check-input" checked={sel.includes(u.id)}
                      onChange={(e) => setSel(e.target.checked ? [...sel, u.id] : sel.filter((x) => x !== u.id))} />
                  </td>
                  <td><div className="d-flex align-items-center gap-2"><Avatar name={u.name} size="sm" />
                    <div><div className="pm-td-strong">{u.name}</div><div className="pm-td-sub mono">{u.userId} · {u.county}</div></div></div></td>
                  <td><Badge tone={bucketTone(u.bucket)}>{u.bucket} · {u.dormantDays}d</Badge>{u.winback && <div className="pm-td-sub">win-back sent</div>}</td>
                  <td className="text-end pm-num" style={{ fontWeight: 700 }}>{kes(u.balance)}</td>
                  <td className="text-end pm-num">{kes(u.lifetimeVolume, { compact: true })}<div className="pm-td-sub">{num(u.lifetimeTxns)} txns</div></td>
                  <td><Badge tone="grey">{u.channel}</Badge></td>
                  <td style={{ fontSize: ".76rem" }}>{u.lastLogin}</td>
                  <td style={{ fontSize: ".73rem", color: "var(--pm-muted)", maxWidth: 210, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.reason}</td>
                  <td className="text-end" onClick={(e) => e.stopPropagation()}>
                    <Dropdown up width={230} trigger={() => <button className="pm-icon-btn" style={{ width: 28, height: 28 }}><i className="bi bi-three-dots-vertical" /></button>}>
                      {(close) => (<>
                        <DDItem icon="bi-person-badge" label="Open dormant profile" onClick={() => { close(); setDormantUser(u); }} />
                        <DDItem icon="bi-arrow-counterclockwise" label="Win-back wizard" onClick={() => { close(); setWinbackUser(u); }} />
                        <DDItem icon="bi-hourglass-split" label="Win-back status" onClick={() => { close(); setStatusUser(u); }} />
                        <DDItem icon="bi-box-arrow-up" label="Sweep balance" hint="2FA" onClick={() => { close(); setSweepUser(u); }} />
                        <DDItem icon="bi-person-vcard" label="360° profile (Page 5)" onClick={() => { close(); setProfileUser(u); }} />
                        <div className="pm-dd-sep" />
                        <DDItem icon="bi-x-circle" label="Move to closure" danger onClick={() => { close(); push({ kind: "info", title: "Closure request drafted", body: `${u.userId} added to the closure queue for review.` }); }} />
                      </>)}
                    </Dropdown>
                  </td>
                </tr>
              ))}
              {pagedDormant.length === 0 && (
                <tr><td colSpan={9}><EmptyState icon="bi-moon-stars" title="No dormant accounts match these filters"
                  body="Try widening the dormancy bucket or clearing the search."
                  action={<button className="btn btn-outline-secondary btn-sm" onClick={() => { setQ(""); setBucket("all"); setTier("all"); }}>Clear all filters</button>} /></td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={dPage} pageSize={dSize} total={filteredDormant.length} onPage={setDPage} onPageSize={setDSize} />
      </div>

      {/* closure requests + campaigns */}
      <div className="row g-3">
        <div className="col-12 col-xl-7">
          <div className="pm-section-head">
            <div><h2>Closure requests</h2><p>14 requests with balances, loans, standing orders and cards to dispose.</p></div>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-secondary" onClick={() => csvDownload("closure-requests.csv", closures as unknown as Record<string, unknown>[])}><i className="bi bi-download" /></button>
            </div>
          </div>
          <div className="pm-card">
            <div className="pm-tabs">
              {closureTabs.map((t) => (
                <button key={t} className={`pm-tab ${closureTab === t ? "active" : ""}`} onClick={() => setClosureTab(t)}>
                  {t}<span className="cnt">{t === "All" ? closures.length : closures.filter((c) => c.status === t).length}</span>
                </button>
              ))}
            </div>
            <div className="pm-table-wrap" style={{ maxHeight: 470, overflowY: "auto" }}>
              <table className="pm-table">
                <thead><tr><th>Request</th><th>Reason</th><th className="text-end">Balance</th><th>Disposition</th><th>Reviewer</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {visibleClosures.map((c) => (
                    <tr key={c.id} onClick={() => setClosureReq(c)}>
                      <td><div className="pm-td-strong">{c.name}</div><div className="pm-td-sub mono">{c.id} · {c.userId} · {c.requested}</div></td>
                      <td><Badge tone={c.reason.includes("Fraud") || c.reason.includes("AML") ? "red" : c.reason === "Court order" ? "violet" : "grey"}>{c.reason}</Badge>
                        {c.vip && <Badge tone="violet">VIP</Badge>}</td>
                      <td className="text-end pm-num" style={{ fontWeight: 700 }}>{kes(c.balance)}</td>
                      <td style={{ fontSize: ".72rem" }}>{c.loans ? `${c.loans} loan · ` : ""}{c.standingOrders ? `${c.standingOrders} SO · ` : ""}{c.cards ? `${c.cards} card` : "clean"}</td>
                      <td style={{ fontSize: ".75rem" }}>{c.reviewer}</td>
                      <td><Badge tone={closureTone(c.status)} dot>{c.status}</Badge></td>
                      <td className="text-end" onClick={(e) => e.stopPropagation()}>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => setClosureReq(c)}>Review</button>
                      </td>
                    </tr>
                  ))}
                  {visibleClosures.length === 0 && <tr><td colSpan={7}><EmptyState icon="bi-box-seam" title="No closures in this status"
                    action={<button className="btn btn-outline-secondary btn-sm" onClick={() => setClosureTab("All")}>Show all</button>} /></td></tr>}
                </tbody>
              </table>
            </div>
            <div className="pm-table-foot">
              <span>{closures.filter((c) => c.status === "Pending").length} pending · {kes(closures.reduce((s, c) => s + c.balance, 0), { compact: true })} total residual balance</span>
              <span><i className="bi bi-info-circle me-1" />Fraud / AML closures require Compliance co-approval</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-5">
          <div className="pm-section-head">
            <div><h2>Reactivation campaigns</h2><p>Win-back runs with delivery, conversion and ROAS.</p></div>
            <button className="btn btn-sm btn-primary" onClick={() => setNewCampaign(true)}><i className="bi bi-plus-lg me-1" />New</button>
          </div>
          <div className="pm-card">
            <div className="p-2 d-flex flex-column gap-2" style={{ maxHeight: 520, overflowY: "auto" }}>
              {campaigns.map((c) => {
                const conv = c.delivered ? ((c.converted / c.delivered) * 100).toFixed(1) : "0";
                const roas = c.spend && c.sent ? (c.converted * 2140 / c.spend).toFixed(1) : "—";
                return (
                  <button key={c.id} className="pm-alert-row info text-start w-100" onClick={() => setCampaign(c)}>
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span style={{ fontWeight: 700, fontSize: ".84rem" }}>{c.name}</span>
                        <Badge tone={c.status === "Live" ? "green" : c.status === "Paused" ? "amber" : c.status === "Scheduled" ? "blue" : "grey"} dot>{c.status}</Badge>
                      </div>
                      <div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{c.audience} · {c.offer}</div>
                      <div className="d-flex gap-3 mt-1 flex-wrap" style={{ fontSize: ".7rem" }}>
                        <span><b className="pm-num">{num(c.recipients)}</b> sent</span>
                        <span><b className="pm-num">{conv}%</b> convert</span>
                        <span><b className="pm-num">{kes(c.spend, { compact: true })}</b> spend</span>
                        <span style={{ color: roas !== "—" && Number(roas) >= 1 ? "#0b8f52" : "#d92d20" }}><b className="pm-num">{roas}x</b> ROAS</span>
                      </div>
                    </div>
                    <i className="bi bi-chevron-right" style={{ color: "#c3cbd9" }} />
                  </button>
                );
              })}
            </div>
            <div className="pm-table-foot">
              <span>{campaigns.filter((c) => c.status === "Live").length} live · {num(campaigns.reduce((s, c) => s + c.converted, 0))} total reactivated</span>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => csvDownload("campaigns.csv", campaigns as unknown as Record<string, unknown>[])}><i className="bi bi-download" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* cohort + events */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-xl-5">
          <div className="pm-section-head">
            <div><h2>Cohort retention</h2><p>Monthly signup cohorts by activation checkpoint.</p></div>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setCohortOpen(true)}><i className="bi bi-grid-3x3 me-1" />Heatmap</button>
          </div>
          <div className="pm-card h-100">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Cohort</th><th className="text-end">Size</th><th>D1</th><th>D7</th><th>D30</th><th>D90</th></tr></thead>
                <tbody>
                  {COHORT_RETENTION.map((r) => (
                    <tr key={r.cohort}>
                      <td className="pm-td-strong">{r.cohort}</td>
                      <td className="text-end pm-num">{num(r.size)}</td>
                      {([["d1", r.d1], ["d7", r.d7], ["d30", r.d30], ["d90", r.d90]] as const).map(([k, v]) => (
                        <td key={k}>{v ? <span style={{ display: "inline-block", width: 92, textAlign: "center", borderRadius: 6, fontSize: ".72rem", fontWeight: 700, padding: ".18rem 0", background: `rgba(18,183,106,${0.12 + (v / 100) * 0.75})`, color: v > 45 ? "#0b4d2e" : "#0b8f52" }}>{v}%</span> : <span className="pm-td-sub">—</span>}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pm-table-foot">
              <span>D30 improving: 44% (Mar) → 47% (Jun)</span>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setCohortOpen(true)}><i className="bi bi-box-arrow-up-right" /></button>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-7">
          <div className="pm-section-head">
            <div><h2>Lifecycle event feed</h2><p>Signups, activations, dormancy, reactivations and closures — auto-refreshing.</p></div>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => csvDownload("lifecycle-events.csv", LIFECYCLE_EVENTS as unknown as Record<string, unknown>[])}><i className="bi bi-download" /></button>
          </div>
          <div className="pm-card h-100">
            <div className="p-2 d-flex flex-column gap-2" style={{ maxHeight: 520, overflowY: "auto" }}>
              {LIFECYCLE_EVENTS.map((e) => (
                <button key={e.id} className="pm-alert-row text-start w-100"
                  style={{ borderLeftColor: e.type === "Closed" || e.type === "Dormant" ? "#f04438" : e.type === "Reactivated" || e.type === "First txn" || e.type === "First fund" ? "#12b76a" : "#2e90fa" }}
                  onClick={() => push({ kind: "info", title: `${e.type} — ${e.user}`, body: `${e.userId} · ${e.detail} · ${e.county}` })}>
                  <span className={`pm-dot ${eventTone(e.type) === "red" ? "red" : eventTone(e.type) === "green" ? "green" : eventTone(e.type) === "violet" ? "blue" : "blue"}`} style={{ marginTop: 6 }} />
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <Badge tone={eventTone(e.type)}>{e.type}</Badge>
                      <span style={{ fontWeight: 700, fontSize: ".82rem" }}>{e.user}</span>
                      <span className="mono" style={{ fontSize: ".7rem", color: "var(--pm-muted)" }}>{e.userId}</span>
                    </div>
                    <div style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>{e.detail}</div>
                  </div>
                  <div className="text-end" style={{ fontSize: ".7rem", color: "var(--pm-muted)" }}>{e.time}<div className="pm-td-sub">{e.county}</div></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* modals & drawers */}
      <DormantDrawer user={dormantUser} onClose={() => setDormantUser(null)} onWinback={(u) => { setDormantUser(null); setWinbackUser(u); }}
        onSweep={(u) => { setDormantUser(null); setSweepUser(u); }} onDetail={(u) => { setDormantUser(null); setProfileUser(u); }} />
      <WinbackWizard user={winbackUser} onClose={() => setWinbackUser(null)} onDone={(u) => setDormant((list) => list.map((x) => x.id === u.id ? { ...x, winback: true } : x))} />
      <SweepModal user={sweepUser} onClose={() => setSweepUser(null)} onDone={() => { setSweepUser(null); setDormant((list) => list.map((x) => x.id === sweepUser!.id ? { ...x, balance: 0 } : x)); }} />
      <WinbackStatusModal user={statusUser} onClose={() => setStatusUser(null)} />
      <OpenProfileModal user={profileUser} onClose={() => setProfileUser(null)} onNavigate={onNavigate} />
      <BulkWinbackModal open={bulkWin} count={sel.length} onClose={() => setBulkWin(false)} onDone={(action) => {
        setDormant((list) => list.map((x) => sel.includes(x.id) ? { ...x, winback: true } : x));
        push({ kind: "success", title: `${sel.length} win-backs queued`, body: action === "sweep-notice" ? "Balance sweep notices dispatched." : action === "reminder" ? "Zero-cost reminders sent." : "Incentive win-backs sent." });
        setSel([]);
      }} />
      <BulkSweepModal open={bulkSweep} count={sel.length} onClose={() => setBulkSweep(false)} onDone={() => {
        setDormant((list) => list.map((x) => sel.includes(x.id) ? { ...x, balance: 0 } : x));
        setSel([]);
      }} />
      <ClosureWizard req={closureReq} onClose={() => setClosureReq(null)} onDone={(r, decision) => {
        setClosures((list) => list.map((c) => c.id === r.id ? { ...c, status: decision, reviewer: "Jeckonia Kwasa" } : c));
        setClosureReq(null);
      }} />
      <CampaignDrawer campaign={campaign} onClose={() => setCampaign(null)}
        onPause={(c, pause) => setCampaigns((list) => list.map((x) => x.id === c.id ? { ...x, status: pause ? "Paused" : "Live" } : x))}
        onExtend={(c) => { setCampaigns((list) => list.map((x) => x.id === c.id ? { ...x, ends: "+14 days" } : x)); push({ kind: "success", title: "Campaign extended", body: `${c.name} runs 14 days longer.` }); }}
        onExport={(c) => { push({ kind: "success", title: "Campaign report downloaded", body: `${c.id} · full attribution dataset.` }); }} />
      <NewCampaignWizard open={newCampaign} onClose={() => setNewCampaign(false)} onCreate={(c) => setCampaigns((list) => [c, ...list])} />
      <StageModal stage={stage} onClose={() => setStage(null)} />
      <CohortModal open={cohortOpen} onClose={() => setCohortOpen(false)} />
      <PolicyModal open={policyOpen} onClose={() => setPolicyOpen(false)} />
      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} />
      <FlowDrawer open={flowOpen} onClose={() => setFlowOpen(false)} />
      <SaveViewModal open={saveOpen} query={queryStr} onClose={() => setSaveOpen(false)}
        onSave={(name, shared) => { setSavedViews((v) => [{ name, shared }, ...v]); push({ kind: "success", title: "Lifecycle view saved", body: name }); }} />
    </>
  );
}
