import logoPath from "@assets/ProcessedOrNot-Logo-2-zoom-round-512x512_1749623629090.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { ArrowLeft, Scan, Brain, Globe, Shield, Zap, Users } from "lucide-react";

export default function About() {
  const { t } = useLanguage();

  const features = [
    {
      icon: <Scan className="w-8 h-8 text-primary" />,
      title: t('about.features.scanning.title'),
      description: t('about.features.scanning.description')
    },
    {
      icon: <Brain className="w-8 h-8 text-primary" />,
      title: t('about.features.ai.title'),
      description: t('about.features.ai.description')
    },
    {
      icon: <Globe className="w-8 h-8 text-primary" />,
      title: t('about.features.multilingual.title'),
      description: t('about.features.multilingual.description')
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: t('about.features.privacy.title'),
      description: t('about.features.privacy.description')
    },
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: t('about.features.instant.title'),
      description: t('about.features.instant.description')
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: t('about.features.community.title'),
      description: t('about.features.community.description')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Header */}
      <header className="glass-effect border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 text-foreground hover:text-primary transition-colors group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">{t('about.backToHome')}</span>
            </Link>
            <div className="flex items-center space-x-4">
              <img 
                src={logoPath} 
                alt="ProcessedOrNot Logo" 
                className="w-10 h-10 rounded-xl shadow-lg"
              />
              <h1 className="text-xl font-bold gradient-text">{t('about.title')}</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <img 
                src={logoPath} 
                alt="ProcessedOrNot Logo" 
                className="w-24 h-24 rounded-2xl shadow-2xl floating-animation"
              />
              <div className="absolute -inset-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl -z-10"></div>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-shadow">
            {t('about.hero.title')}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            {t('about.hero.subtitle')}
          </p>
        </section>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="glass-card p-8 rounded-3xl glow-effect">
            <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
              {t('about.mission.title')}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed text-center max-w-4xl mx-auto">
              {t('about.mission.description')}
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
            {t('about.features.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="glass-card p-6 rounded-2xl hover:scale-105 transition-transform duration-300 group"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Technology Section */}
        <section className="mb-16">
          <div className="glass-card p-8 rounded-3xl">
            <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
              {t('about.technology.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {t('about.technology.databases.title')}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {t('about.technology.databases.description')}
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• OpenFoodFacts (Primary Database)</li>
                  <li>• USDA FoodData Central</li>
                  <li>• Health Canada Food Database</li>
                  <li>• European Food Safety Authority</li>
                  <li>• Australian Food Composition Database</li>
                  <li>• {t('about.technology.databases.more')}</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {t('about.technology.ai.title')}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {t('about.technology.ai.description')}
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• {t('about.technology.ai.features.processing')}</li>
                  <li>• {t('about.technology.ai.features.nutrition')}</li>
                  <li>• {t('about.technology.ai.features.chatbot')}</li>
                  <li>• {t('about.technology.ai.features.insights')}</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Developer Section */}
        <section className="mb-16">
          <div className="glass-card p-8 rounded-3xl text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              {t('about.developer.title')}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-6">
              {t('about.developer.description')}
            </p>
            <a
              href="https://www.linkedin.com/in/matthias-kuchenbecker/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-primary font-medium"
            >
              <span>{t('about.developer.connect')}</span>
            </a>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <div className="gradient-card rounded-3xl p-1 glow-effect">
            <div className="bg-background rounded-3xl p-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                {t('about.cta.title')}
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                {t('about.cta.description')}
              </p>
              <Link href="/" className="inline-flex items-center space-x-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl">
                <Scan className="w-5 h-5" />
                <span>{t('about.cta.button')}</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-40 w-80 h-80 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -left-40 w-80 h-80 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}