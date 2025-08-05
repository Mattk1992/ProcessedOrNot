import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { 
  Shield, 
  Copyright, 
  FileText, 
  Globe, 
  Code, 
  Image,
  Music,
  Video,
  Database,
  AlertTriangle,
  Lock
} from "lucide-react";

export default function CopyrightPage() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  // Set page title and meta description for SEO
  useEffect(() => {
    document.title = "Copyright & Intellectual Property - ProcessedOrNot";
    
    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Copyright and intellectual property information for ProcessedOrNot. Learn about our content rights, licensing, and third-party attributions.');
  }, []);

  // Redirect non-authenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              This page is only available to authenticated users.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              Please sign in to view copyright and intellectual property information.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => setLocation('/login')} 
                className="w-full"
              >
                Sign In
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation('/')} 
                className="w-full"
              >
                Return Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Copyright className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Copyright & Intellectual Property</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Legal information regarding content ownership, licensing, and third-party attributions for ProcessedOrNot
          </p>
        </div>

        {/* Main Copyright Notice */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Copyright Notice</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-center font-medium text-lg">
                © 2025 ProcessedOrNot. All Rights Reserved.
              </p>
            </div>
            <p className="text-muted-foreground">
              All content, features, and functionality of the ProcessedOrNot application and website, 
              including but not limited to text, graphics, logos, icons, images, audio clips, data 
              compilations, and software, are the exclusive property of ProcessedOrNot and are 
              protected by international copyright, trademark, patent, trade secret, and other 
              intellectual property laws.
            </p>
          </CardContent>
        </Card>

        {/* Content Categories */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="w-5 h-5" />
                <span>Software & Code</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Application source code and architecture</li>
                <li>• User interface designs and layouts</li>
                <li>• Database schemas and structures</li>
                <li>• API endpoints and integrations</li>
                <li>• Proprietary algorithms and logic</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Content & Documentation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Website text and copy</li>
                <li>• User documentation and guides</li>
                <li>• Marketing materials</li>
                <li>• Blog posts and articles</li>
                <li>• Educational content</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Image className="w-5 h-5" />
                <span>Visual Assets</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• ProcessedOrNot logo and branding</li>
                <li>• Custom icons and graphics</li>
                <li>• Screenshots and demonstrations</li>
                <li>• UI/UX design elements</li>
                <li>• Custom illustrations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Data & Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Proprietary food analysis algorithms</li>
                <li>• User-generated content and reviews</li>
                <li>• Compiled nutrition databases</li>
                <li>• AI training data and models</li>
                <li>• Usage analytics and insights</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Third Party Attributions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>Third-Party Attributions</span>
            </CardTitle>
            <CardDescription>
              ProcessedOrNot incorporates various third-party services and open-source components
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <Badge variant="outline" className="mr-2">AI Services</Badge>
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                <li>• OpenAI GPT-4 - AI analysis and chatbot functionality</li>
                <li>• AssemblyAI - Voice transcription services</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <Badge variant="outline" className="mr-2">Food Databases</Badge>
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                <li>• OpenFoodFacts - Open food products database</li>
                <li>• USDA Food Data Central - U.S. food composition data</li>
                <li>• FoodDB.ca - Canadian food database</li>
                <li>• Various international nutrition databases</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <Badge variant="outline" className="mr-2">Open Source Libraries</Badge>
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                <li>• React - User interface library</li>
                <li>• TypeScript - Programming language</li>
                <li>• Tailwind CSS - Styling framework</li>
                <li>• Lucide React - Icon library</li>
                <li>• ZXing - Barcode scanning library</li>
                <li>• Various npm packages and dependencies</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <Badge variant="outline" className="mr-2">Services</Badge>
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                <li>• Replit - Development and hosting platform</li>
                <li>• Neon Database - PostgreSQL hosting</li>
                <li>• Google AdSense - Advertising services</li>
                <li>• Google Analytics - Usage analytics</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Usage Rights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Usage Rights & Permissions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-green-600 mb-2">Permitted Uses</h4>
              <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                <li>• Personal use of the ProcessedOrNot application and services</li>
                <li>• Educational or research purposes (with proper attribution)</li>
                <li>• Fair use excerpts for reviews or commentary</li>
                <li>• Social media sharing of public content with attribution</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-red-600 mb-2">Prohibited Uses</h4>
              <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                <li>• Reproduction or distribution of copyrighted content without permission</li>
                <li>• Commercial use of proprietary algorithms or data</li>
                <li>• Reverse engineering of software or services</li>
                <li>• Creation of derivative works without authorization</li>
                <li>• Use of trademarks or branding without permission</li>
                <li>• Unauthorized scraping or data extraction</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* DMCA Notice */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>DMCA Notice & Takedown Policy</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              ProcessedOrNot respects the intellectual property rights of others and expects users 
              to do the same. If you believe that content available through our service infringes 
              your copyright, you may submit a DMCA takedown notice.
            </p>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">To file a DMCA notice, please provide:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Identification of the copyrighted work claimed to be infringed</li>
                <li>• Identification of the infringing material and its location</li>
                <li>• Your contact information (name, address, phone, email)</li>
                <li>• A statement of good faith belief that the use is not authorized</li>
                <li>• A statement of accuracy and authority to act on behalf of the copyright owner</li>
                <li>• Your physical or electronic signature</li>
              </ul>
            </div>

            <p className="text-sm text-muted-foreground">
              Send DMCA notices to: <span className="font-mono text-primary">legal@processedornot.com</span>
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact for Copyright Matters</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              For questions about copyright, licensing, or intellectual property matters, please contact:
            </p>
            <div className="space-y-2">
              <p><strong>Email:</strong> <span className="font-mono text-primary">legal@processedornot.com</span></p>
              <p><strong>Subject Line:</strong> Copyright Inquiry - ProcessedOrNot</p>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              We typically respond to copyright inquiries within 5-7 business days.
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            Last Updated: January 2025 | This page is subject to updates as our services evolve
          </p>
        </div>
      </div>
    </div>
  );
}