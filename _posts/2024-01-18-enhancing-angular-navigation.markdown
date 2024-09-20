---
layout: post
title: "Enhancing Angular Navigation with GlobalKeydown: A Guide to Keyboard-Driven Routes"
date: 2024-01-18 11:20:00 +0200
categories:
  - Web Development
  - Front-end
tags:
  - angular
  - typescript
  - routes
---

## Introduction to GlobalKeydownService

Angular's flexibility allows us to extend our application's functionality with custom services. In this case, we'll create `GlobalKeydownService`. This service listens to global keydown events and filters out those triggered within input elements - ensuring that typing in a text field does not inadvertently trigger navigation.

## The Service Code

```typescript
import { Injectable } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class GlobalKeydownService {
    keydownEvents$: Observable<string>;

    constructor() {
        this.keydownEvents$ = fromEvent<KeyboardEvent>(window, 'keydown').pipe(
            filter((event) => !(event.target instanceof HTMLInputElement)),
            map((event) => event.key)
        );
    }
}
```

This service uses RxJS's fromEvent to listen for keydown events on the window object, and then processes these events to output only the relevant key values.

## Integrating GlobalKeydownService with NavbarComponent

With `GlobalKeydownService` in place, we can now modify `NavbarComponent` to listen to keydown events and navigate accordingly.

## Modifying the Navbar Component

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { NavigationService } from '../../shared/services/navigation.service';
import { GlobalKeydownService } from '../../shared/services/global-keydown.service';
import { Subject, takeUntil } from 'rxjs';

// ... Component Code ...

export class NavbarComponent implements OnInit {
    // ... Existing properties ...
    #keydown = inject(GlobalKeydownService);
    #destroy$ = new Subject();

    ngOnInit(): void {
        // ... Existing initialization code ...

        this.#keydown.keydownEvents$
            .pipe(takeUntil(this.#destroy$))
            .subscribe((key) => {
                this.navigateByKey(key);
            });
    }

    private navigateByKey(key: string): void {
        const index = parseInt(key, 10) - 1;
        if (index >= 0 && index < this.routes.length) {
            this.#navigation.navigateTo(this.routes[index].path as string);
        }
    }

    // ... Remaining component code ...
    ngOnDestroy(): void {
        this.#destroy$.next(true);
        this.#destroy$.complete();
    }

}
```

In this updated component, we are subscribing to the `keydownEvents$` observable from `GlobalKeydownService`. When a key is pressed, `navigateByKey` method is called, which checks if the pressed key corresponds to a valid route index and, if so, triggers navigation to that route.

![Angular Navigation](/assets/posts/enhancing-angular-navigation/preview.gif)

## Conclusion

By integrating `GlobalKeydownService` with our navbar component, we've added a layer of keyboard-driven navigation to our Angular application. This approach not only enhances user experience by providing a quicker navigation method but also contributes to the accessibility of the application.