DTO: Flower

Description:
Representación de una flor en el sistema.

Fields:
- id: number
- photo: File
- name: string
- color: ItemCatalog
- steamCost: decimal
- subSteamCount: number

Constraints:
- El nombre es obligatorio
- El costo por tallo debe ser un valor positivo
- El conteo sugerido de tallos debe ser un número positivo
- Los valores monetarios usan precisión decimal fija

