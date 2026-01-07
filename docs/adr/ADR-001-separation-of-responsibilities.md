# ADR-001: Separación de Responsabilidades - Core, Shared y Features
**Estado:** Aceptado  
**Fecha de Creación:** 06/01/2026  
**Última Actualización:** 06/01/2026  
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

- **Services:** Servicios singleton globales (ej: `HttpClient`, `Logger`, `NotificationService`)
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

**Ejemplo de uso:**
```typescript
// shared/contracts/sales/sales-port.contract.ts
export interface ISalesPort {
  getSales(): Observable<Sale[]>;
  createSale(sale: Sale): Observable<Sale>;
}

// shared/contracts/sales/sale.model.ts
export interface Sale {
  id: string;
  amount: number;
  date: Date;
}

// features/payments/payments.component.ts
import { ISalesPort } from '@/shared/contracts/sales/sales-port.contract';

@Component({...})
export class PaymentsComponent {
  constructor(@Inject(ISalesPort) private salesPort: ISalesPort) {}
  
  // Usa el port sin depender directamente de la feature sales
}
```

**Reglas para Contracts:**
- Los contracts deben contener solo interfaces, tipos y modelos (sin implementaciones)
- Las features pueden implementar estos contracts y proporcionarlos mediante providers
- Los contracts deben estar en `shared/contracts/{dominio}/` organizados por dominio

### Capa Cross (`src/app/cross/{dominio}/`)

Contiene capacidades de dominio transversales que aplican a múltiples features y encapsulan reglas de negocio, orquestaciones o integraciones que no pertenecen a Shared porque no son utilidades de UI:

- **Services:** Servicios de negocio transversales (ej: `AuthService`, `SessionService`)
- **Repositories:** Acceso a API o almacenamiento reutilizado por diferentes features
- **Managers:** Coordinadores de flujos compartidos (inicio de sesión, inicialización de analytics)
- **Models:** Modelos de dominio reutilizados más allá de la infraestructura básica
- **Policies/Guards:** Reglas aplicables en múltiples contextos (feature toggles, verificaciones de capacidades)
- **Pipes/Validators:** Helpers específicos del dominio que no encajan en Shared

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
    │   ├── guards/
    │   │   └── auth.guard.ts
    │   ├── interceptors/
    │   │   └── http-error.interceptor.ts
    │   ├── services/
    │   │   ├── logger.service.ts
    │   │   └── notification.service.ts
    │   ├── models/
    │   │   └── user.model.ts
    │   └── utils/
    │       └── date.util.ts
    │
    ├── shared/
    │   ├── components/
    │   │   ├── button/
    │   │   │   └── button.component.ts
    │   │   └── modal/
    │   │       └── modal.component.ts
    │   ├── contracts/
    │   │   └── sales/
    │   │       ├── sales-port.contract.ts
    │   │       └── sale.model.ts
    │   ├── pipes/
    │   │   └── currency.pipe.ts
    │   └── validators/
    │       └── email.validator.ts
    │
    ├── features/
    │   └── sales/
    │       ├── components/
    │       │   ├── sales-list/
    │       │   │   └── sales-list.component.ts
    │       │   └── sale-item/
    │       │       └── sale-item.component.ts
    │       ├── services/
    │       │   └── sales.service.ts
    │       ├── repositories/
    │       │   └── sales.repository.ts
    │       ├── models/
    │       │   └── sale.model.ts
    │       └── sales-routes.ts
    │
    └── cross/
        └── auth/
            ├── services/
            │   └── auth.service.ts
            ├── repositories/
            │   └── session.repository.ts
            └── policies/
                └── auth-policy.ts
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
// sales/services/sales.service.ts
import { Logger } from '@/core/services/logger.service';
import { User } from '@/core/models/user.model';
```

✅ **Feature → Shared:** Permitido
```typescript
// sales/components/sales-list.component.ts
import { ButtonComponent } from '@/shared/components/button/button.component';
import { CurrencyPipe } from '@/shared/pipes/currency.pipe';
```

✅ **Feature → Cross:** Permitido
```typescript
// sales/services/sales-auth.facade.ts
import { AuthService } from '@/cross/auth/services/auth.service';
```

✅ **Feature → Shared Contracts (para comunicación entre features):** Permitido
```typescript
// payments/components/payment-form.component.ts
import { ISalesPort } from '@/shared/contracts/sales/sales-port.contract';
import { Sale } from '@/shared/contracts/sales/sale.model';

