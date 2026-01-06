DTO: RecipeDryGoodDTO

Description:
Representación de un bien seco asociado a una receta con su cantidad y costo.

Fields:
- dryGood: DryGoodDTO
- quantity: number
- cost: decimal

Constraints:
- El bien seco debe estar definido
- La cantidad debe ser un número positivo
- El costo debe ser un valor positivo
- Los valores monetarios usan precisión decimal fija