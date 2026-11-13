// X Video Volume Memory: when you change the volume on any video, the new level is saved
// and applied to every other video on x.com / twitter.com.
(() => {
  let enabled = true;
  let saved = 1;
  let pointerDown = false;
  let lastInput = 0;
  let lastLocalChange = 0;
  let writeTimer = null;
  const ignoreUntil = new WeakMap(); // video -> time until which its volume changes are treated as page-made

  const same = (a, b) => Math.abs(a - b) < 0.005;
  const mark = () => { lastInput = Date.now(); };

  // ----- load settings -----
  chrome.storage.local.get({ enabled: true, volume: 1 }, (v) => {
    enabled = v.enabled;
    saved = v.volume;
    applyAll();
  });

  chrome.storage.onChanged.addListener((ch) => {
    if (ch.enabled) {
      enabled = ch.enabled.newValue !== false;
    }
    // A volume change from the popup or another tab (not one we are making right now).
    if (ch.volume && !pointerDown && Date.now() - lastLocalChange > 1000 && !same(ch.volume.newValue, saved)) {
      saved = ch.volume.newValue;
    }
    applyAll();
  });

  // ----- apply the saved volume -----
  function apply(v) {
    if (!enabled || !(v instanceof HTMLVideoElement) || same(v.volume, saved)) return;
    ignoreUntil.set(v, Date.now() + 1000);
    try { v.volume = saved; } catch (e) { /* ignore */ }
  }

  function applyAll() {
    document.querySelectorAll("video").forEach(apply);
  }

  // ----- know when the change comes from the person, not from the page's own player code -----
  addEventListener("pointerdown", () => { pointerDown = true; mark(); }, true);
  addEventListener("pointerup", () => { pointerDown = false; mark(); }, true);
  addEventListener("pointercancel", () => { pointerDown = false; mark(); }, true);
  addEventListener("pointermove", () => { if (pointerDown) mark(); }, true);
  addEventListener("keydown", mark, true);

  function save(vol) {
    saved = vol;
    lastLocalChange = Date.now();
    clearTimeout(writeTimer);
    writeTimer = setTimeout(() => chrome.storage.local.set({ volume: saved }), 150);
  }

  // Volume events do not bubble, so listen in the capture phase for every video on the page.
  document.addEventListener("volumechange", (e) => {
    const v = e.target;
    if (!enabled || !(v instanceof HTMLVideoElement)) return;
    const fromPerson = pointerDown || Date.now() - lastInput < 300;
    if (!fromPerson) return;                                           // the page changed it, not you
    if (!pointerDown && Date.now() < (ignoreUntil.get(v) || 0)) return; // player start-up
    if (v.muted) return;                                               // mute button: keep the last volume
    const vol = Math.round(v.volume * 100) / 100;
    if (!same(vol, saved)) save(vol);
  }, true);

  // Apply to videos as they start, and when the page resets them.
  for (const type of ["loadstart", "loadedmetadata", "play", "playing"]) {
    document.addEventListener(type, (e) => apply(e.target), true);
  }

  // Apply to videos as they are added to the page.
  new MutationObserver((records) => {
    for (const r of records) {
      for (const n of r.addedNodes) {
        if (n.nodeType !== 1) continue;
        if (n.tagName === "VIDEO") apply(n);
        else if (n.querySelectorAll) n.querySelectorAll("video").forEach(apply);
      }
    }
  }).observe(document, { childList: true, subtree: true });
})();
