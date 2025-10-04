import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileText, ExternalLink, Calendar, Trash2, Building2, Search } from "lucide-react";
import { format, parseISO } from "date-fns";
import _ from "lodash";

export default function BPOProviderDashboard({ caseStudies, setMessage, loadData }) {
  const [searchTerm, setSearchTerm] = useState("");

  const groupedData = React.useMemo(() => {
    const filtered = caseStudies.filter(study => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        study.bpo_provider?.toLowerCase().includes(search) ||
        study.client_name?.toLowerCase().includes(search) ||
        study.client_industry?.toLowerCase().includes(search) ||
        study.title?.toLowerCase().includes(search)
      );
    });

    const grouped = _.groupBy(filtered, 'bpo_provider');
    
    return Object.entries(grouped).map(([provider, providerStudies]) => {
      const byIndustry = _.groupBy(providerStudies, 'client_industry');
      
      return {
        provider,
        totalCaseStudies: providerStudies.length,
        industries: Object.entries(byIndustry).map(([industry, industryStudies]) => ({
          industry: industry || 'Not Specified',
          caseStudies: _.sortBy(industryStudies, study => 
            study.publication_date ? -new Date(study.publication_date).getTime() : 0
          )
        }))
      };
    }).sort((a, b) => b.totalCaseStudies - a.totalCaseStudies);
  }, [caseStudies, searchTerm]);

  const handleDelete = async (studyId) => {
    if (confirm("Are you sure you want to delete this case study?")) {
      try {
        const { MarketCaseStudy } = await import("@/api/entities");
        await MarketCaseStudy.delete(studyId);
        setMessage({ type: "success", text: "Case study deleted successfully." });
        loadData();
      } catch (err) {
        console.error("Error deleting case study:", err);
        setMessage({ type: "error", text: "Failed to delete case study." });
      }
    }
  };

  if (caseStudies.length === 0) {
    return (
      <>
        <Card className="mb-6 shadow-xl border-slate-200 bg-white">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="text-slate-900">BPO Provider Intelligence</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm text-slate-700">
              Competitive intelligence from major BPO providers, organized by provider, industry, and client.
            </p>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 border-slate-300">
          <CardContent className="py-16 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2 text-slate-900">No Case Studies Yet</p>
            <p className="text-sm text-slate-600">
              Use the Auto-Refresh button to have the AI agent find case studies from top BPO providers
            </p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <Card className="mb-6 shadow-xl border-slate-200 bg-white">
        <CardHeader className="border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900">BPO Provider Intelligence</CardTitle>
              <p className="text-sm mt-1 text-slate-700">
                {caseStudies.length} case studies from {groupedData.length} providers
              </p>
            </div>
            <div className="w-80">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search providers, clients, or industries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Accordion type="single" collapsible className="space-y-4">
        {groupedData.map((providerData, providerIdx) => (
          <Card key={providerIdx} className="shadow-lg border-slate-200 bg-white">
            <AccordionItem value={`provider-${providerIdx}`} className="border-0">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-purple-600" />
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-slate-900">{providerData.provider}</h3>
                      <p className="text-sm text-slate-600">
                        {providerData.totalCaseStudies} case studies across {providerData.industries.length} industries
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-purple-100 text-purple-900">
                    {providerData.totalCaseStudies}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <Accordion type="single" collapsible className="space-y-3">
                  {providerData.industries.map((industryData, industryIdx) => (
                    <Card key={industryIdx} className="border-slate-200 bg-slate-50">
                      <AccordionItem value={`industry-${providerIdx}-${industryIdx}`} className="border-0">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="text-left">
                              <p className="font-medium text-slate-900">{industryData.industry}</p>
                              <p className="text-xs text-slate-600">{industryData.caseStudies.length} case studies</p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="space-y-3">
                            {industryData.caseStudies.map((study, studyIdx) => (
                              <Card key={studyIdx} className="border-slate-200 bg-white">
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-slate-900 mb-2">{study.title}</h4>
                                      <div className="flex flex-wrap gap-2">
                                        {study.client_name && (
                                          <Badge variant="secondary" className="text-slate-900">{study.client_name}</Badge>
                                        )}
                                        {study.publication_date && (
                                          <span className="text-xs text-slate-600 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {format(parseISO(study.publication_date), "MMM yyyy")}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDelete(study.id)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>

                                  {study.business_challenge && (
                                    <div className="mb-3">
                                      <p className="text-xs font-semibold text-slate-700 mb-1">Challenge:</p>
                                      <p className="text-sm text-slate-900">{study.business_challenge}</p>
                                    </div>
                                  )}

                                  {study.solution_overview && (
                                    <div className="mb-3">
                                      <p className="text-xs font-semibold text-slate-700 mb-1">Solution:</p>
                                      <p className="text-sm text-slate-900">{study.solution_overview}</p>
                                    </div>
                                  )}

                                  {study.results_metrics && study.results_metrics.length > 0 && (
                                    <div className="mb-3">
                                      <p className="text-xs font-semibold text-slate-700 mb-2">Results:</p>
                                      <div className="grid grid-cols-2 gap-2">
                                        {study.results_metrics.map((metric, i) => (
                                          <div key={i} className="p-2 bg-green-50 rounded border border-green-200">
                                            <p className="text-xs text-green-700 font-medium">{metric.metric}</p>
                                            <p className="text-sm font-bold text-green-900">{metric.value}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {study.source_url && (
                                    <a
                                      href={study.source_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      View Full Case Study
                                    </a>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Card>
                  ))}
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          </Card>
        ))}
      </Accordion>

      {groupedData.length === 0 && searchTerm && (
        <Card className="border-slate-200 bg-white">
          <CardContent className="py-8 text-center">
            <p className="text-slate-600">No case studies match your search.</p>
          </CardContent>
        </Card>
      )}
    </>
  );
}