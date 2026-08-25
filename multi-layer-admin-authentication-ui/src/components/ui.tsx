import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/* ============================ Toasts ============================ */

export type ToastTone = "primary" | "success" | "danger" | "warning" | "info";
interface Toast {
  id: number;
  title: string;
  body?: string;
  tone: ToastTone;
  icon?: string;
}
const TONE_HEX: Record<ToastTone, string> = {
  primary: "var(--bs-primary)",
  success: "var(--bs-success)",
  danger: "var(--bs-danger)",
  warning: "var(--bs-warning)",
  info: "var(--bs-info)",
};

const ToastCtx = createContext<(t: Omit<Toast, "id">) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastHost({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s.slice(-3), { ...t, id }]);
    setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), 5200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed right-3 bottom-3 z-[90] flex w-[min(23rem,calc(100vw-1.5rem))] flex-col gap-2">
        {items.map((t) => (
          <div key={t.id} className="pm-toast pointer-events-auto">
            <div className="flex items-start gap-3 p-3">
              <span
                className="grid h-8 w-8 flex-none place-items-center rounded-[10px] text-sm"
                style={{
                  background: `color-mix(in srgb, ${TONE_HEX[t.tone]} 20%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${TONE_HEX[t.tone]} 45%, transparent)`,
                }}
              >
                {t.icon ?? "🔔"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[0.82rem] font-semibold">{t.title}</p>
                {t.body && <p className="pm-muted mt-0.5 text-[0.74rem] leading-snug">{t.body}</p>}
              </div>
              <button
                onClick={() => setItems((s) => s.filter((x) => x.id !== t.id))}
                className="pm-faint hover:text-[var(--pm-text)]"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
            <div className="h-[3px] w-full" style={{ background: TONE_HEX[t.tone], opacity: 0.7 }} />
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ============================ Modal ============================ */

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  tone = "var(--bs-primary)",
  width = "44rem",
  footer,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: string;
  tone?: string;
  width?: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="pm-backdrop grid place-items-center p-3 sm:p-6" onMouseDown={onClose}>
      <div
        className="pm-modal w-full"
        style={{ maxWidth: width }}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="flex items-start gap-3 border-b p-4"
          style={{ borderColor: "var(--pm-border)", background: `color-mix(in srgb, ${tone} 9%, transparent)` }}
        >
          {icon && (
            <span
              className="grid h-10 w-10 flex-none place-items-center rounded-xl text-lg"
              style={{
                background: `color-mix(in srgb, ${tone} 18%, transparent)`,
                border: `1px solid color-mix(in srgb, ${tone} 40%, transparent)`,
              }}
            >
              {icon}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-[0.98rem] leading-tight font-bold">{title}</h3>
            {subtitle && <p className="pm-muted mt-0.5 text-[0.76rem]">{subtitle}</p>}
          </div>
          <button className="pm-btn pm-btn-ghost pm-btn-sm" onClick={onClose}>
            Esc ✕
          </button>
        </div>
        <div className="pm-scroll overflow-y-auto p-4">{children}</div>
        {footer && (
          <div className="flex flex-wrap justify-end gap-2 border-t p-3" style={{ borderColor: "var(--pm-border)" }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================ Drawer / Offcanvas ============================ */

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = "31rem",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="pm-backdrop" onMouseDown={onClose}>
      <div
        className="pm-offcanvas absolute top-0 right-0 h-full w-full"
        style={{ maxWidth: width }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b p-4" style={{ borderColor: "var(--pm-border)" }}>
          <div>
            <h3 className="text-[0.95rem] font-bold">{title}</h3>
            {subtitle && <p className="pm-muted text-[0.74rem]">{subtitle}</p>}
          </div>
          <button className="pm-btn pm-btn-ghost pm-btn-sm" onClick={onClose}>
            Close ✕
          </button>
        </div>
        <div className="pm-scroll flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}

/* ============================ Tabs ============================ */

export function Tabs({
  tabs,
  active,
  onChange,
  variant = "underline",
}: {
  tabs: { id: string; label: string; icon?: string; badge?: string | number }[];
  active: string;
  onChange: (id: string) => void;
  variant?: "underline" | "pill";
}) {
  if (variant === "pill") {
    return (
      <div className="pm-pill-tabs flex-wrap">
        {tabs.map((t) => (
          <button key={t.id} className={`pm-pill ${active === t.id ? "active" : ""}`} onClick={() => onChange(t.id)}>
            {t.icon && <span className="mr-1">{t.icon}</span>}
            {t.label}
          </button>
        ))}
      </div>
    );
  }
  return (
    <div className="pm-tabs">
      {tabs.map((t) => (
        <button key={t.id} className={`pm-tab ${active === t.id ? "active" : ""}`} onClick={() => onChange(t.id)}>
          {t.icon && <span className="mr-1.5">{t.icon}</span>}
          {t.label}
          {t.badge !== undefined && (
            <span
              className="pm-mono ml-1.5 rounded-full px-1.5 py-0.5 text-[0.6rem]"
              style={{ background: "var(--pm-inset)", border: "1px solid var(--pm-border)" }}
            >
              {t.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ============================ Badge ============================ */

export function Badge({
  children,
  tone = "var(--bs-primary)",
  solid = false,
  className = "",
}: {
  children: ReactNode;
  tone?: string;
  solid?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`pm-badge ${solid ? "pm-badge-solid" : "pm-badge-soft"} ${className}`}
      style={{ ["--tone" as string]: tone }}
    >
      {children}
    </span>
  );
}

export function StatDot({ tone = "var(--bs-success)" }: { tone?: string }) {
  return <span className="pm-dot-live inline-block" style={{ ["--tone" as string]: tone }} />;
}

/* ============================ OTP input ============================ */

export function OtpInput({
  length,
  value,
  onChange,
  masked = false,
  error = false,
  disabled = false,
  onComplete,
}: {
  length: number;
  value: string;
  onChange: (v: string) => void;
  masked?: boolean;
  error?: boolean;
  disabled?: boolean;
  onComplete?: (v: string) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [reveal, setReveal] = useState<number>(-1);

  const setAt = (i: number, char: string) => {
    const next = (value.padEnd(length, " ").substring(0, i) + char + value.padEnd(length, " ").substring(i + 1))
      .replace(/\s/g, "")
      .slice(0, length);
    onChange(next);
    if (char) {
      setReveal(i);
      setTimeout(() => setReveal((r) => (r === i ? -1 : r)), 650);
      if (i < length - 1) refs.current[i + 1]?.focus();
      if (next.length === length) onComplete?.(next);
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
      {Array.from({ length }).map((_, i) => {
        const char = value[i] ?? "";
        const shown = !char ? "" : masked && reveal !== i ? "•" : char;
        return (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            disabled={disabled}
            value={shown}
            aria-label={`Digit ${i + 1}`}
            className={`pm-otp ${char ? "filled" : ""} ${error ? "error" : ""}`}
            onChange={(e) => {
              const d = e.target.value.replace(/\D/g, "").slice(-1);
              if (d) setAt(i, d);
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace") {
                e.preventDefault();
                if (value[i]) setAt(i, "");
                else if (i > 0) {
                  refs.current[i - 1]?.focus();
                  onChange(value.slice(0, i - 1));
                }
              }
              if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
              if (e.key === "ArrowRight" && i < length - 1) refs.current[i + 1]?.focus();
            }}
            onPaste={(e) => {
              e.preventDefault();
              const txt = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
              if (txt) {
                onChange(txt);
                if (txt.length === length) onComplete?.(txt);
              }
            }}
          />
        );
      })}
    </div>
  );
}

/* ============================ Secure keypad ============================ */

export function Keypad({
  onDigit,
  onBackspace,
  onClear,
  disabled,
}: {
  onDigit: (d: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  disabled?: boolean;
}) {
  // scrambled keypad — a real anti-shoulder-surfing pattern
  const [keys, setKeys] = useState<string[]>(["1", "2", "3", "4", "5", "6", "7", "8", "9"]);
  const [scrambled, setScrambled] = useState(false);
  const shuffle = () => {
    const k = [...keys];
    for (let i = k.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [k[i], k[j]] = [k[j], k[i]];
    }
    setKeys(k);
    setScrambled(true);
  };
  return (
    <div className="mx-auto w-full max-w-[16rem]">
      <div className="mb-2 flex items-center justify-between">
        <span className="pm-faint text-[0.65rem] tracking-widest uppercase">Secure keypad</span>
        <button className="pm-btn pm-btn-ghost pm-btn-sm" onClick={shuffle} type="button">
          🔀 {scrambled ? "Re-scramble" : "Scramble"}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {keys.map((k) => (
          <button key={k} type="button" className="pm-key" disabled={disabled} onClick={() => onDigit(k)}>
            {k}
          </button>
        ))}
        <button type="button" className="pm-key" disabled={disabled} onClick={onClear}>
          ⨯
        </button>
        <button type="button" className="pm-key" disabled={disabled} onClick={() => onDigit("0")}>
          0
        </button>
        <button type="button" className="pm-key" disabled={disabled} onClick={onBackspace}>
          ⌫
        </button>
      </div>
    </div>
  );
}

/* ============================ Countdown ring ============================ */

export function Ring({
  progress,
  size = 96,
  stroke = 7,
  tone = "var(--bs-primary)",
  children,
}: {
  progress: number; // 0..1
  size?: number;
  stroke?: number;
  tone?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--pm-border)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.max(0, Math.min(1, progress)))}
          style={{ transition: "stroke-dashoffset .3s linear" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

/* ============================ Popover ============================ */

export function Popover({ label, children, tone }: { label: ReactNode; children: ReactNode; tone?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="pm-btn pm-btn-ghost pm-btn-sm"
        style={tone ? { borderColor: `color-mix(in srgb, ${tone} 45%, transparent)` } : undefined}
        onClick={() => setOpen((o) => !o)}
      >
        {label}
      </button>
      {open && (
        <div className="pm-popover right-0 mt-2 w-[19rem] p-3 text-[0.76rem]" style={{ top: "100%" }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ============================ misc helpers ============================ */

export function useCountdown(seconds: number, running: boolean, onEnd?: () => void) {
  const [left, setLeft] = useState(seconds);
  const endRef = useRef(onEnd);
  endRef.current = onEnd;
  useEffect(() => setLeft(seconds), [seconds]);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          clearInterval(t);
          endRef.current?.();
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, seconds]);
  return [left, setLeft] as const;
}

export const fmtClock = (s: number) =>
  `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(
    s % 60,
  ).padStart(2, "0")}`;

export const fmtMs = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

/** deterministic 6-digit TOTP-ish code per 30s window */
export function totpFor(windowIdx: number, secret = 91744) {
  const x = Math.abs(Math.sin(windowIdx * 12.9898 + secret) * 43758.5453);
  return String(Math.floor((x % 1) * 1_000_000)).padStart(6, "0");
}

export function useTotp() {
  const now = useNow(250);
  return useMemo(() => {
    const win = Math.floor(now / 30000);
    const remaining = 30 - Math.floor((now % 30000) / 1000);
    return { code: totpFor(win), prev: totpFor(win - 1), remaining, progress: remaining / 30 };
  }, [now]);
}
