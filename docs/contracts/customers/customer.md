DTO: Customer

Description:
Representación de un cliente en el sistema.

Fields:
- id: number
- name: string
- clientMargin: decimal
- divisions: Division[]

Constraints:
- El nombre es obligatorio
- El margen del cliente debe ser un valor positivo
- Un cliente puede tener múltiples divisiones

