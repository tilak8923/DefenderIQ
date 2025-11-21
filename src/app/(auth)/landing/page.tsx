'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { BarChart, Bot, Shield, ShieldCheck, Terminal, Zap, Cpu, Network } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: ShieldCheck,
    title: 'Real-time Monitoring',
    description: 'Keep a constant eye on your systems with a live-updating dashboard and instant alerts.',
  },
  {
    icon: BarChart,
    title: 'Advanced Analytics',
    description: 'Leverage AI to analyze logs, detect threats, and generate comprehensive security reports.',
  },
  {
    icon: Terminal,
    title: 'Integrated Terminal',
    description: 'Run commands and interact with your security environment directly within the application.',
  },
  {
    icon: Bot,
    title: 'AI-Powered Assistance',
    description: 'Get help with threat analysis, report generation, and command-line operations from an intelligent assistant.',
  },
];

const steps = [
    {
        icon: Zap,
        title: "Connect Your Data",
        description: "Integrate seamlessly with your existing infrastructure, log sources, and cloud services."
    },
    {
        icon: Cpu,
        title: "AI Engine Analyzes",
        description: "Our intelligent engine correlates events, identifies patterns, and surfaces potential threats in real-time."
    },
    {
        icon: Network,
        title: "Gain Actionable Insights",
        description: "Receive prioritized alerts and detailed reports, enabling you to respond to threats faster and more effectively."
    }
]

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
           animation: fadeInUp 0.6s ease-out forwards;
           opacity: 0;
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex items-center">
            <Shield className="h-6 w-6 text-primary mr-2" />
            <span className="font-bold text-lg">TSIEM</span>
          </div>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">About</Link>
            <Link href="/docs" className="text-muted-foreground transition-colors hover:text-foreground">Docs</Link>
            <Link href="#" className="text-muted-foreground transition-colors hover:text-foreground">Support</Link>
          </nav>
          <div className="flex flex-1 items-center justify-end">
            <Button asChild>
                <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 text-center">
            <div className="container">
                <h1 
                    className="text-4xl md:text-6xl font-bold tracking-tighter"
                >
                    Unified Security. AI-Powered Clarity.
                </h1>
                <p 
                    className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground animate-fadeInUp"
                    style={{ animationDelay: '0.2s' }}
                >
                   TSIEM is the next-generation Security Information & Event Management platform that brings all your security data into a single, intelligent view.
                </p>
                <div 
                    className="mt-8 animate-fadeInUp"
                    style={{ animationDelay: '0.4s' }}
                >
                    <Button size="lg" asChild>
                         <Link href="/login">Explore the Dashboard</Link>
                    </Button>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted">
            <div className="container">
                 <h2 className="text-3xl font-bold text-center mb-12">Everything You Need to Stay Secure</h2>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature, index) => (
                    <div 
                        key={index}
                        className="animate-fadeInUp"
                        style={{ animationDelay: `${0.2 + index * 0.1}s` } as React.CSSProperties}
                    >
                        <Card className="text-center h-full">
                        <CardHeader>
                            <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full mb-4 w-fit">
                                <feature.icon className="h-7 w-7" />
                            </div>
                            <CardTitle>{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </CardContent>
                        </Card>
                    </div>
                    ))}
                </div>
            </div>
        </section>

        {/* How it works */}
        <section className="py-20">
            <div className="container">
                <h2 className="text-3xl font-bold text-center mb-12">Simple, Powerful, Effective</h2>
                <div className="relative flex flex-col md:flex-row justify-between items-center gap-8">
                     {/* Dashed line for desktop */}
                     <div className="absolute top-1/2 left-0 w-full h-px bg-border border-dashed border-t-2 hidden md:block"></div>

                    {steps.map((step, index) => (
                        <div key={index} className="flex-1 text-center animate-fadeInUp z-10" style={{ animationDelay: `${0.8 + index * 0.2}s` } as React.CSSProperties}>
                            <div className="mx-auto bg-background p-2 border-2 border-primary rounded-full w-fit mb-4">
                                <div className="bg-primary text-primary-foreground p-3 rounded-full">
                                    <step.icon className="h-8 w-8" />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 text-center bg-muted">
             <div className="container">
                <h2 className="text-3xl font-bold">Ready to Secure Your Systems?</h2>
                <p className="text-muted-foreground mt-2 mb-6">Create an account and start exploring the future of security analytics today.</p>
                <Button size="lg" asChild>
                    <Link href="/signup">Sign Up for Free</Link>
                </Button>
             </div>
        </section>
      </main>

       <footer className="py-6 border-t">
        <div className="container flex items-center justify-between">
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} TSIEM. All rights reserved.</p>
            <p className="text-sm text-muted-foreground">Secure. Intelligent. Aware.</p>
        </div>
       </footer>
    </div>
  );
}
