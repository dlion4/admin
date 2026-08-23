/* ============================================================
   Page 8 — VIP Clients · data layer
   High-value client book with relationship managers, concierge queue,
   fee exemptions, credit lines, and tier governance.
   ============================================================ */

export type VipTier = "Gold" | "Platinum" | "Diamond" | "Black";
export type VipStatus = "Active" | "Under Review" | "Suspended" | "Pending Onboarding";
export type ConciergePriority = "Urgent" | "High" | "Normal";
export type ConciergeStatus = "New" | "In Progress" | "Resolved" | "Escalated";

export interface VipClient {
  id: string;
  name: string;
  company?: string;
  phone: string;
  email: string;
  county: string;
  tier: VipTier;
  status: VipStatus;
  balance: number;
  monthlyVolume: number;
  monthlyTxns: number;
  rm: string;
  feeExempt: boolean;
  feeDiscountPct: number;
  creditLine: number;
  joinedVip: string;
  lastConcierge: string;
  riskScore: number;
  perks: string[];
  cards: string[];
  notes: string;
}

export interface RelationshipManager {
  id: string;
  name: string;
  title: string;
  clientsCount: number;
  totalBookValue: number;
  satisfactionScore: number;
  email: string;
  phone: string;
}

export interface ConciergeRequest {
  id: string;
  vipId: string;
  vipName: string;
  tier: VipTier;
  rm: string;
  category: "FX Rates" | "Custom Payout" | "Card Issuance" | "Credit Increase" | "Tax Exemption" | "General";
  subject: string;
  detail: string;
  priority: ConciergePriority;
  status: ConciergeStatus;
  requestedAt: string;
  slaHoursLeft: number;
}

export interface FeeExemptionRule {
  id: string;
  vipId: string;
  vipName: string;
  rail: "M-Pesa" | "Card Acquiring" | "PesaLink" | "FX Margin" | "All Rails";
  discountType: "Full Waiver" | "Percentage Discount" | "Capped Rate";
  discountValue: number; // e.g. 100 for waiver, 50 for 50% off
  expiresAt: string;
  approvedBy: string;
  status: "Active" | "Expired" | "Revoked";
}

export interface VipAuditEvent {
  id: string;
  time: string;
  admin: string;
  action: string;
  vipName: string;
  details: string;
}

export const RELATIONS_MANAGERS: RelationshipManager[] = [
  { id: "RM-01", name: "Grace Wanjiru", title: "Senior VIP Relationship Lead", clientsCount: 8, totalBookValue: 14_820_000_000, satisfactionScore: 4.9, email: "grace.wanjiru@paymo.co.ke", phone: "+254722 001 101" },
  { id: "RM-02", name: "Peter Njoroge", title: "Corporate VIP Portfolio Manager", clientsCount: 6, totalBookValue: 11_400_000_000, satisfactionScore: 4.8, email: "peter.njoroge@paymo.co.ke", phone: "+254733 002 202" },
  { id: "RM-03", name: "Faith Chebet", title: "Private Wealth Relationship Manager", clientsCount: 5, totalBookValue: 8_900_000_000, satisfactionScore: 4.9, email: "faith.chebet@paymo.co.ke", phone: "+254715 003 303" },
  { id: "RM-04", name: "Dennis Otieno", title: "Executive Concierge & Merchant Lead", clientsCount: 4, totalBookValue: 6_750_000_000, satisfactionScore: 4.7, email: "dennis.otieno@paymo.co.ke", phone: "+254708 004 404" },
];

