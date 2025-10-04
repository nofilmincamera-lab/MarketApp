
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Star, Zap } from "lucide-react";
import { safeFormatDate, safeParseDateISO, isValidDate } from "@/components/dateUtils";

export default function LeadershipSection({ data, companyProfile }) {
  // Filter to last 12 months WITH SAFE DATE VALIDATION
  const recentChanges = (data?.changes || []).filter(change => {
    if (!change.date || !isValidDate(change.date)) return false;
    
    try {
      const changeDate = safeParseDateISO(change.date);
      if (!changeDate) return false;
      
      const now = new Date();
      const monthsDiff = (now.getFullYear() - changeDate.getFullYear()) * 12 + (now.getMonth() - changeDate.getMonth());
      return monthsDiff >= 0 && monthsDiff <= 12;
    } catch (e) {
      console.error('Date filtering error in LeadershipSection:', e, change.date);
      return false;
    }
  });

  const getChangeIcon = (type) => {
    if (!type) return null;
    const lowerType = type.toLowerCase();
    if (lowerType.includes('new') || lowerType.includes('hire') || lowerType.includes('join')) {
      return <TrendingUp className="w-5 h-5 text-emerald-600" />;
    }
    if (lowerType.includes('depart') || lowerType.includes('resign') || lowerType.includes('exit')) {
      return <TrendingUp className="w-5 h-5 text-red-600 rotate-180" />;
    }
    if (lowerType.includes('promot') || lowerType.includes('elevat')) {
      return <Star className="w-5 h-5 text-amber-600" />;
    }
    return <Zap className="w-5 h-5 text-blue-600" />;
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Narrative Summary */}
      <Card className="shadow-xl border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Leadership Dynamics Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {data?.summary ? (
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-900 leading-relaxed whitespace-pre-line">{data.summary}</p>
            </div>
          ) : (
            <p className="text-slate-500 italic">No leadership summary available.</p>
          )}
        </CardContent>
      </Card>

      {/* Timeline of Changes */}
      <Card className="shadow-xl border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            Recent Leadership Changes (Last 12 Months)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {recentChanges.length > 0 ? (
            <div className="space-y-4">
              {recentChanges.map((change, idx) => (
                <div key={idx} className="flex gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    {getChangeIcon(change.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-slate-900">{change.name}</h4>
                        <p className="text-sm text-slate-600">{change.position}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {safeFormatDate(change.date, 'MMMM yyyy')}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-700 mb-2">{change.impact}</p>
                    {change.champion_potential && change.champion_potential.is_potential_champion && (
                      <div className="mt-2 p-2 bg-purple-50 rounded border border-purple-200">
                        <p className="text-xs font-semibold text-purple-900 mb-1">💡 Champion Potential</p>
                        <p className="text-xs text-purple-800">{change.champion_potential.rationale}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic">No significant leadership changes in the last 12 months.</p>
          )}
        </CardContent>
      </Card>

      {/* Potential Champions */}
      {data?.potential_champions && data.potential_champions.length > 0 && (
        <Card className="shadow-xl border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-6 h-6 text-amber-600" />
              Potential Internal Champions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {data.potential_champions.map((champion, idx) => (
                <div key={idx} className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border-2 border-amber-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-amber-900 text-lg">{champion.name}</h4>
                      <p className="text-sm text-amber-700 font-medium">{champion.title}</p>
                    </div>
                    <Badge className={`${
                      champion.influence_level === 'high' ? 'bg-green-100 text-green-900' :
                      champion.influence_level === 'medium' ? 'bg-amber-100 text-amber-900' :
                      'bg-slate-100 text-slate-900'
                    }`}>
                      {champion.influence_level} influence
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="p-3 bg-white rounded border border-amber-200">
                      <p className="text-xs font-semibold text-amber-900 mb-1">Motivation:</p>
                      <p className="text-sm text-amber-800">{champion.motivation}</p>
                    </div>
                    
                    {champion.access_to_economic_buyer && (
                      <div className="p-3 bg-white rounded border border-amber-200">
                        <p className="text-xs font-semibold text-amber-900 mb-1">Access to Economic Buyer:</p>
                        <p className="text-sm text-amber-800">{champion.access_to_economic_buyer}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leadership Team */}
      {companyProfile?.executives && companyProfile.executives.length > 0 && (
        <Card className="shadow-xl border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-600" />
              Current Leadership Team
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {companyProfile.executives.map((exec, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="font-semibold text-slate-900">{exec.name}</p>
                  <p className="text-sm text-slate-600">{exec.title}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
