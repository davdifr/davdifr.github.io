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

A friend of mine recently told me about **vibecoding**—a concept where you let AI handle all the coding without writing a single line of code yourself. Just prompts, nothing else.

At first, the limitations seemed obvious, but as a tech enthusiast, I was immediately intrigued. With social media buzzing about it, I saw a perfect chance to connect with other developers and grow my network. The thought of pushing AI to its limits without writing a single line of code felt like an exciting challenge—one I couldn't resist. So, I decided to dive in.

## Setting the Stage

Before jumping into the experiment, I had to decide: what should I build? It needed to be something practical yet simple enough for AI to handle (hopefully). I also wanted to see how much I could get done using **just** prompts.

I set a few ground rules:

1. No manual coding—only AI-generated code.
2. Minimal editing—fixing syntax errors was okay, but no major rewrites.
3. If AI got stuck, I had to prompt my way out of it.
4. The entire process should take no more than a couple of hours.

With that in mind, I opened up my AI coding assistant and got to work.

## The Experiment

### Choosing the Right Tools

The first thing I did was download **Cursor**, an editor with an AI agent built in. At first glance, it felt like just a modded version of VS Code, so I quickly set it aside. Instead, I figured I could achieve the same results by configuring **GitHub Copilot** to use **Claude 3.7**.

### Picking a Project

Of course, the next step was deciding what to build. While scrolling through **X**, I noticed that many of the most interesting "vibecoding" projects were somehow related to video games. More specifically, a lot of them involved using the **Three.js** JavaScript library to create 3D models. That sounded pretty cool!

So, I thought, why not try creating a **3D multiplayer game** where users can connect via sockets and maybe even chat with each other? At least as a starting point.

### First Prompt

This was my first prompt:

I want to create a real-time interactive 3D web application using Three.js and Socket.IO. The project should feature a simple multiplayer environment where multiple users can connect, move a 3D object in real-time, and see updates from others instantly.


### First Results

I entered this prompt into the AI agent inside VS Code (screenshot below):

![VS Code AI Prompt Screenshot](/assets/posts/vibecoding-let-ai-code-for-me/first-prompt.png)

Without any additional details, the AI generated a basic **3D cube** placed on a plane. It was already movable using the **WASD** keys, and surprisingly, a user counter was also included to track the number of connected users.

Here’s a screenshot of the project in action:

![Project Running Screenshot](/assets/posts/vibecoding-let-ai-code-for-me/first-result.gif)

### Adding a Chat System

Next, I decided to implement a real-time chat system. This was my second prompt:

Implement a real-time chat system. The chat should allow global messaging and private messaging between connected users. The UI should be designed with a tabbed chat system at the bottom of the screen.


Things started getting interesting. I was a bit worried that adding **tabs** to the chat might be too much, and sure enough, I ran into a **time limit error**. Not giving up, I simply resubmitted the **exact same prompt**. 😆

Surprisingly, the AI picked up where it left off and continued implementing the chat system.

Here’s a screenshot of the updated project:

![Chat System Screenshot](/assets/posts/vibecoding-let-ai-code-for-me/first-chat-result.gif)

The result was pretty cool! The chat system worked, but it had a few quirks:

- The chat UI was **not always in the foreground**, making it a bit inconvenient to use.
- There was an **input field to change the username**, but it was placed where it shouldn't be.
- One **bug** I noticed was that typing in the chat while using movement keys (**WASD**) also moved the player—which shouldn’t happen.

### Refining the Chat System

At this point, I figured it was a good moment to prompt the AI to fix these issues. Also, the chat implementation had grown to over **600 lines of code**, so it seemed like the right time to **initialize a repository** to avoid losing progress due to potential errors.

Here’s the next prompt I gave the AI:

The chat system is functional, but I need the following fixes and improvements to enhance the user experience:

- Remove any button or functionality that toggles the chat visibility.
- Prompt the user to enter a username at the start of the application and remove the current username input field from the general chat tab.
- When the chat input field is focused, movement keys (WASD) should not move the player.
- As soon as the user clicks outside the input, movement should be re-enabled.


### Fixing Critical Issues

