/* ============================================================
   VEX OS — auth.js
   Login, register, session helpers
============================================================ */

function hashSimple(s){
  let h=0;
  for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))&0xFFFFFF;
  return h.toString(16);
}

function getAccounts(){ return JSON.parse(localStorage.getItem('vex_accounts')||'{}'); }
function setAccounts(a){ localStorage.setItem('vex_accounts',JSON.stringify(a)); }
function getSession(){ return JSON.parse(localStorage.getItem('vex_user')||'null'); }
function setSession(u){ localStorage.setItem('vex_user',JSON.stringify(u)); }
function clearSession(){ localStorage.removeItem('vex_user'); }
function isLoggedIn(){ return !!getSession(); }

function doLogin(user, pass, errEl){
  user=user.trim().toLowerCase();
  if(!user||!pass){ showErr(errEl,'Completa todos los campos'); return false; }
  const accounts=getAccounts();
  if(!accounts[user]){ showErr(errEl,'Usuario no encontrado'); return false; }
  if(accounts[user].passHash!==hashSimple(pass)){ showErr(errEl,'Contraseña incorrecta'); return false; }
  setSession(accounts[user]);
  // Sync vex_profile with account data
  localStorage.setItem('vex_profile', JSON.stringify(accounts[user].profile||{}));
  return true;
}

function doRegister(data, errEl){
  const {username, pass, age, country, lang, schedule}=data;
  const key=username.trim().toLowerCase();
  if(!key||!pass||!age||!country){ showErr(errEl,'Completa todos los campos'); return false; }
  if(isNaN(age)||parseInt(age)<14){ showErr(errEl,'Debes tener al menos 14 años'); return false; }
  if(pass.length<6){ showErr(errEl,'Contraseña mínimo 6 caracteres'); return false; }
  if(!/^[a-zA-Z0-9_]+$/.test(key)){ showErr(errEl,'Username: solo letras, números y _'); return false; }
  const accounts=getAccounts();
  if(accounts[key]){ showErr(errEl,'Username ya en uso'); return false; }

  const profile={
    name: username, username: key, bio:'', country, lang, schedule,
    status:'online', avatar:'', games:[], music:[], socials:{}, setupDone:false
  };
  const account={ username:key, passHash:hashSimple(pass), age:parseInt(age), createdAt:Date.now(), profile };
  accounts[key]=account;
  setAccounts(accounts);
  setSession(account);
  localStorage.setItem('vex_profile', JSON.stringify(profile));
  return true;
}

function showErr(el, msg){
  if(!el) return;
  el.textContent=msg; el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'), 4000);
}

function requireAuth(redirect='login.html'){
  if(!isLoggedIn()) window.location.href=redirect;
}

function logout(){
  clearSession();
  window.location.href='index.html';
}

// Spawn background particles (shared utility)
function spawnParticles(containerId='ambient', count=20){
  const amb=document.getElementById(containerId);
  if(!amb) return;
  for(let i=0;i<count;i++){
    const s=document.createElement('div'); s.className='speck';
    s.style.left=Math.random()*100+'vw';
    s.style.setProperty('--dx',(Math.random()*60-30)+'px');
    s.style.animationDuration=(12+Math.random()*14)+'s';
    s.style.animationDelay=(Math.random()*16)+'s';
    amb.appendChild(s);
  }
}
