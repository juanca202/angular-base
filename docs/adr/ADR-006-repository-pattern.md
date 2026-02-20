# ADR-006: Patrón Repository para Servicios REST

**Estado:** Aceptado  
**Fecha de Creación:** 06/01/2026  
**Última Actualización:** 07/01/2026  
**Decisores:** Equipo de Arquitectura

## Contexto

A medida que la aplicación crece, gestionar la comunicación con la API se vuelve complejo:

- Múltiples servicios haciendo peticiones HTTP con diferentes patrones
- Manejo de errores inconsistente entre componentes
- Gestión duplicada del estado de carga
- Falta de gestión centralizada de endpoints de API
- Difícil de testear y mockear llamadas a API
- No hay forma estandarizada de manejar mutaciones vs. consultas

Sin un patrón consistente, los desarrolladores podrían:

- Crear llamadas HTTP ad-hoc en componentes
- Duplicar lógica de manejo de errores
- Gestionar estados de carga manualmente en cada componente
- Hacer difícil testear y mantener interacciones con la API

## Decisión

Usaremos el **Patrón Repository** con funciones helper `getMutations()` y `getResource()` para estandarizar toda la comunicación REST API. Este patrón proporciona:

1. **Lógica de API centralizada** en clases repository
2. **Gestión automática de estado** con signals (loading, error, value)
3. **Manejo de errores consistente** con notificaciones automáticas al usuario
4. **Llamadas a API type-safe** con genéricos de TypeScript
5. **Testing fácil** a través de inyección de dependencias
6. **Separación de concerns** entre acceso a datos y lógica de negocio

## Implementación

### Estructura del Repository

Cada entidad tiene su propia clase repository que encapsula todas las operaciones de API:

```typescript
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { getMutations, getResource, getApiUrl, SignalGet } from '@/core/utils/async-repository';
import { Customer, CustomerRequest } from '@/features/customers/models/customer';

@Injectable({ providedIn: 'root' })
export class CustomerRepository {
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = getApiUrl('v1/customers');

  // Mutations (POST, PUT, DELETE)
  public mutations() {
    return getMutations({
      create: (customer: CustomerRequest) => this.httpClient.post<Customer>(this.baseUrl, customer),
      update: (customer: CustomerRequest) =>
        this.httpClient.put<Customer>(`${this.baseUrl}/${customer.id}`, customer),
      delete: (id: string) => this.httpClient.delete<void>(`${this.baseUrl}/${id}`)
    });
  }

  // Single resource (GET by ID)
  public find(): SignalGet<string, Customer> {
    return getResource<string, Customer>((id: string) => {
      return this.httpClient.get<Customer>(`${this.baseUrl}/${id}`);
    });
  }

  // Resource list (GET all or filtered)
  public findBy(): SignalGet<void, Customer[]> {
    return getResource<void, Customer[]>(() => {
      return this.httpClient.get<Customer[]>(this.baseUrl);
    });
  }
}
```

### Repositorios Mock para Desarrollo

Cuando no hay una implementación de backend real disponible, **se debe crear automáticamente un repositorio mock** que permita desarrollar y probar componentes sin depender de APIs externas.

#### Requisitos para Repositorios Mock

1. **Uso de MockHttpClient**: Los repositorios mock deben usar `MockHttpClient` en lugar de `HttpClient` de Angular.

2. **Datos desde archivos JSON**: Los datos mock deben leerse desde archivos JSON ubicados en `test/mocks/repositories/`. Estos archivos deben simular estructuras de datos realistas para que los componentes puedan renderizar con UI completamente poblada.

3. **Carga en el constructor**: Los datos mock deben cargarse usando un import directo y luego llamando a `this.httpClient.loadCollection()` en el constructor.

4. **Solo datos raw**: Los archivos JSON **nunca deben contener strings de UI hardcodeados**, solo datos estructurados (raw data).

5. **Reemplazo automático**: Los repositorios mock deben ser reemplazados automáticamente una vez que se cree un repositorio respaldado por API real.

#### Ejemplo de Repositorio Mock

