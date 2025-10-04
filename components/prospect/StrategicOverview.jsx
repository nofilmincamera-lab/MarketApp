
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, Target, DollarSign, Lightbulb, Activity, FileText, Users } from "lucide-react";

export default function StrategicOverview({ data }) {
  if (!data || typeof data !== 'object') {
    return (
      <Card className="shadow-xl border-slate-200 bg-white">
        <CardContent className="p-8 text-center">
          <p className="text-slate-600">No strategic data available. Re-run the analysis to generate insights.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Industry Landscape */}
      {data.industry_landscape && (
        <Card className="shadow-xl border-slate-200 bg-white">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="flex items-center gap-3 text-xl text-slate-900">
              <TrendingUp className="w-6 h-6 text-teal-600" />
              Industry Landscape
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {data.industry_landscape.summary && (
              <p className="text-slate-800 mb-4 leading-relaxed">{data.industry_landscape.summary}</p>
            )}
            {data.industry_landscape.trends && data.industry_landscape.trends.length > 0 && (
              <div>
                <p className="font-semibold text-slate-900 mb-2">Key Trends:</p>
                <ul className="space-y-2">
                  {data.industry_landscape.trends.map((trend, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-800">
                      <span className="text-teal-600 mt-1">•</span>
                      <span>{trend}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Client Priorities */}
      {data.client_priorities && (
        <Card className="shadow-xl border-slate-200 bg-white">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="flex items-center gap-3 text-xl text-slate-900">
              <Target className="w-6 h-6 text-blue-600" />
              Client Priorities & Decision Criteria
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {data.client_priorities.summary && (
              <p className="text-slate-800 mb-4 leading-relaxed">{data.client_priorities.summary}</p>
            )}
            
            {data.client_priorities.priorities && data.client_priorities.priorities.length > 0 && (
              <div className="mb-4">
                <p className="font-semibold text-slate-900 mb-2">Strategic Priorities:</p>
                <div className="space-y-2">
                  {data.client_priorities.priorities.map((priority, idx) => (
                    <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-slate-900">{priority}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.client_priorities.decision_criteria && data.client_priorities.decision_criteria.length > 0 && (
              <div className="mt-4 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                <p className="font-semibold text-purple-900 mb-3">🎯 Decision Criteria (How They Evaluate Vendors):</p>
                <div className="space-y-2">
                  {data.client_priorities.decision_criteria.map((criteria, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-lg border border-purple-200">
                      <p className="font-semibold text-slate-900 mb-1">{criteria.criterion}</p>
                      <p className="text-sm text-slate-700">{criteria.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Competitive Pressures */}
      {data.competitive_pressures && (
        <Card className="shadow-xl border-slate-200 bg-white">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="flex items-center gap-3 text-xl text-slate-900">
              <Users className="w-6 h-6 text-amber-600" />
              Competitive Landscape
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {data.competitive_pressures.summary && (
              <p className="text-slate-800 mb-4 leading-relaxed">{data.competitive_pressures.summary}</p>
            )}

            {data.competitive_pressures.current_bpo_providers && data.competitive_pressures.current_bpo_providers.length > 0 && (
              <div className="mb-6 p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                <p className="font-semibold text-orange-900 mb-3">🔍 Known BPO/CX Vendors:</p>
                <div className="space-y-2">
                  {data.competitive_pressures.current_bpo_providers.map((provider, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-lg border border-orange-200">
                      <p className="font-semibold text-slate-900">{provider.provider_name}</p>
                      {provider.service_area && <p className="text-sm text-slate-700 mt-1">{provider.service_area}</p>}
                      {provider.source && <p className="text-xs text-slate-600 mt-1">Source: {provider.source}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.competitive_pressures.competitors && data.competitive_pressures.competitors.length > 0 && (
              <div>
                <p className="font-semibold text-slate-900 mb-3">Market Competitors:</p>
                <div className="space-y-2">
                  {data.competitive_pressures.competitors.map((competitor, idx) => (
                    <div key={idx} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="font-semibold text-slate-900">{competitor.name}</p>
                      {competitor.cx_differentiation && (
                        <p className="text-sm text-slate-800 mt-1">{competitor.cx_differentiation}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* CX Health */}
      {data.cx_health && (
        <Card className="shadow-xl border-slate-200 bg-white">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="flex items-center gap-3 text-xl text-slate-900">
              <Activity className="w-6 h-6 text-emerald-600" />
              CX Health Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {data.cx_health.summary && (
              <p className="text-slate-800 mb-4 leading-relaxed">{data.cx_health.summary}</p>
            )}
            
            <div className="grid md:grid-cols-2 gap-4">
              {data.cx_health.strengths && data.cx_health.strengths.length > 0 && (
                <div>
                  <p className="font-semibold text-emerald-900 mb-2">✓ Strengths:</p>
                  <div className="space-y-1">
                    {data.cx_health.strengths.map((strength, idx) => (
                      <div key={idx} className="p-2 bg-emerald-50 rounded text-sm text-slate-800">
                        {strength}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.cx_health.pain_points && data.cx_health.pain_points.length > 0 && (
                <div>
                  <p className="font-semibold text-red-900 mb-2">⚠️ Pain Points:</p>
                  <div className="space-y-2">
                    {data.cx_health.pain_points.map((painPoint, idx) => (
                      <div key={idx} className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm font-semibold text-slate-900">
                          {typeof painPoint === 'string' ? painPoint : painPoint.pain}
                        </p>
                        {typeof painPoint !== 'string' && painPoint.impact && (
                          <p className="text-xs text-red-700 mt-1"><strong>Impact:</strong> {painPoint.impact}</p>
                        )}
                        {typeof painPoint !== 'string' && painPoint.consequence_of_inaction && (
                          <p className="text-xs text-red-800 mt-1 italic">
                            <strong>If unaddressed:</strong> {painPoint.consequence_of_inaction}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CX Metrics */}
      {data.cx_metrics && data.cx_metrics.metrics && data.cx_metrics.metrics.length > 0 && (
        <Card className="shadow-xl border-slate-200 bg-white">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="flex items-center gap-3 text-xl text-slate-900">
              <Activity className="w-6 h-6 text-purple-600" />
              CX Metrics & KPIs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {data.cx_metrics.summary && (
              <p className="text-slate-800 mb-4 leading-relaxed">{data.cx_metrics.summary}</p>
            )}
            <div className="grid gap-3">
              {data.cx_metrics.metrics.map((metric, idx) => {
                const isStrength = metric.assessment === 'strength';
                const isWeakness = metric.assessment === 'weakness';
                const bgColor = isStrength ? 'bg-emerald-50 border-emerald-200' : 
                               isWeakness ? 'bg-red-50 border-red-200' : 
                               'bg-slate-50 border-slate-200';
                
                return (
                  <div key={idx} className={`p-4 rounded-lg border ${bgColor}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 mb-1">{metric.metric_name}</p>
                        <p className="text-sm text-slate-800 mb-1">{metric.value}</p>
                        {metric.source && <p className="text-xs text-slate-600">Source: {metric.source}</p>}
                      </div>
                      {metric.assessment && metric.assessment !== 'not_available' && metric.assessment !== 'neutral' && (
                        <Badge className={isStrength ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}>
                          {metric.assessment}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Health */}
      {data.financial_health && (
        <Card className="shadow-xl border-slate-200 bg-white">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="flex items-center gap-3 text-xl text-slate-900">
              <DollarSign className="w-6 h-6 text-emerald-600" />
              Financial Health
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {data.financial_health.summary && (
              <p className="text-slate-800 mb-4 leading-relaxed">{data.financial_health.summary}</p>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              {data.financial_health.positive_signals && data.financial_health.positive_signals.length > 0 && (
                <div>
                  <p className="font-semibold text-emerald-900 mb-2">Positive Signals:</p>
                  <div className="space-y-1">
                    {data.financial_health.positive_signals.map((signal, idx) => (
                      <div key={idx} className="p-2 bg-emerald-50 rounded text-sm text-slate-800">
                        + {signal}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {data.financial_health.challenges && data.financial_health.challenges.length > 0 && (
                <div>
                  <p className="font-semibold text-red-900 mb-2">Challenges:</p>
                  <div className="space-y-1">
                    {data.financial_health.challenges.map((challenge, idx) => (
                      <div key={idx} className="p-2 bg-red-50 rounded text-sm text-slate-800">
                        − {challenge}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Decision & Paper Process */}
      {(data.decision_process || data.paper_process) && (
        <div className="grid md:grid-cols-2 gap-6">
          {data.decision_process && (
            <Card className="shadow-xl border-slate-200 bg-white">
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="flex items-center gap-3 text-lg text-slate-900">
                  <Target className="w-5 h-5 text-blue-600" />
                  Decision Process
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {data.decision_process.typical_process && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Process:</p>
                    <p className="text-sm text-slate-800">{data.decision_process.typical_process}</p>
                  </div>
                )}
                {data.decision_process.average_timeline && (
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <p className="text-xs font-semibold text-blue-700 mb-1">Timeline:</p>
                    <p className="text-sm text-slate-800">{data.decision_process.average_timeline}</p>
                  </div>
                )}
                {data.decision_process.key_stages && data.decision_process.key_stages.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Key Stages:</p>
                    {data.decision_process.key_stages.map((stage, idx) => (
                      <div key={idx} className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-900">
                          {idx + 1}
                        </div>
                        <p className="text-xs text-slate-700">{stage}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {data.paper_process && (
            <Card className="shadow-xl border-slate-200 bg-white">
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="flex items-center gap-3 text-lg text-slate-900">
                  <FileText className="w-5 h-5 text-slate-600" />
                  Paper Process
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {data.paper_process.regulatory_considerations && data.paper_process.regulatory_considerations.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Regulatory:</p>
                    {data.paper_process.regulatory_considerations.map((item, idx) => (
                      <div key={idx} className="p-2 bg-slate-50 rounded text-xs text-slate-700 mb-1">
                        {item}
                      </div>
                    ))}
                  </div>
                )}
                {data.paper_process.typical_contract_terms && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Contract Terms:</p>
                    <p className="text-sm text-slate-800">{data.paper_process.typical_contract_terms}</p>
                  </div>
                )}
                {data.paper_process.legal_hurdles && data.paper_process.legal_hurdles.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Legal Considerations:</p>
                    {data.paper_process.legal_hurdles.map((hurdle, idx) => (
                      <p key={idx} className="text-xs text-slate-700 mb-1">• {hurdle}</p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Growth Potential */}
      {data.growth_potential && (
        <Card className="shadow-xl border-slate-200 bg-white">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="flex items-center gap-3 text-xl text-slate-900">
              <Lightbulb className="w-6 h-6 text-amber-500" />
              Growth Potential & Whitespace
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {data.growth_potential.summary && (
              <p className="text-slate-800 mb-4 leading-relaxed">{data.growth_potential.summary}</p>
            )}
            
            {data.growth_potential.current_scope_summary && (
              <div className="mb-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
                <p className="font-semibold text-teal-900 mb-2">Current Scope:</p>
                <p className="text-sm text-slate-900">{data.growth_potential.current_scope_summary}</p>
              </div>
            )}

            {data.growth_potential.whitespace_opportunities && data.growth_potential.whitespace_opportunities.length > 0 && (
              <div>
                <p className="font-semibold text-slate-900 mb-3">Strategic Expansion Opportunities:</p>
                <div className="space-y-3">
                  {data.growth_potential.whitespace_opportunities.map((opp, idx) => (
                    <div key={idx} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="font-semibold text-slate-900">{opp.service_name}</p>
                        <Badge className="bg-purple-600 text-white">{opp.line_of_business}</Badge>
                      </div>
                      {opp.quantifiable_value && (
                        <div className="p-3 bg-white rounded-md border-2 border-emerald-300 mb-2">
                          <p className="text-xs font-semibold text-emerald-700 uppercase">💰 Value:</p>
                          <p className="text-sm font-medium text-slate-900">{opp.quantifiable_value}</p>
                        </div>
                      )}
                      <p className="text-sm text-slate-800 leading-relaxed">{opp.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
