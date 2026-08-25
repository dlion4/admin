import { useEffect, useState } from "react";
import { Badge, DDItem, Dropdown, EmptyState, Pagination, useToast } from "../../../components/ui";
import { csvDownload } from "../../../lib/format";
import type { Campaign, ChangeRequest, ChurnRow, ConfigSetting, FailedPayment, LifecycleStage, Mandate, Offer, Plan, RecurringAudit, Service } from "../data/recurringData";
import { ANALYTICS, CAMPAIGNS, CHURN, CONFIG, FAILED, LIFECYCLE, MANDATES, OFFERS, PLANS, RECUR_AUDIT, REQUESTS, SERVICES, RECUR_KPI } from "../data/recurringData";
import {
  ApproveModal, AuditDrawer, BulkRetryModal, CampaignABModal, CampaignEditModal, CampaignStatusModal, CampaignWizard, ChurnActionModal, ChurnDrawer,
  ConfigDrawer, ConfigEditModal, DeleteConfirmModal, DunningDrawer, ExportModal, FailedDrawer, GraceModal, LifecycleDrawer, MandateAmountModal,
  MandateBillingDayModal, MandateCancelModal, MandateDrawer, MandatePauseModal, MandateSkipModal, MandateWizard, MandatesDrawer, MarkRecoveredModal,
  NewRequestModal, OfferModal, PermissionsDrawer, PlanCloneModal, PlanEditModal, PlanPriceModal, PlanRetireModal, PlanStatusModal, PlanWizard, PlansDrawer,
  ProrationModal, RejectModal, RequestDetailModal, RequestsDrawer, RetryNowModal, ServiceDrawer, ServiceEditModal, ServiceFreezeModal, ServicePauseModal,
  statusTone, svcName,
} from "../modals/RecurringModals";

const TABS = [
  { id: "services", label: "Services", icon: "bi-grid" },
  { id: "plans", label: "Plans", icon: "bi-collection" },
  { id: "mandates", label: "Mandates", icon: "bi-arrow-repeat" },
  { id: "failed", label: "Failed queue", icon: "bi-exclamation-triangle" },
  { id: "dunning", label: "Dunning", icon: "bi-megaphone" },
  { id: "churn", label: "Churn & retention", icon: "bi-person-dash" },
  { id: "lifecycle", label: "Lifecycle", icon: "bi-signpost-split" },
  { id: "config", label: "Configuration", icon: "bi-sliders" },
  { id: "approvals", label: "Approvals", icon: "bi-hourglass-split" },
] as const;

