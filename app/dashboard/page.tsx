'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Network, 
  ShieldAlert, 
  BarChart2, 
  FileCode, 
  MessageSquare, 
  ChevronLeft,
  Github,
  Star,
  GitFork,
  Eye,
  ExternalLink,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import ArchitectureGraph from '@/components/ArchitectureGraph';
import AIExplanation from '@/components/AIExplanation';
import DependencyChart from '@/components/DependencyChart';
import SecurityPanel from '@/components/SecurityPanel';
import CodeComplexity from '@/components/CodeComplexity';
import RepoActivity from '@/components/RepoActivity';
import CodeGalaxy from '@/components/CodeGalaxy';

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const owner = searchParams.get('owner');
  const repo = searchParams.get('repo');

  const [repoData, setRepoData] = useState<any>(null);
  const [languages, setLanguages] = useState<any>(null);
  const [tree, setTree] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!owner || !repo) {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers: any = {};
        if (process.env.NEXT_PUBLIC_GITHUB_TOKEN) {
          headers['Authorization'] = `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`;
        }

        // Fetch basic repo info
        const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
        if (!repoRes.ok) throw new Error('Repository not found');
        const repoJson = await repoRes.json();
        setRepoData(repoJson);

        // Fetch languages
        const langRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers });
        const langJson = await langRes.json();
        setLanguages(langJson);

        // Fetch file tree (recursive)
        const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${repoJson.default_branch}?recursive=1`, { headers });
        const treeJson = await treeRes.json();
        setTree(treeJson.tree);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [owner, repo, router]);

  if (!owner || !repo) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <p className="text-zinc-400 font-medium animate-pulse">Scanning repository structure...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Analysis Failed</h2>
          <p className="text-zinc-400">{error}</p>
        </div>
        <button 
          onClick={() => router.push('/')}
          className="px-6 py-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'architecture', label: 'Architecture', icon: Network },
    { id: 'ai', label: 'AI Insights', icon: MessageSquare },
    { id: 'security', label: 'Security', icon: ShieldAlert },
    { id: 'complexity', label: 'Complexity', icon: BarChart2 },
    { id: 'galaxy', label: 'Galaxy', icon: Activity },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-16 border-bottom border-zinc-800 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/')}
            className="p-2 hover:bg-zinc-900 rounded-lg transition-colors text-zinc-400"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Github className="w-5 h-5" />
            <h1 className="font-semibold text-lg">
              {owner} / <span className="text-emerald-400">{repo}</span>
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-4 ml-8 text-xs text-zinc-500">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3" /> {repoData.stargazers_count.toLocaleString()}
            </div>
            <div className="flex items-center gap-1">
              <GitFork className="w-3 h-3" /> {repoData.forks_count.toLocaleString()}
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> {repoData.subscribers_count.toLocaleString()}
            </div>
          </div>
        </div>
        <a 
          href={repoData.html_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          View on GitHub <ExternalLink className="w-3 h-3" />
        </a>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-right border-zinc-800 bg-zinc-950 hidden lg:flex flex-col p-4 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-zinc-950 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto space-y-6"
            >
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <FileCode className="w-5 h-5 text-emerald-400" />
                        Repository Summary
                      </h2>
                      <p className="text-zinc-400 leading-relaxed">
                        {repoData.description || "No description provided."}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {repoData.topics?.map((topic: string) => (
                          <span key={topic} className="px-3 py-1 rounded-full bg-zinc-800 text-xs text-zinc-300 border border-zinc-700">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                        <h3 className="text-sm font-medium text-zinc-500 mb-4 uppercase tracking-wider">Languages</h3>
                        <div className="space-y-4">
                          {Object.entries(languages || {}).map(([lang, bytes]: [any, any]) => {
                            const total = Object.values(languages).reduce((a: any, b: any) => a + b, 0) as number;
                            const percent = ((bytes / total) * 100).toFixed(1);
                            return (
                              <div key={lang} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-zinc-300">{lang}</span>
                                  <span className="text-zinc-500">{percent}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-emerald-500 rounded-full" 
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                        <h3 className="text-sm font-medium text-zinc-500 mb-4 uppercase tracking-wider">File Stats</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                            <div className="text-2xl font-bold text-zinc-100">{tree?.length || 0}</div>
                            <div className="text-[10px] text-zinc-500 uppercase">Total Files</div>
                          </div>
                          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                            <div className="text-2xl font-bold text-zinc-100">
                              {tree?.filter((f: any) => f.type === 'tree').length || 0}
                            </div>
                            <div className="text-[10px] text-zinc-500 uppercase">Directories</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <RepoActivity owner={owner} repo={repo} />
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
                      <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Quick Health</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                          <div className="flex items-center gap-2 text-sm text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                            License
                          </div>
                          <span className="text-xs font-mono text-zinc-400">{repoData.license?.spdx_id || 'None'}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                          <div className="flex items-center gap-2 text-sm text-blue-400">
                            <Activity className="w-4 h-4" />
                            Open Issues
                          </div>
                          <span className="text-xs font-mono text-zinc-400">{repoData.open_issues_count}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'architecture' && (
                <div className="h-[calc(100vh-12rem)] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden relative">
                   <ArchitectureGraph tree={tree} />
                </div>
              )}

              {activeTab === 'ai' && (
                <AIExplanation owner={owner} repo={repo} tree={tree} />
              )}

              {activeTab === 'security' && (
                <SecurityPanel owner={owner} repo={repo} tree={tree} />
              )}

              {activeTab === 'complexity' && (
                <CodeComplexity tree={tree} />
              )}

              {activeTab === 'galaxy' && (
                <div className="h-[calc(100vh-12rem)] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden relative">
                  <CodeGalaxy tree={tree} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <p className="text-zinc-400 font-medium animate-pulse">Loading dashboard...</p>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
