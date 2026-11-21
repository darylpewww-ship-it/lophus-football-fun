/* Lophus Football Fun — Match Engine v3: possession chains with context.
   One engine decides every match. detail=true also records a timeline + commentary for the live 2D view. */
var DBG={poss:0,f3:0,steps:0};
const TUNE={
  keep:.80,          // base chance an on-ball action succeeds
  qW:.0060,          // effect of quality gap (attacker vs defender, rating points) on success
  momW:.09,          // effect of momentum on success
  pressW:.13,        // how much the defending side's press lowers success in their attacking half
  chanceBase:.024,    // base chance to try to create a chance once in the final third
  xgMul:.3,         // global xG multiplier
  foulBase:.11,      // chance a contested tackle is a foul
  yellow:.62,red:1.3,// card severity thresholds
  cornerBlock:.5,cornerSave:.34,cornerCross:.18,
  outOfPlay:.045,    // per action chance the ball goes out for a throw-in
  fatigue:1,         // fatigue speed
  momDecay:.955,     // momentum decay per minute
  maxSubs:3,
  stepCap:22,        // safety cap on actions per possession
};
const STY={'Fast Transition':{tempo:.75,press:.55,line:.5,width:.6,direct:.55,risk:.6},'High Pressing':{tempo:.7,press:.9,line:.75,width:.55,direct:.45,risk:.55},'Possession':{tempo:.3,press:.6,line:.65,width:.6,direct:.15,risk:.35},'Low Block':{tempo:.5,press:.25,line:.2,width:.4,direct:.5,risk:.3},'Direct Play':{tempo:.85,press:.5,line:.45,width:.5,direct:.85,risk:.55},'Total Football':{tempo:.55,press:.7,line:.6,width:.65,direct:.35,risk:.5}};
const REFS=['Mark Haldane','Pieter Vos','Luis Arriaga','Tomás Leite','Marco Fenzi','Jens Okafor','Carl Whitby','Iñigo Sala','Rui Mota','Bram Kuijt'];
const MENT={normal:{},protect:{tempo:-.2,press:-.12,line:-.25,risk:-.25,direct:.1,waste:8},cruise:{tempo:-.15,press:-.15,risk:-.15,waste:5},chase:{tempo:.15,press:.15,line:.15,risk:.2,direct:.1},desperate:{tempo:.2,press:.25,line:.25,risk:.35,direct:.35,foul:1.35},respond:{tempo:.1,press:.18,line:.12,risk:.1},regroup:{press:-.2,line:-.18,risk:-.12}};

function px(p){if(!p.x){const r=()=>Math.round(cl(nrm()*3.6,-10,10));p.x={agg:r(),aer:r(),cmp:r(),vis:r(),setp:r()}}return p.x}
function attrs(p,tac,cb){const e=k=>eff(p,k,tac,cb);const x=px(p);const T=e('tec'),F=e('fast'),Ph=e('phy'),Sm=e('smart');const tf=traitFx(p);const pos=p.pos;
  return{pace:F,str:Ph,tec:T,iq:Sm,pas:T*.6+Sm*.4+x.vis*.6,vis:Sm*.7+T*.3+x.vis*1.2,
    fin:T*.5+Sm*.2+F*.1+Ph*.2+x.cmp+(pos==='ST'?4:pos==='AM'?2:pos==='DF'?-7:pos==='GK'?-25:0),
    cmp:Sm*.6+T*.3+x.cmp*1.5+(tf.clutch||0)*10,agg:50+x.agg*3.5+(Ph-60)*.3,
    aer:Ph*.55+Sm*.15+x.aer*2.8+(pos==='DF'||pos==='ST'?5:0),tck:Ph*.4+Sm*.4+F*.2+(pos==='DF'?6:pos==='MF'?2:-4),
    pos:Sm*.75+Ph*.1+F*.15,drb:T*.55+F*.45,setp:T*.65+Sm*.15+x.setp*3,gk:pos==='GK'?Sm*.5+Ph*.3+F*.2+x.cmp:28,sta:Ph*.6+30}}

function runEngine(f,detail){
  const ref={name:pick(REFS),strict:Math.round((.72+R()*.6)*100)/100};
  const M={planLines:[],added1:()=>Math.min(300,60+M.stops1*12),added2:()=>Math.min(420,90+(M.stops-M.stops1)*12),stops1:0,t:0,half:1,tl:[],detail,ref,mom:0,lastLine:-999,story:[],ev:[],cards:[],act:[],mp:[],subs:[],rt:{},minute:0,addedSeen:0,stops:0,poss:{h:0,a:0},heat:[],lastGoal:null};
  const H=mkSide(M,f.h,'h'),A=mkSide(M,f.a,'a');H.opp=A;A.opp=H;M.H=H;M.A=A;
  [H,A].forEach(sd=>sd.on.forEach(u=>{for(const id of u.p.tr){const s=SK[id];if(s&&s.act&&R()<s.act.ch)M.act.push({side:sd.k,pid:u.p.id,sid:id,k:s.act.k,m:ri(5,85),done:false})}}));
  [[H,f.h],[A,f.a]].forEach(([sd,cid])=>{const co=coachOf(cid);if(co&&co.tr)for(const id of co.tr){const s=SK[id];if(s&&s.act&&R()<s.act.ch)M.act.push({side:sd.k,cid:co.id,sid:id,k:s.act.k,m:ri(5,85),done:false})}});
  M.home=H;H.homeAdv=homeAdv(f.h);gamePlan(M,H,A);gamePlan(M,A,H);
  if(detail){preMatchLines(M,H,A);M.planLines.forEach(t=>line(M,t,'n'))}
  let cur={sd:H,z:.5,x:.5,phase:'kick'};
  const half1=45*60,half2=90*60;
  while(true){
    tickMinute(M);
    const r=possession(M,cur.sd,cur.z,cur.x,cur.phase);cur=r;
    if(M.half===1&&M.t>=half1+M.added1()){M.stops1=M.stops;M.half=2;const lab=`45+${Math.max(1,Math.round((M.t-half1)/60))}`;M.t=half1;if(detail){htLines(M);log(M,'ht',{});}htAdjust(M,H);htAdjust(M,A);cur={sd:A,z:.5,x:.5,phase:'kick'};[H,A].forEach(sd=>sd.on.forEach(u=>u.fat=Math.max(0,u.fat-.08)))}
    else if(M.half===2&&M.t>=half2+M.added2()){if(!M.mirDone){M.mirDone=1;let hit=0;[H,A].forEach(sd=>{if(sd.miracle&&sd.g<=sd.opp.g){hit=1;if(detail)line(M,`🌟 A miracle in stoppage time for ${clubN(sd)}!`,'g');cur=goal(M,sd,actor(sd,.9),null,'shot','foot',.5,.5)}});if(hit)continue}break}
    if(M.t>9000)break;
  }
  if(detail){ftLines(M);log(M,'ft',{})}
  return buildResult(M,f);
}
function mkSide(M,cid,k){const L=pickXI(cid);const co=coachOf(cid);const tac=L.tac;const cb=cboost(cid);
  const sd={ai:coachAI(co),_M:M,k,cid,L,co,tac,base:{...(STY[tac]||STY['Total Football'])},sty:null,ment:'normal',g:0,on:[],bench:L.bench.slice(),subs:0,fouls:0,st:{shots:0,sot:0,corners:0,fouls:0,yc:0,rc:0,off:0,xg:0},boost:0,xgMul:1,oppXg:1,lastConceded:-999,reds:0,str:strength(cid,L)};
  L.xi.forEach((p,i)=>{if(!p)return;sd.on.push({p,a:attrs(p,tac,cb),role:L.slots[i][0],lane:L.slots[i][1],fat:0,f:0,y:false,off:false});M.rt[p.id]=0});
  sd.boost=(sd.ai-55)*.03;sd.sty=sd.base;return sd}
