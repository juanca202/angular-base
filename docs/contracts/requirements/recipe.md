DTO: Recipe

Description:
Representación de una receta de arreglo floral en el sistema. Define la composición completa de un arreglo floral incluyendo sus características físicas, clasificaciones comerciales, información logística y componentes (flores y bienes secos).

Fields:

- id: number
- category: ItemCatalog
- construction: ItemCatalog
- bouquetType: ItemCatalog
- bouquetLength: number
- bouquetPhotos: File[]
- flowers: Flower[]
- seasonCases: SeasonCase[]
- agreements: Agreement[]
- name: string
- origin: ItemCatalog
- originCase: Case
- description: string
- waste: decimal
- taxes: Tax
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

---

DTO: Tax

Description:
Representación de un impuesto o tarifa aplicable a una receta en el sistema. Incluye tipos como Tariff, ATPDEA e Intercompany, con valores sugeridos y actuales.

Fields:

- id: number
- name: string
- percentage: TaxPercentage

---

DTO: TaxPercentage

- suggestedValue: number
- currentValue: number

---

API Endpoints:

- GET /recipes/:id/notes - Obtiene un listado de notas asociadas a un recipe
- POST /recipes/:id/notes - Crea una nota asociada a un recipe (request body: Note DTO)
- GET /recipes/:id/flowers - Obtiene un listado de flowers asociados a un recipe
- POST /recipes/:id/flowers - Crea un flower asociado a un recipe (request body: Flower DTO)
- GET /recipes/:id/dry-goods - Obtiene un listado de dry-goods asociados a un recipe
- POST /recipes/:id/dry-goods - Crea un dry-good asociado a un recipe (request body: DryGood DTO)
- GET /recipes/:id/cases - Obtiene un listado de cases asociados a un recipe
- POST /recipes/:id/cases - Crea un case asociado a un recipe (request body: Case DTO)
