import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, AlertCircle, Sparkles, BookOpen } from 'lucide-react';
import { LossItem } from '../lib/analyze';

interface LossCardProps {
  item: LossItem;
  key?: React.Key;
}

export default function LossCard({ item }: LossCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      id={`loss-card-${item.fragment.replace(/\s+/g, '-').toLowerCase()}`}
      className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-4 transition-all duration-300 shadow-md hover:shadow-slate-950/40 group cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="mt-1 p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
            <AlertCircle size={18} />
          </div>
          <div>
            <span className="inline-block font-mono text-sm px-2 py-0.5 bg-slate-900 text-emerald-300 rounded border border-emerald-500/20 font-bold mb-1.5">
              "{item.fragment}"
            </span>
            <p className="text-slate-200 font-medium leading-relaxed">
              {item.short}
            </p>
          </div>
        </div>
        <button 
          id={`btn-expand-${item.fragment.replace(/\s+/g, '-').toLowerCase()}`}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 rounded-lg transition-colors duration-200 focus:outline-none"
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          <ChevronDown 
            size={18} 
            className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180 text-emerald-400' : ''}`} 
          />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-3 border-t border-slate-700/50 flex flex-col gap-4 text-sm">
              <div className="flex gap-2.5 items-start bg-slate-900/40 p-3 rounded-lg border border-slate-700/30">
                <BookOpen size={16} className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Глубокий культурный анализ:
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-[13px]">
                    {item.explanation}
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10">
                <Sparkles size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                    Рекомендуемый эквивалент в контексте:
                  </h4>
                  <p className="text-emerald-300 font-medium leading-relaxed text-[13px]">
                    {item.alternative}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
