import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Info, TrendingUp } from "lucide-react";

export default function QualificationSummary({ data }) {
  if (!data) {
    return (
      <Card className="shadow-xl border-[#2B3648] bg-[#1B2230]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-[#F8F9FA]">
            <Target className="w-6 h-6 text-[#20A4F3]" />
            Qualification Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center p-8 bg-[#20293A] rounded-lg">
            <Info className="w-10 h-10 text-[#6C7A91] mb-4" />
            <p className="font-medium text-[#F8F9FA]">No Qualification Data</p>
            <p className="text-sm text-[#A0AEC0] mt-1">Run or re-run the analysis to generate qualification assessment.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const fitScore = data.fit_score || 0;
  const getScoreColor = (score) => {
    if (score >= 8) return 'text-emerald-400';
    if (score >= 6) return 'text-[#20A4F3]';
    if (score >= 4) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 8) return 'bg-emerald-500/10 border-emerald-500/30';
    if (score >= 6) return 'bg-[#20A4F3]/10 border-[#20A4F3]/30';
    if (score >= 4) return 'bg-amber-500/10 border-amber-500/30';
    return 'bg-red-500/10 border-red-500/30';
  };

  const getScoreLabel = (score) => {
    if (score >= 8) return 'Excellent Fit';
    if (score >= 6) return 'Good Fit';
    if (score >= 4) return 'Moderate Fit';
    return 'Low Fit';
  };

  return (
    <Card className="shadow-xl border-[#2B3648] bg-[#1B2230]">
      <CardHeader className="border-b border-[#2B3648]">
        <CardTitle className="flex items-center gap-3 text-xl text-[#F8F9FA]">
          <Target className="w-6 h-6 text-[#20A4F3]" />
          Qualification Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className={`p-6 rounded-xl border-2 ${getScoreBg(fitScore)} mb-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#A0AEC0] mb-2">Prospect Fit Score</p>
              <p className={`text-5xl font-bold ${getScoreColor(fitScore)}`}>{fitScore}<span className="text-2xl">/10</span></p>
              <p className={`text-sm font-semibold mt-1 ${getScoreColor(fitScore)}`}>{getScoreLabel(fitScore)}</p>
            </div>
            <TrendingUp className={`w-16 h-16 ${getScoreColor(fitScore)} opacity-20`} />
          </div>
        </div>

        <div>
          <p className="font-semibold text-[#F8F9FA] mb-3">Assessment:</p>
          <p className="text-[#A0AEC0] leading-relaxed">{data.summary}</p>
        </div>
      </CardContent>
    </Card>
  );
}