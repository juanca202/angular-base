# ADR-007: Patrón Manager para Coordinación de Flujos de Negocio

**Estado:** Aceptado  
**Fecha de Creación:** 06/01/2026  
**Última Actualización:** 19/02/2026  
**Decisores:** Equipo de Arquitectura

## Contexto

A medida que la aplicación crece, surgen necesidades de coordinar flujos de negocio complejos que involucran múltiples servicios, componentes y operaciones. Sin un patrón claro para esta coordinación, los desarrolladores pueden:

- Colocar lógica de orquestación directamente en componentes, haciéndolos pesados y difíciles de mantener
- Duplicar lógica de coordinación en múltiples lugares
- Crear acoplamiento estrecho entre componentes y servicios
- Dificultar el testing y la reutilización de flujos complejos

Los **Managers** son servicios especializados que centralizan la coordinación de experiencias de usuario y orquestación de lógica de negocio, manteniendo los componentes ligeros y enfocados en la presentación.

## Decisión

Se adopta el **patrón Manager** como mecanismo estándar para coordinar flujos de negocio complejos y experiencias de usuario que requieren orquestación de múltiples servicios o componentes.

### ¿Qué es un Manager?

Un **Manager** es un servicio Angular (`@Injectable`) que:

- **Coordina experiencias de usuario:** Centraliza la lógica de apertura de diálogos, navegación y flujos interactivos
- **Orquesta lógica de negocio:** Combina múltiples servicios, repositorios y operaciones en flujos coherentes
- **Mantiene componentes ligeros:** Permite que los componentes se enfoquen en la presentación y deleguen la coordinación al Manager
- **Centraliza reglas de presentación:** Permite ajustar reglas de presentación y comportamiento en un solo lugar

### ¿Cuándo usar un Manager?

Usa un Manager cuando necesites:

1. **Coordinación de diálogos y modales:** Abrir diálogos con configuración compleja o flujos multi-paso
2. **Orquestación de operaciones:** Secuencias de operaciones que involucran múltiples servicios o repositorios
3. **Flujos de negocio complejos:** Lógica que requiere validaciones, confirmaciones y múltiples pasos
4. **Gestión de estado compartido:** Estado que necesita ser compartido entre múltiples componentes de una feature
5. **Coordinación de experiencias:** Flujos que combinan navegación, diálogos, notificaciones y operaciones de datos

**No uses un Manager para:**

- Operaciones simples de un solo servicio (usa el servicio directamente)
- Lógica de presentación pura (pertenece en componentes)
- Utilidades genéricas (usa servicios en Core o Shared)
- Acceso directo a datos (usa Repositories)

### Ubicación de Managers

Los Managers se ubican según su alcance:

#### Managers en Features (`src/app/features/{feature-name}/managers/`)

**Propósito:** Gestión de estado o orquestación de lógica de negocio específica de una feature.

**Características:**

- Coordinan experiencias específicas de la feature
- Orquestan operaciones que involucran componentes y servicios de la feature
- Pueden depender de Repositories, Services y componentes de la misma feature
- Pueden usar servicios de Core, Shared y Cross

**Ejemplo:**

```typescript
// src/app/features/requirements/managers/requirement-item-manager.ts
@Injectable({ providedIn: 'root' })
export class RequirementItemManager {
  private readonly dialog = inject(MatDialog);

  public open(requirementItemId: number): void {
    // Coordina la apertura del diálogo de detalle
  }
}
```

#### Managers en Cross / Auth (`src/app/features/settings/managers/` o `projects/auth-*`)

**Propósito:** Coordinadores de flujos compartidos que aplican a múltiples features.

**Características:**

- Coordinan flujos transversales (inicio de sesión, cambio de contraseña, eliminación de usuario, etc.)
- Son reutilizados por múltiples features
- Inyectan `AuthProvider` desde `auth-core` para operaciones de autenticación
- Encapsulan reglas de negocio transversales

**Ejemplo:**

