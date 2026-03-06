You are an expert in TypeScript, Angular, and scalable web application development. You write maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## Project: Forms & Users Management System

### Roles
- Two roles exist: `admin` and `user`
- Role is decoded from the JWT claims and stored in `AuthService`
- Never hardcode role checks in components — always go through `AuthService`

### Authentication
- JWT is stored in `localStorage` under the key `access_token`
- `AuthService` exposes signals: `currentUser` and `isAuthenticated`
- A functional `jwtInterceptor` auto-attaches the token to every outgoing HTTP request
- On logout, clear the token and navigate to `/auth/login`

### Routing & Guards
- `authGuard` — redirects to `/auth/login` if not authenticated
- `roleGuard` — redirects to `/unauthorized` if the user lacks the required role
- All feature routes are lazy loaded
- Auth routes (`/auth/login`, `/auth/register`) redirect to dashboard if already logged in

### Folder Conventions
- `core/` — singleton services, guards, interceptors, models. Never import into features directly except via `inject()`
- `features/` — one folder per feature, each lazy loaded via `app.routes.ts`
- `shared/` — dumb/presentational components and pipes only, no business logic

### Models / Interfaces
- All interfaces live in `core/models/`
- Use `interface` over `type` for object shapes
- JWT payload interface: `{ sub: string, email: string, role: 'admin' | 'user', exp: number }`

### HTTP & API
- Base API URL comes from `environment.ts` as `environment.apiUrl`
- All API calls live in dedicated services, never in components
- Handle errors in services and surface them as signals or thrown errors for the component to react to
