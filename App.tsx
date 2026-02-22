
import React, { useState, useEffect, Suspense } from 'react';
import { Layout } from './components/Layout';
import { ResearchResult } from './types';
import { GeminiService } from './services/geminiService';
import { Dashboard } from './components/Dashboard';

const LOADING_STEPS = [
  "Initializing intelligence core...",
  "Scanning Google Search signals...",
  "Extracting Reddit community insights...",
  "Analyzing Quora demand clusters...",
  "Evaluating keyword momentum...",
  "Building content strategy...",
  "Finalizing your research..."
];

const App: React.FC = () => {
  const [niche, setNiche] = useState('');
  const [count, setCount] = useState(15);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Rotate loading messages for a better UX during long AI tasks
  useEffect(() => {
    let interval: number;
    if (isLoading) {
      setLoadingStep(0);
      interval = window.setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const gemini = new GeminiService();
      const data = await gemini.researchNiche(niche.trim(), count);
      setResult(data);
    } catch (err: any) {
      console.error("Search Error:", err);
      setError(err.message || 'The search engine timed out. Please try a more specific niche.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        {/* Hero & Search bar - This renders immediately */}
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <div className="inline-block px-4 py-1.5 mb-6 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 text-xs font-bold uppercase tracking-widest">
            AI Market Intelligence
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
            Stop Guessing. <br/><span className="text-indigo-600">Start Knowing.</span>
          </h2>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
            Input any niche to discover exactly what questions your audience is asking across the web right now.
          </p>
          
          <form onSubmit={handleSearch} className="bg-white p-2 rounded-2xl shadow-xl border border-slate-200 flex flex-col md:flex-row gap-2 ring-4 ring-slate-50 transition-all focus-within:ring-indigo-100">
            <div className="flex-grow flex items-center px-4">
              <svg className="w-5 h-5 text-indigo-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                disabled={isLoading}
                placeholder="Topic: e.g. 'Coffee Roasting' or 'AI Tools'..."
                className="w-full py-3 text-slate-900 font-medium placeholder-slate-400 focus:outline-none disabled:opacity-50"
              />
            </div>
            <div className="flex items-center px-4 border-l border-slate-100">
              <select 
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                disabled={isLoading}
                className="bg-transparent text-sm font-bold text-slate-600 focus:outline-none cursor-pointer pr-4 disabled:opacity-50"
              >
                <option value={10}>10 Results</option>
                <option value={15}>15 Results</option>
                <option value={30}>30 Results</option>
              </select>
            </div>
            <button
              disabled={isLoading || !niche.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-3.5 px-10 rounded-xl transition-all shadow-lg shadow-indigo-200 active:scale-95"
            >
              {isLoading ? 'Researching...' : 'Explore Niche'}
            </button>
          </form>
          
          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm font-semibold border border-red-100 flex items-center justify-center gap-2 animate-in fade-in zoom-in duration-300">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              {error}
            </div>
          )}
        </div>

        {/* Results / Dashboard */}
        {result ? (
          <Dashboard data={result} />
        ) : (
          !isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 animate-in slide-in-from-bottom-4 duration-700">
              {[
                { title: 'Real Search Data', desc: 'Pulled from Google, Reddit, and Quora to ensure you see real-world demand.', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', color: 'blue' },
                { title: 'Content Angles', desc: 'Every question comes with a recommended content angle and platform.', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', color: 'purple' },
                { title: 'Strategic Summary', desc: 'Get a bird\'s eye view of the niche to plan your next month of content.', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', color: 'indigo' }
              ].map((feature, i) => (
                <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm group hover:border-indigo-100 transition-all">
                  <div className={`w-12 h-12 bg-${feature.color}-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <svg className={`w-6 h-6 text-${feature.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                    </svg>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          )
        )}

        {/* Dynamic Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-in fade-in duration-500">
            <div className="relative">
              <div className="w-24 h-24 border-8 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-indigo-50 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="text-center space-y-3">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {LOADING_STEPS[loadingStep]}
              </h3>
              <p className="text-slate-400 font-medium max-w-sm mx-auto">
                Navigating real-time search signals to find high-opportunity content gaps.
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
