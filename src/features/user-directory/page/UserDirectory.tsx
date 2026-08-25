import { useMemo, useState } from "react";
import { Avatar, Badge, DDItem, Dropdown, EmptyState, Meter, Pagination, useToast } from "../../../components/ui";
import { csvDownload, kes, num } from "../../../lib/format";
import { COLUMNS, SAVED_VIEWS, SEGMENTS, SUMMARY_STATS, USERS, type SavedView, type User } from "../data/userData";
import {
  AdvancedSearchDrawer, AdjustLimitsWizard, BulkActionsModal, ColumnConfigModal, EditUserModal,
  ExportUsersModal, FreezeWizard, ImpersonateModal, SaveViewModal, SavedViewsDrawer, UserDrawer, VipModal,
  LoginHistoryModal, TransactionHistoryModal, CloseAccountModal, BroadcastModal, RenameViewModal,
  UserActivityModal, RiskAssessmentModal, SendMessageModal, ComplianceModal, UserInsightsModal,
  UserAuditTrailModal, NotificationConfigModal, SegmentAnalysisModal, UserHealthModal,
  UserDevicesModal, UserDocumentsModal, UserPreferencesModal, UserTagsModal, CommunicationHistoryModal,
  SessionManagementModal, AccountRecoveryModal, LoanDetailsModal, CardManagementModal,
  GeoDistributionModal, ReferralNetworkModal, ActivityHeatmapModal,
  type SearchFilters, EMPTY_FILTERS,
} from "../modals/UserModals";

const tierTone = (t: string) => t === "VIP" ? "violet" : t === "Business" ? "blue" : t === "Agent" ? "amber" : "grey";
const kycTone = (k: string) => k === "Verified" ? "green" : k === "Pending" ? "amber" : k === "Rejected" ? "red" : k === "Expired" ? "grey" : "blue";
const statusTone = (s: string) => s === "Active" ? "green" : s === "Frozen" ? "blue" : s === "Dormant" ? "grey" : s === "Suspended" ? "amber" : "red";

