// Landing page: the portrait as a WebGL point cloud, plus the small bits of
// scroll choreography around it. No dependencies.
//
// portrait-data.png packs everything the cloud needs per texel:
//   R = luminance, G/B = depth as 16 bits over Z_RANGE, A = portrait matte.
// It is generated from the photo by tools/portrait-data.mjs.

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const narrow = matchMedia('(max-width: 720px)');

/* Text reveal + scramble ------------------------------------------------ */

const GLYPHS = '!<>-_\\/[]{}—=+*^?#01';

function scramble(el) {
  const target = el.textContent;
  if (reduceMotion) return;
  el.setAttribute('aria-label', target);
  const start = performance.now();
  const duration = 700;
  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const settled = Math.floor(t * target.length);
    let out = target.slice(0, settled);
    for (let i = settled; i < target.length; i++) {
      out += target[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    el.textContent = out;
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const io = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      if (entry.target.hasAttribute('data-scramble')) scramble(entry.target);
      io.unobserve(entry.target);
    }
  },
  { rootMargin: '0px 0px -12% 0px' },
);
document.querySelectorAll('.reveal, [data-scramble]').forEach((el) => io.observe(el));

/* Point cloud ------------------------------------------------------------ */

const VERT = `
attribute vec3 aPos;
attribute vec3 aDir;
attribute vec3 aInfo; // luminance, seed, fade

uniform mat4 uProj;
uniform float uCamDist;
uniform float uTime;
uniform float uYaw;
uniform float uPitch;
uniform float uDisperse;
uniform vec2 uOffset;
uniform float uScale;
uniform vec2 uMouse;
uniform float uMouseOn;
uniform float uAspect;
uniform float uPointSize;
uniform float uMaxPointSize;
uniform float uScatterDim;

varying float vAlpha;
varying float vGlow;

void main() {
  float lum = aInfo.x;
  float seed = aInfo.y;

  vec3 p = aPos;

  // Idle breathing, a hair of movement so it never looks like a still.
  p += aDir * 0.004 * sin(uTime * 1.4 + seed * 6.2831);

  // Scroll dispersion: particles leave in a staggered wave, drift, and come back.
  float leave = smoothstep(0.0, 1.0, uDisperse * 1.7 - seed * 0.7);
  p += aDir * leave * (0.9 + seed * 2.6);
  p += vec3(
    sin(uTime * 0.21 + seed * 41.0),
    cos(uTime * 0.17 + seed * 29.0),
    sin(uTime * 0.13 + seed * 17.0)
  ) * 0.22 * leave;

  float cy = cos(uYaw), sy = sin(uYaw);
  p = vec3(cy * p.x + sy * p.z, p.y, -sy * p.x + cy * p.z);
  float cp = cos(uPitch), sp = sin(uPitch);
  p = vec3(p.x, cp * p.y - sp * p.z, sp * p.y + cp * p.z);
  p *= uScale;

  vec4 clip = uProj * vec4(p.x, p.y, p.z - uCamDist, 1.0);
  vec2 ndc = clip.xy / clip.w + uOffset;

  // Push particles away from the pointer.
  vec2 d = ndc - uMouse;
  d.x *= uAspect;
  float dist = length(d);
  float force = uMouseOn * (1.0 - smoothstep(0.0, 0.32, dist));
  vec2 push = d / max(dist, 1e-4) * force * force * 0.11;
  push.x /= uAspect;
  ndc += push;

  gl_Position = vec4(ndc * clip.w, clip.z, clip.w);
  // Scattered particles stay small: they drift behind the text, and the ones
  // that fly close to the camera would otherwise turn into big blurry blobs.
  gl_PointSize = min(uPointSize * (0.55 + 0.9 * lum) * (uCamDist / clip.w) * (1.0 + leave * 0.15), uMaxPointSize);

  vGlow = force;
  vAlpha = (0.16 + 0.84 * lum) * aInfo.z * (1.0 - uScatterDim * leave);
}
`;

const FRAG = `
precision mediump float;
uniform vec3 uAccent;
varying float vAlpha;
varying float vGlow;

void main() {
  float r = length(gl_PointCoord - 0.5);
  if (r > 0.5) discard;
  float a = vAlpha * smoothstep(0.5, 0.1, r);
  vec3 color = mix(vec3(0.95, 0.95, 0.93), uAccent, clamp(vGlow * 1.4, 0.0, 1.0));
  gl_FragColor = vec4(color * a, a);
}
`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
  return shader;
}

async function readPixels(url) {
  const img = new Image();
  img.src = url;
  await img.decode();
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, c.width, c.height);
}

