import { useState } from "react";
import { Badge, Modal, Drawer, Steps, useToast } from "../../../components/ui";

/* ============================ 1. Flag Detail Drawer ============================ */
export function FlagDetailDrawer({ flag, onClose }: { flag: string | null; onClose: () => void }) {
  if (!flag) return null;
  return (
    <Drawer open onClose={onClose} title={`${flag} — Flag Operations`} subtitle="Targeting, rollout controls and release activity" icon="bi-flag" wide>
      <div className="pm-card pm-card-pad mb-3">
        <div className="d-flex justify-content-between"><h5>{flag}</h5><Badge tone="green" dot>Monitored rollout</Badge></div>
        <div className="row g-3 mt-2">{[["Current", "20%"], ["Owner", "Product"], ["Created", "Aug 1"], ["Metric", "Completion rate"]].map(x => <div className="col-3" key={x[0]}><div className="pm-eyebrow">{x[0]}</div><b>{x[1]}</b></div>)}</div>
        <div className="pm-meter mt-2" style={{ width: "100%" }}><span style={{ width: "20%", background: "#12b76a" }} /></div>
      </div>
      <div className="pm-card pm-card-pad mb-3"><h6>Emergency controls</h6>
        <div className="d-grid gap-2">{[["bi-pause-circle", "Pause rollout", "outline-warning"], ["bi-arrow-counterclockwise", "Rollback percentage", "outline-primary"], ["bi-lightning-charge", "Force 100%", "outline-success"], ["bi-power", "Kill switch", "outline-danger"]].map(x => <button key={x[1]} className={`btn btn-sm btn-${x[2]}`}><i className={`bi ${x[0]} me-1`} />{x[1]}</button>)}</div>
      </div>
      <div className="pm-card pm-card-pad"><h6>Recent activity</h6>
        {[["Aug 22", "Rollout increased to 20%", "green"], ["Aug 20", "Experiment sample refreshed", "blue"], ["Aug 18", "Metric checkpoint passed", "green"]].map(a => <div className="d-flex justify-content-between py-1 border-bottom small" key={a[0]}><span>{a[1]}</span><span className="text-muted">{a[0]}</span></div>)}
      </div>
    </Drawer>
  );
}

/* ============================ 2. Rollout Scheduler Drawer ============================ */
export function RolloutSchedulerDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Drawer open onClose={onClose} title="Rollout Scheduler" subtitle="Advance, pause or rollback flag rollouts" icon="bi-calendar2-week" wide>
      <div className="pm-card pm-card-pad mb-3"><h6>Active rollout schedules</h6>
        {[["New Onboarding", "20%", "+20% every 3 days", "Product", "2d"], ["Fraud v3.3", "10%", "+10% every 7 days", "ML Team", "5d"], ["Push v2", "5%", "+10% every 3 days", "Engineering", "1d"]].map(r => <div className="pm-card pm-card-pad mb-2" key={r[0]}>
          <div className="d-flex justify-content-between"><b>{r[0]}</b><Badge tone="blue">{r[1]}</Badge></div>
          <div className="small text-muted mt-1">Schedule: {r[2]} · Owner: {r[3]}</div>
          <div className="small mt-1"><b>Next advance in {r[4]}</b></div>
          <div className="d-flex gap-2 mt-2"><button className="btn btn-sm btn-outline-warning"><i className="bi bi-pause-circle me-1" />Pause</button><button className="btn btn-sm btn-outline-primary"><i className="bi bi-arrow-up-circle me-1" />Advance</button></div>
        </div>)}
      </div>
    </Drawer>
  );
}

