export const kes = (n: number, opts: { compact?: boolean; decimals?: number } = {}) => {
  if (opts.compact) {
    if (Math.abs(n) >= 1_000_000_000) return `KES ${(n / 1_000_000_000).toFixed(2)}B`;
    if (Math.abs(n) >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(1)}M`;
    if (Math.abs(n) >= 1_000) return `KES ${(n / 1_000).toFixed(1)}K`;
  }
  return `KES ${n.toLocaleString("en-KE", {
    minimumFractionDigits: opts.decimals ?? 0,
    maximumFractionDigits: opts.decimals ?? 0,
  })}`;
};

export const num = (n: number) => n.toLocaleString("en-KE");

export const pct = (n: number, d = 1) => `${n > 0 ? "" : ""}${n.toFixed(d)}%`;

export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

const AVATAR_COLORS = [
  "#12b76a", "#2e90fa", "#7a5af8", "#f79009", "#f04438",
  "#0ba5ec", "#ee46bc", "#16b364", "#875bf7", "#e04f16",
];
export const avatarColor = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};

export const clockNow = () =>
  new Date().toLocaleTimeString("en-GB", { hour12: false, timeZone: "Africa/Nairobi" });

export const hhmmss = (totalSeconds: number) => {
  const s = Math.max(0, totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

export const riskTone = (score: number): "green" | "amber" | "red" | "orange" =>
  score <= 20 ? "green" : score <= 50 ? "amber" : score <= 75 ? "orange" : "red";

export const maskId = (id: string) => id;

export const csvDownload = (filename: string, rows: Record<string, unknown>[]) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const jsonDownload = (filename: string, data: unknown) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
