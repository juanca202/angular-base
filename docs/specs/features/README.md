# Convención para Documentación de Features (FEAT)

Este documento define la **plantilla oficial** y las reglas para documentar un feature dentro del proyecto.

El objetivo es que cada archivo de feature sea:

* ✅ **Autoexplicativo**
* ✅ **No ambiguo**
* ✅ **Listo para implementación directa** (por humanos o por Agentes de IA)
* ✅ **Consistente entre features**

---

## 1. Ubicación y Nomenclatura

Cada feature debe documentarse en:

```
docs/specs/features/{NNN}-{feature-name}.md
```

Ejemplo:

```
docs/specs/features/001-contact-manager.md
```

* `NNN`: número incremental del feature
* `feature-name`: nombre en kebab-case, descriptivo y corto

---

## 2. Estructura Obligatoria del Documento

Todo feature **DEBE** seguir esta estructura, en este orden.

---

## FEAT-{NNN} · Nombre del Feature

Breve descripción del feature en una o dos frases.
Debe responder: **¿qué problema resuelve este feature?**

---

## FR-1. Visión General

Descripción funcional de alto nivel:

* Qué hace el feature
* Para quién es
* En qué contexto se usa

❗ No incluir detalles técnicos.

---

## FR-2. Alcance

### Incluye

Lista explícita de funcionalidades incluidas.

### Excluye

Lista explícita de lo que **NO** forma parte del feature.

Esto evita suposiciones durante la implementación.

---

## FR-3. Historias de Usuario

Definir las historias necesarias para cubrir el feature.

Formato recomendado:

```
### HU-XXX: Título corto
Como <rol>, quiero <acción> para <beneficio>.
```

Las historias deben ser:

* Claras
* Atómicas
* Orientadas a comportamiento

---

## FR-4. Pantallas / Flujos

Describir todas las pantallas y flujos de interacción.

Para cada pantalla:

* Nombre
* Secciones
* Acciones disponibles
* Flujos paso a paso cuando aplique

Ejemplo de subtítulos:

* Listado
* Detalle
* Creación
* Edición

---

## FR-5. Reglas Funcionales

Reglas de negocio explícitas que afectan el comportamiento del feature.

Ejemplos:

* Qué acciones están permitidas
* Qué combinaciones no son válidas
* Qué decisiones ya están tomadas

❗ No dejar reglas implícitas.

---

## TR-1. Modelos de Dominio

Definir **todas las entidades del dominio** del feature.

Requisitos:

* Usar TypeScript
* Tipos estrictos
* Sin lógica

Ejemplo:

```ts
export interface Entity {
  id: string;
}
```

---

## TR-2. Modelos Orientados a UI

Modelos derivados o adaptados para presentación.

Ejemplos:

* Items de listado
* ViewModels
* DTOs de pantalla

Estos modelos pueden duplicar datos del dominio si mejora la claridad.

---

## TR-3. Contratos de Repositorio

Definir las interfaces que representan el acceso a datos.

Requisitos:

* Interfaces puras
* Sin implementación
* Sin detalles de infraestructura

Ejemplo:

```ts
export interface EntityRepository {
  getAll(): Promise<Entity[]>;
  getById(id: string): Promise<Entity>;
  create(payload: CreateEntity): Promise<Entity>;
  update(id: string, payload: UpdateEntity): Promise<Entity>;
  delete(id: string): Promise<void>;
}
```

---

## TR-4. Reglas de Dominio

Reglas técnicas que **NO deben inferirse**:

* Restricciones
* Invariantes
* Comportamientos obligatorios

Ejemplos:

* No se permiten duplicados
* No se permiten referencias circulares
* El estado inicial siempre es X

---

## 3. Reglas Importantes

### 3.1 Qué NO debe incluir un FEAT

❌ Requisitos no funcionales globales
❌ Decisiones de arquitectura
❌ Preguntas abiertas
❌ Suposiciones implícitas
❌ Referencias a implementación concreta (HTTP, IndexedDB, etc.)

Todo lo anterior pertenece a:

* ADR
* Documentación de arquitectura

---

### 3.2 Qué SÍ debe incluir

✅ Decisiones cerradas
✅ Reglas explícitas
✅ Modelos completos
✅ Contratos claros

Un FEAT debe poder implementarse **sin hacer preguntas adicionales**.

---

## 4. Criterio de Calidad

Un feature está bien documentado si:

* El agente de IA puede implementarlo sin ambigüedad
* Dos desarrolladores distintos lo implementarían igual
* No depende de conocimiento tribal

Si alguna decisión no está escrita, **el documento está incompleto**.

---

## 5. Ejemplo de Uso

* Crear el archivo siguiendo esta plantilla
* Completar cada sección
* Validar que no existan preguntas abiertas
* Usar el documento como fuente única de verdad

---

## 6. Plantilla de feature

````md
# FEAT-<NNN> · <Nombre del Feature>

<Descripción breve del feature. Qué problema resuelve y para quién.>

---

## FR-1. Visión General

<Descripción funcional de alto nivel del feature.>

---

## FR-2. Alcance

### Incluye
- <Funcionalidad incluida 1>
- <Funcionalidad incluida 2>

### Excluye
- <Funcionalidad excluida 1>
- <Funcionalidad excluida 2>

---

## FR-3. Historias de Usuario

### HU-<NNN>: <Título corto>
Como <rol>, quiero <acción> para <beneficio>.

### HU-<NNN>: <Título corto>
Como <rol>, quiero <acción> para <beneficio>.

---

## FR-4. Pantallas / Flujos

### <Nombre de la pantalla>

- Descripción general
- Secciones:
  - <Sección 1>
  - <Sección 2>
- Acciones:
  - <Acción 1>
  - <Acción 2>

#### Flujo principal
1. <Paso 1>
2. <Paso 2>
3. <Paso 3>

---

## FR-5. Reglas Funcionales

- <Regla funcional explícita 1>
- <Regla funcional explícita 2>

---

## TR-1. Modelos de Dominio

## TR-2. Modelos Orientados a UI

## TR-3. Contratos de Repositorio

## TR-4. Reglas de Dominio

- <Regla de dominio 1>
- <Regla de dominio 2>

````