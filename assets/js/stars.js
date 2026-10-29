// A faint, slowly drifting field of particles behind the blog, so moving from
// the landing page's dot grid to the posts keeps a little of the same texture. Plain 2D canvas, a couple of hundred dots. The CSS mask on the
// canvas keeps the reading column clear; --sky-centre opens it a little at the
// top of the page, behind the big titles, and closes it as you scroll.

const canvas = document.querySelector('[data-sky]');
const ctx = canvas?.getContext('2d');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    stars = Array.from({ length: count }, () => {
      const depth = Math.random();
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.35 + depth * 0.9,
        a: 0.12 + depth * 0.45,
        depth,
        phase: Math.random() * Math.PI * 2,
        accent: Math.random() < 0.06,
      };
    });
  };

  const draw = (t) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    // Nearer stars drift and scroll a little faster: a hint of depth.
    const scroll = window.scrollY;
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

  if (still) draw(0);
  else requestAnimationFrame(loop);
}
