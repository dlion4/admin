import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ACTIVE_SESSIONS,
  DEMO,
  GATE_SPECS,
  SESSION_POLICY,
  THREAT_SIGNALS,
  TIER_TABLE,
  roleById,
  scoreFor,
  type RoleId,
} from "./data/roles";
import RoleStage from "./components/RoleStage";
import { GrantedStage, IdentityStage, PasskeyGate, PinGate, SessionPinGate, TotpGate } from "./components/Gates";
import { Badge, Drawer, Modal, Popover, StatDot, Tabs, ToastHost, fmtMs, useToast } from "./components/ui";

type StageId = "identity" | "role" | "pin" | "passkey" | "totp" | "session" | "granted";

const STEPS: { id: StageId; label: string; hint: string; icon: string; tone: string }[] = [
  { id: "identity", label: "Credentials", hint: "Email + password", icon: "📧", tone: "var(--bs-secondary)" },
  { id: "role", label: "Role context", hint: "Declare your clearance", icon: "🪪", tone: "var(--bs-primary)" },
  { id: "pin", label: "Gate 1 · Admin PIN", hint: "6 digits · 3 attempts", icon: "🔢", tone: "var(--bs-primary)" },
  { id: "passkey", label: "Gate 2 · Passkey", hint: "FIDO2 / WebAuthn", icon: "🔑", tone: "var(--bs-purple)" },
  { id: "totp", label: "Gate 3 · TOTP", hint: "30-second rotation", icon: "⏱️", tone: "var(--bs-teal)" },
  { id: "session", label: "Gate 4 · Session PIN", hint: "Super admin issued", icon: "🛡️", tone: "var(--bs-danger)" },
  { id: "granted", label: "Access granted", hint: "Dashboard unlocked", icon: "✅", tone: "var(--bs-success)" },
];

interface AuditEntry {
  id: number;
  ts: string;
  msg: string;
  tone: string;
  detail?: string;
}

const FLOW_ASCII = `[Login Page] → Enter email + password
      ↓
[Role Layer] → Declare admin role & clearance
      ↓
[Gate 1] → Enter 6-digit PIN
      ↓
[Gate 2] → Touch security key / biometric
      ↓
[Gate 3] → Enter TOTP code from authenticator app
      ↓
[Gate 4] → Enter super admin–issued session PIN
      ↓
[Admin Dashboard] → Access granted`;

