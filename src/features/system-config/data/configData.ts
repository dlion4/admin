export interface GeneralSetting {
  id: string;
  setting: string;
  value: string;
  editableBy: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
}

export interface NotificationChannel {
  id: string;
  channel: string;
  status: string;
  provider: string;
  config: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
}

export interface RateLimit {
  id: string;
  endpoint: string;
  limit: string;
  window: string;
  appliesTo: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
}

export interface FeatureToggle {
  id: string;
  feature: string;
  state: string;
  rollout: string;
  description: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
}

export interface ChangeRecord {
  id: string;
  date: string;
  admin: string;
  setting: string;
  oldValue: string;
  newValue: string;
  reason: string;
}

export interface BrandSetting {
  id: string;
  name: string;
  value: string;
  icon: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
}

export interface MaintenanceWindow {
  id: string;
  day: string;
  time: string;
  message: string;
  notification: string;
  killSessions: string;
  adminAccess: string;
  emergency: string;
  locked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  lockReason?: string;
}

export const initialGeneral: GeneralSetting[] = [
  { id: "gs-1", setting: "Platform name", value: "PayMo", editableBy: "Super admin" },
  { id: "gs-2", setting: "Legal entity name", value: "PayMo Digital Bank Ltd", editableBy: "Company registry" },
  { id: "gs-3", setting: "Country of operation", value: "Kenya", editableBy: "Regulatory" },
  { id: "gs-4", setting: "Base currency", value: "KES", editableBy: "Regulatory" },
  { id: "gs-5", setting: "Timezone", value: "Africa/Nairobi (EAT, UTC+3)", editableBy: "Super admin" },
  { id: "gs-6", setting: "Date format", value: "DD/MM/YYYY", editableBy: "None" },
  { id: "gs-7", setting: "Number format", value: "1,234.56", editableBy: "None" },
  { id: "gs-8", setting: "Admin language", value: "English", editableBy: "None" },
  { id: "gs-9", setting: "User app language", value: "English + Swahili", editableBy: "None" },
];

export const initialNotifications: NotificationChannel[] = [
  { id: "nc-1", channel: "Push (iOS)", status: "Enabled", provider: "APNs", config: "Certificate uploaded" },
  { id: "nc-2", channel: "Push (Android)", status: "Enabled", provider: "FCM", config: "Server key configured" },
  { id: "nc-3", channel: "SMS", status: "Enabled", provider: "Africa's Talking", config: "API key, sender name" },
  { id: "nc-4", channel: "Email", status: "Enabled", provider: "SendGrid", config: "API key, templates" },
  { id: "nc-5", channel: "In-app", status: "Enabled", provider: "Built-in", config: "—" },
  { id: "nc-6", channel: "Webhook", status: "Enabled", provider: "Custom", config: "Per-partner configuration" },
];

export const initialRates: RateLimit[] = [
  { id: "rl-1", endpoint: "Login attempts", limit: "5 per IP", window: "15 min", appliesTo: "All" },
  { id: "rl-2", endpoint: "Transaction submission", limit: "10 per user", window: "1 min", appliesTo: "All" },
  { id: "rl-3", endpoint: "API requests (general)", limit: "1000 per key", window: "1 min", appliesTo: "API users" },
  { id: "rl-4", endpoint: "API requests (search)", limit: "100 per key", window: "1 min", appliesTo: "API users" },
  { id: "rl-5", endpoint: "Password reset", limit: "3 per email", window: "1 hour", appliesTo: "All" },
  { id: "rl-6", endpoint: "KYC submission", limit: "5 per user", window: "1 hour", appliesTo: "All" },
  { id: "rl-7", endpoint: "Admin login", limit: "3 per IP", window: "15 min", appliesTo: "Admins" },
  { id: "rl-8", endpoint: "Export requests", limit: "3 per admin", window: "1 hour", appliesTo: "Admins" },
];

export const initialFeatures: FeatureToggle[] = [
  { id: "ft-1", feature: "Savings pockets", state: "Enabled", rollout: "100%", description: "Multiple savings goals" },
  { id: "ft-2", feature: "Virtual cards", state: "Enabled", rollout: "100%", description: "Instant virtual card issuance" },
  { id: "ft-3", feature: "Business accounts", state: "Enabled", rollout: "100%", description: "Multi-user business accounts" },
  { id: "ft-4", feature: "International transfers", state: "Enabled", rollout: "100%", description: "FX + cross-border" },
  { id: "ft-5", feature: "New onboarding flow", state: "Beta", rollout: "20%", description: "A/B test — new UX" },
  { id: "ft-6", feature: "AI fraud detection v3.3", state: "Beta", rollout: "10%", description: "New ML model" },
  { id: "ft-7", feature: "PayLater (BNPL)", state: "Disabled", rollout: "0%", description: "Pending launch" },
  { id: "ft-8", feature: "Crypto wallet", state: "Disabled", rollout: "0%", description: "In development" },
];

export const initialHistory: ChangeRecord[] = [
  { id: "ch-1", date: "Aug 22", admin: "Joseph M.", setting: "Maintenance window", oldValue: "Sat 2AM", newValue: "Sun 2AM", reason: "Lower traffic day" },
  { id: "ch-2", date: "Aug 20", admin: "Ops Manager", setting: "Push provider", oldValue: "Firebase", newValue: "FCM", reason: "Better delivery" },
  { id: "ch-3", date: "Aug 15", admin: "Joseph M.", setting: "Primary color", oldValue: "#2E7D32", newValue: "#1B5E20", reason: "Brand refresh" },
  { id: "ch-4", date: "Aug 10", admin: "Security Lead", setting: "TLS min version", oldValue: "1.2", newValue: "1.3", reason: "Security hardening" },
];

export const initialBrand: BrandSetting[] = [
  { id: "br-1", name: "Primary color", value: "#1B5E20", icon: "bi-circle-fill" },
  { id: "br-2", name: "Secondary color", value: "#FFD600", icon: "bi-circle-fill" },
  { id: "br-3", name: "Logo (full)", value: "paymo-logo-full.svg", icon: "bi-image" },
  { id: "br-4", name: "Logo (icon)", value: "paymo-icon.svg", icon: "bi-image" },
  { id: "br-5", name: "Favicon", value: "paymo-favicon.ico", icon: "bi-app" },
  { id: "br-6", name: "SMS sender", value: "PayMo", icon: "bi-chat-text" },
  { id: "br-7", name: "White-label", value: "Disabled", icon: "bi-toggle-off" },
];

export const initialMaintenance: MaintenanceWindow[] = [
  { id: "mw-1", day: "Sunday", time: "2:00–4:00 AM EAT", message: "We're performing scheduled upgrades. We'll be back shortly.", notification: "Push + SMS · 1 hour before", killSessions: "Yes", adminAccess: "Yes", emergency: "Armed · requires 2FA" },
];
