import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shield, 
  Scale, 
  FileText, 
  ExternalLink, 
  Copyright as CopyrightIcon, 
  Users, 
  AlertTriangle,
  Database
} from "lucide-react";

interface LegalNotice {
  id: number;
  noticeType: string;
  title: string;
  content: string;
  version: string;
  effectiveDate: string;
  language: string;
  displayPriority: number;
}

interface ContentRights {
  id: number;
  contentType: string;
  contentIdentifier: string;
  copyrightOwner: string;
  licenseType: string;
  licenseUrl?: string;
  copyrightNotice: string;
  attributionRequired: boolean;
  attributionText?: string;
  sourceUrl?: string;
  sourceApi?: string;
  commercialUseAllowed: boolean;
  modificationAllowed: boolean;
  redistributionAllowed: boolean;
  rightsStatus: string;
}

export function Copyright() {
  const { data: legalNotices = [], isLoading: noticesLoading } = useQuery<LegalNotice[]>({
    queryKey: ['/api/legal-notices'],
  });

  // Use a public endpoint for content rights that doesn't require authentication
  const { data: contentRights = [], isLoading: rightsLoading } = useQuery<ContentRights[]>({
    queryKey: ['/api/content-rights/public'],
  });

  const copyrightNotice = legalNotices.find(notice => notice.noticeType === 'copyright');
  const attributionNotice = legalNotices.find(notice => notice.noticeType === 'attribution');
  const termsNotice = legalNotices.find(notice => notice.noticeType === 'terms');
  const disclaimerNotice = legalNotices.find(notice => notice.noticeType === 'disclaimer');

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <h4 key={index} className="font-semibold text-lg mt-4 mb-2 text-primary">
            {line.replace(/\*\*/g, '')}
          </h4>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <li key={index} className="ml-4 mb-1">
            {line.substring(2)}
          </li>
        );
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return (
        <p key={index} className="mb-2 leading-relaxed">
          {line}
        </p>
      );
    });
  };

  const getLicenseIcon = (licenseType: string) => {
    if (licenseType?.toLowerCase().includes('mit')) return <Shield className="h-4 w-4 text-green-600" />;
    if (licenseType?.toLowerCase().includes('apache')) return <FileText className="h-4 w-4 text-blue-600" />;
    if (licenseType?.toLowerCase().includes('odbl')) return <Database className="h-4 w-4 text-purple-600" />;
    if (licenseType?.toLowerCase().includes('public domain')) return <Users className="h-4 w-4 text-gray-600" />;
    return <CopyrightIcon className="h-4 w-4 text-orange-600" />;
  };

  const getRightsStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'disputed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (noticesLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading legal information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          <CopyrightIcon className="inline-block mr-2 h-8 w-8" />
          Copyright & Legal Information
        </h1>
        <p className="text-muted-foreground text-lg">
          Intellectual property, licensing, and legal notices for ProcessedOrNot Scanner
        </p>
      </div>

      <div className="space-y-8">
        {/* Copyright Notice */}
        {copyrightNotice && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CopyrightIcon className="h-5 w-5" />
                {copyrightNotice.title}
              </CardTitle>
              <CardDescription>
                Effective: {new Date(copyrightNotice.effectiveDate).toLocaleDateString()} 
                • Version {copyrightNotice.version}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 w-full rounded-md border p-4">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {formatContent(copyrightNotice.content)}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Content Rights Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Content Rights Overview
            </CardTitle>
            <CardDescription>
              Licensing and usage rights for different types of content used in this application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {contentRights.map((rights) => (
                <div
                  key={rights.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getLicenseIcon(rights.licenseType)}
                      <h4 className="font-medium">{rights.copyrightOwner}</h4>
                    </div>
                    <Badge className={getRightsStatusColor(rights.rightsStatus)}>
                      {rights.rightsStatus}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {rights.copyrightNotice}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="outline">{rights.licenseType}</Badge>
                    <Badge variant="outline">{rights.contentType}</Badge>
                    {rights.commercialUseAllowed && (
                      <Badge variant="secondary">Commercial Use</Badge>
                    )}
                    {rights.modificationAllowed && (
                      <Badge variant="secondary">Modification</Badge>
                    )}
                    {rights.redistributionAllowed && (
                      <Badge variant="secondary">Redistribution</Badge>
                    )}
                  </div>

                  {rights.attributionRequired && rights.attributionText && (
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded text-sm">
                      <strong>Required Attribution:</strong> {rights.attributionText}
                    </div>
                  )}

                  {(rights.sourceUrl || rights.licenseUrl) && (
                    <div className="flex gap-2 mt-2">
                      {rights.sourceUrl && (
                        <a
                          href={rights.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          Source <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {rights.licenseUrl && (
                        <a
                          href={rights.licenseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          License <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Third-Party Attributions */}
        {attributionNotice && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {attributionNotice.title}
              </CardTitle>
              <CardDescription>
                Acknowledgments for third-party contributions and services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {formatContent(attributionNotice.content)}
              </div>
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* Terms and Disclaimer */}
        <div className="grid md:grid-cols-2 gap-6">
          {termsNotice && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  {termsNotice.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64 w-full">
                  <div className="prose prose-sm max-w-none dark:prose-invert text-sm">
                    {formatContent(termsNotice.content)}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {disclaimerNotice && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  {disclaimerNotice.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64 w-full">
                  <div className="prose prose-sm max-w-none dark:prose-invert text-sm">
                    {formatContent(disclaimerNotice.content)}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Contact Information */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Legal Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                For copyright inquiries, licensing questions, or to report intellectual property violations:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium">Legal Department</p>
                <p>ProcessedOrNot Scanner</p>
                <p>Email: legal@processedornot.com</p>
                <p className="text-sm text-muted-foreground mt-2">
                  We respond to all legitimate copyright and licensing inquiries within 5 business days.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}