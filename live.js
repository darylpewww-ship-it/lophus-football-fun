/* Lophus Football Fun — live 2D view: replays the engine's event timeline */
const sideS=side=>side==='h'?0:1;
const toS=(pl,fx,fy)=>pl.s===0?{x:fx,y:1-fy}:{x:1-fx,y:fy};
const toF=(pl,x,y)=>pl.s===0?{fx:x,fy:1-y}:{fx:1-x,fy:y};
const scr=(side,z,x)=>sideS(side)===0?{x,y:1-z}:{x:1-x,y:z};
const teamOf=s=>LM.players.filter(q=>q.s===s&&!q.off);
const plObj=pid=>LM.players.find(q=>q.p.id===pid&&!q.off);
const gkPl=s=>teamOf(s).find(q=>q.p.pos==='GK')||teamOf(s)[0];
function nearestOf(list,pt){let b=null,bd=1e9;for(const q of list){const d=Math.hypot(q.x-pt.x,q.y-pt.y);if(d<bd){bd=d;b=q}}return b}
const teamCol=s=>S.clubs[s===0?LM.f.h:LM.f.a].col;
const ST=(d,start,upd,end)=>({d,start,upd,end});
const wait=d=>ST(d);
const banner=(txt,col,d=1.6)=>ST(0,()=>{LM.banner={txt,col,t:d,max:d}});
const pin=(pl,pos)=>ST(0,()=>{if(pl)pl.pin=typeof pos==='function'?pos():{...pos}});
const unpinAll=()=>ST(0,()=>LM.players.forEach(q=>q.pin=null));
const give=pl=>ST(0,()=>{if(pl&&!pl.off)LM.carrier=pl});
const place=(x,y)=>ST(0,()=>{LM.ball.x=x;LM.ball.y=y;LM.ball.h=0;LM.carrier=null});
function kick(target,dur,arc=0){let fx,fy,tx,ty;return ST(dur,()=>{const b=LM.ball;fx=b.x;fy=b.y;const t=typeof target==='function'?target():target;tx=t.x;ty=t.y;LM.carrier=null;LM.tween=true},k=>{const b=LM.ball;const e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;b.x=fx+(tx-fx)*e;b.y=fy+(ty-fy)*e;b.h=arc*Math.sin(Math.PI*k)},()=>{LM.tween=false;LM.ball.h=0})}
const qpush=(...steps)=>LM.q.push(...steps.flat().filter(Boolean));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

function startLive(sim){const f=myFixtureToday();if(!f)return;const r=simMatch(f,true);
  LM={f,r,clock:'1',speed:S.ui.speed||2,paused:false,score:[0,0],done:false,tl:r.tl||[],ti:0,q:[],step:null,stepT:0,ball:{x:.5,y:.5,h:0},carrier:null,players:[],banner:null,ripple:null,tween:false,t:0,ft:false};
  if(sim){finishLive();return}
  render();}
function finishLive(){if(!LM||LM.done)return;cancelAnimationFrame(LM.raf);applyMatch(LM.f,LM.r);LM.score=[LM.r.gh,LM.r.ga];LM.done=true;simOthersToday();save();render()}
function initPlayers(){LM.players=[];const H=S.clubs[LM.f.h],A=S.clubs[LM.f.a];
  [[LM.r.Lh,0,H],[LM.r.La,1,A]].forEach(([L,s,c])=>L.xi.forEach((p,i)=>{if(!p)return;const[,bx,by]=L.slots[i];const pl={s,p,bx,by,num:p.num,col:c.col,ph:R()*6,pin:null,card:null,off:false,glow:0};const sc=toS(pl,bx,by*.8+.05);pl.x=sc.x;pl.y=sc.y;LM.players.push(pl)}))}
function shapeTarget(pl){const b=LM.ball;const bf=toF(pl,b.x,b.y);const poss=LM.carrier&&LM.carrier.s===pl.s;
  if(pl.p.pos==='GK')return toS(pl,.5+(bf.fx-.5)*.3,.03+(bf.fy<.25?.015:0));
  const fy=pl.by*.8+.06+(bf.fy-.5)*.42+(poss?.08:-.03),fx=.5+(pl.bx-.5)*(poss?1.08:.82)+(bf.fx-.5)*.24+Math.sin(LM.t*.7+pl.ph)*.012;
  return toS(pl,cl(fx,.04,.96),cl(fy,.05,.93))}
