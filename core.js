/* Lophus Football Fun — core: data, world, simulation, time, mail, transfers */
const SKEY='lophusFF27v3';
let S=null,SQ=null,LM=null,RUN=null,TMP=null,RUNMODE=null;
const R=Math.random,ri=(a,b)=>a+Math.floor(R()*(b-a+1)),pick=a=>a[Math.floor(R()*a.length)],cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const nrm=()=>{let u=0;for(let i=0;i<6;i++)u+=R();return (u-3)*1.41};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>{const a=Math.abs(v),s=v<0?'-':'';return s+'€'+(a>=1e6?(a/1e6).toFixed(a>=1e8?0:1).replace(/\.0$/,'')+'M':a>=1e3?Math.round(a/1e3)+'K':Math.round(a))};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const shuffle=(a,rnd=R)=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const wpick=(a,w)=>{const ws=a.map(w);let t=ws.reduce((s,x)=>s+x,0)*R();for(let i=0;i<a.length;i++){if((t-=ws[i])<0)return a[i]}return a[a.length-1]};
const pois=l=>{const L=Math.exp(-l);let k=0,p=1;do{k++;p*=R()}while(p>L);return k-1};
const last=n=>String(n).split(' ').slice(-1)[0]||n;
const ord=n=>n+(n%100>=11&&n%100<=13?'th':['th','st','nd','rd'][n%10]||'th');
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

/* ---------- pools ---------- */
const FN={en:['Jack','Harry','Callum','Liam','Owen','Reece','Kieran','Elliot','Mason','Tyler','Connor','Jamie','Lewis','Ryan','Nathan','Dylan','Ben','Sam','Joe','Alfie','Kyle','Josh','Archie','Leon','Max','Theo','Rhys','Toby'],es:['Diego','Javier','Mateo','Iker','Pablo','Sergio','Álvaro','Hugo','Raúl','Adrián','Marcos','Unai'],pt:['João','Tiago','Rafael','Gonçalo','Rodrigo','Bruno','Vitor','Caio','Diogo','Nuno'],fr:['Lucas','Théo','Mathis','Enzo','Yanis','Noah','Bastien','Rayan','Maxence','Ilyes'],af:['Kwame','Chidi','Ousmane','Moussa','Ibrahima','Kofi','Emeka','Sadio','Yaw','Tunde','Bakary','Seydou'],my:['Amirul','Hafiz','Faisal','Syafiq','Danial','Arif','Irfan','Nazmi','Jugah','Ngumbang','Aidil','Haziq','Rentap','Linggi'],jp:['Haruto','Ren','Sota','Yuto','Kaito','Riku','Daiki','Kenta'],nd:['Erik','Magnus','Lars','Oskar','Viktor','Henrik','Anders','Jonas'],sl:['Luka','Marko','Ivan','Nikola','Dominik','Filip','Petar','Mateo']};
const LN={en:['Hartley','Ashworth','Pendleton','Corbett','Whitlock','Fairbrother','Holroyd','Kershaw','Brindley','Mottram','Lindley','Thackeray','Rowntree','Haworth','Sutcliffe','Greenhalgh','Broadbent','Ackroyd','Calvert','Dewhurst','Fenwick','Pickles','Hebden','Oldroyd','Marsden','Nuttall'],es:['Navarro','Ortega','Delgado','Cabrera','Molina','Serrano','Iglesias','Vidal','Robles','Castaño','Arenas'],pt:['Araújo','Pinheiro','Teixeira','Moreira','Barros','Carvalho','Fonseca','Queirós','Lobo'],fr:['Lefèvre','Marchand','Dubois','Garnier','Rousseau','Chevalier','Perrin','Leclerc','Aubert'],af:['Mensah','Okafor','Diallo','Traoré','Boateng','Adeyemi','Nwosu','Keita','Owusu','Camara','Sissoko'],my:['Rahman','Ismail','Hamzah','Razak','Zulkifli','anak Jalong','anak Unggang','Salleh','Yusof','Kamarudin','anak Bujang','anak Libau'],jp:['Takeda','Morita','Kobayashi','Ishikawa','Fujimoto','Nakano','Sakai'],nd:['Lindqvist','Halvorsen','Bergström','Nygaard','Sandberg','Ekdahl','Solberg'],sl:['Kovačić','Horvat','Novak','Petrović','Marić','Babić','Jurić']};
FN.de=['Lukas','Jonas','Felix','Leon','Paul','Niklas','Tim','Moritz','Jannik','Florian','Kai','Malte'];FN.it=['Lorenzo','Matteo','Alessandro','Davide','Federico','Riccardo','Simone','Tommaso','Gianluca','Nicolò','Pietro','Andrea'];FN.nl=['Daan','Sem','Bram','Jesse','Thijs','Lars','Ruben','Stijn','Joris','Wout','Sven','Teun'];
LN.de=['Brandt','Kessler','Vogt','Hartmann','Engel','Krüger','Lorenz','Albrecht','Winkler','Sommer','Brenner','Kraft'];LN.it=['Ferrante','Galli','Moretti','Conti','Rinaldi','Bellini','Caruso','Marchetti','Santoro','Fabbri','Ricci','Valente'];LN.nl=['de Groot','Visser','Bakker','van Leeuwen','Mulder','Smit','Kuiper','Hendriks','van Dam','Bosman','Vos','Brouwer'];
const NATW=[['en',38],['es',8],['pt',7],['fr',8],['af',12],['my',10],['jp',5],['nd',6],['sl',6]];
const NATN={de:'GER',it:'ITA',nl:'NED',en:'ENG',es:'ESP',pt:'POR',fr:'FRA',af:'AFR',my:'MAS',jp:'JPN',nd:'NOR',sl:'CRO'};
const PRE=['Ash','Brack','Cald','Dun','Elm','Fen','Gal','Har','Ivy','Kel','Lark','Mar','Nor','Oak','Pen','Quarr','Rad','Salt','Thorn','Wen','Wyc','Brom','Cran','Holl','Stan','Wick','Bram','Glen','Hal','Rook','Sedge','Tam','Bly','Corn','Dray','Ever'];
const SUF=['ford','ley','bridge','ham','well','mouth','field','worth','stead','by','ton','gate','mere','combe','hurst','dale','port','borough','wich','burn','holme','cliffe'];
const TYPES=['Town','United','City','Rovers','Athletic','Albion','Wanderers','FC','Borough','Harriers','County','Dynamo','Sporting'];
const NATS={en:'England',es:'Spain',de:'Germany',it:'Italy',pt:'Portugal',nl:'Netherlands'};
const LEAGUES=[{nat:'en',tier:1,n:'Crown League',size:20,q:75,big:6},{nat:'en',tier:2,n:'Sovereign Division',size:24,q:67},{nat:'en',tier:3,n:'Division One',size:24,q:59},{nat:'en',tier:4,n:'Division Two',size:24,q:51},{nat:'en',tier:5,n:'Counties League',size:24,q:44},
 {nat:'es',tier:1,n:'Primera Corona',size:20,q:73,big:3},{nat:'de',tier:1,n:'Meisterliga',size:18,q:71,big:2},{nat:'it',tier:1,n:'Lega Suprema',size:20,q:72,big:3},{nat:'pt',tier:1,n:'Liga Lusitana',size:18,q:66,big:3},{nat:'nl',tier:1,n:'Kroondivisie',size:18,q:65,big:3}];
const LG=LEAGUES.slice(0,5).map(l=>l.n);
const lgName=c=>LEAGUES[c.lg].n;const lq=c=>LEAGUES[c.lg].q;const lgOf=c=>LEAGUES[c.lg];
const CLUBGEN={
 en:()=>{const town=pick(PRE)+pick(SUF);const t=pick(TYPES);return{town,n:(t==='Sporting'||t==='Dynamo')?`${t} ${town}`:`${town} ${t}`}},
 es:()=>{const town=pick(['Villa','San','Monte','Puerto','Torre','Val','Campo','Costa','Sierra','Río','Alta','Nueva'])+' '+pick(['Luna','Verde','Mar','Sol','Blanca','Dorada','Llana','Fuerte','Roja','Alegre','Real','Clara']);const t=pick(['CF','Atlético','Deportivo','UD','SD','Racing','CD','Real']);return{town,n:['Atlético','Deportivo','Racing','Real'].includes(t)?`${t} ${town}`:`${t} ${town}`}},
 de:()=>{const town=pick(['Hohen','Alten','Neu','Stein','Wald','Berg','Fels','Linden','Ober','Rosen','Schwarz','Eisen','Kron','Adler'])+pick(['burg','dorf','stadt','feld','heim','bach','hausen','berg','furt','au','tal']);const t=pick(['FC','SV','TSV','SC','VfL','1. FC','SpVgg']);return{town,n:`${t} ${town}`}},
 it:()=>{const town=pick(['Monte','Castel','Porto','San ','Villa','Borgo','Rocca','Val','Torre','Ponte','Fonte','Lago'])+pick(['bello','fiore','rosso','nero','alto','mare','luce','verde','oro','sole','vento','franco']);const t=pick(['AC','US','Calcio','FC','SS','AS']);return{town,n:t==='Calcio'?`${town} Calcio`:`${t} ${town}`}},
 pt:()=>{const town=pick(['Vila','Porto','São','Monte','Rio','Ponte','Torre','Alto','Campo','Serra','Póvoa','Foz'])+pick([' Nova',' Verde',' do Mar',' Real',' Alegre',' Branca',' do Sol',' da Luz',' Grande',' Velha']);const t=pick(['SC','FC','CD','Académico','Desportivo','Sporting','GD']);return{town,n:['Académico','Desportivo','Sporting'].includes(t)?`${t} ${town}`:`${town} ${t}`}},
 nl:()=>{const town=pick(['Oost','West','Noord','Zuid','Groen','Hoog','Leeu','Rozen','Wester','Linde','Kroon','Molen'])+pick(['dam','wijk','veen','dijk','hoven','berg','burg','mond','voort','horst','sloot','zijl']);const t=pick(['FC','SV','VV','SC','HFC','Sparta','Fortuna']);return{town,n:['Sparta','Fortuna'].includes(t)?`${t} ${town}`:`${t} ${town}`}}};
const TQ=[75,67,59,51,44];
const TMULT=[6,3,1.8,1,.6];
const COMM=[2600000,720000,190000,62000,26000];
const CAP=[42000,24000,14000,7500,4000];
const START=[45e6,12e6,4e6,1.5e6,6e5];
const FAIRT=[45,32,24,18,12];
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const WD=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const ATT=['tec','fast','phy','smart'],AL={tec:'TEC',fast:'FAST',phy:'PHY',smart:'SMART'},ALF={tec:'Technique',fast:'Pace',phy:'Physical',smart:'Intelligence'};
const PW={GK:[.1,.15,.35,.4],DF:[.12,.2,.38,.3],MF:[.35,.15,.15,.35],AM:[.42,.3,.08,.2],ST:[.3,.35,.25,.1]};
const TAC={'Fast Transition':[20,40,25,15],'High Pressing':[15,30,35,20],'Possession':[45,15,10,30],'Low Block':[10,15,40,35],'Direct Play':[15,25,45,15],'Total Football':[30,25,20,25]};
const TACD={'Fast Transition':'Win it, then break at pace before they reset.','High Pressing':'Hunt the ball high and never let them breathe.','Possession':'Keep the ball, move them around, wait for the gap.','Low Block':'Sit deep, stay compact, punish them on the break.','Direct Play':'Get it forward early and win the second ball.','Total Football':'Everyone attacks, everyone defends, everyone thinks.'};
const FORMS={
'4-2-3-1':[['GK',.5,.04],['DF',.14,.22],['DF',.38,.19],['DF',.62,.19],['DF',.86,.22],['MF',.36,.37],['MF',.64,.37],['AM',.17,.56],['AM',.5,.54],['AM',.83,.56],['ST',.5,.72]],
'4-4-2':[['GK',.5,.04],['DF',.14,.22],['DF',.38,.19],['DF',.62,.19],['DF',.86,.22],['MF',.14,.44],['MF',.38,.4],['MF',.62,.4],['MF',.86,.44],['ST',.38,.68],['ST',.62,.68]],
'4-3-3':[['GK',.5,.04],['DF',.14,.22],['DF',.38,.19],['DF',.62,.19],['DF',.86,.22],['MF',.3,.4],['MF',.5,.35],['MF',.7,.4],['AM',.17,.63],['AM',.83,.63],['ST',.5,.72]],
'3-5-2':[['GK',.5,.04],['DF',.26,.2],['DF',.5,.17],['DF',.74,.2],['MF',.1,.46],['MF',.33,.4],['MF',.5,.34],['MF',.67,.4],['MF',.9,.46],['ST',.38,.69],['ST',.62,.69]],
'5-3-2':[['GK',.5,.04],['DF',.08,.29],['DF',.29,.2],['DF',.5,.17],['DF',.71,.2],['DF',.92,.29],['MF',.3,.42],['MF',.5,.39],['MF',.7,.42],['ST',.38,.67],['ST',.62,.67]]};
const PI={GK:0,DF:1,MF:2,AM:3,ST:4},POSL=['GK','DF','MF','AM','ST'];
const NEED={GK:2,DF:7,MF:6,AM:3,ST:4};

