/* Ta'lim islohotlari — one big chalkboard, a camera that flies from stop to stop.
   Plain old-school JS on purpose: it has to run on classroom smart boards with old browsers. */
(function(){
'use strict';

/* ───────── settings ───────── */
var PRESENTER = 'Soliha';          // title frame: "taqdimotchi: …". Leave '' to hide.

/* where each frame sits on the board: [column, row, tilt in degrees] — a snake-shaped road */
var POS_L = [[0,0,0],[1,-.06,-5],[2,.05,4],[3,-.04,-3],[4,.04,6],
           [4,1,-4],[3,1.06,5],[2,.96,-6],[1,1.05,3],[0,1,-4],
           [0,2.02,5],[1,1.98,-3],[2,2.04,0]];
/* phones held upright get a narrow, tall road: two columns */
var POS_P = [[0,0,0],[1,.05,-4],[1,1,3],[0,1.04,-3],[0,2,4],[1,2.04,-4],[1,3,3],[0,3.05,-3],[0,4,4],[1,4.04,-3],[1,5,3],[0,5.04,-3],[0,6,0]];
var POS = POS_L;
var SIGNS_P = ['Start','Avloniy','1991','Qonun','Universitet','Alifbo','Test','Umid','Dastur','9 + 3','Savollar','Xulosa','Tamom'];
var SIGNS = ['Boshlanish','Avloniy','1991','1992 · Qonun','1992 · Universitet','1993 · Alifbo','1994 · Test','1997 · Umid','1997 · Dastur','9 + 3','Savollar','Xulosa','Tamom'];
/* the order of the show: frame numbers, with one bird's-eye view of the whole road before the quiz */
var STEPS = [0,1,2,3,4,5,6,7,8,9,'ov',10,11,12];

var UNIS = [['Andijon','pedagogika instituti','Andijon','davlat universiteti'],['Buxoro','pedagogika instituti','Buxoro','davlat universiteti'],
            ['Namangan','pedagogika instituti','Namangan','davlat universiteti'],['Qarshi','pedagogika instituti','Qarshi','davlat universiteti'],
            ['Termiz','pedagogika instituti','Termiz','davlat universiteti'],['Urganch','pedagogika instituti','Urganch','davlat universiteti'],
            ['Guliston','pedagogika instituti','Guliston','davlat universiteti'],['Toshkent','yangi oliygoh','JIDU','Jahon iqtisodiyoti va diplomatiya universiteti']];
var WORDS = [[['Ў','Oʻ'],['З','Z'],['Б','B'],['Е','E'],['К','K'],['И','I'],['С','S'],['Т','T'],['О','O'],['Н','N']],
             [['М','M'],['А','A'],['К','K'],['Т','T'],['А','A'],['Б','B']],
             [['К','K'],['И','I'],['Т','T'],['О','O'],['Б','B']]];
var MODEL = [['Shaxs','#ffe27a'],['Davlat va jamiyat','#ff9eb5'],['Uzluksiz taʼlim','#8fd3ff'],['Fan','#a8e6a1'],['Ishlab chiqarish','#f4f1e6']];
var QUIZ = [
  {q:'«Taʼlim toʻgʻrisida»gi birinchi Qonun qachon qabul qilingan?', o:['1991-yil 31-avgust','1992-yil 2-iyul','1997-yil 29-avgust'], a:1, r:'Toʻgʻri! Mustaqillikdan bir yil oʻtmay 👏'},
  {q:'Lotin yozuviga asoslangan alifbo haqidagi Qonun qaysi yili chiqdi?', o:['1989','1993','1996'], a:1, r:'Barakalla! 2-sentabr 1993 ✍️'},
  {q:'Iqtidorli yoshlarni xorijga oʻqishga yuborgan jamgʻarma qaysi?', o:['«Ustoz»','«Kamolot»','«Umid»'], a:2, r:'Ha! «Umid» — nomi oʻziga mos ✈️'},
  {q:'Kadrlar tayyorlash milliy dasturining «formulasi» qanday?', o:['9 + 3','11 + 2','10 + 1'], a:0, r:'Aʼlo! 9 yil maktab + 3 yil litsey yoki kollej 🎓'}
];

/* ───────── helpers ───────── */
function $(s, r){ return (r || document).querySelector(s); }
function $$(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
var root = document.documentElement, stage = $('#stage'), world = $('#world'), far = $('#far'), camEl = $('#cam');
var frames = $$('.frame'), SCALE = 1, W = 1920, H = 1080, cur = -1, tOn;
var GX = 1.28, GY = 1.42;                      // distance between neighbouring frames, in frame widths / heights
var SHOW_ALL = /[?&]f=1/.test(location.search);                 // testing helper: reveal every step at once
var FREEZE = /[?&]t=([\d.]+)/.exec(location.search);            // testing helper: freeze animations at that second

/* ───────── build the pieces that repeat ───────── */
(function(){
  var h, i;
  if (PRESENTER) $('#by').innerHTML = 'taqdimotchi: <b>' + PRESENTER + '</b>'; else $('#by').style.display = 'none';
  frames.forEach(function(f, i){ var s = document.createElement('div'); s.className = 'sign'; s.innerHTML = '<span class="lg">' + SIGNS[i] + '</span><span class="sm">' + SIGNS_P[i] + '</span>'; f.appendChild(s); });

  h = ''; UNIS.forEach(function(u, i){
    h += '<div class="fl" style="--i:' + i + '"><div class="in"><div class="fr">' + u[0] + '<small>' + u[1] + '</small></div><div class="bk">' + u[2] + '<small>' + u[3] + ' 🎓</small></div></div></div>';
  }); $('#flips').innerHTML = h;

  h = ''; i = 0; WORDS.forEach(function(w){
    h += '<span class="wd">';
    w.forEach(function(p){ h += '<span class="tl" style="--i:' + (i++) + '"><span class="in"><b class="c">' + p[0] + '</b><b class="l">' + p[1] + '</b></span></span>'; });
    h += '</span>';
  }); $('#words').innerHTML = h;

  h = ''; [1,3,0,2,1,0,3].forEach(function(f, r){
    h += '<div class="rw"><em>' + (r + 1) + '.</em>';
    'ABCD'.split('').forEach(function(ch, c){ h += '<i' + (c === f ? ' class="f" style="--i:' + r + '"' : '') + '>' + ch + '</i>'; });
    h += '</div>';
  }); $('#sheet').insertAdjacentHTML('beforeend', h);

  h = ''; MODEL.forEach(function(m, i){ h += '<span style="--a:' + (i * 72) + 'deg"><b style="--c:' + m[1] + '">' + m[0] + '</b></span>'; });
  $('#ring').innerHTML = h;

  h = ''; for (i = 0; i < 12; i++){
    h += '<div class="st" style="--i:' + i + ';--h:' + (66 + i * 20) + 'px;--c:' + (i < 4 ? '#8fd3ff' : i < 9 ? '#a8e6a1' : '#ff9eb5') + '"><b>' + (i + 1) + '</b></div>';
  }
  h += '<div class="st uni gap" style="--i:13;--h:320px;--c:#ffe27a"><b>Bakalavr<small>4 yil</small></b></div>' +
       '<div class="st uni" style="--i:15;--h:366px;--c:#f4f1e6"><b>Magistr<small>2 yil</small></b></div>';
  $('#stairs').innerHTML = h;
  $('#stairs').insertAdjacentHTML('afterend', '<div class="legend a" style="--d:26"><span style="--c:#8fd3ff">1–4 · boshlangʻich</span><span style="--c:#a8e6a1">5–9 · umumiy oʻrta</span><span style="--c:#ff9eb5">10–12 · litsey yoki kollej</span><span style="--c:#ffe27a">oliy taʼlim</span></div>');

  // faint chalk scribbles far behind the frames: they move slower than the camera, which gives depth
  var words = ['A B C','2 + 2 = 4','a² + b² = c²','E = mc²','H₂O','★','1991','π ≈ 3.14','Oʻ Gʻ Sh Ch','x + y','♪ ♫','7 × 8 = 56','A a B b','№ 1','5+','✓','S = v · t','O‘zbekiston','☾','1 + 1'], seed = 7;
  function rnd(){ seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
  h = ''; for (i = 0; i < 46; i++){
    h += '<span style="left:' + Math.round(rnd() * 6200 - 1500) + 'px;top:' + Math.round(rnd() * 3400 - 1100) + 'px;font-size:' + Math.round(70 + rnd() * 150) + 'px;transform:rotate(' + Math.round(rnd() * 50 - 25) + 'deg)">' + words[i % words.length] + '</span>';
  } far.innerHTML = h;
})();

/* ───────── fit the stage to the screen & lay the frames out on the board ───────── */
function center(i){ return [POS[i][0] * W * GX, POS[i][1] * H * GY]; }
function fit(){
  var vw = window.innerWidth, vh = window.innerHeight, pt = vw / vh < 0.85;
  if (pt){ W = 1080; H = Math.max(1800, Math.min(2400, Math.round(1080 * vh / vw))); }
  else   { H = 1080; W = Math.max(1600, Math.min(2560, Math.round(1080 * vw / vh))); }
  POS = pt ? POS_P : POS_L; GX = pt ? 3 : 1.28; GY = pt ? 1.14 : 1.42;
  SCALE = Math.min(vw / W, vh / H);
  document.body.classList.toggle('pt', pt);
  root.style.setProperty('--W', W + 'px');
  root.style.setProperty('--H', H + 'px');
  root.style.setProperty('--s', SCALE);
  root.style.setProperty('--u', pt ? 1 : Math.min(1, W / 1920));
  root.style.setProperty('--vw', Math.round(Math.min(W * 0.8, H * 0.66 * 16 / 9)) + 'px');
  root.style.setProperty('--hb', Math.round(Math.max(36, Math.min(72, Math.min(vw, vh) * 0.056))) + 'px');
  var pts = [];
  frames.forEach(function(f, i){
    var c = center(i);
    f.style.left = (c[0] - W / 2) + 'px'; f.style.top = (c[1] - H / 2) + 'px';
    f.style.transform = 'rotate(' + POS[i][2] + 'deg)';
    pts.push(Math.round(c[0]) + ',' + Math.round(c[1]));
  });
  $('#roadLine').setAttribute('points', pts.join(' '));
  if (cur >= 0) aim(cur, true);
}
function aim(n, instant){
  var st = STEPS[n], t, tf;
  if (instant){ world.style.transition = far.style.transition = 'none'; }
  if (st === 'ov'){
    var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    frames.forEach(function(f, i){ var c = center(i); x0 = Math.min(x0, c[0]); x1 = Math.max(x1, c[0]); y0 = Math.min(y0, c[1]); y1 = Math.max(y1, c[1]); });
    var k = Math.min(W / (x1 - x0 + W * 1.15), (H * 0.8) / (y1 - y0 + H * 1.1));
    t  = 'scale(' + k + ') rotate(0deg) translate(' + (-(x0 + x1) / 2) + 'px,' + (-(y0 + y1) / 2 + H * 0.09 / k) + 'px)';
    tf = 'scale(' + (0.6 + k * 0.4) + ') rotate(0deg) translate(' + (-(x0 + x1) / 2 * 0.35) + 'px,' + (-(y0 + y1) / 2 * 0.35) + 'px)';
  } else {
    var c = center(st), r = POS[st][2];
    t  = 'scale(1) rotate(' + (-r) + 'deg) translate(' + (-c[0]) + 'px,' + (-c[1]) + 'px)';
    tf = 'scale(1) rotate(' + (-r * 0.5) + 'deg) translate(' + (-c[0] * 0.35) + 'px,' + (-c[1] * 0.35) + 'px)';
  }
  world.style.transform = t; far.style.transform = tf;
  if (instant){ void world.offsetWidth; world.style.transition = far.style.transition = ''; }
}

/* ───────── quiz ───────── */
var quizFrame = $('.f-quiz'), qi = 0, qDone = false;
function quizShow(i, animate){
  qi = i; qDone = false;
  $('#qn').textContent = (i + 1) + '/' + QUIZ.length;
  $('#qtext').textContent = QUIZ[i].q;
  var h = ''; QUIZ[i].o.forEach(function(o, k){ h += '<button class="ob" data-i data-k="' + k + '">' + o + '</button>'; });
  var box = $('#opts'); box.innerHTML = h; box.classList.remove('done');
  $$('.ob', box).forEach(function(b){ b.onclick = function(){ answer(+b.getAttribute('data-k')); }; });
  $('#react').classList.remove('on');
  if (animate){ var c = $('#qcard'); c.classList.remove('swap'); void c.offsetWidth; c.classList.add('swap'); }
}
function answer(k, silent){
  if (qDone) return;
  var q = QUIZ[qi], b = $('.ob[data-k="' + k + '"]'), r = $('#react');
  if (k !== q.a){
    b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); sfx.no();
    r.textContent = 'Yoʻq-yoʻq, yana bir urinib koʻring 🙈'; r.classList.add('on');
    return;
  }
  qDone = true; b.classList.add('ok'); $('#opts').classList.add('done');
  r.textContent = silent ? 'Toʻgʻri javob: ' + q.o[q.a] : q.r; r.classList.add('on');
  if (!silent){ sfx.ok(); boom({particleCount: 90, spread: 80, origin: {y: 0.75}}); }
}
quizFrame._enter = function(){ quizShow(0, false); };
quizFrame._next = function(){
  if (!qDone){ answer(QUIZ[qi].a, true); return true; }        // nobody answered → show the right answer
  if (qi < QUIZ.length - 1){ quizShow(qi + 1, true); return true; }
  return false;
};
quizShow(0, false);

/* ───────── the end: dancing hamster (the video file already carries Uzbek captions) ───────── */
var endFrame = $('#endFrame'), video = $('#endVideo'), vSound = $('#vSound'), after = $('#after'), tPlay;
function playEnd(){
  after.classList.remove('on'); vSound.style.display = 'none';
  try { video.currentTime = 0; } catch (e) {}
  video.muted = false;
  var p = video.play();
  if (p && p.catch) p.catch(function(){            // the browser blocked sound → play silently and offer a button
    if (frames[STEPS[cur]] !== endFrame) return;
    video.muted = true; vSound.style.display = 'block';
    var q = video.play(); if (q && q.catch) q.catch(function(){});
  });
}
vSound.onclick = function(){ video.muted = false; vSound.style.display = 'none'; try { video.currentTime = 0; } catch (e) {} video.play(); };
video.addEventListener('click', function(){ if (video.paused) video.play(); else video.pause(); });
video.addEventListener('ended', function(){ after.classList.add('on'); boom({particleCount: 160, spread: 120, origin: {y: 0.5}}); });
$('#again').onclick = function(){ playEnd(); };
endFrame._enter = function(){
  clearTimeout(tPlay);
  tPlay = setTimeout(function(){
    if (frames[STEPS[cur]] !== endFrame) return;
    playEnd();
    boom({particleCount: 110, angle: 60, spread: 70, origin: {x: 0, y: 0.75}}); boom({particleCount: 110, angle: 120, spread: 70, origin: {x: 1, y: 0.75}});
  }, 1300);
};
endFrame._leave = function(){ clearTimeout(tPlay); video.pause(); };

/* ───────── fun bits: sounds, confetti ───────── */
var AC;
function beep(freqs, dur, type, vol){
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    freqs.forEach(function(f, i){
      var o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + i * dur;
      o.type = type; o.frequency.value = f; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.95);
      o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + dur);
    });
  } catch (e) {}
}
var sfx = {
  ok:  function(){ beep([660, 880, 1320], 0.09, 'triangle', 0.12); },
  no:  function(){ beep([200, 150], 0.16, 'sawtooth', 0.05); },
  pop: function(){ beep([520, 780], 0.06, 'triangle', 0.08); }
};
function boom(o){ if (window.confetti) try { window.confetti(o || {particleCount: 120, spread: 90, origin: {y: 0.6}}); } catch (e) {} }

