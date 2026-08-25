import { useState } from "react";
import { useToast, Badge, Steps } from "../../../components/ui";
import { kes, num } from "../../../lib/format";
import {
  CompanyProfileDrawer, FounderDetailModal, ShareTransferWizard, ExpenseApprovalWizard,
  VendorPaymentModal, BudgetAllocationModal, PnLStatementModal, CashFlowForecastModal,
  VestingScheduleModal, CapTableModal, TreasuryAccountModal, DividendModal,
  ComplianceStatusModal, ESOPManagementModal, BoardResolutionModal, ShareValuationModal,
  TaxFilingModal, ShareholderAgreementModal, DepartmentBudgetModal, ExpenseReportModal,
  VendorDirectoryModal, LiquidityReserveModal, StrategicInvestmentModal, GovernanceModal,
  KycExpiryModal, ShareBuybackModal, RelatedPartyModal, StrategicPlanModal,
  IpTrademarksModal, InsuranceModal, ScenarioModelingModal, AnnualReportModal,
  EmergencyFundModal, MarketAnalysisModal, ShareholderCommModal, FundraisingPipelineModal,
  CorporateActionsModal,
} from "../modals/PayMoLTDModals";
import {
  AddRecordModal, EditRecordModal, DeleteConfirmModal, LockUnlockModal,
  DocumentUploadWizard, DocumentRepositoryDrawer, PartnershipViewerDrawer,
  ContractManagerDrawer, ESigWorkflowModal, ComplianceAuditModal,
  AdminActivityLogModal, DataExportImportModal, ShareholderInviteModal,
  CorporateSealModal, PowerOfAttorneyModal, EmergencyActionsModal,
  AdminPermissionsDrawer,
} from "../modals/AdminControlModals";

/* ---- Admin controls bar (matches reference page styling) ---- */
function AdminControls({ onEdit, onDelete, onLock, locked }: {
  onEdit: () => void; onDelete: () => void; onLock: () => void; locked?: boolean;
}) {
  return (
    <div className="d-flex align-items-center gap-1 mt-2 pt-2" style={{ borderTop: "1px dashed var(--pm-border)" }}>
      <span className="pm-eyebrow me-auto mb-0" style={{ fontSize: ".6rem" }}>
        <i className="bi bi-shield-lock me-1" style={{ color: "var(--pm-green)" }} />Super Admin
      </span>
      {locked && <Badge tone="amber" dot>Locked</Badge>}
      <button className="btn btn-sm btn-outline-primary" style={{ fontSize: ".66rem" }} onClick={onEdit}>
        <i className="bi bi-pencil-square me-1" />Edit
      </button>
      <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: ".66rem" }} onClick={onLock}>
        <i className={`bi ${locked ? "bi-unlock" : "bi-lock"} me-1`} />{locked ? "Unlock" : "Lock"}
      </button>
      <button className="btn btn-sm btn-outline-danger" style={{ fontSize: ".66rem" }} onClick={onDelete}>
        <i className="bi bi-trash3 me-1" />Delete
      </button>
    </div>
  );
}

const TABS = [
  { id: "profile", label: "Company Profile", icon: "bi-building" },
  { id: "treasury", label: "Treasury", icon: "bi-wallet2" },
  { id: "pnl", label: "P&L Statement", icon: "bi-graph-up-arrow" },
  { id: "captable", label: "Cap Table & Equity", icon: "bi-grid-3x3" },
  { id: "budget", label: "Budget & Forecast", icon: "bi-clipboard-data" },
  { id: "compliance", label: "Compliance & Legal", icon: "bi-shield-check" },
  { id: "strategic", label: "Strategic & Governance", icon: "bi-bullseye" },
  { id: "documents", label: "Documents & Agreements", icon: "bi-folder2-open" },
];

const initialFounders = [
  { id: "f1", name: "Joseph Mwangi", role: "Founder & CEO", icon: "👨‍💼", color: "var(--bs-primary)", shares: 5000000, ownership: 50, invested: 50000000, currentValue: 1235000000, moic: 24.7, vestingStatus: "50% Vested", locked: false, vestingSchedule: [{ period: "Year 1 (Jan 2024 – Jan 2025)", shares: "1,250,000", status: "Vested" }, { period: "Year 2 (Jan 2025 – Jan 2026)", shares: "1,250,000", status: "Vested" }, { period: "Year 3 (Jan 2026 – Jan 2027)", shares: "1,250,000", status: "Cliff" }, { period: "Year 4 (Jan 2027 – Jan 2028)", shares: "1,250,000", status: "Unvested" }], permissions: ["Full system access", "Board chairperson", "Veto rights", "Emergency fund access", "CBK liaison", "Cap table management"] },
  { id: "f2", name: "Sarah Kimani", role: "Co-Founder & CTO", icon: "👩‍💻", color: "var(--bs-purple)", shares: 1500000, ownership: 15, invested: 15000000, currentValue: 370500000, moic: 24.7, vestingStatus: "50% Vested", locked: false, vestingSchedule: [], permissions: ["Engineering access", "Infrastructure", "Security", "API control"] },
  { id: "f3", name: "VC Fund A", role: "Series A Investor", icon: "🏛️", color: "var(--bs-success)", shares: 2000000, ownership: 20, invested: 200000000, currentValue: 494000000, moic: 2.5, vestingStatus: "Fully Vested", locked: false, vestingSchedule: [], permissions: ["Board seat", "Financial access", "Veto on dilution", "Tag-along rights"] },
  { id: "f4", name: "Angel Investor B", role: "Angel Investor", icon: "👼", color: "var(--bs-info)", shares: 1000000, ownership: 10, invested: 30000000, currentValue: 247000000, moic: 8.2, vestingStatus: "Fully Vested", locked: false, vestingSchedule: [], permissions: ["Financial access", "Tag-along rights", "ROFR"] },
  { id: "f5", name: "VC Fund C", role: "Series B Investor", icon: "🏦", color: "var(--bs-warning)", shares: 1500000, ownership: 15, invested: 450000000, currentValue: 370500000, moic: 0.82, vestingStatus: "N/A (Preferred)", locked: false, vestingSchedule: [], permissions: ["Board seat", "Full financial access", "Liquidation preference", "Anti-dilution"] },
];

const initialBanks = [
  { id: "b1", bank: "KCB Bank", acc: "****7890", name: "Operating Account", balance: 450000000, currency: "KES", status: "Active", locked: false },
  { id: "b2", bank: "Equity Bank", acc: "****3210", name: "Settlement Account", balance: 234000000, currency: "KES", status: "Active", locked: false },
  { id: "b3", bank: "Standard Chartered", acc: "SC-****789", name: "International Account", balance: 1200000, currency: "USD", status: "Active", locked: false },
  { id: "b4", bank: "NCBA Bank", acc: "NC-****456", name: "Reserve Account", balance: 189000000, currency: "KES", status: "Active", locked: false },
  { id: "b5", bank: "Safaricom M-Pesa", acc: "PAYMO-001", name: "M-Pesa Business", balance: 56000000, currency: "KES", status: "Active", locked: false },
];

