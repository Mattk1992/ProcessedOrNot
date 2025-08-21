import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Crown, Zap, Shield, Star, ArrowRight, Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

interface PlanFeature {
  name: string;
  included: boolean;
  premium?: boolean;
}

interface SubscriptionPlan {
  name: string;
  price: string;
  billingPeriod: string;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
  color: string;
  icon: any;
  buttonText: string;
  buttonVariant: "default" | "outline";
}

export default function SubscriptionPage() {
  const { user, isAuthenticated } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans: SubscriptionPlan[] = [
    {
      name: "Free",
      price: "$0",
      billingPeriod: "forever",
      description: "Perfect for getting started with basic nutrition analysis",
      features: [
        { name: "Basic barcode scanning", included: true },
        { name: "5 AI insights per day", included: true },
        { name: "Basic nutrition facts", included: true },
        { name: "Community support", included: true },
        { name: "Advanced AI analysis", included: false },
        { name: "Unlimited scans", included: false },
        { name: "Priority support", included: false },
        { name: "Custom meal planning", included: false },
      ],
      color: "border-gray-200 dark:border-gray-700",
      icon: Shield,
      buttonText: "Get Started",
      buttonVariant: "outline"
    },
    {
      name: "Pro",
      price: billingCycle === 'monthly' ? "$9.99" : "$99.99",
      billingPeriod: billingCycle === 'monthly' ? "/month" : "/year",
      description: "Ideal for health-conscious individuals and families",
      features: [
        { name: "Unlimited barcode scanning", included: true },
        { name: "Unlimited AI insights", included: true },
        { name: "Advanced nutrition analysis", included: true, premium: true },
        { name: "Custom meal planning", included: true, premium: true },
        { name: "Export nutrition reports", included: true, premium: true },
        { name: "Priority support", included: true, premium: true },
        { name: "Ad-free experience", included: true, premium: true },
        { name: "Early access to features", included: true, premium: true },
      ],
      popular: true,
      color: "border-blue-300 dark:border-blue-600 ring-2 ring-blue-200 dark:ring-blue-800",
      icon: Zap,
      buttonText: "Upgrade to Pro",
      buttonVariant: "default"
    },
    {
      name: "Enterprise",
      price: billingCycle === 'monthly' ? "$49.99" : "$499.99",
      billingPeriod: billingCycle === 'monthly' ? "/month" : "/year",
      description: "Comprehensive solution for businesses and organizations",
      features: [
        { name: "Everything in Pro", included: true },
        { name: "Multi-user management", included: true, premium: true },
        { name: "API access", included: true, premium: true },
        { name: "Custom integrations", included: true, premium: true },
        { name: "Advanced analytics dashboard", included: true, premium: true },
        { name: "White-label options", included: true, premium: true },
        { name: "Dedicated account manager", included: true, premium: true },
        { name: "99.9% SLA guarantee", included: true, premium: true },
      ],
      color: "border-purple-300 dark:border-purple-600",
      icon: Crown,
      buttonText: "Contact Sales",
      buttonVariant: "outline"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            Choose Your Nutrition Journey
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 dark:from-white dark:to-blue-400 bg-clip-text text-transparent mb-4">
            Subscription Plans
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Unlock the full potential of ProcessedOrNot Scanner with advanced AI analysis, 
            unlimited scans, and personalized nutrition insights.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                billingCycle === 'yearly' ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                Yearly
              </span>
              {billingCycle === 'yearly' && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  Save 20%
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <Card key={index} className={`relative ${plan.color} ${plan.popular ? 'transform scale-105' : ''} transition-all duration-300 hover:shadow-lg`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 hover:bg-blue-600 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    {plan.name}
                  </CardTitle>
                  
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {plan.billingPeriod}
                    </span>
                  </div>
                  
                  <CardDescription className="mt-4 text-gray-600 dark:text-gray-300">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <Button 
                    className={`w-full mb-6 ${plan.buttonVariant === 'default' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    variant={plan.buttonVariant}
                    size="lg"
                  >
                    {plan.buttonText}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        <CheckCircle 
                          className={`w-5 h-5 flex-shrink-0 ${
                            feature.included 
                              ? feature.premium 
                                ? 'text-blue-600' 
                                : 'text-green-500'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                        <span className={`text-sm ${
                          feature.included 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-500 dark:text-gray-400 line-through'
                        }`}>
                          {feature.name}
                        </span>
                        {feature.premium && feature.included && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            Pro
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change my plan anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes! You can upgrade, downgrade, or cancel your subscription at any time. 
                  Changes will be reflected in your next billing cycle.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  We accept all major credit cards, PayPal, and bank transfers for Enterprise customers. 
                  All payments are processed securely through our payment partners.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Our Free plan gives you full access to basic features with no time limit. 
                  Pro and Enterprise plans come with a 14-day free trial, no credit card required.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Admin Site Info Button */}
        {user?.accountType === 'Admin' && (
          <div className="max-w-3xl mx-auto mt-12 mb-8">
            <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-800/30 rounded-lg">
                      <Info className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                        Admin Access
                      </h3>
                      <p className="text-amber-600 dark:text-amber-300 text-sm">
                        Access site information and administrative tools
                      </p>
                    </div>
                  </div>
                  <Link href="/site-info">
                    <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-800/30">
                      <Info className="w-4 h-4 mr-2" />
                      Site Info
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to transform your nutrition journey?</h3>
            <p className="mb-6 opacity-90">Join thousands of users making healthier choices with AI-powered insights.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link href="/nutri-dashboard">
                  <Button variant="secondary" size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/register">
                  <Button variant="secondary" size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                    Start Free Today
                  </Button>
                </Link>
              )}
              <Link href="/contact">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}