const ACTK=['short','fwd','long','carry','sw','cross'];
const live=sd=>sd.lv||(sd.lv=sd.on.filter(u=>!u.off));
const dirty=sd=>{sd.lv=null;sd.aw=null;sd._r=null};
function zpick(list,ws){let t=0;for(let i=0;i<ws.length;i++)t+=ws[i];let r=R()*t;for(let i=0;i<ws.length;i++){if((r-=ws[i])<0)return list[i]}return list[list.length-1]}
const AZ=[{DF:4,MF:2,AM:.6,ST:.3},{DF:1.2,MF:4,AM:2.5,ST:1},{DF:.4,MF:2,AM:4,ST:3.5}],DZ=[{DF:5,MF:2,AM:.5,ST:.2},{DF:1.5,MF:4,AM:2,ST:1},{DF:.3,MF:1.5,AM:3,ST:4}];
function zt(sd){if(sd.aw)return sd.aw;const us=live(sd).filter(u=>u.role!=='GK');sd.aw={us,a:AZ.map(z=>us.map(u=>z[u.role]||1)),d:DZ.map(z=>us.map(u=>z[u.role]||1))};return sd.aw}
const fq=(u,v)=>v*(1-.18*u.fat);
const avgA=(us,f)=>us.length?us.reduce((s,u)=>s+fq(u,f(u.a)),0)/us.length:40;
const byRoles=(sd,roles)=>live(sd).filter(u=>roles.includes(u.role));
function teamR(sd){if(sd._r&&sd._rt===Math.floor(sd._M.t/120))return sd._r;const d=byRoles(sd,['DF']),m=byRoles(sd,['MF','AM']),a=byRoles(sd,['ST','AM']),out=live(sd).filter(u=>u.role!=='GK');const gk=byRoles(sd,['GK'])[0];
  const aer=out.map(u=>fq(u,u.a.aer)).sort((x,y)=>y-x);const r={build:avgA(d.concat(m),a=>a.pas*.6+a.iq*.4)+sd.boost,create:avgA(m.concat(a),a=>a.vis*.5+a.drb*.3+a.pas*.2)+sd.boost,fin:avgA(a,a=>a.fin)+sd.boost,def:avgA(d,a=>a.tck*.5+a.pos*.5)+sd.boost-(11-live(sd).length)*4,press:avgA(out,a=>a.sta*.5+a.pace*.5),aerA:(aer[0]+aer[1]+aer[2]+aer[3])/4||50,aerD:(aer[0]+aer[1]+aer[2])/3||50,gk:gk?fq(gk,gk.a.gk):35,pace:avgA(a,a=>a.pace)};
  sd._r=r;sd._rt=Math.floor(sd._M.t/120);return r}
const momOf=(M,sd)=>sd.k==='h'?M.mom:-M.mom;
function bumpMom(M,sd,v){M.mom=cl(M.mom+(sd.k==='h'?v:-v),-1,1)}
function clock(M){const m=M.t/60;if(M.half===1&&m>=45)return `45+${Math.min(9,Math.floor(m-45)+1)}`;if(M.half===2&&m>=90)return `90+${Math.min(9,Math.floor(m-90)+1)}`;return String(Math.floor(m)+1)}
function log(M,k,d){if(!M.detail)return;M.tl.push({t:Math.round(M.t),c:clock(M),k,...d})}
function line(M,txt,cls,force){if(!M.detail)return;log(M,'line',{txt,cls:cls||''});if(cls==='n')M.lastLine=M.t}

function tickMinute(M){const m=Math.floor(M.t/60);if(m===M.minute)return;const steps=m-M.minute;M.minute=m;
  for(let i=0;i<steps;i++)M.mom*=TUNE.momDecay;
  [M.H,M.A].forEach(sd=>{sd._M=M;
    // fatigue
    live(sd).forEach(u=>{u.fat=cl(u.fat+steps*(.0035+sd.sty.press*.0035)*(1-(u.a.sta-55)/160)*TUNE.fatigue*(u.role==='GK'?.3:1),0,1)});
    // mentality from game state
    const diff=sd.g-sd.opp.g,mm=M.t/60+(M.half===2?0:0);const tm=M.half===2?mm:mm;let ment='normal';
    if(live(sd).length<live(sd.opp).length)ment='regroup';
    if(M.half===2){if(diff>0&&tm>=70)ment=diff>=2?'cruise':'protect';else if(diff<0&&tm>=62)ment=tm>=80?'desperate':'chase';else if(diff===0&&tm>=78&&sd.str>sd.opp.str+2)ment='chase'}
    if(diff<0&&M.t-sd.lastConceded<300&&ment==='normal')ment='respond';
    if(sd.ai<45&&ment==='protect'&&(sd._mgl??(sd._mgl=R()<.5)))ment='normal';
    if(sd.ai<35&&M.half===2&&diff>0&&tm>=55&&ment==='normal'&&(sd._early??(sd._early=R()<.6)))ment='protect';
    if(sd.ai<40&&ment==='chase'&&(sd._slow??(sd._slow=R()<.5))&&tm<78)ment='normal';
    if(ment!==sd.ment){const prev=sd.ment;sd.ment=ment;const b=sd.base,o0=MENT[ment];const o={...o0};if(sd.ai>=80&&ment==='protect'){o.line=(o.line||0)*.5;o.risk=(o.risk||0)*.6}sd.sty={tempo:cl(b.tempo+(o.tempo||0),.05,1),press:cl(b.press+(o.press||0),.05,1),line:cl(b.line+(o.line||0),.05,1),width:b.width,direct:cl(b.direct+(o.direct||0),0,1),risk:cl(b.risk+(o.risk||0),.05,1),waste:o.waste||0,foul:o.foul||1};
      if(M.detail&&ment!=='normal'&&ment!=='respond')narr(M,sd,ment)}
    if(!sd.sty.foul)sd.sty.foul=1;
    // substitutions
    if(M.half===2&&M.t/60>=75-sd.ai*.25&&sd.subs<TUNE.maxSubs&&sd.bench.length&&R()<(.05+sd.ai/900)*steps){const tired=live(sd).filter(u=>u.role!=='GK').sort((a,b)=>b.fat-a.fat);let off=sd.ai<40&&R()<.5?pick(tired):tired[0];let want=off&&off.role;
      if(sd.ment==='chase'||sd.ment==='desperate'){const d=live(sd).filter(u=>u.role==='DF'||u.role==='MF').sort((a,b)=>b.fat-a.fat)[0];if(d&&R()<(sd.ai/120)){off=d;want='ST'}}
      if(off&&(off.fat>.32||sd.ment==='chase'||sd.ment==='desperate'||M.t/60>70)){const pool=sd.bench.filter(p=>p.pos!=='GK');const on=sd.ai<35&&R()<.4?pick(pool):(pool.filter(p=>p.pos===want).sort((a,b)=>b.ovr-a.ovr)[0]||pool.find(p=>pen(p.pos,off.role)<=6)||pool[0]);
        if(on){sd.bench=sd.bench.filter(p=>p!==on);const u={p:on,a:attrs(on,sd.tac,cboost(sd.cid)),role:off.role===want?off.role:want||off.role,lane:off.lane,fat:0,f:0,y:false,off:false};off.off=true;off.subbed=true;sd.on.push(u);dirty(sd);sd.subs++;M.rt[on.id]=0;M.subs.push({side:sd.k,off:off.p.id,on:on.id,m:Math.floor(M.t/60)+1});M.t+=25;sd._r=null;
          log(M,'sub',{s:sd.k,off:off.p.id,on:on.id});if(M.detail)line(M,pick([`Change for ${clubN(sd)}: ${on.name} replaces ${off.p.name}${off.fat>.45?', who is out on his feet':''}.`,`${clubN(sd)} make a change: ${last(off.p.name)} off, ${on.name} on${sd.ment==='chase'||sd.ment==='desperate'?' to chase the game':''}.`,`Fresh legs for ${clubN(sd)}: ${on.name} comes on for ${last(off.p.name)}.`]),'s')}}}
  });
  // God skills fire at their minute
  M.act.forEach(a=>{if(a.done||M.t/60<a.m)return;a.done=true;const sd=a.side==='h'?M.H:M.A;if(!a.cid&&!live(sd).some(u=>u.p.id===a.pid))return;a.fired=true;const s=SK[a.sid];
    if(a.k==='tempo'){sd.boost+=6;sd._r=null}if(a.k==='strike')sd.xgMul*=1.6;if(a.k==='aegis')sd.opp.xgMul*=.55;if(a.k==='miracle')sd.miracle=true;
    log(M,'skill',{s:sd.k,pid:a.pid,cid:a.cid,sid:a.sid});if(M.detail)line(M,`✨ ${a.cid?'Coach '+S.C[a.cid]?.name:S.P[a.pid]?.name} channels ${s.n}: ${s.act.d}!`,'g')});
  // narrative pulse
  if(M.detail&&M.t-M.lastLine>420)narrPulse(M);
}
const clubN=sd=>S.clubs[sd.cid].name;
function actor(sd,z){const t=zt(sd);return zpick(t.us,t.a[z<.33?0:z<.66?1:2])}
function defender(sd,z){const t=zt(sd);const dz=1-z;return zpick(t.us,t.d[dz<.33?0:dz<.66?1:2])}
const gkOf=sd=>byRoles(sd,['GK'])[0]||live(sd)[0];
function rate(M,u,v){if(u)M.rt[u.p.id]=(M.rt[u.p.id]||0)+v}

