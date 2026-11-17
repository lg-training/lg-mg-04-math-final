// Pruebas de comprobación de versiones: node scripts/test_refresh.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('site/refresh.js', 'utf8');

async function run({ published, protocol = 'https:', hidden = false, fail = false }) {
  const calls = [];
  const events = {};
  let interval;
  const context = {
    location: { protocol, href: 'https://example.com/repo/?tema=fracciones', replace: url => calls.push(['replace', url]) },
    document: {
      hidden,
      querySelector: () => ({ content: 'aaaaaaaaaaaa' }),
      addEventListener: (name, handler) => { events[name] = handler; }
    },
    window: { addEventListener: (name, handler) => { events[name] = handler; } },
    fetch: async (url, options) => {
      calls.push(['fetch', url, options.cache]);
      if (fail) throw new Error('offline');
      return { ok: true, json: async () => ({ version: published }) };
    },
    URL,
    setInterval: handler => { interval = handler; }
  };
  vm.runInNewContext(source, context);
  await new Promise(resolve => setImmediate(resolve));
  return { calls, events, interval, context };
}

(async () => {
  const same = await run({ published: 'aaaaaaaaaaaa' });
  assert.equal(same.calls.length, 1);
  assert.equal(same.calls[0][2], 'no-store');
  const changed = await run({ published: 'bbbbbbbbbbbb' });
  const target = new URL(changed.calls.find(call => call[0] === 'replace')[1]);
  assert.equal(target.searchParams.get('v'), 'bbbbbbbbbbbb');
  assert.equal(target.searchParams.get('tema'), 'fracciones');
  const offline = await run({ fail: true });
  assert.equal(offline.calls.length, 1);
  assert.ok(offline.interval);
  const local = await run({ protocol: 'file:' });
  assert.equal(local.calls.length, 0);
  const background = await run({ published: 'bbbbbbbbbbbb', hidden: true });
  assert.equal(background.calls.length, 0);
  background.context.document.hidden = false;
  background.events.visibilitychange();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(background.calls[1][0], 'replace');
  console.log('Pruebas de actualización de versión correctas.');
})().catch(error => { console.error(error); process.exitCode = 1; });