/* ───────── flying between stops ───────── */
function frameOf(n){ var s = STEPS[n]; return s === 'ov' ? null : frames[s]; }
function land(n){
  var f = frameOf(n); if (!f) return;
  var first = !f.classList.contains('on');
  f.classList.add('on');
  if (SHOW_ALL) $$('.frag', f).forEach(function(x){ x.classList.add('shown'); });
  if (f._enter) f._enter();
  if (FREEZE && first && document.getAnimations) setTimeout(function(){
    document.getAnimations().forEach(function(an){ try { an.pause(); an.currentTime = parseFloat(FREEZE[1]) * 1000; } catch (e) {} });
  }, 60);
}
function go(n){
  n = Math.max(0, Math.min(STEPS.length - 1, n));
  if (n === cur) return;
  var old = frameOf(cur), first = cur < 0;
  if (old && old._leave) old._leave();
  cur = n;
  clearTimeout(tOn);
  document.body.classList.toggle('ov', STEPS[n] === 'ov');
  aim(n, first);
  if (first) land(n);
  else {
    camEl.classList.remove('fly'); void camEl.offsetWidth; camEl.classList.add('fly');
    tOn = setTimeout(function(){ land(n); }, 1000);
  }
  $('#counter').textContent = (n + 1) + ' / ' + STEPS.length;
  $('#progress i').style.width = (n / (STEPS.length - 1) * 100) + '%';
  try { history.replaceState(null, '', '#' + (n + 1)); } catch (e) {}
}
function next(){
  var f = frameOf(cur);
  if (f){
    if (!f.classList.contains('on')){ clearTimeout(tOn); land(cur); return; }   // still flying → land first
    if (f._next && f._next()) return;
    var fr = $('.frag:not(.shown)', f);
    if (fr){ fr.classList.add('shown'); sfx.pop(); return; }
  }
  go(cur + 1);
}
function prev(){
  var f = frameOf(cur);
  if (f && cur > 0){ var shown = $$('.frag.shown', f); if (shown.length){ shown[shown.length - 1].classList.remove('shown'); return; } }
  go(cur - 1);
}

