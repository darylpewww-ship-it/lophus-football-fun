/* Lophus Football Fun — live 2D match engine */
const sideS=side=>side==='h'?0:1;
const toS=(pl,fx,fy)=>pl.s===0?{x:fx,y:1-fy}:{x:1-fx,y:fy};
const toF=(pl,x,y)=>pl.s===0?{fx:x,fy:1-y}:{fx:1-x,fy:y};
const gyFor=s=>s===0?0:1;
const dirIn=s=>s===0?1:-1;
const spot=(s,d,x=.5)=>({x,y:gyFor(s)+dirIn(s)*d});
const teamOf=s=>LM.players.filter(q=>q.s===s&&!q.off);
const plObj=pid=>LM.players.find(q=>q.p.id===pid&&!q.off);
const gk=s=>teamOf(s).find(q=>q.p.pos==='GK')||teamOf(s)[0];
function byRole(s,roles,not){const l=teamOf(s).filter(q=>roles.includes(q.p.pos)&&q!==not);return l.length?pick(l):teamOf(s).filter(q=>q!==not&&q.p.pos!=='GK')[0]}
function nearestOf(list,pt){let b=null,bd=1e9;for(const q of list){const d=Math.hypot(q.x-pt.x,q.y-pt.y);if(d<bd){bd=d;b=q}}return b}
const teamName=s=>S.clubs[s===0?LM.f.h:LM.f.a].name;
const teamCol=s=>S.clubs[s===0?LM.f.h:LM.f.a].col;
const ST=(d,start,upd,end)=>({d,start,upd,end});
const wait=d=>ST(d);
const say=(txt,cls)=>ST(0,()=>logLine(txt,cls));
const banner=(txt,col,d=1.6)=>ST(0,()=>{LM.banner={txt,col,t:d,max:d}});
const pin=(pl,pos)=>ST(0,()=>{if(pl)pl.pin=typeof pos==='function'?pos():{...pos}});
const unpinAll=()=>ST(0,()=>LM.players.forEach(q=>q.pin=null));
const give=pl=>ST(0,()=>{if(pl&&!pl.off)LM.carrier=pl});
const place=(x,y)=>ST(0,()=>{LM.ball.x=x;LM.ball.y=y;LM.ball.h=0;LM.carrier=null});
function kick(target,dur,arc=0){let fx,fy,tx,ty;return ST(dur,()=>{const b=LM.ball;fx=b.x;fy=b.y;const t=typeof target==='function'?target():target;tx=t.x;ty=t.y;LM.carrier=null;LM.tween=true},k=>{const b=LM.ball;b.x=fx+(tx-fx)*k;b.y=fy+(ty-fy)*k;b.h=arc*Math.sin(Math.PI*k)},()=>{LM.tween=false;LM.ball.h=0})}
const qpush=(...steps)=>LM.q.push(...steps.flat().filter(Boolean));
const mname=pl=>pl?last(pl.p.name):'Someone';

function buildTL(f,r){const ev=[];
  r.ev.forEach(g=>ev.push({m:g.m+.5,k:g.pen?'pengoal':'goal',side:g.side,pid:g.sc,as:g.as,kind:g.kind}));
  r.cards.forEach(c=>ev.push({m:c.m+.3,k:'card',side:c.side,pid:c.pid,c:c.c}));
  r.mp.forEach(m=>ev.push({m:m.m+.4,k:'penmiss',side:m.side,pid:m.pid}));
  r.act.forEach(a=>ev.push({m:a.m+.2,k:'skill',side:a.side,pid:a.pid,sid:a.sid}));
  const n=ri(24,34);for(let i=0;i<n;i++){const side=R()*100<r.poss?'h':'a';ev.push({m:1+R()*88,k:wpick(['wide','saved','corner','throw','offside','foul','goalkick'],k=>({wide:3,saved:3,corner:3,throw:4,offside:1.5,foul:2.5,goalkick:1.5}[k])),side})}
  ev.push({m:45,k:'ht'});ev.sort((a,b)=>a.m-b.m);return ev}

