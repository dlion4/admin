import { Fragment, useMemo, useState, type ReactNode } from "react";
import {
  CATEGORIES,
  CATEGORY_ICON,
  MATRIX,
  ROLES,
  TIER_TABLE,
  categoryScore,
  permFor,
  scoreFor,
  type Category,
  type PermState,
  type Role,
  type RoleId,
} from "./data/roles";
import { Badge, Drawer, Modal, Tabs, useToast } from "./ui";

const PERM_ICON: Record<PermState, ReactNode> = { full: <i className="bi bi-check-circle-fill" style={{color:"var(--bs-success)"}} />, config: <i className="bi bi-gear" style={{color:"var(--bs-warning)"}} />, none: <i className="bi bi-x-circle-fill" style={{color:"var(--bs-danger)"}} /> };
const PERM_LABEL: Record<PermState, string> = {
  full: "Granted",
  config: "Configurable by super admin",
  none: "Denied",
};

function ClearanceBadge({ role }: { role: Role }) {
  return (
    <Badge tone={role.color} solid={role.clearance === "MAXIMUM"}>
      {role.clearance}
    </Badge>
  );
}

function RoleCard({
  role,
  selected,
  onSelect,
  onDetails,
}: {
  role: Role;
  selected: boolean;
  onSelect: () => void;
  onDetails: () => void;
}) {
  const s = scoreFor(role.id);
  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect())}
      className={`pm-role ${selected ? "selected" : ""}`}
      style={{ ["--accent" as string]: role.color }}
    >
      <div className="relative flex items-start gap-3">
        <div className="pm-role-icon">{role.icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className="pm-mono rounded px-1.5 py-0.5 text-[0.6rem] font-bold"
              style={{
                background: `color-mix(in srgb, ${role.color} 20%, transparent)`,
                color: `color-mix(in srgb, ${role.color} 75%, var(--pm-text) 60%)`,
              }}
            >
              T{role.tier}
            </span>
            <h4 className="truncate text-[0.86rem] font-bold">{role.name}</h4>
          </div>
          <p className="pm-faint truncate text-[0.7rem]">{role.alias}</p>
        </div>
        <div className="pm-role-check">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div className="relative mt-3">
        <div className="pm-faint mb-1 flex justify-between text-[0.65rem]">
          <span>Permission footprint</span>
          <span className="pm-mono">{s.pct}%</span>
        </div>
        <div className="pm-progress">
          <div className="pm-progress-bar" style={{ width: `${s.pct}%`, background: role.color }} />
        </div>
      </div>

      <div className="relative mt-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-[0.65rem]">
          <span className="pm-chip !px-1.5 !py-0.5"><i className="bi bi-check-circle-fill" style={{color:"var(--bs-success)"}} /> {s.full}</span>
          <span className="pm-chip !px-1.5 !py-0.5"><i className="bi bi-gear" style={{color:"var(--bs-warning)"}} /> {s.config}</span>
          <span className="pm-chip !px-1.5 !py-0.5"><i className="bi bi-x-circle-fill" style={{color:"var(--bs-danger)"}} /> {s.none}</span>
        </div>
        <button
          className="pm-btn pm-btn-ghost pm-btn-sm !px-2 !py-1"
          onClick={(e) => {
            e.stopPropagation();
            onDetails();
          }}
        >
          Details →
        </button>
      </div>
    </div>
  );
}

