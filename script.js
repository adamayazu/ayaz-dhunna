
// Core behavior for luxury site
async function startCountdown(){
  const target = new Date("2026-06-26T00:00:00");
  function tick(){
    const now = new Date();
    let diff = target - now;
    if(diff <= 0){
      document.getElementById("countdown").innerText = "Happily married!";
      return;
    }
    const days = Math.floor(diff / (1000*60*60*24));
    diff -= days*24*60*60*1000;
    const hours = Math.floor(diff / (1000*60*60));
    diff -= hours*60*60*1000;
    const mins = Math.floor(diff / (1000*60));
    const secs = Math.floor((diff - mins*60*1000)/1000);
    document.getElementById("countdown").innerText = days + "d " + hours + "h " + mins + "m " + secs + "s";
  }
  tick();
  setInterval(tick,1000);
}

function computeDaysTogether(){
  const meet = new Date("2025-07-06T00:00:00");
  const now = new Date();
  const diffDays = Math.floor((now - meet)/(1000*60*60*24));
  // months and days
  let years = now.getFullYear() - meet.getFullYear();
  let months = now.getMonth() - meet.getMonth();
  let days = now.getDate() - meet.getDate();
  if(days < 0){ months -=1; const prev = new Date(now.getFullYear(), now.getMonth(), 0); days += prev.getDate(); }
  if(months < 0){ years -=1; months += 12; }
  const monthsStr = (years>0? years + "y ":"") + (months>0? months + "m ":"") + days + "d";
  document.getElementById("daysTogether").innerText = diffDays + " days · (" + monthsStr + ")";
}

async function loadManifest(){
  try{
    const r = await fetch("images/manifest.json");
    if(!r.ok) return [];
    const list = await r.json();
    return list;
  }catch(e){ return []; }
}

async function buildSlideshow(){
  const slideshow = document.getElementById("slideshow");
  if(!slideshow) return;
  const list = await loadManifest();
  if(!list.length){
    slideshow.innerHTML = "<div style='color:var(--muted)'>No photos yet</div>";
    return;
  }
  list.forEach((src,i)=>{
    const img = document.createElement("img");
    img.src = src;
    img.style.position = "absolute";
    img.style.inset = "0";
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    img.style.opacity = i===0?1:0;
    img.style.transition = "opacity 1.2s ease";
    slideshow.appendChild(img);
  });
  let idx = 0;
  setInterval(()=> {
    const imgs = slideshow.querySelectorAll("img");
    imgs.forEach((im, j)=> im.style.opacity = j===idx?1:0);
    idx = (idx+1) % imgs.length;
  }, 4500);
}

async function renderGallery(){
  const grid = document.getElementById("galleryGrid") || document.getElementById("galleryGridHome");
  if(!grid) return;
  const list = await loadManifest();
  grid.innerHTML = "";
  list.forEach(src=>{
    const card = document.createElement("div");
    card.className = "card";
    const img = document.createElement("img");
    img.src = src;
    card.appendChild(img);
    grid.appendChild(card);
  });
}

let heartsOn = true;
let heartInterval = null;
function startHearts(){
  const canvas = document.getElementById("heartsCanvas");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  function resize(){ canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight; }
  resize(); window.addEventListener("resize", resize);
  const hearts = [];
  function spawn(){ hearts.push({x: Math.random()*canvas.width, y: canvas.height+20, size: 8+Math.random()*20, speed: 0.3+Math.random()*1.2, rot: Math.random()}); }
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let i=hearts.length-1;i>=0;i--){
      const h = hearts[i];
      h.y -= h.speed;
      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.rotate(h.rot);
      ctx.fillStyle = "rgba(255,140,170,0.12)";
      ctx.beginPath();
      ctx.moveTo(0,-h.size/2);
      ctx.bezierCurveTo(h.size/2,-h.size/2,h.size/2,h.size/2,0,h.size/2);
      ctx.bezierCurveTo(-h.size/2,h.size/2,-h.size/2,-h.size/2,0,-h.size/2);
      ctx.fill();
      ctx.restore();
      if(h.y < -30) hearts.splice(i,1);
    }
    requestAnimationFrame(draw);
  }
  heartInterval = setInterval(spawn, 450);
  draw();
}

function stopHearts(){
  // simple: reload canvas to clear
  const canvas = document.getElementById("heartsCanvas");
  if(canvas){
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0,0,canvas.width,canvas.height);
  }
  clearInterval(heartInterval);
}

function toggleHearts(){
  heartsOn = !heartsOn;
  if(heartsOn) startHearts(); else stopHearts();
  localStorage.setItem("hearts_on", heartsOn?"1":"0");
}

let audioCtx, playing=false;
function initMusic(){
  if(audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const master = audioCtx.createGain(); master.gain.value = 0.02; master.connect(audioCtx.destination);
  const osc1 = audioCtx.createOscillator(), osc2 = audioCtx.createOscillator();
  osc1.type='sine'; osc2.type='sine'; osc1.frequency.value=220; osc2.frequency.value=223.4;
  const g = audioCtx.createGain(); g.gain.value=0.6;
  osc1.connect(g); osc2.connect(g); g.connect(master);
  const lfo = audioCtx.createOscillator(); lfo.type='sine'; lfo.frequency.value=0.05;
  const lfoGain = audioCtx.createGain(); lfoGain.gain.value=0.25; lfo.connect(lfoGain); lfoGain.connect(g.gain);
  osc1.start(); osc2.start(); lfo.start();
  playing = true;
}

function toggleMusic(){
  if(!audioCtx) initMusic();
  if(playing){ audioCtx.suspend(); playing=false; } else { audioCtx.resume(); playing=true; }
  localStorage.setItem("music_on", playing?"1":"0");
}

function initHome(){
  startCountdown();
  computeDaysTogether();
  buildSlideshow();
  renderGallery();
  const heartsPref = localStorage.getItem("hearts_on");
  if(heartsPref === "0") heartsOn = false;
  if(heartsOn) startHearts();
  const musicPref = localStorage.getItem("music_on");
  if(musicPref === "1"){ initMusic(); }
}

document.addEventListener("DOMContentLoaded", ()=>{ initHome(); renderGallery(); });
