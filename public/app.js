function home(){return `<section class="hero"><span class="dd" style="top:-6px;left:46%">?</span><span class="dd" style="bottom:4px;left:4%;animation-delay:-2s">✶</span>
<div><p class="mark">Suspects &amp; Storytellers</p><span class="sticker">Scribble &amp; Bluff</span>
<h1>Draw like an innocent. Bluff like a pro.</h1><p>Everyone knows the secret word… except the Impostor.</p>
<div class="cta"><button class="btn" data-a="mk">Create a Game</button><button class="btn w" data-a="jn">Join a Room</button></div>
<div class="chips"><span class="chip">Turn-by-turn drawing</span><span class="chip">Secret roles</span><span class="chip">Catch the bluffer</span></div>
<span class="badge">2 to 8 players, each on their own phone, 3 rounds</span></div>
<div class="art"><svg viewBox="0 0 420 380" role="img" aria-label="A detective doodle peeking over a sketchpad"><g transform="rotate(-6 210 190)"><rect x="30" y="50" width="300" height="230" rx="14" fill="#FFF9F0" stroke="#26213D" stroke-width="5"/><path d="M62 150c40-60 70 50 110 0s60-40 100 10" fill="none" stroke="#FF6B6B" stroke-width="8" stroke-linecap="round"/><circle cx="110" cy="100" r="16" fill="#FFD166" stroke="#26213D" stroke-width="4"/><path d="M200 220l30-50 30 50z" fill="#52D6A1" stroke="#26213D" stroke-width="4" stroke-linejoin="round"/></g>
<g stroke="#26213D" stroke-width="5" stroke-linejoin="round"><circle cx="290" cy="270" r="68" fill="#FFD166"/><path d="M214 246c6-14 24-18 76-18s70 4 76 18z" fill="#211747"/><path d="M240 232c4-44 18-60 50-60s46 16 50 60z" fill="#211747"/><rect x="240" y="216" width="100" height="14" fill="#FF6B6B"/><circle cx="268" cy="268" r="13" fill="#fff"/><circle cx="314" cy="268" r="13" fill="#fff"/><path d="M270 308q20 14 40 0" fill="none" stroke-linecap="round"/></g><circle cx="272" cy="270" r="5" fill="#26213D"/><circle cx="318" cy="270" r="5" fill="#26213D"/>
<g stroke="#26213D" stroke-width="6" stroke-linecap="round"><circle cx="360" cy="190" r="26" fill="rgba(86,184,255,.5)"/><path d="M342 210l-22 28"/></g>
<g><path d="M20 20h150a14 14 0 0 1 14 14v40a14 14 0 0 1-14 14h-100l-24 22 4-22h-30a14 14 0 0 1-14-14V34a14 14 0 0 1 14-14z" fill="#fff" stroke="#26213D" stroke-width="4"/><text x="95" y="62" text-anchor="middle" font-family="Bagel Fat One,Trebuchet MS,sans-serif" font-size="22" fill="#26213D">It wasn’t me!</text></g></svg></div></section>
<section class="sheet how"><h2>How to play</h2><ol><li>Everyone sees their role privately on their own screen. One person is the Impostor and only gets the category.</li><li>Take turns drawing your own secret word. Everyone except the Impostor has the same word. The Impostor gets a different one.</li><li>Look at the gallery, talk it out, and vote for who you think is bluffing.</li><li>Impostor caught? They get one guess at the word. Then vote for the funniest entry.</li></ol></section>`}

