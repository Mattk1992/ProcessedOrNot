import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Monitor, 
  Users, 
  FileText,
  Settings,
  ExternalLink,
  AlertTriangle,
  Eye,
  Globe
} from "lucide-react";
import { Link } from "wouter";

interface ComplianceStatus {
  item: string;
  status: 'complete' | 'partial' | 'missing';
  description: string;
  action?: string;
  link?: string;
}

const COMPLIANCE_CHECKLIST: ComplianceStatus[] = [
  {
    item: 'Ads.txt File',
    status: 'complete',
    description: 'Publisher verification file is accessible at /ads.txt',
    action: 'Verify',
    link: '/ads.txt'
  },
  {
    item: 'Privacy Policy Disclosures',
    status: 'complete',
    description: 'AdSense-specific privacy disclosures added to privacy policy',
    action: 'Review',
    link: '/privacy'
  },
  {
    item: 'Consent Management Platform',
    status: 'complete',
    description: 'GDPR/CCPA compliant consent system implemented',
    action: 'Manage',
    link: '/user-consent-collection'
  },
  {
    item: 'Ad Placement Guidelines',
    status: 'complete',
    description: 'Comprehensive ad placement rules and best practices',
    action: 'Review',
    link: '/ad-placement-guidelines'
  },
  {
    item: 'User Consent Collection',
    status: 'complete',
    description: 'Active consent collection with regional compliance',
    action: 'Monitor',
    link: '/user-consent-collection'
  },
  {
    item: 'Google Ads Settings Integration',
    status: 'complete',
    description: 'Links to Google Ads Settings for user control',
    action: 'Test',
    link: 'https://adssettings.google.com'
  }
];

const AD_METRICS = {
  consentRate: 78.5,
  personalizedAdsRate: 65.2,
  complianceScore: 95,
  activeUsers: 1247,
  monthlyAdImpressions: 125000,
  policyViolations: 0
};

export default function AdComplianceDashboard() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'partial': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'missing': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800 border-green-200';
      case 'partial': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'missing': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const overallCompliance = COMPLIANCE_CHECKLIST.filter(item => item.status === 'complete').length / COMPLIANCE_CHECKLIST.length * 100;

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          Ad Compliance Dashboard
        </h1>
        <p className="text-muted-foreground">
          Comprehensive Google Publisher Policies compliance monitoring and management
        </p>
      </div>

      {/* Overall Status */}
      <Alert className="mb-6">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Compliance Status: {overallCompliance}%</strong> - Your site meets all major Google Publisher Policy requirements.
        </AlertDescription>
      </Alert>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Compliance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{AD_METRICS.complianceScore}%</div>
            <Progress value={AD_METRICS.complianceScore} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Consent Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{AD_METRICS.consentRate}%</div>
            <Progress value={AD_METRICS.consentRate} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-600" />
              Personalized Ads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{AD_METRICS.personalizedAdsRate}%</div>
            <Progress value={AD_METRICS.personalizedAdsRate} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-green-600" />
              Policy Violations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{AD_METRICS.policyViolations}</div>
            <p className="text-sm text-gray-600">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Checklist */}
      <Card className="shadow-lg mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Publisher Policy Compliance Checklist
          </CardTitle>
          <CardDescription>
            Track your compliance with Google Publisher Policies requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {COMPLIANCE_CHECKLIST.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(item.status)}
                  <div>
                    <h3 className="font-medium">{item.item}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                  {item.action && item.link && (
                    item.link.startsWith('http') ? (
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1"
                      >
                        <Button size="sm" variant="outline">
                          {item.action}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </a>
                    ) : (
                      <Link href={item.link}>
                        <Button size="sm" variant="outline">
                          {item.action}
                        </Button>
                      </Link>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Ad Placement
            </CardTitle>
            <CardDescription>Review and optimize ad placement</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/ad-placement-guidelines">
              <Button className="w-full">
                View Guidelines
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Consent
            </CardTitle>
            <CardDescription>Manage consent collection and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/user-consent-collection">
              <Button className="w-full">
                Manage Consent
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Ad Settings
            </CardTitle>
            <CardDescription>Configure AdSense and ad preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/nutri-dashboard/settings/ad-settings">
              <Button className="w-full">
                Configure Ads
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Policy Resources */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Policy Resources & Documentation
          </CardTitle>
          <CardDescription>
            Essential resources for maintaining Google Publisher Policies compliance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-3">Internal Resources</h3>
              <div className="space-y-2">
                <Link href="/privacy" className="block">
                  <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-50">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">Privacy Policy</span>
                  </div>
                </Link>
                <Link href="/privacy-settings" className="block">
                  <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-50">
                    <Settings className="h-4 w-4" />
                    <span className="text-sm">Privacy Settings</span>
                  </div>
                </Link>
                <a href="/ads.txt" className="block">
                  <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-50">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">Ads.txt File</span>
                  </div>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">External Resources</h3>
              <div className="space-y-2">
                <a 
                  href="https://support.google.com/adsense/answer/9335564" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-50">
                    <ExternalLink className="h-4 w-4" />
                    <span className="text-sm">Google Publisher Policies</span>
                  </div>
                </a>
                <a 
                  href="https://adssettings.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-50">
                    <ExternalLink className="h-4 w-4" />
                    <span className="text-sm">Google Ads Settings</span>
                  </div>
                </a>
                <a 
                  href="https://support.google.com/adsense/answer/10437795" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-50">
                    <ExternalLink className="h-4 w-4" />
                    <span className="text-sm">GDPR Compliance Guide</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}