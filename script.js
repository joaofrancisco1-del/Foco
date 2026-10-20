const $=s=>document.querySelector(s),pad=n=>String(n).padStart(2,'0');
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const key=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const addD=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const span=(a,n)=>Array.from({length:n},(_,i)=>addD(a,i));
const today=()=>{const t=new Date();t.setHours(0,0,0,0);return t};
const fmt=s=>s>=3600?(s/3600|0)+'h'+pad(s%3600/60|0):Math.round(s/60)+'min';
const sum=o=>Object.values(o).reduce((a,b)=>a+b,0);
const dm=(a,b)=>new Date(a,b+1,0).getDate();
const DOW=['seg','ter','qua','qui','sex','sáb','dom'],BASES=[4,28,45,140,175,215,270,330],SH=[80,70,61,53,46,39,32,25];
const hsl=(h,l)=>`hsl(${h},70%,${l}%)`,K='foco.v1';
let S,view='hoje',sel=key(today()),cm=new Date(today().getFullYear(),today().getMonth(),1),per='sem',adding=false,editing=false,ntErr='',nt={name:'',h:null,l:null};
const DL={on:{kpi:1,donut:1,cmp:1,bars:1,heat:1},f:'ig'};
const SEC=[['kpi','Resumo',1],['donut','Tempo por tag',2],['cmp','Atual x anterior',1.8],['bars','Tempo por dia',1.6],['heat','Dias estudados',2.6]];
const FM={sq:['Quadrado 1:1',1080,1080],ig:['Instagram 4:5',1080,1350],st:['Vertical 9:16',1080,1920]};

function seed(){let r=7;const rnd=()=>(r=r*16807%2147483647)/2147483647;
 const tags=[{id:'t1',name:'Cálculo 1',color:hsl(330,52)},{id:'t2',name:'Estatística',color:hsl(175,46)},{id:'t3',name:'Estrutura de dados',color:hsl(215,53)}];
 const ss=[],notes={};let c=0;
 for(let i=45;i>=1;i--){const d=key(addD(today(),-i));if(rnd()<.3)continue;
  tags.forEach(t=>{if(rnd()<.45)ss.push({id:'s'+c++,tag:t.id,date:d,secs:900+(rnd()*6000|0)})})}
 notes[key(addD(today(),-1))]='Revisei limites e fiz a lista 3. Falta terminar os exercícios de derivada.';
 return{tags,sessions:ss,notes,timer:{tag:null,run:false,start:0,acc:0},demo:true}}
function load(){try{S=JSON.parse(localStorage.getItem(K))}catch(e){}if(!S||!S.tags)S=seed();
 S.timer=Object.assign({tag:null,run:false,start:0,acc:0,mode:'cron',goal:3600},S.timer)}
function save(){try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}}
const T=id=>S.tags.find(t=>t.id==id)||{name:'(tag removida)',color:'#666'};
function idx(){const m={};S.sessions.forEach(s=>{const d=m[s.date]??={};d[s.tag]=(d[s.tag]||0)+s.secs});return m}
function agg(days){const I=idx(),r={};days.forEach(d=>{const x=I[key(d)]||{};for(const k in x)r[k]=(r[k]||0)+x[k]});return r}
const elapsed=()=>S.timer.acc+(S.timer.run?Math.floor((Date.now()-S.timer.start)/1000):0);
const busy=()=>!!(S.timer.run||S.timer.acc);
const shown=()=>{const t=S.timer,e=elapsed();return t.mode=='temp'?Math.max(0,t.goal-e):e};
function rng(p){const t=today(),mon=addD(t,-((t.getDay()+6)%7)),y=t.getFullYear(),mo=t.getMonth();
 return{dia:{c:[t],p:[addD(t,-1)],b:span(addD(t,-6),7),l:['Hoje','Ontem']},sem:{c:span(mon,7),p:span(addD(mon,-7),7),l:['Esta semana','Semana passada']},mes:{c:span(new Date(y,mo,1),dm(y,mo)),p:span(new Date(y,mo-1,1),dm(y,mo-1)),l:['Este mês','Mês passado']}}[p]}

