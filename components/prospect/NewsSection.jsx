
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, ExternalLink, AlertTriangle, Scale, TrendingUp, Handshake, Briefcase, Building2 } from "lucide-react";
import { safeFormatDate } from "@/components/dateUtils";

export default function NewsSection({ news, bpoProviders = [] }) {
  const getCategoryIcon = (category) => {
    const icons = {
      "Regulatory & Fines": <Scale className="w-4 h-4" />,
      "Business Changes": <Briefcase className="w-4 h-4" />,
      "Expansion": <TrendingUp className="w-4 h-4" />,
      "Partnerships": <Handshake className="w-4 h-4" />,
      "General": <Newspaper className="w-4 h-4" />
    };
    return icons[category] || icons["General"];
  };

  const getCategoryColor = (category) => {
    const colors = {
      "Regulatory & Fines": "bg-red-100 text-red-900 border-red-300",
      "Business Changes": "bg-orange-100 text-orange-900 border-orange-300",
      "Expansion": "bg-green-100 text-green-900 border-green-300",
      "Partnerships": "bg-blue-100 text-blue-900 border-blue-300",
      "General": "bg-slate-100 text-slate-900 border-slate-300"
    };
    return colors[category] || colors["General"];
  };

  // Function to bold provider names in article text
  const highlightProviders = (text, providers) => {
    if (!text || !providers || providers.length === 0) return text;
    
    let highlightedText = text;
    providers.forEach(provider => {
      // Escape special characters in provider name for regex
      const escapedProvider = provider.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b(${escapedProvider})\\b`, 'gi');
      highlightedText = highlightedText.replace(regex, '<strong class="text-blue-700 font-semibold">$1</strong>');
    });
    
    return highlightedText;
  };

  // Count total provider mentions
  const totalMentions = useMemo(() => {
    if (!news) return 0;
    return news.reduce((sum, article) => {
      return sum + (article.mentioned_providers?.length || 0);
    }, 0);
  }, [news]);

  if (!news || news.length === 0) {
    return (
      <Card className="shadow-2xl border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
        <CardHeader className="border-b border-slate-700">
          <CardTitle className="flex items-center gap-3 text-xl text-white">
            <Newspaper className="w-6 h-6 text-slate-300" />
            Latest News & Updates
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center py-8">
            <Newspaper className="w-12 h-12 text-slate-600 mb-4" />
            <p className="text-slate-400">No recent news articles available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-2xl border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
      <CardHeader className="border-b border-slate-700">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl text-white">
            <Newspaper className="w-6 h-6 text-slate-300" />
            Latest News & Updates ({news.length} articles)
          </CardTitle>
          {totalMentions > 0 && (
            <Badge className="bg-blue-600 text-white flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              {totalMentions} Provider {totalMentions === 1 ? 'Mention' : 'Mentions'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {news.map((article, idx) => (
            <div key={idx} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <Badge variant="outline" className={`${getCategoryColor(article.article_category)} flex items-center gap-1`}>
                      {getCategoryIcon(article.article_category)}
                      {article.article_category}
                    </Badge>
                    {article.is_regulatory_issue && (
                      <Badge className="bg-red-600 text-white flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Regulatory Issue
                      </Badge>
                    )}
                    {article.mentioned_providers && article.mentioned_providers.length > 0 && (
                      <Badge className="bg-blue-600 text-white flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {article.mentioned_providers.length} Provider{article.mentioned_providers.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-semibold text-white text-lg mb-2">{article.title}</h4>
                  {article.summary && (
                    <p 
                      className="text-sm text-slate-300 leading-relaxed mb-3"
                      dangerouslySetInnerHTML={{ 
                        __html: highlightProviders(article.summary, article.mentioned_providers || []) 
                      }}
                    />
                  )}
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="font-medium">{article.source}</span>
                    <span>•</span>
                    <span>{safeFormatDate(article.date)}</span>
                  </div>
                </div>
              </div>
              <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Read Full Article
              </a>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
