DTO: RequirementDTO

Description:
Representación de un SDP (Solictud de Desarrollo de Producto) en el sistema.

Fields:
- id: number
- name: string
- customer: CustomerDTO
- divisions: DivisionDTO[]
- sellByDate: date
- type: ItemCatalogDTO
- salesProbability: ItemCatalogDTO
- salesPriority: ItemCatalogDTO
- description: string
- customerStrategy: ItemCatalogDTO
- entryDate: date
- startDate: date
- dueDate: date
- updatedAt: date
- estimatedDevelopmentTime: number
- remainingTime: number
- status: ItemCatalogDTO
- approvalStatus: ItemCatalogDTO
- requestedBy: UserDTO

Constraints:
- El nombre es obligatorio
- El cliente debe estar definido
- Debe tener al menos una división asociada
- La fecha de vencimiento debe ser posterior a la fecha de inicio
- El tiempo estimado de desarrollo debe ser un número positivo
- El tiempo restante debe ser un número no negativo
- El estado y el estado de aprobación deben estar definidos
- El usuario solicitante debe estar definido

