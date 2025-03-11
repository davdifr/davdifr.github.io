---
layout: post
title: "Vibecoding: Letting AI Code for Me"
date: 2025-03-10
categories:
  - AI Development
  - Coding Experiments
  - Game Development
tags:
  - AI Coding
  - Vibecoding
  - Prompt Engineering
  - Three.js
  - Socket.IO
  - Multiplayer Games
---

A friend of mine recently introduced me to **vibecoding**—a concept where you let AI handle all the coding without writing a single line yourself. Just prompts, nothing else.

At first, the limitations seemed obvious, but as a tech enthusiast, I was immediately intrigued. With social media buzzing about it, I saw a perfect opportunity to experiment and connect with other developers. The idea of pushing AI to its limits without manually coding felt like an exciting challenge—one I couldn't resist. So, I decided to dive in.

## Setting the Stage

Before jumping into the experiment, I had to decide: what should I build? It needed to be something practical yet simple enough for AI to handle (hopefully). I also wanted to see how much I could accomplish using **just** prompts.

I set a few ground rules:

1. No manual coding—only AI-generated code.
2. Minimal editing—fixing syntax errors was okay, but no major rewrites.
3. If AI got stuck, I had to prompt my way out of it.
4. The entire process should take no more than a couple of hours.

With that in mind, I opened up my AI coding assistant and got to work.

## The Experiment

### Choosing the Right Tools

The first thing I did was try **Cursor**, an editor with an AI agent built in. It felt like a modded version of VS Code, so I quickly set it aside. Instead, I configured **GitHub Copilot** to use **Claude 3.7**, thinking it would yield better results.

### Picking a Project

While scrolling through **X**, I noticed that many vibecoding projects revolved around video games, especially using the **Three.js** JavaScript library for 3D models. That sounded pretty cool!

So, I thought, why not try creating a **3D multiplayer game** where users can connect via sockets and maybe even chat with each other? At least as a starting point.

### First Prompt

This was my first prompt:

```
I want to create a real-time interactive 3D web application using Three.js and Socket.IO. The project should feature a simple multiplayer environment where multiple users can connect, move a 3D object in real-time, and see updates from others instantly.
```

### First Results

I entered this prompt into the AI agent inside VS Code. Without any additional details, the AI generated a basic **3D cube** placed on a plane. It was already movable using the **WASD** keys, and surprisingly, a user counter was included to track the number of connected users.

Here’s a screenshot of the project in action:

![Project Running Screenshot](/assets/posts/vibecoding-let-ai-code-for-me/first-result.gif)

### Adding a Chat System

Next, I decided to implement a real-time chat system. This was my second prompt:

```
Implement a real-time chat system. The chat should allow global messaging and private messaging between connected users. The UI should be designed with a tabbed chat system at the bottom of the screen.
```

Things started getting interesting. Adding **tabs** to the chat seemed ambitious, and sure enough, I ran into a **time limit error**. Not giving up, I simply resubmitted the **exact same prompt**. 😆

Surprisingly, the AI picked up where it left off and continued implementing the chat system.

The result was functional, but it had some quirks:

- The chat UI was **not always in the foreground**, making it inconvenient to use.
- The **username input field** was placed awkwardly.
- One **bug** caused movement keys (**WASD**) to still move the player while typing in the chat.

### Refining the Chat System

At this point, I figured it was a good moment to prompt the AI to fix these issues. Also, the chat implementation had grown to over **600 lines of code**, so I initialized a repository to avoid losing progress due to potential errors.

After a few refinement prompts, everything was finally working as expected!

### Expanding the Game Area

While the game was functional, the playable area was quite small, and players could walk beyond the visible floor. To address this, I prompted the AI:

```
I need you to expand the game area and add a boundary that players cannot cross.
```

The AI implemented:

- **Increased world size** (from 20 to 40 units).
- **Boundary walls** to visually mark the limits.
- **Movement restrictions** preventing players from crossing the boundaries.
- **Server-side validation** to enforce boundaries.

Here’s a GIF showcasing the updated game world:

![Boundary Walls GIF](/assets/posts/vibecoding-let-ai-code-for-me/boundary-walls.gif)

### Fixing Multiplayer Visibility Bug

While testing further, I discovered a bug: new players could see others, but existing players didn’t see newcomers. To fix this, I prompted:

```
Connected users do not see players who join after them. Fix the issue.
```

The AI successfully resolved it! Real-time updates were now working again.

### Implementing Player Collision

Next, I wanted to prevent players from walking through each other:

```
Add a collision system so players cannot pass through each other. Ensure consistent behavior across all clients.
```

It worked! But... now, when players collided, their colors changed. 🤦‍♂️ Also, player colors were inconsistent across clients. To fix this, I prompted:

```
Players should not change color on collision. Also, ensure that colors remain consistent across all clients.
```

The AI corrected the issue, and colors were now synchronized.

## Conclusion

This experiment was both fun and surprisingly effective. While the **limitations in code quality are evident**, the AI’s ability to **self-correct** was impressive.

The final product could serve as a solid base for a **.IO-style multiplayer game**, where players could collect items and grow in size.

What’s truly fascinating is how much was built in just **two hours**. Instead of focusing on writing perfect code, vibecoding shifts the process to **iterating through AI-generated results** and refining them with prompts.

While it’s far from replacing traditional coding, it's an interesting tool for rapid prototyping. Who knows? Maybe with further improvements, it could become even more powerful!

