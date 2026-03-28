# Glosario de producto

Términos usados en historias de usuario, tareas y documentación funcional.

## SKU (Stock Keeping Unit)

**SKU** es la sigla en inglés de **_Stock Keeping Unit_** (unidad de mantenimiento de existencias). En catálogo e inventario designa el **identificador de un artículo** que permite distinguir de forma **única** cada variante comercial o logística (presentación, formato, etc.) para fines de **stock**, **venta** y **seguimiento** en sistemas operativos.

En las historias y pantallas de este producto, el **SKU** es el dato obligatorio y único en dominio que cumple el rol del antiguo «código de producto»: debe aparecer en **alta**, **edición**, **listado** y **detalle** con la etiqueta **SKU**. La **validación definitiva de unicidad** y cualquier **normalización** asociada son responsabilidad del **backend**.

En contratos técnicos, APIs y modelos el atributo puede seguir llamándose `code` según acuerdo del equipo; a nivel funcional se trata del **mismo concepto** que el SKU descrito aquí.

---

| Enlace rápido                                                                    | Uso                                      |
| -------------------------------------------------------------------------------- | ---------------------------------------- |
| [US-001 — Gestión de productos](user-stories/US-001-gestion-productos/README.md) | Historia de catálogo donde aplica el SKU |