/* ============================ 3. Experiment Detail Modal ============================ */
export function ExperimentDetailModal({ open, test, onClose }: { open: boolean; test: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`${test} — Experiment Detail`} subtitle="A/B test guardrails, audience split and statistical analysis" icon="bi-beaker" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Status", "Running", "green"], ["Duration", "30 days", "blue"], ["Sample", "29,600 users", "blue"], ["Confidence", "95%", "green"]].map(x => <div className="col-md-3" key={x[0]}><div className="pm-card pm-card-pad text-center"><div className="pm-eyebrow">{x[0]}</div><div className="fw-bold">{x[1]}</div></div></div>)}</div>
        <h6>Variant comparison</h6>
        <div className="row g-3">
          <div className="col-md-6"><div className="pm-card pm-card-pad"><Badge tone="grey">Control (80%)</Badge><div className="mt-2">Old flow</div>{[["Users", "23,680"], ["Completion", "68%"], ["Avg time", "8.3 min"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}</div></div>
          <div className="col-md-6"><div className="pm-card pm-card-pad border-success"><Badge tone="green">Variant (20%)</Badge><div className="mt-2">New flow</div>{[["Users", "5,920"], ["Completion", "74%"], ["Avg time", "6.1 min"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b>{x[1]}</b></div>)}</div></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 4. Kill Switch Modal ============================ */
export function KillSwitchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Emergency Kill Switch" subtitle="Disable all non-100% feature flags immediately" icon="bi-lightning-charge" tone="red">
      <div className="pm-modal-body">
        <div className="alert alert-danger small"><i className="bi bi-exclamation-triangle me-1" />This will immediately disable ALL feature flags not at 100% rollout. Existing user data remains unchanged.</div>
        <h6>Flags that will be disabled</h6>
        {[["New Onboarding Flow", "20%"], ["AI Fraud v3.3", "10%"], ["Push Notification v2", "5%"], ["Smart savings nudges", "35%"], ["Business invoices v2", "15%"]].map(f => <div className="d-flex justify-content-between py-1 border-bottom small" key={f[0]}><span>{f[0]}</span><Badge tone="amber">{f[1]}</Badge></div>)}
        <div className="mt-3"><label className="form-label">Reason for emergency shutdown</label><textarea className="form-control" rows={2} defaultValue="Critical production issue detected." /></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-danger" onClick={() => { push({ kind: "success", title: "Kill switch activated" }); onClose(); }}>Activate kill switch</button></div>
    </Modal>
  );
}

/* ============================ 5. Flag Performance Metrics Modal ============================ */
export function FlagMetricsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Flag Performance Metrics" subtitle="Control versus variant outcomes with statistical significance" icon="bi-graph-up-arrow" tone="violet" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Flag</th><th>Metric</th><th>Control</th><th>Variant</th><th>Delta</th><th>Significance</th></tr></thead><tbody>
          {[["New Onboarding", "Completion rate", "68%", "74%", "+6pp", "p<0.01"], ["New Onboarding", "Time to complete", "8.3 min", "6.1 min", "−2.2 min", "p<0.01"], ["Fraud v3.3", "False positive rate", "34%", "28%", "−6pp", "p<0.05"], ["Fraud v3.3", "Fraud catch rate", "94%", "96%", "+2pp", "p<0.10"], ["Push v2", "Open rate", "12%", "18%", "+6pp", "p<0.01"], ["Push v2", "Click rate", "3.2%", "5.1%", "+1.9pp", "p<0.01"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 0 || i === 1 ? "pm-td-strong" : i > 1 ? "pm-num" : ""}>{i === 5 ? <Badge tone={c.includes("0.10") ? "amber" : "green"}>{c}</Badge> : c}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onClose}>Export metrics</button></div>
    </Modal>
  );
}

/* ============================ 6. Archived Flag Detail Modal ============================ */
export function ArchivedFlagDetailModal({ open, flag, onClose }: { open: boolean; flag: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title={`${flag} — Archive Detail`} subtitle="Final outcome, rollout journey and lessons learned" icon="bi-archive" tone="blue">
      <div className="pm-modal-body">
        <div className="row g-3 mb-3">{[["Status", "Shipped to 100%", "green"], ["Duration", "6 weeks", "blue"], ["Outcome", "Success", "green"]].map(x => <div className="col-md-4" key={x[0]}><div className="pm-card pm-card-pad text-center"><Badge tone={x[2] as any}>{x[0]}: {x[1]}</Badge></div></div>)}</div>
        <h6>Rollout journey</h6>
        {[["Jun 1", "10% — Initial rollout"], ["Jun 15", "25% — No regressions"], ["Jul 1", "50% — Positive metrics"], ["Jul 15", "100% — Shipped"]].map(r => <div className="d-flex gap-2 py-1 border-bottom small" key={r[0]}><span className="mono text-muted" style={{ width: 50 }}>{r[0]}</span><span>{r[1]}</span></div>)}
        <h6 className="mt-3">Final metrics</h6>
        {[["Completion rate improvement", "+6pp"], ["Time to complete", "−2.2 min"], ["User satisfaction", "+12%"], ["Support tickets", "−23%"]].map(x => <div className="d-flex justify-content-between py-1 border-bottom small" key={x[0]}><span className="text-muted">{x[0]}</span><b className="text-success">{x[1]}</b></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 7. Flag Audit Trail Modal ============================ */
export function FlagAuditTrailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Feature Flag Audit Trail" subtitle="Immutable record of all flag operations" icon="bi-clock-history" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Date</th><th>Admin</th><th>Flag</th><th>Change</th><th>Reason</th></tr></thead><tbody>
          {[["Aug 22", "Product Lead", "feat.push_v2", "Rollout 0% → 5%", "A/B test start"], ["Aug 20", "Product Lead", "feat.cardless_atm", "Created (disabled)", "Pending QA"], ["Aug 15", "ML Lead", "feat.fraud_v33", "Rollout 0% → 10%", "Model deployed"], ["Aug 1", "Product Lead", "feat.new_onboarding", "Rollout 0% → 20%", "A/B test start"], ["Jul 15", "Product Lead", "feat.kyc_ui_v2", "Rollout 0% → 50%", "Positive results"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 1 || i === 2 ? "pm-td-strong" : ""}>{c}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={onClose}>Export</button></div>
    </Modal>
  );
}

/* ============================ 8. Flag Rollback Modal ============================ */
export function FlagRollbackModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Rollback Feature Flag" subtitle="Revert rollout to previous safe percentage" icon="bi-arrow-counterclockwise" tone="amber">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Current rollout</label><input className="form-control" value="20%" readOnly /></div>
          <div className="col-md-6"><label className="form-label">Rollback to</label><select className="form-select"><option>10%</option><option>5%</option><option>0% (disable)</option></select></div>
          <div className="col-12"><label className="form-label">Reason</label><textarea className="form-control" rows={2} defaultValue="Metric regression detected in completion rate." /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-warning" onClick={() => { push({ kind: "success", title: "Rollback queued" }); onClose(); }}>Rollback with 2FA</button></div>
    </Modal>
  );
}

/* ============================ 9. Flag Pause Modal ============================ */
export function FlagPauseModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Pause Rollout" subtitle="Stop advancing the flag at its current percentage" icon="bi-pause-circle" tone="amber">
      <div className="pm-modal-body">
        <p className="small text-muted">The flag will remain at its current 20% rollout and stop advancing. Users in the current cohort continue to see the feature.</p>
        <div className="row g-3">
          <div className="col-12"><label className="form-label">Reason for pause</label><select className="form-select"><option>Metric regression</option><option>User complaints</option><option>External factor</option><option>Investigating issue</option></select></div>
          <div className="col-12"><label className="form-label">Notes</label><textarea className="form-control" rows={2} defaultValue="Completion rate dropped 2pp in last 24h." /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-warning" onClick={() => { push({ kind: "success", title: "Rollout paused" }); onClose(); }}>Pause rollout</button></div>
    </Modal>
  );
}

/* ============================ 10. Flag Force 100% Modal ============================ */
export function FlagForce100Modal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Force 100% Rollout" subtitle="Immediately deploy the feature to all users" icon="bi-lightning-charge" tone="green">
      <div className="pm-modal-body">
        <div className="alert alert-success small"><i className="bi bi-lightning-charge me-1" />This will immediately deploy the feature to 100% of users. Requires Super Admin 2FA.</div>
        <div className="row g-3">
          <div className="col-12"><label className="form-label">Feature</label><input className="form-control" value="New Onboarding Flow — feat.new_onboarding" readOnly /></div>
          <div className="col-md-6"><label className="form-label">Current rollout</label><input className="form-control" value="20%" readOnly /></div>
          <div className="col-md-6"><label className="form-label">Target rollout</label><input className="form-control" value="100%" readOnly /></div>
          <div className="col-12"><label className="form-label">Justification</label><textarea className="form-control" rows={2} defaultValue="All metrics positive. Ready for full deployment." /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-success" onClick={() => { push({ kind: "success", title: "Full rollout queued" }); onClose(); }}>Force 100% with 2FA</button></div>
    </Modal>
  );
}

