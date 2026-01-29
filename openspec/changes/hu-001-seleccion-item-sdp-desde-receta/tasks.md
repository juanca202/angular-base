## 1. Setup y Modelos Base

- [ ] 1.1 Crear estructura de directorios para `cross/requirements/` (repositories, models)
- [ ] 1.2 Crear modelo TypeScript `RequirementItem` en `src/app/cross/requirements/models/requirement-item.ts` con propiedades según contrato DTO
- [ ] 1.3 Crear tipos TypeScript relacionados (filtros, estados) en `src/app/cross/requirements/models/`
- [ ] 1.4 Crear estructura de directorios para `features/recipes/components/requirement-item-picker/`
- [ ] 1.5 Crear estructura de directorios para `features/recipes/managers/`

## 2. Repository con Mock

- [ ] 2.1 Crear `RequirementItemRepository` en `src/app/cross/requirements/repositories/requirement-item-repository.ts` extendiendo `BaseRepository`
- [ ] 2.2 Implementar método `getByRequirementId(requirementId: string)` con datos mock que retorne lista de ítems
- [ ] 2.3 Implementar método `create(data: Partial<RequirementItem>)` con mock que simule creación
- [ ] 2.4 Implementar método `getById(id: string)` con mock para obtener ítem individual
- [ ] 2.5 Agregar manejo de errores y estados de carga en el repository
- [ ] 2.6 Crear tests unitarios para `RequirementItemRepository` con mocks

## 3. Componente RequirementItemPicker - Estructura Base

- [ ] 3.1 Crear componente `RequirementItemPicker` en `src/app/features/recipes/components/requirement-item-picker/requirement-item-picker.ts`
- [ ] 3.2 Configurar componente como standalone con `ChangeDetectionStrategy.OnPush`
- [ ] 3.3 Agregar imports necesarios (CommonModule, MatSelectModule, RouterModule, etc.)
- [ ] 3.4 Crear template HTML básico con estructura del selector
- [ ] 3.5 Crear estilos CSS básicos usando Tailwind CSS
- [ ] 3.6 Inyectar `RequirementItemRepository` y `ActivatedRoute` en el componente

## 4. Componente RequirementItemPicker - Lógica de Selección

- [ ] 4.1 Crear signal `selectedItemId` para mantener el ítem seleccionado
- [ ] 4.2 Crear signal `items` para almacenar lista de ítems del SDP
- [ ] 4.3 Crear signal `loading` para estado de carga
- [ ] 4.4 Implementar método `loadItems(requirementId: string)` que llame al repository
- [ ] 4.5 Implementar método `selectItem(itemId: string)` que actualice el signal y emita evento
- [ ] 4.6 Implementar `ngOnInit` para cargar ítems al inicializar el componente
- [ ] 4.7 Crear computed signal `filteredItems` basado en filtro seleccionado

## 5. Componente RequirementItemPicker - Filtrado

- [ ] 5.1 Crear signal `filter` con valores: 'all' | 'mine' | 'others'
- [ ] 5.2 Implementar lógica de filtrado que separe ítems propios de otros desarrolladores
- [ ] 5.3 Agregar controles UI (botones o select) para cambiar filtro en el template
- [ ] 5.4 Implementar indicación visual diferenciada entre ítems propios y de otros desarrolladores
- [ ] 5.5 Deshabilitar selección de ítems asignados a otros desarrolladores

## 6. Integración con Query Parameters

- [ ] 6.1 Usar `toSignal()` de `@angular/core/rxjs-interop` para convertir `queryParams` a signal
- [ ] 6.2 Implementar lectura del query parameter `itemId` desde la URL al inicializar
- [ ] 6.3 Implementar actualización de URL cuando cambia `selectedItemId` usando `Router.navigate()`
- [ ] 6.4 Crear `effect()` para sincronizar cambios de `selectedItemId` con query parameters
- [ ] 6.5 Manejar casos donde el ítem en la URL no existe o no es válido

## 7. Integración con Componente de Lista de Recetas

- [ ] 7.1 Identificar componente existente de lista de recetas
- [ ] 7.2 Agregar `RequirementItemPicker` al template del componente de lista de recetas
- [ ] 7.3 Crear signal `selectedItemId` en componente de lista de recetas
- [ ] 7.4 Implementar `@Output()` en `RequirementItemPicker` para emitir cambios de selección
- [ ] 7.5 Conectar output del picker con signal del componente de lista
- [ ] 7.6 Implementar filtrado de recetas basado en `selectedItemId` en componente de lista

