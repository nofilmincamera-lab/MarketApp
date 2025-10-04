
/**
 * Shared taxonomy transformation utilities
 * Applies business_challenge-driven normalization across all case study reports
 */

// ---------- Constants ----------
export const SERVICE_SILOS = [
  "General Customer Service & Support",
  "Sales & Omnichannel Experience",
  "AI & Advanced Analytics",
  "Automation & Digital Transformation",
  "General Back Office & Operations",
  "Finance, Accounting, & Claims",
  "HR & People Services",
  "IT & Technology Services",
  "Risk, Compliance, & Trust",
  "Specialized Operations & Consulting",
];

// Technology categories for normalization
export const TECH_CATEGORIES = {
  "AI & Machine Learning": ["ai", "genai", "generative ai", "llm", "large language model", "machine learning", "ml", "deep learning", "neural network", "artificial intelligence"],
  "Chatbots & Virtual Assistants": ["chatbot", "bot", "virtual assistant", "conversational ai", "voicebot", "intelligent virtual agent", "iva"],
  "Contact Center Platforms": ["genesys", "avaya", "cisco", "nice", "verint", "five9", "talkdesk", "twilio", "ringcentral", "vonage", "bandwidth", "ccaas", "contact center"],
  "CRM Platforms": ["salesforce", "microsoft dynamics", "oracle", "sap", "hubspot", "zoho", "zendesk", "freshworks", "pipedrive", "crm", "service cloud", "sales cloud"],
  "Analytics & BI": ["tableau", "power bi", "qlik", "looker", "sisense", "analytics", "business intelligence", "data visualization", "splunk", "domo"],
  "RPA & Automation": ["uipath", "automation anywhere", "blue prism", "rpa", "robotic process", "workfusion", "kofax", "pega", "appian", "nintex"],
  "Cloud Infrastructure": ["aws", "azure", "google cloud", "gcp", "amazon web services", "microsoft azure", "ibm cloud", "oracle cloud"],
  "Collaboration Tools": ["slack", "teams", "zoom", "webex", "microsoft teams", "google workspace", "office 365", "sharepoint"],
  "Workforce Management": ["nice iwfm", "verint wfm", "aspect", "calabrio", "workforce management", "wfm", "scheduling", "forecasting"],
  "Quality Management": ["nice nexidia", "verint speech analytics", "callminer", "tethr", "clarabridge", "quality management", "qm"],
  "Knowledge Management": ["servicenow", "confluence", "guru", "bloomfire", "coveo", "knowledge base", "kb"]
};

// Field synonyms (tolerate different schemas)
const FN = {
  client_industry: ["client_industry","Client Industry","industry","clientIndustry","client_industry_raw"],
  business_challenge: ["business_challenge","Business Challenge","challenge","businessChallenge","business_problem","pain_point"],
  solution_overview: ["solution_overview","Solution Overview","solution","solutionOverview","approach","solution_description"],
  services_provided: ["services_provided","Services Provided","services","servicesProvided","service_offerings"],
  services_normalized: ["services_normalized","Services Normalized","servicesNormalized"],
  service_channels: ["service_channels","Service Channels","channels","serviceChannels","contact_channels"],
  technologies_used: ["technologies_used","Technologies Used","technology","technologiesUsed","tech_stack","platforms"],
  technologies_normalized: ["technologies_normalized","Technologies Normalized","technologiesNormalized"],
  geographies: ["geographies","Geographies","Regions","geo","geography","regions"],
  results_metrics: ["results_metrics","Results Metrics","results","outcomes","resultsMetrics","metrics"],
  client_industry_normalized: ["client_industry_normalized","Client Industry Normalized","clientIndustryNormalized"],
  title: ["title","Title","case_study_title","name"],
};

// ---------- Helpers ----------
const clean = (s) => {
  if (!s) return "";
  return String(s).replace(/\r|\n|\t|\u00A0/g, " ").replace(/\s+/g, " ").trim();
};

const text = (...vals) => clean(vals.filter(Boolean).join(" ")).toLowerCase();

