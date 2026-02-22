# ADR-001: Separación de Responsabilidades - Core, Shared y Features

**Estado:** Aceptado  
**Fecha de Creación:** 06/01/2026  
**Última Actualización:** 22/02/2026  
**Decisores:** Equipo de Arquitectura

## Contexto

A medida que la aplicación crece, se vuelve crucial mantener una separación clara de concerns para asegurar:

- Reutilización de código entre diferentes features
- Desarrollo y testing independiente de features
- Fácil mantenimiento y refactorización
- Prevención de dependencias circulares
- Comprensión clara de dónde pertenece el código

Sin una estructura bien definida, los desarrolladores podrían colocar código en ubicaciones inapropiadas, llevando a acoplamiento estrecho, dificultad en testing y desafíos al escalar la aplicación.

## Decisión

Organizaremos la aplicación en cuatro capas distintas con responsabilidades claras, utilizando un **enfoque híbrido** que combina **Feature-Based Architecture** y **Layer-Based Architecture**.

### Enfoque Híbrido: Feature-Based + Layer-Based

Esta arquitectura híbrida aprovecha lo mejor de ambos enfoques:

- **Layer-Based Architecture (Capas Core, Shared, Cross):** Organiza el código por tipo de responsabilidad técnica (servicios, componentes, modelos, etc.), facilitando la reutilización y el mantenimiento de infraestructura común.

- **Feature-Based Architecture (Capa Features):** Organiza el código por funcionalidad de negocio dentro de cada feature, agrupando todos los artefactos relacionados (componentes, servicios, modelos, etc.) en módulos autocontenidos.

**Ventajas del enfoque híbrido:**

- **Separación clara:** Las capas (Core, Shared, Cross) proporcionan infraestructura y utilidades, mientras que las features encapsulan lógica de negocio específica
- **Reutilización:** Los componentes y servicios compartidos en las capas pueden ser consumidos por múltiples features
- **Escalabilidad:** Nuevas features pueden agregarse sin afectar la infraestructura existente
- **Mantenibilidad:** Cambios en una feature no impactan otras, y cambios en infraestructura se centralizan en las capas correspondientes
- **Claridad:** Los desarrolladores pueden ubicar rápidamente código de infraestructura (en capas) o código de negocio (en features)

Esta combinación permite mantener una estructura predecible y escalable, donde la infraestructura común vive en capas y la lógica de negocio se organiza por features.

### Capa Core (`src/app/core/`)

Contiene infraestructura y lógica global que se usa en toda la aplicación:

- **Services:** Servicios singleton globales (ej: `AppManager`, `Session`)
- **Guards:** Guards de ruta para autenticación y autorización
- **Interceptors:** Interceptores HTTP para manejo de request/response
- **Models:** Modelos de datos globales e interfaces usadas entre features
- **Enums:** Enumeraciones compartidas (ej: `UserRole`, `HttpStatus`)
- **Constants:** Configuración global y constantes
- **Utils:** Funciones helper para operaciones comunes
- **Pipes:** Pipes de transformación comunes
- **Directives:** Directivas globales
- **Components:** Componentes UI globales (ej: layout principal, páginas de error)

**Principio clave:** Core no debe depender de Shared, Cross ni Features.

### Capa Shared (`src/app/shared/`)

Contiene componentes UI reutilizables y utilidades que pueden ser usadas por múltiples features:

- **Components:** Componentes de presentación reutilizables (botones, modales, tarjetas, campos de formulario)
- **Directives:** Directivas de atributo o estructurales compartidas
- **Pipes:** Pipes de formateo UI (ej: currency, formateo de fechas)
- **Validators:** Validadores de formularios comunes
- **Types/Interfaces:** Definiciones de tipos compartidas para componentes UI
- **Contracts:** Ports (interfaces) y modelos que definen contratos para comunicación entre features mediante providers (patrón Ports and Adapters)

**Principio clave:** Shared no debe depender de Features, pero puede depender de Core y Cross.

#### Comunicación entre Features mediante Contracts

Cuando dos features necesitan comunicarse sin crear dependencias directas, se utiliza el patrón de **Contracts** en `shared/contracts/`. Este enfoque permite:

- **Definir interfaces (ports):** Las features pueden definir contratos que otras features pueden implementar
- **Inyección mediante providers:** Las features pueden proporcionar implementaciones de estos contratos usando el sistema de providers de Angular
- **Desacoplamiento:** Las features no dependen directamente de otras features, sino de los contratos compartidos

**Reglas para Contracts:**

- Los contracts deben contener solo interfaces, tipos y modelos (sin implementaciones)
- Las features pueden implementar estos contracts y proporcionarlos mediante providers
- Los contracts deben estar en `shared/contracts/{dominio}/` organizados por dominio

### Capa Cross (`src/app/cross/`)

Contiene capacidades de dominio transversales que aplican a múltiples features:

- **persistence:** Servicios de persistencia (`DatabaseService`, `SyncService`, `EntityRepository`, `GraphqlService`), componentes de sincronización
- **global:** Repositorios, managers y modelos compartidos entre features (`TermRepository`, `CategoryManager`, `TagManager`, `Term`)
- **integrations:** Servicios de integración externa (ej: `SubscriptionService`)