```typescript
// src/app/features/settings/managers/auth-manager.ts
import { AuthProvider } from 'auth-core';

@Injectable({ providedIn: 'root' })
export class AuthManager {
  private readonly authProvider = inject(AuthProvider);
  // Coordina flujos de autenticación (confirmDeleteUser, etc.)
}
```

#### Managers en Core (`src/app/core/services/`)

**Propósito:** Coordinación de infraestructura global de la aplicación.

**Características:**

- Coordinan inicialización y configuración global
- Gestionan aspectos técnicos transversales (PWA, analytics, localización)
- No dependen de Features, Shared ni Auth
- Singleton global de la aplicación

**Ejemplo:**

```typescript
// src/app/core/services/app-manager.ts
@Injectable({ providedIn: 'root' })
export class AppManager {
  // Coordina inicialización de la aplicación, PWA, analytics, etc.
}
```

### Estructura y Convenciones

#### Nomenclatura

- **Nombre:** `{Entidad}Manager` o `{Flujo}Manager`
- **Archivo:** `{entidad}-manager.ts` o `{flujo}-manager.ts`
- **Ubicación:** `managers/` dentro de la capa correspondiente

**Ejemplos:**

- `RequirementItemManager` → `requirement-item-manager.ts`
- `EntityManager` → `entity-manager.ts`
- `AuthManager` → `auth-manager.ts`
- `AppManager` → `app-manager.ts`

#### Estructura del Código

```typescript
import { inject, Injectable } from '@angular/core';
// ... otros imports

/**
 * Coordinates the experience for [descripción del propósito].
 *
 * @remarks
 * [Explicación de por qué centralizar esta lógica aquí]
 */
@Injectable({
  providedIn: 'root'
})
export class EntityManager {
  // Dependency injection
  private readonly repository = inject(EntityRepository);
  private readonly dialog = inject(MatDialog);
  private readonly messageService = inject(MessageService);

  // Properties (si es necesario)
  private readonly mutations = this.repository.mutations();

  // Métodos públicos de coordinación
  public async open(id?: string): Promise<Operation> {
    // Implementación
  }

  public async delete(id: string): Promise<void> {
    // Implementación
  }

  // Métodos privados de ayuda (si es necesario)
  private validateOperation(data: unknown): boolean {
    // Implementación
  }
}
```

#### Reglas de Dependencias

**Managers en Features pueden:**

- ✅ Depender de Core, Shared y Auth (auth-core)
- ✅ Depender de Repositories, Services y componentes de la misma feature
- ✅ Depender de Models de la misma feature
- ❌ Depender directamente de otras Features (usar contracts en `shared/contracts/`)

**Managers en Cross/Auth pueden:**

- ✅ Depender de Core y auth-core
- ✅ Depender de otros Managers, Services y Repositories del mismo dominio
- ❌ Depender de Features o Shared

**Managers en Core pueden:**

- ✅ Depender solo de otros servicios de Core
- ❌ Depender de Features, Shared o Auth

## Implementación

### Ejemplo 1: Manager Simple (Coordinación de Diálogos)

```typescript
// src/app/features/requirements/managers/requirement-item-manager.ts
import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RequirementItemDetailComponent } from '../components/requirement-item-detail/requirement-item-detail';

/**
 * Coordinates the experience for opening RequirementItem detail dialogs.
 *
 * @remarks
 * Centralizing the dialog logic keeps components lightweight and allows us to
 * tweak presentation rules in a single place.
 */
@Injectable({
  providedIn: 'root'
})
export class RequirementItemManager {
  private readonly dialog = inject(MatDialog);

  /**
   * Opens the RequirementItem detail dialog
   */
  public open(requirementItemId: number): void {
    const config = {
      data: {
        id: requirementItemId
      },
      panelClass: ['ft-dialog', 'ft-dialog--stacked'],
      height: '100vh',
      width: '600px',
      position: {
        left: 'auto',
        right: '0'
      }
    };
    this.dialog.open(RequirementItemDetailComponent, config);
  }
}
```

**Uso en componente:**

