
import React, { useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Target, 
  TrendingUp, 
  Users, 
  Palette,
  Award,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  Repeat
} from "lucide-react";
import { safeFormatDate, safeParseDateISO, isValidDate } from "@/components/dateUtils";

export default function KeyInsights({ 
  prospectName, 
  relationships, 
  brandColors, 
  leadershipChanges, 
  companyProfile, 
  clientServiceFootprint, 
  analystRankings,
  missionStatement,
  maActivity,
  onMissionChange = () => {},
}) {
  const isValidColor = (str) => /^#([0-9A-F]{3}){1,2}$/i.test(str);

  // Separate business units into engaged and whitespace (excluding inactive)
  const engagedUnits = clientServiceFootprint?.filter(unit => unit.is_current_engagement && !unit.is_inactive) || [];
  const notEngagedUnits = clientServiceFootprint?.filter(unit => !unit.is_current_engagement && !unit.is_inactive) || [];

  // Derive counts for the summary card
  const whitespaceCount = notEngagedUnits.length;
  const activeEngagements = engagedUnits.length;

  // Filter leadership changes to last 12 months - WITH SAFE DATE VALIDATION
  const recentChanges = (leadershipChanges?.changes || []).filter(change => {
    if (!change.date || !isValidDate(change.date)) return false;
    
    try {
      const changeDate = safeParseDateISO(change.date);
      if (!changeDate) return false;
      
      const now = new Date();
      const monthsDiff = (now.getFullYear() - changeDate.getFullYear()) * 12 + (now.getMonth() - changeDate.getMonth());
      return monthsDiff >= 0 && monthsDiff <= 12;
    } catch (e) {
      console.error('Date filtering error:', e, change.date);
      return false;
    }
  });

  // Generate high-level bullet points for leadership
  const leadershipBullets = useMemo(() => {
    const bullets = [];
    
    // Count by change type
    const newHires = recentChanges.filter(change => 
      change.type?.toLowerCase().includes('new') || 
      change.type?.toLowerCase().includes('hire') || 
      change.type?.toLowerCase().includes('join')
    );
    
    const departures = recentChanges.filter(change => 
      change.type?.toLowerCase().includes('depart') || 
      change.type?.toLowerCase().includes('resign') || 
      change.type?.toLowerCase().includes('exit')
    );
    
    const promotions = recentChanges.filter(change => 
      change.type?.toLowerCase().includes('promot') || 
      change.type?.toLowerCase().includes('elevat')
    );

    // Add bullets for significant changes
    if (newHires.length > 0) {
      // Sort to get the most recent hire first
      newHires.sort((a, b) => {
        const dateA = safeParseDateISO(a.date);
        const dateB = safeParseDateISO(b.date);
        return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
      });
      const topHire = newHires[0];
      bullets.push({
        type: 'addition',
        icon: ArrowUpRight,
        text: `${topHire.name} joined as ${topHire.position}`,
        color: 'text-emerald-400'
      });
      if (newHires.length > 1) {
        bullets.push({
          type: 'addition',
          icon: ArrowUpRight,
          text: `${newHires.length - 1} additional executive hire${newHires.length > 2 ? 's' : ''}`,
          color: 'text-emerald-400'
        });
      }
    }

    if (departures.length > 0) {
      // Sort to get the most recent departure first
      departures.sort((a, b) => {
        const dateA = safeParseDateISO(a.date);
        const dateB = safeParseDateISO(b.date);
        return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
      });
      const topDeparture = departures[0];
      bullets.push({
        type: 'attrition',
        icon: ArrowDownRight,
        text: `${topDeparture.name} departed from ${topDeparture.position}`,
        color: 'text-red-400'
      });
      if (departures.length > 1) {
        bullets.push({
          type: 'attrition',
          icon: ArrowDownRight,
          text: `${departures.length - 1} additional executive departure${departures.length > 2 ? 's' : ''}`,
          color: 'text-red-400'
        });
      }
    }

    if (promotions.length > 0) {
      // Sort to get the most recent promotion first
      promotions.sort((a, b) => {
        const dateA = safeParseDateISO(a.date);
        const dateB = safeParseDateISO(b.date);
        return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
      });
      const topPromotion = promotions[0];
      bullets.push({
        type: 'change',
        icon: Repeat,
        text: `${topPromotion.name} promoted to ${topPromotion.position}`,
        color: 'text-blue-400'
      });
    }

    // If no specific changes, but there are some recent changes, add a neutral bullet
    if (bullets.length === 0 && recentChanges.length > 0) {
      bullets.push({
        type: 'info',
        icon: Users,
        text: `${recentChanges.length} leadership change${recentChanges.length > 1 ? 's' : ''} in last 12 months`,
        color: 'text-slate-400'
      });
    }

    return bullets;
  }, [recentChanges]);

  // Extract M&A summary for Summary Card
  const maSummary = maActivity?.summary || null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Summary Card */}
      <Card className="shadow-2xl border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 lg:col-span-2">
        <CardContent className="p-6 space-y-6">
          {/* Company Info */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{prospectName}</h2>
                {companyProfile?.description && (
                  <p className="text-slate-300 text-sm leading-relaxed">{companyProfile.description}</p>
                )}
              </div>
              {companyProfile?.logo_url && (
                <img 
                  src={companyProfile.logo_url} 
                  alt={`${prospectName} logo`} 
                  className="w-16 h-16 object-contain bg-white rounded-xl p-2 shadow-lg flex-shrink-0" 
                />
              )}
            </div>

            {companyProfile && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                {companyProfile.industry && (
                  <div className="p-3 bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">Industry</p>
                    <p className="text-sm font-semibold text-white">{companyProfile.industry}</p>
                  </div>
                )}
                {companyProfile.headquarters && (
                  <div className="p-3 bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">Headquarters</p>
                    <p className="text-sm font-semibold text-white">
                      {[companyProfile.headquarters.city, companyProfile.headquarters.state, companyProfile.headquarters.country]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                )}
                {companyProfile.employee_count && (
                  <div className="p-3 bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">Employees</p>
                    <p className="text-sm font-semibold text-white">{companyProfile.employee_count}</p>
                  </div>
                )}
                {companyProfile.revenue && (
                  <div className="p-3 bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">Revenue</p>
                    <p className="text-sm font-semibold text-white">{companyProfile.revenue}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-700">
            <div className="p-4 bg-gradient-to-br from-emerald-900/40 to-emerald-800/30 rounded-xl border border-emerald-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-emerald-400" />
                <p className="text-xs text-emerald-300 font-semibold uppercase">Current Foothold</p>
              </div>
              <p className="text-3xl font-bold text-white">{activeEngagements}</p>
              <p className="text-xs text-emerald-200 mt-1">Active engagements</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-amber-900/40 to-amber-800/30 rounded-xl border border-amber-700/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                <p className="text-xs text-amber-300 font-semibold uppercase">Whitespace</p>
              </div>
              <p className="text-3xl font-bold text-white">{whitespaceCount}</p>
              <p className="text-xs text-amber-200 mt-1">Expansion opportunities</p>
            </div>
          </div>

          {/* Analyst Rankings */}
          {analystRankings && analystRankings.rankings && analystRankings.rankings.length > 0 && (
            <div className="pt-6 border-t border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-purple-400" />
                <h4 className="text-lg font-semibold text-white">Analyst Recognition</h4>
              </div>
              <div className="space-y-2">
                {analystRankings.rankings.slice(0, 3).map((ranking, idx) => (
                  <div key={idx} className="p-3 bg-purple-900/30 rounded-lg border border-purple-700/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-purple-200">{ranking.research_firm}</p>
                        <p className="text-xs text-purple-300 mt-1">{ranking.report_title}</p>
                      </div>
                      <Badge className="bg-purple-600 text-white text-xs">
                        {ranking.ranking_or_mention}
                      </Badge>
                    </div>
                  </div>
                ))}
                {analystRankings.rankings.length > 3 && (
                  <p className="text-xs text-slate-400 text-center pt-2">
                    +{analystRankings.rankings.length - 3} more rankings (see Client Profile tab)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* M&A Activity Summary */}
          {maSummary && (
            <div className="pt-6 border-t border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="w-5 h-5 text-indigo-400" />
                <h4 className="text-lg font-semibold text-white">Recent M&A Activity</h4>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{maSummary}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Brand Identity & Leadership Dynamics Card */}
      <Card className="shadow-2xl border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
        <CardContent className="p-6 space-y-8">
          {/* Brand Identity */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-5 h-5 text-slate-300" />
              <h4 className="text-lg font-semibold text-white">Brand Identity</h4>
            </div>
            {brandColors && brandColors.filter(isValidColor).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {brandColors.filter(isValidColor).map((color, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-slate-700/50 rounded-lg">
                    <div
                      className="w-8 h-8 rounded border-2 border-slate-600"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs text-slate-300 font-mono">{color}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No brand colors identified yet</p>
            )}
          </div>

          {/* Mission Statement */}
          <div className="pt-6 border-t border-slate-700">
            <h4 className="text-lg font-semibold text-white mb-3">Mission Statement</h4>
            <Textarea
              value={missionStatement || ""}
              onChange={(e) => onMissionChange(e.target.value)}
              placeholder="Add or edit the company's mission statement..."
              className="min-h-[100px] bg-slate-700/50 border-slate-600 text-slate-200 placeholder:text-slate-500"
            />
            <p className="text-xs text-slate-500 mt-2">You can edit this field and save the analysis to persist changes.</p>
          </div>
          
          {/* Leadership Dynamics - HIGH-LEVEL BULLETS */}
          <div className="pt-6 border-t border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-slate-300" />
              <h4 className="text-lg font-semibold text-white">Leadership Dynamics (Last 12 Months)</h4>
            </div>
            {leadershipBullets.length > 0 ? (
              <div className="space-y-2">
                {leadershipBullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 bg-slate-700/30 rounded-lg">
                    <bullet.icon className={`w-4 h-4 mt-0.5 ${bullet.color}`} />
                    <p className="text-sm text-slate-300">{bullet.text}</p>
                  </div>
                ))}
                <p className="text-xs text-slate-500 mt-3 text-center">
                  See Leadership tab for full analysis and champion insights
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No significant leadership changes in the last 12 months</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
