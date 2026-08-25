import { useMemo, useState } from "react";
import { Avatar, Badge, DDItem, Dropdown, EmptyState, Pagination, useToast } from "../../../components/ui";
import { kes, num } from "../../../lib/format";
import type { ConciergeRequest, FeeExemptionRule, VipAuditEvent, VipClient, VipTier } from "../data/vipData";
import {
  CONCIERGE_REQUESTS, FEE_EXEMPTION_RULES, RELATIONS_MANAGERS, VIP_AUDIT_TRAIL, VIP_CLIENTS,
} from "../data/vipData";
import {
  AdjustVipLimitsWizard, AssignRmModal, BulkVipModal, ConciergeDrawer, CreditLineWizard, ExportVipBookModal,
  FeeExemptionWizard, GrantVipWizard, ImpersonateVipModal, NewConciergeModal, RevokeVipModal, TierMatrixModal,
  VipAuditDrawer, VipDetailDrawer, VipFilterDrawer, EMPTY_VIP_FILTERS, type VipFilters,
} from "../modals/VipModals";

const tierTone = (t: VipTier) => t === "Black" ? "ink" : t === "Diamond" ? "violet" : t === "Platinum" ? "blue" : "amber";
const statusTone = (s: string) => s === "Active" ? "green" : s === "Under Review" ? "amber" : s === "Suspended" ? "red" : "blue";
const priorityTone = (p: string) => p === "Urgent" ? "red" : p === "High" ? "amber" : "grey";