function startLive(sim){const f=myFixtureToday();if(!f)return;const r=simMatch(f);
  LM={f,r,min:0,speed:S.ui.speed||1,paused:false,score:[0,0],done:false,ev:buildTL(f,r),ei:0,q:[],step:null,stepT:0,mode:'play',ball:{x:.5,y:.5,h:0},carrier:null,players:[],banner:null,ripple:null,ft:false,tween:false,t:0};
  if(sim){finishLive();return}
  render();}
function finishLive(){if(!LM||LM.done)return;cancelAnimationFrame(LM.raf);applyMatch(LM.f,LM.r);LM.score=[LM.r.gh,LM.r.ga];LM.done=true;simOthersToday();save();render()}
function initPlayers(){LM.players=[];const H=S.clubs[LM.f.h],A=S.clubs[LM.f.a];
  [[LM.r.Lh,0,H],[LM.r.La,1,A]].forEach(([L,s,c])=>L.xi.forEach((p,i)=>{if(!p)return;const[,bx,by]=L.slots[i];const pl={s,p,bx,by,num:p.num,col:c.col,ph:R()*6,pin:null,card:null,off:false,glow:0};const sc=toS(pl,bx,by*.8+.05);pl.x=sc.x;pl.y=sc.y;LM.players.push(pl)}));
  qpush(say(`Kick-off at ${me().ground===S.clubs[LM.f.h].ground?me().ground:S.clubs[LM.f.h].ground}!`),kickoff(0))}
function kickoff(s){const st=()=>byRole(s,['ST','AM','MF']);let k;return[unpinAll(),place(.5,.5),ST(0,()=>{k=st();if(k){k.pin={x:.5,y:.5+(s===0?.012:-.012)}}}),wait(1.1),ST(0,()=>{if(k){LM.carrier=k;k.pin=null}})]}
function shapeTarget(pl){const b=LM.ball;const bf=toF(pl,b.x,b.y);const poss=LM.carrier&&LM.carrier.s===pl.s;
  if(pl.p.pos==='GK'){return toS(pl,.5+(bf.fx-.5)*.3,.03+(bf.fy<.25?.015:0))}
  const fy=pl.by*.8+.06+(bf.fy-.5)*.4+(poss?.08:-.03),fx=.5+(pl.bx-.5)*(poss?1.08:.82)+(bf.fx-.5)*.24+Math.sin(LM.t*.7+pl.ph)*.012;
  return toS(pl,cl(fx,.04,.96),cl(fy,.05,.93))}
function movePlayers(dt){const b=LM.ball;
  const def=LM.carrier?teamOf(1-LM.carrier.s).filter(q=>q.p.pos!=='GK'):[];const presser=LM.carrier&&!LM.step?nearestOf(def,b):null;
  for(const q of LM.players){if(q.off)continue;let t;let v=.26;
    if(q.pin){t=q.pin;v=.42}else if(q===LM.carrier&&!LM.tween){const f=toF(q,q.x,q.y);t=toS(q,f.fx,Math.min(.93,f.fy+.02));v=.08}else if(q===presser&&LM.mode==='play'){t={x:b.x+(q.s===0?0:0),y:b.y+(q.s===0?.025:-.025)};v=.2}else t=shapeTarget(q);
    const dx=t.x-q.x,dy=t.y-q.y,d=Math.hypot(dx,dy);const step=Math.min(d,v*dt);if(d>1e-4){q.x+=dx/d*step;q.y+=dy/d*step}
    if(q.glow>0)q.glow-=dt}
  if(LM.carrier&&!LM.tween&&!LM.carrier.off){const c=LM.carrier;const off=c.s===0?-.012:.012;b.x+=(c.x-b.x)*Math.min(1,dt*10);b.y+=(c.y+off-b.y)*Math.min(1,dt*10)}}
