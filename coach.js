/* Lophus Football Fun — coaches: skills, contracts, secret search, sacking */
const CFXV={tec:[5,4,3,3,2,2,1,1,1],fast:[5,4,3,3,2,2,1,1,1],phy:[5,4,3,3,2,2,1,1,1],smart:[5,4,3,3,2,2,1,1,1],ta:[14,10,8,6,5,4,3,2,1],dv:[14,10,8,6,5,4,3,2,1],mm:[14,10,8,6,5,4,3,2,1],ai:[14,10,8,6,5,4,3,2,1],yth:[60,45,35,25,18,14,10,6,4],fit:[50,40,32,25,20,15,10,7,4],mor:[80,75,70,66,62,58,55,52,50],trust:[70,55,45,35,28,22,15,10,6],clife:[200,140,100,75,55,40,30,20,10]};
const CFAM=[['ta',['Blueprint','Chalkboard','Gambit','Doctrine','Playbook','War Table','Masterplan','Tactic Rune']],['dv',['Forge','Mentorship','Whetstone','Workshop','Seedbed','Lesson']],['mm',['Embrace','Hearth','Pep Talk','Open Door','Bond','Pact']],['ai',['Foresight','Third Eye','Chessmind','Oracle','Insight','Touchline Eye']],['tec',['Rondo','Silk School','Touch Drills']],['fast',['Sprint Ladder','Wind Regime','Pace Lab']],['phy',['Iron Camp','Titan Regime','Hill Runs']],['smart',['Film Room','Scholar Hall','Video Vault']],['yth',['Cradle','Academy Lantern','Sapling Grove']],['fit',['Healing Spring','Physio Rune','Ice Bath']],['mor',['Banner','Anthem','Rallying Horn']],['trust',['Oath','Loyalty Seal','Handshake']],['clife',['Elder Patience','Long Whistle']]];
const CMINOR=[['Old Guard',{mm:2,trust:6}],['Firebrand',{mor:55,ai:2}],['Professor',{ta:2,smart:1}],['Father Figure',{dv:2,yth:6}],['Drill Sergeant',{phy:1,fit:5}],['Silver Fox',{clife:15,ta:1}],['Showman',{mor:52,mm:2}],["Scout's Nose",{dv:1,yth:8}]];
const CACTS=[{k:'tempo',n:'Masterclass',d:'team strength +6 this match'},{k:'aegis',n:'Mind Games',d:'opponent scoring chance ×0.55 this match'},{k:'strike',n:'All-Out Attack',d:'team scoring chance ×1.6 this match'},{k:'frenzy',n:'Touchline Fury',d:'squad morale +6 after the match'},{k:'miracle',n:'Final Whistle',d:'a late goal if the team is not winning'}];
const EVOK={tec:'tec',fast:'fast',phy:'phy',smart:'smart',grow:'dv',life:'clife',morale:'mor',inj:'fit',clutch:'ai',lead:'ta',cap:'yth'};
const EVON={ta:'Doctrine',dv:'School',mm:'Bond',ai:'Vision',tec:'Method',fast:'Method',phy:'Regime',smart:'Lectures',yth:'Nursery',fit:'Remedy',mor:'Creed',trust:'Oath',clife:'Patience'};
const CSKB=[],CSKX=[],CBASE=100000,CEVO=200000;
(function buildCoachSkills(){const rnd=mulberry(20271122);const nouns=[];CFAM.forEach(([f,ns])=>ns.forEach(n=>nouns.push([f,n])));
  const mk=(t,f)=>{const v=CFXV[f][Math.min(8,t)]*(f==='mor'?1:.85+rnd()*.3);return Math.max(1,Math.round(v))};
  for(let t=0;t<9;t++){CSKB[t]=[];CSKX[t]=[];const combos=[];(t===0?GODS:ADJ[t]).forEach(a=>nouns.forEach(nn=>combos.push([a,nn])));shuffle(combos,rnd);const N=t===0?50:100;
    for(let i=0;i<N&&i<combos.length;i++){const[a,[f,n]]=combos[i];const id=CBASE+t*1000+i;const name=t===0?`${a}'s ${n}`:t===5?`${n} of the ${a}`:`${a} ${n}`;const fx={[f]:mk(t,f)};
      if(t<=2&&rnd()<.6){const f2=CFAM[Math.floor(rnd()*CFAM.length)][0];if(f2!==f)fx[f2]=mk(t+1,f2)}
      const s={id,t,n:name,fx,co:1};if(t===0){const a2=CACTS[Math.floor(rnd()*CACTS.length)];s.act={k:a2.k,n:a2.n,d:a2.d,ch:Math.round((.15+rnd()*.15)*100)/100}}SK[id]=s;CSKB[t].push(s)}
    for(let i=0;i<32;i++){const b=CSKB[t][Math.floor(rnd()*CSKB[t].length)];const[mn,mf]=CMINOR[Math.floor(rnd()*CMINOR.length)];const id=CBASE+t*1000+500+i;const fx={...b.fx};for(const k in mf)fx[k]=k==='mor'?Math.max(fx[k]||0,mf[k]):(fx[k]||0)+mf[k];const s={id,t,n:`${b.n} ✦ ${mn}`,fx,mix:mn,co:1};if(b.act)s.act=b.act;SK[id]=s;CSKX[t].push(s)}}
  // every player skill has an evolved coaching form, unlocked when a player retires into coaching
  for(const id in SK){const s=SK[id];if(s.co||+id>=CBASE)continue;const fx={};for(const k in s.fx){const ck=EVOK[k];if(!ck)continue;const v=CFXV[ck][s.t]+(s.mix?(ck==='mor'?0:1):0);fx[ck]=ck==='mor'?Math.max(fx[ck]||0,v):(fx[ck]||0)+v}
    const main=EVOK[Object.keys(s.fx)[0]]||'ta';const e={id:CEVO+s.id,t:s.t,n:`${s.n} ${EVON[main]}`,fx,co:1,evo:s.id};if(s.act)e.act=s.act.k==='heal'?{...CACTS[0],ch:s.act.ch}:{...s.act};SK[e.id]=e}
})();
function rollCoachTraits(c,boost=0){c.tr=c.tr||[];if(R()>.45+boost)return;const n=R()<.7?1:R()<.75?2:3;for(let i=0;i<n;i++){const t=rollTier();const l=R()<.08?CSKX[t]:CSKB[t];const id=pick(l).id;if(!c.tr.includes(id))c.tr.push(id)}}
let CFC={};
function cfxOf(co){if(!co||!co.tr||!co.tr.length)return{};const key=co.tr.join(',');const h=CFC[co.id];if(h&&h.k===key)return h.fx;const fx={};for(const id of co.tr){const s=SK[id];if(!s)continue;for(const k in s.fx)fx[k]=k==='mor'?Math.max(fx[k]||0,s.fx[k]):(fx[k]||0)+s.fx[k]}CFC[co.id]={k:key,fx};return fx}
const cfx=cid=>cfxOf(coachOf(cid));
const CL={ta:'Tactical',dv:'Development',mm:'Man management',ai:'Match AI'};
function cfxText(fx){const o=[];for(const k in fx){const v=fx[k];o.push(k in AL?`Squad ${AL[k]} +${v}`:k in CL?`${CL[k]} +${v}`:k==='yth'?`Youth growth +${v}%`:k==='fit'?`Squad injury risk −${v}%`:k==='mor'?`Squad morale never below ${v}`:k==='trust'?`Your trust losses −${v}%`:k==='clife'?`Coaching career +${v}%`:k)}return o.join(' · ')}
const cEff=(co,k)=>co?Math.min(99,co[k]+(cfxOf(co)[k]||0)):0;
const cRating=co=>Math.round((cEff(co,'ta')+cEff(co,'dv')+cEff(co,'mm'))/3);
const retireAge=co=>68+Math.floor((cfxOf(co).clife||0)/25);
const ageNote=co=>co.age<48?'Still improving':co.age<62?'At his peak':co.age>=retireAge(co)-1?'Thinking about retirement':'Slowly declining';
function ensureCoaches(){if(!S||!S.C)return;for(const c of Object.values(S.C)){if(c.ctr==null)c.ctr=c.club?ri(8,36):0;if(!c.tr){c.tr=[];rollCoachTraits(c)}if(!c.hist)c.hist=[]}if(S.me&&S.me.hunt===undefined)S.me.hunt=null;CFC={}}

