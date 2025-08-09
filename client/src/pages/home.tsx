import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Scan, 
  Brain, 
  Shield, 
  Smartphone, 
  Globe, 
  Zap, 
  CheckCircle, 
  Star,
  Users,
  User,
  TrendingUp,
  Award,
  Heart,
  Search,
  Camera,
  MessageCircle
} from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";
import AuthModal from "@/components/auth-modal";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { isAuthenticated } = useAuth();
  
  // Set page title and meta description for SEO
  useEffect(() => {
    document.title = "ProcessedOrNot - AI-Powered Food Analysis & Nutrition Scanner";
    
    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Discover what\'s really in your food with ProcessedOrNot. Scan barcodes, get AI-powered ingredient analysis, and make healthier choices with our comprehensive nutrition platform.');
    
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
    
    addMetaTag('og:title', 'ProcessedOrNot - AI-Powered Food Analysis & Nutrition Scanner');
    addMetaTag('og:description', 'Discover what\'s really in your food with ProcessedOrNot. Scan barcodes, get AI-powered ingredient analysis, and make healthier choices.');
    addMetaTag('og:type', 'website');
    addMetaTag('og:url', window.location.href);
    
    // Twitter Card meta tags
    addMetaTag('twitter:card', 'summary_large_image');
    addMetaTag('twitter:title', 'ProcessedOrNot - AI-Powered Food Analysis');
    addMetaTag('twitter:description', 'Scan barcodes and get AI-powered ingredient analysis for healthier food choices.');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 dark:bg-blue-800 rounded-full mix-blend-multiply dark:mix-blend-color-dodge filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-purple-200 dark:bg-purple-800 rounded-full mix-blend-multiply dark:mix-blend-color-dodge filter blur-xl opacity-70 animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-pink-200 dark:bg-pink-800 rounded-full mix-blend-multiply dark:mix-blend-color-dodge filter blur-xl opacity-70 animate-float"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Hero Badge */}
            <div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              <span>AI-Powered Food Analysis</span>
              <Badge variant="secondary" className="ml-2">NEW</Badge>
            </div>
            
            {/* Hero Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Know What's In Your
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"> Food</span>
            </h1>
            
            {/* Hero Description */}
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Scan any barcode and get instant AI-powered analysis of ingredients, processing levels, and nutritional insights to make healthier choices.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/product-lookup">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  <Camera className="w-5 h-5 mr-2" />
                  Start Scanning
                </Button>
              </Link>
              {!isAuthenticated && (
                <>
                  <AuthModal>
                    <Button variant="outline" size="lg" className="px-8 py-4 text-lg font-semibold border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
                      <User className="w-5 h-5 mr-2" />
                      Login or Register
                    </Button>
                  </AuthModal>
                  
                  {/* DEBUG: Direct login test form */}
                  <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg max-w-sm mx-auto">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">🔧 DEBUG: Direct Login Test</h3>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target as HTMLFormElement);
                      const username = formData.get('username') as string;
                      const password = formData.get('password') as string;
                      
                      fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password, keepLoggedIn: false })
                      })
                      .then(res => res.json())
                      .then(data => {
                        if (data.message === 'Login successful') {
                          alert('✅ Login successful! Page will refresh.');
                          window.location.reload();
                        } else {
                          alert('❌ Login failed: ' + (data.message || 'Unknown error'));
                        }
                      })
                      .catch(err => alert('❌ Network error: ' + err.message));
                    }} className="space-y-2">
                      <input 
                        name="username" 
                        placeholder="Username (try: demouser)"
                        className="w-full px-3 py-2 text-sm border rounded"
                        required
                      />
                      <input 
                        name="password" 
                        type="password"
                        placeholder="Password (try: Demo123!)"
                        className="w-full px-3 py-2 text-sm border rounded"
                        required
                      />
                      <button 
                        type="submit"
                        className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Test Direct Login
                      </button>
                    </form>
                  </div>
                </>
              )}
              <Link href="/about">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg font-semibold border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
                  <Heart className="w-5 h-5 mr-2" />
                  Learn More
                </Button>
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">1M+</div>
                <div className="text-gray-600 dark:text-gray-400">Products Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">50K+</div>
                <div className="text-gray-600 dark:text-gray-400">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">98%</div>
                <div className="text-gray-600 dark:text-gray-400">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">24/7</div>
                <div className="text-gray-600 dark:text-gray-400">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white/50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Revolutionary Food Analysis
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Our cutting-edge AI technology helps you understand what's really in your food, empowering you to make informed decisions for your health.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Barcode Scanning */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Scan className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Instant Barcode Scanning
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Simply point your camera at any product barcode for instant recognition and analysis.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* AI Analysis */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  AI-Powered Analysis
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Advanced machine learning algorithms analyze ingredients and processing levels for comprehensive insights.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Health Insights */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20">
              <CardHeader>
                <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Health Insights
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Get personalized health recommendations and understand the nutritional impact of your food choices.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Smart Search */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Smart Search
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Find products by name, brand, or ingredient with our intelligent search system.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Mobile App */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Mobile Ready
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Take your food analysis on the go with our responsive web app and upcoming mobile apps.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Global Database */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Global Database
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Access information from multiple international food databases for comprehensive coverage.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Three simple steps to better understand your food and make healthier choices.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Camera className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Scan or Search</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Point your camera at any barcode or search for products by name to get started.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. AI Analysis</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our AI instantly analyzes ingredients, processing levels, and nutritional content.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. Make Decisions</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get clear, actionable insights to make informed choices about your food.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              What Our Users Say
            </h2>
            <p className="text-xl opacity-90">
              Join thousands of health-conscious individuals making better food choices.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current text-yellow-400" />
                    ))}
                  </div>
                </div>
                <CardDescription className="text-white/90">
                  "ProcessedOrNot has completely changed how I shop for food. I can instantly see which products are healthier and make better choices for my family."
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold">Sarah M.</div>
                    <div className="text-sm opacity-80">Health Enthusiast</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current text-yellow-400" />
                    ))}
                  </div>
                </div>
                <CardDescription className="text-white/90">
                  "The AI analysis is incredibly accurate. I love how it breaks down complex ingredient lists into simple, understandable insights."
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold">Mike R.</div>
                    <div className="text-sm opacity-80">Fitness Coach</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current text-yellow-400" />
                    ))}
                  </div>
                </div>
                <CardDescription className="text-white/90">
                  "As a parent, this app gives me peace of mind. I can quickly check if products are suitable for my children's dietary needs."
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold">Lisa K.</div>
                    <div className="text-sm opacity-80">Parent</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Transform Your Food Choices?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
              Join thousands of users who are already making healthier decisions with ProcessedOrNot. Start your journey to better nutrition today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/product-lookup">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  <Scan className="w-5 h-5 mr-2" />
                  Start Scanning Now
                </Button>
              </Link>
              <Link href="/features">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg font-semibold border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
                  <Award className="w-5 h-5 mr-2" />
                  Explore Features
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}