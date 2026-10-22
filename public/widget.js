/**
 * LostInTranslation (LIT) — Embeddable Cultural QA Widget
 * Zero-dependency standalone script for embedding cultural loss analysis into any web page.
 * 
 * Usage:
 *   <div id="lit-widget" data-api-url="https://your-api-domain.com"></div>
 *   <script src="/widget.js" defer></script>
 */
(function () {
  'use strict';

  function initLitWidget() {
    const containers = document.querySelectorAll('#lit-widget, [data-lit-widget]');
    if (!containers.length) return;

    containers.forEach((container) => {
      if (container.dataset.litInitialized) return;
      container.dataset.litInitialized = 'true';

      const apiUrl = container.dataset.apiUrl || window.location.origin;
      const theme = container.dataset.theme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      const isDark = theme === 'dark';

      const shadow = container.attachShadow ? container.attachShadow({ mode: 'open' }) : container;

      const styles = `
        :host, .lit-widget-root {
          all: initial;
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          max-width: 580px;
          margin: 16px auto;
          box-sizing: border-box;
        }
        .lit-card {
          background: ${isDark ? '#0f172a' : '#ffffff'};
          color: ${isDark ? '#f8fafc' : '#0f172a'};
          border: 1px solid ${isDark ? '#334155' : '#e2e8f0'};
          border-radius: 14px;
          padding: 20px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }
        .lit-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .lit-title {
          font-size: 16px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          color: ${isDark ? '#a3e635' : '#65a30d'};
        }
        .lit-badge {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 9999px;
          background: ${isDark ? '#1e293b' : '#f1f5f9'};
          color: ${isDark ? '#94a3b8' : '#64748b'};
          border: 1px solid ${isDark ? '#334155' : '#cbd5e1'};
        }
        .lit-textarea {
          width: 100%;
          box-sizing: border-box;
          min-height: 80px;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid ${isDark ? '#334155' : '#cbd5e1'};
          background: ${isDark ? '#1e293b' : '#f8fafc'};
          color: inherit;
          font-size: 14px;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s;
        }
        .lit-textarea:focus {
          border-color: #84cc16;
        }
        .lit-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
        }
        .lit-btn {
          background: #84cc16;
          color: #0f172a;
          font-weight: 600;
          font-size: 13px;
          padding: 8px 18px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
        }
        .lit-btn:hover {
          background: #a3e635;
        }
        .lit-btn:active {
          transform: scale(0.98);
        }
        .lit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .lit-preset-chips {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .lit-chip {
          background: ${isDark ? '#1e293b' : '#f1f5f9'};
          color: ${isDark ? '#cbd5e1' : '#475569'};
          border: 1px solid ${isDark ? '#334155' : '#e2e8f0'};
          font-size: 11px;
          padding: 3px 8px;
          border-radius: 6px;
          cursor: pointer;
        }
        .lit-chip:hover {
          border-color: #84cc16;
        }
        .lit-result {
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px solid ${isDark ? '#334155' : '#e2e8f0'};
          font-size: 13px;
        }
        .lit-item {
          background: ${isDark ? '#1e293b' : '#f8fafc'};
          border-left: 3px solid #84cc16;
          border-radius: 0 6px 6px 0;
          padding: 10px;
          margin-top: 8px;
        }
        .lit-item-title {
          font-weight: 600;
          margin-bottom: 4px;
          color: ${isDark ? '#f8fafc' : '#0f172a'};
        }
        .lit-item-desc {
          color: ${isDark ? '#94a3b8' : '#64748b'};
          line-height: 1.4;
        }
        .lit-footer {
          margin-top: 12px;
          text-align: right;
          font-size: 11px;
          color: ${isDark ? '#64748b' : '#94a3b8'};
        }
        .lit-footer a {
          color: inherit;
          text-decoration: none;
        }
        .lit-footer a:hover {
          text-decoration: underline;
        }
      `;

      shadow.innerHTML = `
        <style>${styles}</style>
        <div class="lit-widget-root">
          <div class="lit-card">
            <div class="lit-header">
              <div class="lit-title">
                <span>🌐</span> LostInTranslation
              </div>
              <div class="lit-badge">Cultural QA Widget</div>
            </div>
            <textarea class="lit-textarea" placeholder="Enter text with cultural nuances to analyze (e.g. 行けたら行く, Jein, Да, но нет)..."></textarea>
            <div class="lit-controls">
              <div class="lit-preset-chips">
                <span class="lit-chip" data-sample="行けたら行く">🇯🇵 行けたら行く</span>
                <span class="lit-chip" data-sample="Jein">🇩🇪 Jein</span>
                <span class="lit-chip" data-sample="Да, но нет">🇷🇺 Да, но нет</span>
              </div>
              <button class="lit-btn">Analyze</button>
            </div>
            <div class="lit-result" style="display: none;"></div>
            <div class="lit-footer">
              Powered by <a href="https://github.com/Mohito-s/LostinTranslation" target="_blank" rel="noopener">LIT API</a>
            </div>
          </div>
        </div>
      `;

      const textarea = shadow.querySelector('.lit-textarea');
      const btn = shadow.querySelector('.lit-btn');
      const resultDiv = shadow.querySelector('.lit-result');
      const chips = shadow.querySelectorAll('.lit-chip');

      chips.forEach((chip) => {
        chip.addEventListener('click', () => {
          textarea.value = chip.dataset.sample;
          btn.click();
        });
      });

      btn.addEventListener('click', async () => {
        const text = textarea.value.trim();
        if (!text) return;

        btn.disabled = true;
        btn.textContent = 'Checking...';
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = '<div style="color: #84cc16;">Analyzing cultural nuances...</div>';

        try {
          const res = await fetch(`${apiUrl}/api/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, target_language: 'en' })
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Analysis failed' }));
            throw new Error(err.message || err.error || 'Server error');
          }

          const data = await res.json();
          let html = `<div><strong>Literal translation:</strong> ${data.literal_translation || 'N/A'}</div>`;

          if (data.items && data.items.length > 0) {
            html += `<div style="margin-top: 8px; font-weight: 600;">Detected Nuances (${data.items.length}):</div>`;
            data.items.forEach((item) => {
              html += `
                <div class="lit-item">
                  <div class="lit-item-title">${item.fragment || 'Nuance'} — ${item.short || ''}</div>
                  <div class="lit-item-desc">${item.explanation || ''}</div>
                  ${item.alternative ? `<div style="margin-top: 4px; font-size: 12px; color: #84cc16;"><strong>Alternative:</strong> ${item.alternative}</div>` : ''}
                </div>
              `;
            });
          } else {
            html += `<div style="margin-top: 8px; color: #84cc16;">✓ No critical cultural meaning loss detected. Meaning preserved!</div>`;
          }

          resultDiv.innerHTML = html;
        } catch (err) {
          resultDiv.innerHTML = `<div style="color: #ef4444;">Error: ${err.message}</div>`;
        } finally {
          btn.disabled = false;
          btn.textContent = 'Analyze';
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLitWidget);
  } else {
    initLitWidget();
  }
})();
