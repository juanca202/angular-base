DTO: CustomerDTO

Description:
Representación de un cliente en el sistema.

Fields:
- id: number
- name: string
- clientMargin: decimal
- divisions: DivisionDTO[]

Constraints:
- El nombre es obligatorio
- El margen del cliente debe ser un valor positivo
- Un cliente puede tener múltiples divisiones

