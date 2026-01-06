DTO: RecipeDTO

Description:
Representación de una receta individual en el sistema.

Fields:
- id: number
- category: ItemCatalogDTO
- construction: ItemCatalogDTO
- bouquetType: ItemCatalogDTO
- bouquetLength: number
- bouquetPhotos: FileDTO[]
- flowers: FlowerDTO[]
- seasonCases: SeasonCaseDTO[]
- agreements: AgreementDTO[]
- name: string
- origin: ItemCatalogDTO
- originCase: CaseDTO
- description: string
- waste: decimal
- laborCost: decimal
- createdAt: date
- updatedAt: date

Constraints:
- El nombre es obligatorio
- La categoría, construcción y tipo de ramo deben estar definidos
- La longitud del ramo debe ser un número positivo
- El desperdicio y el costo de mano de obra deben ser valores positivos
- Los valores monetarios usan precisión decimal fija
- Los acuerdos asociados son opcionales