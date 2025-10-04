
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Calendar, Trophy, Info } from "lucide-react";
import { safeFormatDate } from "@/components/dateUtils";

export default function AwardsAndRecognition({ data }) {
  const getCategoryColor = (type) => {
    const colors = {
      "Customer Service Excellence": "bg-blue-100 text-blue-900 border-blue-300",
      "Technology Innovation": "bg-purple-100 text-purple-900 border-purple-300",
      "Industry Leadership": "bg-amber-100 text-amber-900 border-amber-300",
      "Workplace Culture": "bg-green-100 text-green-900 border-green-300",
      "Operational Excellence": "bg-teal-100 text-teal-900 border-teal-300"
    };
    return colors[type] || "bg-slate-100 text-slate-900 border-slate-300";
  };

  if (!data || (!data.summary && (!data.awards || data.awards.length === 0))) {
    return (
      <Card className="shadow-xl border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-slate-900">
            <Award className="w-6 h-6 text-amber-600" />
            Awards & Industry Recognition
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-lg">
            <Info className="w-10 h-10 text-slate-400 mb-4" />
            <p className="font-medium text-slate-900">No Awards Found</p>
            <p className="text-sm text-slate-600 mt-1">The AI analysis did not identify any public information about awards or industry recognition.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-slate-200 bg-white">
      <CardHeader className="border-b border-slate-200">
        <CardTitle className="flex items-center gap-3 text-xl text-slate-900">
          <Trophy className="w-6 h-6 text-amber-600" />
          Awards & Industry Recognition
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {data.summary && (
          <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-slate-900 leading-relaxed">{data.summary}</p>
          </div>
        )}

        {data.awards && data.awards.length > 0 && (
          <div className="space-y-4">
            {data.awards.map((award, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-amber-300 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h4 className="font-semibold text-slate-900 text-lg">{award.award_name}</h4>
                      {award.type && (
                        <Badge variant="outline" className={getCategoryColor(award.type)}>
                          {award.type}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 mb-2">
                      <span className="font-medium">Awarded by:</span> {award.awarding_body}
                    </p>
                    {award.summary && (
                      <p className="text-sm text-slate-700 mb-3 leading-relaxed">{award.summary}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      {award.year && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {award.year}
                        </span>
                      )}
                      {award.award_date && (
                        <span>
                          {safeFormatDate(award.award_date)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Award className="w-8 h-8 text-amber-500 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
