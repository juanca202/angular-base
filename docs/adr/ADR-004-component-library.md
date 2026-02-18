# ADR-004: Biblioteca de Componentes

**Estado:** Aceptado  
**Fecha de Creación:** 15/02/2026  
**Última Actualización:** 15/02/2026  
**Decisores:** Equipo de Arquitectura

## Contexto

Las aplicaciones Angular requieren componentes de interfaz de usuario para construir formularios, botones, diálogos, tablas y otros elementos interactivos. Sin una decisión explícita sobre la biblioteca de componentes:

- Los desarrolladores pueden usar elementos HTML nativos (`<input>`, `<button>`, `<select>`) de forma inconsistente
- Se pueden introducir múltiples bibliotecas de terceros sin criterio claro
- La experiencia de usuario y la consistencia visual se ven afectadas
- El mantenimiento se complica con dependencias fragmentadas
- La accesibilidad y el comportamiento pueden variar entre componentes

Necesitamos una estrategia clara que:

- Establezca una biblioteca de componentes base prioritaria
- Defina cuándo usar componentes nativos
- Establezca criterios para la adopción de componentes de terceros
- Mantenga consistencia visual y de comportamiento en toda la aplicación

## Decisión

Usaremos **[Angular Material](https://material.angular.dev/)** como la biblioteca de componentes base del proyecto. Los componentes de Angular Material deben utilizarse **prioritariamente** sobre los elementos HTML nativos, salvo que exista una necesidad particular que lo justifique. Solo cuando Angular Material no ofrezca ningún componente que cubra la funcionalidad requerida, se podrá evaluar el uso de componentes de terceros.

### Jerarquía de selección de componentes

1. **Primera opción:** Componentes de Angular Material
2. **Segunda opción:** Elementos HTML nativos (solo cuando haya una necesidad particular)
3. **Tercera opción:** Componentes de bibliotecas de terceros (solo cuando Material no cubra la funcionalidad)

## Implementación

### Uso prioritario de Angular Material

Los componentes de Angular Material deben usarse para todas las necesidades de UI estándar:

- **Formularios:** `mat-form-field`, `mat-input`, `mat-select`, `mat-checkbox`, `mat-radio-group`, `mat-slide-toggle`
- **Botones:** `mat-button`, `mat-flat-button`, `mat-raised-button`, `mat-icon-button`, `mat-fab`
- **Navegación:** `mat-toolbar`, `mat-sidenav`, `mat-tabs`, `mat-menu`
- **Feedback:** `mat-dialog`, `mat-snack-bar`, `mat-progress-bar`, `mat-spinner`
- **Datos:** `mat-table`, `mat-paginator`, `mat-card`, `mat-list`
- **Otros:** `mat-tooltip`, `mat-chip`, `mat-divider`, `mat-expansion-panel`

```html
<!-- ✅ Correcto - Usando Angular Material -->
<mat-form-field>
  <mat-label i18n>Email</mat-label>
  <input matInput type="email" [formControl]="emailControl" />
  <mat-error>{{ emailControl | errorMessage }}</mat-error>
</mat-form-field>
<button mat-flat-button color="primary" type="submit" i18n>Enviar</button>

<!-- ❌ Evitar - Elementos nativos cuando Material cubre el caso -->
<input type="email" placeholder="Email" />
<button type="submit">Enviar</button>
```

### Excepciones: uso de elementos nativos

Se permite el uso de elementos HTML nativos cuando exista una **necesidad particular** que lo justifique, por ejemplo:

- Requisitos de rendimiento extremos en listas muy largas
- Integración con APIs del navegador que requieran elementos nativos específicos
- Casos de uso muy especializados donde el componente Material añadiría complejidad innecesaria
- Prototipado rápido o páginas internas de administración con requisitos mínimos de UI

En estos casos, la decisión debe documentarse (comentario en código o en la revisión de PR).

### Uso de componentes de terceros

Solo cuando **Angular Material no ofrezca** un componente que cubra la funcionalidad requerida, se puede evaluar una biblioteca de terceros. Ejemplos de casos donde podría considerarse:

- Editores de texto enriquecido (WYSIWYG)
- Componentes de gráficos o visualización de datos complejos
- Selectores de fecha/hora con requisitos muy específicos no cubiertos por `mat-datepicker`
- Componentes de arrastrar y soltar avanzados
- Otros componentes especializados no presentes en el catálogo de Material

**Antes de añadir una dependencia de terceros:**

1. Verificar que no exista un componente equivalente en [Angular Material](https://material.angular.dev/components)
2. Evaluar la mantenibilidad, licencia y compatibilidad con Angular
3. Documentar la decisión y el motivo en el PR
4. Considerar crear un wrapper que mantenga la consistencia con el resto de la aplicación

## Consecuencias

### Positivas

- **Consistencia visual:** Toda la aplicación sigue el sistema de diseño Material Design
- **Accesibilidad:** Los componentes de Material incluyen soporte ARIA y buenas prácticas de accesibilidad
- **Mantenimiento:** Una única biblioteca principal reduce la superficie de actualización
- **Integración:** Material está diseñado para Angular y se integra con el ecosistema (formularios, CDK, etc.)
- **Documentación:** Amplia documentación oficial y comunidad activa

### Negativas

- **Flexibilidad limitada:** Algunos diseños muy personalizados pueden requerir esfuerzo adicional
- **Tamaño del bundle:** Incluir Material añade peso; mitigar con imports por módulo y tree-shaking
- **Dependencia:** Cambios en Material pueden afectar la aplicación; seguir las guías de migración

### Neutras

- Los ADRs existentes (ADR-007, ADR-009, ADR-013) ya asumen el uso de Angular Material; este ADR formaliza y amplía esa decisión

## Referencias

- [Angular Material - Component Library](https://material.angular.dev/)
- [Angular Material Components](https://material.angular.dev/components)
- [ADR-009: Estrategia de Formularios](./ADR-009-form-strategy.md)
- [ADR-010: Layout y Estructura de Formularios](./ADR-010-form-layout-structure.md)
- [ADR-013: Uso de Diálogos para Interacciones Maestro–Detalle](./ADR-013-dialog-master-detail.md)
