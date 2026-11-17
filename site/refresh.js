// Consulta la versión publicada sin reutilizar la caché del navegador.
(() => {
  if (!/^https?:$/.test(location.protocol)) return;
  const current = document.querySelector('meta[name="app-version"]')?.content;
  if (!current) return;
  let checking = false;
  let updating = false;
  async function checkVersion() {
    if (checking || updating || document.hidden) return;
    checking = true;
    try {
      const response = await fetch(`./version.json?check=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) return;
      const { version } = await response.json();
      if (typeof version === 'string' && /^[a-f0-9]{12}$/.test(version) && version !== current) {
        updating = true;
        const url = new URL(location.href);
        url.searchParams.set('v', version);
        location.replace(url.href);
      }
    } catch (_) {
      // Si no hay conexión, se sigue usando la versión disponible.
    } finally {
      checking = false;
    }
  }
  checkVersion();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkVersion(); });
  window.addEventListener('pageshow', event => { if (event.persisted) checkVersion(); });
  setInterval(checkVersion, 60000);
})();
