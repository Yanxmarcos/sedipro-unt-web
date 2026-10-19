export const LOADING_ROUTES = {
  "/": "Inicio",
  "/proyectos": "Proyectos",
  "/nosotros": "Nosotros",
  "/login": "Acceso sediprano",
};

export function loadingPath(pathname) {
  const path = pathname.replace(/\/$/, "") || "/";
  return Object.hasOwn(LOADING_ROUTES, path) ? path : null;
}

export function navigationDestination(anchor, event, location) {
  if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  if (anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return null;
  const url = new URL(anchor.href, location.href);
  if (url.origin !== location.origin || !loadingPath(url.pathname) || url.pathname === location.pathname) return null;
  return url;
}

export function pause(milliseconds, signal) {
  return new Promise(resolve => {
    if (signal.aborted) { resolve(false); return; }
    const finish = completed => { clearTimeout(timer); signal.removeEventListener("abort", abort); resolve(completed); };
    const abort = () => finish(false);
    const timer = setTimeout(() => finish(true), milliseconds);
    signal.addEventListener("abort", abort, { once: true });
  });
}

export function nextPaint(signal) {
  return new Promise(resolve => {
    if (signal.aborted) { resolve(); return; }
    const finish = () => { cancelAnimationFrame(frame); signal.removeEventListener("abort", finish); resolve(); };
    const frame = requestAnimationFrame(finish);
    signal.addEventListener("abort", finish, { once: true });
  });
}

function untilEvent(element, ready, success, failure, signal) {
  return new Promise(resolve => {
    const finish = () => {
      element.removeEventListener(success, finish);
      if (failure) element.removeEventListener(failure, finish);
      signal.removeEventListener("abort", finish);
      resolve();
    };
    if (signal.aborted || ready()) { resolve(); return; }
    element.addEventListener(success, finish, { once: true });
    if (failure) element.addEventListener(failure, finish, { once: true });
    signal.addEventListener("abort", finish, { once: true });
  });
}

function firstViewImages(root) {
  return [...root.querySelectorAll("img")].filter(image => {
    const bounds = image.getBoundingClientRect();
    return bounds.width > 0 && bounds.height > 0 && bounds.top < innerHeight && bounds.bottom > 0 && bounds.left < innerWidth && bounds.right > 0;
  });
}

// This is settled readiness of the first view, not an invented download-byte percentage.
// Lazy photos/videos farther down the page deliberately do not hold the entrance open.
export async function waitForView(root, onProgress, signal, maximumWait = 10000) {
  const local = new AbortController();
  const abort = () => local.abort();
  signal.addEventListener("abort", abort, { once: true });
  if (signal.aborted) local.abort();
  let timer;
  let settled = 0;
  let total = 1;
  const work = async () => {
    await nextPaint(local.signal);
    await nextPaint(local.signal);
    if (local.signal.aborted) return false;
    const sheets = [...document.querySelectorAll('link[rel="stylesheet"]')].map(link => untilEvent(link, () => Boolean(link.sheet), "load", "error", local.signal));
    const images = firstViewImages(root).map(async image => {
      await untilEvent(image, () => image.complete, "load", "error", local.signal);
      if (!local.signal.aborted && image.naturalWidth && image.decode) await image.decode().catch(() => {});
    });
    const documentReady = untilEvent(document, () => document.readyState !== "loading", "DOMContentLoaded", null, local.signal);
    const fonts = Promise.all(sheets).then(() => document.fonts?.ready);
    const tasks = [Promise.resolve(), documentReady, fonts, ...sheets, ...images];
    total = tasks.length;
    await Promise.all(tasks.map(async task => {
      await task;
      if (!local.signal.aborted) onProgress(Math.round(++settled / total * 100));
    }));
    return !local.signal.aborted;
  };
  const deadline = new Promise(resolve => { timer = setTimeout(() => resolve(false), maximumWait); });
  const cancellation = new Promise(resolve => {
    if (local.signal.aborted) resolve(false);
    else local.signal.addEventListener("abort", () => resolve(false), { once: true });
  });
  try {
    const complete = await Promise.race([work(), deadline, cancellation]);
    return { complete, settled, total };
  } finally {
    clearTimeout(timer);
    local.abort();
    signal.removeEventListener("abort", abort);
  }
}
