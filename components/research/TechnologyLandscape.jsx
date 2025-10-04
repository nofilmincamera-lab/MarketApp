
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cpu, Search, TrendingUp, AlertCircle, Filter } from "lucide-react";

// Generic terms to ignore
const IGNORE_TERMS = new Set([
  'automation', 'technology', 'digital tools', 'software', 'platform',
  'solutions', 'tools', 'systems', 'applications', 'digital transformation',
  'innovation', 'cloud', 'mobile', 'web', 'online', 'digital', 'n/a'
]);

// Technology taxonomy
const TECH_TAXONOMY = {
  'AI & Machine Learning': [
    'ai', 'machine learning', 'ml', 'artificial intelligence', 'neural network',
    'deep learning', 'cognitive', 'watson', 'einstein', 'copilot', 'gpt',
    'openai', 'anthropic', 'claude', 'gemini', 'llm', 'generative ai'
  ],
  'Chatbots & Virtual Assistants': [
    'chatbot', 'bot', 'virtual assistant', 'conversational ai', 'voicebot',
    'alexa', 'siri', 'google assistant', 'cortana', 'iva', 'intelligent virtual agent'
  ],
  'Contact Center Platforms': [
    'genesys', 'avaya', 'cisco', 'nice', 'verint', 'five9', 'talkdesk',
    'twilio', 'ringcentral', 'vonage', 'bandwidth', 'ccaas', 'contact center'
  ],
  'CRM Platforms': [
    'salesforce', 'microsoft dynamics', 'oracle', 'sap', 'hubspot', 'zoho',
    'zendesk', 'freshworks', 'pipedrive', 'crm', 'service cloud', 'sales cloud'
  ],
  'Analytics & Business Intelligence': [
    'tableau', 'power bi', 'qlik', 'looker', 'sisense', 'analytics',
    'business intelligence', 'data visualization', 'splunk', 'domo'
  ],
  'RPA & Process Automation': [
    'uipath', 'automation anywhere', 'blue prism', 'rpa', 'robotic process',
    'workfusion', 'kofax', 'pega', 'appian', 'nintex', 'camunda'
  ],
  'Cloud Infrastructure': [
    'aws', 'azure', 'google cloud', 'gcp', 'amazon web services', 'microsoft azure',
    'ibm cloud', 'oracle cloud', 'kubernetes', 'docker', 'terraform'
  ],
  'Collaboration & Communication': [
    'slack', 'teams', 'zoom', 'webex', 'chatter', 'workplace', 'microsoft teams',
    'google workspace', 'office 365', 'sharepoint', 'confluence'
  ],
  'Customer Data Platforms': [
    'segment', 'mparticle', 'treasure data', 'tealium', 'adobe experience',
    'cdp', 'customer data platform', 'dmp', 'data management'
  ],
  'Workforce Management': [
    'nice iwfm', 'verint wfm', 'aspect', 'calabrio', 'workforce management',
    'wfm', 'scheduling', 'forecasting', 'kronos', 'workday'
  ],
  'Quality & Performance': [
    'nice nexidia', 'verint speech analytics', 'callminer', 'tethr', 'clarabridge',
    'quality management', 'qm', 'performance management', 'scorecard'
  ],
  'Knowledge Management': [
    'servicenow', 'confluence', 'guru', 'bloomfire', 'coveo', 'knowledge base',
    'km', 'content management', 'documentation', 'sharepoint'
  ]
};

function categorizeTechnology(techName) {
  if (!techName || typeof techName !== 'string') return 'Other';
  
  const normalized = techName.toLowerCase().trim();
  
  if (IGNORE_TERMS.has(normalized)) return 'IGNORE';
  
  for (const [category, keywords] of Object.entries(TECH_TAXONOMY)) {
    for (const keyword of keywords) {
      if (normalized.includes(keyword) || keyword.includes(normalized)) {
        return category;
      }
    }
  }
  
  return 'Other';
}

