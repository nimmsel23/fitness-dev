// Splash + Update-Loader für die Mini-Apps (training, atlas, 6pack, plan, coach).
//
// Ein selbstständiger Baustein (CSS + Markup + Script, keine Abhängigkeit zur App):
//  - deckt den Start ab, bis #root Inhalt hat (mind. 700 ms, damit der Effekt sichtbar ist)
//  - zeigt "Update wird geladen …", wenn in den ersten Sekunden ein neuer Service Worker
//    einspringt (updatefound/controllerchange) — die Apps laden danach selbst neu
//  - blockiert nie dauerhaft: Failsafe nach 12 s
// Nutzung:  import { splashSnippets } from "./solo-splash.mjs"   (stamp-training.mjs)
//           node scripts/solo-splash.mjs <html> --name "Plan" --accent "#5b8cff" --icon "/plan-icon-192.png"
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const START = "<!-- vos-splash:start -->";
const END = "<!-- vos-splash:end -->";

export function splashSnippets({ name, accent, icon }) {
  const head = `${START}
    <style>
      #vos-splash{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:#090b10;color:#e8e9ee;transition:opacity .35s ease;font-family:system-ui,-apple-system,sans-serif}
      #vos-splash.hide{opacity:0;pointer-events:none}
      #vos-splash img{width:96px;height:96px;border-radius:22%;animation:vos-pop .6s cubic-bezier(.2,.8,.2,1) both,vos-pulse 1.8s ease-in-out .6s infinite}
      #vos-splash .n{font-size:15px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:${accent}}
      #vos-splash .bar{width:120px;height:3px;border-radius:2px;background:rgba(255,255,255,.1);overflow:hidden}
      #vos-splash .bar::after{content:"";display:block;width:40%;height:100%;background:${accent};animation:vos-slide 1.1s ease-in-out infinite}
      #vos-splash .s{height:16px;font-size:12px;opacity:.65}
      @keyframes vos-pop{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:none}}
      @keyframes vos-pulse{50%{transform:scale(1.05)}}
      @keyframes vos-slide{from{transform:translateX(-100%)}to{transform:translateX(250%)}}
      @media (prefers-reduced-motion:reduce){#vos-splash img,#vos-splash .bar::after{animation:none}}
    </style>
    ${END}`;
  const body = `${START}
    <div id="vos-splash" role="status" aria-label="${name} lädt">
      <img src="${icon}" alt="" />
      <div class="n">${name}</div>
      <div class="bar"></div>
      <div class="s"></div>
    </div>
    <script>
      (function () {
        var el = document.getElementById('vos-splash');
        if (!el) return;
        var t0 = Date.now(), hidden = false, updating = false;
        var status = el.querySelector('.s');
        function hide() {
          if (hidden || updating) return;
          hidden = true;
          setTimeout(function () {
            el.classList.add('hide');
            setTimeout(function () { el.style.display = 'none'; }, 400);
          }, Math.max(0, 700 - (Date.now() - t0)));
        }
        // Update nur in den ersten 10 s als Ladevorgang zeigen — nie mitten in einer Sitzung abdecken.
        function showUpdating() {
          if (Date.now() - t0 > 10000) return;
          updating = true; hidden = false;
          el.style.display = ''; el.classList.remove('hide');
          status.textContent = 'Update wird geladen …';
          setTimeout(function () { updating = false; hide(); }, 10000);
        }
        var root = document.getElementById('root');
        function ready() { if (root && root.childElementCount > 0) { hide(); return true; } return false; }
        if (root && !ready()) {
          var mo = new MutationObserver(function () { if (ready()) mo.disconnect(); });
          mo.observe(root, { childList: true });
        }
        setTimeout(function () { updating = false; hide(); }, 12000);
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.addEventListener('controllerchange', showUpdating);
          navigator.serviceWorker.getRegistration().then(function (reg) {
            if (!reg) return;
            if (reg.installing && navigator.serviceWorker.controller) showUpdating();
            reg.addEventListener('updatefound', function () { if (navigator.serviceWorker.controller) showUpdating(); });
          }).catch(function () {});
        }
      })();
    </script>
    ${END}`;
  return { head, body };
}

// Idempotent in eine HTML-Quelle einsetzen (Marker ersetzen, sonst neu einfügen).
export function injectSplash(html, opts) {
  const { head, body } = splashSnippets(opts);
  const strip = (s) => s.replace(new RegExp(`\\s*${START}[\\s\\S]*?${END}`, "g"), "");
  let out = strip(html);
  out = out.replace(/<\/head>/i, `    ${head}\n  </head>`);
  out = out.replace(/<body([^>]*)>/i, `<body$1>\n    ${body}`);
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [file, ...rest] = process.argv.slice(2);
  const arg = (k) => rest[rest.indexOf(`--${k}`) + 1];
  if (!file || !arg("name") || !arg("accent") || !arg("icon")) {
    console.error('Aufruf: node scripts/solo-splash.mjs <html> --name "Plan" --accent "#5b8cff" --icon "/icon-192.png"');
    process.exit(1);
  }
  writeFileSync(file, injectSplash(readFileSync(file, "utf8"), { name: arg("name"), accent: arg("accent"), icon: arg("icon") }));
  console.log(`✨ Splash in ${file} eingesetzt`);
}