**Principio clave:** Cross solo puede depender de Core.

### Capa Features (`src/app/features/{feature-name}/`)

Contiene funcionalidad específica del dominio organizada por feature:

- **Components:** Componentes específicos de la feature
- **Services:** Servicios de lógica de negocio para la feature
- **Repositories:** Capa de acceso a datos para comunicación con API
- **Managers:** Gestión de estado o orquestación de lógica de negocio
- **Models:** Modelos de datos específicos de la feature
- **Guards:** Guards de ruta específicos de la feature
- **Pipes:** Pipes de transformación específicos de la feature
- **Directives:** Directivas específicas de la feature
- **Utils:** Funciones helper específicas de la feature
- **Enums:** Enumeraciones específicas de la feature
- **Constants:** Constantes específicas de la feature
- **Routes:** Rutas de la feature definidas en `{feature-name}-routes.ts`

**Principios clave:**

- Cada feature es independiente y autocontenida
- Las features pueden depender de Core, Shared y Cross, pero no de otras Features
- Las features no deben importar directamente de otras features
- Las features pueden comunicarse entre sí mediante **contracts** definidos en `shared/contracts/` usando providers de Angular

## Ejemplo de Estructura

```
src/
└── app/
    ├── core/
    │   ├── components/
    │   │   └── error/
    │   ├── interceptors/
    │   ├── services/
    │   │   ├── app-manager.ts
    │   │   └── session.ts
    │   ├── models/
    │   └── utils/
    │
    ├── shared/
    │   ├── components/
    │   │   ├── header/
    │   │   ├── main-layout/
    │   │   └── filters/
    │   └── services/
    │       └── filters.service.ts
    │
    ├── cross/
    │   ├── persistence/
    │   │   ├── components/
    │   │   │   └── sync/
    │   │   └── services/
    │   │       ├── database.service.ts
    │   │       ├── entity-repository.ts
    │   │       └── sync.service.ts
    │   ├── global/
    │   │   ├── managers/
    │   │   │   └── category-manager.ts
    │   │   ├── repositories/
    │   │   │   └── term-repository.ts
    │   │   └── models/
    │   │       └── term.ts
    │   └── integrations/
    │       └── subscription.service.ts
    │
    └── features/
        ├── expenses/
        │   ├── components/
        │   │   ├── transactions-view/
        │   │   └── categories-view/
        │   ├── repositories/
        │   │   ├── transaction-repository.ts
        │   │   └── space-repository.ts
        │   ├── models/
        │   │   ├── space.ts
        │   │   └── transaction.ts
        │   └── expenses-routes.ts
        └── settings/
            └── settings-routes.ts
```

## Reglas de Dependencias

```
┌─────────┐
│ Features│
└─┬──┬──┬─┘
  │  │  │ puede usar
  ▼  ▼  ▼
┌─────────┐    ┌─────────┐
│  Shared │    │  Cross  │
└────┬────┘    └────┬────┘
     │  puede usar        │ puede usar
     ▼                    ▼
     └──────────────┌─────────┐
                    │  Core   │
                    └─────────┘
```

### Dependencias Permitidas

✅ **Feature → Core:** Permitido

```typescript
// features/expenses/components/transactions-view/transactions-view.ts
import { Session } from '@/core/services/session';
import { LayoutManager } from '@/core/services/layout-manager';
```

✅ **Feature → Shared:** Permitido

```typescript
// features/expenses/components/transactions-view/transactions-view.ts
import { Header } from '@/shared/components/header/header';
import { FiltersComponent } from '@/shared/components/filters/filters';
```

✅ **Feature → Cross:** Permitido

```typescript
// features/expenses/repositories/transaction-repository.ts
import { EntityRepository } from '@/cross/persistence/services/entity-repository';
import { DatabaseService } from '@/cross/persistence/services/database.service';
import { TermRepository } from '@/cross/global/repositories/term-repository';
```

✅ **Feature → Shared Contracts (para comunicación entre features):** Permitido

Cuando dos features necesiten comunicarse, usar el patrón de contracts en `shared/contracts/` con providers (ver sección "Comunicación entre Features mediante Contracts").

✅ **Shared → Core:** Permitido

```typescript
// shared/components/permissions/permissions.ts
import { Session } from '@/core/services/session';
import { AppManager } from '@/core/services/app-manager';
```

✅ **Shared → Cross:** Permitido

```typescript
// shared/components/permissions/permissions.ts
import { TermRepository } from '@/cross/global/repositories/term-repository';
import { CategoryManager } from '@/cross/global/managers/category-manager';
```

✅ **Cross → Core:** Permitido

```typescript
// cross/persistence/services/database.service.ts
import { AppManager } from '@/core/services/app-manager';
```

### Dependencias Prohibidas

❌ **Core → Shared:** No permitido

```typescript
// ❌ NO HACER: core/services/session.ts
import { Header } from '@/shared/components/header/header';
```

