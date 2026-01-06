DTO: RequirementItemDTO

Description:
Representación de un requerimiento de desarrollo en el sistema.

Fields:
- id: number
- name: string
- status: ItemCatalogDTO
- category: ItemCatalogDTO
- recipesCount: number
- clientMargin: decimal
- retailMaxPrice: decimal
- retailMinPrice: decimal
- quantityPerWeek: number
- season: ItemCatalogDTO
- isWet: boolean
- tags: ItemCatalogDTO[]
- specialInstructions: NoteDTO[]
- createdAt: date
- updatedAt: date
- assignedTo: UserDTO

Constraints:
- El nombre es obligatorio
- El estado y la categoría deben estar definidos
- El precio máximo debe ser mayor o igual al precio mínimo
- Los valores monetarios usan precisión decimal fija
- La cantidad por semana debe ser un número positivo
- Las instrucciones especiales son opcionales