/* ---------- fantasy skills ---------- */
const TIERS=[{n:'God',col:'#ff4fd8',w:.02},{n:'Divine',col:'#ffd84a',w:.08},{n:'Mythic',col:'#e2412a',w:.3},{n:'Legendary',col:'#f4a42a',w:1},{n:'Epic',col:'#9b5de5',w:3},{n:'Unique',col:'#17b3a3',w:6},{n:'Rare',col:'#3d8bfd',w:12},{n:'Uncommon',col:'#4cbb6c',w:22},{n:'Common',col:'#9aa29d',w:40}];
const FAM=[['tec',['Touch','Footwork','Silk','Craft','Finesse','Dribble']],['fast',['Stride','Wind','Sprint','Feet','Gale','Burst']],['phy',['Iron','Frame','Stone','Lungs','Shoulders','Oak']],['smart',['Mind','Eye','Reading','Wit','Compass','Sight']],['grow',['Seed','Bloom','Sapling','Spring','Dawn']],['life',['Heart','Roots','Ember','Vein','Hourglass']],['morale',['Spirit','Song','Smile','Hearth','Banner']],['inj',['Skin','Shell','Armour','Bark','Scales']],['clutch',['Nerve','Ice','Moment','Instinct','Strike']],['lead',['Crown','Voice','Horn','Oath','Standard']],['cap',['Ceiling','Ascent','Summit','Horizon','Star']]];
const FXV={tec:[14,10,8,6,5,4,3,2,1],fast:[14,10,8,6,5,4,3,2,1],phy:[14,10,8,6,5,4,3,2,1],smart:[14,10,8,6,5,4,3,2,1],grow:[80,60,45,35,25,18,12,8,5],life:[200,140,100,75,55,50,30,20,10],morale:[95,90,85,80,75,72,68,64,60],inj:[70,55,45,35,28,22,15,10,6],clutch:[.9,.7,.55,.42,.32,.25,.18,.12,.07],lead:[3,2.4,1.9,1.5,1.2,.9,.6,.4,.2],cap:[14,10,8,6,5,4,3,2,1]};
const ADJ={8:['Steady','Plain','Honest','Sturdy','Keen','Quick','Calm','Bright','Brisk','Solid','Neat','Tidy'],7:["Hunter's","Ranger's",'Woodland','River','Hill','Copper','Silver','Bold','Lucky','Wild','Clever','Hardy'],6:['Sapphire','Moonlit','Runed','Stormborn','Frostbound','Emberlit','Ironclad','Windswept','Starlit','Thunder','Gilded','Arcane'],5:['Elves','Dwarves','Orcs','Fae','Merfolk','Centaurs','Giants','Dryads','Gnomes','Satyrs','Nymphs','Trolls'],4:['Dragonfire','Phoenix','Wyvern','Basilisk','Griffin','Kraken','Manticore','Hydra','Chimera','Leviathan','Roc','Behemoth'],3:["Titan's","Warlord's","Archmage's","Paladin's","Highlord's",'Sunforged','Void','Eternal','Ancient',"Runeking's",'Starforged','Worldtree'],2:['Abyssal','Celestial','Primordial','Astral','Chaos','Eclipse','Oblivion','Cosmic','Nether','Seraphic','Infernal','Aether'],1:['Holy','Sacred','Blessed','Hallowed','Radiant','Saintly','Exalted','Sanctified','Angelic','Heavenly','Glorious','Anointed']};
const GODS=['Elf Goddess','Storm Father','Sun Queen','Moon Mother','War Lord','Sea King','Forest Lord','Star Weaver','Time Keeper','Grave Warden','Fire Titan','Dream Spinner'];
const ACTS=[{k:'strike',n:'Divine Strike',d:'team scoring chance ×1.6 this match'},{k:'aegis',n:'Aegis',d:'opponent scoring chance ×0.55 this match'},{k:'tempo',n:'Time Bend',d:'team strength +6 this match'},{k:'miracle',n:'Miracle',d:'adds a late goal if the team is not winning'},{k:'frenzy',n:'War Cry',d:'squad morale +6 after the match'},{k:'heal',n:'Rebirth',d:'heals every injured team-mate after the match'}];
const MINOR=[['Elfblood',{life:12,morale:60}],['Dwarfblood',{inj:10}],['Orcblood',{phy:2}],['Faeblood',{fast:2}],['Merblood',{smart:2}],['Gnomeblood',{tec:2}],['Dryadblood',{grow:10}],['Giantblood',{phy:3,cap:1}]];
const SK={},SKB=[],SKX=[];
(function buildSkills(){const rnd=mulberry(20271121);const nouns=[];FAM.forEach(([f,ns])=>ns.forEach(n=>nouns.push([f,n])));
  const mk=(t,f,base)=>{const v=FXV[f][t]*(f==='morale'?1:.85+rnd()*.3);return f==='clutch'||f==='lead'?Math.round(v*100)/100:Math.max(1,Math.round(v))};
  for(let t=0;t<9;t++){SKB[t]=[];SKX[t]=[];let combos=[];
    if(t===0){GODS.forEach(g=>nouns.forEach(nn=>combos.push([g,nn])))}else ADJ[t].forEach(a=>nouns.forEach(nn=>combos.push([a,nn])));
    shuffle(combos,rnd);const N=t===0?60:120;
    for(let i=0;i<N;i++){const[a,[f,n]]=combos[i];const id=t*1000+i;const name=t===0?`${a}'s ${n}`:t===5?`${n} of the ${a}`:`${a} ${n}`;const fx={[f]:mk(t,f)};
      if(t<=2&&rnd()<.6){const f2=pick2(rnd,FAM)[0];if(f2!==f)fx[f2]=mk(t+1,f2)}
      const s={id,t,n:name,fx};if(t===0){const a2=ACTS[Math.floor(rnd()*ACTS.length)];s.act={k:a2.k,n:a2.n,d:a2.d,ch:Math.round((.15+rnd()*.15)*100)/100}}
      SK[id]=s;SKB[t].push(s)}
    for(let i=0;i<32;i++){const b=SKB[t][Math.floor(rnd()*SKB[t].length)];const[mn,mf]=MINOR[Math.floor(rnd()*MINOR.length)];const id=t*1000+500+i;const fx={...b.fx};for(const k in mf)fx[k]=k==='morale'?Math.max(fx[k]||0,mf[k]):(fx[k]||0)+mf[k];const s={id,t,n:`${b.n} ✦ ${mn}`,fx,mix:mn};if(b.act)s.act=b.act;SK[id]=s;SKX[t].push(s)}}
  function pick2(r,a){return a[Math.floor(r()*a.length)]}
})();
const tierOf=id=>SK[id]?SK[id].t:8;
const tierCol=t=>TIERS[t].col;
function fxText(fx,co){if(co)return cfxText(fx);const o=[];for(const k in fx){const v=fx[k];o.push(k in AL?`${AL[k]} +${v}`:k==='grow'?`Growth +${v}%`:k==='life'?`Lifespan +${v}%`:k==='morale'?`Morale never below ${v}`:k==='inj'?`Injury risk −${v}%`:k==='clutch'?`Match rating +${v}, more goals`:k==='lead'?`Team strength +${v}`:k==='cap'?`All stat caps +${v}`:k)}return o.join(' · ')}
function rollTier(){const tot=TIERS.reduce((s,t)=>s+t.w,0);let r=R()*tot;for(let i=8;i>=0;i--){if((r-=TIERS[i].w)<0)return i}return 8}
function rollSkill(minTier=8){let t=rollTier();t=Math.min(t,minTier);const mix=R()<.07;const l=mix?SKX[t]:SKB[t];return pick(l).id}
function rollTraits(p,boost=0){p.tr=p.tr||[];if(R()>.33+boost)return;const n=R()<.75?1:R()<.8?2:3;for(let i=0;i<n;i++){const id=rollSkill();if(!p.tr.includes(id))p.tr.push(id)}}
function traitFx(p){const o={};if(!p.tr)return o;for(const id of p.tr){const s=SK[id];if(!s)continue;for(const k in s.fx){if(k==='morale')o[k]=Math.max(o[k]||0,s.fx[k]);else o[k]=(o[k]||0)+s.fx[k]}}return o}
const bestTier=p=>p.tr&&p.tr.length?Math.min(...p.tr.map(tierOf)):9;

/* ---------- dates ---------- */
const D0=Date.UTC(2027,6,1);
const dobj=d=>{const t=new Date(D0+d*864e5);return{y:t.getUTCFullYear(),m:t.getUTCMonth(),day:t.getUTCDate(),wd:t.getUTCDay()}};
const fmtD=d=>{const o=dobj(d);return `${o.day} ${MON[o.m]} ${o.y}`};
const shortD=d=>{const o=dobj(d);return `${WD[o.wd]} ${o.day} ${MON[o.m]}`};
const seasonStart=y=>Math.round((Date.UTC(y,6,1)-D0)/864e5);
const seasonLbl=y=>`${y}/${String(y+1).slice(2)}`;
const inWindow=()=>{const m=dobj(S.d).m;return m===6||m===7||m===0};

/* ---------- generators ---------- */
function nat(){let r=R()*100;for(const[k,w]of NATW){if((r-=w)<0)return k}return'en'}
const pname=(n=nat())=>pick(FN[n])+' '+pick(LN[n]);
const calcOvr=(p,src=p)=>{const w=PW[p.pos];return Math.round(ATT.reduce((s,k,i)=>s+w[i]*src[k],0))};
function setVal(p){const af=p.age<=21?1.5:p.age<=24?1.3:p.age<=28?1.1:p.age<=31?.75:p.age<=33?.45:.25;const tb=p.tr&&p.tr.length?1+(9-bestTier(p))*.06:1;p.val=Math.max(3000,Math.round((1500*Math.pow(1.19,cl(p.ovr-35,0,65))*af+Math.max(0,p.pot-p.ovr)*3000*(p.age<=23?1:.3))*tb/1000)*1000);p.wage=Math.round((p.val*.011+500)/100)*100}
function setCaps(p,gap,sig){p.cap={};ATT.forEach(k=>p.cap[k]=cl(p[k]+gap+ri(-4,4)+(k===sig?ri(0,5):0),p[k],99));p.pot=Math.max(p.ovr,calcOvr(p,p.cap))}
function genPlayer(pos,target,age,club=0,potBoost=0,emph=null){
  const cn=club&&S.clubs[club]?S.clubs[club].nat:null;const n=cn&&R()<.6&&FN[cn]?cn:nat();const p={id:++S.nid,name:pname(n),nat:n,pos,age,club,mo:ri(58,74),inj:0,ban:0,xp:R(),sA:0,sG:0,sAs:0,sR:0,sY:0,sRd:0,ca:{},aw:[],num:0,last:-99,tr:[]};
  const sig=emph||pick(ATT),weak=pick(ATT.filter(k=>k!==sig));p.sig=sig;
  ATT.forEach(k=>p[k]=Math.round(target+nrm()*4+(k===sig?ri(6,15):0)-(k===weak?ri(4,12):0)));
  for(let i=0;i<4;i++){const d=target-calcOvr(p);ATT.forEach(k=>p[k]=cl(p[k]+d,10,99))}
  p.ovr=calcOvr(p);
  const g=age<=17?ri(14,32):age<=19?ri(10,24):age<=21?ri(6,16):age<=24?ri(2,9):age<=27?ri(0,4):0;
  setCaps(p,g+potBoost,sig);rollTraits(p);setVal(p);S.P[p.id]=p;return p;}
