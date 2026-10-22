import React, { useState } from 'react';
import { Copy, Check, Terminal, FileCode, Cpu } from 'lucide-react';

interface CodeExampleProps {
  apiKey?: string;
}

export default function CodeExample({ apiKey = 'your_api_key' }: CodeExampleProps) {
  const [selectedLang, setSelectedLang] = useState<'curl' | 'javascript' | 'python'>('curl');
  const [copied, setCopied] = useState(false);

  const SNIPPETS = {
    curl: `curl -X POST "${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api/enhance" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey}" \\
  -d '{
    "prompt": "Translate the user feedback and extract emotion",
    "text": "行けたら行く"
  }'`,
    javascript: `const response = await fetch('${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api/enhance', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${apiKey}'
  },
  body: JSON.stringify({
    prompt: "Translate the user feedback and extract emotion",
    text: "行けたら行く"
  })
});

const data = await response.json();
console.log(data.enhanced_prompt);
// Now pass 'data.enhanced_prompt' directly as the prompt to your target LLM!
`,
    python: `import requests

url = "${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api/enhance"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "${apiKey}"
}
payload = {
    "prompt": "Translate the user feedback and extract emotion",
    "text": "行けたら行く"
}

response = requests.post(url, json=payload, headers=headers)
result = response.json()

enhanced_prompt = result["enhanced_prompt"]
# Send enhanced_prompt directly to your downstream LLM API (OpenAI/Anthropic/Gemini)!
print(enhanced_prompt)
`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(SNIPPETS[selectedLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="code-example-container" className="frosted-card bg-black/60 border border-white/10 rounded-xl overflow-hidden font-mono text-xs shadow-xl">
      {/* Code Header Tab Selectors */}
      <div className="flex bg-white/[0.04] border-b border-white/10 px-4 py-2 justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500/80" />
            <span className="w-2 h-2 rounded-full bg-amber-400/80" />
            <span className="w-2 h-2 rounded-full bg-emerald-400/80" />
          </span>
          <span className="h-4 w-px bg-white/10" />
        </div>
        <div className="flex items-center gap-1.5">
          <button
            id="btn-code-lang-curl"
            onClick={() => setSelectedLang('curl')}
            className={`flex items-center gap-1.5 py-1 px-3 rounded-lg text-xs font-mono transition-all duration-200 cursor-pointer ${
              selectedLang === 'curl' 
                ? 'bg-white/10 text-white font-semibold border border-white/20 shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal size={12} className={selectedLang === 'curl' ? 'text-sky-400' : ''} />
            cURL
          </button>
          <button
            id="btn-code-lang-js"
            onClick={() => setSelectedLang('javascript')}
            className={`flex items-center gap-1.5 py-1 px-3 rounded-lg text-xs font-mono transition-all duration-200 cursor-pointer ${
              selectedLang === 'javascript' 
                ? 'bg-white/10 text-white font-semibold border border-white/20 shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode size={12} className={selectedLang === 'javascript' ? 'text-sky-400' : ''} />
            JavaScript
          </button>
          <button
            id="btn-code-lang-py"
            onClick={() => setSelectedLang('python')}
            className={`flex items-center gap-1.5 py-1 px-3 rounded-lg text-xs font-mono transition-all duration-200 cursor-pointer ${
              selectedLang === 'python' 
                ? 'bg-white/10 text-white font-semibold border border-white/20 shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu size={12} className={selectedLang === 'python' ? 'text-sky-400' : ''} />
            Python
          </button>
        </div>

        <button
          id="btn-copy-snippet"
          onClick={handleCopy}
          className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors duration-200 flex items-center gap-1.5 focus:outline-none cursor-pointer"
          title="Copy snippet"
        >
          {copied ? (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold font-mono">
              <Check size={12} className="text-emerald-400" /> Copied!
            </span>
          ) : (
            <Copy size={13} />
          )}
        </button>
      </div>

      {/* Code Snippet Box */}
      <div className="p-4 overflow-x-auto text-sky-200/90 leading-relaxed max-h-80 select-all whitespace-pre bg-black/50">
        <code>{SNIPPETS[selectedLang]}</code>
      </div>
    </div>
  );
}
