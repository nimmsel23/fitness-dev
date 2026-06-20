const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/DashboardView-rnhmqfp9.js","assets/index-BzNiIj6f.js","assets/icons-DjGXUYl7.js","assets/charts-C9RY6oLa.js","assets/index-S1cz4_05.css","assets/ui-BIZXkLFb.js","assets/bundle-mjs-DoZyl-80.js","assets/pencil--5zqRlIQ.js","assets/activity-C2crfnyR.js","assets/FoodView-vG6xitjK.js","assets/useMutation-CI6wvz0C.js","assets/FoodSearch-COOX9yTf.js","assets/sparkles-BYcMi3p_.js","assets/CalendarView-pyxcj0R3.js","assets/JournalView-CK2ALaTo.js","assets/SupplementsView-Dq6IXz1Z.js","assets/MicrosView-Ca95SJY1.js","assets/SettingsView-C4UAvTsw.js"])))=>i.map(i=>d[i]);
var Nd=n=>{throw TypeError(n)};var Yc=(n,e,t)=>e.has(n)||Nd("Cannot "+t);var v=(n,e,t)=>(Yc(n,e,"read from private field"),t?t.call(n):e.get(n)),H=(n,e,t)=>e.has(n)?Nd("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(n):e.set(n,t),j=(n,e,t,r)=>(Yc(n,e,"write to private field"),r?r.call(n,t):e.set(n,t),t),J=(n,e,t)=>(Yc(n,e,"access private method"),t);var Bo=(n,e,t,r)=>({set _(s){j(n,e,s,t)},get _(){return v(n,e,r)}});import{j as Ke,_ as Vn}from"./index-BzNiIj6f.js";import{r as de,d as jo}from"./icons-DjGXUYl7.js";var Ha=class{constructor(){this.listeners=new Set,this.subscribe=this.subscribe.bind(this)}subscribe(e){return this.listeners.add(e),this.onSubscribe(),()=>{this.listeners.delete(e),this.onUnsubscribe()}}hasListeners(){return this.listeners.size>0}onSubscribe(){}onUnsubscribe(){}},er,un,Kr,mp,sI=(mp=class extends Ha{constructor(){super();H(this,er);H(this,un);H(this,Kr);j(this,Kr,t=>{if(typeof window<"u"&&window.addEventListener){const r=()=>t();return window.addEventListener("visibilitychange",r,!1),()=>{window.removeEventListener("visibilitychange",r)}}})}onSubscribe(){v(this,un)||this.setEventListener(v(this,Kr))}onUnsubscribe(){var t;this.hasListeners()||((t=v(this,un))==null||t.call(this),j(this,un,void 0))}setEventListener(t){var r;j(this,Kr,t),(r=v(this,un))==null||r.call(this),j(this,un,t(s=>{typeof s=="boolean"?this.setFocused(s):this.onFocus()}))}setFocused(t){v(this,er)!==t&&(j(this,er,t),this.onFocus())}onFocus(){const t=this.isFocused();this.listeners.forEach(r=>{r(t)})}isFocused(){var t;return typeof v(this,er)=="boolean"?v(this,er):((t=globalThis.document)==null?void 0:t.visibilityState)!=="hidden"}},er=new WeakMap,un=new WeakMap,Kr=new WeakMap,mp),Pp=new sI,iI={setTimeout:(n,e)=>setTimeout(n,e),clearTimeout:n=>clearTimeout(n),setInterval:(n,e)=>setInterval(n,e),clearInterval:n=>clearInterval(n)},ln,fl,pp,oI=(pp=class{constructor(){H(this,ln,iI);H(this,fl,!1)}setTimeoutProvider(e){j(this,ln,e)}setTimeout(e,t){return v(this,ln).setTimeout(e,t)}clearTimeout(e){v(this,ln).clearTimeout(e)}setInterval(e,t){return v(this,ln).setInterval(e,t)}clearInterval(e){v(this,ln).clearInterval(e)}},ln=new WeakMap,fl=new WeakMap,pp),fu=new oI;function aI(n){setTimeout(n,0)}var cI=typeof window>"u"||"Deno"in globalThis;function lt(){}function uI(n,e){return typeof n=="function"?n(e):n}function lI(n){return typeof n=="number"&&n>=0&&n!==1/0}function hI(n,e){return Math.max(n+(e||0)-Date.now(),0)}function mu(n,e){return typeof n=="function"?n(e):n}function dI(n,e){return typeof n=="function"?n(e):n}function Md(n,e){const{type:t="all",exact:r,fetchStatus:s,predicate:i,queryKey:o,stale:c}=n;if(o){if(r){if(e.queryHash!==pl(o,e.options))return!1}else if(!xi(e.queryKey,o))return!1}if(t!=="all"){const u=e.isActive();if(t==="active"&&!u||t==="inactive"&&u)return!1}return!(typeof c=="boolean"&&e.isStale()!==c||s&&s!==e.state.fetchStatus||i&&!i(e))}function Fd(n,e){const{exact:t,status:r,predicate:s,mutationKey:i}=n;if(i){if(!e.options.mutationKey)return!1;if(t){if(Oi(e.options.mutationKey)!==Oi(i))return!1}else if(!xi(e.options.mutationKey,i))return!1}return!(r&&e.state.status!==r||s&&!s(e))}function pl(n,e){return((e==null?void 0:e.queryKeyHashFn)||Oi)(n)}function Oi(n){return JSON.stringify(n,(e,t)=>pu(t)?Object.keys(t).sort().reduce((r,s)=>(r[s]=t[s],r),{}):t)}function xi(n,e){return n===e?!0:typeof n!=typeof e?!1:n&&e&&typeof n=="object"&&typeof e=="object"?Object.keys(e).every(t=>xi(n[t],e[t])):!1}var fI=Object.prototype.hasOwnProperty;function Rp(n,e,t=0){if(n===e)return n;if(t>500)return e;const r=Ld(n)&&Ld(e);if(!r&&!(pu(n)&&pu(e)))return e;const i=(r?n:Object.keys(n)).length,o=r?e:Object.keys(e),c=o.length,u=r?new Array(c):{};let h=0;for(let f=0;f<c;f++){const m=r?f:o[f],p=n[m],w=e[m];if(p===w){u[m]=p,(r?f<i:fI.call(n,m))&&h++;continue}if(p===null||w===null||typeof p!="object"||typeof w!="object"){u[m]=w;continue}const C=Rp(p,w,t+1);u[m]=C,C===p&&h++}return i===c&&h===i?n:u}function Ld(n){return Array.isArray(n)&&n.length===Object.keys(n).length}function pu(n){if(!Ud(n))return!1;const e=n.constructor;if(e===void 0)return!0;const t=e.prototype;return!(!Ud(t)||!t.hasOwnProperty("isPrototypeOf")||Object.getPrototypeOf(n)!==Object.prototype)}function Ud(n){return Object.prototype.toString.call(n)==="[object Object]"}function mI(n){return new Promise(e=>{fu.setTimeout(e,n)})}function pI(n,e,t){return typeof t.structuralSharing=="function"?t.structuralSharing(n,e):t.structuralSharing!==!1?Rp(n,e):e}function gI(n,e,t=0){const r=[...n,e];return t&&r.length>t?r.slice(1):r}function _I(n,e,t=0){const r=[e,...n];return t&&r.length>t?r.slice(0,-1):r}var gl=Symbol();function Cp(n,e){return!n.queryFn&&(e!=null&&e.initialPromise)?()=>e.initialPromise:!n.queryFn||n.queryFn===gl?()=>Promise.reject(new Error(`Missing queryFn: '${n.queryHash}'`)):n.queryFn}function yI(n,e,t){let r=!1,s;return Object.defineProperty(n,"signal",{enumerable:!0,get:()=>(s??(s=e()),r||(r=!0,s.aborted?t():s.addEventListener("abort",t,{once:!0})),s)}),n}var Dp=(()=>{let n=()=>cI;return{isServer(){return n()},setIsServer(e){n=e}}})();function vI(){let n,e;const t=new Promise((s,i)=>{n=s,e=i});t.status="pending",t.catch(()=>{});function r(s){Object.assign(t,s),delete t.resolve,delete t.reject}return t.resolve=s=>{r({status:"fulfilled",value:s}),n(s)},t.reject=s=>{r({status:"rejected",reason:s}),e(s)},t}var II=aI;function wI(){let n=[],e=0,t=c=>{c()},r=c=>{c()},s=II;const i=c=>{e?n.push(c):s(()=>{t(c)})},o=()=>{const c=n;n=[],c.length&&s(()=>{r(()=>{c.forEach(u=>{t(u)})})})};return{batch:c=>{let u;e++;try{u=c()}finally{e--,e||o()}return u},batchCalls:c=>(...u)=>{i(()=>{c(...u)})},schedule:i,setNotifyFunction:c=>{t=c},setBatchNotifyFunction:c=>{r=c},setScheduler:c=>{s=c}}}var qe=wI(),Qr,hn,Yr,gp,EI=(gp=class extends Ha{constructor(){super();H(this,Qr,!0);H(this,hn);H(this,Yr);j(this,Yr,t=>{if(typeof window<"u"&&window.addEventListener){const r=()=>t(!0),s=()=>t(!1);return window.addEventListener("online",r,!1),window.addEventListener("offline",s,!1),()=>{window.removeEventListener("online",r),window.removeEventListener("offline",s)}}})}onSubscribe(){v(this,hn)||this.setEventListener(v(this,Yr))}onUnsubscribe(){var t;this.hasListeners()||((t=v(this,hn))==null||t.call(this),j(this,hn,void 0))}setEventListener(t){var r;j(this,Yr,t),(r=v(this,hn))==null||r.call(this),j(this,hn,t(this.setOnline.bind(this)))}setOnline(t){v(this,Qr)!==t&&(j(this,Qr,t),this.listeners.forEach(s=>{s(t)}))}isOnline(){return v(this,Qr)}},Qr=new WeakMap,hn=new WeakMap,Yr=new WeakMap,gp),ga=new EI;function TI(n){return Math.min(1e3*2**n,3e4)}function kp(n){return(n??"online")==="online"?ga.isOnline():!0}var gu=class extends Error{constructor(n){super("CancelledError"),this.revert=n==null?void 0:n.revert,this.silent=n==null?void 0:n.silent}};function Vp(n){let e=!1,t=0,r;const s=vI(),i=()=>s.status!=="pending",o=D=>{var P;if(!i()){const F=new gu(D);p(F),(P=n.onCancel)==null||P.call(n,F)}},c=()=>{e=!0},u=()=>{e=!1},h=()=>Pp.isFocused()&&(n.networkMode==="always"||ga.isOnline())&&n.canRun(),f=()=>kp(n.networkMode)&&n.canRun(),m=D=>{i()||(r==null||r(),s.resolve(D))},p=D=>{i()||(r==null||r(),s.reject(D))},w=()=>new Promise(D=>{var P;r=F=>{(i()||h())&&D(F)},(P=n.onPause)==null||P.call(n)}).then(()=>{var D;r=void 0,i()||(D=n.onContinue)==null||D.call(n)}),C=()=>{if(i())return;let D;const P=t===0?n.initialPromise:void 0;try{D=P??n.fn()}catch(F){D=Promise.reject(F)}Promise.resolve(D).then(m).catch(F=>{var W;if(i())return;const L=n.retry??(Dp.isServer()?0:3),O=n.retryDelay??TI,U=typeof O=="function"?O(t,F):O,N=L===!0||typeof L=="number"&&t<L||typeof L=="function"&&L(t,F);if(e||!N){p(F);return}t++,(W=n.onFail)==null||W.call(n,t,F),mI(U).then(()=>h()?void 0:w()).then(()=>{e?p(F):C()})})};return{promise:s,status:()=>s.status,cancel:o,continue:()=>(r==null||r(),s),cancelRetry:c,continueRetry:u,canStart:f,start:()=>(f()?C():w().then(C),s)}}var tr,_p,Op=(_p=class{constructor(){H(this,tr)}destroy(){this.clearGcTimeout()}scheduleGc(){this.clearGcTimeout(),lI(this.gcTime)&&j(this,tr,fu.setTimeout(()=>{this.optionalRemove()},this.gcTime))}updateGcTime(n){this.gcTime=Math.max(this.gcTime||0,n??(Dp.isServer()?1/0:5*60*1e3))}clearGcTimeout(){v(this,tr)!==void 0&&(fu.clearTimeout(v(this,tr)),j(this,tr,void 0))}},tr=new WeakMap,_p);function bI(n){return{onFetch:(e,t)=>{var f,m,p,w,C;const r=e.options,s=(p=(m=(f=e.fetchOptions)==null?void 0:f.meta)==null?void 0:m.fetchMore)==null?void 0:p.direction,i=((w=e.state.data)==null?void 0:w.pages)||[],o=((C=e.state.data)==null?void 0:C.pageParams)||[];let c={pages:[],pageParams:[]},u=0;const h=async()=>{let D=!1;const P=O=>{yI(O,()=>e.signal,()=>D=!0)},F=Cp(e.options,e.fetchOptions),L=async(O,U,N)=>{if(D)return Promise.reject(e.signal.reason);if(U==null&&O.pages.length)return Promise.resolve(O);const T=(()=>{const b={client:e.client,queryKey:e.queryKey,pageParam:U,direction:N?"backward":"forward",meta:e.options.meta};return P(b),b})(),_=await F(T),{maxPages:y}=e.options,E=N?_I:gI;return{pages:E(O.pages,_,y),pageParams:E(O.pageParams,U,y)}};if(s&&i.length){const O=s==="backward",U=O?AI:Bd,N={pages:i,pageParams:o},W=U(r,N);c=await L(N,W,O)}else{const O=n??i.length;do{const U=u===0?o[0]??r.initialPageParam:Bd(r,c);if(u>0&&U==null)break;c=await L(c,U),u++}while(u<O)}return c};e.options.persister?e.fetchFn=()=>{var D,P;return(P=(D=e.options).persister)==null?void 0:P.call(D,h,{client:e.client,queryKey:e.queryKey,meta:e.options.meta,signal:e.signal},t)}:e.fetchFn=h}}}function Bd(n,{pages:e,pageParams:t}){const r=e.length-1;return e.length>0?n.getNextPageParam(e[r],e,t[r],t):void 0}function AI(n,{pages:e,pageParams:t}){var r;return e.length>0?(r=n.getPreviousPageParam)==null?void 0:r.call(n,e[0],e,t[0],t):void 0}var Xr,nr,Jr,ot,rr,Pe,ro,sr,Ze,xp,Nt,yp,SI=(yp=class extends Op{constructor(t){super();H(this,Ze);H(this,Xr);H(this,nr);H(this,Jr);H(this,ot);H(this,rr);H(this,Pe);H(this,ro);H(this,sr);j(this,sr,!1),j(this,ro,t.defaultOptions),this.setOptions(t.options),this.observers=[],j(this,rr,t.client),j(this,ot,v(this,rr).getQueryCache()),this.queryKey=t.queryKey,this.queryHash=t.queryHash,j(this,nr,$d(this.options)),this.state=t.state??v(this,nr),this.scheduleGc()}get meta(){return this.options.meta}get queryType(){return v(this,Xr)}get promise(){var t;return(t=v(this,Pe))==null?void 0:t.promise}setOptions(t){if(this.options={...v(this,ro),...t},t!=null&&t._type&&j(this,Xr,t._type),this.updateGcTime(this.options.gcTime),this.state&&this.state.data===void 0){const r=$d(this.options);r.data!==void 0&&(this.setState(jd(r.data,r.dataUpdatedAt)),j(this,nr,r))}}optionalRemove(){!this.observers.length&&this.state.fetchStatus==="idle"&&v(this,ot).remove(this)}setData(t,r){const s=pI(this.state.data,t,this.options);return J(this,Ze,Nt).call(this,{data:s,type:"success",dataUpdatedAt:r==null?void 0:r.updatedAt,manual:r==null?void 0:r.manual}),s}setState(t){J(this,Ze,Nt).call(this,{type:"setState",state:t})}cancel(t){var s,i;const r=(s=v(this,Pe))==null?void 0:s.promise;return(i=v(this,Pe))==null||i.cancel(t),r?r.then(lt).catch(lt):Promise.resolve()}destroy(){super.destroy(),this.cancel({silent:!0})}get resetState(){return v(this,nr)}reset(){this.destroy(),this.setState(this.resetState)}isActive(){return this.observers.some(t=>dI(t.options.enabled,this)!==!1)}isDisabled(){return this.getObserversCount()>0?!this.isActive():this.options.queryFn===gl||!this.isFetched()}isFetched(){return this.state.dataUpdateCount+this.state.errorUpdateCount>0}isStatic(){return this.getObserversCount()>0?this.observers.some(t=>mu(t.options.staleTime,this)==="static"):!1}isStale(){return this.getObserversCount()>0?this.observers.some(t=>t.getCurrentResult().isStale):this.state.data===void 0||this.state.isInvalidated}isStaleByTime(t=0){return this.state.data===void 0?!0:t==="static"?!1:this.state.isInvalidated?!0:!hI(this.state.dataUpdatedAt,t)}onFocus(){var r;const t=this.observers.find(s=>s.shouldFetchOnWindowFocus());t==null||t.refetch({cancelRefetch:!1}),(r=v(this,Pe))==null||r.continue()}onOnline(){var r;const t=this.observers.find(s=>s.shouldFetchOnReconnect());t==null||t.refetch({cancelRefetch:!1}),(r=v(this,Pe))==null||r.continue()}addObserver(t){this.observers.includes(t)||(this.observers.push(t),this.clearGcTimeout(),v(this,ot).notify({type:"observerAdded",query:this,observer:t}))}removeObserver(t){this.observers.includes(t)&&(this.observers=this.observers.filter(r=>r!==t),this.observers.length||(v(this,Pe)&&(v(this,sr)||J(this,Ze,xp).call(this)?v(this,Pe).cancel({revert:!0}):v(this,Pe).cancelRetry()),this.scheduleGc()),v(this,ot).notify({type:"observerRemoved",query:this,observer:t}))}getObserversCount(){return this.observers.length}invalidate(){this.state.isInvalidated||J(this,Ze,Nt).call(this,{type:"invalidate"})}async fetch(t,r){var f,m,p,w,C,D,P,F,L,O,U;if(this.state.fetchStatus!=="idle"&&((f=v(this,Pe))==null?void 0:f.status())!=="rejected"){if(this.state.data!==void 0&&(r!=null&&r.cancelRefetch))this.cancel({silent:!0});else if(v(this,Pe))return v(this,Pe).continueRetry(),v(this,Pe).promise}if(t&&this.setOptions(t),!this.options.queryFn){const N=this.observers.find(W=>W.options.queryFn);N&&this.setOptions(N.options)}const s=new AbortController,i=N=>{Object.defineProperty(N,"signal",{enumerable:!0,get:()=>(j(this,sr,!0),s.signal)})},o=()=>{const N=Cp(this.options,r),T=(()=>{const _={client:v(this,rr),queryKey:this.queryKey,meta:this.meta};return i(_),_})();return j(this,sr,!1),this.options.persister?this.options.persister(N,T,this):N(T)},u=(()=>{const N={fetchOptions:r,options:this.options,queryKey:this.queryKey,client:v(this,rr),state:this.state,fetchFn:o};return i(N),N})(),h=v(this,Xr)==="infinite"?bI(this.options.pages):this.options.behavior;h==null||h.onFetch(u,this),j(this,Jr,this.state),(this.state.fetchStatus==="idle"||this.state.fetchMeta!==((m=u.fetchOptions)==null?void 0:m.meta))&&J(this,Ze,Nt).call(this,{type:"fetch",meta:(p=u.fetchOptions)==null?void 0:p.meta}),j(this,Pe,Vp({initialPromise:r==null?void 0:r.initialPromise,fn:u.fetchFn,onCancel:N=>{N instanceof gu&&N.revert&&this.setState({...v(this,Jr),fetchStatus:"idle"}),s.abort()},onFail:(N,W)=>{J(this,Ze,Nt).call(this,{type:"failed",failureCount:N,error:W})},onPause:()=>{J(this,Ze,Nt).call(this,{type:"pause"})},onContinue:()=>{J(this,Ze,Nt).call(this,{type:"continue"})},retry:u.options.retry,retryDelay:u.options.retryDelay,networkMode:u.options.networkMode,canRun:()=>!0}));try{const N=await v(this,Pe).start();if(N===void 0)throw new Error(`${this.queryHash} data is undefined`);return this.setData(N),(C=(w=v(this,ot).config).onSuccess)==null||C.call(w,N,this),(P=(D=v(this,ot).config).onSettled)==null||P.call(D,N,this.state.error,this),N}catch(N){if(N instanceof gu){if(N.silent)return v(this,Pe).promise;if(N.revert){if(this.state.data===void 0)throw N;return this.state.data}}throw J(this,Ze,Nt).call(this,{type:"error",error:N}),(L=(F=v(this,ot).config).onError)==null||L.call(F,N,this),(U=(O=v(this,ot).config).onSettled)==null||U.call(O,this.state.data,N,this),N}finally{this.scheduleGc()}}},Xr=new WeakMap,nr=new WeakMap,Jr=new WeakMap,ot=new WeakMap,rr=new WeakMap,Pe=new WeakMap,ro=new WeakMap,sr=new WeakMap,Ze=new WeakSet,xp=function(){return this.state.fetchStatus==="paused"&&this.state.status==="pending"},Nt=function(t){const r=s=>{switch(t.type){case"failed":return{...s,fetchFailureCount:t.failureCount,fetchFailureReason:t.error};case"pause":return{...s,fetchStatus:"paused"};case"continue":return{...s,fetchStatus:"fetching"};case"fetch":return{...s,...PI(s.data,this.options),fetchMeta:t.meta??null};case"success":const i={...s,...jd(t.data,t.dataUpdatedAt),dataUpdateCount:s.dataUpdateCount+1,...!t.manual&&{fetchStatus:"idle",fetchFailureCount:0,fetchFailureReason:null}};return j(this,Jr,t.manual?i:void 0),i;case"error":const o=t.error;return{...s,error:o,errorUpdateCount:s.errorUpdateCount+1,errorUpdatedAt:Date.now(),fetchFailureCount:s.fetchFailureCount+1,fetchFailureReason:o,fetchStatus:"idle",status:"error",isInvalidated:!0};case"invalidate":return{...s,isInvalidated:!0};case"setState":return{...s,...t.state}}};this.state=r(this.state),qe.batch(()=>{this.observers.forEach(s=>{s.onQueryUpdate()}),v(this,ot).notify({query:this,type:"updated",action:t})})},yp);function PI(n,e){return{fetchFailureCount:0,fetchFailureReason:null,fetchStatus:kp(e.networkMode)?"fetching":"paused",...n===void 0&&{error:null,status:"pending"}}}function jd(n,e){return{data:n,dataUpdatedAt:e??Date.now(),error:null,isInvalidated:!1,status:"success"}}function $d(n){const e=typeof n.initialData=="function"?n.initialData():n.initialData,t=e!==void 0,r=t?typeof n.initialDataUpdatedAt=="function"?n.initialDataUpdatedAt():n.initialDataUpdatedAt:0;return{data:e,dataUpdateCount:0,dataUpdatedAt:t?r??Date.now():0,error:null,errorUpdateCount:0,errorUpdatedAt:0,fetchFailureCount:0,fetchFailureReason:null,fetchMeta:null,isInvalidated:!1,status:t?"success":"pending",fetchStatus:"idle"}}var so,wt,Fe,ir,Et,rn,vp,RI=(vp=class extends Op{constructor(t){super();H(this,Et);H(this,so);H(this,wt);H(this,Fe);H(this,ir);j(this,so,t.client),this.mutationId=t.mutationId,j(this,Fe,t.mutationCache),j(this,wt,[]),this.state=t.state||CI(),this.setOptions(t.options),this.scheduleGc()}setOptions(t){this.options=t,this.updateGcTime(this.options.gcTime)}get meta(){return this.options.meta}addObserver(t){v(this,wt).includes(t)||(v(this,wt).push(t),this.clearGcTimeout(),v(this,Fe).notify({type:"observerAdded",mutation:this,observer:t}))}removeObserver(t){j(this,wt,v(this,wt).filter(r=>r!==t)),this.scheduleGc(),v(this,Fe).notify({type:"observerRemoved",mutation:this,observer:t})}optionalRemove(){v(this,wt).length||(this.state.status==="pending"?this.scheduleGc():v(this,Fe).remove(this))}continue(){var t;return((t=v(this,ir))==null?void 0:t.continue())??this.execute(this.state.variables)}async execute(t){var c,u,h,f,m,p,w,C,D,P,F,L,O,U,N,W,T,_;const r=()=>{J(this,Et,rn).call(this,{type:"continue"})},s={client:v(this,so),meta:this.options.meta,mutationKey:this.options.mutationKey};j(this,ir,Vp({fn:()=>this.options.mutationFn?this.options.mutationFn(t,s):Promise.reject(new Error("No mutationFn found")),onFail:(y,E)=>{J(this,Et,rn).call(this,{type:"failed",failureCount:y,error:E})},onPause:()=>{J(this,Et,rn).call(this,{type:"pause"})},onContinue:r,retry:this.options.retry??0,retryDelay:this.options.retryDelay,networkMode:this.options.networkMode,canRun:()=>v(this,Fe).canRun(this)}));const i=this.state.status==="pending",o=!v(this,ir).canStart();try{if(i)r();else{J(this,Et,rn).call(this,{type:"pending",variables:t,isPaused:o}),v(this,Fe).config.onMutate&&await v(this,Fe).config.onMutate(t,this,s);const E=await((u=(c=this.options).onMutate)==null?void 0:u.call(c,t,s));E!==this.state.context&&J(this,Et,rn).call(this,{type:"pending",context:E,variables:t,isPaused:o})}const y=await v(this,ir).start();return await((f=(h=v(this,Fe).config).onSuccess)==null?void 0:f.call(h,y,t,this.state.context,this,s)),await((p=(m=this.options).onSuccess)==null?void 0:p.call(m,y,t,this.state.context,s)),await((C=(w=v(this,Fe).config).onSettled)==null?void 0:C.call(w,y,null,this.state.variables,this.state.context,this,s)),await((P=(D=this.options).onSettled)==null?void 0:P.call(D,y,null,t,this.state.context,s)),J(this,Et,rn).call(this,{type:"success",data:y}),y}catch(y){try{await((L=(F=v(this,Fe).config).onError)==null?void 0:L.call(F,y,t,this.state.context,this,s))}catch(E){Promise.reject(E)}try{await((U=(O=this.options).onError)==null?void 0:U.call(O,y,t,this.state.context,s))}catch(E){Promise.reject(E)}try{await((W=(N=v(this,Fe).config).onSettled)==null?void 0:W.call(N,void 0,y,this.state.variables,this.state.context,this,s))}catch(E){Promise.reject(E)}try{await((_=(T=this.options).onSettled)==null?void 0:_.call(T,void 0,y,t,this.state.context,s))}catch(E){Promise.reject(E)}throw J(this,Et,rn).call(this,{type:"error",error:y}),y}finally{v(this,Fe).runNext(this)}}},so=new WeakMap,wt=new WeakMap,Fe=new WeakMap,ir=new WeakMap,Et=new WeakSet,rn=function(t){const r=s=>{switch(t.type){case"failed":return{...s,failureCount:t.failureCount,failureReason:t.error};case"pause":return{...s,isPaused:!0};case"continue":return{...s,isPaused:!1};case"pending":return{...s,context:t.context,data:void 0,failureCount:0,failureReason:null,error:null,isPaused:t.isPaused,status:"pending",variables:t.variables,submittedAt:Date.now()};case"success":return{...s,data:t.data,failureCount:0,failureReason:null,error:null,status:"success",isPaused:!1};case"error":return{...s,data:void 0,error:t.error,failureCount:s.failureCount+1,failureReason:t.error,isPaused:!1,status:"error"}}};this.state=r(this.state),qe.batch(()=>{v(this,wt).forEach(s=>{s.onMutationUpdate(t)}),v(this,Fe).notify({mutation:this,type:"updated",action:t})})},vp);function CI(){return{context:void 0,data:void 0,error:null,failureCount:0,failureReason:null,isPaused:!1,status:"idle",variables:void 0,submittedAt:0}}var Mt,ht,io,Ip,DI=(Ip=class extends Ha{constructor(e={}){super();H(this,Mt);H(this,ht);H(this,io);this.config=e,j(this,Mt,new Set),j(this,ht,new Map),j(this,io,0)}build(e,t,r){const s=new RI({client:e,mutationCache:this,mutationId:++Bo(this,io)._,options:e.defaultMutationOptions(t),state:r});return this.add(s),s}add(e){v(this,Mt).add(e);const t=$o(e);if(typeof t=="string"){const r=v(this,ht).get(t);r?r.push(e):v(this,ht).set(t,[e])}this.notify({type:"added",mutation:e})}remove(e){if(v(this,Mt).delete(e)){const t=$o(e);if(typeof t=="string"){const r=v(this,ht).get(t);if(r)if(r.length>1){const s=r.indexOf(e);s!==-1&&r.splice(s,1)}else r[0]===e&&v(this,ht).delete(t)}}this.notify({type:"removed",mutation:e})}canRun(e){const t=$o(e);if(typeof t=="string"){const r=v(this,ht).get(t),s=r==null?void 0:r.find(i=>i.state.status==="pending");return!s||s===e}else return!0}runNext(e){var r;const t=$o(e);if(typeof t=="string"){const s=(r=v(this,ht).get(t))==null?void 0:r.find(i=>i!==e&&i.state.isPaused);return(s==null?void 0:s.continue())??Promise.resolve()}else return Promise.resolve()}clear(){qe.batch(()=>{v(this,Mt).forEach(e=>{this.notify({type:"removed",mutation:e})}),v(this,Mt).clear(),v(this,ht).clear()})}getAll(){return Array.from(v(this,Mt))}find(e){const t={exact:!0,...e};return this.getAll().find(r=>Fd(t,r))}findAll(e={}){return this.getAll().filter(t=>Fd(e,t))}notify(e){qe.batch(()=>{this.listeners.forEach(t=>{t(e)})})}resumePausedMutations(){const e=this.getAll().filter(t=>t.state.isPaused);return qe.batch(()=>Promise.all(e.map(t=>t.continue().catch(lt))))}},Mt=new WeakMap,ht=new WeakMap,io=new WeakMap,Ip);function $o(n){var e;return(e=n.options.scope)==null?void 0:e.id}var Tt,wp,kI=(wp=class extends Ha{constructor(e={}){super();H(this,Tt);this.config=e,j(this,Tt,new Map)}build(e,t,r){const s=t.queryKey,i=t.queryHash??pl(s,t);let o=this.get(i);return o||(o=new SI({client:e,queryKey:s,queryHash:i,options:e.defaultQueryOptions(t),state:r,defaultOptions:e.getQueryDefaults(s)}),this.add(o)),o}add(e){v(this,Tt).has(e.queryHash)||(v(this,Tt).set(e.queryHash,e),this.notify({type:"added",query:e}))}remove(e){const t=v(this,Tt).get(e.queryHash);t&&(e.destroy(),t===e&&v(this,Tt).delete(e.queryHash),this.notify({type:"removed",query:e}))}clear(){qe.batch(()=>{this.getAll().forEach(e=>{this.remove(e)})})}get(e){return v(this,Tt).get(e)}getAll(){return[...v(this,Tt).values()]}find(e){const t={exact:!0,...e};return this.getAll().find(r=>Md(t,r))}findAll(e={}){const t=this.getAll();return Object.keys(e).length>0?t.filter(r=>Md(e,r)):t}notify(e){qe.batch(()=>{this.listeners.forEach(t=>{t(e)})})}onFocus(){qe.batch(()=>{this.getAll().forEach(e=>{e.onFocus()})})}onOnline(){qe.batch(()=>{this.getAll().forEach(e=>{e.onOnline()})})}},Tt=new WeakMap,wp),ve,dn,fn,Zr,es,mn,ts,ns,Ep,VI=(Ep=class{constructor(n={}){H(this,ve);H(this,dn);H(this,fn);H(this,Zr);H(this,es);H(this,mn);H(this,ts);H(this,ns);j(this,ve,n.queryCache||new kI),j(this,dn,n.mutationCache||new DI),j(this,fn,n.defaultOptions||{}),j(this,Zr,new Map),j(this,es,new Map),j(this,mn,0)}mount(){Bo(this,mn)._++,v(this,mn)===1&&(j(this,ts,Pp.subscribe(async n=>{n&&(await this.resumePausedMutations(),v(this,ve).onFocus())})),j(this,ns,ga.subscribe(async n=>{n&&(await this.resumePausedMutations(),v(this,ve).onOnline())})))}unmount(){var n,e;Bo(this,mn)._--,v(this,mn)===0&&((n=v(this,ts))==null||n.call(this),j(this,ts,void 0),(e=v(this,ns))==null||e.call(this),j(this,ns,void 0))}isFetching(n){return v(this,ve).findAll({...n,fetchStatus:"fetching"}).length}isMutating(n){return v(this,dn).findAll({...n,status:"pending"}).length}getQueryData(n){var t;const e=this.defaultQueryOptions({queryKey:n});return(t=v(this,ve).get(e.queryHash))==null?void 0:t.state.data}ensureQueryData(n){const e=this.defaultQueryOptions(n),t=v(this,ve).build(this,e),r=t.state.data;return r===void 0?this.fetchQuery(n):(n.revalidateIfStale&&t.isStaleByTime(mu(e.staleTime,t))&&this.prefetchQuery(e),Promise.resolve(r))}getQueriesData(n){return v(this,ve).findAll(n).map(({queryKey:e,state:t})=>{const r=t.data;return[e,r]})}setQueryData(n,e,t){const r=this.defaultQueryOptions({queryKey:n}),s=v(this,ve).get(r.queryHash),i=s==null?void 0:s.state.data,o=uI(e,i);if(o!==void 0)return v(this,ve).build(this,r).setData(o,{...t,manual:!0})}setQueriesData(n,e,t){return qe.batch(()=>v(this,ve).findAll(n).map(({queryKey:r})=>[r,this.setQueryData(r,e,t)]))}getQueryState(n){var t;const e=this.defaultQueryOptions({queryKey:n});return(t=v(this,ve).get(e.queryHash))==null?void 0:t.state}removeQueries(n){const e=v(this,ve);qe.batch(()=>{e.findAll(n).forEach(t=>{e.remove(t)})})}resetQueries(n,e){const t=v(this,ve);return qe.batch(()=>(t.findAll(n).forEach(r=>{r.reset()}),this.refetchQueries({type:"active",...n},e)))}cancelQueries(n,e={}){const t={revert:!0,...e},r=qe.batch(()=>v(this,ve).findAll(n).map(s=>s.cancel(t)));return Promise.all(r).then(lt).catch(lt)}invalidateQueries(n,e={}){return qe.batch(()=>(v(this,ve).findAll(n).forEach(t=>{t.invalidate()}),(n==null?void 0:n.refetchType)==="none"?Promise.resolve():this.refetchQueries({...n,type:(n==null?void 0:n.refetchType)??(n==null?void 0:n.type)??"active"},e)))}refetchQueries(n,e={}){const t={...e,cancelRefetch:e.cancelRefetch??!0},r=qe.batch(()=>v(this,ve).findAll(n).filter(s=>!s.isDisabled()&&!s.isStatic()).map(s=>{let i=s.fetch(void 0,t);return t.throwOnError||(i=i.catch(lt)),s.state.fetchStatus==="paused"?Promise.resolve():i}));return Promise.all(r).then(lt)}fetchQuery(n){const e=this.defaultQueryOptions(n);e.retry===void 0&&(e.retry=!1);const t=v(this,ve).build(this,e);return t.isStaleByTime(mu(e.staleTime,t))?t.fetch(e):Promise.resolve(t.state.data)}prefetchQuery(n){return this.fetchQuery(n).then(lt).catch(lt)}fetchInfiniteQuery(n){return n._type="infinite",this.fetchQuery(n)}prefetchInfiniteQuery(n){return this.fetchInfiniteQuery(n).then(lt).catch(lt)}ensureInfiniteQueryData(n){return n._type="infinite",this.ensureQueryData(n)}resumePausedMutations(){return ga.isOnline()?v(this,dn).resumePausedMutations():Promise.resolve()}getQueryCache(){return v(this,ve)}getMutationCache(){return v(this,dn)}getDefaultOptions(){return v(this,fn)}setDefaultOptions(n){j(this,fn,n)}setQueryDefaults(n,e){v(this,Zr).set(Oi(n),{queryKey:n,defaultOptions:e})}getQueryDefaults(n){const e=[...v(this,Zr).values()],t={};return e.forEach(r=>{xi(n,r.queryKey)&&Object.assign(t,r.defaultOptions)}),t}setMutationDefaults(n,e){v(this,es).set(Oi(n),{mutationKey:n,defaultOptions:e})}getMutationDefaults(n){const e=[...v(this,es).values()],t={};return e.forEach(r=>{xi(n,r.mutationKey)&&Object.assign(t,r.defaultOptions)}),t}defaultQueryOptions(n){if(n._defaulted)return n;const e={...v(this,fn).queries,...this.getQueryDefaults(n.queryKey),...n,_defaulted:!0};return e.queryHash||(e.queryHash=pl(e.queryKey,e)),e.refetchOnReconnect===void 0&&(e.refetchOnReconnect=e.networkMode!=="always"),e.throwOnError===void 0&&(e.throwOnError=!!e.suspense),!e.networkMode&&e.persister&&(e.networkMode="offlineFirst"),e.queryFn===gl&&(e.enabled=!1),e}defaultMutationOptions(n){return n!=null&&n._defaulted?n:{...v(this,fn).mutations,...(n==null?void 0:n.mutationKey)&&this.getMutationDefaults(n.mutationKey),...n,_defaulted:!0}}clear(){v(this,ve).clear(),v(this,dn).clear()}},ve=new WeakMap,dn=new WeakMap,fn=new WeakMap,Zr=new WeakMap,es=new WeakMap,mn=new WeakMap,ts=new WeakMap,ns=new WeakMap,Ep),OI=de.createContext(void 0),xI=({client:n,children:e})=>(de.useEffect(()=>(n.mount(),()=>{n.unmount()}),[n]),Ke.jsx(OI.Provider,{value:n,children:e}));const qd=n=>{let e;const t=new Set,r=(h,f)=>{const m=typeof h=="function"?h(e):h;if(!Object.is(m,e)){const p=e;e=f??(typeof m!="object"||m===null)?m:Object.assign({},e,m),t.forEach(w=>w(e,p))}},s=()=>e,c={setState:r,getState:s,getInitialState:()=>u,subscribe:h=>(t.add(h),()=>t.delete(h))},u=e=n(r,s,c);return c},NI=n=>n?qd(n):qd,MI=n=>n;function FI(n,e=MI){const t=jo.useSyncExternalStore(n.subscribe,jo.useCallback(()=>e(n.getState()),[n,e]),jo.useCallback(()=>e(n.getInitialState()),[n,e]));return jo.useDebugValue(t),t}const zd=n=>{const e=NI(n),t=r=>FI(e,r);return Object.assign(t,e),t},Np=n=>n?zd(n):zd;function LI(n,e){let t;try{t=n()}catch{return}return{getItem:s=>{var i;const o=u=>u===null?null:JSON.parse(u,void 0),c=(i=t.getItem(s))!=null?i:null;return c instanceof Promise?c.then(o):o(c)},setItem:(s,i)=>t.setItem(s,JSON.stringify(i,void 0)),removeItem:s=>t.removeItem(s)}}const _u=n=>e=>{try{const t=n(e);return t instanceof Promise?t:{then(r){return _u(r)(t)},catch(r){return this}}}catch(t){return{then(r){return this},catch(r){return _u(r)(t)}}}},UI=(n,e)=>(t,r,s)=>{let i={storage:LI(()=>window.localStorage),partialize:P=>P,version:0,merge:(P,F)=>({...F,...P}),...e},o=!1,c=0;const u=new Set,h=new Set;let f=i.storage;if(!f)return n((...P)=>{console.warn(`[zustand persist middleware] Unable to update item '${i.name}', the given storage is currently unavailable.`),t(...P)},r,s);const m=()=>{const P=i.partialize({...r()});return f.setItem(i.name,{state:P,version:i.version})},p=s.setState;s.setState=(P,F)=>(p(P,F),m());const w=n((...P)=>(t(...P),m()),r,s);s.getInitialState=()=>w;let C;const D=()=>{var P,F;if(!f)return;const L=++c;o=!1,u.forEach(U=>{var N;return U((N=r())!=null?N:w)});const O=((F=i.onRehydrateStorage)==null?void 0:F.call(i,(P=r())!=null?P:w))||void 0;return _u(f.getItem.bind(f))(i.name).then(U=>{if(U)if(typeof U.version=="number"&&U.version!==i.version){if(i.migrate){const N=i.migrate(U.state,U.version);return N instanceof Promise?N.then(W=>[!0,W]):[!0,N]}console.error("State loaded from storage couldn't be migrated since no migrate function was provided")}else return[!1,U.state];return[!1,void 0]}).then(U=>{var N;if(L!==c)return;const[W,T]=U;if(C=i.merge(T,(N=r())!=null?N:w),t(C,!0),W)return m()}).then(()=>{L===c&&(O==null||O(r(),void 0),C=r(),o=!0,h.forEach(U=>U(C)))}).catch(U=>{L===c&&(O==null||O(void 0,U))})};return s.persist={setOptions:P=>{i={...i,...P},P.storage&&(f=P.storage)},clearStorage:()=>{f==null||f.removeItem(i.name)},getOptions:()=>i,rehydrate:()=>D(),hasHydrated:()=>o,onHydrate:P=>(u.add(P),()=>{u.delete(P)}),onFinishHydration:P=>(h.add(P),()=>{h.delete(P)})},i.skipHydration||D(),C||w},BI=UI,Mp=6048e5,jI=864e5,CC=6e4,DC=36e5,Wd=Symbol.for("constructDateFrom");function Pn(n,e){return typeof n=="function"?n(e):n&&typeof n=="object"&&Wd in n?n[Wd](e):n instanceof Date?new n.constructor(e):new Date(e)}function yt(n,e){return Pn(e||n,n)}let $I={};function Ga(){return $I}function Ni(n,e){var c,u,h,f;const t=Ga(),r=(e==null?void 0:e.weekStartsOn)??((u=(c=e==null?void 0:e.locale)==null?void 0:c.options)==null?void 0:u.weekStartsOn)??t.weekStartsOn??((f=(h=t.locale)==null?void 0:h.options)==null?void 0:f.weekStartsOn)??0,s=yt(n,e==null?void 0:e.in),i=s.getDay(),o=(i<r?7:0)+i-r;return s.setDate(s.getDate()-o),s.setHours(0,0,0,0),s}function _a(n,e){return Ni(n,{...e,weekStartsOn:1})}function Fp(n,e){const t=yt(n,e==null?void 0:e.in),r=t.getFullYear(),s=Pn(t,0);s.setFullYear(r+1,0,4),s.setHours(0,0,0,0);const i=_a(s),o=Pn(t,0);o.setFullYear(r,0,4),o.setHours(0,0,0,0);const c=_a(o);return t.getTime()>=i.getTime()?r+1:t.getTime()>=c.getTime()?r:r-1}function Hd(n){const e=yt(n),t=new Date(Date.UTC(e.getFullYear(),e.getMonth(),e.getDate(),e.getHours(),e.getMinutes(),e.getSeconds(),e.getMilliseconds()));return t.setUTCFullYear(e.getFullYear()),+n-+t}function qI(n,...e){const t=Pn.bind(null,e.find(r=>typeof r=="object"));return e.map(t)}function Gd(n,e){const t=yt(n,e==null?void 0:e.in);return t.setHours(0,0,0,0),t}function zI(n,e,t){const[r,s]=qI(t==null?void 0:t.in,n,e),i=Gd(r),o=Gd(s),c=+i-Hd(i),u=+o-Hd(o);return Math.round((c-u)/jI)}function WI(n,e){const t=Fp(n,e),r=Pn(n,0);return r.setFullYear(t,0,4),r.setHours(0,0,0,0),_a(r)}function HI(n){return n instanceof Date||typeof n=="object"&&Object.prototype.toString.call(n)==="[object Date]"}function GI(n){return!(!HI(n)&&typeof n!="number"||isNaN(+yt(n)))}function KI(n,e){const t=yt(n,e==null?void 0:e.in);return t.setFullYear(t.getFullYear(),0,1),t.setHours(0,0,0,0),t}const QI={lessThanXSeconds:{one:"less than a second",other:"less than {{count}} seconds"},xSeconds:{one:"1 second",other:"{{count}} seconds"},halfAMinute:"half a minute",lessThanXMinutes:{one:"less than a minute",other:"less than {{count}} minutes"},xMinutes:{one:"1 minute",other:"{{count}} minutes"},aboutXHours:{one:"about 1 hour",other:"about {{count}} hours"},xHours:{one:"1 hour",other:"{{count}} hours"},xDays:{one:"1 day",other:"{{count}} days"},aboutXWeeks:{one:"about 1 week",other:"about {{count}} weeks"},xWeeks:{one:"1 week",other:"{{count}} weeks"},aboutXMonths:{one:"about 1 month",other:"about {{count}} months"},xMonths:{one:"1 month",other:"{{count}} months"},aboutXYears:{one:"about 1 year",other:"about {{count}} years"},xYears:{one:"1 year",other:"{{count}} years"},overXYears:{one:"over 1 year",other:"over {{count}} years"},almostXYears:{one:"almost 1 year",other:"almost {{count}} years"}},YI=(n,e,t)=>{let r;const s=QI[n];return typeof s=="string"?r=s:e===1?r=s.one:r=s.other.replace("{{count}}",e.toString()),t!=null&&t.addSuffix?t.comparison&&t.comparison>0?"in "+r:r+" ago":r};function Xc(n){return(e={})=>{const t=e.width?String(e.width):n.defaultWidth;return n.formats[t]||n.formats[n.defaultWidth]}}const XI={full:"EEEE, MMMM do, y",long:"MMMM do, y",medium:"MMM d, y",short:"MM/dd/yyyy"},JI={full:"h:mm:ss a zzzz",long:"h:mm:ss a z",medium:"h:mm:ss a",short:"h:mm a"},ZI={full:"{{date}} 'at' {{time}}",long:"{{date}} 'at' {{time}}",medium:"{{date}}, {{time}}",short:"{{date}}, {{time}}"},ew={date:Xc({formats:XI,defaultWidth:"full"}),time:Xc({formats:JI,defaultWidth:"full"}),dateTime:Xc({formats:ZI,defaultWidth:"full"})},tw={lastWeek:"'last' eeee 'at' p",yesterday:"'yesterday at' p",today:"'today at' p",tomorrow:"'tomorrow at' p",nextWeek:"eeee 'at' p",other:"P"},nw=(n,e,t,r)=>tw[n];function ai(n){return(e,t)=>{const r=t!=null&&t.context?String(t.context):"standalone";let s;if(r==="formatting"&&n.formattingValues){const o=n.defaultFormattingWidth||n.defaultWidth,c=t!=null&&t.width?String(t.width):o;s=n.formattingValues[c]||n.formattingValues[o]}else{const o=n.defaultWidth,c=t!=null&&t.width?String(t.width):n.defaultWidth;s=n.values[c]||n.values[o]}const i=n.argumentCallback?n.argumentCallback(e):e;return s[i]}}const rw={narrow:["B","A"],abbreviated:["BC","AD"],wide:["Before Christ","Anno Domini"]},sw={narrow:["1","2","3","4"],abbreviated:["Q1","Q2","Q3","Q4"],wide:["1st quarter","2nd quarter","3rd quarter","4th quarter"]},iw={narrow:["J","F","M","A","M","J","J","A","S","O","N","D"],abbreviated:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],wide:["January","February","March","April","May","June","July","August","September","October","November","December"]},ow={narrow:["S","M","T","W","T","F","S"],short:["Su","Mo","Tu","We","Th","Fr","Sa"],abbreviated:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],wide:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]},aw={narrow:{am:"a",pm:"p",midnight:"mi",noon:"n",morning:"morning",afternoon:"afternoon",evening:"evening",night:"night"},abbreviated:{am:"AM",pm:"PM",midnight:"midnight",noon:"noon",morning:"morning",afternoon:"afternoon",evening:"evening",night:"night"},wide:{am:"a.m.",pm:"p.m.",midnight:"midnight",noon:"noon",morning:"morning",afternoon:"afternoon",evening:"evening",night:"night"}},cw={narrow:{am:"a",pm:"p",midnight:"mi",noon:"n",morning:"in the morning",afternoon:"in the afternoon",evening:"in the evening",night:"at night"},abbreviated:{am:"AM",pm:"PM",midnight:"midnight",noon:"noon",morning:"in the morning",afternoon:"in the afternoon",evening:"in the evening",night:"at night"},wide:{am:"a.m.",pm:"p.m.",midnight:"midnight",noon:"noon",morning:"in the morning",afternoon:"in the afternoon",evening:"in the evening",night:"at night"}},uw=(n,e)=>{const t=Number(n),r=t%100;if(r>20||r<10)switch(r%10){case 1:return t+"st";case 2:return t+"nd";case 3:return t+"rd"}return t+"th"},lw={ordinalNumber:uw,era:ai({values:rw,defaultWidth:"wide"}),quarter:ai({values:sw,defaultWidth:"wide",argumentCallback:n=>n-1}),month:ai({values:iw,defaultWidth:"wide"}),day:ai({values:ow,defaultWidth:"wide"}),dayPeriod:ai({values:aw,defaultWidth:"wide",formattingValues:cw,defaultFormattingWidth:"wide"})};function ci(n){return(e,t={})=>{const r=t.width,s=r&&n.matchPatterns[r]||n.matchPatterns[n.defaultMatchWidth],i=e.match(s);if(!i)return null;const o=i[0],c=r&&n.parsePatterns[r]||n.parsePatterns[n.defaultParseWidth],u=Array.isArray(c)?dw(c,m=>m.test(o)):hw(c,m=>m.test(o));let h;h=n.valueCallback?n.valueCallback(u):u,h=t.valueCallback?t.valueCallback(h):h;const f=e.slice(o.length);return{value:h,rest:f}}}function hw(n,e){for(const t in n)if(Object.prototype.hasOwnProperty.call(n,t)&&e(n[t]))return t}function dw(n,e){for(let t=0;t<n.length;t++)if(e(n[t]))return t}function fw(n){return(e,t={})=>{const r=e.match(n.matchPattern);if(!r)return null;const s=r[0],i=e.match(n.parsePattern);if(!i)return null;let o=n.valueCallback?n.valueCallback(i[0]):i[0];o=t.valueCallback?t.valueCallback(o):o;const c=e.slice(s.length);return{value:o,rest:c}}}const mw=/^(\d+)(th|st|nd|rd)?/i,pw=/\d+/i,gw={narrow:/^(b|a)/i,abbreviated:/^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,wide:/^(before christ|before common era|anno domini|common era)/i},_w={any:[/^b/i,/^(a|c)/i]},yw={narrow:/^[1234]/i,abbreviated:/^q[1234]/i,wide:/^[1234](th|st|nd|rd)? quarter/i},vw={any:[/1/i,/2/i,/3/i,/4/i]},Iw={narrow:/^[jfmasond]/i,abbreviated:/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,wide:/^(january|february|march|april|may|june|july|august|september|october|november|december)/i},ww={narrow:[/^j/i,/^f/i,/^m/i,/^a/i,/^m/i,/^j/i,/^j/i,/^a/i,/^s/i,/^o/i,/^n/i,/^d/i],any:[/^ja/i,/^f/i,/^mar/i,/^ap/i,/^may/i,/^jun/i,/^jul/i,/^au/i,/^s/i,/^o/i,/^n/i,/^d/i]},Ew={narrow:/^[smtwf]/i,short:/^(su|mo|tu|we|th|fr|sa)/i,abbreviated:/^(sun|mon|tue|wed|thu|fri|sat)/i,wide:/^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i},Tw={narrow:[/^s/i,/^m/i,/^t/i,/^w/i,/^t/i,/^f/i,/^s/i],any:[/^su/i,/^m/i,/^tu/i,/^w/i,/^th/i,/^f/i,/^sa/i]},bw={narrow:/^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,any:/^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i},Aw={any:{am:/^a/i,pm:/^p/i,midnight:/^mi/i,noon:/^no/i,morning:/morning/i,afternoon:/afternoon/i,evening:/evening/i,night:/night/i}},Sw={ordinalNumber:fw({matchPattern:mw,parsePattern:pw,valueCallback:n=>parseInt(n,10)}),era:ci({matchPatterns:gw,defaultMatchWidth:"wide",parsePatterns:_w,defaultParseWidth:"any"}),quarter:ci({matchPatterns:yw,defaultMatchWidth:"wide",parsePatterns:vw,defaultParseWidth:"any",valueCallback:n=>n+1}),month:ci({matchPatterns:Iw,defaultMatchWidth:"wide",parsePatterns:ww,defaultParseWidth:"any"}),day:ci({matchPatterns:Ew,defaultMatchWidth:"wide",parsePatterns:Tw,defaultParseWidth:"any"}),dayPeriod:ci({matchPatterns:bw,defaultMatchWidth:"any",parsePatterns:Aw,defaultParseWidth:"any"})},Pw={code:"en-US",formatDistance:YI,formatLong:ew,formatRelative:nw,localize:lw,match:Sw,options:{weekStartsOn:0,firstWeekContainsDate:1}};function Rw(n,e){const t=yt(n,e==null?void 0:e.in);return zI(t,KI(t))+1}function Cw(n,e){const t=yt(n,e==null?void 0:e.in),r=+_a(t)-+WI(t);return Math.round(r/Mp)+1}function Lp(n,e){var f,m,p,w;const t=yt(n,e==null?void 0:e.in),r=t.getFullYear(),s=Ga(),i=(e==null?void 0:e.firstWeekContainsDate)??((m=(f=e==null?void 0:e.locale)==null?void 0:f.options)==null?void 0:m.firstWeekContainsDate)??s.firstWeekContainsDate??((w=(p=s.locale)==null?void 0:p.options)==null?void 0:w.firstWeekContainsDate)??1,o=Pn((e==null?void 0:e.in)||n,0);o.setFullYear(r+1,0,i),o.setHours(0,0,0,0);const c=Ni(o,e),u=Pn((e==null?void 0:e.in)||n,0);u.setFullYear(r,0,i),u.setHours(0,0,0,0);const h=Ni(u,e);return+t>=+c?r+1:+t>=+h?r:r-1}function Dw(n,e){var c,u,h,f;const t=Ga(),r=(e==null?void 0:e.firstWeekContainsDate)??((u=(c=e==null?void 0:e.locale)==null?void 0:c.options)==null?void 0:u.firstWeekContainsDate)??t.firstWeekContainsDate??((f=(h=t.locale)==null?void 0:h.options)==null?void 0:f.firstWeekContainsDate)??1,s=Lp(n,e),i=Pn((e==null?void 0:e.in)||n,0);return i.setFullYear(s,0,r),i.setHours(0,0,0,0),Ni(i,e)}function kw(n,e){const t=yt(n,e==null?void 0:e.in),r=+Ni(t,e)-+Dw(t,e);return Math.round(r/Mp)+1}function oe(n,e){const t=n<0?"-":"",r=Math.abs(n).toString().padStart(e,"0");return t+r}const Jt={y(n,e){const t=n.getFullYear(),r=t>0?t:1-t;return oe(e==="yy"?r%100:r,e.length)},M(n,e){const t=n.getMonth();return e==="M"?String(t+1):oe(t+1,2)},d(n,e){return oe(n.getDate(),e.length)},a(n,e){const t=n.getHours()/12>=1?"pm":"am";switch(e){case"a":case"aa":return t.toUpperCase();case"aaa":return t;case"aaaaa":return t[0];case"aaaa":default:return t==="am"?"a.m.":"p.m."}},h(n,e){return oe(n.getHours()%12||12,e.length)},H(n,e){return oe(n.getHours(),e.length)},m(n,e){return oe(n.getMinutes(),e.length)},s(n,e){return oe(n.getSeconds(),e.length)},S(n,e){const t=e.length,r=n.getMilliseconds(),s=Math.trunc(r*Math.pow(10,t-3));return oe(s,e.length)}},kr={midnight:"midnight",noon:"noon",morning:"morning",afternoon:"afternoon",evening:"evening",night:"night"},Kd={G:function(n,e,t){const r=n.getFullYear()>0?1:0;switch(e){case"G":case"GG":case"GGG":return t.era(r,{width:"abbreviated"});case"GGGGG":return t.era(r,{width:"narrow"});case"GGGG":default:return t.era(r,{width:"wide"})}},y:function(n,e,t){if(e==="yo"){const r=n.getFullYear(),s=r>0?r:1-r;return t.ordinalNumber(s,{unit:"year"})}return Jt.y(n,e)},Y:function(n,e,t,r){const s=Lp(n,r),i=s>0?s:1-s;if(e==="YY"){const o=i%100;return oe(o,2)}return e==="Yo"?t.ordinalNumber(i,{unit:"year"}):oe(i,e.length)},R:function(n,e){const t=Fp(n);return oe(t,e.length)},u:function(n,e){const t=n.getFullYear();return oe(t,e.length)},Q:function(n,e,t){const r=Math.ceil((n.getMonth()+1)/3);switch(e){case"Q":return String(r);case"QQ":return oe(r,2);case"Qo":return t.ordinalNumber(r,{unit:"quarter"});case"QQQ":return t.quarter(r,{width:"abbreviated",context:"formatting"});case"QQQQQ":return t.quarter(r,{width:"narrow",context:"formatting"});case"QQQQ":default:return t.quarter(r,{width:"wide",context:"formatting"})}},q:function(n,e,t){const r=Math.ceil((n.getMonth()+1)/3);switch(e){case"q":return String(r);case"qq":return oe(r,2);case"qo":return t.ordinalNumber(r,{unit:"quarter"});case"qqq":return t.quarter(r,{width:"abbreviated",context:"standalone"});case"qqqqq":return t.quarter(r,{width:"narrow",context:"standalone"});case"qqqq":default:return t.quarter(r,{width:"wide",context:"standalone"})}},M:function(n,e,t){const r=n.getMonth();switch(e){case"M":case"MM":return Jt.M(n,e);case"Mo":return t.ordinalNumber(r+1,{unit:"month"});case"MMM":return t.month(r,{width:"abbreviated",context:"formatting"});case"MMMMM":return t.month(r,{width:"narrow",context:"formatting"});case"MMMM":default:return t.month(r,{width:"wide",context:"formatting"})}},L:function(n,e,t){const r=n.getMonth();switch(e){case"L":return String(r+1);case"LL":return oe(r+1,2);case"Lo":return t.ordinalNumber(r+1,{unit:"month"});case"LLL":return t.month(r,{width:"abbreviated",context:"standalone"});case"LLLLL":return t.month(r,{width:"narrow",context:"standalone"});case"LLLL":default:return t.month(r,{width:"wide",context:"standalone"})}},w:function(n,e,t,r){const s=kw(n,r);return e==="wo"?t.ordinalNumber(s,{unit:"week"}):oe(s,e.length)},I:function(n,e,t){const r=Cw(n);return e==="Io"?t.ordinalNumber(r,{unit:"week"}):oe(r,e.length)},d:function(n,e,t){return e==="do"?t.ordinalNumber(n.getDate(),{unit:"date"}):Jt.d(n,e)},D:function(n,e,t){const r=Rw(n);return e==="Do"?t.ordinalNumber(r,{unit:"dayOfYear"}):oe(r,e.length)},E:function(n,e,t){const r=n.getDay();switch(e){case"E":case"EE":case"EEE":return t.day(r,{width:"abbreviated",context:"formatting"});case"EEEEE":return t.day(r,{width:"narrow",context:"formatting"});case"EEEEEE":return t.day(r,{width:"short",context:"formatting"});case"EEEE":default:return t.day(r,{width:"wide",context:"formatting"})}},e:function(n,e,t,r){const s=n.getDay(),i=(s-r.weekStartsOn+8)%7||7;switch(e){case"e":return String(i);case"ee":return oe(i,2);case"eo":return t.ordinalNumber(i,{unit:"day"});case"eee":return t.day(s,{width:"abbreviated",context:"formatting"});case"eeeee":return t.day(s,{width:"narrow",context:"formatting"});case"eeeeee":return t.day(s,{width:"short",context:"formatting"});case"eeee":default:return t.day(s,{width:"wide",context:"formatting"})}},c:function(n,e,t,r){const s=n.getDay(),i=(s-r.weekStartsOn+8)%7||7;switch(e){case"c":return String(i);case"cc":return oe(i,e.length);case"co":return t.ordinalNumber(i,{unit:"day"});case"ccc":return t.day(s,{width:"abbreviated",context:"standalone"});case"ccccc":return t.day(s,{width:"narrow",context:"standalone"});case"cccccc":return t.day(s,{width:"short",context:"standalone"});case"cccc":default:return t.day(s,{width:"wide",context:"standalone"})}},i:function(n,e,t){const r=n.getDay(),s=r===0?7:r;switch(e){case"i":return String(s);case"ii":return oe(s,e.length);case"io":return t.ordinalNumber(s,{unit:"day"});case"iii":return t.day(r,{width:"abbreviated",context:"formatting"});case"iiiii":return t.day(r,{width:"narrow",context:"formatting"});case"iiiiii":return t.day(r,{width:"short",context:"formatting"});case"iiii":default:return t.day(r,{width:"wide",context:"formatting"})}},a:function(n,e,t){const s=n.getHours()/12>=1?"pm":"am";switch(e){case"a":case"aa":return t.dayPeriod(s,{width:"abbreviated",context:"formatting"});case"aaa":return t.dayPeriod(s,{width:"abbreviated",context:"formatting"}).toLowerCase();case"aaaaa":return t.dayPeriod(s,{width:"narrow",context:"formatting"});case"aaaa":default:return t.dayPeriod(s,{width:"wide",context:"formatting"})}},b:function(n,e,t){const r=n.getHours();let s;switch(r===12?s=kr.noon:r===0?s=kr.midnight:s=r/12>=1?"pm":"am",e){case"b":case"bb":return t.dayPeriod(s,{width:"abbreviated",context:"formatting"});case"bbb":return t.dayPeriod(s,{width:"abbreviated",context:"formatting"}).toLowerCase();case"bbbbb":return t.dayPeriod(s,{width:"narrow",context:"formatting"});case"bbbb":default:return t.dayPeriod(s,{width:"wide",context:"formatting"})}},B:function(n,e,t){const r=n.getHours();let s;switch(r>=17?s=kr.evening:r>=12?s=kr.afternoon:r>=4?s=kr.morning:s=kr.night,e){case"B":case"BB":case"BBB":return t.dayPeriod(s,{width:"abbreviated",context:"formatting"});case"BBBBB":return t.dayPeriod(s,{width:"narrow",context:"formatting"});case"BBBB":default:return t.dayPeriod(s,{width:"wide",context:"formatting"})}},h:function(n,e,t){if(e==="ho"){let r=n.getHours()%12;return r===0&&(r=12),t.ordinalNumber(r,{unit:"hour"})}return Jt.h(n,e)},H:function(n,e,t){return e==="Ho"?t.ordinalNumber(n.getHours(),{unit:"hour"}):Jt.H(n,e)},K:function(n,e,t){const r=n.getHours()%12;return e==="Ko"?t.ordinalNumber(r,{unit:"hour"}):oe(r,e.length)},k:function(n,e,t){let r=n.getHours();return r===0&&(r=24),e==="ko"?t.ordinalNumber(r,{unit:"hour"}):oe(r,e.length)},m:function(n,e,t){return e==="mo"?t.ordinalNumber(n.getMinutes(),{unit:"minute"}):Jt.m(n,e)},s:function(n,e,t){return e==="so"?t.ordinalNumber(n.getSeconds(),{unit:"second"}):Jt.s(n,e)},S:function(n,e){return Jt.S(n,e)},X:function(n,e,t){const r=n.getTimezoneOffset();if(r===0)return"Z";switch(e){case"X":return Yd(r);case"XXXX":case"XX":return zn(r);case"XXXXX":case"XXX":default:return zn(r,":")}},x:function(n,e,t){const r=n.getTimezoneOffset();switch(e){case"x":return Yd(r);case"xxxx":case"xx":return zn(r);case"xxxxx":case"xxx":default:return zn(r,":")}},O:function(n,e,t){const r=n.getTimezoneOffset();switch(e){case"O":case"OO":case"OOO":return"GMT"+Qd(r,":");case"OOOO":default:return"GMT"+zn(r,":")}},z:function(n,e,t){const r=n.getTimezoneOffset();switch(e){case"z":case"zz":case"zzz":return"GMT"+Qd(r,":");case"zzzz":default:return"GMT"+zn(r,":")}},t:function(n,e,t){const r=Math.trunc(+n/1e3);return oe(r,e.length)},T:function(n,e,t){return oe(+n,e.length)}};function Qd(n,e=""){const t=n>0?"-":"+",r=Math.abs(n),s=Math.trunc(r/60),i=r%60;return i===0?t+String(s):t+String(s)+e+oe(i,2)}function Yd(n,e){return n%60===0?(n>0?"-":"+")+oe(Math.abs(n)/60,2):zn(n,e)}function zn(n,e=""){const t=n>0?"-":"+",r=Math.abs(n),s=oe(Math.trunc(r/60),2),i=oe(r%60,2);return t+s+e+i}const Xd=(n,e)=>{switch(n){case"P":return e.date({width:"short"});case"PP":return e.date({width:"medium"});case"PPP":return e.date({width:"long"});case"PPPP":default:return e.date({width:"full"})}},Up=(n,e)=>{switch(n){case"p":return e.time({width:"short"});case"pp":return e.time({width:"medium"});case"ppp":return e.time({width:"long"});case"pppp":default:return e.time({width:"full"})}},Vw=(n,e)=>{const t=n.match(/(P+)(p+)?/)||[],r=t[1],s=t[2];if(!s)return Xd(n,e);let i;switch(r){case"P":i=e.dateTime({width:"short"});break;case"PP":i=e.dateTime({width:"medium"});break;case"PPP":i=e.dateTime({width:"long"});break;case"PPPP":default:i=e.dateTime({width:"full"});break}return i.replace("{{date}}",Xd(r,e)).replace("{{time}}",Up(s,e))},Ow={p:Up,P:Vw},xw=/^D+$/,Nw=/^Y+$/,Mw=["D","DD","YY","YYYY"];function Fw(n){return xw.test(n)}function Lw(n){return Nw.test(n)}function Uw(n,e,t){const r=Bw(n,e,t);if(console.warn(r),Mw.includes(n))throw new RangeError(r)}function Bw(n,e,t){const r=n[0]==="Y"?"years":"days of the month";return`Use \`${n.toLowerCase()}\` instead of \`${n}\` (in \`${e}\`) for formatting ${r} to the input \`${t}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`}const jw=/[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g,$w=/P+p+|P+|p+|''|'(''|[^'])+('|$)|./g,qw=/^'([^]*?)'?$/,zw=/''/g,Ww=/[a-zA-Z]/;function Hw(n,e,t){var f,m,p,w;const r=Ga(),s=r.locale??Pw,i=r.firstWeekContainsDate??((m=(f=r.locale)==null?void 0:f.options)==null?void 0:m.firstWeekContainsDate)??1,o=r.weekStartsOn??((w=(p=r.locale)==null?void 0:p.options)==null?void 0:w.weekStartsOn)??0,c=yt(n,t==null?void 0:t.in);if(!GI(c))throw new RangeError("Invalid time value");let u=e.match($w).map(C=>{const D=C[0];if(D==="p"||D==="P"){const P=Ow[D];return P(C,s.formatLong)}return C}).join("").match(jw).map(C=>{if(C==="''")return{isToken:!1,value:"'"};const D=C[0];if(D==="'")return{isToken:!1,value:Gw(C)};if(Kd[D])return{isToken:!0,value:C};if(D.match(Ww))throw new RangeError("Format string contains an unescaped latin alphabet character `"+D+"`");return{isToken:!1,value:C}});s.localize.preprocessor&&(u=s.localize.preprocessor(c,u));const h={firstWeekContainsDate:i,weekStartsOn:o,locale:s};return u.map(C=>{if(!C.isToken)return C.value;const D=C.value;(Lw(D)||Fw(D))&&Uw(D,e,String(n));const P=Kd[D[0]];return P(c,D,s.localize,h)}).join("")}function Gw(n){const e=n.match(qw);return e?e[1].replace(zw,"'"):n}const Kw=Np(n=>({activeTab:"dashboard",activeDate:Hw(new Date,"yyyy-MM-dd"),setActiveTab:e=>n({activeTab:e}),setActiveDate:e=>n({activeDate:e})})),kC=Np(BI(n=>({kcal_goal:2e3,protein_goal:150,water_goal:2500,age:30,gender:"m",setSetting:(e,t)=>n({[e]:t})}),{name:"fuel-settings"}));/**
 * @license lucide-react v0.451.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Qw=n=>n.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),Bp=(...n)=>n.filter((e,t,r)=>!!e&&r.indexOf(e)===t).join(" ");/**
 * @license lucide-react v0.451.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var Yw={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.451.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Xw=de.forwardRef(({color:n="currentColor",size:e=24,strokeWidth:t=2,absoluteStrokeWidth:r,className:s="",children:i,iconNode:o,...c},u)=>de.createElement("svg",{ref:u,...Yw,width:e,height:e,stroke:n,strokeWidth:r?Number(t)*24/Number(e):t,className:Bp("lucide",s),...c},[...o.map(([h,f])=>de.createElement(h,f)),...Array.isArray(i)?i:[i]]));/**
 * @license lucide-react v0.451.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const br=(n,e)=>{const t=de.forwardRef(({className:r,...s},i)=>de.createElement(Xw,{ref:i,iconNode:e,className:Bp(`lucide-${Qw(n)}`,r),...s}));return t.displayName=`${n}`,t};/**
 * @license lucide-react v0.451.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Jw=br("CalendarDays",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"M8 14h.01",key:"6423bh"}],["path",{d:"M12 14h.01",key:"1etili"}],["path",{d:"M16 14h.01",key:"1gbofw"}],["path",{d:"M8 18h.01",key:"lrp35t"}],["path",{d:"M12 18h.01",key:"mhygvu"}],["path",{d:"M16 18h.01",key:"kzsmim"}]]);/**
 * @license lucide-react v0.451.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Zw=br("Flame",[["path",{d:"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",key:"96xj49"}]]);/**
 * @license lucide-react v0.451.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const eE=br("Microscope",[["path",{d:"M6 18h8",key:"1borvv"}],["path",{d:"M3 22h18",key:"8prr45"}],["path",{d:"M14 22a7 7 0 1 0 0-14h-1",key:"1jwaiy"}],["path",{d:"M9 14h2",key:"197e7h"}],["path",{d:"M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z",key:"1bmzmy"}],["path",{d:"M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3",key:"1drr47"}]]);/**
 * @license lucide-react v0.451.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const tE=br("NotebookPen",[["path",{d:"M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4",key:"re6nr2"}],["path",{d:"M2 6h4",key:"aawbzj"}],["path",{d:"M2 10h4",key:"l0bgd4"}],["path",{d:"M2 14h4",key:"1gsvsf"}],["path",{d:"M2 18h4",key:"1bu2t1"}],["path",{d:"M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z",key:"pqwjuv"}]]);/**
 * @license lucide-react v0.451.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const nE=br("Pill",[["path",{d:"m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z",key:"wa1lgi"}],["path",{d:"m8.5 8.5 7 7",key:"rvfmvr"}]]);/**
 * @license lucide-react v0.451.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const rE=br("Settings2",[["path",{d:"M20 7h-9",key:"3s1dr2"}],["path",{d:"M14 17H5",key:"gfn3mx"}],["circle",{cx:"17",cy:"17",r:"3",key:"18b49y"}],["circle",{cx:"7",cy:"7",r:"3",key:"dfmy0x"}]]);/**
 * @license lucide-react v0.451.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const sE=br("UtensilsCrossed",[["path",{d:"m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8",key:"n7qcjb"}],["path",{d:"M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7",key:"d0u48b"}],["path",{d:"m2.1 21.8 6.4-6.3",key:"yn04lh"}],["path",{d:"m19 5-7 7",key:"194lzd"}]]),iE={key:"dashboard",label:"Dashboard",Icon:Zw,View:de.lazy(()=>Vn(()=>import("./DashboardView-rnhmqfp9.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8]))),getProps:n=>({nutrition:n.nutrition,sup:n.sup,journal:n.journal,macroTrend:n.macroTrend})},oE={key:"food",label:"Food",Icon:sE,View:de.lazy(()=>Vn(()=>import("./FoodView-vG6xitjK.js"),__vite__mapDeps([9,1,2,3,4,10,6,11,12]))),getProps:n=>({activeDate:n.activeDate,setActiveDate:n.setActiveDate,nutrition:n.nutrition})},aE={key:"calendar",label:"Big Calendar",Icon:Jw,View:de.lazy(()=>Vn(()=>import("./CalendarView-pyxcj0R3.js"),__vite__mapDeps([13,1,2,3,4]))),getProps:n=>({date:n.activeDate,nutrition:n.nutrition})},cE={key:"journal",label:"Journal",Icon:tE,View:de.lazy(()=>Vn(()=>import("./JournalView-CK2ALaTo.js"),__vite__mapDeps([14,1,2,3,4,10,6,11,12,7]))),getProps:n=>({date:n.activeDate,nutrition:n.nutrition,journal:n.journal||""})},uE={key:"supplements",label:"Supplements",Icon:nE,View:de.lazy(()=>Vn(()=>import("./SupplementsView-Dq6IXz1Z.js"),__vite__mapDeps([15,1,2,3,4,10,5,6,7,12]))),getProps:n=>({date:n.activeDate,sup:n.sup,catalog:n.suppCatalog||[],suppLog:n.suppLog})},lE={key:"micros",label:"Mikros",Icon:eE,View:de.lazy(()=>Vn(()=>import("./MicrosView-Ca95SJY1.js"),__vite__mapDeps([16,1,2,3,4]))),getProps:()=>({})},hE={key:"settings",label:"Setup",Icon:rE,View:de.lazy(()=>Vn(()=>import("./SettingsView-C4UAvTsw.js"),__vite__mapDeps([17,1,2,3,4,12,8]))),getProps:()=>({})},jp=[iE,oE,aE,cE,uE,lE,hE];function dE({activeTab:n,ctx:e}){const t=jp.find(i=>i.key===n);if(!t)return null;const{View:r,getProps:s}=t;return Ke.jsx(de.Suspense,{fallback:Ke.jsx("div",{className:"py-20 text-center text-slate-500 text-sm animate-pulse",children:"Laden…"}),children:Ke.jsx(r,{...s(e)})})}var _l=class{constructor(){this.listeners=new Set,this.subscribe=this.subscribe.bind(this)}subscribe(n){return this.listeners.add(n),this.onSubscribe(),()=>{this.listeners.delete(n),this.onUnsubscribe()}}hasListeners(){return this.listeners.size>0}onSubscribe(){}onUnsubscribe(){}},or,pn,rs,Tp,fE=(Tp=class extends _l{constructor(){super();H(this,or);H(this,pn);H(this,rs);j(this,rs,e=>{if(typeof window<"u"&&window.addEventListener){const t=()=>e();return window.addEventListener("visibilitychange",t,!1),()=>{window.removeEventListener("visibilitychange",t)}}})}onSubscribe(){v(this,pn)||this.setEventListener(v(this,rs))}onUnsubscribe(){var e;this.hasListeners()||((e=v(this,pn))==null||e.call(this),j(this,pn,void 0))}setEventListener(e){var t;j(this,rs,e),(t=v(this,pn))==null||t.call(this),j(this,pn,e(r=>{typeof r=="boolean"?this.setFocused(r):this.onFocus()}))}setFocused(e){v(this,or)!==e&&(j(this,or,e),this.onFocus())}onFocus(){const e=this.isFocused();this.listeners.forEach(t=>{t(e)})}isFocused(){var e;return typeof v(this,or)=="boolean"?v(this,or):((e=globalThis.document)==null?void 0:e.visibilityState)!=="hidden"}},or=new WeakMap,pn=new WeakMap,rs=new WeakMap,Tp),mE=new fE,pE={setTimeout:(n,e)=>setTimeout(n,e),clearTimeout:n=>clearTimeout(n),setInterval:(n,e)=>setInterval(n,e),clearInterval:n=>clearInterval(n)},gn,ml,bp,gE=(bp=class{constructor(){H(this,gn,pE);H(this,ml,!1)}setTimeoutProvider(n){j(this,gn,n)}setTimeout(n,e){return v(this,gn).setTimeout(n,e)}clearTimeout(n){v(this,gn).clearTimeout(n)}setInterval(n,e){return v(this,gn).setInterval(n,e)}clearInterval(n){v(this,gn).clearInterval(n)}},gn=new WeakMap,ml=new WeakMap,bp),qo=new gE;function _E(n){setTimeout(n,0)}var yE=typeof window>"u"||"Deno"in globalThis;function yu(){}function Jd(n){return typeof n=="number"&&n>=0&&n!==1/0}function vE(n,e){return Math.max(n+(e||0)-Date.now(),0)}function Ii(n,e){return typeof n=="function"?n(e):n}function dt(n,e){return typeof n=="function"?n(e):n}function VC(n){return JSON.stringify(n,(e,t)=>Iu(t)?Object.keys(t).sort().reduce((r,s)=>(r[s]=t[s],r),{}):t)}var IE=Object.prototype.hasOwnProperty;function $p(n,e,t=0){if(n===e)return n;if(t>500)return e;const r=Zd(n)&&Zd(e);if(!r&&!(Iu(n)&&Iu(e)))return e;const i=(r?n:Object.keys(n)).length,o=r?e:Object.keys(e),c=o.length,u=r?new Array(c):{};let h=0;for(let f=0;f<c;f++){const m=r?f:o[f],p=n[m],w=e[m];if(p===w){u[m]=p,(r?f<i:IE.call(n,m))&&h++;continue}if(p===null||w===null||typeof p!="object"||typeof w!="object"){u[m]=w;continue}const C=$p(p,w,t+1);u[m]=C,C===p&&h++}return i===c&&h===i?n:u}function vu(n,e){if(!e||Object.keys(n).length!==Object.keys(e).length)return!1;for(const t in n)if(n[t]!==e[t])return!1;return!0}function Zd(n){return Array.isArray(n)&&n.length===Object.keys(n).length}function Iu(n){if(!ef(n))return!1;const e=n.constructor;if(e===void 0)return!0;const t=e.prototype;return!(!ef(t)||!t.hasOwnProperty("isPrototypeOf")||Object.getPrototypeOf(n)!==Object.prototype)}function ef(n){return Object.prototype.toString.call(n)==="[object Object]"}function tf(n,e,t){return typeof t.structuralSharing=="function"?t.structuralSharing(n,e):t.structuralSharing!==!1?$p(n,e):e}function qp(n,e){return typeof n=="function"?n(...e):!!n}var wu=(()=>{let n=()=>yE;return{isServer(){return n()},setIsServer(e){n=e}}})();function nf(){let n,e;const t=new Promise((s,i)=>{n=s,e=i});t.status="pending",t.catch(()=>{});function r(s){Object.assign(t,s),delete t.resolve,delete t.reject}return t.resolve=s=>{r({status:"fulfilled",value:s}),n(s)},t.reject=s=>{r({status:"rejected",reason:s}),e(s)},t}var wE=_E;function EE(){let n=[],e=0,t=c=>{c()},r=c=>{c()},s=wE;const i=c=>{e?n.push(c):s(()=>{t(c)})},o=()=>{const c=n;n=[],c.length&&s(()=>{r(()=>{c.forEach(u=>{t(u)})})})};return{batch:c=>{let u;e++;try{u=c()}finally{e--,e||o()}return u},batchCalls:c=>(...u)=>{i(()=>{c(...u)})},schedule:i,setNotifyFunction:c=>{t=c},setBatchNotifyFunction:c=>{r=c},setScheduler:c=>{s=c}}}var zp=EE(),ss,_n,is,Ap,TE=(Ap=class extends _l{constructor(){super();H(this,ss,!0);H(this,_n);H(this,is);j(this,is,e=>{if(typeof window<"u"&&window.addEventListener){const t=()=>e(!0),r=()=>e(!1);return window.addEventListener("online",t,!1),window.addEventListener("offline",r,!1),()=>{window.removeEventListener("online",t),window.removeEventListener("offline",r)}}})}onSubscribe(){v(this,_n)||this.setEventListener(v(this,is))}onUnsubscribe(){var e;this.hasListeners()||((e=v(this,_n))==null||e.call(this),j(this,_n,void 0))}setEventListener(e){var t;j(this,is,e),(t=v(this,_n))==null||t.call(this),j(this,_n,e(this.setOnline.bind(this)))}setOnline(e){v(this,ss)!==e&&(j(this,ss,e),this.listeners.forEach(r=>{r(e)}))}isOnline(){return v(this,ss)}},ss=new WeakMap,_n=new WeakMap,is=new WeakMap,Ap),bE=new TE;function AE(n){return(n??"online")==="online"?bE.isOnline():!0}function SE(n,e){return{fetchFailureCount:0,fetchFailureReason:null,fetchStatus:AE(e.networkMode)?"fetching":"paused",...n===void 0&&{error:null,status:"pending"}}}var Ge,ee,oo,$e,ar,os,Ft,yn,ao,as,cs,cr,ur,vn,us,ie,mi,Eu,Tu,bu,Au,Su,Pu,Ru,Wp,Sp,PE=(Sp=class extends _l{constructor(e,t){super();H(this,ie);H(this,Ge);H(this,ee);H(this,oo);H(this,$e);H(this,ar);H(this,os);H(this,Ft);H(this,yn);H(this,ao);H(this,as);H(this,cs);H(this,cr);H(this,ur);H(this,vn);H(this,us,new Set);this.options=t,j(this,Ge,e),j(this,yn,null),j(this,Ft,nf()),this.bindMethods(),this.setOptions(t)}bindMethods(){this.refetch=this.refetch.bind(this)}onSubscribe(){this.listeners.size===1&&(v(this,ee).addObserver(this),rf(v(this,ee),this.options)?J(this,ie,mi).call(this):this.updateResult(),J(this,ie,Au).call(this))}onUnsubscribe(){this.hasListeners()||this.destroy()}shouldFetchOnReconnect(){return Cu(v(this,ee),this.options,this.options.refetchOnReconnect)}shouldFetchOnWindowFocus(){return Cu(v(this,ee),this.options,this.options.refetchOnWindowFocus)}destroy(){this.listeners=new Set,J(this,ie,Su).call(this),J(this,ie,Pu).call(this),v(this,ee).removeObserver(this)}setOptions(e){const t=this.options,r=v(this,ee);if(this.options=v(this,Ge).defaultQueryOptions(e),this.options.enabled!==void 0&&typeof this.options.enabled!="boolean"&&typeof this.options.enabled!="function"&&typeof dt(this.options.enabled,v(this,ee))!="boolean")throw new Error("Expected enabled to be a boolean or a callback that returns a boolean");J(this,ie,Ru).call(this),v(this,ee).setOptions(this.options),t._defaulted&&!vu(this.options,t)&&v(this,Ge).getQueryCache().notify({type:"observerOptionsUpdated",query:v(this,ee),observer:this});const s=this.hasListeners();s&&sf(v(this,ee),r,this.options,t)&&J(this,ie,mi).call(this),this.updateResult(),s&&(v(this,ee)!==r||dt(this.options.enabled,v(this,ee))!==dt(t.enabled,v(this,ee))||Ii(this.options.staleTime,v(this,ee))!==Ii(t.staleTime,v(this,ee)))&&J(this,ie,Eu).call(this);const i=J(this,ie,Tu).call(this);s&&(v(this,ee)!==r||dt(this.options.enabled,v(this,ee))!==dt(t.enabled,v(this,ee))||i!==v(this,vn))&&J(this,ie,bu).call(this,i)}getOptimisticResult(e){const t=v(this,Ge).getQueryCache().build(v(this,Ge),e),r=this.createResult(t,e);return CE(this,r)&&(j(this,$e,r),j(this,os,this.options),j(this,ar,v(this,ee).state)),r}getCurrentResult(){return v(this,$e)}trackResult(e,t){return new Proxy(e,{get:(r,s)=>(this.trackProp(s),t==null||t(s),s==="promise"&&(this.trackProp("data"),!this.options.experimental_prefetchInRender&&v(this,Ft).status==="pending"&&v(this,Ft).reject(new Error("experimental_prefetchInRender feature flag is not enabled"))),Reflect.get(r,s))})}trackProp(e){v(this,us).add(e)}getCurrentQuery(){return v(this,ee)}refetch({...e}={}){return this.fetch({...e})}fetchOptimistic(e){const t=v(this,Ge).defaultQueryOptions(e),r=v(this,Ge).getQueryCache().build(v(this,Ge),t);return r.fetch().then(()=>this.createResult(r,t))}fetch(e){return J(this,ie,mi).call(this,{...e,cancelRefetch:e.cancelRefetch??!0}).then(()=>(this.updateResult(),v(this,$e)))}createResult(e,t){var y;const r=v(this,ee),s=this.options,i=v(this,$e),o=v(this,ar),c=v(this,os),h=e!==r?e.state:v(this,oo),{state:f}=e;let m={...f},p=!1,w;if(t._optimisticResults){const E=this.hasListeners(),b=!E&&rf(e,t),R=E&&sf(e,r,t,s);(b||R)&&(m={...m,...SE(f.data,e.options)}),t._optimisticResults==="isRestoring"&&(m.fetchStatus="idle")}let{error:C,errorUpdatedAt:D,status:P}=m;w=m.data;let F=!1;if(t.placeholderData!==void 0&&w===void 0&&P==="pending"){let E;i!=null&&i.isPlaceholderData&&t.placeholderData===(c==null?void 0:c.placeholderData)?(E=i.data,F=!0):E=typeof t.placeholderData=="function"?t.placeholderData((y=v(this,cs))==null?void 0:y.state.data,v(this,cs)):t.placeholderData,E!==void 0&&(P="success",w=tf(i==null?void 0:i.data,E,t),p=!0)}if(t.select&&w!==void 0&&!F)if(i&&w===(o==null?void 0:o.data)&&t.select===v(this,ao))w=v(this,as);else try{j(this,ao,t.select),w=t.select(w),w=tf(i==null?void 0:i.data,w,t),j(this,as,w),j(this,yn,null)}catch(E){j(this,yn,E)}v(this,yn)&&(C=v(this,yn),w=v(this,as),D=Date.now(),P="error");const L=m.fetchStatus==="fetching",O=P==="pending",U=P==="error",N=O&&L,W=w!==void 0,_={status:P,fetchStatus:m.fetchStatus,isPending:O,isSuccess:P==="success",isError:U,isInitialLoading:N,isLoading:N,data:w,dataUpdatedAt:m.dataUpdatedAt,error:C,errorUpdatedAt:D,failureCount:m.fetchFailureCount,failureReason:m.fetchFailureReason,errorUpdateCount:m.errorUpdateCount,isFetched:e.isFetched(),isFetchedAfterMount:m.dataUpdateCount>h.dataUpdateCount||m.errorUpdateCount>h.errorUpdateCount,isFetching:L,isRefetching:L&&!O,isLoadingError:U&&!W,isPaused:m.fetchStatus==="paused",isPlaceholderData:p,isRefetchError:U&&W,isStale:yl(e,t),refetch:this.refetch,promise:v(this,Ft),isEnabled:dt(t.enabled,e)!==!1};if(this.options.experimental_prefetchInRender){const E=_.data!==void 0,b=_.status==="error"&&!E,R=vt=>{b?vt.reject(_.error):E&&vt.resolve(_.data)},I=()=>{const vt=j(this,Ft,_.promise=nf());R(vt)},He=v(this,Ft);switch(He.status){case"pending":e.queryHash===r.queryHash&&R(He);break;case"fulfilled":(b||_.data!==He.value)&&I();break;case"rejected":(!b||_.error!==He.reason)&&I();break}}return _}updateResult(){const e=v(this,$e),t=this.createResult(v(this,ee),this.options);if(j(this,ar,v(this,ee).state),j(this,os,this.options),v(this,ar).data!==void 0&&j(this,cs,v(this,ee)),vu(t,e))return;j(this,$e,t);const r=()=>{if(!e)return!0;const{notifyOnChangeProps:s}=this.options,i=typeof s=="function"?s():s;if(i==="all"||!i&&!v(this,us).size)return!0;const o=new Set(i??v(this,us));return this.options.throwOnError&&o.add("error"),Object.keys(v(this,$e)).some(c=>{const u=c;return v(this,$e)[u]!==e[u]&&o.has(u)})};J(this,ie,Wp).call(this,{listeners:r()})}onQueryUpdate(){this.updateResult(),this.hasListeners()&&J(this,ie,Au).call(this)}},Ge=new WeakMap,ee=new WeakMap,oo=new WeakMap,$e=new WeakMap,ar=new WeakMap,os=new WeakMap,Ft=new WeakMap,yn=new WeakMap,ao=new WeakMap,as=new WeakMap,cs=new WeakMap,cr=new WeakMap,ur=new WeakMap,vn=new WeakMap,us=new WeakMap,ie=new WeakSet,mi=function(e){J(this,ie,Ru).call(this);let t=v(this,ee).fetch(this.options,e);return e!=null&&e.throwOnError||(t=t.catch(yu)),t},Eu=function(){J(this,ie,Su).call(this);const e=Ii(this.options.staleTime,v(this,ee));if(wu.isServer()||v(this,$e).isStale||!Jd(e))return;const r=vE(v(this,$e).dataUpdatedAt,e)+1;j(this,cr,qo.setTimeout(()=>{v(this,$e).isStale||this.updateResult()},r))},Tu=function(){return(typeof this.options.refetchInterval=="function"?this.options.refetchInterval(v(this,ee)):this.options.refetchInterval)??!1},bu=function(e){J(this,ie,Pu).call(this),j(this,vn,e),!(wu.isServer()||dt(this.options.enabled,v(this,ee))===!1||!Jd(v(this,vn))||v(this,vn)===0)&&j(this,ur,qo.setInterval(()=>{(this.options.refetchIntervalInBackground||mE.isFocused())&&J(this,ie,mi).call(this)},v(this,vn)))},Au=function(){J(this,ie,Eu).call(this),J(this,ie,bu).call(this,J(this,ie,Tu).call(this))},Su=function(){v(this,cr)!==void 0&&(qo.clearTimeout(v(this,cr)),j(this,cr,void 0))},Pu=function(){v(this,ur)!==void 0&&(qo.clearInterval(v(this,ur)),j(this,ur,void 0))},Ru=function(){const e=v(this,Ge).getQueryCache().build(v(this,Ge),this.options);if(e===v(this,ee))return;const t=v(this,ee);j(this,ee,e),j(this,oo,e.state),this.hasListeners()&&(t==null||t.removeObserver(this),e.addObserver(this))},Wp=function(e){zp.batch(()=>{e.listeners&&this.listeners.forEach(t=>{t(v(this,$e))}),v(this,Ge).getQueryCache().notify({query:v(this,ee),type:"observerResultsUpdated"})})},Sp);function RE(n,e){return dt(e.enabled,n)!==!1&&n.state.data===void 0&&!(n.state.status==="error"&&e.retryOnMount===!1)}function rf(n,e){return RE(n,e)||n.state.data!==void 0&&Cu(n,e,e.refetchOnMount)}function Cu(n,e,t){if(dt(e.enabled,n)!==!1&&Ii(e.staleTime,n)!=="static"){const r=typeof t=="function"?t(n):t;return r==="always"||r!==!1&&yl(n,e)}return!1}function sf(n,e,t,r){return(n!==e||dt(r.enabled,n)===!1)&&(!t.suspense||n.state.status!=="error")&&yl(n,t)}function yl(n,e){return dt(e.enabled,n)!==!1&&n.isStaleByTime(Ii(e.staleTime,n))}function CE(n,e){return!vu(n.getCurrentResult(),e)}var DE=de.createContext(void 0),kE=n=>{const e=de.useContext(DE);if(!e)throw new Error("No QueryClient set, use QueryClientProvider to set one");return e},Hp=de.createContext(!1),VE=()=>de.useContext(Hp);Hp.Provider;function OE(){let n=!1;return{clearReset:()=>{n=!1},reset:()=>{n=!0},isReset:()=>n}}var xE=de.createContext(OE()),NE=()=>de.useContext(xE),ME=(n,e,t)=>{const r=t!=null&&t.state.error&&typeof n.throwOnError=="function"?qp(n.throwOnError,[t.state.error,t]):n.throwOnError;(n.suspense||n.experimental_prefetchInRender||r)&&(e.isReset()||(n.retryOnMount=!1))},FE=n=>{de.useEffect(()=>{n.clearReset()},[n])},LE=({result:n,errorResetBoundary:e,throwOnError:t,query:r,suspense:s})=>n.isError&&!e.isReset()&&!n.isFetching&&r&&(s&&n.data===void 0||qp(t,[n.error,r])),UE=n=>{if(n.suspense){const t=s=>s==="static"?s:Math.max(s??1e3,1e3),r=n.staleTime;n.staleTime=typeof r=="function"?(...s)=>t(r(...s)):t(r),typeof n.gcTime=="number"&&(n.gcTime=Math.max(n.gcTime,1e3))}},BE=(n,e)=>n.isLoading&&n.isFetching&&!e,jE=(n,e)=>(n==null?void 0:n.suspense)&&e.isPending,of=(n,e,t)=>e.fetchOptimistic(n).catch(()=>{t.clearReset()});function $E(n,e,t){var p,w,C,D;const r=VE(),s=NE(),i=kE(),o=i.defaultQueryOptions(n);(w=(p=i.getDefaultOptions().queries)==null?void 0:p._experimental_beforeQuery)==null||w.call(p,o);const c=i.getQueryCache().get(o.queryHash);o._optimisticResults=r?"isRestoring":"optimistic",UE(o),ME(o,s,c),FE(s);const u=!i.getQueryCache().get(o.queryHash),[h]=de.useState(()=>new e(i,o)),f=h.getOptimisticResult(o),m=!r&&n.subscribed!==!1;if(de.useSyncExternalStore(de.useCallback(P=>{const F=m?h.subscribe(zp.batchCalls(P)):yu;return h.updateResult(),F},[h,m]),()=>h.getCurrentResult(),()=>h.getCurrentResult()),de.useEffect(()=>{h.setOptions(o)},[o,h]),jE(o,f))throw of(o,h,s);if(LE({result:f,errorResetBoundary:s,throwOnError:o.throwOnError,query:c,suspense:o.suspense}))throw f.error;if((D=(C=i.getDefaultOptions().queries)==null?void 0:C._experimental_afterQuery)==null||D.call(C,o,f),o.experimental_prefetchInRender&&!wu.isServer()&&BE(f,r)){const P=u?of(o,h,s):c==null?void 0:c.promise;P==null||P.catch(yu).finally(()=>{h.updateResult()})}return o.notifyOnChangeProps?f:h.trackResult(f)}function Os(n,e){return $E(n,PE)}const qE=()=>{};var af={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gp=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},zE=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const s=n[t++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=n[t++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=n[t++],o=n[t++],c=n[t++],u=((s&7)<<18|(i&63)<<12|(o&63)<<6|c&63)-65536;e[r++]=String.fromCharCode(55296+(u>>10)),e[r++]=String.fromCharCode(56320+(u&1023))}else{const i=n[t++],o=n[t++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|o&63)}}return e.join("")},Kp={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const i=n[s],o=s+1<n.length,c=o?n[s+1]:0,u=s+2<n.length,h=u?n[s+2]:0,f=i>>2,m=(i&3)<<4|c>>4;let p=(c&15)<<2|h>>6,w=h&63;u||(w=64,o||(p=64)),r.push(t[f],t[m],t[p],t[w])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(Gp(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):zE(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const i=t[n.charAt(s++)],c=s<n.length?t[n.charAt(s)]:0;++s;const h=s<n.length?t[n.charAt(s)]:64;++s;const m=s<n.length?t[n.charAt(s)]:64;if(++s,i==null||c==null||h==null||m==null)throw new WE;const p=i<<2|c>>4;if(r.push(p),h!==64){const w=c<<4&240|h>>2;if(r.push(w),m!==64){const C=h<<6&192|m;r.push(C)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};let WE=class extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}};const HE=function(n){const e=Gp(n);return Kp.encodeByteArray(e,!0)},Qp=function(n){return HE(n).replace(/\./g,"")},GE=function(n){try{return Kp.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function KE(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const QE=()=>KE().__FIREBASE_DEFAULTS__,YE=()=>{if(typeof process>"u"||typeof af>"u")return;const n=af.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},XE=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&GE(n[1]);return e&&JSON.parse(e)},JE=()=>{try{return qE()||QE()||YE()||XE()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},Yp=()=>{var n;return(n=JE())===null||n===void 0?void 0:n.config};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ZE{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}}function eT(){try{return typeof indexedDB=="object"}catch{return!1}}function tT(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},s.onupgradeneeded=()=>{t=!1},s.onerror=()=>{var i;e(((i=s.error)===null||i===void 0?void 0:i.message)||"")}}catch(t){e(t)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nT="FirebaseError";let vl=class Xp extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=nT,Object.setPrototypeOf(this,Xp.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Jp.prototype.create)}},Jp=class{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],o=i?rT(i,r):"Error",c=`${this.serviceName}: ${o} (${s}).`;return new vl(s,c,r)}};function rT(n,e){return n.replace(sT,(t,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const sT=/\{\$([^}]+)}/g;function Du(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const s of t){if(!r.includes(s))return!1;const i=n[s],o=e[s];if(cf(i)&&cf(o)){if(!Du(i,o))return!1}else if(i!==o)return!1}for(const s of r)if(!t.includes(s))return!1;return!0}function cf(n){return n!==null&&typeof n=="object"}let ya=class{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wn="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class iT{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new ZE;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:t});s&&r.resolve(s)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){var t;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),s=(t=e==null?void 0:e.optional)!==null&&t!==void 0?t:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(i){if(s)return null;throw i}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(aT(e))try{this.getOrInitializeService({instanceIdentifier:Wn})}catch{}for(const[t,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(t);try{const i=this.getOrInitializeService({instanceIdentifier:s});r.resolve(i)}catch{}}}}clearInstance(e=Wn){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Wn){return this.instances.has(e)}getOptions(e=Wn){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[i,o]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(i);r===c&&o.resolve(s)}return s}onInit(e,t){var r;const s=this.normalizeInstanceIdentifier(t),i=(r=this.onInitCallbacks.get(s))!==null&&r!==void 0?r:new Set;i.add(e),this.onInitCallbacks.set(s,i);const o=this.instances.get(s);return o&&e(o,s),()=>{i.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const s of r)try{s(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:oT(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=Wn){return this.component?this.component.multipleInstances?e:Wn:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function oT(n){return n===Wn?void 0:n}function aT(n){return n.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cT{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new iT(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var pe;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(pe||(pe={}));const uT={debug:pe.DEBUG,verbose:pe.VERBOSE,info:pe.INFO,warn:pe.WARN,error:pe.ERROR,silent:pe.SILENT},lT=pe.INFO,hT={[pe.DEBUG]:"log",[pe.VERBOSE]:"log",[pe.INFO]:"info",[pe.WARN]:"warn",[pe.ERROR]:"error"},dT=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),s=hT[e];if(s)console[s](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};let fT=class{constructor(e){this.name=e,this._logLevel=lT,this._logHandler=dT,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in pe))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?uT[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,pe.DEBUG,...e),this._logHandler(this,pe.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,pe.VERBOSE,...e),this._logHandler(this,pe.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,pe.INFO,...e),this._logHandler(this,pe.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,pe.WARN,...e),this._logHandler(this,pe.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,pe.ERROR,...e),this._logHandler(this,pe.ERROR,...e)}};const mT=(n,e)=>e.some(t=>n instanceof t);let uf,lf;function pT(){return uf||(uf=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function gT(){return lf||(lf=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Zp=new WeakMap,ku=new WeakMap,eg=new WeakMap,Jc=new WeakMap,Il=new WeakMap;function _T(n){const e=new Promise((t,r)=>{const s=()=>{n.removeEventListener("success",i),n.removeEventListener("error",o)},i=()=>{t(wn(n.result)),s()},o=()=>{r(n.error),s()};n.addEventListener("success",i),n.addEventListener("error",o)});return e.then(t=>{t instanceof IDBCursor&&Zp.set(t,n)}).catch(()=>{}),Il.set(e,n),e}function yT(n){if(ku.has(n))return;const e=new Promise((t,r)=>{const s=()=>{n.removeEventListener("complete",i),n.removeEventListener("error",o),n.removeEventListener("abort",o)},i=()=>{t(),s()},o=()=>{r(n.error||new DOMException("AbortError","AbortError")),s()};n.addEventListener("complete",i),n.addEventListener("error",o),n.addEventListener("abort",o)});ku.set(n,e)}let Vu={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return ku.get(n);if(e==="objectStoreNames")return n.objectStoreNames||eg.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return wn(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function vT(n){Vu=n(Vu)}function IT(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const r=n.call(Zc(this),e,...t);return eg.set(r,e.sort?e.sort():[e]),wn(r)}:gT().includes(n)?function(...e){return n.apply(Zc(this),e),wn(Zp.get(this))}:function(...e){return wn(n.apply(Zc(this),e))}}function wT(n){return typeof n=="function"?IT(n):(n instanceof IDBTransaction&&yT(n),mT(n,pT())?new Proxy(n,Vu):n)}function wn(n){if(n instanceof IDBRequest)return _T(n);if(Jc.has(n))return Jc.get(n);const e=wT(n);return e!==n&&(Jc.set(n,e),Il.set(e,n)),e}const Zc=n=>Il.get(n);function ET(n,e,{blocked:t,upgrade:r,blocking:s,terminated:i}={}){const o=indexedDB.open(n,e),c=wn(o);return r&&o.addEventListener("upgradeneeded",u=>{r(wn(o.result),u.oldVersion,u.newVersion,wn(o.transaction),u)}),t&&o.addEventListener("blocked",u=>t(u.oldVersion,u.newVersion,u)),c.then(u=>{i&&u.addEventListener("close",()=>i()),s&&u.addEventListener("versionchange",h=>s(h.oldVersion,h.newVersion,h))}).catch(()=>{}),c}const TT=["get","getKey","getAll","getAllKeys","count"],bT=["put","add","delete","clear"],eu=new Map;function hf(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(eu.get(e))return eu.get(e);const t=e.replace(/FromIndex$/,""),r=e!==t,s=bT.includes(t);if(!(t in(r?IDBIndex:IDBObjectStore).prototype)||!(s||TT.includes(t)))return;const i=async function(o,...c){const u=this.transaction(o,s?"readwrite":"readonly");let h=u.store;return r&&(h=h.index(c.shift())),(await Promise.all([h[t](...c),s&&u.done]))[0]};return eu.set(e,i),i}vT(n=>({...n,get:(e,t,r)=>hf(e,t)||n.get(e,t,r),has:(e,t)=>!!hf(e,t)||n.has(e,t)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class AT{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(ST(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}}function ST(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Ou="@firebase/app",df="0.13.2";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $t=new fT("@firebase/app"),PT="@firebase/app-compat",RT="@firebase/analytics-compat",CT="@firebase/analytics",DT="@firebase/app-check-compat",kT="@firebase/app-check",VT="@firebase/auth",OT="@firebase/auth-compat",xT="@firebase/database",NT="@firebase/data-connect",MT="@firebase/database-compat",FT="@firebase/functions",LT="@firebase/functions-compat",UT="@firebase/installations",BT="@firebase/installations-compat",jT="@firebase/messaging",$T="@firebase/messaging-compat",qT="@firebase/performance",zT="@firebase/performance-compat",WT="@firebase/remote-config",HT="@firebase/remote-config-compat",GT="@firebase/storage",KT="@firebase/storage-compat",QT="@firebase/firestore",YT="@firebase/ai",XT="@firebase/firestore-compat",JT="firebase",ZT="11.10.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xu="[DEFAULT]",eb={[Ou]:"fire-core",[PT]:"fire-core-compat",[CT]:"fire-analytics",[RT]:"fire-analytics-compat",[kT]:"fire-app-check",[DT]:"fire-app-check-compat",[VT]:"fire-auth",[OT]:"fire-auth-compat",[xT]:"fire-rtdb",[NT]:"fire-data-connect",[MT]:"fire-rtdb-compat",[FT]:"fire-fn",[LT]:"fire-fn-compat",[UT]:"fire-iid",[BT]:"fire-iid-compat",[jT]:"fire-fcm",[$T]:"fire-fcm-compat",[qT]:"fire-perf",[zT]:"fire-perf-compat",[WT]:"fire-rc",[HT]:"fire-rc-compat",[GT]:"fire-gcs",[KT]:"fire-gcs-compat",[QT]:"fire-fst",[XT]:"fire-fst-compat",[YT]:"fire-vertex","fire-js":"fire-js",[JT]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Mi=new Map,tb=new Map,Nu=new Map;function ff(n,e){try{n.container.addComponent(e)}catch(t){$t.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function ls(n){const e=n.name;if(Nu.has(e))return $t.debug(`There were multiple attempts to register component ${e}.`),!1;Nu.set(e,n);for(const t of Mi.values())ff(t,n);for(const t of tb.values())ff(t,n);return!0}function Ka(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function mt(n){return n==null?!1:n.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nb={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},En=new Jp("app","Firebase",nb);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rb{constructor(e,t,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},t),this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new ya("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw En.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xs=ZT;function tg(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r=Object.assign({name:xu,automaticDataCollectionEnabled:!0},e),s=r.name;if(typeof s!="string"||!s)throw En.create("bad-app-name",{appName:String(s)});if(t||(t=Yp()),!t)throw En.create("no-options");const i=Mi.get(s);if(i){if(Du(t,i.options)&&Du(r,i.config))return i;throw En.create("duplicate-app",{appName:s})}const o=new cT(s);for(const u of Nu.values())o.addComponent(u);const c=new rb(t,r,o);return Mi.set(s,c),c}function wl(n=xu){const e=Mi.get(n);if(!e&&n===xu&&Yp())return tg();if(!e)throw En.create("no-app",{appName:n});return e}function sb(){return Array.from(Mi.values())}function Tn(n,e,t){var r;let s=(r=eb[n])!==null&&r!==void 0?r:n;t&&(s+=`-${t}`);const i=s.match(/\s|\//),o=e.match(/\s|\//);if(i||o){const c=[`Unable to register library "${s}" with version "${e}":`];i&&c.push(`library name "${s}" contains illegal characters (whitespace or "/")`),i&&o&&c.push("and"),o&&c.push(`version name "${e}" contains illegal characters (whitespace or "/")`),$t.warn(c.join(" "));return}ls(new ya(`${s}-version`,()=>({library:s,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ib="firebase-heartbeat-database",ob=1,Fi="firebase-heartbeat-store";let tu=null;function ng(){return tu||(tu=ET(ib,ob,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(Fi)}catch(t){console.warn(t)}}}}).catch(n=>{throw En.create("idb-open",{originalErrorMessage:n.message})})),tu}async function ab(n){try{const t=(await ng()).transaction(Fi),r=await t.objectStore(Fi).get(rg(n));return await t.done,r}catch(e){if(e instanceof vl)$t.warn(e.message);else{const t=En.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});$t.warn(t.message)}}}async function mf(n,e){try{const r=(await ng()).transaction(Fi,"readwrite");await r.objectStore(Fi).put(e,rg(n)),await r.done}catch(t){if(t instanceof vl)$t.warn(t.message);else{const r=En.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});$t.warn(r.message)}}}function rg(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cb=1024,ub=30;class lb{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new db(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,t;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=pf();if(((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(o=>o.date===i))return;if(this._heartbeatsCache.heartbeats.push({date:i,agent:s}),this._heartbeatsCache.heartbeats.length>ub){const o=fb(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){$t.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=pf(),{heartbeatsToSend:r,unsentEntries:s}=hb(this._heartbeatsCache.heartbeats),i=Qp(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=t,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(t){return $t.warn(t),""}}}function pf(){return new Date().toISOString().substring(0,10)}function hb(n,e=cb){const t=[];let r=n.slice();for(const s of n){const i=t.find(o=>o.agent===s.agent);if(i){if(i.dates.push(s.date),gf(t)>e){i.dates.pop();break}}else if(t.push({agent:s.agent,dates:[s.date]}),gf(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class db{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return eT()?tT().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await ab(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var t;if(await this._canUseIndexedDBPromise){const s=await this.read();return mf(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:s.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var t;if(await this._canUseIndexedDBPromise){const s=await this.read();return mf(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...e.heartbeats]})}else return}}function gf(n){return Qp(JSON.stringify({version:2,heartbeats:n})).length}function fb(n){if(n.length===0)return-1;let e=0,t=n[0].date;for(let r=1;r<n.length;r++)n[r].date<t&&(t=n[r].date,e=r);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function mb(n){ls(new ya("platform-logger",e=>new AT(e),"PRIVATE")),ls(new ya("heartbeat",e=>new lb(e),"PRIVATE")),Tn(Ou,df,n),Tn(Ou,df,"esm2017"),Tn("fire-js","")}mb("");const pb=()=>{};var _f={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sg=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},gb=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const s=n[t++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=n[t++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=n[t++],o=n[t++],c=n[t++],u=((s&7)<<18|(i&63)<<12|(o&63)<<6|c&63)-65536;e[r++]=String.fromCharCode(55296+(u>>10)),e[r++]=String.fromCharCode(56320+(u&1023))}else{const i=n[t++],o=n[t++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|o&63)}}return e.join("")},ig={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const i=n[s],o=s+1<n.length,c=o?n[s+1]:0,u=s+2<n.length,h=u?n[s+2]:0,f=i>>2,m=(i&3)<<4|c>>4;let p=(c&15)<<2|h>>6,w=h&63;u||(w=64,o||(p=64)),r.push(t[f],t[m],t[p],t[w])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(sg(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):gb(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const i=t[n.charAt(s++)],c=s<n.length?t[n.charAt(s)]:0;++s;const h=s<n.length?t[n.charAt(s)]:64;++s;const m=s<n.length?t[n.charAt(s)]:64;if(++s,i==null||c==null||h==null||m==null)throw new _b;const p=i<<2|c>>4;if(r.push(p),h!==64){const w=c<<4&240|h>>2;if(r.push(w),m!==64){const C=h<<6&192|m;r.push(C)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};let _b=class extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}};const yb=function(n){const e=sg(n);return ig.encodeByteArray(e,!0)},yf=function(n){return yb(n).replace(/\./g,"")},vb=function(n){try{return ig.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function og(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ib=()=>og().__FIREBASE_DEFAULTS__,wb=()=>{if(typeof process>"u"||typeof _f>"u")return;const n=_f.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},Eb=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&vb(n[1]);return e&&JSON.parse(e)},ag=()=>{try{return pb()||Ib()||wb()||Eb()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},Tb=n=>{var e,t;return(t=(e=ag())===null||e===void 0?void 0:e.emulatorHosts)===null||t===void 0?void 0:t[n]},bb=n=>{const e=Tb(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]};/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qa(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch{return!1}}async function cg(n){return(await fetch(n,{credentials:"include"})).ok}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ab(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",s=n.iat||0,i=n.sub||n.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o=Object.assign({iss:`https://securetoken.google.com/${r}`,aud:r,iat:s,exp:s+3600,auth_time:s,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}}},n);return[yf(JSON.stringify(t)),yf(JSON.stringify(o)),""].join(".")}const wi={};function Sb(){const n={prod:[],emulator:[]};for(const e of Object.keys(wi))wi[e]?n.emulator.push(e):n.prod.push(e);return n}function Pb(n){let e=document.getElementById(n),t=!1;return e||(e=document.createElement("div"),e.setAttribute("id",n),t=!0),{created:t,element:e}}let vf=!1;function Rb(n,e){if(typeof window>"u"||typeof document>"u"||!Qa(window.location.host)||wi[n]===e||wi[n]||vf)return;wi[n]=e;function t(p){return`__firebase__banner__${p}`}const r="__firebase__banner",i=Sb().prod.length>0;function o(){const p=document.getElementById(r);p&&p.remove()}function c(p){p.style.display="flex",p.style.background="#7faaf0",p.style.position="fixed",p.style.bottom="5px",p.style.left="5px",p.style.padding=".5em",p.style.borderRadius="5px",p.style.alignItems="center"}function u(p,w){p.setAttribute("width","24"),p.setAttribute("id",w),p.setAttribute("height","24"),p.setAttribute("viewBox","0 0 24 24"),p.setAttribute("fill","none"),p.style.marginLeft="-6px"}function h(){const p=document.createElement("span");return p.style.cursor="pointer",p.style.marginLeft="16px",p.style.fontSize="24px",p.innerHTML=" &times;",p.onclick=()=>{vf=!0,o()},p}function f(p,w){p.setAttribute("id",w),p.innerText="Learn more",p.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",p.setAttribute("target","__blank"),p.style.paddingLeft="5px",p.style.textDecoration="underline"}function m(){const p=Pb(r),w=t("text"),C=document.getElementById(w)||document.createElement("span"),D=t("learnmore"),P=document.getElementById(D)||document.createElement("a"),F=t("preprendIcon"),L=document.getElementById(F)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(p.created){const O=p.element;c(O),f(P,D);const U=h();u(L,F),O.append(L,C,P,U),document.body.appendChild(O)}i?(C.innerText="Preview backend disconnected.",L.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):(L.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,C.innerText="Preview backend running in this workspace."),C.setAttribute("id",w)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",m):m()}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function va(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function ug(){var n;const e=(n=ag())===null||n===void 0?void 0:n.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function lg(){return!ug()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function hg(){return!ug()&&!!navigator.userAgent&&(navigator.userAgent.includes("Safari")||navigator.userAgent.includes("WebKit"))&&!navigator.userAgent.includes("Chrome")}function Cb(){try{return typeof indexedDB=="object"}catch{return!1}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Db="FirebaseError";let dg=class fg extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=Db,Object.setPrototypeOf(this,fg.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,kb.prototype.create)}},kb=class{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],o=i?Vb(i,r):"Error",c=`${this.serviceName}: ${o} (${s}).`;return new dg(s,c,r)}};function Vb(n,e){return n.replace(Ob,(t,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const Ob=/\{\$([^}]+)}/g;function El(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const s of t){if(!r.includes(s))return!1;const i=n[s],o=e[s];if(If(i)&&If(o)){if(!El(i,o))return!1}else if(i!==o)return!1}for(const s of r)if(!t.includes(s))return!1;return!0}function If(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function hs(n){return n&&n._delegate?n._delegate:n}let xb=class{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var ne;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(ne||(ne={}));const Nb={debug:ne.DEBUG,verbose:ne.VERBOSE,info:ne.INFO,warn:ne.WARN,error:ne.ERROR,silent:ne.SILENT},Mb=ne.INFO,Fb={[ne.DEBUG]:"log",[ne.VERBOSE]:"log",[ne.INFO]:"info",[ne.WARN]:"warn",[ne.ERROR]:"error"},Lb=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),s=Fb[e];if(s)console[s](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};let Ub=class{constructor(e){this.name=e,this._logLevel=Mb,this._logHandler=Lb,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in ne))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Nb[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,ne.DEBUG,...e),this._logHandler(this,ne.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,ne.VERBOSE,...e),this._logHandler(this,ne.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,ne.INFO,...e),this._logHandler(this,ne.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,ne.WARN,...e),this._logHandler(this,ne.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,ne.ERROR,...e),this._logHandler(this,ne.ERROR,...e)}};var wf=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var bn,mg;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(T,_){function y(){}y.prototype=_.prototype,T.D=_.prototype,T.prototype=new y,T.prototype.constructor=T,T.C=function(E,b,R){for(var I=Array(arguments.length-2),He=2;He<arguments.length;He++)I[He-2]=arguments[He];return _.prototype[b].apply(E,I)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(r,t),r.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(T,_,y){y||(y=0);var E=Array(16);if(typeof _=="string")for(var b=0;16>b;++b)E[b]=_.charCodeAt(y++)|_.charCodeAt(y++)<<8|_.charCodeAt(y++)<<16|_.charCodeAt(y++)<<24;else for(b=0;16>b;++b)E[b]=_[y++]|_[y++]<<8|_[y++]<<16|_[y++]<<24;_=T.g[0],y=T.g[1],b=T.g[2];var R=T.g[3],I=_+(R^y&(b^R))+E[0]+3614090360&4294967295;_=y+(I<<7&4294967295|I>>>25),I=R+(b^_&(y^b))+E[1]+3905402710&4294967295,R=_+(I<<12&4294967295|I>>>20),I=b+(y^R&(_^y))+E[2]+606105819&4294967295,b=R+(I<<17&4294967295|I>>>15),I=y+(_^b&(R^_))+E[3]+3250441966&4294967295,y=b+(I<<22&4294967295|I>>>10),I=_+(R^y&(b^R))+E[4]+4118548399&4294967295,_=y+(I<<7&4294967295|I>>>25),I=R+(b^_&(y^b))+E[5]+1200080426&4294967295,R=_+(I<<12&4294967295|I>>>20),I=b+(y^R&(_^y))+E[6]+2821735955&4294967295,b=R+(I<<17&4294967295|I>>>15),I=y+(_^b&(R^_))+E[7]+4249261313&4294967295,y=b+(I<<22&4294967295|I>>>10),I=_+(R^y&(b^R))+E[8]+1770035416&4294967295,_=y+(I<<7&4294967295|I>>>25),I=R+(b^_&(y^b))+E[9]+2336552879&4294967295,R=_+(I<<12&4294967295|I>>>20),I=b+(y^R&(_^y))+E[10]+4294925233&4294967295,b=R+(I<<17&4294967295|I>>>15),I=y+(_^b&(R^_))+E[11]+2304563134&4294967295,y=b+(I<<22&4294967295|I>>>10),I=_+(R^y&(b^R))+E[12]+1804603682&4294967295,_=y+(I<<7&4294967295|I>>>25),I=R+(b^_&(y^b))+E[13]+4254626195&4294967295,R=_+(I<<12&4294967295|I>>>20),I=b+(y^R&(_^y))+E[14]+2792965006&4294967295,b=R+(I<<17&4294967295|I>>>15),I=y+(_^b&(R^_))+E[15]+1236535329&4294967295,y=b+(I<<22&4294967295|I>>>10),I=_+(b^R&(y^b))+E[1]+4129170786&4294967295,_=y+(I<<5&4294967295|I>>>27),I=R+(y^b&(_^y))+E[6]+3225465664&4294967295,R=_+(I<<9&4294967295|I>>>23),I=b+(_^y&(R^_))+E[11]+643717713&4294967295,b=R+(I<<14&4294967295|I>>>18),I=y+(R^_&(b^R))+E[0]+3921069994&4294967295,y=b+(I<<20&4294967295|I>>>12),I=_+(b^R&(y^b))+E[5]+3593408605&4294967295,_=y+(I<<5&4294967295|I>>>27),I=R+(y^b&(_^y))+E[10]+38016083&4294967295,R=_+(I<<9&4294967295|I>>>23),I=b+(_^y&(R^_))+E[15]+3634488961&4294967295,b=R+(I<<14&4294967295|I>>>18),I=y+(R^_&(b^R))+E[4]+3889429448&4294967295,y=b+(I<<20&4294967295|I>>>12),I=_+(b^R&(y^b))+E[9]+568446438&4294967295,_=y+(I<<5&4294967295|I>>>27),I=R+(y^b&(_^y))+E[14]+3275163606&4294967295,R=_+(I<<9&4294967295|I>>>23),I=b+(_^y&(R^_))+E[3]+4107603335&4294967295,b=R+(I<<14&4294967295|I>>>18),I=y+(R^_&(b^R))+E[8]+1163531501&4294967295,y=b+(I<<20&4294967295|I>>>12),I=_+(b^R&(y^b))+E[13]+2850285829&4294967295,_=y+(I<<5&4294967295|I>>>27),I=R+(y^b&(_^y))+E[2]+4243563512&4294967295,R=_+(I<<9&4294967295|I>>>23),I=b+(_^y&(R^_))+E[7]+1735328473&4294967295,b=R+(I<<14&4294967295|I>>>18),I=y+(R^_&(b^R))+E[12]+2368359562&4294967295,y=b+(I<<20&4294967295|I>>>12),I=_+(y^b^R)+E[5]+4294588738&4294967295,_=y+(I<<4&4294967295|I>>>28),I=R+(_^y^b)+E[8]+2272392833&4294967295,R=_+(I<<11&4294967295|I>>>21),I=b+(R^_^y)+E[11]+1839030562&4294967295,b=R+(I<<16&4294967295|I>>>16),I=y+(b^R^_)+E[14]+4259657740&4294967295,y=b+(I<<23&4294967295|I>>>9),I=_+(y^b^R)+E[1]+2763975236&4294967295,_=y+(I<<4&4294967295|I>>>28),I=R+(_^y^b)+E[4]+1272893353&4294967295,R=_+(I<<11&4294967295|I>>>21),I=b+(R^_^y)+E[7]+4139469664&4294967295,b=R+(I<<16&4294967295|I>>>16),I=y+(b^R^_)+E[10]+3200236656&4294967295,y=b+(I<<23&4294967295|I>>>9),I=_+(y^b^R)+E[13]+681279174&4294967295,_=y+(I<<4&4294967295|I>>>28),I=R+(_^y^b)+E[0]+3936430074&4294967295,R=_+(I<<11&4294967295|I>>>21),I=b+(R^_^y)+E[3]+3572445317&4294967295,b=R+(I<<16&4294967295|I>>>16),I=y+(b^R^_)+E[6]+76029189&4294967295,y=b+(I<<23&4294967295|I>>>9),I=_+(y^b^R)+E[9]+3654602809&4294967295,_=y+(I<<4&4294967295|I>>>28),I=R+(_^y^b)+E[12]+3873151461&4294967295,R=_+(I<<11&4294967295|I>>>21),I=b+(R^_^y)+E[15]+530742520&4294967295,b=R+(I<<16&4294967295|I>>>16),I=y+(b^R^_)+E[2]+3299628645&4294967295,y=b+(I<<23&4294967295|I>>>9),I=_+(b^(y|~R))+E[0]+4096336452&4294967295,_=y+(I<<6&4294967295|I>>>26),I=R+(y^(_|~b))+E[7]+1126891415&4294967295,R=_+(I<<10&4294967295|I>>>22),I=b+(_^(R|~y))+E[14]+2878612391&4294967295,b=R+(I<<15&4294967295|I>>>17),I=y+(R^(b|~_))+E[5]+4237533241&4294967295,y=b+(I<<21&4294967295|I>>>11),I=_+(b^(y|~R))+E[12]+1700485571&4294967295,_=y+(I<<6&4294967295|I>>>26),I=R+(y^(_|~b))+E[3]+2399980690&4294967295,R=_+(I<<10&4294967295|I>>>22),I=b+(_^(R|~y))+E[10]+4293915773&4294967295,b=R+(I<<15&4294967295|I>>>17),I=y+(R^(b|~_))+E[1]+2240044497&4294967295,y=b+(I<<21&4294967295|I>>>11),I=_+(b^(y|~R))+E[8]+1873313359&4294967295,_=y+(I<<6&4294967295|I>>>26),I=R+(y^(_|~b))+E[15]+4264355552&4294967295,R=_+(I<<10&4294967295|I>>>22),I=b+(_^(R|~y))+E[6]+2734768916&4294967295,b=R+(I<<15&4294967295|I>>>17),I=y+(R^(b|~_))+E[13]+1309151649&4294967295,y=b+(I<<21&4294967295|I>>>11),I=_+(b^(y|~R))+E[4]+4149444226&4294967295,_=y+(I<<6&4294967295|I>>>26),I=R+(y^(_|~b))+E[11]+3174756917&4294967295,R=_+(I<<10&4294967295|I>>>22),I=b+(_^(R|~y))+E[2]+718787259&4294967295,b=R+(I<<15&4294967295|I>>>17),I=y+(R^(b|~_))+E[9]+3951481745&4294967295,T.g[0]=T.g[0]+_&4294967295,T.g[1]=T.g[1]+(b+(I<<21&4294967295|I>>>11))&4294967295,T.g[2]=T.g[2]+b&4294967295,T.g[3]=T.g[3]+R&4294967295}r.prototype.u=function(T,_){_===void 0&&(_=T.length);for(var y=_-this.blockSize,E=this.B,b=this.h,R=0;R<_;){if(b==0)for(;R<=y;)s(this,T,R),R+=this.blockSize;if(typeof T=="string"){for(;R<_;)if(E[b++]=T.charCodeAt(R++),b==this.blockSize){s(this,E),b=0;break}}else for(;R<_;)if(E[b++]=T[R++],b==this.blockSize){s(this,E),b=0;break}}this.h=b,this.o+=_},r.prototype.v=function(){var T=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);T[0]=128;for(var _=1;_<T.length-8;++_)T[_]=0;var y=8*this.o;for(_=T.length-8;_<T.length;++_)T[_]=y&255,y/=256;for(this.u(T),T=Array(16),_=y=0;4>_;++_)for(var E=0;32>E;E+=8)T[y++]=this.g[_]>>>E&255;return T};function i(T,_){var y=c;return Object.prototype.hasOwnProperty.call(y,T)?y[T]:y[T]=_(T)}function o(T,_){this.h=_;for(var y=[],E=!0,b=T.length-1;0<=b;b--){var R=T[b]|0;E&&R==_||(y[b]=R,E=!1)}this.g=y}var c={};function u(T){return-128<=T&&128>T?i(T,function(_){return new o([_|0],0>_?-1:0)}):new o([T|0],0>T?-1:0)}function h(T){if(isNaN(T)||!isFinite(T))return m;if(0>T)return P(h(-T));for(var _=[],y=1,E=0;T>=y;E++)_[E]=T/y|0,y*=4294967296;return new o(_,0)}function f(T,_){if(T.length==0)throw Error("number format error: empty string");if(_=_||10,2>_||36<_)throw Error("radix out of range: "+_);if(T.charAt(0)=="-")return P(f(T.substring(1),_));if(0<=T.indexOf("-"))throw Error('number format error: interior "-" character');for(var y=h(Math.pow(_,8)),E=m,b=0;b<T.length;b+=8){var R=Math.min(8,T.length-b),I=parseInt(T.substring(b,b+R),_);8>R?(R=h(Math.pow(_,R)),E=E.j(R).add(h(I))):(E=E.j(y),E=E.add(h(I)))}return E}var m=u(0),p=u(1),w=u(16777216);n=o.prototype,n.m=function(){if(D(this))return-P(this).m();for(var T=0,_=1,y=0;y<this.g.length;y++){var E=this.i(y);T+=(0<=E?E:4294967296+E)*_,_*=4294967296}return T},n.toString=function(T){if(T=T||10,2>T||36<T)throw Error("radix out of range: "+T);if(C(this))return"0";if(D(this))return"-"+P(this).toString(T);for(var _=h(Math.pow(T,6)),y=this,E="";;){var b=U(y,_).g;y=F(y,b.j(_));var R=((0<y.g.length?y.g[0]:y.h)>>>0).toString(T);if(y=b,C(y))return R+E;for(;6>R.length;)R="0"+R;E=R+E}},n.i=function(T){return 0>T?0:T<this.g.length?this.g[T]:this.h};function C(T){if(T.h!=0)return!1;for(var _=0;_<T.g.length;_++)if(T.g[_]!=0)return!1;return!0}function D(T){return T.h==-1}n.l=function(T){return T=F(this,T),D(T)?-1:C(T)?0:1};function P(T){for(var _=T.g.length,y=[],E=0;E<_;E++)y[E]=~T.g[E];return new o(y,~T.h).add(p)}n.abs=function(){return D(this)?P(this):this},n.add=function(T){for(var _=Math.max(this.g.length,T.g.length),y=[],E=0,b=0;b<=_;b++){var R=E+(this.i(b)&65535)+(T.i(b)&65535),I=(R>>>16)+(this.i(b)>>>16)+(T.i(b)>>>16);E=I>>>16,R&=65535,I&=65535,y[b]=I<<16|R}return new o(y,y[y.length-1]&-2147483648?-1:0)};function F(T,_){return T.add(P(_))}n.j=function(T){if(C(this)||C(T))return m;if(D(this))return D(T)?P(this).j(P(T)):P(P(this).j(T));if(D(T))return P(this.j(P(T)));if(0>this.l(w)&&0>T.l(w))return h(this.m()*T.m());for(var _=this.g.length+T.g.length,y=[],E=0;E<2*_;E++)y[E]=0;for(E=0;E<this.g.length;E++)for(var b=0;b<T.g.length;b++){var R=this.i(E)>>>16,I=this.i(E)&65535,He=T.i(b)>>>16,vt=T.i(b)&65535;y[2*E+2*b]+=I*vt,L(y,2*E+2*b),y[2*E+2*b+1]+=R*vt,L(y,2*E+2*b+1),y[2*E+2*b+1]+=I*He,L(y,2*E+2*b+1),y[2*E+2*b+2]+=R*He,L(y,2*E+2*b+2)}for(E=0;E<_;E++)y[E]=y[2*E+1]<<16|y[2*E];for(E=_;E<2*_;E++)y[E]=0;return new o(y,0)};function L(T,_){for(;(T[_]&65535)!=T[_];)T[_+1]+=T[_]>>>16,T[_]&=65535,_++}function O(T,_){this.g=T,this.h=_}function U(T,_){if(C(_))throw Error("division by zero");if(C(T))return new O(m,m);if(D(T))return _=U(P(T),_),new O(P(_.g),P(_.h));if(D(_))return _=U(T,P(_)),new O(P(_.g),_.h);if(30<T.g.length){if(D(T)||D(_))throw Error("slowDivide_ only works with positive integers.");for(var y=p,E=_;0>=E.l(T);)y=N(y),E=N(E);var b=W(y,1),R=W(E,1);for(E=W(E,2),y=W(y,2);!C(E);){var I=R.add(E);0>=I.l(T)&&(b=b.add(y),R=I),E=W(E,1),y=W(y,1)}return _=F(T,b.j(_)),new O(b,_)}for(b=m;0<=T.l(_);){for(y=Math.max(1,Math.floor(T.m()/_.m())),E=Math.ceil(Math.log(y)/Math.LN2),E=48>=E?1:Math.pow(2,E-48),R=h(y),I=R.j(_);D(I)||0<I.l(T);)y-=E,R=h(y),I=R.j(_);C(R)&&(R=p),b=b.add(R),T=F(T,I)}return new O(b,T)}n.A=function(T){return U(this,T).h},n.and=function(T){for(var _=Math.max(this.g.length,T.g.length),y=[],E=0;E<_;E++)y[E]=this.i(E)&T.i(E);return new o(y,this.h&T.h)},n.or=function(T){for(var _=Math.max(this.g.length,T.g.length),y=[],E=0;E<_;E++)y[E]=this.i(E)|T.i(E);return new o(y,this.h|T.h)},n.xor=function(T){for(var _=Math.max(this.g.length,T.g.length),y=[],E=0;E<_;E++)y[E]=this.i(E)^T.i(E);return new o(y,this.h^T.h)};function N(T){for(var _=T.g.length+1,y=[],E=0;E<_;E++)y[E]=T.i(E)<<1|T.i(E-1)>>>31;return new o(y,T.h)}function W(T,_){var y=_>>5;_%=32;for(var E=T.g.length-y,b=[],R=0;R<E;R++)b[R]=0<_?T.i(R+y)>>>_|T.i(R+y+1)<<32-_:T.i(R+y);return new o(b,T.h)}r.prototype.digest=r.prototype.v,r.prototype.reset=r.prototype.s,r.prototype.update=r.prototype.u,mg=r,o.prototype.add=o.prototype.add,o.prototype.multiply=o.prototype.j,o.prototype.modulo=o.prototype.A,o.prototype.compare=o.prototype.l,o.prototype.toNumber=o.prototype.m,o.prototype.toString=o.prototype.toString,o.prototype.getBits=o.prototype.i,o.fromNumber=h,o.fromString=f,bn=o}).apply(typeof wf<"u"?wf:typeof self<"u"?self:typeof window<"u"?window:{});var zo=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var pg,pi,gg,Jo,Mu,_g,yg,vg;(function(){var n,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(a,l,d){return a==Array.prototype||a==Object.prototype||(a[l]=d.value),a};function t(a){a=[typeof globalThis=="object"&&globalThis,a,typeof window=="object"&&window,typeof self=="object"&&self,typeof zo=="object"&&zo];for(var l=0;l<a.length;++l){var d=a[l];if(d&&d.Math==Math)return d}throw Error("Cannot find global object")}var r=t(this);function s(a,l){if(l)e:{var d=r;a=a.split(".");for(var g=0;g<a.length-1;g++){var S=a[g];if(!(S in d))break e;d=d[S]}a=a[a.length-1],g=d[a],l=l(g),l!=g&&l!=null&&e(d,a,{configurable:!0,writable:!0,value:l})}}function i(a,l){a instanceof String&&(a+="");var d=0,g=!1,S={next:function(){if(!g&&d<a.length){var k=d++;return{value:l(k,a[k]),done:!1}}return g=!0,{done:!0,value:void 0}}};return S[Symbol.iterator]=function(){return S},S}s("Array.prototype.values",function(a){return a||function(){return i(this,function(l,d){return d})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var o=o||{},c=this||self;function u(a){var l=typeof a;return l=l!="object"?l:a?Array.isArray(a)?"array":l:"null",l=="array"||l=="object"&&typeof a.length=="number"}function h(a){var l=typeof a;return l=="object"&&a!=null||l=="function"}function f(a,l,d){return a.call.apply(a.bind,arguments)}function m(a,l,d){if(!a)throw Error();if(2<arguments.length){var g=Array.prototype.slice.call(arguments,2);return function(){var S=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(S,g),a.apply(l,S)}}return function(){return a.apply(l,arguments)}}function p(a,l,d){return p=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?f:m,p.apply(null,arguments)}function w(a,l){var d=Array.prototype.slice.call(arguments,1);return function(){var g=d.slice();return g.push.apply(g,arguments),a.apply(this,g)}}function C(a,l){function d(){}d.prototype=l.prototype,a.aa=l.prototype,a.prototype=new d,a.prototype.constructor=a,a.Qb=function(g,S,k){for(var B=Array(arguments.length-2),le=2;le<arguments.length;le++)B[le-2]=arguments[le];return l.prototype[S].apply(g,B)}}function D(a){const l=a.length;if(0<l){const d=Array(l);for(let g=0;g<l;g++)d[g]=a[g];return d}return[]}function P(a,l){for(let d=1;d<arguments.length;d++){const g=arguments[d];if(u(g)){const S=a.length||0,k=g.length||0;a.length=S+k;for(let B=0;B<k;B++)a[S+B]=g[B]}else a.push(g)}}class F{constructor(l,d){this.i=l,this.j=d,this.h=0,this.g=null}get(){let l;return 0<this.h?(this.h--,l=this.g,this.g=l.next,l.next=null):l=this.i(),l}}function L(a){return/^[\s\xa0]*$/.test(a)}function O(){var a=c.navigator;return a&&(a=a.userAgent)?a:""}function U(a){return U[" "](a),a}U[" "]=function(){};var N=O().indexOf("Gecko")!=-1&&!(O().toLowerCase().indexOf("webkit")!=-1&&O().indexOf("Edge")==-1)&&!(O().indexOf("Trident")!=-1||O().indexOf("MSIE")!=-1)&&O().indexOf("Edge")==-1;function W(a,l,d){for(const g in a)l.call(d,a[g],g,a)}function T(a,l){for(const d in a)l.call(void 0,a[d],d,a)}function _(a){const l={};for(const d in a)l[d]=a[d];return l}const y="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function E(a,l){let d,g;for(let S=1;S<arguments.length;S++){g=arguments[S];for(d in g)a[d]=g[d];for(let k=0;k<y.length;k++)d=y[k],Object.prototype.hasOwnProperty.call(g,d)&&(a[d]=g[d])}}function b(a){var l=1;a=a.split(":");const d=[];for(;0<l&&a.length;)d.push(a.shift()),l--;return a.length&&d.push(a.join(":")),d}function R(a){c.setTimeout(()=>{throw a},0)}function I(){var a=Sc;let l=null;return a.g&&(l=a.g,a.g=a.g.next,a.g||(a.h=null),l.next=null),l}class He{constructor(){this.h=this.g=null}add(l,d){const g=vt.get();g.set(l,d),this.h?this.h.next=g:this.g=g,this.h=g}}var vt=new F(()=>new Tv,a=>a.reset());class Tv{constructor(){this.next=this.g=this.h=null}set(l,d){this.h=l,this.g=d,this.next=null}reset(){this.next=this.g=this.h=null}}let Ws,Hs=!1,Sc=new He,Nh=()=>{const a=c.Promise.resolve(void 0);Ws=()=>{a.then(bv)}};var bv=()=>{for(var a;a=I();){try{a.h.call(a.g)}catch(d){R(d)}var l=vt;l.j(a),100>l.h&&(l.h++,a.next=l.g,l.g=a)}Hs=!1};function Kt(){this.s=this.s,this.C=this.C}Kt.prototype.s=!1,Kt.prototype.ma=function(){this.s||(this.s=!0,this.N())},Kt.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function Ve(a,l){this.type=a,this.g=this.target=l,this.defaultPrevented=!1}Ve.prototype.h=function(){this.defaultPrevented=!0};var Av=function(){if(!c.addEventListener||!Object.defineProperty)return!1;var a=!1,l=Object.defineProperty({},"passive",{get:function(){a=!0}});try{const d=()=>{};c.addEventListener("test",d,l),c.removeEventListener("test",d,l)}catch{}return a}();function Gs(a,l){if(Ve.call(this,a?a.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,a){var d=this.type=a.type,g=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;if(this.target=a.target||a.srcElement,this.g=l,l=a.relatedTarget){if(N){e:{try{U(l.nodeName);var S=!0;break e}catch{}S=!1}S||(l=null)}}else d=="mouseover"?l=a.fromElement:d=="mouseout"&&(l=a.toElement);this.relatedTarget=l,g?(this.clientX=g.clientX!==void 0?g.clientX:g.pageX,this.clientY=g.clientY!==void 0?g.clientY:g.pageY,this.screenX=g.screenX||0,this.screenY=g.screenY||0):(this.clientX=a.clientX!==void 0?a.clientX:a.pageX,this.clientY=a.clientY!==void 0?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0),this.button=a.button,this.key=a.key||"",this.ctrlKey=a.ctrlKey,this.altKey=a.altKey,this.shiftKey=a.shiftKey,this.metaKey=a.metaKey,this.pointerId=a.pointerId||0,this.pointerType=typeof a.pointerType=="string"?a.pointerType:Sv[a.pointerType]||"",this.state=a.state,this.i=a,a.defaultPrevented&&Gs.aa.h.call(this)}}C(Gs,Ve);var Sv={2:"touch",3:"pen",4:"mouse"};Gs.prototype.h=function(){Gs.aa.h.call(this);var a=this.i;a.preventDefault?a.preventDefault():a.returnValue=!1};var wo="closure_listenable_"+(1e6*Math.random()|0),Pv=0;function Rv(a,l,d,g,S){this.listener=a,this.proxy=null,this.src=l,this.type=d,this.capture=!!g,this.ha=S,this.key=++Pv,this.da=this.fa=!1}function Eo(a){a.da=!0,a.listener=null,a.proxy=null,a.src=null,a.ha=null}function To(a){this.src=a,this.g={},this.h=0}To.prototype.add=function(a,l,d,g,S){var k=a.toString();a=this.g[k],a||(a=this.g[k]=[],this.h++);var B=Rc(a,l,g,S);return-1<B?(l=a[B],d||(l.fa=!1)):(l=new Rv(l,this.src,k,!!g,S),l.fa=d,a.push(l)),l};function Pc(a,l){var d=l.type;if(d in a.g){var g=a.g[d],S=Array.prototype.indexOf.call(g,l,void 0),k;(k=0<=S)&&Array.prototype.splice.call(g,S,1),k&&(Eo(l),a.g[d].length==0&&(delete a.g[d],a.h--))}}function Rc(a,l,d,g){for(var S=0;S<a.length;++S){var k=a[S];if(!k.da&&k.listener==l&&k.capture==!!d&&k.ha==g)return S}return-1}var Cc="closure_lm_"+(1e6*Math.random()|0),Dc={};function Mh(a,l,d,g,S){if(Array.isArray(l)){for(var k=0;k<l.length;k++)Mh(a,l[k],d,g,S);return null}return d=Uh(d),a&&a[wo]?a.K(l,d,h(g)?!!g.capture:!1,S):Cv(a,l,d,!1,g,S)}function Cv(a,l,d,g,S,k){if(!l)throw Error("Invalid event type");var B=h(S)?!!S.capture:!!S,le=Vc(a);if(le||(a[Cc]=le=new To(a)),d=le.add(l,d,g,B,k),d.proxy)return d;if(g=Dv(),d.proxy=g,g.src=a,g.listener=d,a.addEventListener)Av||(S=B),S===void 0&&(S=!1),a.addEventListener(l.toString(),g,S);else if(a.attachEvent)a.attachEvent(Lh(l.toString()),g);else if(a.addListener&&a.removeListener)a.addListener(g);else throw Error("addEventListener and attachEvent are unavailable.");return d}function Dv(){function a(d){return l.call(a.src,a.listener,d)}const l=kv;return a}function Fh(a,l,d,g,S){if(Array.isArray(l))for(var k=0;k<l.length;k++)Fh(a,l[k],d,g,S);else g=h(g)?!!g.capture:!!g,d=Uh(d),a&&a[wo]?(a=a.i,l=String(l).toString(),l in a.g&&(k=a.g[l],d=Rc(k,d,g,S),-1<d&&(Eo(k[d]),Array.prototype.splice.call(k,d,1),k.length==0&&(delete a.g[l],a.h--)))):a&&(a=Vc(a))&&(l=a.g[l.toString()],a=-1,l&&(a=Rc(l,d,g,S)),(d=-1<a?l[a]:null)&&kc(d))}function kc(a){if(typeof a!="number"&&a&&!a.da){var l=a.src;if(l&&l[wo])Pc(l.i,a);else{var d=a.type,g=a.proxy;l.removeEventListener?l.removeEventListener(d,g,a.capture):l.detachEvent?l.detachEvent(Lh(d),g):l.addListener&&l.removeListener&&l.removeListener(g),(d=Vc(l))?(Pc(d,a),d.h==0&&(d.src=null,l[Cc]=null)):Eo(a)}}}function Lh(a){return a in Dc?Dc[a]:Dc[a]="on"+a}function kv(a,l){if(a.da)a=!0;else{l=new Gs(l,this);var d=a.listener,g=a.ha||a.src;a.fa&&kc(a),a=d.call(g,l)}return a}function Vc(a){return a=a[Cc],a instanceof To?a:null}var Oc="__closure_events_fn_"+(1e9*Math.random()>>>0);function Uh(a){return typeof a=="function"?a:(a[Oc]||(a[Oc]=function(l){return a.handleEvent(l)}),a[Oc])}function Oe(){Kt.call(this),this.i=new To(this),this.M=this,this.F=null}C(Oe,Kt),Oe.prototype[wo]=!0,Oe.prototype.removeEventListener=function(a,l,d,g){Fh(this,a,l,d,g)};function Be(a,l){var d,g=a.F;if(g)for(d=[];g;g=g.F)d.push(g);if(a=a.M,g=l.type||l,typeof l=="string")l=new Ve(l,a);else if(l instanceof Ve)l.target=l.target||a;else{var S=l;l=new Ve(g,a),E(l,S)}if(S=!0,d)for(var k=d.length-1;0<=k;k--){var B=l.g=d[k];S=bo(B,g,!0,l)&&S}if(B=l.g=a,S=bo(B,g,!0,l)&&S,S=bo(B,g,!1,l)&&S,d)for(k=0;k<d.length;k++)B=l.g=d[k],S=bo(B,g,!1,l)&&S}Oe.prototype.N=function(){if(Oe.aa.N.call(this),this.i){var a=this.i,l;for(l in a.g){for(var d=a.g[l],g=0;g<d.length;g++)Eo(d[g]);delete a.g[l],a.h--}}this.F=null},Oe.prototype.K=function(a,l,d,g){return this.i.add(String(a),l,!1,d,g)},Oe.prototype.L=function(a,l,d,g){return this.i.add(String(a),l,!0,d,g)};function bo(a,l,d,g){if(l=a.i.g[String(l)],!l)return!0;l=l.concat();for(var S=!0,k=0;k<l.length;++k){var B=l[k];if(B&&!B.da&&B.capture==d){var le=B.listener,De=B.ha||B.src;B.fa&&Pc(a.i,B),S=le.call(De,g)!==!1&&S}}return S&&!g.defaultPrevented}function Bh(a,l,d){if(typeof a=="function")d&&(a=p(a,d));else if(a&&typeof a.handleEvent=="function")a=p(a.handleEvent,a);else throw Error("Invalid listener argument");return 2147483647<Number(l)?-1:c.setTimeout(a,l||0)}function jh(a){a.g=Bh(()=>{a.g=null,a.i&&(a.i=!1,jh(a))},a.l);const l=a.h;a.h=null,a.m.apply(null,l)}class Vv extends Kt{constructor(l,d){super(),this.m=l,this.l=d,this.h=null,this.i=!1,this.g=null}j(l){this.h=arguments,this.g?this.i=!0:jh(this)}N(){super.N(),this.g&&(c.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Ks(a){Kt.call(this),this.h=a,this.g={}}C(Ks,Kt);var $h=[];function qh(a){W(a.g,function(l,d){this.g.hasOwnProperty(d)&&kc(l)},a),a.g={}}Ks.prototype.N=function(){Ks.aa.N.call(this),qh(this)},Ks.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var xc=c.JSON.stringify,Ov=c.JSON.parse,xv=class{stringify(a){return c.JSON.stringify(a,void 0)}parse(a){return c.JSON.parse(a,void 0)}};function Nc(){}Nc.prototype.h=null;function zh(a){return a.h||(a.h=a.i())}function Wh(){}var Qs={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function Mc(){Ve.call(this,"d")}C(Mc,Ve);function Fc(){Ve.call(this,"c")}C(Fc,Ve);var Un={},Hh=null;function Ao(){return Hh=Hh||new Oe}Un.La="serverreachability";function Gh(a){Ve.call(this,Un.La,a)}C(Gh,Ve);function Ys(a){const l=Ao();Be(l,new Gh(l))}Un.STAT_EVENT="statevent";function Kh(a,l){Ve.call(this,Un.STAT_EVENT,a),this.stat=l}C(Kh,Ve);function je(a){const l=Ao();Be(l,new Kh(l,a))}Un.Ma="timingevent";function Qh(a,l){Ve.call(this,Un.Ma,a),this.size=l}C(Qh,Ve);function Xs(a,l){if(typeof a!="function")throw Error("Fn must not be null and must be a function");return c.setTimeout(function(){a()},l)}function Js(){this.g=!0}Js.prototype.xa=function(){this.g=!1};function Nv(a,l,d,g,S,k){a.info(function(){if(a.g)if(k)for(var B="",le=k.split("&"),De=0;De<le.length;De++){var re=le[De].split("=");if(1<re.length){var xe=re[0];re=re[1];var Ne=xe.split("_");B=2<=Ne.length&&Ne[1]=="type"?B+(xe+"="+re+"&"):B+(xe+"=redacted&")}}else B=null;else B=k;return"XMLHTTP REQ ("+g+") [attempt "+S+"]: "+l+`
`+d+`
`+B})}function Mv(a,l,d,g,S,k,B){a.info(function(){return"XMLHTTP RESP ("+g+") [ attempt "+S+"]: "+l+`
`+d+`
`+k+" "+B})}function Pr(a,l,d,g){a.info(function(){return"XMLHTTP TEXT ("+l+"): "+Lv(a,d)+(g?" "+g:"")})}function Fv(a,l){a.info(function(){return"TIMEOUT: "+l})}Js.prototype.info=function(){};function Lv(a,l){if(!a.g)return l;if(!l)return null;try{var d=JSON.parse(l);if(d){for(a=0;a<d.length;a++)if(Array.isArray(d[a])){var g=d[a];if(!(2>g.length)){var S=g[1];if(Array.isArray(S)&&!(1>S.length)){var k=S[0];if(k!="noop"&&k!="stop"&&k!="close")for(var B=1;B<S.length;B++)S[B]=""}}}}return xc(d)}catch{return l}}var So={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},Yh={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},Lc;function Po(){}C(Po,Nc),Po.prototype.g=function(){return new XMLHttpRequest},Po.prototype.i=function(){return{}},Lc=new Po;function Qt(a,l,d,g){this.j=a,this.i=l,this.l=d,this.R=g||1,this.U=new Ks(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new Xh}function Xh(){this.i=null,this.g="",this.h=!1}var Jh={},Uc={};function Bc(a,l,d){a.L=1,a.v=ko(Ot(l)),a.m=d,a.P=!0,Zh(a,null)}function Zh(a,l){a.F=Date.now(),Ro(a),a.A=Ot(a.v);var d=a.A,g=a.R;Array.isArray(g)||(g=[String(g)]),fd(d.i,"t",g),a.C=0,d=a.j.J,a.h=new Xh,a.g=kd(a.j,d?l:null,!a.m),0<a.O&&(a.M=new Vv(p(a.Y,a,a.g),a.O)),l=a.U,d=a.g,g=a.ca;var S="readystatechange";Array.isArray(S)||(S&&($h[0]=S.toString()),S=$h);for(var k=0;k<S.length;k++){var B=Mh(d,S[k],g||l.handleEvent,!1,l.h||l);if(!B)break;l.g[B.key]=B}l=a.H?_(a.H):{},a.m?(a.u||(a.u="POST"),l["Content-Type"]="application/x-www-form-urlencoded",a.g.ea(a.A,a.u,a.m,l)):(a.u="GET",a.g.ea(a.A,a.u,null,l)),Ys(),Nv(a.i,a.u,a.A,a.l,a.R,a.m)}Qt.prototype.ca=function(a){a=a.target;const l=this.M;l&&xt(a)==3?l.j():this.Y(a)},Qt.prototype.Y=function(a){try{if(a==this.g)e:{const Ne=xt(this.g);var l=this.g.Ba();const Dr=this.g.Z();if(!(3>Ne)&&(Ne!=3||this.g&&(this.h.h||this.g.oa()||Id(this.g)))){this.J||Ne!=4||l==7||(l==8||0>=Dr?Ys(3):Ys(2)),jc(this);var d=this.g.Z();this.X=d;t:if(ed(this)){var g=Id(this.g);a="";var S=g.length,k=xt(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){Bn(this),Zs(this);var B="";break t}this.h.i=new c.TextDecoder}for(l=0;l<S;l++)this.h.h=!0,a+=this.h.i.decode(g[l],{stream:!(k&&l==S-1)});g.length=0,this.h.g+=a,this.C=0,B=this.h.g}else B=this.g.oa();if(this.o=d==200,Mv(this.i,this.u,this.A,this.l,this.R,Ne,d),this.o){if(this.T&&!this.K){t:{if(this.g){var le,De=this.g;if((le=De.g?De.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!L(le)){var re=le;break t}}re=null}if(d=re)Pr(this.i,this.l,d,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,$c(this,d);else{this.o=!1,this.s=3,je(12),Bn(this),Zs(this);break e}}if(this.P){d=!0;let ut;for(;!this.J&&this.C<B.length;)if(ut=Uv(this,B),ut==Uc){Ne==4&&(this.s=4,je(14),d=!1),Pr(this.i,this.l,null,"[Incomplete Response]");break}else if(ut==Jh){this.s=4,je(15),Pr(this.i,this.l,B,"[Invalid Chunk]"),d=!1;break}else Pr(this.i,this.l,ut,null),$c(this,ut);if(ed(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),Ne!=4||B.length!=0||this.h.h||(this.s=1,je(16),d=!1),this.o=this.o&&d,!d)Pr(this.i,this.l,B,"[Invalid Chunked Response]"),Bn(this),Zs(this);else if(0<B.length&&!this.W){this.W=!0;var xe=this.j;xe.g==this&&xe.ba&&!xe.M&&(xe.j.info("Great, no buffering proxy detected. Bytes received: "+B.length),Kc(xe),xe.M=!0,je(11))}}else Pr(this.i,this.l,B,null),$c(this,B);Ne==4&&Bn(this),this.o&&!this.J&&(Ne==4?Pd(this.j,this):(this.o=!1,Ro(this)))}else nI(this.g),d==400&&0<B.indexOf("Unknown SID")?(this.s=3,je(12)):(this.s=0,je(13)),Bn(this),Zs(this)}}}catch{}finally{}};function ed(a){return a.g?a.u=="GET"&&a.L!=2&&a.j.Ca:!1}function Uv(a,l){var d=a.C,g=l.indexOf(`
`,d);return g==-1?Uc:(d=Number(l.substring(d,g)),isNaN(d)?Jh:(g+=1,g+d>l.length?Uc:(l=l.slice(g,g+d),a.C=g+d,l)))}Qt.prototype.cancel=function(){this.J=!0,Bn(this)};function Ro(a){a.S=Date.now()+a.I,td(a,a.I)}function td(a,l){if(a.B!=null)throw Error("WatchDog timer not null");a.B=Xs(p(a.ba,a),l)}function jc(a){a.B&&(c.clearTimeout(a.B),a.B=null)}Qt.prototype.ba=function(){this.B=null;const a=Date.now();0<=a-this.S?(Fv(this.i,this.A),this.L!=2&&(Ys(),je(17)),Bn(this),this.s=2,Zs(this)):td(this,this.S-a)};function Zs(a){a.j.G==0||a.J||Pd(a.j,a)}function Bn(a){jc(a);var l=a.M;l&&typeof l.ma=="function"&&l.ma(),a.M=null,qh(a.U),a.g&&(l=a.g,a.g=null,l.abort(),l.ma())}function $c(a,l){try{var d=a.j;if(d.G!=0&&(d.g==a||qc(d.h,a))){if(!a.K&&qc(d.h,a)&&d.G==3){try{var g=d.Da.g.parse(l)}catch{g=null}if(Array.isArray(g)&&g.length==3){var S=g;if(S[0]==0){e:if(!d.u){if(d.g)if(d.g.F+3e3<a.F)Fo(d),No(d);else break e;Gc(d),je(18)}}else d.za=S[1],0<d.za-d.T&&37500>S[2]&&d.F&&d.v==0&&!d.C&&(d.C=Xs(p(d.Za,d),6e3));if(1>=sd(d.h)&&d.ca){try{d.ca()}catch{}d.ca=void 0}}else $n(d,11)}else if((a.K||d.g==a)&&Fo(d),!L(l))for(S=d.Da.g.parse(l),l=0;l<S.length;l++){let re=S[l];if(d.T=re[0],re=re[1],d.G==2)if(re[0]=="c"){d.K=re[1],d.ia=re[2];const xe=re[3];xe!=null&&(d.la=xe,d.j.info("VER="+d.la));const Ne=re[4];Ne!=null&&(d.Aa=Ne,d.j.info("SVER="+d.Aa));const Dr=re[5];Dr!=null&&typeof Dr=="number"&&0<Dr&&(g=1.5*Dr,d.L=g,d.j.info("backChannelRequestTimeoutMs_="+g)),g=d;const ut=a.g;if(ut){const Uo=ut.g?ut.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Uo){var k=g.h;k.g||Uo.indexOf("spdy")==-1&&Uo.indexOf("quic")==-1&&Uo.indexOf("h2")==-1||(k.j=k.l,k.g=new Set,k.h&&(zc(k,k.h),k.h=null))}if(g.D){const Qc=ut.g?ut.g.getResponseHeader("X-HTTP-Session-Id"):null;Qc&&(g.ya=Qc,me(g.I,g.D,Qc))}}d.G=3,d.l&&d.l.ua(),d.ba&&(d.R=Date.now()-a.F,d.j.info("Handshake RTT: "+d.R+"ms")),g=d;var B=a;if(g.qa=Dd(g,g.J?g.ia:null,g.W),B.K){id(g.h,B);var le=B,De=g.L;De&&(le.I=De),le.B&&(jc(le),Ro(le)),g.g=B}else Ad(g);0<d.i.length&&Mo(d)}else re[0]!="stop"&&re[0]!="close"||$n(d,7);else d.G==3&&(re[0]=="stop"||re[0]=="close"?re[0]=="stop"?$n(d,7):Hc(d):re[0]!="noop"&&d.l&&d.l.ta(re),d.v=0)}}Ys(4)}catch{}}var Bv=class{constructor(a,l){this.g=a,this.map=l}};function nd(a){this.l=a||10,c.PerformanceNavigationTiming?(a=c.performance.getEntriesByType("navigation"),a=0<a.length&&(a[0].nextHopProtocol=="hq"||a[0].nextHopProtocol=="h2")):a=!!(c.chrome&&c.chrome.loadTimes&&c.chrome.loadTimes()&&c.chrome.loadTimes().wasFetchedViaSpdy),this.j=a?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function rd(a){return a.h?!0:a.g?a.g.size>=a.j:!1}function sd(a){return a.h?1:a.g?a.g.size:0}function qc(a,l){return a.h?a.h==l:a.g?a.g.has(l):!1}function zc(a,l){a.g?a.g.add(l):a.h=l}function id(a,l){a.h&&a.h==l?a.h=null:a.g&&a.g.has(l)&&a.g.delete(l)}nd.prototype.cancel=function(){if(this.i=od(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const a of this.g.values())a.cancel();this.g.clear()}};function od(a){if(a.h!=null)return a.i.concat(a.h.D);if(a.g!=null&&a.g.size!==0){let l=a.i;for(const d of a.g.values())l=l.concat(d.D);return l}return D(a.i)}function jv(a){if(a.V&&typeof a.V=="function")return a.V();if(typeof Map<"u"&&a instanceof Map||typeof Set<"u"&&a instanceof Set)return Array.from(a.values());if(typeof a=="string")return a.split("");if(u(a)){for(var l=[],d=a.length,g=0;g<d;g++)l.push(a[g]);return l}l=[],d=0;for(g in a)l[d++]=a[g];return l}function $v(a){if(a.na&&typeof a.na=="function")return a.na();if(!a.V||typeof a.V!="function"){if(typeof Map<"u"&&a instanceof Map)return Array.from(a.keys());if(!(typeof Set<"u"&&a instanceof Set)){if(u(a)||typeof a=="string"){var l=[];a=a.length;for(var d=0;d<a;d++)l.push(d);return l}l=[],d=0;for(const g in a)l[d++]=g;return l}}}function ad(a,l){if(a.forEach&&typeof a.forEach=="function")a.forEach(l,void 0);else if(u(a)||typeof a=="string")Array.prototype.forEach.call(a,l,void 0);else for(var d=$v(a),g=jv(a),S=g.length,k=0;k<S;k++)l.call(void 0,g[k],d&&d[k],a)}var cd=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function qv(a,l){if(a){a=a.split("&");for(var d=0;d<a.length;d++){var g=a[d].indexOf("="),S=null;if(0<=g){var k=a[d].substring(0,g);S=a[d].substring(g+1)}else k=a[d];l(k,S?decodeURIComponent(S.replace(/\+/g," ")):"")}}}function jn(a){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,a instanceof jn){this.h=a.h,Co(this,a.j),this.o=a.o,this.g=a.g,Do(this,a.s),this.l=a.l;var l=a.i,d=new ni;d.i=l.i,l.g&&(d.g=new Map(l.g),d.h=l.h),ud(this,d),this.m=a.m}else a&&(l=String(a).match(cd))?(this.h=!1,Co(this,l[1]||"",!0),this.o=ei(l[2]||""),this.g=ei(l[3]||"",!0),Do(this,l[4]),this.l=ei(l[5]||"",!0),ud(this,l[6]||"",!0),this.m=ei(l[7]||"")):(this.h=!1,this.i=new ni(null,this.h))}jn.prototype.toString=function(){var a=[],l=this.j;l&&a.push(ti(l,ld,!0),":");var d=this.g;return(d||l=="file")&&(a.push("//"),(l=this.o)&&a.push(ti(l,ld,!0),"@"),a.push(encodeURIComponent(String(d)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),d=this.s,d!=null&&a.push(":",String(d))),(d=this.l)&&(this.g&&d.charAt(0)!="/"&&a.push("/"),a.push(ti(d,d.charAt(0)=="/"?Hv:Wv,!0))),(d=this.i.toString())&&a.push("?",d),(d=this.m)&&a.push("#",ti(d,Kv)),a.join("")};function Ot(a){return new jn(a)}function Co(a,l,d){a.j=d?ei(l,!0):l,a.j&&(a.j=a.j.replace(/:$/,""))}function Do(a,l){if(l){if(l=Number(l),isNaN(l)||0>l)throw Error("Bad port number "+l);a.s=l}else a.s=null}function ud(a,l,d){l instanceof ni?(a.i=l,Qv(a.i,a.h)):(d||(l=ti(l,Gv)),a.i=new ni(l,a.h))}function me(a,l,d){a.i.set(l,d)}function ko(a){return me(a,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),a}function ei(a,l){return a?l?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}function ti(a,l,d){return typeof a=="string"?(a=encodeURI(a).replace(l,zv),d&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function zv(a){return a=a.charCodeAt(0),"%"+(a>>4&15).toString(16)+(a&15).toString(16)}var ld=/[#\/\?@]/g,Wv=/[#\?:]/g,Hv=/[#\?]/g,Gv=/[#\?@]/g,Kv=/#/g;function ni(a,l){this.h=this.g=null,this.i=a||null,this.j=!!l}function Yt(a){a.g||(a.g=new Map,a.h=0,a.i&&qv(a.i,function(l,d){a.add(decodeURIComponent(l.replace(/\+/g," ")),d)}))}n=ni.prototype,n.add=function(a,l){Yt(this),this.i=null,a=Rr(this,a);var d=this.g.get(a);return d||this.g.set(a,d=[]),d.push(l),this.h+=1,this};function hd(a,l){Yt(a),l=Rr(a,l),a.g.has(l)&&(a.i=null,a.h-=a.g.get(l).length,a.g.delete(l))}function dd(a,l){return Yt(a),l=Rr(a,l),a.g.has(l)}n.forEach=function(a,l){Yt(this),this.g.forEach(function(d,g){d.forEach(function(S){a.call(l,S,g,this)},this)},this)},n.na=function(){Yt(this);const a=Array.from(this.g.values()),l=Array.from(this.g.keys()),d=[];for(let g=0;g<l.length;g++){const S=a[g];for(let k=0;k<S.length;k++)d.push(l[g])}return d},n.V=function(a){Yt(this);let l=[];if(typeof a=="string")dd(this,a)&&(l=l.concat(this.g.get(Rr(this,a))));else{a=Array.from(this.g.values());for(let d=0;d<a.length;d++)l=l.concat(a[d])}return l},n.set=function(a,l){return Yt(this),this.i=null,a=Rr(this,a),dd(this,a)&&(this.h-=this.g.get(a).length),this.g.set(a,[l]),this.h+=1,this},n.get=function(a,l){return a?(a=this.V(a),0<a.length?String(a[0]):l):l};function fd(a,l,d){hd(a,l),0<d.length&&(a.i=null,a.g.set(Rr(a,l),D(d)),a.h+=d.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const a=[],l=Array.from(this.g.keys());for(var d=0;d<l.length;d++){var g=l[d];const k=encodeURIComponent(String(g)),B=this.V(g);for(g=0;g<B.length;g++){var S=k;B[g]!==""&&(S+="="+encodeURIComponent(String(B[g]))),a.push(S)}}return this.i=a.join("&")};function Rr(a,l){return l=String(l),a.j&&(l=l.toLowerCase()),l}function Qv(a,l){l&&!a.j&&(Yt(a),a.i=null,a.g.forEach(function(d,g){var S=g.toLowerCase();g!=S&&(hd(this,g),fd(this,S,d))},a)),a.j=l}function Yv(a,l){const d=new Js;if(c.Image){const g=new Image;g.onload=w(Xt,d,"TestLoadImage: loaded",!0,l,g),g.onerror=w(Xt,d,"TestLoadImage: error",!1,l,g),g.onabort=w(Xt,d,"TestLoadImage: abort",!1,l,g),g.ontimeout=w(Xt,d,"TestLoadImage: timeout",!1,l,g),c.setTimeout(function(){g.ontimeout&&g.ontimeout()},1e4),g.src=a}else l(!1)}function Xv(a,l){const d=new Js,g=new AbortController,S=setTimeout(()=>{g.abort(),Xt(d,"TestPingServer: timeout",!1,l)},1e4);fetch(a,{signal:g.signal}).then(k=>{clearTimeout(S),k.ok?Xt(d,"TestPingServer: ok",!0,l):Xt(d,"TestPingServer: server error",!1,l)}).catch(()=>{clearTimeout(S),Xt(d,"TestPingServer: error",!1,l)})}function Xt(a,l,d,g,S){try{S&&(S.onload=null,S.onerror=null,S.onabort=null,S.ontimeout=null),g(d)}catch{}}function Jv(){this.g=new xv}function Zv(a,l,d){const g=d||"";try{ad(a,function(S,k){let B=S;h(S)&&(B=xc(S)),l.push(g+k+"="+encodeURIComponent(B))})}catch(S){throw l.push(g+"type="+encodeURIComponent("_badmap")),S}}function Vo(a){this.l=a.Ub||null,this.j=a.eb||!1}C(Vo,Nc),Vo.prototype.g=function(){return new Oo(this.l,this.j)},Vo.prototype.i=function(a){return function(){return a}}({});function Oo(a,l){Oe.call(this),this.D=a,this.o=l,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}C(Oo,Oe),n=Oo.prototype,n.open=function(a,l){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=a,this.A=l,this.readyState=1,si(this)},n.send=function(a){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const l={headers:this.u,method:this.B,credentials:this.m,cache:void 0};a&&(l.body=a),(this.D||c).fetch(new Request(this.A,l)).then(this.Sa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,ri(this)),this.readyState=0},n.Sa=function(a){if(this.g&&(this.l=a,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=a.headers,this.readyState=2,si(this)),this.g&&(this.readyState=3,si(this),this.g)))if(this.responseType==="arraybuffer")a.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof c.ReadableStream<"u"&&"body"in a){if(this.j=a.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;md(this)}else a.text().then(this.Ra.bind(this),this.ga.bind(this))};function md(a){a.j.read().then(a.Pa.bind(a)).catch(a.ga.bind(a))}n.Pa=function(a){if(this.g){if(this.o&&a.value)this.response.push(a.value);else if(!this.o){var l=a.value?a.value:new Uint8Array(0);(l=this.v.decode(l,{stream:!a.done}))&&(this.response=this.responseText+=l)}a.done?ri(this):si(this),this.readyState==3&&md(this)}},n.Ra=function(a){this.g&&(this.response=this.responseText=a,ri(this))},n.Qa=function(a){this.g&&(this.response=a,ri(this))},n.ga=function(){this.g&&ri(this)};function ri(a){a.readyState=4,a.l=null,a.j=null,a.v=null,si(a)}n.setRequestHeader=function(a,l){this.u.append(a,l)},n.getResponseHeader=function(a){return this.h&&this.h.get(a.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const a=[],l=this.h.entries();for(var d=l.next();!d.done;)d=d.value,a.push(d[0]+": "+d[1]),d=l.next();return a.join(`\r
`)};function si(a){a.onreadystatechange&&a.onreadystatechange.call(a)}Object.defineProperty(Oo.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(a){this.m=a?"include":"same-origin"}});function pd(a){let l="";return W(a,function(d,g){l+=g,l+=":",l+=d,l+=`\r
`}),l}function Wc(a,l,d){e:{for(g in d){var g=!1;break e}g=!0}g||(d=pd(d),typeof a=="string"?d!=null&&encodeURIComponent(String(d)):me(a,l,d))}function ye(a){Oe.call(this),this.headers=new Map,this.o=a||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}C(ye,Oe);var eI=/^https?$/i,tI=["POST","PUT"];n=ye.prototype,n.Ha=function(a){this.J=a},n.ea=function(a,l,d,g){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+a);l=l?l.toUpperCase():"GET",this.D=a,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():Lc.g(),this.v=this.o?zh(this.o):zh(Lc),this.g.onreadystatechange=p(this.Ea,this);try{this.B=!0,this.g.open(l,String(a),!0),this.B=!1}catch(k){gd(this,k);return}if(a=d||"",d=new Map(this.headers),g)if(Object.getPrototypeOf(g)===Object.prototype)for(var S in g)d.set(S,g[S]);else if(typeof g.keys=="function"&&typeof g.get=="function")for(const k of g.keys())d.set(k,g.get(k));else throw Error("Unknown input type for opt_headers: "+String(g));g=Array.from(d.keys()).find(k=>k.toLowerCase()=="content-type"),S=c.FormData&&a instanceof c.FormData,!(0<=Array.prototype.indexOf.call(tI,l,void 0))||g||S||d.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[k,B]of d)this.g.setRequestHeader(k,B);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{vd(this),this.u=!0,this.g.send(a),this.u=!1}catch(k){gd(this,k)}};function gd(a,l){a.h=!1,a.g&&(a.j=!0,a.g.abort(),a.j=!1),a.l=l,a.m=5,_d(a),xo(a)}function _d(a){a.A||(a.A=!0,Be(a,"complete"),Be(a,"error"))}n.abort=function(a){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=a||7,Be(this,"complete"),Be(this,"abort"),xo(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),xo(this,!0)),ye.aa.N.call(this)},n.Ea=function(){this.s||(this.B||this.u||this.j?yd(this):this.bb())},n.bb=function(){yd(this)};function yd(a){if(a.h&&typeof o<"u"&&(!a.v[1]||xt(a)!=4||a.Z()!=2)){if(a.u&&xt(a)==4)Bh(a.Ea,0,a);else if(Be(a,"readystatechange"),xt(a)==4){a.h=!1;try{const B=a.Z();e:switch(B){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var l=!0;break e;default:l=!1}var d;if(!(d=l)){var g;if(g=B===0){var S=String(a.D).match(cd)[1]||null;!S&&c.self&&c.self.location&&(S=c.self.location.protocol.slice(0,-1)),g=!eI.test(S?S.toLowerCase():"")}d=g}if(d)Be(a,"complete"),Be(a,"success");else{a.m=6;try{var k=2<xt(a)?a.g.statusText:""}catch{k=""}a.l=k+" ["+a.Z()+"]",_d(a)}}finally{xo(a)}}}}function xo(a,l){if(a.g){vd(a);const d=a.g,g=a.v[0]?()=>{}:null;a.g=null,a.v=null,l||Be(a,"ready");try{d.onreadystatechange=g}catch{}}}function vd(a){a.I&&(c.clearTimeout(a.I),a.I=null)}n.isActive=function(){return!!this.g};function xt(a){return a.g?a.g.readyState:0}n.Z=function(){try{return 2<xt(this)?this.g.status:-1}catch{return-1}},n.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.Oa=function(a){if(this.g){var l=this.g.responseText;return a&&l.indexOf(a)==0&&(l=l.substring(a.length)),Ov(l)}};function Id(a){try{if(!a.g)return null;if("response"in a.g)return a.g.response;switch(a.H){case"":case"text":return a.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in a.g)return a.g.mozResponseArrayBuffer}return null}catch{return null}}function nI(a){const l={};a=(a.g&&2<=xt(a)&&a.g.getAllResponseHeaders()||"").split(`\r
`);for(let g=0;g<a.length;g++){if(L(a[g]))continue;var d=b(a[g]);const S=d[0];if(d=d[1],typeof d!="string")continue;d=d.trim();const k=l[S]||[];l[S]=k,k.push(d)}T(l,function(g){return g.join(", ")})}n.Ba=function(){return this.m},n.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function ii(a,l,d){return d&&d.internalChannelParams&&d.internalChannelParams[a]||l}function wd(a){this.Aa=0,this.i=[],this.j=new Js,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=ii("failFast",!1,a),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=ii("baseRetryDelayMs",5e3,a),this.cb=ii("retryDelaySeedMs",1e4,a),this.Wa=ii("forwardChannelMaxRetries",2,a),this.wa=ii("forwardChannelRequestTimeoutMs",2e4,a),this.pa=a&&a.xmlHttpFactory||void 0,this.Xa=a&&a.Tb||void 0,this.Ca=a&&a.useFetchStreams||!1,this.L=void 0,this.J=a&&a.supportsCrossDomainXhr||!1,this.K="",this.h=new nd(a&&a.concurrentRequestLimit),this.Da=new Jv,this.P=a&&a.fastHandshake||!1,this.O=a&&a.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=a&&a.Rb||!1,a&&a.xa&&this.j.xa(),a&&a.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&a&&a.detectBufferingProxy||!1,this.ja=void 0,a&&a.longPollingTimeout&&0<a.longPollingTimeout&&(this.ja=a.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}n=wd.prototype,n.la=8,n.G=1,n.connect=function(a,l,d,g){je(0),this.W=a,this.H=l||{},d&&g!==void 0&&(this.H.OSID=d,this.H.OAID=g),this.F=this.X,this.I=Dd(this,null,this.W),Mo(this)};function Hc(a){if(Ed(a),a.G==3){var l=a.U++,d=Ot(a.I);if(me(d,"SID",a.K),me(d,"RID",l),me(d,"TYPE","terminate"),oi(a,d),l=new Qt(a,a.j,l),l.L=2,l.v=ko(Ot(d)),d=!1,c.navigator&&c.navigator.sendBeacon)try{d=c.navigator.sendBeacon(l.v.toString(),"")}catch{}!d&&c.Image&&(new Image().src=l.v,d=!0),d||(l.g=kd(l.j,null),l.g.ea(l.v)),l.F=Date.now(),Ro(l)}Cd(a)}function No(a){a.g&&(Kc(a),a.g.cancel(),a.g=null)}function Ed(a){No(a),a.u&&(c.clearTimeout(a.u),a.u=null),Fo(a),a.h.cancel(),a.s&&(typeof a.s=="number"&&c.clearTimeout(a.s),a.s=null)}function Mo(a){if(!rd(a.h)&&!a.s){a.s=!0;var l=a.Ga;Ws||Nh(),Hs||(Ws(),Hs=!0),Sc.add(l,a),a.B=0}}function rI(a,l){return sd(a.h)>=a.h.j-(a.s?1:0)?!1:a.s?(a.i=l.D.concat(a.i),!0):a.G==1||a.G==2||a.B>=(a.Va?0:a.Wa)?!1:(a.s=Xs(p(a.Ga,a,l),Rd(a,a.B)),a.B++,!0)}n.Ga=function(a){if(this.s)if(this.s=null,this.G==1){if(!a){this.U=Math.floor(1e5*Math.random()),a=this.U++;const S=new Qt(this,this.j,a);let k=this.o;if(this.S&&(k?(k=_(k),E(k,this.S)):k=this.S),this.m!==null||this.O||(S.H=k,k=null),this.P)e:{for(var l=0,d=0;d<this.i.length;d++){t:{var g=this.i[d];if("__data__"in g.map&&(g=g.map.__data__,typeof g=="string")){g=g.length;break t}g=void 0}if(g===void 0)break;if(l+=g,4096<l){l=d;break e}if(l===4096||d===this.i.length-1){l=d+1;break e}}l=1e3}else l=1e3;l=bd(this,S,l),d=Ot(this.I),me(d,"RID",a),me(d,"CVER",22),this.D&&me(d,"X-HTTP-Session-Id",this.D),oi(this,d),k&&(this.O?l="headers="+encodeURIComponent(String(pd(k)))+"&"+l:this.m&&Wc(d,this.m,k)),zc(this.h,S),this.Ua&&me(d,"TYPE","init"),this.P?(me(d,"$req",l),me(d,"SID","null"),S.T=!0,Bc(S,d,null)):Bc(S,d,l),this.G=2}}else this.G==3&&(a?Td(this,a):this.i.length==0||rd(this.h)||Td(this))};function Td(a,l){var d;l?d=l.l:d=a.U++;const g=Ot(a.I);me(g,"SID",a.K),me(g,"RID",d),me(g,"AID",a.T),oi(a,g),a.m&&a.o&&Wc(g,a.m,a.o),d=new Qt(a,a.j,d,a.B+1),a.m===null&&(d.H=a.o),l&&(a.i=l.D.concat(a.i)),l=bd(a,d,1e3),d.I=Math.round(.5*a.wa)+Math.round(.5*a.wa*Math.random()),zc(a.h,d),Bc(d,g,l)}function oi(a,l){a.H&&W(a.H,function(d,g){me(l,g,d)}),a.l&&ad({},function(d,g){me(l,g,d)})}function bd(a,l,d){d=Math.min(a.i.length,d);var g=a.l?p(a.l.Na,a.l,a):null;e:{var S=a.i;let k=-1;for(;;){const B=["count="+d];k==-1?0<d?(k=S[0].g,B.push("ofs="+k)):k=0:B.push("ofs="+k);let le=!0;for(let De=0;De<d;De++){let re=S[De].g;const xe=S[De].map;if(re-=k,0>re)k=Math.max(0,S[De].g-100),le=!1;else try{Zv(xe,B,"req"+re+"_")}catch{g&&g(xe)}}if(le){g=B.join("&");break e}}}return a=a.i.splice(0,d),l.D=a,g}function Ad(a){if(!a.g&&!a.u){a.Y=1;var l=a.Fa;Ws||Nh(),Hs||(Ws(),Hs=!0),Sc.add(l,a),a.v=0}}function Gc(a){return a.g||a.u||3<=a.v?!1:(a.Y++,a.u=Xs(p(a.Fa,a),Rd(a,a.v)),a.v++,!0)}n.Fa=function(){if(this.u=null,Sd(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var a=2*this.R;this.j.info("BP detection timer enabled: "+a),this.A=Xs(p(this.ab,this),a)}},n.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,je(10),No(this),Sd(this))};function Kc(a){a.A!=null&&(c.clearTimeout(a.A),a.A=null)}function Sd(a){a.g=new Qt(a,a.j,"rpc",a.Y),a.m===null&&(a.g.H=a.o),a.g.O=0;var l=Ot(a.qa);me(l,"RID","rpc"),me(l,"SID",a.K),me(l,"AID",a.T),me(l,"CI",a.F?"0":"1"),!a.F&&a.ja&&me(l,"TO",a.ja),me(l,"TYPE","xmlhttp"),oi(a,l),a.m&&a.o&&Wc(l,a.m,a.o),a.L&&(a.g.I=a.L);var d=a.g;a=a.ia,d.L=1,d.v=ko(Ot(l)),d.m=null,d.P=!0,Zh(d,a)}n.Za=function(){this.C!=null&&(this.C=null,No(this),Gc(this),je(19))};function Fo(a){a.C!=null&&(c.clearTimeout(a.C),a.C=null)}function Pd(a,l){var d=null;if(a.g==l){Fo(a),Kc(a),a.g=null;var g=2}else if(qc(a.h,l))d=l.D,id(a.h,l),g=1;else return;if(a.G!=0){if(l.o)if(g==1){d=l.m?l.m.length:0,l=Date.now()-l.F;var S=a.B;g=Ao(),Be(g,new Qh(g,d)),Mo(a)}else Ad(a);else if(S=l.s,S==3||S==0&&0<l.X||!(g==1&&rI(a,l)||g==2&&Gc(a)))switch(d&&0<d.length&&(l=a.h,l.i=l.i.concat(d)),S){case 1:$n(a,5);break;case 4:$n(a,10);break;case 3:$n(a,6);break;default:$n(a,2)}}}function Rd(a,l){let d=a.Ta+Math.floor(Math.random()*a.cb);return a.isActive()||(d*=2),d*l}function $n(a,l){if(a.j.info("Error code "+l),l==2){var d=p(a.fb,a),g=a.Xa;const S=!g;g=new jn(g||"//www.google.com/images/cleardot.gif"),c.location&&c.location.protocol=="http"||Co(g,"https"),ko(g),S?Yv(g.toString(),d):Xv(g.toString(),d)}else je(2);a.G=0,a.l&&a.l.sa(l),Cd(a),Ed(a)}n.fb=function(a){a?(this.j.info("Successfully pinged google.com"),je(2)):(this.j.info("Failed to ping google.com"),je(1))};function Cd(a){if(a.G=0,a.ka=[],a.l){const l=od(a.h);(l.length!=0||a.i.length!=0)&&(P(a.ka,l),P(a.ka,a.i),a.h.i.length=0,D(a.i),a.i.length=0),a.l.ra()}}function Dd(a,l,d){var g=d instanceof jn?Ot(d):new jn(d);if(g.g!="")l&&(g.g=l+"."+g.g),Do(g,g.s);else{var S=c.location;g=S.protocol,l=l?l+"."+S.hostname:S.hostname,S=+S.port;var k=new jn(null);g&&Co(k,g),l&&(k.g=l),S&&Do(k,S),d&&(k.l=d),g=k}return d=a.D,l=a.ya,d&&l&&me(g,d,l),me(g,"VER",a.la),oi(a,g),g}function kd(a,l,d){if(l&&!a.J)throw Error("Can't create secondary domain capable XhrIo object.");return l=a.Ca&&!a.pa?new ye(new Vo({eb:d})):new ye(a.pa),l.Ha(a.J),l}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function Vd(){}n=Vd.prototype,n.ua=function(){},n.ta=function(){},n.sa=function(){},n.ra=function(){},n.isActive=function(){return!0},n.Na=function(){};function Lo(){}Lo.prototype.g=function(a,l){return new Je(a,l)};function Je(a,l){Oe.call(this),this.g=new wd(l),this.l=a,this.h=l&&l.messageUrlParams||null,a=l&&l.messageHeaders||null,l&&l.clientProtocolHeaderRequired&&(a?a["X-Client-Protocol"]="webchannel":a={"X-Client-Protocol":"webchannel"}),this.g.o=a,a=l&&l.initMessageHeaders||null,l&&l.messageContentType&&(a?a["X-WebChannel-Content-Type"]=l.messageContentType:a={"X-WebChannel-Content-Type":l.messageContentType}),l&&l.va&&(a?a["X-WebChannel-Client-Profile"]=l.va:a={"X-WebChannel-Client-Profile":l.va}),this.g.S=a,(a=l&&l.Sb)&&!L(a)&&(this.g.m=a),this.v=l&&l.supportsCrossDomainXhr||!1,this.u=l&&l.sendRawJson||!1,(l=l&&l.httpSessionIdParam)&&!L(l)&&(this.g.D=l,a=this.h,a!==null&&l in a&&(a=this.h,l in a&&delete a[l])),this.j=new Cr(this)}C(Je,Oe),Je.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},Je.prototype.close=function(){Hc(this.g)},Je.prototype.o=function(a){var l=this.g;if(typeof a=="string"){var d={};d.__data__=a,a=d}else this.u&&(d={},d.__data__=xc(a),a=d);l.i.push(new Bv(l.Ya++,a)),l.G==3&&Mo(l)},Je.prototype.N=function(){this.g.l=null,delete this.j,Hc(this.g),delete this.g,Je.aa.N.call(this)};function Od(a){Mc.call(this),a.__headers__&&(this.headers=a.__headers__,this.statusCode=a.__status__,delete a.__headers__,delete a.__status__);var l=a.__sm__;if(l){e:{for(const d in l){a=d;break e}a=void 0}(this.i=a)&&(a=this.i,l=l!==null&&a in l?l[a]:void 0),this.data=l}else this.data=a}C(Od,Mc);function xd(){Fc.call(this),this.status=1}C(xd,Fc);function Cr(a){this.g=a}C(Cr,Vd),Cr.prototype.ua=function(){Be(this.g,"a")},Cr.prototype.ta=function(a){Be(this.g,new Od(a))},Cr.prototype.sa=function(a){Be(this.g,new xd)},Cr.prototype.ra=function(){Be(this.g,"b")},Lo.prototype.createWebChannel=Lo.prototype.g,Je.prototype.send=Je.prototype.o,Je.prototype.open=Je.prototype.m,Je.prototype.close=Je.prototype.close,vg=function(){return new Lo},yg=function(){return Ao()},_g=Un,Mu={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},So.NO_ERROR=0,So.TIMEOUT=8,So.HTTP_ERROR=6,Jo=So,Yh.COMPLETE="complete",gg=Yh,Wh.EventType=Qs,Qs.OPEN="a",Qs.CLOSE="b",Qs.ERROR="c",Qs.MESSAGE="d",Oe.prototype.listen=Oe.prototype.K,pi=Wh,ye.prototype.listenOnce=ye.prototype.L,ye.prototype.getLastError=ye.prototype.Ka,ye.prototype.getLastErrorCode=ye.prototype.Ba,ye.prototype.getStatus=ye.prototype.Z,ye.prototype.getResponseJson=ye.prototype.Oa,ye.prototype.getResponseText=ye.prototype.oa,ye.prototype.send=ye.prototype.ea,ye.prototype.setWithCredentials=ye.prototype.Ha,pg=ye}).apply(typeof zo<"u"?zo:typeof self<"u"?self:typeof window<"u"?window:{});const Ef="@firebase/firestore",Tf="4.8.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ce{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}Ce.UNAUTHENTICATED=new Ce(null),Ce.GOOGLE_CREDENTIALS=new Ce("google-credentials-uid"),Ce.FIRST_PARTY=new Ce("first-party-uid"),Ce.MOCK_USER=new Ce("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Ns="11.10.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pr=new Ub("@firebase/firestore");function Lr(){return pr.logLevel}function x(n,...e){if(pr.logLevel<=ne.DEBUG){const t=e.map(Tl);pr.debug(`Firestore (${Ns}): ${n}`,...t)}}function we(n,...e){if(pr.logLevel<=ne.ERROR){const t=e.map(Tl);pr.error(`Firestore (${Ns}): ${n}`,...t)}}function qt(n,...e){if(pr.logLevel<=ne.WARN){const t=e.map(Tl);pr.warn(`Firestore (${Ns}): ${n}`,...t)}}function Tl(n){if(typeof n=="string")return n;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return function(t){return JSON.stringify(t)}(n)}catch{return n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function q(n,e,t){let r="Unexpected state";typeof e=="string"?r=e:t=e,Ig(n,r,t)}function Ig(n,e,t){let r=`FIRESTORE (${Ns}) INTERNAL ASSERTION FAILED: ${e} (ID: ${n.toString(16)})`;if(t!==void 0)try{r+=" CONTEXT: "+JSON.stringify(t)}catch{r+=" CONTEXT: "+t}throw we(r),new Error(r)}function G(n,e,t,r){let s="Unexpected state";typeof t=="string"?s=t:r=t,n||Ig(e,s,r)}function z(n,e){return n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const V={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class M extends dg{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pt{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wg{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class Bb{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(Ce.UNAUTHENTICATED))}shutdown(){}}class jb{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class $b{constructor(e){this.t=e,this.currentUser=Ce.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){G(this.o===void 0,42304);let r=this.i;const s=u=>this.i!==r?(r=this.i,t(u)):Promise.resolve();let i=new Pt;this.o=()=>{this.i++,this.currentUser=this.u(),i.resolve(),i=new Pt,e.enqueueRetryable(()=>s(this.currentUser))};const o=()=>{const u=i;e.enqueueRetryable(async()=>{await u.promise,await s(this.currentUser)})},c=u=>{x("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=u,this.o&&(this.auth.addAuthTokenListener(this.o),o())};this.t.onInit(u=>c(u)),setTimeout(()=>{if(!this.auth){const u=this.t.getImmediate({optional:!0});u?c(u):(x("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new Pt)}},0),o()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(r=>this.i!==e?(x("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(G(typeof r.accessToken=="string",31837,{l:r}),new wg(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return G(e===null||typeof e=="string",2055,{h:e}),new Ce(e)}}class qb{constructor(e,t,r){this.P=e,this.T=t,this.I=r,this.type="FirstParty",this.user=Ce.FIRST_PARTY,this.A=new Map}R(){return this.I?this.I():null}get headers(){this.A.set("X-Goog-AuthUser",this.P);const e=this.R();return e&&this.A.set("Authorization",e),this.T&&this.A.set("X-Goog-Iam-Authorization-Token",this.T),this.A}}class zb{constructor(e,t,r){this.P=e,this.T=t,this.I=r}getToken(){return Promise.resolve(new qb(this.P,this.T,this.I))}start(e,t){e.enqueueRetryable(()=>t(Ce.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class bf{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Wb{constructor(e,t){this.V=t,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,mt(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,t){G(this.o===void 0,3512);const r=i=>{i.error!=null&&x("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const o=i.token!==this.m;return this.m=i.token,x("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?t(i.token):Promise.resolve()};this.o=i=>{e.enqueueRetryable(()=>r(i))};const s=i=>{x("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(i=>s(i)),setTimeout(()=>{if(!this.appCheck){const i=this.V.getImmediate({optional:!0});i?s(i):x("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new bf(this.p));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(t=>t?(G(typeof t.token=="string",44558,{tokenResult:t}),this.m=t.token,new bf(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Hb(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Eg(){return new TextEncoder}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bl{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let r="";for(;r.length<20;){const s=Hb(40);for(let i=0;i<s.length;++i)r.length<20&&s[i]<t&&(r+=e.charAt(s[i]%62))}return r}}function Q(n,e){return n<e?-1:n>e?1:0}function Fu(n,e){let t=0;for(;t<n.length&&t<e.length;){const r=n.codePointAt(t),s=e.codePointAt(t);if(r!==s){if(r<128&&s<128)return Q(r,s);{const i=Eg(),o=Gb(i.encode(Af(n,t)),i.encode(Af(e,t)));return o!==0?o:Q(r,s)}}t+=r>65535?2:1}return Q(n.length,e.length)}function Af(n,e){return n.codePointAt(e)>65535?n.substring(e,e+2):n.substring(e,e+1)}function Gb(n,e){for(let t=0;t<n.length&&t<e.length;++t)if(n[t]!==e[t])return Q(n[t],e[t]);return Q(n.length,e.length)}function ds(n,e,t){return n.length===e.length&&n.every((r,s)=>t(r,e[s]))}function Tg(n){return n+"\0"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sf="__name__";class It{constructor(e,t,r){t===void 0?t=0:t>e.length&&q(637,{offset:t,range:e.length}),r===void 0?r=e.length-t:r>e.length-t&&q(1746,{length:r,range:e.length-t}),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return It.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof It?e.forEach(r=>{t.push(r)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let s=0;s<r;s++){const i=It.compareSegments(e.get(s),t.get(s));if(i!==0)return i}return Q(e.length,t.length)}static compareSegments(e,t){const r=It.isNumericId(e),s=It.isNumericId(t);return r&&!s?-1:!r&&s?1:r&&s?It.extractNumericId(e).compare(It.extractNumericId(t)):Fu(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return bn.fromString(e.substring(4,e.length-2))}}class se extends It{construct(e,t,r){return new se(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new M(V.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter(s=>s.length>0))}return new se(t)}static emptyPath(){return new se([])}}const Kb=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class _e extends It{construct(e,t,r){return new _e(e,t,r)}static isValidIdentifier(e){return Kb.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),_e.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===Sf}static keyField(){return new _e([Sf])}static fromServerFormat(e){const t=[];let r="",s=0;const i=()=>{if(r.length===0)throw new M(V.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let o=!1;for(;s<e.length;){const c=e[s];if(c==="\\"){if(s+1===e.length)throw new M(V.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const u=e[s+1];if(u!=="\\"&&u!=="."&&u!=="`")throw new M(V.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=u,s+=2}else c==="`"?(o=!o,s++):c!=="."||o?(r+=c,s++):(i(),s++)}if(i(),o)throw new M(V.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new _e(t)}static emptyPath(){return new _e([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ${constructor(e){this.path=e}static fromPath(e){return new $(se.fromString(e))}static fromName(e){return new $(se.fromString(e).popFirst(5))}static empty(){return new $(se.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&se.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return se.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new $(new se(e.slice()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bg(n,e,t){if(!t)throw new M(V.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function Qb(n,e,t,r){if(e===!0&&r===!0)throw new M(V.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function Pf(n){if(!$.isDocumentKey(n))throw new M(V.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function Rf(n){if($.isDocumentKey(n))throw new M(V.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function Ag(n){return typeof n=="object"&&n!==null&&(Object.getPrototypeOf(n)===Object.prototype||Object.getPrototypeOf(n)===null)}function Ya(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":q(12329,{type:typeof n})}function gr(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new M(V.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=Ya(n);throw new M(V.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}function Yb(n,e){if(e<=0)throw new M(V.INVALID_ARGUMENT,`Function ${n}() requires a positive number, but it was: ${e}.`)}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function be(n,e){const t={typeString:n};return e&&(t.value=e),t}function co(n,e){if(!Ag(n))throw new M(V.INVALID_ARGUMENT,"JSON must be an object");let t;for(const r in e)if(e[r]){const s=e[r].typeString,i="value"in e[r]?{value:e[r].value}:void 0;if(!(r in n)){t=`JSON missing required field: '${r}'`;break}const o=n[r];if(s&&typeof o!==s){t=`JSON field '${r}' must be a ${s}.`;break}if(i!==void 0&&o!==i.value){t=`Expected '${r}' field to equal '${i.value}'`;break}}if(t)throw new M(V.INVALID_ARGUMENT,t);return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Cf=-62135596800,Df=1e6;class ae{static now(){return ae.fromMillis(Date.now())}static fromDate(e){return ae.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor((e-1e3*t)*Df);return new ae(t,r)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new M(V.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new M(V.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<Cf)throw new M(V.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new M(V.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/Df}_compareTo(e){return this.seconds===e.seconds?Q(this.nanoseconds,e.nanoseconds):Q(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:ae._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(co(e,ae._jsonSchema))return new ae(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-Cf;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}ae._jsonSchemaVersion="firestore/timestamp/1.0",ae._jsonSchema={type:be("string",ae._jsonSchemaVersion),seconds:be("number"),nanoseconds:be("number")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class K{static fromTimestamp(e){return new K(e)}static min(){return new K(new ae(0,0))}static max(){return new K(new ae(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fs=-1;class Ia{constructor(e,t,r,s){this.indexId=e,this.collectionGroup=t,this.fields=r,this.indexState=s}}function Lu(n){return n.fields.find(e=>e.kind===2)}function Hn(n){return n.fields.filter(e=>e.kind!==2)}Ia.UNKNOWN_ID=-1;class Zo{constructor(e,t){this.fieldPath=e,this.kind=t}}class Li{constructor(e,t){this.sequenceNumber=e,this.offset=t}static empty(){return new Li(0,st.min())}}function Sg(n,e){const t=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,s=K.fromTimestamp(r===1e9?new ae(t+1,0):new ae(t,r));return new st(s,$.empty(),e)}function Pg(n){return new st(n.readTime,n.key,fs)}class st{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new st(K.min(),$.empty(),fs)}static max(){return new st(K.max(),$.empty(),fs)}}function Al(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=$.comparator(n.documentKey,e.documentKey),t!==0?t:Q(n.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rg="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class Cg{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function On(n){if(n.code!==V.FAILED_PRECONDITION||n.message!==Rg)throw n;x("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class A{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)},t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&q(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new A((r,s)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(r,s)},this.catchCallback=i=>{this.wrapFailure(t,i).next(r,s)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{const t=e();return t instanceof A?t:A.resolve(t)}catch(t){return A.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):A.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):A.reject(t)}static resolve(e){return new A((t,r)=>{t(e)})}static reject(e){return new A((t,r)=>{r(e)})}static waitFor(e){return new A((t,r)=>{let s=0,i=0,o=!1;e.forEach(c=>{++s,c.next(()=>{++i,o&&i===s&&t()},u=>r(u))}),o=!0,i===s&&t()})}static or(e){let t=A.resolve(!1);for(const r of e)t=t.next(s=>s?A.resolve(s):r());return t}static forEach(e,t){const r=[];return e.forEach((s,i)=>{r.push(t.call(this,s,i))}),this.waitFor(r)}static mapArray(e,t){return new A((r,s)=>{const i=e.length,o=new Array(i);let c=0;for(let u=0;u<i;u++){const h=u;t(e[h]).next(f=>{o[h]=f,++c,c===i&&r(o)},f=>s(f))}})}static doWhile(e,t){return new A((r,s)=>{const i=()=>{e()===!0?t().next(()=>{i()},s):r()};i()})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const et="SimpleDb";class Xa{static open(e,t,r,s){try{return new Xa(t,e.transaction(s,r))}catch(i){throw new Ei(t,i)}}constructor(e,t){this.action=e,this.transaction=t,this.aborted=!1,this.S=new Pt,this.transaction.oncomplete=()=>{this.S.resolve()},this.transaction.onabort=()=>{t.error?this.S.reject(new Ei(e,t.error)):this.S.resolve()},this.transaction.onerror=r=>{const s=Sl(r.target.error);this.S.reject(new Ei(e,s))}}get D(){return this.S.promise}abort(e){e&&this.S.reject(e),this.aborted||(x(et,"Aborting transaction:",e?e.message:"Client-initiated abort"),this.aborted=!0,this.transaction.abort())}v(){const e=this.transaction;this.aborted||typeof e.commit!="function"||e.commit()}store(e){const t=this.transaction.objectStore(e);return new Jb(t)}}class An{static delete(e){return x(et,"Removing database:",e),Kn(og().indexedDB.deleteDatabase(e)).toPromise()}static C(){if(!Cb())return!1;if(An.F())return!0;const e=va(),t=An.M(e),r=0<t&&t<10,s=Dg(e),i=0<s&&s<4.5;return!(e.indexOf("MSIE ")>0||e.indexOf("Trident/")>0||e.indexOf("Edge/")>0||r||i)}static F(){var e;return typeof process<"u"&&((e=process.__PRIVATE_env)===null||e===void 0?void 0:e.O)==="YES"}static N(e,t){return e.store(t)}static M(e){const t=e.match(/i(?:phone|pad|pod) os ([\d_]+)/i),r=t?t[1].split("_").slice(0,2).join("."):"-1";return Number(r)}constructor(e,t,r){this.name=e,this.version=t,this.B=r,this.L=null,An.M(va())===12.2&&we("Firestore persistence suffers from a bug in iOS 12.2 Safari that may cause your app to stop working. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.")}async k(e){return this.db||(x(et,"Opening database:",this.name),this.db=await new Promise((t,r)=>{const s=indexedDB.open(this.name,this.version);s.onsuccess=i=>{const o=i.target.result;t(o)},s.onblocked=()=>{r(new Ei(e,"Cannot upgrade IndexedDB schema while another tab is open. Close all tabs that access Firestore and reload this page to proceed."))},s.onerror=i=>{const o=i.target.error;o.name==="VersionError"?r(new M(V.FAILED_PRECONDITION,"A newer version of the Firestore SDK was previously used and so the persisted data is not compatible with the version of the SDK you are now using. The SDK will operate with persistence disabled. If you need persistence, please re-upgrade to a newer version of the SDK or else clear the persisted IndexedDB data for your app to start fresh.")):o.name==="InvalidStateError"?r(new M(V.FAILED_PRECONDITION,"Unable to open an IndexedDB connection. This could be due to running in a private browsing session on a browser whose private browsing sessions do not support IndexedDB: "+o)):r(new Ei(e,o))},s.onupgradeneeded=i=>{x(et,'Database "'+this.name+'" requires upgrade from version:',i.oldVersion);const o=i.target.result;if(this.L!==null&&this.L!==i.oldVersion)throw new Error(`refusing to open IndexedDB database due to potential corruption of the IndexedDB database data; this corruption could be caused by clicking the "clear site data" button in a web browser; try reloading the web page to re-initialize the IndexedDB database: lastClosedDbVersion=${this.L}, event.oldVersion=${i.oldVersion}, event.newVersion=${i.newVersion}, db.version=${o.version}`);this.B.q(o,s.transaction,i.oldVersion,this.version).next(()=>{x(et,"Database upgrade to version "+this.version+" complete")})}}),this.db.addEventListener("close",t=>{const r=t.target;this.L=r.version},{passive:!0})),this.db.addEventListener("versionchange",t=>{var r;t.newVersion===null&&(qt('Received "versionchange" event with newVersion===null; notifying the registered DatabaseDeletedListener, if any'),(r=this.databaseDeletedListener)===null||r===void 0||r.call(this))},{passive:!0}),this.db}setDatabaseDeletedListener(e){if(this.databaseDeletedListener)throw new Error("setDatabaseDeletedListener() may only be called once, and it has already been called");this.databaseDeletedListener=e}async runTransaction(e,t,r,s){const i=t==="readonly";let o=0;for(;;){++o;try{this.db=await this.k(e);const c=Xa.open(this.db,e,i?"readonly":"readwrite",r),u=s(c).next(h=>(c.v(),h)).catch(h=>(c.abort(h),A.reject(h))).toPromise();return u.catch(()=>{}),await c.D,u}catch(c){const u=c,h=u.name!=="FirebaseError"&&o<3;if(x(et,"Transaction failed with error:",u.message,"Retrying:",h),this.close(),!h)return Promise.reject(u)}}}close(){this.db&&this.db.close(),this.db=void 0}}function Dg(n){const e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}class Xb{constructor(e){this.$=e,this.U=!1,this.K=null}get isDone(){return this.U}get W(){return this.K}set cursor(e){this.$=e}done(){this.U=!0}G(e){this.K=e}delete(){return Kn(this.$.delete())}}class Ei extends M{constructor(e,t){super(V.UNAVAILABLE,`IndexedDB transaction '${e}' failed: ${t}`),this.name="IndexedDbTransactionError"}}function xn(n){return n.name==="IndexedDbTransactionError"}class Jb{constructor(e){this.store=e}put(e,t){let r;return t!==void 0?(x(et,"PUT",this.store.name,e,t),r=this.store.put(t,e)):(x(et,"PUT",this.store.name,"<auto-key>",e),r=this.store.put(e)),Kn(r)}add(e){return x(et,"ADD",this.store.name,e,e),Kn(this.store.add(e))}get(e){return Kn(this.store.get(e)).next(t=>(t===void 0&&(t=null),x(et,"GET",this.store.name,e,t),t))}delete(e){return x(et,"DELETE",this.store.name,e),Kn(this.store.delete(e))}count(){return x(et,"COUNT",this.store.name),Kn(this.store.count())}j(e,t){const r=this.options(e,t),s=r.index?this.store.index(r.index):this.store;if(typeof s.getAll=="function"){const i=s.getAll(r.range);return new A((o,c)=>{i.onerror=u=>{c(u.target.error)},i.onsuccess=u=>{o(u.target.result)}})}{const i=this.cursor(r),o=[];return this.J(i,(c,u)=>{o.push(u)}).next(()=>o)}}H(e,t){const r=this.store.getAll(e,t===null?void 0:t);return new A((s,i)=>{r.onerror=o=>{i(o.target.error)},r.onsuccess=o=>{s(o.target.result)}})}Y(e,t){x(et,"DELETE ALL",this.store.name);const r=this.options(e,t);r.Z=!1;const s=this.cursor(r);return this.J(s,(i,o,c)=>c.delete())}X(e,t){let r;t?r=e:(r={},t=e);const s=this.cursor(r);return this.J(s,t)}ee(e){const t=this.cursor({});return new A((r,s)=>{t.onerror=i=>{const o=Sl(i.target.error);s(o)},t.onsuccess=i=>{const o=i.target.result;o?e(o.primaryKey,o.value).next(c=>{c?o.continue():r()}):r()}})}J(e,t){const r=[];return new A((s,i)=>{e.onerror=o=>{i(o.target.error)},e.onsuccess=o=>{const c=o.target.result;if(!c)return void s();const u=new Xb(c),h=t(c.primaryKey,c.value,u);if(h instanceof A){const f=h.catch(m=>(u.done(),A.reject(m)));r.push(f)}u.isDone?s():u.W===null?c.continue():c.continue(u.W)}}).next(()=>A.waitFor(r))}options(e,t){let r;return e!==void 0&&(typeof e=="string"?r=e:t=e),{index:r,range:t}}cursor(e){let t="next";if(e.reverse&&(t="prev"),e.index){const r=this.store.index(e.index);return e.Z?r.openKeyCursor(e.range,t):r.openCursor(e.range,t)}return this.store.openCursor(e.range,t)}}function Kn(n){return new A((e,t)=>{n.onsuccess=r=>{const s=r.target.result;e(s)},n.onerror=r=>{const s=Sl(r.target.error);t(s)}})}let kf=!1;function Sl(n){const e=An.M(va());if(e>=12.2&&e<13){const t="An internal error was encountered in the Indexed Database server";if(n.message.indexOf(t)>=0){const r=new M("internal",`IOS_INDEXEDDB_BUG1: IndexedDb has thrown '${t}'. This is likely due to an unavoidable bug in iOS. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.`);return kf||(kf=!0,setTimeout(()=>{throw r},0)),r}}return n}const Ti="IndexBackfiller";class Zb{constructor(e,t){this.asyncQueue=e,this.te=t,this.task=null}start(){this.ne(15e3)}stop(){this.task&&(this.task.cancel(),this.task=null)}get started(){return this.task!==null}ne(e){x(Ti,`Scheduled in ${e}ms`),this.task=this.asyncQueue.enqueueAfterDelay("index_backfill",e,async()=>{this.task=null;try{const t=await this.te.re();x(Ti,`Documents written: ${t}`)}catch(t){xn(t)?x(Ti,"Ignoring IndexedDB error during index backfill: ",t):await On(t)}await this.ne(6e4)})}}class eA{constructor(e,t){this.localStore=e,this.persistence=t}async re(e=50){return this.persistence.runTransaction("Backfill Indexes","readwrite-primary",t=>this.ie(t,e))}ie(e,t){const r=new Set;let s=t,i=!0;return A.doWhile(()=>i===!0&&s>0,()=>this.localStore.indexManager.getNextCollectionGroupToUpdate(e).next(o=>{if(o!==null&&!r.has(o))return x(Ti,`Processing collection: ${o}`),this.se(e,o,s).next(c=>{s-=c,r.add(o)});i=!1})).next(()=>t-s)}se(e,t,r){return this.localStore.indexManager.getMinOffsetFromCollectionGroup(e,t).next(s=>this.localStore.localDocuments.getNextDocuments(e,t,s,r).next(i=>{const o=i.changes;return this.localStore.indexManager.updateIndexEntries(e,o).next(()=>this.oe(s,i)).next(c=>(x(Ti,`Updating offset: ${c}`),this.localStore.indexManager.updateCollectionGroup(e,t,c))).next(()=>o.size)}))}oe(e,t){let r=e;return t.changes.forEach((s,i)=>{const o=Pg(i);Al(o,r)>0&&(r=o)}),new st(r.readTime,r.documentKey,Math.max(t.batchId,e.largestBatchId))}}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ye{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=r=>this._e(r),this.ae=r=>t.writeSequenceNumber(r))}_e(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.ae&&this.ae(e),e}}Ye.ue=-1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lr=-1;function Ja(n){return n==null}function Ui(n){return n===0&&1/n==-1/0}function kg(n){return typeof n=="number"&&Number.isInteger(n)&&!Ui(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wa="";function Ue(n){let e="";for(let t=0;t<n.length;t++)e.length>0&&(e=Vf(e)),e=tA(n.get(t),e);return Vf(e)}function tA(n,e){let t=e;const r=n.length;for(let s=0;s<r;s++){const i=n.charAt(s);switch(i){case"\0":t+="";break;case wa:t+="";break;default:t+=i}}return t}function Vf(n){return n+wa+""}function At(n){const e=n.length;if(G(e>=2,64408,{path:n}),e===2)return G(n.charAt(0)===wa&&n.charAt(1)==="",56145,{path:n}),se.emptyPath();const t=e-2,r=[];let s="";for(let i=0;i<e;){const o=n.indexOf(wa,i);switch((o<0||o>t)&&q(50515,{path:n}),n.charAt(o+1)){case"":const c=n.substring(i,o);let u;s.length===0?u=c:(s+=c,u=s,s=""),r.push(u);break;case"":s+=n.substring(i,o),s+="\0";break;case"":s+=n.substring(i,o+1);break;default:q(61167,{path:n})}i=o+2}return new se(r)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gn="remoteDocuments",uo="owner",Vr="owner",Bi="mutationQueues",nA="userId",ft="mutations",Of="batchId",Jn="userMutationsIndex",xf=["userId","batchId"];/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ea(n,e){return[n,Ue(e)]}function Vg(n,e,t){return[n,Ue(e),t]}const rA={},ms="documentMutations",Ea="remoteDocumentsV14",sA=["prefixPath","collectionGroup","readTime","documentId"],ta="documentKeyIndex",iA=["prefixPath","collectionGroup","documentId"],Og="collectionGroupIndex",oA=["collectionGroup","readTime","prefixPath","documentId"],ji="remoteDocumentGlobal",Uu="remoteDocumentGlobalKey",ps="targets",xg="queryTargetsIndex",aA=["canonicalId","targetId"],gs="targetDocuments",cA=["targetId","path"],Pl="documentTargetsIndex",uA=["path","targetId"],Ta="targetGlobalKey",hr="targetGlobal",$i="collectionParents",lA=["collectionId","parent"],_s="clientMetadata",hA="clientId",Za="bundles",dA="bundleId",ec="namedQueries",fA="name",Rl="indexConfiguration",mA="indexId",Bu="collectionGroupIndex",pA="collectionGroup",bi="indexState",gA=["indexId","uid"],Ng="sequenceNumberIndex",_A=["uid","sequenceNumber"],Ai="indexEntries",yA=["indexId","uid","arrayValue","directionalValue","orderedDocumentKey","documentKey"],Mg="documentKeyIndex",vA=["indexId","uid","orderedDocumentKey"],tc="documentOverlays",IA=["userId","collectionPath","documentId"],ju="collectionPathOverlayIndex",wA=["userId","collectionPath","largestBatchId"],Fg="collectionGroupOverlayIndex",EA=["userId","collectionGroup","largestBatchId"],Cl="globals",TA="name",Lg=[Bi,ft,ms,Gn,ps,uo,hr,gs,_s,ji,$i,Za,ec],bA=[...Lg,tc],Ug=[Bi,ft,ms,Ea,ps,uo,hr,gs,_s,ji,$i,Za,ec,tc],Bg=Ug,Dl=[...Bg,Rl,bi,Ai],AA=Dl,jg=[...Dl,Cl],SA=jg;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $u extends Cg{constructor(e,t){super(),this.ce=e,this.currentSequenceNumber=t}}function Se(n,e){const t=z(n);return An.N(t.ce,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Nf(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function Ar(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function $g(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fe{constructor(e,t){this.comparator=e,this.root=t||ke.EMPTY}insert(e,t){return new fe(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,ke.BLACK,null,null))}remove(e){return new fe(this.comparator,this.root.remove(e,this.comparator).copy(null,null,ke.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){const s=this.comparator(e,r.key);if(s===0)return t+r.left.size;s<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,r)=>(e(t,r),!1))}toString(){const e=[];return this.inorderTraversal((t,r)=>(e.push(`${t}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Wo(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Wo(this.root,e,this.comparator,!1)}getReverseIterator(){return new Wo(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Wo(this.root,e,this.comparator,!0)}}class Wo{constructor(e,t,r,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=t?r(e.key,t):1,t&&s&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class ke{constructor(e,t,r,s,i){this.key=e,this.value=t,this.color=r??ke.RED,this.left=s??ke.EMPTY,this.right=i??ke.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,s,i){return new ke(e??this.key,t??this.value,r??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let s=this;const i=r(e,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(e,t,r),null):i===0?s.copy(null,t,null,null,null):s.copy(null,null,null,null,s.right.insert(e,t,r)),s.fixUp()}removeMin(){if(this.left.isEmpty())return ke.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,s=this;if(t(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),t(e,s.key)===0){if(s.right.isEmpty())return ke.EMPTY;r=s.right.min(),s=s.copy(r.key,r.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,ke.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,ke.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw q(43730,{key:this.key,value:this.value});if(this.right.isRed())throw q(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw q(27949);return e+(this.isRed()?0:1)}}ke.EMPTY=null,ke.RED=!0,ke.BLACK=!1;ke.EMPTY=new class{constructor(){this.size=0}get key(){throw q(57766)}get value(){throw q(16141)}get color(){throw q(16727)}get left(){throw q(29726)}get right(){throw q(36894)}copy(e,t,r,s,i){return this}insert(e,t,r){return new ke(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ue{constructor(e){this.comparator=e,this.data=new fe(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,r)=>(e(t),!1))}forEachInRange(e,t){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const s=r.getNext();if(this.comparator(s.key,e[1])>=0)return;t(s.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new Mf(this.data.getIterator())}getIteratorFrom(e){return new Mf(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(r=>{t=t.add(r)}),t}isEqual(e){if(!(e instanceof ue)||this.size!==e.size)return!1;const t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new ue(this.comparator);return t.data=e,t}}class Mf{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}function Or(n){return n.hasNext()?n.getNext():void 0}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ct{constructor(e){this.fields=e,e.sort(_e.comparator)}static empty(){return new ct([])}unionWith(e){let t=new ue(_e.comparator);for(const r of this.fields)t=t.add(r);for(const r of e)t=t.add(r);return new ct(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return ds(this.fields,e.fields,(t,r)=>t.isEqual(r))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qg extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ee{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new qg("Invalid base64 string: "+i):i}}(e);return new Ee(t)}static fromUint8Array(e){const t=function(s){let i="";for(let o=0;o<s.length;++o)i+=String.fromCharCode(s[o]);return i}(e);return new Ee(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(t){return btoa(t)}(this.binaryString)}toUint8Array(){return function(t){const r=new Uint8Array(t.length);for(let s=0;s<t.length;s++)r[s]=t.charCodeAt(s);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return Q(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}Ee.EMPTY_BYTE_STRING=new Ee("");const PA=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function zt(n){if(G(!!n,39018),typeof n=="string"){let e=0;const t=PA.exec(n);if(G(!!t,46558,{timestamp:n}),t[1]){let s=t[1];s=(s+"000000000").substr(0,9),e=Number(s)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:ge(n.seconds),nanos:ge(n.nanos)}}function ge(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function Wt(n){return typeof n=="string"?Ee.fromBase64String(n):Ee.fromUint8Array(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zg="server_timestamp",Wg="__type__",Hg="__previous_value__",Gg="__local_write_time__";function kl(n){var e,t;return((t=(((e=n==null?void 0:n.mapValue)===null||e===void 0?void 0:e.fields)||{})[Wg])===null||t===void 0?void 0:t.stringValue)===zg}function nc(n){const e=n.mapValue.fields[Hg];return kl(e)?nc(e):e}function qi(n){const e=zt(n.mapValue.fields[Gg].timestampValue);return new ae(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class RA{constructor(e,t,r,s,i,o,c,u,h,f){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=s,this.ssl=i,this.forceLongPolling=o,this.autoDetectLongPolling=c,this.longPollingOptions=u,this.useFetchStreams=h,this.isUsingEmulator=f}}const zi="(default)";class _r{constructor(e,t){this.projectId=e,this.database=t||zi}static empty(){return new _r("","")}get isDefaultDatabase(){return this.database===zi}isEqual(e){return e instanceof _r&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vl="__type__",Kg="__max__",In={mapValue:{fields:{__type__:{stringValue:Kg}}}},Ol="__vector__",ys="value",na={nullValue:"NULL_VALUE"};function Rn(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?kl(n)?4:Qg(n)?9007199254740991:rc(n)?10:11:q(28295,{value:n})}function kt(n,e){if(n===e)return!0;const t=Rn(n);if(t!==Rn(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return qi(n).isEqual(qi(e));case 3:return function(s,i){if(typeof s.timestampValue=="string"&&typeof i.timestampValue=="string"&&s.timestampValue.length===i.timestampValue.length)return s.timestampValue===i.timestampValue;const o=zt(s.timestampValue),c=zt(i.timestampValue);return o.seconds===c.seconds&&o.nanos===c.nanos}(n,e);case 5:return n.stringValue===e.stringValue;case 6:return function(s,i){return Wt(s.bytesValue).isEqual(Wt(i.bytesValue))}(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return function(s,i){return ge(s.geoPointValue.latitude)===ge(i.geoPointValue.latitude)&&ge(s.geoPointValue.longitude)===ge(i.geoPointValue.longitude)}(n,e);case 2:return function(s,i){if("integerValue"in s&&"integerValue"in i)return ge(s.integerValue)===ge(i.integerValue);if("doubleValue"in s&&"doubleValue"in i){const o=ge(s.doubleValue),c=ge(i.doubleValue);return o===c?Ui(o)===Ui(c):isNaN(o)&&isNaN(c)}return!1}(n,e);case 9:return ds(n.arrayValue.values||[],e.arrayValue.values||[],kt);case 10:case 11:return function(s,i){const o=s.mapValue.fields||{},c=i.mapValue.fields||{};if(Nf(o)!==Nf(c))return!1;for(const u in o)if(o.hasOwnProperty(u)&&(c[u]===void 0||!kt(o[u],c[u])))return!1;return!0}(n,e);default:return q(52216,{left:n})}}function Wi(n,e){return(n.values||[]).find(t=>kt(t,e))!==void 0}function Cn(n,e){if(n===e)return 0;const t=Rn(n),r=Rn(e);if(t!==r)return Q(t,r);switch(t){case 0:case 9007199254740991:return 0;case 1:return Q(n.booleanValue,e.booleanValue);case 2:return function(i,o){const c=ge(i.integerValue||i.doubleValue),u=ge(o.integerValue||o.doubleValue);return c<u?-1:c>u?1:c===u?0:isNaN(c)?isNaN(u)?0:-1:1}(n,e);case 3:return Ff(n.timestampValue,e.timestampValue);case 4:return Ff(qi(n),qi(e));case 5:return Fu(n.stringValue,e.stringValue);case 6:return function(i,o){const c=Wt(i),u=Wt(o);return c.compareTo(u)}(n.bytesValue,e.bytesValue);case 7:return function(i,o){const c=i.split("/"),u=o.split("/");for(let h=0;h<c.length&&h<u.length;h++){const f=Q(c[h],u[h]);if(f!==0)return f}return Q(c.length,u.length)}(n.referenceValue,e.referenceValue);case 8:return function(i,o){const c=Q(ge(i.latitude),ge(o.latitude));return c!==0?c:Q(ge(i.longitude),ge(o.longitude))}(n.geoPointValue,e.geoPointValue);case 9:return Lf(n.arrayValue,e.arrayValue);case 10:return function(i,o){var c,u,h,f;const m=i.fields||{},p=o.fields||{},w=(c=m[ys])===null||c===void 0?void 0:c.arrayValue,C=(u=p[ys])===null||u===void 0?void 0:u.arrayValue,D=Q(((h=w==null?void 0:w.values)===null||h===void 0?void 0:h.length)||0,((f=C==null?void 0:C.values)===null||f===void 0?void 0:f.length)||0);return D!==0?D:Lf(w,C)}(n.mapValue,e.mapValue);case 11:return function(i,o){if(i===In.mapValue&&o===In.mapValue)return 0;if(i===In.mapValue)return 1;if(o===In.mapValue)return-1;const c=i.fields||{},u=Object.keys(c),h=o.fields||{},f=Object.keys(h);u.sort(),f.sort();for(let m=0;m<u.length&&m<f.length;++m){const p=Fu(u[m],f[m]);if(p!==0)return p;const w=Cn(c[u[m]],h[f[m]]);if(w!==0)return w}return Q(u.length,f.length)}(n.mapValue,e.mapValue);default:throw q(23264,{le:t})}}function Ff(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return Q(n,e);const t=zt(n),r=zt(e),s=Q(t.seconds,r.seconds);return s!==0?s:Q(t.nanos,r.nanos)}function Lf(n,e){const t=n.values||[],r=e.values||[];for(let s=0;s<t.length&&s<r.length;++s){const i=Cn(t[s],r[s]);if(i)return i}return Q(t.length,r.length)}function vs(n){return qu(n)}function qu(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?function(t){const r=zt(t);return`time(${r.seconds},${r.nanos})`}(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?function(t){return Wt(t).toBase64()}(n.bytesValue):"referenceValue"in n?function(t){return $.fromName(t).toString()}(n.referenceValue):"geoPointValue"in n?function(t){return`geo(${t.latitude},${t.longitude})`}(n.geoPointValue):"arrayValue"in n?function(t){let r="[",s=!0;for(const i of t.values||[])s?s=!1:r+=",",r+=qu(i);return r+"]"}(n.arrayValue):"mapValue"in n?function(t){const r=Object.keys(t.fields||{}).sort();let s="{",i=!0;for(const o of r)i?i=!1:s+=",",s+=`${o}:${qu(t.fields[o])}`;return s+"}"}(n.mapValue):q(61005,{value:n})}function ra(n){switch(Rn(n)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=nc(n);return e?16+ra(e):16;case 5:return 2*n.stringValue.length;case 6:return Wt(n.bytesValue).approximateByteSize();case 7:return n.referenceValue.length;case 9:return function(r){return(r.values||[]).reduce((s,i)=>s+ra(i),0)}(n.arrayValue);case 10:case 11:return function(r){let s=0;return Ar(r.fields,(i,o)=>{s+=i.length+ra(o)}),s}(n.mapValue);default:throw q(13486,{value:n})}}function Hi(n,e){return{referenceValue:`projects/${n.projectId}/databases/${n.database}/documents/${e.path.canonicalString()}`}}function zu(n){return!!n&&"integerValue"in n}function Gi(n){return!!n&&"arrayValue"in n}function Uf(n){return!!n&&"nullValue"in n}function Bf(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function sa(n){return!!n&&"mapValue"in n}function rc(n){var e,t;return((t=(((e=n==null?void 0:n.mapValue)===null||e===void 0?void 0:e.fields)||{})[Vl])===null||t===void 0?void 0:t.stringValue)===Ol}function Si(n){if(n.geoPointValue)return{geoPointValue:Object.assign({},n.geoPointValue)};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:Object.assign({},n.timestampValue)};if(n.mapValue){const e={mapValue:{fields:{}}};return Ar(n.mapValue.fields,(t,r)=>e.mapValue.fields[t]=Si(r)),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=Si(n.arrayValue.values[t]);return e}return Object.assign({},n)}function Qg(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue===Kg}const Yg={mapValue:{fields:{[Vl]:{stringValue:Ol},[ys]:{arrayValue:{}}}}};function CA(n){return"nullValue"in n?na:"booleanValue"in n?{booleanValue:!1}:"integerValue"in n||"doubleValue"in n?{doubleValue:NaN}:"timestampValue"in n?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"stringValue"in n?{stringValue:""}:"bytesValue"in n?{bytesValue:""}:"referenceValue"in n?Hi(_r.empty(),$.empty()):"geoPointValue"in n?{geoPointValue:{latitude:-90,longitude:-180}}:"arrayValue"in n?{arrayValue:{}}:"mapValue"in n?rc(n)?Yg:{mapValue:{}}:q(35942,{value:n})}function DA(n){return"nullValue"in n?{booleanValue:!1}:"booleanValue"in n?{doubleValue:NaN}:"integerValue"in n||"doubleValue"in n?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"timestampValue"in n?{stringValue:""}:"stringValue"in n?{bytesValue:""}:"bytesValue"in n?Hi(_r.empty(),$.empty()):"referenceValue"in n?{geoPointValue:{latitude:-90,longitude:-180}}:"geoPointValue"in n?{arrayValue:{}}:"arrayValue"in n?Yg:"mapValue"in n?rc(n)?{mapValue:{}}:In:q(61959,{value:n})}function jf(n,e){const t=Cn(n.value,e.value);return t!==0?t:n.inclusive&&!e.inclusive?-1:!n.inclusive&&e.inclusive?1:0}function $f(n,e){const t=Cn(n.value,e.value);return t!==0?t:n.inclusive&&!e.inclusive?1:!n.inclusive&&e.inclusive?-1:0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qe{constructor(e){this.value=e}static empty(){return new Qe({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!sa(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=Si(t)}setAll(e){let t=_e.emptyPath(),r={},s=[];e.forEach((o,c)=>{if(!t.isImmediateParentOf(c)){const u=this.getFieldsMap(t);this.applyChanges(u,r,s),r={},s=[],t=c.popLast()}o?r[c.lastSegment()]=Si(o):s.push(c.lastSegment())});const i=this.getFieldsMap(t);this.applyChanges(i,r,s)}delete(e){const t=this.field(e.popLast());sa(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return kt(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let s=t.mapValue.fields[e.get(r)];sa(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=s),t=s}return t.mapValue.fields}applyChanges(e,t,r){Ar(t,(s,i)=>e[s]=i);for(const s of r)delete e[s]}clone(){return new Qe(Si(this.value))}}function Xg(n){const e=[];return Ar(n.fields,(t,r)=>{const s=new _e([t]);if(sa(r)){const i=Xg(r.mapValue).fields;if(i.length===0)e.push(s);else for(const o of i)e.push(s.child(o))}else e.push(s)}),new ct(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ie{constructor(e,t,r,s,i,o,c){this.key=e,this.documentType=t,this.version=r,this.readTime=s,this.createTime=i,this.data=o,this.documentState=c}static newInvalidDocument(e){return new Ie(e,0,K.min(),K.min(),K.min(),Qe.empty(),0)}static newFoundDocument(e,t,r,s){return new Ie(e,1,t,K.min(),r,s,0)}static newNoDocument(e,t){return new Ie(e,2,t,K.min(),K.min(),Qe.empty(),0)}static newUnknownDocument(e,t){return new Ie(e,3,t,K.min(),K.min(),Qe.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(K.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=Qe.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=Qe.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=K.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof Ie&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new Ie(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Is{constructor(e,t){this.position=e,this.inclusive=t}}function qf(n,e,t){let r=0;for(let s=0;s<n.position.length;s++){const i=e[s],o=n.position[s];if(i.field.isKeyField()?r=$.comparator($.fromName(o.referenceValue),t.key):r=Cn(o,t.data.field(i.field)),i.dir==="desc"&&(r*=-1),r!==0)break}return r}function zf(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!kt(n.position[t],e.position[t]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ki{constructor(e,t="asc"){this.field=e,this.dir=t}}function kA(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jg{}class Z extends Jg{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new VA(e,t,r):t==="array-contains"?new NA(e,r):t==="in"?new s_(e,r):t==="not-in"?new MA(e,r):t==="array-contains-any"?new FA(e,r):new Z(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new OA(e,r):new xA(e,r)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(Cn(t,this.value)):t!==null&&Rn(this.value)===Rn(t)&&this.matchesComparison(Cn(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return q(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class ce extends Jg{constructor(e,t){super(),this.filters=e,this.op=t,this.he=null}static create(e,t){return new ce(e,t)}matches(e){return ws(this)?this.filters.find(t=>!t.matches(e))===void 0:this.filters.find(t=>t.matches(e))!==void 0}getFlattenedFilters(){return this.he!==null||(this.he=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.he}getFilters(){return Object.assign([],this.filters)}}function ws(n){return n.op==="and"}function Wu(n){return n.op==="or"}function xl(n){return Zg(n)&&ws(n)}function Zg(n){for(const e of n.filters)if(e instanceof ce)return!1;return!0}function Hu(n){if(n instanceof Z)return n.field.canonicalString()+n.op.toString()+vs(n.value);if(xl(n))return n.filters.map(e=>Hu(e)).join(",");{const e=n.filters.map(t=>Hu(t)).join(",");return`${n.op}(${e})`}}function e_(n,e){return n instanceof Z?function(r,s){return s instanceof Z&&r.op===s.op&&r.field.isEqual(s.field)&&kt(r.value,s.value)}(n,e):n instanceof ce?function(r,s){return s instanceof ce&&r.op===s.op&&r.filters.length===s.filters.length?r.filters.reduce((i,o,c)=>i&&e_(o,s.filters[c]),!0):!1}(n,e):void q(19439)}function t_(n,e){const t=n.filters.concat(e);return ce.create(t,n.op)}function n_(n){return n instanceof Z?function(t){return`${t.field.canonicalString()} ${t.op} ${vs(t.value)}`}(n):n instanceof ce?function(t){return t.op.toString()+" {"+t.getFilters().map(n_).join(" ,")+"}"}(n):"Filter"}class VA extends Z{constructor(e,t,r){super(e,t,r),this.key=$.fromName(r.referenceValue)}matches(e){const t=$.comparator(e.key,this.key);return this.matchesComparison(t)}}class OA extends Z{constructor(e,t){super(e,"in",t),this.keys=r_("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class xA extends Z{constructor(e,t){super(e,"not-in",t),this.keys=r_("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function r_(n,e){var t;return(((t=e.arrayValue)===null||t===void 0?void 0:t.values)||[]).map(r=>$.fromName(r.referenceValue))}class NA extends Z{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return Gi(t)&&Wi(t.arrayValue,this.value)}}class s_ extends Z{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&Wi(this.value.arrayValue,t)}}class MA extends Z{constructor(e,t){super(e,"not-in",t)}matches(e){if(Wi(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!Wi(this.value.arrayValue,t)}}class FA extends Z{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!Gi(t)||!t.arrayValue.values)&&t.arrayValue.values.some(r=>Wi(this.value.arrayValue,r))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class LA{constructor(e,t=null,r=[],s=[],i=null,o=null,c=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=s,this.limit=i,this.startAt=o,this.endAt=c,this.Pe=null}}function Gu(n,e=null,t=[],r=[],s=null,i=null,o=null){return new LA(n,e,t,r,s,i,o)}function yr(n){const e=z(n);if(e.Pe===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map(r=>Hu(r)).join(","),t+="|ob:",t+=e.orderBy.map(r=>function(i){return i.field.canonicalString()+i.dir}(r)).join(","),Ja(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(r=>vs(r)).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(r=>vs(r)).join(",")),e.Pe=t}return e.Pe}function lo(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!kA(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!e_(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!zf(n.startAt,e.startAt)&&zf(n.endAt,e.endAt)}function ba(n){return $.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}function Aa(n,e){return n.filters.filter(t=>t instanceof Z&&t.field.isEqual(e))}function Wf(n,e,t){let r=na,s=!0;for(const i of Aa(n,e)){let o=na,c=!0;switch(i.op){case"<":case"<=":o=CA(i.value);break;case"==":case"in":case">=":o=i.value;break;case">":o=i.value,c=!1;break;case"!=":case"not-in":o=na}jf({value:r,inclusive:s},{value:o,inclusive:c})<0&&(r=o,s=c)}if(t!==null){for(let i=0;i<n.orderBy.length;++i)if(n.orderBy[i].field.isEqual(e)){const o=t.position[i];jf({value:r,inclusive:s},{value:o,inclusive:t.inclusive})<0&&(r=o,s=t.inclusive);break}}return{value:r,inclusive:s}}function Hf(n,e,t){let r=In,s=!0;for(const i of Aa(n,e)){let o=In,c=!0;switch(i.op){case">=":case">":o=DA(i.value),c=!1;break;case"==":case"in":case"<=":o=i.value;break;case"<":o=i.value,c=!1;break;case"!=":case"not-in":o=In}$f({value:r,inclusive:s},{value:o,inclusive:c})>0&&(r=o,s=c)}if(t!==null){for(let i=0;i<n.orderBy.length;++i)if(n.orderBy[i].field.isEqual(e)){const o=t.position[i];$f({value:r,inclusive:s},{value:o,inclusive:t.inclusive})>0&&(r=o,s=t.inclusive);break}}return{value:r,inclusive:s}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ms{constructor(e,t=null,r=[],s=[],i=null,o="F",c=null,u=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=s,this.limit=i,this.limitType=o,this.startAt=c,this.endAt=u,this.Te=null,this.Ie=null,this.de=null,this.startAt,this.endAt}}function i_(n,e,t,r,s,i,o,c){return new Ms(n,e,t,r,s,i,o,c)}function sc(n){return new Ms(n)}function Gf(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function o_(n){return n.collectionGroup!==null}function Pi(n){const e=z(n);if(e.Te===null){e.Te=[];const t=new Set;for(const i of e.explicitOrderBy)e.Te.push(i),t.add(i.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(o){let c=new ue(_e.comparator);return o.filters.forEach(u=>{u.getFlattenedFilters().forEach(h=>{h.isInequality()&&(c=c.add(h.field))})}),c})(e).forEach(i=>{t.has(i.canonicalString())||i.isKeyField()||e.Te.push(new Ki(i,r))}),t.has(_e.keyField().canonicalString())||e.Te.push(new Ki(_e.keyField(),r))}return e.Te}function rt(n){const e=z(n);return e.Ie||(e.Ie=UA(e,Pi(n))),e.Ie}function UA(n,e){if(n.limitType==="F")return Gu(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map(s=>{const i=s.dir==="desc"?"asc":"desc";return new Ki(s.field,i)});const t=n.endAt?new Is(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new Is(n.startAt.position,n.startAt.inclusive):null;return Gu(n.path,n.collectionGroup,e,n.filters,n.limit,t,r)}}function Ku(n,e){const t=n.filters.concat([e]);return new Ms(n.path,n.collectionGroup,n.explicitOrderBy.slice(),t,n.limit,n.limitType,n.startAt,n.endAt)}function Sa(n,e,t){return new Ms(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function ic(n,e){return lo(rt(n),rt(e))&&n.limitType===e.limitType}function a_(n){return`${yr(rt(n))}|lt:${n.limitType}`}function Ur(n){return`Query(target=${function(t){let r=t.path.canonicalString();return t.collectionGroup!==null&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map(s=>n_(s)).join(", ")}]`),Ja(t.limit)||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map(s=>function(o){return`${o.field.canonicalString()} (${o.dir})`}(s)).join(", ")}]`),t.startAt&&(r+=", startAt: ",r+=t.startAt.inclusive?"b:":"a:",r+=t.startAt.position.map(s=>vs(s)).join(",")),t.endAt&&(r+=", endAt: ",r+=t.endAt.inclusive?"a:":"b:",r+=t.endAt.position.map(s=>vs(s)).join(",")),`Target(${r})`}(rt(n))}; limitType=${n.limitType})`}function ho(n,e){return e.isFoundDocument()&&function(r,s){const i=s.key.path;return r.collectionGroup!==null?s.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(i):$.isDocumentKey(r.path)?r.path.isEqual(i):r.path.isImmediateParentOf(i)}(n,e)&&function(r,s){for(const i of Pi(r))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0}(n,e)&&function(r,s){for(const i of r.filters)if(!i.matches(s))return!1;return!0}(n,e)&&function(r,s){return!(r.startAt&&!function(o,c,u){const h=qf(o,c,u);return o.inclusive?h<=0:h<0}(r.startAt,Pi(r),s)||r.endAt&&!function(o,c,u){const h=qf(o,c,u);return o.inclusive?h>=0:h>0}(r.endAt,Pi(r),s))}(n,e)}function c_(n){return n.collectionGroup||(n.path.length%2==1?n.path.lastSegment():n.path.get(n.path.length-2))}function u_(n){return(e,t)=>{let r=!1;for(const s of Pi(n)){const i=BA(s,e,t);if(i!==0)return i;r=r||s.field.isKeyField()}return 0}}function BA(n,e,t){const r=n.field.isKeyField()?$.comparator(e.key,t.key):function(i,o,c){const u=o.data.field(i),h=c.data.field(i);return u!==null&&h!==null?Cn(u,h):q(42886)}(n.field,e,t);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return q(19790,{direction:n.dir})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gt{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r!==void 0){for(const[s,i]of r)if(this.equalsFn(s,e))return i}}has(e){return this.get(e)!==void 0}set(e,t){const r=this.mapKeyFn(e),s=this.inner[r];if(s===void 0)return this.inner[r]=[[e,t]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],e))return void(s[i]=[e,t]);s.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r===void 0)return!1;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return r.length===1?delete this.inner[t]:r.splice(s,1),this.innerSize--,!0;return!1}forEach(e){Ar(this.inner,(t,r)=>{for(const[s,i]of r)e(s,i)})}isEmpty(){return $g(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jA=new fe($.comparator);function tt(){return jA}const l_=new fe($.comparator);function gi(...n){let e=l_;for(const t of n)e=e.insert(t.key,t);return e}function h_(n){let e=l_;return n.forEach((t,r)=>e=e.insert(t,r.overlayedDocument)),e}function St(){return Ri()}function d_(){return Ri()}function Ri(){return new Gt(n=>n.toString(),(n,e)=>n.isEqual(e))}const $A=new fe($.comparator),qA=new ue($.comparator);function X(...n){let e=qA;for(const t of n)e=e.add(t);return e}const zA=new ue(Q);function Nl(){return zA}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ml(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Ui(e)?"-0":e}}function f_(n){return{integerValue:""+n}}function WA(n,e){return kg(e)?f_(e):Ml(n,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oc{constructor(){this._=void 0}}function HA(n,e,t){return n instanceof Es?function(s,i){const o={fields:{[Wg]:{stringValue:zg},[Gg]:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&kl(i)&&(i=nc(i)),i&&(o.fields[Hg]=i),{mapValue:o}}(t,e):n instanceof Ts?p_(n,e):n instanceof bs?g_(n,e):function(s,i){const o=m_(s,i),c=Kf(o)+Kf(s.Ee);return zu(o)&&zu(s.Ee)?f_(c):Ml(s.serializer,c)}(n,e)}function GA(n,e,t){return n instanceof Ts?p_(n,e):n instanceof bs?g_(n,e):t}function m_(n,e){return n instanceof Qi?function(r){return zu(r)||function(i){return!!i&&"doubleValue"in i}(r)}(e)?e:{integerValue:0}:null}class Es extends oc{}class Ts extends oc{constructor(e){super(),this.elements=e}}function p_(n,e){const t=__(e);for(const r of n.elements)t.some(s=>kt(s,r))||t.push(r);return{arrayValue:{values:t}}}class bs extends oc{constructor(e){super(),this.elements=e}}function g_(n,e){let t=__(e);for(const r of n.elements)t=t.filter(s=>!kt(s,r));return{arrayValue:{values:t}}}class Qi extends oc{constructor(e,t){super(),this.serializer=e,this.Ee=t}}function Kf(n){return ge(n.integerValue||n.doubleValue)}function __(n){return Gi(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class y_{constructor(e,t){this.field=e,this.transform=t}}function KA(n,e){return n.field.isEqual(e.field)&&function(r,s){return r instanceof Ts&&s instanceof Ts||r instanceof bs&&s instanceof bs?ds(r.elements,s.elements,kt):r instanceof Qi&&s instanceof Qi?kt(r.Ee,s.Ee):r instanceof Es&&s instanceof Es}(n.transform,e.transform)}class QA{constructor(e,t){this.version=e,this.transformResults=t}}class nt{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new nt}static exists(e){return new nt(void 0,e)}static updateTime(e){return new nt(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function ia(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class ac{}function v_(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new Fl(n.key,nt.none()):new Fs(n.key,n.data,nt.none());{const t=n.data,r=Qe.empty();let s=new ue(_e.comparator);for(let i of e.fields)if(!s.has(i)){let o=t.field(i);o===null&&i.length>1&&(i=i.popLast(),o=t.field(i)),o===null?r.delete(i):r.set(i,o),s=s.add(i)}return new Nn(n.key,r,new ct(s.toArray()),nt.none())}}function YA(n,e,t){n instanceof Fs?function(s,i,o){const c=s.value.clone(),u=Yf(s.fieldTransforms,i,o.transformResults);c.setAll(u),i.convertToFoundDocument(o.version,c).setHasCommittedMutations()}(n,e,t):n instanceof Nn?function(s,i,o){if(!ia(s.precondition,i))return void i.convertToUnknownDocument(o.version);const c=Yf(s.fieldTransforms,i,o.transformResults),u=i.data;u.setAll(I_(s)),u.setAll(c),i.convertToFoundDocument(o.version,u).setHasCommittedMutations()}(n,e,t):function(s,i,o){i.convertToNoDocument(o.version).setHasCommittedMutations()}(0,e,t)}function Ci(n,e,t,r){return n instanceof Fs?function(i,o,c,u){if(!ia(i.precondition,o))return c;const h=i.value.clone(),f=Xf(i.fieldTransforms,u,o);return h.setAll(f),o.convertToFoundDocument(o.version,h).setHasLocalMutations(),null}(n,e,t,r):n instanceof Nn?function(i,o,c,u){if(!ia(i.precondition,o))return c;const h=Xf(i.fieldTransforms,u,o),f=o.data;return f.setAll(I_(i)),f.setAll(h),o.convertToFoundDocument(o.version,f).setHasLocalMutations(),c===null?null:c.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map(m=>m.field))}(n,e,t,r):function(i,o,c){return ia(i.precondition,o)?(o.convertToNoDocument(o.version).setHasLocalMutations(),null):c}(n,e,t)}function XA(n,e){let t=null;for(const r of n.fieldTransforms){const s=e.data.field(r.field),i=m_(r.transform,s||null);i!=null&&(t===null&&(t=Qe.empty()),t.set(r.field,i))}return t||null}function Qf(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!function(r,s){return r===void 0&&s===void 0||!(!r||!s)&&ds(r,s,(i,o)=>KA(i,o))}(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class Fs extends ac{constructor(e,t,r,s=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class Nn extends ac{constructor(e,t,r,s,i=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function I_(n){const e=new Map;return n.fieldMask.fields.forEach(t=>{if(!t.isEmpty()){const r=n.data.field(t);e.set(t,r)}}),e}function Yf(n,e,t){const r=new Map;G(n.length===t.length,32656,{Ae:t.length,Re:n.length});for(let s=0;s<t.length;s++){const i=n[s],o=i.transform,c=e.data.field(i.field);r.set(i.field,GA(o,c,t[s]))}return r}function Xf(n,e,t){const r=new Map;for(const s of n){const i=s.transform,o=t.data.field(s.field);r.set(s.field,HA(i,o,e))}return r}class Fl extends ac{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class w_ extends ac{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ll{constructor(e,t,r,s){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=s}applyToRemoteDocument(e,t){const r=t.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(e.key)&&YA(i,e,r[s])}}applyToLocalView(e,t){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(t=Ci(r,e,t,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(t=Ci(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const r=d_();return this.mutations.forEach(s=>{const i=e.get(s.key),o=i.overlayedDocument;let c=this.applyToLocalView(o,i.mutatedFields);c=t.has(s.key)?null:c;const u=v_(o,c);u!==null&&r.set(s.key,u),o.isValidDocument()||o.convertToNoDocument(K.min())}),r}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),X())}isEqual(e){return this.batchId===e.batchId&&ds(this.mutations,e.mutations,(t,r)=>Qf(t,r))&&ds(this.baseMutations,e.baseMutations,(t,r)=>Qf(t,r))}}class Ul{constructor(e,t,r,s){this.batch=e,this.commitVersion=t,this.mutationResults=r,this.docVersions=s}static from(e,t,r){G(e.mutations.length===r.length,58842,{Ve:e.mutations.length,me:r.length});let s=function(){return $A}();const i=e.mutations;for(let o=0;o<i.length;o++)s=s.insert(i[o].key,r[o].version);return new Ul(e,t,r,s)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bl{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class JA{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Te,te;function ZA(n){switch(n){case V.OK:return q(64938);case V.CANCELLED:case V.UNKNOWN:case V.DEADLINE_EXCEEDED:case V.RESOURCE_EXHAUSTED:case V.INTERNAL:case V.UNAVAILABLE:case V.UNAUTHENTICATED:return!1;case V.INVALID_ARGUMENT:case V.NOT_FOUND:case V.ALREADY_EXISTS:case V.PERMISSION_DENIED:case V.FAILED_PRECONDITION:case V.ABORTED:case V.OUT_OF_RANGE:case V.UNIMPLEMENTED:case V.DATA_LOSS:return!0;default:return q(15467,{code:n})}}function E_(n){if(n===void 0)return we("GRPC error has no .code"),V.UNKNOWN;switch(n){case Te.OK:return V.OK;case Te.CANCELLED:return V.CANCELLED;case Te.UNKNOWN:return V.UNKNOWN;case Te.DEADLINE_EXCEEDED:return V.DEADLINE_EXCEEDED;case Te.RESOURCE_EXHAUSTED:return V.RESOURCE_EXHAUSTED;case Te.INTERNAL:return V.INTERNAL;case Te.UNAVAILABLE:return V.UNAVAILABLE;case Te.UNAUTHENTICATED:return V.UNAUTHENTICATED;case Te.INVALID_ARGUMENT:return V.INVALID_ARGUMENT;case Te.NOT_FOUND:return V.NOT_FOUND;case Te.ALREADY_EXISTS:return V.ALREADY_EXISTS;case Te.PERMISSION_DENIED:return V.PERMISSION_DENIED;case Te.FAILED_PRECONDITION:return V.FAILED_PRECONDITION;case Te.ABORTED:return V.ABORTED;case Te.OUT_OF_RANGE:return V.OUT_OF_RANGE;case Te.UNIMPLEMENTED:return V.UNIMPLEMENTED;case Te.DATA_LOSS:return V.DATA_LOSS;default:return q(39323,{code:n})}}(te=Te||(Te={}))[te.OK=0]="OK",te[te.CANCELLED=1]="CANCELLED",te[te.UNKNOWN=2]="UNKNOWN",te[te.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",te[te.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",te[te.NOT_FOUND=5]="NOT_FOUND",te[te.ALREADY_EXISTS=6]="ALREADY_EXISTS",te[te.PERMISSION_DENIED=7]="PERMISSION_DENIED",te[te.UNAUTHENTICATED=16]="UNAUTHENTICATED",te[te.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",te[te.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",te[te.ABORTED=10]="ABORTED",te[te.OUT_OF_RANGE=11]="OUT_OF_RANGE",te[te.UNIMPLEMENTED=12]="UNIMPLEMENTED",te[te.INTERNAL=13]="INTERNAL",te[te.UNAVAILABLE=14]="UNAVAILABLE",te[te.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const e0=new bn([4294967295,4294967295],0);function Jf(n){const e=Eg().encode(n),t=new mg;return t.update(e),new Uint8Array(t.digest())}function Zf(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),r=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new bn([t,r],0),new bn([s,i],0)]}class jl{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new _i(`Invalid padding: ${t}`);if(r<0)throw new _i(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new _i(`Invalid hash count: ${r}`);if(e.length===0&&t!==0)throw new _i(`Invalid padding when bitmap length is 0: ${t}`);this.fe=8*e.length-t,this.ge=bn.fromNumber(this.fe)}pe(e,t,r){let s=e.add(t.multiply(bn.fromNumber(r)));return s.compare(e0)===1&&(s=new bn([s.getBits(0),s.getBits(1)],0)),s.modulo(this.ge).toNumber()}ye(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.fe===0)return!1;const t=Jf(e),[r,s]=Zf(t);for(let i=0;i<this.hashCount;i++){const o=this.pe(r,s,i);if(!this.ye(o))return!1}return!0}static create(e,t,r){const s=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),o=new jl(i,s,t);return r.forEach(c=>o.insert(c)),o}insert(e){if(this.fe===0)return;const t=Jf(e),[r,s]=Zf(t);for(let i=0;i<this.hashCount;i++){const o=this.pe(r,s,i);this.we(o)}}we(e){const t=Math.floor(e/8),r=e%8;this.bitmap[t]|=1<<r}}class _i extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fo{constructor(e,t,r,s,i){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=s,this.resolvedLimboDocuments=i}static createSynthesizedRemoteEventForCurrentChange(e,t,r){const s=new Map;return s.set(e,mo.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new fo(K.min(),s,new fe(Q),tt(),X())}}class mo{constructor(e,t,r,s,i){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new mo(r,t,X(),X(),X())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oa{constructor(e,t,r,s){this.Se=e,this.removedTargetIds=t,this.key=r,this.be=s}}class T_{constructor(e,t){this.targetId=e,this.De=t}}class b_{constructor(e,t,r=Ee.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=s}}class em{constructor(){this.ve=0,this.Ce=tm(),this.Fe=Ee.EMPTY_BYTE_STRING,this.Me=!1,this.xe=!0}get current(){return this.Me}get resumeToken(){return this.Fe}get Oe(){return this.ve!==0}get Ne(){return this.xe}Be(e){e.approximateByteSize()>0&&(this.xe=!0,this.Fe=e)}Le(){let e=X(),t=X(),r=X();return this.Ce.forEach((s,i)=>{switch(i){case 0:e=e.add(s);break;case 2:t=t.add(s);break;case 1:r=r.add(s);break;default:q(38017,{changeType:i})}}),new mo(this.Fe,this.Me,e,t,r)}ke(){this.xe=!1,this.Ce=tm()}qe(e,t){this.xe=!0,this.Ce=this.Ce.insert(e,t)}Qe(e){this.xe=!0,this.Ce=this.Ce.remove(e)}$e(){this.ve+=1}Ue(){this.ve-=1,G(this.ve>=0,3241,{ve:this.ve})}Ke(){this.xe=!0,this.Me=!0}}class t0{constructor(e){this.We=e,this.Ge=new Map,this.ze=tt(),this.je=Ho(),this.Je=Ho(),this.He=new fe(Q)}Ye(e){for(const t of e.Se)e.be&&e.be.isFoundDocument()?this.Ze(t,e.be):this.Xe(t,e.key,e.be);for(const t of e.removedTargetIds)this.Xe(t,e.key,e.be)}et(e){this.forEachTarget(e,t=>{const r=this.tt(t);switch(e.state){case 0:this.nt(t)&&r.Be(e.resumeToken);break;case 1:r.Ue(),r.Oe||r.ke(),r.Be(e.resumeToken);break;case 2:r.Ue(),r.Oe||this.removeTarget(t);break;case 3:this.nt(t)&&(r.Ke(),r.Be(e.resumeToken));break;case 4:this.nt(t)&&(this.rt(t),r.Be(e.resumeToken));break;default:q(56790,{state:e.state})}})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.Ge.forEach((r,s)=>{this.nt(s)&&t(s)})}it(e){const t=e.targetId,r=e.De.count,s=this.st(t);if(s){const i=s.target;if(ba(i))if(r===0){const o=new $(i.path);this.Xe(t,o,Ie.newNoDocument(o,K.min()))}else G(r===1,20013,{expectedCount:r});else{const o=this.ot(t);if(o!==r){const c=this._t(e),u=c?this.ut(c,e,o):1;if(u!==0){this.rt(t);const h=u===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.He=this.He.insert(t,h)}}}}}_t(e){const t=e.De.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:r="",padding:s=0},hashCount:i=0}=t;let o,c;try{o=Wt(r).toUint8Array()}catch(u){if(u instanceof qg)return qt("Decoding the base64 bloom filter in existence filter failed ("+u.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw u}try{c=new jl(o,s,i)}catch(u){return qt(u instanceof _i?"BloomFilter error: ":"Applying bloom filter failed: ",u),null}return c.fe===0?null:c}ut(e,t,r){return t.De.count===r-this.ht(e,t.targetId)?0:2}ht(e,t){const r=this.We.getRemoteKeysForTarget(t);let s=0;return r.forEach(i=>{const o=this.We.lt(),c=`projects/${o.projectId}/databases/${o.database}/documents/${i.path.canonicalString()}`;e.mightContain(c)||(this.Xe(t,i,null),s++)}),s}Pt(e){const t=new Map;this.Ge.forEach((i,o)=>{const c=this.st(o);if(c){if(i.current&&ba(c.target)){const u=new $(c.target.path);this.Tt(u).has(o)||this.It(o,u)||this.Xe(o,u,Ie.newNoDocument(u,e))}i.Ne&&(t.set(o,i.Le()),i.ke())}});let r=X();this.Je.forEach((i,o)=>{let c=!0;o.forEachWhile(u=>{const h=this.st(u);return!h||h.purpose==="TargetPurposeLimboResolution"||(c=!1,!1)}),c&&(r=r.add(i))}),this.ze.forEach((i,o)=>o.setReadTime(e));const s=new fo(e,t,this.He,this.ze,r);return this.ze=tt(),this.je=Ho(),this.Je=Ho(),this.He=new fe(Q),s}Ze(e,t){if(!this.nt(e))return;const r=this.It(e,t.key)?2:0;this.tt(e).qe(t.key,r),this.ze=this.ze.insert(t.key,t),this.je=this.je.insert(t.key,this.Tt(t.key).add(e)),this.Je=this.Je.insert(t.key,this.dt(t.key).add(e))}Xe(e,t,r){if(!this.nt(e))return;const s=this.tt(e);this.It(e,t)?s.qe(t,1):s.Qe(t),this.Je=this.Je.insert(t,this.dt(t).delete(e)),this.Je=this.Je.insert(t,this.dt(t).add(e)),r&&(this.ze=this.ze.insert(t,r))}removeTarget(e){this.Ge.delete(e)}ot(e){const t=this.tt(e).Le();return this.We.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}$e(e){this.tt(e).$e()}tt(e){let t=this.Ge.get(e);return t||(t=new em,this.Ge.set(e,t)),t}dt(e){let t=this.Je.get(e);return t||(t=new ue(Q),this.Je=this.Je.insert(e,t)),t}Tt(e){let t=this.je.get(e);return t||(t=new ue(Q),this.je=this.je.insert(e,t)),t}nt(e){const t=this.st(e)!==null;return t||x("WatchChangeAggregator","Detected inactive target",e),t}st(e){const t=this.Ge.get(e);return t&&t.Oe?null:this.We.Et(e)}rt(e){this.Ge.set(e,new em),this.We.getRemoteKeysForTarget(e).forEach(t=>{this.Xe(e,t,null)})}It(e,t){return this.We.getRemoteKeysForTarget(e).has(t)}}function Ho(){return new fe($.comparator)}function tm(){return new fe($.comparator)}const n0={asc:"ASCENDING",desc:"DESCENDING"},r0={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},s0={and:"AND",or:"OR"};class i0{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function Qu(n,e){return n.useProto3Json||Ja(e)?e:{value:e}}function As(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function A_(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function o0(n,e){return As(n,e.toTimestamp())}function ze(n){return G(!!n,49232),K.fromTimestamp(function(t){const r=zt(t);return new ae(r.seconds,r.nanos)}(n))}function $l(n,e){return Yu(n,e).canonicalString()}function Yu(n,e){const t=function(s){return new se(["projects",s.projectId,"databases",s.database])}(n).child("documents");return e===void 0?t:t.child(e)}function S_(n){const e=se.fromString(n);return G(N_(e),10190,{key:e.toString()}),e}function Pa(n,e){return $l(n.databaseId,e.path)}function dr(n,e){const t=S_(e);if(t.get(1)!==n.databaseId.projectId)throw new M(V.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new M(V.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new $(C_(t))}function P_(n,e){return $l(n.databaseId,e)}function R_(n){const e=S_(n);return e.length===4?se.emptyPath():C_(e)}function Xu(n){return new se(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function C_(n){return G(n.length>4&&n.get(4)==="documents",29091,{key:n.toString()}),n.popFirst(5)}function nm(n,e,t){return{name:Pa(n,e),fields:t.value.mapValue.fields}}function a0(n,e,t){const r=dr(n,e.name),s=ze(e.updateTime),i=e.createTime?ze(e.createTime):K.min(),o=new Qe({mapValue:{fields:e.fields}}),c=Ie.newFoundDocument(r,s,i,o);return t&&c.setHasCommittedMutations(),t?c.setHasCommittedMutations():c}function c0(n,e){let t;if("targetChange"in e){e.targetChange;const r=function(h){return h==="NO_CHANGE"?0:h==="ADD"?1:h==="REMOVE"?2:h==="CURRENT"?3:h==="RESET"?4:q(39313,{state:h})}(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=function(h,f){return h.useProto3Json?(G(f===void 0||typeof f=="string",58123),Ee.fromBase64String(f||"")):(G(f===void 0||f instanceof Buffer||f instanceof Uint8Array,16193),Ee.fromUint8Array(f||new Uint8Array))}(n,e.targetChange.resumeToken),o=e.targetChange.cause,c=o&&function(h){const f=h.code===void 0?V.UNKNOWN:E_(h.code);return new M(f,h.message||"")}(o);t=new b_(r,s,i,c||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const s=dr(n,r.document.name),i=ze(r.document.updateTime),o=r.document.createTime?ze(r.document.createTime):K.min(),c=new Qe({mapValue:{fields:r.document.fields}}),u=Ie.newFoundDocument(s,i,o,c),h=r.targetIds||[],f=r.removedTargetIds||[];t=new oa(h,f,u.key,u)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const s=dr(n,r.document),i=r.readTime?ze(r.readTime):K.min(),o=Ie.newNoDocument(s,i),c=r.removedTargetIds||[];t=new oa([],c,o.key,o)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const s=dr(n,r.document),i=r.removedTargetIds||[];t=new oa([],i,s,null)}else{if(!("filter"in e))return q(11601,{At:e});{e.filter;const r=e.filter;r.targetId;const{count:s=0,unchangedNames:i}=r,o=new JA(s,i),c=r.targetId;t=new T_(c,o)}}return t}function Ra(n,e){let t;if(e instanceof Fs)t={update:nm(n,e.key,e.value)};else if(e instanceof Fl)t={delete:Pa(n,e.key)};else if(e instanceof Nn)t={update:nm(n,e.key,e.data),updateMask:m0(e.fieldMask)};else{if(!(e instanceof w_))return q(16599,{Rt:e.type});t={verify:Pa(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map(r=>function(i,o){const c=o.transform;if(c instanceof Es)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(c instanceof Ts)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:c.elements}};if(c instanceof bs)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:c.elements}};if(c instanceof Qi)return{fieldPath:o.field.canonicalString(),increment:c.Ee};throw q(20930,{transform:o.transform})}(0,r))),e.precondition.isNone||(t.currentDocument=function(s,i){return i.updateTime!==void 0?{updateTime:o0(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:q(27497)}(n,e.precondition)),t}function Ju(n,e){const t=e.currentDocument?function(i){return i.updateTime!==void 0?nt.updateTime(ze(i.updateTime)):i.exists!==void 0?nt.exists(i.exists):nt.none()}(e.currentDocument):nt.none(),r=e.updateTransforms?e.updateTransforms.map(s=>function(o,c){let u=null;if("setToServerValue"in c)G(c.setToServerValue==="REQUEST_TIME",16630,{proto:c}),u=new Es;else if("appendMissingElements"in c){const f=c.appendMissingElements.values||[];u=new Ts(f)}else if("removeAllFromArray"in c){const f=c.removeAllFromArray.values||[];u=new bs(f)}else"increment"in c?u=new Qi(o,c.increment):q(16584,{proto:c});const h=_e.fromServerFormat(c.fieldPath);return new y_(h,u)}(n,s)):[];if(e.update){e.update.name;const s=dr(n,e.update.name),i=new Qe({mapValue:{fields:e.update.fields}});if(e.updateMask){const o=function(u){const h=u.fieldPaths||[];return new ct(h.map(f=>_e.fromServerFormat(f)))}(e.updateMask);return new Nn(s,i,o,t,r)}return new Fs(s,i,t,r)}if(e.delete){const s=dr(n,e.delete);return new Fl(s,t)}if(e.verify){const s=dr(n,e.verify);return new w_(s,t)}return q(1463,{proto:e})}function u0(n,e){return n&&n.length>0?(G(e!==void 0,14353),n.map(t=>function(s,i){let o=s.updateTime?ze(s.updateTime):ze(i);return o.isEqual(K.min())&&(o=ze(i)),new QA(o,s.transformResults||[])}(t,e))):[]}function D_(n,e){return{documents:[P_(n,e.path)]}}function k_(n,e){const t={structuredQuery:{}},r=e.path;let s;e.collectionGroup!==null?(s=r,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=r.popLast(),t.structuredQuery.from=[{collectionId:r.lastSegment()}]),t.parent=P_(n,s);const i=function(h){if(h.length!==0)return x_(ce.create(h,"and"))}(e.filters);i&&(t.structuredQuery.where=i);const o=function(h){if(h.length!==0)return h.map(f=>function(p){return{field:Br(p.field),direction:h0(p.dir)}}(f))}(e.orderBy);o&&(t.structuredQuery.orderBy=o);const c=Qu(n,e.limit);return c!==null&&(t.structuredQuery.limit=c),e.startAt&&(t.structuredQuery.startAt=function(h){return{before:h.inclusive,values:h.position}}(e.startAt)),e.endAt&&(t.structuredQuery.endAt=function(h){return{before:!h.inclusive,values:h.position}}(e.endAt)),{Vt:t,parent:s}}function V_(n){let e=R_(n.parent);const t=n.structuredQuery,r=t.from?t.from.length:0;let s=null;if(r>0){G(r===1,65062);const f=t.from[0];f.allDescendants?s=f.collectionId:e=e.child(f.collectionId)}let i=[];t.where&&(i=function(m){const p=O_(m);return p instanceof ce&&xl(p)?p.getFilters():[p]}(t.where));let o=[];t.orderBy&&(o=function(m){return m.map(p=>function(C){return new Ki(jr(C.field),function(P){switch(P){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(C.direction))}(p))}(t.orderBy));let c=null;t.limit&&(c=function(m){let p;return p=typeof m=="object"?m.value:m,Ja(p)?null:p}(t.limit));let u=null;t.startAt&&(u=function(m){const p=!!m.before,w=m.values||[];return new Is(w,p)}(t.startAt));let h=null;return t.endAt&&(h=function(m){const p=!m.before,w=m.values||[];return new Is(w,p)}(t.endAt)),i_(e,s,o,i,c,"F",u,h)}function l0(n,e){const t=function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return q(28987,{purpose:s})}}(e.purpose);return t==null?null:{"goog-listen-tags":t}}function O_(n){return n.unaryFilter!==void 0?function(t){switch(t.unaryFilter.op){case"IS_NAN":const r=jr(t.unaryFilter.field);return Z.create(r,"==",{doubleValue:NaN});case"IS_NULL":const s=jr(t.unaryFilter.field);return Z.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=jr(t.unaryFilter.field);return Z.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const o=jr(t.unaryFilter.field);return Z.create(o,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return q(61313);default:return q(60726)}}(n):n.fieldFilter!==void 0?function(t){return Z.create(jr(t.fieldFilter.field),function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return q(58110);default:return q(50506)}}(t.fieldFilter.op),t.fieldFilter.value)}(n):n.compositeFilter!==void 0?function(t){return ce.create(t.compositeFilter.filters.map(r=>O_(r)),function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return q(1026)}}(t.compositeFilter.op))}(n):q(30097,{filter:n})}function h0(n){return n0[n]}function d0(n){return r0[n]}function f0(n){return s0[n]}function Br(n){return{fieldPath:n.canonicalString()}}function jr(n){return _e.fromServerFormat(n.fieldPath)}function x_(n){return n instanceof Z?function(t){if(t.op==="=="){if(Bf(t.value))return{unaryFilter:{field:Br(t.field),op:"IS_NAN"}};if(Uf(t.value))return{unaryFilter:{field:Br(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(Bf(t.value))return{unaryFilter:{field:Br(t.field),op:"IS_NOT_NAN"}};if(Uf(t.value))return{unaryFilter:{field:Br(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Br(t.field),op:d0(t.op),value:t.value}}}(n):n instanceof ce?function(t){const r=t.getFilters().map(s=>x_(s));return r.length===1?r[0]:{compositeFilter:{op:f0(t.op),filters:r}}}(n):q(54877,{filter:n})}function m0(n){const e=[];return n.fields.forEach(t=>e.push(t.canonicalString())),{fieldPaths:e}}function N_(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ut{constructor(e,t,r,s,i=K.min(),o=K.min(),c=Ee.EMPTY_BYTE_STRING,u=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=c,this.expectedCount=u}withSequenceNumber(e){return new Ut(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new Ut(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new Ut(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new Ut(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class M_{constructor(e){this.gt=e}}function p0(n,e){let t;if(e.document)t=a0(n.gt,e.document,!!e.hasCommittedMutations);else if(e.noDocument){const r=$.fromSegments(e.noDocument.path),s=Ir(e.noDocument.readTime);t=Ie.newNoDocument(r,s),e.hasCommittedMutations&&t.setHasCommittedMutations()}else{if(!e.unknownDocument)return q(56709);{const r=$.fromSegments(e.unknownDocument.path),s=Ir(e.unknownDocument.version);t=Ie.newUnknownDocument(r,s)}}return e.readTime&&t.setReadTime(function(s){const i=new ae(s[0],s[1]);return K.fromTimestamp(i)}(e.readTime)),t}function rm(n,e){const t=e.key,r={prefixPath:t.getCollectionPath().popLast().toArray(),collectionGroup:t.collectionGroup,documentId:t.path.lastSegment(),readTime:Ca(e.readTime),hasCommittedMutations:e.hasCommittedMutations};if(e.isFoundDocument())r.document=function(i,o){return{name:Pa(i,o.key),fields:o.data.value.mapValue.fields,updateTime:As(i,o.version.toTimestamp()),createTime:As(i,o.createTime.toTimestamp())}}(n.gt,e);else if(e.isNoDocument())r.noDocument={path:t.path.toArray(),readTime:vr(e.version)};else{if(!e.isUnknownDocument())return q(57904,{document:e});r.unknownDocument={path:t.path.toArray(),version:vr(e.version)}}return r}function Ca(n){const e=n.toTimestamp();return[e.seconds,e.nanoseconds]}function vr(n){const e=n.toTimestamp();return{seconds:e.seconds,nanoseconds:e.nanoseconds}}function Ir(n){const e=new ae(n.seconds,n.nanoseconds);return K.fromTimestamp(e)}function Qn(n,e){const t=(e.baseMutations||[]).map(i=>Ju(n.gt,i));for(let i=0;i<e.mutations.length-1;++i){const o=e.mutations[i];if(i+1<e.mutations.length&&e.mutations[i+1].transform!==void 0){const c=e.mutations[i+1];o.updateTransforms=c.transform.fieldTransforms,e.mutations.splice(i+1,1),++i}}const r=e.mutations.map(i=>Ju(n.gt,i)),s=ae.fromMillis(e.localWriteTimeMs);return new Ll(e.batchId,s,t,r)}function yi(n){const e=Ir(n.readTime),t=n.lastLimboFreeSnapshotVersion!==void 0?Ir(n.lastLimboFreeSnapshotVersion):K.min();let r;return r=function(i){return i.documents!==void 0}(n.query)?function(i){const o=i.documents.length;return G(o===1,1966,{count:o}),rt(sc(R_(i.documents[0])))}(n.query):function(i){return rt(V_(i))}(n.query),new Ut(r,n.targetId,"TargetPurposeListen",n.lastListenSequenceNumber,e,t,Ee.fromBase64String(n.resumeToken))}function F_(n,e){const t=vr(e.snapshotVersion),r=vr(e.lastLimboFreeSnapshotVersion);let s;s=ba(e.target)?D_(n.gt,e.target):k_(n.gt,e.target).Vt;const i=e.resumeToken.toBase64();return{targetId:e.targetId,canonicalId:yr(e.target),readTime:t,resumeToken:i,lastListenSequenceNumber:e.sequenceNumber,lastLimboFreeSnapshotVersion:r,query:s}}function L_(n){const e=V_({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?Sa(e,e.limit,"L"):e}function nu(n,e){return new Bl(e.largestBatchId,Ju(n.gt,e.overlayMutation))}function sm(n,e){const t=e.path.lastSegment();return[n,Ue(e.path.popLast()),t]}function im(n,e,t,r){return{indexId:n,uid:e,sequenceNumber:t,readTime:vr(r.readTime),documentKey:Ue(r.documentKey.path),largestBatchId:r.largestBatchId}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class g0{getBundleMetadata(e,t){return om(e).get(t).next(r=>{if(r)return function(i){return{id:i.bundleId,createTime:Ir(i.createTime),version:i.version}}(r)})}saveBundleMetadata(e,t){return om(e).put(function(s){return{bundleId:s.id,createTime:vr(ze(s.createTime)),version:s.version}}(t))}getNamedQuery(e,t){return am(e).get(t).next(r=>{if(r)return function(i){return{name:i.name,query:L_(i.bundledQuery),readTime:Ir(i.readTime)}}(r)})}saveNamedQuery(e,t){return am(e).put(function(s){return{name:s.name,readTime:vr(ze(s.readTime)),bundledQuery:s.bundledQuery}}(t))}}function om(n){return Se(n,Za)}function am(n){return Se(n,ec)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cc{constructor(e,t){this.serializer=e,this.userId=t}static yt(e,t){const r=t.uid||"";return new cc(e,r)}getOverlay(e,t){return ui(e).get(sm(this.userId,t)).next(r=>r?nu(this.serializer,r):null)}getOverlays(e,t){const r=St();return A.forEach(t,s=>this.getOverlay(e,s).next(i=>{i!==null&&r.set(s,i)})).next(()=>r)}saveOverlays(e,t,r){const s=[];return r.forEach((i,o)=>{const c=new Bl(t,o);s.push(this.wt(e,c))}),A.waitFor(s)}removeOverlaysForBatchId(e,t,r){const s=new Set;t.forEach(o=>s.add(Ue(o.getCollectionPath())));const i=[];return s.forEach(o=>{const c=IDBKeyRange.bound([this.userId,o,r],[this.userId,o,r+1],!1,!0);i.push(ui(e).Y(ju,c))}),A.waitFor(i)}getOverlaysForCollection(e,t,r){const s=St(),i=Ue(t),o=IDBKeyRange.bound([this.userId,i,r],[this.userId,i,Number.POSITIVE_INFINITY],!0);return ui(e).j(ju,o).next(c=>{for(const u of c){const h=nu(this.serializer,u);s.set(h.getKey(),h)}return s})}getOverlaysForCollectionGroup(e,t,r,s){const i=St();let o;const c=IDBKeyRange.bound([this.userId,t,r],[this.userId,t,Number.POSITIVE_INFINITY],!0);return ui(e).X({index:Fg,range:c},(u,h,f)=>{const m=nu(this.serializer,h);i.size()<s||m.largestBatchId===o?(i.set(m.getKey(),m),o=m.largestBatchId):f.done()}).next(()=>i)}wt(e,t){return ui(e).put(function(s,i,o){const[c,u,h]=sm(i,o.mutation.key);return{userId:i,collectionPath:u,documentId:h,collectionGroup:o.mutation.key.getCollectionGroup(),largestBatchId:o.largestBatchId,overlayMutation:Ra(s.gt,o.mutation)}}(this.serializer,this.userId,t))}}function ui(n){return Se(n,tc)}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _0{St(e){return Se(e,Cl)}getSessionToken(e){return this.St(e).get("sessionToken").next(t=>{const r=t==null?void 0:t.value;return r?Ee.fromUint8Array(r):Ee.EMPTY_BYTE_STRING})}setSessionToken(e,t){return this.St(e).put({name:"sessionToken",value:t.toUint8Array()})}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yn{constructor(){}bt(e,t){this.Dt(e,t),t.vt()}Dt(e,t){if("nullValue"in e)this.Ct(t,5);else if("booleanValue"in e)this.Ct(t,10),t.Ft(e.booleanValue?1:0);else if("integerValue"in e)this.Ct(t,15),t.Ft(ge(e.integerValue));else if("doubleValue"in e){const r=ge(e.doubleValue);isNaN(r)?this.Ct(t,13):(this.Ct(t,15),Ui(r)?t.Ft(0):t.Ft(r))}else if("timestampValue"in e){let r=e.timestampValue;this.Ct(t,20),typeof r=="string"&&(r=zt(r)),t.Mt(`${r.seconds||""}`),t.Ft(r.nanos||0)}else if("stringValue"in e)this.xt(e.stringValue,t),this.Ot(t);else if("bytesValue"in e)this.Ct(t,30),t.Nt(Wt(e.bytesValue)),this.Ot(t);else if("referenceValue"in e)this.Bt(e.referenceValue,t);else if("geoPointValue"in e){const r=e.geoPointValue;this.Ct(t,45),t.Ft(r.latitude||0),t.Ft(r.longitude||0)}else"mapValue"in e?Qg(e)?this.Ct(t,Number.MAX_SAFE_INTEGER):rc(e)?this.Lt(e.mapValue,t):(this.kt(e.mapValue,t),this.Ot(t)):"arrayValue"in e?(this.qt(e.arrayValue,t),this.Ot(t)):q(19022,{Qt:e})}xt(e,t){this.Ct(t,25),this.$t(e,t)}$t(e,t){t.Mt(e)}kt(e,t){const r=e.fields||{};this.Ct(t,55);for(const s of Object.keys(r))this.xt(s,t),this.Dt(r[s],t)}Lt(e,t){var r,s;const i=e.fields||{};this.Ct(t,53);const o=ys,c=((s=(r=i[o].arrayValue)===null||r===void 0?void 0:r.values)===null||s===void 0?void 0:s.length)||0;this.Ct(t,15),t.Ft(ge(c)),this.xt(o,t),this.Dt(i[o],t)}qt(e,t){const r=e.values||[];this.Ct(t,50);for(const s of r)this.Dt(s,t)}Bt(e,t){this.Ct(t,37),$.fromName(e).path.forEach(r=>{this.Ct(t,60),this.$t(r,t)})}Ct(e,t){e.Ft(t)}Ot(e){e.Ft(2)}}Yn.Ut=new Yn;/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law | agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES | CONDITIONS OF ANY KIND, either express | implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xr=255;function y0(n){if(n===0)return 8;let e=0;return n>>4||(e+=4,n<<=4),n>>6||(e+=2,n<<=2),n>>7||(e+=1),e}function cm(n){const e=64-function(r){let s=0;for(let i=0;i<8;++i){const o=y0(255&r[i]);if(s+=o,o!==8)break}return s}(n);return Math.ceil(e/8)}class v0{constructor(){this.buffer=new Uint8Array(1024),this.position=0}Kt(e){const t=e[Symbol.iterator]();let r=t.next();for(;!r.done;)this.Wt(r.value),r=t.next();this.Gt()}zt(e){const t=e[Symbol.iterator]();let r=t.next();for(;!r.done;)this.jt(r.value),r=t.next();this.Jt()}Ht(e){for(const t of e){const r=t.charCodeAt(0);if(r<128)this.Wt(r);else if(r<2048)this.Wt(960|r>>>6),this.Wt(128|63&r);else if(t<"\uD800"||"\uDBFF"<t)this.Wt(480|r>>>12),this.Wt(128|63&r>>>6),this.Wt(128|63&r);else{const s=t.codePointAt(0);this.Wt(240|s>>>18),this.Wt(128|63&s>>>12),this.Wt(128|63&s>>>6),this.Wt(128|63&s)}}this.Gt()}Yt(e){for(const t of e){const r=t.charCodeAt(0);if(r<128)this.jt(r);else if(r<2048)this.jt(960|r>>>6),this.jt(128|63&r);else if(t<"\uD800"||"\uDBFF"<t)this.jt(480|r>>>12),this.jt(128|63&r>>>6),this.jt(128|63&r);else{const s=t.codePointAt(0);this.jt(240|s>>>18),this.jt(128|63&s>>>12),this.jt(128|63&s>>>6),this.jt(128|63&s)}}this.Jt()}Zt(e){const t=this.Xt(e),r=cm(t);this.en(1+r),this.buffer[this.position++]=255&r;for(let s=t.length-r;s<t.length;++s)this.buffer[this.position++]=255&t[s]}tn(e){const t=this.Xt(e),r=cm(t);this.en(1+r),this.buffer[this.position++]=~(255&r);for(let s=t.length-r;s<t.length;++s)this.buffer[this.position++]=~(255&t[s])}nn(){this.rn(xr),this.rn(255)}sn(){this._n(xr),this._n(255)}reset(){this.position=0}seed(e){this.en(e.length),this.buffer.set(e,this.position),this.position+=e.length}an(){return this.buffer.slice(0,this.position)}Xt(e){const t=function(i){const o=new DataView(new ArrayBuffer(8));return o.setFloat64(0,i,!1),new Uint8Array(o.buffer)}(e),r=!!(128&t[0]);t[0]^=r?255:128;for(let s=1;s<t.length;++s)t[s]^=r?255:0;return t}Wt(e){const t=255&e;t===0?(this.rn(0),this.rn(255)):t===xr?(this.rn(xr),this.rn(0)):this.rn(t)}jt(e){const t=255&e;t===0?(this._n(0),this._n(255)):t===xr?(this._n(xr),this._n(0)):this._n(e)}Gt(){this.rn(0),this.rn(1)}Jt(){this._n(0),this._n(1)}rn(e){this.en(1),this.buffer[this.position++]=e}_n(e){this.en(1),this.buffer[this.position++]=~e}en(e){const t=e+this.position;if(t<=this.buffer.length)return;let r=2*this.buffer.length;r<t&&(r=t);const s=new Uint8Array(r);s.set(this.buffer),this.buffer=s}}class I0{constructor(e){this.un=e}Nt(e){this.un.Kt(e)}Mt(e){this.un.Ht(e)}Ft(e){this.un.Zt(e)}vt(){this.un.nn()}}class w0{constructor(e){this.un=e}Nt(e){this.un.zt(e)}Mt(e){this.un.Yt(e)}Ft(e){this.un.tn(e)}vt(){this.un.sn()}}class li{constructor(){this.un=new v0,this.cn=new I0(this.un),this.ln=new w0(this.un)}seed(e){this.un.seed(e)}hn(e){return e===0?this.cn:this.ln}an(){return this.un.an()}reset(){this.un.reset()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xn{constructor(e,t,r,s){this.Pn=e,this.Tn=t,this.In=r,this.dn=s}En(){const e=this.dn.length,t=e===0||this.dn[e-1]===255?e+1:e,r=new Uint8Array(t);return r.set(this.dn,0),t!==e?r.set([0],this.dn.length):++r[r.length-1],new Xn(this.Pn,this.Tn,this.In,r)}An(e,t,r){return{indexId:this.Pn,uid:e,arrayValue:aa(this.In),directionalValue:aa(this.dn),orderedDocumentKey:aa(t),documentKey:r.path.toArray()}}Rn(e,t,r){const s=this.An(e,t,r);return[s.indexId,s.uid,s.arrayValue,s.directionalValue,s.orderedDocumentKey,s.documentKey]}}function Zt(n,e){let t=n.Pn-e.Pn;return t!==0?t:(t=um(n.In,e.In),t!==0?t:(t=um(n.dn,e.dn),t!==0?t:$.comparator(n.Tn,e.Tn)))}function um(n,e){for(let t=0;t<n.length&&t<e.length;++t){const r=n[t]-e[t];if(r!==0)return r}return n.length-e.length}function aa(n){return hg()?function(t){let r="";for(let s=0;s<t.length;s++)r+=String.fromCharCode(t[s]);return r}(n):n}function lm(n){return typeof n!="string"?n:function(t){const r=new Uint8Array(t.length);for(let s=0;s<t.length;s++)r[s]=t.charCodeAt(s);return r}(n)}class hm{constructor(e){this.Vn=new ue((t,r)=>_e.comparator(t.field,r.field)),this.collectionId=e.collectionGroup!=null?e.collectionGroup:e.path.lastSegment(),this.mn=e.orderBy,this.fn=[];for(const t of e.filters){const r=t;r.isInequality()?this.Vn=this.Vn.add(r):this.fn.push(r)}}get gn(){return this.Vn.size>1}pn(e){if(G(e.collectionGroup===this.collectionId,49279),this.gn)return!1;const t=Lu(e);if(t!==void 0&&!this.yn(t))return!1;const r=Hn(e);let s=new Set,i=0,o=0;for(;i<r.length&&this.yn(r[i]);++i)s=s.add(r[i].fieldPath.canonicalString());if(i===r.length)return!0;if(this.Vn.size>0){const c=this.Vn.getIterator().getNext();if(!s.has(c.field.canonicalString())){const u=r[i];if(!this.wn(c,u)||!this.Sn(this.mn[o++],u))return!1}++i}for(;i<r.length;++i){const c=r[i];if(o>=this.mn.length||!this.Sn(this.mn[o++],c))return!1}return!0}bn(){if(this.gn)return null;let e=new ue(_e.comparator);const t=[];for(const r of this.fn)if(!r.field.isKeyField())if(r.op==="array-contains"||r.op==="array-contains-any")t.push(new Zo(r.field,2));else{if(e.has(r.field))continue;e=e.add(r.field),t.push(new Zo(r.field,0))}for(const r of this.mn)r.field.isKeyField()||e.has(r.field)||(e=e.add(r.field),t.push(new Zo(r.field,r.dir==="asc"?0:1)));return new Ia(Ia.UNKNOWN_ID,this.collectionId,t,Li.empty())}yn(e){for(const t of this.fn)if(this.wn(t,e))return!0;return!1}wn(e,t){if(e===void 0||!e.field.isEqual(t.fieldPath))return!1;const r=e.op==="array-contains"||e.op==="array-contains-any";return t.kind===2===r}Sn(e,t){return!!e.field.isEqual(t.fieldPath)&&(t.kind===0&&e.dir==="asc"||t.kind===1&&e.dir==="desc")}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function U_(n){var e,t;if(G(n instanceof Z||n instanceof ce,20012),n instanceof Z){if(n instanceof s_){const s=((t=(e=n.value.arrayValue)===null||e===void 0?void 0:e.values)===null||t===void 0?void 0:t.map(i=>Z.create(n.field,"==",i)))||[];return ce.create(s,"or")}return n}const r=n.filters.map(s=>U_(s));return ce.create(r,n.op)}function E0(n){if(n.getFilters().length===0)return[];const e=tl(U_(n));return G(B_(e),7391),Zu(e)||el(e)?[e]:e.getFilters()}function Zu(n){return n instanceof Z}function el(n){return n instanceof ce&&xl(n)}function B_(n){return Zu(n)||el(n)||function(t){if(t instanceof ce&&Wu(t)){for(const r of t.getFilters())if(!Zu(r)&&!el(r))return!1;return!0}return!1}(n)}function tl(n){if(G(n instanceof Z||n instanceof ce,34018),n instanceof Z)return n;if(n.filters.length===1)return tl(n.filters[0]);const e=n.filters.map(r=>tl(r));let t=ce.create(e,n.op);return t=Da(t),B_(t)?t:(G(t instanceof ce,64498),G(ws(t),40251),G(t.filters.length>1,57927),t.filters.reduce((r,s)=>ql(r,s)))}function ql(n,e){let t;return G(n instanceof Z||n instanceof ce,38388),G(e instanceof Z||e instanceof ce,25473),t=n instanceof Z?e instanceof Z?function(s,i){return ce.create([s,i],"and")}(n,e):dm(n,e):e instanceof Z?dm(e,n):function(s,i){if(G(s.filters.length>0&&i.filters.length>0,48005),ws(s)&&ws(i))return t_(s,i.getFilters());const o=Wu(s)?s:i,c=Wu(s)?i:s,u=o.filters.map(h=>ql(h,c));return ce.create(u,"or")}(n,e),Da(t)}function dm(n,e){if(ws(e))return t_(e,n.getFilters());{const t=e.filters.map(r=>ql(n,r));return ce.create(t,"or")}}function Da(n){if(G(n instanceof Z||n instanceof ce,11850),n instanceof Z)return n;const e=n.getFilters();if(e.length===1)return Da(e[0]);if(Zg(n))return n;const t=e.map(s=>Da(s)),r=[];return t.forEach(s=>{s instanceof Z?r.push(s):s instanceof ce&&(s.op===n.op?r.push(...s.filters):r.push(s))}),r.length===1?r[0]:ce.create(r,n.op)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class T0{constructor(){this.Dn=new zl}addToCollectionParentIndex(e,t){return this.Dn.add(t),A.resolve()}getCollectionParents(e,t){return A.resolve(this.Dn.getEntries(t))}addFieldIndex(e,t){return A.resolve()}deleteFieldIndex(e,t){return A.resolve()}deleteAllFieldIndexes(e){return A.resolve()}createTargetIndexes(e,t){return A.resolve()}getDocumentsMatchingTarget(e,t){return A.resolve(null)}getIndexType(e,t){return A.resolve(0)}getFieldIndexes(e,t){return A.resolve([])}getNextCollectionGroupToUpdate(e){return A.resolve(null)}getMinOffset(e,t){return A.resolve(st.min())}getMinOffsetFromCollectionGroup(e,t){return A.resolve(st.min())}updateCollectionGroup(e,t,r){return A.resolve()}updateIndexEntries(e,t){return A.resolve()}}class zl{constructor(){this.index={}}add(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t]||new ue(se.comparator),i=!s.has(r);return this.index[t]=s.add(r),i}has(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t];return s&&s.has(r)}getEntries(e){return(this.index[e]||new ue(se.comparator)).toArray()}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fm="IndexedDbIndexManager",Go=new Uint8Array(0);class b0{constructor(e,t){this.databaseId=t,this.vn=new zl,this.Cn=new Gt(r=>yr(r),(r,s)=>lo(r,s)),this.uid=e.uid||""}addToCollectionParentIndex(e,t){if(!this.vn.has(t)){const r=t.lastSegment(),s=t.popLast();e.addOnCommittedListener(()=>{this.vn.add(t)});const i={collectionId:r,parent:Ue(s)};return mm(e).put(i)}return A.resolve()}getCollectionParents(e,t){const r=[],s=IDBKeyRange.bound([t,""],[Tg(t),""],!1,!0);return mm(e).j(s).next(i=>{for(const o of i){if(o.collectionId!==t)break;r.push(At(o.parent))}return r})}addFieldIndex(e,t){const r=hi(e),s=function(c){return{indexId:c.indexId,collectionGroup:c.collectionGroup,fields:c.fields.map(u=>[u.fieldPath.canonicalString(),u.kind])}}(t);delete s.indexId;const i=r.add(s);if(t.indexState){const o=Mr(e);return i.next(c=>{o.put(im(c,this.uid,t.indexState.sequenceNumber,t.indexState.offset))})}return i.next()}deleteFieldIndex(e,t){const r=hi(e),s=Mr(e),i=Nr(e);return r.delete(t.indexId).next(()=>s.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0))).next(()=>i.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0)))}deleteAllFieldIndexes(e){const t=hi(e),r=Nr(e),s=Mr(e);return t.Y().next(()=>r.Y()).next(()=>s.Y())}createTargetIndexes(e,t){return A.forEach(this.Fn(t),r=>this.getIndexType(e,r).next(s=>{if(s===0||s===1){const i=new hm(r).bn();if(i!=null)return this.addFieldIndex(e,i)}}))}getDocumentsMatchingTarget(e,t){const r=Nr(e);let s=!0;const i=new Map;return A.forEach(this.Fn(t),o=>this.Mn(e,o).next(c=>{s&&(s=!!c),i.set(o,c)})).next(()=>{if(s){let o=X();const c=[];return A.forEach(i,(u,h)=>{x(fm,`Using index ${function(O){return`id=${O.indexId}|cg=${O.collectionGroup}|f=${O.fields.map(U=>`${U.fieldPath}:${U.kind}`).join(",")}`}(u)} to execute ${yr(t)}`);const f=function(O,U){const N=Lu(U);if(N===void 0)return null;for(const W of Aa(O,N.fieldPath))switch(W.op){case"array-contains-any":return W.value.arrayValue.values||[];case"array-contains":return[W.value]}return null}(h,u),m=function(O,U){const N=new Map;for(const W of Hn(U))for(const T of Aa(O,W.fieldPath))switch(T.op){case"==":case"in":N.set(W.fieldPath.canonicalString(),T.value);break;case"not-in":case"!=":return N.set(W.fieldPath.canonicalString(),T.value),Array.from(N.values())}return null}(h,u),p=function(O,U){const N=[];let W=!0;for(const T of Hn(U)){const _=T.kind===0?Wf(O,T.fieldPath,O.startAt):Hf(O,T.fieldPath,O.startAt);N.push(_.value),W&&(W=_.inclusive)}return new Is(N,W)}(h,u),w=function(O,U){const N=[];let W=!0;for(const T of Hn(U)){const _=T.kind===0?Hf(O,T.fieldPath,O.endAt):Wf(O,T.fieldPath,O.endAt);N.push(_.value),W&&(W=_.inclusive)}return new Is(N,W)}(h,u),C=this.xn(u,h,p),D=this.xn(u,h,w),P=this.On(u,h,m),F=this.Nn(u.indexId,f,C,p.inclusive,D,w.inclusive,P);return A.forEach(F,L=>r.H(L,t.limit).next(O=>{O.forEach(U=>{const N=$.fromSegments(U.documentKey);o.has(N)||(o=o.add(N),c.push(N))})}))}).next(()=>c)}return A.resolve(null)})}Fn(e){let t=this.Cn.get(e);return t||(e.filters.length===0?t=[e]:t=E0(ce.create(e.filters,"and")).map(r=>Gu(e.path,e.collectionGroup,e.orderBy,r.getFilters(),e.limit,e.startAt,e.endAt)),this.Cn.set(e,t),t)}Nn(e,t,r,s,i,o,c){const u=(t!=null?t.length:1)*Math.max(r.length,i.length),h=u/(t!=null?t.length:1),f=[];for(let m=0;m<u;++m){const p=t?this.Bn(t[m/h]):Go,w=this.Ln(e,p,r[m%h],s),C=this.kn(e,p,i[m%h],o),D=c.map(P=>this.Ln(e,p,P,!0));f.push(...this.createRange(w,C,D))}return f}Ln(e,t,r,s){const i=new Xn(e,$.empty(),t,r);return s?i:i.En()}kn(e,t,r,s){const i=new Xn(e,$.empty(),t,r);return s?i.En():i}Mn(e,t){const r=new hm(t),s=t.collectionGroup!=null?t.collectionGroup:t.path.lastSegment();return this.getFieldIndexes(e,s).next(i=>{let o=null;for(const c of i)r.pn(c)&&(!o||c.fields.length>o.fields.length)&&(o=c);return o})}getIndexType(e,t){let r=2;const s=this.Fn(t);return A.forEach(s,i=>this.Mn(e,i).next(o=>{o?r!==0&&o.fields.length<function(u){let h=new ue(_e.comparator),f=!1;for(const m of u.filters)for(const p of m.getFlattenedFilters())p.field.isKeyField()||(p.op==="array-contains"||p.op==="array-contains-any"?f=!0:h=h.add(p.field));for(const m of u.orderBy)m.field.isKeyField()||(h=h.add(m.field));return h.size+(f?1:0)}(i)&&(r=1):r=0})).next(()=>function(o){return o.limit!==null}(t)&&s.length>1&&r===2?1:r)}qn(e,t){const r=new li;for(const s of Hn(e)){const i=t.data.field(s.fieldPath);if(i==null)return null;const o=r.hn(s.kind);Yn.Ut.bt(i,o)}return r.an()}Bn(e){const t=new li;return Yn.Ut.bt(e,t.hn(0)),t.an()}Qn(e,t){const r=new li;return Yn.Ut.bt(Hi(this.databaseId,t),r.hn(function(i){const o=Hn(i);return o.length===0?0:o[o.length-1].kind}(e))),r.an()}On(e,t,r){if(r===null)return[];let s=[];s.push(new li);let i=0;for(const o of Hn(e)){const c=r[i++];for(const u of s)if(this.$n(t,o.fieldPath)&&Gi(c))s=this.Un(s,o,c);else{const h=u.hn(o.kind);Yn.Ut.bt(c,h)}}return this.Kn(s)}xn(e,t,r){return this.On(e,t,r.position)}Kn(e){const t=[];for(let r=0;r<e.length;++r)t[r]=e[r].an();return t}Un(e,t,r){const s=[...e],i=[];for(const o of r.arrayValue.values||[])for(const c of s){const u=new li;u.seed(c.an()),Yn.Ut.bt(o,u.hn(t.kind)),i.push(u)}return i}$n(e,t){return!!e.filters.find(r=>r instanceof Z&&r.field.isEqual(t)&&(r.op==="in"||r.op==="not-in"))}getFieldIndexes(e,t){const r=hi(e),s=Mr(e);return(t?r.j(Bu,IDBKeyRange.bound(t,t)):r.j()).next(i=>{const o=[];return A.forEach(i,c=>s.get([c.indexId,this.uid]).next(u=>{o.push(function(f,m){const p=m?new Li(m.sequenceNumber,new st(Ir(m.readTime),new $(At(m.documentKey)),m.largestBatchId)):Li.empty(),w=f.fields.map(([C,D])=>new Zo(_e.fromServerFormat(C),D));return new Ia(f.indexId,f.collectionGroup,w,p)}(c,u))})).next(()=>o)})}getNextCollectionGroupToUpdate(e){return this.getFieldIndexes(e).next(t=>t.length===0?null:(t.sort((r,s)=>{const i=r.indexState.sequenceNumber-s.indexState.sequenceNumber;return i!==0?i:Q(r.collectionGroup,s.collectionGroup)}),t[0].collectionGroup))}updateCollectionGroup(e,t,r){const s=hi(e),i=Mr(e);return this.Wn(e).next(o=>s.j(Bu,IDBKeyRange.bound(t,t)).next(c=>A.forEach(c,u=>i.put(im(u.indexId,this.uid,o,r)))))}updateIndexEntries(e,t){const r=new Map;return A.forEach(t,(s,i)=>{const o=r.get(s.collectionGroup);return(o?A.resolve(o):this.getFieldIndexes(e,s.collectionGroup)).next(c=>(r.set(s.collectionGroup,c),A.forEach(c,u=>this.Gn(e,s,u).next(h=>{const f=this.zn(i,u);return h.isEqual(f)?A.resolve():this.jn(e,i,u,h,f)}))))})}Jn(e,t,r,s){return Nr(e).put(s.An(this.uid,this.Qn(r,t.key),t.key))}Hn(e,t,r,s){return Nr(e).delete(s.Rn(this.uid,this.Qn(r,t.key),t.key))}Gn(e,t,r){const s=Nr(e);let i=new ue(Zt);return s.X({index:Mg,range:IDBKeyRange.only([r.indexId,this.uid,aa(this.Qn(r,t))])},(o,c)=>{i=i.add(new Xn(r.indexId,t,lm(c.arrayValue),lm(c.directionalValue)))}).next(()=>i)}zn(e,t){let r=new ue(Zt);const s=this.qn(t,e);if(s==null)return r;const i=Lu(t);if(i!=null){const o=e.data.field(i.fieldPath);if(Gi(o))for(const c of o.arrayValue.values||[])r=r.add(new Xn(t.indexId,e.key,this.Bn(c),s))}else r=r.add(new Xn(t.indexId,e.key,Go,s));return r}jn(e,t,r,s,i){x(fm,"Updating index entries for document '%s'",t.key);const o=[];return function(u,h,f,m,p){const w=u.getIterator(),C=h.getIterator();let D=Or(w),P=Or(C);for(;D||P;){let F=!1,L=!1;if(D&&P){const O=f(D,P);O<0?L=!0:O>0&&(F=!0)}else D!=null?L=!0:F=!0;F?(m(P),P=Or(C)):L?(p(D),D=Or(w)):(D=Or(w),P=Or(C))}}(s,i,Zt,c=>{o.push(this.Jn(e,t,r,c))},c=>{o.push(this.Hn(e,t,r,c))}),A.waitFor(o)}Wn(e){let t=1;return Mr(e).X({index:Ng,reverse:!0,range:IDBKeyRange.upperBound([this.uid,Number.MAX_SAFE_INTEGER])},(r,s,i)=>{i.done(),t=s.sequenceNumber+1}).next(()=>t)}createRange(e,t,r){r=r.sort((o,c)=>Zt(o,c)).filter((o,c,u)=>!c||Zt(o,u[c-1])!==0);const s=[];s.push(e);for(const o of r){const c=Zt(o,e),u=Zt(o,t);if(c===0)s[0]=e.En();else if(c>0&&u<0)s.push(o),s.push(o.En());else if(u>0)break}s.push(t);const i=[];for(let o=0;o<s.length;o+=2){if(this.Yn(s[o],s[o+1]))return[];const c=s[o].Rn(this.uid,Go,$.empty()),u=s[o+1].Rn(this.uid,Go,$.empty());i.push(IDBKeyRange.bound(c,u))}return i}Yn(e,t){return Zt(e,t)>0}getMinOffsetFromCollectionGroup(e,t){return this.getFieldIndexes(e,t).next(pm)}getMinOffset(e,t){return A.mapArray(this.Fn(t),r=>this.Mn(e,r).next(s=>s||q(44426))).next(pm)}}function mm(n){return Se(n,$i)}function Nr(n){return Se(n,Ai)}function hi(n){return Se(n,Rl)}function Mr(n){return Se(n,bi)}function pm(n){G(n.length!==0,28825);let e=n[0].indexState.offset,t=e.largestBatchId;for(let r=1;r<n.length;r++){const s=n[r].indexState.offset;Al(s,e)<0&&(e=s),t<s.largestBatchId&&(t=s.largestBatchId)}return new st(e.readTime,e.documentKey,t)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gm={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},j_=41943040;class Le{static withCacheSize(e){return new Le(e,Le.DEFAULT_COLLECTION_PERCENTILE,Le.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,r){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=r}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $_(n,e,t){const r=n.store(ft),s=n.store(ms),i=[],o=IDBKeyRange.only(t.batchId);let c=0;const u=r.X({range:o},(f,m,p)=>(c++,p.delete()));i.push(u.next(()=>{G(c===1,47070,{batchId:t.batchId})}));const h=[];for(const f of t.mutations){const m=Vg(e,f.key.path,t.batchId);i.push(s.delete(m)),h.push(f.key)}return A.waitFor(i).next(()=>h)}function ka(n){if(!n)return 0;let e;if(n.document)e=n.document;else if(n.unknownDocument)e=n.unknownDocument;else{if(!n.noDocument)throw q(14731);e=n.noDocument}return JSON.stringify(e).length}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Le.DEFAULT_COLLECTION_PERCENTILE=10,Le.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,Le.DEFAULT=new Le(j_,Le.DEFAULT_COLLECTION_PERCENTILE,Le.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),Le.DISABLED=new Le(-1,0,0);class uc{constructor(e,t,r,s){this.userId=e,this.serializer=t,this.indexManager=r,this.referenceDelegate=s,this.Zn={}}static yt(e,t,r,s){G(e.uid!=="",64387);const i=e.isAuthenticated()?e.uid:"";return new uc(i,t,r,s)}checkEmpty(e){let t=!0;const r=IDBKeyRange.bound([this.userId,Number.NEGATIVE_INFINITY],[this.userId,Number.POSITIVE_INFINITY]);return en(e).X({index:Jn,range:r},(s,i,o)=>{t=!1,o.done()}).next(()=>t)}addMutationBatch(e,t,r,s){const i=$r(e),o=en(e);return o.add({}).next(c=>{G(typeof c=="number",49019);const u=new Ll(c,t,r,s),h=function(w,C,D){const P=D.baseMutations.map(L=>Ra(w.gt,L)),F=D.mutations.map(L=>Ra(w.gt,L));return{userId:C,batchId:D.batchId,localWriteTimeMs:D.localWriteTime.toMillis(),baseMutations:P,mutations:F}}(this.serializer,this.userId,u),f=[];let m=new ue((p,w)=>Q(p.canonicalString(),w.canonicalString()));for(const p of s){const w=Vg(this.userId,p.key.path,c);m=m.add(p.key.path.popLast()),f.push(o.put(h)),f.push(i.put(w,rA))}return m.forEach(p=>{f.push(this.indexManager.addToCollectionParentIndex(e,p))}),e.addOnCommittedListener(()=>{this.Zn[c]=u.keys()}),A.waitFor(f).next(()=>u)})}lookupMutationBatch(e,t){return en(e).get(t).next(r=>r?(G(r.userId===this.userId,48,"Unexpected user for mutation batch",{userId:r.userId,batchId:t}),Qn(this.serializer,r)):null)}Xn(e,t){return this.Zn[t]?A.resolve(this.Zn[t]):this.lookupMutationBatch(e,t).next(r=>{if(r){const s=r.keys();return this.Zn[t]=s,s}return null})}getNextMutationBatchAfterBatchId(e,t){const r=t+1,s=IDBKeyRange.lowerBound([this.userId,r]);let i=null;return en(e).X({index:Jn,range:s},(o,c,u)=>{c.userId===this.userId&&(G(c.batchId>=r,47524,{er:r}),i=Qn(this.serializer,c)),u.done()}).next(()=>i)}getHighestUnacknowledgedBatchId(e){const t=IDBKeyRange.upperBound([this.userId,Number.POSITIVE_INFINITY]);let r=lr;return en(e).X({index:Jn,range:t,reverse:!0},(s,i,o)=>{r=i.batchId,o.done()}).next(()=>r)}getAllMutationBatches(e){const t=IDBKeyRange.bound([this.userId,lr],[this.userId,Number.POSITIVE_INFINITY]);return en(e).j(Jn,t).next(r=>r.map(s=>Qn(this.serializer,s)))}getAllMutationBatchesAffectingDocumentKey(e,t){const r=ea(this.userId,t.path),s=IDBKeyRange.lowerBound(r),i=[];return $r(e).X({range:s},(o,c,u)=>{const[h,f,m]=o,p=At(f);if(h===this.userId&&t.path.isEqual(p))return en(e).get(m).next(w=>{if(!w)throw q(61480,{tr:o,batchId:m});G(w.userId===this.userId,10503,"Unexpected user for mutation batch",{userId:w.userId,batchId:m}),i.push(Qn(this.serializer,w))});u.done()}).next(()=>i)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new ue(Q);const s=[];return t.forEach(i=>{const o=ea(this.userId,i.path),c=IDBKeyRange.lowerBound(o),u=$r(e).X({range:c},(h,f,m)=>{const[p,w,C]=h,D=At(w);p===this.userId&&i.path.isEqual(D)?r=r.add(C):m.done()});s.push(u)}),A.waitFor(s).next(()=>this.nr(e,r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,s=r.length+1,i=ea(this.userId,r),o=IDBKeyRange.lowerBound(i);let c=new ue(Q);return $r(e).X({range:o},(u,h,f)=>{const[m,p,w]=u,C=At(p);m===this.userId&&r.isPrefixOf(C)?C.length===s&&(c=c.add(w)):f.done()}).next(()=>this.nr(e,c))}nr(e,t){const r=[],s=[];return t.forEach(i=>{s.push(en(e).get(i).next(o=>{if(o===null)throw q(35274,{batchId:i});G(o.userId===this.userId,9748,"Unexpected user for mutation batch",{userId:o.userId,batchId:i}),r.push(Qn(this.serializer,o))}))}),A.waitFor(s).next(()=>r)}removeMutationBatch(e,t){return $_(e.ce,this.userId,t).next(r=>(e.addOnCommittedListener(()=>{this.rr(t.batchId)}),A.forEach(r,s=>this.referenceDelegate.markPotentiallyOrphaned(e,s))))}rr(e){delete this.Zn[e]}performConsistencyCheck(e){return this.checkEmpty(e).next(t=>{if(!t)return A.resolve();const r=IDBKeyRange.lowerBound(function(o){return[o]}(this.userId)),s=[];return $r(e).X({range:r},(i,o,c)=>{if(i[0]===this.userId){const u=At(i[1]);s.push(u)}else c.done()}).next(()=>{G(s.length===0,56720,{ir:s.map(i=>i.canonicalString())})})})}containsKey(e,t){return q_(e,this.userId,t)}sr(e){return z_(e).get(this.userId).next(t=>t||{userId:this.userId,lastAcknowledgedBatchId:lr,lastStreamToken:""})}}function q_(n,e,t){const r=ea(e,t.path),s=r[1],i=IDBKeyRange.lowerBound(r);let o=!1;return $r(n).X({range:i,Z:!0},(c,u,h)=>{const[f,m,p]=c;f===e&&m===s&&(o=!0),h.done()}).next(()=>o)}function en(n){return Se(n,ft)}function $r(n){return Se(n,ms)}function z_(n){return Se(n,Bi)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wr{constructor(e){this._r=e}next(){return this._r+=2,this._r}static ar(){return new wr(0)}static ur(){return new wr(-1)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class A0{constructor(e,t){this.referenceDelegate=e,this.serializer=t}allocateTargetId(e){return this.cr(e).next(t=>{const r=new wr(t.highestTargetId);return t.highestTargetId=r.next(),this.lr(e,t).next(()=>t.highestTargetId)})}getLastRemoteSnapshotVersion(e){return this.cr(e).next(t=>K.fromTimestamp(new ae(t.lastRemoteSnapshotVersion.seconds,t.lastRemoteSnapshotVersion.nanoseconds)))}getHighestSequenceNumber(e){return this.cr(e).next(t=>t.highestListenSequenceNumber)}setTargetsMetadata(e,t,r){return this.cr(e).next(s=>(s.highestListenSequenceNumber=t,r&&(s.lastRemoteSnapshotVersion=r.toTimestamp()),t>s.highestListenSequenceNumber&&(s.highestListenSequenceNumber=t),this.lr(e,s)))}addTargetData(e,t){return this.hr(e,t).next(()=>this.cr(e).next(r=>(r.targetCount+=1,this.Pr(t,r),this.lr(e,r))))}updateTargetData(e,t){return this.hr(e,t)}removeTargetData(e,t){return this.removeMatchingKeysForTargetId(e,t.targetId).next(()=>Fr(e).delete(t.targetId)).next(()=>this.cr(e)).next(r=>(G(r.targetCount>0,8065),r.targetCount-=1,this.lr(e,r)))}removeTargets(e,t,r){let s=0;const i=[];return Fr(e).X((o,c)=>{const u=yi(c);u.sequenceNumber<=t&&r.get(u.targetId)===null&&(s++,i.push(this.removeTargetData(e,u)))}).next(()=>A.waitFor(i)).next(()=>s)}forEachTarget(e,t){return Fr(e).X((r,s)=>{const i=yi(s);t(i)})}cr(e){return _m(e).get(Ta).next(t=>(G(t!==null,2888),t))}lr(e,t){return _m(e).put(Ta,t)}hr(e,t){return Fr(e).put(F_(this.serializer,t))}Pr(e,t){let r=!1;return e.targetId>t.highestTargetId&&(t.highestTargetId=e.targetId,r=!0),e.sequenceNumber>t.highestListenSequenceNumber&&(t.highestListenSequenceNumber=e.sequenceNumber,r=!0),r}getTargetCount(e){return this.cr(e).next(t=>t.targetCount)}getTargetData(e,t){const r=yr(t),s=IDBKeyRange.bound([r,Number.NEGATIVE_INFINITY],[r,Number.POSITIVE_INFINITY]);let i=null;return Fr(e).X({range:s,index:xg},(o,c,u)=>{const h=yi(c);lo(t,h.target)&&(i=h,u.done())}).next(()=>i)}addMatchingKeys(e,t,r){const s=[],i=sn(e);return t.forEach(o=>{const c=Ue(o.path);s.push(i.put({targetId:r,path:c})),s.push(this.referenceDelegate.addReference(e,r,o))}),A.waitFor(s)}removeMatchingKeys(e,t,r){const s=sn(e);return A.forEach(t,i=>{const o=Ue(i.path);return A.waitFor([s.delete([r,o]),this.referenceDelegate.removeReference(e,r,i)])})}removeMatchingKeysForTargetId(e,t){const r=sn(e),s=IDBKeyRange.bound([t],[t+1],!1,!0);return r.delete(s)}getMatchingKeysForTargetId(e,t){const r=IDBKeyRange.bound([t],[t+1],!1,!0),s=sn(e);let i=X();return s.X({range:r,Z:!0},(o,c,u)=>{const h=At(o[1]),f=new $(h);i=i.add(f)}).next(()=>i)}containsKey(e,t){const r=Ue(t.path),s=IDBKeyRange.bound([r],[Tg(r)],!1,!0);let i=0;return sn(e).X({index:Pl,Z:!0,range:s},([o,c],u,h)=>{o!==0&&(i++,h.done())}).next(()=>i>0)}Et(e,t){return Fr(e).get(t).next(r=>r?yi(r):null)}}function Fr(n){return Se(n,ps)}function _m(n){return Se(n,hr)}function sn(n){return Se(n,gs)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ym="LruGarbageCollector",W_=1048576;function vm([n,e],[t,r]){const s=Q(n,t);return s===0?Q(e,r):s}class S0{constructor(e){this.Tr=e,this.buffer=new ue(vm),this.Ir=0}dr(){return++this.Ir}Er(e){const t=[e,this.dr()];if(this.buffer.size<this.Tr)this.buffer=this.buffer.add(t);else{const r=this.buffer.last();vm(t,r)<0&&(this.buffer=this.buffer.delete(r).add(t))}}get maxValue(){return this.buffer.last()[0]}}class H_{constructor(e,t,r){this.garbageCollector=e,this.asyncQueue=t,this.localStore=r,this.Ar=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Rr(6e4)}stop(){this.Ar&&(this.Ar.cancel(),this.Ar=null)}get started(){return this.Ar!==null}Rr(e){x(ym,`Garbage collection scheduled in ${e}ms`),this.Ar=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.Ar=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){xn(t)?x(ym,"Ignoring IndexedDB error during garbage collection: ",t):await On(t)}await this.Rr(3e5)})}}class P0{constructor(e,t){this.Vr=e,this.params=t}calculateTargetCount(e,t){return this.Vr.mr(e).next(r=>Math.floor(t/100*r))}nthSequenceNumber(e,t){if(t===0)return A.resolve(Ye.ue);const r=new S0(t);return this.Vr.forEachTarget(e,s=>r.Er(s.sequenceNumber)).next(()=>this.Vr.gr(e,s=>r.Er(s))).next(()=>r.maxValue)}removeTargets(e,t,r){return this.Vr.removeTargets(e,t,r)}removeOrphanedDocuments(e,t){return this.Vr.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(x("LruGarbageCollector","Garbage collection skipped; disabled"),A.resolve(gm)):this.getCacheSize(e).next(r=>r<this.params.cacheSizeCollectionThreshold?(x("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),gm):this.pr(e,t))}getCacheSize(e){return this.Vr.getCacheSize(e)}pr(e,t){let r,s,i,o,c,u,h;const f=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(m=>(m>this.params.maximumSequenceNumbersToCollect?(x("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${m}`),s=this.params.maximumSequenceNumbersToCollect):s=m,o=Date.now(),this.nthSequenceNumber(e,s))).next(m=>(r=m,c=Date.now(),this.removeTargets(e,r,t))).next(m=>(i=m,u=Date.now(),this.removeOrphanedDocuments(e,r))).next(m=>(h=Date.now(),Lr()<=ne.DEBUG&&x("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${o-f}ms
	Determined least recently used ${s} in `+(c-o)+`ms
	Removed ${i} targets in `+(u-c)+`ms
	Removed ${m} documents in `+(h-u)+`ms
Total Duration: ${h-f}ms`),A.resolve({didRun:!0,sequenceNumbersCollected:s,targetsRemoved:i,documentsRemoved:m})))}}function G_(n,e){return new P0(n,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class R0{constructor(e,t){this.db=e,this.garbageCollector=G_(this,t)}mr(e){const t=this.yr(e);return this.db.getTargetCache().getTargetCount(e).next(r=>t.next(s=>r+s))}yr(e){let t=0;return this.gr(e,r=>{t++}).next(()=>t)}forEachTarget(e,t){return this.db.getTargetCache().forEachTarget(e,t)}gr(e,t){return this.wr(e,(r,s)=>t(s))}addReference(e,t,r){return Ko(e,r)}removeReference(e,t,r){return Ko(e,r)}removeTargets(e,t,r){return this.db.getTargetCache().removeTargets(e,t,r)}markPotentiallyOrphaned(e,t){return Ko(e,t)}Sr(e,t){return function(s,i){let o=!1;return z_(s).ee(c=>q_(s,c,i).next(u=>(u&&(o=!0),A.resolve(!u)))).next(()=>o)}(e,t)}removeOrphanedDocuments(e,t){const r=this.db.getRemoteDocumentCache().newChangeBuffer(),s=[];let i=0;return this.wr(e,(o,c)=>{if(c<=t){const u=this.Sr(e,o).next(h=>{if(!h)return i++,r.getEntry(e,o).next(()=>(r.removeEntry(o,K.min()),sn(e).delete(function(m){return[0,Ue(m.path)]}(o))))});s.push(u)}}).next(()=>A.waitFor(s)).next(()=>r.apply(e)).next(()=>i)}removeTarget(e,t){const r=t.withSequenceNumber(e.currentSequenceNumber);return this.db.getTargetCache().updateTargetData(e,r)}updateLimboDocument(e,t){return Ko(e,t)}wr(e,t){const r=sn(e);let s,i=Ye.ue;return r.X({index:Pl},([o,c],{path:u,sequenceNumber:h})=>{o===0?(i!==Ye.ue&&t(new $(At(s)),i),i=h,s=u):i=Ye.ue}).next(()=>{i!==Ye.ue&&t(new $(At(s)),i)})}getCacheSize(e){return this.db.getRemoteDocumentCache().getSize(e)}}function Ko(n,e){return sn(n).put(function(r,s){return{targetId:0,path:Ue(r.path),sequenceNumber:s}}(e,n.currentSequenceNumber))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class K_{constructor(){this.changes=new Gt(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,Ie.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const r=this.changes.get(t);return r!==void 0?A.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class C0{constructor(e){this.serializer=e}setIndexManager(e){this.indexManager=e}addEntry(e,t,r){return qn(e).put(r)}removeEntry(e,t,r){return qn(e).delete(function(i,o){const c=i.path.toArray();return[c.slice(0,c.length-2),c[c.length-2],Ca(o),c[c.length-1]]}(t,r))}updateMetadata(e,t){return this.getMetadata(e).next(r=>(r.byteSize+=t,this.br(e,r)))}getEntry(e,t){let r=Ie.newInvalidDocument(t);return qn(e).X({index:ta,range:IDBKeyRange.only(di(t))},(s,i)=>{r=this.Dr(t,i)}).next(()=>r)}vr(e,t){let r={size:0,document:Ie.newInvalidDocument(t)};return qn(e).X({index:ta,range:IDBKeyRange.only(di(t))},(s,i)=>{r={document:this.Dr(t,i),size:ka(i)}}).next(()=>r)}getEntries(e,t){let r=tt();return this.Cr(e,t,(s,i)=>{const o=this.Dr(s,i);r=r.insert(s,o)}).next(()=>r)}Fr(e,t){let r=tt(),s=new fe($.comparator);return this.Cr(e,t,(i,o)=>{const c=this.Dr(i,o);r=r.insert(i,c),s=s.insert(i,ka(o))}).next(()=>({documents:r,Mr:s}))}Cr(e,t,r){if(t.isEmpty())return A.resolve();let s=new ue(Em);t.forEach(u=>s=s.add(u));const i=IDBKeyRange.bound(di(s.first()),di(s.last())),o=s.getIterator();let c=o.getNext();return qn(e).X({index:ta,range:i},(u,h,f)=>{const m=$.fromSegments([...h.prefixPath,h.collectionGroup,h.documentId]);for(;c&&Em(c,m)<0;)r(c,null),c=o.getNext();c&&c.isEqual(m)&&(r(c,h),c=o.hasNext()?o.getNext():null),c?f.G(di(c)):f.done()}).next(()=>{for(;c;)r(c,null),c=o.hasNext()?o.getNext():null})}getDocumentsMatchingQuery(e,t,r,s,i){const o=t.path,c=[o.popLast().toArray(),o.lastSegment(),Ca(r.readTime),r.documentKey.path.isEmpty()?"":r.documentKey.path.lastSegment()],u=[o.popLast().toArray(),o.lastSegment(),[Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER],""];return qn(e).j(IDBKeyRange.bound(c,u,!0)).next(h=>{i==null||i.incrementDocumentReadCount(h.length);let f=tt();for(const m of h){const p=this.Dr($.fromSegments(m.prefixPath.concat(m.collectionGroup,m.documentId)),m);p.isFoundDocument()&&(ho(t,p)||s.has(p.key))&&(f=f.insert(p.key,p))}return f})}getAllFromCollectionGroup(e,t,r,s){let i=tt();const o=wm(t,r),c=wm(t,st.max());return qn(e).X({index:Og,range:IDBKeyRange.bound(o,c,!0)},(u,h,f)=>{const m=this.Dr($.fromSegments(h.prefixPath.concat(h.collectionGroup,h.documentId)),h);i=i.insert(m.key,m),i.size===s&&f.done()}).next(()=>i)}newChangeBuffer(e){return new D0(this,!!e&&e.trackRemovals)}getSize(e){return this.getMetadata(e).next(t=>t.byteSize)}getMetadata(e){return Im(e).get(Uu).next(t=>(G(!!t,20021),t))}br(e,t){return Im(e).put(Uu,t)}Dr(e,t){if(t){const r=p0(this.serializer,t);if(!(r.isNoDocument()&&r.version.isEqual(K.min())))return r}return Ie.newInvalidDocument(e)}}function Q_(n){return new C0(n)}class D0 extends K_{constructor(e,t){super(),this.Or=e,this.trackRemovals=t,this.Nr=new Gt(r=>r.toString(),(r,s)=>r.isEqual(s))}applyChanges(e){const t=[];let r=0,s=new ue((i,o)=>Q(i.canonicalString(),o.canonicalString()));return this.changes.forEach((i,o)=>{const c=this.Nr.get(i);if(t.push(this.Or.removeEntry(e,i,c.readTime)),o.isValidDocument()){const u=rm(this.Or.serializer,o);s=s.add(i.path.popLast());const h=ka(u);r+=h-c.size,t.push(this.Or.addEntry(e,i,u))}else if(r-=c.size,this.trackRemovals){const u=rm(this.Or.serializer,o.convertToNoDocument(K.min()));t.push(this.Or.addEntry(e,i,u))}}),s.forEach(i=>{t.push(this.Or.indexManager.addToCollectionParentIndex(e,i))}),t.push(this.Or.updateMetadata(e,r)),A.waitFor(t)}getFromCache(e,t){return this.Or.vr(e,t).next(r=>(this.Nr.set(t,{size:r.size,readTime:r.document.readTime}),r.document))}getAllFromCache(e,t){return this.Or.Fr(e,t).next(({documents:r,Mr:s})=>(s.forEach((i,o)=>{this.Nr.set(i,{size:o,readTime:r.get(i).readTime})}),r))}}function Im(n){return Se(n,ji)}function qn(n){return Se(n,Ea)}function di(n){const e=n.path.toArray();return[e.slice(0,e.length-2),e[e.length-2],e[e.length-1]]}function wm(n,e){const t=e.documentKey.path.toArray();return[n,Ca(e.readTime),t.slice(0,t.length-2),t.length>0?t[t.length-1]:""]}function Em(n,e){const t=n.path.toArray(),r=e.path.toArray();let s=0;for(let i=0;i<t.length-2&&i<r.length-2;++i)if(s=Q(t[i],r[i]),s)return s;return s=Q(t.length,r.length),s||(s=Q(t[t.length-2],r[r.length-2]),s||Q(t[t.length-1],r[r.length-1]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class k0{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Y_{constructor(e,t,r,s){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=s}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next(s=>(r=s,this.remoteDocumentCache.getEntry(e,t))).next(s=>(r!==null&&Ci(r.mutation,s,ct.empty(),ae.now()),s))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.getLocalViewOfDocuments(e,r,X()).next(()=>r))}getLocalViewOfDocuments(e,t,r=X()){const s=St();return this.populateOverlays(e,s,t).next(()=>this.computeViews(e,t,s,r).next(i=>{let o=gi();return i.forEach((c,u)=>{o=o.insert(c,u.overlayedDocument)}),o}))}getOverlayedDocuments(e,t){const r=St();return this.populateOverlays(e,r,t).next(()=>this.computeViews(e,t,r,X()))}populateOverlays(e,t,r){const s=[];return r.forEach(i=>{t.has(i)||s.push(i)}),this.documentOverlayCache.getOverlays(e,s).next(i=>{i.forEach((o,c)=>{t.set(o,c)})})}computeViews(e,t,r,s){let i=tt();const o=Ri(),c=function(){return Ri()}();return t.forEach((u,h)=>{const f=r.get(h.key);s.has(h.key)&&(f===void 0||f.mutation instanceof Nn)?i=i.insert(h.key,h):f!==void 0?(o.set(h.key,f.mutation.getFieldMask()),Ci(f.mutation,h,f.mutation.getFieldMask(),ae.now())):o.set(h.key,ct.empty())}),this.recalculateAndSaveOverlays(e,i).next(u=>(u.forEach((h,f)=>o.set(h,f)),t.forEach((h,f)=>{var m;return c.set(h,new k0(f,(m=o.get(h))!==null&&m!==void 0?m:null))}),c))}recalculateAndSaveOverlays(e,t){const r=Ri();let s=new fe((o,c)=>o-c),i=X();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(o=>{for(const c of o)c.keys().forEach(u=>{const h=t.get(u);if(h===null)return;let f=r.get(u)||ct.empty();f=c.applyToLocalView(h,f),r.set(u,f);const m=(s.get(c.batchId)||X()).add(u);s=s.insert(c.batchId,m)})}).next(()=>{const o=[],c=s.getReverseIterator();for(;c.hasNext();){const u=c.getNext(),h=u.key,f=u.value,m=d_();f.forEach(p=>{if(!i.has(p)){const w=v_(t.get(p),r.get(p));w!==null&&m.set(p,w),i=i.add(p)}}),o.push(this.documentOverlayCache.saveOverlays(e,h,m))}return A.waitFor(o)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,t,r,s){return function(o){return $.isDocumentKey(o.path)&&o.collectionGroup===null&&o.filters.length===0}(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):o_(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,s):this.getDocumentsMatchingCollectionQuery(e,t,r,s)}getNextDocuments(e,t,r,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,s).next(i=>{const o=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,s-i.size):A.resolve(St());let c=fs,u=i;return o.next(h=>A.forEach(h,(f,m)=>(c<m.largestBatchId&&(c=m.largestBatchId),i.get(f)?A.resolve():this.remoteDocumentCache.getEntry(e,f).next(p=>{u=u.insert(f,p)}))).next(()=>this.populateOverlays(e,h,i)).next(()=>this.computeViews(e,u,h,X())).next(f=>({batchId:c,changes:h_(f)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new $(t)).next(r=>{let s=gi();return r.isFoundDocument()&&(s=s.insert(r.key,r)),s})}getDocumentsMatchingCollectionGroupQuery(e,t,r,s){const i=t.collectionGroup;let o=gi();return this.indexManager.getCollectionParents(e,i).next(c=>A.forEach(c,u=>{const h=function(m,p){return new Ms(p,null,m.explicitOrderBy.slice(),m.filters.slice(),m.limit,m.limitType,m.startAt,m.endAt)}(t,u.child(i));return this.getDocumentsMatchingCollectionQuery(e,h,r,s).next(f=>{f.forEach((m,p)=>{o=o.insert(m,p)})})}).next(()=>o))}getDocumentsMatchingCollectionQuery(e,t,r,s){let i;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next(o=>(i=o,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,i,s))).next(o=>{i.forEach((u,h)=>{const f=h.getKey();o.get(f)===null&&(o=o.insert(f,Ie.newInvalidDocument(f)))});let c=gi();return o.forEach((u,h)=>{const f=i.get(u);f!==void 0&&Ci(f.mutation,h,ct.empty(),ae.now()),ho(t,h)&&(c=c.insert(u,h))}),c})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class V0{constructor(e){this.serializer=e,this.Br=new Map,this.Lr=new Map}getBundleMetadata(e,t){return A.resolve(this.Br.get(t))}saveBundleMetadata(e,t){return this.Br.set(t.id,function(s){return{id:s.id,version:s.version,createTime:ze(s.createTime)}}(t)),A.resolve()}getNamedQuery(e,t){return A.resolve(this.Lr.get(t))}saveNamedQuery(e,t){return this.Lr.set(t.name,function(s){return{name:s.name,query:L_(s.bundledQuery),readTime:ze(s.readTime)}}(t)),A.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class O0{constructor(){this.overlays=new fe($.comparator),this.kr=new Map}getOverlay(e,t){return A.resolve(this.overlays.get(t))}getOverlays(e,t){const r=St();return A.forEach(t,s=>this.getOverlay(e,s).next(i=>{i!==null&&r.set(s,i)})).next(()=>r)}saveOverlays(e,t,r){return r.forEach((s,i)=>{this.wt(e,t,i)}),A.resolve()}removeOverlaysForBatchId(e,t,r){const s=this.kr.get(r);return s!==void 0&&(s.forEach(i=>this.overlays=this.overlays.remove(i)),this.kr.delete(r)),A.resolve()}getOverlaysForCollection(e,t,r){const s=St(),i=t.length+1,o=new $(t.child("")),c=this.overlays.getIteratorFrom(o);for(;c.hasNext();){const u=c.getNext().value,h=u.getKey();if(!t.isPrefixOf(h.path))break;h.path.length===i&&u.largestBatchId>r&&s.set(u.getKey(),u)}return A.resolve(s)}getOverlaysForCollectionGroup(e,t,r,s){let i=new fe((h,f)=>h-f);const o=this.overlays.getIterator();for(;o.hasNext();){const h=o.getNext().value;if(h.getKey().getCollectionGroup()===t&&h.largestBatchId>r){let f=i.get(h.largestBatchId);f===null&&(f=St(),i=i.insert(h.largestBatchId,f)),f.set(h.getKey(),h)}}const c=St(),u=i.getIterator();for(;u.hasNext()&&(u.getNext().value.forEach((h,f)=>c.set(h,f)),!(c.size()>=s)););return A.resolve(c)}wt(e,t,r){const s=this.overlays.get(r.key);if(s!==null){const o=this.kr.get(s.largestBatchId).delete(r.key);this.kr.set(s.largestBatchId,o)}this.overlays=this.overlays.insert(r.key,new Bl(t,r));let i=this.kr.get(t);i===void 0&&(i=X(),this.kr.set(t,i)),this.kr.set(t,i.add(r.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class x0{constructor(){this.sessionToken=Ee.EMPTY_BYTE_STRING}getSessionToken(e){return A.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,A.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wl{constructor(){this.qr=new ue(Re.Qr),this.$r=new ue(Re.Ur)}isEmpty(){return this.qr.isEmpty()}addReference(e,t){const r=new Re(e,t);this.qr=this.qr.add(r),this.$r=this.$r.add(r)}Kr(e,t){e.forEach(r=>this.addReference(r,t))}removeReference(e,t){this.Wr(new Re(e,t))}Gr(e,t){e.forEach(r=>this.removeReference(r,t))}zr(e){const t=new $(new se([])),r=new Re(t,e),s=new Re(t,e+1),i=[];return this.$r.forEachInRange([r,s],o=>{this.Wr(o),i.push(o.key)}),i}jr(){this.qr.forEach(e=>this.Wr(e))}Wr(e){this.qr=this.qr.delete(e),this.$r=this.$r.delete(e)}Jr(e){const t=new $(new se([])),r=new Re(t,e),s=new Re(t,e+1);let i=X();return this.$r.forEachInRange([r,s],o=>{i=i.add(o.key)}),i}containsKey(e){const t=new Re(e,0),r=this.qr.firstAfterOrEqual(t);return r!==null&&e.isEqual(r.key)}}class Re{constructor(e,t){this.key=e,this.Hr=t}static Qr(e,t){return $.comparator(e.key,t.key)||Q(e.Hr,t.Hr)}static Ur(e,t){return Q(e.Hr,t.Hr)||$.comparator(e.key,t.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class N0{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.er=1,this.Yr=new ue(Re.Qr)}checkEmpty(e){return A.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,r,s){const i=this.er;this.er++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const o=new Ll(i,t,r,s);this.mutationQueue.push(o);for(const c of s)this.Yr=this.Yr.add(new Re(c.key,i)),this.indexManager.addToCollectionParentIndex(e,c.key.path.popLast());return A.resolve(o)}lookupMutationBatch(e,t){return A.resolve(this.Zr(t))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,s=this.Xr(r),i=s<0?0:s;return A.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return A.resolve(this.mutationQueue.length===0?lr:this.er-1)}getAllMutationBatches(e){return A.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const r=new Re(t,0),s=new Re(t,Number.POSITIVE_INFINITY),i=[];return this.Yr.forEachInRange([r,s],o=>{const c=this.Zr(o.Hr);i.push(c)}),A.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new ue(Q);return t.forEach(s=>{const i=new Re(s,0),o=new Re(s,Number.POSITIVE_INFINITY);this.Yr.forEachInRange([i,o],c=>{r=r.add(c.Hr)})}),A.resolve(this.ei(r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,s=r.length+1;let i=r;$.isDocumentKey(i)||(i=i.child(""));const o=new Re(new $(i),0);let c=new ue(Q);return this.Yr.forEachWhile(u=>{const h=u.key.path;return!!r.isPrefixOf(h)&&(h.length===s&&(c=c.add(u.Hr)),!0)},o),A.resolve(this.ei(c))}ei(e){const t=[];return e.forEach(r=>{const s=this.Zr(r);s!==null&&t.push(s)}),t}removeMutationBatch(e,t){G(this.ti(t.batchId,"removed")===0,55003),this.mutationQueue.shift();let r=this.Yr;return A.forEach(t.mutations,s=>{const i=new Re(s.key,t.batchId);return r=r.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)}).next(()=>{this.Yr=r})}rr(e){}containsKey(e,t){const r=new Re(t,0),s=this.Yr.firstAfterOrEqual(r);return A.resolve(t.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,A.resolve()}ti(e,t){return this.Xr(e)}Xr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Zr(e){const t=this.Xr(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class M0{constructor(e){this.ni=e,this.docs=function(){return new fe($.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const r=t.key,s=this.docs.get(r),i=s?s.size:0,o=this.ni(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:o}),this.size+=o-i,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const r=this.docs.get(t);return A.resolve(r?r.document.mutableCopy():Ie.newInvalidDocument(t))}getEntries(e,t){let r=tt();return t.forEach(s=>{const i=this.docs.get(s);r=r.insert(s,i?i.document.mutableCopy():Ie.newInvalidDocument(s))}),A.resolve(r)}getDocumentsMatchingQuery(e,t,r,s){let i=tt();const o=t.path,c=new $(o.child("__id-9223372036854775808__")),u=this.docs.getIteratorFrom(c);for(;u.hasNext();){const{key:h,value:{document:f}}=u.getNext();if(!o.isPrefixOf(h.path))break;h.path.length>o.length+1||Al(Pg(f),r)<=0||(s.has(f.key)||ho(t,f))&&(i=i.insert(f.key,f.mutableCopy()))}return A.resolve(i)}getAllFromCollectionGroup(e,t,r,s){q(9500)}ri(e,t){return A.forEach(this.docs,r=>t(r))}newChangeBuffer(e){return new F0(this)}getSize(e){return A.resolve(this.size)}}class F0 extends K_{constructor(e){super(),this.Or=e}applyChanges(e){const t=[];return this.changes.forEach((r,s)=>{s.isValidDocument()?t.push(this.Or.addEntry(e,s)):this.Or.removeEntry(r)}),A.waitFor(t)}getFromCache(e,t){return this.Or.getEntry(e,t)}getAllFromCache(e,t){return this.Or.getEntries(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class L0{constructor(e){this.persistence=e,this.ii=new Gt(t=>yr(t),lo),this.lastRemoteSnapshotVersion=K.min(),this.highestTargetId=0,this.si=0,this.oi=new Wl,this.targetCount=0,this._i=wr.ar()}forEachTarget(e,t){return this.ii.forEach((r,s)=>t(s)),A.resolve()}getLastRemoteSnapshotVersion(e){return A.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return A.resolve(this.si)}allocateTargetId(e){return this.highestTargetId=this._i.next(),A.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.si&&(this.si=t),A.resolve()}hr(e){this.ii.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this._i=new wr(t),this.highestTargetId=t),e.sequenceNumber>this.si&&(this.si=e.sequenceNumber)}addTargetData(e,t){return this.hr(t),this.targetCount+=1,A.resolve()}updateTargetData(e,t){return this.hr(t),A.resolve()}removeTargetData(e,t){return this.ii.delete(t.target),this.oi.zr(t.targetId),this.targetCount-=1,A.resolve()}removeTargets(e,t,r){let s=0;const i=[];return this.ii.forEach((o,c)=>{c.sequenceNumber<=t&&r.get(c.targetId)===null&&(this.ii.delete(o),i.push(this.removeMatchingKeysForTargetId(e,c.targetId)),s++)}),A.waitFor(i).next(()=>s)}getTargetCount(e){return A.resolve(this.targetCount)}getTargetData(e,t){const r=this.ii.get(t)||null;return A.resolve(r)}addMatchingKeys(e,t,r){return this.oi.Kr(t,r),A.resolve()}removeMatchingKeys(e,t,r){this.oi.Gr(t,r);const s=this.persistence.referenceDelegate,i=[];return s&&t.forEach(o=>{i.push(s.markPotentiallyOrphaned(e,o))}),A.waitFor(i)}removeMatchingKeysForTargetId(e,t){return this.oi.zr(t),A.resolve()}getMatchingKeysForTargetId(e,t){const r=this.oi.Jr(t);return A.resolve(r)}containsKey(e,t){return A.resolve(this.oi.containsKey(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hl{constructor(e,t){this.ai={},this.overlays={},this.ui=new Ye(0),this.ci=!1,this.ci=!0,this.li=new x0,this.referenceDelegate=e(this),this.hi=new L0(this),this.indexManager=new T0,this.remoteDocumentCache=function(s){return new M0(s)}(r=>this.referenceDelegate.Pi(r)),this.serializer=new M_(t),this.Ti=new V0(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.ci=!1,Promise.resolve()}get started(){return this.ci}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new O0,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this.ai[e.toKey()];return r||(r=new N0(t,this.referenceDelegate),this.ai[e.toKey()]=r),r}getGlobalsCache(){return this.li}getTargetCache(){return this.hi}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Ti}runTransaction(e,t,r){x("MemoryPersistence","Starting transaction:",e);const s=new U0(this.ui.next());return this.referenceDelegate.Ii(),r(s).next(i=>this.referenceDelegate.di(s).next(()=>i)).toPromise().then(i=>(s.raiseOnCommittedEvent(),i))}Ei(e,t){return A.or(Object.values(this.ai).map(r=>()=>r.containsKey(e,t)))}}class U0 extends Cg{constructor(e){super(),this.currentSequenceNumber=e}}class lc{constructor(e){this.persistence=e,this.Ai=new Wl,this.Ri=null}static Vi(e){return new lc(e)}get mi(){if(this.Ri)return this.Ri;throw q(60996)}addReference(e,t,r){return this.Ai.addReference(r,t),this.mi.delete(r.toString()),A.resolve()}removeReference(e,t,r){return this.Ai.removeReference(r,t),this.mi.add(r.toString()),A.resolve()}markPotentiallyOrphaned(e,t){return this.mi.add(t.toString()),A.resolve()}removeTarget(e,t){this.Ai.zr(t.targetId).forEach(s=>this.mi.add(s.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next(s=>{s.forEach(i=>this.mi.add(i.toString()))}).next(()=>r.removeTargetData(e,t))}Ii(){this.Ri=new Set}di(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return A.forEach(this.mi,r=>{const s=$.fromPath(r);return this.fi(e,s).next(i=>{i||t.removeEntry(s,K.min())})}).next(()=>(this.Ri=null,t.apply(e)))}updateLimboDocument(e,t){return this.fi(e,t).next(r=>{r?this.mi.delete(t.toString()):this.mi.add(t.toString())})}Pi(e){return 0}fi(e,t){return A.or([()=>A.resolve(this.Ai.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Ei(e,t)])}}class Va{constructor(e,t){this.persistence=e,this.gi=new Gt(r=>Ue(r.path),(r,s)=>r.isEqual(s)),this.garbageCollector=G_(this,t)}static Vi(e,t){return new Va(e,t)}Ii(){}di(e){return A.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}mr(e){const t=this.yr(e);return this.persistence.getTargetCache().getTargetCount(e).next(r=>t.next(s=>r+s))}yr(e){let t=0;return this.gr(e,r=>{t++}).next(()=>t)}gr(e,t){return A.forEach(this.gi,(r,s)=>this.Sr(e,r,s).next(i=>i?A.resolve():t(s)))}removeTargets(e,t,r){return this.persistence.getTargetCache().removeTargets(e,t,r)}removeOrphanedDocuments(e,t){let r=0;const s=this.persistence.getRemoteDocumentCache(),i=s.newChangeBuffer();return s.ri(e,o=>this.Sr(e,o,t).next(c=>{c||(r++,i.removeEntry(o,K.min()))})).next(()=>i.apply(e)).next(()=>r)}markPotentiallyOrphaned(e,t){return this.gi.set(t,e.currentSequenceNumber),A.resolve()}removeTarget(e,t){const r=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,r)}addReference(e,t,r){return this.gi.set(r,e.currentSequenceNumber),A.resolve()}removeReference(e,t,r){return this.gi.set(r,e.currentSequenceNumber),A.resolve()}updateLimboDocument(e,t){return this.gi.set(t,e.currentSequenceNumber),A.resolve()}Pi(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=ra(e.data.value)),t}Sr(e,t,r){return A.or([()=>this.persistence.Ei(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const s=this.gi.get(t);return A.resolve(s!==void 0&&s>r)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class B0{constructor(e){this.serializer=e}q(e,t,r,s){const i=new Xa("createOrUpgrade",t);r<1&&s>=1&&(function(u){u.createObjectStore(uo)}(e),function(u){u.createObjectStore(Bi,{keyPath:nA}),u.createObjectStore(ft,{keyPath:Of,autoIncrement:!0}).createIndex(Jn,xf,{unique:!0}),u.createObjectStore(ms)}(e),Tm(e),function(u){u.createObjectStore(Gn)}(e));let o=A.resolve();return r<3&&s>=3&&(r!==0&&(function(u){u.deleteObjectStore(gs),u.deleteObjectStore(ps),u.deleteObjectStore(hr)}(e),Tm(e)),o=o.next(()=>function(u){const h=u.store(hr),f={highestTargetId:0,highestListenSequenceNumber:0,lastRemoteSnapshotVersion:K.min().toTimestamp(),targetCount:0};return h.put(Ta,f)}(i))),r<4&&s>=4&&(r!==0&&(o=o.next(()=>function(u,h){return h.store(ft).j().next(m=>{u.deleteObjectStore(ft),u.createObjectStore(ft,{keyPath:Of,autoIncrement:!0}).createIndex(Jn,xf,{unique:!0});const p=h.store(ft),w=m.map(C=>p.put(C));return A.waitFor(w)})}(e,i))),o=o.next(()=>{(function(u){u.createObjectStore(_s,{keyPath:hA})})(e)})),r<5&&s>=5&&(o=o.next(()=>this.pi(i))),r<6&&s>=6&&(o=o.next(()=>(function(u){u.createObjectStore(ji)}(e),this.yi(i)))),r<7&&s>=7&&(o=o.next(()=>this.wi(i))),r<8&&s>=8&&(o=o.next(()=>this.Si(e,i))),r<9&&s>=9&&(o=o.next(()=>{(function(u){u.objectStoreNames.contains("remoteDocumentChanges")&&u.deleteObjectStore("remoteDocumentChanges")})(e)})),r<10&&s>=10&&(o=o.next(()=>this.bi(i))),r<11&&s>=11&&(o=o.next(()=>{(function(u){u.createObjectStore(Za,{keyPath:dA})})(e),function(u){u.createObjectStore(ec,{keyPath:fA})}(e)})),r<12&&s>=12&&(o=o.next(()=>{(function(u){const h=u.createObjectStore(tc,{keyPath:IA});h.createIndex(ju,wA,{unique:!1}),h.createIndex(Fg,EA,{unique:!1})})(e)})),r<13&&s>=13&&(o=o.next(()=>function(u){const h=u.createObjectStore(Ea,{keyPath:sA});h.createIndex(ta,iA),h.createIndex(Og,oA)}(e)).next(()=>this.Di(e,i)).next(()=>e.deleteObjectStore(Gn))),r<14&&s>=14&&(o=o.next(()=>this.Ci(e,i))),r<15&&s>=15&&(o=o.next(()=>function(u){u.createObjectStore(Rl,{keyPath:mA,autoIncrement:!0}).createIndex(Bu,pA,{unique:!1}),u.createObjectStore(bi,{keyPath:gA}).createIndex(Ng,_A,{unique:!1}),u.createObjectStore(Ai,{keyPath:yA}).createIndex(Mg,vA,{unique:!1})}(e))),r<16&&s>=16&&(o=o.next(()=>{t.objectStore(bi).clear()}).next(()=>{t.objectStore(Ai).clear()})),r<17&&s>=17&&(o=o.next(()=>{(function(u){u.createObjectStore(Cl,{keyPath:TA})})(e)})),r<18&&s>=18&&hg()&&(o=o.next(()=>{t.objectStore(bi).clear()}).next(()=>{t.objectStore(Ai).clear()})),o}yi(e){let t=0;return e.store(Gn).X((r,s)=>{t+=ka(s)}).next(()=>{const r={byteSize:t};return e.store(ji).put(Uu,r)})}pi(e){const t=e.store(Bi),r=e.store(ft);return t.j().next(s=>A.forEach(s,i=>{const o=IDBKeyRange.bound([i.userId,lr],[i.userId,i.lastAcknowledgedBatchId]);return r.j(Jn,o).next(c=>A.forEach(c,u=>{G(u.userId===i.userId,18650,"Cannot process batch from unexpected user",{batchId:u.batchId});const h=Qn(this.serializer,u);return $_(e,i.userId,h).next(()=>{})}))}))}wi(e){const t=e.store(gs),r=e.store(Gn);return e.store(hr).get(Ta).next(s=>{const i=[];return r.X((o,c)=>{const u=new se(o),h=function(m){return[0,Ue(m)]}(u);i.push(t.get(h).next(f=>f?A.resolve():(m=>t.put({targetId:0,path:Ue(m),sequenceNumber:s.highestListenSequenceNumber}))(u)))}).next(()=>A.waitFor(i))})}Si(e,t){e.createObjectStore($i,{keyPath:lA});const r=t.store($i),s=new zl,i=o=>{if(s.add(o)){const c=o.lastSegment(),u=o.popLast();return r.put({collectionId:c,parent:Ue(u)})}};return t.store(Gn).X({Z:!0},(o,c)=>{const u=new se(o);return i(u.popLast())}).next(()=>t.store(ms).X({Z:!0},([o,c,u],h)=>{const f=At(c);return i(f.popLast())}))}bi(e){const t=e.store(ps);return t.X((r,s)=>{const i=yi(s),o=F_(this.serializer,i);return t.put(o)})}Di(e,t){const r=t.store(Gn),s=[];return r.X((i,o)=>{const c=t.store(Ea),u=function(m){return m.document?new $(se.fromString(m.document.name).popFirst(5)):m.noDocument?$.fromSegments(m.noDocument.path):m.unknownDocument?$.fromSegments(m.unknownDocument.path):q(36783)}(o).path.toArray(),h={prefixPath:u.slice(0,u.length-2),collectionGroup:u[u.length-2],documentId:u[u.length-1],readTime:o.readTime||[0,0],unknownDocument:o.unknownDocument,noDocument:o.noDocument,document:o.document,hasCommittedMutations:!!o.hasCommittedMutations};s.push(c.put(h))}).next(()=>A.waitFor(s))}Ci(e,t){const r=t.store(ft),s=Q_(this.serializer),i=new Hl(lc.Vi,this.serializer.gt);return r.j().next(o=>{const c=new Map;return o.forEach(u=>{var h;let f=(h=c.get(u.userId))!==null&&h!==void 0?h:X();Qn(this.serializer,u).keys().forEach(m=>f=f.add(m)),c.set(u.userId,f)}),A.forEach(c,(u,h)=>{const f=new Ce(h),m=cc.yt(this.serializer,f),p=i.getIndexManager(f),w=uc.yt(f,this.serializer,p,i.referenceDelegate);return new Y_(s,w,m,p).recalculateAndSaveOverlaysForDocumentKeys(new $u(t,Ye.ue),u).next()})})}}function Tm(n){n.createObjectStore(gs,{keyPath:cA}).createIndex(Pl,uA,{unique:!0}),n.createObjectStore(ps,{keyPath:"targetId"}).createIndex(xg,aA,{unique:!0}),n.createObjectStore(hr)}const tn="IndexedDbPersistence",ru=18e5,su=5e3,iu="Failed to obtain exclusive access to the persistence layer. To allow shared access, multi-tab synchronization has to be enabled in all tabs. If you are using `experimentalForceOwningTab:true`, make sure that only one tab has persistence enabled at any given time.",j0="main";class Gl{constructor(e,t,r,s,i,o,c,u,h,f,m=18){if(this.allowTabSynchronization=e,this.persistenceKey=t,this.clientId=r,this.Fi=i,this.window=o,this.document=c,this.Mi=h,this.xi=f,this.Oi=m,this.ui=null,this.ci=!1,this.isPrimary=!1,this.networkEnabled=!0,this.Ni=null,this.inForeground=!1,this.Bi=null,this.Li=null,this.ki=Number.NEGATIVE_INFINITY,this.qi=p=>Promise.resolve(),!Gl.C())throw new M(V.UNIMPLEMENTED,"This platform is either missing IndexedDB or is known to have an incomplete implementation. Offline persistence has been disabled.");this.referenceDelegate=new R0(this,s),this.Qi=t+j0,this.serializer=new M_(u),this.$i=new An(this.Qi,this.Oi,new B0(this.serializer)),this.li=new _0,this.hi=new A0(this.referenceDelegate,this.serializer),this.remoteDocumentCache=Q_(this.serializer),this.Ti=new g0,this.window&&this.window.localStorage?this.Ui=this.window.localStorage:(this.Ui=null,f===!1&&we(tn,"LocalStorage is unavailable. As a result, persistence may not work reliably. In particular enablePersistence() could fail immediately after refreshing the page."))}start(){return this.Ki().then(()=>{if(!this.isPrimary&&!this.allowTabSynchronization)throw new M(V.FAILED_PRECONDITION,iu);return this.Wi(),this.Gi(),this.zi(),this.runTransaction("getHighestListenSequenceNumber","readonly",e=>this.hi.getHighestSequenceNumber(e))}).then(e=>{this.ui=new Ye(e,this.Mi)}).then(()=>{this.ci=!0}).catch(e=>(this.$i&&this.$i.close(),Promise.reject(e)))}ji(e){return this.qi=async t=>{if(this.started)return e(t)},e(this.isPrimary)}setDatabaseDeletedListener(e){this.$i.setDatabaseDeletedListener(e)}setNetworkEnabled(e){this.networkEnabled!==e&&(this.networkEnabled=e,this.Fi.enqueueAndForget(async()=>{this.started&&await this.Ki()}))}Ki(){return this.runTransaction("updateClientMetadataAndTryBecomePrimary","readwrite",e=>Qo(e).put({clientId:this.clientId,updateTimeMs:Date.now(),networkEnabled:this.networkEnabled,inForeground:this.inForeground}).next(()=>{if(this.isPrimary)return this.Ji(e).next(t=>{t||(this.isPrimary=!1,this.Fi.enqueueRetryable(()=>this.qi(!1)))})}).next(()=>this.Hi(e)).next(t=>this.isPrimary&&!t?this.Yi(e).next(()=>!1):!!t&&this.Zi(e).next(()=>!0))).catch(e=>{if(xn(e))return x(tn,"Failed to extend owner lease: ",e),this.isPrimary;if(!this.allowTabSynchronization)throw e;return x(tn,"Releasing owner lease after error during lease refresh",e),!1}).then(e=>{this.isPrimary!==e&&this.Fi.enqueueRetryable(()=>this.qi(e)),this.isPrimary=e})}Ji(e){return fi(e).get(Vr).next(t=>A.resolve(this.Xi(t)))}es(e){return Qo(e).delete(this.clientId)}async ts(){if(this.isPrimary&&!this.ns(this.ki,ru)){this.ki=Date.now();const e=await this.runTransaction("maybeGarbageCollectMultiClientState","readwrite-primary",t=>{const r=Se(t,_s);return r.j().next(s=>{const i=this.rs(s,ru),o=s.filter(c=>i.indexOf(c)===-1);return A.forEach(o,c=>r.delete(c.clientId)).next(()=>o)})}).catch(()=>[]);if(this.Ui)for(const t of e)this.Ui.removeItem(this.ss(t.clientId))}}zi(){this.Li=this.Fi.enqueueAfterDelay("client_metadata_refresh",4e3,()=>this.Ki().then(()=>this.ts()).then(()=>this.zi()))}Xi(e){return!!e&&e.ownerId===this.clientId}Hi(e){return this.xi?A.resolve(!0):fi(e).get(Vr).next(t=>{if(t!==null&&this.ns(t.leaseTimestampMs,su)&&!this._s(t.ownerId)){if(this.Xi(t)&&this.networkEnabled)return!0;if(!this.Xi(t)){if(!t.allowTabSynchronization)throw new M(V.FAILED_PRECONDITION,iu);return!1}}return!(!this.networkEnabled||!this.inForeground)||Qo(e).j().next(r=>this.rs(r,su).find(s=>{if(this.clientId!==s.clientId){const i=!this.networkEnabled&&s.networkEnabled,o=!this.inForeground&&s.inForeground,c=this.networkEnabled===s.networkEnabled;if(i||o&&c)return!0}return!1})===void 0)}).next(t=>(this.isPrimary!==t&&x(tn,`Client ${t?"is":"is not"} eligible for a primary lease.`),t))}async shutdown(){this.ci=!1,this.us(),this.Li&&(this.Li.cancel(),this.Li=null),this.cs(),this.ls(),await this.$i.runTransaction("shutdown","readwrite",[uo,_s],e=>{const t=new $u(e,Ye.ue);return this.Yi(t).next(()=>this.es(t))}),this.$i.close(),this.hs()}rs(e,t){return e.filter(r=>this.ns(r.updateTimeMs,t)&&!this._s(r.clientId))}Ps(){return this.runTransaction("getActiveClients","readonly",e=>Qo(e).j().next(t=>this.rs(t,ru).map(r=>r.clientId)))}get started(){return this.ci}getGlobalsCache(){return this.li}getMutationQueue(e,t){return uc.yt(e,this.serializer,t,this.referenceDelegate)}getTargetCache(){return this.hi}getRemoteDocumentCache(){return this.remoteDocumentCache}getIndexManager(e){return new b0(e,this.serializer.gt.databaseId)}getDocumentOverlayCache(e){return cc.yt(this.serializer,e)}getBundleCache(){return this.Ti}runTransaction(e,t,r){x(tn,"Starting transaction:",e);const s=t==="readonly"?"readonly":"readwrite",i=function(u){return u===18?SA:u===17?jg:u===16?AA:u===15?Dl:u===14?Bg:u===13?Ug:u===12?bA:u===11?Lg:void q(60245)}(this.Oi);let o;return this.$i.runTransaction(e,s,i,c=>(o=new $u(c,this.ui?this.ui.next():Ye.ue),t==="readwrite-primary"?this.Ji(o).next(u=>!!u||this.Hi(o)).next(u=>{if(!u)throw we(`Failed to obtain primary lease for action '${e}'.`),this.isPrimary=!1,this.Fi.enqueueRetryable(()=>this.qi(!1)),new M(V.FAILED_PRECONDITION,Rg);return r(o)}).next(u=>this.Zi(o).next(()=>u)):this.Ts(o).next(()=>r(o)))).then(c=>(o.raiseOnCommittedEvent(),c))}Ts(e){return fi(e).get(Vr).next(t=>{if(t!==null&&this.ns(t.leaseTimestampMs,su)&&!this._s(t.ownerId)&&!this.Xi(t)&&!(this.xi||this.allowTabSynchronization&&t.allowTabSynchronization))throw new M(V.FAILED_PRECONDITION,iu)})}Zi(e){const t={ownerId:this.clientId,allowTabSynchronization:this.allowTabSynchronization,leaseTimestampMs:Date.now()};return fi(e).put(Vr,t)}static C(){return An.C()}Yi(e){const t=fi(e);return t.get(Vr).next(r=>this.Xi(r)?(x(tn,"Releasing primary lease."),t.delete(Vr)):A.resolve())}ns(e,t){const r=Date.now();return!(e<r-t)&&(!(e>r)||(we(`Detected an update time that is in the future: ${e} > ${r}`),!1))}Wi(){this.document!==null&&typeof this.document.addEventListener=="function"&&(this.Bi=()=>{this.Fi.enqueueAndForget(()=>(this.inForeground=this.document.visibilityState==="visible",this.Ki()))},this.document.addEventListener("visibilitychange",this.Bi),this.inForeground=this.document.visibilityState==="visible")}cs(){this.Bi&&(this.document.removeEventListener("visibilitychange",this.Bi),this.Bi=null)}Gi(){var e;typeof((e=this.window)===null||e===void 0?void 0:e.addEventListener)=="function"&&(this.Ni=()=>{this.us();const t=/(?:Version|Mobile)\/1[456]/;lg()&&(navigator.appVersion.match(t)||navigator.userAgent.match(t))&&this.Fi.enterRestrictedMode(!0),this.Fi.enqueueAndForget(()=>this.shutdown())},this.window.addEventListener("pagehide",this.Ni))}ls(){this.Ni&&(this.window.removeEventListener("pagehide",this.Ni),this.Ni=null)}_s(e){var t;try{const r=((t=this.Ui)===null||t===void 0?void 0:t.getItem(this.ss(e)))!==null;return x(tn,`Client '${e}' ${r?"is":"is not"} zombied in LocalStorage`),r}catch(r){return we(tn,"Failed to get zombied client id.",r),!1}}us(){if(this.Ui)try{this.Ui.setItem(this.ss(this.clientId),String(Date.now()))}catch(e){we("Failed to set zombie client id.",e)}}hs(){if(this.Ui)try{this.Ui.removeItem(this.ss(this.clientId))}catch{}}ss(e){return`firestore_zombie_${this.persistenceKey}_${e}`}}function fi(n){return Se(n,uo)}function Qo(n){return Se(n,_s)}function X_(n,e){let t=n.projectId;return n.isDefaultDatabase||(t+="."+n.database),"firestore/"+e+"/"+t+"/"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kl{constructor(e,t,r,s){this.targetId=e,this.fromCache=t,this.Is=r,this.ds=s}static Es(e,t){let r=X(),s=X();for(const i of t.docChanges)switch(i.type){case 0:r=r.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new Kl(e,t.fromCache,r,s)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $0{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class J_{constructor(){this.As=!1,this.Rs=!1,this.Vs=100,this.fs=function(){return lg()?8:Dg(va())>0?6:4}()}initialize(e,t){this.gs=e,this.indexManager=t,this.As=!0}getDocumentsMatchingQuery(e,t,r,s){const i={result:null};return this.ps(e,t).next(o=>{i.result=o}).next(()=>{if(!i.result)return this.ys(e,t,s,r).next(o=>{i.result=o})}).next(()=>{if(i.result)return;const o=new $0;return this.ws(e,t,o).next(c=>{if(i.result=c,this.Rs)return this.Ss(e,t,o,c.size)})}).next(()=>i.result)}Ss(e,t,r,s){return r.documentReadCount<this.Vs?(Lr()<=ne.DEBUG&&x("QueryEngine","SDK will not create cache indexes for query:",Ur(t),"since it only creates cache indexes for collection contains","more than or equal to",this.Vs,"documents"),A.resolve()):(Lr()<=ne.DEBUG&&x("QueryEngine","Query:",Ur(t),"scans",r.documentReadCount,"local documents and returns",s,"documents as results."),r.documentReadCount>this.fs*s?(Lr()<=ne.DEBUG&&x("QueryEngine","The SDK decides to create cache indexes for query:",Ur(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,rt(t))):A.resolve())}ps(e,t){if(Gf(t))return A.resolve(null);let r=rt(t);return this.indexManager.getIndexType(e,r).next(s=>s===0?null:(t.limit!==null&&s===1&&(t=Sa(t,null,"F"),r=rt(t)),this.indexManager.getDocumentsMatchingTarget(e,r).next(i=>{const o=X(...i);return this.gs.getDocuments(e,o).next(c=>this.indexManager.getMinOffset(e,r).next(u=>{const h=this.bs(t,c);return this.Ds(t,h,o,u.readTime)?this.ps(e,Sa(t,null,"F")):this.vs(e,h,t,u)}))})))}ys(e,t,r,s){return Gf(t)||s.isEqual(K.min())?A.resolve(null):this.gs.getDocuments(e,r).next(i=>{const o=this.bs(t,i);return this.Ds(t,o,r,s)?A.resolve(null):(Lr()<=ne.DEBUG&&x("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),Ur(t)),this.vs(e,o,t,Sg(s,fs)).next(c=>c))})}bs(e,t){let r=new ue(u_(e));return t.forEach((s,i)=>{ho(e,i)&&(r=r.add(i))}),r}Ds(e,t,r,s){if(e.limit===null)return!1;if(r.size!==t.size)return!0;const i=e.limitType==="F"?t.last():t.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}ws(e,t,r){return Lr()<=ne.DEBUG&&x("QueryEngine","Using full collection scan to execute query:",Ur(t)),this.gs.getDocumentsMatchingQuery(e,t,st.min(),r)}vs(e,t,r,s){return this.gs.getDocumentsMatchingQuery(e,r,s).next(i=>(t.forEach(o=>{i=i.insert(o.key,o)}),i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ql="LocalStore",q0=3e8;class z0{constructor(e,t,r,s){this.persistence=e,this.Cs=t,this.serializer=s,this.Fs=new fe(Q),this.Ms=new Gt(i=>yr(i),lo),this.xs=new Map,this.Os=e.getRemoteDocumentCache(),this.hi=e.getTargetCache(),this.Ti=e.getBundleCache(),this.Ns(r)}Ns(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new Y_(this.Os,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Os.setIndexManager(this.indexManager),this.Cs.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.Fs))}}function Z_(n,e,t,r){return new z0(n,e,t,r)}async function ey(n,e){const t=z(n);return await t.persistence.runTransaction("Handle user change","readonly",r=>{let s;return t.mutationQueue.getAllMutationBatches(r).next(i=>(s=i,t.Ns(e),t.mutationQueue.getAllMutationBatches(r))).next(i=>{const o=[],c=[];let u=X();for(const h of s){o.push(h.batchId);for(const f of h.mutations)u=u.add(f.key)}for(const h of i){c.push(h.batchId);for(const f of h.mutations)u=u.add(f.key)}return t.localDocuments.getDocuments(r,u).next(h=>({Bs:h,removedBatchIds:o,addedBatchIds:c}))})})}function W0(n,e){const t=z(n);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",r=>{const s=e.batch.keys(),i=t.Os.newChangeBuffer({trackRemovals:!0});return function(c,u,h,f){const m=h.batch,p=m.keys();let w=A.resolve();return p.forEach(C=>{w=w.next(()=>f.getEntry(u,C)).next(D=>{const P=h.docVersions.get(C);G(P!==null,48541),D.version.compareTo(P)<0&&(m.applyToRemoteDocument(D,h),D.isValidDocument()&&(D.setReadTime(h.commitVersion),f.addEntry(D)))})}),w.next(()=>c.mutationQueue.removeMutationBatch(u,m))}(t,r,e,i).next(()=>i.apply(r)).next(()=>t.mutationQueue.performConsistencyCheck(r)).next(()=>t.documentOverlayCache.removeOverlaysForBatchId(r,s,e.batch.batchId)).next(()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,function(c){let u=X();for(let h=0;h<c.mutationResults.length;++h)c.mutationResults[h].transformResults.length>0&&(u=u.add(c.batch.mutations[h].key));return u}(e))).next(()=>t.localDocuments.getDocuments(r,s))})}function ty(n){const e=z(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.hi.getLastRemoteSnapshotVersion(t))}function H0(n,e){const t=z(n),r=e.snapshotVersion;let s=t.Fs;return t.persistence.runTransaction("Apply remote event","readwrite-primary",i=>{const o=t.Os.newChangeBuffer({trackRemovals:!0});s=t.Fs;const c=[];e.targetChanges.forEach((f,m)=>{const p=s.get(m);if(!p)return;c.push(t.hi.removeMatchingKeys(i,f.removedDocuments,m).next(()=>t.hi.addMatchingKeys(i,f.addedDocuments,m)));let w=p.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(m)!==null?w=w.withResumeToken(Ee.EMPTY_BYTE_STRING,K.min()).withLastLimboFreeSnapshotVersion(K.min()):f.resumeToken.approximateByteSize()>0&&(w=w.withResumeToken(f.resumeToken,r)),s=s.insert(m,w),function(D,P,F){return D.resumeToken.approximateByteSize()===0||P.snapshotVersion.toMicroseconds()-D.snapshotVersion.toMicroseconds()>=q0?!0:F.addedDocuments.size+F.modifiedDocuments.size+F.removedDocuments.size>0}(p,w,f)&&c.push(t.hi.updateTargetData(i,w))});let u=tt(),h=X();if(e.documentUpdates.forEach(f=>{e.resolvedLimboDocuments.has(f)&&c.push(t.persistence.referenceDelegate.updateLimboDocument(i,f))}),c.push(G0(i,o,e.documentUpdates).next(f=>{u=f.Ls,h=f.ks})),!r.isEqual(K.min())){const f=t.hi.getLastRemoteSnapshotVersion(i).next(m=>t.hi.setTargetsMetadata(i,i.currentSequenceNumber,r));c.push(f)}return A.waitFor(c).next(()=>o.apply(i)).next(()=>t.localDocuments.getLocalViewOfDocuments(i,u,h)).next(()=>u)}).then(i=>(t.Fs=s,i))}function G0(n,e,t){let r=X(),s=X();return t.forEach(i=>r=r.add(i)),e.getEntries(n,r).next(i=>{let o=tt();return t.forEach((c,u)=>{const h=i.get(c);u.isFoundDocument()!==h.isFoundDocument()&&(s=s.add(c)),u.isNoDocument()&&u.version.isEqual(K.min())?(e.removeEntry(c,u.readTime),o=o.insert(c,u)):!h.isValidDocument()||u.version.compareTo(h.version)>0||u.version.compareTo(h.version)===0&&h.hasPendingWrites?(e.addEntry(u),o=o.insert(c,u)):x(Ql,"Ignoring outdated watch update for ",c,". Current version:",h.version," Watch version:",u.version)}),{Ls:o,ks:s}})}function K0(n,e){const t=z(n);return t.persistence.runTransaction("Get next mutation batch","readonly",r=>(e===void 0&&(e=lr),t.mutationQueue.getNextMutationBatchAfterBatchId(r,e)))}function Oa(n,e){const t=z(n);return t.persistence.runTransaction("Allocate target","readwrite",r=>{let s;return t.hi.getTargetData(r,e).next(i=>i?(s=i,A.resolve(s)):t.hi.allocateTargetId(r).next(o=>(s=new Ut(e,o,"TargetPurposeListen",r.currentSequenceNumber),t.hi.addTargetData(r,s).next(()=>s))))}).then(r=>{const s=t.Fs.get(r.targetId);return(s===null||r.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(t.Fs=t.Fs.insert(r.targetId,r),t.Ms.set(e,r.targetId)),r})}async function Ss(n,e,t){const r=z(n),s=r.Fs.get(e),i=t?"readwrite":"readwrite-primary";try{t||await r.persistence.runTransaction("Release target",i,o=>r.persistence.referenceDelegate.removeTarget(o,s))}catch(o){if(!xn(o))throw o;x(Ql,`Failed to update sequence numbers for target ${e}: ${o}`)}r.Fs=r.Fs.remove(e),r.Ms.delete(s.target)}function nl(n,e,t){const r=z(n);let s=K.min(),i=X();return r.persistence.runTransaction("Execute query","readwrite",o=>function(u,h,f){const m=z(u),p=m.Ms.get(f);return p!==void 0?A.resolve(m.Fs.get(p)):m.hi.getTargetData(h,f)}(r,o,rt(e)).next(c=>{if(c)return s=c.lastLimboFreeSnapshotVersion,r.hi.getMatchingKeysForTargetId(o,c.targetId).next(u=>{i=u})}).next(()=>r.Cs.getDocumentsMatchingQuery(o,e,t?s:K.min(),t?i:X())).next(c=>(sy(r,c_(e),c),{documents:c,qs:i})))}function ny(n,e){const t=z(n),r=z(t.hi),s=t.Fs.get(e);return s?Promise.resolve(s.target):t.persistence.runTransaction("Get target data","readonly",i=>r.Et(i,e).next(o=>o?o.target:null))}function ry(n,e){const t=z(n),r=t.xs.get(e)||K.min();return t.persistence.runTransaction("Get new document changes","readonly",s=>t.Os.getAllFromCollectionGroup(s,e,Sg(r,fs),Number.MAX_SAFE_INTEGER)).then(s=>(sy(t,e,s),s))}function sy(n,e,t){let r=n.xs.get(e)||K.min();t.forEach((s,i)=>{i.readTime.compareTo(r)>0&&(r=i.readTime)}),n.xs.set(e,r)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const iy="firestore_clients";function bm(n,e){return`${iy}_${n}_${e}`}const oy="firestore_mutations";function Am(n,e,t){let r=`${oy}_${n}_${t}`;return e.isAuthenticated()&&(r+=`_${e.uid}`),r}const ay="firestore_targets";function ou(n,e){return`${ay}_${n}_${e}`}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bt="SharedClientState";class xa{constructor(e,t,r,s){this.user=e,this.batchId=t,this.state=r,this.error=s}static Ks(e,t,r){const s=JSON.parse(r);let i,o=typeof s=="object"&&["pending","acknowledged","rejected"].indexOf(s.state)!==-1&&(s.error===void 0||typeof s.error=="object");return o&&s.error&&(o=typeof s.error.message=="string"&&typeof s.error.code=="string",o&&(i=new M(s.error.code,s.error.message))),o?new xa(e,t,s.state,i):(we(bt,`Failed to parse mutation state for ID '${t}': ${r}`),null)}Ws(){const e={state:this.state,updateTimeMs:Date.now()};return this.error&&(e.error={code:this.error.code,message:this.error.message}),JSON.stringify(e)}}class Di{constructor(e,t,r){this.targetId=e,this.state=t,this.error=r}static Ks(e,t){const r=JSON.parse(t);let s,i=typeof r=="object"&&["not-current","current","rejected"].indexOf(r.state)!==-1&&(r.error===void 0||typeof r.error=="object");return i&&r.error&&(i=typeof r.error.message=="string"&&typeof r.error.code=="string",i&&(s=new M(r.error.code,r.error.message))),i?new Di(e,r.state,s):(we(bt,`Failed to parse target state for ID '${e}': ${t}`),null)}Ws(){const e={state:this.state,updateTimeMs:Date.now()};return this.error&&(e.error={code:this.error.code,message:this.error.message}),JSON.stringify(e)}}class Na{constructor(e,t){this.clientId=e,this.activeTargetIds=t}static Ks(e,t){const r=JSON.parse(t);let s=typeof r=="object"&&r.activeTargetIds instanceof Array,i=Nl();for(let o=0;s&&o<r.activeTargetIds.length;++o)s=kg(r.activeTargetIds[o]),i=i.add(r.activeTargetIds[o]);return s?new Na(e,i):(we(bt,`Failed to parse client data for instance '${e}': ${t}`),null)}}class Yl{constructor(e,t){this.clientId=e,this.onlineState=t}static Ks(e){const t=JSON.parse(e);return typeof t=="object"&&["Unknown","Online","Offline"].indexOf(t.onlineState)!==-1&&typeof t.clientId=="string"?new Yl(t.clientId,t.onlineState):(we(bt,`Failed to parse online state: ${e}`),null)}}class rl{constructor(){this.activeTargetIds=Nl()}Gs(e){this.activeTargetIds=this.activeTargetIds.add(e)}zs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Ws(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class au{constructor(e,t,r,s,i){this.window=e,this.Fi=t,this.persistenceKey=r,this.js=s,this.syncEngine=null,this.onlineStateHandler=null,this.sequenceNumberHandler=null,this.Js=this.Hs.bind(this),this.Ys=new fe(Q),this.started=!1,this.Zs=[];const o=r.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");this.storage=this.window.localStorage,this.currentUser=i,this.Xs=bm(this.persistenceKey,this.js),this.eo=function(u){return`firestore_sequence_number_${u}`}(this.persistenceKey),this.Ys=this.Ys.insert(this.js,new rl),this.no=new RegExp(`^${iy}_${o}_([^_]*)$`),this.ro=new RegExp(`^${oy}_${o}_(\\d+)(?:_(.*))?$`),this.io=new RegExp(`^${ay}_${o}_(\\d+)$`),this.so=function(u){return`firestore_online_state_${u}`}(this.persistenceKey),this.oo=function(u){return`firestore_bundle_loaded_v2_${u}`}(this.persistenceKey),this.window.addEventListener("storage",this.Js)}static C(e){return!(!e||!e.localStorage)}async start(){const e=await this.syncEngine.Ps();for(const r of e){if(r===this.js)continue;const s=this.getItem(bm(this.persistenceKey,r));if(s){const i=Na.Ks(r,s);i&&(this.Ys=this.Ys.insert(i.clientId,i))}}this._o();const t=this.storage.getItem(this.so);if(t){const r=this.ao(t);r&&this.uo(r)}for(const r of this.Zs)this.Hs(r);this.Zs=[],this.window.addEventListener("pagehide",()=>this.shutdown()),this.started=!0}writeSequenceNumber(e){this.setItem(this.eo,JSON.stringify(e))}getAllActiveQueryTargets(){return this.co(this.Ys)}isActiveQueryTarget(e){let t=!1;return this.Ys.forEach((r,s)=>{s.activeTargetIds.has(e)&&(t=!0)}),t}addPendingMutation(e){this.lo(e,"pending")}updateMutationState(e,t,r){this.lo(e,t,r),this.ho(e)}addLocalQueryTarget(e,t=!0){let r="not-current";if(this.isActiveQueryTarget(e)){const s=this.storage.getItem(ou(this.persistenceKey,e));if(s){const i=Di.Ks(e,s);i&&(r=i.state)}}return t&&this.Po.Gs(e),this._o(),r}removeLocalQueryTarget(e){this.Po.zs(e),this._o()}isLocalQueryTarget(e){return this.Po.activeTargetIds.has(e)}clearQueryState(e){this.removeItem(ou(this.persistenceKey,e))}updateQueryState(e,t,r){this.To(e,t,r)}handleUserChange(e,t,r){t.forEach(s=>{this.ho(s)}),this.currentUser=e,r.forEach(s=>{this.addPendingMutation(s)})}setOnlineState(e){this.Io(e)}notifyBundleLoaded(e){this.Eo(e)}shutdown(){this.started&&(this.window.removeEventListener("storage",this.Js),this.removeItem(this.Xs),this.started=!1)}getItem(e){const t=this.storage.getItem(e);return x(bt,"READ",e,t),t}setItem(e,t){x(bt,"SET",e,t),this.storage.setItem(e,t)}removeItem(e){x(bt,"REMOVE",e),this.storage.removeItem(e)}Hs(e){const t=e;if(t.storageArea===this.storage){if(x(bt,"EVENT",t.key,t.newValue),t.key===this.Xs)return void we("Received WebStorage notification for local change. Another client might have garbage-collected our state");this.Fi.enqueueRetryable(async()=>{if(this.started){if(t.key!==null){if(this.no.test(t.key)){if(t.newValue==null){const r=this.Ao(t.key);return this.Ro(r,null)}{const r=this.Vo(t.key,t.newValue);if(r)return this.Ro(r.clientId,r)}}else if(this.ro.test(t.key)){if(t.newValue!==null){const r=this.mo(t.key,t.newValue);if(r)return this.fo(r)}}else if(this.io.test(t.key)){if(t.newValue!==null){const r=this.po(t.key,t.newValue);if(r)return this.yo(r)}}else if(t.key===this.so){if(t.newValue!==null){const r=this.ao(t.newValue);if(r)return this.uo(r)}}else if(t.key===this.eo){const r=function(i){let o=Ye.ue;if(i!=null)try{const c=JSON.parse(i);G(typeof c=="number",30636,{wo:i}),o=c}catch(c){we(bt,"Failed to read sequence number from WebStorage",c)}return o}(t.newValue);r!==Ye.ue&&this.sequenceNumberHandler(r)}else if(t.key===this.oo){const r=this.So(t.newValue);await Promise.all(r.map(s=>this.syncEngine.bo(s)))}}}else this.Zs.push(t)})}}get Po(){return this.Ys.get(this.js)}_o(){this.setItem(this.Xs,this.Po.Ws())}lo(e,t,r){const s=new xa(this.currentUser,e,t,r),i=Am(this.persistenceKey,this.currentUser,e);this.setItem(i,s.Ws())}ho(e){const t=Am(this.persistenceKey,this.currentUser,e);this.removeItem(t)}Io(e){const t={clientId:this.js,onlineState:e};this.storage.setItem(this.so,JSON.stringify(t))}To(e,t,r){const s=ou(this.persistenceKey,e),i=new Di(e,t,r);this.setItem(s,i.Ws())}Eo(e){const t=JSON.stringify(Array.from(e));this.setItem(this.oo,t)}Ao(e){const t=this.no.exec(e);return t?t[1]:null}Vo(e,t){const r=this.Ao(e);return Na.Ks(r,t)}mo(e,t){const r=this.ro.exec(e),s=Number(r[1]),i=r[2]!==void 0?r[2]:null;return xa.Ks(new Ce(i),s,t)}po(e,t){const r=this.io.exec(e),s=Number(r[1]);return Di.Ks(s,t)}ao(e){return Yl.Ks(e)}So(e){return JSON.parse(e)}async fo(e){if(e.user.uid===this.currentUser.uid)return this.syncEngine.Do(e.batchId,e.state,e.error);x(bt,`Ignoring mutation for non-active user ${e.user.uid}`)}yo(e){return this.syncEngine.vo(e.targetId,e.state,e.error)}Ro(e,t){const r=t?this.Ys.insert(e,t):this.Ys.remove(e),s=this.co(this.Ys),i=this.co(r),o=[],c=[];return i.forEach(u=>{s.has(u)||o.push(u)}),s.forEach(u=>{i.has(u)||c.push(u)}),this.syncEngine.Co(o,c).then(()=>{this.Ys=r})}uo(e){this.Ys.get(e.clientId)&&this.onlineStateHandler(e.onlineState)}co(e){let t=Nl();return e.forEach((r,s)=>{t=t.unionWith(s.activeTargetIds)}),t}}class cy{constructor(){this.Fo=new rl,this.Mo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e,t=!0){return t&&this.Fo.Gs(e),this.Mo[e]||"not-current"}updateQueryState(e,t,r){this.Mo[e]=t}removeLocalQueryTarget(e){this.Fo.zs(e)}isLocalQueryTarget(e){return this.Fo.activeTargetIds.has(e)}clearQueryState(e){delete this.Mo[e]}getAllActiveQueryTargets(){return this.Fo.activeTargetIds}isActiveQueryTarget(e){return this.Fo.activeTargetIds.has(e)}start(){return this.Fo=new rl,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Q0{xo(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sm="ConnectivityMonitor";class Pm{constructor(){this.Oo=()=>this.No(),this.Bo=()=>this.Lo(),this.ko=[],this.qo()}xo(e){this.ko.push(e)}shutdown(){window.removeEventListener("online",this.Oo),window.removeEventListener("offline",this.Bo)}qo(){window.addEventListener("online",this.Oo),window.addEventListener("offline",this.Bo)}No(){x(Sm,"Network connectivity changed: AVAILABLE");for(const e of this.ko)e(0)}Lo(){x(Sm,"Network connectivity changed: UNAVAILABLE");for(const e of this.ko)e(1)}static C(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Yo=null;function sl(){return Yo===null?Yo=function(){return 268435456+Math.round(2147483648*Math.random())}():Yo++,"0x"+Yo.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cu="RestConnection",Y0={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};class X0{get Qo(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.$o=t+"://"+e.host,this.Uo=`projects/${r}/databases/${s}`,this.Ko=this.databaseId.database===zi?`project_id=${r}`:`project_id=${r}&database_id=${s}`}Wo(e,t,r,s,i){const o=sl(),c=this.Go(e,t.toUriEncodedString());x(cu,`Sending RPC '${e}' ${o}:`,c,r);const u={"google-cloud-resource-prefix":this.Uo,"x-goog-request-params":this.Ko};this.zo(u,s,i);const{host:h}=new URL(c),f=Qa(h);return this.jo(e,c,u,r,f).then(m=>(x(cu,`Received RPC '${e}' ${o}: `,m),m),m=>{throw qt(cu,`RPC '${e}' ${o} failed with error: `,m,"url: ",c,"request:",r),m})}Jo(e,t,r,s,i,o){return this.Wo(e,t,r,s,i)}zo(e,t,r){e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+Ns}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach((s,i)=>e[i]=s),r&&r.headers.forEach((s,i)=>e[i]=s)}Go(e,t){const r=Y0[e];return`${this.$o}/v1/${t}:${r}`}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class J0{constructor(e){this.Ho=e.Ho,this.Yo=e.Yo}Zo(e){this.Xo=e}e_(e){this.t_=e}n_(e){this.r_=e}onMessage(e){this.i_=e}close(){this.Yo()}send(e){this.Ho(e)}s_(){this.Xo()}o_(){this.t_()}__(e){this.r_(e)}a_(e){this.i_(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Me="WebChannelConnection";class Z0 extends X0{constructor(e){super(e),this.u_=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}jo(e,t,r,s,i){const o=sl();return new Promise((c,u)=>{const h=new pg;h.setWithCredentials(!0),h.listenOnce(gg.COMPLETE,()=>{try{switch(h.getLastErrorCode()){case Jo.NO_ERROR:const m=h.getResponseJson();x(Me,`XHR for RPC '${e}' ${o} received:`,JSON.stringify(m)),c(m);break;case Jo.TIMEOUT:x(Me,`RPC '${e}' ${o} timed out`),u(new M(V.DEADLINE_EXCEEDED,"Request time out"));break;case Jo.HTTP_ERROR:const p=h.getStatus();if(x(Me,`RPC '${e}' ${o} failed with status:`,p,"response text:",h.getResponseText()),p>0){let w=h.getResponseJson();Array.isArray(w)&&(w=w[0]);const C=w==null?void 0:w.error;if(C&&C.status&&C.message){const D=function(F){const L=F.toLowerCase().replace(/_/g,"-");return Object.values(V).indexOf(L)>=0?L:V.UNKNOWN}(C.status);u(new M(D,C.message))}else u(new M(V.UNKNOWN,"Server responded with status "+h.getStatus()))}else u(new M(V.UNAVAILABLE,"Connection failed."));break;default:q(9055,{c_:e,streamId:o,l_:h.getLastErrorCode(),h_:h.getLastError()})}}finally{x(Me,`RPC '${e}' ${o} completed.`)}});const f=JSON.stringify(s);x(Me,`RPC '${e}' ${o} sending request:`,s),h.send(t,"POST",f,r,15)})}P_(e,t,r){const s=sl(),i=[this.$o,"/","google.firestore.v1.Firestore","/",e,"/channel"],o=vg(),c=yg(),u={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},h=this.longPollingOptions.timeoutSeconds;h!==void 0&&(u.longPollingTimeout=Math.round(1e3*h)),this.useFetchStreams&&(u.useFetchStreams=!0),this.zo(u.initMessageHeaders,t,r),u.encodeInitMessageHeaders=!0;const f=i.join("");x(Me,`Creating RPC '${e}' stream ${s}: ${f}`,u);const m=o.createWebChannel(f,u);this.T_(m);let p=!1,w=!1;const C=new J0({Ho:P=>{w?x(Me,`Not sending because RPC '${e}' stream ${s} is closed:`,P):(p||(x(Me,`Opening RPC '${e}' stream ${s} transport.`),m.open(),p=!0),x(Me,`RPC '${e}' stream ${s} sending:`,P),m.send(P))},Yo:()=>m.close()}),D=(P,F,L)=>{P.listen(F,O=>{try{L(O)}catch(U){setTimeout(()=>{throw U},0)}})};return D(m,pi.EventType.OPEN,()=>{w||(x(Me,`RPC '${e}' stream ${s} transport opened.`),C.s_())}),D(m,pi.EventType.CLOSE,()=>{w||(w=!0,x(Me,`RPC '${e}' stream ${s} transport closed`),C.__(),this.I_(m))}),D(m,pi.EventType.ERROR,P=>{w||(w=!0,qt(Me,`RPC '${e}' stream ${s} transport errored. Name:`,P.name,"Message:",P.message),C.__(new M(V.UNAVAILABLE,"The operation could not be completed")))}),D(m,pi.EventType.MESSAGE,P=>{var F;if(!w){const L=P.data[0];G(!!L,16349);const O=L,U=(O==null?void 0:O.error)||((F=O[0])===null||F===void 0?void 0:F.error);if(U){x(Me,`RPC '${e}' stream ${s} received error:`,U);const N=U.status;let W=function(y){const E=Te[y];if(E!==void 0)return E_(E)}(N),T=U.message;W===void 0&&(W=V.INTERNAL,T="Unknown error status: "+N+" with message "+U.message),w=!0,C.__(new M(W,T)),m.close()}else x(Me,`RPC '${e}' stream ${s} received:`,L),C.a_(L)}}),D(c,_g.STAT_EVENT,P=>{P.stat===Mu.PROXY?x(Me,`RPC '${e}' stream ${s} detected buffering proxy`):P.stat===Mu.NOPROXY&&x(Me,`RPC '${e}' stream ${s} detected no buffering proxy`)}),setTimeout(()=>{C.o_()},0),C}terminate(){this.u_.forEach(e=>e.close()),this.u_=[]}T_(e){this.u_.push(e)}I_(e){this.u_=this.u_.filter(t=>t===e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function uy(){return typeof window<"u"?window:null}function ca(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function hc(n){return new i0(n,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ly{constructor(e,t,r=1e3,s=1.5,i=6e4){this.Fi=e,this.timerId=t,this.d_=r,this.E_=s,this.A_=i,this.R_=0,this.V_=null,this.m_=Date.now(),this.reset()}reset(){this.R_=0}f_(){this.R_=this.A_}g_(e){this.cancel();const t=Math.floor(this.R_+this.p_()),r=Math.max(0,Date.now()-this.m_),s=Math.max(0,t-r);s>0&&x("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.R_} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.V_=this.Fi.enqueueAfterDelay(this.timerId,s,()=>(this.m_=Date.now(),e())),this.R_*=this.E_,this.R_<this.d_&&(this.R_=this.d_),this.R_>this.A_&&(this.R_=this.A_)}y_(){this.V_!==null&&(this.V_.skipDelay(),this.V_=null)}cancel(){this.V_!==null&&(this.V_.cancel(),this.V_=null)}p_(){return(Math.random()-.5)*this.R_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rm="PersistentStream";class hy{constructor(e,t,r,s,i,o,c,u){this.Fi=e,this.w_=r,this.S_=s,this.connection=i,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=c,this.listener=u,this.state=0,this.b_=0,this.D_=null,this.v_=null,this.stream=null,this.C_=0,this.F_=new ly(e,t)}M_(){return this.state===1||this.state===5||this.x_()}x_(){return this.state===2||this.state===3}start(){this.C_=0,this.state!==4?this.auth():this.O_()}async stop(){this.M_()&&await this.close(0)}N_(){this.state=0,this.F_.reset()}B_(){this.x_()&&this.D_===null&&(this.D_=this.Fi.enqueueAfterDelay(this.w_,6e4,()=>this.L_()))}k_(e){this.q_(),this.stream.send(e)}async L_(){if(this.x_())return this.close(0)}q_(){this.D_&&(this.D_.cancel(),this.D_=null)}Q_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(e,t){this.q_(),this.Q_(),this.F_.cancel(),this.b_++,e!==4?this.F_.reset():t&&t.code===V.RESOURCE_EXHAUSTED?(we(t.toString()),we("Using maximum backoff delay to prevent overloading the backend."),this.F_.f_()):t&&t.code===V.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.U_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.n_(t)}U_(){}auth(){this.state=1;const e=this.K_(this.b_),t=this.b_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,s])=>{this.b_===t&&this.W_(r,s)},r=>{e(()=>{const s=new M(V.UNKNOWN,"Fetching auth token failed: "+r.message);return this.G_(s)})})}W_(e,t){const r=this.K_(this.b_);this.stream=this.z_(e,t),this.stream.Zo(()=>{r(()=>this.listener.Zo())}),this.stream.e_(()=>{r(()=>(this.state=2,this.v_=this.Fi.enqueueAfterDelay(this.S_,1e4,()=>(this.x_()&&(this.state=3),Promise.resolve())),this.listener.e_()))}),this.stream.n_(s=>{r(()=>this.G_(s))}),this.stream.onMessage(s=>{r(()=>++this.C_==1?this.j_(s):this.onNext(s))})}O_(){this.state=5,this.F_.g_(async()=>{this.state=0,this.start()})}G_(e){return x(Rm,`close with error: ${e}`),this.stream=null,this.close(4,e)}K_(e){return t=>{this.Fi.enqueueAndForget(()=>this.b_===e?t():(x(Rm,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class eS extends hy{constructor(e,t,r,s,i,o){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,s,o),this.serializer=i}z_(e,t){return this.connection.P_("Listen",e,t)}j_(e){return this.onNext(e)}onNext(e){this.F_.reset();const t=c0(this.serializer,e),r=function(i){if(!("targetChange"in i))return K.min();const o=i.targetChange;return o.targetIds&&o.targetIds.length?K.min():o.readTime?ze(o.readTime):K.min()}(e);return this.listener.J_(t,r)}H_(e){const t={};t.database=Xu(this.serializer),t.addTarget=function(i,o){let c;const u=o.target;if(c=ba(u)?{documents:D_(i,u)}:{query:k_(i,u).Vt},c.targetId=o.targetId,o.resumeToken.approximateByteSize()>0){c.resumeToken=A_(i,o.resumeToken);const h=Qu(i,o.expectedCount);h!==null&&(c.expectedCount=h)}else if(o.snapshotVersion.compareTo(K.min())>0){c.readTime=As(i,o.snapshotVersion.toTimestamp());const h=Qu(i,o.expectedCount);h!==null&&(c.expectedCount=h)}return c}(this.serializer,e);const r=l0(this.serializer,e);r&&(t.labels=r),this.k_(t)}Y_(e){const t={};t.database=Xu(this.serializer),t.removeTarget=e,this.k_(t)}}class tS extends hy{constructor(e,t,r,s,i,o){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,r,s,o),this.serializer=i}get Z_(){return this.C_>0}start(){this.lastStreamToken=void 0,super.start()}U_(){this.Z_&&this.X_([])}z_(e,t){return this.connection.P_("Write",e,t)}j_(e){return G(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,G(!e.writeResults||e.writeResults.length===0,55816),this.listener.ea()}onNext(e){G(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.F_.reset();const t=u0(e.writeResults,e.commitTime),r=ze(e.commitTime);return this.listener.ta(r,t)}na(){const e={};e.database=Xu(this.serializer),this.k_(e)}X_(e){const t={streamToken:this.lastStreamToken,writes:e.map(r=>Ra(this.serializer,r))};this.k_(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nS{}class rS extends nS{constructor(e,t,r,s){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=s,this.ra=!1}ia(){if(this.ra)throw new M(V.FAILED_PRECONDITION,"The client has already been terminated.")}Wo(e,t,r,s){return this.ia(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,o])=>this.connection.Wo(e,Yu(t,r),s,i,o)).catch(i=>{throw i.name==="FirebaseError"?(i.code===V.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new M(V.UNKNOWN,i.toString())})}Jo(e,t,r,s,i){return this.ia(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([o,c])=>this.connection.Jo(e,Yu(t,r),s,o,c,i)).catch(o=>{throw o.name==="FirebaseError"?(o.code===V.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new M(V.UNKNOWN,o.toString())})}terminate(){this.ra=!0,this.connection.terminate()}}class sS{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.sa=0,this.oa=null,this._a=!0}aa(){this.sa===0&&(this.ua("Unknown"),this.oa=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.oa=null,this.ca("Backend didn't respond within 10 seconds."),this.ua("Offline"),Promise.resolve())))}la(e){this.state==="Online"?this.ua("Unknown"):(this.sa++,this.sa>=1&&(this.ha(),this.ca(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ua("Offline")))}set(e){this.ha(),this.sa=0,e==="Online"&&(this._a=!1),this.ua(e)}ua(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}ca(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this._a?(we(t),this._a=!1):x("OnlineStateTracker",t)}ha(){this.oa!==null&&(this.oa.cancel(),this.oa=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Er="RemoteStore";class iS{constructor(e,t,r,s,i){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.Pa=[],this.Ta=new Map,this.Ia=new Set,this.da=[],this.Ea=i,this.Ea.xo(o=>{r.enqueueAndForget(async()=>{Sr(this)&&(x(Er,"Restarting streams for network reachability change."),await async function(u){const h=z(u);h.Ia.add(4),await po(h),h.Aa.set("Unknown"),h.Ia.delete(4),await dc(h)}(this))})}),this.Aa=new sS(r,s)}}async function dc(n){if(Sr(n))for(const e of n.da)await e(!0)}async function po(n){for(const e of n.da)await e(!1)}function fc(n,e){const t=z(n);t.Ta.has(e.targetId)||(t.Ta.set(e.targetId,e),Zl(t)?Jl(t):Us(t).x_()&&Xl(t,e))}function Ps(n,e){const t=z(n),r=Us(t);t.Ta.delete(e),r.x_()&&dy(t,e),t.Ta.size===0&&(r.x_()?r.B_():Sr(t)&&t.Aa.set("Unknown"))}function Xl(n,e){if(n.Ra.$e(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(K.min())>0){const t=n.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(t)}Us(n).H_(e)}function dy(n,e){n.Ra.$e(e),Us(n).Y_(e)}function Jl(n){n.Ra=new t0({getRemoteKeysForTarget:e=>n.remoteSyncer.getRemoteKeysForTarget(e),Et:e=>n.Ta.get(e)||null,lt:()=>n.datastore.serializer.databaseId}),Us(n).start(),n.Aa.aa()}function Zl(n){return Sr(n)&&!Us(n).M_()&&n.Ta.size>0}function Sr(n){return z(n).Ia.size===0}function fy(n){n.Ra=void 0}async function oS(n){n.Aa.set("Online")}async function aS(n){n.Ta.forEach((e,t)=>{Xl(n,e)})}async function cS(n,e){fy(n),Zl(n)?(n.Aa.la(e),Jl(n)):n.Aa.set("Unknown")}async function uS(n,e,t){if(n.Aa.set("Online"),e instanceof b_&&e.state===2&&e.cause)try{await async function(s,i){const o=i.cause;for(const c of i.targetIds)s.Ta.has(c)&&(await s.remoteSyncer.rejectListen(c,o),s.Ta.delete(c),s.Ra.removeTarget(c))}(n,e)}catch(r){x(Er,"Failed to remove targets %s: %s ",e.targetIds.join(","),r),await Ma(n,r)}else if(e instanceof oa?n.Ra.Ye(e):e instanceof T_?n.Ra.it(e):n.Ra.et(e),!t.isEqual(K.min()))try{const r=await ty(n.localStore);t.compareTo(r)>=0&&await function(i,o){const c=i.Ra.Pt(o);return c.targetChanges.forEach((u,h)=>{if(u.resumeToken.approximateByteSize()>0){const f=i.Ta.get(h);f&&i.Ta.set(h,f.withResumeToken(u.resumeToken,o))}}),c.targetMismatches.forEach((u,h)=>{const f=i.Ta.get(u);if(!f)return;i.Ta.set(u,f.withResumeToken(Ee.EMPTY_BYTE_STRING,f.snapshotVersion)),dy(i,u);const m=new Ut(f.target,u,h,f.sequenceNumber);Xl(i,m)}),i.remoteSyncer.applyRemoteEvent(c)}(n,t)}catch(r){x(Er,"Failed to raise snapshot:",r),await Ma(n,r)}}async function Ma(n,e,t){if(!xn(e))throw e;n.Ia.add(1),await po(n),n.Aa.set("Offline"),t||(t=()=>ty(n.localStore)),n.asyncQueue.enqueueRetryable(async()=>{x(Er,"Retrying IndexedDB access"),await t(),n.Ia.delete(1),await dc(n)})}function my(n,e){return e().catch(t=>Ma(n,t,e))}async function Ls(n){const e=z(n),t=Dn(e);let r=e.Pa.length>0?e.Pa[e.Pa.length-1].batchId:lr;for(;lS(e);)try{const s=await K0(e.localStore,r);if(s===null){e.Pa.length===0&&t.B_();break}r=s.batchId,hS(e,s)}catch(s){await Ma(e,s)}py(e)&&gy(e)}function lS(n){return Sr(n)&&n.Pa.length<10}function hS(n,e){n.Pa.push(e);const t=Dn(n);t.x_()&&t.Z_&&t.X_(e.mutations)}function py(n){return Sr(n)&&!Dn(n).M_()&&n.Pa.length>0}function gy(n){Dn(n).start()}async function dS(n){Dn(n).na()}async function fS(n){const e=Dn(n);for(const t of n.Pa)e.X_(t.mutations)}async function mS(n,e,t){const r=n.Pa.shift(),s=Ul.from(r,e,t);await my(n,()=>n.remoteSyncer.applySuccessfulWrite(s)),await Ls(n)}async function pS(n,e){e&&Dn(n).Z_&&await async function(r,s){if(function(o){return ZA(o)&&o!==V.ABORTED}(s.code)){const i=r.Pa.shift();Dn(r).N_(),await my(r,()=>r.remoteSyncer.rejectFailedWrite(i.batchId,s)),await Ls(r)}}(n,e),py(n)&&gy(n)}async function Cm(n,e){const t=z(n);t.asyncQueue.verifyOperationInProgress(),x(Er,"RemoteStore received new credentials");const r=Sr(t);t.Ia.add(3),await po(t),r&&t.Aa.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.Ia.delete(3),await dc(t)}async function il(n,e){const t=z(n);e?(t.Ia.delete(2),await dc(t)):e||(t.Ia.add(2),await po(t),t.Aa.set("Unknown"))}function Us(n){return n.Va||(n.Va=function(t,r,s){const i=z(t);return i.ia(),new eS(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(n.datastore,n.asyncQueue,{Zo:oS.bind(null,n),e_:aS.bind(null,n),n_:cS.bind(null,n),J_:uS.bind(null,n)}),n.da.push(async e=>{e?(n.Va.N_(),Zl(n)?Jl(n):n.Aa.set("Unknown")):(await n.Va.stop(),fy(n))})),n.Va}function Dn(n){return n.ma||(n.ma=function(t,r,s){const i=z(t);return i.ia(),new tS(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(n.datastore,n.asyncQueue,{Zo:()=>Promise.resolve(),e_:dS.bind(null,n),n_:pS.bind(null,n),ea:fS.bind(null,n),ta:mS.bind(null,n)}),n.da.push(async e=>{e?(n.ma.N_(),await Ls(n)):(await n.ma.stop(),n.Pa.length>0&&(x(Er,`Stopping write stream with ${n.Pa.length} pending writes`),n.Pa=[]))})),n.ma}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eh{constructor(e,t,r,s,i){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=s,this.removalCallback=i,this.deferred=new Pt,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(o=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,s,i){const o=Date.now()+r,c=new eh(e,t,o,s,i);return c.start(r),c}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new M(V.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function th(n,e){if(we("AsyncQueue",`${e}: ${n}`),xn(n))return new M(V.UNAVAILABLE,`${e}: ${n}`);throw n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qr{static emptySet(e){return new qr(e.comparator)}constructor(e){this.comparator=e?(t,r)=>e(t,r)||$.comparator(t.key,r.key):(t,r)=>$.comparator(t.key,r.key),this.keyedMap=gi(),this.sortedSet=new fe(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,r)=>(e(t),!1))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof qr)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach(t=>{e.push(t.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const r=new qr;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dm{constructor(){this.fa=new fe($.comparator)}track(e){const t=e.doc.key,r=this.fa.get(t);r?e.type!==0&&r.type===3?this.fa=this.fa.insert(t,e):e.type===3&&r.type!==1?this.fa=this.fa.insert(t,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.fa=this.fa.insert(t,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.fa=this.fa.insert(t,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.fa=this.fa.remove(t):e.type===1&&r.type===2?this.fa=this.fa.insert(t,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.fa=this.fa.insert(t,{type:2,doc:e.doc}):q(63341,{At:e,ga:r}):this.fa=this.fa.insert(t,e)}pa(){const e=[];return this.fa.inorderTraversal((t,r)=>{e.push(r)}),e}}class Rs{constructor(e,t,r,s,i,o,c,u,h){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=s,this.mutatedKeys=i,this.fromCache=o,this.syncStateChanged=c,this.excludesMetadataChanges=u,this.hasCachedResults=h}static fromInitialDocuments(e,t,r,s,i){const o=[];return t.forEach(c=>{o.push({type:0,doc:c})}),new Rs(e,t,qr.emptySet(t),o,r,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&ic(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let s=0;s<t.length;s++)if(t[s].type!==r[s].type||!t[s].doc.isEqual(r[s].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gS{constructor(){this.ya=void 0,this.wa=[]}Sa(){return this.wa.some(e=>e.ba())}}class _S{constructor(){this.queries=km(),this.onlineState="Unknown",this.Da=new Set}terminate(){(function(t,r){const s=z(t),i=s.queries;s.queries=km(),i.forEach((o,c)=>{for(const u of c.wa)u.onError(r)})})(this,new M(V.ABORTED,"Firestore shutting down"))}}function km(){return new Gt(n=>a_(n),ic)}async function _y(n,e){const t=z(n);let r=3;const s=e.query;let i=t.queries.get(s);i?!i.Sa()&&e.ba()&&(r=2):(i=new gS,r=e.ba()?0:1);try{switch(r){case 0:i.ya=await t.onListen(s,!0);break;case 1:i.ya=await t.onListen(s,!1);break;case 2:await t.onFirstRemoteStoreListen(s)}}catch(o){const c=th(o,`Initialization of query '${Ur(e.query)}' failed`);return void e.onError(c)}t.queries.set(s,i),i.wa.push(e),e.va(t.onlineState),i.ya&&e.Ca(i.ya)&&nh(t)}async function yy(n,e){const t=z(n),r=e.query;let s=3;const i=t.queries.get(r);if(i){const o=i.wa.indexOf(e);o>=0&&(i.wa.splice(o,1),i.wa.length===0?s=e.ba()?0:1:!i.Sa()&&e.ba()&&(s=2))}switch(s){case 0:return t.queries.delete(r),t.onUnlisten(r,!0);case 1:return t.queries.delete(r),t.onUnlisten(r,!1);case 2:return t.onLastRemoteStoreUnlisten(r);default:return}}function yS(n,e){const t=z(n);let r=!1;for(const s of e){const i=s.query,o=t.queries.get(i);if(o){for(const c of o.wa)c.Ca(s)&&(r=!0);o.ya=s}}r&&nh(t)}function vS(n,e,t){const r=z(n),s=r.queries.get(e);if(s)for(const i of s.wa)i.onError(t);r.queries.delete(e)}function nh(n){n.Da.forEach(e=>{e.next()})}var ol,Vm;(Vm=ol||(ol={})).Fa="default",Vm.Cache="cache";class vy{constructor(e,t,r){this.query=e,this.Ma=t,this.xa=!1,this.Oa=null,this.onlineState="Unknown",this.options=r||{}}Ca(e){if(!this.options.includeMetadataChanges){const r=[];for(const s of e.docChanges)s.type!==3&&r.push(s);e=new Rs(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.xa?this.Na(e)&&(this.Ma.next(e),t=!0):this.Ba(e,this.onlineState)&&(this.La(e),t=!0),this.Oa=e,t}onError(e){this.Ma.error(e)}va(e){this.onlineState=e;let t=!1;return this.Oa&&!this.xa&&this.Ba(this.Oa,e)&&(this.La(this.Oa),t=!0),t}Ba(e,t){if(!e.fromCache||!this.ba())return!0;const r=t!=="Offline";return(!this.options.ka||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}Na(e){if(e.docChanges.length>0)return!0;const t=this.Oa&&this.Oa.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}La(e){e=Rs.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.xa=!0,this.Ma.next(e)}ba(){return this.options.source!==ol.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Iy{constructor(e){this.key=e}}class wy{constructor(e){this.key=e}}class IS{constructor(e,t){this.query=e,this.Ha=t,this.Ya=null,this.hasCachedResults=!1,this.current=!1,this.Za=X(),this.mutatedKeys=X(),this.Xa=u_(e),this.eu=new qr(this.Xa)}get tu(){return this.Ha}nu(e,t){const r=t?t.ru:new Dm,s=t?t.eu:this.eu;let i=t?t.mutatedKeys:this.mutatedKeys,o=s,c=!1;const u=this.query.limitType==="F"&&s.size===this.query.limit?s.last():null,h=this.query.limitType==="L"&&s.size===this.query.limit?s.first():null;if(e.inorderTraversal((f,m)=>{const p=s.get(f),w=ho(this.query,m)?m:null,C=!!p&&this.mutatedKeys.has(p.key),D=!!w&&(w.hasLocalMutations||this.mutatedKeys.has(w.key)&&w.hasCommittedMutations);let P=!1;p&&w?p.data.isEqual(w.data)?C!==D&&(r.track({type:3,doc:w}),P=!0):this.iu(p,w)||(r.track({type:2,doc:w}),P=!0,(u&&this.Xa(w,u)>0||h&&this.Xa(w,h)<0)&&(c=!0)):!p&&w?(r.track({type:0,doc:w}),P=!0):p&&!w&&(r.track({type:1,doc:p}),P=!0,(u||h)&&(c=!0)),P&&(w?(o=o.add(w),i=D?i.add(f):i.delete(f)):(o=o.delete(f),i=i.delete(f)))}),this.query.limit!==null)for(;o.size>this.query.limit;){const f=this.query.limitType==="F"?o.last():o.first();o=o.delete(f.key),i=i.delete(f.key),r.track({type:1,doc:f})}return{eu:o,ru:r,Ds:c,mutatedKeys:i}}iu(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,s){const i=this.eu;this.eu=e.eu,this.mutatedKeys=e.mutatedKeys;const o=e.ru.pa();o.sort((f,m)=>function(w,C){const D=P=>{switch(P){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return q(20277,{At:P})}};return D(w)-D(C)}(f.type,m.type)||this.Xa(f.doc,m.doc)),this.su(r),s=s!=null&&s;const c=t&&!s?this.ou():[],u=this.Za.size===0&&this.current&&!s?1:0,h=u!==this.Ya;return this.Ya=u,o.length!==0||h?{snapshot:new Rs(this.query,e.eu,i,o,e.mutatedKeys,u===0,h,!1,!!r&&r.resumeToken.approximateByteSize()>0),_u:c}:{_u:c}}va(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({eu:this.eu,ru:new Dm,mutatedKeys:this.mutatedKeys,Ds:!1},!1)):{_u:[]}}au(e){return!this.Ha.has(e)&&!!this.eu.has(e)&&!this.eu.get(e).hasLocalMutations}su(e){e&&(e.addedDocuments.forEach(t=>this.Ha=this.Ha.add(t)),e.modifiedDocuments.forEach(t=>{}),e.removedDocuments.forEach(t=>this.Ha=this.Ha.delete(t)),this.current=e.current)}ou(){if(!this.current)return[];const e=this.Za;this.Za=X(),this.eu.forEach(r=>{this.au(r.key)&&(this.Za=this.Za.add(r.key))});const t=[];return e.forEach(r=>{this.Za.has(r)||t.push(new wy(r))}),this.Za.forEach(r=>{e.has(r)||t.push(new Iy(r))}),t}uu(e){this.Ha=e.qs,this.Za=X();const t=this.nu(e.documents);return this.applyChanges(t,!0)}cu(){return Rs.fromInitialDocuments(this.query,this.eu,this.mutatedKeys,this.Ya===0,this.hasCachedResults)}}const Bs="SyncEngine";class wS{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class ES{constructor(e){this.key=e,this.lu=!1}}class TS{constructor(e,t,r,s,i,o){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=o,this.hu={},this.Pu=new Gt(c=>a_(c),ic),this.Tu=new Map,this.Iu=new Set,this.du=new fe($.comparator),this.Eu=new Map,this.Au=new Wl,this.Ru={},this.Vu=new Map,this.mu=wr.ur(),this.onlineState="Unknown",this.fu=void 0}get isPrimaryClient(){return this.fu===!0}}async function bS(n,e,t=!0){const r=mc(n);let s;const i=r.Pu.get(e);return i?(r.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.cu()):s=await Ey(r,e,t,!0),s}async function AS(n,e){const t=mc(n);await Ey(t,e,!0,!1)}async function Ey(n,e,t,r){const s=await Oa(n.localStore,rt(e)),i=s.targetId,o=n.sharedClientState.addLocalQueryTarget(i,t);let c;return r&&(c=await rh(n,e,i,o==="current",s.resumeToken)),n.isPrimaryClient&&t&&fc(n.remoteStore,s),c}async function rh(n,e,t,r,s){n.gu=(m,p,w)=>async function(D,P,F,L){let O=P.view.nu(F);O.Ds&&(O=await nl(D.localStore,P.query,!1).then(({documents:T})=>P.view.nu(T,O)));const U=L&&L.targetChanges.get(P.targetId),N=L&&L.targetMismatches.get(P.targetId)!=null,W=P.view.applyChanges(O,D.isPrimaryClient,U,N);return al(D,P.targetId,W._u),W.snapshot}(n,m,p,w);const i=await nl(n.localStore,e,!0),o=new IS(e,i.qs),c=o.nu(i.documents),u=mo.createSynthesizedTargetChangeForCurrentChange(t,r&&n.onlineState!=="Offline",s),h=o.applyChanges(c,n.isPrimaryClient,u);al(n,t,h._u);const f=new wS(e,t,o);return n.Pu.set(e,f),n.Tu.has(t)?n.Tu.get(t).push(e):n.Tu.set(t,[e]),h.snapshot}async function SS(n,e,t){const r=z(n),s=r.Pu.get(e),i=r.Tu.get(s.targetId);if(i.length>1)return r.Tu.set(s.targetId,i.filter(o=>!ic(o,e))),void r.Pu.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await Ss(r.localStore,s.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(s.targetId),t&&Ps(r.remoteStore,s.targetId),Cs(r,s.targetId)}).catch(On)):(Cs(r,s.targetId),await Ss(r.localStore,s.targetId,!0))}async function PS(n,e){const t=z(n),r=t.Pu.get(e),s=t.Tu.get(r.targetId);t.isPrimaryClient&&s.length===1&&(t.sharedClientState.removeLocalQueryTarget(r.targetId),Ps(t.remoteStore,r.targetId))}async function RS(n,e,t){const r=ah(n);try{const s=await function(o,c){const u=z(o),h=ae.now(),f=c.reduce((w,C)=>w.add(C.key),X());let m,p;return u.persistence.runTransaction("Locally write mutations","readwrite",w=>{let C=tt(),D=X();return u.Os.getEntries(w,f).next(P=>{C=P,C.forEach((F,L)=>{L.isValidDocument()||(D=D.add(F))})}).next(()=>u.localDocuments.getOverlayedDocuments(w,C)).next(P=>{m=P;const F=[];for(const L of c){const O=XA(L,m.get(L.key).overlayedDocument);O!=null&&F.push(new Nn(L.key,O,Xg(O.value.mapValue),nt.exists(!0)))}return u.mutationQueue.addMutationBatch(w,h,F,c)}).next(P=>{p=P;const F=P.applyToLocalDocumentSet(m,D);return u.documentOverlayCache.saveOverlays(w,P.batchId,F)})}).then(()=>({batchId:p.batchId,changes:h_(m)}))}(r.localStore,e);r.sharedClientState.addPendingMutation(s.batchId),function(o,c,u){let h=o.Ru[o.currentUser.toKey()];h||(h=new fe(Q)),h=h.insert(c,u),o.Ru[o.currentUser.toKey()]=h}(r,s.batchId,t),await Mn(r,s.changes),await Ls(r.remoteStore)}catch(s){const i=th(s,"Failed to persist write");t.reject(i)}}async function Ty(n,e){const t=z(n);try{const r=await H0(t.localStore,e);e.targetChanges.forEach((s,i)=>{const o=t.Eu.get(i);o&&(G(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1,22616),s.addedDocuments.size>0?o.lu=!0:s.modifiedDocuments.size>0?G(o.lu,14607):s.removedDocuments.size>0&&(G(o.lu,42227),o.lu=!1))}),await Mn(t,r,e)}catch(r){await On(r)}}function Om(n,e,t){const r=z(n);if(r.isPrimaryClient&&t===0||!r.isPrimaryClient&&t===1){const s=[];r.Pu.forEach((i,o)=>{const c=o.view.va(e);c.snapshot&&s.push(c.snapshot)}),function(o,c){const u=z(o);u.onlineState=c;let h=!1;u.queries.forEach((f,m)=>{for(const p of m.wa)p.va(c)&&(h=!0)}),h&&nh(u)}(r.eventManager,e),s.length&&r.hu.J_(s),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function CS(n,e,t){const r=z(n);r.sharedClientState.updateQueryState(e,"rejected",t);const s=r.Eu.get(e),i=s&&s.key;if(i){let o=new fe($.comparator);o=o.insert(i,Ie.newNoDocument(i,K.min()));const c=X().add(i),u=new fo(K.min(),new Map,new fe(Q),o,c);await Ty(r,u),r.du=r.du.remove(i),r.Eu.delete(e),oh(r)}else await Ss(r.localStore,e,!1).then(()=>Cs(r,e,t)).catch(On)}async function DS(n,e){const t=z(n),r=e.batch.batchId;try{const s=await W0(t.localStore,e);ih(t,r,null),sh(t,r),t.sharedClientState.updateMutationState(r,"acknowledged"),await Mn(t,s)}catch(s){await On(s)}}async function kS(n,e,t){const r=z(n);try{const s=await function(o,c){const u=z(o);return u.persistence.runTransaction("Reject batch","readwrite-primary",h=>{let f;return u.mutationQueue.lookupMutationBatch(h,c).next(m=>(G(m!==null,37113),f=m.keys(),u.mutationQueue.removeMutationBatch(h,m))).next(()=>u.mutationQueue.performConsistencyCheck(h)).next(()=>u.documentOverlayCache.removeOverlaysForBatchId(h,f,c)).next(()=>u.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(h,f)).next(()=>u.localDocuments.getDocuments(h,f))})}(r.localStore,e);ih(r,e,t),sh(r,e),r.sharedClientState.updateMutationState(e,"rejected",t),await Mn(r,s)}catch(s){await On(s)}}function sh(n,e){(n.Vu.get(e)||[]).forEach(t=>{t.resolve()}),n.Vu.delete(e)}function ih(n,e,t){const r=z(n);let s=r.Ru[r.currentUser.toKey()];if(s){const i=s.get(e);i&&(t?i.reject(t):i.resolve(),s=s.remove(e)),r.Ru[r.currentUser.toKey()]=s}}function Cs(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const r of n.Tu.get(e))n.Pu.delete(r),t&&n.hu.pu(r,t);n.Tu.delete(e),n.isPrimaryClient&&n.Au.zr(e).forEach(r=>{n.Au.containsKey(r)||by(n,r)})}function by(n,e){n.Iu.delete(e.path.canonicalString());const t=n.du.get(e);t!==null&&(Ps(n.remoteStore,t),n.du=n.du.remove(e),n.Eu.delete(t),oh(n))}function al(n,e,t){for(const r of t)r instanceof Iy?(n.Au.addReference(r.key,e),VS(n,r)):r instanceof wy?(x(Bs,"Document no longer in limbo: "+r.key),n.Au.removeReference(r.key,e),n.Au.containsKey(r.key)||by(n,r.key)):q(19791,{yu:r})}function VS(n,e){const t=e.key,r=t.path.canonicalString();n.du.get(t)||n.Iu.has(r)||(x(Bs,"New document in limbo: "+t),n.Iu.add(r),oh(n))}function oh(n){for(;n.Iu.size>0&&n.du.size<n.maxConcurrentLimboResolutions;){const e=n.Iu.values().next().value;n.Iu.delete(e);const t=new $(se.fromString(e)),r=n.mu.next();n.Eu.set(r,new ES(t)),n.du=n.du.insert(t,r),fc(n.remoteStore,new Ut(rt(sc(t.path)),r,"TargetPurposeLimboResolution",Ye.ue))}}async function Mn(n,e,t){const r=z(n),s=[],i=[],o=[];r.Pu.isEmpty()||(r.Pu.forEach((c,u)=>{o.push(r.gu(u,e,t).then(h=>{var f;if((h||t)&&r.isPrimaryClient){const m=h?!h.fromCache:(f=t==null?void 0:t.targetChanges.get(u.targetId))===null||f===void 0?void 0:f.current;r.sharedClientState.updateQueryState(u.targetId,m?"current":"not-current")}if(h){s.push(h);const m=Kl.Es(u.targetId,h);i.push(m)}}))}),await Promise.all(o),r.hu.J_(s),await async function(u,h){const f=z(u);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",m=>A.forEach(h,p=>A.forEach(p.Is,w=>f.persistence.referenceDelegate.addReference(m,p.targetId,w)).next(()=>A.forEach(p.ds,w=>f.persistence.referenceDelegate.removeReference(m,p.targetId,w)))))}catch(m){if(!xn(m))throw m;x(Ql,"Failed to update sequence numbers: "+m)}for(const m of h){const p=m.targetId;if(!m.fromCache){const w=f.Fs.get(p),C=w.snapshotVersion,D=w.withLastLimboFreeSnapshotVersion(C);f.Fs=f.Fs.insert(p,D)}}}(r.localStore,i))}async function OS(n,e){const t=z(n);if(!t.currentUser.isEqual(e)){x(Bs,"User change. New user:",e.toKey());const r=await ey(t.localStore,e);t.currentUser=e,function(i,o){i.Vu.forEach(c=>{c.forEach(u=>{u.reject(new M(V.CANCELLED,o))})}),i.Vu.clear()}(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await Mn(t,r.Bs)}}function xS(n,e){const t=z(n),r=t.Eu.get(e);if(r&&r.lu)return X().add(r.key);{let s=X();const i=t.Tu.get(e);if(!i)return s;for(const o of i){const c=t.Pu.get(o);s=s.unionWith(c.view.tu)}return s}}async function NS(n,e){const t=z(n),r=await nl(t.localStore,e.query,!0),s=e.view.uu(r);return t.isPrimaryClient&&al(t,e.targetId,s._u),s}async function MS(n,e){const t=z(n);return ry(t.localStore,e).then(r=>Mn(t,r))}async function FS(n,e,t,r){const s=z(n),i=await function(c,u){const h=z(c),f=z(h.mutationQueue);return h.persistence.runTransaction("Lookup mutation documents","readonly",m=>f.Xn(m,u).next(p=>p?h.localDocuments.getDocuments(m,p):A.resolve(null)))}(s.localStore,e);i!==null?(t==="pending"?await Ls(s.remoteStore):t==="acknowledged"||t==="rejected"?(ih(s,e,r||null),sh(s,e),function(c,u){z(z(c).mutationQueue).rr(u)}(s.localStore,e)):q(6720,"Unknown batchState",{wu:t}),await Mn(s,i)):x(Bs,"Cannot apply mutation batch with id: "+e)}async function LS(n,e){const t=z(n);if(mc(t),ah(t),e===!0&&t.fu!==!0){const r=t.sharedClientState.getAllActiveQueryTargets(),s=await xm(t,r.toArray());t.fu=!0,await il(t.remoteStore,!0);for(const i of s)fc(t.remoteStore,i)}else if(e===!1&&t.fu!==!1){const r=[];let s=Promise.resolve();t.Tu.forEach((i,o)=>{t.sharedClientState.isLocalQueryTarget(o)?r.push(o):s=s.then(()=>(Cs(t,o),Ss(t.localStore,o,!0))),Ps(t.remoteStore,o)}),await s,await xm(t,r),function(o){const c=z(o);c.Eu.forEach((u,h)=>{Ps(c.remoteStore,h)}),c.Au.jr(),c.Eu=new Map,c.du=new fe($.comparator)}(t),t.fu=!1,await il(t.remoteStore,!1)}}async function xm(n,e,t){const r=z(n),s=[],i=[];for(const o of e){let c;const u=r.Tu.get(o);if(u&&u.length!==0){c=await Oa(r.localStore,rt(u[0]));for(const h of u){const f=r.Pu.get(h),m=await NS(r,f);m.snapshot&&i.push(m.snapshot)}}else{const h=await ny(r.localStore,o);c=await Oa(r.localStore,h),await rh(r,Ay(h),o,!1,c.resumeToken)}s.push(c)}return r.hu.J_(i),s}function Ay(n){return i_(n.path,n.collectionGroup,n.orderBy,n.filters,n.limit,"F",n.startAt,n.endAt)}function US(n){return function(t){return z(z(t).persistence).Ps()}(z(n).localStore)}async function BS(n,e,t,r){const s=z(n);if(s.fu)return void x(Bs,"Ignoring unexpected query state notification.");const i=s.Tu.get(e);if(i&&i.length>0)switch(t){case"current":case"not-current":{const o=await ry(s.localStore,c_(i[0])),c=fo.createSynthesizedRemoteEventForCurrentChange(e,t==="current",Ee.EMPTY_BYTE_STRING);await Mn(s,o,c);break}case"rejected":await Ss(s.localStore,e,!0),Cs(s,e,r);break;default:q(64155,t)}}async function jS(n,e,t){const r=mc(n);if(r.fu){for(const s of e){if(r.Tu.has(s)&&r.sharedClientState.isActiveQueryTarget(s)){x(Bs,"Adding an already active target "+s);continue}const i=await ny(r.localStore,s),o=await Oa(r.localStore,i);await rh(r,Ay(i),o.targetId,!1,o.resumeToken),fc(r.remoteStore,o)}for(const s of t)r.Tu.has(s)&&await Ss(r.localStore,s,!1).then(()=>{Ps(r.remoteStore,s),Cs(r,s)}).catch(On)}}function mc(n){const e=z(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=Ty.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=xS.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=CS.bind(null,e),e.hu.J_=yS.bind(null,e.eventManager),e.hu.pu=vS.bind(null,e.eventManager),e}function ah(n){const e=z(n);return e.remoteStore.remoteSyncer.applySuccessfulWrite=DS.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=kS.bind(null,e),e}class Yi{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=hc(e.databaseInfo.databaseId),this.sharedClientState=this.bu(e),this.persistence=this.Du(e),await this.persistence.start(),this.localStore=this.vu(e),this.gcScheduler=this.Cu(e,this.localStore),this.indexBackfillerScheduler=this.Fu(e,this.localStore)}Cu(e,t){return null}Fu(e,t){return null}vu(e){return Z_(this.persistence,new J_,e.initialUser,this.serializer)}Du(e){return new Hl(lc.Vi,this.serializer)}bu(e){return new cy}async terminate(){var e,t;(e=this.gcScheduler)===null||e===void 0||e.stop(),(t=this.indexBackfillerScheduler)===null||t===void 0||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Yi.provider={build:()=>new Yi};class $S extends Yi{constructor(e){super(),this.cacheSizeBytes=e}Cu(e,t){G(this.persistence.referenceDelegate instanceof Va,46915);const r=this.persistence.referenceDelegate.garbageCollector;return new H_(r,e.asyncQueue,t)}Du(e){const t=this.cacheSizeBytes!==void 0?Le.withCacheSize(this.cacheSizeBytes):Le.DEFAULT;return new Hl(r=>Va.Vi(r,t),this.serializer)}}class Sy extends Yi{constructor(e,t,r){super(),this.Mu=e,this.cacheSizeBytes=t,this.forceOwnership=r,this.kind="persistent",this.synchronizeTabs=!1}async initialize(e){await super.initialize(e),await this.Mu.initialize(this,e),await ah(this.Mu.syncEngine),await Ls(this.Mu.remoteStore),await this.persistence.ji(()=>(this.gcScheduler&&!this.gcScheduler.started&&this.gcScheduler.start(),this.indexBackfillerScheduler&&!this.indexBackfillerScheduler.started&&this.indexBackfillerScheduler.start(),Promise.resolve()))}vu(e){return Z_(this.persistence,new J_,e.initialUser,this.serializer)}Cu(e,t){const r=this.persistence.referenceDelegate.garbageCollector;return new H_(r,e.asyncQueue,t)}Fu(e,t){const r=new eA(t,this.persistence);return new Zb(e.asyncQueue,r)}Du(e){const t=X_(e.databaseInfo.databaseId,e.databaseInfo.persistenceKey),r=this.cacheSizeBytes!==void 0?Le.withCacheSize(this.cacheSizeBytes):Le.DEFAULT;return new Gl(this.synchronizeTabs,t,e.clientId,r,e.asyncQueue,uy(),ca(),this.serializer,this.sharedClientState,!!this.forceOwnership)}bu(e){return new cy}}class qS extends Sy{constructor(e,t){super(e,t,!1),this.Mu=e,this.cacheSizeBytes=t,this.synchronizeTabs=!0}async initialize(e){await super.initialize(e);const t=this.Mu.syncEngine;this.sharedClientState instanceof au&&(this.sharedClientState.syncEngine={Do:FS.bind(null,t),vo:BS.bind(null,t),Co:jS.bind(null,t),Ps:US.bind(null,t),bo:MS.bind(null,t)},await this.sharedClientState.start()),await this.persistence.ji(async r=>{await LS(this.Mu.syncEngine,r),this.gcScheduler&&(r&&!this.gcScheduler.started?this.gcScheduler.start():r||this.gcScheduler.stop()),this.indexBackfillerScheduler&&(r&&!this.indexBackfillerScheduler.started?this.indexBackfillerScheduler.start():r||this.indexBackfillerScheduler.stop())})}bu(e){const t=uy();if(!au.C(t))throw new M(V.UNIMPLEMENTED,"IndexedDB persistence is only available on platforms that support LocalStorage.");const r=X_(e.databaseInfo.databaseId,e.databaseInfo.persistenceKey);return new au(t,e.asyncQueue,r,e.clientId,e.initialUser)}}class Xi{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>Om(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=OS.bind(null,this.syncEngine),await il(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new _S}()}createDatastore(e){const t=hc(e.databaseInfo.databaseId),r=function(i){return new Z0(i)}(e.databaseInfo);return function(i,o,c,u){return new rS(i,o,c,u)}(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){return function(r,s,i,o,c){return new iS(r,s,i,o,c)}(this.localStore,this.datastore,e.asyncQueue,t=>Om(this.syncEngine,t,0),function(){return Pm.C()?new Pm:new Q0}())}createSyncEngine(e,t){return function(s,i,o,c,u,h,f){const m=new TS(s,i,o,c,u,h);return f&&(m.fu=!0),m}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await async function(s){const i=z(s);x(Er,"RemoteStore shutting down."),i.Ia.add(5),await po(i),i.Ea.shutdown(),i.Aa.set("Unknown")}(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate(),(t=this.eventManager)===null||t===void 0||t.terminate()}}Xi.provider={build:()=>new Xi};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Py{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.xu(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.xu(this.observer.error,e):we("Uncaught Error in snapshot listener:",e.toString()))}Ou(){this.muted=!0}xu(e,t){setTimeout(()=>{this.muted||e(t)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kn="FirestoreClient";class zS{constructor(e,t,r,s,i){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this.databaseInfo=s,this.user=Ce.UNAUTHENTICATED,this.clientId=bl.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(r,async o=>{x(kn,"Received user=",o.uid),await this.authCredentialListener(o),this.user=o}),this.appCheckCredentials.start(r,o=>(x(kn,"Received new app check token=",o),this.appCheckCredentialListener(o,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Pt;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const r=th(t,"Failed to shutdown persistence");e.reject(r)}}),e.promise}}async function uu(n,e){n.asyncQueue.verifyOperationInProgress(),x(kn,"Initializing OfflineComponentProvider");const t=n.configuration;await e.initialize(t);let r=t.initialUser;n.setCredentialChangeListener(async s=>{r.isEqual(s)||(await ey(e.localStore,s),r=s)}),e.persistence.setDatabaseDeletedListener(()=>{qt("Terminating Firestore due to IndexedDb database deletion"),n.terminate().then(()=>{x("Terminating Firestore due to IndexedDb database deletion completed successfully")}).catch(s=>{qt("Terminating Firestore due to IndexedDb database deletion failed",s)})}),n._offlineComponents=e}async function Nm(n,e){n.asyncQueue.verifyOperationInProgress();const t=await WS(n);x(kn,"Initializing OnlineComponentProvider"),await e.initialize(t,n.configuration),n.setCredentialChangeListener(r=>Cm(e.remoteStore,r)),n.setAppCheckTokenChangeListener((r,s)=>Cm(e.remoteStore,s)),n._onlineComponents=e}async function WS(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){x(kn,"Using user provided OfflineComponentProvider");try{await uu(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!function(s){return s.name==="FirebaseError"?s.code===V.FAILED_PRECONDITION||s.code===V.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11}(t))throw t;qt("Error using user provided cache. Falling back to memory cache: "+t),await uu(n,new Yi)}}else x(kn,"Using default OfflineComponentProvider"),await uu(n,new $S(void 0));return n._offlineComponents}async function Ry(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(x(kn,"Using user provided OnlineComponentProvider"),await Nm(n,n._uninitializedComponentsProvider._online)):(x(kn,"Using default OnlineComponentProvider"),await Nm(n,new Xi))),n._onlineComponents}function HS(n){return Ry(n).then(e=>e.syncEngine)}async function Cy(n){const e=await Ry(n),t=e.eventManager;return t.onListen=bS.bind(null,e.syncEngine),t.onUnlisten=SS.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=AS.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=PS.bind(null,e.syncEngine),t}function GS(n,e,t={}){const r=new Pt;return n.asyncQueue.enqueueAndForget(async()=>function(i,o,c,u,h){const f=new Py({next:p=>{f.Ou(),o.enqueueAndForget(()=>yy(i,m));const w=p.docs.has(c);!w&&p.fromCache?h.reject(new M(V.UNAVAILABLE,"Failed to get document because the client is offline.")):w&&p.fromCache&&u&&u.source==="server"?h.reject(new M(V.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):h.resolve(p)},error:p=>h.reject(p)}),m=new vy(sc(c.path),f,{includeMetadataChanges:!0,ka:!0});return _y(i,m)}(await Cy(n),n.asyncQueue,e,t,r)),r.promise}function KS(n,e,t={}){const r=new Pt;return n.asyncQueue.enqueueAndForget(async()=>function(i,o,c,u,h){const f=new Py({next:p=>{f.Ou(),o.enqueueAndForget(()=>yy(i,m)),p.fromCache&&u.source==="server"?h.reject(new M(V.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):h.resolve(p)},error:p=>h.reject(p)}),m=new vy(c,f,{includeMetadataChanges:!0,ka:!0});return _y(i,m)}(await Cy(n),n.asyncQueue,e,t,r)),r.promise}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Dy(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Mm=new Map;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ky="firestore.googleapis.com",Fm=!0;class Lm{constructor(e){var t,r;if(e.host===void 0){if(e.ssl!==void 0)throw new M(V.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=ky,this.ssl=Fm}else this.host=e.host,this.ssl=(t=e.ssl)!==null&&t!==void 0?t:Fm;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=j_;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<W_)throw new M(V.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}Qb("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Dy((r=e.experimentalLongPollingOptions)!==null&&r!==void 0?r:{}),function(i){if(i.timeoutSeconds!==void 0){if(isNaN(i.timeoutSeconds))throw new M(V.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (must not be NaN)`);if(i.timeoutSeconds<5)throw new M(V.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (minimum allowed value is 5)`);if(i.timeoutSeconds>30)throw new M(V.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,s){return r.timeoutSeconds===s.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class pc{constructor(e,t,r,s){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Lm({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new M(V.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new M(V.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Lm(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new Bb;switch(r.type){case"firstParty":return new zb(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new M(V.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const r=Mm.get(t);r&&(x("ComponentProvider","Removing Datastore"),Mm.delete(t),r.terminate())}(this),Promise.resolve()}}function QS(n,e,t,r={}){var s;n=gr(n,pc);const i=Qa(e),o=n._getSettings(),c=Object.assign(Object.assign({},o),{emulatorOptions:n._getEmulatorOptions()}),u=`${e}:${t}`;i&&(cg(`https://${u}`),Rb("Firestore",!0)),o.host!==ky&&o.host!==u&&qt("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const h=Object.assign(Object.assign({},o),{host:u,ssl:i,emulatorOptions:r});if(!El(h,c)&&(n._setSettings(h),r.mockUserToken)){let f,m;if(typeof r.mockUserToken=="string")f=r.mockUserToken,m=Ce.MOCK_USER;else{f=Ab(r.mockUserToken,(s=n._app)===null||s===void 0?void 0:s.options.projectId);const p=r.mockUserToken.sub||r.mockUserToken.user_id;if(!p)throw new M(V.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");m=new Ce(p)}n._authCredentials=new jb(new wg(f,m))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fn{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new Fn(this.firestore,e,this._query)}}class Ae{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Sn(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new Ae(this.firestore,e,this._key)}toJSON(){return{type:Ae._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,r){if(co(t,Ae._jsonSchema))return new Ae(e,r||null,new $(se.fromString(t.referencePath)))}}Ae._jsonSchemaVersion="firestore/documentReference/1.0",Ae._jsonSchema={type:be("string",Ae._jsonSchemaVersion),referencePath:be("string")};class Sn extends Fn{constructor(e,t,r){super(e,t,sc(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new Ae(this.firestore,null,new $(e))}withConverter(e){return new Sn(this.firestore,e,this._path)}}function ch(n,e,...t){if(n=hs(n),bg("collection","path",e),n instanceof pc){const r=se.fromString(e,...t);return Rf(r),new Sn(n,null,r)}{if(!(n instanceof Ae||n instanceof Sn))throw new M(V.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(se.fromString(e,...t));return Rf(r),new Sn(n.firestore,null,r)}}function _t(n,e,...t){if(n=hs(n),arguments.length===1&&(e=bl.newId()),bg("doc","path",e),n instanceof pc){const r=se.fromString(e,...t);return Pf(r),new Ae(n,null,new $(r))}{if(!(n instanceof Ae||n instanceof Sn))throw new M(V.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(se.fromString(e,...t));return Pf(r),new Ae(n.firestore,n instanceof Sn?n.converter:null,new $(r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Um="AsyncQueue";class Bm{constructor(e=Promise.resolve()){this.Zu=[],this.Xu=!1,this.ec=[],this.tc=null,this.nc=!1,this.rc=!1,this.sc=[],this.F_=new ly(this,"async_queue_retry"),this.oc=()=>{const r=ca();r&&x(Um,"Visibility state changed to "+r.visibilityState),this.F_.y_()},this._c=e;const t=ca();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.oc)}get isShuttingDown(){return this.Xu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.ac(),this.uc(e)}enterRestrictedMode(e){if(!this.Xu){this.Xu=!0,this.rc=e||!1;const t=ca();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.oc)}}enqueue(e){if(this.ac(),this.Xu)return new Promise(()=>{});const t=new Pt;return this.uc(()=>this.Xu&&this.rc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Zu.push(e),this.cc()))}async cc(){if(this.Zu.length!==0){try{await this.Zu[0](),this.Zu.shift(),this.F_.reset()}catch(e){if(!xn(e))throw e;x(Um,"Operation failed with retryable error: "+e)}this.Zu.length>0&&this.F_.g_(()=>this.cc())}}uc(e){const t=this._c.then(()=>(this.nc=!0,e().catch(r=>{throw this.tc=r,this.nc=!1,we("INTERNAL UNHANDLED ERROR: ",jm(r)),r}).then(r=>(this.nc=!1,r))));return this._c=t,t}enqueueAfterDelay(e,t,r){this.ac(),this.sc.indexOf(e)>-1&&(t=0);const s=eh.createAndSchedule(this,e,t,r,i=>this.lc(i));return this.ec.push(s),s}ac(){this.tc&&q(47125,{hc:jm(this.tc)})}verifyOperationInProgress(){}async Pc(){let e;do e=this._c,await e;while(e!==this._c)}Tc(e){for(const t of this.ec)if(t.timerId===e)return!0;return!1}Ic(e){return this.Pc().then(()=>{this.ec.sort((t,r)=>t.targetTimeMs-r.targetTimeMs);for(const t of this.ec)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.Pc()})}dc(e){this.sc.push(e)}lc(e){const t=this.ec.indexOf(e);this.ec.splice(t,1)}}function jm(n){let e=n.message||"";return n.stack&&(e=n.stack.includes(n.message)?n.stack:n.message+`
`+n.stack),e}class gc extends pc{constructor(e,t,r,s){super(e,t,r,s),this.type="firestore",this._queue=new Bm,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Bm(e),this._firestoreClient=void 0,await e}}}function YS(n,e,t){t||(t=zi);const r=Ka(n,"firestore");if(r.isInitialized(t)){const s=r.getImmediate({identifier:t}),i=r.getOptions(t);if(El(i,e))return s;throw new M(V.FAILED_PRECONDITION,"initializeFirestore() has already been called with different options. To avoid this error, call initializeFirestore() with the same options as when it was originally called, or call getFirestore() to return the already initialized instance.")}if(e.cacheSizeBytes!==void 0&&e.localCache!==void 0)throw new M(V.INVALID_ARGUMENT,"cache and cacheSizeBytes cannot be specified at the same time as cacheSizeBytes willbe deprecated. Instead, specify the cache size in the cache object");if(e.cacheSizeBytes!==void 0&&e.cacheSizeBytes!==-1&&e.cacheSizeBytes<W_)throw new M(V.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");return e.host&&Qa(e.host)&&cg(e.host),r.initialize({options:e,instanceIdentifier:t})}function XS(n,e){const t=typeof n=="object"?n:wl(),r=typeof n=="string"?n:zi,s=Ka(t,"firestore").getImmediate({identifier:r});if(!s._initialized){const i=bb("firestore");i&&QS(s,...i)}return s}function uh(n){if(n._terminated)throw new M(V.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||JS(n),n._firestoreClient}function JS(n){var e,t,r;const s=n._freezeSettings(),i=function(c,u,h,f){return new RA(c,u,h,f.host,f.ssl,f.experimentalForceLongPolling,f.experimentalAutoDetectLongPolling,Dy(f.experimentalLongPollingOptions),f.useFetchStreams,f.isUsingEmulator)}(n._databaseId,((e=n._app)===null||e===void 0?void 0:e.options.appId)||"",n._persistenceKey,s);n._componentsProvider||!((t=s.localCache)===null||t===void 0)&&t._offlineComponentProvider&&(!((r=s.localCache)===null||r===void 0)&&r._onlineComponentProvider)&&(n._componentsProvider={_offline:s.localCache._offlineComponentProvider,_online:s.localCache._onlineComponentProvider}),n._firestoreClient=new zS(n._authCredentials,n._appCheckCredentials,n._queue,i,n._componentsProvider&&function(c){const u=c==null?void 0:c._online.build();return{_offline:c==null?void 0:c._offline.build(u),_online:u}}(n._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class at{constructor(e){this._byteString=e}static fromBase64String(e){try{return new at(Ee.fromBase64String(e))}catch(t){throw new M(V.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new at(Ee.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:at._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(co(e,at._jsonSchema))return at.fromBase64String(e.bytes)}}at._jsonSchemaVersion="firestore/bytes/1.0",at._jsonSchema={type:be("string",at._jsonSchemaVersion),bytes:be("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lh{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new M(V.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new _e(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hh{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rt{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new M(V.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new M(V.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return Q(this._lat,e._lat)||Q(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:Rt._jsonSchemaVersion}}static fromJSON(e){if(co(e,Rt._jsonSchema))return new Rt(e.latitude,e.longitude)}}Rt._jsonSchemaVersion="firestore/geoPoint/1.0",Rt._jsonSchema={type:be("string",Rt._jsonSchemaVersion),latitude:be("number"),longitude:be("number")};/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ct{constructor(e){this._values=(e||[]).map(t=>t)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(r,s){if(r.length!==s.length)return!1;for(let i=0;i<r.length;++i)if(r[i]!==s[i])return!1;return!0}(this._values,e._values)}toJSON(){return{type:Ct._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(co(e,Ct._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(t=>typeof t=="number"))return new Ct(e.vectorValues);throw new M(V.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}Ct._jsonSchemaVersion="firestore/vectorValue/1.0",Ct._jsonSchema={type:be("string",Ct._jsonSchemaVersion),vectorValues:be("object")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ZS=/^__.*__$/;class e1{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return this.fieldMask!==null?new Nn(e,this.data,this.fieldMask,t,this.fieldTransforms):new Fs(e,this.data,t,this.fieldTransforms)}}function Vy(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw q(40011,{Ec:n})}}class dh{constructor(e,t,r,s,i,o){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=s,i===void 0&&this.Ac(),this.fieldTransforms=i||[],this.fieldMask=o||[]}get path(){return this.settings.path}get Ec(){return this.settings.Ec}Rc(e){return new dh(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Vc(e){var t;const r=(t=this.path)===null||t===void 0?void 0:t.child(e),s=this.Rc({path:r,mc:!1});return s.fc(e),s}gc(e){var t;const r=(t=this.path)===null||t===void 0?void 0:t.child(e),s=this.Rc({path:r,mc:!1});return s.Ac(),s}yc(e){return this.Rc({path:void 0,mc:!0})}wc(e){return Fa(e,this.settings.methodName,this.settings.Sc||!1,this.path,this.settings.bc)}contains(e){return this.fieldMask.find(t=>e.isPrefixOf(t))!==void 0||this.fieldTransforms.find(t=>e.isPrefixOf(t.field))!==void 0}Ac(){if(this.path)for(let e=0;e<this.path.length;e++)this.fc(this.path.get(e))}fc(e){if(e.length===0)throw this.wc("Document fields must not be empty");if(Vy(this.Ec)&&ZS.test(e))throw this.wc('Document fields cannot begin and end with "__"')}}class t1{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||hc(e)}Dc(e,t,r,s=!1){return new dh({Ec:e,methodName:t,bc:r,path:_e.emptyPath(),mc:!1,Sc:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Oy(n){const e=n._freezeSettings(),t=hc(n._databaseId);return new t1(n._databaseId,!!e.ignoreUndefinedProperties,t)}function n1(n,e,t,r,s,i={}){const o=n.Dc(i.merge||i.mergeFields?2:0,e,t,s);My("Data must be an object, but it was:",o,r);const c=xy(r,o);let u,h;if(i.merge)u=new ct(o.fieldMask),h=o.fieldTransforms;else if(i.mergeFields){const f=[];for(const m of i.mergeFields){const p=s1(e,m,t);if(!o.contains(p))throw new M(V.INVALID_ARGUMENT,`Field '${p}' is specified in your field mask but missing from your input data.`);o1(f,p)||f.push(p)}u=new ct(f),h=o.fieldTransforms.filter(m=>u.covers(m.field))}else u=null,h=o.fieldTransforms;return new e1(new Qe(c),u,h)}class fh extends hh{_toFieldTransform(e){return new y_(e.path,new Es)}isEqual(e){return e instanceof fh}}function r1(n,e,t,r=!1){return mh(t,n.Dc(r?4:3,e))}function mh(n,e){if(Ny(n=hs(n)))return My("Unsupported field value:",e,n),xy(n,e);if(n instanceof hh)return function(r,s){if(!Vy(s.Ec))throw s.wc(`${r._methodName}() can only be used with update() and set()`);if(!s.path)throw s.wc(`${r._methodName}() is not currently supported inside arrays`);const i=r._toFieldTransform(s);i&&s.fieldTransforms.push(i)}(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.mc&&e.Ec!==4)throw e.wc("Nested arrays are not supported");return function(r,s){const i=[];let o=0;for(const c of r){let u=mh(c,s.yc(o));u==null&&(u={nullValue:"NULL_VALUE"}),i.push(u),o++}return{arrayValue:{values:i}}}(n,e)}return function(r,s){if((r=hs(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return WA(s.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const i=ae.fromDate(r);return{timestampValue:As(s.serializer,i)}}if(r instanceof ae){const i=new ae(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:As(s.serializer,i)}}if(r instanceof Rt)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof at)return{bytesValue:A_(s.serializer,r._byteString)};if(r instanceof Ae){const i=s.databaseId,o=r.firestore._databaseId;if(!o.isEqual(i))throw s.wc(`Document reference is for database ${o.projectId}/${o.database} but should be for database ${i.projectId}/${i.database}`);return{referenceValue:$l(r.firestore._databaseId||s.databaseId,r._key.path)}}if(r instanceof Ct)return function(o,c){return{mapValue:{fields:{[Vl]:{stringValue:Ol},[ys]:{arrayValue:{values:o.toArray().map(h=>{if(typeof h!="number")throw c.wc("VectorValues must only contain numeric values.");return Ml(c.serializer,h)})}}}}}}(r,s);throw s.wc(`Unsupported field value: ${Ya(r)}`)}(n,e)}function xy(n,e){const t={};return $g(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Ar(n,(r,s)=>{const i=mh(s,e.Vc(r));i!=null&&(t[r]=i)}),{mapValue:{fields:t}}}function Ny(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof ae||n instanceof Rt||n instanceof at||n instanceof Ae||n instanceof hh||n instanceof Ct)}function My(n,e,t){if(!Ny(t)||!Ag(t)){const r=Ya(t);throw r==="an object"?e.wc(n+" a custom object"):e.wc(n+" "+r)}}function s1(n,e,t){if((e=hs(e))instanceof lh)return e._internalPath;if(typeof e=="string")return Fy(n,e);throw Fa("Field path arguments must be of type string or ",n,!1,void 0,t)}const i1=new RegExp("[~\\*/\\[\\]]");function Fy(n,e,t){if(e.search(i1)>=0)throw Fa(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new lh(...e.split("."))._internalPath}catch{throw Fa(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function Fa(n,e,t,r,s){const i=r&&!r.isEmpty(),o=s!==void 0;let c=`Function ${e}() called with invalid data`;t&&(c+=" (via `toFirestore()`)"),c+=". ";let u="";return(i||o)&&(u+=" (found",i&&(u+=` in field ${r}`),o&&(u+=` in document ${s}`),u+=")"),new M(V.INVALID_ARGUMENT,c+n+u)}function o1(n,e){return n.some(t=>t.isEqual(e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ly{constructor(e,t,r,s,i){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new Ae(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new a1(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const t=this._document.data.field(_c("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class a1 extends Ly{data(){return super.data()}}function _c(n,e){return typeof e=="string"?Fy(n,e):e instanceof lh?e._internalPath:e._delegate._internalPath}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function c1(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new M(V.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class ph{}class gh extends ph{}function _h(n,e,...t){let r=[];e instanceof ph&&r.push(e),r=r.concat(t),function(i){const o=i.filter(u=>u instanceof yh).length,c=i.filter(u=>u instanceof yc).length;if(o>1||o>0&&c>0)throw new M(V.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(r);for(const s of r)n=s._apply(n);return n}class yc extends gh{constructor(e,t,r){super(),this._field=e,this._op=t,this._value=r,this.type="where"}static _create(e,t,r){return new yc(e,t,r)}_apply(e){const t=this._parse(e);return By(e._query,t),new Fn(e.firestore,e.converter,Ku(e._query,t))}_parse(e){const t=Oy(e.firestore);return function(i,o,c,u,h,f,m){let p;if(h.isKeyField()){if(f==="array-contains"||f==="array-contains-any")throw new M(V.INVALID_ARGUMENT,`Invalid Query. You can't perform '${f}' queries on documentId().`);if(f==="in"||f==="not-in"){qm(m,f);const C=[];for(const D of m)C.push($m(u,i,D));p={arrayValue:{values:C}}}else p=$m(u,i,m)}else f!=="in"&&f!=="not-in"&&f!=="array-contains-any"||qm(m,f),p=r1(c,o,m,f==="in"||f==="not-in");return Z.create(h,f,p)}(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}}function Uy(n,e,t){const r=e,s=_c("where",n);return yc._create(s,r,t)}class yh extends ph{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new yh(e,t)}_parse(e){const t=this._queryConstraints.map(r=>r._parse(e)).filter(r=>r.getFilters().length>0);return t.length===1?t[0]:ce.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return t.getFilters().length===0?e:(function(s,i){let o=s;const c=i.getFlattenedFilters();for(const u of c)By(o,u),o=Ku(o,u)}(e._query,t),new Fn(e.firestore,e.converter,Ku(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class vh extends gh{constructor(e,t){super(),this._field=e,this._direction=t,this.type="orderBy"}static _create(e,t){return new vh(e,t)}_apply(e){const t=function(s,i,o){if(s.startAt!==null)throw new M(V.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(s.endAt!==null)throw new M(V.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new Ki(i,o)}(e._query,this._field,this._direction);return new Fn(e.firestore,e.converter,function(s,i){const o=s.explicitOrderBy.concat([i]);return new Ms(s.path,s.collectionGroup,o,s.filters.slice(),s.limit,s.limitType,s.startAt,s.endAt)}(e._query,t))}}function u1(n,e="asc"){const t=e,r=_c("orderBy",n);return vh._create(r,t)}class Ih extends gh{constructor(e,t,r){super(),this.type=e,this._limit=t,this._limitType=r}static _create(e,t,r){return new Ih(e,t,r)}_apply(e){return new Fn(e.firestore,e.converter,Sa(e._query,this._limit,this._limitType))}}function l1(n){return Yb("limit",n),Ih._create("limit",n,"F")}function $m(n,e,t){if(typeof(t=hs(t))=="string"){if(t==="")throw new M(V.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!o_(e)&&t.indexOf("/")!==-1)throw new M(V.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);const r=e.path.child(se.fromString(t));if(!$.isDocumentKey(r))throw new M(V.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return Hi(n,new $(r))}if(t instanceof Ae)return Hi(n,t._key);throw new M(V.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${Ya(t)}.`)}function qm(n,e){if(!Array.isArray(n)||n.length===0)throw new M(V.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function By(n,e){const t=function(s,i){for(const o of s)for(const c of o.getFlattenedFilters())if(i.indexOf(c.op)>=0)return c.op;return null}(n.filters,function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(t!==null)throw t===e.op?new M(V.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new M(V.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}class h1{convertValue(e,t="none"){switch(Rn(e)){case 0:return null;case 1:return e.booleanValue;case 2:return ge(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(Wt(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw q(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const r={};return Ar(e,(s,i)=>{r[s]=this.convertValue(i,t)}),r}convertVectorValue(e){var t,r,s;const i=(s=(r=(t=e.fields)===null||t===void 0?void 0:t[ys].arrayValue)===null||r===void 0?void 0:r.values)===null||s===void 0?void 0:s.map(o=>ge(o.doubleValue));return new Ct(i)}convertGeoPoint(e){return new Rt(ge(e.latitude),ge(e.longitude))}convertArray(e,t){return(e.values||[]).map(r=>this.convertValue(r,t))}convertServerTimestamp(e,t){switch(t){case"previous":const r=nc(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(qi(e));default:return null}}convertTimestamp(e){const t=zt(e);return new ae(t.seconds,t.nanos)}convertDocumentKey(e,t){const r=se.fromString(e);G(N_(r),9688,{name:e});const s=new _r(r.get(1),r.get(3)),i=new $(r.popFirst(5));return s.isEqual(t)||we(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function d1(n,e,t){let r;return r=n?t&&(t.merge||t.mergeFields)?n.toFirestore(e,t):n.toFirestore(e):e,r}class vi{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class fr extends Ly{constructor(e,t,r,s,i,o){super(e,t,r,s,o),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new ua(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const r=this._document.data.field(_c("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new M(V.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=fr._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?t:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t)}}fr._jsonSchemaVersion="firestore/documentSnapshot/1.0",fr._jsonSchema={type:be("string",fr._jsonSchemaVersion),bundleSource:be("string","DocumentSnapshot"),bundleName:be("string"),bundle:be("string")};class ua extends fr{data(e={}){return super.data(e)}}class zr{constructor(e,t,r,s){this._firestore=e,this._userDataWriter=t,this._snapshot=s,this.metadata=new vi(s.hasPendingWrites,s.fromCache),this.query=r}get docs(){const e=[];return this.forEach(t=>e.push(t)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach(r=>{e.call(t,new ua(this._firestore,this._userDataWriter,r.key,r,new vi(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new M(V.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(s,i){if(s._snapshot.oldDocs.isEmpty()){let o=0;return s._snapshot.docChanges.map(c=>{const u=new ua(s._firestore,s._userDataWriter,c.doc.key,c.doc,new vi(s._snapshot.mutatedKeys.has(c.doc.key),s._snapshot.fromCache),s.query.converter);return c.doc,{type:"added",doc:u,oldIndex:-1,newIndex:o++}})}{let o=s._snapshot.oldDocs;return s._snapshot.docChanges.filter(c=>i||c.type!==3).map(c=>{const u=new ua(s._firestore,s._userDataWriter,c.doc.key,c.doc,new vi(s._snapshot.mutatedKeys.has(c.doc.key),s._snapshot.fromCache),s.query.converter);let h=-1,f=-1;return c.type!==0&&(h=o.indexOf(c.doc.key),o=o.delete(c.doc.key)),c.type!==1&&(o=o.add(c.doc),f=o.indexOf(c.doc.key)),{type:f1(c.type),doc:u,oldIndex:h,newIndex:f}})}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new M(V.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=zr._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=bl.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],r=[],s=[];return this.docs.forEach(i=>{i._document!==null&&(t.push(i._document),r.push(this._userDataWriter.convertObjectMap(i._document.data.value.mapValue.fields,"previous")),s.push(i.ref.path))}),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function f1(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return q(61501,{type:n})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function js(n){n=gr(n,Ae);const e=gr(n.firestore,gc);return GS(uh(e),n._key).then(t=>p1(e,n,t))}zr._jsonSchemaVersion="firestore/querySnapshot/1.0",zr._jsonSchema={type:be("string",zr._jsonSchemaVersion),bundleSource:be("string","QuerySnapshot"),bundleName:be("string"),bundle:be("string")};class jy extends h1{constructor(e){super(),this.firestore=e}convertBytes(e){return new at(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new Ae(this.firestore,null,t)}}function wh(n){n=gr(n,Fn);const e=gr(n.firestore,gc),t=uh(e),r=new jy(e);return c1(n._query),KS(t,n._query).then(s=>new zr(e,r,n,s))}function Ji(n,e,t){n=gr(n,Ae);const r=gr(n.firestore,gc),s=d1(n.converter,e,t);return m1(r,[n1(Oy(r),"setDoc",n._key,s,n.converter!==null,t).toMutation(n._key,nt.none())])}function m1(n,e){return function(r,s){const i=new Pt;return r.asyncQueue.enqueueAndForget(async()=>RS(await HS(r),s,i)),i.promise}(uh(n),e)}function p1(n,e,t){const r=t.docs.get(e._key),s=new jy(n);return new fr(n,s,e._key,r,new vi(t.hasPendingWrites,t.fromCache),e.converter)}class g1{constructor(e){let t;this.kind="persistent",e!=null&&e.tabManager?(e.tabManager._initialize(e),t=e.tabManager):(t=I1(),t._initialize(e)),this._onlineComponentProvider=t._onlineComponentProvider,this._offlineComponentProvider=t._offlineComponentProvider}toJSON(){return{kind:this.kind}}}function _1(n){return new g1(n)}class y1{constructor(e){this.forceOwnership=e,this.kind="persistentSingleTab"}toJSON(){return{kind:this.kind}}_initialize(e){this._onlineComponentProvider=Xi.provider,this._offlineComponentProvider={build:t=>new Sy(t,e==null?void 0:e.cacheSizeBytes,this.forceOwnership)}}}class v1{constructor(){this.kind="PersistentMultipleTab"}toJSON(){return{kind:this.kind}}_initialize(e){this._onlineComponentProvider=Xi.provider,this._offlineComponentProvider={build:t=>new qS(t,e==null?void 0:e.cacheSizeBytes)}}}function I1(n){return new y1(void 0)}function w1(){return new v1}function Zi(){return new fh("serverTimestamp")}(function(e,t=!0){(function(s){Ns=s})(xs),ls(new xb("firestore",(r,{instanceIdentifier:s,options:i})=>{const o=r.getProvider("app").getImmediate(),c=new gc(new $b(r.getProvider("auth-internal")),new Wb(o,r.getProvider("app-check-internal")),function(h,f){if(!Object.prototype.hasOwnProperty.apply(h.options,["projectId"]))throw new M(V.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new _r(h.options.projectId,f)}(o,s),o);return i=Object.assign({useFetchStreams:t},i),c._setSettings(i),c},"PUBLIC").setMultipleInstances(!0)),Tn(Ef,Tf,e),Tn(Ef,Tf,"esm2017")})();const E1=()=>{};var zm={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const T1=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},b1=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const s=n[t++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=n[t++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=n[t++],o=n[t++],c=n[t++],u=((s&7)<<18|(i&63)<<12|(o&63)<<6|c&63)-65536;e[r++]=String.fromCharCode(55296+(u>>10)),e[r++]=String.fromCharCode(56320+(u&1023))}else{const i=n[t++],o=n[t++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|o&63)}}return e.join("")},A1={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const i=n[s],o=s+1<n.length,c=o?n[s+1]:0,u=s+2<n.length,h=u?n[s+2]:0,f=i>>2,m=(i&3)<<4|c>>4;let p=(c&15)<<2|h>>6,w=h&63;u||(w=64,o||(p=64)),r.push(t[f],t[m],t[p],t[w])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(T1(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):b1(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const i=t[n.charAt(s++)],c=s<n.length?t[n.charAt(s)]:0;++s;const h=s<n.length?t[n.charAt(s)]:64;++s;const m=s<n.length?t[n.charAt(s)]:64;if(++s,i==null||c==null||h==null||m==null)throw new S1;const p=i<<2|c>>4;if(r.push(p),h!==64){const w=c<<4&240|h>>2;if(r.push(w),m!==64){const C=h<<6&192|m;r.push(C)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class S1 extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const $y=function(n){try{return A1.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function P1(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const R1=()=>P1().__FIREBASE_DEFAULTS__,C1=()=>{if(typeof process>"u"||typeof zm>"u")return;const n=zm.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},D1=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&$y(n[1]);return e&&JSON.parse(e)},qy=()=>{try{return E1()||R1()||C1()||D1()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},k1=n=>{var e,t;return(t=(e=qy())===null||e===void 0?void 0:e.emulatorHosts)===null||t===void 0?void 0:t[n]},zy=n=>{var e;return(e=qy())===null||e===void 0?void 0:e[`_${n}`]};/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vc(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch{return!1}}async function V1(n){return(await fetch(n,{credentials:"include"})).ok}const ki={};function O1(){const n={prod:[],emulator:[]};for(const e of Object.keys(ki))ki[e]?n.emulator.push(e):n.prod.push(e);return n}function x1(n){let e=document.getElementById(n),t=!1;return e||(e=document.createElement("div"),e.setAttribute("id",n),t=!0),{created:t,element:e}}let Wm=!1;function N1(n,e){if(typeof window>"u"||typeof document>"u"||!vc(window.location.host)||ki[n]===e||ki[n]||Wm)return;ki[n]=e;function t(p){return`__firebase__banner__${p}`}const r="__firebase__banner",i=O1().prod.length>0;function o(){const p=document.getElementById(r);p&&p.remove()}function c(p){p.style.display="flex",p.style.background="#7faaf0",p.style.position="fixed",p.style.bottom="5px",p.style.left="5px",p.style.padding=".5em",p.style.borderRadius="5px",p.style.alignItems="center"}function u(p,w){p.setAttribute("width","24"),p.setAttribute("id",w),p.setAttribute("height","24"),p.setAttribute("viewBox","0 0 24 24"),p.setAttribute("fill","none"),p.style.marginLeft="-6px"}function h(){const p=document.createElement("span");return p.style.cursor="pointer",p.style.marginLeft="16px",p.style.fontSize="24px",p.innerHTML=" &times;",p.onclick=()=>{Wm=!0,o()},p}function f(p,w){p.setAttribute("id",w),p.innerText="Learn more",p.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",p.setAttribute("target","__blank"),p.style.paddingLeft="5px",p.style.textDecoration="underline"}function m(){const p=x1(r),w=t("text"),C=document.getElementById(w)||document.createElement("span"),D=t("learnmore"),P=document.getElementById(D)||document.createElement("a"),F=t("preprendIcon"),L=document.getElementById(F)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(p.created){const O=p.element;c(O),f(P,D);const U=h();u(L,F),O.append(L,C,P,U),document.body.appendChild(O)}i?(C.innerText="Preview backend disconnected.",L.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):(L.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,C.innerText="Preview backend running in this workspace."),C.setAttribute("id",w)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",m):m()}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function We(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function M1(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(We())}function F1(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function L1(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function U1(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function B1(){const n=We();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const j1="FirebaseError";class $s extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=j1,Object.setPrototypeOf(this,$s.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Ic.prototype.create)}}class Ic{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],o=i?$1(i,r):"Error",c=`${this.serviceName}: ${o} (${s}).`;return new $s(s,c,r)}}function $1(n,e){return n.replace(q1,(t,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const q1=/\{\$([^}]+)}/g;function z1(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function La(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const s of t){if(!r.includes(s))return!1;const i=n[s],o=e[s];if(Hm(i)&&Hm(o)){if(!La(i,o))return!1}else if(i!==o)return!1}for(const s of r)if(!t.includes(s))return!1;return!0}function Hm(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function go(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(s=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function W1(n,e){const t=new H1(n,e);return t.subscribe.bind(t)}class H1{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let s;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");G1(e,["next","error","complete"])?s=e:s={next:e,error:t,complete:r},s.next===void 0&&(s.next=lu),s.error===void 0&&(s.error=lu),s.complete===void 0&&(s.complete=lu);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function G1(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function lu(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ln(n){return n&&n._delegate?n._delegate:n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var he;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(he||(he={}));const K1={debug:he.DEBUG,verbose:he.VERBOSE,info:he.INFO,warn:he.WARN,error:he.ERROR,silent:he.SILENT},Q1=he.INFO,Y1={[he.DEBUG]:"log",[he.VERBOSE]:"log",[he.INFO]:"info",[he.WARN]:"warn",[he.ERROR]:"error"},X1=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),s=Y1[e];if(s)console[s](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class J1{constructor(e){this.name=e,this._logLevel=Q1,this._logHandler=X1,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in he))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?K1[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,he.DEBUG,...e),this._logHandler(this,he.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,he.VERBOSE,...e),this._logHandler(this,he.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,he.INFO,...e),this._logHandler(this,he.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,he.WARN,...e),this._logHandler(this,he.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,he.ERROR,...e),this._logHandler(this,he.ERROR,...e)}}var Gm=function(){return Gm=Object.assign||function(e){for(var t,r=1,s=arguments.length;r<s;r++){t=arguments[r];for(var i in t)Object.prototype.hasOwnProperty.call(t,i)&&(e[i]=t[i])}return e},Gm.apply(this,arguments)};function Eh(n,e){var t={};for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&e.indexOf(r)<0&&(t[r]=n[r]);if(n!=null&&typeof Object.getOwnPropertySymbols=="function")for(var s=0,r=Object.getOwnPropertySymbols(n);s<r.length;s++)e.indexOf(r[s])<0&&Object.prototype.propertyIsEnumerable.call(n,r[s])&&(t[r[s]]=n[r[s]]);return t}function $C(n,e,t){if(t||arguments.length===2)for(var r=0,s=e.length,i;r<s;r++)(i||!(r in e))&&(i||(i=Array.prototype.slice.call(e,0,r)),i[r]=e[r]);return n.concat(i||Array.prototype.slice.call(e))}class Km{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}function Wy(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const Z1=Wy,Hy=new Ic("auth","Firebase",Wy());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ua=new J1("@firebase/auth");function eP(n,...e){Ua.logLevel<=he.WARN&&Ua.warn(`Auth (${xs}): ${n}`,...e)}function la(n,...e){Ua.logLevel<=he.ERROR&&Ua.error(`Auth (${xs}): ${n}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vt(n,...e){throw bh(n,...e)}function gt(n,...e){return bh(n,...e)}function Th(n,e,t){const r=Object.assign(Object.assign({},Z1()),{[e]:t});return new Ic("auth","Firebase",r).create(e,{appName:n.name})}function mr(n){return Th(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function tP(n,e,t){const r=t;if(!(e instanceof r))throw r.name!==e.constructor.name&&Vt(n,"argument-error"),Th(n,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function bh(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return Hy.create(n,...e)}function Y(n,e,...t){if(!n)throw bh(e,...t)}function Bt(n){const e="INTERNAL ASSERTION FAILED: "+n;throw la(e),new Error(e)}function Ht(n,e){n||Bt(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function cl(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.href)||""}function nP(){return Qm()==="http:"||Qm()==="https:"}function Qm(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rP(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(nP()||L1()||"connection"in navigator)?navigator.onLine:!0}function sP(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _o{constructor(e,t){this.shortDelay=e,this.longDelay=t,Ht(t>e,"Short delay should be less than long delay!"),this.isMobile=M1()||U1()}get(){return rP()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ah(n,e){Ht(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gy{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Bt("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Bt("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Bt("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const iP={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const oP=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],aP=new _o(3e4,6e4);function Sh(n,e){return n.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:n.tenantId}):e}async function qs(n,e,t,r,s={}){return Ky(n,s,async()=>{let i={},o={};r&&(e==="GET"?o=r:i={body:JSON.stringify(r)});const c=go(Object.assign({key:n.config.apiKey},o)).slice(1),u=await n._getAdditionalHeaders();u["Content-Type"]="application/json",n.languageCode&&(u["X-Firebase-Locale"]=n.languageCode);const h=Object.assign({method:e,headers:u},i);return F1()||(h.referrerPolicy="no-referrer"),n.emulatorConfig&&vc(n.emulatorConfig.host)&&(h.credentials="include"),Gy.fetch()(await Qy(n,n.config.apiHost,t,c),h)})}async function Ky(n,e,t){n._canInitEmulator=!1;const r=Object.assign(Object.assign({},iP),e);try{const s=new uP(n),i=await Promise.race([t(),s.promise]);s.clearNetworkTimeout();const o=await i.json();if("needConfirmation"in o)throw Xo(n,"account-exists-with-different-credential",o);if(i.ok&&!("errorMessage"in o))return o;{const c=i.ok?o.errorMessage:o.error.message,[u,h]=c.split(" : ");if(u==="FEDERATED_USER_ID_ALREADY_LINKED")throw Xo(n,"credential-already-in-use",o);if(u==="EMAIL_EXISTS")throw Xo(n,"email-already-in-use",o);if(u==="USER_DISABLED")throw Xo(n,"user-disabled",o);const f=r[u]||u.toLowerCase().replace(/[_\s]+/g,"-");if(h)throw Th(n,f,h);Vt(n,f)}}catch(s){if(s instanceof $s)throw s;Vt(n,"network-request-failed",{message:String(s)})}}async function cP(n,e,t,r,s={}){const i=await qs(n,e,t,r,s);return"mfaPendingCredential"in i&&Vt(n,"multi-factor-auth-required",{_serverResponse:i}),i}async function Qy(n,e,t,r){const s=`${e}${t}?${r}`,i=n,o=i.config.emulator?Ah(n.config,s):`${n.config.apiScheme}://${s}`;return oP.includes(t)&&(await i._persistenceManagerAvailable,i._getPersistenceType()==="COOKIE")?i._getPersistence()._getFinalTarget(o).toString():o}class uP{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(gt(this.auth,"network-request-failed")),aP.get())})}}function Xo(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const s=gt(n,e,r);return s.customData._tokenResponse=t,s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function lP(n,e){return qs(n,"POST","/v1/accounts:delete",e)}async function Ba(n,e){return qs(n,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vi(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function hP(n,e=!1){const t=Ln(n),r=await t.getIdToken(e),s=Ph(r);Y(s&&s.exp&&s.auth_time&&s.iat,t.auth,"internal-error");const i=typeof s.firebase=="object"?s.firebase:void 0,o=i==null?void 0:i.sign_in_provider;return{claims:s,token:r,authTime:Vi(hu(s.auth_time)),issuedAtTime:Vi(hu(s.iat)),expirationTime:Vi(hu(s.exp)),signInProvider:o||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}}function hu(n){return Number(n)*1e3}function Ph(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return la("JWT malformed, contained fewer than 3 sections"),null;try{const s=$y(t);return s?JSON.parse(s):(la("Failed to decode base64 JWT payload"),null)}catch(s){return la("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function Ym(n){const e=Ph(n);return Y(e,"internal-error"),Y(typeof e.exp<"u","internal-error"),Y(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function eo(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw r instanceof $s&&dP(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function dP({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fP{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var t;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const s=((t=this.user.stsTokenManager.expirationTime)!==null&&t!==void 0?t:0)-Date.now()-3e5;return Math.max(0,s)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ul{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=Vi(this.lastLoginAt),this.creationTime=Vi(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ja(n){var e;const t=n.auth,r=await n.getIdToken(),s=await eo(n,Ba(t,{idToken:r}));Y(s==null?void 0:s.users.length,t,"internal-error");const i=s.users[0];n._notifyReloadListener(i);const o=!((e=i.providerUserInfo)===null||e===void 0)&&e.length?Yy(i.providerUserInfo):[],c=pP(n.providerData,o),u=n.isAnonymous,h=!(n.email&&i.passwordHash)&&!(c!=null&&c.length),f=u?h:!1,m={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:c,metadata:new ul(i.createdAt,i.lastLoginAt),isAnonymous:f};Object.assign(n,m)}async function mP(n){const e=Ln(n);await ja(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function pP(n,e){return[...n.filter(r=>!e.some(s=>s.providerId===r.providerId)),...e]}function Yy(n){return n.map(e=>{var{providerId:t}=e,r=Eh(e,["providerId"]);return{providerId:t,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function gP(n,e){const t=await Ky(n,{},async()=>{const r=go({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:i}=n.config,o=await Qy(n,s,"/v1/token",`key=${i}`),c=await n._getAdditionalHeaders();c["Content-Type"]="application/x-www-form-urlencoded";const u={method:"POST",headers:c,body:r};return n.emulatorConfig&&vc(n.emulatorConfig.host)&&(u.credentials="include"),Gy.fetch()(o,u)});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function _P(n,e){return qs(n,"POST","/v2/accounts:revokeToken",Sh(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wr{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){Y(e.idToken,"internal-error"),Y(typeof e.idToken<"u","internal-error"),Y(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Ym(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){Y(e.length!==0,"internal-error");const t=Ym(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(Y(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:r,refreshToken:s,expiresIn:i}=await gP(e,t);this.updateTokensAndExpiration(r,s,Number(i))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:s,expirationTime:i}=t,o=new Wr;return r&&(Y(typeof r=="string","internal-error",{appName:e}),o.refreshToken=r),s&&(Y(typeof s=="string","internal-error",{appName:e}),o.accessToken=s),i&&(Y(typeof i=="number","internal-error",{appName:e}),o.expirationTime=i),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Wr,this.toJSON())}_performRefresh(){return Bt("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function nn(n,e){Y(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class pt{constructor(e){var{uid:t,auth:r,stsTokenManager:s}=e,i=Eh(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new fP(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=t,this.auth=r,this.stsTokenManager=s,this.accessToken=s.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.providerData=i.providerData?[...i.providerData]:[],this.metadata=new ul(i.createdAt||void 0,i.lastLoginAt||void 0)}async getIdToken(e){const t=await eo(this,this.stsTokenManager.getToken(this.auth,e));return Y(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return hP(this,e)}reload(){return mP(this)}_assign(e){this!==e&&(Y(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>Object.assign({},t)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new pt(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return t.metadata._copy(this.metadata),t}_onReload(e){Y(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await ja(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(mt(this.auth.app))return Promise.reject(mr(this.auth));const e=await this.getIdToken();return await eo(this,lP(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){var r,s,i,o,c,u,h,f;const m=(r=t.displayName)!==null&&r!==void 0?r:void 0,p=(s=t.email)!==null&&s!==void 0?s:void 0,w=(i=t.phoneNumber)!==null&&i!==void 0?i:void 0,C=(o=t.photoURL)!==null&&o!==void 0?o:void 0,D=(c=t.tenantId)!==null&&c!==void 0?c:void 0,P=(u=t._redirectEventId)!==null&&u!==void 0?u:void 0,F=(h=t.createdAt)!==null&&h!==void 0?h:void 0,L=(f=t.lastLoginAt)!==null&&f!==void 0?f:void 0,{uid:O,emailVerified:U,isAnonymous:N,providerData:W,stsTokenManager:T}=t;Y(O&&T,e,"internal-error");const _=Wr.fromJSON(this.name,T);Y(typeof O=="string",e,"internal-error"),nn(m,e.name),nn(p,e.name),Y(typeof U=="boolean",e,"internal-error"),Y(typeof N=="boolean",e,"internal-error"),nn(w,e.name),nn(C,e.name),nn(D,e.name),nn(P,e.name),nn(F,e.name),nn(L,e.name);const y=new pt({uid:O,auth:e,email:p,emailVerified:U,displayName:m,isAnonymous:N,photoURL:C,phoneNumber:w,tenantId:D,stsTokenManager:_,createdAt:F,lastLoginAt:L});return W&&Array.isArray(W)&&(y.providerData=W.map(E=>Object.assign({},E))),P&&(y._redirectEventId=P),y}static async _fromIdTokenResponse(e,t,r=!1){const s=new Wr;s.updateFromServerResponse(t);const i=new pt({uid:t.localId,auth:e,stsTokenManager:s,isAnonymous:r});return await ja(i),i}static async _fromGetAccountInfoResponse(e,t,r){const s=t.users[0];Y(s.localId!==void 0,"internal-error");const i=s.providerUserInfo!==void 0?Yy(s.providerUserInfo):[],o=!(s.email&&s.passwordHash)&&!(i!=null&&i.length),c=new Wr;c.updateFromIdToken(r);const u=new pt({uid:s.localId,auth:e,stsTokenManager:c,isAnonymous:o}),h={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:i,metadata:new ul(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(i!=null&&i.length)};return Object.assign(u,h),u}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xm=new Map;function jt(n){Ht(n instanceof Function,"Expected a class definition");let e=Xm.get(n);return e?(Ht(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,Xm.set(n,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xy{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}Xy.type="NONE";const Jm=Xy;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ha(n,e,t){return`firebase:${n}:${e}:${t}`}class Hr{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:s,name:i}=this.auth;this.fullUserKey=ha(this.userKey,s.apiKey,i),this.fullPersistenceKey=ha("persistence",s.apiKey,i),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await Ba(this.auth,{idToken:e}).catch(()=>{});return t?pt._fromGetAccountInfoResponse(this.auth,t,e):null}return pt._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,r="authUser"){if(!t.length)return new Hr(jt(Jm),e,r);const s=(await Promise.all(t.map(async h=>{if(await h._isAvailable())return h}))).filter(h=>h);let i=s[0]||jt(Jm);const o=ha(r,e.config.apiKey,e.name);let c=null;for(const h of t)try{const f=await h._get(o);if(f){let m;if(typeof f=="string"){const p=await Ba(e,{idToken:f}).catch(()=>{});if(!p)break;m=await pt._fromGetAccountInfoResponse(e,p,f)}else m=pt._fromJSON(e,f);h!==i&&(c=m),i=h;break}}catch{}const u=s.filter(h=>h._shouldAllowMigration);return!i._shouldAllowMigration||!u.length?new Hr(i,e,r):(i=u[0],c&&await i._set(o,c.toJSON()),await Promise.all(t.map(async h=>{if(h!==i)try{await h._remove(o)}catch{}})),new Hr(i,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Zm(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(tv(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Jy(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(rv(e))return"Blackberry";if(sv(e))return"Webos";if(Zy(e))return"Safari";if((e.includes("chrome/")||ev(e))&&!e.includes("edge/"))return"Chrome";if(nv(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function Jy(n=We()){return/firefox\//i.test(n)}function Zy(n=We()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function ev(n=We()){return/crios\//i.test(n)}function tv(n=We()){return/iemobile/i.test(n)}function nv(n=We()){return/android/i.test(n)}function rv(n=We()){return/blackberry/i.test(n)}function sv(n=We()){return/webos/i.test(n)}function Rh(n=We()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function yP(n=We()){var e;return Rh(n)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function vP(){return B1()&&document.documentMode===10}function iv(n=We()){return Rh(n)||nv(n)||sv(n)||rv(n)||/windows phone/i.test(n)||tv(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ov(n,e=[]){let t;switch(n){case"Browser":t=Zm(We());break;case"Worker":t=`${Zm(We())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${xs}/${r}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class IP{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const r=i=>new Promise((o,c)=>{try{const u=e(i);o(u)}catch(u){c(u)}});r.onAbort=t,this.queue.push(r);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const r of this.queue)await r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(const s of t)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function wP(n,e={}){return qs(n,"GET","/v2/passwordPolicy",Sh(n,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const EP=6;class TP{constructor(e){var t,r,s,i;const o=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(t=o.minPasswordLength)!==null&&t!==void 0?t:EP,o.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=o.maxPasswordLength),o.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=o.containsLowercaseCharacter),o.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=o.containsUppercaseCharacter),o.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=o.containsNumericCharacter),o.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=o.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(s=(r=e.allowedNonAlphanumericCharacters)===null||r===void 0?void 0:r.join(""))!==null&&s!==void 0?s:"",this.forceUpgradeOnSignin=(i=e.forceUpgradeOnSignin)!==null&&i!==void 0?i:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var t,r,s,i,o,c;const u={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,u),this.validatePasswordCharacterOptions(e,u),u.isValid&&(u.isValid=(t=u.meetsMinPasswordLength)!==null&&t!==void 0?t:!0),u.isValid&&(u.isValid=(r=u.meetsMaxPasswordLength)!==null&&r!==void 0?r:!0),u.isValid&&(u.isValid=(s=u.containsLowercaseLetter)!==null&&s!==void 0?s:!0),u.isValid&&(u.isValid=(i=u.containsUppercaseLetter)!==null&&i!==void 0?i:!0),u.isValid&&(u.isValid=(o=u.containsNumericCharacter)!==null&&o!==void 0?o:!0),u.isValid&&(u.isValid=(c=u.containsNonAlphanumericCharacter)!==null&&c!==void 0?c:!0),u}validatePasswordLengthOptions(e,t){const r=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),s&&(t.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let s=0;s<e.length;s++)r=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,s,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bP{constructor(e,t,r,s){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new ep(this),this.idTokenSubscription=new ep(this),this.beforeStateQueue=new IP(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Hy,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion,this._persistenceManagerAvailable=new Promise(i=>this._resolvePersistenceManagerAvailable=i)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=jt(t)),this._initializationPromise=this.queue(async()=>{var r,s,i;if(!this._deleted&&(this.persistenceManager=await Hr.create(this,e),(r=this._resolvePersistenceManagerAvailable)===null||r===void 0||r.call(this),!this._deleted)){if(!((s=this._popupRedirectResolver)===null||s===void 0)&&s._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((i=this.currentUser)===null||i===void 0?void 0:i.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await Ba(this,{idToken:e}),r=await pt._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(r)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var t;if(mt(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(c=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(c,c))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let s=r,i=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(t=this.redirectUser)===null||t===void 0?void 0:t._redirectEventId,c=s==null?void 0:s._redirectEventId,u=await this.tryRedirectSignIn(e);(!o||o===c)&&(u!=null&&u.user)&&(s=u.user,i=!0)}if(!s)return this.directlySetCurrentUser(null);if(!s._redirectEventId){if(i)try{await this.beforeStateQueue.runMiddleware(s)}catch(o){s=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return s?this.reloadAndSetCurrentUserOrClear(s):this.directlySetCurrentUser(null)}return Y(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===s._redirectEventId?this.directlySetCurrentUser(s):this.reloadAndSetCurrentUserOrClear(s)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await ja(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=sP()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(mt(this.app))return Promise.reject(mr(this));const t=e?Ln(e):null;return t&&Y(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&Y(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return mt(this.app)?Promise.reject(mr(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return mt(this.app)?Promise.reject(mr(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(jt(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await wP(this),t=new TP(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new Ic("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),await _P(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,t){const r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&jt(e)||this._popupRedirectResolver;Y(t,this,"argument-error"),this.redirectPersistenceManager=await Hr.create(this,[jt(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,r;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)===null||t===void 0?void 0:t._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const r=(t=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&t!==void 0?t:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,s){if(this._deleted)return()=>{};const i=typeof t=="function"?t:t.next.bind(t);let o=!1;const c=this._isInitialized?Promise.resolve():this._initializationPromise;if(Y(c,this,"internal-error"),c.then(()=>{o||i(this.currentUser)}),typeof t=="function"){const u=e.addObserver(t,r,s);return()=>{o=!0,u()}}else{const u=e.addObserver(t);return()=>{o=!0,u()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return Y(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=ov(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const t={"X-Client-Version":this.clientVersion};this.app.options.appId&&(t["X-Firebase-gmpid"]=this.app.options.appId);const r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(t["X-Firebase-Client"]=r);const s=await this._getAppCheckToken();return s&&(t["X-Firebase-AppCheck"]=s),t}async _getAppCheckToken(){var e;if(mt(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const t=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return t!=null&&t.error&&eP(`Error while retrieving App Check token: ${t.error}`),t==null?void 0:t.token}}function wc(n){return Ln(n)}class ep{constructor(e){this.auth=e,this.observer=null,this.addObserver=W1(t=>this.observer=t)}get next(){return Y(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Ch={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function AP(n){Ch=n}function SP(n){return Ch.loadJS(n)}function PP(){return Ch.gapiScript}function RP(n){return`__${n}${Math.floor(Math.random()*1e6)}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function CP(n,e){const t=Ka(n,"auth");if(t.isInitialized()){const s=t.getImmediate(),i=t.getOptions();if(La(i,e??{}))return s;Vt(s,"already-initialized")}return t.initialize({options:e})}function DP(n,e){const t=(e==null?void 0:e.persistence)||[],r=(Array.isArray(t)?t:[t]).map(jt);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function kP(n,e,t){const r=wc(n);Y(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const s=!1,i=av(e),{host:o,port:c}=VP(e),u=c===null?"":`:${c}`,h={url:`${i}//${o}${u}/`},f=Object.freeze({host:o,port:c,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:s})});if(!r._canInitEmulator){Y(r.config.emulator&&r.emulatorConfig,r,"emulator-config-failed"),Y(La(h,r.config.emulator)&&La(f,r.emulatorConfig),r,"emulator-config-failed");return}r.config.emulator=h,r.emulatorConfig=f,r.settings.appVerificationDisabledForTesting=!0,vc(o)?(V1(`${i}//${o}${u}`),N1("Auth",!0)):OP()}function av(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function VP(n){const e=av(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const r=t[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(r);if(s){const i=s[1];return{host:i,port:tp(r.substr(i.length+1))}}else{const[i,o]=r.split(":");return{host:i,port:tp(o)}}}function tp(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function OP(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cv{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return Bt("not implemented")}_getIdTokenResponse(e){return Bt("not implemented")}_linkToIdToken(e,t){return Bt("not implemented")}_getReauthenticationResolver(e){return Bt("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Gr(n,e){return cP(n,"POST","/v1/accounts:signInWithIdp",Sh(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xP="http://localhost";class Tr extends cv{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new Tr(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):Vt("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:s}=t,i=Eh(t,["providerId","signInMethod"]);if(!r||!s)return null;const o=new Tr(r,s);return o.idToken=i.idToken||void 0,o.accessToken=i.accessToken||void 0,o.secret=i.secret,o.nonce=i.nonce,o.pendingToken=i.pendingToken||null,o}_getIdTokenResponse(e){const t=this.buildRequest();return Gr(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,Gr(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,Gr(e,t)}buildRequest(){const e={requestUri:xP,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=go(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dh{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yo extends Dh{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class on extends yo{constructor(){super("facebook.com")}static credential(e){return Tr._fromParams({providerId:on.PROVIDER_ID,signInMethod:on.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return on.credentialFromTaggedObject(e)}static credentialFromError(e){return on.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return on.credential(e.oauthAccessToken)}catch{return null}}}on.FACEBOOK_SIGN_IN_METHOD="facebook.com";on.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lt extends yo{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return Tr._fromParams({providerId:Lt.PROVIDER_ID,signInMethod:Lt.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return Lt.credentialFromTaggedObject(e)}static credentialFromError(e){return Lt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return Lt.credential(t,r)}catch{return null}}}Lt.GOOGLE_SIGN_IN_METHOD="google.com";Lt.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class an extends yo{constructor(){super("github.com")}static credential(e){return Tr._fromParams({providerId:an.PROVIDER_ID,signInMethod:an.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return an.credentialFromTaggedObject(e)}static credentialFromError(e){return an.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return an.credential(e.oauthAccessToken)}catch{return null}}}an.GITHUB_SIGN_IN_METHOD="github.com";an.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cn extends yo{constructor(){super("twitter.com")}static credential(e,t){return Tr._fromParams({providerId:cn.PROVIDER_ID,signInMethod:cn.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return cn.credentialFromTaggedObject(e)}static credentialFromError(e){return cn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return cn.credential(t,r)}catch{return null}}}cn.TWITTER_SIGN_IN_METHOD="twitter.com";cn.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ds{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,s=!1){const i=await pt._fromIdTokenResponse(e,r,s),o=np(r);return new Ds({user:i,providerId:o,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);const s=np(r);return new Ds({user:e,providerId:s,_tokenResponse:r,operationType:t})}}function np(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $a extends $s{constructor(e,t,r,s){var i;super(t.code,t.message),this.operationType=r,this.user=s,Object.setPrototypeOf(this,$a.prototype),this.customData={appName:e.name,tenantId:(i=e.tenantId)!==null&&i!==void 0?i:void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,s){return new $a(e,t,r,s)}}function uv(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?$a._fromErrorAndOperation(n,i,e,r):i})}async function NP(n,e,t=!1){const r=await eo(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return Ds._forOperation(n,"link",r)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function MP(n,e,t=!1){const{auth:r}=n;if(mt(r.app))return Promise.reject(mr(r));const s="reauthenticate";try{const i=await eo(n,uv(r,s,e,n),t);Y(i.idToken,r,"internal-error");const o=Ph(i.idToken);Y(o,r,"internal-error");const{sub:c}=o;return Y(n.uid===c,r,"user-mismatch"),Ds._forOperation(n,s,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&Vt(r,"user-mismatch"),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function FP(n,e,t=!1){if(mt(n.app))return Promise.reject(mr(n));const r="signIn",s=await uv(n,r,e),i=await Ds._fromIdTokenResponse(n,r,s);return t||await n._updateCurrentUser(i.user),i}function LP(n,e,t,r){return Ln(n).onIdTokenChanged(e,t,r)}function UP(n,e,t){return Ln(n).beforeAuthStateChanged(e,t)}function BP(n,e,t,r){return Ln(n).onAuthStateChanged(e,t,r)}function jP(n){return Ln(n).signOut()}const qa="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lv{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(qa,"1"),this.storage.removeItem(qa),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $P=1e3,qP=10;class hv extends lv{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=iv(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const r=this.storage.getItem(t),s=this.localCache[t];r!==s&&e(t,s,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((o,c,u)=>{this.notifyListeners(o,u)});return}const r=e.key;t?this.detachListener():this.stopPolling();const s=()=>{const o=this.storage.getItem(r);!t&&this.localCache[r]===o||this.notifyListeners(r,o)},i=this.storage.getItem(r);vP()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,qP):s()}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},$P)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}hv.type="LOCAL";const zP=hv;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dv extends lv{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}dv.type="SESSION";const fv=dv;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function WP(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ec{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(s=>s.isListeningto(e));if(t)return t;const r=new Ec(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:r,eventType:s,data:i}=t.data,o=this.handlersMap[s];if(!(o!=null&&o.size))return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:s});const c=Array.from(o).map(async h=>h(t.origin,i)),u=await WP(c);t.ports[0].postMessage({status:"done",eventId:r,eventType:s,response:u})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Ec.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function kh(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class HP{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,r=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let i,o;return new Promise((c,u)=>{const h=kh("",20);s.port1.start();const f=setTimeout(()=>{u(new Error("unsupported_event"))},r);o={messageChannel:s,onMessage(m){const p=m;if(p.data.eventId===h)switch(p.data.status){case"ack":clearTimeout(f),i=setTimeout(()=>{u(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),c(p.data.response);break;default:clearTimeout(f),clearTimeout(i),u(new Error("invalid_response"));break}}},this.handlers.add(o),s.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:h,data:t},[s.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Dt(){return window}function GP(n){Dt().location.href=n}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function mv(){return typeof Dt().WorkerGlobalScope<"u"&&typeof Dt().importScripts=="function"}async function KP(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function QP(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)===null||n===void 0?void 0:n.controller)||null}function YP(){return mv()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pv="firebaseLocalStorageDb",XP=1,za="firebaseLocalStorage",gv="fbase_key";class vo{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function Tc(n,e){return n.transaction([za],e?"readwrite":"readonly").objectStore(za)}function JP(){const n=indexedDB.deleteDatabase(pv);return new vo(n).toPromise()}function ll(){const n=indexedDB.open(pv,XP);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const r=n.result;try{r.createObjectStore(za,{keyPath:gv})}catch(s){t(s)}}),n.addEventListener("success",async()=>{const r=n.result;r.objectStoreNames.contains(za)?e(r):(r.close(),await JP(),e(await ll()))})})}async function rp(n,e,t){const r=Tc(n,!0).put({[gv]:e,value:t});return new vo(r).toPromise()}async function ZP(n,e){const t=Tc(n,!1).get(e),r=await new vo(t).toPromise();return r===void 0?null:r.value}function sp(n,e){const t=Tc(n,!0).delete(e);return new vo(t).toPromise()}const eR=800,tR=3;class _v{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await ll(),this.db)}async _withRetries(e){let t=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(t++>tR)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return mv()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Ec._getInstance(YP()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var e,t;if(this.activeServiceWorker=await KP(),!this.activeServiceWorker)return;this.sender=new HP(this.activeServiceWorker);const r=await this.sender._send("ping",{},800);r&&!((e=r[0])===null||e===void 0)&&e.fulfilled&&!((t=r[0])===null||t===void 0)&&t.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||QP()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await ll();return await rp(e,qa,"1"),await sp(e,qa),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(r=>rp(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(r=>ZP(r,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>sp(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(s=>{const i=Tc(s,!1).getAll();return new vo(i).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],r=new Set;if(e.length!==0)for(const{fbase_key:s,value:i}of e)r.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(i)&&(this.notifyListeners(s,i),t.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!r.has(s)&&(this.notifyListeners(s,null),t.push(s));return t}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),eR)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}_v.type="LOCAL";const nR=_v;new _o(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function yv(n,e){return e?jt(e):(Y(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vh extends cv{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Gr(e,this._buildIdpRequest())}_linkToIdToken(e,t){return Gr(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return Gr(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function rR(n){return FP(n.auth,new Vh(n),n.bypassAuthState)}function sR(n){const{auth:e,user:t}=n;return Y(t,e,"internal-error"),MP(t,new Vh(n),n.bypassAuthState)}async function iR(n){const{auth:e,user:t}=n;return Y(t,e,"internal-error"),NP(t,new Vh(n),n.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vv{constructor(e,t,r,s,i=!1){this.auth=e,this.resolver=r,this.user=s,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:r,postBody:s,tenantId:i,error:o,type:c}=e;if(o){this.reject(o);return}const u={auth:this.auth,requestUri:t,sessionId:r,tenantId:i||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(c)(u))}catch(h){this.reject(h)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return rR;case"linkViaPopup":case"linkViaRedirect":return iR;case"reauthViaPopup":case"reauthViaRedirect":return sR;default:Vt(this.auth,"internal-error")}}resolve(e){Ht(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Ht(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const oR=new _o(2e3,1e4);async function aR(n,e,t){if(mt(n.app))return Promise.reject(gt(n,"operation-not-supported-in-this-environment"));const r=wc(n);tP(n,e,Dh);const s=yv(r,t);return new Zn(r,"signInViaPopup",e,s).executeNotNull()}class Zn extends vv{constructor(e,t,r,s,i){super(e,t,s,i),this.provider=r,this.authWindow=null,this.pollId=null,Zn.currentPopupAction&&Zn.currentPopupAction.cancel(),Zn.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return Y(e,this.auth,"internal-error"),e}async onExecution(){Ht(this.filter.length===1,"Popup operations only handle one event");const e=kh();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(gt(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(gt(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Zn.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,r;if(!((r=(t=this.authWindow)===null||t===void 0?void 0:t.window)===null||r===void 0)&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(gt(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,oR.get())};e()}}Zn.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cR="pendingRedirect",da=new Map;class uR extends vv{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=da.get(this.auth._key());if(!e){try{const r=await lR(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}da.set(this.auth._key(),e)}return this.bypassAuthState||da.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function lR(n,e){const t=fR(e),r=dR(n);if(!await r._isAvailable())return!1;const s=await r._get(t)==="true";return await r._remove(t),s}function hR(n,e){da.set(n._key(),e)}function dR(n){return jt(n._redirectPersistence)}function fR(n){return ha(cR,n.config.apiKey,n.name)}async function mR(n,e,t=!1){if(mt(n.app))return Promise.reject(mr(n));const r=wc(n),s=yv(r,e),o=await new uR(r,s,t).execute();return o&&!t&&(delete o.user._redirectEventId,await r._persistUserIfCurrent(o.user),await r._setRedirectUser(null,e)),o}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pR=10*60*1e3;class gR{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!_R(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var r;if(e.error&&!Iv(e)){const s=((r=e.error.code)===null||r===void 0?void 0:r.split("auth/")[1])||"internal-error";t.onError(gt(this.auth,s))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=pR&&this.cachedEventUids.clear(),this.cachedEventUids.has(ip(e))}saveEventToCache(e){this.cachedEventUids.add(ip(e)),this.lastProcessedEventTime=Date.now()}}function ip(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function Iv({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function _R(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Iv(n);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function yR(n,e={}){return qs(n,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vR=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,IR=/^https?/;async function wR(n){if(n.config.emulator)return;const{authorizedDomains:e}=await yR(n);for(const t of e)try{if(ER(t))return}catch{}Vt(n,"unauthorized-domain")}function ER(n){const e=cl(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const o=new URL(n);return o.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&o.hostname===r}if(!IR.test(t))return!1;if(vR.test(n))return r===n;const s=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(r)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const TR=new _o(3e4,6e4);function op(){const n=Dt().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function bR(n){return new Promise((e,t)=>{var r,s,i;function o(){op(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{op(),t(gt(n,"network-request-failed"))},timeout:TR.get()})}if(!((s=(r=Dt().gapi)===null||r===void 0?void 0:r.iframes)===null||s===void 0)&&s.Iframe)e(gapi.iframes.getContext());else if(!((i=Dt().gapi)===null||i===void 0)&&i.load)o();else{const c=RP("iframefcb");return Dt()[c]=()=>{gapi.load?o():t(gt(n,"network-request-failed"))},SP(`${PP()}?onload=${c}`).catch(u=>t(u))}}).catch(e=>{throw fa=null,e})}let fa=null;function AR(n){return fa=fa||bR(n),fa}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const SR=new _o(5e3,15e3),PR="__/auth/iframe",RR="emulator/auth/iframe",CR={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},DR=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function kR(n){const e=n.config;Y(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?Ah(e,RR):`https://${n.config.authDomain}/${PR}`,r={apiKey:e.apiKey,appName:n.name,v:xs},s=DR.get(n.config.apiHost);s&&(r.eid=s);const i=n._getFrameworks();return i.length&&(r.fw=i.join(",")),`${t}?${go(r).slice(1)}`}async function VR(n){const e=await AR(n),t=Dt().gapi;return Y(t,n,"internal-error"),e.open({where:document.body,url:kR(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:CR,dontclear:!0},r=>new Promise(async(s,i)=>{await r.restyle({setHideOnLeave:!1});const o=gt(n,"network-request-failed"),c=Dt().setTimeout(()=>{i(o)},SR.get());function u(){Dt().clearTimeout(c),s(r)}r.ping(u).then(u,()=>{i(o)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const OR={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},xR=500,NR=600,MR="_blank",FR="http://localhost";class ap{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function LR(n,e,t,r=xR,s=NR){const i=Math.max((window.screen.availHeight-s)/2,0).toString(),o=Math.max((window.screen.availWidth-r)/2,0).toString();let c="";const u=Object.assign(Object.assign({},OR),{width:r.toString(),height:s.toString(),top:i,left:o}),h=We().toLowerCase();t&&(c=ev(h)?MR:t),Jy(h)&&(e=e||FR,u.scrollbars="yes");const f=Object.entries(u).reduce((p,[w,C])=>`${p}${w}=${C},`,"");if(yP(h)&&c!=="_self")return UR(e||"",c),new ap(null);const m=window.open(e||"",c,f);Y(m,n,"popup-blocked");try{m.focus()}catch{}return new ap(m)}function UR(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const BR="__/auth/handler",jR="emulator/auth/handler",$R=encodeURIComponent("fac");async function cp(n,e,t,r,s,i){Y(n.config.authDomain,n,"auth-domain-config-required"),Y(n.config.apiKey,n,"invalid-api-key");const o={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:xs,eventId:s};if(e instanceof Dh){e.setDefaultLanguage(n.languageCode),o.providerId=e.providerId||"",z1(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[f,m]of Object.entries({}))o[f]=m}if(e instanceof yo){const f=e.getScopes().filter(m=>m!=="");f.length>0&&(o.scopes=f.join(","))}n.tenantId&&(o.tid=n.tenantId);const c=o;for(const f of Object.keys(c))c[f]===void 0&&delete c[f];const u=await n._getAppCheckToken(),h=u?`#${$R}=${encodeURIComponent(u)}`:"";return`${qR(n)}?${go(c).slice(1)}${h}`}function qR({config:n}){return n.emulator?Ah(n,jR):`https://${n.authDomain}/${BR}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const du="webStorageSupport";class zR{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=fv,this._completeRedirectFn=mR,this._overrideRedirectResult=hR}async _openPopup(e,t,r,s){var i;Ht((i=this.eventManagers[e._key()])===null||i===void 0?void 0:i.manager,"_initialize() not called before _openPopup()");const o=await cp(e,t,r,cl(),s);return LR(e,o,kh())}async _openRedirect(e,t,r,s){await this._originValidation(e);const i=await cp(e,t,r,cl(),s);return GP(i),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:s,promise:i}=this.eventManagers[t];return s?Promise.resolve(s):(Ht(i,"If manager is not set, promise should be"),i)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){const t=await VR(e),r=new gR(e);return t.register("authEvent",s=>(Y(s==null?void 0:s.authEvent,e,"invalid-auth-event"),{status:r.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(du,{type:du},s=>{var i;const o=(i=s==null?void 0:s[0])===null||i===void 0?void 0:i[du];o!==void 0&&t(!!o),Vt(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=wR(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return iv()||Zy()||Rh()}}const WR=zR;var up="@firebase/auth",lp="1.10.8";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class HR{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){Y(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function GR(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function KR(n){ls(new Km("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:o,authDomain:c}=r.options;Y(o&&!o.includes(":"),"invalid-api-key",{appName:r.name});const u={apiKey:o,authDomain:c,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:ov(n)},h=new bP(r,s,i,u);return DP(h,t),h},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),ls(new Km("auth-internal",e=>{const t=wc(e.getProvider("auth").getImmediate());return(r=>new HR(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),Tn(up,lp,GR(n)),Tn(up,lp,"esm2017")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const QR=5*60,YR=zy("authIdTokenMaxAge")||QR;let hp=null;const XR=n=>async e=>{const t=e&&await e.getIdTokenResult(),r=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(r&&r>YR)return;const s=t==null?void 0:t.token;hp!==s&&(hp=s,await fetch(n,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function JR(n=wl()){const e=Ka(n,"auth");if(e.isInitialized())return e.getImmediate();const t=CP(n,{popupRedirectResolver:WR,persistence:[nR,zP,fv]}),r=zy("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(r,location.origin);if(location.origin===i.origin){const o=XR(i.toString());UP(t,o,()=>o(t.currentUser)),LP(t,c=>o(c))}}const s=k1("auth");return s&&kP(t,`http://${s}`),t}function ZR(){var n,e;return(e=(n=document.getElementsByTagName("head"))===null||n===void 0?void 0:n[0])!==null&&e!==void 0?e:document}AP({loadJS(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=s=>{const i=gt("internal-error");i.customData=s,t(i)},r.type="text/javascript",r.charset="UTF-8",ZR().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});KR("Browser");var eC="firebase",tC="11.10.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Tn(eC,tC,"app");const nC={apiKey:"AIzaSyD1hvp2UYrvizLOzoSqOX-bwRWcCpJVAlg",authDomain:"fitness-aos.firebaseapp.com",projectId:"fitness-aos",storageBucket:"fitness-aos.firebasestorage.app",messagingSenderId:"842575255284",appId:"1:842575255284:web:65c4831683a893c110f0a1"},wv=sb().length>0,hl=wv?wl():tg(nC),Xe=wv?XS(hl):YS(hl,{localCache:_1({tabManager:w1()})}),to=JR(hl),rC=new Lt;function qC(n){return BP(to,e=>{console.log(`[Auth] User status changed: ${e?e.email:"logged out"}`),n(e)})}async function zC(){try{await aR(to,rC)}catch(n){throw console.error("Login Fehler:",n),n}}async function WC(){try{await jP(to)}catch(n){throw console.error("Logout Fehler:",n),n}}function it(){if(!to.currentUser)throw new Error("User not authenticated");return to.currentUser.uid}const ma=["vitamin_a_ug","vitamin_d_ug","vitamin_e_mg","vitamin_k_ug","vitamin_c_mg","vitamin_b1_mg","vitamin_b2_mg","vitamin_b3_mg","vitamin_b5_mg","vitamin_b6_mg","vitamin_b7_ug","folate_ug","vitamin_b12_ug","calcium_mg","phosphorus_mg","magnesium_mg","iron_mg","zinc_mg","selenium_ug","iodine_ug","potassium_mg","sodium_mg","omega3_mg"];function dp(){return Object.fromEntries(ma.map(n=>[n,0]))}function Io(){const n=new Date;return`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`}function sC(n,e){const t=new Date(n,0,1+(e-1)*7),r=t.getDay(),s=t;r<=4?s.setDate(t.getDate()-t.getDay()+1):s.setDate(t.getDate()+8-t.getDay());const i=[];for(let o=0;o<7;o++){const c=new Date(s);c.setDate(c.getDate()+o),i.push(c.toISOString().split("T")[0])}return i}async function ks(){const n=_t(Xe,"nutrition",it(),"meta","catalog"),e=await js(n);return e.exists()?e.data().items||[]:[]}async function iC(){const n=_t(Xe,"nutrition","public","meta","micros"),e=await js(n);return e.exists()?e.data().items||[]:[]}async function Vs(n=Io()){const e=await js(_t(Xe,"nutrition",it(),"logs",n));return e.exists()?e.data():{date:n,meals:[],water_ml:0}}async function pa(n,e){await Ji(_t(Xe,"nutrition",it(),"logs",n),{...e,updated_at:Zi()},{merge:!0})}async function Ev(n){const e=_h(ch(Xe,"nutrition",it(),"logs"),Uy("date","in",n)),t=await wh(e),r={};return t.forEach(s=>{r[s.id]=s.data()}),r}async function oC(n,e=20){const t=await ks(),r=n.toLowerCase();return t.filter(s=>s.name.toLowerCase().includes(r)).slice(0,e)}async function aC(n,e){const t=sC(n,e),r=await Ev(t),s=await wh(_h(ch(Xe,"supplements",it(),"logs"),Uy("date","in",t))),i={};s.forEach(D=>{i[D.id]=D.data()});const o=await ks(),c=await no(),u=await iC(),h=Object.fromEntries(c.map(D=>[D.id,D])),f=Object.fromEntries(u.map(D=>[D.meal_name,D])),m=dp();for(const D of t){const P=r[D]||{meals:[]},F=dp();for(const O of P.meals||[]){const U=o.find(T=>O.catalog_id&&T.id===O.catalog_id||T.name===O.description),N=(U==null?void 0:U.name)||O.description,W=f[N];if(W)for(const T of ma)F[T]=Math.round((F[T]+(W[T]||0))*10)/10}const L=i[D]||{intakes:[]};for(const O of L.intakes||[]){const U=h[O.supplement_id];if(U!=null&&U.micros)for(const N of ma)U.micros[N]&&(F[N]=Math.round((F[N]+U.micros[N])*10)/10)}for(const O of ma)m[O]=Math.round((m[O]+F[O])*10)/10}const{DACH:p,getStatus:w}=await Vn(async()=>{const{DACH:D,getStatus:P}=await import("./dach-B6aLS9xE.js");return{DACH:D,getStatus:P}},[]),C={};for(const[D,P]of Object.entries(p)){const F=m[D]/7;C[D]={dach:P.value,unit:P.unit,total_week:Math.round(m[D]*10)/10,avg_daily:Math.round(F*10)/10,percent_of_dach:Math.round(F/P.value*100),status:w(F,P.value)}}return{ok:!0,year:n,week:e,dates:t,week_totals:m,rda_comparison:C,day_breakdown}}async function dl(n=Io()){const e=await js(_t(Xe,"nutrition",it(),"journal",n));return e.exists()?e.data().content:""}async function cC(n=Io(),e){await Ji(_t(Xe,"nutrition",it(),"journal",n),{date:n,content:e,updated_at:Zi()})}async function no(){const n=_t(Xe,"supplements",it(),"meta","catalog"),e=await js(n);return e.exists()?e.data().items||[]:[]}async function Wa(n=Io()){const e=await js(_t(Xe,"supplements",it(),"logs",n));return e.exists()?e.data():{date:n,intakes:[]}}async function fp(n,e=30){const t=new Date(n),r=Array.from({length:e},(h,f)=>{const m=new Date(t);return m.setDate(m.getDate()-f),m.toISOString().slice(0,10)}),s=await wh(_h(ch(Xe,"supplements",it(),"logs"),u1("date","desc"),l1(e))),i={};s.forEach(h=>{i[h.id]=h.data()});const o=await no(),c={};Object.values(i).forEach(h=>{(h.intakes||[]).forEach(f=>{const m=f.supplement_id;if(!c[m]){const p=o.find(w=>w.id===m);c[m]={supplement:p||{id:m,name:f.name||m},days_taken:0,current_streak:0}}c[m].days_taken+=1})});const u=Io();for(const h in c){let f=0;for(const m of r){const p=i[m];if(p&&(p.intakes||[]).some(C=>C.supplement_id===h))f+=1;else{if(m===u)continue;break}}c[h].current_streak=f}return{ok:!0,anchor:n,days:e,stats:Object.values(c)}}const bc=()=>{if(typeof window>"u")return!1;const n=window.location.hostname;return n.includes("web.app")||n.includes("firebaseapp.com")?!0:(n==="localhost"||n==="127.0.0.1"||n.includes("ts.net"),!1)};function Ac(n){return n.startsWith("/api/")?n.slice(4):n}async function uC(n,e){const t=`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(n)}&search_simple=1&action=process&json=1&page_size=${e}`;try{const r=await fetch(t,{headers:{Accept:"application/json"}});return r.ok?((await r.json()).products||[]).filter(i=>{var o;return i.product_name&&((o=i.nutriments)==null?void 0:o["energy-kcal_100g"])!=null}).map(i=>({name:i.product_name,brand:i.brands||"",kcal:Math.round((i.nutriments["energy-kcal_100g"]??0)*10)/10,kh:Math.round((i.nutriments.carbohydrates_100g??0)*10)/10,fett:Math.round((i.nutriments.fat_100g??0)*10)/10,ew:Math.round((i.nutriments.proteins_100g??0)*10)/10,_src:"off"})):[]}catch(r){return console.error("OFF search error:",r),[]}}async function zs(n){const e=Ac(n);if(bc()){if(e.startsWith("/nutrition/log")){const s=new URL(n,window.location.origin).searchParams.get("date");return{data:await Vs(s)}}if(e==="/nutrition/catalog")return{items:await ks()};if(e.startsWith("/nutrition/journal")){const s=new URL(n,window.location.origin).searchParams.get("date");return{content:await dl(s)}}if(e.startsWith("/supplements/catalog"))return{items:await no()};if(e.startsWith("/supplements/log")){const s=new URL(n,window.location.origin).searchParams.get("date");return{data:await Wa(s)}}if(e.startsWith("/nutrition/search")){const r=new URL(n,window.location.origin),s=r.searchParams.get("q"),i=parseInt(r.searchParams.get("limit")||"20"),[o,c]=await Promise.all([oC(s,i),uC(s,i)]),u=[...o,...c];return{ok:!0,count:u.length,results:u}}if(e.startsWith("/nutrition/weekly")){const r=e.split("/"),s=parseInt(r[r.length-2]),i=parseInt(r[r.length-1]);return await aC(s,i)}if(e==="/api/fuel-firestore/status")return{ok:!0,firestore:"connected",mode:"native-cloud"};if(e==="/health")return{status:"ok",mode:"native-cloud"}}const t=await fetch(n);if(!t.ok)throw new Error(`HTTP ${t.status}`);return t.json()}async function HC(n){const e=Ac(n);if(bc()&&e.startsWith("/nutrition/catalog/")){const r=e.split("/").pop(),i=(await ks()).filter(c=>c.id!==r),o=_t(Xe,"nutrition",it(),"meta","catalog");return await Ji(o,{items:i,updated_at:Zi()}),{ok:!0}}const t=await fetch(n,{method:"DELETE"});if(!t.ok)throw new Error(`HTTP ${t.status}`);return t.json()}async function GC(n,e){const t=Ac(n);if(bc()&&t==="/nutrition/log"){const s=await Vs(e.date),i=[...s.meals||[]],o=i.findIndex(c=>c.id===e.meal_id);if(o!==-1)if(e.new_date&&e.new_date!==e.date){const c={...i[o],...e.meal,id:e.meal_id};i.splice(o,1),await pa(e.date,{...s,meals:i});const u=await Vs(e.new_date);u.meals=[...u.meals||[],c],await pa(e.new_date,u)}else i[o]={...i[o],...e.meal},await pa(e.date,{...s,meals:i});return{ok:!0}}const r=await fetch(n,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json()}async function KC(n,e){const t=Ac(n);if(bc()){if(t==="/nutrition/log"){const s=await Vs(e.date);if(e.delete_meal_id)s.meals=(s.meals||[]).filter(i=>i.id!==e.delete_meal_id);else if(e.catalog_item_id){const o=(await ks()).find(c=>c.id===e.catalog_item_id);if(o){const c={id:`meal_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,type:o.meal_type||o.type||"meal",description:o.name||o.description,notes:o.notes||"",kcal:o.kcal||0,protein:o.protein||0,carbs:o.carbs||0,fat:o.fat||0,catalog_id:o.id,logged_at:new Date().toISOString()};s.meals=[...s.meals||[],c]}}else if(e.meal){const i={...e.meal,id:e.meal.id||`meal_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,logged_at:e.meal.logged_at||new Date().toISOString()};s.meals=[...s.meals||[],i]}return await pa(e.date,s),{ok:!0}}if(t==="/nutrition/journal")return await cC(e.date,e.content),{ok:!0};if(t==="/nutrition/catalog"){const s=await ks(),i={...e.item,id:e.item.id||`meal_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`};s.push(i);const o=_t(Xe,"nutrition",it(),"meta","catalog");return await Ji(o,{items:s,updated_at:Zi()}),{ok:!0,item:i}}if(t==="/supplements/log"){const s=await Wa(e.date);if(e.delete_id)s.intakes=(s.intakes||[]).filter(o=>o.id!==e.delete_id);else{const o={...e.intake,id:`supp_${Date.now()}`};s.intakes=[...s.intakes||[],o]}const i=_t(Xe,"supplements",it(),"logs",e.date);return await Ji(i,{...s,updated_at:Zi()}),{ok:!0}}}const r=await fetch(n,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(!r.ok){let s=`HTTP ${r.status}`;try{const i=await r.json();i!=null&&i.error&&(s=i.error)}catch{}throw new Error(s)}return r.json()}const Oh=()=>window.location.hostname.includes("web.app")||window.location.hostname.includes("firebaseapp.com");function lC(n){return Os({queryKey:["nutrition",n],queryFn:async()=>{if(Oh())return await Vs(n);try{return(await zs(`/nutrition/log?date=${n}`)).data}catch(e){return console.warn("API fallback to Firestore:",e),await Vs(n)}},staleTime:3e4})}function hC(n,e=10){return Os({queryKey:["macro-trend",n,e],queryFn:async()=>{const t=new Date(n),r=Array.from({length:e},(i,o)=>{const c=new Date(t);return c.setDate(c.getDate()-(e-1-o)),c.toISOString().slice(0,10)});if(Oh()){const i=await Ev(r);return r.map(o=>{var u;const c=((u=i[o])==null?void 0:u.meals)||[];return{day:o.slice(5),kcal:Math.round(c.reduce((h,f)=>h+(f.kcal||0),0)),protein:Math.round(c.reduce((h,f)=>h+(f.protein||0),0)),carbs:Math.round(c.reduce((h,f)=>h+(f.carbs||0),0)),fat:Math.round(c.reduce((h,f)=>h+(f.fat||0),0))}})}return(await Promise.all(r.map(i=>zs(`/nutrition/log?date=${i}`).then(o=>{var c;return{date:i,meals:((c=o.data)==null?void 0:c.meals)||[]}}).catch(()=>({date:i,meals:[]}))))).map(({date:i,meals:o})=>({day:i.slice(5),kcal:Math.round(o.reduce((c,u)=>c+(u.kcal||0),0)),protein:Math.round(o.reduce((c,u)=>c+(u.protein||0),0)),carbs:Math.round(o.reduce((c,u)=>c+(u.carbs||0),0)),fat:Math.round(o.reduce((c,u)=>c+(u.fat||0),0))}))},staleTime:5*60*1e3})}function dC(n){return Os({queryKey:["journal",n],queryFn:async()=>{if(Oh())return await dl(n);try{return(await zs(`/nutrition/journal?date=${n}`)).content}catch(e){return console.warn("API fallback to Firestore:",e),await dl(n)}},staleTime:3e4})}const xh=()=>window.location.hostname.includes("web.app")||window.location.hostname.includes("firebaseapp.com");function fC(n){return Os({queryKey:["supp-stats",n],queryFn:async()=>{if(xh())return await fp(n);try{return await zs(`/supplements/stats?days=30&anchor=${n}`)}catch(e){return console.warn("API fallback to Firestore:",e),await fp(n)}},staleTime:3e4})}function mC(){return Os({queryKey:["supp-catalog"],queryFn:async()=>{if(xh())return await no();try{return(await zs("/supplements/catalog")).items||[]}catch(n){return console.warn("API fallback to Firestore:",n),await no()}},staleTime:3e5})}function pC(n){return Os({queryKey:["supp-log",n],queryFn:async()=>{if(xh())return await Wa(n);try{return(await zs(`/supplements/log?date=${n}`)).data}catch(e){return console.warn("API fallback to Firestore:",e),await Wa(n)}},staleTime:3e4})}function gC(n){const{data:e}=lC(n),{data:t}=fC(n),{data:r}=mC(),{data:s}=pC(n),{data:i}=dC(n),{data:o}=hC(n);return{nutrition:e,sup:t,suppCatalog:r,suppLog:s,journal:i,macroTrend:o}}const _C=new VI({defaultOptions:{queries:{staleTime:6e4}}});function yC(){const{activeTab:n,setActiveTab:e,activeDate:t,setActiveDate:r}=Kw(),s=gC(t),i={activeTab:n,setActiveTab:e,activeDate:t,setActiveDate:r,...s};return Ke.jsxs("div",{"data-fuel-embedded":!0,style:{display:"flex",flexDirection:"column",height:"100%"},children:[Ke.jsx("nav",{style:{display:"flex",gap:4,padding:"6px 12px",borderBottom:"1px solid #1e293b",overflowX:"auto",flexShrink:0},children:jp.map(({key:o,label:c,Icon:u})=>Ke.jsxs("button",{onClick:()=>e(o),style:{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:6,border:"none",cursor:"pointer",fontSize:12,fontWeight:500,whiteSpace:"nowrap",background:n===o?"#3b82f6":"transparent",color:n===o?"#fff":"#64748b",transition:"background 0.15s, color 0.15s"},children:[Ke.jsx(u,{size:13}),c]},o))}),Ke.jsx("div",{style:{flex:1,overflowY:"auto"},children:Ke.jsx(de.Suspense,{fallback:Ke.jsx("div",{style:{padding:40,textAlign:"center",color:"#64748b",fontSize:13},children:"Laden…"}),children:Ke.jsx(dE,{activeTab:n,ctx:i})})})]})}function vC(){return Ke.jsx(xI,{client:_C,children:Ke.jsx(yC,{})})}const QC=Object.freeze(Object.defineProperty({__proto__:null,default:vC},Symbol.toStringTag,{value:"Module"}));export{FE as A,jE as B,of as C,LE as D,qC as E,Zw as F,WC as G,zC as H,QC as I,tE as N,nE as P,PE as Q,rE as S,sE as U,Gm as _,kE as a,Os as b,br as c,HC as d,Pn as e,zs as f,CC as g,Hw as h,GC as i,Eh as j,$C as k,_l as l,DC as m,VC as n,zp as o,KC as p,yu as q,qp as r,vu as s,yt as t,kC as u,$p as v,VE as w,NE as x,UE as y,ME as z};
