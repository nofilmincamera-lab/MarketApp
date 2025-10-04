
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // Added Button import
import { MultiSelect } from "@/components/ui/multi-select";
// Added BookmarkCheck and Loader2 to lucide-react imports
import { Network, CheckCircle2, Circle, MoreVertical, Info, Search, Briefcase, HelpCircle, Sparkles, XCircle, BookmarkCheck, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { BPO_SERVICES } from "@/components/services";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Added new props: onManualRefresh, refreshing, onToggleSaved
export default function ClientServiceMap({ serviceFootprint, relationships, onToggleService, onRelationshipDetailChange, onManualRefresh = () => {}, refreshing = false, onToggleSaved = () => {} }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredServices = serviceFootprint?.filter(service => 
    service.business_unit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Categorize services based on LLM classification and status
  const bpoServices = filteredServices.filter(s => s.is_bpo_offering === true && !s.is_inactive);
  const otherOperations = filteredServices.filter(s => s.is_bpo_offering !== true && !s.is_inactive);
  const inactiveServices = filteredServices.filter(s => s.is_inactive === true);

  const getServiceOptions = (service) => {
    // Use LLM-provided classification to find the correct options
    if (!service.is_bpo_offering || !service.matched_industry || !service.matched_line_of_business) {
      return { contact_channels: [], service_subtypes: [] };
    }
    
    const industry = BPO_SERVICES.find(i => i.industry === service.matched_industry);
    if (!industry) return { contact_channels: [], service_subtypes: [] };
    
    const lob = industry.lines_of_business.find(l => l.name === service.matched_line_of_business);
    if (!lob) return { contact_channels: [], service_subtypes: [] };
    
    return {
      contact_channels: lob.contact_channels || [],
      service_subtypes: lob.service_subtypes || []
    };
  };

  const getRelationshipDetails = (businessUnit) => {
    return relationships?.find(r => r.line_of_business === businessUnit) || {};
  };

  const handleStatusChange = (businessUnit, newStatus) => {
    // newStatus can be: 'active', 'whitespace', or 'inactive'
    onToggleService(businessUnit, newStatus);
  };

  const renderServiceItem = (service, idx, isInactive = false) => {
    const options = getServiceOptions(service);
    const relationshipDetails = getRelationshipDetails(service.business_unit);
    const hasServiceSubtypes = options.service_subtypes.length > 0;
    const isSaved = !!service.saved_to_client; // Added for the saved status

    const handleServiceSubtypeClick = (subtype) => {
      // If inactive, don't allow interaction
      if (service.is_inactive) return;
      
      // If not already engaged, mark as engaged
      if (!service.is_current_engagement) {
        handleStatusChange(service.business_unit, 'active');
      }
      
      // Toggle the clicked subtype
      const currentSubtypes = relationshipDetails.service_subtypes || [];
      let newSubtypes;
      if (currentSubtypes.includes(subtype)) {
        newSubtypes = currentSubtypes.filter(s => s !== subtype);
      } else {
        newSubtypes = [...currentSubtypes, subtype];
      }

      onRelationshipDetailChange(
        service.business_unit, 
        'service_subtypes', 
        newSubtypes
      );
    };
    
    const getBgColor = () => {
      if (service.is_inactive) return 'bg-slate-100 border-slate-300 opacity-60';
      if (service.is_current_engagement) return 'bg-teal-50 border-teal-300';
      return 'bg-slate-50 border-slate-200';
    };

    const getStatusIcon = () => {
      if (service.is_inactive) return <XCircle className="w-5 h-5 text-slate-500" />;
      if (service.is_current_engagement) return <CheckCircle2 className="w-5 h-5 text-white" />;
      return <Circle className="w-5 h-5 text-white" />;
    };

    const getStatusButtonColor = () => {
      if (service.is_inactive) return 'bg-slate-400';
      if (service.is_current_engagement) return 'bg-teal-600';
      return 'bg-slate-400';
    };
    
    return (
      <motion.div
        key={idx}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-lg border-2 transition-all ${getBgColor()}`}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 flex-1">
            <button
              onClick={() => {
                if (service.is_inactive) {
                  handleStatusChange(service.business_unit, 'whitespace');
                } else if (service.is_current_engagement) {
                  handleStatusChange(service.business_unit, 'whitespace');
                } else {
                  handleStatusChange(service.business_unit, 'active');
                }
              }}
              className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity ${getStatusButtonColor()}`}
              title={service.is_inactive ? "Click to reactivate" : "Click to toggle status"}
            >
              {getStatusIcon()}
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h4 className={`font-semibold ${service.is_inactive ? 'text-slate-500' : 'text-slate-900'}`}>
                  {service.business_unit}
                </h4>
                <Badge className={
                  service.is_inactive ? 'bg-slate-200 text-slate-600' :
                  service.is_current_engagement ? 'bg-teal-100 text-teal-900' : 
                  'bg-slate-200 text-slate-700'
                }>
                  {service.is_inactive ? 'Inactive' : service.is_current_engagement ? 'Current Foothold' : 'Whitespace'}
                </Badge>
                {service.saved_to_client && ( // Added "Saved to Client" badge
                  <Badge className="bg-green-100 text-green-900 border-green-300">
                    Saved to Client
                  </Badge>
                )}
                {service.is_bpo_offering && service.matched_line_of_business && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-900 border-blue-300">
                    {service.matched_line_of_business}
                  </Badge>
                )}
              </div>
              <p className={`text-sm leading-relaxed mb-3 ${service.is_inactive ? 'text-slate-500' : 'text-slate-900'}`}>
                {service.description}
              </p>
              
              {/* Service Subtypes Bubbles - Show available service types (only if not inactive) */}
              {hasServiceSubtypes && !service.is_inactive && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Available Service Types {!service.is_current_engagement && <span className="text-indigo-600">(click to activate)</span>}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {options.service_subtypes.slice(0, 8).map((subtype, subIdx) => {
                      const isSelected = relationshipDetails.service_subtypes?.includes(subtype);
                      return (
                        <button
                          key={subIdx}
                          onClick={() => handleServiceSubtypeClick(subtype)}
                          className={`text-xs px-2 py-0.5 rounded-full border transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700'
                              : 'bg-indigo-50 text-indigo-900 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300'
                          } cursor-pointer`}
                        >
                          {subtype}
                        </button>
                      );
                    })}
                    {options.service_subtypes.length > 8 && (
                      <Badge 
                        variant="outline" 
                        className="text-xs px-2 py-0.5 bg-slate-50 text-slate-700 border-slate-300"
                      >
                        +{options.service_subtypes.length - 8} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* New: Saved to Client toggle and existing menu */}
          <div className="flex items-center gap-2"> {/* Wrapper for new button and dropdown */}
            <button
              className={`p-2 rounded-md border transition-colors ${isSaved ? 'border-green-300 bg-green-50 text-green-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
              title={isSaved ? "Saved to Client (click to unmark)" : "Mark as Saved to Client"}
              onClick={() => onToggleSaved(service.business_unit, !isSaved)}
            >
              <BookmarkCheck className="w-4 h-4" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleStatusChange(service.business_unit, 'active')}>
                  <CheckCircle2 className="w-4 h-4 mr-2 text-teal-600" />
                  Mark as Current Foothold
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange(service.business_unit, 'whitespace')}>
                  <Circle className="w-4 h-4 mr-2 text-slate-600" />
                  Mark as Whitespace
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange(service.business_unit, 'inactive')}>
                  <XCircle className="w-4 h-4 mr-2 text-slate-500" />
                  Mark as Inactive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {service.is_current_engagement && !service.is_inactive && (options.contact_channels.length > 0 || options.service_subtypes.length > 0) && (
          <div className="mt-4 pt-4 border-t border-teal-200">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <p className="text-sm font-semibold text-slate-900">Active Engagement Details</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {options.contact_channels.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Customer Contact Channels
                  </label>
                  <MultiSelect
                    options={options.contact_channels}
                    selected={relationshipDetails.customer_contact_channels || []}
                    onChange={(values) => onRelationshipDetailChange(service.business_unit, 'customer_contact_channels', values)}
                    placeholder="Select channels..."
                  />
                </div>
              )}

              {options.service_subtypes.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Active Service Subtypes
                  </label>
                  <MultiSelect
                    options={options.service_subtypes}
                    selected={relationshipDetails.service_subtypes || []}
                    onChange={(values) => onRelationshipDetailChange(service.business_unit, 'service_subtypes', values)}
                    placeholder="Select subtypes..."
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  if (!serviceFootprint || serviceFootprint.length === 0) {
    return (
      <Card className="shadow-xl border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-slate-900">
            <Network className="w-6 h-6 text-slate-900" />
            Customer-Facing Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-lg">
            <Info className="w-10 h-10 text-slate-400 mb-4" />
            <p className="font-medium text-slate-900">No Service Footprint Data</p>
            <p className="text-sm text-slate-700 mt-1">Run or re-run the analysis to identify customer-facing operations.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentEngagements = filteredServices.filter(s => s.is_current_engagement && !s.is_inactive);
  const whitespace = filteredServices.filter(s => !s.is_current_engagement && !s.is_inactive);

  return (
    <Card className="shadow-xl border-slate-200 bg-white">
      <CardHeader className="border-b border-slate-200">
        {/* Added flex container for title and refresh button */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-3 text-xl text-slate-900">
              <Network className="w-6 h-6 text-teal-600" />
              Customer-Facing Operations
            </CardTitle>
            <p className="text-sm text-slate-900 mt-2">
              Map of customer touchpoints and service areas where BPO partnerships could add value.
              Click on any service to toggle between statuses, or use the menu for more options.
            </p>
          </div>
          {/* Manual Refresh Button */}
          <div className="mt-1">
            <Button variant="outline" size="sm" onClick={onManualRefresh} disabled={refreshing} className="gap-2">
              {refreshing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Manual Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search service areas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-300"
            />
          </div>
          <div className="flex gap-4 mt-4 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-teal-600"></div>
              <span className="text-slate-900">Current Foothold ({currentEngagements.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-400"></div>
              <span className="text-slate-900">Whitespace ({whitespace.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-300"></div>
              <span className="text-slate-600">Inactive ({inactiveServices.length})</span>
            </div>
          </div>
        </div>
        
        {/* Identified BPO Service Areas */}
        {bpoServices.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-lg text-slate-900">Identified BPO Service Areas</h3>
              <Badge className="bg-blue-100 text-blue-900">{bpoServices.length}</Badge>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              These customer-facing operations align with standard BPO service offerings and have detailed service type options available.
            </p>
            <div className="grid gap-3">
              {bpoServices.map((service, idx) => renderServiceItem(service, `bpo-${idx}`))}
            </div>
          </div>
        )}

        {/* Other Customer Facing Operations */}
        {otherOperations.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-lg text-slate-900">Other Customer Facing Operations</h3>
              <Badge className="bg-amber-100 text-amber-900">{otherOperations.length}</Badge>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              These operations don't directly match standard BPO categories but may represent unique expansion opportunities.
            </p>
            <div className="grid gap-3">
              {otherOperations.map((service, idx) => renderServiceItem(service, `other-${idx}`))}
            </div>
          </div>
        )}

        {/* Inactive Services */}
        {inactiveServices.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="w-5 h-5 text-slate-500" />
              <h3 className="font-bold text-lg text-slate-600">Inactive Service Areas</h3>
              <Badge className="bg-slate-200 text-slate-700">{inactiveServices.length}</Badge>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              These service areas have been marked as not applicable or not of interest.
            </p>
            <div className="grid gap-3">
              {inactiveServices.map((service, idx) => renderServiceItem(service, `inactive-${idx}`, true))}
            </div>
          </div>
        )}

        {filteredServices.length === 0 && searchTerm && (
          <div className="text-center py-8">
            <p className="text-slate-600">No services match your search.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
