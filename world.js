/* Lophus Football Fun — gem ceilings, coach tiers, onboarding, scouting › players, diary stop */

/* ---------- gems: 1 to 4 stats can reach 90+ ---------- */
function gemCaps(p){const n=pick([1,1,1,1,2,2,2,3,3,4]);const order=[p.sig].concat(shuffle(ATT.filter(k=>k!==p.sig)));p.gemTop=order.slice(0,n);p.gemTop.forEach(k=>p.cap[k]=Math.max(p.cap[k],ri(90,97)));ATT.forEach(k=>{if(!p.gemTop.includes(k))p.cap[k]=Math.max(p.cap[k],ri(70,84))});p.pot=Math.max(p.ovr,calcOvr(p,p.cap));p.gemv=2;setVal(p)}
const _genGem=genGem;genGem=function(club,t,lvl){const p=_genGem(club,t,lvl);gemCaps(p);return p};
function ensureGems(){if(!S||!S.P)return;for(const p of Object.values(S.P))if(p.gem&&p.gemv!==2&&p.cap)gemCaps(p)}

/* ---------- coach rating by league tier ---------- */
const CTB={1:{min:72,max:92,avg:80},2:{min:64,max:84,avg:72},3:{min:56,max:76,avg:64},4:{min:50,max:70,avg:58},5:{min:44,max:64,avg:52}};
function coachBand(lg){const L=LEAGUES[lg];return L.nat==='en'?CTB[L.tier]:{min:L.q+1,max:L.q+21,avg:L.q+9}}
function coachTarget(lg,big){const b=coachBand(lg);return cl(Math.round(b.avg+(R()+R()+R()-1.5)*6+(big?ri(4,9):0)),b.min,b.max)}
function ensureCoachTiers(){if(!S||S.ctier)return;for(const c of Object.values(S.clubs)){const co=S.C[c.coach];if(!co||isMe(c.id))continue;const t=coachTarget(c.lg,c.big);const now=Math.round((co.ta+co.dv+co.mm)/3);const d=t-now;['ta','dv','mm'].forEach(k=>co[k]=cl(co[k]+d,25,97));co.ai=cl(Math.round(co.ta*.6+t*.25+((co.id*37)%21)-5),8,99);co.wage=Math.round((Math.max(0,co.ta+co.dv+co.mm-120)*230+2500)/100)*100}S.ctier=1}
// a coach adds less and less above 80: an 80+ coach with a happy, settled squad can beat a 90+ coach
const _strength=strength;strength=function(cid,L){const ct=coachTa(cid);const capped=ct<=80?ct:80+(ct-80)*.35;let s=_strength(cid,L)-(ct-capped)*.08;
  const xi=L.xi.filter(Boolean);if(xi.length){const happy=xi.filter(p=>p.mo>=60).length/xi.length;const sulking=xi.filter(p=>p.mo<40).length;s+=(happy-.6)*2.5-sulking*.6}return s};

