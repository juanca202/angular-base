DTO: DryGoodDTO

Description:
Representación de un bien seco en el sistema.

Fields:
- id: number
- name: string
- cost: decimal

Constraints:
- El nombre es obligatorio
- El costo debe ser un valor positivo
- Los valores monetarios usan precisión decimal fija

