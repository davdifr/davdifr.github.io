---
layout: post
title: "Dynamic Navigation in Angular: Building a Navbar Using Route Configurations"
date: 2024-01-04 19:00:00 +0200
categories:
  - Web Development
  - Front-end
tags:
  - angular
  - typescript
  - routes
---

## Introduction
In modern web applications, navigation plays a critical role in guiding users through the interface. Angular, a popular front-end framework, offers robust tools for managing routes and navigation. This article delves into how Angular can dynamically build a navigation bar (navbar) based on route configurations. We'll explore an implementation that uses Angular's routing mechanism to populate a navbar component with links to different pages in the application.

## Understanding the Core Files
Our implementation involves three key files: `nav.service.ts`, `navbar.component.ts`, and `app.routes.ts`. Let's break down each file to understand their roles.

nav.service.ts:

```typescript
@Injectable({ providedIn: "root" })
export class NavigationService {
  private router = inject(Router);
  
  getNavigationRoutes(): Route[] {
    return this.router.config
    .flatMap((route) => [route, …(route.children || [])])
    .filter((route) => route.data?.["showInNavbar"]);
  }
}
```

**Purpose**: This service file is responsible for retrieving the routes that should be displayed in the navbar.

**Implementation**: It uses Angular's Router service to access the application's route configurations. The function `getNavigationRoutes()` filters these routes, selecting only those marked with a `data["showInNavbar"]` property. This approach allows us to specify which routes appear in the navbar directly within the route configuration.

navbar.component.ts:

```typescript
@Component({
  selector: "app-navbar",
  template: `
    <nav aria-label="Main navigation">
      <ul>
        @for (route of routes; track $index) {
          <li>
            <a routerLink="{{ route.path }}">{{ route.data?.['title'] }}</a>
          </li>
        }
      </ul>
    </nav>`
})
export class NavbarComponent {
  private navigation = inject(NavigationService);

  routes: Route[] = [];

  ngOnInit(): void {
    this.routes = this.getRoutes();
  }

  private getRoutes(): Route[] {
    return this.navigation.getNavigationRoutes();
  }
}
```

**Purpose**: This component file represents the visual element of the navbar in the application.

**Implementation**: It imports `NavigationService` to access the filtered routes. The component's template uses Angular's structural directives to iterate over these routes and dynamically create navigation links. This setup ensures that the navbar reflects the current route configuration of the application.

app.routes.ts:

```typescript
export const routes: Routes = [
  {
    path: "first-page",
    data: { title: "First Page", showInNavbar: true }
    // other properties...
  },
  // other routes...
];
```

**Purpose**: This file defines the routes of the application.

**Implementation**: Each route object includes the path, component, and any child routes. Notably, routes meant for the navbar have a data property with `showInNavbar: true`. This design simplifies route management and makes the navbar's content easily adjustable by modifying the route configurations.

## Bringing It All Together
The interaction between these files creates a cohesive navigation system. When the application initializes, NavbarComponent fetches the routes from `NavigationService`, which in turn retrieves and filters them from the Angular Router. As a result, the navbar dynamically adjusts to changes in the route configuration, making the application more modular and easier to maintain.

## Conclusion

Angular's routing system provides a powerful way to manage navigation in web applications. By integrating services, components, and route configurations, developers can create dynamic, responsive navigation structures like the navbar we've explored. This approach enhances the scalability and maintainability of Angular applications, allowing for more efficient development workflows.