/* ---- one possession: returns where the next one starts ---- */
function possession(M,sd,z,x,phase){
  const op=sd.opp,st=sd.sty,R1=teamR(sd),R2=teamR(op),mom=momOf(M,sd);
  let carrier=phase==='gk'?gkOf(sd):actor(sd,z);let steps=0;const startT=M.t;
  if(phase==='kick'){log(M,'kick',{s:sd.k,pid:carrier.p.id});M.t+=4}
  let final3=false;DBG.poss++;
  while(steps++<TUNE.stepCap){DBG.steps++;
    // final third: try to make something happen
    if(z>=.7){if(!final3){final3=true;DBG.f3++;bumpMom(M,sd,.015);M.heat.push({t:M.t,k:sd.k})}
      const pTry=cl(TUNE.chanceBase+(z-.7)*.3+(R1.create-R2.def)*.004+mom*.05+(phase==='counter'?.2:0)+st.risk*.05,.03,.6);
      if(R()<pTry){M.poss[sd.k]+=M.t-startT;return chance(M,sd,carrier,z,x,phase)}}
    // choose an action
    const w={short:1.6*(1-st.tempo)+.5,fwd:1.2+st.tempo*.8,long:z<.5?st.direct*1.6:st.direct*.4,carry:.9+fq(carrier,carrier.a.drb)/90,sw:st.width*.5*(z>.3&&z<.75?1:.3),cross:z>.66&&(x<.22||x>.78)?.35+st.width*.5:0};
    if(phase==='counter'){w.fwd*=2;w.carry*=1.6;w.short*=.3;w.sw=0}
    const act=zpick(ACTK,[w.short,w.fwd,w.long,w.carry,w.sw,w.cross]);
    if(act==='cross'){M.poss[sd.k]+=M.t-startT;return chance(M,sd,carrier,z,x,phase,'cross')}
    const dt=act==='long'?5:act==='carry'?5+R()*3:3.5+(1-st.tempo)*6+R()*2.5;M.t+=dt;
    // the defending side's press bites hardest in our half
    const pressBite=op.sty.press*TUNE.pressW*(z<.5?1.2:.6)*(teamR(op).press/65);
    const dfn=defender(op,z);
    let attQ=act==='carry'?fq(carrier,carrier.a.drb):act==='long'?fq(carrier,carrier.a.pas)-8:fq(carrier,carrier.a.pas);
    const defQ=act==='carry'?fq(dfn,dfn.a.tck):(R2.def*.6+fq(dfn,dfn.a.pos)*.4);
    let p=TUNE.keep+(attQ-defQ)*TUNE.qW+mom*TUNE.momW-pressBite+(act==='short'?.07:act==='sw'?.04:act==='long'?-.16:act==='fwd'?-.05:-.02)+(sd===M.H?H_ADV(M):0);
    if(phase==='counter')p+=.04;if(z>.7)p-=.13+(R2.def-55)*.003;
    // out of play for a throw-in
    if(R()<TUNE.outOfPlay){const nx=x<.5?0:1;const toUs=R()<.5;M.t+=12;M.stops++;const ns=toUs?sd:op;log(M,'throw',{s:ns.k,z:ns===sd?z:1-z,x:ns===sd?nx:1-nx});if(M.detail&&R()<.25)line(M,`Out for a throw-in to ${clubN(ns)}.`,'m');M.poss[sd.k]+=M.t-startT;return{sd:ns,z:ns===sd?z:1-z,x:ns===sd?nx:1-nx,phase:'throw'}}
    if(R()<p){// success
      let nz=z,nx=x;let recv=carrier;if(act!=='carry'){for(let k=0;k<4&&recv===carrier;k++)recv=actor(sd,Math.min(.95,z+.1))}
      if(act==='short'){nz=z+R()*.07;nx=cl(x+(R()-.5)*.25,.05,.95)}else if(act==='fwd'){nz=z+.08+R()*.12;nx=cl(x+(R()-.5)*.3,.05,.95)}else if(act==='long'){nz=z+.25+R()*.2;nx=cl(.5+(R()-.5)*.7,.05,.95)}else if(act==='carry'){nz=z+.04+R()*.08;nx=cl(x+(R()-.5)*.12,.05,.95)}else{nz=z+(R()-.3)*.05;nx=x<.5?.8+R()*.15:.05+R()*.15}
      nz=cl(nz,.03,.97);
      // offside on balls in behind
      if((act==='fwd'||act==='long')&&nz>.72&&R()<.04+op.sty.line*.12-(fq(recv,recv.a.pos)-60)*.002){sd.st.off++;M.t+=15;log(M,'offside',{s:sd.k,pid:recv.p.id,z:nz,x:nx});if(M.detail)line(M,pick([`Flag up: ${last(recv.p.name)} timed his run a fraction early.`,`${last(recv.p.name)} is caught offside. ${op.sty.line>.55?'That high line works again.':'Good awareness from the back line.'}`,`Offside against ${last(recv.p.name)}.`]),'m');M.poss[sd.k]+=M.t-startT;return{sd:op,z:1-nz,x:1-nx,phase:'fk'}}
      log(M,act==='carry'?'carry':'pass',{s:sd.k,pid:carrier.p.id,pid2:recv.p.id,z:nz,x:nx,lg:act==='long'});rate(M,carrier,.012);
      if(M.detail&&R()<.06)buildLine(M,sd,act,carrier,recv,nz);
      z=nz;x=nx;carrier=recv;continue}
    // lost it
    const tackle=act==='carry'||R()<.4;M.poss[sd.k]+=M.t-startT;
    if(z>.8&&R()<.09){const dd=defender(op,z);log(M,'turn',{s:op.k,pid:dd.p.id,z:.03,x:1-x});if(M.detail&&R()<.5)line(M,`${last(dd.p.name)} gets a toe to it and puts it behind.`,'m');return corner(M,sd)}
    if(tackle){const fr=foulCheck(M,op,dfn,sd,carrier,z,x,phase);if(fr)return fr}
    rate(M,dfn,.08);rate(M,carrier,z<.3?-.08:-.02);
    log(M,'turn',{s:op.k,pid:dfn.p.id,z:1-z,x:1-x,tk:tackle});
    const deep=z<.25&&carrier.role!=='GK'&&R()<.35;if(M.detail&&(deep||R()<.06))line(M,deep?(op.sty.press>.6?`${clubN(op)} press high and ${last(dfn.p.name)} nicks it off ${last(carrier.p.name)}.`:`Loose from ${last(carrier.p.name)}, and ${last(dfn.p.name)} pounces deep in ${clubN(sd)}'s half.`):pick([`${last(dfn.p.name)} reads it and steps in.`,`Good tackle by ${last(dfn.p.name)}.`,`${last(dfn.p.name)} wins it back for ${clubN(op)}.`]),deep?'':'m');
    // transition: winning it in midfield against a high line = counter
    const nz=1-z;const counter=nz>.3&&nz<.75&&(sd.sty.line>.5||sd.sty.risk>.55)&&R()<.25+sd.sty.line*.3+ (teamR(op).pace-60)*.006;
    if(counter&&M.detail&&R()<.6)line(M,pick([`${clubN(op)} break at speed!`,`Now it's ${clubN(op)} on the counter...`,`Turnover, and ${clubN(op)} spring forward with men over.`]));
    return{sd:op,z:nz,x:1-x,phase:counter?'counter':'open'};
  }
  M.poss[sd.k]+=M.t-startT;return{sd:op,z:1-z,x:1-x,phase:'open'};
}
const H_ADV=M=>M.H.homeAdv*.011;
function buildLine(M,sd,act,a,b,z){const n=clubN(sd);const t=sd.sty.tempo;if(a===b){line(M,pick([`${last(a.p.name)} drives into space.`,`${last(a.p.name)} carries it forward.`]),'m');return}line(M,act==='long'?pick([`${last(a.p.name)} goes long for ${last(b.p.name)}.`,`Direct from ${n}: straight over the top.`]):t<.4?pick([`Patient from ${n}, keeping the ball and waiting for a gap.`,`${last(a.p.name)} recycles it. ${n} in no hurry.`]):pick([`${last(a.p.name)} finds ${last(b.p.name)} between the lines.`,`${n} move it quickly: ${last(a.p.name)} to ${last(b.p.name)}.`,`${last(a.p.name)} drives into space.`]),'m')}