export const VIP_CLIENTS: VipClient[] = [
  {
    id: "VIP-1001",
    name: "Amina Hassan",
    company: "Hassan Global Logistics",
    phone: "+254722 445 118",
    email: "amina.hassan@hassanglobal.co.ke",
    county: "Nairobi",
    tier: "Black",
    status: "Active",
    balance: 485_000_000,
    monthlyVolume: 2_840_000_000,
    monthlyTxns: 1240,
    rm: "Grace Wanjiru",
    feeExempt: true,
    feeDiscountPct: 100,
    creditLine: 100_000_000,
    joinedVip: "14 Jan 2024",
    lastConcierge: "2 hours ago",
    riskScore: 8,
    perks: ["Dedicated RM", "0% FX Margin", "Unlimited Free Transfers", "Airport Lounge Pass", "Custom API Rate Limits"],
    cards: ["Visa Black Metal #4821", "Mastercard World Elite #9902"],
    notes: "Founder of Hassan Logistics. High volume international supplier payments every Friday.",
  },
  {
    id: "VIP-1002",
    name: "James Mutua",
    company: "Apex Capital Holdings",
    phone: "+254701 864 532",
    email: "j.mutua@apexcapital.co.ke",
    county: "Nairobi",
    tier: "Black",
    status: "Active",
    balance: 620_000_000,
    monthlyVolume: 3_150_000_000,
    monthlyTxns: 890,
    rm: "Grace Wanjiru",
    feeExempt: true,
    feeDiscountPct: 100,
    creditLine: 150_000_000,
    joinedVip: "02 Feb 2024",
    lastConcierge: "Yesterday",
    riskScore: 12,
    perks: ["Dedicated RM", "0% FX Margin", "Unlimited Free Transfers", "Board Level Reporting"],
    cards: ["Visa Black Metal #1102"],
    notes: "Equity fund partner. Sweeps dividends on monthly basis.",
  },
  {
    id: "VIP-1003",
    name: "Brian Otieno",
    company: "Lakeside Commercial Distributors",
    phone: "+254733 812 990",
    email: "brian.otieno@lakeside.co.ke",
    county: "Kisumu",
    tier: "Diamond",
    status: "Active",
    balance: 185_000_000,
    monthlyVolume: 940_000_000,
    monthlyTxns: 3420,
    rm: "Peter Njoroge",
    feeExempt: false,
    feeDiscountPct: 60,
    creditLine: 50_000_000,
    joinedVip: "18 May 2024",
    lastConcierge: "3 days ago",
    riskScore: 24,
    perks: ["Dedicated RM", "60% Fee Discount", "Priority Merchant Float", "Bulk Payroll Tool"],
    cards: ["Visa Platinum #8841"],
    notes: "FMCG distributor across Nyanza and Rift Valley.",
  },
  {
    id: "VIP-1004",
    name: "Naomi Chemtai",
    company: "Rift Valley Grain Exporters",
    phone: "+254712 990 213",
    email: "naomi.chemtai@rvgrain.com",
    county: "Uasin Gishu",
    tier: "Diamond",
    status: "Active",
    balance: 210_000_000,
    monthlyVolume: 1_120_000_000,
    monthlyTxns: 1850,
    rm: "Peter Njoroge",
    feeExempt: false,
    feeDiscountPct: 75,
    creditLine: 60_000_000,
    joinedVip: "11 Aug 2024",
    lastConcierge: "5 days ago",
    riskScore: 18,
    perks: ["Dedicated RM", "75% Fee Discount", "Custom FX Hedging", "Priority Support"],
    cards: ["Mastercard World #3319"],
    notes: "Grain exporter requiring USD and EUR cross-border settlements.",
  },
  {
    id: "VIP-1005",
    name: "Dr. Faraji Omar",
    company: "Coast Coastwise Medical Group",
    phone: "+254720 112 334",
    email: "faraji.omar@coastmedical.or.ke",
    county: "Mombasa",
    tier: "Platinum",
    status: "Active",
    balance: 95_000_000,
    monthlyVolume: 420_000_000,
    monthlyTxns: 2100,
    rm: "Faith Chebet",
    feeExempt: false,
    feeDiscountPct: 50,
    creditLine: 25_000_000,
    joinedVip: "05 Sep 2024",
    lastConcierge: "1 week ago",
    riskScore: 10,
    perks: ["Dedicated RM", "50% Fee Discount", "POS Aggregation Fee Waiver"],
    cards: ["Visa Platinum #5521"],
    notes: "Hospital chain owner. Accepts PayMo POS at 14 regional clinics.",
  },
  {
    id: "VIP-1006",
    name: "Lucy Muthoni",
    company: "Mount Kenya Estates Ltd",
    phone: "+254798 441 226",
    email: "lucy.muthoni@mkestates.co.ke",
    county: "Nyeri",
    tier: "Platinum",
    status: "Active",
    balance: 78_000_000,
    monthlyVolume: 360_000_000,
    monthlyTxns: 410,
    rm: "Faith Chebet",
    feeExempt: false,
    feeDiscountPct: 50,
    creditLine: 20_000_000,
    joinedVip: "22 Oct 2024",
    lastConcierge: "4 days ago",
    riskScore: 15,
    perks: ["Dedicated RM", "50% Fee Discount", "Escrow Escrow Builder"],
    cards: ["Visa Platinum #9012"],
    notes: "Real estate developer. Rent collection via PayMo tenant portals.",
  },
  {
    id: "VIP-1007",
    name: "Kevin Barasa",
    company: "Western Agro Processing",
    phone: "+254708 221 340",
    email: "kevin.barasa@agroprocessing.co.ke",
    county: "Kakamega",
    tier: "Gold",
    status: "Active",
    balance: 42_000_000,
    monthlyVolume: 180_000_000,
    monthlyTxns: 1520,
    rm: "Dennis Otieno",
    feeExempt: false,
    feeDiscountPct: 30,
    creditLine: 10_000_000,
    joinedVip: "01 Dec 2024",
    lastConcierge: "2 weeks ago",
    riskScore: 28,
    perks: ["Assigned RM", "30% Fee Discount", "Farmer Direct Payouts"],
    cards: ["Visa Gold #7712"],
    notes: "Sugarcane and produce processor. B2C mobile money mass payouts.",
  },
  {
    id: "VIP-1008",
    name: "Zainab Ali",
    company: "Zainab Textiles & Fashion",
    phone: "+254734 551 902",
    email: "zainab@zainabfashion.com",
    county: "Mombasa",
    tier: "Gold",
    status: "Active",
    balance: 38_000_000,
    monthlyVolume: 150_000_000,
    monthlyTxns: 2890,
    rm: "Dennis Otieno",
    feeExempt: false,
    feeDiscountPct: 30,
    creditLine: 10_000_000,
    joinedVip: "15 Jan 2025",
    lastConcierge: "Yesterday",
    riskScore: 14,
    perks: ["Assigned RM", "30% Fee Discount", "Multi-currency Checkout"],
    cards: ["Mastercard Gold #4109"],
    notes: "Import fashion chain. High e-commerce card processing volume.",
  },
  {
    id: "VIP-1009",
    name: "David Kimani",
    company: "Nakuru Motor Works & Spares",
    phone: "+254726 663 441",
    email: "david@nakurumotors.co.ke",
    county: "Nakuru",
    tier: "Gold",
    status: "Under Review",
    balance: 31_000_000,
    monthlyVolume: 120_000_000,
    monthlyTxns: 640,
    rm: "Dennis Otieno",
    feeExempt: false,
    feeDiscountPct: 25,
    creditLine: 5_000_000,
    joinedVip: "20 Feb 2025",
    lastConcierge: "3 weeks ago",
    riskScore: 62,
    perks: ["Assigned RM", "25% Fee Discount"],
    cards: ["Visa Gold #1182"],
    notes: "Auto parts importer. Under risk review due to sudden high-value USD wire transfers.",
  },
  {
    id: "VIP-1010",
    name: "Patrick Kiptoo",
    company: "Eldoret Highway Hotel Group",
    phone: "+254711 883 401",
    email: "kiptoo@highwayhotels.co.ke",
    county: "Uasin Gishu",
    tier: "Platinum",
    status: "Active",
    balance: 64_000_000,
    monthlyVolume: 290_000_000,
    monthlyTxns: 1780,
    rm: "Faith Chebet",
    feeExempt: false,
    feeDiscountPct: 40,
    creditLine: 15_000_000,
    joinedVip: "10 Mar 2025",
    lastConcierge: "6 days ago",
    riskScore: 16,
    perks: ["Dedicated RM", "40% Fee Discount", "Hotel Property Management Connector"],
    cards: ["Visa Platinum #6631"],
    notes: "Hospitality group with 5 hotels in Rift region.",
  },
  {
    id: "VIP-1011",
    name: "Wanjiru Karanja",
    company: "Karanja Retail Chains",
    phone: "+254715 034 672",
    email: "wanjiru@karanjaretail.co.ke",
    county: "Kiambu",
    tier: "Diamond",
    status: "Active",
    balance: 140_000_000,
    monthlyVolume: 820_000_000,
    monthlyTxns: 6200,
    rm: "Peter Njoroge",
    feeExempt: false,
    feeDiscountPct: 70,
    creditLine: 40_000_000,
    joinedVip: "04 Apr 2025",
    lastConcierge: "Today 10:15",
    riskScore: 11,
    perks: ["Dedicated RM", "70% Fee Discount", "Supermarket Till API Integration"],
    cards: ["Visa Diamond #9910"],
    notes: "Supermarket chain with 22 stores in Kiambu & Thika.",
  },
  {
    id: "VIP-1012",
    name: "Samuel Okello",
    company: "Victoria Fish Processors",
    phone: "+254742 335 771",
    email: "samuel@victoriafish.com",
    county: "Kisumu",
    tier: "Gold",
    status: "Active",
    balance: 45_000_000,
    monthlyVolume: 190_000_000,
    monthlyTxns: 1100,
    rm: "Dennis Otieno",
    feeExempt: false,
    feeDiscountPct: 30,
    creditLine: 10_000_000,
    joinedVip: "19 May 2025",
    lastConcierge: "2 weeks ago",
    riskScore: 21,
    perks: ["Assigned RM", "30% Fee Discount", "Cold Chain Supplier Payouts"],
    cards: ["Mastercard Gold #8812"],
    notes: "Fish export & cold chain company.",
  },
];

