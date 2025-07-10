import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Scan, 
  Search, 
  Bot, 
  Globe, 
  Shield, 
  Zap, 
  Camera,
  FileText,
  BarChart3,
  MessageCircle,
  Smartphone,
  Brain,
  Database,
  Users,
  Settings,
  History,
  Download,
  Languages,
  Moon,
  Sun
} from "lucide-react";

const features = [
  {
    title: "Advanced Barcode Scanning",
    description: "High-performance barcode scanning with optimized camera settings for close-range detection (2-8cm optimal distance)",
    icon: <Camera className="w-6 h-6" />,
    category: "Core Features",
    highlights: [
      "Ultra-precise focus distance (0.015) optimization",
      "2560x1440 resolution with 60fps capture",
      "Supports EAN-8, UPC-A, EAN-13, ITF-14 formats",
      "Real-time visual scanning feedback",
      "Automatic camera cleanup and privacy protection"
    ]
  },
  {
    title: "Smart Text Search",
    description: "AI-powered product search using OpenAI for intelligent keyword optimization and realistic product data generation",
    icon: <Search className="w-6 h-6" />,
    category: "Core Features",
    highlights: [
      "Two-step OpenAI processing for accuracy",
      "Multi-language product name recognition",
      "Dutch terms support (Gehakt, Gehaktbal)",
      "Fallback mechanisms for robust searches",
      "Nutritional data generation"
    ]
  },
  {
    title: "NutriBot AI Assistant",
    description: "Interactive nutritionist chatbot providing personalized nutrition advice and product insights",
    icon: <Bot className="w-6 h-6" />,
    category: "AI Features",
    highlights: [
      "GPT-4o powered conversations",
      "Personalized nutrition guidance",
      "Product-specific health insights",
      "Multi-language support",
      "Context-aware recommendations"
    ]
  },
  {
    title: "Processing Level Analysis",
    description: "AI-powered ingredient analysis providing detailed food processing scores (0-10 scale)",
    icon: <Brain className="w-6 h-6" />,
    category: "AI Features",
    highlights: [
      "Detailed processing score explanation",
      "Ultra-processed food identification",
      "Ingredient categorization",
      "Health impact assessment",
      "Processing level recommendations"
    ]
  },
  {
    title: "Multi-Database Integration",
    description: "Comprehensive food database coverage with 14+ different sources for maximum product coverage",
    icon: <Database className="w-6 h-6" />,
    category: "Data Sources",
    highlights: [
      "OpenFoodFacts (primary database)",
      "USDA FoodData Central",
      "Australian Food Composition Database",
      "Health Canada Food Database",
      "European Food Safety Authority (EFSA)",
      "Regional databases (Netherlands, Germany)"
    ]
  },
  {
    title: "Multilingual Support",
    description: "Native support for 7 languages with automatic browser detection and dynamic content translation",
    icon: <Languages className="w-6 h-6" />,
    category: "Accessibility",
    highlights: [
      "English, Spanish, French, German",
      "Chinese, Japanese, Dutch",
      "Automatic browser language detection",
      "AI responses in user's language",
      "Dynamic interface translation"
    ]
  },
  {
    title: "Comprehensive Analytics",
    description: "Advanced search history tracking with detailed analytics and export capabilities",
    icon: <BarChart3 className="w-6 h-6" />,
    category: "Analytics",
    highlights: [
      "Complete search result tracking",
      "Success rate statistics",
      "Processing score analytics",
      "CSV export functionality",
      "Data source breakdowns"
    ]
  },
  {
    title: "User Management System",
    description: "Secure authentication with role-based access control and comprehensive user settings",
    icon: <Users className="w-6 h-6" />,
    category: "Security",
    highlights: [
      "Secure password hashing (bcrypt)",
      "Email verification system",
      "Password reset functionality",
      "Admin and Regular account types",
      "Session management"
    ]
  },
  {
    title: "Mobile-First Design",
    description: "Responsive progressive web application optimized for mobile devices with touch-friendly interface",
    icon: <Smartphone className="w-6 h-6" />,
    category: "Design",
    highlights: [
      "Progressive Web App (PWA) architecture",
      "Touch-optimized scanning interface",
      "Responsive layout design",
      "Mobile camera integration",
      "Offline capability preparation"
    ]
  },
  {
    title: "Dark/Light Theme",
    description: "Elegant theme system with automatic detection and manual toggle for comfortable viewing",
    icon: <Moon className="w-6 h-6" />,
    category: "Design",
    highlights: [
      "System preference detection",
      "Manual theme toggle",
      "Consistent color schemes",
      "Accessibility compliant",
      "Persistent theme storage"
    ]
  },
  {
    title: "Interactive Tutorial",
    description: "Guided 7-step tutorial overlay system for first-time users with completion tracking",
    icon: <FileText className="w-6 h-6" />,
    category: "User Experience",
    highlights: [
      "7-step guided tour",
      "Key feature highlighting",
      "CSS-based zoom effects",
      "Completion tracking",
      "Restart capability"
    ]
  },
  {
    title: "Admin Management Panel",
    description: "Comprehensive administrative interface for user management, analytics, and system configuration",
    icon: <Settings className="w-6 h-6" />,
    category: "Administration",
    highlights: [
      "User role management",
      "System statistics dashboard",
      "Search history analytics",
      "Configuration settings",
      "Data export tools"
    ]
  }
];

