# Data Model: Administrador de Requirements

**Date**: 2026-01-06  
**Feature**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)

## Contratos Source

Los modelos de datos están definidos en los contratos de `docs/contracts/requirements/`:

- **Requirement** - [requirement.md](../../contracts/requirements/requirement.md)
- **RequirementItem** - [requirement-item.md](../../contracts/requirements/requirement-item.md)
- **Recipe** - [recipe.md](../../contracts/requirements/recipe.md)
- **RecipeGroup** - [recipe-group.md](../../contracts/requirements/recipe-group.md)

## Entity Relationships

```
Requirement
  ├── 1:N → RequirementItem
        ├── 1:N → Recipe
        │         ├── 1:N → Note
        │         ├── 1:N → Flower
        │         ├── 1:N → DryGood
        │         └── 1:N → Case
        ├── 1:N → File
        └── 0:1 → RecipeGroup
                  └── 1:N → Recipe
```

**Nota**: Las definiciones completas de campos, tipos y constraints están en los contratos referenciados arriba. Este documento solo documenta las relaciones y tipos específicos del feature.

## Related Entities

Las entidades principales referencian otras entidades definidas en contratos:

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

**Nota**: Todas las definiciones completas están en los contratos. Los tipos TypeScript deben importarse desde donde se generen los tipos desde los contratos.

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
// Los tipos Requirement se importan desde los contratos
export type RequirementRequestCreate = Omit<Requirement, 'id' | 'updatedAt'> & { id?: number };
export type RequirementRequestUpdate = Pick<Requirement, 'id'> & Partial<Omit<Requirement, 'id' | 'updatedAt'>>;
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
// Los tipos RequirementItem se importan desde los contratos
export type RequirementItemRequestCreate = Omit<RequirementItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: number };
export type RequirementItemRequestUpdate = Pick<RequirementItem, 'id'> & Partial<Omit<RequirementItem, 'id' | 'createdAt' | 'updatedAt'>>;
```

### Recipe Requests

```typescript
// Para agregar receta a un RequirementItem
// Los tipos Recipe, ItemCatalog se importan desde los contratos
export interface RecipeRequestCreate {
  requirementItemId: number;
  name: string;
  category: ItemCatalog;
  construction: ItemCatalog;
  bouquetType: ItemCatalog;
  bouquetLength: number;
  // ... otros campos según Recipe (ver docs/contracts/requirements/recipe.md)
}

// Para actualizar receta (si se necesita en el futuro)
export type RecipeRequestUpdate = Pick<Recipe, 'id'> & Partial<Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>>;
```

### RecipeGroup Requests

```typescript
// Para crear un RecipeGroup
// Los tipos RecipeGroup, Division, ItemCatalog se importan desde los contratos
export interface RecipeGroupRequestCreate {
  name: string;
  divisions: Division[];
  requirementItemId?: number;
  draft?: boolean;
  enabled?: boolean;
  tags?: ItemCatalog[];
  description?: string;
  destiny?: ItemCatalog;
  season?: ItemCatalog;
  // ... otros campos según RecipeGroup (ver docs/contracts/requirements/recipe-group.md)
}
```

## Repository Methods

### RequirementRepository

```typescript
// Los tipos Requirement, File se importan desde los contratos
export class RequirementRepository extends BaseRepository {
  // Listar todas las Requirements
  findBy(): SignalGet<RequirementSearchParams | void, Requirement[]>;
  
  // Obtener una Requirement por ID (con ítems opcionales)
  find(): SignalGet<number, Requirement>;
  
  // Obtener archivos asociados a un Requirement
  getFiles(requirementId: number): SignalGet<void, File[]>;
  
  // Mutaciones
  mutations(): {
    addFile: (requirementId: number, file: File) => Promise<File>;
  };
}
```

### RequirementItemRepository

```typescript
// Los tipos RequirementItem, File se importan desde los contratos
export class RequirementItemRepository extends BaseRepository {
  // Obtener RequirementItems de un Requirement
  findByRequirement(requirementId: number): SignalGet<void, RequirementItem[]>;
  
  // Obtener un RequirementItem por ID (con recetas opcionales)
  find(): SignalGet<number, RequirementItem>;
  
  // Obtener archivos asociados a un RequirementItem
  getFiles(requirementItemId: number): SignalGet<void, File[]>;
  
  // Mutaciones
  mutations(): {
    addFile: (requirementItemId: number, file: File) => Promise<File>;
  };
}
```

### RecipeRepository

```typescript
// Los tipos Recipe, Note, Flower, DryGood, Case se importan desde los contratos
export class RecipeRepository extends BaseRepository {
  // Obtener Recipes de un RequirementItem
  findByRequirementItem(requirementItemId: number): SignalGet<void, Recipe[]>;
  
  // Obtener notas asociadas a un Recipe
  getNotes(recipeId: number): SignalGet<void, Note[]>;
  
  // Obtener flowers asociados a un Recipe
  getFlowers(recipeId: number): SignalGet<void, Flower[]>;
  
  // Obtener dry-goods asociados a un Recipe
  getDryGoods(recipeId: number): SignalGet<void, DryGood[]>;
  
  // Obtener cases asociados a un Recipe
  getCases(recipeId: number): SignalGet<void, Case[]>;
  