❌ **Core → Feature:** No permitido

```typescript
// ❌ NO HACER: core/services/app-manager.ts
import { TransactionRepository } from '@/features/expenses/repositories/transaction-repository';
```

❌ **Core → Cross:** No permitido

```typescript
// ❌ NO HACER: core/services/session.ts
import { DatabaseService } from '@/cross/persistence/services/database.service';
```

❌ **Shared → Feature:** No permitido

```typescript
// ❌ NO HACER: shared/components/header/header.ts
import { TransactionRepository } from '@/features/expenses/repositories/transaction-repository';
```

❌ **Cross → Shared o Feature:** No permitido

```typescript
// ❌ NO HACER: cross/global/managers/category-manager.ts
import { Header } from '@/shared/components/header/header';
// ❌ NO HACER: cross/persistence/services/database.service.ts
import { TransactionRepository } from '@/features/expenses/repositories/transaction-repository';
```

❌ **Feature → Feature (importación directa):** No permitido

```typescript
// ❌ NO HACER: features/expenses/components/dashboard/dashboard.ts
import { DeleteUser } from '@/features/settings/components/delete-user/delete-user';
```

**Alternativa permitida:** Usar contracts en `shared/contracts/` para comunicación entre features mediante providers (ver sección "Comunicación entre Features mediante Contracts").

## Convención de Imports (Path Aliases)

**Regla:** Usar path aliases (`@/core`, `@/shared`, `@/cross`, `@/features`, `@/environments`) es **obligatorio** para imports que cruzan capas.

- **Imports que cruzan capas:** Obligatorio usar alias. Aplica cuando un archivo importa desde otra capa (Core, Shared o Cross).
  - Ejemplo: `import { EntityRepository } from '@/cross/persistence/services/entity-repository';`
- **Imports dentro del mismo feature:** Opcional. Se permite tanto alias como rutas relativas.
  - Ejemplo con alias: `import { Space } from '@/features/expenses/models/space';`
  - Ejemplo con relativa: `import { Space } from '../models/space';`

Esta convención mejora la legibilidad y hace explícita la capa de origen cuando se importa desde fuera del feature.

## Definición de Rutas

Cada feature define sus propias rutas en un archivo `{feature-name}-routes.ts` dentro de `src/app/features/{feature-name}/`:

```typescript
// src/app/features/expenses/expenses-routes.ts
import { Routes } from '@angular/router';
import { MainLayout } from '@/shared/components/main-layout/main-layout';
import { Sync } from '@/cross/persistence/components/sync/sync';
import { TransactionsView } from './components/transactions-view/transactions-view';
import { CategoriesView } from './components/categories-view/categories-view';

export const expensesRoutes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: 'transactions', component: TransactionsView },
      { path: 'settings/categories', component: CategoriesView }
    ]
  },
  { path: 'settings/sync', component: Sync }
];
```

Luego, estas rutas se importan en las rutas principales de la app:

```typescript
// src/app/app.routes.ts
import { Error } from '@/core/components/error/error';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/expenses/expenses-routes').then((m) => m.expensesRoutes)
  },
  { path: 'error/:code', component: Error }
];
```

## Consecuencias

### Positivas

- **Separación clara de concerns:** Los desarrolladores saben exactamente dónde colocar nuevo código
- **Reutilización:** Componentes Shared y servicios Core pueden usarse entre features
- **Testabilidad:** Las features pueden probarse independientemente con dependencias Core/Shared mockeadas
- **Escalabilidad:** Nuevas features pueden agregarse sin afectar las existentes
- **Mantenibilidad:** Cambios en una feature no impactan otras
- **Onboarding:** Nuevos desarrolladores pueden entender rápidamente la estructura del código

### Negativas

- **Complejidad inicial de setup:** Requiere disciplina para mantener la estructura
- **Posible duplicación de código:** Lógica similar podría existir en diferentes features (aceptable si es verdaderamente específica de la feature)
- **Curva de aprendizaje:** Los nuevos miembros del equipo necesitan entender las reglas de dependencias

### Mitigación

- Documentar la estructura claramente (este ADR)
- Usar aliases de ruta obligatoriamente para imports que cruzan capas (ver sección "Convención de Imports")
- Hacer cumplir las reglas mediante linting (las reglas de ESLint pueden prevenir imports prohibidos)
- Revisiones de código regulares para asegurar cumplimiento

## Referencias

- [Angular Style Guide - Estructura de Archivos](https://angular.dev/style-guide#file-structure)
- [Índice de ADRs](./README.md)
- [ADR-002: Adopción de la Guía de Estilo Oficial de Angular](./ADR-002-angular-style-guide.md)
- [ADR-006: Patrón de Repositorio para Servicios REST](./ADR-006-repository-pattern.md)
- [ADR-007: Patrón Manager para Coordinación de Flujos de Negocio](./ADR-007-manager-pattern.md)
- [ADR-008: Patrón de Mappers para Transformación de Datos](./ADR-008-mapper-pattern.md)
- [ADR-011: Calidad de Código y Herramientas](./ADR-011-code-quality-tooling.md)
