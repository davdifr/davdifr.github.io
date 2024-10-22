---
layout: post
title: "Universal Middleware for Any Function"
date: 2024-10-22 20:13:00 +0200
categories:
  - Web Development
  - Front-end
tags:
  - angular
  - typescript
  - middleware
---

Middleware functions are no longer limited to backend systems; they bring tremendous value to front-end applications like Angular as well. From logging and input validation to managing global states, middleware functions can significantly improve code reuse, maintainability, and readability.

In this article, we’ll dive into how you can use higher-order functions (HOFs) to create universal middleware that can be applied to any function. We’ll focus on logging as a practical example, but this pattern can be extended to countless other scenarios.

## Why Middleware?
In Angular, middleware functions can be incredibly useful for:

- Logging
- Input validation
- Handling global loading states
- Automatic data saving (local/session storage)
- Sanitizing inputs
- Feature flags and A/B testing
- Caching
- Batching function calls

These are just a few examples where middleware can enhance your application’s logic without cluttering the core functionality of your code.

## The Challenge: Consistent Logging
Consistent logging is essential for debugging and understanding how data flows through your application. However, maintaining logging logic across various functions can result in repetitive and hard-to-manage code.

Wouldn't it be great if we could add logging universally, without touching every function individually? That’s where higher-order functions and middleware come to the rescue.

## The Solution: Higher-Order Functions for Middleware
A higher-order function (HOF) is a function that either takes other functions as arguments or returns a function. By using HOFs, we can apply middleware (such as logging) to any function in a reusable way.

Here’s how it works:

- **Middleware** is simply a function that wraps another function, adding extra logic before and after the original function's execution.
- **applyMiddleware** is a higher-order function that can apply multiple middleware functions to any given function.

## Code Implementation
Let's start with a logging middleware example:
```typescript
function withLogging<T extends (...args: any[]) => any>(fn: T): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    console.log('Arguments:', args);
    const result = fn(...args);

    if (result instanceof Promise) {
      return result.then((res) => {
        console.log('Result:', res);
        return res;
      }) as ReturnType<T>;
    } else if (isObservable(result)) {
      return result.pipe(
        tap((res) => console.log('Result:', res))
      ) as ReturnType<T>;
    } else {
      console.log('Result:', result);
      return result;
    }
  }) as T;
}
```

### Explaining `withLogging`
- The `withLogging` function wraps any function (`fn`) and logs both its arguments and return value.
- It handles various types of results: synchronous values, Promises, and Observables.
- If the result is an Observable, we use RxJS’s `tap` operator to log values as they are emitted.

Now, we need a function to apply multiple middleware layers:
```typescript
function applyMiddleware<T extends (...args: any[]) => any>(
  fn: T,
  ...middlewares: ((fn: T) => T)[]
): T {
  return middlewares.reduce((acc, middleware) => middleware(acc), fn);
}
```

### Explaining `applyMiddleware`
- This function takes a target function (`fn`) and an array of middleware functions.
- It sequentially applies each middleware, effectively wrapping the original function with additional logic.

## Middleware in Action
Now that we've set up the middleware, let's apply it to a simple function:
```typescript
function add(a: number, b: number): number {
  return a + b;
}

const addWithLogging = applyMiddleware(add, withLogging);

addWithLogging(2, 3);
// Console output:
// Arguments: [2, 3]
// Result: 5
```

With just a couple of lines, we've added logging to our add function without modifying its core logic. This is the magic of higher-order functions!

## Why Use Middleware in Angular?
By introducing middleware to your Angular app, you’ll gain multiple advantages:

- **No More Redundant Code**: Stop copying the same logging logic into every function.
- **Cleaner Code**: Middleware allows functions to focus solely on their core purpose.
- **Consistent Debugging**: Centralized logging ensures that you have a uniform view of data flow across your application.
- **DRY Principle**: Centralizing logic like logging, validation, and caching reduces code duplication and simplifies maintenance.

## Beyond Logging
While we’ve demonstrated logging, the possibilities for middleware in Angular are endless. You could use this pattern for:

- **Caching**: Cache results of expensive operations.
- **Debouncing API calls**: Delay and batch multiple calls to prevent unnecessary requests.
- **Error Handling**: Apply global error handling without modifying each function.
- **Persistence**: Automatically save results to local or session storage.

The key takeaway is that middleware makes your code more flexible and modular. You can enhance your functions without polluting their core logic.

## Final Thoughts
Middleware is a pattern worth exploring for front-end development. By combining Angular with higher-order functions, you can implement reusable logic that will make your code cleaner, more maintainable, and scalable.

## Acknowledgments
A big thank you to [Roberto Heckers](https://www.linkedin.com/in/roberto-heckers-2313453b/) for his inspiration and reference code for the middleware implementation used in this article. His insights into higher-order functions have been a valuable resource for improving the way we write Angular code.