import { useState } from "react";
import { Badge, Drawer, Modal, Steps } from "../../../components/ui";
import { AuthorityPanel } from "../../../components/AuthorityPanel";
import { Meter } from "../../../components/ui";
import type { Factor, RiskUser } from "../data/riskData";

/* ================================================================
   1. User risk profile drawer
   ================================================================ */
export function UserRiskDrawer({ user, onClose, onOverride, onFreeze }: {
  user: RiskUser | null; onClose: () => void; onOverride: (x: RiskUser) => void; onFreeze: (x: RiskUser) => void;
}) {
  return (
    <Drawer open={!!user} onClose={onClose} half
      icon="bi-person-exclamation" tone="red"
      title={user ? `${user.name} · ${user.id}` : "Risk profile"}
      subtitle="Live explainable score and interventions"
      footer={user && (
        <div className="d-flex gap-2 w-100">
          <button className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => onOverride(user)}>
            <i className="bi bi-pencil-square me-1" />Override score
          </button>
          <button className="btn btn-outline-danger btn-sm flex-grow-1" onClick={() => onFreeze(user)}>
            <i className="bi bi-snow me-1" />Freeze account
          </button>
          <button className="btn btn-primary btn-sm flex-grow-1" onClick={onClose}>Close review</button>
        </div>
      )}>
      {user && (
        <div>
          {/* Authority panel */}
          <div className="d-flex justify-content-between align-items-center gap-2 mb-3 flex-wrap">
            <AuthorityPanel area="Individual risk intervention" auditRef="AUD-RSK-77412"
              permissions={["Override risk scores", "Freeze and restrict accounts",
                "View explainable model evidence", "Set enhanced monitoring"]} />
            <Badge tone="ink">Live score</Badge>
          </div>

          {/* Risk score hero */}
          <div className="pm-card pm-card-pad mb-3" style={{ background: "#fef2f2", borderLeft: "3px solid #f04438" }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="pm-eyebrow mb-1" style={{ fontSize: ".62rem" }}>CURRENT RISK SCORE</span>
                <div className="d-flex align-items-baseline gap-2">
                  <span style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "2rem", color: "#b42318" }}>
                    {user.score}
                  </span>
                  <span className="pm-td-sub">Previous {user.previous} · +{user.score - user.previous}</span>
                </div>
              </div>
              <Badge tone={user.score > 80 ? "red" : "amber"}>{user.action}</Badge>
            </div>
          </div>

          {/* Factor contributions */}
          <div className="pm-eyebrow mb-2">Factor contributions</div>
          <div className="pm-card mb-3">
            {user.factors.map((f, i) => (
              <div key={f} className="d-flex align-items-center gap-2" style={{ padding: ".6rem 1rem", borderBottom: "1px solid var(--pm-border)" }}>
                <div className="flex-grow-1">
                  <div style={{ fontSize: ".76rem" }}>{f}</div>
                </div>
                <div style={{ width: 120 }}>
                  <Meter value={[22, 18, 15, 12, 10][i] ?? 8} tone="#f04438" width={120} />
                </div>
                <div className="text-end" style={{ minWidth: 40 }}>
                  <span className="mono" style={{ fontSize: ".72rem", fontWeight: 700 }}>{[22, 18, 15, 12, 10][i] ?? 8}/100</span>
                </div>
              </div>
            ))}
          </div>

          {/* Decision evidence */}
          <div className="pm-card pm-card-pad mb-3" style={{ background: "#f4f1ff", border: "1px solid #ded4ff" }}>
            <div style={{ fontWeight: 700, fontSize: ".82rem", marginBottom: ".5rem" }}>Decision evidence</div>
            <div style={{ fontSize: ".78rem", color: "#475467", marginBottom: ".75rem" }}>
              Score recalculated {user.updated} after correlated transaction, device and network signals. Customer profile is preserved as a point-in-time evidence snapshot.
            </div>
            <div className="pm-kv"><span className="k">Model version</span><span className="v">XGBoost v3.2</span></div>
            <div className="pm-kv"><span className="k">Data confidence</span><span className="v">High · 98.4%</span></div>
            <div className="pm-kv"><span className="k">Next recalculation</span><span className="v">On next transaction or session event</span></div>
          </div>
        </div>
      )}
    </Drawer>
  );
}

/* ================================================================
   2. Risk score override wizard
   ================================================================ */
