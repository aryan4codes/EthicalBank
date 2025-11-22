'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Shield, TrendingUp, Users, Lock, Globe, Brain, Activity, Zap } from 'lucide-react'
import { useTheme } from 'next-themes'

export default function CorporateLandingPage() {
  const { setTheme } = useTheme()

  useEffect(() => {
    setTheme('light')
  }, [setTheme])

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-500/30">
      
      {/* Glassmorphic Navbar */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-sm px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-600/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">EthicalBank</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            {/* <Link href="#solutions" className="hover:text-blue-600 transition-colors">Solutions</Link>
            <Link href="#enterprise" className="hover:text-blue-600 transition-colors">Enterprise</Link>
            <Link href="#resources" className="hover:text-blue-600 transition-colors">Resources</Link> */}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-slate-700 hover:bg-white/50 font-medium">Login</Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-600/20 transition-all font-medium px-6">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Enterprise Grade Security</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 leading-tight mb-6">
              The Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Corporate Finance
              </span>
            </h1>
            
            <p className="text-lg text-slate-600 mb-10 max-w-xl leading-relaxed">
              Experience banking with radical transparency. Our AI-driven platform provides explainable insights, ensuring every financial decision is ethical, secure, and optimized for growth.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="h-14 px-8 bg-white text-blue-600 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all border border-slate-200 hover:bg-slate-50">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Glassmorphic Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
            <div className="relative bg-white/80 backdrop-blur-md border border-white/60 p-8 rounded-3xl shadow-xl shadow-slate-200/50">
              {/* Mock UI Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                </div>
                <div className="h-2 w-20 bg-slate-100 rounded-full" />
              </div>
              
              {/* Mock UI Content */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl mb-4 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">$2.4M</div>
                  <div className="text-sm text-slate-500 font-medium">Total Revenue</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl mb-4 flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">8.5k</div>
                  <div className="text-sm text-slate-500 font-medium">Active Users</div>
                </div>
              </div>

              <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-semibold text-slate-900">Recent Transactions</span>
                  <span className="text-xs font-medium text-blue-600 cursor-pointer hover:text-blue-700">View All</span>
                </div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between py-4 border-b border-slate-200/50 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white border border-slate-100 shadow-sm" />
                      <div className="h-2.5 w-32 bg-slate-200 rounded-full" />
                    </div>
                    <div className="h-2.5 w-16 bg-slate-200 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Neomorphic Features Section */}
      <section className="py-24 px-6 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Enterprise Solutions</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              Built for scale, designed for trust. Our platform combines traditional banking reliability with next-generation AI transparency.
            </p>
          </div>

          <div className="flex flex-col gap-8">
            {/* Row 1 */}
            <div className="flex flex-col md:flex-row gap-8">
              {/* Feature 1: AI Explainability */}
              <div className="flex-[2] p-10 rounded-3xl bg-[#f8fafc] shadow-[20px_20px_60px_#d1d5db,-20px_-20px_60px_#ffffff] border border-white/50">
                <div className="flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-[#f8fafc] shadow-[inset_5px_5px_10px_#d1d5db,inset_-5px_-5px_10px_#ffffff] flex items-center justify-center">
                      <Brain className="w-8 h-8 text-blue-600" />
                    </div>
                    <Activity className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">&quot;Why was I denied?&quot;</h3>
                    <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                      No more vague rejection letters. Our AI breaks down every decision into plain English, showing you exactly which factors influenced the outcome.
                    </p>
                    <div className="flex gap-3 flex-wrap">
                      {['Credit Score', 'Debt Ratio', 'Savings'].map((tag) => (
                        <span key={tag} className="px-5 py-2.5 rounded-xl bg-[#f8fafc] text-sm font-medium text-slate-600 shadow-[5px_5px_10px_#d1d5db,-5px_-5px_10px_#ffffff]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 2: Privacy Control */}
              <div className="flex-1 p-10 rounded-3xl bg-[#f8fafc] shadow-[20px_20px_60px_#d1d5db,-20px_-20px_60px_#ffffff] border border-white/50">
                <div className="flex flex-col h-full">
                  <div className="w-16 h-16 rounded-2xl bg-[#f8fafc] shadow-[inset_5px_5px_10px_#d1d5db,inset_-5px_-5px_10px_#ffffff] flex items-center justify-center mb-8">
                    <Lock className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Granular Consent</h3>
                  <p className="text-slate-600 mb-8 leading-relaxed">
                    Toggle data access for specific AI features. You own your data.
                  </p>
                  <div className="mt-auto space-y-5">
                    {[65, 85, 45].map((width, i) => (
                      <div key={i} className="h-3 bg-[#f8fafc] rounded-full overflow-hidden shadow-[inset_2px_2px_5px_#d1d5db,inset_-2px_-2px_5px_#ffffff]">
                        <motion.div 
                          className="h-full bg-indigo-500 rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${width}%` }}
                          transition={{ duration: 1, delay: i * 0.2 }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="flex flex-col md:flex-row gap-8">
              {/* Feature 3: Real-time Insights */}
              <div className="flex-1 p-10 rounded-3xl bg-[#f8fafc] shadow-[20px_20px_60px_#d1d5db,-20px_-20px_60px_#ffffff] border border-white/50">
                <div className="flex flex-col h-full">
                  <div className="w-16 h-16 rounded-2xl bg-[#f8fafc] shadow-[inset_5px_5px_10px_#d1d5db,inset_-5px_-5px_10px_#ffffff] flex items-center justify-center mb-8">
                    <Zap className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Insights</h3>
                  <p className="text-slate-600 mb-8 leading-relaxed">
                    Predictive analytics that actually help you save.
                  </p>
                  <div className="mt-auto grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-[#f8fafc] shadow-[inset_5px_5px_10px_#d1d5db,inset_-5px_-5px_10px_#ffffff] text-center">
                      <div className="text-xl font-bold text-emerald-600">+12%</div>
                      <div className="text-xs text-slate-500 font-medium mt-1">Savings</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#f8fafc] shadow-[inset_5px_5px_10px_#d1d5db,inset_-5px_-5px_10px_#ffffff] text-center">
                      <div className="text-xl font-bold text-blue-600">-5%</div>
                      <div className="text-xs text-slate-500 font-medium mt-1">Fees</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 4: Global Vision */}
              <div className="flex-[2] p-10 rounded-3xl bg-[#f8fafc] shadow-[20px_20px_60px_#d1d5db,-20px_-20px_60px_#ffffff] border border-white/50">
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-[#f8fafc] shadow-[inset_5px_5px_10px_#d1d5db,inset_-5px_-5px_10px_#ffffff] flex items-center justify-center">
                      <Globe className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-10 items-end">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-slate-900 mb-4">Ethical by Design</h3>
                      <p className="text-slate-600 text-lg leading-relaxed">
                        We audit our models for bias daily. Fair lending isn&apos;t just a compliance requirement, it&apos;s our core architecture.
                      </p>
                    </div>
                    <div className="flex-1 w-full p-8 rounded-2xl bg-[#f8fafc] shadow-[inset_5px_5px_10px_#d1d5db,inset_-5px_-5px_10px_#ffffff]">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-slate-600">Bias Check</span>
                        <span className="text-emerald-600 text-sm font-bold">Passed</span>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between text-xs font-medium text-slate-500">
                          <span>Demographic Parity</span>
                          <span>99.8%</span>
                        </div>
                        <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                          <div className="h-full w-[99.8%] bg-emerald-500 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Glassmorphic CTA */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] opacity-5 blur-3xl" />
          <div className="relative bg-white/60 backdrop-blur-md border border-white/60 rounded-[2.5rem] p-12 md:p-24 text-center shadow-2xl shadow-slate-200/50">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Ready to modernize your financial stack?</h2>
            <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Join over 500+ enterprise clients who trust EthicalBank for transparent, secure, and intelligent banking.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="h-16 px-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-600/20 text-lg font-semibold transition-all hover:scale-105">
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#f8fafc] border-t border-slate-200 pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 opacity-80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
              <Shield className="w-5 h-5 text-slate-900" />
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">EthicalBank</span>
          </div>
          <div className="text-sm font-medium text-slate-500">
            © 2025 EthicalBank Enterprise. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}


