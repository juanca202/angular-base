DTO: RecipeDryGood

Description:
Representación de un material seco asociado a una receta con su cantidad y costo. Los materiales secos incluyen materiales como cintas, papel, alambres, espuma floral, etc.

Fields:

- dryGood: DryGood
- quantity: number
- cost: decimal

Constraints:

- El material seco debe estar definido
- La cantidad debe ser un número positivo
- El costo debe ser un valor positivo
- Los valores monetarios usan precisión decimal fija
