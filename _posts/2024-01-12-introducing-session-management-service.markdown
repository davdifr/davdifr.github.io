---
layout: post
title: "A Fresh Take on Angular Session Management: Introducing SessionManagementService"
date: 2024-01-12 14:00:00 +0200
categories:
  - Web Development
  - Front-end
tags:
  - angular
  - typescript
  - session
  - service
---

## Introduction
This service focuses on maintaining a single active session in a multi-tab environment, enhancing the user experience and application efficiency. It started as an experiment, a simple concept to improve session management. To my surprise, the outcome was quite intriguing. This has motivated me to share it with the community. It's possible that it could be useful to others, or at the very least, it might spark new use cases or ideas among fellow developers.

## Service Overview

`SessionManagementService` utilizes Angular's dependency injection and the power of RxJS for reactive programming. Its main goal is to identify and manage multiple instances of the same application in different browser tabs, ensuring a coherent and focused user interaction.

## Key Features:

**Multi-Tab Session Detection**: Detects when the same application is opened in multiple tabs.

**Session State Management**: Keeps only the most recent session active.

**Reactive Event Handling**: Responds to browser events, maintaining up-to-date session states.

![Session Management Service Preview](/assets/posts/introducing-session-management-service/preview.gif)

## Service in ActionTechnical Insights

The service's functionality revolves around event listeners for browser activities. These listeners help in coordinating session states across tabs, essential for maintaining a consistent user experience.

## Code Functionality

**Unique Session IDs**: Each tab generates a unique session ID. The service tracks these IDs to identify the active sessions.

```typescript
private createNewSessionId(): string {
    return Date.now().toString();
}
```

**Browser Event Listeners**: The service listens to storage and beforeunload events to manage session updates and cleanup.

```typescript
private setupStorageEventListener(): void {
    window.addEventListener('storage', (event: StorageEvent) => {
        this.storageEventSubject.next(event);
    });
}
```

**Determining the Active Session**: The service checks if the current tab is the active session, differentiating the user experience based on session activity.

```typescript
isCurrentSessionActive(): boolean {
    const sessions = this.getSessionsFromStorage();
    return sessions[sessions.length - 1] === this.#currentSessionId;
}
```
## Complete Code Listing

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SessionManagementService {
  storageEventSubject = new BehaviorSubject<StorageEvent | null>(null);

  #currentSessionId: string = '';
  #sessionIds: string[] = [];

  constructor() {
    this.setupStorageEventListener();
    this.#currentSessionId = this.createNewSessionId();
    this.#sessionIds = this.getSessionsFromStorage();

    if (this.#sessionIds.length) {
      this.#sessionIds.push(this.#currentSessionId);
      this.setSessionsToStorage(this.#sessionIds);
    } else {
      this.initializeFirstSession();
    }

    fromEvent(window, 'beforeunload').subscribe(() => {
      const sessions = this.getSessionsFromStorage().filter(
        (session) => session !== this.#currentSessionId
      );
      this.setSessionsToStorage(sessions);
    });
  }

  private setupStorageEventListener(): void {
    window.addEventListener('storage', (event: StorageEvent) => {
      this.storageEventSubject.next(event);
    });
  }

  private createNewSessionId(): string {
    return Date.now().toString();
  }

  private initializeFirstSession(): void {
    this.#sessionIds.push(this.#currentSessionId);
    this.setSessionsToStorage(this.#sessionIds);
  }

  isCurrentSessionActive(): boolean {
    const sessions = this.getSessionsFromStorage();
    return sessions[sessions.length - 1] === this.#currentSessionId;
  }

  private getSessionsFromStorage(): string[] {
    const sessionsInStorage = localStorage.getItem('sessions');
    return sessionsInStorage ? JSON.parse(sessionsInStorage) : [];
  }

  private setSessionsToStorage(sessions: string[]): void {
    localStorage.setItem('sessions', JSON.stringify(sessions));
  }
}
```

## Potential Use Cases

The service is ideal for applications where efficient session management and a focused user experience across multiple tabs are important.

## Concluding Thoughts

`SessionManagementService` is an experimental concept, aiming to offer a new approach to session management in web applications. It's a starting point to experiment and adapt in various contexts.