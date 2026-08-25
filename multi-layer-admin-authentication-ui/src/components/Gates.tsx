import { useEffect, useRef, useState } from "react";
import {
  AUTHENTICATORS,
  BACKUP_CODES,
  DEMO,
  GATE_SPECS,
  RECOVERY_PHRASE,
  type GateSpec,
  type Role,
} from "../data/roles";
import { Badge, Keypad, Modal, OtpInput, Ring, Tabs, fmtMs, useCountdown, useTotp, useToast } from "./ui";

export type LogFn = (msg: string, tone?: string, detail?: string) => void;

interface GateProps {
  role: Role;
  onDone: () => void;
  log: LogFn;
}

/* ------------------------------------------------------------------ */
/* Shell                                                               */
/* ------------------------------------------------------------------ */

function GateShell({
  spec,
  status,
  children,
  aside,
}: {
  spec: GateSpec;
  status?: React.ReactNode;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  const [rulesOpen, setRulesOpen] = useState(false);
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="pm-card pm-fade-up p-5">
        <div className="mb-4 flex items-start gap-3">
          <span
            className="pm-ring-pulse relative grid h-11 w-11 flex-none place-items-center rounded-2xl text-xl"
            style={{
              ["--tone" as string]: spec.tone,
              background: `color-mix(in srgb, ${spec.tone} 18%, transparent)`,
              border: `1px solid color-mix(in srgb, ${spec.tone} 42%, transparent)`,
            }}
          >
            {spec.icon}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={spec.tone}>Gate {spec.index} of 4</Badge>
              {status}
            </div>
            <h2 className="mt-1.5 text-[1.05rem] leading-tight font-bold">{spec.title}</h2>
            <p className="pm-muted text-[0.78rem]">{spec.blurb}</p>
          </div>
          <button className="pm-btn pm-btn-ghost pm-btn-sm" onClick={() => setRulesOpen(true)}>
            ⓘ Rules
          </button>
        </div>
        {children}
      </div>

      <aside className="space-y-3">
        <div className="pm-card p-4">
          <p className="pm-faint mb-2 text-[0.62rem] tracking-widest uppercase">Gate policy</p>
          <div className="space-y-2">
            {spec.rules.map((r) => (
              <div key={r.field}>
                <p className="text-[0.7rem] font-bold" style={{ color: spec.tone }}>
                  {r.field}
                </p>
                <p className="pm-muted text-[0.74rem] leading-snug">{r.value}</p>
              </div>
            ))}
          </div>
        </div>
        {aside}
      </aside>

      <Modal
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
        title={spec.title}
        subtitle={`Gate ${spec.index} enforcement rules`}
        icon={spec.icon}
        tone={spec.tone}
        width="38rem"
      >
        <table className="pm-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Rules</th>
            </tr>
          </thead>
          <tbody>
            {spec.rules.map((r) => (
              <tr key={r.field}>
                <td className="font-semibold whitespace-nowrap">{r.field}</td>
                <td className="pm-muted">{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Modal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stage: credentials                                                  */
/* ------------------------------------------------------------------ */

export function IdentityStage({ onDone, log }: { onDone: () => void; log: LogFn }) {
  const toast = useToast();
  const [email, setEmail] = useState(DEMO.email);
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [caps, setCaps] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@paymo.co.ke")) {
      setErr("Only @paymo.co.ke corporate identities may reach the admin gateway.");
      return;
    }
    if (pw !== DEMO.password) {
      setErr("Invalid credentials. Attempt recorded in the audit ledger.");
      log("Failed credential attempt", "var(--bs-danger)", `${email} · ${DEMO.ip}`);
      toast({ tone: "danger", icon: "⛔", title: "Credentials rejected", body: "Password does not match directory record." });
      return;
    }
    setErr("");
    setBusy(true);
    log("Directory credentials verified", "var(--bs-success)", `${email} · LDAP + password policy OK`);
    setTimeout(() => {
      setBusy(false);
      toast({ tone: "success", icon: "✅", title: "Identity verified", body: "Now declare the role context for this session." });
      onDone();
    }, 1100);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <form onSubmit={submit} className="pm-card pm-fade-up p-5">
        <div className="mb-4">
          <Badge tone="var(--bs-primary)">Step 1 · Identity</Badge>
          <h2 className="mt-2 text-[1.15rem] font-bold">Corporate credentials</h2>
          <p className="pm-muted text-[0.8rem]">
            Email + password is only the doorbell. Four hardware-grade gates follow before the dashboard unlocks.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="pm-label">Admin email</label>
            <input
              className="pm-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@paymo.co.ke"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="pm-label">Password</label>
            <div className="relative">
              <input
                className={`pm-input pr-20 ${err && pw !== DEMO.password ? "is-invalid" : ""}`}
                type={show ? "text" : "password"}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                onKeyUp={(e) => setCaps(e.getModifierState?.("CapsLock") ?? false)}
                placeholder="••••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="pm-btn pm-btn-ghost pm-btn-sm absolute top-1/2 right-1.5 -translate-y-1/2"
                onClick={() => setShow((s) => !s)}
              >
                {show ? "🙈" : "👁️"}
              </button>
            </div>
            {caps && <p className="text-warning mt-1 text-[0.7rem]">⚠️ Caps Lock is on</p>}
          </div>

          {err && (
            <div
              className="rounded-xl p-2.5 text-[0.76rem]"
              style={{
                background: "color-mix(in srgb, var(--bs-danger) 14%, transparent)",
                border: "1px solid color-mix(in srgb, var(--bs-danger) 40%, transparent)",
              }}
            >
              ⛔ {err}
            </div>
          )}

          <button className="pm-btn pm-btn-primary pm-btn-block pm-btn-lg" disabled={busy || !pw}>
            {busy ? (
              <>
                <span className="pm-spin inline-block">◌</span> Verifying against directory…
              </>
            ) : (
              <>Continue to role context →</>
            )}
          </button>

          <div className="pm-panel flex items-start gap-2 p-2.5 text-[0.72rem]">
            <span>🧪</span>
            <p className="pm-muted">
              Demo credentials — <code className="pm-mono text-[0.72rem]">{DEMO.email}</code> /{" "}
              <button
                type="button"
                className="pm-mono underline"
                onClick={() => setPw(DEMO.password)}
                style={{ color: "var(--bs-info)" }}
              >
                {DEMO.password}
              </button>{" "}
              (click to autofill)
            </p>
          </div>
        </div>
      </form>

      <aside className="space-y-3">
        <div className="pm-card p-4">
          <p className="pm-faint mb-2 text-[0.62rem] tracking-widest uppercase">Pre-flight checks</p>
          {[
            ["TLS 1.3 channel", "AES-256-GCM", true],
            ["Device fingerprint", DEMO.device, true],
            ["Source IP", `${DEMO.ip} · whitelisted`, true],
            ["Geo-velocity", DEMO.location, true],
            ["Bot / automation", "Not detected", true],
          ].map(([k, v, ok]) => (
            <div key={String(k)} className="flex items-center gap-2 border-b py-2 last:border-0" style={{ borderColor: "var(--pm-border)" }}>
              <span style={{ color: ok ? "var(--bs-success)" : "var(--bs-danger)" }}>{ok ? "✔" : "✘"}</span>
              <span className="text-[0.74rem]">{String(k)}</span>
              <span className="pm-faint pm-mono ml-auto truncate text-[0.68rem]">{String(v)}</span>
            </div>
          ))}
        </div>
        <div
          className="pm-card p-4 text-[0.74rem]"
          style={{ borderColor: "color-mix(in srgb, var(--bs-warning) 40%, transparent)" }}
        >
          <p className="text-warning mb-1 font-bold">⚠️ Restricted system</p>
          <p className="pm-muted">
            Unauthorised access to PayMo administrative systems is an offence under the Kenya Computer Misuse and
            Cybercrimes Act. All keystrokes on this page are logged.
          </p>
        </div>
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Gate 1 — 6-digit PIN                                                */
/* ------------------------------------------------------------------ */

export function PinGate({ role, onDone, log }: GateProps) {
  const spec = GATE_SPECS[0];
  const toast = useToast();
  const [pin, setPin] = useState("");
  const [attempts, setAttempts] = useState(3);
  const [error, setError] = useState(false);
  const [locked, setLocked] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [left, setLeft] = useCountdown(45, locked, () => {
    setLocked(false);
    setAttempts(3);
  });

  const verify = (v: string) => {
    if (v.length !== 6) return;
    if (v === DEMO.pin) {
      log("Gate 1 passed — 6-digit PIN", "var(--bs-success)", "bcrypt compare OK · cost 12");
      toast({ tone: "success", icon: "🔓", title: "Gate 1 cleared", body: "PIN hash matched. Advancing to passkey." });
      onDone();
    } else {
      const remaining = attempts - 1;
      setAttempts(remaining);
      setError(true);
      setTimeout(() => {
        setError(false);
        setPin("");
      }, 620);
      log(`Gate 1 failed — wrong PIN (${remaining} left)`, "var(--bs-danger)", `${DEMO.ip} · ${DEMO.device}`);
      if (remaining <= 0) {
        setLocked(true);
        setLeft(45);
        toast({ tone: "danger", icon: "🔒", title: "Account locked", body: "3 failed PIN attempts — 30-minute lockout policy engaged." });
      } else {
        toast({ tone: "warning", icon: "⚠️", title: "Incorrect PIN", body: `${remaining} attempt${remaining === 1 ? "" : "s"} remaining before lockout.` });
      }
    }
  };

  return (
    <>
      <GateShell
        spec={spec}
        status={
          <Badge tone={attempts === 3 ? "var(--bs-secondary)" : attempts === 2 ? "var(--bs-warning)" : "var(--bs-danger)"}>
            {attempts} / 3 attempts left
          </Badge>
        }
        aside={
          <div className="pm-card p-4">
            <p className="pm-faint mb-2 text-[0.62rem] tracking-widest uppercase">Lockout policy</p>
            <div className="flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-2 flex-1 rounded-full"
                  style={{ background: i < attempts ? "var(--bs-success)" : "var(--bs-danger)" }}
                />
              ))}
            </div>
            <p className="pm-muted mt-2 text-[0.74rem]">
              After 3 failures this admin account is frozen for 30 minutes and the super admin is paged.
            </p>
            <button className="pm-btn pm-btn-ghost pm-btn-sm pm-btn-block mt-3" onClick={() => setResetOpen(true)}>
              🆘 Forgot PIN — recovery options
            </button>
          </div>
        }
      >
        <div className="mx-auto max-w-md">
          <p className="pm-faint mb-3 text-center text-[0.72rem] tracking-widest uppercase">
            Enter the 6-digit PIN issued for {role.name}
          </p>
          <div className={error ? "pm-shake" : ""}>
            <OtpInput length={6} value={pin} onChange={setPin} masked error={error} disabled={locked} onComplete={verify} />
          </div>

          <div className="mt-5">
            <Keypad
              disabled={locked}
              onDigit={(d) => {
                if (pin.length < 6) {
                  const next = pin + d;
                  setPin(next);
                  if (next.length === 6) setTimeout(() => verify(next), 120);
                }
              }}
              onBackspace={() => setPin((p) => p.slice(0, -1))}
              onClear={() => setPin("")}
            />
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <button className="pm-btn pm-btn-primary" disabled={pin.length !== 6 || locked} onClick={() => verify(pin)}>
              Verify PIN
            </button>
            <button className="pm-btn pm-btn-ghost" onClick={() => setPin(DEMO.pin)} disabled={locked}>
              🧪 Autofill demo PIN
            </button>
          </div>
          <p className="pm-faint mt-3 text-center text-[0.68rem]">
            Stored as a bcrypt hash — PayMo never sees your PIN in plain text.
          </p>
        </div>
      </GateShell>

      {/* Lockout modal */}
      <Modal
        open={locked}
        onClose={() => {}}
        title="Account temporarily locked"
        subtitle="Gate 1 · three consecutive failed PIN attempts"
        icon="🔒"
        tone="var(--bs-danger)"
        width="34rem"
        footer={
          <>
            <button className="pm-btn pm-btn-ghost pm-btn-sm" onClick={() => setResetOpen(true)}>
              Email recovery
            </button>
            <button
              className="pm-btn pm-btn-danger pm-btn-sm"
              onClick={() => {
                setLocked(false);
                setAttempts(3);
                setPin("");
                log("Super admin override cleared PIN lockout", "var(--bs-warning)", "Override ticket OVR-4471");
                toast({ tone: "warning", icon: "🗝️", title: "Lockout overridden", body: "Super admin cleared the lock. Attempt counter reset." });
              }}
            >
              Super admin override
            </button>
          </>
        }
      >
        <div className="text-center">
          <Ring progress={left / 45} size={132} tone="var(--bs-danger)">
            <div>
              <p className="pm-mono text-2xl font-bold">{fmtMs(left)}</p>
              <p className="pm-faint text-[0.62rem] tracking-widest uppercase">until retry</p>
            </div>
          </Ring>
          <p className="pm-muted mx-auto mt-3 max-w-sm text-[0.8rem]">
            Policy is a <b>30-minute</b> lockout (demo timer compressed to 45s). The super admin has been paged and this
            event is now in the audit ledger with your IP <code className="pm-mono">{DEMO.ip}</code> and device
            fingerprint.
          </p>
        </div>
      </Modal>

      {/* Reset modal */}
      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="PIN recovery"
        subtitle="Two sanctioned recovery paths — both are audited"
        icon="🆘"
        tone="var(--bs-warning)"
        width="36rem"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { t: "Super admin reset", d: "Jeckonia Kwasa issues a new PIN over the secure channel. Fastest path — usually under 5 minutes.", b: "Page super admin", tone: "var(--bs-primary)" },
            { t: "Email recovery", d: `A signed reset link is sent to ${DEMO.email}, valid for 10 minutes, single use, IP-bound.`, b: "Send reset link", tone: "var(--bs-info)" },
          ].map((o) => (
            <div key={o.t} className="pm-panel p-3">
              <p className="text-[0.84rem] font-bold">{o.t}</p>
              <p className="pm-muted mt-1 text-[0.75rem]">{o.d}</p>
              <button
                className="pm-btn pm-btn-outline-primary pm-btn-sm pm-btn-block mt-3"
                onClick={() => {
                  setResetOpen(false);
                  log(`PIN recovery requested — ${o.t}`, o.tone);
                  toast({ tone: "info", icon: "📨", title: o.t, body: "Request dispatched. Demo PIN remains 482913." });
                }}
              >
                {o.b}
              </button>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Gate 2 — Passkey / WebAuthn                                         */
/* ------------------------------------------------------------------ */

const CEREMONY = [
  "navigator.credentials.get() — requesting challenge",
  "Challenge signed · awaiting user gesture",
  "User presence verified on authenticator",
  "Assertion signature validated server-side",
];

export function PasskeyGate({ role, onDone, log }: GateProps) {
  const spec = GATE_SPECS[1];
  const toast = useToast();
  const [device, setDevice] = useState(role.gates[1]?.includes("Hardware") ? "yubikey" : "yubikey");
  const [step, setStep] = useState(-1);
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [phrase, setPhrase] = useState("");
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t)), []);

  const hardwareOnly = role.gates.some((g) => g.includes("Hardware"));
  const selected = AUTHENTICATORS.find((a) => a.id === device)!;
  const blocked = hardwareOnly && !selected.hardware;

  const run = () => {
    if (blocked) {
      toast({ tone: "danger", icon: "⛔", title: "Policy violation", body: `${role.name} requires a hardware security key — biometric passkeys are rejected.` });
      return;
    }
    setStep(0);
    log(`Passkey ceremony started — ${selected.name}`, spec.tone, selected.attestation);
    CEREMONY.forEach((_, i) => {
      timers.current.push(
        window.setTimeout(() => setStep(i + 1), (i + 1) * 780),
      );
    });
    timers.current.push(
      window.setTimeout(() => {
        log("Gate 2 passed — FIDO2 assertion verified", "var(--bs-success)", `${selected.name} · ${selected.attestation}`);
        toast({ tone: "success", icon: "🔑", title: "Gate 2 cleared", body: "Passkey assertion verified. Advancing to TOTP." });
        onDone();
      }, CEREMONY.length * 780 + 500),
    );
  };

  const running = step >= 0;

  return (
    <>
      <GateShell
        spec={spec}
        status={<Badge tone={hardwareOnly ? "var(--bs-danger)" : "var(--bs-secondary)"}>{hardwareOnly ? "Hardware key required" : "Any registered passkey"}</Badge>}
        aside={
          <div className="pm-card p-4">
            <p className="pm-faint mb-2 text-[0.62rem] tracking-widest uppercase">Fallback</p>
            <p className="pm-muted text-[0.74rem]">
              Lost your key? The super admin can issue a temporary <b>12-word recovery phrase</b>, valid for a single
              login and revoked immediately after use.
            </p>
            <button className="pm-btn pm-btn-ghost pm-btn-sm pm-btn-block mt-3" onClick={() => setRecoveryOpen(true)}>
              🧾 Use recovery phrase
            </button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-[15rem_minmax(0,1fr)]">
          <div className="space-y-2">
            <p className="pm-faint text-[0.62rem] tracking-widest uppercase">Registered authenticators</p>
            {AUTHENTICATORS.map((a) => {
              const isSel = device === a.id;
              const notAllowed = hardwareOnly && !a.hardware;
              return (
                <button
                  key={a.id}
                  disabled={running}
                  onClick={() => setDevice(a.id)}
                  className={`pm-role !p-2.5 ${isSel ? "selected" : ""}`}
                  style={{ ["--accent" as string]: notAllowed ? "var(--bs-danger)" : spec.tone, opacity: notAllowed ? 0.6 : 1 }}
                >
                  <div className="relative flex items-center gap-2.5">
                    <span className="text-lg">{a.icon}</span>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate text-[0.78rem] font-bold">{a.name}</p>
                      <p className="pm-faint truncate text-[0.66rem]">{a.type}</p>
                    </div>
                    <span className="pm-role-check !h-4 !w-4">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                  {isSel && (
                    <div className="pm-faint pm-mono relative mt-2 space-y-0.5 text-left text-[0.62rem]">
                      <p>{a.detail}</p>
                      <p>Attestation: {a.attestation}</p>
                      <p>Last used: {a.lastUsed}</p>
                    </div>
                  )}
                </button>
              );
            })}
            {blocked && (
              <p className="text-danger text-[0.7rem]">⛔ {role.name} policy blocks biometric-only passkeys.</p>
            )}
          </div>

          <div className="pm-panel grid place-items-center p-6 text-center">
            <div>
              <div
                className={`relative mx-auto grid h-28 w-28 place-items-center rounded-full text-5xl ${running ? "pm-ring-pulse" : ""}`}
                style={{
                  ["--tone" as string]: spec.tone,
                  background: `radial-gradient(circle, color-mix(in srgb, ${spec.tone} 26%, transparent), transparent 70%)`,
                  border: `1.5px solid color-mix(in srgb, ${spec.tone} 45%, transparent)`,
                }}
              >
                {selected.hardware ? "🔐" : "🫆"}
              </div>
              <p className="mt-4 text-[0.88rem] font-bold">
                {running ? "Ceremony in progress…" : selected.hardware ? "Touch your security key" : "Present your biometric"}
              </p>
              <p className="pm-muted mt-1 text-[0.74rem]">
                {running ? "Do not remove the authenticator." : `Relying party: paymo.co.ke · user: ${DEMO.email}`}
              </p>

              <div className="mt-4 space-y-1.5 text-left">
                {CEREMONY.map((c, i) => (
                  <div
                    key={c}
                    className="flex items-center gap-2 text-[0.72rem] transition-opacity"
                    style={{ opacity: !running ? 0.35 : step > i ? 1 : step === i ? 0.9 : 0.35 }}
                  >
                    <span style={{ color: step > i ? "var(--bs-success)" : spec.tone }}>
                      {step > i ? "✔" : step === i ? <span className="pm-spin inline-block">◌</span> : "○"}
                    </span>
                    <span className="pm-mono">{c}</span>
                  </div>
                ))}
              </div>

              <button className="pm-btn pm-btn-primary pm-btn-lg mt-5" disabled={running} onClick={run}>
                {running ? "Verifying…" : "🔑 Authenticate with passkey"}
              </button>
            </div>
          </div>
        </div>
      </GateShell>

      <Modal
        open={recoveryOpen}
        onClose={() => setRecoveryOpen(false)}
        title="Temporary recovery phrase"
        subtitle="12 words · single use · issued by super admin"
        icon="🧾"
        tone="var(--bs-warning)"
        width="40rem"
        footer={
          <>
            <button className="pm-btn pm-btn-ghost pm-btn-sm" onClick={() => setPhrase(RECOVERY_PHRASE)}>
              🧪 Paste demo phrase
            </button>
            <button
              className="pm-btn pm-btn-warning pm-btn-sm"
              disabled={phrase.trim().split(/\s+/).length !== 12}
              onClick={() => {
                if (phrase.trim() !== RECOVERY_PHRASE) {
                  toast({ tone: "danger", icon: "⛔", title: "Phrase rejected", body: "Word order or spelling does not match." });
                  return;
                }
                setRecoveryOpen(false);
                log("Gate 2 passed via recovery phrase", "var(--bs-warning)", "Phrase burned · super admin notified");
                toast({ tone: "warning", icon: "⚠️", title: "Gate 2 cleared (fallback)", body: "Recovery phrase burned. Register a new passkey within 24h." });
                onDone();
              }}
            >
              Verify phrase
            </button>
          </>
        }
      >
        <textarea
          className="pm-input pm-mono min-h-[6rem] text-[0.8rem]"
          placeholder="word1 word2 word3 … word12"
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {Array.from({ length: 12 }).map((_, i) => {
            const w = phrase.trim().split(/\s+/).filter(Boolean)[i];
            return (
              <span key={i} className="pm-chip" style={{ opacity: w ? 1 : 0.4 }}>
                {i + 1}. {w ?? "—"}
              </span>
            );
          })}
        </div>
        <p className="pm-faint mt-3 text-[0.72rem]">
          Using the fallback drops your session to a 1-hour cap and forces passkey re-registration on next login.
        </p>
      </Modal>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Gate 3 — TOTP                                                       */
/* ------------------------------------------------------------------ */

export function TotpGate({ onDone, log }: GateProps) {
  const spec = GATE_SPECS[2];
  const toast = useToast();
  const totp = useTotp();
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [backupOpen, setBackupOpen] = useState(false);
  const [used, setUsed] = useState<string[]>([]);
  const [showSim, setShowSim] = useState(true);

  const verify = (v: string) => {
    if (v.length !== 6) return;
    if (v === totp.code || v === totp.prev) {
      log("Gate 3 passed — TOTP verified", "var(--bs-success)", "RFC 6238 · 30s window · ±1 drift allowed");
      toast({ tone: "success", icon: "⏱️", title: "Gate 3 cleared", body: "Time-based code accepted." });
      onDone();
    } else {
      setError(true);
      setTimeout(() => {
        setError(false);
        setCode("");
      }, 620);
      log("Gate 3 failed — invalid TOTP", "var(--bs-danger)");
      toast({ tone: "danger", icon: "⛔", title: "Code rejected", body: "Expired or incorrect. Codes rotate every 30 seconds." });
    }
  };

  return (
    <>
      <GateShell
        spec={spec}
        status={<Badge tone={totp.remaining <= 5 ? "var(--bs-danger)" : "var(--bs-teal)"}>rotates in {totp.remaining}s</Badge>}
        aside={
          <div className="pm-card p-4">
            <p className="pm-faint mb-2 text-[0.62rem] tracking-widest uppercase">Backup codes</p>
            <p className="pm-muted text-[0.74rem]">
              5 single-use codes were printed and sealed at enrolment. {5 - used.length} remain unused.
            </p>
            <div className="pm-progress mt-2">
              <div className="pm-progress-bar success" style={{ width: `${((5 - used.length) / 5) * 100}%` }} />
            </div>
            <button className="pm-btn pm-btn-ghost pm-btn-sm pm-btn-block mt-3" onClick={() => setBackupOpen(true)}>
              🎟️ Use a backup code
            </button>
          </div>
        }
      >
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_14rem]">
          <div>
            <p className="pm-faint mb-3 text-center text-[0.72rem] tracking-widest uppercase">
              Enter the current 6-digit code
            </p>
            <div className={error ? "pm-shake" : ""}>
              <OtpInput length={6} value={code} onChange={setCode} error={error} onComplete={verify} />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button className="pm-btn pm-btn-primary" disabled={code.length !== 6} onClick={() => verify(code)}>
                Verify code
              </button>
              <button className="pm-btn pm-btn-ghost" onClick={() => setCode(totp.code)}>
                🧪 Autofill live code
              </button>
              <button className="pm-btn pm-btn-ghost" onClick={() => setShowSim((s) => !s)}>
                {showSim ? "Hide" : "Show"} authenticator
              </button>
            </div>
            <div className="pm-panel mt-4 p-3 text-[0.72rem]">
              <p className="pm-faint mb-1 tracking-widest uppercase">Enrolment</p>
              <p className="pm-muted">
                Secret <code className="pm-mono">JBSW Y3DP EHPK 3PXP</code> · issuer <code className="pm-mono">PayMo Admin</code>{" "}
                · algorithm SHA-1 · digits 6 · period 30s. Re-enrolment QR is generated only by the super admin.
              </p>
            </div>
          </div>

          {showSim && (
            <div className="pm-panel p-4 text-center">
              <p className="pm-faint mb-3 text-[0.62rem] tracking-widest uppercase">Authenticator (simulated)</p>
              <Ring progress={totp.progress} size={112} tone={totp.remaining <= 5 ? "var(--bs-danger)" : spec.tone}>
                <div>
                  <p className="pm-mono text-[1.35rem] leading-none font-bold tracking-widest">
                    {totp.code.slice(0, 3)}
                  </p>
                  <p className="pm-mono text-[1.35rem] leading-none font-bold tracking-widest">{totp.code.slice(3)}</p>
                </div>
              </Ring>
              <p className="pm-faint mt-3 text-[0.68rem]">PayMo Admin · {DEMO.email.split("@")[0]}</p>
              <p className="pm-mono mt-1 text-[0.66rem]" style={{ color: totp.remaining <= 5 ? "var(--bs-danger)" : "var(--bs-teal)" }}>
                expires in {totp.remaining}s
              </p>
            </div>
          )}
        </div>
      </GateShell>

      <Modal
        open={backupOpen}
        onClose={() => setBackupOpen(false)}
        title="Single-use backup codes"
        subtitle="Sealed envelope · each code works exactly once"
        icon="🎟️"
        tone="var(--bs-teal)"
        width="34rem"
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {BACKUP_CODES.map((c) => {
            const spent = used.includes(c);
            return (
              <button
                key={c}
                disabled={spent}
                className="pm-panel pm-mono flex items-center justify-between p-3 text-[0.84rem] font-bold disabled:opacity-40"
                onClick={() => {
                  setUsed((u) => [...u, c]);
                  setBackupOpen(false);
                  log("Gate 3 passed via backup code", "var(--bs-warning)", `${c} burned · 4 remaining`);
                  toast({ tone: "warning", icon: "🎟️", title: "Backup code accepted", body: `${c} is now burned and cannot be reused.` });
                  onDone();
                }}
              >
                {c}
                <span className="text-[0.66rem]">{spent ? "USED" : "USE →"}</span>
              </button>
            );
          })}
        </div>
        <p className="pm-faint mt-3 text-[0.72rem]">
          Burning a backup code notifies the super admin and flags the session for review in the audit log.
        </p>
      </Modal>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Gate 4 — Super-admin issued session PIN                             */
/* ------------------------------------------------------------------ */

export function SessionPinGate({ role, onDone, log }: GateProps) {
  const spec = GATE_SPECS[3];
  const toast = useToast();
  const [pin, setPin] = useState("");
  const [issued, setIssued] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [channelOpen, setChannelOpen] = useState(false);
  const [error, setError] = useState(false);
  const [ttl, setTtl] = useCountdown(120, !!issued);

  const request = () => {
    setRequesting(true);
    log("Session PIN requested from super admin", spec.tone, "Out-of-band channel: Signal · Jeckonia Kwasa");
    setTimeout(() => {
      const code = String(Math.floor(1000 + Math.random() * 9000));
      setIssued(code);
      setTtl(120);
      setRequesting(false);
      setChannelOpen(true);
      toast({ tone: "info", icon: "📡", title: "Session PIN issued", body: "Delivered out-of-band. Valid for 2 minutes." });
    }, 1800);
  };

  const verify = (v: string) => {
    if (v.length !== 4) return;
    if (!issued) {
      toast({ tone: "danger", icon: "⛔", title: "No PIN issued", body: "Request a session PIN from the super admin first." });
      return;
    }
    if (v === issued) {
      log("Gate 4 passed — session PIN accepted", "var(--bs-success)", `Issued by Jeckonia Kwasa · single session`);
      toast({ tone: "success", icon: "🛡️", title: "Gate 4 cleared", body: "All four gates passed. Minting session token…" });
      onDone();
    } else {
      setError(true);
      setTimeout(() => {
        setError(false);
        setPin("");
      }, 620);
      log("Gate 4 failed — wrong session PIN", "var(--bs-danger)");
      toast({ tone: "danger", icon: "⛔", title: "Session PIN rejected", body: "Check the out-of-band message again." });
    }
  };

  return (
    <>
      <GateShell
        spec={spec}
        status={
          issued ? (
            <Badge tone={ttl < 30 ? "var(--bs-danger)" : "var(--bs-success)"}>PIN valid · {fmtMs(ttl)}</Badge>
          ) : (
            <Badge tone="var(--bs-warning)">Awaiting issuance</Badge>
          )
        }
        aside={
          <div className="pm-card p-4">
            <p className="pm-faint mb-2 text-[0.62rem] tracking-widest uppercase">Issuing authority</p>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full text-sm" style={{ background: "color-mix(in srgb, var(--bs-danger) 22%, transparent)" }}>
                👑
              </span>
              <div>
                <p className="text-[0.8rem] font-bold">Jeckonia Kwasa</p>
                <p className="pm-faint text-[0.68rem]">Super Admin · Tier 0 · online</p>
              </div>
            </div>
            <p className="pm-muted mt-3 text-[0.74rem]">
              The session PIN never travels through PayMo systems. It is read out over an encrypted out-of-band channel
              and dies with the session.
            </p>
            {issued && (
              <button className="pm-btn pm-btn-ghost pm-btn-sm pm-btn-block mt-3" onClick={() => setChannelOpen(true)}>
                📡 Reopen secure channel
              </button>
            )}
          </div>
        }
      >
        <div className="mx-auto max-w-md text-center">
          <p className="pm-faint mb-3 text-[0.72rem] tracking-widest uppercase">
            4-digit session PIN for this {role.sessionTimeout} session
          </p>
          <div className={error ? "pm-shake" : ""}>
            <OtpInput length={4} value={pin} onChange={setPin} masked error={error} disabled={!issued} onComplete={verify} />
          </div>

          {!issued ? (
            <button className="pm-btn pm-btn-danger pm-btn-lg mt-5" disabled={requesting} onClick={request}>
              {requesting ? (
                <>
                  <span className="pm-spin inline-block">◌</span> Paging super admin…
                </>
              ) : (
                <>📡 Request session PIN from super admin</>
              )}
            </button>
          ) : (
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <button className="pm-btn pm-btn-primary" disabled={pin.length !== 4} onClick={() => verify(pin)}>
                Unlock dashboard
              </button>
              <button className="pm-btn pm-btn-ghost" onClick={() => setPin(issued)}>
                🧪 Autofill issued PIN
              </button>
              <button className="pm-btn pm-btn-ghost" onClick={request}>
                ↻ Re-issue
              </button>
            </div>
          )}

          <div className="pm-panel mt-5 grid grid-cols-3 gap-2 p-3 text-[0.7rem]">
            {[
              ["Validity", "Single session"],
              ["Max life", role.sessionTimeout],
              ["Channel", "Out-of-band"],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="pm-faint text-[0.6rem] tracking-wider uppercase">{k}</p>
                <p className="font-semibold">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </GateShell>

      <Modal
        open={channelOpen}
        onClose={() => setChannelOpen(false)}
        title="Secure out-of-band channel"
        subtitle="Signal · end-to-end encrypted · disappearing in 2 minutes"
        icon="📡"
        tone="var(--bs-danger)"
        width="30rem"
        footer={
          <button
            className="pm-btn pm-btn-primary pm-btn-sm"
            onClick={() => {
              if (issued) setPin(issued);
              setChannelOpen(false);
            }}
          >
            Copy into gate
          </button>
        }
      >
        <div className="space-y-2">
          <div className="pm-panel max-w-[85%] rounded-2xl rounded-tl-sm p-3">
            <p className="pm-faint text-[0.65rem]">Jeckonia Kwasa · Super Admin · now</p>
            <p className="mt-1 text-[0.82rem]">
              Verified it's you on {DEMO.device}. Here is your session PIN for the next {role.sessionTimeout} —
            </p>
            <p className="pm-mono mt-2 text-3xl font-bold tracking-[0.35em]" style={{ color: "var(--bs-danger)" }}>
              {issued}
            </p>
            <p className="pm-faint mt-1 text-[0.68rem]">Do not paste this anywhere except Gate 4. Expires {fmtMs(ttl)}.</p>
          </div>
          <div
            className="ml-auto max-w-[75%] rounded-2xl rounded-tr-sm p-3 text-[0.8rem]"
            style={{ background: "color-mix(in srgb, var(--bs-primary) 20%, transparent)" }}
          >
            Received. Entering now.
          </div>
        </div>
      </Modal>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Granted                                                             */
/* ------------------------------------------------------------------ */

export function GrantedStage({
  role,
  sessionId,
  onLogout,
  onOpenAudit,
  log,
}: {
  role: Role;
  sessionId: string;
  onLogout: () => void;
  onOpenAudit: () => void;
  log: LogFn;
}) {
  const toast = useToast();
  const [tab, setTab] = useState("session");
  const [entering, setEntering] = useState(false);

  return (
    <div className="pm-card pm-fade-up overflow-hidden">
      <div
        className="p-6 text-center"
        style={{ background: `radial-gradient(700px 200px at 50% -30%, color-mix(in srgb, var(--bs-success) 30%, transparent), transparent 70%)` }}
      >
        <div
          className="pm-ring-pulse relative mx-auto grid h-20 w-20 place-items-center rounded-full text-4xl"
          style={{
            ["--tone" as string]: "var(--bs-success)",
            background: "color-mix(in srgb, var(--bs-success) 22%, transparent)",
            border: "1px solid color-mix(in srgb, var(--bs-success) 50%, transparent)",
          }}
        >
          ✅
        </div>
        <h2 className="mt-4 text-2xl font-extrabold">Access granted</h2>
        <p className="pm-muted mt-1 text-[0.85rem]">
          All four gates cleared. Session token minted with AES-256-GCM and bound to {DEMO.device}.
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <Badge tone={role.color} solid>
            {role.icon} {role.name}
          </Badge>
          <Badge tone="var(--bs-success)">Tier {role.tier}</Badge>
          <Badge tone="var(--bs-info)">{role.clearance} clearance</Badge>
          <Badge tone="var(--bs-secondary)">{sessionId}</Badge>
        </div>
      </div>

      <div className="px-5">
        <Tabs
          active={tab}
          onChange={setTab}
          tabs={[
            { id: "session", label: "Session", icon: "🔐" },
            { id: "next", label: "Where you land", icon: "🧭" },
            { id: "rules", label: "Live guardrails", icon: "🚧" },
          ]}
        />
      </div>

      <div className="p-5">
        {tab === "session" && (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Session ID", sessionId],
              ["Expires", role.sessionTimeout],
              ["Idle timeout", role.idleTimeout],
              ["Concurrent", "1 per admin"],
              ["Source IP", DEMO.ip],
              ["Device", DEMO.device],
              ["Encryption", "AES-256-GCM"],
              ["CSRF", "Synchronizer token"],
            ].map(([k, v]) => (
              <div key={k} className="pm-panel p-3">
                <p className="pm-faint text-[0.6rem] tracking-widest uppercase">{k}</p>
                <p className="pm-mono mt-1 truncate text-[0.78rem] font-semibold">{v}</p>
              </div>
            ))}
          </div>
        )}
        {tab === "next" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="pm-panel p-4">
              <p className="pm-faint text-[0.62rem] tracking-widest uppercase">Default landing page</p>
              <p className="mt-1 text-[0.95rem] font-bold" style={{ color: role.color }}>
                {role.landing}
              </p>
              <p className="pm-muted mt-2 text-[0.76rem]">
                Sidebar groups are rendered from your permission set — modules you cannot access are not even mounted.
              </p>
            </div>
            <div className="pm-panel p-4">
              <p className="pm-faint text-[0.62rem] tracking-widest uppercase">Unlocked capabilities</p>
              <ul className="mt-1.5 space-y-1">
                {role.scopes.slice(0, 4).map((s) => (
                  <li key={s} className="text-[0.76rem]">
                    <span style={{ color: "var(--bs-success)" }}>✔</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {tab === "rules" && (
          <div className="grid gap-2 sm:grid-cols-2">
            {role.restrictions.map((r) => (
              <div key={r} className="pm-panel p-3 text-[0.78rem]">
                <span className="text-danger">⛔</span> {r}
              </div>
            ))}
            <div className="pm-panel p-3 text-[0.78rem]">
              <span className="text-warning">⏱️</span> Idle for {role.idleTimeout} and the session self-destructs.
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button
            className="pm-btn pm-btn-success pm-btn-lg"
            disabled={entering}
            onClick={() => {
              setEntering(true);
              log("Redirecting to admin dashboard", "var(--bs-success)", role.landing);
              toast({ tone: "success", icon: "🚀", title: "Entering dashboard", body: role.landing });
              setTimeout(() => setEntering(false), 2200);
            }}
          >
            {entering ? (
              <>
                <span className="pm-spin inline-block">◌</span> Loading {role.landing}…
              </>
            ) : (
              <>🚀 Enter admin dashboard</>
            )}
          </button>
          <button className="pm-btn pm-btn-ghost pm-btn-lg" onClick={onOpenAudit}>
            📜 View audit trail
          </button>
          <button
            className="pm-btn pm-btn-outline-danger pm-btn-lg"
            onClick={() => {
              log("Admin signed out — session terminated", "var(--bs-danger)", "Redirected to access control gateway");
              toast({ tone: "danger", icon: "👋", title: "Signed out", body: "Session token revoked. Back to Page 0." });
              onLogout();
            }}
          >
            ⏻ Log out
          </button>
        </div>
      </div>
    </div>
  );
}
