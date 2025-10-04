import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Landmark } from "lucide-react";

export default function CompanyHistory({ history }) {
  if (!history) return null;
  return (
    <Card className="shadow-lg border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl text-blue-900">
          <Landmark className="w-6 h-6" />
          Company History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{history}</p>
      </CardContent>
    </Card>
  );
}