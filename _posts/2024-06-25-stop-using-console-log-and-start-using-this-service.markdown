---
layout: post
title: "Stop Using console.log and Start Using This Service!"
date: 2024-06-25 13:45:00 +0200
categories:
  - Web Development
  - Front-end
tags:
  - angular
  - typescript
  - service
---

Logging is an essential part of any software development process. It helps developers debug applications, understand workflows, and track down issues. However, relying solely on console.log for logging in an Angular application can quickly become problematic, especially when moving from development to production environments.

In this article, I will introduce a logging service that can be easily integrated into your Angular application. This service allows you to control the log level based on the environment configuration, ensuring that verbose logging is available during development but minimized or disabled in production.

## Why You Should Stop Using console.log

Using `console.log` statements scattered throughout your codebase can lead to several issues:

1. **Performance Issues**: Excessive logging in production can degrade performance.
2. **Security Risks**: Sensitive information might be logged and exposed.
3. **Clutter**: Logs can quickly become cluttered, making it difficult to find relevant information.

By using a structured logging service, you can mitigate these issues and have more control over what gets logged and when.

## Introducing the Log Service

Here's a simple but effective logging service for your Angular application. It uses an enumerated log level to control what messages are logged based on the current environment configuration.

## Log Levels Enum

First, we define an enumeration for the different log levels:

```typescript
export enum LogLevel {
  info,
  error,
  warn,
  debug,
  all,
}
```

## Log Service

Next, we create the LogService that utilizes this enum to conditionally log messages:

```typescript
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { LogLevel } from "../models/log.interface";

@Injectable({
  providedIn: "root",
})
export class LogService {
  constructor() {}

  log(message?: any, ...optionalParams: any[]) {
    if (environment.logLevel >= LogLevel.debug) {
      console.log(...[message, ...optionalParams]);
    }
  }

  table(message?: any, ...optionalParams: any[]) {
    if (environment.logLevel >= LogLevel.debug) {
      console.table(...[message, ...optionalParams]);
    }
  }

  trace(message?: any, ...optionalParams: any[]) {
    if (environment.logLevel >= LogLevel.debug) {
      console.trace(...[message, ...optionalParams]);
    }
  }

  error(message?: any, ...optionalParams: any[]) {
    if (environment.logLevel >= LogLevel.error) {
      console.error(...[message, ...optionalParams]);
    }
  }

  debug(message?: any, ...optionalParams: any[]) {
    if (environment.logLevel >= LogLevel.debug) {
      console.debug(...[message, ...optionalParams]);
    }
  }

  info(message?: any, ...optionalParams: any[]) {
    if (environment.logLevel >= LogLevel.info) {
      console.info(...[message, ...optionalParams]);
    }
  }

  warn(message?: any, ...optionalParams: any[]) {
    if (environment.logLevel >= LogLevel.warn) {
      console.warn(...[message, ...optionalParams]);
    }
  }
}
```

## Environment Configuration

Finally, we configure the environments to use different log levels:

```typescript
// environment.ts (Development)
export const environment = {
  production: false,
  logLevel: LogLevel.debug
};

// environment.prod.ts (Production)
export const environment = {
  production: true,
  logLevel: LogLevel.info
};
```

## How to Use the Log Service

To start using the LogService, inject it into your components or services:

```typescript
import { Component, OnInit } from '@angular/core';
import { LogService } from './services/log.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(private logService: LogService) {}

  ngOnInit() {
    this.logService.info('Application initialized');
    this.logService.debug('Debugging information');
  }
}
```

## Conclusion

By using this `LogService`, you can gain better control over your logging output, ensuring that you have detailed logs in development while keeping your production environment clean and efficient. This approach not only enhances the maintainability of your application but also helps in adhering to best practices for logging in software development.

Stop scattering `console.log` statements in your code today and start using a structured logging service for a more robust and manageable application!