$('#nextBtn').onclick = next;
$('#prevBtn').onclick = prev;
document.addEventListener('keydown', function(e){
  var k = e.key || '', c = e.keyCode;
  if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || k === ' ' || k === 'Enter' || c === 39 || c === 34 || c === 32 || c === 13){ e.preventDefault(); next(); }
  else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp' || k === 'Backspace' || c === 37 || c === 33 || c === 8){ e.preventDefault(); prev(); }
  else if (k === 'Home') go(0);
  else if (k === 'End') go(STEPS.length - 1);
  else if (k.toLowerCase() === 'f') toggleFs();
});
// tap anywhere: right part → next, left edge → back (buttons and quiz answers keep their own clicks)
stage.addEventListener('click', function(e){
  var t = e.target;
  if (t.closest && t.closest('[data-i],button,a,video')) return;
  if (e.clientX / window.innerWidth < 0.22) prev(); else next();
});
var tx = null, ty = null;
window.addEventListener('touchstart', function(e){ tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, {passive: true});
window.addEventListener('touchend', function(e){
  if (tx === null) return;
  var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty; tx = null;
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.3){ if (dx < 0) next(); else prev(); }
}, {passive: true});
function toggleFs(){
  var d = document, el = d.documentElement;
  if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
  else { var f = el.requestFullscreen || el.webkitRequestFullscreen; if (f) f.call(el); }
}
$('#fsBtn').onclick = toggleFs;

/* ───────── start ───────── */
window.addEventListener('resize', fit);
window.addEventListener('orientationchange', function(){ setTimeout(fit, 250); });
fit();
var start = parseInt((location.hash || '').replace('#', ''), 10);
start = start > 0 ? Math.min(start, STEPS.length) - 1 : 0;
for (var i = 0; i < start; i++){ var pf = frameOf(i); if (pf){ pf.classList.add('on'); $$('.frag', pf).forEach(function(x){ x.classList.add('shown'); }); } }   // opened in the middle → earlier stops count as visited
go(start);
})();
