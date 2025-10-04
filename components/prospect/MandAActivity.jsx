
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, TrendingUp, Users, DollarSign, ExternalLink, Info } from "lucide-react";
import { safeFormatDate } from "@/components/dateUtils";

export default function MandAActivity({ data }) {
  const getActivityIcon = (type) => {
    const icons = {
      "acquisition": <TrendingUp className="w-5 h-5 text-blue-600" />,
      "merger": <Users className="w-5 h-5 text-purple-600" />,
      "divestiture": <DollarSign className="w-5 h-5 text-amber-600" />,
      "joint venture": <Briefcase className="w-5 h-5 text-green-600" />
    };
    return icons[type?.toLowerCase()] || <Briefcase className="w-5 h-5 text-slate-600" />;
  };

  const getActivityColor = (type) => {
    const colors = {
      "acquisition": "bg-blue-100 text-blue-900 border-blue-300",
      "merger": "bg-purple-100 text-purple-900 border-purple-300",
      "divestiture": "bg-amber-100 text-amber-900 border-amber-300",
      "joint venture": "bg-green-100 text-green-900 border-green-300"
    };
    return colors[type?.toLowerCase()] || "bg-slate-100 text-slate-900 border-slate-300";
  };

  if (!data || (!data.summary && (!data.events || data.events.length === 0))) {
    return (
      <Card className="shadow-xl border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-slate-900">
            <Briefcase className="w-6 h-6 text-indigo-600" />
            M&A Activity (Last 3 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-lg">
            <Info className="w-10 h-10 text-slate-400 mb-4" />
            <p className="font-medium text-slate-900">No Recent M&A Activity</p>
            <p className="text-sm text-slate-600 mt-1">No merger, acquisition, or divestiture activity detected in the last 3 months.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-slate-200 bg-white">
      <CardHeader className="border-b border-slate-200">
        <CardTitle className="flex items-center gap-3 text-xl text-slate-900">
          <Briefcase className="w-6 h-6 text-indigo-600" />
          M&A Activity (Last 3 Months)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {data.summary && (
          <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <p className="text-sm text-slate-900 leading-relaxed">{data.summary}</p>
          </div>
        )}

        {data.events && data.events.length > 0 && (
          <div className="space-y-4">
            {data.events.map((event, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors">
                <div className="flex items-start gap-4 mb-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(event.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-slate-900 text-lg mb-1">{event.title}</h4>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          {event.type && (
                            <Badge variant="outline" className={getActivityColor(event.type)}>
                              {event.type}
                            </Badge>
                          )}
                          {event.date && (
                            <span className="text-xs text-slate-600">
                              {safeFormatDate(event.date)}
                            </span>
                          )}
                        </div>
                      </div>
                      {event.value && (
                        <Badge className="bg-green-100 text-green-900 border-green-300">
                          {event.value}
                        </Badge>
                      )}
                    </div>

                    {event.parties && event.parties.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-semibold text-slate-700 mb-1">Parties Involved:</p>
                        <div className="flex flex-wrap gap-1">
                          {event.parties.map((party, pidx) => (
                            <Badge key={pidx} variant="secondary" className="text-xs">
                              {party}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {event.description && (
                      <p className="text-sm text-slate-700 mb-2 leading-relaxed">{event.description}</p>
                    )}

                    {event.strategic_rationale && (
                      <div className="p-3 bg-white rounded border border-indigo-200 mb-2">
                        <p className="text-xs font-semibold text-indigo-900 mb-1">Strategic Rationale:</p>
                        <p className="text-sm text-indigo-800">{event.strategic_rationale}</p>
                      </div>
                    )}

                    {event.source_url && (
                      <a 
                        href={event.source_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Source
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
