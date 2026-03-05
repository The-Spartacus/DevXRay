'use client';

import React, { useState, useEffect } from 'react';
import { 
  History, 
  GitCommit, 
  Users, 
  Calendar,
  Loader2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface RepoActivityProps {
  owner: string;
  repo: string;
}

export default function RepoActivity({ owner, repo }: RepoActivityProps) {
  const [commits, setCommits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommits = async () => {
      try {
        const headers: any = {};
        if (process.env.NEXT_PUBLIC_GITHUB_TOKEN) {
          headers['Authorization'] = `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`;
        }
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=30`, { headers });
        const json = await res.json();
        
        // Group by date
        const grouped = json.reduce((acc: any, commit: any) => {
          const date = new Date(commit.commit.author.date).toLocaleDateString();
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});

        const chartData = Object.entries(grouped).map(([date, count]) => ({
          date,
          count
        })).reverse();

        setCommits(chartData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommits();
  }, [owner, repo]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Recent Activity</h3>
        <History className="w-4 h-4 text-zinc-500" />
      </div>

      {loading ? (
        <div className="h-[150px] flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-zinc-700 animate-spin" />
        </div>
      ) : (
        <div className="h-[150px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={commits}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                itemStyle={{ color: '#10b981' }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorCount)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <GitCommit className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 uppercase">Commits</div>
            <div className="text-sm font-bold text-zinc-200">30+</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 uppercase">Active</div>
            <div className="text-sm font-bold text-zinc-200">Recent</div>
          </div>
        </div>
      </div>
    </div>
  );
}