// Turns the data texture into particles. Bright areas get more particles than
// dark ones; edges and the silhouette only a little more, so the face stays soft
// instead of looking traced.
const Z_RANGE = [-0.6, 0.6]; // must match tools/portrait-data.mjs

// The photo is cropped at the bottom and both sides (and has a bit of arm and
// railing in the bottom-left corner): thin the particles out and fade them
// towards those edges, so the bust dissolves instead of ending in a cut.
function vignette(u, v) {
  const s = (a, b, t) => {
    const c = Math.min(1, Math.max(0, (t - a) / (b - a)));
    return c * c * (3 - 2 * c);
  };
  const bottom = s(1, 0.62, v);
  const sides = s(0, 0.16, u) * s(1, 0.84, u);
  return bottom * (0.25 + 0.75 * sides) * s(0.82, 0.55, v + (1 - sides) * 0.3);
}

function buildCloud({ data, width: W, height: H }, target) {
  const at = (x, y, c) => data[(Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))) * 4 + c] / 255;
  const zTexel = (x, y) => {
    const i = (Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))) * 4;
    return Z_RANGE[0] + ((data[i + 1] * 256 + data[i + 2]) / 65535) * (Z_RANGE[1] - Z_RANGE[0]);
  };
  // Depth interpolated between texels, so the relief is smooth instead of stepped.
  const zAt = (u, v) => {
    const x = u - 0.5, y = v - 0.5, x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
    return (zTexel(x0, y0) * (1 - fx) + zTexel(x0 + 1, y0) * fx) * (1 - fy) + (zTexel(x0, y0 + 1) * (1 - fx) + zTexel(x0 + 1, y0 + 1) * fx) * fy;
  };
  const weights = new Float32Array(W * H);
  let total = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const a = at(x, y, 3);
      if (a < 0.5) continue;
      const lum = at(x, y, 0);
      const edge = Math.abs(at(x + 1, y, 0) - at(x - 1, y, 0)) + Math.abs(at(x, y + 1, 0) - at(x, y - 1, 0));
      const rim = Math.abs(at(x + 2, y, 3) - at(x - 2, y, 3)) + Math.abs(at(x, y + 2, 3) - at(x, y - 2, 3));
      const w = (0.3 + 0.5 * lum ** 1.3 + 0.4 * Math.min(1, edge * 5) + 0.5 * Math.min(1, rim)) * vignette(x / W, y / H);
      weights[y * W + x] = w;
      total += w;
    }
  }

  const k = target / total;
  const pos = [];
  const dir = [];
  const info = [];
  const aspect = W / H;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const w = weights[y * W + x];
      if (!w) continue;
      let n = w * k;
      while (n > 0) {
        if (n < 1 && Math.random() > n) break;
        n -= 1;
        const tu = x + Math.random(), tv = y + Math.random();
        const u = tu / W;
        const v = tv / H;
        const px = (u - 0.5) * 2 * aspect;
        const py = (0.5 - v) * 2;
        const pz = zAt(tu, tv);
        pos.push(px, py, pz);

        const rx = Math.random() * 2 - 1;
        const ry = Math.random() * 2 - 1;
        const rz = Math.random() * 2 - 1;
        const dx = px * 0.7 + rx;
        const dy = py * 0.5 + ry;
        const dz = rz * 1.4;
        const len = Math.hypot(dx, dy, dz) || 1;
        dir.push(dx / len, dy / len, dz / len);

        info.push(at(x, y, 0), Math.random(), vignette(u, v));
      }
    }
  }
  return {
    count: pos.length / 3,
    pos: new Float32Array(pos),
    dir: new Float32Array(dir),
    info: new Float32Array(info),
  };
}

function perspective(fovY, aspect, near, far) {
  const f = 1 / Math.tan(fovY / 2);
  const nf = 1 / (near - far);
  // prettier-ignore
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0,
  ]);
}

const smooth = (t) => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
};
const lerp = (a, b, t) => a + (b - a) * t;