function movePlayers(dt){const b=LM.ball;
  const def=LM.carrier?teamOf(1-LM.carrier.s).filter(q=>q.p.pos!=='GK'):[];const presser=LM.carrier&&!LM.setpiece?nearestOf(def,b):null;
  for(const q of LM.players){if(q.off&&!q.leaving)continue;let t;let v=.28;
    if(q.pin){t=q.pin;v=.45}else if(q===LM.carrier&&!LM.tween){t={x:q.x,y:q.y};v=0}else if(q===presser){t={x:b.x,y:b.y+(q.s===0?.025:-.025)};v=.22}else t=shapeTarget(q);
    const dx=t.x-q.x,dy=t.y-q.y,d=Math.hypot(dx,dy);const step=Math.min(d,v*dt);if(d>1e-4){q.x+=dx/d*step;q.y+=dy/d*step}
    if(q.glow>0)q.glow-=dt}
  if(LM.carrier&&!LM.tween&&!LM.carrier.off){const c=LM.carrier;const off=c.s===0?-.012:.012;b.x+=(c.x-b.x)*Math.min(1,dt*10);b.y+=(c.y+off-b.y)*Math.min(1,dt*10)}}
function resetShape(kickSide){return[unpinAll(),place(.5,.5),ST(0,()=>{LM.setpiece=false;const s=sideS(kickSide);const st=teamOf(s).filter(q=>q.p.pos==='ST'||q.p.pos==='AM')[0]||teamOf(s)[0];if(st)st.pin={x:.5,y:.5+(s===0?.012:-.012)};LM._ko=st}),wait(1),ST(0,()=>{if(LM._ko){LM.carrier=LM._ko;LM._ko.pin=null}})]}
function celebrate(s,fin){const g=s===0?0:1,din=s===0?1:-1;const cx=fin.x<.5?.05:.95;const mates=teamOf(s).filter(q=>q!==fin&&q.p.pos!=='GK').sort((a,b)=>dist(a,fin)-dist(b,fin)).slice(0,4);
  return ST(0,()=>{fin.pin={x:cx,y:g+din*.05};fin.glow=2.5;mates.forEach((m,i)=>m.pin={x:cl(cx+(cx<.5?1:-1)*(.035+i*.02),.03,.97),y:g+din*(.06+(i%2)*.03)})})}
// attacking frame helpers for side s (0 = home attacks up toward y=0)
const goalY=s=>s===0?0:1,inDir=s=>s===0?1:-1;
function boxPins(s,rt,cornerSide){const g=goalY(s),din=inDir(s);const at=teamOf(s).filter(q=>q.p.pos!=='GK'),df=teamOf(1-s).filter(q=>q.p.pos!=='GK');
  const near=cornerSide===0?.4:.6,far=cornerSide===0?.62:.38;const cx=s===0?cornerSide===0?.012:.988:cornerSide===0?.988:.012;
  const atk={near:[[near,.05],[near+.03*(cornerSide?-1:1),.08],[.5,.07],[far,.09],[.5,.17]],far:[[far,.06],[far-.03*(cornerSide?-1:1),.09],[.5,.08],[near,.06],[.5,.18]],driven:[[.44,.05],[.5,.05],[.56,.05],[.5,.1],[.5,.18]],short:[[.5,.08],[.44,.1],[.58,.1],[.5,.18],[cx<.5?.1:.9,.03]],edge:[[.44,.06],[.56,.06],[.5,.09],[.5,.2],[.35,.2]],routine:[[.36,.12],[.64,.12],[.5,.16],[.46,.06],[.54,.06]]}[rt]||[[.45,.07],[.55,.07],[.5,.1],[.5,.17],[.4,.12]];
  return ST(0,()=>{LM.setpiece=true;at.slice(0,5).forEach((q,i)=>{const[x,d]=atk[i];q.pin={x:s===0?x:1-x,y:g+din*d}});df.slice(0,7).forEach((q,i)=>{const x=.36+(i%4)*.09+(i>3?.045:0),d=.045+(i>3?.07:.02);q.pin={x,y:g+din*d}})})}
