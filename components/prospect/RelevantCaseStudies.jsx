
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, ExternalLink, Calendar, Upload, X, Plus, Filter } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadFile } from "@/api/integrations";
import { createPageUrl } from "@/utils";

export default function RelevantCaseStudies({ prospectName, prospectIndustry, prospectId }) {
  const [industryCaseStudies, setIndustryCaseStudies] = useState([]);
  const [clientCaseStudies, setClientCaseStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [bpoFilter, setBpoFilter] = useState("all");
  const [bpoProviders, setBpoProviders] = useState([]);
  
  // Form state for new client case study
  const [newCaseStudy, setNewCaseStudy] = useState({
    title: "",
    client_industry: prospectIndustry || "",
    services_provided: [],
    business_challenge: "",
    solution_overview: "",
    results_metrics: [{ metric: "", value: "" }],
    technologies_used: [],
    file_url: "",
    key_takeaways: [""]
  });
  const [uploading, setUploading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const loadCaseStudies = useCallback(async () => {
    setLoading(true);
    try {
      // Load industry case studies
      const { MarketCaseStudy } = await import("@/api/entities");
      const allStudies = await MarketCaseStudy.list("-publication_date");
      
      const relevant = allStudies.filter(study => {
        const matchesIndustry = study.client_industry?.toLowerCase() === prospectIndustry?.toLowerCase();
        const mentionsProspect = study.client_name?.toLowerCase().includes(prospectName?.toLowerCase());
        return matchesIndustry || mentionsProspect;
      });
      
      setIndustryCaseStudies(relevant);
      
      // Extract unique BPO providers for filter
      const providers = [...new Set(allStudies.map(s => s.bpo_provider).filter(Boolean))];
      setBpoProviders(providers.sort());
      
      // Load client-specific case studies
      const { ClientCaseStudy } = await import("@/api/entities");
      const clientStudies = await ClientCaseStudy.list("-created_date");
      const relevantClientStudies = prospectId 
        ? clientStudies.filter(s => s.prospect_id === prospectId)
        : clientStudies.filter(s => s.prospect_name?.toLowerCase() === prospectName?.toLowerCase());
      
      setClientCaseStudies(relevantClientStudies);
    } catch (err) {
      console.error("Error loading case studies:", err);
    }
    setLoading(false);
  }, [prospectName, prospectIndustry, prospectId]);

  useEffect(() => {
    loadCaseStudies();
  }, [loadCaseStudies]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const result = await UploadFile({ file });
      setNewCaseStudy({ ...newCaseStudy, file_url: result.file_url });
    } catch (err) {
      console.error("Error uploading file:", err);
    }
    setUploadingFile(false);
  };

  const handleSubmitCaseStudy = async () => {
    setUploading(true);
    try {
      const { ClientCaseStudy } = await import("@/api/entities");
      
      const caseStudyData = {
        ...newCaseStudy,
        prospect_id: prospectId || "",
        prospect_name: prospectName,
        services_provided: newCaseStudy.services_provided.filter(s => s.trim()),
        technologies_used: newCaseStudy.technologies_used.filter(t => t.trim()),
        results_metrics: newCaseStudy.results_metrics.filter(m => m.metric && m.value),
        key_takeaways: newCaseStudy.key_takeaways.filter(k => k.trim())
      };
      
      await ClientCaseStudy.create(caseStudyData);
      
      // Reset form
      setNewCaseStudy({
        title: "",
        client_industry: prospectIndustry || "",
        services_provided: [],
        business_challenge: "",
        solution_overview: "",
        results_metrics: [{ metric: "", value: "" }],
        technologies_used: [],
        file_url: "",
        key_takeaways: [""]
      });
      
      setUploadDialogOpen(false);
      loadCaseStudies();
    } catch (err) {
      console.error("Error creating case study:", err);
    }
    setUploading(false);
  };

  const addMetric = () => {
    setNewCaseStudy({
      ...newCaseStudy,
      results_metrics: [...newCaseStudy.results_metrics, { metric: "", value: "" }]
    });
  };

  const removeMetric = (index) => {
    setNewCaseStudy({
      ...newCaseStudy,
      results_metrics: newCaseStudy.results_metrics.filter((_, i) => i !== index)
    });
  };

  const updateMetric = (index, field, value) => {
    const updated = [...newCaseStudy.results_metrics];
    updated[index][field] = value;
    setNewCaseStudy({ ...newCaseStudy, results_metrics: updated });
  };

  const addTakeaway = () => {
    setNewCaseStudy({
      ...newCaseStudy,
      key_takeaways: [...newCaseStudy.key_takeaways, ""]
    });
  };

  const removeTakeaway = (index) => {
    setNewCaseStudy({
      ...newCaseStudy,
      key_takeaways: newCaseStudy.key_takeaways.filter((_, i) => i !== index)
    });
  };

  const updateTakeaway = (index, value) => {
    const updated = [...newCaseStudy.key_takeaways];
    updated[index] = value;
    setNewCaseStudy({ ...newCaseStudy, key_takeaways: updated });
  };

  const filteredIndustryStudies = bpoFilter === "all" 
    ? industryCaseStudies 
    : industryCaseStudies.filter(s => s.bpo_provider === bpoFilter);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return null;
      return format(date, "MMM yyyy");
    } catch (error) {
      console.error("Invalid date:", dateString, error);
      return null;
    }
  };

  const formatFullDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return null;
      return format(date, "MMM d, yyyy");
    } catch (error) {
      console.error("Invalid date:", dateString, error);
      return null;
    }
  };

  if (loading) {
    return (
      <Card className="shadow-xl border-slate-200 bg-white">
        <CardContent className="p-8 text-center">
          <p className="text-slate-900">Loading case studies...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-slate-200 bg-white">
      <CardHeader className="border-b border-slate-200">
        <CardTitle className="flex items-center gap-3 text-xl text-slate-900">
          <FileText className="w-6 h-6 text-purple-600" />
          Case Studies
        </CardTitle>
        <p className="text-sm text-slate-900 mt-2">
          Relevant BPO case studies from {prospectIndustry || "related industries"} and client-specific success stories
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="industry" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-slate-100">
            <TabsTrigger value="industry" className="text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900">
              Industry ({filteredIndustryStudies.length})
            </TabsTrigger>
            <TabsTrigger value="client" className="text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900">
              Client-Specific ({clientCaseStudies.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="industry" className="space-y-6">
            {bpoProviders.length > 0 && (
              <div className="mb-6 flex items-center gap-3">
                <Filter className="w-4 h-4 text-slate-600" />
                <Select value={bpoFilter} onValueChange={setBpoFilter}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Filter by BPO Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Providers ({industryCaseStudies.length})</SelectItem>
                    {bpoProviders.map(provider => (
                      <SelectItem key={provider} value={provider}>
                        {provider} ({industryCaseStudies.filter(s => s.bpo_provider === provider).length})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {filteredIndustryStudies.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-lg">
                <FileText className="w-10 h-10 text-slate-400 mb-4" />
                <p className="font-medium text-slate-900">No Industry Case Studies Found</p>
                <p className="text-sm text-slate-700 mt-1">
                  {bpoFilter === "all" 
                    ? "Check the Industry Research tab to add case studies."
                    : "No case studies found for the selected provider."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredIndustryStudies.slice(0, 10).map((study, idx) => (
                  <Card key={idx} className="shadow-xl border-slate-200 bg-white hover:shadow-2xl transition-shadow">
                    <CardHeader className="border-b border-slate-200">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-xl text-slate-900 mb-2">{study.title}</CardTitle>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => window.location.href = createPageUrl("BPOProfile") + `?provider=${encodeURIComponent(study.bpo_provider)}`}
                              className="inline-flex"
                            >
                              <Badge className="bg-purple-100 text-purple-900 border-purple-300 hover:bg-purple-200 cursor-pointer transition-colors">
                                {study.bpo_provider}
                              </Badge>
                            </button>
                            {study.client_industry && (
                              <Badge variant="outline" className="text-slate-900">{study.client_industry}</Badge>
                            )}
                            {study.publication_date && formatDate(study.publication_date) && (
                              <span className="text-xs text-slate-600 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(study.publication_date)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      {study.business_challenge && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-slate-700 mb-1">Challenge:</p>
                          <p className="text-sm text-slate-900">{study.business_challenge}</p>
                        </div>
                      )}

                      {study.results_metrics && study.results_metrics.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-slate-700 mb-2">Results:</p>
                          <div className="grid grid-cols-2 gap-2">
                            {study.results_metrics.slice(0, 4).map((metric, i) => (
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
            )}
          </TabsContent>

          <TabsContent value="client" className="mt-6">
            <div className="mb-6">
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Client Case Study
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Client Case Study</DialogTitle>
                    <DialogDescription>
                      Document a success story specific to {prospectName}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-sm font-medium text-slate-900 mb-1 block">Title *</label>
                      <Input
                        value={newCaseStudy.title}
                        onChange={(e) => setNewCaseStudy({ ...newCaseStudy, title: e.target.value })}
                        placeholder="e.g., Customer Service Transformation for Banking"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-900 mb-1 block">Industry</label>
                      <Input
                        value={newCaseStudy.client_industry}
                        onChange={(e) => setNewCaseStudy({ ...newCaseStudy, client_industry: e.target.value })}
                        placeholder="e.g., Financial Services"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-900 mb-1 block">Services Provided</label>
                      <Textarea
                        value={newCaseStudy.services_provided.join('\n')}
                        onChange={(e) => setNewCaseStudy({ 
                          ...newCaseStudy, 
                          services_provided: e.target.value.split('\n')
                        })}
                        placeholder="Enter each service on a new line"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-900 mb-1 block">Business Challenge</label>
                      <Textarea
                        value={newCaseStudy.business_challenge}
                        onChange={(e) => setNewCaseStudy({ ...newCaseStudy, business_challenge: e.target.value })}
                        placeholder="Describe the challenge or problem addressed"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-900 mb-1 block">Solution Overview</label>
                      <Textarea
                        value={newCaseStudy.solution_overview}
                        onChange={(e) => setNewCaseStudy({ ...newCaseStudy, solution_overview: e.target.value })}
                        placeholder="Describe the solution implemented"
                        rows={3}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-900">Results & Metrics</label>
                        <Button type="button" variant="outline" size="sm" onClick={addMetric}>
                          <Plus className="w-3 h-3 mr-1" />
                          Add Metric
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {newCaseStudy.results_metrics.map((metric, idx) => (
                          <div key={idx} className="flex gap-2">
                            <Input
                              placeholder="Metric name"
                              value={metric.metric}
                              onChange={(e) => updateMetric(idx, 'metric', e.target.value)}
                              className="flex-1"
                            />
                            <Input
                              placeholder="Value"
                              value={metric.value}
                              onChange={(e) => updateMetric(idx, 'value', e.target.value)}
                              className="flex-1"
                            />
                            {newCaseStudy.results_metrics.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeMetric(idx)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-900 mb-1 block">Technologies Used</label>
                      <Textarea
                        value={newCaseStudy.technologies_used.join('\n')}
                        onChange={(e) => setNewCaseStudy({ 
                          ...newCaseStudy, 
                          technologies_used: e.target.value.split('\n')
                        })}
                        placeholder="Enter each technology on a new line"
                        rows={2}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-900">Key Takeaways</label>
                        <Button type="button" variant="outline" size="sm" onClick={addTakeaway}>
                          <Plus className="w-3 h-3 mr-1" />
                          Add Takeaway
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {newCaseStudy.key_takeaways.map((takeaway, idx) => (
                          <div key={idx} className="flex gap-2">
                            <Input
                              placeholder="Key insight or takeaway"
                              value={takeaway}
                              onChange={(e) => updateTakeaway(idx, e.target.value)}
                              className="flex-1"
                            />
                            {newCaseStudy.key_takeaways.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeTakeaway(idx)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-900 mb-1 block">Upload File (Optional)</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="case-study-file"
                          accept=".pdf,.doc,.docx,.ppt,.pptx"
                        />
                        <label htmlFor="case-study-file">
                          <Button type="button" variant="outline" asChild disabled={uploadingFile}>
                            <span>
                              <Upload className="w-4 h-4 mr-2" />
                              {uploadingFile ? "Uploading..." : "Upload File"}
                            </span>
                          </Button>
                        </label>
                        {newCaseStudy.file_url && (
                          <span className="text-sm text-green-600">✓ File uploaded</span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setUploadDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmitCaseStudy}
                        disabled={!newCaseStudy.title || uploading}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {uploading ? "Saving..." : "Save Case Study"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {clientCaseStudies.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-lg">
                <FileText className="w-10 h-10 text-slate-400 mb-4" />
                <p className="font-medium text-slate-900">No Client-Specific Case Studies</p>
                <p className="text-sm text-slate-700 mt-1">Add a case study to document success stories for this client.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {clientCaseStudies.map((study, idx) => (
                  <div key={idx} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 mb-2">{study.title}</h4>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {study.client_industry && (
                            <Badge variant="outline" className="text-slate-900">{study.client_industry}</Badge>
                          )}
                          {study.created_date && formatFullDate(study.created_date) && (
                            <span className="text-xs text-slate-600 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatFullDate(study.created_date)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {study.services_provided && study.services_provided.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-slate-700 mb-1">Services:</p>
                        <div className="flex flex-wrap gap-1">
                          {study.services_provided.map((service, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{service}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

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

                    {study.key_takeaways && study.key_takeaways.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-slate-700 mb-1">Key Takeaways:</p>
                        <ul className="space-y-1">
                          {study.key_takeaways.map((takeaway, i) => (
                            <li key={i} className="text-sm text-slate-900 flex items-start gap-2">
                              <span className="text-purple-600">•</span>
                              <span>{takeaway}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {study.file_url && (
                      <a
                        href={study.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Attached File
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