```typescript
import { inject, Injectable } from '@angular/core';
import { getApiUrl, getMutations, getResource } from '@/core/utils/async-resources';
import { MockHttpClient } from '@/core/services/mock-http-client';
import { BaseRepository } from '@/core/services/base-repository';
import { HttpParams } from '@angular/common/http';
import {
  Entity,
  EntityRequestCreate,
  EntityRequestUpdate
} from '@/features/templates/models/entity';
import entitiesMock from '@/test/mocks/repositories/entities.json';

@Injectable({ providedIn: 'root' })
export class EntityRepository extends BaseRepository {
  // TODO: Replace with real http client when API is available
  private readonly httpClient = inject(MockHttpClient);
  private readonly baseUrl = getApiUrl('entities');

  constructor() {
    super();
    // Cargar datos mock desde archivo JSON
    this.httpClient.loadCollection('entities', entitiesMock);
  }

  public mutations() {
    return getMutations({
      create: (entity: EntityRequestCreate) => this.httpClient.post<Entity>(this.baseUrl, entity),
      update: (entity: EntityRequestUpdate) =>
        this.httpClient.put<Entity>(`${this.baseUrl}/${entity.id}`, entity),
      delete: (id: string) => this.httpClient.delete<void>(`${this.baseUrl}/${id}`)
    });
  }

  public find() {
    return getResource<string, Entity>((id: string) => {
      return this.httpClient.get<Entity>(`${this.baseUrl}/${id}`);
    });
  }

  public findBy() {
    return getResource<void, Entity[]>(() => {
      return this.httpClient.get<Entity[]>(this.baseUrl);
    });
  }
}
```

#### Estructura de Archivos Mock

Los archivos JSON deben ubicarse en `test/mocks/repositories/` y seguir la estructura de datos de la entidad:

```
test/mocks/repositories/
  entities.json
  requirements.json
  requirement-items.json
  customers.json
```

**Ejemplo de archivo JSON (entities.json):**

```json
[
  {
    "id": "1",
    "firstName": "María",
    "lastName": "García",
    "phone": "+34 612 345 678",
    "email": "maria.garcia@email.com"
  },
  {
    "id": "2",
    "firstName": "Carlos",
    "lastName": "Rodríguez",
    "phone": "+34 623 456 789",
    "email": "carlos.rodriguez@email.com"
  }
]
```

**⚠️ Importante**: Los archivos JSON deben contener **solo datos estructurados**, sin strings de UI como "Crear", "Editar", mensajes de error, etc. Estos deben manejarse en el código de la aplicación, no en los datos mock.

#### Migración de Mock a API Real

Cuando el backend real esté disponible, el proceso de migración es simple:

1. **Reemplazar MockHttpClient por HttpClient**:

   ```typescript
   // Antes (Mock)
   private readonly httpClient = inject(MockHttpClient);

   // Después (Real)
   private readonly httpClient = inject(HttpClient);
   ```

2. **Eliminar la carga de datos mock**:

   ```typescript
   // Eliminar estas líneas del constructor
   import entitiesMock from '@/test/mocks/repositories/entities.json';
   // ...
   constructor() {
     super();
     // Eliminar esta línea
     // this.httpClient.loadCollection('entities', entitiesMock);
   }
   ```

3. **Eliminar el TODO**: Remover el comentario `// TODO: Replace with real http client`

4. **Mantener los archivos JSON**: Los archivos mock pueden mantenerse para testing, pero ya no se usarán en el repositorio de producción.

El resto del código del repositorio (métodos `mutations()`, `find()`, `findBy()`, etc.) **permanece idéntico**, lo que facilita la migración sin cambios en los componentes que usan el repositorio.

### Resolución de Endpoints de API

Siempre usar `getApiUrl()` para resolver endpoints de API. La función `getApiUrl()` ya incluye la URL base y el prefijo `/api/v1/` desde `environment.restEndpoint`, por lo que solo se debe pasar el nombre del recurso:

```typescript
// ✅ Correcto - solo el nombre del recurso
private readonly baseUrl = getApiUrl('requirements');
// Resultado: `${environment.restEndpoint}/requirements`
// Si restEndpoint = 'https://api.example.com/api/v1'
// Entonces: 'https://api.example.com/api/v1/requirements'

// ✅ Correcto - recurso con versión si es necesario
private readonly baseUrl = getApiUrl('v2/customers');

// ❌ Incorrecto - incluir /api/v1/ manualmente
private readonly baseUrl = getApiUrl('api/v1/requirements');

// ❌ Incorrecto - URL hardcodeada
private readonly baseUrl = 'https://api.example.com/api/v1/requirements';
```

### Convenciones de Rutas en Contratos API

Al documentar contratos de API:

1. **NO incluir `/api/v1/`** en las rutas: Este prefijo se resuelve automáticamente por `getApiUrl()` desde `environment.restEndpoint`

2. **NO usar rutas con subrecursos anidados**: Asumir que todos los recursos son independientes. En lugar de rutas anidadas como `/parent-resource/:parentId/child-resource`, usar recursos independientes con query parameters o filtros.

```typescript
// ✅ Correcto en contratos API
GET entities
GET entities/:id
GET items
GET items/:id
GET children
GET children/:id

// ❌ Incorrecto en contratos API
GET /api/v1/entities
GET /api/v1/parent-resource/:parentId/child-resource
DELETE /api/v1/parent-resource/:parentId/child-resource/:childId
```

**Ejemplo de implementación correcta:**

