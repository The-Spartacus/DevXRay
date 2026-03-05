'use client';

import React from 'react';
import { 
  Box, 
  Package, 
  Layers, 
  ArrowRight 
} from 'lucide-react';

interface DependencyChartProps {
  tree: any[];
}

export default function DependencyChart({ tree }: DependencyChartProps) {
  // In a real app, we'd fetch package.json and parse it.
  // For this demo, we'll show a placeholder UI.
  
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Dependency Analysis</h3>
        <Package className="w-4 h-4 text-zinc-500" />
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Layers className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-zinc-200">Core Dependencies</div>
              <div className="text-xs text-zinc-500">Extracted from package.json</div>
            </div>
          </div>
          <div className="text-xl font-bold text-zinc-100">12</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'react', version: '^18.2.0', status: 'up-to-date' },
            { name: 'next', version: '^14.1.0', status: 'update-available' },
            { name: 'tailwindcss', version: '^3.4.1', status: 'up-to-date' },
            { name: 'framer-motion', version: '^11.0.3', status: 'up-to-date' },
          ].map((dep, i) => (
            <div key={i} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Box className="w-3 h-3 text-zinc-500" />
                <span className="text-xs font-mono text-zinc-300">{dep.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-500">{dep.version}</span>
                <div className={`w-1.5 h-1.5 rounded-full ${dep.status === 'up-to-date' ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
