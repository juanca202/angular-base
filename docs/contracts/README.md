# Guía para Contratos

Este documento define las **reglas oficiales** para crear contratos (DTOs) y documentar APIs REST en este proyecto.

Los contratos forman parte de la **capa de contratos** y son la **fuente de verdad para la generación de código**.

---

## Parte 1: Contratos (DTOs)

### 1. Propósito de un Contrato (DTO)

Un contrato (DTO) representa un **contrato de datos** entre límites del sistema (UI ↔ Aplicación, Aplicación ↔ API).

Un contrato:

* Describe la **forma de los datos**
* Es **inmutable por convención**
* No contiene **lógica de negocio**
* Es **independiente de frameworks de persistencia y UI**

---

### 2. Dónde viven los Contratos

Todos los contratos deben almacenarse en:

```
/docs/contracts/{dominio}/
```

Donde `{dominio}` es el dominio del negocio (ej: `requirements`, `customers`, `core`, `master`).

Los contratos **nunca** deben definirse dentro de:

* Specs de features
* Entidades de dominio
* Componentes de UI

---

### 3. Reglas de nomenclatura

#### 3.1 Nombre del archivo

* Usar **kebab-case**
* Debe ser un archivo **markdown** (`.md`)

Ejemplo:

```
entity.md
user-profile.md
requirement-item.md
```

#### 3.2 Nombre del Contrato

* Usar **PascalCase**
* **No** incluir el sufijo `DTO`

Ejemplo:

```
Entity
UserProfile
RequirementItem
```

---

### 4. Estructura del Contrato (Obligatoria)

Cada documento de contrato **debe** seguir esta estructura:

```md
DTO: <Nombre>

Description:
<Descripción corta y clara del contrato de datos>

Fields:
- <nombreCampo>: <tipo> <modificadores opcionales>

Constraints:
- <restricción de negocio o técnica>
```

---

### 5. Reglas para los campos

#### 5.1 Nombres de campos

* Usar **camelCase**
* Usar nombres **descriptivos y orientados al negocio**

Correcto:

* `clientId`
* `totalAmount`

Incorrecto:

* `client_id`
* `amt`

---

#### 5.2 Tipos de campos

Tipos primitivos permitidos:

* `string`
* `number`
* `boolean`
* `decimal`
* `uuid`
* `date` (string ISO 8601)

Tipos compuestos:

* Otros contratos
* Arreglos usando `[]`

Ejemplo:

```
items: EntityItem[]
```

---

#### 5.3 Campos opcionales

* Los campos opcionales deben marcarse explícitamente

Ejemplo:

```
description?: string
```

---

### 6. Sección Constraints

La sección `Constraints` es **obligatoria**.

Las restricciones:

* Describen reglas de validación
* No deben referenciar detalles de implementación
* Deben ser determinísticas y testeables

Correcto:

* Los valores monetarios usan precisión decimal fija
* La lista de ítems no puede estar vacía cuando el estado es Confirmed

Incorrecto:

* El valor se valida en la UI
* Se almacena en la base de datos como DECIMAL(10,2)

---

### 7. Relación con las Specs

Los contratos **no describen comportamiento** y **no se incluyen en los specs**.

Las specs **solo referencian** contratos desde `docs/contracts/{dominio}/`, nunca los incluyen directamente.

**IMPORTANTE:**
- Los contratos viven únicamente en `docs/contracts/{dominio}/`
- Los specs NO deben tener carpetas `contracts/` ni archivos `api-contracts.md`
- Los specs solo referencian los contratos existentes

Ejemplo en una spec de feature:

```md
Uses:
- DTO: Entity (definido en `docs/contracts/core/entity.md`)
- Command: CreateEntity
```

---

### 8. Compatibilidad con generación de código

Las definiciones de contratos deben ser:

* Determinísticas
* Parseables por máquina
* Libres de lenguaje ambiguo

Esto permite la generación automática de:

* Interfaces TypeScript
* Contratos de API
* Datos mock

---

### 9. Anti-patrones de Contratos (Prohibidos)

* Lógica de negocio dentro de contratos
* Campos relacionados con persistencia (por ejemplo `createdAt`, `updatedAt`, salvo que formen parte explícita del contrato)
* Campos solo para UI
* Tipos específicos de frameworks

---

### 10. Ejemplo de Contrato

```md
DTO: Entity

Description:
Representación pública de una entidad del sistema.

Fields:
- id: uuid
- name: string
- status: Draft | Active | Archived
- createdAt: date
- updatedAt: date
- items: EntityItem[]
- owner: User

Constraints:
- El nombre es obligatorio
- El estado debe estar definido
- La lista de ítems puede estar vacía
- El propietario debe estar definido
```

---

## Parte 2: APIs REST

Para contratos que tienen APIs REST asociadas, después de la sección `Constraints`, agregar una sección `API` con la siguiente estructura:

### 11. Estructura de API REST