/* ---------- contracts and the yearly cycle ---------- */
function aiHireCoach(c){const pool=S.pool.map(id=>S.C[id]).filter(x=>x&&!x.club).sort((a,b)=>(coachAI(b)+cRating(b))-(coachAI(a)+cRating(a)));const n=Object.values(S.clubs).filter(x=>x.lg===c.lg).length;const idx=Math.min(pool.length-1,Math.floor((repRank(c)-1)/Math.max(1,n)*Math.min(pool.length,12)));let co=pool[Math.max(0,idx)];if(!co)co=genCoach(lq(c)-4);co.club=c.id;co.ctr=ri(18,36);c.coach=co.id;S.pool=S.pool.filter(x=>x!==co.id);return co}
function caretaker(){const c=me();const co=genCoach(Math.max(30,lq(c)-10),c.id);co.club=c.id;co.caretaker=true;co.ctr=6;co.tr=[];co.wage=Math.round(co.wage*.6/100)*100;c.coach=co.id;S.me.trust=55;S.me.tlog=[];return co}
function payoffOf(co){return co&&!co.caretaker?Math.round(co.wage*Math.min(Math.max(co.ctr,1),18)*.5/1000)*1000:0}
function formPts(){const r=(S.me.res||[]).slice(-6);return r.length?r.reduce((s,x)=>s+(x.gf>x.ga?3:x.gf===x.ga?1:0),0)/r.length:1.4}
function backlash(co){if(!co||co.caretaker)return 0;return Math.round(cl(4+(formPts()-1.2)*5+(cEff(co,'mm')-55)/10+(S.me.trust-50)/20,0,16))}
function coachMonthly(){for(const co of Object.values(S.C)){if(!co.club)continue;const c=S.clubs[co.club];if(!c||S.C[c.coach]!==co){co.club=0;continue}co.ctr=Math.max(0,(co.ctr||0)-1);
    if(isMe(co.club)){if(co.ctr===3&&!co.caretaker)mail('staff',{from:co.name,title:'Three months left on my contract',html:`<p>Boss, my deal runs out in three months. I'd like to know where I stand. Renew it in Staff, or I walk away for nothing.</p>`});
      if(co.ctr<=0){if(co.caretaker){co.ctr=6;continue}const ret=co.age>=retireAge(co);co.club=0;if(ret){delete S.C[co.id];news('coach',`${co.name} retires from coaching.`,[c.id])}else S.pool.push(co.id);const ct=caretaker();S.me.log.push({s:S.season,d:S.d,txt:`${co.name} ${ret?'retired':'left when his contract ran out'}`});
        mail('staff',{from:co.name,title:ret?'I am retiring':'My contract has run out',html:`<p>${ret?'Time to hang up the whistle. Thank you for everything.':'Nobody renewed my contract, so I am moving on. Good luck.'}</p><p>${esc(ct.name)} takes over as caretaker until you appoint someone. Start a secret search in Staff.</p>`})}}
    else if(co.ctr<=0){if(co.age<retireAge(co)&&R()<.78){co.ctr=ri(12,36);co.wage=Math.round(co.wage*1.06/100)*100}else{const ret=co.age>=retireAge(co);co.club=0;if(ret)delete S.C[co.id];else S.pool.push(co.id);const nc=aiHireCoach(c);news('coach',`${co.name} ${ret?'retires':'leaves at the end of his contract'}. ${c.name} appoint ${nc.name}.`,[c.id])}}}
  huntApplications(true)}