export const CONCIERGE_REQUESTS: ConciergeRequest[] = [
  {
    id: "CR-901",
    vipId: "VIP-1001",
    vipName: "Amina Hassan",
    tier: "Black",
    rm: "Grace Wanjiru",
    category: "FX Rates",
    subject: "Preferential USD/KES rate quote for $450,000 supplier wire",
    detail: "Client requires a spot rate quote below 128.50 for shipment clearance from Shanghai port.",
    priority: "Urgent",
    status: "In Progress",
    requestedAt: "Today 10:45",
    slaHoursLeft: 1,
  },
  {
    id: "CR-902",
    vipId: "VIP-1011",
    vipName: "Wanjiru Karanja",
    tier: "Diamond",
    rm: "Peter Njoroge",
    category: "Card Issuance",
    subject: "Emergency replacement of 5 corporate till cards for Thika branch",
    detail: "Cards misplaced during branch remodel. Requesting metal contact-free cards dispatched via courier.",
    priority: "High",
    status: "New",
    requestedAt: "Today 09:30",
    slaHoursLeft: 3,
  },
  {
    id: "CR-903",
    vipId: "VIP-1002",
    vipName: "James Mutua",
    tier: "Black",
    rm: "Grace Wanjiru",
    category: "Credit Increase",
    subject: "Temporary float limit raise from KES 150M to KES 220M for dividend run",
    detail: "Apex Capital quarterly dividend payout scheduled for Thursday.",
    priority: "High",
    status: "In Progress",
    requestedAt: "Yesterday 16:20",
    slaHoursLeft: 4,
  },
  {
    id: "CR-904",
    vipId: "VIP-1003",
    vipName: "Brian Otieno",
    tier: "Diamond",
    rm: "Peter Njoroge",
    category: "Custom Payout",
    subject: "Bulk B2C disbursements to 450 produce suppliers without M-Pesa fee deduction",
    detail: "Supplier agreement specifies net disbursement. Client requests fee absorption on PayMo side.",
    priority: "Normal",
    status: "New",
    requestedAt: "Yesterday 14:10",
    slaHoursLeft: 8,
  },
  {
    id: "CR-905",
    vipId: "VIP-1004",
    vipName: "Naomi Chemtai",
    tier: "Diamond",
    rm: "Peter Njoroge",
    category: "Tax Exemption",
    subject: "KRA Withholding Tax Certificate upload verification for Q2 exemption",
    detail: "Uploaded certificate #KRA-2026-8841 via portal; awaiting tax team confirmation.",
    priority: "Normal",
    status: "Resolved",
    requestedAt: "22 Aug 11:00",
    slaHoursLeft: 0,
  },
  {
    id: "CR-906",
    vipId: "VIP-1005",
    vipName: "Dr. Faraji Omar",
    tier: "Platinum",
    rm: "Faith Chebet",
    category: "General",
    subject: "Requesting additional 6 POS terminals for new Nyali Health Wing",
    detail: "Terminals must support dual SIM M-Pesa + Visa contact-free.",
    priority: "Normal",
    status: "Resolved",
    requestedAt: "20 Aug 15:45",
    slaHoursLeft: 0,
  },
];

