# Data Model: Administrador de Requirements

**Date**: 2026-01-06  
**Feature**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)

## Contratos Source

Los modelos de datos están definidos como DTOs en `docs/contracts/requirements/`:

- **Requirement** - [requirement.md](../../contracts/requirements/requirement.md)
- **RequirementItem** - [requirement-item.md](../../contracts/requirements/requirement-item.md)
- **Recipe** - [recipe.md](../../contracts/requirements/recipe.md)

## Entity Relationships

```
RequirementDTO (Requirement)
  ├── 1:N → RequirementItemDTO (RequirementItem)
        └── 1:N → RecipeDTO (Recipe)
```

## Entity Definitions

### RequirementDTO

Representa un Requirement (Solicitud de Desarrollo de Producto) en el sistema.

**Source**: `docs/contracts/requirements/requirement.md`

**Fields**:
- `id: number` - Identificador único del Requirement
- `name: string` - Nombre del Requirement
- `customer: CustomerDTO` - Cliente asociado
- `divisions: DivisionDTO[]` - Divisiones asociadas
- `sellByDate: date` - Fecha de venta
- `type: ItemCatalogDTO` - Tipo de Requirement
- `salesProbability: ItemCatalogDTO` - Probabilidad de venta
- `salesPriority: ItemCatalogDTO` - Prioridad de venta
- `description: string` - Descripción
- `customerStrategy: ItemCatalogDTO` - Estrategia del cliente
- `entryDate: date` - Fecha de entrada
- `startDate: date` - Fecha de inicio
- `dueDate: date` - Fecha de vencimiento
- `updatedAt: date` - Fecha de última actualización
- `estimatedDevelopmentTime: number` - Tiempo estimado de desarrollo
- `remainingTime: number` - Tiempo restante
- `status: ItemCatalogDTO` - Estado del Requirement
- `approvalStatus: ItemCatalogDTO` - Estado de aprobación
- `requestedBy: UserDTO` - Usuario que solicitó

**Constraints**:
- El nombre es obligatorio
- El cliente debe estar definido
- Debe tener al menos una división asociada
- La fecha de vencimiento debe ser posterior a la fecha de inicio
- El tiempo estimado de desarrollo debe ser un número positivo
- El tiempo restante debe ser un número no negativo
- El estado y el estado de aprobación deben estar definidos
- El usuario solicitante debe estar definido

**TypeScript Interface** (generado desde DTO):
```typescript
import { RequirementDTO } from '@/contracts/requirements/requirement.dto';
```

### RequirementItemDTO

Representa un ítem individual dentro de un Requirement. Cada ítem puede tener una o más recetas asociadas.

**Source**: `docs/contracts/requirements/requirement-item.md`

**Fields**:
- `id: number` - Identificador único del RequirementItem
- `name: string` - Nombre del ítem
- `status: ItemCatalogDTO` - Estado del ítem
- `category: ItemCatalogDTO` - Categoría del ítem
- `recipesCount: number` - Cantidad de recetas asociadas
- `clientMargin: decimal` - Margen del cliente
- `retailMaxPrice: decimal` - Precio máximo al por menor
- `retailMinPrice: decimal` - Precio mínimo al por menor
- `quantityPerWeek: number` - Cantidad por semana
- `season: ItemCatalogDTO` - Temporada
- `isWet: boolean` - Indica si es húmedo
- `tags: ItemCatalogDTO[]` - Etiquetas asociadas
- `specialInstructions: NoteDTO[]` - Instrucciones especiales
- `createdAt: date` - Fecha de creación
- `updatedAt: date` - Fecha de última actualización
- `assignedTo: UserDTO` - Usuario asignado

**Constraints**:
- El nombre es obligatorio
- El estado y la categoría deben estar definidos
- El precio máximo debe ser mayor o igual al precio mínimo
- Los valores monetarios usan precisión decimal fija
- La cantidad por semana debe ser un número positivo
- Las instrucciones especiales son opcionales

**TypeScript Interface** (generado desde DTO):
```typescript
import { RequirementItemDTO } from '@/contracts/requirements/requirement-item.dto';
```

### RecipeDTO

Representa una receta asociada a un RequirementItem. Las recetas definen los requisitos o instrucciones necesarias para la producción de un ítem específico.

**Source**: `docs/contracts/requirements/recipe.md`

**Fields**:
- `id: number` - Identificador único de la Recipe
- `category: ItemCatalogDTO` - Categoría de la receta
- `construction: ItemCatalogDTO` - Construcción
- `bouquetType: ItemCatalogDTO` - Tipo de ramo
- `bouquetLength: number` - Longitud del ramo
- `bouquetPhotos: FileDTO[]` - Fotos del ramo
- `flowers: FlowerDTO[]` - Flores asociadas
- `seasonCases: SeasonCaseDTO[]` - Casos de temporada
- `agreements: AgreementDTO[]` - Acuerdos asociados
- `name: string` - Nombre de la receta
- `origin: ItemCatalogDTO` - Origen
- `originCase: CaseDTO` - Caso de origen
- `description: string` - Descripción
- `waste: decimal` - Desperdicio
- `laborCost: decimal` - Costo de mano de obra
- `createdAt: date` - Fecha de creación
- `updatedAt: date` - Fecha de última actualización

**Constraints**:
- El nombre es obligatorio
- La categoría, construcción y tipo de ramo deben estar definidos
- La longitud del ramo debe ser un número positivo
- El desperdicio y el costo de mano de obra deben ser valores positivos
- Los valores monetarios usan precisión decimal fija
- Los acuerdos asociados son opcionales

