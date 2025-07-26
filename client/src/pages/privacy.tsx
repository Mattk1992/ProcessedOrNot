import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, Lock, Database, Users, Mail } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-gray-500 mt-2">Last updated: July 26, 2025</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Information We Collect */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Account Information</h3>
                <p className="text-gray-600">
                  When you create an account, we collect your username, email address, and encrypted password. 
                  This information is necessary to provide you with personalized features and account security.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Product Search Data</h3>
                <p className="text-gray-600">
                  We store your search history including barcodes scanned, products searched, and analysis results. 
                  This helps us improve our service and provide you with better recommendations.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Usage Analytics</h3>
                <p className="text-gray-600">
                  We collect anonymous usage statistics to understand how our app is used and to improve performance. 
                  This includes page views, feature usage, and error reports.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Service Provision</h3>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• Provide food product analysis</li>
                    <li>• Maintain your search history</li>
                    <li>• Deliver personalized recommendations</li>
                    <li>• Enable account features</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Service Improvement</h3>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• Analyze usage patterns</li>
                    <li>• Fix bugs and improve performance</li>
                    <li>• Develop new features</li>
                    <li>• Enhance user experience</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Protection */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                How We Protect Your Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Security Measures</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Technical Safeguards</h4>
                    <ul className="text-gray-600 space-y-1 text-sm">
                      <li>• Encrypted data transmission (HTTPS)</li>
                      <li>• Secure password hashing</li>
                      <li>• Regular security updates</li>
                      <li>• Access controls and monitoring</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Organizational Safeguards</h4>
                    <ul className="text-gray-600 space-y-1 text-sm">
                      <li>• Limited access to personal data</li>
                      <li>• Employee privacy training</li>
                      <li>• Regular security audits</li>
                      <li>• Incident response procedures</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information Sharing */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Information Sharing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">We Do NOT Sell Your Data</h3>
                <p className="text-green-700 text-sm">
                  We never sell, rent, or trade your personal information to third parties for marketing purposes.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Limited Sharing</h3>
                <p className="text-gray-600 mb-2">
                  We may share information only in these specific circumstances:
                </p>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• <strong>Service Providers:</strong> Trusted third parties who help us operate our service (hosting, analytics)</li>
                  <li>• <strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li>• <strong>Business Transfers:</strong> In case of merger or acquisition (with user notification)</li>
                  <li>• <strong>Consent:</strong> When you explicitly consent to sharing</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Your Privacy Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Data Control</h3>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• Access your personal data</li>
                    <li>• Update or correct information</li>
                    <li>• Delete your account and data</li>
                    <li>• Export your data</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Communication Preferences</h3>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>• Opt out of notifications</li>
                    <li>• Control email communications</li>
                    <li>• Manage privacy settings</li>
                    <li>• Request information about our practices</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Questions About Privacy?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                If you have any questions about this privacy policy or how we handle your data, please don't hesitate to contact us.
              </p>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="font-medium">Privacy Team</span>
                </div>
                <p className="text-sm text-gray-600">
                  Email: privacy@processedornot.com<br />
                  We typically respond within 48 hours.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}