/* ---------- onboarding: 5 steps ---------- */
const AVC=['#e85d9a','#2f7de1','#1d9a6c','#f1a33c','#8e5be8','#e2412a'];
function startScreen(){if(!TMP){const keep=S;createWorld();TMP=S;S=keep}const W=TMP;const u=W.ui;u.step=u.step||1;u.st=u.st!=null?u.st:3;u.mgr=u.mgr||'Daryl';u.av=u.av||0;
  $('#top').style.display='none';$('#nav').style.display='none';V.style.padding='0';
  const L=LEAGUES[u.st];const steps=['Manager','Country','League','Club','Board'];
  const head=t=>`<div class="obh"><div class="lbl caps" style="color:var(--grn)">Step ${u.step} of 5</div><div class="row" style="gap:12px;margin:6px 0 12px">${u.step>1?`<button class="btn sm" data-a="obs:${u.step-1}" aria-label="Back">‹</button>`:dino(40)}<h1 style="font-size:32px">${t}</h1></div><div class="obbar">${steps.map((s,i)=>`<i class="${i<u.step?'on':''}"></i>`).join('')}</div></div>`;
  let body='',foot='';
  if(u.step===1){body=`<div style="text-align:center;margin:10px 0 18px"><div class="obav" style="background:${AVC[u.av]}">${esc((u.mgr||'?')[0].toUpperCase())}</div><div class="row" style="justify-content:center;gap:8px;margin-top:10px">${AVC.map((c,i)=>`<button class="swatch ${u.av===i?'on':''}" style="background:${c}" data-a="obav:${i}" aria-label="Colour ${i+1}"></button>`).join('')}</div></div><label class="f"><span>Your name, manager</span><input type="text" id="mgr" value="${esc(u.mgr)}" maxlength="24" autocomplete="off"></label><p class="sm mut">You are the manager: you run the club, hire the coach, buy and sell players and keep the board happy.</p>`;foot=`<button class="btn bigg wide" data-a="obs:2">Continue</button>`}
  if(u.step===2){body=`<p class="mut">Where do you want to start?</p>${Object.keys(NATS).map(n=>{const ls=LEAGUES.filter(l=>l.nat===n);return `<button class="mv ${L.nat===n?'sel':''}" data-a="obn:${n}"><span class="mvi disp">${NATN[n]}</span><span class="mvt"><b>${NATS[n]}</b><span>${ls.length} league${ls.length>1?'s':''} · ${ls.reduce((s,l)=>s+l.size,0)} clubs</span></span>${L.nat===n?'<span class="chk">✓</span>':CI.chev}</button>`}).join('')}`;foot=`<button class="btn bigg wide" data-a="obs:3">Continue</button>`}
  if(u.step===3){body=`<p class="mut">The lower you start, the longer the climb.</p>${LEAGUES.map((x,i)=>x.nat!==L.nat?'':`<button class="lgc ${u.st===i?'on':''}" data-a="obl:${i}"><span class="tierb ${u.st===i?'on':''}"><small>TIER</small><b class="disp">${x.tier}</b></span><span style="flex:1;text-align:left"><b>${esc(x.n)}</b><span class="row lgst"><b class="disp">${x.size}</b> clubs <b class="disp">${money(START[(x.nat==='en'?x.tier:(x.q>=70?1:2))-1])}</b> budget</span></span>${u.st===i?'<span class="chk">✓</span>':CI.chev}</button>`).join('')}`;foot=`<button class="btn bigg wide" data-a="obs:4">Continue</button>`}
  if(u.step===4){const clubs=Object.values(W.clubs).filter(c=>c.lg===u.st).sort((a,b)=>b.rep-a.rep);const sel=u.club&&W.clubs[u.club]&&W.clubs[u.club].lg===u.st?u.club:null;
    body=`<div class="lbl caps" style="margin-bottom:8px">${esc(L.n)} · ${clubs.length} clubs</div><div class="wheel" id="wheel"><div class="wsel"></div><div class="wlist" id="wlist">${clubs.map(c=>withW(W,()=>`<button class="wi ${sel===c.id?'on':''}" data-a="obc:${c.id}" data-cid="${c.id}">${crest(c,30)}<span class="b ell" style="flex:1;text-align:left">${esc(c.name)}</span><span class="chip ${statusOf(c)[1]}">${statusOf(c)[0]}</span><span class="ovr">${avgOvr(c.id)}</span></button>`)).join('')}</div></div>
    ${sel?withW(W,()=>{const c=W.clubs[sel];return `<div class="card pop-in" style="margin-top:12px"><div class="row" style="gap:12px">${crest(c,48)}<div style="flex:1"><h3>${esc(c.name)}</h3><div class="sm mut">${esc(c.ground)} · founded ${c.founded} · capacity ${c.cap.toLocaleString()}</div></div><span class="ovr" style="font-size:28px">${avgOvr(c.id)}</span></div></div>`}):'<p class="note" style="margin-top:10px">Tap a club, or spin and let fate decide.</p>'}`;
    foot=`<div class="grid2"><button class="btn" data-a="obspin" ${u.spin?'disabled':''}>🎲 ${u.spin?'Spinning…':'Spin'}</button><button class="btn bigg" style="font-size:22px;min-height:52px" data-a="obs:5" ${sel?'':'disabled'}>Choose</button></div><button class="btn sm" style="margin-top:8px" data-a="reroll">Generate a new world</button>`}
  if(u.step===5){const c=W.clubs[u.club];body=withW(W,()=>{const[st,,tgt]=statusOf(c);const top1=L.tier===1;const lt=tgt<=1?(top1?'Win the title':'Win the league'):tgt<=3?(top1?'Finish in the top 3':'Win promotion (top 3)'):tgt<=7?`Finish in the top half (top ${Math.round(L.size/2)})`:tgt<=13?'Stay out of trouble':'Avoid relegation';const cupT=c.big?'Reach the semi-finals':L.tier<=2?'Reach the quarter-finals':'Reach the 4th round';const fan=c.fans>=70?['High',85]:c.fans>=55?['Medium',60]:['Low',35];
      return `<div style="text-align:center;margin-bottom:12px"><div class="obav sm" style="background:${AVC[u.av]}">${esc(u.mgr[0].toUpperCase())}</div><h2 style="margin:8px 0 2px">${esc(u.mgr)}</h2><div class="mut">${esc(c.name)} · ${esc(L.n)} · ${esc(st)}</div></div><div class="lbl caps">Season objectives</div>
      ${[['flag','League',lt],['🏆','Cups',cupT],['📈','Finances','Finish the season in credit']].map(([ic,t,v])=>`<div class="mv"><span class="mvi">${ic==='flag'?CI.flag:ic}</span><span class="mvt"><span class="lbl caps">${t}</span><b>${v}</b></span></div>`).join('')}
      <p class="note">Only the league target is formally reviewed. The rest is what the boardroom hopes for.</p><div class="grid2"><div class="card" style="background:var(--grnbg);margin:0"><div class="lbl caps">Transfer budget</div><div class="disp" style="font-size:30px;color:var(--grn)">${money(START[c.t-1]*(c.big?2.5:1))}</div></div><div class="card" style="margin:0"><div class="lbl caps">Fan support</div>${segBar(fan[1])}<b style="color:#8a5a12">${fan[0]}</b></div></div>`});
    foot=`<button class="btn bigg wide" data-a="obgo">Enter the boardroom</button>`}
  V.innerHTML=`<div class="startbg ob"><div class="obwrap">${head(['Your manager','Choose a country','Choose a league','Choose your club','Board briefing'][u.step-1])}<div class="obbody">${body}</div><div class="obfoot">${foot}</div></div></div>`;
  if(u.step===4){const sel=u.club&&V.querySelector(`[data-cid="${u.club}"]`);if(sel)sel.scrollIntoView({block:'center'})}}
