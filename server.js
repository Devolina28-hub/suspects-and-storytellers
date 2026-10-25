const express=require('express'),http=require('http'),crypto=require('crypto'),{Server}=require('socket.io');
const app=express();app.use(express.static(__dirname+'/public'));
const srv=http.createServer(app),io=new Server(srv,{maxHttpBufferSize:1e6});
const WORDS={Animals:['giraffe','penguin','octopus','kangaroo','owl','crab'],Food:['pizza','sushi','taco','popcorn','pancake','burger'],Places:['lighthouse','airport','castle','beach','library','volcano'],Things:['umbrella','bicycle','guitar','scissors','telescope','backpack'],Jobs:['astronaut','chef','pirate','dentist','farmer','magician']};
const AV=['🦊','🐙','🦄','🐸','🐼','🦖','🐱','🐵','👻','🤖','🐧','🦉'];
const R={},NEXT={role:'draw',draw:'clue',clue:'discuss',vote:'reveal',funny:'recap'};
const rnd=a=>a[Math.floor(Math.random()*a.length)];
const shuf=a=>a.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
const norm=s=>String(s==null?'':s).trim();
const id=()=>crypto.randomBytes(6).toString('hex');
const mk=()=>{let c;do c=Array.from({length:4},()=>rnd([...'ABCDEFGHJKMNPQRSTUVWXYZ'])).join('');while(R[c]);return c};
const okp=(r,p)=>!p.on||({role:p.rd,draw:p.dr!=null,clue:p.cl!=null,vote:p.vt!=null,funny:p.fv!=null}[r.ph]!==undefined?{role:p.rd,draw:p.dr!=null,clue:p.cl!=null,vote:p.vt!=null,funny:p.fv!=null}[r.ph]:true);
const ranks=r=>Object.fromEntries(r.ps.map(p=>[p.id,1+r.ps.filter(q=>q.sc>p.sc).length]));
const add=(r,p,pts,why)=>{if(!p)return;p.sc+=pts;p.gain+=pts;r.why.push({id:p.id,pts,why})};

