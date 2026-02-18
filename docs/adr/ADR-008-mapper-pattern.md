# ADR-008: Patrón de Mappers para Transformación de Datos

**Estado:** Aceptado  
**Fecha de Creación:** 18/02/2026  
**Última Actualización:** 18/02/2026  
**Decisores:** Equipo de Arquitectura

## Contexto

La aplicación maneja múltiples representaciones de datos que difieren en nombres de campos, tipos y formatos:

- **Modelos de dominio (Record):** Estructuras tipadas usadas en la capa de aplicación
- **Respuestas del backend (Response DTO):** Estructuras recibidas de la API
- **Requests hacia la API (Request DTO):** Estructuras enviadas al backend
- **Datos persistidos localmente:** Cache, IndexedDB, localStorage
- **ViewModels para UI:** Estructuras adaptadas para presentación

Sin una estrategia clara de transformación entre estas representaciones:

- Se duplica lógica de transformación en múltiples lugares
- Se introducen inconsistencias entre capas
- Aumenta el acoplamiento entre componentes y estructuras de datos
- Disminuye la mantenibilidad y dificulta el testing

Se requiere un patrón consistente, escalable y fácil de testear para centralizar todas las transformaciones de datos.

## Decisión

Se adopta el uso de **mappers como objetos exportados con funciones puras**, organizados por feature. Cada mapper:

- Agrupa todas las transformaciones relacionadas con una entidad
- Contiene funciones puras sin efectos secundarios
- No depende de servicios Angular ni estado global
- Retorna siempre nuevos objetos transformados (inmutabilidad)

## Ubicación

Los mappers se ubican dentro del feature correspondiente, en la carpeta `utils/`:

```
src/app/features/budgets/utils/budget-mapper.ts
src/app/features/transactions/utils/transaction-mapper.ts
src/app/features/templates/utils/entity-mapper.ts
```

Esta ubicación sigue la convención de ADR-001 para artefactos específicos de cada feature.

## Convenciones de Nomenclatura

### Archivos

```
<entity>-mapper.ts
```

**Ejemplos:**

- `budget-mapper.ts`
- `transaction-mapper.ts`
- `entity-mapper.ts`

### Objetos exportados

```
<Entity>Mapper
```

**Ejemplos:**

- `BudgetMapper`
- `TransactionMapper`
- `EntityMapper`

### Funciones de mapeo

Se utiliza el patrón explícito `map<Source>To<Target>` cuando el contexto lo requiera. Cuando el contexto sea claro dentro del mapper, se usa la forma simplificada:

| Patrón completo              | Forma simplificada (dentro del mapper) |
|-----------------------------|----------------------------------------|
| `mapResponseToRecord()`     | `mapResponseToRecord()`                |
| `mapRecordToRequest()`      | `mapRecordToRequest()`                 |
| `mapRecordToCache()`        | `mapRecordToCache()`                   |
| `mapCacheToRecord()`        | `mapCacheToRecord()`                   |

Esta convención permite indicar claramente origen y destino, mantener nombres legibles y facilitar la búsqueda y mantenimiento.

## Implementación

### Estructura del Mapper

```typescript
// src/app/features/budgets/utils/budget-mapper.ts
import type { BudgetRecord, BudgetRequest, BudgetResponse } from '../models/budget';

export const BudgetMapper = {
  mapResponseToRecord(response: BudgetResponse): BudgetRecord {
    return {
      id: response.id,
      name: response.name,
      amount: Number(response.amount),
      period: response.period,
      categories: response.categories ?? [],
      tags: response.tags ?? [],
      position: response.position,
      space: { id: response.space },
      createdBy: response.createdBy,
      createdAt: response.createdAt,
      updatedBy: response.updatedBy,
      updatedAt: response.updatedAt
    };
  },

  mapRecordToRequest(record: BudgetRecord): BudgetRequest {
    return {
      id: record.id,
      name: record.name,
      amount: String(record.amount),
      period: record.period,
      categories: record.categories,
      tags: record.tags,
      position: record.position,
      space: record.space.id,
      createdBy: record.createdBy,
      createdAt: record.createdAt,
      updatedBy: record.updatedBy,
      updatedAt: record.updatedAt
    };
  },

  mapRecordToCache(record: BudgetRecord): BudgetCache {
    return {
      id: record.id,
      name: record.name,
      amount: record.amount,
      lastSynced: new Date().toISOString()
    };
  },

  mapCacheToRecord(cache: BudgetCache): BudgetRecord {
    return {
      ...cache,
      period: 'monthly',
      categories: [],
      tags: [],
      position: 0,
      space: { id: cache.spaceId },
      createdBy: '',
      createdAt: cache.lastSynced,
      updatedBy: '',
      updatedAt: cache.lastSynced
    };
  }
};
```

