DTO: ItemCatalogDTO

Description:
Representación de un ítem del catálogo en el sistema, utilizado como referencia para categorías, estados, tipos y otros valores enumerados.

Fields:
- id: number
- name: string
- description: string
- createdAt: date
- updatedAt: date

Constraints:
- El nombre es obligatorio
- La descripción es opcional