```typescript
@Component({...})
export class RequirementListComponent {
  private readonly requirementItemManager = inject(RequirementItemManager);

  onItemClick(itemId: number): void {
    this.requirementItemManager.open(itemId);
  }
}
```

### Ejemplo 2: Manager Complejo (Orquestación de Operaciones)

```typescript
// src/app/features/templates/managers/entity-manager.ts
import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from '@factor_ec/ui';
import { firstValueFrom } from 'rxjs';
import { EntityRepository } from '../repositories/entity-repository';
import { Entity, EntityContext } from '../models/entity';
import { Operation } from '@/core/models/operation';

/**
 * Coordinates the experience for opening entity detail dialogs.
 *
 * @remarks
 * Centralizing the dialog logic keeps components lightweight and allows us to
 * tweak presentation rules in a single place.
 */
@Injectable({
  providedIn: 'root'
})
export class EntityManager {
  private readonly entityRepository = inject(EntityRepository);
  private readonly dialog = inject(MatDialog);
  private readonly messageService = inject(MessageService);

  private readonly mutations = this.entityRepository.mutations();

  /**
   * Deletes an entity with confirmation
   */
  public async delete(id?: string): Promise<void> {
    const value = await firstValueFrom(
      this.messageService.show($localize`Are you sure you want to delete this entity?`, {
        type: 'modal',
        actions: [
          { label: $localize`Cancel`, value: 0, type: 'stroked' },
          { label: $localize`Accept`, value: 1, type: 'flat' }
        ]
      })
    );

    if (value === 1 && id) {
      await this.mutations.delete(id);
      this.messageService.show($localize`Entity deleted successfully.`, {
        class: 'ft-message--success',
        icon: 'check--circle'
      });
    }
  }

  /**
   * Opens entity detail/form dialog
   */
  public async open(id?: string, view?: boolean): Promise<Operation> {
    return new Promise<Operation>((resolve) => {
      const config = {
        data: { id },
        panelClass: ['ft-dialog', 'ft-dialog--stacked'],
        height: '100vh',
        width: '600px',
        position: { left: 'auto', right: '0' }
      };

      if (!view) {
        const dialogRef = this.dialog.open(EntityForm, { ...config, disableClose: true });
        const sub = dialogRef.componentInstance.afterSubmit.subscribe((operation) => {
          if (operation) {
            resolve(operation);
          }
          sub.unsubscribe();
        });
      } else {
        this.dialog.open(EntityDetail, config);
      }
    });
  }

  /**
   * Opens entity search dialog
   */
  public async search(): Promise<Entity> {
    return new Promise<Entity>((resolve) => {
      const dialogRef = this.dialog.open(EntitySearch, {
        panelClass: ['ft-dialog'],
        width: '400px'
      });

      const sub = dialogRef.componentInstance.selected.subscribe((entity) => {
        if (entity) {
          resolve(entity);
        }
        sub.unsubscribe();
      });
    });
  }
}
```

### Ejemplo 3: Manager en Core (Inicialización Global)

```typescript
// src/app/core/services/app-manager.ts
import { AuthProvider } from 'auth-core';

/**
 * Coordinates application-wide concerns such as localization, PWA updates,
 * push messaging, and analytics initialization.
 *
 * @remarks
 * This singleton is bootstrapped through an app initializer so that routing
 * and session restoration happen before the UI renders.
 */
@Injectable({
  providedIn: 'root'
})
export class AppManager {
  private readonly authService = inject(AuthProvider);
  private readonly googleTagManagerService = inject(GoogleTagManagerService);
  private readonly router = inject(Router);
  private readonly session = inject(Session);
  private readonly swUpdate = inject(SwUpdate);

  public initialized: boolean = false;

  /**
   * Initializes the application
   */
  public async initialize(): Promise<void> {
    // Coordina la inicialización de múltiples servicios globales
    await this.session.restore();
    await this.initializeAnalytics();
    await this.setupPWAUpdates();
    this.initialized = true;
  }

  private async initializeAnalytics(): Promise<void> {
    // Lógica de inicialización
  }

  private async setupPWAUpdates(): Promise<void> {
    // Lógica de PWA
  }
}
```

