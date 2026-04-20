# AGENTS.md — Guía para el agente de IA

Documento operativo para generar código **funcional, mantenible y eficiente** en este repositorio. Ante conflicto entre este archivo y un **ADR** aprobado, prevalece el **ADR**.

---

## 1. Rol

Eres experto en **TypeScript** y **Angular**. Priorizas código claro, tipado estricto, patrones del proyecto y cumplimiento de **ADRs** (`docs/adr/`). No inventes APIs: confirma versiones y, si hace falta, documentación vía **Angular CLI MCP**.

---

## 2. Orden de trabajo recomendado

1. **Versiones:** revisa `package.json` y `tsconfig.json` / `tsconfig.app.json` (Angular, TypeScript, etc.). El código debe ser válido para **esas** versiones.
2. **Alcance:** identifica la capa y el feature (`src/app/core`, `shared`, `cross`, `features/...`) según **ADR-001**.
3. **Contexto:** lee archivos vecinos y, si aplica, plantillas en `features/templates` para copiar estilo y nombres.
4. **Cambio mínimo:** solo lo necesario para la tarea; evita refactors colaterales.
5. **Cierre:** comportamiento coherente con tests existentes; añade o ajusta tests según **ADR-015** cuando toque lógica pública o regresiones probables.

**`docs/MEMORY.md`:** si necesitas una definición, flag o preferencia **específica de este repositorio** que no esté en ADRs ni deducible del código, **revisa primero** ese archivo para no tener que consultar al usuario cuando ya esté documentado. Si falta algo imprescindible, pregunta o amplía `docs/MEMORY.md` cuando corresponda.

---

## 3. TypeScript

- Modo estricto del proyecto; evita `any` (usa tipos concretos o `unknown` y estrecha).
- Convenciones de acceso y `readonly`: **ADR-003**.
- Nombres y comentarios orientados al mantenimiento; comentarios en **inglés** (ver sección 8).

---

## 4. Angular — prácticas obligatorias (resumen)

Alineado con **ADR-002** y el código existente:

| Área                         | Qué hacer                                                                                                                                                                    |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Componentes**              | Pequeños, una responsabilidad; **standalone** es el predeterminado del stack: **no** añadas `standalone: true` en el decorador salvo que el repo ya lo exija en ese archivo. |
| **API**                      | `input()` / `output()` en lugar de `@Input` / `@Output`; `inject()` en lugar de constructor injection en código nuevo.                                                       |
| **Detección de cambios**     | `ChangeDetectionStrategy.OnPush` en componentes.                                                                                                                             |
| **Plantillas**               | Control flow nativo (`@if`, `@for`, `@switch`); **no** `*ngIf` / `*ngFor` / `*ngSwitch`. **No** flechas ni lógica pesada en plantillas.                                      |
| **Estilos**                  | **No** `ngClass` / `ngStyle`: enlaces `class` / `style`.                                                                                                                     |
| **Forms**                    | Preferir enfoque reactivo y estrategia del proyecto: **ADR-009**, layout **ADR-010**.                                                                                        |
| **Estado local**             | Señales (`signal`, `computed`, `update` / `set`; **no** `mutate`).                                                                                                           |
| **Servicios**                | `providedIn: 'root'` cuando sea singleton adecuado.                                                                                                                          |
| **Host**                     | **No** `@HostBinding` / `@HostListener`: usar la propiedad `host` del `@Component` / `@Directive`.                                                                           |
| **Imágenes estáticas**       | `NgOptimizedImage` cuando aplique (no para inline base64).                                                                                                                   |
| **Observables en plantilla** | `async` pipe cuando corresponda.                                                                                                                                             |

---

## 5. Arquitectura y patrones por tipo de tarea

- **Capas y dependencias:** **ADR-001** (no invertir el grafo: features no deben convertirse en basura de dependencias incorrectas).
- **Datos HTTP / REST:** **ADR-006** (repositorios, mocks, convenciones de rutas).
- **Coordinación de flujos:** **ADR-007**; maestro–detalle y diálogos: **ADR-013**.
- **DTO / API ↔ dominio:** **ADR-008** (mappers) cuando el proyecto ya los use en ese feature.
- **UI interna (Factor / tokens / iconos):** **ADR-004**, **ADR-005**, **ADR-012**.
- **Notificaciones al usuario:** **ADR-018** (`notify`, `notifyError`, etc.).
- **Calidad y herramientas:** **ADR-011**; **tests:** **ADR-015**.

Si la tarea es solo presentación en un feature existente, **reutiliza** servicios, modelos y repositorios ya definidos antes de crear abstracciones nuevas.

---

## 6. UI y accesibilidad

- Cumplir **WCAG 2.1 AA** y comprobaciones **Axe** donde aplique: contraste, foco, nombres accesibles, ARIA cuando sea necesario.
- Reutilizar componentes de biblioteca acordes a **ADR-004** en lugar de duplicar patrones visuales.

---

## 7. Angular CLI MCP (versiones y dudas)

Úsalo cuando no estés seguro de una API o patrón **para la versión de Angular de este repo**:

- `list_projects` → ruta del workspace.
- `get_best_practices` → con `workspacePath` del proyecto.
- `search_documentation` / `find_examples` → para dudas concretas.

**Prioriza** salida del MCP y del código del repo sobre recuerdos genéricos de otras versiones.

---

## 8. Idioma, localización y texto

**Usuario (UI visible):** idioma de redacción según **`environment.defaultLocale`** en `src/environments/environment.ts`. Si cambia ese valor, el texto nuevo debe alinearse.

**Desarrollador (código):** comentarios, nombres de símbolos, mensajes de commit, descripciones de tests, documentación técnica y logs **técnicos** en **inglés**.

**Gate i18n:**

1. Lee `docs/MEMORY.md` → clave `internationalization: true | false`.
2. Si **falta** o no es booleano válido: **antes** de editar componentes o textos de UI, pregunta: _«¿Este proyecto requiere internacionalización?»_ y guarda en `docs/MEMORY.md` la línea `internationalization: true` o `internationalization: false`.
3. Si **`true`:** cadenas de usuario según **ADR-014** (`$localize`, extracción, archivos en `public/i18n/`, etc.), manteniendo el idioma de autoría acorde a `defaultLocale` salvo que ADR-014 o los locales definan otro flujo.
4. Si **`false`:** UI puede ir en literales según `defaultLocale` sin pipeline i18n completo.

Mensajes de error, notificaciones y textos de datos/config **que vea el usuario** siguen **`defaultLocale`** o recursos i18n del locale activo.

---

## 9. Features nuevos

- Partir de **`features/templates`** (componentes, manager, repository, model, context, rutas) y adaptar al dominio.
- **Sin excepciones silenciosas a ADRs:** si hace falta desviarse, propón **ADR nuevo** y aprobación antes de implementar.

---

## 10. Checklist rápido antes de dar por terminada la tarea

- [ ] Imports y rutas coherentes con el árbol del proyecto (`@/...` si es la convención usada en el archivo).
- [ ] Sin dependencias prohibidas entre capas (**ADR-001**).
- [ ] Componentes presentacionales; lógica compleja en servicios / managers según patrón del feature.
- [ ] Sin APIs deprecadas respecto a las versiones del `package.json`.
- [ ] i18n y texto acorde a sección 8.
- [ ] Tests actualizados o añadidos si el comportamiento público cambia (**ADR-015**).

---

## 11. Índice de ADRs (referencia)

Detalle normativo en `docs/adr/README.md`. Flujo resumido también en `.ai/skills/abp-code-context/SKILL.md`.
