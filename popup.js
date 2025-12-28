// popup.js — contador persistente y fallback de imagen
document.addEventListener('DOMContentLoaded', () => {
  const countEl = document.getElementById('count');
  const incBtn = document.getElementById('increment');
  const decBtn = document.getElementById('decrement');

  // Prefer chrome.storage.sync for cross-device sync; fallback to localStorage when not available
  const hasChromeSync = (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync);

  function getCount(cb) {
    if (hasChromeSync) {
      try {
        chrome.storage.sync.get(['count'], (res) => cb(Number(res?.count) || 0));
      } catch (e) {
        // if sync fails for any reason, fallback
        const v = Number(localStorage.getItem('mc_count')) || 0;
        cb(v);
      }
    } else {
      const v = Number(localStorage.getItem('mc_count')) || 0;
      cb(v);
    }
  }

  function setCount(n, cb) {
    if (hasChromeSync) {
      try {
        chrome.storage.sync.set({ count: n }, () => { if (cb) cb(); });
      } catch (e) {
        localStorage.setItem('mc_count', String(n));
        if (cb) cb();
      }
    } else {
      localStorage.setItem('mc_count', String(n));
      if (cb) cb();
    }
  }

  function render(n) {
    if (!countEl) return;
    countEl.textContent = n;
    countEl.classList.add('pop');
    setTimeout(() => countEl.classList.remove('pop'), 140);
  }

  // Inicializar valor
  getCount(render);

  // Añadir manejadores defensivamente
  if (incBtn) {
    incBtn.addEventListener('click', () => {
      getCount((v) => setCount(v + 1, () => render(v + 1)));
    });
  }

  if (decBtn) {
    decBtn.addEventListener('click', () => {
      getCount((v) => {
        const n = Math.max(0, v - 1);
        setCount(n, () => render(n));
      });
    });
  }


  // Listener para actualizaciones en storage: si el popup está abierto
  // se actualizará automáticamente cuando cambie el valor en 'sync'.
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync' && changes.count) {
        const newVal = Number(changes.count.newValue) || 0;
        render(newVal);
      }
    });
  }


});