const pick = (row, names) => {
  if (!row) return "";
  for (const n of names) {
    if (row[n] !== undefined && row[n] !== null && clean(row[n])) {
      return row[n];
    }
  }
  return "";
};

const toArray = (val) => {
  if (!val) return [];
  
  // If it's already an array, clean and return it
  if (Array.isArray(val)) return val.filter(Boolean).map((x) => clean(x)).filter(Boolean);
  
  // If it's a string that looks like JSON array, parse it
  if (typeof val === 'string') {
    // Check if it's a JSON array string
    if (val.startsWith('[') && val.endsWith(']')) {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) {
          return parsed.filter(Boolean).map((x) => clean(x)).filter(Boolean);
        }
      } catch (e) {
        // Not valid JSON, fall through to split logic
      }
    }
    
    // Otherwise split by delimiters
    return clean(val).split(/;|\||,|\//g).map((x) => x.trim()).filter(Boolean);
  }
  
  // If not an array or a string (e.g., number, boolean, object), return empty array
  return [];
};

// ---------- Technology normalization ----------
const normalizeTechnology = (tech) => {
  if (!tech) return null;
  const cleaned = clean(tech).toLowerCase();
  
  // Filter out N/A and generic terms
  if (!cleaned || cleaned === "n/a" || cleaned === "na" || cleaned === "none" || cleaned.length < 2) {
    return null;
  }
  
  // Check against technology categories
  for (const [category, keywords] of Object.entries(TECH_CATEGORIES)) {
    for (const keyword of keywords) {
      if (cleaned.includes(keyword) || keyword.includes(cleaned)) {
        return category;
      }
    }
  }
  
  // Return original if no match (keep specific brand names)
  return tech;
};

const normalizeTechnologies = (techArray) => {
  if (!techArray || !Array.isArray(techArray)) return [];
  
  const normalized = new Set();
  techArray.forEach(tech => {
    const norm = normalizeTechnology(tech);
    if (norm) normalized.add(norm);
  });
  
  return Array.from(normalized);
};

// ---------- Service taxonomy (regex buckets) ----------
const SERVICE_PATS = [
  [/\b(collections?|recovery|past[- ]due|delinquen|charge[- ]off|dunning|payment arrangement|skip[- ]trace|repossession)\b/i, "Collections"],
  [/\b(fraud|kyc|aml|sanctions|pep|transaction monitoring|chargebacks?|dispute management|risk review|compliance|audit|ofac|identity verification|document verification)\b/i, "Risk, Compliance, & Trust"],
  [/\b(claims?|adjudicat|billing|invoice|accounts payable|accounts receivable|\bap\b|\bar\b|reconcile|fp&a|bookkeeping)\b/i, "Finance, Accounting, & Claims"],
  [/\b(customer service|customer support|\bcx\b|case management|ticket(?:ing)?|help ?desk|care|inbound|contact center)\b/i, "General Customer Service & Support"],
  [/\b(tech(?:nical)? support|it support|service desk|desktop support|infra(?:structure)?|network ops|\bsre\b|devops|qa testing|penetration testing|\bsoc\b|\bsiem\b)\b/i, "IT & Technology Services"],
  [/\b(sales|upsell|cross[- ]sell|retention|renewals|lead gen|acquisition|outbound|inbound sales|omnichannel|ecommerce)\b/i, "Sales & Omnichannel Experience"],
  [/\b(automation|\brpa\b|bot|workflow|self[- ]service|process (re)?engineering|digitiz|orchestration)\b/i, "Automation & Digital Transformation"],
  [/\b(ai|genai|\bnlp\b|\bml\b|machine learning|predictive|analytics|insights|\bllm\b|chatbot|\biva\b|\bivr\b)\b/i, "AI & Advanced Analytics"],
  [/\b(back[- ]?office|data entry|order processing|catalog|annotation|labeling|content ops|fulfillment|document processing)\b/i, "General Back Office & Operations"],
  [/\b(\bhr\b|recruit(?:ment|ing)|talent acquisition|onboarding|payroll|\bl&d\b|training)\b/i, "HR & People Services"],
  [/\b(consult(?:ing)?|advisory|\bpmo\b|\bcoe\b|transformation office|operating model)\b/i, "Specialized Operations & Consulting"],
];