/* ============================ 11. Flag Targeting Editor Modal ============================ */
export function FlagTargetingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Edit Flag Targeting" subtitle="Configure who sees this feature" icon="bi-people" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Rollout strategy</label><select className="form-select"><option>Percentage of users</option><option>User segment</option><option>Whitelist</option><option>Attribute-based</option></select></div>
          <div className="col-md-6"><label className="form-label">Rollout %</label><div className="input-group"><input className="form-control" defaultValue="20" /><span className="input-group-text">%</span></div></div>
          <div className="col-md-6"><label className="form-label">Include segments</label><select className="form-select"><option>All users</option><option>New users only</option><option>Active savers</option><option>SME accounts</option></select></div>
          <div className="col-md-6"><label className="form-label">Exclude segments</label><select className="form-select"><option>None</option><option>Beta testers</option><option>Internal staff</option></select></div>
          <div className="col-12"><label className="form-label">Whitelist (user IDs, comma-separated)</label><textarea className="form-control" rows={2} placeholder="PAY-12345, PAY-67890" /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Targeting updated" }); onClose(); }}>Save targeting</button></div>
    </Modal>
  );
}

/* ============================ 12. Flag Metrics Config Modal ============================ */
export function FlagMetricsConfigModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Configure Success Metrics" subtitle="Define guardrail and primary metrics for this flag" icon="bi-graph-up" tone="violet">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-12"><label className="form-label">Primary metric</label><select className="form-select"><option>Completion rate</option><option>Revenue per user</option><option>Engagement score</option></select></div>
          <div className="col-12"><label className="form-label">Guardrail metrics</label>
            {[["Error rate < 1%", true], ["p95 latency < 500ms", true], ["No regression in retention", true], ["NPS score stable", false]].map(m => <div className="form-check py-1" key={m[0]}><input className="form-check-input" type="checkbox" id={`gm-${m[0]}`} defaultChecked={m[1]} /><label className="form-check-label small" htmlFor={`gm-${m[0]}`}>{m[0]}</label></div>)}
          </div>
          <div className="col-md-6"><label className="form-label">Minimum sample size</label><input className="form-control" defaultValue="10,000" /></div>
          <div className="col-md-6"><label className="form-label">Confidence threshold</label><select className="form-select"><option>95% (standard)</option><option>99% (strict)</option><option>90% (exploratory)</option></select></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Metrics configured" }); onClose(); }}>Save metrics</button></div>
    </Modal>
  );
}

