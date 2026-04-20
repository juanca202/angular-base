# ADR-013: Uso de Diálogos para Interacciones Maestro–Detalle

**Estado:** Aceptado  
**Fecha de Creación:** 06/01/2026  
**Última Actualización:** 20/04/2026  
**Decisores:** Equipo de Arquitectura

## Contexto

La aplicación utiliza **diálogos** como mecanismo principal de interacción para implementar el patrón **maestro–detalle**, permitiendo a los usuarios visualizar o editar el detalle de una entidad **sin perder el contexto** de la pantalla anterior.

Los diálogos **no deben ser invocados directamente desde componentes o controladores de features**. En su lugar, se abren a través de **manejadores de entidades** (_entity managers_), los cuales centralizan la lógica de navegación e interacción asociada a una entidad del dominio.

Un ejemplo típico de estos manejadores es:

- `managers/entity-manager.ts`

Este enfoque evita el acoplamiento entre componentes de UI y la implementación concreta de los diálogos, y refuerza una arquitectura más mantenible y coherente.

Para garantizar consistencia visual, buena experiencia de usuario y comportamientos predecibles, el proyecto define **tres tipos estándar de diálogos**, cada uno orientado a distintos niveles de complejidad y necesidades de espacio.

## Decisión

Se estandariza el uso de diálogos en **tres variantes**, implementadas mediante combinaciones predefinidas de `panelClass` y reglas claras de layout.

Todos los diálogos:

- Siguen el patrón maestro–detalle
- Deben abrirse exclusivamente desde manejadores de entidades
- Utilizan `MatDialog` de Angular Material
- Deben configurarse explícitamente (tamaño, posición y clases)

### 1. Diálogo Simple (`ft-dialog`)

**Propósito**
Usado para interacciones ligeras, como:

- Formularios pequeños
- Ediciones rápidas
- Vistas de detalle compactas

**Características**

- Ancho y alto limitados
- No requiere scroll complejo
- Interrupción mínima del flujo del usuario

**Guías de uso**

- Evitar contenido extenso
- No usar navegación anidada
- Opción preferida por defecto

---

### 2. Diálogo Apilado (`ft-dialog ft-dialog--stacked`)

**Propósito**
Usado para mostrar información detallada o formularios que pueden requerir scroll, manteniendo visible el contexto previo.

**Características**

- Se despliega lateralmente desde la derecha
- Más ancho y alto que el diálogo simple
- Soporta scroll vertical
- Ideal para vistas de detalle en flujos maestro–detalle

**Guías de uso**

- Usar para vistas de detalle de entidades
- Usar cuando el contenido excede los límites de un diálogo simple
- Preferible frente al diálogo completo cuando se desea preservar el contexto

---

### 3. Diálogo Completo (`ft-dialog ft-dialog--full`)

**Propósito**
Usado cuando se necesita un espacio amplio de visualización, manteniendo el comportamiento conceptual de un diálogo en lugar de un cambio de ruta.

**Características**

- Ocupa todo el viewport
- Mantiene el contexto de la pantalla subyacente
- Adecuado para flujos complejos o visualizaciones extensas

**Guías de uso**

- Usar de forma excepcional
- Usar solo cuando el diálogo apilado no sea suficiente
- No utilizar como sustituto sistemático del enrutamiento

---

## Implementación

Los diálogos se abren exclusivamente desde **manejadores de entidades** (por ejemplo, `managers/entity-manager.ts`).

Los componentes **no deben** inyectar ni usar directamente `MatDialog`.

### Ejemplo

```typescript
public open(requirementItemId: number): void {
  const config = {
    data: {
      id: requirementItemId
    },
    panelClass: ['ft-dialog', 'ft-dialog--stacked'],
    height: '100vh',
    width: '600px',
    position: {
      left: 'auto',
      right: '0'
    }
  };

  this.dialog.open(RequirementItemDetailComponent, config);
}
```

### Mejores Prácticas

