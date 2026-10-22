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
      className="frosted-card hover:border-sky-400/40 rounded-xl p-4 transition-all duration-300 shadow-sm group cursor-pointer bg-white/[0.03] backdrop-blur-xl border border-white/10"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="mt-1 p-2 bg-rose-500/15 text-rose-300 rounded-lg shrink-0 border border-rose-500/30">
            <AlertCircle size={18} />
          </div>
          <div>
            <span className="inline-block font-mono text-sm px-2.5 py-0.5 bg-black/40 text-sky-300 rounded-md border border-sky-400/30 font-semibold mb-1.5 shadow-sm">
              "{item.fragment}"
            </span>
            <p className="text-white font-medium leading-relaxed font-sans">
              {item.short}
            </p>
          </div>
        </div>
        <button 
          id={`btn-expand-${item.fragment.replace(/\s+/g, '-').toLowerCase()}`}
          className="p-1.5 text-slate-400 hover:text-sky-300 hover:bg-white/[0.05] rounded-lg transition-colors duration-200 focus:outline-none"
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          <ChevronDown 
            size={18} 
            className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180 text-sky-400' : ''}`} 
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
            <div className="pt-4 mt-3 border-t border-white/10 flex flex-col gap-3 text-sm">
              <div className="flex gap-2.5 items-start bg-black/40 p-3.5 rounded-xl border border-white/10">
                <BookOpen size={16} className="text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-sans font-bold text-sky-300 uppercase tracking-wider mb-1">
                    § Глубокий культурный анализ:
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-[13px] font-sans">
                    {item.explanation}
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/20">
                <Sparkles size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-sans font-bold text-emerald-400 uppercase tracking-wider mb-1">
                    § Рекомендуемый эквивалент в контексте:
                  </h4>
                  <p className="text-emerald-200 font-medium leading-relaxed text-[13px] font-sans">
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
