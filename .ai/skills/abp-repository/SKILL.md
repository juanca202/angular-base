---
name: abp-repository
description: Guía operativa para implementar el patrón Repository (ADR-006). Usar cuando crees o modifiques repositories, mocks, mutations, getResource o getResourceCollection. Incluye convenciones de rutas, getApiUrl, MockHttpClient y migración mock→API real.
---

# Patrón Repository — Instrucciones Operativas

Implementa el patrón Repository según [ADR-006](docs/adr/ADR-006-repository-pattern.md). Usa `getMutations()`, `getResource()` y `getResourceCollection()` desde `@/core/utils/async-resources`.

## Cuándo usar

- Crear o modificar un repository
- Implementar operaciones de lectura (find, findBy) o escritura (mutations)
- Crear repositorio mock sin backend
- Migrar de mock a API real
- Resolver endpoints o documentar contratos API

---

## Estructura del Repository

Cada entidad tiene su propia clase repository:

```typescript
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { getMutations, getResource, getApiUrl } from '@/core/utils/async-resources';
import { Customer, CustomerRequest } from '@/features/customers/models/customer';

@Injectable({ providedIn: 'root' })
export class CustomerRepository {
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = getApiUrl('v1/customers');

  // Mutations (POST, PUT, PATCH, DELETE)
  public mutations() {
    return getMutations({
      create: (customer: CustomerRequest) => this.httpClient.post<Customer>(this.baseUrl, customer),
      update: (customer: CustomerRequest) =>
        this.httpClient.put<Customer>(`${this.baseUrl}/${customer.id}`, customer),
      delete: (id: string) => this.httpClient.delete<void>(`${this.baseUrl}/${id}`)
    });
  }

  // Resources (Operaciones de Lectura)
  // Single resource (GET by ID)
  public find() {
    return getResource<string, Customer>((id: string) => {
      return this.httpClient.get<Customer>(`${this.baseUrl}/${id}`);
    });
  }

  // Resource list (GET all or filtered)
  public findBy() {
    return getResource<void, Customer[]>(() => {
      return this.httpClient.get<Customer[]>(this.baseUrl);
    });
  }
}
```

---

## Resolución de Endpoints (getApiUrl)

Siempre usar `getApiUrl()`; incluye base y prefijo desde `environment.restEndpoint`:

```typescript
// ✅ Correcto
private readonly baseUrl = getApiUrl('requirements');
private readonly baseUrl = getApiUrl('v2/customers');

// ❌ Incorrecto
private readonly baseUrl = getApiUrl('api/v1/requirements');
private readonly baseUrl = 'https://api.example.com/api/v1/requirements';
```

---

## Mutations (Operaciones de Escritura)

Usar `getMutations()` para POST, PUT, PATCH, DELETE:

```typescript
const mutations = customerRepository.mutations();

// Create / Update / Delete
mutations.create({ name: 'John', email: 'john@example.com' }).then(...);
mutations.update({ id: '123', name: 'John Updated' }).then(...);
mutations.delete('123').then(...);

// Signals de estado
mutations.submitting();        // true si alguna mutación está en curso
mutations.error();             // mensaje de error global
mutations.create.submitting(); // true si create está en curso
mutations.create.value();      // último valor creado
mutations.create.error();      // error específico de create
```

---

## Resources (Operaciones de Lectura)

### getResource — recurso único o lista simple

```typescript
// Single resource
const customerResource = customerRepository.find();
customerResource.load('123').then((customer) => { ... });

// Lista simple
const customers = customerRepository.findBy();
customers.load().then((list) => { ... });

// Signals
customerResource.value();
customerResource.loading();
customerResource.error();

// Cleanup obligatorio
customerResource.destroy();
customers.destroy();
```

### getResourceCollection — listas paginadas o acumulables

Para paginación, filtros con params o scroll infinito:

```typescript
// En el Repository
public findBy() {
  return getResourceCollection<ProductListRequest | undefined, ProductListItem[]>(
    (params?: ProductListRequest) => {
      let httpParams = new HttpParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            if (Array.isArray(value)) {
              value.forEach((v) => httpParams = httpParams.append(key, String(v)));
            } else {
              httpParams = httpParams.set(key, String(value));
            }
          }
        });
      }
      return this.httpClient.get<ProductListResponse | ProductListItem[]>(
        this.baseUrl,
        { params: httpParams }
      );
    }
  );
}

// En el componente
const products = productRepository.findBy();
products.load({ search: 'harina', page: 1, pageSize: 20 });
products.load({ search: 'harina', page: 2 }, { append: true }); // scroll infinito

products.value();       // página actual
products.accumulated(); // todas las páginas acumuladas
products.total();       // total (cuando API devuelve { data, total })
products.loading();
products.error();
products.destroy();
```

