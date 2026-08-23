import { useMemo, useState } from "react";
import { Modal, Drawer, Steps, Badge, Avatar, TwoFactorField, useToast, DDItem } from "../components/ui";
import { ALL_PAGES, NAV, type NavPage } from "./navigation";
import { csvDownload } from "../lib/format";

/* ---------------------------------------------------------------- 1. Command palette */
export function CommandPalette({ open, onClose, onNavigate, onAction }: {
  open: boolean; onClose: () => void; onNavigate: (id: string) => void; onAction: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const actions = [
    { id: "freeze", label: "Freeze a customer account", icon: "bi-snow", hint: "Requires 2FA" },
    { id: "broadcast", label: "Compose broadcast message", icon: "bi-megaphone", hint: "4-step wizard" },
    { id: "lockdown", label: "Emergency platform lockdown", icon: "bi-shield-lock-fill", hint: "Super admin only" },
    { id: "export", label: "Export platform report", icon: "bi-download", hint: "CSV · XLSX · PDF" },
    { id: "fees", label: "Publish new fee schedule", icon: "bi-percent", hint: "Requires 2FA" },
    { id: "recon", label: "Trigger reconciliation run", icon: "bi-arrow-repeat", hint: "Requires 2FA" },
    { id: "notifications", label: "Open notification centre", icon: "bi-bell", hint: "9 unread" },
    { id: "help", label: "Open knowledge base", icon: "bi-life-preserver", hint: "142 articles" },
  ];
  const pages = useMemo(
    () => ALL_PAGES.filter((p) => (p.label + p.summary).toLowerCase().includes(q.toLowerCase())).slice(0, 7),
    [q]
  );
  const acts = actions.filter((a) => a.label.toLowerCase().includes(q.toLowerCase()));
  if (!open) return null;
  return (
    <div className="pm-cmdk pm-page-content" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pm-cmdk-box">
        <div className="d-flex align-items-center gap-2 px-3 py-3 border-bottom">
          <i className="bi bi-search" style={{ color: "var(--pm-muted)" }} />
          <input autoFocus className="form-control border-0 shadow-none px-0" placeholder="Search pages, actions, users, transactions…"
            value={q} onChange={(e) => setQ(e.target.value)} />
          <span className="pm-kbd">ESC</span>
        </div>
        <div style={{ maxHeight: "52vh", overflowY: "auto", padding: ".4rem" }}>
          {acts.length > 0 && <div className="pm-dd-head">Quick actions</div>}
          {acts.map((a) => (
            <DDItem key={a.id} icon={a.icon} label={a.label} hint={a.hint} onClick={() => { onClose(); onAction(a.id); }} />
          ))}
          {pages.length > 0 && <div className="pm-dd-head">Pages</div>}
          {pages.map((p) => (
            <DDItem key={p.id} icon={p.icon} label={`${p.label}`} hint={`Page ${p.page} · ${p.summary}`}
              onClick={() => { onClose(); onNavigate(p.id); }}
              right={p.ready ? <Badge tone="green">Live</Badge> : <Badge tone="grey">Blueprint</Badge>} />
          ))}
          {acts.length === 0 && pages.length === 0 && (
            <div className="p-4 text-center" style={{ color: "var(--pm-muted)", fontSize: ".84rem" }}>
              No matches for “{q}”. Try “fraud”, “settlement”, or “freeze”.
            </div>
          )}
        </div>
        <div className="d-flex gap-3 px-3 py-2 border-top" style={{ fontSize: ".7rem", color: "var(--pm-muted)" }}>
          <span><span className="pm-kbd">↑↓</span> navigate</span><span><span className="pm-kbd">↵</span> open</span>
          <span className="ms-auto">PayMo Super Admin · Ctrl + K</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- 2. Notifications drawer */
export type ShellNotification = {
  id: string; title: string; body: string; time: string; tone: "red" | "amber" | "green" | "blue";
  icon: string; category: string; unread: boolean;
};
export const SHELL_NOTIFICATIONS: ShellNotification[] = [
  { id: "N-4412", title: "Account takeover attempt blocked", body: "User #11223 — 4 failed passkey challenges from 3 devices in Nakuru.", time: "2 min ago", tone: "red", icon: "bi-shield-exclamation", category: "Fraud", unread: true },
  { id: "N-4411", title: "M-Pesa callback latency breach", body: "STK result callbacks averaging 5m 12s — 12 transactions pending.", time: "8 min ago", tone: "red", icon: "bi-hourglass-split", category: "Payments", unread: true },
  { id: "N-4410", title: "Daily fraud threshold at 78%", body: "KES 14.2M of the KES 18M automated block ceiling consumed.", time: "22 min ago", tone: "amber", icon: "bi-exclamation-triangle", category: "Risk", unread: true },
  { id: "N-4409", title: "QuickLend settlement overdue", body: "Partner #12 settlement of KES 4.2M is 2 days past due.", time: "1 hour ago", tone: "amber", icon: "bi-cash-coin", category: "Partners", unread: true },
  { id: "N-4408", title: "KYC batch ready for review", body: "347 identity verifications completed by Onfido overnight.", time: "1 hour ago", tone: "blue", icon: "bi-patch-check", category: "KYC", unread: true },
  { id: "N-4407", title: "Card settlement pool at 82%", body: "Visa prefunding pool needs a KES 60M top-up before 16:00 EAT.", time: "2 hours ago", tone: "amber", icon: "bi-droplet-half", category: "Liquidity", unread: true },
  { id: "N-4406", title: "UnionPay circuit breaker OPEN", body: "5 consecutive failures — next probe scheduled at 14:32:30.", time: "3 hours ago", tone: "red", icon: "bi-plug", category: "API", unread: true },
  { id: "N-4405", title: "12 partner applications received", body: "Includes 3 SACCOs and 2 insurance aggregators.", time: "5 hours ago", tone: "blue", icon: "bi-buildings", category: "Partners", unread: true },
  { id: "N-4404", title: "CBK monthly return due Aug 31", body: "Compliance officer has completed 7 of 11 schedules.", time: "6 hours ago", tone: "amber", icon: "bi-bank", category: "Compliance", unread: true },
  { id: "N-4403", title: "Backup verified", body: "Nightly snapshot restored to staging and integrity-checked.", time: "9 hours ago", tone: "green", icon: "bi-hdd-stack", category: "System", unread: false },
  { id: "N-4402", title: "Feature flag rolled out", body: "instant-pesalink enabled for 25% of Nairobi users.", time: "11 hours ago", tone: "green", icon: "bi-flag", category: "System", unread: false },
  { id: "N-4401", title: "Fee schedule change approved", body: "Mobile money tier 3 reduced 0.50% → 0.45% by Platform Admin.", time: "yesterday", tone: "green", icon: "bi-percent", category: "Finance", unread: false },
];

export function NotificationsDrawer({ open, onClose, notifications, onMarkAll, onOpenItem }: {
  open: boolean; onClose: () => void; notifications: ShellNotification[]; onMarkAll: () => void; onOpenItem: (n: ShellNotification) => void;
}) {
  const [tab, setTab] = useState<"all" | "unread" | "Fraud" | "Payments" | "System">("all");
  const list = notifications.filter((n) =>
    tab === "all" ? true : tab === "unread" ? n.unread : n.category === tab
  );
  return (
    <Drawer open={open} onClose={onClose} title="Notification centre" icon="bi-bell-fill" tone="amber"
      subtitle={`${notifications.filter((n) => n.unread).length} unread · auto-refreshing every 30s`}
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={onMarkAll}>
            <i className="bi bi-check2-all me-1" />Mark all read
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => csvDownload("paymo-notifications.csv", notifications as unknown as Record<string, unknown>[])}>
            <i className="bi bi-download me-1" />Export
          </button>
        </>
      }>
      <div className="d-flex gap-1 flex-wrap mb-3">
        {(["all", "unread", "Fraud", "Payments", "System"] as const).map((t) => (
          <button key={t} className={`pm-chip ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t === "all" ? "All" : t === "unread" ? "Unread" : t}
          </button>
        ))}
      </div>
      <div className="d-flex flex-column gap-2">
        {list.map((n) => (
          <button key={n.id} className={`pm-alert-row ${n.tone === "red" ? "crit" : n.tone === "amber" ? "warn" : "info"} text-start`}
            onClick={() => onOpenItem(n)}>
            <i className={`bi ${n.icon}`} style={{ color: n.tone === "red" ? "#f04438" : n.tone === "amber" ? "#f79009" : n.tone === "green" ? "#12b76a" : "#2e90fa", fontSize: "1rem" }} />
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2">
                <span style={{ fontWeight: 700, fontSize: ".82rem" }}>{n.title}</span>
                {n.unread && <span className="pm-dot green" style={{ width: 6, height: 6, boxShadow: "none" }} />}
              </div>
              <div style={{ fontSize: ".75rem", color: "var(--pm-muted)" }}>{n.body}</div>
              <div className="d-flex gap-2 mt-1">
                <Badge tone="grey">{n.category}</Badge>
                <span style={{ fontSize: ".7rem", color: "var(--pm-muted)" }}>{n.time} · {n.id}</span>
              </div>
            </div>
            <i className="bi bi-chevron-right" style={{ color: "#c3cbd9" }} />
          </button>
        ))}
        {list.length === 0 && <div className="pm-note text-center">Nothing here — you are all caught up.</div>}
      </div>
    </Drawer>
  );
}

/* ---------------------------------------------------------------- 3. Role & permissions modal */
const PERM_ROWS = [
  { cat: "Users", perm: "View user list", v: ["✅", "✅", "✅", "✅", "✅", "⚙️", "✅"] },
  { cat: "Users", perm: "Edit user profile", v: ["✅", "✅", "✅", "❌", "❌", "⚙️", "❌"] },
  { cat: "Users", perm: "Freeze account", v: ["✅", "✅", "✅", "✅", "❌", "⚙️", "❌"] },
  { cat: "Users", perm: "Close account", v: ["✅", "✅", "❌", "✅", "❌", "❌", "❌"] },
  { cat: "Users", perm: "Impersonate user", v: ["✅", "✅", "❌", "❌", "❌", "❌", "❌"] },
  { cat: "Users", perm: "Delete user", v: ["✅", "❌", "❌", "❌", "❌", "❌", "❌"] },
  { cat: "Users", perm: "Grant / revoke VIP", v: ["✅", "✅", "❌", "❌", "❌", "❌", "❌"] },
  { cat: "Transactions", perm: "View all transactions", v: ["✅", "✅", "✅", "✅", "✅", "⚙️", "✅"] },
  { cat: "Transactions", perm: "Reverse transaction", v: ["✅", "✅", "❌", "✅", "❌", "❌", "❌"] },
  { cat: "Transactions", perm: "Approve high-value", v: ["✅", "✅", "❌", "❌", "✅", "❌", "❌"] },
  { cat: "Transactions", perm: "Set fee schedule", v: ["✅", "✅", "❌", "❌", "✅", "❌", "❌"] },
  { cat: "Transactions", perm: "Hold transaction", v: ["✅", "✅", "✅", "✅", "❌", "❌", "❌"] },
  { cat: "Fraud", perm: "Block transaction", v: ["✅", "✅", "✅", "✅", "❌", "❌", "❌"] },
  { cat: "Fraud", perm: "Blacklist user", v: ["✅", "✅", "❌", "✅", "❌", "❌", "❌"] },
  { cat: "Fraud", perm: "Configure rules", v: ["✅", "✅", "❌", "✅", "❌", "❌", "❌"] },
  { cat: "Finance", perm: "View P&L", v: ["✅", "✅", "❌", "❌", "✅", "❌", "✅"] },
  { cat: "Finance", perm: "Approve settlements", v: ["✅", "✅", "❌", "❌", "✅", "❌", "❌"] },
  { cat: "Finance", perm: "Manage reserves", v: ["✅", "✅", "❌", "❌", "✅", "❌", "❌"] },
  { cat: "Partners", perm: "Onboard partner", v: ["✅", "✅", "❌", "❌", "❌", "❌", "❌"] },
  { cat: "Partners", perm: "Suspend partner", v: ["✅", "✅", "❌", "❌", "❌", "❌", "❌"] },
  { cat: "Investors", perm: "Manage cap table", v: ["✅", "✅", "❌", "❌", "❌", "❌", "❌"] },
  { cat: "Investors", perm: "Process dividends", v: ["✅", "✅", "❌", "❌", "✅", "❌", "❌"] },
  { cat: "System", perm: "Manage admins", v: ["✅", "✅", "❌", "❌", "❌", "❌", "❌"] },
  { cat: "System", perm: "Manage roles", v: ["✅", "❌", "❌", "❌", "❌", "❌", "❌"] },
  { cat: "System", perm: "Database access", v: ["✅", "❌", "❌", "❌", "❌", "❌", "❌"] },
  { cat: "System", perm: "Feature flags", v: ["✅", "✅", "❌", "❌", "❌", "❌", "❌"] },
  { cat: "System", perm: "Backup management", v: ["✅", "❌", "❌", "❌", "❌", "❌", "❌"] },
];
const ROLE_COLS = ["Super", "Platform", "Ops", "Compliance", "Finance", "Minor", "Analyst"];

export function RolePermissionsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [cat, setCat] = useState("All");
  const cats = ["All", ...Array.from(new Set(PERM_ROWS.map((r) => r.cat)))];
  const rows = cat === "All" ? PERM_ROWS : PERM_ROWS.filter((r) => r.cat === cat);
  return (
    <Modal open={open} onClose={onClose} size="xl" tone="violet" icon="bi-diagram-3-fill"
      title="Role tiers & permission matrix"
      subtitle="You are signed in as Tier 0 — Super Admin. Every cell below is enforced server-side."
      footer={
        <>
          <button className="btn btn-outline-secondary btn-sm" onClick={() =>
            csvDownload("paymo-permission-matrix.csv", PERM_ROWS.map((r) => ({
              category: r.cat, permission: r.perm,
              ...Object.fromEntries(ROLE_COLS.map((c, i) => [c, r.v[i]])),
            })))
          }><i className="bi bi-download me-1" />Export matrix</button>
          <button className="btn btn-primary btn-sm" onClick={onClose}>Done</button>
        </>
      }>
      <div className="pm-modal-body">
        <div className="row g-2 mb-3">
          {[
            { t: 0, r: "Super Admin", d: "All roles, all permissions", tone: "green" },
            { t: 1, r: "Platform Admin", d: "Minor admins, analysts", tone: "blue" },
            { t: 2, r: "Operations Manager", d: "Support agents, reviewers", tone: "violet" },
            { t: 3, r: "Compliance Officer", d: "Investigators", tone: "amber" },
          ].map((x) => (
            <div className="col-6 col-lg-3" key={x.t}>
              <div className="pm-card pm-card-pad h-100">
                <div className="pm-eyebrow">Tier {x.t}</div>
                <div style={{ fontWeight: 700, fontSize: ".86rem" }}>{x.r}</div>
                <div style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>Can create: {x.d}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="d-flex gap-1 flex-wrap mb-2">
          {cats.map((c) => <button key={c} className={`pm-chip ${cat === c ? "active" : ""}`} onClick={() => setCat(c)}>{c}</button>)}
        </div>
        <div className="pm-card pm-table-wrap" style={{ maxHeight: 330, overflowY: "auto" }}>
          <table className="pm-table">
            <thead><tr><th>Permission</th>{ROLE_COLS.map((c) => <th key={c} className="text-center">{c}</th>)}</tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.cat + r.perm}>
                  <td><span className="pm-td-strong">{r.perm}</span><div className="pm-td-sub">{r.cat}</div></td>
                  {r.v.map((v, i) => <td key={i} className="text-center">{v}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pm-note mt-2">⚙️ = configurable by super admin per minor-admin account. Changes are written to the audit log (Page 31) and take effect on the admin's next request.</div>
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------------------- 4. Session & security modal */
export function SessionModal({ open, onClose, secondsLeft, onExtend }: {
  open: boolean; onClose: () => void; secondsLeft: number; onExtend: () => void;
}) {
  const { push } = useToast();
  const sessions = [
    { id: "SES-9921", device: "MacBook Pro 16 · Chrome 128", ip: "197.232.14.88", loc: "Nairobi, Westlands", started: "Today 07:48", current: true },
    { id: "SES-9917", device: "iPhone 15 Pro · PayMo Admin iOS", ip: "197.232.14.88", loc: "Nairobi, Westlands", started: "Yesterday 19:02", current: false },
    { id: "SES-9902", device: "Windows 11 · Edge 128", ip: "41.90.64.12", loc: "Mombasa, Nyali", started: "23 Aug 09:14", current: false },
  ];
  return (
    <Modal open={open} onClose={onClose} tone="blue" icon="bi-shield-lock" size="lg"
      title="Session & security" subtitle="Gate 1 PIN · Gate 2 Passkey · Gate 3 TOTP · Gate 4 Session PIN — all satisfied">
      <div className="pm-modal-body">
        <div className="row g-2 mb-3">
          {[
            { l: "Session expires in", v: `${Math.floor(secondsLeft / 3600)}h ${Math.floor((secondsLeft % 3600) / 60)}m`, i: "bi-hourglass-split" },
            { l: "Idle timeout", v: "30 minutes", i: "bi-clock-history" },
            { l: "Concurrent sessions", v: "1 allowed", i: "bi-window-stack" },
            { l: "Token encryption", v: "AES-256-GCM", i: "bi-lock" },
          ].map((x) => (
            <div className="col-6 col-lg-3" key={x.l}>
              <div className="pm-stat">
                <div className="pm-stat-label">{x.l}</div>
                <div style={{ fontWeight: 700, fontSize: ".92rem" }}><i className={`bi ${x.i} me-1`} style={{ color: "var(--pm-green)" }} />{x.v}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="pm-card">
          <div className="pm-card-head"><div><h6 className="pm-card-title">Active & recent sessions</h6><p className="pm-card-sub">Super admin can terminate any session instantly.</p></div></div>
          <div className="pm-table-wrap">
            <table className="pm-table">
              <thead><tr><th>Session</th><th>Device</th><th>IP / location</th><th>Started</th><th></th></tr></thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id}>
                    <td><span className="mono pm-td-strong">{s.id}</span>{s.current && <Badge tone="green">This device</Badge>}</td>
                    <td>{s.device}</td>
                    <td><span className="mono">{s.ip}</span><div className="pm-td-sub">{s.loc}</div></td>
                    <td>{s.started}</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-secondary" disabled={s.current}
                        onClick={() => push({ kind: "success", title: `Session ${s.id} terminated`, body: "The device must re-authenticate through all 4 gates." })}>
                        Terminate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="pm-note mt-3"><i className="bi bi-info-circle me-1" />IP whitelist is <b>enabled</b> for 197.232.14.0/24 (HQ) and 41.90.64.0/24 (Mombasa office). Device binding is active on 2 of 3 devices.</div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm" onClick={() => { onExtend(); push({ kind: "success", title: "Session extended by 8 hours", body: "New expiry recorded in the audit log." }); onClose(); }}>
          <i className="bi bi-arrow-clockwise me-1" />Extend session
        </button>
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------------------- 5. Sign out confirm */
export function SignOutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [all, setAll] = useState(false);
  return (
    <Modal open={open} onClose={onClose} tone="red" icon="bi-box-arrow-right" size="sm"
      title="Sign out of PayMo Admin?" subtitle="You will need all four authentication gates to return.">
      <div className="pm-modal-body">
        <div className="pm-note mb-3">Any unsaved wizard progress on this page is discarded. Scheduled jobs and broadcasts already queued are unaffected.</div>
        <div className="form-check">
          <input className="form-check-input" type="checkbox" id="soAll" checked={all} onChange={(e) => setAll(e.target.checked)} />
          <label className="form-check-label" htmlFor="soAll" style={{ fontSize: ".84rem" }}>Also terminate my 2 other active sessions</label>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Stay signed in</button>
        <button className="btn btn-danger btn-sm" onClick={() => {
          push({ kind: "info", title: "Signed out (demo)", body: all ? "All 3 sessions terminated." : "This session terminated." });
          onClose();
        }}><i className="bi bi-box-arrow-right me-1" />Sign out</button>
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------------------- 6. Emergency lockdown wizard */
const LOCKDOWN_SCOPES = [
  { id: "withdrawals", label: "Freeze all withdrawals", desc: "Blocks B2C, ATM and card cash-out across every rail", icon: "bi-box-arrow-up", impact: "89,214 active users" },
  { id: "outbound", label: "Freeze all outbound money movement", desc: "Withdrawals + transfers + bill pay + partner disbursement", icon: "bi-arrow-up-right-circle", impact: "148,392 users" },
  { id: "logins", label: "Suspend new logins", desc: "Existing sessions continue; no new authentication accepted", icon: "bi-person-lock", impact: "3,847 live sessions kept" },
  { id: "full", label: "Full platform lockdown", desc: "Read-only mode for customers, admin console stays live", icon: "bi-shield-lock-fill", impact: "Everything except admin" },
];

export function EmergencyLockdownWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [scope, setScope] = useState("withdrawals");
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("60");
  const [notify, setNotify] = useState({ users: true, partners: true, cbk: false, staff: true });
  const [code, setCode] = useState("");
  const [phrase, setPhrase] = useState("");
  const steps = [{ label: "Scope", icon: "bi-crosshair" }, { label: "Reason", icon: "bi-chat-left-text" }, { label: "Comms", icon: "bi-megaphone" }, { label: "Authorise", icon: "bi-shield-lock" }, { label: "Confirm", icon: "bi-check2-circle" }];
  const chosen = LOCKDOWN_SCOPES.find((s) => s.id === scope)!;
  const canNext = step === 0 ? true : step === 1 ? reason.trim().length >= 15 : step === 2 ? true : step === 3 ? code === "482913" && phrase === "LOCKDOWN" : true;

  const reset = () => { setStep(0); setReason(""); setCode(""); setPhrase(""); };
  const close = () => { reset(); onClose(); };

  return (
    <Modal open={open} onClose={close} tone="red" icon="bi-shield-lock-fill" size="lg"
      title="Emergency platform lockdown" subtitle="Tier 0 — Super Admin only. Every step is written to the immutable audit log.">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%`, background: "#f04438" }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="d-flex flex-column gap-2">
            {LOCKDOWN_SCOPES.map((s) => (
              <button key={s.id} className={`pm-opt ${scope === s.id ? "active" : ""}`} onClick={() => setScope(s.id)}>
                <span className="r" />
                <i className={`bi ${s.icon}`} style={{ fontSize: "1.1rem", color: "#d92d20" }} />
                <span className="flex-grow-1">
                  <span className="d-block" style={{ fontWeight: 700, fontSize: ".86rem" }}>{s.label}</span>
                  <span className="d-block" style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>{s.desc}</span>
                </span>
                <Badge tone="red">{s.impact}</Badge>
              </button>
            ))}
          </div>
        )}
        {step === 1 && (
          <>
            <label className="form-label">Reason for lockdown (minimum 15 characters, retained for 7 years)</label>
            <textarea className="form-control" rows={4} value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Coordinated account-takeover campaign detected across 41 accounts originating from a single ASN…" />
            <div className="d-flex gap-1 flex-wrap mt-2">
              {["Suspected fraud ring", "Core banking incident", "Regulator instruction (CBK)", "Partner API compromise"].map((r) => (
                <button key={r} className="pm-chip" onClick={() => setReason(`${r} — `)}>{r}</button>
              ))}
            </div>
            <label className="form-label mt-3">Auto-lift after</label>
            <select className="form-select" value={duration} onChange={(e) => setDuration(e.target.value)}>
              <option value="30">30 minutes</option><option value="60">1 hour</option>
              <option value="180">3 hours</option><option value="0">Manual lift only</option>
            </select>
          </>
        )}
        {step === 2 && (
          <div className="d-flex flex-column gap-2">
            {[
              { k: "users", l: "Notify all customers", d: "Push + SMS: “Withdrawals are temporarily paused.”" },
              { k: "partners", l: "Notify 42 partners", d: "Webhook event platform.lockdown.started + email to tech contacts" },
              { k: "cbk", l: "Notify Central Bank of Kenya", d: "Section 4.2 incident notification within 2 hours" },
              { k: "staff", l: "Page on-call & leadership", d: "PagerDuty P1 + Slack #incident-war-room" },
            ].map((n) => (
              <label key={n.k} className={`pm-opt ${notify[n.k as keyof typeof notify] ? "active" : ""}`} style={{ cursor: "pointer" }}>
                <input type="checkbox" className="form-check-input mt-0" checked={notify[n.k as keyof typeof notify]}
                  onChange={(e) => setNotify({ ...notify, [n.k]: e.target.checked })} />
                <span className="flex-grow-1">
                  <span className="d-block" style={{ fontWeight: 700, fontSize: ".86rem" }}>{n.l}</span>
                  <span className="d-block" style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>{n.d}</span>
                </span>
              </label>
            ))}
          </div>
        )}
        {step === 3 && (
          <div className="d-flex flex-column gap-3">
            <TwoFactorField value={code} onChange={setCode} />
            <div>
              <label className="form-label">Type <b className="mono">LOCKDOWN</b> to confirm intent</label>
              <input className="form-control mono" value={phrase} onChange={(e) => setPhrase(e.target.value.toUpperCase())} placeholder="LOCKDOWN" />
            </div>
            <div className="pm-note" style={{ borderColor: "#fbd3cf", background: "#fef2f2", color: "#b42318" }}>
              <i className="bi bi-exclamation-octagon me-1" />This action affects live customer money movement. A second super admin will be paged to counter-sign within 15 minutes.
            </div>
          </div>
        )}
        {step === 4 && (
          <>
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">Scope</span><span className="v">{chosen.label}</span></div>
              <div className="pm-kv"><span className="k">Impact</span><span className="v">{chosen.impact}</span></div>
              <div className="pm-kv"><span className="k">Auto-lift</span><span className="v">{duration === "0" ? "Manual only" : `${duration} minutes`}</span></div>
              <div className="pm-kv"><span className="k">Notifications</span><span className="v">{Object.entries(notify).filter(([, v]) => v).length} channels</span></div>
              <div className="pm-kv"><span className="k">Authorised by</span><span className="v">Joseph Mwangi · Tier 0</span></div>
              <div className="pm-kv"><span className="k">Reason</span><span className="v" style={{ maxWidth: 320 }}>{reason || "—"}</span></div>
            </div>
            <div className="pm-code">POST /admin/v1/platform/lockdown{"\n"}{`{ "scope": "${scope}", "autoLiftMinutes": ${duration}, "actor": "adm_joseph_mwangi" }`}</div>
          </>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
        {step < steps.length - 1 && (
          <button className="btn btn-danger btn-sm" disabled={!canNext} onClick={() => setStep(step + 1)}>
            Next<i className="bi bi-arrow-right ms-1" />
          </button>
        )}
        {step === steps.length - 1 && (
          <button className="btn btn-danger btn-sm" onClick={() => {
            push({ kind: "warn", title: `Lockdown engaged — ${chosen.label}`, body: `Ref LCK-2026-0041 · auto-lift ${duration === "0" ? "disabled" : duration + " min"}. Counter-signature requested.` });
            close();
          }}><i className="bi bi-shield-lock-fill me-1" />Engage lockdown</button>
        )}
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------------------- 7. Broadcast composer wizard */
const SEGMENTS = [
  { id: "all", label: "All users", count: 148392 },
  { id: "active", label: "Active last 30 days", count: 89214 },
  { id: "vip", label: "VIP clients", count: 1284 },
  { id: "dormant", label: "Dormant 90+ days", count: 21430 },
  { id: "defaulters", label: "Loan defaulters", count: 1247 },
  { id: "nairobi", label: "Nairobi county", count: 52118 },
  { id: "merchants", label: "Business accounts", count: 9640 },
];

export function BroadcastWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [segment, setSegment] = useState("active");
  const [channels, setChannels] = useState({ push: true, sms: false, email: true, inapp: true });
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [when, setWhen] = useState("now");
  const [scheduleAt, setScheduleAt] = useState("2026-08-26T09:00");
  const steps = [{ label: "Audience", icon: "bi-people" }, { label: "Channels", icon: "bi-broadcast" }, { label: "Message", icon: "bi-pencil-square" }, { label: "Schedule", icon: "bi-calendar-event" }, { label: "Review", icon: "bi-eye" }];
  const seg = SEGMENTS.find((s) => s.id === segment)!;
  const chCount = Object.values(channels).filter(Boolean).length;
  const smsCost = channels.sms ? seg.count * 0.8 : 0;
  const canNext = step === 2 ? title.trim().length > 3 && body.trim().length > 10 : step === 1 ? chCount > 0 : true;
  const close = () => { setStep(0); onClose(); };

  return (
    <Modal open={open} onClose={close} tone="blue" icon="bi-megaphone-fill" size="lg"
      title="Compose broadcast" subtitle="Reaches customers on push, SMS, email and in-app inbox.">
      <div className="pm-wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
      <Steps steps={steps} current={step} />
      <div className="pm-modal-body">
        {step === 0 && (
          <div className="row g-2">
            {SEGMENTS.map((s) => (
              <div className="col-12 col-md-6" key={s.id}>
                <button className={`pm-opt ${segment === s.id ? "active" : ""}`} onClick={() => setSegment(s.id)}>
                  <span className="r" />
                  <span className="flex-grow-1">
                    <span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{s.label}</span>
                    <span className="d-block" style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{s.count.toLocaleString()} recipients</span>
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
        {step === 1 && (
          <div className="d-flex flex-column gap-2">
            {[
              { k: "push", l: "Push notification", d: "Free · delivered in ~4s · 92% reach", i: "bi-phone" },
              { k: "sms", l: "SMS via Africa's Talking", d: "KES 0.80 per message · 99.4% delivery", i: "bi-chat-dots" },
              { k: "email", l: "Email via SendGrid", d: "Free · 41% average open rate", i: "bi-envelope" },
              { k: "inapp", l: "In-app inbox", d: "Free · persists for 30 days", i: "bi-inbox" },
            ].map((c) => (
              <label key={c.k} className={`pm-opt ${channels[c.k as keyof typeof channels] ? "active" : ""}`}>
                <input type="checkbox" className="form-check-input mt-0" checked={channels[c.k as keyof typeof channels]}
                  onChange={(e) => setChannels({ ...channels, [c.k]: e.target.checked })} />
                <i className={`bi ${c.i}`} style={{ fontSize: "1.05rem", color: "var(--pm-blue)" }} />
                <span className="flex-grow-1">
                  <span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>{c.l}</span>
                  <span className="d-block" style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>{c.d}</span>
                </span>
              </label>
            ))}
            {channels.sms && <div className="pm-note">Estimated SMS spend for this segment: <b>KES {smsCost.toLocaleString()}</b> — requires Finance Manager co-approval above KES 50,000.</div>}
          </div>
        )}
        {step === 2 && (
          <>
            <label className="form-label">Title</label>
            <input className="form-control mb-3" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={64} placeholder="Scheduled maintenance this Sunday" />
            <label className="form-label">Message body <span style={{ color: "var(--pm-muted)", fontWeight: 500 }}>({body.length}/480 · merge fields supported)</span></label>
            <textarea className="form-control" rows={5} maxLength={480} value={body} onChange={(e) => setBody(e.target.value)}
              placeholder="Hi {{first_name}}, PayMo will be briefly unavailable on Sunday 2:00–2:45 AM EAT while we upgrade the ledger…" />
            <div className="d-flex gap-1 flex-wrap mt-2">
              {["{{first_name}}", "{{balance}}", "{{account_id}}", "{{tier}}"].map((f) => (
                <button key={f} className="pm-chip mono" onClick={() => setBody((b) => b + " " + f)}>{f}</button>
              ))}
            </div>
            <div className="pm-card pm-card-pad mt-3" style={{ background: "#f7f9fc" }}>
              <div className="pm-eyebrow mb-2">Live preview — push notification</div>
              <div className="d-flex gap-2 align-items-start p-2" style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--pm-border)" }}>
                <div className="pm-avatar sm" style={{ background: "#12b76a" }}>P</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: ".8rem" }}>{title || "Your title appears here"}</div>
                  <div style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>{(body || "Your message body appears here.").replace("{{first_name}}", "Amina")}</div>
                </div>
              </div>
            </div>
          </>
        )}
        {step === 3 && (
          <div className="d-flex flex-column gap-2">
            <button className={`pm-opt ${when === "now" ? "active" : ""}`} onClick={() => setWhen("now")}>
              <span className="r" /><i className="bi bi-lightning-charge" style={{ color: "var(--pm-green)" }} />
              <span className="flex-grow-1"><span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>Send immediately</span>
                <span className="d-block" style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>Queued within 5 seconds of approval</span></span>
            </button>
            <button className={`pm-opt ${when === "later" ? "active" : ""}`} onClick={() => setWhen("later")}>
              <span className="r" /><i className="bi bi-calendar-event" style={{ color: "var(--pm-blue)" }} />
              <span className="flex-grow-1"><span className="d-block" style={{ fontWeight: 700, fontSize: ".85rem" }}>Schedule for later</span>
                <span className="d-block" style={{ fontSize: ".72rem", color: "var(--pm-muted)" }}>Respects quiet hours 21:00–07:00 EAT</span></span>
            </button>
            {when === "later" && (
              <div><label className="form-label mt-1">Send at (EAT)</label>
                <input type="datetime-local" className="form-control" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} /></div>
            )}
          </div>
        )}
        {step === 4 && (
          <div className="pm-card pm-card-pad">
            <div className="pm-kv"><span className="k">Audience</span><span className="v">{seg.label} · {seg.count.toLocaleString()}</span></div>
            <div className="pm-kv"><span className="k">Channels</span><span className="v">{Object.entries(channels).filter(([, v]) => v).map(([k]) => k).join(", ")}</span></div>
            <div className="pm-kv"><span className="k">Title</span><span className="v">{title}</span></div>
            <div className="pm-kv"><span className="k">Estimated cost</span><span className="v">KES {smsCost.toLocaleString()}</span></div>
            <div className="pm-kv"><span className="k">Delivery</span><span className="v">{when === "now" ? "Immediately" : new Date(scheduleAt).toLocaleString("en-GB")}</span></div>
            <div className="pm-kv"><span className="k">Approval</span><span className="v">{smsCost > 50000 ? "Finance co-sign required" : "Auto-approved (Tier 0)"}</span></div>
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={close}>Cancel</button>
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}><i className="bi bi-arrow-left me-1" />Back</button>}
        {step < 4 && <button className="btn btn-primary btn-sm" disabled={!canNext} onClick={() => setStep(step + 1)}>Next<i className="bi bi-arrow-right ms-1" /></button>}
        {step === 4 && <button className="btn btn-primary btn-sm" onClick={() => {
          push({ kind: "success", title: "Broadcast queued", body: `BRD-2026-0188 → ${seg.count.toLocaleString()} recipients on ${chCount} channels.` });
          close();
        }}><i className="bi bi-send me-1" />{when === "now" ? "Send now" : "Schedule broadcast"}</button>}
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------------------- 8. Help & docs drawer */
const KB = [
  { c: "Getting started", a: ["Passing the four authentication gates", "Reading the portfolio hero card", "Navigating the 43 admin pages", "Keyboard shortcuts (Ctrl+K, G then D)"] },
  { c: "Money movement", a: ["Reversing a transaction safely", "High-value approval thresholds", "Settlement break resolution playbook", "Liquidity pool top-up SOP"] },
  { c: "Risk & fraud", a: ["Triaging a fraud alert in under 4 minutes", "When to blacklist a device fingerprint", "Filing a SAR with the FRA", "Sanctions false-positive workflow"] },
  { c: "Compliance", a: ["CBK monthly return checklist", "KRA excise duty remittance", "ODPC data subject requests", "Audit log evidence export"] },
];

export function HelpDrawer({ open, onClose, onAction }: { open: boolean; onClose: () => void; onAction: (id: string) => void }) {
  const [q, setQ] = useState("");
  const [openArticle, setOpenArticle] = useState<string | null>(null);
  const filtered = KB.map((s) => ({ ...s, a: s.a.filter((x) => x.toLowerCase().includes(q.toLowerCase())) })).filter((s) => s.a.length);
  return (
    <Drawer open={open} onClose={onClose} title="Knowledge base" icon="bi-life-preserver" tone="blue"
      subtitle="142 internal articles · updated 2 days ago"
      footer={<>
        <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => onAction("support")}><i className="bi bi-headset me-1" />Contact platform support</button>
        <button className="btn btn-primary btn-sm" onClick={() => onAction("shortcuts")}><i className="bi bi-keyboard me-1" />Shortcuts</button>
      </>}>
      <div className="pm-search mb-3" style={{ background: "#fff" }}>
        <i className="bi bi-search" /><input placeholder="Search articles…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {filtered.map((s) => (
        <div key={s.c} className="pm-card mb-2">
          <div className="pm-card-head"><h6 className="pm-card-title">{s.c}</h6><Badge tone="grey">{s.a.length}</Badge></div>
          <div className="p-2">
            {s.a.map((a) => (
              <div key={a}>
                <button className="pm-dd-item" onClick={() => setOpenArticle(openArticle === a ? null : a)}>
                  <i className={`bi ${openArticle === a ? "bi-dash-circle" : "bi-file-earmark-text"}`} />
                  <span className="flex-grow-1">{a}</span>
                  <i className={`bi ${openArticle === a ? "bi-chevron-up" : "bi-chevron-down"}`} />
                </button>
                {openArticle === a && (
                  <div className="pm-note m-2">
                    <b>{a}</b><br />
                    This runbook is owned by the Platform Operations guild and reviewed quarterly. Follow the numbered steps, capture evidence in the audit log,
                    and escalate to the on-call Tier 1 admin if any step fails twice. Related pages: Audit Log (31), Incident Response (19).
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      {filtered.length === 0 && <div className="pm-note text-center">No articles match “{q}”.</div>}
    </Drawer>
  );
}

/* ---------------------------------------------------------------- 9. Module blueprint modal (non-built pages) */
export function ModuleBlueprintModal({ page, onClose, onGoLive }: { page: NavPage | null; onClose: () => void; onGoLive: (id: string) => void }) {
  const { push } = useToast();
  if (!page) return null;
  const group = NAV.find((g) => g.pages.some((p) => p.id === page.id));
  return (
    <Modal open onClose={onClose} tone="violet" icon={page.icon} size="md"
      title={`Page ${page.page} — ${page.label}`} subtitle={`${group?.label} · module blueprint`}>
      <div className="pm-modal-body">
        <p style={{ fontSize: ".86rem", color: "#344054" }}>{page.summary}</p>
        <div className="pm-eyebrow mb-2">Sections defined in the blueprint</div>
        <div className="d-flex flex-column gap-2 mb-3">
          {page.sections.map((s, i) => (
            <div key={s} className="d-flex align-items-center gap-2 p-2" style={{ border: "1px solid var(--pm-border)", borderRadius: 10 }}>
              <span className="pm-avatar sm" style={{ background: "#eef1f6", color: "#475467" }}>{i + 1}</span>
              <span style={{ fontSize: ".84rem", fontWeight: 600 }}>{s}</span>
              <Badge tone="grey">Specified</Badge>
            </div>
          ))}
        </div>
        <div className="pm-note">
          <i className="bi bi-info-circle me-1" />Pages 1 and 2 are fully implemented in this build. This module is specified and scheduled — you can jump to a live page below or pin it to your roadmap.
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm me-auto" onClick={() => {
          push({ kind: "success", title: `${page.label} pinned to roadmap`, body: "Product will see this in the next planning review." });
          onClose();
        }}><i className="bi bi-pin-angle me-1" />Pin to roadmap</button>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => { onGoLive("monitor"); onClose(); }}>Open Real-Time Monitor</button>
        <button className="btn btn-primary btn-sm" onClick={() => { onGoLive("dashboard"); onClose(); }}>Open Dashboard</button>
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------------------- 10. Keyboard shortcuts modal */
export function ShortcutsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const rows = [
    ["Ctrl / ⌘ + K", "Open command palette"], ["G then D", "Go to Dashboard"], ["G then M", "Go to Real-Time Monitor"],
    ["N", "Open notification centre"], ["B", "Toggle sidebar collapse"], ["?", "Open this shortcut sheet"],
    ["Esc", "Close top-most modal, drawer or dropdown"], ["/", "Focus the global search field"],
    ["Shift + L", "Emergency lockdown wizard"], ["Shift + E", "Export current view"],
  ];
  return (
    <Modal open={open} onClose={onClose} tone="ink" icon="bi-keyboard" size="sm" title="Keyboard shortcuts" subtitle="Work the console without leaving the keyboard.">
      <div className="pm-modal-body">
        {rows.map(([k, v]) => (
          <div key={k} className="pm-kv"><span className="k">{v}</span><span className="v"><span className="pm-kbd">{k}</span></span></div>
        ))}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-primary btn-sm" onClick={onClose}>Got it</button></div>
    </Modal>
  );
}

/* ---------------------------------------------------------------- 11. Admin profile drawer */
export function ProfileDrawer({ open, onClose, onOpen }: { open: boolean; onClose: () => void; onOpen: (id: string) => void }) {
  return (
    <Drawer open={open} onClose={onClose} title="Joseph Mwangi" subtitle="Tier 0 — Super Admin · joseph.mwangi@paymo.co.ke" icon="bi-person-badge" tone="green">
      <div className="pm-card pm-card-pad mb-3 d-flex align-items-center gap-3">
        <Avatar name="Joseph Mwangi" size="lg" />
        <div className="flex-grow-1">
          <div style={{ fontWeight: 700 }}>Joseph Mwangi</div>
          <div style={{ fontSize: ".76rem", color: "var(--pm-muted)" }}>Founder & Chief Executive · Nairobi HQ</div>
          <div className="d-flex gap-1 mt-1"><Badge tone="green" dot>Online</Badge><Badge tone="violet">Tier 0</Badge><Badge tone="blue">Passkey bound</Badge></div>
        </div>
      </div>
      <div className="pm-card mb-3">
        <div className="pm-card-head"><h6 className="pm-card-title">Security posture</h6><Badge tone="green">Excellent</Badge></div>
        <div className="p-3">
          {[
            ["6-digit PIN", "Set 41 days ago", "green"], ["Passkey (YubiKey 5C)", "Registered · 2 devices", "green"],
            ["TOTP authenticator", "Active · Google Authenticator", "green"], ["Session PIN", "Issued today 07:48", "green"],
            ["Recovery codes", "3 of 5 remaining", "amber"], ["IP whitelist", "2 ranges enforced", "green"],
          ].map(([l, v, t]) => (
            <div key={l} className="pm-kv"><span className="k">{l}</span><span className="v"><Badge tone={t as string}>{v}</Badge></span></div>
          ))}
        </div>
      </div>
      <div className="pm-card">
        <div className="pm-card-head"><h6 className="pm-card-title">Account actions</h6></div>
        <div className="p-2">
          <DDItem icon="bi-diagram-3" label="View role & permission matrix" onClick={() => onOpen("roles")} />
          <DDItem icon="bi-shield-lock" label="Session & device management" onClick={() => onOpen("session")} />
          <DDItem icon="bi-key" label="Rotate recovery codes" hint="Generates 5 new single-use codes" onClick={() => onOpen("recovery")} />
          <DDItem icon="bi-life-preserver" label="Knowledge base" onClick={() => onOpen("help")} />
          <div className="pm-dd-sep" />
          <DDItem icon="bi-box-arrow-right" label="Sign out" danger onClick={() => onOpen("signout")} />
        </div>
      </div>
    </Drawer>
  );
}

/* ---------------------------------------------------------------- 12. Recovery codes modal */
export function RecoveryCodesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  const [generated, setGenerated] = useState(false);
  const [code, setCode] = useState("");
  const codes = ["4K9P-2XQ7", "M3D8-LT51", "9WZ4-BR62", "PN70-VC38", "7HJ2-QY94"];
  return (
    <Modal open={open} onClose={onClose} tone="amber" icon="bi-key-fill" size="sm"
      title="Rotate recovery codes" subtitle="Old codes are invalidated the moment new ones are generated.">
      <div className="pm-modal-body">
        {!generated ? (
          <>
            <div className="pm-note mb-3">You currently have <b>3 of 5</b> unused codes. Rotating issues 5 fresh single-use codes and revokes the remainder.</div>
            <TwoFactorField value={code} onChange={setCode} />
          </>
        ) : (
          <>
            <div className="row g-2 mb-3">
              {codes.map((c) => (
                <div className="col-6" key={c}>
                  <div className="pm-code text-center" style={{ fontSize: ".9rem", letterSpacing: ".08em" }}>{c}</div>
                </div>
              ))}
            </div>
            <div className="pm-note">Print these and store them in the sealed envelope in the Nairobi HQ safe. They will never be shown again.</div>
          </>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        {!generated ? (
          <button className="btn btn-primary btn-sm" disabled={code !== "482913"} onClick={() => setGenerated(true)}>Generate new codes</button>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={() => {
            csvDownload("paymo-recovery-codes.csv", codes.map((c, i) => ({ index: i + 1, code: c, issued: new Date().toISOString() })));
            push({ kind: "success", title: "Recovery codes rotated", body: "5 new codes issued · previous codes revoked." });
            onClose(); setGenerated(false);
          }}><i className="bi bi-download me-1" />Download & finish</button>
        )}
      </div>
    </Modal>
  );
}
