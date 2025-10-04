
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Handshake, ExternalLink, Newspaper, Info } from "lucide-react";
import { safeFormatDate } from "@/components/dateUtils";

export default function TechPartnerships({ data, detectedPartnerships = [] }) {
  const getPartnershipTypeColor = (type) => {
    const colors = {
      "Strategic Alliance": "bg-purple-100 text-purple-900 border-purple-300",
      "Technology Integration": "bg-blue-100 text-blue-900 border-blue-300",
      "Service Partnership": "bg-green-100 text-green-900 border-green-300",
      "Acquisition": "bg-orange-100 text-orange-900 border-orange-300",
      "Joint Venture": "bg-teal-100 text-teal-900 border-teal-300",
      "Mentioned": "bg-slate-100 text-slate-900 border-slate-300"
    };
    return colors[type] || colors["Mentioned"];
  };

  // Combine manual partnerships from data with auto-detected partnerships
  const allPartnerships = [
    ...(detectedPartnerships || []),
    ...(data?.partnerships || []).map(p => ({
      ...p,
      provider_name: p.partner_name,
      partnership_type: p.partnership_type || "Technology Integration",
      snippet: p.description,
      source_article_title: "Tech Partnership",
      isManual: true
    }))
  ];

  // Remove duplicates by provider_name
  const uniquePartnerships = allPartnerships.reduce((acc, partnership) => {
    const existing = acc.find(p => 
      p.provider_name?.toLowerCase() === partnership.provider_name?.toLowerCase()
    );
    if (!existing) {
      acc.push(partnership);
    }
    return acc;
  }, []);

  // Sort by date (most recent first) if available
  uniquePartnerships.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date) - new Date(a.date);
  });

  const autoDetectedCount = detectedPartnerships?.length || 0;
  const manualCount = data?.partnerships?.length || 0;

  if (uniquePartnerships.length === 0 && (!data || !data.summary)) {
    return (
      <Card className="shadow-2xl border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-white">
            <Handshake className="w-6 h-6 text-slate-300" />
            Technology Partnerships & Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-900/50 rounded-lg">
            <Info className="w-10 h-10 text-slate-500 mb-4" />
            <p className="font-medium text-slate-300">No Partnerships Found</p>
            <p className="text-sm text-slate-400 mt-1">No technology partnerships or BPO provider mentions detected in recent news.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-2xl border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
      <CardHeader className="border-b border-slate-700">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl text-white">
            <Handshake className="w-6 h-6 text-slate-300" />
            Technology Partnerships & Integrations
          </CardTitle>
          <div className="flex items-center gap-2">
            {autoDetectedCount > 0 && (
              <Badge className="bg-blue-600 text-white">
                <Newspaper className="w-3 h-3 mr-1" />
                {autoDetectedCount} from News
              </Badge>
            )}
            {manualCount > 0 && (
              <Badge variant="outline" className="bg-slate-700 text-slate-200 border-slate-600">
                {manualCount} Tech Partners
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {data?.summary && (
          <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
            <p className="text-sm text-slate-300 leading-relaxed">{data.summary}</p>
          </div>
        )}

        <div className="space-y-4">
          {uniquePartnerships.map((partnership, idx) => (
            <div key={idx} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h4 className="font-semibold text-white text-lg">
                      {partnership.provider_name || partnership.partner_name}
                    </h4>
                    {partnership.partnership_type && (
                      <Badge variant="outline" className={getPartnershipTypeColor(partnership.partnership_type)}>
                        {partnership.partnership_type}
                      </Badge>
                    )}
                    {!partnership.isManual && (
                      <Badge className="bg-blue-600 text-white flex items-center gap-1">
                        <Newspaper className="w-3 h-3" />
                        Auto-detected
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed mb-3">
                    {partnership.snippet || partnership.description || partnership.context}
                  </p>
                  {partnership.date && (
                    <p className="text-xs text-slate-400 mb-2">
                      {safeFormatDate(partnership.date)}
                    </p>
                  )}
                  {partnership.source_article_title && !partnership.isManual && (
                    <p className="text-xs text-slate-500 italic mb-2">
                      Source: {partnership.source_article_title}
                    </p>
                  )}
                </div>
              </div>
              {partnership.source_url && (
                <a 
                  href={partnership.source_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  {partnership.isManual ? 'View Partnership Details' : 'Read Source Article'}
                </a>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