**TypeScript Interface** (generado desde DTO):
```typescript
import { RecipeDTO } from '@/contracts/requirements/recipe.dto';
```

## Related DTOs

Los DTOs principales referencian otros DTOs:

- **Customer** - `docs/contracts/customers/customer.md`
- **Division** - `docs/contracts/customers/division.md`
- **ItemCatalog** - `docs/contracts/core/item-catalog.md`
- **User** - `docs/contracts/core/user.md`
- **Note** - `docs/contracts/core/note.md`
- **File** - `docs/contracts/core/file.md`
- **Flower** - `docs/contracts/master/flower.md`
- **SeasonCase** - `docs/contracts/requirements/season-case.md`
- **Agreement** - `docs/contracts/requirements/agreement.md`
- **Case** - `docs/contracts/master/case.md`

## Request/Response Types

### Requirement Requests

```typescript
// Para listar Requirements (query params opcionales)
export interface RequirementSearchParams extends CollectionQueryParams {
  name?: string;
  status?: string;
  customerId?: number;
  dateFrom?: string;
  dateTo?: string;
}

// Para crear/actualizar Requirement (si se necesita en el futuro)
export type RequirementRequestCreate = Omit<RequirementDTO, 'id' | 'updatedAt'> & { id?: number };
export type RequirementRequestUpdate = Pick<RequirementDTO, 'id'> & Partial<Omit<RequirementDTO, 'id' | 'updatedAt'>>;
```

### RequirementItem Requests

```typescript
// Para obtener RequirementItems de un Requirement
export interface RequirementItemSearchParams extends CollectionQueryParams {
  requirementId: number;
  name?: string;
  status?: string;
}

// Para crear/actualizar RequirementItem (si se necesita en el futuro)
export type RequirementItemRequestCreate = Omit<RequirementItemDTO, 'id' | 'createdAt' | 'updatedAt'> & { id?: number };
export type RequirementItemRequestUpdate = Pick<RequirementItemDTO, 'id'> & Partial<Omit<RequirementItemDTO, 'id' | 'createdAt' | 'updatedAt'>>;
```

### Recipe Requests

```typescript
// Para agregar receta a un RequirementItem
export interface RecipeRequestCreate {
  requirementItemId: number;
  name: string;
  category: ItemCatalogDTO;
  construction: ItemCatalogDTO;
  bouquetType: ItemCatalogDTO;
  bouquetLength: number;
  // ... otros campos según RecipeDTO
}

// Para actualizar receta (si se necesita en el futuro)
export type RecipeRequestUpdate = Pick<RecipeDTO, 'id'> & Partial<Omit<RecipeDTO, 'id' | 'createdAt' | 'updatedAt'>>;
```

## Repository Methods

### RequirementRepository

```typescript
export class RequirementRepository extends BaseRepository {
  // Listar todas las Requirements
  findBy(): SignalGet<RequirementSearchParams | void, RequirementDTO[]>;
  
  // Obtener una Requirement por ID (con ítems opcionales)
  find(): SignalGet<number, RequirementDTO>;
  
  // Mutaciones (si se necesitan en el futuro)
  mutations(): Mutations<RequirementRequestCreate, RequirementRequestUpdate, number>;
}
```

### RequirementItemRepository (opcional, puede estar en RequirementRepository)

```typescript
export class RequirementItemRepository extends BaseRepository {
  // Obtener RequirementItems de un Requirement
  findByRequirement(requirementId: number): SignalGet<void, RequirementItemDTO[]>;
  
  // Obtener un RequirementItem por ID (con recetas opcionales)
  find(): SignalGet<number, RequirementItemDTO>;
}
```

### RecipeRepository

```typescript
export class RecipeRepository extends BaseRepository {
  // Obtener Recipes de un RequirementItem
  findByRequirementItem(requirementItemId: number): SignalGet<void, RecipeDTO[]>;
  
  // Mutaciones: agregar y eliminar recetas
  mutations(): {
    create: (recipe: RecipeRequestCreate) => Promise<RecipeDTO>;
    delete: (requirementItemId: number, recipeId: number) => Promise<void>;
  };
}
```

## Data Flow

1. **Listar Requirements**: `RequirementRepository.findBy().load()` → Retorna `RequirementDTO[]` (sin ítems)
2. **Ver detalle Requirement**: `RequirementRepository.find().load(id)` → Retorna `RequirementDTO` (con ítems incluidos o cargados por separado)
3. **Ver detalle RequirementItem**: `RequirementItemRepository.find().load(id)` o desde el Requirement → Retorna `RequirementItemDTO` (con recetas opcionales)
4. **Ver Recipes de RequirementItem**: `RecipeRepository.findByRequirementItem(itemId).load()` → Retorna `RecipeDTO[]`
5. **Agregar Recipe**: `RecipeRepository.mutations().create(recipe)` → Retorna `RecipeDTO`
6. **Eliminar Recipe**: `RecipeRepository.mutations().delete(requirementItemId, recipeId)` → Promise<void>

## Notes

- Los DTOs son la fuente de verdad y están definidos en `docs/contracts/requirements/`
- Los tipos TypeScript deben generarse desde los DTOs o importarse desde la ubicación donde se generen
- Los campos opcionales pueden no estar presentes en todas las respuestas de API
- Las relaciones anidadas (ítems en Requirement, recetas en ítem) pueden cargarse por separado o incluirse en la respuesta según el endpoint
- Las fechas siguen formato ISO 8601 para consistencia
- Los IDs son números (number) según los DTOs definidos
