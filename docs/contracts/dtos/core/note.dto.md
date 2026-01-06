DTO: NoteDTO

Description:
Representación de una nota en el sistema, que puede contener respuestas anidadas.

Fields:
- id: number
- content: string
- createdAt: date
- updatedAt: date
- files: FileDTO[]
- createdBy: UserDTO
- replies: NoteDTO[]

Constraints:
- El contenido es obligatorio
- El usuario creador debe estar definido
- Los archivos asociados son opcionales
- Las respuestas son opcionales y pueden estar anidadas