export function OverrideWizard({ user, onClose, onSave }: {
  user: RiskUser | null; onClose: () => void; onSave: (n: number) => void;
}) {
  const [s, setS] = useState(0);
  const [score, setScore] = useState(30);
  return (
    <Modal open={!!user} onClose={onClose} tone="violet" icon="bi-pencil-square" size="md"
      title="Risk score override" subtitle="Time-bounded, dual-audited administrative control">
      <div className="pm-modal-body">
        <AuthorityPanel area="Risk score override" auditRef="AUD-OVR-19022"
          permissions={["Set temporary scores", "Bypass automated action bands",
            "Require compliance co-signature", "Revoke overrides immediately"]} />
        <div className="mb-3">
          <Steps current={s} steps={[
            { label: "Score", icon: "bi-speedometer2" },
            { label: "Reason", icon: "bi-journal-text" },
            { label: "Confirm", icon: "bi-shield-check" },
          ]} />
        </div>
        {s === 0 && (
          <div>
            <label className="form-label">Override score (0–100)</label>
            <input className="form-range mb-2" type="range" min="0" max="100" value={score}
              onChange={e => setScore(+e.target.value)} />
            <div className="text-center mb-2" style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "2.5rem", color: "#5925dc" }}>
              {score}<span style={{ fontSize: "1rem", color: "var(--pm-muted)" }}>/100</span>
            </div>
            <div className="pm-td-sub text-center">Automatic controls will use this value until the override expires.</div>
          </div>
        )}
        {s === 1 && (
          <div>
            <label className="form-label">Decision reason <span style={{ color: "#f04438" }}>*</span></label>
            <textarea className="form-control mb-3" rows={4}
              defaultValue="Investigation cleared the current activity as a verified legitimate business pattern." />
            <label className="form-label">Expiry</label>
            <select className="form-select">
              <option>30 days</option>
              <option>90 days</option>
              <option>31 Dec 2026</option>
              <option>Never — requires compliance approval</option>
            </select>
          </div>
        )}
        {s === 2 && (
          <div className="pm-note" style={{ borderColor: "#f79009", background: "#fff5e6" }}>
            <i className="bi bi-exclamation-triangle me-1" style={{ color: "#f79009" }} />
            <b>Control confirmation</b><br />
            <span style={{ fontSize: ".78rem" }}>The original score and model evidence are never changed. Compliance is notified and may revoke this override at any time.</span>
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        {s > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setS(s - 1)}>Back</button>}
        <div className="flex-grow-1" />
        <button className="btn btn-primary btn-sm" onClick={() => s < 2 ? setS(s + 1) : onSave(score)}>
          {s === 2 ? "Apply override" : "Continue"}
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   3. Scoring factor control modal
   ================================================================ */
export function FactorModal({ factor, onClose, onSave }: {
  factor: Factor | null; onClose: () => void; onSave: (a: boolean) => void;
}) {
  const [a, setA] = useState(factor?.enabled ?? true);
  return (
    <Modal open={!!factor} onClose={onClose} tone="violet" icon="bi-sliders" size="sm"
      title="Scoring factor control" subtitle={factor?.id}>
      <div className="pm-modal-body">
        {factor && (
          <>
            <AuthorityPanel area="Model factor management" auditRef="AUD-MDL-81109"
              permissions={["Tune factor weights", "Enable or pause model features",
                "Run backtests", "Deploy approved model versions"]} />
            <div className="pm-card pm-card-pad mb-3" style={{ background: "#f4f1ff", border: "1px solid #ded4ff" }}>
              <div style={{ fontWeight: 700, fontSize: ".82rem" }}>{factor.name} · {factor.weight}%</div>
              <div className="pm-td-sub mt-1">{factor.subs}</div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="form-label">Weight</label>
                <input className="form-control" defaultValue={`${factor.weight}%`} />
              </div>
              <div className="col-6">
                <label className="form-label">Update cadence</label>
                <input className="form-control" defaultValue={factor.frequency} />
              </div>
            </div>
            <div className="form-check form-switch">
              <input className="form-check-input" id="factorActive" type="checkbox" checked={a}
                onChange={e => setA(e.target.checked)} />
              <label htmlFor="factorActive" className="form-check-label" style={{ fontSize: ".8rem" }}>
                Feature enabled in production scoring
              </label>
            </div>
          </>
        )}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={() => onSave(a)}>Save production control</button>
      </div>
    </Modal>
  );
}
