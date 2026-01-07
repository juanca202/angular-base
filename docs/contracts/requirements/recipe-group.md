DTO: RecipeGroup

Description:
Representación de un grupo de recetas en el sistema.

Fields:
- id: number
- name: string
- divisions: Division[]
- draft: boolean
- enabled: boolean
- tags: ItemCatalog[]
- notes: Note[]
- recipes: Recipe[]
- description: string
- createdAt: date
- updatedAt: date
- destiny: ItemCatalog
- season: ItemCatalog
- origenCases: Case[]
- customerCase: Case
- requirementItem: RequirementItem

Constraints:
- El nombre es obligatorio
- Debe tener al menos una división asociada
- El estado de borrador y habilitado son independientes
- La lista de recetas puede estar vacía cuando está en borrador
- El caso de origen y el caso del cliente son opcionales
- El requirement-item asociado es opcional

API Endpoints:
- GET /recipe-groups?requirementItemId=:id - Obtiene un listado de recipe-groups filtrados por el identificador del requirement-item
- POST /recipe-groups - Crea un nuevo recipe-group (request body: RecipeGroup DTO)
- POST /recipe-groups/:id/recipes - Crea un recipe asociado a un recipe-group (request body: Recipe DTO)
- PUT /recipe-groups/:id/recipes/:recipeId - Mueve un recipe existente a este recipe-group (cambia la relación del recipe)
