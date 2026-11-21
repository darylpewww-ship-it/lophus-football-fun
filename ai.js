/* Lophus Football Fun — AI clubs: budgets, scouting, transfers, facilities, academies, coaching changes; player careers */
function news(type,txt,cids=[]){if(!S.news)S.news=[];S.news.unshift({d:S.d,s:S.season,type,txt,c:cids});if(S.news.length>600)S.news.length=600}
function moveRec(p,from,to,fee,kind){(p.moves||(p.moves=[])).push({s:S.season,d:S.d,f:from||0,t:to||0,fee:fee||0,k:kind||'transfer'})}
function interestFor(p,c){if(p.club===c.id)return 1;const tq=lq(c);const from=p.club?S.clubs[p.club]:null;let x=(p.ovr-(tq+3))*.055+(from?(from.rep-c.rep)*.012+(lq(from)-tq)*.02:0)+(from&&from.big&&!c.big?.25:0)-(c.big?.3:0);return cl(1-x,.03,1)}
function aiWages(c){const co=S.C[c.coach];return sqAll(c.id).reduce((s,p)=>s+(p.yth?400:p.wage),0)+(co?co.wage:0)}
function aiIncome(c){const t=c.t;return Math.round(COMM[t-1]*(.6+c.rep/150)+c.cap*.55*FAIRT[t-1]*(1+(5-t)*.4)*.35)}
function ensureAI(){for(const c of Object.values(S.clubs)){if(c.money==null)c.money=Math.round(START[c.t-1]*(.5+R()*.7)*(c.big?2.5:1));if(!c.fl)c.fl={tr:5,ac:5,md:5};}}
function isStarter(cid,p){return pickXI(cid).xi.includes(p)}
function clubNeeds(c){const L=pickXI(c.id);const ps=L.xi.filter(Boolean);const avg=ps.reduce((s,p)=>s+L.fc[p.id],0)/(ps.length||1);const out=[];
  L.xi.forEach((p,i)=>{const sp=L.slots[i][0];if(!p){out.push({pos:sp,cur:20});return}const f=L.fc[p.id]-pen(p.pos,sp);if(f<avg-3)out.push({pos:sp,cur:f,p})});
  const s=sq(c.id);POSL.forEach(ps=>{if(s.filter(p=>p.pos===ps&&p.inj<=0).length<Math.max(1,NEED[ps]-2))out.push({pos:ps,cur:avg-6})});
  return out.sort((a,b)=>a.cur-b.cur)}
/* one AI club looks at the market */
function aiShop(c){if(isMe(c.id))return;const needs=clubNeeds(c);if(!needs.length)return;const need=needs[0];const budget=c.money*.55;if(budget<8000)return;
  const co=S.C[c.coach];const tac=co?co.tac:'Total Football';const cb=cboost(c.id);const lqc=lq(c);
  let best=null,bs=-1e9;
  for(const p of Object.values(S.P)){if(p.pos!==need.pos||p.club===c.id||p.yth||p.inj>0)continue;const lm=p.moves&&p.moves.at(-1);if(lm&&lm.k!=="released"&&S.d-lm.d<300)continue;const f=fit(p,tac,cb);if(f<need.cur+2)continue;
    const fee=p.club?Math.round(p.val*1.1):faFee(p);if(fee>budget)continue;if(p.age>32)continue;if(R()>interestFor(p,c)+.1)continue;
    const score=(f-need.cur)*1.0-fee/Math.max(1,budget)*6+(p.age<=23?2:0)+(R()*3);if(score>bs){bs=score;best=p}}
  if(!best)return;const p=best;const from=p.club;
  if(!from){const fee=faFee(p);c.money-=fee;doMove(p,0,c.id,fee,'free');return}
  if(isMe(from)){const fee=Math.round(p.val*(1+R()*.4)/1000)*1000;if(!S.tr.inc.some(x=>x.pid===p.id&&x.st==='open')){S.tr.inc.unshift({id:++S.nid,pid:p.id,club:c.id,fee,d:S.d,exp:S.d+7,st:'open'});mail('bidinfo',{pid:p.id,club:c.id,fee})}return}
  const seller=S.clubs[from];const starter=isStarter(from,p);let fee=Math.round(p.val*(1.05+R()*.3)/1000)*1000;const ask=p.val*(starter?1.35:1)*(seller.big?1.2:1)*(p.gem?1.6:1);
  if(seller.big&&starter&&R()<.6)return;
  if(fee<ask){if(ask<=budget&&R()<.6)fee=Math.round(ask/1000)*1000;else return}
  c.money-=fee;seller.money+=fee;doMove(p,from,c.id,fee,'transfer')}
function doMove(p,from,to,fee,kind){p.club=to;p.yth=false;SQ=null;p.num=freeNum(to);p.mo=cl(p.mo+6,0,100);S.me.short=S.me.short.filter(x=>x!==p.id);S.me.force=S.me.force.filter(x=>x!==p.id);moveRec(p,from,to,fee,kind);
  const fn=from?S.clubs[from].name:'free agency',tn=S.clubs[to].name;news('transfer',`${p.name} (${p.pos}, ${p.ovr}) ${from?`${fn} → ${tn}`:`signs for ${tn} as a free agent`}${fee?` · ${money(fee)}`:''}`,[from,to].filter(Boolean));
  if(from&&!isMe(from))aiTrim(S.clubs[from]);aiTrim(S.clubs[to])}