const fmtK = (n: number) => (n >= 1e6 ? `KES ${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `KES ${(n / 1e3).toFixed(0)}K` : `KES ${n}`);

export function RecurringServices({
  signal, onNavigate,
}: {
  signal: { action: string; n: number };
  onNavigate: (id: string) => void;
}) {
  const { push } = useToast();

  /* ---------------- live state ---------------- */
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [plans, setPlans] = useState<Plan[]>(PLANS);
  const [mandates, setMandates] = useState<Mandate[]>(MANDATES);
  const [failed, setFailed] = useState<FailedPayment[]>(FAILED);
  const [campaigns, setCampaigns] = useState<Campaign[]>(CAMPAIGNS);
  const [churn, setChurn] = useState<ChurnRow[]>(CHURN);
  const [offers, setOffers] = useState<Offer[]>(OFFERS);
  const [stages] = useState<LifecycleStage[]>(LIFECYCLE);
  const [config, setConfig] = useState<ConfigSetting[]>(CONFIG);
  const [requests, setRequests] = useState<ChangeRequest[]>(REQUESTS);
  const [audit, setAudit] = useState<RecurringAudit[]>(RECUR_AUDIT);

  const logAudit = (area: string, change: string, from: string, to: string, reason: string) =>
    setAudit((a) => [{ id: `REA-${2188 + a.length - RECUR_AUDIT.length}`, date: "Aug 23 · now", admin: "Jeckonia Kwasa", area, change, from, to, reason }, ...a]);

  const fileCR = (subject: string, from: string, to: string, reason: string, risk: "Low" | "Medium" | "High") => {
    setRequests((rs) => [{ id: `RRC-${3304 + rs.length - REQUESTS.length}`, subject, from, to, requestedBy: "Jeckonia Kwasa", requestedAt: "Aug 23 · now", status: "Pending", risk, reason, approvals: [{ role: "Risk", who: "V. Kiprop", state: "Pending" }, { role: "Product", who: "P. Wanjiru", state: "Pending" }, { role: "Super Admin", who: "J. Mwangi", state: "Pending" }] }, ...rs]);
  };

  /* ---------------- tab + table state ---------------- */
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("services");
  const [q, setQ] = useState("");
  const [chip, setChip] = useState("All");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  useEffect(() => { setPage(1); }, [q, chip, tab]);
  useEffect(() => { if (signal.n > 0 && signal.action === "export") setExportOpen(true); }, [signal]);

  /* ---------------- modal state ---------------- */
  const [svcDrawer, setSvcDrawer] = useState<Service | null>(null);
  const [svcPause, setSvcPause] = useState<Service | null>(null);
  const [svcFreeze, setSvcFreeze] = useState<Service | null>(null);
  const [svcEdit, setSvcEdit] = useState<Service | null>(null);
  const [plansDrawer, setPlansDrawer] = useState(false);
  const [planWizard, setPlanWizard] = useState(false);
  const [planPreset, setPlanPreset] = useState<Service | null>(null);
  const [planEdit, setPlanEdit] = useState<Plan | null>(null);
  const [planPrice, setPlanPrice] = useState<Plan | null>(null);
  const [planStatus, setPlanStatus] = useState<Plan | null>(null);
  const [planClone, setPlanClone] = useState<Plan | null>(null);
  const [planRetire, setPlanRetire] = useState<Plan | null>(null);
  const [mandatesDrawer, setMandatesDrawer] = useState(false);
  const [mandDrawer, setMandDrawer] = useState<Mandate | null>(null);
  const [mandWizard, setMandWizard] = useState(false);
  const [mandPause, setMandPause] = useState<Mandate | null>(null);
  const [mandCancel, setMandCancel] = useState<Mandate | null>(null);
  const [mandSkip, setMandSkip] = useState<Mandate | null>(null);
  const [mandAmount, setMandAmount] = useState<Mandate | null>(null);
  const [mandBillingDay, setMandBillingDay] = useState<Mandate | null>(null);
  const [failedDrawer, setFailedDrawer] = useState(false);
  const [retryTarget, setRetryTarget] = useState<FailedPayment | null>(null);
  const [recoveredTarget, setRecoveredTarget] = useState<FailedPayment | null>(null);
  const [graceTarget, setGraceTarget] = useState<FailedPayment | null>(null);
  const [bulkRetryPicked, setBulkRetryPicked] = useState<string[] | null>(null);
  const [dunningDrawer, setDunningDrawer] = useState(false);
  const [campWizard, setCampWizard] = useState(false);
  const [campEdit, setCampEdit] = useState<Campaign | null>(null);
  const [campStatus, setCampStatus] = useState<Campaign | null>(null);
  const [campAB, setCampAB] = useState<Campaign | null>(null);
  const [churnDrawer, setChurnDrawer] = useState(false);
  const [churnAction, setChurnAction] = useState<ChurnRow | null>(null);
  const [offerModal, setOfferModal] = useState<Offer | null>(null);
  const [offerOpen, setOfferOpen] = useState(false);
  const [lifecycleDrawer, setLifecycleDrawer] = useState(false);
  const [configDrawer, setConfigDrawer] = useState(false);
  const [configEdit, setConfigEdit] = useState<ConfigSetting | null>(null);
  const [proration, setProration] = useState(false);
  const [requestsDrawer, setRequestsDrawer] = useState(false);
  const [reqDetail, setReqDetail] = useState<ChangeRequest | null>(null);
  const [approveTarget, setApproveTarget] = useState<ChangeRequest | null>(null);
  const [rejectTarget, setRejectTarget] = useState<ChangeRequest | null>(null);
  const [newRequest, setNewRequest] = useState(false);
  const [auditDrawer, setAuditDrawer] = useState(false);
  const [permDrawer, setPermDrawer] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ kind: string; id: string; name: string; hint?: string } | null>(null);

  /* ---------------- derived ---------------- */
  const pending = requests.filter((r) => r.status === "Pending");
  const kpi = RECUR_KPI({ services, mandates, failed, pending: pending.length, campaigns });
  const openFailed = failed.filter((f) => f.status === "Retry pending" || f.status === "Grace");
  const svcMeta = (id: string) => services.find((s) => s.id === id);
  const planMeta = (id: string) => plans.find((p) => p.id === id);

  const mandFiltered = mandates.filter((m) => {
    const hitQ = !q || `${m.id} ${m.user} ${m.phone} ${svcName(m.serviceId)}`.toLowerCase().includes(q.toLowerCase());
    const hitC = chip === "All" || m.status === chip;
    return hitQ && hitC;
  });
  const mandPage = mandFiltered.slice((page - 1) * pageSize, page * pageSize);
  const failedFiltered = chip === "All" ? failed : chip === "Open" ? openFailed : failed.filter((f) => f.status === chip);
  const failedPage = failedFiltered.slice((page - 1) * pageSize, page * pageSize);

  /* ---------------- helpers ---------------- */
  const syntheticMandate = (f: FailedPayment): Mandate => ({
    id: f.mandateId, user: f.user, phone: "—", serviceId: f.serviceId, planId: plans.find((p) => p.serviceId === f.serviceId)?.id ?? "plan-premium",
    amount: f.amount, frequency: "Monthly", billingDay: "—", next: f.nextRetry,
    status: f.status === "Recovered" ? "Active" : f.status === "Cancelled" ? "Cancelled" : f.status === "Paused" ? "Paused" : "Retry pending",
    retries: f.retries, started: "—", tenureMo: 0, ltv: 0, channel: f.channel, failingSince: f.failedAt, history: [{ when: f.failedAt, what: `Charge failed — ${f.reason}`, state: "Failed" }],
  });
  const openMandateFromFailure = (f: FailedPayment) => { const m = mandates.find((x) => x.id === f.mandateId) ?? syntheticMandate(f); setMandDrawer(m); };
  const syntheticFailure = (m: Mandate): FailedPayment => ({
    id: failed.find((f) => f.mandateId === m.id)?.id ?? `FPD-9${m.id.slice(-3)}`, mandateId: m.id, user: m.user, serviceId: m.serviceId,
    amount: m.amount, reason: failed.find((f) => f.mandateId === m.id)?.reason ?? "Manual retry", retries: m.retries, maxRetries: 3,
    nextRetry: "now", status: "Retry pending", failedAt: "Aug 23 · now", channel: m.channel, dunningStage: Math.min(m.retries, 3),
  });

  /* ---------------- service handlers ---------------- */
  const doServicePause = (id: string, pause: boolean, reason: string) => {
    const s = svcMeta(id);
    setServices((ss) => ss.map((x) => (x.id === id ? { ...x, status: pause ? "Paused" : "Active" } : x)));
    setMandates((ms) => ms.map((m) => (m.serviceId === id && m.status !== "Cancelled" ? { ...m, status: pause ? "Paused" : (m.status === "Paused" && (!m.autoResume || m.autoResume === "On service resume") ? "Active" : m.status), autoResume: pause ? "On service resume" : undefined } : m)));
    logAudit("Services", `${s?.name ?? id} ${pause ? "paused" : "resumed"}`, pause ? "Active" : "Paused", pause ? "Paused" : "Active", reason);
  };
  const doServiceFreeze = (id: string, freeze: boolean, reason: string) => {
    const s = svcMeta(id);
    setServices((ss) => ss.map((x) => (x.id === id ? { ...x, signupsFrozen: freeze || undefined } : x)));
    logAudit("Services", `${s?.name ?? id} signups ${freeze ? "frozen" : "reopened"}`, freeze ? "open" : "frozen", freeze ? "frozen" : "open", reason);
  };
  const doServiceEdit = (id: string, owner: string, note: string) => {
    setServices((ss) => ss.map((x) => (x.id === id ? { ...x, owner, note } : x)));
    logAudit("Services", `${svcName(id)} details edited`, "", "saved", "Super Admin edit");
  };

  /* ---------------- plan handlers ---------------- */
  const doPlanAdd = (name: string, serviceId: string, price: number, billing: string, features: string, trialDays: number, proration: boolean, reason: string) => {
    setPlans((ps) => [{ id: `plan-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 18)}-${ps.length + 1}`, name, serviceId, price, billing: billing as Plan["billing"], features: features.split(",").map((f) => f.trim()).filter(Boolean), subscribers: 0, mrr: 0, status: "Draft", trialDays, proration, changed: `Aug 23 · J. Mwangi` }, ...ps]);
    logAudit("Plans", `${name} created (draft)`, "—", `KES ${price.toLocaleString("en-KE")} ${billing.toLowerCase()}`, reason);
  };
  const doPlanEdit = (id: string, features: string[], trialDays: number, proration: boolean) => {
    const p = planMeta(id);
    setPlans((ps) => ps.map((x) => (x.id === id ? { ...x, features, trialDays, proration, changed: "Aug 23 · J. Mwangi" } : x)));
    logAudit("Plans", `${p?.name ?? id} edited`, p?.features.join(", ") ?? "—", features.join(", "), "Super Admin edit");
  };
  const doPlanPrice = (id: string, newPrice: number, effective: string, reason: string) => {
    const p = planMeta(id);
    fileCR(`${p!.name} price`, `KES ${p!.price.toLocaleString("en-KE")}`, `KES ${newPrice.toLocaleString("en-KE")}`, `${reason} · effective: ${effective}`, newPrice > p!.price * 1.5 ? "High" : "Medium");
    logAudit("Plans", `${p!.name} price CR filed`, `KES ${p!.price.toLocaleString("en-KE")}`, `KES ${newPrice.toLocaleString("en-KE")}`, reason);
  };
  const doPlanStatus = (id: string, activate: boolean, notify: boolean, reason: string) => {
    const p = planMeta(id);
    setPlans((ps) => ps.map((x) => (x.id === id ? { ...x, status: activate ? "Active" : "Paused", changed: "Aug 23 · J. Mwangi" } : x)));
    logAudit("Plans", `${p?.name ?? id} ${activate ? "activated" : "paused"}`, activate ? "Paused/Draft" : "Active", activate ? "Active" : "Paused", `${reason}${notify ? " · subscribers notified" : ""}`);
  };
  const doPlanClone = (id: string) => {
    const p = planMeta(id);
    setPlans((ps) => [{ ...(p as Plan), id: `plan-clone-${ps.length + 1}`, name: `${p!.name} (copy)`, subscribers: 0, mrr: 0, status: "Draft", changed: "Aug 23 · J. Mwangi" }, ...ps]);
    logAudit("Plans", `${p!.name} cloned`, p!.id, "new draft", "Super Admin clone");
  };
  const doPlanRetire = (id: string, migrateTo: string, reason: string) => {
    const p = planMeta(id);
    const migrate = planMeta(migrateTo);
    if (migrate && p) {
      setPlans((ps) => ps.map((x) => (x.id === migrateTo ? { ...x, subscribers: x.subscribers + p.subscribers, mrr: x.mrr + p.mrr } : x)));
    }
    setPlans((ps) => ps.map((x) => (x.id === id ? { ...x, status: "Retired", subscribers: 0, mrr: 0, changed: "Aug 23 · J. Mwangi" } : x)));
    logAudit("Plans", `${p?.name ?? id} retired`, p?.status ?? "", migrate ? `migrated → ${migrate.name}` : "no migration", reason);
  };

  /* ---------------- mandate handlers ---------------- */
  const doMandateAdd = (user: string, phone: string, serviceId: string, planId: string, amount: number, frequency: string, billingDay: string, channel: string, reason: string) => {
    const id = `PAY-${23000 + mandates.length + 1}`;
    setMandates((ms) => [{ id, user, phone, serviceId, planId, amount, frequency: frequency as Mandate["frequency"], billingDay, next: "Sep 01", status: "Active", retries: 0, started: "Aug 2025", tenureMo: 0, ltv: 0, channel: channel as Mandate["channel"], history: [{ when: "Aug 23 · now", what: "Mandate created by Super Admin", state: "Active" }] }, ...ms]);
    logAudit("Mandates", `${id} created for ${user}`, "—", `KES ${amount.toLocaleString("en-KE")} ${frequency.toLowerCase()}`, reason);
  };
  const doMandatePause = (id: string, pause: boolean, autoResume: string, notify: boolean, reason: string) => {
    const m = mandates.find((x) => x.id === id);
    setMandates((ms) => ms.map((x) => (x.id === id ? { ...x, status: pause ? "Paused" : "Active", autoResume: pause ? autoResume || "Manual resume" : undefined } : x)));
    logAudit("Mandates", `${id} ${pause ? "paused" : "resumed"}`, m?.status ?? "—", pause ? "Paused" : "Active", `${reason}${notify ? " · user notified" : ""}`);
  };
  const doMandateCancel = (id: string, offerId: string, reason: string) => {
    const m = mandates.find((x) => x.id === id);
    setMandates((ms) => ms.map((x) => (x.id === id ? { ...x, status: "Cancelled", next: "—", history: [{ when: "Aug 23 · now", what: `Cancelled by Super Admin${offerId ? ` · win-back ${offerId} queued` : ""}`, state: "Cancelled" }, ...x.history] } : x)));
    setFailed((fs) => fs.map((f) => (f.mandateId === id ? { ...f, status: "Cancelled", nextRetry: "—" } : f)));
    if (offerId) setOffers((os) => os.map((o) => (o.id === offerId ? { ...o, eligible: o.eligible + 1 } : o)));
    logAudit("Mandates", `${id} cancelled`, m?.status ?? "—", "Cancelled", reason);
  };
  const doMandateSkip = (id: string, notify: boolean, reason: string) => {
    setMandates((ms) => ms.map((x) => (x.id === id ? { ...x, next: "Sep (skipped 1)", history: [{ when: "Aug 23 · now", what: `Cycle skipped${notify ? " · user notified" : ""}`, state: "Paused" }, ...x.history] } : x)));
    logAudit("Mandates", `${id} skipped a cycle`, "", "next +1 cycle", reason);
  };
  const doMandateAmount = (id: string, amount: number, reason: string) => {
    const m = mandates.find((x) => x.id === id);
    setMandates((ms) => ms.map((x) => (x.id === id ? { ...x, amount } : x)));
    logAudit("Mandates", `${id} amount changed`, `KES ${m?.amount.toLocaleString("en-KE") ?? "—"}`, `KES ${amount.toLocaleString("en-KE")}`, reason);
  };
  const doMandateBillingDay = (id: string, billingDay: string) => {
    const m = mandates.find((x) => x.id === id);
    setMandates((ms) => ms.map((x) => (x.id === id ? { ...x, billingDay } : x)));
    logAudit("Mandates", `${id} billing day moved`, m?.billingDay ?? "—", billingDay, "Super Admin edit · 2FA");
  };
  const doBulkMandates = (picked: string[], action: "pause" | "resume" | "retry") => {
    if (action === "retry") { setBulkRetryPicked(picked); return; }
    setMandates((ms) => ms.map((x) => (picked.includes(x.id) ? { ...x, status: action === "pause" ? "Paused" : "Active", autoResume: action === "pause" ? "Manual resume" : undefined } : x)));
    logAudit("Mandates", `${picked.length} mandates bulk ${action}d`, "", action === "pause" ? "Paused" : "Active", `Bulk ${action} · Super Admin`);
  };

  /* ---------------- failed queue handlers ---------------- */
  const doRetry = (id: string, channel: string, note: string) => {
    const f = failed.find((x) => x.id === id) ?? retryTarget;
    if (f) setFailed((fs) => fs.map((x) => (x.id === f.id ? { ...x, status: "Recovered", nextRetry: "—" } : x)));
    setMandates((ms) => ms.map((m) => (m.id === f?.mandateId ? { ...m, status: "Active", retries: 0, failingSince: undefined, history: [{ when: "Aug 23 · now", what: `Manual retry charged OK via ${channel}`, state: "Paid" }, ...m.history] } : m)));
    logAudit("Failed queue", `${id} manual retry OK (${channel})`, f?.status ?? "Retry pending", "Recovered", note);
  };
  const doRecovered = (id: string, method: string, note: string) => {
    const f = failed.find((x) => x.id === id);
    setFailed((fs) => fs.map((x) => (x.id === id ? { ...x, status: "Recovered", nextRetry: "—" } : x)));
    setMandates((ms) => ms.map((m) => (m.id === f?.mandateId ? { ...m, status: "Active", retries: 0, failingSince: undefined, history: [{ when: "Aug 23 · now", what: `Marked recovered — ${method}`, state: "Paid" }, ...m.history] } : m)));
    logAudit("Failed queue", `${id} marked recovered`, f?.status ?? "—", "Recovered", `${method} · ${note}`);
  };
  const doGrace = (id: string, days: number, notify: boolean, reason: string) => {
    setFailed((fs) => fs.map((x) => (x.id === id ? { ...x, status: "Grace", nextRetry: `+${days}d window` } : x)));
    setMandates((ms) => ms.map((m) => (failed.find((f) => f.id === id)?.mandateId === m.id ? { ...m, status: "Grace" } : m)));
    logAudit("Failed queue", `${id} grace extended`, "3 days", `+${days} days${notify ? " · user notified" : ""}`, reason);
  };
  const doBulkRetry = (picked: string[], win: string, reason: string) => {
    setFailed((fs) => fs.map((x) => (picked.includes(x.id) ? { ...x, status: "Recovered", nextRetry: "—" } : x)));
    logAudit("Failed queue", `${picked.length} mandates bulk retry (${win})`, "", "batch fired", reason);
  };

  /* ---------------- dunning handlers ---------------- */
  const doCampaignAdd = (name: string, trigger: string, channels: string[], message: string, timing: string) => {
    setCampaigns((cs) => [{ id: `DUN-${String(cs.length + 1).padStart(2, "0")}`, name, trigger, channels, message, timing, conversion: 0, status: "Draft", audience: 0, sent30d: 0 }, ...cs]);
    logAudit("Dunning", `${name} campaign drafted`, "—", `${trigger} · ${timing}`, "Super Admin created");
  };
  const doCampaignEdit = (id: string, message: string, timing: string) => {
    const c = campaigns.find((x) => x.id === id);
    fileCR(`${id} message copy`, c?.message ?? "", message, "Copy change pending approval", "Low");
    logAudit("Dunning", `${id} copy change filed`, c?.message ?? "", `${message} · ${timing}`, "Goes live after approval");
  };
  const doCampaignStatus = (id: string, activate: boolean, reason: string) => {
    setCampaigns((cs) => cs.map((x) => (x.id === id ? { ...x, status: activate ? "Active" : "Paused" } : x)));
    logAudit("Dunning", `${id} ${activate ? "activated" : "paused"}`, activate ? "Paused/Draft" : "Active", activate ? "Active" : "Paused", reason);
  };
  const doCampaignAB = (id: string, split: number, days: number) => {
    setCampaigns((cs) => cs.map((x) => (x.id === id ? { ...x, variant: `A/B live — B ${split}% · ${days}d` } : x)));
    logAudit("Dunning", `${id} A/B test started`, "100% control", `B ${split}% for ${days}d`, "Super Admin test");
  };

  /* ---------------- churn / offer handlers ---------------- */
  const doChurnAction = (reason: string, owner: string, status: string) => {
    setChurn((cs) => cs.map((c) => (c.reason === reason ? { ...c, owner, actionStatus: status as ChurnRow["actionStatus"] } : c)));
    logAudit("Churn", `action assigned — ${reason}`, "", `${owner} · ${status}`, "Retention tracking");
  };
  const doOfferSave = (id: string | null, name: string, segment: string, discount: string, expires: string, activate: boolean) => {
    if (id) {
      setOffers((os) => os.map((o) => (o.id === id ? { ...o, name, segment, discount, expires, status: activate ? "Active" : "Draft" } : o)));
      logAudit("Churn", `${id} offer updated`, "", discount, "Super Admin edit");
    } else {
      setOffers((os) => [{ id: `WB-${12 + os.length}`, name, segment, discount, eligible: 0, redeemed: 0, expires, status: activate ? "Active" : "Draft" }, ...os]);
      logAudit("Churn", `offer created — ${name}`, "—", discount, "Super Admin created");
    }
  };

  /* ---------------- config / approvals ---------------- */
  const doConfigEdit = (id: string, value: string, reason: string) => {
    const c = config.find((x) => x.id === id);
    setConfig((cs) => cs.map((x) => (x.id === id ? { ...x, pendingTo: value } : x)));
    fileCR(c?.key ?? id, c?.value ?? "", value, reason, "Medium");
    logAudit("Config", `${c?.key ?? id} change filed`, c?.value ?? "", value, reason);
  };
  const doApprove = (id: string) => {
    const r = requests.find((x) => x.id === id);
    setRequests((rs) => rs.map((x) => (x.id === id ? { ...x, status: "Approved", approvals: x.approvals.map((a) => (a.state === "Pending" ? { ...a, state: "Approved" as const } : a)) } : x)));
    const c = config.find((x) => x.pendingTo !== undefined && r?.subject === x.key);
    if (c) setConfig((cs) => cs.map((x) => (x.id === c.id ? { ...x, value: x.pendingTo!, pendingTo: undefined, changed: "Aug 23", changedBy: "J. Mwangi" } : x)));
    logAudit("Approvals", `${r?.subject ?? id} approved`, r?.from ?? "", r?.to ?? "", "Super Admin approval — joins next deploy");
  };
  const doReject = (id: string, reason: string) => {
    const r = requests.find((x) => x.id === id);
    setRequests((rs) => rs.map((x) => (x.id === id ? { ...x, status: "Rejected", approvals: x.approvals.map((a) => (a.state === "Pending" ? { ...a, state: "Rejected" as const } : a)) } : x)));
    setConfig((cs) => cs.map((x) => (r?.subject === x.key ? { ...x, pendingTo: undefined } : x)));
    logAudit("Approvals", `${r?.subject ?? id} rejected`, r?.to ?? "", "rejected", reason);
  };
  const doFileCR = (subject: string, from: string, to: string, reason: string, risk: string) => {
    fileCR(subject, from, to, reason, risk as "Low" | "Medium" | "High");
    logAudit("Approvals", `CR filed on ${subject}`, from, to, reason);
  };
  const doDelete = (id: string, reason: string) => {
    setPlans((ps) => ps.filter((p) => p.id !== id));
    setCampaigns((cs) => cs.filter((c) => c.id !== id));
    setOffers((os) => os.filter((o) => o.id !== id));
    logAudit("Records", `${id} deleted`, "", "removed", reason);
  };

  /* ---------------- export ---------------- */
  const doExport = (kind: string) => {
    if (kind === "services") csvDownload("recurring-services.csv", services.map((s) => ({ id: s.id, name: s.name, kind: s.kind, subscribers: s.subscribers, mrr: s.mrr, churn: s.churn, tenure: s.tenure, status: s.status })));
    if (kind === "plans") csvDownload("recurring-plans.csv", plans.map((p) => ({ id: p.id, name: p.name, service: svcName(p.serviceId), price: p.price, billing: p.billing, subscribers: p.subscribers, mrr: p.mrr, status: p.status })));
    if (kind === "mandates") csvDownload("recurring-mandates.csv", mandates.map((m) => ({ id: m.id, user: m.user, service: svcName(m.serviceId), amount: m.amount, frequency: m.frequency, billingDay: m.billingDay, next: m.next, status: m.status, ltv: m.ltv })));
    if (kind === "failed") csvDownload("failed-recurring.csv", failed.map((f) => ({ id: f.id, mandate: f.mandateId, user: f.user, amount: f.amount, reason: f.reason, retries: f.retries, nextRetry: f.nextRetry, status: f.status })));
    if (kind === "dunning") csvDownload("dunning-campaigns.csv", campaigns.map((c) => ({ id: c.id, name: c.name, trigger: c.trigger, channels: c.channels.join("+"), conversion: c.conversion, sent30d: c.sent30d, status: c.status })));
    if (kind === "config") csvDownload("recurring-config.csv", config.map((c) => ({ id: c.id, group: c.group, key: c.key, value: c.value, pendingTo: c.pendingTo ?? "", editable: c.editable })));
    if (kind === "audit") csvDownload("recurring-audit.csv", audit.map((a) => ({ id: a.id, date: a.date, admin: a.admin, area: a.area, change: a.change, from: a.from, to: a.to, reason: a.reason })));
    push({ kind: "success", title: "Export ready", body: `${kind} dataset downloaded as CSV.` });
  };

  /* ================================================================ render ================================================================ */
  return (
    <>
      {/* ============================== Header ============================== */}
      <div className="pm-section-head" style={{ marginTop: 0 }}>
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="pm-eyebrow">Products &amp; Services · Page 22</span>
            <span className="pm-live"><span className="pm-dot green pm-pulse" />recurring engine live · {mandates.filter((m) => m.status === "Active" || m.status === "Trial").length.toLocaleString("en-KE")} mandates in view</span>
          </div>
          <h2>Recurring Services</h2>
          <p>
            Subscription billing, standing orders and auto-pay in one console — services, plans, mandates, the failed-payment retry
            queue, dunning campaigns, churn and win-back, lifecycle rules and gated configuration. Super Admin has absolute
            control: create, edit, pause, freeze, skip, cancel and delete every record — every sensitive action reason-gated,
            2FA-verified and written to the audit trail.
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setAuditDrawer(true)}>
            <i className="bi bi-journal-check me-1" />Audit
          </button>
          <button className="btn btn-outline-secondary btn-sm position-relative" onClick={() => setRequestsDrawer(true)}>
            <i className="bi bi-hourglass-split me-1" />Approvals
            {pending.length > 0 && <span className="pm-nav-pill" style={{ position: "absolute", top: -6, right: -6 }}>{pending.length}</span>}
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setExportOpen(true)}>
            <i className="bi bi-download me-1" />Export
          </button>
          <Dropdown width={272} trigger={() => <button className="btn btn-outline-secondary btn-sm"><i className="bi bi-three-dots" /></button>}>
            {(close) => (
              <>
                <div className="pm-dd-head">Recurring desk</div>
                <DDItem icon="bi-person-lock" label="Permissions matrix" hint="Who can do what" onClick={() => { close(); setPermDrawer(true); }} />
                <DDItem icon="bi-arrow-repeat" label="Mandates console" hint={`${mandates.length} mandates · bulk ops`} onClick={() => { close(); setMandatesDrawer(true); }} />
                <DDItem icon="bi-exclamation-triangle" label="Failed queue console" hint={`${openFailed.length} open · bulk retry`} onClick={() => { close(); setFailedDrawer(true); }} />
                <DDItem icon="bi-megaphone" label="Dunning console" hint={`${campaigns.filter((c) => c.status === "Active").length} live campaigns`} onClick={() => { close(); setDunningDrawer(true); }} />
                <DDItem icon="bi-person-dash" label="Churn & retention desk" hint="Reasons · actions · offers" onClick={() => { close(); setChurnDrawer(true); }} />
                <DDItem icon="bi-signpost-split" label="Lifecycle map" hint="Trial → … → reactivated" onClick={() => { close(); setLifecycleDrawer(true); }} />
                <DDItem icon="bi-sliders" label="Configuration library" hint={`${config.length} settings · CR-gated`} onClick={() => { close(); setConfigDrawer(true); }} />
                <div className="pm-dd-sep" />
                <div className="pm-dd-head">Cross-desk</div>
                <DDItem icon="bi-gear-wide-connected" label="Open Product Configuration" hint="Page 21 · limits & fees" onClick={() => { close(); onNavigate("product-config"); }} />
                <DDItem icon="bi-pie-chart" label="Open Service Portfolio" hint="Page 20 · service P&L" onClick={() => { close(); onNavigate("portfolio"); }} />
                <DDItem icon="bi-credit-card" label="Open Card Programs" hint="Page 23 · card products" onClick={() => { close(); onNavigate("cards"); }} />
                <DDItem icon="bi-lightning-charge" label="Open Utility Services" hint="Page 24 · billers" onClick={() => { close(); onNavigate("utility"); }} />
                <DDItem icon="bi-percent" label="Open Fee Management" hint="Page 10 · fee schedules" onClick={() => { close(); onNavigate("fees"); }} />
              </>
            )}
          </Dropdown>
          <button className="btn btn-primary btn-sm" onClick={() => setMandWizard(true)}>
            <i className="bi bi-plus-lg me-1" />New mandate
          </button>
        </div>
      </div>

      {/* ============================== KPI strip ============================== */}
      <div className="row g-2 mb-3">
        {kpi.map((s) => (
          <div className="col-6 col-md-4 col-xxl-2" key={s.label}>
            <div className="pm-stat">
              <div className="d-flex align-items-center gap-2">
                <span className="pm-stat-ico" style={{
                  background: s.tone === "green" ? "#e7f8ef" : s.tone === "amber" ? "#fff5e6" : s.tone === "violet" ? "#f4f1ff" : "#eff8ff",
                  color: s.tone === "green" ? "#0b8f52" : s.tone === "amber" ? "#b54708" : s.tone === "violet" ? "#5925dc" : "#175cd3",
                }}><i className={`bi ${s.icon}`} /></span>
                <span className="pm-stat-label">{s.label}</span>
              </div>
              <div className="pm-stat-value">{s.value}</div>
              <div className="pm-stat-foot">{s.note}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ============================== Tabs ============================== */}
      <div className="pm-tabs mb-3">
        {TABS.map((t) => (
          <button key={t.id} className={`pm-tab ${tab === t.id ? "active" : ""}`} onClick={() => { setTab(t.id); setChip("All"); setQ(""); }}>
            <i className={`bi ${t.icon}`} />{t.label}
            {t.id === "plans" && <span className="cnt">{plans.length}</span>}
            {t.id === "mandates" && <span className="cnt">{mandates.length}</span>}
            {t.id === "failed" && openFailed.length > 0 && <span className="cnt" style={{ background: "#fff5e6", color: "#b54708" }}>{openFailed.length}</span>}
            {t.id === "dunning" && <span className="cnt">{campaigns.length}</span>}
            {t.id === "approvals" && pending.length > 0 && <span className="cnt" style={{ background: "#fff5e6", color: "#b54708" }}>{pending.length}</span>}
          </button>
        ))}
      </div>

      {/* ============================== Tab: services ============================== */}
      {tab === "services" && (
        <>
          <div className="d-flex gap-2 flex-wrap mb-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setMandatesDrawer(true)}><i className="bi bi-arrow-repeat me-1" />Mandates console</button>
            <span className="ms-auto pm-td-sub">Row menus: pause, freeze signups, edit · click a row for the full service console</span>
          </div>
          <div className="pm-card mb-3">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Service</th><th>Kind</th><th className="text-end">Subscribers</th><th className="text-end">Monthly value</th><th className="text-end">Churn</th><th className="text-end">Avg tenure</th><th>Owner</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {services.map((s) => (
                    <tr key={s.id} style={{ cursor: "pointer" }} onClick={() => setSvcDrawer(s)}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className="pm-avatar" style={{ background: `${s.color}1f`, color: s.color }}><i className={`bi ${s.icon}`} /></span>
                          <div>
                            <span className="pm-td-strong">{s.name}</span>
                            <div className="pm-td-sub mono">{s.id}{s.signupsFrozen ? " · signups frozen" : ""}</div>
                          </div>
                        </div>
                      </td>
                      <td><Badge tone="grey">{s.kind}</Badge></td>
                      <td className="text-end pm-num">{s.subscribers.toLocaleString("en-KE")}</td>
                      <td className="text-end pm-num mono">{fmtK(s.mrr)}{s.mrrNote && <div className="pm-td-sub">{s.mrrNote}</div>}</td>
                      <td className="text-end pm-num">{s.churn}</td>
                      <td className="text-end pm-num">{s.tenure}</td>
                      <td className="pm-td-sub">{s.owner}</td>
                      <td><Badge tone={statusTone(s.status)} dot>{s.status}</Badge></td>
                      <td className="text-end" onClick={(e) => e.stopPropagation()}>
                        <Dropdown trigger={() => <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".64rem" }}><i className="bi bi-three-dots" /></button>}>
                          {(close) => (
                            <>
                              <div className="pm-dd-head">{s.name}</div>
                              <DDItem icon="bi-box-arrow-in-right" label="Open service console" hint={`${mandates.filter((m) => m.serviceId === s.id).length} mandates · ${plans.filter((p) => p.serviceId === s.id).length} plans`} onClick={() => { close(); setSvcDrawer(s); }} />
                              <DDItem icon={s.status === "Active" ? "bi-pause-fill" : "bi-play-fill"} label={s.status === "Active" ? "Pause service" : "Resume service"} hint="Reason + 2FA · all charges" danger={s.status === "Active"} onClick={() => { close(); setSvcPause(s); }} />
                              <DDItem icon={s.signupsFrozen ? "bi-person-check" : "bi-person-x"} label={s.signupsFrozen ? "Unfreeze signups" : "Freeze signups"} hint="New mandates only" onClick={() => { close(); setSvcFreeze(s); }} />
                              <DDItem icon="bi-plus-lg" label="New plan" hint="Wizard · staging draft" onClick={() => { close(); setPlanPreset(s); setPlanWizard(true); }} />
                              <DDItem icon="bi-pencil-square" label="Edit details" hint="Owner · description" onClick={() => { close(); setSvcEdit(s); }} />
                            </>
                          )}
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pm-table-foot">
              <span>{services.length} services · {fmtK(services.reduce((a, s) => a + s.mrr, 0))}/mo recurring value</span>
              <span className="pm-td-sub">§22.1 overview · click through for mandates, plans, failures and audit</span>
            </div>
          </div>
        </>
      )}

      {/* ============================== Tab: plans ============================== */}
      {tab === "plans" && (
        <>
          <div className="d-flex gap-2 flex-wrap mb-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setPlansDrawer(true)}><i className="bi bi-collection me-1" />Open plans console</button>
            <button className="btn btn-primary btn-sm" onClick={() => { setPlanPreset(null); setPlanWizard(true); }}><i className="bi bi-plus-lg me-1" />New plan</button>
            <span className="ms-auto pm-td-sub">Price changes and retires are CR-gated · drafts deletable</span>
          </div>
          <div className="pm-card mb-3">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Plan</th><th>Service</th><th>Price</th><th>Billing</th><th>Features</th><th className="text-end">Subs</th><th className="text-end">MRR</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {plans.map((p) => (
                    <tr key={p.id}>
                      <td><span className="pm-td-strong">{p.name}</span><div className="pm-td-sub mono">{p.id} · changed {p.changed}</div></td>
                      <td className="pm-td-sub">{svcName(p.serviceId)}</td>
                      <td className="pm-num mono">{fmtK(p.price)}</td>
                      <td><Badge tone="grey">{p.billing}</Badge>{p.trialDays > 0 && <div className="pm-td-sub">{p.trialDays}d trial</div>}</td>
                      <td className="pm-td-sub" style={{ maxWidth: 220 }}>{p.features.join(" · ")}</td>
                      <td className="text-end pm-num">{p.subscribers.toLocaleString("en-KE")}</td>
                      <td className="text-end pm-num mono">{fmtK(p.mrr)}</td>
                      <td><Badge tone={statusTone(p.status)} dot>{p.status}</Badge></td>
                      <td className="text-end">
                        <Dropdown trigger={() => <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".64rem" }}><i className="bi bi-three-dots" /></button>}>
                          {(close) => (
                            <>
                              <div className="pm-dd-head">{p.name}</div>
                              <DDItem icon="bi-pencil-square" label="Edit plan" hint="Features · trial · proration" onClick={() => { close(); setPlanEdit(p); }} />
                              <DDItem icon="bi-cash-coin" label="Change price" hint="Files a CR · subscriber notice" onClick={() => { close(); setPlanPrice(p); }} />
                              <DDItem icon={p.status === "Active" ? "bi-pause-fill" : "bi-play-fill"} label={p.status === "Active" ? "Pause plan" : "Activate plan"} hint="Signup visibility" onClick={() => { close(); setPlanStatus(p); }} />
                              <DDItem icon="bi-copy" label="Clone plan" hint="Draft copy" onClick={() => { close(); setPlanClone(p); }} />
                              <DDItem icon="bi-archive" label="Retire plan" hint="Migrate subscribers" danger onClick={() => { close(); setPlanRetire(p); }} />
                              {p.status === "Draft" && (
                                <>
                                  <div className="pm-dd-sep" />
                                  <DDItem icon="bi-trash3" label="Delete draft" danger hint="Typed confirm + 2FA" onClick={() => { close(); setDeleteTarget({ kind: "plan draft", id: p.id, name: p.name, hint: `${p.id} · 0 subscribers` }); }} />
                                </>
                              )}
                            </>
                          )}
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pm-table-foot">
              <span>{plans.length} plans · {fmtK(plans.reduce((a, p) => a + p.mrr, 0))}/mo MRR</span>
              <span className="pm-td-sub">§22.2 · guardrail: price CRs above +50% are High risk</span>
            </div>
          </div>
        </>
      )}

      {/* ============================== Tab: mandates ============================== */}
      {tab === "mandates" && (
        <>
          <div className="d-flex gap-2 flex-wrap align-items-center mb-2">
            <div className="pm-search" style={{ maxWidth: 260, minWidth: 200 }}>
              <i className="bi bi-search" />
              <input placeholder="Search mandate, user, phone…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="ms-auto d-flex gap-2">
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setMandatesDrawer(true)}><i className="bi bi-stack me-1" />Console &amp; bulk ops</button>
              <button className="btn btn-primary btn-sm" onClick={() => setMandWizard(true)}><i className="bi bi-plus-lg me-1" />New mandate</button>
            </div>
          </div>
          <div className="d-flex gap-1 flex-wrap mb-2">
            {["All", "Active", "Trial", "Retry pending", "Grace", "Paused", "Cancelled"].map((c) => {
              const label = c === "All" ? `All (${mandates.length})` : `${c} (${mandates.filter((m) => m.status === c).length})`;
              return <button key={c} className={`pm-chip ${chip === c ? "active" : ""}`} onClick={() => setChip(c)}>{label}</button>;
            })}
          </div>
          <div className="pm-card mb-3">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Mandate</th><th>Service / plan</th><th>Amount</th><th>Schedule</th><th>Next</th><th>LTV</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {mandPage.map((m) => (
                    <tr key={m.id} style={{ cursor: "pointer" }} onClick={() => setMandDrawer(m)}>
                      <td><span className="pm-td-strong">{m.user}</span><div className="pm-td-sub mono">{m.id} · {m.channel}</div></td>
                      <td className="pm-td-sub">{svcName(m.serviceId)}<div>{planMeta(m.planId)?.name ?? "—"}</div></td>
                      <td className="pm-num mono">{fmtK(m.amount)}<div className="pm-td-sub">{m.frequency}</div></td>
                      <td className="pm-td-sub">{m.billingDay}</td>
                      <td className="pm-td-sub">{m.next}</td>
                      <td className="pm-num mono">{fmtK(m.ltv)}</td>
                      <td>
                        <Badge tone={statusTone(m.status)} dot>{m.status}</Badge>
                        {m.retries > 0 && m.status === "Retry pending" && <div className="pm-td-sub">{m.retries}/3 retries</div>}
                        {m.status === "Paused" && m.autoResume && <div className="pm-td-sub">resumes {m.autoResume}</div>}
                      </td>
                      <td className="text-end" onClick={(e) => e.stopPropagation()}>
                        <Dropdown trigger={() => <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".64rem" }}><i className="bi bi-three-dots" /></button>}>
                          {(close) => (
                            <>
                              <div className="pm-dd-head">{m.id}</div>
                              <DDItem icon="bi-box-arrow-in-right" label="Open mandate console" hint="Timeline · payments · comms" onClick={() => { close(); setMandDrawer(m); }} />
                              {m.status === "Retry pending" && <DDItem icon="bi-play-fill" label="Retry now" hint="Manual · out-of-band" onClick={() => { close(); setRetryTarget(syntheticFailure(m)); }} />}
                              <DDItem icon="bi-skip-forward" label="Skip a cycle" hint="Goodwill · not dunning" onClick={() => { close(); setMandSkip(m); }} />
                              <DDItem icon="bi-cash-coin" label="Change amount" hint="2FA · notify user" onClick={() => { close(); setMandAmount(m); }} />
                              <DDItem icon="bi-calendar3" label="Billing day" hint="29/30/31 → month-end" onClick={() => { close(); setMandBillingDay(m); }} />
                              <DDItem icon={m.status === "Paused" ? "bi-play-fill" : "bi-pause-fill"} label={m.status === "Paused" ? "Resume" : "Pause"} hint="Reason + 2FA" onClick={() => { close(); setMandPause(m); }} />
                              {m.status !== "Cancelled" && <DDItem icon="bi-x-circle" label="Cancel mandate" hint="Typed confirm · win-back offer" danger onClick={() => { close(); setMandCancel(m); }} />}
                            </>
                          )}
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={mandFiltered.length} onPage={setPage} onPageSize={() => setPage(1)} />
          </div>
        </>
      )}

      {/* ============================== Tab: failed queue ============================== */}
      {tab === "failed" && (
        <>
          <div className="d-flex gap-2 flex-wrap mb-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setFailedDrawer(true)}><i className="bi bi-stack me-1" />Queue console · bulk retry</button>
            <span className="ms-auto pm-td-sub">{openFailed.length} open · KES {Math.round(openFailed.reduce((a, f) => a + f.amount, 0) / 1000)}K recoverable in view</span>
          </div>
          <div className="d-flex gap-1 flex-wrap mb-2">
            {["All", "Open", "Retry pending", "Grace", "Paused", "Cancelled", "Recovered"].map((c) => (
              <button key={c} className={`pm-chip ${chip === c ? "active" : ""}`} onClick={() => setChip(c)}>{c}</button>
            ))}
          </div>
          <div className="pm-card mb-3">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>User / mandate</th><th>Amount</th><th>Reason</th><th>Retries</th><th>Next retry</th><th>Dunning</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {failedPage.map((f) => (
                    <tr key={f.id}>
                      <td><span className="pm-td-strong">{f.user}</span><div className="pm-td-sub mono">{f.id} · {f.mandateId} · {f.channel}</div></td>
                      <td className="pm-num mono">{fmtK(f.amount)}</td>
                      <td className="pm-td-sub">{f.reason}</td>
                      <td className="pm-num">{f.retries}/{f.maxRetries}</td>
                      <td className="pm-td-sub">{f.nextRetry}</td>
                      <td><Badge tone={f.dunningStage >= 3 ? "red" : f.dunningStage >= 1 ? "amber" : "grey"}>stage {f.dunningStage}</Badge></td>
                      <td><Badge tone={statusTone(f.status)} dot>{f.status}</Badge></td>
                      <td className="text-end">
                        <div className="d-flex gap-1 justify-content-end">
                          {f.status === "Retry pending" && <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".64rem" }} onClick={() => setRetryTarget(f)}><i className="bi bi-play-fill me-1" />Retry</button>}
                          {f.status !== "Recovered" && f.status !== "Cancelled" && <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".64rem" }} onClick={() => setRecoveredTarget(f)}><i className="bi bi-check2 me-1" />Recovered</button>}
                          {f.status === "Grace" && <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".64rem" }} onClick={() => setGraceTarget(f)}><i className="bi bi-hourglass-split me-1" />Extend</button>}
                          <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".64rem" }} onClick={() => openMandateFromFailure(f)}><i className="bi bi-box-arrow-in-right" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={pageSize} total={failedFiltered.length} onPage={setPage} onPageSize={() => setPage(1)} />
          </div>
        </>
      )}

      {/* ============================== Tab: dunning ============================== */}
      {tab === "dunning" && (
        <>
          <div className="d-flex gap-2 flex-wrap mb-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setDunningDrawer(true)}><i className="bi bi-stack me-1" />Dunning console</button>
            <button className="btn btn-primary btn-sm" onClick={() => setCampWizard(true)}><i className="bi bi-plus-lg me-1" />New campaign</button>
            <span className="ms-auto pm-td-sub">Journey: fail → DUN-01 → 02 → 03 → cancel → 04/05 win-back</span>
          </div>
          <div className="row g-2 mb-3">
            {campaigns.map((c) => (
              <div className="col-6 col-md-4 col-xxl-2" key={c.id}>
                <div className="pm-stat">
                  <div className="d-flex align-items-center gap-2">
                    <span className="pm-stat-ico" style={{ background: c.status === "Active" ? "#e7f8ef" : "#eff1f4", color: c.status === "Active" ? "#0b8f52" : "#667085" }}><i className="bi bi-megaphone" /></span>
                    <span className="pm-stat-label">{c.id}</span>
                  </div>
                  <div className="pm-stat-value" style={{ fontSize: "1.05rem" }}>{c.conversion}%</div>
                  <div className="pm-stat-foot">{c.trigger} · {c.channels.join("+")}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="pm-card mb-3">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Campaign</th><th>Trigger</th><th>Message</th><th>Timing</th><th className="text-end">Conv.</th><th className="text-end">Sent 30d</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {campaigns.map((c) => (
                    <tr key={c.id}>
                      <td><span className="pm-td-strong">{c.name}</span><div className="pm-td-sub mono">{c.id}{c.variant ? ` · ${c.variant}` : ""}</div></td>
                      <td className="pm-td-sub">{c.trigger}</td>
                      <td className="pm-td-sub" style={{ maxWidth: 240 }}>“{c.message}”<div className="pm-td-sub">{c.channels.join(" + ")}</div></td>
                      <td className="pm-td-sub">{c.timing}</td>
                      <td className="text-end pm-num">{c.conversion}%</td>
                      <td className="text-end pm-num">{c.sent30d.toLocaleString("en-KE")}</td>
                      <td><Badge tone={statusTone(c.status)} dot>{c.status}</Badge></td>
                      <td className="text-end">
                        <Dropdown trigger={() => <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".64rem" }}><i className="bi bi-three-dots" /></button>}>
                          {(close) => (
                            <>
                              <div className="pm-dd-head">{c.id}</div>
                              <DDItem icon="bi-pencil-square" label="Edit copy / timing" hint="Deploys on approval" onClick={() => { close(); setCampEdit(c); }} />
                              <DDItem icon="bi-bezier2" label="A/B test bench" hint="Split traffic · pick winner" onClick={() => { close(); setCampAB(c); }} />
                              <DDItem icon={c.status === "Active" ? "bi-pause-fill" : "bi-play-fill"} label={c.status === "Active" ? "Pause campaign" : "Activate campaign"} hint="Reason + 2FA" onClick={() => { close(); setCampStatus(c); }} />
                              {c.status === "Draft" && <DDItem icon="bi-trash3" label="Delete draft" danger hint="Typed confirm + 2FA" onClick={() => { close(); setDeleteTarget({ kind: "campaign draft", id: c.id, name: c.name, hint: `${c.id} · never sent` }); }} />}
                            </>
                          )}
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pm-table-foot">
              <span>{campaigns.length} campaigns · KES 2.3M dunning recovery in 30d (+12%)</span>
              <span className="pm-td-sub">§22.6 · SMS budget 160 chars · DUN-03 notice is mandatory</span>
            </div>
          </div>
        </>
      )}

      {/* ============================== Tab: churn & retention ============================== */}
      {tab === "churn" && (
        <>
          <div className="row g-2 mb-3">
            {ANALYTICS.slice(0, 6).map((a) => (
              <div className="col-6 col-md-4 col-xxl-2" key={a.metric}>
                <div className="pm-stat">
                  <div className="d-flex align-items-center gap-2">
                    <span className="pm-stat-ico" style={{ background: a.tone === "green" ? "#e7f8ef" : "#eff1f4", color: a.tone === "green" ? "#0b8f52" : "#667085" }}><i className="bi bi-graph-up-arrow" /></span>
                    <span className="pm-stat-label">{a.metric}</span>
                  </div>
                  <div className="pm-stat-value" style={{ fontSize: "1.05rem" }}>{a.value}</div>
                  <div className="pm-stat-foot">{a.trend} · {a.note}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="d-flex gap-2 flex-wrap mb-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setChurnDrawer(true)}><i className="bi bi-stack me-1" />Churn desk · offers · full analytics</button>
            <button className="btn btn-primary btn-sm" onClick={() => { setOfferModal(null); setOfferOpen(true); }}><i className="bi bi-gift me-1" />New win-back offer</button>
            <span className="ms-auto pm-td-sub">{churn.reduce((a, c) => a + c.count, 0)} cancellations · 30 days</span>
          </div>
          <div className="pm-card mb-3">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>Reason</th><th className="text-end">30d</th><th className="text-end">Share</th><th>Action</th><th>Owner</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {churn.map((c) => (
                    <tr key={c.reason}>
                      <td><span className="pm-td-strong">{c.reason}</span></td>
                      <td className="text-end pm-num">{c.count}</td>
                      <td className="text-end pm-num">{c.pct}%</td>
                      <td className="pm-td-sub">{c.action}</td>
                      <td className="pm-td-sub">{c.owner}</td>
                      <td><Badge tone={c.actionStatus === "Shipped" ? "green" : c.actionStatus === "Not started" ? "grey" : "amber"} dot>{c.actionStatus}</Badge></td>
                      <td className="text-end">{c.action !== "—" && <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".64rem" }} onClick={() => setChurnAction(c)}><i className="bi bi-clipboard-check me-1" />Assign</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pm-table-foot"><span>§22.5 churn analysis · exit survey 87% completion</span><span className="pm-td-sub">Recovery rate 72% after retry · +5pp (§22.4)</span></div>
          </div>
          <div className="row g-2">
            {offers.map((o) => (
              <div className="col-6 col-md-3" key={o.id}>
                <div className="pm-card" style={{ padding: ".7rem .8rem", height: "100%" }}>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <i className="bi bi-gift" style={{ color: "#5925dc" }} />
                    <span className="pm-td-strong" style={{ fontSize: ".8rem" }}>{o.name}</span>
                  </div>
                  <div className="pm-td-sub">{o.segment} · {o.discount}</div>
                  <div className="pm-td-sub">{o.redeemed}/{o.eligible.toLocaleString("en-KE")} redeemed · expires {o.expires}</div>
                  <div className="d-flex gap-1 mt-2">
                    <Badge tone={statusTone(o.status)} dot>{o.status}</Badge>
                    <button className="btn btn-sm btn-outline-secondary ms-auto" style={{ fontSize: ".64rem" }} onClick={() => { setOfferModal(o); setOfferOpen(true); }}><i className="bi bi-pencil" />Edit</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ============================== Tab: lifecycle ============================== */}
      {tab === "lifecycle" && (
        <>
          <div className="d-flex gap-2 flex-wrap mb-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setLifecycleDrawer(true)}><i className="bi bi-stack me-1" />Lifecycle map console</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setConfigDrawer(true)}><i className="bi bi-sliders me-1" />Tune lifecycle rules</button>
            <span className="ms-auto pm-td-sub">§22.7 · click a stage to inspect its mandates</span>
          </div>
          <div className="row g-2 mb-3">
            {stages.map((s, i) => (
              <div className="col-6 col-md-4 col-xl-3" key={s.id}>
                <button className="pm-card w-100 text-start" style={{ padding: ".7rem .8rem" }} onClick={() => setLifecycleDrawer(true)}>
                  <div className="d-flex align-items-center gap-2">
                    <span className="pm-avatar" style={{ width: 28, height: 28, fontSize: ".75rem", background: s.tone === "green" ? "#e7f8ef" : s.tone === "amber" ? "#fff5e6" : s.tone === "red" ? "#fee4e2" : s.tone === "violet" ? "#f4f1ff" : "#eff8ff", color: s.tone === "green" ? "#0b8f52" : s.tone === "amber" ? "#b54708" : s.tone === "red" ? "#b42318" : s.tone === "violet" ? "#5925dc" : "#175cd3" }}>{i + 1}</span>
                    <div>
                      <span className="pm-td-strong">{s.name}</span>
                      <div className="pm-num mono">{s.count.toLocaleString("en-KE")}</div>
                    </div>
                    <i className="bi bi-chevron-right pm-td-sub ms-auto" />
                  </div>
                  <div className="pm-td-sub mt-1">{s.note}</div>
                </button>
              </div>
            ))}
          </div>
          <div className="pm-note"><i className="bi bi-diagram-2 me-1" />Paused mandates auto-resume on the promised date; cancelled mandates reactivatable for 30 days with a dunning offer (RCF-10). Win-back pool {stages.find((s) => s.id === "winback")?.count.toLocaleString("en-KE")} · reactivated {stages.find((s) => s.id === "reactivated")?.count.toLocaleString("en-KE")} this month.</div>
        </>
      )}

      {/* ============================== Tab: configuration ============================== */}
      {tab === "config" && (
        <>
          <div className="d-flex gap-2 flex-wrap mb-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setConfigDrawer(true)}><i className="bi bi-stack me-1" />Config library console</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setProration(true)}><i className="bi bi-calculator me-1" />Proration calculator</button>
            <button className="btn btn-primary btn-sm" onClick={() => setNewRequest(true)}><i className="bi bi-plus-circle me-1" />Request a change</button>
            <span className="ms-auto pm-td-sub">{config.filter((c) => c.pendingTo).length} pending CRs on config</span>
          </div>
          {[...new Set(config.map((c) => c.group))].map((g) => (
            <div className="pm-card mb-3" key={g}>
              <div className="pm-card-head" style={{ padding: ".55rem .9rem", borderBottom: "1px solid #eef2f6" }}><span className="pm-td-strong">{g}</span></div>
              <div className="pm-table-wrap">
                <table className="pm-table">
                  <thead><tr><th>Setting</th><th>Value</th><th>Changed</th><th /></tr></thead>
                  <tbody>
                    {config.filter((c) => c.group === g).map((c) => (
                      <tr key={c.id}>
                        <td><span className="pm-td-strong">{c.key}</span><div className="pm-td-sub">{c.note}</div></td>
                        <td>
                          <span className="mono">{c.value}</span>
                          {c.pendingTo && <Badge tone="amber" className="ms-1" dot>→ {c.pendingTo}</Badge>}
                          {!c.editable && <Badge tone="grey" className="ms-1">locked</Badge>}
                        </td>
                        <td className="pm-td-sub">{c.changed}<div className="pm-td-sub">{c.changedBy}</div></td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".64rem" }} disabled={!c.editable} onClick={() => setConfigEdit(c)}><i className="bi bi-pencil me-1" />Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          <div className="pm-note"><i className="bi bi-shield-lock me-1" />Every change files a change request (Risk → Product → Super Admin) and deploys only after approval. Locked rows are engineering-only invariants. §22.8.</div>
        </>
      )}

      {/* ============================== Tab: approvals ============================== */}
      {tab === "approvals" && (
        <>
          <div className="d-flex gap-2 flex-wrap mb-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setRequestsDrawer(true)}><i className="bi bi-stack me-1" />Approvals console</button>
            <button className="btn btn-primary btn-sm" onClick={() => setNewRequest(true)}><i className="bi bi-plus-circle me-1" />Request a change</button>
            <span className="ms-auto pm-td-sub">{pending.length} pending · Super Admin is the final gate</span>
          </div>
          {pending.length === 0 && <EmptyState icon="bi-check2-circle" title="Queue clear" body="No pending recurring-ops changes — nice." />}
          {pending.length > 0 && (
            <div className="pm-card mb-3">
              <div className="pm-table-wrap">
                <table className="pm-table">
                  <thead><tr><th>CR</th><th>Change</th><th>Risk</th><th>Sign-offs</th><th>Status</th><th /></tr></thead>
                  <tbody>
                    {pending.map((r) => (
                      <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => setReqDetail(r)}>
                        <td className="mono">{r.id}<div className="pm-td-sub">{r.requestedAt}</div></td>
                        <td><span className="pm-td-strong">{r.subject}</span><div className="pm-td-sub mono">{r.from} → {r.to}</div></td>
                        <td><Badge tone={r.risk === "High" ? "red" : r.risk === "Medium" ? "amber" : "green"} dot>{r.risk}</Badge></td>
                        <td className="pm-td-sub">{r.approvals.map((a) => `${a.role}: ${a.state}`).join(" · ")}</td>
                        <td><Badge tone={statusTone(r.status)} dot>{r.status}</Badge></td>
                        <td className="text-end" onClick={(e) => e.stopPropagation()}>
                          <div className="d-flex gap-1 justify-content-end">
                            <button className="btn btn-outline-danger btn-sm" style={{ fontSize: ".64rem", borderColor: "#fda29b", color: "#b42318" }} onClick={() => setRejectTarget(r)}><i className="bi bi-x-circle me-1" />Reject</button>
                            <button className="btn btn-primary btn-sm" style={{ fontSize: ".64rem" }} onClick={() => setApproveTarget(r)}><i className="bi bi-check2-circle me-1" />Approve</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="pm-card mb-3">
            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead><tr><th>CR</th><th>Change</th><th>Requested</th><th>Status</th></tr></thead>
                <tbody>
                  {requests.filter((r) => r.status !== "Pending").map((r) => (
                    <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => setReqDetail(r)}>
                      <td className="mono">{r.id}</td>
                      <td><span className="pm-td-strong">{r.subject}</span><div className="pm-td-sub mono">{r.from} → {r.to}</div></td>
                      <td className="pm-td-sub">{r.requestedAt}<div className="pm-td-sub">{r.requestedBy}</div></td>
                      <td><Badge tone={statusTone(r.status)} dot>{r.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pm-table-foot"><span>Decided CRs stay visible 90 days</span><span className="pm-td-sub">Approve = your Super Admin signature + 2FA</span></div>
          </div>
        </>
      )}

      {/* ============================== Mounts: services ============================== */}
      {svcDrawer && (
        <ServiceDrawer service={svcDrawer} mandates={mandates} plans={plans} failed={failed} audit={audit}
          onClose={() => setSvcDrawer(null)} onEdit={(s) => setSvcEdit(s)} onPause={(s) => setSvcPause(s)} onFreeze={(s) => setSvcFreeze(s)}
          onNewPlan={(s) => { setSvcDrawer(null); setPlanPreset(s); setPlanWizard(true); }} onOpenMandate={(m) => setMandDrawer(m)} onOpenPlan={(p) => { setSvcDrawer(null); setPlanEdit(p); }}
          onRetryFailed={(f) => setRetryTarget(f)} />
      )}
      <ServicePauseModal service={svcPause} onClose={() => setSvcPause(null)} onDone={doServicePause} />
      <ServiceFreezeModal service={svcFreeze} onClose={() => setSvcFreeze(null)} onDone={doServiceFreeze} />
      <ServiceEditModal service={svcEdit} onClose={() => setSvcEdit(null)} onDone={doServiceEdit} />

      {/* ============================== Mounts: plans ============================== */}
      <PlansDrawer plans={plans} services={services} open={plansDrawer} onClose={() => setPlansDrawer(false)}
        onNew={() => { setPlansDrawer(false); setPlanPreset(null); setPlanWizard(true); }} onEdit={(p) => setPlanEdit(p)} onPrice={(p) => setPlanPrice(p)}
        onStatus={(p) => setPlanStatus(p)} onClone={(p) => setPlanClone(p)} onRetire={(p) => setPlanRetire(p)} />
      <PlanWizard open={planWizard} services={services} presetService={planPreset} onClose={() => { setPlanWizard(false); setPlanPreset(null); }} onDone={doPlanAdd} />
      <PlanEditModal plan={planEdit} onClose={() => setPlanEdit(null)} onDone={doPlanEdit} />
      <PlanPriceModal plan={planPrice} onClose={() => setPlanPrice(null)} onDone={doPlanPrice} />
      <PlanStatusModal plan={planStatus} onClose={() => setPlanStatus(null)} onDone={doPlanStatus} />
      <PlanCloneModal plan={planClone} onClose={() => setPlanClone(null)} onDone={doPlanClone} />
      <PlanRetireModal plan={planRetire} plans={plans} onClose={() => setPlanRetire(null)} onDone={doPlanRetire} />

      {/* ============================== Mounts: mandates ============================== */}
      <MandatesDrawer mandates={mandates} open={mandatesDrawer} onClose={() => setMandatesDrawer(false)}
        onOpen={(m) => { setMandatesDrawer(false); setMandDrawer(m); }} onNew={() => { setMandatesDrawer(false); setMandWizard(true); }}
        onBulk={doBulkMandates} onExport={() => doExport("mandates")} />
      <MandateDrawer mandate={mandDrawer} plans={plans} onClose={() => setMandDrawer(null)}
        onPause={(m) => setMandPause(m)} onCancel={(m) => setMandCancel(m)} onSkip={(m) => setMandSkip(m)}
        onAmount={(m) => setMandAmount(m)} onBillingDay={(m) => setMandBillingDay(m)} onRetry={(m) => setRetryTarget(syntheticFailure(m))}
        onGrace={(m) => { const f = failed.find((x) => x.mandateId === m.id) ?? syntheticFailure(m); setGraceTarget({ ...f, status: "Grace" }); }} />
      <MandateWizard open={mandWizard} services={services} plans={plans} onClose={() => setMandWizard(false)} onDone={doMandateAdd} />
      <MandatePauseModal mandate={mandPause} onClose={() => setMandPause(null)} onDone={doMandatePause} />
      <MandateCancelModal mandate={mandCancel} offers={offers} onClose={() => setMandCancel(null)} onDone={doMandateCancel} />
      <MandateSkipModal mandate={mandSkip} onClose={() => setMandSkip(null)} onDone={doMandateSkip} />
      <MandateAmountModal mandate={mandAmount} onClose={() => setMandAmount(null)} onDone={doMandateAmount} />
      <MandateBillingDayModal mandate={mandBillingDay} onClose={() => setMandBillingDay(null)} onDone={doMandateBillingDay} />

      {/* ============================== Mounts: failed queue ============================== */}
      <FailedDrawer failed={failed} open={failedDrawer} onClose={() => setFailedDrawer(false)}
        onRetry={(f) => setRetryTarget(f)} onRecovered={(f) => setRecoveredTarget(f)} onGrace={(f) => setGraceTarget(f)}
        onOpenMandate={(m) => { const f = failed.find((x) => x.mandateId === m.id); if (f) openMandateFromFailure(f); }} onBulkRetry={(picked) => setBulkRetryPicked(picked)} />
      <RetryNowModal failure={retryTarget} onClose={() => setRetryTarget(null)} onDone={doRetry} />
      <MarkRecoveredModal failure={recoveredTarget} onClose={() => setRecoveredTarget(null)} onDone={doRecovered} />
      <GraceModal failure={graceTarget} onClose={() => setGraceTarget(null)} onDone={doGrace} />
      <BulkRetryModal count={bulkRetryPicked?.length ?? 0} open={!!bulkRetryPicked} onClose={() => setBulkRetryPicked(null)} onDone={(win, reason) => { if (bulkRetryPicked) doBulkRetry(bulkRetryPicked, win, reason); }} />

      {/* ============================== Mounts: dunning ============================== */}
      <DunningDrawer campaigns={campaigns} open={dunningDrawer} onClose={() => setDunningDrawer(false)}
        onNew={() => { setDunningDrawer(false); setCampWizard(true); }} onEdit={(c) => setCampEdit(c)} onStatus={(c) => setCampStatus(c)} onAB={(c) => setCampAB(c)} />
      <CampaignWizard open={campWizard} onClose={() => setCampWizard(false)} onDone={doCampaignAdd} />
      <CampaignEditModal campaign={campEdit} onClose={() => setCampEdit(null)} onDone={doCampaignEdit} />
      <CampaignStatusModal campaign={campStatus} onClose={() => setCampStatus(null)} onDone={doCampaignStatus} />
      <CampaignABModal campaign={campAB} onClose={() => setCampAB(null)} onDone={doCampaignAB} />

      {/* ============================== Mounts: churn ============================== */}
      <ChurnDrawer churn={churn} offers={offers} open={churnDrawer} onClose={() => setChurnDrawer(false)}
        onAction={(row) => setChurnAction(row)} onOffer={(o) => { setChurnDrawer(false); setOfferModal(o); setOfferOpen(true); }} onNewOffer={() => { setChurnDrawer(false); setOfferModal(null); setOfferOpen(true); }} />
      <ChurnActionModal row={churnAction} onClose={() => setChurnAction(null)} onDone={doChurnAction} />
      <OfferModal offer={offerModal} open={offerOpen} onClose={() => { setOfferOpen(false); setOfferModal(null); }} onDone={doOfferSave} />

      {/* ============================== Mounts: lifecycle / config ============================== */}
      <LifecycleDrawer stages={stages} open={lifecycleDrawer} onClose={() => setLifecycleDrawer(false)}
        onOpenMandates={() => { setLifecycleDrawer(false); setMandatesDrawer(true); }} onOpenConfig={() => { setLifecycleDrawer(false); setConfigDrawer(true); }} />
      <ConfigDrawer config={config} open={configDrawer} onClose={() => setConfigDrawer(false)} onEdit={(c) => setConfigEdit(c)} onNewCR={() => { setConfigDrawer(false); setNewRequest(true); }} onProration={() => setProration(true)} />
      <ConfigEditModal setting={configEdit} onClose={() => setConfigEdit(null)} onDone={doConfigEdit} />
      <ProrationModal plans={plans} open={proration} onClose={() => setProration(false)} />

      {/* ============================== Mounts: approvals / audit / export ============================== */}
      <RequestsDrawer requests={requests} open={requestsDrawer} onClose={() => setRequestsDrawer(false)}
        onDetail={(r) => setReqDetail(r)} onApprove={(r) => setApproveTarget(r)} onReject={(r) => setRejectTarget(r)} onNew={() => { setRequestsDrawer(false); setNewRequest(true); }} />
      <RequestDetailModal request={reqDetail} onClose={() => setReqDetail(null)} />
      <ApproveModal request={approveTarget} onClose={() => setApproveTarget(null)} onDone={doApprove} />
      <RejectModal request={rejectTarget} onClose={() => setRejectTarget(null)} onDone={doReject} />
      <NewRequestModal config={config} open={newRequest} onClose={() => setNewRequest(false)} onDone={doFileCR} />
      <AuditDrawer audit={audit} open={auditDrawer} onClose={() => setAuditDrawer(false)} />
      <PermissionsDrawer open={permDrawer} onClose={() => setPermDrawer(false)} />
      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} onExport={doExport} />
      <DeleteConfirmModal target={deleteTarget} onClose={() => setDeleteTarget(null)} onDone={doDelete} />
    </>
  );
}