/* ============================ 13. Flag Owner Transfer Modal ============================ */
export function FlagOwnerTransferModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Transfer Flag Ownership" subtitle="Reassign the accountable owner for this flag" icon="bi-person-check" tone="blue">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Current owner</label><input className="form-control" value="Product" readOnly /></div>
          <div className="col-md-6"><label className="form-label">New owner</label><select className="form-select"><option>Engineering</option><option>ML Team</option><option>Growth</option><option>Platform</option></select></div>
          <div className="col-12"><label className="form-label">Reason</label><textarea className="form-control" rows={2} defaultValue="Flag scope changed — engineering will own the rollout going forward." /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Ownership transferred" }); onClose(); }}>Transfer</button></div>
    </Modal>
  );
}

/* ============================ 14. Flag Expiry Modal ============================ */
export function FlagExpiryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast();
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Set Flag Expiry" subtitle="Automatically disable or clean up the flag after a deadline" icon="bi-calendar-x" tone="amber">
      <div className="pm-modal-body">
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Expiry date</label><input className="form-control" type="date" defaultValue="2026-11-01" /></div>
          <div className="col-md-6"><label className="form-label">On expiry</label><select className="form-select"><option>Disable flag</option><option>Force to 100%</option><option>Notify owner</option></select></div>
          <div className="col-12"><label className="form-label">Warning threshold</label><select className="form-select"><option>7 days before expiry</option><option>14 days before expiry</option><option>30 days before expiry</option></select></div>
          <div className="col-12"><label className="form-label">Notes</label><textarea className="form-control" rows={2} defaultValue="A/B test should conclude by this date. If successful, force 100%." /></div>
        </div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { push({ kind: "success", title: "Expiry set" }); onClose(); }}>Set expiry</button></div>
    </Modal>
  );
}

