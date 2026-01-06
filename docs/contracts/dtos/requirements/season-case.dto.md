DTO: SeasonCaseDTO

Description:
Representación de un ramo con combinaciones de colores.

Fields:
- season: ItemCatalogDTO
- colorCombinations: ColorCombinationGroupDTO[]

Constraints:
- Debe tener al menos una combinación de colores

---

DTO: ColorCombinationGroupDTO

Description:
Representación de un grupo de combinaciones de colores con su cantidad.

Fields:
- colorCombinations: ColorCombinationDTO[]
- quantity: number

Constraints:
- Debe tener al menos una combinación de color
- La cantidad debe ser un número positivo

---

DTO: ColorCombinationDTO

Description:
Representación de una combinación de color específica para una flor.

Fields:
- flower: FlowerDTO
- steamCount: number
- color: ItemCatalogDTO

Constraints:
- La flor debe estar definida
- El conteo de tallos debe ser un número positivo
- El color debe estar definido