const TIPS=[['🔁','Transfers','Free agents cost nothing but wages: the best value when money is tight.'],['💎','Academy','Every club has a gem. Some of his stats can reach 90+ if you give him time.'],['📋','Coach','A happy, settled squad can beat a team with a better coach.'],['⚗️','Lab','Fuse skills between players with seeds. Higher tiers need more seeds.'],['🏟️','Stadium','A bigger stadium means more ticket money, but the pitch needs looking after.'],['🕵️','Scouting','Your sporting director\'s network decides how far your scouts can see.']];
function loadingScreen(done){let pc=0,ti=0;const W=S;const c=me();const draw=()=>{const t=TIPS[ti%TIPS.length];V.innerHTML=`<div class="startbg ob"><div class="obwrap" style="justify-content:space-between;text-align:center"><div><div class="disp" style="font-size:22px;color:var(--mut)">LOPHUS FOOTBALL FUN</div><div class="hr" style="width:60px;margin:10px auto"></div></div><div><div class="pitchmini">${[...Array(11)].map((_,i)=>`<i style="left:${[8,20,20,20,20,38,38,38,58,58,58][i]}%;top:${[50,18,40,60,82,28,50,72,25,50,75][i]}%;animation-delay:${i*.08}s"></i>`).join('')}<b class="ball"></b></div><span class="chip g" style="margin:16px auto 8px;display:inline-flex">${t[0]} ${t[1]}</span><p class="mut" style="max-width:300px;margin:0 auto">${t[2]}</p></div><div><div class="row"><span class="lbl caps">Opening your club</span><span class="sp disp" style="font-size:36px;color:var(--grn)">${pc}%</span></div><div class="bar" style="margin:6px 0 10px"><i style="width:${pc}%;transition:width .25s"></i></div><div class="lbl caps">${esc(c.name)} · Season ${seasonLbl(S.season)}</div></div></div></div>`};
  draw();const iv=setInterval(()=>{pc=Math.min(100,pc+ri(6,14));if(pc%3===0)ti++;draw();if(pc>=100){clearInterval(iv);setTimeout(done,250)}},140)}

