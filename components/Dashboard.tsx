
import React, { useState } from 'react';
import { ResearchResult, ScoredQuestion, ContentIdea } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';

interface DashboardProps {
  data: ResearchResult;
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const { questions, summary, contentIdeas } = data;
  const [expandedIdeaId, setExpandedIdeaId] = useState<string | null>(null);
  const [writingIdea, setWritingIdea] = useState<ContentIdea | null>(null);
  const [draftContent, setDraftContent] = useState('');
  const [savedQuestionIds, setSavedQuestionIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const clusterData = questions.reduce((acc: any[], q) => {
    const existing = acc.find(item => item.name === q.cluster);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: q.cluster, value: 1 });
    }
    return acc;
  }, []);

  const sourceData = questions.reduce((acc: any[], q) => {
    const existing = acc.find(item => item.name === q.source);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: q.source, value: 1 });
    }
    return acc;
  }, []);

  const handleExportCSV = () => {
    const headers = ['Question', 'Cluster', 'Popularity', 'Trend', 'Best Platform', 'Source'];
    const rows = questions.map(q => [
      `"${q.question.replace(/"/g, '""')}"`,
      `"${q.cluster.replace(/"/g, '""')}"`,
      q.popularity,
      q.trend,
      q.bestPlatform,
      q.source
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `research_results_${data.niche.replace(/\s+/g, '_').toLowerCase()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleIdea = (id: string) => {
    setExpandedIdeaId(expandedIdeaId === id ? null : id);
  };

  const handleStartWriting = (idea: ContentIdea, e: React.MouseEvent) => {
    e.stopPropagation();
    setWritingIdea(idea);
    setDraftContent('');
  };

  const toggleSaveQuestion = (id: string) => {
    setSavedQuestionIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Signals Found</p>
          <p className="text-3xl font-bold text-slate-900">{questions.length}</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
            <span className="font-bold">↑ 24%</span>
            <span>vs last 30 days</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Top Rising Cluster</p>
          <p className="text-3xl font-bold text-indigo-600 truncate">{summary.topRisingCluster}</p>
          <p className="mt-2 text-xs text-slate-400">High momentum questions detected</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Avg Search Volume</p>
          <p className="text-3xl font-bold text-slate-900">{summary.totalVolume}</p>
          <p className="mt-2 text-xs text-slate-400">Relative to global index</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm ring-2 ring-indigo-50">
          <p className="text-sm font-medium text-slate-500 mb-1">Saved Questions</p>
          <p className="text-3xl font-bold text-indigo-600">{savedQuestionIds.size}</p>
          <p className="mt-2 text-xs text-slate-400">Ready for content creation</p>
        </div>
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Questions by Cluster</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clusterData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} fontSize={12} stroke="#64748b" />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Source Distribution</h3>
          <div className="h-[300px] flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Growth</span>
              <span className="text-lg font-bold text-slate-700">Healthy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Research Results</h3>
          <button 
            onClick={handleExportCSV}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Question</th>
                <th className="px-6 py-3 text-center">Popularity</th>
                <th className="px-6 py-3">Trend</th>
                <th className="px-6 py-3">Best Platform</th>
                <th className="px-6 py-3">Source</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {questions.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 leading-relaxed max-w-md">
                    {q.question}
                    <span className="block text-[10px] text-slate-400 mt-1 uppercase tracking-tight">{q.cluster}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-12 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500" 
                          style={{ width: `${q.popularity}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-600">{q.popularity}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      q.trend === 'Rising' ? 'bg-green-100 text-green-700' :
                      q.trend === 'Stable' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {q.trend}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                      {q.bestPlatform}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-500 font-mono">{q.source}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleCopy(q.question, q.id)}
                        className={`p-2 rounded-lg transition-all ${
                          copiedId === q.id 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                        }`}
                        title="Copy Question"
                      >
                        {copiedId === q.id ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        )}
                      </button>
                      <button 
                        onClick={() => toggleSaveQuestion(q.id)}
                        className={`p-2 rounded-lg transition-all ${
                          savedQuestionIds.has(q.id) 
                            ? 'bg-indigo-100 text-indigo-600' 
                            : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                        }`}
                        title={savedQuestionIds.has(q.id) ? "Unsave Question" : "Save Question"}
                      >
                        <svg className="w-4 h-4" fill={savedQuestionIds.has(q.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Content Ideas */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900">Content Execution Strategy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contentIdeas.map((idea) => {
            const relatedQuestion = questions.find(q => q.id === idea.targetQuestionId);
            const isExpanded = expandedIdeaId === idea.id;

            return (
              <motion.div 
                layout
                key={idea.id} 
                onClick={() => toggleIdea(idea.id)}
                className={`bg-white p-6 rounded-xl border shadow-sm cursor-pointer transition-all ${
                  isExpanded ? 'border-indigo-400 ring-2 ring-indigo-50 lg:col-span-2' : 'border-slate-200 hover:border-indigo-200'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    {idea.angle}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                    {idea.platform}
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2">{idea.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">{idea.description}</p>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 mt-4 border-t border-slate-100 space-y-4">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Target Question</p>
                          <p className="text-sm text-slate-700 font-medium italic">"{relatedQuestion?.question}"</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Recommended Format</p>
                            <p className="text-xs text-slate-600 font-semibold">{idea.format}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Niche Cluster</p>
                            <p className="text-xs text-slate-600 font-semibold">{relatedQuestion?.cluster}</p>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Execution Tip</p>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Focus on {idea.angle.toLowerCase()} elements. Since this is trending as {relatedQuestion?.trend}, 
                            ensure you publish on {idea.platform} within the next 48 hours for maximum reach.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <span className="text-[10px] text-slate-400 font-medium italic">
                    {isExpanded ? 'Click to collapse' : `Format: ${idea.format}`}
                  </span>
                  <button 
                    onClick={(e) => isExpanded ? handleStartWriting(idea, e) : null}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                  >
                    {isExpanded ? 'Start Writing →' : 'View Details →'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Writing Modal */}
      <AnimatePresence>
        {writingIdea && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      Drafting Mode
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {writingIdea.platform} • {writingIdea.format}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{writingIdea.title}</h3>
                </div>
                <button 
                  onClick={() => setWritingIdea(null)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex-grow p-8 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <textarea
                    autoFocus
                    value={draftContent}
                    onChange={(e) => setDraftContent(e.target.value)}
                    placeholder="Start writing your masterpiece here..."
                    className="w-full h-full min-h-[400px] p-6 text-lg text-slate-800 placeholder-slate-300 focus:outline-none bg-slate-50/30 rounded-xl border border-slate-100 resize-none font-serif"
                  />
                </div>
                
                <div className="space-y-6">
                  <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                    <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3">Strategy Brief</h4>
                    <p className="text-sm text-indigo-900/70 leading-relaxed italic mb-4">
                      "{writingIdea.description}"
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                        <span className="text-xs font-semibold text-indigo-800">Angle: {writingIdea.angle}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                        <span className="text-xs font-semibold text-indigo-800">Platform: {writingIdea.platform}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Writing Tips</h4>
                    <ul className="text-xs text-slate-600 space-y-2">
                      <li className="flex gap-2">
                        <span className="text-indigo-500">•</span>
                        <span>Hook the reader in the first 2 sentences.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-indigo-500">•</span>
                        <span>Use short paragraphs for {writingIdea.platform} readability.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-indigo-500">•</span>
                        <span>End with a clear call to action.</span>
                      </li>
                    </ul>
                  </div>

                  <button 
                    onClick={() => {
                      alert('Draft saved to local storage! (Simulation)');
                      setWritingIdea(null);
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
                  >
                    Finish & Export
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Recommendations */}
      <div className="bg-indigo-900 text-white p-8 rounded-2xl shadow-xl overflow-hidden relative">
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-4">Strategic Recommendation</h3>
          <p className="text-indigo-100 text-lg leading-relaxed max-w-3xl">
            {summary.recommendation}
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-400/10 rounded-full mr-12 mb-12 blur-2xl"></div>
      </div>
    </div>
  );
};