// Detect service buckets (deterministic order aligned to SERVICE_SILOS)
const detectServiceSilos = (services, bc, sol, title) => {
  // Weight business_challenge heavily by repeating it 3x, also include title
  const t = text(title, services, bc, bc, bc, sol);
  const hits = SERVICE_PATS.filter(([re]) => re.test(t)).map(([, b]) => b);
  if (!hits.length) return [];
  // keep the canonical order of SERVICE_SILOS
  return SERVICE_SILOS.filter((s) => hits.includes(s));
};

// ---------- Industry taxonomy (up to 3 levels) ----------
const industryL1 = (industryStr, bc, title, services) => {
  const s = text(industryStr, bc, title, services);
  
  // Financial Services
  if (/(credit card|cardholder|issuer|acquirer|chargeback|interchange|card services)\b/i.test(s)) return "Financial Services";
  if (/\b(mortgage|escrow|servicing|loan|lending)\b/i.test(s)) return "Financial Services";
  if (/(auto loan|auto finance|auto lending|repossession)\b/i.test(s)) return "Financial Services";
  if (/\b(bank|banking|bfsi|deposit|treasury|payments?|fintech|financial institution)\b/i.test(s)) return "Financial Services";
  if (/\b(insurance|policy|claims|underwriting|actuarial|p&c|life insurance|annuity)\b/i.test(s)) return "Financial Services";
  if (/\b(wealth|investment|brokerage|trading|securities|retirement|401k)\b/i.test(s)) return "Financial Services";
  
  // Healthcare
  if (/\b(healthcare|health care|hospital|clinic|patient|medical|physician|provider|payer|pbm|pharmacy)\b/i.test(s)) return "Healthcare";
  if (/\b(medicare|medicaid|health insurance|claims|prior auth|eligibility)\b/i.test(s)) return "Healthcare";
  
  // Retail & E-commerce
  if (/\b(retail|ecommerce|e-commerce|online shopping|marketplace|consumer goods|cpg)\b/i.test(s)) return "Retail & Consumer";
  if (/\b(amazon|walmart|target|shopping|storefront)\b/i.test(s)) return "Retail & Consumer";
  
  // Telecom & Media
  if (/\b(telecom|wireless|broadband|cable|isp|mobile|cellular|5g)\b/i.test(s)) return "Technology & Telecom";
  if (/\b(streaming|media|entertainment|content|broadcasting)\b/i.test(s)) return "Technology & Telecom";
  
  // Technology
  if (/\b(software|saas|technology|tech company|cloud service|platform|application)\b/i.test(s)) return "Technology & Telecom";
  
  // Travel & Hospitality
  if (/\b(travel|airline|hotel|hospitality|booking|reservation|tourism)\b/i.test(s)) return "Travel & Hospitality";
  
  // Utilities & Energy
  if (/\b(utility|utilities|power|electric|gas|water|energy)\b/i.test(s)) return "Utilities & Energy";
  
  // Government & Public Sector
  if (/\b(government|public sector|municipal|federal|state|civic|agency)\b/i.test(s)) return "Government & Public Sector";
  
  // Education
  if (/\b(education|university|college|school|academic|student|higher ed)\b/i.test(s)) return "Education";
  
  // Logistics & Transportation
  if (/\b(logistics|transportation|shipping|freight|delivery|supply chain|warehouse)\b/i.test(s)) return "Logistics & Transportation";
  
  return null;
};

