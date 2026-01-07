DTO: ItemCatalog

Description:
Representación de un ítem del catálogo en el sistema, utilizado como referencia para categorías, estados, tipos y otros valores enumerados.

Fields:
- id: number
- name: string
- description: string
- groupId: string
- createdAt: date
- updatedAt: date

Constraints:
- El nombre es obligatorio
- La descripción es opcional
- El groupId es opcional y se utiliza para agrupar items relacionados

API Endpoints:
- GET /item-catalogs?groupId=:id - Obtiene un listado de item-catalogs filtrados por el identificador del grupo