const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const COL=['#FF6B6B','#FFD166','#52D6A1','#56B8FF','#C9A8FF','#FF9F5A','#7EE0E0','#FF8FC8'];
const INK=['#26213D','#FF6B6B','#7047EB','#56B8FF','#52D6A1','#E89B00','#8B5A2B','#FF8FC8'];
const AV=['🦊','🐙','🦄','🐸','🐼','🦖','🐱','🐵','👻','🤖','🐧','🦉'];
const PH={lobby:'Lobby',role:'Secret roles',draw:'Drawing',discuss:'Discussion',vote:'Secret vote',reveal:'Vote reveal',guess:'Final guess',funny:'Funniest entry',recap:'Recap',final:'Final results'};
let V=null,GAL=[],off=0,U={av:0,v:'home'},T=0,snd=0;
const ls=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);v===null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){}return null};
const act=(t,d)=>sock.emit('act',t,d);
const pl=i=>V.ps.find(p=>p.id===i)||{n:'?',a:'👤',sc:0};
const av=(i,s=56)=>`<span class="av" style="--s:${s}px;background:${COL[Math.max(0,V.ps.findIndex(p=>p.id===i))%8]}">${pl(i).a}</span>`;
const nm=i=>esc(pl(i).n),host=()=>V.host===V.me,me=()=>pl(V.me),imp=()=>V.sec&&V.sec.imp;
const g=i=>GAL.find(x=>x.id===i)||{};
const fmt=n=>`${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;
const left=()=>Math.max(0,Math.ceil((V.end-(Date.now()+off))/1000));
const CH=[];let unread=0;
function toast(m){const t=document.createElement('div');t.className='toast';t.setAttribute('role','status');t.textContent=m;document.body.append(t);setTimeout(()=>t.remove(),2600)}
function beep(f=660,d=.12){if(!snd)return;try{const a=beep.a||(beep.a=new AudioContext()),o=a.createOscillator(),k=a.createGain();o.frequency.value=f;k.gain.value=.05;o.connect(k);k.connect(a.destination);o.start();o.stop(a.currentTime+d)}catch(e){}}
function confetti(){if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;const c=document.createElement('div');c.className='conf';c.setAttribute('aria-hidden','true');for(let k=0;k<70;k++){const s=document.createElement('i');s.style.cssText=`left:${Math.random()*100}%;background:${COL[k%8]};animation-delay:${Math.random()*.8}s;animation-duration:${2+Math.random()*1.5}s`;c.append(s)}document.body.append(c);setTimeout(()=>c.remove(),4500)}

const wait=()=>{const w=V.ps.filter(p=>p.on&&!p.ok);return w.length?`<div class="sheet"><p>Waiting for ${w.map(p=>esc(p.n)).join(', ')}…</p>${host()?'<button class="btn s b" data-a="force">Skip waiting</button>':''}</div>`:''};
const sec=()=>`<div class="sheet sec"><span id="sec">Secret hidden</span><button class="btn b s" type="button" data-a="peek">Peek</button></div>`;
const ent=j=>g(j).dr?`<img src="${esc(g(j).dr)}" alt="Drawing by ${nm(j)}">`:`<div class="nodraw">${g(j).dr===null?'Not drawn yet':'No drawing'}</div>`;
const capt=j=>`${av(j,36)}<b>${nm(j)}</b>`;
const hostBtn=(a,t)=>host()?`<button class="btn" data-a="${a}">${t}</button>`:'<p>Waiting for the host to continue…</p>';

function entry(){const j=U.mode==='join';return `<form class="sheet" id="ef" novalidate style="max-width:520px;margin:auto"><h2>${j?'Join a room':'Create a game'}</h2><label for="en">Your name</label><input id="en" maxlength="14" autocomplete="off" placeholder="Type a name">${j?`<label for="ec">Room code</label><input id="ec" maxlength="4" autocapitalize="characters" autocomplete="off" value="${esc(U.code||'')}" placeholder="ABCD">`:''}<label id="al">Pick an avatar</label><div class="avs" role="group" aria-labelledby="al">${AV.map((a,k)=>`<button type="button" class="avb" data-a="pa" data-v="${k}" aria-pressed="${k===U.av}" aria-label="Avatar ${a}">${a}</button>`).join('')}</div><div class="err" id="ee" role="alert"></div><button class="btn m">${j?'Join room':'Create room'}</button> <button type="button" class="btn w" data-a="home">Back</button></form>`}

function lobby(){const n=V.ps.filter(p=>p.on).length;
  const row=(k,l,o)=>`<div class="cfgr"><label for="c-${k}">${l}</label>${host()?`<select id="c-${k}" data-cfg="${k}">${o.map(v=>`<option value="${v}" ${V.cfg[k]===v?'selected':''}>${v} s</option>`).join('')}</select>`:`<b>${V.cfg[k]} s</b>`}</div>`;
  return `<div class="lob"><section class="sheet"><h2>Room ${V.code}</h2><p>Share the code or the invite link. Friends anywhere can join from their own phone.</p><div class="room"><b>${V.code}</b><button class="btn s w" data-a="copy">Copy invite link</button></div><h3>Game settings${host()?'':' (set by host)'}</h3>${row('draw','Drawing time per turn',[20,30,45,60,90])}${row('disc','Discussion time',[30,60,90,120,180,300])}${row('vote','Voting time',[20,30,45,60])}<br>${host()?`<button class="btn" data-a="start" ${n<2?'disabled':''}>${n<2?'Waiting for a second player':'Start the game'}</button>`:'<p>You’re in. The host will start the game.</p>'}</section><section class="sheet"><h2>Suspects (${V.ps.length} of 8)</h2>${V.ps.map(p=>`<div class="pl ${p.on?'':'off'}" style="--bg:${COL[V.ps.indexOf(p)%8]}">${av(p.id,48)}<b>${esc(p.n)}${p.id===V.host?' 👑':''}</b>${p.on?'':'<small>offline</small>'}</div>`).join('')}</section></div>`}

const role=()=>me().ok?`<div class="sheet pass"><h2>Role hidden</h2><p>Waiting for everyone to see their role.</p></div>${wait()}`:`<div class="rcard ${imp()?'imp':'inn'}">${av(V.me,90)}<h2>${imp()?'🕵️ You are the Impostor':'You are innocent'}</h2><p>Your secret word is</p><div class="big">${esc(V.sec.word)}</div>${imp()?'<p>Everyone else has a different word. Work out what they’re drawing and blend in.</p>':'<p>Everyone except one Impostor has this same word. The Impostor has a different one.</p>'}<button class="btn ${imp()?'':'w'}" data-a="ready">Hide &amp; I’m ready</button></div>`;

const draw=()=>{const cur=V.ord[V.ti],mine=cur===V.me,n=V.ord.length;
  const head=`<div class="sheet hd" id="hd"><div class="hd">${av(cur,52)}<div><b>${mine?'Your turn to draw':nm(cur)+' is drawing'}</b><br><small>${V.ti} of ${n} players finished</small></div></div><span id="tn">${left()}</span></div><div class="bar" id="bar"><i style="width:100%"></i></div><div class="order" aria-label="Turn order">${V.ord.map((id,k)=>`<span class="oc ${k===V.ti?'now':k<V.ti?'done':''}" title="${esc(pl(id).n)}">${av(id,30)}</span>`).join('')}</div>`;
  if(mine)return head+`<div class="paper"><canvas id="cv" width="900" height="560" aria-label="Drawing canvas"></canvas><div class="stamp" id="stamp">Time’s up!</div></div><div class="sheet tools"><button class="btn s w on" data-a="tool" data-v="pen">Pen</button><button class="btn s w" data-a="tool" data-v="er">Eraser</button>${INK.map((c,k)=>`<button class="sw ${k?'':'on'}" style="background:${c}" data-a="col" data-v="${k}" aria-label="Ink ${k+1}"></button>`).join('')}<label for="bs" style="margin:0">Size</label><input id="bs" type="range" min="2" max="28" value="6"><button class="btn s w" data-a="undo">Undo</button><button class="btn s c" data-a="clr">Clear</button></div>${sec()}<button class="btn m" data-a="save">Submit drawing</button>`;
  return head+`<div class="sheet pass"><p>Waiting for <b>${nm(cur)}</b> to finish. Their drawing appears here when they submit.</p>${host()?'<button class="btn s b" data-a="skip">Skip this turn</button>':''}</div>${sec()}<div class="gal">${V.ord.slice(0,V.ti).map(id=>`<figure class="ent">${ent(id)}<figcaption>${capt(id)}</figcaption></figure>`).join('')}</div>`};

const discuss=()=>`<div class="sheet hd"><div><h2>Discussion time</h2><p>Compare the drawings and use the chat. Who drew the odd one out?</p></div><span id="tn" style="font-size:2rem">${fmt(left())}</span></div>${sec()}<div class="gal">${V.ord.map(id=>`<figure class="ent">${ent(id)}<figcaption>${capt(id)}</figcaption></figure>`).join('')}</div>${hostBtn('next','Start voting now')}`;

const vote=()=>`<div class="sheet hd"><div><h2>${me().ok?'Vote locked in':'Who’s the Impostor?'}</h2><p>Votes stay secret until everyone has voted or time runs out.</p></div><span id="tn" style="font-size:2rem">${fmt(left())}</span></div><div class="status">${V.ps.map(p=>`<span class="oc ${p.ok?'done':''}" title="${esc(p.n)}">${av(p.id,30)}<i>${p.ok?'✓':'…'}</i></span>`).join('')}</div>${me().ok?'':`<div class="grid">${V.ps.filter(p=>p.id!==V.me).map(p=>`<button class="tile" style="--bg:${COL[V.ps.indexOf(p)%8]}" data-a="cast" data-v="${p.id}">${av(p.id,70)}${esc(p.n)}</button>`).join('')}</div>`}`;

function reveal(){const k=U.rv||0,L=V.vl.length,done=k>=L,sh=V.vl.slice(0,k);
  return `<div class="sheet"><h2>The votes are in</h2><div class="grid" style="margin-top:14px">${V.ps.map(p=>`<div class="tile ${done&&V.tops.includes(p.id)?'top':''}" style="--bg:${COL[V.ps.indexOf(p)%8]};transform:none">${av(p.id,60)}${esc(p.n)}<span class="n">${sh.filter(v=>v.t===p.id).length}</span></div>`).join('')}</div><ul class="vlist">${sh.map(v=>`<li>${av(v.f,30)}<span>${nm(v.f)} voted for <b>${nm(v.t)}</b></span></li>`).join('')}</ul>${done?'':'<button class="btn s b" data-a="skip">Skip reveal</button>'}</div>${done?`<div class="verdict ${V.caught?'ok':'no'}"><h2>${V.caught?'Caught!':'Escaped!'}</h2><p>${nm(V.imp)} was the Impostor.${!V.caught&&V.tops.length>1?' A tie means the Impostor walks free.':''}</p>${hostBtn('next',V.caught?'Impostor’s last guess':'Funniest entry vote')}</div>`:''}`}

function guess(){
  if(V.gs==null)return imp()?`<form class="sheet" id="gf" novalidate><h2>You were caught!</h2><p>One shot: what was everyone else drawing?</p><label for="gw">Your guess</label><input id="gw" maxlength="30" autocomplete="off"><div class="err" id="ge" role="alert"></div><button class="btn m">Lock in guess</button></form>`:`<div class="sheet pass"><h2>The Impostor gets one guess</h2><p>${nm(V.imp)} is guessing the word you all had…</p></div>`;
  return `<div class="verdict ${V.gok?'ok':'no'}"><h2>${V.gok?'Nailed it!':'Not quite'}</h2><p>${nm(V.imp)} guessed “${esc(V.gs)}”. The group word was <b>${esc(V.word)}</b>. The Impostor’s word was <b>${esc(V.iword)}</b>.${V.gok?' That’s 150 bonus points.':''}</p>${hostBtn('next','Funniest entry vote')}</div>`}

const funny=()=>me().ok?`<div class="sheet pass"><h2>Vote locked in</h2></div>${wait()}`:`<div class="sheet"><h2>Which entry made you laugh?</h2><p>Not your own.</p></div><div class="gal">${V.ps.filter(p=>p.id!==V.me).map(p=>`<button class="ent pick" data-a="fv" data-v="${p.id}" aria-label="Pick ${nm(p.id)}’s entry">${ent(p.id)}<span class="cap">${capt(p.id)}</span></button>`).join('')}</div>`;

const lb=()=>{const r={};V.ps.forEach(p=>r[p.id]=1+V.ps.filter(q=>q.sc>p.sc).length);return `<div class="lb">${[...V.ps].sort((a,b)=>b.sc-a.sc).map(p=>{const d=V.prev&&V.prev[p.id]?V.prev[p.id]-r[p.id]:0;return `<div class="row" style="--bg:${COL[V.ps.indexOf(p)%8]}"><span class="r">${r[p.id]}</span>${av(p.id,40)}<b>${esc(p.n)}${r[p.id]===1?' 👑':''}</b>${d?`<span class="${d>0?'up':'dn'}">${d>0?'▲':'▼'}${Math.abs(d)}</span>`:''}<span class="sc">${p.sc}</span></div>`}).join('')}</div>`};

const recap=()=>`<div class="sheet"><h2>Round ${V.r+1} of 3 recap</h2><p>Everyone’s word was <b>${esc(V.word)}</b>. ${nm(V.imp)} was the Impostor with <b>${esc(V.iword)}</b> and ${V.caught?'got caught':'escaped'}.</p>${V.why.map((w,k)=>`<div class="gain">${av(w.id,34)}<b>${nm(w.id)}</b><span class="pts" style="animation-delay:${k*.12}s">+${w.pts}</span><span>${esc(w.why)}</span></div>`).join('')}</div><div class="sheet"><h2>Leaderboard</h2>${lb()}</div>${hostBtn('next',V.r>=2?'See final results':'Start next round')}`;

function final(){const mx=Math.max(...V.ps.map(p=>p.sc)),w=V.ps.filter(p=>p.sc===mx);
  return `<div class="sheet winner"><h2>${w.length>1?'It’s a tie!':'We have a winner!'}</h2><div style="display:flex;gap:14px;justify-content:center;margin:16px 0;flex-wrap:wrap">${w.map(p=>`<div>${av(p.id,w.length>1?80:120)}<h3>${esc(p.n)}</h3></div>`).join('')}</div><p>${mx} points after 3 rounds.</p>${lb()}${host()?'<div class="cta" style="justify-content:center"><button class="btn m" data-a="again">Play again</button><button class="btn w" data-a="lobby">Back to lobby</button></div>':'<p>Waiting for the host to pick what’s next.</p>'}</div>`}

function chatLock(){const lk=!V||!sock.connected||['vote','guess','funny'].includes(V.ph),i=$('#ci');i.disabled=lk;$('#chf button').disabled=lk;i.placeholder=!V||!sock.connected?'Reconnecting…':lk?'Chat is paused while voting':'Type a message'}
function render(){
  const app=$('#app'),pill=$('#pill');
  if(!V){clearInterval(T);app.innerHTML=U.v==='ent'?entry():home();pill.hidden=true;$('#cb').hidden=$('#cp').hidden=true;return}
  const typing=(V.ph==='draw'&&V.ord[V.ti]===V.me)||(V.ph==='guess'&&imp()&&V.gs==null);
  const key=V.ph+V.r+V.ti+(V.gs!=null?1:0)+(me().ok?1:0);
  if(typing&&U.key===key)return;
  const fresh=U.key!==key;U.key=key;clearInterval(T);
  app.innerHTML=({lobby,role,draw,discuss,vote,reveal,guess,funny,recap,final})[V.ph]();
  pill.hidden=false;pill.textContent=V.ph==='lobby'?`Room ${V.code}`:`Round ${V.r+1} of 3: ${PH[V.ph]}`;
  $('#cb').hidden=false;chatLock();
  if(V.ph==='draw'){const mine=V.ord[V.ti]===V.me;if(mine)initCanvas();
    T=setInterval(()=>{const f=Math.max(0,(V.end-(Date.now()+off))/1000),l=Math.ceil(f),t=$('#tn');if(!t)return;t.textContent=l;$('#bar i').style.width=f/V.cfg.draw*100+'%';$('#bar').classList.toggle('hot',f<=10);$('#hd').classList.toggle('hot',f<=10);
      if(l<=5&&l>0&&l!==U.lt){U.lt=l;beep(520)}
      if(f<=0){clearInterval(T);beep(200,.4);if(mine){const st=$('#stamp');st&&st.classList.add('on');setTimeout(sendDraw,600)}}},200)}
  if(V.ph==='discuss'||V.ph==='vote')T=setInterval(()=>{const t=$('#tn');if(t)t.textContent=fmt(left())},500);
  if(V.ph==='discuss'&&fresh&&innerWidth>=900&&$('#cp').hidden)A.chat();
  if(V.ph==='reveal'){const k=U.rv||0;if(k<V.vl.length)T=setTimeout(()=>{U.rv=k+1;beep(450+k*60);render()},900);else if(!U.cf){U.cf=1;if(V.caught)confetti()}}
  if(V.ph==='final'&&fresh)confetti();
  const f=$('#gw');if(f)f.focus();
  if(fresh)scrollTo(0,0);
}
function initCanvas(){
  const c=$('#cv'),x=c.getContext('2d');U.col=INK[0];U.sz=6;U.er=0;U.st=[];x.lineCap=x.lineJoin='round';
  const seg=(s,a,b)=>{x.strokeStyle=s.e?'#FFFDF7':s.c;x.lineWidth=s.e?s.w*2.5:s.w;x.beginPath();x.moveTo(...a);x.lineTo(...b);x.stroke()};
  U.paint=()=>{x.fillStyle='#FFFDF7';x.fillRect(0,0,900,560);U.st.forEach(s=>s.p.forEach((q,i)=>seg(s,i?s.p[i-1]:q,i?q:[q[0]+.01,q[1]])))};U.paint();
  let cur=null;const pt=e=>{const r=c.getBoundingClientRect();return[(e.clientX-r.left)*900/r.width,(e.clientY-r.top)*560/r.height]};
  c.onpointerdown=e=>{c.setPointerCapture(e.pointerId);const p=pt(e);cur={c:U.col,w:U.sz,e:U.er,p:[p]};U.st.push(cur);seg(cur,p,[p[0]+.01,p[1]])};
  c.onpointermove=e=>{if(!cur)return;const p=pt(e);seg(cur,cur.p[cur.p.length-1],p);cur.p.push(p)};
  c.onpointerup=c.onpointercancel=()=>cur=null;
}
function sendDraw(){
  const c=$('#cv');if(U.sent||!c||V.ph!=='draw'||V.ord[V.ti]!==V.me)return;U.sent=1;
  const o=document.createElement('canvas');o.width=450;o.height=280;o.getContext('2d').drawImage(c,0,0,450,280);
  act('draw',o.toDataURL('image/jpeg',.6));
}
const mark=(sel,b)=>{document.querySelectorAll(sel).forEach(e=>e.classList.remove('on'));b.classList.add('on')};
const A={
  home(){U.v='home';render()},
  mk(){U.v='ent';U.mode='create';render()},
  jn(){U.v='ent';U.mode='join';render()},
  pa(v,b){U.av=+v;document.querySelectorAll('.avb').forEach(e=>e.setAttribute('aria-pressed',e===b))},
  snd(){snd=!snd;const b=$('#snd');b.textContent=snd?'🔊':'🔇';b.setAttribute('aria-label',snd?'Sound on':'Sound off');beep(700)},
  copy(){const u=location.origin+location.pathname+'?room='+V.code;const p=navigator.clipboard&&navigator.clipboard.writeText(u);p?p.then(()=>toast('Invite link copied')).catch(()=>toast('Copy blocked. Code: '+V.code)):toast('Code: '+V.code)},
  start(){act('start')},ready(){act('ready')},force(){act('force')},next(){act('next')},again(){act('again')},lobby(){act('lobby')},
  tool(v,b){U.er=v==='er'?1:0;mark('[data-a=tool]',b)},
  col(v,b){U.col=INK[+v];U.er=0;mark('[data-a=col]',b);mark('[data-a=tool]',$('[data-a=tool][data-v=pen]'))},
  undo(){if(U.st&&U.st.length){U.st.pop();U.paint()}},
  clr(){U.st=[];U.paint();toast('Canvas cleared')},
  save(){sendDraw()},skip(){act('skip')},
  chat(){const p=$('#cp'),o=p.hidden;p.hidden=!o;$('#cb').setAttribute('aria-expanded',o);if(o){unread=0;$('#cn').textContent='';const l=$('#cl');l.scrollTop=l.scrollHeight;$('#ci').focus()}},
  peek(){const s=$('#sec');clearTimeout(A.pt);const hid=()=>{s.textContent='Secret hidden';delete s.dataset.o};
    if(s.dataset.o)return hid();s.dataset.o=1;s.textContent=imp()?`You’re the Impostor. Category: ${V.sec.cat}`:`Your word: ${V.sec.word}`;A.pt=setTimeout(hid,3000)},
  cast(v){act('vote',v)},fv(v){act('fvote',v)},
  skip(){U.rv=V.vl.length;render()}
};
const sub={
  ef(){const n=$('#en').value.trim(),e=$('#ee');if(!n)return e.textContent='Enter a name first.';
    if(U.mode==='join'){const c=$('#ec').value.trim().toUpperCase();if(c.length!==4)return e.textContent='Room codes have 4 letters.';sock.emit('join',{name:n,av:AV[U.av],code:c,tok:ls('sst')})}
    else sock.emit('create',{name:n,av:AV[U.av]})},
  chf(){const i=$('#ci'),x=i.value.trim();if(!x||i.disabled)return;if(!sock.connected)return toast('Offline. Reconnecting…');
    i.value='';sock.emit('chat',{x,cid:Math.random().toString(36).slice(2)},r=>{if(r&&r.err){toast(r.err);if(!i.value)i.value=x}})},
  gf(){const v=$('#gw').value.trim();if(!v)return $('#ge').textContent='Type your guess first.';act('guess',v)}
};
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b&&!b.disabled&&A[b.dataset.a])A[b.dataset.a](b.dataset.v,b)});
document.addEventListener('submit',e=>{e.preventDefault();const f=sub[e.target.id];f&&f()});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.classList.contains('logo')){e.preventDefault();A.home()}});

const sock=io();
sock.on('connect',()=>{const c=ls('ssc'),t=ls('sst');if(c&&t){U.auto=1;sock.emit('join',{code:c,tok:t})}});
sock.on('disconnect',()=>{toast('Connection lost. Reconnecting…');chatLock()});
sock.on('connect',chatLock);
sock.on('me',d=>{U.auto=0;U.pid=d.id;ls('sst',d.tok);ls('ssc',d.code)});
sock.on('err',m=>{if(U.auto){U.auto=0;ls('ssc',null);return}const e=document.querySelector('.err');e?e.textContent=m:toast(m)});
sock.on('gal',d=>{GAL=d;if(V)render()});
sock.on('state',d=>{const o=V;off=d.now-Date.now();if(!o||o.ph!==d.ph||o.r!==d.r||o.ti!==d.ti){U.sent=0;U.rv=0;U.cf=0;U.key=''}V=d;render()});
const q=new URLSearchParams(location.search).get('room');
if(q){U.v='ent';U.mode='join';U.code=q.toUpperCase().slice(0,4)}
render();

function drawMsg(m){const l=$('#cl'),e=l.querySelector('.empty');e&&e.remove();const d=document.createElement('div');d.className='m'+(m.f===U.pid?' me':'');const b=document.createElement('b');b.textContent=m.a+' '+m.n;const t=document.createElement('small');t.textContent=new Date(m.t).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});const p=document.createElement('p');p.textContent=m.x;d.append(b,' ',t,p);l.append(d);l.scrollTop=l.scrollHeight}
sock.on('chatlog',a=>{CH.length=0;$('#cl').innerHTML='<p class="empty">No messages yet. Say hi!</p>';a.forEach(m=>{CH.push(m);drawMsg(m)})});
sock.on('chat',m=>{if(CH.some(x=>x.id===m.id))return;CH.push(m);drawMsg(m);if($('#cp').hidden&&m.f!==U.pid){unread++;$('#cn').textContent=unread}});
document.addEventListener('input',e=>{if(e.target.id==='bs')U.sz=+e.target.value});
document.addEventListener('change',e=>{const k=e.target.dataset&&e.target.dataset.cfg;if(k)act('cfg',{k,v:e.target.value})});