function wallPins(s,bp){const g=goalY(s);const gx=.5,gyy=g;const dx=gx-bp.x,dy=gyy-bp.y,L=Math.hypot(dx,dy)||1;const ux=dx/L,uy=dy/L;const wx=bp.x+ux*.09,wy=bp.y+uy*.09;const df=teamOf(1-s).filter(q=>q.p.pos!=='GK').slice(0,4);
  return ST(0,()=>{LM.setpiece=true;df.forEach((q,i)=>q.pin={x:wx+(-uy)*(i-1.5)*.025,y:wy+ux*(i-1.5)*.025})})}

function toSteps(e){const s=e.s?sideS(e.s):0;const at=(z,x)=>scr(e.s,z,x);
  switch(e.k){
  case'line':qpush(ST(0,()=>logLine(e.txt,e.cls)),wait(e.cls==='g'?.5:e.cls==='n'?.7:e.cls===''?.25:0));break;
  case'kick':qpush(resetShape(e.s));break;
  case'pass':{const r=plObj(e.pid2);if(!r)break;const to=at(e.z,e.x);const fromC=LM.carrier||plObj(e.pid);const d=fromC?dist(fromC,to):.2;qpush(ST(0,()=>{LM.players.forEach(q=>{if(q.flow){q.pin=null;q.flow=false}});if(!LM.carrier||LM.carrier.p.id!==e.pid){const c=plObj(e.pid);if(c)LM.carrier=c}r.pin=to;r.flow=true}),kick(to,.22+d*.55,e.lg?.09:.015),give(r));break}
  case'carry':{const c=plObj(e.pid);if(!c)break;const to=at(e.z,e.x);qpush(ST(.55,()=>{LM.carrier=c;c.pin=to;c.flow=true},null,()=>{}));break}
  case'turn':{const d=plObj(e.pid);if(!d)break;const to=at(e.z,e.x);qpush(ST(0,()=>{LM.players.forEach(q=>{if(q.flow){q.pin=null;q.flow=false}});d.pin=to;d.flow=true}),kick(to,.3,0),give(d));break}
  case'throw':{const to=at(e.z,e.x);const t=nearestOf(teamOf(s).filter(q=>q.p.pos!=='GK'),to);qpush(kick({x:to.x<.5?-.01:1.01,y:to.y},.3),place(to.x<.5?.004:.996,to.y),ST(0,()=>{if(t){t.pin={x:to.x<.5?-.008:1.008,y:to.y};t.flow=true}}),wait(.6),give(t));break}
  case'offside':qpush(banner('OFFSIDE','#2459b8',1.1),wait(.9),unpinAll());break;
  case'foul':{const f=plObj(e.pid),v=plObj(e.vid);if(!f||!v)break;const to=at(e.z,e.x);qpush(ST(0,()=>{LM.carrier=v;v.pin=to;f.pin={x:to.x+.012,y:to.y+.008}}),wait(.55),banner(e.ft==='dangerous'?'DANGEROUS TACKLE':'FOUL','#5d635f',.9),wait(.6),ST(0,()=>{f.pin=null;v.pin=null}));break}
  case'card':{const p=plObj(e.pid);if(!p)break;qpush(ST(0,()=>{p.card=e.cc==='Y'?'Y':'R'}),banner(e.cc==='Y'?'YELLOW CARD':'RED CARD',e.cc==='Y'?'#d9a800':'#d62020',1.6),wait(1.4));if(e.cc!=='Y')qpush(pin(p,{x:p.x<.5?-.06:1.06,y:.5}),ST(0,()=>{p.leaving=true;p.off=true}),wait(1.4),ST(0,()=>{p.leaving=false;p.pin=null}));break}
  case'sub':{const o=plObj(e.off);const np=S.P[e.on];if(!o||!np)break;qpush(ST(0,()=>{o.p=np;o.num=np.num;o.card=null;o.glow=1.5}),banner(`SUB · ${last(np.name)}`,teamCol(s),1),wait(.8));break}
  case'skill':{const p=plObj(e.pid);const sk=SK[e.sid];if(sk&&e.cid&&!p){qpush(banner(`📋 ${sk.act?sk.act.n:sk.n}`,tierCol(sk.t),2),wait(1.6));break}if(!p||!sk)break;qpush(ST(0,()=>{p.glow=3;p.gcol=tierCol(sk.t)}),banner(`✨ ${sk.act?sk.act.n:sk.n}`,tierCol(sk.t),2),wait(1.6));break}
  case'gk':{const g=gkPl(s);if(!g)break;const gy=goalY(1-s),din=inDir(1-s);qpush(place(.5,gy+din*.045),ST(0,()=>{g.pin={x:.5,y:gy+din*.05};LM.setpiece=true}),wait(.7),give(g),ST(0,()=>{g.pin=null;LM.setpiece=false}));break}
  case'claim':{const g=gkPl(s);if(!g)break;qpush(ST(0,()=>{g.pin={x:LM.ball.x,y:LM.ball.y}}),wait(.3),give(g),wait(.6),unpinAll(),ST(0,()=>{LM.setpiece=false}));break}
  case'corner':{const tk=plObj(e.pid);if(!tk)break;const g=goalY(s),din=inDir(s);const cx=s===0?(e.side===0?.012:.988):(e.side===0?.988:.012);qpush(kick({x:cx,y:g+din*.004},.35),boxPins(s,e.rt,e.side),ST(0,()=>{tk.pin={x:cx,y:g+din*.01}}),wait(1.5),give(tk));break}
  case'corner_out':qpush(kick(()=>({x:LM.ball.x<.5?.3:.7,y:goalY(sideS(e.s))+(sideS(e.s)===0?-.02:.02)}),.5,.06),wait(.6),unpinAll());break;
  case'cross':{const t=plObj(e.pid2);const c=plObj(e.pid);if(!t)break;const to=at(e.z,e.x);qpush(ST(0,()=>{if(c&&!e.corner)LM.carrier=c;t.pin=to}),wait(e.corner?0:.3),kick(to,.7,.12),give(t));break}
  case'fk':{const tk=plObj(e.pid);if(!tk)break;const bp=at(e.z,e.x);qpush(place(bp.x,bp.y),ST(0,()=>{tk.pin={x:bp.x+(s===0?0:0),y:bp.y+(s===0?.025:-.025)}}),e.kind==='direct'?wallPins(s,bp):null,wait(e.kind==='quick'?.3:1.3),give(tk),ST(0,()=>{tk.pin=null}));break}
  case'pen':{const tk=plObj(e.pid),g=plObj(e.gk);if(!tk||!g)break;const gy=goalY(s),din=inDir(s);qpush(banner('PENALTY','#e2412a',1.6),ST(0,()=>{LM.setpiece=true;let i=0;LM.players.forEach(q=>{if(q===g||q===tk||q.off)return;if(q.p.pos==='GK'){q.pin=null;return}q.pin={x:cl(.24+((i*.083)%.52),.12,.88),y:gy+din*(.27+(i%3)*.035)};i++});tk.pin={x:.5,y:gy+din*.17};g.pin={x:.5,y:gy+din*.012};LM.ball.x=.5;LM.ball.y=gy+din*.11;LM.carrier=null}),wait(1.8),pin(tk,{x:.5,y:gy+din*.118}),wait(.45));break}
  case'shot':{const sh=plObj(e.pid);if(!sh)break;const gy=goalY(s),din=inDir(s);const g=gkPl(1-s);
    const tx=e.out==='wide'?(e.x<.5?.38:.62):e.out==='post'?.445:cl(e.x,.45,.55);const origin=e.pen?null:at(Math.min(e.z,.9),cl(.5+(R()-.5)*.35,.2,.8));
    qpush(ST(0,()=>{if(!e.pen){LM.carrier=sh;if(origin)sh.pin=origin}}),e.pen?null:wait(.35));
    if(e.out==='goal'){qpush(ST(0,()=>{if(g)g.pin={x:tx+(tx<.5?.06:-.06),y:gy+din*.015}}),kick({x:tx,y:gy-din*.022},.32,e.z>=.88?.015:.05),ST(0,()=>{LM.score[s]++;LM.ripple={gy,t:1.3};updScore();sh.glow=2.5}),banner('GOAL!',teamCol(s),2),celebrate(s,sh),wait(2.4))}
    else if(e.out==='save'){qpush(ST(0,()=>{if(g)g.pin={x:tx,y:gy+din*.018}}),kick({x:tx,y:gy+din*.018},.32,.02),give(g),e.pen?banner('SAVED!',teamCol(1-s),1.3):null,wait(.6),unpinAll())}
    else if(e.out==='block'){const b=plObj(e.bid);qpush(ST(0,()=>{if(b)b.pin={x:(sh.x+.5)/2,y:(sh.y+gy)/2}}),wait(.15),kick(()=>b?{x:b.x,y:b.y}:{x:.5,y:gy+din*.15},.2),wait(.4),unpinAll())}
    else{qpush(kick({x:tx,y:gy-din*.03},.35,.04));if(e.out==='post')qpush(kick({x:.47,y:gy+din*.06},.25));qpush(wait(.5),unpinAll())}
    break}
  case'ht':qpush(banner('HALF-TIME','#17191a',1.8),wait(1.8));break;
  case'ft':qpush(banner('FULL-TIME','#17191a',1.8),wait(1.8),ST(0,()=>{LM.ft=true}));break;
  }}
