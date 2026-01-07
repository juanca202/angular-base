DTO: DryGood

Description:
Representación de un material seco del catálogo maestro en el sistema. Almacena la información completa de cada tipo de material seco utilizado en la producción de arreglos florales, como cintas, papel, alambres, espuma floral, etc.

Fields:
- id: number
- name: string
- cost: decimal

Constraints:
- El nombre es obligatorio
- El costo debe ser un valor positivo
- Los valores monetarios usan precisión decimal fija