/* ---------- scouting › players ---------- */
function reach(){const sd=S.me.sd||{net:50};const r=1+Math.floor((sd.net-40)/20)+Math.floor((S.me.fac.sc||1)/8);return Math.max(0,r)}
function inReach(c){if(!c)return true;if(isMe(c.id))return true;const myL=lgOf(me()),L=LEAGUES[c.lg];if(L.nat===myL.nat)return Math.abs(L.tier-myL.tier)<=reach();return L.tier===1&&reach()>=3}
const kn=p=>p.club===S.me.cid||S.me.unl.eyes||p.kn===S.me.cid||S.rep.some(r=>r.pids.includes(p.id));
function pRange(p,v){if(kn(p))return[v,v];if(!inReach(S.clubs[p.club]))return null;const sd=S.me.sd||{acc:50};const w=cl(Math.round(12-(sd.acc-40)/8),3,12);const off=(p.id*7+v)%(w+1);return[cl(v-off,1,99),Math.min(99,v-off+w)]}
const pTxt=(p,v)=>{const r=pRange(p,v);return !r?'?':r[0]===r[1]?`${v}`:`${r[0]}-${r[1]}`};
const deepCost=p=>{const L=LEAGUES[S.clubs[p.club]?.lg??3];return[50e3,30e3,15e3,8e3,4e3][(L.nat==='en'?L.tier:1)-1]};
const agentCost=p=>Math.max(20e3,Math.round(p.val*.08/1000)*1000);
function scPlayers(){const nat=S.ui.pnat||me().nat;const lg=S.ui.plg!=null?S.ui.plg:me().lg;const cid=S.ui.pclub;
  if(cid&&S.clubs[cid]){const c=S.clubs[cid];const ps=sq(cid).slice().sort((a,b)=>POSL.indexOf(a.pos)-POSL.indexOf(b.pos)||b.ovr-a.ovr);const ok=inReach(c);const known=ps.filter(kn).length;
    return `<button class="btn sm" data-a="pclub:" style="margin-bottom:10px">‹ ${esc(LEAGUES[c.lg].n)}</button><div class="row" style="gap:10px;margin-bottom:4px">${crest(c,36)}<h2 style="flex:1">${esc(c.name)}</h2></div><p class="sm mut">${ps.length} players · avg ${ok?pTxt({id:c.id,club:c.id,kn:0},avgOvr(c.id)):'?'}${known?` · ${known} fully scouted`:''}</p>
    <div class="card" style="padding:0 14px">${ps.map(p=>`<div class="prow2" data-a="pscout:${p.id}"><span class="pos ${p.pos}">${p.pos}</span><span style="flex:1;min-width:0"><b>${esc(p.name)}</b>${p.gem&&kn(p)?' 💎':''}<span class="sm mut" style="display:block">Age ${p.age} · ${p.pos} · ${NATN[p.nat]||p.nat}${S.me.short.includes(p.id)?' · ★':''}</span></span><span class="disp" style="font-size:24px;color:${pRange(p,p.ovr)?'var(--grn)':'var(--mut)'}">${pTxt(p,p.ovr)}</span></div>`).join('')}</div>
    ${ok?'':`<div class="card flat sm">🔭 Beyond your scouting network. A better sporting director (Network) or a bigger scouting facility widens your reach. You can still Deep Scout single players.</div>`}`}
  const clubs=Object.values(S.clubs).filter(c=>c.lg===+lg&&!isMe(c.id)).sort((a,b)=>b.rep-a.rep);const ok=inReach(clubs[0]);
  return `<div class="sm mut" style="margin:0 2px 8px">Browsing is free. Your network reaches ${reach()} tier${reach()===1?'':'s'} either side of yours${reach()>=3?' and the top flights abroad':''}.</div><div class="tabs">${Object.keys(NATS).map(n=>`<button class="${nat===n?'on':''}" data-a="pnat:${n}">${NATN[n]}</button>`).join('')}</div><div style="margin:8px 0">${LEAGUES.map((L,i)=>L.nat!==nat?'':`<button class="pill ${+lg===i?'on':''}" data-a="plg:${i}">${L.tier}. ${esc(L.n)}${inReach({id:0,lg:i})?'':' 🔒'}</button>`).join('')}</div>
  ${clubs.map(c=>`<button class="mv" data-a="pclub:${c.id}"><span style="flex:none">${crest(c,36)}</span><span class="mvt"><b>${esc(c.name)}</b><span>${sq(c.id).length} players · avg ${ok?pTxt({id:c.id,club:c.id},avgOvr(c.id)):'?'}</span></span>${CI.chev}</button>`).join('')}`}