El API puede devolver `T[]` o `{ data: T[], total: number }`; `getResourceCollection` normaliza ambos.

---

## Consultas filtradas

Usar query params, no rutas anidadas:

```typescript
public findByParent(parentId: number) {
  return getResource<void, Child[]>(() => {
    return this.httpClient.get<Child[]>(this.baseUrl, {
      params: { parentId }
    });
  });
}
```

---

## Repositorios Mock

Cuando no hay backend real:

1. Usar `MockHttpClient` en lugar de `HttpClient`
2. Datos desde JSON en `test/mocks/repositories/`
3. Cargar en constructor con `this.httpClient.loadCollection()`
4. Solo datos raw; nunca strings de UI en JSON

```typescript
import { inject, Injectable } from '@angular/core';
import { getApiUrl, getMutations, getResource } from '@/core/utils/async-resources';
import { MockHttpClient } from '@/core/services/mock-http-client';
import { BaseRepository } from '@/core/services/base-repository';
import entitiesMock from '@/test/mocks/repositories/entities.json';

@Injectable({ providedIn: 'root' })
export class EntityRepository extends BaseRepository {
  // TODO: Replace with real http client when API is available
  private readonly httpClient = inject(MockHttpClient);
  private readonly baseUrl = getApiUrl('entities');

  constructor() {
    super();
    this.httpClient.loadCollection('entities', entitiesMock);
  }

  public mutations() { /* igual que con HttpClient */ }
  public find() { /* igual que con HttpClient */ }
  public findBy() { /* igual que con HttpClient */ }
}
```

### Migración mock → API real

1. Reemplazar `MockHttpClient` por `HttpClient`
2. Eliminar import de JSON y `loadCollection()` del constructor
3. Eliminar el TODO
4. Mantener archivos JSON para tests si aplica

---

## Convenciones de rutas en contratos API

- **NO** incluir `/api/v1/` en rutas (lo resuelve `getApiUrl()`)
- **NO** usar subrecursos anidados; usar query params

```markdown
✅ GET entities
✅ GET entities/:id
✅ GET children?parentId=:parentId

❌ GET /api/v1/entities
❌ GET /api/v1/parent/:parentId/child
```

---

## Uso en componente

```typescript
@Component({ ... })
export class CustomerListComponent implements OnInit, OnDestroy {
  private customerRepo = inject(CustomerRepository);

  customers = this.customerRepo.findBy();
  mutations = this.customerRepo.mutations();

  ngOnInit() {
    this.customers.load();
  }

  ngOnDestroy() {
    this.customers.destroy();
  }

  async handleCreate() {
    try {
      await this.mutations.create({ name: 'New', email: 'new@example.com' });
      this.customers.load(); // recargar lista
    } catch {
      // Error ya mostrado al usuario
    }
  }
}
```

Template con signals:

```html
@if (customers.loading()) { <app-spinner /> }
@else if (customers.error()) { <app-error [message]="customers.error()" /> }
@else {
  @for (customer of customers.value(); track customer.id) {
    <app-customer-card [customer]="customer" />
  }
}
<button [disabled]="mutations.submitting()" (click)="handleCreate()">Create</button>
```

---

## Mejores prácticas

| Regla | Correcto | Incorrecto |
|-------|----------|------------|
| Un repository por entidad | `CustomerRepository` | `DataRepository` |
| Siempre getApiUrl | `getApiUrl('v1/customers')` | URL hardcodeada |
| Destruir resources | `ngOnDestroy() { this.customers.destroy(); }` | Olvidar `destroy()` |
| Binding UI | `@if (customers.loading())` | `loading = false` manual |
| Errores | `try/catch` + recargar si aplica | Ignorar errores |
| Mock sin backend | `MockHttpClient` + JSON | `HttpClient` sin API |

---

## Testing

Mockear `HttpClient` y verificar llamadas:

```typescript
it('should load customer by id', async () => {
  const resource = repository.find();
  const result = await resource.load('123');
  expect(result).toEqual(customer);
  expect(resource.value()).toBe(customer);
});
```

---

## Referencias

- [ADR-006: Patrón Repository](docs/adr/ADR-006-repository-pattern.md)
- `src/app/core/utils/async-resources.ts`
- `src/app/features/requirements/repositories/product-repository.ts` (ejemplo con getResourceCollection)