const initialDocuments = [
  { id: "d1", name: "CBK PSP License", category: "Compliance", classification: "Restricted", locked: false, uploadedAt: "Jan 2024" },
  { id: "d2", name: "Articles of Association", category: "Board Resolution", classification: "Confidential", locked: true, uploadedAt: "Jan 2024" },
  { id: "d3", name: "Shareholders Agreement v2.1", category: "Shareholder Agreement", classification: "Confidential", locked: true, uploadedAt: "Mar 2024" },
  { id: "d4", name: "M-Pesa API Agreement", category: "Contract", classification: "Confidential", locked: false, uploadedAt: "Mar 2024" },
  { id: "d5", name: "Board Resolution BR-2026-046", category: "Board Resolution", classification: "Internal", locked: false, uploadedAt: "Aug 2026" },
  { id: "d6", name: "Q2 2026 Financial Statements", category: "Financial", classification: "Restricted", locked: true, uploadedAt: "Aug 2026" },
  { id: "d7", name: "Comprehensive Insurance Policy", category: "Insurance", classification: "Confidential", locked: false, uploadedAt: "Jan 2024" },
  { id: "d8", name: "Data Protection Policy", category: "Compliance", classification: "Internal", locked: false, uploadedAt: "Jun 2024" },
  { id: "d9", name: "AWS Cloud Services SLA", category: "Contract", classification: "Confidential", locked: false, uploadedAt: "Jan 2024" },
  { id: "d10", name: "Partnership Agreement — Equity Bank", category: "Shareholder Agreement", classification: "Confidential", locked: true, uploadedAt: "Sep 2024" },
];

const initialVendors = [
  { id: "v1", name: "Safaricom PLC", type: "M-Pesa Integration", monthly: 10300000, locked: false },
  { id: "v2", name: "AWS Kenya", type: "Cloud Infrastructure", monthly: 5000000, locked: false },
  { id: "v3", name: "Onfido Ltd", type: "KYC/AML Provider", monthly: 1500000, locked: false },
  { id: "v4", name: "Visa Kenya", type: "Card Processing", monthly: 5600000, locked: false },
  { id: "v5", name: "Deloitte Kenya", type: "Audit Services", monthly: 710000, locked: false },
];

const initialBoardResolutions = [
  { id: "br1", number: "BR-2026-046", subject: "Approval of Q3 budget reallocation", date: "Aug 22, 2026", status: "Approved", votes: "5-0-1", locked: false },
  { id: "br2", number: "BR-2026-045", subject: "Authorization of Series C fundraising", date: "Aug 10, 2026", status: "Approved", votes: "5-0-0", locked: false },
  { id: "br3", number: "BR-2026-044", subject: "Appointment of external auditor", date: "Jul 28, 2026", status: "Approved", votes: "4-0-1", locked: false },
];

const initialBudgets = [
  { id: "bu1", dept: "Engineering", budget: 180000000, spent: 105000000, owner: "Sarah Kimani", locked: false },
  { id: "bu2", dept: "Operations", budget: 72000000, spent: 48000000, owner: "James Ochieng", locked: false },
  { id: "bu3", dept: "Marketing", budget: 48000000, spent: 32000000, owner: "Marketing Lead", locked: false },
  { id: "bu4", dept: "Compliance", budget: 36000000, spent: 18000000, owner: "Compliance Officer", locked: false },
  { id: "bu5", dept: "HR", budget: 24000000, spent: 14000000, owner: "HR Director", locked: false },
  { id: "bu6", dept: "Legal", budget: 18000000, spent: 7000000, owner: "Legal Counsel", locked: false },
];

let _nextId = 100;
const genId = (prefix: string) => `${prefix}_${_nextId++}`;

