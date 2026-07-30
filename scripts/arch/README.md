# Validaciones de arquitectura (fitness functions)

Este directorio agrupa las **fitness functions** de arquitectura del proyecto:
chequeos automatizados que validan que el código respeta los **criterios de
cumplimiento** (`CR-XXX`) de los estándares de dominio (`docs/standards/`). Cada CR
(p. ej. «dirección de dependencias entre capas» dentro del estándar *Architecture
Standards*) es una regla verificable; los ADR (`docs/adr/`) registran la decisión
que lo fijó.

Los scripts se escriben en el **lenguaje del stack del repositorio**: Node
(`.mjs`), ya que este es un proyecto Angular.

## Estructura

```
scripts/arch/
├── verify.mjs              # Runner: ejecuta las validaciones (todas, o las del estándar indicado)
└── checks/
    ├── architecture.mjs    # UN archivo por ESTÁNDAR (nombre = slug del estándar)
    ├── coding-style.mjs
    ├── devops.mjs
    ├── frontend.mjs
    └── testing.mjs
```

- **`verify.mjs`** — punto de entrada único. Descubre los `checks/<slug>.mjs` por
  convención (no se edita al añadir validaciones), ejecuta **todos los estándares
  por defecto** o solo los indicados por argumento, reenvía la salida de cada
  check, imprime un resumen (criterios PASS/WARN/FAIL) y sale con código distinto
  de 0 solo si algún check reportó un CR **bloqueante** violado.
- **`checks/<slug-estándar>.mjs`** — las fitness functions de **un estándar**
  completo: un chequeo por cada CR automatizable, cada uno con su referencia
  `CR-XXX` (trazabilidad en la línea de salida y en comentarios). El **Enfoque**
  de cada CR se implementa dentro del script: un chequeo `bloqueante` que falla
  produce `FAIL` y hace salir el script con código ≠ 0; uno `warning` produce
  `WARN` sin cambiar el código de salida. Cada chequeo invoca la herramienta real
  (dependency-cruiser, ESLint, runner del framework…) — no duplica su lógica.

## Contrato

1. El check de un estándar imprime **una línea de protocolo por criterio**:
   `PASS|FAIL|WARN <slug-estándar>/CR-XXX — <detalle corto>`.
2. El check sale con código `0` si ningún CR bloqueante falló; `≠ 0` si alguno falló.
3. El runner ejecuta cada check como subproceso, cuenta las líneas de protocolo
   para el resumen y sale `≠ 0` solo si algún check salió `≠ 0`.
4. Un slug pedido por argumento que no tiene check registrado es un error (`≠ 0`).

## Ejecutar las validaciones

Todos los estándares:

```bash
node scripts/arch/verify.mjs
```

Solo un estándar:

```bash
node scripts/arch/verify.mjs architecture
```

O, mediante el atajo cableado en `package.json`:

```bash
npm run arch
```

## Añadir una validación

El skill `arch-manage` registra cada fitness function aprobada en el archivo de
su estándar (`checks/<slug-estándar>.mjs`). Manualmente: si el archivo del
estándar ya existe, añade dentro un bloque
`check('CR-XXX', 'bloqueante' | 'warning', '…', () => { … })` con su comentario
de trazabilidad; si no existe, créalo siguiendo el mismo contrato que
`checks/architecture.mjs` y reemplaza los chequeos de ejemplo por los reales.
