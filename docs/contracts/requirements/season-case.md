DTO: SeasonCase

Description:
Representación de un ramo con combinaciones de colores organizadas por temporada. Define las combinaciones de colores específicas para una temporada determinada.

Fields:

- season: ItemCatalog
- colorCombinations: ColorCombinationGroup[]

Constraints:

- Debe tener al menos una combinación de colores

---

DTO: ColorCombinationGroup

Description:
Representación de un grupo de combinaciones de colores con su cantidad.

Fields:

- colorCombinations: ColorCombination[]
- quantity: number

Constraints:

- Debe tener al menos una combinación de color
- La cantidad debe ser un número positivo

---

DTO: ColorCombination

Description:
Representación de una combinación de color específica para una flor.

Fields:

- flower: Flower
- steamCount: number
- color: ItemCatalog

Constraints:

- La flor debe estar definida
- El conteo de tallos debe ser un número positivo
- El color debe estar definido
