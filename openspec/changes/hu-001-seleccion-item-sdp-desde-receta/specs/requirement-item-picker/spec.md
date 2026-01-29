## ADDED Requirements

### Requirement: Selector de ítems de SDP en pantalla de recetas

El sistema SHALL proporcionar un componente selector que permita a los desarrolladores seleccionar y cambiar entre diferentes ítems de SDP (Solicitud de Desarrollo de Producto) directamente desde la pantalla de recetas, sin necesidad de navegar fuera de esta pantalla.

#### Scenario: Visualizar selector de ítems
- **WHEN** el desarrollador accede a la pantalla de recetas de un SDP
- **THEN** el sistema muestra un componente selector de ítems visible en la interfaz
- **AND** el selector muestra los ítems del SDP actual

#### Scenario: Seleccionar un ítem del SDP
- **WHEN** el desarrollador selecciona un ítem desde el selector
- **THEN** el sistema actualiza la selección del ítem
- **AND** el ítem seleccionado se muestra como activo en el selector
- **AND** la lista de recetas se filtra automáticamente para mostrar solo las recetas asociadas al ítem seleccionado

### Requirement: Visualización de ítems propios y de otros desarrolladores

El sistema SHALL mostrar en el selector los ítems asignados al usuario actual como seleccionables, y los ítems asignados a otros desarrolladores del mismo SDP como elementos informativos de solo lectura.

#### Scenario: Visualizar ítems propios como seleccionables
- **WHEN** el desarrollador visualiza el selector de ítems
- **THEN** el sistema muestra los ítems asignados al usuario actual
- **AND** estos ítems son seleccionables mediante interacción del usuario

#### Scenario: Visualizar ítems de otros desarrolladores como informativos
- **WHEN** el desarrollador visualiza el selector de ítems
- **THEN** el sistema muestra los ítems asignados a otros desarrolladores del mismo SDP
- **AND** estos ítems se muestran con indicación visual de que son informativos
- **AND** estos ítems NO son seleccionables por el usuario actual

### Requirement: Filtrado de ítems por asignación

El sistema SHALL permitir filtrar la visualización de ítems entre "mis ítems" e "ítems de otros desarrolladores", siempre dentro del mismo SDP.

#### Scenario: Filtrar para mostrar solo mis ítems
- **WHEN** el desarrollador selecciona el filtro "mis ítems"
- **THEN** el sistema muestra únicamente los ítems asignados al usuario actual
- **AND** oculta los ítems asignados a otros desarrolladores

#### Scenario: Filtrar para mostrar ítems de otros desarrolladores
- **WHEN** el desarrollador selecciona el filtro "ítems de otros desarrolladores"
- **THEN** el sistema muestra únicamente los ítems asignados a otros desarrolladores
- **AND** oculta los ítems propios del usuario actual

#### Scenario: Mostrar todos los ítems del SDP
- **WHEN** el desarrollador no aplica ningún filtro o selecciona "todos"
- **THEN** el sistema muestra todos los ítems del SDP actual
- **AND** diferencia visualmente entre ítems propios y de otros desarrolladores

### Requirement: Creación rápida de nuevos ítems desde el selector

El sistema SHALL permitir crear nuevos ítems directamente desde el selector, con un nombre genérico prellenado y editable, sin salir de la pantalla de recetas.

#### Scenario: Iniciar creación de nuevo ítem
- **WHEN** el desarrollador selecciona la opción para crear un nuevo ítem desde el selector
- **THEN** el sistema muestra un diálogo o formulario para crear el nuevo ítem
- **AND** el campo de nombre está prellenado con un nombre genérico basado en la cantidad de ítems existentes en el SDP

#### Scenario: Crear ítem con nombre genérico
- **WHEN** el desarrollador crea un nuevo ítem sin modificar el nombre genérico
- **THEN** el sistema crea el ítem con el nombre genérico prellenado
- **AND** el nuevo ítem se crea únicamente dentro del SDP actual
- **AND** el nuevo ítem aparece inmediatamente en el selector como seleccionado

#### Scenario: Crear ítem con nombre personalizado
- **WHEN** el desarrollador modifica el nombre genérico antes de crear el ítem
- **THEN** el sistema crea el ítem con el nombre personalizado ingresado por el desarrollador
- **AND** el nuevo ítem se crea únicamente dentro del SDP actual
- **AND** el nuevo ítem aparece inmediatamente en el selector como seleccionado

