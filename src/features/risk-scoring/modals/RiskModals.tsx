import { useState } from "react";
import { Badge, Drawer, Modal, Steps } from "../../../components/ui";
import { AuthorityPanel } from "../../../components/AuthorityPanel";
import { Meter } from "../../../components/ui";
import { kes, num } from "../../../lib/format";
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
          <div className="d-flex justify-content-between align-items-center gap-2 mb-3 flex-wrap">
            <AuthorityPanel area="Individual risk intervention" auditRef="AUD-RSK-77412"
              permissions={["Override risk scores", "Freeze and restrict accounts",
                "View explainable model evidence", "Set enhanced monitoring"]} />
            <Badge tone="ink">Live score</Badge>
          </div>

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

          <div className="pm-eyebrow mb-2">Factor contributions</div>
          <div className="pm-card mb-3">
            {user.factors.map((f, i) => (
              <div key={f} className="d-flex align-items-center gap-2" style={{ padding: ".6rem 1rem", borderBottom: "1px solid var(--pm-border)" }}>
                <div className="flex-grow-1"><div style={{ fontSize: ".76rem" }}>{f}</div></div>
                <div style={{ width: 120 }}><Meter value={[22, 18, 15, 12, 10][i] ?? 8} tone="#f04438" width={120} /></div>
                <div className="text-end" style={{ minWidth: 40 }}>
                  <span className="mono" style={{ fontSize: ".72rem", fontWeight: 700 }}>{[22, 18, 15, 12, 10][i] ?? 8}/100</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pm-card pm-card-pad mb-3" style={{ background: "#f4f1ff", border: "1px solid #ded4ff" }}>
            <div style={{ fontWeight: 700, fontSize: ".82rem", marginBottom: ".5rem" }}>Decision evidence</div>
            <div style={{ fontSize: ".78rem", color: "#475467", marginBottom: ".75rem" }}>
              Score recalculated {user.updated} after correlated transaction, device and network signals.
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
          </div>
        )}
        {s === 1 && (
          <div>
            <label className="form-label">Decision reason <span style={{ color: "#f04438" }}>*</span></label>
            <textarea className="form-control mb-3" rows={4} defaultValue="Investigation cleared the current activity as a verified legitimate business pattern." />
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
              permissions={["Tune factor weights", "Enable or pause model features", "Run backtests", "Deploy approved model versions"]} />
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

/* ================================================================
   4. Deployment Review Modal
   ================================================================ */
export function DeploymentReviewModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [approval, setApproval] = useState("");
  return (
    <Modal open={true} onClose={onClose} tone="violet" icon="bi-rocket" size="md"
      title="Deployment review" subtitle="v3.3-beta · Controlled cohort release">
      <div className="pm-modal-body">
        <AuthorityPanel area="Model deployment" auditRef="AUD-DEP-44201"
          permissions={["Deploy model versions", "Roll back deployments", "Manage cohort sizes", "Approve release gates"]} />
        <Steps current={step} steps={[
          { label: "Pre-checks", icon: "bi-check2-circle" },
          { label: "Validation", icon: "bi-graph-up" },
          { label: "Approval", icon: "bi-shield-check" },
        ]} />
        {step === 0 && (
          <div className="mt-3">
            {[
              { n: "Training data integrity", ok: true, d: "SHA-256 verified · 18-month snapshot" },
              { n: "Bias review", ok: true, d: "Segment parity within 2% tolerance" },
              { n: "Performance benchmarks", ok: true, d: "AUC-ROC 0.94 · F1 0.77" },
              { n: "Precision gate", ok: false, d: "66% is below 75% target" },
              { n: "Security scan", ok: true, d: "No vulnerabilities detected" },
            ].map((v, i) => (
              <div key={i} className="pm-alert-row mb-2" style={{ borderLeftColor: v.ok ? "#12b76a" : "#f04438" }}>
                <i className={`bi ${v.ok ? "bi-check2-circle" : "bi-x-circle"}`} style={{ color: v.ok ? "#12b76a" : "#f04438" }} />
                <div className="flex-grow-1">
                  <div style={{ fontWeight: 700, fontSize: ".78rem" }}>{v.n}</div>
                  <div className="pm-td-sub">{v.d}</div>
                </div>
                <Badge tone={v.ok ? "green" : "red"}>{v.ok ? "Pass" : "Fail"}</Badge>
              </div>
            ))}
          </div>
        )}
        {step === 1 && (
          <div className="mt-3">
            <div className="pm-card pm-card-pad mb-3">
              <div className="pm-kv"><span className="k">Model</span><span className="v">XGBoost v3.3-beta</span></div>
              <div className="pm-kv"><span className="k">Cohort</span><span className="v">10% (14,839 users)</span></div>
              <div className="pm-kv"><span className="k">Duration</span><span className="v">14 days</span></div>
              <div className="pm-kv"><span className="k">Control group</span><span className="v">v3.2 live (90%)</span></div>
            </div>
            <div className="pm-eyebrow mb-2">Expected outcomes</div>
            <div className="pm-alert-row mb-2" style={{ borderLeftColor: "#12b76a" }}>
              <div className="flex-grow-1">
                <div style={{ fontWeight: 700, fontSize: ".78rem" }}>Precision improvement</div>
                <div className="pm-td-sub">66% → 72% projected</div>
              </div>
            </div>
            <div className="pm-alert-row mb-2" style={{ borderLeftColor: "#175cd3" }}>
              <div className="flex-grow-1">
                <div style={{ fontWeight: 700, fontSize: ".78rem" }}>False positive reduction</div>
                <div className="pm-td-sub">34% → 28% projected</div>
              </div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="mt-3">
            <label className="form-label">Deployment approval</label>
            <select className="form-select mb-3" value={approval} onChange={e => setApproval(e.target.value)}>
              <option value="">Select approval type...</option>
              <option value="full">Full deployment (10% → 100%)</option>
              <option value="cohort">Increase cohort (10% → 25%)</option>
              <option value="rollback">Rollback to v3.2</option>
            </select>
            <div className="pm-note" style={{ borderColor: "#f79009", background: "#fff5e6" }}>
              <i className="bi bi-exclamation-triangle me-1" style={{ color: "#f79009" }} />
              <b>Dual approval required</b><br />
              Compliance + Super Admin must approve any model deployment change.
            </div>
          </div>
        )}
      </div>
      <div className="pm-modal-foot">
        {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}>Back</button>}
        <div className="flex-grow-1" />
        <button className="btn btn-primary btn-sm" disabled={step === 2 && !approval}
          onClick={() => step < 2 ? setStep(step + 1) : onClose()}>
          {step === 2 ? "Confirm deployment" : "Continue"}
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================
   5. Movement Analysis Modal
   ================================================================ */
export function MovementAnalysisModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal open={true} onClose={onClose} tone="blue" icon="bi-graph-up-arrow" size="lg"
      title="30-day score movement analysis" subtitle="Population transitions by risk band">
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Period</span><span className="v">25 Jul – 24 Aug 2026</span></div>
          <div className="pm-kv"><span className="k">Users scored</span><span className="v">148,392</span></div>
          <div className="pm-kv"><span className="k">Score changes</span><span className="v">12,847 (8.7%)</span></div>
          <div className="pm-kv"><span className="k">Material movements</span><span className="v">1,716 (1.2%)</span></div>
        </div>
        <div className="pm-eyebrow mb-2">Band transitions</div>
        {[
          { from: "0–20", to: "21–40", count: 234, pct: 1.2, color: "#12b76a" },
          { from: "21–40", to: "41–60", count: 382, pct: 2.8, color: "#f79009" },
          { from: "41–60", to: "61–80", count: 91, pct: 4.1, color: "#f04438" },
          { from: "61–80", to: "81–100", count: 18, pct: 8.2, color: "#f04438" },
        ].map((t, i) => (
          <div key={i} className="pm-alert-row mb-2" style={{ borderLeftColor: t.color }}>
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2 mb-1">
                <Badge tone="grey">{t.from}</Badge>
                <i className="bi bi-arrow-right" />
                <Badge tone={t.pct > 5 ? "red" : t.pct > 2 ? "amber" : "green"}>{t.to}</Badge>
              </div>
              <div className="pm-td-sub">{num(t.count)} users · {t.pct}% of source band</div>
            </div>
            <div className="text-end">
              <span className="mono" style={{ fontWeight: 700 }}>{num(t.count)}</span>
            </div>
          </div>
        ))}
        <div className="pm-note mt-3">
          <i className="bi bi-info-circle me-1" />
          Material movements are those that cross action-band boundaries (e.g., standard → restricted limits).
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm"><i className="bi bi-download me-1" />Export analysis</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   6. Backtest Modal
   ================================================================ */
export function BacktestModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  return (
    <Modal open={true} onClose={running ? () => { } : onClose} tone="violet" icon="bi-play-circle" size="md"
      title="Run calibration backtest" subtitle="BT-2026-0817 · v3.3-beta cohort validation">
      <div className="pm-modal-body">
        {!running ? (
          <>
            <AuthorityPanel area="Backtest execution" auditRef="AUD-BT-55012"
              permissions={["Run calibration backtests", "Review model performance", "Approve cohort changes"]} />
            {step === 0 && (
              <div className="mt-3">
                <div className="pm-card pm-card-pad mb-3">
                  <div className="pm-kv"><span className="k">Test type</span><span className="v">Calibration backtest</span></div>
                  <div className="pm-kv"><span className="k">Model</span><span className="v">XGBoost v3.3-beta</span></div>
                  <div className="pm-kv"><span className="k">Cohort</span><span className="v">14,839 users (10%)</span></div>
                  <div className="pm-kv"><span className="k">Duration</span><span className="v">~5 minutes</span></div>
                </div>
                <div className="pm-eyebrow mb-2">What this tests</div>
                <div className="pm-alert-row mb-2" style={{ borderLeftColor: "#5925dc" }}>
                  <div className="flex-grow-1">
                    <div style={{ fontWeight: 700, fontSize: ".78rem" }}>Precision at threshold</div>
                    <div className="pm-td-sub">Validates score-to-action mapping accuracy</div>
                  </div>
                </div>
                <div className="pm-alert-row mb-2" style={{ borderLeftColor: "#5925dc" }}>
                  <div className="flex-grow-1">
                    <div style={{ fontWeight: 700, fontSize: ".78rem" }}>Segment parity</div>
                    <div className="pm-td-sub">Ensures no demographic bias in scoring</div>
                  </div>
                </div>
              </div>
            )}
            {step === 1 && (
              <div className="mt-3">
                <div className="pm-note" style={{ borderColor: "#f79009", background: "#fff5e6" }}>
                  <i className="bi bi-exclamation-triangle me-1" style={{ color: "#f79009" }} />
                  <b>Pre-approval required</b><br />
                  Running this backtest requires Compliance + Super Admin approval. Results will be logged and cannot be modified.
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <div className="mb-2" style={{ fontWeight: 700 }}>Running backtest...</div>
            <div className="progress mb-2" style={{ height: 8 }}>
              <div className="progress-bar" style={{ width: `${progress}%`, background: "#7a5af8" }} />
            </div>
            <div style={{ fontSize: ".78rem", color: "var(--pm-muted)" }}>
              {progress < 30 ? "Loading cohort data..." : progress < 70 ? "Scoring validation..." : "Generating report..."}
            </div>
          </div>
        )}
      </div>
      {!running && (
        <div className="pm-modal-foot">
          {step > 0 && <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(step - 1)}>Back</button>}
          <div className="flex-grow-1" />
          <button className="btn btn-primary btn-sm" onClick={() => {
            if (step < 1) { setStep(step + 1); return; }
            setRunning(true);
            const t = setInterval(() => setProgress(p => { if (p >= 100) { clearInterval(t); return 100; } return p + 5; }), 80);
            setTimeout(() => { setRunning(false); setProgress(0); onClose(); }, 2200);
          }}>
            {step === 1 ? "Run backtest" : "Continue"}
          </button>
        </div>
      )}
    </Modal>
  );
}

/* ================================================================
   7. Model Detail Modal
   ================================================================ */
export function ModelDetailModal({ model, onClose }: { model: { v: string; state: string; date: string; change: string; precision: string } | null; onClose: () => void }) {
  if (!model) return null;
  return (
    <Modal open={!!model} onClose={onClose} tone="violet" icon="bi-cpu" size="md"
      title={`${model.v} model details`} subtitle={`${model.state} · deployed ${model.date}`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Version</span><span className="v">{model.v}</span></div>
          <div className="pm-kv"><span className="k">State</span><span className="v"><Badge tone={model.state === "Live" ? "green" : "violet"}>{model.state}</Badge></span></div>
          <div className="pm-kv"><span className="k">Deployed</span><span className="v">{model.date}</span></div>
          <div className="pm-kv"><span className="k">Change type</span><span className="v">{model.change}</span></div>
          <div className="pm-kv"><span className="k">Precision</span><span className="v">{model.precision}</span></div>
        </div>
        <div className="pm-eyebrow mb-2">Performance metrics</div>
        <div className="row g-2 mb-3">
          {[{ l: "AUC-ROC", v: "0.94" }, { l: "F1 Score", v: "0.77" }, { l: "Recall", v: "94%" }, { l: "Latency", v: "86ms" }].map((x, i) => (
            <div className="col-6" key={i}>
              <div className="pm-card pm-card-pad text-center">
                <div className="pm-eyebrow">{x.l}</div>
                <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.1rem" }}>{x.v}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="pm-eyebrow mb-2">Training data</div>
        <div className="pm-alert-row mb-2" style={{ borderLeftColor: "#5925dc" }}>
          <div className="flex-grow-1">
            <div style={{ fontWeight: 700, fontSize: ".78rem" }}>18-month controlled dataset</div>
            <div className="pm-td-sub">Signed snapshot · 2.4M transactions · 148K users</div>
          </div>
          <Badge tone="green">Verified</Badge>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   8. Risk Band Detail Modal
   ================================================================ */
export function RiskBandDetailModal({ band, onClose }: { band: { range: string; level: string; users: number; pct: number; action: string; tone: string } | null; onClose: () => void }) {
  if (!band) return null;
  return (
    <Modal open={!!band} onClose={onClose} tone={band.tone === "green" ? "green" : band.tone === "amber" ? "amber" : "red"} icon="bi-bar-chart" size="md"
      title={`${band.range} risk band`} subtitle={`${band.level} · ${num(band.users)} users`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Score range</span><span className="v">{band.range}</span></div>
          <div className="pm-kv"><span className="k">Risk level</span><span className="v">{band.level}</span></div>
          <div className="pm-kv"><span className="k">Users</span><span className="v">{num(band.users)}</span></div>
          <div className="pm-kv"><span className="k">Population %</span><span className="v">{band.pct}%</span></div>
          <div className="pm-kv"><span className="k">Default action</span><span className="v"><Badge tone={band.tone}>{band.action}</Badge></span></div>
        </div>
        <div className="pm-eyebrow mb-2">Automated controls</div>
        <div className="pm-alert-row mb-2" style={{ borderLeftColor: "#12b76a" }}>
          <div className="flex-grow-1">
            <div style={{ fontWeight: 700, fontSize: ".78rem" }}>Transaction limits</div>
            <div className="pm-td-sub">{band.range === "0–20" || band.range === "21–40" ? "Standard 100%" : band.range === "41–60" ? "50% standard" : band.range === "61–80" ? "25% standard" : "Frozen"}</div>
          </div>
        </div>
        <div className="pm-alert-row mb-2" style={{ borderLeftColor: "#175cd3" }}>
          <div className="flex-grow-1">
            <div style={{ fontWeight: 700, fontSize: ".78rem" }}>Monitoring level</div>
            <div className="pm-td-sub">{band.range === "0–20" ? "Standard" : band.range === "21–40" ? "Enhanced logging" : band.range === "41–60" ? "Daily review" : band.range === "61–80" ? "Continuous alerts" : "Dedicated analyst"}</div>
          </div>
        </div>
        <div className="pm-alert-row mb-2" style={{ borderLeftColor: "#f79009" }}>
          <div className="flex-grow-1">
            <div style={{ fontWeight: 700, fontSize: ".78rem" }}>Verification required</div>
            <div className="pm-td-sub">{band.range === "0–20" || band.range === "21–40" ? "None" : band.range === "41–60" ? "OTP > KES 50K" : band.range === "61–80" ? "OTP + admin > KES 10K" : "Manual approval"}</div>
          </div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-primary btn-sm"><i className="bi bi-download me-1" />Export users</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   9. Override Detail Modal
   ================================================================ */
export function OverrideDetailModal({ override, onClose }: { override: { date: string; admin: string; user: string; original: string; override: string; reason: string; expires: string } | null; onClose: () => void }) {
  if (!override) return null;
  return (
    <Modal open={!!override} onClose={onClose} tone="violet" icon="bi-pencil-square" size="md"
      title="Override detail" subtitle={`${override.user} · ${override.date}`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">User</span><span className="v mono">{override.user}</span></div>
          <div className="pm-kv"><span className="k">Original score</span><span className="v"><span className="risk-score-pill amber">{override.original}</span></span></div>
          <div className="pm-kv"><span className="k">Override score</span><span className="v"><span className="risk-score-pill blue">{override.override}</span></span></div>
          <div className="pm-kv"><span className="k">Administered by</span><span className="v">{override.admin}</span></div>
          <div className="pm-kv"><span className="k">Date</span><span className="v">{override.date}</span></div>
          <div className="pm-kv"><span className="k">Expires</span><span className="v"><Badge tone="violet">{override.expires}</Badge></span></div>
        </div>
        <div className="pm-eyebrow mb-2">Decision rationale</div>
        <div style={{ fontSize: ".82rem" }}>{override.reason}</div>
        <div className="pm-note mt-3">
          <i className="bi bi-info-circle me-1" />
          Overrides are immutable. Revocation creates a new audit entry restoring the original score.
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-outline-danger btn-sm"><i className="bi bi-x-circle me-1" />Revoke override</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   10. Factor Backtest Modal
   ================================================================ */
export function FactorBacktestModal({ factor, onClose }: { factor: Factor | null; onClose: () => void }) {
  if (!factor) return null;
  return (
    <Modal open={!!factor} onClose={onClose} tone="violet" icon="bi-bezier2" size="md"
      title={`Backtest — ${factor.name}`} subtitle={`${factor.id} · weight ${factor.weight}%`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-kv"><span className="k">Factor</span><span className="v">{factor.name}</span></div>
          <div className="pm-kv"><span className="k">Current weight</span><span className="v">{factor.weight}%</span></div>
          <div className="pm-kv"><span className="k">Source</span><span className="v">{factor.source}</span></div>
          <div className="pm-kv"><span className="k">Update cadence</span><span className="v">{factor.frequency}</span></div>
        </div>
        <div className="pm-eyebrow mb-2">Backtest results (30-day)</div>
        <div className="row g-2 mb-3">
          {[{ l: "Precision", v: "72%", ok: false }, { l: "Recall", v: "91%", ok: true }, { l: "F1", v: "0.79", ok: false }, { l: "AUC", v: "0.92", ok: true }].map((x, i) => (
            <div className="col-6" key={i}>
              <div className="pm-card pm-card-pad text-center">
                <div className="pm-eyebrow">{x.l}</div>
                <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1rem" }}>{x.v}</div>
                <Badge tone={x.ok ? "green" : "amber"}>{x.ok ? "Target met" : "Below target"}</Badge>
              </div>
            </div>
          ))}
        </div>
        <div className="pm-eyebrow mb-2">Recommended action</div>
        <div className="pm-alert-row mb-2" style={{ borderLeftColor: "#f79009" }}>
          <div className="flex-grow-1">
            <div style={{ fontWeight: 700, fontSize: ".78rem" }}>Increase weight from {factor.weight}% to {factor.weight + 5}%</div>
            <div className="pm-td-sub">Projected precision improvement: +3%</div>
          </div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm">Apply weight change</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   11. Score Explanation Modal
   ================================================================ */
export function ScoreExplanationModal({ user, onClose }: { user: RiskUser | null; onClose: () => void }) {
  if (!user) return null;
  const factors = [
    { name: "Transaction velocity", weight: 22, value: "3× normal", impact: "+18" },
    { name: "Device fingerprint", weight: 18, value: "New device", impact: "+12" },
    { name: "Geographic anomaly", weight: 15, value: "528km gap", impact: "+10" },
    { name: "Amount anomaly", weight: 12, value: ">300% avg", impact: "+8" },
    { name: "Account age", weight: 10, value: "214 days", impact: "+5" },
  ];
  return (
    <Modal open={!!user} onClose={onClose} tone="blue" icon="bi-info-circle" size="md"
      title="Score explanation" subtitle={`${user.name} · ${user.id} · score ${user.score}`}>
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div className="pm-eyebrow">Total risk score</div>
              <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "2rem", color: user.score > 80 ? "#b42318" : "#b54708" }}>
                {user.score}
              </div>
            </div>
            <div className="text-end">
              <div className="pm-eyebrow">Previous</div>
              <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.2rem" }}>{user.previous}</div>
            </div>
          </div>
        </div>
        <div className="pm-eyebrow mb-2">Factor breakdown</div>
        {factors.map((f, i) => (
          <div key={i} className="pm-alert-row mb-2" style={{ borderLeftColor: i < 2 ? "#f04438" : i < 4 ? "#f79009" : "#12b76a" }}>
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between mb-1">
                <span style={{ fontWeight: 700, fontSize: ".78rem" }}>{f.name}</span>
                <span className="mono" style={{ fontWeight: 700, fontSize: ".72rem", color: "#b42318" }}>{f.impact}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="pm-td-sub">Value: {f.value}</span>
                <span className="pm-td-sub">Weight: {f.weight}%</span>
              </div>
              <Meter value={f.weight * 4} tone={i < 2 ? "#f04438" : i < 4 ? "#f79009" : "#12b76a"} width={200} />
            </div>
          </div>
        ))}
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   12. Configuration Change Modal
   ================================================================ */
export function ConfigurationChangeModal({ config, onClose, onSave }: {
  config: { key: string; value: string } | null; onClose: () => void; onSave: () => void;
}) {
  const [value, setValue] = useState(config?.value ?? "");
  if (!config) return null;
  return (
    <Modal open={!!config} onClose={onClose} tone="blue" icon="bi-gear" size="sm"
      title="Edit configuration" subtitle={config.key}>
      <div className="pm-modal-body">
        <label className="form-label">Current value</label>
        <input className="form-control mb-3" value={value} onChange={e => setValue(e.target.value)} />
        <div className="pm-note">
          <i className="bi bi-shield-lock me-1" />
          Configuration changes require Super Admin approval and are logged in the audit trail.
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={onSave}>Save change</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   13. Risk Alert Modal
   ================================================================ */
export function RiskAlertModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal open={true} onClose={onClose} tone="red" icon="bi-exclamation-triangle" size="md"
      title="Risk alert" subtitle="Precision gap detected in v3.3-beta">
      <div className="pm-modal-body">
        <div className="pm-card pm-card-pad mb-3" style={{ background: "#fef2f2", borderLeft: "3px solid #f04438" }}>
          <div className="pm-eyebrow mb-1">ALERT</div>
          <div style={{ fontWeight: 700, fontSize: ".9rem" }}>Precision gate open</div>
          <div style={{ fontSize: ".78rem", color: "#475467" }}>
            Current precision 66% is below the 75% target threshold. Run the approved calibration backtest before expanding v3.3-beta cohort.
          </div>
        </div>
        <div className="pm-eyebrow mb-2">Impact analysis</div>
        <div className="pm-alert-row mb-2" style={{ borderLeftColor: "#f04438" }}>
          <div className="flex-grow-1">
            <div style={{ fontWeight: 700, fontSize: ".78rem" }}>False positives increased</div>
            <div className="pm-td-sub">34% of flagged transactions are legitimate</div>
          </div>
        </div>
        <div className="pm-alert-row mb-2" style={{ borderLeftColor: "#f79009" }}>
          <div className="flex-grow-1">
            <div style={{ fontWeight: 700, fontSize: ".78rem" }}>Customer impact</div>
            <div className="pm-td-sub">~4,200 users affected by unnecessary restrictions</div>
          </div>
        </div>
        <div className="pm-eyebrow mb-2 mt-3">Required action</div>
        <div className="pm-alert-row mb-2" style={{ borderLeftColor: "#12b76a" }}>
          <div className="flex-grow-1">
            <div style={{ fontWeight: 700, fontSize: ".78rem" }}>Run calibration backtest</div>
            <div className="pm-td-sub">BT-2026-0817 validates threshold adjustments</div>
          </div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Dismiss</button>
        <button className="btn btn-primary btn-sm">Run backtest</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   14. Account Action History Modal
   ================================================================ */
export function AccountActionHistoryModal({ user, onClose }: { user: RiskUser | null; onClose: () => void }) {
  if (!user) return null;
  const history = [
    { date: "Aug 22", action: "Score override", by: "Jeckonia Kwasa", from: "72", to: "30", reason: "Investigation cleared" },
    { date: "Aug 18", action: "Enhanced monitoring", by: "System", from: "—", to: "—", reason: "Auto-triggered by score > 60" },
    { date: "Aug 15", action: "Score recalculation", by: "System", from: "45", to: "55", reason: "Transaction velocity increase" },
    { date: "Aug 10", action: "Account unfrozen", by: "Sarah Kamau", from: "Frozen", to: "Active", reason: "KYC verified" },
  ];
  return (
    <Modal open={!!user} onClose={onClose} tone="blue" icon="bi-clock-history" size="md"
      title="Account action history" subtitle={`${user.name} · ${user.id}`}>
      <div className="pm-modal-body">
        {history.map((h, i) => (
          <div key={i} className="pm-alert-row mb-2" style={{ borderLeftColor: h.action.includes("override") ? "#5925dc" : h.action.includes("freeze") ? "#f04438" : "#12b76a" }}>
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2 mb-1">
                <span style={{ fontWeight: 700, fontSize: ".78rem" }}>{h.action}</span>
                <span className="pm-td-sub">{h.date}</span>
              </div>
              <div className="pm-td-sub">By {h.by} · {h.from !== "—" ? `${h.from} → ${h.to}` : h.reason}</div>
            </div>
          </div>
        ))}
        <div className="pm-note mt-3">
          <i className="bi bi-info-circle me-1" />
          All actions are immutable and form part of the regulatory audit trail.
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
        <button className="btn btn-outline-secondary btn-sm"><i className="bi bi-download me-1" />Export history</button>
      </div>
    </Modal>
  );
}

/* ================================================================
   15. Policy Editor Modal
   ================================================================ */
export function PolicyEditorModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [policy, setPolicy] = useState({
    transactionLimits: "Standard · 100%",
    withdrawalLimits: "Standard · 100%",
    verification: "None",
    monitoring: "Standard",
    support: "Normal",
  });
  return (
    <Modal open={true} onClose={onClose} tone="blue" icon="bi-shield-check" size="md"
      title="Edit action policy" subtitle="Risk-based automation rules">
      <div className="pm-modal-body">
        <AuthorityPanel area="Policy management" auditRef="AUD-POL-33012"
          permissions={["Edit action policies", "Configure risk thresholds", "Deploy policy changes"]} />
        <div className="row g-3 mt-3">
          <div className="col-6">
            <label className="form-label">Transaction limits</label>
            <select className="form-select" value={policy.transactionLimits} onChange={e => setPolicy({ ...policy, transactionLimits: e.target.value })}>
              <option>Standard · 100%</option>
              <option>50% standard</option>
              <option>25% standard</option>
              <option>Frozen</option>
            </select>
          </div>
          <div className="col-6">
            <label className="form-label">Withdrawal limits</label>
            <select className="form-select" value={policy.withdrawalLimits} onChange={e => setPolicy({ ...policy, withdrawalLimits: e.target.value })}>
              <option>Standard · 100%</option>
              <option>50% standard</option>
              <option>25% standard</option>
              <option>Frozen</option>
            </select>
          </div>
          <div className="col-6">
            <label className="form-label">Verification</label>
            <select className="form-select" value={policy.verification} onChange={e => setPolicy({ ...policy, verification: e.target.value })}>
              <option>None</option>
              <option>OTP &gt; KES 50K</option>
              <option>OTP + admin &gt; KES 10K</option>
              <option>Manual approval</option>
            </select>
          </div>
          <div className="col-6">
            <label className="form-label">Monitoring</label>
            <select className="form-select" value={policy.monitoring} onChange={e => setPolicy({ ...policy, monitoring: e.target.value })}>
              <option>Standard</option>
              <option>Enhanced logging</option>
              <option>Daily review</option>
              <option>Continuous alerts</option>
              <option>Dedicated analyst</option>
            </select>
          </div>
        </div>
      </div>
      <div className="pm-modal-foot">
        <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={onSave}>Save policy</button>
      </div>
    </Modal>
  );
}
