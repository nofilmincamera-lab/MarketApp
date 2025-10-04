import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ExternalLink, Info } from "lucide-react";
import { safeFormatDate } from "@/components/dateUtils";

export default function AiAutomationInitiatives({ data }) {
  if (!data || (!data.summary && (!data.top_findings || data.top_findings.length === 0))) {
    return (
      <Card className="shadow-xl border-[#2B3648] bg-[#1B2230]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-[#F8F9FA]">
            <Sparkles className="w-6 h-6 text-[#7D5FFF]" />
            AI & Automation Initiatives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center p-8 bg-[#20293A] rounded-lg">
            <Info className="w-10 h-10 text-[#6C7A91] mb-4" />
            <p className="font-medium text-[#F8F9FA]">No AI/Automation Initiatives Found</p>
            <p className="text-sm text-[#A0AEC0] mt-1">The AI analysis did not identify any public information about AI or automation initiatives.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-[#2B3648] bg-[#1B2230]">
      <CardHeader className="border-b border-[#2B3648]">
        <CardTitle className="flex items-center gap-3 text-xl text-[#F8F9FA]">
          <Sparkles className="w-6 h-6 text-[#7D5FFF]" />
          AI & Automation Initiatives
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {data.summary && (
          <p className="text-[#A0AEC0] mb-6 leading-relaxed">{data.summary}</p>
        )}

        {data.top_findings && data.top_findings.length > 0 && (
          <div className="space-y-4">
            {data.top_findings.map((finding, idx) => (
              <div key={idx} className="p-4 bg-[#7D5FFF]/10 rounded-lg border border-[#7D5FFF]/30">
                <h4 className="font-semibold text-[#F8F9FA] mb-2">{finding.title}</h4>
                <p className="text-sm text-[#A0AEC0] mb-3 leading-relaxed">{finding.description}</p>
                {finding.source_url && (
                  <a 
                    href={finding.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 text-sm text-[#7D5FFF] hover:text-[#9B82FF] font-medium"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View Source
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}