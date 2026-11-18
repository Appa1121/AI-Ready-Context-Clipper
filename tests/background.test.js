import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../src/background.js', import.meta.url), 'utf8');

test('worker registers wakeup listeners before configuration and configures the toolbar', async () => {
  const order = [];
  const listeners = {};
  const context = {
    chrome: {
      runtime: {
        onInstalled: { addListener: (fn) => { order.push('installed'); listeners.install = fn; } },
        onStartup: { addListener: (fn) => { order.push('startup'); listeners.start = fn; } },
      },
      sidePanel: { setPanelBehavior: async (options) => {
        order.push('configure');
        assert.equal(options.openPanelOnActionClick, true);
      } },
    },
    console: { error: () => assert.fail('Unexpected configuration error') },
  };
  vm.runInNewContext(source, context);
  assert.deepEqual(order, ['installed', 'startup', 'configure']);
  await listeners.install();
  await listeners.start();
  assert.equal(order.filter((entry) => entry === 'configure').length, 3);
});

test('configuration rejection is handled without logging raw API errors', async () => {
  const logs = [];
  let installed;
  vm.runInNewContext(source, {
    chrome: {
      runtime: { onInstalled: { addListener: (fn) => { installed = fn; } }, onStartup: { addListener() {} } },
      sidePanel: { setPanelBehavior: async () => { throw new Error('SENSITIVE_SYNTHETIC_DATA'); } },
    },
    console: { error: (message) => logs.push(message) },
  });
  await installed();
  assert.ok(logs.length >= 1);
  assert.ok(logs.every((message) => !message.includes('SENSITIVE_SYNTHETIC_DATA')));
});