#### 1. Abrir Diálogos desde Manejadores de Entidades

```typescript
// ✅ Correcto - desde un manejador de entidades
@Injectable({ providedIn: 'root' })
export class RequirementItemManager {
  private dialog = inject(MatDialog);

  public open(requirementItemId: number): void {
    const config = {
      data: { id: requirementItemId },
      panelClass: ['ft-dialog', 'ft-dialog--stacked'],
      height: '100vh',
      width: '600px',
      position: { left: 'auto', right: '0' }
    };
    this.dialog.open(RequirementItemDetailComponent, config);
  }
}

// ❌ Incorrecto - desde un componente directamente
@Component({...})
export class RequirementListComponent {
  private dialog = inject(MatDialog); // ❌ No inyectar MatDialog en componentes

  openDetail(id: number) {
    this.dialog.open(...); // ❌ No abrir diálogos desde componentes
  }
}
```

#### 2. Usar las Clases Estándar de Panel

```typescript
// ✅ Correcto - diálogo simple
panelClass: ['ft-dialog'];

// ✅ Correcto - diálogo apilado
panelClass: ['ft-dialog', 'ft-dialog--stacked'];

// ✅ Correcto - diálogo completo
panelClass: ['ft-dialog', 'ft-dialog--full'];

// ❌ Incorrecto - clases personalizadas sin justificación
panelClass: ['custom-dialog', 'my-special-class'];
```

#### 3. Configurar Tamaño y Posición Explícitamente

```typescript
// ✅ Correcto - configuración explícita para diálogo apilado
const config = {
  panelClass: ['ft-dialog', 'ft-dialog--stacked'],
  height: '100vh',
  width: '600px',
  position: {
    left: 'auto',
    right: '0'
  }
};

// ❌ Incorrecto - configuración por defecto sin especificar
const config = {
  panelClass: ['ft-dialog', 'ft-dialog--stacked']
  // Falta height, width y position
};
```

## Consecuencias

### Positivas

- **Comportamiento consistente:** Todos los diálogos siguen patrones predecibles en toda la aplicación
- **Separación de responsabilidades:** La lógica de navegación está centralizada en manejadores
- **Mejor experiencia de usuario:** Patrones predecibles mejoran la usabilidad
- **Mantenibilidad:** Refactorización y mantenimiento más sencillos
- **Arquitectura coherente:** Evita acoplamiento entre componentes y diálogos

### Negativas

- **Complejidad inicial:** Ligero aumento de complejidad debido a la abstracción por manejadores
- **Menor flexibilidad:** Menos flexibilidad para usos ad-hoc de diálogos fuera del patrón estándar
- **Curva de aprendizaje:** Los desarrolladores necesitan entender el patrón de manejadores

### Mitigación

- Documentación exhaustiva en este ADR
- Ejemplos de código y plantillas
- Proceso de revisión de código para asegurar cumplimiento del patrón
- Guías claras sobre cuándo usar cada tipo de diálogo

## Alternativas Consideradas

### 1. Invocar Diálogos Directamente desde Componentes

**Rechazado** por:

- Alto acoplamiento entre componentes y la implementación de diálogos
- Dificultad para mantener consistencia
- Violación del principio de separación de responsabilidades

### 2. Usar Siempre Rutas para Vistas de Detalle

**Rechazado** por:

- Pérdida del contexto de la pantalla anterior
- Afecta negativamente la experiencia de usuario
- No permite el patrón maestro–detalle de manera fluida

## Notas

Este ADR no define detalles de estilo visual más allá de la clasificación de diálogos. El diseño visual se rige por el sistema de diseño y el theming de Angular Material.

## Referencias

- [Angular Material Dialog](https://material.angular.io/components/dialog/overview)
- [ADR-001: Separación de Responsabilidades - Core, Shared y Features](./ADR-001-separation-of-responsibilities.md)
- [ADR-007: Patrón Manager para Coordinación de Flujos de Negocio](./ADR-007-manager-pattern.md)
