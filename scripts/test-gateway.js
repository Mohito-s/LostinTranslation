// scripts/test-gateway.js
const customArg = process.argv.slice(2).join(' ').trim();

const testPrompts = customArg
  ? [customArg]
  : [
      'Давай на дорожку присядем перед длинной дорогой и обдумаем всё без суеты.',
      'Ну в принципе неплохо, но нужно доработать авторизацию и защиту от атак.',
      'Напиши вежливый отказ клиенту, который просит скидку 90%.'
    ];

async function run() {
  console.log('\n🚀 LostInTranslation AI Gateway (http://localhost:3000/v1/chat/completions)\n');

  for (const prompt of testPrompts) {
    console.log('='.repeat(70));
    console.log('🇷🇺 ВХОДЯЩИЙ ПРОМПТ:\n  "' + prompt + '"');
    
    const startTime = Date.now();
    try {
      const res = await fetch('http://localhost:3000/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ltk_demokey12345'
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'user', content: prompt }
          ]
        })
      });

      const elapsed = Date.now() - startTime;
      const data = await res.json();

      if (data.lit_bridge) {
        console.log('\n🌉 LIT BRIDGE (Оптимизация смыслов и токенов):');
        console.log('  🇬🇧 Сжатый английский промпт: ' + data.lit_bridge.optimized_prompt.replace('\n', ' '));
        console.log('  📉 Сэкономлено токенов:        ' + data.lit_bridge.tokens_saved + ' (' + data.lit_bridge.saved_percent + '%)');
        if (data.lit_bridge.cultural_nuances && data.lit_bridge.cultural_nuances.length > 0) {
          console.log('  🎭 Сохранённые нюансы:         ' + data.lit_bridge.cultural_nuances.join('; '));
        }
      }

      console.log('\n🤖 ОТВЕТ НЕЙРОСЕТИ (' + elapsed + ' ms):');
      console.log('  ' + (data.choices && data.choices[0] ? data.choices[0].message.content : JSON.stringify(data)));
      console.log('='.repeat(70) + '\n');
    } catch (err) {
      console.error('Ошибка вызова шлюза LIT:', err.message);
    }
  }
}

run();
