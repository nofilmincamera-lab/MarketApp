
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Users, DollarSign, Globe, Phone, Info, ExternalLink } from "lucide-react";

export default function CompanyOverview({ data }) {
  if (!data) {
    return (
      <Card className="shadow-xl border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-slate-900">
            <Building2 className="w-6 h-6 text-blue-600" />
            Company Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-lg">
            <Info className="w-10 h-10 text-slate-400 mb-4" />
            <p className="font-medium text-slate-900">No Company Data</p>
            <p className="text-sm text-slate-700 mt-1">Run or re-run the analysis to generate company profile.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-slate-200 bg-white">
      <CardHeader className="border-b border-slate-200">
        <CardTitle className="flex items-center gap-3 text-xl text-slate-900">
          <Building2 className="w-6 h-6 text-blue-600" />
          Company Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Basic Information</h3>
            <div className="space-y-3">
              {data.description && (
                <p className="text-sm text-slate-800 leading-relaxed">{data.description}</p>
              )}
              
              {data.industry && (
                <div className="flex items-start gap-2">
                  <Building2 className="w-4 h-4 text-slate-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-slate-600">Industry</p>
                    <p className="text-sm text-slate-900">{data.industry}</p>
                  </div>
                </div>
              )}
              
              {data.headquarters && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-slate-600">Headquarters</p>
                    <p className="text-sm text-slate-900">
                      {[data.headquarters.city, data.headquarters.state, data.headquarters.country].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </div>
              )}
              
              {data.website && (
                <div className="flex items-start gap-2">
                  <Globe className="w-4 h-4 text-slate-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-slate-600">Website</p>
                    <a href={data.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                      {data.website}
                    </a>
                  </div>
                </div>
              )}
              
              {data.phone && (
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-slate-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-slate-600">Phone</p>
                    <p className="text-sm text-slate-900">{data.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Company Details</h3>
            <div className="space-y-3">
              {data.employee_count && (
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-slate-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-slate-600">Employees</p>
                    <p className="text-sm text-slate-900">{data.employee_count}</p>
                  </div>
                </div>
              )}
              
              {data.revenue && (
                <div className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-slate-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-slate-600">Revenue</p>
                    <p className="text-sm text-slate-900">{data.revenue}</p>
                  </div>
                </div>
              )}
              
              {data.founded_year && (
                <div>
                  <p className="text-xs font-medium text-slate-600">Founded</p>
                  <p className="text-sm text-slate-900">{data.founded_year}</p>
                </div>
              )}
              
              {data.company_type && (
                <div>
                  <p className="text-xs font-medium text-slate-600">Company Type</p>
                  <p className="text-sm text-slate-900">{data.company_type}</p>
                </div>
              )}
              
              {data.stock_symbol && (
                <div>
                  <p className="text-xs font-medium text-slate-600">Stock Symbol</p>
                  <Badge className="bg-blue-100 text-blue-900">{data.stock_symbol}</Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        {data.executives && data.executives.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-3">Leadership Team</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {data.executives.map((exec, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                  <p className="font-medium text-slate-900">{exec.name}</p>
                  <p className="text-sm text-slate-700">{exec.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.technologies && data.technologies.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-3">Technologies</h3>
            <div className="flex flex-wrap gap-2">
              {data.technologies.map((tech, idx) => (
                <Badge key={idx} variant="secondary" className="bg-slate-100 text-slate-900">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {data.social_media && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-3">Social Media</h3>
            <div className="flex gap-3">
              {data.social_media.linkedin && (
                <a href={data.social_media.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  LinkedIn
                </a>
              )}
              {data.social_media.twitter && (
                <a href={data.social_media.twitter} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  Twitter
                </a>
              )}
              {data.social_media.facebook && (
                <a href={data.social_media.facebook} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  Facebook
                </a>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
