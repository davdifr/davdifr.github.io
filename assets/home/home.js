// Landing page: a WebGL field of dots laid out like a layout grid, plus the
// small bits of scroll choreography around it. No dependencies.
//
// On the hero the grid lies back as a floor and rolls in slow waves. Through
// the content it stands up flat behind the text and lights the page's own
// column lines, like a grid overlay in the dev tools. Dots swell softly around
// the pointer, and scrolling makes the grid shimmer faintly with its speed.

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
    // During the page transition from the blog (index.html), what comes into
    // view shows as it is, without its intro.
    const instant = document.documentElement.classList.contains('is-arriving');
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      if (instant) entry.target.style.transition = 'none';
      entry.target.classList.add('is-in');
      if (!instant && entry.target.hasAttribute('data-scramble')) scramble(entry.target);
      io.unobserve(entry.target);
    }
  },
  { rootMargin: '0px 0px -12% 0px' },
);
document.querySelectorAll('.reveal, [data-scramble]').forEach((el) => io.observe(el));

/* Top bar: an underline under the section in view ---------------------- */

// The blog underlines the current page the same way (_includes/header.html).
// After a click the line goes straight to the link and stays there until the
// smooth scroll settles, instead of stepping through every section on the way.

const nav = document.querySelector('.bar__nav');
const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
const sections = navLinks.map((a) => document.getElementById(a.hash.slice(1)));
const ink = document.createElement('span');
ink.className = 'bar__ink';
ink.setAttribute('aria-hidden', 'true');
nav.append(ink);

let current = null;
let held; // a link, or null for the top; undefined when following the scroll
let settle = 0;

function place(link) {
  const track = parseFloat(getComputedStyle(link).letterSpacing) || 0;
  ink.style.setProperty('--x', `${link.offsetLeft}px`);
  ink.style.setProperty('--w', `${link.offsetWidth - track}px`);
}

function mark(link) {
  if (link === current) return;
  current?.removeAttribute('aria-current');
  if (link) {
    link.setAttribute('aria-current', 'location');
    // Coming from the hero the line appears in place, rather than sliding in.
    if (!current) {
      ink.style.transition = 'none';
      place(link);
      ink.getBoundingClientRect();
      ink.style.transition = '';
    } else {
      place(link);
    }
  }
  ink.classList.toggle('is-on', !!link);
  current = link;
}

function spy() {
  if (held !== undefined) return mark(held);
  const line = window.innerHeight * 0.4;
  let link = null;
  sections.forEach((s, i) => {
    if (s.getBoundingClientRect().top < line) link = navLinks[i];
  });
  mark(link);
}

function hold(link) {
  held = link;
  mark(link);
  release();
}

function release() {
  clearTimeout(settle);
  settle = setTimeout(() => {
    held = undefined;
    spy();
  }, 160);
}

navLinks.forEach((a) => a.addEventListener('click', () => hold(a)));
document.querySelector('.bar__mark').addEventListener('click', () => hold(null));
window.addEventListener('scroll', () => (held !== undefined ? release() : spy()), { passive: true });
window.addEventListener('resize', () => current && place(current));
spy();

/* Dot field -------------------------------------------------------------- */

