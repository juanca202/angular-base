DTO: RecipeGroupDTO

Description:
Representación de un grupo de recetas en el sistema.

Fields:
- id: number
- name: string
- divisions: DivisionDTO[]
- draft: boolean
- enabled: boolean
- tags: ItemCatalogDTO[]
- notes: NoteDTO[]
- recipes: RecipeDTO[]
- description: string
- createdAt: date
- updatedAt: date
- destiny: ItemCatalogDTO
- season: ItemCatalogDTO
- origenCases: CaseDTO[]
- customerCase: CaseDTO

Constraints:
- El nombre es obligatorio
- Debe tener al menos una división asociada
- El estado de borrador y habilitado son independientes
- La lista de recetas puede estar vacía cuando está en borrador
- El caso de origen y el caso del cliente son opcionales