# API Contracts: Administrador de Requirements

**Date**: 2026-01-06  
**Feature**: [spec.md](../spec.md)  
**Plan**: [plan.md](../plan.md)

## Base URL

Todos los endpoints usan `getApiUrl()` helper para resolver la URL base:
- Development: Configurado en `environment.ts`
- Production: Configurado en `environment.prod.ts`

## DTOs Reference

Los modelos de datos están definidos en:
- **RequirementDTO**: `docs/contracts/dtos/requirements/requirement.dto.md`
- **RequirementItemDTO**: `docs/contracts/dtos/requirements/requirement-item.dto.md`
- **RecipeDTO**: `docs/contracts/dtos/requirements/recipe.dto.md`

## Endpoints

### 1. Listar Requirements

**GET** `/api/v1/requirements`

Lista todas las Requirements disponibles.

**Query Parameters** (opcionales):
- `name?: string` - Filtrar por nombre
- `status?: string` - Filtrar por estado (ID de ItemCatalogDTO)
- `customerId?: number` - Filtrar por cliente
- `dateFrom?: string` - Filtrar desde fecha (ISO 8601)
- `dateTo?: string` - Filtrar hasta fecha (ISO 8601)
- `page?: number` - Número de página (si hay paginación)
- `limit?: number` - Límite de resultados por página

