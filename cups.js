/* Lophus Football Fun — cups: continental and domestic knockout competitions */
const CUPS=[
 {id:'ecc',n:'Continental Champions Cup',grp:'eu',size:32,prize:[1.2e6,2.5e6,5e6,9e6,15e6,25e6],rep:6,days:[78,128,178,238,302]},
 {id:'ecs',n:'Continental Shield',grp:'eu',size:16,prize:[.5e6,1e6,2e6,4e6,8e6],rep:3,days:[92,152,222,300]},
 {id:'enc',n:'Crown Cup',grp:'en',size:64,prize:[40e3,80e3,150e3,300e3,600e3,1.2e6,2.5e6],rep:2,days:[66,110,158,204,252,310]},
 {id:'elc',n:'Lantern League Cup',grp:'en',size:32,prize:[50e3,100e3,250e3,500e3,1e6,2e6],rep:1,days:[58,104,150,196,228]},
 {id:'esc',n:'Copa Corona',grp:'es',size:16,prize:[80e3,200e3,500e3,1e6,2e6],rep:2,days:[96,160,218,296]},
 {id:'dec',n:'Meisterpokal',grp:'de',size:16,prize:[80e3,200e3,500e3,1e6,2e6],rep:2,days:[96,160,218,296]},
 {id:'itc',n:'Coppa Suprema',grp:'it',size:16,prize:[80e3,200e3,500e3,1e6,2e6],rep:2,days:[96,160,218,296]},
 {id:'ptc',n:'Taça Lusitana',grp:'pt',size:16,prize:[50e3,120e3,300e3,600e3,1.2e6],rep:2,days:[96,160,218,296]},
 {id:'nlc',n:'Kroonbeker',grp:'nl',size:16,prize:[50e3,120e3,300e3,600e3,1.2e6],rep:2,days:[96,160,218,296]}];
const CUPD=Object.fromEntries(CUPS.map(c=>[c.id,c]));
const rnName=n=>({2:'Final',4:'Semi-final',8:'Quarter-final',16:'Round of 16',32:'Round of 32',64:'Round of 64'})[n]||`Round of ${n}`;
const compName=f=>f.cup?`${CUPD[f.cup].n} · ${rnName(f.n)}`:LEAGUES[f.lg].n;
const compShort=f=>f.cup?rnName(f.n):`Round ${f.r}`;
function rankIn(lg){const prev=S.season-1;return Object.values(S.clubs).filter(c=>c.lg===lg).sort((a,b)=>{const ha=a.hist.at(-1),hb=b.hist.at(-1);const pa=ha&&ha.s===prev&&ha.lg===lg?ha.pos:50+repRank(a),pb=hb&&hb.s===prev&&hb.lg===lg?hb.pos:50+repRank(b);return pa-pb})}
const lgIdx=(nat,tier=1)=>LEAGUES.findIndex(l=>l.nat===nat&&l.tier===tier);
function cupEntrants(cup){
  if(cup.id==='ecc'){const q={en:[0,5],es:[0,5],it:[0,5],de:[0,4],pt:[0,3],nl:[0,3]};const extra={en:[5,7],es:[5,6],it:[5,6],de:[4,5],pt:[3,4],nl:[3,4]};let out=[];for(const n in q)out=out.concat(rankIn(lgIdx(n)).slice(...q[n]));for(const n in extra)out=out.concat(rankIn(lgIdx(n)).slice(...extra[n]));return out.slice(0,32)}
  if(cup.id==='ecs'){const q={en:[7,10],es:[6,9],it:[6,9],de:[5,8],pt:[4,6],nl:[4,6]};let out=[];for(const n in q)out=out.concat(rankIn(lgIdx(n)).slice(...q[n]));return out.slice(0,16)}
  if(cup.id==='enc'){let out=[];for(let t=1;t<=3;t++)out=out.concat(rankIn(lgIdx('en',t)));return out.slice(0,64)}
  if(cup.id==='elc')return rankIn(lgIdx('en',1)).concat(rankIn(lgIdx('en',2)).slice(0,12));
  return rankIn(lgIdx(cup.grp)).slice(0,16)}
