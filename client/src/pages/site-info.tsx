import { Link } from "wouter";
import { 
  Info, 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  BookOpen, 
  Users,
  ExternalLink,
  ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import HeaderDropdown from "@/components/header-dropdown";
import LanguageSwitcher from "@/components/language-switcher";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import logoPath from "@assets/ProcessedOrNot-Logo-2-zoom-round-512x512_1749623629090.png";

const infoPages = [
  {
    title: "Features",
    description: "Discover all the powerful features our nutrition app offers",
    icon: Info,
    href: "/features",
    color: "text-blue-500"
  },
  {
    title: "Support",
    description: "Get help with common issues and troubleshooting",
    icon: HelpCircle,
    href: "/support",
    color: "text-green-500"
  },
  {
    title: "Contact",
    description: "Get in touch with our team for assistance",
    icon: MessageCircle,
    href: "/contact",
    color: "text-purple-500"
  },
  {
    title: "Blog",
    description: "Read our latest articles about nutrition and health",
    icon: BookOpen,
    href: "/blog",
    color: "text-orange-500"
  },
  {
    title: "Help",
    description: "Find answers to frequently asked questions",
    icon: Mail,
    href: "/help",
    color: "text-red-500"
  },
  {
    title: "About Us",
    description: "Learn more about our mission and team",
    icon: Users,
    href: "/about",
    color: "text-indigo-500"
  }
];

export default function SiteInfo() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      {/* Header */}
      <header className="backdrop-blur-md bg-background/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img src={logoPath} alt="ProcessedOrNot Scanner" className="w-10 h-10 rounded-full" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold gradient-text">ProcessedOrNot</h1>
                <p className="text-xs text-muted-foreground">Site Information</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/nutri-dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
              <Link href="/nutri-dashboard/diary" className="text-muted-foreground hover:text-foreground transition-colors">Diary</Link>
              <Link href="/nutri-dashboard/progress" className="text-muted-foreground hover:text-foreground transition-colors">Progress</Link>
              <Link href="/nutri-dashboard/profile" className="text-muted-foreground hover:text-foreground transition-colors">Profile</Link>
              <Link href="/nutri-dashboard/settings" className="text-muted-foreground hover:text-foreground transition-colors">Settings</Link>
              <Link href="/nutri-dashboard/site-info" className="text-foreground font-medium">Site Info</Link>
            </nav>

            <div className="flex items-center space-x-3">
              <LanguageSwitcher />
              <HeaderDropdown />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <Link href="/nutri-dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <h2 className="text-3xl font-bold mb-2">Site Information and Support</h2>
            <p className="text-muted-foreground">Find helpful resources, support, and information about our platform</p>
          </div>
        </div>

        {/* Info Pages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {infoPages.map((page) => (
            <Link key={page.href} href={page.href}>
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-muted group-hover:bg-background transition-colors`}>
                      <page.icon className={`w-6 h-6 ${page.color}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="flex items-center justify-between">
                        {page.title}
                        <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {page.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Contact Section */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                <span>Need Immediate Help?</span>
              </CardTitle>
              <CardDescription>
                Can't find what you're looking for? Get in touch with our support team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/contact">
                  <Button className="w-full sm:w-auto">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                </Link>
                <Link href="/help">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Browse FAQ
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}