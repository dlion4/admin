import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { avatarColor, initials } from "../lib/format";

/* ============================== Toasts ============================== */
export type ToastKind = "success" | "error" | "warn" | "info";
export type Toast = { id: number; kind: ToastKind; title: string; body?: string };
type ToastCtx = { push: (t: Omit<Toast, "id">) => void };
const ToastContext = createContext<ToastCtx>({ push: () => {} });
export const useToast = () => useContext(ToastContext);

export function ToastHost({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p.slice(-4), { ...t, id }]);
    setTimeout(() => setToasts((p) => p.filter((x) => x.id !== id)), 4600);
  }, []);
  const icons: Record<ToastKind, string> = {
    success: "bi-check-circle-fill", error: "bi-x-octagon-fill",
    warn: "bi-exclamation-triangle-fill", info: "bi-info-circle-fill",
  };
  const colors: Record<ToastKind, string> = {
    success: "#12b76a", error: "#f04438", warn: "#f79009", info: "#2e90fa",
  };
  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pm-toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`pm-toast ${t.kind === "success" ? "" : t.kind}`}>
            <i className={`bi ${icons[t.kind]}`} style={{ color: colors[t.kind] }} />
            <div className="flex-grow-1">
              <div style={{ fontWeight: 700, fontSize: ".82rem" }}>{t.title}</div>
              {t.body && <div style={{ fontSize: ".74rem", color: "var(--pm-muted)" }}>{t.body}</div>}
            </div>
            <button className="pm-x" onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))} aria-label="Dismiss">
              <i className="bi bi-x" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ============================== Modal ============================== */
export type ModalTone = "green" | "red" | "amber" | "blue" | "violet" | "ink";
const toneBg: Record<ModalTone, { bg: string; fg: string }> = {
  green: { bg: "#e7f8ef", fg: "#0b8f52" }, red: { bg: "#fef2f2", fg: "#d92d20" },
  amber: { bg: "#fff5e6", fg: "#b54708" }, blue: { bg: "#eff8ff", fg: "#175cd3" },
  violet: { bg: "#f4f1ff", fg: "#5925dc" }, ink: { bg: "#eef1f6", fg: "#101828" },
};