const VERT = `
attribute vec3 aGrid; // x, y on the plane (world units), seed

uniform mat4 uProj;
uniform float uCamDist;
uniform float uTime;
uniform float uWave;    // 1 on the hero (floor, waves), 0 in the content (flat)
uniform float uPitch;
uniform vec2 uOffset;
uniform vec2 uExtent;   // half size of the grid, for the fade at its edges
uniform float uSpacing;
uniform vec4 uEdges;    // column lines, world x
uniform float uVel;     // scroll speed, -1..1
uniform vec2 uMouse;
uniform float uMouseOn;
uniform float uAspect;
uniform float uDot;

varying float vAlpha;
varying float vSize;

float wave(vec2 q, float t) {
  return 0.26 * sin(q.x * 1.5 + t * 0.55) * cos(q.y * 1.2 - t * 0.4)
       + 0.09 * sin(q.x * 3.1 - q.y * 2.3 + t * 0.8);
}

void main() {
  vec2 q = aGrid.xy;
  float seed = aGrid.z;

  // Waves on the floor only: the flat grid stays still, so the scroll never
  // makes it swim sideways.
  float z = wave(q, uTime) * uWave;

  float cp = cos(uPitch), sp = sin(uPitch);
  vec3 p = vec3(q.x, cp * q.y - sp * z, sp * q.y + cp * z);

  vec4 clip = uProj * vec4(p.x, p.y, p.z - uCamDist, 1.0);
  vec2 ndc = clip.xy / clip.w + uOffset;

  // Around the pointer the dots swell and brighten a little, and lean away.
  vec2 d = ndc - uMouse;
  d.x *= uAspect;
  float dist = length(d);
  float near = uMouseOn * exp(-dist * 6.0);
  vec2 push = d / max(dist, 1e-4) * near * 0.01;
  push.x /= uAspect;
  ndc += push;

  // Scrolling runs a faint shimmer down the grid in bands, light only.
  float shimmer = abs(uVel) * (0.5 + 0.5 * sin(q.y * 5.0 + uTime * 3.0));

  // The column lines of the page, lit up when the grid stands flat.
  float onEdge = 0.0;
  for (int i = 0; i < 4; i++) onEdge = max(onEdge, 1.0 - step(uSpacing * 0.5, abs(q.x - uEdges[i])));

  // Fade out towards the ends of the grid, and into the distance on the floor.
  vec2 e = abs(q) / uExtent;
  float edgeFade = (1.0 - smoothstep(0.7, 1.0, e.x)) * (1.0 - smoothstep(0.6, 1.0, e.y));
  float fog = clamp(1.4 - (clip.w - uCamDist) * 0.45, 0.0, 1.0);

  float size = uDot * (uCamDist / clip.w) * (1.0 + 0.6 * near + 0.15 * shimmer + 0.5 * onEdge * (1.0 - uWave));
  gl_Position = vec4(ndc * clip.w, clip.z, clip.w);
  gl_PointSize = size;

  vSize = size;
  float alpha = mix(0.16 + 0.34 * onEdge, 0.62, uWave) + 0.12 * shimmer + 0.3 * near;
  vAlpha = alpha * edgeFade * mix(1.0, fog, uWave) * (0.85 + 0.15 * seed);
}
`;

const FRAG = `
precision mediump float;
varying float vAlpha;
varying float vSize;

void main() {
  float r = length(gl_PointCoord - 0.5);
  float aa = clamp(1.2 / vSize, 0.05, 0.5);
  float a = vAlpha * (1.0 - smoothstep(0.5 - aa, 0.5, r));
  if (a <= 0.0) discard;
  gl_FragColor = vec4(vec3(0.95, 0.95, 0.93) * a, a);
}
`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
  return shader;
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