function genGem(club,t,youthLvl){const pos=pick(['DF','MF','AM','ST','ST','AM','GK']);const age=ri(16,18);const lowTarget=cl(Math.round(32+youthLvl*1.2+(5-t)*2+ri(-4,5)),30,60);const p=genPlayer(pos,lowTarget,age,club);const want=ri(90,97);
  for(let k=0;k<40&&p.pot<want;k++){const a=pick(ATT);if(p.cap[a]<99)p.cap[a]++;p.pot=calcOvr(p,p.cap)}
  p.gem=true;rollTraits(p,.35);setVal(p);return p}
function genCoach(q,club=0){const cn=club&&S.clubs[club]?S.clubs[club].nat:null;const n=cn&&R()<.7&&FN[cn]?cn:nat();const c={id:++S.nid,name:pname(n),nat:n,age:ri(36,64),tac:pick(Object.keys(TAC)),form:pick(Object.keys(FORMS)),ta:cl(Math.round(q+nrm()*9),25,97),dv:cl(Math.round(q+nrm()*9),25,97),mm:cl(Math.round(q+nrm()*9),25,97),club,aw:[]};c.ai=cl(Math.round(c.ta*.6+q*.25+nrm()*12+5),8,99);c.wage=Math.round((Math.max(0,c.ta+c.dv+c.mm-120)*230+2500)/100)*100;c.ctr=club?ri(12,36):0;c.tr=[];c.hist=[];if(typeof rollCoachTraits==='function')rollCoachTraits(c);S.C[c.id]=c;return c}
function shortName(n){const w=n.split(' ').filter(x=>!['FC'].includes(x));let s=w.map(x=>x[0]).join('').toUpperCase();if(s.length<2)s=n.slice(0,3).toUpperCase();return s.slice(0,3)}
function clubName(used){for(let k=0;k<300;k++){const town=pick(PRE)+pick(SUF);const t=pick(TYPES);const n=(t==='Sporting'||t==='Dynamo')?`${t} ${town}`:`${town} ${t}`;if(!used.has(town)){used.add(town);return{n,town}}}return{n:'Club '+ri(100,999),town:'Club'}}
function freeNum(cid){const used=new Set(sqAll(cid).map(p=>p.num));for(let i=1;i<99;i++)if(!used.has(i))return i;return 99}

/* ---------- crests ---------- */
const SHP={shield:'M4 4h32v18c0 12-7.5 18.5-16 21.5C11.5 40.5 4 34 4 22z',classic:'M20 3c6 3 12 3 17 1v18c0 12-8 18-17 21.5C11 40 3 34 3 22V4c5 2 11 2 17-1z',round:'M20 4a19 19 0 110 38a19 19 0 110-38z',hex:'M20 3l17 10v20L20 43 3 33V13z',badge:'M5 4h30v26L20 43 5 30z',cut:'M10 4h20l6 6v18c0 9-7 14-16 17C11 42 4 37 4 28V10z'};
const PAT={plain:()=>'',stripes:()=>[0,1,2,3,4].map(i=>`<rect x="${2+i*8}" y="0" width="4" height="46"/>`).join(''),halves:()=>'<rect x="20" y="0" width="20" height="46"/>',sash:()=>'<path d="M-2 10L10 -2 44 34 32 46z"/>',hoops:()=>[0,1,2,3,4].map(i=>`<rect x="0" y="${4+i*9}" width="40" height="4.5"/>`).join(''),quarters:()=>'<rect x="20" y="0" width="20" height="23"/><rect x="0" y="23" width="20" height="23"/>',chevron:()=>'<path d="M0 14l20 12 20-12v8L20 34 0 22z"/>',cross:()=>'<rect x="16" y="0" width="8" height="46"/><rect x="0" y="16" width="40" height="7"/>',border:()=>'<path d="M0 0h40v46H0zM8 9h24v13c0 9-5 13-12 16C13 35 8 31 8 22z" fill-rule="evenodd"/>',split:()=>'<path d="M0 0L40 46H0z"/>'};
const ICO={none:'',star:'<path d="M20 7l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4-3.9-3.8 5.4-.8z"/>',crown:'<path d="M12 20l-1-9 5 4 4-6 4 6 5-4-1 9z"/><rect x="12" y="20.5" width="16" height="2.2" rx=".6"/>',bird:'<path d="M9 16c4-1 6-5 11-5 3 0 4 2 6 2l4-1-3 3c0 4-4 7-9 7l-4 3 1-4c-3-1-5-3-6-5z"/>',tree:'<path d="M20 7l7 9h-4l5 6H12l5-6h-4z"/><rect x="18.8" y="21" width="2.4" height="3"/>',tower:'<path d="M14 8h2.5v2H19V8h2v2h2.5V8H26v4l-1.5 1.5V23h-9v-9.5L14 12z"/>',anchor:'<circle cx="20" cy="9.5" r="2" fill="none" stroke="#fff" stroke-width="1.4"/><path d="M19.3 11.3h1.4V21c2.6-.3 4.4-1.8 5.1-4l-1.6.4 2.4-3 1.2 3.5-1.3-.6C25.8 20.6 23 23 20 23s-5.8-2.4-6.5-5.7l-1.3.6 1.2-3.5 2.4 3-1.6-.4c.7 2.2 2.5 3.7 5.1 4z"/>',ball:'<circle cx="20" cy="15.5" r="7" fill="#fff"/><path d="M20 12.3l2.6 1.9-1 3h-3.2l-1-3z" fill="#222"/>',dino:'<path d="M17 8h6v1h1v3h-2v1h-1v2h3v1h-3v3h1v2h1v2h-2v-2h-2v2h-2v-2h-1v-2h-2v-1h-2v-2h3v-2h1v-2h1v-3z"/><rect x="20" y="9.5" width="1" height="1" fill="#222"/>',bolt:'<path d="M22 7l-8 10h5l-2 8 9-11h-5z"/>',wave:'<path d="M9 16c2-3 4-3 5.5 0s3.5 3 5.5 0 3.5-3 5.5 0 3.5 3 5.5 0v4c-2 3-4 3-5.5 0s-3.5-3-5.5 0-3.5 3-5.5 0-3.5-3-5.5 0z"/>',flower:'<circle cx="20" cy="10.5" r="3"/><circle cx="20" cy="20.5" r="3"/><circle cx="15" cy="15.5" r="3"/><circle cx="25" cy="15.5" r="3"/><circle cx="20" cy="15.5" r="2" fill="#f1c84b"/>',horse:'<path d="M15 23l1-6c-2-1-3-3-2-5l3-3 1-2 1 2c3 0 6 2 7 6l1 8h-3l-1-5-3 1-1 4z"/>',shield2:'<path d="M14 9h12v6c0 4-3 6.5-6 8-3-1.5-6-4-6-8z" fill="none" stroke="#fff" stroke-width="1.8"/>',moon:'<path d="M22 8a8 8 0 100 15 7 7 0 010-15z"/>'};
const PALS=[['#c8321e','#ffffff'],['#1e5fb4','#ffffff'],['#16804a','#f1c84b'],['#6b2fa8','#f1c84b'],['#d98a12','#1a1a1a'],['#1a1a1a','#ffffff'],['#0f7c86','#ffffff'],['#b3245a','#1e5fb4'],['#3d5a12','#f1c84b'],['#8a2b1a','#7fb3e0'],['#2b3f8a','#c8321e'],['#c25b0e','#1a1a1a'],['#5a6b75','#f1c84b'],['#9c1c2c','#ffffff'],['#0b6b4e','#ffffff'],['#7a4b1d','#f1c84b'],['#e8e3d4','#c8321e'],['#1aa0d8','#ffffff'],['#f1c84b','#1a1a1a'],['#27264a','#d98a12']];
function genCrest(){const pal=pick(PALS);return{sh:pick(Object.keys(SHP)),pt:pick(['plain','plain','stripes','halves','sash','hoops','quarters','chevron','cross','border','split']),c1:pal[0],c2:pal[1],ic:pick(Object.keys(ICO).filter(k=>k!=='none')),band:R()<.6}}
let CRN=0;
function crestSVG(cr,ini,sz=40){const id='cr'+(++CRN);const sh=SHP[cr.sh]||SHP.shield;const ic=ICO[cr.ic]||'';const hasIc=!!ic;
  return `<svg class="crest" width="${sz}" height="${Math.round(sz*1.15)}" viewBox="0 0 40 46" aria-hidden="true"><defs><clipPath id="${id}"><path d="${sh}"/></clipPath></defs><g clip-path="url(#${id})"><rect width="40" height="46" fill="${cr.c1}"/><g fill="${cr.c2}">${(PAT[cr.pt]||PAT.plain)()}</g>${cr.band?`<rect x="0" y="${hasIc?26:17}" width="40" height="11" fill="rgba(0,0,0,.38)"/>`:''}<path d="M0 0h40v8H0z" fill="rgba(255,255,255,.14)"/></g><path d="${sh}" fill="none" stroke="#fff" stroke-width="2.4"/>${hasIc?`<g fill="#fff" stroke="rgba(0,0,0,.35)" stroke-width=".5">${ic}</g>`:''}<text x="20" y="${hasIc?34.6:26}" text-anchor="middle" font-family="Big Shoulders Display,Impact,sans-serif" font-weight="900" font-size="${hasIc?(ini.length>2?9:10.5):(ini.length>2?13:15)}" fill="#fff" stroke="rgba(0,0,0,.45)" stroke-width=".6" paint-order="stroke">${esc(ini)}</text></svg>`}
function crest(c,sz=40){if(!c.cr)c.cr=genCrest();return crestSVG(c.cr,c.short,sz)}

/* ---------- indexes ---------- */
function buildSQ(){SQ={};for(const p of Object.values(S.P)){if(!p.club)continue;(SQ[p.club]||(SQ[p.club]=[])).push(p)}}
const sqAll=cid=>{if(!SQ)buildSQ();return SQ[cid]||[]};
const sq=cid=>sqAll(cid).filter(p=>!p.yth);
const youth=cid=>sqAll(cid).filter(p=>p.yth);
const me=()=>S.clubs[S.me.cid];
const isMe=cid=>S.me&&cid===S.me.cid;
const AILV=[[30,'Rookie','r'],[45,'Amateur','y'],[60,'Semi-pro','y'],[72,'Professional','bl'],[84,'Elite','g'],[93,'World class','g'],[101,'Mastermind','g']];
const coachAI=c=>{if(!c)return 35;if(c.ai==null)c.ai=cl(Math.round(c.ta*.85+((c.id*37)%21)-10),8,99);return Math.min(99,c.ai+(cfxOf(c).ai||0))};
const aiLvl=c=>{const v=coachAI(c);return AILV.find(l=>v<l[0])};
const aiChip=c=>{const[,n,k]=aiLvl(c);return `<span class="chip ${k}" title="Match AI">🧠 ${n} ${coachAI(c)}</span>`};
const coachOf=cid=>S.clubs[cid]&&S.C[S.clubs[cid].coach];
const boss=()=>!!(S.me&&S.me.unl.boss);
const trustMult=cid=>isMe(cid)?(S.me.trust<35?.5:S.me.trust>75?1.1:1):1;
const coachTa=cid=>{const co=coachOf(cid);return co?(co.ta+(cfxOf(co).ta||0))*trustMult(cid):45};
const cboost=cid=>cl(Math.round((coachTa(cid)-55)/15),0,3);
function eff(p,k,tac,cb=0){const tf=traitFx(p);let v=p[k]+(tf[k]||0)+(p.club?(cfx(p.club)[k]||0):0);if(tac){const w=TAC[tac][ATT.indexOf(k)];v+=w>=35?2:w>=25?1:0}return v+cb}
function fit(p,tac,cb=0){tac=tac||'Total Football';const e=ATT.map(k=>eff(p,k,tac,cb));const o=PW[p.pos].reduce((s,w,i)=>s+w*e[i],0);if(p.pos==='GK')return Math.round(o);return Math.round(.55*o+.45*TAC[tac].reduce((s,w,i)=>s+w/100*e[i],0))}
const fitC=(p,cid=S.me.cid)=>{const co=coachOf(cid);return fit(p,co?co.tac:null,cboost(cid))};
const pen=(pp,sp)=>{if(pp===sp)return 0;if(pp==='GK'||sp==='GK')return 40;const d=Math.abs(PI[pp]-PI[sp]);return d===1?6:d===2?12:16};

