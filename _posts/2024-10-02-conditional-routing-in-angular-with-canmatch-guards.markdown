---
layout: post
title: "Conditional Routing in Angular with canMatch Guards"
date: 2024-10-02 20:06:00 +0200
categories:
  - Web Development
  - Front-end
tags:
  - angular
  - typescript
  - routes
---

## Introduction
Routing in Angular is essential for building feature-rich, user-friendly applications. Often, we need to conditionally load different components based on user-specific data, such as access levels, subscriptions, or even preferences. Angular's `canMatch` guard provides a powerful way to control which routes are accessible by dynamically matching the route based on custom logic.

In this article, we'll explore how to use the `canMatch` guard in Angular, with a practical example of showing different components based on user subscription status.

## What is `canMatch`?
The `canMatch` guard in Angular allows you to dynamically control which route should be matched based on a function's logic. Unlike `canActivate`, which decides whether a route can be activated, `canMatch` allows you to decide whether the route itself can be matched, before it's even considered for activation.

## A Real-World Example: Premium Content Access
Let's say we are building a video streaming platform, where some content is available only to users with a premium subscription. We want to ensure that premium users access a special component showing premium content, while regular users access a different component.

## Step 1: Defining the Guard
We'll create a guard function that checks the user's subscription status using a `SubscriptionService`.

```typescript
export const isPremiumUserGuard = (): canMatchFn => {
  return (route, segments) => {
    const subscriptionService = inject(SubscriptionService);
    return subscriptionService.hasPremiumAccess();
  };
};
```

Here, we use Angular's `inject()` function to access the `SubscriptionService`, which checks if the user has premium access.

## Step 2: Configuring the Routes
Now we set up our routes, ensuring that premium users access a `PremiumContentComponent` and regular users access a `RegularContentComponent`.

```typescript
[
  {
    path: 'content',
    canMatch: [isPremiumUserGuard()],
    loadComponent: () => import('./premium-content').then(m => m.PremiumContentComponent),
  },
  {
    path: 'content',
    loadComponent: () => import('./regular-content').then(m => m.RegularContentComponent),
  }
]
```

In this setup:

- The first route will be matched if the user is a premium subscriber.
- If the user doesn't have premium access, the router falls back to the second route, loading the regular content.

## Why Use `canMatch` Instead of `canActivate`?
You might wonder why we use `canMatch` rather than `canActivate`. The key difference is that `canMatch` prevents the router from even considering a route if the guard returns `false`, while `canActivate` still loads the route but decides whether or not to activate it. This makes `canMatch` more efficient for routes that should not even be matched in certain conditions.

## Conclusion
Using the `canMatch` guard in Angular allows you to create dynamic and flexible routing based on user-specific data. Whether you're managing subscription access, roles, or custom preferences, `canMatch` gives you the power to control which components your users see, creating a smoother and more personalized experience.