function startField(canvas) {
  // preserveDrawingBuffer: the page transition to the blog snapshots this page
  // after the last frame has been presented, and without it the snapshot finds
  // the buffer already cleared and fades out a flat pale sheet, not the page.
  // It also lets the pageswap handler below copy the grid at any time.
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  if (!gl) throw new Error('WebGL unavailable');

  const program = gl.createProgram();
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);

  const u = {};
  for (const name of ['uProj', 'uCamDist', 'uTime', 'uWave', 'uPitch', 'uOffset', 'uExtent', 'uSpacing', 'uEdges', 'uVel', 'uMouse', 'uMouseOn', 'uAspect', 'uDot']) {
    u[name] = gl.getUniformLocation(program, name);
  }
  const CAM = 4.4;
  const FOV = (34 * Math.PI) / 180;
  // World units per half viewport height at z = 0.
  const HALF_H = Math.tan(FOV / 2) * CAM;
  gl.uniform1f(u.uCamDist, CAM);

  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE);
  gl.clearColor(0.0196, 0.0196, 0.0235, 1);

  const buffer = gl.createBuffer();
  const loc = gl.getAttribLocation(program, 'aGrid');
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);

  const body = document.querySelector('.block__body');
  const label = document.querySelector('.block > .label');
  let dpr = 1;
  let aspect = 1;
  let count = 0;
  let worldPerPx = 1;

  // The grid's pitch is in CSS pixels, so it matches the page at any size. The
  // lit lines run half a gap outside the columns, clear of the text; a column
  // of dots falls exactly on the one left of the text, the others light the
  // dots nearest to them.
  function build() {
    const W = window.innerWidth, H = window.innerHeight;
    worldPerPx = (2 * HALF_H) / H;
    const step = (narrow.matches ? 16 : 18) * worldPerPx;
    const toWorld = (px) => (px - W / 2) * worldPerPx;
    const b = body.getBoundingClientRect();
    const l = label.getBoundingClientRect().left;
    const pad = narrow.matches ? l / 2 : 16;
    const anchor = toWorld(b.left - pad);
    // Wide enough for the tilted floor, deep enough to reach its horizon.
    const ex = HALF_H * aspect * 1.6, ey = HALF_H * 2.2;
    const x0 = anchor - Math.ceil((anchor + ex) / step) * step;
    const cols = Math.floor((2 * ex) / step), rows = Math.floor((2 * ey) / step);
    const data = new Float32Array(cols * rows * 3);
    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        data.set([x0 + c * step, -ey + r * step, Math.random()], i);
        i += 3;
      }
    }
    count = cols * rows;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.uniform2f(u.uExtent, ex, ey);
    gl.uniform1f(u.uSpacing, step);

    const edges = narrow.matches ? [b.left - pad, b.right + pad] : [l - pad, b.left - pad, b.right + pad, W - l + pad];
    const w = edges.map(toWorld);
    while (w.length < 4) w.push(1e3);
    gl.uniform4f(u.uEdges, w[0], w[1], w[2], w[3]);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    aspect = w / h;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniformMatrix4fv(u.uProj, false, perspective(FOV, aspect, 0.1, 50));
    gl.uniform1f(u.uAspect, aspect);
    build();
  }
  resize();
  window.addEventListener('resize', resize);

  // Pointer state, in normalised device coordinates.
  const pointer = { x: 0, y: 0, on: 0, targetOn: 0, seen: 0 };
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
  let waveMix = 1;
  let vel = 0;
  let lastY = window.scrollY;
  let lastT = performance.now();

  // The floor on the hero and again on the contact section, the flat grid in
  // between.
  const nearContact = () => smooth((window.scrollY + window.innerHeight - contact.offsetTop) / (window.innerHeight * 0.8));
  const targetWave = () => Math.max(1 - smooth(window.scrollY / (window.innerHeight * 0.8)), nearContact());

  function frame(now) {
    const t = now / 1000;
    const isNarrow = narrow.matches;

    waveMix = reduceMotion ? targetWave() : lerp(waveMix, targetWave(), 0.06);
    const dt = Math.max(1, now - lastT);
    const speed = Math.max(-1, Math.min(1, ((window.scrollY - lastY) / dt) * 0.25));
    vel = reduceMotion ? 0 : lerp(vel, speed, 0.08);
    lastY = window.scrollY;
    lastT = now;
    if (now - pointer.seen > 2200 && pointer.targetOn) pointer.targetOn = 0;
    pointer.on = lerp(pointer.on, reduceMotion ? 0 : pointer.targetOn, 0.08);

    const k = smooth(waveMix);
    // The floor lies back and sits low, its horizon a little above the middle
    // of the screen; on phones it stays under the top bar, above the name. On
    // the contact section it drops below the links.
    const pitch = -1.12 * k;
    const offY = k * (isNarrow ? lerp(0.05, -0.55, nearContact()) : lerp(-0.42, -0.66, nearContact()));

    gl.uniform1f(u.uTime, reduceMotion ? 0 : t);
    gl.uniform1f(u.uWave, k);
    gl.uniform1f(u.uPitch, pitch);
    gl.uniform2f(u.uOffset, 0, offY);
    gl.uniform1f(u.uVel, vel);
    gl.uniform2f(u.uMouse, pointer.x, pointer.y);
    gl.uniform1f(u.uMouseOn, pointer.on);
    gl.uniform1f(u.uDot, (isNarrow ? 2.2 : 2.4) * dpr);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, count);

    if (!reduceMotion) requestAnimationFrame(frame);
  }

  if (reduceMotion) {
    const redraw = () => requestAnimationFrame(frame);
    window.addEventListener('resize', redraw);
    window.addEventListener('scroll', redraw, { passive: true });
  }
  requestAnimationFrame(frame);
  canvas.classList.add('is-ready');

  // Leaving for the blog, the page transition snapshots this page, and some
  // Chrome versions (151) snapshot a WebGL canvas as a white sheet. So the grid
  // is copied onto a plain 2D canvas for the snapshot, and put back if the page
  // comes back from the back/forward cache.
  let still = null;
  window.addEventListener('pageswap', (e) => {
    if (!e.viewTransition) return;
    still = document.createElement('canvas');
    still.className = canvas.className;
    still.setAttribute('aria-hidden', 'true');
    still.width = canvas.width;
    still.height = canvas.height;
    still.getContext('2d').drawImage(canvas, 0, 0);
    canvas.before(still);
    // Not `hidden`: .field sets display: block.
    canvas.style.display = 'none';
  });
  window.addEventListener('pageshow', () => {
    still?.remove();
    still = null;
    canvas.style.display = '';
  });

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    document.documentElement.classList.add('no-webgl');
  });
}

const canvas = document.querySelector('[data-field]');
try {
  startField(canvas);
} catch (err) {
  console.warn('Dot field disabled:', err);
  document.documentElement.classList.add('no-webgl');
}
