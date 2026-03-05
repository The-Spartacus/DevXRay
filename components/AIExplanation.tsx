'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';

interface AIExplanationProps {
  owner: string;
  repo: string;
  tree: any[];
}

export default function AIExplanation({ owner, repo, tree }: AIExplanationProps) {
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const generateExplanation = useCallback(async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      
      // Prepare a summary of the file tree to give context
      const fileSummary = tree
        .filter(f => f.type === 'blob')
        .slice(0, 100) // Limit to first 100 files for context
        .map(f => f.path)
        .join('\n');

      const prompt = `
        Analyze this GitHub repository: ${owner}/${repo}.
        Here is a partial list of files in the repository:
        ${fileSummary}

        Please provide a comprehensive explanation of this repository.
        Include:
        1. **Overview**: What is this project about?
        2. **Architecture**: What is the tech stack and how is the code organized?
        3. **Key Components**: What are the most important directories and files?
        4. **Getting Started**: Briefly, how would a developer start working on this?
        
        Format the output in clean Markdown.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setExplanation(response.text || 'Could not generate explanation.');
    } catch (error) {
      console.error('AI Error:', error);
      setExplanation('Error generating AI explanation. Please check your API key configuration.');
    } finally {
      setLoading(false);
    }
  }, [owner, repo, tree]);

  useEffect(() => {
    generateExplanation();
  }, [generateExplanation]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          AI Repository Intelligence
        </h2>
        <button 
          onClick={generateExplanation}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 hover:text-zinc-100 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Regenerate
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 min-h-[400px] relative overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-zinc-900/50 backdrop-blur-sm z-10">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <p className="text-sm text-zinc-400">Gemini is analyzing the codebase...</p>
          </div>
        ) : null}
        
        <div className="markdown-body prose prose-invert max-w-none">
          <ReactMarkdown>{explanation}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
