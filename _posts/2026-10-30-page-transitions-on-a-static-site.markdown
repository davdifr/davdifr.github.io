---
layout: post
title: "Page Transitions on a Static Site, and What the Docs Leave Out"
description: >-
  Cross-document view transitions on a Jekyll site, with no framework: the
  part that takes ten lines of CSS, and the part that took a WebGL canvas, an
  old Chrome, Safari and a frame-by-frame recording to get right.
categories:
  - Web Development
  - Front-end
tags:
  - view transitions
  - css
  - jekyll
  - webgl
  - safari
image: /assets/posts/page-transitions-on-a-static-site/leaving-home-before-after.webp
---

This site is a handful of static pages built with Jekyll and served by GitHub
Pages. No framework, no client-side router: every link is a full page load.

I still wanted moving between pages to feel like one place. The top bar should
stay where it is, the red underline should slide to the link you clicked, the
background should hold still and only the content should change.

A few years ago that meant turning the site into a single-page app. Today the
browser can do it on its own, with **cross-document view transitions**. The
basic version really is a few lines of CSS.

Making it look right in every case took longer, and most of what I learned
isn't in the documentation. This post is both parts.

---

## The Ten-Line Version

Both pages have to opt in, and both have to be on the same origin:

```css
@view-transition {
  navigation: auto;
}
```

That's enough for a cross-fade between the old page and the new one. Browsers
that don't support it yet simply navigate as they always did, so there's
nothing to polyfill.

Then you decide what should **not** fade. Any element with a
`view-transition-name` is captured separately, and if the same name exists on
both pages, the browser animates it from where it was to where it is:

```css
/* The top bar stays put. */
.bar {
  view-transition-name: bar;
}

/* The underline under the current page slides to the new link. */
.bar__ink {
  view-transition-name: bar-ink;
}

::view-transition-old(*),
::view-transition-new(*) {
  animation-duration: 0.3s;
}

::view-transition-group(bar-ink) {
  animation-duration: 0.5s;
  animation-timing-function: cubic-bezier(0.2, 0.7, 0.2, 1);
}
```

A name has to be unique on the page while the transition runs. On the home page
the underline follows the section in view, and it only gets its name when it's
actually showing, so a hidden underline never takes part.

Finally, people who asked for less motion get none:

```css
@media (prefers-reduced-motion: reduce) {
  @view-transition {
    navigation: none;
  }
}
```

That's the version every tutorial shows. Here is what came after it.

---

## Put the Opt-In Inline, at the Top of `<head>`

My first attempt had the `@view-transition` rule in the main stylesheet, and
some navigations just didn't animate.

Chrome decides whether the incoming page takes part at its **first style
update**. If the external stylesheet hasn't arrived by then, the page hasn't
opted in yet, and the transition is skipped. With a warm cache you rarely see
it, which makes it easy to miss.

The fix is to put the opt-in in a small `<style>` block at the very top of
`<head>`, before anything else. The animations themselves can stay in the
stylesheet.

## Make the Content Rise, Not Just Fade

A plain cross-fade felt flat, so the new page's content rises a few pixels into
place. The event to hook into is `pagereveal`, which fires on the new page just
before its first frame and tells you whether it arrived through a transition:

```html
<script>
  addEventListener('pagereveal', (e) => {
    if (e.viewTransition) document.documentElement.classList.add('is-arriving');
  });
  addEventListener('animationend', (e) => {
    if (e.animationName === 'rise-in') document.documentElement.classList.remove('is-arriving');
  });
</script>
```

```css
/* Fill backwards only: a transform left on .main after the animation would
   change how fixed and sticky things inside it behave. */
.is-arriving .main {
  animation: rise-in 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) backwards;
}

@keyframes rise-in {
  from {
    transform: translateY(14px);
  }
}
```

The script is inline, so it's listening before the first frame.

## Keep the Background From Reshuffling

The blog has a faint field of drifting particles behind it. Every page draws its
own, and since the root of the page cross-fades, two different skies would blend
into each other on every click.

So every page draws the **same** sky, as if it had never stopped:

- the particles come from a seeded random generator, so their positions are
  identical on every page;
- their drift is based on the wall clock (`performance.timeOrigin + now`), not
  on how long the page has been open;
- the scroll offset is saved in `sessionStorage` on `pagehide` and picked up by
  the next page.

The old and new skies are then the same picture, and the cross-fade between
them is invisible.

One more thing that shifted: a short page without a scrollbar is wider than a
long page with one, so everything jumped sideways. One line fixes it:

```css
html {
  scrollbar-gutter: stable;
}
```

---

## The Old Page Is a Photo, the New Page Is Live

This is the idea that explained every remaining problem.

During the transition the browser shows a **snapshot of the old page**, taken
the moment you leave it, and the **live new page**, which keeps running
underneath. Both details matter.

### The old page: a WebGL canvas can come out blank

The home page has a WebGL dot grid behind it. Going from the home page to the
blog, the transition didn't fade out the home page. It faded out a **flat pale
sheet**, which looked exactly like a page still loading.

[![Leaving the home page for the blog, a few frames into the transition, before and after the fix](/assets/posts/page-transitions-on-a-static-site/leaving-home-before-after.webp){: width="1440" height="553" }](/assets/posts/page-transitions-on-a-static-site/leaving-home-before-after.webp)
*Leaving the home page for the blog, two frames into the transition, in
Chromium 151. Before, the dot grid comes out as a pale sheet under the home
page's text. After, it fades out with the rest of the page.*