function coachSeason(s){CFC={};for(const co of Object.values(S.C)){if(co.club&&S.clubs[co.club]){const c=S.clubs[co.club];const h=c.hist[c.hist.length-1];const tr=c.troph.filter(t=>t.s===s).map(t=>t.n);(co.hist||(co.hist=[])).push({s,c:c.id,cn:c.name,lg:c.lg,pos:h&&h.s===s?h.pos:0,tr})}
    if(co.age<48)['ta','dv','mm'].forEach(k=>co[k]=cl(co[k]+ri(0,2),25,97));else if(co.age>62&&R()<.4)['ta','dv','mm'].forEach(k=>co[k]=cl(co[k]-ri(0,1),25,97));
    if(!co.club&&co.age>=retireAge(co)&&!(S.me.hunt&&huntIds().includes(co.id))){delete S.C[co.id];S.pool=S.pool.filter(x=>x!==co.id)}}
  trimPool()}
function trimPool(){S.pool=[...new Set(S.pool)].filter(id=>S.C[id]&&!S.C[id].club);if(S.pool.length>70){const keep=new Set(S.me&&S.me.hunt?huntIds():[]);const srt=S.pool.map(id=>S.C[id]).sort((a,b)=>cRating(b)+b.tr.length*4-cRating(a)-a.tr.length*4);S.pool=srt.slice(0,70).map(c=>c.id);srt.slice(70).forEach(c=>{if(!keep.has(c.id))delete S.C[c.id];else S.pool.push(c.id)})}}
function exCoach(p){let ch=.1+(p.ovr-60)/160+(p.smart-60)/220+(p.aw?p.aw.length*.02:0);if(R()>cl(ch,.04,.5))return;const best=Object.keys(TAC).map(t=>[t,TAC[t].reduce((s,w,i)=>s+w*p[ATT[i]],0)]).sort((a,b)=>b[1]-a[1])[0][0];
  const apps=(p.hist||[]).reduce((s,h)=>s+h.a,0),gls=(p.hist||[]).reduce((s,h)=>s+h.g,0);const clubs=[...new Set((p.hist||[]).map(h=>h.cn))];
  const c={id:++S.nid,name:p.name,nat:p.nat,age:p.age+ri(1,3),tac:best,form:pick(Object.keys(FORMS)),ta:cl(Math.round(p.smart*.62+18+nrm()*8),25,92),dv:cl(Math.round(40+p.tec*.25+nrm()*9),25,92),mm:cl(Math.round(42+apps/30+(p.aw?p.aw.length*2:0)+nrm()*8),25,92),club:0,aw:[],ctr:0,hist:[],tr:[],ex:{peak:p.ovr,apps,g:gls,pos:p.pos,clubs:clubs.slice(-4),aw:p.aw?p.aw.length:0}};
  c.ai=cl(Math.round(c.ta*.6+p.smart*.3+nrm()*10),8,99);c.wage=Math.round((Math.max(0,c.ta+c.dv+c.mm-120)*230+2500)/100)*100;
  for(const sid of p.tr||[])if(SK[CEVO+sid]&&R()<.75)c.tr.push(CEVO+sid);rollCoachTraits(c,.05);S.C[c.id]=c;S.pool.push(c.id);
  news('coach',`${p.name} hangs up his boots and starts coaching${c.tr.length?`, bringing ${c.tr.map(id=>SK[id].n).slice(0,2).join(' and ')} with him`:''}.`,p.club?[p.club]:[]);return c}

