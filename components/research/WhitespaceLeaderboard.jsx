import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingDown, AlertCircle } from "lucide-react";
import { transformCaseStudies, SERVICE_SILOS } from './taxonomyUtils';

export default function WhitespaceLeaderboard({ caseStudies }) {
  const whitespaceData = useMemo(() => {
    const { enriched, stats } = transformCaseStudies(caseStudies);
    
    // Use only fully normalized
    const normalizedCaseStudies = enriched.filter(cs => 
      cs.client_industry_normalized && 
      Array.isArray(cs.services_normalized) && 
      cs.services_normalized.length > 0
    );

    // Group by NORMALIZED industry
    const industryMap = new Map();

    normalizedCaseStudies.forEach(cs => {
      const industry = cs.client_industry_normalized;
      const services = cs.services_normalized;
      
      if (!industryMap.has(industry)) {
        industryMap.set(industry, {
          totalCaseStudies: 0,
          providers: new Set(),
          services: new Map()
        });
      }

      const data = industryMap.get(industry);
      data.totalCaseStudies++;
      data.providers.add(cs.bpo_provider);

      services.forEach(service => {
        if (service && SERVICE_SILOS.includes(service)) {
          data.services.set(service, (data.services.get(service) || 0) + 1);
        }
      });
    });

    // Convert to array and calculate missing services
    const industries = Array.from(industryMap.entries()).map(([industry, data]) => {
      const serviceArray = Array.from(data.services.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      const presentServices = new Set(data.services.keys());
      const missingServices = SERVICE_SILOS.filter(s => !presentServices.has(s)).slice(0, 3);

      return {
        industry,
        totalCaseStudies: data.totalCaseStudies,
        providerCount: data.providers.size,
        topServices: serviceArray.map(([service, count]) => ({ service, count })),
        missingServices
      };
    });

    // Sort by total case studies (ascending) to find whitespace
    industries.sort((a, b) => a.totalCaseStudies - b.totalCaseStudies);

    return { 
      industries, 
      autoNormalized: stats.autoNormalized,
      unnormalizedCount: stats.unresolved 
    };
  }, [caseStudies]);

  if (whitespaceData.industries.length === 0) {
    return (
      <Card className="shadow-xl border-[#2B3648] bg-[#1B2230]">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-[#F8F9FA] font-semibold mb-2">No normalized data available</p>
          <p className="text-[#A0AEC0] text-sm">
            {whitespaceData.unnormalizedCount > 0 
              ? `${whitespaceData.unnormalizedCount} case studies could not be auto-normalized.`
              : "No case study data found."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const topWhitespace = whitespaceData.industries.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Normalization Notice */}
      {(whitespaceData.autoNormalized > 0 || whitespaceData.unnormalizedCount > 0) && (
        <Card className="shadow-lg border-[#2B3648] bg-[#20293A]">
          <CardContent className="p-4">
            <div className="flex flex-col gap-1 text-sm text-[#F8F9FA]">
              {whitespaceData.autoNormalized > 0 && (
                <div>
                  <span className="font-semibold">{whitespaceData.autoNormalized}</span> case studies were <span className="font-semibold">auto-normalized</span> using inline taxonomy rules.
                </div>
              )}
              {whitespaceData.unnormalizedCount > 0 && (
                <div>
                  <span className="font-semibold">{whitespaceData.unnormalizedCount}</span> case studies could not be normalized.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-xl border-[#2B3648] bg-[#1B2230]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-[#F8F9FA]">
            <Target className="w-6 h-6 text-[#7D5FFF]" />
            Whitespace Leaderboard
          </CardTitle>
          <CardDescription className="text-[#A0AEC0]">Normalized industries with lowest case study activity (highest whitespace opportunity)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#2B3648]">
                  <th className="text-left p-3 text-sm font-semibold text-[#F8F9FA]">Rank</th>
                  <th className="text-left p-3 text-sm font-semibold text-[#F8F9FA]">Industry</th>
                  <th className="text-center p-3 text-sm font-semibold text-[#F8F9FA]">Case Studies</th>
                  <th className="text-center p-3 text-sm font-semibold text-[#F8F9FA]">Providers Active</th>
                  <th className="text-left p-3 text-sm font-semibold text-[#F8F9FA]">Top Service Themes</th>
                  <th className="text-left p-3 text-sm font-semibold text-[#F8F9FA]">Notably Missing</th>
                </tr>
              </thead>
              <tbody>
                {topWhitespace.map((item, idx) => (
                  <tr key={idx} className="border-b border-[#2B3648] hover:bg-[#7D5FFF]/10">
                    <td className="p-3 text-center">
                      <Badge className="bg-[#7D5FFF] text-white">{idx + 1}</Badge>
                    </td>
                    <td className="p-3 font-semibold text-[#F8F9FA]">{item.industry}</td>
                    <td className="p-3 text-center">
                      <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/30">
                        {item.totalCaseStudies}
                      </Badge>
                    </td>
                    <td className="p-3 text-center text-[#A0AEC0]">{item.providerCount}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {item.topServices.map((s, sIdx) => (
                          <Badge key={sIdx} variant="outline" className="text-xs bg-teal-500/20 text-teal-300 border-teal-500/30">
                            {s.service} ({s.count})
                          </Badge>
                        ))}
                        {item.topServices.length === 0 && (
                          <span className="text-xs text-[#6C7A91] italic">No services documented</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {item.missingServices.map((service, mIdx) => (
                          <Badge key={mIdx} variant="outline" className="text-xs bg-amber-500/20 text-amber-300 border-amber-500/30">
                            {service}
                          </Badge>
                        ))}
                        {item.missingServices.length === 0 && (
                          <span className="text-xs text-[#6C7A91] italic">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-[#7D5FFF]/10 rounded-lg border border-[#7D5FFF]/30">
            <div className="flex items-start gap-3">
              <TrendingDown className="w-5 h-5 text-[#7D5FFF] mt-1" />
              <div>
                <p className="font-semibold text-[#7D5FFF] mb-2">Strategic Insight</p>
                <p className="text-sm text-[#F8F9FA]">
                  Industries at the top of this leaderboard represent the highest whitespace opportunities using <strong>normalized taxonomy</strong>. 
                  Low case study volume suggests either:
                  <br />• <strong>Untapped market potential</strong> - competitors haven't fully penetrated these industries
                  <br />• <strong>Service gaps</strong> - specific BPO services are missing or under-promoted
                  <br />• <strong>Go-to-market opportunities</strong> - less competition for market share
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}