function renderCal(){const I=idx(),y=cm.getFullYear(),mo=cm.getMonth(),off=(cm.getDay()+6)%7,n=new Date(y,mo+1,0).getDate(),tk=key(today());
 let h=DOW.map(d=>`<div class="dow">${d}</div>`).join('')+'<div></div>'.repeat(off);
 for(let i=1;i<=n;i++){const k=y+'-'+pad(mo+1)+'-'+pad(i),e=Object.entries(I[k]||{}).sort((a,b)=>b[1]-a[1]).slice(0,4),c=e.length;
  h+=`<div class="day${k==sel?' sel':''}${k==tk?' today':''}" data-a="day" data-v="${k}"><div class="tiles" style="grid-template-columns:repeat(${Math.min(c,2)||1},1fr)">${e.map(([id],j)=>`<b style="background:${T(id).color}${c==3&&!j?';grid-column:1/-1':''}"></b>`).join('')}</div><span class="n">${i}</span>${S.notes[k]?'<span class="nt"></span>':''}</div>`}
 $('#cal').innerHTML=h;$('#mlabel').textContent=cm.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}

function renderTags(){const bz=busy();
 $('#tags').innerHTML=S.tags.map(t=>`<button class="chip${S.timer.tag==t.id&&!editing?' on':''}${editing?' del':''}" data-a="${editing?'deltag':'tag'}" data-v="${t.id}" style="--c:${t.color}"><i></i>${esc(t.name)}${editing?' ×':''}</button>`).join('')+`<button class="chip add" data-a="add"${bz?' disabled':''}>+ Nova tag</button>`+(S.tags.length?`<button class="chip add" data-a="edit"${bz?' disabled':''}>${editing?'Concluir':'Editar tags'}</button>`:'');
 $('#form').innerHTML=bz?'<p class="mut" style="margin:10px 0 0;font-size:12px">Finalize o cronômetro para criar ou editar tags.</p>':adding?`<div class="form"><input id="tn" placeholder="Nome da tag" maxlength="30" value="${esc(nt.name)}"><span class="mut">Cor</span><div class="sw">${BASES.map(h=>`<i data-a="base" data-v="${h}" class="${nt.h===h?'on':''}" style="background:${hsl(h,55)}"></i>`).join('')}</div>${nt.h!=null?`<span class="mut">Tom</span><div class="sw">${SH.map(l=>`<i data-a="shade" data-v="${l}" class="${nt.l===l?'on':''}" style="background:${hsl(nt.h,l)}"></i>`).join('')}</div>`:''}${ntErr?`<p role="alert" style="margin:0;color:#ff8b8f;font-size:13px">${ntErr}</p>`:''}<button class="pri" data-a="mk">Criar tag</button></div>`:''}

function renderClock(v){const p=[];if(v>=3600)p.push(pad(v/3600|0));p.push(pad(v%3600/60|0),pad(v%60));
 const c=$('#clock');if(c.children.length!=p.length)c.innerHTML=p.map(()=>'<div class="fc"><b></b></div>').join('');
 p.forEach((s,i)=>{const e=c.children[i],b=e.firstChild;if(b.textContent!=s){b.textContent=s;e.classList.remove('fl');void e.offsetWidth;e.classList.add('fl')}})}
function renderTimer(){const t=S.timer,tg=t.tag&&T(t.tag),e=elapsed(),tp=t.mode=='temp';
 renderClock(shown());$('#clock').style.color=tg?tg.color:'';
 $('#go').textContent=t.run?'Pausar':(t.acc?'Continuar':'Iniciar');$('#stop').disabled=!e;
 $('#goal').hidden=!(tp&&!e);
 document.querySelectorAll('[data-a=mode]').forEach(b=>{b.classList.toggle('on',b.dataset.v==t.mode);b.disabled=!!e&&b.dataset.v!=t.mode});
 $('#hint').textContent=tg?(tp?'Meta de '+fmt(t.goal)+' · '+tg.name+' (salva só o tempo feito)':'Estudando '+tg.name+' (registra em hoje)'):'Escolha uma tag para começar'}
