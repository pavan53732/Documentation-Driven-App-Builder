import React, { useState } from 'react';
import { Rule } from '../services/ruleEngine';
import { Plus, Trash2, Shield, Layout, GitBranch, AlertCircle, Sparkles, Database, Info, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RuleEditorProps {
  predefinedRules: Rule[];
  theme: 'light' | 'dark';
}

export const RuleEditor: React.FC<RuleEditorProps> = ({ predefinedRules, theme }) => {
  const [showPredefined, setShowPredefined] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRules = predefinedRules.filter(rule =>
    rule.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-serif italic text-4xl">Architectural Standards</h2>
          <p className="text-sm opacity-50 uppercase tracking-widest mt-2">45+ expert heuristics built into the engine</p>
        </div>
      </div>

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
              className={`w-full bg-transparent border-none focus:ring-0 text-sm ${theme === 'dark' ? 'text-white' : 'text-black'}`}
            />
          </div>
        </div>

        {/* Predefined Rules List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRules.map((rule) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={rule.id}
              className={`border border-[#141414] p-5 rounded-sm shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] ${theme === 'dark' ? 'bg-[#1A1A1A]' : 'bg-white'}`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-[8px] px-1.5 py-0.5 rounded-sm bg-emerald-500/20 text-emerald-500 uppercase font-bold">
                  {rule.category}
                </span>
                <span className={`text-[8px] font-bold uppercase ${rule.suggestion.impact === 'high' ? 'text-red-500' : rule.suggestion.impact === 'medium' ? 'text-amber-500' : 'text-slate-500'}`}>
                  {rule.suggestion.impact} Impact
                </span>
              </div>
              <h4 className="text-sm font-bold mb-2">{rule.description}</h4>
              <p className="text-[10px] opacity-60 leading-relaxed mb-4">{rule.suggestion.rationale}</p>

              <div className={`p-3 rounded-sm flex items-center gap-3 ${theme === 'dark' ? 'bg-black/40' : 'bg-black/5'}`}>
                <Sparkles size={14} className="text-emerald-500" />
                <div>
                  <p className="text-[10px] uppercase font-bold opacity-40">Heuristic Action</p>
                  <p className="text-xs font-mono">{rule.suggestion.action}</p>
                </div>
              </div>
            </motion.div>
          ))}
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
