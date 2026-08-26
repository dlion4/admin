export interface FlagRecord {
  id: string;
  name: string;
  key: string;
  state: "Enabled" | "Beta" | "Disabled";
  rollout: string;
  target: string;
  created: string;
  owner: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
  description?: string;
  strategy?: string;
}

export interface AbTestRecord {
  id: string;
  name: string;
  flag: string;
  variantA: string;
  variantB: string;
  metric: string;
  sample: string;
  duration: string;
  result: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
}

export interface MetricRecord {
  id: string;
  flag: string;
  metric: string;
  control: string;
  variant: string;
  delta: string;
  significance: string;
}

export interface AuditRecord {
  id: string;
  date: string;
  admin: string;
  flag: string;
  change: string;
  reason: string;
}

export interface ArchivedRecord {
  id: string;
  flag: string;
  period: string;
  rollout: string;
  outcome: string;
  date: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
}

export interface SchedulerRecord {
  id: string;
  flag: string;
  current: string;
  schedule: string;
  criteria: string;
  owner: string;
  nextAdvance: string;
}

export const initialFlags: FlagRecord[] = [
  { id: "fl-1", name: "New Onboarding Flow", key: "feat.new_onboarding", state: "Enabled", rollout: "20%", target: "Random users", created: "Aug 1", owner: "Product", description: "Redesigned onboarding with guided steps", strategy: "Gradual percentage" },
  { id: "fl-2", name: "AI Fraud v3.3", key: "feat.fraud_v33", state: "Enabled", rollout: "10%", target: "Random transactions", created: "Aug 15", owner: "ML Team", description: "Next-gen fraud detection model", strategy: "Random transactions" },
  { id: "fl-3", name: "Enhanced KYC UI", key: "feat.kyc_ui_v2", state: "Enabled", rollout: "50%", target: "New KYC submissions", created: "Jul 15", owner: "Product", description: "Improved KYC document upload flow", strategy: "User segment" },
  { id: "fl-4", name: "Savings Goals", key: "feat.savings_goals", state: "Enabled", rollout: "100%", target: "All users", created: "Jun 2026", owner: "Product", description: "Target-based savings feature", strategy: "Full rollout" },
  { id: "fl-5", name: "Business Payroll", key: "feat.payroll", state: "Enabled", rollout: "100%", target: "Business accounts", created: "May 2026", owner: "Product", description: "Payroll processing for SMEs", strategy: "Full rollout" },
  { id: "fl-6", name: "Push Notification v2", key: "feat.push_v2", state: "Beta", rollout: "5%", target: "Random users", created: "Aug 20", owner: "Engineering", description: "Rich push notifications with actions", strategy: "Whitelist" },
  { id: "fl-7", name: "Cardless ATM", key: "feat.cardless_atm", state: "Disabled", rollout: "0%", target: "—", created: "Aug 10", owner: "Product", description: "ATM withdrawal without card", strategy: "Pending QA" },
  { id: "fl-8", name: "BNPL (PayLater)", key: "feat.bnpl", state: "Disabled", rollout: "0%", target: "—", created: "Jul 2026", owner: "Product", description: "Buy now pay later integration", strategy: "Pending compliance" },
  { id: "fl-9", name: "Smart savings nudges", key: "feat.savings_nudges", state: "Enabled", rollout: "35%", target: "Active savers", created: "Aug 18", owner: "Growth", description: "AI-powered savings suggestions", strategy: "User segment" },
  { id: "fl-10", name: "Business invoices v2", key: "feat.invoices_v2", state: "Beta", rollout: "15%", target: "SME accounts", created: "Aug 12", owner: "Product", description: "Recurring invoice automation", strategy: "Gradual percentage" },
];

