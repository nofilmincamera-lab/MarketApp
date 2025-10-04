import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Target, TrendingUp, AlertCircle } from "lucide-react";
import { transformCaseStudies, SERVICE_SILOS } from './taxonomyUtils';

export default function ExecutiveRoadmap({ caseStudies }) {
  const roadmapData = useMemo(() => {
    const { enriched, stats } = transformCaseStudies(caseStudies);
    
    const normalizedCaseStudies = enriched.filter(cs => 
      cs.client_industry_normalized && 
      cs.services_normalized && 
      cs.services_normalized.length > 0
    );

    const industryMap = new Map();
    const siloMap = new Map(SERVICE_SILOS.map(s => [s, 0]));

    normalizedCaseStudies.forEach(cs => {
      industryMap.set(cs.client_industry_normalized, (industryMap.get(cs.client_industry_normalized) || 0) + 1);
      cs.services_normalized.forEach(silo => {
        if (SERVICE_SILOS.includes(silo)) siloMap.set(silo, (siloMap.get(silo) || 0) + 1);
      });
    });

    const industries = Array.from(industryMap.entries()).sort((a,b) => a[1]-b[1]).map(([industry, count]) => {
      const industryCS = normalizedCaseStudies.filter(cs => cs.client_industry_normalized === industry);
      const serviceCounts = new Map();
      industryCS.forEach(cs => {
        cs.services_normalized.forEach(s => {
          if (SERVICE_SILOS.includes(s)) serviceCounts.set(s, (serviceCounts.get(s) || 0) + 1);
        });
      });
      const presentServices = new Set(serviceCounts.keys());
      const missingServices = SERVICE_SILOS.filter(s => !presentServices.has(s));
      
      return {
        industry,
        totalCaseStudies: count,
        providerCount: new Set(industryCS.map(cs => cs.bpo_provider)).size,
        presentServices: Array.from(serviceCounts.entries()).map(([s, c]) => ({ service: s, count: c })),
        missingServices: missingServices.slice(0, 3)
      };
    });

    const underservedIndustries = industries.slice(0, 5);

    const topOpportunities = underservedIndustries.map((industry, idx) => {
      const priority = idx === 0 ? 'High' : idx === 1 ? 'High' : 'Medium';
      return {
        rank: idx + 1,
        industry: industry.industry,
        priority,
        caseStudyCount: industry.totalCaseStudies,
        providerCount: industry.providerCount,
        whitespaceServices: industry.missingServices,
        rationale: `Only ${industry.totalCaseStudies} case studies from ${industry.providerCount} provider(s). ${
          industry.missingServices.length > 0
            ? `Key service silo gaps: ${industry.missingServices.join(', ')}.`
            : 'Limited service coverage documented.'
        }`
      };
    });

    return { 
      topOpportunities, 
      autoNormalized: stats.autoNormalized,
      unnormalizedCount: stats.unresolved 
    };
  }, [caseStudies]);

  if (roadmapData.topOpportunities.length === 0) {
    return (
      <Card className="shadow-xl border-[#2B3648] bg-[#1B2230]">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-[#F8F9FA] font-semibold mb-2">No normalized data available</p>
          <p className="text-[#A0AEC0] text-sm">
            {roadmapData.unnormalizedCount > 0 
              ? `${roadmapData.unnormalizedCount} case studies need taxonomy normalization.`
              : "No case study data found."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Normalization Warning */}
      {roadmapData.unnormalizedCount > 0 && (
        <Card className="shadow-lg border-amber-500/30 bg-amber-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-300" />
              <p className="text-sm text-amber-100">
                <strong>{roadmapData.unnormalizedCount} case studies</strong> are not yet normalized and excluded from this report. 
                {roadmapData.autoNormalized > 0 && <span> <strong>{roadmapData.autoNormalized}</strong> were auto-normalized.</span>}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-xl border-[#2B3648] bg-[#1B2230]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl text-[#F8F9FA]">
            <Lightbulb className="w-7 h-7 text-[#E8FF66]" />
            Executive Roadmap: Strategic Whitespace Opportunities
          </CardTitle>
          <CardDescription className="text-base text-[#A0AEC0]">
            Top normalized industries with low competition and high service gap potential
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {roadmapData.topOpportunities.map((opp, idx) => (
              <div key={idx} className={`p-6 rounded-xl border-2 ${
                opp.priority === 'High' ? 'bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-amber-500/30' : 'bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-[#20A4F3]/30'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      opp.priority === 'High' ? 'bg-amber-600' : 'bg-[#20A4F3]'
                    }`}>
                      <span className="text-2xl font-bold text-white">#{opp.rank}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#F8F9FA]">{opp.industry}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge className={`${
                          opp.priority === 'High' ? 'bg-amber-600' : 'bg-[#20A4F3]'
                        } text-white`}>
                          {opp.priority} Priority
                        </Badge>
                        <Badge variant="outline" className="bg-[#20293A] text-[#F8F9FA] border-[#2B3648]">
                          {opp.caseStudyCount} case studies
                        </Badge>
                        <Badge variant="outline" className="bg-[#20293A] text-[#F8F9FA] border-[#2B3648]">
                          {opp.providerCount} providers
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Target className={`w-8 h-8 ${
                    opp.priority === 'High' ? 'text-amber-400' : 'text-[#20A4F3]'
                  }`} />
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-[#A0AEC0] mb-1">Strategic Rationale:</p>
                    <p className="text-sm text-[#F8F9FA] leading-relaxed">{opp.rationale}</p>
                  </div>

                  {opp.whitespaceServices.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-[#A0AEC0] mb-2">Whitespace Service Opportunities:</p>
                      <div className="flex flex-wrap gap-2">
                        {opp.whitespaceServices.map((service, sIdx) => (
                          <Badge key={sIdx} className="bg-[#7D5FFF] text-white px-3 py-1">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Strategic Summary */}
          <div className="mt-8 p-6 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-xl border-2 border-[#7D5FFF]/30">
            <div className="flex items-start gap-4">
              <TrendingUp className="w-8 h-8 text-[#7D5FFF] flex-shrink-0" />
              <div>
                <h4 className="text-lg font-bold text-[#F8F9FA] mb-3">Next Steps</h4>
                <ul className="space-y-2 text-sm text-[#F8F9FA]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#7D5FFF] mt-1">1.</span>
                    <span><strong>Prioritize industry {roadmapData.topOpportunities[0]?.industry}:</strong> Lowest competition ({roadmapData.topOpportunities[0]?.caseStudyCount} studies) with clear service gaps.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#7D5FFF] mt-1">2.</span>
                    <span><strong>Develop targeted solutions:</strong> Focus on whitespace services where competitors haven't established thought leadership.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#7D5FFF] mt-1">3.</span>
                    <span><strong>Create case studies:</strong> Be first-to-market with success stories in these underserved industries.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}