/* ---------- world ---------- */
function createWorld(){
  S={v:3,nid:0,title:'Lophus Football Fun',season:2027,d:0,clubs:{},P:{},C:{},fx:[],mail:[],pend:[],ms:{},mp:{},mg:{},aw:[],seasons:[],retired:[],pool:[],rep:[],tr:{inc:[],out:[],hist:[]},me:null,ui:{pg:'home',tab:{}},rec:{}};SQ=null;
  const used=new Set();
  LEAGUES.forEach((L,lg)=>{for(let i=0;i<L.size;i++){
    let g;for(let k=0;k<300;k++){g=CLUBGEN[L.nat]();if(!used.has(g.town)){used.add(g.town);break}}
    const big=i<(L.big||0);const et=L.nat==='en'?L.tier:(L.q>=70?1:2);
    const c={id:++S.nid,name:g.n,short:shortName(g.n),lg,t:et,nat:L.nat,rep:cl(Math.round(L.q+13-(L.q>70?0:0)+ri(-8,8)),5,99),fans:ri(48,74),founded:ri(1868,1930),ground:`${g.town} ${pick(L.nat==='en'?['Road','Park','Lane','Meadow','Ground','Stadium','Common']:L.nat==='de'?['Arena','Stadion','Park']:L.nat==='nl'?['Stadion','Park','Arena']:L.nat==='it'?['Stadio','Arena']:['Estádio','Arena','Stadium'])}`,cap:Math.round(CAP[et-1]*(.75+R()*.5)/100)*100,troph:[],hist:[]};
    c.rep=cl(Math.round((L.q-44)*1.5+40+ri(-8,8)),5,90);c.cr=genCrest();c.col=c.cr.c1;
    if(big){c.big=true;c.rep=ri(L.nat==='en'?91:86,99);c.cap=ri(48,80)*1000;c.fans=ri(70,85);c.founded=ri(1868,1900)}
    const fl=[15,11,8,5,3][et-1];c.fl={tr:cl(Math.round(fl+nrm()*2.2+(big?4:0)),1,20),ac:cl(Math.round(fl+nrm()*2.2+(big?4:0)),1,20),md:cl(Math.round(fl+nrm()*2),1,20)};
    S.clubs[c.id]=c;const q=L.q+ri(-5,5)+(big?ri(5,9):0);
    const co=genCoach(q-3+(big?6:0),c.id);c.coach=co.id;
    for(const pos of POSL)for(let k=0;k<NEED[pos];k++)genPlayer(pos,q+Math.round(nrm()*4),ri(18,33),c.id);
    genGem(c.id,et,c.fl.ac);
  }});
  SQ=null;for(const c of Object.values(S.clubs)){sqAll(c.id).forEach(p=>p.num=0);sqAll(c.id).forEach(p=>p.num=freeNum(c.id))}
  for(let i=0;i<10;i++)S.pool.push(genCoach(ri(45,80)).id);
  S.news=[];ensureAI();ensureCoaches();Object.values(S.P).forEach(p=>{if(p.gem)p.origin=p.club});
  genFixtures();cupsSetup();
}
function genFixtures(){
  S.fx=[];const sd=seasonStart(S.season);
  LEAGUES.forEach((L,lg)=>{
    const ids=shuffle(Object.values(S.clubs).filter(c=>c.lg===lg).map(c=>c.id));const n=ids.length,a=ids.slice(),rounds=[];
    for(let r=0;r<n-1;r++){const m=[];for(let i=0;i<n/2;i++){const h=a[i],w=a[n-1-i];m.push(r%2?[w,h]:[h,w])}rounds.push(m);a.splice(1,0,a.pop())}
    const all=rounds.concat(rounds.map(rd=>rd.map(([h,w])=>[w,h])));const iv=282/(all.length-1);
    all.forEach((rd,r)=>rd.forEach(([h,w])=>S.fx.push({d:sd+37+Math.round(r*iv),r:r+1,lg,h,a:w,hs:null,as:null})));
  });
}
function table(lg){
  const rows={};Object.values(S.clubs).filter(c=>c.lg===lg).forEach(c=>rows[c.id]={c:c.id,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0});
  for(const f of S.fx){if(f.lg!==lg||f.hs===null||!rows[f.h]||!rows[f.a])continue;const H=rows[f.h],A=rows[f.a];H.p++;A.p++;H.gf+=f.hs;H.ga+=f.as;A.gf+=f.as;A.ga+=f.hs;
    if(f.hs>f.as){H.w++;A.l++;H.pts+=3}else if(f.hs<f.as){A.w++;H.l++;A.pts+=3}else{H.d++;A.d++;H.pts++;A.pts++}}
  return Object.values(rows).sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf||S.clubs[a.c].name.localeCompare(S.clubs[b.c].name));
}
const myPos=()=>{const tb=table(me().lg);return tb.findIndex(r=>r.c===S.me.cid)+1};
function repRank(c){const l=Object.values(S.clubs).filter(x=>x.lg===c.lg).sort((a,b)=>(b.big?1:0)-(a.big?1:0)||b.rep-a.rep||a.id-b.id);return l.indexOf(c)+1}
const STAT=[['Title favourite','g'],['Contender','g'],['Comfortable','bl'],['Low risk','bl'],['High risk','y'],['Relegation favourite','r']];
function statusOf(c){const r=repRank(c);const n=lgOf(c).size,f=n/16;if(c.big)return[c.nat==='en'?'Big Six':'Giant','y',r<=2?1:Math.min(4,(lgOf(c).big||3))];const i=r<=2?0:r<=Math.round(5*f)?1:r<=Math.round(8*f)?2:r<=Math.round(11*f)?3:r<=Math.round(14*f)?4:5;return[STAT[i][0],STAT[i][1],[1,Math.round(4*f),Math.round(7*f),Math.round(10*f),Math.round(13*f),n-3][i]]}
function expectation(){const c=me();const[,,tgt]=statusOf(c);const L=lgOf(c);const top1=L.tier===1;const top=top1?'Win the title':'Win the league';return{tgt,txt:tgt<=1?top:tgt<=3?(top1?'Finish in the top 3':'Win promotion (top 3)'):tgt<=4?'Push for the top 4':tgt<=7?'Finish in the top half':tgt<=10?'Stay comfortably mid-table':tgt<=13?'Stay out of trouble':'Avoid relegation'}}
function interest(p){if(p.club===S.me.cid)return 1;const c=me();const tq=lq(c);const from=p.club?S.clubs[p.club]:null;let x=(p.ovr-(tq+3))*.055+(from?(from.rep-c.rep)*.012+(lq(from)-tq)*.02:0)+(from&&from.big&&!c.big?.25:0)-(c.big?.3:0);return cl(1-x,.03,1)}
const intLbl=v=>v>=.8?['Keen','g']:v>=.5?['Open','bl']:v>=.25?['Doubtful','y']:['Not interested','r'];

/* ---------- stadium + pitch + commercial ---------- */
const PLANS={Basic:{cost:[12e3,6e3,3e3,1500,800],rec:.1,d:'Cheap. The pitch slowly wears down.'},Standard:{cost:[40e3,18e3,8e3,4e3,2e3],rec:.35,d:'Keeps the pitch roughly where it is.'},Premium:{cost:[120e3,50e3,22e3,10e3,5e3],rec:.7,d:'Grounds staff every day. Pitch improves.'}};
const pitchMod=()=>{const c=S.me.pitch.c;return c>=85?1:c>=60?0:c>=40?-1:-2.5};
function expAtt(c=me()){const t=c.t;const cond=S.me?S.me.pitch.c:80;const form=S.me?S.me.res.slice(-5).reduce((s,r)=>s+(r.gf>r.ga?1:r.gf<r.ga?-1:0),0):0;const fill=cl(.18+c.fans/140+(c.rep-50)/250+(5-t)*.03-(S.me.ticket-FAIRT[t-1])/FAIRT[t-1]*.35+(cond<40?-.08:0)+form*.015,.1,1);return Math.round(c.cap*fill)}
const comCost=(k,l)=>Math.round(40e3*Math.pow(1.6,l)*TMULT[me().t-1]/2/1000)*1000;
const shopInc=()=>Math.round(Math.pow(S.me.com.shop,1.35)*2500*(me().fans/60)*TMULT[me().t-1]);
const namingOffer=()=>Math.round(COMM[me().t-1]*.35*(.8+me().rep/250)/1000)*1000;