function updScore(){const el=document.getElementById('sc');if(el)el.textContent=LM.score.join('-')}
function logLine(txt,cls){const lg=document.getElementById('lg');if(lg){const d=document.createElement('div');if(cls)d.className=cls;d.textContent=`${LM.clock}' ${txt}`;lg.prepend(d);while(lg.children.length>120)lg.lastChild.remove()}
  if(cls!=='m'){const tk=document.getElementById('tk');if(tk){document.getElementById('tkm').textContent=LM.clock+"'";document.getElementById('tkt').textContent=txt;tk.className='tick'+(cls==='g'?' goal':cls==='n'?' story':'')}}}
function setupCanvas(){const cv=document.getElementById('cv');if(!cv||!LM)return;if(!LM.players.length)initPlayers();cancelAnimationFrame(LM.raf);LM.lt=performance.now();LM.raf=requestAnimationFrame(loop)}
function loop(now){if(!LM||LM.done)return;const cv=document.getElementById('cv');if(!cv){LM.raf=requestAnimationFrame(loop);return}
  const rdt=Math.min(.1,(now-LM.lt)/1000);LM.lt=now;const dt=LM.paused?0:rdt*LM.speed;
  if(dt>0){LM.t+=dt;let budget=dt,guard=0;while(budget>0&&guard++<30){const st=Math.min(budget,.04);budget-=st;tick(st);if(!LM||LM.done)return}
    const mn=document.getElementById('mn');if(mn)mn.textContent=LM.clock+"'"}
  draw(cv);LM.raf=requestAnimationFrame(loop)}
