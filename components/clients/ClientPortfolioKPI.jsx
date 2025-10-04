
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Target, TrendingUp, Building2, Briefcase, Lightbulb } from "lucide-react";

export default function ClientPortfolioKPI({ clients }) {
  const portfolioStats = useMemo(() => {
    if (!clients || clients.length === 0) {
      return {
        totalClients: 0,
        totalRelationships: 0,
        currentPartnerships: [],
        whitespaceOpportunities: [],
        industryBreakdown: []
      };
    }

    // Aggregate current partnerships (known_relationships)
    const partnershipMap = new Map();
    const whitespaceMap = new Map();
    const industryMap = new Map();
    let totalRelationships = 0;

    clients.forEach(client => {
      // Parse company profile for industry
      let industry = 'Unknown';
      try {
        const profile = typeof client.company_profile === 'string'
          ? JSON.parse(client.company_profile)
          : client.company_profile;
        if (profile?.industry) {
          industry = profile.industry;
        }
      } catch (e) {
        // ignore parse errors
      }

      // Count industries
      industryMap.set(industry, (industryMap.get(industry) || 0) + 1);

      // Count current partnerships
      if (client.known_relationships && Array.isArray(client.known_relationships)) {
        totalRelationships += client.known_relationships.length;
        
        client.known_relationships.forEach(rel => {
          const lob = rel.line_of_business || rel.department;
          if (lob) {
            const existing = partnershipMap.get(lob) || { count: 0, clients: [] };
            existing.count++;
            existing.clients.push(client.prospect_name);
            partnershipMap.set(lob, existing);
          }
        });
      }

      // Identify whitespace opportunities
      try {
        const footprint = typeof client.client_service_footprint === 'string'
          ? JSON.parse(client.client_service_footprint)
          : client.client_service_footprint;

        if (Array.isArray(footprint)) {
          // Get known LOBs for this client
          const knownLOBs = new Set(
            (client.known_relationships || [])
              .map(r => (r.line_of_business || r.department)?.toLowerCase().trim())
              .filter(Boolean)
          );

          // Find business units we don't have
          footprint.forEach(unit => {
            const bu = unit.business_unit;
            if (bu && !knownLOBs.has(bu.toLowerCase().trim())) {
              const existing = whitespaceMap.get(bu) || { count: 0, clients: [] };
              existing.count++;
              existing.clients.push(client.prospect_name);
              whitespaceMap.set(bu, existing);
            }
          });
        }
      } catch (e) {
        // ignore parse errors
      }
    });

    // Convert maps to sorted arrays
    const currentPartnerships = Array.from(partnershipMap.entries())
      .map(([lob, data]) => ({ name: lob, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10

    const whitespaceOpportunities = Array.from(whitespaceMap.entries())
      .map(([bu, data]) => ({ name: bu, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10

    const industryBreakdown = Array.from(industryMap.entries())
      .map(([industry, count]) => ({ industry, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalClients: clients.length,
      totalRelationships,
      currentPartnerships,
      whitespaceOpportunities,
      industryBreakdown
    };
  }, [clients]);

  return (
    <div className="space-y-6 mb-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-xl" style={{ 
          borderColor: 'hsl(var(--border))',
          background: 'hsl(var(--warm-white))'
        }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, hsl(var(--teal-accent)), hsl(180 60% 60%))'
              }}>
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'hsl(var(--charcoal))', opacity: 0.6 }}>
                  Total Clients
                </p>
                <p className="text-3xl font-bold" style={{ color: 'hsl(var(--navy-dark))' }}>
                  {portfolioStats.totalClients}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl" style={{ 
          borderColor: 'hsl(var(--border))',
          background: 'hsl(var(--warm-white))'
        }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, hsl(var(--navy-medium)), hsl(var(--navy-light)))'
              }}>
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'hsl(var(--charcoal))', opacity: 0.6 }}>
                  Active Relationships
                </p>
                <p className="text-3xl font-bold" style={{ color: 'hsl(var(--navy-dark))' }}>
                  {portfolioStats.totalRelationships}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl" style={{ 
          borderColor: 'hsl(var(--border))',
          background: 'hsl(var(--warm-white))'
        }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, hsl(var(--gold-accent)), hsl(45 80% 65%))'
              }}>
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'hsl(var(--charcoal))', opacity: 0.6 }}>
                  Service Lines
                </p>
                <p className="text-3xl font-bold" style={{ color: 'hsl(var(--navy-dark))' }}>
                  {portfolioStats.currentPartnerships.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl" style={{ 
          borderColor: 'hsl(var(--border))',
          background: 'hsl(var(--warm-white))'
        }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, hsl(270 60% 50%), hsl(270 50% 60%))'
              }}>
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'hsl(var(--charcoal))', opacity: 0.6 }}>
                  Whitespace Opps
                </p>
                <p className="text-3xl font-bold" style={{ color: 'hsl(var(--navy-dark))' }}>
                  {portfolioStats.whitespaceOpportunities.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Industry Breakdown */}
      {portfolioStats.industryBreakdown.length > 0 && (
        <Card className="shadow-xl" style={{ 
          borderColor: 'hsl(var(--border))',
          background: 'hsl(var(--warm-white))'
        }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg" style={{ color: 'hsl(var(--navy-dark))' }}>
              <Building2 className="w-5 h-5" style={{ color: 'hsl(var(--charcoal))' }} />
              Client Portfolio by Industry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {portfolioStats.industryBreakdown.map((item, idx) => (
                <Badge key={idx} className="px-3 py-1.5 text-sm" style={{ 
                  background: 'hsl(var(--navy-light))', 
                  color: 'hsl(var(--navy-dark))', 
                  borderColor: 'hsl(var(--navy-medium))' 
                }}>
                  {item.industry} ({item.count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Partnerships & Whitespace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Partnerships */}
        <Card className="shadow-xl" style={{ 
          borderColor: 'hsl(var(--border))',
          background: 'hsl(var(--warm-white))'
        }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg" style={{ color: 'hsl(var(--navy-dark))' }}>
              <TrendingUp className="w-5 h-5" style={{ color: 'hsl(var(--teal-accent))' }} />
              Current Partnerships
            </CardTitle>
            <p className="text-sm" style={{ color: 'hsl(var(--charcoal))', opacity: 0.8 }}>Business units where we have active relationships</p>
          </CardHeader>
          <CardContent>
            {portfolioStats.currentPartnerships.length > 0 ? (
              <div className="space-y-3">
                {portfolioStats.currentPartnerships.map((partnership, idx) => (
                  <div key={idx} className="p-3 rounded-lg" style={{ 
                    background: 'hsl(180 60% 95%)', // Lightened version of teal-accent
                    border: '1px solid hsl(180 60% 85%)' // Border version of teal-accent
                  }}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold" style={{ color: 'hsl(var(--navy-dark))' }}>{partnership.name}</p>
                      <Badge style={{ 
                        background: 'hsl(var(--teal-accent))', 
                        color: 'white', 
                        borderColor: 'hsl(var(--teal-accent))' 
                      }}>{partnership.count} client{partnership.count !== 1 ? 's' : ''}</Badge>
                    </div>
                    <p className="text-xs" style={{ color: 'hsl(var(--charcoal))', opacity: 0.8 }}>
                      {partnership.clients.slice(0, 3).join(", ")}
                      {partnership.clients.length > 3 && ` +${partnership.clients.length - 3} more`}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm italic" style={{ color: 'hsl(var(--charcoal))', opacity: 0.8 }}>No partnerships documented yet</p>
            )}
          </CardContent>
        </Card>

        {/* Whitespace Opportunities */}
        <Card className="shadow-xl" style={{ 
          borderColor: 'hsl(var(--border))',
          background: 'hsl(var(--warm-white))'
        }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg" style={{ color: 'hsl(var(--navy-dark))' }}>
              <Lightbulb className="w-5 h-5" style={{ color: 'hsl(270 60% 50%)' }} />
              Whitespace Opportunities
            </CardTitle>
            <p className="text-sm" style={{ color: 'hsl(var(--charcoal))', opacity: 0.8 }}>Business units with no current relationships</p>
          </CardHeader>
          <CardContent>
            {portfolioStats.whitespaceOpportunities.length > 0 ? (
              <div className="space-y-3">
                {portfolioStats.whitespaceOpportunities.map((opp, idx) => (
                  <div key={idx} className="p-3 rounded-lg" style={{ 
                    background: 'hsl(270 60% 95%)', // Lightened version of purple accent
                    border: '1px solid hsl(270 60% 85%)' // Border version of purple accent
                  }}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold" style={{ color: 'hsl(var(--navy-dark))' }}>{opp.name}</p>
                      <Badge style={{ 
                        background: 'hsl(270 60% 50%)', 
                        color: 'white', 
                        borderColor: 'hsl(270 60% 50%)' 
                      }}>{opp.count} client{opp.count !== 1 ? 's' : ''}</Badge>
                    </div>
                    <p className="text-xs" style={{ color: 'hsl(var(--charcoal))', opacity: 0.8 }}>
                      {opp.clients.slice(0, 3).join(", ")}
                      {opp.clients.length > 3 && ` +${opp.clients.length - 3} more`}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm italic" style={{ color: 'hsl(var(--charcoal))', opacity: 0.8 }}>No whitespace opportunities identified</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