/* ---- fouls and cards ---- */
function foulCheck(M,dsd,dfn,asd,vic,z,x,phase){
  const transition=phase==='counter'||(z>.35&&z<.75&&asd.sty.tempo>.6);
  let p=TUNE.foulBase*(fq(dfn,dfn.a.agg)/55)*(1+dsd.sty.press*.35)*(transition?1.5:1)*(1+dfn.fat*.7)*(fq(vic,vic.a.drb)/62)*(dsd.sty.foul||1)*(dfn.y?.55:1)*(.85+M.ref.strict*.15);
  if(R()>=p)return null;
  dfn.f++;dsd.fouls++;dsd.st.fouls++;M.t+=18;M.stops++;rate(M,dfn,-.08);M.heat.push({t:M.t,k:'foul'});
  let type,sev;const r=R();const agg=dfn.a.agg;
  if(transition&&z>.35&&z<.8&&R()<.4){type='tactical';sev=.4+R()*.26}else if(R()<.007*(agg/50)){type='dangerous';sev=1.0+R()*.3}else if(R()<.08+(agg-50)/250){type='reckless';sev=.42+R()*.25}else{type='clumsy';sev=.1+R()*.24}
  const dogso=z>.8&&phase==='counter'&&dfn.role==='DF'&&R()<.25;if(dogso)sev+=.55;
  sev+=(M.ref.strict-1)*.3+(dfn.f>=2?.2:0)+(dsd.fouls>=9&&R()<.4?.12:0)+(dsd.ment==='desperate'?.08:0)+nrm()*.06;
  const inBox=z>=.84&&x>.2&&x<.8&&(phase==='solo'||R()<.12);
  let card=null;if(sev>=TUNE.red)card='R';else if(sev>=TUNE.yellow&&!(dfn.y&&sev<TUNE.yellow+.12))card=dfn.y?'R2':'Y';
  log(M,'foul',{s:dsd.k,pid:dfn.p.id,vid:vic.p.id,z:1-z,x:1-x,ft:type});
  if(M.detail){const v=last(vic.p.name),d=last(dfn.p.name);
    const txt={tactical:[`${d} pulls back ${v} to stop the break. Cynical, but it works.`,`${d} takes one for the team, hauling down ${v} on the counter.`],dangerous:[`Horrible challenge from ${d}! Studs up on ${v}.`,`${d} goes in high and late on ${v}. That's dangerous.`],reckless:[`${d} flies into ${v}. Reckless.`,`Late from ${d}, and ${v} is down.`],clumsy:[`${d} clips ${v}. Free kick.`,`A clumsy one from ${d} on ${v}.`,`${v} goes down under ${d}'s challenge. The referee gives it.`]}[type];
    line(M,pick(txt),type==='clumsy'?'m':'');
    if(!card&&dfn.f===2)line(M,`${M.ref.name} has a word with ${d}. That's his second foul; the next one is a booking.`,'');
    if(!card&&dsd.fouls===8)line(M,`That's ${dsd.fouls} fouls from ${clubN(dsd)}. ${M.ref.strict>1.05?`${M.ref.name} won't put up with much more.`:'Persistent stuff.'}`,'n')}
  if(card){dfn.f=dfn.f;M.cards.push({side:dsd.k,pid:dfn.p.id,c:card,m:Math.floor(M.t/60)+1});log(M,'card',{s:dsd.k,pid:dfn.p.id,cc:card});
    if(card==='Y'){dfn.y=true;dsd.st.yc++;rate(M,dfn,-.3)}else{dfn.off=true;dfn.sentOff=true;dirty(dsd);dsd.st.rc++;dsd.reds++;dsd._r=null;rate(M,dfn,-1.2);bumpMom(M,dsd,-.3)}
    if(M.detail){const n=dfn.p.name;line(M,card==='Y'?pick([`Yellow card for ${n}.${type==='tactical'?' He knew what he was doing.':''}`,`${M.ref.name} reaches for his pocket: yellow for ${n}.`,`${n} goes into the book.${dfn.f>=2?' It had been coming.':''}`]):card==='R2'?`Second yellow! ${n} is off, and ${clubN(dsd)} are down to ${live(dsd).length}.`:`Straight red! ${n} is sent off${dogso?': he denied a clear goalscoring chance':''}. ${clubN(dsd)} down to ${live(dsd).length}.`,'g')}}
  if(inBox){return penalty(M,asd,vic)}
  return{sd:asd,z,x,phase:'fk',fk:{taker:null,z,x}}
}

/* ---- chances ---- */
function chance(M,sd,carrier,z,x,phase,forced){
  const op=sd.opp,st=sd.sty,R1=teamR(sd),R2=teamR(op);const us=live(sd).filter(u=>u.role!=='GK');
  const wide=byRoles(sd,['DF','MF','AM']).filter(u=>u.lane<.25||u.lane>.75);
  const w={through:.45*(R1.create/60)*(1+op.sty.line)*(teamR(sd).pace/60),cross:(wide.length?1:.4)*(.6+st.width)*(R1.aerA/R2.aerD),cutback:.8*(avgA(us,a=>a.drb)/60),longshot:.5+(1-op.sty.line)*1.2,solo:.5*(avgA(us,a=>a.drb)/62),counter:phase==='counter'?3.5:0};
  const type=forced||wpick(Object.keys(w),k=>w[k]);
  const pickBy=f=>wpick(us,u=>Math.max(.05,f(u)));
  let shooter,creator=carrier,base,kind='shot';
  if(type==='cross'){creator=wide.length?pick(wide):carrier;shooter=pickBy(u=>Math.pow(fq(u,u.a.aer)/55,3)*(u.role==='ST'?2:u.role==='DF'?.6:1));base=.085;kind='header';
    log(M,'cross',{s:sd.k,pid:creator.p.id,pid2:shooter.p.id,z:.82,x:creator.lane<.5?.1:.9});
    const win=1/(1+Math.exp(-(fq(shooter,shooter.a.aer)-R2.aerD-7)/9));
    if(R()>win){// defended
      if(R()<TUNE.cornerCross){M.t+=8;if(M.detail)line(M,pick([`${last(creator.p.name)} whips it in, headed behind by the defence.`,`Dangerous cross from ${last(creator.p.name)}, but it's cleared for a corner.`]));return corner(M,sd)}
      if(R()<.3&&byRoles(op,['GK'])[0]){const g=gkOf(op);rate(M,g,.08);log(M,'claim',{s:op.k,pid:g.p.id});if(M.detail)line(M,`${last(creator.p.name)} swings it in and ${last(g.p.name)} comes to claim.`,'m');M.t+=8;return{sd:op,z:.05,x:.5,phase:'gk'}}
      M.t+=4;const cl2=defender(op,.85);log(M,'turn',{s:op.k,pid:cl2.p.id,z:.15,x:1-x});if(M.detail&&R()<.5)line(M,pick([`${last(cl2.p.name)} heads it away.`,`Cross from ${last(creator.p.name)}, cleared by ${last(cl2.p.name)}.`]),'m');M.frustr=(M.frustr||0)+1;
      return{sd:op,z:.18,x:1-x,phase:R()<.25?'counter':'open'}}}
  else if(type==='through'){shooter=pickBy(u=>u.role==='ST'?fq(u,u.a.pace):u.role==='AM'?fq(u,u.a.pace)*.6:.1);creator=pickBy(u=>u!==shooter?fq(u,u.a.vis)/50*(u.role==='MF'||u.role==='AM'?2:.5):0);base=.26;kind='through'}
  else if(type==='cutback'){creator=pickBy(u=>u.role==='AM'||u.lane<.25||u.lane>.75?fq(u,u.a.drb):.1);shooter=pickBy(u=>u!==creator?(u.role==='ST'?3:u.role==='AM'||u.role==='MF'?1.5:.3)*fq(u,u.a.fin)/50:0);base=.19;kind='cutback'}
  else if(type==='longshot'){shooter=pickBy(u=>(u.role==='MF'||u.role==='AM'?2:u.role==='DF'?.4:1)*Math.pow(fq(u,u.a.tec)/55,2));creator=null;base=.035;kind='long'}
  else if(type==='solo'){shooter=pickBy(u=>(u.role==='AM'||u.role==='ST'?2:.3)*Math.pow(fq(u,u.a.drb)/55,2));creator=null;base=.12;kind='solo';
    const dfn=defender(op,.88);if(R()<.16){const fr=foulCheck(M,op,dfn,sd,shooter,.88,.5,phase);if(fr)return fr}}
  else{shooter=pickBy(u=>u.role==='ST'?2*fq(u,u.a.pace):u.role==='AM'?fq(u,u.a.pace):.2);creator=carrier;base=.3;kind='counter'}
  if(creator===shooter)creator=null;
  // quality of the chance
  let xg=base*Math.exp((fq(shooter,shooter.a.fin)-R2.gk)/30)*Math.exp(-(R2.def-60)/90)*(1+momOf(M,sd)*.15)*sd.xgMul*TUNE.xgMul*(creator?1+(fq(creator,creator.a.vis)-60)/200:1);
  if(live(op).length<10)xg*=1.15;
  xg=cl(xg,.01,.8);return shoot(M,sd,shooter,creator,xg,kind,type)}
function shoot(M,sd,sh,cr,xg,kind,type,setpiece){
  const op=sd.opp,g=gkOf(op);sd.st.shots++;DBG[type]=(DBG[type]||0)+1;sd.st.xg+=xg;M.t+=6;
  const sx=kind==='long'?.78:kind==='header'?.9:.86;const tx=.5+(R()-.5)*.1;
  if(M.detail&&!setpiece)line(M,shotIntro(sh,cr,kind),'');
  const cmp=fq(sh,sh.a.cmp);const pGoal=xg*(1+(cmp-60)/250);const big=xg>=.25;
  if(R()<pGoal){return goal(M,sd,sh,cr,kind,type,xg,tx)}
  const pBlock=kind==='long'?.3:kind==='header'?.08:.2;const pOn=.38+(cmp-60)/300;
  const r=R();
  if(r<pBlock){const b=defender(op,.9);rate(M,b,.12);log(M,'shot',{s:sd.k,pid:sh.p.id,z:sx,x:tx,out:'block',bid:b.p.id});if(M.detail)line(M,pick([`Blocked by ${last(b.p.name)}!`,`${last(b.p.name)} throws himself in the way.`]),'');
    bumpMom(M,sd,.04);if(R()<TUNE.cornerBlock)return corner(M,sd);if(R()<.25)return rebound(M,sd);return{sd:op,z:.15,x:.5,phase:R()<.3?'counter':'open'}}
  if(r<pBlock+pOn*(1-pBlock)){sd.st.sot++;rate(M,g,.25+xg);rate(M,sh,.1);log(M,'shot',{s:sd.k,pid:sh.p.id,z:sx,x:tx,out:'save',gk:g.p.id});
    const nx=R()<TUNE.cornerSave?'corner':R()<.1+xg*.3?'rebound':'hold';
    if(M.detail)line(M,(big?pick([`What a save from ${g.p.name}!`,`${last(g.p.name)} stands tall and denies ${last(sh.p.name)}!`])+' ':'')+(nx==='corner'?pick([`${last(g.p.name)} tips it round the post.`,`Pushed behind by ${last(g.p.name)}.`]):nx==='rebound'?`${last(g.p.name)} can only parry it...`:pick([`${last(g.p.name)} holds on.`,`Straight at ${last(g.p.name)}.`,`${last(g.p.name)} gets down to gather it.`])),big?'g':'');
    bumpMom(M,sd,big?.1:.05);if(big)M.nearMiss=(M.nearMiss||0)+1;
    if(nx==='corner')return corner(M,sd);if(nx==='rebound')return rebound(M,sd);return{sd:op,z:.05,x:.5,phase:'gk'}}
  rate(M,sh,big?-.2:-.03);const post=R()<.07;log(M,'shot',{s:sd.k,pid:sh.p.id,z:sx,x:post?.43:(R()<.5?.36:.64),out:post?'post':'wide'});
  if(M.detail)line(M,post?pick([`Off the post! ${sh.p.name} so close!`,`${last(sh.p.name)} hits the woodwork!`]):big?pick([`${sh.p.name} has to score... and he misses! Wide!`,`Huge chance gone. ${last(sh.p.name)} drags it wide.`]):pick([`Wide from ${last(sh.p.name)}.`,`${last(sh.p.name)} lifts it over the bar.`,kind==='long'?`Ambitious from range, and well off target.`:`${last(sh.p.name)} snatches at it. Off target.`]),post||big?'g':'m');
  bumpMom(M,sd,post||big?.08:.02);if(post||big)M.nearMiss=(M.nearMiss||0)+1;
  if(post&&R()<.35)return rebound(M,sd);
  M.t+=10;return{sd:op,z:.05,x:.5,phase:'gk'}}
function rebound(M,sd){const us=live(sd).filter(u=>u.role!=='GK');const sh=wpick(us,u=>u.role==='ST'?3:u.role==='AM'?2:1);if(M.detail)line(M,`The ball drops loose... ${last(sh.p.name)} pounces!`,'');return shoot(M,sd,sh,null,cl(.2*sd.xgMul*Math.exp((fq(sh,sh.a.fin)-teamR(sd.opp).gk)/30),.04,.5),'tap','rebound',true)}
function shotIntro(sh,cr,kind){const s=last(sh.p.name),c=cr?last(cr.p.name):null;return{through:[`${c||'A clever ball'} slides ${s} through on goal...`,`${s} beats the line, he's in...`],cutback:[`${c} gets to the byline, cuts it back for ${s}...`,`${c} pulls it back... ${s} arrives...`],long:[`${s} lets fly from distance...`,`${s} shapes to shoot from 25 yards...`],solo:[`${s} skips past one, then another... shoots!`,`${s} goes on a mazy run into the box...`],header:[`${c} delivers... ${s} rises highest...`,`Cross from ${c}... ${s} gets his head to it...`],counter:[`${c||'They'} feed ${s} on the break... two on one...`,`${s} races clear on the counter...`],tap:[`${s} reacts first...`]}[kind]?.[ri(0,1)]||`${s} shoots...`}
function goal(M,sd,sh,cr,kind,type,xg,tx,pen){
  const op=sd.opp;sd.g++;sd.st.sot++;rate(M,sh,1);if(cr)rate(M,cr,.6);const g=gkOf(op);rate(M,g,-.25);live(op).filter(u=>u.role==='DF').forEach(u=>rate(M,u,-.12));
  M.ev.push({m:Math.floor(M.t/60)+1,side:sd.k,sc:sh.p.id,as:cr?cr.p.id:0,pen:!!pen,kind});
  log(M,'shot',{s:sd.k,pid:sh.p.id,z:kind==='long'?.78:kind==='header'?.9:pen?.89:.86,x:tx,out:'goal',as:cr?cr.p.id:0,gk:g.p.id,pen:!!pen});
  bumpMom(M,sd,.4);op.lastConceded=M.t;const mm=Math.floor(M.t/60)+1;const H=M.H,A=M.A;
  if(M.detail){const sc=`${H.g}-${A.g}`;line(M,`GOAL! ${sh.p.name} scores for ${clubN(sd)}${cr?`, set up by ${last(cr.p.name)}`:''}! ${clubN(H)} ${H.g}, ${clubN(A)} ${A.g}.`,'g');
    const st=goalStory(M,sd,op,mm);if(st)line(M,st,'n')}
  M.lastGoal={k:sd.k,t:M.t};M.t+=55;return{sd:op,z:.5,x:.5,phase:'kick'}}
function goalStory(M,sd,op,mm){const d=sd.g-op.g;const n=clubN(sd),o=clubN(op);if(mm<=15&&sd.g+op.g===1)return pick([`An early goal changes the whole shape of this. ${o} must come out now, and that leaves space behind.`,`${n} strike early. Now we find out what ${o} are made of.`]);if(d===0)return pick([`${n} are level, and the momentum has swung.`,`All square again. Game on.`]);if(d===1&&sd.g>=2&&op.g>=1&&M.story.includes('comeback-'+op.k)===false&&mm>60)return `${n} have turned this around!`;if(mm>=85&&d>=1)return `That should be enough for ${n}. ${o} have been beaten in the dying minutes.`;if(d>=3)return `${o} are being taken apart.`;return null}

/* ---- set pieces ---- */
function taker(sd){return live(sd).filter(u=>u.role!=='GK').sort((a,b)=>fq(b,b.a.setp)-fq(a,a.a.setp))[0]}
function corner(M,sd){const op=sd.opp;sd.st.corners++;bumpMom(M,sd,.03);M.t+=22;M.stops++;
  const tk=taker(sd);const R1=teamR(sd),R2=teamR(op);const adv=R1.aerA-R2.aerD;const ta=(sd.co?sd.co.ta:55);
  const rw={near:2+Math.max(0,adv)*.05,far:2+R1.aerA/40,driven:1+fq(tk,tk.a.setp)/60,short:1+(1-sd.sty.tempo)*1.5+(adv<-5?1.2:0),edge:.9+(avgA(live(sd).filter(u=>u.role==='MF'||u.role==='AM'),a=>a.tec)-60)*.04,routine:.25+ta/120};
  const sharp=.4+sd.ai/50;const rt=wpick(Object.keys(rw),k=>Math.pow(Math.max(.1,rw[k]),sharp));const side=R()<.5?0:1;
  const RN={near:'an in-swinger to the near post',far:'a deep floated ball to the far post',driven:'a driven ball across the six-yard box',short:'it short',edge:'it to the edge of the box',routine:'a training-ground routine'};
  log(M,'corner',{s:sd.k,pid:tk.p.id,side,rt});
  if(M.detail)line(M,pick([`Corner to ${clubN(sd)}. ${last(tk.p.name)} goes for ${RN[rt]}.`,`${last(tk.p.name)} over the corner... ${RN[rt]}.`]),'');
  const q=fq(tk,tk.a.setp)+nrm()*9;
  if(q<46&&R()<.5){const o=R()<.5;log(M,'corner_out',{s:sd.k,o});if(M.detail)line(M,o?`Overhit. Straight out for a goal kick.`:`Poor delivery, cleared at the near post.`,'m');M.t+=8;return o?{sd:op,z:.05,x:.5,phase:'gk'}:{sd:op,z:.12,x:.5,phase:'open'}}
  const us=live(sd).filter(u=>u.role!=='GK'&&u!==tk);
  if(rt==='short'){const p2=pick(us);log(M,'pass',{s:sd.k,pid:tk.p.id,pid2:p2.p.id,z:.9,x:side?.92:.08});M.t+=6;if(R()<.5){const sh=wpick(us,u=>fq(u,u.a.fin));return shoot(M,sd,sh,p2,cl(.06*sd.xgMul,.02,.3),'cutback','short',true)}if(M.detail)line(M,`Worked short, but ${clubN(op)} stay compact and clear.`,'m');return{sd:op,z:.15,x:.5,phase:'open'}}
  if(rt==='edge'){const sh=wpick(us.filter(u=>u.role==='MF'||u.role==='AM'),u=>fq(u,u.a.tec))||pick(us);log(M,'pass',{s:sd.k,pid:tk.p.id,pid2:sh.p.id,z:.78,x:.5});if(M.detail)line(M,`Pulled back to ${last(sh.p.name)} waiting at the edge... first-time volley!`);return shoot(M,sd,sh,tk,cl(.05*Math.exp((fq(sh,sh.a.tec)-65)/20)*sd.xgMul,.02,.18),'long','edge',true)}
  const tgt=wpick(us,u=>Math.pow(fq(u,u.a.aer)/55,3)*(rt==='near'?fq(u,u.a.str)/55:1));const g=gkOf(op);
  if((rt==='far'||rt==='routine')&&R()<.12+(R2.gk-55)*.006){rate(M,g,.12);log(M,'claim',{s:op.k,pid:g.p.id});if(M.detail)line(M,`${last(g.p.name)} comes off his line and claims it confidently.`,'m');return{sd:op,z:.05,x:.5,phase:'gk'}}
  const bonus={near:3,far:2,driven:1,routine:6}[rt]||0;const win=1/(1+Math.exp(-(fq(tgt,tgt.a.aer)+bonus+(q-60)*.2-R2.aerD)/8));
  log(M,'cross',{s:sd.k,pid:tk.p.id,pid2:tgt.p.id,z:rt==='near'?.95:.9,x:rt==='near'?(side?.62:.38):(side?.38:.62),corner:1});
  if(R()<win){const base={near:.07,far:.085,driven:.09,routine:.12}[rt];return shoot(M,sd,tgt,tk,cl(base*Math.exp((fq(tgt,tgt.a.aer)-R2.gk*.5-30)/25)*sd.xgMul,.03,.35),'header',rt,false)}
  // cleared: second ball or counter
  const cl3=defender(op,.92);log(M,'turn',{s:op.k,pid:cl3.p.id,z:.12,x:.5});
  if(R()<.32){if(M.detail)line(M,`${last(cl3.p.name)} heads clear, but only as far as the edge of the box...`,'');const sh=wpick(us,u=>fq(u,u.a.tec));return shoot(M,sd,sh,null,.04*sd.xgMul,'long','second',true)}
  if(M.detail)line(M,pick([`${last(cl3.p.name)} wins the header and clears.`,`Defended well by ${clubN(op)}.`]),'m');
  return{sd:op,z:.2,x:.5,phase:teamR(op).pace>62&&R()<.35?'counter':'open'}}
function freeKick(M,sd,z,x){const op=sd.opp;const tk=taker(sd);M.t+=10;const central=Math.abs(x-.5)<.22;
  if(z>.68&&central&&z<.84){const s=fq(tk,tk.a.setp);if(R()<.35+(s-60)*.015){const kinds=['whipped it over the wall','driven it low under the wall','a dipping effort','a knuckleball'];const kk=pick(kinds);log(M,'fk',{s:sd.k,pid:tk.p.id,z,x,kind:'direct'});if(M.detail)line(M,`Free kick in a dangerous spot. ${last(tk.p.name)} stands over it...`);
      const xg=cl(.055*Math.exp((s-65)/14)*sd.xgMul,.02,.2);if(R()<.22){log(M,'shot',{s:sd.k,pid:tk.p.id,z,x:.5,out:'block',bid:defender(op,.9).p.id});if(M.detail)line(M,`Into the wall.`,'m');return R()<.3?corner(M,sd):{sd:op,z:.2,x:.5,phase:'open'}}
      if(M.detail)line(M,`${last(tk.p.name)} goes for goal with ${kk}...`);return shoot(M,sd,tk,null,xg,'long','fk',true)}}
  if(z>.62&&!central){log(M,'fk',{s:sd.k,pid:tk.p.id,z,x,kind:'cross'});if(M.detail)line(M,pick([`${last(tk.p.name)} whips the free kick into the box...`,`Wide free kick. ${last(tk.p.name)} floats it to the back post...`]),'');return chance(M,sd,tk,.85,x,'setpiece','cross')}
  log(M,'fk',{s:sd.k,pid:tk.p.id,z,x,kind:'quick'});return{sd,z,x,phase:z<.4&&sd.sty.direct>.5?'open':'open',noFk:true}}
function penalty(M,sd,vic){M.t+=60;const op=sd.opp;const tk=live(sd).filter(u=>u.role!=='GK').sort((a,b)=>(fq(b,b.a.cmp)+fq(b,b.a.fin))-(fq(a,a.a.cmp)+fq(a,a.a.fin)))[0];const g=gkOf(op);
  log(M,'pen',{s:sd.k,pid:tk.p.id,gk:g.p.id});if(M.detail){line(M,`PENALTY to ${clubN(sd)}! ${last(vic.p.name)} was brought down.`,'g');line(M,`${tk.p.name} places the ball on the spot...`,'')}
  const p=cl(.76+(fq(tk,tk.a.cmp)-fq(g,g.a.gk))/200,.55,.9);sd.st.shots++;sd.st.xg+=.76;
  if(R()<p)return goal(M,sd,tk,null,'pen','pen',.76,.5+(R()<.5?-.04:.04),true);
  M.mp.push({side:sd.k,pid:tk.p.id,m:Math.floor(M.t/60)+1});const saved=R()<.7;if(saved){sd.st.sot++;rate(M,g,.8)}rate(M,tk,-.5);
  log(M,'shot',{s:sd.k,pid:tk.p.id,z:.89,x:saved?.46:.37,out:saved?'save':'wide',gk:g.p.id,pen:true});
  if(M.detail)line(M,saved?`SAVED! ${g.p.name} guesses right!`:`${tk.p.name} puts it wide! He's missed the penalty!`,'g');bumpMom(M,op,.2);return{sd:op,z:.05,x:.5,phase:'gk'}}

/* ---- possession-level hooks for restarts ---- */
const _poss=possession;
possession=function(M,sd,z,x,phase){if(phase==='fk'){const r=freeKick(M,sd,z,x);if(r&&!r.noFk)return r;phase='open'}
  if(phase==='gk'){M.t+=8+(sd.sty.waste||0);const g=gkOf(sd);log(M,'gk',{s:sd.k,pid:g.p.id});if(sd.sty.direct>.55||R()<.3){const t=actor(sd,.55);log(M,'pass',{s:sd.k,pid:g.p.id,pid2:t.p.id,z:.5+R()*.1,x:.3+R()*.4,lg:true});if(R()<.45+(teamR(sd).aerA-teamR(sd.opp).aerD)*.01)return _poss(M,sd,.5,.5,'open');const d=defender(sd.opp,.5);log(M,'turn',{s:sd.opp.k,pid:d.p.id,z:.5,x:.5});return _poss(M,sd.opp,.5,.5,'open')}z=.12}
  if(phase==='throw'){M.t+=6+(sd.sty.waste||0)}
  return _poss(M,sd,z,x,phase)};

/* ---- narrative ---- */
function preMatchLines(M,H,A){const hs=H.tac,as=A.tac;line(M,`${M.ref.name} is the referee${M.ref.strict>1.12?', and he has a reputation for a quick whistle':M.ref.strict<.85?', and he likes to let the game flow':''}.`,'n');
  const clash=hs===as?`Two ${hs} sides. Expect a battle for control.`:`${clubN(H)}'s ${hs} against ${clubN(A)}'s ${as}.`+(as==='Low Block'||hs==='Low Block'?' One side will sit deep and wait.':(hs==='High Pressing'||as==='High Pressing')?' The press will set the tone.':'');line(M,clash,'n')}
function narr(M,sd,ment){const n=clubN(sd),o=clubN(sd.opp);const t={protect:[`${n} are sitting deeper now, protecting what they have.`,`${n} drop a line and start running down the clock.`],cruise:[`${n} are cruising, passing it around without hurry.`],chase:[`${n} need a goal and they're pushing men forward.`,`${n} throw caution aside: full-backs bombing on.`],desperate:[`It's all or nothing for ${n} now. Long balls, bodies forward, and space at the back for ${o}.`,`${n} are desperate. Everything goes long into the box.`],regroup:[`Down a man, ${n} reorganise into two tight banks.`]}[ment];if(t)line(M,pick(t),'n')}
function narrPulse(M){const now=M.t;const recent=M.heat.filter(h=>now-h.t<360);const f=recent.filter(h=>h.k==='foul').length;const hEnt=recent.filter(h=>h.k==='h').length,aEnt=recent.filter(h=>h.k==='a').length;M.heat=M.heat.filter(h=>now-h.t<600);
  const H=M.H,A=M.A;let t=null;
  if(f>=4)t=pick([`This is getting feisty. ${M.ref.name} has blown for ${f} fouls in the last few minutes.`,`Tempers are fraying out there.`]);
  else if(hEnt>=4&&hEnt>aEnt*2)t=pick([`${clubN(H)} have ${clubN(A)} pinned back. Wave after wave.`,`Sustained pressure from ${clubN(H)}.`]);
  else if(aEnt>=4&&aEnt>hEnt*2)t=pick([`${clubN(A)} are camped in the ${clubN(H)} half.`,`${clubN(A)} have taken control of this.`]);
  else if((M.frustr||0)>=4){t=`Crosses keep coming in and keep getting cleared. ${clubN(Math.abs(M.mom)>.1?(M.mom>0?H:A):H)} are running short of ideas.`;M.frustr=0}
  else if(Math.abs(M.mom)>.45)t=`The momentum is all with ${clubN(M.mom>0?H:A)} right now.`;
  else if(hEnt+aEnt<=1&&f<=1)t=pick([`A quiet spell. Both sides probing, neither committing.`,`Cagey stuff. Plenty of possession, little penetration.`]);
  if(t)line(M,t,'n');else M.lastLine=M.t-200}
function htLines(M){const H=M.H,A=M.A;const pt=M.poss.h+M.poss.a||1;const ph=Math.round(M.poss.h/pt*100);line(M,`Half-time: ${clubN(H)} ${H.g}-${A.g} ${clubN(A)}. Possession ${ph}-${100-ph}, shots ${H.st.shots}-${A.st.shots}.`,'n');
  const d=H.g-A.g;line(M,d===0?(H.st.xg>A.st.xg+.6?`${clubN(H)} have had the better chances; they'll wonder how it's still level.`:A.st.xg>H.st.xg+.6?`${clubN(A)} will feel they deserve to be ahead.`:'Little to separate them so far.'):`${clubN(d>0?H:A)} lead${Math.abs(d)>1?' comfortably':''}.${(d>0?A:H).st.xg>(d>0?H:A).st.xg?` ${clubN(d>0?A:H)} have created more, though.`:''}`,'n')}
function ftLines(M){const H=M.H,A=M.A;const pt=M.poss.h+M.poss.a||1;const ph=Math.round(M.poss.h/pt*100);
  const w=H.g>A.g?H:A.g>H.g?A:null;const l=w?w.opp:null;let story;
  if(!w)story=H.st.xg>A.st.xg+.8?`${clubN(H)} will feel they should have won it.`:A.st.xg>H.st.xg+.8?`${clubN(A)} dominated the chances but couldn't find a winner.`:'A fair draw.';
  else if(M.ev.length&&M.ev[M.ev.length-1].m>=85&&M.ev[M.ev.length-1].side===w.k)story=`A late, late winner for ${clubN(w)}.`;
  else if(l.st.xg>w.st.xg+.6)story=`${clubN(w)} won it without being the better side. ${clubN(l)} paid for their finishing.`;
  else if(w.g-l.g>=3)story=`A thrashing. ${clubN(w)} were a class above.`;
  else if(l.reds)story=`The red card turned it. ${clubN(w)} made the extra man count.`;
  else story=`${clubN(w)} deserved it.`;
  line(M,`Full-time: ${clubN(H)} ${H.g}-${A.g} ${clubN(A)}. ${story}`,'n');line(M,`Possession ${ph}-${100-ph} · shots ${H.st.shots}-${A.st.shots} (on target ${H.st.sot}-${A.st.sot}) · xG ${H.st.xg.toFixed(2)}-${A.st.xg.toFixed(2)} · corners ${H.st.corners}-${A.st.corners} · fouls ${H.st.fouls}-${A.st.fouls}`,'n')}

function buildResult(M,f){const H=M.H,A=M.A;const pt=M.poss.h+M.poss.a||1;
  const apps=sd=>sd.on.map(u=>u.p);
  return{Lh:H.L,La:A.L,gh:H.g,ga:A.g,ev:M.ev,cards:M.cards,act:M.act.filter(a=>a.fired).map(a=>({side:a.side,pid:a.pid,cid:a.cid,sid:a.sid,k:a.k,m:a.m})),mp:M.mp,poss:Math.round(M.poss.h/pt*100),shH:H.st.shots,shA:A.st.shots,sh:H.str,sa:A.str,
    st:{h:H.st,a:A.st},subs:M.subs,apps:{h:apps(H),a:apps(A)},rtd:M.rt,ref:M.ref,tl:M.detail?M.tl:null}}

/* ---- coach match AI ---- */
const COUNTER={'High Pressing':{direct:.2,tempo:.1,why:'go long early to beat their press'},'Low Block':{width:.15,tempo:-.1,risk:.05,why:'stretch their low block with width'},'Possession':{press:.12,line:.05,why:'press their build-up and force errors'},'Direct Play':{line:-.1,press:-.05,why:'drop the line and win the second balls'},'Fast Transition':{risk:-.1,line:-.08,why:'stay compact and deny them counters'},'Total Football':{press:.08,tempo:.05,why:'match their energy all over the pitch'}};
function gamePlan(M,sd,op){const ai=sd.ai;
  if(R()<(ai-35)/70){const c=COUNTER[op.tac];if(c){const b={...sd.base};for(const k in c)if(k!=='why')b[k]=cl((b[k]||0)+c[k],.05,1);sd.base=b;sd.sty=b;M.planLines.push(`${sd.co?sd.co.name:'The coach'} (${aiLvl(sd.co)[1]}) has set ${clubN(sd)} up to ${c.why}.`)}}
  if(ai>=68&&R()<ai/130){const tgt=live(op).filter(u=>u.role==='ST'||u.role==='AM').sort((a,b)=>(b.a.fin+b.a.vis)-(a.a.fin+a.a.vis))[0];if(tgt){const d=4+Math.round((ai-68)/8);tgt.a={...tgt.a,fin:tgt.a.fin-d,vis:tgt.a.vis-d,drb:tgt.a.drb-d};sd.marked=tgt;M.planLines.push(`${clubN(sd)} have a man-marking job on ${tgt.p.name}.`)}}
  if(ai<30&&R()<.35){const b={...sd.base};b.line=cl(b.line+.15,.05,1);b.risk=cl(b.risk+.15,.05,1);sd.base=b;sd.sty=b;M.planLines.push(`${clubN(sd)} look naive tonight: a high line and nobody covering it.`)}}
function htAdjust(M,sd){const op=sd.opp;const diff=sd.g-op.g;const worse=op.st.xg>sd.st.xg+.4;if(diff>0&&!worse)return;
  const ai=sd.ai;if(R()>ai/95){if(ai<40&&R()<.3&&M.detail)line(M,`No changes from ${clubN(sd)} at the break, despite the first half.`,'n');return}
  const b={...sd.base};let what;
  if(diff<0){if(op.sty.line>.55){b.direct=cl(b.direct+.2,0,1);what='to go in behind their high line'}else{b.width=cl(b.width+.15,0,1);b.risk=cl(b.risk+.1,0,1);what='to push the full-backs on and stretch them'}}
  else if(worse){b.line=cl(b.line-.1,.05,1);b.press=cl(b.press-.05,.05,1);what='to tighten up after being second best'}
  else{b.press=cl(b.press+.12,.05,1);b.tempo=cl(b.tempo+.1,.05,1);what='to press higher and up the tempo'}
  sd.base=b;sd.sty=b;sd.ment='normal';if(ai>=75){sd.boost+=1.5;sd._r=null}
  if(M.detail)line(M,`Half-time change: ${sd.co?sd.co.name:'the coach'} has told ${clubN(sd)} ${what}.`,'n')}
