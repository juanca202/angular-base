DTO: Customer

Description:
Representación de un cliente en el sistema. Almacena la información del cliente incluyendo su margen comercial y las divisiones asociadas.

Fields:

- id: number
- name: string
- clientMargin: decimal
- divisions: Division[]

Constraints:

- El nombre es obligatorio
- El margen del cliente debe ser un valor positivo
- Un cliente puede tener múltiples divisiones
