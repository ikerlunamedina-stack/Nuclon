/* ============================================================
   VEX · GamerOS — app.js
============================================================ */

/* ---- Escalar iPhone al viewport ---- */
function scaleIphone(){
  const scaler = document.getElementById('iphoneScaler');
  const PHONE_H = 844, PHONE_W = 390;
  const vh = window.innerHeight, vw = window.innerWidth;
  const scale = Math.min((vh - 24) / PHONE_H, (vw - 24) / PHONE_W, 1);
  scaler.style.width  = PHONE_W + 'px';
  scaler.style.height = PHONE_H + 'px';
  scaler.style.transform = `scale(${scale})`;
}
scaleIphone();
window.addEventListener('resize', scaleIphone);

/* ---- Partículas de fondo ---- */
(function spawnParticles(){
  const amb = document.getElementById('ambient');
  for(let i = 0; i < 18; i++){
    const s = document.createElement('div');
    s.className = 'speck';
    s.style.left = Math.random() * 100 + 'vw';
    s.style.setProperty('--dx', (Math.random() * 60 - 30) + 'px');
    s.style.animationDuration  = (12 + Math.random() * 14) + 's';
    s.style.animationDelay     = (Math.random() * 16) + 's';
    amb.appendChild(s);
  }
})();

/* ---- Reloj en status bar ---- */
function tick(){
  const d = new Date();
  const el = document.getElementById('stime');
  if(el) el.textContent =
    d.getHours().toString().padStart(2,'0') + ':' +
    d.getMinutes().toString().padStart(2,'0');
}
tick();
setInterval(tick, 30000);

/* ---- Navegación entre pantallas ---- */
const PAGE_MAP = {
  home:    'page-home',
  games:   'page-games',
  clips:   'page-clips',
  match:   'page-match',
  music:   'page-music',
  social:  'page-social',
  profile: 'page-profile'
};

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.page;
    document.querySelectorAll('.screen-page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(PAGE_MAP[key]).classList.add('active');
    btn.classList.add('active');
    document.getElementById(PAGE_MAP[key]).scrollTop = 0;
  });
});

/* ---- Match % animado ---- */
(function animateMatch(){
  const el = document.getElementById('matchPct');
  if(!el) return;
  let v = 0;
  const target = 82;
  const t = setInterval(() => {
    v += 2;
    el.innerHTML = v + '<span>%</span>';
    if(v >= target) clearInterval(t);
  }, 20);
})();

/* ============================================================
   PERFIL EDITABLE — localStorage
============================================================ */
const STORAGE_KEY = 'vex_profile';

function getProfile(){
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {
    name: 'VEX', bio: '', country: '🇵🇪 Perú',
    status: 'online', avatar: '', games: [], music: []
  };
}

function setProfile(p){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

/* Cargar datos al iniciar */
function loadProfile(){
  const p = getProfile();

  // Inputs
  const fields = ['editName','editBio','editCountry','editStatus'];
  const keys   = ['name','bio','country','status'];
  fields.forEach((id, i) => {
    const el = document.getElementById(id);
    if(el) el.value = p[keys[i]] || '';
  });

  // Avatar
  if(p.avatar) applyAvatar(p.avatar);

  // Hero text
  syncHero(p);

  // Listas
  renderGamesList(p.games || []);
  renderMusicList(p.music || []);
}

function syncHero(p){
  const heroName = document.querySelector('.hero-name');
  const heroBio  = document.querySelector('.hero-handle');
  if(heroName) heroName.textContent = p.name || 'VEX';
  if(heroBio && p.bio) heroBio.textContent = p.bio;
}

function applyAvatar(url){
  // Perfil
  const img    = document.getElementById('profileAvatarImg');
  const letter = document.getElementById('profileAvatarLetter');
  if(img)    { img.src = url; img.style.display = 'block'; }
  if(letter)   letter.style.display = 'none';

  // Hero
  const heroImgs = document.querySelectorAll('.avatar-hero img');
  heroImgs.forEach(i => { i.src = url; i.style.display = 'block'; });
  const heroSpans = document.querySelectorAll('.avatar-hero span');
  heroSpans.forEach(s => s.style.display = 'none');
}

/* Guardar perfil */
function saveProfile(){
  const p = getProfile();
  p.name    = (document.getElementById('editName')?.value.trim()) || 'VEX';
  p.bio     = document.getElementById('editBio')?.value.trim()    || '';
  p.country = document.getElementById('editCountry')?.value.trim()|| '';
  p.status  = document.getElementById('editStatus')?.value        || 'online';
  setProfile(p);
  syncHero(p);
  showToast('✓ Perfil guardado');
}

/* Avatar upload */
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('avatarInput');
  if(input){
    input.addEventListener('change', function(){
      const file = this.files[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = e => {
        const url = e.target.result;
        applyAvatar(url);
        const p = getProfile();
        p.avatar = url;
        setProfile(p);
        showToast('✓ Foto actualizada');
      };
      reader.readAsDataURL(file);
    });
  }
  loadProfile();
});

