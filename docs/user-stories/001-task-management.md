Administración de Tareas

### Como
Usuario autenticado de la aplicación

### Quiero
Administrar mis tareas mediante un listado organizado por estados, con selección múltiple y acciones masivas

### Para
Poder visualizar, organizar y gestionar mis tareas de forma clara y eficiente

---

## Descripción

El usuario puede visualizar un listado de tareas dividido en tres estados (pendientes, congeladas y completadas), agregar nuevas tareas y realizar acciones masivas (completar o eliminar) sobre una o varias tareas seleccionadas, siguiendo los wireframes definidos.

---

## Criterios de Aceptación

### Visualización de tareas
- Dado que el usuario accede a la pantalla de tareas  
  Cuando el sistema carga la información  
  Entonces debe mostrar un listado de tareas segmentado por estado:
  - pending
  - frozen
  - completed

- Cada tarea debe mostrar:
  - El título de la tarea
  - Información temporal (tiempo restante o tiempo vencido)
  - El tiempo vencido debe resaltarse visualmente (por ejemplo, en color rojo)

- El diseño del listado debe seguir los wireframes:
  - @docs/wireframes/tasks-list.png

---

### Creación de tareas
- Dado que el usuario está en la pantalla de tareas  
  Cuando selecciona la acción de agregar tarea  
  Entonces el sistema debe permitir crear una nueva tarea

---

### Selección de tareas
- Dado que el usuario visualiza el listado de tareas  
  Cuando selecciona una o más tareas  
  Entonces el listado debe entrar en modo selección

- En modo selección:
  - La barra de acciones debe cambiar y mostrar solo acciones relacionadas con la selección
  - El diseño debe seguir:
    - @docs/wireframes/tasks-list-selection.png

---

### Acciones masivas
- Dado que el usuario tiene una o más tareas seleccionadas  
  Cuando ejecuta la acción “Completar”  
  Entonces todas las tareas seleccionadas deben marcarse como completadas

- Dado que el usuario tiene una o más tareas seleccionadas  
  Cuando ejecuta la acción “Eliminar”  
  Entonces todas las tareas seleccionadas deben eliminarse

---

### Persistencia
- Dado que el sistema requiere obtener las tareas  
  Cuando se realiza la carga de datos  
  Entonces se debe consumir el endpoint:
  - GET /tasks

- Mientras el backend real no exista:
  - Se deben utilizar mocks para simular el comportamiento del API
  - El contrato de datos está definido en:
    - @docs/contracts/task.md

---

### Autenticación
- Dado que el usuario ya está autenticado  
  Entonces todas las peticiones al API se realizan en un contexto autenticado
- No se debe implementar lógica adicional de autenticación ni autorización

---

### Ordenamiento y filtrado
- Dado que el usuario solicita tareas  
  Cuando el cliente envía la petición  
  Entonces debe incluir los parámetros opcionales:
  - sort
  - order (asc | desc)

- El frontend:
  - No debe aplicar ordenamiento local
  - No debe aplicar filtrado local
- En ausencia de parámetros, el servidor aplica el ordenamiento por defecto

---

## Fuera de Alcance
- Subtareas
- Prioridades
- Recordatorios
- Etiquetas avanzadas
- Sincronización externa

---

## Notas Técnicas
- El acceso a datos debe encapsularse en una capa de servicio
- La implementación debe facilitar la futura integración con el backend real