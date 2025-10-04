import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Target, DollarSign, Users, ClipboardCheck, FileText, 
  AlertCircle, UserCheck, TrendingUp, CheckCircle2, AlertTriangle 
} from "lucide-react";

// ===== Example placeholder data =====
const EXAMPLE_DATA = {
  metrics: [
    {
      service_name: "Customer Service Transformation",
      line_of_business: "Customer Support",
      quantifiable_value: "Reduce average handle time by 20% resulting in $1.5M annual savings and improve CSAT from 72% to 85%.",
      rationale: "Implementing AI-driven self-service and optimized agent workflows to streamline customer interactions and improve efficiency."
    }
  ],
  economicBuyers: [
    {
      name: "Jane Doe",
      title: "Chief Operating Officer",
      rationale: "Oversees all customer-facing operations and has budget authority for multi-million dollar BPO contracts."
    }
  ],
  decisionCriteria: [
    {
      criterion: "Scalability and Flexibility",
      description: "Vendor's ability to quickly scale operations up or down to match seasonal demand fluctuations."
    }
  ],
  decisionProcess: {
    typical_process: "Starts with RFI/RFP issuance, followed by vendor presentations and demos, pilot program with 2-3 finalists.",
    average_timeline: "6-9 months from RFI to contract signature",
    key_stages: ["RFI issuance", "Proposal review and shortlisting", "Vendor presentations", "Pilot phase", "Contract negotiation"]
  },
  paperProcess: {
    regulatory_considerations: ["GDPR Compliance for EU operations", "SOC 2 Type II audit requirements"],
    typical_contract_terms: "3-year master services agreement with annual volume commitments.",
    legal_hurdles: ["Data privacy and cross-border data transfer agreements", "Right-to-audit clauses"]
  },
  painPoints: [
    {
      pain: "High Customer Churn Rate",
      impact: "Current churn rate of 18% annually, resulting in approximately $8.5M in lost recurring revenue.",
      consequence_of_inaction: "Continued market share erosion and damage to brand reputation."
    }
  ],
  champions: [
    {
      name: "John Smith",
      title: "VP of Customer Experience",
      motivation: "Recently hired with a mandate to transform customer service and reduce operational costs by 15%.",
      influence_level: "high",
      access_to_economic_buyer: "Directly reports to the COO (Jane Doe)."
    }
  ],
  currentProviders: [
    {
      provider_name: "Competitor BPO Inc.",
      service_area: "Tier 1 Customer Support (phone and chat)",
      source: "Public news release, Q4 2023"
    }
  ]
};

// ===== helpers =====
function asArray(v) { return Array.isArray(v) ? v : v ? [v] : []; }
function hasAnyContent(ds) {
  return (
    (ds.metrics?.length ?? 0) +
    (ds.economicBuyers?.length ?? 0) +
    (ds.decisionCriteria?.length ?? 0) +
    (asArray(ds.decisionProcess?.key_stages).length) +
    (asArray(ds.paperProcess?.regulatory_considerations).length) +
    (ds.painPoints?.length ?? 0) +
    (ds.champions?.length ?? 0) +
    (ds.currentProviders?.length ?? 0)
  ) > 0;
}

