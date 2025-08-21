import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  Download, 
  Star, 
  Shield, 
  Zap, 
  Globe,
  ArrowLeft,
  ExternalLink
} from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";

export default function AppsPage() {
  // Set page title and meta description for SEO
  useEffect(() => {
    document.title = "Mobile Apps - ProcessedOrNot Scanner";
    
    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Download ProcessedOrNot Scanner mobile app for Android and iOS. Get AI-powered food analysis on the go with barcode scanning and nutrition insights.');
    
    // Add Open Graph meta tags for social sharing
    const addMetaTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };
    
    addMetaTag('og:title', 'ProcessedOrNot Scanner - Mobile Apps');
    addMetaTag('og:description', 'Download our mobile app for AI-powered food analysis and barcode scanning on Android and iOS devices.');
    addMetaTag('og:type', 'website');
    addMetaTag('og:url', window.location.href);
  }, []);

  const appFeatures = [
    {
      icon: <Smartphone className="w-6 h-6 text-blue-500" />,
      title: "Native Mobile Experience",
      description: "Optimized for mobile devices with intuitive touch interface and smooth performance"
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      title: "Instant Barcode Scanning",
      description: "Fast camera-based barcode scanning with immediate product recognition"
    },
    {
      icon: <Shield className="w-6 h-6 text-green-500" />,
      title: "Offline Capability", 
      description: "Access previously scanned products and basic features even without internet"
    },
    {
      icon: <Globe className="w-6 h-6 text-purple-500" />,
      title: "Sync Across Devices",
      description: "Your scan history and preferences sync between mobile and web versions"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/site-info">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Site Info
            </Button>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6">
            📱 Download Our Mobile App
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            ProcessedOrNot Mobile Apps
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Take food analysis with you anywhere. Our mobile app brings the full power of AI-powered ingredient analysis 
            to your smartphone for on-the-go nutrition insights.
          </p>
        </div>

        {/* Download Buttons Section */}
        <div className="max-w-2xl mx-auto mb-16">
          <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-blue-500/5 border-primary/20">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-primary" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-4">Get Started Today</h2>
            <p className="text-muted-foreground mb-8">
              Download ProcessedOrNot Scanner and start making informed food choices immediately.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://play.google.com/store/apps/details?id=com.mkookie.processedornotfoodscanner"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button size="lg" className="text-lg px-8 py-6 w-full sm:w-auto bg-green-600 hover:bg-green-700">
                  <Download className="w-5 h-5 mr-2" />
                  Download on Google Play
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
              
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 w-full sm:w-auto" disabled>
                <Download className="w-5 h-5 mr-2" />
                iOS App Coming Soon
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              Available for Android devices. iOS version launching soon.
            </p>
          </Card>
        </div>

        {/* App Features */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Mobile App Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you love about ProcessedOrNot, optimized for your mobile device
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {appFeatures.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 p-2 bg-accent/20 rounded-lg">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* App Stats & Info */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold mb-2">4.8/5</div>
            <p className="text-muted-foreground">User Rating</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <Download className="w-8 h-8 text-blue-500" />
            </div>
            <div className="text-2xl font-bold mb-2">10K+</div>
            <p className="text-muted-foreground">Downloads</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <Shield className="w-8 h-8 text-green-500" />
            </div>
            <div className="text-2xl font-bold mb-2">100%</div>
            <p className="text-muted-foreground">Secure</p>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="p-8 bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Ready to start your nutrition journey?</h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of users making healthier choices with ProcessedOrNot Scanner.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://play.google.com/store/apps/details?id=com.mkookie.processedornotfoodscanner"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  <Download className="w-4 h-4 mr-2" />
                  Get the App
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
              <Link href="/product-lookup">
                <Button variant="outline" size="lg">
                  Try Web Version
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}