function Shell() {
  const toast = useToast();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [stage, setStage] = useState<StageId>("identity");
  const [done, setDone] = useState<StageId[]>([]);
  const [roleId, setRoleId] = useState<RoleId | null>(null);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [lockdownOpen, setLockdownOpen] = useState(false);
  const [lockdownWord, setLockdownWord] = useState("");
  const [abortOpen, setAbortOpen] = useState(false);
  const [window_, setWindow] = useState(600);
  const [clock, setClock] = useState(() => new Date());
  const [consoleTab, setConsoleTab] = useState("audit");
  const [helpTab, setHelpTab] = useState("gates");

  const role = roleId ? roleById(roleId) : null;
  const sessionId = useMemo(() => `SES-${Math.random().toString(36).slice(2, 8).toUpperCase()}-2026`, [done.length === 6]);

  /* theme */
  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
  }, [theme]);

  /* clock */
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* keyboard shortcuts */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "?") setHelpOpen(true);
      if (e.key.toLowerCase() === "a" && e.shiftKey) setConsoleOpen(true);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const log = useCallback((msg: string, tone = "var(--bs-primary)", detail?: string) => {
    setAudit((a) =>
      [
        {
          id: Date.now() + Math.random(),
          ts: new Date().toLocaleTimeString("en-GB", { hour12: false }),
          msg,
          tone,
          detail,
        },
        ...a,
      ].slice(0, 60),
    );
  }, []);

  useEffect(() => {
    log("Access control gateway opened — Page 0", "var(--bs-info)", `${DEMO.ip} · ${DEMO.device} · ${DEMO.location}`);
  }, [log]);

  /* authentication window */
  useEffect(() => {
    if (stage === "granted") return;
    const t = setInterval(() => {
      setWindow((w) => {
        if (w <= 1) {
          clearInterval(t);
          setAbortOpen(true);
          return 0;
        }
        return w - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [stage]);

  const gateCount = ["pin", "passkey", "totp", "session"].filter((g) => done.includes(g as StageId)).length;
  const maxIndex = STEPS.findIndex((s) => s.id === stage);

  const complete = (id: StageId, next: StageId) => {
    setDone((d) => (d.includes(id) ? d : [...d, id]));
    setStage(next);
    setWindow(600);
  };

  const hardReset = (reason: string) => {
    setStage("identity");
    setDone([]);
    setWindow(600);
    setLockdownWord("");
    log(reason, "var(--bs-danger)");
  };

  const stepStatus = (i: number): "done" | "current" | "todo" => {
    const s = STEPS[i];
    if (done.includes(s.id)) return "done";
    if (s.id === stage) return "current";
    return "todo";
  };

  return (
    <div className="relative min-h-screen">
      <div className="pm-app-bg" />
      <div className="pm-app-grid" />
      <div className="pm-scanline" />

      <div className="relative z-10 mx-auto max-w-[95rem] px-3 py-4 sm:px-5 lg:px-7">
        {/* ================= Header ================= */}
        <header className="pm-card mb-4 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className="grid h-10 w-10 place-items-center rounded-xl text-lg font-black"
                style={{
                  background: "linear-gradient(140deg, var(--bs-primary), var(--bs-purple))",
                  color: "#fff",
                  boxShadow: "0 10px 26px -12px var(--bs-primary)",
                }}
              >
                P
              </div>
              <div>
                <p className="text-[0.95rem] leading-none font-extrabold tracking-tight">
                  PayMo <span className="pm-faint font-medium">Admin</span>
                </p>
                <p className="pm-faint mt-1 text-[0.66rem] tracking-[0.18em] uppercase">
                  Page 0 · Access Control
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-2 lg:flex">
              <Badge tone="var(--bs-danger)" solid>
                <StatDot tone="#fff" /> Production
              </Badge>
              <span className="pm-chip">
                <StatDot /> {DEMO.ip}
              </span>
              <span className="pm-chip">🕒 {clock.toLocaleTimeString("en-GB", { hour12: false })} EAT</span>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              <div className="hidden text-right sm:block">
                <p className="pm-faint text-[0.6rem] tracking-widest uppercase">Auth window</p>
                <p
                  className="pm-mono text-[0.82rem] font-bold"
                  style={{ color: window_ < 60 ? "var(--bs-danger)" : "var(--pm-text)" }}
                >
                  {fmtMs(window_)}
                </p>
              </div>
              <div className="hidden h-8 w-24 sm:block">
                <div className="pm-progress mt-2">
                  <div
                    className={`pm-progress-bar ${window_ < 60 ? "danger" : ""}`}
                    style={{ width: `${(window_ / 600) * 100}%` }}
                  />
                </div>
              </div>
              <Popover label={<>🧪 <span className="hidden sm:inline">Demo keys</span></>} tone="var(--bs-info)">
                <p className="mb-2 text-[0.78rem] font-bold">Walkthrough credentials</p>
                <div className="space-y-1.5">
                  {[
                    ["Email", DEMO.email],
                    ["Password", DEMO.password],
                    ["Gate 1 · PIN", DEMO.pin],
                    ["Gate 2 · Passkey", "Pick YubiKey → Authenticate"],
                    ["Gate 3 · TOTP", "Read the simulated authenticator"],
                    ["Gate 4 · Session PIN", "Request it from the super admin"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-start justify-between gap-2">
                      <span className="pm-faint text-[0.68rem] whitespace-nowrap">{k}</span>
                      <span className="pm-mono text-right text-[0.7rem]">{v}</span>
                    </div>
                  ))}
                </div>
                <p className="pm-faint mt-2 text-[0.66rem]">
                  Every gate also has a fallback path: PIN recovery, 12-word phrase, backup codes, re-issue.
                </p>
              </Popover>
              <button className="pm-btn pm-btn-ghost pm-btn-sm" onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}>
                {theme === "dark" ? "🌙" : "☀️"} <span className="hidden sm:inline">{theme === "dark" ? "Dark" : "Light"}</span>
              </button>
              <button className="pm-btn pm-btn-ghost pm-btn-sm" onClick={() => setHelpOpen(true)}>
                ❓ <span className="hidden sm:inline">Docs</span>
              </button>
              <button className="pm-btn pm-btn-dark pm-btn-sm" onClick={() => setConsoleOpen(true)}>
                🛰️ <span className="hidden sm:inline">Security console</span>
                <span className="pm-mono ml-1 rounded-full px-1.5 text-[0.6rem]" style={{ background: "var(--bs-primary)", color: "#fff" }}>
                  {audit.length}
                </span>
              </button>
              <button className="pm-btn pm-btn-danger pm-btn-sm" onClick={() => setLockdownOpen(true)}>
                🚨 <span className="hidden sm:inline">Lockdown</span>
              </button>
            </div>
          </div>

          {/* gate flow strip */}
          <div className="mt-3 flex items-center gap-1 overflow-x-auto pt-3" style={{ borderTop: "1px solid var(--pm-border)" }}>
            {STEPS.map((s, i) => {
              const st = stepStatus(i);
              return (
                <button
                  key={s.id}
                  onClick={() => (done.includes(s.id) || i <= maxIndex) && setStage(s.id)}
                  className="flex flex-none items-center gap-1.5 rounded-lg px-2 py-1 text-[0.7rem] font-semibold transition-all"
                  style={{
                    background: st === "current" ? `color-mix(in srgb, ${s.tone} 18%, transparent)` : "transparent",
                    color: st === "todo" ? "var(--pm-faint)" : st === "done" ? "var(--bs-success)" : s.tone,
                    border: `1px solid ${st === "current" ? `color-mix(in srgb, ${s.tone} 45%, transparent)` : "transparent"}`,
                    cursor: done.includes(s.id) || i <= maxIndex ? "pointer" : "not-allowed",
                  }}
                >
                  <span>{st === "done" ? "✔" : s.icon}</span>
                  <span className="hidden md:inline">{s.label}</span>
                  {i < STEPS.length - 1 && <span className="pm-faint ml-1">→</span>}
                </button>
              );
            })}
          </div>
        </header>

        {/* ================= Hero ================= */}
        {stage !== "granted" && (
          <section className="mb-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <h1 className="text-2xl leading-tight font-extrabold sm:text-[1.9rem]">
                Multi-Layer Admin Authentication
              </h1>
              <p className="pm-muted mt-1 max-w-3xl text-[0.85rem]">
                Before any admin reaches the PayMo dashboard they declare a role and pass{" "}
                <b className="text-[var(--pm-text)]">four sequential authentication gates</b>. Nothing is granted
                implicitly — every gate, every failure and every override lands in the immutable audit ledger.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {GATE_SPECS.map((g) => {
                const isDone = done.includes(g.key as StageId);
                const isNow = stage === g.key;
                return (
                  <div
                    key={g.key}
                    className="pm-panel flex items-center gap-2 px-2.5 py-2"
                    style={{
                      borderColor: isNow ? `color-mix(in srgb, ${g.tone} 55%, transparent)` : undefined,
                      background: isDone ? "color-mix(in srgb, var(--bs-success) 12%, transparent)" : undefined,
                    }}
                  >
                    <span className="text-base">{isDone ? "✅" : g.icon}</span>
                    <div>
                      <p className="text-[0.7rem] leading-none font-bold">{g.short}</p>
                      <p className="pm-faint text-[0.6rem]">Gate {g.index}</p>
                    </div>
                  </div>
                );
              })}
              <div className="pm-panel px-3 py-2 text-center">
                <p className="pm-mono text-[1.1rem] leading-none font-bold" style={{ color: "var(--bs-success)" }}>
                  {gateCount}/4
                </p>
                <p className="pm-faint text-[0.6rem] tracking-wider uppercase">cleared</p>
              </div>
            </div>
          </section>
        )}

        {/* ================= Body ================= */}
        <div className="grid gap-4 xl:grid-cols-[16.5rem_minmax(0,1fr)]">
          {/* Stepper rail */}
          <aside className="pm-card hidden self-start p-3 xl:sticky xl:top-4 xl:block">
            <p className="pm-faint mb-2 px-1 text-[0.62rem] tracking-widest uppercase">Authentication flow</p>
            <div className="space-y-1">
              {STEPS.map((s, i) => {
                const st = stepStatus(i);
                const clickable = done.includes(s.id) || i <= maxIndex;
                return (
                  <div key={s.id} className={`pm-step ${st}`} onClick={() => clickable && setStage(s.id)} style={{ cursor: clickable ? "pointer" : "default" }}>
                    {i < STEPS.length - 1 && <span className="pm-step-line" />}
                    <span className="pm-step-dot">{st === "done" ? "✔" : i === 0 ? "0" : i}</span>
                    <div className="min-w-0">
                      <p className="truncate text-[0.78rem] font-semibold">{s.label}</p>
                      <p className="pm-faint truncate text-[0.66rem]">{s.hint}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="my-3 h-px" style={{ background: "var(--pm-border)" }} />

            {role ? (
              <div className="pm-panel p-3" style={{ borderColor: `color-mix(in srgb, ${role.color} 40%, transparent)` }}>
                <p className="pm-faint text-[0.6rem] tracking-widest uppercase">Authenticating as</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-lg">{role.icon}</span>
                  <div className="min-w-0">
                    <p className="truncate text-[0.8rem] font-bold">{role.name}</p>
                    <p className="pm-faint text-[0.65rem]">
                      Tier {role.tier} · {scoreFor(role.id).full} perms
                    </p>
                  </div>
                </div>
                <button className="pm-btn pm-btn-ghost pm-btn-sm pm-btn-block mt-2" onClick={() => setStage("role")}>
                  Change role
                </button>
              </div>
            ) : (
              <div className="pm-panel p-3 text-[0.72rem]">
                <p className="pm-faint">No role declared yet. Gate policies are applied once you choose one.</p>
              </div>
            )}

            <div className="mt-3 space-y-1.5">
              <p className="pm-faint px-1 text-[0.6rem] tracking-widest uppercase">Threat signals</p>
              {THREAT_SIGNALS.slice(0, 4).map((t) => (
                <div key={t.label} className="flex items-center gap-2 text-[0.7rem]">
                  <StatDot tone={t.tone} />
                  <span className="pm-muted flex-1 truncate">{t.label}</span>
                  <span className="pm-faint truncate">{t.value}</span>
                </div>
              ))}
            </div>
          </aside>

          {/* Stage */}
          <main className="min-w-0">
            {stage === "identity" && <IdentityStage log={log} onDone={() => complete("identity", "role")} />}

            {stage === "role" && (
              <RoleStage
                selected={roleId}
                onSelect={setRoleId}
                log={log}
                onContinue={() => {
                  if (!roleId) {
                    toast({ tone: "warning", icon: "🪪", title: "Pick a role first", body: "The gates adapt to the clearance you declare." });
                    return;
                  }
                  log(`Role context locked — ${roleById(roleId).name}`, roleById(roleId).color, "Gate policy applied");
                  complete("role", "pin");
                }}
              />
            )}

            {role && stage === "pin" && <PinGate role={role} log={log} onDone={() => complete("pin", "passkey")} />}
            {role && stage === "passkey" && <PasskeyGate role={role} log={log} onDone={() => complete("passkey", "totp")} />}
            {role && stage === "totp" && <TotpGate role={role} log={log} onDone={() => complete("totp", "session")} />}
            {role && stage === "session" && (
              <SessionPinGate role={role} log={log} onDone={() => complete("session", "granted")} />
            )}
            {role && stage === "granted" && (
              <GrantedStage
                role={role}
                sessionId={sessionId}
                log={log}
                onOpenAudit={() => {
                  setConsoleTab("audit");
                  setConsoleOpen(true);
                }}
                onLogout={() => {
                  setDone(["identity"]);
                  setStage("role");
                  setWindow(600);
                }}
              />
            )}

            {!role && ["pin", "passkey", "totp", "session", "granted"].includes(stage) && (
              <div className="pm-card p-8 text-center">
                <p className="text-[0.9rem] font-bold">Role context missing</p>
                <p className="pm-muted mt-1 text-[0.8rem]">Declare an admin role before the gates can be evaluated.</p>
                <button className="pm-btn pm-btn-primary mt-3" onClick={() => setStage("role")}>
                  Choose a role
                </button>
              </div>
            )}
          </main>
        </div>

        <footer className="pm-faint mt-6 flex flex-wrap items-center justify-between gap-2 pb-4 text-[0.68rem]">
          <span>PayMo Digital Bank BAAS · Admin Dashboard Blueprint v2.0 · Page 0 of 43</span>
          <span className="pm-mono">CONFIDENTIAL — INTERNAL USE ONLY · AES-256-GCM · CSRF synchronizer token</span>
        </footer>
      </div>

      {/* ================= Security console drawer ================= */}
      <Drawer
        open={consoleOpen}
        onClose={() => setConsoleOpen(false)}
        title="🛰️ Security Console"
        subtitle="Live audit trail, sessions and policy for this authentication attempt"
        width="34rem"
      >
        <Tabs
          active={consoleTab}
          onChange={setConsoleTab}
          tabs={[
            { id: "audit", label: "Audit trail", icon: "📜", badge: audit.length },
            { id: "sessions", label: "Sessions", icon: "🖥️" },
            { id: "policy", label: "Policy", icon: "📐" },
            { id: "threat", label: "Threats", icon: "⚠️" },
          ]}
        />
        <div className="pt-3">
          {consoleTab === "audit" && (
            <div className="space-y-2">
              {audit.map((a) => (
                <div key={a.id} className="pm-panel p-2.5" style={{ borderLeft: `3px solid ${a.tone}` }}>
                  <div className="flex items-start gap-2">
                    <span className="pm-mono pm-faint text-[0.66rem]">{a.ts}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[0.78rem] font-semibold">{a.msg}</p>
                      {a.detail && <p className="pm-faint pm-mono mt-0.5 text-[0.66rem]">{a.detail}</p>}
                    </div>
                  </div>
                </div>
              ))}
              {audit.length === 0 && <p className="pm-muted text-[0.8rem]">No events yet.</p>}
            </div>
          )}
          {consoleTab === "sessions" && (
            <div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--pm-border)" }}>
              <table className="pm-table">
                <thead>
                  <tr>
                    <th>Admin</th>
                    <th>IP / device</th>
                    <th>State</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {ACTIVE_SESSIONS.map((s) => (
                    <tr key={s.admin}>
                      <td>
                        <p className="font-semibold">{s.admin}</p>
                        <p className="pm-faint text-[0.66rem]">{s.role}</p>
                      </td>
                      <td className="pm-mono text-[0.68rem]">
                        {s.ip}
                        <br />
                        <span className="pm-faint">{s.device}</span>
                      </td>
                      <td>
                        <Badge tone={s.state === "Active" ? "var(--bs-success)" : "var(--bs-warning)"}>{s.state}</Badge>
                      </td>
                      <td>
                        <button
                          className="pm-btn pm-btn-outline-danger pm-btn-sm"
                          onClick={() => {
                            log(`Forced logout — ${s.admin}`, "var(--bs-danger)", `${s.ip} · by super admin`);
                            toast({ tone: "danger", icon: "⏻", title: "Session terminated", body: `${s.admin} was signed out of all devices.` });
                          }}
                        >
                          Kill
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {consoleTab === "policy" && (
            <div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--pm-border)" }}>
              <table className="pm-table">
                <thead>
                  <tr>
                    <th>Setting</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {SESSION_POLICY.map((p) => (
                    <tr key={p.setting}>
                      <td className="font-semibold whitespace-nowrap">{p.setting}</td>
                      <td className="pm-muted">{p.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {consoleTab === "threat" && (
            <div className="grid gap-2 sm:grid-cols-2">
              {THREAT_SIGNALS.map((t) => (
                <div key={t.label} className="pm-panel p-3">
                  <div className="flex items-center gap-2">
                    <StatDot tone={t.tone} />
                    <p className="text-[0.76rem] font-semibold">{t.label}</p>
                  </div>
                  <p className="pm-muted mt-1 text-[0.74rem]">{t.value}</p>
                </div>
              ))}
              <div className="pm-panel p-3 sm:col-span-2">
                <p className="pm-faint text-[0.62rem] tracking-widest uppercase">Device fingerprint</p>
                <p className="pm-mono mt-1 text-[0.76rem]">{DEMO.device}</p>
                <p className="pm-faint mt-1 text-[0.7rem]">{DEMO.location}</p>
              </div>
            </div>
          )}
        </div>
      </Drawer>

      {/* ================= Help modal ================= */}
      <Modal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="Access Control Handbook"
        subtitle="Page 0 · the four gates, the flow, session rules and the role ladder"
        icon="📘"
        width="58rem"
      >
        <Tabs
          active={helpTab}
          onChange={setHelpTab}
          tabs={[
            { id: "gates", label: "The 4 gates", icon: "🚪" },
            { id: "flow", label: "Flow", icon: "🔀" },
            { id: "session", label: "Session management", icon: "⏳" },
            { id: "tiers", label: "Role tiers", icon: "🏛️" },
          ]}
        />
        <div className="pt-3">
          {helpTab === "gates" && (
            <div className="grid gap-3 md:grid-cols-2">
              {GATE_SPECS.map((g) => (
                <div key={g.key} className="pm-panel p-3" style={{ borderColor: `color-mix(in srgb, ${g.tone} 35%, transparent)` }}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{g.icon}</span>
                    <p className="text-[0.85rem] font-bold">
                      Gate {g.index}: {g.title}
                    </p>
                  </div>
                  <table className="pm-table mt-2">
                    <tbody>
                      {g.rules.map((r) => (
                        <tr key={r.field}>
                          <td className="font-semibold whitespace-nowrap">{r.field}</td>
                          <td className="pm-muted">{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
          {helpTab === "flow" && (
            <div className="pm-panel p-4">
              <pre className="pm-mono overflow-x-auto text-[0.75rem] leading-relaxed">{FLOW_ASCII}</pre>
              <p className="pm-muted mt-3 text-[0.78rem]">
                Logging out of the dashboard always redirects here — the role layer is the entry point of every session.
              </p>
            </div>
          )}
          {helpTab === "session" && (
            <table className="pm-table">
              <thead>
                <tr>
                  <th>Setting</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {SESSION_POLICY.map((p) => (
                  <tr key={p.setting}>
                    <td className="font-semibold whitespace-nowrap">{p.setting}</td>
                    <td className="pm-muted">{p.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {helpTab === "tiers" && (
            <table className="pm-table">
              <thead>
                <tr>
                  <th>Tier</th>
                  <th>Role</th>
                  <th>Can create</th>
                  <th>Reports to</th>
                </tr>
              </thead>
              <tbody>
                {TIER_TABLE.map((t) => (
                  <tr key={t.tier}>
                    <td className="pm-mono font-bold">{t.tier}</td>
                    <td className="font-semibold">{t.role}</td>
                    <td className="pm-muted">{t.canCreate}</td>
                    <td className="pm-muted">{t.reportsTo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Modal>

      {/* ================= Emergency lockdown ================= */}
      <Modal
        open={lockdownOpen}
        onClose={() => setLockdownOpen(false)}
        title="Emergency platform lockdown"
        subtitle="Terminates every admin session and freezes all money movement"
        icon="🚨"
        tone="var(--bs-danger)"
        width="34rem"
        footer={
          <>
            <button className="pm-btn pm-btn-ghost pm-btn-sm" onClick={() => setLockdownOpen(false)}>
              Cancel
            </button>
            <button
              className="pm-btn pm-btn-danger pm-btn-sm"
              disabled={lockdownWord !== "LOCKDOWN"}
              onClick={() => {
                setLockdownOpen(false);
                hardReset("🚨 EMERGENCY LOCKDOWN executed — all sessions terminated");
                toast({ tone: "danger", icon: "🚨", title: "Platform lockdown engaged", body: "All 4 active admin sessions killed. Gateway reset to step 1." });
              }}
            >
              Execute lockdown
            </button>
          </>
        }
      >
        <div
          className="rounded-xl p-3 text-[0.78rem]"
          style={{
            background: "color-mix(in srgb, var(--bs-danger) 12%, transparent)",
            border: "1px solid color-mix(in srgb, var(--bs-danger) 38%, transparent)",
          }}
        >
          This action requires super admin clearance plus 2FA in production. It will kill{" "}
          <b>{ACTIVE_SESSIONS.length} active sessions</b>, block new logins, halt settlements and page the on-call
          incident commander.
        </div>
        <label className="pm-label mt-3">
          Type <code className="pm-mono">LOCKDOWN</code> to confirm
        </label>
        <input
          className="pm-input pm-mono tracking-[0.3em] uppercase"
          value={lockdownWord}
          onChange={(e) => setLockdownWord(e.target.value.toUpperCase())}
          placeholder="LOCKDOWN"
        />
      </Modal>

      {/* ================= Window expired ================= */}
      <Modal
        open={abortOpen}
        onClose={() => setAbortOpen(false)}
        title="Authentication window expired"
        subtitle="The 10-minute gate window elapsed before all four gates were cleared"
        icon="⏳"
        tone="var(--bs-warning)"
        width="30rem"
        footer={
          <button
            className="pm-btn pm-btn-primary pm-btn-sm"
            onClick={() => {
              setAbortOpen(false);
              hardReset("Authentication window expired — flow restarted");
            }}
          >
            Restart authentication
          </button>
        }
      >
        <p className="pm-muted text-[0.82rem]">
          For safety the partially completed factor chain has been discarded. Nothing you entered is retained; start
          again from your corporate credentials.
        </p>
      </Modal>
    </div>
  );
}

export default function App() {
  return (
    <ToastHost>
      <Shell />
    </ToastHost>
  );
}