export default function MEDDPICCAnalysis({
  companyProfile,
  strategicOverview,
  leadershipChanges,
  meddpiccEnabled = true,
  className = "",
}) {
  // Build "real" datasource safely
  const realData = useMemo(() => ({
    metrics: asArray(strategicOverview?.growth_potential?.whitespace_opportunities),
    economicBuyers: asArray(companyProfile?.economic_buyers),
    decisionCriteria: asArray(strategicOverview?.client_priorities?.decision_criteria),
    decisionProcess: strategicOverview?.decision_process || null,
    paperProcess: strategicOverview?.paper_process || null,
    painPoints: asArray(strategicOverview?.cx_health?.pain_points),
    champions: asArray(leadershipChanges?.potential_champions),
    currentProviders: asArray(strategicOverview?.competitive_pressures?.current_bpo_providers),
  }), [companyProfile, strategicOverview, leadershipChanges]);

  const showPlaceholder = !meddpiccEnabled || !hasAnyContent(realData);
  const dataSource = showPlaceholder ? EXAMPLE_DATA : realData;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Destructive alert (dark) */}
      {showPlaceholder && (
        <Alert variant="destructive" className="bg-red-900/60 border border-red-700 text-red-100">
          <AlertTriangle className="h-5 w-5 text-red-300" />
          <AlertTitle className="font-bold text-red-100">
            MEDDPICC Analysis Disabled — Showing Example Data
          </AlertTitle>
          <AlertDescription className="text-red-200">
            MEDDPICC is disabled or no insights were generated. The sections below are example placeholders.
            Enable MEDDPICC and re-run to populate real data.
          </AlertDescription>
        </Alert>
      )}

      {/* Metrics */}
      <Card className="shadow-lg border border-slate-700 bg-slate-900">
        <CardHeader className="border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
          <CardTitle className="flex items-center gap-3 text-xl text-slate-100">
            <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            Metrics — Quantifiable Value & ROI
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {dataSource.metrics?.length ? (
            <div className="space-y-4">
              <p className="text-slate-300 mb-4">
                Quantifiable business impact opportunities identified for this prospect:
              </p>
              {dataSource.metrics.map((opp, idx) => (
                <div key={idx} className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="font-semibold text-slate-100">{opp.service_name}</p>
                    {opp.line_of_business && (
                      <Badge className="bg-emerald-600 text-white border-0">{opp.line_of_business}</Badge>
                    )}
                  </div>
                  {opp.quantifiable_value && (
                    <div className="p-3 bg-slate-900 rounded-md border border-emerald-700/50 mb-2">
                      <p className="text-[10px] font-semibold text-emerald-300 uppercase tracking-wide mb-1">
                        💰 Quantifiable Value
                      </p>
                      <p className="text-sm font-medium text-slate-100">{opp.quantifiable_value}</p>
                    </div>
                  )}
                  {opp.rationale && <p className="text-sm text-slate-300">{opp.rationale}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 italic">No quantifiable metrics available.</p>
          )}
        </CardContent>
      </Card>

      {/* Economic Buyer */}
      <Card className="shadow-lg border border-slate-700 bg-slate-900">
        <CardHeader className="border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
          <CardTitle className="flex items-center gap-3 text-xl text-slate-100">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            Economic Buyer — Budget Authority
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {dataSource.economicBuyers?.length ? (
            <div className="space-y-3">
              <p className="text-slate-300 mb-4">Identified executives with P&L authority for BPO services:</p>
              {dataSource.economicBuyers.map((buyer, idx) => (
                <div key={idx} className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-semibold text-slate-100">{buyer.name}</p>
                      {buyer.title && <p className="text-sm text-slate-300">{buyer.title}</p>}
                    </div>
                    <Badge className="bg-blue-600 text-white border-0">Economic Buyer</Badge>
                  </div>
                  {buyer.rationale && <p className="text-sm text-slate-300 mt-2">{buyer.rationale}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 italic">No economic buyers identified.</p>
          )}
        </CardContent>
      </Card>

      {/* Decision Criteria */}
      <Card className="shadow-lg border border-slate-700 bg-slate-900">
        <CardHeader className="border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
          <CardTitle className="flex items-center gap-3 text-xl text-slate-100">
            <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-white" />
            </div>
            Decision Criteria — Evaluation Factors
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {dataSource.decisionCriteria?.length ? (
            <div className="space-y-3">
              <p className="text-slate-300 mb-4">Likely criteria when evaluating vendors:</p>
              {dataSource.decisionCriteria.map((criteria, idx) => (
                <div key={idx} className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-300 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-100 mb-1">{criteria.criterion}</p>
                      {criteria.description && <p className="text-sm text-slate-300">{criteria.description}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 italic">No decision criteria available.</p>
          )}
        </CardContent>
      </Card>

      {/* Decision Process */}
      <Card className="shadow-lg border border-slate-700 bg-slate-900">
        <CardHeader className="border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
          <CardTitle className="flex items-center gap-3 text-xl text-slate-100">
            <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            Decision Process — Steps & Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {dataSource.decisionProcess ? (
            <div className="space-y-4">
              {dataSource.decisionProcess.typical_process && (
                <div>
                  <p className="font-semibold text-slate-100 mb-2">Typical Process:</p>
                  <p className="text-slate-300">{dataSource.decisionProcess.typical_process}</p>
                </div>
              )}
              {dataSource.decisionProcess.average_timeline && (
                <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                  <p className="font-semibold text-amber-200 mb-1">⏱️ Timeline:</p>
                  <p className="text-sm text-slate-300">{dataSource.decisionProcess.average_timeline}</p>
                </div>
              )}
              {asArray(dataSource.decisionProcess.key_stages).length > 0 && (
                <div>
                  <p className="font-semibold text-slate-100 mb-2">Key Stages:</p>
                  <div className="space-y-2">
                    {asArray(dataSource.decisionProcess.key_stages).map((stage, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-amber-900/50 border border-amber-700 flex items-center justify-center text-xs font-bold text-amber-200">
                          {idx + 1}
                        </div>
                        <p className="text-sm text-slate-300">{stage}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-400 italic">No decision process available.</p>
          )}
        </CardContent>
      </Card>

      {/* Paper Process */}
      <Card className="shadow-lg border border-slate-700 bg-slate-900">
        <CardHeader className="border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
          <CardTitle className="flex items-center gap-3 text-xl text-slate-100">
            <div className="w-10 h-10 rounded-lg bg-slate-500 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            Paper Process — Legal & Contractual
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {dataSource.paperProcess ? (
            <div className="space-y-4">
              {asArray(dataSource.paperProcess.regulatory_considerations).length > 0 && (
                <div>
                  <p className="font-semibold text-slate-100 mb-2">Regulatory Considerations:</p>
                  <div className="space-y-2">
                    {asArray(dataSource.paperProcess.regulatory_considerations).map((item, idx) => (
                      <div key={idx} className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                        <p className="text-sm text-slate-300">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {dataSource.paperProcess.typical_contract_terms && (
                <div>
                  <p className="font-semibold text-slate-100 mb-2">Typical Contract Terms:</p>
                  <p className="text-slate-300">{dataSource.paperProcess.typical_contract_terms}</p>
                </div>
              )}
              {asArray(dataSource.paperProcess.legal_hurdles).length > 0 && (
                <div>
                  <p className="font-semibold text-slate-100 mb-2">Potential Legal Hurdles:</p>
                  <div className="space-y-2">
                    {asArray(dataSource.paperProcess.legal_hurdles).map((hurdle, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-300">{hurdle}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-400 italic">No paper process details available.</p>
          )}
        </CardContent>
      </Card>

      {/* Identify Pain */}
      <Card className="shadow-lg border border-slate-700 bg-slate-900">
        <CardHeader className="border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
          <CardTitle className="flex items-center gap-3 text-xl text-slate-100">
            <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            Identify Pain — Challenges & Consequences
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {dataSource.painPoints?.length ? (
            <div className="space-y-4">
              <p className="text-slate-300 mb-4">
                Current challenges and the business impact if left unaddressed:
              </p>
              {dataSource.painPoints.map((painPoint, idx) => (
                <div key={idx} className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="mb-3">
                    <p className="font-semibold text-red-300 mb-1">🔴 Pain Point:</p>
                    <p className="text-slate-300">{typeof painPoint === 'string' ? painPoint : painPoint.pain}</p>
                  </div>
                  {typeof painPoint !== 'string' && painPoint.impact && (
                    <div className="mb-3 p-3 bg-slate-900 rounded-md border border-red-700/50">
                      <p className="text-[10px] font-semibold text-red-300 uppercase tracking-wide mb-1">
                        Current Impact:
                      </p>
                      <p className="text-sm text-slate-300">{painPoint.impact}</p>
                    </div>
                  )}
                  {typeof painPoint !== 'string' && painPoint.consequence_of_inaction && (
                    <div className="p-3 bg-slate-900 rounded-md border border-red-700/50">
                      <p className="text-[10px] font-semibold text-red-300 uppercase tracking-wide mb-1">
                        ⚠️ Consequence of Inaction:
                      </p>
                      <p className="text-sm text-slate-300">{painPoint.consequence_of_inaction}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 italic">No pain points identified.</p>
          )}
        </CardContent>
      </Card>

      {/* Champion */}
      <Card className="shadow-lg border border-slate-700 bg-slate-900">
        <CardHeader className="border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
          <CardTitle className="flex items-center gap-3 text-xl text-slate-100">
            <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            Champion — Internal Advocates
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {dataSource.champions?.length ? (
            <div className="space-y-3">
              <p className="text-slate-300 mb-4">
                Executives who could serve as internal champions for BPO initiatives:
              </p>
              {dataSource.champions.map((champion, idx) => (
                <div key={idx} className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-semibold text-slate-100">{champion.name}</p>
                      <p className="text-sm text-slate-300">{champion.title}</p>
                    </div>
                    <Badge className={
                      champion.influence_level === 'high' ? 'bg-green-600 text-white border-0' :
                      champion.influence_level === 'medium' ? 'bg-green-500 text-white border-0' :
                      'bg-green-400 text-white border-0'
                    }>
                      {champion.influence_level} influence
                    </Badge>
                  </div>
                  <div className="space-y-2 mt-3">
                    <div className="p-2 bg-slate-900 rounded border border-slate-700">
                      <p className="text-xs font-semibold text-green-300 uppercase tracking-wide mb-1">Motivation:</p>
                      <p className="text-sm text-slate-300">{champion.motivation}</p>
                    </div>
                    {champion.access_to_economic_buyer && (
                      <div className="p-2 bg-slate-900 rounded border border-slate-700">
                        <p className="text-xs font-semibold text-green-300 uppercase tracking-wide mb-1">Access to Economic Buyer:</p>
                        <p className="text-sm text-slate-300">{champion.access_to_economic_buyer}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 italic">No champion data available.</p>
          )}
        </CardContent>
      </Card>

      {/* Competition */}
      <Card className="shadow-lg border border-slate-700 bg-slate-900">
        <CardHeader className="border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
          <CardTitle className="flex items-center gap-3 text-xl text-slate-100">
            <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            Competition — Current Vendors & Alternatives
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {dataSource.currentProviders?.length ? (
            <div className="space-y-4">
              <p className="text-slate-300 mb-4">
                Known BPO providers and vendors currently engaged with or evaluated by this prospect:
              </p>
              {dataSource.currentProviders.map((provider, idx) => (
                <div key={idx} className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="font-semibold text-slate-100">{provider.provider_name}</p>
                    <Badge variant="outline" className="bg-slate-700 text-slate-200 border-slate-600">
                      {provider.service_area}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-300">{provider.source}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 italic">No competition data available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}