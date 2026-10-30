// A faint, slowly drifting field of particles behind the blog, so moving from
// the landing page's dot grid to the posts keeps a little of the same texture. Plain 2D canvas, a couple of hundred dots. The CSS mask on the
// canvas keeps the reading column clear; --sky-centre opens it a little at the
// top of the page, behind the big titles, and closes it as you scroll.

const canvas = document.querySelector('[data-sky]');
const ctx = canvas?.getContext('2d');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

// The same sky on every page, carrying on where the last page left it, so the
// cross-fade between pages (assets/css/blog.css) doesn't reshuffle it: a fixed
// seed, the wall clock for the drift, and the scroll parallax handed over in
// sessionStorage.

const KEY = 'sky-scroll';
let carried = 0;
// Measured against the page's own scroll, which going back restores.
const pickUp = () => {
  try {
    carried = (Number(sessionStorage.getItem(KEY)) || 0) - window.scrollY;
  } catch {}
};
pickUp();
window.addEventListener('pageshow', (e) => e.persisted && pickUp());

// mulberry32
const random = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

if (ctx) {
  let stars = [];
  let w = 0;
  let h = 0;
  let dpr = 1;

  const seed = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const count = Math.min(260, Math.round((w * h) / 7000));
    const rand = random(7);
    stars = Array.from({ length: count }, () => {
      const depth = rand();
      return {
        x: rand() * w,
        y: rand() * h,
        r: 0.35 + depth * 0.9,
        a: 0.12 + depth * 0.45,
        depth,
        phase: rand() * Math.PI * 2,
        accent: rand() < 0.06,
      };
    });
  };

  const draw = (now) => {
    const t = performance.timeOrigin + now;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    // Nearer stars drift and scroll a little faster: a hint of depth.
    const scroll = carried + window.scrollY;
    for (const s of stars) {
      const y = (((s.y - t * 0.004 * (0.3 + s.depth) - scroll * 0.06 * s.depth) % h) + h) % h;
      const twinkle = still ? 1 : 0.75 + 0.25 * Math.sin(t * 0.0012 + s.phase);
      ctx.globalAlpha = s.a * twinkle;
      ctx.fillStyle = s.accent ? '#ff4d4d' : '#f2f2ef';
      ctx.beginPath();
      ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const centre = () => {
    const open = Math.max(0, 1 - window.scrollY / (window.innerHeight * 0.45));
    canvas.style.setProperty('--sky-centre', (0.5 * open).toFixed(3));
  };

  const loop = (t) => {
    draw(t);
    requestAnimationFrame(loop);
  };

  // Size the canvas from its laid-out box, and again whenever that box changes.
  // Safari can run this before the stylesheet applies, when the canvas is still
  // its default 300×150: sizing only once stretched the dots into dashes.
  new ResizeObserver(() => {
    if (canvas.clientWidth === w && canvas.clientHeight === h) return;
    seed();
    if (still) draw(0);
  }).observe(canvas);

  seed();
  centre();
  window.addEventListener('scroll', () => {
    centre();
    if (still) draw(0);
  }, { passive: true });
  window.addEventListener('pagehide', () => {
    try {
      sessionStorage.setItem(KEY, String(carried + window.scrollY));
    } catch {}
  });

  // Draw once straight away, so the first frame of the page already has its sky.
  draw(still ? 0 : performance.now());
  if (!still) requestAnimationFrame(loop);
}
