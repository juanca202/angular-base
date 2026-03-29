# Product catalog — technical reference (US-001)

Cross-cutting technical notes for the product aggregate, mock behavior, and future API alignment. Functional rules remain in [US-001](../user-stories/US-001-gestion-productos/README.md).

## Scope: frontend tasks vs backend

The tasks **TK-001–TK-004** under US-001 are **frontend-only**. They **must not** implement **name normalization** or **domain uniqueness** (name/SKU); those are **backend** responsibilities documented here for **API contract alignment** and future server work. The **mock** may use optional **literal** duplicate checks for UI demos only—it does **not** need to mirror backend normalization.

---

## Entity: Product

| Field         | Type           | Notes                                                                                                                                   |
| ------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `id`          | string         | Stable identifier (UUID in mock).                                                                                                       |
| `code`        | string         | **SKU** (Stock Keeping Unit) — product identifier; required; domain-unique (**backend** enforces). See [glossary (ES)](../glossary.md). |
| `name`        | string         | Required; max 60 chars (**UI** may validate length); domain uniqueness after normalization (**backend**).                               |
| `description` | string \| null | Optional.                                                                                                                               |
| `price`       | number         | Required; ≥ 0; stored and displayed with up to 2 decimal places.                                                                        |
| `currency`    | literal        | Fixed `USD` for current scope; not editable in UI or update payloads.                                                                   |
| `status`      | enum           | `active` \| `inactive` \| `archived`.                                                                                                   |

## Status transitions

- **Create:** default `status` = `active`; `currency` = `USD`.
- **Edit (non-archived):** allowed field updates include `active` ↔ `inactive`; `archived` products do not use the standard edit dialog until `status` is updated out of `archived` (unless a separate decision documents otherwise).
- **Archive:** any non-archived product → `archived`; immediate, no confirmation.
- **Status update from `archived`:** leaving `archived` is a normal **`status` update** to `active` OR `inactive` (explicit choice in UI); there is **no** separate reversal operation or route. Offered from listing only when filter = archived; immediate, no confirmation.
- **Delete:** hard delete from any `status`; requires explicit user confirmation with the copy fixed in the US README.

## Listing and filters (UI labels → internal)

| UI label (es) | Query / filter semantics                              |
| ------------- | ----------------------------------------------------- |
| Todos         | `active` and `inactive` only; **exclude** `archived`. |
| Activo        | `status === active`                                   |
| Inactivo      | `status === inactive`                                 |
| Archivado     | `status === archived`                                 |

Optional **search** (wireframe): filter client- or server-side by substring on SKU field (`code`) and/or `name` (implementation task; default mock may use case-insensitive contains on both).

## Backend: name normalization (uniqueness)

**Not a frontend deliverable** (see [Scope](#scope-frontend-tasks-vs-backend) above). Before comparing two names for duplicate detection on the **server** (create/update), normalize:

1. Trim leading/trailing ASCII whitespace.
2. Collapse internal whitespace runs to a single space between words.
3. Case-insensitive comparison (Unicode case folding on the server).
4. Accent-insensitive comparison (e.g. NFD + strip combining marks, or equivalent locale-aware fold).

Two names are **duplicates** if their normalized forms are equal.

## Backend: SKU uniqueness (`code`)

**Backend** is authoritative for **SKU** uniqueness (payload field commonly named `code`). Optional mock shortcut: literal string equality after trim **only** for local UI testing—not a stand-in for server rules.

## HTTP-oriented contract (future API)

Illustrative resources (adjust to team API standards):

- `GET /products?status=active|inactive|archived|operational` — `operational` means “all non-archived” (`active` + `inactive`) for the **Todos** filter.
- `GET /products/:id`
- `POST /products` — body excludes mutable `currency` or sends `USD` only.
- `PATCH /products/:id` — partial update (includes valid transitions, including `archived` → `active` | `inactive` when rules allow); reject payloads that violate status rules. **Do not** define a separate “leave archived” route; use the same `PATCH` as for other allowed status changes.
- `POST /products/:id/archive`
- `DELETE /products/:id` — hard delete.

## Error model (illustrative)

| Condition                                              | Suggested code / key    | HTTP |
| ------------------------------------------------------ | ----------------------- | ---- |
| Duplicate `name` after normalization                   | `PRODUCT_NAME_CONFLICT` | 409  |
| Duplicate SKU (`code`)                                 | `PRODUCT_SKU_CONFLICT`  | 409  |
| Validation (length, price, required fields)            | `VALIDATION_ERROR`      | 400  |
| Not found                                              | `NOT_FOUND`             | 404  |
| Invalid transition (e.g. edit archived as normal edit) | `INVALID_STATUS`        | 422  |

Client maps these to clear messages (wording in i18n / product copy tasks).

## Mock repository behavior (frontend tasks)

- Persist in-memory collection loaded from JSON seed or empty default.
- Apply the same filter semantics as the table above.
- **Do not** require name normalization or domain uniqueness logic in the mock for TK-001–TK-004; optional **literal** duplicate rejection is allowed for demos.
- Round `price` to 2 decimal places on write (and when displaying, format consistently).

## References

- [ADR-006 Repository pattern](../../adr/ADR-006-repository-pattern.md)
- [ADR-007 Manager pattern](../../adr/ADR-007-manager-pattern.md)
- [US-001 Gestión de productos](../user-stories/US-001-gestion-productos/README.md)
- [Glosario de producto (SKU)](../glossary.md)