@Component({...})
export class PaymentFormComponent {
  constructor(@Inject(ISalesPort) private salesPort: ISalesPort) {}
  
  // Usa el port para comunicarse con la feature sales sin dependencia directa
}
```

**Nota:** La feature `sales` debe proporcionar la implementación del contract mediante providers:
```typescript
// sales/sales-routes.ts o sales.module.ts
import { ISalesPort } from '@/shared/contracts/sales/sales-port.contract';
import { SalesService } from './services/sales.service';

export const salesRoutes: Routes = [
  {
    path: '',
    providers: [
      { provide: ISalesPort, useClass: SalesService }
    ],
    // ... rutas
  }
];
```

✅ **Shared → Core:** Permitido
```typescript
// shared/components/modal/modal.component.ts
import { NotificationService } from '@/core/services/notification.service';
```

✅ **Shared → Cross:** Permitido
```typescript
// shared/components/modal/modal.component.ts
import { SessionService } from '@/cross/auth/services/session.service';
```

✅ **Cross → Core:** Permitido
```typescript
// cross/auth/services/auth.service.ts
import { NotificationService } from '@/core/services/notification.service';
```

### Dependencias Prohibidas

❌ **Core → Shared:** No permitido
```typescript
// ❌ NO HACER: core/services/logger.service.ts
import { ButtonComponent } from '@/shared/components/button/button.component';
```

❌ **Core → Feature:** No permitido
```typescript
// ❌ NO HACER: core/guards/auth.guard.ts
import { SalesService } from '@/features/sales/services/sales.service';
```

❌ **Core → Cross:** No permitido
```typescript
// ❌ NO HACER: core/interceptors/http-error.interceptor.ts
import { AuthService } from '@/cross/auth/services/auth.service';
```

❌ **Shared → Feature:** No permitido
```typescript
// ❌ NO HACER: shared/components/button/button.component.ts
import { SalesService } from '@/features/sales/services/sales.service';
```

❌ **Cross → Shared o Feature:** No permitido
```typescript
// ❌ NO HACER: cross/auth/services/auth.service.ts
import { ButtonComponent } from '@/shared/components/button/button.component';
// ❌ NO HACER: cross/auth/policies/auth-policy.ts
import { SalesService } from '@/features/sales/services/sales.service';
```

❌ **Feature → Feature (importación directa):** No permitido
```typescript
// ❌ NO HACER: sales/services/sales.service.ts
import { PaymentService } from '@/features/payments/services/payment.service';
```

**Alternativa permitida:** Usar contracts en `shared/contracts/` para comunicación entre features mediante providers (ver ejemplo en "Dependencias Permitidas").

## Definición de Rutas

Cada feature define sus propias rutas en un archivo `{feature-name}-routes.ts` dentro de `src/app/features/{feature-name}/`:

```typescript
// app/features/sales/sales-routes.ts
import { Routes } from '@angular/router';
import { SalesListComponent } from './components/sales-list/sales-list.component';
import { SaleDetailComponent } from './components/sale-detail/sale-detail.component';

export const salesRoutes: Routes = [
  {
    path: '',
    component: SalesListComponent,
  },
  {
    path: ':id',
    component: SaleDetailComponent,
  },
];
```

Luego, estas rutas se importan en las rutas principales de la app:

```typescript
// app.routes.ts
import { salesRoutes } from './features/sales/sales-routes';

export const routes: Routes = [
  {
    path: 'sales',
    loadChildren: () => import('./features/sales/sales-routes').then(m => m.salesRoutes),
  },
  // ... otras rutas
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
- Usar aliases de ruta (`@/core`, `@/shared`) para hacer los imports claros
- Hacer cumplir las reglas mediante linting (las reglas de ESLint pueden prevenir imports prohibidos)
- Revisiones de código regulares para asegurar cumplimiento

## Referencias

- [Angular Style Guide - Estructura de Archivos](https://angular.dev/style-guide#file-structure)