/* ---------- line-ups and matches ---------- */
function pickXI(cid){
  const c=S.clubs[cid],co=S.C[c.coach],tac=co?co.tac:'Total Football',form=co?co.form:'4-4-2',cb=cboost(cid);
  const pool=sq(cid).filter(p=>p.inj<=0&&!(p.ban>0));const slots=FORMS[form];const used=new Set();const xi=new Array(slots.length).fill(null);
  const order=slots.map((s,i)=>i).sort((a,b)=>(slots[a][0]==='GK'?0:1)-(slots[b][0]==='GK'?0:1));
  if(isMe(cid)){for(const pid of S.me.force){const p=S.P[pid];if(!p||p.club!==cid||p.inj>0||p.ban>0||p.yth)continue;let best=-1,bv=-1e9;for(const i of order){if(xi[i])continue;const v=-pen(p.pos,slots[i][0]);if(v>bv){bv=v;best=i}}if(best>=0){xi[best]=p;used.add(p.id)}}}
  const fc={};pool.forEach(p=>fc[p.id]=fit(p,tac,cb));
  for(const i of order){if(xi[i])continue;let bp=null,bv=-1e9;for(const p of pool){if(used.has(p.id))continue;const v=fc[p.id]-pen(p.pos,slots[i][0]);if(v>bv){bv=v;bp=p}}if(bp){xi[i]=bp;used.add(bp.id)}}
  return{xi,slots,tac,form,cb,fc,bench:pool.filter(p=>!used.has(p.id)).sort((a,b)=>b.ovr-a.ovr).slice(0,7)};
}
function strength(cid,L){let s=0,n=0,m=0,lead=0;L.xi.forEach((p,i)=>{n++;if(!p){s+=20;m+=50;return}s+=(L.fc[p.id]??fit(p,L.tac,L.cb))-pen(p.pos,L.slots[i][0]);m+=p.mo;lead+=traitFx(p).lead||0});return s/n+(coachTa(cid)-60)*.08+(m/n-60)*.05+lead}
const homeAdv=cid=>2+(isMe(cid)?pitchMod():0);
function simMatch(f,detail){return runEngine(f,!!detail)}
const BONUS={None:{cost:0,mo:-1,d:'No bonus. Cheap, but the squad notices.'},Standard:{cost:2000,mo:0,d:'A fair bonus per win. Morale unchanged.'},Generous:{cost:6000,mo:2,d:'Big win bonuses. Morale rises after every win.'}};
function applyMatch(f,r){
  f.hs=r.gh;f.as=r.ga;const res={h:Math.sign(r.gh-r.ga),a:Math.sign(r.ga-r.gh)};
  [f.h,f.a].forEach(cid=>sqAll(cid).forEach(p=>{if(p.ban>0)p.ban--}));
  const G={},A={};r.ev.forEach(e=>{G[e.sc]=(G[e.sc]||0)+1;if(e.as)A[e.as]=(A[e.as]||0)+1});
  const CY={};r.cards.forEach(c=>{const p=S.P[c.pid];if(!p)return;if(c.c==='Y')p.sY++;else{p.sRd++;p.ban=1}CY[c.pid]=c.c});
  const mine=isMe(f.h)||isMe(f.a);const rt={};const homeMine=isMe(f.h);
  [['h',r.apps?r.apps.h:r.Lh.xi.filter(Boolean),f.h,r.ga],['a',r.apps?r.apps.a:r.La.xi.filter(Boolean),f.a,r.gh]].forEach(([s,XI,cid,conc])=>{XI.forEach(p=>{if(!p)return;const tf=traitFx(p);
    let x=r.rtd?6.25+nrm()*.22+res[s]*.3+(r.rtd[p.id]||0)+(tf.clutch||0)*.5+((p.pos==='GK'||p.pos==='DF')&&conc===0?.5:0):6.3+nrm()*.45+res[s]*.35+(G[p.id]||0)*1.0+(A[p.id]||0)*.6+(tf.clutch||0)-(CY[p.id]&&CY[p.id]!=='Y'?1.2:0)+((p.pos==='GK'||p.pos==='DF')?(conc===0?.6:-conc*.22):0);x=cl(Math.round(x*10)/10,4,10);rt[p.id]=x;
    p.sA++;p.sG+=G[p.id]||0;p.sAs+=A[p.id]||0;p.sR+=x;const ca=p.ca[cid]||(p.ca[cid]=[0,0,0]);ca[0]++;ca[1]+=G[p.id]||0;ca[2]+=A[p.id]||0;const scs=(p.sc||(p.sc={}))[cid]||(p.sc[cid]=[0,0,0,0]);scs[0]++;scs[1]+=G[p.id]||0;scs[2]+=A[p.id]||0;scs[3]+=x;
    p.mo=cl(p.mo+res[s]*2+(x>=7.5?1:0)+(isMe(cid)&&res[s]>0?BONUS[S.me.bonus].mo:0),0,100);if(tf.morale)p.mo=Math.max(p.mo,tf.morale);p.last=S.d;
    const ms=S.ms[p.id]||(S.ms[p.id]={a:0,r:0,g:0,as:0,c:cid});ms.a++;ms.r+=x;ms.g+=G[p.id]||0;ms.as+=A[p.id]||0;ms.c=cid;
    let injr=.02*(1-(tf.inj||0)/100);const fl=S.clubs[cid].fl;injr*=isMe(cid)?(1-S.me.fac.md*.035):(1-(fl?fl.md:5)*.03);injr*=1-(cfx(cid).fit||0)/100;if(isMe(cid)&&homeMine)injr*=S.me.pitch.c<20?2.2:S.me.pitch.c<40?1.6:1;
    if(R()<injr){p.inj=ri(4,38);if(isMe(cid))mail('injury',{pid:p.id,days:p.inj})}
  })});
  r.act.forEach(a=>{const cid=a.side==='h'?f.h:f.a;if(a.k==='frenzy')sq(cid).forEach(p=>p.mo=cl(p.mo+6,0,100));if(a.k==='heal')sq(cid).forEach(p=>p.inj=0)});
  const pts=x=>x>0?3:x===0?1:0;S.mp[f.h]=(S.mp[f.h]||0)+pts(res.h);S.mp[f.a]=(S.mp[f.a]||0)+pts(res.a);S.mg[f.h]=(S.mg[f.h]||0)+r.gh-r.ga;S.mg[f.a]=(S.mg[f.a]||0)+r.ga-r.gh;
  if(mine){
    const home=homeMine,gf=home?r.gh:r.ga,ga=home?r.ga:r.gh,c=me();
    if(home){const att=Math.min(c.cap,Math.round(expAtt(c)*(.92+R()*.16)));f.att=att;const tk=att*S.me.ticket*(1+(5-c.t)*.4);const cat=att*.6*S.me.com.cat;const hosp=S.me.com.hosp*4*300*TMULT[c.t-1];S.me.money+=tk+cat+hosp;S.me.fin.tk+=tk+cat+hosp;S.me.pitch.c=cl(S.me.pitch.c-3,0,100);if(S.me.pitch.c<40&&!S.me.unl.fanlock)c.fans=cl(c.fans-1,0,100)}
    if(gf>ga){const b=BONUS[S.me.bonus].cost*(6-c.t);S.me.money-=b;S.me.fin.wb+=b;S.me.seeds+=2}else if(gf===ga)S.me.seeds+=1;
    if(!S.me.unl.fanlock)c.fans=cl(c.fans+(gf>ga?1.5:gf<ga?-2:0),0,100);else c.fans=100;
    S.me.res.push({d:S.d,opp:home?f.a:f.h,home,gf,ga});if(S.me.res.length>60)S.me.res.shift();
    const diff=gf-ga;const rb=S.rec[S.me.cid]||(S.rec[S.me.cid]={});if(diff>0&&(!rb.win||diff>rb.win.diff))rb.win={diff,txt:`${gf}-${ga} v ${S.clubs[home?f.a:f.h].name}`,s:S.season};
    f.rt=rt;f.ev=r.ev.map(e=>({m:e.m,side:e.side,sc:S.P[e.sc]?.name||'',pen:e.pen}));
  }
  if(f.cup)cupTie(f,r);
}

function simOthersToday(){cupAdvance();for(const f of S.fx)if(f.d===S.d&&f.hs===null&&!isMe(f.h)&&!isMe(f.a))applyMatch(f,simMatch(f))}
const myFixtureToday=()=>S.fx.find(f=>f.d===S.d&&f.hs===null&&(isMe(f.h)||isMe(f.a)));
const nextFixture=()=>S.fx.filter(f=>f.hs===null&&(isMe(f.h)||isMe(f.a))).sort((a,b)=>a.d-b.d)[0];
const avgOvr=cid=>{const L=pickXI(cid).xi.filter(Boolean);return Math.round(L.reduce((s,p)=>s+p.ovr,0)/(L.length||1))};

/* ---------- coach trust, board, leaders ---------- */
function trust(d,why){if(!S.me)return;if(d<0){const tf=cfx(S.me.cid).trust;if(tf)d*=1-tf/100}S.me.trust=cl(S.me.trust+d,0,100);S.me.tlog.unshift({d:S.d,v:d,why});S.me.tlog.length=Math.min(S.me.tlog.length,14)}
function coachPlan(){const co=coachOf(S.me.cid);const L=pickXI(S.me.cid);const s=sq(S.me.cid);const avg=avgOvr(S.me.cid);
  const weak=[];L.xi.forEach((p,i)=>{if(p&&L.fc[p.id]-pen(p.pos,L.slots[i][0])<avg-2)weak.push(L.slots[i][0])});
  const off=s.filter(p=>!L.xi.includes(p)&&!L.bench.slice(0,5).includes(p)&&!p.gem&&(p.age>=29||p.ovr<avg-5)).sort((a,b)=>a.ovr-b.ovr);return{weak:[...new Set(weak)],off,L,avg,co}}
function planReactSign(p){const{weak,L,avg}=coachPlan();const inPlan=weak.includes(p.pos)||fitC(p)>=avg+1;if(inPlan)trust(4,`Signed ${p.name}: in the coach's plan`);else trust(-5,`Signed ${p.name}: not in the coach's plan`)}
function planReactSell(p){const{off,L}=coachPlan();if(L.xi.includes(p))trust(-6,`Sold ${p.name}, one of his starters`);else if(off.includes(p))trust(3,`Sold ${p.name}, as the coach asked`)}
function leaders(){return sq(S.me.cid).filter(p=>p.age>=25).sort((a,b)=>b.ovr+b.age*.6-(a.ovr+a.age*.6)).slice(0,3)}
const leadState=()=>{const l=leaders();if(!l.length)return['No leaders','y',60];const m=l.reduce((s,p)=>s+p.mo,0)/l.length;return m>=70?['Happy','g',m]:m>=45?['Settled','bl',m]:['Unhappy','r',m]};
const trustState=()=>{const t=S.me.trust;return t>75?['Strong','g']:t>=50?['Good','g']:t>=35?['Strained','y']:['Broken','r']};
const boardState=()=>{const b=S.me.board;return b>70?['Delighted','g']:b>=45?['Satisfied','bl']:b>=25?['Concerned','y']:['Losing patience','r']};