function fin(done){const t=S.timer,s=t.mode=='temp'?Math.min(elapsed(),t.goal):elapsed();if(s<1)return;
 S.sessions.push({id:'s'+Date.now(),tag:t.tag,date:key(today()),secs:s});S.timer={...t,run:false,start:0,acc:0};sel=key(today());save();all();
 if(done){navigator.vibrate&&navigator.vibrate([300,150,300]);$('#hint').textContent='Meta concluída! Tempo salvo.'}}

function renderDay(){const ss=S.sessions.filter(s=>s.date==sel);
 $('#dlabel').textContent=new Date(sel+'T00:00').toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})+(ss.length?' · '+fmt(ss.reduce((a,s)=>a+s.secs,0)):'');
 $('#sess').innerHTML=ss.length?ss.map(s=>`<div class="row"><i style="background:${T(s.tag).color}"></i><span>${esc(T(s.tag).name)}</span><em>${fmt(s.secs)}</em><button class="x" data-a="del" data-v="${s.id}" aria-label="Apagar registro">×</button></div>`).join(''):'<p class="mut" style="margin:0">Nenhum registro neste dia.</p>';
 $('#note').value=S.notes[sel]||''}

function renderIns(){
 document.querySelectorAll('[data-a=per]').forEach(b=>b.classList.toggle('on',b.dataset.v==per));
 const R=rng(per),t=today(),y=t.getFullYear(),mo=t.getMonth();
 const B=R.b||R.c,I=idx(),C=agg(R.c),P=agg(R.p),tc=sum(C),tp=sum(P),dias=R.c.filter(d=>sum(I[key(d)]||{})>0).length,dl=tp?Math.round((tc-tp)/tp*100):null;
 const k=(a,b)=>`<div class="card kpi"><span class="mut">${a}</span><b>${b}</b></div>`;
 $('#kpis').innerHTML=k(R.l[0],fmt(tc))+k(R.l[1],fmt(tp))+k('Variação',dl==null?'—':(dl>0?'+':'')+dl+'%')+k('Dias com estudo',dias);
 const ent=Object.entries(C).sort((a,b)=>b[1]-a[1]),Rr=70,Cc=2*Math.PI*Rr;let o=0;
 $('#donut').innerHTML=tc?`<svg viewBox="-100 -100 200 200" width="190">${ent.map(([id,v])=>{const l=v/tc*Cc,s=`<circle r="${Rr}" fill="none" stroke="${T(id).color}" stroke-width="26" stroke-dasharray="${l} ${Cc-l}" stroke-dashoffset="${-o}" transform="rotate(-90)"/>`;o+=l;return s}).join('')}<text text-anchor="middle" y="6" style="fill:var(--tx);font-size:18px;font-weight:600">${fmt(tc)}</text></svg><div class="leg">${ent.map(([id,v])=>`<div class="row"><i style="background:${T(id).color}"></i><span>${esc(T(id).name)}</span><em>${fmt(v)} · ${Math.round(v/tc*100)}%</em></div>`).join('')}</div>`:'<p class="mut">Sem registros neste período.</p>';
 const ids=[...new Set([...Object.keys(C),...Object.keys(P)])],m2=Math.max(1,...ids.map(i=>Math.max(C[i]||0,P[i]||0)));
 $('#cmp').innerHTML=ids.length?ids.map(i=>`<div class="cmp"><span>${esc(T(i).name)}</span><div><div class="bar" style="width:${(C[i]||0)/m2*100}%;background:${T(i).color}"></div><div class="bar" style="width:${(P[i]||0)/m2*100}%;background:${T(i).color};opacity:.35"></div></div><em>${fmt(C[i]||0)} / ${fmt(P[i]||0)}</em></div>`).join(''):'<p class="mut">Sem registros.</p>';
 const mx=Math.max(1,...B.map(d=>sum(I[key(d)]||{}))),W=640,H=200,bw=W/B.length;
 $('#bars').innerHTML=`<svg viewBox="0 0 ${W} ${H}" width="100%">${B.map((d,i)=>{let yy=H-20;return Object.entries(I[key(d)]||{}).map(([id,v])=>{const h=v/mx*(H-40);yy-=h;return `<rect x="${i*bw+bw*.15}" y="${yy}" width="${bw*.7}" height="${h}" rx="3" fill="${T(id).color}"><title>${esc(T(id).name)}: ${fmt(v)}</title></rect>`}).join('')+`<text x="${i*bw+bw/2}" y="${H-4}" text-anchor="middle">${d.getDate()}</text>`}).join('')}</svg>`;
 const off=(new Date(y,mo,1).getDay()+6)%7,n=dm(y,mo);let h=DOW.map(d=>`<div class="dow">${d}</div>`).join('')+'<div></div>'.repeat(off);
 for(let i=1;i<=n;i++){const s=sum(I[y+'-'+pad(mo+1)+'-'+pad(i)]||{}),a=(.2+Math.min(s/3600,6)/6*.8).toFixed(2);
  h+=`<div class="hc" style="background:${s?`rgba(var(--blue),${a})`:'var(--card2)'}">${i}${s?`<small>${fmt(s)}</small>`:''}</div>`}
 $('#heat').innerHTML=h}

