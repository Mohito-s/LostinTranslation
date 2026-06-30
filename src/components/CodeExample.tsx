import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, Terminal, FileCode, Cpu } from 'lucide-react';

interface CodeExampleProps {
  apiKey?: string;
}

export default function CodeExample({ apiKey = 'your_api_key' }: CodeExampleProps) {
  const [selectedLang, setSelectedLang] = useState<'curl' | 'javascript' | 'python'>('curl');
  const [copied, setCopied] = useState(false);

  const SNIPPETS = {
    curl: `curl -X POST "${window.location.origin}/api/enhance" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey}" \\
  -d '{
    "prompt": "Translate the user feedback and extract emotion",
    "text": "行けたら行く"
  }'`,
    javascript: `const response = await fetch('${window.location.origin}/api/enhance', {
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

url = "${window.location.origin}/api/enhance"
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
    <div id="code-example-container" className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs">
      {/* Code Header Tab Selectors */}
      <div className="flex bg-slate-900 border-b border-slate-800 px-4 py-2 justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            id="btn-code-lang-curl"
            onClick={() => setSelectedLang('curl')}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition-all duration-200 font-medium ${
              selectedLang === 'curl' 
                ? 'bg-slate-800 text-emerald-400' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal size={12} />
            cURL
          </button>
          <button
            id="btn-code-lang-js"
            onClick={() => setSelectedLang('javascript')}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition-all duration-200 font-medium ${
              selectedLang === 'javascript' 
                ? 'bg-slate-800 text-emerald-400' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode size={12} />
            JavaScript
          </button>
          <button
            id="btn-code-lang-py"
            onClick={() => setSelectedLang('python')}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition-all duration-200 font-medium ${
              selectedLang === 'python' 
                ? 'bg-slate-800 text-emerald-400' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu size={12} />
            Python
          </button>
        </div>

        <button
          id="btn-copy-snippet"
          onClick={handleCopy}
          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors duration-200 flex items-center gap-1.5 focus:outline-none"
          title="Copy snippet"
        >
          {copied ? (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold font-sans">
              <Check size={12} /> Copied!
            </span>
          ) : (
            <Copy size={13} />
          )}
        </button>
      </div>

      {/* Code Snippet Box */}
      <div className="p-4 overflow-x-auto text-slate-300 leading-relaxed max-h-80 select-all whitespace-pre">
        <code>{SNIPPETS[selectedLang]}</code>
      </div>
    </div>
  );
}