Since the previous attempt failed to resolve the issues, I decided to focus on fixing the most critical bugs first before refactoring the structure. This was my next prompt:

![](/assets/posts/vibecoding-let-ai-code-for-me/player-missing-after-chat-fix.gif)

I need you to fix several issues in my game. Here are the specific problems:

- High priority: After entering the game with a username, the player is not visible. Please ensure the player character is properly rendered upon joining.
- In the general chat, the input field labeled "Your username" and the "Set Name" button should no longer be there. Remove them completely.
- Remove the "Chat" label located at the top right of the screen.
- The tab buttons should have rounded corners on all edges (apply a border-radius to all corners).


### Success! 🎉

Everything was finally working as expected! Here’s the version with all the fixes applied:

![](/assets/posts/vibecoding-let-ai-code-for-me/player-and-chat-fix.gif)

### Refactoring the Project Structure

With everything finally working, I decided it was time to improve the project's maintainability. The entire application was still running from just three files—**index.html, server.js, and game.js**—which was far from ideal. To fix this, I gave the AI the following prompt:

The project is using only three files: index.html, server.js, and game.js. This is making the code harder to maintain and scale. I need you to refactor the project structure by splitting the code into multiple files following best practices.


![](/assets/posts/vibecoding-let-ai-code-for-me/directory-structure.png)

### Expanding the Game Area

While the game was functional, the playable area was quite small, and players could walk beyond the visible floor, which felt incomplete. To address this, I gave the AI the following prompt:

I need you to expand the game area and add a boundary that players cannot cross.


The response was fantastic! Here’s what the AI implemented:

- **Increased World Size:** The game area was expanded from **20 to 40 units**.
- **Boundary Walls:** Semi-transparent walls now visually marked the boundaries.
- **Movement Restrictions:** Players could no longer move beyond the boundaries.
- **Boundary Warnings:** Players received warning messages when approaching the edges.
- **Server-Side Validation:** The server validated all positions to ensure they remained within the boundaries.

Here’s a GIF showcasing the updated game world:

![](/assets/posts/vibecoding-let-ai-code-for-me/boundary-walls.gif)

### Fixing Multiplayer Visibility Bug

Unfortunately, while testing further, I discovered a new bug. When a new user joined, they could see the other connected players, but those already in the game couldn't see the newcomers. They didn't appear in the world, nor were they listed in the online players tab of the chat.

To address this, I gave the AI the following prompt:

Connected users do not see players who join after them and do not receive updates in the active players tab. Fix the issue.


After running this prompt, the issue was successfully resolved! The game was now properly updating all players in real time again.

### Implementing Player Collision

Now, I wanted to implement **player collision**, preventing players from walking through each other. There wasn’t an immediate gameplay reason for this, but it felt like one of those fundamental mechanics that should always be present in a multiplayer game.

Here’s the prompt I gave the AI:

I need you to add a collision system so that players cannot pass through each other.
Ensure that collisions are correctly handled both on the client and server-side to prevent desynchronization.
All players should see the same collision behavior in real time.


### Unexpected Side Effects

I might have made a mistake when adding the hint: **All players should see the same collision behavior in real time.**

Now, whenever one player **touches another, their color changes**! 🤦‍♂️

This also made me realize that each client was generating different colors for the players, meaning that the same player could appear **in different colors to different users**, which wasn’t ideal. The colors should be **consistent across all clients** so that everyone sees the same representation.

To fix these issues, I gave the AI the following prompt:

I don't like that the player’s color changes during a collision. The color should remain unchanged when a player collides with another.

Additionally, I’ve noticed that each client generates different colors for the players. Player colors should be unique across the map and displayed consistently for all players. Ensure that the same color is visible to everyone for the same player.

Please fix these issues and ensure consistent behavior across all clients.


### Debugging AI Mistakes

Unfortunately, the AI-generated code was flawed. A **comment improperly extended into the code**, likely due to a copy-paste error, which completely broke the game.

Additionally, I encountered this error in the console:

Uncaught ReferenceError: handleCurrentPlayers is not defined


![](/assets/posts/vibecoding-let-ai-code-for-me/code-damage.png)

Since I couldn't manually fix the issue, I decided to prompt the AI again for a correction:

The player.js file appears to be corrupted due to a comment that improperly extends into the code, possibly due to a copy-paste error. This is causing unexpected behavior or syntax issues.

Please review and fix the file.


Amazingly, it worked! The AI was able to detect and correct the issues, even explaining the changes it had made.

![](/assets/posts/vibecoding-let-ai-code-for-me/auto-fix-misstypo.png)

### Improving Camera Behavior

Another issue I wanted to address was the **camera movement**. At the moment, the camera does not follow the player, making it easy to get lost while moving around. To fix this, I gave the AI the following prompt:

Ensure that the camera stays centered on the player.


A very minimal prompt, but an interesting test to see how well the AI understands the requirement.

Surprisingly, the AI handled the problem **perfectly**! It correctly adjusted the camera to follow the player smoothly.

![](/assets/posts/vibecoding-let-ai-code-for-me/camera-response.png)

Here’s a GIF showcasing the updated camera behavior:

![Camera Following Player GIF](/assets/posts/vibecoding-let-ai-code-for-me/camera-movement.gif)

### Fixing Shadow Rendering and Movement Controls

With the camera issue resolved, I noticed another **visual problem**—the player's **shadow only appeared in the central area** of the map. To address this, I gave the AI the following prompt:

Players only have shadows when they are positioned in the central area of the game world. Please fix the shadow rendering so that shadows are consistent across the entire map.


The issue was immediately resolved! Now, shadows appeared correctly **across the entire map**.

However, another **control issue** emerged: **movement was not relative to the camera's direction**. If a player rotated the camera and then tried to move using **WASD**, movement didn’t align with the player's perspective, making navigation very difficult.

To fix this, I gave the AI the following prompt:

When a player presses W, A, S, or D, movement should be aligned with the camera's perspective.
If the camera is rotated or moved, the controls should adapt accordingly so movement remains intuitive.


### Implementing a Jump Mechanic

It was time to add a **new gameplay feature**—jumping! Even though the game didn’t have a clear purpose yet, jumping felt like a fundamental mechanic that should exist.

Here’s the prompt I gave the AI:

I need you to implement a jump mechanic using the space bar while ensuring that movement is preserved.
When the player presses Space, they should jump upwards.
Players should only be able to jump when on the ground (no infinite jumping).
Ensure the height feels natural and balanced.


A simple prompt, but a great test to see how well the AI could handle physics and movement constraints.

The AI delivered! Jumping was implemented correctly, with natural height limits and no infinite jumps.

Here’s a GIF showcasing the updated movement system with jumping included:

![](/assets/posts/vibecoding-let-ai-code-for-me/jump.gif)

### Improving the UI Layout

One thing that bothered me was the cluttered UI. The screen displayed all control hints at all times, which felt unnecessary. I wanted a cleaner interface while still allowing easy access to the controls when needed.

To organize the UI better, I gave the AI the following prompt:

I want to clean up the UI and organize it better. Here’s what I need:
- Place the number of online players in the top-right corner of the screen.
- Instead of displaying all controls at all times, add a UI button or icon on the left side that users can click to view the controls.


![](/assets/posts/vibecoding-let-ai-code-for-me/ui-adjustment.gif)

The AI handled the request well, repositioning the user count and adding a toggle for controls, making the interface much cleaner!


## Conclusion

This experiment turned out to be both fun and surprisingly effective. Visually, the result isn’t bad at all, and while the **limitations in code quality are obvious**, the AI’s ability to **self-correct** was impressive.

The final product could actually serve as a solid starting point for building a small **.IO-style multiplayer game**. With some additional tweaks, players could **collect objects, grow in size, and even “eat” other players** to become the biggest one on the map.

What’s really fascinating is how much was **produced in just two hours**. Manually coding all of this would have taken significantly longer, but the key difference lies in **how the goal is achieved**. Instead of focusing on writing perfect code, this approach shifts the focus to **iterating through AI-generated results** and refining them with well-crafted prompts.

While vibecoding still has **clear limitations**, it’s an interesting way to **rapidly prototype ideas**. And who knows? Maybe with some further improvements, it could evolve into something even more powerful!