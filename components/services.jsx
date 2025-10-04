// BPO Services taxonomy - converted to plain JavaScript
// Structure: Industry → Lines of Business (LOB) → Contact Channels, Service Subtypes

const defaultChannels = [
  "Voice (Phone)",
  "Live Chat",
  "Email",
  "SMS/Text",
  "Social/DM (X, FB, IG)",
  "In‑App/Mobile Messaging",
  "Web Form/Portal",
  "IVR/IVA",
  "Chatbot/Voicebot",
  "Video",
  "Co‑browse/Screen‑share",
  "Mail/Fax"
];

export const BPO_SERVICES = [
  // FINANCIAL SERVICES
  {
    industry: "Financial Services",
    synonyms: ["Banking", "BFSI", "Financial Institutions"],
    lines_of_business: [
      {
        name: "Mortgages",
        synonyms: ["Mortgage", "Home Lending", "Home Loans", "Mortgage Servicing"],
        description: "Origination, servicing, default management, and customer assistance for first and second‑lien mortgages.",
        contact_channels: defaultChannels,
        service_subtypes: [
          "Payment Processing & Posting",
          "Escrow Setup & Analysis",
          "Property Tax & Insurance (TI)",
          "Payoff Quotes & Lien Release",
          "ARM/Rate Change Notices",
          "Year‑End Statements (1098)",
          "Lead Intake & Pre‑qual",
          "Application & Document Collection",
          "Disclosure & Compliance Support",
          "Underwriting Fulfillment",
          "Closing/Funding Coordination",
          "Post‑Close QC/Shipping",
          "Early‑Stage Delinquency (1‑59 DPD)",
          "Late‑Stage Collections (60+ DPD)",
          "Loss Mitigation (forbearance, mod)",
          "Short Sale/Deed‑in‑Lieu Support",
          "Foreclosure/Bankruptcy Support",
          "Property Preservation/REO Support",
        ],
      },
      {
        name: "Credit Cards",
        synonyms: ["Cards", "Card Services", "Card Servicing"],
        description: "Acquisition, account servicing, disputes/fraud, collections, and retention for consumer & small business cards.",
        contact_channels: defaultChannels,
        service_subtypes: [
          "Account Maintenance & Auth",
          "Payments & Hardships",
          "Rewards & Loyalty",
          "Chargebacks & Disputes (Reg E/Z)",
          "Fraud Alerts & Re‑issue",
          "Pre‑screen & App Support",
          "KYC/IDV/Income Verification",
          "Activation & Onboarding",
          "Early‑Stage Collections",
          "Late‑Stage/Recoveries",
          "Debt Sale/Agency Oversight",
          "Hardship/Loss Mit Programs",
          "Merchant Disputes",
          "Chargeback Representment",
        ],
      },
      {
        name: "Retail Banking",
        synonyms: ["Consumer Banking", "Deposits", "Checking & Savings"],
        description: "Deposit account servicing, payments, digital banking support, fraud and disputes, and collections.",
        contact_channels: defaultChannels,
        service_subtypes: [
          "Account Opening & KYC",
          "Online/Mobile Banking Support",
          "Debit Card & ATM",
          "Payments & ACH/Wires",
          "Overdraft & Fee Resolution",
          "Fraud/Account Takeover",
          "Disputes (Reg E)",
          "Dormancy/Escheatment",
          "Early/Late Collections",
        ],
      },
      {
        name: "Auto Lending",
        synonyms: ["Auto Finance", "Vehicle Lending"],
        description: "Indirect/direct auto originations, servicing, collections, repossession, and recovery.",
        contact_channels: defaultChannels,
        service_subtypes: [
          "Dealer Support & Funding",
          "Customer Application Support",
          "Title & Lien Mgmt",
          "Payment/Extensions/Deferrals",
          "Early‑Stage Collections",
          "Skip/Repossession Coordination",
          "Remarketing/Deficiency Recovery",
          "Loss Mitigation/Hardship",
        ],
      },
      {
        name: "Small Business Banking",
        synonyms: ["SMB Banking", "Business Banking"],
        description: "Deposits, lending, treasury, and digital servicing for SMB clients.",
        contact_channels: defaultChannels,
        service_subtypes: [
          "Onboarding & KYC/KYB",
          "Payments/Receivables (ACH/Wires)",
          "Merchant Services Helpdesk",
          "Cash Mgmt/Treasury Support",
          "Lending Servicing & Collections",
          "Fraud & Disputes",
        ],
      },
      {
        name: "Insurance",
        synonyms: ["P&C", "Life & Annuity", "Health Insurance"],
        description: "Sales, policy servicing, billing, claims FNOL, adjudication support, and retention.",
        contact_channels: defaultChannels,
        service_subtypes: [
          "Quote & Bind (Licensed)",
          "Policy Admin & Endorsements",
          "Billing & Payments",
          "Claims FNOL & Status",
          "Subrogation/Salvage Support",
          "Underwriting Support",
          "Retention & Cross‑sell",
          "Fraud/SIU Intake",
        ],
      },
      {
        name: "Wealth & Investments",
        synonyms: ["Brokerage", "Asset Management", "Retirement"],
        description: "Account servicing, transfers, trading support, retirement plan assistance, and compliance support.",
        contact_channels: defaultChannels,
        service_subtypes: [
          "Account Opening/ACATS",
          "Trading Support (non‑advice)",
          "Corporate Actions",
          "Retirement Plan Support",
          "Statements/Tax Docs (1099‑DIV/R)",
          "Fraud/AUTH/IDV",
        ],
      },
      {
        name: "Fraud, Risk & Disputes",
        synonyms: ["Fraud Ops", "Risk Ops", "Disputes"],
        description: "Cross‑LOB fraud intake, triage, disputes/chargebacks, alerts, and customer education.",
        contact_channels: defaultChannels,
        service_subtypes: [
          "IDV/KBA/OTP Support",
          "Transaction Disputes",
          "Account Takeover/Compromise",
          "Card/Check Fraud",
          "Alerts & Monitoring",
          "Recovery & Chargeback",
        ],
      },
      {
        name: "Back‑Office & KYC/AML",
        synonyms: ["Operations", "Middle Office"],
        description: "Document, imaging, exception processing, KYC/AML screening, QA, and complaints.",
        contact_channels: ["Web Form/Portal", "Email"],
        service_subtypes: [
          "Document Indexing & QC",
          "KYC/KYB Refresh",
          "Sanctions/Watchlist Screening",
          "Adverse Media Review",
          "Regulatory Complaints (CFPB/FINRA)",
          "QA/AutoQA & Coaching Support",
        ],
      },
    ],
  },

  // HEALTHCARE
  {
    industry: "Healthcare",
    synonyms: ["Payer", "Provider", "PBM"],
    lines_of_business: [
      {
        name: "Payer (Health Insurance)",
        description: "Member & provider support, eligibility, claims, billing, grievances, and appeals.",
        contact_channels: defaultChannels,
        service_subtypes: [
          "Eligibility & Benefits",
          "Claims Status & Adjustments",
          "Prior Authorization Support",
          "Appeals & Grievances",
          "Provider Data Mgmt",
          "HEDIS/Stars Outreach",
        ],
      },
      {
        name: "Provider (Hospitals/Clinics)",
        description: "Patient access, RCM, scheduling, and clinical admin support.",
        contact_channels: defaultChannels,
        service_subtypes: [
          "Scheduling & Patient Access",
          "Pre‑Auth & Utilization Mgmt",
          "Billing/Collections (RCM)",
          "Medical Records/Release",
          "Telehealth Support",
        ],
      },
      {
        name: "Pharmacy/PBM",
        description: "Benefit verification, prior auth, specialty pharmacy, and adherence programs.",
        contact_channels: defaultChannels,
        service_subtypes: [
          "Benefit Verification",
          "Prior Authorization",
          "Specialty Patient Onboarding",
          "Adherence/Refill Outreach",
        ],
      },
    ],
  },

  // TELECOM & MEDIA
  {
    industry: "Telecom & Media",
    synonyms: ["Wireless", "Cable", "Broadband", "Streaming"],
    lines_of_business: [
      {
        name: "Wireless & Broadband",
        description: "Sales, activations, billing, tech support, retention, and field dispatch.",
        contact_channels: defaultChannels,
        service_subtypes: [
          "Sales/Upgrades/Retention",
          "Activations/Provisioning",
          "Billing & Payments",
          "Technical Support (Tier 1/2)",
          "Outage/Dispatch",
        ],
      },
      {
        name: "Media & Streaming",
        description: "Subscriber care, entitlements, content access, and device/app support.",
        contact_channels: defaultChannels,
        service_subtypes: [
          "Subscription Mgmt",
          "Content/DRM Access Issues",
          "App/Device Support",
          "Churn Save/Win‑back",
        ],
      },
    ],
  },

  // E‑COMMERCE & RETAIL
  {
    industry: "E‑commerce & Retail",
    synonyms: ["Retail", "D2C", "E‑com"],
    lines_of_business: [
      {
        name: "Customer Care & Orders",
        description: "Order support, returns/exchanges, payments, and loyalty.",
        contact_channels: defaultChannels,
        service_subtypes: [
          "Order Status & Changes",
          "Returns/Refunds/Exchanges",
          "Payments & Fraud Review",
          "Loyalty/Rewards",
          "Marketplace Seller Support",
        ],
      },
      {
        name: "Trust & Safety",
        description: "Content moderation, account integrity, and compliance workflows.",
        contact_channels: ["Live Chat", "Email", "Web Form/Portal"],
        service_subtypes: [
          "UGC Moderation",
          "Merchant/Listing Review",
          "Account Integrity/Fraud",
          "Brand/IP Protection",
        ],
      },
      {
        name: "Back‑Office Ops",
        description: "Catalog, content, payments exceptions, and supply chain support.",
        contact_channels: ["Email", "Web Form/Portal"],
        service_subtypes: [
          "Catalog/Content Ops",
          "Chargeback/Dispute Support",
          "Vendor/Supply Chain Support",
          "Refund Exceptions",
        ],
      },
    ],
  },

  // TRAVEL & HOSPITALITY
  {
    industry: "Travel & Hospitality",
    synonyms: ["Airlines", "Hotels", "OTAs", "Cruise"],
    lines_of_business: [
      {
        name: "Reservations & Guest Services",
        description: "Sales, reservations, changes, loyalty, disruptions, and refunds.",
        contact_channels: defaultChannels,
        service_subtypes: [
          "Sales/Bookings",
          "Changes/Cancellations",
          "Loyalty/Elite Support",
          "IRROPS/Disruption Handling",
          "Refunds/Vouchers",
        ],
      },
      {
        name: "Back‑Office & Crew Ops",
        description: "Ticketing, queues, settlement, and crew/ops support.",
        contact_channels: ["Email", "Web Form/Portal", "Voice (Phone)"],
        service_subtypes: [
          "Ticketing/Queue Mgmt",
          "Settlement/ARC/BSP",
          "Crew/Property Support",
        ],
      },
    ],
  },

  // UTILITIES & ENERGY
  {
    industry: "Utilities & Energy",
    synonyms: ["Power", "Gas", "Water"],
    lines_of_business: [
      {
        name: "Customer Operations",
        description: "Move‑in/out, billing, outage, payment assistance, and complaints.",
        contact_channels: defaultChannels,
        service_subtypes: [
          "Start/Stop/Transfer Service",
          "Billing & Payment Arrangements",
          "Outage Reporting & Status",
          "Low‑Income/Assistance Programs",
          "Field/Dispatch Coordination",
          "Regulatory Complaints",
        ],
      },
      {
        name: "Collections & Revenue Protection",
        description: "Early/late collections, disconnect/reconnect, theft investigation.",
        contact_channels: ["Voice (Phone)", "SMS/Text", "Email", "IVR/IVA", "Chatbot/Voicebot", "Web Form/Portal"],
        service_subtypes: [
          "Early‑Stage Collections",
          "Late‑Stage/Write‑off",
          "Disconnect/Reconnect",
          "Theft/Tamper Investigation",
        ],
      },
    ],
  },

  // LOGISTICS & TRANSPORT
  {
    industry: "Logistics & Transport",
    synonyms: ["Parcel", "Freight", "3PL"],
    lines_of_business: [
      {
        name: "Shipper/Receiver Support",
        description: "Pickup, tracking, exceptions, billing, and claims.",
        contact_channels: defaultChannels,
        service_subtypes: [
          "Pickup/Delivery Scheduling",
          "Tracking & Exceptions",
          "Billing/Invoices",
          "Damage/Loss Claims",
          "Customs/Trade Support",
        ],
      },
    ],
  },

  // PUBLIC SECTOR & EDUCATION
  {
    industry: "Public Sector & Education",
    synonyms: ["Gov", "Higher Ed"],
    lines_of_business: [
      {
        name: "Citizen Services",
        description: "Helplines, benefits, licensing, and program enrollment.",
        contact_channels: defaultChannels,
        service_subtypes: [
          "Benefits Enrollment & Support",
          "Licensing/Permits",
          "Contact Centers/Helplines",
          "Case Mgmt/Back‑office",
        ],
      },
      {
        name: "Higher Education",
        description: "Admissions, financial aid, bursar, and student services.",
        contact_channels: defaultChannels,
        service_subtypes: [
          "Admissions & Enrollment",
          "Financial Aid & FAFSA",
          "Student Accounts/Bursar",
          "IT Helpdesk/LMS Support",
        ],
      },
    ],
  },
];