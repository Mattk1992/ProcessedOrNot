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
import { useAuth } from "@/hooks/useAuth";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  
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
      description: "Lightning-fast barcode recognition technology that works in any lighting condition. Simply point, scan, and discover the truth about your food in seconds."
    },
    {
      icon: <Brain className="w-8 h-8 text-primary" />,
      title: "AI-Powered Analysis",
      description: "Advanced GPT-4 technology analyzes ingredient lists, processing methods, and nutritional profiles to give you insights no other app can provide."
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-primary" />,
      title: "NutriBot Assistant",
      description: "Your personal nutrition expert available 24/7. Ask questions, get personalized recommendations, and learn about ingredients in natural conversation."
    },
    {
      icon: <Globe className="w-8 h-8 text-primary" />,
      title: "Global Food Database",
      description: "Comprehensive data from 10+ trusted international sources including USDA, OpenFoodFacts, and regional databases for unmatched coverage."
    },
    {
      icon: <Smartphone className="w-8 h-8 text-primary" />,
      title: "Cross-Platform Access",
      description: "Seamlessly sync your data across web, iOS, and Android. Start scanning on your phone, continue on your computer - your insights follow you everywhere."
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "Privacy & Security",
      description: "Bank-level encryption protects your data. We never sell your information or track your habits. Your food choices remain completely private."
    }
  ];

  const stats = [
    { icon: <Search className="w-6 h-6" />, value: "4M+", label: "Food Products" },
    { icon: <Brain className="w-6 h-6" />, value: "In-depth", label: "Product Analysis" },
    { icon: <Globe className="w-6 h-6" />, value: "10+", label: "Food Databases" },
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
      <section className="relative py-24 md:py-32 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-gradient-to-br from-blue-500/10 to-primary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <Badge variant="secondary" className="mb-8 text-sm font-medium px-4 py-2 bg-primary/10 text-primary border-primary/20">
            🚀 Trusted by thousands - Web & Mobile Apps available
          </Badge>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-primary via-blue-600 to-primary bg-clip-text text-transparent leading-tight">
            ProcessedOrNot
          </h1>
          
          <div className="max-w-4xl mx-auto mb-10">
            <p className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
              Know What You're Really Eating
            </p>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Transform your food choices with AI-powered analysis. Scan any product barcode and get instant, 
              comprehensive insights into processing levels, ingredient quality, and nutritional value.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href={isAuthenticated ? "/product-lookup?focus=input&autoFocus=true" : "/product-lookup"}>
              <Button size="lg" className="text-xl px-10 py-7 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <Camera className="w-6 h-6 mr-3" />
                Start Scanning Now
              </Button>
            </Link>
            {!isAuthenticated && !isLoading && (
              <Link href="/login">
                <Button variant="outline" size="lg" className="text-lg px-8 py-7 border-2 hover:bg-primary/5">
                  <User className="w-5 h-5 mr-2" />
                  Login or Register
                </Button>
              </Link>
            )}
            <Link href="/apps">
              <Button variant="outline" size="lg" className="text-lg px-8 py-7 border-2 hover:bg-primary/5">
                <Smartphone className="w-5 h-5 mr-2" />
                Download Mobile App
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="relative group">
                <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <div className="text-primary">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                  <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Advanced technology meets intuitive design to deliver everything you need for smarter food choices
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group h-full border-0 bg-background/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative z-10 pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors duration-300">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-base leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Why Choose ProcessedOrNot?
              </h2>
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                Join thousands of health-conscious individuals who trust our platform to make smarter food decisions. 
                Powered by cutting-edge AI and backed by comprehensive nutritional science.
              </p>
              
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-4 group">
                    <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 group-hover:bg-green-500/20 transition-colors">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <span className="text-lg leading-relaxed group-hover:text-foreground transition-colors">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-3xl blur-2xl transform rotate-6"></div>
              <Card className="relative p-10 bg-gradient-to-br from-primary/5 to-blue-500/5 border-primary/20 backdrop-blur-sm">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8 animate-pulse">
                    <Heart className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    Health-First Approach
                  </h3>
                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    Our mission is to democratize food transparency. Every algorithm, every feature, every decision 
                    is made with your health and wellbeing as the top priority.
                  </p>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-background/50 rounded-xl">
                      <div className="text-3xl font-bold text-primary">10+</div>
                      <div className="text-sm font-medium text-muted-foreground">Databases</div>
                    </div>
                    <div className="text-center p-4 bg-background/50 rounded-xl">
                      <div className="text-3xl font-bold text-primary">7</div>
                      <div className="text-sm font-medium text-muted-foreground">Languages</div>
                    </div>
                    <div className="text-center p-4 bg-background/50 rounded-xl">
                      <div className="text-3xl font-bold text-primary">24/7</div>
                      <div className="text-sm font-medium text-muted-foreground">Available</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Powered by Advanced Technology
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-16 max-w-4xl mx-auto leading-relaxed">
            Cutting-edge AI meets comprehensive nutritional data to deliver insights that transform how you understand food
          </p>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <Card className="group p-8 bg-background/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/10 to-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-600 transition-colors">OpenAI GPT-4</h3>
                <p className="text-muted-foreground text-lg leading-relaxed group-hover:text-foreground transition-colors">
                  State-of-the-art AI technology analyzes ingredient complexity, processing methods, and nutritional impact with unmatched accuracy
                </p>
              </div>
            </Card>

            <Card className="group p-8 bg-background/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500/10 to-green-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-green-600 transition-colors">Global Database Network</h3>
                <p className="text-muted-foreground text-lg leading-relaxed group-hover:text-foreground transition-colors">
                  10+ trusted international sources including USDA, OpenFoodFacts, and regional databases for comprehensive coverage
                </p>
              </div>
            </Card>

            <Card className="group p-8 bg-background/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/10 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-purple-600 transition-colors">Lightning-Fast Analysis</h3>
                <p className="text-muted-foreground text-lg leading-relaxed group-hover:text-foreground transition-colors">
                  Instant results through intelligent database cascading and real-time processing for immediate insights
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-muted/30 to-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Trusted by Thousands
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Real stories from people who've transformed their relationship with food using ProcessedOrNot
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="group p-8 h-full bg-background/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="p-0 relative z-10">
                  <div className="flex mb-6 justify-center">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-muted-foreground mb-8 text-lg italic leading-relaxed group-hover:text-foreground transition-colors">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center justify-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-full flex items-center justify-center mr-4">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg">{testimonial.name}</div>
                      <div className="text-muted-foreground font-medium">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 md:py-32 px-4 bg-gradient-to-br from-primary via-blue-600 to-primary text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-blue-600/90"></div>
        <div className="absolute top-10 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            Transform Your Food Journey
          </h2>
          <p className="text-xl md:text-2xl mb-12 opacity-95 max-w-3xl mx-auto leading-relaxed">
            Join thousands of health-conscious individuals making smarter food decisions every day. 
            Your journey to food transparency starts with a single scan.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/product-lookup">
              <Button size="lg" variant="secondary" className="text-xl px-12 py-8 bg-white text-primary hover:bg-white/90 shadow-2xl hover:shadow-white/20 transition-all duration-300 transform hover:scale-105">
                <Camera className="w-6 h-6 mr-3" />
                Start Scanning Free
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="lg" variant="outline" className="text-xl px-12 py-8 border-2 border-white text-white hover:bg-white hover:text-primary transition-all duration-300 transform hover:scale-105">
                <Users className="w-6 h-6 mr-3" />
                Create Your Account
              </Button>
            </Link>
          </div>
          
          <div className="mt-12 text-white/80">
            <p className="text-lg">✨ No credit card required • Instant access • 4+ million products</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 bg-gradient-to-b from-background to-muted/30 border-t border-border/50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center space-x-8 mb-8 flex-wrap">
            <Link href="/about" className="text-lg text-muted-foreground hover:text-primary transition-colors font-medium">About</Link>
            <Link href="/privacy" className="text-lg text-muted-foreground hover:text-primary transition-colors font-medium">Privacy</Link>
            <Link href="/terms" className="text-lg text-muted-foreground hover:text-primary transition-colors font-medium">Terms</Link>
            <Link href="/contact" className="text-lg text-muted-foreground hover:text-primary transition-colors font-medium">Contact</Link>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8"></div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            © 2025 ProcessedOrNot. Empowering healthier choices through food transparency.
          </p>
        </div>
      </footer>
    </div>
  );
}