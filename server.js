const express=require('express'),http=require('http'),crypto=require('crypto'),{Server}=require('socket.io');
const app=express();app.use(express.static(__dirname+'/public'));
const srv=http.createServer(app),io=new Server(srv,{maxHttpBufferSize:1e6});
const WORDS={Animals:['giraffe','penguin','octopus','kangaroo','owl','crab','elephant','dolphin','butterfly','tiger'],Food:['pizza','sushi','taco','popcorn','pancake','burger','ice cream','banana','sandwich','donut'],Places:['lighthouse','airport','castle','beach','library','volcano','pyramid','hospital','farm','zoo'],Things:['umbrella','bicycle','guitar','scissors','telescope','backpack','laptop','refrigerator','clock','candle'],Jobs:['astronaut','chef','pirate','dentist','farmer','magician','doctor','firefighter','teacher','clown'],Sports:['football','tennis','swimming','skateboard','archery','bowling','cricket','surfing','boxing','golf'],Nature:['rainbow','waterfall','cactus','snowman','tornado','mountain','sunflower','island','moon','lightning'],Vehicles:['rocket','submarine','helicopter','tractor','sailboat','train','ambulance','hot air balloon','scooter','bus']};
const CFG_OK={draw:[20,30,45,60,90],disc:[30,60,90,120,180,300],vote:[20,30,45,60]};
const AV=['🦊','🐙','🦄','🐸','🐼','🦖','🐱','🐵','👻','🤖','🐧','🦉'];
const R={},NEXT={role:'draw',vote:'reveal',funny:'recap'};
const rnd=a=>a[Math.floor(Math.random()*a.length)];
const shuf=a=>a.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
const norm=s=>String(s==null?'':s).trim();
const id=()=>crypto.randomBytes(6).toString('hex');
const mk=()=>{let c;do c=Array.from({length:4},()=>rnd([...'ABCDEFGHJKMNPQRSTUVWXYZ'])).join('');while(R[c]);return c};
const okp=(r,p)=>{const m={role:p.rd,vote:p.vt!=null,funny:p.fv!=null};return !p.on||(m[r.ph]!==undefined?m[r.ph]:true)};
const ranks=r=>Object.fromEntries(r.ps.map(p=>[p.id,1+r.ps.filter(q=>q.sc>p.sc).length]));
const add=(r,p,pts,why)=>{if(!p)return;p.sc+=pts;p.gain+=pts;r.why.push({id:p.id,pts,why})};

function view(r,p){
  const late=['reveal','guess','funny','recap','final'].includes(r.ph);
  const word=['funny','recap','final'].includes(r.ph)||(r.ph==='guess'&&r.gs!=null);
  return{code:r.code,me:p.id,host:r.host,ph:r.ph,r:r.r,end:r.end,now:Date.now(),prev:r.prev,vt:p.vt,fv:p.fv,ord:r.order,ti:r.ti,cfg:r.cfg,
    ps:r.ps.map(x=>({id:x.id,n:x.n,a:x.a,sc:x.sc,g:x.gain,on:x.on,ok:okp(r,x)})),
    sec:r.ph==='lobby'?null:p.id===r.imp?{imp:1,word:r.iword}:{word:r.word},
    ...(late?{imp:r.imp,cnt:r.cnt,tops:r.tops,caught:r.caught,vl:r.vl,why:r.why,gs:r.gs,gok:r.ok}:{}),
    ...(word?{word:r.word,iword:r.iword}:{})};
}
const send=r=>r.ps.forEach(p=>p.sock&&p.sock.emit('state',view(r,p)));
function gallery(r){r.gal=(r.order||[]).map(i=>{const p=r.ps.find(x=>x.id===i);return{id:i,dr:p&&p.dr!=null?p.dr:null}});io.to(r.code).emit('gal',r.gal)}