function scoutSheet(id){const p=S.P[id];if(!p)return;const c=S.clubs[p.club];const t=S.ui.pst||'profile';const R0=pRange(p,p.ovr);const posY={GK:88,DF:70,MF:50,AM:32,ST:14}[p.pos]||50;const st=k=>{const v=k==='mo'?p.mo:k==='pot'?p.pot:p[k];const r=pRange(p,Math.round(v));return !r?'?':r[0]===r[1]?Math.round(v):`${r[0]}-${r[1]}`};
  modal(`<div class="row" style="gap:12px"><span class="posbig ${p.pos}">${p.pos}</span><div style="flex:1;min-width:0"><h2 class="ell">${esc(p.name)}</h2><div class="sm mut">${p.age} yrs · ${{GK:'Goalkeeper',DF:'Defender',MF:'Midfielder',AM:'Attacking mid',ST:'Striker'}[p.pos]}</div></div><span class="qbox ${R0?'':'r'}">${R0?(R0[0]===R0[1]?R0[0]:`${R0[0]}-${R0[1]}`):'?'}</span><button class="btn sm" data-a="close">✕</button></div>
  <div class="stabs"><button class="${t==='profile'?'on':''}" data-a="pst:profile:${id}">Profile</button><button class="${t==='career'?'on':''}" data-a="pst:career:${id}">Career</button></div>
  ${t==='profile'?`<div class="row" style="gap:14px;align-items:flex-start"><div class="pmini"><i style="top:${posY}%"></i></div><div style="flex:1"><div class="sm mut">Plays for ${c?esc(c.name):'nobody (free agent)'} · ${NATN[p.nat]||p.nat}</div><div class="sm" style="margin-top:6px">${kn(p)?'✅ Fully scouted':R0?'🔭 In your network: ratings are estimates. Deep Scout to see exact numbers.':'❓ Beyond your scouting network: Deep Scout to reveal.'}</div>${kn(p)&&p.tr.length?`<div style="margin-top:8px">${p.tr.map(skPill).join(' ')}</div>`:''}</div></div>
   <div class="grid2 sgrid">${[['tec','Technical'],['fast','Pace'],['phy','Physical'],['smart','Intelligence'],['mo','Morale'],['pot','Potential']].map(([k,l])=>`<div class="row"><span class="mut">${l}</span><b class="sp">${st(k)}</b></div>`).join('')}</div>`
  :`${kn(p)?careerBlock(p)||'<p class="mut">No career history yet.</p>':`<p class="mut">Deep Scout him to read his full career history.</p>`}`}
  <button class="btn bigg wide" data-a="pact:${id}" style="margin-top:12px">Actions</button>`)}
