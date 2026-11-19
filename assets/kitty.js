/* Kitty — a ginger tomcat with a bow tie who talks in subtitles.
   Shared by the deck's last stop (index.html) and the letter page (maktub.html).
   Plain ES5 on purpose, like the rest of the deck. */
(function(){
'use strict';

/* one front leg: drawn hanging down from its shoulder at (0,0) */
var LEG = '<rect class="k-o" x="-21" y="-14" width="42" height="124" rx="21"/>' +
          '<ellipse class="k-c k-line" cx="0" cy="110" rx="26" ry="17"/>' +
          '<path class="k-toe" d="M-8 104v10M8 104v10"/>';
var TAIL = 'M0 0C70 5 96-40 84-98C78-128 92-154 116-148';

var SVG =
'<svg class="kitty" viewBox="-20 -10 440 470" aria-hidden="true">' +
 '<ellipse class="k-shadow" cx="200" cy="440" rx="150" ry="14"/>' +
 '<g class="k-all">' +
  '<g transform="translate(282 400)"><g class="k-tail">' +
    '<path class="k-tol" d="' + TAIL + '"/><path class="k-tf" d="' + TAIL + '"/><path class="k-ts" d="' + TAIL + '"/>' +
  '</g></g>' +
  '<ellipse class="k-o" cx="128" cy="408" rx="44" ry="30"/><ellipse class="k-o" cx="272" cy="408" rx="44" ry="30"/>' +
  '<path class="k-o" d="M118 425C96 360 108 290 150 250C175 230 225 230 250 250C292 290 304 360 282 425Q200 440 118 425Z"/>' +
  '<path class="k-st" d="M110 332Q127 335 136 346M107 362Q125 364 134 375M290 332Q273 335 264 346M293 362Q275 364 266 375"/>' +
  '<path class="k-c" d="M162 262C150 300 152 365 172 418Q200 428 228 418C248 365 250 300 238 262C222 250 178 250 162 262Z"/>' +
  '<g transform="translate(160 300) rotate(-4)">' + LEG + '</g>' +
  '<g transform="translate(200 175)"><g class="k-head">' +
    '<path class="k-o" d="M-122-34L-112-126Q-108-142-94-134L-28-94Z"/><path class="k-in" d="M-103-56L-99-112L-55-86Z"/>' +
    '<g class="k-ear"><path class="k-o" d="M122-34L112-126Q108-142 94-134L28-94Z"/><path class="k-in" d="M103-56L99-112L55-86Z"/></g>' +
    '<path class="k-o" d="M-138 0C-138-70-75-108 0-108C75-108 138-70 138 0C138 18 150 30 142 44C152 56 136 70 124 72C100 100 55 112 0 112C-55 112-100 100-124 72C-136 70-152 56-142 44C-150 30-138 18-138 0Z"/>' +
    '<path class="k-st" d="M-24-100Q-20-84-12-72M0-102V-76M24-100Q20-84 12-72M-134-4Q-118-4-104 4M-132 18Q-118 18-106 24M134-4Q118-4 104 4M132 18Q118 18 106 24"/>' +
    '<path class="k-c" d="M-58 52C-58 22-28 16 0 28C28 16 58 22 58 52C58 80 28 92 0 86C-28 92-58 80-58 52Z"/>' +
    '<ellipse class="k-blush" cx="-92" cy="38" rx="22" ry="12"/><ellipse class="k-blush" cx="92" cy="38" rx="22" ry="12"/>' +
    '<g class="k-eye"><ellipse class="k-iris" cx="-54" cy="0" rx="25" ry="31"/><ellipse class="k-pupil" cx="-54" cy="3" rx="18" ry="25"/><circle class="k-hi" cx="-62" cy="-10" r="9"/><circle class="k-hi" cx="-45" cy="13" r="4"/></g>' +
    '<g class="k-eye"><ellipse class="k-iris" cx="54" cy="0" rx="25" ry="31"/><ellipse class="k-pupil" cx="54" cy="3" rx="18" ry="25"/><circle class="k-hi" cx="46" cy="-10" r="9"/><circle class="k-hi" cx="63" cy="13" r="4"/></g>' +
    '<path class="k-happy" d="M-78 8Q-54-22-30 8M30 8Q54-22 78 8"/>' +
    '<path class="k-calm" d="M-76 2Q-54 18-32 2M32 2Q54 18 76 2"/>' +
    '<path class="k-wh" d="M-62 50L-138 36M-62 60L-142 62M-62 70L-132 88M62 50L138 36M62 60L142 62M62 70L132 88"/>' +
    '<path class="k-mouth" d="M0 45V52M0 52Q-10 64-22 56M0 52Q10 64 22 56"/>' +
    '<g class="k-mopen"><path class="k-mo" d="M-17 54Q0 50 17 54Q15 80 0 82Q-15 80-17 54Z"/><ellipse class="k-tongue" cx="0" cy="74" rx="9" ry="5"/></g>' +
    '<path class="k-nose" d="M-12 30Q0 23 12 30Q7 42 0 45Q-7 42-12 30Z"/>' +
  '</g></g>' +
  '<g transform="translate(240 300)"><g class="k-arm">' + LEG + '</g></g>' +
  '<g class="k-bow"><path d="M200 298L164 280Q154 298 164 316Z"/><path d="M200 298L236 280Q246 298 236 316Z"/><rect x="189" y="287" width="22" height="22" rx="7"/>' +
    '<circle class="k-dot" cx="175" cy="292" r="3.5"/><circle class="k-dot" cx="172" cy="306" r="3.5"/><circle class="k-dot" cx="225" cy="292" r="3.5"/><circle class="k-dot" cx="228" cy="306" r="3.5"/></g>' +
 '</g>' +
'</svg>';

/* put a cat into an element, return the <svg> */
function make(el){ el.innerHTML = SVG; return el.firstChild; }

/* how wide the mouth opens for a letter: vowels wide, consonants half, pauses shut */
function mouthFor(ch){
  if (/[aeiouAEIOU]/.test(ch)) return 1;
  if (/[\s.,!?…—–:;«»"“”()]/.test(ch)) return 0.08;
  if (/[a-zA-Zʻʼ‘’'А-яЁё]/.test(ch)) return 0.45;
  return 0.08;                                   // emoji and the like: the cat just smiles
}
function cut(s){ return s.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]️?|[\s\S]️?/g) || []; }

/* talk({cat, lines, line(i, L) → element to type into, done(), blip(), speed})
   lines: strings or {t, v, hold, wait, before(), after()}.  Returns {skip(), stop()}.
   v is a recorded voice file: the line is then typed at the pace of the voice and ends when the voice ends.
   skip(): finishes the line being typed, or moves on if the cat is just pausing. */
var sounds = {};
function sound(url){ var a = sounds[url]; if (!a){ a = sounds[url] = new Audio(); a.preload = 'auto'; a.src = url; } return a; }
function preload(urls){ urls.forEach(function(u){ if (u) sound(u); }); }
function talk(o){
  var i = -1, chars = [], k = 0, timer = null, state = 'go', out = null, L = null, aud = null, per = 0, voiceOn = false;
  var mouth = o.cat.querySelector('.k-mopen'), speed = o.speed || 42;
  function setMouth(v){ if (mouth) mouth.style.transform = 'scaleY(' + v + ')'; }
  function hush(){ if (aud){ aud.onended = aud.onerror = aud.onloadedmetadata = null; try { aud.pause(); } catch (e) {} } aud = null; voiceOn = false; }
  function nextLine(){
    clearTimeout(timer); hush();
    if (state === 'stop') return;
    i++;
    if (i >= o.lines.length){ state = 'done'; o.cat.classList.remove('talk'); setMouth(0.08); if (o.done) o.done(); return; }
    L = o.lines[i]; if (typeof L === 'string') L = {t: L};
    if (L.before) L.before();
    out = o.line(i, L);
    chars = cut(L.t); k = 0; per = 0; state = 'typing';
    o.cat.classList.add('talk');
    if (L.v && !o.mute) voice(i); else timer = setTimeout(tick, L.delay || 120);
  }
  function voice(n){
    var a = sound(L.v), started = false;
    function begin(ok){
      if (started || n !== i || state !== 'typing') return; started = true; clearTimeout(timer);
      if (ok && isFinite(a.duration) && a.duration > 0){
        aud = a; voiceOn = true; per = a.duration * 1000 * 0.9 / Math.max(1, chars.length);
        a.onended = function(){ if (n !== i) return; voiceOn = false; if (state === 'typing' && k >= chars.length) endLine(); };
        try { a.currentTime = 0; var p = a.play(); if (p && p['catch']) p['catch'](function(){ if (n === i){ voiceOn = false; per = 0; } }); } catch (e) { voiceOn = false; per = 0; }
      }
      tick();
    }
    a.onerror = function(){ begin(false); };
    if (a.readyState >= 1) begin(true);
    else { a.onloadedmetadata = function(){ begin(true); }; timer = setTimeout(function(){ begin(false); }, 2500); try { a.load(); } catch (e) {} }
  }
  function tick(){
    if (k >= chars.length){ if (voiceOn){ setMouth(0.3); return; } endLine(); return; }   // text is out, the voice is still finishing
    var ch = chars[k++], d = per || speed;
    out.appendChild(document.createTextNode(ch));
    if (o.typed) o.typed();
    setMouth(mouthFor(ch));
    if (!per){
      if (/[,;:—–]/.test(ch)) d = speed * 6; else if (/[.!?…]/.test(ch) && !/[.!?…]/.test(chars[k] || '')) d = speed * 10;
      if (o.blip && /[a-zA-Zʻʼ]/.test(ch) && k % 2) o.blip(ch);
    }
    timer = setTimeout(tick, d);
  }
  function endLine(){
    clearTimeout(timer);
    var spoken = !!per;
    state = 'hold'; o.cat.classList.remove('talk'); setMouth(0.08);
    if (o.lineDone) o.lineDone(i, L);
    if (L.after) L.after();
    if (L.wait) return;
    timer = setTimeout(nextLine, L.hold != null ? L.hold : spoken ? 700 : Math.max(1500, chars.length * 34));
  }
  setMouth(0.08);
  timer = setTimeout(nextLine, o.start || 0);
  return {
    skip: function(){
      if (state === 'typing'){ clearTimeout(timer); hush(); out.appendChild(document.createTextNode(chars.slice(k).join(''))); k = chars.length; if (o.typed) o.typed(); endLine(); return true; }
      if (state === 'hold'){ nextLine(); return true; }
      return false;
    },
    stop: function(){ clearTimeout(timer); hush(); state = 'stop'; o.cat.classList.remove('talk'); setMouth(0.08); },
    busy: function(){ return state === 'typing' || state === 'hold' || state === 'go'; }
  };
}

window.Kitty = {make: make, talk: talk, preload: preload};
})();
