DTO: Note

Description:
Representación de una nota en el sistema, que puede contener respuestas anidadas de otros usuarios.

Fields:

- id: number
- content: string
- createdAt: date
- updatedAt: date
- files: File[]
- createdBy: User
- replies: Note[]

Constraints:

- El contenido es obligatorio
- El usuario creador debe estar definido
- Los archivos asociados son opcionales
- Las respuestas son opcionales y pueden estar anidadas
