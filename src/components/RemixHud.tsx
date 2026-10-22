import React from 'react';
import { Terminal, ShieldCheck, Zap } from 'lucide-react';

interface RemixHudProps {
  className?: string;
  onOpenDemo?: () => void;
}

export const RemixHud: React.FC<RemixHudProps> = ({
  className = '',
  onOpenDemo,
}) => {
  return (
    <div
      className={`fixed bottom-5 left-5 z-40 hidden sm:flex items-center gap-3.5 px-4 py-2 rounded-full bg-[#0a0d14]/85 backdrop-blur-2xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-xs font-mono select-none transition-all hover:border-amber-500/40 ${className}`}
    >
      {/* Active Gateway Status LED */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_10px_#10b981]" />
        </span>
        <span className="font-bold text-white tracking-wider">LIT GATEWAY</span>
      </div>

      <span className="text-white/20">|</span>

      {/* Latency Metric */}
      <div className="flex items-center gap-1.5 text-slate-300">
        <Zap size={13} className="text-sky-400" />
        <span className="text-sky-300 font-semibold">&lt; 15ms</span>
      </div>

      <span className="text-white/20">|</span>

      {/* Meaning Preservation Metric */}
      <div className="flex items-center gap-1.5 text-slate-300">
        <ShieldCheck size={13} className="text-emerald-400" />
        <span className="text-emerald-300 font-semibold">100% Context</span>
      </div>

      {onOpenDemo && (
        <>
          <span className="text-white/20">|</span>
          <button
            onClick={onOpenDemo}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer group"
          >
            <Terminal size={12} className="text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span className="text-[11px] underline decoration-slate-600 hover:decoration-cyan-400">
              API SANDBOX
            </span>
          </button>
        </>
      )}
    </div>
  );
};

export default RemixHud;
