import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertCircle } from "lucide-react";

/**
 * IndustryActivityHeatmap
 * - Incorporates taxonomy rules directly in the report.
 * - Auto-normalizes each case study (industry + service silos) on the fly using business_challenge (heavily weighted),
 *   services_provided, solution_overview, service_channels, technologies_used, and geographies where relevant.
 * - Falls back gracefully if inputs/fields use different casing or labels (e.g., "Business Challenge").
 */
export default function IndustryActivityHeatmap({ caseStudies }) {
  // ---------- Constants ----------
  const SERVICE_SILOS = [
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

  // Field synonyms (tolerate different schemas)
  const FN = {
    client_industry: ["client_industry","Client Industry","industry","clientIndustry"],
    business_challenge: ["business_challenge","Business Challenge","challenge","businessChallenge"],
    solution_overview: ["solution_overview","Solution Overview","solution","solutionOverview"],
    services_provided: ["services_provided","Services Provided","services","servicesProvided"],
    services_normalized: ["services_normalized","Services Normalized","servicesNormalized"],
    service_channels: ["service_channels","Service Channels","channels","serviceChannels"],
    technologies_used: ["technologies_used","Technologies Used","technology","technologiesUsed"],
    geographies: ["geographies","Geographies","Regions","geo","geography"],
    results_metrics: ["results_metrics","Results Metrics","results","outcomes","resultsMetrics"],
    client_industry_normalized: ["client_industry_normalized","Client Industry Normalized","clientIndustryNormalized"],
  };

  // ---------- Helpers ----------
  const clean = (s) => String(s ?? "").replace(/\r|\n|\t|\u00A0/g, " ").replace(/\s+/g, " ").trim();
  const text = (...vals) => clean(vals.filter(Boolean).join(" ")).toLowerCase();
  const pick = (row, names) => {
    for (const n of names) if (row?.[n] !== undefined && row?.[n] !== null) return row[n];
    return "";
  };
  const toArray = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(Boolean).map((x) => clean(x));
    // split common delimiters
    return clean(val).split(/;|\||,|\//g).map((x) => x.trim()).filter(Boolean);
  };

  // ---------- Service taxonomy (regex buckets) ----------
  const SERVICE_PATS = [
    [/\b(collections?|recovery|past[- ]due|delinquen|charge[- ]off|dunning|payment arrangement|skip[- ]trace|repossession)\b/i, "Collections"],
    [/\b(fraud|kyc|aml|sanctions|pep|transaction monitoring|chargebacks?|dispute management|risk review|compliance|audit|ofac|identity verification|document verification)\b/i, "Risk, Compliance, & Trust"],
    [/\b(claims?|adjudicat|billing|invoice|accounts payable|accounts receivable|\bap\b|\bar\b|reconcile|fp&a|bookkeeping)\b/i, "Finance, Accounting, & Claims"],
    [/\b(customer service|customer support|\bcx\b|case management|ticket(?:ing)?|help ?desk|care)\b/i, "General Customer Service & Support"],
    [/\b(tech(?:nical)? support|it support|service desk|desktop support|infra(?:structure)?|network ops|\bsre\b|devops|qa testing|penetration testing|\bsoc\b|\bsiem\b)\b/i, "IT & Technology Services"],
    [/\b(sales|upsell|cross[- ]sell|retention|renewals|lead gen|acquisition|outbound|inbound sales|omnichannel|ecommerce)\b/i, "Sales & Omnichannel Experience"],
    [/\b(automation|\brpa\b|bot|workflow|self[- ]service|process (re)?engineering|digitiz|orchestration)\b/i, "Automation & Digital Transformation"],
    [/\b(ai|genai|\bnlp\b|\bml\b|machine learning|predictive|analytics|insights|\bllm\b|chatbot|\biva\b|\bivr\b)\b/i, "AI & Advanced Analytics"],
    [/\b(back[- ]?office|data entry|order processing|catalog|annotation|labeling|content ops|fulfillment|document processing)\b/i, "General Back Office & Operations"],
    [/\b(\bhr\b|recruit(?:ment|ing)|talent acquisition|onboarding|payroll|\bl&d\b|training)\b/i, "HR & People Services"],
    [/\b(consult(?:ing)?|advisory|\bpmo\b|\bcoe\b|transformation office|operating model)\b/i, "Specialized Operations & Consulting"],
  ];

  // Detect service buckets (deterministic order aligned to SERVICE_SILOS)
  const detectServiceSilos = (services, bc, sol) => {
    // weight business_challenge by adding it twice
    const t = text(services, bc, bc, sol);
    const hits = SERVICE_PATS.filter(([re]) => re.test(t)).map(([, b]) => b);
    if (!hits.length) return [];
    // keep the canonical order of SERVICE_SILOS
    return SERVICE_SILOS.filter((s) => hits.includes(s));
  };

  // ---------- Industry taxonomy (L1 only for this report) ----------
  const industryL1 = (industryStr, bc) => {
    const s = text(industryStr, bc);
    if (/(credit card|cardholder|issuer|acquirer|chargeback|dispute management|interchange)\b/i.test(s)) return "Financial Services";
    if (/mortgage|escrow/.test(s) || (s.includes("servicing") && s.includes("mortgage"))) return "Financial Services";
    if (/(auto loan|auto finance|auto lending|repossession|repo|deficiency)\b/i.test(s)) return "Financial Services";
    if (/(insurance|policyholder|claim|underwriting)\b/i.test(s)) return "Financial Services";
    if (/(payments|paytech|merchant|wallet|remittance|acquiring)\b/i.test(s)) return "Financial Services";
    if (/(wealth|brokerage|asset management|securities)\b/i.test(s)) return "Financial Services";
    if (/(fintech|digital bank|neobank|lending platform)\b/i.test(s)) return "Financial Services";
    if (/(bank|credit union|treasury|deposit account|checking|savings)\b/i.test(s)) return "Financial Services";
    if (/(telecom|wireless|carrier|broadband|cable|isp)\b/i.test(s)) return "Telecommunications";
    if (/(software|saas|cloud|data center|semiconductor|hardware|devops|technology)\b/i.test(s)) return "Technology";
    if (/(retail|ecommerce|grocery|apparel|fashion|marketplace|omnichannel)\b/i.test(s)) return "Retail & eCommerce";
    if (/(healthcare|hospital|payer|provider|pharma|biotech|life sciences|emr)\b/i.test(s)) return "Healthcare & Life Sciences";
    if (/(airline|hotel|travel|hospitality|loyalty program|cruise)\b/i.test(s)) return "Travel & Hospitality";
    if (/(utility|energy|oil|gas|power|renewables)\b/i.test(s)) return "Utilities & Energy";
    if (/(media|entertainment|publishing|broadcast|ott|streaming|studio)\b/i.test(s)) return "Media & Entertainment";
    if (/(gaming|video game|game studio|player support)\b/i.test(s)) return "Gaming";
    if (/(government|public sector|federal|state|municipal)\b/i.test(s)) return "Government & Public Sector";
    if (/(education|edtech|university|school|k-12|higher ed)\b/i.test(s)) return "Education";
    if (/(logistics|transportation|shipping|delivery|3pl|last mile|fleet)\b/i.test(s)) return "Logistics & Transportation";
    if (/(manufacturing|industrial|factory|plant|assembly line)\b/i.test(s)) return "Manufacturing & Industrial";
    if (/(real estate|proptech|property management)\b/i.test(s)) return "Real Estate";
    if (/(consulting firm|law firm|legal services|accounting firm|professional services)\b/i.test(s)) return "Professional Services";
    const ind = clean(industryStr);
    return ind || "";
  };

  // ---------- Main computation ----------
  const heatmapData = useMemo(() => {
    const input = Array.isArray(caseStudies) ? caseStudies : [];
    if (input.length === 0) {
      return { matrix: [], industries: [], serviceSilos: SERVICE_SILOS, unnormalizedCount: 0, autoNormalized: 0, topIndustries: [], topSilos: [], industryMap: new Map(), siloMap: new Map() };
    }

    // Build enriched (auto-normalized) records on the fly
    let autoNormalized = 0;
    const enriched = input.map((cs) => {
      const clientIndustryRaw = pick(cs, FN.client_industry);
      const bc = pick(cs, FN.business_challenge);
      const sol = pick(cs, FN.solution_overview);
      const servicesProvided = pick(cs, FN.services_provided);

      // existing normalized services may be a string or array; coerce to array
      let servicesNormalized = toArray(pick(cs, FN.services_normalized));
      // If empty, detect via rules
      if (servicesNormalized.length === 0) {
        servicesNormalized = detectServiceSilos(servicesProvided, bc, sol);
        if (servicesNormalized.length > 0) autoNormalized++;
      }
      // Keep only canonical silos and unique
      const canonicalServices = Array.from(new Set(servicesNormalized.filter((s) => SERVICE_SILOS.includes(s))));

      // Industry L1 (normalized)
      let clientIndustryNorm = pick(cs, FN.client_industry_normalized);
      if (!clientIndustryNorm) {
        clientIndustryNorm = industryL1(clientIndustryRaw, bc);
        if (clientIndustryNorm) autoNormalized++;
      }

      return {
        ...cs,
        client_industry_normalized: clientIndustryNorm,
        services_normalized: canonicalServices,
      };
    });

    // Count how many still missing after enrichment
    const unresolved = enriched.filter((cs) => !cs.client_industry_normalized || !cs.services_normalized || cs.services_normalized.length === 0).length;

    // Use only fully normalized for heatmap, but report unresolved separately
    const normalizedCaseStudies = enriched.filter((cs) => cs.client_industry_normalized && Array.isArray(cs.services_normalized) && cs.services_normalized.length > 0);

    // Build counts
    const industryMap = new Map();
    const siloMap = new Map(SERVICE_SILOS.map((s) => [s, 0]));

    normalizedCaseStudies.forEach((cs) => {
      industryMap.set(cs.client_industry_normalized, (industryMap.get(cs.client_industry_normalized) || 0) + 1);
      cs.services_normalized.forEach((silo) => {
        if (SERVICE_SILOS.includes(silo)) siloMap.set(silo, (siloMap.get(silo) || 0) + 1);
      });
    });

    const industries = Array.from(industryMap.entries()).sort((a,b) => b[1]-a[1]).map(([name]) => name);
    const serviceSilos = SERVICE_SILOS; // always show all 10

    // Matrix rows
    const matrix = industries.map((industry) => {
      const row = { industry };
      let rowTotal = 0;
      serviceSilos.forEach((silo) => {
        const count = normalizedCaseStudies.filter((cs) => cs.client_industry_normalized === industry && cs.services_normalized.includes(silo)).length;
        row[silo] = count;
        rowTotal += count;
      });
      row._total = rowTotal;
      return row;
    });

    const topIndustries = Array.from(industryMap.entries()).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([industry,count])=>({industry,count}));
    const topSilos = Array.from(siloMap.entries()).filter(([,count])=>count>0).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([silo,count])=>({silo,count}));

    return { 
      matrix,
      industries,
      serviceSilos,
      unnormalizedCount: unresolved,
      autoNormalized,
      topIndustries,
      topSilos,
      industryMap,
      siloMap,
    };
  }, [caseStudies]);

  // ---------- UI ----------
  if (heatmapData.matrix.length === 0) {
    return (
      <Card className="shadow-xl border-slate-200 bg-white">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-slate-900 font-semibold mb-2">No normalized case study data available</p>
          <p className="text-slate-600 text-sm">
            {heatmapData.unnormalizedCount > 0 
              ? `${heatmapData.unnormalizedCount} case studies could not be auto-normalized. Add more detail (e.g., business_challenge) or run the taxonomy transformer.`
              : "No case study data found."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const getCellColor = (count) => {
    if (count === 0) return 'bg-slate-100 text-slate-400';
    if (count >= 10) return 'bg-green-600 text-white';
    if (count >= 5) return 'bg-teal-500 text-white';
    if (count >= 2) return 'bg-blue-500 text-white';
    return 'bg-amber-500 text-white';
  };

  return (
    <div className="space-y-6">
      {/* Normalization Notice */}
      {(heatmapData.autoNormalized > 0 || heatmapData.unnormalizedCount > 0) && (
        <Card className="shadow-lg border-slate-200 bg-slate-50">
          <CardContent className="p-4">
            <div className="flex flex-col gap-1 text-sm text-slate-800">
              {heatmapData.autoNormalized > 0 && (
                <div>
                  <span className="font-semibold">{heatmapData.autoNormalized}</span> case studies were <span className="font-semibold">auto-normalized</span> in this view using inline taxonomy rules.
                </div>
              )}
              {heatmapData.unnormalizedCount > 0 && (
                <div>
                  <span className="font-semibold">{heatmapData.unnormalizedCount}</span> case studies could not be normalized (missing signals). Consider enriching <em>business_challenge</em> or running the transformer.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-lg border-slate-200 bg-gradient-to-br from-green-50 to-teal-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Most Active Industries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {heatmapData.topIndustries.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{item.industry}</p>
                  </div>
                  <Badge className="bg-green-600 text-white">
                    {item.count} studies
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-slate-200 bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Most Active Service Silos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {heatmapData.topSilos.length > 0 ? (
                heatmapData.topSilos.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 text-sm">{item.silo}</p>
                    </div>
                    <Badge className="bg-purple-600 text-white">
                      {item.count} studies
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600 italic p-3">No service silo data available.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Industry x Service Silo Heatmap */}
      <Card className="shadow-xl border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-xl text-slate-900">Industry Activity Heatmap (by Service Silo)</CardTitle>
          <CardDescription>Case study volume by normalized industry and 10 service silos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300">
                  <th className="text-left p-3 text-xs font-semibold text-slate-900 sticky left-0 bg-white border-r-2 border-slate-300 min-w-[180px]">
                    Industry
                    <div className="text-[10px] font-normal text-slate-600 mt-0.5">(sorted by volume)</div>
                  </th>
                  {heatmapData.serviceSilos.map((silo, idx) => (
                    <th key={idx} className="text-center p-2 text-xs font-semibold text-slate-900 min-w-[120px]">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-center leading-tight">{silo}</span>
                        <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-900 border-purple-300">
                          {heatmapData.siloMap.get(silo) || 0} total
                        </Badge>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmapData.matrix.map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-3 text-sm sticky left-0 bg-white border-r-2 border-slate-200">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-slate-900">{row.industry}</span>
                        <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-700 border-slate-300">
                          {heatmapData.industryMap.get(row.industry)}
                        </Badge>
                      </div>
                    </td>
                    {heatmapData.serviceSilos.map((silo, colIdx) => {
                      const count = row[silo] || 0;
                      return (
                        <td key={colIdx} className="p-1 text-center">
                          <div className={`rounded px-2 py-1 text-xs font-semibold ${getCellColor(count)}`}>
                            {count || '-'}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-4 text-xs flex-wrap">
            <span className="font-semibold text-slate-700">Legend:</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-slate-100 border border-slate-300 rounded"></div>
              <span className="text-slate-700">0 studies</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-amber-500 rounded"></div>
              <span className="text-slate-700">1 study</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-slate-700">2-4 studies</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-teal-500 rounded"></div>
              <span className="text-slate-700">5-9 studies</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span className="text-slate-700">10+ studies</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}