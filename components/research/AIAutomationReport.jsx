
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, AlertCircle, Zap, Brain, Target, BarChart3 } from "lucide-react";
import { safeFormatDate, safeParseDateISO, isValidDate } from "@/utils";

export default function AIAutomationReport({ caseStudies }) {
  const aiData = useMemo(() => {
    if (!caseStudies || caseStudies.length === 0) {
      return { 
        aiCaseStudies: [], 
        unnormalizedCount: 0,
        totalAI: 0,
        aiPercentage: 0,
        industryBreakdown: [],
        providerLeaderboard: [],
        topTechnologies: [],
        timeSeriesData: [],
        trendPercentage: 0,
        recentCount: 0,
        previousCount: 0,
        useCases: [],
        noAiIndustries: []
      };
    }

    // Filter for normalized case studies that include AI-related service silos
    const AI_RELATED_SILOS = [
      "AI & Advanced Analytics",
      "Automation & Digital Transformation"
    ];

    const aiCaseStudies = caseStudies.filter(cs => 
      cs.client_industry_normalized && 
      cs.services_normalized && 
      cs.services_normalized.some(service => AI_RELATED_SILOS.includes(service))
    );

    const unnormalizedCount = caseStudies.filter(cs => 
      !cs.client_industry_normalized || !cs.services_normalized || cs.services_normalized.length === 0
    ).length;

    const normalizedTotal = caseStudies.length - unnormalizedCount;
    const aiPercentage = normalizedTotal > 0 ? Math.round((aiCaseStudies.length / normalizedTotal) * 100) : 0;

    // Industry breakdown
    const industryMap = new Map();
    aiCaseStudies.forEach(cs => {
      const industry = cs.client_industry_normalized;
      if (!industryMap.has(industry)) {
        industryMap.set(industry, {
          count: 0,
          providers: new Set(),
          technologies: new Set(),
          clients: new Set()
        });
      }
      const data = industryMap.get(industry);
      data.count++;
      data.providers.add(cs.bpo_provider);
      if (cs.client_name) data.clients.add(cs.client_name);
      if (cs.technologies_used) {
        cs.technologies_used.forEach(tech => {
          if (tech && tech !== 'N/A') data.technologies.add(tech);
        });
      }
    });

    const industryBreakdown = Array.from(industryMap.entries())
      .map(([industry, data]) => ({
        industry,
        count: data.count,
        providerCount: data.providers.size,
        clientCount: data.clients.size,
        topTechnologies: Array.from(data.technologies).slice(0, 3)
      }))
      .sort((a, b) => b.count - a.count);

    // Provider leaderboard
    const providerMap = new Map();
    aiCaseStudies.forEach(cs => {
      const provider = cs.bpo_provider;
      if (!providerMap.has(provider)) {
        providerMap.set(provider, {
          count: 0,
          industries: new Set(),
          technologies: new Set()
        });
      }
      const data = providerMap.get(provider);
      data.count++;
      data.industries.add(cs.client_industry_normalized);
      if (cs.technologies_used) {
        cs.technologies_used.forEach(tech => {
          if (tech && tech !== 'N/A') data.technologies.add(tech);
        });
      }
    });

    const providerLeaderboard = Array.from(providerMap.entries())
      .map(([provider, data]) => ({
        provider,
        count: data.count,
        industryCount: data.industries.size,
        topTechnologies: Array.from(data.technologies).slice(0, 3)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Technology analysis
    const techMap = new Map();
    aiCaseStudies.forEach(cs => {
      if (cs.technologies_used) {
        cs.technologies_used.forEach(tech => {
          if (tech && tech !== 'N/A') {
            techMap.set(tech, (techMap.get(tech) || 0) + 1);
          }
        });
      }
    });

    const topTechnologies = Array.from(techMap.entries())
      .map(([tech, count]) => ({ tech, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // Time series analysis (last 24 months)
    const now = new Date();
    const aiCaseStudiesWithDates = aiCaseStudies.filter(cs => cs.publication_date && isValidDate(cs.publication_date));
    
    const monthlyData = new Map();
    aiCaseStudiesWithDates.forEach(cs => {
      try {
        const pubDate = safeParseDateISO(cs.publication_date);
        if (pubDate) {
          // Calculate months difference manually to avoid date-fns differenceInMonths complexity
          const monthsAgo = (now.getFullYear() - pubDate.getFullYear()) * 12 + (now.getMonth() - pubDate.getMonth());
          if (monthsAgo >= 0 && monthsAgo <= 24) {
            const year = pubDate.getFullYear();
            const month = String(pubDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
            const monthKey = `${year}-${month}`;
            monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + 1);
          }
        }
      } catch (e) {
        // Skip invalid dates
      }
    });

    const timeSeriesData = Array.from(monthlyData.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Calculate trend (last 6 months vs previous 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const recentCount = aiCaseStudiesWithDates.filter(cs => {
      const pubDate = safeParseDateISO(cs.publication_date);
      return pubDate && pubDate >= sixMonthsAgo;
    }).length;

    const previousCount = aiCaseStudiesWithDates.filter(cs => {
      const pubDate = safeParseDateISO(cs.publication_date);
      return pubDate && pubDate >= twelveMonthsAgo && pubDate < sixMonthsAgo;
    }).length;

    const trendPercentage = previousCount > 0 
      ? Math.round(((recentCount - previousCount) / previousCount) * 100)
      : 0;

    // AI use cases (extract from technologies_used and raw services)
    const useCaseMap = new Map();
    aiCaseStudies.forEach(cs => {
      // Categorize based on normalized service silos and technologies
      const services = cs.services_normalized || [];
      const techs = (cs.technologies_used || []).map(t => t && t.toLowerCase());
      const rawServices = (cs.services_provided || []).map(s => s && s.toLowerCase());
      
      const allText = [...techs, ...rawServices].join(' ');
      
      // Map based on service silos
      if (services.includes("Automation & Digital Transformation")) {
        if (allText.includes('rpa') || allText.includes('robotic process')) {
          useCaseMap.set('RPA & Process Automation', (useCaseMap.get('RPA & Process Automation') || 0) + 1);
        } else {
          useCaseMap.set('Digital Transformation', (useCaseMap.get('Digital Transformation') || 0) + 1);
        }
      }
      
      if (services.includes("AI & Advanced Analytics")) {
        if (allText.includes('chatbot') || allText.includes('virtual assistant') || allText.includes('conversational')) {
          useCaseMap.set('Chatbots & Virtual Assistants', (useCaseMap.get('Chatbots & Virtual Assistants') || 0) + 1);
        }
        if (allText.includes('analytics') || allText.includes('predictive') || allText.includes('business intelligence')) {
          useCaseMap.set('Analytics & Business Intelligence', (useCaseMap.get('Analytics & Business Intelligence') || 0) + 1);
        }
        if (allText.includes('genai') || allText.includes('generative ai') || allText.includes('llm') || allText.includes('gpt')) {
          useCaseMap.set('Generative AI', (useCaseMap.get('Generative AI') || 0) + 1);
        }
        if (allText.includes('machine learning') || allText.includes('ml model') || allText.includes('ai model')) {
          useCaseMap.set('Machine Learning Models', (useCaseMap.get('Machine Learning Models') || 0) + 1);
        }
        if (allText.includes('sentiment') || allText.includes('voice analytics') || allText.includes('speech')) {
          useCaseMap.set('Voice & Sentiment Analytics', (useCaseMap.get('Voice & Sentiment Analytics') || 0) + 1);
        }
      }
      
      if (services.includes("Automation & Digital Transformation") && services.includes("AI & Advanced Analytics")) {
        useCaseMap.set('Intelligent Automation', (useCaseMap.get('Intelligent Automation') || 0) + 1);
      }
    });

    const useCases = Array.from(useCaseMap.entries())
      .map(([useCase, count]) => ({ useCase, count }))
      .sort((a, b) => b.count - a.count);

    // Industries with NO AI adoption (whitespace)
    const allIndustries = new Set(
      caseStudies
        .filter(cs => cs.client_industry_normalized)
        .map(cs => cs.client_industry_normalized)
    );
    
    const aiIndustries = new Set(industryBreakdown.map(i => i.industry));
    const noAiIndustries = Array.from(allIndustries).filter(ind => !aiIndustries.has(ind));

    return {
      aiCaseStudies,
      unnormalizedCount,
      totalAI: aiCaseStudies.length,
      aiPercentage,
      industryBreakdown,
      providerLeaderboard,
      topTechnologies,
      timeSeriesData,
      trendPercentage,
      recentCount,
      previousCount,
      useCases,
      noAiIndustries
    };
  }, [caseStudies]);

  if (aiData.totalAI === 0) {
    return (
      <Card className="shadow-xl border-slate-200 bg-white">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-slate-900 font-semibold mb-2">No AI/Automation case studies available</p>
          <p className="text-slate-600 text-sm">
            {aiData.unnormalizedCount > 0 
              ? `${aiData.unnormalizedCount} case studies need taxonomy normalization. Click "Normalize Taxonomy" button above.`
              : "No case studies with AI & Advanced Analytics or Automation & Digital Transformation service silos found."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Normalization Warning */}
      {aiData.unnormalizedCount > 0 && (
        <Card className="shadow-lg border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-amber-900">
                <strong>{aiData.unnormalizedCount} case studies</strong> are not yet normalized and excluded from this report. 
                Click <strong>"Normalize Taxonomy"</strong> above to include them.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Executive Summary */}
      <Card className="shadow-xl border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl text-slate-900">
            <Sparkles className="w-7 h-7 text-purple-600" />
            AI & Automation Intelligence Summary
          </CardTitle>
          <CardDescription>Market-wide analysis of Digital & AI adoption in BPO case studies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-lg border-2 border-purple-200">
              <p className="text-xs font-semibold text-slate-700 mb-1">AI Case Studies</p>
              <p className="text-3xl font-bold text-purple-600">{aiData.totalAI}</p>
              <p className="text-xs text-slate-600 mt-1">{aiData.aiPercentage}% of all normalized studies</p>
            </div>
            
            <div className="p-4 bg-white rounded-lg border-2 border-teal-200">
              <p className="text-xs font-semibold text-slate-700 mb-1">Industries Covered</p>
              <p className="text-3xl font-bold text-teal-600">{aiData.industryBreakdown.length}</p>
              <p className="text-xs text-slate-600 mt-1">{aiData.noAiIndustries.length} industries with no AI</p>
            </div>
            
            <div className="p-4 bg-white rounded-lg border-2 border-blue-200">
              <p className="text-xs font-semibold text-slate-700 mb-1">Active Providers</p>
              <p className="text-3xl font-bold text-blue-600">{aiData.providerLeaderboard.length}</p>
              <p className="text-xs text-slate-600 mt-1">Top 10 shown below</p>
            </div>
            
            <div className="p-4 bg-white rounded-lg border-2 border-green-200">
              <p className="text-xs font-semibold text-slate-700 mb-1">6-Month Trend</p>
              <div className="flex items-center gap-2">
                <p className={`text-3xl font-bold ${aiData.trendPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {aiData.trendPercentage > 0 ? '+' : ''}{aiData.trendPercentage}%
                </p>
                <TrendingUp className={`w-6 h-6 ${aiData.trendPercentage >= 0 ? 'text-green-600' : 'text-red-600 rotate-180'}`} />
              </div>
              <p className="text-xs text-slate-600 mt-1">vs. previous 6 months</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Use Cases */}
      {aiData.useCases.length > 0 && (
        <Card className="shadow-xl border-slate-200 bg-white">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="flex items-center gap-3 text-xl text-slate-900">
              <Brain className="w-6 h-6 text-indigo-600" />
              AI Use Cases & Applications
            </CardTitle>
            <CardDescription>How providers are applying AI/automation technologies</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiData.useCases.map((useCase, idx) => (
                <div key={idx} className="p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                  <div className="flex items-center justify-between mb-2">
                    <Zap className="w-5 h-5 text-indigo-600" />
                    <Badge className="bg-indigo-600 text-white">{useCase.count} studies</Badge>
                  </div>
                  <p className="font-semibold text-slate-900">{useCase.useCase}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Provider Leaderboard */}
      <Card className="shadow-xl border-slate-200 bg-white">
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="flex items-center gap-3 text-xl text-slate-900">
            <Target className="w-6 h-6 text-purple-600" />
            AI Provider Leaderboard
          </CardTitle>
          <CardDescription>Top 10 providers emphasizing AI & automation</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {aiData.providerLeaderboard.map((provider, idx) => (
              <div key={idx} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{provider.provider}</p>
                      <p className="text-xs text-slate-600">{provider.industryCount} industries</p>
                    </div>
                  </div>
                  <Badge className="bg-purple-600 text-white">{provider.count} AI studies</Badge>
                </div>
                {provider.topTechnologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {provider.topTechnologies.map((tech, techIdx) => (
                      <Badge key={techIdx} variant="outline" className="text-xs bg-white text-slate-700">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Industry Breakdown */}
      <Card className="shadow-xl border-slate-200 bg-white">
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="flex items-center gap-3 text-xl text-slate-900">
            <BarChart3 className="w-6 h-6 text-teal-600" />
            AI Adoption by Industry
          </CardTitle>
          <CardDescription>Which industries are embracing AI/automation</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {aiData.industryBreakdown.map((industry, idx) => (
              <div key={idx} className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900">{industry.industry}</p>
                    <p className="text-xs text-slate-600">
                      {industry.providerCount} providers | {industry.clientCount} clients
                    </p>
                  </div>
                  <Badge className="bg-teal-600 text-white">{industry.count} studies</Badge>
                </div>
                {industry.topTechnologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {industry.topTechnologies.map((tech, techIdx) => (
                      <Badge key={techIdx} variant="outline" className="text-xs bg-white text-slate-700">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technology Stack */}
      {aiData.topTechnologies.length > 0 && (
        <Card className="shadow-xl border-slate-200 bg-white">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="flex items-center gap-3 text-xl text-slate-900">
              <Zap className="w-6 h-6 text-amber-600" />
              Top AI Technologies & Platforms
            </CardTitle>
            <CardDescription>Most frequently mentioned technologies in AI case studies</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {aiData.topTechnologies.map((tech, idx) => (
                <div key={idx} className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-center">
                  <p className="text-2xl font-bold text-amber-600 mb-1">{tech.count}</p>
                  <p className="text-xs font-semibold text-slate-900">{tech.tech}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Whitespace */}
      {aiData.noAiIndustries.length > 0 && (
        <Card className="shadow-xl border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
          <CardHeader className="border-b border-red-200">
            <CardTitle className="flex items-center gap-3 text-xl text-red-900">
              <AlertCircle className="w-6 h-6" />
              AI Whitespace Opportunities
            </CardTitle>
            <CardDescription className="text-red-800">
              Industries with NO AI/automation case studies published
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {aiData.noAiIndustries.map((industry, idx) => (
                <div key={idx} className="p-3 bg-white rounded-lg border-2 border-red-300 text-center">
                  <p className="text-sm font-semibold text-slate-900">{industry}</p>
                  <p className="text-xs text-red-700 mt-1">0 AI studies</p>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-white rounded-lg border-2 border-orange-300">
              <p className="font-semibold text-orange-900 mb-2">Strategic Opportunity:</p>
              <p className="text-sm text-slate-800">
                These industries represent untapped markets for AI/automation BPO services. 
                Competitors have not yet established thought leadership through case studies in these verticals.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Series Visualization */}
      {aiData.timeSeriesData.length > 0 && (
        <Card className="shadow-xl border-slate-200 bg-white">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="flex items-center gap-3 text-xl text-slate-900">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              AI Case Study Publishing Trend (24 Months)
            </CardTitle>
            <CardDescription>
              Monthly volume: Last 6 months ({aiData.recentCount}) vs. Previous 6 months ({aiData.previousCount})
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              {aiData.timeSeriesData.map((dataPoint, idx) => {
                const maxCount = Math.max(...aiData.timeSeriesData.map(d => d.count));
                const barWidth = (dataPoint.count / maxCount) * 100;
                
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-600 w-20">{dataPoint.month}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-6 relative">
                      <div 
                        className="bg-blue-600 h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${barWidth}%` }}
                      >
                        <span className="text-xs font-bold text-white">{dataPoint.count}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
