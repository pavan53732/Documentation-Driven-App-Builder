/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { 
  FileText, 
  Upload, 
  Cpu, 
  ListChecks, 
  Play, 
  CheckCircle2, 
  ChevronRight, 
  ChevronDown,
  Copy, 
  Trash2,
  Loader2,
  AlertCircle,
  Database,
  Layout,
  Settings,
  GitBranch,
  Zap,
  ClipboardList,
  Shield,
  Activity,
  Palette,
  Accessibility,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  Target,
  Search,
  Sun,
  Moon,
  Share2,
  Sparkles,
  Check,
  X,
  MessageSquare,
  Terminal,
  TestTube,
  Globe,
  MousePointer2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  Node, 
  Edge,
  MarkerType,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ProjectState, BuildTask, SystemModel, UIComponent, UIModule, SmartSuggestion, DuplicateContent } from './types';
import { analyzeDocumentation, decomposeTasks, quickAnalyze, analyzeRejection } from './services/geminiService';
import { ChatBot } from './components/ChatBot';
import { evaluateRules, applySuggestion, detectContradictions, detectDuplicates, RULES } from './services/ruleEngine';
import { RuleEditor } from './components/RuleEditor';

const TaskNode = ({ data }: { data: { title: string; phase: string; status: string } }) => (
  <div className={`p-3 rounded-sm border border-[#141414] shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] bg-white min-w-[150px] transition-all hover:scale-105`}>
    <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-[#141414]" />
    <div className="flex justify-between items-start mb-1">
      <div className="text-[8px] uppercase font-bold opacity-40">{data.phase}</div>
      {data.status === 'completed' && <CheckCircle2 size={10} className="text-emerald-500" />}
      {data.status === 'in-progress' && <Loader2 size={10} className="text-blue-500 animate-spin" />}
    </div>
    <div className="text-[10px] font-bold leading-tight">{data.title}</div>
    <div className={`mt-2 text-[8px] uppercase font-bold px-1 py-0.5 rounded-sm inline-block ${
      data.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
      data.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
      'bg-slate-100 text-slate-700'
    }`}>
      {data.status}
    </div>
    <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-[#141414]" />
  </div>
);

const nodeTypes = {
  task: TaskNode,
};

const DependencyGraph = ({ tasks }: { tasks: BuildTask[] }) => {
  const nodes: Node[] = tasks.map((task, i) => ({
    id: task.id,
    type: 'task',
    data: { title: task.title, phase: task.phase, status: task.status },
    position: { x: (i % 3) * 250, y: Math.floor(i / 3) * 150 },
  }));

  const edges: Edge[] = tasks.flatMap(task => 
    task.dependencies.map(depId => ({
      id: `${depId}-${task.id}`,
      source: depId,
      target: task.id,
      animated: task.status === 'in-progress',
      style: { stroke: '#141414', strokeWidth: 1.5 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#141414',
      },
    }))
  );

  return (
    <div className="h-[400px] w-full border border-[#141414] rounded-sm bg-[#F8F8F8] overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        draggable={true}
        zoomOnScroll={true}
        panOnDrag={true}
      >
        <Background color="#141414" gap={20} size={1} opacity={0.05} />
        <Controls showInteractive={true} />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
      </ReactFlow>
    </div>
  );
};

const UIComponentTree = ({ component, depth = 0 }: { component: UIComponent; depth?: number; key?: React.Key }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 1);
  const hasChildren = component.children && component.children.length > 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 flex-wrap">
        {depth > 0 && <span className="opacity-20">{'—'.repeat(depth)}</span>}
        
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={!hasChildren}
          className={`flex items-center gap-1.5 group ${hasChildren ? 'cursor-pointer' : 'cursor-default'}`}
        >
          {hasChildren && (
            <span className="opacity-40 group-hover:opacity-100 transition-opacity">
              {isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
            </span>
          )}
          <span className="text-[10px] border border-[#141414]/20 px-1.5 py-0.5 rounded-sm uppercase tracking-wider bg-white/50 font-bold">
            {component.name}
          </span>
        </button>

        {component.attributes?.map((attr, i) => (
          <span key={i} className="text-[8px] bg-black/5 px-1 rounded-sm opacity-60">
            {attr.name}="{attr.value}"
          </span>
        ))}
      </div>
      
      <AnimatePresence initial={false}>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {component.children?.map((child, i) => (
              <UIComponentTree key={i} component={child} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const UIModuleItem = ({ module, theme }: { module: UIModule; theme: 'light' | 'dark'; key?: React.Key }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  return (
    <div className={`border-l-2 pl-3 py-1 ${theme === 'dark' ? 'border-white/20' : 'border-[#141414]'}`}>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 w-full text-left group"
      >
        <div className="flex-1 flex justify-between items-start">
          <span className="text-sm font-bold">{module.name}</span>
          {module.provenance && (
            <div className="text-[8px] opacity-40 flex items-center gap-1 uppercase tracking-tighter mr-2">
              <FileText size={8} />
              {module.provenance.file}
            </div>
          )}
        </div>
        <span className="opacity-40 group-hover:opacity-100 transition-opacity">
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </button>
      <p className="text-[10px] opacity-70 mt-1 mb-3">{module.purpose}</p>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-2"
          >
            {module.components.map((c, j) => (
              <UIComponentTree key={j} component={c} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('guide-theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  const [state, setState] = useState<ProjectState>({
    id: crypto.randomUUID(),
    name: 'New Project',
    docs: [],
    model: null,
    tasks: [],
    currentTaskIndex: 0
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isQuickScanning, setIsQuickScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'docs' | 'model' | 'tasks' | 'standards'>('docs');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('guide-theme', newTheme);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      if (file.name.endsWith('.md')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setState(prev => ({
            ...prev,
            docs: [...prev.docs, { name: file.name, content }]
          }));
        };
        reader.readAsText(file);
      }
    });
  };

  const removeDoc = (index: number) => {
    setState(prev => ({
      ...prev,
      docs: prev.docs.filter((_, i) => i !== index)
    }));
  };

  const handleAnalyzeWithRules = () => {
    startAnalysis(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ui/icons': return <Layout size={14} className="text-blue-500" />;
      case 'ui/feedback': return <MessageSquare size={14} className="text-purple-500" />;
      case 'ui/loading': return <Loader2 size={14} className="text-amber-500 animate-spin" />;
      case 'a11y': return <Accessibility size={14} className="text-emerald-500" />;
      case 'logic/logging': return <FileText size={14} className="text-slate-500" />;
      case 'logic/monitoring': return <Activity size={14} className="text-red-500" />;
      case 'logic/security': return <Shield size={14} className="text-red-600" />;
      case 'devops': return <Terminal size={14} className="text-indigo-500" />;
      case 'seo': return <Search size={14} className="text-cyan-500" />;
      case 'testing': return <TestTube size={14} className="text-amber-600" />;
      case 'ui/global': return <Globe size={14} className="text-blue-400" />;
      case 'ui/ux': return <MousePointer2 size={14} className="text-purple-400" />;
      default: return <Sparkles size={14} className="text-emerald-500" />;
    }
  };

  const startAnalysis = async (quick = false) => {
    if (state.docs.length === 0) {
      setError("Please upload at least one markdown file.");
      return;
    }

    if (quick) setIsQuickScanning(true);
    else setIsAnalyzing(true);
    
    setError(null);
    try {
      const model = quick 
        ? await quickAnalyze(state.docs)
        : await analyzeDocumentation(state.docs);
      
      const tasks = await decomposeTasks(model);
      
      // Run structural contradiction detection
      const structuralContradictions = detectContradictions(model);
      model.contradictions = [...(model.contradictions || []), ...structuralContradictions];
      
      // Run structural duplicate detection
      const structuralDuplicates = detectDuplicates(model);
      model.duplicates = [...(model.duplicates || []), ...structuralDuplicates];
      
      setState(prev => ({ ...prev, model, tasks }));
      setActiveTab('model');
    } catch (err) {
      setError("Failed to analyze documentation. Please try again.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
      setIsQuickScanning(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const copyAllPrompts = () => {
    const allPrompts = state.tasks.map((task, i) => `TASK ${i + 1}: ${task.title}\n\n${task.prompt}`).join('\n\n' + '='.repeat(50) + '\n\n');
    copyToClipboard(allPrompts);
  };

  const toggleTaskStatus = (index: number) => {
    setState(prev => {
      const newTasks = [...prev.tasks];
      newTasks[index].status = newTasks[index].status === 'completed' ? 'pending' : 'completed';
      return { ...prev, tasks: newTasks };
    });
  };

  const handleAcceptSmartSuggestion = async (id: string) => {
    let updatedModel: SystemModel | null = null;

    setState(prev => {
      if (!prev.model) return prev;
      const suggestion = prev.model.smartSuggestions.find(s => s.id === id);
      if (!suggestion) return prev;

      // Apply the fix to the model
      updatedModel = applySuggestion(prev.model, suggestion);
      
      // Update status
      const newSmartSuggestions = updatedModel.smartSuggestions.map(s => 
        s.id === id ? { ...s, status: 'accepted' as const } : s
      );

      updatedModel = { ...updatedModel, smartSuggestions: newSmartSuggestions };

      return {
        ...prev,
        model: updatedModel
      };
    });

    // Re-generate tasks after accepting a suggestion
    if (updatedModel) {
      try {
        const updatedTasks = await decomposeTasks(updatedModel);
        setState(prev => ({ ...prev, tasks: updatedTasks }));
      } catch (err) {
        console.error("Failed to re-generate tasks:", err);
      }
    }
  };

  const handleRejectSmartSuggestion = async (id: string) => {
    const reason = prompt("Why are you rejecting this suggestion? (Optional)");
    
    setState(prev => {
      if (!prev.model) return prev;
      const suggestion = prev.model.smartSuggestions.find(s => s.id === id);
      if (!suggestion) return prev;

      if (reason) {
        analyzeRejection(suggestion, reason).then(insight => {
          console.log('AI Insight on Rejection:', insight);
          // We could show this insight to the user or use it to tune rules
        });
      }

      const newSmartSuggestions = prev.model.smartSuggestions.map(s => 
        s.id === id ? { ...s, status: 'rejected' as const } : s
      );
      return {
        ...prev,
        model: { ...prev.model, smartSuggestions: newSmartSuggestions }
      };
    });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans selection:bg-[#141414] selection:text-[#E4E3E0] ${theme === 'dark' ? 'bg-[#0A0A0A] text-[#E4E3E0]' : 'bg-[#E4E3E0] text-[#141414]'}`}>
      {/* Header */}
      <header className={`border-b p-6 flex justify-between items-center backdrop-blur-sm sticky top-0 z-10 ${theme === 'dark' ? 'border-white/10 bg-[#141414]/80' : 'border-[#141414] bg-white/50'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 flex items-center justify-center rounded-sm ${theme === 'dark' ? 'bg-white text-black' : 'bg-[#141414] text-[#E4E3E0]'}`}>
            <Cpu size={24} />
          </div>
          <div>
            <input 
              type="text" 
              value={state.name}
              onChange={(e) => setState(prev => ({ ...prev, name: e.target.value }))}
              aria-label="Project Name"
              className="text-xl font-bold tracking-tight uppercase bg-transparent border-none focus:ring-0 p-0 w-full"
            />
            <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest">Documentation-Driven App Builder</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-black'}`}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <div className={`flex p-1 rounded-sm border ${theme === 'dark' ? 'bg-[#1A1A1A] border-white/10' : 'bg-white border-[#141414]'}`}>
            <button 
              onClick={() => setActiveTab('docs')}
              className={`px-4 py-1.5 text-xs font-bold uppercase transition-colors ${activeTab === 'docs' ? (theme === 'dark' ? 'bg-white text-black' : 'bg-[#141414] text-[#E4E3E0]') : 'hover:bg-black/5'}`}
            >
              01. Docs
            </button>
            <button 
              disabled={!state.model}
              onClick={() => setActiveTab('model')}
              className={`px-4 py-1.5 text-xs font-bold uppercase transition-colors disabled:opacity-30 ${activeTab === 'model' ? (theme === 'dark' ? 'bg-white text-black' : 'bg-[#141414] text-[#E4E3E0]') : 'hover:bg-black/5'}`}
            >
              02. Model
            </button>
            <button 
              disabled={state.tasks.length === 0}
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-1.5 text-xs font-bold uppercase transition-colors disabled:opacity-30 ${activeTab === 'tasks' ? (theme === 'dark' ? 'bg-white text-black' : 'bg-[#141414] text-[#E4E3E0]') : 'hover:bg-black/5'}`}
            >
              03. Tasks
            </button>
            <button 
              onClick={() => setActiveTab('standards')}
              className={`px-4 py-1.5 text-xs font-bold uppercase transition-colors ${activeTab === 'standards' ? (theme === 'dark' ? 'bg-white text-black' : 'bg-[#141414] text-[#E4E3E0]') : 'hover:bg-black/5'}`}
            >
              04. Standards
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'docs' && (
            <motion.div 
              key="docs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-1 space-y-6">
                <div className={`border border-[#141414] p-8 rounded-sm shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] ${theme === 'dark' ? 'bg-[#1A1A1A]' : 'bg-white'}`}>
                  <h2 className="font-serif italic text-2xl mb-4">Knowledge Loader</h2>
                  <p className="text-sm opacity-70 mb-6">
                    Upload your system specifications in Markdown format. Guide Engine will parse every line to understand the full system architecture.
                  </p>
                  
                  <label 
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.currentTarget.querySelector('input')?.click();
                      }
                    }}
                    className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-sm cursor-pointer transition-colors group ${theme === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-[#141414]/20 hover:bg-black/5'}`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 mb-3 opacity-30 group-hover:opacity-100 transition-opacity" />
                      <p className="text-xs font-bold uppercase tracking-wider">Drop .md files here</p>
                      <p className="text-[10px] opacity-50 mt-1">or click to browse</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      multiple 
                      accept=".md" 
                      onChange={handleFileUpload} 
                      aria-label="Upload Markdown Files"
                    />
                  </label>

                  <div className="grid grid-cols-1 gap-3 mt-6">
                    <button 
                      onClick={() => startAnalysis(true)}
                      disabled={isAnalyzing || isQuickScanning || state.docs.length === 0}
                      className={`w-full py-4 font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors border border-[#141414] disabled:opacity-50 ${
                        theme === 'dark' ? 'bg-white text-black hover:bg-white/90' : 'bg-[#141414] text-[#E4E3E0] hover:bg-[#2a2a2a]'
                      }`}
                    >
                      {isQuickScanning ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          Quick Scanning...
                        </>
                      ) : (
                        <>
                          <Zap size={18} />
                          Quick Scan
                        </>
                      )}
                    </button>
                    <button 
                      onClick={() => startAnalysis(false)}
                      disabled={isAnalyzing || isQuickScanning || state.docs.length === 0}
                      className={`w-full py-4 font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors border border-[#141414] disabled:opacity-50 ${
                        theme === 'dark' ? 'bg-white text-black hover:bg-white/90' : 'bg-[#141414] text-[#E4E3E0] hover:bg-[#2a2a2a]'
                      }`}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          Deep Analyzing...
                        </>
                      ) : (
                        <>
                          <Play size={18} />
                          Deep Analysis
                        </>
                      )}
                    </button>
                  </div>

                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                      <AlertCircle size={14} />
                      {error}
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className={`border border-[#141414] rounded-sm overflow-hidden shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] ${theme === 'dark' ? 'bg-[#1A1A1A]' : 'bg-white'}`}>
                  <div className={`px-6 py-3 flex justify-between items-center ${theme === 'dark' ? 'bg-white text-black' : 'bg-[#141414] text-[#E4E3E0]'}`}>
                    <span className="text-[10px] font-mono uppercase tracking-widest">Loaded Documents ({state.docs.length})</span>
                  </div>
                  <div className={`divide-y ${theme === 'dark' ? 'divide-white/10' : 'divide-[#141414]/10'}`}>
                    {state.docs.length === 0 ? (
                      <div className="p-20 text-center opacity-30 flex flex-col items-center gap-4">
                        <FileText size={48} />
                        <p className="text-sm font-bold uppercase tracking-widest">No documents loaded</p>
                      </div>
                    ) : (
                      state.docs.map((doc, i) => (
                        <div key={i} className={`p-4 flex items-center justify-between transition-colors group ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 flex items-center justify-center rounded-sm ${theme === 'dark' ? 'bg-white/10' : 'bg-black/5'}`}>
                              <FileText size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold">{doc.name}</p>
                              <p className="text-[10px] opacity-50 uppercase">{doc.content.length} characters</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => removeDoc(i)}
                            className="p-2 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'model' && state.model && (
            <motion.div 
              key="model"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="font-serif italic text-4xl">System Model</h2>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-sm opacity-50 uppercase tracking-widest">Extracted Architecture & Rules</p>
                    {state.model.readinessScore !== undefined && (
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'bg-white text-black' : 'bg-[#141414] text-[#E4E3E0]'}`}>
                        <Target size={12} /> Readiness: {state.model.readinessScore}%
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('tasks')}
                  className={`px-6 py-3 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors border border-[#141414] ${
                    theme === 'dark' ? 'bg-white text-black hover:bg-white/90' : 'bg-[#141414] text-[#E4E3E0] hover:bg-[#2a2a2a]'
                  }`}
                >
                  View Build Plan <ChevronRight size={16} />
                </button>
              </div>

              {/* Architectural Insights Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Gaps */}
                <div className={`border rounded-sm p-6 shadow-[4px_4px_0px_0px_rgba(245,158,11,0.2)] ${theme === 'dark' ? 'bg-amber-900/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="flex items-center gap-2 mb-4 text-amber-500">
                    <Search size={18} />
                    <h3 className="font-bold uppercase text-xs tracking-widest">Gap Analysis</h3>
                  </div>
                  <div className="space-y-4">
                    {state.model.gaps?.map((gap, i) => (
                      <div key={i} className={`text-xs border-b pb-3 last:border-0 ${theme === 'dark' ? 'border-amber-500/10' : 'border-amber-200/50'}`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[8px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded-sm uppercase font-bold">{gap.category}</span>
                          <span className={`text-[8px] font-bold uppercase ${gap.impact === 'high' ? 'text-red-500' : gap.impact === 'medium' ? 'text-amber-500' : 'text-slate-500'}`}>
                            {gap.impact} Impact
                          </span>
                        </div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-amber-200' : 'text-amber-900'}`}>{gap.description}</p>
                        <p className="text-[10px] text-amber-500 mt-1 italic opacity-70">Proposed: {gap.proposedSolution}</p>
                      </div>
                    ))}
                    {(!state.model.gaps || state.model.gaps.length === 0) && <p className="text-xs opacity-40 italic">No gaps detected.</p>}
                  </div>
                </div>

                {/* Contradictions */}
                <div className={`border rounded-sm p-6 shadow-[4px_4px_0px_0px_rgba(239,68,68,0.2)] ${theme === 'dark' ? 'bg-red-900/10 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-2 mb-4 text-red-500">
                    <AlertTriangle size={18} />
                    <h3 className="font-bold uppercase text-xs tracking-widest">Contradictions</h3>
                  </div>
                  <div className="space-y-4">
                    {state.model.contradictions?.map((con, i) => (
                      <div key={i} className={`text-xs border-b pb-3 last:border-0 ${theme === 'dark' ? 'border-red-500/10' : 'border-red-200/50'}`}>
                        <p className={`font-bold mb-1 ${theme === 'dark' ? 'text-red-200' : 'text-red-900'}`}>{con.description}</p>
                        <ul className="space-y-2 mb-3">
                          {con.conflictingPoints.map((p, j) => (
                            <li key={j} className="text-[10px] text-red-500 flex flex-col gap-0.5">
                              <div className="flex gap-1">
                                <span className="opacity-50">•</span> {p.text}
                              </div>
                              {p.provenance && (
                                <div className="ml-3 text-[8px] opacity-60 flex items-center gap-1">
                                  <FileText size={8} />
                                  <span>{p.provenance.file}</span>
                                  {p.provenance.context && <span className="italic">"{p.provenance.context}"</span>}
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                        <p className={`text-[10px] p-2 rounded-sm italic ${theme === 'dark' ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-800'}`}>Resolution: {con.resolutionSuggestion}</p>
                      </div>
                    ))}
                    {(!state.model.contradictions || state.model.contradictions.length === 0) && <p className="text-xs opacity-40 italic">No contradictions found.</p>}
                  </div>
                </div>

                {/* Duplicate Content */}
                <div className={`border rounded-sm p-6 shadow-[4px_4px_0px_0px_rgba(107,114,128,0.2)] ${theme === 'dark' ? 'bg-slate-900/10 border-slate-500/20' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-2 mb-4 text-slate-500">
                    <Copy size={18} />
                    <h3 className="font-bold uppercase text-xs tracking-widest">Duplicate Content</h3>
                  </div>
                  <div className="space-y-4">
                    {state.model.duplicates?.map((dup, i) => (
                      <div key={i} className={`text-xs border-b pb-3 last:border-0 ${theme === 'dark' ? 'border-slate-500/10' : 'border-slate-200/50'}`}>
                        <div className="flex justify-between items-start mb-1">
                          <p className={`font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{dup.elementName}</p>
                          <span className="text-[8px] bg-slate-500/20 text-slate-500 px-1.5 py-0.5 rounded-sm uppercase font-bold">{dup.elementType}</span>
                        </div>
                        <ul className="space-y-1 mb-2">
                          {dup.occurrences.map((occ, j) => (
                            <li key={j} className="text-[9px] opacity-60 flex items-center gap-1">
                              <FileText size={8} />
                              <span>{occ.file}</span>
                              <span className="opacity-40">- {occ.context}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="text-[10px] opacity-70 italic">Suggestion: {dup.suggestion}</p>
                      </div>
                    ))}
                    {(!state.model.duplicates || state.model.duplicates.length === 0) && <p className="text-xs opacity-40 italic">No duplicates detected.</p>}
                  </div>
                </div>

                {/* Suggestions */}
                <div className={`border rounded-sm p-6 shadow-[4px_4px_0px_0px_rgba(79,70,229,0.2)] ${theme === 'dark' ? 'bg-indigo-900/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-200'}`}>
                  <div className="flex items-center gap-2 mb-4 text-indigo-500">
                    <Lightbulb size={18} />
                    <h3 className="font-bold uppercase text-xs tracking-widest">Architectural Suggestions</h3>
                  </div>
                  <div className="space-y-4">
                    {state.model.suggestions?.map((sug, i) => (
                      <div key={i} className={`text-xs border-b pb-3 last:border-0 ${theme === 'dark' ? 'border-indigo-500/10' : 'border-indigo-200/50'}`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[8px] bg-indigo-500/20 text-indigo-500 px-1.5 py-0.5 rounded-sm uppercase font-bold">{sug.type}</span>
                        </div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-indigo-200' : 'text-indigo-900'}`}>{sug.description}</p>
                        <p className="text-[10px] text-indigo-500 mt-1 opacity-70">{sug.reasoning}</p>
                      </div>
                    ))}
                    {(!state.model.suggestions || state.model.suggestions.length === 0) && <p className="text-xs opacity-40 italic">No suggestions available.</p>}
                  </div>
                </div>
              </div>

              {/* Smart Suggestions Section */}
              {state.model.smartSuggestions && state.model.smartSuggestions.length > 0 && (
                <div className={`border border-[#141414] rounded-sm p-8 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] ${theme === 'dark' ? 'bg-[#1A1A1A]' : 'bg-white'}`}>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 flex items-center justify-center rounded-sm ${theme === 'dark' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-emerald-100 text-emerald-700'}`}>
                        <Sparkles size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold uppercase text-sm tracking-widest">Smart Suggestions (Rule-Based)</h3>
                        <p className="text-[10px] opacity-50 uppercase tracking-widest mt-1">AI-Driven Gap Analysis & Best Practices</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase opacity-40">Accepted:</span>
                      <span className="text-xs font-mono font-bold">{state.model.smartSuggestions.filter(s => s.status === 'accepted').length}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {state.model.smartSuggestions.map((sug) => (
                      <div 
                        key={sug.id} 
                        className={`border p-5 rounded-sm transition-all ${
                          sug.status === 'accepted' ? (theme === 'dark' ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-emerald-200 bg-emerald-50') :
                          sug.status === 'rejected' ? 'opacity-40 grayscale' :
                          (theme === 'dark' ? 'border-white/10 hover:border-white/20' : 'border-black/10 hover:border-black/20')
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`text-[8px] px-1.5 py-0.5 rounded-sm font-bold uppercase ${
                              sug.category.startsWith('ui') ? 'bg-blue-500/20 text-blue-500' :
                              sug.category.startsWith('logic') ? 'bg-purple-500/20 text-purple-500' :
                              sug.category === 'a11y' ? 'bg-amber-500/20 text-amber-500' :
                              'bg-slate-500/20 text-slate-500'
                            }`}>
                              {getCategoryIcon(sug.category)}
                              {sug.category}
                            </span>
                            <span className={`text-[8px] font-bold uppercase ${
                              sug.impact === 'high' ? 'text-red-500' : 
                              sug.impact === 'medium' ? 'text-amber-500' : 
                              'text-slate-500'
                            }`}>
                              {sug.impact} Impact
                            </span>
                          </div>
                          {sug.status === 'pending' && (
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleRejectSmartSuggestion(sug.id)}
                                aria-label="Reject Suggestion"
                                className={`p-1.5 rounded-sm transition-colors ${theme === 'dark' ? 'hover:bg-red-500/20 text-red-500' : 'hover:bg-red-100 text-red-600'}`}
                              >
                                <X size={14} />
                              </button>
                              <button 
                                onClick={() => handleAcceptSmartSuggestion(sug.id)}
                                aria-label="Accept Suggestion"
                                className={`p-1.5 rounded-sm transition-colors ${theme === 'dark' ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                              >
                                <Check size={14} />
                              </button>
                            </div>
                          )}
                          {sug.status === 'accepted' && (
                            <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-bold uppercase">
                              <Check size={12} /> Accepted
                            </div>
                          )}
                        </div>

                        <h4 className="text-sm font-bold mb-1">{sug.description}</h4>
                        <p className="text-xs opacity-70 mb-4 leading-relaxed">{sug.rationale}</p>
                        
                        <div className={`p-3 rounded-sm flex items-center gap-3 ${theme === 'dark' ? 'bg-black/40' : 'bg-black/5'}`}>
                          <div className={`w-8 h-8 flex items-center justify-center rounded-sm ${theme === 'dark' ? 'bg-white/10' : 'bg-white'}`}>
                            <Zap size={14} className="text-emerald-500" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold opacity-40">Recommended Action</p>
                            <p className="text-xs font-mono">{sug.action}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Entities */}
                <div className={`border border-[#141414] rounded-sm p-6 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] ${theme === 'dark' ? 'bg-[#1A1A1A]' : 'bg-white'}`}>
                  <div className={`flex items-center gap-2 mb-4 ${theme === 'dark' ? 'text-white' : 'text-[#141414]'}`}>
                    <Database size={18} />
                    <h3 className="font-bold uppercase text-xs tracking-widest">Entities</h3>
                  </div>
                  <div className="space-y-4">
                    {state.model.entities.map((entity, i) => (
                      <div key={i} className={`border-l-2 pl-3 py-1 ${theme === 'dark' ? 'border-white/20' : 'border-[#141414]'}`}>
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-bold">{entity.name}</p>
                          {entity.provenance && (
                            <div className="text-[8px] opacity-40 flex items-center gap-1 uppercase tracking-tighter">
                              <FileText size={8} />
                              {entity.provenance.file}
                            </div>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {entity.properties.map((p, j) => (
                            <span key={j} className={`text-[9px] px-1.5 py-0.5 rounded-sm uppercase font-mono ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`}>
                              {p.name}:{p.type}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* User Flows */}
                <div className={`border border-[#141414] rounded-sm p-6 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] ${theme === 'dark' ? 'bg-[#1A1A1A]' : 'bg-white'}`}>
                  <div className={`flex items-center gap-2 mb-4 ${theme === 'dark' ? 'text-white' : 'text-[#141414]'}`}>
                    <GitBranch size={18} />
                    <h3 className="font-bold uppercase text-xs tracking-widest">User Flows</h3>
                  </div>
                  <div className="space-y-6">
                    {state.model.flows?.map((flow, i) => (
                      <div key={i} className={`border-l-2 pl-3 py-1 ${theme === 'dark' ? 'border-white/20' : 'border-[#141414]'}`}>
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-bold">{flow.name}</p>
                          {flow.provenance && (
                            <div className="text-[8px] opacity-40 flex items-center gap-1 uppercase tracking-tighter">
                              <FileText size={8} />
                              {flow.provenance.file}
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] opacity-70 mt-1 uppercase">Trigger: {flow.trigger}</p>
                        <div className="mt-3 space-y-2">
                          {flow.steps.map((step, j) => (
                            <div key={j} className={`text-[10px] p-2 rounded-sm ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`}>
                              <div className="flex justify-between">
                                <span className="font-bold uppercase opacity-50">Step {j + 1}</span>
                                {step.stateTransition && <span className={`text-[8px] px-1 rounded-sm ${theme === 'dark' ? 'bg-white text-black' : 'bg-[#141414] text-[#E4E3E0]'}`}>{step.stateTransition}</span>}
                              </div>
                              <p className="mt-1"><span className="opacity-50">Action:</span> {step.action}</p>
                              <p><span className="opacity-50">Result:</span> {step.expectedResult}</p>
                            </div>
                          ))}
                        </div>
                        {flow.errorPaths?.length > 0 && (
                          <div className="mt-3">
                            <p className="text-[9px] font-bold uppercase opacity-40 mb-1">Error Paths</p>
                            {flow.errorPaths.map((err, j) => (
                              <div key={j} className={`text-[9px] border p-1.5 rounded-sm mb-1 ${theme === 'dark' ? 'border-red-500/20 bg-red-500/5' : 'border-red-200 bg-red-50'}`}>
                                <p><span className="font-bold">If:</span> {err.condition}</p>
                                <p><span className="font-bold">Recovery:</span> {err.recovery}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Micro Details */}
                <div className={`border border-[#141414] rounded-sm p-6 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] ${theme === 'dark' ? 'bg-[#1A1A1A]' : 'bg-white'}`}>
                  <div className={`flex items-center gap-2 mb-4 ${theme === 'dark' ? 'text-white' : 'text-[#141414]'}`}>
                    <Zap size={18} />
                    <h3 className="font-bold uppercase text-xs tracking-widest">Micro Details</h3>
                  </div>
                  <div className="space-y-3">
                    {state.model.microDetails?.map((detail, i) => (
                      <div key={i} className={`text-xs border-b pb-3 ${theme === 'dark' ? 'border-white/5' : 'border-black/5'}`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[9px] font-mono opacity-30">{(i+1).toString().padStart(2, '0')}</span>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`text-[8px] px-1.5 py-0.5 rounded-sm uppercase font-bold ${
                              detail.category === 'ui' ? 'bg-blue-100 text-blue-700' :
                              detail.category === 'logic' ? 'bg-purple-100 text-purple-700' :
                              detail.category === 'validation' ? 'bg-amber-100 text-amber-700' :
                              detail.category === 'animation' ? 'bg-pink-100 text-pink-700' :
                              detail.category === 'accessibility' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {detail.category}
                            </span>
                            {detail.provenance && (
                              <div className="text-[7px] opacity-40 flex items-center gap-1 uppercase tracking-tighter">
                                <FileText size={7} />
                                {detail.provenance.file}
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="font-medium">{detail.description}</p>
                        <p className="text-[10px] opacity-50 mt-1 italic">Impact: {detail.impact}</p>
                        {detail.tags && detail.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {detail.tags.map((tag, j) => (
                              <span key={j} className={`text-[8px] px-1 rounded-sm opacity-60 ${theme === 'dark' ? 'bg-white/10' : 'bg-black/5'}`}>
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* UI Modules */}
                <div className={`border border-[#141414] rounded-sm p-6 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] ${theme === 'dark' ? 'bg-[#1A1A1A]' : 'bg-white'}`}>
                  <div className={`flex items-center gap-2 mb-4 ${theme === 'dark' ? 'text-white' : 'text-[#141414]'}`}>
                    <Layout size={18} />
                    <h3 className="font-bold uppercase text-xs tracking-widest">UI Modules</h3>
                  </div>
                  <div className="space-y-6">
                    {state.model.uiModules.map((module, i) => (
                      <UIModuleItem key={i} module={module} theme={theme} />
                    ))}
                  </div>
                </div>

                {/* Constraints */}
                <div className={`border border-[#141414] rounded-sm p-6 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] ${theme === 'dark' ? 'bg-[#1A1A1A]' : 'bg-white'}`}>
                  <div className={`flex items-center gap-2 mb-4 ${theme === 'dark' ? 'text-white' : 'text-[#141414]'}`}>
                    <Shield size={18} />
                    <h3 className="font-bold uppercase text-xs tracking-widest">Constraints</h3>
                  </div>
                  <div className="space-y-4">
                    {state.model.constraints?.map((constraint, i) => (
                      <div key={i} className={`text-xs border-b pb-3 ${theme === 'dark' ? 'border-white/5' : 'border-black/5'}`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[9px] font-mono opacity-30">{(i+1).toString().padStart(2, '0')}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-sm uppercase font-bold flex items-center gap-1 ${
                            constraint.scope === 'performance' ? 'bg-amber-100 text-amber-700' :
                            constraint.scope === 'security' ? 'bg-red-100 text-red-700' :
                            constraint.scope === 'design' ? 'bg-indigo-100 text-indigo-700' :
                            constraint.scope === 'accessibility' ? 'bg-emerald-100 text-emerald-700' :
                            constraint.scope === 'usability' ? 'bg-blue-100 text-blue-700' :
                            constraint.scope === 'technical' ? 'bg-purple-100 text-purple-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {constraint.scope === 'performance' && <Activity size={10} />}
                            {constraint.scope === 'security' && <Shield size={10} />}
                            {constraint.scope === 'design' && <Palette size={10} />}
                            {constraint.scope === 'accessibility' && <Accessibility size={10} />}
                            {constraint.scope === 'usability' && <Zap size={10} />}
                            {constraint.scope === 'technical' && <Cpu size={10} />}
                            {constraint.scope === 'other' && <HelpCircle size={10} />}
                            {constraint.scope}
                          </span>
                        </div>
                        <p className="font-medium">{constraint.description}</p>
                        <p className="text-[10px] opacity-50 mt-1 italic">Impact: {constraint.impact}</p>
                        {constraint.impactedElements && constraint.impactedElements.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {constraint.impactedElements.map((el, j) => (
                              <span key={j} className={`text-[8px] px-1 rounded-sm opacity-60 ${theme === 'dark' ? 'bg-white/10' : 'bg-black/5'}`}>
                                @{el}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* State Definitions */}
                <div className={`border border-[#141414] rounded-sm p-6 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] ${theme === 'dark' ? 'bg-[#1A1A1A]' : 'bg-white'}`}>
                  <div className={`flex items-center gap-2 mb-4 ${theme === 'dark' ? 'text-white' : 'text-[#141414]'}`}>
                    <Activity size={18} />
                    <h3 className="font-bold uppercase text-xs tracking-widest">State Definitions</h3>
                  </div>
                  <div className="space-y-4">
                    {state.model.stateDefinitions?.map((stateDef, i) => (
                      <div key={i} className={`border-l-2 pl-3 py-1 ${theme === 'dark' ? 'border-white/20' : 'border-[#141414]'}`}>
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-bold">{stateDef.name}</p>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`text-[8px] px-1.5 py-0.5 rounded-sm uppercase font-bold ${
                              stateDef.scope === 'global' ? 'bg-purple-100 text-purple-700' :
                              stateDef.scope === 'server' ? 'bg-blue-100 text-blue-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {stateDef.scope}
                            </span>
                            {stateDef.provenance && (
                              <div className="text-[7px] opacity-40 flex items-center gap-1 uppercase tracking-tighter">
                                <FileText size={7} />
                                {stateDef.provenance.file}
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-[10px] opacity-70 mt-1">{stateDef.description}</p>
                      </div>
                    ))}
                    {(!state.model.stateDefinitions || state.model.stateDefinitions.length === 0) && <p className="text-xs opacity-40 italic">No state definitions found.</p>}
                  </div>
                </div>

                {/* System Rules */}
                <div className={`border border-[#141414] rounded-sm p-6 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] ${theme === 'dark' ? 'bg-[#1A1A1A]' : 'bg-white'}`}>
                  <div className={`flex items-center gap-2 mb-4 ${theme === 'dark' ? 'text-white' : 'text-[#141414]'}`}>
                    <Settings size={18} />
                    <h3 className="font-bold uppercase text-xs tracking-widest">System Rules</h3>
                  </div>
                  <ul className="space-y-2">
                    {state.model.systemRules.map((rule, i) => (
                      <li key={i} className="text-xs flex gap-2">
                        <span className="opacity-30 font-mono">{(i+1).toString().padStart(2, '0')}</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'tasks' && state.tasks.length > 0 && (
            <motion.div 
              key="tasks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Dependency Visualization */}
              <div className={`border border-[#141414] rounded-sm p-6 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] ${theme === 'dark' ? 'bg-[#1A1A1A]' : 'bg-white'}`}>
                <div className={`flex items-center gap-2 mb-4 ${theme === 'dark' ? 'text-white' : 'text-[#141414]'}`}>
                  <GitBranch size={18} />
                  <h3 className="font-bold uppercase text-xs tracking-widest">Dependency Graph</h3>
                </div>
                <DependencyGraph tasks={state.tasks} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Task List */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-serif italic text-2xl">Build Plan</h2>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={copyAllPrompts}
                        className={`text-[10px] font-bold uppercase border border-[#141414] px-2 py-1 rounded-sm transition-colors flex items-center gap-1 ${
                          theme === 'dark' ? 'bg-white text-black hover:bg-white/90' : 'bg-white text-black hover:bg-black hover:text-white'
                        }`}
                        title="Copy all prompts to clipboard"
                      >
                        <ClipboardList size={12} /> All
                      </button>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-sm ${theme === 'dark' ? 'bg-white text-black' : 'bg-[#141414] text-[#E4E3E0]'}`}>
                        {state.tasks.filter(t => t.status === 'completed').length}/{state.tasks.length} DONE
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    {state.tasks.map((task, i) => (
                      <button
                        key={task.id}
                        onClick={() => setState(prev => ({ ...prev, currentTaskIndex: i }))}
                        className={`w-full text-left p-4 border transition-all relative group ${
                          state.currentTaskIndex === i 
                            ? (theme === 'dark' ? 'bg-white text-black border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]' : 'bg-[#141414] text-[#E4E3E0] border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,0.2)]')
                            : (theme === 'dark' ? 'bg-[#1A1A1A] border-white/10 hover:border-white/30' : 'bg-white border-[#141414]/10 hover:border-[#141414]')
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-[9px] font-mono uppercase tracking-widest ${state.currentTaskIndex === i ? 'opacity-50' : 'opacity-30'}`}>
                            Phase: {task.phase}
                          </span>
                          {task.status === 'completed' && <CheckCircle2 size={14} className="text-emerald-500" />}
                        </div>
                        <p className="text-sm font-bold leading-tight">{task.title}</p>
                        
                        {state.currentTaskIndex === i && (
                          <motion.div 
                            layoutId="active-indicator"
                            className={`absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 ${theme === 'dark' ? 'bg-black' : 'bg-[#141414]'}`}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Task Detail / Prompt Generator */}
                <div className="lg:col-span-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={state.currentTaskIndex}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className={`border border-[#141414] rounded-sm shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] flex flex-col h-full min-h-[600px] ${theme === 'dark' ? 'bg-[#1A1A1A]' : 'bg-white'}`}
                    >
                      <div className="p-8 flex-1">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="text-3xl font-bold tracking-tight mb-2">{state.tasks[state.currentTaskIndex].title}</h3>
                            <p className="text-sm opacity-70 max-w-2xl">{state.tasks[state.currentTaskIndex].description}</p>
                          </div>
                          <button 
                            onClick={() => toggleTaskStatus(state.currentTaskIndex)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-bold uppercase transition-all ${
                              state.tasks[state.currentTaskIndex].status === 'completed'
                                ? 'bg-emerald-500 text-white'
                                : (theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10')
                            }`}
                          >
                            {state.tasks[state.currentTaskIndex].status === 'completed' ? (
                              <><CheckCircle2 size={16} /> Completed</>
                            ) : (
                              'Mark as Done'
                            )}
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest opacity-50">
                            <ListChecks size={14} />
                            Generated Prompt
                          </div>
                          
                          <div className="relative group">
                            <div className={`p-6 rounded-sm font-mono text-sm leading-relaxed whitespace-pre-wrap min-h-[300px] border ${
                              theme === 'dark' ? 'bg-black text-[#E4E3E0] border-white/10' : 'bg-[#141414] text-[#E4E3E0] border-[#141414]'
                            }`}>
                              {state.tasks[state.currentTaskIndex].prompt}
                            </div>
                            <button 
                              onClick={() => copyToClipboard(state.tasks[state.currentTaskIndex].prompt)}
                              className={`absolute top-4 right-4 p-2 rounded-sm transition-colors flex items-center gap-2 text-[10px] font-bold uppercase ${
                                theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                              }`}
                            >
                              <Copy size={14} /> Copy Prompt
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className={`border-t p-6 flex justify-between items-center ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-[#141414] bg-black/5'}`}>
                        <div className="flex gap-2">
                          {state.tasks[state.currentTaskIndex].dependencies.length > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase opacity-40">Dependencies:</span>
                              {state.tasks[state.currentTaskIndex].dependencies.map(dep => (
                                <span key={dep} className={`text-[9px] px-1.5 py-0.5 rounded-sm font-mono ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'}`}>{dep}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-4">
                          <button 
                            disabled={state.currentTaskIndex === 0}
                            onClick={() => setState(prev => ({ ...prev, currentTaskIndex: prev.currentTaskIndex - 1 }))}
                            className="px-4 py-2 text-xs font-bold uppercase hover:underline disabled:opacity-30"
                          >
                            Previous
                          </button>
                          <button 
                            disabled={state.currentTaskIndex === state.tasks.length - 1}
                            onClick={() => setState(prev => ({ ...prev, currentTaskIndex: prev.currentTaskIndex + 1 }))}
                            className={`px-6 py-2 text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-30 ${
                              theme === 'dark' ? 'bg-white text-black hover:bg-white/90' : 'bg-[#141414] text-[#E4E3E0] hover:bg-[#2a2a2a]'
                            }`}
                          >
                            Next Task
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === 'standards' && (
            <motion.div
              key="standards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <RuleEditor 
                predefinedRules={RULES}
                theme={theme}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Info */}
      <footer className="mt-20 border-t border-[#141414] p-8 text-center">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-30">
          Guide Engine &copy; 2026 // Deterministic Planning // Generative Execution
        </p>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #141414;
          border-radius: 10px;
        }
      `}</style>
      <ChatBot 
        theme={theme} 
        projectContext={{ 
          docs: state.docs, 
          model: state.model, 
          tasks: state.tasks,
          activeTab,
          currentTaskIndex: state.currentTaskIndex,
          currentTask: state.tasks[state.currentTaskIndex]
        }} 
      />
    </div>
  );
}