The snapshot is taken after the last frame has been shown, and by default a
WebGL canvas clears its drawing buffer as soon as a frame is shown. The snapshot
found an empty buffer. Keeping the buffer fixes it:

```js
const gl = canvas.getContext('webgl', {
  antialias: false,
  alpha: false,
  preserveDrawingBuffer: true,
});
```

That was enough in current Chrome. It wasn't enough in **Chromium 151**, which
still snapshotted the canvas as a white sheet. So, just before the snapshot,
the page swaps the WebGL canvas for a plain 2D copy of its last frame. The
event for that is `pageswap`, which fires on the old page right before it's
captured:

```js
let still = null;
window.addEventListener('pageswap', (e) => {
  if (!e.viewTransition) return;
  still = document.createElement('canvas');
  still.className = canvas.className;
  still.width = canvas.width;
  still.height = canvas.height;
  still.getContext('2d').drawImage(canvas, 0, 0);
  canvas.before(still);
  canvas.style.display = 'none';
});

// Coming back with the back button restores the page from the
// back/forward cache: put the live canvas back.
window.addEventListener('pageshow', () => {
  still?.remove();
  still = null;
  canvas.style.display = '';
});
```

`preserveDrawingBuffer` is still needed: it's what lets `drawImage` read the
canvas outside of a frame.

The `pageshow` handler is easy to forget. Without it, going back to the home
page restores the frozen copy, and the grid stops moving.

### The new page: intro animations play under the fade

Coming back from the blog had the opposite problem. The home page has an intro
for first-time visitors: the name rises in, the grid fades in over a second and
a half, the labels scramble.

The new page is live, so all of that played **underneath the cross-fade**. The
transition faded in a page that was still empty and then filled up, which again
looked like loading.

[![Coming back to the home page from the blog, just after the transition, before and after the fix](/assets/posts/page-transitions-on-a-static-site/arriving-home-before-after.webp){: width="1440" height="553" }](/assets/posts/page-transitions-on-a-static-site/arriving-home-before-after.webp)
*Coming back to the home page in Chrome 156, as the transition ends. Before,
the grid isn't there yet, the name is still rising and the label is still
scrambling. After, the page is already in place.*

The same `pagereveal` event tells the home page how it was reached. When it's
through a transition, the intro is skipped:

```js
addEventListener('pagereveal', (e) => {
  if (!e.viewTransition) return;
  const root = document.documentElement;
  root.classList.add('skip-intro', 'is-arriving');
  e.viewTransition.finished.finally(() => root.classList.remove('is-arriving'));
});
```

There are two classes because there are two kinds of animation:

- `skip-intro` stays for the whole visit and turns off the one-time intro: the
  name doesn't rise and the grid doesn't fade in. Removing it later would
  restart those animations.
- `is-arriving` only lasts while the transition runs. Sections that come into
  view in that window show as they are; anything you scroll to later still gets
  its reveal.

The second class exists because of the **About** link, which goes to `/#info`.
The jump to the anchor can happen after the first frame, so checking what's on
screen once, at the start, wasn't enough.

## Safari Jumps to the Anchor Late

Safari, which supports these transitions since 18.2, had one more surprise. On
`/#info` it faded in the top of the home page and only **then** jumped down to
the section, a visible snap at the end of the transition.

The fix is to do the jump yourself before the first frame, in the same
`pagereveal` handler:

```js
if (location.hash) {
  document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'instant' });
}
```

`behavior: 'instant'` matters if the page has `scroll-behavior: smooth`,
otherwise the jump becomes an animation of its own.

---

## How to Actually See What's Happening

A transition lasts a third of a second. Most of the bugs above were invisible
until I found a way to look at them. Three things helped.

**Slow everything down.** A temporary rule makes every transition last four
seconds, long enough to take screenshots in the middle of one:

```css
::view-transition-group(*),
::view-transition-old(*),
::view-transition-new(*) {
  animation-duration: 4s !important;
}
```

**Log the events.** A few lines that write `pageswap` and `pagereveal` to
`sessionStorage`, with whether each one had a `viewTransition`, tell you
straight away if a transition ran or was skipped.

**Don't trust a page that isn't on screen.** A background tab, or a browser
window that's hidden, doesn't render, and transitions are skipped. Some of the
flashes I chased early on were only my test browser being in the background.

In the end, the test I trusted was a recording. With Playwright I recorded the
same clicks, home to blog, back, to `/#info`, to the archive, as a video in
**Chrome 156**, **Chromium 151** and **WebKit**, split the videos into frames
and measured the brightness of each one. On a dark site a flash is a number:
the average brightness jumping from about 12 to over 200 in a single frame.
That's how the Chromium-only white sheet and the Safari anchor jump showed up,
and how I knew they were gone.

---

## Final Thoughts

The ten-line version of cross-document view transitions is real, and on a
simple site it might be all you need.

The rest comes down to one idea: **the page you leave is a photo, the page you
arrive at is alive.** Anything that doesn't photograph well, like a WebGL
canvas, has to be dealt with before you leave. Anything that animates on
arrival has to know it's arriving through a transition.

And a transition you can't slow down or record is very hard to get right.