```typescript
// En el Repository
@Injectable({ providedIn: 'root' })
export class ChildRepository {
  private readonly baseUrl = getApiUrl('children');

  // Para filtrar por parentId, usar query params
  public findByParent(parentId: number) {
    return getResource<void, Child[]>(() => {
      return this.httpClient.get<Child[]>(this.baseUrl, {
        params: { parentId }
      });
    });
  }
}
```

**En el contrato API:**

```markdown
### Listar Children

**GET** `children?parentId=:parentId`

Lista todas las Children, opcionalmente filtradas por Parent.
```

### Mutations (Operaciones de Escritura)

Usar `getMutations()` para operaciones POST, PUT, PATCH y DELETE:

```typescript
// En componente o servicio
const mutations = customerRepository.mutations();

// Create
mutations
  .create({ name: 'John', email: 'john@example.com' })
  .then((result) => {
    console.log('Created:', result);
  })
  .catch((error) => {
    // El error se muestra automáticamente al usuario vía MessageService
    // Pero aún puedes manejarlo si es necesario
  });

// Update
mutations
  .update({ id: '123', name: 'John Updated' })
  .then((result) => console.log('Updated:', result));

// Delete
mutations.delete('123').then(() => console.log('Deleted'));

// Acceder a signals de estado
mutations.submitting(); // true si alguna mutación está ejecutándose
mutations.error(); // mensaje de error si alguna mutación falló
mutations.create.submitting(); // true si create está ejecutándose
mutations.create.value(); // último valor creado
mutations.create.error(); // error específico de create
```

### Resources (Operaciones de Lectura)

Usar `getResource()` para operaciones GET:

```typescript
// Single resource
const customerResource = customerRepository.find();

// Load data
customerResource.load('123').then((customer) => {
  console.log('Customer:', customer);
});

// Acceder a signals reactivos
customerResource.value(); // valor actual del customer
customerResource.loading(); // true mientras carga
customerResource.error(); // mensaje de error si falló

// Resource list
const customers = customerRepository.findBy();
customers.load().then((list) => console.log('Customers:', list));

// Cleanup (importante para gestión de memoria)
customerResource.destroy();
customers.destroy();
```

### Ejemplo de Uso en Componente

```typescript
@Component({
  selector: 'app-customer-list',
  template: `
    @if (customers.loading()) {
      <app-spinner />
    } @else if (customers.error()) {
      <app-error [message]="customers.error()" />
    } @else {
      @for (customer of customers.value(); track customer.id) {
        <app-customer-card [customer]="customer" />
      }
    }

    <button [disabled]="mutations.submitting()" (click)="handleCreate()">Create Customer</button>
  `
})
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
      const newCustomer = await this.mutations.create({
        name: 'New Customer',
        email: 'new@example.com'
      });
      // Recargar lista después de creación
      this.customers.load();
    } catch (error) {
      // El error ya se mostró al usuario, pero se puede manejar aquí si es necesario
    }
  }
}
```

## Características Clave

### 1. Gestión Automática de Estado

Tanto `getMutations()` como `getResource()` gestionan automáticamente:

- **Estado Loading/Submitting**: Signals que indican cuando las operaciones están en progreso
- **Estado de Error**: Signals que contienen mensajes de error
- **Estado de Valor**: Signals que contienen el resultado de las operaciones

### 2. Manejo Automático de Errores

- Los errores se capturan automáticamente y se muestran a los usuarios vía `MessageService`
- Los errores aún se lanzan, permitiendo bloques try/catch para manejo personalizado
- Los mensajes de error se extraen de las respuestas de API de forma consistente

### 3. Seguridad de Tipos

- Soporte completo de TypeScript con genéricos
- Inferencia de tipos para tipos de request/response
- Verificación en tiempo de compilación de contratos de API

### 4. Gestión de Memoria

- Los recursos proporcionan método `destroy()` para limpiar suscripciones
- Siempre llamar `destroy()` en el hook de ciclo de vida `ngOnDestroy()` del componente
- Previene memory leaks de suscripciones persistentes

## Convenciones de Nombres de Repository

- **Clase Repository**: `{Entity}Repository` (ej: `CustomerRepository`, `OrderRepository`)
- **Método Mutations**: Siempre nombrado `mutations()`
- **Método Single resource**: Nombrado `find()` o `findById()`
- **Método List resource**: Nombrado `findBy()` o `findAll()`
- **Consultas filtradas**: Nombradas `findBy{Filter}()` (ej: `findByStatus()`, `findByDateRange()`)

## Mejores Prácticas

### 1. Un Repository Por Entidad

```typescript
// ✅ Correcto - un repository por entidad
CustomerRepository;
OrderRepository;
ProductRepository;

// ❌ Incorrecto - múltiples entidades en un repository
DataRepository; // Demasiado genérico
```

### 2. Siempre Usar getApiUrl()

