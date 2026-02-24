---
name: abp-auth-msal
description: Implementa la autenticación con Azure AD usando MSAL (Microsoft Authentication Library). Usar cuando se requiera configurar o integrar autenticación con Microsoft Entra ID (Azure AD) en el proyecto Angular.
---

# Auth MSAL - Autenticación con Azure AD

## Cuándo usar

Úsalo cuando debas implementar o configurar autenticación con Azure AD en el sistema.

## Prerrequisitos

Instalar dependencias:

```bash
npm install @azure/msal-browser @azure/msal-angular
```

## Flujo de implementación

### 1. Modelo Environment

En `src/app/core/models/environment.ts`, verificar si existe la sección `msal`. Si no existe, agregarla con esta estructura:

```typescript
msal: {
  auth: {
    clientId: string;
    authority: string;
    redirectUri: string;
  };
  cache: {
    cacheLocation: string;
  };
};
```

### 2. Archivos de ambiente

En cada archivo de `src/environments/` (ej. `environment.ts`, `environment.development.ts`), agregar la sección `msal` con valores en blanco por defecto:

```typescript
msal: {
  auth: {
    clientId: '',
    authority: '',
    redirectUri: ''
  },
  cache: {
    cacheLocation: 'localStorage'
  }
},
```

Para desarrollo, usar valores de ejemplo como `'YOUR_CLIENT_ID'`, `'https://login.microsoftonline.com/YOUR_TENANT_ID'`, `'http://localhost:4200'`.

### 3. app.config.ts

En `src/app/app.config.ts`:

**Imports requeridos:**

```typescript
import {
  MSAL_INSTANCE,
  MSAL_GUARD_CONFIG,
  MSAL_INTERCEPTOR_CONFIG,
  MsalService,
  MsalGuard,
  MsalInterceptor
} from '@azure/msal-angular';

import {
  PublicClientApplication,
  InteractionType
} from '@azure/msal-browser';

import { AuthService } from 'auth-msal';
```

**Factory y providers:**

```typescript
export function msalInstanceFactory() {
  return new PublicClientApplication(environment.msal);
}

// Dentro de providers:
{
  provide: MSAL_INSTANCE,
  useFactory: msalInstanceFactory
},
{
  provide: MSAL_GUARD_CONFIG,
  useValue: {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: ['User.Read']
    }
  }
},
{
  provide: MSAL_INTERCEPTOR_CONFIG,
  useValue: {
    interactionType: InteractionType.Redirect,
    protectedResourceMap: new Map([
      ['https://graph.microsoft.com/v1.0/me', ['User.Read']]
    ])
  }
},
MsalService,
MsalGuard,
{
  provide: AuthProvider,
  useClass: AuthService
}
```

**HTTP Interceptor:** Si se usan APIs protegidas con tokens de Azure AD, agregar `MsalInterceptor` a los interceptors de `provideHttpClient`:

```typescript
provideHttpClient(
  withFetch(),
  withInterceptors([MsalInterceptor, authInterceptor, clientInterceptor, languageInterceptor])
),
```

### 4. Librería auth-msal

El proyecto debe tener la librería `auth-msal` en `projects/auth-msal/` que exporta `AuthService` implementando `AuthProvider`. Si no existe, crearla con:

- `AuthService` que extiende/implementa `AuthProvider`
- Uso de `MsalService` para `loginRedirect()`, `logoutRedirect()`, etc.

## Checklist

- [ ] Dependencias instaladas (`@azure/msal-browser`, `@azure/msal-angular`)
- [ ] Sección `msal` en modelo `Environment`
- [ ] Sección `msal` en todos los archivos de `src/environments/`
- [ ] `msalInstanceFactory` y providers MSAL en `app.config.ts`
- [ ] `AuthProvider` con `useClass: AuthService` (desde `auth-msal`)
- [ ] `MsalInterceptor` en HTTP interceptors si se consumen APIs protegidas
- [ ] Librería `auth-msal` disponible y configurada en `angular.json`/`tsconfig.json`

## Configuración en Azure Portal

Para producción, registrar la aplicación en Azure AD y configurar:

- **Client ID**: ID de la aplicación
- **Authority**: `https://login.microsoftonline.com/{tenant-id}` o `https://login.microsoftonline.com/common`
- **Redirect URI**: URL de callback (ej. `https://mi-app.com` o `http://localhost:4200` para desarrollo)