/* ---------- mail ---------- */
const MI={club:['🛡️','light-dark(#efe6fb,#2c2140)'],money:['💶','var(--goldbg)'],squad:['👕','var(--grnbg)'],transfer:['🔁','var(--bluebg)'],scout:['🔎','var(--bluebg)'],award:['🏆','var(--goldbg)'],media:['🎙️','var(--card2)'],medical:['➕','var(--redbg)'],staff:['📋','var(--card2)']};
const pn=id=>S.P[id]?S.P[id].name:'A former player';
const coName=()=>coachOf(S.me.cid)?.name||'Your coach';
const MT={
welcome:{from:()=>'Club Secretary',cat:'club',imp:1,title:()=>`Welcome to ${S.title}`,body:()=>`<p>Gaffer, welcome to <b>${esc(me().name)}</b>. You're the manager: you run the club, hire the coach, sign players and keep the board and fans happy. The coach picks the team and plays his style.</p><p>The board expects us to <b>${expectation().txt.toLowerCase()}</b>. Every club has a hidden gem; ours is in the squad. Press <b>Continue</b> to move day by day. Not sure what something does? <b>More › Encyclopedia</b>.</p>`},
bidinfo:{from:d=>`${S.clubs[d.club]?.name} · Chairman`,cat:'transfer',imp:1,title:d=>`Offer for ${pn(d.pid)}: ${money(d.fee)}`,body:d=>`<p><b>${esc(S.clubs[d.club]?.name)}</b> have made an offer of <b>${money(d.fee)}</b> for ${esc(pn(d.pid))}. The offer stays open for 7 days.</p><button class="btn grn" data-a="gotr:inc">Answer in Transfers › Incoming</button>`},
trnote:{from:d=>d.from||'Head of Recruitment',cat:'transfer',title:d=>d.title,body:d=>d.html+'<p><button class="btn" data-a="gotr:'+(d.tab||'out')+'">Open Transfers</button></p>'},
scoutrep:{from:()=>'Chief Scout',cat:'scout',title:d=>`Scout report: ${d.n} player${d.n>1?'s':''} found`,body:d=>repHTML(d.rid)},
unhappy:{from:d=>pn(d.pid),cat:'squad',imp:1,title:d=>`${last(pn(d.pid))} wants more minutes`,body:d=>{const p=S.P[d.pid];return p?`<p>“Boss, I've barely played. I'm better than the lads ahead of me and I want to start. Otherwise I want out.”</p><p class="mut">${esc(p.name)} · ${p.pos} · OVR ${p.ovr} · morale ${Math.round(p.mo)}</p>`:''},acts:()=>[['promise','Promise he starts','grn'],['talk','Talk him round',''],['fine','Fine him',''],['list','Put him up for sale','']],
 run:(a,d)=>{const p=S.P[d.pid];if(!p||p.club!==S.me.cid)return'He has left the club.';
  if(a==='promise'){if(!S.me.force.includes(p.id))S.me.force.push(p.id);p.mo=cl(p.mo+14,0,100);trust(-2,`Forced ${p.name} into the team`);return `${coName()} will start ${p.name}.`}
  if(a==='talk'){const co=coachOf(S.me.cid);if(boss()||R()<(co?co.mm/100:.5)){p.mo=cl(p.mo+9,0,100);return `${p.name} accepts it and gets his head down.`}p.mo=cl(p.mo-6,0,100);return `${p.name} wasn't convinced.`}
  if(a==='fine'){if(boss()){p.mo=cl(p.mo+4,0,100);return `${p.name} takes the fine and apologises.`}p.mo=cl(p.mo-12,0,100);return `${p.name} is furious about the fine.`}
  S.pend.push({d:S.d+ri(2,6),type:'bidfor',pid:p.id});return `${p.name} is on the market. Offers will appear in Transfers.`}},
coachreq:{from:()=>coName()+' · Coach',cat:'staff',imp:1,title:d=>`I need a ${AL[d.emph]} ${d.pos}`,body:d=>`<p>“Gaffer, to play <b>${coachOf(S.me.cid).tac}</b> properly I need a ${d.pos} with real <b>${ALF[d.emph]}</b>. Can you brief the agency?”</p>`,acts:()=>[['brief','Brief the agency','grn'],['ignore','Not now','']],
 run:(a,d)=>{if(a==='ignore'){trust(-4,'Ignored the coach\'s transfer request');return'The coach shrugs. He will remember this.'}trust(2,'Acted on the coach\'s transfer request');const rid=agency(d.pos,avgOvr(S.me.cid)+2,28,d.emph,3,'Coach request');return `The agency filed a report with 3 names. Open Scouting › Reports to reveal them.`}},
sponsor:{from:()=>'Commercial Director',cat:'money',imp:1,title:d=>`Sponsorship offer: ${money(d.amt)}`,body:d=>`<p><b>${esc(d.name)}</b> want their name on our training kit. They're offering <b>${money(d.amt)}</b> up front.</p>`,acts:()=>[['accept','Accept','grn'],['decline','Decline','']],
 run:(a,d)=>{if(a==='decline')return'Declined.';S.me.money+=d.amt;S.me.fin.tr+=0;S.me.fin.sp=(S.me.fin.sp||0)+d.amt;return `${money(d.amt)} added to the budget.`}},
raise:{from:d=>`${pn(d.pid)}'s agent`,cat:'squad',imp:1,title:d=>`${last(pn(d.pid))} wants a pay rise`,body:d=>{const p=S.P[d.pid];return p?`<p>My client has been excellent. He wants his wage raised from <b>${money(p.wage)}</b> to <b>${money(d.w)}</b> a month.</p>`:''},acts:()=>[['accept','Agree','grn'],['reject','Refuse','']],
 run:(a,d)=>{const p=S.P[d.pid];if(!p||p.club!==S.me.cid)return'He has left.';if(a==='accept'){p.wage=d.w;p.mo=cl(p.mo+10,0,100);return `${p.name} is delighted.`}if(boss())return `${p.name} accepts your decision without complaint.`;p.mo=cl(p.mo-12,0,100);return `${p.name} is unhappy.`}},
dressing:{from:()=>'Club Captain',cat:'squad',imp:1,title:()=>'Trouble in the dressing room',body:d=>`<p>${esc(pn(d.a))} and ${esc(pn(d.b))} had a bust-up after training. Half the squad has picked a side.</p>`,acts:d=>[['a',`Back ${last(pn(d.a))}`,''],['b',`Back ${last(pn(d.b))}`,''],['clear','Clear-the-air meeting (€5K)','grn']],
 run:(a,d)=>{const A=S.P[d.a],B=S.P[d.b];if(!A||!B)return'It has blown over.';if(a==='clear'){S.me.money-=5000;sq(S.me.cid).forEach(p=>p.mo=cl(p.mo+(boss()?5:2),0,100));return'Hands shaken. The squad is together again.'}const[w,l]=a==='a'?[A,B]:[B,A];w.mo=cl(w.mo+8,0,100);l.mo=cl(l.mo-(boss()?0:10),0,100);return `${w.name} has your backing.`}},
media:{from:()=>'Local Press',cat:'media',title:d=>d.q,body:d=>`<p>The press want a line from you: <i>${esc(d.q)}</i></p>`,acts:()=>[['praise','Praise the squad','grn'],['demand','Demand more',''],['deflect','Deflect','']],
 run:a=>{const s=sq(S.me.cid);if(a==='praise'){s.forEach(p=>p.mo=cl(p.mo+3,0,100));return'The players like hearing that.'}if(a==='demand'){s.forEach(p=>p.mo=cl(p.mo-(boss()?0:2),0,100));me().fans=cl(me().fans+2,0,100);return'Fans love the fire. Some players feel stung.'}return'Nothing to see here.'}},
fans:{from:()=>'Supporters Club',cat:'club',title:()=>'Ticket prices are too high',body:()=>`<p>Fans say €${S.me.ticket} a ticket is too much at this level.</p>`,acts:()=>[['cut','Cut prices by €2','grn'],['hold','Hold firm','']],
 run:a=>{if(a==='cut'){S.me.ticket=Math.max(5,S.me.ticket-2);me().fans=cl(me().fans+6,0,100);return `Tickets now €${S.me.ticket}. Fans are happy.`}if(!boss())me().fans=cl(me().fans-4,0,100);return'Prices unchanged.'}},
injury:{from:()=>'Medical Centre',cat:'medical',title:d=>`${pn(d.pid)} injured`,body:d=>`<p>${esc(pn(d.pid))} picked up a knock and will be out for about <b>${d.days} days</b>.</p>`},
award:{from:()=>'League Office',cat:'award',title:d=>d.title,body:d=>d.html},
board:{from:()=>'The Board',cat:'club',imp:1,title:d=>d.title,body:d=>d.html},
staff:{from:d=>d.from||coName(),cat:'staff',imp:1,title:d=>d.title,body:d=>d.html},
info:{from:d=>d.from||'Club Secretary',cat:'club',title:d=>d.title,body:d=>d.html},
};
function mail(type,data={}){const M=MT[type];const acts=M.acts?M.acts(data):null;const m={id:++S.nid,d:S.d,type,data,read:false,done:!acts,from:M.from(data),cat:M.cat,title:M.title(data),imp:!!M.imp};S.mail.unshift(m);if(S.mail.length>160)S.mail.length=160;if(acts)S._stop=true;return m}

/* ---------- scouting reports ---------- */
function newReport(title,pids,src){const r={id:++S.nid,d:S.d,title,src,pids,rev:false};S.rep.unshift(r);if(S.rep.length>30)S.rep.length=30;pids.forEach(addShortQuiet);return r.id}
function repHTML(rid){const r=S.rep.find(x=>x.id==rid);if(!r)return'<p>This report has expired.</p>';const ps=r.pids.map(id=>S.P[id]).filter(Boolean);
  return `<p>${esc(r.title)} · <b>${ps.length}</b> player${ps.length===1?'':'s'} match.</p>${r.rev?`<div>${ps.map(p=>prow(p,{club:1,val:2})).join('')}</div>`:`<div class="grid3" style="margin:10px 0">${POSL.map(ps2=>{const n=ps.filter(p=>p.pos===ps2).length;return n?`<div class="prof"><div class="lbl">${ps2}</div><div class="big">${n}</div></div>`:''}).join('')}</div><button class="btn grn" data-a="reveal:${r.id}">Reveal names</button>`}`}
function addShortQuiet(id){if(!S.me.short.includes(id))S.me.short.unshift(id)}
function scoutTarget(){const co=coachOf(S.me.cid);const myAvg=avgOvr(S.me.cid);const mq=lq(me());
  if(R()<.5){const c=Object.values(S.P).filter(p=>p.club&&p.club!==S.me.cid&&!p.yth&&Math.abs(lq(S.clubs[p.club])-mq)<=8&&fitC(p)>=myAvg+1);if(c.length)return pick(c)}
  return genPlayer(pick(POSL.slice(1)),myAvg+ri(-2,6)+S.me.fac.sc,ri(17,30),0,S.me.fac.sc)}
function scoutReport(){const n=ri(1,4);const ps=[];for(let i=0;i<n;i++){const p=scoutTarget();if(p&&!ps.includes(p.id))ps.push(p.id)}const rid=newReport('Players who fit our style',ps,'Chief Scout');mail('scoutrep',{rid,n:ps.length})}
function agency(pos,minOvr,maxAge,emph,n,src='Agency brief'){const out=[];const lvl=S.me.fac.sc;for(let i=0;i<n;i++){const age=ri(17,Math.max(17,maxAge));let tgt=minOvr+ri(0,4)+Math.floor(lvl/2);if(!boss()&&!S.me.unl.eyes&&R()<.3)tgt-=ri(2,6);const p=genPlayer(pos||pick(POSL.slice(1)),tgt,age,0,lvl+(S.me.unl.eyes?3:0),emph);out.push(p.id)}return newReport(`${src}: ${pos||'any'} · ${emph?ALF[emph]:'any profile'} · ${minOvr}+ OVR`,out,src)}
const faFee=p=>Math.round(p.val*.3/1000)*1000;

/* ---------- transfers ---------- */
function bidFor(p){const c=me();const buyers=Object.values(S.clubs).filter(x=>x.id!==c.id&&lq(x)>=lq(c)-8&&lq(x)<=lq(c)+14&&(x.money||0)>p.val*1.2);if(!buyers.length)return;const b=pick(buyers);const fee=Math.round(p.val*(.8+R()*.75)/1000)*1000;S.tr.inc.unshift({id:++S.nid,pid:p.id,club:b.id,fee,d:S.d,exp:S.d+7,st:'open'});mail('bidinfo',{pid:p.id,club:b.id,fee})}
function trHist(txt,fee,dir){S.tr.hist.unshift({d:S.d,s:S.season,txt,fee,dir});if(S.tr.hist.length>120)S.tr.hist.length=120;S.me.log.push({s:S.season,d:S.d,txt})}
function sellTo(p,club,fee){planReactSell(p);S.clubs[club].money=(S.clubs[club].money||0)-fee;moveRec(p,S.me.cid,club,fee,'transfer');news('transfer',`${p.name} (${p.pos}, ${p.ovr}) ${me().name} → ${S.clubs[club].name} · ${money(fee)}`,[S.me.cid,club]);p.club=club;SQ=null;p.num=freeNum(club);S.me.money+=fee;S.me.fin.tr+=fee;S.me.force=S.me.force.filter(x=>x!==p.id);trHist(`Sold ${p.name} to ${S.clubs[club].name}`,fee,'out')}
function completeSign(p,fee){const from=p.club;if(from){S.clubs[from].money=(S.clubs[from].money||0)+fee}moveRec(p,from,S.me.cid,fee,from?'transfer':'free');news('transfer',`${p.name} (${p.pos}, ${p.ovr}) ${from?`${S.clubs[from].name} → ${me().name}`:`signs for ${me().name} as a free agent`}${fee?` · ${money(fee)}`:''}`,[from,S.me.cid].filter(Boolean));S.me.money-=fee;S.me.fin.tr-=fee;p.club=S.me.cid;p.yth=false;SQ=null;p.num=freeNum(S.me.cid);p.mo=cl(p.mo+10,0,100);p.last=S.d;S.me.short=S.me.short.filter(x=>x!==p.id);if(from)refill(from);planReactSign(p);trHist(`Signed ${p.name}${from?` from ${S.clubs[from].name}`:' (free agent)'}`,fee,'in')}
function signFree(p){const fee=faFee(p);if(p.club)return'He has a club. Make an offer instead.';if(S.me.money<fee)return `Not enough money: you need ${money(fee)}. Top up in the Store.`;if(!boss()&&R()>interest(p))return `${p.name} isn't interested in joining ${me().name}.`;completeSign(p,fee);return `${p.name} signs! Fee ${money(fee)}.`}
function makeOffer(p,fee){if(p.club===S.me.cid)return'Already ours.';if(!p.club)return signFree(p);if(S.tr.out.some(o=>o.pid===p.id&&(o.st==='pending'||o.st==='countered')))return'You already have an offer on the table for him.';S.tr.out.unshift({id:++S.nid,pid:p.id,from:p.club,fee,d:S.d,due:S.d+ri(1,3),st:'pending'});return `Offer of ${money(fee)} sent to ${S.clubs[p.club].name}. Expect an answer within 3 days.`}
function resolveOut(o){const p=S.P[o.pid];if(!p||p.club!==o.from){o.st='failed';o.msg='He moved elsewhere.';return}const club=S.clubs[o.from];
  let ok=boss();if(!ok){if(R()<(club.big?.35:.18)){o.st='rejected';o.msg=`${club.name} refuse to sell.`}else if(o.fee>=p.val*(club.big?1.15:.95)&&R()<.85)ok=true;else if(o.fee>=p.val*.7){o.st='countered';o.cfee=Math.round(p.val*(club.big?1.3:1.08)/1000)*1000;o.msg=`${club.name} want ${money(o.cfee)}.`}else{o.st='rejected';o.msg=`${club.name} laughed it off.`}}
  if(ok)finalizeOut(o,o.fee);mail('trnote',{title:`${p.name}: ${o.st==='done'?'deal done':o.st==='countered'?'counter-offer':o.st==='terms'?'he said no':'offer rejected'}`,html:`<p>${esc(o.msg)}</p>`})}