const categories = [
  "Core Features",
  "AI Features", 
  "Data Sources",
  "Analytics",
  "Security",
  "Design",
  "User Experience",
  "Administration",
  "Accessibility"
];

const stats = [
  { label: "Supported Languages", value: "7" },
  { label: "Food Databases", value: "14+" },
  { label: "Barcode Formats", value: "4" },
  { label: "AI Models", value: "GPT-4o" }
];

export default function Features() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            ProcessedOrNot Scanner
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 max-w-3xl mx-auto">
            Advanced food product analysis powered by AI technology. Scan barcodes, analyze ingredients, 
            and get personalized nutrition insights with our comprehensive food intelligence platform.
          </p>
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="border-2 border-green-200 dark:border-green-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Comprehensive Features
          </h2>
          
          {categories.map((category) => (
            <div key={category} className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                <Badge variant="outline" className="mr-3 px-3 py-1">
                  {category}
                </Badge>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features
                  .filter(feature => feature.category === category)
                  .map((feature, index) => (
                    <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500 dark:border-l-green-400">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                              {feature.icon}
                            </div>
                            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                              {feature.title}
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {feature.description}
                        </p>
                        <ul className="space-y-2">
                          {feature.highlights.map((highlight, idx) => (
                            <li key={idx} className="flex items-start space-x-2 text-sm">
                              <Zap className="w-3 h-3 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300">{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Technology Stack */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Technology Stack
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-2 border-blue-200 dark:border-blue-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span>Frontend</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• React 18 with TypeScript</li>
                  <li>• Vite build system</li>
                  <li>• Tailwind CSS + Shadcn/ui</li>
                  <li>• React Query for state management</li>
                  <li>• Wouter for routing</li>
                  <li>• ZXing for barcode scanning</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 dark:border-purple-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span>Backend</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Express.js with TypeScript</li>
                  <li>• PostgreSQL database</li>
                  <li>• Drizzle ORM</li>
                  <li>• Session-based authentication</li>
                  <li>• OpenAI API integration</li>
                  <li>• Multi-database food APIs</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 dark:border-green-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span>Security & Deployment</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• bcrypt password hashing</li>
                  <li>• Email verification system</li>
                  <li>• Role-based access control</li>
                  <li>• Replit autoscale deployment</li>
                  <li>• Environment-based configuration</li>
                  <li>• Secure session management</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-green-500 to-blue-500 dark:from-green-600 dark:to-blue-600 text-white border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Analyze Your Food?</h2>
              <p className="text-lg mb-6 opacity-90">
                Start scanning barcodes and discovering the processing levels of your food products today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/" 
                  className="inline-flex items-center px-6 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  <Scan className="w-5 h-5 mr-2" />
                  Start Scanning
                </a>
                <a 
                  href="/help" 
                  className="inline-flex items-center px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Learn More
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}