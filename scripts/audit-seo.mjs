import assert from "node:assert/strict";
import { PUBLIC_PAGES, SOCIAL_IMAGE, absoluteUrl } from "../src/lib/seo.mjs";

const base = process.argv[2] || "http://localhost:7000";
const checks = [];
const decode = value => value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'");
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key, decode(value)]));
function meta(html, name) {
  return [...html.matchAll(/<meta\b[^>]*>/gi)].map(([tag]) => attributes(tag)).find(tag => tag.name === name || tag.property === name)?.content;
}
const canonicals = html => [...html.matchAll(/<link\b[^>]*>/gi)].map(([tag]) => attributes(tag)).filter(tag => tag.rel === "canonical").map(tag => new URL(tag.href).toString());

async function get(path, userAgent = "WhatsApp/2.24.1") {
  return fetch(new URL(path, base), { headers: { "User-Agent": userAgent }, signal: AbortSignal.timeout(90000) });
}

for (const page of PUBLIC_PAGES) {
  const response = await get(page.path);
  const html = await response.text();
  const prefix = page.path;
  assert.equal(response.status, 200, prefix + ": expected HTTP 200");
  assert.equal(decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || ""), page.title, prefix + ": title");
  assert.deepEqual(canonicals(html), [absoluteUrl(page.path)], prefix + ": canonical");
  assert.equal(meta(html, "description"), page.description, prefix + ": description");
  assert.equal(new URL(meta(html, "og:url")).toString(), absoluteUrl(page.path), prefix + ": og:url");
  assert.equal(meta(html, "og:image"), SOCIAL_IMAGE.url, prefix + ": og:image");
  assert.equal(meta(html, "og:image:width"), String(SOCIAL_IMAGE.width), prefix + ": image width");
  assert.equal(meta(html, "og:image:height"), String(SOCIAL_IMAGE.height), prefix + ": image height");
  assert.equal(meta(html, "twitter:card"), "summary_large_image", prefix + ": social card");
  assert.ok(!/noindex/i.test(meta(html, "robots") || ""), prefix + ": unexpectedly noindex");
  assert.ok(!/noindex/i.test(response.headers.get("x-robots-tag") || ""), prefix + ": noindex header");
  const graphs = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(([, json]) => JSON.parse(json));
  assert.ok(graphs.some(graph => graph["@graph"]?.some(node => node.url === absoluteUrl(page.path))), prefix + ": structured page data");
  checks.push({ path: prefix, status: response.status, canonical: canonicals(html)[0], image: meta(html, "og:image"), structuredData: true });
}

for (const path of ["/login", "/sedinvita/login", "/sedinvita/facilitador/login", "/votacion", "/eventos/seo-check"]) {
  const response = await get(path, "Googlebot");
  const html = await response.text();
  assert.match(response.headers.get("x-robots-tag") || "", /noindex/i, path + ": noindex header");
  assert.match(meta(html, "robots") || "", /noindex/i, path + ": noindex HTML");
  assert.deepEqual(canonicals(html), [], path + ": must not inherit a public canonical");
  checks.push({ path, noindex: true });
}

for (const path of ["/panel", "/registro/seo-check"]) {
  const response = await fetch(new URL(path, base), { redirect: "manual", signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 307, path + ": protected route must still redirect");
  assert.match(response.headers.get("location") || "", /\/login\?redirect=/, path + ": login redirect");
  assert.match(response.headers.get("x-robots-tag") || "", /noindex/i, path + ": redirect must be noindex");
  checks.push({ path, status: response.status, noindex: true, authenticationPreserved: true });
}

const missing = await get("/seo-audit-page-that-does-not-exist");
const missingHtml = await missing.text();
assert.equal(missing.status, 404, "unknown page must return a real 404");
assert.match(meta(missingHtml, "robots") || "", /noindex/i, "404 must be noindex");
assert.deepEqual(canonicals(missingHtml), [], "404 must not canonicalize to home");

const robots = await get("/robots.txt");
assert.equal(robots.status, 200);
const robotsText = await robots.text();
assert.match(robotsText, /Sitemap: https:\/\/sediprount\.org\/sitemap\.xml/);
assert.ok(!/Crawl-delay|Request-rate|User-agent: Googlebot/i.test(robotsText));
const sitemapResponse = await get("/sitemap.xml");
assert.equal(sitemapResponse.status, 200);
const sitemap = await sitemapResponse.text();
const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, url]) => url);
assert.deepEqual(locations.sort(), PUBLIC_PAGES.map(page => absoluteUrl(page.path)).sort());
assert.ok(!/localhost|vercel\.app|<lastmod>/.test(sitemap));

const imageResponse = await get(new URL(SOCIAL_IMAGE.url).pathname);
assert.equal(imageResponse.status, 200);
assert.match(imageResponse.headers.get("content-type") || "", /image\/jpeg/);
const image = new Uint8Array(await imageResponse.arrayBuffer());
assert.ok(image.byteLength < 500000, "social image should be less than 500 KB");

console.log(JSON.stringify({ base, checks, sitemapUrls: locations.length, missingStatus: missing.status, socialImageBytes: image.byteLength, result: "PASS" }, null, 2));
