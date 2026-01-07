DTO: Agreement

Description:
Representación de un acuerdo o autorización en el sistema.

Fields:
- id: number
- user: User
- authorizationResponsibles: User[]
- agreementType: ItemCatalog
- description: string
- reason: string
- files: File[]
- createdAt: date
- updatedAt: date

Constraints:
- El usuario debe estar definido
- Debe tener al menos un responsable de autorización
- Los archivos asociados son opcionales