function renderDl(){
 $('#dlo').innerHTML=SEC.map(([k,n])=>`<button class="chip${DL.on[k]?' on':''}" data-a="dlsec" data-v="${k}" style="--c:#fff"><i></i>${n}</button>`).join('');
 $('#dlf').innerHTML=Object.entries(FM).map(([k,f])=>`<button class="chip${DL.f==k?' on':''}" data-a="dlfmt" data-v="${k}" style="--c:#fff"><i></i>${f[0]}</button>`).join('');
 $('#dlm').textContent=new Date().toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}

function draw(){const [,W,H]=FM[DL.f],ss=SEC.filter(s=>DL.on[s[0]]);if(!ss.length)return alert('Escolha ao menos uma informação.');
 const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d'),M=70,w=W-2*M,TX='#e9e7e2',MU='#858b95';
 const tx=(s,X,Y,z,col,al='left',wt=400,f='system-ui,sans-serif')=>{x.font=`${wt} ${z}px ${f}`;x.fillStyle=col;x.textAlign=al;x.fillText(s,X,Y)};
 const rr=(X,Y,a,b,r,col)=>{x.fillStyle=col;x.beginPath();x.roundRect(X,Y,a,b,r);x.fill()};
 const R=rng('mes'),I=idx(),C=agg(R.c),P=agg(R.p),tc=sum(C),tp=sum(P),dias=R.c.filter(d=>sum(I[key(d)]||{})>0).length,dl=tp?Math.round((tc-tp)/tp*100):null;
 const ent=Object.entries(C).sort((a,b)=>b[1]-a[1]).slice(0,6),ids=[...new Set([...Object.keys(C),...Object.keys(P)])].slice(0,6);
 const mes=new Date().toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
 x.fillStyle='#0c0d0f';x.fillRect(0,0,W,H);
 tx('Foco · '+mes,M,112,54,TX,'left',600,'Georgia,serif');tx('Insights do mês',M,154,26,MU);
 const D={
 kpi:(X,Y,a,b)=>[['Este mês',fmt(tc)],['Mês passado',fmt(tp)],['Variação',dl==null?'—':(dl>0?'+':'')+dl+'%'],['Dias com estudo',dias]].forEach(([l,v],i)=>{tx(l,X+i*a/4,Y+b*.36,22,MU);tx(v,X+i*a/4,Y+b*.8,Math.min(50,b*.4),TX,'left',600,'Georgia,serif')}),
 donut:(X,Y,a,b)=>{if(!tc)return tx('Sem registros neste mês.',X,Y+30,26,MU);const r=Math.min(b/2,a*.27),cx=X+r,cy=Y+b/2,lw=r*.36;let o=-Math.PI/2;
  ent.forEach(([id,v])=>{const e=o+v/tc*2*Math.PI;x.beginPath();x.arc(cx,cy,r-lw/2,o,e);x.lineWidth=lw;x.strokeStyle=T(id).color;x.stroke();o=e});
  tx(fmt(tc),cx,cy+10,Math.min(36,r*.4),TX,'center',600);const rh=Math.min(50,b/ent.length);
  ent.forEach(([id,v],i)=>{const yy=Y+(b-rh*ent.length)/2+i*rh+rh*.65;x.fillStyle=T(id).color;x.beginPath();x.arc(X+2*r+50,yy-8,9,0,7);x.fill();tx(T(id).name,X+2*r+74,yy,26,TX);tx(fmt(v)+' · '+Math.round(v/tc*100)+'%',X+a,yy,24,MU,'right')})},
 cmp:(X,Y,a,b)=>{if(!ids.length)return tx('Sem registros.',X,Y+30,26,MU);const m=Math.max(1,...ids.map(i=>Math.max(C[i]||0,P[i]||0))),rh=Math.min(72,b/ids.length),bw=a-380,bh=Math.min(16,rh*.22);
  ids.forEach((id,i)=>{const yy=Y+i*rh;tx(T(id).name,X,yy+rh*.55,26,TX);[[C[id]||0,1],[P[id]||0,.35]].forEach(([v,al],j)=>{x.globalAlpha=al;rr(X+210,yy+rh*.2+j*(bh+6),Math.max(2,v/m*bw),bh,bh/2,T(id).color)});x.globalAlpha=1;tx(fmt(C[id]||0)+' / '+fmt(P[id]||0),X+a,yy+rh*.55,24,MU,'right')})},
 bars:(X,Y,a,b)=>{const mx=Math.max(1,...R.c.map(d=>sum(I[key(d)]||{}))),bw=a/R.c.length,bs=b-30;
  R.c.forEach((d,i)=>{let yy=Y+bs;Object.entries(I[key(d)]||{}).forEach(([id,v])=>{const h=v/mx*(bs-4);yy-=h;rr(X+i*bw+bw*.15,yy,bw*.7,h,3,T(id).color)});tx(d.getDate(),X+i*bw+bw/2,Y+b-6,Math.min(18,bw*.6),MU,'center')})},
 heat:(X,Y,a,b)=>{const off=(R.c[0].getDay()+6)%7,rows=Math.ceil((off+R.c.length)/7),cw=a/7,ch=Math.min(cw,(b-26)/rows);
  DOW.forEach((d,i)=>tx(d,X+i*cw+cw/2,Y+16,18,MU,'center'));
  R.c.forEach((d,i)=>{const s=sum(I[key(d)]||{}),p=i+off,cx=X+p%7*cw,cy=Y+26+(p/7|0)*ch;rr(cx+3,cy+3,cw-6,ch-6,10,s?`rgba(76,141,255,${(.2+Math.min(s/3600,6)/6*.8).toFixed(2)})`:'#1d2024');
   tx(d.getDate(),cx+12,cy+Math.min(26,ch*.45),Math.min(20,ch*.4),'#d6e4ff');if(s&&ch>64)tx(fmt(s),cx+12,cy+ch-14,16,'#d6e4ff')})}
 };
 const g=20,tot=ss.reduce((a,s)=>a+s[2],0),av=H-190-70-g*(ss.length-1);let Y=190;
 ss.forEach(([k,n,wt])=>{const h=av*wt/tot,tt=k=='kpi'?0:56;rr(M,Y,w,h,28,'#15171a');if(tt)tx(n,M+30,Y+42,26,TX,'left',600);D[k](M+30,Y+tt,w-60,h-tt-24);Y+=h+g});
 c.toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='foco-insights-'+key(today()).slice(0,7)+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000)})}

