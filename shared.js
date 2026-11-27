const API=/vercel\.app$/.test(location.hostname)?'/api':'https://menu-api.bof1851.workers.dev';
const PRESETS={
 emerald:{n:'زمرد',bg:'#0f1a16',bg2:'#17251f',ink:'#f3efe6',mut:'#a9b5ae',acc:'#c9a45c',ai:'#1a1408',dark:1},
 navy:{n:'ملكي',bg:'#0c1424',bg2:'#142036',ink:'#eef2f8',mut:'#9fb0c8',acc:'#d4b070',ai:'#1a1408',dark:1},
 burgundy:{n:'عنابي',bg:'#1a0f12',bg2:'#2a161b',ink:'#f6ece6',mut:'#c1a8a2',acc:'#d99a6c',ai:'#1d1008',dark:1},
 graphite:{n:'فحمي',bg:'#0f0f10',bg2:'#1a1a1c',ink:'#f1f1f1',mut:'#a0a0a6',acc:'#7dd3b0',ai:'#08170f',dark:1},
 rose:{n:'وردي',bg:'#1c1015',bg2:'#2b1820',ink:'#f8ecee',mut:'#c7a9b0',acc:'#e0a3b0',ai:'#2a0e16',dark:1},
 ocean:{n:'محيطي',bg:'#0a1a1f',bg2:'#10282f',ink:'#eaf4f4',mut:'#9bb8bc',acc:'#5fd0c4',ai:'#052420',dark:1},
 noir:{n:'أسود ذهبي',bg:'#080808',bg2:'#141414',ink:'#f6f1e4',mut:'#a8a396',acc:'#e3b94f',ai:'#1a1400',dark:1},
 cream:{n:'عاجي',bg:'#f5efe3',bg2:'#ebe3d2',ink:'#1e2723',mut:'#6b6a60',acc:'#8c5f26',ai:'#ffffff',dark:0}
};
const HFONTS={reem:'Reem Kufi',cairo:'Cairo',tajawal:'Tajawal',kufi:'Noto Kufi Arabic'};
const SHAPES={squircle:['30px','36px'],round:['50%','50%'],square:['14px','20px']};
const FONTS={tajawal:'Tajawal',cairo:'Cairo',almarai:'Almarai',plex:'IBM Plex Sans Arabic',kufi:'Noto Kufi Arabic'};
function applyTheme(t){
 t=t||{};const p=PRESETS[t.preset]||PRESETS.emerald,r=document.documentElement.style;
 const acc=t.accent||p.acc;
 r.setProperty('--bg',p.bg);r.setProperty('--bg2',p.bg2);r.setProperty('--ink',p.ink);r.setProperty('--mut',p.mut);
 r.setProperty('--acc',acc);r.setProperty('--ai',t.accent?'#111':p.ai);
 r.setProperty('--line',p.dark?'rgba(255,255,255,.1)':'rgba(0,0,0,.1)');
 r.setProperty('--glass',p.dark?'rgba(255,255,255,.07)':'rgba(255,255,255,.62)');
 r.setProperty('--glass2',p.dark?'rgba(20,28,25,.62)':'rgba(255,252,246,.74)');
 r.setProperty('--shadow',p.dark?'0 10px 40px rgba(0,0,0,.35)':'0 10px 30px rgba(80,60,20,.13)');
 const f=FONTS[t.font]||'Tajawal';r.setProperty('--font',`'${f}',Tajawal,system-ui,sans-serif`);
 const hf=HFONTS[t.hfont]||'Reem Kufi';r.setProperty('--hfont',`'${hf}','Reem Kufi',var(--font)`);
 const sh=SHAPES[t.shape]||SHAPES.squircle;r.setProperty('--lr',sh[0]);r.setProperty('--lrr',sh[1]);
 document.querySelector('meta[name=theme-color]')?.setAttribute('content',p.bg);
}
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number(n||0).toLocaleString('ar-IQ');
const EM=/(\p{Extended_Pictographic}\uFE0F?(?:\u200D\p{Extended_Pictographic}\uFE0F?)*)/gu;
function T(root){
 const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),ns=[];
 while(w.nextNode())ns.push(w.currentNode);
 ns.forEach(n=>{
  EM.lastIndex=0;if(!EM.test(n.nodeValue))return;EM.lastIndex=0;
  if(n.parentNode.closest('input,textarea,select,script,style'))return;
  const f=document.createDocumentFragment();
  n.nodeValue.split(EM).forEach(p=>{
   if(!p)return;EM.lastIndex=0;
   if(EM.test(p)){EM.lastIndex=0;
    const cp=[...p].map(c=>c.codePointAt(0).toString(16)).filter(x=>x!=='fe0f').join('-');
    const im=document.createElement('img');im.src='https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/'+cp+'.svg';im.alt=p;im.className='em';im.onerror=()=>im.replaceWith(document.createTextNode(p));f.appendChild(im)}
   else f.appendChild(document.createTextNode(p));
  });
  n.parentNode.replaceChild(f,n);
 });
}
let _busy=0;
function watchEmoji(){new MutationObserver(m=>{if(_busy)return;_busy=1;m.forEach(r=>r.addedNodes.forEach(n=>{if(n.nodeType===1)T(n);else if(n.nodeType===3&&n.parentNode)T(n.parentNode)}));_busy=0}).observe(document.body,{childList:true,subtree:true});T(document.body)}
const ICON={
 menu:'<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
 search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
 heart:'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
 info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
 phone:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
 pin:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
 clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
 wifi:'<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><path d="M12 20h.01"/>',
 qr:'<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>',
 insta:'<rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/>',
 chat:'<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
 plus:'<path d="M5 12h14"/><path d="M12 5v14"/>',
 edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
 trash:'<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
 up:'<path d="m18 15-6-6-6 6"/>',down:'<path d="m6 9 6 6 6-6"/>',
 eye:'<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
 palette:'<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.67 1.5-1.5 0-.4-.17-.75-.43-1.03-.26-.27-.4-.6-.4-.97 0-.83.67-1.5 1.5-1.5H16c3.3 0 6-2.7 6-6 0-4.9-4.5-9-10-9Z"/>',
 store:'<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/>',
 list:'<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
 grid:'<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
 gear:'<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
 cart:'<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
 minus:'<path d="M5 12h14"/>',check:'<path d="M20 6 9 17l-5-5"/>',bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',printer:'<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V2h12v7"/><rect width="12" height="8" x="6" y="14"/>',camera:'<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',receipt:'<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
 out:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>'
};
const ic=(n,s=22)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n]||''}</svg>`;
const BASE_CSS=`
:root{--bg:#0f1a16;--bg2:#17251f;--ink:#f3efe6;--mut:#a9b5ae;--acc:#c9a45c;--ai:#1a1408;--line:rgba(255,255,255,.1);--glass:rgba(255,255,255,.07);--glass2:rgba(20,28,25,.62);--shadow:0 10px 40px rgba(0,0,0,.35);--font:'Tajawal',system-ui,sans-serif;--hfont:'Reem Kufi',var(--font);--lr:30px;--lrr:36px}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html{scroll-behavior:smooth}
body{margin:0;font-family:var(--font);background:var(--bg);color:var(--ink);min-height:100vh}
body::before{content:"";position:fixed;inset:0;z-index:-1;background:radial-gradient(900px 480px at 90% -8%,color-mix(in srgb,var(--acc) 16%,transparent),transparent 62%),radial-gradient(700px 420px at -10% 40%,color-mix(in srgb,var(--acc) 8%,transparent),transparent 60%),var(--bg)}
button,input,select,textarea{font:inherit;color:inherit}
.em{height:1.1em;width:1.1em;vertical-align:-.15em;display:inline-block}
svg{flex:none}
.glass{background:var(--glass);border:1px solid var(--line);backdrop-filter:blur(20px) saturate(150%);-webkit-backdrop-filter:blur(20px) saturate(150%);border-radius:22px;box-shadow:var(--shadow)}
`;