function scoutActions(id){const p=S.P[id];const on=S.me.short.includes(p.id);const ag=p.agent===S.me.cid;
  modal(`<div class="grab"></div><div class="row" style="gap:12px;margin-bottom:12px"><span class="posbig ${p.pos}" style="width:46px;height:46px;font-size:16px">${p.pos}</span><div><div class="lbl caps">Scout actions</div><b>${esc(p.name)}</b></div></div>
  <button class="mv ${kn(p)?'':'sel'}" data-a="pdeep:${id}" ${kn(p)?'disabled':''}><span class="mvi">🔍</span><span class="mvt"><b>${kn(p)?'Already fully scouted':`Deep Scout: ${money(deepCost(p))}`}</b><span>Reveal his exact ratings, skills and career</span></span></button>
  <button class="mv" data-a="poffer:${id}"><span class="mvi">€</span><span class="mvt"><b>Make offer</b><span>Open the transfer negotiation</span></span></button>
  <button class="mv" data-a="pagent:${id}" ${ag?'disabled':''}><span class="mvi">%</span><span class="mvt"><b>${ag?'His agent is on our side':`Hire agent: ${money(agentCost(p))}`}</b><span>Pay his agent: the player becomes far more willing to join</span></span></button>
  <button class="mv" data-a="pshort:${id}"><span class="mvi">${CI.mark}</span><span class="mvt"><b>${on?'Remove from shortlist':'Add to shortlist'}</b><span>Track this player</span></span></button>
  <button class="btn wide" data-a="pscout:${id}">Cancel</button>`)}
const _interest=interest;interest=function(p){const v=_interest(p);return p.agent===S.me.cid?Math.min(1,v+.3):v};
const _scout2=P.scout;P.scout=()=>{const T=[['overview','Overview'],['search','Search'],['players','Players'],['agency','Agency'],['reports','Reports'],['short','Shortlist'],['coaches','Coaches']];const t=S.ui.tab.scout||'overview';
  if(t==='players')return `<div class="row" style="margin-bottom:12px"><div><h1>Scouting</h1><div class="mut">Browsing a division is free</div></div></div>${tabs('scout',T)}${scPlayers()}`;
  return _scout2().replace(/<div class="tabs" role="tablist">[\s\S]*?<\/div>/,tabs('scout',T))};

