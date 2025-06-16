import logoPath from "@assets/ProcessedOrNot-Logo-2-zoom-round-512x512_1749623629090.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Scan, 
  Search, 
  Camera, 
  Type, 
  Share2, 
  Globe, 
  Bot, 
  BarChart3,
  Lightbulb,
  MessageCircle,
  Download,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Help() {
  const { t } = useLanguage();

  const helpSections = [
    {
      id: 'getting-started',
      title: t('help.sections.gettingStarted.title'),
      icon: <Scan className="w-6 h-6 text-primary" />,
      items: [
        {
          title: t('help.sections.gettingStarted.scanning.title'),
          description: t('help.sections.gettingStarted.scanning.description'),
          icon: <Camera className="w-5 h-5 text-blue-500" />,
          steps: [
            t('help.sections.gettingStarted.scanning.step1'),
            t('help.sections.gettingStarted.scanning.step2'),
            t('help.sections.gettingStarted.scanning.step3'),
            t('help.sections.gettingStarted.scanning.step4')
          ]
        },
        {
          title: t('help.sections.gettingStarted.manual.title'),
          description: t('help.sections.gettingStarted.manual.description'),
          icon: <Type className="w-5 h-5 text-green-500" />,
          steps: [
            t('help.sections.gettingStarted.manual.step1'),
            t('help.sections.gettingStarted.manual.step2'),
            t('help.sections.gettingStarted.manual.step3')
          ]
        },
        {
          title: t('help.sections.gettingStarted.textSearch.title'),
          description: t('help.sections.gettingStarted.textSearch.description'),
          icon: <Search className="w-5 h-5 text-purple-500" />,
          steps: [
            t('help.sections.gettingStarted.textSearch.step1'),
            t('help.sections.gettingStarted.textSearch.step2'),
            t('help.sections.gettingStarted.textSearch.step3')
          ]
        }
      ]
    },
    {
      id: 'understanding-results',
      title: t('help.sections.results.title'),
      icon: <BarChart3 className="w-6 h-6 text-primary" />,
      items: [
        {
          title: t('help.sections.results.processing.title'),
          description: t('help.sections.results.processing.description'),
          icon: <Lightbulb className="w-5 h-5 text-amber-500" />,
          details: [
            { score: '0-3', label: t('help.sections.results.processing.minimal'), color: 'bg-green-100 text-green-800' },
            { score: '4-6', label: t('help.sections.results.processing.moderate'), color: 'bg-yellow-100 text-yellow-800' },
            { score: '7-10', label: t('help.sections.results.processing.high'), color: 'bg-red-100 text-red-800' }
          ]
        },
        {
          title: t('help.sections.results.nutrition.title'),
          description: t('help.sections.results.nutrition.description'),
          icon: <BarChart3 className="w-5 h-5 text-emerald-500" />,
          features: [
            t('help.sections.results.nutrition.quickStats'),
            t('help.sections.results.nutrition.spotlight'),
            t('help.sections.results.nutrition.insights'),
            t('help.sections.results.nutrition.recommendations')
          ]
        },
        {
          title: t('help.sections.results.facts.title'),
          description: t('help.sections.results.facts.description'),
          icon: <Info className="w-5 h-5 text-cyan-500" />,
          features: [
            t('help.sections.results.facts.interesting'),
            t('help.sections.results.facts.health'),
            t('help.sections.results.facts.environmental'),
            t('help.sections.results.facts.history')
          ]
        }
      ]
    },
    {
      id: 'features',
      title: t('help.sections.features.title'),
      icon: <Lightbulb className="w-6 h-6 text-primary" />,
      items: [
        {
          title: t('help.sections.features.nutribot.title'),
          description: t('help.sections.features.nutribot.description'),
          icon: <Bot className="w-5 h-5 text-indigo-500" />,
          tips: [
            t('help.sections.features.nutribot.tip1'),
            t('help.sections.features.nutribot.tip2'),
            t('help.sections.features.nutribot.tip3'),
            t('help.sections.features.nutribot.tip4')
          ]
        },
        {
          title: t('help.sections.features.sharing.title'),
          description: t('help.sections.features.sharing.description'),
          icon: <Share2 className="w-5 h-5 text-pink-500" />,
          platforms: [
            t('help.sections.features.sharing.facebook'),
            t('help.sections.features.sharing.twitter'),
            t('help.sections.features.sharing.linkedin'),
            t('help.sections.features.sharing.download')
          ]
        },
        {
          title: t('help.sections.features.languages.title'),
          description: t('help.sections.features.languages.description'),
          icon: <Globe className="w-5 h-5 text-orange-500" />,
          languages: [
            'English', 'Español', 'Français', 'Deutsch', '中文', '日本語', 'Nederlands'
          ]
        }
      ]
    },
    {
      id: 'troubleshooting',
      title: t('help.sections.troubleshooting.title'),
      icon: <HelpCircle className="w-6 h-6 text-primary" />,
      items: [
        {
          title: t('help.sections.troubleshooting.camera.title'),
          description: t('help.sections.troubleshooting.camera.description'),
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          solutions: [
            t('help.sections.troubleshooting.camera.solution1'),
            t('help.sections.troubleshooting.camera.solution2'),
            t('help.sections.troubleshooting.camera.solution3'),
            t('help.sections.troubleshooting.camera.solution4')
          ]
        },
        {
          title: t('help.sections.troubleshooting.notFound.title'),
          description: t('help.sections.troubleshooting.notFound.description'),
          icon: <Search className="w-5 h-5 text-orange-500" />,
          solutions: [
            t('help.sections.troubleshooting.notFound.solution1'),
            t('help.sections.troubleshooting.notFound.solution2'),
            t('help.sections.troubleshooting.notFound.solution3'),
            t('help.sections.troubleshooting.notFound.solution4')
          ]
        },
        {
          title: t('help.sections.troubleshooting.slow.title'),
          description: t('help.sections.troubleshooting.slow.description'),
          icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
          solutions: [
            t('help.sections.troubleshooting.slow.solution1'),
            t('help.sections.troubleshooting.slow.solution2'),
            t('help.sections.troubleshooting.slow.solution3')
          ]
        }
      ]
    }
  ];

  const faqs = [
    {
      question: t('help.faq.accuracy.question'),
      answer: t('help.faq.accuracy.answer')
    },
    {
      question: t('help.faq.privacy.question'),
      answer: t('help.faq.privacy.answer')
    },
    {
      question: t('help.faq.databases.question'),
      answer: t('help.faq.databases.answer')
    },
    {
      question: t('help.faq.ai.question'),
      answer: t('help.faq.ai.answer')
    },
    {
      question: t('help.faq.offline.question'),
      answer: t('help.faq.offline.answer')
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
              <span className="font-medium">{t('help.backToHome')}</span>
            </Link>
            <div className="flex items-center space-x-4">
              <img 
                src={logoPath} 
                alt="ProcessedOrNot Logo" 
                className="w-10 h-10 rounded-xl shadow-lg"
              />
              <h1 className="text-xl font-bold gradient-text">{t('help.title')}</h1>
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
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-2xl floating-animation">
                <HelpCircle className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl -z-10"></div>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-shadow">
            {t('help.hero.title')}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            {t('help.hero.subtitle')}
          </p>
        </section>

        {/* Help Sections */}
        <div className="space-y-16">
          {helpSections.map((section, sectionIndex) => (
            <section key={section.id} className="slide-up">
              <div className="flex items-center space-x-4 mb-8">
                <div className="p-3 bg-primary/10 rounded-xl">
                  {section.icon}
                </div>
                <h2 className="text-3xl font-bold text-foreground">{section.title}</h2>
              </div>
              
              <div className="grid gap-8">
                {section.items.map((item, itemIndex) => (
                  <Card key={itemIndex} className="glass-card hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-8">
                      <div className="flex items-start space-x-4 mb-6">
                        <div className="p-2 bg-card rounded-lg">
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                          <p className="text-muted-foreground">{item.description}</p>
                        </div>
                      </div>

                      {/* Steps */}
                      {'steps' in item && item.steps && (
                        <div className="space-y-3">
                          {item.steps.map((step: string, stepIndex: number) => (
                            <div key={stepIndex} className="flex items-center space-x-3">
                              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-semibold text-primary">{stepIndex + 1}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{step}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Processing Score Details */}
                      {'details' in item && item.details && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                          {item.details.map((detail: any, detailIndex: number) => (
                            <div key={detailIndex} className="text-center p-4 bg-muted/50 rounded-lg">
                              <Badge className={`mb-2 ${detail.color}`}>{detail.score}</Badge>
                              <p className="text-sm font-medium text-foreground">{detail.label}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Features List */}
                      {(('features' in item && item.features) || ('tips' in item && item.tips) || ('platforms' in item && item.platforms) || ('solutions' in item && item.solutions)) && (
                        <div className="mt-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {(('features' in item && item.features) || ('tips' in item && item.tips) || ('platforms' in item && item.platforms) || ('solutions' in item && item.solutions) || []).map((feature: string, featureIndex: number) => (
                              <div key={featureIndex} className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span className="text-sm text-muted-foreground">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Languages */}
                      {'languages' in item && item.languages && (
                        <div className="mt-6">
                          <div className="flex flex-wrap gap-2">
                            {item.languages.map((language: string, langIndex: number) => (
                              <Badge key={langIndex} variant="outline" className="text-xs">
                                {language}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* FAQ Section */}
        <section className="mt-16 slide-up">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-3 bg-primary/10 rounded-xl">
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">{t('help.faq.title')}</h2>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="glass-card hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="mt-16 slide-up">
          <Card className="glass-card text-center">
            <CardContent className="p-8">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('help.contact.title')}</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                {t('help.contact.description')}
              </p>
              <a
                href="https://www.linkedin.com/in/matthias-kuchenbecker/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <span>{t('help.contact.button')}</span>
              </a>
            </CardContent>
          </Card>
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