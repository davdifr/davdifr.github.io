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

A friend recently introduced me to **vibecoding**—a concept where AI handles all the coding, relying solely on prompts.

Despite the obvious limitations, my curiosity as a tech enthusiast got the best of me. With social media buzzing about it, I saw an opportunity to connect with other developers and challenge myself in a new way. The idea of pushing AI to its limits without writing a single line of code was too intriguing to ignore.

## Setting the Stage

Before diving in, I needed to decide on a project—something practical yet simple enough for AI to handle. I also set a few ground rules:

1. No manual coding—only AI-generated code.
2. Minimal editing—syntax fixes allowed, no major rewrites.
3. If AI got stuck, I had to prompt my way out.
4. The entire process should take no more than a couple of hours.

With that, I opened my AI coding assistant and got to work.

## The Experiment

### Choosing the Right Tools

I first tried **Cursor**, an AI-powered editor, but it felt too much like a modded VS Code. Instead, I opted for **GitHub Copilot** paired with **Claude 3.7**.

### Picking a Project

Scrolling through **X**, I noticed many vibecoding projects focused on game development, particularly with **Three.js** for 3D models. That seemed like a great challenge! So, I decided to build a **3D multiplayer game** with real-time interactions via **Socket.IO**.

### First Steps

I started with this prompt:

> I want to create a real-time interactive 3D web application using Three.js and Socket.IO. The project should feature a simple multiplayer environment where multiple users can connect, move a 3D object in real-time, and see updates from others instantly.

The AI generated a basic **3D cube** on a plane, movable with **WASD** keys, and even included a user counter.

![VS Code AI Prompt Screenshot](/assets/posts/vibecoding-let-ai-code-for-me/first-prompt.png)

![Project Running Screenshot](/assets/posts/vibecoding-let-ai-code-for-me/first-result.gif)

### Adding a Chat System

Next, I prompted the AI to implement a real-time chat system:

> Implement a real-time chat system with global and private messaging. The UI should feature a tabbed chat system at the bottom of the screen.

I worried about AI struggling with the **tabbed UI**, and sure enough, it hit a **time limit error**. I simply resubmitted the same prompt, and it picked up where it left off.

![Chat System Screenshot](/assets/posts/vibecoding-let-ai-code-for-me/first-chat-result.gif)

The chat worked, but had a few quirks:

- The chat UI didn't always stay in the foreground.
- A misplaced username input field.
- Typing in chat also moved the player (**WASD** issue).

### Refining the Chat System

I refined my prompt to address these issues:

> The chat system is functional, but I need the following fixes:
>
> - Remove any button that toggles chat visibility.
> - Prompt users for a username at startup instead of placing an input field in the chat.
> - Prevent movement while typing in chat.
> - Re-enable movement when clicking outside the input.

After applying fixes, I noticed a critical issue—**players disappeared upon joining**. So I prompted:

> Fix the issue where players are not visible after entering the game.

This restored proper rendering.

![Player and Chat Fix](/assets/posts/vibecoding-let-ai-code-for-me/player-and-chat-fix.gif)

### Refactoring the Code Structure

The project was running from just three files—**index.html, server.js, and game.js**—which made maintenance difficult. I prompted AI to split the code into multiple files following best practices.

![Directory Structure](/assets/posts/vibecoding-let-ai-code-for-me/directory-structure.png)

### Expanding the Game Area

The playable area was too small. I asked AI to:

> Expand the game area and add a boundary to prevent players from going beyond it.

It responded by:

- Increasing world size from **20 to 40 units**.
- Adding semi-transparent boundary walls.
- Restricting movement beyond limits.
- Displaying a warning message near edges.
- Implementing server-side validation.

![Boundary Walls](/assets/posts/vibecoding-let-ai-code-for-me/boundary-walls.gif)

### Fixing Multiplayer Visibility Bug

New players weren't visible to those already connected. I prompted:

> Ensure that all connected users see new players upon joining.

This restored proper synchronization.

### Implementing Player Collision

I wanted to prevent players from passing through each other:

> Add a collision system so players cannot pass through each other. Ensure consistency across all clients.

This worked, but introduced a weird bug—**player colors changed on collision**. Additionally, colors appeared differently for each client. I fixed this with:

> Keep player colors static. Ensure color consistency across all clients.

![Collision Bug](/assets/posts/vibecoding-let-ai-code-for-me/player-missing-after-chat-fix.gif)

### Debugging AI Mistakes

AI sometimes introduced syntax errors. At one point, I encountered this:

> Uncaught ReferenceError: handleCurrentPlayers is not defined

I asked AI to review and fix it, and it successfully debugged itself.

![Auto Fix](/assets/posts/vibecoding-let-ai-code-for-me/auto-fix-misstypo.png)

### Improving Camera Behavior

By default, the camera didn’t follow the player, making navigation frustrating. I prompted:

> Ensure the camera stays centered on the player.

This small tweak greatly improved the experience.

![Camera Movement](/assets/posts/vibecoding-let-ai-code-for-me/camera-movement.gif)

### Jump Mechanic & UI Improvements

To enhance movement, I added jumping:

> Implement a jump mechanic using the space bar. Prevent infinite jumping.

Jumping worked flawlessly.

![Jump](/assets/posts/vibecoding-let-ai-code-for-me/jump.gif)

The UI also felt cluttered, so I requested:

> Organize the UI:
>
> - Move the player count to the top-right.
> - Hide control hints behind a toggle button.

![UI Adjustments](/assets/posts/vibecoding-let-ai-code-for-me/ui-adjustment.gif)

## Conclusion

This experiment was surprisingly effective. While **AI-generated code isn’t perfect**, its ability to **iterate and self-correct** was impressive.

The final product could be a great base for a **.IO-style multiplayer game**, with mechanics like player growth and competitive elements.

The most fascinating part? This was all built **in two hours**. Manual coding would have taken far longer. Instead of focusing on syntax, I focused on **iterating through AI-generated results**.

While vibecoding has **clear limitations**, it’s a powerful tool for rapid prototyping. Who knows? With more improvements, it could become an even stronger development method.
