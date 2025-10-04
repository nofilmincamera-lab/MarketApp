import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCog } from "lucide-react";

export default function LeadershipChanges({ data }) {
  if (!data || !data.changes || data.changes.length === 0) return null;
  return (
    <Card className="shadow-lg border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl text-blue-900">
          <UserCog className="w-6 h-6" />
          Leadership Changes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-600 mb-4">{data.summary}</p>
        <div className="space-y-4">
          {data.changes.map((change, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <h4 className="font-semibold text-blue-900">{change.name}</h4>
                <p className="text-sm text-slate-500 mb-1">{change.title}</p>
                <p className="text-sm text-slate-700">{change.implication}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}