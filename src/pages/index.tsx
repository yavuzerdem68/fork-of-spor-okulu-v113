import React from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  CreditCard, 
  FileText, 
  Calendar, 
  MessageCircle, 
  Camera, 
  UserCheck, 
  BarChart3,
  Trophy,
  Target,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  Play,
  Star
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const sports = [
  "Basketbol", "Hentbol", "Yüzme", "Akıl ve Zeka Oyunları", "Satranç", "Futbol", "Voleybol"
];

const features = [
  {
    icon: Users,
    title: "Sporcu & Veli Kayıt Yönetimi",
    description: "Tüm sporcu ve veli bilgilerini merkezi sistemde güvenle saklayın ve yönetin."
  },
  {
    icon: CreditCard,
    title: "Aidat Takip Sistemi",
    description: "Ödeme durumlarını takip edin, otomatik hatırlatmalar gönderin."
  },
  {
    icon: FileText,
    title: "E-Fatura Entegrasyonu",
    description: "Aylık faturaları otomatik oluşturun ve Excel formatında dışa aktarın."
  },
  {
    icon: Calendar,
    title: "Antrenman Programları",
    description: "Antrenman takvimlerini oluşturun ve velilerle anında paylaşın."
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Entegrasyonu",
    description: "Grup oluşturma, devamsızlık bildirimleri ve toplu mesaj gönderimi."
  },
  {
    icon: Camera,
    title: "Medya Paylaşımı",
    description: "Antrenman ve maç fotoğraf/videolarını güvenle velilerle paylaşın."
  },
  {
    icon: UserCheck,
    title: "Yoklama Sistemi",
    description: "Dijital yoklama alın, devamsızlıkları otomatik takip edin."
  },
  {
    icon: BarChart3,
    title: "Veli Portalı",
    description: "Veliler kendi hesaplarından aidat durumlarını takip edebilir."
  }
];

const stats = [
  { number: "7", label: "Spor Branşı" },
  { number: "500+", label: "Aktif Sporcu" },
  { number: "1000+", label: "Kayıtlı Veli" },
  { number: "99%", label: "Memnuniyet" }
];

export default function Home() {
  return (
    <>
      <Head>
        <title>SportsCRM - Spor Okulu Yönetim Sistemi</title>
        <meta name="description" content="Spor okulunuzu dijitalleştirin. Sporcu kayıtları, aidat takibi, antrenman programları ve daha fazlası için kapsamlı CRM sistemi." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="bg-background min-h-screen">
        {/* Navigation */}
        <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <Trophy className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-primary">SportsCRM</span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <Button variant="ghost">Giriş Yap</Button>
              <Button>Demo İste</Button>
            </motion.div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
          <div className="container mx-auto px-4 py-24 relative">
            <motion.div 
              className="text-center max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge variant="secondary" className="mb-6">
                <Zap className="w-4 h-4 mr-2" />
                Türkiye'nin En Gelişmiş Spor Okulu CRM'i
              </Badge>
              
              <h1 className="text-5xl md:text-7xl font-bold text-primary mb-6 leading-tight">
                Spor Okulunuzu
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60"> Dijitalleştirin</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Sporcu kayıtlarından aidat takibine, antrenman programlarından veli iletişimine kadar 
                tüm süreçlerinizi tek platformda yönetin.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button size="lg" className="text-lg px-8 py-6">
                  <Play className="w-5 h-5 mr-2" />
                  Ücretsiz Demo
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  Özellikleri İncele
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              {/* Sports Badges */}
              <motion.div 
                className="flex flex-wrap justify-center gap-3"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {sports.map((sport, index) => (
                  <motion.div key={sport} variants={fadeInUp}>
                    <Badge variant="outline" className="text-sm py-2 px-4">
                      {sport}
                    </Badge>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Hero Image */}
        <section className="container mx-auto px-4 -mt-12 mb-24">
          <motion.div 
            className="relative max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative rounded-2xl overflow-hidden border border-border/50">
              <img 
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                alt="Spor Okulu Yönetimi"
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            </div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 mb-24">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div key={index} variants={fadeInUp} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-24">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="secondary" className="mb-4">
              <Target className="w-4 h-4 mr-2" />
              Özellikler
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
              İhtiyacınız Olan Her Şey
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Spor okulunuzun tüm süreçlerini optimize eden kapsamlı özellikler
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full border-border/50 hover:border-primary/20 transition-all duration-300 group">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Benefits Section */}
        <section className="bg-secondary/30 py-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Badge variant="secondary" className="mb-4">
                  <Shield className="w-4 h-4 mr-2" />
                  Avantajlar
                </Badge>
                <h2 className="text-4xl font-bold text-primary mb-6">
                  Neden SportsCRM?
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Geleneksel yöntemlerden kurtulun, dijital dönüşümü yaşayın
                </p>
                
                <div className="space-y-4">
                  {[
                    "Zaman tasarrufu: %80'e varan verimlilik artışı",
                    "Maliyet azaltma: Kağıt işlemlerden kurtulun",
                    "Hata oranı: Manuel işlemlerdeki hataları minimize edin",
                    "Veli memnuniyeti: Şeffaf ve hızlı iletişim",
                    "Profesyonel görünüm: Kurumsal imajınızı güçlendirin"
                  ].map((benefit, index) => (
                    <motion.div 
                      key={index}
                      className="flex items-center space-x-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-foreground">{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <img 
                  src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                  alt="Takım Çalışması"
                  className="rounded-2xl w-full h-[500px] object-cover"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-24">
          <motion.div 
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
              Spor Okulunuzu Geleceğe Taşıyın
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Bugün başlayın, farkı hemen görün. 30 gün ücretsiz deneme fırsatı.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6">
                Hemen Başla
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Satış Ekibiyle Görüş
              </Button>
            </div>
            
            <div className="flex items-center justify-center mt-8 space-x-2 text-sm text-muted-foreground">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="ml-2">5.0 - 200+ mutlu müşteri</span>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/40 bg-secondary/20">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <Trophy className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold text-primary">SportsCRM</span>
              </div>
              
              <div className="text-sm text-muted-foreground">
                © 2024 SportsCRM. Tüm hakları saklıdır.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
