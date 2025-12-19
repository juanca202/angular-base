# FEAT-001 · Contact Manager

Este feature permite gestionar contactos mediante operaciones CRUD y definir relaciones explícitas entre contactos, resolviendo la necesidad de administrar una red básica de personas y sus vínculos.

---

## FR-1. Visión General

El Administrador de Contactos permite a los usuarios crear, visualizar, editar y eliminar contactos. Cada contacto puede tener relaciones con otros contactos, las cuales se gestionan desde la vista de detalle.

El feature está orientado a usuarios que necesitan organizar información de personas y entender cómo se relacionan entre sí dentro del sistema.

---

## FR-2. Alcance

### Incluye

* Listado de contactos
* Creación de contactos
* Edición de contactos
* Eliminación de contactos
* Visualización del detalle de un contacto
* Gestión de relaciones entre contactos

### Excluye

* Importación o exportación de contactos
* Sincronización con servicios externos
* Gestión de permisos o roles

---

## FR-3. Historias de Usuario

### HU-001: Ver listado de contactos

Como usuario, quiero ver un listado de contactos para poder seleccionar uno y consultar su información.

### HU-002: Crear contacto

Como usuario, quiero crear un contacto para registrar su información básica.

### HU-003: Editar contacto

Como usuario, quiero editar un contacto existente para mantener su información actualizada.

### HU-004: Eliminar contacto

Como usuario, quiero eliminar un contacto para remover información que ya no necesito.

### HU-005: Gestionar relaciones

Como usuario, quiero definir relaciones entre contactos para entender cómo están vinculados.

---

## FR-4. Pantallas / Flujos

### Listado de Contactos

* Descripción general: muestra todos los contactos registrados.
* Secciones:

  * Lista de contactos
* Acciones:

  * Crear contacto
  * Ver detalle
  * Editar
  * Eliminar

---

### Detalle de Contacto

* Descripción general: muestra la información completa de un contacto.
* Secciones:

  * Información básica
  * Relaciones
* Acciones:

  * Editar contacto
  * Eliminar contacto
  * Agregar relación

#### Flujo principal

1. El usuario selecciona un contacto desde el listado.
2. El sistema muestra el detalle del contacto.
3. El usuario puede gestionar la información o las relaciones.

---

### Creación / Edición de Contacto

* Descripción general: formulario para crear o editar un contacto.
* Secciones:

  * Información básica
* Acciones:

  * Guardar
  * Cancelar

---

## FR-5. Reglas Funcionales

* Un contacto debe tener nombre y apellido obligatorios.
* Un contacto no puede eliminarse si está siendo usado como contacto relacionado por sí mismo.
* Un contacto no puede relacionarse consigo mismo.
* Las relaciones son direccionales y se crean únicamente desde el detalle del contacto.
* El tipo de relación debe seleccionarse explícitamente.

---

## RT-1. Modelos de Dominio

```ts
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes?: string;
}
```

```ts
export interface ContactRelationship {
  id: string;
  contactId: string;
  relatedContactId: string;
  type: ContactRelationshipType;
}
```

```ts
export type ContactRelationshipType =
  | 'FRIEND'
  | 'FAMILY'
  | 'COLLEAGUE'
  | 'MANAGER'
  | 'DIRECT_REPORT'
  | 'PARTNER'
  | 'CLIENT'
  | 'SUPPLIER';
```

---

## RT-2. Modelos Orientados a UI

```ts
export interface ContactListItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}
```

```ts
export interface ContactRelationshipView {
  id: string;
  relatedContactId: string;
  relatedContactName: string;
  type: ContactRelationshipType;
}
```

---

## RT-3. Contratos de Repositorio

```ts
export interface ContactRepository {
  getAll(): Promise<Contact[]>;
  getById(id: string): Promise<Contact>;
  create(payload: CreateContact): Promise<Contact>;
  update(id: string, payload: UpdateContact): Promise<Contact>;
  delete(id: string): Promise<void>;
}
```

```ts
export interface ContactRelationshipRepository {
  getByContact(contactId: string): Promise<ContactRelationship[]>;
  create(payload: CreateContactRelationship): Promise<ContactRelationship>;
  update(id: string, payload: UpdateContactRelationship): Promise<ContactRelationship>;
  delete(id: string): Promise<void>;
}
```

---

## RT-4. Reglas de Dominio

* Un contacto no puede tener más de una relación con el mismo contacto relacionado.
* No se permiten relaciones circulares consigo mismo.
* La eliminación de un contacto elimina todas sus relaciones salientes.
* Las relaciones no se crean automáticamente en sentido inverso.