export default function TechnologyLandscape({ caseStudies }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const technologyData = useMemo(() => {
    if (!caseStudies || caseStudies.length === 0) return { technologies: [], totalTechnologies: 0, categories: [] };

    const techMap = new Map();

    caseStudies.forEach(cs => {
      // Helper to parse technologies_used
      let technologiesUsed = [];
      if (cs.technologies_used) {
        if (Array.isArray(cs.technologies_used)) {
          technologiesUsed = cs.technologies_used;
        } else if (typeof cs.technologies_used === 'string' && cs.technologies_used.startsWith('[')) {
          try {
            const parsed = JSON.parse(cs.technologies_used);
            if (Array.isArray(parsed)) {
              technologiesUsed = parsed;
            } else {
              // Parsed but not an array, treat original string as single item
              technologiesUsed = [cs.technologies_used];
            }
          } catch {
            // Not JSON, treat as single value
            technologiesUsed = [cs.technologies_used];
          }
        } else if (typeof cs.technologies_used === 'string') {
            // It's a string, but not a JSON array string
            technologiesUsed = [cs.technologies_used];
        }
      }
      
      technologiesUsed.forEach(tech => {
        if (tech && tech.trim() && tech !== 'N/A') {
          const techName = tech.trim();
          const category = categorizeTechnology(techName);
          
          if (category === 'IGNORE') return;
          
          if (!techMap.has(techName)) {
            techMap.set(techName, {
              count: 0,
              providers: new Set(),
              caseStudies: [],
              category: category
            });
          }
          const data = techMap.get(techName);
          data.count++;
          data.providers.add(cs.bpo_provider);
          data.caseStudies.push({
            title: cs.title,
            provider: cs.bpo_provider,
            client: cs.client_name,
            industry: cs.client_industry_normalized || cs.client_industry
          });
        }
      });
    });

    const technologies = Array.from(techMap.entries()).map(([tech, data]) => ({
      technology: tech,
      mentions: data.count,
      providerCount: data.providers.size,
      providers: Array.from(data.providers).sort(),
      caseStudies: data.caseStudies,
      category: data.category
    })).sort((a, b) => b.mentions - a.mentions);

    const categoryCounts = new Map();
    technologies.forEach(t => {
      categoryCounts.set(t.category, (categoryCounts.get(t.category) || 0) + 1);
    });
    const categories = Array.from(categoryCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return { 
      technologies,
      totalTechnologies: technologies.length,
      categories
    };
  }, [caseStudies]);

  const filteredTechnologies = useMemo(() => {
    let filtered = [...technologyData.technologies];
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.technology.toLowerCase().includes(search) ||
        t.providers.some(p => p.toLowerCase().includes(search)) ||
        t.category.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  }, [technologyData.technologies, searchTerm, selectedCategory]);

  if (technologyData.totalTechnologies === 0) {
    return (
      <Card className="shadow-xl border-[#2B3648] bg-[#1B2230]">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-[#F8F9FA] font-semibold mb-2">No technology data available</p>
          <p className="text-[#A0AEC0] text-sm">Case studies need to have technologies_used field populated.</p>
        </CardContent>
      </Card>
    );
  }

  const topTechnologies = technologyData.technologies.slice(0, 10);

  const getCategoryColor = (category) => {
    const colors = {
      'AI & Machine Learning': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'Chatbots & Virtual Assistants': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      'Contact Center Platforms': 'bg-[#20A4F3]/20 text-[#20A4F3] border-[#20A4F3]/30',
      'CRM Platforms': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      'Analytics & Business Intelligence': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      'RPA & Process Automation': 'bg-green-500/20 text-green-300 border-green-500/30',
      'Cloud Infrastructure': 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      'Collaboration & Communication': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      'Customer Data Platforms': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'Workforce Management': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      'Quality & Performance': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      'Knowledge Management': 'bg-violet-500/20 text-violet-300 border-violet-500/30',
      'Other': 'bg-[#6C7A91]/20 text-[#A0AEC0] border-[#6C7A91]/30'
    };
    return colors[category] || colors['Other'];
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-lg border-[#2B3648] bg-gradient-to-br from-purple-900/20 to-indigo-900/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-600">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#A0AEC0]">
                  Total Technologies
                </p>
                <p className="text-3xl font-bold text-[#F8F9FA]">
                  {technologyData.totalTechnologies}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-[#2B3648] bg-gradient-to-br from-blue-900/20 to-cyan-900/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#20A4F3]">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#A0AEC0]">
                  Most Mentioned
                </p>
                <p className="text-lg font-bold text-[#F8F9FA] truncate">
                  {topTechnologies[0]?.technology || 'N/A'}
                </p>
                <p className="text-xs text-[#A0AEC0]">
                  {topTechnologies[0]?.mentions || 0} mentions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-[#2B3648] bg-gradient-to-br from-green-900/20 to-teal-900/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-600">
                <Filter className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#A0AEC0]">
                  Categories
                </p>
                <p className="text-3xl font-bold text-[#F8F9FA]">
                  {technologyData.categories.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Technologies by Mentions */}
      <Card className="shadow-lg border-[#2B3648] bg-[#1B2230]">
        <CardHeader>
          <CardTitle className="text-lg text-[#F8F9FA]">Top 10 Technologies by Mentions</CardTitle>
          <CardDescription className="text-[#A0AEC0]">Most frequently referenced technologies across all case studies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topTechnologies.map((tech, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#20293A] to-[#1B2230] rounded-lg border border-[#2B3648]">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#F8F9FA]">{tech.technology}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge className="bg-purple-600 text-white">
                      {tech.mentions} mentions
                    </Badge>
                    <Badge variant="outline" className="bg-[#20293A] text-[#F8F9FA] border-[#2B3648]">
                      {tech.providerCount} providers
                    </Badge>
                    <Badge variant="outline" className={getCategoryColor(tech.category)}>
                      {tech.category}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Complete Technology List with Filters */}
      <Card className="shadow-xl border-[#2B3648] bg-[#1B2230]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-[#F8F9FA]">
            <Cpu className="w-6 h-6 text-indigo-400" />
            Complete Technology Landscape
          </CardTitle>
          <CardDescription className="text-[#A0AEC0]">All technologies categorized and organized by type</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#A0AEC0] mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Search Technologies
              </label>
              <Input
                placeholder="Search technologies or providers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#20293A] border-[#2B3648] text-[#F8F9FA] placeholder:text-[#6C7A91]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A0AEC0] mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Category
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-[#20293A] border-[#2B3648] text-[#F8F9FA]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-[#1B2230] border-[#2B3648]">
                  <SelectItem value="all" className="text-[#F8F9FA]">All Categories ({technologyData.totalTechnologies})</SelectItem>
                  {technologyData.categories.map(cat => (
                    <SelectItem key={cat.name} value={cat.name} className="text-[#F8F9FA]">
                      {cat.name} ({cat.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(searchTerm || selectedCategory !== 'all') && (
            <p className="text-sm text-[#A0AEC0] mb-4">
              Showing {filteredTechnologies.length} of {technologyData.totalTechnologies} technologies
            </p>
          )}

          {/* Technology List */}
          <div className="space-y-4 max-h-[800px] overflow-y-auto">
            {filteredTechnologies.map((tech, idx) => (
              <div key={idx} className="p-4 bg-[#20293A] rounded-lg border border-[#2B3648] hover:shadow-md hover:border-[#20A4F3]/30 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-[#F8F9FA]">{tech.technology}</h3>
                      <Badge variant="outline" className={getCategoryColor(tech.category)}>
                        {tech.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-indigo-600 text-white">
                        {tech.mentions} {tech.mentions === 1 ? 'mention' : 'mentions'}
                      </Badge>
                      <Badge variant="outline" className="bg-[#1B2230] text-[#F8F9FA] border-[#2B3648]">
                        {tech.providerCount} {tech.providerCount === 1 ? 'provider' : 'providers'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Providers using this technology */}
                <div className="mb-3">
                  <p className="text-xs font-semibold text-[#6C7A91] uppercase tracking-wide mb-2">
                    Used by:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tech.providers.map((provider, pIdx) => {
                      const providerMentions = tech.caseStudies.filter(cs => cs.provider === provider).length;
                      return (
                        <Badge key={pIdx} variant="outline" className="bg-[#20A4F3]/10 text-[#20A4F3] border-[#20A4F3]/30">
                          {provider} ({providerMentions})
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {/* Case studies mentioning this technology */}
                <details className="mt-3">
                  <summary className="text-xs font-semibold text-[#20A4F3] uppercase tracking-wide cursor-pointer hover:text-[#36B3D1]">
                    View {tech.caseStudies.length} {tech.caseStudies.length === 1 ? 'Case Study' : 'Case Studies'}
                  </summary>
                  <div className="mt-2 space-y-1 pl-4 border-l-2 border-[#20A4F3]/30">
                    {tech.caseStudies.map((cs, csIdx) => (
                      <div key={csIdx} className="text-sm text-[#A0AEC0] py-1">
                        <span className="font-medium text-[#F8F9FA]">{cs.title}</span>
                        {cs.client && <span className="text-[#6C7A91]"> • {cs.client}</span>}
                        {cs.industry && <span className="text-[#6C7A91]"> • {cs.industry}</span>}
                        <Badge variant="outline" className="ml-2 text-xs bg-[#1B2230] text-purple-300 border-purple-500/30">
                          {cs.provider}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            ))}
          </div>

          {filteredTechnologies.length === 0 && (searchTerm || selectedCategory !== 'all') && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-[#6C7A91] mx-auto mb-4" />
              <p className="text-[#A0AEC0]">No technologies found matching your filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
