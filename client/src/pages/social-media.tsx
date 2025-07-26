import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Users, Heart, MessageCircle, ExternalLink, Smartphone, Globe } from "lucide-react";
import { SiFacebook, SiX, SiInstagram, SiLinkedin, SiTiktok, SiYoutube } from "react-icons/si";

export default function SocialMedia() {
  const socialPlatforms = [
    {
      name: "Facebook",
      icon: <SiFacebook className="h-6 w-6" />,
      handle: "@ProcessedOrNot",
      followers: "12.5K",
      description: "Daily nutrition tips, product spotlights, and community discussions about healthier eating.",
      link: "https://facebook.com/processedornot",
      color: "text-blue-600",
      bgColor: "bg-blue-50 hover:bg-blue-100",
      borderColor: "border-blue-200"
    },
    {
      name: "Instagram",
      icon: <SiInstagram className="h-6 w-6" />,
      handle: "@processedornot",
      followers: "28.3K",
      description: "Visual food guides, behind-the-scenes content, and user-generated product scans.",
      link: "https://instagram.com/processedornot",
      color: "text-pink-600",
      bgColor: "bg-pink-50 hover:bg-pink-100",
      borderColor: "border-pink-200"
    },
    {
      name: "Twitter/X",
      icon: <SiX className="h-6 w-6" />,
      handle: "@ProcessedOrNot",
      followers: "15.7K",
      description: "Real-time updates, nutrition news, quick tips, and engaging conversations about food health.",
      link: "https://twitter.com/processedornot",
      color: "text-gray-800",
      bgColor: "bg-gray-50 hover:bg-gray-100",
      borderColor: "border-gray-200"
    },
    {
      name: "TikTok",
      icon: <SiTiktok className="h-6 w-6" />,
      handle: "@processedornot",
      followers: "45.2K",
      description: "Short-form videos about food processing, quick product reviews, and fun nutrition facts.",
      link: "https://tiktok.com/@processedornot",
      color: "text-gray-900",
      bgColor: "bg-gray-50 hover:bg-gray-100",
      borderColor: "border-gray-200"
    },
    {
      name: "YouTube",
      icon: <SiYoutube className="h-6 w-6" />,
      handle: "ProcessedOrNot Scanner",
      followers: "8.9K",
      description: "In-depth food analysis videos, app tutorials, and educational content about nutrition.",
      link: "https://youtube.com/@processedornot",
      color: "text-red-600",
      bgColor: "bg-red-50 hover:bg-red-100",
      borderColor: "border-red-200"
    },
    {
      name: "LinkedIn",
      icon: <SiLinkedin className="h-6 w-6" />,
      handle: "ProcessedOrNot",
      followers: "3.4K",
      description: "Professional insights on food technology, industry trends, and business sustainability.",
      link: "https://linkedin.com/company/processedornot",
      color: "text-blue-700",
      bgColor: "bg-blue-50 hover:bg-blue-100",
      borderColor: "border-blue-200"
    }
  ];

  const communityStats = [
    { label: "Total Followers", value: "114K+", icon: <Users className="h-5 w-5" /> },
    { label: "Monthly Engagement", value: "2.3M", icon: <Heart className="h-5 w-5" /> },
    { label: "User-Generated Content", value: "15K+", icon: <Share2 className="h-5 w-5" /> },
    { label: "Community Posts", value: "850+", icon: <MessageCircle className="h-5 w-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Share2 className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-gray-900">Social Media</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our growing community across social platforms. Share your food discoveries, 
            get nutrition tips, and connect with health-conscious people worldwide.
          </p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {communityStats.map((stat, index) => (
            <Card key={index} className="text-center shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-2 text-primary">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Social Platforms */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {socialPlatforms.map((platform, index) => (
            <Card key={index} className={`shadow-lg hover:shadow-xl transition-all duration-300 ${platform.bgColor} border ${platform.borderColor}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={platform.color}>
                      {platform.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{platform.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {platform.handle}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-900">{platform.followers}</div>
                    <div className="text-xs text-gray-600">followers</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                  {platform.description}
                </p>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => window.open(platform.link, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Follow Us
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Community Features */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                Share Your Scans
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Share your food discoveries with our community! Use our built-in sharing features to post your 
                product scans directly to your favorite social platforms.
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold">How to Share:</h4>
                <ul className="text-gray-600 space-y-1 text-sm">
                  <li>• Scan any product with ProcessedOrNot</li>
                  <li>• View the analysis results</li>
                  <li>• Tap the share button on the results page</li>
                  <li>• Choose your preferred social platform</li>
                  <li>• Add your thoughts and post!</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Join the Conversation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Engage with our community using hashtags, participate in discussions, 
                and discover what others are learning about their food choices.
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold">Popular Hashtags:</h4>
                <div className="flex flex-wrap gap-2">
                  {['#ProcessedOrNot', '#FoodAnalysis', '#HealthyEating', '#NutritionFacts', '#FoodScanning'].map((tag) => (
                    <span key={tag} className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Content */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Featured Community Content</CardTitle>
            <CardDescription className="text-center">
              See what our community is sharing and discovering
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-primary/10 rounded-lg p-4 mb-3">
                  <div className="text-2xl mb-2">📱</div>
                  <h3 className="font-semibold mb-1">Product of the Week</h3>
                  <p className="text-sm text-gray-600">
                    Weekly spotlight on interesting products discovered by our community
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-accent/10 rounded-lg p-4 mb-3">
                  <div className="text-2xl mb-2">🎓</div>
                  <h3 className="font-semibold mb-1">Nutrition Tips</h3>
                  <p className="text-sm text-gray-600">
                    Educational content and tips shared across all our social platforms
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 rounded-lg p-4 mb-3">
                  <div className="text-2xl mb-2">🌟</div>
                  <h3 className="font-semibold mb-1">User Stories</h3>
                  <p className="text-sm text-gray-600">
                    Real stories from users about their journey to healthier eating
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Card className="shadow-lg bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Join Our Community?</h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Follow us on your favorite platforms, share your food discoveries, and become part of a 
                community that's passionate about making informed food choices.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {socialPlatforms.slice(0, 4).map((platform, index) => (
                  <Button 
                    key={index}
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => window.open(platform.link, '_blank')}
                  >
                    <div className={platform.color}>
                      {platform.icon}
                    </div>
                    {platform.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}