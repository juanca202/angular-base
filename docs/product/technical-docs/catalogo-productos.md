# Product catalog — technical reference (US-001)

Cross-cutting technical notes for the product aggregate, mock behavior, and future API alignment. Functional rules remain in [US-001](../US-001-gestion-productos/README.md).

## Entity: Product

| Field         | Type           | Notes                                                                 |
| ------------- | -------------- | --------------------------------------------------------------------- |
| `id`          | string         | Stable identifier (UUID in mock).                                     |
| `code`        | string         | Required; domain-unique (server is authoritative).                    |
| `name`        | string         | Required; max 60 chars; domain-unique after normalization.            |
| `description` | string \| null | Optional.                                                             |
| `price`       | number         | Required; ≥ 0; stored and displayed with up to 2 decimal places.      |
| `currency`    | literal        | Fixed `USD` for current scope; not editable in UI or update payloads. |
| `status`      | enum           | `active` \| `inactive` \| `archived`.                                 |

## Status transitions

- **Create:** default `status` = `active`; `currency` = `USD`.
- **Edit (non-archived):** allowed field updates include `active` ↔ `inactive`; `archived` products do not use the standard edit flow until unarchived (unless a separate decision documents otherwise).
- **Archive:** any non-archived product → `archived`; immediate, no confirmation.
- **Unarchive:** only from listing when filter = archived; `archived` → `active` OR `inactive` (explicit choice); immediate, no confirmation.
- **Delete:** hard delete from any `status`; requires explicit user confirmation with the copy fixed in the US README.

## Listing and filters (UI labels → internal)

| UI label (es) | Query / filter semantics                              |
| ------------- | ----------------------------------------------------- |
| Todos         | `active` and `inactive` only; **exclude** `archived`. |
| Activo        | `status === active`                                   |
| Inactivo      | `status === inactive`                                 |
| Archivado     | `status === archived`                                 |

Optional **search** (wireframe): filter client- or server-side by substring on `code` and/or `name` (implementation task; default mock may use case-insensitive contains on both).

## Name normalization (uniqueness)

Before comparing two names for duplicate detection (create/update), normalize:

1. Trim leading/trailing ASCII whitespace.
2. Collapse internal whitespace runs to a single space between words.
3. Case-insensitive comparison (Unicode case folding enabled when backend exists; mock should mirror intent).
4. Accent-insensitive comparison (e.g. NFD + strip combining marks, or equivalent locale-aware fold).

Two names are **duplicates** if their normalized forms are equal.

## Code uniqueness

Mock: string equality after optional trim (agreed with product). Backend: authoritative; extend with normalization in `technical-docs` / API contract if product adds rules.

## HTTP-oriented contract (future API)

Illustrative resources (adjust to team API standards):

- `GET /products?status=active|inactive|archived|operational` — `operational` means “all non-archived” (`active` + `inactive`) for the **Todos** filter.
- `GET /products/:id`
- `POST /products` — body excludes mutable `currency` or sends `USD` only.
- `PATCH /products/:id` — partial update; reject edits that violate status rules.
- `POST /products/:id/archive`
- `POST /products/:id/unarchive` — body: `{ "status": "active" | "inactive" }`
- `DELETE /products/:id` — hard delete.

## Error model (illustrative)

| Condition                                              | Suggested code / key    | HTTP |
| ------------------------------------------------------ | ----------------------- | ---- |
| Duplicate `name` after normalization                   | `PRODUCT_NAME_CONFLICT` | 409  |
| Duplicate `code`                                       | `PRODUCT_CODE_CONFLICT` | 409  |
| Validation (length, price, required fields)            | `VALIDATION_ERROR`      | 400  |
| Not found                                              | `NOT_FOUND`             | 404  |
| Invalid transition (e.g. edit archived as normal edit) | `INVALID_STATUS`        | 422  |

Client maps these to clear messages (wording in i18n / product copy tasks).

## Mock repository behavior

- Persist in-memory collection loaded from JSON seed or empty default.
- Apply the same filter semantics as the table above.
- On create/update, run name normalization + uniqueness and code uniqueness before persisting.
- Round `price` to 2 decimal places on write (and when displaying, format consistently).

## References

- [ADR-006 Repository pattern](../../adr/ADR-006-repository-pattern.md)
- [ADR-007 Manager pattern](../../adr/ADR-007-manager-pattern.md)
- [US-001 Gestión de productos](../US-001-gestion-productos/README.md)