function show(){document.querySelectorAll('.view').forEach(v=>v.classList.toggle('on',v.id=='v-'+view));
 document.querySelectorAll('[data-a=view]').forEach(b=>b.classList.toggle('on',b.dataset.v==view));if(view=='ins')renderIns()}
function all(){renderCal();renderTags();renderTimer();renderDay();$('#gm').value=S.timer.goal/60|0;$('#clr').hidden=!S.demo;if(view=='ins')renderIns()}

document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,v=b.dataset.v,t=S.timer;
 if(a=='view'){view=v;show()}
 else if(a=='day'){sel=v;renderCal();renderDay()}
 else if(a=='prev'||a=='next'){cm=new Date(cm.getFullYear(),cm.getMonth()+(a=='next'?1:-1),1);renderCal()}
 else if(a=='tag'){if(!t.run&&!t.acc){t.tag=v;save();renderTags();renderTimer()}}
 else if(a=='mode'){if(!elapsed()){t.mode=v;save();renderTimer()}}
 else if(a=='add'){if(busy())return;adding=!adding;ntErr='';renderTags()}
 else if(a=='edit'){if(busy())return;editing=!editing;renderTags()}
 else if(a=='deltag'){if(busy()){alert('Finalize ou salve o cronômetro antes de apagar tags.');return}
  const n=S.sessions.filter(s=>s.tag==v).length;
  if(!confirm('Apagar a tag "'+T(v).name+'"'+(n?' e os '+n+' registros dela?':'?')))return;
  S.tags=S.tags.filter(x=>x.id!=v);S.sessions=S.sessions.filter(s=>s.tag!=v);if(t.tag==v)t.tag=null;
  if(!S.tags.length)editing=false;save();all()}
 else if(a=='base'){nt.h=+v;nt.l=nt.l||SH[3];ntErr='';renderTags()}
 else if(a=='shade'){nt.l=+v;renderTags()}
 else if(a=='mk'){if(busy())return;const n=nt.name.trim();
  if(!n||nt.h==null){ntErr=!n&&nt.h==null?'Digite um nome e escolha uma cor para a tag.':!n?'Digite um nome para a tag.':'É necessário escolher uma cor para a tag.';renderTags();if(!n)$('#tn').focus();return}
  const id='t'+Date.now();S.tags.push({id,name:n,color:hsl(nt.h,nt.l)});if(!t.run&&!t.acc)t.tag=id;
  adding=false;ntErr='';nt={name:'',h:null,l:null};save();renderTags();renderTimer()}
 else if(a=='go'){if(!t.tag){$('#hint').textContent='Escolha uma tag antes de iniciar';return}
  if(t.run){t.acc=elapsed();t.run=false}else{t.start=Date.now();t.run=true;adding=false;editing=false}save();renderTags();renderTimer()}
 else if(a=='stop')fin();
 else if(a=='del'){S.sessions=S.sessions.filter(s=>s.id!=v);save();all()}
 else if(a=='per'){per=v;renderIns()}
 else if(a=='dlopen'){$('#dlp').hidden=!$('#dlp').hidden;renderDl()}
 else if(a=='dlsec'){DL.on[v]=!DL.on[v];renderDl()}
 else if(a=='dlfmt'){DL.f=v;renderDl()}
 else if(a=='dlgo')draw();
 else if(a=='clr'){S.sessions=[];S.notes={};S.demo=false;save();all()}});
document.addEventListener('input',e=>{if(e.target.id=='tn')nt.name=e.target.value;
 if(e.target.id=='gm'){S.timer.goal=Math.min(1440,Math.max(1,Math.round(+e.target.value)||1))*60;save();renderClock(shown())}
 if(e.target.id=='note'){S.notes[sel]=e.target.value;save()}});
document.addEventListener('change',e=>{if(e.target.id=='note')renderCal();if(e.target.id=='gm'){e.target.value=S.timer.goal/60|0;renderTimer()}});
load();all();setInterval(()=>{if(S.timer.run){renderTimer();if(S.timer.mode=='temp'&&elapsed()>=S.timer.goal)fin(true)}},500);