export function PayMoLTDPage({ signal, onNavigate }: { signal: { action: string; n: number }; onNavigate: (id: string) => void }) {
  const toast = useToast();
  const [tab, setTab] = useState("profile");

  /* ---- Dynamic state ---- */
  const [founders, setFounders] = useState(initialFounders);
  const [banks, setBanks] = useState(initialBanks);
  const [documents, setDocuments] = useState(initialDocuments);
  const [vendors, setVendors] = useState(initialVendors);
  const [resolutions, setResolutions] = useState(initialBoardResolutions);
  const [budgets, setBudgets] = useState(initialBudgets);

  /* ---- Modal states ---- */
  const [companyProfileOpen, setCompanyProfileOpen] = useState(false);
  const [founderModal, setFounderModal] = useState<any>(null);
  const [vestingModal, setVestingModal] = useState<any>(null);
  const [shareTransferOpen, setShareTransferOpen] = useState(false);
  const [expenseWizardOpen, setExpenseWizardOpen] = useState(false);
  const [vendorPaymentOpen, setVendorPaymentOpen] = useState(false);
  const [budgetAllocOpen, setBudgetAllocOpen] = useState(false);
  const [pnlOpen, setPnlOpen] = useState(false);
  const [cashFlowOpen, setCashFlowOpen] = useState(false);
  const [capTableOpen, setCapTableOpen] = useState(false);
  const [treasuryOpen, setTreasuryOpen] = useState(false);
  const [dividendOpen, setDividendOpen] = useState(false);
  const [complianceOpen, setComplianceOpen] = useState(false);
  const [esopOpen, setEsopOpen] = useState(false);
  const [boardResOpen, setBoardResOpen] = useState(false);
  const [valuationOpen, setValuationOpen] = useState(false);
  const [taxOpen, setTaxOpen] = useState(false);
  const [shareholderAgreementOpen, setShareholderAgreementOpen] = useState(false);
  const [deptBudgetOpen, setDeptBudgetOpen] = useState(false);
  const [expenseReportOpen, setExpenseReportOpen] = useState(false);
  const [vendorDirOpen, setVendorDirOpen] = useState(false);
  const [liquidityOpen, setLiquidityOpen] = useState(false);
  const [strategicInvestOpen, setStrategicInvestOpen] = useState(false);
  const [governanceOpen, setGovernanceOpen] = useState(false);
  const [kycExpiryOpen, setKycExpiryOpen] = useState(false);
  const [buybackOpen, setBuybackOpen] = useState(false);
  const [relatedPartyOpen, setRelatedPartyOpen] = useState(false);
  const [strategicPlanOpen, setStrategicPlanOpen] = useState(false);
  const [ipOpen, setIpOpen] = useState(false);
  const [insuranceOpen, setInsuranceOpen] = useState(false);
  const [scenarioOpen, setScenarioOpen] = useState(false);
  const [annualReportOpen, setAnnualReportOpen] = useState(false);
  const [emergencyFundOpen, setEmergencyFundOpen] = useState(false);
  const [marketAnalysisOpen, setMarketAnalysisOpen] = useState(false);
  const [shareholderCommOpen, setShareholderCommOpen] = useState(false);
  const [fundraisingOpen, setFundraisingOpen] = useState(false);
  const [corporateActionsOpen, setCorporateActionsOpen] = useState(false);

  /* ---- Admin modal states ---- */
  const [addRecordOpen, setAddRecordOpen] = useState(false);
  const [addRecordType, setAddRecordType] = useState("founder");
  const [editRecord, setEditRecord] = useState<any>(null);
  const [deleteRecord, setDeleteRecord] = useState<any>(null);
  const [lockRecord, setLockRecord] = useState<any>(null);
  const [docUploadOpen, setDocUploadOpen] = useState(false);
  const [docRepoOpen, setDocRepoOpen] = useState(false);
  const [partnershipsOpen, setPartnershipsOpen] = useState(false);
  const [contractsOpen, setContractsOpen] = useState(false);
  const [esigOpen, setEsigOpen] = useState(false);
  const [auditTrailOpen, setAuditTrailOpen] = useState(false);
  const [activityLogOpen, setActivityLogOpen] = useState(false);
  const [exportImportOpen, setExportImportOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [sealOpen, setSealOpen] = useState(false);
  const [poaOpen, setPoaOpen] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [permissionsOpen, setPermissionsOpen] = useState(false);

  const openAdd = (type: string) => { setAddRecordType(type); setAddRecordOpen(true); };
  const openEdit = (record: any) => setEditRecord(record);
  const openDelete = (record: any) => setDeleteRecord(record);
  const openLock = (record: any) => setLockRecord(record);

  const handleAddRecord = (data: any) => {
    if (addRecordType === "founder") {
      setFounders(prev => [...prev, { ...data, id: genId("f"), icon: "👤", color: "var(--bs-primary)", shares: Number(data.Shares) || 0, ownership: Number(data["Ownership %"]) || 0, invested: Number(data["Amount Invested (KES)"]) || 0, currentValue: 0, moic: 0, vestingStatus: "Unvested", locked: false, vestingSchedule: [], permissions: [] }]);
    } else if (addRecordType === "bank_account") {
      setBanks(prev => [...prev, { id: genId("b"), bank: data["Bank Name"] || "New Bank", acc: data["Account Number"] || "****0000", name: data["Account Name"] || "Account", balance: Number(data["Opening Balance (KES)"]) || 0, currency: data["Currency"] || "KES", status: "Active", locked: false }]);
    } else if (addRecordType === "vendor") {
      setVendors(prev => [...prev, { id: genId("v"), name: data["Vendor Name"] || "New Vendor", type: data["Service Type"] || "General", monthly: Number(data["Monthly Contract (KES)"]) || 0, locked: false }]);
    } else if (addRecordType === "document") {
      setDocuments(prev => [...prev, { id: genId("d"), name: data["Document Name"] || "New Document", category: data["Category"] || "Other", classification: "Internal", locked: false, uploadedAt: "Just now" }]);
    } else if (addRecordType === "board_resolution") {
      setResolutions(prev => [...prev, { id: genId("br"), number: data["Resolution Number"] || "BR-2026-NEW", subject: data["Resolution Subject"] || "New resolution", date: data["Date"] || "Today", status: "Pending", votes: "—", locked: false }]);
    } else if (addRecordType === "budget") {
      setBudgets(prev => [...prev, { id: genId("bu"), dept: data["Department"] || "New Dept", budget: Number(data["Annual Budget (KES)"]) || 0, spent: 0, owner: data["Budget Owner"] || "TBD", locked: false }]);
    }
  };

  const handleEditSave = (data: any) => { toast({ kind: "success", title: "Record updated", body: "Changes saved" }); setEditRecord(null); };
  const handleDelete = () => {
    if (deleteRecord) {
      if (deleteRecord.shares !== undefined) setFounders(prev => prev.filter(f => f !== deleteRecord));
      else if (deleteRecord.bank) setBanks(prev => prev.filter(b => b !== deleteRecord));
      else if (deleteRecord.monthly !== undefined) setVendors(prev => prev.filter(v => v !== deleteRecord));
      else if (deleteRecord.category) setDocuments(prev => prev.filter(d => d !== deleteRecord));
      else if (deleteRecord.number) setResolutions(prev => prev.filter(r => r !== deleteRecord));
      else if (deleteRecord.dept) setBudgets(prev => prev.filter(b => b !== deleteRecord));
    }
    setDeleteRecord(null);
  };
  const handleLockToggle = (locked: boolean) => {
    if (lockRecord) {
      if (lockRecord.shares !== undefined) setFounders(prev => prev.map(f => f === lockRecord ? { ...f, locked } : f));
      else if (lockRecord.bank) setBanks(prev => prev.map(b => b === lockRecord ? { ...b, locked } : b));
      else if (lockRecord.monthly !== undefined) setVendors(prev => prev.map(v => v === lockRecord ? { ...v, locked } : v));
      else if (lockRecord.category) setDocuments(prev => prev.map(d => d === lockRecord ? { ...d, locked } : d));
      else if (lockRecord.number) setResolutions(prev => prev.map(r => r === lockRecord ? { ...r, locked } : r));
      else if (lockRecord.dept) setBudgets(prev => prev.map(b => b === lockRecord ? { ...b, locked } : b));
    }
    setLockRecord(null);
  };

  return (
    <div className="pm-page-content" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", overflow: "hidden" }}>

      {/* ================= Header ================= */}
      <div className="pm-card pm-card-pad">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <div className="d-flex align-items-center gap-3">
            <div style={{ width: 44, height: 44, borderRadius: 12, display: "grid", placeItems: "center", background: "linear-gradient(135deg, var(--pm-green), #0b8f52)", color: "#fff", fontWeight: 900, fontSize: "1.2rem", boxShadow: "0 8px 20px -8px var(--pm-green)", flex: "none" }}>P</div>
            <div>
              <div style={{ fontFamily: "Sora", fontWeight: 700, fontSize: "1.05rem" }}>PayMo Digital Bank Ltd</div>
              <div className="pm-td-sub">Company Profile & Corporate Administration</div>
            </div>
          </div>
          <div className="ms-auto d-flex gap-2 flex-wrap">
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setAuditTrailOpen(true)}><i className="bi bi-clock-history me-1" />Audit Trail</button>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setPermissionsOpen(true)}><i className="bi bi-shield-lock me-1" />Permissions</button>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setExportImportOpen(true)}><i className="bi bi-arrow-left-right me-1" />Export/Import</button>
            <button className="btn btn-sm btn-outline-danger" onClick={() => setEmergencyOpen(true)}><i className="bi bi-exclamation-triangle me-1" />Emergency</button>
            <button className="btn btn-sm btn-outline-primary" onClick={() => setCompanyProfileOpen(true)}><i className="bi bi-building me-1" />Company Profile</button>
            <button className="btn btn-sm btn-primary" onClick={() => setShareholderCommOpen(true)}><i className="bi bi-envelope me-1" />Shareholder Update</button>
          </div>
        </div>
      </div>

      {/* ================= Key Metrics Strip ================= */}
      <div className="row g-2">
        {[
          { label: "Valuation", value: "KES 2.47B", trend: "↑ 78%" },
          { label: "Total Shares", value: "10,000,000", trend: "Fixed" },
          { label: "Cash Position", value: "KES 929M", trend: "↑ 12%" },
          { label: "Revenue (Q2)", value: "KES 558M", trend: "↑ 24%" },
          { label: "Net Income (Q2)", value: "KES 103M", trend: "↑ 63%" },
          { label: "Runway", value: "18 months", trend: "↑ 4mo" },
        ].map(m => (
          <div key={m.label} className="col-6 col-md-4 col-lg-2">
            <div className="pm-stat">
              <div className="pm-stat-label">{m.label}</div>
              <div className="pm-stat-value">{m.value}</div>
              <div className="pm-trend-up">{m.trend}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= Tabs ================= */}
      <div className="pm-card">
        <div className="pm-tabs overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} className={`pm-tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              <i className={`bi ${t.icon}`} /> {t.label}
            </button>
          ))}
        </div>

        <div className="pm-card-pad">

          {/* ================= TAB: Company Profile ================= */}
          {tab === "profile" && <div className="d-flex flex-column gap-4">
            <div className="row g-2">
              {[
                { label: "Founders", value: String(founders.length), action: () => setCapTableOpen(true), icon: "bi-people" },
                { label: "Equity Value", value: "KES 2.47B", action: () => setValuationOpen(true), icon: "bi-gem" },
                { label: "Board Members", value: "5", action: () => setGovernanceOpen(true), icon: "bi-bank" },
                { label: "Documents", value: String(documents.length), action: () => setDocRepoOpen(true), icon: "bi-folder2-open" },
              ].map(c => (
                <div key={c.label} className="col-6 col-lg-3">
                  <button className="pm-health w-100 text-start" onClick={c.action}>
                    <div className="pm-eyebrow mb-1"><i className={`bi ${c.icon} me-1`} />{c.label}</div>
                    <div className="pm-stat-value">{c.value}</div>
                  </button>
                </div>
              ))}
            </div>

            <div className="d-flex justify-content-between align-items-end mb-2">
              <div>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>Founders & Key Stakeholders</h2>
                <div className="pm-td-sub">{founders.length} stakeholders · {founders.filter(f => f.locked).length} locked</div>
              </div>
              <button className="btn btn-sm btn-primary" onClick={() => openAdd("founder")}><i className="bi bi-plus-lg me-1" />Add Founder</button>
            </div>
            <div className="row g-3">
              {founders.map(f => (
                <div key={f.id} className="col-md-6 col-xl-4">
                  <div className="pm-card pm-card-pad">
                    <div className="d-flex align-items-center gap-3 cursor-pointer" onClick={() => setFounderModal(f)}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, display: "grid", placeItems: "center", background: `color-mix(in srgb, ${f.color} 18%, transparent)`, border: `1px solid color-mix(in srgb, ${f.color} 38%, transparent)`, fontSize: "1rem", flex: "none" }}>{f.icon}</div>
                      <div className="flex-grow-1">
                        <div className="pm-td-strong">{f.name}</div>
                        <div className="pm-td-sub">{f.role}</div>
                      </div>
                      <Badge tone={f.color}>{f.ownership}%</Badge>
                    </div>
                    <div className="mt-2">
                      <div className="pm-kv"><span className="k">Shares</span><span className="v mono">{num(f.shares)}</span></div>
                      <div className="pm-kv"><span className="k">Value</span><span className="v">{kes(f.currentValue)}</span></div>
                      <div className="pm-kv"><span className="k">Invested</span><span className="v">{kes(f.invested)}</span></div>
                      <div className="pm-kv"><span className="k">MOIC</span><span className="v">{f.moic}x</span></div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mt-2">
                      <Badge tone={f.vestingStatus.includes("Vested") ? "green" : "amber"}>{f.vestingStatus}</Badge>
                      {f.locked && <Badge tone="amber" dot>Locked</Badge>}
                    </div>
                    <AdminControls onEdit={() => openEdit(f)} onDelete={() => openDelete(f)} onLock={() => openLock(f)} locked={f.locked} />
                  </div>
                </div>
              ))}
            </div>

            <div className="pm-eyebrow mb-2">Quick Actions</div>
            <div className="row g-2">
              {[
                { label: "Share Transfer", icon: "bi-arrow-left-right", action: () => setShareTransferOpen(true) },
                { label: "Board Resolution", icon: "bi-journal-text", action: () => setBoardResOpen(true) },
                { label: "Shareholder Agreement", icon: "bi-file-earmark-text", action: () => setShareholderAgreementOpen(true) },
                { label: "IP & Trademarks", icon: "bi-award", action: () => setIpOpen(true) },
                { label: "Insurance", icon: "bi-shield-check", action: () => setInsuranceOpen(true) },
                { label: "Annual Report", icon: "bi-file-earmark-pdf", action: () => setAnnualReportOpen(true) },
                { label: "E-Signature", icon: "bi-pen", action: () => setEsigOpen(true) },
                { label: "Corporate Seal", icon: "bi-stamp", action: () => setSealOpen(true) },
                { label: "Power of Attorney", icon: "bi-person-gear", action: () => setPoaOpen(true) },
                { label: "Invite Investor", icon: "bi-person-plus", action: () => setInviteOpen(true) },
              ].map(a => (
                <div key={a.label} className="col-6 col-md-4 col-lg-3">
                  <button className="pm-qa" onClick={a.action}>
                    <i className={`bi ${a.icon}`} style={{ fontSize: "1.15rem" }} />
                    <span className="t">{a.label}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>}

          {/* ================= TAB: Treasury ================= */}
          {tab === "treasury" && <div className="d-flex flex-column gap-4">
            <div className="row g-2">
              {[
                { label: "Total Cash", value: "KES 929M", action: () => setTreasuryOpen(true), icon: "bi-cash-stack" },
                { label: "USD Holdings", value: "$1.2M", action: () => setTreasuryOpen(true), icon: "bi-currency-dollar" },
                { label: "Emergency Fund", value: "KES 100M", action: () => setEmergencyFundOpen(true), icon: "bi-exclamation-triangle" },
                { label: "Liquidity Ratio", value: "289%", action: () => setLiquidityOpen(true), icon: "bi-droplet" },
              ].map(c => (
                <div key={c.label} className="col-6 col-lg-3">
                  <button className="pm-health w-100 text-start" onClick={c.action}>
                    <div className="pm-eyebrow mb-1"><i className={`bi ${c.icon} me-1`} />{c.label}</div>
                    <div className="pm-stat-value">{c.value}</div>
                  </button>
                </div>
              ))}
            </div>

            <div className="pm-card">
              <div className="pm-card-head">
                <div>
                  <div className="pm-card-title">Corporate Bank Accounts</div>
                  <div className="pm-td-sub">{banks.length} active accounts</div>
                </div>
                <button className="btn btn-sm btn-primary" onClick={() => openAdd("bank_account")}><i className="bi bi-plus-lg me-1" />Add Account</button>
              </div>
              <div className="pm-table-wrap">
                <table className="pm-table">
                  <thead><tr><th>Bank</th><th>Account</th><th>Name</th><th className="text-end">Balance</th><th>Status</th><th className="text-end">Actions</th></tr></thead>
                  <tbody>
                    {banks.map(a => (
                      <tr key={a.id}>
                        <td><span className="pm-td-strong"><i className="bi bi-bank me-2" style={{ color: "var(--pm-green)" }} />{a.bank}</span></td>
                        <td className="mono pm-td-sub">{a.acc}</td>
                        <td>{a.name}</td>
                        <td className="text-end mono" style={{ fontWeight: 700 }}>{a.currency === "KES" ? kes(a.balance) : `$${(a.balance / 1000).toLocaleString()}K`}</td>
                        <td><Badge tone="green" dot>Active</Badge>{a.locked && <Badge tone="amber" className="ms-1">🔒</Badge>}</td>
                        <td className="text-end text-nowrap">
                          <button className="btn btn-sm btn-outline-primary me-1" style={{ fontSize: ".66rem" }} onClick={() => openEdit(a)}><i className="bi bi-pencil-square" /></button>
                          <button className="btn btn-sm btn-outline-secondary me-1" style={{ fontSize: ".66rem" }} onClick={() => openLock(a)}><i className={`bi ${a.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                          <button className="btn btn-sm btn-outline-danger" style={{ fontSize: ".66rem" }} onClick={() => openDelete(a)}><i className="bi bi-trash3" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pm-eyebrow mb-2">Treasury Actions</div>
            <div className="row g-2">
              {[
                { label: "Vendor Payment", icon: "bi-bank", action: () => setVendorPaymentOpen(true) },
                { label: "Expense Request", icon: "bi-receipt", action: () => setExpenseWizardOpen(true) },
                { label: "Expense Reports", icon: "bi-file-earmark-text", action: () => setExpenseReportOpen(true) },
                { label: "Vendor Directory", icon: "bi-shop", action: () => setVendorDirOpen(true) },
                { label: "Cash Flow", icon: "bi-graph-up", action: () => setCashFlowOpen(true) },
                { label: "Reserves", icon: "bi-droplet", action: () => setLiquidityOpen(true) },
                { label: "Contracts", icon: "bi-file-earmark-ruled", action: () => setContractsOpen(true) },
                { label: "Partnerships", icon: "bi-handshake", action: () => setPartnershipsOpen(true) },
              ].map(a => (
                <div key={a.label} className="col-6 col-md-4 col-lg-3">
                  <button className="pm-qa" onClick={a.action}>
                    <i className={`bi ${a.icon}`} />
                    <span className="t">{a.label}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>}

          {/* ================= TAB: P&L ================= */}
          {tab === "pnl" && <div className="d-flex flex-column gap-4">
            <div className="row g-2">
              {[
                { label: "Revenue (Q2)", value: "KES 558M", trend: "↑ 24%", action: () => setPnlOpen(true) },
                { label: "Gross Profit", value: "KES 458M", trend: "82% margin", action: () => setPnlOpen(true) },
                { label: "EBITDA", value: "KES 103M", trend: "18.4%", action: () => setPnlOpen(true) },
                { label: "Net Income", value: "KES 103M", trend: "↑ 63%", action: () => setPnlOpen(true) },
              ].map(c => (
                <div key={c.label} className="col-6 col-lg-3">
                  <button className="pm-health w-100 text-start" onClick={c.action}>
                    <div className="pm-stat-label">{c.label}</div>
                    <div className="pm-stat-value">{c.value}</div>
                    <div className="pm-trend-up">{c.trend}</div>
                  </button>
                </div>
              ))}
            </div>
            <div className="pm-card pm-card-pad">
              <div className="pm-eyebrow mb-2">Revenue Breakdown</div>
              {[
                { source: "Transaction Fees", amount: 142000000, pct: 76.3 },
                { source: "Card Fees", amount: 18500000, pct: 9.9 },
                { source: "Utility Commissions", amount: 12800000, pct: 6.9 },
                { source: "VIP Subscriptions", amount: 8200000, pct: 4.4 },
                { source: "FX Margins", amount: 4500000, pct: 2.4 },
              ].map(r => (
                <div key={r.source} className="d-flex align-items-center gap-3 mb-2">
                  <span style={{ fontSize: ".82rem", flex: 1 }}>{r.source}</span>
                  <div className="pm-meter" style={{ width: 120 }}><span style={{ width: `${r.pct}%` }} /></div>
                  <span className="mono" style={{ fontSize: ".82rem", width: 100, textAlign: "right" }}>{kes(r.amount)}</span>
                  <span className="pm-td-sub" style={{ width: 48, textAlign: "right" }}>{r.pct}%</span>
                </div>
              ))}
            </div>
            <div className="pm-eyebrow mb-2">P&L Actions</div>
            <div className="row g-2">
              {[
                { label: "Full P&L", icon: "bi-graph-up-arrow", action: () => setPnlOpen(true) },
                { label: "Dept Budgets", icon: "bi-clipboard-data", action: () => setDeptBudgetOpen(true) },
                { label: "Cash Flow", icon: "bi-bar-chart-line", action: () => setCashFlowOpen(true) },
                { label: "Scenario Model", icon: "bi-magic", action: () => setScenarioOpen(true) },
                { label: "Market Analysis", icon: "bi-globe", action: () => setMarketAnalysisOpen(true) },
                { label: "Strategic Plan", icon: "bi-bullseye", action: () => setStrategicPlanOpen(true) },
              ].map(a => (
                <div key={a.label} className="col-6 col-md-4 col-lg-3"><button className="pm-qa" onClick={a.action}><i className={`bi ${a.icon}`} /><span className="t">{a.label}</span></button></div>
              ))}
            </div>
          </div>}

          {/* ================= TAB: Cap Table ================= */}
          {tab === "captable" && <div className="d-flex flex-column gap-4">
            <div className="row g-2">
              {[
                { label: "Total Shares", value: "10,000,000", action: () => setCapTableOpen(true) },
                { label: "Share Price", value: "KES 247", action: () => setValuationOpen(true) },
                { label: "ESOP Pool", value: "500,000", action: () => setEsopOpen(true) },
                { label: "Actions", value: "6 available", action: () => setCapTableOpen(true) },
              ].map(c => (
                <div key={c.label} className="col-6 col-lg-3">
                  <button className="pm-health w-100 text-start" onClick={c.action}>
                    <div className="pm-stat-label">{c.label}</div>
                    <div className="pm-stat-value">{c.value}</div>
                  </button>
                </div>
              ))}
            </div>
            <div className="pm-card">
              <div className="pm-card-head">
                <div className="pm-card-title">Cap Table Overview</div>
                <button className="btn btn-sm btn-primary" onClick={() => openAdd("founder")}><i className="bi bi-plus-lg me-1" />Add Shareholder</button>
              </div>
              <div className="pm-table-wrap">
                <table className="pm-table">
                  <thead><tr><th>Shareholder</th><th>Type</th><th className="text-end">Shares</th><th className="text-end">%</th><th className="text-end">Value</th><th className="text-end">MOIC</th><th className="text-end">Actions</th></tr></thead>
                  <tbody>
                    {founders.map(f => (
                      <tr key={f.id} className="cursor-pointer" onClick={() => setFounderModal(f)}>
                        <td><span className="pm-td-strong">{f.name}</span><div className="pm-td-sub">{f.role}</div></td>
                        <td><Badge tone="blue">Common</Badge></td>
                        <td className="text-end mono">{num(f.shares)}</td>
                        <td className="text-end" style={{ fontWeight: 700 }}>{f.ownership}%</td>
                        <td className="text-end mono" style={{ fontWeight: 700 }}>{kes(f.currentValue)}</td>
                        <td className="text-end">{f.moic}x</td>
                        <td className="text-end text-nowrap">
                          <button className="btn btn-sm btn-outline-primary me-1" style={{ fontSize: ".66rem" }} onClick={e => { e.stopPropagation(); openEdit(f); }}><i className="bi bi-pencil-square" /></button>
                          <button className="btn btn-sm btn-outline-secondary me-1" style={{ fontSize: ".66rem" }} onClick={e => { e.stopPropagation(); openLock(f); }}><i className={`bi ${f.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                          <button className="btn btn-sm btn-outline-danger" style={{ fontSize: ".66rem" }} onClick={e => { e.stopPropagation(); openDelete(f); }}><i className="bi bi-trash3" /></button>
                        </td>
                      </tr>
                    ))}
                    <tr style={{ fontWeight: 700, borderTop: "2px solid var(--pm-border)" }}>
                      <td>Total</td><td></td>
                      <td className="text-end mono">{num(founders.reduce((s, f) => s + f.shares, 0))}</td>
                      <td className="text-end">100%</td>
                      <td className="text-end mono">{kes(founders.reduce((s, f) => s + f.currentValue, 0))}</td>
                      <td></td><td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="pm-eyebrow mb-2">Equity Actions</div>
            <div className="row g-2">
              {[
                { label: "Share Transfer", icon: "bi-arrow-left-right", action: () => setShareTransferOpen(true) },
                { label: "Share Buyback", icon: "bi-arrow-counterclockwise", action: () => setBuybackOpen(true) },
                { label: "Dividend", icon: "bi-cash-stack", action: () => setDividendOpen(true) },
                { label: "ESOP Pool", icon: "bi-people", action: () => setEsopOpen(true) },
                { label: "Valuation", icon: "bi-gem", action: () => setValuationOpen(true) },
                { label: "Fundraising", icon: "bi-rocket", action: () => setFundraisingOpen(true) },
                { label: "Invite Investor", icon: "bi-person-plus", action: () => setInviteOpen(true) },
                { label: "Vesting", icon: "bi-calendar-check", action: () => setVestingModal(true) },
              ].map(a => (
                <div key={a.label} className="col-6 col-md-4 col-lg-3"><button className="pm-qa" onClick={a.action}><i className={`bi ${a.icon}`} /><span className="t">{a.label}</span></button></div>
              ))}
            </div>
          </div>}

          {/* ================= TAB: Budget & Forecast ================= */}
          {tab === "budget" && <div className="d-flex flex-column gap-4">
            <div className="row g-2">
              {[
                { label: "FY Budget", value: "KES 378M", action: () => setDeptBudgetOpen(true) },
                { label: "Spent (YTD)", value: "KES 224M", action: () => setExpenseReportOpen(true) },
                { label: "Remaining", value: "KES 154M", action: () => setDeptBudgetOpen(true) },
                { label: "Forecast Accuracy", value: "92%", action: () => setScenarioOpen(true) },
              ].map(c => (
                <div key={c.label} className="col-6 col-lg-3">
                  <button className="pm-health w-100 text-start" onClick={c.action}>
                    <div className="pm-stat-label">{c.label}</div>
                    <div className="pm-stat-value">{c.value}</div>
                  </button>
                </div>
              ))}
            </div>
            <div className="pm-card">
              <div className="pm-card-head">
                <div className="pm-card-title">Department Budget Utilization</div>
                <button className="btn btn-sm btn-primary" onClick={() => openAdd("budget")}><i className="bi bi-plus-lg me-1" />Add Budget</button>
              </div>
              <div className="pm-table-wrap">
                <table className="pm-table">
                  <thead><tr><th>Department</th><th className="text-end">Budget</th><th className="text-end">Spent</th><th>Utilization</th><th className="text-end">%</th><th>Owner</th><th className="text-end">Actions</th></tr></thead>
                  <tbody>
                    {budgets.map(d => {
                      const pct = Math.round(d.spent / d.budget * 100);
                      return (
                        <tr key={d.id}>
                          <td className="pm-td-strong">{d.dept}</td>
                          <td className="text-end mono">{kes(d.budget)}</td>
                          <td className="text-end mono">{kes(d.spent)}</td>
                          <td style={{ width: 140 }}><div className="pm-meter"><span style={{ width: `${pct}%`, background: pct > 80 ? "var(--pm-danger)" : "var(--pm-green)" }} /></div></td>
                          <td className="text-end" style={{ fontWeight: 700, color: pct > 80 ? "var(--pm-danger)" : undefined }}>{pct}%</td>
                          <td className="pm-td-sub">{d.owner}</td>
                          <td className="text-end text-nowrap">
                            <button className="btn btn-sm btn-outline-primary me-1" style={{ fontSize: ".66rem" }} onClick={() => openEdit(d)}><i className="bi bi-pencil-square" /></button>
                            <button className="btn btn-sm btn-outline-secondary me-1" style={{ fontSize: ".66rem" }} onClick={() => openLock(d)}><i className={`bi ${d.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                            <button className="btn btn-sm btn-outline-danger" style={{ fontSize: ".66rem" }} onClick={() => openDelete(d)}><i className="bi bi-trash3" /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="pm-eyebrow mb-2">Budget Actions</div>
            <div className="row g-2">
              {[
                { label: "Budget Allocation", icon: "bi-clipboard-data", action: () => setBudgetAllocOpen(true) },
                { label: "Dept Budgets", icon: "bi-graph-up", action: () => setDeptBudgetOpen(true) },
                { label: "Cash Flow Forecast", icon: "bi-bar-chart-line", action: () => setCashFlowOpen(true) },
                { label: "Scenario Model", icon: "bi-magic", action: () => setScenarioOpen(true) },
                { label: "Expense Request", icon: "bi-receipt", action: () => setExpenseWizardOpen(true) },
                { label: "Strategic Plan", icon: "bi-bullseye", action: () => setStrategicPlanOpen(true) },
              ].map(a => (
                <div key={a.label} className="col-6 col-md-4 col-lg-3"><button className="pm-qa" onClick={a.action}><i className={`bi ${a.icon}`} /><span className="t">{a.label}</span></button></div>
              ))}
            </div>
          </div>}

          {/* ================= TAB: Compliance ================= */}
          {tab === "compliance" && <div className="d-flex flex-column gap-4">
            <div className="row g-2">
              {[
                { label: "CBK License", value: "Active", tone: "green", action: () => setComplianceOpen(true) },
                { label: "Tax Compliance", value: "Current", tone: "green", action: () => setTaxOpen(true) },
                { label: "KYC Documents", value: "14 expiring", tone: "amber", action: () => setKycExpiryOpen(true) },
                { label: "Audit Status", value: "In Progress", tone: "blue", action: () => setAnnualReportOpen(true) },
              ].map(c => (
                <div key={c.label} className="col-6 col-lg-3">
                  <button className="pm-health w-100 text-start" onClick={c.action}>
                    <Badge tone={c.tone}>{c.value}</Badge>
                    <div className="pm-td-strong mt-1">{c.label}</div>
                  </button>
                </div>
              ))}
            </div>
            <div className="pm-eyebrow mb-2">Compliance Actions</div>
            <div className="row g-2">
              {[
                { label: "Regulatory Status", icon: "bi-shield-check", action: () => setComplianceOpen(true) },
                { label: "Tax Filing", icon: "bi-building-check", action: () => setTaxOpen(true) },
                { label: "KYC Expiry", icon: "bi-calendar-x", action: () => setKycExpiryOpen(true) },
                { label: "Related Parties", icon: "bi-link-45deg", action: () => setRelatedPartyOpen(true) },
                { label: "Insurance", icon: "bi-shield", action: () => setInsuranceOpen(true) },
                { label: "Annual Report", icon: "bi-file-earmark-pdf", action: () => setAnnualReportOpen(true) },
                { label: "Audit Trail", icon: "bi-clock-history", action: () => setAuditTrailOpen(true) },
                { label: "Admin Activity", icon: "bi-person-video3", action: () => setActivityLogOpen(true) },
              ].map(a => (
                <div key={a.label} className="col-6 col-md-4 col-lg-3"><button className="pm-qa" onClick={a.action}><i className={`bi ${a.icon}`} /><span className="t">{a.label}</span></button></div>
              ))}
            </div>
          </div>}

          {/* ================= TAB: Strategic ================= */}
          {tab === "strategic" && <div className="d-flex flex-column gap-4">
            <div className="row g-2">
              {[
                { label: "Strategic Plan", value: "2026-2028", action: () => setStrategicPlanOpen(true) },
                { label: "Fundraising", value: "Series C (2027)", action: () => setFundraisingOpen(true) },
                { label: "Market Position", value: "#1 PSP", action: () => setMarketAnalysisOpen(true) },
                { label: "Governance", value: "5 Board Seats", action: () => setGovernanceOpen(true) },
              ].map(c => (
                <div key={c.label} className="col-6 col-lg-3">
                  <button className="pm-health w-100 text-start" onClick={c.action}>
                    <div className="pm-stat-label">{c.label}</div>
                    <div className="pm-stat-value" style={{ fontSize: "1rem" }}>{c.value}</div>
                  </button>
                </div>
              ))}
            </div>
            <div className="pm-card pm-card-pad">
              <div className="pm-eyebrow mb-2">Board Resolutions</div>
              <div className="pm-table-wrap">
                <table className="pm-table">
                  <thead><tr><th>Number</th><th>Subject</th><th>Date</th><th>Status</th><th>Votes</th><th className="text-end">Actions</th></tr></thead>
                  <tbody>
                    {resolutions.map(r => (
                      <tr key={r.id}>
                        <td className="mono pm-td-strong">{r.number}</td>
                        <td>{r.subject}</td>
                        <td className="pm-td-sub">{r.date}</td>
                        <td><Badge tone="green">{r.status}</Badge>{r.locked && <Badge tone="amber" className="ms-1">🔒</Badge>}</td>
                        <td className="mono">{r.votes}</td>
                        <td className="text-end text-nowrap">
                          <button className="btn btn-sm btn-outline-primary me-1" style={{ fontSize: ".66rem" }} onClick={() => openEdit(r)}><i className="bi bi-pencil-square" /></button>
                          <button className="btn btn-sm btn-outline-secondary me-1" style={{ fontSize: ".66rem" }} onClick={() => openLock(r)}><i className={`bi ${r.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                          <button className="btn btn-sm btn-outline-danger" style={{ fontSize: ".66rem" }} onClick={() => openDelete(r)}><i className="bi bi-trash3" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="btn btn-sm btn-primary mt-2" onClick={() => openAdd("board_resolution")}><i className="bi bi-plus-lg me-1" />Record Resolution</button>
            </div>
            <div className="pm-eyebrow mb-2">Strategic Actions</div>
            <div className="row g-2">
              {[
                { label: "Strategic Plan", icon: "bi-bullseye", action: () => setStrategicPlanOpen(true) },
                { label: "Fundraising", icon: "bi-rocket", action: () => setFundraisingOpen(true) },
                { label: "Market Analysis", icon: "bi-globe", action: () => setMarketAnalysisOpen(true) },
                { label: "Governance", icon: "bi-bank", action: () => setGovernanceOpen(true) },
                { label: "Board Resolution", icon: "bi-journal-text", action: () => setBoardResOpen(true) },
                { label: "Corporate Actions", icon: "bi-clipboard-data", action: () => setCorporateActionsOpen(true) },
                { label: "Partnerships", icon: "bi-handshake", action: () => setPartnershipsOpen(true) },
                { label: "E-Signature", icon: "bi-pen", action: () => setEsigOpen(true) },
              ].map(a => (
                <div key={a.label} className="col-6 col-md-4 col-lg-3"><button className="pm-qa" onClick={a.action}><i className={`bi ${a.icon}`} /><span className="t">{a.label}</span></button></div>
              ))}
            </div>
          </div>}

          {/* ================= TAB: Documents & Agreements ================= */}
          {tab === "documents" && <div className="d-flex flex-column gap-4">
            <div className="row g-2">
              {[
                { label: "Total Documents", value: String(documents.length), action: () => setDocRepoOpen(true) },
                { label: "Restricted", value: String(documents.filter(d => d.classification === "Restricted").length), action: () => setDocRepoOpen(true) },
                { label: "Locked", value: String(documents.filter(d => d.locked).length), action: () => setDocRepoOpen(true) },
                { label: "Active Contracts", value: String(vendors.length), action: () => setContractsOpen(true) },
              ].map(c => (
                <div key={c.label} className="col-6 col-lg-3">
                  <button className="pm-health w-100 text-start" onClick={c.action}>
                    <div className="pm-stat-label">{c.label}</div>
                    <div className="pm-stat-value">{c.value}</div>
                  </button>
                </div>
              ))}
            </div>
            <div className="pm-card">
              <div className="pm-card-head">
                <div className="pm-card-title">Company Documents & Agreements</div>
                <button className="btn btn-sm btn-primary" onClick={() => setDocUploadOpen(true)}><i className="bi bi-cloud-arrow-up me-1" />Upload Document</button>
              </div>
              <div className="pm-table-wrap">
                <table className="pm-table">
                  <thead><tr><th>Document</th><th>Category</th><th>Classification</th><th>Status</th><th>Uploaded</th><th className="text-end">Actions</th></tr></thead>
                  <tbody>
                    {documents.map(d => (
                      <tr key={d.id}>
                        <td className="pm-td-strong">{d.name}</td>
                        <td><Badge tone="blue">{d.category}</Badge></td>
                        <td><Badge tone={d.classification === "Restricted" ? "red" : d.classification === "Confidential" ? "amber" : "green"}>{d.classification}</Badge></td>
                        <td>{d.locked ? <Badge tone="amber" dot>Locked</Badge> : <Badge tone="green" dot>Active</Badge>}</td>
                        <td className="pm-td-sub">{d.uploadedAt}</td>
                        <td className="text-end text-nowrap">
                          <button className="btn btn-sm btn-outline-primary me-1" style={{ fontSize: ".66rem" }} onClick={() => openEdit(d)}><i className="bi bi-pencil-square" /></button>
                          <button className="btn btn-sm btn-outline-secondary me-1" style={{ fontSize: ".66rem" }} onClick={() => openLock(d)}><i className={`bi ${d.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                          <button className="btn btn-sm btn-outline-danger" style={{ fontSize: ".66rem" }} onClick={() => openDelete(d)}><i className="bi bi-trash3" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="pm-card pm-card-pad">
              <div className="pm-eyebrow mb-2">Vendor Contracts</div>
              <div className="pm-table-wrap">
                <table className="pm-table">
                  <thead><tr><th>Vendor</th><th>Type</th><th className="text-end">Monthly</th><th className="text-end">Actions</th></tr></thead>
                  <tbody>
                    {vendors.map(v => (
                      <tr key={v.id}>
                        <td className="pm-td-strong">{v.name}</td>
                        <td className="pm-td-sub">{v.type}</td>
                        <td className="text-end mono">{kes(v.monthly)}</td>
                        <td className="text-end text-nowrap">
                          <button className="btn btn-sm btn-outline-primary me-1" style={{ fontSize: ".66rem" }} onClick={() => openEdit(v)}><i className="bi bi-pencil-square" /></button>
                          <button className="btn btn-sm btn-outline-secondary me-1" style={{ fontSize: ".66rem" }} onClick={() => openLock(v)}><i className={`bi ${v.locked ? "bi-unlock" : "bi-lock"}`} /></button>
                          <button className="btn btn-sm btn-outline-danger" style={{ fontSize: ".66rem" }} onClick={() => openDelete(v)}><i className="bi bi-trash3" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="btn btn-sm btn-primary mt-2" onClick={() => openAdd("vendor")}><i className="bi bi-plus-lg me-1" />Add Vendor Contract</button>
            </div>
            <div className="pm-eyebrow mb-2">Document Actions</div>
            <div className="row g-2">
              {[
                { label: "Upload Document", icon: "bi-cloud-arrow-up", action: () => setDocUploadOpen(true) },
                { label: "Document Vault", icon: "bi-folder2-open", action: () => setDocRepoOpen(true) },
                { label: "Contracts", icon: "bi-file-earmark-ruled", action: () => setContractsOpen(true) },
                { label: "Partnerships", icon: "bi-handshake", action: () => setPartnershipsOpen(true) },
                { label: "E-Signature", icon: "bi-pen", action: () => setEsigOpen(true) },
                { label: "Corporate Seal", icon: "bi-stamp", action: () => setSealOpen(true) },
                { label: "Power of Attorney", icon: "bi-person-gear", action: () => setPoaOpen(true) },
                { label: "Invite Signer", icon: "bi-person-plus", action: () => setInviteOpen(true) },
              ].map(a => (
                <div key={a.label} className="col-6 col-md-4 col-lg-3"><button className="pm-qa" onClick={a.action}><i className={`bi ${a.icon}`} /><span className="t">{a.label}</span></button></div>
              ))}
            </div>
          </div>}
        </div>
      </div>

      {/* ================= All Modals ================= */}
      <CompanyProfileDrawer open={companyProfileOpen} onClose={() => setCompanyProfileOpen(false)} />
      <FounderDetailModal founder={founderModal} onClose={() => setFounderModal(null)} />
      <ShareTransferWizard open={shareTransferOpen} onClose={() => setShareTransferOpen(false)} />
      <ExpenseApprovalWizard open={expenseWizardOpen} onClose={() => setExpenseWizardOpen(false)} />
      <VendorPaymentModal open={vendorPaymentOpen} onClose={() => setVendorPaymentOpen(false)} />
      <BudgetAllocationModal open={budgetAllocOpen} onClose={() => setBudgetAllocOpen(false)} />
      <PnLStatementModal open={pnlOpen} onClose={() => setPnlOpen(false)} />
      <CashFlowForecastModal open={cashFlowOpen} onClose={() => setCashFlowOpen(false)} />
      <VestingScheduleModal open={vestingModal !== null} onClose={() => setVestingModal(null)} />
      <CapTableModal open={capTableOpen} onClose={() => setCapTableOpen(false)} />
      <TreasuryAccountModal open={treasuryOpen} onClose={() => setTreasuryOpen(false)} />
      <DividendModal open={dividendOpen} onClose={() => setDividendOpen(false)} />
      <ComplianceStatusModal open={complianceOpen} onClose={() => setComplianceOpen(false)} />
      <ESOPManagementModal open={esopOpen} onClose={() => setEsopOpen(false)} />
      <BoardResolutionModal open={boardResOpen} onClose={() => setBoardResOpen(false)} />
      <ShareValuationModal open={valuationOpen} onClose={() => setValuationOpen(false)} />
      <TaxFilingModal open={taxOpen} onClose={() => setTaxOpen(false)} />
      <ShareholderAgreementModal open={shareholderAgreementOpen} onClose={() => setShareholderAgreementOpen(false)} />
      <DepartmentBudgetModal open={deptBudgetOpen} onClose={() => setDeptBudgetOpen(false)} />
      <ExpenseReportModal open={expenseReportOpen} onClose={() => setExpenseReportOpen(false)} />
      <VendorDirectoryModal open={vendorDirOpen} onClose={() => setVendorDirOpen(false)} />
      <LiquidityReserveModal open={liquidityOpen} onClose={() => setLiquidityOpen(false)} />
      <StrategicInvestmentModal open={strategicInvestOpen} onClose={() => setStrategicInvestOpen(false)} />
      <GovernanceModal open={governanceOpen} onClose={() => setGovernanceOpen(false)} />
      <KycExpiryModal open={kycExpiryOpen} onClose={() => setKycExpiryOpen(false)} />
      <ShareBuybackModal open={buybackOpen} onClose={() => setBuybackOpen(false)} />
      <RelatedPartyModal open={relatedPartyOpen} onClose={() => setRelatedPartyOpen(false)} />
      <StrategicPlanModal open={strategicPlanOpen} onClose={() => setStrategicPlanOpen(false)} />
      <IpTrademarksModal open={ipOpen} onClose={() => setIpOpen(false)} />
      <InsuranceModal open={insuranceOpen} onClose={() => setInsuranceOpen(false)} />
      <ScenarioModelingModal open={scenarioOpen} onClose={() => setScenarioOpen(false)} />
      <AnnualReportModal open={annualReportOpen} onClose={() => setAnnualReportOpen(false)} />
      <EmergencyFundModal open={emergencyFundOpen} onClose={() => setEmergencyFundOpen(false)} />
      <MarketAnalysisModal open={marketAnalysisOpen} onClose={() => setMarketAnalysisOpen(false)} />
      <ShareholderCommModal open={shareholderCommOpen} onClose={() => setShareholderCommOpen(false)} />
      <FundraisingPipelineModal open={fundraisingOpen} onClose={() => setFundraisingOpen(false)} />
      <CorporateActionsModal open={corporateActionsOpen} onClose={() => setCorporateActionsOpen(false)} />

      {/* New admin control modals */}
      <AddRecordModal type={addRecordType} open={addRecordOpen} onClose={() => setAddRecordOpen(false)} onAdd={handleAddRecord} />
      <EditRecordModal record={editRecord} open={!!editRecord} onClose={() => setEditRecord(null)} onSave={handleEditSave} />
      <DeleteConfirmModal record={deleteRecord} open={!!deleteRecord} onClose={() => setDeleteRecord(null)} onDelete={handleDelete} />
      <LockUnlockModal record={lockRecord} open={!!lockRecord} onClose={() => setLockRecord(null)} onToggle={handleLockToggle} />
      <DocumentUploadWizard open={docUploadOpen} onClose={() => setDocUploadOpen(false)} />
      <DocumentRepositoryDrawer open={docRepoOpen} onClose={() => setDocRepoOpen(false)} documents={documents} />
      <PartnershipViewerDrawer open={partnershipsOpen} onClose={() => setPartnershipsOpen(false)} />
      <ContractManagerDrawer open={contractsOpen} onClose={() => setContractsOpen(false)} />
      <ESigWorkflowModal open={esigOpen} onClose={() => setEsigOpen(false)} />
      <ComplianceAuditModal open={auditTrailOpen} onClose={() => setAuditTrailOpen(false)} />
      <AdminActivityLogModal open={activityLogOpen} onClose={() => setActivityLogOpen(false)} />
      <DataExportImportModal open={exportImportOpen} onClose={() => setExportImportOpen(false)} />
      <ShareholderInviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
      <CorporateSealModal open={sealOpen} onClose={() => setSealOpen(false)} />
      <PowerOfAttorneyModal open={poaOpen} onClose={() => setPoaOpen(false)} />
      <EmergencyActionsModal open={emergencyOpen} onClose={() => setEmergencyOpen(false)} />
      <AdminPermissionsDrawer open={permissionsOpen} onClose={() => setPermissionsOpen(false)} />
    </div>
  );
}