function tick(dt){
  let g=0;while(!LM.step&&g++<40){if(LM.q.length){LM.step=LM.q.shift();LM.stepT=0;LM.step.start&&LM.step.start();if(LM.step&&!LM.step.d){const st=LM.step;LM.step=null;st.upd&&st.upd(1);st.end&&st.end();continue}break}
    if(LM.ft){finishLive();return}
    const e=LM.tl[LM.ti++];if(!e){LM.ft=true;continue}LM.clock=e.c;toSteps(e)}
  if(LM.step){LM.stepT+=dt;const k=Math.min(1,LM.stepT/LM.step.d);LM.step.upd&&LM.step.upd(k);if(k>=1){const st=LM.step;LM.step=null;st.end&&st.end()}}
  movePlayers(dt);
  if(LM.banner){LM.banner.t-=dt;if(LM.banner.t<=0)LM.banner=null}
  if(LM.ripple){LM.ripple.t-=dt;if(LM.ripple.t<=0)LM.ripple=null}}
function draw(cv){const dpr=window.devicePixelRatio||1;const W=cv.clientWidth,H=cv.clientHeight;if(!W||!H)return;if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr)}const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);
  const mx=W*.07,my=H*.045,w=W-2*mx,h=H-2*my;const X=x=>mx+x*w,Y=y=>my+y*h;
  g.fillStyle='#24572f';g.fillRect(0,0,W,H);for(let i=0;i<12;i++){g.fillStyle=i%2?'#357546':'#2e6a3c';g.fillRect(mx,my+i*h/12,w,h/12+1)}
  g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=1.6;g.strokeRect(X(0),Y(0),w,h);g.beginPath();g.moveTo(X(0),Y(.5));g.lineTo(X(1),Y(.5));g.stroke();g.beginPath();g.arc(X(.5),Y(.5),w*.135,0,7);g.stroke();
  g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.arc(X(.5),Y(.5),2.2,0,7);g.fill();
  [0,1].forEach(gy=>{const d=gy===0?1:-1;g.strokeRect(X(.2),gy===0?Y(0):Y(1-.16),w*.6,h*.16);g.strokeRect(X(.37),gy===0?Y(0):Y(1-.055),w*.26,h*.055);g.beginPath();g.arc(X(.5),Y(gy+d*.11),2.2,0,7);g.fill();g.beginPath();g.arc(X(.5),Y(gy+d*.11),w*.12,d>0?.2*Math.PI:1.2*Math.PI,d>0?.8*Math.PI:1.8*Math.PI);g.stroke();
    const rip=LM.ripple&&LM.ripple.gy===gy?Math.sin(LM.ripple.t*30)*2.5*LM.ripple.t:0;const nh=h*.028;const ny=gy===0?Y(0)-nh-rip:Y(1)+rip;g.fillStyle='rgba(255,255,255,.15)';g.fillRect(X(.44),ny,w*.12,nh);g.strokeStyle='rgba(255,255,255,.4)';g.lineWidth=.7;for(let i=0;i<=8;i++){g.beginPath();g.moveTo(X(.44)+i*w*.015,ny);g.lineTo(X(.44)+i*w*.015,ny+nh);g.stroke()}for(let j=0;j<=3;j++){g.beginPath();g.moveTo(X(.44),ny+j*nh/3);g.lineTo(X(.56),ny+j*nh/3);g.stroke()}g.strokeStyle='#fff';g.lineWidth=2.4;g.strokeRect(X(.44),ny,w*.12,nh);g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=1.6;
    [0,1].forEach(cx=>{g.fillStyle='#f1c84b';g.fillRect(X(cx)-1,Y(gy)-(gy===0?10:0),2,10);g.fillStyle='rgba(255,255,255,.85)'})});
  const r=Math.max(8,Math.min(13,w/28));g.textAlign='center';g.textBaseline='middle';
  for(const q of LM.players){if(q.off&&!q.leaving)continue;const x=X(q.x),y=Y(q.y);g.globalAlpha=q.leaving?.6:1;g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(x+1,y+r*.85,r*.9,r*.33,0,0,7);g.fill();
    if(q.glow>0){g.strokeStyle=q.gcol||'#ffe35a';g.lineWidth=3;g.globalAlpha=.5+.5*Math.sin(LM.t*12);g.beginPath();g.arc(x,y,r+5,0,7);g.stroke();g.globalAlpha=1}
    if(typeof drawAura==='function')drawAura(g,q,x,y,r);
    g.fillStyle=q.slow>0?'#8e5be8':q.p.pos==='GK'?(q.s===0?'#e8b04a':'#8f5ad6'):q.col;if(q.slow>0)q.slow--;g.beginPath();g.arc(x,y,r,0,7);g.fill();g.strokeStyle=q===LM.carrier?'#ffe35a':'#fff';g.lineWidth=q===LM.carrier?3:1.8;g.stroke();
    g.fillStyle='#fff';g.font=`800 ${r*1.05}px "Big Shoulders Display",Impact,sans-serif`;g.fillText(q.num,x,y+1);
    if(q.card){g.fillStyle=q.card==='Y'?'#f2c300':'#d62020';g.fillRect(x+r*.55,y-r*1.25,r*.5,r*.7);g.strokeStyle='#111';g.lineWidth=.8;g.strokeRect(x+r*.55,y-r*1.25,r*.5,r*.7)}g.globalAlpha=1}
  const b=LM.ball;const bx=X(b.x),by=Y(b.y);const lift=b.h*h*1.4;g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(bx+1,by+2,r*.42,r*.2,0,0,7);g.fill();const br=r*.42*(1+b.h*3);g.fillStyle='#fff';g.beginPath();g.arc(bx,by-lift,br,0,7);g.fill();g.strokeStyle='#111';g.lineWidth=1.1;g.stroke();g.fillStyle='#111';g.beginPath();g.arc(bx,by-lift,br*.35,0,7);g.fill();
  if(LM.banner){const bn=LM.banner;const a=Math.min(1,bn.t/.3,(bn.max-bn.t)/.2+.2);g.globalAlpha=cl(a,0,1);g.fillStyle=bn.col;const bh=Math.min(64,H*.1);g.fillRect(0,H/2-bh/2,W,bh);g.fillStyle='#fff';g.font=`900 ${bh*.55}px "Big Shoulders Display",Impact,sans-serif`;g.fillText(bn.txt,W/2,H/2+2);g.globalAlpha=1}}