### Uso en Repositories y Managers

```typescript
// En Repository - transformar response antes de exponer
import { BudgetMapper } from '../utils/budget-mapper';

@Injectable({ providedIn: 'root' })
export class BudgetRepository {
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = getApiUrl('budgets');

  public find(): SignalGet<string, BudgetRecord> {
    return getResource<string, BudgetRecord>((id: string) => {
      return this.httpClient.get<BudgetResponse>(`${this.baseUrl}/${id}`).pipe(
        map((response) => BudgetMapper.mapResponseToRecord(response))
      );
    });
  }

  public mutations() {
    return getMutations({
      create: (record: BudgetRecord) => {
        const request = BudgetMapper.mapRecordToRequest(record);
        return this.httpClient.post<BudgetResponse>(this.baseUrl, request).pipe(
          map((response) => BudgetMapper.mapResponseToRecord(response))
        );
      }
    });
  }
}
```

```typescript
// Uso directo en componentes o servicios
const record = BudgetMapper.mapResponseToRecord(response);
const request = BudgetMapper.mapRecordToRequest(record);
```

## Principios

### Funciones puras

- Sin efectos secundarios (no HTTP, no almacenamiento, no mutación)
- Sin dependencias externas (no inyección de servicios)
- Sin mutación del objeto de entrada

### Responsabilidad única

El mapper **solo transforma datos**. No contiene lógica de negocio, validación ni formateo para UI.

### Agrupación por entidad

Un mapper contiene todas las transformaciones relacionadas con una entidad (Response↔Record↔Request↔Cache).

## Reglas

### Hacer

- Normalizar tipos entre representaciones (`string ↔ number ↔ Date`)
- Manejar valores nulos o faltantes con valores por defecto (`?? []`, `?? ''`)
- Retornar siempre nuevos objetos (inmutabilidad)
- Centralizar conversiones entre capas en un solo lugar
- Crear pruebas unitarias para cada función de mapeo

### Evitar

- Usar servicios Angular o inyección de dependencias
- Acceder a HTTP, almacenamiento o APIs externas
- Incluir lógica de negocio o validaciones
- Formatear datos para UI (eso pertenece a pipes o componentes)
- Mutar objetos de entrada

## Casos de Uso Cubiertos

Este patrón aplica para todas las transformaciones entre representaciones:

| Origen   | Destino | Función típica          |
|----------|---------|--------------------------|
| Response | Record  | `mapResponseToRecord()`  |
| Record   | Request | `mapRecordToRequest()`   |
| Record   | Cache   | `mapRecordToCache()`     |
| Cache    | Record  | `mapCacheToRecord()`     |
| DTO      | DTO     | `mapXToY()` según contexto |

Debe aplicarse de forma consistente en todos los features que manejen múltiples representaciones de datos.

## Mejores Prácticas

### 1. Un Mapper por Entidad

```typescript
// ✅ Correcto - un mapper por entidad
BudgetMapper;
TransactionMapper;

// ❌ Incorrecto - mapper genérico para múltiples entidades
DataMapper;
```

### 2. Usar Valores por Defecto para Campos Opcionales

```typescript
// ✅ Correcto - manejo explícito de nulos
categories: response.categories ?? [],
tags: response.tags ?? [],

// ❌ Incorrecto - puede propagar undefined
categories: response.categories,
```

### 3. Normalizar Tipos Explícitamente

```typescript
// ✅ Correcto - conversión explícita
amount: Number(response.amount),
createdAt: new Date(response.createdAt),

// ❌ Incorrecto - asumir que los tipos coinciden
amount: response.amount,
```

### 4. No Formatear para UI

```typescript
// ✅ Correcto - el mapper solo transforma estructura
return { name: record.name, amount: record.amount };

// ❌ Incorrecto - formateo pertenece a pipes/componentes
return { name: record.name, amount: formatCurrency(record.amount) };
```

### 5. Mantener Mappers Sin Dependencias

```typescript
// ✅ Correcto - objeto con funciones puras
export const BudgetMapper = { mapResponseToRecord, mapRecordToRequest };

// ❌ Incorrecto - dependencias externas
export const BudgetMapper = {
  mapResponseToRecord(response: BudgetResponse) {
    return this.dateService.format(response); // ❌ No usar servicios
  }
};
```

