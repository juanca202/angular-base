DTO: Agreement

Description:
Representación de un acuerdo de negocio en el sistema. Permite aplicar condiciones especiales o modificaciones a los costos y condiciones estándar de productos cotizados, documentando el motivo y los detalles de los cambios.

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