export function Modal({
  open, onClose, title, subtitle, icon = "bi-window", tone = "green",
  size = "md", children, footer, headExtra,
}: {
  open: boolean; onClose: () => void; title: string; subtitle?: string; icon?: string;
  tone?: ModalTone; size?: "sm" | "md" | "lg" | "xl"; children: ReactNode;
  footer?: ReactNode; headExtra?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [open, onClose]);
  if (!open) return null;
  const t = toneBg[tone];
  return createPortal(
    <div className="pm-overlay pm-page-content" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`pm-modal ${size}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="pm-modal-head">
          <div className="pm-modal-ico" style={{ background: t.bg, color: t.fg }}><i className={`bi ${icon}`} /></div>
          <div className="flex-grow-1">
            <h5 className="pm-modal-title">{title}</h5>
            {subtitle && <p className="pm-modal-sub">{subtitle}</p>}
          </div>
          {headExtra}
          <button className="pm-x" onClick={onClose} aria-label="Close"><i className="bi bi-x-lg" /></button>
        </div>
        {children}
        {footer && <div className="pm-modal-foot">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

/* ============================== Drawer ============================== */
export function Drawer({
  open, onClose, title, subtitle, icon = "bi-layout-sidebar-inset-reverse", tone = "green",
  wide, children, footer, headExtra,
}: {
  open: boolean; onClose: () => void; title: string; subtitle?: string; icon?: string;
  tone?: ModalTone; wide?: boolean; children: ReactNode; footer?: ReactNode; headExtra?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [open, onClose]);
  if (!open) return null;
  const t = toneBg[tone];
  return createPortal(
    <div className="pm-page-content">
      <div className="pm-drawer-overlay" onClick={onClose} />
      <aside className={`pm-drawer ${wide ? "wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="pm-drawer-head">
          <div className="pm-modal-ico" style={{ background: t.bg, color: t.fg }}><i className={`bi ${icon}`} /></div>
          <div className="flex-grow-1">
            <h5 className="pm-modal-title">{title}</h5>
            {subtitle && <p className="pm-modal-sub">{subtitle}</p>}
          </div>
          {headExtra}
          <button className="pm-x" onClick={onClose} aria-label="Close"><i className="bi bi-x-lg" /></button>
        </div>
        <div className="pm-drawer-body">{children}</div>
        {footer && <div className="pm-drawer-foot">{footer}</div>}
      </aside>
    </div>,
    document.body
  );
}

/* ============================== Wizard steps ============================== */
export function Steps({ steps, current }: { steps: { label: string; icon?: string }[]; current: number }) {
  return (
    <div className="pm-steps">
      {steps.map((s, i) => (
        <div key={s.label} className="d-flex align-items-start flex-grow-1" style={{ minWidth: 0 }}>
          <div className={`pm-step ${i < current ? "done" : ""} ${i === current ? "active" : ""}`}>
            <div className="b">{i < current ? <i className="bi bi-check-lg" /> : s.icon ? <i className={`bi ${s.icon}`} /> : i + 1}</div>
            <div className="l">{s.label}</div>
          </div>
          {i < steps.length - 1 && <div className={`pm-step-line ${i < current ? "done" : ""}`} />}
        </div>
      ))}
    </div>
  );
}

/* ============================== Dropdown ============================== */
export function Dropdown({
  trigger, children, align = "right", up, width,
}: { trigger: (o: boolean) => ReactNode; children: (close: () => void) => ReactNode; align?: "left" | "right"; up?: boolean; width?: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", h); document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); };
  }, [open]);
  return (
    <div className="pm-dd" ref={ref}>
      <div onClick={() => setOpen((o) => !o)}>{trigger(open)}</div>
      {open && (
        <div className={`pm-dd-menu ${align === "left" ? "left" : ""} ${up ? "up" : ""}`} style={width ? { minWidth: width } : undefined}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export function DDItem({ icon, label, hint, onClick, danger, disabled, right }: {
  icon: string; label: string; hint?: string; onClick?: () => void; danger?: boolean; disabled?: boolean; right?: ReactNode;
}) {
  return (
    <button className={`pm-dd-item ${danger ? "danger" : ""}`} onClick={onClick} disabled={disabled} type="button"
      title={disabled ? "You don't have permission for this action" : undefined}>
      <i className={`bi ${icon}`} />
      <span className="flex-grow-1">
        {label}
        {hint && <span className="d-block" style={{ fontSize: ".68rem", color: "var(--pm-muted)", fontWeight: 500 }}>{hint}</span>}
      </span>
      {right}
    </button>
  );
}

/* ============================== Small display bits ============================== */
export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  return <div className={`pm-avatar ${size === "md" ? "" : size}`} style={{ background: avatarColor(name) }}>{initials(name)}</div>;
}

export function Badge({ tone = "grey", children, dot, className }: { tone?: string; children: ReactNode; dot?: boolean; className?: string }) {
  return <span className={`pm-badge ${tone} ${className ?? ""}`}>{dot && <span className={`pm-dot ${tone}`} style={{ width: 6, height: 6, boxShadow: "none" }} />}{children}</span>;
}

export function Meter({ value, tone = "#12b76a", width = 70 }: { value: number; tone?: string; width?: number }) {
  return <div className="pm-meter" style={{ width }}><span style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: tone }} /></div>;
}

export function Sparkline({ data, color = "#12b76a", w = 108, h = 30, fill = true }: {
  data: number[]; color?: string; w?: number; h?: number; fill?: boolean;
}) {
  const { path, area } = useMemo(() => {
    if (data.length < 2) return { path: "", area: "" };
    const min = Math.min(...data), max = Math.max(...data), span = max - min || 1;
    const pts = data.map((d, i) => [(i / (data.length - 1)) * w, h - 2 - ((d - min) / span) * (h - 6)]);
    const p = pts.map((pt, i) => `${i === 0 ? "M" : "L"}${pt[0].toFixed(1)},${pt[1].toFixed(1)}`).join(" ");
    return { path: p, area: `${p} L${w},${h} L0,${h} Z` };
  }, [data, w, h]);
  const gid = useMemo(() => `sg${Math.random().toString(36).slice(2, 8)}`, []);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.28" /><stop offset="100%" stopColor={color} stopOpacity="0" />
      </linearGradient></defs>
      {fill && <path d={area} fill={`url(#${gid})`} />}
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Donut({ data, size = 168, thickness = 26, center }: {
  data: { label: string; value: number; color: string }[]; size?: number; thickness?: number; center?: ReactNode;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef1f6" strokeWidth={thickness} />
        {data.map((d) => {
          const len = (d.value / total) * c;
          const el = (
            <circle key={d.label} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={d.color}
              strokeWidth={thickness} strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} strokeLinecap="butt" />
          );
          offset += len;
          return el;
        })}
      </svg>
      {center && (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>{center}</div>
      )}
    </div>
  );
}

export function EmptyState({ icon = "bi-inbox", title, body, action }: { icon?: string; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="pm-empty">
      <i className={`bi ${icon}`} />
      <div style={{ fontWeight: 700, color: "var(--pm-ink)", marginTop: ".5rem" }}>{title}</div>
      {body && <div style={{ fontSize: ".8rem", marginTop: ".2rem" }}>{body}</div>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function Pagination({ page, pageSize, total, onPage, onPageSize }: {
  page: number; pageSize: number; total: number; onPage: (p: number) => void; onPageSize: (n: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <div className="pm-table-foot">
      <div className="d-flex align-items-center gap-2 flex-wrap">
        <span>Showing <b style={{ color: "var(--pm-ink)" }}>{from}–{to}</b> of <b style={{ color: "var(--pm-ink)" }}>{total}</b></span>
        <select className="form-select form-select-sm" style={{ width: 108 }} value={pageSize}
          onChange={(e) => { onPageSize(Number(e.target.value)); onPage(1); }} aria-label="Rows per page">
          {[8, 12, 20, 50].map((n) => <option key={n} value={n}>{n} / page</option>)}
        </select>
      </div>
      <div className="d-flex align-items-center gap-1">
        <button className="btn btn-sm btn-outline-secondary" disabled={page <= 1} onClick={() => onPage(1)}><i className="bi bi-chevron-double-left" /></button>
        <button className="btn btn-sm btn-outline-secondary" disabled={page <= 1} onClick={() => onPage(page - 1)}><i className="bi bi-chevron-left" /></button>
        <span className="px-2" style={{ fontWeight: 700, color: "var(--pm-ink)" }}>{page} / {pages}</span>
        <button className="btn btn-sm btn-outline-secondary" disabled={page >= pages} onClick={() => onPage(page + 1)}><i className="bi bi-chevron-right" /></button>
        <button className="btn btn-sm btn-outline-secondary" disabled={page >= pages} onClick={() => onPage(pages)}><i className="bi bi-chevron-double-right" /></button>
      </div>
    </div>
  );
}

/* ============================== 2FA gate (reusable inside modals) ============================== */
export function TwoFactorField({ value, onChange, label = "Authenticator code (TOTP)" }: {
  value: string; onChange: (v: string) => void; label?: string;
}) {
  return (
    <div>
      <label className="form-label">{label} <span style={{ color: "#f04438" }}>*</span></label>
      <div className="d-flex gap-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <input key={i} className="form-control text-center mono" maxLength={1} inputMode="numeric"
            style={{ width: 46, fontWeight: 700, fontSize: "1.05rem", padding: ".45rem 0" }}
            value={value[i] ?? ""}
            onChange={(e) => {
              const ch = e.target.value.replace(/\D/g, "").slice(-1);
              const arr = value.padEnd(6, " ").split("");
              arr[i] = ch || " ";
              onChange(arr.join("").replace(/\s+$/, ""));
              if (ch) {
                const next = (e.target.parentElement?.children[i + 1] as HTMLInputElement | undefined);
                next?.focus();
              }
            }} />
        ))}
      </div>
      <div style={{ fontSize: ".72rem", color: "var(--pm-muted)", marginTop: ".35rem" }}>
        <i className="bi bi-shield-lock me-1" />Open your authenticator app (rotates every 30s). Demo code: <b className="mono">482913</b>
      </div>
    </div>
  );
}

export function useCountUp(target: number, ms = 700) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0; const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}