function cupDay(target,clubs){const sd=seasonStart(S.season);const ids=new Set(clubs.map(c=>c.id));const busy=new Set();for(const f of S.fx)if(ids.has(f.h)||ids.has(f.a))busy.add(f.d);let d=Math.max(sd+target,S.d+2);let g=0;while((busy.has(d)||busy.has(d-1)||busy.has(d+1))&&g++<30)d++;return d}
function cupsSetup(){S.cups={};for(const cup of CUPS){const ent=cupEntrants(cup);if(ent.length<cup.size)continue;S.cups[cup.id]={id:cup.id,s:S.season,teams:ent.map(c=>c.id),rounds:[],alive:ent.map(c=>c.id),winner:null};cupDraw(cup.id)}}
function cupDraw(id){const C=S.cups[id],cup=CUPD[id];const ri2=C.rounds.length;const teams=shuffle(C.alive.slice());const n=teams.length;const d=cupDay(cup.days[ri2]||cup.days.at(-1)+20,teams.map(t=>S.clubs[t]));
  const ties=[];for(let i=0;i<n;i+=2){const f={d,cup:id,n,rr:ri2,h:teams[i],a:teams[i+1],hs:null,as:null};S.fx.push(f);ties.push(f)}C.rounds.push({n,d,ties});
  const mine=ties.find(f=>isMe(f.h)||isMe(f.a));if(mine&&S.me){const opp=S.clubs[isMe(mine.h)?mine.a:mine.h];mail('info',{from:cup.n,title:`${cup.n} draw: ${rnName(n)}`,html:`<p>We'll face <b>${esc(opp.name)}</b> (${esc(lgName(opp))}) ${isMe(mine.h)?'at home':'away'} on ${fmtD(d)}.</p>`})}}
function shootout(f,r){const take=(L)=>{const ks=L.xi.filter(p=>p&&p.pos!=='GK').sort((a,b)=>eff(b,'tec')+eff(b,'smart')-eff(a,'tec')-eff(a,'smart'));return i=>{const p=ks[i%ks.length];return R()<cl(.72+(eff(p,'smart')-60)/200,.55,.88)}};const H=take(r.Lh),A=take(r.La);let h=0,a=0,i=0;
  for(;i<5;i++){if(H(i))h++;if(h>a+(5-i)||a>h+(5-i))break;if(A(i))a++;if(h>a+(4-i)||a>h+(4-i))break}while(h===a&&i<20){if(H(i))h++;if(A(i))a++;i++}return[h,a]}
function cupTie(f,r){if(f.hs===f.as){f.pens=shootout(f,r);f.w=f.pens[0]>f.pens[1]?f.h:f.a}else f.w=f.hs>f.as?f.h:f.a;const cup=CUPD[f.cup];const C=S.cups[f.cup];const ri2=C.rounds.length-1;
  const w=S.clubs[f.w];const prize=cup.prize[ri2]||0;(C.earn||(C.earn={}))[f.w]=(C.earn[f.w]||0)+prize;if(isMe(f.w)){S.me.money+=prize;S.me.fin.tr+=prize}else w.money=(w.money||0)+prize;
  if(f.n===2){C.winner=f.w;w.troph.push({s:S.season,n:`${cup.n} winners`});w.rep=cl(w.rep+cup.rep,0,99);sq(f.w).forEach(p=>{if(p.sc&&p.sc[f.w]&&p.sc[f.w][0]>=3)p.aw.push(`${cup.n} winner ${seasonLbl(S.season)}`)});news('cup',`${w.name} win the ${cup.n}, beating ${S.clubs[f.w===f.h?f.a:f.h].name} ${f.hs}-${f.as}${f.pens?` (${f.pens[0]}-${f.pens[1]} on penalties)`:''}.`,[f.h,f.a]);
    if(isMe(f.w))mail('board',{title:`We've won the ${cup.n}!`,html:`<p>What a night. The ${cup.n} is ours, and ${money(prize)} prize money with it.</p>`})}}
function cupAdvance(){if(!S.cups)return;for(const id in S.cups){const C=S.cups[id];if(C.winner)continue;const rd=C.rounds.at(-1);if(!rd||rd.ties.some(f=>f.hs===null))continue;if(rd.n===2)continue;C.alive=rd.ties.map(f=>f.w);
    const out=rd.ties.find(f=>(isMe(f.h)||isMe(f.a))&&!isMe(f.w));if(out)mail('info',{from:CUPD[id].n,title:`Out of the ${CUPD[id].n}`,html:`<p>We went out in the ${rnName(rd.n).toLowerCase()} to ${esc(S.clubs[out.w].name)}${out.pens?` on penalties (${out.pens.join('-')})`:''}.</p>`});
    cupDraw(id)}}
