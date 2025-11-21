
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, BarChart, Terminal, ShieldCheck, Instagram, Linkedin, Github, Twitter, Globe } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">
    {children}
  </a>
);

export default function LandingPage() {
  const [platformOpen, setPlatformOpen] = useState(false);
  const [solutionOpen, setSolutionOpen] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col min-h-screen text-white font-body bg-[#141413]">
      <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto h-16 flex items-center justify-between px-4 md:px-6">
          <Link href="/landing" className="flex items-center gap-2">
            {mounted && (
              <Image 
                src={theme === 'dark' ? '/logo.png' : '/logo2.png'} 
                alt="DefendIQ Logo" 
                width={45} 
                height={45} 
              />
            )}
            <span className="font-bold text-lg tracking-wider">DefendIQ</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <NavLink href="#features">Features</NavLink>
            <DropdownMenu open={platformOpen} onOpenChange={setPlatformOpen}>
              <DropdownMenuTrigger
                onMouseEnter={() => setPlatformOpen(true)}
                onMouseLeave={() => setPlatformOpen(false)}
                className="flex items-center gap-1 text-sm font-medium text-neutral-300 hover:text-white transition-colors outline-none"
              >
                Platform <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                onMouseEnter={() => setPlatformOpen(true)}
                onMouseLeave={() => setPlatformOpen(false)}
                className="bg-neutral-900 border-neutral-800 text-white data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2"
              >
                <DropdownMenuItem asChild className="cursor-pointer">
                  <a href="#overview">Overview</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/docs">Developer Docs</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu open={solutionOpen} onOpenChange={setSolutionOpen}>
              <DropdownMenuTrigger
                onMouseEnter={() => setSolutionOpen(true)}
                onMouseLeave={() => setSolutionOpen(false)}
                className="flex items-center gap-1 text-sm font-medium text-neutral-300 hover:text-white transition-colors outline-none"
              >
                Solution <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                onMouseEnter={() => setSolutionOpen(true)}
                onMouseLeave={() => setSolutionOpen(false)}
                className="bg-neutral-900 border-neutral-800 text-white data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2"
              >
                <DropdownMenuItem asChild className="cursor-pointer">
                  <a href="#features">Features</a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
          <Button asChild variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-black">
            <Link href="/login">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 md:px-6 py-20 md:py-32 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
            Unified Security. AI-Powered Clarity.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-300">
            The next-generation Security Information & Event Management platform that brings all your security data into a single, intelligent view.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button size="lg" asChild className="bg-white text-black hover:bg-neutral-200">
              <Link href="/signup">Request a Demo</Link>
            </Button>
            <Button size="lg" asChild variant="outline" className="bg-transparent border-neutral-700 text-white hover:bg-neutral-900">
              <a href="#features">Explore Features</a>
            </Button>
          </div>
        </section>

        {/* Platform Overview Section */}
        <section id="overview" className="py-20 md:py-28">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold">Platform Overview</h2>
                <p className="mt-4 text-neutral-300">
                  Our architecture is designed for scalability and speed, integrating seamlessly with your existing infrastructure. We combine the core functions of SIEM and SOAR into a single, powerful engine.
                </p>
                <ul className="mt-6 space-y-2">
                  <li className="flex items-start gap-3 p-4 rounded-lg hover:bg-neutral-900 transition-colors">
                    <ShieldCheck className="h-6 w-6 mt-1 text-white flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">Detection & Response</h3>
                      <p className="text-sm text-neutral-400">
                        Leverage rule-based correlation and AI-powered anomaly detection to identify threats, then automate responses with customizable playbooks.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 p-4 rounded-lg hover:bg-neutral-900 transition-colors">
                    <BarChart className="h-6 w-6 mt-1 text-white flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">Data Normalization</h3>
                      <p className="text-sm text-neutral-400">
                        Ingest and standardize logs from any source into a common schema, ensuring data is clean, correlated, and ready for analysis.
                      </p>
                    </div>
                  </li>
                </ul>
                <Button asChild variant="link" className="text-white pl-0 mt-4">
                  <Link href="/docs">View Developer Docs &rarr;</Link>
                </Button>
              </div>
              <div className="bg-neutral-900 p-8 rounded-lg">
                <pre className="text-sm text-neutral-400">
                  <code>
{`// Example: Automated Threat Response
const alert = await siem.on('HighSeverityAlert');

if (alert.matches(PhishingAttempt)) {
    const playbook = soar.getPlaybook('PhishingResponse');
    await playbook.run({
        user: alert.user,
        sourceIp: alert.source.ip
    });
    logger.info('Phishing attempt contained.');
}`}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Solution/Features Section */}
        <section id="features" className="py-20 md:py-28">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold">A Complete Security Solution</h2>
            <p className="mx-auto mt-4 max-w-2xl text-neutral-300">
              From log collection to incident response, DefendIQ provides the tools you need to secure your organization.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="p-8 border border-neutral-800 rounded-lg bg-neutral-900 hover:bg-neutral-800 hover:border-neutral-700 transition-all">
                <BarChart className="h-8 w-8 mx-auto text-white" />
                <h3 className="mt-4 text-lg font-semibold">Real-time Dashboard</h3>
                <p className="mt-2 text-sm text-neutral-400">
                  Visualize your security posture at a glance with customizable widgets for alerts, threats, and system status.
                </p>
              </div>
              <div className="p-8 border border-neutral-800 rounded-lg bg-neutral-900 hover:bg-neutral-800 hover:border-neutral-700 transition-all">
                <Terminal className="h-8 w-8 mx-auto text-white" />
                <h3 className="mt-4 text-lg font-semibold">Advanced Log Analysis</h3>
                <p className="mt-2 text-sm text-neutral-400">
                  Search, filter, and analyze billions of log events in seconds. Use our AI to parse and structure any log format.
                </p>
              </div>
              <div className="p-8 border border-neutral-800 rounded-lg bg-neutral-900 hover:bg-neutral-800 hover:border-neutral-700 transition-all">
                <ShieldCheck className="h-8 w-8 mx-auto text-white" />
                <h3 className="mt-4 text-lg font-semibold">Automated Response</h3>
                <p className="mt-2 text-sm text-neutral-400">
                  Build powerful automation playbooks to handle incidents, enrich data, and contain threats without manual intervention.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-800 mt-20" id="about">
        <div className="container mx-auto py-12 px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                {/* Logo and Socials */}
                <div className="col-span-2 md:col-span-1">
                    <Link href="/landing" className="flex items-center gap-2 mb-4">
                        {mounted && (
                          <Image 
                            src={theme === 'dark' ? '/logo.png' : '/logo2.png'} 
                            alt="DefendIQ Logo" 
                            width={45} 
                            height={45} 
                          />
                        )}
                        <span className="font-bold text-lg tracking-wider">DefendIQ</span>
                    </Link>
                    <div className="flex space-x-4 mt-4">
                        <a href="https://tilakfolio.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white"><Globe size={20} /></a>
                        <a href="https://www.instagram.com/_impetuous_illusionist_90/" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white"><Instagram size={20} /></a>
                        <a href="https://www.linkedin.com/in/tilak-tiwari-33b84825a/" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white"><Linkedin size={20} /></a>
                        <a href="https://github.com/tilak8923" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white"><Github size={20} /></a>
                        <a href="https://x.com/tilaktiwari_" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white"><Twitter size={20} /></a>
                    </div>
                </div>

                {/* Product Links */}
                <div>
                    <h4 className="font-semibold mb-3">Product</h4>
                    <ul className="space-y-2">
                        <li><a href="#" className="text-sm text-neutral-400 hover:text-white">Features</a></li>
                        <li><a href="#" className="text-sm text-neutral-400 hover:text-white">Security</a></li>
                        <li><a href="#" className="text-sm text-neutral-400 hover:text-white">Enterprise</a></li>
                        <li><a href="#" className="text-sm text-neutral-400 hover:text-white">Pricing</a></li>
                    </ul>
                </div>

                {/* Company Links */}
                 <div>
                    <h4 className="font-semibold mb-3">Company</h4>
                    <ul className="space-y-2">
                        <li><a href="#" className="text-sm text-neutral-400 hover:text-white">About us</a></li>
                        <li><a href="#" className="text-sm text-neutral-400 hover:text-white">Careers</a></li>
                        <li><a href="#" className="text-sm text-neutral-400 hover:text-white">Contact</a></li>
                        <li><a href="#" className="text-sm text-neutral-400 hover:text-white">Blog</a></li>
                    </ul>
                </div>
                
                {/* Legal Links */}
                <div className="col-span-2">
                    <h4 className="font-semibold mb-3">Terms and policies</h4>
                    <ul className="space-y-2 text-sm text-neutral-400 columns-2">
                        <li><a href="#" className="hover:text-white">Privacy choices</a></li>
                        <li><a href="#" className="hover:text-white">Privacy policy</a></li>
                        <li><a href="#" className="hover:text-white">Responsible disclosure policy</a></li>
                        <li><a href="#" className="hover:text-white">Terms of service: Commercial</a></li>
                        <li><a href="#" className="hover:text-white">Terms of service: Consumer</a></li>
                        <li><a href="#" className="hover:text-white">Usage policy</a></li>
                    </ul>
                </div>
            </div>
            <div className="mt-12 pt-8 border-t border-neutral-800 text-center text-sm text-neutral-400">
                &copy; {new Date().getFullYear()} DefendIQ. All rights reserved.
            </div>
        </div>
      </footer>
    </div>
  );
}

    