/* ---- Games list ---- */
function renderGamesList(games){
  const el = document.getElementById('gamesEditList');
  if(!el) return;
  if(!games.length){
    el.innerHTML = '<div style="font-size:11px;color:var(--muted);text-align:center;padding:6px 0;">Sin juegos añadidos</div>';
    return;
  }
  el.innerHTML = games.map((g, i) => `
    <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--line);">
      <div style="width:36px;height:36px;border-radius:10px;background:var(--s2);border:1px solid var(--line);
        display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">${g.emoji || '🎮'}</div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:12px;color:var(--ink);font-weight:500;">${g.name}</div>
        <div style="font-size:10px;color:var(--muted);">${g.genre || ''}${g.hours ? ' · ' + g.hours + 'h' : ''}</div>
      </div>
      <button onclick="removeGame(${i})"
        style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:16px;padding:2px 6px;">×</button>
    </div>
  `).join('');
}

function openAddGame(){
  ['gName','gEmoji','gHours'].forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
  const sel = document.getElementById('gGenre'); if(sel) sel.value = '';
  showModal('modalGame');
}

function addGame(){
  const name = document.getElementById('gName')?.value.trim();
  if(!name){ showToast('Escribe el nombre del juego'); return; }
  const p = getProfile();
  p.games = p.games || [];
  p.games.push({
    name,
    emoji: document.getElementById('gEmoji')?.value.trim() || '🎮',
    genre: document.getElementById('gGenre')?.value || '',
    hours: document.getElementById('gHours')?.value || ''
  });
  setProfile(p);
  renderGamesList(p.games);
  closeModal('modalGame');
  showToast('✓ Juego añadido');
}

function removeGame(i){
  const p = getProfile();
  p.games.splice(i, 1);
  setProfile(p);
  renderGamesList(p.games);
}

/* ---- Music list ---- */
function renderMusicList(music){
  const el = document.getElementById('musicEditList');
  if(!el) return;
  if(!music.length){
    el.innerHTML = '<div style="font-size:11px;color:var(--muted);text-align:center;padding:6px 0;">Sin música añadida</div>';
    return;
  }
  el.innerHTML = music.map((m, i) => `
    <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--line);">
      <div style="width:36px;height:36px;border-radius:10px;background:var(--s2);border:1px solid var(--line);
        display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">🎵</div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:12px;color:var(--ink);font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${m.title}</div>
        <div style="font-size:10px;color:var(--muted);">${m.artist || ''}${m.genre ? ' · ' + m.genre : ''}</div>
      </div>
      <div style="display:flex;gap:6px;align-items:center;">
        ${m.url ? `<a href="${m.url}" target="_blank"
          style="font-size:10px;color:var(--muted);text-decoration:none;border:1px solid var(--line);border-radius:6px;padding:2px 7px;">▶</a>` : ''}
        <button onclick="removeMusic(${i})"
          style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:16px;padding:2px 6px;">×</button>
      </div>
    </div>
  `).join('');
}

function openAddMusic(){
  ['mTitle','mArtist','mUrl'].forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
  const sel = document.getElementById('mGenre'); if(sel) sel.value = '';
  showModal('modalMusic');
}

function addMusic(){
  const title = document.getElementById('mTitle')?.value.trim();
  if(!title){ showToast('Escribe el nombre'); return; }
  const p = getProfile();
  p.music = p.music || [];
  p.music.push({
    title,
    artist: document.getElementById('mArtist')?.value.trim() || '',
    genre:  document.getElementById('mGenre')?.value || '',
    url:    document.getElementById('mUrl')?.value.trim() || ''
  });
  setProfile(p);
  renderMusicList(p.music);
  closeModal('modalMusic');
  showToast('✓ Música añadida');
}

function removeMusic(i){
  const p = getProfile();
  p.music.splice(i, 1);
  setProfile(p);
  renderMusicList(p.music);
}

/* ---- Modal helpers ---- */
function showModal(id){
  const el = document.getElementById(id);
  if(el) el.style.display = 'flex';
}
function closeModal(id){
  const el = document.getElementById(id);
  if(el) el.style.display = 'none';
}

// Cerrar al tocar el fondo del modal
['modalGame','modalMusic'].forEach(id => {
  const el = document.getElementById(id);
  if(el) el.addEventListener('click', function(e){ if(e.target === this) closeModal(id); });
});

/* ---- Toast ---- */
function showToast(msg){
  const el = document.getElementById('toast');
  if(!el) return;
  el.textContent = msg;
  el.style.opacity = '1';
  el.style.transform = 'translateX(-50%) translateY(0)';
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-50%) translateY(10px)';
  }, 2000);
}
