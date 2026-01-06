# Guía para la Creación de DTOs

Este documento define las **reglas oficiales** para crear Data Transfer Objects (DTOs) en este proyecto.

Los DTOs forman parte de la **capa de contratos** y son la **fuente de verdad para la generación de código**.

---

## 1. Propósito de un DTO

Un DTO representa un **contrato de datos** entre límites del sistema (UI ↔ Aplicación, Aplicación ↔ API).

Un DTO:

* Describe la **forma de los datos**
* Es **inmutable por convención**
* No contiene **lógica de negocio**
* Es **independiente de frameworks de persistencia y UI**

---

## 2. Dónde viven los DTOs

Todos los DTOs deben almacenarse en:

```
/docs/contracts/dtos
```

Los DTOs **nunca** deben definirse dentro de:

* Specs de features
* Entidades de dominio
* Componentes de UI

---

## 3. Reglas de nomenclatura

### 3.1 Nombre del archivo

* Usar **kebab-case**
* Terminar con `.dto.md`

Ejemplo:

```
quotation.dto.md
quotation-item.dto.md
```

### 3.2 Nombre del DTO

* Usar **PascalCase**
* Terminar siempre con `DTO`

Ejemplo:

```
QuotationDTO
QuotationItemDTO
```

---

## 4. Estructura del DTO (Obligatoria)

Cada documento de DTO **debe** seguir esta estructura:

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

## 5. Reglas para los campos

### 5.1 Nombres de campos

* Usar **camelCase**
* Usar nombres **descriptivos y orientados al negocio**

Correcto:

* `clientId`
* `totalAmount`

Incorrecto:

* `client_id`
* `amt`

---

### 5.2 Tipos de campos

Tipos primitivos permitidos:

* `string`
* `number`
* `boolean`
* `decimal`
* `uuid`
* `date` (string ISO 8601)

Tipos compuestos:

* Otros DTOs
* Arreglos usando `[]`

Ejemplo:

```
items: QuotationItemDTO[]
```

---

### 5.3 Campos opcionales

* Los campos opcionales deben marcarse explícitamente

Ejemplo:

```
description?: string
```

---

## 6. Sección Constraints

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

## 7. Relación con las Specs

Los DTOs **no describen comportamiento**.

Las specs referencian DTOs, nunca al revés.

Ejemplo en una spec de feature:

```md
Uses:
- DTO: QuotationDTO
- Command: GenerateQuotation
```

---

## 8. Reglas de versionado

* Los DTOs son **append-only**
* Los campos no deben eliminarse ni renombrarse
* Los cambios incompatibles requieren un nuevo DTO

Ejemplo:

```
QuotationDTOv2
```

---

## 9. Compatibilidad con generación de código

Las definiciones de DTO deben ser:

* Determinísticas
* Parseables por máquina
* Libres de lenguaje ambiguo

Esto permite la generación automática de:

* Interfaces TypeScript
* Contratos de API
* Datos mock

---

## 10. Anti-patrones de DTO (Prohibidos)

* Lógica de negocio dentro de DTOs
* Campos relacionados con persistencia (por ejemplo `createdAt`, `updatedAt`, salvo que formen parte explícita del contrato)
* Campos solo para UI
* Tipos específicos de frameworks

---

## 11. Ejemplo

```md
DTO: QuotationDTO

Description:
Representación pública de una cotización.

Fields:
- id: uuid
- status: Draft | Confirmed
- subtotal: decimal
- tax: decimal
- total: decimal
- items: QuotationItemDTO[]

Constraints:
- Los valores monetarios usan precisión decimal fija
- La lista de ítems no puede estar vacía cuando el estado es Confirmed
```

---

## 12. Regla práctica

> Si un cambio afecta la generación de código, pertenece a un DTO.
> Si un cambio afecta el comportamiento, pertenece a una spec.
