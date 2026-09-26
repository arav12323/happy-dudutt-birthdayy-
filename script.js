const $=(s,p=document)=>p.querySelector(s); const $$=(s,p=document)=>[...p.querySelectorAll(s)];

// ===== Screen / scene navigation =====
const scenes=$$('.scene');
const sceneIds=scenes.map(s=>s.id);
let current=0;
let transitioning=false;
const prevBtn=$('#prevScene'), nextBtn=$('#nextScene'), progress=$('#sceneProgress');

sceneIds.forEach((id,i)=>{
  const d=document.createElement('button');
  d.className='scene-dot'; d.type='button'; d.title=`screen ${i+1}`;
  d.addEventListener('click',()=>showScene(i)); progress.appendChild(d);
});

function sceneIndex(target){
  if(typeof target==='number') return target;
  const id=String(target||'').replace('#','');
  return sceneIds.indexOf(id);
}

function showScene(target,opts={}){
  const next=sceneIndex(target);
  if(next<0||next>=scenes.length||next===current||transitioning)return;
  transitioning=true;
  const direction=next>current?1:-1;
  const old=scenes[current], neu=scenes[next];
  neu.classList.remove('scene-left','scene-right');
  neu.classList.add(direction>0?'scene-right':'scene-left');
  neu.scrollTop=0;
  // force style calculation so entrance animation is reliable
  void neu.offsetWidth;
  old.classList.remove('active');
  old.classList.add(direction>0?'scene-left':'scene-right');
  neu.classList.remove('scene-left','scene-right');
  neu.classList.add('active');
  current=next;
  updateNav();
  setTimeout(()=>{
    scenes.forEach((s,i)=>{ if(i!==current){s.classList.remove('active'); s.classList.toggle('scene-left',i<current); s.classList.toggle('scene-right',i>current);} });
    transitioning=false;
  },720);
}

function updateNav(){
  prevBtn.disabled=current===0;
  nextBtn.disabled=current===scenes.length-1 || scenes[current].id==='archery';
  $$('.scene-dot',progress).forEach((d,i)=>d.classList.toggle('active',i===current));
}

scenes.forEach((s,i)=>{
  s.classList.toggle('active',i===0);
  if(i<0)s.classList.add('scene-left');
  if(i>0)s.classList.add('scene-right');
});
updateNav();
prevBtn.addEventListener('click',()=>showScene(current-1));
nextBtn.addEventListener('click',()=>showScene(current+1));

// Existing buttons now change screen instead of scrolling down
$$('[data-scroll]').forEach(b=>b.addEventListener('click',e=>{
  e.preventDefault();
  const idx=sceneIndex(b.dataset.scroll);
  if(idx>=0)showScene(idx);
}));

// Swipe support on phones (horizontal only; does not interfere with reading long letter)
let touchX=null,touchY=null;
window.addEventListener('touchstart',e=>{touchX=e.touches[0].clientX;touchY=e.touches[0].clientY},{passive:true});
window.addEventListener('touchend',e=>{
  if(touchX===null)return;
  const dx=e.changedTouches[0].clientX-touchX, dy=e.changedTouches[0].clientY-touchY;
  touchX=touchY=null;
  if(Math.abs(dx)>75 && Math.abs(dx)>Math.abs(dy)*1.5){
    if(dx<0 && scenes[current].id!=='archery')showScene(current+1);
    if(dx>0)showScene(current-1);
  }
},{passive:true});

// Petals
const petals=$('#petals');
function spawnPetal(){ const p=document.createElement('span'); p.className='petal'; p.textContent=Math.random()>.45?'♡':'✿'; p.style.left=Math.random()*100+'vw'; p.style.fontSize=(10+Math.random()*18)+'px'; p.style.animationDuration=(7+Math.random()*8)+'s'; petals.appendChild(p); setTimeout(()=>p.remove(),16000); }
setInterval(spawnPetal,650);

// Cursor / tap hearts
let lastHeart=0;
function trail(x,y){if(Date.now()-lastHeart<70)return;lastHeart=Date.now();const h=document.createElement('span');h.className='cursor-heart';h.textContent=Math.random()>.5?'♡':'♥';h.style.left=x+'px';h.style.top=y+'px';h.style.fontSize=(10+Math.random()*10)+'px';document.body.appendChild(h);setTimeout(()=>h.remove(),900)}
window.addEventListener('pointermove',e=>trail(e.clientX,e.clientY));
window.addEventListener('pointerdown',e=>trail(e.clientX,e.clientY));