export const initialTests: AbTestRecord[] = [
  { id: "ab-1", name: "New Onboarding", flag: "feat.new_onboarding", variantA: "Old flow (80%)", variantB: "New flow (20%)", metric: "Completion rate", sample: "29,600 users", duration: "30 days", result: "Running" },
  { id: "ab-2", name: "Fraud Model v3.3", flag: "feat.fraud_v33", variantA: "v3.2 (90%)", variantB: "v3.3 (10%)", metric: "False positive rate", sample: "14.8M TXNs", duration: "14 days", result: "Running" },
  { id: "ab-3", name: "Push v2", flag: "feat.push_v2", variantA: "Old push (95%)", variantB: "New push (5%)", metric: "Open rate", sample: "7,400 users", duration: "7 days", result: "Running" },
  { id: "ab-4", name: "KYC UI v2", flag: "feat.kyc_ui_v2", variantA: "Old UI (50%)", variantB: "New UI (50%)", metric: "Completion rate, time", sample: "1,794 users", duration: "45 days", result: "B won (+12%)" },
];

export const initialMetrics: MetricRecord[] = [
  { id: "m-1", flag: "New Onboarding", metric: "Completion rate", control: "68%", variant: "74%", delta: "+6pp", significance: "p<0.01" },
  { id: "m-2", flag: "New Onboarding", metric: "Time to complete", control: "8.3 min", variant: "6.1 min", delta: "−2.2 min", significance: "p<0.01" },
  { id: "m-3", flag: "Fraud v3.3", metric: "False positive rate", control: "34%", variant: "28%", delta: "−6pp", significance: "p<0.05" },
  { id: "m-4", flag: "Fraud v3.3", metric: "Fraud catch rate", control: "94%", variant: "96%", delta: "+2pp", significance: "p<0.10" },
  { id: "m-5", flag: "Push v2", metric: "Open rate", control: "12%", variant: "18%", delta: "+6pp", significance: "p<0.01" },
  { id: "m-6", flag: "Push v2", metric: "Click rate", control: "3.2%", variant: "5.1%", delta: "+1.9pp", significance: "p<0.01" },
];

export const initialAudit: AuditRecord[] = [
  { id: "a-1", date: "Aug 22", admin: "Product Lead", flag: "feat.push_v2", change: "Rollout 0% → 5%", reason: "A/B test start" },
  { id: "a-2", date: "Aug 20", admin: "Product Lead", flag: "feat.cardless_atm", change: "Created (disabled)", reason: "Pending QA" },
  { id: "a-3", date: "Aug 15", admin: "ML Lead", flag: "feat.fraud_v33", change: "Rollout 0% → 10%", reason: "Model v3.3 deployed" },
  { id: "a-4", date: "Aug 1", admin: "Product Lead", flag: "feat.new_onboarding", change: "Rollout 0% → 20%", reason: "A/B test start" },
  { id: "a-5", date: "Jul 15", admin: "Product Lead", flag: "feat.kyc_ui_v2", change: "Rollout 0% → 50%", reason: "Positive initial results" },
];

export const initialArchived: ArchivedRecord[] = [
  { id: "ar-1", flag: "feat.savings_goals", period: "Jun–Jul 2026", rollout: "10% → 25% → 50% → 100%", outcome: "Success — shipped", date: "Jul 15, 2026" },
  { id: "ar-2", flag: "feat.business_payroll", period: "Apr–May 2026", rollout: "5% → 25% → 100%", outcome: "Success — shipped", date: "May 30, 2026" },
  { id: "ar-3", flag: "feat.old_kyc_flow", period: "Jan–Jun 2026", rollout: "100% → 50% → 0%", outcome: "Replaced by v2", date: "Jul 15, 2026" },
  { id: "ar-4", flag: "feat.chat_support_v1", period: "Feb–Mar 2026", rollout: "20% → 0%", outcome: "Cancelled — low usage", date: "Mar 30, 2026" },
];

export const initialScheduler: SchedulerRecord[] = [
  { id: "sc-1", flag: "New Onboarding", current: "20%", schedule: "+20% every 3 days", criteria: "No regression in any metric", owner: "Product", nextAdvance: "2d" },
  { id: "sc-2", flag: "Fraud v3.3", current: "10%", schedule: "+10% every 7 days", criteria: "False positives <30%, catch rate >95%", owner: "ML Team", nextAdvance: "5d" },
  { id: "sc-3", flag: "Push v2", current: "5%", schedule: "+10% every 3 days", criteria: "Open rate >15%, no delivery issues", owner: "Engineering", nextAdvance: "1d" },
];
