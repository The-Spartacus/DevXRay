'use client';

import React, { useMemo } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Key, 
  AlertCircle,
  FileWarning
} from 'lucide-react';

interface SecurityPanelProps {
  owner: string;
  repo: string;
  tree: any[];
}

export default function SecurityPanel({ owner, repo, tree }: SecurityPanelProps) {
  // Mock security analysis based on file patterns
  const findings = useMemo(() => {
    const results = [];
    
    // Check for sensitive files
    const sensitivePatterns = [
      { pattern: /\.env$/, label: 'Environment File', severity: 'high', desc: 'Potential exposed secrets if committed.' },
      { pattern: /id_rsa$/, label: 'SSH Private Key', severity: 'critical', desc: 'Private keys should never be in a repository.' },
      { pattern: /credentials\.json$/, label: 'Cloud Credentials', severity: 'high', desc: 'Likely contains sensitive API credentials.' },
      { pattern: /config\.local\.js$/, label: 'Local Config', severity: 'medium', desc: 'May contain local secrets.' },
    ];

    tree.forEach(file => {
      sensitivePatterns.forEach(p => {
        if (p.pattern.test(file.path)) {
          results.push({ ...p, path: file.path });
        }
      });
    });

    // Check for outdated/vulnerable config files
    if (tree.some(f => f.path === 'package-lock.json')) {
      results.push({
        label: 'Dependency Lockfile',
        severity: 'info',
        desc: 'Repository uses a lockfile, which is good for security and stability.',
        path: 'package-lock.json'
      });
    }

    return results;
  }, [tree]);

  const severityColors: any = {
    critical: 'text-red-500 bg-red-500/10 border-red-500/20',
    high: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    medium: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    info: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-emerald-400" />
          Security Analysis
        </h2>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
          <ShieldCheck className="w-3 h-3" />
          Static Scan Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Critical', count: findings.filter(f => f.severity === 'critical').length, color: 'text-red-500' },
          { label: 'High', count: findings.filter(f => f.severity === 'high').length, color: 'text-orange-500' },
          { label: 'Medium', count: findings.filter(f => f.severity === 'medium').length, color: 'text-yellow-500' },
          { label: 'Info', count: findings.filter(f => f.severity === 'info').length, color: 'text-blue-500' },
        ].map(stat => (
          <div key={stat.label} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-center">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">{stat.label} Risks</div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
          <h3 className="text-sm font-medium">Security Findings</h3>
          <span className="text-xs text-zinc-500">{findings.length} issues detected</span>
        </div>
        <div className="divide-y divide-zinc-800">
          {findings.length > 0 ? (
            findings.map((finding, i) => (
              <div key={i} className="p-4 flex items-start gap-4 hover:bg-zinc-800/50 transition-colors">
                <div className={`mt-1 p-2 rounded-lg ${severityColors[finding.severity]}`}>
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-zinc-200">{finding.label}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-bold ${severityColors[finding.severity]}`}>
                      {finding.severity}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">{finding.desc}</p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <FileWarning className="w-3 h-3 text-zinc-600" />
                    <code className="text-[10px] text-zinc-500 font-mono">{finding.path}</code>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-zinc-200">No major risks detected</h4>
                <p className="text-sm text-zinc-500">Static analysis didn&apos;t find any common security pitfalls.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
