import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const features = [
    {
      icon: "💬",
      title: "Omnichannel Messaging",
      description: "WhatsApp, Email, Web Chat - semua dalam satu dashboard",
    },
    {
      icon: "☎️",
      title: "Softphone Terintegrasi",
      description: "Panggilan inbound/outbound dengan recording dan analytics",
    },
    {
      icon: "🎫",
      title: "Smart Ticketing",
      description: "Ticket automation dengan AI categorization dan SLA tracking",
    },
    {
      icon: "🤖",
      title: "AI-Powered",
      description: "Chatbot, smart suggestions, dan predictive analytics",
    },
    {
      icon: "👥",
      title: "Team Collaboration",
      description: "Multi-agent queue, internal notes, dan performance tracking",
    },
    {
      icon: "📊",
      title: "Advanced Analytics",
      description: "Real-time dashboards dan customer insights",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
              J
            </div>
            <span className="font-bold text-lg">Jiwaku</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground">
            AI-Powered Omnichannel
            <br />
            <span className="text-primary">CRM Platform</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Satu platform untuk mengelola semua saluran komunikasi pelanggan Anda
            dengan kecerdasan buatan yang canggih
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/login">
              <Button size="lg">Start Free Trial</Button>
            </Link>
            <Button variant="outline" size="lg">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Fitur Utama</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="text-4xl mb-2">{feature.icon}</div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-primary">1000+</div>
            <p className="text-muted-foreground">Teams menggunakan Jiwaku</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary">99.9%</div>
            <p className="text-muted-foreground">Uptime guarantee</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary">24/7</div>
            <p className="text-muted-foreground">Customer support</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-3xl">
              Siap untuk mengubah customer support Anda?
            </CardTitle>
            <CardDescription className="text-lg">
              Bergabunglah dengan ribuan perusahaan yang menggunakan Jiwaku
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button size="lg">Mulai sekarang - Gratis 14 hari</Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-white text-xs font-bold">
                  J
                </div>
                <span className="font-bold">Jiwaku</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-Powered Omnichannel CRM
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Features</Link></li>
                <li><Link href="#" className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="#" className="hover:text-foreground">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">About</Link></li>
                <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Privacy</Link></li>
                <li><Link href="#" className="hover:text-foreground">Terms</Link></li>
                <li><Link href="#" className="hover:text-foreground">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Jiwaku. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
