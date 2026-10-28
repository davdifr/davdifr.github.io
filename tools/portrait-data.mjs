// Builds the portrait data texture for the landing page:
//   R = luminance, G/B = depth as 16 bits (G high byte, 12 significant bits; z in
//   model units, stored over Z_RANGE), A = portrait matte.
// The texture is 2 model units tall; the page turns each texel into particles.
//
// Regenerate with:
//   npm i --no-save @huggingface/transformers@3.7.5 sharp@0.34.4
//   node tools/portrait-data.mjs <photo.jpg> assets/home
// CROP and the landmarks are tuned to the current photo; measure them again for
// a new one.
import { pipeline, RawImage } from '@huggingface/transformers';
import sharp from 'sharp';
import path from 'node:path';

const [src, outDir] = process.argv.slice(2);

const CROP = { left: 470, top: 560, width: 1030, height: 1440 };
const W = 500, H = 700, N = W * H;
// Landmarks in texels of the W×H texture: top of the hair, bottom of the beard,
// the face's centre line and the height of the ears.
const HEAD_TOP = 60, CHIN = 295, CENTRE_X = 275, EAR_Y = 190;
const HEAD = CHIN - HEAD_TOP; // texels per head height
// From a profile photo of the same person: the nose tip sits 0.495 head heights
// in front of the ear. This sets how deep the relief is.
const NOSE_AHEAD_OF_EAR = 0.495;
// Must match the page: z is stored over this range.
const Z_RANGE = [-0.6, 0.6];

const cropped = await sharp(src).extract(CROP).resize(W, H, { kernel: 'lanczos3' }).jpeg({ quality: 95 }).toBuffer();
const image = await RawImage.fromBlob(new Blob([cropped]));

/* Matte and depth ------------------------------------------------------------- */

const matting = await pipeline('background-removal', 'Xenova/modnet', { dtype: 'fp32' });
const [cut] = await matting(image);
const alpha = Float32Array.from(
  await sharp(Buffer.from(cut.data), { raw: { width: cut.width, height: cut.height, channels: cut.channels } })
    .extractChannel(3).resize(W, H).raw().toBuffer(),
  (a) => a / 255,
);

const depthPipe = await pipeline('depth-estimation', 'onnx-community/depth-anything-v2-base', { dtype: 'fp32' });
const { predicted_depth } = await depthPipe(image);
const [dh, dw] = predicted_depth.dims.slice(-2);
const depth = new Float32Array(N);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const sx = Math.min(dw - 1.001, Math.max(0, ((x + 0.5) * dw) / W - 0.5));
  const sy = Math.min(dh - 1.001, Math.max(0, ((y + 0.5) * dh) / H - 0.5));
  const x0 = sx | 0, y0 = sy | 0, fx = sx - x0, fy = sy - y0, d = predicted_depth.data, i = y0 * dw + x0;
  depth[y * W + x] = (d[i] * (1 - fx) + d[i + 1] * fx) * (1 - fy) + (d[i + dw] * (1 - fx) + d[i + dw + 1] * fx) * fy;
}
const lum = await sharp(cropped).grayscale().extractChannel(0).raw().toBuffer();

/* Helpers -------------------------------------------------------------------- */

function gaussian(srcArr, sigma) {
  const r = Math.ceil(sigma * 3);
  const k = Array.from({ length: 2 * r + 1 }, (_, i) => Math.exp(-((i - r) ** 2) / (2 * sigma * sigma)));
  const tmp = new Float32Array(N), out = new Float32Array(N);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let s = 0;
    for (let i = -r; i <= r; i++) s += k[i + r] * srcArr[y * W + Math.min(W - 1, Math.max(0, x + i))];
    tmp[y * W + x] = s;
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let s = 0;
    for (let i = -r; i <= r; i++) s += k[i + r] * tmp[Math.min(H - 1, Math.max(0, y + i)) * W + x];
    out[y * W + x] = s;
  }
  return out;
}
// Blur that only averages pixels inside `mask`, so the background never leaks in.
function maskedBlur(values, mask, sigma) {
  const num = gaussian(values.map((v, i) => v * mask[i]), sigma);
  const den = gaussian(mask, sigma);
  return num.map((v, i) => (den[i] > 1e-4 ? v / den[i] : 0));
}
// Chamfer distance (in texels) from each matte texel to the silhouette.
function distanceToEdge(mask) {
  const d = new Float32Array(N).map((_, i) => (mask[i] ? 1e9 : 0));
  const relax = (x, y, dx, dy, w) => {
    const nx = x + dx, ny = y + dy;
    const o = nx < 0 || ny < 0 || nx >= W || ny >= H ? 0 : d[ny * W + nx];
    d[y * W + x] = Math.min(d[y * W + x], o + w);
  };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (mask[y * W + x]) {
    relax(x, y, -1, 0, 1); relax(x, y, 0, -1, 1); relax(x, y, -1, -1, 1.414); relax(x, y, 1, -1, 1.414);
  }
  for (let y = H - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) if (mask[y * W + x]) {
    relax(x, y, 1, 0, 1); relax(x, y, 0, 1, 1); relax(x, y, 1, 1, 1.414); relax(x, y, -1, 1, 1.414);
  }
  return d;
}

/* Matte: largest blob only (drops bits of railing at the edges) ---------------- */

