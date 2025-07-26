import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, AlertTriangle, Scale, Shield, Gavel, Clock } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Please read these terms carefully before using ProcessedOrNot Scanner.
          </p>
          <p className="text-sm text-gray-500 mt-2">Last updated: July 26, 2025</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Agreement */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Agreement to Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                By accessing and using ProcessedOrNot Scanner ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by these terms, you are not authorized to use or access this service.
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Service Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">What We Provide</h3>
                <p className="text-gray-600 mb-2">
                  ProcessedOrNot Scanner is a food analysis application that provides:
                </p>
                <ul className="text-gray-600 space-y-1 text-sm list-disc list-inside">
                  <li>Barcode scanning and product identification</li>
                  <li>AI-powered food processing level analysis</li>
                  <li>Nutritional information from multiple databases</li>
                  <li>Educational content about food processing</li>
                  <li>Personal search history and recommendations</li>
                </ul>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-1">Important Disclaimer</h4>
                    <p className="text-amber-700 text-sm">
                      Our service provides educational information only. Always consult healthcare professionals for medical advice, 
                      dietary recommendations, or allergy-related concerns.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="h-5 w-5 text-primary" />
                User Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Account Security</h3>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• You are responsible for maintaining the confidentiality of your account credentials</li>
                  <li>• You must notify us immediately of any unauthorized use of your account</li>
                  <li>• You are responsible for all activities that occur under your account</li>
                  <li>• You must provide accurate and complete information when creating an account</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Acceptable Use</h3>
                <p className="text-gray-600 mb-2">You agree NOT to:</p>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Use the service for any illegal or unauthorized purpose</li>
                  <li>• Attempt to reverse engineer or hack the application</li>
                  <li>• Upload malicious code or attempt to disrupt the service</li>
                  <li>• Share your account credentials with others</li>
                  <li>• Use automated tools to access the service without permission</li>
                  <li>• Violate any applicable laws or regulations</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Intellectual Property
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Our Content</h3>
                <p className="text-gray-600">
                  The service and its original content, features, and functionality are and will remain the exclusive property of 
                  ProcessedOrNot Scanner and its licensors. The service is protected by copyright, trademark, and other laws.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Your Content</h3>
                <p className="text-gray-600">
                  You retain rights to any content you submit to the service. By submitting content, you grant us a worldwide, 
                  non-exclusive, royalty-free license to use, reproduce, and distribute your content in connection with the service.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimers and Limitations */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Disclaimers and Limitations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Service Availability</h3>
                <p className="text-gray-600">
                  We strive to maintain high service availability, but we do not guarantee that the service will be available 
                  at all times. The service may be temporarily unavailable due to maintenance, updates, or technical issues.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Information Accuracy</h3>
                <p className="text-gray-600">
                  While we work to provide accurate nutritional and product information, we cannot guarantee the accuracy, 
                  completeness, or reliability of any information provided through the service. Always verify information 
                  from product packaging and consult professionals for important dietary decisions.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Limitation of Liability</h3>
                <p className="text-gray-600">
                  To the maximum extent permitted by law, ProcessedOrNot Scanner shall not be liable for any indirect, 
                  incidental, special, consequential, or punitive damages resulting from your use of the service.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Changes to Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                We reserve the right to modify or replace these terms at any time. If a revision is material, 
                we will try to provide at least 30 days' notice prior to any new terms taking effect.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-1">Stay Informed</h4>
                <p className="text-blue-700 text-sm">
                  We recommend reviewing these terms periodically. Your continued use of the service after 
                  any changes constitutes acceptance of the new terms.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Questions About These Terms?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="space-y-2">
                  <div><strong>Email:</strong> legal@processedornot.com</div>
                  <div><strong>Address:</strong> 123 Nutrition Street, Health City, HC 12345</div>
                  <div><strong>Response Time:</strong> We typically respond within 48 hours</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}