export function UserDirectory({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  const { push } = useToast();
  void signal; void onNavigate;

  const [users, setUsers] = useState<User[]>(USERS);
  const [views, setViews] = useState<SavedView[]>(SAVED_VIEWS);
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [segment, setSegment] = useState("all");
  const [sort, setSort] = useState<{ k: keyof User; dir: 1 | -1 }>({ k: "balance", dir: -1 });
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(12);
  const [sel, setSel] = useState<string[]>([]);
  const [cols, setCols] = useState<string[]>(COLUMNS.filter((c) => c.default).map((c) => c.key));

  // modals
  const [user, setUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [freezeUser, setFreezeUser] = useState<User | null>(null);
  const [limitsUser, setLimitsUser] = useState<User | null>(null);
  const [vipUser, setVipUser] = useState<User | null>(null);
  const [impUser, setImpUser] = useState<User | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [colsOpen, setColsOpen] = useState(false);
  const [saveViewOpen, setSaveViewOpen] = useState(false);
  const [viewsOpen, setViewsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loginHistUser, setLoginHistUser] = useState<User | null>(null);
  const [txnHistUser, setTxnHistUser] = useState<User | null>(null);
  const [closeUser, setCloseUser] = useState<User | null>(null);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [renameView, setRenameView] = useState<SavedView | null>(null);
  const [activityUser, setActivityUser] = useState<User | null>(null);
  const [riskUser, setRiskUser] = useState<User | null>(null);
  const [msgUser, setMsgUser] = useState<User | null>(null);
  const [complianceUser, setComplianceUser] = useState<User | null>(null);
  const [insightsUser, setInsightsUser] = useState<User | null>(null);
  const [auditUser, setAuditUser] = useState<User | null>(null);
  const [notifUser, setNotifUser] = useState<User | null>(null);
  const [segmentOpen, setSegmentOpen] = useState(false);
  const [healthUser, setHealthUser] = useState<User | null>(null);
  const [devicesUser, setDevicesUser] = useState<User | null>(null);
  const [docsUser, setDocsUser] = useState<User | null>(null);
  const [prefsUser, setPrefsUser] = useState<User | null>(null);
  const [tagsUser, setTagsUser] = useState<User | null>(null);
  const [commsUser, setCommsUser] = useState<User | null>(null);
  const [sessionUser, setSessionUser] = useState<User | null>(null);
  const [recoveryUser, setRecoveryUser] = useState<User | null>(null);
  const [loanUser, setLoanUser] = useState<User | null>(null);
  const [cardUser, setCardUser] = useState<User | null>(null);
  const [geoOpen, setGeoOpen] = useState(false);
  const [referralUser, setReferralUser] = useState<User | null>(null);
  const [heatmapUser, setHeatmapUser] = useState<User | null>(null);

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => {
    if (k === "q") return (v as string).length > 0;
    if (k === "tags") return (v as string[]).length > 0;
    if (["balanceMin", "balanceMax", "riskMin", "riskMax"].includes(k)) return (v as number) > 0;
    return v !== "all";
  }).length;

  const filtered = useMemo(() => {
    let list = users;
    if (segment !== "all") {
      if (segment === "active") list = list.filter((u) => u.status === "Active");
      else if (segment === "verified") list = list.filter((u) => u.kyc === "Verified");
      else if (segment === "vip") list = list.filter((u) => u.tier === "VIP");
      else if (segment === "business") list = list.filter((u) => u.tier === "Business");
      else if (segment === "frozen") list = list.filter((u) => u.status === "Frozen");
      else if (segment === "dormant") list = list.filter((u) => u.status === "Dormant");
      else if (segment === "high-risk") list = list.filter((u) => u.riskScore > 70);
      else if (segment === "defaulters") list = list.filter((u) => u.loans > 0);
      else if (segment === "new-7d") list = list.filter((u) => u.lastActive === "Just now" || u.lastActive.includes("hour"));
    }
    if (filters.q) list = list.filter((u) => (u.name + u.id + u.phone + u.email + u.county).toLowerCase().includes(filters.q.toLowerCase()));
    if (filters.tier !== "all") list = list.filter((u) => u.tier === filters.tier);
    if (filters.kyc !== "all") list = list.filter((u) => u.kyc === filters.kyc);
    if (filters.status !== "all") list = list.filter((u) => u.status === filters.status);
    if (filters.county !== "all") list = list.filter((u) => u.county === filters.county);
    if (filters.channel !== "all") list = list.filter((u) => u.channel === filters.channel);
    if (filters.balanceMin > 0) list = list.filter((u) => u.balance >= filters.balanceMin);
    if (filters.balanceMax > 0) list = list.filter((u) => u.balance <= filters.balanceMax);
    if (filters.riskMin > 0) list = list.filter((u) => u.riskScore >= filters.riskMin);
    if (filters.riskMax > 0) list = list.filter((u) => u.riskScore <= filters.riskMax);
    if (filters.tags.length) list = list.filter((u) => filters.tags.some((t) => u.tags.includes(t)));
    return [...list].sort((a, b) => {
      const av = a[sort.k], bv = b[sort.k];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * sort.dir;
      return String(av).localeCompare(String(bv)) * sort.dir;
    });
  }, [users, segment, filters, sort]);

  const paged = filtered.slice((page - 1) * size, page * size);
  const sortBy = (k: keyof User) => setSort((s) => ({ k, dir: s.k === k ? (s.dir === 1 ? -1 : 1) : -1 }));
  const filtersStr = Object.entries(filters).filter(([k, v]) => { if (k === "q") return false; if (k === "tags") return (v as string[]).length > 0; if (typeof v === "number") return v > 0; return v !== "all"; }).map(([k, v]) => `${k}=${Array.isArray(v) ? v.join("+") : v}`).join(", ");

  const handleFreezeResult = (u: User, action: string) => {
    setUsers((list) => list.map((x) => x.id === u.id ? { ...x, status: action === "frozen" ? "Frozen" : "Active" } : x));
  };
  const handleVip = (u: User) => {
    setUsers((list) => list.map((x) => x.id === u.id ? { ...x, tier: u.tier === "VIP" ? "Verified" : "VIP" } : x));
  };

  const visibleCols = COLUMNS.filter((c) => cols.includes(c.key) || c.key === "actions");

  return (
    <>
      {/* header */}
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="pm-eyebrow">User management · Page 4</span>
            <Badge tone="blue">{num(148_392)} users</Badge>
          </div>
          <h2>User Directory</h2>
          <p>Searchable, filterable directory of every PayMo user with bulk actions, saved views, and full admin controls for freeze, limits, VIP and impersonation.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setSearchOpen(true)}>
            <i className="bi bi-funnel me-1" />Advanced{activeFilterCount > 0 && <span className="ms-1 pm-badge green">{activeFilterCount}</span>}
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setViewsOpen(true)}><i className="bi bi-bookmarks me-1" />Views</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setColsOpen(true)}><i className="bi bi-layout-three-columns me-1" />Columns</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setExportOpen(true)}><i className="bi bi-download me-1" />Export</button>
          <Dropdown width={230} trigger={() => <button className="btn btn-outline-secondary btn-sm"><i className="bi bi-three-dots" /></button>}>
            {(close) => (<>
              <DDItem icon="bi-bookmark-plus" label="Save current view" onClick={() => { close(); setSaveViewOpen(true); }} />
              <DDItem icon="bi-file-earmark-spreadsheet" label="Export CSV" onClick={() => { close(); csvDownload("user-directory.csv", filtered as unknown as Record<string, unknown>[]); push({ kind: "success", title: "Exported" }); }} />
              <DDItem icon="bi-broadcast" label="Broadcast to segment" onClick={() => { close(); setBroadcastOpen(true); }} />
              <DDItem icon="bi-bar-chart" label="Segment analysis" onClick={() => { close(); setSegmentOpen(true); }} />
              <DDItem icon="bi-geo-alt" label="Geo distribution" onClick={() => { close(); setGeoOpen(true); }} />
            </>)}
          </Dropdown>
        </div>
      </div>

      {/* summary stats */}
      <div className="row g-2 mb-3">
        {SUMMARY_STATS.map((s) => (
          <div className="col-6 col-md-4 col-xl-2" key={s.label}>
            <div className="pm-stat">
              <div className="d-flex align-items-center gap-2">
                <i className={`bi ${s.icon}`} style={{ color: "var(--pm-green)", fontSize: ".85rem" }} />
                <span className="pm-stat-label" style={{ flex: 1 }}>{s.label}</span>
              </div>
              <div className="pm-stat-value">{s.value}</div>
              <div className="pm-stat-foot" style={{ fontSize: ".68rem" }}>
                <span className={s.trend === "up" ? "pm-trend-up" : "pm-trend-down"}>
                  <i className={`bi ${s.trend === "up" ? "bi-arrow-up-right" : "bi-arrow-down-right"}`} /> {s.delta}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* segment chips */}
      <div className="d-flex gap-2 flex-wrap mb-3">
        {SEGMENTS.map((s) => (
          <button key={s.id} className={`pm-chip d-flex align-items-center gap-1 ${segment === s.id ? "active" : ""}`}
            onClick={() => { setSegment(s.id); setPage(1); }}>
            <i className={`bi ${s.icon}`} style={{ color: segment === s.id ? "#fff" : s.color, fontSize: ".8rem" }} />
            {s.label}
            <span style={{ fontSize: ".66rem", fontWeight: 800, marginLeft: 2 }}>{num(s.count)}</span>
          </button>
        ))}
      </div>

      {/* active filter pills + search */}
      <div className="pm-card">
        <div className="pm-card-head">
          <div className="d-flex gap-2 align-items-center flex-grow-1 flex-wrap">
            <div className="pm-search flex-grow-1" style={{ maxWidth: 380 }}>
              <i className="bi bi-search" />
              <input placeholder="Name, ID, phone, email, county…" value={filters.q}
                onChange={(e) => { setFilters({ ...filters, q: e.target.value }); setPage(1); }} />
              {filters.q && <button className="pm-x p-0" onClick={() => setFilters({ ...filters, q: "" })}><i className="bi bi-x" /></button>}
            </div>
            {activeFilterCount > 0 && (
              <div className="d-flex gap-1 flex-wrap">
                {filters.tier !== "all" && <button className="pm-chip active" onClick={() => setFilters({ ...filters, tier: "all" })}>{filters.tier} ✕</button>}
                {filters.kyc !== "all" && <button className="pm-chip active" onClick={() => setFilters({ ...filters, kyc: "all" })}>{filters.kyc} ✕</button>}
                {filters.status !== "all" && <button className="pm-chip active" onClick={() => setFilters({ ...filters, status: "all" })}>{filters.status} ✕</button>}
                {filters.county !== "all" && <button className="pm-chip active" onClick={() => setFilters({ ...filters, county: "all" })}>{filters.county} ✕</button>}
                {filters.channel !== "all" && <button className="pm-chip active" onClick={() => setFilters({ ...filters, channel: "all" })}>{filters.channel} ✕</button>}
                {filters.tags.map((t) => <button key={t} className="pm-chip active" onClick={() => setFilters({ ...filters, tags: filters.tags.filter((x) => x !== t) })}>{t} ✕</button>)}
                <button className="pm-chip" onClick={() => { setFilters(EMPTY_FILTERS); setSegment("all"); }}>Clear all</button>
              </div>
            )}
          </div>
          <div className="d-flex gap-2 align-items-center">
            <span style={{ fontSize: ".76rem", color: "var(--pm-muted)" }}>{num(filtered.length)} result{filtered.length !== 1 ? "s" : ""}</span>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setSearchOpen(true)}><i className="bi bi-funnel" /></button>
          </div>
        </div>

        {/* bulk bar */}
        {sel.length > 0 && (
          <div className="pm-bulkbar">
            <b style={{ fontSize: ".82rem" }}>{sel.length} selected</b>
            <button className="btn btn-sm btn-light" onClick={() => setBulkOpen(true)}><i className="bi bi-lightning-charge me-1" />Bulk action</button>
            <button className="btn btn-sm btn-light" onClick={() => { csvDownload("selected-users.csv", users.filter((u) => sel.includes(u.id)) as unknown as Record<string, unknown>[]); push({ kind: "success", title: "Selection exported" }); }}>
              <i className="bi bi-download me-1" />Export
            </button>
            <button className="btn btn-sm btn-outline-light ms-auto" onClick={() => setSel([])}>Clear</button>
          </div>
        )}

        {/* table */}
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead>
              <tr>
                <th style={{ width: 34 }}>
                  <input type="checkbox" className="form-check-input" checked={sel.length === paged.length && paged.length > 0}
                    onChange={(e) => setSel(e.target.checked ? paged.map((u) => u.id) : [])} />
                </th>
                {visibleCols.map((c) => c.key === "actions" ? <th key="actions" /> : (
                  <th key={c.key} className={`${c.align === "end" ? "text-end" : ""} ${c.sortable ? "cursor-pointer" : ""}`}
                    onClick={() => c.sortable && sortBy(c.key as keyof User)}>
                    {c.label} {sort.k === c.key && <i className={`bi bi-caret-${sort.dir === 1 ? "up" : "down"}-fill`} style={{ fontSize: ".55rem" }} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((u) => (
                <tr key={u.id} className={sel.includes(u.id) ? "selected" : ""} onClick={() => setUser(u)}>
                  <td onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="form-check-input" checked={sel.includes(u.id)}
                      onChange={(e) => setSel(e.target.checked ? [...sel, u.id] : sel.filter((x) => x !== u.id))} />
                  </td>
                  {visibleCols.map((c) => {
                    if (c.key === "actions") return (
                      <td key="actions" className="text-end" onClick={(e) => e.stopPropagation()}>
                        <Dropdown width={240} up trigger={() => <button className="pm-icon-btn" style={{ width: 28, height: 28 }}><i className="bi bi-three-dots-vertical" /></button>}>
                          {(close) => (<>
                            <DDItem icon="bi-eye" label="View profile" onClick={() => { close(); setUser(u); }} />
                            <DDItem icon="bi-pencil-square" label="Edit profile" onClick={() => { close(); setEditUser(u); }} />
                            <DDItem icon="bi-snow" label={u.status === "Frozen" ? "Unfreeze" : "Freeze"} hint="2FA + reason" onClick={() => { close(); setFreezeUser(u); }} />
                            <DDItem icon="bi-sliders" label="Adjust limits" hint="2FA" onClick={() => { close(); setLimitsUser(u); }} />
                            <DDItem icon="bi-gem" label={u.tier === "VIP" ? "Revoke VIP" : "Grant VIP"} onClick={() => { close(); setVipUser(u); }} />
                            <DDItem icon="bi-incognito" label="Impersonate" hint="Super admin only" onClick={() => { close(); setImpUser(u); }} />
                            <div style={{ height: 1, background: "var(--pm-border)", margin: ".2rem .3rem" }} />
                            <DDItem icon="bi-activity" label="Activity log" onClick={() => { close(); setActivityUser(u); }} />
                            <DDItem icon="bi-shield-exclamation" label="Risk assessment" onClick={() => { close(); setRiskUser(u); }} />
                            <DDItem icon="bi-envelope-paper" label="Send message" onClick={() => { close(); setMsgUser(u); }} />
                            <DDItem icon="bi-shield-check" label="Compliance" onClick={() => { close(); setComplianceUser(u); }} />
                            <DDItem icon="bi-lightbulb" label="Insights" onClick={() => { close(); setInsightsUser(u); }} />
                            <DDItem icon="bi-clock-history" label="Audit trail" onClick={() => { close(); setAuditUser(u); }} />
                            <DDItem icon="bi-bell" label="Notifications" onClick={() => { close(); setNotifUser(u); }} />
                            <DDItem icon="bi-heart-pulse" label="Health score" onClick={() => { close(); setHealthUser(u); }} />
                            <DDItem icon="bi-phone" label="Devices" onClick={() => { close(); setDevicesUser(u); }} />
                            <DDItem icon="bi-file-earmark-text" label="Documents" onClick={() => { close(); setDocsUser(u); }} />
                            <DDItem icon="bi-gear" label="Preferences" onClick={() => { close(); setPrefsUser(u); }} />
                            <DDItem icon="bi-tags" label="Tags" onClick={() => { close(); setTagsUser(u); }} />
                            <DDItem icon="bi-chat-square-text" label="Comms history" onClick={() => { close(); setCommsUser(u); }} />
                            <DDItem icon="bi-box-arrow-right" label="Sessions" onClick={() => { close(); setSessionUser(u); }} />
                            <DDItem icon="bi-key" label="Recovery" onClick={() => { close(); setRecoveryUser(u); }} />
                            <DDItem icon="bi-cash-stack" label="Loans" onClick={() => { close(); setLoanUser(u); }} />
                            <DDItem icon="bi-credit-card" label="Cards" onClick={() => { close(); setCardUser(u); }} />
                            <DDItem icon="bi-diagram-3" label="Referrals" onClick={() => { close(); setReferralUser(u); }} />
                            <DDItem icon="bi-grid-3x3" label="Activity heatmap" onClick={() => { close(); setHeatmapUser(u); }} />
                            <div style={{ height: 1, background: "var(--pm-border)", margin: ".2rem .3rem" }} />
                            <DDItem icon="bi-x-octagon" label="Close account" danger onClick={() => { close(); setCloseUser(u); }} />
                          </>)}
                        </Dropdown>
                      </td>
                    );
                    if (c.key === "name") return (
                      <td key={c.key}><div className="d-flex align-items-center gap-2"><Avatar name={u.name} size="sm" />
                        <div><div className="pm-td-strong">{u.name}</div>
                          <div className="pm-td-sub mono">{u.id} · {u.email}</div></div></div></td>
                    );
                    if (c.key === "phone") return <td key={c.key} className="mono" style={{ fontSize: ".76rem" }}>{u.phone}</td>;
                    if (c.key === "tier") return <td key={c.key}><Badge tone={tierTone(u.tier)}>{u.tier}</Badge></td>;
                    if (c.key === "kyc") return <td key={c.key}><Badge tone={kycTone(u.kyc)}>{u.kyc}</Badge></td>;
                    if (c.key === "status") return <td key={c.key}><Badge tone={statusTone(u.status)} dot>{u.status}</Badge></td>;
                    if (c.key === "balance") return <td key={c.key} className="text-end pm-num" style={{ fontWeight: 700 }}>{kes(u.balance)}</td>;
                    if (c.key === "txn30d") return <td key={c.key} className="text-end pm-num">{num(u.txn30d)}</td>;
                    if (c.key === "volume30d") return <td key={c.key} className="text-end pm-num">{kes(u.volume30d, { compact: true })}</td>;
                    if (c.key === "county") return <td key={c.key} style={{ fontSize: ".78rem" }}>{u.county}</td>;
                    if (c.key === "riskScore") return (
                      <td key={c.key} className="text-end"><div className="d-flex align-items-center gap-2 justify-content-end">
                        <Meter value={u.riskScore} tone={u.riskScore > 70 ? "#f04438" : u.riskScore > 40 ? "#f79009" : "#12b76a"} width={46} />
                        <span className="pm-num">{u.riskScore}</span></div></td>
                    );
                    if (c.key === "joined") return <td key={c.key} style={{ fontSize: ".76rem" }}>{u.joined}</td>;
                    if (c.key === "lastActive") return <td key={c.key} style={{ fontSize: ".76rem" }}>{u.lastActive}</td>;
                    if (c.key === "channel") return <td key={c.key}><Badge tone="grey">{u.channel}</Badge></td>;
                    if (c.key === "device") return <td key={c.key} style={{ fontSize: ".74rem" }}>{u.device}</td>;
                    if (c.key === "cards") return <td key={c.key} className="text-end pm-num">{u.cards}</td>;
                    if (c.key === "loans") return <td key={c.key} className="text-end pm-num">{u.loans}</td>;
                    if (c.key === "referrals") return <td key={c.key} className="text-end pm-num">{u.referrals}</td>;
                    if (c.key === "rm") return <td key={c.key} style={{ fontSize: ".76rem" }}>{u.rm}</td>;
                    return <td key={c.key}>{String((u as any)[c.key])}</td>;
                  })}
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={visibleCols.length + 1}>
                  <EmptyState icon="bi-person-x" title="No users match these filters" body="Try widening your search or clearing the segment."
                    action={<button className="btn btn-outline-secondary btn-sm" onClick={() => { setFilters(EMPTY_FILTERS); setSegment("all"); }}>Clear all filters</button>} />
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageSize={size} total={filtered.length} onPage={setPage} onPageSize={setSize} />
      </div>

      {/* saved views row */}
      <div className="pm-section-head">
        <div><h2>Saved views</h2><p>Quick-recall filter presets shared across the admin team.</p></div>
        <button className="btn btn-primary btn-sm" onClick={() => setSaveViewOpen(true)}><i className="bi bi-bookmark-plus me-1" />Save view</button>
      </div>
      <div className="pm-card mb-4">
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead><tr><th>View</th><th>Filters</th><th className="text-end">Matching users</th><th>Owner</th><th>Shared</th><th /></tr></thead>
            <tbody>
              {views.map((v) => (
                <tr key={v.id} onClick={() => { setViews((vw) => vw.map((x) => x.id === v.id ? x : x)); push({ kind: "success", title: `View "${v.name}" applied` }); }}>
                  <td className="pm-td-strong">{v.name}</td>
                  <td className="mono" style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{v.filters}</td>
                  <td className="text-end pm-num">{num(v.count)}</td>
                  <td style={{ fontSize: ".78rem" }}>{v.owner}</td>
                  <td>{v.shared ? <Badge tone="blue">Shared</Badge> : <Badge tone="grey">Private</Badge>}</td>
                  <td className="text-end" onClick={(e) => e.stopPropagation()}>
                    <Dropdown up width={200} trigger={() => <button className="pm-icon-btn" style={{ width: 28, height: 28 }}><i className="bi bi-three-dots-vertical" /></button>}>
                      {(close) => (<>
                        <DDItem icon="bi-play-fill" label="Apply this view" onClick={() => { close(); push({ kind: "success", title: `View "${v.name}" applied` }); }} />
                        <DDItem icon="bi-pencil" label="Rename" onClick={() => { close(); setRenameView(v); }} />
                        <DDItem icon="bi-trash" label="Delete" danger onClick={() => { close(); setViews((vw) => vw.filter((x) => x.id !== v.id)); push({ kind: "info", title: `"${v.name}" deleted` }); }} />
                      </>)}
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* modals */}
      <UserDrawer user={user} onClose={() => setUser(null)} onFreeze={(u) => { setUser(null); setFreezeUser(u); }}
        onEdit={(u) => { setUser(null); setEditUser(u); }} onAdjustLimits={(u) => { setUser(null); setLimitsUser(u); }}
        onGrantVip={(u) => { setUser(null); setVipUser(u); }} onImpersonate={(u) => { setUser(null); setImpUser(u); }}
        onLoginHistory={(u) => { setUser(null); setLoginHistUser(u); }} onTransactionHistory={(u) => { setUser(null); setTxnHistUser(u); }}
        onCloseAccount={(u) => { setUser(null); setCloseUser(u); }} onActivity={(u) => { setUser(null); setActivityUser(u); }}
        onRisk={(u) => { setUser(null); setRiskUser(u); }} onMessage={(u) => { setUser(null); setMsgUser(u); }}
        onCompliance={(u) => { setUser(null); setComplianceUser(u); }} onInsights={(u) => { setUser(null); setInsightsUser(u); }}
        onAudit={(u) => { setUser(null); setAuditUser(u); }} onNotifications={(u) => { setUser(null); setNotifUser(u); }}
        onHealth={(u) => { setUser(null); setHealthUser(u); }} />
      <EditUserModal user={editUser} onClose={() => setEditUser(null)}
        onSave={(u) => { setUsers((list) => list.map((x) => x.id === u.id ? u : x)); setEditUser(null); }} />
      <FreezeWizard user={freezeUser} onClose={() => setFreezeUser(null)} onDone={handleFreezeResult} />
      <AdjustLimitsWizard user={limitsUser} onClose={() => setLimitsUser(null)} />
      <VipModal user={vipUser} onClose={() => setVipUser(null)} onDone={handleVip} />
      <ImpersonateModal user={impUser} onClose={() => setImpUser(null)} />
      <BulkActionsModal open={bulkOpen} onClose={() => setBulkOpen(false)} count={sel.length}
        onDone={(action) => { push({ kind: "success", title: `${action} applied to ${sel.length} users`, body: "Audit batch BTU-2026-0188 logged." }); setSel([]); }} />
      <ColumnConfigModal open={colsOpen} onClose={() => setColsOpen(false)} columns={cols} onChange={setCols} />
      <SaveViewModal open={saveViewOpen} onClose={() => setSaveViewOpen(false)} currentFilters={filtersStr}
        onSave={(v) => setViews((vw) => [v, ...vw])} />
      <SavedViewsDrawer open={viewsOpen} onClose={() => setViewsOpen(false)} views={views}
        onApply={() => {}} onDelete={(id) => setViews((vw) => vw.filter((x) => x.id !== id))} />
      <ExportUsersModal open={exportOpen} onClose={() => setExportOpen(false)} count={filtered.length} />
      <AdvancedSearchDrawer open={searchOpen} onClose={() => setSearchOpen(false)} filters={filters}
        onApply={(f) => { setFilters(f); setPage(1); }} />
      {loginHistUser && <LoginHistoryModal user={loginHistUser} onClose={() => setLoginHistUser(null)} />}
      {txnHistUser && <TransactionHistoryModal user={txnHistUser} onClose={() => setTxnHistUser(null)} />}
      {closeUser && <CloseAccountModal user={closeUser} onClose={() => setCloseUser(null)} />}
      <BroadcastModal open={broadcastOpen} onClose={() => setBroadcastOpen(false)} count={filtered.length} />
      <RenameViewModal view={renameView} onClose={() => setRenameView(null)} onRename={(id, name) => setViews((vw) => vw.map((v) => v.id === id ? { ...v, name } : v))} />
      {activityUser && <UserActivityModal user={activityUser} onClose={() => setActivityUser(null)} />}
      {riskUser && <RiskAssessmentModal user={riskUser} onClose={() => setRiskUser(null)} />}
      {msgUser && <SendMessageModal user={msgUser} onClose={() => setMsgUser(null)} />}
      {complianceUser && <ComplianceModal user={complianceUser} onClose={() => setComplianceUser(null)} />}
      {insightsUser && <UserInsightsModal user={insightsUser} onClose={() => setInsightsUser(null)} />}
      {auditUser && <UserAuditTrailModal user={auditUser} onClose={() => setAuditUser(null)} />}
      {notifUser && <NotificationConfigModal user={notifUser} onClose={() => setNotifUser(null)} />}
      <SegmentAnalysisModal open={segmentOpen} onClose={() => setSegmentOpen(false)} />
      {healthUser && <UserHealthModal user={healthUser} onClose={() => setHealthUser(null)} />}
      {devicesUser && <UserDevicesModal user={devicesUser} onClose={() => setDevicesUser(null)} />}
      {docsUser && <UserDocumentsModal user={docsUser} onClose={() => setDocsUser(null)} />}
      {prefsUser && <UserPreferencesModal user={prefsUser} onClose={() => setPrefsUser(null)} />}
      {tagsUser && <UserTagsModal user={tagsUser} onClose={() => setTagsUser(null)} />}
      {commsUser && <CommunicationHistoryModal user={commsUser} onClose={() => setCommsUser(null)} />}
      {sessionUser && <SessionManagementModal user={sessionUser} onClose={() => setSessionUser(null)} />}
      {recoveryUser && <AccountRecoveryModal user={recoveryUser} onClose={() => setRecoveryUser(null)} />}
      {loanUser && <LoanDetailsModal user={loanUser} onClose={() => setLoanUser(null)} />}
      {cardUser && <CardManagementModal user={cardUser} onClose={() => setCardUser(null)} />}
      <GeoDistributionModal open={geoOpen} onClose={() => setGeoOpen(false)} />
      {referralUser && <ReferralNetworkModal user={referralUser} onClose={() => setReferralUser(null)} />}
      {heatmapUser && <ActivityHeatmapModal user={heatmapUser} onClose={() => setHeatmapUser(null)} />}
    </>
  );
}
