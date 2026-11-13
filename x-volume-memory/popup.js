const on = document.getElementById("on");
const vol = document.getElementById("vol");
const pct = document.getElementById("pct");

chrome.storage.local.get({ enabled: true, volume: 1 }, (v) => {
  on.checked = v.enabled;
  vol.value = Math.round(v.volume * 100);
  pct.textContent = vol.value + "%";
});

on.addEventListener("change", () => chrome.storage.local.set({ enabled: on.checked }));
vol.addEventListener("input", () => {
  pct.textContent = vol.value + "%";
  chrome.storage.local.set({ volume: Number(vol.value) / 100 });
});