// Gallery
const captions=['us, being us ♡','one tiny memory','another favorite day','you + me','random but precious','little things matter','a picture I keep','our silly chapter','this one makes me smile','ordinary day, special person','still choosing us','a tiny piece of home'];
const galleryPhotos=[3,4,6,7,8,10,11,12,16,17,19,20,23,25,26];
const gallery=$('#gallery');
galleryPhotos.forEach((n,i)=>{const f=document.createElement('figure');f.className='polaroid reveal visible';f.style.transform=`rotate(${[-2,1.5,-1,2.5][i%4]}deg)`;f.innerHTML=`<img loading="lazy" src="assets/images/photo-${String(n).padStart(2,'0')}.webp" alt="Kenangan bersama Indah"><span>${captions[i%captions.length]}</span>`;gallery.appendChild(f)});

// Archery game
const arrow=$('#arrow'), zone=$('#dragZone'), heart=$('#targetHeart'), burst=$('#heartBurst'), tip=$('#gameTip');
let dragging=false,startX=0,pull=0,shot=false;
function begin(e){if(shot)return;dragging=true;startX=e.clientX;zone.setPointerCapture?.(e.pointerId);}
function move(e){if(!dragging||shot)return;pull=Math.max(0,Math.min(125,startX-e.clientX));arrow.style.transform=`translate(${-pull}px,-50%)`;$('#aimLine').style.width=(pull*1.7)+'px';}
function fire(){if(!dragging||shot)return;dragging=false;if(pull<20){arrow.style.transform='translateY(-50%)';$('#aimLine').style.width='0';tip.textContent='tarik lebih jauh dikit, sayang 😭';return;}shot=true;tip.textContent='bullseye ♡';const gameRect=$('#game').getBoundingClientRect(),a=arrow.getBoundingClientRect(),h=heart.getBoundingClientRect();const dx=h.left-a.left-20,dy=(h.top+h.height/2)-(a.top+a.height/2);arrow.style.transition='.62s cubic-bezier(.2,.8,.2,1)';arrow.style.transform=`translate(${dx}px,calc(-50% + ${dy}px)) rotate(-4deg)`;setTimeout(()=>{heart.style.transform='translateY(-50%) scale(1.35)';heart.style.opacity='.2';for(let i=0;i<28;i++){const s=document.createElement('span');s.textContent=i%3?'♥':'♡';s.style.left=(h.left-gameRect.left+h.width/2)+'px';s.style.top=(h.top-gameRect.top+h.height/2)+'px';s.style.setProperty('--x',(Math.random()*300-150)+'px');s.style.setProperty('--y',(Math.random()*260-130)+'px');burst.appendChild(s)}setTimeout(()=>showScene('#birthday'),900)},580)}
zone.addEventListener('pointerdown',begin);window.addEventListener('pointermove',move);window.addEventListener('pointerup',fire);
zone.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){pull=100;dragging=true;fire()}});
$('#skipGame').addEventListener('click',()=>showScene('#birthday'));

// Compliments
const truths=['kamu cantik. iya, ini fakta.','mode clingy kamu: 10/10, bikin gemas.','senyum kamu punya kemampuan bikin hari biasa jadi lebih enak.','aku bangga sama kamu, lebih sering dari yang kamu tahu.','kamu adalah salah satu alasan aku percaya bahwa rumah bisa berbentuk seseorang.','dan iya… kamu tetap imut walau lagi ngambek 😭♡'];
let ti=0; $('#complimentBtn').addEventListener('click',()=>{$('#compliment').animate([{opacity:0,transform:'translateY(5px)'},{opacity:1,transform:'none'}],{duration:350});$('#compliment').textContent=truths[ti++%truths.length]});

// Letter opening stays on the same screen, paper appears inside it
$('#openLetter').addEventListener('click',()=>{$('#envelope').classList.add('open');setTimeout(()=>{$('#letterPaper').classList.add('show');scenes[current].scrollTo({top:$('#letterPaper').offsetTop-40,behavior:'smooth'})},650)});

// Music intentionally omitted; add soundtrack later in Instagram/CapCut.

// Love rain
$('#loveRain').addEventListener('click',()=>{for(let i=0;i<80;i++)setTimeout(spawnPetal,i*30);showToast('happy birthday, my hunny bunny lovely ♡')});

// Keyboard navigation for desktop
window.addEventListener('keydown',e=>{
  const tag=document.activeElement?.tagName;
  if(tag==='INPUT'||tag==='TEXTAREA')return;
  if(e.key==='ArrowRight' && scenes[current].id!=='archery')showScene(current+1);
  if(e.key==='ArrowLeft')showScene(current-1);
});
