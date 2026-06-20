import { i as importShared } from './_virtual___federation_fn_import-Btk8q8lZ.js';
import { j as jsxRuntimeExports } from './jsx-runtime-CsM3lTE3.js';

const remotesMap = {
'journal':{url:'http://localhost:9171/dist-federation/assets/remoteEntry.js',format:'esm',from:'vite'}
};
                const currentImports = {};

                function get(name, remoteFrom) {
                    return __federation_import(name).then(module => () => {
                        return module
                    })
                }
                
                function merge(obj1, obj2) {
                  const mergedObj = Object.assign(obj1, obj2);
                  for (const key of Object.keys(mergedObj)) {
                    if (typeof mergedObj[key] === 'object' && typeof obj2[key] === 'object') {
                      mergedObj[key] = merge(mergedObj[key], obj2[key]);
                    }
                  }
                  return mergedObj;
                }

                const wrapShareModule = remoteFrom => {
                  return merge({
                    'react':{'18.3.1':{get:()=>get(new URL('__federation_shared_react-C3Pr5fKJ.js', import.meta.url).href), loaded:1}},'react-dom':{'18.3.1':{get:()=>get(new URL('__federation_shared_react-dom-B8R2bLh_.js', import.meta.url).href), loaded:1}},'lucide-react':{'0.453.0':{get:()=>get(new URL('__federation_shared_lucide-react-DLjU49Eq.js', import.meta.url).href), loaded:1}}
                  }, (globalThis.__federation_shared__ || {})['default'] || {});
                };

                async function __federation_import(name) {
                    currentImports[name] ??= import(name);
                    return currentImports[name]
                }

                async function __federation_method_ensure(remoteId) {
                    const remote = remotesMap[remoteId];
                    if (!remote.inited) {
                        if (['esm', 'systemjs'].includes(remote.format)) {
                            // loading js with import(...)
                            return new Promise((resolve, reject) => {
                                const getUrl = () => Promise.resolve(remote.url);
                                getUrl().then(url => {
                                    import(/* @vite-ignore */ url).then(lib => {
                                        if (!remote.inited) {
                                            const shareScope = wrapShareModule();
                                            lib.init(shareScope);
                                            remote.lib = lib;
                                            remote.lib.init(shareScope);
                                            remote.inited = true;
                                        }
                                        resolve(remote.lib);
                                    }).catch(reject);
                                });
                            })
                        }
                    } else {
                        return remote.lib;
                    }
                }

                function __federation_method_wrapDefault(module, need) {
                    if (!module?.default && need) {
                        let obj = Object.create(null);
                        obj.default = module;
                        obj.__esModule = true;
                        return obj;
                    }
                    return module;
                }

                function __federation_method_getRemote(remoteName, componentName) {
                    return __federation_method_ensure(remoteName).then((remote) => remote.get(componentName).then(factory => factory()));
                }

const React = await importShared('react');

const JournalApp = React.lazy(() => __federation_method_getRemote("journal" , "./JournalApp").then(module=>__federation_method_wrapDefault(module, true)));
function JournalTab() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: "100%", display: "flex", flexDirection: "column" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(React.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
    fontSize: 13
  }, children: "Journal lädt…" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(JournalApp, {}) }) });
}

export { JournalTab as default };
