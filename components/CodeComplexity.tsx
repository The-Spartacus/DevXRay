'use client';

import React, { useMemo } from 'react';
import { 
  BarChart2, 
  FileText, 
  Folder, 
  Zap,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface CodeComplexityProps {
  tree: any[];
}

interface ExtensionData {
  name: string;
  count: number;
}

interface ChartDataPoint {
  name: string;
  count: number;
}

export default function CodeComplexity({ tree }: CodeComplexityProps) {
  const complexityData = useMemo<{ chartData: ChartDataPoint[], topExtensions: ExtensionData[] }>(() => {
    // Mock complexity based on file depth and extensions
    const fileTypes: Record<string, number> = {};
    const depthData: Record<number, number> = {};
    
    tree.forEach(item => {
      const depth = item.path.split('/').length;
      depthData[depth] = (depthData[depth] || 0) + 1;

      if (item.type === 'blob') {
        const ext = item.path.split('.').pop() || 'other';
        fileTypes[ext] = (fileTypes[ext] || 0) + 1;
      }
    });

    const chartData: ChartDataPoint[] = Object.entries(depthData).map(([depth, count]) => ({
      name: `Level ${depth}`,
      count: count as number
    }));

    const topExtensions: ExtensionData[] = Object.entries(fileTypes)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 5)
      .map(([ext, count]) => ({ name: ext, count: count as number }));

    return { chartData, topExtensions };
  }, [tree]);

  const complexFiles = useMemo(() => {
    // Mock complex files (usually those with deep paths or specific names)
    return tree
      .filter(f => f.type === 'blob')
      .sort((a, b) => b.path.length - a.path.length)
      .slice(0, 5)
      .map((f, i) => ({
        path: f.path,
        score: 60 + (f.path.length % 35) + (i * 2) // Deterministic mock score
      }));
  }, [tree]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <BarChart2 className="w-5 h-5 text-emerald-400" />
        Code Complexity & Structure
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Directory Depth Distribution</h3>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complexityData.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#71717a" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#71717a" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Potential Complexity Hotspots</h3>
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="space-y-4">
            {complexFiles.map((file, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center text-xs font-bold text-zinc-500">
                  {file.score}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono text-zinc-300 truncate">{file.path}</div>
                  <div className="h-1 w-full bg-zinc-800 rounded-full mt-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${file.score > 80 ? 'bg-red-500' : 'bg-yellow-500'}`}
                      style={{ width: `${file.score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {complexityData.topExtensions.map((ext, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-sm font-mono text-zinc-300">.{ext.name}</span>
            </div>
            <span className="text-xs font-bold text-zinc-500">{ext.count} files</span>
          </div>
        ))}
      </div>
    </div>
  );
}