## Mejores Prácticas

### 1. Responsabilidad Única

Un Manager debe tener una responsabilidad clara y bien definida:

```typescript
// ✅ Correcto - Manager enfocado en una entidad
@Injectable({ providedIn: 'root' })
export class RequirementItemManager {
  // Solo coordina operaciones relacionadas con RequirementItem
}

// ❌ Incorrecto - Manager con múltiples responsabilidades no relacionadas
@Injectable({ providedIn: 'root' })
export class RequirementManager {
  // Coordina RequirementItem, Requirement, Recipe, etc. (demasiado amplio)
}
```

### 2. Métodos Públicos Claros

Los métodos públicos deben tener nombres descriptivos que indiquen su propósito:

```typescript
// ✅ Correcto - nombres descriptivos
public open(id: number): void { }
public async delete(id: string): Promise<void> { }
public async search(): Promise<Entity> { }

// ❌ Incorrecto - nombres genéricos
public doSomething(data: unknown): void { }
public handle(id: number): void { }
```

### 3. Inyección de Dependencias

Usa `inject()` para la inyección de dependencias (patrón moderno de Angular):

```typescript
// ✅ Correcto - uso de inject()
@Injectable({ providedIn: 'root' })
export class EntityManager {
  private readonly repository = inject(EntityRepository);
  private readonly dialog = inject(MatDialog);
}

// ⚠️ Alternativa válida - constructor injection (también aceptable)
@Injectable({ providedIn: 'root' })
export class EntityManager {
  constructor(
    private readonly repository: EntityRepository,
    private readonly dialog: MatDialog
  ) {}
}
```

### 4. Documentación

Incluye documentación JSDoc que explique el propósito del Manager:

```typescript
/**
 * Coordinates the experience for opening entity detail dialogs.
 *
 * @remarks
 * Centralizing the dialog logic keeps components lightweight and allows us to
 * tweak presentation rules in a single place.
 */
@Injectable({ providedIn: 'root' })
export class EntityManager {
  /**
   * Opens the entity detail dialog in view mode
   * @param id - The entity identifier
   */
  public open(id: string): void {}
}
```

### 5. Manejo de Errores

Los Managers deben manejar errores apropiadamente:

```typescript
public async delete(id: string): Promise<void> {
  try {
    const confirmed = await this.confirmDeletion();
    if (confirmed) {
      await this.mutations.delete(id);
      this.messageService.show($localize`Entity deleted successfully.`, {
        class: 'ft-message--success'
      });
    }
  } catch (error) {
    this.messageService.show($localize`Error deleting entity.`, {
      class: 'ft-message--error'
    });
    throw error;
  }
}
```

### 6. No Duplicar Lógica de Repositories

Los Managers orquestan, no reemplazan a los Repositories:

```typescript
// ✅ Correcto - Manager orquesta, Repository accede a datos
public async delete(id: string): Promise<void> {
  await this.confirmDeletion();
  await this.repository.mutations().delete(id);
}

// ❌ Incorrecto - Manager haciendo trabajo del Repository
public async delete(id: string): Promise<void> {
  await this.httpClient.delete(`/api/entities/${id}`); // ❌ Debe usar Repository
}
```

### 7. Testing

Los Managers deben ser fácilmente testeables:

```typescript
// test/features/templates/managers/entity-manager.spec.ts
describe('EntityManager', () => {
  let manager: EntityManager;
  let mockDialog: jest.Mocked<MatDialog>;
  let mockRepository: jest.Mocked<EntityRepository>;

  beforeEach(() => {
    // Setup mocks
    manager = new EntityManager(mockDialog, mockRepository);
  });

  it('should open entity dialog with correct config', () => {
    manager.open('123');
    expect(mockDialog.open).toHaveBeenCalledWith(
      EntityDetailComponent,
      expect.objectContaining({
        data: { id: '123' }
      })
    );
  });
});
```

