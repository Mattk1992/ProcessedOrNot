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

export default function MarketingPage() {
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
    
    addMetaTag('og:title', 'ProcessedOrNot - AI-Powered Food Analysis');
    addMetaTag('og:description', 'Scan any product and get instant AI-powered analysis of processing levels and nutritional value. Make informed food choices with our comprehensive platform.');
    addMetaTag('og:type', 'website');
    addMetaTag('og:url', window.location.href);
  }, []);
  const features = [
    {
      icon: <Scan className="w-8 h-8 text-primary" />,
      title: "Smart Barcode Scanner",
      description: "Instantly scan any product barcode with our advanced camera technology for immediate food analysis."
    },
    {
      icon: <Brain className="w-8 h-8 text-primary" />,
      title: "AI-Powered Analysis",
      description: "Get detailed processing level analysis powered by GPT-4 technology, understanding ingredient complexity."
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-primary" />,
      title: "NutriBot Assistant",
      description: "Chat with our intelligent nutrition bot for personalized advice and detailed food information."
    },
    {
      icon: <Globe className="w-8 h-8 text-primary" />,
      title: "Global Food Database",
      description: "Access comprehensive nutrition data from 20+ international food databases for accurate information."
    },
    {
      icon: <Smartphone className="w-8 h-8 text-primary" />,
      title: "Mobile & Web Apps",
      description: "Use our service anywhere with native mobile apps and full-featured web application."
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "Privacy First",
      description: "Your data is encrypted and secure. We prioritize your privacy with enterprise-grade security."
    }
  ];

  const stats = [
    { icon: <Users className="w-6 h-6" />, value: "50K+", label: "Active Users" },
    { icon: <Search className="w-6 h-6" />, value: "1M+", label: "Products Scanned" },
    { icon: <Globe className="w-6 h-6" />, value: "20+", label: "Food Databases" },
    { icon: <Star className="w-6 h-6" />, value: "4.8/5", label: "User Rating" }
  ];

  const benefits = [
    "Make informed food choices with instant processing level analysis",
    "Understand ingredient complexity and nutritional impact",
    "Access comprehensive nutrition data from global sources",
    "Get personalized dietary advice from our AI assistant",
    "Track your scanning history and build healthy habits",
    "Support for 7 languages with automatic detection"
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Nutrition Enthusiast",
      quote: "ProcessedOrNot has completely changed how I shop for groceries. The AI analysis is incredibly detailed and helps me understand exactly what I'm eating.",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      role: "Health Coach",
      quote: "I recommend this app to all my clients. The comprehensive database and instant scanning make it perfect for anyone serious about their nutrition.",
      rating: 5
    },
    {
      name: "Emma Thompson",
      role: "Busy Parent",
      quote: "Finally, an app that makes it easy to check if products are healthy for my family. The NutriBot is like having a nutritionist in my pocket.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="max-w-6xl mx-auto">
          <Badge variant="secondary" className="mb-6">
            🚀 Now Available - Web & Mobile Apps
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            ProcessedOrNot
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Discover what's really in your food with AI-powered ingredient analysis. 
            Scan any product and get instant insights into processing levels and nutritional value.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/product-lookup">
              <Button size="lg" className="text-lg px-8 py-6">
                <Camera className="w-5 h-5 mr-2" />
                Start Scanning Now
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              <Smartphone className="w-5 h-5 mr-2" />
              Download Mobile App
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2 text-primary">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features for Healthy Living</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to make informed food choices and understand what you're eating
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Why Choose ProcessedOrNot?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Take control of your nutrition with our comprehensive food analysis platform. 
                Make better food choices backed by science and AI technology.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-base">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-blue-500/5 border-primary/20">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Health-First Approach</h3>
                  <p className="text-muted-foreground mb-6">
                    Our mission is to empower people with the knowledge they need to make healthier food choices. 
                    Every feature is designed with your wellbeing in mind.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">20+</div>
                      <div className="text-sm text-muted-foreground">Databases</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">7</div>
                      <div className="text-sm text-muted-foreground">Languages</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">24/7</div>
                      <div className="text-sm text-muted-foreground">Available</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Powered by Advanced Technology</h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            We leverage cutting-edge AI and comprehensive food databases to provide you with the most accurate and detailed food analysis available.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">OpenAI GPT-4</h3>
              <p className="text-muted-foreground">
                Advanced AI analysis for ingredient processing levels and nutritional insights
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Global Databases</h3>
              <p className="text-muted-foreground">
                20+ international food databases including USDA, OpenFoodFacts, and regional sources
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-time Analysis</h3>
              <p className="text-muted-foreground">
                Instant barcode scanning and product analysis with cascading database fallback
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied users who trust ProcessedOrNot for their nutrition decisions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 h-full">
                <CardContent className="p-0">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-muted-foreground mb-6 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Food Choices?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who are already making healthier food decisions with ProcessedOrNot. 
            Start your journey to better nutrition today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/product-lookup">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                <Camera className="w-5 h-5 mr-2" />
                Try It Free Now
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-primary">
                <Users className="w-5 h-5 mr-2" />
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-background border-t">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center space-x-6 mb-6 flex-wrap">
            <Link href="/about" className="text-muted-foreground hover:text-primary">About</Link>
            <Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacy</Link>
            <Link href="/terms" className="text-muted-foreground hover:text-primary">Terms</Link>
            <Link href="/copyright" className="text-muted-foreground hover:text-primary">Copyright</Link>
            <Link href="/contact" className="text-muted-foreground hover:text-primary">Contact</Link>
          </div>
          <p className="text-muted-foreground">
            © 2025 ProcessedOrNot. Making food transparency accessible to everyone.
          </p>
        </div>
      </footer>
    </div>
  );
}