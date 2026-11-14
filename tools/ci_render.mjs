// CI render: node tools/ci_render.mjs <shard> <total> [scale=0.5] [gl=swangle]
// library/manifest.json-এর item-গুলো duration অনুযায়ী সমান ভাগ করে নিজের ভাগ render: out/renders/<id>.jpg + .mp4
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition, ensureBrowser } from "@remotion/renderer";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
const [shard, total] = [+process.argv[2] || 0, +process.argv[3] || 1];
const scale = +(process.argv[4] || 0.5);
const gl = process.argv[5] || "swangle";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
let items = JSON.parse(fs.readFileSync(path.join(root, "library/manifest.json"), "utf8"));
if (process.env.IDS && process.env.IDS !== "ALL") { const want = new Set(process.env.IDS.split(",")); items = items.filter((x) => want.has(x.id)); }
// greedy balance by duration
items.sort((a, b) => b.duration - a.duration);
const bins = Array.from({ length: total }, () => ({ load: 0, ids: [] }));
for (const it of items) { const b = bins.reduce((m, x) => (x.load < m.load ? x : m)); b.load += it.duration; b.ids.push(it); }
const mine = bins[shard].ids;
console.log(`shard ${shard}/${total}: ${mine.length} items, ${bins[shard].load.toFixed(1)} s of video, cpus ${os.cpus().length}, gl ${gl}`);
if (!mine.length) process.exit(0);
await ensureBrowser();
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts") });
const out = path.join(root, "out/renders"); fs.mkdirSync(out, { recursive: true });
const conc = Math.max(1, os.cpus().length);
const report = [];
for (const it of mine) {
  const t = Date.now();
  try {
    const inputProps = { id: it.id };
    const composition = await selectComposition({ serveUrl, id: "LibItem", inputProps, chromiumOptions: { gl } });
    await renderStill({ serveUrl, composition, inputProps, output: path.join(out, it.id + ".jpg"), frame: Math.min(composition.durationInFrames - 1, Math.round(it.still * 30)), scale, chromiumOptions: { gl }, timeoutInMilliseconds: 180000, imageFormat: "jpeg" });
    await renderMedia({ serveUrl, composition, inputProps, codec: "h264", crf: 26, outputLocation: path.join(out, it.id + ".mp4"), scale, concurrency: conc, chromiumOptions: { gl }, timeoutInMilliseconds: 180000 });
    const sec = (Date.now() - t) / 1000;
    report.push({ id: it.id, ok: true, sec, frames: composition.durationInFrames });
    console.log(`ok ${it.id} ${composition.durationInFrames}f ${sec.toFixed(1)}s (${(composition.durationInFrames / sec).toFixed(2)} fps)`);
  } catch (e) {
    report.push({ id: it.id, ok: false, err: String(e).slice(0, 300) });
    console.log(`FAIL ${it.id} ${String(e).slice(0, 300)}`);
  }
}
fs.writeFileSync(path.join(out, `report_${shard}.json`), JSON.stringify(report, null, 1));
