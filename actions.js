/* Lophus Football Fun — actions and boot */
function cdRead(){const c=me();if(!S.ui.cd)S.ui.cd={...c.cr,ini:c.short};const d=S.ui.cd;const g=id=>document.getElementById(id);if(g('cdc1'))d.c1=g('cdc1').value;if(g('cdc2'))d.c2=g('cdc2').value;if(g('cdini'))d.ini=g('cdini').value.toUpperCase().slice(0,3);if(g('cdband'))d.band=g('cdband').checked}
function nextMailOrResume(prevMsg){const nx=S.mail.find(m=>!m.done);if(nx){openMail(nx.id,prevMsg);return}closeModal();render();if(prevMsg)toast(prevMsg);if(RUNMODE){const m=RUNMODE;RUNMODE=null;setTimeout(()=>runDays(m),350)}}
const A={
go:p=>{if(p==='club')S.ui.cv=S.me.cid;go(p)},
tab:(k,v)=>{S.ui.tab[k]=v;render()},tabgo:(pg,v)=>{S.ui.tab[pg==='transfers'?'tr':pg]=v;closeModal();go(pg)},
gotr:v=>{S.ui.tab.tr=v;closeModal();RUNMODE=null;go('transfers')},
close:()=>{closeModal();RUNMODE=null;render()},
run:m=>runDays(m),stoprun:()=>{if(RUN)RUN.stop=true},
openmail:id=>{RUNMODE=null;openMail(id)},
markall:()=>{S.mail.forEach(m=>m.read=true);save();render()},
mact:(id,a)=>{const m=S.mail.find(x=>x.id==id);if(!m||m.done)return;const r=MT[m.type].run(a,m.data,m);m.done=true;m.res=r;save();renderTop();nextMailOrResume(r)},
reveal:rid=>{const r=S.rep.find(x=>x.id==rid);if(r)r.rev=true;save();const open=$('#modal').classList.contains('on');if(open){const m=S.mail.find(x=>x.type==='scoutrep'&&x.data.rid==rid);if(m)openMail(m.id);else render()}else render()},
player:id=>playerSheet(id),
pf:x=>{S.ui.pf=x;render()},
coachreq:()=>{const co=coachOf(S.me.cid);const t=$('#rqTac').value,f=$('#rqForm').value;if(t===co.tac&&f===co.form)return toast('Nothing changed.');if(!boss()&&R()>co.mm/100*.6+S.me.trust/400){trust(-2,'Pushed the coach to change his system');toast(`${co.name} refuses: “I know how I want to play.”`);save();return}co.tac=t;co.form=f;trust(-1,'Changed the coach\'s system');save();render();toast(`${co.name} switches to ${t}, ${f}.`)},
hire:id=>{const c=S.C[id];const cur=coachOf(S.me.cid);if(!boss()&&c.ta+c.dv+c.mm>me().rep*3+50&&R()<.5){toast(`${c.name} turns the job down.`);return}const comp=cur?cur.wage*3:0;S.me.money-=comp;if(cur){cur.club=0;S.pool.push(cur.id)}c.club=S.me.cid;me().coach=c.id;S.pool=S.pool.filter(x=>x!==id);S.me.trust=60;S.me.tlog=[];trust(0,`Hired ${c.name}`);S.me.log.push({s:S.season,d:S.d,txt:`Hired ${c.name} as head coach${cur?`, replacing ${cur.name}`:''}`});save();S.ui.tab.squad='coach';go('squad');toast(`${c.name} is your new head coach.${comp?` Compensation ${money(comp)}.`:''}`)},
brief:(pos,emph)=>{const fee=agFee();if(S.me.money<fee)return toast('Not enough money. Top up in the Store.');S.me.money-=fee;agency(pos,avgOvr(S.me.cid)+2,28,emph,3,'Coach request');trust(1,'Briefed the agency for the coach');save();S.ui.tab.scout='reports';go('scout');toast('Report filed. Tap Reveal names.')},
listall:()=>{const{off}=coachPlan();off.forEach(p=>S.pend.push({d:S.d+ri(1,8),type:'bidfor',pid:p.id}));save();toast(`${off.length} players listed. Offers will appear in Transfers › Incoming.`)},
search:()=>{S.ui.q={pos:$('#qpos').value,min:+$('#qmin').value||0,age:+$('#qage').value||45,max:+$('#qmax').value||0,scope:$('#qscope').value};render()},
agency:()=>{const fee=agFee();if(S.me.money<fee)return toast('Not enough money. Top up in the Store.');S.me.money-=fee;agency($('#apos').value,+$('#amin').value||50,+$('#aage').value||30,$('#aemph').value,+$('#an').value);save();S.ui.tab.scout='reports';render();toast('Report filed. Tap Reveal names.')},
clubview:id=>{S.ui.cv=+id;go('club')},
lt:t=>{S.ui.lt=+t;S.ui.lr=0;render()},lr:r=>{S.ui.lr=+r;render()},
rename:()=>{const c=me();c.name=$('#rnClub').value.trim()||c.name;c.short=shortName(c.name);c.ground=$('#rnGround').value.trim()||c.ground;S.ui.cd=null;save();render();toast('Club identity saved.')},
cd:(k,v)=>{cdRead();S.ui.cd[k]=v;render()},
cdrand:()=>{const ini=S.ui.cd?.ini||me().short;S.ui.cd={...genCrest(),ini};render()},
cdreset:()=>{S.ui.cd=null;render()},
cdsave:()=>{cdRead();const c=me(),d=S.ui.cd;c.cr={sh:d.sh,pt:d.pt,c1:d.c1,c2:d.c2,ic:d.ic,band:d.band};c.col=d.c1;const ini=(d.ini||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,3);if(ini)c.short=ini;S.ui.cd=null;save();render();toast('New crest saved.')},
bonus:k=>{S.me.bonus=k;save();render()},
ticket:d=>{S.me.ticket=cl(S.me.ticket+ +d,5,120);if(+d<0)me().fans=cl(me().fans+.5,0,100);save();render()},
plan:k=>{S.me.pitch.plan=k;save();render()},
lever:k=>{const c=me();if(k==='event'){const fe=[300e3,120e3,40e3,15e3,6e3][c.t-1];if(S.me.money<fe)return toast('Not enough money.');S.me.money-=fe;c.fans=cl(c.fans+8,0,100);toast('Fan day was a hit. Fans +8.')}else if(k==='open'){S.me.money-=5000;sq(c.id).forEach(p=>p.mo=cl(p.mo+3,0,100));toast('Open session done. Morale +3.')}else{const f=S.me.res.slice(-5);const pts=f.reduce((s,r)=>s+(r.gf>r.ga?3:r.gf===r.ga?1:0),0);const d=boss()?4:pts>=8?3:pts>=5?1:-2;sq(c.id).forEach(p=>p.mo=cl(p.mo+d,0,100));toast(d>0?`The lads appreciated the visit. Morale +${d}.`:'Bad timing. The squad felt watched. Morale −2.')}save();render()},
promote:id=>{const p=S.P[id];p.yth=false;p.num=freeNum(S.me.cid);SQ=null;S.me.log.push({s:S.season,d:S.d,txt:`Promoted ${p.name} from the academy`});save();closeModal();render();toast(`${p.name} joins the first team.`)},
upg:k=>{const l=S.me.fac[k];const cost=S.me.unl.builders?0:(k==='st'?Math.round(facCost('st',l)*1.5/1e4)*1e4:facCost(k,l));if(S.me.money<cost)return toast('Not enough money. Top up in the Store.');S.me.money-=cost;S.me.fac[k]++;if(k==='st')me().cap+=Math.round(me().cap*.09/100)*100+600;save();render();toast(k==='ac'&&S.me.fac.ac>20?`Unlocked: ${ACADN(S.me.fac.ac)}!`:'Upgrade complete.')},
com:k=>{const l=S.me.com[k];const cost=S.me.unl.builders?0:comCost(k,l);if(S.me.money<cost)return toast('Not enough money. Top up in the Store.');S.me.money-=cost;S.me.com[k]++;save();render();toast('Upgrade complete.')},
naming:k=>{const c=me();if(k==='take'){const sp=S.me.com.nsp||'Kestrel';S.me.com.naming={sp,amt:namingOffer(),old:c.ground};c.ground=`${sp} Arena`;if(!S.me.unl.fanlock)c.fans=cl(c.fans-5,0,100);toast(`Welcome to the ${c.ground}.`)}else{c.ground=S.me.com.naming.old||c.ground;S.me.com.naming=null;c.fans=cl(c.fans+5,0,100);toast('The old name is back. Fans cheer.')}save();render()},
topup:v=>{S.me.money+= +v;save();render();toast(`${money(+v)} added.`)},
topupc:()=>{const v=Math.round(+$('#tuAmt').value);if(!v||v<0)return toast('Enter an amount.');S.me.money+=v;save();render();toast(`${money(v)} added.`)},
seeds:v=>{S.me.seeds+= +v;save();render();toast(`+${(+v).toLocaleString()} seeds.`)},
unlock:id=>{S.me.unl[id]=true;save();render();toast('Unlocked.')},
tog:id=>{S.me.unl[id]=!S.me.unl[id];if(id==='fanlock'&&S.me.unl[id])me().fans=100;save();render()},
use:id=>{if(id==='wonder'){const ps=[];for(let i=0;i<3;i++){const p=genPlayer(pick(POSL.slice(1)),ri(42,55),ri(16,17),S.me.cid,0);for(let k=0;k<60&&p.pot<85;k++){const a=pick(ATT);if(p.cap[a]<99)p.cap[a]++;p.pot=calcOvr(p,p.cap)}p.yth=true;setVal(p);ps.push(p)}SQ=null;save();go('academy');toast(`Wonderkids: ${ps.map(p=>p.name).join(', ')}`)}
  else if(id==='star'){const pos=$('#starPos')?.value||'ST';const p=genPlayer(pos,ri(85,92),ri(24,29),S.me.cid);SQ=null;p.num=freeNum(S.me.cid);p.mo=90;S.me.log.push({s:S.season,d:S.d,txt:`Marquee signing: ${p.name}`});save();render();playerSheet(p.id)}
  else if(id==='scroll'){const p=S.P[$('#scrollP')?.value];if(!p)return;if(p.tr.length>=6)return toast('He already has 6 skills.');const sid=rollSkill();if(p.tr.includes(sid))return toast('The scroll fizzled: he already has that skill.');p.tr.push(sid);setVal(p);save();render();toast(`${p.name} learned ${SK[sid].n} (${TIERS[SK[sid].t].n})!`)}
  else if(id==='skip'){skipSeason()}},
crRand:()=>{$('#crName').value=pname()},
create:()=>{const pos=$('#crPos').value;const o=cl(+$('#crOvr').value||70,25,99);const p=genPlayer(pos,o,cl(+$('#crAge').value||20,15,45),S.me.cid,0,$('#crEmph').value);p.name=$('#crName').value.trim()||p.name;const want=cl(+$('#crPot').value||o,p.ovr,99);for(let k=0;k<200&&p.pot<want;k++){const a=pick(ATT);if(p.cap[a]<99)p.cap[a]++;p.pot=calcOvr(p,p.cap)}setVal(p);SQ=null;p.num=freeNum(S.me.cid);p.mo=85;save();render();playerSheet(p.id);toast(`${p.name} created.`)},
force:id=>{const co=coachOf(S.me.cid);if(!boss()&&R()>co.mm/100*.8){pmsg(`${co.name}: “No. I pick the team.”`);trust(-2,'Tried to pick the team');save();return}if(!S.me.force.includes(+id))S.me.force.push(+id);S.P[id].mo=cl(S.P[id].mo+5,0,100);trust(-2,'Forced a player into the team');save();playerSheet(id);pmsg(`${co.name} will start him.`)},
unforce:id=>{S.me.force=S.me.force.filter(x=>x!=id);save();playerSheet(id)},
clearforce:()=>{S.me.force=[];save();render()},
sell:id=>{S.pend.push({d:S.d+ri(1,5),type:'bidfor',pid:+id});save();pmsg('Listed. Offers will appear in Transfers › Incoming within a few days.')},
release:id=>{const p=S.P[id];planReactSell(p);p.club=0;SQ=null;S.me.force=S.me.force.filter(x=>x!=id);trHist(`Released ${p.name}`,0,'out');save();closeModal();render();toast(`${p.name} released.`)},
offer:id=>{const p=S.P[id];const fee=Math.max(1000,Math.round((+$('#offAmt').value||0)*1000));const r=makeOffer(p,fee);save();pmsg(r);renderTop()},
signfa:id=>{const p=S.P[id];const r=signFree(p);save();if(p.club===S.me.cid){closeModal();render();toast(r)}else pmsg(r);renderTop()},
shortp:id=>{if(S.me.short.includes(+id))S.me.short=S.me.short.filter(x=>x!=id);else addShortQuiet(+id);save();playerSheet(id)},
incacc:id=>{const x=S.tr.inc.find(o=>o.id==id);const p=S.P[x.pid];if(!p||p.club!==S.me.cid){x.st='expired';return render()}sellTo(p,x.club,x.fee);x.st='accepted';save();render();toast(`${p.name} sold for ${money(x.fee)}.`)},
incctr:id=>{const x=S.tr.inc.find(o=>o.id==id);const p=S.P[x.pid];if(!p||p.club!==S.me.cid){x.st='expired';return render()}if(!boss()&&R()<.5){x.st='walked';save();render();return toast(`${S.clubs[x.club].name} walked away.`)}x.fee=Math.round(x.fee*1.3/1000)*1000;sellTo(p,x.club,x.fee);x.st='accepted';save();render();toast(`They agreed! ${p.name} sold for ${money(x.fee)}.`)},
increj:id=>{const x=S.tr.inc.find(o=>o.id==id);x.st='rejected';const p=S.P[x.pid];if(p&&!boss()&&R()<.3)p.mo=cl(p.mo-8,0,100);save();render()},
outpay:id=>{const x=S.tr.out.find(o=>o.id==id);finalizeOut(x,x.cfee);save();render();toast(x.msg)},
outwd:id=>{const x=S.tr.out.find(o=>o.id==id);x.st='withdrawn';x.msg='You withdrew the offer.';save();render()},
lsk:id=>{S.ui.lsk=+id;render()},
fuse:()=>{const sub=S.P[S.ui.lsub]||sq(S.me.cid)[0];const don=S.P[S.ui.ldon]||sq(S.me.cid).concat(youth(S.me.cid)).filter(p=>p!==sub&&p.tr.length)[0];const sid=don&&don.tr.includes(+S.ui.lsk)?+S.ui.lsk:don?.tr[0];if(!sub||!don||sid==null)return;const seeds=cl(+S.ui.lseed||10,1,S.me.seeds);const copy=!!S.ui.lcopy;const ch=fuseChance(tierOf(sid),seeds,copy);S.me.seeds-=seeds;
  if(R()<ch){sub.tr.push(sid);if(!copy)don.tr=don.tr.filter(x=>x!==sid);setVal(sub);setVal(don);save();render();modal(`<div style="text-align:center"><div style="font-size:48px">✨</div><h2>Fusion succeeded!</h2><p>${esc(sub.name)} now has</p><p>${skPill(sid)}</p><button class="btn pri" data-a="close">Brilliant</button></div>`)}
  else{save();render();modal(`<div style="text-align:center"><div style="font-size:48px">💨</div><h2>The fusion failed</h2><p>${seeds} seeds were used up. ${esc(don.name)} keeps the skill.</p><button class="btn" data-a="close">Close</button></div>`)}},
edsave:id=>{const p=S.P[id];ATT.forEach(k=>{p[k]=cl(+$('#ed_'+k).value||p[k],10,99);p.cap[k]=cl(+$('#edc_'+k).value||p.cap[k],p[k],99)});p.age=cl(+$('#ed_age').value||p.age,15,45);p.pos=$('#ed_pos').value;p.ovr=calcOvr(p);p.pot=Math.max(p.ovr,calcOvr(p,p.cap));p.name=$('#ed_name').value.trim()||p.name;setVal(p);save();playerSheet(id);render();toast('Player updated.')},
edskill:id=>{const p=S.P[id];const sid=rollSkill();if(!p.tr.includes(sid))p.tr.push(sid);setVal(p);save();playerSheet(id);toast(`${SK[sid].n} (${TIERS[SK[sid].t].n})`)},
edclear:id=>{const p=S.P[id];p.tr=[];setVal(p);save();playerSheet(id)},
kickoff:()=>startLive(false),simres:()=>{if(LM&&!LM.done)finishLive();else startLive(true)},
pause:()=>{LM.paused=!LM.paused;$('#pb').textContent=LM.paused?'▶':'❚❚'},
spd:s=>{LM.speed=+s;S.ui.speed=+s;document.querySelectorAll('.ctrl button[data-a^="spd"]').forEach(b=>b.classList.toggle('on',b.dataset.a==='spd:'+s))},
donematch:()=>{cancelAnimationFrame(LM?.raf);LM=null;S._stop=false;advanceDay();save();go('home');if(S.mail.some(m=>m.d===S.d&&!m.done))toast('New mail is waiting.')},
copysave:()=>{const s=JSON.stringify(S);navigator.clipboard?.writeText(s).then(()=>toast(`Save code copied (${Math.round(s.length/1024)} KB).`),()=>{$('#imp').value=s;toast('Copy blocked. The code is in the box below: select all and copy.')})},
importsave:()=>{try{const o=JSON.parse($('#imp').value);if(!o.clubs||!o.me||o.v!==2)throw 0;S=o;SQ=null;save();go('home');toast('Save loaded.')}catch(e){toast('That save code is not valid for this version.')}},
mgrname:()=>{S.me.name=$('#mgrName').value.trim()||S.me.name;save();render()},
asknew:()=>{S.ui.confirmNew=1;render()},cancelnew:()=>{S.ui.confirmNew=0;render()},
newgame:()=>{try{localStorage.removeItem(SKEY)}catch(e){}S=null;TMP=null;render()},
st:t=>{TMP.ui.mgr=$('#mgr').value;TMP.ui.st=+t;startScreen()},
reroll:()=>{const mg=$('#mgr').value,st=TMP.ui.st;TMP=null;startScreen();TMP.ui.mgr=mg;TMP.ui.st=st;startScreen()},
pickclub:id=>{const name=$('#mgr').value.trim()||'Gaffer';S=TMP;TMP=null;SQ=null;const c=S.clubs[id];
  S.me={cid:+id,name,money:START[c.t-1]*(c.big?2.5:1),fac:{tr:c.fl.tr,ac:c.fl.ac,md:c.fl.md,st:Math.max(1,9-c.t*1.5|0),sc:1},unl:{},short:[],force:[],res:[],log:[],bonus:'Standard',ticket:FAIRT[c.t-1],fin:{tk:0,tr:0,wb:0,sp:0,hist:[]},mv:{up:0,dn:0},seeds:20,trust:60,tlog:[],board:60,pitch:{c:78,plan:'Standard'},com:{shop:1,cat:1,hosp:0,naming:null}};
  S.me.log.push({s:S.season,d:0,txt:`${name} appointed manager of ${c.name}`});
  mail('welcome',{});scoutReport();
  V.style.padding='';save();go('home');openMail(S.mail.find(m=>m.type==='welcome').id)},
};
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b||b.disabled)return;const[a,...args]=b.dataset.a.split(':');if(A[a]){e.preventDefault();A[a](...args)}});
document.addEventListener('change',e=>{const id=e.target.id;if(id==='psort'){S.ui.ps=e.target.value;render()}if(/^cd(c1|c2|ini|band)$/.test(id)){cdRead();render()}if(id==='lsub'){S.ui.lsub=+e.target.value;render()}if(id==='ldon'){S.ui.ldon=+e.target.value;S.ui.lsk=null;render()}if(id==='lcopy'){S.ui.lcopy=e.target.checked;render()}if(id==='lseed'){S.ui.lseed=+e.target.value;render()}});
document.addEventListener('input',e=>{if(e.target.id==='lseed'){const v=$('#lseedv');if(v)v.textContent=e.target.value}});
function render(){if(!S||!S.me){startScreen();return}V.style.padding='';const pg=P[S.ui.pg]?S.ui.pg:'home';
  V.innerHTML=P[pg]();renderTop();if(pg==='match'&&LM&&!LM.done)setupCanvas()}
if(load()&&S&&S.me){render()}else{S=null;render()}
