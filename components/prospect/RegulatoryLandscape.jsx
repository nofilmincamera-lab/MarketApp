import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function RegulatoryLandscape({ data }) {
    if (!data) return null;
    return (
        <Card className="shadow-lg border-slate-200">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl text-emerald-800">
                <ShieldCheck className="w-6 h-6" />
                Regulatory Landscape
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-slate-600 mb-4">{data.summary}</p>
                <div className="space-y-3">
                    {data.pressures?.map((driver, idx) => (
                        <div key={idx} className="text-sm p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                            <p className="font-semibold text-emerald-900 mb-1">{driver.regulation}</p>
                            <p className="text-slate-700">{driver.impact}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}