const passLines=[(a,b)=>`${a} first time to ${b}`,(a,b)=>`${a} switches play to ${b}`,(a,b)=>`${a} finds ${b} between the lines`,(a,b)=>`${a} lays it off for ${b}`,(a,b)=>`${a} threads it to ${b}`];
function openPlay(){let c=LM.carrier;if(!c||c.off){c=nearestOf(LM.players.filter(q=>!q.off),LM.ball);LM.carrier=c}if(!c)return;
  const s=c.s;const mates=teamOf(s).filter(q=>q!==c&&q.p.pos!=='GK');const opp=teamOf(1-s).filter(q=>q.p.pos!=='GK');
  const possH=LM.r.poss/100;const keep=(s===0?possH:1-possH)*.32+.62;
  if(R()<.22){const f=toF(c,c.x,c.y);const to=toS(c,cl(f.fx+(R()-.5)*.12,.06,.94),cl(f.fy+.05+R()*.07,.05,.88));qpush(ST(.8,()=>{c.pin=to},null,()=>{c.pin=null}));if(R()<.25)qpush(say(`${mname(c)} drives forward.`,'mut'));return}
  if(!mates.length)return;const cf=toF(c,c.x,c.y);
  const tgt=wpick(mates,q=>{const f=toF(q,q.x,q.y);const fw=f.fy-cf.fy;const d=Math.hypot(q.x-c.x,q.y-c.y);return Math.max(.05,1+fw*3)*Math.exp(-d*2.4)});
  const d=Math.hypot(tgt.x-c.x,tgt.y-c.y);const dur=.35+d*.9;const arc=d>.35?.05:0;
  if(R()<keep){qpush(kick(()=>({x:tgt.x,y:tgt.y}),dur,arc),give(tgt));if(R()<.18)qpush(say(pick(passLines)(mname(c),mname(tgt)),'mut'))}
  else{const mid=()=>({x:(c.x+tgt.x)/2,y:(c.y+tgt.y)/2});const o=nearestOf(opp,mid());qpush(kick(mid,dur*.55),give(o));if(R()<.35)qpush(say(`${mname(o)} reads it and intercepts.`,'mut'))}}
function buildUp(s,fin){const mid=byRole(s,['AM','MF'],fin)||fin;const shot=spot(s,.1+R()*.08,.5+(R()-.5)*.34);const mpos=spot(s,.32,.3+R()*.4);
  return[ST(0,()=>{if(!LM.carrier||LM.carrier.s!==s)LM.carrier=byRole(s,['MF','DF'])||mid}),pin(mid,mpos),pin(fin,shot),wait(.55),kick(()=>({x:mid.x,y:mid.y}),.55),give(mid),wait(.2),kick(()=>({x:fin.x,y:fin.y}),.45,.02),give(fin),wait(.12)]}
function celebrate(s,fin){const gy=gyFor(s),din=dirIn(s);const cx=fin.x<.5?.05:.95;const mates=teamOf(s).filter(q=>q!==fin&&q.p.pos!=='GK').sort((a,b)=>Math.hypot(a.x-fin.x,a.y-fin.y)-Math.hypot(b.x-fin.x,b.y-fin.y)).slice(0,4);
  return[ST(0,()=>{fin.pin={x:cx,y:gy+din*.05};fin.glow=2.5;mates.forEach((m,i)=>m.pin={x:cl(cx+(cx<.5?1:-1)*(.035+i*.02),.03,.97),y:gy+din*(.06+(i%2)*.03)})})]}
