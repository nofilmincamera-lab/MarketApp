import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitBranchPlus, Link2, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdjacentOpportunities({ opportunities, relationships, onAddRelationship }) {
  if (!opportunities || opportunities.length === 0) return null;

  const existingDepts = new Set(
    relationships.map(r => r.department.toLowerCase().trim())
  );

  return (
    <Card className="h-full shadow-lg border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl text-blue-900">
          <GitBranchPlus className="w-6 h-6" />
          Key Business Verticals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 mb-4">The prospect's business units that may require CX/BPO support. Click to track a new relationship.</p>
        <div className="space-y-4">
          {opportunities.map((opp, idx) => {
            const isExisting = existingDepts.has(opp.industry_vertical.toLowerCase().trim());
            return (
              <div 
                key={idx} 
                className={`p-4 rounded-lg border group transition-all ${isExisting ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300 cursor-pointer'}`}
                onClick={() => !isExisting && onAddRelationship(opp.industry_vertical)}
              >
                  <div className="flex items-center justify-between">
                    <h4 className={`font-semibold ${isExisting ? 'text-green-900' : 'text-blue-900'} mb-1`}>{opp.industry_vertical}</h4>
                    {isExisting ? (
                        <Badge variant="secondary" className="bg-green-200 text-green-900 gap-1.5"><Link2 className="w-3 h-3"/>Existing</Badge>
                    ) : (
                        <div className="flex items-center gap-1.5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            <PlusCircle className="w-4 h-4" />
                            <span className="text-xs font-medium">Add Relationship</span>
                        </div>
                    )}
                  </div>
                  <p className={`text-sm ${isExisting ? 'text-slate-600' : 'text-slate-700'}`}>{opp.current_operations}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}