## 8. Manager para Creación de Ítems

- [ ] 8.1 Crear `RequirementItemManager` en `src/app/features/recipes/managers/requirement-item-manager.ts`
- [ ] 8.2 Inyectar `RequirementItemRepository` y `MatDialog` en el manager
- [ ] 8.3 Implementar método `generateGenericName(itemCount: number)` que retorne formato "Item {número}"
- [ ] 8.4 Implementar método `openCreateDialog(requirementId: string)` que abra diálogo de creación
- [ ] 8.5 Implementar lógica de creación que llame al repository y maneje respuesta
- [ ] 8.6 Implementar manejo de errores en el manager con mensajes apropiados

## 9. Diálogo de Creación de Ítems

- [ ] 9.1 Crear componente `RequirementItemCreateDialog` en `src/app/features/recipes/components/requirement-item-create-dialog/`
- [ ] 9.2 Configurar como componente standalone con formulario reactivo
- [ ] 9.3 Agregar campo de texto para nombre con valor inicial genérico prellenado
- [ ] 9.4 Implementar validación del formulario (nombre requerido, longitud mínima)
- [ ] 9.5 Agregar botones "Crear" y "Cancelar" en el diálogo
- [ ] 9.6 Implementar lógica de submit que llame al manager y cierre el diálogo
- [ ] 9.7 Agregar indicadores de carga durante la creación

## 10. Integración de Creación con Selector

- [ ] 10.1 Agregar botón "Crear nuevo ítem" en `RequirementItemPicker`
- [ ] 10.2 Conectar botón con método del manager para abrir diálogo
- [ ] 10.3 Implementar actualización de lista de ítems después de creación exitosa
- [ ] 10.4 Implementar selección automática del nuevo ítem creado
- [ ] 10.5 Actualizar URL con el nuevo ítem seleccionado

## 11. Estados de Carga y Errores

- [ ] 11.1 Implementar skeleton loader o spinner en `RequirementItemPicker` durante carga inicial
- [ ] 11.2 Agregar mensaje de error cuando falla la carga de ítems
- [ ] 11.3 Implementar botón de reintento cuando hay error de carga
- [ ] 11.4 Agregar manejo de errores en diálogo de creación con mensajes claros
- [ ] 11.5 Implementar estados de carga durante creación de ítem

## 12. Testing

- [ ] 12.1 Crear tests unitarios para `RequirementItemPicker` componente
- [ ] 12.2 Crear tests unitarios para `RequirementItemManager`
- [ ] 12.3 Crear tests unitarios para `RequirementItemCreateDialog`
- [ ] 12.4 Crear tests de integración para flujo completo de selección y creación
- [ ] 12.5 Crear tests para sincronización con query parameters
- [ ] 12.6 Verificar accesibilidad del componente (ARIA labels, navegación por teclado)

## 13. Integración con APIs Reales (Cuando estén disponibles)

- [ ] 13.1 Actualizar `RequirementItemRepository.getByRequirementId()` para usar endpoint real `GET /requirement-items?requirementId={id}`
- [ ] 13.2 Actualizar `RequirementItemRepository.create()` para usar endpoint real `POST /requirement-items`
- [ ] 13.3 Actualizar `RequirementItemRepository.getById()` para usar endpoint real `GET /requirement-items/:id`
- [ ] 13.4 Actualizar manejo de errores para trabajar con respuestas reales de API
- [ ] 13.5 Probar integración completa con backend real
- [ ] 13.6 Verificar que el filtrado de recetas use endpoint `GET /requirement-items/:id/recipes` si es necesario

## 14. Refinamiento y Optimización

- [ ] 14.1 Optimizar renderizado del selector si hay muchos ítems (virtual scrolling si es necesario)
- [ ] 14.2 Mejorar indicadores visuales de ítems seleccionados vs no seleccionados
- [ ] 14.3 Agregar animaciones suaves para transiciones de selección
- [ ] 14.4 Verificar y mejorar accesibilidad (focus management, ARIA)
- [ ] 14.5 Optimizar actualizaciones de URL para evitar navegaciones innecesarias
- [ ] 14.6 Revisar y optimizar performance del componente
