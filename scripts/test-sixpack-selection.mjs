// Execute the actual JSX event handlers with a minimal hook/storage harness.
// This covers selection processing; native OS pickers still need a device test.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';
import { transformWithEsbuild } from 'vite';

const file = new URL('../6pack/SelfiesScreen.jsx', import.meta.url);
const source = (await readFile(file, 'utf8')).replace('import.meta.env.VITE_API_BASE', "''");
const { code } = await transformWithEsbuild(source, file.pathname, { loader: 'jsx', format: 'cjs', jsxFactory: 'h' });
function harness({ online = true, quota = false } = {}) {
  const states = [], stored = new Map(), requests = [];
  const react = {
    useState(initial) {
      const i = states.length;
      states.push(typeof initial === 'function' ? initial() : initial);
      return [states[i], value => { states[i] = typeof value === 'function' ? value(states[i]) : value; }];
    },
    useRef: current => ({ current }), useEffect() {},
  };
  class Reader {
    readAsDataURL(file) {
      file.arrayBuffer().then(bytes => { this.result = `data:${file.type};base64,${Buffer.from(bytes).toString('base64')}`; this.onload(); });
    }
  }
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module, exports: module.exports, require: name => name === 'react' ? react : { default: () => null },
    h: (type, props, ...children) => ({ type, props, children }),
    window: { localStorage: { getItem: key => stored.get(key), setItem: (key, value) => { if (quota) throw Error('quota'); stored.set(key, value); } } },
    FileReader: Reader, File, FormData, AbortSignal, crypto: webcrypto, atob,
    fetch: async (url, options) => {
      if (!online) throw Error('offline');
      requests.push({ url, options });
      return { ok: true, json: async () => options?.method === 'POST' ? { ok: true } : { ok: true, photos: [] } };
    },
  });
  const tree = module.exports.default({ uid: 'alice', onBack() {} });
  function inputs(node) {
    if (!node || typeof node !== 'object') return [];
    return [...(node.type === 'input' ? [node] : []), ...(node.children || []).flat(Infinity).flatMap(inputs)];
  }
  return { inputs: inputs(tree), states, stored, requests };
}
const png = name => new File(['image'], name, { type: 'image/png' });
const online = harness();
assert.equal(online.inputs.length, 2);
assert.equal(online.inputs[0].props.capture, 'environment');
assert.equal(online.inputs[1].props.capture, undefined);
assert.equal(online.inputs[1].props.multiple, true);
const target = { files: [png('one.png'), png('two.png'), png('invalid.txt')], value: 'selected' };
await online.inputs[1].props.onChange({ target });
assert.equal(target.value, '', 'same file can be selected again');
const uploads = online.requests.filter(r => r.options?.method === 'POST');
assert.equal(uploads.length, 2);
assert(uploads.every(r => r.options.headers['x-fitness-uid'] === 'alice'));
assert.notEqual(uploads[0].options.body.get('id'), uploads[1].options.body.get('id'));
assert.equal(online.states[5].length, 3);
assert.match(online.states[5][2].message, /Nicht gespeichert/);
const offline = harness({ online: false });
await offline.inputs[1].props.onChange({ target: { files: [png('one.png'), png('two.png')] } });
const queue = JSON.parse(offline.stored.get('fitness-sixpack-selfies-pending-v2:alice'));
assert.equal(queue.length, 2);
assert.deepEqual(queue.map(p => p.name), ['one.png', 'two.png']);
const full = harness({ online: false, quota: true });
await full.inputs[1].props.onChange({ target: { files: [png('one.png')] } });
assert.match(full.states[5][0].message, /Browserspeicher voll/);
assert.equal(full.states[3], false, 'picker unlocks after failure');
console.log('Photo selection: camera/gallery controls, multi-upload, invalid files, UID queue and storage failure passed.');