const shotLine=(p,kind)=>({shot:`${mname(p)} shoots from the edge of the box...`,tap:`${mname(p)} is through on goal...`,header:`Ball swung in... ${mname(p)} rises...`,long:`${mname(p)} tries his luck from distance...`}[kind]||`${mname(p)} shoots...`);
function goalAt(s,scorer,txt){return[ST(0,()=>{LM.score[s]++;LM.ripple={gy:gyFor(s),t:1.3};updScore();if(scorer)scorer.glow=2.5}),banner('GOAL!',teamCol(s),2),say(txt,'g')]}
function scriptEvent(e){const s=e.side?sideS(e.side):0;const gy=gyFor(s),din=dirIn(s);
  switch(e.k){
  case'goal':{const fin=plObj(e.pid)||byRole(s,['ST','AM']);const keeper=gk(1-s);const nx=.5+(R()-.5)*.08;const as=e.as?S.P[e.as]:null;
    qpush(buildUp(s,fin),say(shotLine(fin,e.kind)),ST(0,()=>{if(keeper)keeper.pin={x:nx+(R()<.5?-.07:.07),y:gy+din*.02}}),kick({x:nx,y:gy-din*.022},.32,e.kind==='long'?.06:e.kind==='header'?.03:.01),goalAt(s,fin,`GOAL! ${fin.p.name} scores for ${teamName(s)}${as?`, set up by ${last(as.name)}`:''}!`),celebrate(s,fin),wait(2.3),kickoff(1-s));break}
  case'pengoal':case'penmiss':{const scored=e.k==='pengoal';const tk=plObj(e.pid)||byRole(s,['ST','AM']);const keeper=gk(1-s);const victim=byRole(s,['ST','AM'],keeper)||tk;const fouler=byRole(1-s,['DF'])||nearestOf(teamOf(1-s),victim);const cx=.5+(R()<.5?-.045:.045);
    qpush(buildUp(s,victim),pin(fouler,()=>({x:victim.x+.012,y:victim.y})),wait(.35),say(`${mname(fouler)} brings down ${mname(victim)} in the box!`),banner('PENALTY','#e2412a',1.6),
      ST(0,()=>{let i=0;LM.players.forEach(q=>{if(q===keeper||q===tk||q.off)return;if(q.p.pos==='GK'){q.pin=null;return}q.pin={x:cl(.24+((i*.083)%.52),.12,.88),y:gy+din*(.27+(i%3)*.035)};i++});tk.pin={x:.5,y:gy+din*.17};keeper.pin={x:.5,y:gy+din*.012};LM.ball.x=.5;LM.ball.y=gy+din*.11;LM.carrier=null;LM.tween=true}),
      wait(1.7),say(`${tk.p.name} steps up...`),pin(tk,{x:.5,y:gy+din*.118}),wait(.5),
      ST(0,()=>{keeper.pin={x:scored?.5-(cx-.5)*1.3:cx,y:gy+din*.012}}),kick({x:cx,y:scored?gy-din*.02:gy+din*.014},.3,.012));
    if(scored)qpush(goalAt(s,tk,`GOAL! ${tk.p.name} sends the keeper the wrong way!`),celebrate(s,tk),wait(2.2),kickoff(1-s));
    else qpush(give(keeper),banner('SAVED!',teamCol(1-s),1.4),say(`Saved! ${keeper.p.name} guesses right and keeps it out!`,'g'),wait(1.2),unpinAll(),kick(()=>{const d=byRole(1-s,['DF']);return{x:d.x,y:d.y}},.7,.03),give(byRole(1-s,['DF'])));
    break}
  case'card':{const off=plObj(e.pid);if(!off)break;const victim=nearestOf(teamOf(1-s),off)||byRole(1-s,['MF']);if(!victim)break;
    qpush(ST(0,()=>{LM.carrier=victim}),wait(.3),pin(off,()=>({x:victim.x+.012,y:victim.y+.008})),wait(.6),say(`Foul by ${mname(off)} on ${mname(victim)}.`),ST(0,()=>{off.card=e.c==='Y'?'Y':'R'}),
      banner(e.c==='Y'?'YELLOW CARD':'RED CARD',e.c==='Y'?'#d9a800':'#d62020',1.6),say(e.c==='Y'?`Yellow card for ${off.p.name}.`:e.c==='R2'?`Second yellow! ${off.p.name} is sent off.`:`Straight red! ${off.p.name} is sent off.`,e.c==='Y'?'':'g'),wait(1.3));
    if(e.c!=='Y')qpush(pin(off,{x:off.x<.5?-.05:1.05,y:.5}),wait(1.4),ST(0,()=>{off.off=true;off.pin=null}));
    qpush(unpinAll(),give(victim),say(`Free kick to ${teamName(1-s)}.`,'mut'));break}
  case'wide':case'saved':{const fin=byRole(s,['ST','AM','MF']);const keeper=gk(1-s);if(!fin||!keeper)break;const nx=e.k==='wide'?.5+(R()<.5?-1:1)*(.1+R()*.06):.5+(R()-.5)*.06;
    qpush(buildUp(s,fin),say(shotLine(fin,pick(['shot','long','header','tap']))),ST(0,()=>{if(e.k==='saved')keeper.pin={x:nx,y:gy+din*.018}}),kick({x:nx,y:e.k==='wide'?gy-din*.03:gy+din*.018},.32,.02));
    if(e.k==='wide')qpush(say(pick([`Wide! ${mname(fin)} drags it past the post.`,`Over the bar from ${mname(fin)}.`,`${mname(fin)} curls it just wide.`])),wait(.8),goalKick(1-s));
    else qpush(give(keeper),say(pick([`Saved by ${keeper.p.name}!`,`${mname(keeper)} gets down well to save.`,`Strong hands from ${mname(keeper)}.`])),wait(.9),unpinAll(),kick(()=>{const d=byRole(1-s,['DF','MF']);return{x:d.x,y:d.y}},.8,.04),give(byRole(1-s,['DF','MF'])));
    break}
  case'goalkick':qpush(say(`Ball out of play. Goal kick to ${teamName(1-s)}.`,'mut'),place(.5,gy+din*.04),goalKick(1-s,true));break;
  case'corner':{const tkr=byRole(s,['AM','MF']);const tgt=byRole(s,['ST','DF'],tkr);const keeper=gk(1-s);if(!tkr||!tgt)break;const cx=R()<.5?.012:.988;
    qpush(buildUp(s,tgt),say(`${mname(tgt)}'s shot is deflected behind. Corner to ${teamName(s)}.`),kick({x:cx<.5?.03:.97,y:gy-din*.02},.4),place(cx,gy+din*.004),
      ST(0,()=>{tkr.pin={x:cx,y:gy+din*.012};const at=teamOf(s).filter(q=>q!==tkr&&q.p.pos!=='GK').slice(0,5),df=teamOf(1-s).filter(q=>q.p.pos!=='GK').slice(0,6);at.forEach((q,i)=>q.pin={x:.36+i*.07,y:gy+din*(.07+(i%2)*.04)});df.forEach((q,i)=>q.pin={x:.34+i*.065,y:gy+din*(.05+(i%2)*.045)})}),
      wait(1.4),ST(0,()=>{LM.carrier=tkr}),kick(()=>({x:tgt.pin?tgt.pin.x:.5,y:gy+din*.08}),.7,.08),say(`${mname(tkr)} whips it in...`));
    if(R()<.4)qpush(ST(0,()=>{keeper.pin={x:.5,y:gy+din*.06}}),wait(.15),give(keeper),say(`${mname(keeper)} comes and claims it.`),wait(.8),unpinAll(),kick(()=>{const d=byRole(1-s,['MF']);return{x:d.x,y:d.y}},.8,.05),give(byRole(1-s,['MF'])));
    else qpush(say(`${mname(tgt)} gets a head to it, but it's cleared.`),kick(()=>({x:.3+R()*.4,y:gy+din*.38}),.6,.04),unpinAll(),ST(0,()=>{LM.carrier=nearestOf(LM.players.filter(q=>!q.off),LM.ball)}));
    break}
  case'throw':{const thr=byRole(s,['DF','MF']);const rcv=byRole(s,['MF','AM'],thr);if(!thr||!rcv)break;const x=R()<.5?.004:.996,y=.2+R()*.6;
    qpush(say(`Out for a throw-in to ${teamName(s)}.`,'mut'),kick({x:x<.5?-.01:1.01,y},.5),place(x,y),ST(0,()=>{thr.pin={x:x<.5?-.008:1.008,y};rcv.pin={x:x<.5?.12:.88,y:y+(R()-.5)*.08}}),wait(1.2),ST(0,()=>{LM.carrier=thr}),kick(()=>({x:rcv.x,y:rcv.y}),.5,.03),give(rcv),unpinAll());break}
  case'offside':{const pas=byRole(s,['MF','AM']);const run=byRole(s,['ST','AM'],pas);if(!pas||!run)break;const d=byRole(1-s,['DF']);
    qpush(ST(0,()=>{LM.carrier=pas}),pin(run,spot(s,.12,.4+R()*.2)),wait(.5),kick(()=>({x:run.x,y:run.y}),.6,.03),banner('OFFSIDE','#2459b8',1.2),say(`Flag up. ${mname(run)} was offside.`),wait(1),unpinAll(),give(d),say(`Free kick to ${teamName(1-s)}.`,'mut'));break}
  case'foul':{const a=byRole(s,['MF','AM','ST']);const b=a&&nearestOf(teamOf(1-s),a);if(!a||!b)break;qpush(ST(0,()=>{LM.carrier=a}),pin(b,()=>({x:a.x+.01,y:a.y})),wait(.6),say(`${mname(b)} clips ${mname(a)}. Free kick.`),wait(.6),unpinAll(),give(a));break}
  case'skill':{const pl=plObj(e.pid);const sk=SK[e.sid];if(!pl||!sk)break;qpush(ST(0,()=>{pl.glow=3;pl.gcol=tierCol(sk.t)}),banner(`✨ ${sk.act?sk.act.n:sk.n}`,tierCol(sk.t),2),say(`✨ ${pl.p.name} channels ${sk.n}: ${sk.act?sk.act.d:''}!`,'g'),wait(1.5));break}
  case'ht':qpush(say('Half-time. The players head down the tunnel.'),banner('HALF-TIME','#17191a',1.6),wait(1.6),kickoff(1));break;
  }
  qpush(ST(0,()=>{}));
}
function goalKick(s,placed){const keeper=gk(s);const gy=gyFor(1-s);const din=dirIn(1-s);return[ST(0,()=>{keeper.pin={x:.5,y:gy+din*.05};if(!placed){LM.ball.x=.5;LM.ball.y=gy+din*.045;LM.carrier=null}}),wait(1),ST(0,()=>{LM.carrier=keeper}),kick(()=>{const m=byRole(s,['MF','AM','ST']);return{x:m.x,y:m.y}},1,.1),ST(0,()=>{keeper.pin=null;LM.carrier=nearestOf(LM.players.filter(q=>!q.off),LM.ball)})]}
function updScore(){const el=document.getElementById('sc');if(el)el.textContent=LM.score.join('-')}
function logLine(txt,cls){const m=Math.min(90,Math.max(1,Math.ceil(LM.min)));const lg=document.getElementById('lg');if(lg){const d=document.createElement('div');if(cls)d.className=cls;d.textContent=`${m}' ${txt}`;lg.prepend(d);while(lg.children.length>80)lg.lastChild.remove()}
  if(cls!=='mut'){const tk=document.getElementById('tk');if(tk){document.getElementById('tkm').textContent=m+"'";document.getElementById('tkt').textContent=txt;tk.className='tick'+(cls==='g'?' goal':'')}}}
