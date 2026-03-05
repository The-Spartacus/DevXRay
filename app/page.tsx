'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Github, Zap, Shield, BarChart3, Box, Cpu, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    // Basic validation for github url
    if (!url.includes('github.com')) {
      alert('Please enter a valid GitHub repository URL');
      return;
    }

    setIsLoading(true);
    // Extract owner/repo
    const parts = url.replace('https://github.com/', '').split('/');
    if (parts.length >= 2) {
      const owner = parts[0];
      const repo = parts[1].split('?')[0].split('#')[0];
      router.push(`/dashboard?owner=${owner}&repo=${repo}`);
    } else {
      setIsLoading(false);
      alert('Could not parse repository URL');
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-4xl w-full space-y-12 relative z-10">
        <div className="text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-xs font-medium text-zinc-400"
          >
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>AI-Powered Repository Intelligence</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-6xl md:text-8xl font-display font-bold tracking-tight"
          >
            Dev<span className="text-emerald-400">XRay</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Instantly understand complex codebases. Visualize architecture, detect security risks, and get AI-generated insights for any GitHub repository.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <form onSubmit={handleSubmit} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-2 shadow-2xl">
              <div className="pl-4 pr-2">
                <Github className="w-5 h-5 text-zinc-500" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/facebook/react"
                className="flex-1 bg-transparent border-none focus:ring-0 text-zinc-100 placeholder:text-zinc-600 py-3 text-lg"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-6 py-3 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Analyze
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
          <p className="mt-4 text-center text-zinc-500 text-sm">
            Try: <button onClick={() => setUrl('https://github.com/vercel/next.js')} className="text-zinc-400 hover:text-emerald-400 underline underline-offset-4">next.js</button>, <button onClick={() => setUrl('https://github.com/mrdoob/three.js')} className="text-zinc-400 hover:text-emerald-400 underline underline-offset-4">three.js</button>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12"
        >
          {[
            { icon: Cpu, label: 'Architecture', desc: 'Visual dependency graphs' },
            { icon: Shield, label: 'Security', desc: 'Vulnerability detection' },
            { icon: BarChart3, label: 'Complexity', desc: 'Code quality metrics' },
            { icon: Box, label: 'AI Insights', desc: 'Natural language summaries' },
          ].map((feature, i) => (
            <div key={i} className="space-y-2 text-center">
              <div className="mx-auto w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-medium text-zinc-200">{feature.label}</h3>
              <p className="text-xs text-zinc-500">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
