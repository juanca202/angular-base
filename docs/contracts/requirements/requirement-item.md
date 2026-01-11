DTO: RequirementItem

Description:
Representación de un requerimiento específico de desarrollo de producto (también conocido como "Item Index") asociado a una solicitud de desarrollo de producto (SDP). Representa los productos individuales que se desarrollan dentro de una solicitud, cada uno con sus propias características y especificaciones.

Fields:
- id: number
- name: string
- status: ItemCatalog
- category: ItemCatalog
- recipesCount: number
- clientMargin: decimal
- retailMaxPrice: decimal
- retailMinPrice: decimal
- quantityPerWeek: number
- season: ItemCatalog
- isWet: boolean
- tags: ItemCatalog[]
- specialInstructions: Note[]
- createdAt: date
- updatedAt: date
- assignedTo: User

Constraints:
- El nombre es obligatorio
- El estado y la categoría deben estar definidos
- El precio máximo debe ser mayor o igual al precio mínimo
- Los valores monetarios usan precisión decimal fija
- La cantidad por semana debe ser un número positivo
- Las instrucciones especiales son opcionales

API Endpoints:
- GET /requirement-items/:id - Obtiene un requirement-item individual por su identificador
- GET /requirement-items - Obtiene un listado de requirement-items con parámetros de filtrado y paginación
- GET /requirement-items/:id/files - Obtiene un listado de archivos asociados a un requirement-item
- POST /requirement-items/:id/files - Agrega un archivo a un requirement-item (request body: File DTO)
- GET /requirement-items/:id/recipes - Obtiene un listado de recipes asociados a un requirement-item
- POST /requirement-items/:id/recipes - Agrega un recipe a un requirement-item (request body: Recipe DTO)
