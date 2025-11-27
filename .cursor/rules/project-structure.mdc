---
alwaysApply: true
---

# Project Structure (`src/app`)

The application is organized into three main sections:
- **core/** → shared infrastructure and global logic  
- **shared/** → reusable UI components, directives, and pipes  
- **feature folders** (e.g., `sales/`, `payments/`) → independent domains or functional areas  

Each feature folder follows a consistent and modular structure.

src/
└── app/
├── core/ # Core logic shared across the app
│ ├── components/ # Global reusable UI components
│ ├── directives/ # Common attribute or structural directives
│ ├── interceptors/ # HTTP interceptors (auth, error handling, etc.)
│ ├── guards/ # Route guards for authentication or permissions
│ ├── enums/ # Shared enumerations (e.g., UserRole, HttpStatus)
│ ├── constants/ # Global constants and configuration objects
│ ├── models/ # Global data models and interfaces
│ ├── pipes/ # Common pipes (e.g., format, transform)
│ ├── utils/ # Helper functions for common operations
│ └── services/ # Global singleton services (e.g., HttpClient, Logger)
│
├── shared/ # Reusable UI elements and utilities
│ ├── components/ # Reusable presentation components (buttons, modals, etc.)
│ ├── directives/ # Shared directives
│ ├── pipes/ # Shared pipes for UI formatting
│ ├── validators/ # Common form validators
│ └── shared.config.ts # Module configuration and exports for shared elements
│
└── sales/ # Example feature folder (sample domain)
  ├── components/ # Components specific to the sample feature
  ├── directives/ # Common attribute or structural directives
  ├── guards/ # Route guards for authentication or permissions
  ├── managers/ # Business logic or state management classes
  ├── enums/ # Shared enumerations (e.g., UserRole, HttpStatus)
  ├── constants/ # Global constants and configuration objects
  ├── models/ # Global data models and interfaces
  ├── pipes/ # Common pipes (e.g., format, transform)
  ├── utils/ # Helper functions for common operations
  ├── services/ # Global singleton services (e.g., HttpClient, Logger)
  ├── managers/ # Business logic or state management classes
  ├── repositories/ # Data access or persistence logic
  └── sales-routes.ts # Routes for the sales feature

### Notes
- Feature folders follow a **flat structure** under `app/` (not nested modules).  
- This layout ensures **clear separation of concerns**, **reusability**, and **scalability** as the app grows.
- Each feature defines its own `*-routes.ts` file to declare navigation paths.