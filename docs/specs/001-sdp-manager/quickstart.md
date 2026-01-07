# Quickstart: Administrador de Requirements

**Date**: 2026-01-06  
**Feature**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)

## Overview

Esta guía rápida proporciona los pasos esenciales para comenzar a trabajar con la feature Administrador de SDPs.

## Prerequisites

- Angular 21.0+ instalado
- Node.js compatible con npm 10.8.2+
- Conocimiento de TypeScript, Angular Signals, y el patrón Repository del proyecto

## Quick Setup

### 1. Verificar Estructura de Carpetas

Asegúrate de que la estructura de carpetas esté creada:

```bash
src/app/features/requirements/
├── components/
├── repositories/
└── requirements-routes.ts
```

### 2. Referenciar DTOs

Los modelos están definidos como DTOs en `docs/contracts/requirements/`:

- `requirement.md` - Requirement
- `requirement-item.md` - RequirementItem  
- `recipe.md` - Recipe

Los tipos TypeScript deben importarse desde donde se generen los DTOs o referenciarse directamente.

Ver [data-model.md](./data-model.md) para definiciones completas y referencias a los DTOs.

### 3. Crear Repository

Crea `RequirementRepository` en `src/app/features/requirements/repositories/requirement-repository.ts`:

```typescript
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { getResource, getMutations, getApiUrl } from '@/core/utils/async-repository';
import { RequirementDTO, RequirementSearchParams } from '@/contracts/requirements/requirement.dto';

@Injectable({ providedIn: 'root' })
export class RequirementRepository extends BaseRepository {
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = getApiUrl('v1/requirements');

  findBy() {
    return getResource<RequirementSearchParams | void, RequirementDTO[]>((params) => {
      return this.httpClient.get<RequirementDTO[]>(this.baseUrl, { params });
    });
  }

  find() {
    return getResource<number, RequirementDTO>((id) => {
      return this.httpClient.get<RequirementDTO>(`${this.baseUrl}/${id}`);
    });
  }
}
```

### 4. Crear Componente de Lista

Crea `RequirementListComponent` en `src/app/features/requirements/components/requirement-list/`:

```typescript
import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { RequirementRepository } from '../../repositories/requirement-repository';

@Component({
  selector: 'ft-requirement-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ft-page">
      @if (requirements.loading()) {
        <app-progress />
      } @else if (requirements.error()) {
        <div class="error">{{ requirements.error() }}</div>
      } @else {
        @for (requirement of requirements.value(); track requirement.id) {
          <div (click)="viewDetail(requirement.id)">{{ requirement.name }}</div>
        }
      }
    </div>
  `
})
export class RequirementListComponent implements OnInit, OnDestroy {
  private readonly requirementRepository = inject(RequirementRepository);
  
  readonly requirements = this.requirementRepository.findBy();

  ngOnInit(): void {
    this.requirements.load();
  }

  ngOnDestroy(): void {
    this.requirements.destroy();
  }

  viewDetail(id: number): void {
    // Navegar a detalle
  }
}
```

### 5. Configurar Rutas

Agrega las rutas en `src/app/features/requirements/requirements-routes.ts`:

```typescript
import { Routes } from '@angular/router';
import { RequirementListComponent } from './components/requirement-list/requirement-list';

export const requirementsRoutes: Routes = [
  { path: '', component: RequirementListComponent },
  // Agregar más rutas según se implementen
];
```

Luego importa en `app.routes.ts`:

```typescript
{
  path: 'requirements',
  loadChildren: () => import('./features/requirements/requirements-routes').then(m => m.requirementsRoutes)
}
```

## Testing Quickstart

### Unit Test Example

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { RequirementListComponent } from './requirement-list';

describe('RequirementListComponent', () => {
  let component: RequirementListComponent;

  beforeEach(() => {
    component = new RequirementListComponent(/* mock repository */);
  });

  it('should load Requirements on init', () => {
    // Arrange
    // Act
    component.ngOnInit();
    // Assert
    expect(component.requirements.loading()).toBe(true);
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('user can view Requirements list', async ({ page }) => {
  await page.goto('/requirements');
  await expect(page.locator('text=Requirement Name')).toBeVisible();
});
```

## Common Patterns

### Cargar Datos con Repository

```typescript
// En componente
readonly requirements = this.requirementRepository.findBy();

ngOnInit() {
  this.requirements.load();
}

ngOnDestroy() {
  this.requirements.destroy(); // IMPORTANTE: limpiar suscripciones
}
```

### Usar Signals en Template

```typescript
@if (requirements.loading()) {
  <app-progress />
} @else if (requirements.error()) {
  <div class="error">{{ requirements.error() }}</div>
} @else {
  @for (requirement of requirements.value(); track requirement.id) {
    <!-- render item -->
  }
}
```

### Mutaciones (Agregar/Eliminar)

```typescript
readonly mutations = this.recipeRepository.mutations();

async addRecipe(recipe: RecipeRequestCreate) {
  try {
    await this.mutations.create(recipe);
    // Recargar lista
    this.recipes.load();
  } catch (error) {
    // Error ya mostrado automáticamente
  }
}
```

## Next Steps

1. Implementar componentes según user stories (P1 → P2 → P3)
2. Agregar tests unitarios para cada componente
3. Agregar tests E2E para flujos completos
4. Revisar cumplimiento con ADRs
5. Documentar con JSDoc/TSDoc

## References

- [Spec](./spec.md) - Especificación completa
- [Plan](./plan.md) - Plan de implementación
- [Data Model](./data-model.md) - Modelo de datos (referencias a DTOs)
- [ADR-006: Repository Pattern](../../adr/ADR-006-repository-pattern-rest.md)
- [ADR-007: Testing Strategy](../../adr/ADR-007-testing-strategy.md)
- [Contratos Source](../../contracts/requirements/) - DTOs definidos en contracts

