import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Monitor, 
  Smartphone,
  Eye,
  MousePointer,
  Clock,
  Info
} from "lucide-react";

interface AdPlacementRule {
  id: string;
  title: string;
  description: string;
  type: 'required' | 'recommended' | 'prohibited';
  category: 'content' | 'technical' | 'user-experience' | 'policy';
  details: string[];
}

const AD_PLACEMENT_RULES: AdPlacementRule[] = [
  {
    id: 'content-separation',
    title: 'Clear Content Separation',
    description: 'Ads must be clearly distinguishable from editorial content',
    type: 'required',
    category: 'content',
    details: [
      'Use "Advertisement" or "Sponsored" labels where required',
      'Maintain visual distinction between ads and content',
      'Avoid misleading ad placement that mimics content',
      'Ensure ads don\'t interfere with site navigation'
    ]
  },
  {
    id: 'above-fold-limit',
    title: 'Above-the-Fold Ad Limits',
    description: 'Limit ads above the fold to maintain user experience',
    type: 'recommended',
    category: 'user-experience',
    details: [
      'Maximum 1-2 ads above the fold on desktop',
      'Consider mobile viewport for above-fold calculations',
      'Prioritize content visibility over ad placement',
      'Avoid overwhelming users with immediate ads'
    ]
  },
  {
    id: 'content-ratio',
    title: 'Content-to-Ad Ratio',
    description: 'Maintain appropriate balance between content and advertising',
    type: 'required',
    category: 'policy',
    details: [
      'Ads should not dominate page content',
      'Provide substantial valuable content alongside ads',
      'Avoid pages created solely for ad revenue',
      'Ensure ads complement rather than replace content'
    ]
  },
  {
    id: 'mobile-optimization',
    title: 'Mobile Ad Optimization',
    description: 'Optimize ad placement for mobile devices',
    type: 'required',
    category: 'technical',
    details: [
      'Use responsive ad units that adapt to screen size',
      'Avoid ads that require horizontal scrolling',
      'Ensure adequate spacing around ads for touch interfaces',
      'Test ad loading and display across devices'
    ]
  },
  {
    id: 'loading-performance',
    title: 'Page Loading Performance',
    description: 'Ads should not significantly impact page loading speed',
    type: 'recommended',
    category: 'technical',
    details: [
      'Use asynchronous ad loading where possible',
      'Implement lazy loading for below-fold ads',
      'Monitor Core Web Vitals impact from ads',
      'Optimize ad script loading sequence'
    ]
  },
  {
    id: 'click-fraud-prevention',
    title: 'Click Fraud Prevention',
    description: 'Prevent accidental or fraudulent ad clicks',
    type: 'required',
    category: 'policy',
    details: [
      'Avoid placing ads too close to navigation elements',
      'Don\'t encourage users to click ads',
      'Ensure adequate spacing around clickable ads',
      'Implement accidental click prevention measures'
    ]
  },
  {
    id: 'user-consent',
    title: 'User Consent Compliance',
    description: 'Ensure proper consent before showing personalized ads',
    type: 'required',
    category: 'policy',
    details: [
      'Collect consent before loading personalized ads',
      'Provide non-personalized ads when consent is declined',
      'Respect user privacy preferences',
      'Maintain consent records and compliance strings'
    ]
  },
  {
    id: 'content-restrictions',
    title: 'Content Restrictions',
    description: 'Avoid ad placement on restricted content',
    type: 'prohibited',
    category: 'policy',
    details: [
      'No ads on error pages or empty content pages',
      'Avoid ads on pages with sensitive content',
      'Don\'t place ads in popup windows or overlays',
      'Respect content-specific ad restrictions'
    ]
  }
];

