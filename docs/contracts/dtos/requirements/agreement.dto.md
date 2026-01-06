DTO: AgreementDTO

Description:
Representación de un acuerdo o autorización en el sistema.

Fields:
- id: number
- user: UserDTO
- authorizationResponsibles: UserDTO[]
- agreementType: ItemCatalogDTO
- description: string
- reason: string
- files: FileDTO[]
- createdAt: date
- updatedAt: date

Constraints:
- El usuario debe estar definido
- Debe tener al menos un responsable de autorización
- Los archivos asociados son opcionales

