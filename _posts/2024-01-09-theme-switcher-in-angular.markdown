---
layout: post
title: "Theme Switcher in Angular: From Dark to Light and Back Again"
date: 2024-01-09 16:30:00 +0200
categories:
  - Web Development
  - Front-end
tags:
  - angular
  - typescript
  - theme
---

## Introduction

Offering a choice between light and dark modes in web applications enhances user experience and accessibility. In this article, we'll explore how to create a dynamic theme switcher in Angular, using a service and a component. Let's dive into the code!

## Understanding the ThemeService
At the core of our theme-switching feature is the `ThemeService`. This service manages the theme state and applies the appropriate styles.

```typescript
import { Injectable, WritableSignal, effect, signal } from "@angular/core";

export const storageKey = "theme";

@Injectable({
  providedIn: "root",
})
export class ThemeService {
  #path: string = "/assets/themes";
  #stylesheet: HTMLLinkElement | null = document.getElementById(
    "theme"
  ) as HTMLLinkElement;

  themeSignal: WritableSignal<string> = signal<string>("light");

  constructor() {
    this.initializeThemeFromPreferences();

    effect(() => {
      this.updateRenderedTheme();
    });
  }

  toggleTheme(): void {
    this.themeSignal.update((prev) =>
      this.isDarkThemeActive() ? "light" : "dark"
    );
  }

  private initializeThemeFromPreferences(): void {
    if (!this.#stylesheet) {
      this.initializeStylesheet();
    }

    const storedTheme = localStorage.getItem(storageKey);

    if (storedTheme) {
      this.themeSignal.update(() => storedTheme);
    }
  }

  private initializeStylesheet(): void {
    this.#stylesheet = document.createElement("link");
    this.#stylesheet.id = "theme";
    this.#stylesheet.rel = "stylesheet";

    document.head.appendChild(this.#stylesheet);
  }

  getToggleLabel(): string {
    return `Switch to ${this.isDarkThemeActive() ? "light" : "dark"} mode`;
  }

  isDarkThemeActive(): boolean {
    return this.themeSignal() === "dark" ? true : false;
  }

  private updateRenderedTheme(): void {
    if (this.#stylesheet) {
      this.#stylesheet.href = `${this.#path}/${this.themeSignal()}.css`;
    }

    localStorage.setItem(storageKey, this.themeSignal());
  }
}
```

This service initializes the theme based on user preferences, manages theme toggling, and dynamically updates the stylesheet link.

## Building the ThemeToggleComponent

The user interacts with the `ThemeToggleComponent` to change the theme. It's a standalone Angular component with a simple yet effective UI.

```typescript
import { Component, inject } from "@angular/core";
import { ThemeService } from "../../shared/services/theme.service";

@Component({
  selector: "app-theme-toggle",
  standalone: true,
  imports: [],
  template: `
    <input
      id="theme-toggle"
      type="checkbox"
      [checked]="isDarkThemeActive()"
      (change)="switchTheme()"
      [attr.aria-label]="getThemeToggleLabel()"
    />
  `,
})
export class ThemeToggleComponent {
  #theme: ThemeService = inject(ThemeService);

  switchTheme(): void {
    this.#theme.toggleTheme();
  }

  isDarkThemeActive(): boolean {
    return this.#theme.isDarkThemeActive();
  }

  getThemeToggleLabel(): string {
    return this.#theme.getToggleLabel();
  }
}
```

This HTML template includes a checkbox that toggles the theme when clicked.

## How They Work Together

The synergy between `ThemeService` and `ThemeToggleComponent` is what makes the theme switching smooth and effective:

- **User Action**: When a user clicks the theme toggle checkbox, `ThemeToggleComponent` calls toggleTheme from `ThemeService`.
- **State Update**: `ThemeService` updates the themeSignal, which triggers a change in the theme.
- **Dynamic CSS Update**: `ThemeService` then changes the href of the stylesheet link, loading the appropriate theme CSS.
- **Persistence**: The new theme preference is stored in local storage for future sessions.

![Theme Switcher in Angular](/assets/posts/theme-switcher-in-angular/preview.gif)

## Switcher in actionConclusion
Implementing a theme switcher in Angular is not just about aesthetics; it's about enhancing user experience and accessibility. With ThemeService and ThemeToggleComponent, you can offer a dynamic and responsive theme-switching feature in your Angular applications.