/* ---------- actions ---------- */
Object.assign(A,{
 obs:n=>{const m=$('#mgr');if(m)TMP.ui.mgr=m.value.trim()||'Gaffer';TMP.ui.step=+n;if(+n===5&&!TMP.ui.club)return;startScreen()},
 obav:i=>{const m=$('#mgr');if(m)TMP.ui.mgr=m.value.trim()||'Gaffer';TMP.ui.av=+i;startScreen()},
 obn:n=>{TMP.ui.st=n==='en'?3:LEAGUES.findIndex(l=>l.nat===n);TMP.ui.club=null;startScreen()},
 obl:i=>{TMP.ui.st=+i;TMP.ui.club=null;startScreen()},
 obc:id=>{TMP.ui.club=+id;startScreen()},
 obspin:()=>{const u=TMP.ui;const ids=Object.values(TMP.clubs).filter(c=>c.lg===u.st).map(c=>c.id);u.spin=true;startScreen();let k=0;const n=ri(14,22);const tick=()=>{u.club=ids[k%ids.length];const list=V.querySelectorAll('.wi');list.forEach(b=>b.classList.toggle('on',+b.dataset.cid===u.club));const el=V.querySelector(`[data-cid="${u.club}"]`);if(el)el.scrollIntoView({block:'center',behavior:'smooth'});if(navigator.vibrate)try{navigator.vibrate(4)}catch(_){}k+=ri(1,3);if(k<n)setTimeout(tick,60+k*14);else{u.club=ids[ri(0,ids.length-1)];u.spin=false;startScreen()}};tick()},
 obgo:()=>{const u=TMP.ui;const name=u.mgr||'Gaffer';const id=u.club;const el=document.createElement('input');el.id='mgr';el.value=name;el.style.display='none';document.body.appendChild(el);A.pickclub(id);el.remove();S.me.av=AVC[u.av];closeModal();$('#top').style.display='none';$('#nav').style.display='none';loadingScreen(()=>{$('#top').style.display='';$('#nav').style.display='';V.style.padding='';go('home')})},
 pnat:n=>{S.ui.pnat=n;S.ui.plg=LEAGUES.findIndex(l=>l.nat===n);S.ui.pclub=null;render()},plg:i=>{S.ui.plg=+i;S.ui.pclub=null;render()},pclub:id=>{S.ui.pclub=id?+id:null;render()},
 pscout:id=>{S.ui.pst='profile';scoutSheet(+id)},pst:(t,id)=>{S.ui.pst=t;scoutSheet(+id)},pact:id=>scoutActions(+id),
 pdeep:id=>{const p=S.P[+id];const c=deepCost(p);if(S.me.money<c)return toast('Not enough money for a deep scout.');S.me.money-=c;p.kn=S.me.cid;save();render();S.ui.pst='profile';scoutSheet(p.id);toast(`${p.name} fully scouted.`)},
 pagent:id=>{const p=S.P[+id];const c=agentCost(p);if(S.me.money<c)return toast('Not enough money.');S.me.money-=c;p.agent=S.me.cid;save();toast(`His agent is now pushing him towards us.`);scoutActions(p.id)},
 pshort:id=>{const p=S.P[+id];const i=S.me.short.indexOf(p.id);if(i>=0)S.me.short.splice(i,1);else S.me.short.push(p.id);save();render();toast(i>=0?'Removed from the shortlist.':`${p.name} added to the shortlist.`);scoutActions(p.id)},
 poffer:id=>{closeModal();playerSheet(+id)},
 later:()=>{closeModal();render()},
});
// diary: when the run stops for mail, show the day list with Read mail / Later
const _openMail=openMail;openMail=function(id){if(S._fromRun){S._fromRun=false;const m=S.mail.find(x=>x.id===id);const o=dobj(S.d);const days=[-1,0,1].map(k=>{const q=dobj(S.d+k);return{k,lab:`${WD[q.wd]}`,d:`${q.day} ${MON[q.m]}`}});
  modal(`<div class="row" style="gap:12px;margin-bottom:8px"><span class="mvi" style="width:46px;height:46px">⏸</span><div style="flex:1"><div class="lbl caps" style="color:#8a5a12">${WD[o.wd]} ${o.day} ${MON[o.m]}</div><h2>Stopped</h2></div></div>
  ${days.map(x=>x.k===0&&m?`<div class="diary on"><div class="dd"><small>${x.lab}</small><b class="disp">${x.d}</b></div><div style="flex:1"><div class="lbl caps" style="color:#8a5a12">Mail · ${esc(m.from||'')}</div><b>${esc(m.title)}</b></div></div>`:`<div class="diary"><div class="dd"><small>${x.lab}</small><b class="disp">${x.d}</b></div><div style="flex:1"><b class="mut">${x.k<0?'Quiet day at the club':'Nothing in the diary'}</b></div></div>`).join('')}
  <div class="grid2" style="margin-top:12px"><button class="btn" style="background:#8a5a12;color:#fff" data-a="readm:${id}">Read mail</button><button class="btn" data-a="later">Later</button></div>`);return}
  return _openMail(id)};