**Response**: `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "name": "Requirement Enero 2026",
      "customer": { "id": 1, "name": "Cliente A" },
      "divisions": [{ "id": 1, "name": "División 1" }],
      "status": { "id": 1, "name": "Pendiente" },
      "approvalStatus": { "id": 1, "name": "En Revisión" },
      "entryDate": "2026-01-01T00:00:00Z",
      "startDate": "2026-01-15T00:00:00Z",
      "dueDate": "2026-02-01T00:00:00Z",
      "updatedAt": "2026-01-05T12:00:00Z"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

**Error Responses**:
- `500 Internal Server Error` - Error del servidor

---

### 2. Obtener Detalle de Requirement

**GET** `/api/v1/requirements/:id`

Obtiene el detalle completo de una Requirement, opcionalmente incluyendo sus RequirementItems.

**Path Parameters**:
- `id: number` - ID de la Requirement

**Query Parameters** (opcionales):
- `includeItems?: boolean` - Incluir RequirementItems en la respuesta (default: true)

**Response**: `200 OK`
```json
{
  "id": 1,
  "name": "Requirement Enero 2026",
  "customer": { "id": 1, "name": "Cliente A" },
  "divisions": [{ "id": 1, "name": "División 1" }],
  "sellByDate": "2026-02-15T00:00:00Z",
  "type": { "id": 1, "name": "Tipo A" },
  "salesProbability": { "id": 1, "name": "Alta" },
  "salesPriority": { "id": 1, "name": "Alta" },
  "description": "Descripción del requirement",
  "customerStrategy": { "id": 1, "name": "Estrategia A" },
  "entryDate": "2026-01-01T00:00:00Z",
  "startDate": "2026-01-15T00:00:00Z",
  "dueDate": "2026-02-01T00:00:00Z",
  "updatedAt": "2026-01-05T12:00:00Z",
  "estimatedDevelopmentTime": 120,
  "remainingTime": 100,
  "status": { "id": 1, "name": "Pendiente" },
  "approvalStatus": { "id": 1, "name": "En Revisión" },
  "requestedBy": { "id": 1, "name": "Usuario A" },
  "items": [
    {
      "id": 1,
      "name": "RequirementItem 1",
      "status": { "id": 1, "name": "Activo" },
      "category": { "id": 1, "name": "Categoría A" },
      "recipesCount": 2,
      "clientMargin": 0.15,
      "retailMaxPrice": 100.00,
      "retailMinPrice": 80.00,
      "quantityPerWeek": 50,
      "season": { "id": 1, "name": "Invierno" },
      "isWet": true,
      "tags": [],
      "specialInstructions": [],
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

**Error Responses**:
- `404 Not Found` - Requirement no encontrada
- `500 Internal Server Error` - Error del servidor

---

### 3. Obtener Detalle de RequirementItem

**GET** `/api/v1/requirement-items/:id`

Obtiene el detalle completo de un RequirementItem, opcionalmente incluyendo sus Recipes.

**Path Parameters**:
- `id: number` - ID del RequirementItem

**Query Parameters** (opcionales):
- `includeRecipes?: boolean` - Incluir Recipes en la respuesta (default: false)

**Response**: `200 OK`
```json
{
  "id": 1,
  "name": "RequirementItem 1",
  "status": { "id": 1, "name": "Activo" },
  "category": { "id": 1, "name": "Categoría A" },
  "recipesCount": 2,
  "clientMargin": 0.15,
  "retailMaxPrice": 100.00,
  "retailMinPrice": 80.00,
  "quantityPerWeek": 50,
  "season": { "id": 1, "name": "Invierno" },
  "isWet": true,
  "tags": [],
  "specialInstructions": [],
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-01T00:00:00Z",
  "assignedTo": { "id": 1, "name": "Usuario A" },
  "recipes": [
    {
      "id": 1,
      "name": "Recipe 1",
      "category": { "id": 1, "name": "Categoría Recipe" },
      "construction": { "id": 1, "name": "Construcción A" },
      "bouquetType": { "id": 1, "name": "Tipo Ramo A" },
      "bouquetLength": 50,
      "bouquetPhotos": [],
      "flowers": [],
      "seasonCases": [],
      "agreements": [],
      "origin": { "id": 1, "name": "Origen A" },
      "originCase": null,
      "description": "Descripción de la receta",
      "waste": 0.05,
      "laborCost": 10.50,
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

**Error Responses**:
- `404 Not Found` - RequirementItem no encontrado
- `500 Internal Server Error` - Error del servidor

---

### 4. Listar Recipes de un RequirementItem

**GET** `/api/v1/requirement-items/:requirementItemId/recipes`

Lista todas las Recipes asociadas a un RequirementItem.

**Path Parameters**:
- `requirementItemId: number` - ID del RequirementItem

**Response**: `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "name": "Recipe 1",
      "category": { "id": 1, "name": "Categoría Recipe" },
      "construction": { "id": 1, "name": "Construcción A" },
      "bouquetType": { "id": 1, "name": "Tipo Ramo A" },
      "bouquetLength": 50,
      "bouquetPhotos": [],
      "flowers": [],
      "seasonCases": [],
      "agreements": [],
      "origin": { "id": 1, "name": "Origen A" },
      "originCase": null,
      "description": "Descripción de la receta",
      "waste": 0.05,
      "laborCost": 10.50,
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

**Error Responses**:
- `404 Not Found` - RequirementItem no encontrado
- `500 Internal Server Error` - Error del servidor

---

### 5. Agregar Recipe a un RequirementItem

**POST** `/api/v1/requirement-items/:requirementItemId/recipes`

Agrega una nueva Recipe a un RequirementItem.

**Path Parameters**:
- `requirementItemId: number` - ID del RequirementItem

**Request Body**:
```json
{
  "name": "Recipe Nueva",
  "category": { "id": 1 },
  "construction": { "id": 1 },
  "bouquetType": { "id": 1 },
  "bouquetLength": 50,
  "origin": { "id": 1 },
  "description": "Descripción de la nueva receta",
  "waste": 0.05,
  "laborCost": 10.50
}
```

**Response**: `201 Created`
```json
{
  "id": 2,
  "name": "Recipe Nueva",
  "category": { "id": 1, "name": "Categoría Recipe" },
  "construction": { "id": 1, "name": "Construcción A" },
  "bouquetType": { "id": 1, "name": "Tipo Ramo A" },
  "bouquetLength": 50,
  "bouquetPhotos": [],
  "flowers": [],
  "seasonCases": [],
  "agreements": [],
  "origin": { "id": 1, "name": "Origen A" },
  "originCase": null,
  "description": "Descripción de la nueva receta",
  "waste": 0.05,
  "laborCost": 10.50,
  "createdAt": "2026-01-06T10:00:00Z",
  "updatedAt": "2026-01-06T10:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request` - Datos inválidos (campos requeridos faltantes)
- `404 Not Found` - RequirementItem no encontrado
- `409 Conflict` - Recipe duplicada o conflicto
- `500 Internal Server Error` - Error del servidor

---

### 6. Eliminar Recipe de un RequirementItem

**DELETE** `/api/v1/requirement-items/:requirementItemId/recipes/:recipeId`

Elimina una Recipe de un RequirementItem.

**Path Parameters**:
- `requirementItemId: number` - ID del RequirementItem
- `recipeId: number` - ID de la Recipe

**Response**: `204 No Content` (sin body)

**Error Responses**:
- `404 Not Found` - RequirementItem o Recipe no encontrados
- `500 Internal Server Error` - Error del servidor

---

## Error Response Format

Todos los errores siguen un formato consistente:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensaje de error legible por humanos",
    "details": {
      "field": "Información adicional del error"
    }
  }
}
```

## Authentication

Todos los endpoints requieren autenticación (según configuración del proyecto):
- Token en header: `Authorization: Bearer <token>`
- O según el interceptor configurado en el proyecto

## Rate Limiting

(Definir según políticas del proyecto)

## Notes

- Todos los timestamps están en formato ISO 8601 (UTC)
- Los IDs son números (`number`) según los DTOs definidos
- Los objetos anidados (CustomerDTO, ItemCatalogDTO, etc.) siguen la estructura definida en sus respectivos DTOs
- Las relaciones anidadas (RequirementItems en Requirement, Recipes en RequirementItem) pueden cargarse por separado o incluirse según el parámetro `include*`
- Los valores decimales (`decimal`) usan precisión decimal fija según los DTOs
