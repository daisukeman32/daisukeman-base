// Oracle Sounds - Web Audio API + BGM
// Shared across Psyche Telling / Intuition Oracle / Daily Oracle
(function(){
  var ctx = null;
  function getCtx(){
    if(!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }
  function ensureCtx(){
    var c = getCtx();
    if(c.state === 'suspended') c.resume();
    return c;
  }

  function play(fn){
    try{ fn(ensureCtx()); }catch(e){}
  }

  // 1. Select
  function select(){
    play(function(c){
      var o = c.createOscillator();
      var g = c.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(1800, c.currentTime);
      o.frequency.exponentialRampToValueAtTime(1200, c.currentTime + 0.06);
      g.gain.setValueAtTime(0.15, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.1);
      o.connect(g); g.connect(c.destination);
      o.start(c.currentTime); o.stop(c.currentTime + 0.1);
    });
  }

  // 2. Flip
  function flip(){
    play(function(c){
      var bufSize = c.sampleRate * 0.15;
      var buf = c.createBuffer(1, bufSize, c.sampleRate);
      var data = buf.getChannelData(0);
      for(var i = 0; i < bufSize; i++){
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
      }
      var src = c.createBufferSource();
      src.buffer = buf;
      var f = c.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.setValueAtTime(3000, c.currentTime);
      f.frequency.exponentialRampToValueAtTime(800, c.currentTime + 0.12);
      f.Q.value = 1.5;
      var g = c.createGain();
      g.gain.setValueAtTime(0.2, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15);
      src.connect(f); f.connect(g); g.connect(c.destination);
      src.start(c.currentTime);
    });
  }

  // 3. Divine
  function divine(){
    play(function(c){
      var t = c.currentTime;
      [220, 330, 440].forEach(function(freq, i){
        var o = c.createOscillator();
        var g = c.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.12 - i * 0.03, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 1.8);
        o.connect(g); g.connect(c.destination);
        o.start(t); o.stop(t + 1.8);
      });
    });
  }

  // 4. Reveal
  function reveal(){
    play(function(c){
      var t = c.currentTime;
      var notes = [523, 659, 784, 1047];
      notes.forEach(function(freq, i){
        var o = c.createOscillator();
        var g = c.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        var start = t + i * 0.12;
        g.gain.setValueAtTime(0, start);
        g.gain.linearRampToValueAtTime(0.1, start + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, start + 0.8);
        o.connect(g); g.connect(c.destination);
        o.start(start); o.stop(start + 0.8);
      });
    });
  }

  // 5. Transition
  function transition(){
    play(function(c){
      var bufSize = c.sampleRate * 0.5;
      var buf = c.createBuffer(1, bufSize, c.sampleRate);
      var data = buf.getChannelData(0);
      for(var i = 0; i < bufSize; i++){
        var env = Math.sin(Math.PI * i / bufSize);
        data[i] = (Math.random() * 2 - 1) * env;
      }
      var src = c.createBufferSource();
      src.buffer = buf;
      var f = c.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(400, c.currentTime);
      f.frequency.linearRampToValueAtTime(2000, c.currentTime + 0.25);
      f.frequency.linearRampToValueAtTime(400, c.currentTime + 0.5);
      var g = c.createGain();
      g.gain.value = 0.08;
      src.connect(f); f.connect(g); g.connect(c.destination);
      src.start(c.currentTime);
    });
  }

  // ===== BGM =====
  var bgm = new Audio('../oracle-bgm.mp3');
  bgm.loop = true;
  bgm.volume = 0;
  var BGM_VOL = 0.08;
  var bgmPlaying = false;
  var bgmMuted = false;

  function fadeIn(){
    var step = 0, steps = 40;
    var iv = setInterval(function(){
      step++;
      bgm.volume = Math.min(BGM_VOL, (step / steps) * BGM_VOL);
      if(step >= steps) clearInterval(iv);
    }, 50);
  }

  function tryPlay(){
    if(bgmPlaying) return;
    bgm.play().then(function(){
      bgmPlaying = true;
      fadeIn();
    }).catch(function(){});
  }

  // Try autoplay on load
  tryPlay();
  // Fallback: start on first user interaction
  ['click','touchstart','keydown'].forEach(function(evt){
    document.addEventListener(evt, function h(){
      tryPlay();
      document.removeEventListener(evt, h);
    }, {once: true});
  });

  // Toggle button - inject into header
  function injectToggle(){
    var header = document.querySelector('header');
    if(!header) return;
    var btn = document.createElement('button');
    btn.id = 'bgmToggle';
    btn.setAttribute('aria-label', 'BGM ON/OFF');
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07" class="bgm-wave1"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14" class="bgm-wave2"/></svg>';
    btn.style.cssText = 'background:none;border:1px solid var(--border,#3d2e1e);color:var(--text2,#8b7355);width:36px;height:36px;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .3s;flex-shrink:0;';
    btn.onmouseenter = function(){ btn.style.borderColor = 'var(--accent,#c9a84c)'; btn.style.color = 'var(--accent,#c9a84c)'; };
    btn.onmouseleave = function(){ btn.style.borderColor = bgmMuted ? 'var(--border,#3d2e1e)' : 'var(--accent,#c9a84c)'; btn.style.color = bgmMuted ? 'var(--text2,#8b7355)' : 'var(--accent,#c9a84c)'; };

    function updateIcon(){
      var w1 = btn.querySelector('.bgm-wave1');
      var w2 = btn.querySelector('.bgm-wave2');
      if(bgmMuted){
        if(w1) w1.style.display = 'none';
        if(w2) w2.style.display = 'none';
        btn.style.borderColor = 'var(--border,#3d2e1e)';
        btn.style.color = 'var(--text2,#8b7355)';
      } else {
        if(w1) w1.style.display = '';
        if(w2) w2.style.display = '';
        btn.style.borderColor = 'var(--accent,#c9a84c)';
        btn.style.color = 'var(--accent,#c9a84c)';
      }
    }

    btn.onclick = function(){
      bgmMuted = !bgmMuted;
      if(bgmMuted){
        bgm.volume = 0;
      } else {
        tryPlay();
        bgm.volume = BGM_VOL;
      }
      updateIcon();
    };

    header.appendChild(btn);
    // Initial state: playing = highlighted
    setTimeout(updateIcon, 100);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', injectToggle);
  } else {
    injectToggle();
  }

  window.OracleSound = {
    select: select,
    flip: flip,
    divine: divine,
    reveal: reveal,
    transition: transition
  };
})();
