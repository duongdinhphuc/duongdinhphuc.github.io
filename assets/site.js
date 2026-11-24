/* Nút dùng chung cho mọi trang: về trang chủ, bật/tắt nhạc, đổi ngày/đêm.
   Cách dùng (cuối <body>, sau khi nạp theme-init.js trong <head> và site.css):
     Site.init({
       home: true,                       // trang chủ thì không có nút "Trang chủ"
       homeHref: '../',                  // đường dẫn về trang chủ (trang con)
       music: { start(), stop() },       // nhạc riêng của trang; bỏ trống = hộp nhạc nhẹ mặc định
       onTheme(theme) {}                 // gọi sau khi đổi 'light' | 'dark'
     });
   Trang tự phát nhạc (ví dụ mở hộp quà) thì gọi Site.setMusic(true) để nút cập nhật. */
window.Site = (function () {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let opt = {}, modeBtn, musicBtn, musicOn = false;

  /* ---------------- Ngày / đêm ---------------- */
  function syncMode() {
    const day = root.dataset.theme === 'light';
    modeBtn.classList.toggle('is-day', day);
    const t = day ? 'Chuyển sang ban đêm' : 'Chuyển sang ban ngày';
    modeBtn.setAttribute('aria-label', t); modeBtn.title = t;
  }
  function switchTo(next, save) {
    if (root.dataset.theme === next) return;
    const apply = () => {
      root.dataset.theme = next; root.classList.toggle('day', next === 'light');
      try { save ? localStorage.setItem('themeChoice', JSON.stringify({ t: next, p: __period() })) : localStorage.removeItem('themeChoice'); } catch (e) {}
      syncMode(); opt.onTheme && opt.onTheme(next);
    };
    const r = modeBtn.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    const rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    if (reduce || !document.startViewTransition || document.hidden) {
      root.classList.add('site-fade'); apply(); setTimeout(() => root.classList.remove('site-fade'), 700); return;
    }
    const vt = document.startViewTransition(apply);
    vt.ready.then(() => root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${rad}px at ${x}px ${y}px)`] },
      { duration: 900, easing: 'cubic-bezier(.65,0,.25,1)', pseudoElement: '::view-transition-new(root)' }
    )).catch(() => {});
  }
  function autoCheck() {
    const p = __phase(); if (root.dataset.phase !== p) root.dataset.phase = p;   // bình minh / hoàng hôn: lớp ánh sáng tự mờ dần vào/ra
    const w = __wantedTheme(); if (w !== root.dataset.theme) switchTo(w, false);
  }

  /* ---------------- Nhạc ---------------- */
  function musicUI() {
    musicBtn.classList.toggle('is-on', musicOn);
    musicBtn.setAttribute('aria-pressed', musicOn);
    musicBtn.title = musicOn ? 'Tắt nhạc' : 'Bật nhạc';
    musicBtn.setAttribute('aria-label', musicBtn.title);
  }
  function remember(on) { try { localStorage.setItem('musicOn', on ? '1' : '0'); } catch (e) {} }
  function setMusic(on) {
    musicOn = !!on;
    if (!musicBtn) return;                 // trang gọi trước khi Site.init chạy: chỉ ghi trạng thái, không ghi đè lựa chọn đã lưu
    remember(musicOn); musicUI();
  }
  function toggleMusic() {
    const m = opt.music || ambient;
    if (musicOn) { m.stop(); setMusic(false); } else { m.start(); setMusic(true); }
  }

  /* Hộp nhạc nhẹ mặc định (Web Audio, không cần file): Cmaj7 – Am7 – Fmaj7 – G6, nốt rải + tiếng vọng */
  const ambient = (function () {
    let ac = null, master = null, delay = null, timer = 0, nextT = 0, step = 0, playing = false;
    const MIDI = n => 440 * Math.pow(2, (n - 69) / 12), BEAT = .5;
    const CH = [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 64]];
    function setup() {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      master = ac.createGain(); master.gain.value = 0;
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200; master.connect(lp).connect(ac.destination);
      delay = ac.createDelay(1); delay.delayTime.value = .42;
      const fb = ac.createGain(); fb.gain.value = .38; const dlp = ac.createBiquadFilter(); dlp.type = 'lowpass'; dlp.frequency.value = 1800;
      const wet = ac.createGain(); wet.gain.value = .45; delay.connect(dlp).connect(fb).connect(delay); dlp.connect(wet).connect(master);
    }
    function bell(n, t, v) {
      const f = MIDI(n), o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), g2 = ac.createGain();
      o.type = 'sine'; o2.type = 'sine'; o.frequency.value = f; o2.frequency.value = f * 3.01; g2.gain.value = .12;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .01); g.gain.exponentialRampToValueAtTime(.0008, t + 2.4);
      o.connect(g); o2.connect(g2).connect(g); g.connect(master); g.connect(delay); o.start(t); o2.start(t); o.stop(t + 2.5); o2.stop(t + 2.5);
    }
    function pad(ch, t, len) {
      ch.slice(0, 3).forEach((n, i) => {
        const o = ac.createOscillator(), g = ac.createGain(); o.type = 'triangle'; o.frequency.value = MIDI(n - 12); o.detune.value = (i - 1) * 6;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.035, t + 1.2); g.gain.setValueAtTime(.035, t + len - 1); g.gain.linearRampToValueAtTime(0, t + len + .4);
        o.connect(g).connect(master); o.start(t); o.stop(t + len + .5);
      });
    }
    function schedule() {
      while (nextT < ac.currentTime + .25) {
        const ch = CH[Math.floor(step / 8) % CH.length], b = step % 8;
        if (b === 0) pad(ch, nextT, 8 * BEAT);
        if (b % 2 === 0 || Math.random() < .45) {
          const pool = [...ch, ch[0] + 12, ch[1] + 12, ch[2] + 12], n = pool[(Math.random() * pool.length) | 0] + 12;
          bell(n, nextT + (b % 2 ? .02 : 0), b === 0 ? .16 : .08 + Math.random() * .05);
        }
        nextT += BEAT; step++;
      }
    }
    function start() {
      if (!ac) setup(); if (ac.state === 'suspended') ac.resume();
      playing = true; nextT = ac.currentTime + .1;
      master.gain.cancelScheduledValues(ac.currentTime); master.gain.setValueAtTime(master.gain.value, ac.currentTime);
      master.gain.linearRampToValueAtTime(.55, ac.currentTime + 2.5);
      clearInterval(timer); timer = setInterval(schedule, 90); schedule();
    }
    function stop() {
      if (!ac) return; playing = false; clearInterval(timer);
      master.gain.cancelScheduledValues(ac.currentTime); master.gain.setValueAtTime(master.gain.value, ac.currentTime);
      master.gain.linearRampToValueAtTime(0, ac.currentTime + .8);
      setTimeout(() => { if (!playing) ac.suspend(); }, 900);
    }
    document.addEventListener('visibilitychange', () => {
      if (!ac || !playing) return;
      if (document.hidden) { clearInterval(timer); ac.suspend(); } else { ac.resume(); nextT = ac.currentTime + .1; timer = setInterval(schedule, 90); }
    });
    addEventListener('pagehide', () => { if (playing && ac) { master.gain.setValueAtTime(master.gain.value, ac.currentTime); master.gain.linearRampToValueAtTime(0, ac.currentTime + .3); } });
    return { start, stop };
  })();

  /* ---------------- Dựng nút ---------------- */
  function init(o) {
    opt = o || {};
    if (!opt.home) {
      const a = document.createElement('a');
      a.className = 'site-home'; a.href = opt.homeHref || '../'; a.setAttribute('aria-label', 'Về trang chủ'); a.title = 'Về trang chủ';
      a.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="M11 18l-6-6 6-6"/></svg>';
      document.body.appendChild(a);
    }
    const tint = document.createElement('div'); tint.className = 'site-tint'; tint.setAttribute('aria-hidden', 'true');
    tint.innerHTML = '<i class="dawn"></i><i class="dusk"></i>';
    document.body.appendChild(tint);
    const box = document.createElement('div'); box.className = 'site-ctrls';
    box.innerHTML =
      '<button class="site-btn" type="button" data-site="music" aria-pressed="false"><span class="site-eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span></button>' +
      '<button class="site-btn" type="button" data-site="mode"><span class="site-orb" aria-hidden="true"></span></button>';
    document.body.appendChild(box);
    musicBtn = box.querySelector('[data-site="music"]'); modeBtn = box.querySelector('[data-site="mode"]');
    syncMode(); musicUI();
    modeBtn.addEventListener('click', () => switchTo(root.dataset.theme === 'light' ? 'dark' : 'light', true));
    musicBtn.addEventListener('click', toggleMusic);
    setInterval(autoCheck, 30000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) autoCheck(); });
    opt.onTheme && opt.onTheme(root.dataset.theme);
    // Lần trước để nhạc bật: phát tiếp ngay lần chạm/bấm phím đầu tiên (trình duyệt không cho tự phát)
    let want = false; try { want = localStorage.getItem('musicOn') === '1'; } catch (e) {}
    if (want && !opt.noAutoResume) {
      const resume = e => {
        if (e.target && e.target.closest && e.target.closest('.site-ctrls')) return;   // bấm chính nút nhạc thì để nút xử lý
        removeEventListener('pointerdown', resume, true); removeEventListener('keydown', resume, true);
        if (!musicOn) { (opt.music || ambient).start(); setMusic(true); }
      };
      addEventListener('pointerdown', resume, true); addEventListener('keydown', resume, true);
    }
  }
  return { init, setMusic, ambient, isMusicOn: () => musicOn };
})();