async function startPortrait(canvas) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  if (!gl) throw new Error('WebGL unavailable');

  const program = gl.createProgram();
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);

  const pixels = await readPixels(canvas.dataset.src);
  const cloud = buildCloud(pixels, narrow.matches ? 36000 : 72000);

  for (const [name, array] of [['aPos', cloud.pos], ['aDir', cloud.dir], ['aInfo', cloud.info]]) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
  }

  const u = {};
  for (const name of ['uProj', 'uCamDist', 'uTime', 'uYaw', 'uPitch', 'uDisperse', 'uOffset', 'uScale', 'uMouse', 'uMouseOn', 'uAspect', 'uPointSize', 'uMaxPointSize', 'uScatterDim', 'uAccent']) {
    u[name] = gl.getUniformLocation(program, name);
  }
  const CAM = 4.4;
  gl.uniform1f(u.uCamDist, CAM);
  gl.uniform3f(u.uAccent, 0.37, 0.78, 1.0);

  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE);
  gl.clearColor(0.0196, 0.0196, 0.0235, 1);

  let dpr = 1;
  let aspect = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    aspect = w / h;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniformMatrix4fv(u.uProj, false, perspective((34 * Math.PI) / 180, aspect, 0.1, 50));
    gl.uniform1f(u.uAspect, aspect);
  }
  resize();
  window.addEventListener('resize', resize);

  // Pointer state, in normalised device coordinates.
  const pointer = { x: 0, y: 0, on: 0, targetOn: 0, seen: 0 };
  const look = { yaw: 0, pitch: 0 };
  const onMove = (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = 1 - (e.clientY / window.innerHeight) * 2;
    pointer.targetOn = 1;
    pointer.seen = performance.now();
  };
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerdown', onMove, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => (pointer.targetOn = 0));

  const contact = document.getElementById('contact');
  const hud = document.querySelector('[data-hud]');
  const fmt = new Intl.NumberFormat('en-US');
  let disperse = 0;
  let lastHud = 0;

  // Dispersion follows the scroll: nearly assembled on the hero, scattered
  // through the content, back together on the contact section. It never goes
  // fully to zero, so a few particles always drift off around the head.
  const REST = 0.15;
  function targetDisperse() {
    const vh = window.innerHeight;
    const out = smooth(window.scrollY / (vh * 0.9));
    const back = smooth((window.scrollY + vh - contact.offsetTop) / (vh * 0.8));
    return REST + (1 - REST) * out * (1 - back);
  }

  function frame(now) {
    const t = now / 1000;
    const isNarrow = narrow.matches;

    disperse = reduceMotion ? 0 : lerp(disperse, targetDisperse(), 0.06);
    if (now - pointer.seen > 2200 && pointer.targetOn) pointer.targetOn = 0;
    pointer.on = lerp(pointer.on, reduceMotion ? 0 : pointer.targetOn, 0.08);

    // The portrait faces the camera, flat: no sway and no turning with the
    // pointer. Only the scattered cloud turns, as it flies apart on scroll.
    const scatter = Math.max(0, (disperse - REST) / (1 - REST));
    look.yaw = scatter * scatter * 0.9;
    look.pitch = 0;

    // Desktop: portrait on the right of the hero, drifting to the centre when it
    // scatters. Mobile: centred and pushed up, behind the name.
    const offX = isNarrow ? 0 : lerp(0.42, 0, scatter);
    const offY = isNarrow ? 0.44 : -0.04;

    gl.uniform1f(u.uTime, reduceMotion ? 0 : t);
    gl.uniform1f(u.uYaw, look.yaw);
    gl.uniform1f(u.uPitch, look.pitch);
    gl.uniform1f(u.uDisperse, disperse);
    gl.uniform2f(u.uOffset, offX, offY);
    gl.uniform1f(u.uScale, isNarrow ? 0.84 : 1.12);
    gl.uniform2f(u.uMouse, pointer.x, pointer.y);
    gl.uniform1f(u.uMouseOn, pointer.on);
    gl.uniform1f(u.uPointSize, (isNarrow ? 2.1 : 1.7) * dpr);
    gl.uniform1f(u.uMaxPointSize, (isNarrow ? 2.6 : 3) * dpr);
    // On phones the text column is the whole screen, so dim the scattered cloud more.
    gl.uniform1f(u.uScatterDim, isNarrow ? 0.8 : 0.66);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, cloud.count);

    if (hud && now - lastHud > 120) {
      lastHud = now;
      const scrolled = Math.round((window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)) * 100);
      hud.textContent = `pts ${fmt.format(cloud.count)}   scatter ${disperse.toFixed(2)}   ${String(scrolled).padStart(3, '0')}%`;
    }

    if (!reduceMotion) requestAnimationFrame(frame);
  }

  if (reduceMotion) {
    const redraw = () => requestAnimationFrame(frame);
    window.addEventListener('resize', redraw);
  }
  requestAnimationFrame(frame);
  canvas.classList.add('is-ready');

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    document.documentElement.classList.add('no-webgl');
  });
}

const canvas = document.querySelector('[data-portrait]');
startPortrait(canvas).catch((err) => {
  console.warn('Portrait disabled:', err);
  document.documentElement.classList.add('no-webgl');
});
