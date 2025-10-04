import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, MessageSquareQuote } from "lucide-react";

export default function CustomerStoryCues({ cues }) {
  return (
    <Card className="shadow-lg border-slate-200 mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl text-purple-800">
          <Lightbulb className="w-6 h-6" />
          Customer Story Cues
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-600 mb-6">Insights from prospect feedback to frame your value proposition.</p>
        <div className="space-y-4">
          {cues?.map((cue, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <p className="font-semibold text-purple-900 mb-2">{cue.cue}</p>
              <p className="text-sm text-slate-700 flex items-start gap-2">
                <MessageSquareQuote className="w-4 h-4 text-purple-700 mt-0.5 flex-shrink-0" />
                <span><span className="font-semibold">Talking Point:</span> {cue.talking_point}</span>
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}