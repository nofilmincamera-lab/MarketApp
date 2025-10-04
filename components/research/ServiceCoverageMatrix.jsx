import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { transformCaseStudies, SERVICE_SILOS } from './taxonomyUtils';

export default function ServiceCoverageMatrix({ caseStudies }) {
  const matrixData = useMemo(() => {
    const { enriched, stats } = transformCaseStudies(caseStudies);
    
    // Use only fully normalized for matrix
    const normalizedCaseStudies = enriched.filter(cs => 
      cs.client_industry_normalized && 
      Array.isArray(cs.services_normalized) && 
      cs.services_normalized.length > 0
    );

    // Get unique NORMALIZED industries and service silos with counts
    const industriesMap = new Map();
    const servicesMap = new Map(SERVICE_SILOS.map(s => [s, 0]));

    normalizedCaseStudies.forEach(cs => {
      // Count industries
      const industry = cs.client_industry_normalized;
      industriesMap.set(industry, (industriesMap.get(industry) || 0) + 1);
      
      // Count services (case studies can have multiple silos)
      cs.services_normalized.forEach(service => {
        if (SERVICE_SILOS.includes(service)) {
          servicesMap.set(service, (servicesMap.get(service) || 0) + 1);
        }
      });
    });

    // Sort industries by count (descending)
    const industries = Array.from(industriesMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([industry]) => industry);
    
    // Use SERVICE_SILOS that have data
    const services = SERVICE_SILOS.filter(silo => servicesMap.has(silo) && servicesMap.get(silo) > 0);

    // Build matrix using ONLY normalized fields, sorted by activity
    const matrix = industries.map(industry => {
      const row = { industry };
      let rowTotal = 0;
      services.forEach(service => {
        const count = normalizedCaseStudies.filter(cs => {
          return cs.client_industry_normalized === industry && 
                 cs.services_normalized.includes(service);
        }).length;
        row[service] = count;
        rowTotal += count;
      });
      row._total = rowTotal;
      return row;
    });

    return { 
      matrix, 
      industries, 
      services, 
      autoNormalized: stats.autoNormalized,
      unnormalizedCount: stats.unresolved, 
      industriesMap, 
      servicesMap 
    };
  }, [caseStudies]);

  if (matrixData.matrix.length === 0) {
    return (
      <Card className="shadow-xl border-[#2B3648] bg-[#1B2230]">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-[#F8F9FA] font-semibold mb-2">No normalized service data available</p>
          <p className="text-[#A0AEC0] text-sm">
            {matrixData.unnormalizedCount > 0 
              ? `${matrixData.unnormalizedCount} case studies could not be auto-normalized. Add more detail (e.g., business_challenge).`
              : "No case study data found."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const getCellColor = (count) => {
    if (count === 0) return 'bg-[#20293A] text-[#6C7A91]';
    if (count >= 10) return 'bg-emerald-600 text-white';
    if (count >= 5) return 'bg-teal-500 text-white';
    if (count >= 2) return 'bg-[#20A4F3] text-white';
    return 'bg-amber-500 text-white';
  };

  // Find gaps (industry/service combos with 0 or 1 case studies)
  const gaps = [];
  matrixData.matrix.forEach(row => {
    matrixData.services.forEach(service => {
      const count = row[service] || 0;
      if (count <= 1) {
        gaps.push({
          industry: row.industry,
          service,
          count
        });
      }
    });
  });

  return (
    <div className="space-y-6">
      {/* Normalization Notice */}
      {(matrixData.autoNormalized > 0 || matrixData.unnormalizedCount > 0) && (
        <Card className="shadow-lg border-[#2B3648] bg-[#20293A]">
          <CardContent className="p-4">
            <div className="flex flex-col gap-1 text-sm text-[#F8F9FA]">
              {matrixData.autoNormalized > 0 && (
                <div>
                  <span className="font-semibold">{matrixData.autoNormalized}</span> case studies were <span className="font-semibold">auto-normalized</span> using inline taxonomy rules.
                </div>
              )}
              {matrixData.unnormalizedCount > 0 && (
                <div>
                  <span className="font-semibold">{matrixData.unnormalizedCount}</span> case studies could not be normalized. Consider enriching <em>business_challenge</em>.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Silo Summary */}
      <Card className="shadow-lg border-[#2B3648] bg-gradient-to-br from-[#1B2230] to-[#20293A]">
        <CardHeader>
          <CardTitle className="text-lg text-[#F8F9FA]">Service Silo Activity (10 Categories)</CardTitle>
          <CardDescription className="text-[#A0AEC0]">Sorted by case study volume (highest to lowest)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {Array.from(matrixData.servicesMap.entries())
              .sort((a, b) => b[1] - a[1])
              .filter(([, count]) => count > 0)
              .map(([service, count], idx) => (
                <div key={idx} className="p-3 bg-[#1B2230] rounded-lg border-2 border-[#20A4F3]/30">
                  <p className="text-xs font-semibold text-[#A0AEC0] mb-1 line-clamp-2">{service}</p>
                  <p className="text-2xl font-bold text-[#20A4F3]">{count}</p>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Gaps Alert */}
      {gaps.length > 0 && (
        <Card className="shadow-lg border-amber-500/30 bg-amber-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-amber-300">
              <AlertCircle className="w-5 h-5" />
              Coverage Gaps Identified
            </CardTitle>
            <CardDescription className="text-amber-200">
              {gaps.length} industry-service combinations with 0-1 case studies (potential whitespace)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {gaps.slice(0, 12).map((gap, idx) => (
                <div key={idx} className="p-2 bg-[#1B2230] rounded border border-amber-500/30 text-sm">
                  <p className="font-semibold text-[#F8F9FA]">{gap.industry}</p>
                  <p className="text-xs text-[#A0AEC0]">{gap.service} ({gap.count})</p>
                </div>
              ))}
              {gaps.length > 12 && (
                <div className="p-2 bg-[#1B2230] rounded border border-amber-500/30 text-sm flex items-center justify-center">
                  <p className="text-xs text-[#A0AEC0]">+{gaps.length - 12} more gaps</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Matrix */}
      <Card className="shadow-xl border-[#2B3648] bg-[#1B2230]">
        <CardHeader>
          <CardTitle className="text-xl text-[#F8F9FA]">Service Coverage Matrix (10 Service Silos)</CardTitle>
          <CardDescription className="text-[#A0AEC0]">Sorted by activity (industries and services with most case studies first)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-[#2B3648]">
                  <th className="text-left p-3 text-xs font-semibold text-[#F8F9FA] sticky left-0 bg-[#1B2230] border-r-2 border-[#2B3648] min-w-[180px]">
                    Industry
                    <div className="text-[10px] font-normal text-[#6C7A91] mt-0.5">(sorted by volume)</div>
                  </th>
                  {matrixData.services.map((service, idx) => (
                    <th key={idx} className="text-center p-2 text-xs font-semibold text-[#F8F9FA] min-w-[120px]">
                      <div className="flex flex-col items-center gap-1">
                        <span className="line-clamp-2">{service}</span>
                        <Badge variant="outline" className="text-[10px] bg-[#20A4F3]/20 text-[#20A4F3] border-[#20A4F3]/30">
                          {matrixData.servicesMap.get(service)} total
                        </Badge>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrixData.matrix.map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-b border-[#2B3648] hover:bg-[#20293A]">
                    <td className="p-3 text-sm sticky left-0 bg-[#1B2230] border-r-2 border-[#2B3648]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-[#F8F9FA]">{row.industry}</span>
                        <Badge variant="outline" className="text-[10px] bg-[#20293A] text-[#A0AEC0] border-[#2B3648]">
                          {matrixData.industriesMap.get(row.industry)}
                        </Badge>
                      </div>
                    </td>
                    {matrixData.services.map((service, colIdx) => {
                      const count = row[service] || 0;
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
            <span className="font-semibold text-[#A0AEC0]">Legend:</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-[#20293A] border border-[#2B3648] rounded"></div>
              <span className="text-[#A0AEC0]">0 studies</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-amber-500 rounded"></div>
              <span className="text-[#A0AEC0]">1 study</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-[#20A4F3] rounded"></div>
              <span className="text-[#A0AEC0]">2-4 studies</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-teal-500 rounded"></div>
              <span className="text-[#A0AEC0]">5-9 studies</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-emerald-600 rounded"></div>
              <span className="text-[#A0AEC0]">10+ studies</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}