A.readm=id=>{closeModal();_openMail(+id)};
A.reroll=()=>{const u=TMP.ui;TMP=null;startScreen();Object.assign(TMP.ui,{mgr:u.mgr,av:u.av,st:u.st,step:4,club:null});startScreen()};
const _ensureDyn2=ensureDyn;ensureDyn=function(){_ensureDyn2();if(!S.gemv2){ensureGems();S.gemv2=1}ensureCoachTiers()};
if(TMP&&(!S||!S.me))startScreen();

/* ---------- two-tier rule: nobody drops more than two levels, unless you own Final Say ---------- */
const clubLvl=c=>{const L=LEAGUES[c.lg];return L.nat==='en'?L.tier:(L.q>=65?1:2)};
const plLvl=p=>p.ovr>=71?1:p.ovr>=65?2:p.ovr>=59?3:p.ovr>=40?4:5;
const coLvl=co=>{const r=cRating(co);return r>=80?1:r>=72?2:r>=64?3:r>=58?4:5};
const gapTo=(lvl,c)=>clubLvl(c)-lvl;const LVN=['','Crown League','Sovereign Division','Division One','Division Two','Counties League'];
const outOfReach=(lvl,c)=>!boss()&&gapTo(lvl,c)>2;
const reachMsg=(name,lvl)=>`${name} is a ${LVN[lvl]}-level ${lvl===1?'talent':'name'} and won't drop more than two tiers to join ${me().name}. Win promotion first, or get Final Say in the Store.`;
const _interest3=interest;interest=function(p){if(p.club!==S.me.cid&&outOfReach(plLvl(p),me()))return 0;return _interest3(p)};
const _ifor=interestFor;interestFor=function(p,c){if(p.club!==c.id&&gapTo(plLvl(p),c)>2)return 0;return _ifor(p,c)};
const _mo=makeOffer;makeOffer=function(p,fee){if(p.club!==S.me.cid&&outOfReach(plLvl(p),me()))return reachMsg(p.name,plLvl(p));return _mo(p,fee)};
const _sf=signFree;signFree=function(p){if(outOfReach(plLvl(p),me()))return reachMsg(p.name,plLvl(p));return _sf(p)};
const _at=approachTerms;approachTerms=function(c){const t=_at(c);if(outOfReach(coLvl(c),me()))t.int=0;return t};
const _happ=A.happ;A.happ=id=>{const c=S.C[+id];if(c&&outOfReach(coLvl(c),me()))return modal(`<div style="text-align:center"><div style="font-size:46px">🚫</div><h2>Not interested</h2><p class="sm">${esc(reachMsg(c.name,coLvl(c)))}</p><button class="btn" data-a="close">OK</button></div>`);return _happ(id)};
const _ahc=aiHireCoach;aiHireCoach=function(c){const keep=S.pool;S.pool=S.pool.filter(id=>S.C[id]&&gapTo(coLvl(S.C[id]),c)<=2);if(!S.pool.length)S.pool=keep;const co=_ahc(c);S.pool=keep.filter(x=>x!==co.id);return co};
const reachChip=(lvl)=>outOfReach(lvl,me())?`<div class="chip r" style="margin:8px 0">🚫 Won't drop to your level · needs ${LVN[Math.max(1,lvl+2)]} or higher</div>`:'';
const _ss=scoutSheet;scoutSheet=function(id){_ss(id);const p=S.P[id];const r=pRange(p,p.ovr);if(r&&p.club!==S.me.cid){const el=$('#sheet .stabs');if(el)el.insertAdjacentHTML('beforebegin',reachChip(plLvl({ovr:r[1]})))}};
const _cs2=coachSheet;coachSheet=function(id){_cs2(id);const c=S.C[id];if(c&&!isMe(c.club)){const el=$('#sheet .grid3');if(el)el.insertAdjacentHTML('beforebegin',reachChip(coLvl(c)))}};
const _ps=playerSheet;playerSheet=function(id){_ps(id);const p=S.P[id];if(p&&p.club!==S.me.cid&&outOfReach(plLvl(p),me())){const sh=$('#sheet');if(sh&&sh.firstElementChild)sh.firstElementChild.insertAdjacentHTML('afterend',reachChip(plLvl(p)))}};