function tally(r){
  const c={};r.ps.forEach(p=>c[p.id]=0);r.ps.forEach(p=>{if(c[p.vt]!=null)c[p.vt]++});
  const mx=Math.max(...Object.values(c));r.cnt=c;r.tops=Object.keys(c).filter(k=>c[k]===mx);
  r.caught=r.tops.length===1&&r.tops[0]===r.imp&&mx>0;
  r.vl=r.ps.filter(p=>c[p.vt]!=null).map(p=>({f:p.id,t:p.vt}));
  if(r.caught)r.ps.forEach(p=>{if(p.id!==r.imp&&p.vt===r.imp)add(r,p,100,'Spotted the Impostor')});
  else add(r,r.ps.find(p=>p.id===r.imp),200,'The Impostor escaped');
}
function funny(r){
  const c={};r.ps.forEach(p=>c[p.id]=0);r.ps.forEach(p=>{if(c[p.fv]!=null)c[p.fv]++});
  const mx=Math.max(...Object.values(c));
  if(mx>0)r.ps.forEach(p=>{if(c[p.id]===mx)add(r,p,50,`Funniest entry (${mx} vote${mx>1?'s':''})`)});
}
function setPh(r,ph){
  clearTimeout(r.t);r.ph=ph;r.end=0;
  if(ph==='draw'){r.ti=0;turn(r);gallery(r)}
  if(ph==='discuss'){gallery(r);r.end=Date.now()+r.cfg.disc*1000;r.t=setTimeout(()=>{if(r.ph==='discuss')go(r,'vote')},r.cfg.disc*1000)}
  if(ph==='vote'){r.end=Date.now()+r.cfg.vote*1000;r.t=setTimeout(()=>{if(r.ph==='vote'){r.ps.forEach(p=>{if(p.vt==null)p.vt=-1});go(r,'reveal')}},r.cfg.vote*1000)}
  if(ph==='reveal')tally(r);
  if(ph==='recap')funny(r);
}
function turn(r){
  clearTimeout(r.t);
  while(r.ti<r.order.length){const p=r.ps.find(x=>x.id===r.order[r.ti]);if(p&&p.on)break;if(p&&p.dr==null)p.dr='';r.ti++}
  if(r.ti>=r.order.length){setPh(r,'discuss');return}
  const i=r.ti;r.end=Date.now()+r.cfg.draw*1000;
  r.t=setTimeout(()=>endTurn(r,i),r.cfg.draw*1000+3000);
}
function endTurn(r,i){
  if(r.ph!=='draw'||r.ti!==i)return;
  const p=r.ps.find(x=>x.id===r.order[i]);if(p&&p.dr==null)p.dr='';
  r.ti++;turn(r);gallery(r);send(r);
}
const go=(r,ph)=>{setPh(r,ph);send(r)};
function check(r){
  if(NEXT[r.ph]&&r.ps.some(p=>p.on)&&r.ps.every(p=>okp(r,p))){go(r,NEXT[r.ph]);return true}
  return false;
}
const upd=r=>{if(!check(r))send(r)};
function round(r){
  r.q=r.q.filter(i=>r.ps.some(p=>p.id===i&&p.on));
  if(!r.q.length)r.q=shuf(r.ps.filter(p=>p.on).map(p=>p.id));
  r.imp=r.q.pop();r.order=r.ps.filter(p=>p.on).map(p=>p.id);
  const cats=Object.keys(WORDS);r.cat=rnd(cats);r.icat=rnd(cats.filter(c=>c!==r.cat));
  const pick=c=>{const pool=WORDS[c].filter(w=>!r.used.includes(w));return rnd(pool.length?pool:WORDS[c])};
  r.word=pick(r.cat);r.iword=pick(r.icat);r.used.push(r.word,r.iword);
  r.prev=ranks(r);r.why=[];r.gs=null;r.ok=null;r.cnt=null;r.caught=false;r.ti=0;
  r.ps.forEach(p=>{p.dr=null;p.vt=null;p.fv=null;p.rd=0;p.gain=0});
  setPh(r,'role');
}

