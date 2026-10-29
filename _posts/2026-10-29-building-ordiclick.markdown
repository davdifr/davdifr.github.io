---
layout: post
title: "Five Months Building OrdiClick with AI Agents"
description: >-
  From vibecoding side projects to building a real product for restaurants
  with AI agents: a kitchen screen rebuilt five times, a simulated Saturday night
  and three price lists.
categories:
  - AI Development
  - Product
image: /assets/posts/building-ordiclick/kitchen-before-after.webp
tags:
  - AI Coding
  - AI Agents
  - Claude Code
  - Angular
  - Supabase
  - Stripe
---


My first two experiments with AI were vibecoding: a small multiplayer 3D
prototype, then [SortDocs](/posts/building-sortdocs/), a tool I actually use.
Describe what you want, accept what comes back, fix it when it breaks.

Both had one thing in common: if they broke, nobody else noticed.

So the obvious next question was the uncomfortable one.

**What happens when the thing you build with AI is meant for real customers,
takes subscriptions and has to work in a kitchen on a Saturday night?**

The answer, it turns out, is that it stops being vibecoding. It becomes what
software development with AI agents looks like today: the agent writes most of
the code, inside a process I own, made of plans, reviews, tests and
simulations.

That's **OrdiClick**: online ordering and management for restaurants, pizzerias,
bars and shops.