const industryL2 = (industryL1, industryStr, bc, title) => {
  const s = text(industryStr, bc, title);
  
  if (industryL1 === "Financial Services") {
    if (/(credit card|cardholder|issuer|acquirer)\b/i.test(s)) return "Credit Cards & Payments";
    if (/\b(mortgage|escrow)\b/i.test(s)) return "Mortgage & Lending";
    if (/(auto loan|auto finance)\b/i.test(s)) return "Auto Finance";
    if (/\b(insurance|policy|underwriting)\b/i.test(s)) return "Insurance";
    if (/\b(bank|banking|deposit)\b/i.test(s)) return "Banking";
    if (/\b(wealth|investment|brokerage)\b/i.test(s)) return "Wealth Management";
  }
  
  if (industryL1 === "Healthcare") {
    if (/\b(hospital|clinic|physician|provider)\b/i.test(s)) return "Healthcare Providers";
    if (/\b(payer|insurance|medicare|medicaid)\b/i.test(s)) return "Healthcare Payers";
    if (/\b(pharmacy|pbm)\b/i.test(s)) return "Pharmacy Benefits";
  }
  
  if (industryL1 === "Retail & Consumer") {
    if (/\b(ecommerce|e-commerce|online)\b/i.test(s)) return "E-Commerce";
    if (/\b(retail|store)\b/i.test(s)) return "Retail";
    if (/\b(cpg|consumer goods)\b/i.test(s)) return "Consumer Packaged Goods";
  }
  
  if (industryL1 === "Technology & Telecom") {
    if (/\b(telecom|wireless|mobile|cellular)\b/i.test(s)) return "Telecommunications";
    if (/\b(software|saas|cloud)\b/i.test(s)) return "Software & SaaS";
    if (/\b(streaming|media|entertainment)\b/i.test(s)) return "Media & Entertainment";
  }
  
  return null;
};

const industryL3 = (industryL2, industryStr, bc, services) => {
  const s = text(industryStr, bc, services);
  
  if (industryL2 === "Credit Cards & Payments") {
    if (/\b(dispute|chargeback)\b/i.test(s)) return "Dispute Management";
    if (/\b(fraud)\b/i.test(s)) return "Fraud Prevention";
    if (/\b(customer service|cardholder)\b/i.test(s)) return "Cardholder Services";
  }
  
  if (industryL2 === "Mortgage & Lending") {
    if (/\b(servicing|loan servicing)\b/i.test(s)) return "Loan Servicing";
    if (/\b(origination|application)\b/i.test(s)) return "Loan Origination";
    if (/\b(collections?|default)\b/i.test(s)) return "Collections & Default";
  }
  
  if (industryL2 === "Insurance") {
    if (/\b(claims?)\b/i.test(s)) return "Claims Processing";
    if (/\b(underwriting)\b/i.test(s)) return "Underwriting";
    if (/\b(policy|policyholder)\b/i.test(s)) return "Policy Administration";
  }
  
  if (industryL2 === "Telecommunications") {
    if (/\b(customer service|support)\b/i.test(s)) return "Customer Support";
    if (/\b(sales|retention)\b/i.test(s)) return "Sales & Retention";
    if (/\b(tech support|technical)\b/i.test(s)) return "Technical Support";
  }
  
  return null;
};