```typescript
// ✅ Correcto
private readonly baseUrl = getApiUrl('v1/customers');

// ❌ Incorrecto
private readonly baseUrl = `${environment.apiUrl}/v1/customers`;
```

### 3. Siempre Destruir Resources

```typescript
// ✅ Correcto
ngOnDestroy() {
  this.customers.destroy();
}

// ❌ Incorrecto - memory leak
// Olvidó llamar destroy()
```

### 4. Usar Signals para Binding de UI

```typescript
// ✅ Correcto - signals reactivos
@if (customers.loading()) { ... }
@if (customers.error()) { ... }

// ❌ Incorrecto - gestión manual de estado
loading = false;
error = null;
```

### 5. Manejar Errores Apropiadamente

```typescript
// ✅ Correcto - los errores se muestran automáticamente, pero aún se pueden manejar
try {
  await mutations.create(data);
  // Manejo de éxito
} catch (error) {
  // Manejo de error personalizado si es necesario
  // El error ya se mostró al usuario
}

// ❌ Incorrecto - ignorar errores
mutations.create(data); // Sin manejo de errores
```

### 6. Usar MockHttpClient cuando no hay Backend Disponible

```typescript
// ✅ Correcto - MockHttpClient con datos desde JSON
import entitiesMock from '@/test/mocks/repositories/entities.json';

@Injectable({ providedIn: 'root' })
export class EntityRepository extends BaseRepository {
  // TODO: Replace with real http client when API is available
  private readonly httpClient = inject(MockHttpClient);

  constructor() {
    super();
    this.httpClient.loadCollection('entities', entitiesMock);
  }
}

// ❌ Incorrecto - usar HttpClient sin backend disponible
private readonly httpClient = inject(HttpClient);  // Fallará sin API real

// ❌ Incorrecto - datos hardcodeados en el código
constructor() {
  super();
  this.httpClient.loadCollection('entities', [
    { id: '1', name: 'Test' }  // Datos hardcodeados
  ]);
}
```

**Reglas para archivos JSON mock:**

- ✅ Ubicar en `test/mocks/repositories/`
- ✅ Contener solo datos estructurados (raw data)
- ✅ Simular estructuras realistas para UI completa
- ❌ Nunca incluir strings de UI (botones, mensajes, etc.)

## Consecuencias

### Positivas

- **Consistencia:** Todas las llamadas a API siguen el mismo patrón
- **Mantenibilidad:** La lógica de API centralizada es más fácil de actualizar
- **Testabilidad:** Los repositories pueden mockearse fácilmente en tests
- **Seguridad de Tipos:** Soporte completo de TypeScript previene errores en tiempo de ejecución
- **Experiencia del Desarrollador:** Menos código boilerplate, gestión automática de estado
- **Manejo de Errores:** Manejo de errores consistente en toda la aplicación
- **Rendimiento:** Limpieza automática previene memory leaks
- **Desarrollo Sin Backend:** Los repositorios mock permiten desarrollar componentes completos sin depender de APIs externas, facilitando el desarrollo paralelo frontend/backend
- **Migración Fácil:** La transición de mock a API real es sencilla, solo requiere cambiar el cliente HTTP inyectado

### Negativas

- **Curva de Aprendizaje:** Los miembros del equipo necesitan aprender el patrón
- **Abstracción:** Capa adicional de abstracción (aunque beneficiosa)
- **Configuración Inicial:** Requiere crear clases repository para cada entidad

### Mitigación

- Documentación exhaustiva en este ADR
- Ejemplos de código y plantillas
- Proceso de revisión de código para asegurar cumplimiento del patrón
- Convenciones de nombres claras

## Testing

Los repositories pueden testearse fácilmente mockeando `HttpClient`:

```typescript
describe('CustomerRepository', () => {
  let repository: CustomerRepository;
  let httpMock: Partial<HttpClient>;

  beforeEach(() => {
    httpMock = createHttpClientMock();
    repository = new CustomerRepository(httpMock);
  });

  it('should load customer by id', async () => {
    const customer = { id: '123', name: 'John' };
    httpMock.get.mockReturnValue(of(customer));

    const resource = repository.find();
    const result = await resource.load('123');

    expect(result).toEqual(customer);
    expect(resource.value()).toBe(customer);
  });
});
```

## Referencias

- [Angular HttpClient](https://angular.dev/api/common/http/HttpClient)
- [Documentación de Signals](https://angular.dev/guide/signals)
- [ADR-001: Separación de Responsabilidades - Core, Shared y Features](./ADR-001-separation-of-responsibilities.md)
- [ADR-007: Patrón Manager para Coordinación de Flujos de Negocio](./ADR-007-manager-pattern.md)
- [ADR-008: Patrón de Mappers para Transformación de Datos](./ADR-008-mapper-pattern.md)
