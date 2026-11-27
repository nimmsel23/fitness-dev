import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isEdgeBackGesture } from './useEdgeBack.js';
const start = {x:20,y:100,edge:20};
test('right swipe from edge returns; vertical, left, short and interior gestures do not', () => {
  assert(isEdgeBackGesture(start,{clientX:120,clientY:110}));
  assert(!isEdgeBackGesture(start,{clientX:120,clientY:180}));
  assert(!isEdgeBackGesture(start,{clientX:50,clientY:100}));
  assert(!isEdgeBackGesture(start,{clientX:0,clientY:100}));
  assert(!isEdgeBackGesture({...start,edge:100},{clientX:120,clientY:100}));
  assert(!isEdgeBackGesture(null,{clientX:120,clientY:100}));
});

test('mounted handlers return only for an eligible edge swipe; cancel, controls and runners block it', async () => {
  const { readFileSync } = await import('node:fs');
  const vm = await import('node:vm');
  const handlers = {}, events = {};
  let blocked = false, backs = 0, cleanup;
  const element = {addEventListener:(name,fn)=>handlers[name]=fn,removeEventListener:name=>delete handlers[name],getBoundingClientRect:()=>({left:0}),querySelector:()=>blocked};
  const scope = { useRef:value=>({current:value===null?element:value}),useEffect:fn=>cleanup=fn(),window:{addEventListener:(name,fn)=>events[name]=fn,removeEventListener:name=>delete events[name]} };
  vm.createContext(scope);
  const source=readFileSync(new URL('./useEdgeBack.js',import.meta.url),'utf8').replace(/^import.*\n/,'').replaceAll('export function','function');
  vm.runInContext(source+'\nthis.mount=useEdgeBack;',scope);
  scope.mount(()=>backs++);
  const begin = (interactive=false) => handlers.touchstart({touches:[{clientX:20,clientY:100}],target:{closest:()=>interactive}});
  const end = () => handlers.touchend({changedTouches:[{clientX:130,clientY:100}],cancelable:true,preventDefault(){}});
  begin(); end(); assert.equal(backs,1);
  begin(true); end(); assert.equal(backs,1);
  begin(); handlers.touchcancel(); end(); assert.equal(backs,1);
  blocked=true; begin(); end(); blocked=false; assert.equal(backs,1);
  events['skills-runner']({detail:true}); begin(); end(); assert.equal(backs,1);
  events['skills-runner']({detail:false}); begin(); end(); assert.equal(backs,2);
  cleanup(); assert.equal(Object.keys(handlers).length,0);
});
