/* Kohikori · steadier audio on iPhone/iPad (and anywhere speech is flaky)
   iOS Safari's speech engine often drops a request that comes right after a cancel, or the
   first one after the page loads. This wraps the browser's speech calls so that:
   - "stop" only cancels when something is actually playing,
   - a new clip waits a moment after a cancel instead of being swallowed,
   - the engine is woken up silently on the first tap on the page,
   - a clip that still hasn't started after a short wait is tried once more. */
(function(){
  const ss = window.speechSynthesis;
  if (!ss || typeof window.SpeechSynthesisUtterance === 'undefined' || ss.__kohiFix) return;
  ss.__kohiFix = true;
  const origSpeak = ss.speak.bind(ss), origCancel = ss.cancel.bind(ss);
  const keep = [];                       // Safari can drop utterances that nothing references
  let lastCancel = 0, unlocked = false, pendingTimer = null;
  const hold = u => { keep.push(u); if (keep.length > 6) keep.shift(); };

  ss.cancel = function(){
    clearTimeout(pendingTimer); pendingTimer = null;
    if (ss.speaking || ss.pending){ lastCancel = Date.now(); origCancel(); }
  };

  function play(u, retry){
    let started = false;
    u.addEventListener('start', () => { started = true; });
    u.addEventListener('end', () => { started = true; });
    hold(u);
    if (ss.paused) try { ss.resume(); } catch(e){}
    origSpeak(u);
    if (retry) setTimeout(() => {          // nothing happened: try once more
      if (!started && !ss.speaking && keep.includes(u)){
        try { origCancel(); } catch(e){}
        const v = new SpeechSynthesisUtterance(u.text);
        for (const k of ['lang','voice','rate','pitch','volume','onend','onerror','onstart']) try { if (u[k] != null) v[k] = u[k]; } catch(e){}
        setTimeout(() => play(v, false), 80);
      }
    }, 700);
  }

  ss.speak = function(u){
    clearTimeout(pendingTimer); pendingTimer = null;
    const gap = Date.now() - lastCancel;
    if (gap < 120) pendingTimer = setTimeout(() => { pendingTimer = null; play(u, true); }, 120 - gap);
    else play(u, true);
  };

  // wake the engine with a silent clip on the first tap, so the first real one isn't lost
  function unlock(){
    if (unlocked) return; unlocked = true;
    try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; hold(u); origSpeak(u); } catch(e){}
    document.removeEventListener('touchend', unlock, true); document.removeEventListener('click', unlock, true);
  }
  document.addEventListener('touchend', unlock, true);
  document.addEventListener('click', unlock, true);
  // coming back to the tab can leave the engine paused
  document.addEventListener('visibilitychange', () => { if (!document.hidden && ss.paused) try { ss.resume(); } catch(e){} });
})();
