## DTOs

### ProductStatus

`ProductStatus` es un contrato basado en **constantes**: solo son válidos los literales de cadena siguientes.

| Valor      | Significado |
| ---------- | ----------- |
| `active`   | Activo      |
| `inactive` | Inactivo    |
| `archived` | Archivado   |

En el cliente, modelarlo con una constante compartida (por ejemplo un objeto `const` con `as const`, o un tipo unión derivado), no con cadenas arbitrarias.

### Product

| Field         | Type              | Required | Notas                                                                                                              |
| ------------- | ----------------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `id`          | `string`          | sí       | UUID                                                                                                               |
| `code`        | `string`          | sí       | SKU (_Stock Keeping Unit_); único en dominio; el servidor es autoridad.                                            |
| `name`        | `string`          | sí       | Longitud máxima 60 caracteres en validación; único en dominio tras normalización (servidor).                       |
| `description` | `string` o `null` | no       | Texto libre opcional.                                                                                              |
| `price`       | `number`          | sí       | En **US-001** debe ser **> 0**; almacenar y mostrar con hasta 2 decimales.                                         |
| `currency`    | literal `"USD"`   | sí       | Fijo en el alcance actual; no editable por el usuario en la UI ni mutable en actualizaciones salvo como constante. |
| `status`      | `ProductStatus`   | sí       | Uno de los literales definidos en **ProductStatus** (`active`, `inactive`, `archived`).                            |

### CreateProductRequest

| Field         | Type              | Required | Notas                                                                                                                                                                            |
| ------------- | ----------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `code`        | `string`          | sí       | SKU; unicidad aplicada en el servidor.                                                                                                                                           |
| `name`        | `string`          | sí       | Máx. 60 caracteres; unicidad tras normalización (servidor).                                                                                                                      |
| `description` | `string` o `null` | no       |                                                                                                                                                                                  |
| `price`       | `number`          | sí       | En **US-001** debe ser **> 0**; precisión de hasta 2 decimales.                                                                                                                  |
| `status`      | `ProductStatus`   | no       | Si se omite, el valor por defecto es `active`. Debe ser uno de los literales de **ProductStatus**. Siguen aplicando las reglas por defecto del servidor para `currency` (`USD`). |

### UpdateProductRequest

| Field         | Type              | Required | Notas                                                                                                                                                                           |
| ------------- | ----------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`          | `string`          | sí       | UUID                                                                                                                                                                            |
| `code`        | `string`          | no       | SKU; si viene informado, debe respetar unicidad (servidor).                                                                                                                     |
| `name`        | `string`          | no       | Máx. 60 caracteres; unicidad tras normalización (servidor).                                                                                                                     |
| `description` | `string` o `null` | no       | Opcional: limpiar o actualizar.                                                                                                                                                 |
| `price`       | `number`          | no       | Si está presente, en **US-001** debe ser **> 0**; hasta 2 decimales.                                                                                                            |
| `status`      | `ProductStatus`   | no       | Transiciones permitidas según reglas de negocio; de `archived` a `active` o `inactive` con el mismo parche que otros cambios de estado (sin recurso separado de «desarchivar»). |

### ProductCollectionQuery

Parámetros de consulta para listar productos.

| Field / param | Type                                    | Required | Notas                                                                                                                                                                                                              |
| ------------- | --------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `status`      | `ProductStatus` o literal `operational` | no       | Filtro por estado: cualquier valor de **ProductStatus**, o `operational` (no archivados: `active` + `inactive`), alineado con la semántica del listado por defecto.                                                |
| `search`      | `string`                                | no       | Coincidencia opcional por subcadena (habitualmente _contains_ sin distinguir mayúsculas). En **US-001 (mock de cliente)** aplica **solo** sobre `name`, no sobre `code`; una API futura puede ampliar el contrato. |

Etiquetas de filtro en pantalla (español): **Todos** → operativo (`active` e `inactive`, excluir `archived`); **Activo** → `active`; **Inactivo** → `inactive`; **Archivado** → `archived`.

## Reglas de negocio

- **SKU (`code`):** Obligatorio en la creación; debe ser único en el catálogo a nivel de dominio; el servidor es autoridad en validación y en reglas de normalización más allá de la igualdad literal, si las hubiera.
- **Nombre:** longitud máxima 60 caracteres; único en dominio tras normalización en servidor (recortar espacios ASCII; colapsar espacios internos a uno solo; comparación sin distinguir mayúsculas; sin distinguir acentos). Dos nombres son duplicados si las formas normalizadas coinciden.
- **Descripción:** Opcional.
- **Precio:** Obligatorio en la creación; en **US-001** es **estrictamente positivo** (> 0), alineado con la historia de usuario; redondeo y presentación con hasta 2 decimales.
- **Moneda (`currency`):** Siempre `USD` en el alcance actual; no editable en la UI ni en payloads de actualización.
- **Eliminar:** Requiere confirmación explícita del usuario; el mensaje debe **incluir el nombre del producto** de forma identificable (redacción concreta e i18n negociable en UX).
- **Listado por defecto («Todos»):** Mostrar solo `active` e `inactive`; excluir `archived`. Los archivados solo aparecen con el filtro Archivado.
- **Errores:** Nombre normalizado duplicado → conflicto (por ejemplo `PRODUCT_NAME_CONFLICT`, HTTP 409); SKU duplicado → `PRODUCT_SKU_CONFLICT`, 409; validación de campos → `VALIDATION_ERROR`, 400; no encontrado → `NOT_FOUND`, 404.

---

## Endpoints

- `GET /products` — solicitud: `ProductCollectionQuery`; respuesta: `Product[]`.
- `GET /products/:id` — respuesta: `Product`.
- `POST /products` — solicitud: `CreateProductRequest`; respuesta: `Product`.
- `PUT /products/:id` — solicitud: `UpdateProductRequest`; respuesta: `Product`.
- `DELETE /products/:id`

---

## Comportamiento del repositorio mock

- Persistir una colección en memoria desde semilla JSON o vacía por defecto.
- Aplicar la misma semántica de filtros que `ProductCollectionQuery` / reglas de listado (incluida búsqueda **solo por `name`** cuando exista parámetro `search`, alineado con US-001).
- **Unicidad en mock (US-001):** ante creación o actualización persistida, rechazar con conflicto coherente con la API (p. ej. HTTP 409 y código `PRODUCT_SKU_CONFLICT` o `PRODUCT_NAME_CONFLICT` según convención del cliente) si:
  - otro producto ya tiene el mismo `code` tras **trim** de espacios (comparación literal de SKU); o
  - otro producto ya tiene el mismo **nombre normalizado** descrito en **Reglas de negocio** (misma lógica que servidor en esta entrega). En actualización, excluir el propio `id` de la comprobación.
- Rechazar persistencia si `price` no es **> 0** (validación acorde a US-001; p. ej. `VALIDATION_ERROR` / 400).
- Redondear `price` a 2 decimales al escribir y formatear de forma coherente al mostrar.

---

## Referencias

- [Glosario de producto — SKU](../glossary.md)
