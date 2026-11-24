/* Lophus Football Fun — tier-capped OVR/Potential generator and skill rings C → ZZZ */

/* ---------- OVR & potential by tier: usual range, rare zone, hard cap ---------- */
const TIER_CONFIG={1:{ovr:{min:68,soft:82,hard:86},pot:{min:74,soft:88,hard:92}},2:{ovr:{min:62,soft:76,hard:76},pot:{min:68,soft:82,hard:85}},3:{ovr:{min:56,soft:70,hard:70},pot:{min:62,soft:76,hard:76}},4:{ovr:{min:50,soft:64,hard:64},pot:{min:56,soft:70,hard:70}},5:{ovr:{min:44,soft:58,hard:58},pot:{min:50,soft:64,hard:68}}};
const lgTier=lg=>{const L=LEAGUES[lg]||LEAGUES[3];return L.nat==='en'?L.tier:(L.q>=68?1:2)};
const bell=()=>(R()+R()+R())/3;
const rareRoll=(a,b)=>b<=a?a:a+Math.floor(Math.pow(R(),2.2)*(b-a+1));
const growth=a=>a<=18?ri(10,18):a<=20?ri(7,13):a<=23?ri(4,9):a<=26?ri(1,5):a<=28?ri(0,2):ri(0,1);
function genTierPlayer(tier,age,gem=false,bias=0){const c=TIER_CONFIG[tier]||TIER_CONFIG[4];
  let o=Math.round(c.ovr.min+(c.ovr.soft-c.ovr.min)*bell()+bias*.6);if(age<=21)o-=ri(3,8);o=Math.max(c.ovr.min-6,Math.min(c.ovr.soft,o));
  if(o>=c.ovr.soft-1&&c.ovr.hard>c.ovr.soft&&R()<(gem?.3:.12))o=rareRoll(c.ovr.soft+1,c.ovr.hard);
  let p=o+growth(age)+(gem?ri(3,6):0);if(p>c.pot.soft){p=c.pot.hard>c.pot.soft&&R()<(gem?.3:.06)?rareRoll(c.pot.soft+1,c.pot.hard):c.pot.soft-ri(0,3)}
  p=Math.min(c.pot.hard,Math.max(p,o));return{ovr:o,pot:p}}
genOVR=function(lg,age,isGem=false,bias=0){return genTierPlayer(lgTier(lg),age,isGem,bias)};
const hardPot=p=>{const c=p.club&&S.clubs[p.club];return c?TIER_CONFIG[lgTier(c.lg)].pot.hard:99};
function capPot(p,hard=hardPot(p)){if(!p.cap||p.pot<=hard)return;for(let i=0;i<6&&calcOvr(p,p.cap)>hard;i++){const d=hard-calcOvr(p,p.cap);ATT.forEach(k=>p.cap[k]=cl(p.cap[k]+d,p[k],99))}p.pot=Math.max(p.ovr,Math.min(hard,calcOvr(p,p.cap)));setVal(p)}
const _gp=genPlayer;genPlayer=function(...a){const p=_gp(...a);if(!p.gem)capPot(p);return p};
// gems: the best 1–4 stats can still reach 90+, but overall potential stays inside the tier's hard cap
gemCaps=function(p){const c=TIER_CONFIG[lgTier(S.clubs[p.club]?.lg??3)];const potT=R()<.3?rareRoll(c.pot.soft+1,c.pot.hard):c.pot.soft-ri(0,4);
  const n=pick([1,1,1,1,2,2,2,3,3,4]);p.gemTop=[p.sig].concat(shuffle(ATT.filter(k=>k!==p.sig))).slice(0,n);p.gemTop.forEach(k=>p.cap[k]=Math.min(97,Math.max(p[k],potT+ri(6,12))));
  for(let i=0;i<8;i++){const d=potT-calcOvr(p,p.cap);if(Math.abs(d)<1)break;const rest=ATT.filter(k=>!p.gemTop.includes(k));rest.forEach(k=>p.cap[k]=cl(p.cap[k]+d*1.4,p[k],95))}
  p.pot=Math.max(p.ovr,Math.min(c.pot.hard,calcOvr(p,p.cap)));p.gemv=3;setVal(p)};
const _cw=createWorld;createWorld=function(...a){const r=_cw(...a);for(const p of Object.values(S.P))if(!p.gem)capPot(p);S.potv=1;return r};