/* ---------- appointing, renewing, sacking ---------- */
function appointCoach(c,{wage,comp=0,ctr=24}){const cur=coachOf(S.me.cid);const pay=payoffOf(cur);const bl=backlash(cur);S.me.money-=comp+pay;
  if(cur){cur.club=0;cur.ctr=0;if(cur.caretaker)delete S.C[cur.id];else S.pool.push(cur.id);if(bl&&!S.me.unl.fanlock)me().fans=cl(me().fans-bl,0,100)}
  const old=c.club&&S.clubs[c.club];if(old){old.money=(old.money||0)+comp;c.club=0;const nc=aiHireCoach(old);news('coach',`${old.name} lose ${c.name} to ${me().name} and appoint ${nc.name}.`,[old.id,S.me.cid])}
  c.club=S.me.cid;c.ctr=ctr;c.wage=wage;c.caretaker=false;me().coach=c.id;S.pool=S.pool.filter(x=>x!==c.id);S.me.trust=60;S.me.tlog=[];trust(0,`Appointed ${c.name}`);CFC={};
  S.me.log.push({s:S.season,d:S.d,txt:`Appointed ${c.name} as head coach${cur&&!cur.caretaker?`, replacing ${cur.name}`:''}`});news('coach',`${me().name} appoint ${c.name} as head coach.`,[S.me.cid]);
  const h=S.me.hunt;S.me.hunt=null;return{pay,bl,comp,leak:h?h.leak:0}}
function renewDemand(co,len){const perf=formPts()-1.3;return Math.round(co.wage*(1+Math.max(0,cRating(co)-60)/220+Math.max(0,perf)*.08+(len===36?.06:len===12?-.04:0))/100)*100}
function renewChance(co,len){if(boss())return 1;if(co.age>=retireAge(co)-1&&len>12)return .05;return cl(.45+(S.me.trust-50)/90+(me().rep-cRating(co))/120+(formPts()-1.3)*.15-(S.me.hunt&&S.me.hunt.leak>=100?.35:0),.08,.95)}

