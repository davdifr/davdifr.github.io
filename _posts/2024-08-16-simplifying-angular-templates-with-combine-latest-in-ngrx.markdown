---
layout: post
title: "Simplifying Angular Templates with combineLatest in NgRx"
date: 2024-08-16 15:00:00 +0200
categories:
  - Web Development
  - Front-end
tags:
  - angular
  - typescript
  - NgRx
---

When working with Angular and NgRx, a common challenge is effectively managing and combining state selectors in a clean and readable way. The `combineLatest` function offers a powerful solution to this problem, especially when paired with Angular's `async` pipe and `ng-container`. This approach allows you to create more streamlined and maintainable templates, improving both readability and performance.

## Understanding `combineLatest`

The `combineLatest` function in RxJS, which NgRx relies on, is used to combine multiple observables into one. When using it with NgRx selectors, it allows you to combine multiple pieces of state into a single observable stream, which you can then subscribe to in your components.

Here's a basic example:

```typescript
data$ = combineLatest([
  sample1: this.#store.select(sampleSelector1)),
  sample2: this.#store.select(sampleSelector2))
])
```

In this example, `data$` is an observable that emits an object containing `sample1` and `sample2` whenever either selector emits a new value. This combined observable can then be used directly in your Angular template.

## Leveraging `ng-conteiner` and the `async` Pipe

One of the most effective ways to use `combineLatest` in your Angular template is by starting with `ng-container` and the `async` pipe. This approach not only simplifies your template but also improves performance by reducing the number of async subscriptions.

Here's how you can do it:

```html
<ng-container *ngIf="data$ | async as data">
  <div>{{ data.sample1 }}</div>
  <div>{{ data.sample2 }}</div>
</ng-container>
```

## The Advantage

Using `combineLatest` together with `ng-container` and the `async` pipe offers several benefits:

**Single Subscription**: By using combineLatest, you only need one async pipe in your template, which reduces the number of subscriptions and simplifies your template logic.

**Clean Template**: The `ng-container` directive allows you to directly access all the combined state selectors within a single data object, keeping your template concise and easy to read.

**Improved Performance**: Fewer subscriptions mean less overhead, leading to better performance, especially in complex components.

**Reduced Boilerplate**: Instead of managing multiple `*ngIf="observable$ | async as value"` directives, you only manage one, which reduces the amount of boilerplate code in your templates.

## Putting It All Together

Consider a component that displays user details and preferences from two different selectors. Without combineLatest, your template might look something like this:

```html
<div *ngIf="user$ | async as user">
  <div>{{ user.name }}</div>
</div>
<div *ngIf="preferences$ | async as preferences">
  <div>{{ preferences.theme }}</div>
</div>
By using combineLatest, you can simplify this to:
<ng-container *ngIf="data$ | async as data">
  <div>{{ data.user.name }}</div>
  <div>{{ data.preferences.theme }}</div>
</ng-container>
```

This approach not only looks cleaner but also scales better as your component grows in complexity.

## Conclusion

Using `combineLatest` in combination with `ng-container` and the `async` pipe in Angular templates provides a more efficient, cleaner, and maintainable way to manage state selectors from NgRx. By adopting this pattern, you can reduce the complexity of your templates, leading to code that's easier to read, write, and maintain.
Give this approach a try in your next Angular project and experience the difference it can make in your codebase!