io.on('connection',s=>{
  s.data={};
  const me=()=>{const r=R[s.data.code];const p=r&&r.ps.find(x=>x.id===s.data.id);return p?{r,p}:null};
  const np=(r,d)=>{
    const n=norm(d.name).slice(0,14);
    if(!n){s.emit('err','Enter a name first.');return null}
    if(r.ps.some(x=>x.n.toLowerCase()===n.toLowerCase())){s.emit('err','That name is taken in this room.');return null}
    const a=AV.includes(d.av)&&!r.ps.some(x=>x.a===d.av)?d.av:AV.find(x=>!r.ps.some(y=>y.a===x));
    const p={id:id(),tok:id()+id(),n,a,sc:0,gain:0,on:false,sock:null,rd:0,dr:null,vt:null,fv:null};
    r.ps.push(p);return p;
  };
  const join=(r,p)=>{
    p.sock=s;p.on=true;s.data={code:r.code,id:p.id};s.join(r.code);
    if(!r.ps.some(x=>x.id===r.host&&x.on))r.host=p.id;
    s.emit('me',{tok:p.tok,code:r.code,id:p.id});
    s.emit('chatlog',r.chat);
    if(r.gal&&['draw','discuss','vote','reveal','guess','funny','recap','final'].includes(r.ph))s.emit('gal',r.gal);
    send(r);
  };
  s.on('create',d=>{
    d=d||{};const r={code:mk(),ps:[],ph:'lobby',r:0,q:[],used:[],why:[],chat:[],order:[],ti:0,cfg:{draw:45,disc:90,vote:45}};
    const p=np(r,d);if(!p)return;R[r.code]=r;r.host=p.id;join(r,p);
  });
  s.on('join',d=>{
    d=d||{};const r=R[norm(d.code).toUpperCase()];
    if(!r)return s.emit('err','Room not found. Check the code.');
    let p=d.tok&&r.ps.find(x=>x.tok===d.tok);
    if(!p){
      if(r.ph!=='lobby')return s.emit('err','That game has already started.');
      if(r.ps.length>=8)return s.emit('err','That room is full (8 players).');
      p=np(r,d);if(!p)return;
    }
    join(r,p);
  });
  s.on('act',(t,d)=>{
    const m=me();if(!m)return;const{r,p}=m,host=r.host===p.id;
    switch(t){
      case'start':if(host&&r.ph==='lobby'&&r.ps.filter(x=>x.on).length>=2){r.ps=r.ps.filter(x=>x.on);r.r=0;r.q=[];r.used=[];r.chat=[];io.to(r.code).emit('chatlog',[]);r.ps.forEach(x=>x.sc=0);round(r);send(r)}break;
      case'ready':if(r.ph==='role'){p.rd=1;upd(r)}break;
      case'cfg':if(host&&r.ph==='lobby'&&d&&CFG_OK[d.k]&&CFG_OK[d.k].includes(+d.v)){r.cfg[d.k]=+d.v;send(r)}break;
      case'draw':if(r.ph==='draw'&&r.order[r.ti]===p.id&&p.dr==null){p.dr=typeof d==='string'&&d.length<300000&&/^data:image\/jpeg;base64,[A-Za-z0-9+\/=]+$/.test(d)?d:'';r.ti++;turn(r);gallery(r);send(r)}break;
      case'skip':if(host&&r.ph==='draw')endTurn(r,r.ti);break;
      case'vote':if(r.ph==='vote'&&p.vt==null&&d!==p.id&&r.ps.some(x=>x.id===d)){p.vt=d;upd(r)}break;
      case'fvote':if(r.ph==='funny'&&p.fv==null&&d!==p.id&&r.ps.some(x=>x.id===d)){p.fv=d;upd(r)}break;
      case'guess':if(r.ph==='guess'&&p.id===r.imp&&r.gs==null){const g=norm(d).slice(0,30);if(!g)return s.emit('err','Type a guess first.');r.gs=g;r.ok=g.toLowerCase()===r.word;if(r.ok)add(r,p,150,'Guessed the secret word');send(r)}break;
      case'next':if(!host)break;
        if(r.ph==='discuss')go(r,'vote');
        else if(r.ph==='reveal')go(r,r.caught?'guess':'funny');
        else if(r.ph==='guess'&&r.gs!=null)go(r,'funny');
        else if(r.ph==='recap'){if(r.r>=2)go(r,'final');else{r.r++;round(r);send(r)}}
        break;
      case'force':if(host&&NEXT[r.ph]){r.ps.forEach(x=>{if(!okp(r,x)){x.rd=1;if(r.ph==='vote')x.vt=-1;if(r.ph==='funny')x.fv=-1}});upd(r)}break;
      case'again':if(host&&r.ph==='final'){r.r=0;r.used=[];r.q=[];r.ps=r.ps.filter(x=>x.on);r.ps.forEach(x=>x.sc=0);round(r);send(r)}break;
      case'lobby':if(host&&r.ph==='final'){r.ps=r.ps.filter(x=>x.on);setPh(r,'lobby');send(r)}break;
    }
  });
  s.on('chat',(d,cb)=>{
    const ack=x=>typeof cb==='function'&&cb(x),m=me();
    if(!m)return ack({err:'Join a room first.'});
    const{r,p}=m;d=d||{};
    if(['vote','guess','funny'].includes(r.ph))return ack({err:'Chat is paused while voting.'});
    const x=String(d.x==null?'':d.x).replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,200),now=Date.now();
    if(!x)return ack({err:'Type a message first.'});
    if(d.cid&&p.cid===d.cid)return ack({ok:1});
    if(now-(p.lc||0)<700)return ack({err:'Slow down a little.'});
    if(p.lx===x&&now-p.lc<3000)return ack({ok:1});
    p.lc=now;p.cid=d.cid;p.lx=x;
    const msg={id:id(),f:p.id,n:p.n,a:p.a,t:now,x};r.chat.push(msg);if(r.chat.length>100)r.chat.shift();
    io.to(r.code).emit('chat',msg);ack({ok:1});
  });
  s.on('disconnect',()=>{
    const m=me();if(!m)return;const{r,p}=m;if(p.sock!==s)return;
    p.on=false;p.sock=null;
    if(r.host===p.id){const n=r.ps.find(x=>x.on);if(n)r.host=n.id}
    if(r.ph==='lobby')setTimeout(()=>{if(!p.on&&r.ph==='lobby'){r.ps=r.ps.filter(x=>x!==p);if(!r.ps.length)delete R[r.code];else send(r)}},15000);
    setTimeout(()=>{if(R[r.code]&&!r.ps.some(x=>x.on)){clearTimeout(r.t);delete R[r.code]}},600000);
    if(r.ph==='draw'&&r.order[r.ti]===p.id)endTurn(r,r.ti);
    upd(r);
  });
});
srv.listen(process.env.PORT||3000,()=>console.log('Listening on '+(process.env.PORT||3000)));