function finalizeOut(o,fee){const p=S.P[o.pid];if(!boss()&&R()>interest(p)){o.st='terms';o.msg=p.club&&lq(S.clubs[p.club])>lq(me())?`${p.name} won't drop down to the ${lgName(me())} to join a club your size.`:`${p.name} isn't interested in joining ${me().name}.`;return}if(S.me.money<fee){o.st='failed';o.msg=`Clubs agreed ${money(fee)} but we only have ${money(S.me.money)}. Top up and try again.`;return}const from=S.clubs[p.club].name;completeSign(p,fee);o.st='done';o.paid=fee;o.msg=`${p.name} joins from ${from} for ${money(fee)}.`}
function refill(cid){const c=S.clubs[cid];const s=sq(cid);for(const pos of POSL){const have=s.filter(p=>p.pos===pos).length;for(let k=have;k<NEED[pos];k++){const p=genPlayer(pos,lq(c)+ri(-4,4),ri(18,30),cid);SQ=null;p.num=freeNum(cid)}}}

/* ---------- time ---------- */
function randomMail(){
  const r=R();const my=sq(S.me.cid);if(!my.length)return;
  if(inWindow()&&r<.12){const p=wpick(my,p=>Math.pow(p.ovr/45,4)*(p.gem?3:1));bidFor(p);return}
  if(r<.42){const L=pickXI(S.me.cid);const outs=my.filter(p=>!L.xi.includes(p)&&p.inj<=0&&S.d-p.last>20&&p.age>20).sort((a,b)=>b.ovr-a.ovr);if(outs[0]&&!S.mail.some(m=>m.type==='unhappy'&&m.data.pid===outs[0].id&&S.d-m.d<40)){mail('unhappy',{pid:outs[0].id});return}}
  if(r<.6){scoutReport();return}
  if(r<.67){const co=coachOf(S.me.cid);if(!co)return;const w=TAC[co.tac];const emph=ATT[w.indexOf(Math.max(...w))];const{weak}=coachPlan();mail('coachreq',{pos:weak[0]||'ST',emph});return}
  if(r<.74){mail('sponsor',{name:pick(['Kestrel Energy','Borneo Brew Co.','Halcyon Motors','Pixel Peak Games','Rainforest Telecom','Northgate Insurance','Lophus Snacks','Tidewater Bank']),amt:Math.round(COMM[me().t-1]*(.3+R()*.6)/1000)*1000});return}
  if(r<.81){const p=wpick(my,p=>p.mo>60?Math.pow(p.ovr/45,3):.1);mail('raise',{pid:p.id,w:Math.round(p.wage*(1.25+R()*.4)/100)*100});return}
  if(r<.87&&my.length>4){const a=pick(my),b=pick(my.filter(x=>x!==a));mail('dressing',{a:a.id,b:b.id});return}
  if(r<.94){mail('media',{q:pick(['Can this squad really meet the board\'s target?','Is the coach the right man for the job?','Are the fans right to be worried?','Who is the best player in your dressing room?','Should the club be spending more?'])});return}
  mail('fans',{});
}
function advanceDay(){
  S.d++;const o=dobj(S.d);
  if(o.m===6&&o.day===1)endSeason();
  if(o.day===1){monthly(o);aiMonthly();coachMonthly()}
  huntDay();
  if(o.m===3&&o.day===1){youthIntake();aiYouth()}
  aiTransferDay();cupAdvance();
  if(o.wd===1)develop();
  for(const p of Object.values(S.P))if(p.inj>0)p.inj--;
  S.me.pitch.c=cl(S.me.pitch.c+PLANS[S.me.pitch.plan].rec-.15-(R()<.1?R()*2:0),0,100);
  S.pend=S.pend.filter(x=>{if(x.d>S.d)return true;const p=S.P[x.pid];if(x.type==='bidfor'&&p&&p.club===S.me.cid)bidFor(p);return false});
  S.tr.out.forEach(x=>{if(x.st==='pending'&&x.due<=S.d)resolveOut(x)});
  S.tr.inc.forEach(x=>{if(x.st==='open'&&x.exp<=S.d)x.st='expired'});
  if(R()<.2)randomMail();
}
function monthly(o){
  const pm=(o.m+11)%12,py=o.m===0?o.y-1:o.y;if([7,8,9,10,11,0,1,2,3,4].includes(pm)&&Object.keys(S.ms).length)awardsMonth(pm,py);
  S.ms={};S.mp={};S.mg={};
  const c=me();const co=coachOf(S.me.cid);const w=sq(S.me.cid).reduce((s,p)=>s+p.wage,0)+youth(S.me.cid).length*400+(co?co.wage:0);
  const net=[15e3,40e3,90e3,180e3,350e3][S.me.fac.sc-1];const plan=PLANS[S.me.pitch.plan].cost[c.t-1];
  const bm=(S.me.board<25&&!boss())?.85:1;const inc=Math.round(COMM[c.t-1]*(.6+c.rep/150)*bm)+shopInc()+(S.me.com.naming?S.me.com.naming.amt:0);
  S.me.money+=inc-w-net-plan;S.me.fin.hist.unshift({m:pm,y:py,inc:inc+S.me.fin.tk+Math.max(0,S.me.fin.tr)+(S.me.fin.sp||0),out:w+net+plan+S.me.fin.wb+Math.max(0,-S.me.fin.tr),com:inc,tk:S.me.fin.tk});S.me.fin.hist.length=Math.min(S.me.fin.hist.length,24);S.me.fin.tk=0;S.me.fin.tr=0;S.me.fin.wb=0;S.me.fin.sp=0;
  if(S.me.unl.fanlock)c.fans=100;
  S.pool=S.pool.filter(id=>S.C[id]&&!S.C[id].club);while(S.pool.length<8)S.pool.push(genCoach(ri(42,82)).id);
  // board confidence
  if([7,8,9,10,11,0,1,2,3,4].includes(pm)){const pos=myPos(),tgt=expectation().tgt;let d=cl((tgt-pos)*.6,-4,5)+(50-S.me.board)*.05;if(S.me.money<0)d-=3;if(c.fans>70)d+=1;S.me.board=cl(S.me.board+d,0,100);
    if(S.me.board<25&&!S.me._bw){S.me._bw=1;mail('board',{title:'The board is losing patience',html:`<p>We are ${ord(pos)}. The target is ${ord(tgt)} or better. Commercial partners are nervous and income is down 15% until things improve.</p>`})}if(S.me.board>=35)S.me._bw=0}
  // coach trust drift + resign
  const r5=S.me.res.slice(-6);const pts=r5.reduce((s,r)=>s+(r.gf>r.ga?3:r.gf===r.ga?1:0),0);if(r5.length)trust(pts>=12?2:pts<=4?-2:0,'Recent results');S.me.trust=S.me.trust+(60-S.me.trust)*.05;
  if(S.me.trust<15&&co&&!boss()){co.club=0;S.pool.push(co.id);const cc=genCoach(lq(c)-8);cc.club=c.id;cc.name=cc.name;c.coach=cc.id;S.me.trust=50;mail('staff',{from:co.name,title:`${co.name} has resigned`,html:`<p>“I can't work like this. You ignore my plan and undermine me. I'm done.”</p><p class="mut">${esc(cc.name)} steps in as caretaker. Hire a permanent coach in Scouting › Coaches.</p>`})}
  else if(S.me.trust<35&&co&&!S.me._tw){S.me._tw=1;mail('staff',{title:'We need to talk',html:`<p>“Gaffer, you keep going against my plan. The players can see it. Back me or replace me.”</p><p class="mut">While trust is below 35 the coach's tactical impact is halved.</p>`})}if(S.me.trust>=45)S.me._tw=0;
  if(S.me.money<0&&!S._warned){S._warned=true;mail('board',{title:'We are in the red',html:`<p>The club account is at <b>${money(S.me.money)}</b>. You can top up any time from the Store, or grow commercial income in Facilities.</p>`})}
}
function awardsMonth(m,y){
  const lg=me().lg;const t=lg;const c=Object.entries(S.ms).map(([id,v])=>({p:S.P[id],...v})).filter(x=>x.p&&S.clubs[x.c]&&S.clubs[x.c].lg===lg&&x.a>=2);if(!c.length)return;
  const sc=x=>x.r/x.a+x.g*.18+x.as*.1;c.sort((a,b)=>sc(b)-sc(a));const P=c[0];const Y=c.filter(x=>x.p.age<=21)[0];
  const cl2=Object.values(S.clubs).filter(x=>x.lg===lg).sort((a,b)=>(S.mp[b.id]||0)-(S.mp[a.id]||0)||(S.mg[b.id]||0)-(S.mg[a.id]||0))[0];const CO=S.C[cl2.coach];
  const lab=`${MON[m]} ${y}`;
  const rec={s:S.season,m,y,t,potm:{id:P.p.id,name:P.p.name,club:P.c,avg:(P.r/P.a).toFixed(2),g:P.g},ypotm:Y?{id:Y.p.id,name:Y.p.name,club:Y.c,avg:(Y.r/Y.a).toFixed(2),g:Y.g}:null,cotm:{id:CO?.id,name:CO?.name||'—',club:cl2.id,pts:S.mp[cl2.id]||0}};S.aw.unshift(rec);
  P.p.aw.push(`Player of the Month · ${lab}`);if(Y)Y.p.aw.push(`Young Player of the Month · ${lab}`);if(CO)CO.aw.push(`Coach of the Month · ${lab}`);
  const ours=[P.c===S.me.cid,Y&&Y.c===S.me.cid,cl2.id===S.me.cid].filter(Boolean).length;if(ours){me().fans=cl(me().fans+2*ours,0,100);me().rep=cl(me().rep+ours*.5,0,99);S.me.seeds+=10*ours;if(cl2.id===S.me.cid)trust(3,'Coach of the Month')}
  mail('award',{title:`${LEAGUES[lg].n} awards · ${lab}`,html:`<p><b>Player of the Month:</b> ${esc(P.p.name)} (${esc(S.clubs[P.c].name)}) · avg ${rec.potm.avg}, ${P.g} goals</p>${Y?`<p><b>Young Player of the Month:</b> ${esc(Y.p.name)} (${esc(S.clubs[Y.c].name)})</p>`:''}<p><b>Coach of the Month:</b> ${esc(rec.cotm.name)} (${esc(cl2.name)}) · ${rec.cotm.pts} pts</p>${ours?`<p class="b" style="color:var(--grn)">One of ours won! Fans, reputation and +${10*ours} seeds.</p>`:''}`});
}
function growStep(p,mine){let any=false;ATT.forEach(k=>{if(p[k]<p.cap[k]){p[k]++;any=true}});const b=p.ovr;p.ovr=calcOvr(p);if(mine&&p.ovr>b)S.me.mv.up++;return any}
function declineStep(p,mine){const k=pick(['fast','phy','fast','tec']);if(p[k]<=10)return;p[k]--;p.cap[k]=Math.max(p[k],p.cap[k]-1);const b=p.ovr;p.ovr=calcOvr(p);p.pot=Math.max(p.ovr,calcOvr(p,p.cap));if(mine&&p.ovr<b)S.me.mv.dn++}
function develop(){
  for(const p of Object.values(S.P)){if(!p.club)continue;const c=S.clubs[p.club];const mine=p.club===S.me.cid;const tf=traitFx(p);
    let tr=mine?S.me.fac.tr:(c.fl?c.fl.tr:5);if(p.yth)tr=(tr+(mine?Math.min(20,S.me.fac.ac):(c.fl?c.fl.ac:5)))/2;
    const co=S.C[c.coach];
    if(p.ovr<p.pot){const ageF=p.age<=23?1:p.age<=29?.85:p.age<=33?.6:.4;let g=(1.6+tr*.22)*ageF*(.8+(co?co.dv+(cfxOf(co).dv||0):60)/250)*(p.age<=21?1+(cfxOf(co).yth||0)/100:1)*(1+(tf.grow||0)/100)*(mine&&S.me.trust>75?1.1:1);p.xp=(p.xp||0)+g/52;while(p.xp>=1){p.xp-=1;if(!growStep(p,mine))break}}
    const cmo=cfxOf(co).mor;if(cmo)p.mo=Math.max(p.mo,cmo);const life=(tf.life||0)/10;if(p.age>=32+life&&R()<.03*(p.age-31-life))declineStep(p,mine);
  }
  const[ls]=leadState();if(ls==='Unhappy')sq(S.me.cid).forEach(p=>p.mo=cl(p.mo-1,0,100));else if(ls==='Happy')sq(S.me.cid).forEach(p=>p.mo=cl(p.mo+.5,0,100));
  if(S.me.trust<35&&!boss())sq(S.me.cid).forEach(p=>p.mo=cl(p.mo-.7,0,100));
  sq(S.me.cid).forEach(p=>{const f=traitFx(p).morale;if(f)p.mo=Math.max(p.mo,f)});
}
const ACADN=l=>l>=22?'All Roads Lead to Lophus':l===21?'El Fábrica':`Level ${l}`;
const intakeN=l=>l>=22?18:l===21?13:3+Math.floor(l/4);
function youthIntake(){const lvl=S.me.fac.ac;const n=intakeN(lvl);const ps=[];for(let i=0;i<n;i++){const p=genPlayer(pick(POSL),cl(30+lvl*1.1+S.me.fac.sc*1.2+Math.round(nrm()*4),25,70),ri(15,17),S.me.cid,Math.floor(lvl/2)+(lvl>20?6:0));p.yth=true;ps.push(p)}
  if(R()<.1+lvl*.02){const g=genGem(S.me.cid,me().t,lvl);g.yth=true;g.age=ri(15,16);ps.push(g)}SQ=null;
  mail('info',{from:'Head of Youth',title:`Youth intake: ${ps.length} new prospects`,html:`<p>This year's intake has arrived at ${esc(ACADN(lvl))}:</p>${ps.map(p=>`<p>${p.gem?'💎 ':''}${esc(p.name)} · ${p.pos} · age ${p.age} · OVR ${p.ovr} · potential ${S.me.unl.eyes?p.pot:'~'+Math.round(p.pot/5)*5}</p>`).join('')}<p class="mut">Promote them from the Academy page.</p>`})}