export const FEE_EXEMPTION_RULES: FeeExemptionRule[] = [
  { id: "FER-401", vipId: "VIP-1001", vipName: "Amina Hassan", rail: "All Rails", discountType: "Full Waiver", discountValue: 100, expiresAt: "31 Dec 2026", approvedBy: "Joseph Mwangi (Super Admin)", status: "Active" },
  { id: "FER-402", vipId: "VIP-1002", vipName: "James Mutua", rail: "All Rails", discountType: "Full Waiver", discountValue: 100, expiresAt: "31 Dec 2026", approvedBy: "Joseph Mwangi (Super Admin)", status: "Active" },
  { id: "FER-403", vipId: "VIP-1003", vipName: "Brian Otieno", rail: "M-Pesa", discountType: "Percentage Discount", discountValue: 60, expiresAt: "30 Nov 2026", approvedBy: "Sarah Kamau (Finance)", status: "Active" },
  { id: "FER-404", vipId: "VIP-1004", vipName: "Naomi Chemtai", rail: "FX Margin", discountType: "Percentage Discount", discountValue: 75, expiresAt: "31 Oct 2026", approvedBy: "Sarah Kamau (Finance)", status: "Active" },
  { id: "FER-405", vipId: "VIP-1011", vipName: "Wanjiru Karanja", rail: "Card Acquiring", discountType: "Capped Rate", discountValue: 70, expiresAt: "15 Jan 2027", approvedBy: "Joseph Mwangi (Super Admin)", status: "Active" },
];