function view(r,p){
  const late=['reveal','guess','funny','recap','final'].includes(r.ph);
  const word=['funny','recap','final'].includes(r.ph)||(r.ph==='guess'&&r.gs!=null);
  return{code:r.code,me:p.id,host:r.host,ph:r.ph,r:r.r,end:r.end,now:Date.now(),prev:r.prev,vt:p.vt,fv:p.fv,
    ps:r.ps.map(x=>({id:x.id,n:x.n,a:x.a,sc:x.sc,g:x.gain,on:x.on,ok:okp(r,x)})),
    sec:r.ph==='lobby'?null:p.id===r.imp?{imp:1,cat:r.cat}:{cat:r.cat,word:r.word},
    ...(late?{imp:r.imp,cnt:r.cnt,tops:r.tops,caught:r.caught,vl:r.vl,why:r.why,gs:r.gs,gok:r.ok}:{}),
    ...(word?{word:r.word}:{})};
}
const send=r=>r.ps.forEach(p=>p.sock&&p.sock.emit('state',view(r,p)));
function gallery(r){r.gal=r.ps.map(p=>({id:p.id,dr:p.dr||'',cl:p.cl||'…'}));io.to(r.code).emit('gal',r.gal)}

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
  if(ph==='draw'){r.end=Date.now()+30000;r.t=setTimeout(()=>{r.ps.forEach(p=>{if(p.dr==null)p.dr=''});check(r)},34000)}
  if(ph==='discuss'){gallery(r);r.end=Date.now()+60000;r.t=setTimeout(()=>{if(r.ph==='discuss')go(r,'vote')},60000)}
  if(ph==='reveal')tally(r);
  if(ph==='recap')funny(r);
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
  r.imp=r.q.pop();r.cat=rnd(Object.keys(WORDS));
  const pool=WORDS[r.cat].filter(w=>!r.used.includes(w));
  r.word=rnd(pool.length?pool:WORDS[r.cat]);r.used.push(r.word);
  r.prev=ranks(r);r.why=[];r.gs=null;r.ok=null;r.cnt=null;r.caught=false;
  r.ps.forEach(p=>{p.dr=null;p.cl=null;p.vt=null;p.fv=null;p.rd=0;p.gain=0});
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
    const p={id:id(),tok:id()+id(),n,a,sc:0,gain:0,on:false,sock:null,rd:0,dr:null,cl:null,vt:null,fv:null};
    r.ps.push(p);return p;
  };
  const join=(r,p)=>{
    p.sock=s;p.on=true;s.data={code:r.code,id:p.id};s.join(r.code);
    if(!r.ps.some(x=>x.id===r.host&&x.on))r.host=p.id;
    s.emit('me',{tok:p.tok,code:r.code});
    if(r.gal&&['discuss','vote','reveal','guess','funny','recap','final'].includes(r.ph))s.emit('gal',r.gal);
    send(r);
  };
  s.on('create',d=>{
    d=d||{};const r={code:mk(),ps:[],ph:'lobby',r:0,q:[],used:[],why:[]};
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
      case'start':if(host&&r.ph==='lobby'&&r.ps.filter(x=>x.on).length>=2){r.ps=r.ps.filter(x=>x.on);r.r=0;r.q=[];r.used=[];r.ps.forEach(x=>x.sc=0);round(r);send(r)}break;
      case'ready':if(r.ph==='role'){p.rd=1;upd(r)}break;
      case'draw':if(r.ph==='draw'&&p.dr==null){p.dr=typeof d==='string'&&d.length<300000&&/^data:image\/jpeg;base64,[A-Za-z0-9+\/=]+$/.test(d)?d:'';upd(r)}break;
      case'clue':{
        if(r.ph!=='clue'||p.cl!=null)break;const w=norm(d);
        if(!/^[\p{L}\p{N}’'-]{1,20}$/u.test(w)||(p.id!==r.imp&&w.toLowerCase()===r.word))return s.emit('err','Use one word, and don’t give the secret word away.');
        p.cl=w;upd(r);break}
      case'vote':if(r.ph==='vote'&&p.vt==null&&d!==p.id&&r.ps.some(x=>x.id===d)){p.vt=d;upd(r)}break;
      case'fvote':if(r.ph==='funny'&&p.fv==null&&d!==p.id&&r.ps.some(x=>x.id===d)){p.fv=d;upd(r)}break;
      case'guess':if(r.ph==='guess'&&p.id===r.imp&&r.gs==null){const g=norm(d).slice(0,30);if(!g)return s.emit('err','Type a guess first.');r.gs=g;r.ok=g.toLowerCase()===r.word;if(r.ok)add(r,p,150,'Guessed the secret word');send(r)}break;
      case'next':if(!host)break;
        if(r.ph==='discuss')go(r,'vote');
        else if(r.ph==='reveal')go(r,r.caught?'guess':'funny');
        else if(r.ph==='guess'&&r.gs!=null)go(r,'funny');
        else if(r.ph==='recap'){if(r.r>=2)go(r,'final');else{r.r++;round(r);send(r)}}
        break;
      case'force':if(host&&NEXT[r.ph]){r.ps.forEach(x=>{if(!okp(r,x)){x.rd=1;if(r.ph==='draw')x.dr='';if(r.ph==='clue')x.cl='…';if(r.ph==='vote')x.vt=-1;if(r.ph==='funny')x.fv=-1}});upd(r)}break;
      case'again':if(host&&r.ph==='final'){r.r=0;r.used=[];r.q=[];r.ps=r.ps.filter(x=>x.on);r.ps.forEach(x=>x.sc=0);round(r);send(r)}break;
      case'lobby':if(host&&r.ph==='final'){r.ps=r.ps.filter(x=>x.on);setPh(r,'lobby');send(r)}break;
    }
  });
  s.on('disconnect',()=>{
    const m=me();if(!m)return;const{r,p}=m;if(p.sock!==s)return;
    p.on=false;p.sock=null;
    if(r.host===p.id){const n=r.ps.find(x=>x.on);if(n)r.host=n.id}
    if(r.ph==='lobby')setTimeout(()=>{if(!p.on&&r.ph==='lobby'){r.ps=r.ps.filter(x=>x!==p);if(!r.ps.length)delete R[r.code];else send(r)}},15000);
    setTimeout(()=>{if(R[r.code]&&!r.ps.some(x=>x.on)){clearTimeout(r.t);delete R[r.code]}},600000);
    upd(r);
  });
});
srv.listen(process.env.PORT||3000,()=>console.log('Listening on '+(process.env.PORT||3000)));