## Relación con Otros Patrones

### Mappers y Repositories (ADR-006)

Los Repositories **usan** los Mappers para transformar datos al recibir respuestas de la API y al enviar requests:

```typescript
// El Repository recibe BudgetResponse del HTTP y usa el Mapper para exponer BudgetRecord
return this.httpClient.get<BudgetResponse>(url).pipe(
  map((response) => BudgetMapper.mapResponseToRecord(response))
);
```

### Mappers y Managers (ADR-007)

Los Managers orquestan flujos pero **no realizan transformaciones**. Si un Manager necesita datos en formato Record, los obtiene ya transformados del Repository (que usa el Mapper).

### Mappers y Modelos

Los Mappers transforman **entre** modelos. Los tipos (Record, Request, Response) se definen en `models/` del feature; los Mappers importan esos tipos y realizan la transformación.

## Testing

Los mappers son trivialmente testeables por ser funciones puras:

```typescript
import { describe, it, expect } from 'vitest';
import { BudgetMapper } from './budget-mapper';

describe('BudgetMapper', () => {
  describe('mapResponseToRecord', () => {
    it('should map response to record with correct types', () => {
      const response = {
        id: '1',
        name: 'Test Budget',
        amount: '1000.50',
        period: 'monthly',
        categories: null,
        tags: undefined,
        position: 1,
        space: 'space-1',
        createdBy: 'user-1',
        createdAt: '2026-01-01T00:00:00Z',
        updatedBy: 'user-1',
        updatedAt: '2026-01-01T00:00:00Z'
      };

      const record = BudgetMapper.mapResponseToRecord(response);

      expect(record.amount).toBe(1000.5);
      expect(record.categories).toEqual([]);
      expect(record.tags).toEqual([]);
      expect(record.space).toEqual({ id: 'space-1' });
    });
  });

  describe('mapRecordToRequest', () => {
    it('should map record to request for API', () => {
      const record = {
        id: '1',
        name: 'Test',
        amount: 1000.5,
        period: 'monthly',
        categories: [],
        tags: [],
        position: 1,
        space: { id: 'space-1' },
        createdBy: 'user-1',
        createdAt: '2026-01-01',
        updatedBy: 'user-1',
        updatedAt: '2026-01-01'
      };

      const request = BudgetMapper.mapRecordToRequest(record);

      expect(request.amount).toBe('1000.5');
      expect(request.space).toBe('space-1');
    });
  });
});
```

## Consecuencias

### Positivas

- **Transformaciones centralizadas:** Un solo lugar para modificar cuando cambian contratos de API
- **Código consistente y predecible:** Mismo patrón en toda la aplicación
- **Alta testabilidad:** Funciones puras sin mocks
- **Bajo acoplamiento:** Las capas dependen de estructuras, no de implementaciones
- **Fácil refactorización:** Cambios en DTOs se propagan desde el mapper
- **Escalable:** Nuevas transformaciones se añaden como nuevas funciones en el mismo objeto

### Negativas

- **Crecimiento del mapper:** Entidades complejas pueden generar mappers extensos
- **Disciplina requerida:** Debe evitarse incluir lógica de negocio por comodidad

### Mitigación

- **Dividir por sub-entidades:** Si una entidad tiene muchas transformaciones, considerar mappers anidados o por agregado
- **Revisión de código:** Verificar que los mappers mantengan responsabilidad única
- **Documentación:** Este ADR como referencia para el equipo

## Alternativas Consideradas

### Funciones independientes por transformación

**Descartado:** Dispersa la lógica relacionada y dificulta descubrir todas las transformaciones de una entidad.

### Servicios Angular para mapeo

**Descartado:** Introduce dependencias innecesarias (inyección, providers) para lógica pura que no requiere estado ni efectos.

### Mapeo dentro de componentes o repositories

**Descartado:** Rompe separación de responsabilidades y duplica lógica cuando múltiples consumidores necesitan la misma transformación.

### Librerías de mapeo automático (class-transformer, etc.)

**Descartado para el caso actual:** La transformación explícita ofrece mayor control, claridad y evita "magia" implícita. Puede reconsiderarse si la complejidad de mapeos crece significativamente.

## Referencias

- [ADR-001: Separación de Responsabilidades - Core, Shared y Features](./ADR-001-separation-of-responsibilities.md)
- [ADR-006: Patrón de Repositorio para Servicios REST](./ADR-006-repository-pattern.md)
- [ADR-007: Patrón Manager para Coordinación de Flujos de Negocio](./ADR-007-manager-pattern.md)
