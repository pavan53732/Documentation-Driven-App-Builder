import React, { useState } from 'react';
import { Rule } from '../services/ruleEngine';
import { Plus, Trash2, Shield, Layout, GitBranch, AlertCircle, Sparkles, Database, Info, ChevronDown, ChevronUp, Search, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RuleEditorProps {
  predefinedRules: Rule[];
  customRules: any[];
  onAddCustomRule: (rule: any) => void;
  onRemoveCustomRule: (index: number) => void;
  theme: 'light' | 'dark';
}

export const RuleEditor: React.FC<RuleEditorProps> = ({ predefinedRules, customRules, onAddCustomRule, onRemoveCustomRule, theme }) => {
  const [showPredefined, setShowPredefined] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newRule, setNewRule] = useState({
    description: '',
    category: 'custom',
    suggestion: { action: '', rationale: '', impact: 'medium' }
  });

  const filteredRules = [...predefinedRules, ...customRules].filter(rule => 
    rule.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddRule = () => {
    if (!newRule.description || !newRule.suggestion.action) return;
    
    const ruleToAdd = {
      id: `custom-rule-${Date.now()}`,
      category: newRule.category,
      description: newRule.description,
      trigger: { type: "global" },
      condition: () => true, // Custom rules always trigger for now, or we could make it more complex
      suggestion: {
        action: newRule.suggestion.action,
        description: newRule.description,
        impact: newRule.suggestion.impact,
        rationale: newRule.suggestion.rationale
      }
    };
    
    onAddCustomRule(ruleToAdd);
    setIsAdding(false);
    setNewRule({ description: '', category: 'custom', suggestion: { action: '', rationale: '', impact: 'medium' } });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-serif italic text-4xl">Architectural Standards</h2>
          <p className="text-sm opacity-50 uppercase tracking-widest mt-2">100+ expert heuristics built into the engine</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors border border-[#141414] ${
            theme === 'dark' ? 'bg-white text-black hover:bg-white/90' : 'bg-[#141414] text-[#E4E3E0] hover:bg-[#2a2a2a]'
          }`}
        >
          {isAdding ? <X size={14} /> : <Plus size={14} />}
          {isAdding ? 'Cancel' : 'Add Custom Rule'}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className={`p-6 border border-[#141414] rounded-sm shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] space-y-4 mb-8 ${theme === 'dark' ? 'bg-[#1A1A1A]' : 'bg-white'}`}>
              <h3 className="text-sm font-bold uppercase tracking-widest border-b border-[#141414]/20 pb-2">New Custom Heuristic</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase opacity-50">Rule Description</label>
                  <input 
                    type="text" 
                    value={newRule.description}
                    onChange={e => setNewRule({...newRule, description: e.target.value})}
                    placeholder="e.g., All buttons must have aria-labels"
                    className={`w-full p-2 text-sm border border-[#141414] rounded-sm bg-transparent`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase opacity-50">Category</label>
                  <input 
                    type="text" 
                    value={newRule.category}
                    onChange={e => setNewRule({...newRule, category: e.target.value})}
                    placeholder="e.g., accessibility"
                    className={`w-full p-2 text-sm border border-[#141414] rounded-sm bg-transparent`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase opacity-50">Suggested Action</label>
                  <input 
                    type="text" 
                    value={newRule.suggestion.action}
                    onChange={e => setNewRule({...newRule, suggestion: {...newRule.suggestion, action: e.target.value}})}
                    placeholder="e.g., Add aria-label attribute"
                    className={`w-full p-2 text-sm border border-[#141414] rounded-sm bg-transparent`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase opacity-50">Rationale</label>
                  <input 
                    type="text" 
                    value={newRule.suggestion.rationale}
                    onChange={e => setNewRule({...newRule, suggestion: {...newRule.suggestion, rationale: e.target.value}})}
                    placeholder="e.g., Improves screen reader support"
                    className={`w-full p-2 text-sm border border-[#141414] rounded-sm bg-transparent`}
                  />
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleAddRule}
                  disabled={!newRule.description || !newRule.suggestion.action}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors border border-[#141414] disabled:opacity-50 ${
                    theme === 'dark' ? 'bg-white text-black hover:bg-white/90' : 'bg-[#141414] text-[#E4E3E0] hover:bg-[#2a2a2a]'
                  }`}
                >
                  <Save size={14} />
                  Save Rule
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {/* Search and Filter */}
        <div className={`p-4 border border-[#141414] rounded-sm shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] ${theme === 'dark' ? 'bg-[#1A1A1A]' : 'bg-white'}`}>
          <div className="flex items-center gap-3">
            <Search size={18} className="opacity-40" />
            <input 
              type="text"
              placeholder="Search heuristics (e.g., 'accessibility', 'security', 'icons')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-transparent border-none focus:ring-0 text-sm outline-none ${theme === 'dark' ? 'text-white' : 'text-black'}`}
            />
          </div>
        </div>

        {/* Rules List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRules.map((rule, index) => {
            const isCustom = rule.id?.startsWith('custom-rule');
            return (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={rule.id || index}
                className={`border border-[#141414] p-5 rounded-sm shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] relative group ${theme === 'dark' ? 'bg-[#1A1A1A]' : 'bg-white'}`}
              >
                {isCustom && (
                  <button
                    onClick={() => onRemoveCustomRule(customRules.findIndex(r => r.id === rule.id))}
                    className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 rounded-sm hover:bg-black/5 dark:hover:bg-white/10"
                    title="Remove custom rule"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <div className="flex justify-between items-start mb-3 pr-6">
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-sm uppercase font-bold ${isCustom ? 'bg-purple-500/20 text-purple-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                    {rule.category}
                  </span>
                  <span className={`text-[8px] font-bold uppercase ${rule.suggestion.impact === 'high' ? 'text-red-500' : rule.suggestion.impact === 'medium' ? 'text-amber-500' : 'text-slate-500'}`}>
                    {rule.suggestion.impact} Impact
                  </span>
                </div>
                <h4 className="text-sm font-bold mb-2">{rule.description}</h4>
                <p className="text-[10px] opacity-60 leading-relaxed mb-4">{rule.suggestion.rationale}</p>
                
                <div className={`p-3 rounded-sm flex items-center gap-3 ${theme === 'dark' ? 'bg-black/40' : 'bg-black/5'}`}>
                  <Sparkles size={14} className={isCustom ? "text-purple-500" : "text-emerald-500"} />
                  <div>
                    <p className="text-[10px] uppercase font-bold opacity-40">Heuristic Action</p>
                    <p className="text-xs font-mono">{rule.suggestion.action}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredRules.length === 0 && (
          <div className="py-20 text-center border border-dashed border-[#141414] opacity-30 rounded-sm">
            <AlertCircle size={32} className="mx-auto mb-2" />
            <p className="text-xs uppercase font-bold tracking-widest">No matching heuristics found</p>
          </div>
        )}
      </div>
    </div>
  );
};