```md
DTO: <Nombre>

Description:
<Descripción corta y clara del contrato de datos>

Fields:
- <nombreCampo>: <tipo> <modificadores opcionales>

Constraints:
- <restricción de negocio o técnica>

API:
- GET <path> - Descripción breve
- POST <path> - Descripción breve
- PUT <path> - Descripción breve
- DELETE <path> - Descripción breve
```

---

### 12. Convenciones de Rutas

#### 12.1 NO incluir `/api/v1/` en las rutas

**IMPORTANTE:** El prefijo `/api/v1/` se resuelve automáticamente por la función `getApiUrl()` desde `environment.restEndpoint`. Solo documentar el nombre del recurso.

```markdown
# ✅ Correcto
- GET entities
- GET entities/:id
- POST entities

# ❌ Incorrecto
- GET /api/v1/entities
- GET /api/v1/entities/:id
- POST /api/v1/entities
```

**Implementación en Repository:**
```typescript
@Injectable({ providedIn: 'root' })
export class EntityRepository {
  private readonly baseUrl = getApiUrl('entities');
  // getApiUrl() resuelve: `${environment.restEndpoint}/entities`
  // Si restEndpoint = 'https://api.example.com/api/v1'
  // Entonces: 'https://api.example.com/api/v1/entities'
}
```

---

#### 12.2 NO usar rutas con subrecursos anidados

**IMPORTANTE:** Asumir que todos los recursos son independientes. En lugar de rutas con subrecursos anidados, usar recursos independientes con query parameters para filtrar.

```markdown
# ✅ Correcto - recursos independientes con query params
- GET children?parentId=:parentId
- POST children (con parentId en el body)
- DELETE children/:id

# ❌ Incorrecto - subrecursos anidados
- GET /api/v1/parent-resource/:parentId/child-resource
- POST /api/v1/parent-resource/:parentId/child-resource
- DELETE /api/v1/parent-resource/:parentId/child-resource/:childId
```

**Implementación en Repository:**
```typescript
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
  
  // Para crear, incluir parentId en el body
  public mutations() {
    return getMutations({
      create: (child: ChildRequest) =>
        this.httpClient.post<Child>(this.baseUrl, child)
    });
  }
}
```

---

### 13. Métodos HTTP

Documentar los métodos HTTP disponibles para el recurso:

```markdown
API:
- GET entities - Lista todas las entidades
- GET entities/:id - Obtiene una entidad por ID
- POST entities - Crea una nueva entidad
- PUT entities/:id - Actualiza una entidad existente
- DELETE entities/:id - Elimina una entidad
```

---

### 14. DTO de Request

Para operaciones POST, PUT y PATCH, definir el DTO de request. Puede ser el mismo contrato o uno específico:

**Opción 1: Usar el mismo contrato (si todos los campos son opcionales o se omiten algunos)**

```markdown
API:
- POST entities - Crea una nueva entidad
  Request: Entity (sin id, createdAt, updatedAt)
```

**Opción 2: Crear un contrato específico de Request**

```markdown
API:
- POST entities - Crea una nueva entidad
  Request: EntityCreateRequest
```

Y crear un archivo separado `entity-create-request.md`:

```md
DTO: EntityCreateRequest

Description:
Contrato para crear una nueva entidad.

Fields:
- name: string
- status: Draft | Active
- items: EntityItem[]

Constraints:
- El nombre es obligatorio
- El estado debe estar definido
```

---

### 15. Ejemplo Completo de Contrato con API REST

```md
DTO: Requirement

Description:
Representación de una solicitud de producción.

Fields:
- id: number
- name: string
- customer: Customer
- status: ItemCatalog
- entryDate: date
- startDate: date
- dueDate: date
- createdAt: date
- updatedAt: date

Constraints:
- El nombre es obligatorio
- El cliente debe estar definido
- La fecha de entrada debe ser anterior o igual a la fecha de inicio
- La fecha de inicio debe ser anterior o igual a la fecha de vencimiento

API:
- GET requirements - Lista todas las requirements
- GET requirements/:id - Obtiene una requirement por ID
- POST requirements - Crea una nueva requirement
  Request: RequirementCreateRequest
- PUT requirements/:id - Actualiza una requirement existente
  Request: RequirementUpdateRequest
- DELETE requirements/:id - Elimina una requirement
```

---

### 16. Relación con Repositories

Los contratos con APIs REST deben ser implementados usando el patrón Repository (ver ADR-006):

* Cada recurso documentado debe tener un método correspondiente en el Repository
* Los Repositories usan `getApiUrl()` para construir las URLs
* Los Repositories usan `getResource()` para operaciones GET
* Los Repositories usan `getMutations()` para operaciones POST, PUT, DELETE

---

## Regla Práctica

> Si un cambio afecta la generación de código, pertenece a un contrato.
> Si un cambio afecta el comportamiento, pertenece a una spec.

---

## Referencias

- [ADR-006: Patrón Repository para Servicios REST](../adr/ADR-006-repository-pattern-rest.md)
