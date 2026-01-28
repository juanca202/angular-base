DTO: Case

Description:
Representación de una caja del catálogo maestro utilizado para empaque y transporte de productos florales. Almacena información completa de cada tipo de caja incluyendo dimensiones, peso, capacidad, información logística y comercial. Sus propiedades también permiten calcular costos de empaque, logística y transporte.

Fields:

- id: number
- name: string
- description: string
- createdAt: date
- updatedAt: date

Constraints:

- El nombre es obligatorio
- La descripción es opcional
