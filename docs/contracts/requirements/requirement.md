DTO: Requirement

Description:
Representación de un SDP (Solicitud de Desarrollo de Producto) en el sistema. Representa una solicitud de desarrollo de un nuevo producto floral, desde su creación hasta su finalización, incluyendo información del cliente solicitante, características del producto requerido, información temporal, clasificaciones y contexto comercial.

Fields:
- id: number
- name: string
- customer: Customer
- divisions: Division[]
- sellByDate: date
- type: ItemCatalog
- salesProbability: ItemCatalog
- salesPriority: ItemCatalog
- description: string
- customerStrategy: ItemCatalog
- entryDate: date
- startDate: date
- dueDate: date
- updatedAt: date
- estimatedDevelopmentTime: number
- remainingTime: number
- status: ItemCatalog
- approvalStatus: ItemCatalog
- requestedBy: User

Constraints:
- El nombre es obligatorio
- El cliente debe estar definido
- Debe tener al menos una división asociada
- La fecha de vencimiento debe ser posterior a la fecha de inicio
- El tiempo estimado de desarrollo debe ser un número positivo
- El tiempo restante debe ser un número no negativo
- El estado y el estado de aprobación deben estar definidos
- El usuario solicitante debe estar definido

API Endpoints:
- GET /requirements/:id - Obtiene un requirement individual por su identificador
- GET /requirements - Obtiene un listado de requirements con parámetros de filtrado y paginación
- GET /requirements/:id/files - Obtiene un listado de archivos asociados a un requirement
- POST /requirements/:id/files - Agrega un archivo a un requirement (request body: File DTO)