👉 [ordiclick.it](https://ordiclick.it) · [live demo](https://demo.ordiclick.it)

It started with a very specific request. A pasta shop in Teramo was running its
orders through WhatsApp and asked me to help them replace that with something
more solid.

What started as a tool for one shop grew into a product for any place that
takes orders the same way.

---

## What OrdiClick Does

A venue gets its own address, like `pizzeria.ordiclick.it`, and a QR code.

From there:

- customers browse the menu, order at the table, for pickup or for delivery;
- the staff follow every order from a panel built for the middle of a service;
- the kitchen gets its own screen;
- reservations, loyalty cards, menus in English and simple analytics can be
  switched on when a venue needs them.

One decision shaped everything else: **OrdiClick never touches the money.**
Customers still pay at the counter, in cash or by card, like they do today.
No commissions on orders, no fiscal integration with the till, nothing to
install. It runs in the browser.

Most of the five months went into details like this one, a single dish on the
menu a customer sees after scanning the QR code:

[![The same dish card on the public menu in July and in October 2026](/assets/posts/building-ordiclick/dish-before-after.webp){: width="1440" height="600" }](/assets/posts/building-ordiclick/dish-before-after.webp)
*In July the allergen was an icon you had to guess. In October it says
"Glutine", the price sits next to the name, and the venue's own colour replaces
OrdiClick's green.*

---

## The Numbers, First

The project started on **May 22, 2026** under a different name, *Easy Order*.
It became OrdiClick at the end of June.

Five months later:

- **1,260 commits**;
- **315 database migrations**;
- 236 test files on the frontend, plus SQL test suites for the database;
- about **740 commits co-authored by Claude**, through Claude Code.

That last number is the honest summary of how it was built: more than half of
the commits were written together with an AI agent. Almost none of them went in
without me deciding what they should do, reading what came back and throwing a
lot of it away.

Picking the model was the hardest call at the start. I tried GPT several times
along the way and kept getting lower quality, so I stayed with Claude. That's a
snapshot of this moment, though: these models change every few months.

The stack is boring on purpose: **Angular** and TypeScript on the front end,
**Supabase** (Postgres, row-level security, Realtime, Edge Functions) behind
it, **Stripe** for subscriptions, **Vercel** for hosting.

---

## Why This Was a Different Kind of Test

SortDocs could get away with being clever. OrdiClick can't.

A restaurant panel is used by someone holding three plates, during the worst
twenty minutes of their evening. Every extra tap costs something. Every wrong
number on a ticket ends up as a wrong dish.

That changed how I worked with the AI more than any tool did.

With a side project, I could describe a feature and accept "it works".
Here, "it works" was the beginning of the conversation:

- does it work with **fifteen venues** at the same time?
- what happens **after midnight**, when "tonight" is technically tomorrow?
- what if **two people book the last table** in the same second?
- can one venue ever see another venue's orders?

Those questions are where most of the 1,260 commits went.

---

## The Kitchen Screen, Five Times

The best example of how the product actually got designed is the kitchen
screen.

In August alone it went through five versions:

1. **lanes by menu category**, all on one screen;
2. **one screen per station**, with no sideways scrolling;
3. a **ticket-first rail**, built around the orders instead of the dishes;
4. **"the queue"**: one action at a time, nothing else on screen;
5. a **single expo screen**, merging the previous ideas into one board.

Each version was quick to build. That's the real superpower of working with
an agent: trying an idea costs an afternoon, not a sprint.

But no version was *chosen* by the AI. Each one was replaced because it didn't
fit how a kitchen works in the middle of a service.

My favourite commit message from that month sums it up:

> One kitchen notice instead of a stack, and only when it can stop a pan.

[![The kitchen screen on August 21 and in October 2026: from one ticket per table to one row per dish](/assets/posts/building-ordiclick/kitchen-before-after.webp){: width="1440" height="959" }](/assets/posts/building-ordiclick/kitchen-before-after.webp)
*The biggest change wasn't visual. The first version showed one ticket per
table. Today the kitchen sees one row per dish: four lasagne across three
orders, with the variant set apart, started with one tap.*

---

## A Saturday Night That Never Happened

In October I wanted to know if the whole thing would hold up, without waiting
for a real Saturday to find out.

So I built one.

On a throwaway local copy of the backend, never production, I created
**15 venues** (pizzerias, osterie, bars, sushi places), a month of order
history, delivery zones and riders. Then I ran all fifteen at the pace of a
busy Saturday for ten minutes, while recording every request the real app made.

The results:

- **zero technical errors** across every run; the only rejected orders were
  business rules, like a minimum order or an address outside the delivery zone;
- **no data crossing between venues**, checked with dedicated tests on every
  Realtime channel;
- customer-facing calls stayed **under 100 ms** at the 95th percentile.

It also found real bugs, the kind no amount of clicking around would have
shown me:

- **two reservations** for the last free table could both go through if they
  arrived together;
- after midnight, a delivery at 00:10 was assigned to the wrong rider, because
  "this evening" had silently become "tomorrow";
- every new order pinged *every* rider: one checkout with five dishes and
  four riders sent 28 messages. After the fix, the whole evening went from 735
  of those messages to 108;
- the rider page polled the server even when it was already receiving live
  updates. Fixing it cut those calls by **87%**.

The most useful conclusion was a boring one: **the limit was the hosting plan,
not the code.** At that pace, the free tier's monthly quota of live messages
would cover fewer than ten busy venues. The database itself barely noticed.

This is the part of the project I'd point to if someone asked whether
building with AI agents scales. Not because the AI wrote correct code the first time, but
because it made writing the *simulation* cheap enough that I actually did it.

---

## Pricing, Three Times

Code wasn't the only thing that took a few attempts.

The price list changed three times in three months:

1. **two plans** in August;
2. **à la carte** from September: a base menu plus ten features, each with its
   own monthly price;
3. **three plans** since October 23: *Menù* at €9.90, *Ordini* at €24.90 and
   *Completo* at €34.90 a month.

À la carte looked fairer on paper. In practice, ten options with five
dependencies between them asked a restaurant owner to make decisions in the
dark, at the exact moment they were deciding whether to pay at all.

Three plans that match three kinds of venue (the trattoria with a QR menu, the
place that takes orders, the one that delivers) turned out to be simpler for
them and for me.

I don't have reactions from real owners yet. My feeling is that these prices
are on the low side: they're set to keep the service running without losing
money, not to make a profit. The first venues will tell me whether that's right.

---

## What the AI Did, and What It Didn't

What it made possible:

- **one person shipping a whole product**: menus, orders, kitchen, reservations,
  loyalty, deliveries, subscriptions and a public demo;
- **the work I would have skipped**: load scripts, a fake month of orders, a
  simulated Saturday night;
- **written reviews I could act on**: critical passes on the backend and on
  every network call, kept in the repository next to the code they changed.

What stayed with me:

- **what not to build**: no native apps, no delivery aggregators, no
  integration with the till;
- **the domain**: the AI didn't know that a restaurant's evening doesn't end at
  midnight, or that the kitchen and the dining room care about different things;
- **saying no**: five kitchen screens means four went in the bin, and the model
  is always happy to add one more button.

---

## Where It Is Now

The pasta shop in Teramo that started all of this is starting to use OrdiClick
right now, for its real orders. Until this week, everything in this post was
tested against simulations and a demo, not real customers. Now it's the
WhatsApp chat against the panel, and I'll find out which parts of the product
actually hold up.

The next problem isn't technical at all: it's finding the venues after this one.
That's the part I know least about, and probably the subject of a future post.

If you run a restaurant, a pizzeria or a bar in Italy and want to try it,
[write to me](mailto:davdifr@gmail.com).

---

## Final Thoughts

With SortDocs, the question was whether vibecoding could produce a useful tool.

With OrdiClick, the question became whether building with AI agents could
produce something other people can depend on.

My answer, after five months and with the first shop just starting to use it,
is yes, with a condition: the AI made building cheap, so the work moved
somewhere else. Into deciding what to build, into
testing it as if a real Saturday night depended on it, and into throwing away
the versions that weren't good enough.

That part is still mine.