/* ---------- skill rings: C (bottom) to ZZZ (top) ---------- */
const RINGS=['ZZZ','ZZ','Z','SSS','SS','S','A','B','C'];
const RINGCOL=['#ffd84a','#b06bff','#4fc3ff','#ff6ad5','#ff6a2a','#f1b43c','#9b5de5','#3d8bfd','#9aa29d'];
TIERS.forEach((t,i)=>{t.old=t.old||t.n;t.n=RINGS[i];t.col=RINGCOL[i]});
const bestRing=p=>p&&p.tr&&p.tr.length?Math.min(...p.tr.map(id=>SK[id]?SK[id].t:8)):9;
// ZZZ, ZZ and Z players bend the match: the higher the ring, the bigger the edge
const _str2=strength;strength=function(cid,L){let s=_str2(cid,L);for(const p of L.xi.filter(Boolean)){const t=bestRing(p);s+=t===0?2.2:t===1?1.1:t===2?.5:0}return s};
function drawAura(g,q,x,y,r){const t=bestRing(q.p);if(t>8)return;const T=LM.t||0;const col=RINGCOL[t];g.save();
  if(t<=2){const R0=r*(t===0?5.2:t===1?3.8:2.8);const gr=g.createRadialGradient(x,y,r,x,y,R0);gr.addColorStop(0,col+'55');gr.addColorStop(1,col+'00');g.fillStyle=gr;g.beginPath();g.arc(x,y,R0,0,7);g.fill();
    g.strokeStyle=col;g.globalAlpha=.35+.2*Math.sin(T*4);g.setLineDash([4,5]);g.lineWidth=1.4;g.beginPath();g.arc(x,y,R0*.92,T*.6,T*.6+7);g.stroke();g.setLineDash([])}
  g.globalAlpha=1;
  if(t===0){for(let k=0;k<3;k++){g.strokeStyle=col;g.globalAlpha=.7-k*.18;g.lineWidth=2.4-k*.5;g.beginPath();g.arc(x,y,r+4+k*4+Math.sin(T*6+k)*1.5,0,7);g.stroke()}g.globalAlpha=1;g.fillStyle=col;g.font=`900 ${r}px sans-serif`;g.fillText('👑',x,y-r-9)}
  else if(t===1){g.fillStyle=col+'aa';const f=Math.sin(T*14)*.5;[-1,1].forEach(s=>{g.beginPath();g.ellipse(x+s*(r+6),y-3,r*.9,r*.42,s*(.5+f),0,7);g.fill()})}
  else if(t===2){g.strokeStyle=col;g.lineWidth=1.6;for(let k=0;k<3;k++){const a=T*9+k*2.1;g.beginPath();g.moveTo(x+Math.cos(a)*(r+2),y+Math.sin(a)*(r+2));g.lineTo(x+Math.cos(a+.3)*(r+8),y+Math.sin(a+.3)*(r+5));g.lineTo(x+Math.cos(a+.1)*(r+12),y+Math.sin(a+.1)*(r+10));g.stroke()}}
  else if(t===3){g.lineWidth=2.6;g.strokeStyle=`hsl(${(T*200)%360},90%,60%)`;g.beginPath();g.arc(x,y,r+4,0,7);g.stroke()}
  else if(t===4){for(let k=0;k<4;k++){const ph=(T*2+k*.25)%1;g.fillStyle=k%2?'#ff6a2a':'#ffb02a';g.globalAlpha=1-ph;g.beginPath();g.arc(x+(k-1.5)*r*.45,y-r-ph*r*1.6,r*.28*(1-ph)+1,0,7);g.fill()}g.globalAlpha=1}
  else if(t===5){g.strokeStyle=col;g.lineWidth=1.8;g.globalAlpha=.6+.4*Math.sin(T*8);g.beginPath();g.arc(x,y,r+3.5,0,7);g.stroke();g.beginPath();g.arc(x,y,r+7,0,7);g.stroke()}
  else if(t===6){g.strokeStyle=col;g.lineWidth=2.2;g.beginPath();g.arc(x,y,r+4,T*3,T*3+Math.PI);g.stroke()}
  else{g.strokeStyle=col;g.globalAlpha=t===7?.8:.5;g.lineWidth=t===7?2:1.2;g.beginPath();g.arc(x,y,r+3,0,7);g.stroke()}
  g.restore();
  if(t<=2&&q.s!=null)for(const o of LM.players){if(o.s===q.s||o.off)continue;const dx=o.x-q.x,dy=o.y-q.y;if(dx*dx+dy*dy<(t===0?.018:t===1?.009:.004))o.slow=6}}
if(typeof TMP!=='undefined'&&TMP&&!TMP.potv&&(!S||!S.me)){TMP=null;startScreen()}

/* ---------- a higher skill ring means a higher ceiling ---------- */
// floor for potential by best ring, relative to the club's tier: A near the top of the usual range, SSS at the tier cap, Z/ZZ/ZZZ beyond it
const RING_FLOOR=[c=>c.pot.hard+12,c=>c.pot.hard+7,c=>c.pot.hard+3,c=>c.pot.hard,c=>c.pot.soft,c=>c.pot.soft-3,c=>c.pot.soft-6,c=>c.pot.min+2,null];
function ringPot(p){const t=bestRing(p);if(t>8||!RING_FLOOR[t]||!p.cap)return;const c=TIER_CONFIG[lgTier(S.clubs[p.club]?.lg??3)];const want=Math.min(97,RING_FLOOR[t](c));if(p.pot>=want)return;
  for(let i=0;i<8&&calcOvr(p,p.cap)<want;i++){const d=want-calcOvr(p,p.cap);ATT.forEach(k=>p.cap[k]=cl(p.cap[k]+Math.ceil(d),p[k],99))}p.pot=Math.max(p.ovr,calcOvr(p,p.cap));p.ringp=t;setVal(p)}
function ringPotAll(){for(const p of Object.values(S.P))if(p.tr&&p.tr.length)ringPot(p)}
const _cw2=createWorld;createWorld=function(...a){const r=_cw2(...a);ringPotAll();return r};
const _dm=dynMonthly;dynMonthly=function(){_dm();ringPotAll()};
const _psR=playerSheet;playerSheet=function(id){const p=S.P[id];if(p)ringPot(p);return _psR(id)};
const _ed3=ensureDyn;ensureDyn=function(){_ed3();if(!S.ringp){ringPotAll();S.ringp=1}};
if(typeof TMP!=='undefined'&&TMP){const k=S;S=TMP;ringPotAll();S=k}