#### Scenario: Cancelar creación de ítem
- **WHEN** el desarrollador cancela la creación del nuevo ítem
- **THEN** el sistema cierra el diálogo o formulario sin crear el ítem
- **AND** no se realizan cambios en el SDP

### Requirement: Filtrado automático de recetas por ítem seleccionado

El sistema SHALL filtrar automáticamente la lista de recetas cuando se selecciona un ítem, mostrando únicamente las recetas asociadas al ítem seleccionado.

#### Scenario: Filtrar recetas al seleccionar ítem
- **WHEN** el desarrollador selecciona un ítem desde el selector
- **THEN** el sistema filtra automáticamente la lista de recetas
- **AND** muestra únicamente las recetas asociadas al ítem seleccionado
- **AND** oculta las recetas asociadas a otros ítems del SDP

#### Scenario: Mostrar todas las recetas cuando no hay ítem seleccionado
- **WHEN** no hay ningún ítem seleccionado en el selector
- **THEN** el sistema muestra todas las recetas del SDP actual
- **OR** muestra un mensaje indicando que se debe seleccionar un ítem para ver sus recetas

### Requirement: Persistencia del ítem seleccionado en la URL

El sistema SHALL persistir el ítem seleccionado en la URL como query parameter para permitir deep linking y navegación del navegador (back/forward).

#### Scenario: Persistir ítem seleccionado en URL
- **WHEN** el desarrollador selecciona un ítem desde el selector
- **THEN** el sistema actualiza la URL agregando o modificando el query parameter que identifica el ítem seleccionado
- **AND** la URL refleja el estado actual de selección

#### Scenario: Restaurar ítem seleccionado desde URL
- **WHEN** el desarrollador accede a la pantalla de recetas con un query parameter que identifica un ítem
- **THEN** el sistema restaura automáticamente la selección del ítem indicado en la URL
- **AND** filtra las recetas según el ítem restaurado
- **AND** muestra el ítem como seleccionado en el selector

#### Scenario: Navegación del navegador preserva selección
- **WHEN** el desarrollador usa los botones de navegación del navegador (back/forward)
- **THEN** el sistema restaura el estado de selección del ítem según la URL
- **AND** mantiene el filtrado de recetas correspondiente

### Requirement: Manejo de estados de carga y errores

El sistema SHALL manejar apropiadamente los estados de carga mientras se obtienen los ítems del SDP y los errores que puedan ocurrir durante las operaciones.

#### Scenario: Mostrar estado de carga inicial
- **WHEN** el sistema está cargando los ítems del SDP
- **THEN** el selector muestra un indicador de carga apropiado (skeleton, spinner, o estado vacío)
- **AND** el usuario puede identificar que la información se está cargando

#### Scenario: Manejar error al cargar ítems
- **WHEN** ocurre un error al cargar los ítems del SDP
- **THEN** el sistema muestra un mensaje de error apropiado al usuario
- **AND** proporciona opción para reintentar la carga
- **AND** no bloquea el uso de otras funcionalidades de la pantalla

#### Scenario: Manejar error al crear ítem
- **WHEN** ocurre un error al crear un nuevo ítem
- **THEN** el sistema muestra un mensaje de error apropiado al usuario
- **AND** mantiene el diálogo o formulario abierto para permitir corrección
- **AND** no crea el ítem en el sistema

### Requirement: Sincronización con contexto del SDP

El sistema SHALL mantener la sincronización entre el selector de ítems y el contexto del SDP actual, asegurando que solo se muestren y creen ítems del SDP en el que el usuario está trabajando.

#### Scenario: Mostrar solo ítems del SDP actual
- **WHEN** el desarrollador está trabajando en un SDP específico
- **THEN** el selector muestra únicamente los ítems pertenecientes a ese SDP
- **AND** no muestra ítems de otros SDPs

#### Scenario: Crear ítem en el SDP correcto
- **WHEN** el desarrollador crea un nuevo ítem desde el selector
- **THEN** el sistema asocia el nuevo ítem al SDP actual
- **AND** el ítem creado aparece únicamente en el contexto del SDP actual
- **AND** no se crea el ítem en otros SDPs