## Relación con Otros Patrones

### Managers y Repositories

- **Repositories:** Acceso a datos y comunicación con APIs
- **Managers:** Orquestan operaciones que pueden usar múltiples Repositories

```typescript
@Injectable({ providedIn: 'root' })
export class OrderManager {
  private readonly orderRepository = inject(OrderRepository);
  private readonly paymentRepository = inject(PaymentRepository);

  public async processOrder(orderId: string): Promise<void> {
    // Orquesta múltiples operaciones de repositorios
    const order = await this.orderRepository.find(orderId);
    await this.paymentRepository.process(order.paymentId);
    await this.orderRepository.mutations().updateStatus(orderId, 'processed');
  }
}
```

### Managers y Diálogos (ADR-013)

Los diálogos se definen en [ADR-013](./ADR-013-dialog-master-detail.md). Según este ADR, los diálogos **deben abrirse exclusivamente desde Managers**, no desde componentes:

```typescript
// ✅ Correcto - Manager abre diálogo
@Injectable({ providedIn: 'root' })
export class RequirementItemManager {
  private readonly dialog = inject(MatDialog);

  public open(id: number): void {
    this.dialog.open(RequirementItemDetailComponent, config);
  }
}

// ❌ Incorrecto - Componente abre diálogo directamente
@Component({...})
export class RequirementListComponent {
  private readonly dialog = inject(MatDialog); // ❌ No hacer esto

  onItemClick(id: number): void {
    this.dialog.open(...); // ❌ No hacer esto
  }
}
```

## Consecuencias

### Positivas

- **Componentes ligeros:** Los componentes se enfocan en presentación, no en coordinación
- **Reutilización:** La lógica de coordinación puede reutilizarse desde múltiples componentes
- **Mantenibilidad:** Cambios en flujos complejos se centralizan en un solo lugar
- **Testabilidad:** Los Managers pueden testearse independientemente de los componentes
- **Consistencia:** Flujos similares siguen patrones consistentes en toda la aplicación
- **Separación de responsabilidades:** Claridad sobre dónde va cada tipo de lógica

### Negativas

- **Complejidad adicional:** Requiere crear servicios adicionales para coordinación
- **Curva de aprendizaje:** Los desarrolladores necesitan entender cuándo usar Managers
- **Posible sobre-ingeniería:** Riesgo de crear Managers para operaciones simples que no lo requieren

### Mitigación

- **Documentación clara:** Este ADR y ejemplos en el código
- **Guías de decisión:** Criterios claros sobre cuándo crear un Manager
- **Revisión de código:** Asegurar que los Managers se usan apropiadamente
- **Refactorización:** Identificar cuando un componente tiene demasiada lógica de coordinación

## Alternativas Consideradas

### 1. Colocar Lógica de Coordinación en Componentes

**Rechazado** por:

- Componentes pesados y difíciles de mantener
- Duplicación de lógica entre componentes
- Dificultad para reutilizar flujos complejos
- Violación del principio de responsabilidad única

### 2. Usar Servicios Genéricos en lugar de Managers

**Rechazado** por:

- Falta de claridad sobre el propósito del servicio
- Mezcla de responsabilidades (acceso a datos vs. coordinación)
- Dificultad para distinguir entre Services y Managers

### 3. Usar Facades en lugar de Managers

**Rechazado** por:

- El término "Manager" es más descriptivo del propósito (coordinación)
- Facades típicamente ocultan complejidad de múltiples subsistemas
- Managers enfatizan la coordinación de experiencias y flujos

## Referencias

- [ADR-001: Separación de Responsabilidades - Core, Shared y Features](./ADR-001-separation-of-responsibilities.md)
- [ADR-006: Patrón de Repositorio para Servicios REST](./ADR-006-repository-pattern.md)
- [ADR-013: Uso de Diálogos para Interacciones Maestro–Detalle](./ADR-013-dialog-master-detail.md)
- [ADR-015: Estrategia de Testing](./ADR-015-testing-strategy.md)
