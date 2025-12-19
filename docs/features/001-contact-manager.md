# FEAT-001 · Administrador de Contactos

## FR-1. Visión General

El feature **Administrador de Contactos** provee capacidades completas de CRUD (Crear, Leer, Actualizar, Eliminar) para la gestión de contactos. Adicionalmente a la información básica de cada contacto, el feature incluye una sección de **Relaciones** en la vista de detalle, que permite asociar contactos entre sí utilizando tipos de relación predefinidos.

---

## FR-2. Alcance

### Incluye

* Vista de listado de contactos
* Vista de detalle de contacto
* Crear contacto
* Editar contacto
* Eliminar contacto
* Gestión de relaciones entre contactos
* Modelos de datos mock para desarrollo y pruebas

### Excluye

* Autenticación / autorización
* Integraciones externas
* Funcionalidad de importación / exportación

---

## FR-3. Historias de Usuario

### HU-001: Ver contactos

Como usuario, quiero ver un listado de todos los contactos para poder explorarlos y seleccionar uno fácilmente.

### HU-002: Crear un contacto

Como usuario, quiero crear un nuevo contacto para poder almacenar su información.

### HU-003: Editar un contacto

Como usuario, quiero editar un contacto existente para mantener su información actualizada.

### HU-004: Eliminar un contacto

Como usuario, quiero eliminar un contacto para remover información obsoleta o incorrecta.

### HU-005: Gestionar relaciones entre contactos

Como usuario, quiero definir relaciones entre contactos para entender cómo están conectados entre sí.

---

## FR-4. Pantallas

### 4.1 Listado de Contactos

* Muestra una lista o tabla de contactos
* Columnas:

  * Nombre completo
  * Correo electrónico
  * Teléfono
* Acciones por fila:

  * Ver detalle
  * Editar
  * Eliminar
* Acción principal:

  * Crear contacto

---

### 4.2 Detalle de Contacto

Secciones:

#### 4.2.1 Información Básica

* Nombre
* Apellido
* Correo electrónico
* Teléfono
* Notas (opcional)

#### 4.2.2 Relaciones

* Muestra un listado de contactos relacionados

* Cada relación incluye:

  * Contacto relacionado (nombre visible)
  * Tipo de relación (editable mediante combobox)
  * Acción para eliminar la relación

* Acción principal:

  * Agregar relación

##### Flujo para agregar una relación

1. El usuario hace clic en **Agregar relación**
2. Se abre un **contact-picker**
3. El usuario selecciona otro contacto
4. El contacto seleccionado se agrega al listado de relaciones
5. El usuario selecciona el tipo de relación desde un combobox

---

## FR-5. Tipos de Relación

Los siguientes tipos de relación están disponibles:

* FRIEND
* FAMILY
* COLLEAGUE
* MANAGER
* DIRECT_REPORT
* PARTNER
* CLIENT
* SUPPLIER
* EMERGENCY_CONTACT

Los tipos de relación son **direccionales** (desde el contacto actual hacia el contacto relacionado). Las relaciones **no son bidireccionales automáticamente** y deben gestionarse explícitamente por el usuario si se requiere la relación inversa.

---

## RT-1. Modelos de Entidades

### 6.1 Contacto

```ts
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes?: string;
  createdAt: string; // fecha ISO
  updatedAt: string; // fecha ISO
}
```

---

### 6.2 Relación de Contacto

```ts
export interface ContactRelationship {
  id: string;
  contactId: string; // contacto propietario
  relatedContactId: string; // contacto relacionado
  type: ContactRelationshipType;
}
```

---

### 6.3 Tipo de Relación de Contacto

```ts
export type ContactRelationshipType =
  | 'FRIEND'
  | 'FAMILY'
  | 'COLLEAGUE'
  | 'MANAGER'
  | 'DIRECT_REPORT'
  | 'PARTNER'
  | 'CLIENT'
  | 'SUPPLIER'
  | 'EMERGENCY_CONTACT';
```

---

## RT-2. Modelos de Vista (Orientados a UI)

### 7.1 Item de Listado de Contacto

```ts
export interface ContactListItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}
````

---

### 7.2 Vista de Relación de Contacto

```ts
export interface ContactRelationshipView {
  id: string;
  relatedContactId: string;
  relatedContactName: string;
  type: ContactRelationshipType;
}
```

---

## RT-4. Reglas de Validación

* Nombre: obligatorio
* Apellido: obligatorio
* Correo electrónico: obligatorio, formato válido
* Teléfono: obligatorio
* Un contacto no puede relacionarse consigo mismo
* Un contacto no puede tener relaciones duplicadas con el mismo contacto relacionado

---