// ---------- Main Transform Function ----------
export function transformCaseStudies(caseStudies) {
  if (!caseStudies || !Array.isArray(caseStudies)) {
    return {
      enriched: [],
      stats: { total: 0, autoNormalized: 0, unresolved: 0, skipped: 0 }
    };
  }

  const enriched = [];
  let autoNormalized = 0;
  let unresolved = 0;
  let skipped = 0;

  caseStudies.forEach((row, idx) => {
    const cs = { ...row };

    // Extract fields with fallbacks
    const title = pick(row, FN.title) || "";
    const industryRaw = pick(row, FN.client_industry) || "";
    const bc = pick(row, FN.business_challenge) || "";
    const sol = pick(row, FN.solution_overview) || "";
    const servicesRaw = toArray(pick(row, FN.services_provided));
    const techsRaw = toArray(pick(row, FN.technologies_used));
    
    // Check if already normalized. `toArray` is modified to parse JSON strings from previous runs.
    const existingIndustry = pick(row, FN.client_industry_normalized) || "";
    const existingServices = toArray(pick(row, FN.services_normalized)); // Will be an array thanks to modified toArray
    const existingTechs = toArray(pick(row, FN.technologies_normalized)); // Will be an array thanks to modified toArray

    // Skip if no meaningful content
    if (!title && !bc && !sol && servicesRaw.length === 0) {
      skipped++;
      enriched.push(cs);
      return;
    }

    // Attempt auto-normalization
    let normalized = false;

    // 1. Services normalization (if missing or empty)
    if (!existingServices || existingServices.length === 0) {
      const detectedServices = detectServiceSilos(
        servicesRaw.join(" "),
        bc,
        sol,
        title
      );
      
      if (detectedServices.length > 0) {
        // Convert array to JSON string for database storage
        cs.services_normalized = JSON.stringify(detectedServices);
        cs.Service_Level_1 = detectedServices[0];
        if (detectedServices.length > 1) {
          cs.Service_Level_2 = detectedServices.slice(1).join("; ");
        }
        normalized = true;
      } else {
         // If no services were detected, explicitly set to empty JSON array string
         cs.services_normalized = JSON.stringify([]);
      }
    } else {
      cs.services_normalized = JSON.stringify(existingServices); // Ensure it's stored as JSON string even if pre-existing
      // Also ensure Service_Level_1/2 are set if existingServices were available and these fields are not already present
      if (!cs.Service_Level_1 && existingServices.length > 0) {
        cs.Service_Level_1 = existingServices[0];
      }
      if (!cs.Service_Level_2 && existingServices.length > 1) {
        cs.Service_Level_2 = existingServices.slice(1).join("; ");
      }
    }

    // 2. Industry normalization (if missing) - up to 3 levels
    if (!existingIndustry) {
      const detectedIndustry = industryL1(
        industryRaw,
        bc,
        title,
        servicesRaw.join(" ")
      );
      
      if (detectedIndustry) {
        cs.client_industry_normalized = detectedIndustry;
        cs.Industry_Level_1 = detectedIndustry;
        
        const l2 = industryL2(detectedIndustry, industryRaw, bc, title);
        if (l2) {
          cs.Industry_Level_2 = l2;
          
          const l3 = industryL3(l2, industryRaw, bc, servicesRaw.join(" "));
          if (l3) {
            cs.Industry_Level_3 = l3;
          }
        }
        
        normalized = true;
      }
    } else {
      cs.client_industry_normalized = existingIndustry;
      // Ensure Industry_Level_1 is set if existingIndustry was available
      if (!cs.Industry_Level_1) {
        cs.Industry_Level_1 = existingIndustry;
      }
      // Note: Industry_Level_2/3 are not explicitly re-derived from existingIndustry by this logic,
      // only if they were present in the original 'row' or detected anew.
    }
    
    // 3. Technology normalization (always process if not pre-existing)
    if (!existingTechs || existingTechs.length === 0) {
      const normalizedTechs = normalizeTechnologies(techsRaw);
      if (normalizedTechs.length > 0) {
        // Convert array to JSON string for database storage
        cs.technologies_normalized = JSON.stringify(normalizedTechs);
        cs.Tech_Level_1 = normalizedTechs[0];
        if (normalizedTechs.length > 1) {
          cs.Tech_Level_2 = normalizedTechs.slice(1).join("; ");
        }
        normalized = true;
      } else {
         // If no technologies were detected, explicitly set to empty JSON array string
         cs.technologies_normalized = JSON.stringify([]);
      }
    } else {
      cs.technologies_normalized = JSON.stringify(existingTechs); // Ensure it's stored as JSON string even if pre-existing
      // Also ensure Tech_Level_1/2 are set if existingTechs were available and these fields are not already present
      if (!cs.Tech_Level_1 && existingTechs.length > 0) {
        cs.Tech_Level_1 = existingTechs[0];
      }
      if (!cs.Tech_Level_2 && existingTechs.length > 1) {
        cs.Tech_Level_2 = existingTechs.slice(1).join("; ");
      }
    }

    // Track stats
    if (normalized) {
      autoNormalized++;
    }
    
    // Mark as unresolved if still missing key fields
    // Per the outline, !cs.services_normalized will catch null, undefined, or empty string,
    // but not "[]" (an empty JSON array string).
    if (!bc || !cs.services_normalized) {
      unresolved++;
    }

    enriched.push(cs);
  });

  const stats = {
    total: caseStudies.length,
    autoNormalized,
    unresolved,
    skipped
  };

  return { enriched, stats };
}