const AD_PLACEMENT_LOCATIONS = [
  {
    location: 'Header Banner',
    size: '728x90 (Leaderboard)',
    placement: 'Top of page, below navigation',
    guidelines: 'Should not interfere with site branding or navigation',
    status: 'recommended'
  },
  {
    location: 'Sidebar',
    size: '300x250 (Medium Rectangle)',
    placement: 'Right or left sidebar area',
    guidelines: 'Ensure adequate content remains visible',
    status: 'recommended'
  },
  {
    location: 'In-Article',
    size: 'Responsive/Fluid',
    placement: 'Between content paragraphs',
    guidelines: 'Must be clearly marked as advertisement',
    status: 'acceptable'
  },
  {
    location: 'Footer',
    size: '728x90 or 320x50',
    placement: 'Bottom of page content',
    guidelines: 'Should not obstruct important links or information',
    status: 'acceptable'
  },
  {
    location: 'Popup/Overlay',
    size: 'Various',
    placement: 'Overlay on content',
    guidelines: 'Generally prohibited, may violate user experience guidelines',
    status: 'prohibited'
  },
  {
    location: 'Sticky/Fixed',
    size: 'Various',
    placement: 'Fixed position during scroll',
    guidelines: 'Use sparingly, ensure easy dismissal',
    status: 'cautious'
  }
];

export function AdPlacementGuidelines() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredRules = AD_PLACEMENT_RULES.filter(rule => {
    const categoryMatch = selectedCategory === 'all' || rule.category === selectedCategory;
    const typeMatch = selectedType === 'all' || rule.type === selectedType;
    return categoryMatch && typeMatch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'required': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'recommended': return <Info className="h-4 w-4 text-blue-600" />;
      case 'prohibited': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      required: 'bg-green-100 text-green-800 border-green-200',
      recommended: 'bg-blue-100 text-blue-800 border-blue-200',
      prohibited: 'bg-red-100 text-red-800 border-red-200'
    };
    
    return (
      <Badge variant="outline" className={variants[type as keyof typeof variants]}>
        {getTypeIcon(type)}
        <span className="ml-1 capitalize">{type}</span>
      </Badge>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recommended': return 'text-green-600';
      case 'acceptable': return 'text-blue-600';
      case 'cautious': return 'text-yellow-600';
      case 'prohibited': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Monitor className="h-8 w-8 text-primary" />
          AdSense Placement Guidelines
        </h1>
        <p className="text-muted-foreground">
          Comprehensive guidelines for Google AdSense compliant ad placement and user experience optimization
        </p>
      </div>

      {/* Summary Alert */}
      <Alert className="mb-6">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Following these guidelines ensures compliance with Google Publisher Policies and maintains optimal user experience. 
          Non-compliance may result in ad serving restrictions or account suspension.
        </AlertDescription>
      </Alert>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Filter by Category:</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Categories</option>
            <option value="content">Content</option>
            <option value="technical">Technical</option>
            <option value="user-experience">User Experience</option>
            <option value="policy">Policy</option>
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Filter by Type:</label>
          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Types</option>
            <option value="required">Required</option>
            <option value="recommended">Recommended</option>
            <option value="prohibited">Prohibited</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Placement Rules */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Placement Rules</h2>
          {filteredRules.map((rule) => (
            <Card key={rule.id} className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{rule.title}</CardTitle>
                  {getTypeBadge(rule.type)}
                </div>
                <CardDescription>{rule.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {rule.details.map((detail, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Ad Placement Locations */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Ad Placement Locations</h2>
          {AD_PLACEMENT_LOCATIONS.map((location, index) => (
            <Card key={index} className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{location.location}</CardTitle>
                  <Badge variant="outline" className={getStatusColor(location.status)}>
                    {location.status}
                  </Badge>
                </div>
                <CardDescription>
                  <strong>Size:</strong> {location.size}<br />
                  <strong>Placement:</strong> {location.placement}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{location.guidelines}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Implementation Checklist */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Implementation Checklist
          </CardTitle>
          <CardDescription>
            Use this checklist to ensure your ad implementation meets all guidelines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Technical Requirements</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Responsive ad units implemented
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Asynchronous ad loading configured
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Mobile optimization verified
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Page speed impact assessed
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Policy Compliance</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  User consent system active
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Privacy policy updated
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Content-ad separation maintained
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Click fraud prevention measures
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdPlacementGuidelines;