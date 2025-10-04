
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award } from "lucide-react";

export default function AuthoritySignals({ data }) {
  if (!data) return null;
  const hasAwards = data.awards && data.awards.length > 0;
  const hasRecognitions = data.recognitions && data.recognitions.length > 0;
  if (!hasAwards && !hasRecognitions) return null;

  return (
    <Card className="shadow-lg border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl text-blue-900">
          <Award className="w-6 h-6" />
          Authority & Social Proof
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-600 mb-4">{data.summary}</p>
        <div className="space-y-3">
          {hasAwards && (
            <div>
              <h4 className="font-semibold text-sm mb-2">Awards</h4>
              <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                {data.awards.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          )}
          {hasRecognitions && (
            <div>
              <h4 className="font-semibold text-sm mb-2 mt-3">Analyst Recognitions</h4>
              <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                {data.recognitions.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