function setupCanvas(){const cv=document.getElementById('cv');if(!cv||!LM)return;if(!LM.players.length)initPlayers();cancelAnimationFrame(LM.raf);LM.lt=performance.now();LM.raf=requestAnimationFrame(loop)}
function loop(now){if(!LM||LM.done)return;const cv=document.getElementById('cv');if(!cv){LM.raf=requestAnimationFrame(loop);return}
  const rdt=Math.min(.1,(now-LM.lt)/1000);LM.lt=now;const dt=LM.paused?0:rdt*LM.speed;
  if(dt>0){LM.t+=dt;let budget=dt,guard=0;
    while(budget>0&&guard++<20){const step=Math.min(budget,.05);budget-=step;tick(step);if(!LM||LM.done)return}
    const mn=document.getElementById('mn');if(mn)mn.textContent=Math.min(90,Math.floor(LM.min))+"'"}
  draw(cv);LM.raf=requestAnimationFrame(loop)}
function tick(dt){
  if(!LM.step&&LM.q.length){LM.step=LM.q.shift();LM.stepT=0;LM.step.start&&LM.step.start()}
  if(LM.step){LM.stepT+=dt;const k=LM.step.d?Math.min(1,LM.stepT/LM.step.d):1;LM.step.upd&&LM.step.upd(k);if(k>=1){const st=LM.step;LM.step=null;st.end&&st.end()}}
  if(LM.mode==='play')LM.min+=dt*.8;
  if(!LM.step&&!LM.q.length){
    if(LM.ft){finishLive();return}
    const e=LM.ev[LM.ei];
    if(e&&e.m<=LM.min){LM.ei++;LM.mode='event';scriptEvent(e)}
    else if(LM.min>=90){LM.mode='event';LM.ft=true;LM.min=90;qpush(say('Full-time! The referee blows for the end of the match.'),banner('FULL-TIME','#17191a',1.6),wait(1.6))}
    else{LM.mode='play';openPlay()}}
  movePlayers(dt);
  if(LM.banner){LM.banner.t-=dt;if(LM.banner.t<=0)LM.banner=null}
  if(LM.ripple){LM.ripple.t-=dt;if(LM.ripple.t<=0)LM.ripple=null}
}
function draw(cv){const dpr=window.devicePixelRatio||1;const W=cv.clientWidth,H=cv.clientHeight;if(!W||!H)return;if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr)}const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);
  const mx=W*.07,my=H*.045,w=W-2*mx,h=H-2*my;const X=x=>mx+x*w,Y=y=>my+y*h;
  g.fillStyle='#24572f';g.fillRect(0,0,W,H);for(let i=0;i<12;i++){g.fillStyle=i%2?'#357546':'#2e6a3c';g.fillRect(mx,my+i*h/12,w,h/12+1)}
  g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=1.6;g.strokeRect(X(0),Y(0),w,h);g.beginPath();g.moveTo(X(0),Y(.5));g.lineTo(X(1),Y(.5));g.stroke();g.beginPath();g.arc(X(.5),Y(.5),w*.135,0,7);g.stroke();
  g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.arc(X(.5),Y(.5),2.2,0,7);g.fill();
  [0,1].forEach(gy=>{const d=gy===0?1:-1;const bx=.2,bw=.6,bh=.16,sx=.37,sw=.26,sh=.055;g.strokeRect(X(bx),gy===0?Y(0):Y(1-bh),w*bw,h*bh);g.strokeRect(X(sx),gy===0?Y(0):Y(1-sh),w*sw,h*sh);g.beginPath();g.arc(X(.5),Y(gy+d*.11),2.2,0,7);g.fill();g.beginPath();g.arc(X(.5),Y(gy+d*.11),w*.12,d>0?.2*Math.PI:1.2*Math.PI,d>0?.8*Math.PI:1.8*Math.PI);g.stroke();
    const rip=LM.ripple&&LM.ripple.gy===gy?Math.sin(LM.ripple.t*30)*2.5*LM.ripple.t:0;const ny=gy===0?Y(0)-h*.028+(-rip):Y(1);const nh=h*.028;g.fillStyle='rgba(255,255,255,.15)';g.fillRect(X(.44),ny,w*.12,nh);g.strokeStyle='rgba(255,255,255,.4)';g.lineWidth=.7;for(let i=0;i<=8;i++){g.beginPath();g.moveTo(X(.44)+i*w*.015,ny);g.lineTo(X(.44)+i*w*.015,ny+nh);g.stroke()}for(let j=0;j<=3;j++){g.beginPath();g.moveTo(X(.44),ny+j*nh/3);g.lineTo(X(.56),ny+j*nh/3);g.stroke()}g.strokeStyle='#fff';g.lineWidth=2.4;g.strokeRect(X(.44),ny,w*.12,nh);g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=1.6;
    [0,1].forEach(cx=>{g.beginPath();g.arc(X(cx),Y(gy),6,gy===0?(cx?.5:0)*Math.PI:(cx?1:1.5)*Math.PI,gy===0?(cx?1:.5)*Math.PI:(cx?1.5:2)*Math.PI);g.stroke();g.fillStyle='#f1c84b';g.fillRect(X(cx)-1,Y(gy)-(gy===0?10:0),2,10);g.fillStyle='rgba(255,255,255,.85)'})});
  const r=Math.max(8,Math.min(13,w/28));g.textAlign='center';g.textBaseline='middle';
  for(const q of LM.players){if(q.off)continue;const x=X(q.x),y=Y(q.y);g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(x+1,y+r*.85,r*.9,r*.33,0,0,7);g.fill();
    if(q.glow>0){g.strokeStyle=q.gcol||'#ffe35a';g.lineWidth=3;g.globalAlpha=.5+.5*Math.sin(LM.t*12);g.beginPath();g.arc(x,y,r+5,0,7);g.stroke();g.globalAlpha=1}
    g.fillStyle=q.p.pos==='GK'?(q.s===0?'#e8b04a':'#8f5ad6'):q.col;g.beginPath();g.arc(x,y,r,0,7);g.fill();g.strokeStyle=q===LM.carrier?'#ffe35a':'#fff';g.lineWidth=q===LM.carrier?3:1.8;g.stroke();
    g.fillStyle='#fff';g.font=`800 ${r*1.05}px "Big Shoulders Display",Impact,sans-serif`;g.fillText(q.num,x,y+1);
    if(q.card){g.fillStyle=q.card==='Y'?'#f2c300':'#d62020';g.fillRect(x+r*.55,y-r*1.25,r*.5,r*.7);g.strokeStyle='#111';g.lineWidth=.8;g.strokeRect(x+r*.55,y-r*1.25,r*.5,r*.7)}}
  const b=LM.ball;const bx=X(b.x),by=Y(b.y);const lift=b.h*h*1.4;g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(bx+1,by+2,r*.42,r*.2,0,0,7);g.fill();const br=r*.42*(1+b.h*3);g.fillStyle='#fff';g.beginPath();g.arc(bx,by-lift,br,0,7);g.fill();g.strokeStyle='#111';g.lineWidth=1.1;g.stroke();g.fillStyle='#111';g.beginPath();g.arc(bx,by-lift,br*.35,0,7);g.fill();
  if(LM.banner){const bn=LM.banner;const a=Math.min(1,bn.t/.3,(bn.max-bn.t)/.2+.2);g.globalAlpha=cl(a,0,1);g.fillStyle=bn.col;const bh=Math.min(64,H*.1);g.fillRect(0,H/2-bh/2,W,bh);g.fillStyle='#fff';g.font=`900 ${bh*.62}px "Big Shoulders Display",Impact,sans-serif`;g.fillText(bn.txt,W/2,H/2+2);g.globalAlpha=1}}