function aiTrim(c){if(isMe(c.id))return;let s=sq(c.id);if(s.length<17){refill(c.id);SQ=null;return}while(s.length>26){const L=pickXI(c.id);const out=s.filter(p=>!L.xi.includes(p)).sort((a,b)=>(a.ovr-a.age*.3)-(b.ovr-b.age*.3))[0];if(!out)break;out.club=0;moveRec(out,c.id,0,0,'released');SQ=null;s=sq(c.id)}}
/* daily: during windows a handful of clubs go shopping */
function aiTransferDay(){if(!inWindow())return;const all=Object.values(S.clubs).filter(c=>!isMe(c.id));const n=dobj(S.d).m===0?3:5;for(let i=0;i<n;i++)aiShop(pick(all))}
/* monthly: money, facilities, youth promotions */
function aiMonthly(){for(const c of Object.values(S.clubs)){if(isMe(c.id))continue;const net=aiIncome(c)-aiWages(c);c.money+=net;
  if(c.money<0){const s=sq(c.id).filter(p=>!isStarter(c.id,p)).sort((a,b)=>b.wage-a.wage);const p=s[0];if(p&&s.length>18&&R()<.5){p.club=0;moveRec(p,c.id,0,0,'released');SQ=null;news('club',`${c.name} cut costs and release ${p.name}.`,[c.id])}}
  const keys=['tr','ac','md'];const k=keys.sort((a,b)=>c.fl[a]-c.fl[b])[0];const cost=Math.round(60e3*Math.pow(1.33,c.fl[k])/1e4)*1e4;
  if(c.fl[k]<20&&c.money>cost*2.5+aiWages(c)*3&&R()<.07){c.money-=cost;c.fl[k]++;news('club',`${c.name} upgrade their ${({tr:'training ground',ac:'youth academy',md:'medical centre'})[k]} to level ${c.fl[k]}.`,[c.id])}}}
/* April: every academy produces players */
function aiYouth(){for(const c of Object.values(S.clubs)){if(isMe(c.id))continue;const ac=c.fl.ac;const n=1+Math.floor(ac/6)+(R()<.5?1:0);const gr=[];
  for(let i=0;i<n;i++){const p=genPlayer(pick(POSL),cl(30+ac*1.1+Math.round(nrm()*4),25,62),ri(15,17),c.id,Math.floor(ac/2));p.yth=true;p.origin=c.id;gr.push(p)}
  if(R()<.04+ac*.01){const g=genGem(c.id,c.t,ac);g.yth=true;g.age=ri(15,16);g.origin=c.id;news('academy',`${c.name}'s academy has produced a gem: ${g.name}, ${g.age}, ${g.pos}.`,[c.id])}}SQ=null}
function aiSeasonReview(){for(const c of Object.values(S.clubs)){if(isMe(c.id))continue;
  // promote / release youth
  const avg=avgOvr(c.id);youth(c.id).forEach(p=>{if(p.age>=18&&p.ovr>=avg-12||p.gem&&p.age>=17){p.yth=false;p.num=freeNum(c.id);news('academy',`${p.name} graduates from the ${c.name} academy into the first team.`,[c.id])}else if(p.age>=19){p.club=0;moveRec(p,c.id,0,0,'released')}});
  const ys=youth(c.id).sort((a,b)=>b.pot-a.pot);ys.slice(8).forEach(p=>{p.club=0;moveRec(p,c.id,0,0,'released')});SQ=null;
  // judge the coach
  const h=c.hist[c.hist.length-1];if(!h)continue;const n=LEAGUES[h.lg].size;const[,,tgt]=statusOf(c);const co=S.C[c.coach];
  if(co&&h.pos>tgt+Math.round(n/4)&&R()<.6){const pool=S.pool.map(id=>S.C[id]).filter(x=>x&&!x.club).sort((a,b)=>(coachAI(b)+b.ta)-(coachAI(a)+a.ta));const pickN=c.big?pool[0]:pool[Math.min(pool.length-1,ri(1,4))];if(pickN){co.club=0;S.pool.push(co.id);pickN.club=c.id;c.coach=pickN.id;S.pool=S.pool.filter(x=>x!==pickN.id);news('coach',`${c.name} sack ${co.name} after finishing ${ord(h.pos)}. ${pickN.name} (${aiLvl(pickN)[1]}) takes over.`,[c.id])}}}}
/* careers: one row per club per season */
function careerClose(s){const champs={},promo={};S.seasons.at(-1)?.lgs.forEach(l=>champs[l.champ]=LEAGUES[l.lg].n);
  for(const c of Object.values(S.clubs)){const h=c.hist[c.hist.length-1];if(h&&h.s===s&&LEAGUES[h.lg].nat==='en'&&LEAGUES[h.lg].tier>1&&h.pos<=3&&h.pos>1)promo[c.id]=LEAGUES[h.lg].n}
  for(const p of Object.values(S.P)){if(!p.sc)continue;for(const cid in p.sc){const v=p.sc[cid];const c=S.clubs[cid];const tr=[];if(champs[cid]&&v[0]>=5){tr.push(`${champs[cid]} champion`);p.aw.push(`${champs[cid]} champion ${seasonLbl(s)}`)}if(promo[cid]&&v[0]>=5)tr.push('Promoted');if(S.cups)for(const C of Object.values(S.cups))if(C.winner===+cid&&v[0]>=3)tr.push(CUPD[C.id].n);
      (p.hist||(p.hist=[])).push({s,c:+cid,cn:c?c.name:'?',lg:c?c.lg:0,a:v[0],g:v[1],as:v[2],r:v[0]?Math.round(v[3]/v[0]*100)/100:0,ovr:p.ovr,age:p.age,tr})}p.sc={}}}