const inMatte = new Float32Array(N);
{
  const label = new Int32Array(N).fill(-1);
  let best = -1, bestSize = 0, id = 0;
  for (let s = 0; s < N; s++) {
    if (alpha[s] < 0.5 || label[s] >= 0) continue;
    const stack = [s]; label[s] = id; let size = 0;
    while (stack.length) {
      const i = stack.pop(); size++;
      const x = i % W, y = (i / W) | 0;
      for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const n = ny * W + nx;
        if (alpha[n] >= 0.5 && label[n] < 0) { label[n] = id; stack.push(n); }
      }
    }
    if (size > bestSize) { bestSize = size; best = id; }
    id++;
  }
  for (let i = 0; i < N; i++) inMatte[i] = label[i] === best ? 1 : 0;
}
const edgeDist = distanceToEdge(inMatte);

/* Relief ------------------------------------------------------------------------ */

// Depth at the silhouette is a blend of subject and background, which is what
// produced a ghost outline behind the head: trust only the interior and extend
// it outwards.
const core = inMatte.map((m, i) => (m && edgeDist[i] > 5 ? 1 : 0));
const extended = maskedBlur(depth, core, 4);
const filled = depth.map((d, i) => (core[i] ? d : extended[i]));

// Normalise on the 2nd..98th percentile inside the matte, smooth lightly.
const vals = [];
for (let i = 0; i < N; i++) if (inMatte[i]) vals.push(filled[i]);
vals.sort((a, b) => a - b);
const lo = vals[Math.floor(vals.length * 0.02)], hi = vals[Math.floor(vals.length * 0.98)];
let model = maskedBlur(filled.map((v) => (v - lo) / (hi - lo || 1)), inMatte, 1.2);
// Hair and ears come out behind their surroundings; never let anything drop far
// below its neighbourhood, or it tears away when the head turns.
const floor = maskedBlur(model, inMatte, 20);
model = model.map((v, i) => Math.max(v, floor[i] - 0.1));

// The model keeps the sides of the head almost flat; add a rounded falloff
// towards the silhouette, about as deep as the head is wide.
const R = 0.36 * HEAD;
const smoothDist = maskedBlur(edgeDist, inMatte, 3);
const volume = smoothDist.map((d, i) => (inMatte[i] ? Math.sqrt(1 - (1 - Math.min(1, d / R)) ** 2) : 0));
const shape = model.map((m, i) => m * 0.55 + volume[i] * 0.45);

// Depth scale: the nose tip ends up NOSE_AHEAD_OF_EAR in front of the face's
// outline at ear height. The texture is 2 units tall, so a head is 2·HEAD/H.
let noseZ = -Infinity, earZ = 0, earN = 0;
for (let v = 0; v < H; v++) for (let u = 0; u < W; u++) {
  const i = v * W + u;
  if (!inMatte[i]) continue;
  if (Math.abs(u - CENTRE_X) < 0.12 * HEAD && v > HEAD_TOP + 0.35 * HEAD && v < HEAD_TOP + 0.75 * HEAD) noseZ = Math.max(noseZ, shape[i]);
  if (Math.abs(v - EAR_Y) < 3 && edgeDist[i] < 4 && Math.abs(u - CENTRE_X) < 0.45 * HEAD) { earZ += shape[i]; earN++; }
}
earZ /= earN;
const k = (NOSE_AHEAD_OF_EAR * (2 * HEAD) / H) / (noseZ - earZ);
// Centre the relief on the ear plane of the head.
const z = shape.map((s) => (s - earZ) * k);
console.log(`depth scale ${k.toFixed(3)} · nose ${((noseZ - earZ) * k).toFixed(3)} units ahead of the ears`);

/* Output ---------------------------------------------------------------------- */

// The page only reads texels inside the matte, plus a couple of neighbours when
// it interpolates depth at the edge: blank everything else so the PNG compresses.
const nearMatte = new Uint8Array(N);
for (let i = 0; i < N; i++) {
  if (!inMatte[i]) continue;
  const x = i % W, y = (i / W) | 0;
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
    const nx = x + dx, ny = y + dy;
    if (nx >= 0 && ny >= 0 && nx < W && ny < H) nearMatte[ny * W + nx] = 1;
  }
}

const out = Buffer.alloc(N * 4);
let clipped = 0;
for (let i = 0; i < N; i++) {
  if (!nearMatte[i]) continue;
  const t = (z[i] - Z_RANGE[0]) / (Z_RANGE[1] - Z_RANGE[0]);
  if (inMatte[i] && (t < 0 || t > 1)) clipped++;
  // 12 significant bits (1/4096 of Z_RANGE) are plenty and compress far better.
  const q = Math.round(Math.min(1, Math.max(0, t)) * 4095) << 4;
  out[i * 4] = lum[i];
  out[i * 4 + 1] = q >> 8;
  out[i * 4 + 2] = q & 255;
  out[i * 4 + 3] = inMatte[i] ? Math.round(alpha[i] * 255) : Math.min(127, Math.round(alpha[i] * 255));
}
if (clipped) console.warn(`${clipped} texels outside Z_RANGE`);
await sharp(out, { raw: { width: W, height: H, channels: 4 } }).png({ compressionLevel: 9 }).toFile(path.join(outDir, 'portrait-data.png'));

// Grey cut-out used when WebGL is unavailable.
const fallback = Buffer.alloc(N * 2);
for (let i = 0; i < N; i++) { fallback[i * 2] = lum[i]; fallback[i * 2 + 1] = out[i * 4 + 3]; }
await sharp(fallback, { raw: { width: W, height: H, channels: 2 } }).webp({ quality: 80, alphaQuality: 90 }).toFile(path.join(outDir, 'portrait-fallback.webp'));