  // Mutaciones: agregar y eliminar recetas
  mutations(): {
    create: (recipe: RecipeRequestCreate) => Promise<Recipe>;
    delete: (requirementItemId: number, recipeId: number) => Promise<void>;
    addNote: (recipeId: number, note: Note) => Promise<Note>;
    addFlower: (recipeId: number, flower: Flower) => Promise<Flower>;
    addDryGood: (recipeId: number, dryGood: DryGood) => Promise<DryGood>;
    addCase: (recipeId: number, case: Case) => Promise<Case>;
  };
}
```

### RecipeGroupRepository

```typescript
// Los tipos RecipeGroup, Recipe se importan desde los contratos
export class RecipeGroupRepository extends BaseRepository {
  // Obtener RecipeGroups filtrados por RequirementItem
  findByRequirementItem(requirementItemId: number): SignalGet<void, RecipeGroup[]>;
  
  // Mutaciones
  mutations(): {
    create: (recipeGroup: RecipeGroupRequestCreate) => Promise<RecipeGroup>;
    addRecipe: (recipeGroupId: number, recipe: Recipe) => Promise<Recipe>;
    moveRecipe: (recipeGroupId: number, recipeId: number) => Promise<void>;
  };
}
```

## Data Flow

1. **Listar Requirements**: `RequirementRepository.findBy().load()` → Retorna `Requirement[]` (sin ítems)
2. **Ver detalle Requirement**: `RequirementRepository.find().load(id)` → Retorna `Requirement` (con ítems incluidos o cargados por separado)
3. **Ver archivos de Requirement**: `RequirementRepository.getFiles(requirementId).load()` → Retorna `File[]`
4. **Agregar archivo a Requirement**: `RequirementRepository.mutations().addFile(requirementId, file)` → Retorna `File`
5. **Ver detalle RequirementItem**: `RequirementItemRepository.find().load(id)` o desde el Requirement → Retorna `RequirementItem` (con recetas opcionales)
6. **Ver archivos de RequirementItem**: `RequirementItemRepository.getFiles(requirementItemId).load()` → Retorna `File[]`
7. **Agregar archivo a RequirementItem**: `RequirementItemRepository.mutations().addFile(requirementItemId, file)` → Retorna `File`
8. **Ver Recipes de RequirementItem**: `RecipeRepository.findByRequirementItem(itemId).load()` → Retorna `Recipe[]`
9. **Agregar Recipe**: `RecipeRepository.mutations().create(recipe)` → Retorna `Recipe`
10. **Eliminar Recipe**: `RecipeRepository.mutations().delete(requirementItemId, recipeId)` → Promise<void>
11. **Ver notas de Recipe**: `RecipeRepository.getNotes(recipeId).load()` → Retorna `Note[]`
12. **Agregar nota a Recipe**: `RecipeRepository.mutations().addNote(recipeId, note)` → Retorna `Note`
13. **Ver flowers de Recipe**: `RecipeRepository.getFlowers(recipeId).load()` → Retorna `Flower[]`
14. **Agregar flower a Recipe**: `RecipeRepository.mutations().addFlower(recipeId, flower)` → Retorna `Flower`
15. **Ver dry-goods de Recipe**: `RecipeRepository.getDryGoods(recipeId).load()` → Retorna `DryGood[]`
16. **Agregar dry-good a Recipe**: `RecipeRepository.mutations().addDryGood(recipeId, dryGood)` → Retorna `DryGood`
17. **Ver cases de Recipe**: `RecipeRepository.getCases(recipeId).load()` → Retorna `Case[]`
18. **Agregar case a Recipe**: `RecipeRepository.mutations().addCase(recipeId, case)` → Retorna `Case`
19. **Listar RecipeGroups por RequirementItem**: `RecipeGroupRepository.findByRequirementItem(requirementItemId).load()` → Retorna `RecipeGroup[]`
20. **Crear RecipeGroup**: `RecipeGroupRepository.mutations().create(recipeGroup)` → Retorna `RecipeGroup`
21. **Agregar Recipe a RecipeGroup**: `RecipeGroupRepository.mutations().addRecipe(recipeGroupId, recipe)` → Retorna `Recipe`
22. **Mover Recipe a otro RecipeGroup**: `RecipeGroupRepository.mutations().moveRecipe(recipeGroupId, recipeId)` → Promise<void>

## Notes

- **Los contratos son la fuente de verdad**: Todas las definiciones de entidades (campos, tipos, constraints) están en `docs/contracts/requirements/` y NO deben duplicarse aquí
- **Referencias únicamente**: Este documento solo documenta relaciones, tipos de request específicos del feature, métodos de repositories y flujos de datos
- **Tipos TypeScript**: Los tipos deben importarse desde donde se generen desde los contratos (no usar sufijos DTO en este documento)
- **Campos opcionales**: Pueden no estar presentes en todas las respuestas de API según el endpoint
- **Relaciones anidadas**: Las relaciones anidadas (ítems en Requirement, recetas en ítem) pueden cargarse por separado o incluirse en la respuesta según el endpoint
- **Formato de fechas**: Siguen formato ISO 8601 para consistencia
- **IDs**: Son números (number) según los contratos definidos
