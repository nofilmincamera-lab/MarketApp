import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCircle } from "lucide-react";

export default function LeadershipTeam({ team }) {
  if (!team || team.length === 0) return null;
  return (
    <Card className="shadow-lg border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl text-blue-900">
          <Users className="w-6 h-6" />
          Leadership Team
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {team.map((member, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-start gap-3">
                    <UserCircle className="w-8 h-8 text-slate-400 mt-1 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold text-blue-900">{member.name}</h4>
                        <p className="text-sm text-slate-500 mb-2">{member.title}</p>
                        <p className="text-sm text-slate-700">{member.bio_summary}</p>
                    </div>
                </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}