function DetailPanel({ role, onOpenMatrix }: { role: Role; onOpenMatrix: () => void }) {
  const [tab, setTab] = useState("overview");
  const s = scoreFor(role.id);
  return (
    <div className="pm-fade-up" key={role.id}>
      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "overview", label: "Overview", icon: <i className="bi bi-compass" /> },
          { id: "perms", label: "Permissions", icon: <i className="bi bi-unlock" />, badge: `${s.full}/${s.total}` },
          { id: "guard", label: "Guardrails", icon: <i className="bi bi-cone-striped" /> },
          { id: "team", label: "Seats", icon: <i className="bi bi-person" />, badge: role.seats.active },
        ]}
      />
      <div className="pt-3">
        {tab === "overview" && (
          <div className="space-y-3">
            <p className="pm-muted text-[0.8rem] leading-relaxed">{role.summary}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                ["Reports to", role.reportsTo],
                ["Can create", role.canCreate],
                ["Default landing", role.landing],
                ["Session / idle", `${role.sessionTimeout} · ${role.idleTimeout}`],
              ].map(([k, v]) => (
                <div key={k} className="pm-panel p-2.5">
                  <p className="pm-faint text-[0.62rem] tracking-widest uppercase">{k}</p>
                  <p className="mt-1 text-[0.78rem] font-semibold">{v}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="pm-faint mb-1.5 text-[0.62rem] tracking-widest uppercase">Key capabilities</p>
              <ul className="space-y-1.5">
                {role.scopes.map((sc) => (
                  <li key={sc} className="flex items-start gap-2 text-[0.78rem]">
                    <span style={{ color: role.color }}>▸</span>
                    <span className="pm-muted">{sc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === "perms" && (
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              {CATEGORIES.map((c) => {
                const cs = categoryScore(role.id, c);
                return (
                  <div key={c} className="pm-panel p-2.5">
                    <div className="mb-1.5 flex items-center justify-between text-[0.74rem] font-semibold">
                      <span>
                        {CATEGORY_ICON[c]} {c}
                      </span>
                      <span className="pm-mono pm-faint text-[0.68rem]">
                        {cs.granted}/{cs.total}
                      </span>
                    </div>
                    <div className="pm-progress !h-[5px]">
                      <div
                        className="pm-progress-bar"
                        style={{
                          width: `${cs.pct}%`,
                          background: cs.pct === 0 ? "var(--bs-danger)" : cs.pct < 50 ? "var(--bs-warning)" : role.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="pm-btn pm-btn-outline-primary pm-btn-block" onClick={onOpenMatrix}>
              📋 Open full 58-permission matrix
            </button>
          </div>
        )}

        {tab === "guard" && (
          <div className="space-y-2.5">
            {role.restrictions.map((r) => (
              <div key={r} className="pm-panel flex items-start gap-2.5 p-2.5">
                <span className="text-danger"><i className="bi bi-x-octagon-fill" /></span>
                <p className="text-[0.78rem]">{r}</p>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ["IP whitelist", role.ipWhitelist],
                ["Device binding", role.deviceBinding],
                ["Dual control", role.dualControl],
                ["Audit trail", true],
              ].map(([k, v]) => (
                <div key={String(k)} className="pm-panel p-2 text-center">
                  <p className="pm-faint text-[0.6rem] tracking-wider uppercase">{String(k)}</p>
                  <p className="mt-1 text-[0.75rem] font-bold" style={{ color: v ? "var(--bs-success)" : "var(--pm-faint)" }}>
                    {v ? "ENFORCED" : "optional"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "team" && (
          <div className="space-y-2">
            <div className="pm-panel flex items-center justify-between p-2.5 text-[0.78rem]">
              <span className="pm-muted">Seats in use</span>
              <span className="pm-mono font-bold">
                {role.seats.active} / {role.seats.total}
              </span>
            </div>
            {role.holders.map((h) => (
              <div key={h.name} className="pm-panel flex items-center gap-2.5 p-2.5">
                <span
                  className="grid h-8 w-8 place-items-center rounded-full text-[0.7rem] font-bold"
                  style={{ background: `color-mix(in srgb, ${role.color} 22%, transparent)` }}
                >
                  {h.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="flex-1">
                  <p className="text-[0.78rem] font-semibold">{h.name}</p>
                  <p className="pm-faint text-[0.68rem]">{role.name}</p>
                </div>
                <Badge
                  tone={h.status === "online" ? "var(--bs-success)" : h.status === "idle" ? "var(--bs-warning)" : "var(--bs-secondary)"}
                >
                  {h.status}
                </Badge>
              </div>
            ))}
            <div className="pm-panel p-2.5">
              <p className="pm-faint text-[0.62rem] tracking-widest uppercase">Required gates</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {role.gates.map((g, i) => (
                  <span key={g} className="pm-chip">
                    {i + 1}. {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function MatrixModal({
  open,
  onClose,
  highlight,
}: {
  open: boolean;
  onClose: () => void;
  highlight: RoleId | null;
}) {
  const [cat, setCat] = useState<Category | "all">("all");
  const [onlyGranted, setOnlyGranted] = useState(false);
  const rows = useMemo(
    () =>
      MATRIX.filter((r) => cat === "all" || r.category === cat).filter(
        (r) => !onlyGranted || !highlight || permFor(highlight, r) !== "none",
      ),
    [cat, onlyGranted, highlight],
  );
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Permission Matrix — 58 sub-permissions × 12 admin roles"
      subtitle="⚙️ = configurable by super admin per minor-admin account · source: Role & Permission Hierarchy"
      icon="📋"
      width="80rem"
      footer={
        <>
          <span className="pm-faint mr-auto text-[0.7rem]">
            <i className="bi bi-check-circle-fill" style={{color:"var(--bs-success)"}} /> granted · <i className="bi bi-gear" style={{color:"var(--bs-warning)"}} /> configurable · <i className="bi bi-x-circle-fill" style={{color:"var(--bs-danger)"}} /> denied — highlighted column = selected role
          </span>
          <button className="pm-btn pm-btn-primary pm-btn-sm" onClick={onClose}>
            Done
          </button>
        </>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Tabs
          variant="pill"
          active={cat}
          onChange={(id) => setCat(id as Category | "all")}
          tabs={[
            { id: "all", label: "All", icon: <i className="bi bi-grid-3x3-gap" /> },
            ...CATEGORIES.map((c) => ({ id: c, label: c, icon: CATEGORY_ICON[c] })),
          ]}
        />
        <label className="pm-chip ml-auto cursor-pointer select-none">
          <input type="checkbox" checked={onlyGranted} onChange={(e) => setOnlyGranted(e.target.checked)} />
          Only what this role can do
        </label>
      </div>
      <div className="pm-scroll max-h-[58vh] overflow-auto rounded-xl border" style={{ borderColor: "var(--pm-border)" }}>
        <table className="pm-table">
          <thead>
            <tr>
              <th className="sticky left-0 z-[2] min-w-[13rem]">Permission</th>
              {ROLES.map((r) => (
                <th
                  key={r.id}
                  className="text-center"
                  style={
                    highlight === r.id
                      ? { background: `color-mix(in srgb, ${r.color} 22%, transparent)`, color: "var(--pm-text)" }
                      : undefined
                  }
                >
                  <span title={r.name}>
                    {r.icon}
                    <br />T{r.tier}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const showCat = i === 0 || rows[i - 1].category !== r.category;
              return (
                <Fragment key={r.label}>
                  {showCat && (
                    <tr className="cat-row">
                      <td colSpan={ROLES.length + 1}>
                        {CATEGORY_ICON[r.category]} {r.category}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td
                      className="sticky left-0 z-[1] font-medium"
                      style={{ background: "var(--pm-solid)" }}
                    >
                      {r.label}
                    </td>
                    {ROLES.map((role) => {
                      const p = permFor(role.id, r);
                      return (
                        <td
                          key={role.id}
                          className="text-center"
                          title={`${role.name} · ${PERM_LABEL[p]}`}
                          style={
                            highlight === role.id
                              ? { background: `color-mix(in srgb, ${role.color} 12%, transparent)` }
                              : undefined
                          }
                        >
                          {PERM_ICON[p]}
                        </td>
                      );
                    })}
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}

export default function RoleStage({
  selected,
  onSelect,
  onContinue,
  log,
}: {
  selected: RoleId | null;
  onSelect: (id: RoleId) => void;
  onContinue: () => void;
  log: (msg: string, tone?: string, detail?: string) => void;
}) {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<"all" | "exec" | "ops" | "limited">("all");
  const [matrixOpen, setMatrixOpen] = useState(false);
  const [drawerRole, setDrawerRole] = useState<Role | null>(null);
  const [hierarchyOpen, setHierarchyOpen] = useState(false);

  const role = selected ? ROLES.find((r) => r.id === selected)! : null;

  const filtered = useMemo(
    () =>
      ROLES.filter((r) => {
        const q = query.trim().toLowerCase();
        const hitQ = !q || `${r.name} ${r.alias} ${r.summary}`.toLowerCase().includes(q);
        const hitT =
          tierFilter === "all" ||
          (tierFilter === "exec" && r.tier <= 1) ||
          (tierFilter === "ops" && r.tier >= 2 && r.tier <= 5) ||
          (tierFilter === "limited" && r.tier >= 6);
        return hitQ && hitT;
      }),
    [query, tierFilter],
  );

  const pick = (r: Role) => {
    onSelect(r.id);
    log(`Role context selected — ${r.name} (Tier ${r.tier})`, r.color, `Clearance ${r.clearance}`);
    toast({
      tone: "primary",
      icon: r.icon,
      title: `${r.name} selected`,
      body: `Tier ${r.tier} · ${scoreFor(r.id).full} direct permissions · reports to ${r.reportsTo}`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          className="pm-input max-w-[15rem] flex-1 !py-2 text-[0.82rem]"
          placeholder="🔍 Search roles, e.g. finance…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Tabs
          variant="pill"
          active={tierFilter}
          onChange={(id) => setTierFilter(id as typeof tierFilter)}
          tabs={[
            { id: "all", label: "All 12" },
            { id: "exec", label: "Tier 0–1" },
            { id: "ops", label: "Tier 2–5" },
            { id: "limited", label: "Tier 6–8" },
          ]}
        />
        <div className="ml-auto flex gap-2">
          <button className="pm-btn pm-btn-ghost pm-btn-sm" onClick={() => setHierarchyOpen(true)}>
            🏛️ Hierarchy
          </button>
          <button className="pm-btn pm-btn-ghost pm-btn-sm" onClick={() => setMatrixOpen(true)}>
            📋 Matrix
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <div role="radiogroup" aria-label="Admin roles" className="grid gap-2.5 sm:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((r) => (
            <RoleCard
              key={r.id}
              role={r}
              selected={selected === r.id}
              onSelect={() => pick(r)}
              onDetails={() => setDrawerRole(r)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="pm-panel col-span-full p-6 text-center text-[0.8rem]">No role matches “{query}”.</div>
          )}
        </div>

        <aside className="pm-card sticky top-4 self-start p-4">
          {!role && (
            <div className="py-10 text-center">
              <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl text-2xl" style={{ background: "var(--pm-inset)" }}>
                🪪
              </div>
              <h4 className="text-[0.9rem] font-bold">No role context</h4>
              <p className="pm-muted mx-auto mt-1 max-w-[16rem] text-[0.76rem]">
                Pick the hat you are wearing for this session. The four authentication gates adapt to the clearance you
                choose.
              </p>
            </div>
          )}
          {role && (
            <>
              <div className="flex items-start gap-3">
                <div className="pm-role-icon !h-11 !w-11 !text-xl" style={{ ["--accent" as string]: role.color }}>
                  {role.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[0.95rem] leading-tight font-bold">{role.name}</h3>
                  <p className="pm-faint text-[0.72rem]">
                    Tier {role.tier} · {role.alias}
                  </p>
                </div>
                <ClearanceBadge role={role} />
              </div>
              <div className="my-3 h-px" style={{ background: "var(--pm-border)" }} />
              <DetailPanel role={role} onOpenMatrix={() => setMatrixOpen(true)} />
              <button className="pm-btn pm-btn-primary pm-btn-block pm-btn-lg mt-4" onClick={onContinue}>
                Begin authentication as {role.name} →
              </button>
              <p className="pm-faint mt-2 text-center text-[0.68rem]">
                4 sequential gates · est. 45 seconds · session capped at {role.sessionTimeout}
              </p>
            </>
          )}
        </aside>
      </div>

      {/* mobile sticky action bar */}
      {role && (
        <div className="pm-card fixed inset-x-3 bottom-3 z-40 flex items-center gap-3 p-3 xl:hidden">
          <span className="pm-role-icon !h-9 !w-9 !text-base" style={{ ["--accent" as string]: role.color }}>
            {role.icon}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.8rem] font-bold">{role.name}</p>
            <p className="pm-faint text-[0.66rem]">
              Tier {role.tier} · {role.clearance}
            </p>
          </div>
          <button className="pm-btn pm-btn-primary pm-btn-sm" onClick={onContinue}>
            Authenticate →
          </button>
        </div>
      )}

      <MatrixModal open={matrixOpen} onClose={() => setMatrixOpen(false)} highlight={selected} />

      <Drawer
        open={!!drawerRole}
        onClose={() => setDrawerRole(null)}
        title={drawerRole ? `${drawerRole.icon}  ${drawerRole.name}` : ""}
        subtitle={drawerRole ? `Tier ${drawerRole.tier} · ${drawerRole.alias} · clearance ${drawerRole.clearance}` : ""}
      >
        {drawerRole && (
          <div className="space-y-4">
            <p className="pm-muted text-[0.82rem] leading-relaxed">{drawerRole.summary}</p>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((c) => {
                const cs = categoryScore(drawerRole.id, c);
                return (
                  <div key={c} className="pm-panel p-2.5">
                    <p className="text-[0.74rem] font-semibold">
                      {CATEGORY_ICON[c]} {c}
                    </p>
                    <div className="pm-progress mt-1.5 !h-[5px]">
                      <div className="pm-progress-bar" style={{ width: `${cs.pct}%`, background: drawerRole.color }} />
                    </div>
                    <p className="pm-faint pm-mono mt-1 text-[0.65rem]">
                      {cs.granted}/{cs.total} granted
                    </p>
                  </div>
                );
              })}
            </div>
            <div>
              <p className="pm-faint mb-1.5 text-[0.62rem] tracking-widest uppercase">Granted permissions</p>
              <div className="pm-scroll max-h-64 space-y-1 overflow-y-auto pr-1">
                {MATRIX.filter((r) => permFor(drawerRole.id, r) !== "none").map((r) => (
                  <div key={r.label} className="pm-panel flex items-center justify-between p-2 text-[0.74rem]">
                    <span>
                      <span className="pm-faint mr-1.5">{CATEGORY_ICON[r.category]}</span>
                      {r.label}
                    </span>
                    <span>{PERM_ICON[permFor(drawerRole.id, r)]}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              className="pm-btn pm-btn-primary pm-btn-block"
              onClick={() => {
                pick(drawerRole);
                setDrawerRole(null);
              }}
            >
              Select this role
            </button>
          </div>
        )}
      </Drawer>

      <Modal
        open={hierarchyOpen}
        onClose={() => setHierarchyOpen(false)}
        title="Role Tier Hierarchy"
        subtitle="Who can create whom · who reports to whom"
        icon="🏛️"
        width="52rem"
      >
        <div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--pm-border)" }}>
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
                  <td>
                    <span className="pm-mono font-bold">{t.tier}</span>
                  </td>
                  <td className="font-semibold">{t.role}</td>
                  <td className="pm-muted">{t.canCreate}</td>
                  <td className="pm-muted">{t.reportsTo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="pm-faint mt-3 text-[0.72rem]">
          PayMo extends the base spec with four functional roles — Developer Admin, Partner Relations, Investor
          Relations and Customer Care Admin — mapped onto the same tier ladder.
        </p>
      </Modal>
    </div>
  );
}
