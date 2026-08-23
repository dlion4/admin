import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { NAV, findPage, type NavPage } from "./navigation";
import { Avatar, Badge, DDItem, Dropdown, useToast } from "../components/ui";
import { hhmmss } from "../lib/format";
import {
  BroadcastWizard, CommandPalette, EmergencyLockdownWizard, HelpDrawer, ModuleBlueprintModal,
  NotificationsDrawer, ProfileDrawer, RecoveryCodesModal, RolePermissionsModal, SHELL_NOTIFICATIONS,
  SessionModal, ShortcutsModal, SignOutModal, type ShellNotification,
} from "./ShellModals";

export type ShellAction =
  | "freeze" | "broadcast" | "lockdown" | "export" | "fees" | "recon" | "notifications"
  | "help" | "roles" | "session" | "signout" | "recovery" | "shortcuts" | "support" | "alert";

export function AdminShell({
  active, onNavigate, children, onPageAction,
}: {
  active: string;
  onNavigate: (id: string) => void;
  children: ReactNode;
  onPageAction: (a: ShellAction) => void;
}) {
  const { push } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    () => Object.fromEntries(NAV.map((g) => [g.id, true]))
  );
  const [notifications, setNotifications] = useState<ShellNotification[]>(SHELL_NOTIFICATIONS);
  const [secondsLeft, setSecondsLeft] = useState(6 * 3600 + 42 * 60 + 15);
  const [clock, setClock] = useState(() => new Date());
  const [dark, setDark] = useState(false);

  const [cmdk, setCmdk] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [rolesOpen, setRolesOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [lockdownOpen, setLockdownOpen] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [blueprint, setBlueprint] = useState<NavPage | null>(null);

  const unread = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    const t = setInterval(() => { setSecondsLeft((s) => Math.max(0, s - 1)); setClock(new Date()); }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-pm-theme", dark ? "dark" : "light");
  }, [dark]);

  const handleShellAction = useCallback((id: string) => {
    switch (id) {
      case "lockdown": setLockdownOpen(true); break;
      case "broadcast": setBroadcastOpen(true); break;
      case "notifications": setNotifOpen(true); break;
      case "help": setHelpOpen(true); break;
      case "roles": setRolesOpen(true); break;
      case "session": setSessionOpen(true); break;
      case "signout": setSignOutOpen(true); break;
      case "recovery": setRecoveryOpen(true); break;
      case "shortcuts": setShortcutsOpen(true); break;
      case "support": push({ kind: "info", title: "Platform support paged", body: "Ticket SUP-2026-1188 opened · on-call responds within 15 min." }); break;
      default: onPageAction(id as ShellAction);
    }
  }, [onPageAction, push]);

  useEffect(() => {
    let lastG = 0;
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setCmdk(true); return; }
      if (typing) return;
      if (e.key === "?") { setShortcutsOpen(true); return; }
      if (e.key === "/") { e.preventDefault(); setCmdk(true); return; }
      if (e.key.toLowerCase() === "n") { setNotifOpen(true); return; }
      if (e.key.toLowerCase() === "b") { setCollapsed((c) => !c); return; }
      if (e.shiftKey && e.key.toLowerCase() === "l") { setLockdownOpen(true); return; }
      if (e.key.toLowerCase() === "g") { lastG = Date.now(); return; }
      if (Date.now() - lastG < 900) {
        if (e.key.toLowerCase() === "d") onNavigate("dashboard");
        if (e.key.toLowerCase() === "m") onNavigate("monitor");
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onNavigate]);

  const go = (id: string) => {
    const p = findPage(id);
    if (!p) return;
    if (!p.ready) { setBlueprint(p); return; }
    onNavigate(id);
    setMobileOpen(false);
  };

  const activePage = findPage(active);
  const activeGroup = NAV.find((g) => g.pages.some((p) => p.id === active));
  const sessionPct = useMemo(() => (secondsLeft / (8 * 3600)) * 100, [secondsLeft]);

  return (
    <div className={`pm-shell ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="pm-backdrop-mobile" onClick={() => setMobileOpen(false)} />

      {/* ------------------------------- Sidebar ------------------------------- */}
      <aside className="pm-sidebar">
        <div className="pm-brand">
          <div className="pm-brand-logo">P</div>
          <div className="pm-hide-collapsed">
            <div className="pm-brand-name">PayMo</div>
            <div className="pm-brand-sub">SUPER ADMIN · BAAS</div>
          </div>
          <button className="pm-x ms-auto d-lg-none pm-hide-collapsed" style={{ color: "#7b8aa3" }} onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className="pm-nav-wrap">
          {NAV.map((g) => (
            <div key={g.id}>
              <button className="pm-nav-group d-flex align-items-center gap-2 w-100 border-0 bg-transparent"
                onClick={() => setOpenGroups((o) => ({ ...o, [g.id]: !o[g.id] }))}
                title={collapsed ? g.label : undefined}>
                {collapsed ? <i className={`bi ${g.icon} mx-auto`} style={{ fontSize: ".8rem" }} /> : (
                  <>
                    <span className="flex-grow-1 text-start">{g.label}</span>
                    <i className={`bi ${openGroups[g.id] ? "bi-chevron-down" : "bi-chevron-right"}`} style={{ fontSize: ".6rem" }} />
                  </>
                )}
              </button>
              {(openGroups[g.id] || collapsed) && g.pages.map((p) => (
                <button key={p.id}
                  className={`pm-nav-item ${active === p.id ? "active" : ""} ${p.badge ? "has-badge" : ""}`}
                  onClick={() => go(p.id)}>
                  <i className={`bi ${p.icon} pm-nav-ico`} />
                  <span className="pm-nav-label">{p.label}</span>
                  {p.badge ? <span className="pm-nav-pill">{p.badge > 99 ? "99+" : p.badge}</span> : null}
                  {!p.ready && <i className="bi bi-lock-fill pm-nav-label" style={{ fontSize: ".62rem", color: "#4b5a70", flex: "none" }} />}
                  {collapsed && <span className="pm-tip">{p.label} <span style={{ opacity: .6 }}>· p{p.page}</span></span>}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="pm-sidebar-foot">
          <div className="pm-upgrade pm-hide-collapsed">
            <div className="d-flex align-items-center gap-2 mb-1">
              <i className="bi bi-shield-lock-fill" style={{ color: "#7ee2b0" }} />
              <b style={{ fontSize: ".76rem" }}>4-gate session active</b>
            </div>
            <div style={{ fontSize: ".7rem", opacity: .8 }}>PIN · Passkey · TOTP · Session PIN</div>
            <button className="btn btn-sm w-100 mt-2" style={{ background: "#12b76a", color: "#fff", fontSize: ".75rem" }}
              onClick={() => setSessionOpen(true)}>Manage session</button>
          </div>
          <button className="pm-user-row" onClick={() => setProfileOpen(true)} title="Joseph Mwangi — Super Admin">
            <Avatar name="Joseph Mwangi" />
            <span className="pm-hide-collapsed text-start flex-grow-1" style={{ minWidth: 0 }}>
              <span className="d-block" style={{ fontWeight: 700, fontSize: ".8rem", color: "#fff" }}>Joseph Mwangi</span>
              <span className="d-block" style={{ fontSize: ".68rem", color: "#7b8aa3" }}>Super Admin · Tier 0</span>
            </span>
            <i className="bi bi-three-dots pm-hide-collapsed" style={{ color: "#7b8aa3" }} />
          </button>
        </div>
      </aside>

      {/* ------------------------------- Main ------------------------------- */}
      <div className="pm-main pm-page-content">
        <header className="pm-topbar">
          <button className="pm-icon-btn d-lg-none" onClick={() => setMobileOpen(true)} aria-label="Open menu"><i className="bi bi-list" /></button>
          <button className="pm-icon-btn d-none d-lg-grid" onClick={() => setCollapsed((c) => !c)}
            aria-label="Toggle sidebar" title="Collapse sidebar (B)">
            <i className={`bi ${collapsed ? "bi-arrow-bar-right" : "bi-arrow-bar-left"}`} />
          </button>

          <div className="pm-crumb d-none d-md-block">
            <span>{activeGroup?.label.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}</span>
            <i className="bi bi-chevron-right mx-1" style={{ fontSize: ".62rem" }} />
            <b>{activePage?.label}</b>
            <span className="ms-1" style={{ opacity: .6 }}>· Page {activePage?.page}</span>
          </div>

          <button className="pm-search ms-md-2" onClick={() => setCmdk(true)} style={{ cursor: "pointer" }}>
            <i className="bi bi-search" />
            <span className="flex-grow-1 text-start d-none d-sm-inline">Search users, transactions, pages…</span>
            <span className="pm-kbd d-none d-md-inline">Ctrl K</span>
          </button>

          <div className="ms-auto d-flex align-items-center gap-2">
            <span className="pm-env d-none d-xl-inline">PRODUCTION</span>

            <button className="pm-session d-none d-xxl-flex" onClick={() => setSessionOpen(true)} title="Session details">
              <i className="bi bi-hourglass-split" style={{ color: "var(--pm-green)" }} />
              <span className="mono">{hhmmss(secondsLeft)}</span>
              <span className="pm-session-bar"><span style={{ width: `${sessionPct}%` }} /></span>
            </button>

            <span className="pm-session d-none d-lg-flex mono" title="Nairobi time (EAT)">
              <i className="bi bi-clock" />{clock.toLocaleTimeString("en-GB", { hour12: false })}
            </span>

            {/* Quick actions */}
            <Dropdown width={280} trigger={(o) => (
              <button className={`pm-icon-btn ${o ? "bg-light" : ""}`} title="Quick actions"><i className="bi bi-lightning-charge-fill" style={{ color: "#f79009" }} /></button>
            )}>
              {(close) => (
                <>
                  <div className="pm-dd-head">Quick actions</div>
                  <DDItem icon="bi-snow" label="Freeze customer account" hint="2FA + reason required" onClick={() => { close(); onPageAction("freeze"); }} />
                  <DDItem icon="bi-slash-circle" label="Block a transaction" hint="Opens live monitor" onClick={() => { close(); onNavigate("monitor"); push({ kind: "info", title: "Real-Time Monitor opened", body: "Pick a transaction row to block it." }); }} />
                  <DDItem icon="bi-megaphone" label="Send broadcast" hint="5-step composer" onClick={() => { close(); setBroadcastOpen(true); }} />
                  <DDItem icon="bi-percent" label="Publish fee schedule" hint="2FA required" onClick={() => { close(); onPageAction("fees"); }} />
                  <DDItem icon="bi-arrow-repeat" label="Trigger reconciliation" hint="2FA required" onClick={() => { close(); onPageAction("recon"); }} />
                  <div className="pm-dd-sep" />
                  <DDItem icon="bi-shield-lock-fill" label="Emergency lockdown" hint="Super admin · Shift + L" danger onClick={() => { close(); setLockdownOpen(true); }} />
                </>
              )}
            </Dropdown>

            {/* Notifications */}
            <Dropdown width={340} trigger={(o) => (
              <button className={`pm-icon-btn ${o ? "bg-light" : ""}`} title="Notifications">
                <i className="bi bi-bell" />{unread > 0 && <span className="dot" />}
              </button>
            )}>
              {(close) => (
                <>
                  <div className="d-flex align-items-center justify-content-between px-2 pt-2">
                    <div className="pm-dd-head p-0">Notifications</div>
                    <Badge tone="red">{unread} unread</Badge>
                  </div>
                  <div style={{ maxHeight: 300, overflowY: "auto" }} className="mt-1">
                    {notifications.slice(0, 6).map((n) => (
                      <button key={n.id} className="pm-dd-item align-items-start" onClick={() => { close(); setNotifOpen(true); }}>
                        <i className={`bi ${n.icon}`} style={{ color: n.tone === "red" ? "#f04438" : n.tone === "amber" ? "#f79009" : n.tone === "green" ? "#12b76a" : "#2e90fa" }} />
                        <span className="flex-grow-1">
                          <span className="d-block" style={{ fontWeight: 700, fontSize: ".78rem" }}>{n.title}</span>
                          <span className="d-block" style={{ fontSize: ".7rem", color: "var(--pm-muted)" }}>{n.time} · {n.category}</span>
                        </span>
                        {n.unread && <span className="pm-dot green" style={{ width: 6, height: 6, boxShadow: "none", marginTop: 6 }} />}
                      </button>
                    ))}
                  </div>
                  <div className="pm-dd-sep" />
                  <DDItem icon="bi-check2-all" label="Mark all as read" onClick={() => { setNotifications((p) => p.map((n) => ({ ...n, unread: false }))); close(); push({ kind: "success", title: "All notifications marked read" }); }} />
                  <DDItem icon="bi-arrows-fullscreen" label="Open notification centre" onClick={() => { close(); setNotifOpen(true); }} />
                </>
              )}
            </Dropdown>

            <button className="pm-icon-btn d-none d-sm-grid" title="Knowledge base" onClick={() => setHelpOpen(true)}><i className="bi bi-question-circle" /></button>
            <button className="pm-icon-btn d-none d-sm-grid" title={dark ? "Switch to light" : "Switch to dark"} onClick={() => setDark((d) => !d)}>
              <i className={`bi ${dark ? "bi-sun" : "bi-moon-stars"}`} />
            </button>

            {/* Profile */}
            <Dropdown width={260} trigger={() => (
              <button className="d-flex align-items-center gap-2 px-1 py-1 border-0 bg-transparent">
                <Avatar name="Joseph Mwangi" />
                <span className="d-none d-xl-block text-start">
                  <span className="d-block" style={{ fontWeight: 700, fontSize: ".78rem", lineHeight: 1.1 }}>Joseph Mwangi</span>
                  <span className="d-block" style={{ fontSize: ".67rem", color: "var(--pm-muted)" }}>Super Admin</span>
                </span>
                <i className="bi bi-chevron-down d-none d-xl-block" style={{ fontSize: ".62rem", color: "var(--pm-muted)" }} />
              </button>
            )}>
              {(close) => (
                <>
                  <div className="px-2 py-2 d-flex align-items-center gap-2">
                    <Avatar name="Joseph Mwangi" size="lg" />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: ".84rem" }}>Joseph Mwangi</div>
                      <div style={{ fontSize: ".7rem", color: "var(--pm-muted)" }}>joseph.mwangi@paymo.co.ke</div>
                      <div className="mt-1 d-flex gap-1"><Badge tone="green" dot>Online</Badge><Badge tone="violet">Tier 0</Badge></div>
                    </div>
                  </div>
                  <div className="pm-dd-sep" />
                  <DDItem icon="bi-person-badge" label="Admin profile" onClick={() => { close(); setProfileOpen(true); }} />
                  <DDItem icon="bi-diagram-3" label="Role & permissions" hint="64-cell matrix" onClick={() => { close(); setRolesOpen(true); }} />
                  <DDItem icon="bi-shield-lock" label="Session & devices" onClick={() => { close(); setSessionOpen(true); }} />
                  <DDItem icon="bi-key" label="Rotate recovery codes" onClick={() => { close(); setRecoveryOpen(true); }} />
                  <DDItem icon="bi-keyboard" label="Keyboard shortcuts" onClick={() => { close(); setShortcutsOpen(true); }} />
                  <div className="pm-dd-sep" />
                  <DDItem icon="bi-box-arrow-right" label="Sign out" danger onClick={() => { close(); setSignOutOpen(true); }} />
                </>
              )}
            </Dropdown>
          </div>
        </header>

        <main className="pm-content">{children}</main>

        <footer className="pm-footer">
          <div className="d-flex flex-wrap align-items-center gap-3">
            <span>PayMo Super Admin · {activePage ? `Page ${activePage.page}: ${activePage.label}` : ""}</span>
            <span className="ms-auto d-flex flex-wrap gap-3">
              <span><i className="bi bi-shield-check me-1" style={{ color: "var(--pm-green)" }} />CBK licensed</span>
              <span><i className="bi bi-bank me-1" style={{ color: "var(--pm-green)" }} />KRA compliant</span>
              <span><i className="bi bi-lock me-1" style={{ color: "var(--pm-green)" }} />AES-256-GCM</span>
              <button className="btn btn-link btn-sm p-0" style={{ fontSize: ".78rem" }} onClick={() => setHelpOpen(true)}>Docs</button>
              <button className="btn btn-link btn-sm p-0" style={{ fontSize: ".78rem" }} onClick={() => setShortcutsOpen(true)}>Shortcuts</button>
            </span>
          </div>
        </footer>
      </div>

      {/* ------------------------------- Shell modals ------------------------------- */}
      <CommandPalette open={cmdk} onClose={() => setCmdk(false)} onNavigate={go} onAction={handleShellAction} />
      <NotificationsDrawer open={notifOpen} onClose={() => setNotifOpen(false)} notifications={notifications}
        onMarkAll={() => { setNotifications((p) => p.map((n) => ({ ...n, unread: false }))); push({ kind: "success", title: "All notifications marked read" }); }}
        onOpenItem={(n) => { setNotifications((p) => p.map((x) => x.id === n.id ? { ...x, unread: false } : x)); push({ kind: "info", title: n.title, body: `${n.id} acknowledged — routed to ${n.category} queue.` }); }} />
      <RolePermissionsModal open={rolesOpen} onClose={() => setRolesOpen(false)} />
      <SessionModal open={sessionOpen} onClose={() => setSessionOpen(false)} secondsLeft={secondsLeft} onExtend={() => setSecondsLeft(8 * 3600)} />
      <SignOutModal open={signOutOpen} onClose={() => setSignOutOpen(false)} />
      <EmergencyLockdownWizard open={lockdownOpen} onClose={() => setLockdownOpen(false)} />
      <BroadcastWizard open={broadcastOpen} onClose={() => setBroadcastOpen(false)} />
      <HelpDrawer open={helpOpen} onClose={() => setHelpOpen(false)} onAction={(id) => { setHelpOpen(false); handleShellAction(id); }} />
      <ProfileDrawer open={profileOpen} onClose={() => setProfileOpen(false)} onOpen={(id) => { setProfileOpen(false); handleShellAction(id); }} />
      <RecoveryCodesModal open={recoveryOpen} onClose={() => setRecoveryOpen(false)} />
      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <ModuleBlueprintModal page={blueprint} onClose={() => setBlueprint(null)} onGoLive={(id) => { onNavigate(id); setMobileOpen(false); }} />
    </div>
  );
}