/* ============================ 15. Flag Comparison Modal ============================ */
export function FlagComparisonModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Compare Feature Flags" subtitle="Side-by-side flag configuration and metrics" icon="bi-arrows-angle-contract" tone="blue" size="lg">
      <div className="pm-modal-body">
        <div className="row g-2 mb-3"><div className="col"><select className="form-select"><option>New Onboarding Flow</option><option>AI Fraud v3.3</option></select></div><div className="col"><select className="form-select"><option>Enhanced KYC UI</option><option>Push Notification v2</option></select></div></div>
        <div className="pm-table-wrap"><table className="pm-table"><thead><tr><th>Attribute</th><th>Flag A</th><th>Flag B</th></tr></thead><tbody>
          {[["State", "Enabled", "Enabled"], ["Rollout", "20%", "50%"], ["Owner", "Product", "Product"], ["Primary metric", "Completion rate", "Completion rate"], ["Delta", "+6pp", "+12pp"], ["Significance", "p<0.01", "p<0.01"], ["Days running", "23", "40"]].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 0 ? "pm-td-strong" : ""}>{c}</td>)}</tr>)}
        </tbody></table></div>
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}

/* ============================ 16. Flag Changelog Modal ============================ */
export function FlagChangelogModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open onClose={onClose} title="Flag Changelog" subtitle="Complete history of changes for this flag" icon="bi-journal-text" tone="blue" size="lg">
      <div className="pm-modal-body">
        {[["Aug 22, 14:32", "Product Lead", "Rollout 15% → 20%", "No metric regression. Advance per schedule."], ["Aug 20, 10:15", "Product Lead", "Sample refreshed", "29,600 users in experiment."], ["Aug 18, 09:00", "System", "Metric checkpoint", "Completion rate +4pp, within guardrails."], ["Aug 15, 16:30", "Product Lead", "Rollout 10% → 15%", "Positive initial results."], ["Aug 10, 11:00", "Product Lead", "Rollout 5% → 10%", "No regressions in 5 days."], ["Aug 1, 09:00", "Product Lead", "Created flag", "New onboarding A/B test."]].map((c, i) => <div className="d-flex gap-3 py-2 border-bottom" key={i}><div className="small text-muted" style={{ width: 120 }}>{c[0]}</div><div className="flex-grow-1"><div className="small"><b>{c[1]}</b> — {c[2]}</div><div className="small text-muted">{c[3]}</div></div></div>)}
      </div>
      <div className="pm-modal-foot"><button className="btn btn-outline-secondary" onClick={onClose}>Close</button></div>
    </Modal>
  );
}
