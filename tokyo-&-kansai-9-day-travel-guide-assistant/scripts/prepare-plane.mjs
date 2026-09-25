// One-off asset prep: key the white background out of the top-down plane JPG.
// Usage: node scripts/prepare-plane.mjs <input.jpg> <output.png>
import sharp from 'sharp';

const [, , input, output] = process.argv;
if (!input || !output) {
  console.error('usage: node scripts/prepare-plane.mjs <input> <output>');
  process.exit(1);
}

const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const N = W * H;

const minC = new Uint8Array(N);
for (let i = 0; i < N; i++) {
  const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
  minC[i] = Math.min(r, g, b);
}

// 1) Flood-fill background from the border through near-white pixels.
const BG_T = 253;
const isBg = new Uint8Array(N);
const stack = [];
const push = (x, y) => {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = y * W + x;
  if (isBg[i] || minC[i] < BG_T) return;
  isBg[i] = 1;
  stack.push(i);
};
for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1); }
for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y); }
while (stack.length) {
  const i = stack.pop();
  const x = i % W, y = (i / W) | 0;
  push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
}

// 2) Label foreground components; drop small islands (watermark text, specks).
const label = new Int32Array(N).fill(-1);
const areas = [];
for (let s = 0; s < N; s++) {
  if (isBg[s] || label[s] !== -1) continue;
  const id = areas.length;
  let area = 0;
  const q = [s];
  label[s] = id;
  while (q.length) {
    const i = q.pop();
    area++;
    const x = i % W, y = (i / W) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const j = ny * W + nx;
      if (isBg[j] || label[j] !== -1) continue;
      label[j] = id;
      q.push(j);
    }
  }
  areas.push(area);
}
const MIN_AREA = 1500;
for (let i = 0; i < N; i++) {
  if (!isBg[i] && areas[label[i]] < MIN_AREA) isBg[i] = 1;
}

// 3) Build RGBA with feathered edges.
const out = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  out[i * 4] = data[i * 3];
  out[i * 4 + 1] = data[i * 3 + 1];
  out[i * 4 + 2] = data[i * 3 + 2];
  if (isBg[i]) { out[i * 4 + 3] = 0; continue; }
  const x = i % W, y = (i / W) | 0;
  let touchesBg = false;
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
    if (isBg[ny * W + nx]) { touchesBg = true; break; }
  }
  if (touchesBg) {
    // antialiased rim: whiter → more transparent
    const a = Math.max(0, Math.min(1, (255 - minC[i]) / 10));
    out[i * 4 + 3] = Math.round(a * 255);
  } else {
    out[i * 4 + 3] = 255;
  }
}

// 4) Trim to content and export.
await sharp(out, { raw: { width: W, height: H, channels: 4 } })
  .trim({ threshold: 1 })
  .png({ compressionLevel: 9 })
  .toFile(output);

const kept = areas.filter((a) => a >= MIN_AREA).length;
console.log(`done: ${W}x${H}, components kept=${kept}, dropped=${areas.length - kept}`);