export const VIP_AUDIT_TRAIL: VipAuditEvent[] = [
  { id: "VPA-801", time: "Today 10:45", admin: "Joseph Mwangi", action: "Granted Fee Waiver", vipName: "Amina Hassan", details: "Extended 100% fee waiver on all rails until Dec 2026." },
  { id: "VPA-802", time: "Today 09:12", admin: "Sarah Kamau", action: "Approved Credit Line", vipName: "Wanjiru Karanja", details: "Raised float credit ceiling from KES 25M to KES 40M." },
  { id: "VPA-803", time: "Yesterday 15:30", admin: "Peter Njoroge", action: "Re-assigned RM", vipName: "David Kimani", details: "Moved from Unassigned to Dennis Otieno." },
  { id: "VPA-804", time: "22 Aug 14:15", admin: "Joseph Mwangi", action: "Promoted Tier", vipName: "Naomi Chemtai", details: "Upgraded Platinum → Diamond after annual volume exceeded KES 1B." },
  { id: "VPA-805", time: "20 Aug 11:20", admin: "David Kiplagat", action: "Risk Review Flag", vipName: "David Kimani", details: "Flagged account for high-value USD wire transfer investigation." },
];

export const TIER_PERKS_MATRIX = {
  Black: {
    minBalance: 500_000_000,
    minVolume: 2_000_000_000,
    feeWaiver: "100% All Rails",
    rmType: "Dedicated Senior Lead 24/7",
    loungePass: "Unlimited Global",
    creditLimit: "Up to KES 200M",
    customApi: "Unlimited (Dedicated Gateway)",
  },
  Diamond: {
    minBalance: 100_000_000,
    minVolume: 500_000_000,
    feeWaiver: "60% - 75% Discount",
    rmType: "Dedicated Portfolio Manager",
    loungePass: "Regional African Lounges",
    creditLimit: "Up to KES 60M",
    customApi: "5,000 req/min",
  },
  Platinum: {
    minBalance: 50_000_000,
    minVolume: 250_000_000,
    feeWaiver: "40% - 50% Discount",
    rmType: "Assigned Relationship Manager",
    loungePass: "4 Passes / Year",
    creditLimit: "Up to KES 25M",
    customApi: "2,000 req/min",
  },
  Gold: {
    minBalance: 20_000_000,
    minVolume: 100_000_000,
    feeWaiver: "25% - 30% Discount",
    rmType: "Shared VIP Desk",
    loungePass: "2 Passes / Year",
    creditLimit: "Up to KES 10M",
    customApi: "1,000 req/min",
  },
};