function goldenOrb(){
  const finish={};LEAGUES.forEach((L,lg)=>table(lg).forEach((r,i)=>finish[r.c]=i));
  const cand=Object.values(S.P).filter(p=>p.club&&!p.yth&&p.sA>=15).map(p=>{const c=S.clubs[p.club];const L=lgOf(c);const pos=finish[c.id];const team=L.tier===1?(pos===0?6:pos<4?3:pos<8?1:0):0;
    const sc=(p.sR/p.sA)*10+p.sG*.38+p.sAs*.2+(L.q-60)*.35+team+(p.pos==='GK'?3:p.pos==='DF'?2.5:0);return{id:p.id,name:p.name,club:c.id,clubName:c.name,lg:c.lg,pos:p.pos,age:p.age,g:p.sG,as:p.sAs,avg:(p.sR/p.sA).toFixed(2),sc:Math.round(sc*10)/10}}).sort((a,b)=>b.sc-a.sc).slice(0,10);
  return cand}
function endSeason(){
  const s=S.season;const rec={s,lgs:[],orb:goldenOrb()};const mv=[];const c=me();const myLg=c.lg;const exp=expectation();
  LEAGUES.forEach((L,lg)=>{const tb=table(lg);if(!tb.length)return;
    tb.forEach((r,i)=>S.clubs[r.c].hist.push({s,lg,t:L.tier,pos:i+1,pts:r.pts,w:r.w,d:r.d,l:r.l,gf:r.gf,ga:r.ga}));
    const ch=S.clubs[tb[0].c];ch.troph.push({s,n:`${L.n} champions`});ch.rep=cl(ch.rep+5,0,99);
    if(L.nat==='en'&&L.tier>1){for(let i=0;i<3;i++){mv.push([tb[i].c,lg-1]);if(i)S.clubs[tb[i].c].troph.push({s,n:`Promoted from ${L.n}`});S.clubs[tb[i].c].rep=cl(S.clubs[tb[i].c].rep+4,0,99)}}
    if(L.nat==='en'&&L.tier<5){for(let i=tb.length-3;i<tb.length;i++){mv.push([tb[i].c,lg+1]);S.clubs[tb[i].c].rep=cl(S.clubs[tb[i].c].rep-5,0,99)}}
    const pl=Object.values(S.P).filter(p=>p.club&&S.clubs[p.club].lg===lg&&!p.yth);const ts=pl.slice().sort((a,b)=>b.sG-a.sG)[0];const pots=pl.filter(p=>p.sA>=15).sort((a,b)=>b.sR/b.sA-a.sR/a.sA)[0];
    if(ts)ts.aw.push(`Golden Boot · ${L.n} ${seasonLbl(s)}`);if(pots)pots.aw.push(`Player of the Season · ${L.n} ${seasonLbl(s)}`);
    rec.lgs.push({lg,champ:tb[0].c,champName:ch.name,ts:ts?{name:ts.name,club:ts.club,g:ts.sG}:null,pots:pots?{name:pots.name,club:pots.club,avg:(pots.sR/pots.sA).toFixed(2)}:null});
  });
  const orbW=rec.orb[0];if(orbW&&S.P[orbW.id]){S.P[orbW.id].aw.push(`Golden Orb ${seasonLbl(s)}`);S.clubs[orbW.club].rep=cl(S.clubs[orbW.club].rep+2,0,99)}
  rec.cups=S.cups?Object.values(S.cups).filter(C=>C.winner).map(C=>{const fin=C.rounds.at(-1).ties[0];return{id:C.id,w:C.winner,ru:fin.w===fin.h?fin.a:fin.h,sc:`${fin.hs}-${fin.as}${fin.pens?` (${fin.pens.join('-')} pens)`:''}`}}):[];S.seasons.push(rec);careerClose(s);aiSeasonReview();coachSeason(s);
  const pos=table(myLg).findIndex(r=>r.c===S.me.cid)+1;
  mv.forEach(([id,lg])=>{const cc=S.clubs[id];cc.lg=lg;cc.t=LEAGUES[lg].tier});
  const hit=pos<=exp.tgt;c.fans=S.me.unl.fanlock?100:cl(c.fans+(hit?8:-10),0,100);c.rep=cl(c.rep+(hit?2:-2),0,99);S.me.board=cl(S.me.board+(hit?10:-12),0,100);S.me.seeds+=25;
  for(const p of Object.values(S.P)){p.age++;if(p.club===S.me.cid&&!p.yth&&p.sA)p.seasons=(p.seasons||0)+1;p.sA=p.sG=p.sAs=p.sR=p.sY=p.sRd=0;p.ban=0;
    const life=(traitFx(p).life||0)/10;
    if(p.age>=33+life&&R()<(p.age-32-life)*.2){const ca=p.ca[S.me.cid];exCoach(p);if(ca&&ca[0]>=10)S.retired.push({name:p.name,pos:p.pos,apps:ca[0],g:ca[1],as:ca[2],peak:p.ovr,ret:s,aw:p.aw,tr:p.tr,hist:p.hist});if(p.club===S.me.cid)S.me.log.push({s,d:S.d,txt:`${p.name} retired`});delete S.P[p.id];S.me.short=S.me.short.filter(x=>x!==p.id);S.me.force=S.me.force.filter(x=>x!==p.id);continue}
    if(p.yth&&p.age>=19)p.yth=false;setVal(p)}
  for(const id in S.P){const p=S.P[id];if(!p.club&&!S.me.short.includes(p.id))delete S.P[id]}
  SQ=null;for(const cc of Object.values(S.clubs))if(cc.id!==S.me.cid){refill(cc.id);if(R()<.5&&!sqAll(cc.id).some(p=>p.gem&&p.age<=21))genGem(cc.id,cc.t,cc.fl?cc.fl.ac:5)}SQ=null;
  const mys=sq(S.me.cid);const mins={GK:1,DF:4,MF:3,AM:1,ST:2};let filled=[];for(const ps of POSL){const h=mys.filter(p=>p.pos===ps).length;for(let k=h;k<mins[ps];k++){const p=genPlayer(ps,lq(me())-4,ri(20,29),S.me.cid);SQ=null;p.num=freeNum(S.me.cid);filled.push(p.name)}}
  for(const co of Object.values(S.C))co.age++;
  S.season++;S.me.mv={up:0,dn:0};S.me.force=[];genFixtures();cupsSetup();S._seasonEnd=true;
  const moved=me().lg!==myLg;
  if(orbW)mail('award',{title:`Golden Orb ${seasonLbl(s)}: ${orbW.name}`,html:`<p>The best player in the world this season is <b>${esc(orbW.name)}</b> (${esc(orbW.clubName)}, ${esc(LEAGUES[orbW.lg].n)}) · ${orbW.g} goals, ${orbW.as} assists, average rating ${orbW.avg}.</p><ol>${rec.orb.map(x=>`<li>${esc(x.name)} · ${esc(x.clubName)}${x.club===S.me.cid?' ⭐':''}</li>`).join('')}</ol>`});
  mail('board',{title:`Season review ${seasonLbl(s)}`,html:`<p>We finished <b>${ord(pos)}</b> in the ${LEAGUES[myLg].n}. The target was: ${exp.txt.toLowerCase()} (${ord(exp.tgt)} or better).</p><p>${moved?(LEAGUES[me().lg].tier<LEAGUES[myLg].tier?`<b>Promoted!</b> Next season we play in the ${lgName(me())}.`:`<b>Relegated.</b> Next season we drop to the ${lgName(me())}.`):`We stay in the ${lgName(me())}.`}</p><p>${hit?'The board is pleased. Fans are behind you.':'The board expected more. Fans are restless.'}</p><p>+25 seeds for the Lab.</p>${filled.length?`<p class="mut">The board signed free agents to fill gaps: ${filled.map(esc).join(', ')}.</p>`:''}<p>New target for ${seasonLbl(S.season)}: <b>${expectation().txt}</b>.</p>`});
}

/* ---------- lab ---------- */
const SEEDP=[.0025,.005,.01,.02,.035,.06,.1,.15,.25];
const fuseChance=(t,seeds,copy)=>Math.min(.95,(1-Math.pow(1-SEEDP[t],seeds))*(copy?.5:1));

/* ---------- save ---------- */
let SW=null,SWid=0,SVT=null,SVdirty=false,SWpend=false;try{if(typeof Worker!=='undefined'&&location.protocol!=='file:'){SW=new Worker('saveworker.js');SW.onmessage=e=>{if(e.data.id!==SWid)return;SWpend=false;try{localStorage.setItem(SKEY,'z'+e.data.z)}catch(_){}};SW.onerror=()=>{SW=null}}}catch(_){SW=null}
function saveNow(sync){clearTimeout(SVT);SVT=null;if(!S||!S.me)return;SVdirty=false;try{const j=JSON.stringify(S);if(SW&&!sync){SWpend=true;SW.postMessage({id:++SWid,j})}else{SWid++;SWpend=false;localStorage.setItem(SKEY,window.LZString?'z'+LZString.compressToUTF16(j):'j'+j)}}catch(e){console.warn('save failed',e)}}
function save(){SVdirty=true;clearTimeout(SVT);SVT=setTimeout(()=>saveNow(false),900)}
if(typeof addEventListener!=='undefined'){addEventListener('pagehide',()=>{if(SVdirty||SVT||SWpend)saveNow(true)});addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&(SVdirty||SVT||SWpend))saveNow(true)})}
function load(){try{const s=localStorage.getItem(SKEY);if(s){S=JSON.parse(s[0]==='z'?LZString.decompressFromUTF16(s.slice(1)):s.slice(1));SQ=null;ensureAI();ensureCoaches();if(!S.news)S.news=[];if(!S.cups)cupsSetup();return true}}catch(e){}return false}
const exportSave=()=>{const j=JSON.stringify(S);return window.LZString?'LFF3:'+LZString.compressToBase64(j):j};
const importSave=t=>{t=t.trim();return JSON.parse(t.startsWith('LFF3:')?LZString.decompressFromBase64(t.slice(5)):t)};