export function VipClients({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  const { push } = useToast();
  void signal;

  const [clients, setClients] = useState<VipClient[]>(VIP_CLIENTS);
  const [concierge, setConcierge] = useState<ConciergeRequest[]>(CONCIERGE_REQUESTS);
  const [feeRules, setFeeRules] = useState<FeeExemptionRule[]>(FEE_EXEMPTION_RULES);
  const [auditTrail, setAuditTrail] = useState<VipAuditEvent[]>(VIP_AUDIT_TRAIL);

  const [q, setQ] = useState("");
  const [tierTab, setTierTab] = useState<string>("All");
  const [filters, setFilters] = useState<VipFilters>(EMPTY_VIP_FILTERS);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [sort, setSort] = useState<{ key: keyof VipClient; dir: 1 | -1 }>({ key: "balance", dir: -1 });

  /* Modal state */
  const [detailClient, setDetailClient] = useState<VipClient | null>(null);
  const [grantWizard, setGrantWizard] = useState<VipClient | null>(null);
  const [grantOpen, setGrantOpen] = useState(false);
  const [revokeClient, setRevokeClient] = useState<VipClient | null>(null);
  const [limitsClient, setLimitsClient] = useState<VipClient | null>(null);
  const [assignRmClient, setAssignRmClient] = useState<VipClient | null>(null);
  const [feeWaiverClient, setFeeWaiverClient] = useState<VipClient | null>(null);
  const [conciergeReq, setConciergeReq] = useState<ConciergeRequest | null>(null);
  const [newConciergeOpen, setNewConciergeOpen] = useState(false);
  const [tierMatrixOpen, setTierMatrixOpen] = useState(false);
  const [creditWizardClient, setCreditWizardClient] = useState<VipClient | null>(null);
  const [impersonateClient, setImpersonateClient] = useState<VipClient | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  /* Derived data */
  const totalBookValue = useMemo(() => clients.reduce((sum, c) => sum + c.balance, 0), [clients]);
  const totalMonthlyVol = useMemo(() => clients.reduce((sum, c) => sum + c.monthlyVolume, 0), [clients]);

  const filteredClients = useMemo(() => {
    let rows = clients;
    if (tierTab !== "All") rows = rows.filter((c) => c.tier === tierTab);
    if (q) rows = rows.filter((c) => (c.name + c.id + c.company + c.phone + c.county + c.rm).toLowerCase().includes(q.toLowerCase()));
    if (filters.tier !== "all") rows = rows.filter((c) => c.tier === filters.tier);
    if (filters.status !== "all") rows = rows.filter((c) => c.status === filters.status);
    if (filters.rm !== "all") rows = rows.filter((c) => c.rm === filters.rm);
    if (filters.feeExemptOnly) rows = rows.filter((c) => c.feeExempt);

    return [...rows].sort((a, b) => {
      const av = a[sort.key] ?? 0;
      const bv = b[sort.key] ?? 0;
      return (typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv))) * sort.dir;
    });
  }, [clients, tierTab, q, filters, sort]);

  const pagedClients = filteredClients.slice((page - 1) * pageSize, page * pageSize);

  const sortBy = (key: keyof VipClient) => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : -1 }));

  /* Action Handlers */
  const handleGrantVipDone = (tier: VipTier, rmName: string, feeExempt: boolean) => {
    if (!grantWizard) return;
    setClients((list) => list.map((c) => c.id === grantWizard.id ? {
      ...c,
      tier,
      rm: rmName,
      feeExempt,
      feeDiscountPct: feeExempt ? 100 : 50,
    } : c));
    setAuditTrail((prev) => [{
      id: `VPA-${Math.floor(810 + Math.random() * 50)}`,
      time: "Just now",
      admin: "Jeckonia Kwasa",
      action: "Updated VIP Governance",
      vipName: grantWizard.name,
      details: `Tier set to ${tier}, assigned RM ${rmName}.`,
    }, ...prev]);
  };

  const handleRevokeDone = (c: VipClient) => {
    setClients((list) => list.map((x) => x.id === c.id ? { ...x, tier: "Gold", feeExempt: false, feeDiscountPct: 0 } : x));
  };

  const handleAssignRmDone = (c: VipClient, newRm: string) => {
    setClients((list) => list.map((x) => x.id === c.id ? { ...x, rm: newRm } : x));
  };

  const handleFeeWaiverDone = (rule: FeeExemptionRule) => {
    setFeeRules((prev) => [rule, ...prev]);
    setClients((list) => list.map((c) => c.id === rule.vipId ? { ...c, feeExempt: rule.discountType === "Full Waiver", feeDiscountPct: rule.discountValue } : c));
  };

  const handleResolveConcierge = (id: string, responseNote: string) => {
    setConcierge((prev) => prev.map((r) => r.id === id ? { ...r, status: "Resolved", slaHoursLeft: 0 } : r));
    push({ kind: "success", title: `Concierge Task ${id} Resolved`, body: responseNote });
  };

  return (
    <>
      {/* 1. Header Bar */}
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="d-flex gap-2 align-items-center mb-1">
            <span className="pm-eyebrow">User Management · Page 8</span>
            <Badge tone="violet"><i className="bi bi-gem me-1" />VIP Concierge Active</Badge>
          </div>
          <h2>VIP Clients & Private Wealth Book</h2>
          <p>High-touch client management — relationship managers, 100% fee waivers, custom limit overrides, corporate float lines, and 24/7 concierge request queue.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setFilterOpen(true)}>
            <i className="bi bi-funnel me-1" />Filters
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setTierMatrixOpen(true)}>
            <i className="bi bi-grid-3x3 me-1" />Tier Matrix
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setAuditOpen(true)}>
            <i className="bi bi-clock-history me-1" />Audit Trail
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setExportOpen(true)}>
            <i className="bi bi-download me-1" />Export Book
          </button>
          <Dropdown width={220} trigger={() => <button className="btn btn-outline-secondary btn-sm"><i className="bi bi-three-dots" /></button>}>
            {(close) => (
              <>
                <div className="pm-dd-head">VIP Tools</div>
                <DDItem icon="bi-plus-circle" label="Log Concierge Task" onClick={() => { close(); setNewConciergeOpen(true); }} />
                <DDItem icon="bi-sliders" label="Tier Perks Matrix" onClick={() => { close(); setTierMatrixOpen(true); }} />
                <DDItem icon="bi-person-badge" label="Open User Directory (Page 4)" onClick={() => { close(); onNavigate("user-directory"); }} />
                <DDItem icon="bi-person-vcard" label="Open User Detail (Page 5)" onClick={() => { close(); onNavigate("user-detail"); }} />
              </>
            )}
          </Dropdown>
          <button className="btn btn-primary btn-sm" onClick={() => { setGrantWizard(clients[0]); setGrantOpen(true); }}>
            <i className="bi bi-gem me-1" />Manage VIP Tier
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="row g-2 mb-3">
        <div className="col-6 col-md-3">
          <div className="pm-stat">
            <div className="d-flex align-items-center gap-2">
              <span className="pm-stat-ico" style={{ background: "#f4f1ff", color: "#5925dc" }}><i className="bi bi-safe2" /></span>
              <span className="pm-stat-label">Total VIP Book Value</span>
            </div>
            <div className="pm-stat-value">{kes(totalBookValue, { compact: true })}</div>
            <div className="pm-stat-foot">Across {clients.length} VIP portfolios</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="pm-stat">
            <div className="d-flex align-items-center gap-2">
              <span className="pm-stat-ico" style={{ background: "#e7f8ef", color: "#0b8f52" }}><i className="bi bi-graph-up-arrow" /></span>
              <span className="pm-stat-label">Monthly VIP Volume</span>
            </div>
            <div className="pm-stat-value">{kes(totalMonthlyVol, { compact: true })}</div>
            <div className="pm-stat-foot">+14.8% vs last month</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="pm-stat">
            <div className="d-flex align-items-center gap-2">
              <span className="pm-stat-ico" style={{ background: "#eff8ff", color: "#175cd3" }}><i className="bi bi-headset" /></span>
              <span className="pm-stat-label">Concierge Tasks</span>
            </div>
            <div className="pm-stat-value">{concierge.filter((c) => c.status !== "Resolved").length} Open</div>
            <div className="pm-stat-foot">Avg resolution 1.4 hours</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="pm-stat">
            <div className="d-flex align-items-center gap-2">
              <span className="pm-stat-ico" style={{ background: "#fff5e6", color: "#b54708" }}><i className="bi bi-person-check" /></span>
              <span className="pm-stat-label">Active RMs</span>
            </div>
            <div className="pm-stat-value">{RELATIONS_MANAGERS.length} Dedicated</div>
            <div className="pm-stat-foot">100% SLA compliance</div>
          </div>
        </div>
      </div>

      {/* 3. RM Portfolio Workload Section */}
      <div className="pm-section-head">
        <div><h2>Relationship Managers & Portfolio Load</h2><p>Assigned RM leads across Private Wealth, Corporate, and Merchant portfolios.</p></div>
      </div>
      <div className="row g-2 mb-3">
        {RELATIONS_MANAGERS.map((m) => (
          <div className="col-12 col-md-6 col-xl-3" key={m.id}>
            <div className="pm-card pm-card-pad h-100">
              <div className="d-flex align-items-center gap-2 mb-2">
                <Avatar name={m.name} size="sm" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: ".85rem" }}>{m.name}</div>
                  <div style={{ fontSize: ".7rem", color: "var(--pm-muted)" }}>{m.title}</div>
                </div>
              </div>
              <div className="pm-kv"><span className="k">Book Value</span><span className="v">{kes(m.totalBookValue, { compact: true })}</span></div>
              <div className="pm-kv"><span className="k">Assigned VIPs</span><span className="v">{m.clientsCount} clients</span></div>
              <div className="pm-kv"><span className="k">CSAT Rating</span><span className="v">⭐ {m.satisfactionScore} / 5.0</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. VIP Client Book Table */}
      <div className="pm-section-head">
        <div><h2>VIP Client Directory</h2><p>Searchable client book with balance, volume, assigned RM, fee status and controls.</p></div>
        {selected.length > 0 && (
          <button className="btn btn-outline-primary btn-sm" onClick={() => setBulkOpen(true)}>
            <i className="bi bi-lightning-charge me-1" />Bulk Action ({selected.length})
          </button>
        )}
      </div>

      <div className="pm-card mb-3">
        <div className="pm-tabs">
          {["All", "Black", "Diamond", "Platinum", "Gold"].map((t) => (
            <button key={t} className={`pm-tab ${tierTab === t ? "active" : ""}`} onClick={() => { setTierTab(t); setPage(1); }}>
              {t === "All" ? "All VIP Tiers" : `${t} Tier`}
              <span className="cnt">{t === "All" ? clients.length : clients.filter((c) => c.tier === t).length}</span>
            </button>
          ))}
        </div>

        <div className="pm-card-head">
          <div className="pm-search flex-grow-1" style={{ maxWidth: 380 }}>
            <i className="bi bi-search" />
            <input placeholder="Search VIP name, company, phone, RM..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          </div>
          <div className="d-flex gap-2">
            <span style={{ fontSize: ".76rem", color: "var(--pm-muted)", alignSelf: "center" }}>{num(filteredClients.length)} VIPs</span>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setFilterOpen(true)}><i className="bi bi-funnel" /></button>
          </div>
        </div>

        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead>
              <tr>
                <th style={{ width: 34 }}>
                  <input type="checkbox" className="form-check-input" checked={selected.length === pagedClients.length && pagedClients.length > 0}
                    onChange={(e) => setSelected(e.target.checked ? pagedClients.map((c) => c.id) : [])} />
                </th>
                <th className="cursor-pointer" onClick={() => sortBy("name")}>VIP Client {sort.key === "name" && <i className={`bi bi-caret-${sort.dir === 1 ? "up" : "down"}-fill`} />}</th>
                <th>Tier</th>
                <th className="text-end cursor-pointer" onClick={() => sortBy("balance")}>Balance {sort.key === "balance" && <i className={`bi bi-caret-${sort.dir === 1 ? "up" : "down"}-fill`} />}</th>
                <th className="text-end cursor-pointer" onClick={() => sortBy("monthlyVolume")}>Monthly Vol {sort.key === "monthlyVolume" && <i className={`bi bi-caret-${sort.dir === 1 ? "up" : "down"}-fill`} />}</th>
                <th>RM Lead</th>
                <th>Fee Exemption</th>
                <th>Credit Line</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {pagedClients.map((c) => (
                <tr key={c.id} className={selected.includes(c.id) ? "selected" : ""} onClick={() => setDetailClient(c)}>
                  <td onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="form-check-input" checked={selected.includes(c.id)}
                      onChange={(e) => setSelected(e.target.checked ? [...selected, c.id] : selected.filter((x) => x !== c.id))} />
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <Avatar name={c.name} size="sm" />
                      <div>
                        <div className="pm-td-strong">{c.name}</div>
                        <div className="pm-td-sub mono">{c.company ?? c.id} · {c.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td><Badge tone={tierTone(c.tier)}>{c.tier}</Badge></td>
                  <td className="text-end pm-num" style={{ fontWeight: 700, color: "var(--pm-green-dark)" }}>{kes(c.balance, { compact: true })}</td>
                  <td className="text-end pm-num">{kes(c.monthlyVolume, { compact: true })}</td>
                  <td style={{ fontSize: ".78rem" }}>{c.rm}</td>
                  <td>{c.feeExempt ? <Badge tone="green">100% Exempt</Badge> : <Badge tone="grey">{c.feeDiscountPct}% Off</Badge>}</td>
                  <td className="pm-num" style={{ fontSize: ".78rem" }}>{kes(c.creditLine, { compact: true })}</td>
                  <td><Badge tone={statusTone(c.status)} dot>{c.status}</Badge></td>
                  <td className="text-end" onClick={(e) => e.stopPropagation()}>
                    <Dropdown up width={240} trigger={() => <button className="pm-icon-btn" style={{ width: 28, height: 28 }}><i className="bi bi-three-dots-vertical" /></button>}>
                      {(close) => (
                        <>
                          <DDItem icon="bi-eye" label="View 360° VIP Profile" onClick={() => { close(); setDetailClient(c); }} />
                          <DDItem icon="bi-gem" label="Manage Tier & RM" onClick={() => { close(); setGrantWizard(c); setGrantOpen(true); }} />
                          <DDItem icon="bi-person-badge" label="Reassign RM" onClick={() => { close(); setAssignRmClient(c); }} />
                          <DDItem icon="bi-percent" label="Fee Exemption Rule" onClick={() => { close(); setFeeWaiverClient(c); }} />
                          <DDItem icon="bi-sliders" label="Override Limits" onClick={() => { close(); setLimitsClient(c); }} />
                          <DDItem icon="bi-cash-coin" label="Credit Line / Float Line" onClick={() => { close(); setCreditWizardClient(c); }} />
                          <DDItem icon="bi-incognito" label="Impersonate Console" hint="Super Admin 2FA" onClick={() => { close(); setImpersonateClient(c); }} />
                          <div className="pm-dd-sep" />
                          <DDItem icon="bi-shield-x" label="Revoke VIP Status" danger onClick={() => { close(); setRevokeClient(c); }} />
                        </>
                      )}
                    </Dropdown>
                  </td>
                </tr>
              ))}
              {pagedClients.length === 0 && (
                <tr>
                  <td colSpan={10}>
                    <EmptyState icon="bi-gem" title="No VIP clients match filters" body="Try resetting search or filters." action={<button className="btn btn-outline-secondary btn-sm" onClick={() => { setQ(""); setTierTab("All"); setFilters(EMPTY_VIP_FILTERS); }}>Reset Filters</button>} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageSize={pageSize} total={filteredClients.length} onPage={setPage} onPageSize={setPageSize} />
      </div>

      {/* 5. Concierge Queue Section */}
      <div className="pm-section-head">
        <div><h2>Concierge Task Queue</h2><p>Priority support and custom requests for VIP clients.</p></div>
        <button className="btn btn-sm btn-primary" onClick={() => setNewConciergeOpen(true)}>
          <i className="bi bi-plus-lg me-1" />New Concierge Task
        </button>
      </div>

      <div className="pm-card mb-3">
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead>
              <tr>
                <th>Task ID</th>
                <th>VIP Client</th>
                <th>Category</th>
                <th>Subject</th>
                <th>Priority</th>
                <th>SLA Clock</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {concierge.map((r) => (
                <tr key={r.id} onClick={() => setConciergeReq(r)}>
                  <td className="mono pm-td-strong">{r.id}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ fontWeight: 700 }}>{r.vipName}</span>
                      <Badge tone={tierTone(r.tier)}>{r.tier}</Badge>
                    </div>
                  </td>
                  <td><Badge tone="grey">{r.category}</Badge></td>
                  <td style={{ fontSize: ".82rem", fontWeight: 600 }}>{r.subject}</td>
                  <td><Badge tone={priorityTone(r.priority)}>{r.priority}</Badge></td>
                  <td style={{ fontSize: ".76rem" }}>{r.slaHoursLeft > 0 ? `${r.slaHoursLeft}h remaining` : <span className="text-danger font-weight-bold">SLA Breached</span>}</td>
                  <td><Badge tone={r.status === "Resolved" ? "green" : "amber"} dot>{r.status}</Badge></td>
                  <td className="text-end" onClick={(e) => e.stopPropagation()}>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => setConciergeReq(r)}>Resolve</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Active Fee Exemption Rules */}
      <div className="pm-section-head">
        <div><h2>Active Fee Exemption Rules</h2><p>Custom waivers & fee discounts approved for VIP clients.</p></div>
      </div>
      <div className="pm-card mb-4">
        <div className="pm-table-wrap">
          <table className="pm-table">
            <thead>
              <tr>
                <th>Rule ID</th>
                <th>VIP Client</th>
                <th>Payment Rail</th>
                <th>Exemption Type</th>
                <th>Discount Value</th>
                <th>Expiry Date</th>
                <th>Approved By</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {feeRules.map((r) => (
                <tr key={r.id}>
                  <td className="mono pm-td-strong">{r.id}</td>
                  <td>{r.vipName}</td>
                  <td><Badge tone="blue">{r.rail}</Badge></td>
                  <td>{r.discountType}</td>
                  <td className="pm-num" style={{ fontWeight: 700, color: "var(--pm-green-dark)" }}>{r.discountValue === 100 ? "100% Free" : `${r.discountValue}% Off`}</td>
                  <td>{r.expiresAt}</td>
                  <td style={{ fontSize: ".76rem" }}>{r.approvedBy}</td>
                  <td><Badge tone="green" dot>{r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* All Integrated Modals & Drawers */}
      <VipDetailDrawer
        client={detailClient}
        onClose={() => setDetailClient(null)}
        onGrantVip={(c) => { setDetailClient(null); setGrantWizard(c); setGrantOpen(true); }}
        onAdjustLimits={(c) => { setDetailClient(null); setLimitsClient(c); }}
        onAssignRm={(c) => { setDetailClient(null); setAssignRmClient(c); }}
        onFeeWaiver={(c) => { setDetailClient(null); setFeeWaiverClient(c); }}
        onImpersonate={(c) => { setDetailClient(null); setImpersonateClient(c); }}
      />

      <GrantVipWizard
        client={grantWizard}
        open={grantOpen}
        onClose={() => { setGrantOpen(false); setGrantWizard(null); }}
        onDone={handleGrantVipDone}
      />

      <RevokeVipModal
        client={revokeClient}
        open={Boolean(revokeClient)}
        onClose={() => setRevokeClient(null)}
        onDone={handleRevokeDone}
      />

      <AdjustVipLimitsWizard
        client={limitsClient}
        open={Boolean(limitsClient)}
        onClose={() => setLimitsClient(null)}
        onDone={() => {}}
      />

      <AssignRmModal
        client={assignRmClient}
        open={Boolean(assignRmClient)}
        onClose={() => setAssignRmClient(null)}
        onDone={handleAssignRmDone}
      />

      <FeeExemptionWizard
        client={feeWaiverClient}
        open={Boolean(feeWaiverClient)}
        onClose={() => setFeeWaiverClient(null)}
        onDone={handleFeeWaiverDone}
      />

      <ConciergeDrawer
        req={conciergeReq}
        onClose={() => setConciergeReq(null)}
        onResolve={handleResolveConcierge}
      />

      <NewConciergeModal
        open={newConciergeOpen}
        onClose={() => setNewConciergeOpen(false)}
        onCreate={(newReq) => setConcierge((prev) => [newReq, ...prev])}
      />

      <TierMatrixModal
        open={tierMatrixOpen}
        onClose={() => setTierMatrixOpen(false)}
      />

      <CreditLineWizard
        client={creditWizardClient}
        open={Boolean(creditWizardClient)}
        onClose={() => setCreditWizardClient(null)}
        onDone={(amount) => {
          if (creditWizardClient) {
            setClients((prev) => prev.map((c) => c.id === creditWizardClient.id ? { ...c, creditLine: amount } : c));
          }
        }}
      />

      <ImpersonateVipModal
        client={impersonateClient}
        open={Boolean(impersonateClient)}
        onClose={() => setImpersonateClient(null)}
      />

      <ExportVipBookModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        rows={filteredClients}
      />

      <BulkVipModal
        open={bulkOpen}
        count={selected.length}
        onClose={() => setBulkOpen(false)}
        onDone={(action) => {
          if (action === "fee-waiver") {
            setClients((prev) => prev.map((c) => selected.includes(c.id) ? { ...c, feeExempt: true, feeDiscountPct: 100 } : c));
          }
          setSelected([]);
        }}
      />

      <VipAuditDrawer
        open={auditOpen}
        onClose={() => setAuditOpen(false)}
        auditTrail={auditTrail}
      />

      <VipFilterDrawer
        open={filterOpen}
        filters={filters}
        onClose={() => setFilterOpen(false)}
        onApply={(f) => { setFilters(f); setPage(1); }}
      />
    </>
  );
}