/* ---------- secret search ---------- */
const HB={sty:'Any',form:'Any',age:'Any',min:0,ta:0,dv:0,mm:0,wage:0};
const huntIds=()=>{const h=S.me.hunt;return h?[...new Set([...(h.ag||[]),...(h.apps||[]),...(h.short||[])])].filter(id=>S.C[id]):[]};
function huntStart(){S.me.hunt={on:true,start:S.d,b:{...HB},ag:[],apps:[],short:[],leak:0,due:0,approached:[],refused:[]};mail('board',{title:'Secret search started',html:'<p>We\'ll keep this quiet. The longer it runs, and the more people we talk to, the more likely the press and your coach find out.</p>'})}
const briefCost=()=>[80e3,40e3,20e3,11e3,6e3][me().t-1]||11e3;
function huntMatch(c,b){if(!c||isMe(c.club))return false;if(b.sty!=='Any'&&c.tac!==b.sty)return false;if(b.form!=='Any'&&c.form!==b.form)return false;
  if(b.age!=='Any'){const[a0,a1]={'Under 45':[0,44],'45–55':[45,55],'56–62':[56,62],'Over 62':[63,99]}[b.age]||[0,99];if(c.age<a0||c.age>a1)return false}
  if(b.min&&cRating(c)<b.min)return false;if(b.ta&&cEff(c,'ta')<b.ta)return false;if(b.dv&&cEff(c,'dv')<b.dv)return false;if(b.mm&&cEff(c,'mm')<b.mm)return false;if(b.wage&&c.wage>b.wage)return false;return true}
function huntDay(){const h=S.me&&S.me.hunt;if(!h)return;const prev=h.leak;h.leak=cl(h.leak+.35+(h.due?.5:0)+h.short.length*.15,0,100);
  if(prev<50&&h.leak>=50){trust(-4,'Rumours of a secret search');mail('info',{from:'Local Press',title:'Is the coach under pressure?',html:'<p>Whispers around the club suggest the board are sounding out replacements. Nobody is confirming anything yet.</p>'})}
  if(prev<100&&h.leak>=100){trust(-18,'Found out about your secret search');const co=coachOf(S.me.cid);sq(S.me.cid).forEach(p=>p.mo=cl(p.mo-4,0,100));mail('staff',{from:co?.name||'Head coach',title:'I know what you are doing',html:'<p>I read about the search in the papers. If you want me gone, have the courage to say it to my face.</p>'})}
  if(h.due&&S.d>=h.due){h.due=0;const all=Object.values(S.C).filter(c=>huntMatch(c,h.b)&&!h.refused.includes(c.id));const sc=c=>cRating(c)*1.2+coachAI(c)*.3+c.tr.length*3-(c.club?6:0)-c.wage/4000+R()*6;all.sort((a,b)=>sc(b)-sc(a));h.ag=all.slice(0,8).map(c=>c.id);
    mail('info',{from:'Coaching agency',title:h.ag.length?`${h.ag.length} candidates for your brief`:'No one fits your brief',html:h.ag.length?`<p>We found ${h.ag.length} coaches who match. They are waiting in your shortlist under Agency candidates.</p>`:'<p>Nobody matches every filter. Loosen the brief and try again.</p>'})}
  huntApplications(false)}
function huntApplications(monthly){const h=S.me&&S.me.hunt;if(!h)return;if(R()>(monthly?.6:.025+h.leak/2500))return;const c=pick(S.pool.map(id=>S.C[id]).filter(c=>c&&!c.club&&!h.apps.includes(c.id)&&!h.refused.includes(c.id)));if(!c)return;h.apps.push(c.id);mail('info',{from:c.name,title:'Application: head coach',html:`<p>I hear you might be looking. I'm available now and I'd love the job.</p><p>${esc(c.tac)} · ${esc(c.form)} · rating ${cRating(c)}</p>`})}
function approachTerms(c){const emp=!!c.club;const comp=emp?Math.round(c.wage*Math.min(Math.max(c.ctr,3),24)*.6/1000)*1000:0;const wage=Math.round(c.wage*(emp?1.22:1.04)/100)*100;const pull=me().rep+(5-me().t)*6;const from=emp?S.clubs[c.club]:null;
  const int=boss()?1:cl(.6+(pull-cRating(c))*.012-(emp?.12:0)-(from&&from.rep>me().rep?.25:0)-(from&&from.big?.15:0)+(me().big?.15:0),.04,.96);return{comp,wage,int,emp,pay:payoffOf(coachOf(S.me.cid))}}
