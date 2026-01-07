DTO: RecipeFlower

Description:
Representación de una flor asociada a una receta con su cantidad y sustitutos.

Fields:
- flower: Flower
- substitutes: Flower
- stemCount: number
- subSteamCount: number
- steamCost: decimal

Constraints:
- La flor principal debe estar definida
- El conteo de tallos debe ser un número positivo
- El conteo asignado de tallos sustitutos debe ser un número positivo
- El costo por tallo debe ser un valor positivo
- Los valores monetarios usan precisión decimal fija

