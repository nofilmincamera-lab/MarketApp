import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, TrendingUp, AlertCircle } from "lucide-react";
import { transformCaseStudies, SERVICE_SILOS } from './taxonomyUtils';

export default function ProviderBenchmarking({ caseStudies, providers }) {
  const [selectedProvider, setSelectedProvider] = useState('');

  const providerData = useMemo(() => {
    const { enriched, stats } = transformCaseStudies(caseStudies);
    
    const normalizedCaseStudies = enriched.filter(cs => 
      cs.client_industry_normalized && 
      cs.services_normalized && 
      cs.services_normalized.length > 0
    );

    const providerMap = new Map();
    const allIndustries = new Set();

    normalizedCaseStudies.forEach(cs => {
      const provider = cs.bpo_provider;
      const industry = cs.client_industry_normalized;
      const services = cs.services_normalized;

      allIndustries.add(industry);

      if (!providerMap.has(provider)) {
        providerMap.set(provider, {
          industries: new Map(),
          services: new Map(),
          totalCaseStudies: 0
        });
      }

      const data = providerMap.get(provider);
      data.totalCaseStudies++;
      data.industries.set(industry, (data.industries.get(industry) || 0) + 1);

      services.forEach(service => {
        if (service && SERVICE_SILOS.includes(service)) {
          data.services.set(service, (data.services.get(service) || 0) + 1);
        }
      });
    });

    const allIndustriesArray = Array.from(allIndustries);
    providerMap.forEach((data, provider) => {
      const presentIndustries = new Set(data.industries.keys());
      data.industryGaps = allIndustriesArray.filter(i => !presentIndustries.has(i));
      
      const presentServices = new Set(data.services.keys());
      data.serviceGaps = SERVICE_SILOS.filter(s => !presentServices.has(s));
    });

    return { 
      providerMap, 
      allIndustries, 
      allServices: SERVICE_SILOS, 
      autoNormalized: stats.autoNormalized,
      unnormalizedCount: stats.unresolved 
    };
  }, [caseStudies]);

  const providerList = Array.from(providerData.providerMap.keys()).sort();

  const selectedProviderData = useMemo(() => {
    if (!selectedProvider || !providerData.providerMap.has(selectedProvider)) return null;

    const data = providerData.providerMap.get(selectedProvider);
    
    const topIndustries = Array.from(data.industries.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([industry, count]) => ({ industry, count }));

    const topServices = Array.from(data.services.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([service, count]) => ({ service, count }));

    return {
      provider: selectedProvider,
      totalCaseStudies: data.totalCaseStudies,
      topIndustries,
      topServices,
      industryGaps: data.industryGaps.slice(0, 5),
      serviceGaps: data.serviceGaps.slice(0, 5)
    };
  }, [selectedProvider, providerData]);

  if (providerList.length === 0) {
    return (
      <Card className="shadow-xl border-[#2B3648] bg-[#1B2230]">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-[#F8F9FA] font-semibold mb-2">No normalized provider data available</p>
          <p className="text-[#A0AEC0] text-sm">
            {providerData.unnormalizedCount > 0 
              ? `${providerData.unnormalizedCount} case studies need taxonomy normalization.`
              : "No case study data found."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Normalization Warning */}
      {providerData.unnormalizedCount > 0 && (
        <Card className="shadow-lg border-amber-500/30 bg-amber-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-300" />
              <p className="text-sm text-amber-100">
                <strong>{providerData.unnormalizedCount} case studies</strong> are not yet normalized and excluded from this report. 
                {providerData.autoNormalized > 0 && <span> <strong>{providerData.autoNormalized}</strong> were auto-normalized.</span>}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Provider Selector */}
      <Card className="shadow-lg border-[#2B3648] bg-[#1B2230]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-[#F8F9FA]">
            <Building2 className="w-6 h-6 text-[#20A4F3]" />
            Provider Benchmarking
          </CardTitle>
          <CardDescription className="text-[#A0AEC0]">Analyze individual provider focus areas and gaps using normalized taxonomy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <label className="block text-sm font-medium text-[#A0AEC0] mb-2">
              Select Provider
            </label>
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger className="bg-[#20293A] border-[#2B3648] text-[#F8F9FA]">
                <SelectValue placeholder="Choose a provider..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1B2230] border-[#2B3648]">
                {providerList.map(provider => (
                  <SelectItem key={provider} value={provider} className="text-[#F8F9FA]">
                    {provider} ({providerData.providerMap.get(provider).totalCaseStudies} studies)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Provider Analysis */}
      {selectedProviderData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Top Industries */}
          <Card className="shadow-lg border-[#2B3648] bg-gradient-to-br from-teal-900/20 to-blue-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-[#F8F9FA]">
                <TrendingUp className="w-5 h-5 text-teal-400" />
                Top 3 Industries
              </CardTitle>
              <CardDescription className="text-[#A0AEC0]">Where they focus most</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedProviderData.topIndustries.map((item, idx) => (
                  <div key={idx} className="p-3 bg-[#1B2230] rounded-lg border border-teal-500/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-2xl font-bold text-teal-400">#{idx + 1}</span>
                      <Badge className="bg-teal-600 text-white">{item.count} studies</Badge>
                    </div>
                    <p className="font-semibold text-[#F8F9FA]">{item.industry}</p>
                  </div>
                ))}
                {selectedProviderData.topIndustries.length === 0 && (
                  <p className="text-sm text-[#6C7A91] italic">No industry data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Services */}
          <Card className="shadow-lg border-[#2B3648] bg-gradient-to-br from-purple-900/20 to-pink-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-[#F8F9FA]">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Top 3 Services
              </CardTitle>
              <CardDescription className="text-[#A0AEC0]">What they emphasize</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedProviderData.topServices.map((item, idx) => (
                  <div key={idx} className="p-3 bg-[#1B2230] rounded-lg border border-purple-500/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-2xl font-bold text-purple-400">#{idx + 1}</span>
                      <Badge className="bg-purple-600 text-white">{item.count} studies</Badge>
                    </div>
                    <p className="font-semibold text-[#F8F9FA]">{item.service}</p>
                  </div>
                ))}
                {selectedProviderData.topServices.length === 0 && (
                  <p className="text-sm text-[#6C7A91] italic">No service data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Industry Gaps */}
          <Card className="shadow-lg border-[#2B3648] bg-gradient-to-br from-orange-900/20 to-red-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-[#F8F9FA]">
                <AlertCircle className="w-5 h-5 text-orange-400" />
                Industry Gaps
              </CardTitle>
              <CardDescription className="text-[#A0AEC0]">No case study presence</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedProviderData.industryGaps.map((industry, idx) => (
                  <div key={idx} className="p-2 bg-[#1B2230] rounded-lg border border-orange-500/30">
                    <p className="text-sm font-medium text-[#F8F9FA]">{industry}</p>
                  </div>
                ))}
                {selectedProviderData.industryGaps.length === 0 && (
                  <p className="text-sm text-emerald-400 font-medium">✓ No industry gaps - covers all active industries</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedProviderData && (
        <Card className="shadow-lg border-[#2B3648] bg-gradient-to-br from-blue-900/20 to-indigo-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-[#F8F9FA]">
              <AlertCircle className="w-5 h-5 text-[#20A4F3]" />
              Service Gaps
            </CardTitle>
            <CardDescription className="text-[#A0AEC0]">Service silos where no case studies are present</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {selectedProviderData.serviceGaps.map((service, idx) => (
                <div key={idx} className="p-2 bg-[#1B2230] rounded-lg border border-[#20A4F3]/30">
                  <p className="text-xs font-medium text-[#F8F9FA]">{service}</p>
                </div>
              ))}
              {selectedProviderData.serviceGaps.length === 0 && (
                <p className="text-sm text-emerald-400 font-medium col-span-full">✓ No service gaps - covers all active service silos</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}